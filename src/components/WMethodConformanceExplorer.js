import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';

// L3 — W-Method Conformance Explorer.
// The W-method is the classic FSM conformance test: given a minimal spec
// Mealy machine and an "at most m extra states" assumption, the suite
// (P ∪ P·X)·(X^≤m)·W is guaranteed to expose every transfer / output
// fault. This Explorer computes P, W, the transition cover and the suite,
// shows how W separates look-alike states, and runs the suite against an
// injected mutant.

// Minimal 3-state spec Mealy machine. Inputs {a,b}; each transition emits
// an output. The mutant rewires q3 --b--> q2 to q3 --b--> q1 (a transfer
// fault — same output, wrong target state).
const SPEC = {
  initial: 'q1',
  alphabet: ['a', 'b'],
  states: [
    { id: 'q1', name: 'q1', initial: true },
    { id: 'q2', name: 'q2' },
    { id: 'q3', name: 'q3' },
  ],
  transitions: [
    { id: 'd1', from: 'q1', input: 'a', output: '0', to: 'q2' },
    { id: 'd2', from: 'q1', input: 'b', output: '1', to: 'q1' },
    { id: 'd3', from: 'q2', input: 'a', output: '1', to: 'q3' },
    { id: 'd4', from: 'q2', input: 'b', output: '1', to: 'q1' },
    { id: 'd5', from: 'q3', input: 'a', output: '0', to: 'q3' },
    { id: 'd6', from: 'q3', input: 'b', output: '1', to: 'q2' },
  ],
};
const MUTANT_EDGE = { id: 'd6', newTo: 'q1' }; // q3 --b/1--> q2  becomes  q3 --b/1--> q1

function mutantFsm() {
  return {
    ...SPEC,
    transitions: SPEC.transitions.map((tr) =>
      tr.id === MUTANT_EDGE.id ? { ...tr, to: MUTANT_EDGE.newTo } : tr),
  };
}

// ── FSM algorithms ───────────────────────────────────────────────────────
function step(fsm, stateId, input) {
  return fsm.transitions.find((tr) => tr.from === stateId && tr.input === input) || null;
}
// Run an input sequence; returns the emitted output sequence.
function runMealy(fsm, startId, inputs) {
  let cur = startId;
  const outputs = [];
  for (const inp of inputs) {
    const tr = step(fsm, cur, inp);
    if (!tr) return { outputs, final: null };
    outputs.push(tr.output);
    cur = tr.to;
  }
  return { outputs, final: cur };
}
// State cover P: a shortest input sequence reaching each state (incl. ε).
function stateCover(fsm) {
  const cover = { [fsm.initial]: [] };
  const queue = [fsm.initial];
  while (queue.length) {
    const cur = queue.shift();
    for (const inp of fsm.alphabet) {
      const tr = step(fsm, cur, inp);
      if (tr && !(tr.to in cover)) {
        cover[tr.to] = [...cover[cur], inp];
        queue.push(tr.to);
      }
    }
  }
  return cover; // { stateId: [inputs] }
}
function seqsOfLength(alphabet, len) {
  if (len === 0) return [[]];
  const out = [];
  for (const rest of seqsOfLength(alphabet, len - 1)) {
    for (const sym of alphabet) out.push([...rest, sym]);
  }
  return out;
}
// Shortest input sequence whose output trace differs between s and t.
function distinguishingSeq(fsm, s, t) {
  for (let len = 1; len <= fsm.states.length; len++) {
    for (const seq of seqsOfLength(fsm.alphabet, len)) {
      const os = runMealy(fsm, s, seq).outputs.join('');
      const ot = runMealy(fsm, t, seq).outputs.join('');
      if (os !== ot) return seq;
    }
  }
  return null;
}
// Characterizing set W: distinguishing sequences covering every state pair.
function characterizingSet(fsm) {
  const W = [];
  const seen = new Set();
  for (let i = 0; i < fsm.states.length; i++) {
    for (let j = i + 1; j < fsm.states.length; j++) {
      const seq = distinguishingSeq(fsm, fsm.states[i].id, fsm.states[j].id);
      if (seq) {
        const key = seq.join('');
        if (!seen.has(key)) { seen.add(key); W.push(seq); }
      }
    }
  }
  return W;
}
function dedupeSeqs(seqs) {
  const seen = new Set();
  const out = [];
  for (const seq of seqs) {
    const key = seq.join('');
    if (!seen.has(key)) { seen.add(key); out.push(seq); }
  }
  return out;
}
// P, transition cover (P ∪ P·X), and the full suite (basis · X^≤m · W).
function wMethodSuite(fsm, m) {
  const cover = stateCover(fsm);
  const P = Object.values(cover);
  const PX = [];
  for (const p of P) for (const x of fsm.alphabet) PX.push([...p, x]);
  const basis = dedupeSeqs([...P, ...PX]);
  const W = characterizingSet(fsm);
  const middle = [];
  for (let len = 0; len <= m; len++) middle.push(...seqsOfLength(fsm.alphabet, len));
  const suite = [];
  for (const b of basis) {
    for (const mid of middle) {
      for (const w of W) suite.push([...b, ...mid, ...w]);
    }
  }
  return { P, transitionCover: basis, W, suite: dedupeSeqs(suite) };
}

