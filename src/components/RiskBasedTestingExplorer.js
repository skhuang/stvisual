import { t, getLocale } from '../i18n/index.js';
import { encodeResult, buildShareUrl } from '../utils/resultExporter.js';

let _uid = 0;
function uid() { return `rb${++_uid}`; }

function escapeHtml(v = '') {
  return String(v)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function riskLevel(score) {
  if (score >= 16) return 'high';
  if (score >= 6)  return 'medium';
  return 'low';
}

const HEAT_CELL = 44;
const HEAT_PAD  = 32;
const SVG_SIZE  = 5 * HEAT_CELL + HEAT_PAD * 2;

export function createRiskBasedTestingExplorer() {
  const root = document.createElement('div');
  root.className = 'rbt-explorer';
  root.dataset.testid = 'rbt-explorer';

  let modules = [
    { id: uid(), name: 'Login',         likelihood: 5, impact: 5 },
    { id: uid(), name: 'Payment',       likelihood: 4, impact: 5 },
    { id: uid(), name: 'API Gateway',   likelihood: 3, impact: 5 },
    { id: uid(), name: 'Admin Panel',   likelihood: 2, impact: 4 },
    { id: uid(), name: 'Search',        likelihood: 3, impact: 3 },
    { id: uid(), name: 'Notifications', likelihood: 4, impact: 2 },
    { id: uid(), name: 'File Upload',   likelihood: 3, impact: 3 },
    { id: uid(), name: 'Profile',       likelihood: 2, impact: 2 },
  ];

  let filter = 'all';

  const rbtQuiz = { active: false, phase: 'question', answer: '' };
  const rbtLabReflect = { active: false, a1: '', a2: '' };

  /* ── Heat map SVG ── */

  function buildHeatMap() {
    // Background cells colored by risk
    const cells = [];
    for (let l = 1; l <= 5; l++) {
      for (let i = 1; i <= 5; i++) {
        const score = l * i;
        const level = riskLevel(score);
        const fill = level === 'high' ? '#fecaca' : level === 'medium' ? '#fef9c3' : '#dcfce7';
        const cx = HEAT_PAD + (l - 1) * HEAT_CELL;
        const cy = SVG_SIZE - HEAT_PAD - i * HEAT_CELL;
        cells.push(`<rect x="${cx}" y="${cy}" width="${HEAT_CELL}" height="${HEAT_CELL}" fill="${fill}" stroke="#e2e8f0" stroke-width="1"/>`);
        if (i === 1) {
          cells.push(`<text x="${cx + HEAT_CELL / 2}" y="${SVG_SIZE - 12}" text-anchor="middle" font-size="11" fill="#64748b">${l}</text>`);
        }
        if (l === 1) {
          cells.push(`<text x="14" y="${cy + HEAT_CELL / 2 + 4}" text-anchor="middle" font-size="11" fill="#64748b">${i}</text>`);
        }
      }
    }

    // Module dots
    const dots = modules.map((m, idx) => {
      const score = m.likelihood * m.impact;
      const level = riskLevel(score);
      const fill = level === 'high' ? '#dc2626' : level === 'medium' ? '#d97706' : '#059669';
      const cx = HEAT_PAD + (m.likelihood - 1) * HEAT_CELL + HEAT_CELL / 2;
      const cy = SVG_SIZE - HEAT_PAD - m.impact * HEAT_CELL + HEAT_CELL / 2;
      const label = m.name.slice(0, 3);
      return `<circle cx="${cx}" cy="${cy}" r="13" fill="${fill}" opacity="0.85" data-testid="rbt-dot-${idx}"/>
<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="9" font-weight="700" fill="white">${escapeHtml(label)}</text>`;
    }).join('');

    // Axis labels
    const xLabel = `<text x="${HEAT_PAD + 5 * HEAT_CELL / 2}" y="${SVG_SIZE - 1}" text-anchor="middle" font-size="11" fill="#374151" font-weight="600">${t('rbt.heatmap.x')}</text>`;
    const yLabel = `<text x="5" y="${SVG_SIZE / 2}" text-anchor="middle" font-size="11" fill="#374151" font-weight="600" transform="rotate(-90 5 ${SVG_SIZE / 2})">${t('rbt.heatmap.y')}</text>`;

    return `<svg class="rbt-heatmap-svg" width="${SVG_SIZE}" height="${SVG_SIZE}" viewBox="0 0 ${SVG_SIZE} ${SVG_SIZE}" aria-label="${t('rbt.heatmap.title')}">
  ${cells.join('')}
  ${dots}
  ${xLabel}
  ${yLabel}
</svg>`;
  }

  /* ── quiz ── */

  function renderQuizPanel() {
    if (!rbtQuiz.active) return '';
    const highCount = modules.filter((m) => m.likelihood * m.impact >= 16).length;
    if (rbtQuiz.phase === 'graded') {
      const userAns = parseInt(rbtQuiz.answer, 10);
      const ok = userAns === highCount;
      const shareEncoded = encodeResult({
        v: 1, explorer: 'rbt', explorerLabel: t('quiz.rbt.title'),
        mode: 'quiz', ts: Date.now(), lang: getLocale(),
        score: ok ? 1 : 0, total: 1,
        items: [{ q: t('quiz.rbt.prompt'), a: String(rbtQuiz.answer), expected: String(highCount), ok }],
      });
      return `
        <div class="quiz-panel" data-testid="rbt-quiz-panel">
          <div class="quiz-header">
            <span>${t('quiz.rbt.title')}</span>
            <button type="button" class="quiz-close-btn" data-testid="rbt-quiz-close">✕</button>
          </div>
          <p class="quiz-prompt">${t('quiz.rbt.prompt')}</p>
          <p class="quiz-score ${ok ? 'quiz-score--perfect' : 'quiz-score--wrong'}">
            ${ok ? t('quiz.graph.perfect') : ''}
            ${t('quiz.rbt.answer', { count: highCount })}
          </p>
          <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="rbt-quiz-share">📋 ${t('quiz.share.btn')}</button>
          <button type="button" class="quiz-start-btn" data-testid="rbt-quiz-reset">${t('quiz.reset')}</button>
        </div>`;
    }
    return `
      <div class="quiz-panel" data-testid="rbt-quiz-panel">
        <div class="quiz-header">
          <span>${t('quiz.rbt.title')}</span>
          <button type="button" class="quiz-close-btn" data-testid="rbt-quiz-close">✕</button>
        </div>
        <p class="quiz-prompt">${t('quiz.rbt.prompt')}</p>
        <div class="quiz-bva-inputs">
          <label class="quiz-bva-field">
            ${t('quiz.rbt.label')}
            <input type="number" min="0" class="quiz-input" data-testid="rbt-quiz-input" value="${escapeHtml(rbtQuiz.answer)}" />
          </label>
        </div>
        <button type="button" class="quiz-start-btn" data-testid="rbt-quiz-check">${t('quiz.check')}</button>
      </div>`;
  }

  /* ── lab reflect ── */

  function renderLabReflectPanel() {
    if (!rbtLabReflect.active) return '';
    return `
      <div class="lab-panel" data-testid="rbt-lab-reflect-panel">
        <div class="lab-panel-header">
          <span class="lab-panel-title">${t('lab.reflect.title')}</span>
          <button type="button" class="quiz-close-btn" data-testid="rbt-lab-reflect-close">✕</button>
        </div>
        <div class="lab-reflect-field">
          <label class="lab-reflect-label">${t('lab.reflect.q.rbt.1')}</label>
          <textarea class="lab-reflect-textarea" data-testid="rbt-lab-reflect-a1" rows="3" placeholder="${t('lab.reflect.placeholder')}">${escapeHtml(rbtLabReflect.a1)}</textarea>
        </div>
        <div class="lab-reflect-field">
          <label class="lab-reflect-label">${t('lab.reflect.q.rbt.2')}</label>
          <textarea class="lab-reflect-textarea" data-testid="rbt-lab-reflect-a2" rows="3" placeholder="${t('lab.reflect.placeholder')}">${escapeHtml(rbtLabReflect.a2)}</textarea>
        </div>
        <div class="lab-reflect-actions">
          <button type="button" class="quiz-share-btn" data-testid="rbt-lab-reflect-share">📋 ${t('quiz.share.btn')}</button>
        </div>
      </div>`;
  }

  /* ── main render ── */

  function render() {
    const moduleRows = modules.map((m, i) => `
      <div class="rbt-module-row" data-module-id="${m.id}">
        <input type="text" class="rbt-module-name-input" value="${escapeHtml(m.name)}"
          data-module-name="${m.id}" data-testid="rbt-module-name-${i}" maxlength="20" />
        <div class="rbt-slider-group">
          <span class="rbt-slider-label">L</span>
          <input type="range" min="1" max="5" value="${m.likelihood}" class="rbt-slider"
            data-module-likelihood="${m.id}" data-testid="rbt-likelihood-${i}" />
          <span class="rbt-slider-val" data-testid="rbt-lval-${i}">${m.likelihood}</span>
        </div>
        <div class="rbt-slider-group">
          <span class="rbt-slider-label">I</span>
          <input type="range" min="1" max="5" value="${m.impact}" class="rbt-slider"
            data-module-impact="${m.id}" data-testid="rbt-impact-${i}" />
          <span class="rbt-slider-val" data-testid="rbt-ival-${i}">${m.impact}</span>
        </div>
        <button type="button" class="rbt-module-remove" data-remove-module="${m.id}"
          data-testid="rbt-remove-${i}">${t('rbt.module.remove')}</button>
      </div>`).join('');

    const sorted = [...modules]
      .map((m) => ({ ...m, score: m.likelihood * m.impact, level: riskLevel(m.likelihood * m.impact) }))
      .sort((a, b) => b.score - a.score);

    const filtered = filter === 'high'
      ? sorted.filter((m) => m.level === 'high')
      : filter === 'medium'
        ? sorted.filter((m) => m.level !== 'low')
        : sorted;

    const highCount = sorted.filter((m) => m.level === 'high').length;

    const tableRows = filtered.map((m, i) => `
      <tr data-testid="rbt-list-row-${i}">
        <td>${i + 1}</td>
        <td><strong>${escapeHtml(m.name)}</strong></td>
        <td style="text-align:center;font-weight:700">${m.score}</td>
        <td><span class="rbt-risk-badge rbt-risk-badge--${m.level}">${t(`rbt.level.${m.level}`)}</span></td>
      </tr>`).join('');

    const metricEncoded = encodeResult({
      v: 1, explorer: 'rbt', explorerLabel: t('section.rbt'),
      mode: 'lab-metric', ts: Date.now(), lang: getLocale(),
      score: 1, total: 1,
      items: [{ q: `High-risk: ${highCount} · Modules: ${modules.length}`, a: String(highCount), ok: true }],
    });

    root.innerHTML = `
      <div class="rbt-modules-card">
        <p class="rbt-modules-title">${t('rbt.modules.title')}</p>
        <div data-testid="rbt-module-list">${moduleRows}</div>
        <button type="button" class="rbt-add-btn" data-testid="rbt-add-module">+ ${t('rbt.module.add')}</button>
      </div>

      <div class="rbt-main">
        <div class="rbt-heatmap-card">
          <p class="rbt-heatmap-title">${t('rbt.heatmap.title')}</p>
          <div class="rbt-heatmap-wrap" data-testid="rbt-heatmap">${buildHeatMap()}</div>
        </div>

        <div class="rbt-list-card">
          <div class="rbt-list-header">
            <h4 class="rbt-list-title">${t('rbt.list.title')}</h4>
            <select class="rbt-filter-select" data-testid="rbt-filter">
              <option value="all" ${filter === 'all' ? 'selected' : ''}>${t('rbt.filter.all')}</option>
              <option value="medium" ${filter === 'medium' ? 'selected' : ''}>${t('rbt.filter.medium')}</option>
              <option value="high" ${filter === 'high' ? 'selected' : ''}>${t('rbt.filter.high')}</option>
            </select>
          </div>
          <div style="overflow-x:auto">
            <table class="rbt-table" data-testid="rbt-list-table">
              <thead><tr>
                <th>#</th>
                <th>${t('rbt.list.module')}</th>
                <th>${t('rbt.list.score')}</th>
                <th>${t('rbt.list.level')}</th>
              </tr></thead>
              <tbody>${tableRows}</tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="rbt-bottom-card">
        <div class="rbt-bottom-header">
          <h4 class="rbt-bottom-title">${t('section.rbt')}</h4>
          <div class="rbt-bottom-actions">
            ${!rbtQuiz.active ? `<button type="button" class="quiz-start-btn" data-testid="rbt-quiz-start">${t('quiz.start')}</button>` : ''}
            ${!rbtLabReflect.active ? `<button type="button" class="quiz-start-btn" data-testid="rbt-lab-reflect-start">${t('lab.reflect.start')}</button>` : ''}
            <button type="button" class="quiz-share-btn" data-share-payload="${metricEncoded}" data-testid="rbt-lab-metric">📊 ${t('lab.metric.record')}</button>
          </div>
        </div>
        ${renderQuizPanel()}
        ${renderLabReflectPanel()}
      </div>

      <p class="rbt-hint">${t('rbt.hint')}</p>
    `;

    bindEvents();
  }

  /* ── event binding ── */

  function bindEvents() {
    root.querySelector('[data-testid="rbt-add-module"]').addEventListener('click', () => {
      modules.push({ id: uid(), name: `Module${modules.length + 1}`, likelihood: 3, impact: 3 });
      render();
    });

    root.querySelectorAll('[data-remove-module]').forEach((btn) => {
      btn.addEventListener('click', () => {
        modules = modules.filter((m) => m.id !== btn.dataset.removeModule);
        render();
      });
    });

    root.querySelectorAll('[data-module-name]').forEach((input) => {
      input.addEventListener('change', () => {
        const m = modules.find((x) => x.id === input.dataset.moduleName);
        if (m) { m.name = input.value; render(); }
      });
    });

    root.querySelectorAll('[data-module-likelihood]').forEach((slider) => {
      slider.addEventListener('input', () => {
        const m = modules.find((x) => x.id === slider.dataset.moduleLikelihood);
        if (m) { m.likelihood = parseInt(slider.value); render(); }
      });
    });

    root.querySelectorAll('[data-module-impact]').forEach((slider) => {
      slider.addEventListener('input', () => {
        const m = modules.find((x) => x.id === slider.dataset.moduleImpact);
        if (m) { m.impact = parseInt(slider.value); render(); }
      });
    });

    const filterSel = root.querySelector('[data-testid="rbt-filter"]');
    if (filterSel) filterSel.addEventListener('change', () => { filter = filterSel.value; render(); });

    // Quiz
    const qStart = root.querySelector('[data-testid="rbt-quiz-start"]');
    if (qStart) qStart.addEventListener('click', () => {
      rbtQuiz.active = true; rbtQuiz.phase = 'question'; rbtQuiz.answer = ''; render();
    });

    const qClose = root.querySelector('[data-testid="rbt-quiz-close"]');
    if (qClose) qClose.addEventListener('click', () => { rbtQuiz.active = false; render(); });

    const qCheck = root.querySelector('[data-testid="rbt-quiz-check"]');
    if (qCheck) qCheck.addEventListener('click', () => {
      const inp = root.querySelector('[data-testid="rbt-quiz-input"]');
      rbtQuiz.answer = inp ? inp.value : '';
      rbtQuiz.phase = 'graded';
      render();
    });

    const qReset = root.querySelector('[data-testid="rbt-quiz-reset"]');
    if (qReset) qReset.addEventListener('click', () => {
      rbtQuiz.phase = 'question'; rbtQuiz.answer = ''; render();
    });

    // Lab Reflect
    const lrStart = root.querySelector('[data-testid="rbt-lab-reflect-start"]');
    if (lrStart) lrStart.addEventListener('click', () => { rbtLabReflect.active = true; render(); });

    const lrClose = root.querySelector('[data-testid="rbt-lab-reflect-close"]');
    if (lrClose) lrClose.addEventListener('click', () => {
      const a1el = root.querySelector('[data-testid="rbt-lab-reflect-a1"]');
      const a2el = root.querySelector('[data-testid="rbt-lab-reflect-a2"]');
      if (a1el) rbtLabReflect.a1 = a1el.value;
      if (a2el) rbtLabReflect.a2 = a2el.value;
      rbtLabReflect.active = false;
      render();
    });

    const lrA1 = root.querySelector('[data-testid="rbt-lab-reflect-a1"]');
    if (lrA1) lrA1.addEventListener('input', () => { rbtLabReflect.a1 = lrA1.value; });

    const lrA2 = root.querySelector('[data-testid="rbt-lab-reflect-a2"]');
    if (lrA2) lrA2.addEventListener('input', () => { rbtLabReflect.a2 = lrA2.value; });

    const lrShare = root.querySelector('[data-testid="rbt-lab-reflect-share"]');
    if (lrShare) lrShare.addEventListener('click', () => {
      const a1 = root.querySelector('[data-testid="rbt-lab-reflect-a1"]')?.value || rbtLabReflect.a1;
      const a2 = root.querySelector('[data-testid="rbt-lab-reflect-a2"]')?.value || rbtLabReflect.a2;
      const url = buildShareUrl(encodeResult({
        v: 1, explorer: 'rbt', explorerLabel: t('lab.reflect.title'),
        mode: 'lab-reflect', ts: Date.now(), lang: getLocale(),
        score: 0, total: 0,
        items: [
          { q: t('lab.reflect.q.rbt.1'), a: a1, ok: true },
          { q: t('lab.reflect.q.rbt.2'), a: a2, ok: true },
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
