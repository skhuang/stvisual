import { t } from '../i18n/index.js';

const DIMENSIONS = [
  { id: 'buildable',  icon: '🔨', weight: 1 },
  { id: 'nonflaky',   icon: '🔁', weight: 1 },
  { id: 'hardening',  icon: '🛡',  weight: 1 },
  { id: 'relevant',   icon: '🎯', weight: 1 },
  { id: 'style',      icon: '✏️', weight: 1 },
];

// 6 test scenarios with known quality profiles
const SCENARIOS = [
  {
    id: 1,
    title: 'tqx.s1.title',
    code: `@Test
fun testAdd() {
    assertEquals(4, add(2, 2))
    assertEquals(0, add(0, 0))
}`,
    verdicts: { buildable: true, nonflaky: true, hardening: false, relevant: true, style: true },
    explanations: {
      hardening: 'tqx.s1.expl.hardening',
      relevant: 'tqx.s1.expl.relevant',
    },
    accepted: true,
    acceptedReason: 'tqx.s1.accepted',
  },
  {
    id: 2,
    title: 'tqx.s2.title',
    code: `@Test
fun testRandom() {
    val x = Random.nextInt()
    assertTrue(process(x) >= 0)
}`,
    verdicts: { buildable: true, nonflaky: false, hardening: false, relevant: true, style: true },
    explanations: {
      nonflaky: 'tqx.s2.expl.nonflaky',
    },
    accepted: false,
    acceptedReason: 'tqx.s2.rejected',
  },
  {
    id: 3,
    title: 'tqx.s3.title',
    code: `@Test
fun testPrivacyNullUser() {
    val tracker = AnalyticsTracker()
    tracker.logEvent(null, "click")
    assertNull(tracker.lastUserId)
}`,
    verdicts: { buildable: true, nonflaky: true, hardening: true, relevant: true, style: true },
    explanations: {},
    accepted: true,
    acceptedReason: 'tqx.s3.accepted',
  },
  {
    id: 4,
    title: 'tqx.s4.title',
    code: `@Test
fun TEST_boundary_AGE() {
    assert(checkAge(18))
    assert(!checkAge(17))
}`,
    verdicts: { buildable: true, nonflaky: true, hardening: true, relevant: true, style: false },
    explanations: {
      style: 'tqx.s4.expl.style',
    },
    accepted: false,
    acceptedReason: 'tqx.s4.rejected',
  },
  {
    id: 5,
    title: 'tqx.s5.title',
    code: `@Test
fun testSomething() {
    val result = doStuff()
    assertNotNull(result)
}`,
    verdicts: { buildable: true, nonflaky: true, hardening: false, relevant: false, style: false },
    explanations: {
      hardening: 'tqx.s5.expl.hardening',
      relevant: 'tqx.s5.expl.relevant',
      style: 'tqx.s5.expl.style',
    },
    accepted: false,
    acceptedReason: 'tqx.s5.rejected',
  },
  {
    id: 6,
    title: 'tqx.s6.title',
    code: `@Test
fun testIsAdultBoundary() {
    assertFalse(isAdult(17))
    assertTrue(isAdult(18))
    assertTrue(isAdult(65))
}`,
    verdicts: { buildable: true, nonflaky: true, hardening: true, relevant: true, style: true },
    explanations: {},
    accepted: true,
    acceptedReason: 'tqx.s6.accepted',
  },
];

const ACCEPTANCE_DATA = [
  { labelKey: 'tqx.acc.coverage', pct: 51 },
  { labelKey: 'tqx.acc.corner', pct: 27 },
  { labelKey: 'tqx.acc.privacy', pct: 36 },
];

const state = {
  scenarioIdx: 0,
  ratings: {},  // { [scenarioId]: { [dimId]: boolean } }
  revealed: new Set(),
  quiz: { active: false, phase: 'idle', answer: '' },
  lab: { active: false, text: '' },
};

let root;

