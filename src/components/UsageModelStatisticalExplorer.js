import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';

// L5 — Usage-Model Statistical Testing Explorer.
// A usage model is a Markov chain: each transition carries an operational
// probability (out-edges of a state sum to 1). Tests are random walks
// weighted by that profile, so testing effort tracks real usage. From the
// chain we read the expected test length and a usage-weighted reliability
// estimate — and we flag rare-but-risky paths the profile under-samples.

// E-commerce session usage model. `exit` is the absorbing terminal state.
const USAGE_MODEL = {
  initial: 'home',
  terminal: 'exit',
  states: [
    { id: 'home', name: 'Home' },
    { id: 'browse', name: 'Browse' },
    { id: 'cart', name: 'Cart' },
    { id: 'checkout', name: 'Checkout' },
    { id: 'exit', name: 'Exit' },
  ],
  transitions: [
    { id: 'e1', from: 'home', to: 'browse', event: 'browse', p: 0.8 },
    { id: 'e2', from: 'home', to: 'exit', event: 'leave', p: 0.2 },
    { id: 'e3', from: 'browse', to: 'browse', event: 'viewMore', p: 0.5 },
    { id: 'e4', from: 'browse', to: 'cart', event: 'addToCart', p: 0.3 },
    { id: 'e5', from: 'browse', to: 'exit', event: 'leave', p: 0.2 },
    { id: 'e6', from: 'cart', to: 'browse', event: 'keepShopping', p: 0.4 },
    { id: 'e7', from: 'cart', to: 'checkout', event: 'checkout', p: 0.5 },
    { id: 'e8', from: 'cart', to: 'exit', event: 'abandon', p: 0.1 },
    { id: 'e9', from: 'checkout', to: 'exit', event: 'pay', p: 1.0 },
  ],
};
// The "bug" lives on the checkout transition; a test that fires it fails.
const BUGGY_TRANSITION = 'e7';
const RARE_THRESHOLD = 0.15;

function outgoing(model, stateId) {
  return model.transitions.filter((tr) => tr.from === stateId);
}
function stateName(model, id) {
  return (model.states.find((s) => s.id === id) || {}).name || id;
}
function probSum(model, stateId) {
  return outgoing(model, stateId).reduce((s, tr) => s + tr.p, 0);
}

// One probability-weighted random walk from the initial to the terminal
// state. Returns the list of transitions taken.
function randomWalk(model, rng = Math.random) {
  let cur = model.initial;
  const path = [];
  let guard = 0;
  while (cur !== model.terminal && guard++ < 500) {
    const edges = outgoing(model, cur);
    if (!edges.length) break;
    let r = rng();
    let chosen = edges[edges.length - 1];
    for (const e of edges) {
      if (r < e.p) { chosen = e; break; }
      r -= e.p;
    }
    path.push(chosen);
    cur = chosen.to;
  }
  return path;
}

// Solve the linear system A·x = b by Gaussian elimination.
function solveLinear(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    [M[col], M[pivot]] = [M[pivot], M[col]];
    const pv = M[col][col];
    if (Math.abs(pv) < 1e-12) continue;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col] / pv;
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  return M.map((row, i) => (Math.abs(M[i][i]) < 1e-12 ? 0 : row[n] / M[i][i]));
}

// Expected number of transitions in a generated test (absorbing-chain
// expected steps): E[s] = 1 + Σ p(s→s')·E[s'] over transient states.
function expectedLength(model) {
  const transient = model.states.map((s) => s.id).filter((id) => id !== model.terminal);
  const idx = Object.fromEntries(transient.map((id, i) => [id, i]));
  const n = transient.length;
  const A = Array.from({ length: n }, () => Array(n).fill(0));
  const b = Array(n).fill(1);
  transient.forEach((id, i) => {
    A[i][i] = 1;
    for (const tr of outgoing(model, id)) {
      if (tr.to in idx) A[i][idx[tr.to]] -= tr.p;
    }
  });
  const E = solveLinear(A, b);
  return E[idx[model.initial]];
}

