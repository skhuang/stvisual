import { t, getLocale } from '../i18n/index.js';
import { encodeResult, buildShareUrl } from '../utils/resultExporter.js';
import { evaluateFormula, getUsedCauses, isValidFormula } from '../utils/causeEffect.js';

let _uid = 0;
function uid() { return `ce${++_uid}`; }

function escapeHtml(v = '') {
  return String(v)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function createCauseEffectExplorer() {
  const root = document.createElement('div');
  root.className = 'ceg-explorer';
  root.dataset.testid = 'ceg-explorer';

  let causes = [
    { id: uid(), name: 'C1', label: 'User logged in' },
    { id: uid(), name: 'C2', label: 'Cart not empty' },
    { id: uid(), name: 'C3', label: 'Payment valid' },
  ];
  let effects = [
    { id: uid(), name: 'E1', label: 'Show checkout', formula: 'C1 AND C2' },
    { id: uid(), name: 'E2', label: 'Process order',  formula: 'C1 AND C2 AND C3' },
    { id: uid(), name: 'E3', label: 'Show error',     formula: 'C1 AND C2 AND NOT C3' },
  ];

  const cegLabReflect = { active: false, a1: '', a2: '' };
  const cegQuiz = { active: false, phase: 'question', answer: '' };

  /* ── derived data ── */

  function buildTable() {
    const validCauses = causes.filter((c) => c.name.trim());
    const validEffects = effects.filter((e) => e.name.trim() && isValidFormula(e.formula));
    const n = validCauses.length;
    if (!n) return { validCauses, validEffects, rows: [] };

    const rows = [];
    for (let mask = 0; mask < (1 << n); mask++) {
      const env = {};
      validCauses.forEach((c, i) => { env[c.name] = !!(mask & (1 << i)); });
      const effectVals = validEffects.map((e) => evaluateFormula(e.formula, env));
      const active = effectVals.some(Boolean);
      rows.push({ env, effectVals, active });
    }
    return { validCauses, validEffects, rows };
  }

  /* ── SVG diagram ── */

  function buildSVG(validCauses, validEffects) {
    const ROW_H = 36;
    const COL_W = 160;
    const PAD = 24;
    const NODE_R = 14;

    const leftH = validCauses.length * ROW_H;
    const rightH = validEffects.length * ROW_H;
    const svgH = Math.max(leftH, rightH, ROW_H) + PAD * 2;
    const svgW = COL_W * 2 + PAD * 2;

    const causeX = PAD + NODE_R;
    const effectX = svgW - PAD - NODE_R;
    const causeYs = validCauses.map((_, i) =>
      PAD + (i + 0.5) * (svgH - PAD * 2) / Math.max(validCauses.length, 1));
    const effectYs = validEffects.map((_, i) =>
      PAD + (i + 0.5) * (svgH - PAD * 2) / Math.max(validEffects.length, 1));

    const CAUSE_COLORS = ['#3b82f6','#06b6d4','#8b5cf6','#ec4899','#f97316'];
    const EFFECT_COLORS = ['#f59e0b','#10b981','#ef4444','#6366f1','#84cc16'];

    let lines = '';
    validEffects.forEach((e, ei) => {
      const used = getUsedCauses(e.formula);
      used.forEach((info, cName) => {
        const ci = validCauses.findIndex((c) => c.name === cName);
        if (ci < 0) return;
        const color = info.negated && !info.direct ? '#dc2626' : '#64748b';
        const dashArray = info.negated && !info.direct ? '4 3' : '';
        lines += `<line x1="${causeX}" y1="${causeYs[ci].toFixed(1)}" x2="${effectX}" y2="${effectYs[ei].toFixed(1)}" stroke="${color}" stroke-width="1.5" ${dashArray ? `stroke-dasharray="${dashArray}"` : ''} opacity="0.55"/>`;
        if (info.negated) {
          const mx = (causeX + effectX) / 2;
          const my = (causeYs[ci] + effectYs[ei]) / 2;
          lines += `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="5" fill="white" stroke="#dc2626" stroke-width="1.5"/>`;
          lines += `<text x="${mx.toFixed(1)}" y="${(my + 4).toFixed(1)}" text-anchor="middle" font-size="9" fill="#dc2626">¬</text>`;
        }
      });
    });

    const causeNodes = validCauses.map((c, i) => {
      const color = CAUSE_COLORS[i % CAUSE_COLORS.length];
      const labelX = causeX + NODE_R + 5;
      return `<circle cx="${causeX}" cy="${causeYs[i].toFixed(1)}" r="${NODE_R}" fill="${color}" opacity="0.9"/>
<text x="${causeX}" y="${(causeYs[i] + 5).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" fill="white">${escapeHtml(c.name)}</text>
<text x="${labelX}" y="${(causeYs[i] + 5).toFixed(1)}" font-size="11" fill="#374151" dominant-baseline="middle">${escapeHtml(c.label || c.name)}</text>`;
    }).join('');

    const effectNodes = validEffects.map((e, i) => {
      const color = EFFECT_COLORS[i % EFFECT_COLORS.length];
      const labelX = effectX - NODE_R - 5;
      return `<circle cx="${effectX}" cy="${effectYs[i].toFixed(1)}" r="${NODE_R}" fill="${color}" opacity="0.9"/>
<text x="${effectX}" y="${(effectYs[i] + 5).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" fill="white">${escapeHtml(e.name)}</text>
<text x="${labelX}" y="${(effectYs[i] + 5).toFixed(1)}" font-size="11" fill="#374151" text-anchor="end" dominant-baseline="middle">${escapeHtml(e.label || e.name)}</text>`;
    }).join('');

    return `<svg class="ceg-svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" aria-label="${t('ceg.diagram.title')}">
  ${lines}
  ${causeNodes}
  ${effectNodes}
</svg>`;
  }

  /* ── quiz panel ── */

  function renderQuizPanel(activeCount) {
    if (!cegQuiz.active) return '';
    if (cegQuiz.phase === 'graded') {
      const userAns = parseInt(cegQuiz.answer, 10);
      const ok = userAns === activeCount;
      const shareEncoded = encodeResult({
        v: 1, explorer: 'ceg', explorerLabel: t('quiz.ceg.title'),
        mode: 'quiz', ts: Date.now(), lang: getLocale(),
        score: ok ? 1 : 0, total: 1,
        items: [{ q: t('quiz.ceg.prompt'), a: String(cegQuiz.answer), expected: String(activeCount), ok }],
      });
      return `
        <div class="quiz-panel" data-testid="ceg-quiz-panel">
          <div class="quiz-header">
            <span>${t('quiz.ceg.title')}</span>
            <button type="button" class="quiz-close-btn" data-testid="ceg-quiz-close">✕</button>
          </div>
          <p class="quiz-prompt">${t('quiz.ceg.prompt')}</p>
          <p class="quiz-score ${ok ? 'quiz-score--perfect' : 'quiz-score--wrong'}">
            ${ok ? t('quiz.graph.perfect') : ''}
            ${t('quiz.ceg.answer', { count: activeCount })}
          </p>
          <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="ceg-quiz-share">📋 ${t('quiz.share.btn')}</button>
          <button type="button" class="quiz-start-btn" data-testid="ceg-quiz-reset">${t('quiz.reset')}</button>
        </div>`;
    }
    return `
      <div class="quiz-panel" data-testid="ceg-quiz-panel">
        <div class="quiz-header">
          <span>${t('quiz.ceg.title')}</span>
          <button type="button" class="quiz-close-btn" data-testid="ceg-quiz-close">✕</button>
        </div>
        <p class="quiz-prompt">${t('quiz.ceg.prompt')}</p>
        <div class="quiz-bva-inputs">
          <label class="quiz-bva-field">
            ${t('quiz.ceg.label')}
            <input type="number" min="0" class="quiz-input" data-testid="ceg-quiz-input" value="${escapeHtml(cegQuiz.answer)}" />
          </label>
        </div>
        <button type="button" class="quiz-start-btn" data-testid="ceg-quiz-check">${t('quiz.check')}</button>
      </div>`;
  }

  /* ── lab reflect panel ── */

  function renderLabReflectPanel() {
    if (!cegLabReflect.active) return '';
    return `
      <div class="lab-panel" data-testid="ceg-lab-reflect-panel">
        <div class="lab-panel-header">
          <span class="lab-panel-title">${t('lab.reflect.title')}</span>
          <button type="button" class="quiz-close-btn" data-testid="ceg-lab-reflect-close">✕</button>
        </div>
        <div class="lab-reflect-field">
          <label class="lab-reflect-label">${t('lab.reflect.q.ceg.1')}</label>
          <textarea class="lab-reflect-textarea" data-testid="ceg-lab-reflect-a1" rows="3" placeholder="${t('lab.reflect.placeholder')}">${escapeHtml(cegLabReflect.a1)}</textarea>
        </div>
        <div class="lab-reflect-field">
          <label class="lab-reflect-label">${t('lab.reflect.q.ceg.2')}</label>
          <textarea class="lab-reflect-textarea" data-testid="ceg-lab-reflect-a2" rows="3" placeholder="${t('lab.reflect.placeholder')}">${escapeHtml(cegLabReflect.a2)}</textarea>
        </div>
        <div class="lab-reflect-actions">
          <button type="button" class="quiz-share-btn" data-testid="ceg-lab-reflect-share">📋 ${t('quiz.share.btn')}</button>
        </div>
      </div>`;
  }

  /* ── main render ── */

  function render() {
    const { validCauses, validEffects, rows } = buildTable();
    const activeCount = rows.filter((r) => r.active).length;

    const causeRows = causes.map((c, i) => `
      <div class="ceg-row" data-cause-id="${c.id}">
        <span class="ceg-id-badge">${escapeHtml(c.name)}</span>
        <input type="text" class="ceg-label-input" value="${escapeHtml(c.label)}"
          data-cause-label="${c.id}" data-testid="ceg-cause-label-${i}"
          placeholder="${t('ceg.cause.label')}" maxlength="40" />
        <button type="button" class="ceg-row-remove" data-remove-cause="${c.id}"
          data-testid="ceg-cause-remove-${i}" aria-label="${t('ceg.cause.remove')}">✕</button>
      </div>`).join('');

    const effectRows = effects.map((e, i) => {
      const valid = !e.formula.trim() || isValidFormula(e.formula);
      return `
      <div class="ceg-row" data-effect-id="${e.id}">
        <span class="ceg-id-badge ceg-effect-id-badge">${escapeHtml(e.name)}</span>
        <input type="text" class="ceg-label-input" value="${escapeHtml(e.label)}"
          data-effect-label="${e.id}" data-testid="ceg-effect-label-${i}"
          placeholder="${t('ceg.effect.label')}" maxlength="40" />
        <input type="text" class="ceg-formula-input ${valid ? '' : 'ceg-formula-input--error'}"
          value="${escapeHtml(e.formula)}"
          data-effect-formula="${e.id}" data-testid="ceg-effect-formula-${i}"
          placeholder="${t('ceg.effect.formula')}" />
        <button type="button" class="ceg-row-remove" data-remove-effect="${e.id}"
          data-testid="ceg-effect-remove-${i}" aria-label="${t('ceg.effect.remove')}">✕</button>
      </div>`;
    }).join('');

    const svgHtml = validCauses.length && validEffects.length
      ? `<div class="ceg-svg-wrap">${buildSVG(validCauses, validEffects)}</div>`
      : `<p class="ceg-empty">${t(validCauses.length ? 'ceg.empty.effects' : 'ceg.empty.causes')}</p>`;

    let tableHtml = '';
    if (!validCauses.length) {
      tableHtml = `<p class="ceg-empty">${t('ceg.empty.causes')}</p>`;
    } else if (!validEffects.length) {
      tableHtml = `<p class="ceg-empty">${t('ceg.empty.effects')}</p>`;
    } else {
      const causeCols = validCauses.map((c) =>
        `<th class="ceg-th-cause">${escapeHtml(c.name)}</th>`).join('');
      const effectCols = validEffects.map((e) =>
        `<th class="ceg-th-effect">${escapeHtml(e.name)}</th>`).join('');

      const tableRows = rows.map((row, ri) => {
        const causeCells = validCauses.map((c) => {
          const val = row.env[c.name];
          return `<td class="${val ? 'ceg-td-true' : 'ceg-td-false'}">${val ? t('ceg.table.true') : t('ceg.table.false')}</td>`;
        }).join('');
        const effectCells = row.effectVals.map((v) =>
          `<td class="${v ? 'ceg-td-true' : 'ceg-td-false'}">${v ? t('ceg.table.true') : t('ceg.table.false')}</td>`
        ).join('');
        return `<tr class="${row.active ? 'ceg-row-active' : ''}" data-testid="ceg-table-row-${ri}">
          <td style="color:#94a3b8;font-size:0.73rem">${ri + 1}</td>
          ${causeCells}${effectCells}
        </tr>`;
      }).join('');

      tableHtml = `
        <div class="ceg-table-wrap">
          <table class="ceg-table" data-testid="ceg-table">
            <thead>
              <tr>
                <th>#</th>${causeCols}${effectCols}
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>`;
    }

    const hasData = validCauses.length && validEffects.length;
    const metricEncoded = hasData ? encodeResult({
      v: 1, explorer: 'ceg', explorerLabel: t('section.ceg'),
      mode: 'lab-metric', ts: Date.now(), lang: getLocale(),
      score: 1, total: 1,
      items: [{ q: t('ceg.rows.active', { n: activeCount }), a: String(activeCount), ok: true }],
    }) : null;

    root.innerHTML = `
      <div class="ceg-editors">
        <div class="ceg-editor-card">
          <p class="ceg-editor-title">${t('ceg.causes.title')}</p>
          <div data-testid="ceg-cause-list">${causeRows}</div>
          <button type="button" class="ceg-add-btn" data-testid="ceg-cause-add">+ ${t('ceg.cause.add')}</button>
        </div>
        <div class="ceg-editor-card">
          <p class="ceg-editor-title">${t('ceg.effects.title')}</p>
          <div data-testid="ceg-effect-list">${effectRows}</div>
          <button type="button" class="ceg-add-btn" data-testid="ceg-effect-add">+ ${t('ceg.effect.add')}</button>
        </div>
      </div>

      <div class="ceg-diagram-card">
        <p class="ceg-diagram-title">${t('ceg.diagram.title')}</p>
        ${svgHtml}
      </div>

      <div class="ceg-table-card">
        <div class="ceg-table-header">
          <h4 class="ceg-table-title">${t('ceg.table.title')}</h4>
          ${hasData ? `<span class="ceg-active-badge" data-testid="ceg-active-count">${t('ceg.rows.active', { n: activeCount })}</span>` : ''}
          <div class="ceg-table-actions">
            ${hasData && !cegQuiz.active ? `<button type="button" class="quiz-start-btn" data-testid="ceg-quiz-start">${t('quiz.start')}</button>` : ''}
            ${hasData && !cegLabReflect.active ? `<button type="button" class="quiz-start-btn" data-testid="ceg-lab-reflect-start">${t('lab.reflect.start')}</button>` : ''}
            ${metricEncoded ? `<button type="button" class="quiz-share-btn" data-share-payload="${metricEncoded}" data-testid="ceg-lab-metric">📊 ${t('lab.metric.record')}</button>` : ''}
          </div>
        </div>
        ${tableHtml}
        ${renderQuizPanel(activeCount)}
        ${renderLabReflectPanel()}
      </div>

      <p class="ceg-hint">${t('ceg.hint')}</p>
    `;

    bindEvents();
  }

  /* ── event binding ── */

  function bindEvents() {
    // Add cause
    root.querySelector('[data-testid="ceg-cause-add"]').addEventListener('click', () => {
      const n = causes.length + 1;
      causes.push({ id: uid(), name: `C${n}`, label: '' });
      render();
    });

    // Remove cause
    root.querySelectorAll('[data-remove-cause]').forEach((btn) => {
      btn.addEventListener('click', () => {
        causes = causes.filter((c) => c.id !== btn.dataset.removeCause);
        render();
      });
    });

    // Edit cause label
    root.querySelectorAll('[data-cause-label]').forEach((input) => {
      input.addEventListener('change', () => {
        const c = causes.find((x) => x.id === input.dataset.causeLabel);
        if (c) { c.label = input.value; render(); }
      });
    });

    // Add effect
    root.querySelector('[data-testid="ceg-effect-add"]').addEventListener('click', () => {
      const n = effects.length + 1;
      effects.push({ id: uid(), name: `E${n}`, label: '', formula: '' });
      render();
    });

    // Remove effect
    root.querySelectorAll('[data-remove-effect]').forEach((btn) => {
      btn.addEventListener('click', () => {
        effects = effects.filter((e) => e.id !== btn.dataset.removeEffect);
        render();
      });
    });

    // Edit effect label
    root.querySelectorAll('[data-effect-label]').forEach((input) => {
      input.addEventListener('change', () => {
        const e = effects.find((x) => x.id === input.dataset.effectLabel);
        if (e) { e.label = input.value; render(); }
      });
    });

    // Edit effect formula (live re-render on input for immediate validation feedback)
    root.querySelectorAll('[data-effect-formula]').forEach((input) => {
      input.addEventListener('input', () => {
        const e = effects.find((x) => x.id === input.dataset.effectFormula);
        if (e) { e.formula = input.value; render(); }
      });
    });

    // Quiz
    const qStart = root.querySelector('[data-testid="ceg-quiz-start"]');
    if (qStart) qStart.addEventListener('click', () => {
      cegQuiz.active = true; cegQuiz.phase = 'question'; cegQuiz.answer = ''; render();
    });

    const qClose = root.querySelector('[data-testid="ceg-quiz-close"]');
    if (qClose) qClose.addEventListener('click', () => { cegQuiz.active = false; render(); });

    const qCheck = root.querySelector('[data-testid="ceg-quiz-check"]');
    if (qCheck) qCheck.addEventListener('click', () => {
      const inp = root.querySelector('[data-testid="ceg-quiz-input"]');
      cegQuiz.answer = inp ? inp.value : '';
      cegQuiz.phase = 'graded';
      render();
    });

    const qReset = root.querySelector('[data-testid="ceg-quiz-reset"]');
    if (qReset) qReset.addEventListener('click', () => {
      cegQuiz.phase = 'question'; cegQuiz.answer = ''; render();
    });

    // Lab Reflect
    const lrStart = root.querySelector('[data-testid="ceg-lab-reflect-start"]');
    if (lrStart) lrStart.addEventListener('click', () => {
      cegLabReflect.active = true; render();
    });

    const lrClose = root.querySelector('[data-testid="ceg-lab-reflect-close"]');
    if (lrClose) lrClose.addEventListener('click', () => {
      const a1el = root.querySelector('[data-testid="ceg-lab-reflect-a1"]');
      const a2el = root.querySelector('[data-testid="ceg-lab-reflect-a2"]');
      if (a1el) cegLabReflect.a1 = a1el.value;
      if (a2el) cegLabReflect.a2 = a2el.value;
      cegLabReflect.active = false;
      render();
    });

    const lrA1 = root.querySelector('[data-testid="ceg-lab-reflect-a1"]');
    if (lrA1) lrA1.addEventListener('input', () => { cegLabReflect.a1 = lrA1.value; });

    const lrA2 = root.querySelector('[data-testid="ceg-lab-reflect-a2"]');
    if (lrA2) lrA2.addEventListener('input', () => { cegLabReflect.a2 = lrA2.value; });

    const lrShare = root.querySelector('[data-testid="ceg-lab-reflect-share"]');
    if (lrShare) lrShare.addEventListener('click', () => {
      const a1 = root.querySelector('[data-testid="ceg-lab-reflect-a1"]')?.value || cegLabReflect.a1;
      const a2 = root.querySelector('[data-testid="ceg-lab-reflect-a2"]')?.value || cegLabReflect.a2;
      const url = buildShareUrl(encodeResult({
        v: 1, explorer: 'ceg', explorerLabel: t('lab.reflect.title'),
        mode: 'lab-reflect', ts: Date.now(), lang: getLocale(),
        score: 0, total: 0,
        items: [
          { q: t('lab.reflect.q.ceg.1'), a: a1, ok: true },
          { q: t('lab.reflect.q.ceg.2'), a: a2, ok: true },
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
