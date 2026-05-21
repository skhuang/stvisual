import { t, onLocaleChange } from '../i18n/index.js';
import { SBST_EXAMPLES } from '../data/sbstExamples.js';
import { randomSearch, hillClimb, geneticAlgorithm } from '../utils/searchBasedTesting.js';

// SBST Compare Explorer — metaheuristic comparison tab.
// Runs randomSearch, hillClimb and geneticAlgorithm side-by-side on a selected
// example and renders a best-cost-vs-evaluations chart plus strategy panels.

const state = {
  exampleId: SBST_EXAMPLES[0].id,
  results: { random: null, hillClimb: null, genetic: null },
  quiz: { active: false, phase: 'idle', answer: '' },
};

let root;

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function currentExample() {
  return SBST_EXAMPLES.find((e) => e.id === state.exampleId) || SBST_EXAMPLES[0];
}

// For multimodal, scan seeds 1..30 and pick the first where hillClimb gets
// stuck without covering the target (illustrating the local-optimum trap).
function pickHillClimbSeed(example) {
  if (example.id !== 'multimodal') return 1;
  for (let seed = 1; seed <= 30; seed++) {
    const r = hillClimb(example, { seed, budget: 8000 });
    if (r.stuck && !r.covered) return seed;
  }
  return 1;
}

function runAll() {
  const example = currentExample();
  const hcSeed = pickHillClimbSeed(example);
  state.results.random = randomSearch(example, { seed: 1, budget: 8000 });
  state.results.hillClimb = hillClimb(example, { seed: hcSeed, budget: 8000 });
  state.results.genetic = geneticAlgorithm(example, { seed: 1, budget: 8000, populationSize: 20 });
}

function renderExamplePicker() {
  return `<div class="sbst-compare-chips">
    ${SBST_EXAMPLES.map((ex) => `
      <button type="button"
        class="sbst-compare-chip${state.exampleId === ex.id ? ' sbst-compare-chip--active' : ''}"
        data-testid="sbst-compare-example-${esc(ex.id)}"
        data-sbst-compare-example-id="${esc(ex.id)}">
        ${esc(t(ex.nameKey))}
      </button>`).join('')}
  </div>`;
}

function formatCoverage(result) {
  if (!result) return esc(t('sbst.compare.noResult'));
  if (result.covered) {
    const evalCount = result.history.length;
    return `${esc(t('sbst.compare.covered'))} (${esc(String(evalCount))} ${esc(t('sbst.compare.evaluations'))})`;
  }
  return esc(t('sbst.compare.budgetExhausted'));
}

function formatCost(result) {
  if (!result) return '—';
  const c = result.bestCost;
  return isFinite(c) ? esc(c.toFixed(4)) : '∞';
}

function renderStrategyPanel(key, testid, nameKey) {
  const result = state.results[key];
  const stuckBadge = (key === 'hillClimb' && result && result.stuck)
    ? `<span class="sbst-compare-stuck-badge">${esc(t('sbst.compare.stuck'))}</span>`
    : '';
  return `<div class="sbst-compare-panel" data-testid="${esc(testid)}">
    <h3 class="sbst-compare-panel-title">${esc(t(nameKey))} ${stuckBadge}</h3>
    <p class="sbst-compare-panel-status">${formatCoverage(result)}</p>
    <p class="sbst-compare-panel-cost">${esc(t('sbst.compare.bestCost'))}: ${formatCost(result)}</p>
  </div>`;
}