// Run N usage-weighted tests; a test fails if it fires the buggy
// transition. Returns coverage counts and a reliability estimate.
function runStatistical(model, count, rng = Math.random) {
  const transitionCounts = {};
  model.transitions.forEach((tr) => { transitionCounts[tr.id] = 0; });
  const samples = [];
  let passes = 0;
  for (let i = 0; i < count; i++) {
    const walk = randomWalk(model, rng);
    let failed = false;
    for (const tr of walk) {
      transitionCounts[tr.id]++;
      if (tr.id === BUGGY_TRANSITION) failed = true;
    }
    if (!failed) passes++;
    if (samples.length < 5) samples.push(walk);
  }
  const reliability = count ? passes / count : 0;
  const ci = count
    ? 1.96 * Math.sqrt((reliability * (1 - reliability)) / count)
    : 0;
  return { count, passes, fails: count - passes, reliability, ci, transitionCounts, samples };
}

// ── state ────────────────────────────────────────────────────────────────
const state = {
  n: 200,
  result: null,
  quiz: { active: false, phase: 'idle', answer: '' },
  lab: { active: false, text: '' },
};

let root;

function esc(v = '') {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function pct(x) {
  return (x * 100).toFixed(1) + '%';
}
function walkEvents(walk) {
  return walk.map((tr) => esc(tr.event)).join(' · ') || '∅';
}

function renderModel() {
  return `
    <div class="usage-model" data-testid="usage-model">
      <table class="usage-table">
        <thead><tr>
          <th>${t('usage.col.from')}</th><th>${t('usage.col.event')}</th>
          <th>${t('usage.col.prob')}</th><th>${t('usage.col.to')}</th>
        </tr></thead>
        <tbody>
          ${USAGE_MODEL.transitions.map((tr) => `
            <tr class="${tr.p < RARE_THRESHOLD ? 'usage-row--rare' : ''}">
              <td>${esc(stateName(USAGE_MODEL, tr.from))}</td>
              <td class="usage-evt">${esc(tr.event)}</td>
              <td class="usage-prob">${tr.p.toFixed(2)}${tr.p < RARE_THRESHOLD ? ' ⚠' : ''}</td>
              <td>${esc(stateName(USAGE_MODEL, tr.to))}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      <p class="usage-sum-note">${t('usage.sum.note')}</p>
      <p class="usage-explen">${t('usage.explen', { n: expectedLength(USAGE_MODEL).toFixed(2) })}</p>
    </div>`;
}

function renderRunner() {
  return `
    <div class="usage-runner" data-testid="usage-runner">
      <div class="usage-n-row">
        <span>${t('usage.n.label')}</span>
        ${[50, 200, 1000].map((nv) => `
          <button type="button"
            class="usage-n-btn ${state.n === nv ? 'usage-n-btn--active' : ''}"
            data-n="${nv}" data-testid="usage-n-${nv}">${nv}</button>`).join('')}
        <button type="button" class="usage-run-btn" data-testid="usage-run">${t('usage.run')}</button>
      </div>
      ${state.result ? renderResult() : `<p class="usage-hint">${t('usage.hint')}</p>`}
    </div>`;
}

function renderResult() {
  const r = state.result;
  const maxCount = Math.max(1, ...Object.values(r.transitionCounts));
  return `
    <div class="usage-result" data-testid="usage-result">
      <div class="usage-reliability" data-testid="usage-reliability">
        <h4>${t('usage.reliability.title')}</h4>
        <p class="usage-rel-big">${pct(r.reliability)} <span>± ${pct(r.ci)}</span></p>
        <p class="usage-rel-detail">${t('usage.reliability.detail', { pass: r.passes, fail: r.fails, n: r.count })}</p>
      </div>
      <h4>${t('usage.coverage.title')}</h4>
      <div class="usage-cov-bars">
        ${USAGE_MODEL.transitions.map((tr) => {
          const c = r.transitionCounts[tr.id];
          return `
            <div class="usage-cov-row">
              <span class="usage-cov-label ${tr.id === BUGGY_TRANSITION ? 'usage-cov-label--bug' : ''}">
                ${esc(tr.event)}${tr.id === BUGGY_TRANSITION ? ' 🐞' : ''}
              </span>
              <span class="usage-cov-bar-wrap">
                <span class="usage-cov-bar" style="width:${(c / maxCount) * 100}%"></span>
              </span>
              <span class="usage-cov-val">${c}</span>
            </div>`;
        }).join('')}
      </div>
      <h4>${t('usage.samples.title')}</h4>
      <ol class="usage-sample-list">
        ${r.samples.map((w) => `<li><code>${walkEvents(w)}</code></li>`).join('')}
      </ol>
    </div>`;
}

function renderRare() {
  const rare = USAGE_MODEL.transitions.filter((tr) => tr.p < RARE_THRESHOLD);
  return `
    <div class="usage-rare" data-testid="usage-rare">
      <h3>${t('usage.rare.title')}</h3>
      <p class="usage-rare-desc">${t('usage.rare.desc')}</p>
      <ul class="usage-rare-list">
        ${rare.map((tr) => `
          <li><code>${esc(tr.event)}</code> (p = ${tr.p.toFixed(2)}) — ${t('usage.rare.item', {
            from: esc(stateName(USAGE_MODEL, tr.from)),
            to: esc(stateName(USAGE_MODEL, tr.to)),
          })}</li>`).join('')}
      </ul>
    </div>`;
}

function renderBridges() {
  return `
    <div class="usage-bridges">
      <button type="button" class="usage-bridge" data-testid="usage-bridge-rbt"
        title="${t('usage.bridge.rbt.title')}">🔗 → ${t('section.rbt')}</button>
      <button type="button" class="usage-bridge" data-testid="usage-bridge-pbt"
        title="${t('usage.bridge.pbt.title')}">🔗 → ${t('section.pbt')}</button>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="usage-quiz-start" data-testid="usage-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    const shareEncoded = encodeResult({
      v: 1, explorer: 'usage', explorerLabel: t('usage.title'),
      mode: 'quiz', ts: Date.now(), lang: getLocale(),
      score: correct ? 1 : 0, total: 1,
      items: [{
        q: t('usage.quiz.prompt'),
        a: state.quiz.answer ? t('usage.quiz.' + state.quiz.answer) : '',
        expected: t('usage.quiz.c'),
        ok: correct,
      }],
    });
    return `<div class="usage-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="usage-quiz-result">
      <p>${correct ? t('usage.quiz.correct') : t('usage.quiz.wrong')}</p>
      <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="usage-quiz-share">📋 ${t('quiz.share.btn')}</button>
    </div>`;
  }
  return `
    <div class="usage-quiz" data-testid="usage-quiz">
      <p class="usage-quiz-prompt">${t('usage.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="usage-quiz-option">
          <input type="radio" name="usage-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('usage.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="usage-quiz-submit" data-testid="usage-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="usage-lab-start" data-testid="usage-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="usage-lab" data-testid="usage-lab">
      <p class="usage-lab-prompt">${t('usage.lab.prompt')}</p>
      <textarea class="usage-lab-textarea" data-testid="usage-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${esc(state.lab.text)}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="usage-wrap" data-testid="usage-wrap">
      <h2 class="usage-title">${t('usage.title')}</h2>
      <p class="usage-desc">${t('usage.desc')}</p>
      <h3 class="usage-section-h">${t('usage.model.label')}</h3>
      ${renderModel()}
      <h3 class="usage-section-h">${t('usage.run.label')}</h3>
      ${renderRunner()}
      ${renderRare()}
      ${renderBridges()}
      <section class="usage-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-n]').forEach((btn) => {
    btn.addEventListener('click', () => { state.n = Number(btn.dataset.n); render(); });
  });
  root.querySelector('[data-testid="usage-run"]')?.addEventListener('click', () => {
    state.result = runStatistical(USAGE_MODEL, state.n);
    render();
  });
  root.querySelector('[data-testid="usage-bridge-rbt"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="rbt"]')?.click();
  });
  root.querySelector('[data-testid="usage-bridge-pbt"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="pbt"]')?.click();
  });
  root.querySelector('[data-testid="usage-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="usage-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="usage-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="usage-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="usage-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createUsageModelStatisticalExplorer() {
  state.n = 200;
  state.result = null;
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}

export { USAGE_MODEL, randomWalk, expectedLength, runStatistical };
