import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';

// L2 — FSM Test Generation Explorer.
// StateTransitionExplorer only *counts* coverage; this Explorer actually
// generates executable event sequences from the model and contrasts four
// model-coverage criteria by suite size. A Chinese-Postman transition tour
// shows the shortest closed walk that fires every transition.

const FSMS = [
  {
    id: 'login',
    states: [
      { id: 's1', name: 'Start', initial: true },
      { id: 's2', name: 'AwaitingCreds' },
      { id: 's3', name: 'Authenticating' },
      { id: 's4', name: 'LoggedIn' },
      { id: 's5', name: 'Locked' },
    ],
    transitions: [
      { id: 't1', from: 's1', to: 's2', event: 'open' },
      { id: 't2', from: 's2', to: 's3', event: 'submit' },
      { id: 't3', from: 's3', to: 's4', event: 'valid' },
      { id: 't4', from: 's3', to: 's2', event: 'invalid' },
      { id: 't5', from: 's3', to: 's5', event: 'tooManyTries' },
      { id: 't6', from: 's4', to: 's1', event: 'logout' },
      { id: 't7', from: 's5', to: 's1', event: 'resetByAdmin' },
    ],
  },
  {
    id: 'atm',
    states: [
      { id: 's1', name: 'Idle', initial: true },
      { id: 's2', name: 'CardInserted' },
      { id: 's3', name: 'PINEntered' },
      { id: 's4', name: 'MenuShown' },
      { id: 's5', name: 'Dispensing' },
    ],
    transitions: [
      { id: 't1', from: 's1', to: 's2', event: 'insertCard' },
      { id: 't2', from: 's2', to: 's3', event: 'enterPIN' },
      { id: 't3', from: 's3', to: 's4', event: 'pinCorrect' },
      { id: 't4', from: 's3', to: 's2', event: 'pinWrong' },
      { id: 't5', from: 's4', to: 's5', event: 'withdraw' },
      { id: 't6', from: 's5', to: 's1', event: 'done' },
      { id: 't7', from: 's2', to: 's1', event: 'cancel' },
      { id: 't8', from: 's4', to: 's1', event: 'cancelAtMenu' },
    ],
  },
  {
    id: 'vending',
    states: [
      { id: 's1', name: 'Idle', initial: true },
      { id: 's2', name: 'HasCoins' },
      { id: 's3', name: 'Selected' },
      { id: 's4', name: 'Dispensing' },
    ],
    transitions: [
      { id: 't1', from: 's1', to: 's2', event: 'insertCoin' },
      { id: 't2', from: 's2', to: 's2', event: 'insertMore' },
      { id: 't3', from: 's2', to: 's3', event: 'selectItem' },
      { id: 't4', from: 's3', to: 's4', event: 'confirmPay' },
      { id: 't5', from: 's4', to: 's1', event: 'itemDispensed' },
      { id: 't6', from: 's2', to: 's1', event: 'cancel' },
      { id: 't7', from: 's3', to: 's2', event: 'clearSelection' },
    ],
  },
];

const CRITERIA = [
  { id: 'state', colorClass: 'fsmgen-crit--amber' },
  { id: 'transition', colorClass: 'fsmgen-crit--blue' },
  { id: 'pair', colorClass: 'fsmgen-crit--purple' },
  { id: 'roundtrip', colorClass: 'fsmgen-crit--green' },
];

// ── FSM helpers ──────────────────────────────────────────────────────────
function initialId(fsm) {
  return (fsm.states.find((s) => s.initial) || fsm.states[0]).id;
}
function outgoing(fsm, sid) {
  return fsm.transitions.filter((tr) => tr.from === sid);
}
function stateName(fsm, sid) {
  return (fsm.states.find((s) => s.id === sid) || {}).name || sid;
}
// BFS: nearest state from `src` whose id satisfies isGoal — returns
// { state, path:[transitions] }, or null when none reachable.
function bfsPath(fsm, src, isGoal) {
  const queue = [{ state: src, path: [] }];
  const seen = new Set([src]);
  while (queue.length) {
    const cur = queue.shift();
    if (isGoal(cur.state)) return cur;
    for (const tr of outgoing(fsm, cur.state)) {
      if (!seen.has(tr.to)) {
        seen.add(tr.to);
        queue.push({ state: tr.to, path: [...cur.path, tr] });
      }
    }
  }
  return null;
}
function pathToState(fsm, src, dest) {
  return bfsPath(fsm, src, (sid) => sid === dest);
}
// Drop test cases with an identical transition-id signature.
function dedupe(tests) {
  const seen = new Set();
  const out = [];
  for (const test of tests) {
    const key = test.map((tr) => tr.id).join(',');
    if (!seen.has(key)) {
      seen.add(key);
      out.push(test);
    }
  }
  return out;
}

