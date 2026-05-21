import { t, onLocaleChange } from '../i18n/index.js';
import { SBST_EXAMPLES } from '../data/sbstExamples.js';
import { wholeSuiteGA } from '../utils/searchBasedTesting.js';

// SBST Suite Explorer — whole-suite evolution tab.
// Runs wholeSuiteGA on a selected example and replays its history
// generation by generation, showing suite fitness and coverage.

const state = {
  exampleId: SBST_EXAMPLES[0].id,
  genIndex: 0,
  result: null,
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

function runGA() {
  const example = currentExample();
  state.result = wholeSuiteGA(example, { seed: 1, budget: 5000, populationSize: 16, suiteSize: 4 });
  state.genIndex = 0;
}

// Group history entries by generation number. Returns array indexed by generation.
function getGenerations() {
  if (!state.result) return [];
  const map = new Map();
  for (const entry of state.result.history) {
    const g = entry.generation;
    if (!map.has(g)) map.set(g, []);
    map.get(g).push(entry);
  }
  const sorted = [...map.entries()].sort((a, b) => a[0] - b[0]);
  return sorted.map(([, entries]) => entries);
}

function totalGenerations() {
  return getGenerations().length;
}

// The last history entry of the current generation (holds the running best).
function currentGenLastEntry() {
  const gens = getGenerations();
  const entries = gens[state.genIndex] || [];
  return entries[entries.length - 1] || null;
}

function firstCoveredGenIndex() {
  const gens = getGenerations();
  for (let i = 0; i < gens.length; i++) {
    const entries = gens[i];
    const last = entries[entries.length - 1];
    if (last && last.coverage >= 1) return i;
  }
  return gens.length - 1;
}

function renderExamplePicker() {
  return `<div class="sbst-suite-chips">
    ${SBST_EXAMPLES.map((ex) => `
      <button type="button"
        class="sbst-suite-chip${state.exampleId === ex.id ? ' sbst-suite-chip--active' : ''}"
        data-testid="sbst-suite-example-${esc(ex.id)}"
        data-sbst-suite-example-id="${esc(ex.id)}">
        ${esc(t(ex.nameKey))}
      </button>`).join('')}
  </div>`;
}

function renderCodePanel() {
  const example = currentExample();
  const lines = example.source.split('\n').map((line, i) => {
    const n = i + 1;
    return `<span class="sbst-suite-code-line"><span class="sbst-suite-code-lineno">${n}</span>${esc(line)}</span>`;
  }).join('\n');
  return `<div class="sbst-suite-code-panel" data-testid="sbst-suite-code">
    <h3 class="eog-col-title">${esc(t('sbst.suite.codeTitle'))}</h3>
    <pre class="sbst-suite-code-pre">${lines}</pre>
  </div>`;
}

function renderCoverageGauge() {
  const entry = currentGenLastEntry();
  const coverage = entry ? entry.coverage : 0;
  const pct = Math.round(coverage * 100);
  return `<div class="sbst-suite-coverage-panel" data-testid="sbst-suite-coverage">
    <div class="sbst-suite-coverage-label">${esc(t('sbst.suite.coverage'))}: <strong>${pct}%</strong></div>
    <div class="sbst-suite-coverage-bar-bg">
      <div class="sbst-suite-coverage-bar-fill" style="width: ${pct}%"></div>
    </div>
  </div>`;
}

function renderTestList() {
  const entry = currentGenLastEntry();
  const example = currentExample();
  const schema = example.inputSchema;

  if (!entry || !entry.bestSuite) {
    return `<div class="sbst-suite-tests-panel" data-testid="sbst-suite-tests"></div>`;
  }

  const suite = entry.bestSuite;
  const coveredCount = entry ? Math.round(entry.coverage * (example.branches ? example.branches.length * 2 : 0)) : 0;

  // Derive total goal count from result
  const totalGoals = state.result ? Math.round(entry.coverage > 0
    ? (coveredCount / entry.coverage)
    : (example.branches ? example.branches.length * 2 : 0)) : 0;

  const rows = suite.map((test, idx) => {
    const inputs = schema.map((s, i) => `${esc(s.name)}=${esc(String(test[i]))}`).join(', ');
    return `<div class="sbst-suite-test-row">
      <span class="sbst-suite-test-label">${esc(t('sbst.suite.test'))} ${idx + 1}</span>
      <span class="sbst-suite-test-inputs">${inputs}</span>
    </div>`;
  }).join('');

  const coveredInfo = `<div class="sbst-suite-tests-meta">
    ${esc(t('sbst.suite.covered'))}: ${esc(String(Math.round(entry.coverage * totalGoals)))} / ${esc(String(totalGoals))} ${esc(t('sbst.suite.goals'))}
  </div>`;

  return `<div class="sbst-suite-tests-panel" data-testid="sbst-suite-tests">
    <h3 class="eog-col-title">${esc(t('sbst.suite.suiteTitle'))}</h3>
    ${coveredInfo}
    <div class="sbst-suite-tests-list">${rows}</div>
  </div>`;
}

function renderSuccessBanner() {
  const entry = currentGenLastEntry();
  if (!entry || entry.coverage < 1) return '';
  return `<div class="sbst-suite-success-banner" data-testid="sbst-suite-covered">
    ${esc(t('sbst.suite.fullCoverage'))}
  </div>`;
}

function renderMinimisedSuite() {
  const entry = currentGenLastEntry();
  if (!entry || entry.coverage < 1 || !state.result) return '';
  const example = currentExample();
  const schema = example.inputSchema;
  const miniSuite = state.result.minimisedSuite;
  if (!miniSuite || !miniSuite.length) return '';

  const rows = miniSuite.map((test, idx) => {
    const inputs = schema.map((s, i) => `${esc(s.name)}=${esc(String(test[i]))}`).join(', ');
    return `<div class="sbst-suite-mini-row">
      <span class="sbst-suite-mini-label">${esc(t('sbst.suite.test'))} ${idx + 1}</span>
      <span class="sbst-suite-mini-inputs">${inputs}</span>
    </div>`;
  }).join('');

  return `<div class="sbst-suite-mini-panel" data-testid="sbst-suite-minimised">
    <h3 class="eog-col-title">${esc(t('sbst.suite.minimisedTitle'))}</h3>
    <p class="sbst-suite-mini-meta">${esc(t('sbst.suite.minimisedDesc'))} (${esc(String(miniSuite.length))} ${esc(t('sbst.suite.tests'))})</p>
    <div class="sbst-suite-mini-list">${rows}</div>
  </div>`;
}

function renderStepControls() {
  const total = totalGenerations();
  const isLast = state.genIndex >= total - 1;
  return `<div class="eog-step-controls">
    <span class="eog-step-counter">${state.genIndex + 1} / ${total}</span>
    <button type="button" class="eog-btn" data-testid="sbst-suite-reset">${esc(t('sbst.suite.reset'))}</button>
    <button type="button" class="eog-btn eog-btn--next" data-testid="sbst-suite-next"
      ${isLast ? 'disabled' : ''}>${esc(t('sbst.suite.next'))}</button>
    <button type="button" class="eog-btn eog-btn--run" data-testid="sbst-suite-run">${esc(t('sbst.suite.run'))}</button>
  </div>`;
}

// Quiz: one authored question about whole-suite fitness vs. single-branch fitness.
const QUIZ_PROMPT_KEY = 'sbst.suite.quiz.prompt';
const QUIZ_OPTIONS = ['option.allGoals', 'option.singleGoal', 'option.random', 'option.coverage'];
const QUIZ_ANSWER = 'option.allGoals';

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="eog-quiz-start" data-testid="sbst-suite-quiz-start">${esc(t('quiz.start'))}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === QUIZ_ANSWER;
    return `<div class="eog-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="sbst-suite-quiz-result">
      <p>${correct ? esc(t('quiz.correct')) : esc(t('quiz.wrong'))}</p>
      <button type="button" data-testid="sbst-suite-quiz-close">${esc(t('quiz.close'))}</button>
    </div>`;
  }
  return `<div class="eog-quiz" data-testid="sbst-suite-quiz">
    <p class="eog-quiz-prompt">${esc(t(QUIZ_PROMPT_KEY))}</p>
    ${QUIZ_OPTIONS.map((k) => `
      <label class="eog-quiz-option">
        <input type="radio" name="sbst-suite-quiz" value="${esc(k)}" ${state.quiz.answer === k ? 'checked' : ''}>
        ${esc(t(`sbst.suite.quiz.${k}`))}
      </label>`).join('')}
    <button type="button" data-testid="sbst-suite-quiz-submit"
      ${!state.quiz.answer ? 'disabled' : ''}>${esc(t('quiz.submit'))}</button>
  </div>`;
}

