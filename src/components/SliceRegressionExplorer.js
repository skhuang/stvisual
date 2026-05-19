import { t, onLocaleChange } from '../i18n/index.js';
import { SLICING_EXAMPLES } from '../data/slicingExamples.js';
import { affectedTests } from '../utils/slicing.js';
import { renderSliceCodeListing, renderSlicePdgGraph } from './SlicePdgView.js';

// N4 — Slice Regression Explorer.
// The learner marks a statement as edited; the explorer classifies the
// authored test suite into must-rerun and safe-to-skip sets, contrasting
// the conservative static criterion with the precise dynamic one.

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

const state = {
  exampleId: SLICING_EXAMPLES[0].id,
  changedStmtId: null,
  mode: 'static',
  pdgZoom: 1,
  quiz: { active: false, phase: 'idle', answer: '' },
};

let root;

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function currentExample() {
  return SLICING_EXAMPLES.find((e) => e.id === state.exampleId) || SLICING_EXAMPLES[0];
}

// The output statement of the example (kind:'output').
function outputStatement(example) {
  return example.statements.find((s) => s.kind === 'output') || null;
}

// Build the output criterion from the example.
function outputCriterion(example) {
  const outStmt = outputStatement(example);
  if (!outStmt) return null;
  const variable = outStmt.uses[0];
  if (!variable) return null;
  return { stmtId: outStmt.id, variable };
}

// ── Sub-renderers ─────────────────────────────────────────────────────────────

function renderExampleChips() {
  return `<div class="sre-chip-bar" data-testid="sre-example-chips">
    ${SLICING_EXAMPLES.map((ex) => `
      <button type="button"
        class="sre-chip${state.exampleId === ex.id ? ' sre-chip--active' : ''}"
        data-testid="regression-example-${ex.id}"
        data-regression-example-id="${ex.id}">
        ${t(ex.titleKey)}
      </button>`).join('')}
  </div>`;
}

function renderModeToggle() {
  return `<div class="sre-toggle-row">
    <span class="sre-toggle-label">${t('regression.modeLabel')}</span>
    <button type="button"
      class="sre-toggle-btn${state.mode === 'static' ? ' sre-toggle-btn--active' : ''}"
      data-testid="regression-mode-static"
      data-regression-mode="static">
      ${t('regression.static')}
    </button>
    <button type="button"
      class="sre-toggle-btn${state.mode === 'dynamic' ? ' sre-toggle-btn--active' : ''}"
      data-testid="regression-mode-dynamic"
      data-regression-mode="dynamic">
      ${t('regression.dynamic')}
    </button>
  </div>`;
}

function renderCriterionBadge(example) {
  const criterion = outputCriterion(example);
  if (!criterion) return '';
  return `<div class="sre-criterion">
    <span class="sre-criterion-label">${t('regression.criterionLabel')}</span>
    <code class="sre-criterion-val">${esc(criterion.stmtId)}</code>
    <span class="sre-criterion-sep">&rarr;</span>
    <code class="sre-criterion-val">${esc(criterion.variable)}</code>
  </div>`;
}

function renderGraphPanel(example, sliceSet, impact) {
  return `<div class="sre-graph" data-testid="regression-graph">
    <div class="sre-graph-head">
      <h3 class="sre-col-title">${t('slicing.pdgTitle')}</h3>
      <div class="sre-zoom" role="group" aria-label="${t('slicing.zoomLabel')}">
        <button type="button" class="sre-zoom-btn" data-regression-zoom="out"
          data-testid="regression-zoom-out" aria-label="${t('slicing.zoomOut')}"
          ${state.pdgZoom <= ZOOM_MIN ? 'disabled' : ''}>&minus;</button>
        <span class="sre-zoom-val" data-testid="regression-zoom-val">${Math.round(state.pdgZoom * 100)}%</span>
        <button type="button" class="sre-zoom-btn" data-regression-zoom="in"
          data-testid="regression-zoom-in" aria-label="${t('slicing.zoomIn')}"
          ${state.pdgZoom >= ZOOM_MAX ? 'disabled' : ''}>+</button>
      </div>
    </div>
    <div class="sre-graph-scroll">
      ${renderSlicePdgGraph(example, sliceSet, { secondary: impact, zoom: state.pdgZoom, idPrefix: 'regression' })}
    </div>
  </div>`;
}

function renderTestPanel(example, affected, safe) {
  let body;
  if (!state.changedStmtId) {
    body = `<p class="sre-pick-prompt">${t('regression.pickPrompt')}</p>`;
  } else {
    body = `<ul class="sre-test-list">
      ${example.traces.map((tr) => {
        const label = esc(tr.inputLabel || tr.label || tr.id);
        let badge = '';
        if (affected.has(tr.id)) {
          badge = `<span class="sre-badge sre-badge--rerun">${t('regression.mustRerun')}</span>`;
        } else if (safe.has(tr.id)) {
          badge = `<span class="sre-badge sre-badge--safe">${t('regression.safe')}</span>`;
        }
        return `<li class="sre-test-row" data-testid="regression-test-${esc(tr.id)}">
          <span class="sre-test-label">${label}</span>
          ${badge}
        </li>`;
      }).join('')}
    </ul>`;
  }
  return `<div class="sre-tests" data-testid="regression-tests">
    <h3 class="sre-col-title">${t('regression.testSuiteTitle')}</h3>
    ${body}
  </div>`;
}

