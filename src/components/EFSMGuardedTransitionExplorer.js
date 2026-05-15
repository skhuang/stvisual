import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';
import { solveBinding, buildConstraintStr } from '../utils/logicBinding.js';

// L4 — EFSM / Guarded-Transition Explorer.
// Real systems carry guard conditions over data variables (Extended FSM).
// A guard splits one graph transition into mutually exclusive branches and
// turns some abstract paths infeasible: the conjunction of guards along the
// path is unsatisfiable. Feasible paths are handed to the logicBinding
// constraint solver, which yields a concrete input value.

// Withdrawal-request EFSM. One input variable `amount`; the daily limit
// (100) and fraud threshold (200) are encoded as guard constants.
const EFSM = {
  initial: 'idle',
  states: [
    { id: 'idle', name: 'Idle', initial: true },
    { id: 'checking', name: 'Checking' },
    { id: 'approved', name: 'Approved' },
    { id: 'denied', name: 'Denied' },
  ],
  transitions: [
    { id: 't1', from: 'idle', to: 'checking', event: 'enterAmount', guard: 'amount >= 1' },
    { id: 't2', from: 'checking', to: 'approved', event: 'approve', guard: 'amount <= 100' },
    { id: 't3', from: 'checking', to: 'denied', event: 'decline', guard: 'amount >= 101' },
    { id: 't4', from: 'approved', to: 'denied', event: 'fraudHold', guard: 'amount >= 200' },
    { id: 't5', from: 'approved', to: 'idle', event: 'dispense', guard: 'true' },
    { id: 't6', from: 'denied', to: 'idle', event: 'eject', guard: 'true' },
    { id: 't7', from: 'approved', to: 'checking', event: 'recheck', guard: 'amount <= 50' },
  ],
};

// Abstract test paths — graph-valid event sequences from Idle back to Idle.
const PATHS = [
  { id: 'PA', trans: ['t1', 't2', 't5'] },
  { id: 'PB', trans: ['t1', 't3', 't6'] },
  { id: 'PC', trans: ['t1', 't2', 't4', 't6'] },
  { id: 'PD', trans: ['t1', 't2', 't7', 't3', 't6'] },
  { id: 'PE', trans: ['t1', 't2', 't7', 't2', 't5'] },
];

function transById(id) {
  return EFSM.transitions.find((tr) => tr.id === id);
}

// Solve a path: collect its non-trivial guards, hand the conjunction to the
// logicBinding solver, and report feasibility plus a concrete witness.
function solvePath(path) {
  const guards = path.trans
    .map((id) => transById(id).guard)
    .filter((g) => g && g !== 'true');
  if (!guards.length) return { feasible: true, witness: {}, guards: [], conjunction: '—' };
  const bindings = {};
  const clauseValues = {};
  guards.forEach((g, i) => { bindings['c' + i] = g; clauseValues['c' + i] = true; });
  const conjunction = buildConstraintStr(clauseValues, bindings);
  const res = solveBinding({ clauseValues, bindings, searchRange: [0, 600] });
  if (res.error) {
    if (res.error === 'no-vars') return { feasible: true, witness: {}, guards, conjunction };
    return { feasible: false, guards, conjunction };
  }
  return { feasible: true, witness: res.witness, guards, conjunction };
}

// ── state ────────────────────────────────────────────────────────────────
const state = {
  activePath: 'PA',
  quiz: { active: false, phase: 'idle', answer: '' },
  lab: { active: false, text: '' },
};

let root;

