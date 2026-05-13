import { t, getLocale } from '../i18n/index.js';
import { encodeResult, buildShareUrl } from '../utils/resultExporter.js';
import { generatePairwise, exhaustiveCount, totalPairCount } from '../utils/pairwise.js';

let _uid = 0;
function uid() { return `p${++_uid}`; }

function escapeHtml(v = '') {
  return String(v)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

const PRESETS = [
  {
    key: 'pairwise.preset.os_browser',
    params: [
      { name: 'OS',      values: ['Windows', 'Mac', 'Linux'] },
      { name: 'Browser', values: ['Chrome', 'Firefox', 'Safari'] },
    ],
  },
  {
    key: 'pairwise.preset.os_browser_ver',
    params: [
      { name: 'OS',      values: ['Windows', 'Mac', 'Linux'] },
      { name: 'Browser', values: ['Chrome', 'Firefox', 'Safari'] },
      { name: 'Version', values: ['Latest', 'Previous'] },
    ],
  },
  {
    key: 'pairwise.preset.full',
    params: [
      { name: 'OS',      values: ['Windows', 'Mac', 'Linux'] },
      { name: 'Browser', values: ['Chrome', 'Firefox', 'Safari'] },
      { name: 'DB',      values: ['MySQL', 'PostgreSQL'] },
      { name: 'CPU',     values: ['x64', 'arm64'] },
    ],
  },
];

function freshParams(preset) {
  return preset.params.map((p) => ({ id: uid(), name: p.name, values: [...p.values] }));
}

export function createPairwiseExplorer() {
  const root = document.createElement('div');
  root.className = 'pairwise-explorer';
  root.dataset.testid = 'pairwise-explorer';

  let params = freshParams(PRESETS[1]);          // default: OS × Browser × Version
  let newValueDraft = {};                        // paramId → pending new-value text

  const pairwiseQuiz = { active: false, phase: 'question', answer: '' };

  /* ── helpers ── */

  function validParams() {
    return params.filter((p) => p.name.trim() && p.values.length >= 1);
  }

  function computeResults() {
    const vp = validParams();
    if (vp.length < 2) return { tests: [], exhaustive: 0, pairCount: 0, pairCoverage: 0 };
    const tests = generatePairwise(vp);
    const exhaustive = exhaustiveCount(vp);
    const pairCount = totalPairCount(vp);
    return { tests, exhaustive, pairCount, pairCoverage: pairCount > 0 ? 100 : 0 };
  }

  /* ── quiz panel ── */

  function renderQuizPanel(testCount) {
    if (!pairwiseQuiz.active) return '';
    if (pairwiseQuiz.phase === 'graded') {
      const userAns = parseInt(pairwiseQuiz.answer, 10);
      const ok = userAns === testCount;
      const shareEncoded = encodeResult({
        v: 1, explorer: 'pairwise', explorerLabel: t('quiz.pairwise.title'),
        mode: 'quiz', ts: Date.now(), lang: getLocale(),
        score: ok ? 1 : 0, total: 1,
        items: [{ q: t('quiz.pairwise.prompt'), a: String(pairwiseQuiz.answer), expected: String(testCount), ok }],
      });
      return `
        <div class="quiz-panel" data-testid="pairwise-quiz-panel">
          <div class="quiz-header">
            <span>${t('quiz.pairwise.title')}</span>
            <button type="button" class="quiz-close-btn" data-testid="pairwise-quiz-close">✕</button>
          </div>
          <p class="quiz-prompt">${t('quiz.pairwise.prompt')}</p>
          <p class="quiz-score ${ok ? 'quiz-score--perfect' : 'quiz-score--wrong'}">
            ${ok ? t('quiz.graph.perfect') : ''}
            ${t('quiz.pairwise.answer', { count: testCount })}
          </p>
          <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="pairwise-quiz-share">📋 ${t('quiz.share.btn')}</button>
          <button type="button" class="quiz-start-btn" data-testid="pairwise-quiz-reset">${t('quiz.reset')}</button>
        </div>`;
    }
    return `
      <div class="quiz-panel" data-testid="pairwise-quiz-panel">
        <div class="quiz-header">
          <span>${t('quiz.pairwise.title')}</span>
          <button type="button" class="quiz-close-btn" data-testid="pairwise-quiz-close">✕</button>
        </div>
        <p class="quiz-prompt">${t('quiz.pairwise.prompt')}</p>
        <div class="quiz-bva-inputs">
          <label class="quiz-bva-field">
            ${t('quiz.pairwise.label')}
            <input type="number" min="0" class="quiz-input" data-testid="pairwise-quiz-input" value="${escapeHtml(pairwiseQuiz.answer)}" />
          </label>
        </div>
        <button type="button" class="quiz-start-btn" data-testid="pairwise-quiz-check">${t('quiz.check')}</button>
      </div>`;
  }

  /* ── main render ── */

  function render() {
    const { tests, exhaustive, pairCount, pairCoverage } = computeResults();
    const vp = validParams();

    const reductionPct = exhaustive > 0 && tests.length < exhaustive
      ? Math.round((1 - tests.length / exhaustive) * 100)
      : 0;

    const metricEncoded = encodeResult({
      v: 1, explorer: 'pairwise', explorerLabel: t('section.pairwise'),
      mode: 'lab-metric', ts: Date.now(), lang: getLocale(),
      score: 1, total: 1,
      items: [{ q: t('lab.metric.pairwise.label', { pct: pairCoverage, n: tests.length }), a: '', ok: true }],
    });

    const paramRows = params.map((p) => {
      const chips = p.values.map((v, vi) => `
        <span class="pairwise-value-chip" data-testid="pairwise-chip-${p.id}-${vi}">
          ${escapeHtml(v)}
          <button type="button" class="pairwise-value-remove" data-remove-val="${escapeHtml(p.id)}" data-val-idx="${vi}" aria-label="Remove ${escapeHtml(v)}">×</button>
        </span>`).join('');
      const draft = escapeHtml(newValueDraft[p.id] || '');
      return `
        <div class="pairwise-param-row" data-param-id="${p.id}">
          <input type="text" class="pairwise-param-name" value="${escapeHtml(p.name)}"
            data-param-name="${p.id}" data-testid="pairwise-param-name-${p.id}"
            placeholder="${t('pairwise.param.name')}" />
          <div class="pairwise-param-values">
            ${chips}
            <input type="text" class="pairwise-value-input" value="${draft}"
              data-new-val="${p.id}" data-testid="pairwise-new-val-${p.id}"
              placeholder="${t('pairwise.param.value.placeholder')}" maxlength="30" />
            <button type="button" class="pairwise-value-add-btn" data-add-val="${p.id}"
              data-testid="pairwise-add-val-${p.id}">+ ${t('pairwise.param.value.add')}</button>
          </div>
          <button type="button" class="pairwise-param-remove" data-remove-param="${p.id}"
            data-testid="pairwise-remove-param-${p.id}" aria-label="${t('pairwise.param.remove')}">✕</button>
        </div>`;
    }).join('');

    const presetBtns = PRESETS.map((pr, idx) => `
      <button type="button" class="pairwise-preset-btn" data-preset="${idx}"
        data-testid="pairwise-preset-${idx}">${t(pr.key)}</button>`).join('');

    const statsHtml = vp.length >= 2 ? `
      <div class="pairwise-stats">
        <div class="pairwise-stat-card">
          <span class="pairwise-stat-label">${t('pairwise.stat.exhaustive')}</span>
          <span class="pairwise-stat-value" data-testid="pairwise-exhaustive-count">${exhaustive}</span>
        </div>
        <div class="pairwise-stat-card pairwise-stat-card--accent">
          <span class="pairwise-stat-label">${t('pairwise.stat.pairwise')}</span>
          <span class="pairwise-stat-value" data-testid="pairwise-test-count">${tests.length}</span>
        </div>
        ${reductionPct > 0 ? `<span class="pairwise-reduction-badge" data-testid="pairwise-reduction">↓ ${reductionPct}% ${t('pairwise.stat.reduction')}</span>` : ''}
        <span style="color:#64748b;font-size:0.8rem">${t('pairwise.pairs.covered', { covered: pairCount, total: pairCount })}</span>
      </div>` : '';

    const theadCols = vp.map((p, i) =>
      `<th data-testid="pairwise-col-${i}">${escapeHtml(p.name)}</th>`).join('');

    const tbodyRows = tests.map((test, ti) => {
      const cells = vp.map((p) => `<td>${escapeHtml(test[p.name] ?? '')}</td>`).join('');
      return `<tr data-testid="pairwise-row-${ti}"><td style="color:#94a3b8;font-size:0.75rem">${ti + 1}</td>${cells}</tr>`;
    }).join('');

    const tableHtml = vp.length >= 2 && tests.length > 0 ? `
      <div class="pairwise-table-wrap">
        <table class="pairwise-table" data-testid="pairwise-table">
          <thead><tr><th>#</th>${theadCols}</tr></thead>
          <tbody>${tbodyRows}</tbody>
        </table>
      </div>` : `<p class="pairwise-empty">${t('pairwise.empty')}</p>`;

    root.innerHTML = `
      <div class="pairwise-params-card">
        <p class="pairwise-params-title">${t('pairwise.params.title')}</p>
        <div class="pairwise-presets">${presetBtns}</div>
        <div data-testid="pairwise-param-list">${paramRows}</div>
        <button type="button" class="pairwise-add-param" data-testid="pairwise-add-param">+ ${t('pairwise.param.add')}</button>
      </div>

      ${statsHtml}

      <div class="pairwise-result-card">
        <div class="pairwise-result-header">
          <h4 class="pairwise-result-title">${t('pairwise.results.title')}</h4>
          ${vp.length >= 2 && tests.length > 0 ? `<span class="pairwise-coverage-badge" data-testid="pairwise-coverage">${t('pairwise.coverage.badge', { n: tests.length })}</span>` : ''}
          <div class="pairwise-actions">
            ${!pairwiseQuiz.active && vp.length >= 2 ? `<button type="button" class="quiz-start-btn" data-testid="pairwise-quiz-start">${t('quiz.start')}</button>` : ''}
            ${vp.length >= 2 ? `<button type="button" class="quiz-share-btn" data-share-payload="${metricEncoded}" data-testid="pairwise-lab-metric">📊 ${t('lab.metric.record')}</button>` : ''}
          </div>
        </div>
        ${tableHtml}
        ${renderQuizPanel(tests.length)}
      </div>

      <p class="pairwise-hint">${t('pairwise.hint')}</p>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Presets
    root.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        params = freshParams(PRESETS[parseInt(btn.dataset.preset)]);
        newValueDraft = {};
        render();
      });
    });

    // Add parameter
    root.querySelector('[data-testid="pairwise-add-param"]').addEventListener('click', () => {
      params.push({ id: uid(), name: '', values: ['A', 'B'] });
      render();
    });

    // Remove parameter
    root.querySelectorAll('[data-remove-param]').forEach((btn) => {
      btn.addEventListener('click', () => {
        params = params.filter((p) => p.id !== btn.dataset.removeParam);
        render();
      });
    });

    // Edit parameter name (live, no re-render until blur)
    root.querySelectorAll('[data-param-name]').forEach((input) => {
      input.addEventListener('change', () => {
        const p = params.find((x) => x.id === input.dataset.paramName);
        if (p) { p.name = input.value; render(); }
      });
    });

    // Remove value chip
    root.querySelectorAll('[data-remove-val]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = params.find((x) => x.id === btn.dataset.removeVal);
        if (p) { p.values.splice(parseInt(btn.dataset.valIdx), 1); render(); }
      });
    });

    // New value draft input (track without re-render)
    root.querySelectorAll('[data-new-val]').forEach((input) => {
      input.addEventListener('input', () => {
        newValueDraft[input.dataset.newVal] = input.value;
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addValue(input.dataset.newVal, input.value);
        }
      });
    });

    // Add value button
    root.querySelectorAll('[data-add-val]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = root.querySelector(`[data-new-val="${btn.dataset.addVal}"]`);
        addValue(btn.dataset.addVal, input ? input.value : '');
      });
    });

    // Quiz handlers
    const qStart = root.querySelector('[data-testid="pairwise-quiz-start"]');
    if (qStart) qStart.addEventListener('click', () => { pairwiseQuiz.active = true; pairwiseQuiz.phase = 'question'; pairwiseQuiz.answer = ''; render(); });

    const qClose = root.querySelector('[data-testid="pairwise-quiz-close"]');
    if (qClose) qClose.addEventListener('click', () => { pairwiseQuiz.active = false; render(); });

    const qCheck = root.querySelector('[data-testid="pairwise-quiz-check"]');
    if (qCheck) qCheck.addEventListener('click', () => {
      const inp = root.querySelector('[data-testid="pairwise-quiz-input"]');
      pairwiseQuiz.answer = inp ? inp.value : '';
      pairwiseQuiz.phase = 'graded';
      render();
    });

    const qReset = root.querySelector('[data-testid="pairwise-quiz-reset"]');
    if (qReset) qReset.addEventListener('click', () => { pairwiseQuiz.phase = 'question'; pairwiseQuiz.answer = ''; render(); });
  }

  function addValue(paramId, raw) {
    const val = raw.trim();
    if (!val) return;
    const p = params.find((x) => x.id === paramId);
    if (p && !p.values.includes(val)) { p.values.push(val); }
    delete newValueDraft[paramId];
    render();
  }

  render();
  return root;
}