function render() {
  root.innerHTML = `
    <div class="sbst-suite-wrap">
      <h2 class="eog-title">${esc(t('section.sbst.title'))}</h2>
      ${renderExamplePicker()}
      <div class="sbst-suite-panels-row">
        ${renderCodePanel()}
        <div class="sbst-suite-right-col">
          ${renderCoverageGauge()}
          ${renderTestList()}
        </div>
      </div>
      ${renderSuccessBanner()}
      ${renderMinimisedSuite()}
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
  root.querySelectorAll('[data-sbst-suite-example-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.exampleId = btn.dataset.sbstSuiteExampleId;
      runGA();
      render();
    });
  });

  // Step controls
  root.querySelector('[data-testid="sbst-suite-next"]')?.addEventListener('click', () => {
    const total = totalGenerations();
    if (state.genIndex < total - 1) {
      state.genIndex += 1;
      render();
    }
  });

  root.querySelector('[data-testid="sbst-suite-run"]')?.addEventListener('click', () => {
    state.genIndex = firstCoveredGenIndex();
    render();
  });

  root.querySelector('[data-testid="sbst-suite-reset"]')?.addEventListener('click', () => {
    state.genIndex = 0;
    render();
  });

  // Quiz
  root.querySelector('[data-testid="sbst-suite-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="sbst-suite-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="sbst-suite-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="sbst-suite-quiz-close"]')?.addEventListener('click', () => {
    state.quiz = { active: false, phase: 'idle', answer: '' };
    render();
  });
}

export function createSbstSuiteExplorer() {
  state.exampleId = SBST_EXAMPLES[0].id;
  state.genIndex = 0;
  state.result = null;
  state.quiz = { active: false, phase: 'idle', answer: '' };

  root = document.createElement('div');
  root.dataset.testid = 'sbst-suite-explorer';

  runGA();
  onLocaleChange(() => render());
  render();
  return root;
}