function computeScore(scenarioId, ratings) {
  const r = ratings[scenarioId];
  if (!r) return null;
  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
  let correct = 0;
  for (const d of DIMENSIONS) {
    if (r[d.id] === scenario.verdicts[d.id]) correct++;
  }
  return correct;
}

function renderScenario() {
  const sc = SCENARIOS[state.scenarioIdx];
  const r = state.ratings[sc.id] || {};
  const revealed = state.revealed.has(sc.id);
  const score = computeScore(sc.id, state.ratings);

  return `
    <div class="tqx-scenario" data-testid="tqx-scenario">
      <div class="tqx-scenario-header">
        <h3>${t(sc.title)}</h3>
        <span class="tqx-scenario-counter">${state.scenarioIdx + 1} / ${SCENARIOS.length}</span>
      </div>
      <pre class="tqx-code">${sc.code}</pre>

      <div class="tqx-dims" data-testid="tqx-dims">
        ${DIMENSIONS.map((d) => {
          const userVal = r[d.id];
          const correct = sc.verdicts[d.id];
          const showFeedback = revealed && userVal !== undefined;
          const isRight = userVal === correct;
          return `
            <div class="tqx-dim ${showFeedback ? (isRight ? 'tqx-dim--right' : 'tqx-dim--wrong') : ''}">
              <span class="tqx-dim-icon">${d.icon}</span>
              <span class="tqx-dim-name">${t('tqx.dim.' + d.id)}</span>
              <div class="tqx-dim-btns">
                <button type="button"
                  class="tqx-dim-btn ${userVal === true ? 'tqx-dim-btn--yes' : ''}"
                  data-dim="${d.id}" data-val="true"
                  data-testid="tqx-dim-yes-${d.id}"
                  ${revealed ? 'disabled' : ''}
                >✓</button>
                <button type="button"
                  class="tqx-dim-btn ${userVal === false ? 'tqx-dim-btn--no' : ''}"
                  data-dim="${d.id}" data-val="false"
                  data-testid="tqx-dim-no-${d.id}"
                  ${revealed ? 'disabled' : ''}
                >✗</button>
              </div>
              ${showFeedback && !isRight ? `
                <span class="tqx-dim-feedback">${t('tqx.expected')}: ${correct ? '✓' : '✗'}</span>
              ` : ''}
              ${showFeedback && sc.explanations[d.id] ? `
                <p class="tqx-dim-expl">${t(sc.explanations[d.id])}</p>
              ` : ''}
            </div>`;
        }).join('')}
      </div>

      <div class="tqx-actions">
        ${!revealed ? `
          <button type="button" class="tqx-reveal-btn" data-testid="tqx-reveal"
            ${Object.keys(r).length < DIMENSIONS.length ? 'disabled' : ''}>
            ${t('tqx.reveal')}
          </button>
        ` : `
          <div class="tqx-verdict ${sc.accepted ? 'tqx-verdict--accepted' : 'tqx-verdict--rejected'}">
            <strong>${sc.accepted ? t('tqx.accepted') : t('tqx.rejected')}</strong>
            <span>${t(sc.acceptedReason)}</span>
          </div>
          <div class="tqx-score">${t('tqx.score', { n: score, total: DIMENSIONS.length })}</div>
        `}
      </div>

      <div class="tqx-nav-row">
        <button type="button" class="tqx-nav-btn" data-testid="tqx-prev"
          ${state.scenarioIdx === 0 ? 'disabled' : ''}>← ${t('emx.nav.prev')}</button>
        <button type="button" class="tqx-nav-btn" data-testid="tqx-next"
          ${state.scenarioIdx === SCENARIOS.length - 1 ? 'disabled' : ''}>${t('emx.nav.next')} →</button>
      </div>
    </div>`;
}

