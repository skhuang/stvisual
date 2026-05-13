import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';
import { generateStTransitionTests, generateStSequenceTests } from '../utils/blackboxTesting.js';

const STORAGE_KEY = 'stvisual.st.v1';

const EXAMPLES = [
  {
    id: 'traffic-light',
    name: 'Traffic Light',
    states: [
      { id: 's1', name: 'Red',    initial: true },
      { id: 's2', name: 'Green'  },
      { id: 's3', name: 'Yellow' },
    ],
    transitions: [
      { id: 't1', from: 's1', to: 's2', event: 'timer',  action: 'Go' },
      { id: 't2', from: 's2', to: 's3', event: 'timer',  action: 'Slow' },
      { id: 't3', from: 's3', to: 's1', event: 'timer',  action: 'Stop' },
    ],
  },
  {
    id: 'vending',
    name: 'Vending Machine',
    states: [
      { id: 's1', name: 'Idle',      initial: true },
      { id: 's2', name: 'HasCoins'  },
      { id: 's3', name: 'Selected'  },
      { id: 's4', name: 'Dispensing' },
    ],
    transitions: [
      { id: 't1', from: 's1', to: 's2', event: 'insertCoin',    action: 'AcceptCoin' },
      { id: 't2', from: 's2', to: 's2', event: 'insertCoin',    action: 'AcceptCoin' },
      { id: 't3', from: 's2', to: 's3', event: 'selectItem',    action: 'ShowItem' },
      { id: 't4', from: 's3', to: 's4', event: 'confirmPay',    action: 'Dispense' },
      { id: 't5', from: 's4', to: 's1', event: 'itemDispensed', action: 'Reset' },
      { id: 't6', from: 's2', to: 's1', event: 'cancel',        action: 'Refund' },
      { id: 't7', from: 's3', to: 's2', event: 'cancel',        action: 'ClearSel' },
    ],
  },
  {
    id: 'atm',
    name: 'ATM Session',
    states: [
      { id: 's1', name: 'Idle',         initial: true },
      { id: 's2', name: 'CardInserted' },
      { id: 's3', name: 'PINEntered'   },
      { id: 's4', name: 'MenuShown'    },
      { id: 's5', name: 'Dispensing'   },
    ],
    transitions: [
      { id: 't1', from: 's1', to: 's2', event: 'insertCard',     action: 'ReadCard' },
      { id: 't2', from: 's2', to: 's3', event: 'enterPIN',       action: 'VerifyPIN' },
      { id: 't3', from: 's3', to: 's4', event: 'pinCorrect',     action: 'ShowMenu' },
      { id: 't4', from: 's3', to: 's2', event: 'pinWrong',       action: 'RetryPIN' },
      { id: 't5', from: 's4', to: 's5', event: 'withdraw',       action: 'Dispense' },
      { id: 't6', from: 's5', to: 's1', event: 'done',           action: 'EjectCard' },
      { id: 't7', from: 's2', to: 's1', event: 'cancel',         action: 'EjectCard' },
      { id: 't8', from: 's4', to: 's1', event: 'cancel',         action: 'EjectCard' },
    ],
  },
];

function esc(v = '') {
  return String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
function deepClone(o) { return JSON.parse(JSON.stringify(o)); }
function loadSaved() { try { return JSON.parse(globalThis.localStorage?.getItem(STORAGE_KEY) ?? 'null'); } catch { return null; } }
function persist(s) { try { globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify({ exampleId: s.exampleId, states: s.states, transitions: s.transitions, mode: s.mode })); } catch {} }

