import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';

// M4 — Continuous Testing Pipeline Explorer.
// Agile relies on fast automated feedback. Tests run in tiers: commit
// (fast), PR (slower), nightly (slowest). Assigning a test type to the
// wrong tier — e.g. e2e tests on every commit — wrecks feedback latency.
// Flaky tests and test-impact selection both change the picture.

// A typical test-pyramid suite: counts and per-test runtime (seconds).
const TEST_TYPES = [
  { id: 'unit', count: 500, time: 0.02 },
  { id: 'integration', count: 80, time: 0.5 },
  { id: 'e2e', count: 20, time: 20 },
];
const TIERS = ['commit', 'pr', 'nightly'];
const TIER_RANK = { commit: 0, pr: 1, nightly: 2 };
// A commit-tier run slower than this is "slow feedback".
const COMMIT_BUDGET = 120;
const IMPACT_FRACTION = 0.15;

const state = {
  tierOf: { unit: 'commit', integration: 'pr', e2e: 'nightly' },
  flaky: 0,
  impact: false,
  quiz: { active: false, phase: 'idle', answer: '' },
  lab: { active: false, text: '' },
};

let root;

// Test types that run at a given tier (this tier and every earlier one).
function typesAtTier(tier) {
  return TEST_TYPES.filter((tt) => TIER_RANK[state.tierOf[tt.id]] <= TIER_RANK[tier]);
}
// Tests actually executed at a tier — the commit tier shrinks under
// test-impact analysis.
function tierStats(tier) {
  const types = typesAtTier(tier);
  let tests = 0;
  let seconds = 0;
  for (const tt of types) {
    const factor = tier === 'commit' && state.impact ? IMPACT_FRACTION : 1;
    tests += tt.count * factor;
    seconds += tt.count * tt.time * factor;
  }
  return { tests: Math.round(tests), seconds };
}
// P(at least one flaky test fails spuriously) across `n` tests.
function falseFailureRate(n) {
  if (!state.flaky) return 0;
  return 1 - Math.pow(1 - state.flaky / 100, n);
}

function fmtTime(s) {
  if (s < 1) return s.toFixed(2) + 's';
  if (s < 90) return s.toFixed(1) + 's';
  return Math.floor(s / 60) + 'm ' + Math.round(s % 60) + 's';
}

