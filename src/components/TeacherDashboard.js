import { createCloudIntegrationClient } from '../utils/cloudIntegration.js';
import { t } from '../i18n/index.js';

function escapeHtml(v = '') {
  return String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function fmtTs(ts) {
  if (!ts) return '—';
  try { return new Date(ts).toLocaleString(); } catch { return String(ts); }
}

function fmtScore(score, total) {
  if (total == null || total === 0) return '—';
  return `${score ?? 0} / ${total}`;
}

export function createTeacherDashboard() {
  const root = document.createElement('div');
  root.dataset.testid = 'teacher-dashboard';
  root.className = 'td-overlay';

  const client = createCloudIntegrationClient();

  let classCode = '';
  let results = [];
  let loading = false;
  let errorMsg = '';
  let filterExplorer = '';

  function explorerOptions() {
    const names = [...new Set(results.map(r => r.explorer).filter(Boolean))].sort();
    return ['', ...names];
  }

  function filteredResults() {
    if (!filterExplorer) return results;
    return results.filter(r => r.explorer === filterExplorer);
  }

  function render() {
    const filtered = filteredResults();
    const explorerOpts = explorerOptions();

    root.innerHTML = `
      <div class="td-panel" role="dialog" aria-modal="true" aria-label="${t('td.title')}" data-testid="td-panel">
        <div class="td-header">
          <div class="td-header-left">
            <h2 class="td-title">${t('td.title')}</h2>
            ${classCode ? `<span class="td-class-badge">${escapeHtml(classCode)}</span>` : ''}
          </div>
          <button type="button" class="td-close-btn" data-testid="td-close" aria-label="${t('td.close')}">✕</button>
        </div>

        <div class="td-search-row">
          <label class="td-label">
            ${t('td.classCode')}
            <div class="td-code-row">
              <input type="text"
                class="td-code-input"
                data-testid="td-code-input"
                value="${escapeHtml(classCode)}"
                placeholder="${t('td.codePlaceholder')}"
                maxlength="20"
                autocomplete="off"
                spellcheck="false" />
              <button type="button" class="td-load-btn" data-testid="td-load-btn">
                ${loading ? t('td.loading') : t('td.load')}
              </button>
            </div>
          </label>
          ${results.length > 0 ? `
          <label class="td-label td-filter-label">
            ${t('td.filterExplorer')}
            <select class="td-filter-select" data-testid="td-filter-explorer">
              ${explorerOpts.map(e => `<option value="${escapeHtml(e)}" ${filterExplorer === e ? 'selected' : ''}>${e || t('td.filterAll')}</option>`).join('')}
            </select>
          </label>` : ''}
        </div>

        ${errorMsg ? `<p class="td-error" data-testid="td-error">${escapeHtml(errorMsg)}</p>` : ''}

        ${results.length === 0 && !loading && !errorMsg && classCode
          ? `<p class="td-empty" data-testid="td-empty">${t('td.empty')}</p>`
          : ''}

        ${filtered.length > 0 ? `
        <div class="td-summary-row">
          <span class="td-badge td-badge--blue">${t('td.resultCount', { n: filtered.length })}</span>
          <span class="td-badge td-badge--grey">${t('td.studentCount', { n: new Set(filtered.map(r => r.uid)).size })}</span>
        </div>
        <div class="td-table-wrap">
          <table class="td-table" data-testid="td-table">
            <thead>
              <tr>
                <th>${t('td.col.student')}</th>
                <th>${t('td.col.explorer')}</th>
                <th>${t('td.col.mode')}</th>
                <th>${t('td.col.score')}</th>
                <th>${t('td.col.time')}</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map((r, i) => `
                <tr class="${r.score === r.total && r.total > 0 ? 'td-row--perfect' : ''}"
                    data-testid="td-row-${i}">
                  <td class="td-student">
                    <span class="td-name">${escapeHtml(r.displayName || r.email || r.uid)}</span>
                    ${r.email && r.displayName ? `<span class="td-email">${escapeHtml(r.email)}</span>` : ''}
                  </td>
                  <td>${escapeHtml(r.explorerLabel || r.explorer)}</td>
                  <td><span class="td-mode-badge td-mode-badge--${escapeHtml(r.mode || 'quiz')}">${escapeHtml(r.mode || '—')}</span></td>
                  <td class="${r.score === r.total && r.total > 0 ? 'td-score--perfect' : ''}">${escapeHtml(fmtScore(r.score, r.total))}</td>
                  <td class="td-time">${escapeHtml(fmtTs(r.ts))}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>` : ''}
      </div>`;

    bindEvents();
  }

  function bindEvents() {
    root.querySelector('[data-testid="td-close"]').addEventListener('click', () => {
      root.hidden = true;
    });

    root.querySelector('[data-testid="td-load-btn"]').addEventListener('click', async () => {
      const inp = root.querySelector('[data-testid="td-code-input"]');
      classCode = (inp?.value || '').trim().toUpperCase();
      if (!classCode) { errorMsg = t('td.err.noCode'); render(); return; }
      loading = true; errorMsg = ''; results = []; render();
      try {
        results = await client.loadCourseResults(classCode);
        filterExplorer = '';
      } catch (err) {
        errorMsg = err.message || t('td.err.loadFailed');
      }
      loading = false;
      render();
    });

    root.querySelector('[data-testid="td-filter-explorer"]')?.addEventListener('change', e => {
      filterExplorer = e.target.value;
      render();
    });
  }

  render();

  // Listen for open event from CloudStoragePanel
  window.addEventListener('stvisual:open-teacher-dashboard', (e) => {
    classCode = e.detail?.classCode || classCode;
    root.hidden = false;
    render();
  });

  return root;
}
