import { t, getLocale, pickField } from '../i18n/index.js';
import { symbolicExecute } from '../utils/symbolicExecution.js';
import { symbolicExecutionExamples } from '../data/testingData.js';
import { generateControlFlowGraphFromProgram } from '../utils/programToGraph.js';
import { mapBranchesToCfg, renderCfgSvg } from '../utils/pathToCfg.js';

const STORAGE_KEY = 'stvisual.symbex.v1';

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
      sourceCode: state.sourceCode,
      exampleId: state.exampleId,
      maxLoopUnroll: state.maxLoopUnroll,
    }));
  } catch {
    // ignore
  }
}

export function createSymbolicExecutionExplorer() {
  const root = document.createElement('div');
  root.className = 'symbex-explorer';
  root.dataset.testid = 'symbex-explorer';

  const saved = loadSaved();
  const defaultExample = symbolicExecutionExamples[0];
  const state = {
    exampleId: saved?.exampleId || defaultExample.id,
    sourceCode: saved?.sourceCode || defaultExample.sourceCode,
    maxLoopUnroll: typeof saved?.maxLoopUnroll === 'number' ? saved.maxLoopUnroll : 3,
    result: null,
    cfg: null,
    cfgError: null,
    selectedPathId: null,
    error: null,
  };

  function recompute() {
    state.result = null;
    state.error = null;
    state.cfg = null;
    state.cfgError = null;
    try {
      state.result = symbolicExecute(state.sourceCode, { maxLoopUnroll: state.maxLoopUnroll });
    } catch (err) {
      state.error = err.message || String(err);
    }
    try {
      state.cfg = generateControlFlowGraphFromProgram({
        sourceCode: state.sourceCode,
        language: 'javascript',
        title: 'Symbolic Execution CFG',
      });
    } catch (err) {
      state.cfgError = err.message || String(err);
    }
    if (state.result?.paths?.length) {
      const stillExists = state.result.paths.some((p) => p.id === state.selectedPathId);
      if (!stillExists) {
        const firstFeasible = state.result.paths.find((p) => p.feasible) || state.result.paths[0];
        state.selectedPathId = firstFeasible.id;
      }
    } else {
      state.selectedPathId = null;
    }
    persist(state);
  }

  function render() {
    recompute();

    const exampleButtons = symbolicExecutionExamples.map((ex) => `
      <button type="button"
        class="symbex-example-btn${state.exampleId === ex.id ? ' active' : ''}"
        data-symbex-example="${ex.id}"
        data-testid="symbex-example-${ex.id}"
        title="${escapeHtml(pickField(ex, 'description') || '')}">
        ${escapeHtml(pickField(ex, 'name') || ex.name)}
      </button>
    `).join('');

    const pathsMarkup = state.error
      ? `<div class="symbex-error" data-testid="symbex-error">${escapeHtml(state.error)}</div>`
      : renderPaths(state.result);

    const summary = state.result
      ? `${t('symbex.summary.paths')}<strong data-testid="symbex-path-count">${state.result.paths.length}</strong>
         <span class="symbex-divider">·</span>
         ${t('symbex.summary.feasible')}<strong data-testid="symbex-feasible-count">${
           state.result.paths.filter((p) => p.feasible).length
         }</strong>
         ${state.result.truncated
           ? `<span class="symbex-divider">·</span><span class="symbex-truncated">${t('symbex.summary.truncated')}</span>`
           : ''}`
      : '';

    root.innerHTML = `
      <div class="symbex-toolbar">
        <div class="symbex-examples" data-testid="symbex-examples">${exampleButtons}</div>
        <div class="symbex-controls">
          <label class="symbex-control">
            <span>${t('symbex.maxUnroll')}</span>
            <input type="number" min="0" max="6" step="1"
              value="${state.maxLoopUnroll}"
              data-testid="symbex-max-unroll" />
          </label>
        </div>
      </div>

      <div class="symbex-body">
        <div class="symbex-editor-pane">
          <label class="symbex-editor-label" for="symbex-source">${t('symbex.source')}</label>
          <textarea id="symbex-source"
            class="symbex-editor"
            data-testid="symbex-source"
            spellcheck="false"
            autocomplete="off"
            rows="14">${escapeHtml(state.sourceCode)}</textarea>
        </div>

        <div class="symbex-results-pane">
          <p class="symbex-summary" data-testid="symbex-summary">${summary}</p>
          ${pathsMarkup}
        </div>
      </div>

      ${renderCfgPane()}

      <p class="symbex-hint">${t('symbex.hint')}</p>
    `;

    bindEvents();
  }

  function renderCfgPane() {
    if (state.cfgError) {
      return `<div class="symbex-cfg" data-testid="symbex-cfg">
        <p class="symbex-cfg-error">${escapeHtml(state.cfgError)}</p>
      </div>`;
    }
    if (!state.cfg) return '';
    const selected = state.result?.paths?.find((p) => p.id === state.selectedPathId);
    const mapping = selected ? mapBranchesToCfg(state.cfg, selected.branches) : { nodes: [], edges: [] };
    const svg = renderCfgSvg(state.cfg, mapping, {
      idPrefix: 'symbex-cfg',
      ariaLabel: 'Symbolic execution CFG',
    });
    return `
      <div class="symbex-cfg" data-testid="symbex-cfg">
        <div class="symbex-cfg-header">
          <h3>${t('symbex.cfg.title')}</h3>
          <span class="symbex-cfg-selected" data-testid="symbex-cfg-selected">${
            selected ? escapeHtml(selected.id) : t('symbex.cfg.none')
          }</span>
        </div>
        <div class="symbex-cfg-canvas graph-canvas">${svg}</div>
      </div>
    `;
  }

  function renderPaths(result) {
    if (!result || !result.paths.length) {
      return `<p class="symbex-empty">${t('symbex.empty')}</p>`;
    }
    const items = result.paths.map((p) => {
      const pcMarkup = p.pathCondition.length
        ? `<ol class="symbex-pc">${p.pathCondition.map((c) => `<li><code>${escapeHtml(c)}</code></li>`).join('')}</ol>`
        : `<p class="symbex-pc-empty">${t('symbex.pc.empty')}</p>`;
      const witness = p.feasible
        ? `<dl class="symbex-witness">
             <dt>${t('symbex.witness')}</dt>
             <dd><code>${escapeHtml(formatAssignment(p.witness))}</code></dd>
             <dt>${t('symbex.return')}</dt>
             <dd><code>${escapeHtml(formatReturn(p.returnExpression, p.concreteReturn))}</code></dd>
           </dl>`
        : `<p class="symbex-infeasible">${t('symbex.infeasible')}</p>`;
      return `
        <li class="symbex-path${p.feasible ? '' : ' infeasible'}${state.selectedPathId === p.id ? ' selected' : ''}"
          data-testid="symbex-${p.id}"
          data-symbex-path="${p.id}"
          tabindex="0"
          role="button">
          <header class="symbex-path-header">
            <span class="symbex-path-id">${escapeHtml(p.id)}</span>
            <span class="symbex-path-status">${
              p.feasible ? t('symbex.feasible') : t('symbex.infeasible.short')
            }</span>
          </header>
          ${pcMarkup}
          ${witness}
        </li>
      `;
    }).join('');
    return `<ol class="symbex-paths" data-testid="symbex-paths">${items}</ol>`;
  }

  function formatAssignment(env) {
    if (!env) return '';
    return Object.entries(env).map(([k, v]) => `${k}=${v}`).join(', ');
  }

  function formatReturn(expr, concrete) {
    if (expr == null) return '∅';
    if (concrete === null || concrete === undefined) return expr;
    return `${expr}  →  ${concrete}`;
  }

  function bindEvents() {
    root.querySelectorAll('[data-symbex-example]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.symbexExample;
        const ex = symbolicExecutionExamples.find((x) => x.id === id);
        if (!ex) return;
        state.exampleId = ex.id;
        state.sourceCode = ex.sourceCode;
        state.selectedPathId = null;
        render();
      });
    });

    root.querySelectorAll('[data-symbex-path]').forEach((el) => {
      const select = () => {
        state.selectedPathId = el.dataset.symbexPath;
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

    const editor = root.querySelector('[data-testid="symbex-source"]');
    if (editor) {
      let timer = null;
      editor.addEventListener('input', () => {
        state.sourceCode = editor.value;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          renderPreservingFocus('symbex-source');
        }, 220);
      });
    }

    const unroll = root.querySelector('[data-testid="symbex-max-unroll"]');
    if (unroll) {
      unroll.addEventListener('change', () => {
        const n = Number(unroll.value);
        if (Number.isFinite(n) && n >= 0 && n <= 12) {
          state.maxLoopUnroll = n;
          render();
        }
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
      if (typeof start === 'number' && typeof end === 'number' && next.setSelectionRange) {
        next.setSelectionRange(start, end);
      }
    }
  }

  render();
  return root;
}