function renderAcceptance() {
  const maxPct = Math.max(...ACCEPTANCE_DATA.map((d) => d.pct));
  return `
    <div class="tqx-acceptance" data-testid="tqx-acceptance">
      <h3>${t('tqx.acc.title')}</h3>
      <p class="tqx-acc-note">${t('tqx.acc.note')}</p>
      ${ACCEPTANCE_DATA.map((d) => `
        <div class="tqx-acc-row">
          <span class="tqx-acc-label">${t(d.labelKey)}</span>
          <div class="tqx-acc-bar-wrap">
            <div class="tqx-acc-bar" style="width:${(d.pct / maxPct) * 100}%"></div>
          </div>
          <span class="tqx-acc-pct">${d.pct}%</span>
        </div>`).join('')}
      <p class="tqx-acc-source">${t('tqx.acc.source')}</p>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="tqx-quiz-start" data-testid="tqx-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'b';
    return `<div class="tqx-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="tqx-quiz-result">
      <p>${correct ? t('tqx.quiz.correct') : t('tqx.quiz.wrong')}</p>
    </div>`;
  }
  return `
    <div class="tqx-quiz" data-testid="tqx-quiz">
      <p class="tqx-quiz-prompt">${t('tqx.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="tqx-quiz-option">
          <input type="radio" name="tqx-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('tqx.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="tqx-quiz-submit" data-testid="tqx-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="tqx-lab-start" data-testid="tqx-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="tqx-lab" data-testid="tqx-lab">
      <p class="tqx-lab-prompt">${t('tqx.lab.prompt')}</p>
      <textarea class="tqx-lab-textarea" data-testid="tqx-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="tqx-wrap" data-testid="tqx-wrap">
      <div class="emx-paper-cite" data-testid="tqx-paper-cite">
        <div class="emx-paper-header">
          <span class="emx-paper-badge">arXiv</span>
          <a class="emx-paper-link" href="https://arxiv.org/abs/2501.12862" target="_blank" rel="noopener noreferrer">
            Mutation-Guided LLM-based Test Generation at Meta
          </a>
          <span class="emx-paper-venue">FSE 2025 · arXiv:2501.12862</span>
        </div>
      </div>
      <h2 class="tqx-title">${t('tqx.title')}</h2>
      <p class="tqx-desc">${t('tqx.desc')}</p>
      <div class="tqx-dims-legend" data-testid="tqx-dims-legend">
        ${DIMENSIONS.map((d) => `
          <div class="tqx-legend-item">
            <span>${d.icon}</span>
            <span>${t('tqx.dim.' + d.id)}</span>
            <span class="tqx-legend-desc">${t('tqx.dim.' + d.id + '.desc')}</span>
          </div>`).join('')}
      </div>
      ${renderScenario()}
      ${renderAcceptance()}
      <section class="tqx-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-dim][data-val]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sc = SCENARIOS[state.scenarioIdx];
      if (!state.ratings[sc.id]) state.ratings[sc.id] = {};
      state.ratings[sc.id][btn.dataset.dim] = btn.dataset.val === 'true';
      render();
    });
  });
  root.querySelector('[data-testid="tqx-reveal"]')?.addEventListener('click', () => {
    state.revealed.add(SCENARIOS[state.scenarioIdx].id);
    render();
  });
  root.querySelector('[data-testid="tqx-prev"]')?.addEventListener('click', () => {
    if (state.scenarioIdx > 0) { state.scenarioIdx--; render(); }
  });
  root.querySelector('[data-testid="tqx-next"]')?.addEventListener('click', () => {
    if (state.scenarioIdx < SCENARIOS.length - 1) { state.scenarioIdx++; render(); }
  });
  root.querySelector('[data-testid="tqx-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' }; render();
  });
  root.querySelectorAll('input[name="tqx-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="tqx-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done'; render();
  });
  root.querySelector('[data-testid="tqx-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true; render();
  });
  root.querySelector('[data-testid="tqx-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createTestQualityExplorer() {
  state.scenarioIdx = 0;
  state.ratings = {};
  state.revealed = new Set();
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}
