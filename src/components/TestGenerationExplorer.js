import { t, pickField } from '../i18n/index.js';
import {
  generateTestsFromCoverage,
  formatConcreteCall,
  formatWitnessValue,
  formatExpectedReturn,
} from '../utils/testGeneration.js';
import { symbolicExecutionExamples } from '../data/testingData.js';
import { mapBranchesToCfg, renderCfgSvg } from '../utils/pathToCfg.js';

const STORAGE_KEY = 'stvisual.testgen.v1';
const DEFAULT_CRITERION = 'edge';

// Reuse the existing #3/#4 criteria; #5 Logic Coverage is in 12.2.
const CRITERIA = [
  { id: 'node',          group: 'structural', labelKey: 'graph.coverage.node' },
  { id: 'edge',          group: 'structural', labelKey: 'graph.coverage.edge' },
  { id: 'edge-pair',     group: 'structural', labelKey: 'graph.coverage.edge-pair' },
  { id: 'prime-path',    group: 'structural', labelKey: 'graph.coverage.prime-path' },
  { id: 'complete-path', group: 'structural', labelKey: 'graph.coverage.complete-path' },
  { id: 'all-defs',      group: 'dataflow',   labelKey: 'graph.coverage.all-defs' },
  { id: 'all-uses',      group: 'dataflow',   labelKey: 'graph.coverage.all-uses' },
  { id: 'all-du-paths',  group: 'dataflow',   labelKey: 'graph.coverage.all-du-paths' },
];

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function loadSaved() {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function persist(state) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify({
      exampleId: state.exampleId,
      sourceCode: state.sourceCode,
      criterion: state.criterion,
      cfgZoom: state.cfgZoom,
    }));
  } catch {
    // ignore
  }
}

