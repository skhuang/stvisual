import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';

// M6 — Regression & Test-Debt Explorer.
// An agile regression suite grows every sprint. Left unmanaged, obsolete
// and flaky tests pile up: maintenance cost climbs while the value the
// suite delivers flattens out (diminishing returns), and the lines cross
// — that crossover is test debt. Pruning, quarantine and risk-based
// selection push the crossover back, or remove it entirely.

const SIM = {
  sprints: 12,
  add: 25,            // new tests written per sprint
  churnObsolete: 10,  // good tests that go obsolete per sprint (feature churn)
  churnFlaky: 7,      // good tests that turn flaky per sprint
  cap: 130,           // risk-based: max tests run per CI cycle
  flakyCostMult: 3,   // a flaky test costs this much more to live with
  secPerTest: 0.4,    // CI seconds per test
  vmax: 540,          // value ceiling — defect-catching saturates
  vscale: 62,         // how fast value saturates with good tests
  riskMiss: 0.92,     // risk-based runs a subset — a small value haircut
};

// Simulate the regression suite sprint by sprint under a strategy set.
function simulate(strategies) {
  let good = 0;
  let flaky = 0;
  let obsolete = 0;
  const rows = [];
  for (let s = 1; s <= SIM.sprints; s++) {
    good += SIM.add;
    const toObs = Math.min(good, SIM.churnObsolete);
    good -= toObs;
    obsolete += toObs;
    const toFlaky = Math.min(good, SIM.churnFlaky);
    good -= toFlaky;
    flaky += toFlaky;
    if (strategies.prune) obsolete = 0;
    const flakyRunning = strategies.quarantine ? 0 : flaky;
    const obsoleteRunning = strategies.prune ? 0 : obsolete;
    let active = good + flakyRunning + obsoleteRunning;
    let value = SIM.vmax * (1 - Math.exp(-good / SIM.vscale));
    if (strategies.riskBased) {
      active = Math.min(active, SIM.cap);
      value *= SIM.riskMiss;
    }
    const runtime = active * SIM.secPerTest;
    const cost = active + flakyRunning * SIM.flakyCostMult;
    rows.push({
      sprint: s,
      total: good + flaky + obsolete,
      active,
      flaky,
      flakyPct: (good + flaky + obsolete) ? flaky / (good + flaky + obsolete) : 0,
      runtime,
      cost,
      value,
      debt: cost - value,
    });
  }
  return rows;
}

// First sprint where maintenance cost overtakes value, or null.
function crossoverSprint(rows) {
  const row = rows.find((r) => r.cost > r.value);
  return row ? row.sprint : null;
}

const state = {
  strategies: { prune: false, quarantine: false, riskBased: false },
  quiz: { active: false, phase: 'idle', answer: '' },
  lab: { active: false, text: '' },
};

let root;
const STRATEGIES = ['prune', 'quarantine', 'riskBased'];

function fmtTime(s) {
  return s < 90 ? Math.round(s) + 's' : Math.floor(s / 60) + 'm ' + Math.round(s % 60) + 's';
}

function renderStrategies() {
  return `
    <div class="rdebt-strategies" data-testid="rdebt-strategies">
      <span class="rdebt-strat-label">${t('rdebt.strategies')}</span>
      ${STRATEGIES.map((s) => `
        <label class="rdebt-strat">
          <input type="checkbox" data-strategy="${s}" data-testid="rdebt-strat-${s}"
            ${state.strategies[s] ? 'checked' : ''}>
          ${t('rdebt.strat.' + s)}
        </label>`).join('')}
    </div>`;
}

// A two-line SVG chart: maintenance cost (red) vs value (green).
function renderChart(rows) {
  const W = 360;
  const H = 170;
  const padL = 8;
  const padR = 8;
  const padT = 10;
  const padB = 22;
  const max = Math.max(...rows.map((r) => Math.max(r.cost, r.value))) * 1.1 || 1;
  const x = (i) => padL + (i / (rows.length - 1)) * (W - padL - padR);
  const y = (v) => padT + (1 - v / max) * (H - padT - padB);
  const line = (key) => rows.map((r, i) => `${x(i).toFixed(1)},${y(r[key]).toFixed(1)}`).join(' ');
  const cross = crossoverSprint(rows);
  return `
    <div class="rdebt-chart-wrap" data-testid="rdebt-chart">
      <svg viewBox="0 0 ${W} ${H}" class="rdebt-chart" role="img" aria-label="${t('rdebt.chart.aria')}">
        <polyline class="rdebt-line rdebt-line--value" points="${line('value')}" />
        <polyline class="rdebt-line rdebt-line--cost" points="${line('cost')}" />
        ${cross !== null ? `<line class="rdebt-crossline"
          x1="${x(cross - 1)}" y1="${padT}" x2="${x(cross - 1)}" y2="${H - padB}" />` : ''}
        ${rows.map((r, i) => `<text class="rdebt-xtick" x="${x(i)}" y="${H - 7}" text-anchor="middle">${r.sprint}</text>`).join('')}
      </svg>
      <div class="rdebt-legend">
        <span class="rdebt-legend-item"><i class="rdebt-swatch rdebt-swatch--value"></i>${t('rdebt.legend.value')}</span>
        <span class="rdebt-legend-item"><i class="rdebt-swatch rdebt-swatch--cost"></i>${t('rdebt.legend.cost')}</span>
      </div>
    </div>`;
}

