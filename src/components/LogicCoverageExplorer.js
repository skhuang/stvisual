import {
  logicCoverageCriteria,
  logicCoveragePredicates,
} from '../data/testingData.js';
import {
  buildAllCoverageSets,
  parsePredicate,
} from '../utils/logicCoverage.js';

const RECENT_KEY = 'stvisual.logic.recentPredicates';
const RECENT_LIMIT = 8;

function loadRecent() {
  try {
    const raw = globalThis.localStorage?.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((p) => typeof p === 'string') : [];
  } catch {
    return [];
  }
}

function saveRecent(list) {
  try {
    globalThis.localStorage?.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    // ignore quota/availability errors
  }
}

function isBuiltinExpression(expr) {
  return logicCoveragePredicates.some((p) => p.expression === expr);
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function termToHtml(term) {
  if (!term.length) return 'true';
  return term.map((lit) => `${lit.negated ? '!' : ''}${lit.name}`).join(' ∧ ');
}

export function createLogicCoverageExplorer() {
  const root = document.createElement('div');
  root.className = 'logic-coverage';
  root.dataset.testid = 'logic-coverage';

  const state = {
    expression: logicCoveragePredicates[0].expression,
    selectedCriterion: 'pc',
    error: null,
    parsed: null,
    analysis: null,
    recent: loadRecent(),
  };

  function rememberCurrentExpression() {
    const expr = state.expression.trim();
    if (!expr || state.error) return false;
    if (isBuiltinExpression(expr)) return false;
    const next = [expr, ...state.recent.filter((item) => item !== expr)].slice(0, RECENT_LIMIT);
    if (next.length === state.recent.length && next[0] === state.recent[0]) {
      return false;
    }
    state.recent = next;
    saveRecent(state.recent);
    return true;
  }

  function removeRecent(expr) {
    const next = state.recent.filter((item) => item !== expr);
    if (next.length === state.recent.length) return;
    state.recent = next;
    saveRecent(state.recent);
    render();
  }

  function recompute() {
    try {
      state.parsed = parsePredicate(state.expression);
      if (state.parsed.clauses.length > 6) {
        throw new Error('為了視覺化可讀性，子句數量請限制在 6 個以內。');
      }
      state.analysis = buildAllCoverageSets(state.parsed);
      state.error = null;
    } catch (err) {
      state.parsed = null;
      state.analysis = null;
      state.error = err.message || String(err);
    }
  }

  function getActiveSet() {
    if (!state.analysis) return null;
    return state.analysis.sets[state.selectedCriterion] || null;
  }

  function activeRowIds() {
    const set = getActiveSet();
    if (!set) return new Set();
    return new Set(set.tests.map((t) => `r${t.row.index}`));
  }

  function render() {
    const examplesMarkup = logicCoveragePredicates
      .map((p) => `
        <button
          type="button"
          class="logic-example-btn${state.expression === p.expression ? ' active' : ''}"
          data-expression="${escapeHtml(p.expression)}"
          data-testid="logic-example-${p.id}"
          title="${escapeHtml(p.description)}"
        >
          ${escapeHtml(p.name)}
        </button>
      `)
      .join('');

    const recentMarkup = state.recent.length
      ? `
        <div class="logic-recent" data-testid="logic-recent">
          <span class="logic-recent-label">最近：</span>
          ${state.recent
            .map((expr) => `
              <span class="logic-recent-chip${state.expression === expr ? ' active' : ''}" data-testid="logic-recent-chip">
                <button
                  type="button"
                  class="logic-recent-select"
                  data-recent-select="${escapeHtml(expr)}"
                  title="${escapeHtml(expr)}"
                >${escapeHtml(expr)}</button>
                <button
                  type="button"
                  class="logic-recent-remove"
                  data-recent-remove="${escapeHtml(expr)}"
                  aria-label="移除 ${escapeHtml(expr)}"
                  title="移除"
                >×</button>
              </span>
            `)
            .join('')}
        </div>
      `
      : '';

    const criteriaMarkup = logicCoverageCriteria
      .map((c) => `
        <button
          type="button"
          class="logic-criterion-btn${state.selectedCriterion === c.id ? ' active' : ''}"
          data-criterion="${c.id}"
          data-testid="logic-criterion-${c.id}"
        >
          <span class="logic-criterion-label">${escapeHtml(c.label)}</span>
          <span class="logic-criterion-zh">${escapeHtml(c.labelZh)}</span>
        </button>
      `)
      .join('');

    const truthTableMarkup = renderTruthTable();
    const summaryMarkup = renderSummary();

    root.innerHTML = `
      <div class="logic-toolbar">
        <label class="logic-input-label" for="logic-expression-input">Predicate</label>
        <input
          id="logic-expression-input"
          class="logic-expression-input"
          type="text"
          value="${escapeHtml(state.expression)}"
          spellcheck="false"
          autocomplete="off"
          data-testid="logic-expression-input"
        />
        <div class="logic-examples">${examplesMarkup}</div>
        ${recentMarkup}
      </div>

      ${state.error ? `<div class="logic-error" data-testid="logic-error">${escapeHtml(state.error)}</div>` : ''}

      <div class="logic-criteria" role="tablist" aria-label="Logic Coverage 準則">
        ${criteriaMarkup}
      </div>

      <div class="logic-summary" data-testid="logic-summary">${summaryMarkup}</div>

      <div class="logic-truth-table-wrap">${truthTableMarkup}</div>
    `;

    bindEvents();
  }

  function renderTruthTable() {
    if (!state.analysis) {
      return '';
    }
    const { rows, clauses } = state.analysis;
    const highlighted = activeRowIds();
    const activeSet = getActiveSet();
    const majorByRow = new Map();

    if (activeSet && ['gacc', 'cacc', 'racc', 'gicc', 'ricc'].includes(activeSet.id)) {
      activeSet.tests.forEach((test) => {
        const key = `r${test.row.index}`;
        if (!majorByRow.has(key)) {
          majorByRow.set(key, new Set());
        }
        majorByRow.get(key).add(test.majorClause);
      });
    }

    const headerCells = clauses
      .map((c) => `<th scope="col">${escapeHtml(c)}</th>`)
      .join('');

    const bodyRows = rows
      .map((row) => {
        const rowKey = `r${row.index}`;
        const isActive = highlighted.has(rowKey);
        const majors = majorByRow.get(rowKey);
        const cells = clauses
          .map((c) => {
            const determining = row.determines[c];
            const isMajor = majors?.has(c);
            return `
              <td class="logic-cell-clause${determining ? ' determining' : ''}${isMajor ? ' major' : ''}" data-clause="${escapeHtml(c)}">
                ${row.values[c] ? 'T' : 'F'}
              </td>
            `;
          })
          .join('');
        return `
          <tr class="logic-row${isActive ? ' active' : ''}${row.predicate ? ' p-true' : ' p-false'}" data-row="${row.index}" data-testid="logic-row-${row.index}">
            <th scope="row">${row.index}</th>
            ${cells}
            <td class="logic-cell-result ${row.predicate ? 'is-true' : 'is-false'}">${row.predicate ? 'T' : 'F'}</td>
          </tr>
        `;
      })
      .join('');

    return `
      <table class="logic-truth-table" data-testid="logic-truth-table">
        <thead>
          <tr>
            <th scope="col">#</th>
            ${headerCells}
            <th scope="col">P</th>
          </tr>
        </thead>
        <tbody>${bodyRows}</tbody>
      </table>
    `;
  }

  function renderSummary() {
    if (state.error || !state.analysis) {
      return '';
    }
    const set = getActiveSet();
    if (!set) return '';

    const seenRows = new Set();
    const annotated = set.tests.map((t) => {
      const key = `r${t.row.index}`;
      const isDuplicate = seenRows.has(key);
      if (!isDuplicate) seenRows.add(key);
      return { test: t, isDuplicate };
    });
    const totalCount = annotated.length;
    const duplicateCount = annotated.filter((item) => item.isDuplicate).length;
    const uniqueCount = totalCount - duplicateCount;

    const testList = annotated
      .map(({ test: t, isDuplicate }) => `
        <li class="logic-test-item${isDuplicate ? ' duplicate' : ''}" data-testid="logic-test-${escapeHtml(t.id)}">
          <span class="logic-test-row">#${t.row.index}</span>
          <span class="logic-test-values">${state.analysis.clauses
            .map((c) => `${c}=${t.row.values[c] ? 'T' : 'F'}`)
            .join(', ')}</span>
          <span class="logic-test-pred ${t.row.predicate ? 'is-true' : 'is-false'}">P=${t.row.predicate ? 'T' : 'F'}</span>
          <span class="logic-test-label">${escapeHtml(t.label)}</span>
          ${isDuplicate ? '<span class="logic-test-dup-tag" aria-label="重複">重複</span>' : ''}
        </li>
      `)
      .join('');

    const unsatisfied = set.unsatisfied?.length
      ? `<p class="logic-unsatisfied" data-testid="logic-unsatisfied">無法找到下列需求對應列：${set.unsatisfied.join(', ')}</p>`
      : '';

    const dnfMarkup = ['ic', 'utpc', 'nfpc', 'cutpnfp'].includes(set.id) && state.analysis.dnf
      ? `<p class="logic-dnf" data-testid="logic-dnf">DNF：${
          state.analysis.dnf
            .map((term) => `<code>${escapeHtml(termToHtml(term))}</code>`)
            .join(' &nbsp;∨&nbsp; ') || '<code>true</code>'
        }</p>`
      : '';

    return `
      <h3 class="logic-summary-title">${escapeHtml(set.name)}</h3>
      <p class="logic-summary-desc">${escapeHtml(set.description)}</p>
      ${dnfMarkup}
      <p class="logic-summary-stats">
        測試列數：<strong data-testid="logic-test-count">${totalCount}</strong>
        <span class="logic-divider">·</span>
        實際需要（去重）：<strong data-testid="logic-test-unique-count">${uniqueCount}</strong>
        <span class="logic-divider">·</span>
        重複數量：<strong data-testid="logic-test-duplicate-count">${duplicateCount}</strong>
        <span class="logic-divider">·</span>
        建議測試需求：<strong>${set.requirementCount}</strong>
      </p>
      <ol class="logic-test-list">${testList}</ol>
      ${unsatisfied}
    `;
  }

  function bindEvents() {
    const input = root.querySelector('[data-testid="logic-expression-input"]');
    if (input) {
      input.addEventListener('input', (event) => {
        state.expression = event.target.value;
        recompute();
        renderPreservingFocus('logic-expression-input');
      });
      input.addEventListener('blur', () => {
        if (rememberCurrentExpression()) render();
      });
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          if (rememberCurrentExpression()) render();
        }
      });
    }

    root.querySelectorAll('[data-expression]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.expression = btn.dataset.expression;
        recompute();
        render();
      });
    });

    root.querySelectorAll('[data-recent-select]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.expression = btn.dataset.recentSelect;
        recompute();
        render();
      });
    });

    root.querySelectorAll('[data-recent-remove]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.stopPropagation();
        removeRecent(btn.dataset.recentRemove);
      });
    });

    root.querySelectorAll('[data-criterion]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.selectedCriterion = btn.dataset.criterion;
        render();
      });
    });
  }

  function renderPreservingFocus(testid) {
    const previouslyFocused = root.querySelector(`[data-testid="${testid}"]`);
    const selectionStart = previouslyFocused?.selectionStart;
    const selectionEnd = previouslyFocused?.selectionEnd;
    render();
    const next = root.querySelector(`[data-testid="${testid}"]`);
    if (next) {
      next.focus();
      if (typeof selectionStart === 'number' && typeof selectionEnd === 'number' && next.setSelectionRange) {
        next.setSelectionRange(selectionStart, selectionEnd);
      }
    }
  }

  recompute();
  render();
  return root;
}