export function createTestGenerationExplorer() {
  const root = document.createElement('div');
  root.className = 'testgen-explorer';
  root.dataset.testid = 'testgen-explorer';

  const saved = loadSaved();
  const defaultExample = symbolicExecutionExamples[0];
  const state = {
    exampleId: saved?.exampleId || defaultExample.id,
    sourceCode: saved?.sourceCode || defaultExample.sourceCode,
    criterion: saved?.criterion || DEFAULT_CRITERION,
    cfgZoom: typeof saved?.cfgZoom === 'number' ? saved.cfgZoom : 1,
    result: null,
    selectedRequirementId: null,
    selectedTestPathId: null,
  };

  function recompute() {
    state.result = generateTestsFromCoverage({
      sourceCode: state.sourceCode,
      criterion: state.criterion,
    });
    // Reset selections if they no longer exist.
    if (state.result?.requirements?.length) {
      const exists = state.result.requirements.some((r) => r.id === state.selectedRequirementId);
      if (!exists) state.selectedRequirementId = state.result.requirements[0].id;
    } else {
      state.selectedRequirementId = null;
    }
    if (state.result?.selectedTests?.length) {
      const exists = state.result.selectedTests.some((t) => t.pathId === state.selectedTestPathId);
      if (!exists) state.selectedTestPathId = state.result.selectedTests[0].pathId;
    } else {
      state.selectedTestPathId = null;
    }
    persist(state);
  }

  function render() {
    recompute();

    const exampleButtons = symbolicExecutionExamples.map((ex) => `
      <button type="button"
        class="testgen-example-btn${state.exampleId === ex.id ? ' active' : ''}"
        data-testgen-example="${ex.id}"
        data-testid="testgen-example-${ex.id}"
        title="${escapeHtml(pickField(ex, 'description') || '')}">
        ${escapeHtml(pickField(ex, 'name') || ex.name)}
      </button>
    `).join('');

    const criterionOptions = CRITERIA.map((c) => `
      <option value="${c.id}"${state.criterion === c.id ? ' selected' : ''}>
        ${escapeHtml(t(c.labelKey))}
      </option>
    `).join('');

    root.innerHTML = `
      <nav class="explorer-mobile-nav" aria-label="${t('explorer.mobileNav')}" data-testid="testgen-mobile-nav">
        <a href="#testgen-input-panel">${t('explorer.panel.input')}</a>
        <a href="#testgen-cfg-panel">${t('explorer.panel.cfg')}</a>
        <a href="#testgen-results-panel">${t('explorer.panel.results')}</a>
      </nav>

      <section class="testgen-panel testgen-input-panel" id="testgen-input-panel">
        <header class="testgen-panel-header">
          <h3>${t('explorer.panel.input')}</h3>
        </header>
        <div class="testgen-toolbar">
          <div class="testgen-examples" data-testid="testgen-examples">${exampleButtons}</div>
          <div class="testgen-controls">
            <label class="testgen-control">
              <span>${t('testgen.criterion')}</span>
              <select data-testid="testgen-criterion">${criterionOptions}</select>
            </label>
          </div>
        </div>
        <div class="testgen-editor-pane">
          <label class="testgen-editor-label" for="testgen-source">${t('testgen.source')}</label>
          <textarea id="testgen-source"
            class="testgen-editor"
            data-testid="testgen-source"
            spellcheck="false"
            autocomplete="off"
            rows="14">${escapeHtml(state.sourceCode)}</textarea>
        </div>
      </section>

      <div class="testgen-split-body">
        <section class="testgen-panel testgen-cfg-pane" id="testgen-cfg-panel">
          <header class="testgen-panel-header">
            <h3>${t('explorer.panel.cfg')}</h3>
          </header>
          ${renderCfgPane()}
        </section>
        <section class="testgen-panel testgen-results-pane" id="testgen-results-panel">
          <header class="testgen-panel-header">
            <h3>${t('explorer.panel.results')}</h3>
          </header>
          ${renderSummary()}
          ${renderError()}
          <div class="testgen-results-grid">
            <div class="testgen-requirements-card" data-testid="testgen-requirements-card">
              <h3>${t('testgen.requirements.title')}</h3>
              ${renderRequirements()}
            </div>
            <div class="testgen-tests-card" data-testid="testgen-tests-card">
              <h3>${t('testgen.tests.title')}</h3>
              ${renderSelectedTests()}
            </div>
          </div>
        </section>
      </div>

      <p class="testgen-hint">${t('testgen.hint')}</p>
    `;

    bindEvents();
  }

  function renderSummary() {
    const r = state.result;
    if (!r || r.error) return '';
    return `
      <p class="testgen-summary" data-testid="testgen-summary">
        ${t('testgen.summary.requirements')}<strong data-testid="testgen-req-count">${r.totalRequirements}</strong>
        <span class="testgen-divider">·</span>
        ${t('testgen.summary.feasible')}<strong data-testid="testgen-feasible-count">${r.feasibleRequirements}</strong>
        <span class="testgen-divider">·</span>
        ${t('testgen.summary.selected')}<strong data-testid="testgen-selected-count">${r.selectedCount}</strong>
        ${r.symbexTruncated
          ? `<span class="testgen-divider">·</span><span class="testgen-truncated">${t('testgen.summary.truncated')}</span>`
          : ''}
      </p>
    `;
  }

  function renderError() {
    const r = state.result;
    if (!r?.error) return '';
    return `<div class="testgen-error" data-testid="testgen-error">${escapeHtml(r.error)}</div>`;
  }

  function renderRequirements() {
    const r = state.result;
    if (!r || r.error) return '';
    if (!r.requirementCoverage.length) {
      return `<p class="testgen-empty">${t('testgen.empty')}</p>`;
    }
    const items = r.requirementCoverage.map((rc) => {
      const cls = rc.feasible ? 'feasible' : 'infeasible';
      const active = state.selectedRequirementId === rc.requirementId ? ' selected' : '';
      const witness = rc.feasible && rc.representativeWitness
        ? formatConcreteCall(r.function.name, r.function.params, rc.representativeWitness)
        : `<span class="testgen-no-witness">${t('testgen.requirements.noWitness')}</span>`;
      return `
        <li class="testgen-req ${cls}${active}"
          data-testid="testgen-req-${escapeHtml(rc.requirementId)}"
          data-testgen-req="${escapeHtml(rc.requirementId)}"
          tabindex="0"
          role="button">
          <header class="testgen-req-header">
            <span class="testgen-req-id">${escapeHtml(rc.requirement.id)}</span>
            <span class="testgen-req-status">${
              rc.feasible ? t('testgen.requirements.feasible') : t('testgen.requirements.infeasible')
            }</span>
          </header>
          <p class="testgen-req-label">${escapeHtml(rc.requirement.label || rc.requirement.displayText || '')}</p>
          <p class="testgen-req-witness">${typeof witness === 'string' ? escapeHtml(witness) : witness}</p>
        </li>
      `;
    }).join('');
    return `<ol class="testgen-req-list" data-testid="testgen-req-list">${items}</ol>`;
  }

  function buildVitestFile() {
    const r = state.result;
    if (!r || r.error || !r.selectedTests.length) return null;
    const fn = r.function?.name || 'fn';
    const params = r.function?.params || [];
    const cases = r.selectedTests.map((tc, i) => {
      const args = params.map((p) => {
        const v = tc.witness?.[p];
        return v === undefined ? 'undefined' : JSON.stringify(v);
      }).join(', ');
      const ret = tc.concreteReturn === undefined ? 'undefined' : JSON.stringify(tc.concreteReturn);
      const covers = tc.coveredRequirementIds.join(', ');
      return `  it('T${i + 1}: ${fn}(${args}) → ${ret}  // covers: ${covers}', () => {\n    expect(${fn}(${args})).toBe(${ret});\n  });`;
    }).join('\n\n');
    return `import { describe, it, expect } from 'vitest';\nimport { ${fn} } from './${fn}.js';\n\n// Generated by stvisual TestGenerationExplorer\n// criterion: ${state.criterion}\ndescribe('${fn} – generated tests', () => {\n${cases}\n});\n`;
  }

  function renderSelectedTests() {
    const r = state.result;
    if (!r || r.error) return '';
    if (!r.selectedTests.length) {
      return `<p class="testgen-empty">${t('testgen.tests.empty')}</p>`;
    }
    const downloadBtn = `<button type="button" class="testgen-download-btn" data-testid="testgen-download-btn"
        title="${t('testgen.tests.downloadTitle')}">⬇ ${t('testgen.tests.download')}</button>`;
    const items = r.selectedTests.map((tc, i) => {
      const call = formatConcreteCall(r.function.name, r.function.params, tc.witness);
      const ret = formatExpectedReturn(tc.concreteReturn);
      const active = state.selectedTestPathId === tc.pathId ? ' selected' : '';
      const covers = tc.coveredRequirementIds.join(', ');
      return `
        <li class="testgen-test${active}"
          data-testid="testgen-test-${i + 1}"
          data-testgen-test="${escapeHtml(tc.pathId)}"
          tabindex="0"
          role="button">
          <header class="testgen-test-header">
            <span class="testgen-test-id">T${i + 1}</span>
            <span class="testgen-test-path">${escapeHtml(tc.pathId)}</span>
          </header>
          <p class="testgen-test-call"><code>${escapeHtml(call)}</code> → <code>${escapeHtml(ret)}</code></p>
          <p class="testgen-test-covers"><span>${t('testgen.tests.covers')}</span> ${escapeHtml(covers)}</p>
        </li>
      `;
    }).join('');
    return `${downloadBtn}<ol class="testgen-test-list" data-testid="testgen-test-list">${items}</ol>`;
  }

  function renderCfgPane() {
    const r = state.result;
    if (!r) return '';
    if (r.error && !r.cfg) {
      return `<div class="testgen-cfg" data-testid="testgen-cfg">
        <p class="testgen-cfg-error">${escapeHtml(r.error)}</p>
      </div>`;
    }
    if (!r.cfg) return '';
    // Determine highlight from current selection:
    // - if a selectedTest is active, highlight its full CFG walk.
    // - else if a selectedRequirement is active, highlight just its nodes/edges.
    let mapping = { nodes: [], edges: [] };
    let selectedLabel = t('testgen.cfg.none');
    const selectedTest = r.selectedTests.find((tc) => tc.pathId === state.selectedTestPathId);
    if (selectedTest) {
      const wp = r.witnessedPaths.find((w) => w.id === selectedTest.pathId);
      if (wp) mapping = { nodes: wp.cfgNodes, edges: wp.cfgEdges };
      selectedLabel = `T${r.selectedTests.indexOf(selectedTest) + 1} (${selectedTest.pathId})`;
    } else if (state.selectedRequirementId) {
      const req = r.requirements.find((q) => q.id === state.selectedRequirementId);
      if (req) {
        mapping = {
          nodes: req.nodes || (req.path ? [...new Set(req.path)] : []),
          edges: req.edges || [],
        };
        selectedLabel = req.id;
      }
    }
    const svg = renderCfgSvg(r.cfg, mapping, {
      idPrefix: 'testgen-cfg',
      ariaLabel: 'Test generation CFG',
      zoom: state.cfgZoom,
    });
    const zoomPct = Math.round(state.cfgZoom * 100);
    return `
      <div class="testgen-cfg" data-testid="testgen-cfg">
        <div class="testgen-cfg-header">
          <h3>${t('testgen.cfg.title')}</h3>
          <span class="testgen-cfg-selected" data-testid="testgen-cfg-selected">${escapeHtml(selectedLabel)}</span>
          <div class="testgen-cfg-zoom" role="group" aria-label="${t('testgen.cfg.zoom')}">
            <button type="button" data-testgen-zoom="out" data-testid="testgen-cfg-zoom-out" title="${t('testgen.cfg.zoomOut')}">−</button>
            <button type="button" data-testgen-zoom="reset" data-testid="testgen-cfg-zoom-reset" title="${t('testgen.cfg.zoomReset')}">${zoomPct}%</button>
            <button type="button" data-testgen-zoom="in" data-testid="testgen-cfg-zoom-in" title="${t('testgen.cfg.zoomIn')}">+</button>
          </div>
        </div>
        <div class="testgen-cfg-canvas graph-canvas">${svg}</div>
      </div>
    `;
  }

  function bindEvents() {
    root.querySelectorAll('[data-testgen-example]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.testgenExample;
        const ex = symbolicExecutionExamples.find((x) => x.id === id);
        if (!ex) return;
        state.exampleId = ex.id;
        state.sourceCode = ex.sourceCode;
        state.selectedRequirementId = null;
        state.selectedTestPathId = null;
        render();
      });
    });

    const criterionSelect = root.querySelector('[data-testid="testgen-criterion"]');
    if (criterionSelect) {
      criterionSelect.addEventListener('change', () => {
        state.criterion = criterionSelect.value;
        state.selectedRequirementId = null;
        state.selectedTestPathId = null;
        render();
      });
    }

    root.querySelectorAll('[data-testgen-req]').forEach((el) => {
      const select = () => {
        state.selectedRequirementId = el.dataset.testgenReq;
        state.selectedTestPathId = null;
        render();
      };
      el.addEventListener('click', select);
      el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          select();
        }
      });
    });

    root.querySelectorAll('[data-testgen-test]').forEach((el) => {
      const select = () => {
        state.selectedTestPathId = el.dataset.testgenTest;
        render();
      };
      el.addEventListener('click', select);
      el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          select();
        }
      });
    });

    const editor = root.querySelector('[data-testid="testgen-source"]');
    if (editor) {
      let timer = null;
      editor.addEventListener('input', () => {
        state.sourceCode = editor.value;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          renderPreservingFocus('testgen-source');
        }, 280);
      });
    }

    const downloadBtn = root.querySelector('[data-testid="testgen-download-btn"]');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const content = buildVitestFile();
        if (!content) return;
        const fn = state.result?.function?.name || 'generated';
        const blob = new Blob([content], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fn}.test.js`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    }

    root.querySelectorAll('[data-testgen-zoom]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.testgenZoom;
        if (action === 'in') state.cfgZoom = Math.min(4, +(state.cfgZoom + 0.25).toFixed(2));
        else if (action === 'out') state.cfgZoom = Math.max(0.25, +(state.cfgZoom - 0.25).toFixed(2));
        else state.cfgZoom = 1;
        render();
      });
    });
  }

  function renderPreservingFocus(testid) {
    const previously = root.querySelector(`[data-testid="${testid}"]`);
    const start = previously?.selectionStart;
    const end = previously?.selectionEnd;
    render();
    const next = root.querySelector(`[data-testid="${testid}"]`);
    if (next) {
      next.focus();
      if (typeof start === 'number' && typeof end === 'number' && next.setSelectionRange) {
        next.setSelectionRange(start, end);
      }
    }
  }

  render();
  return root;
}

// Re-export helpers for downstream code / future tests.
export { formatWitnessValue };
