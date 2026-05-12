import { t, getLocale } from '../i18n/index.js';
import { metamorphicExamples, generateMrTests } from '../utils/metamorphicTesting.js';

function escapeHtml(v = '') {
  return String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function createMetamorphicTestingExplorer() {
  const root = document.createElement('div');
  root.dataset.testid = 'mt-explorer';

  let state = {
    exampleId: metamorphicExamples[0].id,
    relationId: metamorphicExamples[0].relations[0].id,
    results: null,
  };

  function getExample() {
    return metamorphicExamples.find((e) => e.id === state.exampleId) ?? metamorphicExamples[0];
  }

  function getRelation() {
    const ex = getExample();
    return ex.relations.find((r) => r.id === state.relationId) ?? ex.relations[0];
  }

  function render() {
    const ex = getExample();
    const rel = getRelation();
    const isZh = getLocale() === 'zh';

    root.innerHTML = `
      <div class="mt-layout">
        <div class="mt-sidebar">
          <h3 class="mt-section-title">${t('mt.examples.title')}</h3>
          <div class="mt-example-btns" data-testid="mt-examples">
            ${metamorphicExamples.map((e) => `
              <button type="button"
                class="mt-example-btn${e.id === state.exampleId ? ' active' : ''}"
                data-testid="mt-example-${e.id}"
                data-example="${e.id}"
              >${e.name}</button>
            `).join('')}
          </div>

          <h3 class="mt-section-title">${t('mt.relations.title')}</h3>
          <div class="mt-relation-list" data-testid="mt-relations">
            ${ex.relations.map((r) => `
              <button type="button"
                class="mt-rel-btn${r.id === state.relationId ? ' active' : ''}"
                data-testid="mt-rel-${r.id}"
                data-rel="${r.id}"
              >
                <span class="mt-rel-name">${isZh ? r.nameZh : r.name}</span>
                <code class="mt-rel-formula">${escapeHtml(r.formula)}</code>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="mt-main">
          <div class="mt-info-card">
            <h3 class="mt-info-title">${ex.name}</h3>
            <p class="mt-info-desc">${isZh ? ex.descriptionZh : ex.description}</p>
            <details class="mt-source-details">
              <summary>${t('mt.source.label')}</summary>
              <pre class="mt-source-pre"><code>${escapeHtml(ex.sourceCode)}</code></pre>
            </details>
          </div>

          <div class="mt-mr-card" data-testid="mt-mr-card">
            <div class="mt-mr-header">
              <span class="mt-mr-name">${isZh ? rel.nameZh : rel.name}</span>
              <code class="mt-mr-formula">${escapeHtml(rel.formula)}</code>
            </div>
            <p class="mt-mr-desc">${isZh ? rel.descZh : rel.desc}</p>
            <button type="button" class="mt-generate-btn" data-testid="mt-generate">
              ${t('mt.generate')}
            </button>
          </div>

          <div class="mt-results" data-testid="mt-results">
            ${state.results ? renderResults(state.results) : `<p class="mt-hint">${t('mt.hint')}</p>`}
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function renderResults(results) {
    const passing = results.filter((r) => r.holds).length;
    const total = results.length;
    const allPass = passing === total;

    return `
      <div class="mt-results-header">
        <span class="mt-results-title">${t('mt.results.title')}</span>
        <span class="mt-results-badge${allPass ? ' mt-results-badge--pass' : ' mt-results-badge--fail'}">
          ${passing}/${total} ${t('mt.results.hold')}
        </span>
      </div>
      <div class="mt-table-wrap">
        <table class="mt-table" data-testid="mt-table">
          <thead>
            <tr>
              <th>${t('mt.col.no')}</th>
              <th>${t('mt.col.input')}</th>
              <th>${t('mt.col.output')}</th>
              <th>${t('mt.col.transInput')}</th>
              <th>${t('mt.col.transOutput')}</th>
              <th>${t('mt.col.holds')}</th>
            </tr>
          </thead>
          <tbody>
            ${results.map((r, i) => `
              <tr class="${r.holds ? 'mt-row--pass' : 'mt-row--fail'}" data-testid="mt-row-${i}">
                <td>${i + 1}</td>
                <td><code>${escapeHtml(r.input)}</code></td>
                <td><code>${escapeHtml(r.output)}</code></td>
                <td><code>${escapeHtml(r.transformedInput)}</code></td>
                <td><code>${escapeHtml(r.transformedOutput)}</code></td>
                <td class="mt-holds">${r.holds ? '✓' : '✗'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function bindEvents() {
    root.querySelectorAll('[data-example]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.exampleId = btn.dataset.example;
        const ex = getExample();
        state.relationId = ex.relations[0].id;
        state.results = null;
        render();
      });
    });

    root.querySelectorAll('[data-rel]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.relationId = btn.dataset.rel;
        state.results = null;
        render();
      });
    });

    const generateBtn = root.querySelector('[data-testid="mt-generate"]');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        const ex = getExample();
        const rel = getRelation();
        state.results = generateMrTests(ex, rel, 8);
        const resultsEl = root.querySelector('[data-testid="mt-results"]');
        if (resultsEl) resultsEl.innerHTML = renderResults(state.results);
      });
    }
  }

  render();
  return root;
}
