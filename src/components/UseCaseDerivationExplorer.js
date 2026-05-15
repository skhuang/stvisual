import { t } from '../i18n/index.js';

// Three preset use cases. Each flow id is unique so the rendered list
// stays addressable by data-testid. `kind` drives colour-coding.
const USE_CASES = [
  {
    id: 'atm',
    titleKey: 'uc.case.atm.title',
    actorKey: 'uc.case.atm.actor',
    preKey:   'uc.case.atm.pre',
    postKey:  'uc.case.atm.post',
    flows: [
      { id: 'main',  kind: 'main',      titleKey: 'uc.case.atm.flow.main.title',  outcomeKey: 'uc.case.atm.flow.main.outcome',
        steps: ['uc.case.atm.flow.main.step1', 'uc.case.atm.flow.main.step2', 'uc.case.atm.flow.main.step3'] },
      { id: 'alt-savings', kind: 'alternate', titleKey: 'uc.case.atm.flow.altSavings.title', outcomeKey: 'uc.case.atm.flow.altSavings.outcome',
        steps: ['uc.case.atm.flow.altSavings.step1', 'uc.case.atm.flow.altSavings.step2'] },
      { id: 'alt-foreign', kind: 'alternate', titleKey: 'uc.case.atm.flow.altForeign.title', outcomeKey: 'uc.case.atm.flow.altForeign.outcome',
        steps: ['uc.case.atm.flow.altForeign.step1', 'uc.case.atm.flow.altForeign.step2'] },
      { id: 'exc-funds', kind: 'exception', titleKey: 'uc.case.atm.flow.excFunds.title', outcomeKey: 'uc.case.atm.flow.excFunds.outcome',
        steps: ['uc.case.atm.flow.excFunds.step1', 'uc.case.atm.flow.excFunds.step2'] },
      { id: 'exc-card', kind: 'exception', titleKey: 'uc.case.atm.flow.excCard.title', outcomeKey: 'uc.case.atm.flow.excCard.outcome',
        steps: ['uc.case.atm.flow.excCard.step1', 'uc.case.atm.flow.excCard.step2'] },
    ],
  },
  {
    id: 'booking',
    titleKey: 'uc.case.booking.title',
    actorKey: 'uc.case.booking.actor',
    preKey:   'uc.case.booking.pre',
    postKey:  'uc.case.booking.post',
    flows: [
      { id: 'main', kind: 'main', titleKey: 'uc.case.booking.flow.main.title', outcomeKey: 'uc.case.booking.flow.main.outcome',
        steps: ['uc.case.booking.flow.main.step1', 'uc.case.booking.flow.main.step2', 'uc.case.booking.flow.main.step3'] },
      { id: 'alt-seat', kind: 'alternate', titleKey: 'uc.case.booking.flow.altSeat.title', outcomeKey: 'uc.case.booking.flow.altSeat.outcome',
        steps: ['uc.case.booking.flow.altSeat.step1', 'uc.case.booking.flow.altSeat.step2'] },
      { id: 'exc-pay', kind: 'exception', titleKey: 'uc.case.booking.flow.excPay.title', outcomeKey: 'uc.case.booking.flow.excPay.outcome',
        steps: ['uc.case.booking.flow.excPay.step1', 'uc.case.booking.flow.excPay.step2'] },
    ],
  },
  {
    id: 'adduser',
    titleKey: 'uc.case.adduser.title',
    actorKey: 'uc.case.adduser.actor',
    preKey:   'uc.case.adduser.pre',
    postKey:  'uc.case.adduser.post',
    flows: [
      { id: 'main', kind: 'main', titleKey: 'uc.case.adduser.flow.main.title', outcomeKey: 'uc.case.adduser.flow.main.outcome',
        steps: ['uc.case.adduser.flow.main.step1', 'uc.case.adduser.flow.main.step2'] },
      { id: 'alt-admin', kind: 'alternate', titleKey: 'uc.case.adduser.flow.altAdmin.title', outcomeKey: 'uc.case.adduser.flow.altAdmin.outcome',
        steps: ['uc.case.adduser.flow.altAdmin.step1', 'uc.case.adduser.flow.altAdmin.step2'] },
      { id: 'exc-dup', kind: 'exception', titleKey: 'uc.case.adduser.flow.excDup.title', outcomeKey: 'uc.case.adduser.flow.excDup.outcome',
        steps: ['uc.case.adduser.flow.excDup.step1', 'uc.case.adduser.flow.excDup.step2'] },
    ],
  },
];

