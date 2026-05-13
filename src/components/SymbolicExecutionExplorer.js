import { t, getLocale, pickField } from '../i18n/index.js';
import { encodeResult, buildShareUrl } from '../utils/resultExporter.js';
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
      cfgZoom: state.cfgZoom,
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
    cfgZoom: typeof saved?.cfgZoom === 'number' ? saved.cfgZoom : 1,
    result: null,
    cfg: null,
    cfgError: null,
    selectedPathId: null,
    error: null,
  };

  const symbexQuiz = { active: false, phase: 'question', answer: '', result: null };
  const symbexLabReflect = { active: false, a1: '', a2: '' };

  function renderSymbexLabReflectPanel() {
    if (!symbexLabReflect.active) return '';
    return `
      <div class="lab-panel" data-testid="symbex-lab-reflect">
        <div class="lab-panel-header">
          <span class="lab-panel-title">${t('lab.reflect.title')}</span>
          <button type="button" class="quiz-close-btn" data-testid="symbex-lab-reflect-close">✕</button>
        </div>
        <div class="lab-reflect-field">
          <label class="lab-reflect-label">${t('lab.reflect.q.symbex.1')}</label>
          <textarea class="lab-reflect-textarea" data-testid="symbex-lab-reflect-a1" placeholder="${t('lab.reflect.placeholder')}">${escapeHtml(symbexLabReflect.a1)}</textarea>
        </div>
        <div class="lab-reflect-field">
          <label class="lab-reflect-label">${t('lab.reflect.q.symbex.2')}</label>
          <textarea class="lab-reflect-textarea" data-testid="symbex-lab-reflect-a2" placeholder="${t('lab.reflect.placeholder')}">${escapeHtml(symbexLabReflect.a2)}</textarea>
        </div>
        <div class="lab-reflect-actions">
          <button type="button" class="quiz-share-btn" data-testid="symbex-lab-reflect-share">📋 ${t('quiz.share.btn')}</button>
        </div>
      </div>
    `;
  }

  function renderSymbexQuizPanel() {
    if (!symbexQuiz.active) return '';
    if (symbexQuiz.phase === 'graded') {
      const correct = state.result ? state.result.paths.filter((p) => p.feasible).length : 0;
      const userAns = parseInt(symbexQuiz.answer, 10);
      const ok = userAns === correct;
      const shareEncoded = encodeResult({ v: 1, explorer: 'symbex', explorerLabel: t('quiz.symbex.title'), mode: 'quiz', ts: Date.now(), lang: getLocale(), score: ok ? 1 : 0, total: 1, items: [{ q: t('quiz.symbex.prompt'), a: String(symbexQuiz.answer), expected: String(correct), ok }] });
      return `
        <div class="quiz-panel" data-testid="symbex-quiz-panel">
          <div class="quiz-header">
            <span>${t('quiz.symbex.title')}</span>
            <button type="button" class="quiz-close-btn" data-testid="symbex-quiz-close">✕</button>
          </div>
          <p class="quiz-prompt">${t('quiz.symbex.prompt')}</p>
          <p class="quiz-score ${ok ? 'quiz-score--perfect' : 'quiz-score--wrong'}">
            ${ok ? t('quiz.graph.perfect') : ''}
            ${t('quiz.symbex.answer', { count: correct })}
          </p>
          <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="symbex-quiz-share">📋 ${t('quiz.share.btn')}</button>
          <button type="button" class="quiz-start-btn" data-testid="symbex-quiz-reset">${t('quiz.retry')}</button>
        </div>
      `;
    }
    return `
      <div class="quiz-panel" data-testid="symbex-quiz-panel">
        <div class="quiz-header">
          <span>${t('quiz.symbex.title')}</span>
          <button type="button" class="quiz-close-btn" data-testid="symbex-quiz-close">✕</button>
        </div>
        <p class="quiz-prompt">${t('quiz.symbex.prompt')}</p>
        <div class="quiz-bva-inputs">
          <label class="quiz-bva-field">
            ${t('quiz.symbex.label')}
            <input type="number" min="0" class="quiz-input" data-testid="symbex-quiz-input" value="${escapeHtml(symbexQuiz.answer)}" />
          </label>
        </div>
        <button type="button" class="quiz-start-btn" data-testid="symbex-quiz-check">${t('quiz.check')}</button>
      </div>
    `;
  }

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
      <nav class="explorer-mobile-nav" aria-label="${t('explorer.mobileNav')}" data-testid="symbex-mobile-nav">
        <a href="#symbex-input-panel">${t('explorer.panel.input')}</a>
        <a href="#symbex-cfg-panel">${t('explorer.panel.cfg')}</a>
        <a href="#symbex-results-panel">${t('explorer.panel.results')}</a>
      </nav>

      <section class="symbex-panel symbex-input-panel" id="symbex-input-panel">
        <header class="symbex-panel-header">
          <h3>${t('explorer.panel.input')}</h3>
        </header>
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
        <div class="symbex-editor-pane">
          <label class="symbex-editor-label" for="symbex-source">${t('symbex.source')}</label>
          <textarea id="symbex-source"
            class="symbex-editor"
            data-testid="symbex-source"
            spellcheck="false"
            autocomplete="off"
            rows="14">${escapeHtml(state.sourceCode)}</textarea>
        </div>
      </section>

      <div class="symbex-split-body">
        <section class="symbex-panel symbex-cfg-pane" id="symbex-cfg-panel">
          <header class="symbex-panel-header">
            <h3>${t('explorer.panel.cfg')}</h3>
          </header>
          ${renderCfgPane()}
        </section>
        <section class="symbex-panel symbex-results-pane" id="symbex-results-panel">
          <header class="symbex-panel-header">
            <h3>${t('explorer.panel.results')}</h3>
          </header>
          <p class="symbex-summary" data-testid="symbex-summary">
            ${summary}
            ${!symbexQuiz.active ? `<button type="button" class="quiz-start-btn" data-testid="symbex-quiz-start" style="margin-left:0.5rem">${t('quiz.start')}</button>` : ''}
            ${!symbexLabReflect.active ? `<button type="button" class="quiz-start-btn" data-testid="symbex-lab-reflect-start" style="margin-left:0.5rem">${t('lab.reflect.start')}</button>` : ''}
          </p>
          ${renderSymbexQuizPanel()}
          ${renderSymbexLabReflectPanel()}
          ${pathsMarkup}
        </section>
      </div>

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
      zoom: state.cfgZoom,
    });
    const zoomPct = Math.round(state.cfgZoom * 100);
    return `
      <div class="symbex-cfg" data-testid="symbex-cfg">
        <div class="symbex-cfg-header">
          <h3>${t('symbex.cfg.title')}</h3>
          <span class="symbex-cfg-selected" data-testid="symbex-cfg-selected">${
            selected ? escapeHtml(selected.id) : t('symbex.cfg.none')
          }</span>
          <div class="symbex-cfg-zoom" role="group" aria-label="${t('symbex.cfg.zoom')}">
            <button type="button" data-symbex-zoom="out" data-testid="symbex-cfg-zoom-out" title="${t('symbex.cfg.zoomOut')}">−</button>
            <button type="button" data-symbex-zoom="reset" data-testid="symbex-cfg-zoom-reset" title="${t('symbex.cfg.zoomReset')}">${zoomPct}%</button>
            <button type="button" data-symbex-zoom="in" data-testid="symbex-cfg-zoom-in" title="${t('symbex.cfg.zoomIn')}">+</button>
          </div>
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
        symbexQuiz.active = false;
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

    root.querySelectorAll('[data-symbex-zoom]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.symbexZoom;
        if (action === 'in') state.cfgZoom = Math.min(4, +(state.cfgZoom + 0.25).toFixed(2));
        else if (action === 'out') state.cfgZoom = Math.max(0.25, +(state.cfgZoom - 0.25).toFixed(2));
        else state.cfgZoom = 1;
        render();
      });
    });

    const sqStart = root.querySelector('[data-testid="symbex-quiz-start"]');
    if (sqStart) {
      sqStart.addEventListener('click', () => {
        symbexQuiz.active = true;
        symbexQuiz.phase = 'question';
        symbexQuiz.answer = '';
        render();
      });
    }
    const sqClose = root.querySelector('[data-testid="symbex-quiz-close"]');
    if (sqClose) { sqClose.addEventListener('click', () => { symbexQuiz.active = false; render(); }); }
    const sqCheck = root.querySelector('[data-testid="symbex-quiz-check"]');
    if (sqCheck) {
      sqCheck.addEventListener('click', () => {
        const inp = root.querySelector('[data-testid="symbex-quiz-input"]');
        symbexQuiz.answer = inp ? inp.value : '';
        symbexQuiz.phase = 'graded';
        render();
      });
    }
    const sqReset = root.querySelector('[data-testid="symbex-quiz-reset"]');
    if (sqReset) {
      sqReset.addEventListener('click', () => {
        symbexQuiz.phase = 'question';
        symbexQuiz.answer = '';
        render();
      });
    }

    root.querySelector('[data-testid="symbex-lab-reflect-start"]')?.addEventListener('click', () => {
      symbexLabReflect.active = true;
      render();
    });

    root.querySelector('[data-testid="symbex-lab-reflect-close"]')?.addEventListener('click', () => {
      symbexLabReflect.a1 = root.querySelector('[data-testid="symbex-lab-reflect-a1"]')?.value || symbexLabReflect.a1;
      symbexLabReflect.a2 = root.querySelector('[data-testid="symbex-lab-reflect-a2"]')?.value || symbexLabReflect.a2;
      symbexLabReflect.active = false;
      render();
    });

    root.querySelector('[data-testid="symbex-lab-reflect-a1"]')?.addEventListener('input', (e) => {
      symbexLabReflect.a1 = e.target.value;
    });
    root.querySelector('[data-testid="symbex-lab-reflect-a2"]')?.addEventListener('input', (e) => {
      symbexLabReflect.a2 = e.target.value;
    });

    const symbexLrShare = root.querySelector('[data-testid="symbex-lab-reflect-share"]');
    if (symbexLrShare) {
      symbexLrShare.addEventListener('click', async () => {
        const a1 = root.querySelector('[data-testid="symbex-lab-reflect-a1"]')?.value || '';
        const a2 = root.querySelector('[data-testid="symbex-lab-reflect-a2"]')?.value || '';
        const url = buildShareUrl(encodeResult({
          v: 1, explorer: 'symbex', explorerLabel: t('lab.reflect.title'), mode: 'lab-reflect',
          ts: Date.now(), lang: getLocale(), score: (a1.trim() ? 1 : 0) + (a2.trim() ? 1 : 0), total: 2,
          items: [
            { q: t('lab.reflect.q.symbex.1'), a: a1 },
            { q: t('lab.reflect.q.symbex.2'), a: a2 },
          ],
        }));
        try { await navigator.clipboard.writeText(url); } catch {
          const ta = document.createElement('textarea');
          ta.value = url; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        }
        const orig = symbexLrShare.innerHTML;
        symbexLrShare.innerHTML = t('quiz.share.copied');
        symbexLrShare.classList.add('quiz-share-btn--copied');
        setTimeout(() => { symbexLrShare.innerHTML = orig; symbexLrShare.classList.remove('quiz-share-btn--copied'); }, 2000);
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
