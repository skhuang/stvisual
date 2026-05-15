import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';

// Pre-defined target function
const TARGET_FN = `function classify(score) {
  if (score < 0) return 'invalid';
  if (score < 60) return 'fail';
  if (score < 90) return 'pass';
  return 'excellence';
}`;

// Lines that count as executable (1-indexed)
const EXECUTABLE_LINES = [2, 3, 4, 5, 6];

// Mutant definitions: each has an id, label, category, and a predicate that
// returns true if a given test { input, expected } kills this mutant.
const MUTANTS = [
  {
    id: 1, equivalent: false, category: 'ROR',
    label: 'M1: score < 0  →  score <= 0',
    desc: 'ROR: changes boundary for invalid check',
    mutatedLine: 2,
    kill: (tests) => tests.some(({ input, expected }) => {
      // Original: classify(0) = 'fail'; Mutant: classify(0) = 'invalid'
      return input === 0 && expected === 'fail';
    }),
  },
  {
    id: 2, equivalent: false, category: 'ROR',
    label: 'M2: score < 60  →  score <= 60',
    desc: 'ROR: changes boundary for fail/pass',
    mutatedLine: 3,
    kill: (tests) => tests.some(({ input, expected }) => {
      // Original: classify(60) = 'pass'; Mutant: classify(60) = 'fail'
      return input === 60 && expected === 'pass';
    }),
  },
  {
    id: 3, equivalent: false, category: 'ROR',
    label: 'M3: score < 90  →  score <= 90',
    desc: 'ROR: changes boundary for pass/excellence',
    mutatedLine: 4,
    kill: (tests) => tests.some(({ input, expected }) => {
      // Original: classify(90) = 'excellence'; Mutant: classify(90) = 'pass'
      return input === 90 && expected === 'excellence';
    }),
  },
  {
    id: 4, equivalent: false, category: 'SDL',
    label: 'M4: if (score < 0) guard deleted',
    desc: 'SDL: removes invalid guard entirely',
    mutatedLine: 2,
    kill: (tests) => tests.some(({ input, expected }) => {
      // Original: classify(-1) = 'invalid'; Mutant: classify(-1) = 'fail'
      return input === -1 && expected === 'invalid';
    }),
  },
  {
    id: 5, equivalent: false, category: 'SRC',
    label: 'M5: return \'fail\'  →  return \'pass\'',
    desc: 'SRC: wrong return string in fail branch',
    mutatedLine: 3,
    kill: (tests) => tests.some(({ input, expected }) => {
      return input >= 0 && input < 60 && expected === 'fail';
    }),
  },
  {
    id: 6, equivalent: false, category: 'SRC',
    label: 'M6: return \'excellence\'  →  return \'pass\'',
    desc: 'SRC: wrong return string in excellence branch',
    mutatedLine: 5,
    kill: (tests) => tests.some(({ input, expected }) => {
      return input >= 90 && expected === 'excellence';
    }),
  },
  {
    id: 7, equivalent: true, category: 'SRC',
    label: 'M7: return \'pass\'  →  return \'pass\' (no-op) [EQUIVALENT]',
    desc: 'SRC: same string — always equivalent',
    mutatedLine: 4,
    kill: () => false,
  },
];

const NON_EQUIV_MUTANTS = MUTANTS.filter((m) => !m.equivalent);

// Preset test scenarios
const PRESETS = [
  {
    id: 'highcov',
    labelKey: 'msx.preset.highcov',
    tests: [
      { input: -5, expected: 'invalid' },
      { input: 30, expected: 'fail' },
      { input: 75, expected: 'pass' },
      { input: 95, expected: 'excellence' },
    ],
  },
  {
    id: 'highmut',
    labelKey: 'msx.preset.highmut',
    tests: [
      { input: 0, expected: 'fail' },
      { input: 60, expected: 'pass' },
      { input: 90, expected: 'excellence' },
      { input: -1, expected: 'invalid' },
    ],
  },
  {
    id: 'empty',
    labelKey: 'msx.preset.empty',
    tests: [],
  },
];

