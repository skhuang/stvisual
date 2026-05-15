import { t } from '../i18n/index.js';

// Six categories — same taxonomy as J3 plus an explicit "order" bucket.
export const SOURCES = ['timing', 'order', 'async', 'network', 'animation', 'data'];

const SOURCE_META = {
  timing:    { icon: '⏱', labelKey: 'flx.src.timing.label',    fixKey: 'flx.src.timing.fix' },
  order:     { icon: '🔢', labelKey: 'flx.src.order.label',     fixKey: 'flx.src.order.fix' },
  async:     { icon: '⚙', labelKey: 'flx.src.async.label',     fixKey: 'flx.src.async.fix' },
  network:   { icon: '🌐', labelKey: 'flx.src.network.label',   fixKey: 'flx.src.network.fix' },
  animation: { icon: '🎬', labelKey: 'flx.src.animation.label', fixKey: 'flx.src.animation.fix' },
  data:      { icon: '🗃', labelKey: 'flx.src.data.label',      fixKey: 'flx.src.data.fix' },
};

const SAMPLES = [
  { id: 's1', source: 'timing',    logKey: 'flx.sample.s1.log',    rationaleKey: 'flx.sample.s1.rationale' },
  { id: 's2', source: 'network',   logKey: 'flx.sample.s2.log',    rationaleKey: 'flx.sample.s2.rationale' },
  { id: 's3', source: 'animation', logKey: 'flx.sample.s3.log',    rationaleKey: 'flx.sample.s3.rationale' },
  { id: 's4', source: 'async',     logKey: 'flx.sample.s4.log',    rationaleKey: 'flx.sample.s4.rationale' },
  { id: 's5', source: 'data',      logKey: 'flx.sample.s5.log',    rationaleKey: 'flx.sample.s5.rationale' },
  { id: 's6', source: 'order',     logKey: 'flx.sample.s6.log',    rationaleKey: 'flx.sample.s6.rationale' },
  { id: 's7', source: 'animation', logKey: 'flx.sample.s7.log',    rationaleKey: 'flx.sample.s7.rationale' },
  { id: 's8', source: 'network',   logKey: 'flx.sample.s8.log',    rationaleKey: 'flx.sample.s8.rationale' },
];

// ── pure helpers (exported for tests) ───────────────────────────────

export function tallyByMistake(answers) {
  // answers: array of { sampleId, picked, correct: bool }.
  // Returns mistakes-per-source counter, useful for telling the student
  // which category to drill.
  const mistakes = Object.fromEntries(SOURCES.map((s) => [s, 0]));
  for (const a of answers) {
    if (!a.correct) {
      const sample = SAMPLES.find((s) => s.id === a.sampleId);
      if (sample) mistakes[sample.source] += 1;
    }
  }
  return mistakes;
}

export function scoreOf(answers) {
  return answers.filter((a) => a.correct).length;
}

// ── state ───────────────────────────────────────────────────────────

const state = {
  sampleIdx: 0,
  answers: [],   // [{ sampleId, picked, correct }]
  picked: null,  // current selection before submitting
  quiz: { active: false, phase: 'idle', answer: '' },
  lab:  { active: false, text: '' },
};

let root;

function currentSample() { return SAMPLES[state.sampleIdx]; }
function answerFor(id) { return state.answers.find((a) => a.sampleId === id); }

function renderProgress() {
  const total = SAMPLES.length;
  const answered = state.answers.length;
  const score = scoreOf(state.answers);
  return `
    <div class="flx-progress" data-testid="flx-progress">
      <span>${t('flx.progress', { answered, total })}</span>
      <span class="flx-progress__score" data-testid="flx-score">${t('flx.score', { score, answered })}</span>
    </div>`;
}

function renderSampleCard() {
  const sample = currentSample();
  const prior = answerFor(sample.id);
  return `
    <div class="flx-sample" data-testid="flx-sample">
      <header>
        <span class="flx-sample__idx">${state.sampleIdx + 1} / ${SAMPLES.length}</span>
      </header>
      <pre class="flx-sample__log">${t(sample.logKey)}</pre>
      <div class="flx-options">
        ${SOURCES.map((s) => {
          const meta = SOURCE_META[s];
          const picked = prior ? prior.picked === s : state.picked === s;
          const isCorrect = prior && s === sample.source;
          const wasMyWrong = prior && !prior.correct && prior.picked === s;
          return `
            <button type="button"
              class="flx-option${picked ? ' flx-option--picked' : ''}${isCorrect ? ' flx-option--correct' : ''}${wasMyWrong ? ' flx-option--wrong' : ''}"
              data-source="${s}"
              data-testid="flx-option-${s}"
              ${prior ? 'disabled' : ''}>
              <span>${meta.icon}</span>
              <span>${t(meta.labelKey)}</span>
            </button>`;
        }).join('')}
      </div>
      ${prior ? renderFeedback(sample, prior) : `
        <button type="button" class="flx-submit" data-testid="flx-submit"
          ${state.picked ? '' : 'disabled'}>${t('flx.submit')}</button>`}
    </div>`;
}

