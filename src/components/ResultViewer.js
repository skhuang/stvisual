import { t, getLocale } from '../i18n/index.js';
import { parseResultFromUrl } from '../utils/resultExporter.js';

function escapeHtml(v = '') {
  return String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function formatTs(ts) {
  try {
    return new Date(ts).toLocaleString(getLocale() === 'zh' ? 'zh-TW' : 'en-US');
  } catch {
    return String(ts);
  }
}

export function createResultViewer(onClose) {
  const result = parseResultFromUrl();
  if (!result) return null;

  // Clean the ?result= param from the URL so sharing the page again doesn't
  // re-open the viewer for other visitors.
  try {
    const url = new URL(location.href);
    url.searchParams.delete('result');
    history.replaceState(null, '', url.pathname + (url.search || ''));
  } catch {}

  const overlay = document.createElement('div');
  overlay.className = 'rv-overlay';
  overlay.dataset.testid = 'result-viewer';

  const scoreClass = result.total > 0 && result.score / result.total >= 0.8
    ? 'rv-score--pass' : result.total > 0 && result.score / result.total >= 0.5
    ? 'rv-score--partial' : 'rv-score--fail';

  const modeBadge = result.mode === 'quiz'
    ? t('rv.mode.quiz')
    : result.mode === 'lab-reflect'
    ? t('rv.mode.labReflect')
    : t('rv.mode.labMetric');

  const itemsHtml = (result.items && result.items.length > 0)
    ? `<table class="rv-items">
        <thead><tr>
          <th>${t('rv.col.question')}</th>
          <th>${t('rv.col.answer')}</th>
          ${result.mode === 'quiz' ? `<th>${t('rv.col.expected')}</th><th></th>` : ''}
        </tr></thead>
        <tbody>
          ${result.items.map((item) => `
            <tr${result.mode === 'quiz' ? ` data-ok="${item.ok ? 'true' : 'false'}"` : ''}>
              <td class="rv-item-q">${escapeHtml(item.q)}</td>
              <td class="rv-item-a">${escapeHtml(item.a)}</td>
              ${result.mode === 'quiz' ? `
                <td class="rv-item-exp">${escapeHtml(String(item.expected ?? ''))}</td>
                <td class="rv-item-ok">${item.ok ? '✓' : '✗'}</td>
              ` : ''}
            </tr>
          `).join('')}
        </tbody>
      </table>`
    : '';

  overlay.innerHTML = `
    <div class="rv-card" role="dialog" aria-modal="true" aria-labelledby="rv-title">
      <div class="rv-header">
        <div>
          <div class="rv-kicker">
            <span class="rv-mode-badge">${escapeHtml(modeBadge)}</span>
            <span class="rv-explorer">${escapeHtml(result.explorerLabel || result.explorer)}</span>
          </div>
          <h2 class="rv-title" id="rv-title">${t('rv.title')}</h2>
        </div>
        <button type="button" class="rv-close" data-testid="rv-close" aria-label="${t('common.close')}">×</button>
      </div>

      <div class="rv-meta">
        <span class="rv-meta-item">🕐 ${escapeHtml(formatTs(result.ts))}</span>
        <span class="rv-meta-item">🌐 ${result.lang === 'zh' ? '中文' : 'English'}</span>
      </div>

      ${result.mode === 'quiz' ? `
        <div class="rv-score-wrap">
          <div class="rv-score ${scoreClass}" data-testid="rv-score">
            ${result.score} <span class="rv-score-sep">/</span> ${result.total}
          </div>
          <div class="rv-score-label">${t('rv.score.label')}</div>
        </div>
      ` : `
        <div class="rv-score-wrap">
          <div class="rv-score ${result.passed ? 'rv-score--pass' : 'rv-score--fail'}" data-testid="rv-score">
            ${result.passed ? t('rv.passed') : t('rv.notPassed')}
          </div>
        </div>
      `}

      ${itemsHtml}

      <p class="rv-disclaimer">${t('rv.disclaimer')}</p>

      <div class="rv-actions">
        <button type="button" class="rv-btn rv-btn--primary" data-rv-close data-testid="rv-close-btn">
          ${t('rv.close')}
        </button>
      </div>
    </div>
  `;

  function close() {
    overlay.remove();
    if (typeof onClose === 'function') onClose();
  }

  overlay.querySelector('[data-rv-close]').addEventListener('click', close);
  overlay.querySelector('.rv-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  return overlay;
}
