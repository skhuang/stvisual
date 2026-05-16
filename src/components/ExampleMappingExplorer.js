import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';

// M5 — Three Amigos / Example Mapping Explorer.
// Quality starts at story refinement, before code. The Three Amigos
// (BA, developer, tester) run Matt Wynne's Example Mapping: a user story
// (yellow) breaks into rules (blue), each illustrated by examples (green),
// with open questions (red). Many unresolved red cards means the story is
// not ready — it feeds the Definition of Ready. Green examples become
// BDD scenarios.

const RULES = [
  { id: 'r1', examples: ['e1', 'e2'] },
  { id: 'r2', examples: ['e3'] },
  { id: 'r3', examples: ['e4'] },
];
const QUESTIONS = ['q1', 'q2', 'q3'];
const ROLES = ['ba', 'dev', 'tester'];

const state = {
  role: 'ba',
  resolved: new Set(),
  activeExample: 'e1',
  quiz: { active: false, phase: 'idle', answer: '' },
  lab: { active: false, text: '' },
};

let root;

function openQuestionCount() {
  return QUESTIONS.filter((q) => !state.resolved.has(q)).length;
}

function renderRoles() {
  return `
    <div class="emap-roles" data-testid="emap-roles">
      ${ROLES.map((r) => `
        <button type="button"
          class="emap-role ${state.role === r ? 'emap-role--active' : ''}"
          data-role="${r}" data-testid="emap-role-${r}">${t('emap.role.' + r)}</button>`).join('')}
      <p class="emap-role-note">${t('emap.role.' + state.role + '.note')}</p>
    </div>`;
}

function renderMap() {
  return `
    <div class="emap-map" data-testid="emap-map">
      <div class="emap-card emap-card--story" data-testid="emap-story">
        <span class="emap-card-kind">${t('emap.kind.story')}</span>
        ${t('emap.story')}
      </div>
      <div class="emap-rules">
        ${RULES.map((rule) => `
          <div class="emap-rule-block">
            <div class="emap-card emap-card--rule" data-testid="emap-rule-${rule.id}">
              <span class="emap-card-kind">${t('emap.kind.rule')}</span>
              ${t('emap.rule.' + rule.id)}
            </div>
            <div class="emap-examples">
              ${rule.examples.map((ex) => `
                <button type="button"
                  class="emap-card emap-card--example ${state.activeExample === ex ? 'emap-card--active' : ''}"
                  data-example="${ex}" data-testid="emap-ex-${ex}">
                  <span class="emap-card-kind">${t('emap.kind.example')}</span>
                  ${t('emap.ex.' + ex)}
                </button>`).join('')}
            </div>
          </div>`).join('')}
      </div>
      <div class="emap-questions" data-testid="emap-questions">
        <span class="emap-card-kind">${t('emap.kind.question')}</span>
        ${QUESTIONS.map((q) => {
          const done = state.resolved.has(q);
          return `<button type="button"
            class="emap-card emap-card--question ${done ? 'emap-card--resolved' : ''}"
            data-question="${q}" data-testid="emap-q-${q}">
            ${done ? '✅ ' : '❓ '}${t('emap.q.' + q)}
          </button>`;
        }).join('')}
      </div>
    </div>`;
}

function renderReadiness() {
  const open = openQuestionCount();
  const ready = open === 0;
  return `
    <div class="emap-readiness ${ready ? 'emap-readiness--ready' : 'emap-readiness--blocked'}"
         data-testid="emap-readiness">
      ${ready
        ? '✅ ' + t('emap.ready')
        : '🚧 ' + t('emap.notready', { n: open })}
    </div>`;
}

function renderGherkin() {
  const ex = state.activeExample;
  return `
    <div class="emap-gherkin" data-testid="emap-gherkin">
      <h3>${t('emap.gherkin.title')}</h3>
      <p class="emap-gherkin-from">${t('emap.gherkin.from')}: <i>${t('emap.ex.' + ex)}</i></p>
      <pre class="emap-gherkin-pre">${t('emap.ex.' + ex + '.gherkin').replace(/</g, '&lt;')}</pre>
    </div>`;
}

function renderBridges() {
  return `
    <div class="emap-bridges">
      <button type="button" class="emap-bridge" data-testid="emap-bridge-bdd"
        title="${t('emap.bridge.bdd.title')}">🔗 → ${t('acceptanceTab.gherkin')}</button>
      <button type="button" class="emap-bridge" data-testid="emap-bridge-gates"
        title="${t('emap.bridge.gates.title')}">🔗 → ${t('agileTab.gates')}</button>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="emap-quiz-start" data-testid="emap-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    const shareEncoded = encodeResult({
      v: 1, explorer: 'emap', explorerLabel: t('emap.title'),
      mode: 'quiz', ts: Date.now(), lang: getLocale(),
      score: correct ? 1 : 0, total: 1,
      items: [{
        q: t('emap.quiz.prompt'),
        a: state.quiz.answer ? t('emap.quiz.' + state.quiz.answer) : '',
        expected: t('emap.quiz.c'),
        ok: correct,
      }],
    });
    return `<div class="emap-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="emap-quiz-result">
      <p>${correct ? t('emap.quiz.correct') : t('emap.quiz.wrong')}</p>
      <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="emap-quiz-share">📋 ${t('quiz.share.btn')}</button>
    </div>`;
  }
  return `
    <div class="emap-quiz" data-testid="emap-quiz">
      <p class="emap-quiz-prompt">${t('emap.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="emap-quiz-option">
          <input type="radio" name="emap-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('emap.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="emap-quiz-submit" data-testid="emap-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="emap-lab-start" data-testid="emap-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="emap-lab" data-testid="emap-lab">
      <p class="emap-lab-prompt">${t('emap.lab.prompt')}</p>
      <textarea class="emap-lab-textarea" data-testid="emap-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="emap-wrap" data-testid="emap-wrap">
      <h2 class="emap-title">${t('emap.title')}</h2>
      <p class="emap-desc">${t('emap.desc')}</p>
      ${renderRoles()}
      ${renderMap()}
      ${renderReadiness()}
      ${renderGherkin()}
      ${renderBridges()}
      <section class="emap-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-role]').forEach((btn) => {
    btn.addEventListener('click', () => { state.role = btn.dataset.role; render(); });
  });
  root.querySelectorAll('[data-example]').forEach((btn) => {
    btn.addEventListener('click', () => { state.activeExample = btn.dataset.example; render(); });
  });
  root.querySelectorAll('[data-question]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.question;
      if (state.resolved.has(q)) state.resolved.delete(q);
      else state.resolved.add(q);
      render();
    });
  });
  root.querySelector('[data-testid="emap-bridge-bdd"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="acceptance"]')?.click();
    document.querySelector('[data-acceptance-tab="gherkin"]')?.click();
  });
  root.querySelector('[data-testid="emap-bridge-gates"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="agile"]')?.click();
    document.querySelector('[data-agile-tab="gates"]')?.click();
  });
  root.querySelector('[data-testid="emap-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="emap-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="emap-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="emap-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="emap-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createExampleMappingExplorer() {
  state.role = 'ba';
  state.resolved = new Set();
  state.activeExample = 'e1';
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}

export { RULES, QUESTIONS, ROLES };
