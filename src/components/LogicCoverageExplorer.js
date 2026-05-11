import {
  logicCoverageCriteria,
  logicCoveragePredicates,
} from '../data/testingData.js';
import {
  buildAllCoverageSets,
  parsePredicate,
  termToString,
} from '../utils/logicCoverage.js';
import { buildKMap } from '../utils/karnaughMap.js';
import { t, getLocale, pickField } from '../i18n/index.js';
import { createCloudIntegrationClient } from '../utils/cloudIntegration.js';
import { solveBinding, formatWitnessStr, extractVarsFromBindings, buildConstraintStr } from '../utils/logicBinding.js';

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

// Textbook notation: adjacency = AND, + = OR, overline = NOT.
function literalToCompactHtml(lit) {
  const name = escapeHtml(lit.name);
  return lit.negated
    ? `<span class="logic-overline">${name}</span>`
    : name;
}

function termToCompactHtml(term) {
  if (!term.length) return '1';
  return term.map(literalToCompactHtml).join('');
}

function dnfToHtml(dnf) {
  if (!dnf.length) return '<code>false</code>';
  return dnf
    .map((term) => `<code>${escapeHtml(termToHtml(term))}</code>`)
    .join(' &nbsp;∨&nbsp; ');
}

function dnfToCompactHtml(dnf) {
  if (!dnf.length) return '<code>0</code>';
  return dnf
    .map((term) => `<code>${termToCompactHtml(term)}</code>`)
    .join(' &nbsp;+&nbsp; ');
}

const IMPLICANT_PALETTE = [
  '#e67e22', '#27ae60', '#2980b9', '#8e44ad',
  '#c0392b', '#16a085', '#d35400', '#7f8c8d',
];