function renderSummary(rows) {
  const last = rows[rows.length - 1];
  const cross = crossoverSprint(rows);
  return `
    <div class="rdebt-summary" data-testid="rdebt-summary">
      <div class="rdebt-stats">
        <span class="rdebt-stat"><b>${last.total}</b> ${t('rdebt.stat.size')}</span>
        <span class="rdebt-stat"><b>${(last.flakyPct * 100).toFixed(0)}%</b> ${t('rdebt.stat.flaky')}</span>
        <span class="rdebt-stat"><b>${fmtTime(last.runtime)}</b> ${t('rdebt.stat.runtime')}</span>
      </div>
      <p class="rdebt-verdict ${cross !== null ? 'rdebt-verdict--debt' : 'rdebt-verdict--ok'}"
         data-testid="rdebt-verdict">
        ${cross !== null
          ? t('rdebt.verdict.debt', { n: cross })
          : t('rdebt.verdict.ok')}
      </p>
    </div>`;
}

function renderBridges() {
  return `
    <div class="rdebt-bridges">
      <button type="button" class="rdebt-bridge" data-testid="rdebt-bridge-rbt"
        title="${t('rdebt.bridge.rbt.title')}">🔗 → ${t('section.rbt')}</button>
      <button type="button" class="rdebt-bridge" data-testid="rdebt-bridge-flaky"
        title="${t('rdebt.bridge.flaky.title')}">🔗 → ${t('acceptanceTab.flaky')}</button>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="rdebt-quiz-start" data-testid="rdebt-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    const shareEncoded = encodeResult({
      v: 1, explorer: 'rdebt', explorerLabel: t('rdebt.title'),
      mode: 'quiz', ts: Date.now(), lang: getLocale(),
      score: correct ? 1 : 0, total: 1,
      items: [{
        q: t('rdebt.quiz.prompt'),
        a: state.quiz.answer ? t('rdebt.quiz.' + state.quiz.answer) : '',
        expected: t('rdebt.quiz.c'),
        ok: correct,
      }],
    });
    return `<div class="rdebt-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="rdebt-quiz-result">
      <p>${correct ? t('rdebt.quiz.correct') : t('rdebt.quiz.wrong')}</p>
      <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="rdebt-quiz-share">📋 ${t('quiz.share.btn')}</button>
    </div>`;
  }
  return `
    <div class="rdebt-quiz" data-testid="rdebt-quiz">
      <p class="rdebt-quiz-prompt">${t('rdebt.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="rdebt-quiz-option">
          <input type="radio" name="rdebt-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('rdebt.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="rdebt-quiz-submit" data-testid="rdebt-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="rdebt-lab-start" data-testid="rdebt-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="rdebt-lab" data-testid="rdebt-lab">
      <p class="rdebt-lab-prompt">${t('rdebt.lab.prompt')}</p>
      <textarea class="rdebt-lab-textarea" data-testid="rdebt-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  const rows = simulate(state.strategies);
  root.innerHTML = `
    <div class="rdebt-wrap" data-testid="rdebt-wrap">
      <h2 class="rdebt-title">${t('rdebt.title')}</h2>
      <p class="rdebt-desc">${t('rdebt.desc')}</p>
      ${renderStrategies()}
      ${renderChart(rows)}
      ${renderSummary(rows)}
      ${renderBridges()}
      <section class="rdebt-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-strategy]').forEach((inp) => {
    inp.addEventListener('change', () => {
      state.strategies[inp.dataset.strategy] = inp.checked;
      render();
    });
  });
  root.querySelector('[data-testid="rdebt-bridge-rbt"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="rbt"]')?.click();
  });
  root.querySelector('[data-testid="rdebt-bridge-flaky"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="acceptance"]')?.click();
    document.querySelector('[data-acceptance-tab="flaky"]')?.click();
  });
  root.querySelector('[data-testid="rdebt-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="rdebt-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="rdebt-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="rdebt-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="rdebt-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createRegressionDebtExplorer() {
  state.strategies = { prune: false, quarantine: false, riskBased: false };
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}

export { SIM, simulate, crossoverSprint };
