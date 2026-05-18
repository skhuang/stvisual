import { t, onLocaleChange } from '../i18n/index.js';
import { DICING_SCENARIOS } from '../data/dicingScenarios.js';
import { renderSliceCodeListing, renderSlicePdgGraph } from './SlicePdgView.js';
import { backwardSlice, dynamicSlice, programDice } from '../utils/slicing.js';

// N2 — Slice Dicing Explorer.
// Two modes:
//   static  — multi-output dicing (summary-stats scenario)
//   dynamic — multi-input dicing  (fare scenario)
// The dice highlights the suspect statements; the detail panel confirms
// the seeded bug is caught.

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

const state = {
  mode: 'static',            // 'static' | 'dynamic'
  scenarioId: null,          // currently active scenario id
  selectedOutput: null,      // static mode: wrong output variable
  pdgZoom: 1,
  quiz: { active: false, phase: 'idle', answer: '' },
};

let root;

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function scenariosForMode(mode) {
  return DICING_SCENARIOS.filter((s) => s.mode === mode);
}

function currentScenario() {
  const matches = scenariosForMode(state.mode);
  return matches.find((s) => s.id === state.scenarioId) || matches[0] || null;
}

function computeDice() {
  const scenario = currentScenario();
  if (!scenario) return { dice: new Set(), failing: new Set() };

  if (scenario.mode === 'static') {
    const wrongVar = state.selectedOutput || scenario.wrongOutput;
    const wrongOutput = scenario.outputs.find((o) => o.variable === wrongVar)
      || scenario.outputs[0];
    const failing = backwardSlice(scenario, {
      stmtId: wrongOutput.stmtId,
      variable: wrongOutput.variable,
    });
    const passingSlices = scenario.outputs
      .filter((o) => o.variable !== wrongOutput.variable)
      .map((o) => backwardSlice(scenario, { stmtId: o.stmtId, variable: o.variable }));
    const dice = programDice(failing, passingSlices);
    return { dice, failing };
  }

  // dynamic mode
  const failTrace = scenario.traces.find((tr) => tr.outcome === 'fail');
  if (!failTrace) return { dice: new Set(), failing: new Set() };
  const failing = dynamicSlice(scenario, failTrace, scenario.criterion);
  const passingSlices = scenario.traces
    .filter((tr) => tr.outcome === 'pass')
    .map((tr) => dynamicSlice(scenario, tr, scenario.criterion));
  const dice = programDice(failing, passingSlices);
  return { dice, failing };
}

// ── Sub-renderers ─────────────────────────────────────────────────────────────

function renderModeToggle() {
  return `<div class="sde-toggle-row">
    <span class="sde-toggle-label">${t('dicing.modeLabel')}</span>
    <button type="button"
      class="sde-toggle-btn${state.mode === 'static' ? ' sde-toggle-btn--active' : ''}"
      data-testid="dicing-mode-static" data-dicing-mode="static">
      ${t('dicing.modeStatic')}
    </button>
    <button type="button"
      class="sde-toggle-btn${state.mode === 'dynamic' ? ' sde-toggle-btn--active' : ''}"
      data-testid="dicing-mode-dynamic" data-dicing-mode="dynamic">
      ${t('dicing.modeDynamic')}
    </button>
  </div>`;
}

function renderScenarioChips() {
  const scenarios = scenariosForMode(state.mode);
  const activeId = currentScenario()?.id;
  return `<div class="sde-chip-bar">
    ${scenarios.map((s) => `
      <button type="button"
        class="sde-chip${activeId === s.id ? ' sde-chip--active' : ''}"
        data-testid="dicing-scenario-${s.id}"
        data-scenario-id="${s.id}">
        ${t(s.titleKey)}
      </button>`).join('')}
  </div>`;
}

