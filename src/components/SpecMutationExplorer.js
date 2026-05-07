import { t } from '../i18n/index.js';
import {
  parsePredicate,
  generateSpecMutants,
  evaluateSpecMutants,
  buildAssignmentSpace,
  astToString,
  SPEC_MUTATION_OPERATORS,
} from '../utils/specMutation.js';

const STORAGE_KEY = 'stvisual.specMutation.v1';
const DEFAULT_PREDICATE = '(a || b) && c';
const DEFAULT_OPS = ['ENF', 'BCR', 'LRO', 'UOI'];

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const SPEC_EXAMPLES = [
  { id: 'guard', name: 'Guard', nameEn: 'Guard', text: '(a || b) && c' },
  { id: 'leap', name: 'Leap year', nameEn: 'Leap year', text: '(y && !c) || (y && c && q)' },
  { id: 'triangle', name: 'Triangle ineq.', nameEn: 'Triangle ineq.', text: 'a && b && c' },
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

    const exampleButtons = SPEC_EXAMPLES.map((ex) => `
      <button type="button" class="spec-example-btn${state.text.trim() === ex.text ? ' active' : ''}"
        data-spec-example="${ex.id}">${escapeHtml(ex.name)}</button>
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

        <div class="grammar-example-row">${exampleButtons}</div>

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
        </div>
      </div>
    `;

    root.querySelectorAll('[data-spec-example]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ex = SPEC_EXAMPLES.find((e) => e.id === btn.dataset.specExample);
        if (!ex) return;
        state.text = ex.text;
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
