import { t, onLocaleChange } from '../i18n/index.js';
import { TDD_KATAS } from '../data/tddKatas.js';

// N? — TDD Cycle Explorer.
// Steps through an authored TDD kata — test list, code and suite panels
// plus a red-green-refactor ring. A predict-mode toggle turns each step
// into a phase-prediction self-test.

const state = {
  kataId: TDD_KATAS[0].id,
  stepIndex: 0,
  predict: true,
  prediction: null,
  predictResult: null, // 'correct' | 'incorrect' | null
  quiz: { active: false, phase: 'idle', answer: '' },
};

let root;

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function currentKata() {
  return TDD_KATAS.find((k) => k.id === state.kataId) || TDD_KATAS[0];
}

// ── Sub-renderers ──────────────────────────────────────────────────────────────

function renderKataChips() {
  return `<div class="tdc-chip-bar" data-testid="tdd-kata-chips">
    ${TDD_KATAS.map((kata) => `
      <button type="button"
        class="tdc-chip${state.kataId === kata.id ? ' tdc-chip--active' : ''}"
        data-testid="tdd-kata-${esc(kata.id)}"
        data-tdc-kata-id="${esc(kata.id)}">
        ${t(kata.titleKey)}
      </button>`).join('')}
  </div>`;
}

function renderPhaseRing(step) {
  const phases = ['red', 'green', 'refactor'];
  return `<div class="tdc-phase-ring" data-testid="tdd-phase-ring">
    ${phases.map((ph) => `
      <div class="tdc-phase-node tdc-phase-node--${ph}${step.phase === ph ? ' tdc-phase-node--active' : ''}"
        data-testid="tdd-phase-${ph}">
        ${esc(ph)}
      </div>`).join('')}
  </div>`;
}

function renderTestList(step) {
  const rows = step.testList.map((test) => `
    <div class="tdc-test-row tdc-test-row--${esc(test.status)}">
      <span class="tdc-test-name">${esc(test.name)}</span>
      <span class="tdc-test-status tdc-test-status--${esc(test.status)}">${esc(test.status)}</span>
    </div>`).join('');
  return `<div class="tdc-test-list" data-testid="tdd-test-list">
    <h3 class="tdc-col-title">${t('tdd.testList')}</h3>
    ${rows}
  </div>`;
}

function renderCodePanel(step) {
  return `<div class="tdc-code-panel" data-testid="tdd-code">
    <h3 class="tdc-col-title">${t('tdd.code')}</h3>
    <pre class="tdc-code-pre">${esc(step.code) || '<em class="tdc-code-empty">' + esc(t('tdd.noCode')) + '</em>'}</pre>
  </div>`;
}

function renderSuiteBar(step) {
  const { passing, failing } = step.suite;
  const total = passing + failing;
  const passPercent = total === 0 ? 0 : Math.round((passing / total) * 100);
  return `<div class="tdc-suite" data-testid="tdd-suite">
    <h3 class="tdc-col-title">${t('tdd.suite')}</h3>
    <div class="tdc-suite-counts">
      <span class="tdc-suite-passing">${t('tdd.passing')}: ${passing}</span>
      <span class="tdc-suite-failing">${t('tdd.failing')}: ${failing}</span>
    </div>
    <div class="tdc-suite-bar-track">
      <div class="tdc-suite-bar-fill" style="width:${passPercent}%"></div>
    </div>
  </div>`;
}

