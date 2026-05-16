import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';

// L6 — Model Mutation Explorer.
// Mutation testing applied to the *model* itself: mutate states, targets
// and outputs of an FSM, then run an MBT-generated test suite against each
// model-mutant. A killed mutant means the suite distinguished it; a
// survivor means either a suite gap or an equivalent mutant. The model
// mutation score measures test adequacy at the model abstraction level.

// Base Mealy FSM. q3 and q4 are behaviourally equivalent — that is what
// makes the M5 retarget an equivalent mutant.
const BASE_FSM = {
  initial: 'q1',
  alphabet: ['a', 'b'],
  states: [
    { id: 'q1', initial: true },
    { id: 'q2' },
    { id: 'q3' },
    { id: 'q4' },
  ],
  transitions: [
    { id: 'q1a', from: 'q1', input: 'a', output: '0', to: 'q2' },
    { id: 'q1b', from: 'q1', input: 'b', output: '1', to: 'q1' },
    { id: 'q2a', from: 'q2', input: 'a', output: '1', to: 'q3' },
    { id: 'q2b', from: 'q2', input: 'b', output: '1', to: 'q4' },
    { id: 'q3a', from: 'q3', input: 'a', output: '0', to: 'q3' },
    { id: 'q3b', from: 'q3', input: 'b', output: '1', to: 'q1' },
    { id: 'q4a', from: 'q4', input: 'a', output: '0', to: 'q4' },
    { id: 'q4b', from: 'q4', input: 'b', output: '1', to: 'q1' },
  ],
};

// MBT-generated test suite — input sequences. It deliberately leaves
// q3-b and q4-b uncovered, so a mutation there can survive.
const SUITE = ['aa', 'ab', 'ba', 'aaa', 'aba'];

// Model mutation operators — one mutation each.
const MUTANTS = [
  { id: 'M1', op: 'delete', target: 'q2a' },
  { id: 'M2', op: 'retarget', target: 'q2a', to: 'q1' },
  { id: 'M3', op: 'output', target: 'q1a', value: '1' },
  { id: 'M4', op: 'output', target: 'q3b', value: '0' },
  { id: 'M5', op: 'retarget', target: 'q2a', to: 'q4', equivalent: true },
];

function applyMutant(base, mutant) {
  let transitions = base.transitions;
  if (mutant.op === 'delete') {
    transitions = transitions.filter((tr) => tr.id !== mutant.target);
  } else if (mutant.op === 'retarget') {
    transitions = transitions.map((tr) =>
      tr.id === mutant.target ? { ...tr, to: mutant.to } : tr);
  } else if (mutant.op === 'output') {
    transitions = transitions.map((tr) =>
      tr.id === mutant.target ? { ...tr, output: mutant.value } : tr);
  }
  return { ...base, transitions };
}

// Run an input string; the trace is the output sequence, with ⊥ when a
// transition is missing (a deleted-transition mutant gets stuck).
function runTrace(fsm, inputs) {
  let cur = fsm.initial;
  let out = '';
  for (const inp of inputs) {
    const tr = fsm.transitions.find((t) => t.from === cur && t.input === inp);
    if (!tr) return out + '⊥';
    out += tr.output;
    cur = tr.to;
  }
  return out;
}

// Evaluate one mutant against the suite: killed if any test's output trace
// differs from the base. Returns the first killing test.
function evalMutant(mutant) {
  const mutFsm = applyMutant(BASE_FSM, mutant);
  for (const test of SUITE) {
    const base = runTrace(BASE_FSM, test);
    const mut = runTrace(mutFsm, test);
    if (base !== mut) {
      return { killed: true, killedBy: test, baseTrace: base, mutTrace: mut };
    }
  }
  return { killed: false, killedBy: null };
}

