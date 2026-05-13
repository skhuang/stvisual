import { t, getLocale } from '../i18n/index.js';
import { generateBvaTests, generateRobustBvaTests } from '../utils/blackboxTesting.js';
import { encodeResult } from '../utils/resultExporter.js';

const STORAGE_KEY = 'stvisual.bva.v1';
const PARAM_LIMIT = 5;

// Built-in examples: {id, name, params:[{name,min,max}]}
const EXAMPLES = [
  {
    id: 'nextDate',
    name: 'NextDate(month, day)',
    params: [
      { name: 'month', min: 1, max: 12 },
      { name: 'day',   min: 1, max: 31 },
    ],
  },
  {
    id: 'triangle',
    name: 'Triangle(a, b, c)',
    params: [
      { name: 'a', min: 1, max: 200 },
      { name: 'b', min: 1, max: 200 },
      { name: 'c', min: 1, max: 200 },
    ],
  },
  {
    id: 'abs',
    name: 'abs(x)',
    params: [{ name: 'x', min: -100, max: 100 }],
  },
  {
    id: 'clamp',
    name: 'clamp(x, lo, hi)',
    params: [
      { name: 'x',  min: -50, max: 50 },
      { name: 'lo', min: -50, max: 50 },
      { name: 'hi', min: -50, max: 50 },
    ],
  },
];

function escapeHtml(v = '') {
  return String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function loadSaved() {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function persist(state) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify({
      exampleId: state.exampleId,
      params: state.params,
      robust: state.robust,
    }));
  } catch {}
}

function expectedBva(param) {
  const { min, max } = param;
  const nom = Math.round((min + max) / 2);
  return [min, min + 1, nom, max - 1, max];
}