// Coverage state per use case: which flows the student has "covered" by
// generating a test for. Main flow is auto-covered at load.
function defaultCoverage(uc) {
  const out = {};
  for (const f of uc.flows) out[f.id] = f.kind === 'main';
  return out;
}

const state = {
  caseIdx: 0,
  coverage: {}, // { [useCaseId]: { [flowId]: true } }
  selectedFlowId: null,
  quiz: { active: false, phase: 'idle', answer: '' },
  lab:  { active: false, text: '' },
};

let root;

export function countFlowsByKind(uc) {
  const counts = { main: 0, alternate: 0, exception: 0 };
  for (const f of uc.flows) counts[f.kind]++;
  return counts;
}

export function minimumTestCases(uc) {
  // One case per flow — the textbook minimum.
  return uc.flows.length;
}

function currentCase() {
  return USE_CASES[state.caseIdx];
}

function currentCoverage() {
  const uc = currentCase();
  if (!state.coverage[uc.id]) state.coverage[uc.id] = defaultCoverage(uc);
  return state.coverage[uc.id];
}

function renderCaseHeader() {
  const uc = currentCase();
  const counts = countFlowsByKind(uc);
  return `
    <div class="uc-case-header" data-testid="uc-case-header">
      <h3>${t(uc.titleKey)}</h3>
      <ul class="uc-meta">
        <li><strong>${t('uc.meta.actor')}:</strong> ${t(uc.actorKey)}</li>
        <li><strong>${t('uc.meta.pre')}:</strong> ${t(uc.preKey)}</li>
        <li><strong>${t('uc.meta.post')}:</strong> ${t(uc.postKey)}</li>
        <li><strong>${t('uc.meta.flows')}:</strong>
          ${t('uc.kind.main')} ${counts.main} ·
          ${t('uc.kind.alternate')} ${counts.alternate} ·
          ${t('uc.kind.exception')} ${counts.exception}</li>
      </ul>
    </div>`;
}

function renderFlows() {
  const uc = currentCase();
  const cov = currentCoverage();
  return `
    <div class="uc-flows" data-testid="uc-flows">
      <h3>${t('uc.flows.title')}</h3>
      <ul class="uc-flow-list">
        ${uc.flows.map((f) => `
          <li class="uc-flow uc-flow--${f.kind}${state.selectedFlowId === f.id ? ' uc-flow--selected' : ''}"
              data-flow="${f.id}" data-testid="uc-flow-${f.id}">
            <span class="uc-flow__kind">${t('uc.kind.' + f.kind)}</span>
            <span class="uc-flow__title">${t(f.titleKey)}</span>
            <label class="uc-flow__cov">
              <input type="checkbox" data-flow-cov="${f.id}"
                ${cov[f.id] ? 'checked' : ''}
                ${f.kind === 'main' ? 'disabled' : ''}
                data-testid="uc-flow-cov-${f.id}">
              ${t('uc.flow.covered')}
            </label>
          </li>`).join('')}
      </ul>
      ${renderCoverageMeter()}
    </div>`;
}

function renderCoverageMeter() {
  const uc = currentCase();
  const cov = currentCoverage();
  const altTotal = uc.flows.filter((f) => f.kind === 'alternate').length;
  const altDone  = uc.flows.filter((f) => f.kind === 'alternate' && cov[f.id]).length;
  const excTotal = uc.flows.filter((f) => f.kind === 'exception').length;
  const excDone  = uc.flows.filter((f) => f.kind === 'exception' && cov[f.id]).length;
  const total = uc.flows.length;
  const done  = uc.flows.filter((f) => cov[f.id]).length;
  return `
    <div class="uc-meter" data-testid="uc-meter">
      <div class="uc-meter__row"><span>${t('uc.meter.total')}</span><span>${done} / ${total}</span></div>
      ${altTotal > 0 ? `<div class="uc-meter__row"><span>${t('uc.meter.alt')}</span><span>${altDone} / ${altTotal}</span></div>` : ''}
      ${excTotal > 0 ? `<div class="uc-meter__row"><span>${t('uc.meter.exc')}</span><span>${excDone} / ${excTotal}</span></div>` : ''}
      <div class="uc-meter__bar"><div class="uc-meter__fill" style="width:${(done / total) * 100}%"></div></div>
    </div>`;
}

