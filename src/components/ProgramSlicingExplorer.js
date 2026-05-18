import { t, getLocale, onLocaleChange } from '../i18n/index.js';
import { SLICING_EXAMPLES } from '../data/slicingExamples.js';
import { renderSlicePdgView } from './SlicePdgView.js';
import { backwardSlice, forwardSlice, dynamicSlice } from '../utils/slicing.js';

// N1 — Program Slicing Explorer.
// Lets the learner pick a criterion (statement + variable), choose
// backward/forward direction and static/dynamic mode, then sees the
// resulting slice highlighted in the code listing and PDG.

const state = {
  exampleId: SLICING_EXAMPLES[0].id,
  direction: 'backward',     // 'backward' | 'forward'
  mode: 'static',            // 'static' | 'dynamic'
  selectedTraceId: null,     // trace id (dynamic mode)
  selectedStmtId: null,      // criterion statement
  selectedVar: null,         // criterion variable
  quiz: { active: false, phase: 'idle', answer: '' },
};

let root;

function currentExample() {
  return SLICING_EXAMPLES.find((e) => e.id === state.exampleId) || SLICING_EXAMPLES[0];
}

function currentTrace() {
  const ex = currentExample();
  if (!state.selectedTraceId) return ex.traces[0] || null;
  return ex.traces.find((tr) => tr.id === state.selectedTraceId) || ex.traces[0] || null;
}

function computeSlice() {
  if (!state.selectedStmtId || !state.selectedVar) return new Set();
  const ex = currentExample();
  const criterion = { stmtId: state.selectedStmtId, variable: state.selectedVar };
  if (state.mode === 'dynamic') {
    const trace = currentTrace();
    if (!trace) return new Set();
    return dynamicSlice(ex, trace, criterion);
  }
  if (state.direction === 'forward') return forwardSlice(ex, criterion);
  return backwardSlice(ex, criterion);
}

function computeStaticSliceForComparison() {
  if (!state.selectedStmtId || !state.selectedVar) return new Set();
  const ex = currentExample();
  const criterion = { stmtId: state.selectedStmtId, variable: state.selectedVar };
  if (state.direction === 'forward') return forwardSlice(ex, criterion);
  return backwardSlice(ex, criterion);
}

// ── Sub-renderers ─────────────────────────────────────────────────────────────

function renderExampleChips() {
  return `<div class="pse-chip-bar" data-testid="pse-example-chips">
    ${SLICING_EXAMPLES.map((ex) => `
      <button type="button"
        class="pse-chip${state.exampleId === ex.id ? ' pse-chip--active' : ''}"
        data-testid="slicing-example-${ex.id}"
        data-example-id="${ex.id}">
        ${t(ex.titleKey)}
      </button>`).join('')}
  </div>`;
}

function renderDirectionToggle() {
  return `<div class="pse-toggle-row">
    <span class="pse-toggle-label">${t('slicing.direction')}</span>
    <button type="button"
      class="pse-toggle-btn${state.direction === 'backward' ? ' pse-toggle-btn--active' : ''}"
      data-testid="slicing-dir-backward" data-dir="backward">
      ${t('slicing.backward')}
    </button>
    <button type="button"
      class="pse-toggle-btn${state.direction === 'forward' ? ' pse-toggle-btn--active' : ''}"
      data-testid="slicing-dir-forward" data-dir="forward">
      ${t('slicing.forward')}
    </button>
  </div>`;
}

function renderModeToggle() {
  return `<div class="pse-toggle-row">
    <span class="pse-toggle-label">${t('slicing.mode')}</span>
    <button type="button"
      class="pse-toggle-btn${state.mode === 'static' ? ' pse-toggle-btn--active' : ''}"
      data-testid="slicing-mode-static" data-mode="static">
      ${t('slicing.static')}
    </button>
    <button type="button"
      class="pse-toggle-btn${state.mode === 'dynamic' ? ' pse-toggle-btn--active' : ''}"
      data-testid="slicing-mode-dynamic" data-mode="dynamic">
      ${t('slicing.dynamic')}
    </button>
  </div>`;
}

function renderTracePicker() {
  if (state.mode !== 'dynamic') return '';
  const ex = currentExample();
  const activeTraceId = state.selectedTraceId || (ex.traces[0] && ex.traces[0].id);
  return `<div class="pse-trace-bar">
    <span class="pse-toggle-label">${t('slicing.trace')}</span>
    ${ex.traces.map((tr) => `
      <button type="button"
        class="pse-chip${activeTraceId === tr.id ? ' pse-chip--active' : ''}"
        data-testid="slicing-trace-${tr.id}"
        data-trace-id="${tr.id}">
        ${tr.inputLabel || tr.label || tr.id}
      </button>`).join('')}
  </div>`;
}

