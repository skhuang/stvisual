import { t, getLocale, pickField } from '../i18n/index.js';
import { concolicExecute } from '../utils/concolicExecution.js';
import { concolicExecutionExamples } from '../data/testingData.js';

const STORAGE_KEY = 'stvisual.concolic.v1';

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
      seedText: state.seedText,
      maxIterations: state.maxIterations,
    }));
  } catch {
    // ignore
  }
}

function parseSeed(text) {
  // Accepts comma-separated `name=value` pairs, e.g. `a=1, b=2, c=3`.
  const out = {};
  if (!text) return out;
  for (const part of text.split(/[,;\n]/)) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const m = /^([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(-?\d+|true|false)$/.exec(trimmed);
    if (!m) throw new Error(`Cannot parse seed: ${trimmed}`);
    const value = m[2] === 'true' ? true : m[2] === 'false' ? false : Number(m[2]);
    out[m[1]] = value;
  }
  return out;
}

export function createConcolicExecutionExplorer() {
  const root = document.createElement('div');
  root.className = 'concolic-explorer';
  root.dataset.testid = 'concolic-explorer';

  const saved = loadSaved();
  const defaultExample = concolicExecutionExamples[0];
  const state = {
    exampleId: saved?.exampleId || defaultExample.id,
    sourceCode: saved?.sourceCode || defaultExample.sourceCode,
    seedText: saved?.seedText || defaultExample.seed || '',
    maxIterations: typeof saved?.maxIterations === 'number' ? saved.maxIterations : 16,
    result: null,
    error: null,
  };

  function recompute() {
    state.result = null;
    state.error = null;
    try {
      const initialInputs = parseSeed(state.seedText);
      state.result = concolicExecute(state.sourceCode, {
        initialInputs,
        maxIterations: state.maxIterations,
      });
    } catch (err) {
      state.error = err.message || String(err);
    }
    persist(state);
  }

  function render() {
    recompute();

    const exampleButtons = concolicExecutionExamples.map((ex) => `
      <button type="button"
        class="concolic-example-btn${state.exampleId === ex.id ? ' active' : ''}"
        data-concolic-example="${ex.id}"
        data-testid="concolic-example-${ex.id}"
        title="${escapeHtml(pickField(ex, 'description') || '')}">
        ${escapeHtml(pickField(ex, 'name') || ex.name)}
      </button>
    `).join('');

    const body = state.error
      ? `<div class="concolic-error" data-testid="concolic-error">${escapeHtml(state.error)}</div>`
      : renderIterations(state.result);

    const summary = state.result
      ? `${t('concolic.summary.iterations')}<strong data-testid="concolic-iter-count">${state.result.iterations.length}</strong>
         <span class="concolic-divider">·</span>
         ${t('concolic.summary.uniquePaths')}<strong data-testid="concolic-path-count">${state.result.uniquePathCount}</strong>
         <span class="concolic-divider">·</span>
         ${t('concolic.summary.uniqueInputs')}<strong>${state.result.uniqueInputCount}</strong>
         ${state.result.truncated
           ? `<span class="concolic-divider">·</span><span class="concolic-truncated">${t('concolic.summary.truncated')}</span>`
           : ''}`
      : '';

    root.innerHTML = `
      <div class="concolic-toolbar">
        <div class="concolic-examples" data-testid="concolic-examples">${exampleButtons}</div>
        <div class="concolic-controls">
          <label class="concolic-control">
            <span>${t('concolic.seed')}</span>
            <input type="text" value="${escapeHtml(state.seedText)}"
              data-testid="concolic-seed"
              placeholder="a=1, b=1, c=1" />
          </label>
          <label class="concolic-control">
            <span>${t('concolic.maxIterations')}</span>
            <input type="number" min="1" max="64" step="1"
              value="${state.maxIterations}"
              data-testid="concolic-max-iter" />
          </label>
        </div>
      </div>

      <div class="concolic-body">
        <div class="concolic-editor-pane">
          <label class="concolic-editor-label" for="concolic-source">${t('concolic.source')}</label>
          <textarea id="concolic-source"
            class="concolic-editor"
            data-testid="concolic-source"
            spellcheck="false"
            autocomplete="off"
            rows="14">${escapeHtml(state.sourceCode)}</textarea>
        </div>
        <div class="concolic-results-pane">
          <p class="concolic-summary" data-testid="concolic-summary">${summary}</p>
          ${body}
        </div>
      </div>

      <p class="concolic-hint">${t('concolic.hint')}</p>
    `;

    bindEvents();
  }

  function renderIterations(result) {
    if (!result || !result.iterations.length) {
      return `<p class="concolic-empty">${t('concolic.empty')}</p>`;
    }
    const items = result.iterations.map((it) => {
      const inputCode = formatAssignment(it.inputs);
      const branchesMarkup = it.branches.length
        ? `<ol class="concolic-branches">${it.branches.map((b) => {
            const cls = ['concolic-branch'];
            if (b.taken) cls.push('taken'); else cls.push('not-taken');
            if (b.negated) cls.push('negated');
            const arrow = b.taken ? '✓' : '✗';
            const negTag = b.negated
              ? `<span class="concolic-neg-tag">${t('concolic.negated')}</span>`
              : '';
            return `<li class="${cls.join(' ')}">
              <span class="concolic-branch-arrow">${arrow}</span>
              <code>${escapeHtml(b.condition)}</code>
              ${negTag}
            </li>`;
          }).join('')}</ol>`
        : `<p class="concolic-empty-branches">${t('concolic.noBranches')}</p>`;
      const ret = it.runtimeError
        ? `<p class="concolic-runtime-error"><strong>${t('concolic.runtimeError')}</strong> ${escapeHtml(it.runtimeError)}</p>`
        : `<dl class="concolic-meta">
            <dt>${t('concolic.return')}</dt>
            <dd><code>${escapeHtml(formatReturn(it.returnExpression, it.returnValue))}</code></dd>
            ${it.nextInput ? `
              <dt>${t('concolic.nextInput')}</dt>
              <dd><code>${escapeHtml(formatAssignment(it.nextInput))}</code></dd>
            ` : `
              <dt>${t('concolic.nextInput')}</dt>
              <dd><em>${t('concolic.exhausted')}</em></dd>
            `}
          </dl>`;
      return `
        <li class="concolic-iter" data-testid="concolic-${it.id}">
          <header class="concolic-iter-header">
            <span class="concolic-iter-id">${escapeHtml(it.id)}</span>
            <span class="concolic-iter-input"><code>${escapeHtml(inputCode)}</code></span>
            <span class="concolic-iter-pathkey" title="${t('concolic.pathKey')}">
              ${escapeHtml(it.pathKey || 'ε')}
            </span>
          </header>
          ${branchesMarkup}
          ${ret}
        </li>
      `;
    }).join('');
    return `<ol class="concolic-iters" data-testid="concolic-iters">${items}</ol>`;
  }

  function formatAssignment(env) {
    if (!env) return '';
    return Object.entries(env).map(([k, v]) => `${k}=${v}`).join(', ');
  }

  function formatReturn(expr, concrete) {
    if (expr == null && concrete == null) return '∅';
    if (expr == null) return String(concrete);
    if (concrete == null) return expr;
    return `${expr}  →  ${concrete}`;
  }

  function bindEvents() {
    root.querySelectorAll('[data-concolic-example]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.concolicExample;
        const ex = concolicExecutionExamples.find((x) => x.id === id);
        if (!ex) return;
        state.exampleId = ex.id;
        state.sourceCode = ex.sourceCode;
        state.seedText = ex.seed || '';
        render();
      });
    });

    const editor = root.querySelector('[data-testid="concolic-source"]');
    if (editor) {
      let timer = null;
      editor.addEventListener('input', () => {
        state.sourceCode = editor.value;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => renderPreservingFocus('concolic-source'), 220);
      });
    }

    const seed = root.querySelector('[data-testid="concolic-seed"]');
    if (seed) {
      let timer = null;
      seed.addEventListener('input', () => {
        state.seedText = seed.value;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => renderPreservingFocus('concolic-seed'), 220);
      });
    }

    const iter = root.querySelector('[data-testid="concolic-max-iter"]');
    if (iter) {
      iter.addEventListener('change', () => {
        const n = Number(iter.value);
        if (Number.isFinite(n) && n >= 1 && n <= 128) {
          state.maxIterations = n;
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
