import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';

// M2 — Sprint Testing Cadence Explorer.
// Agile testing is not a phase — it is woven through the whole sprint.
// Toggle between the agile cadence and a waterfall lifecycle to see how
// testing spreads (or concentrates), and what that does to feedback
// latency and defect escape.

// `tested`: 'full' = testing happens here · 'meta' = the team inspects
// its own testing · 'none' = no testing at this stage.
const AGILE_STAGES = [
  { id: 'refine', tested: 'full' },
  { id: 'plan', tested: 'full' },
  { id: 'dev', tested: 'full' },
  { id: 'storytest', tested: 'full' },
  { id: 'review', tested: 'full' },
  { id: 'retro', tested: 'meta' },
];
const WATERFALL_STAGES = [
  { id: 'requirements', tested: 'none' },
  { id: 'design', tested: 'none' },
  { id: 'code', tested: 'none' },
  { id: 'testphase', tested: 'full' },
  { id: 'release', tested: 'none' },
];
const MODELS = {
  agile: { stages: AGILE_STAGES },
  waterfall: { stages: WATERFALL_STAGES },
};

// Stages where testing is woven in (full or meta), out of the total.
function wovenRatio(modeId) {
  const stages = MODELS[modeId].stages;
  return { woven: stages.filter((s) => s.tested !== 'none').length, total: stages.length };
}

const state = {
  mode: 'agile',
  activeStage: 'refine',
  quiz: { active: false, phase: 'idle', answer: '' },
  lab: { active: false, text: '' },
};

let root;