function renderPredictControls(kata, step) {
  const isLast = state.stepIndex >= kata.steps.length - 1;

  const predictButtons = (state.predict && !isLast) ? `
    <div class="tdc-predict-btns" data-testid="tdd-predict-buttons">
      <span class="tdc-predict-label">${t('tdd.predictNext')}</span>
      ${['red', 'green', 'refactor'].map((ph) => `
        <button type="button"
          class="tdc-predict-btn tdc-predict-btn--${ph}${state.prediction === ph ? ' tdc-predict-btn--selected' : ''}"
          data-testid="tdd-predict-${ph}"
          data-tdc-predict="${ph}">
          ${esc(ph)}
        </button>`).join('')}
    </div>` : '';

  const predictResult = state.predictResult ? `
    <div class="tdc-predict-result tdc-predict-result--${esc(state.predictResult)}"
      data-testid="tdd-predict-result">
      ${state.predictResult === 'correct' ? t('tdd.correct') : t('tdd.incorrect')}
    </div>` : '';

  const nextDisabled = isLast || (state.predict && state.prediction === null);
  const stepCount = kata.steps.length;
  return `<div class="tdc-step-controls">
    <span class="tdc-step-counter">${state.stepIndex + 1} / ${stepCount}</span>
    <button type="button" class="tdc-btn tdc-btn--reset" data-testid="tdd-reset">${t('tdd.reset')}</button>
    <button type="button" class="tdc-btn tdc-btn--next" data-testid="tdd-next-step"
      ${nextDisabled ? 'disabled' : ''}>${t('tdd.nextStep')}</button>
    <label class="tdc-predict-toggle-label">
      <input type="checkbox" data-testid="tdd-predict-toggle" ${state.predict ? 'checked' : ''}>
      ${t('tdd.predictMode')}
    </label>
    ${predictButtons}
    ${predictResult}
  </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="tdc-quiz-start" data-testid="tdd-cycle-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    return `<div class="tdc-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="tdd-cycle-quiz-result">
      <p>${correct ? t('tdd.quiz.correct') : t('tdd.quiz.wrong')}</p>
      <button type="button" class="tdc-quiz-close" data-testid="tdd-cycle-quiz-close">${t('quiz.close')}</button>
    </div>`;
  }
  return `<div class="tdc-quiz" data-testid="tdd-cycle-quiz">
    <p class="tdc-quiz-prompt">${t('tdd.quiz.prompt')}</p>
    ${['a', 'b', 'c', 'd'].map((k) => `
      <label class="tdc-quiz-option">
        <input type="radio" name="tdc-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
        ${t('tdd.quiz.' + k)}
      </label>`).join('')}
    <button type="button" class="tdc-quiz-submit" data-testid="tdd-cycle-quiz-submit"
      ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
  </div>`;
}

function render() {
  const kata = currentKata();
  const step = kata.steps[state.stepIndex];

  root.innerHTML = `
    <div class="tdc-wrap">
      <h2 class="tdc-title">${t('tdd.cycle.title')}</h2>
      <p class="tdc-desc">${t('tdd.cycle.desc')}</p>

      <section class="tdc-controls">
        ${renderKataChips()}
        ${renderPhaseRing(step)}
      </section>

      <div class="tdc-panels-row">
        ${renderTestList(step)}
        ${renderCodePanel(step)}
        ${renderSuiteBar(step)}
      </div>

      <div class="tdc-note">${t(step.noteKey)}</div>

      ${renderPredictControls(kata, step)}

      <section class="tdc-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
      </section>
    </div>`;

  bindEvents();
}

function bindEvents() {
  // Kata chips
  root.querySelectorAll('[data-tdc-kata-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const newId = btn.dataset.tdcKataId;
      if (newId === state.kataId) return;
      state.kataId = newId;
      state.stepIndex = 0;
      state.prediction = null;
      state.predictResult = null;
      render();
    });
  });

  // Predict phase buttons
  root.querySelectorAll('[data-tdc-predict]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.prediction = btn.dataset.tdcPredict;
      state.predictResult = null;
      render();
    });
  });

  // Next step
  root.querySelector('[data-testid="tdd-next-step"]')?.addEventListener('click', () => {
    const kata = currentKata();
    const isLast = state.stepIndex >= kata.steps.length - 1;
    if (isLast) return;

    if (state.predict && state.prediction !== null) {
      const nextPhase = kata.steps[state.stepIndex + 1].phase;
      state.predictResult = state.prediction === nextPhase ? 'correct' : 'incorrect';
      state.stepIndex += 1;
      state.prediction = null;
    } else {
      state.stepIndex += 1;
    }
    render();
  });

  // Reset
  root.querySelector('[data-testid="tdd-reset"]')?.addEventListener('click', () => {
    state.stepIndex = 0;
    state.prediction = null;
    state.predictResult = null;
    render();
  });

  // Predict mode toggle
  root.querySelector('[data-testid="tdd-predict-toggle"]')?.addEventListener('change', (e) => {
    state.predict = e.target.checked;
    render();
  });

  // Quiz
  root.querySelector('[data-testid="tdd-cycle-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="tdc-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="tdd-cycle-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="tdd-cycle-quiz-close"]')?.addEventListener('click', () => {
    state.quiz = { active: false, phase: 'idle', answer: '' };
    render();
  });
}

export function createTddCycleExplorer() {
  state.kataId = TDD_KATAS[0].id;
  state.stepIndex = 0;
  state.predict = true;
  state.prediction = null;
  state.predictResult = null;
  state.quiz = { active: false, phase: 'idle', answer: '' };

  root = document.createElement('div');
  root.dataset.testid = 'tdd-cycle-explorer';

  onLocaleChange(() => render());
  render();
  return root;
}
