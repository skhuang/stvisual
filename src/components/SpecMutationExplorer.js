import { t } from '../i18n/index.js';
import {
  parsePredicate,
  generateSpecMutants,
  evaluateSpecMutants,
  buildAssignmentSpace,
  astToString,
  SPEC_MUTATION_OPERATORS,
} from '../utils/specMutation.js';
import { renderMonitorSvg, flippedKeysFromKillers } from '../utils/specFsm.js';

const STORAGE_KEY = 'stvisual.specMutation.v1';
const DEFAULT_PREDICATE = '(a || b) && c';
const DEFAULT_OPS = ['ENF', 'BCR', 'LRO', 'UOI'];

const SPEC_CATEGORIES = [
  { id: 'basic', labelKey: 'spec.cat.basic' },
  { id: 'smv',   labelKey: 'spec.cat.smv' },
];
const DEFAULT_CATEGORY = 'basic';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const SPEC_EXAMPLES = [
  {
    id: 'guard',
    name: 'Guard',
    category: 'basic',
    text: '(a || b) && c',
    description: 'Generic Boolean guard for an action.',
  },
  {
    id: 'leap',
    name: 'Leap year',
    category: 'basic',
    text: '(y && !c) || (y && c && q)',
    description: 'Leap-year predicate: divisible by 4 (y) and (not by 100 (c) or by 400 (q)).',
  },
  {
    id: 'triangle',
    name: 'Triangle ineq.',
    category: 'basic',
    text: 'a && b && c',
    description: 'All three triangle-inequality clauses must hold.',
  },
  // --- SMV / model-checking style invariants (Ammann/Offutt §9.5) ---
  {
    id: 'smv-mutex',
    name: 'Mutual exclusion',
    category: 'smv',
    text: '!(c1 && c2)',
    description: 'Two-process mutual exclusion invariant: never both critical.',
    smv: `MODULE proc(other_critical, turn, id)
VAR
  state : { idle, trying, critical };
ASSIGN
  init(state) := idle;
  next(state) :=
    case
      state = idle                                : { idle, trying };
      state = trying & !other_critical & turn=id : critical;
      state = trying                              : trying;
      state = critical                            : { critical, idle };
      TRUE                                        : state;
    esac;

MODULE main
VAR
  turn : { 1, 2 };
  p1   : proc(p2.state = critical, turn, 1);
  p2   : proc(p1.state = critical, turn, 2);
DEFINE
  c1 := p1.state = critical;
  c2 := p2.state = critical;

-- Safety: never both processes in the critical section
INVARSPEC !(c1 & c2)`,
  },
  {
    id: 'smv-cruise',
    name: 'Cruise control',
    category: 'smv',
    text: '!cruise || (ignition && running && !brake)',
    description: 'Cruise control safety: cruise active implies ignition on, engine running, brake released.',
    smv: `MODULE main
VAR
  ignition : boolean;
  running  : boolean;
  brake    : boolean;
  cruise   : boolean;
ASSIGN
  init(ignition) := FALSE;
  init(running)  := FALSE;
  init(brake)    := FALSE;
  init(cruise)   := FALSE;

  -- Driver may toggle ignition / brake non-deterministically.
  next(ignition) := { TRUE, FALSE };
  next(brake)    := { TRUE, FALSE };
  -- Engine runs only while ignition is on.
  next(running)  := ignition;
  -- Cruise can only be engaged when ignition is on, engine is running and
  -- the brake is released; pressing brake disengages cruise.
  next(cruise) :=
    case
      brake          : FALSE;
      !ignition      : FALSE;
      !running       : FALSE;
      TRUE           : { TRUE, FALSE };
    esac;

-- Safety: cruise active implies ignition on, engine running, brake released
INVARSPEC !cruise | (ignition & running & !brake)`,
  },
  {
    id: 'smv-sis',
    name: 'Safety injection',
    category: 'smv',
    text: '(si && pressure && !override) || (!si && (!pressure || override))',
    description: 'Safety Injection System (Parnas/Heimdahl): SI on iff pressure low and not overridden.',
    smv: `MODULE main
VAR
  pressure : boolean;   -- TRUE when reactor pressure is BELOW threshold
  override : boolean;   -- operator override switch
  si       : boolean;   -- safety injection actuator
ASSIGN
  init(pressure) := FALSE;
  init(override) := FALSE;
  init(si)       := FALSE;

  next(pressure) := { TRUE, FALSE };
  next(override) := { TRUE, FALSE };
  -- SI must turn on iff pressure is below threshold AND not overridden.
  next(si) := pressure & !override;

-- Functional spec: SI on  <-> (pressure low AND not overridden)
INVARSPEC (si & pressure & !override) | (!si & (!pressure | override))`,
  },
  {
    id: 'smv-train',
    name: 'Train-gate',
    category: 'smv',
    text: '!train || (gate && signal)',
    description: 'Train-Gate-Controller invariant: when a train is at the crossing, gate is down and signal is red.',
    smv: `MODULE main
VAR
  train  : boolean;   -- train present at crossing
  gate   : boolean;   -- gate down
  signal : boolean;   -- signal red (stop)
ASSIGN
  init(train)  := FALSE;
  init(gate)   := FALSE;
  init(signal) := FALSE;

  -- Train arrives / departs non-deterministically.
  next(train) := { TRUE, FALSE };
  -- Controller lowers gate and turns red signal whenever a train is present
  -- (and may keep them set briefly after the train leaves).
  next(gate)   := train | gate & next(train);
  next(signal) := train | signal & next(train);

-- Safety: train present  ->  gate down AND signal red
INVARSPEC !train | (gate & signal)`,
  },
  {
    id: 'smv-elevator',
    name: 'Elevator door',
    category: 'smv',
    text: '!moving || !door',
    description: 'Elevator safety invariant: cabin must not move while a door is open.',
    smv: `MODULE main
VAR
  door   : boolean;   -- TRUE  = door open
  moving : boolean;   -- TRUE  = cabin moving
ASSIGN
  init(door)   := TRUE;
  init(moving) := FALSE;

  -- Door may open/close while the cabin is stopped.
  next(door) :=
    case
      moving : door;            -- cannot change door state mid-travel
      TRUE   : { TRUE, FALSE };
    esac;
  -- Cabin may start moving only when the door is closed.
  next(moving) :=
    case
      door   : FALSE;
      TRUE   : { TRUE, FALSE };
    esac;

-- Safety: never moving while a door is open
INVARSPEC !moving | !door`,
  },
  {
    id: 'smv-garage',
    name: 'Garage door',
    category: 'smv',
    text: '(!u || !t) && (!d || !o)',
    description: 'Garage-door controller: drive up only when not at top sensor; drive down only when no obstruction.',
    smv: `MODULE main
VAR
  u : boolean;   -- motor driving up
  d : boolean;   -- motor driving down
  t : boolean;   -- top end-stop sensor
  o : boolean;   -- IR obstruction beam broken
ASSIGN
  init(u) := FALSE;
  init(d) := FALSE;
  init(t) := FALSE;
  init(o) := FALSE;

  -- End-stop and obstruction change non-deterministically.
  next(t) := { TRUE, FALSE };
  next(o) := { TRUE, FALSE };

  -- Controller: never drive both directions; cut UP when at top;
  -- cut DOWN when an obstruction is detected.
  next(u) :=
    case
      next(t)        : FALSE;
      d              : FALSE;
      TRUE           : { TRUE, FALSE };
    esac;
  next(d) :=
    case
      next(o)        : FALSE;
      u              : FALSE;
      TRUE           : { TRUE, FALSE };
    esac;

-- Safety: motor up implies not at top, motor down implies no obstruction
INVARSPEC (!u | !t) & (!d | !o)`,
  },
  {
    id: 'smv-wiper',
    name: 'Windshield wiper',
    category: 'smv',
    text: '!w || (i && (l || h))',
    description: 'Windshield-wiper controller: wipers operate only when ignition is on and the lever is in a non-off position.',
    smv: `MODULE main
VAR
  i : boolean;   -- ignition on
  l : boolean;   -- lever in LOW position
  h : boolean;   -- lever in HIGH position
  w : boolean;   -- wiper motor running
ASSIGN
  init(i) := FALSE;
  init(l) := FALSE;
  init(h) := FALSE;
  init(w) := FALSE;

  -- Driver may toggle ignition; lever positions are mutually exclusive.
  next(i) := { TRUE, FALSE };
  next(l) :=
    case
      next(h) : FALSE;
      TRUE    : { TRUE, FALSE };
    esac;
  next(h) := { TRUE, FALSE };

  -- Wipers run iff ignition is on AND lever selects LOW or HIGH.
  next(w) := next(i) & (next(l) | next(h));

-- Safety: wipers on implies ignition on and lever not in OFF position
INVARSPEC !w | (i & (l | h))`,
  },
  {
    id: 'smv-latch',
    name: 'Cross-coupled latch',
    category: 'smv',
    text: '!(x && y)',
    description: 'Cross-coupled Boolean latch: the two outputs should never be true at the same time.',
    smv: `MODULE main
#define false 0
#define true 1
VAR
        x, y : boolean;
ASSIGN
        init (x) := false;
        init (y) := false;

        next (x) := case
            !x & y : true;
            !y     : true;
            x      : false;
            true   : x;
        esac;

        next (y) := case
            x & !y : false;
            x & y  : y;
            !x & y : false;
            true   : true;
        esac;

-- Safety: latch outputs are mutually exclusive
INVARSPEC !(x & y)`,
  },
];