function esc(v = '') {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function stateName(id) {
  return (EFSM.states.find((s) => s.id === id) || {}).name || id;
}
function eventSeq(path) {
  return path.trans.map((id) => esc(transById(id).event)).join(' · ');
}

function renderModel() {
  return `
    <div class="efsm-model" data-testid="efsm-model">
      <p class="efsm-vars">${t('efsm.vars')}</p>
      <table class="efsm-trans-table">
        <thead><tr>
          <th>${t('efsm.col.from')}</th><th>${t('efsm.col.event')}</th>
          <th>${t('efsm.col.guard')}</th><th>${t('efsm.col.to')}</th>
        </tr></thead>
        <tbody>
          ${EFSM.transitions.map((tr) => `
            <tr>
              <td>${esc(stateName(tr.from))}</td>
              <td class="efsm-evt">${esc(tr.event)}</td>
              <td class="efsm-guard">${tr.guard === 'true' ? '—' : esc(tr.guard)}</td>
              <td>${esc(stateName(tr.to))}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      <p class="efsm-split-note">💡 ${t('efsm.split.note')}</p>
    </div>`;
}

function renderPaths() {
  return `
    <div class="efsm-path-row" data-testid="efsm-path-row">
      ${PATHS.map((p) => {
        const res = solvePath(p);
        return `
          <button type="button"
            class="efsm-path-card ${state.activePath === p.id ? 'efsm-path--active' : ''} ${res.feasible ? 'efsm-path--feasible' : 'efsm-path--infeasible'}"
            data-path="${p.id}" data-testid="efsm-path-${p.id}">
            <span class="efsm-path-id">${p.id}</span>
            <span class="efsm-path-badge">${res.feasible ? '✅' : '⛔'}</span>
          </button>`;
      }).join('')}
    </div>`;
}

function renderPathDetail() {
  const path = PATHS.find((p) => p.id === state.activePath);
  if (!path) return '';
  const res = solvePath(path);
  return `
    <div class="efsm-detail" data-testid="efsm-detail">
      <p class="efsm-detail-seq"><b>${path.id}</b>: <code>${eventSeq(path)}</code></p>
      <ol class="efsm-guard-list">
        ${path.trans.map((id) => {
          const tr = transById(id);
          return `<li>
            <span class="efsm-gl-evt">${esc(tr.event)}</span>
            <span class="efsm-gl-guard">${tr.guard === 'true' ? t('efsm.guard.none') : esc(tr.guard)}</span>
          </li>`;
        }).join('')}
      </ol>
      <p class="efsm-conjunction">${t('efsm.conjunction')}: <code>${esc(res.conjunction)}</code></p>
      ${res.feasible
        ? `<p class="efsm-verdict efsm-verdict--feasible" data-testid="efsm-verdict">
             ✅ ${t('efsm.feasible')} — ${t('efsm.solved', { val: res.witness.amount ?? '—' })}
           </p>`
        : `<p class="efsm-verdict efsm-verdict--infeasible" data-testid="efsm-verdict">
             ⛔ ${t('efsm.infeasible')}
           </p>`}
    </div>`;
}

function renderCompare() {
  const feasible = PATHS.filter((p) => solvePath(p).feasible).length;
  const pruned = PATHS.length - feasible;
  return `
    <div class="efsm-compare" data-testid="efsm-compare">
      <h3>${t('efsm.compare.title')}</h3>
      <div class="efsm-compare-bars">
        <div class="efsm-compare-row">
          <span>${t('efsm.compare.fsm')}</span>
          <span class="efsm-compare-bar efsm-compare-bar--fsm" style="width:100%">${PATHS.length}</span>
        </div>
        <div class="efsm-compare-row">
          <span>${t('efsm.compare.efsm')}</span>
          <span class="efsm-compare-bar efsm-compare-bar--efsm" style="width:${(feasible / PATHS.length) * 100}%">${feasible}</span>
        </div>
      </div>
      <p class="efsm-compare-note">${t('efsm.compare.note', { pruned, total: PATHS.length })}</p>
    </div>`;
}

function renderBridges() {
  return `
    <div class="efsm-bridges">
      <button type="button" class="efsm-bridge" data-testid="efsm-bridge-symbex"
        title="${t('efsm.bridge.symbex.title')}">🔗 → ${t('section.symbex')}</button>
      <button type="button" class="efsm-bridge" data-testid="efsm-bridge-logic"
        title="${t('efsm.bridge.logic.title')}">🔗 → ${t('section.logic')}</button>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="efsm-quiz-start" data-testid="efsm-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    const shareEncoded = encodeResult({
      v: 1, explorer: 'efsm', explorerLabel: t('efsm.title'),
      mode: 'quiz', ts: Date.now(), lang: getLocale(),
      score: correct ? 1 : 0, total: 1,
      items: [{
        q: t('efsm.quiz.prompt'),
        a: state.quiz.answer ? t('efsm.quiz.' + state.quiz.answer) : '',
        expected: t('efsm.quiz.c'),
        ok: correct,
      }],
    });
    return `<div class="efsm-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="efsm-quiz-result">
      <p>${correct ? t('efsm.quiz.correct') : t('efsm.quiz.wrong')}</p>
      <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="efsm-quiz-share">📋 ${t('quiz.share.btn')}</button>
    </div>`;
  }
  return `
    <div class="efsm-quiz" data-testid="efsm-quiz">
      <p class="efsm-quiz-prompt">${t('efsm.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="efsm-quiz-option">
          <input type="radio" name="efsm-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('efsm.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="efsm-quiz-submit" data-testid="efsm-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="efsm-lab-start" data-testid="efsm-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="efsm-lab" data-testid="efsm-lab">
      <p class="efsm-lab-prompt">${t('efsm.lab.prompt')}</p>
      <textarea class="efsm-lab-textarea" data-testid="efsm-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${esc(state.lab.text)}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="efsm-wrap" data-testid="efsm-wrap">
      <h2 class="efsm-title">${t('efsm.title')}</h2>
      <p class="efsm-desc">${t('efsm.desc')}</p>
      <h3 class="efsm-section-h">${t('efsm.model.label')}</h3>
      ${renderModel()}
      <h3 class="efsm-section-h">${t('efsm.paths.label')}</h3>
      ${renderPaths()}
      ${renderPathDetail()}
      ${renderCompare()}
      ${renderBridges()}
      <section class="efsm-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-path]').forEach((btn) => {
    btn.addEventListener('click', () => { state.activePath = btn.dataset.path; render(); });
  });
  root.querySelector('[data-testid="efsm-bridge-symbex"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="symbex"]')?.click();
  });
  root.querySelector('[data-testid="efsm-bridge-logic"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="logic"]')?.click();
  });
  root.querySelector('[data-testid="efsm-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="efsm-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="efsm-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="efsm-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="efsm-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createEFSMGuardedTransitionExplorer() {
  state.activePath = 'PA';
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}

export { EFSM, PATHS, solvePath };
