import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';
import {
  parseDNF,
  computeAutGroup,
  orbitPartition,
  determinationPairs,
  coveringArray,
  mrFromOrbit,
} from '../utils/groupTheory.js';

function escapeHtml(v = '') {
  return String(v)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

const ORBIT_COLORS = ['#dbeafe','#dcfce7','#fef9c3','#fce7f3','#ede9fe','#ffedd5','#cffafe','#f1f5f9'];
const ORBIT_TEXT   = ['#1e40af','#166534','#92400e','#9d174d','#5b21b6','#9a3412','#0e7490','#475569'];

// Preset formula examples
const EXAMPLES = [
  { labelKey: 'groupth.ex.and',  formula: 'A AND B' },
  { labelKey: 'groupth.ex.or',   formula: 'A OR B' },
  { labelKey: 'groupth.ex.s3',   formula: '(A AND B) OR (B AND C) OR (A AND C)' },
  { labelKey: 'groupth.ex.asym', formula: 'A AND NOT B' },
];

// Convert a permutation array to cycle-notation string, e.g. ['B','A','C'] → "(AB)"
function permToCycleStr(vars, perm) {
  const pi = perm.map(v => vars.indexOf(v));
  const visited = new Set();
  const cycles = [];
  for (let i = 0; i < vars.length; i++) {
    if (visited.has(i)) continue;
    if (pi[i] === i) { visited.add(i); continue; }
    const cycle = [];
    let cur = i;
    while (!visited.has(cur)) {
      visited.add(cur);
      cycle.push(vars[cur]);
      cur = pi[cur];
    }
    if (cycle.length > 1) cycles.push(`(${cycle.join('')})`);
  }
  return cycles.length ? cycles.join('') : 'id';
}

function maskToBools(mask, n) {
  return Array.from({ length: n }, (_, i) => !!(mask & (1 << (n - 1 - i))));
}

export function createGroupTheoryExplorer() {
  const root = document.createElement('div');
  root.dataset.testid = 'gth-explorer';

  let formula = 'A AND B';
  let activeTab = 'orbits';

  // Quiz state (Tab 1)
  const gthQuiz = { active: false, phase: 'question', answer: '' };
  // Lab Reflect state
  const gthLabReflect = { active: false, text: '' };

  // ── compute helpers ──────────────────────────────────────────────────────

  function computeOrbits() {
    const { vars, valid } = parseDNF(formula);
    if (!valid || vars.length === 0 || vars.length > 6) return null;
    const autGroup = computeAutGroup(vars, formula);
    const orbits = orbitPartition(vars, autGroup);
    return { vars, autGroup, orbits };
  }

  // ── render helpers ───────────────────────────────────────────────────────

  function renderAutGroup(vars, autGroup) {
    const order = autGroup.length;
    const nontrivial = autGroup.filter(p => permToCycleStr(vars, p) !== 'id');
    const permsHtml = nontrivial.length
      ? nontrivial.map(p => `<span class="gth-perm">${permToCycleStr(vars, p)}</span>`).join(' ')
      : `<span class="gth-perm gth-perm--id">${t('groupth.aut.id')}</span>`;
    return `
      <div class="gth-aut-card" data-testid="gth-aut-card">
        <p class="gth-aut-title">Aut(f)</p>
        <p class="gth-aut-order">${t('groupth.aut.order', { n: order })}</p>
        <div class="gth-perm-list">
          <span class="gth-perm gth-perm--id">id</span>
          ${permsHtml}
        </div>
        ${order === 1
          ? `<p class="gth-aut-hint">${t('groupth.aut.trivial')}</p>`
          : `<p class="gth-aut-hint">${t('groupth.aut.hint', { n: order })}</p>`}
      </div>`;
  }

  function renderOrbitTable(vars, autGroup, orbits) {
    const n = vars.length;
    const total = 1 << n;
    const saved = total - orbits.size;

    // Build orbit index map: reprMask → orbitIdx
    const orbitIdx = new Map();
    let idx = 0;
    for (const repr of orbits.keys()) orbitIdx.set(repr, idx++);

    // Build row mask → orbitRepr map
    const rowRepr = new Map();
    for (const [repr, members] of orbits) for (const m of members) rowRepr.set(m, repr);

    const headerVars = vars.map(v => `<th>${escapeHtml(v)}</th>`).join('');
    const rows = Array.from({ length: total }, (_, mask) => {
      const bools = maskToBools(mask, n);
      const repr = rowRepr.get(mask);
      const oi = orbitIdx.get(repr) % 8;
      const isRepr = mask === repr;
      const bg = ORBIT_COLORS[oi];
      const fg = ORBIT_TEXT[oi];
      const cells = bools.map(b => `<td>${b ? 'T' : 'F'}</td>`).join('');
      // formula result: recompute from mask
      const env = Object.fromEntries(vars.map((v, i) => [v, bools[i]]));
      const fval = computeFVal(env);
      return `<tr style="background:${bg};color:${fg}" data-testid="gth-row-${mask}">
        ${cells}
        <td style="font-weight:700">${fval ? 'T' : 'F'}</td>
        <td style="text-align:center">${orbitIdx.get(repr)}</td>
        <td style="text-align:center">${isRepr ? '★' : ''}</td>
      </tr>`;
    }).join('');

    const mr = [...orbits.entries()]
      .filter(([, members]) => members.length > 1)
      .map(([, members]) => `<li class="gth-mr-item">${escapeHtml(mrFromOrbit(members, vars))}</li>`)
      .join('');

    return `
      <div class="gth-orbits-summary" data-testid="gth-orbits-summary">
        <span>${t('groupth.orbits.total', { total })}</span>
        <span class="gth-badge gth-badge--blue">${t('groupth.orbits.count', { count: orbits.size })}</span>
        ${saved > 0 ? `<span class="gth-badge gth-badge--green">${t('groupth.orbits.savings', { saved })}</span>` : ''}
      </div>
      <div style="overflow-x:auto">
        <table class="gth-table" data-testid="gth-orbit-table">
          <thead><tr>${headerVars}<th>f(x)</th><th>${t('groupth.table.orbit')}</th><th>${t('groupth.table.repr')}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${mr ? `<details class="gth-mr-details"><summary>${t('groupth.mr.title')}</summary><ul class="gth-mr-list">${mr}</ul></details>` : ''}
      <button type="button" class="gth-copy-btn" data-testid="gth-copy">${t('groupth.copy.btn')}</button>`;
  }

  function computeFVal(env) {
    const { evaluateFormula } = window.__gth_eval__ || {};
    if (evaluateFormula) return evaluateFormula(formula, env);
    // fallback: import is static, use module-level
    return _evalFormula(formula, env);
  }

  // ── Quiz helpers ─────────────────────────────────────────────────────────

  function renderQuizPanel() {
    if (!gthQuiz.active) return '';
    if (gthQuiz.phase === 'graded') {
      const correct = 4; // (A AND B) OR (B AND C) OR (A AND C) → 4 orbits under S₃
      const userAns = parseInt(gthQuiz.answer, 10);
      const ok = userAns === correct;
      const shareEncoded = encodeResult({
        v: 1, explorer: 'groupth', explorerLabel: t('quiz.groupth.title'),
        mode: 'quiz', ts: Date.now(), lang: getLocale(),
        score: ok ? 1 : 0, total: 1,
        items: [{ q: t('quiz.groupth.prompt'), a: String(gthQuiz.answer), expected: String(correct), ok }],
      });
      return `
        <div class="quiz-panel" data-testid="gth-quiz-panel">
          <div class="quiz-header">
            <span>${t('quiz.groupth.title')}</span>
            <button type="button" class="quiz-close-btn" data-testid="gth-quiz-close">✕</button>
          </div>
          <p class="quiz-prompt">${t('quiz.groupth.prompt')}</p>
          <p class="quiz-score ${ok ? 'quiz-score--perfect' : 'quiz-score--wrong'}">
            ${ok ? t('quiz.graph.perfect') : ''}
            ${t('quiz.groupth.answer', { count: correct })}
          </p>
          <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="gth-quiz-share">📋 ${t('quiz.share.btn')}</button>
          <button type="button" class="quiz-start-btn" data-testid="gth-quiz-reset">${t('quiz.retry')}</button>
        </div>`;
    }
    return `
      <div class="quiz-panel" data-testid="gth-quiz-panel">
        <div class="quiz-header">
          <span>${t('quiz.groupth.title')}</span>
          <button type="button" class="quiz-close-btn" data-testid="gth-quiz-close">✕</button>
        </div>
        <p class="quiz-prompt">${t('quiz.groupth.prompt')}</p>
        <div class="quiz-bva-inputs">
          <label class="quiz-bva-field">
            ${t('quiz.groupth.label')}
            <input type="number" min="1" class="quiz-input" data-testid="gth-quiz-input" value="${escapeHtml(gthQuiz.answer)}" />
          </label>
        </div>
        <button type="button" class="quiz-submit-btn" data-testid="gth-quiz-submit">${t('quiz.submit')}</button>
      </div>`;
  }

  function renderLabReflectPanel() {
    if (!gthLabReflect.active) return '';
    const reflectEncoded = encodeResult({
      v: 1, explorer: 'groupth', explorerLabel: t('section.groupth'),
      mode: 'lab-reflect', ts: Date.now(), lang: getLocale(),
      score: 1, total: 1,
      items: [
        { q: t('lab.reflect.q.groupth.1'), a: gthLabReflect.text, ok: true },
        { q: t('lab.reflect.q.groupth.2'), a: '', ok: true },
      ],
    });
    return `
      <div class="quiz-panel" data-testid="gth-lab-reflect-panel">
        <div class="quiz-header">
          <span>${t('lab.reflect.title')}</span>
          <button type="button" class="quiz-close-btn" data-testid="gth-lab-reflect-close">✕</button>
        </div>
        <p class="quiz-prompt">${t('lab.reflect.q.groupth.1')}</p>
        <p class="quiz-prompt" style="margin-top:.5rem">${t('lab.reflect.q.groupth.2')}</p>
        <textarea class="quiz-reflect-area" data-testid="gth-lab-reflect-text" rows="4">${escapeHtml(gthLabReflect.text)}</textarea>
        <button type="button" class="quiz-share-btn" data-share-payload="${reflectEncoded}" data-testid="gth-lab-reflect-share">📋 ${t('lab.reflect.record')}</button>
      </div>`;
  }

  // ── main render ──────────────────────────────────────────────────────────

  function render() {
    const result = computeOrbits();
    const { vars, valid } = parseDNF(formula);

    let orbitContent = '';
    let autContent = '';
    if (!valid || vars.length === 0) {
      orbitContent = `<p class="gth-error">${t('groupth.error.invalid')}</p>`;
    } else if (vars.length > 6) {
      orbitContent = `<p class="gth-error">${t('groupth.error.toomany')}</p>`;
    } else {
      const { autGroup, orbits } = result;
      autContent = renderAutGroup(vars, autGroup);
      orbitContent = renderOrbitTable(vars, autGroup, orbits);
    }

    const metricData = result
      ? { orbits: result.orbits.size, total: 1 << result.vars.length, autOrder: result.autGroup.length }
      : { orbits: 0, total: 0, autOrder: 0 };
    const metricEncoded = encodeResult({
      v: 1, explorer: 'groupth', explorerLabel: t('section.groupth'),
      mode: 'lab-metric', ts: Date.now(), lang: getLocale(),
      score: 1, total: 1,
      items: [{ q: `Orbits: ${metricData.orbits}/${metricData.total} · |Aut(f)|=${metricData.autOrder}`, a: String(metricData.orbits), ok: true }],
    });

    root.innerHTML = `
      <div class="gth-explorer">
        <div class="gth-input-card">
          <label class="gth-label">${t('groupth.formula.label')}</label>
          <div class="gth-input-row">
            <input class="gth-formula-input" data-testid="gth-formula-input"
              value="${escapeHtml(formula)}"
              placeholder="${t('groupth.formula.placeholder')}" />
          </div>
          <div class="gth-examples">
            ${EXAMPLES.map(ex => `<button type="button" class="gth-example-btn" data-formula="${escapeHtml(ex.formula)}">${t(ex.labelKey)}</button>`).join('')}
          </div>
        </div>

        <nav class="gth-tab-row" role="tablist" data-testid="gth-tab-row">
          <button class="gth-tab-btn ${activeTab === 'orbits' ? 'gth-tab-btn--active' : ''}" role="tab" data-tab="orbits">${t('groupth.tab.orbits')}</button>
          <button class="gth-tab-btn ${activeTab === 'cacc' ? 'gth-tab-btn--active' : ''}" role="tab" data-tab="cacc">${t('groupth.tab.cacc')}</button>
          <button class="gth-tab-btn ${activeTab === 'covarray' ? 'gth-tab-btn--active' : ''}" role="tab" data-tab="covarray">${t('groupth.tab.covarray')}</button>
        </nav>

        <div class="gth-tab-pane" data-testid="gth-tab-pane">
          ${activeTab === 'orbits' ? `
            <div class="gth-orbits-layout">
              ${autContent}
              <div class="gth-orbits-main" data-testid="gth-orbits-main">${orbitContent}</div>
            </div>` : ''}
          ${activeTab === 'cacc' ? `<p class="gth-stub" data-testid="gth-cacc-stub">${t('groupth.stub.cacc')}</p>` : ''}
          ${activeTab === 'covarray' ? `<p class="gth-stub" data-testid="gth-covarray-stub">${t('groupth.stub.covarray')}</p>` : ''}
        </div>

        <div class="gth-bottom-card">
          <div class="gth-bottom-header">
            <h4 class="gth-bottom-title">${t('section.groupth')}</h4>
            <div class="gth-bottom-actions">
              ${!gthQuiz.active ? `<button type="button" class="quiz-start-btn" data-testid="gth-quiz-start">${t('quiz.start')}</button>` : ''}
              ${!gthLabReflect.active ? `<button type="button" class="quiz-start-btn" data-testid="gth-lab-reflect-start">${t('lab.reflect.start')}</button>` : ''}
              <button type="button" class="quiz-share-btn" data-share-payload="${metricEncoded}" data-testid="gth-lab-metric">📊 ${t('lab.metric.record')}</button>
            </div>
          </div>
          ${renderQuizPanel()}
          ${renderLabReflectPanel()}
        </div>

        <p class="gth-hint">${t('groupth.hint')}</p>
      </div>`;

    bindEvents();
  }

  // ── event binding ────────────────────────────────────────────────────────

  function bindEvents() {
    // Formula input (debounced re-render on change)
    const inp = root.querySelector('[data-testid="gth-formula-input"]');
    if (inp) {
      inp.addEventListener('change', () => {
        formula = inp.value;
        render();
      });
    }

    // Example buttons
    root.querySelectorAll('.gth-example-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        formula = btn.dataset.formula;
        render();
      });
    });

    // Tab switching
    root.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        render();
      });
    });

    // Copy representative tests
    const copyBtn = root.querySelector('[data-testid="gth-copy"]');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const result = computeOrbits();
        if (!result) return;
        const { vars, orbits } = result;
        const n = vars.length;
        const header = vars.join('\t') + '\tf(x)';
        const rows = [...orbits.keys()].map(repr => {
          const bools = maskToBools(repr, n);
          const env = Object.fromEntries(vars.map((v, i) => [v, bools[i]]));
          const fv = _evalFormula(formula, env);
          return bools.map(b => b ? 'T' : 'F').join('\t') + '\t' + (fv ? 'T' : 'F');
        });
        navigator.clipboard?.writeText([header, ...rows].join('\n')).then(() => {
          copyBtn.textContent = t('groupth.copy.done');
          setTimeout(() => { copyBtn.textContent = t('groupth.copy.btn'); }, 1500);
        });
      });
    }

    // Quiz
    root.querySelector('[data-testid="gth-quiz-start"]')?.addEventListener('click', () => {
      gthQuiz.active = true; gthQuiz.phase = 'question'; gthQuiz.answer = ''; render();
    });
    root.querySelector('[data-testid="gth-quiz-close"]')?.addEventListener('click', () => {
      gthQuiz.active = false; render();
    });
    root.querySelector('[data-testid="gth-quiz-reset"]')?.addEventListener('click', () => {
      gthQuiz.phase = 'question'; gthQuiz.answer = ''; render();
    });
    root.querySelector('[data-testid="gth-quiz-input"]')?.addEventListener('input', e => {
      gthQuiz.answer = e.target.value;
    });
    root.querySelector('[data-testid="gth-quiz-submit"]')?.addEventListener('click', () => {
      gthQuiz.phase = 'graded'; render();
    });

    // Lab Reflect
    root.querySelector('[data-testid="gth-lab-reflect-start"]')?.addEventListener('click', () => {
      gthLabReflect.active = true; render();
    });
    root.querySelector('[data-testid="gth-lab-reflect-close"]')?.addEventListener('click', () => {
      gthLabReflect.active = false; render();
    });
    root.querySelector('[data-testid="gth-lab-reflect-text"]')?.addEventListener('input', e => {
      gthLabReflect.text = e.target.value;
    });

    // Share buttons
    root.querySelectorAll('[data-share-payload]').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = (window.__buildShareUrl__ || (() => btn.dataset.sharePayload))(btn.dataset.sharePayload);
        navigator.clipboard?.writeText(url);
      });
    });
  }

  render();
  return root;
}

