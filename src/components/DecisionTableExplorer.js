import { t } from '../i18n/index.js';
import { generateDecisionTableTests, validateDecisionTable } from '../utils/blackboxTesting.js';

const STORAGE_KEY = 'stvisual.dt.v1';

// Each condition has values: 'T'/'F' or 'Y'/'N' or '–' (wildcard/don't-care)
const EXAMPLES = [
  {
    id: 'login',
    name: 'Login System',
    conditions: [
      { id: 'c1', name: 'Valid username', values: ['T', 'F'] },
      { id: 'c2', name: 'Valid password', values: ['T', 'F'] },
      { id: 'c3', name: 'Account locked', values: ['T', 'F'] },
    ],
    actions: [
      { id: 'a1', name: 'Grant access' },
      { id: 'a2', name: 'Show error' },
      { id: 'a3', name: 'Show lockout message' },
    ],
    rules: [
      { id: 'r1', conditions: { c1: 'T', c2: 'T', c3: 'F' }, actions: ['a1'] },
      { id: 'r2', conditions: { c1: 'T', c2: 'T', c3: 'T' }, actions: ['a3'] },
      { id: 'r3', conditions: { c1: 'T', c2: 'F', c3: '–' }, actions: ['a2'] },
      { id: 'r4', conditions: { c1: 'F', c2: '–', c3: '–' }, actions: ['a2'] },
    ],
  },
  {
    id: 'insurance',
    name: 'Insurance Premium',
    conditions: [
      { id: 'c1', name: 'Age ≥ 25', values: ['T', 'F'] },
      { id: 'c2', name: 'Good driving record', values: ['T', 'F'] },
      { id: 'c3', name: 'Insured > 1 year', values: ['T', 'F'] },
    ],
    actions: [
      { id: 'a1', name: '25% discount' },
      { id: 'a2', name: '10% discount' },
      { id: 'a3', name: 'Standard rate' },
      { id: 'a4', name: '10% surcharge' },
    ],
    rules: [
      { id: 'r1', conditions: { c1: 'T', c2: 'T', c3: 'T' }, actions: ['a1'] },
      { id: 'r2', conditions: { c1: 'T', c2: 'T', c3: 'F' }, actions: ['a2'] },
      { id: 'r3', conditions: { c1: 'T', c2: 'F', c3: 'T' }, actions: ['a2'] },
      { id: 'r4', conditions: { c1: 'T', c2: 'F', c3: 'F' }, actions: ['a3'] },
      { id: 'r5', conditions: { c1: 'F', c2: 'T', c3: '–' }, actions: ['a3'] },
      { id: 'r6', conditions: { c1: 'F', c2: 'F', c3: '–' }, actions: ['a4'] },
    ],
  },
  {
    id: 'shipping',
    name: 'Shipping Cost',
    conditions: [
      { id: 'c1', name: 'Weight ≤ 5 kg', values: ['T', 'F'] },
      { id: 'c2', name: 'Domestic', values: ['T', 'F'] },
      { id: 'c3', name: 'Express', values: ['T', 'F'] },
    ],
    actions: [
      { id: 'a1', name: '$5 flat' },
      { id: 'a2', name: '$10 standard' },
      { id: 'a3', name: '$15 express' },
      { id: 'a4', name: '$20 international' },
      { id: 'a5', name: '$40 intl express' },
    ],
    rules: [
      { id: 'r1', conditions: { c1: 'T', c2: 'T', c3: 'F' }, actions: ['a1'] },
      { id: 'r2', conditions: { c1: 'T', c2: 'T', c3: 'T' }, actions: ['a2'] },
      { id: 'r3', conditions: { c1: 'F', c2: 'T', c3: 'F' }, actions: ['a2'] },
      { id: 'r4', conditions: { c1: 'F', c2: 'T', c3: 'T' }, actions: ['a3'] },
      { id: 'r5', conditions: { c1: 'T', c2: 'F', c3: 'F' }, actions: ['a4'] },
      { id: 'r6', conditions: { c1: 'T', c2: 'F', c3: 'T' }, actions: ['a5'] },
      { id: 'r7', conditions: { c1: 'F', c2: 'F', c3: '–'  }, actions: ['a5'] },
    ],
  },
];