// ── Generators (one test = an array of transitions from the initial state)
function genStateCoverage(fsm) {
  const init = initialId(fsm);
  const covered = new Set([init]);
  const tests = [];
  let guard = 0;
  while (covered.size < fsm.states.length && guard++ < 50) {
    const reached = bfsPath(fsm, init, (sid) => !covered.has(sid));
    if (!reached) break;
    reached.path.forEach((tr) => { covered.add(tr.from); covered.add(tr.to); });
    tests.push(reached.path);
  }
  return { obligations: fsm.states.length, tests: dedupe(tests) };
}

function genTransitionCoverage(fsm) {
  const init = initialId(fsm);
  const uncovered = new Set(fsm.transitions.map((tr) => tr.id));
  const tests = [];
  let guard = 0;
  while (uncovered.size && guard++ < 200) {
    const path = [];
    let cur = init;
    let advanced = true;
    while (advanced) {
      advanced = false;
      const reached = bfsPath(fsm, cur, (sid) =>
        outgoing(fsm, sid).some((tr) => uncovered.has(tr.id)));
      if (reached) {
        const fire = outgoing(fsm, reached.state).find((tr) => uncovered.has(tr.id));
        reached.path.forEach((tr) => path.push(tr));
        path.push(fire);
        uncovered.delete(fire.id);
        cur = fire.to;
        advanced = true;
      }
    }
    if (path.length) tests.push(path);
    else break;
  }
  return { obligations: fsm.transitions.length, tests: dedupe(tests) };
}

// Every (incoming, outgoing) transition pair through a state — Chow's switch.
function transitionPairs(fsm) {
  const pairs = [];
  for (const s of fsm.states) {
    const ins = fsm.transitions.filter((tr) => tr.to === s.id);
    const outs = fsm.transitions.filter((tr) => tr.from === s.id);
    for (const tin of ins) for (const tout of outs) pairs.push({ tin, tout });
  }
  return pairs;
}
function genTransitionPairCoverage(fsm) {
  const init = initialId(fsm);
  const pairs = transitionPairs(fsm);
  const tests = [];
  for (const { tin, tout } of pairs) {
    const pre = pathToState(fsm, init, tin.from);
    if (!pre) continue;
    tests.push([...pre.path, tin, tout]);
  }
  return { obligations: pairs.length, tests: dedupe(tests) };
}

// Every simple cycle, enumerated once via the smallest-index-start rule.
function findSimpleCycles(fsm) {
  const idx = Object.fromEntries(fsm.states.map((s, i) => [s.id, i]));
  const cycles = [];
  for (let si = 0; si < fsm.states.length && cycles.length < 60; si++) {
    const startId = fsm.states[si].id;
    const stack = [];
    const onPath = new Set([startId]);
    (function dfs(cur) {
      for (const tr of outgoing(fsm, cur)) {
        if (idx[tr.to] < si) continue;
        if (tr.to === startId) {
          cycles.push([...stack, tr]);
        } else if (!onPath.has(tr.to)) {
          onPath.add(tr.to);
          stack.push(tr);
          dfs(tr.to);
          stack.pop();
          onPath.delete(tr.to);
        }
      }
    })(startId);
  }
  return cycles;
}
function genRoundTrip(fsm) {
  const init = initialId(fsm);
  const cycles = findSimpleCycles(fsm);
  const tests = [];
  for (const cyc of cycles) {
    const pre = pathToState(fsm, init, cyc[0].from);
    if (!pre) continue;
    tests.push([...pre.path, ...cyc]);
  }
  return { obligations: cycles.length, tests: dedupe(tests) };
}

const GENERATORS = {
  state: genStateCoverage,
  transition: genTransitionCoverage,
  pair: genTransitionPairCoverage,
  roundtrip: genRoundTrip,
};