// Module-level formula evaluator (avoids circular dynamic import)
function _evalFormula(formula, env) {
  try {
    // Build a simple evaluator inline to avoid dynamic import issues
    const tokens = _tokenize(formula);
    if (!tokens.length) return null;
    const ast = _parse(tokens);
    return _eval(ast, env);
  } catch { return null; }
}

function _tokenize(str) {
  const tokens = [];
  let i = 0;
  while (i < str.length) {
    if (/\s/.test(str[i])) { i++; continue; }
    if (str[i] === '(') { tokens.push({ type: 'LP' }); i++; }
    else if (str[i] === ')') { tokens.push({ type: 'RP' }); i++; }
    else {
      let w = '';
      while (i < str.length && /\w/.test(str[i])) w += str[i++];
      if (w === 'AND') tokens.push({ type: 'AND' });
      else if (w === 'OR') tokens.push({ type: 'OR' });
      else if (w === 'NOT') tokens.push({ type: 'NOT' });
      else if (w) tokens.push({ type: 'ATOM', value: w });
    }
  }
  return tokens;
}

function _parse(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];
  function primary() {
    const t = peek();
    if (!t) throw new Error('EOF');
    if (t.type === 'LP') { consume(); const n = expr(); consume(); return n; }
    if (t.type === 'ATOM') { consume(); return { type: 'ATOM', v: t.value }; }
    throw new Error('bad token');
  }
  function not_() {
    if (peek()?.type === 'NOT') { consume(); return { type: 'NOT', c: not_() }; }
    return primary();
  }
  function and_() {
    let l = not_();
    while (peek()?.type === 'AND') { consume(); l = { type: 'AND', l, r: not_() }; }
    return l;
  }
  function expr() {
    let l = and_();
    while (peek()?.type === 'OR') { consume(); l = { type: 'OR', l, r: and_() }; }
    return l;
  }
  return expr();
}

function _eval(node, env) {
  if (node.type === 'ATOM') return !!env[node.v];
  if (node.type === 'NOT')  return !_eval(node.c, env);
  if (node.type === 'AND')  return _eval(node.l, env) && _eval(node.r, env);
  if (node.type === 'OR')   return _eval(node.l, env) || _eval(node.r, env);
  return false;
}