function renderOutputPicker(scenario) {
  if (scenario.mode !== 'static') return '';
  const activeVar = state.selectedOutput || scenario.wrongOutput;
  return `<div class="sde-chip-bar sde-output-picker">
    <span class="sde-toggle-label">${t('dicing.outputLabel')}</span>
    ${scenario.outputs.map((o) => `
      <button type="button"
        class="sde-chip${activeVar === o.variable ? ' sde-chip--active sde-chip--wrong' : ''}"
        data-testid="dicing-output-${o.variable}"
        data-output-var="${o.variable}">
        ${esc(o.variable)}
      </button>`).join('')}
  </div>`;
}

function renderTraceList(scenario) {
  if (scenario.mode !== 'dynamic') return '';
  return `<div class="sde-trace-list">
    <span class="sde-toggle-label">${t('dicing.tracesLabel')}</span>
    ${scenario.traces.map((tr) => `
      <div class="sde-trace-row" data-testid="dicing-trace-${tr.id}">
        <span class="sde-trace-label">${esc(tr.inputLabel || tr.id)}</span>
        <span class="sde-outcome-badge sde-outcome-badge--${tr.outcome}">
          ${t(tr.outcome === 'fail' ? 'dicing.fail' : 'dicing.pass')}
          ${tr.outcome === 'fail'
            ? ` (${t('dicing.expected')}: ${tr.expected}, ${t('dicing.actual')}: ${tr.actual})`
            : ''}
        </span>
      </div>`).join('')}
  </div>`;
}

function renderGraphPanel(scenario, dice) {
  return `<div class="sde-graph" data-testid="dicing-graph">
    <div class="sde-graph-head">
      <h3 class="sde-col-title">${t('slicing.pdgTitle')}</h3>
      <div class="sde-zoom" role="group" aria-label="${t('slicing.zoomLabel')}">
        <button type="button" class="sde-zoom-btn" data-dicing-zoom="out"
          data-testid="dicing-zoom-out" aria-label="${t('slicing.zoomOut')}"
          ${state.pdgZoom <= ZOOM_MIN ? 'disabled' : ''}>&minus;</button>
        <span class="sde-zoom-val" data-testid="dicing-zoom-val">${Math.round(state.pdgZoom * 100)}%</span>
        <button type="button" class="sde-zoom-btn" data-dicing-zoom="in"
          data-testid="dicing-zoom-in" aria-label="${t('slicing.zoomIn')}"
          ${state.pdgZoom >= ZOOM_MAX ? 'disabled' : ''}>+</button>
      </div>
    </div>
    <div class="sde-graph-scroll">
      ${renderSlicePdgGraph(scenario, dice.dice, { secondary: dice.failing, zoom: state.pdgZoom, idPrefix: 'dicing' })}
    </div>
  </div>`;
}

function renderDicePanel(scenario, dice) {
  const inDice = scenario.statements.filter((s) => dice.dice.has(s.id));
  let body;
  if (!inDice.length) {
    body = `<p class="sde-slice-empty">${t('dicing.emptyDice')}</p>`;
  } else {
    body = `<ul class="sde-slice-items">
      ${inDice.map((s) => `
        <li class="sde-slice-item">
          <code class="sde-slice-id">${esc(s.id)}</code>
          <span class="sde-slice-text">${esc(s.text)}</span>
        </li>`).join('')}
    </ul>`;
  }
  return `<div class="sde-slice-list" data-testid="dicing-dice-panel">
    <h3 class="sde-col-title">${t('dicing.diceTitle')} <span class="sde-slice-count">(${inDice.length})</span></h3>
    ${body}
  </div>`;
}

