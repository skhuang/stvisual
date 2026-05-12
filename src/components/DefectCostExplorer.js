import { t, getLocale } from '../i18n/index.js';

// Cost multiplier data — illustrative, based on Boehm (1981) and NIST studies.
// Numbers intentionally rounded for teaching clarity.
const PHASES = [
  {
    id: 'requirements',
    icon: '📋',
    cost: 1,
    techniques: ['Requirements review', 'Inspections', 'Prototyping'],
    techniquesZh: ['需求審查', '文件審查', '原型驗證'],
    exampleEn: 'A misunderstood requirement caught in a review meeting costs one hour to correct.',
    exampleZh: '需求審查會議中發現的誤解，修正只需一小時。',
  },
  {
    id: 'design',
    icon: '✏️',
    cost: 3,
    techniques: ['Design review', 'Architecture walkthrough', 'Prototyping'],
    techniquesZh: ['設計審查', '架構走查', '原型驗證'],
    exampleEn: 'A flawed API contract spotted in design review needs a few days of redesign.',
    exampleZh: '設計審查中發現的 API 設計缺陷，需要數天重新設計。',
  },
  {
    id: 'coding',
    icon: '💻',
    cost: 10,
    techniques: ['Code review', 'Static analysis', 'Unit testing'],
    techniquesZh: ['程式碼審查', '靜態分析', '單元測試'],
    exampleEn: 'A logic error found during unit testing may require reworking a whole module.',
    exampleZh: '單元測試發現的邏輯錯誤，可能需要重寫整個模組。',
  },
  {
    id: 'testing',
    icon: '🔍',
    cost: 40,
    techniques: ['Integration testing', 'System testing', 'Regression testing'],
    techniquesZh: ['整合測試', '系統測試', '迴歸測試'],
    exampleEn: 'A defect found during system test requires a fix, re-test cycle, and documentation update.',
    exampleZh: '系統測試中發現的缺陷，需要修正、重新測試並更新文件。',
  },
  {
    id: 'production',
    icon: '🚨',
    cost: 100,
    techniques: ['Incident response', 'Hotfix deployment', 'User impact mitigation'],
    techniquesZh: ['事故應變', '緊急修補部署', '使用者影響緩解'],
    exampleEn: 'A production bug may trigger an incident response, data migration, and public apology.',
    exampleZh: '上線後的缺陷可能觸發事故應變、資料遷移，甚至公開道歉聲明。',
  },
];

// Log scale for bar heights (base 10), mapped to 0–100% range
const LOG_MAX = Math.log10(100); // = 2
function logHeight(cost) {
  return Math.round((Math.log10(cost) / LOG_MAX) * 100);
}

const BAR_COLORS = ['#27ae60', '#2ecc71', '#f39c12', '#e67e22', '#e74c3c'];

function escapeHtml(v = '') {
  return String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

export function createDefectCostExplorer() {
  const root = document.createElement('div');
  root.className = 'dce-root';
  root.dataset.testid = 'defect-cost-explorer';

  let selectedId = null;

  function render() {
    const isZh = getLocale() === 'zh';
    const selected = PHASES.find((p) => p.id === selectedId) || null;

    const bars = PHASES.map((phase, i) => {
      const h = logHeight(phase.cost);
      const isActive = selectedId === phase.id;
      const phaseLabel = isZh
        ? t(`dce.phase.${phase.id}`)
        : t(`dce.phase.${phase.id}.en`);
      return `
        <div class="dce-col${isActive ? ' dce-col--active' : ''}"
          data-testid="dce-col-${phase.id}"
          data-dce-phase="${phase.id}"
          role="button"
          tabindex="0"
          aria-label="${escapeHtml(phaseLabel)} ×${phase.cost}">
          <div class="dce-bar-wrap">
            <div class="dce-cost-label" data-testid="dce-cost-${phase.id}">×${phase.cost}</div>
            <div class="dce-bar" style="height:${h}%;background:${BAR_COLORS[i]}" data-testid="dce-bar-${phase.id}"></div>
          </div>
          <div class="dce-phase-icon">${phase.icon}</div>
          <div class="dce-phase-label">${escapeHtml(phaseLabel)}</div>
        </div>
      `;
    }).join('');

    const detailHtml = selected ? `
      <div class="dce-detail" data-testid="dce-detail">
        <div class="dce-detail-header">
          <span class="dce-detail-icon">${selected.icon}</span>
          <span class="dce-detail-title">${escapeHtml(isZh ? t(`dce.phase.${selected.id}`) : t(`dce.phase.${selected.id}.en`))}</span>
          <span class="dce-detail-cost" data-testid="dce-detail-cost">×${selected.cost}</span>
        </div>
        <p class="dce-detail-example">${escapeHtml(isZh ? selected.exampleZh : selected.exampleEn)}</p>
        <div class="dce-detail-techniques">
          <span class="dce-detail-tech-label">${t('dce.techniques')}:</span>
          ${(isZh ? selected.techniquesZh : selected.techniques).map((tech) => `<span class="dce-tech-tag">${escapeHtml(tech)}</span>`).join('')}
        </div>
      </div>
    ` : `<p class="dce-hint" data-testid="dce-hint">${t('dce.hint')}</p>`;

    root.innerHTML = `
      <div class="dce-header">
        <h3 class="dce-title">${t('dce.title')}</h3>
        <p class="dce-subtitle">${t('dce.subtitle')}</p>
      </div>
      <div class="dce-chart" data-testid="dce-chart">
        <div class="dce-yaxis">
          <span class="dce-yaxis-label">×100</span>
          <span class="dce-yaxis-label">×10</span>
          <span class="dce-yaxis-label">×1</span>
        </div>
        <div class="dce-cols" data-testid="dce-cols">${bars}</div>
      </div>
      <div class="dce-disclaimer">${t('dce.disclaimer')}</div>
      ${detailHtml}
    `;

    root.querySelectorAll('[data-dce-phase]').forEach((el) => {
      const select = () => {
        selectedId = selectedId === el.dataset.dcePhase ? null : el.dataset.dcePhase;
        render();
      };
      el.addEventListener('click', select);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); }
      });
    });
  }

  render();
  return root;
}
