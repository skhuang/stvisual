import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';

// Each step has a per-flakiness-source failure rate (probability of THIS run
// failing AT this step due to THIS source). Independent per-source draws; the
// step fails if any source fires. `tag` is the dominant cause shown by default.
const JOURNEYS = [
  {
    id: 'checkout',
    titleKey: 'e2e.preset.checkout',
    steps: [
      { id: 'login',    labelKey: 'e2e.j.checkout.login',     tag: 'timing',    risk: { timing: 0.03, network: 0.02, animation: 0, async: 0, data: 0 } },
      { id: 'search',   labelKey: 'e2e.j.checkout.search',    tag: 'network',   risk: { timing: 0,    network: 0.08, animation: 0, async: 0, data: 0 } },
      { id: 'addCart',  labelKey: 'e2e.j.checkout.addCart',   tag: 'animation', risk: { timing: 0,    network: 0,    animation: 0.10, async: 0, data: 0 } },
      { id: 'checkout', labelKey: 'e2e.j.checkout.checkout',  tag: 'async',     risk: { timing: 0,    network: 0,    animation: 0,    async: 0.06, data: 0 } },
      { id: 'pay',      labelKey: 'e2e.j.checkout.pay',       tag: 'network',   risk: { timing: 0,    network: 0.05, animation: 0,    async: 0,    data: 0 } },
      { id: 'confirm',  labelKey: 'e2e.j.checkout.confirm',   tag: 'async',     risk: { timing: 0,    network: 0,    animation: 0,    async: 0.04, data: 0 } },
    ],
  },
  {
    id: 'pwreset',
    titleKey: 'e2e.preset.pwreset',
    steps: [
      { id: 'open',     labelKey: 'e2e.j.pwreset.open',       tag: 'timing',    risk: { timing: 0.02, network: 0,    animation: 0, async: 0, data: 0 } },
      { id: 'email',    labelKey: 'e2e.j.pwreset.email',      tag: 'data',      risk: { timing: 0,    network: 0,    animation: 0, async: 0, data: 0.07 } },
      { id: 'inbox',    labelKey: 'e2e.j.pwreset.inbox',      tag: 'async',     risk: { timing: 0,    network: 0,    animation: 0, async: 0.12, data: 0 } },
      { id: 'follow',   labelKey: 'e2e.j.pwreset.follow',     tag: 'network',   risk: { timing: 0,    network: 0.04, animation: 0, async: 0, data: 0 } },
      { id: 'new-pw',   labelKey: 'e2e.j.pwreset.newPw',      tag: 'data',      risk: { timing: 0,    network: 0,    animation: 0, async: 0, data: 0.03 } },
    ],
  },
  {
    id: 'upload',
    titleKey: 'e2e.preset.upload',
    steps: [
      { id: 'open',     labelKey: 'e2e.j.upload.open',        tag: 'timing',    risk: { timing: 0.02, network: 0,    animation: 0, async: 0, data: 0 } },
      { id: 'pick',     labelKey: 'e2e.j.upload.pick',        tag: 'animation', risk: { timing: 0,    network: 0,    animation: 0.06, async: 0, data: 0 } },
      { id: 'transfer', labelKey: 'e2e.j.upload.transfer',    tag: 'network',   risk: { timing: 0,    network: 0.12, animation: 0,    async: 0, data: 0 } },
      { id: 'progress', labelKey: 'e2e.j.upload.progress',    tag: 'async',     risk: { timing: 0,    network: 0,    animation: 0,    async: 0.05, data: 0 } },
      { id: 'verify',   labelKey: 'e2e.j.upload.verify',      tag: 'data',      risk: { timing: 0,    network: 0,    animation: 0,    async: 0, data: 0.04 } },
    ],
  },
];

export const FLAKINESS_SOURCES = ['timing', 'network', 'animation', 'async', 'data'];

const SOURCE_META = {
  timing:    { icon: '⏱', labelKey: 'e2e.src.timing.label',    fixKey: 'e2e.src.timing.fix' },
  network:   { icon: '🌐', labelKey: 'e2e.src.network.label',   fixKey: 'e2e.src.network.fix' },
  animation: { icon: '🎬', labelKey: 'e2e.src.animation.label', fixKey: 'e2e.src.animation.fix' },
  async:     { icon: '⚙', labelKey: 'e2e.src.async.label',     fixKey: 'e2e.src.async.fix' },
  data:      { icon: '🗃', labelKey: 'e2e.src.data.label',      fixKey: 'e2e.src.data.fix' },
};