function loadSaved() {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function persist(state) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify({
      text: state.text,
      operators: [...state.operators],
      activeCategory: state.activeCategory,
      tests: state.tests,
    }));
  } catch {
    // ignore
  }
}

function formatAssignment(values) {
  return Object.entries(values)
    .map(([k, v]) => `${k}=${v ? 'T' : 'F'}`)
    .join(', ');
}

export function createSpecMutationExplorer() {
  const root = document.createElement('div');
  root.className = 'spec-mutation';
  root.dataset.testid = 'spec-mutation';

  const saved = loadSaved();
  const state = {
    text: saved?.text || DEFAULT_PREDICATE,
    operators: new Set(saved?.operators || DEFAULT_OPS),
    activeCategory: saved?.activeCategory || DEFAULT_CATEGORY,
    parseError: null,
    parsed: null,
    mutants: [],
    selectedMutantId: null,
    // tests: array of {id, values:{clause:bool}, manual:bool}
    tests: Array.isArray(saved?.tests) ? saved.tests : null,
    useFullTable: true, // when true tests = full truth table
  };

  function recompute() {
    state.parseError = null;
    state.parsed = null;
    state.mutants = [];
    try {
      const parsed = parsePredicate(state.text);
      state.parsed = parsed;
      const ops = [...state.operators];
      const generated = ops.length > 0 ? generateSpecMutants(parsed, ops) : [];
      let tests;
      if (state.useFullTable) {
        tests = buildAssignmentSpace(parsed.clauses);
      } else {
        // Restrict any saved manual tests to the current clause set.
        tests = (state.tests || []).map((t) => {
          const v = {};
          for (const c of parsed.clauses) v[c] = !!t.values?.[c];
          return v;
        });
      }
      state.mutants = evaluateSpecMutants(parsed, generated, tests);
      if (!state.mutants.find((m) => m.id === state.selectedMutantId)) {
        state.selectedMutantId = state.mutants[0]?.id || null;
      }
    } catch (err) {
      state.parseError = err.message || String(err);
    }
    persist(state);
  }

  function render() {
    recompute();

    const currentExample = SPEC_EXAMPLES.find((ex) => state.text.trim() === ex.text) || null;
    const categoryButtons = SPEC_CATEGORIES.map((cat) => `
      <button type="button"
        class="spec-category-btn${state.activeCategory === cat.id ? ' active' : ''}"
        data-spec-category="${cat.id}">${escapeHtml(t(cat.labelKey))}</button>
    `).join('');
    const visibleExamples = SPEC_EXAMPLES.filter((ex) => ex.category === state.activeCategory);
    const exampleButtons = visibleExamples.map((ex) => `
      <button type="button" class="spec-example-btn${state.text.trim() === ex.text ? ' active' : ''}"
        data-spec-example="${ex.id}" title="${escapeHtml(ex.description || '')}">${escapeHtml(ex.name)}</button>
    `).join('');

    const operatorButtons = SPEC_MUTATION_OPERATORS.map((op) => `
      <label class="grammar-op-btn${state.operators.has(op) ? ' active' : ''}" title="${escapeHtml(t(`spec.op.${op}`))}">
        <input type="checkbox" data-spec-op="${op}" ${state.operators.has(op) ? 'checked' : ''} />
        <span>${op}</span>
      </label>
    `).join('');

    const score = state.mutants.length === 0
      ? null
      : { killed: state.mutants.filter((m) => m.killed).length, total: state.mutants.length };

    const mutantsHtml = state.mutants.length === 0
      ? `<p class="grammar-empty">${escapeHtml(t('spec.noMutants'))}</p>`
      : `<ul class="grammar-mutant-list" data-testid="spec-mutant-list">
          ${state.mutants.map((m) => `<li>
            <button type="button"
              class="grammar-mutant-btn${state.selectedMutantId === m.id ? ' active' : ''} ${m.killed ? 'killed' : 'live'}"
              data-spec-mutant="${escapeHtml(m.id)}">
              <span class="grammar-mutant-op">${m.operator}</span>
              <span class="grammar-mutant-status">${m.killed ? t('grammar.killed') : t('grammar.live')}</span>
              <span class="grammar-mutant-desc">
                <code>${escapeHtml(m.text)}</code>
                <small>${escapeHtml(m.description)}</small>
              </span>
            </button>
          </li>`).join('')}
         </ul>`;

    const selected = state.mutants.find((m) => m.id === state.selectedMutantId) || null;
    const flippedSet = selected
      ? flippedKeysFromKillers(selected.killers, state.parsed?.clauses || [])
      : null;
    const fsmHtml = state.parsed
      ? `<div class="spec-fsm-grid" data-testid="spec-fsm-grid">
          ${renderMonitorSvg({
            ast: state.parsed.ast,
            clauses: state.parsed.clauses,
            title: t('spec.fsm.original'),
            flippedSet: null,
            testId: 'spec-fsm-original',
          })}
          ${renderMonitorSvg({
            ast: selected ? selected.ast : state.parsed.ast,
            clauses: state.parsed.clauses,
            title: selected ? `${t('spec.fsm.mutant')}: ${selected.id}` : t('spec.fsm.pickMutant'),
            flippedSet,
            testId: 'spec-fsm-mutant',
          })}
         </div>
         <p class="spec-fsm-legend">${escapeHtml(t('spec.fsm.legend'))}</p>`
      : '';
    const selectedDetailHtml = selected
      ? `<div class="spec-mutant-detail">
          <h5>${escapeHtml(selected.id)}</h5>
          <p>${escapeHtml(selected.description)}</p>
          <p><strong>${escapeHtml(t('spec.mutantText'))}:</strong> <code>${escapeHtml(selected.text)}</code></p>
          ${selected.killed
            ? `<p><strong>${escapeHtml(t('grammar.killedBy'))}</strong></p>
               <ul class="grammar-killer-list">${selected.killers.slice(0, 8).map((k) => `<li>
                 <code>${escapeHtml(formatAssignment(k.test))}</code>
                 · orig=${k.orig ? 'T' : 'F'} · mut=${k.mut ? 'T' : 'F'}
               </li>`).join('')}</ul>`
            : `<p class="grammar-mutant-live">${escapeHtml(t('spec.equivalentHint'))}</p>`}
        </div>`
      : `<p class="grammar-empty">${escapeHtml(t('grammar.selectMutantHint'))}</p>`;

    root.innerHTML = `
      <div class="grammar-card spec-card">
        <header class="grammar-header">
          <p class="grammar-kicker">${escapeHtml(t('spec.kicker'))}</p>
          <h3>${escapeHtml(t('spec.title'))}</h3>
          <p class="grammar-subtitle">${escapeHtml(t('spec.subtitle'))}</p>
        </header>

        <nav class="spec-category-row" data-testid="spec-category-row" role="tablist" aria-label="${escapeHtml(t('spec.cat.aria'))}">${categoryButtons}</nav>
        <div class="grammar-example-row" data-testid="spec-example-row">${exampleButtons}</div>
        ${currentExample?.description ? `<p class="spec-example-caption" data-testid="spec-example-caption">${escapeHtml(currentExample.description)}</p>` : ''}
        ${currentExample?.smv ? `<details class="spec-smv-source" data-testid="spec-smv-source" open>
          <summary>${escapeHtml(t('spec.smv.viewSource'))}</summary>
          <pre><code>${escapeHtml(currentExample.smv)}</code></pre>
        </details>` : ''}

        <div class="spec-editor-row">
          <label class="grammar-editor-label">
            ${escapeHtml(t('spec.predicateLabel'))}
            <input type="text" data-testid="spec-text" value="${escapeHtml(state.text)}" spellcheck="false" />
          </label>
          ${state.parseError ? `<p class="grammar-error" data-testid="spec-parse-error">${escapeHtml(state.parseError)}</p>` : ''}
          ${state.parsed ? `<p class="spec-clauses">
            <strong>${escapeHtml(t('spec.clauses'))}:</strong> ${state.parsed.clauses.map((c) => `<code>${escapeHtml(c)}</code>`).join(', ') || '—'}
            · <strong>${escapeHtml(t('spec.canonical'))}:</strong> <code>${escapeHtml(astToString(state.parsed.ast))}</code>
          </p>` : ''}
        </div>

        <div class="grammar-mutation-block">
          <div class="grammar-mutation-header">
            <h4>${escapeHtml(t('spec.mutants'))}</h4>
            ${score ? `<span class="grammar-score" data-testid="spec-mutation-score">${escapeHtml(t('grammar.scoreLabel'))}: ${score.killed} / ${score.total} (${Math.round(score.killed / score.total * 100)}%)</span>` : ''}
          </div>
          <p class="spec-test-note">${escapeHtml(t('spec.testNote'))}</p>
          <div class="grammar-op-row">${operatorButtons}</div>
          <div class="grammar-mutation-grid">
            <div>${mutantsHtml}</div>
            <div>${selectedDetailHtml}</div>
          </div>
          ${fsmHtml}
        </div>
      </div>
    `;

    root.querySelectorAll('[data-spec-category]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeCategory = btn.dataset.specCategory;
        render();
      });
    });
    root.querySelectorAll('[data-spec-example]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ex = SPEC_EXAMPLES.find((e) => e.id === btn.dataset.specExample);
        if (!ex) return;
        state.text = ex.text;
        state.activeCategory = ex.category || state.activeCategory;
        state.selectedMutantId = null;
        render();
      });
    });
    root.querySelector('[data-testid="spec-text"]')?.addEventListener('input', (e) => {
      state.text = e.target.value;
    });
    root.querySelector('[data-testid="spec-text"]')?.addEventListener('change', () => {
      state.selectedMutantId = null;
      render();
    });
    root.querySelectorAll('[data-spec-op]').forEach((cb) => {
      cb.addEventListener('change', (e) => {
        const op = e.target.dataset.specOp;
        if (e.target.checked) state.operators.add(op);
        else state.operators.delete(op);
        render();
      });
    });
    root.querySelectorAll('[data-spec-mutant]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.selectedMutantId = btn.dataset.specMutant;
        render();
      });
    });
  }

  render();
  return root;
}