function renderKMap(rows, clauses, target, title, options = {}) {
  const {
    highlightedMinterms = null,
    implicantGroups = [],
    highlightLabel = 'UTP',
    nfpMarks = null,    // Map<minterm, { color, label }>
    ntpMarks = null,    // Map<minterm, { color, label }>
  } = options;
  const map = buildKMap(rows, clauses, target);
  if (map.unsupported) {
    return `<div class="logic-kmap"><h4 class="logic-kmap-title">${escapeHtml(title)}</h4>
      <p class="logic-kmap-note">${t('logic.kmap.unsupported', { n: map.n })}</p></div>`;
  }
  const colHeaderLabel = map.colVars.length ? map.colVars.join('') : '';
  const rowHeaderLabel = map.rowVars.length ? map.rowVars.join('') : '';
  const colHeadHtml = map.colHeaders
    .map((h) => `<th scope="col">${escapeHtml(h)}</th>`)
    .join('');
  const bodyHtml = map.grid
    .map((row) => {
      const cells = row.cells
        .map((cell) => {
          const classes = ['logic-kmap-cell'];
          if (cell.value) classes.push('logic-kmap-on');
          const isHighlighted = highlightedMinterms?.has(cell.minterm);
          if (isHighlighted) classes.push('logic-kmap-utp');
          const text = cell.value ? '1' : '0';
          const marker = isHighlighted ? '<span class="logic-kmap-utp-mark" aria-hidden="true">★</span>' : '';
          const groupsCovering = implicantGroups.filter((g) => g.minterms.has(cell.minterm));
          const dots = groupsCovering.length
            ? `<span class="logic-kmap-dots">${groupsCovering
                .map((g) => `<span class="logic-kmap-dot" style="background:${g.color}" title="${escapeHtml(g.label)}"></span>`)
                .join('')}</span>`
            : '';
          const nfpInfo = nfpMarks?.get(cell.minterm);
          const ntpInfo = ntpMarks?.get(cell.minterm);
          if (nfpInfo) classes.push('logic-kmap-nfp');
          if (ntpInfo) classes.push('logic-kmap-ntp');
          const badge = (() => {
            const parts = [];
            if (ntpInfo) {
              parts.push(`<span class="logic-kmap-badge logic-kmap-badge-ntp" style="background:${ntpInfo.color}" title="${escapeHtml(ntpInfo.label)}">UTP</span>`);
            }
            if (nfpInfo) {
              parts.push(`<span class="logic-kmap-badge logic-kmap-badge-nfp" style="border-color:${nfpInfo.color};color:${nfpInfo.color}" title="${escapeHtml(nfpInfo.label)}">NFP</span>`);
            }
            return parts.length ? `<span class="logic-kmap-badges">${parts.join('')}</span>` : '';
          })();
          const titleAttr = `m${cell.minterm}${isHighlighted ? `（${highlightLabel}）` : ''}${
            groupsCovering.length ? `｜${groupsCovering.map((g) => g.label).join(' / ')}` : ''
          }${nfpInfo ? `｜NFP: ${nfpInfo.label}` : ''}${ntpInfo ? `｜UTP: ${ntpInfo.label}` : ''}`;
          return `<td class="${classes.join(' ')}" title="${escapeHtml(titleAttr)}">${marker}${badge}${text}<sub>${cell.minterm}</sub>${dots}</td>`;
        })
        .join('');
      const rowHead = rowHeaderLabel
        ? `<th scope="row">${escapeHtml(row.header)}</th>`
        : '';
      return `<tr>${rowHead}${cells}</tr>`;
    })
    .join('');
  const corner = rowHeaderLabel
    ? `<th class="logic-kmap-corner"><span>${escapeHtml(rowHeaderLabel)}</span><span class="logic-kmap-slash">\\</span><span>${escapeHtml(colHeaderLabel)}</span></th>`
    : `<th class="logic-kmap-corner">${escapeHtml(colHeaderLabel)}</th>`;
  const legend = implicantGroups.length
    ? `<ul class="logic-kmap-legend">${implicantGroups
        .map((g) => `
          <li>
            <span class="logic-kmap-dot" style="background:${g.color}"></span>
            <code>${g.labelHtml || escapeHtml(g.label)}</code>
            ${g.testRowIndices?.length
              ? `<span class="logic-kmap-legend-tests">tests: ${g.testRowIndices.map((i) => `m${i}`).join(', ')}</span>`
              : ''}
          </li>`)
        .join('')}</ul>`
    : '';
  return `<div class="logic-kmap" data-testid="${target ? 'logic-kmap-f' : 'logic-kmap-not-f'}">
    <h4 class="logic-kmap-title">${escapeHtml(title)}</h4>
    <table class="logic-kmap-table"><thead><tr>${corner}${colHeadHtml}</tr></thead>
    <tbody>${bodyHtml}</tbody></table>
    ${legend}
  </div>`;
}

