import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';

// Model-Based Testing — the full model → generate → concretize → execute
// → verdict pipeline. Six clickable stages, each with role / example /
// failure-mode detail. Pattern mirrors I3 LLMPipeline / I6 SAILOR.
const STAGES = [
  {
    id: 'model',
    colorClass: 'mbtw-stage--amber',
    exampleInput: `// informal spec
"A locked door unlocks on a valid card,
 stays locked on an invalid card, and
 re-locks 5 s after opening."`,
    exampleOutput: `FSM  states: Locked, Unlocked, Open
  Locked   --validCard-->   Unlocked
  Locked   --invalidCard--> Locked
  Unlocked --push-->        Open
  Open     --timeout-->     Locked`,
    failureModes: ['mbtw.model.failure1', 'mbtw.model.failure2'],
  },
  {
    id: 'criterion',
    colorClass: 'mbtw-stage--blue',
    exampleInput: `FSM (3 states, 4 transitions)
choose: ☐ state  ☑ transition  ☐ transition-pair`,
    exampleOutput: `criterion = all-transitions
obligations = { t1 validCard, t2 invalidCard,
                t3 push, t4 timeout }  (4)`,
    failureModes: ['mbtw.criterion.failure1', 'mbtw.criterion.failure2'],
  },
  {
    id: 'abstract',
    colorClass: 'mbtw-stage--purple',
    exampleInput: `criterion = all-transitions
FSM = door model`,
    exampleOutput: `abstract test 1: validCard · push · timeout
abstract test 2: invalidCard
// model-level event sequences — no real values yet`,
    failureModes: ['mbtw.abstract.failure1', 'mbtw.abstract.failure2'],
  },
  {
    id: 'concretize',
    colorClass: 'mbtw-stage--teal',
    exampleInput: `abstract: validCard · push · timeout`,
    exampleOutput: `concrete (mapping events → real API):
  reader.swipe(card="EMP-4417")   // validCard
  door.push()                      // push
  clock.advance(5_000)             // timeout`,
    failureModes: ['mbtw.concretize.failure1', 'mbtw.concretize.failure2'],
  },
  {
    id: 'execute',
    colorClass: 'mbtw-stage--green',
    exampleInput: `concrete test → run against the real SUT`,
    exampleOutput: `step swipe(EMP-4417) → SUT state: Unlocked
step push()           → SUT state: Open
step advance(5000)    → SUT state: Locked`,
    failureModes: ['mbtw.execute.failure1', 'mbtw.execute.failure2'],
  },
  {
    id: 'verdict',
    colorClass: 'mbtw-stage--rose',
    exampleInput: `observed SUT outputs  vs  model-predicted outputs`,
    exampleOutput: `model predicts: Locked → Unlocked → Open → Locked
SUT observed:   Locked → Unlocked → Open → Locked
VERDICT: pass  (conformance holds)`,
    failureModes: ['mbtw.verdict.failure1', 'mbtw.verdict.failure2'],
  },
];

// Offline vs online MBT — two columns of contrasting traits.
const MODES = [
  { id: 'offline', rows: ['mbtw.mode.offline.r1', 'mbtw.mode.offline.r2', 'mbtw.mode.offline.r3'] },
  { id: 'online',  rows: ['mbtw.mode.online.r1',  'mbtw.mode.online.r2',  'mbtw.mode.online.r3'] },
];

const state = {
  activeStage: 'model',
  detailTab: 'role',
  quiz: { active: false, phase: 'idle', answer: '' },
  lab: { active: false, text: '' },
};

let root;

function renderPipeline() {
  return `
    <div class="mbtw-pipeline" data-testid="mbtw-pipeline">
      ${STAGES.map((stage, i) => `
        ${i > 0 ? '<div class="mbtw-arrow" aria-hidden="true">→</div>' : ''}
        <button type="button"
          class="mbtw-stage-card ${stage.colorClass} ${state.activeStage === stage.id ? 'mbtw-stage--active' : ''}"
          data-stage="${stage.id}"
          data-testid="mbtw-stage-${stage.id}">
          <div class="mbtw-stage-num">${t('mbtw.stage.num', { n: i + 1 })}</div>
          <div class="mbtw-stage-name">${t('mbtw.stage.' + stage.id + '.name')}</div>
        </button>
      `).join('')}
    </div>`;
}

