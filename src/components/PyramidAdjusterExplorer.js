import { t, getLocale } from '../i18n/index.js';

const PRESETS = [
  { id: 'ideal',     unit: 70, integration: 20, e2e: 10 },
  { id: 'icecream',  unit: 10, integration: 20, e2e: 70 },
  { id: 'hourglass', unit: 40, integration: 10, e2e: 50 },
];

const LAYERS = [
  { id: 'e2e',         color: '#e74c3c' },
  { id: 'integration', color: '#f39c12' },
  { id: 'unit',        color: '#27ae60' },
];

// Derive three trait scores (0–100) from the ratios
function computeTraits(unit, integration, e2e) {
  // Speed: high unit % = fast; high e2e % = slow
  const speed = Math.round(unit * 0.8 + integration * 0.4 + e2e * 0.1);
  // Maintenance cost: high e2e % = expensive; high unit % = cheap
  const maintenance = Math.round(e2e * 0.9 + integration * 0.5 + unit * 0.1);
  // Confidence: balanced pyramid peaks around ideal proportions; extreme skews drop it
  const balance = 100 - Math.round(
    Math.abs(unit - 70) * 0.5 +
    Math.abs(integration - 20) * 0.8 +
    Math.abs(e2e - 10) * 0.9,
  );
  return {
    speed: Math.max(0, Math.min(100, speed)),
    maintenance: Math.max(0, Math.min(100, maintenance)),
    confidence: Math.max(0, Math.min(100, balance)),
  };
}

function traitLevel(score) {
  if (score >= 66) return 'high';
  if (score >= 33) return 'medium';
  return 'low';
}