// Overall model mutation score, raw and adjusted for equivalent mutants.
function mutationScore() {
  const results = MUTANTS.map((m) => ({ mutant: m, ...evalMutant(m) }));
  const killed = results.filter((r) => r.killed).length;
  const equivalent = results.filter((r) => r.mutant.equivalent).length;
  const total = MUTANTS.length;
  return {
    results,
    killed,
    total,
    equivalent,
    raw: killed / total,
    adjusted: total - equivalent ? killed / (total - equivalent) : 0,
  };
}

// ── state ────────────────────────────────────────────────────────────────
const state = {
  activeMutant: 'M1',
  quiz: { active: false, phase: 'idle', answer: '' },
  lab: { active: false, text: '' },
};

let root;

function esc(v = '') {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function mutantDesc(m) {
  if (m.op === 'delete') return t('modelmut.op.delete', { tr: m.target });
  if (m.op === 'retarget') return t('modelmut.op.retarget', { tr: m.target, to: m.to });
  return t('modelmut.op.output', { tr: m.target, val: m.value });
}

function renderModel() {
  return `
    <div class="modelmut-model" data-testid="modelmut-model">
      <table class="modelmut-table">
        <thead><tr>
          <th>${t('modelmut.col.from')}</th><th>${t('modelmut.col.input')}</th>
          <th>${t('modelmut.col.output')}</th><th>${t('modelmut.col.to')}</th>
        </tr></thead>
        <tbody>
          ${BASE_FSM.transitions.map((tr) => `
            <tr>
              <td>${tr.from}</td><td class="modelmut-sym">${tr.input}</td>
              <td class="modelmut-sym">${tr.output}</td><td>${tr.to}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      <p class="modelmut-suite">${t('modelmut.suite.label')}:
        ${SUITE.map((s) => `<code>${esc(s)}</code>`).join(' ')}</p>
    </div>`;
}

function renderMutants() {
  const { results } = mutationScore();
  return `
    <div class="modelmut-mutant-row" data-testid="modelmut-mutant-row">
      ${results.map((r) => `
        <button type="button"
          class="modelmut-mutant-card ${state.activeMutant === r.mutant.id ? 'modelmut-mutant--active' : ''} ${r.killed ? 'modelmut-mutant--killed' : 'modelmut-mutant--survived'}"
          data-mutant="${r.mutant.id}" data-testid="modelmut-mutant-${r.mutant.id}">
          <span class="modelmut-mutant-id">${r.mutant.id}</span>
          <span class="modelmut-mutant-badge">${r.killed ? '💀 ' + t('modelmut.killed') : '🟢 ' + t('modelmut.survived')}</span>
        </button>`).join('')}
    </div>`;
}

function renderMutantDetail() {
  const mutant = MUTANTS.find((m) => m.id === state.activeMutant);
  if (!mutant) return '';
  const res = evalMutant(mutant);
  return `
    <div class="modelmut-detail" data-testid="modelmut-detail">
      <p class="modelmut-detail-op"><b>${mutant.id}</b> — ${mutantDesc(mutant)}</p>
      ${res.killed
        ? `<p class="modelmut-verdict modelmut-verdict--killed" data-testid="modelmut-verdict">
             💀 ${t('modelmut.killed.by', { test: res.killedBy })}<br>
             <span class="modelmut-trace">${t('modelmut.trace.base')}: <code>${esc(res.baseTrace)}</code>
             · ${t('modelmut.trace.mut')}: <code>${esc(res.mutTrace)}</code></span>
           </p>`
        : `<p class="modelmut-verdict modelmut-verdict--survived" data-testid="modelmut-verdict">
             🟢 ${t('modelmut.survived.note')}
           </p>`}
      ${mutant.equivalent
        ? `<p class="modelmut-equiv" data-testid="modelmut-equiv">⚖️ ${t('modelmut.equivalent.note')}</p>`
        : (!res.killed
          ? `<p class="modelmut-gap">🕳️ ${t('modelmut.gap.note')}</p>`
          : '')}
    </div>`;
}

function renderScore() {
  const s = mutationScore();
  return `
    <div class="modelmut-score" data-testid="modelmut-score">
      <h3>${t('modelmut.score.title')}</h3>
      <div class="modelmut-score-nums">
        <span class="modelmut-score-big">${(s.raw * 100).toFixed(0)}%</span>
        <span class="modelmut-score-detail">${t('modelmut.score.raw', { killed: s.killed, total: s.total })}</span>
      </div>
      <p class="modelmut-score-adj">${t('modelmut.score.adjusted', {
        pct: (s.adjusted * 100).toFixed(0), equiv: s.equivalent,
      })}</p>
      <p class="modelmut-contrast">${t('modelmut.contrast')}</p>
    </div>`;
}

function renderBridges() {
  return `
    <div class="modelmut-bridges">
      <button type="button" class="modelmut-bridge" data-testid="modelmut-bridge-specmut"
        title="${t('modelmut.bridge.specmut.title')}">🔗 → ${t('syntaxTab.spec')}</button>
      <button type="button" class="modelmut-bridge" data-testid="modelmut-bridge-equivmutant"
        title="${t('modelmut.bridge.equivmutant.title')}">🔗 → ${t('advTab.equivmutant')}</button>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="modelmut-quiz-start" data-testid="modelmut-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    const shareEncoded = encodeResult({
      v: 1, explorer: 'modelmut', explorerLabel: t('modelmut.title'),
      mode: 'quiz', ts: Date.now(), lang: getLocale(),
      score: correct ? 1 : 0, total: 1,
      items: [{
        q: t('modelmut.quiz.prompt'),
        a: state.quiz.answer ? t('modelmut.quiz.' + state.quiz.answer) : '',
        expected: t('modelmut.quiz.c'),
        ok: correct,
      }],
    });
    return `<div class="modelmut-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="modelmut-quiz-result">
      <p>${correct ? t('modelmut.quiz.correct') : t('modelmut.quiz.wrong')}</p>
      <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="modelmut-quiz-share">📋 ${t('quiz.share.btn')}</button>
    </div>`;
  }
  return `
    <div class="modelmut-quiz" data-testid="modelmut-quiz">
      <p class="modelmut-quiz-prompt">${t('modelmut.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="modelmut-quiz-option">
          <input type="radio" name="modelmut-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('modelmut.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="modelmut-quiz-submit" data-testid="modelmut-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="modelmut-lab-start" data-testid="modelmut-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="modelmut-lab" data-testid="modelmut-lab">
      <p class="modelmut-lab-prompt">${t('modelmut.lab.prompt')}</p>
      <textarea class="modelmut-lab-textarea" data-testid="modelmut-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${esc(state.lab.text)}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="modelmut-wrap" data-testid="modelmut-wrap">
      <h2 class="modelmut-title">${t('modelmut.title')}</h2>
      <p class="modelmut-desc">${t('modelmut.desc')}</p>
      <h3 class="modelmut-section-h">${t('modelmut.model.label')}</h3>
      ${renderModel()}
      <h3 class="modelmut-section-h">${t('modelmut.mutants.label')}</h3>
      ${renderMutants()}
      ${renderMutantDetail()}
      ${renderScore()}
      ${renderBridges()}
      <section class="modelmut-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-mutant]').forEach((btn) => {
    btn.addEventListener('click', () => { state.activeMutant = btn.dataset.mutant; render(); });
  });
  root.querySelector('[data-testid="modelmut-bridge-specmut"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="syntax"]')?.click();
    document.querySelector('[data-syntax-tab="spec"]')?.click();
  });
  root.querySelector('[data-testid="modelmut-bridge-equivmutant"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="advanced"]')?.click();
    document.querySelector('[data-advanced-tab="equivmutant"]')?.click();
  });
  root.querySelector('[data-testid="modelmut-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="modelmut-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="modelmut-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="modelmut-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="modelmut-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createModelMutationExplorer() {
  state.activeMutant = 'M1';
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}

export { BASE_FSM, SUITE, MUTANTS, applyMutant, runTrace, evalMutant, mutationScore };
