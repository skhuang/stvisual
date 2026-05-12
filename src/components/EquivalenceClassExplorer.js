import { t } from '../i18n/index.js';
import { generateWectTests, generateSectTests } from '../utils/blackboxTesting.js';

const STORAGE_KEY = 'stvisual.ec.v1';

const EXAMPLES = [
  {
    id: 'nextDate',
    name: 'NextDate(month)',
    params: [
      {
        name: 'month',
        classes: [
          { name: '1–12',   kind: 'valid',   representative: 6 },
          { name: '< 1',    kind: 'invalid', representative: 0 },
          { name: '> 12',   kind: 'invalid', representative: 13 },
        ],
      },
      {
        name: 'day',
        classes: [
          { name: '1–28', kind: 'valid',   representative: 15 },
          { name: '29–30', kind: 'valid',  representative: 29 },
          { name: '31',   kind: 'valid',   representative: 31 },
          { name: '< 1',  kind: 'invalid', representative: 0 },
          { name: '> 31', kind: 'invalid', representative: 32 },
        ],
      },
    ],
  },
  {
    id: 'triangle',
    name: 'Triangle(sides)',
    params: [
      {
        name: 'a',
        classes: [
          { name: 'positive',  kind: 'valid',   representative: 5 },
          { name: 'zero',      kind: 'invalid', representative: 0 },
          { name: 'negative',  kind: 'invalid', representative: -1 },
        ],
      },
      {
        name: 'b',
        classes: [
          { name: 'positive',  kind: 'valid',   representative: 5 },
          { name: 'zero',      kind: 'invalid', representative: 0 },
          { name: 'negative',  kind: 'invalid', representative: -1 },
        ],
      },
      {
        name: 'c',
        classes: [
          { name: 'positive',  kind: 'valid',   representative: 5 },
          { name: 'zero',      kind: 'invalid', representative: 0 },
          { name: 'negative',  kind: 'invalid', representative: -1 },
        ],
      },
    ],
  },
  {
    id: 'password',
    name: 'validatePassword(s)',
    params: [
      {
        name: 'length',
        classes: [
          { name: '8–20 chars', kind: 'valid',   representative: 12 },
          { name: '< 8 chars',  kind: 'invalid', representative: 4 },
          { name: '> 20 chars', kind: 'invalid', representative: 25 },
        ],
      },
      {
        name: 'hasDigit',
        classes: [
          { name: 'true',  kind: 'valid',   representative: true },
          { name: 'false', kind: 'invalid', representative: false },
        ],
      },
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
      mode: state.mode,
    }));
  } catch {}
}

