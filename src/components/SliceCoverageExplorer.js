import { t, onLocaleChange } from '../i18n/index.js';
import { SLICING_EXAMPLES } from '../data/slicingExamples.js';
import { renderSliceCodeListing, renderSlicePdgGraph } from './SlicePdgView.js';
import { backwardSlice, sliceCoverage } from '../utils/slicing.js';

// N3 — Slice Coverage Explorer.
// The backward slice of the example's output statement is the coverage
// target. The learner toggles test traces and watches slice coverage
// beside plain statement coverage, with uncovered slice statements
// surfaced as gaps.

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

const state = {
  exampleId: SLICING_EXAMPLES[0].id,
  activeTraceIds: new Set(),   // populated on first render / example change
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

function allTraceIds(example) {
  return new Set(example.traces.map((tr) => tr.id));
}

// The output statement of the example (kind:'output').
function outputStatement(example) {
  return example.statements.find((s) => s.kind === 'output') || null;
}

// Backward slice from the output statement (target coverage criterion).
function computeSlice(example) {
  const outStmt = outputStatement(example);
  if (!outStmt) {
    console.warn(`[SliceCoverageExplorer] example "${example.id}" has no output statement — slice will be empty`);
    return new Set();
  }
  const variable = outStmt.uses[0];
  if (!variable) {
    console.warn(`[SliceCoverageExplorer] example "${example.id}" output statement has no uses — slice will be empty`);
    return new Set();
  }
  return backwardSlice(example, { stmtId: outStmt.id, variable });
}

// Union of steps across all active traces.
function computeExecuted(example) {
  const executed = new Set();
  for (const tr of example.traces) {
    if (state.activeTraceIds.has(tr.id)) {
      for (const s of tr.steps) executed.add(s);
    }
  }
  return executed;
}

// ── Sub-renderers ─────────────────────────────────────────────────────────────

function renderExampleChips() {
  return `<div class="sce-chip-bar" data-testid="sce-example-chips">
    ${SLICING_EXAMPLES.map((ex) => `
      <button type="button"
        class="sce-chip${state.exampleId === ex.id ? ' sce-chip--active' : ''}"
        data-testid="coverage-example-${ex.id}"
        data-coverage-example-id="${ex.id}">
        ${t(ex.titleKey)}
      </button>`).join('')}
  </div>`;
}

function renderTraceChips(example) {
  return `<div class="sce-chip-bar sce-trace-bar">
    <span class="sce-toggle-label">${t('coverage.traceLabel')}</span>
    ${example.traces.map((tr) => {
      const active = state.activeTraceIds.has(tr.id);
      const label = esc(tr.inputLabel || tr.label || tr.id);
      return `<button type="button"
        class="sce-chip${active ? ' sce-chip--active' : ''}"
        data-testid="coverage-trace-${tr.id}"
        data-coverage-trace-id="${tr.id}">
        ${label}
      </button>`;
    }).join('')}
  </div>`;
}

function renderMetrics(cov, example, executed) {
  const stmtPct = example.statements.length === 0
    ? 100
    : Math.round(executed.size / example.statements.length * 100);
  return `<div class="sce-metrics" data-testid="coverage-metrics">
    <div class="sce-metric-row">
      <span class="sce-metric-label">${t('coverage.sliceCoverage')}</span>
      <div class="sce-meter">
        <div class="sce-meter-fill" style="width:${cov.pct}%"></div>
      </div>
      <span class="sce-metric-pct" data-testid="coverage-slice-pct">${cov.pct}%</span>
      <span class="sce-metric-detail">(${cov.covered.size}/${cov.covered.size + cov.uncovered.size})</span>
    </div>
    <div class="sce-metric-row">
      <span class="sce-metric-label">${t('coverage.stmtCoverage')}</span>
      <div class="sce-meter">
        <div class="sce-meter-fill sce-meter-fill--stmt" style="width:${stmtPct}%"></div>
      </div>
      <span class="sce-metric-pct" data-testid="coverage-stmt-pct">${stmtPct}%</span>
      <span class="sce-metric-detail">(${executed.size}/${example.statements.length})</span>
    </div>
  </div>`;
}

function renderGaps(cov, example, slice, executed) {
  const uncoveredStmts = example.statements.filter((s) => cov.uncovered.has(s.id));
  // Statements executed but outside the slice
  const outsideSlice = example.statements.filter(
    (s) => executed.has(s.id) && !slice.has(s.id),
  );

  let gapBody;
  if (cov.uncovered.size === 0) {
    gapBody = `<p class="sce-gaps-ok">${t('coverage.fullyCovered')}</p>`;
  } else {
    gapBody = `<ul class="sce-gap-items">
      ${uncoveredStmts.map((s) => `
        <li class="sce-gap-item">
          <code class="sce-gap-id">${esc(s.id)}</code>
          <span class="sce-gap-text">${esc(s.text)}</span>
        </li>`).join('')}
    </ul>`;
  }

  let outsideBody = '';
  if (outsideSlice.length) {
    outsideBody = `<div class="sce-outside">
      <span class="sce-outside-label">${t('coverage.outsideSlice')}</span>
      ${outsideSlice.map((s) => `<code class="sce-outside-id">${esc(s.id)}</code>`).join(' ')}
    </div>`;
  }

  return `<div class="sce-gaps" data-testid="coverage-gaps">
    <h3 class="sce-col-title">${t('coverage.gapsTitle')}</h3>
    ${gapBody}
    ${outsideBody}
  </div>`;
}

function renderGraphPanel(example, cov) {
  return `<div class="sce-graph" data-testid="coverage-graph">
    <div class="sce-graph-head">
      <h3 class="sce-col-title">${t('slicing.pdgTitle')}</h3>
      <div class="sce-zoom" role="group" aria-label="${t('slicing.zoomLabel')}">
        <button type="button" class="sce-zoom-btn" data-coverage-zoom="out"
          data-testid="coverage-zoom-out" aria-label="${t('slicing.zoomOut')}"
          ${state.pdgZoom <= ZOOM_MIN ? 'disabled' : ''}>&minus;</button>
        <span class="sce-zoom-val" data-testid="coverage-zoom-val">${Math.round(state.pdgZoom * 100)}%</span>
        <button type="button" class="sce-zoom-btn" data-coverage-zoom="in"
          data-testid="coverage-zoom-in" aria-label="${t('slicing.zoomIn')}"
          ${state.pdgZoom >= ZOOM_MAX ? 'disabled' : ''}>+</button>
      </div>
    </div>
    <div class="sce-graph-scroll">
      ${renderSlicePdgGraph(example, cov.uncovered, { secondary: cov.covered, zoom: state.pdgZoom, idPrefix: 'coverage' })}
    </div>
  </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="sce-quiz-start" data-testid="coverage-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    return `<div class="sce-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="coverage-quiz-result">
      <p>${correct ? t('coverage.quiz.correct') : t('coverage.quiz.wrong')}</p>
      <button type="button" class="sce-quiz-close" data-testid="coverage-quiz-close">${t('quiz.close')}</button>
    </div>`;
  }
  return `<div class="sce-quiz" data-testid="coverage-quiz">
    <p class="sce-quiz-prompt">${t('coverage.quiz.prompt')}</p>
    ${['a', 'b', 'c', 'd'].map((k) => `
      <label class="sce-quiz-option">
        <input type="radio" name="sce-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
        ${t('coverage.quiz.' + k)}
      </label>`).join('')}
    <button type="button" class="sce-quiz-submit" data-testid="coverage-quiz-submit"
      ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
  </div>`;
}

function render() {
  const example = currentExample();
  const slice = computeSlice(example);
  const executed = computeExecuted(example);
  const cov = sliceCoverage(slice, executed);

  root.innerHTML = `
    <div class="sce-wrap">
      <h2 class="sce-title">${t('coverage.title')}</h2>
      <p class="sce-desc">${t('coverage.desc')}</p>

      <section class="sce-controls">
        ${renderExampleChips()}
        ${renderTraceChips(example)}
      </section>

      ${renderMetrics(cov, example, executed)}

      <div class="sce-code-wrap">
        <h3 class="sce-col-title">${t('slicing.codeTitle')}</h3>
        ${renderSliceCodeListing(example, cov.uncovered, { secondary: cov.covered })}
      </div>

      <div class="sce-graph-row">
        ${renderGraphPanel(example, cov)}
        ${renderGaps(cov, example, slice, executed)}
      </div>

      <section class="sce-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
      </section>
    </div>`;

  bindEvents();
}

function bindEvents() {
  // Example chips
  root.querySelectorAll('[data-coverage-example-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const newId = btn.dataset.coverageExampleId;
      if (state.exampleId !== newId) {
        state.exampleId = newId;
        const ex = currentExample();
        state.activeTraceIds = allTraceIds(ex);
      }
      render();
    });
  });

  // Trace toggle chips
  root.querySelectorAll('[data-coverage-trace-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const trId = btn.dataset.coverageTraceId;
      if (state.activeTraceIds.has(trId)) {
        state.activeTraceIds.delete(trId);
      } else {
        state.activeTraceIds.add(trId);
      }
      render();
    });
  });

  // PDG zoom
  root.querySelectorAll('[data-coverage-zoom]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = state.pdgZoom + (btn.dataset.coverageZoom === 'in' ? ZOOM_STEP : -ZOOM_STEP);
      state.pdgZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(next * 100) / 100));
      render();
    });
  });

  // Quiz
  root.querySelector('[data-testid="coverage-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="sce-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="coverage-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="coverage-quiz-close"]')?.addEventListener('click', () => {
    state.quiz = { active: false, phase: 'idle', answer: '' };
    render();
  });
}

export function createSliceCoverageExplorer() {
  const firstExample = SLICING_EXAMPLES[0];
  state.exampleId = firstExample.id;
  state.activeTraceIds = allTraceIds(firstExample);
  state.pdgZoom = 1;
  state.quiz = { active: false, phase: 'idle', answer: '' };

  root = document.createElement('div');
  root.dataset.testid = 'slice-coverage-explorer';

  onLocaleChange(() => render());
  render();
  return root;
}