function renderSuite() {
  return `
    <div class="ctp-suite" data-testid="ctp-suite">
      <h3>${t('ctp.suite.title')}</h3>
      <table class="ctp-suite-table">
        <thead><tr>
          <th>${t('ctp.col.type')}</th><th>${t('ctp.col.count')}</th>
          <th>${t('ctp.col.each')}</th><th>${t('ctp.col.tier')}</th>
        </tr></thead>
        <tbody>
          ${TEST_TYPES.map((tt) => `
            <tr>
              <td class="ctp-type">${t('ctp.type.' + tt.id)}</td>
              <td>${tt.count}</td>
              <td>${fmtTime(tt.time)}</td>
              <td>
                <select data-tier-of="${tt.id}" data-testid="ctp-tier-${tt.id}">
                  ${TIERS.map((tr) => `<option value="${tr}" ${state.tierOf[tt.id] === tr ? 'selected' : ''}>${t('ctp.tier.' + tr)}</option>`).join('')}
                </select>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
      <label class="ctp-impact-toggle">
        <input type="checkbox" data-testid="ctp-impact" ${state.impact ? 'checked' : ''}>
        ${t('ctp.impact.label')}
      </label>
    </div>`;
}

function renderPipeline() {
  return `
    <div class="ctp-pipeline" data-testid="ctp-pipeline">
      ${TIERS.map((tier, i) => {
        const st = tierStats(tier);
        let verdict = 'ok';
        if (tier === 'commit') verdict = st.seconds <= COMMIT_BUDGET ? 'fast' : 'slow';
        else if (tier === 'pr') verdict = st.seconds <= COMMIT_BUDGET * 5 ? 'ok' : 'slow';
        return `
          ${i > 0 ? '<div class="ctp-arrow" aria-hidden="true">→</div>' : ''}
          <div class="ctp-tier ctp-tier--${verdict}" data-testid="ctp-tier-card-${tier}">
            <div class="ctp-tier-name">${t('ctp.tier.' + tier)}</div>
            <div class="ctp-tier-time" data-testid="ctp-time-${tier}">${fmtTime(st.seconds)}</div>
            <div class="ctp-tier-tests">${t('ctp.tier.tests', { n: st.tests })}</div>
            <div class="ctp-tier-verdict">${t('ctp.verdict.' + verdict)}</div>
          </div>`;
      }).join('')}
    </div>`;
}

function renderFlaky() {
  const commitTests = tierStats('commit').tests;
  const rate = falseFailureRate(commitTests);
  return `
    <div class="ctp-flaky" data-testid="ctp-flaky">
      <h3>${t('ctp.flaky.title')}</h3>
      <div class="ctp-flaky-row">
        <span>${t('ctp.flaky.label')}</span>
        ${[0, 2, 5].map((f) => `
          <button type="button"
            class="ctp-flaky-btn ${state.flaky === f ? 'ctp-flaky-btn--active' : ''}"
            data-flaky="${f}" data-testid="ctp-flaky-${f}">${f}%</button>`).join('')}
      </div>
      <p class="ctp-flaky-result ${rate > 0.3 ? 'ctp-flaky-result--bad' : ''}">
        ${t('ctp.flaky.result', { pct: (rate * 100).toFixed(0) })}
      </p>
    </div>`;
}

function renderBridges() {
  return `
    <div class="ctp-bridges">
      <button type="button" class="ctp-bridge" data-testid="ctp-bridge-pyramid"
        title="${t('ctp.bridge.pyramid.title')}">🔗 → ${t('typesTab.adjuster')}</button>
      <button type="button" class="ctp-bridge" data-testid="ctp-bridge-flaky"
        title="${t('ctp.bridge.flaky.title')}">🔗 → ${t('acceptanceTab.flaky')}</button>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="ctp-quiz-start" data-testid="ctp-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    const shareEncoded = encodeResult({
      v: 1, explorer: 'ctp', explorerLabel: t('ctp.title'),
      mode: 'quiz', ts: Date.now(), lang: getLocale(),
      score: correct ? 1 : 0, total: 1,
      items: [{
        q: t('ctp.quiz.prompt'),
        a: state.quiz.answer ? t('ctp.quiz.' + state.quiz.answer) : '',
        expected: t('ctp.quiz.c'),
        ok: correct,
      }],
    });
    return `<div class="ctp-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="ctp-quiz-result">
      <p>${correct ? t('ctp.quiz.correct') : t('ctp.quiz.wrong')}</p>
      <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="ctp-quiz-share">📋 ${t('quiz.share.btn')}</button>
    </div>`;
  }
  return `
    <div class="ctp-quiz" data-testid="ctp-quiz">
      <p class="ctp-quiz-prompt">${t('ctp.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="ctp-quiz-option">
          <input type="radio" name="ctp-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('ctp.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="ctp-quiz-submit" data-testid="ctp-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="ctp-lab-start" data-testid="ctp-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="ctp-lab" data-testid="ctp-lab">
      <p class="ctp-lab-prompt">${t('ctp.lab.prompt')}</p>
      <textarea class="ctp-lab-textarea" data-testid="ctp-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="ctp-wrap" data-testid="ctp-wrap">
      <h2 class="ctp-title">${t('ctp.title')}</h2>
      <p class="ctp-desc">${t('ctp.desc')}</p>
      ${renderSuite()}
      ${renderPipeline()}
      ${renderFlaky()}
      ${renderBridges()}
      <section class="ctp-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-tier-of]').forEach((sel) => {
    sel.addEventListener('change', () => {
      state.tierOf[sel.dataset.tierOf] = sel.value;
      render();
    });
  });
  root.querySelector('[data-testid="ctp-impact"]')?.addEventListener('change', (e) => {
    state.impact = e.target.checked;
    render();
  });
  root.querySelectorAll('[data-flaky]').forEach((btn) => {
    btn.addEventListener('click', () => { state.flaky = Number(btn.dataset.flaky); render(); });
  });
  root.querySelector('[data-testid="ctp-bridge-pyramid"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="types"]')?.click();
    document.querySelector('[data-types-tab="adjuster"]')?.click();
  });
  root.querySelector('[data-testid="ctp-bridge-flaky"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="acceptance"]')?.click();
    document.querySelector('[data-acceptance-tab="flaky"]')?.click();
  });
  root.querySelector('[data-testid="ctp-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="ctp-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="ctp-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="ctp-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="ctp-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createContinuousTestingPipelineExplorer() {
  state.tierOf = { unit: 'commit', integration: 'pr', e2e: 'nightly' };
  state.flaky = 0;
  state.impact = false;
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}

export { TEST_TYPES, TIERS, tierStats, falseFailureRate };