// ── Chinese Postman transition tour ──────────────────────────────────────
function allPairsShortest(fsm) {
  const dist = {};
  const paths = {};
  for (const s of fsm.states) {
    dist[s.id] = {};
    paths[s.id] = {};
    const queue = [{ state: s.id, path: [] }];
    const seen = new Set([s.id]);
    while (queue.length) {
      const cur = queue.shift();
      dist[s.id][cur.state] = cur.path.length;
      paths[s.id][cur.state] = cur.path;
      for (const tr of outgoing(fsm, cur.state)) {
        if (!seen.has(tr.to)) {
          seen.add(tr.to);
          queue.push({ state: tr.to, path: [...cur.path, tr] });
        }
      }
    }
  }
  return { dist, paths };
}
function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) out.push([arr[i], ...p]);
  }
  return out;
}
function hierholzer(adj, start) {
  const ptr = {};
  for (const k of Object.keys(adj)) ptr[k] = 0;
  const localStack = [{ node: start, viaTr: null }];
  const result = [];
  while (localStack.length) {
    const top = localStack[localStack.length - 1];
    const edges = adj[top.node] || [];
    if (ptr[top.node] < edges.length) {
      const edge = edges[ptr[top.node]++];
      localStack.push({ node: edge.to, viaTr: edge.tr });
    } else {
      const popped = localStack.pop();
      if (popped.viaTr) result.push(popped.viaTr);
    }
  }
  return result.reverse();
}
// Shortest closed walk firing every transition >= once (directed CPP).
function transitionTour(fsm) {
  const E = fsm.transitions.length;
  const out = {};
  const inn = {};
  for (const s of fsm.states) { out[s.id] = 0; inn[s.id] = 0; }
  for (const tr of fsm.transitions) { out[tr.from]++; inn[tr.to]++; }
  // Vertices needing extra outgoing (out<in) start duplicated paths;
  // vertices needing extra incoming (out>in) end them.
  const needOut = [];
  const needIn = [];
  for (const s of fsm.states) {
    const d = out[s.id] - inn[s.id];
    for (let i = 0; i < -d; i++) needOut.push(s.id);
    for (let i = 0; i < d; i++) needIn.push(s.id);
  }
  const { dist, paths } = allPairsShortest(fsm);
  let bestCost = Infinity;
  let bestMatch = [];
  for (const perm of permutations(needIn)) {
    let cost = 0;
    let ok = true;
    const match = [];
    for (let i = 0; i < needOut.length; i++) {
      const d = dist[needOut[i]]?.[perm[i]];
      if (d === undefined) { ok = false; break; }
      cost += d;
      match.push(paths[needOut[i]][perm[i]]);
    }
    if (ok && cost < bestCost) { bestCost = cost; bestMatch = match; }
  }
  if (bestCost === Infinity) bestCost = 0;
  const extra = bestCost;
  const tourLength = E + extra;
  // Augmented multigraph: original edges + duplicated matched paths.
  const adj = {};
  for (const s of fsm.states) adj[s.id] = [];
  for (const tr of fsm.transitions) adj[tr.from].push({ to: tr.to, tr });
  for (const segment of bestMatch) {
    for (const tr of segment) adj[tr.from].push({ to: tr.to, tr });
  }
  const seq = hierholzer(adj, initialId(fsm));
  const closed = seq.length === tourLength;
  return {
    transitionCount: E,
    extra,
    tourLength,
    eulerian: extra === 0 && closed,
    seq: closed ? seq : null,
  };
}

// ── state ────────────────────────────────────────────────────────────────
const state = {
  fsmId: 'login',
  criterion: 'state',
  quiz: { active: false, phase: 'idle', answer: '' },
  lab: { active: false, text: '' },
};

let root;

