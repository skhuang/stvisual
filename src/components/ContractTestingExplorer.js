import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';

// Each scenario describes a consumer's expectation and the provider's
// actual response. verifyScenario() runs a small structural diff:
// breaking-change kinds (BC.*) come from real-world Pact semantics.
const SCENARIOS = [
  {
    id: 'web-orders',
    titleKey: 'ct.s.web.title',
    consumerId: 'web',
    providerId: 'orders',
    consumer: {
      request: { method: 'GET', path: '/orders/42', headers: { Accept: 'application/json' } },
      response: { status: 200, body: { id: 42, status: 'paid', total: 199.0 } },
    },
    provider: {
      response: { status: 200, body: { id: 42, status: 'paid', total: 199.0 } },
    },
  },
  {
    id: 'mobile-orders',
    titleKey: 'ct.s.mobile.title',
    consumerId: 'mobile',
    providerId: 'orders',
    consumer: {
      request: { method: 'GET', path: '/orders/42', headers: { Accept: 'application/json' } },
      response: { status: 200, body: { id: 42, status: 'paid', total: 199.0 } },
    },
    provider: {
      // Provider added an optional field 'currency'. Non-breaking — the
      // consumer simply ignores fields it doesn't read.
      response: { status: 200, body: { id: 42, status: 'paid', total: 199.0, currency: 'USD' } },
    },
  },
  {
    id: 'partner-payments',
    titleKey: 'ct.s.partner.title',
    consumerId: 'partner',
    providerId: 'payments',
    consumer: {
      request: { method: 'POST', path: '/charges', headers: { 'Content-Type': 'application/json' }, body: { amount: 199, currency: 'USD' } },
      // Consumer expects `idempotency_key` to be absent (optional in their version).
      response: { status: 201, body: { id: 'ch_1', amount: 199, currency: 'USD' } },
    },
    provider: {
      // Provider made `idempotency_key` required on the REQUEST, and renamed
      // `id` → `charge_id` on the RESPONSE. Both are breaking.
      requiredRequestFields: ['amount', 'currency', 'idempotency_key'],
      response: { status: 201, body: { charge_id: 'ch_1', amount: 199, currency: 'USD' } },
    },
  },
];

// ── Verification engine (pure, exported for tests) ──────────────────

export const BREAKAGE = {
  MISSING_REQUIRED_REQUEST: 'missing-required-request',
  MISSING_RESPONSE_FIELD:   'missing-response-field',
  STATUS_MISMATCH:          'status-mismatch',
};

export function verifyScenario(scenario) {
  const issues = [];

  if (scenario.provider.requiredRequestFields) {
    const req = scenario.consumer.request.body ?? {};
    for (const f of scenario.provider.requiredRequestFields) {
      if (!Object.prototype.hasOwnProperty.call(req, f)) {
        issues.push({ kind: BREAKAGE.MISSING_REQUIRED_REQUEST, field: f });
      }
    }
  }

  const ec = scenario.consumer.response;
  const ep = scenario.provider.response;
  if (ec.status !== ep.status) {
    issues.push({ kind: BREAKAGE.STATUS_MISMATCH, expected: ec.status, actual: ep.status });
  }
  for (const k of Object.keys(ec.body ?? {})) {
    if (!Object.prototype.hasOwnProperty.call(ep.body ?? {}, k)) {
      issues.push({ kind: BREAKAGE.MISSING_RESPONSE_FIELD, field: k });
    }
  }
  // Extra fields on provider response are NON-breaking; do not record them.

  return { passed: issues.length === 0, issues };
}

export function buildMatrix() {
  const consumers = [...new Set(SCENARIOS.map((s) => s.consumerId))];
  const providers = [...new Set(SCENARIOS.map((s) => s.providerId))];
  const cells = {};
  for (const s of SCENARIOS) cells[`${s.consumerId}|${s.providerId}`] = verifyScenario(s);
  return { consumers, providers, cells };
}

// ── State ───────────────────────────────────────────────────────────

const state = {
  scenarioIdx: 0,
  quiz: { active: false, phase: 'idle', answer: '' },
  lab:  { active: false, text: '' },
};

let root;

function pretty(obj) {
  return JSON.stringify(obj, null, 2);
}

function renderTriad() {
  const s = SCENARIOS[state.scenarioIdx];
  const v = verifyScenario(s);
  return `
    <div class="ct-triad" data-testid="ct-triad">
      <div class="ct-actor ct-actor--consumer">
        <header><span class="ct-actor__role">${t('ct.role.consumer')}</span>${t('ct.actor.' + s.consumerId)}</header>
        <h4>${t('ct.request')}</h4>
        <pre class="ct-json" data-testid="ct-consumer-req">${pretty(s.consumer.request)}</pre>
        <h4>${t('ct.expectedResp')}</h4>
        <pre class="ct-json" data-testid="ct-consumer-resp">${pretty(s.consumer.response)}</pre>
      </div>
      <div class="ct-broker">
        <header>${t('ct.broker')}</header>
        <p class="ct-broker__note">${t('ct.broker.desc')}</p>
        <pre class="ct-json" data-testid="ct-broker-contract">${pretty({ consumer: s.consumerId, provider: s.providerId, interaction: s.consumer })}</pre>
      </div>
      <div class="ct-actor ct-actor--provider">
        <header><span class="ct-actor__role">${t('ct.role.provider')}</span>${t('ct.actor.' + s.providerId)}</header>
        ${s.provider.requiredRequestFields ? `
          <h4>${t('ct.requiredFields')}</h4>
          <pre class="ct-json">${pretty(s.provider.requiredRequestFields)}</pre>` : ''}
        <h4>${t('ct.actualResp')}</h4>
        <pre class="ct-json" data-testid="ct-provider-resp">${pretty(s.provider.response)}</pre>
      </div>
    </div>
    ${renderVerdict(v)}`;
}

