import { mutationOperators, programExamples } from '../data/mutationData.js';
import { t, getLocale, pickField } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';
import {
  generateMutants,
  evaluateMutants,
  computeMutationScore,
  runTestSuite,
} from '../utils/mutation.js';
import { createCloudIntegrationClient } from '../utils/cloudIntegration.js';

const DEFAULT_OPERATORS = ['AOR', 'ROR', 'LOR', 'UOI'];
const STORAGE_KEY = 'stvisual.syntaxTests.v1';
const SAVE_DEBOUNCE_MS = 600;

function loadLocalPrograms() {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveLocalPrograms(programs) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(programs));
  } catch {
    // ignore quota errors
  }
}

function defaultProgramSnapshot(ex) {
  return {
    params: ex.params.join(', '),
    body: ex.body,
    tests: ex.tests.map((t) => ({
      id: t.id,
      argsText: t.args.map((a) => JSON.stringify(a)).join(', '),
      expectedText: JSON.stringify(t.expected),
    })),
  };
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatValue(v) {
  if (v === undefined) return 'undefined';
  if (typeof v === 'string') return JSON.stringify(v);
  try { return JSON.stringify(v); } catch { return String(v); }
}

function parseTestArgs(text) {
  // Parse via JSON to allow inputs like `1, 2, "x"`.
  const trimmed = text.trim();
  if (!trimmed) return [];
  try {
    return JSON.parse(`[${trimmed}]`);
  } catch (err) {
    throw new Error(t('syntax.err.argsParse', { msg: err.message }));
  }
}

function parseExpected(text) {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed; // treat as string literal
  }
}

function parseFunctionSource(text) {
  const m = text.match(/function\s+\w*\s*\(([^)]*)\)\s*\{/);
  if (!m) return null;
  const params = m[1].trim();
  const startIdx = m.index + m[0].length;
  let depth = 1;
  for (let i = startIdx; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return { params, body: text.slice(startIdx, i).replace(/^\n+|\n+$/g, '') };
      }
    }
  }
  return null;
}

