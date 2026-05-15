import { t } from '../i18n/index.js';

export const STAGES = ['discuss', 'distill', 'develop', 'demo'];

const STAGE_META = {
  discuss:  { icon: '💬', actorKey: 'atdd.actor.team', artifactKey: 'atdd.artifact.discuss' },
  distill:  { icon: '🧪', actorKey: 'atdd.actor.qaba',  artifactKey: 'atdd.artifact.distill' },
  develop:  { icon: '🛠', actorKey: 'atdd.actor.dev',   artifactKey: 'atdd.artifact.develop' },
  demo:     { icon: '🎤', actorKey: 'atdd.actor.team', artifactKey: 'atdd.artifact.demo' },
};

const STORY = {
  titleKey: 'atdd.story.title',
  asA: 'atdd.story.asA',
  iWant: 'atdd.story.iWant',
  soThat: 'atdd.story.soThat',
};

// Each stage's body content keys, kept in i18n for easy translation.
const STAGE_BODY = {
  discuss: ['atdd.stage.discuss.q1', 'atdd.stage.discuss.q2', 'atdd.stage.discuss.q3'],
  distill: ['atdd.stage.distill.ac1', 'atdd.stage.distill.ac2', 'atdd.stage.distill.ac3'],
  develop: ['atdd.stage.develop.r', 'atdd.stage.develop.g', 'atdd.stage.develop.f'],
  demo:    ['atdd.stage.demo.run', 'atdd.stage.demo.ack', 'atdd.stage.demo.ship'],
};

// ── pure helpers (exported for tests) ───────────────────────────────

export function nextStage(s) {
  const i = STAGES.indexOf(s);
  return STAGES[(i + 1) % STAGES.length];
}

export function poInvolvedIn(stage) {
  return stage === 'discuss' || stage === 'demo';
}

// ── state ───────────────────────────────────────────────────────────

const state = {
  stageIdx: 0,
  quiz: { active: false, phase: 'idle', answer: '' },
  lab:  { active: false, text: '' },
};

let root;

function renderStory() {
  return `
    <div class="atdd-story" data-testid="atdd-story">
      <h3>${t(STORY.titleKey)}</h3>
      <p>${t(STORY.asA)}</p>
      <p>${t(STORY.iWant)}</p>
      <p>${t(STORY.soThat)}</p>
    </div>`;
}

function renderCycle() {
  return `
    <div class="atdd-cycle" data-testid="atdd-cycle">
      ${STAGES.map((s, i) => {
        const meta = STAGE_META[s];
        const active = i === state.stageIdx;
        return `
          <button type="button"
            class="atdd-stage${active ? ' atdd-stage--active' : ''}${poInvolvedIn(s) ? ' atdd-stage--po' : ''}"
            data-stage="${i}"
            data-testid="atdd-stage-${s}">
            <span class="atdd-stage__icon">${meta.icon}</span>
            <span class="atdd-stage__name">${t('atdd.stage.' + s)}</span>
            <span class="atdd-stage__actor">${t(meta.actorKey)}</span>
          </button>
          ${i < STAGES.length - 1 ? '<span class="atdd-cycle__arrow">→</span>' : ''}`;
      }).join('')}
    </div>`;
}

function renderStageDetail() {
  const stage = STAGES[state.stageIdx];
  const meta = STAGE_META[stage];
  const body = STAGE_BODY[stage];
  return `
    <div class="atdd-detail" data-testid="atdd-detail">
      <header>
        <h3>${meta.icon} ${t('atdd.stage.' + stage)}</h3>
        <div class="atdd-detail__chips">
          <span class="atdd-detail__chip"><strong>${t('atdd.detail.actor')}:</strong> ${t(meta.actorKey)}</span>
          <span class="atdd-detail__chip"><strong>${t('atdd.detail.artifact')}:</strong> ${t(meta.artifactKey)}</span>
          ${poInvolvedIn(stage) ? `<span class="atdd-detail__chip atdd-detail__chip--po">${t('atdd.detail.poInvolved')}</span>` : ''}
        </div>
      </header>
      <ul class="atdd-detail__list">
        ${body.map((b) => `<li>${t(b)}</li>`).join('')}
      </ul>
      ${stage === 'develop' ? renderTddInner() : ''}
      ${renderBridges(stage)}
    </div>`;
}