const state = {
  tests: [...PRESETS[0].tests],
  inputVal: '',
  expectedVal: 'fail',
  inputError: '',
  quiz: { active: false, phase: 'idle', answer: '' },
  lab: { active: false, passed: false },
};

let root;

function computeCoverage(tests) {
  if (tests.length === 0) return { covered: new Set(), pct: 0 };
  const covered = new Set();
  for (const { input } of tests) {
    covered.add(1); // function header always executed
    if (input < 0) { covered.add(2); continue; }
    covered.add(2);
    if (input < 60) { covered.add(3); continue; }
    covered.add(3);
    if (input < 90) { covered.add(4); continue; }
    covered.add(4);
    covered.add(5);
  }
  const execCovered = [...covered].filter((l) => EXECUTABLE_LINES.includes(l));
  return { covered, pct: Math.round((execCovered.length / EXECUTABLE_LINES.length) * 100) };
}

function computeMutationResults(tests) {
  return MUTANTS.map((m) => ({
    ...m,
    killed: !m.equivalent && m.kill(tests),
  }));
}

function computeMutationScore(results) {
  const nonEquiv = results.filter((m) => !m.equivalent);
  const killed = nonEquiv.filter((m) => m.killed);
  return nonEquiv.length > 0 ? Math.round((killed.length / nonEquiv.length) * 100) : 0;
}

// Tests that kill mutants but don't increase coverage vs baseline
function computeInsight(tests) {
  if (tests.length < 2) return null;
  let killsWithoutCov = 0;
  const fullResults = computeMutationResults(tests);
  const fullKilled = new Set(fullResults.filter((m) => m.killed).map((m) => m.id));
  for (let i = 0; i < tests.length; i++) {
    const without = tests.filter((_, j) => j !== i);
    const withoutCov = computeCoverage(without).pct;
    const withoutResults = computeMutationResults(without);
    const withoutKilled = new Set(withoutResults.filter((m) => m.killed).map((m) => m.id));
    const covWithTest = computeCoverage(tests).pct;
    const addsNewKills = [...fullKilled].some((id) => !withoutKilled.has(id));
    const addsNoCov = covWithTest === withoutCov;
    if (addsNewKills && addsNoCov) killsWithoutCov++;
  }
  return killsWithoutCov;
}

function renderMeter(label, pct, colorClass) {
  return `
    <div class="msx-meter">
      <div class="msx-meter-label">${label}</div>
      <div class="msx-meter-bar-wrap">
        <div class="msx-meter-bar ${colorClass}" style="width:${pct}%"></div>
      </div>
      <div class="msx-meter-pct">${pct}%</div>
    </div>`;
}