function renderDetail(scenario, dice) {
  const count = dice.dice.size;
  const bugInDice = dice.dice.has(scenario.bug.stmtId);
  let content = `<span>${t('dicing.diceCount')}: <b>${count}</b></span>`;
  if (bugInDice) {
    content += ` <span class="sde-bug-caught">${t('dicing.bugCaught')} (${esc(scenario.bug.stmtId)}: ${esc(scenario.bug.note)})</span>`;
  }
  if (scenario.mode === 'dynamic') {
    content += ` <span class="sde-dicing-note">${t('dicing.dynamicNote')}</span>`;
  }
  return `<div class="sde-detail" data-testid="dicing-detail">${content}</div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="sde-quiz-start" data-testid="dicing-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    return `<div class="sde-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="dicing-quiz-result">
      <p>${correct ? t('dicing.quiz.correct') : t('dicing.quiz.wrong')}</p>
      <button type="button" class="sde-quiz-close" data-testid="dicing-quiz-close">${t('quiz.close')}</button>
    </div>`;
  }
  return `<div class="sde-quiz" data-testid="dicing-quiz">
    <p class="sde-quiz-prompt">${t('dicing.quiz.prompt')}</p>
    ${['a', 'b', 'c', 'd'].map((k) => `
      <label class="sde-quiz-option">
        <input type="radio" name="sde-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
        ${t('dicing.quiz.' + k)}
      </label>`).join('')}
    <button type="button" class="sde-quiz-submit" data-testid="dicing-quiz-submit"
      ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
  </div>`;
}

function render() {
  const scenario = currentScenario();
  const dice = scenario ? computeDice() : { dice: new Set(), failing: new Set() };

  root.innerHTML = `
    <div class="sde-wrap">
      <h2 class="sde-title">${t('dicing.title')}</h2>
      <p class="sde-desc">${t('dicing.desc')}</p>

      <section class="sde-controls">
        ${renderModeToggle()}
        ${renderScenarioChips()}
        ${scenario ? renderOutputPicker(scenario) : ''}
        ${scenario && scenario.mode === 'dynamic' ? renderTraceList(scenario) : ''}
      </section>

      ${scenario ? `
        <div class="sde-code-wrap">
          <h3 class="sde-col-title">${t('slicing.codeTitle')}</h3>
          ${renderSliceCodeListing(scenario, dice.dice, { secondary: dice.failing })}
        </div>

        <div class="sde-graph-row">
          ${renderGraphPanel(scenario, dice)}
          ${renderDicePanel(scenario, dice)}
        </div>

        ${renderDetail(scenario, dice)}
      ` : ''}

      <section class="sde-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
      </section>
    </div>`;

  bindEvents();
}

function bindEvents() {
  // Mode toggle
  root.querySelectorAll('[data-dicing-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const newMode = btn.dataset.dicingMode;
      if (state.mode !== newMode) {
        state.mode = newMode;
        state.scenarioId = null;
        state.selectedOutput = null;
      }
      render();
    });
  });

  // Scenario chips
  root.querySelectorAll('[data-scenario-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (state.scenarioId !== btn.dataset.scenarioId) {
        state.scenarioId = btn.dataset.scenarioId;
        state.selectedOutput = null;
      }
      render();
    });
  });

  // Output picker (static mode)
  root.querySelectorAll('[data-output-var]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedOutput = btn.dataset.outputVar;
      render();
    });
  });

  // PDG zoom
  root.querySelectorAll('[data-dicing-zoom]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = state.pdgZoom + (btn.dataset.dicingZoom === 'in' ? ZOOM_STEP : -ZOOM_STEP);
      state.pdgZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(next * 100) / 100));
      render();
    });
  });

  // Quiz
  root.querySelector('[data-testid="dicing-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="sde-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="dicing-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="dicing-quiz-close"]')?.addEventListener('click', () => {
    state.quiz = { active: false, phase: 'idle', answer: '' };
    render();
  });
}

export function createSliceDicingExplorer() {
  state.mode = 'static';
  state.scenarioId = null;
  state.selectedOutput = null;
  state.pdgZoom = 1;
  state.quiz = { active: false, phase: 'idle', answer: '' };

  root = document.createElement('div');
  root.dataset.testid = 'slice-dicing-explorer';

  onLocaleChange(() => render());
  render();
  return root;
}