// Quiz: classify a log line. Source key + correct answer.
const QUIZ_LOGS = [
  { logKey: 'e2e.quiz.log',        correct: 'animation' },
];

// ── pure functions, exported for unit tests ─────────────────────────

// Step-level pass probability = ∏ (1 − sourceRate).
export function stepPassProbability(step) {
  let p = 1;
  for (const s of FLAKINESS_SOURCES) p *= (1 - (step.risk[s] ?? 0));
  return p;
}

// Journey-level pass probability = ∏ stepPassProbability.
export function journeyPassProbability(journey) {
  return journey.steps.reduce((p, s) => p * stepPassProbability(s), 1);
}

// Deterministic simulation: returns array of per-step "made it past" counts.
// Uses a tiny LCG so tests are reproducible.
export function simulateRuns(journey, runs, seed = 1) {
  let state = seed;
  function rand() {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  }
  const reached = journey.steps.map(() => 0);
  let fullPasses = 0;
  for (let r = 0; r < runs; r++) {
    let alive = true;
    for (let i = 0; i < journey.steps.length && alive; i++) {
      reached[i] += 1;
      if (rand() > stepPassProbability(journey.steps[i])) alive = false;
    }
    if (alive) fullPasses++;
  }
  return { reached, fullPasses, runs };
}

// ── state ───────────────────────────────────────────────────────────

const state = {
  journeyIdx: 0,
  sim: null,
  quiz: { active: false, phase: 'idle', answer: '' },
  lab:  { active: false, text: '' },
};

let root;

function currentJourney() {
  return JOURNEYS[state.journeyIdx];
}

function renderJourneyTimeline() {
  const j = currentJourney();
  return `
    <div class="e2e-journey" data-testid="e2e-journey">
      <h3>${t('e2e.journey.title')}</h3>
      <ol class="e2e-step-list">
        ${j.steps.map((s, i) => `
          <li class="e2e-step" data-testid="e2e-step-${s.id}">
            <span class="e2e-step__idx">${i + 1}</span>
            <div class="e2e-step__body">
              <p class="e2e-step__label">${t(s.labelKey)}</p>
              <p class="e2e-step__pass">${t('e2e.step.passProb', { pct: (stepPassProbability(s) * 100).toFixed(1) })}</p>
            </div>
            <span class="e2e-step__tag e2e-step__tag--${s.tag}"
                  data-testid="e2e-step-tag-${s.id}">
              ${SOURCE_META[s.tag].icon} ${t(SOURCE_META[s.tag].labelKey)}
            </span>
          </li>`).join('')}
      </ol>
    </div>`;
}

function renderSim() {
  const j = currentJourney();
  const sim = state.sim;
  const totalPass = (journeyPassProbability(j) * 100).toFixed(1);
  return `
    <div class="e2e-sim" data-testid="e2e-sim">
      <header class="e2e-sim__header">
        <h3>${t('e2e.sim.title')}</h3>
        <button type="button" class="e2e-sim__run" data-testid="e2e-sim-run">
          ${t('e2e.sim.run')}
        </button>
      </header>
      <p class="e2e-sim__predict">${t('e2e.sim.predict', { pct: totalPass })}</p>
      ${sim ? `
        <p class="e2e-sim__actual" data-testid="e2e-sim-actual">
          ${t('e2e.sim.actual', { pass: sim.fullPasses, runs: sim.runs, pct: ((sim.fullPasses / sim.runs) * 100).toFixed(1) })}
        </p>
        <div class="e2e-sim__bars">
          ${j.steps.map((s, i) => {
            const pct = (sim.reached[i] / sim.runs) * 100;
            return `
              <div class="e2e-sim__bar" data-testid="e2e-sim-bar-${s.id}">
                <span class="e2e-sim__bar-label">${t(s.labelKey)}</span>
                <div class="e2e-sim__bar-wrap">
                  <div class="e2e-sim__bar-fill" style="width:${pct.toFixed(1)}%"></div>
                </div>
                <span class="e2e-sim__bar-pct">${pct.toFixed(0)}%</span>
              </div>`;
          }).join('')}
        </div>` : ''}
    </div>`;
}

