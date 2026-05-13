import { t, getLocale } from '../i18n/index.js';

// V-model phases: left arm = development, right arm = testing
// index 0 = top-left/top-right, index 4 = bottom (implementation)
const V_PAIRS = [
  {
    id: 'requirements',
    devIcon: '📋',
    testIcon: '✅',
    artifactIcon: '📄',
    color: '#3498db',
  },
  {
    id: 'system-design',
    devIcon: '🏗️',
    testIcon: '🔬',
    artifactIcon: '📐',
    color: '#9b59b6',
  },
  {
    id: 'architecture',
    devIcon: '🧩',
    testIcon: '🔗',
    artifactIcon: '📊',
    color: '#e67e22',
  },
  {
    id: 'module-design',
    devIcon: '📦',
    testIcon: '🧪',
    artifactIcon: '📝',
    color: '#27ae60',
  },
];

const IMPL = {
  id: 'implementation',
  icon: '💻',
  color: '#e74c3c',
};

function escapeHtml(v = '') {
  return String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

export function createVModelExplorer() {
  const root = document.createElement('div');
  root.className = 'vme-root';
  root.dataset.testid = 'vmodel-explorer';

  let selectedId = null;

  function render() {
    const isZh = getLocale() === 'zh';
    const selected = V_PAIRS.find((p) => p.id === selectedId) ||
      (selectedId === 'implementation' ? IMPL : null);

    // Build rows: each pair occupies one horizontal level
    // indent increases as we go down (V narrows), reverses on right side
    const rows = V_PAIRS.map((pair, i) => {
      const indent = i * 28;
      const isActive = selectedId === pair.id;
      const activeClass = isActive ? ' vme-node--active' : '';

      const devLabel = isZh ? t(`vme.dev.${pair.id}`) : t(`vme.dev.${pair.id}.en`);
      const testLabel = isZh ? t(`vme.test.${pair.id}`) : t(`vme.test.${pair.id}.en`);

      return `
        <div class="vme-row" data-testid="vme-row-${pair.id}" style="--vme-indent:${indent}px;--vme-color:${pair.color}">
          <button type="button"
            class="vme-node vme-node--dev${activeClass}"
            data-vme-id="${pair.id}"
            data-testid="vme-dev-${pair.id}"
            title="${escapeHtml(devLabel)}"
            style="margin-left:var(--vme-indent)">
            <span class="vme-node-icon">${pair.devIcon}</span>
            <span class="vme-node-label">${escapeHtml(devLabel)}</span>
          </button>

          <div class="vme-connector" aria-hidden="true">
            ${isActive ? `<span class="vme-connector-arrow vme-connector-arrow--left">◀</span>` : ''}
            <div class="vme-connector-line${isActive ? ' vme-connector-line--active' : ''}"></div>
            ${isActive ? `<span class="vme-connector-arrow vme-connector-arrow--right">▶</span>` : ''}
          </div>

          <button type="button"
            class="vme-node vme-node--test${activeClass}"
            data-vme-id="${pair.id}"
            data-testid="vme-test-${pair.id}"
            title="${escapeHtml(testLabel)}"
            style="margin-right:var(--vme-indent)">
            <span class="vme-node-icon">${pair.testIcon}</span>
            <span class="vme-node-label">${escapeHtml(testLabel)}</span>
          </button>
        </div>
      `;
    }).join('');

    const implLabel = isZh ? t('vme.impl') : t('vme.impl.en');
    const implActive = selectedId === 'implementation' ? ' vme-node--active' : '';

    const detailHtml = selected && selected.id !== 'implementation' ? `
      <div class="vme-detail" data-testid="vme-detail">
        <div class="vme-detail-header" style="--vme-detail-color:${selected.color}">
          <span>${selected.devIcon}</span>
          <strong>${escapeHtml(isZh ? t(`vme.dev.${selected.id}`) : t(`vme.dev.${selected.id}.en`))}</strong>
          <span class="vme-detail-arrow">↔</span>
          <strong>${escapeHtml(isZh ? t(`vme.test.${selected.id}`) : t(`vme.test.${selected.id}.en`))}</strong>
          <span>${selected.testIcon}</span>
        </div>
        <div class="vme-detail-artifact">
          <span class="vme-artifact-icon">${selected.artifactIcon}</span>
          <div>
            <div class="vme-artifact-label">${t('vme.artifact')}</div>
            <div class="vme-artifact-value">${escapeHtml(isZh ? t(`vme.artifact.${selected.id}`) : t(`vme.artifact.${selected.id}.en`))}</div>
          </div>
        </div>
        <p class="vme-detail-desc">${escapeHtml(isZh ? t(`vme.desc.${selected.id}`) : t(`vme.desc.${selected.id}.en`))}</p>
      </div>
    ` : selected && selected.id === 'implementation' ? `
      <div class="vme-detail" data-testid="vme-detail">
        <div class="vme-detail-header" style="--vme-detail-color:${IMPL.color}">
          <span>${IMPL.icon}</span>
          <strong>${escapeHtml(implLabel)}</strong>
        </div>
        <p class="vme-detail-desc">${escapeHtml(isZh ? t('vme.desc.implementation') : t('vme.desc.implementation.en'))}</p>
      </div>
    ` : `<p class="vme-hint" data-testid="vme-hint">${t('vme.hint')}</p>`;

    root.innerHTML = `
      <div class="vme-header">
        <h3 class="vme-title">${t('vme.title')}</h3>
        <p class="vme-subtitle">${t('vme.subtitle')}</p>
      </div>
      <div class="vme-diagram" data-testid="vme-diagram">
        <div class="vme-col-header">
          <span class="vme-col-title vme-col-title--dev">${t('vme.col.dev')}</span>
          <span class="vme-col-title vme-col-title--test">${t('vme.col.test')}</span>
        </div>
        <div class="vme-rows">${rows}</div>
        <div class="vme-impl-row">
          <button type="button"
            class="vme-node vme-node--impl${implActive}"
            data-vme-id="implementation"
            data-testid="vme-impl">
            <span class="vme-node-icon">${IMPL.icon}</span>
            <span class="vme-node-label">${escapeHtml(implLabel)}</span>
          </button>
        </div>
      </div>
      ${detailHtml}
    `;

    root.querySelectorAll('[data-vme-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedId = selectedId === btn.dataset.vmeId ? null : btn.dataset.vmeId;
        render();
      });
    });
  }

  render();
  return root;
}