function renderTddInner() {
  return `
    <div class="atdd-tdd" data-testid="atdd-tdd">
      <h4>${t('atdd.tdd.title')}</h4>
      <div class="atdd-tdd__loop">
        <span class="atdd-tdd__step atdd-tdd__step--red">${t('atdd.tdd.red')}</span>
        <span class="atdd-tdd__arrow">→</span>
        <span class="atdd-tdd__step atdd-tdd__step--green">${t('atdd.tdd.green')}</span>
        <span class="atdd-tdd__arrow">→</span>
        <span class="atdd-tdd__step atdd-tdd__step--refactor">${t('atdd.tdd.refactor')}</span>
        <span class="atdd-tdd__loopback">⟲</span>
      </div>
      <p class="atdd-tdd__note">${t('atdd.tdd.note')}</p>
    </div>`;
}

function renderBridges(stage) {
  const bridges = [];
  if (stage === 'distill') {
    bridges.push(`
      <button type="button" class="atdd-bridge" data-testid="atdd-bridge-gherkin"
        title="${t('atdd.bridge.gherkin.title')}">
        🔗 → ${t('acceptanceTab.gherkin')}
      </button>`);
  }
  if (stage === 'develop') {
    bridges.push(`
      <button type="button" class="atdd-bridge" data-testid="atdd-bridge-vmodel"
        title="${t('atdd.bridge.vmodel.title')}">
        🔗 → ${t('flowTab.vmodel')}
      </button>`);
  }
  if (!bridges.length) return '';
  return `<div class="atdd-bridges">${bridges.join('')}</div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="atdd-quiz-start" data-testid="atdd-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    return `<div class="atdd-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="atdd-quiz-result">
      <p>${correct ? t('atdd.quiz.correct') : t('atdd.quiz.wrong')}</p>
    </div>`;
  }
  return `
    <div class="atdd-quiz" data-testid="atdd-quiz">
      <p class="atdd-quiz-prompt">${t('atdd.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="atdd-quiz-option">
          <input type="radio" name="atdd-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('atdd.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="atdd-quiz-submit" data-testid="atdd-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="atdd-lab-start" data-testid="atdd-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="atdd-lab" data-testid="atdd-lab">
      <p class="atdd-lab-prompt">${t('atdd.lab.prompt')}</p>
      <textarea class="atdd-lab-textarea" data-testid="atdd-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="atdd-wrap" data-testid="atdd-wrap">
      <h2 class="atdd-title">${t('atdd.title')}</h2>
      <p class="atdd-desc">${t('atdd.desc')}</p>

      ${renderStory()}
      ${renderCycle()}
      ${renderStageDetail()}

      <div class="atdd-nav">
        <button type="button" class="atdd-nav-btn" data-testid="atdd-prev"
          ${state.stageIdx === 0 ? 'disabled' : ''}>← ${t('emx.nav.prev')}</button>
        <button type="button" class="atdd-nav-btn atdd-nav-btn--primary" data-testid="atdd-next">
          ${state.stageIdx === STAGES.length - 1 ? t('atdd.cycle.restart') : t('emx.nav.next') + ' →'}
        </button>
      </div>

      <section class="atdd-self-test">
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
      state.stageIdx = Number(btn.dataset.stage);
      render();
    });
  });
  root.querySelector('[data-testid="atdd-prev"]')?.addEventListener('click', () => {
    if (state.stageIdx > 0) { state.stageIdx -= 1; render(); }
  });
  root.querySelector('[data-testid="atdd-next"]')?.addEventListener('click', () => {
    state.stageIdx = (state.stageIdx + 1) % STAGES.length;
    render();
  });
  root.querySelector('[data-testid="atdd-bridge-gherkin"]')?.addEventListener('click', () => {
    document.querySelector('[data-acceptance-tab="gherkin"]')?.click();
  });
  root.querySelector('[data-testid="atdd-bridge-vmodel"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="flow"]')?.click();
    document.querySelector('[data-flow-tab="vmodel"]')?.click();
  });
  root.querySelector('[data-testid="atdd-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="atdd-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="atdd-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="atdd-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="atdd-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createATDDCycleExplorer() {
  state.stageIdx = 0;
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab  = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}