export function createSyntaxCoverageExplorer() {
  const root = document.createElement('div');
  root.className = 'syntax-coverage';
  root.dataset.testid = 'syntax-coverage';

  const initial = programExamples[0];
  const localPrograms = loadLocalPrograms();
  const initialSnapshot = localPrograms[initial.id] || defaultProgramSnapshot(initial);

  const state = {
    exampleId: initial.id,
    params: initialSnapshot.params,
    body: initialSnapshot.body,
    operators: new Set(DEFAULT_OPERATORS),
    tests: initialSnapshot.tests.map((t) => ({ ...t })),
    programs: localPrograms,
    mutants: [],
    suiteResults: [],
    parsedTests: [],
    parsedParams: [],
    score: { total: 0, killed: 0, live: 0, equivalent: 0, score: 0 },
    error: null,
    selectedMutantId: null,
    cloudUser: null,
    cloudStatus: 'idle', // 'idle' | 'syncing' | 'synced' | 'error'
    cloudMessage: '',
    customExamples: [],
  };

  let cloudClient = null;
  try {
    cloudClient = createCloudIntegrationClient();
  } catch {
    cloudClient = null;
  }

  function snapshotCurrent() {
    return {
      params: state.params,
      body: state.body,
      tests: state.tests.map((t) => ({
        id: t.id,
        argsText: t.argsText,
        expectedText: t.expectedText,
      })),
    };
  }

  function persistCurrent() {
    state.programs[state.exampleId] = snapshotCurrent();
    saveLocalPrograms(state.programs);
    pushToCloud();
  }

  const syntaxQuiz = { active: false, phase: 'question', answer: '', result: null };

  function renderSyntaxQuizPanel() {
    if (!syntaxQuiz.active) return '';
    if (syntaxQuiz.phase === 'graded') {
      const correct = state.score.killed;
      const userAns = parseInt(syntaxQuiz.answer, 10);
      const ok = userAns === correct;
      const shareEncoded = encodeResult({ v: 1, explorer: 'syntax', explorerLabel: t('quiz.syntax.title'), mode: 'quiz', ts: Date.now(), lang: getLocale(), score: ok ? 1 : 0, total: 1, items: [{ q: t('quiz.syntax.prompt', { program: state.exampleId }), a: String(syntaxQuiz.answer), expected: String(correct), ok }] });
      return `
        <div class="quiz-panel" data-testid="syntax-quiz-panel">
          <div class="quiz-header">
            <span>${t('quiz.syntax.title')}</span>
            <button type="button" class="quiz-close-btn" data-testid="syntax-quiz-close">✕</button>
          </div>
          <p class="quiz-prompt">${t('quiz.syntax.prompt', { program: escapeHtml(state.exampleId) })}</p>
          <p class="quiz-score ${ok ? 'quiz-score--perfect' : 'quiz-score--wrong'}">
            ${ok ? t('quiz.graph.perfect') : ''}
            ${t('quiz.syntax.answer', { killed: correct, total: state.score.total })}
          </p>
          <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="syntax-quiz-share">📋 ${t('quiz.share.btn')}</button>
          <button type="button" class="quiz-start-btn" data-testid="syntax-quiz-reset">${t('quiz.retry')}</button>
        </div>
      `;
    }
    return `
      <div class="quiz-panel" data-testid="syntax-quiz-panel">
        <div class="quiz-header">
          <span>${t('quiz.syntax.title')}</span>
          <button type="button" class="quiz-close-btn" data-testid="syntax-quiz-close">✕</button>
        </div>
        <p class="quiz-prompt">${t('quiz.syntax.prompt', { program: escapeHtml(state.exampleId) })}</p>
        <div class="quiz-bva-inputs">
          <label class="quiz-bva-field">
            ${t('quiz.syntax.label')}
            <input type="number" min="0" class="quiz-input" data-testid="syntax-quiz-input" value="${escapeHtml(syntaxQuiz.answer)}" />
          </label>
        </div>
        <button type="button" class="quiz-start-btn" data-testid="syntax-quiz-check">${t('quiz.check')}</button>
      </div>
    `;
  }

  let saveTimer = null;
  let pendingSave = null;
  function pushToCloud() {
    if (!cloudClient || !state.cloudUser || typeof cloudClient.saveSyntaxTests !== 'function') return;
    if (saveTimer) clearTimeout(saveTimer);
    state.cloudStatus = 'syncing';
    state.cloudMessage = '';
    updateCloudIndicator();
    pendingSave = new Promise((resolve) => {
      saveTimer = setTimeout(async () => {
        saveTimer = null;
        try {
          await cloudClient.saveSyntaxTests(state.cloudUser.uid, state.programs);
          state.cloudStatus = 'synced';
          state.cloudMessage = t('syntax.cloud.synced');
        } catch (err) {
          state.cloudStatus = 'error';
          state.cloudMessage = t('syntax.cloud.saveError', { msg: err?.message || err });
        }
        updateCloudIndicator();
        resolve();
        pendingSave = null;
      }, SAVE_DEBOUNCE_MS);
    });
  }

  async function flushPendingSave() {
    if (!pendingSave) return;
    // Flush any pending timer immediately.
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
      try {
        await cloudClient.saveSyntaxTests(state.cloudUser.uid, state.programs);
      } catch {
        /* ignore: next reload will retry */
      }
    } else {
      await pendingSave;
    }
    pendingSave = null;
  }

  function updateCloudIndicator() {
    const node = root.querySelector('[data-testid="syntax-cloud-indicator"]');
    if (!node) return;
    node.dataset.status = state.cloudStatus;
    node.textContent = cloudIndicatorText();
  }

  function cloudIndicatorText() {
    if (!state.cloudUser) return t('syntax.cloud.notSignedIn');
    switch (state.cloudStatus) {
      case 'syncing': return t('syntax.cloud.syncing');
      case 'synced': return `☁ ${state.cloudMessage || t('syntax.cloud.synced')}`;
      case 'error': return `☁ ${state.cloudMessage || t('syntax.cloud.failed')}`;
      default: return `☁ ${t('syntax.cloud.linked', { name: state.cloudUser.email || state.cloudUser.uid })}`;
    }
  }

  async function reloadFromCloud({ force = false } = {}) {
    if (!cloudClient || !state.cloudUser) return;
    if (typeof cloudClient.loadSyntaxTests !== 'function') return;
    // Flush any pending local edits first so they aren't overwritten by stale cloud data.
    await flushPendingSave();
    state.cloudStatus = 'syncing';
    state.cloudMessage = force ? t('syntax.cloud.reloading') : '';
    updateCloudIndicator();
    try {
      const remote = await cloudClient.loadSyntaxTests(state.cloudUser.uid);
      const remoteObj = remote && typeof remote === 'object' ? remote : {};
      const localOnly = Object.keys(state.programs).filter((k) => !(k in remoteObj));
      // Cloud is canonical; keep only locally-unique examples.
      const merged = { ...remoteObj };
      localOnly.forEach((k) => { merged[k] = state.programs[k]; });
      state.programs = merged;
      saveLocalPrograms(state.programs);
      const current = state.programs[state.exampleId];
      if (current) {
        state.params = current.params ?? state.params;
        state.body = current.body ?? state.body;
        state.tests = Array.isArray(current.tests)
          ? current.tests.map((t) => ({ ...t }))
          : state.tests;
        state.selectedMutantId = null;
      }
      state.cloudStatus = 'synced';
      state.cloudMessage = t('syntax.cloud.loaded');
      render();
      // Write back only locally-unique examples to avoid clobbering remote edits.
      if (localOnly.length > 0) pushToCloud();
    } catch (err) {
      state.cloudStatus = 'error';
      state.cloudMessage = t('syntax.cloud.loadError', { msg: err?.message || err });
      updateCloudIndicator();
    }
  }

  function recompute() {
    state.error = null;
    let params;
    try {
      params = state.params.split(',').map((s) => s.trim()).filter(Boolean);
    } catch (err) {
      state.error = t('syntax.err.argsParse', { msg: err.message });
      return;
    }

    let parsedTests;
    try {
      parsedTests = state.tests.map((t) => ({
        id: t.id,
        args: parseTestArgs(t.argsText),
        expected: parseExpected(t.expectedText),
      }));
    } catch (err) {
      state.error = err.message;
      return;
    }

    let suiteResults;
    try {
      suiteResults = runTestSuite(params, state.body, parsedTests);
    } catch (err) {
      state.error = t('syntax.err.compile', { msg: err.message });
      return;
    }

    const operators = [...state.operators];
    const generated = generateMutants(state.body, operators);
    const evaluated = evaluateMutants(params, state.body, parsedTests, generated);

    // Preserve user-marked equivalent flags (matched by id).
    const prevEquivalent = new Set(
      state.mutants.filter((m) => m.status === 'equivalent').map((m) => m.id),
    );
    const finalMutants = evaluated.map((m) =>
      prevEquivalent.has(m.id) ? { ...m, status: 'equivalent', killedBy: [] } : m,
    );

    state.suiteResults = suiteResults;
    state.parsedTests = parsedTests;
    state.parsedParams = params;
    state.mutants = finalMutants;
    state.score = computeMutationScore(finalMutants);
    if (!state.mutants.find((m) => m.id === state.selectedMutantId)) {
      state.selectedMutantId = finalMutants[0]?.id || null;
    }
  }

  function loadExample(id) {
    const ex = programExamples.find((e) => e.id === id) || state.customExamples.find((e) => e.id === id);
    if (!ex) return;
    state.exampleId = id;
    const snap = state.programs[id] || defaultProgramSnapshot(ex);
    state.params = snap.params;
    state.body = snap.body;
    state.tests = snap.tests.map((t) => ({ ...t }));
    state.selectedMutantId = null;
  }

  function render() {
    recompute();

    const allExamples = [...programExamples, ...state.customExamples];
    const exampleButtons = allExamples.map((ex) => `
      <button
        type="button"
        class="syntax-example-btn${state.exampleId === ex.id ? ' active' : ''}"
        data-example="${ex.id}"
        title="${escapeHtml(getLocale() === 'en' ? (ex.descriptionEn || ex.description) : ex.description)}"
        data-testid="syntax-example-${ex.id}"
      >${escapeHtml(ex.name)}</button>
    `).join('');

    const operatorButtons = mutationOperators.map((op) => `
      <label class="syntax-op-btn${state.operators.has(op.id) ? ' active' : ''}" title="${escapeHtml(getLocale() === 'en' ? (op.descEn || op.desc) : op.desc)}">
        <input type="checkbox" data-operator="${op.id}" ${state.operators.has(op.id) ? 'checked' : ''} />
        <span>${escapeHtml(op.id)}</span>
      </label>
    `).join('');

    const selectedMutant = state.mutants.find((m) => m.id === state.selectedMutantId) || null;
    let mutantSuiteResults = null;
    if (selectedMutant) {
      try {
        mutantSuiteResults = runTestSuite(
          state.parsedParams,
          selectedMutant.source,
          state.parsedTests,
        );
      } catch {
        mutantSuiteResults = state.parsedTests.map(() => ({
          outcome: { ok: false, error: 'compile error' },
        }));
      }
    }

    const showMutantCol = !!selectedMutant;
    const killedByIds = selectedMutant ? new Set(selectedMutant.killedBy) : new Set();

    const testRows = state.tests.map((tc, i) => {
      const result = state.suiteResults[i];
      const passClass = result?.passed ? 'pass' : (result ? 'fail' : '');
      const actual = result?.outcome.ok ? formatValue(result.outcome.value) : `⚠ ${result?.outcome.error || ''}`;

      let mutantCell = '';
      let killClass = '';
      if (showMutantCol) {
        const mr = mutantSuiteResults?.[i];
        const mutantActual = mr?.outcome.ok
          ? formatValue(mr.outcome.value)
          : `⚠ ${mr?.outcome.error || ''}`;
        const isKilled = killedByIds.has(tc.id);
        killClass = isKilled ? 'killed-by' : 'survived-by';
        mutantCell = `<td class="syntax-test-mutant ${killClass}"><code>${escapeHtml(mutantActual)}</code>${isKilled ? '<span class="syntax-test-kill-badge">killed</span>' : ''}</td>`;
      }

      return `
        <tr class="syntax-test-row ${passClass} ${killClass}" data-testid="syntax-test-row-${tc.id}">
          <td><code>${escapeHtml(tc.id)}</code></td>
          <td><input type="text" class="syntax-test-input" data-test-args="${tc.id}" value="${escapeHtml(tc.argsText)}" /></td>
          <td><input type="text" class="syntax-test-input" data-test-expected="${tc.id}" value="${escapeHtml(tc.expectedText)}" /></td>
          <td><code>${escapeHtml(actual)}</code></td>
          ${mutantCell}
          <td>
            <button type="button" class="syntax-test-remove" data-remove-test="${tc.id}" aria-label="${t('syntax.removeTest')}">×</button>
          </td>
        </tr>
      `;
    }).join('');

    const mutantHeaderCol = showMutantCol
      ? `<th class="syntax-test-mutant-head">mutant actual${selectedMutant ? `<br><small>(${escapeHtml(selectedMutant.id)})</small>` : ''}</th>`
      : '';

    // Group mutants for display
    const grouped = new Map();
    state.mutants.forEach((m) => {
      if (!grouped.has(m.operator)) grouped.set(m.operator, []);
      grouped.get(m.operator).push(m);
    });

    const mutantList = [...grouped.entries()].map(([op, list]) => {
      const items = list.map((m) => `
        <li class="syntax-mutant-item ${m.status}${state.selectedMutantId === m.id ? ' selected' : ''}" data-mutant-id="${m.id}" data-testid="syntax-mutant-${m.id}">
          <span class="syntax-mutant-id">${escapeHtml(m.id)}</span>
          <span class="syntax-mutant-loc">L${m.line}:${m.col}</span>
          <span class="syntax-mutant-diff"><code>${escapeHtml(m.original)}</code> → <code>${escapeHtml(m.mutated)}</code></span>
          <span class="syntax-mutant-status">${escapeHtml(m.status)}</span>
        </li>
      `).join('');
      return `
        <div class="syntax-mutant-group" data-testid="syntax-mutant-group-${op}">
          <h5>${t('syntax.col.mutantGroupHeading', { op: escapeHtml(op), count: list.length })}</h5>
          <ul>${items}</ul>
        </div>
      `;
    }).join('');

    const selected = selectedMutant;
    const selectedDetail = selected ? `
      <div class="syntax-mutant-detail" data-testid="syntax-mutant-detail">
        <h4>${escapeHtml(selected.id)} <span class="syntax-mutant-op">${escapeHtml(selected.operator)}</span></h4>
        <p class="syntax-mutant-meta">L${selected.line}:${selected.col} · ${t('syntax.mutant.statusLabel')}<strong>${escapeHtml(selected.status)}</strong></p>
        <pre class="syntax-mutant-source"><code>${escapeHtml(selected.source)}</code></pre>
        <p class="syntax-mutant-killed">
          ${selected.killedBy.length
            ? t('syntax.mutant.killedByList', { ids: selected.killedBy.map((id) => `<code>${escapeHtml(id)}</code>`).join(', ') })
            : t('syntax.mutant.liveHint')}
        </p>
        <div class="syntax-mutant-actions">
          <button type="button" data-toggle-equivalent="${selected.id}">
            ${selected.status === 'equivalent' ? t('common.unmarkEquivalent') : t('common.markEquivalent')}
          </button>
        </div>
      </div>
    ` : `<p class="syntax-mutant-empty">${t('syntax.mutant.empty')}</p>`;

    const scorePct = Math.round(state.score.score * 100);
    const SYNTAX_THRESHOLD = 75;
    const syntaxMetricEncoded = encodeResult({
      v: 1, explorer: 'syntax', explorerLabel: t('section.syntax'),
      mode: 'lab-metric', ts: Date.now(), lang: getLocale(),
      score: scorePct >= SYNTAX_THRESHOLD ? 1 : 0, total: 1,
      items: [{ q: t('lab.metric.syntax.label', { pct: scorePct }), a: `${scorePct}%`, ok: scorePct >= SYNTAX_THRESHOLD }],
    });

    root.innerHTML = `
      <div class="syntax-toolbar">
        <div class="syntax-examples" role="tablist">${exampleButtons}</div>
        <div class="syntax-operators" data-testid="syntax-operators">${operatorButtons}</div>
      </div>
      <div class="syntax-cloud-bar">
        <span
          class="syntax-cloud-indicator"
          data-testid="syntax-cloud-indicator"
          data-status="${state.cloudStatus}"
        >${escapeHtml(cloudIndicatorText())}</span>
        <span class="syntax-cloud-actions">
          ${state.cloudUser ? `<button type="button" class="syntax-reload-btn" data-testid="syntax-cloud-reload">↻ ${t('syntax.cloud.reload')}</button>` : ''}
          <button type="button" class="syntax-reset-btn" data-testid="syntax-reset-program">↺ ${t('syntax.reset')}</button>
        </span>
      </div>

      <div class="syntax-grid">
        <section class="syntax-program">
          <label class="syntax-label">${t('syntax.params')}</label>
          <input type="text" class="syntax-params" data-testid="syntax-params" value="${escapeHtml(state.params)}" />
          <label class="syntax-label">${t('syntax.body')}</label>
          <textarea class="syntax-body" rows="8" data-testid="syntax-body">${escapeHtml(state.body)}</textarea>
        </section>

        <section class="syntax-tests">
          <header class="syntax-tests-header">
            <h4>${t('syntax.tests')}</h4>
            <button type="button" class="syntax-test-add" data-testid="syntax-test-add">＋ ${t('syntax.test.add')}</button>
          </header>
          <table class="syntax-test-table" data-testid="syntax-test-table">
            <thead>
              <tr>
                <th>id</th>
                <th>${t('syntax.col.args')}</th>
                <th>${t('syntax.col.expected')}</th>
                <th>actual</th>
                ${mutantHeaderCol}
                <th></th>
              </tr>
            </thead>
            <tbody>${testRows}</tbody>
          </table>
        </section>
      </div>

      ${state.error ? `<p class="syntax-error" data-testid="syntax-error">${escapeHtml(state.error)}</p>` : ''}

      <section class="syntax-score-section">
        <div class="syntax-score-bar">
          <div class="syntax-score-fill" style="width:${scorePct}%" data-testid="syntax-score-fill"></div>
        </div>
        <p class="syntax-score-stats" data-testid="syntax-score-stats">
          ${t('syntax.score')}: <strong>${scorePct}%</strong>
          <span class="syntax-divider">·</span>
          ${t('syntax.totalLabel')} ${state.score.total}
          <span class="syntax-divider">·</span>
          killed <strong>${state.score.killed}</strong>
          <span class="syntax-divider">·</span>
          live <strong>${state.score.live}</strong>
          <span class="syntax-divider">·</span>
          equivalent <strong>${state.score.equivalent}</strong>
          <span class="syntax-divider">·</span>
          ${!syntaxQuiz.active ? `<button type="button" class="quiz-start-btn" data-testid="syntax-quiz-start">${t('quiz.start')}</button>` : ''}
          <button type="button" class="quiz-share-btn" data-share-payload="${syntaxMetricEncoded}" data-testid="syntax-lab-metric">📊 ${t('lab.metric.record')}</button>
        </p>
        ${renderSyntaxQuizPanel()}
      </section>

      <section class="syntax-mutant-section">
        <div class="syntax-mutant-list" data-testid="syntax-mutant-list">${mutantList || `<p class="syntax-mutant-empty">${t('syntax.noMutants')}</p>`}</div>
        ${selectedDetail}
      </section>
    `;

    bindEvents();
  }

  function bindEvents() {
    root.querySelectorAll('[data-example]').forEach((btn) => {
      btn.addEventListener('click', () => { loadExample(btn.dataset.example); render(); });
    });

    const resetBtn = root.querySelector('[data-testid="syntax-reset-program"]');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const ex = programExamples.find((e) => e.id === state.exampleId);
        if (!ex) return;
        const snap = defaultProgramSnapshot(ex);
        state.params = snap.params;
        state.body = snap.body;
        state.tests = snap.tests.map((t) => ({ ...t }));
        state.selectedMutantId = null;
        persistCurrent();
        render();
      });
    }

    const reloadBtn = root.querySelector('[data-testid="syntax-cloud-reload"]');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', () => { reloadFromCloud({ force: true }); });
    }

    root.querySelectorAll('[data-operator]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const op = cb.dataset.operator;
        if (cb.checked) state.operators.add(op);
        else state.operators.delete(op);
        render();
      });
    });

    const params = root.querySelector('[data-testid="syntax-params"]');
    if (params) {
      params.addEventListener('input', (e) => { state.params = e.target.value; persistCurrent(); });
      params.addEventListener('change', (e) => { state.params = e.target.value; persistCurrent(); render(); });
    }

    const body = root.querySelector('[data-testid="syntax-body"]');
    if (body) {
      body.addEventListener('input', (e) => { state.body = e.target.value; persistCurrent(); });
      body.addEventListener('change', (e) => { state.body = e.target.value; persistCurrent(); render(); });
    }

    root.querySelectorAll('[data-test-args]').forEach((input) => {
      input.addEventListener('input', (e) => {
        const id = input.dataset.testArgs;
        const t = state.tests.find((x) => x.id === id);
        if (t) t.argsText = e.target.value;
        persistCurrent();
      });
      input.addEventListener('change', (e) => {
        const id = input.dataset.testArgs;
        const t = state.tests.find((x) => x.id === id);
        if (t) t.argsText = e.target.value;
        persistCurrent();
        render();
      });
    });

    root.querySelectorAll('[data-test-expected]').forEach((input) => {
      input.addEventListener('input', (e) => {
        const id = input.dataset.testExpected;
        const t = state.tests.find((x) => x.id === id);
        if (t) t.expectedText = e.target.value;
        persistCurrent();
      });
      input.addEventListener('change', (e) => {
        const id = input.dataset.testExpected;
        const t = state.tests.find((x) => x.id === id);
        if (t) t.expectedText = e.target.value;
        persistCurrent();
        render();
      });
    });

    root.querySelectorAll('[data-remove-test]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.tests = state.tests.filter((t) => t.id !== btn.dataset.removeTest);
        persistCurrent();
        render();
      });
    });

    const addBtn = root.querySelector('[data-testid="syntax-test-add"]');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const next = `t${state.tests.length + 1}`;
        state.tests.push({ id: next, argsText: '', expectedText: '' });
        persistCurrent();
        render();
      });
    }

    root.querySelectorAll('[data-mutant-id]').forEach((li) => {
      li.addEventListener('click', () => {
        state.selectedMutantId = li.dataset.mutantId;
        render();
      });
    });

    root.querySelectorAll('[data-toggle-equivalent]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const m = state.mutants.find((x) => x.id === btn.dataset.toggleEquivalent);
        if (!m) return;
        m.status = m.status === 'equivalent' ? (m.killedBy.length ? 'killed' : 'live') : 'equivalent';
        state.score = computeMutationScore(state.mutants);
        render();
      });
    });

    const sqStart = root.querySelector('[data-testid="syntax-quiz-start"]');
    if (sqStart) {
      sqStart.addEventListener('click', () => {
        syntaxQuiz.active = true;
        syntaxQuiz.phase = 'question';
        syntaxQuiz.answer = '';
        syntaxQuiz.result = null;
        render();
      });
    }
    const sqClose = root.querySelector('[data-testid="syntax-quiz-close"]');
    if (sqClose) {
      sqClose.addEventListener('click', () => { syntaxQuiz.active = false; render(); });
    }
    const sqCheck = root.querySelector('[data-testid="syntax-quiz-check"]');
    if (sqCheck) {
      sqCheck.addEventListener('click', () => {
        const inp = root.querySelector('[data-testid="syntax-quiz-input"]');
        syntaxQuiz.answer = inp ? inp.value : '';
        syntaxQuiz.phase = 'graded';
        render();
      });
    }
    const sqReset = root.querySelector('[data-testid="syntax-quiz-reset"]');
    if (sqReset) {
      sqReset.addEventListener('click', () => {
        syntaxQuiz.phase = 'question';
        syntaxQuiz.answer = '';
        syntaxQuiz.result = null;
        render();
      });
    }
  }

  render();

  if (cloudClient && typeof cloudClient.subscribeAuthState === 'function') {
    cloudClient.subscribeAuthState(async (user) => {
      state.cloudUser = user || null;
      if (!user) {
        state.cloudStatus = 'idle';
        state.cloudMessage = '';
        render();
        return;
      }
      await reloadFromCloud();
    });

    // Auto-pull from cloud on visibility change to keep devices in sync.
    if (typeof globalThis.document?.addEventListener === 'function') {
      globalThis.document.addEventListener('visibilitychange', () => {
        if (globalThis.document.visibilityState === 'visible' && state.cloudUser) {
          reloadFromCloud();
        }
      });
    }

    // Flush pending saves before unload to avoid loss.
    if (typeof globalThis.addEventListener === 'function') {
      globalThis.addEventListener('pagehide', () => { flushPendingSave(); });
      globalThis.addEventListener('beforeunload', () => { flushPendingSave(); });
    }
  }

  if (typeof globalThis.addEventListener === 'function') {
    globalThis.addEventListener('stvisual:load-program-source', (event) => {
      if (!root.isConnected) return;
      const detail = event.detail || {};
      if (detail.target !== 'mutation') return;
      const content = String(detail.content ?? '');
      const parsed = parseFunctionSource(content);
      const baseName = (detail.name || 'uploaded').replace(/\.[^.]+$/, '') || 'uploaded';
      const id = `uploaded-${Date.now().toString(36)}`;
      const params = parsed ? parsed.params : '';
      const body = parsed ? parsed.body : content;
      const newExample = {
        id,
        name: baseName,
        nameEn: baseName,
        description: `Uploaded from cloud: ${detail.name || baseName}`,
        descriptionEn: `Uploaded from cloud: ${detail.name || baseName}`,
        params: params ? params.split(',').map((s) => s.trim()).filter(Boolean) : [],
        body,
        tests: [],
      };
      state.customExamples = [...state.customExamples, newExample];
      state.programs[id] = { params, body, tests: [] };
      state.exampleId = id;
      state.params = params;
      state.body = body;
      state.tests = [];
      state.selectedMutantId = null;
      persistCurrent();
      render();
    });
  }

  return root;
}