function renderFeedback(sample, prior) {
  const correctMeta = SOURCE_META[sample.source];
  return `
    <div class="flx-feedback flx-feedback--${prior.correct ? 'right' : 'wrong'}" data-testid="flx-feedback">
      <strong>${prior.correct ? t('flx.feedback.right') : t('flx.feedback.wrong', { correct: correctMeta.icon + ' ' + t(correctMeta.labelKey) })}</strong>
      <p>${t(sample.rationaleKey)}</p>
      <p class="flx-feedback__fix"><strong>${t('flx.fix')}:</strong> ${t(correctMeta.fixKey)}</p>
    </div>`;
}

function renderNav() {
  return `
    <div class="flx-nav">
      <button type="button" class="flx-nav-btn" data-testid="flx-prev"
        ${state.sampleIdx === 0 ? 'disabled' : ''}>← ${t('emx.nav.prev')}</button>
      <button type="button" class="flx-nav-btn" data-testid="flx-next"
        ${state.sampleIdx === SAMPLES.length - 1 ? 'disabled' : ''}>${t('emx.nav.next')} →</button>
    </div>`;
}

function renderTaxonomy() {
  return `
    <div class="flx-taxonomy" data-testid="flx-taxonomy">
      <h3>${t('flx.taxonomy.title')}</h3>
      <ul>
        ${SOURCES.map((s) => `
          <li class="flx-tax-row flx-tax-row--${s}">
            <span>${SOURCE_META[s].icon}</span>
            <span class="flx-tax-row__label">${t(SOURCE_META[s].labelKey)}</span>
            <span class="flx-tax-row__fix">${t(SOURCE_META[s].fixKey)}</span>
          </li>`).join('')}
      </ul>
      <div class="flx-bridges">
        <button type="button" class="flx-bridge" data-testid="flx-bridge-e2e"
          title="${t('flx.bridge.e2e.title')}">
          🔗 → ${t('acceptanceTab.e2ejourney')}
        </button>
        <button type="button" class="flx-bridge" data-testid="flx-bridge-tqx"
          title="${t('flx.bridge.tqx.title')}">
          🔗 → ${t('advTab.testquality')}
        </button>
      </div>
    </div>`;
}

function renderMistakeBars() {
  const mistakes = tallyByMistake(state.answers);
  const max = Math.max(1, ...Object.values(mistakes));
  return `
    <div class="flx-mistakes" data-testid="flx-mistakes">
      <h3>${t('flx.mistakes.title')}</h3>
      <ul class="flx-mistakes__list">
        ${SOURCES.map((s) => `
          <li class="flx-mistakes__row">
            <span class="flx-mistakes__label">${SOURCE_META[s].icon} ${t(SOURCE_META[s].labelKey)}</span>
            <div class="flx-mistakes__bar">
              <div class="flx-mistakes__fill" style="width:${(mistakes[s] / max) * 100}%"></div>
            </div>
            <span class="flx-mistakes__count">${mistakes[s]}</span>
          </li>`).join('')}
      </ul>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="flx-quiz-start" data-testid="flx-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'b';
    return `<div class="flx-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="flx-quiz-result">
      <p>${correct ? t('flx.quiz.correct') : t('flx.quiz.wrong')}</p>
    </div>`;
  }
  return `
    <div class="flx-quiz" data-testid="flx-quiz">
      <p class="flx-quiz-prompt">${t('flx.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="flx-quiz-option">
          <input type="radio" name="flx-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('flx.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="flx-quiz-submit" data-testid="flx-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="flx-lab-start" data-testid="flx-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="flx-lab" data-testid="flx-lab">
      <p class="flx-lab-prompt">${t('flx.lab.prompt')}</p>
      <textarea class="flx-lab-textarea" data-testid="flx-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="flx-wrap" data-testid="flx-wrap">
      <h2 class="flx-title">${t('flx.title')}</h2>
      <p class="flx-desc">${t('flx.desc')}</p>

      ${renderProgress()}
      ${renderSampleCard()}
      ${renderNav()}

      <div class="flx-two-col">
        ${renderTaxonomy()}
        ${renderMistakeBars()}
      </div>

      <section class="flx-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-source]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.picked = btn.dataset.source;
      render();
    });
  });
  root.querySelector('[data-testid="flx-submit"]')?.addEventListener('click', () => {
    const sample = currentSample();
    if (!state.picked || answerFor(sample.id)) return;
    state.answers.push({
      sampleId: sample.id,
      picked: state.picked,
      correct: state.picked === sample.source,
    });
    state.picked = null;
    render();
  });
  root.querySelector('[data-testid="flx-prev"]')?.addEventListener('click', () => {
    if (state.sampleIdx > 0) {
      state.sampleIdx -= 1;
      state.picked = null;
      render();
    }
  });
  root.querySelector('[data-testid="flx-next"]')?.addEventListener('click', () => {
    if (state.sampleIdx < SAMPLES.length - 1) {
      state.sampleIdx += 1;
      state.picked = null;
      render();
    }
  });
  root.querySelector('[data-testid="flx-bridge-e2e"]')?.addEventListener('click', () => {
    document.querySelector('[data-acceptance-tab="e2ejourney"]')?.click();
  });
  root.querySelector('[data-testid="flx-bridge-tqx"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="advanced"]')?.click();
    document.querySelector('[data-advanced-tab="testquality"]')?.click();
  });
  root.querySelector('[data-testid="flx-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="flx-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="flx-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="flx-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="flx-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createFlakyDiagnosisExplorer() {
  state.sampleIdx = 0;
  state.answers = [];
  state.picked = null;
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab  = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}

export { SAMPLES };
