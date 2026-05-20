import { t, onLocaleChange } from '../i18n/index.js';
import { initialTddState, legalActions, applyAction } from '../utils/tddRules.js';

// TDD Rules Explorer.
// The learner attempts TDD actions; illegal moves are blocked with
// the discipline rule they break, backed by the pure tddRules engine.

const state = {
  tdd: initialTddState(),
  feedback: null,       // null | { blocked: bool, reasonKey?: string }
  quiz: { active: false, phase: 'idle', answer: '' },
};

let root;

const ACTIONS = [
  { id: 'write-failing-test',   labelKey: 'tdd.rules.action.writeFailingTest' },
  { id: 'write-production-code', labelKey: 'tdd.rules.action.writeProductionCode' },
  { id: 'refactor',              labelKey: 'tdd.rules.action.refactor' },
];

// ── Sub-renderers ──────────────────────────────────────────────────────────────

function renderPhaseRing() {
  const phases = ['red', 'green', 'refactor'];
  return `<div class="tdr-phase-ring" data-testid="tdd-phase-ring">
    ${phases.map((ph) => `
      <div class="tdr-phase-node tdr-phase-node--${ph}${state.tdd.phase === ph ? ' tdr-phase-node--active' : ''}"
        data-testid="tdd-phase-${ph}">
        ${ph}
      </div>`).join('')}
  </div>`;
}

function renderStatePanel() {
  const { phase, hasFailingTest, allGreen, cycleCount } = state.tdd;
  return `<div class="tdr-state-panel" data-testid="tdd-rules-state">
    <span class="tdr-state-item"><span class="tdr-state-label">${t('tdd.rules.state.phase')}:</span> ${phase}</span>
    <span class="tdr-state-item"><span class="tdr-state-label">${t('tdd.rules.state.hasFailingTest')}:</span> ${hasFailingTest}</span>
    <span class="tdr-state-item"><span class="tdr-state-label">${t('tdd.rules.state.allGreen')}:</span> ${allGreen}</span>
    <span class="tdr-state-item"><span class="tdr-state-label">${t('tdd.rules.state.cycleCount')}:</span> ${cycleCount}</span>
  </div>`;
}

function renderActionButtons() {
  const legal = legalActions(state.tdd);
  return `<div class="tdr-actions" data-testid="tdd-rules-actions">
    ${ACTIONS.map((a) => {
      const isLegal = legal.has(a.id);
      return `<button type="button"
        class="tdr-action-btn${isLegal ? '' : ' tdr-action-btn--illegal'}"
        data-testid="tdd-action-${a.id}"
        data-tdr-action="${a.id}">
        ${t(a.labelKey)}
      </button>`;
    }).join('')}
  </div>`;
}

function renderFeedback() {
  let text = '';
  if (state.feedback?.blocked) {
    text = t(state.feedback.reasonKey);
  } else if (state.feedback && !state.feedback.blocked) {
    text = t('tdd.rules.ok');
  }
  return `<div class="tdr-feedback${state.feedback?.blocked ? ' tdr-feedback--blocked' : (state.feedback ? ' tdr-feedback--ok' : '')}" data-testid="tdd-rules-feedback">${text}</div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="tdr-quiz-start" data-testid="tdd-rules-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    return `<div class="tdr-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="tdd-rules-quiz-result">
      <p>${correct ? t('tdd.rules.quiz.correct') : t('tdd.rules.quiz.wrong')}</p>
      <button type="button" class="tdr-quiz-close" data-testid="tdd-rules-quiz-close">${t('quiz.close')}</button>
    </div>`;
  }
  return `<div class="tdr-quiz" data-testid="tdd-rules-quiz">
    <p class="tdr-quiz-prompt">${t('tdd.rules.quiz.prompt')}</p>
    ${['a', 'b', 'c', 'd'].map((k) => `
      <label class="tdr-quiz-option">
        <input type="radio" name="tdr-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
        ${t('tdd.rules.quiz.' + k)}
      </label>`).join('')}
    <button type="button" class="tdr-quiz-submit" data-testid="tdd-rules-quiz-submit"
      ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
  </div>`;
}

function render() {
  root.innerHTML = `
    <div class="tdr-wrap">
      <h2 class="tdr-title">${t('tdd.rules.title')}</h2>
      <p class="tdr-desc">${t('tdd.rules.desc')}</p>

      <section class="tdr-controls">
        ${renderPhaseRing()}
        ${renderStatePanel()}
      </section>

      <section class="tdr-action-section">
        <h3 class="tdr-col-title">${t('tdd.rules.actionsTitle')}</h3>
        ${renderActionButtons()}
      </section>

      ${renderFeedback()}

      <button type="button" class="tdr-reset-btn" data-testid="tdd-rules-reset">${t('tdd.rules.reset')}</button>

      <section class="tdr-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
      </section>
    </div>`;

  bindEvents();
}

function bindEvents() {
  // Action buttons
  root.querySelectorAll('[data-tdr-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.tdrAction;
      const r = applyAction(state.tdd, action);
      state.feedback = { blocked: r.blocked, reasonKey: r.reasonKey };
      if (!r.blocked) {
        state.tdd = r.state;
      }
      render();
    });
  });

  // Reset
  root.querySelector('[data-testid="tdd-rules-reset"]')?.addEventListener('click', () => {
    state.tdd = initialTddState();
    state.feedback = null;
    render();
  });

  // Quiz
  root.querySelector('[data-testid="tdd-rules-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="tdr-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="tdd-rules-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="tdd-rules-quiz-close"]')?.addEventListener('click', () => {
    state.quiz = { active: false, phase: 'idle', answer: '' };
    render();
  });
}

export function createTddRulesExplorer() {
  state.tdd = initialTddState();
  state.feedback = null;
  state.quiz = { active: false, phase: 'idle', answer: '' };

  root = document.createElement('div');
  root.dataset.testid = 'tdd-rules-explorer';

  onLocaleChange(() => render());
  render();
  return root;
}