function renderMetric(example, affected, safe) {
  if (!state.changedStmtId) {
    return `<div class="sre-metric" data-testid="regression-metric">${t('regression.pickPrompt')}</div>`;
  }
  const N = example.traces.length;
  const A = affected.size;
  const X = N === 0 ? 0 : Math.round(safe.size / N * 100);
  return `<div class="sre-metric" data-testid="regression-metric">${t('regression.metric', { A, N, X })}</div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="sre-quiz-start" data-testid="regression-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    return `<div class="sre-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="regression-quiz-result">
      <p>${correct ? t('regression.quiz.correct') : t('regression.quiz.wrong')}</p>
      <button type="button" class="sre-quiz-close" data-testid="regression-quiz-close">${t('quiz.close')}</button>
    </div>`;
  }
  return `<div class="sre-quiz" data-testid="regression-quiz">
    <p class="sre-quiz-prompt">${t('regression.quiz.prompt')}</p>
    ${['a', 'b', 'c', 'd'].map((k) => `
      <label class="sre-quiz-option">
        <input type="radio" name="sre-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
        ${t('regression.quiz.' + k)}
      </label>`).join('')}
    <button type="button" class="sre-quiz-submit" data-testid="regression-quiz-submit"
      ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
  </div>`;
}

function render() {
  const example = currentExample();
  const criterion = outputCriterion(example);

  let affected = new Set();
  let safe = new Set();
  let impact = new Set();

  if (state.changedStmtId && criterion) {
    const result = affectedTests(example, criterion, state.changedStmtId, state.mode);
    affected = result.affected;
    safe = result.safe;
    impact = result.impact;
  }

  const sliceSet = state.changedStmtId ? new Set([state.changedStmtId]) : new Set();

  root.innerHTML = `
    <div class="sre-wrap">
      <h2 class="sre-title">${t('regression.title')}</h2>
      <p class="sre-desc">${t('regression.desc')}</p>

      <section class="sre-controls">
        ${renderExampleChips()}
        ${renderModeToggle()}
        ${renderCriterionBadge(example)}
      </section>

      <div class="sre-code-wrap">
        <h3 class="sre-col-title">${t('slicing.codeTitle')}</h3>
        <p class="sre-pick-hint">${state.changedStmtId ? '' : t('regression.pickStmtHint')}</p>
        ${renderSliceCodeListing(example, sliceSet, { secondary: impact })}
      </div>

      ${renderMetric(example, affected, safe)}

      <div class="sre-graph-row">
        ${renderGraphPanel(example, sliceSet, impact)}
        ${renderTestPanel(example, affected, safe)}
      </div>

      <section class="sre-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
      </section>
    </div>`;

  bindEvents();
}

function bindEvents() {
  // Example chips
  root.querySelectorAll('[data-regression-example-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const newId = btn.dataset.regressionExampleId;
      if (state.exampleId !== newId) {
        state.exampleId = newId;
        state.changedStmtId = null;
      }
      render();
    });
  });

  // Mode toggle
  root.querySelectorAll('[data-regression-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.mode = btn.dataset.regressionMode;
      render();
    });
  });

  // PDG zoom
  root.querySelectorAll('[data-regression-zoom]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = state.pdgZoom + (btn.dataset.regressionZoom === 'in' ? ZOOM_STEP : -ZOOM_STEP);
      state.pdgZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(next * 100) / 100));
      render();
    });
  });

  // Statement selection — code listing
  root.querySelectorAll('[data-stmt]').forEach((li) => {
    li.addEventListener('click', () => {
      const id = li.dataset.stmt;
      if (state.changedStmtId === id) {
        state.changedStmtId = null;
      } else {
        state.changedStmtId = id;
      }
      render();
    });
  });

  // PDG node selection
  root.querySelectorAll('[data-pdg-node]').forEach((g) => {
    g.addEventListener('click', () => {
      const id = g.dataset.pdgNode;
      if (state.changedStmtId === id) {
        state.changedStmtId = null;
      } else {
        state.changedStmtId = id;
      }
      render();
    });
  });

  // Quiz
  root.querySelector('[data-testid="regression-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="sre-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="regression-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="regression-quiz-close"]')?.addEventListener('click', () => {
    state.quiz = { active: false, phase: 'idle', answer: '' };
    render();
  });
}

export function createSliceRegressionExplorer() {
  state.exampleId = SLICING_EXAMPLES[0].id;
  state.changedStmtId = null;
  state.mode = 'static';
  state.pdgZoom = 1;
  state.quiz = { active: false, phase: 'idle', answer: '' };

  root = document.createElement('div');
  root.dataset.testid = 'slice-regression-explorer';

  onLocaleChange(() => render());
  render();
  return root;
}
