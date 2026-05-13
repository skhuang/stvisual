import { t, getLocale } from '../i18n/index.js';
import { encodeResult, buildShareUrl } from '../utils/resultExporter.js';

function escapeHtml(v = '') {
  return String(v)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

/* ── Module graph definition ──
 *
 *         App (root)
 *        /          \
 *     Login         Order
 *       |             |
 *      DB          Payment
 *
 * Nodes: App, Login, Order, DB, Payment
 * Edges: App→Login, App→Order, Login→DB, Order→Payment
 */

const NODES = [
  { id: 'App',     label: 'App',     x: 200, y: 40,  level: 0 },
  { id: 'Login',   label: 'Login',   x: 90,  y: 130, level: 1 },
  { id: 'Order',   label: 'Order',   x: 310, y: 130, level: 1 },
  { id: 'DB',      label: 'DB',      x: 90,  y: 220, level: 2 },
  { id: 'Payment', label: 'Payment', x: 310, y: 220, level: 2 },
];
const EDGES = [
  ['App', 'Login'],
  ['App', 'Order'],
  ['Login', 'DB'],
  ['Order', 'Payment'],
];

/* Status per node: 'tested' | 'stub' | 'driver' | 'pending' */
const STRATEGIES = {
  bigbang: {
    key: 'inttest.strategy.bigbang',
    steps: [
      {
        descKey: 'bigbang.step1',
        tested: ['App', 'Login', 'Order', 'DB', 'Payment'],
        stubs: [], drivers: [],
      },
    ],
    stubCount: 0,
    driverCount: 0,
  },
  topdown: {
    key: 'inttest.strategy.topdown',
    steps: [
      {
        descKey: 'topdown.step1',
        tested: ['App'],
        stubs: ['Login', 'Order'], drivers: [],
      },
      {
        descKey: 'topdown.step2',
        tested: ['App', 'Login'],
        stubs: ['Order', 'DB'], drivers: [],
      },
      {
        descKey: 'topdown.step3',
        tested: ['App', 'Login', 'Order'],
        stubs: ['DB', 'Payment'], drivers: [],
      },
      {
        descKey: 'topdown.step4',
        tested: ['App', 'Login', 'Order', 'DB', 'Payment'],
        stubs: [], drivers: [],
      },
    ],
    stubCount: 2,
    driverCount: 0,
  },
  bottomup: {
    key: 'inttest.strategy.bottomup',
    steps: [
      {
        descKey: 'bottomup.step1',
        tested: ['DB', 'Payment'],
        stubs: [], drivers: ['Login', 'Order'],
      },
      {
        descKey: 'bottomup.step2',
        tested: ['DB', 'Payment', 'Login'],
        stubs: [], drivers: ['App', 'Order'],
      },
      {
        descKey: 'bottomup.step3',
        tested: ['DB', 'Payment', 'Login', 'Order'],
        stubs: [], drivers: ['App'],
      },
      {
        descKey: 'bottomup.step4',
        tested: ['App', 'Login', 'Order', 'DB', 'Payment'],
        stubs: [], drivers: [],
      },
    ],
    stubCount: 0,
    driverCount: 2,
  },
  sandwich: {
    key: 'inttest.strategy.sandwich',
    steps: [
      {
        descKey: 'sandwich.step1',
        tested: ['Login', 'Order'],
        stubs: ['DB', 'Payment'], drivers: ['App'],
      },
      {
        descKey: 'sandwich.step2',
        tested: ['App', 'Login', 'Order'],
        stubs: ['DB', 'Payment'], drivers: [],
      },
      {
        descKey: 'sandwich.step3',
        tested: ['App', 'Login', 'Order', 'DB', 'Payment'],
        stubs: [], drivers: [],
      },
    ],
    stubCount: 2,
    driverCount: 1,
  },
};

// Step descriptions (added inline — bilingual via i18n keys)
const STEP_DESCS = {
  'bigbang.step1':   { en: 'All modules integrated and tested simultaneously. No stubs or drivers needed, but failures are hard to isolate.', zh: '所有模組同時整合並測試。不需要替身，但故障難以隔離。' },
  'topdown.step1':   { en: 'Test App (top). Login and Order are not ready — use Stubs to simulate them.', zh: '測試 App（頂層）。Login 和 Order 尚未就緒 — 使用 Stub 模擬它們。' },
  'topdown.step2':   { en: 'Add Login. Order is stubbed; DB (Login\'s dep) is stubbed.', zh: '加入 Login。Order 仍為 Stub；DB（Login 的相依）也使用 Stub。' },
  'topdown.step3':   { en: 'Add Order. DB and Payment are both stubbed.', zh: '加入 Order。DB 與 Payment 仍為 Stub。' },
  'topdown.step4':   { en: 'All modules integrated. No stubs required.', zh: '所有模組整合完成。不再需要 Stub。' },
  'bottomup.step1':  { en: 'Test leaf modules DB and Payment first. Drivers simulate Login/Order calling them.', zh: '先測試葉節點 DB 和 Payment。Driver 模擬 Login/Order 呼叫它們。' },
  'bottomup.step2':  { en: 'Add Login (real module, uses real DB). App and Order still need Drivers.', zh: '加入 Login（真實模組，使用真實 DB）。App 和 Order 仍需 Driver。' },
  'bottomup.step3':  { en: 'Add Order (uses real Payment). App still needs a Driver.', zh: '加入 Order（使用真實 Payment）。App 仍需 Driver。' },
  'bottomup.step4':  { en: 'Add App (top). Full integration complete — no drivers needed.', zh: '加入 App（頂層）。完整整合，不再需要 Driver。' },
  'sandwich.step1':  { en: 'Test middle layer (Login, Order) simultaneously. Stubs for DB/Payment; Driver for App.', zh: '同時測試中間層（Login、Order）。DB/Payment 使用 Stub；App 使用 Driver。' },
  'sandwich.step2':  { en: 'Top-down from App: add App, keep DB/Payment stubs.', zh: '從 App 進行 Top-down：加入 App，DB/Payment 仍為 Stub。' },
  'sandwich.step3':  { en: 'Bottom-up: add DB and Payment. Full integration complete.', zh: 'Bottom-up：加入 DB 和 Payment。完整整合完成。' },
};

const NODE_R = 28;
const SVG_W = 400;
const SVG_H = 280;

export function createIntegrationTestingExplorer() {
  const root = document.createElement('div');
  root.className = 'inttest-explorer';
  root.dataset.testid = 'inttest-explorer';

  let activeStrategy = 'topdown';
  let activeStep = 0;

  const inttestQuiz = { active: false, phase: 'question', answer: '' };
  const inttestLabReflect = { active: false, a1: '', a2: '' };

  /* ── SVG builder ── */

  function buildSVG(step) {
    const testedSet = new Set(step.tested);
    const stubSet   = new Set(step.stubs);
    const driverSet = new Set(step.drivers);

    const COLOR = {
      tested:  '#059669',
      stub:    '#94a3b8',
      driver:  '#f59e0b',
      pending: '#e2e8f0',
    };
    const STROKE = {
      tested:  '#047857',
      stub:    '#64748b',
      driver:  '#d97706',
      pending: '#94a3b8',
    };
    const TEXT_COLOR = {
      tested:  '#fff',
      stub:    '#475569',
      driver:  '#78350f',
      pending: '#64748b',
    };

    const edgeSVG = EDGES.map(([from, to]) => {
      const fn = NODES.find((n) => n.id === from);
      const tn = NODES.find((n) => n.id === to);
      const dx = tn.x - fn.x;
      const dy = tn.y - fn.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const x1 = fn.x + (dx / len) * NODE_R;
      const y1 = fn.y + (dy / len) * NODE_R;
      const x2 = tn.x - (dx / len) * NODE_R;
      const y2 = tn.y - (dy / len) * NODE_R;
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#cbd5e1" stroke-width="2" marker-end="url(#arrow)"/>`;
    }).join('');

    const nodeSVG = NODES.map((n) => {
      let status = 'pending';
      if (testedSet.has(n.id)) status = 'tested';
      else if (stubSet.has(n.id)) status = 'stub';
      else if (driverSet.has(n.id)) status = 'driver';

      const badgeText = status === 'stub' ? 'S' : status === 'driver' ? 'D' : '';
      return `
<circle cx="${n.x}" cy="${n.y}" r="${NODE_R}" fill="${COLOR[status]}" stroke="${STROKE[status]}" stroke-width="2"/>
<text x="${n.x}" y="${n.y - (badgeText ? 5 : 0)}" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="700" fill="${TEXT_COLOR[status]}">${escapeHtml(n.label)}</text>
${badgeText ? `<text x="${n.x}" y="${n.y + 12}" text-anchor="middle" font-size="9" fill="${TEXT_COLOR[status]}" opacity="0.85">[${badgeText}]</text>` : ''}`;
    }).join('');

    return `<svg class="inttest-svg" width="${SVG_W}" height="${SVG_H}" viewBox="0 0 ${SVG_W} ${SVG_H}" aria-label="${t('inttest.graph.title')}">
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#cbd5e1"/>
    </marker>
  </defs>
  ${edgeSVG}
  ${nodeSVG}
</svg>`;
  }

  /* ── quiz ── */

  function renderQuizPanel() {
    if (!inttestQuiz.active) return '';
    const correctCount = 2; // Top-down step 1 stubs: Login, Order
    if (inttestQuiz.phase === 'graded') {
      const userAns = parseInt(inttestQuiz.answer, 10);
      const ok = userAns === correctCount;
      const shareEncoded = encodeResult({
        v: 1, explorer: 'inttest', explorerLabel: t('quiz.inttest.title'),
        mode: 'quiz', ts: Date.now(), lang: getLocale(),
        score: ok ? 1 : 0, total: 1,
        items: [{ q: t('quiz.inttest.prompt'), a: String(inttestQuiz.answer), expected: String(correctCount), ok }],
      });
      return `
        <div class="quiz-panel" data-testid="inttest-quiz-panel">
          <div class="quiz-header">
            <span>${t('quiz.inttest.title')}</span>
            <button type="button" class="quiz-close-btn" data-testid="inttest-quiz-close">✕</button>
          </div>
          <p class="quiz-prompt">${t('quiz.inttest.prompt')}</p>
          <p class="quiz-score ${ok ? 'quiz-score--perfect' : 'quiz-score--wrong'}">
            ${ok ? t('quiz.graph.perfect') : ''}
            ${t('quiz.inttest.answer', { count: correctCount })}
          </p>
          <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="inttest-quiz-share">📋 ${t('quiz.share.btn')}</button>
          <button type="button" class="quiz-start-btn" data-testid="inttest-quiz-reset">${t('quiz.reset')}</button>
        </div>`;
    }
    return `
      <div class="quiz-panel" data-testid="inttest-quiz-panel">
        <div class="quiz-header">
          <span>${t('quiz.inttest.title')}</span>
          <button type="button" class="quiz-close-btn" data-testid="inttest-quiz-close">✕</button>
        </div>
        <p class="quiz-prompt">${t('quiz.inttest.prompt')}</p>
        <div class="quiz-bva-inputs">
          <label class="quiz-bva-field">
            ${t('quiz.inttest.label')}
            <input type="number" min="0" class="quiz-input" data-testid="inttest-quiz-input" value="${escapeHtml(inttestQuiz.answer)}" />
          </label>
        </div>
        <button type="button" class="quiz-start-btn" data-testid="inttest-quiz-check">${t('quiz.check')}</button>
      </div>`;
  }

  /* ── lab reflect ── */

  function renderLabReflectPanel() {
    if (!inttestLabReflect.active) return '';
    return `
      <div class="lab-panel" data-testid="inttest-lab-reflect-panel">
        <div class="lab-panel-header">
          <span class="lab-panel-title">${t('lab.reflect.title')}</span>
          <button type="button" class="quiz-close-btn" data-testid="inttest-lab-reflect-close">✕</button>
        </div>
        <div class="lab-reflect-field">
          <label class="lab-reflect-label">${t('lab.reflect.q.inttest.1')}</label>
          <textarea class="lab-reflect-textarea" data-testid="inttest-lab-reflect-a1" rows="3" placeholder="${t('lab.reflect.placeholder')}">${escapeHtml(inttestLabReflect.a1)}</textarea>
        </div>
        <div class="lab-reflect-field">
          <label class="lab-reflect-label">${t('lab.reflect.q.inttest.2')}</label>
          <textarea class="lab-reflect-textarea" data-testid="inttest-lab-reflect-a2" rows="3" placeholder="${t('lab.reflect.placeholder')}">${escapeHtml(inttestLabReflect.a2)}</textarea>
        </div>
        <div class="lab-reflect-actions">
          <button type="button" class="quiz-share-btn" data-testid="inttest-lab-reflect-share">📋 ${t('quiz.share.btn')}</button>
        </div>
      </div>`;
  }

  /* ── main render ── */

  function render() {
    const strategy = STRATEGIES[activeStrategy];
    const step = strategy.steps[activeStep];
    const locale = getLocale();
    const descEntry = STEP_DESCS[step.descKey];
    const desc = descEntry ? (locale === 'zh' ? descEntry.zh : descEntry.en) : '';

    const stratTabs = Object.keys(STRATEGIES).map((sid) => `
      <button type="button" class="inttest-strategy-tab ${sid === activeStrategy ? 'inttest-strategy-tab--active' : ''}"
        data-strategy="${sid}" data-testid="inttest-tab-${sid}">${t(STRATEGIES[sid].key)}</button>`).join('');

    const svgHtml = buildSVG(step);

    const legendHtml = `
      <div class="inttest-legend">
        <div class="inttest-legend-item"><span class="inttest-legend-dot inttest-legend-dot--tested"></span>${t('inttest.legend.tested')}</div>
        <div class="inttest-legend-item"><span class="inttest-legend-dot inttest-legend-dot--stub"></span>${t('inttest.legend.stub')}</div>
        <div class="inttest-legend-item"><span class="inttest-legend-dot inttest-legend-dot--driver"></span>${t('inttest.legend.driver')}</div>
        <div class="inttest-legend-item"><span class="inttest-legend-dot inttest-legend-dot--pending"></span>${t('inttest.legend.pending')}</div>
      </div>`;

    const stubsHtml = step.stubs.length
      ? step.stubs.map((s) => `<span class="inttest-stub-chip">${escapeHtml(s)}</span>`).join('')
      : `<span style="color:#94a3b8">${t('inttest.doubles.none')}</span>`;

    const driversHtml = step.drivers.length
      ? step.drivers.map((d) => `<span class="inttest-driver-chip">${escapeHtml(d)}</span>`).join('')
      : `<span style="color:#94a3b8">${t('inttest.doubles.none')}</span>`;

    const compareRows = Object.keys(STRATEGIES).map((sid) => {
      const s = STRATEGIES[sid];
      return `<tr>
        <td><strong>${t(s.key)}</strong></td>
        <td>${s.stubCount}</td>
        <td>${s.driverCount}</td>
        <td class="inttest-badge--pro">${escapeHtml(t(`inttest.${sid}.pros`))}</td>
        <td class="inttest-badge--con">${escapeHtml(t(`inttest.${sid}.cons`))}</td>
      </tr>`;
    }).join('');

    const metricEncoded = encodeResult({
      v: 1, explorer: 'inttest', explorerLabel: t('section.inttest'),
      mode: 'lab-metric', ts: Date.now(), lang: getLocale(),
      score: 1, total: 1,
      items: [{ q: `Strategy: ${t(strategy.key)} · Stubs: ${strategy.stubCount} · Drivers: ${strategy.driverCount}`, a: '', ok: true }],
    });

    root.innerHTML = `
      <div class="inttest-strategy-tabs" data-testid="inttest-strategy-tabs">
        ${stratTabs}
      </div>

      <div class="inttest-main">
        <div class="inttest-graph-card">
          <p class="inttest-graph-title">${t('inttest.graph.title')}</p>
          <div class="inttest-svg-wrap" data-testid="inttest-svg-wrap">${svgHtml}</div>
          ${legendHtml}
        </div>

        <div class="inttest-step-card">
          <div class="inttest-step-header">
            <span class="inttest-step-label">${t('inttest.step.label')} ${activeStep + 1} ${t('inttest.step.of')} ${strategy.steps.length}</span>
            <div class="inttest-step-nav">
              <button type="button" class="inttest-step-btn" data-testid="inttest-prev" ${activeStep === 0 ? 'disabled' : ''}>${t('inttest.step.prev')}</button>
              <button type="button" class="inttest-step-btn" data-testid="inttest-next" ${activeStep === strategy.steps.length - 1 ? 'disabled' : ''}>${t('inttest.step.next')}</button>
            </div>
          </div>
          <p class="inttest-step-desc" data-testid="inttest-step-desc">${escapeHtml(desc)}</p>
          <div class="inttest-doubles-row">
            <span class="inttest-doubles-label">${t('inttest.doubles.stubs')}</span>
            ${stubsHtml}
          </div>
          <div class="inttest-doubles-row">
            <span class="inttest-doubles-label">${t('inttest.doubles.drivers')}</span>
            ${driversHtml}
          </div>
        </div>
      </div>

      <div class="inttest-compare-card">
        <p class="inttest-compare-title">${t('inttest.compare.title')}</p>
        <div style="overflow-x:auto">
          <table class="inttest-compare-table" data-testid="inttest-compare-table">
            <thead>
              <tr>
                <th>${t('inttest.compare.strategy')}</th>
                <th>${t('inttest.compare.stubs')}</th>
                <th>${t('inttest.compare.drivers')}</th>
                <th>${t('inttest.compare.pros')}</th>
                <th>${t('inttest.compare.cons')}</th>
              </tr>
            </thead>
            <tbody>${compareRows}</tbody>
          </table>
        </div>
      </div>

      <div class="inttest-bottom-card">
        <div class="inttest-bottom-header">
          <h4 class="inttest-bottom-title">${t('section.inttest')}</h4>
          <div class="inttest-bottom-actions">
            ${!inttestQuiz.active ? `<button type="button" class="quiz-start-btn" data-testid="inttest-quiz-start">${t('quiz.start')}</button>` : ''}
            ${!inttestLabReflect.active ? `<button type="button" class="quiz-start-btn" data-testid="inttest-lab-reflect-start">${t('lab.reflect.start')}</button>` : ''}
            <button type="button" class="quiz-share-btn" data-share-payload="${metricEncoded}" data-testid="inttest-lab-metric">📊 ${t('lab.metric.record')}</button>
          </div>
        </div>
        ${renderQuizPanel()}
        ${renderLabReflectPanel()}
      </div>

      <p class="inttest-hint">${t('codecov.hint').replace('MC/DC ⊇ Condition ⊇ Branch ⊇ Statement', 'Big Bang → Top-down → Bottom-up → Sandwich: each adds more structure and isolation.')}</p>
    `;

    bindEvents();
  }

  /* ── event binding ── */

  function bindEvents() {
    root.querySelectorAll('[data-strategy]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeStrategy = btn.dataset.strategy;
        activeStep = 0;
        render();
      });
    });

    const prevBtn = root.querySelector('[data-testid="inttest-prev"]');
    if (prevBtn) prevBtn.addEventListener('click', () => {
      if (activeStep > 0) { activeStep--; render(); }
    });

    const nextBtn = root.querySelector('[data-testid="inttest-next"]');
    if (nextBtn) nextBtn.addEventListener('click', () => {
      const s = STRATEGIES[activeStrategy];
      if (activeStep < s.steps.length - 1) { activeStep++; render(); }
    });

    // Quiz
    const qStart = root.querySelector('[data-testid="inttest-quiz-start"]');
    if (qStart) qStart.addEventListener('click', () => {
      inttestQuiz.active = true; inttestQuiz.phase = 'question'; inttestQuiz.answer = ''; render();
    });

    const qClose = root.querySelector('[data-testid="inttest-quiz-close"]');
    if (qClose) qClose.addEventListener('click', () => { inttestQuiz.active = false; render(); });

    const qCheck = root.querySelector('[data-testid="inttest-quiz-check"]');
    if (qCheck) qCheck.addEventListener('click', () => {
      const inp = root.querySelector('[data-testid="inttest-quiz-input"]');
      inttestQuiz.answer = inp ? inp.value : '';
      inttestQuiz.phase = 'graded';
      render();
    });

    const qReset = root.querySelector('[data-testid="inttest-quiz-reset"]');
    if (qReset) qReset.addEventListener('click', () => {
      inttestQuiz.phase = 'question'; inttestQuiz.answer = ''; render();
    });

    // Lab Reflect
    const lrStart = root.querySelector('[data-testid="inttest-lab-reflect-start"]');
    if (lrStart) lrStart.addEventListener('click', () => { inttestLabReflect.active = true; render(); });

    const lrClose = root.querySelector('[data-testid="inttest-lab-reflect-close"]');
    if (lrClose) lrClose.addEventListener('click', () => {
      const a1el = root.querySelector('[data-testid="inttest-lab-reflect-a1"]');
      const a2el = root.querySelector('[data-testid="inttest-lab-reflect-a2"]');
      if (a1el) inttestLabReflect.a1 = a1el.value;
      if (a2el) inttestLabReflect.a2 = a2el.value;
      inttestLabReflect.active = false;
      render();
    });

    const lrA1 = root.querySelector('[data-testid="inttest-lab-reflect-a1"]');
    if (lrA1) lrA1.addEventListener('input', () => { inttestLabReflect.a1 = lrA1.value; });

    const lrA2 = root.querySelector('[data-testid="inttest-lab-reflect-a2"]');
    if (lrA2) lrA2.addEventListener('input', () => { inttestLabReflect.a2 = lrA2.value; });

    const lrShare = root.querySelector('[data-testid="inttest-lab-reflect-share"]');
    if (lrShare) lrShare.addEventListener('click', () => {
      const a1 = root.querySelector('[data-testid="inttest-lab-reflect-a1"]')?.value || inttestLabReflect.a1;
      const a2 = root.querySelector('[data-testid="inttest-lab-reflect-a2"]')?.value || inttestLabReflect.a2;
      const url = buildShareUrl(encodeResult({
        v: 1, explorer: 'inttest', explorerLabel: t('lab.reflect.title'),
        mode: 'lab-reflect', ts: Date.now(), lang: getLocale(),
        score: 0, total: 0,
        items: [
          { q: t('lab.reflect.q.inttest.1'), a: a1, ok: true },
          { q: t('lab.reflect.q.inttest.2'), a: a2, ok: true },
        ],
      }));
      navigator.clipboard?.writeText(url).catch(() => {});
      lrShare.textContent = t('quiz.share.copied');
      setTimeout(() => { if (lrShare.isConnected) lrShare.textContent = `📋 ${t('quiz.share.btn')}`; }, 1800);
    });
  }

  render();
  return root;
}