function buildImplicantGroups(rows, terms, target, paletteOffset = 0, testsForPolarity = []) {
  return terms.map((term, idx) => {
    const minterms = new Set(
      rows
        .filter((row) => row.predicate === target && term.every((lit) => Boolean(row.values[lit.name]) !== lit.negated))
        .map((row) => row.index),
    );
    const testRowIndices = testsForPolarity
      .filter((t) => t.implicantIndices?.includes(idx) || t.implicantIndex === idx)
      .map((t) => t.row.index);
    return {
      color: IMPLICANT_PALETTE[(idx + paletteOffset) % IMPLICANT_PALETTE.length],
      label: termToString(term),
      labelHtml: termToCompactHtml(term),
      minterms,
      testRowIndices: [...new Set(testRowIndices)],
    };
  });
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
    bindings: {},           // clauseName → JS expression string
    bindingRange: [-10, 10], // [min, max] for brute-force search
    recent: loadRecent(),
    cloudUser: null,
  };

  let cloudClient = null;
  try {
    cloudClient = createCloudIntegrationClient();
  } catch {
    cloudClient = null;
  }

  function pushRecentToCloud(list) {
    if (!cloudClient || !state.cloudUser || typeof cloudClient.saveLogicRecent !== 'function') return;
    cloudClient.saveLogicRecent(state.cloudUser.uid, list).catch(() => {
      // Ignore cloud errors; keep local record.
    });
  }

  function persistRecent() {
    saveRecent(state.recent);
    pushRecentToCloud(state.recent);
  }

  function rememberCurrentExpression() {
    const expr = state.expression.trim();
    if (!expr || state.error) return false;
    if (isBuiltinExpression(expr)) return false;
    const next = [expr, ...state.recent.filter((item) => item !== expr)].slice(0, RECENT_LIMIT);
    if (next.length === state.recent.length && next[0] === state.recent[0]) {
      return false;
    }
    state.recent = next;
    persistRecent();
    return true;
  }

  function removeRecent(expr) {
    const next = state.recent.filter((item) => item !== expr);
    if (next.length === state.recent.length) return;
    state.recent = next;
    persistRecent();
    render();
  }

  function recompute() {
    try {
      state.parsed = parsePredicate(state.expression);
      if (state.parsed.clauses.length > 6) {
        throw new Error(t('logic.err.tooManyClauses'));
      }
      state.analysis = buildAllCoverageSets(state.parsed);
      state.error = null;
      // Drop bindings for clauses no longer in the predicate.
      const clauseSet = new Set(state.parsed.clauses);
      for (const k of Object.keys(state.bindings)) {
        if (!clauseSet.has(k)) delete state.bindings[k];
      }
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
          title="${escapeHtml(pickField(p, 'description') || '')}"
        >
          ${escapeHtml(p.name)}
        </button>
      `)
      .join('');

    const recentMarkup = state.recent.length
      ? `
        <div class="logic-recent" data-testid="logic-recent">
          <span class="logic-recent-label">${t('logic.recent')}</span>
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
                  aria-label="${t('logic.remove')} ${escapeHtml(expr)}"
                  title="${t('logic.remove')}"
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
          <span class="logic-criterion-label">${escapeHtml(pickField(c, 'label') || c.label)}</span>
          <span class="logic-criterion-zh">${escapeHtml(getLocale() === 'en' ? (c.descriptionEn || c.description || '') : (c.labelZh || ''))}</span>
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
        <p class="logic-input-hint">${t('logic.inputHint')}</p>
        <div class="logic-examples">${examplesMarkup}</div>
        ${recentMarkup}
      </div>

      ${state.error ? `<div class="logic-error" data-testid="logic-error">${escapeHtml(state.error)}</div>` : ''}

      <div class="logic-criteria" role="tablist" aria-label="${t('logic.aria.criteria')}">
        ${criteriaMarkup}
      </div>

      <div class="logic-summary" data-testid="logic-summary">${summaryMarkup}</div>

      ${renderBindingPanel()}

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
      .map(({ test, isDuplicate }) => `
        <li class="logic-test-item${isDuplicate ? ' duplicate' : ''}" data-testid="logic-test-${escapeHtml(test.id)}">
          <span class="logic-test-row">#${test.row.index}</span>
          <span class="logic-test-values">${state.analysis.clauses
            .map((c) => `${c}=${test.row.values[c] ? 'T' : 'F'}`)
            .join(', ')}</span>
          <span class="logic-test-pred ${test.row.predicate ? 'is-true' : 'is-false'}">P=${test.row.predicate ? 'T' : 'F'}</span>
          <span class="logic-test-label">${escapeHtml(test.label)}</span>
          ${isDuplicate ? `<span class="logic-test-dup-tag" aria-label="${t('logic.duplicate')}">${t('logic.duplicate')}</span>` : ''}
        </li>
      `)
      .join('');

    const unsatisfied = set.unsatisfied?.length
      ? `<p class="logic-unsatisfied" data-testid="logic-unsatisfied">${t('logic.unsatisfied', { items: set.unsatisfied.join(', ') })}</p>`
      : '';

    const dnfMarkup = ['ic', 'utpc', 'mutpc', 'nfpc', 'mnfpc', 'cutpnfp'].includes(set.id) && state.analysis.dnf
      ? `<p class="logic-dnf" data-testid="logic-dnf">${t('logic.dnfPrefix')}${dnfToHtml(state.analysis.dnf)}
          <span class="logic-dnf-alt">${t('logic.textbookOpen')}${dnfToCompactHtml(state.analysis.dnf)}${t('logic.textbookClose')}</span>
        </p>${
          set.id === 'ic' && state.analysis.negDnf
            ? `<p class="logic-dnf" data-testid="logic-dnf-neg">${t('logic.dnfNegPrefix')}${dnfToHtml(state.analysis.negDnf)}
                <span class="logic-dnf-alt">${t('logic.textbookOpen')}${dnfToCompactHtml(state.analysis.negDnf)}${t('logic.textbookClose')}</span>
              </p>`
            : ''
        }`
      : '';

    const kmapMarkup = state.parsed && (set.id === 'ic' || set.id === 'utpc' || set.id === 'mutpc' || set.id === 'nfpc' || set.id === 'mnfpc' || set.id === 'cutpnfp')
      ? (set.id === 'ic'
          ? (() => {
              const posTests = set.tests.filter((t) => t.polarity === 'pos');
              const negTests = set.tests.filter((t) => t.polarity === 'neg');
              const posGroups = buildImplicantGroups(
                state.analysis.rows,
                state.analysis.dnf || [],
                true,
                0,
                posTests,
              );
              const negGroups = buildImplicantGroups(
                state.analysis.rows,
                state.analysis.negDnf || [],
                false,
                (state.analysis.dnf || []).length,
                negTests,
              );
              const posTestSet = new Set(posTests.map((t) => t.row.index));
              const negTestSet = new Set(negTests.map((t) => t.row.index));
              return `<div class="logic-kmap-row">
                ${renderKMap(
                  state.analysis.rows,
                  state.parsed.clauses,
                  true,
                  t('logic.kmap.title.fStar'),
                  { highlightedMinterms: posTestSet, implicantGroups: posGroups, highlightLabel: 'test' },
                )}
                ${renderKMap(
                  state.analysis.rows,
                  state.parsed.clauses,
                  false,
                  t('logic.kmap.title.fNegStar'),
                  { highlightedMinterms: negTestSet, implicantGroups: negGroups, highlightLabel: 'test' },
                )}
              </div>`;
            })()
          : set.id === 'utpc'
            ? `<div class="logic-kmap-row">
                ${renderKMap(
                  state.analysis.rows,
                  state.parsed.clauses,
                  true,
                  t('logic.kmap.title.utp'),
                  { highlightedMinterms: new Set(set.tests.map((t) => t.row.index)) },
                )}
              </div>`
            : set.id === 'mutpc'
              ? (() => {
                const dnf = state.analysis.dnf || [];
                const groups = buildImplicantGroups(state.analysis.rows, dnf, true, 0, set.tests);
                return `<div class="logic-kmap-row">
                  ${renderKMap(
                    state.analysis.rows,
                    state.parsed.clauses,
                    true,
                    t('logic.kmap.title.mutp'),
                    {
                      highlightedMinterms: new Set(set.tests.map((t) => t.row.index)),
                      implicantGroups: groups,
                      highlightLabel: 'MUTP',
                    },
                  )}
                </div>`;
              })()
            : set.id === 'nfpc' || set.id === 'mnfpc'
              ? (() => {
                const dnf = state.analysis.dnf || [];
                const groups = buildImplicantGroups(state.analysis.rows, dnf, true, 0, []);
                const nfpMarks = new Map();
                const ntpMarks = new Map();
                set.tests.forEach((test) => {
                  const color = IMPLICANT_PALETTE[test.implicantIndex % IMPLICANT_PALETTE.length];
                  const termText = termToString(dnf[test.implicantIndex] || []);
                  const litText = test.literal ? `${test.literal.negated ? '!' : ''}${test.literal.name}` : '';
                  const label = t('logic.flipLabel', { term: termText, lit: litText });
                  nfpMarks.set(test.row.index, { color, label });
                  if (typeof test.pairedTruePointIndex === 'number') {
                    ntpMarks.set(test.pairedTruePointIndex, { color, label });
                  }
                });
                const titleText = set.id === 'mnfpc'
                  ? t('logic.kmap.title.mnfp')
                  : t('logic.kmap.title.nfp');
                return `<div class="logic-kmap-row">
                  ${renderKMap(
                    state.analysis.rows,
                    state.parsed.clauses,
                    true,
                    titleText,
                    { implicantGroups: groups, nfpMarks, ntpMarks, highlightLabel: 'test' },
                  )}
                </div>`;
              })()
              : (() => {
                // CUTPNFP: each pair is a test case, marked bidirectionally.
                const dnf = state.analysis.dnf || [];
                const groups = buildImplicantGroups(state.analysis.rows, dnf, true, 0, []);
                const nfpMarks = new Map();
                const ntpMarks = new Map();
                const testRowSet = new Set();
                set.tests.forEach((test) => {
                  const color = IMPLICANT_PALETTE[test.implicantIndex % IMPLICANT_PALETTE.length];
                  const termText = termToString(dnf[test.implicantIndex] || []);
                  const litText = test.literal ? `${test.literal.negated ? '!' : ''}${test.literal.name}` : '';
                  const label = t('logic.flipLabel', { term: termText, lit: litText });
                  testRowSet.add(test.row.index);
                  if (test.role === 'utp') {
                    ntpMarks.set(test.row.index, { color, label });
                  } else {
                    nfpMarks.set(test.row.index, { color, label });
                  }
                });
                return `<div class="logic-kmap-row">
                  ${renderKMap(
                    state.analysis.rows,
                    state.parsed.clauses,
                    true,
                    t('logic.kmap.title.cutpnfp'),
                    {
                      implicantGroups: groups,
                      nfpMarks,
                      ntpMarks,
                      highlightedMinterms: testRowSet,
                      highlightLabel: 'test',
                    },
                  )}
                </div>`;
              })())
      : '';

    return `
      <h3 class="logic-summary-title">${escapeHtml(set.name)}</h3>
      <p class="logic-summary-desc">${escapeHtml(set.description || '')}</p>
      ${dnfMarkup}
      ${kmapMarkup}
      <p class="logic-summary-stats">
        ${t('logic.metric.total')}<strong data-testid="logic-test-count">${totalCount}</strong>
        <span class="logic-divider">·</span>
        ${t('logic.metric.unique')}<strong data-testid="logic-test-unique-count">${uniqueCount}</strong>
        <span class="logic-divider">·</span>
        ${t('logic.metric.duplicate')}<strong data-testid="logic-test-duplicate-count">${duplicateCount}</strong>
        <span class="logic-divider">·</span>
        ${t('logic.metric.requirements')}<strong>${set.requirementCount}</strong>
      </p>
      <ol class="logic-test-list">${testList}</ol>
      ${unsatisfied}
    `;
  }

  // ---- Clause Binding panel ----

  function buildBindingResultsHTML() {
    if (!state.analysis) return '';
    const { clauses } = state.analysis;
    const hasAnyBinding = clauses.some((c) => state.bindings[c]?.trim());
    if (!hasAnyBinding) {
      return `<p class="logic-binding-hint-noentry" data-testid="logic-binding-no-entry">${t('logic.binding.noBinding')}</p>`;
    }

    const vars = extractVarsFromBindings(state.bindings);
    const activeSet = getActiveSet();
    if (!activeSet) return '';

    const seenRows = new Set();
    const uniqueTests = activeSet.tests.filter((test) => {
      const key = `r${test.row.index}`;
      if (seenRows.has(key)) return false;
      seenRows.add(key);
      return true;
    });

    const rows = uniqueTests.map((test) => {
      const valStr = clauses.map((c) => `${c}=${test.row.values[c] ? 'T' : 'F'}`).join(', ');
      // Only include clauses that have a binding expression.
      const boundClauseValues = {};
      for (const c of clauses) {
        if (state.bindings[c]?.trim()) boundClauseValues[c] = test.row.values[c];
      }
      const constraintStr = buildConstraintStr(boundClauseValues, state.bindings);
      const result = solveBinding({
        clauseValues: boundClauseValues,
        bindings: state.bindings,
        searchRange: state.bindingRange,
      });
      const witnessCell = result.witness
        ? `<code class="logic-binding-witness" data-testid="logic-binding-witness-${test.row.index}">${escapeHtml(formatWitnessStr(result.witness))}</code>`
        : `<span class="logic-binding-infeasible" data-testid="logic-binding-infeasible-${test.row.index}">${t('logic.binding.infeasible')}</span>`;
      return `
        <tr data-testid="logic-binding-row-${test.row.index}">
          <td class="logic-binding-td-index">#${test.row.index}</td>
          <td class="logic-binding-td-vals">${escapeHtml(valStr)}</td>
          <td class="logic-binding-td-constraint"><code>${escapeHtml(constraintStr)}</code></td>
          <td class="logic-binding-td-witness">${witnessCell}</td>
        </tr>
      `;
    }).join('');

    const varList = vars.length ? `<span class="logic-binding-vars">${t('logic.binding.vars')} <code>${escapeHtml(vars.join(', '))}</code></span>` : '';
    return `
      ${varList}
      <table class="logic-binding-table" data-testid="logic-binding-table">
        <thead>
          <tr>
            <th>${t('logic.binding.col.row')}</th>
            <th>${t('logic.binding.col.vals')}</th>
            <th>${t('logic.binding.col.constraint')}</th>
            <th>${t('logic.binding.col.witness')}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function activePredicateExample() {
    return logicCoveragePredicates.find((p) => p.expression === state.expression) || null;
  }

  function renderBindingPanel() {
    if (!state.analysis || state.error) return '';
    const { clauses } = state.analysis;
    const example = activePredicateExample();
    const hasDefaults = example?.defaultBindings &&
      clauses.some((c) => example.defaultBindings[c]);

    const inputRows = clauses.map((c) => `
      <label class="logic-binding-clause-row">
        <span class="logic-binding-clause-name" aria-label="${t('logic.binding.clause')} ${escapeHtml(c)}">${escapeHtml(c)}</span>
        <span class="logic-binding-arrow" aria-hidden="true">↦</span>
        <input
          type="text"
          class="logic-binding-expr-input"
          data-testid="logic-binding-input-${escapeHtml(c)}"
          data-binding-clause="${escapeHtml(c)}"
          value="${escapeHtml(state.bindings[c] || '')}"
          placeholder="${t('logic.binding.placeholder')}"
          spellcheck="false"
          autocomplete="off"
          aria-label="${t('logic.binding.clause')} ${escapeHtml(c)}"
        />
      </label>
    `).join('');

    const restoreBtn = hasDefaults
      ? `<button type="button" class="logic-binding-restore-btn"
           data-testid="logic-binding-restore"
           title="${t('logic.binding.restore')}">${t('logic.binding.restore')}</button>`
      : '';

    const paramsHint = example?.bindingParams
      ? `<span class="logic-binding-params-hint">${t('logic.binding.params')} <code>${escapeHtml(example.bindingParams)}</code></span>`
      : '';

    return `
      <details class="logic-binding" data-testid="logic-binding" open>
        <summary class="logic-binding-summary">${t('logic.binding.title')}</summary>
        <p class="logic-binding-desc">${t('logic.binding.hint')}</p>
        <div class="logic-binding-inputs" data-testid="logic-binding-inputs">
          ${inputRows}
          ${restoreBtn}
        </div>
        ${paramsHint}
        <div class="logic-binding-range-row">
          <span class="logic-binding-range-label">${t('logic.binding.range')}</span>
          <input type="number" class="logic-binding-range-input" data-testid="logic-binding-range-min"
            data-binding-range="min" value="${state.bindingRange[0]}" min="-1000" max="0" step="1" />
          <span class="logic-binding-range-sep">${t('logic.binding.rangeTo')}</span>
          <input type="number" class="logic-binding-range-input" data-testid="logic-binding-range-max"
            data-binding-range="max" value="${state.bindingRange[1]}" min="0" max="1000" step="1" />
        </div>
        <div class="logic-binding-results" data-testid="logic-binding-results">
          ${buildBindingResultsHTML()}
        </div>
      </details>
    `;
  }

  function refreshBindingResults() {
    const el = root.querySelector('[data-testid="logic-binding-results"]');
    if (el) el.innerHTML = buildBindingResultsHTML();
  }

  // ---- end Clause Binding panel ----

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
        // Auto-fill bindings from defaultBindings when available.
        const example = activePredicateExample();
        if (example?.defaultBindings) {
          state.bindings = { ...example.defaultBindings };
        }
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

    // Binding inputs — update results section only (no full re-render → no focus loss).
    let bindingTimer = null;
    root.querySelectorAll('[data-binding-clause]').forEach((input) => {
      input.addEventListener('input', () => {
        const clause = input.dataset.bindingClause;
        state.bindings[clause] = input.value;
        if (bindingTimer) clearTimeout(bindingTimer);
        bindingTimer = setTimeout(() => refreshBindingResults(), 200);
      });
    });

    // Restore defaults button.
    const restoreBtn = root.querySelector('[data-testid="logic-binding-restore"]');
    if (restoreBtn) {
      restoreBtn.addEventListener('click', () => {
        const example = activePredicateExample();
        if (example?.defaultBindings) {
          state.bindings = { ...example.defaultBindings };
          render();
        }
      });
    }

    // Search range inputs.
    root.querySelectorAll('[data-binding-range]').forEach((input) => {
      input.addEventListener('change', () => {
        const v = parseInt(input.value, 10);
        if (Number.isNaN(v)) return;
        if (input.dataset.bindingRange === 'min') {
          state.bindingRange = [Math.min(v, state.bindingRange[1] - 1), state.bindingRange[1]];
        } else {
          state.bindingRange = [state.bindingRange[0], Math.max(v, state.bindingRange[0] + 1)];
        }
        refreshBindingResults();
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

  if (cloudClient && typeof cloudClient.subscribeAuthState === 'function') {
    cloudClient.subscribeAuthState(async (user) => {
      state.cloudUser = user || null;
      if (!user || typeof cloudClient.loadLogicRecent !== 'function') {
        return;
      }
      try {
        const remote = await cloudClient.loadLogicRecent(user.uid);
        const merged = [];
        const seen = new Set();
        [...remote, ...state.recent].forEach((expr) => {
          if (typeof expr !== 'string') return;
          if (seen.has(expr)) return;
          seen.add(expr);
          merged.push(expr);
        });
        const next = merged.slice(0, RECENT_LIMIT);
        const changed = next.length !== state.recent.length
          || next.some((v, i) => v !== state.recent[i]);
        state.recent = next;
        saveRecent(state.recent);
        // If local had entries missing in cloud, persist the merge.
        if (next.length !== remote.length || next.some((v, i) => v !== remote[i])) {
          pushRecentToCloud(state.recent);
        }
        if (changed) render();
      } catch {
        // Ignore cloud read errors
      }
    });
  }

  return root;
}