function renderMutantList(results) {
  return `
    <div class="msx-mutant-list" data-testid="msx-mutant-list">
      <h4>${t('msx.mutants.title')}</h4>
      <table class="msx-mutant-table">
        <thead><tr>
          <th>${t('msx.col.id')}</th>
          <th>${t('msx.col.category')}</th>
          <th>${t('msx.col.label')}</th>
          <th>${t('msx.col.status')}</th>
        </tr></thead>
        <tbody>
          ${results.map((m) => {
            let statusCls, statusTxt;
            if (m.equivalent) { statusCls = 'msx-status-equiv'; statusTxt = t('msx.status.equiv'); }
            else if (m.killed) { statusCls = 'msx-status-killed'; statusTxt = t('msx.status.killed'); }
            else { statusCls = 'msx-status-alive'; statusTxt = t('msx.status.alive'); }
            return `<tr class="${m.equivalent ? 'msx-row-equiv' : m.killed ? 'msx-row-killed' : 'msx-row-alive'}">
              <td>M${m.id}</td>
              <td><span class="msx-cat-badge">${m.category}</span></td>
              <td class="msx-mutant-desc">${m.label}</td>
              <td><span class="msx-status ${statusCls}">${statusTxt}</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderTestList(tests) {
  return `
    <div class="msx-test-list" data-testid="msx-test-list">
      <h4>${t('msx.tests.title')} (${tests.length})</h4>
      ${tests.length === 0
        ? `<p class="msx-empty">${t('msx.tests.empty')}</p>`
        : `<table class="msx-test-table">
            <thead><tr><th>${t('msx.col.input')}</th><th>${t('msx.col.expected')}</th><th></th></tr></thead>
            <tbody>
              ${tests.map((tc, i) => `
                <tr>
                  <td><code>score = ${tc.input}</code></td>
                  <td><code>'${tc.expected}'</code></td>
                  <td><button type="button" class="msx-remove-btn" data-testid="msx-remove-${i}" data-idx="${i}">×</button></td>
                </tr>`).join('')}
            </tbody>
          </table>`}
    </div>`;
}

function renderAddTest() {
  const opts = ['invalid', 'fail', 'pass', 'excellence'];
  return `
    <div class="msx-add-test" data-testid="msx-add-test">
      <h4>${t('msx.add.title')}</h4>
      <div class="msx-add-row">
        <label class="msx-add-label">${t('msx.add.score')}
          <input class="msx-add-input" type="number" data-testid="msx-score-input"
            value="${state.inputVal}" min="-10" max="110" placeholder="-5…100">
        </label>
        <label class="msx-add-label">${t('msx.add.expected')}
          <select class="msx-add-select" data-testid="msx-expected-select">
            ${opts.map((o) => `<option value="${o}" ${state.expectedVal === o ? 'selected' : ''}>${o}</option>`).join('')}
          </select>
        </label>
        <button type="button" class="msx-add-btn" data-testid="msx-add-btn">${t('msx.add.btn')}</button>
      </div>
      ${state.inputError ? `<p class="msx-add-error">${state.inputError}</p>` : ''}
    </div>`;
}

function renderPresets() {
  return `
    <div class="msx-presets" data-testid="msx-presets">
      <span class="msx-presets-label">${t('msx.presets.label')}</span>
      ${PRESETS.map((p) => `
        <button type="button" class="msx-preset-btn" data-preset="${p.id}">${t(p.labelKey)}</button>
      `).join('')}
    </div>`;
}

function renderQuiz(score) {
  if (!state.quiz.active) {
    return `<button type="button" class="msx-quiz-start" data-testid="msx-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const ans = parseInt(state.quiz.answer, 10);
    const correct = ans === score;
    const shareEncoded = encodeResult({
      v: 1, explorer: 'msx', explorerLabel: t('msx.title'),
      mode: 'quiz', ts: Date.now(), lang: getLocale(),
      score: correct ? 1 : 0, total: 1,
      items: [{
        q: t('msx.quiz.prompt', { total: NON_EQUIV_MUTANTS.length }),
        a: String(state.quiz.answer ?? ''),
        expected: String(score),
        ok: correct,
      }],
    });
    return `<div class="msx-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="msx-quiz-result">
      <p>${correct ? t('msx.quiz.correct') : t('msx.quiz.wrong', { score })}</p>
      <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="msx-quiz-share">📋 ${t('quiz.share.btn')}</button>
    </div>`;
  }
  return `
    <div class="msx-quiz" data-testid="msx-quiz">
      <p class="msx-quiz-prompt">${t('msx.quiz.prompt', { total: NON_EQUIV_MUTANTS.length })}</p>
      <input type="number" class="msx-quiz-input" data-testid="msx-quiz-input"
        value="${state.quiz.answer}" min="0" max="100" placeholder="0–100">
      <button type="button" class="msx-quiz-submit" data-testid="msx-quiz-submit" ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLabMetric(score) {
  const passed = score >= 80;
  if (!state.lab.active) {
    return `<button type="button" class="msx-lab-start" data-testid="msx-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="msx-lab ${passed ? 'msx-lab--passed' : ''}" data-testid="msx-lab">
      <p>${t('msx.lab.goal')}</p>
      <div class="msx-lab-status">
        ${passed
          ? `<span class="msx-lab-ok">✓ ${t('msx.lab.passed', { score })}</span>`
          : `<span class="msx-lab-notok">${t('msx.lab.notpassed', { score })}</span>`}
      </div>
    </div>`;
}

function render() {
  const results = computeMutationResults(state.tests);
  const cov = computeCoverage(state.tests);
  const mutScore = computeMutationScore(results);
  const insight = computeInsight(state.tests);

  root.innerHTML = `
    <div class="msx-wrap" data-testid="msx-wrap">
      <div class="emx-paper-cite" data-testid="msx-paper-cite">
        <div class="emx-paper-header">
          <span class="emx-paper-badge">arXiv</span>
          <a class="emx-paper-link" href="https://arxiv.org/abs/2501.12862" target="_blank" rel="noopener noreferrer">
            Mutation-Guided LLM-based Test Generation at Meta
          </a>
          <span class="emx-paper-venue">FSE 2025 · arXiv:2501.12862</span>
        </div>
        <p class="emx-paper-abstract" style="margin-top:0.4rem;font-size:0.78rem;color:#475569;">
          ${t('msx.paper.finding')}
        </p>
      </div>

      <h2 class="msx-title">${t('msx.title')}</h2>
      <p class="msx-desc">${t('msx.desc')}</p>

      <div class="msx-fn-box" data-testid="msx-fn-box">
        <h3>${t('msx.fn.title')}</h3>
        <pre class="msx-fn-code">${TARGET_FN}</pre>
      </div>

      <div class="msx-dashboard" data-testid="msx-dashboard">
        ${renderMeter(t('msx.meter.cov'), cov.pct, 'msx-bar-blue')}
        ${renderMeter(t('msx.meter.mut'), mutScore, 'msx-bar-green')}
      </div>

      ${insight !== null ? `
        <div class="msx-insight" data-testid="msx-insight">
          <span class="msx-insight-num">${insight}</span>
          <span class="msx-insight-txt">${t('msx.insight', { n: insight, total: state.tests.length })}</span>
          <span class="msx-insight-ref">${t('msx.insight.ref')}</span>
        </div>` : ''}

      <div class="msx-two-col">
        <div>
          ${renderTestList(state.tests)}
          ${renderAddTest()}
          ${renderPresets()}
        </div>
        <div>
          ${renderMutantList(results)}
        </div>
      </div>

      <section class="msx-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz(mutScore)}
        <h3>${t('lab.metric.title')}</h3>
        ${renderLabMetric(mutScore)}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  // Remove test
  root.querySelectorAll('[data-idx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      state.tests.splice(idx, 1);
      render();
    });
  });

  // Input fields
  root.querySelector('[data-testid="msx-score-input"]')?.addEventListener('input', (e) => {
    state.inputVal = e.target.value;
  });
  root.querySelector('[data-testid="msx-expected-select"]')?.addEventListener('change', (e) => {
    state.expectedVal = e.target.value;
  });

  // Add test
  root.querySelector('[data-testid="msx-add-btn"]')?.addEventListener('click', () => {
    const raw = state.inputVal.trim();
    const num = parseInt(raw, 10);
    if (raw === '' || isNaN(num) || num < -10 || num > 110) {
      state.inputError = t('msx.add.error');
      render();
      return;
    }
    state.tests.push({ input: num, expected: state.expectedVal });
    state.inputVal = '';
    state.inputError = '';
    render();
  });

  // Presets
  root.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = PRESETS.find((x) => x.id === btn.dataset.preset);
      if (p) { state.tests = [...p.tests]; render(); }
    });
  });

  // Quiz
  root.querySelector('[data-testid="msx-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' }; render();
  });
  root.querySelector('[data-testid="msx-quiz-input"]')?.addEventListener('input', (e) => {
    state.quiz.answer = e.target.value; render();
  });
  root.querySelector('[data-testid="msx-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done'; render();
  });

  // Lab
  root.querySelector('[data-testid="msx-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true; render();
  });
}

export function createMutationScoreExplorer() {
  state.tests = [...PRESETS[0].tests];
  state.inputVal = '';
  state.expectedVal = 'fail';
  state.inputError = '';
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab = { active: false, passed: false };
  root = document.createElement('div');
  render();
  return root;
}
