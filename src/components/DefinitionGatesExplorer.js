import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';

// M3 — Definition of Ready / Done Explorer.
// DoR and DoD are agile's quality gates. DoR gates a story *into* the
// sprint (is it clear enough to start?); DoD gates it *out* (is it truly
// finished?). Toggle each criterion and watch latent issues get caught at
// a gate — or leak downstream to production when the gate is weak.

// Each criterion belongs to a gate and catches exactly one latent issue.
const CRITERIA = [
  { id: 'dor-criteria', gate: 'dor' },
  { id: 'dor-data', gate: 'dor' },
  { id: 'dor-deps', gate: 'dor' },
  { id: 'dor-small', gate: 'dor' },
  { id: 'dod-tests', gate: 'dod' },
  { id: 'dod-review', gate: 'dod' },
  { id: 'dod-ac', gate: 'dod' },
  { id: 'dod-nosev1', gate: 'dod' },
];

// The story carries these latent issues; each is caught by its criterion.
const ISSUES = [
  { id: 'ambiguous-ac', gate: 'dor', criterion: 'dor-criteria' },
  { id: 'missing-test-data', gate: 'dor', criterion: 'dor-data' },
  { id: 'blocked-dep', gate: 'dor', criterion: 'dor-deps' },
  { id: 'oversized', gate: 'dor', criterion: 'dor-small' },
  { id: 'failing-regression', gate: 'dod', criterion: 'dod-tests' },
  { id: 'unreviewed-code', gate: 'dod', criterion: 'dod-review' },
  { id: 'unverified-ac', gate: 'dod', criterion: 'dod-ac' },
  { id: 'known-defect', gate: 'dod', criterion: 'dod-nosev1' },
];

// A criterion catches its issue only when it is enabled in the gate.
function evaluate(enabled) {
  const caught = [];
  const leaked = [];
  for (const issue of ISSUES) {
    if (enabled.has(issue.criterion)) caught.push(issue);
    else leaked.push(issue);
  }
  return { caught, leaked };
}

const state = {
  // Start with two criteria off, so a leak is visible immediately.
  enabled: new Set(CRITERIA.map((c) => c.id).filter((id) => id !== 'dor-data' && id !== 'dod-review')),
  quiz: { active: false, phase: 'idle', answer: '' },
  lab: { active: false, text: '' },
};

let root;

function renderGate(gate) {
  const crits = CRITERIA.filter((c) => c.gate === gate);
  return `
    <div class="gate-panel gate-panel--${gate}" data-testid="gate-panel-${gate}">
      <h3>${t('gate.' + gate + '.title')}</h3>
      <p class="gate-sub">${t('gate.' + gate + '.sub')}</p>
      <ul class="gate-crit-list">
        ${crits.map((c) => `
          <li>
            <label class="gate-crit">
              <input type="checkbox" data-crit="${c.id}" data-testid="gate-crit-${c.id}"
                ${state.enabled.has(c.id) ? 'checked' : ''}>
              ${t('gate.crit.' + c.id)}
            </label>
          </li>`).join('')}
      </ul>
    </div>`;
}

function renderResult() {
  const { caught, leaked } = evaluate(state.enabled);
  const issueRow = (issue, status) => `
    <li class="gate-issue gate-issue--${status}">
      <span class="gate-issue-icon">${status === 'caught' ? '✅' : '⚠️'}</span>
      <span class="gate-issue-label">${t('gate.issue.' + issue.id)}</span>
      <span class="gate-issue-where">
        ${status === 'caught'
          ? t('gate.caughtAt', { gate: t('gate.gate.' + issue.gate) })
          : t('gate.leaked')}
      </span>
    </li>`;
  return `
    <div class="gate-result" data-testid="gate-result">
      <h3>${t('gate.result.title')}</h3>
      <p class="gate-summary ${leaked.length ? 'gate-summary--leak' : 'gate-summary--clean'}"
         data-testid="gate-summary">
        ${t('gate.result.summary', { caught: caught.length, leaked: leaked.length })}
      </p>
      <ul class="gate-issue-list">
        ${[...caught.map((i) => issueRow(i, 'caught')),
           ...leaked.map((i) => issueRow(i, 'leaked'))].join('')}
      </ul>
      <p class="gate-contrast">${t('gate.contrast')}</p>
    </div>`;
}

function renderBridges() {
  return `
    <div class="gate-bridges">
      <button type="button" class="gate-bridge" data-testid="gate-bridge-defectcost"
        title="${t('gate.bridge.defectcost.title')}">🔗 → ${t('flowTab.defectCost')}</button>
      <button type="button" class="gate-bridge" data-testid="gate-bridge-bdd"
        title="${t('gate.bridge.bdd.title')}">🔗 → ${t('acceptanceTab.gherkin')}</button>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="gate-quiz-start" data-testid="gate-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    const shareEncoded = encodeResult({
      v: 1, explorer: 'gate', explorerLabel: t('gate.title'),
      mode: 'quiz', ts: Date.now(), lang: getLocale(),
      score: correct ? 1 : 0, total: 1,
      items: [{
        q: t('gate.quiz.prompt'),
        a: state.quiz.answer ? t('gate.quiz.' + state.quiz.answer) : '',
        expected: t('gate.quiz.c'),
        ok: correct,
      }],
    });
    return `<div class="gate-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="gate-quiz-result">
      <p>${correct ? t('gate.quiz.correct') : t('gate.quiz.wrong')}</p>
      <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="gate-quiz-share">📋 ${t('quiz.share.btn')}</button>
    </div>`;
  }
  return `
    <div class="gate-quiz" data-testid="gate-quiz">
      <p class="gate-quiz-prompt">${t('gate.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="gate-quiz-option">
          <input type="radio" name="gate-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('gate.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="gate-quiz-submit" data-testid="gate-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="gate-lab-start" data-testid="gate-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="gate-lab" data-testid="gate-lab">
      <p class="gate-lab-prompt">${t('gate.lab.prompt')}</p>
      <textarea class="gate-lab-textarea" data-testid="gate-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="gate-wrap" data-testid="gate-wrap">
      <h2 class="gate-title">${t('gate.title')}</h2>
      <p class="gate-desc">${t('gate.desc')}</p>
      <div class="gate-gates">
        ${renderGate('dor')}
        ${renderGate('dod')}
      </div>
      ${renderResult()}
      ${renderBridges()}
      <section class="gate-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-crit]').forEach((inp) => {
    inp.addEventListener('change', () => {
      if (inp.checked) state.enabled.add(inp.dataset.crit);
      else state.enabled.delete(inp.dataset.crit);
      render();
    });
  });
  root.querySelector('[data-testid="gate-bridge-defectcost"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="flow"]')?.click();
    document.querySelector('[data-flow-tab="defectCost"]')?.click();
  });
  root.querySelector('[data-testid="gate-bridge-bdd"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="acceptance"]')?.click();
    document.querySelector('[data-acceptance-tab="gherkin"]')?.click();
  });
  root.querySelector('[data-testid="gate-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="gate-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="gate-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="gate-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="gate-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createDefinitionGatesExplorer() {
  state.enabled = new Set(CRITERIA.map((c) => c.id).filter((id) => id !== 'dor-data' && id !== 'dod-review'));
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}

export { CRITERIA, ISSUES, evaluate };