function esc(v = '') {
  return String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

function loadSaved() {
  try { return JSON.parse(globalThis.localStorage?.getItem(STORAGE_KEY) ?? 'null'); } catch { return null; }
}
function persist(state) {
  try { globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify({ exampleId: state.exampleId, conditions: state.conditions, actions: state.actions, rules: state.rules })); } catch {}
}

export function createDecisionTableExplorer() {
  const root = document.createElement('div');
  root.className = 'dt-explorer';
  root.dataset.testid = 'dt-explorer';

  const saved = loadSaved();
  const defaultEx = EXAMPLES[0];
  const state = {
    exampleId: saved?.exampleId ?? defaultEx.id,
    conditions: saved?.conditions ? deepClone(saved.conditions) : deepClone(defaultEx.conditions),
    actions:    saved?.actions    ? deepClone(saved.actions)    : deepClone(defaultEx.actions),
    rules:      saved?.rules      ? deepClone(saved.rules)      : deepClone(defaultEx.rules),
  };

  let nextCondId = 10;
  let nextActId  = 10;
  let nextRuleId = 10;

  function renderTable() {
    const tests = generateDecisionTableTests(state.conditions, state.actions, state.rules);
    const validation = validateDecisionTable(state.conditions, state.rules);

    const condHead = state.conditions.map((c) => `<th class="dt-cond-head">${esc(c.name)}</th>`).join('');
    const actHead  = state.actions.map((a) => `<th class="dt-act-head">${esc(a.name)}</th>`).join('');

    const rows = tests.map((tc, i) => {
      const rule = state.rules[i];
      const condCells = state.conditions.map((c) => {
        const val = tc.conditions[c.id] ?? '–';
        const cls = val === 'T' || val === 'Y' ? ' dt-val-true'
                  : val === 'F' || val === 'N' ? ' dt-val-false'
                  : ' dt-val-dc';
        return `<td class="dt-cell${cls}">${esc(val)}</td>`;
      }).join('');
      const actCells = state.actions.map((a) => {
        const fires = tc.actions.includes(a.id);
        return `<td class="dt-cell${fires ? ' dt-act-fire' : ''}">${fires ? '✓' : ''}</td>`;
      }).join('');
      return `<tr class="dt-row" data-testid="dt-row-${i}">
        <td class="dt-rule-label">${esc(tc.label)}</td>
        ${condCells}
        <td class="dt-separator"></td>
        ${actCells}
        <td>
          <button class="dt-del-rule-btn" data-del-rule="${i}" aria-label="${t('common.remove')}"
            ${state.rules.length <= 1 ? 'disabled' : ''}>×</button>
        </td>
      </tr>`;
    }).join('');

    const dupMsg = validation.duplicate.length
      ? `<span class="dt-warn">⚠ ${t('dt.warn.duplicate')}: ${validation.duplicate.join(', ')}</span>`
      : '';

    return `<div class="dt-table-wrap" data-testid="dt-table-wrap">
      <table class="dt-table" data-testid="dt-table">
        <thead>
          <tr>
            <th class="dt-rule-label-head">${t('dt.table.rule')}</th>
            ${condHead}
            <th class="dt-separator-head"></th>
            ${actHead}
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="dt-meta">
        <span class="dt-coverage-badge" data-testid="dt-coverage">${t('dt.coverage')}: ${validation.covered}/${validation.total}</span>
        ${dupMsg}
        <button class="dt-add-rule-btn" data-testid="dt-add-rule">+ ${t('dt.rule.add')}</button>
      </div>
    </div>`;
  }

  function renderConditions() {
    return state.conditions.map((c, i) => `
      <div class="dt-cond-block" data-testid="dt-cond-${i}">
        <input class="dt-cond-name" data-cidx="${i}" value="${esc(c.name)}"
          placeholder="${t('dt.condition.name')}" data-testid="dt-cond-name-${i}"/>
        <button class="dt-del-cond-btn" data-del-cond="${i}" aria-label="${t('common.remove')}"
          ${state.conditions.length <= 1 ? 'disabled' : ''} data-testid="dt-del-cond-${i}">×</button>
      </div>
    `).join('');
  }

  function renderActions() {
    return state.actions.map((a, i) => `
      <div class="dt-act-block" data-testid="dt-action-${i}">
        <input class="dt-act-name" data-aidx="${i}" value="${esc(a.name)}"
          placeholder="${t('dt.action.name')}" data-testid="dt-act-name-${i}"/>
        <button class="dt-del-act-btn" data-del-act="${i}" aria-label="${t('common.remove')}"
          ${state.actions.length <= 1 ? 'disabled' : ''} data-testid="dt-del-act-${i}">×</button>
      </div>
    `).join('');
  }

  function render() {
    const exBtns = EXAMPLES.map((ex) => `
      <button type="button" class="dt-example-btn${state.exampleId === ex.id ? ' active' : ''}"
        data-dt-example="${ex.id}" data-testid="dt-example-${ex.id}">${esc(ex.name)}</button>
    `).join('');

    root.innerHTML = `
      <div class="dt-panel">
        <div class="dt-toolbar">
          <div class="dt-examples" data-testid="dt-examples">${exBtns}</div>
        </div>

        <div class="dt-body">
          <div class="dt-input-pane">
            <div class="dt-section">
              <h4>${t('dt.conditions.title')}</h4>
              <div class="dt-cond-list">${renderConditions()}</div>
              <button class="dt-add-cond-btn" data-testid="dt-add-cond"
                ${state.conditions.length >= 6 ? 'disabled' : ''}>
                + ${t('dt.condition.add')}
              </button>
            </div>
            <div class="dt-section">
              <h4>${t('dt.actions.title')}</h4>
              <div class="dt-act-list">${renderActions()}</div>
              <button class="dt-add-act-btn" data-testid="dt-add-act"
                ${state.actions.length >= 6 ? 'disabled' : ''}>
                + ${t('dt.action.add')}
              </button>
            </div>
            <p class="dt-hint">${t('dt.hint')}</p>
          </div>

          <div class="dt-results-pane" data-testid="dt-results">
            <h3>${t('dt.results.title')}
              <span class="dt-count">${state.rules.length} ${t('dt.results.count')}</span>
            </h3>
            ${renderTable()}
          </div>
        </div>
      </div>
    `;

    bindEvents();
    persist(state);
  }

  function addDefaultRule() {
    const conditions = {};
    for (const c of state.conditions) conditions[c.id] = 'T';
    state.rules.push({ id: `r${nextRuleId++}`, conditions, actions: [] });
  }

  function bindEvents() {
    root.querySelectorAll('[data-dt-example]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ex = EXAMPLES.find((e) => e.id === btn.dataset.dtExample);
        if (!ex) return;
        state.exampleId = ex.id;
        state.conditions = deepClone(ex.conditions);
        state.actions    = deepClone(ex.actions);
        state.rules      = deepClone(ex.rules);
        render();
      });
    });

    root.querySelectorAll('.dt-cond-name').forEach((inp) => {
      inp.addEventListener('input', (e) => {
        state.conditions[Number(e.target.dataset.cidx)].name = e.target.value;
        refreshResults();
        persist(state);
      });
    });

    root.querySelectorAll('.dt-act-name').forEach((inp) => {
      inp.addEventListener('input', (e) => {
        state.actions[Number(e.target.dataset.aidx)].name = e.target.value;
        refreshResults();
        persist(state);
      });
    });

    root.querySelectorAll('[data-del-cond]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.delCond);
        const cid = state.conditions[idx].id;
        state.conditions.splice(idx, 1);
        for (const r of state.rules) delete r.conditions[cid];
        render();
      });
    });

    root.querySelectorAll('[data-del-act]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.delAct);
        const aid = state.actions[idx].id;
        state.actions.splice(idx, 1);
        for (const r of state.rules) r.actions = r.actions.filter((a) => a !== aid);
        render();
      });
    });

    root.querySelector('[data-testid="dt-add-cond"]')?.addEventListener('click', () => {
      if (state.conditions.length >= 6) return;
      const id = `c${nextCondId++}`;
      state.conditions.push({ id, name: `Condition ${state.conditions.length + 1}`, values: ['T', 'F'] });
      for (const r of state.rules) r.conditions[id] = 'T';
      render();
    });

    root.querySelector('[data-testid="dt-add-act"]')?.addEventListener('click', () => {
      if (state.actions.length >= 6) return;
      const id = `a${nextActId++}`;
      state.actions.push({ id, name: `Action ${state.actions.length + 1}` });
      render();
    });

    root.querySelector('[data-testid="dt-add-rule"]')?.addEventListener('click', () => {
      addDefaultRule();
      render();
    });

    root.querySelectorAll('[data-del-rule]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.rules.splice(Number(btn.dataset.delRule), 1);
        render();
      });
    });

    // Inline editing: clicking a condition cell cycles T → F → – → T
    root.querySelectorAll('.dt-cell.dt-val-true, .dt-cell.dt-val-false, .dt-cell.dt-val-dc').forEach((td) => {
      td.addEventListener('click', () => {
        const row = td.closest('tr');
        if (!row) return;
        const ruleIdx = [...root.querySelectorAll('tbody tr')].indexOf(row);
        const allCells = [...row.querySelectorAll('.dt-cell[class*="dt-val"]')];
        const colIdx = allCells.indexOf(td);
        if (ruleIdx < 0 || colIdx < 0) return;
        const cid = state.conditions[colIdx]?.id;
        if (!cid) return;
        const cur = state.rules[ruleIdx].conditions[cid];
        const cycle = { 'T': 'F', 'F': '–', '–': 'T' };
        state.rules[ruleIdx].conditions[cid] = cycle[cur] ?? 'T';
        refreshResults();
        persist(state);
      });
    });

    // Clicking an action cell toggles it
    root.querySelectorAll('.dt-cell.dt-act-fire, .dt-cell:not([class*="dt-val"]):not(.dt-separator):not(.dt-rule-label)').forEach((td) => {
      if (!td.closest('tbody')) return;
      const row = td.closest('tr');
      if (!row) return;
      const ruleIdx = [...root.querySelectorAll('tbody tr')].indexOf(row);
      if (ruleIdx < 0) return;
      const condCells = row.querySelectorAll('[class*="dt-val"]').length;
      const allTds = [...row.querySelectorAll('td')];
      const tdIdx = allTds.indexOf(td);
      // +1 for rule label, +condCells for conditions, +1 for separator → action starts at condCells+2
      const actColIdx = tdIdx - condCells - 2;
      if (actColIdx < 0 || actColIdx >= state.actions.length) return;
      const aid = state.actions[actColIdx]?.id;
      if (!aid) return;
      const r = state.rules[ruleIdx];
      if (r.actions.includes(aid)) r.actions = r.actions.filter((a) => a !== aid);
      else r.actions.push(aid);
      refreshResults();
      persist(state);
    });
  }

  function refreshResults() {
    const pane = root.querySelector('[data-testid="dt-results"]');
    if (pane) {
      pane.innerHTML = `<h3>${t('dt.results.title')}
        <span class="dt-count">${state.rules.length} ${t('dt.results.count')}</span>
      </h3>${renderTable()}`;
      // Re-bind click handlers inside the refreshed pane
      pane.querySelectorAll('[data-del-rule]').forEach((btn) => {
        btn.addEventListener('click', () => { state.rules.splice(Number(btn.dataset.delRule), 1); render(); });
      });
      pane.querySelector('[data-testid="dt-add-rule"]')?.addEventListener('click', () => { addDefaultRule(); render(); });
      pane.querySelectorAll('.dt-cell.dt-val-true, .dt-cell.dt-val-false, .dt-cell.dt-val-dc').forEach((td) => {
        td.addEventListener('click', () => {
          const row = td.closest('tr');
          if (!row) return;
          const ruleIdx = [...pane.querySelectorAll('tbody tr')].indexOf(row);
          const colIdx = [...row.querySelectorAll('.dt-cell[class*="dt-val"]')].indexOf(td);
          if (ruleIdx < 0 || colIdx < 0) return;
          const cid = state.conditions[colIdx]?.id;
          if (!cid) return;
          const cur = state.rules[ruleIdx].conditions[cid];
          const cycle = { 'T': 'F', 'F': '–', '–': 'T' };
          state.rules[ruleIdx].conditions[cid] = cycle[cur] ?? 'T';
          refreshResults();
          persist(state);
        });
      });
    }
  }

  render();
  return root;
}