export function createStateTransitionExplorer() {
  const root = document.createElement('div');
  root.className = 'st-explorer';
  root.dataset.testid = 'st-explorer';

  const saved = loadSaved();
  const defaultEx = EXAMPLES[0];
  const state = {
    exampleId:   saved?.exampleId   ?? defaultEx.id,
    states:      saved?.states      ? deepClone(saved.states)      : deepClone(defaultEx.states),
    transitions: saved?.transitions ? deepClone(saved.transitions) : deepClone(defaultEx.transitions),
    mode:        saved?.mode        ?? 'transition',  // 'transition' | 'sequence'
  };

  let nextSId = 20;
  let nextTId = 20;

  const stQuiz = { active: false, phase: 'question', answer: '', result: null };

  function renderStQuizPanel() {
    if (!stQuiz.active) return '';
    const tests = getTests();
    const count = tests.length;
    const modeLabel = state.mode === 'sequence' ? t('st.mode.sequence') : t('st.mode.transition');
    const isGraded = stQuiz.phase === 'graded';
    const correct = isGraded && parseInt(stQuiz.answer, 10) === count;
    return `
      <div class="quiz-panel" data-testid="st-quiz">
        <div class="quiz-header">
          <h4>${t('quiz.st.title')}</h4>
          <button type="button" class="quiz-close-btn" data-testid="st-quiz-close">${t('quiz.close')}</button>
        </div>
        <p class="quiz-prompt">${t('quiz.st.prompt').replace('{mode}', esc(modeLabel))}</p>
        <div class="quiz-bva-inputs">
          <label class="quiz-bva-field">
            <span>${t('quiz.st.label')}</span>
            <input type="number" min="0"
              class="quiz-bva-input${isGraded ? (correct ? ' quiz-input-correct' : ' quiz-input-wrong') : ''}"
              data-testid="st-quiz-answer" value="${esc(stQuiz.answer)}" ${isGraded ? 'readonly' : ''}>
          </label>
        </div>
        ${isGraded ? `
          <p class="quiz-score" data-testid="st-quiz-score">
            ${correct
              ? `<strong>${t('quiz.bva.perfect')}</strong>`
              : `${t('quiz.ec.wrong')} ${t('quiz.ec.answer').replace('{count}', count)}`}
          </p>
          <button type="button" class="quiz-share-btn" data-share-payload="${encodeResult({ v: 1, explorer: 'st', explorerLabel: t('quiz.st.title'), mode: 'quiz', ts: Date.now(), lang: getLocale(), score: correct ? 1 : 0, total: 1, items: [{ q: t('quiz.st.prompt').replace('{mode}', modeLabel), a: String(stQuiz.answer), expected: String(count), ok: correct }] })}" data-testid="st-quiz-share">📋 ${t('quiz.share.btn')}</button>
          <button type="button" class="quiz-start-btn" data-testid="st-quiz-reset">${t('quiz.reset')}</button>
        ` : `
          <button type="button" class="quiz-start-btn" data-testid="st-quiz-check">${t('quiz.check')}</button>
        `}
      </div>
    `;
  }

  function getTests() {
    if (!state.states.length || !state.transitions.length) return [];
    return state.mode === 'sequence'
      ? generateStSequenceTests(state.states, state.transitions)
      : generateStTransitionTests(state.states, state.transitions);
  }

  // SVG diagram of the state machine
  function renderDiagram() {
    const W = 520, H = 220, R = 28;
    const n = state.states.length;
    if (!n) return '';

    // Arrange states in a circle
    const cx = W / 2, cy = H / 2, radius = Math.min(W, H) / 2 - R - 16;
    const positions = state.states.map((s, i) => {
      const angle = (2 * Math.PI * i / n) - Math.PI / 2;
      return { id: s.id, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    });
    const pos = Object.fromEntries(positions.map((p) => [p.id, p]));

    const arrowId = 'st-arrow';
    let defs = `<defs><marker id="${arrowId}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#6366f1"/>
    </marker></defs>`;

    const edges = state.transitions.map((tr, i) => {
      const from = pos[tr.from];
      const to   = pos[tr.to];
      if (!from || !to) return '';
      const isSelf = tr.from === tr.to;
      if (isSelf) {
        const mx = from.x, my = from.y - R - 20;
        return `<path d="M${from.x - 12},${from.y - R} Q${mx - 30},${my - 30} ${from.x + 12},${from.y - R}"
          fill="none" stroke="#6366f1" stroke-width="1.5" marker-end="url(#${arrowId})"/>
          <text x="${mx}" y="${my - 12}" text-anchor="middle" font-size="10" fill="#374151">${esc(tr.event)}</text>`;
      }
      const dx = to.x - from.x, dy = to.y - from.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const ux = dx / len, uy = dy / len;
      const x1 = from.x + ux * R, y1 = from.y + uy * R;
      const x2 = to.x   - ux * R, y2 = to.y   - uy * R;
      // slight curve
      const perpX = -uy * 18, perpY = ux * 18;
      const mx2 = (x1 + x2) / 2 + perpX, my2 = (y1 + y2) / 2 + perpY;
      return `<path d="M${x1},${y1} Q${mx2},${my2} ${x2},${y2}"
        fill="none" stroke="#6366f1" stroke-width="1.5" marker-end="url(#${arrowId})"/>
        <text x="${mx2}" y="${my2 - 4}" text-anchor="middle" font-size="10" fill="#374151">${esc(tr.event)}</text>`;
    }).join('');

    const nodes = state.states.map((s) => {
      const p = pos[s.id];
      if (!p) return '';
      const stroke = s.initial ? '#0f4c81' : '#9ca3af';
      const sw = s.initial ? 2.5 : 1.5;
      return `<circle cx="${p.x}" cy="${p.y}" r="${R}" fill="#f8fafc" stroke="${stroke}" stroke-width="${sw}"/>
        <text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="11" fill="#1f2a44" font-weight="600">${esc(s.name)}</text>`;
    }).join('');

    return `<svg viewBox="0 0 ${W} ${H}" class="st-diagram" data-testid="st-diagram"
      xmlns="http://www.w3.org/2000/svg" aria-label="${t('st.diagram.aria')}">
      ${defs}${edges}${nodes}
    </svg>`;
  }

  function renderStateList() {
    return state.states.map((s, i) => `
      <div class="st-state-row" data-testid="st-state-${i}">
        ${s.initial ? `<span class="st-initial-dot" title="${t('st.initial')}">●</span>` : `<span class="st-initial-dot st-initial-dot--empty" title="${t('st.set.initial')}" data-set-initial="${i}">○</span>`}
        <input class="st-state-name" data-sidx="${i}" value="${esc(s.name)}"
          placeholder="${t('st.state.name')}" data-testid="st-state-name-${i}"/>
        <button class="st-del-btn" data-del-state="${i}" aria-label="${t('common.remove')}"
          ${state.states.length <= 1 ? 'disabled' : ''} data-testid="st-del-state-${i}">×</button>
      </div>
    `).join('');
  }

  function renderTransitionList() {
    return state.transitions.map((tr, i) => {
      const fromNames = state.states.map((s) => `<option value="${esc(s.id)}"${tr.from === s.id ? ' selected' : ''}>${esc(s.name)}</option>`).join('');
      const toNames   = state.states.map((s) => `<option value="${esc(s.id)}"${tr.to   === s.id ? ' selected' : ''}>${esc(s.name)}</option>`).join('');
      return `<tr class="st-tr-row" data-testid="st-transition-${i}">
        <td><select class="st-from-sel" data-tidx="${i}" data-testid="st-from-${i}">${fromNames}</select></td>
        <td>→</td>
        <td><select class="st-to-sel" data-tidx="${i}" data-testid="st-to-${i}">${toNames}</select></td>
        <td><input class="st-event-inp" data-tidx="${i}" value="${esc(tr.event)}"
          placeholder="${t('st.transition.event')}" data-testid="st-event-${i}"/></td>
        <td><input class="st-action-inp" data-tidx="${i}" value="${esc(tr.action ?? '')}"
          placeholder="${t('st.transition.action')}" data-testid="st-action-${i}"/></td>
        <td><button class="st-del-btn" data-del-tr="${i}" aria-label="${t('common.remove')}"
          ${state.transitions.length <= 1 ? 'disabled' : ''} data-testid="st-del-tr-${i}">×</button></td>
      </tr>`;
    }).join('');
  }

  function renderTestTable(tests) {
    if (!tests.length) return `<p class="st-empty" data-testid="st-empty">${t('st.empty')}</p>`;
    if (state.mode === 'sequence') {
      const rows = tests.map((tc) => `
        <tr class="st-test-row" data-testid="st-test-${tc.id}">
          <td class="st-test-label">${esc(tc.label)}</td>
          <td class="st-test-seq">${tc.sequence.map(esc).join(' → ')}</td>
          <td class="st-test-events">${tc.events.map((e) => `<span class="st-event-chip">${esc(e)}</span>`).join('')}</td>
        </tr>
      `).join('');
      return `<table class="st-table" data-testid="st-table">
        <thead><tr>
          <th>${t('st.table.test')}</th>
          <th>${t('st.table.sequence')}</th>
          <th>${t('st.table.events')}</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
    }
    const rows = tests.map((tc) => `
      <tr class="st-test-row" data-testid="st-test-${tc.id}">
        <td class="st-test-label">${esc(tc.label)}</td>
        <td>${esc(tc.from)}</td>
        <td class="st-event-col"><span class="st-event-chip">${esc(tc.event)}</span></td>
        <td>${esc(tc.to)}</td>
        <td class="st-action-col">${tc.action ? `<em>${esc(tc.action)}</em>` : ''}</td>
      </tr>
    `).join('');
    return `<table class="st-table" data-testid="st-table">
      <thead><tr>
        <th>${t('st.table.test')}</th>
        <th>${t('st.table.from')}</th>
        <th>${t('st.table.event')}</th>
        <th>${t('st.table.to')}</th>
        <th>${t('st.table.action')}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  function render() {
    const tests = getTests();
    const exBtns = EXAMPLES.map((ex) => `
      <button type="button" class="st-example-btn${state.exampleId === ex.id ? ' active' : ''}"
        data-st-example="${ex.id}" data-testid="st-example-${ex.id}">${esc(ex.name)}</button>
    `).join('');

    root.innerHTML = `
      <div class="st-panel">
        <div class="st-toolbar">
          <div class="st-examples" data-testid="st-examples">${exBtns}</div>
          <div class="st-mode-toggle" role="group">
            <button type="button" class="st-mode-btn${state.mode === 'transition' ? ' active' : ''}"
              data-mode="transition" data-testid="st-mode-transition">${t('st.mode.transition')}</button>
            <button type="button" class="st-mode-btn${state.mode === 'sequence' ? ' active' : ''}"
              data-mode="sequence" data-testid="st-mode-sequence">${t('st.mode.sequence')}</button>
            <button type="button" class="quiz-start-btn" data-testid="st-quiz-start">${t('quiz.start')}</button>
          </div>
        </div>

        <div class="st-body">
          <div class="st-input-pane">
            <div class="st-diagram-wrap">
              ${renderDiagram()}
            </div>

            <div class="st-section">
              <h4>${t('st.states.title')}</h4>
              <div class="st-state-list">${renderStateList()}</div>
              <button class="st-add-state-btn" data-testid="st-add-state"
                ${state.states.length >= 8 ? 'disabled' : ''}>
                + ${t('st.state.add')}
              </button>
            </div>

            <div class="st-section">
              <h4>${t('st.transitions.title')}</h4>
              <table class="st-tr-table"><tbody>${renderTransitionList()}</tbody></table>
              <button class="st-add-tr-btn" data-testid="st-add-transition"
                ${state.transitions.length >= 16 ? 'disabled' : ''}>
                + ${t('st.transition.add')}
              </button>
            </div>
          </div>

          <div class="st-results-pane" data-testid="st-results">
            <h3>${t('st.results.title')}
              <span class="st-count">${tests.length} ${t('st.results.count')}</span>
            </h3>
            ${renderTestTable(tests)}
            ${renderStQuizPanel()}
          </div>
        </div>
      </div>
    `;

    bindEvents();
    persist(state);
  }

  function bindEvents() {
    root.querySelectorAll('[data-st-example]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ex = EXAMPLES.find((e) => e.id === btn.dataset.stExample);
        if (!ex) return;
        state.exampleId   = ex.id;
        state.states      = deepClone(ex.states);
        state.transitions = deepClone(ex.transitions);
        render();
      });
    });

    root.querySelectorAll('[data-mode]').forEach((btn) => {
      btn.addEventListener('click', () => { state.mode = btn.dataset.mode; render(); });
    });

    root.querySelectorAll('.st-state-name').forEach((inp) => {
      inp.addEventListener('input', (e) => {
        state.states[Number(e.target.dataset.sidx)].name = e.target.value;
        refreshResults();
        persist(state);
      });
    });

    root.querySelectorAll('[data-set-initial]').forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = Number(dot.dataset.setInitial);
        state.states.forEach((s, i) => { s.initial = i === idx; });
        render();
      });
    });

    root.querySelectorAll('[data-del-state]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.delState);
        const sid = state.states[idx].id;
        state.states.splice(idx, 1);
        state.transitions = state.transitions.filter((tr) => tr.from !== sid && tr.to !== sid);
        if (state.states.length && !state.states.some((s) => s.initial)) state.states[0].initial = true;
        render();
      });
    });

    root.querySelector('[data-testid="st-add-state"]')?.addEventListener('click', () => {
      if (state.states.length >= 8) return;
      state.states.push({ id: `s${nextSId++}`, name: `State ${state.states.length + 1}` });
      render();
    });

    root.querySelectorAll('.st-from-sel, .st-to-sel').forEach((sel) => {
      sel.addEventListener('change', (e) => {
        const idx = Number(e.target.dataset.tidx);
        const field = e.target.classList.contains('st-from-sel') ? 'from' : 'to';
        state.transitions[idx][field] = e.target.value;
        refreshResults();
        persist(state);
      });
    });

    root.querySelectorAll('.st-event-inp').forEach((inp) => {
      inp.addEventListener('input', (e) => {
        state.transitions[Number(e.target.dataset.tidx)].event = e.target.value;
        refreshResults();
        persist(state);
      });
    });

    root.querySelectorAll('.st-action-inp').forEach((inp) => {
      inp.addEventListener('input', (e) => {
        state.transitions[Number(e.target.dataset.tidx)].action = e.target.value;
        refreshResults();
        persist(state);
      });
    });

    root.querySelectorAll('[data-del-tr]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.transitions.splice(Number(btn.dataset.delTr), 1);
        render();
      });
    });

    root.querySelector('[data-testid="st-add-transition"]')?.addEventListener('click', () => {
      if (state.transitions.length >= 16) return;
      const from = state.states[0]?.id ?? '';
      const to   = state.states[1]?.id ?? from;
      state.transitions.push({ id: `t${nextTId++}`, from, to, event: 'event', action: '' });
      render();
    });

    root.querySelector('[data-testid="st-quiz-start"]')?.addEventListener('click', () => {
      stQuiz.active = true; stQuiz.phase = 'question'; stQuiz.answer = ''; render();
    });
    root.querySelector('[data-testid="st-quiz-close"]')?.addEventListener('click', () => {
      stQuiz.active = false; render();
    });
    root.querySelector('[data-testid="st-quiz-check"]')?.addEventListener('click', () => {
      stQuiz.answer = root.querySelector('[data-testid="st-quiz-answer"]')?.value ?? '';
      stQuiz.phase = 'graded'; render();
    });
    root.querySelector('[data-testid="st-quiz-reset"]')?.addEventListener('click', () => {
      stQuiz.phase = 'question'; stQuiz.answer = ''; render();
    });
  }

  function refreshResults() {
    const tests = getTests();
    const pane = root.querySelector('[data-testid="st-results"]');
    if (pane) {
      pane.innerHTML = `<h3>${t('st.results.title')}
        <span class="st-count">${tests.length} ${t('st.results.count')}</span>
      </h3>${renderTestTable(tests)}`;
    }
  }

  render();
  return root;
}