function esc(v = '') {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
const TESTED_ICON = { full: '🟢', meta: '🔁', none: '⚪' };

function renderModeToggle() {
  return `
    <div class="cadence-mode" data-testid="cadence-mode">
      <span class="cadence-mode-label">${t('cadence.mode.label')}</span>
      ${['agile', 'waterfall'].map((m) => `
        <button type="button"
          class="cadence-mode-btn ${state.mode === m ? 'cadence-mode-btn--active' : ''}"
          data-mode="${m}" data-testid="cadence-mode-${m}">${t('cadence.mode.' + m)}</button>`).join('')}
    </div>`;
}

function renderTimeline() {
  const stages = MODELS[state.mode].stages;
  return `
    <div class="cadence-timeline" data-testid="cadence-timeline">
      ${stages.map((s, i) => `
        ${i > 0 ? '<div class="cadence-arrow" aria-hidden="true">→</div>' : ''}
        <button type="button"
          class="cadence-stage cadence-stage--${s.tested} ${state.activeStage === s.id ? 'cadence-stage--active' : ''}"
          data-stage="${s.id}" data-testid="cadence-stage-${s.id}">
          <span class="cadence-stage-icon">${TESTED_ICON[s.tested]}</span>
          <span class="cadence-stage-name">${t('cadence.stage.' + s.id + '.name')}</span>
        </button>`).join('')}
    </div>`;
}

function renderStageDetail() {
  const stages = MODELS[state.mode].stages;
  const stage = stages.find((s) => s.id === state.activeStage) || stages[0];
  return `
    <div class="cadence-detail cadence-stage--${stage.tested}" data-testid="cadence-detail">
      <h3>${t('cadence.stage.' + stage.id + '.name')}</h3>
      <p class="cadence-detail-row"><b>${t('cadence.detail.activities')}:</b>
        ${t('cadence.stage.' + stage.id + '.activities')}</p>
      <p class="cadence-detail-row"><b>${t('cadence.detail.roles')}:</b>
        ${t('cadence.stage.' + stage.id + '.roles')}</p>
      <p class="cadence-detail-feedback">${t('cadence.stage.' + stage.id + '.feedback')}</p>
    </div>`;
}

function renderCompare() {
  const a = wovenRatio('agile');
  const w = wovenRatio('waterfall');
  return `
    <div class="cadence-compare" data-testid="cadence-compare">
      <h3>${t('cadence.compare.title')}</h3>
      <table class="cadence-compare-table">
        <thead><tr><th></th><th>${t('cadence.mode.agile')}</th><th>${t('cadence.mode.waterfall')}</th></tr></thead>
        <tbody>
          <tr>
            <td>${t('cadence.compare.woven')}</td>
            <td class="cadence-good">${a.woven} / ${a.total}</td>
            <td class="cadence-bad">${w.woven} / ${w.total}</td>
          </tr>
          <tr>
            <td>${t('cadence.compare.latency')}</td>
            <td class="cadence-good">${t('cadence.latency.agile')}</td>
            <td class="cadence-bad">${t('cadence.latency.waterfall')}</td>
          </tr>
          <tr>
            <td>${t('cadence.compare.escape')}</td>
            <td class="cadence-good">${t('cadence.escape.agile')}</td>
            <td class="cadence-bad">${t('cadence.escape.waterfall')}</td>
          </tr>
        </tbody>
      </table>
      <p class="cadence-shiftleft">⬅️ ${t('cadence.shiftleft.note')}</p>
    </div>`;
}

function renderBridges() {
  return `
    <div class="cadence-bridges">
      <button type="button" class="cadence-bridge" data-testid="cadence-bridge-vmodel"
        title="${t('cadence.bridge.vmodel.title')}">🔗 → ${t('flowTab.vmodel')}</button>
      <button type="button" class="cadence-bridge" data-testid="cadence-bridge-defectcost"
        title="${t('cadence.bridge.defectcost.title')}">🔗 → ${t('flowTab.defectCost')}</button>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="cadence-quiz-start" data-testid="cadence-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    const shareEncoded = encodeResult({
      v: 1, explorer: 'cadence', explorerLabel: t('cadence.title'),
      mode: 'quiz', ts: Date.now(), lang: getLocale(),
      score: correct ? 1 : 0, total: 1,
      items: [{
        q: t('cadence.quiz.prompt'),
        a: state.quiz.answer ? t('cadence.quiz.' + state.quiz.answer) : '',
        expected: t('cadence.quiz.c'),
        ok: correct,
      }],
    });
    return `<div class="cadence-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="cadence-quiz-result">
      <p>${correct ? t('cadence.quiz.correct') : t('cadence.quiz.wrong')}</p>
      <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="cadence-quiz-share">📋 ${t('quiz.share.btn')}</button>
    </div>`;
  }
  return `
    <div class="cadence-quiz" data-testid="cadence-quiz">
      <p class="cadence-quiz-prompt">${t('cadence.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="cadence-quiz-option">
          <input type="radio" name="cadence-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('cadence.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="cadence-quiz-submit" data-testid="cadence-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="cadence-lab-start" data-testid="cadence-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="cadence-lab" data-testid="cadence-lab">
      <p class="cadence-lab-prompt">${t('cadence.lab.prompt')}</p>
      <textarea class="cadence-lab-textarea" data-testid="cadence-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${esc(state.lab.text)}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="cadence-wrap" data-testid="cadence-wrap">
      <h2 class="cadence-title">${t('cadence.title')}</h2>
      <p class="cadence-desc">${t('cadence.desc')}</p>
      ${renderModeToggle()}
      ${renderTimeline()}
      ${renderStageDetail()}
      ${renderCompare()}
      ${renderBridges()}
      <section class="cadence-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.mode = btn.dataset.mode;
      state.activeStage = MODELS[state.mode].stages[0].id;
      render();
    });
  });
  root.querySelectorAll('[data-stage]').forEach((btn) => {
    btn.addEventListener('click', () => { state.activeStage = btn.dataset.stage; render(); });
  });
  root.querySelector('[data-testid="cadence-bridge-vmodel"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="flow"]')?.click();
    document.querySelector('[data-flow-tab="vmodel"]')?.click();
  });
  root.querySelector('[data-testid="cadence-bridge-defectcost"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="flow"]')?.click();
    document.querySelector('[data-flow-tab="defectCost"]')?.click();
  });
  root.querySelector('[data-testid="cadence-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="cadence-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="cadence-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="cadence-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="cadence-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createSprintCadenceExplorer() {
  state.mode = 'agile';
  state.activeStage = 'refine';
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}

export { AGILE_STAGES, WATERFALL_STAGES, MODELS, wovenRatio };