export function createEquivalenceClassExplorer() {
  const root = document.createElement('div');
  root.className = 'ec-explorer';
  root.dataset.testid = 'ec-explorer';

  const saved = loadSaved();
  const defaultEx = EXAMPLES[0];
  const state = {
    exampleId: saved?.exampleId ?? defaultEx.id,
    params: saved?.params ?? defaultEx.params.map((p) => ({ ...p, classes: p.classes.map((c) => ({ ...c })) })),
    mode: saved?.mode ?? 'wect',  // 'wect' | 'sect'
  };

  const quiz = { active: false, wectAnswer: '', sectAnswer: '', phase: 'question', result: null };

  function getTests() {
    const valid = state.params.filter((p) => p.name && p.classes.length);
    if (!valid.length) return [];
    return state.mode === 'sect' ? generateSectTests(valid) : generateWectTests(valid);
  }

  function gradeEcQuiz() {
    const valid = state.params.filter((p) => p.name && p.classes.length);
    const wectCount = generateWectTests(valid).length;
    const sectCount = generateSectTests(valid).length;
    const wectUser = Number(quiz.wectAnswer);
    const sectUser = Number(quiz.sectAnswer);
    quiz.result = {
      wectCount, sectCount,
      wectCorrect: wectUser === wectCount,
      sectCorrect: sectUser === sectCount,
    };
    quiz.phase = 'graded';
    render();
  }

  function renderQuizPanel() {
    if (!quiz.active) return '';
    const isGraded = quiz.phase === 'graded';

    const wectCls = isGraded ? (quiz.result.wectCorrect ? ' quiz-input-correct' : ' quiz-input-wrong') : '';
    const sectCls = isGraded ? (quiz.result.sectCorrect ? ' quiz-input-correct' : ' quiz-input-wrong') : '';

    const wectFeedback = isGraded ? `<span class="quiz-hint-val">${
      quiz.result.wectCorrect ? t('quiz.ec.correct') : `${t('quiz.ec.wrong')} ${t('quiz.ec.answer').replace('{count}', quiz.result.wectCount)}`
    }</span>` : '';
    const sectFeedback = isGraded ? `<span class="quiz-hint-val">${
      quiz.result.sectCorrect ? t('quiz.ec.correct') : `${t('quiz.ec.wrong')} ${t('quiz.ec.answer').replace('{count}', quiz.result.sectCount)}`
    }</span>` : '';

    return `<div class="quiz-panel" data-testid="ec-quiz">
      <div class="quiz-header">
        <h4>${t('quiz.ec.title')}</h4>
        <button type="button" class="quiz-close-btn" data-testid="ec-quiz-close">${t('quiz.close')}</button>
      </div>
      <div class="quiz-ec-row">
        <label class="quiz-bva-label">${t('quiz.ec.wect.prompt')}</label>
        <input type="number" class="quiz-bva-input${wectCls}" data-testid="ec-quiz-wect"
          value="${escapeHtml(String(quiz.wectAnswer))}" min="0"
          ${isGraded ? 'disabled' : ''}/>
        ${wectFeedback}
      </div>
      <div class="quiz-ec-row">
        <label class="quiz-bva-label">${t('quiz.ec.sect.prompt')}</label>
        <input type="number" class="quiz-bva-input${sectCls}" data-testid="ec-quiz-sect"
          value="${escapeHtml(String(quiz.sectAnswer))}" min="0"
          ${isGraded ? 'disabled' : ''}/>
        ${sectFeedback}
      </div>
      <div class="quiz-actions">
        ${!isGraded
          ? `<button type="button" class="quiz-check-btn" data-testid="ec-quiz-check">${t('quiz.check')}</button>`
          : `<button type="button" class="quiz-reset-btn" data-testid="ec-quiz-reset">${t('quiz.reset')}</button>`}
      </div>
    </div>`;
  }

  function renderClassTable(paramIdx, classes) {
    const rows = classes.map((cls, ci) => `
      <tr>
        <td><span class="ec-badge ec-badge-${cls.kind}">${cls.kind}</span></td>
        <td><input class="ec-class-name" data-pidx="${paramIdx}" data-cidx="${ci}"
            value="${escapeHtml(cls.name)}" placeholder="${t('ec.class.name')}"
            data-testid="ec-class-name-${paramIdx}-${ci}"/></td>
        <td><input class="ec-class-rep" type="text" data-pidx="${paramIdx}" data-cidx="${ci}"
            value="${escapeHtml(String(cls.representative))}" placeholder="${t('ec.class.rep')}"
            data-testid="ec-class-rep-${paramIdx}-${ci}"/></td>
        <td>
          <select class="ec-class-kind" data-pidx="${paramIdx}" data-cidx="${ci}"
              data-testid="ec-class-kind-${paramIdx}-${ci}">
            <option value="valid"${cls.kind === 'valid' ? ' selected' : ''}>${t('ec.class.valid')}</option>
            <option value="invalid"${cls.kind === 'invalid' ? ' selected' : ''}>${t('ec.class.invalid')}</option>
          </select>
        </td>
        <td><button class="ec-del-class-btn" data-del-class data-pidx="${paramIdx}" data-cidx="${ci}"
            aria-label="${t('common.remove')}" ${classes.length <= 1 ? 'disabled' : ''}>×</button></td>
      </tr>
    `).join('');
    return `
      <table class="ec-class-table" data-testid="ec-class-table-${paramIdx}">
        <thead><tr>
          <th>${t('ec.class.kind')}</th>
          <th>${t('ec.class.name')}</th>
          <th>${t('ec.class.rep')}</th>
          <th></th><th></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <button class="ec-add-class-btn" data-add-class data-pidx="${paramIdx}"
          data-testid="ec-add-class-${paramIdx}">+ ${t('ec.class.add')}</button>
    `;
  }

  function renderParams() {
    return state.params.map((p, i) => `
      <div class="ec-param-block" data-testid="ec-param-${i}">
        <div class="ec-param-header">
          <input class="ec-param-name-input" data-pidx="${i}" value="${escapeHtml(p.name)}"
              placeholder="${t('ec.param.name')}" data-testid="ec-param-name-${i}"/>
          <button class="ec-del-param-btn" data-del-param="${i}" aria-label="${t('common.remove')}"
              data-testid="ec-del-param-${i}" ${state.params.length <= 1 ? 'disabled' : ''}>×</button>
        </div>
        ${renderClassTable(i, p.classes)}
      </div>
    `).join('');
  }

  function renderResultTable(tests) {
    if (!tests.length) {
      return `<p class="ec-empty" data-testid="ec-empty">${t('ec.empty')}</p>`;
    }
    const paramNames = state.params.map((p) => p.name);
    const headerCols = paramNames.map((n) => `<th>${escapeHtml(n)}</th>`).join('');
    const rows = tests.map((tc) => {
      const valCells = paramNames.map((n) => `<td>${escapeHtml(String(tc.values[n] ?? ''))}</td>`).join('');
      const hasInv = tc.hasInvalid ? ' ec-row-invalid' : '';
      return `<tr class="ec-row${hasInv}" data-testid="ec-row-${tc.id}">
        <td class="ec-row-label">${escapeHtml(tc.label)}</td>
        ${valCells}
        <td class="ec-row-coverage">${tc.coverage.map((c) => `<span>${escapeHtml(c)}</span>`).join(' ')}</td>
      </tr>`;
    }).join('');
    return `
      <table class="ec-table" data-testid="ec-table">
        <thead><tr>
          <th>${t('ec.table.label')}</th>${headerCols}
          <th>${t('ec.table.coverage')}</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function render() {
    const tests = getTests();
    const exBtns = EXAMPLES.map((ex) => `
      <button type="button" class="ec-example-btn${state.exampleId === ex.id ? ' active' : ''}"
          data-ec-example="${ex.id}" data-testid="ec-example-${ex.id}">${escapeHtml(ex.name)}</button>
    `).join('');

    root.innerHTML = `
      <div class="ec-panel">
        <div class="ec-toolbar">
          <div class="ec-examples" data-testid="ec-examples">${exBtns}</div>
          <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
            <div class="ec-mode-toggle" role="group">
              <button type="button" class="ec-mode-btn${state.mode === 'wect' ? ' active' : ''}"
                  data-mode="wect" data-testid="ec-mode-wect">WECT</button>
              <button type="button" class="ec-mode-btn${state.mode === 'sect' ? ' active' : ''}"
                  data-mode="sect" data-testid="ec-mode-sect">SECT</button>
            </div>
            <button type="button" class="quiz-start-btn" data-testid="ec-quiz-start">${t('quiz.start')}</button>
          </div>
        </div>

        <div class="ec-body">
          <div class="ec-input-pane" data-testid="ec-params-pane">
            <h3>${t('ec.params.title')}</h3>
            <div class="ec-params-list">${renderParams()}</div>
            <button class="ec-add-param-btn" data-testid="ec-add-param"
                ${state.params.length >= 5 ? 'disabled' : ''}>
              + ${t('ec.param.add')}
            </button>
            <p class="ec-hint">${t('ec.hint')}</p>
          </div>

          <div class="ec-results-pane" data-testid="ec-results">
            <h3>${t('ec.results.title')}
              <span class="ec-count">${tests.length} ${t('ec.results.count')}</span>
            </h3>
            ${renderResultTable(tests)}
          </div>
        </div>

        ${renderQuizPanel()}
      </div>
    `;

    bindEvents();
    persist(state);
  }

  function bindEvents() {
    root.querySelectorAll('[data-ec-example]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ex = EXAMPLES.find((e) => e.id === btn.dataset.ecExample);
        if (!ex) return;
        state.exampleId = ex.id;
        state.params = ex.params.map((p) => ({
          ...p, classes: p.classes.map((c) => ({ ...c })),
        }));
        render();
      });
    });

    root.querySelectorAll('[data-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.mode = btn.dataset.mode;
        render();
      });
    });

    root.querySelectorAll('.ec-param-name-input').forEach((input) => {
      input.addEventListener('input', (e) => {
        state.params[Number(e.target.dataset.pidx)].name = e.target.value;
        refreshResults();
        persist(state);
      });
    });

    root.querySelectorAll('.ec-class-name').forEach((input) => {
      input.addEventListener('input', (e) => {
        const pi = Number(e.target.dataset.pidx), ci = Number(e.target.dataset.cidx);
        state.params[pi].classes[ci].name = e.target.value;
        refreshResults();
        persist(state);
      });
    });

    root.querySelectorAll('.ec-class-rep').forEach((input) => {
      input.addEventListener('change', (e) => {
        const pi = Number(e.target.dataset.pidx), ci = Number(e.target.dataset.cidx);
        const v = e.target.value;
        state.params[pi].classes[ci].representative = isNaN(Number(v)) ? v : Number(v);
        refreshResults();
        persist(state);
      });
    });

    root.querySelectorAll('.ec-class-kind').forEach((sel) => {
      sel.addEventListener('change', (e) => {
        const pi = Number(e.target.dataset.pidx), ci = Number(e.target.dataset.cidx);
        state.params[pi].classes[ci].kind = e.target.value;
        refreshResults();
        persist(state);
      });
    });

    root.querySelectorAll('[data-del-class]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pi = Number(btn.dataset.pidx), ci = Number(btn.dataset.cidx);
        state.params[pi].classes.splice(ci, 1);
        render();
      });
    });

    root.querySelectorAll('[data-add-class]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pi = Number(btn.dataset.pidx);
        state.params[pi].classes.push({ name: 'new class', kind: 'valid', representative: 0 });
        render();
      });
    });

    root.querySelectorAll('[data-del-param]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.params.splice(Number(btn.dataset.delParam), 1);
        render();
      });
    });

    root.querySelector('[data-testid="ec-add-param"]')?.addEventListener('click', () => {
      if (state.params.length >= 5) return;
      state.params.push({
        name: `param${state.params.length + 1}`,
        classes: [
          { name: 'valid',   kind: 'valid',   representative: 1 },
          { name: 'invalid', kind: 'invalid', representative: -1 },
        ],
      });
      render();
    });

    root.querySelector('[data-testid="ec-quiz-start"]')?.addEventListener('click', () => {
      quiz.active = true;
      quiz.wectAnswer = '';
      quiz.sectAnswer = '';
      quiz.phase = 'question';
      quiz.result = null;
      render();
    });

    root.querySelector('[data-testid="ec-quiz-close"]')?.addEventListener('click', () => {
      quiz.active = false;
      render();
    });

    root.querySelector('[data-testid="ec-quiz-wect"]')?.addEventListener('input', (e) => {
      quiz.wectAnswer = e.target.value;
    });

    root.querySelector('[data-testid="ec-quiz-sect"]')?.addEventListener('input', (e) => {
      quiz.sectAnswer = e.target.value;
    });

    root.querySelector('[data-testid="ec-quiz-check"]')?.addEventListener('click', () => {
      gradeEcQuiz();
    });

    root.querySelector('[data-testid="ec-quiz-reset"]')?.addEventListener('click', () => {
      quiz.wectAnswer = '';
      quiz.sectAnswer = '';
      quiz.phase = 'question';
      quiz.result = null;
      render();
    });
  }

  function refreshResults() {
    const tests = getTests();
    const pane = root.querySelector('[data-testid="ec-results"]');
    if (pane) {
      pane.innerHTML = `<h3>${t('ec.results.title')}
        <span class="ec-count">${tests.length} ${t('ec.results.count')}</span>
      </h3>${renderResultTable(tests)}`;
    }
  }

  render();
  return root;
}