function renderTestCases() {
  const uc = currentCase();
  const cov = currentCoverage();
  const generated = uc.flows.filter((f) => cov[f.id]);
  return `
    <div class="uc-cases" data-testid="uc-cases">
      <h3>${t('uc.cases.title', { n: generated.length })}</h3>
      ${generated.length === 0 ? `<p class="uc-empty">${t('uc.cases.empty')}</p>` : ''}
      <ol class="uc-case-list">
        ${generated.map((f) => `
          <li class="uc-case uc-case--${f.kind}" data-testid="uc-case-${f.id}">
            <header>
              <span class="uc-case__kind">${t('uc.kind.' + f.kind)}</span>
              <span class="uc-case__title">${t(f.titleKey)}</span>
              ${f.kind === 'exception' ? `
                <button type="button" class="uc-case__bridge"
                  data-testid="uc-bridge-rbt"
                  title="${t('uc.bridge.rbt.title')}">
                  🔗 → ${t('section.rbt')}
                </button>` : ''}
            </header>
            <ol class="uc-case__steps">
              ${f.steps.map((s) => `<li>${t(s)}</li>`).join('')}
            </ol>
            <p class="uc-case__outcome">
              <strong>${t('uc.case.expected')}:</strong> ${t(f.outcomeKey)}
            </p>
          </li>`).join('')}
      </ol>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="uc-quiz-start" data-testid="uc-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    return `<div class="uc-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="uc-quiz-result">
      <p>${correct ? t('uc.quiz.correct') : t('uc.quiz.wrong')}</p>
    </div>`;
  }
  return `
    <div class="uc-quiz" data-testid="uc-quiz">
      <p class="uc-quiz-prompt">${t('uc.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="uc-quiz-option">
          <input type="radio" name="uc-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('uc.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="uc-quiz-submit" data-testid="uc-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="uc-lab-start" data-testid="uc-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="uc-lab" data-testid="uc-lab">
      <p class="uc-lab-prompt">${t('uc.lab.prompt')}</p>
      <textarea class="uc-lab-textarea" data-testid="uc-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="uc-wrap" data-testid="uc-wrap">
      <h2 class="uc-title">${t('uc.title')}</h2>
      <p class="uc-desc">${t('uc.desc')}</p>

      <div class="uc-presets" data-testid="uc-presets">
        ${USE_CASES.map((u, i) => `
          <button type="button"
            class="uc-preset-chip${i === state.caseIdx ? ' uc-preset-chip--active' : ''}"
            data-case="${i}"
            data-testid="uc-preset-${u.id}">${t(u.titleKey)}</button>`).join('')}
      </div>

      ${renderCaseHeader()}

      <div class="uc-two-col">
        ${renderFlows()}
        ${renderTestCases()}
      </div>

      <section class="uc-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-case]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.caseIdx = Number(btn.dataset.case);
      state.selectedFlowId = null;
      render();
    });
  });
  root.querySelectorAll('[data-flow-cov]').forEach((cb) => {
    cb.addEventListener('change', () => {
      const cov = currentCoverage();
      cov[cb.dataset.flowCov] = cb.checked;
      render();
    });
  });
  root.querySelectorAll('[data-testid="uc-bridge-rbt"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelector('[data-section="rbt"]')?.click();
      document.querySelector('[data-testid="section-rbt"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  root.querySelector('[data-testid="uc-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="uc-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="uc-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="uc-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="uc-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createUseCaseDerivationExplorer() {
  state.caseIdx = 0;
  state.coverage = {};
  state.selectedFlowId = null;
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab  = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}

// Exposed for tests.
export { USE_CASES };