function renderChart() {
  const { random: r, hillClimb: hc, genetic: ga } = state.results;
  if (!r || !hc || !ga) {
    return `<div data-testid="sbst-compare-chart"></div>`;
  }

  const W = 400, H = 80, pad = 6;
  const innerW = W - pad * 2;
  const innerH = H - pad * 2;

  // Each history entry has a bestCost value. Build best-cost series indexed by evaluation.
  function buildSeries(history) {
    return history.map((e) => e.bestCost);
  }

  const seriesR = buildSeries(r.history);
  const seriesHC = buildSeries(hc.history);
  const seriesGA = buildSeries(ga.history);

  // Determine global range for y-axis (exclude Infinity)
  const allFinite = [
    ...seriesR, ...seriesHC, ...seriesGA,
  ].filter(isFinite);
  const maxVal = allFinite.length ? Math.max(...allFinite) : 1;
  const minVal = 0;
  const range = maxVal - minVal || 1;

  function toPoints(series) {
    const n = series.length;
    return series.map((v, i) => {
      const x = pad + (i / Math.max(n - 1, 1)) * innerW;
      const normalised = isFinite(v) ? (v - minVal) / range : 1;
      const y = pad + normalised * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  const ptsR = toPoints(seriesR);
  const ptsHC = toPoints(seriesHC);
  const ptsGA = toPoints(seriesGA);

  return `<div class="sbst-compare-chart-wrap" data-testid="sbst-compare-chart">
    <h3 class="eog-col-title">${esc(t('sbst.compare.chartTitle'))}</h3>
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="sbst-compare-svg">
      <polyline points="${ptsR}"  fill="none" stroke="#94a3b8" stroke-width="1.5" opacity="0.85"/>
      <polyline points="${ptsHC}" fill="none" stroke="#f59e0b" stroke-width="1.5" opacity="0.85"/>
      <polyline points="${ptsGA}" fill="none" stroke="#22c55e" stroke-width="2"/>
    </svg>
    <div class="sbst-compare-chart-legend">
      <span class="sbst-compare-legend-item sbst-compare-legend-item--random">${esc(t('sbst.compare.legendRandom'))}</span>
      <span class="sbst-compare-legend-item sbst-compare-legend-item--hillclimb">${esc(t('sbst.compare.legendHillClimb'))}</span>
      <span class="sbst-compare-legend-item sbst-compare-legend-item--genetic">${esc(t('sbst.compare.legendGenetic'))}</span>
    </div>
  </div>`;
}

function renderTakeaway() {
  return `<p class="sbst-compare-takeaway" data-testid="sbst-compare-takeaway">
    ${esc(t('sbst.compare.takeaway'))}
  </p>`;
}

function renderControls() {
  return `<div class="eog-step-controls">
    <button type="button" class="eog-btn eog-btn--run" data-testid="sbst-compare-run">${esc(t('sbst.compare.run'))}</button>
    <button type="button" class="eog-btn eog-btn--reset" data-testid="sbst-compare-reset">${esc(t('sbst.compare.reset'))}</button>
  </div>`;
}

// Quiz: one multiple-choice question about why HC underperforms GA
const QUIZ_PROMPT_KEY = 'sbst.compare.quiz.prompt';
const QUIZ_OPTIONS = ['option.localOpt', 'option.budget', 'option.random', 'option.gradient'];
const QUIZ_ANSWER = 'option.localOpt';

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="eog-quiz-start" data-testid="sbst-compare-quiz-start">${esc(t('quiz.start'))}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === QUIZ_ANSWER;
    return `<div class="eog-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="sbst-compare-quiz-result">
      <p>${correct ? esc(t('quiz.correct')) : esc(t('quiz.wrong'))}</p>
      <button type="button" data-testid="sbst-compare-quiz-close">${esc(t('quiz.close'))}</button>
    </div>`;
  }
  return `<div class="eog-quiz" data-testid="sbst-compare-quiz">
    <p class="eog-quiz-prompt">${esc(t(QUIZ_PROMPT_KEY))}</p>
    ${QUIZ_OPTIONS.map((k) => `
      <label class="eog-quiz-option">
        <input type="radio" name="sbst-compare-quiz" value="${esc(k)}" ${state.quiz.answer === k ? 'checked' : ''}>
        ${esc(t(`sbst.compare.quiz.${k}`))}
      </label>`).join('')}
    <button type="button" data-testid="sbst-compare-quiz-submit"
      ${!state.quiz.answer ? 'disabled' : ''}>${esc(t('quiz.submit'))}</button>
  </div>`;
}

function render() {
  root.innerHTML = `
    <div class="sbst-compare-wrap">
      <h2 class="eog-title">${esc(t('section.sbst.title'))}</h2>
      ${renderExamplePicker()}
      <div class="sbst-compare-panels-row">
        ${renderStrategyPanel('random',    'sbst-compare-random',    'sbst.compare.strategyRandom')}
        ${renderStrategyPanel('hillClimb', 'sbst-compare-hillclimb', 'sbst.compare.strategyHillClimb')}
        ${renderStrategyPanel('genetic',   'sbst-compare-genetic',   'sbst.compare.strategyGenetic')}
      </div>
      ${renderChart()}
      ${renderTakeaway()}
      ${renderControls()}
      <section class="eog-self-test">
        <h3>${esc(t('quiz.title'))}</h3>
        ${renderQuiz()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  // Example picker chips
  root.querySelectorAll('[data-sbst-compare-example-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.exampleId = btn.dataset.sbstCompareExampleId;
      runAll();
      render();
    });
  });

  // Run button — re-run all strategies for current example
  root.querySelector('[data-testid="sbst-compare-run"]')?.addEventListener('click', () => {
    runAll();
    render();
  });

  // Reset button — go back to first example and re-run
  root.querySelector('[data-testid="sbst-compare-reset"]')?.addEventListener('click', () => {
    state.exampleId = SBST_EXAMPLES[0].id;
    state.quiz = { active: false, phase: 'idle', answer: '' };
    runAll();
    render();
  });

  // Quiz
  root.querySelector('[data-testid="sbst-compare-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="sbst-compare-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="sbst-compare-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="sbst-compare-quiz-close"]')?.addEventListener('click', () => {
    state.quiz = { active: false, phase: 'idle', answer: '' };
    render();
  });
}

export function createSbstCompareExplorer() {
  state.exampleId = SBST_EXAMPLES[0].id;
  state.results = { random: null, hillClimb: null, genetic: null };
  state.quiz = { active: false, phase: 'idle', answer: '' };

  root = document.createElement('div');
  root.dataset.testid = 'sbst-compare-explorer';

  runAll();
  onLocaleChange(() => render());
  render();
  return root;
}