function renderVerdict(v) {
  if (v.passed) {
    return `
      <div class="ct-verdict ct-verdict--pass" data-testid="ct-verdict">
        <strong>${t('ct.verdict.pass')}</strong>
        <p>${t('ct.verdict.pass.desc')}</p>
      </div>`;
  }
  return `
    <div class="ct-verdict ct-verdict--fail" data-testid="ct-verdict">
      <strong>${t('ct.verdict.fail', { n: v.issues.length })}</strong>
      <ul class="ct-issues">
        ${v.issues.map((i) => `<li>${t('ct.issue.' + i.kind, { field: i.field ?? '', expected: i.expected ?? '', actual: i.actual ?? '' })}</li>`).join('')}
      </ul>
    </div>`;
}

function renderMatrix() {
  const { consumers, providers, cells } = buildMatrix();
  return `
    <div class="ct-matrix" data-testid="ct-matrix">
      <h3>${t('ct.matrix.title')}</h3>
      <table class="ct-matrix__table">
        <thead>
          <tr>
            <th></th>
            ${providers.map((p) => `<th>${t('ct.actor.' + p)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${consumers.map((c) => `
            <tr>
              <th>${t('ct.actor.' + c)}</th>
              ${providers.map((p) => {
                const cell = cells[`${c}|${p}`];
                if (!cell) return `<td class="ct-cell ct-cell--na">—</td>`;
                return `<td class="ct-cell ct-cell--${cell.passed ? 'pass' : 'fail'}"
                  data-testid="ct-cell-${c}-${p}">
                  ${cell.passed ? '✓' : `✗ ×${cell.issues.length}`}
                </td>`;
              }).join('')}
            </tr>`).join('')}
        </tbody>
      </table>
      <div class="ct-bridges">
        <button type="button" class="ct-bridge" data-testid="ct-bridge-inttest"
          title="${t('ct.bridge.inttest.title')}">
          🔗 → ${t('section.inttest')}
        </button>
      </div>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="ct-quiz-start" data-testid="ct-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'b';
    const shareEncoded = encodeResult({
      v: 1, explorer: 'ct', explorerLabel: t('ct.title'),
      mode: 'quiz', ts: Date.now(), lang: getLocale(),
      score: correct ? 1 : 0, total: 1,
      items: [{
        q: t('ct.quiz.prompt'),
        a: state.quiz.answer ? t('ct.quiz.' + state.quiz.answer) : '',
        expected: t('ct.quiz.b'),
        ok: correct,
      }],
    });
    return `<div class="ct-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="ct-quiz-result">
      <p>${correct ? t('ct.quiz.correct') : t('ct.quiz.wrong')}</p>
      <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="ct-quiz-share">📋 ${t('quiz.share.btn')}</button>
    </div>`;
  }
  return `
    <div class="ct-quiz" data-testid="ct-quiz">
      <p class="ct-quiz-prompt">${t('ct.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="ct-quiz-option">
          <input type="radio" name="ct-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('ct.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="ct-quiz-submit" data-testid="ct-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="ct-lab-start" data-testid="ct-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="ct-lab" data-testid="ct-lab">
      <p class="ct-lab-prompt">${t('ct.lab.prompt')}</p>
      <textarea class="ct-lab-textarea" data-testid="ct-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="ct-wrap" data-testid="ct-wrap">
      <h2 class="ct-title">${t('ct.title')}</h2>
      <p class="ct-desc">${t('ct.desc')}</p>

      <div class="ct-presets" data-testid="ct-presets">
        ${SCENARIOS.map((s, i) => `
          <button type="button"
            class="ct-preset-chip${i === state.scenarioIdx ? ' ct-preset-chip--active' : ''}"
            data-scenario="${i}"
            data-testid="ct-preset-${s.id}">${t(s.titleKey)}</button>`).join('')}
      </div>

      ${renderTriad()}
      ${renderMatrix()}

      <section class="ct-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-scenario]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.scenarioIdx = Number(btn.dataset.scenario);
      render();
    });
  });
  root.querySelector('[data-testid="ct-bridge-inttest"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="inttest"]')?.click();
    document.querySelector('[data-testid="section-inttest"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  root.querySelector('[data-testid="ct-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="ct-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="ct-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="ct-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="ct-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createContractTestingExplorer() {
  state.scenarioIdx = 0;
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab  = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}

export { SCENARIOS };