function escapeHtml(v = '') {
  return String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

export function createPyramidAdjusterExplorer() {
  const root = document.createElement('div');
  root.className = 'pya-root';
  root.dataset.testid = 'pyramid-adjuster';

  let unit = 70;
  let integration = 20;
  let e2e = 10;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function adjustRatios(changedId, newVal) {
    // Keep sum = 100: when one changes, split the remainder among the other two pro-rata
    newVal = clamp(newVal, 5, 90);
    if (changedId === 'unit') {
      const remaining = 100 - newVal;
      const totalOther = integration + e2e || 1;
      integration = Math.round(integration / totalOther * remaining);
      e2e = 100 - newVal - integration;
      unit = newVal;
    } else if (changedId === 'integration') {
      const remaining = 100 - newVal;
      const totalOther = unit + e2e || 1;
      unit = Math.round(unit / totalOther * remaining);
      e2e = 100 - newVal - unit;
      integration = newVal;
    } else {
      const remaining = 100 - newVal;
      const totalOther = unit + integration || 1;
      unit = Math.round(unit / totalOther * remaining);
      integration = 100 - newVal - unit;
      e2e = newVal;
    }
    unit = clamp(unit, 5, 90);
    integration = clamp(integration, 5, 90);
    e2e = clamp(e2e, 5, 90);
    // Fix rounding so sum = 100
    const sum = unit + integration + e2e;
    if (sum !== 100) unit += (100 - sum);
  }

  function render() {
    const isZh = getLocale() === 'zh';
    const traits = computeTraits(unit, integration, e2e);

    // Pyramid: e2e on top (small), unit at bottom (large)
    const pyramidLayers = LAYERS.map((layer) => {
      const pct = layer.id === 'unit' ? unit : layer.id === 'integration' ? integration : e2e;
      // Width of the trapezoid row: e2e narrowest (top), unit widest (bottom)
      const widthPct = layer.id === 'unit' ? 100 : layer.id === 'integration' ? 65 : 35;
      const heightPx = Math.max(24, Math.round(pct * 1.2));
      const label = isZh ? t(`pya.layer.${layer.id}`) : t(`pya.layer.${layer.id}.en`);
      return `
        <div class="pya-pyramid-row" style="width:${widthPct}%;height:${heightPx}px;background:${layer.color}" data-testid="pya-layer-${layer.id}">
          <span class="pya-pyramid-label">${escapeHtml(label)} ${pct}%</span>
        </div>
      `;
    }).join('');

    // Sliders
    const sliders = LAYERS.map((layer) => {
      const pct = layer.id === 'unit' ? unit : layer.id === 'integration' ? integration : e2e;
      const label = isZh ? t(`pya.layer.${layer.id}`) : t(`pya.layer.${layer.id}.en`);
      return `
        <div class="pya-slider-row">
          <label class="pya-slider-label" style="color:${layer.color}">${escapeHtml(label)}</label>
          <input type="range" min="5" max="90" value="${pct}"
            class="pya-slider" data-pya-layer="${layer.id}"
            data-testid="pya-slider-${layer.id}"
            style="--pya-color:${layer.color}" />
          <span class="pya-slider-val" data-testid="pya-val-${layer.id}">${pct}%</span>
        </div>
      `;
    }).join('');

    // Trait bars
    const traitRows = [
      { id: 'speed',       score: traits.speed,       good: 'high' },
      { id: 'maintenance', score: traits.maintenance,  good: 'low'  },
      { id: 'confidence',  score: traits.confidence,   good: 'high' },
    ].map(({ id, score, good }) => {
      const level = traitLevel(score);
      const positive = (good === 'high' && level === 'high') || (good === 'low' && level === 'low');
      const label = isZh ? t(`pya.trait.${id}`) : t(`pya.trait.${id}.en`);
      const levelLabel = isZh ? t(`pya.level.${level}`) : t(`pya.level.${level}.en`);
      return `
        <div class="pya-trait-row" data-testid="pya-trait-${id}">
          <span class="pya-trait-label">${escapeHtml(label)}</span>
          <div class="pya-trait-bar-wrap">
            <div class="pya-trait-bar pya-trait-bar--${level}" style="width:${score}%" data-testid="pya-trait-bar-${id}"></div>
          </div>
          <span class="pya-trait-level pya-trait-level--${positive ? 'good' : 'warn'}">${escapeHtml(levelLabel)}</span>
        </div>
      `;
    }).join('');

    // Preset buttons
    const presetBtns = PRESETS.map((p) => `
      <button type="button" class="pya-preset-btn" data-pya-preset="${p.id}" data-testid="pya-preset-${p.id}">
        ${escapeHtml(isZh ? t(`pya.preset.${p.id}`) : t(`pya.preset.${p.id}.en`))}
      </button>
    `).join('');

    root.innerHTML = `
      <div class="pya-header">
        <h3 class="pya-title">${t('pya.title')}</h3>
        <p class="pya-subtitle">${t('pya.subtitle')}</p>
      </div>
      <div class="pya-layout">
        <div class="pya-left">
          <div class="pya-pyramid-wrap" data-testid="pya-pyramid">
            ${pyramidLayers}
          </div>
          <div class="pya-presets">${presetBtns}</div>
        </div>
        <div class="pya-right">
          <div class="pya-sliders" data-testid="pya-sliders">${sliders}</div>
          <div class="pya-traits" data-testid="pya-traits">
            <h4 class="pya-traits-title">${t('pya.traits.title')}</h4>
            ${traitRows}
          </div>
        </div>
      </div>
      <p class="pya-disclaimer">${t('pya.disclaimer')}</p>
    `;

    root.querySelectorAll('[data-pya-layer]').forEach((input) => {
      input.addEventListener('input', () => {
        adjustRatios(input.dataset.pyaLayer, Number(input.value));
        render();
      });
    });

    root.querySelectorAll('[data-pya-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = PRESETS.find((x) => x.id === btn.dataset.pyaPreset);
        if (!p) return;
        unit = p.unit; integration = p.integration; e2e = p.e2e;
        render();
      });
    });
  }

  render();
  return root;
}