// ── state ────────────────────────────────────────────────────────────────
const state = {
  activeSet: 'P',
  distinguishS: 'q1',
  distinguishT: 'q3',
  m: 0,
  mutantOn: false,
  quiz: { active: false, phase: 'idle', answer: '' },
  lab: { active: false, text: '' },
};

let root;

const fmt = (seq) => (seq.length ? seq.join('') : 'ε');

function renderFsmTable() {
  const fsm = state.mutantOn ? mutantFsm() : SPEC;
  return `
    <div class="wmethod-fsm" data-testid="wmethod-fsm">
      <table class="wmethod-trans-table">
        <thead><tr>
          <th>${t('wmethod.col.from')}</th><th>${t('wmethod.col.input')}</th>
          <th>${t('wmethod.col.output')}</th><th>${t('wmethod.col.to')}</th>
        </tr></thead>
        <tbody>
          ${fsm.transitions.map((tr) => {
            const mutated = state.mutantOn && tr.id === MUTANT_EDGE.id;
            return `<tr class="${mutated ? 'wmethod-row--mutant' : ''}">
              <td>${tr.from}</td><td class="wmethod-sym">${tr.input}</td>
              <td class="wmethod-sym">${tr.output}</td>
              <td>${tr.to}${mutated ? ' ⚠' : ''}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

const SET_TABS = ['P', 'W', 'tc', 'suite'];
function setSequences(key) {
  const { P, transitionCover, W, suite } = wMethodSuite(SPEC, state.m);
  if (key === 'P') return P;
  if (key === 'W') return W;
  if (key === 'tc') return transitionCover;
  return suite;
}
function renderSets() {
  const seqs = setSequences(state.activeSet);
  return `
    <div class="wmethod-sets" data-testid="wmethod-sets">
      <div class="wmethod-set-tabs">
        ${SET_TABS.map((k) => `
          <button type="button"
            class="wmethod-set-tab ${state.activeSet === k ? 'wmethod-set-tab--active' : ''}"
            data-set="${k}" data-testid="wmethod-set-${k}">${t('wmethod.set.' + k)}</button>`).join('')}
      </div>
      <div class="wmethod-set-body">
        <p class="wmethod-set-desc">${t('wmethod.set.' + state.activeSet + '.desc')}</p>
        ${state.activeSet === 'suite' ? `
          <div class="wmethod-m-row" data-testid="wmethod-m-row">
            <span>${t('wmethod.m.label')}</span>
            ${[0, 1, 2].map((mv) => `
              <button type="button"
                class="wmethod-m-btn ${state.m === mv ? 'wmethod-m-btn--active' : ''}"
                data-m="${mv}" data-testid="wmethod-m-${mv}">m = ${mv}</button>`).join('')}
          </div>` : ''}
        <p class="wmethod-set-count" data-testid="wmethod-set-count">
          ${t('wmethod.set.count', { n: seqs.length })}
        </p>
        <div class="wmethod-seq-list" data-testid="wmethod-seq-list">
          ${seqs.map((s) => `<code class="wmethod-seq">${fmt(s)}</code>`).join('')}
        </div>
      </div>
    </div>`;
}

function renderDistinguish() {
  const s = state.distinguishS;
  const tt = state.distinguishT;
  const opts = (sel) => SPEC.states.map((st) =>
    `<option value="${st.id}" ${sel === st.id ? 'selected' : ''}>${st.name}</option>`).join('');
  let body;
  if (s === tt) {
    body = `<p class="wmethod-dist-same">${t('wmethod.dist.same')}</p>`;
  } else {
    const seq = distinguishingSeq(SPEC, s, tt);
    const os = runMealy(SPEC, s, seq).outputs;
    const ot = runMealy(SPEC, tt, seq).outputs;
    const diffAt = os.findIndex((o, i) => o !== ot[i]);
    const trace = (outs, label) => `
      <div class="wmethod-trace">
        <span class="wmethod-trace-label">${label}</span>
        ${seq.map((inp, i) => `
          <span class="wmethod-trace-cell ${i === diffAt ? 'wmethod-trace-cell--diff' : ''}">
            <small>${inp}</small><b>${outs[i]}</b>
          </span>`).join('')}
      </div>`;
    body = `
      <p class="wmethod-dist-seq">${t('wmethod.dist.seq')}: <code>${fmt(seq)}</code></p>
      ${trace(os, s)}
      ${trace(ot, tt)}
      <p class="wmethod-dist-note">${t('wmethod.dist.note', { pos: diffAt + 1 })}</p>`;
  }
  return `
    <div class="wmethod-distinguish" data-testid="wmethod-distinguish">
      <h3>${t('wmethod.dist.title')}</h3>
      <div class="wmethod-dist-pick">
        <select data-dist="s" data-testid="wmethod-dist-s">${opts(s)}</select>
        <span>vs</span>
        <select data-dist="t" data-testid="wmethod-dist-t">${opts(tt)}</select>
      </div>
      ${body}
    </div>`;
}

function renderMutant() {
  let result = '';
  if (state.mutantOn) {
    const { suite } = wMethodSuite(SPEC, state.m);
    const mut = mutantFsm();
    const caught = [];
    for (const test of suite) {
      const expected = runMealy(SPEC, SPEC.initial, test).outputs.join('');
      const actual = runMealy(mut, mut.initial, test).outputs.join('');
      if (expected !== actual) caught.push({ test, expected, actual });
    }
    const first = caught[0];
    result = `
      <p class="wmethod-mutant-verdict ${caught.length ? 'wmethod-caught' : 'wmethod-missed'}"
         data-testid="wmethod-mutant-verdict">
        ${caught.length
          ? t('wmethod.mutant.caught', { n: caught.length, total: suite.length })
          : t('wmethod.mutant.missed')}
      </p>
      ${first ? `
        <div class="wmethod-mutant-evidence">
          <p>${t('wmethod.mutant.firstTest')}: <code>${fmt(first.test)}</code></p>
          <p class="wmethod-mutant-exp">${t('wmethod.mutant.expected')}: <code>${first.expected}</code></p>
          <p class="wmethod-mutant-act">${t('wmethod.mutant.actual')}: <code>${first.actual}</code></p>
        </div>` : ''}`;
  }
  return `
    <div class="wmethod-mutant" data-testid="wmethod-mutant">
      <h3>${t('wmethod.mutant.title')}</h3>
      <label class="wmethod-mutant-toggle">
        <input type="checkbox" data-testid="wmethod-mutant-toggle" ${state.mutantOn ? 'checked' : ''}>
        ${t('wmethod.mutant.inject')}
      </label>
      <p class="wmethod-mutant-desc">${t('wmethod.mutant.desc')}</p>
      ${result}
    </div>`;
}

function renderBridges() {
  return `
    <div class="wmethod-bridges">
      <button type="button" class="wmethod-bridge" data-testid="wmethod-bridge-groupth"
        title="${t('wmethod.bridge.groupth.title')}">🔗 → ${t('section.groupth')}</button>
      <button type="button" class="wmethod-bridge" data-testid="wmethod-bridge-logic"
        title="${t('wmethod.bridge.logic.title')}">🔗 → ${t('section.logic')}</button>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="wmethod-quiz-start" data-testid="wmethod-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    const shareEncoded = encodeResult({
      v: 1, explorer: 'wmethod', explorerLabel: t('wmethod.title'),
      mode: 'quiz', ts: Date.now(), lang: getLocale(),
      score: correct ? 1 : 0, total: 1,
      items: [{
        q: t('wmethod.quiz.prompt'),
        a: state.quiz.answer ? t('wmethod.quiz.' + state.quiz.answer) : '',
        expected: t('wmethod.quiz.c'),
        ok: correct,
      }],
    });
    return `<div class="wmethod-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="wmethod-quiz-result">
      <p>${correct ? t('wmethod.quiz.correct') : t('wmethod.quiz.wrong')}</p>
      <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="wmethod-quiz-share">📋 ${t('quiz.share.btn')}</button>
    </div>`;
  }
  return `
    <div class="wmethod-quiz" data-testid="wmethod-quiz">
      <p class="wmethod-quiz-prompt">${t('wmethod.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="wmethod-quiz-option">
          <input type="radio" name="wmethod-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('wmethod.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="wmethod-quiz-submit" data-testid="wmethod-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="wmethod-lab-start" data-testid="wmethod-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="wmethod-lab" data-testid="wmethod-lab">
      <p class="wmethod-lab-prompt">${t('wmethod.lab.prompt')}</p>
      <textarea class="wmethod-lab-textarea" data-testid="wmethod-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="wmethod-wrap" data-testid="wmethod-wrap">
      <h2 class="wmethod-title">${t('wmethod.title')}</h2>
      <p class="wmethod-desc">${t('wmethod.desc')}</p>
      <h3 class="wmethod-section-h">${t('wmethod.fsm.label')}</h3>
      ${renderFsmTable()}
      <h3 class="wmethod-section-h">${t('wmethod.sets.label')}</h3>
      ${renderSets()}
      ${renderDistinguish()}
      ${renderMutant()}
      ${renderBridges()}
      <section class="wmethod-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-set]').forEach((btn) => {
    btn.addEventListener('click', () => { state.activeSet = btn.dataset.set; render(); });
  });
  root.querySelectorAll('[data-m]').forEach((btn) => {
    btn.addEventListener('click', () => { state.m = Number(btn.dataset.m); render(); });
  });
  root.querySelectorAll('[data-dist]').forEach((sel) => {
    sel.addEventListener('change', () => {
      if (sel.dataset.dist === 's') state.distinguishS = sel.value;
      else state.distinguishT = sel.value;
      render();
    });
  });
  root.querySelector('[data-testid="wmethod-mutant-toggle"]')?.addEventListener('change', (e) => {
    state.mutantOn = e.target.checked;
    render();
  });
  root.querySelector('[data-testid="wmethod-bridge-groupth"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="groupth"]')?.click();
  });
  root.querySelector('[data-testid="wmethod-bridge-logic"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="logic"]')?.click();
  });
  root.querySelector('[data-testid="wmethod-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="wmethod-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="wmethod-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="wmethod-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="wmethod-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createWMethodConformanceExplorer() {
  state.activeSet = 'P';
  state.distinguishS = 'q1';
  state.distinguishT = 'q3';
  state.m = 0;
  state.mutantOn = false;
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}

export {
  SPEC,
  mutantFsm,
  runMealy,
  stateCover,
  distinguishingSeq,
  characterizingSet,
  wMethodSuite,
};
