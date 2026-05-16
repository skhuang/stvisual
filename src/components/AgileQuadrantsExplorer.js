import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';

// M1 — Agile Testing Quadrants Explorer.
// Brian Marick's quadrants, popularised by Crispin & Gregory: the map of
// agile testing. Two axes — business-facing ↔ technology-facing, and
// supporting-the-team ↔ critiquing-the-product. Each quadrant lists its
// techniques; most technique chips bridge to the Explorer that teaches
// the technique in depth, so this Explorer is a hub, not a re-teach.

// Techniques carry an optional bridge { section, tab? }; the click handler
// derives the inner tab attribute as data-<section>-tab.
const QUADRANTS = [
  {
    id: 'q2', num: 'Q2', colorClass: 'agq-quad--green',
    techniques: [
      { key: 'functional' },
      { key: 'bdd', bridge: { section: 'acceptance', tab: 'gherkin' } },
      { key: 'examples', bridge: { section: 'acceptance', tab: 'usecase' } },
    ],
  },
  {
    id: 'q3', num: 'Q3', colorClass: 'agq-quad--amber',
    techniques: [
      { key: 'exploratory', bridge: { section: 'blackbox', tab: 'et' } },
      { key: 'usability' },
      { key: 'uat', bridge: { section: 'acceptance', tab: 'e2ejourney' } },
    ],
  },
  {
    id: 'q1', num: 'Q1', colorClass: 'agq-quad--blue',
    techniques: [
      { key: 'unit', bridge: { section: 'codecov' } },
      { key: 'component', bridge: { section: 'inttest' } },
      { key: 'tdd' },
    ],
  },
  {
    id: 'q4', num: 'Q4', colorClass: 'agq-quad--purple',
    techniques: [
      { key: 'performance', bridge: { section: 'acceptance', tab: 'perfload' } },
      { key: 'security' },
      { key: 'resilience', bridge: { section: 'acceptance', tab: 'chaos' } },
    ],
  },
];

const state = {
  activeQuadrant: 'q1',
  quiz: { active: false, phase: 'idle', answer: '' },
  lab: { active: false, text: '' },
};

let root;

function renderGrid() {
  const cell = (q) => `
    <button type="button"
      class="agq-quad ${q.colorClass} ${state.activeQuadrant === q.id ? 'agq-quad--active' : ''}"
      data-quadrant="${q.id}" data-testid="agq-quad-${q.id}">
      <span class="agq-quad-num">${q.num}</span>
      <span class="agq-quad-name">${t('agq.' + q.id + '.name')}</span>
    </button>`;
  const byId = (id) => QUADRANTS.find((q) => q.id === id);
  return `
    <div class="agq-grid-wrap" data-testid="agq-grid">
      <div class="agq-axis-y agq-axis-y--top">${t('agq.axis.business')}</div>
      <div class="agq-axis-y agq-axis-y--bottom">${t('agq.axis.tech')}</div>
      <div class="agq-axis-x agq-axis-x--left">${t('agq.axis.support')}</div>
      <div class="agq-axis-x agq-axis-x--right">${t('agq.axis.critique')}</div>
      <div class="agq-grid">
        ${cell(byId('q2'))}${cell(byId('q3'))}
        ${cell(byId('q1'))}${cell(byId('q4'))}
      </div>
    </div>`;
}

function renderDetail() {
  const q = QUADRANTS.find((x) => x.id === state.activeQuadrant);
  if (!q) return '';
  return `
    <div class="agq-detail ${q.colorClass}" data-testid="agq-detail">
      <h3>${q.num} · ${t('agq.' + q.id + '.name')}</h3>
      <p class="agq-detail-role">${t('agq.' + q.id + '.role')}</p>
      <div class="agq-detail-meta">
        <span><b>${t('agq.detail.automation')}:</b> ${t('agq.' + q.id + '.automation')}</span>
        <span><b>${t('agq.detail.timing')}:</b> ${t('agq.' + q.id + '.timing')}</span>
      </div>
      <p class="agq-detail-tech-label">${t('agq.detail.techniques')}</p>
      <div class="agq-tech-chips">
        ${q.techniques.map((tech) => {
          if (tech.bridge) {
            return `<button type="button" class="agq-chip agq-chip--bridge"
              data-bridge-section="${tech.bridge.section}"
              data-bridge-tab="${tech.bridge.tab || ''}"
              data-testid="agq-chip-${tech.key}">
              ${t('agq.tech.' + tech.key)} <span class="agq-chip-arrow">↗</span>
            </button>`;
          }
          return `<span class="agq-chip" data-testid="agq-chip-${tech.key}">${t('agq.tech.' + tech.key)}</span>`;
        }).join('')}
      </div>
      <p class="agq-bridge-hint">${t('agq.bridge.hint')}</p>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="agq-quiz-start" data-testid="agq-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    const shareEncoded = encodeResult({
      v: 1, explorer: 'agq', explorerLabel: t('agq.title'),
      mode: 'quiz', ts: Date.now(), lang: getLocale(),
      score: correct ? 1 : 0, total: 1,
      items: [{
        q: t('agq.quiz.prompt'),
        a: state.quiz.answer ? t('agq.quiz.' + state.quiz.answer) : '',
        expected: t('agq.quiz.c'),
        ok: correct,
      }],
    });
    return `<div class="agq-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="agq-quiz-result">
      <p>${correct ? t('agq.quiz.correct') : t('agq.quiz.wrong')}</p>
      <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="agq-quiz-share">📋 ${t('quiz.share.btn')}</button>
    </div>`;
  }
  return `
    <div class="agq-quiz" data-testid="agq-quiz">
      <p class="agq-quiz-prompt">${t('agq.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="agq-quiz-option">
          <input type="radio" name="agq-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('agq.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="agq-quiz-submit" data-testid="agq-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="agq-lab-start" data-testid="agq-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="agq-lab" data-testid="agq-lab">
      <p class="agq-lab-prompt">${t('agq.lab.prompt')}</p>
      <textarea class="agq-lab-textarea" data-testid="agq-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="agq-wrap" data-testid="agq-wrap">
      <h2 class="agq-title">${t('agq.title')}</h2>
      <p class="agq-desc">${t('agq.desc')}</p>
      ${renderGrid()}
      ${renderDetail()}
      <section class="agq-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-quadrant]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeQuadrant = btn.dataset.quadrant;
      render();
    });
  });
  root.querySelectorAll('[data-bridge-section]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.bridgeSection;
      const tab = btn.dataset.bridgeTab;
      document.querySelector(`[data-section="${section}"]`)?.click();
      if (tab) document.querySelector(`[data-${section}-tab="${tab}"]`)?.click();
    });
  });
  root.querySelector('[data-testid="agq-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="agq-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="agq-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="agq-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="agq-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createAgileQuadrantsExplorer() {
  state.activeQuadrant = 'q1';
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}

export { QUADRANTS };