function renderVarPicker() {
  if (!state.selectedStmtId) return '';
  const ex = currentExample();
  const stmt = ex.statements.find((s) => s.id === state.selectedStmtId);
  if (!stmt) return '';
  const vars = [...new Set([...(stmt.defs || []), ...(stmt.uses || [])])];
  if (!vars.length) return `<div class="pse-hint">${t('slicing.noVars')}</div>`;
  return `<div class="pse-var-bar">
    <span class="pse-toggle-label">${t('slicing.pickVar')}</span>
    ${vars.map((v) => `
      <button type="button"
        class="pse-chip${state.selectedVar === v ? ' pse-chip--active' : ''}"
        data-testid="slicing-var-${v}"
        data-var-name="${v}">
        ${v}
      </button>`).join('')}
  </div>`;
}

function renderDetail(sliceSet) {
  const count = sliceSet.size;
  let content = `<span>${t('slicing.stmtsInSlice')}: <b>${count}</b></span>`;
  if (state.mode === 'dynamic' && state.selectedStmtId && state.selectedVar) {
    const staticSet = computeStaticSliceForComparison();
    const delta = staticSet.size - count;
    const sign = delta >= 0 ? '+' : '';
    content += ` <span class="pse-delta">(${t('slicing.static')}: ${staticSet.size}, delta: ${sign}${delta})</span>`;
  }
  return `<div class="pse-detail" data-testid="slicing-detail">${content}</div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="pse-quiz-start" data-testid="slicing-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    return `<div class="pse-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="slicing-quiz-result">
      <p>${correct ? t('slicing.quiz.correct') : t('slicing.quiz.wrong')}</p>
      <button type="button" class="pse-quiz-close" data-testid="slicing-quiz-close">${t('quiz.close')}</button>
    </div>`;
  }
  return `<div class="pse-quiz" data-testid="slicing-quiz">
    <p class="pse-quiz-prompt">${t('slicing.quiz.prompt')}</p>
    ${['a', 'b', 'c', 'd'].map((k) => `
      <label class="pse-quiz-option">
        <input type="radio" name="pse-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
        ${t('slicing.quiz.' + k)}
      </label>`).join('')}
    <button type="button" class="pse-quiz-submit" data-testid="slicing-quiz-submit"
      ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
  </div>`;
}

function render() {
  const ex = currentExample();
  const sliceSet = computeSlice();

  root.innerHTML = `
    <div class="pse-wrap">
      <h2 class="pse-title">${t('slicing.title')}</h2>
      <p class="pse-desc">${t('slicing.desc')}</p>

      <section class="pse-controls">
        ${renderExampleChips()}
        ${renderDirectionToggle()}
        ${renderModeToggle()}
        ${renderTracePicker()}
      </section>

      <div class="pse-pdg-wrap">
        ${renderSlicePdgView(ex, sliceSet)}
      </div>

      ${renderVarPicker()}
      ${renderDetail(sliceSet)}

      <section class="pse-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
      </section>
    </div>`;

  bindEvents();
}

function bindEvents() {
  // Example chips
  root.querySelectorAll('[data-example-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (state.exampleId !== btn.dataset.exampleId) {
        state.exampleId = btn.dataset.exampleId;
        state.selectedStmtId = null;
        state.selectedVar = null;
        state.selectedTraceId = null;
      }
      render();
    });
  });

  // Direction toggle
  root.querySelectorAll('[data-dir]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.direction = btn.dataset.dir;
      render();
    });
  });

  // Mode toggle
  root.querySelectorAll('[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.mode = btn.dataset.mode;
      render();
    });
  });

  // Trace picker
  root.querySelectorAll('[data-trace-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedTraceId = btn.dataset.traceId;
      render();
    });
  });

  // Statement selection (from the rendered source listing)
  root.querySelectorAll('[data-stmt]').forEach((li) => {
    li.addEventListener('click', () => {
      state.selectedStmtId = li.dataset.stmt;
      state.selectedVar = null;
      render();
    });
  });

  // Variable picker
  root.querySelectorAll('[data-var-name]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedVar = btn.dataset.varName;
      render();
    });
  });

  // Quiz
  root.querySelector('[data-testid="slicing-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="pse-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="slicing-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="slicing-quiz-close"]')?.addEventListener('click', () => {
    state.quiz = { active: false, phase: 'idle', answer: '' };
    render();
  });
}

export function createProgramSlicingExplorer() {
  state.exampleId = SLICING_EXAMPLES[0].id;
  state.direction = 'backward';
  state.mode = 'static';
  state.selectedTraceId = null;
  state.selectedStmtId = null;
  state.selectedVar = null;
  state.quiz = { active: false, phase: 'idle', answer: '' };

  root = document.createElement('div');
  root.dataset.testid = 'program-slicing-explorer';

  onLocaleChange(() => render());
  render();
  return root;
}