function renderStageDetail() {
  const stage = STAGES.find((s) => s.id === state.activeStage);
  if (!stage) return '';
  const tabs = ['role', 'example', 'failures'];
  return `
    <div class="mbtw-detail" data-testid="mbtw-detail">
      <div class="mbtw-detail-tabs">
        ${tabs.map((tab) => `
          <button type="button"
            class="mbtw-detail-tab ${state.detailTab === tab ? 'mbtw-detail-tab--active' : ''}"
            data-detail-tab="${tab}"
            data-testid="mbtw-detail-${tab}">${t('mbtw.detail.' + tab)}</button>
        `).join('')}
      </div>
      <div class="mbtw-detail-body">
        ${state.detailTab === 'role' ? `
          <p class="mbtw-detail-role">${t('mbtw.stage.' + stage.id + '.role')}</p>
        ` : ''}
        ${state.detailTab === 'example' ? `
          <div class="mbtw-example-grid">
            <div>
              <h4>${t('mbtw.example.in')}</h4>
              <pre class="mbtw-example-pre">${stage.exampleInput.replace(/</g, '&lt;')}</pre>
            </div>
            <div>
              <h4>${t('mbtw.example.out')}</h4>
              <pre class="mbtw-example-pre mbtw-example-out">${stage.exampleOutput.replace(/</g, '&lt;')}</pre>
            </div>
          </div>
        ` : ''}
        ${state.detailTab === 'failures' ? `
          <ul class="mbtw-failure-list">
            ${stage.failureModes.map((k) => `<li>${t(k)}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    </div>`;
}

function renderModes() {
  return `
    <div class="mbtw-modes" data-testid="mbtw-modes">
      <h3>${t('mbtw.modes.title')}</h3>
      <div class="mbtw-modes-grid">
        ${MODES.map((m) => `
          <div class="mbtw-mode-col mbtw-mode-col--${m.id}">
            <h4>${t('mbtw.mode.' + m.id + '.name')}</h4>
            <ul>${m.rows.map((k) => `<li>${t(k)}</li>`).join('')}</ul>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderBridge() {
  return `
    <div class="mbtw-bridges">
      <button type="button" class="mbtw-bridge" data-testid="mbtw-bridge-vmodel"
        title="${t('mbtw.bridge.vmodel.title')}">
        🔗 → ${t('flowTab.vmodel')}
      </button>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="mbtw-quiz-start" data-testid="mbtw-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    const shareEncoded = encodeResult({
      v: 1, explorer: 'mbtw', explorerLabel: t('mbtw.title'),
      mode: 'quiz', ts: Date.now(), lang: getLocale(),
      score: correct ? 1 : 0, total: 1,
      items: [{
        q: t('mbtw.quiz.prompt'),
        a: state.quiz.answer ? t('mbtw.quiz.' + state.quiz.answer) : '',
        expected: t('mbtw.quiz.c'),
        ok: correct,
      }],
    });
    return `<div class="mbtw-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="mbtw-quiz-result">
      <p>${correct ? t('mbtw.quiz.correct') : t('mbtw.quiz.wrong')}</p>
      <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="mbtw-quiz-share">📋 ${t('quiz.share.btn')}</button>
    </div>`;
  }
  return `
    <div class="mbtw-quiz" data-testid="mbtw-quiz">
      <p class="mbtw-quiz-prompt">${t('mbtw.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="mbtw-quiz-option">
          <input type="radio" name="mbtw-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('mbtw.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="mbtw-quiz-submit" data-testid="mbtw-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="mbtw-lab-start" data-testid="mbtw-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="mbtw-lab" data-testid="mbtw-lab">
      <p class="mbtw-lab-prompt">${t('mbtw.lab.prompt')}</p>
      <textarea class="mbtw-lab-textarea" data-testid="mbtw-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="mbtw-wrap" data-testid="mbtw-wrap">
      <h2 class="mbtw-title">${t('mbtw.title')}</h2>
      <p class="mbtw-desc">${t('mbtw.desc')}</p>
      ${renderPipeline()}
      ${renderStageDetail()}
      ${renderModes()}
      ${renderBridge()}
      <section class="mbtw-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-stage]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeStage = btn.dataset.stage;
      state.detailTab = 'role';
      render();
    });
  });
  root.querySelectorAll('[data-detail-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.detailTab = btn.dataset.detailTab;
      render();
    });
  });
  root.querySelector('[data-testid="mbtw-bridge-vmodel"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="flow"]')?.click();
    document.querySelector('[data-flow-tab="vmodel"]')?.click();
  });
  root.querySelector('[data-testid="mbtw-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="mbtw-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="mbtw-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="mbtw-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="mbtw-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createMBTWorkflowExplorer() {
  state.activeStage = 'model';
  state.detailTab = 'role';
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}

export { STAGES, MODES };