function renderTaxonomy() {
  return `
    <div class="e2e-taxonomy" data-testid="e2e-taxonomy">
      <h3>${t('e2e.taxonomy.title')}</h3>
      <ul class="e2e-tax-list">
        ${FLAKINESS_SOURCES.map((s) => `
          <li class="e2e-tax-item e2e-tax-item--${s}">
            <span class="e2e-tax__icon">${SOURCE_META[s].icon}</span>
            <span class="e2e-tax__label">${t(SOURCE_META[s].labelKey)}</span>
            <span class="e2e-tax__fix">${t(SOURCE_META[s].fixKey)}</span>
          </li>`).join('')}
      </ul>
      <div class="e2e-bridges">
        <button type="button" class="e2e-bridge" data-testid="e2e-bridge-tqx"
          title="${t('e2e.bridge.tqx.title')}">
          🔗 → ${t('advTab.testquality')}
        </button>
        <button type="button" class="e2e-bridge" data-testid="e2e-bridge-rbt"
          title="${t('e2e.bridge.rbt.title')}">
          🔗 → ${t('section.rbt')}
        </button>
      </div>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="e2e-quiz-start" data-testid="e2e-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === QUIZ_LOGS[0].correct;
    const shareEncoded = encodeResult({
      v: 1, explorer: 'e2e', explorerLabel: t('e2e.title'),
      mode: 'quiz', ts: Date.now(), lang: getLocale(),
      score: correct ? 1 : 0, total: 1,
      items: [{
        q: t('e2e.quiz.prompt'),
        a: state.quiz.answer || '',
        expected: QUIZ_LOGS[0].correct,
        ok: correct,
      }],
    });
    return `<div class="e2e-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="e2e-quiz-result">
      <p>${correct ? t('e2e.quiz.correct') : t('e2e.quiz.wrong')}</p>
      <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="e2e-quiz-share">📋 ${t('quiz.share.btn')}</button>
    </div>`;
  }
  return `
    <div class="e2e-quiz" data-testid="e2e-quiz">
      <p class="e2e-quiz-prompt">${t('e2e.quiz.prompt')}</p>
      <pre class="e2e-quiz-log">${t(QUIZ_LOGS[0].logKey)}</pre>
      ${FLAKINESS_SOURCES.map((s) => `
        <label class="e2e-quiz-option">
          <input type="radio" name="e2e-quiz" value="${s}" ${state.quiz.answer === s ? 'checked' : ''}>
          ${SOURCE_META[s].icon} ${t(SOURCE_META[s].labelKey)}
        </label>`).join('')}
      <button type="button" class="e2e-quiz-submit" data-testid="e2e-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="e2e-lab-start" data-testid="e2e-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="e2e-lab" data-testid="e2e-lab">
      <p class="e2e-lab-prompt">${t('e2e.lab.prompt')}</p>
      <textarea class="e2e-lab-textarea" data-testid="e2e-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="e2e-wrap" data-testid="e2e-wrap">
      <h2 class="e2e-title">${t('e2e.title')}</h2>
      <p class="e2e-desc">${t('e2e.desc')}</p>

      <div class="e2e-presets" data-testid="e2e-presets">
        ${JOURNEYS.map((j, i) => `
          <button type="button"
            class="e2e-preset-chip${i === state.journeyIdx ? ' e2e-preset-chip--active' : ''}"
            data-journey="${i}"
            data-testid="e2e-preset-${j.id}">${t(j.titleKey)}</button>`).join('')}
      </div>

      ${renderJourneyTimeline()}
      ${renderSim()}
      ${renderTaxonomy()}

      <section class="e2e-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-journey]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.journeyIdx = Number(btn.dataset.journey);
      state.sim = null;
      render();
    });
  });
  root.querySelector('[data-testid="e2e-sim-run"]')?.addEventListener('click', () => {
    state.sim = simulateRuns(currentJourney(), 100, Date.now() & 0x7fffffff);
    render();
  });
  root.querySelector('[data-testid="e2e-bridge-tqx"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="advanced"]')?.click();
    document.querySelector('[data-advanced-tab="testquality"]')?.click();
  });
  root.querySelector('[data-testid="e2e-bridge-rbt"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="rbt"]')?.click();
    document.querySelector('[data-testid="section-rbt"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  root.querySelector('[data-testid="e2e-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="e2e-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="e2e-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="e2e-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="e2e-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createE2EUserJourneyExplorer() {
  state.journeyIdx = 0;
  state.sim = null;
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab  = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}

export { JOURNEYS };
