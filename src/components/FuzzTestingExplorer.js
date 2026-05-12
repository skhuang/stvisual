import { t, pickField } from '../i18n/index.js';
import { fuzzTest, formatInput, formatOutput } from '../utils/fuzzTesting.js';
import { fuzzTestingExamples } from '../data/testingData.js';
import { generateControlFlowGraphFromProgram } from '../utils/programToGraph.js';
import { mapBranchesToCfg, renderCfgSvg } from '../utils/pathToCfg.js';

const STORAGE_KEY = 'stvisual.fuzz.v1';

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
    globalThis.localStorage?.setItem(
      STORAGE_KEY,
      JSON.stringify({
        sourceCode: state.sourceCode,
        exampleId: state.exampleId,
        testCount: state.testCount,
        cfgZoom: state.cfgZoom,
      })
    );
  } catch {
    // ignore
  }
}

export function createFuzzTestingExplorer() {
  const root = document.createElement('div');
  root.className = 'fuzz-explorer';
  root.dataset.testid = 'fuzz-explorer';

  const saved = loadSaved();
  const defaultExample = fuzzTestingExamples[0];
  const state = {
    exampleId: saved?.exampleId || defaultExample.id,
    sourceCode: saved?.sourceCode || defaultExample.sourceCode,
    testCount: typeof saved?.testCount === 'number' ? saved.testCount : 50,
    cfgZoom: typeof saved?.cfgZoom === 'number' ? saved.cfgZoom : 1,
    result: null,
    cfg: null,
    cfgError: null,
    error: null,
    selectedCaseId: null,
    coveredNodes: [],
    coveredEdges: [],
    totalNodes: 0,
    totalEdges: 0,
  };

  const fuzzQuiz = { active: false, phase: 'question', answer: '', result: null };

  function renderFuzzQuizPanel() {
    if (!fuzzQuiz.active) return '';
    const nodeCov = state.totalNodes > 0
      ? Math.round((state.coveredNodes.length / state.totalNodes) * 100)
      : 0;
    if (fuzzQuiz.phase === 'graded') {
      const userAns = parseInt(fuzzQuiz.answer, 10);
      const ok = userAns === nodeCov;
      return `
        <div class="quiz-panel" data-testid="fuzz-quiz-panel">
          <div class="quiz-header">
            <span>${t('quiz.fuzz.title')}</span>
            <button type="button" class="quiz-close-btn" data-testid="fuzz-quiz-close">✕</button>
          </div>
          <p class="quiz-prompt">${t('quiz.fuzz.prompt')}</p>
          <p class="quiz-score ${ok ? 'quiz-score--perfect' : 'quiz-score--wrong'}">
            ${ok ? t('quiz.graph.perfect') : ''}
            ${t('quiz.fuzz.answer', { pct: nodeCov })}
          </p>
          <button type="button" class="quiz-start-btn" data-testid="fuzz-quiz-reset">${t('quiz.retry')}</button>
        </div>
      `;
    }
    return `
      <div class="quiz-panel" data-testid="fuzz-quiz-panel">
        <div class="quiz-header">
          <span>${t('quiz.fuzz.title')}</span>
          <button type="button" class="quiz-close-btn" data-testid="fuzz-quiz-close">✕</button>
        </div>
        <p class="quiz-prompt">${t('quiz.fuzz.prompt')}</p>
        <div class="quiz-bva-inputs">
          <label class="quiz-bva-field">
            ${t('quiz.fuzz.label')}
            <input type="number" min="0" max="100" class="quiz-input" data-testid="fuzz-quiz-input" value="${escapeHtml(fuzzQuiz.answer)}" />
          </label>
        </div>
        <button type="button" class="quiz-start-btn" data-testid="fuzz-quiz-check">${t('quiz.check')}</button>
      </div>
    `;
  }

  function recompute() {
    state.result = null;
    state.cfg = null;
    state.cfgError = null;
    state.error = null;
    state.coveredNodes = [];
    state.coveredEdges = [];
    state.totalNodes = 0;
    state.totalEdges = 0;
    try {
      state.result = fuzzTest(state.sourceCode, state.testCount);
    } catch (err) {
      state.error = err instanceof Error ? err.message : String(err);
    }
    try {
      state.cfg = generateControlFlowGraphFromProgram({
        sourceCode: state.sourceCode,
        language: 'javascript',
        title: 'Fuzz Testing CFG',
      });
    } catch (err) {
      state.cfgError = err instanceof Error ? err.message : String(err);
    }

    // Compute aggregate coverage across all test cases
    const cfg = state.cfg;
    const result = state.result;
    if (cfg && result) {
      state.totalNodes = cfg.nodes.length;
      state.totalEdges = cfg.edges.length;
      const allNodes = new Set();
      const allEdges = new Set();
      for (const tc of result.testCases) {
        const mapping = mapBranchesToCfg(cfg, tc.branches);
        for (const n of mapping.nodes) allNodes.add(n);
        for (const e of mapping.edges) allEdges.add(e);
      }
      state.coveredNodes = [...allNodes];
      state.coveredEdges = [...allEdges];
    }

    // Reset selection if result changed
    if (result?.testCases?.length) {
      const stillExists = result.testCases.some((tc) => tc.id === state.selectedCaseId);
      if (!stillExists) state.selectedCaseId = null;
    } else {
      state.selectedCaseId = null;
    }
    persist(state);
  }

  function render() {
    recompute();

    const exampleButtons = fuzzTestingExamples
      .map(
        (ex) => `
      <button type="button"
        class="fuzz-example-btn${state.exampleId === ex.id ? ' active' : ''}"
        data-fuzz-example="${ex.id}"
        data-testid="fuzz-example-${ex.id}"
        title="${escapeHtml(pickField(ex, 'description'))}">
        ${escapeHtml(pickField(ex, 'name'))}
      </button>
    `
      )
      .join('');

    const result = state.result;
    const error = state.error;

    const crashCount = result?.crashes || 0;
    const nodeCov = state.totalNodes > 0
      ? Math.round((state.coveredNodes.length / state.totalNodes) * 100)
      : 0;
    const edgeCov = state.totalEdges > 0
      ? Math.round((state.coveredEdges.length / state.totalEdges) * 100)
      : 0;
    const coverageMarkup = result && state.cfg
      ? `<span class="fuzz-divider">·</span>
         <span class="fuzz-coverage-badge" data-testid="fuzz-node-cov" title="Node coverage">N ${nodeCov}%</span>
         <span class="fuzz-coverage-badge" data-testid="fuzz-edge-cov" title="Edge coverage">E ${edgeCov}%</span>`
      : '';
    const summary = result
      ? `${t('fuzz.summary.tests')}<strong data-testid="fuzz-test-count">${result.totalTests}</strong>
         <span class="fuzz-divider">·</span>
         ${t('fuzz.summary.passed')}<strong data-testid="fuzz-passed-count">${result.passedTests}</strong>
         <span class="fuzz-divider">·</span>
         ${t('fuzz.summary.crashes')}<strong data-testid="fuzz-crash-count" class="${crashCount > 0 ? 'highlight-crash' : ''}">${crashCount}</strong>
         ${coverageMarkup}
         ${result.truncated ? `<span class="fuzz-divider">·</span><span class="fuzz-truncated">${t('fuzz.summary.truncated')}</span>` : ''}`
      : '';

    const testCasesMarkup = error
      ? `<div class="fuzz-error" data-testid="fuzz-error">${escapeHtml(error)}</div>`
      : renderTestCases(result);

    root.innerHTML = `
      <nav class="explorer-mobile-nav" aria-label="${t('explorer.mobileNav')}" data-testid="fuzz-mobile-nav">
        <a href="#fuzz-input-panel">${t('explorer.panel.input')}</a>
        <a href="#fuzz-cfg-panel">${t('explorer.panel.cfg')}</a>
        <a href="#fuzz-results-panel">${t('explorer.panel.results')}</a>
      </nav>

      <section class="fuzz-panel fuzz-input-panel" id="fuzz-input-panel">
        <header class="fuzz-panel-header">
          <h3>${t('explorer.panel.input')}</h3>
        </header>
        <div class="fuzz-toolbar">
          <div class="fuzz-examples" data-testid="fuzz-examples">${exampleButtons}</div>
          <div class="fuzz-controls">
            <label class="fuzz-control">
              <span>${t('fuzz.testCount')}</span>
              <input type="number" min="10" max="500" step="10"
                value="${state.testCount}"
                data-testid="fuzz-test-count-input" />
            </label>
            <button type="button"
              class="fuzz-run-btn"
              data-testid="fuzz-run-btn"
              data-fuzz-run="true">
              ${t('fuzz.run')}
            </button>
          </div>
        </div>
        <div class="fuzz-editor-pane">
          <label class="fuzz-source-label" for="fuzz-source">${t('fuzz.source')}</label>
          <textarea id="fuzz-source"
            class="fuzz-source"
            data-testid="fuzz-source"
            spellcheck="false"
            autocomplete="off"
            rows="14">${escapeHtml(state.sourceCode)}</textarea>
        </div>
      </section>

      <div class="fuzz-split-body">
        <section class="fuzz-panel fuzz-cfg-pane" id="fuzz-cfg-panel">
          <header class="fuzz-panel-header">
            <h3>${t('explorer.panel.cfg')}</h3>
          </header>
          ${renderCfgPane()}
        </section>

        <section class="fuzz-panel fuzz-results-pane" id="fuzz-results-panel">
          <header class="fuzz-panel-header">
            <h3>${t('explorer.panel.results')}</h3>
          </header>
          <p class="fuzz-summary" data-testid="fuzz-summary">
            ${summary}
            ${!fuzzQuiz.active && state.result ? `<button type="button" class="quiz-start-btn" data-testid="fuzz-quiz-start" style="margin-left:0.5rem">${t('quiz.start')}</button>` : ''}
          </p>
          ${renderFuzzQuizPanel()}
          ${testCasesMarkup}
        </section>
      </div>

      <p class="fuzz-hint">${t('fuzz.hint')}</p>
    `;

    bindEvents();
  }

  function renderCfgPane() {
    if (state.cfgError) {
      return `<div class="fuzz-cfg" data-testid="fuzz-cfg">
        <p class="fuzz-cfg-error">${escapeHtml(state.cfgError)}</p>
      </div>`;
    }
    if (!state.cfg) {
      return `<div class="fuzz-cfg" data-testid="fuzz-cfg"></div>`;
    }
    const cfg = state.cfg;

    // Determine highlight: selected test case path OR aggregate coverage
    const result = state.result;
    const selectedCase = state.selectedCaseId
      ? result?.testCases.find((tc) => tc.id === state.selectedCaseId)
      : null;

    let highlight;
    let cfgSubtitle;

    if (selectedCase) {
      const mapping = mapBranchesToCfg(cfg, selectedCase.branches);
      highlight = { nodes: mapping.nodes, edges: mapping.edges };
      cfgSubtitle = `<span class="fuzz-cfg-selected" data-testid="fuzz-cfg-selected">${escapeHtml(selectedCase.id)}</span>`;
    } else {
      highlight = {
        nodes: state.coveredNodes,
        edges: state.coveredEdges,
      };
      const nodeCov = cfg.nodes.length > 0
        ? Math.round((state.coveredNodes.length / cfg.nodes.length) * 100)
        : 0;
      const edgeCov = cfg.edges.length > 0
        ? Math.round((state.coveredEdges.length / cfg.edges.length) * 100)
        : 0;
      cfgSubtitle = result
        ? `<span class="fuzz-cfg-metric">N ${nodeCov}%  E ${edgeCov}%</span>`
        : '';
    }

    const svg = renderCfgSvg(cfg, highlight, {
      idPrefix: 'fuzz-cfg',
      ariaLabel: 'Fuzz testing CFG',
      zoom: state.cfgZoom,
    });
    const zoomPct = Math.round(state.cfgZoom * 100);
    return `
      <div class="fuzz-cfg" data-testid="fuzz-cfg">
        <div class="fuzz-cfg-header">
          <h3>${t('fuzz.cfg.coverage')}</h3>
          ${cfgSubtitle}
          <div class="fuzz-cfg-zoom" role="group" aria-label="${t('fuzz.cfg.zoom')}">
            <button type="button" data-fuzz-zoom="out" data-testid="fuzz-cfg-zoom-out" title="${t('fuzz.cfg.zoomOut')}">−</button>
            <button type="button" data-fuzz-zoom="reset" data-testid="fuzz-cfg-zoom-reset" title="${t('fuzz.cfg.zoomReset')}">${zoomPct}%</button>
            <button type="button" data-fuzz-zoom="in" data-testid="fuzz-cfg-zoom-in" title="${t('fuzz.cfg.zoomIn')}">+</button>
          </div>
        </div>
        <div class="fuzz-cfg-canvas graph-canvas">${svg}</div>
      </div>
    `;
  }

  function renderTestCases(result) {
    if (!result || !result.testCases.length) {
      return `<p class="fuzz-empty">${t('fuzz.empty')}</p>`;
    }
    const items = result.testCases
      .slice(0, 50)
      .map((tc) => {
        const statusClass = tc.crashed ? 'crash' : 'pass';
        const isSelected = state.selectedCaseId === tc.id;
        const statusLabel = tc.crashed ? t('fuzz.crash') : t('fuzz.pass');
        const mutBadge = tc.mutated
          ? `<span class="fuzz-case-mut" title="${t('fuzz.mutated.title')}">${t('fuzz.mutated')}</span>`
          : '';
        return `
        <li class="fuzz-case ${statusClass}${isSelected ? ' selected' : ''}"
          data-testid="fuzz-case-${tc.id}"
          data-fuzz-case="${tc.id}"
          tabindex="0"
          role="button">
          <header class="fuzz-case-header">
            <span class="fuzz-case-id">${escapeHtml(tc.id)}</span>
            <span class="fuzz-case-status">${statusLabel}</span>
            ${mutBadge}
            <span class="fuzz-case-duration">${tc.duration.toFixed(2)}ms</span>
          </header>
          <div class="fuzz-case-input">
            <strong>${t('fuzz.input')}:</strong> <code>${escapeHtml(formatInput(tc.input))}</code>
          </div>
          ${
            tc.crashed
              ? `<div class="fuzz-case-error">
                  <strong>${t('fuzz.error')}:</strong> <code>${escapeHtml(tc.error || '')}</code>
                </div>`
              : `<div class="fuzz-case-output">
                  <strong>${t('fuzz.output')}:</strong> <code>${escapeHtml(formatOutput(tc.output))}</code>
                </div>`
          }
        </li>
      `;
      })
      .join('');

    return `<ol class="fuzz-cases" data-testid="fuzz-cases">${items}</ol>`;
  }

  function bindEvents() {
    root.querySelectorAll('[data-fuzz-example]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.fuzzExample;
        const ex = fuzzTestingExamples.find((x) => x.id === id);
        if (!ex) return;
        state.exampleId = ex.id;
        state.sourceCode = ex.sourceCode;
        state.selectedCaseId = null;
        fuzzQuiz.active = false;
        render();
      });
    });

    // Clickable test cases → select and highlight path on CFG
    root.querySelectorAll('[data-fuzz-case]').forEach((el) => {
      const selectCase = () => {
        const id = el.dataset.fuzzCase;
        state.selectedCaseId = state.selectedCaseId === id ? null : id; // toggle
        renderLight();
      };
      el.addEventListener('click', selectCase);
      el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectCase();
        }
      });
    });

    const editor = root.querySelector('[data-testid="fuzz-source"]');
    if (editor) {
      let timer = null;
      editor.addEventListener('input', () => {
        state.sourceCode = editor.value;
        if (timer) {
          globalThis.clearTimeout(timer);
        }
        timer = globalThis.setTimeout(() => {
          renderPreservingFocus('fuzz-source');
        }, 220);
      });
    }

    const countInput = root.querySelector('[data-testid="fuzz-test-count-input"]');
    if (countInput) {
      countInput.addEventListener('change', () => {
        const n = Number(countInput.value);
        if (Number.isFinite(n) && n >= 10 && n <= 500) {
          state.testCount = n;
          render();
        }
      });
    }

    const runBtn = root.querySelector('[data-testid="fuzz-run-btn"]');
    if (runBtn) {
      runBtn.addEventListener('click', () => {
        render();
      });
    }

    root.querySelectorAll('[data-fuzz-zoom]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.fuzzZoom;
        const zoom = state.cfgZoom;
        if (action === 'in') state.cfgZoom = Math.min(4, +(zoom + 0.25).toFixed(2));
        else if (action === 'out') state.cfgZoom = Math.max(0.25, +(zoom - 0.25).toFixed(2));
        else state.cfgZoom = 1;
        render();
      });
    });

    const fqStart = root.querySelector('[data-testid="fuzz-quiz-start"]');
    if (fqStart) {
      fqStart.addEventListener('click', () => {
        fuzzQuiz.active = true;
        fuzzQuiz.phase = 'question';
        fuzzQuiz.answer = '';
        render();
      });
    }
    const fqClose = root.querySelector('[data-testid="fuzz-quiz-close"]');
    if (fqClose) { fqClose.addEventListener('click', () => { fuzzQuiz.active = false; render(); }); }
    const fqCheck = root.querySelector('[data-testid="fuzz-quiz-check"]');
    if (fqCheck) {
      fqCheck.addEventListener('click', () => {
        const inp = root.querySelector('[data-testid="fuzz-quiz-input"]');
        fuzzQuiz.answer = inp ? inp.value : '';
        fuzzQuiz.phase = 'graded';
        render();
      });
    }
    const fqReset = root.querySelector('[data-testid="fuzz-quiz-reset"]');
    if (fqReset) {
      fqReset.addEventListener('click', () => {
        fuzzQuiz.phase = 'question';
        fuzzQuiz.answer = '';
        render();
      });
    }
  }

  function renderPreservingFocus(testid) {
    const previously = root.querySelector(`[data-testid="${testid}"]`);
    const start = previously?.selectionStart;
    const end = previously?.selectionEnd;
    render();
    const next = root.querySelector(`[data-testid="${testid}"]`);
    if (next) {
      next.focus();
      if (typeof start === 'number' && typeof end === 'number') {
        next.setSelectionRange(start, end);
      }
    }
  }

  /** Light re-render: updates CFG highlight and test case selection without recomputing fuzz results. */
  function renderLight() {
    // Update CFG pane
    const cfgPaneEl = root.querySelector('.fuzz-cfg-pane');
    if (cfgPaneEl) {
      cfgPaneEl.innerHTML = renderCfgPane();
    }

    // Update selected class on test case items
    root.querySelectorAll('[data-fuzz-case]').forEach((el) => {
      const id = el.dataset.fuzzCase;
      if (id === state.selectedCaseId) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });

    // Re-bind zoom events (CFG was replaced)
    root.querySelectorAll('[data-fuzz-zoom]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.fuzzZoom;
        const zoom = state.cfgZoom;
        if (action === 'in') state.cfgZoom = Math.min(4, +(zoom + 0.25).toFixed(2));
        else if (action === 'out') state.cfgZoom = Math.max(0.25, +(zoom - 0.25).toFixed(2));
        else state.cfgZoom = 1;
        renderLight();
      });
    });
  }

  render();
  return root;
}