export function createBoundaryValueExplorer() {
  const root = document.createElement('div');
  root.className = 'bva-explorer';
  root.dataset.testid = 'bva-explorer';

  const saved = loadSaved();
  const defaultEx = EXAMPLES[0];
  const state = {
    exampleId: saved?.exampleId ?? defaultEx.id,
    params: saved?.params ?? defaultEx.params.map((p) => ({ ...p })),
    robust: saved?.robust ?? false,
  };

  const quiz = { active: false, paramIdx: 0, answers: ['', '', '', '', ''], phase: 'question', result: null };

  function getTests() {
    const valid = state.params.filter((p) => p.name && isFinite(p.min) && isFinite(p.max) && p.min < p.max);
    if (!valid.length) return [];
    return state.robust ? generateRobustBvaTests(valid) : generateBvaTests(valid);
  }

  function validParams() {
    return state.params.filter((p) => p.name && isFinite(p.min) && isFinite(p.max) && p.min < p.max);
  }

  function pickQuizParam() {
    const vp = validParams();
    quiz.paramIdx = Math.floor(Math.random() * vp.length);
    quiz.answers = ['', '', '', '', ''];
    quiz.phase = 'question';
    quiz.result = null;
  }

  function gradeQuiz() {
    const vp = validParams();
    if (!vp.length) return;
    const param = vp[quiz.paramIdx] ?? vp[0];
    const expected = expectedBva(param);
    const userNums = quiz.answers.map((a) => Number(a));
    const correct = expected.map((e, i) => userNums[i] === e);
    quiz.result = { expected, correct, score: correct.filter(Boolean).length };
    quiz.phase = 'graded';
    render();
  }

  function renderQuizPanel() {
    if (!quiz.active) return '';
    const vp = validParams();
    if (!vp.length) {
      return `<div class="quiz-panel" data-testid="bva-quiz">
        <p>${escapeHtml(t('bva.hint'))}</p>
      </div>`;
    }
    const param = vp[quiz.paramIdx] ?? vp[0];
    const prompt = t('quiz.bva.prompt')
      .replace('{name}', escapeHtml(param.name))
      .replace('{min}', param.min)
      .replace('{max}', param.max);
    const labels = [0, 1, 2, 3, 4].map((i) => t(`quiz.bva.labels.${i}`));
    const isGraded = quiz.phase === 'graded';

    const inputs = labels.map((label, i) => {
      const correct = isGraded ? quiz.result.correct[i] : null;
      const cls = isGraded ? (correct ? ' quiz-input-correct' : ' quiz-input-wrong') : '';
      const hint = isGraded ? ` <span class="quiz-hint-val">${quiz.result.expected[i]}</span>` : '';
      return `<div class="quiz-bva-field">
        <label class="quiz-bva-label">${escapeHtml(label)}</label>
        <input type="number" class="quiz-bva-input${cls}" data-qi="${i}"
          value="${escapeHtml(String(quiz.answers[i]))}"
          ${isGraded ? 'disabled' : ''} data-testid="bva-quiz-input-${i}"/>
        ${hint}
      </div>`;
    }).join('');

    const bvaLabels = [0, 1, 2, 3, 4].map((i) => t(`quiz.bva.labels.${i}`));
    const scoreRow = isGraded ? `<p class="quiz-score" data-testid="bva-quiz-score">
      ${t('quiz.bva.score').replace('{score}', quiz.result.score)}
      ${quiz.result.score === 5 ? ` <strong>${t('quiz.bva.perfect')}</strong>` : ''}
    </p>
    <button type="button" class="quiz-share-btn" data-share-payload="${encodeResult({ v: 1, explorer: 'bva', explorerLabel: t('quiz.bva.title'), mode: 'quiz', ts: Date.now(), lang: getLocale(), score: quiz.result.score, total: 5, items: [0,1,2,3,4].map((i) => ({ q: bvaLabels[i], a: String(quiz.answers[i]), expected: String(quiz.result.expected[i]), ok: quiz.result.correct[i] })) })}" data-testid="bva-quiz-share">📋 ${t('quiz.share.btn')}</button>` : '';

    return `<div class="quiz-panel" data-testid="bva-quiz">
      <div class="quiz-header">
        <h4>${t('quiz.bva.title')}</h4>
        <button type="button" class="quiz-close-btn" data-testid="bva-quiz-close">${t('quiz.close')}</button>
      </div>
      <p class="quiz-prompt">${prompt}</p>
      <div class="quiz-bva-inputs">${inputs}</div>
      ${scoreRow}
      <div class="quiz-actions">
        ${!isGraded
          ? `<button type="button" class="quiz-check-btn" data-testid="bva-quiz-check">${t('quiz.check')}</button>`
          : `<button type="button" class="quiz-reset-btn" data-testid="bva-quiz-reset">${t('quiz.reset')}</button>`}
      </div>
    </div>`;
  }

  function renderParamRows() {
    return state.params.map((p, i) => `
      <tr>
        <td><input class="bva-param-name" data-idx="${i}" value="${escapeHtml(p.name)}"
            placeholder="param" aria-label="${t('bva.param.name')}" data-testid="bva-param-name-${i}"/></td>
        <td><input class="bva-param-num" type="number" data-idx="${i}" data-field="min"
            value="${p.min}" aria-label="${t('bva.param.min')}" data-testid="bva-param-min-${i}"/></td>
        <td><input class="bva-param-num" type="number" data-idx="${i}" data-field="max"
            value="${p.max}" aria-label="${t('bva.param.max')}" data-testid="bva-param-max-${i}"/></td>
        <td><button class="bva-del-btn" data-del="${i}" aria-label="${t('common.remove')}"
            data-testid="bva-del-${i}" ${state.params.length <= 1 ? 'disabled' : ''}>×</button></td>
      </tr>
    `).join('');
  }

  function renderTestTable(tests) {
    if (!tests.length) {
      return `<p class="bva-empty" data-testid="bva-empty">${t('bva.empty')}</p>`;
    }
    const paramNames = state.params.filter((p) => p.name).map((p) => p.name);
    const headerCols = paramNames.map((n) => `<th>${escapeHtml(n)}</th>`).join('');
    const rows = tests.map((tc) => {
      const valCells = paramNames.map((n) => {
        const val = tc.values[n];
        const highlight = tc.param === n ? ' class="bva-cell-highlight"' : '';
        return `<td${highlight}>${val}</td>`;
      }).join('');
      const robustClass = tc.robust ? ' bva-row-robust' : '';
      return `<tr class="bva-row${robustClass}" data-testid="bva-row-${tc.id}">
        <td class="bva-row-label">${escapeHtml(tc.label)}</td>
        ${valCells}
      </tr>`;
    }).join('');
    return `
      <table class="bva-table" data-testid="bva-table">
        <thead><tr><th>${t('bva.table.boundary')}</th>${headerCols}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function render() {
    const exBtns = EXAMPLES.map((ex) => `
      <button type="button" class="bva-example-btn${state.exampleId === ex.id ? ' active' : ''}"
        data-bva-example="${ex.id}" data-testid="bva-example-${ex.id}">${escapeHtml(ex.name)}</button>
    `).join('');

    const tests = getTests();

    root.innerHTML = `
      <div class="bva-panel">
        <div class="bva-toolbar">
          <div class="bva-examples" data-testid="bva-examples">${exBtns}</div>
          <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
            <label class="bva-robust-label">
              <input type="checkbox" data-testid="bva-robust-toggle" ${state.robust ? 'checked' : ''}/>
              ${t('bva.robust')}
            </label>
            <button type="button" class="quiz-start-btn" data-testid="bva-quiz-start">${t('quiz.start')}</button>
          </div>
        </div>

        <div class="bva-body">
          <div class="bva-input-pane">
            <h3>${t('bva.params.title')}</h3>
            <table class="bva-param-table" data-testid="bva-param-table">
              <thead><tr>
                <th>${t('bva.param.name')}</th>
                <th>${t('bva.param.min')}</th>
                <th>${t('bva.param.max')}</th>
                <th></th>
              </tr></thead>
              <tbody>${renderParamRows()}</tbody>
            </table>
            <button type="button" class="bva-add-btn" data-testid="bva-add-param"
              ${state.params.length >= PARAM_LIMIT ? 'disabled' : ''}>
              + ${t('bva.param.add')}
            </button>
            <p class="bva-hint">${t('bva.hint')}</p>
          </div>

          <div class="bva-results-pane" data-testid="bva-results">
            <h3>${t('bva.results.title')}
              <span class="bva-count">${tests.length} ${t('bva.results.count')}</span>
            </h3>
            ${renderTestTable(tests)}
          </div>
        </div>

        ${renderQuizPanel()}
      </div>
    `;

    bindEvents();
    persist(state);
  }

  function bindEvents() {
    root.querySelectorAll('[data-bva-example]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ex = EXAMPLES.find((e) => e.id === btn.dataset.bvaExample);
        if (!ex) return;
        state.exampleId = ex.id;
        state.params = ex.params.map((p) => ({ ...p }));
        render();
      });
    });

    root.querySelector('[data-testid="bva-robust-toggle"]')?.addEventListener('change', (e) => {
      state.robust = e.target.checked;
      render();
    });

    root.querySelectorAll('.bva-param-name').forEach((input) => {
      input.addEventListener('input', (e) => {
        const idx = Number(e.target.dataset.idx);
        state.params[idx].name = e.target.value;
        const tests = getTests();
        const resultsPane = root.querySelector('[data-testid="bva-results"]');
        if (resultsPane) {
          resultsPane.innerHTML = `<h3>${t('bva.results.title')}
            <span class="bva-count">${tests.length} ${t('bva.results.count')}</span>
          </h3>${renderTestTable(tests)}`;
        }
        persist(state);
      });
    });

    root.querySelectorAll('.bva-param-num').forEach((input) => {
      input.addEventListener('change', (e) => {
        const idx = Number(e.target.dataset.idx);
        const field = e.target.dataset.field;
        state.params[idx][field] = Number(e.target.value);
        const tests = getTests();
        const resultsPane = root.querySelector('[data-testid="bva-results"]');
        if (resultsPane) {
          resultsPane.innerHTML = `<h3>${t('bva.results.title')}
            <span class="bva-count">${tests.length} ${t('bva.results.count')}</span>
          </h3>${renderTestTable(tests)}`;
        }
        persist(state);
      });
    });

    root.querySelectorAll('[data-del]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.del);
        state.params.splice(idx, 1);
        render();
      });
    });

    root.querySelector('[data-testid="bva-add-param"]')?.addEventListener('click', () => {
      if (state.params.length >= PARAM_LIMIT) return;
      state.params.push({ name: `p${state.params.length + 1}`, min: 0, max: 100 });
      render();
    });

    root.querySelector('[data-testid="bva-quiz-start"]')?.addEventListener('click', () => {
      quiz.active = true;
      pickQuizParam();
      render();
    });

    root.querySelector('[data-testid="bva-quiz-close"]')?.addEventListener('click', () => {
      quiz.active = false;
      render();
    });

    root.querySelectorAll('[data-qi]').forEach((input) => {
      input.addEventListener('input', (e) => {
        quiz.answers[Number(e.target.dataset.qi)] = e.target.value;
      });
    });

    root.querySelector('[data-testid="bva-quiz-check"]')?.addEventListener('click', () => {
      gradeQuiz();
    });

    root.querySelector('[data-testid="bva-quiz-reset"]')?.addEventListener('click', () => {
      pickQuizParam();
      render();
    });
  }

  render();
  return root;
}
