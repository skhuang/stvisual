import { t, onLocaleChange } from '../i18n/index.js';
import { SBST_EXAMPLES } from '../data/sbstExamples.js';
import { geneticAlgorithm, randomSearch } from '../utils/searchBasedTesting.js';

// SBST Branch Explorer — GA branch-search tab.
// Runs geneticAlgorithm on a selected example and replays its history
// generation by generation, alongside a randomSearch baseline.

const state = {
  exampleId: SBST_EXAMPLES[0].id,
  genIndex: 0,
  gaResult: null,
  randomResult: null,
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

function runSearch() {
  const example = currentExample();
  state.gaResult = geneticAlgorithm(example, { seed: 1, budget: 8000, populationSize: 20 });
  state.randomResult = randomSearch(example, { seed: 1, budget: 8000 });
  state.genIndex = 0;
}

// Group history entries by generation number. Returns array indexed by generation.
function getGenerations() {
  if (!state.gaResult) return [];
  const map = new Map();
  for (const entry of state.gaResult.history) {
    const g = entry.generation;
    if (!map.has(g)) map.set(g, []);
    map.get(g).push(entry);
  }
  // sort by generation key
  const sorted = [...map.entries()].sort((a, b) => a[0] - b[0]);
  return sorted.map(([, entries]) => entries);
}

function totalGenerations() {
  return getGenerations().length;
}

function currentGenEntries() {
  const gens = getGenerations();
  return gens[state.genIndex] || [];
}

function firstCoveredGenIndex() {
  const gens = getGenerations();
  for (let i = 0; i < gens.length; i++) {
    const entries = gens[i];
    if (entries.some((e) => e.bestCost === 0)) return i;
  }
  return gens.length - 1;
}

// Build sparkline data: one best-cost value per generation.
function sparklineData() {
  const gens = getGenerations();
  return gens.map((entries) => {
    const last = entries[entries.length - 1];
    return last ? last.bestCost : Infinity;
  });
}

function renderExamplePicker() {
  return `<div class="sbst-branch-chips">
    ${SBST_EXAMPLES.map((ex) => `
      <button type="button"
        class="sbst-branch-chip${state.exampleId === ex.id ? ' sbst-branch-chip--active' : ''}"
        data-testid="sbst-branch-example-${esc(ex.id)}"
        data-sbst-example-id="${esc(ex.id)}">
        ${esc(t(ex.nameKey))}
      </button>`).join('')}
  </div>`;
}

function renderCodePanel() {
  const example = currentExample();
  const lines = example.source.split('\n').map((line, i) => {
    const isTarget = line.includes('← target');
    const cls = isTarget ? 'sbst-branch-code-line sbst-branch-code-line--target' : 'sbst-branch-code-line';
    const n = i + 1;
    return `<span class="${cls}"><span class="sbst-branch-code-lineno">${n}</span>${esc(line)}</span>`;
  }).join('\n');
  return `<div class="sbst-branch-code-panel" data-testid="sbst-branch-code">
    <h3 class="eog-col-title">${esc(t('sbst.branch.codeTitle'))}</h3>
    <pre class="sbst-branch-code-pre">${lines}</pre>
  </div>`;
}

function renderPopulationPanel() {
  const entries = currentGenEntries();
  const example = currentExample();
  const schema = example.inputSchema;

  if (!entries.length) {
    return `<div class="sbst-branch-pop-panel" data-testid="sbst-branch-population"></div>`;
  }

  // Find the lowest cost in this generation's entries
  const minCost = Math.min(...entries.map((e) => e.cost));
  const covered = entries[entries.length - 1].bestCost === 0;
  const coveredBanner = covered
    ? `<div class="sbst-branch-covered" data-testid="sbst-branch-covered">${esc(t('sbst.branch.covered'))}</div>`
    : '';

  const rows = entries.map((entry) => {
    const isBest = entry.cost === minCost;
    const inputsDisplay = schema.map((s, i) => `${esc(s.name)}=${esc(String(entry.individual[i]))}`).join(', ');
    const costDisplay = isFinite(entry.cost) ? entry.cost.toFixed(4) : '∞';
    return `<div class="sbst-branch-pop-row${isBest ? ' sbst-branch-pop-row--best' : ''}">
      <span class="sbst-branch-pop-inputs">${inputsDisplay}</span>
      <span class="sbst-branch-pop-cost">${esc(t('sbst.branch.cost'))}: ${esc(costDisplay)}</span>
    </div>`;
  }).join('');

  return `<div class="sbst-branch-pop-panel" data-testid="sbst-branch-population">
    <h3 class="eog-col-title">${esc(t('sbst.branch.populationTitle'))}</h3>
    ${coveredBanner}
    <div class="sbst-branch-pop-list">${rows}</div>
  </div>`;
}

function renderSparkline() {
  const data = sparklineData();
  if (!data.length) return `<div data-testid="sbst-branch-sparkline"></div>`;

  const W = 300, H = 60, pad = 4;
  // Filter out Infinity for range calculation; treat Infinity as max finite + 1
  const finite = data.filter(isFinite);
  const maxVal = finite.length ? Math.max(...finite) : 1;
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const points = data.map((v, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (W - pad * 2);
    const normalised = isFinite(v) ? (v - minVal) / range : 1;
    const y = pad + normalised * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  // Highlight current generation point
  const curEntry = data[state.genIndex];
  const curX = pad + (state.genIndex / Math.max(data.length - 1, 1)) * (W - pad * 2);
  const curNorm = isFinite(curEntry) ? (curEntry - minVal) / range : 1;
  const curY = pad + curNorm * (H - pad * 2);

  return `<div class="sbst-branch-sparkline-wrap" data-testid="sbst-branch-sparkline">
    <h3 class="eog-col-title">${esc(t('sbst.branch.sparklineTitle'))}</h3>
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="sbst-branch-svg">
      <polyline points="${points}" fill="none" stroke="var(--app-primary-strong, #4f46e5)" stroke-width="1.5"/>
      <circle cx="${curX.toFixed(1)}" cy="${curY.toFixed(1)}" r="4"
        fill="var(--app-primary-strong, #4f46e5)" stroke="#fff" stroke-width="1.5"/>
    </svg>
  </div>`;
}

function renderRandomPanel() {
  if (!state.randomResult) return '';
  const r = state.randomResult;
  const costDisplay = isFinite(r.bestCost) ? r.bestCost.toFixed(4) : '∞';
  const statusKey = r.covered ? 'sbst.branch.randomCovered' : 'sbst.branch.randomNotCovered';
  return `<div class="sbst-branch-random-panel" data-testid="sbst-branch-random">
    <h3 class="eog-col-title">${esc(t('sbst.branch.randomTitle'))}</h3>
    <p class="sbst-branch-random-cost">${esc(t('sbst.branch.bestCost'))}: ${esc(costDisplay)}</p>
    <p class="sbst-branch-random-status">${esc(t(statusKey))}</p>
  </div>`;
}

function renderStepControls() {
  const total = totalGenerations();
  const isLast = state.genIndex >= total - 1;
  return `<div class="eog-step-controls">
    <span class="eog-step-counter">${state.genIndex + 1} / ${total}</span>
    <button type="button" class="eog-btn" data-testid="sbst-branch-reset">${esc(t('sbst.branch.reset'))}</button>
    <button type="button" class="eog-btn eog-btn--next" data-testid="sbst-branch-next"
      ${isLast ? 'disabled' : ''}>${esc(t('sbst.branch.next'))}</button>
    <button type="button" class="eog-btn eog-btn--run" data-testid="sbst-branch-run"
      ${isLast ? 'disabled' : ''}>${esc(t('sbst.branch.run'))}</button>
  </div>`;
}

// The quiz question: why does GA find the nested target faster than random?
const QUIZ_PROMPT_KEY = 'sbst.branch.quiz.prompt';
const QUIZ_OPTIONS = ['option.gradient', 'option.luck', 'option.larger', 'option.random'];
const QUIZ_ANSWER = 'option.gradient';

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="eog-quiz-start" data-testid="sbst-branch-quiz-start">${esc(t('quiz.start'))}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === QUIZ_ANSWER;
    return `<div class="eog-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="sbst-branch-quiz-result">
      <p>${correct ? esc(t('quiz.correct')) : esc(t('quiz.wrong'))}</p>
      <button type="button" data-testid="sbst-branch-quiz-close">${esc(t('quiz.close'))}</button>
    </div>`;
  }
  return `<div class="eog-quiz" data-testid="sbst-branch-quiz">
    <p class="eog-quiz-prompt">${esc(t(QUIZ_PROMPT_KEY))}</p>
    ${QUIZ_OPTIONS.map((k) => `
      <label class="eog-quiz-option">
        <input type="radio" name="sbst-branch-quiz" value="${esc(k)}" ${state.quiz.answer === k ? 'checked' : ''}>
        ${esc(t(`sbst.branch.quiz.${k}`))}
      </label>`).join('')}
    <button type="button" data-testid="sbst-branch-quiz-submit"
      ${!state.quiz.answer ? 'disabled' : ''}>${esc(t('quiz.submit'))}</button>
  </div>`;
}

function render() {
  root.innerHTML = `
    <div class="sbst-branch-wrap">
      <h2 class="eog-title">${esc(t('section.sbst.title'))}</h2>
      ${renderExamplePicker()}
      <div class="sbst-branch-panels-row">
        ${renderCodePanel()}
        ${renderPopulationPanel()}
      </div>
      ${renderSparkline()}
      ${renderRandomPanel()}
      ${renderStepControls()}
      <section class="eog-self-test">
        <h3>${esc(t('quiz.title'))}</h3>
        ${renderQuiz()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  // Example picker chips
  root.querySelectorAll('[data-sbst-example-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.exampleId = btn.dataset.sbstExampleId;
      runSearch();
      render();
    });
  });

  // Step controls
  root.querySelector('[data-testid="sbst-branch-next"]')?.addEventListener('click', () => {
    const total = totalGenerations();
    if (state.genIndex < total - 1) {
      state.genIndex += 1;
      render();
    }
  });

  root.querySelector('[data-testid="sbst-branch-run"]')?.addEventListener('click', () => {
    state.genIndex = firstCoveredGenIndex();
    render();
  });

  root.querySelector('[data-testid="sbst-branch-reset"]')?.addEventListener('click', () => {
    state.genIndex = 0;
    render();
  });

  // Quiz
  root.querySelector('[data-testid="sbst-branch-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="sbst-branch-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="sbst-branch-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="sbst-branch-quiz-close"]')?.addEventListener('click', () => {
    state.quiz = { active: false, phase: 'idle', answer: '' };
    render();
  });
}

export function createSbstBranchExplorer() {
  state.exampleId = SBST_EXAMPLES[0].id;
  state.genIndex = 0;
  state.gaResult = null;
  state.randomResult = null;
  state.quiz = { active: false, phase: 'idle', answer: '' };

  root = document.createElement('div');
  root.dataset.testid = 'sbst-branch-explorer';

  runSearch();
  onLocaleChange(() => render());
  render();
  return root;
}