function currentFsm() {
  return FSMS.find((f) => f.id === state.fsmId) || FSMS[0];
}
function esc(v = '') {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function eventSeq(fsm, test) {
  return test.map((tr) => esc(tr.event)).join(' · ') || '∅';
}

function renderFsmPicker() {
  return `
    <div class="fsmgen-fsm-row" data-testid="fsmgen-fsm-row">
      ${FSMS.map((f) => `
        <button type="button"
          class="fsmgen-fsm-btn ${state.fsmId === f.id ? 'fsmgen-fsm-btn--active' : ''}"
          data-fsm="${f.id}" data-testid="fsmgen-fsm-${f.id}">
          ${t('fsmgen.fsm.' + f.id)}
        </button>`).join('')}
    </div>`;
}

function renderFsmTable() {
  const fsm = currentFsm();
  return `
    <div class="fsmgen-model" data-testid="fsmgen-model">
      <div class="fsmgen-states">
        ${fsm.states.map((s) => `
          <span class="fsmgen-state-chip ${s.initial ? 'fsmgen-state-chip--init' : ''}">
            ${esc(s.name)}${s.initial ? ' ▶' : ''}
          </span>`).join('')}
      </div>
      <table class="fsmgen-trans-table">
        <thead><tr>
          <th>#</th><th>${t('fsmgen.col.from')}</th><th>${t('fsmgen.col.event')}</th><th>${t('fsmgen.col.to')}</th>
        </tr></thead>
        <tbody>
          ${fsm.transitions.map((tr, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${esc(stateName(fsm, tr.from))}</td>
              <td class="fsmgen-evt">${esc(tr.event)}</td>
              <td>${esc(stateName(fsm, tr.to))}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderCriteriaTabs() {
  return `
    <div class="fsmgen-crit-row" data-testid="fsmgen-crit-row">
      ${CRITERIA.map((c) => `
        <button type="button"
          class="fsmgen-crit-card ${c.colorClass} ${state.criterion === c.id ? 'fsmgen-crit--active' : ''}"
          data-criterion="${c.id}" data-testid="fsmgen-crit-${c.id}">
          <div class="fsmgen-crit-name">${t('fsmgen.crit.' + c.id + '.name')}</div>
        </button>`).join('')}
    </div>`;
}

function renderCriterionDetail() {
  const fsm = currentFsm();
  const result = GENERATORS[state.criterion](fsm);
  const totalLen = result.tests.reduce((sum, test) => sum + test.length, 0);
  return `
    <div class="fsmgen-detail" data-testid="fsmgen-detail">
      <p class="fsmgen-crit-desc">${t('fsmgen.crit.' + state.criterion + '.desc')}</p>
      <p class="fsmgen-crit-fault">🐞 ${t('fsmgen.crit.' + state.criterion + '.fault')}</p>
      <div class="fsmgen-metrics">
        <span class="fsmgen-metric"><b>${result.obligations}</b> ${t('fsmgen.metric.obligations')}</span>
        <span class="fsmgen-metric"><b>${result.tests.length}</b> ${t('fsmgen.metric.tests')}</span>
        <span class="fsmgen-metric"><b>${totalLen}</b> ${t('fsmgen.metric.length')}</span>
      </div>
      <ol class="fsmgen-test-list" data-testid="fsmgen-test-list">
        ${result.tests.length
          ? result.tests.map((test) => `<li><code>${eventSeq(fsm, test)}</code></li>`).join('')
          : `<li class="fsmgen-empty">${t('fsmgen.tests.empty')}</li>`}
      </ol>
    </div>`;
}

function renderCompare() {
  const fsm = currentFsm();
  const rows = CRITERIA.map((c) => {
    const result = GENERATORS[c.id](fsm);
    const totalLen = result.tests.reduce((sum, test) => sum + test.length, 0);
    return { id: c.id, obligations: result.obligations, tests: result.tests.length, len: totalLen };
  });
  const maxLen = Math.max(1, ...rows.map((r) => r.len));
  return `
    <div class="fsmgen-compare" data-testid="fsmgen-compare">
      <h3>${t('fsmgen.compare.title')}</h3>
      <div class="fsmgen-compare-rows">
        ${rows.map((r) => `
          <div class="fsmgen-compare-row">
            <span class="fsmgen-compare-label">${t('fsmgen.crit.' + r.id + '.name')}</span>
            <span class="fsmgen-compare-bar-wrap">
              <span class="fsmgen-compare-bar" style="width:${(r.len / maxLen) * 100}%"></span>
            </span>
            <span class="fsmgen-compare-val">${r.tests} / ${r.len}</span>
          </div>`).join('')}
      </div>
      <p class="fsmgen-compare-note">${t('fsmgen.compare.note')}</p>
    </div>`;
}

function renderTour() {
  const fsm = currentFsm();
  const tour = transitionTour(fsm);
  return `
    <div class="fsmgen-tour" data-testid="fsmgen-tour">
      <h3>${t('fsmgen.tour.title')}</h3>
      <p class="fsmgen-tour-desc">${t('fsmgen.tour.desc')}</p>
      <div class="fsmgen-tour-metrics">
        <span class="fsmgen-metric"><b>${tour.transitionCount}</b> ${t('fsmgen.tour.lowerbound')}</span>
        <span class="fsmgen-metric"><b>${tour.tourLength}</b> ${t('fsmgen.tour.cpp')}</span>
        <span class="fsmgen-metric"><b>+${tour.extra}</b> ${t('fsmgen.tour.overhead')}</span>
        <span class="fsmgen-metric fsmgen-tour-euler">
          ${tour.eulerian ? '✅ ' + t('fsmgen.tour.eulerian.yes') : '⚠️ ' + t('fsmgen.tour.eulerian.no')}
        </span>
      </div>
      ${tour.seq
        ? `<p class="fsmgen-tour-seq"><b>${t('fsmgen.tour.sequence')}:</b> <code>${eventSeq(fsm, tour.seq)}</code></p>`
        : ''}
    </div>`;
}

function renderBridge() {
  return `
    <div class="fsmgen-bridges">
      <button type="button" class="fsmgen-bridge" data-testid="fsmgen-bridge-st"
        title="${t('fsmgen.bridge.st.title')}">
        🔗 → ${t('blackboxTab.st')}
      </button>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="fsmgen-quiz-start" data-testid="fsmgen-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    const shareEncoded = encodeResult({
      v: 1, explorer: 'fsmgen', explorerLabel: t('fsmgen.title'),
      mode: 'quiz', ts: Date.now(), lang: getLocale(),
      score: correct ? 1 : 0, total: 1,
      items: [{
        q: t('fsmgen.quiz.prompt'),
        a: state.quiz.answer ? t('fsmgen.quiz.' + state.quiz.answer) : '',
        expected: t('fsmgen.quiz.c'),
        ok: correct,
      }],
    });
    return `<div class="fsmgen-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="fsmgen-quiz-result">
      <p>${correct ? t('fsmgen.quiz.correct') : t('fsmgen.quiz.wrong')}</p>
      <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="fsmgen-quiz-share">📋 ${t('quiz.share.btn')}</button>
    </div>`;
  }
  return `
    <div class="fsmgen-quiz" data-testid="fsmgen-quiz">
      <p class="fsmgen-quiz-prompt">${t('fsmgen.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="fsmgen-quiz-option">
          <input type="radio" name="fsmgen-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('fsmgen.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="fsmgen-quiz-submit" data-testid="fsmgen-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="fsmgen-lab-start" data-testid="fsmgen-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="fsmgen-lab" data-testid="fsmgen-lab">
      <p class="fsmgen-lab-prompt">${t('fsmgen.lab.prompt')}</p>
      <textarea class="fsmgen-lab-textarea" data-testid="fsmgen-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${esc(state.lab.text)}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="fsmgen-wrap" data-testid="fsmgen-wrap">
      <h2 class="fsmgen-title">${t('fsmgen.title')}</h2>
      <p class="fsmgen-desc">${t('fsmgen.desc')}</p>
      <h3 class="fsmgen-section-h">${t('fsmgen.fsm.label')}</h3>
      ${renderFsmPicker()}
      ${renderFsmTable()}
      <h3 class="fsmgen-section-h">${t('fsmgen.crit.label')}</h3>
      ${renderCriteriaTabs()}
      ${renderCriterionDetail()}
      ${renderCompare()}
      ${renderTour()}
      ${renderBridge()}
      <section class="fsmgen-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-fsm]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.fsmId = btn.dataset.fsm;
      render();
    });
  });
  root.querySelectorAll('[data-criterion]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.criterion = btn.dataset.criterion;
      render();
    });
  });
  root.querySelector('[data-testid="fsmgen-bridge-st"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="blackbox"]')?.click();
    document.querySelector('[data-blackbox-tab="st"]')?.click();
  });
  root.querySelector('[data-testid="fsmgen-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="fsmgen-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="fsmgen-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="fsmgen-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="fsmgen-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createFSMTestGenerationExplorer() {
  state.fsmId = 'login';
  state.criterion = 'state';
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}

export {
  FSMS,
  CRITERIA,
  genStateCoverage,
  genTransitionCoverage,
  genTransitionPairCoverage,
  genRoundTrip,
  transitionTour,
};
