import { t, getLocale } from '../i18n/index.js';
import { encodeResult, buildShareUrl } from '../utils/resultExporter.js';
import {
  COVERAGE_PRESETS,
  runSuite,
  stmtCoverage,
  branchCoverage,
  condCoverage,
  mcdcCoverage,
} from '../utils/codeCoverage.js';

let _uid = 0;
function uid() { return `cc${++_uid}`; }

function escapeHtml(v = '') {
  return String(v)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

const DEFAULT_TESTS_BY_PRESET = {
  absVal:   [['5'], ['-3'], ['0']],
  discount: [['70', 'false'], ['30', 'true'], ['30', 'false']],
  classify: [['5'], ['15'], ['-2'], ['0']],
  maxOf3:   [['1', '2', '3'], ['3', '2', '1'], ['2', '3', '1']],
};

export function createCodeCoverageExplorer() {
  const root = document.createElement('div');
  root.className = 'codecov-explorer';
  root.dataset.testid = 'codecov-explorer';

  let activePresetId = COVERAGE_PRESETS[0].id;
  let testCases = DEFAULT_TESTS_BY_PRESET[activePresetId]
    .map((args) => ({ id: uid(), args: [...args], active: true }));
  let activeCriterion = 'stmt';

  const codecovQuiz = { active: false, phase: 'question', answer: '' };
  const codecovLabReflect = { active: false, a1: '', a2: '' };

  /* ── helpers ── */

  function preset() { return COVERAGE_PRESETS.find((p) => p.id === activePresetId); }

  function computeCoverage() {
    const p = preset();
    const results = runSuite(p, testCases.map((tc) => ({
      args: tc.args.map((a) => {
        const n = Number(a);
        if (!Number.isNaN(n)) return n;
        if (a === 'true') return true;
        if (a === 'false') return false;
        return a;
      }),
      active: tc.active,
    })));
    const stmt   = stmtCoverage(p, results);
    const branch = branchCoverage(p, results);
    const cond   = condCoverage(p, results);
    const mcdc   = mcdcCoverage(p, results);
    return { results, stmt, branch, cond, mcdc };
  }

  function strongestCriterion(stmt, branch, cond, mcdc) {
    if (mcdc.pct === 100)   return 'mcdc';
    if (cond.pct === 100)   return 'cond';
    if (branch.pct === 100) return 'branch';
    if (stmt.pct === 100)   return 'stmt';
    return 'none';
  }

  /* ── code view ── */

  function renderCodeView(stmt) {
    const p = preset();
    const lines = p.code.split('\n');
    const stmtByLine = {};
    for (const s of p.stmts) stmtByLine[s.line] = s.id;

    return lines.map((line, i) => {
      const stmtId = stmtByLine[i];
      let cls = '';
      if (stmtId) {
        const covered = stmt.coveredIds.has(stmtId);
        cls = covered ? 'codecov-line--covered' : 'codecov-line--notcovered';
      }
      return `<div class="codecov-line ${cls}" data-testid="codecov-line-${i}">
        <span class="codecov-line-num">${i + 1}</span>
        <span class="codecov-line-text">${escapeHtml(line) || ' '}</span>
      </div>`;
    }).join('');
  }

  /* ── quiz ── */

  function renderQuizPanel(strongest) {
    if (!codecovQuiz.active) return '';
    const opts = ['none', 'stmt', 'branch', 'cond', 'mcdc'];
    const optHtml = opts.map((o) => {
      const key = `quiz.codecov.options.${o}`;
      if (codecovQuiz.phase === 'graded') {
        const isCorrect = o === strongest;
        const isUser = o === codecovQuiz.answer;
        return `<span class="quiz-option ${isCorrect ? 'quiz-option--correct' : ''} ${isUser && !isCorrect ? 'quiz-option--wrong' : ''}">${t(key)}</span>`;
      }
      return `<label class="quiz-option-label"><input type="radio" name="codecov-quiz" value="${o}" ${codecovQuiz.answer === o ? 'checked' : ''}> ${t(key)}</label>`;
    }).join('');

    if (codecovQuiz.phase === 'graded') {
      const ok = codecovQuiz.answer === strongest;
      const shareEncoded = encodeResult({
        v: 1, explorer: 'codecov', explorerLabel: t('quiz.codecov.title'),
        mode: 'quiz', ts: Date.now(), lang: getLocale(),
        score: ok ? 1 : 0, total: 1,
        items: [{ q: t('quiz.codecov.prompt'), a: codecovQuiz.answer, expected: strongest, ok }],
      });
      return `
        <div class="quiz-panel" data-testid="codecov-quiz-panel">
          <div class="quiz-header">
            <span>${t('quiz.codecov.title')}</span>
            <button type="button" class="quiz-close-btn" data-testid="codecov-quiz-close">✕</button>
          </div>
          <p class="quiz-prompt">${t('quiz.codecov.prompt')}</p>
          <div style="display:flex;flex-direction:column;gap:0.3rem;margin:0.5rem 0">${optHtml}</div>
          <p class="quiz-score ${ok ? 'quiz-score--perfect' : 'quiz-score--wrong'}">
            ${ok ? t('quiz.graph.perfect') : ''}
            ${t('quiz.codecov.answer', { level: t(`quiz.codecov.options.${strongest}`) })}
          </p>
          <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="codecov-quiz-share">📋 ${t('quiz.share.btn')}</button>
          <button type="button" class="quiz-start-btn" data-testid="codecov-quiz-reset">${t('quiz.reset')}</button>
        </div>`;
    }
    return `
      <div class="quiz-panel" data-testid="codecov-quiz-panel">
        <div class="quiz-header">
          <span>${t('quiz.codecov.title')}</span>
          <button type="button" class="quiz-close-btn" data-testid="codecov-quiz-close">✕</button>
        </div>
        <p class="quiz-prompt">${t('quiz.codecov.prompt')}</p>
        <div style="display:flex;flex-direction:column;gap:0.3rem;margin:0.5rem 0">${optHtml}</div>
        <button type="button" class="quiz-start-btn" data-testid="codecov-quiz-check">${t('quiz.check')}</button>
      </div>`;
  }

  /* ── lab reflect ── */

  function renderLabReflectPanel() {
    if (!codecovLabReflect.active) return '';
    return `
      <div class="lab-panel" data-testid="codecov-lab-reflect-panel">
        <div class="lab-panel-header">
          <span class="lab-panel-title">${t('lab.reflect.title')}</span>
          <button type="button" class="quiz-close-btn" data-testid="codecov-lab-reflect-close">✕</button>
        </div>
        <div class="lab-reflect-field">
          <label class="lab-reflect-label">${t('lab.reflect.q.codecov.1')}</label>
          <textarea class="lab-reflect-textarea" data-testid="codecov-lab-reflect-a1" rows="3" placeholder="${t('lab.reflect.placeholder')}">${escapeHtml(codecovLabReflect.a1)}</textarea>
        </div>
        <div class="lab-reflect-field">
          <label class="lab-reflect-label">${t('lab.reflect.q.codecov.2')}</label>
          <textarea class="lab-reflect-textarea" data-testid="codecov-lab-reflect-a2" rows="3" placeholder="${t('lab.reflect.placeholder')}">${escapeHtml(codecovLabReflect.a2)}</textarea>
        </div>
        <div class="lab-reflect-actions">
          <button type="button" class="quiz-share-btn" data-testid="codecov-lab-reflect-share">📋 ${t('quiz.share.btn')}</button>
        </div>
      </div>`;
  }

  /* ── main render ── */

  function render() {
    const p = preset();
    const { results, stmt, branch, cond, mcdc } = computeCoverage();
    const strongest = strongestCriterion(stmt, branch, cond, mcdc);

    const presetBtns = COVERAGE_PRESETS.map((pr) => `
      <button type="button" class="codecov-preset-btn ${pr.id === activePresetId ? 'codecov-preset-btn--active' : ''}"
        data-preset="${pr.id}" data-testid="codecov-preset-${pr.id}">${t(pr.nameKey)}</button>`).join('');

    const codeViewHtml = renderCodeView(stmt);

    const critRows = [
      { id: 'stmt',   data: stmt,   barClass: 'codecov-crit-bar--stmt' },
      { id: 'branch', data: branch, barClass: 'codecov-crit-bar--branch' },
      { id: 'cond',   data: cond,   barClass: 'codecov-crit-bar--cond' },
      { id: 'mcdc',   data: mcdc,   barClass: 'codecov-crit-bar--mcdc' },
    ].map(({ id, data, barClass }) => `
      <div class="codecov-crit-row">
        <span class="codecov-crit-label">${t(`codecov.crit.${id}`)}</span>
        <div class="codecov-crit-bar-wrap">
          <div class="codecov-crit-bar ${barClass}" style="width:${data.pct}%" data-testid="codecov-bar-${id}"></div>
        </div>
        <span class="codecov-crit-pct" data-testid="codecov-pct-${id}">${data.pct}%</span>
      </div>
      <p class="codecov-crit-desc">${t(`codecov.crit.${id}.desc`)}</p>`).join('');

    const structHtml = `
      <ul class="codecov-struct-list">
        <li class="codecov-struct-item">
          <span class="codecov-struct-dot codecov-struct-dot--stmt"></span>
          ${t('codecov.structure.stmts', { n: p.stmts.length })}
        </li>
        <li class="codecov-struct-item">
          <span class="codecov-struct-dot codecov-struct-dot--branch"></span>
          ${t('codecov.structure.branches', { n: p.branches.length * 2 })} (${p.branches.map((b) => escapeHtml(b.predicate)).join(', ')})
        </li>
        <li class="codecov-struct-item">
          <span class="codecov-struct-dot codecov-struct-dot--cond"></span>
          ${t('codecov.structure.conds', { n: p.conditions.length })} (${p.conditions.map((c) => escapeHtml(c.clause)).join(', ')})
        </li>
      </ul>
      <p class="codecov-analogy">${t('codecov.graph.analogy')}</p>`;

    const testRowsHtml = testCases.map((tc, ti) => {
      let output = '';
      try {
        if (results[testCases.filter((x, xi) => x.active && xi <= ti).length - 1]) {
          // don't try to index into results — just show '→' placeholders
        }
      } catch { /* noop */ }

      const argInputs = tc.args.map((a, ai) =>
        `<input type="text" class="codecov-arg-input" value="${escapeHtml(a)}"
          data-tc="${tc.id}" data-arg="${ai}" data-testid="codecov-arg-${ti}-${ai}"
          placeholder="${escapeHtml(p.params[ai] || `arg${ai}`)}" />`).join('');

      return `
        <div class="codecov-test-row" data-tc-id="${tc.id}">
          <span class="codecov-test-num">${ti + 1}</span>
          <div class="codecov-test-args">${argInputs}</div>
          <button type="button" class="codecov-test-remove" data-remove-tc="${tc.id}" data-testid="codecov-remove-tc-${ti}">✕</button>
        </div>`;
    }).join('');

    const metricEncoded = encodeResult({
      v: 1, explorer: 'codecov', explorerLabel: t('section.codecov'),
      mode: 'lab-metric', ts: Date.now(), lang: getLocale(),
      score: 1, total: 1,
      items: [{ q: `${t('codecov.crit.stmt')} ${stmt.pct}% · ${t('codecov.crit.branch')} ${branch.pct}% · ${t('codecov.crit.cond')} ${cond.pct}% · ${t('codecov.crit.mcdc')} ${mcdc.pct}%`, a: strongest, ok: true }],
    });

    root.innerHTML = `
      <div class="codecov-presets">
        <span class="codecov-preset-label">Program:</span>
        ${presetBtns}
      </div>

      <div class="codecov-main">
        <div class="codecov-code-card">
          <p class="codecov-code-title">${t('codecov.code.title')}</p>
          <div class="codecov-code-lines" data-testid="codecov-code-view">${codeViewHtml}</div>
        </div>

        <div class="codecov-right-panel">
          <div class="codecov-summary-card">
            <p class="codecov-summary-title">${t('codecov.coverage.title')}</p>
            <div class="codecov-crit-rows">${critRows}</div>
          </div>

          <div class="codecov-structure-card">
            <p class="codecov-structure-title">${t('codecov.structure.title')}</p>
            ${structHtml}
          </div>
        </div>
      </div>

      <div class="codecov-tests-card">
        <div class="codecov-tests-header">
          <h4 class="codecov-tests-title">${t('codecov.tests.title')}</h4>
          <div style="font-size:0.78rem;color:#64748b">${t('codecov.tests.args')}: ${p.params.map((pn) => `<code>${escapeHtml(pn)}</code>`).join(', ')}</div>
        </div>
        <div class="codecov-test-rows" data-testid="codecov-test-list">${testRowsHtml}</div>
        <button type="button" class="codecov-add-test-btn" data-testid="codecov-add-test">+ ${t('codecov.tests.add')}</button>
      </div>

      <div class="codecov-bottom-card">
        <div class="codecov-bottom-header">
          <h4 class="codecov-bottom-title">${t('codecov.coverage.title')}</h4>
          <div class="codecov-bottom-actions">
            ${!codecovQuiz.active ? `<button type="button" class="quiz-start-btn" data-testid="codecov-quiz-start">${t('quiz.start')}</button>` : ''}
            ${!codecovLabReflect.active ? `<button type="button" class="quiz-start-btn" data-testid="codecov-lab-reflect-start">${t('lab.reflect.start')}</button>` : ''}
            <button type="button" class="quiz-share-btn" data-share-payload="${metricEncoded}" data-testid="codecov-lab-metric">📊 ${t('lab.metric.record')}</button>
          </div>
        </div>
        ${renderQuizPanel(strongest)}
        ${renderLabReflectPanel()}
      </div>

      <p class="codecov-hint">${t('codecov.hint')}</p>
    `;

    bindEvents();
  }

  /* ── event binding ── */

  function bindEvents() {
    // Preset selection
    root.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activePresetId = btn.dataset.preset;
        testCases = (DEFAULT_TESTS_BY_PRESET[activePresetId] || [['0']])
          .map((args) => ({ id: uid(), args: [...args], active: true }));
        codecovQuiz.active = false;
        codecovLabReflect.active = false;
        render();
      });
    });

    // Test case args
    root.querySelectorAll('[data-tc][data-arg]').forEach((input) => {
      input.addEventListener('change', () => {
        const tc = testCases.find((x) => x.id === input.dataset.tc);
        if (tc) { tc.args[parseInt(input.dataset.arg)] = input.value; render(); }
      });
    });

    // Remove test case
    root.querySelectorAll('[data-remove-tc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        testCases = testCases.filter((tc) => tc.id !== btn.dataset.removeTc);
        render();
      });
    });

    // Add test case
    root.querySelector('[data-testid="codecov-add-test"]').addEventListener('click', () => {
      const p = preset();
      testCases.push({ id: uid(), args: p.params.map(() => '0'), active: true });
      render();
    });

    // Quiz
    const qStart = root.querySelector('[data-testid="codecov-quiz-start"]');
    if (qStart) qStart.addEventListener('click', () => {
      codecovQuiz.active = true; codecovQuiz.phase = 'question'; codecovQuiz.answer = ''; render();
    });

    const qClose = root.querySelector('[data-testid="codecov-quiz-close"]');
    if (qClose) qClose.addEventListener('click', () => { codecovQuiz.active = false; render(); });

    const qCheck = root.querySelector('[data-testid="codecov-quiz-check"]');
    if (qCheck) qCheck.addEventListener('click', () => {
      const sel = root.querySelector('[name="codecov-quiz"]:checked');
      codecovQuiz.answer = sel ? sel.value : '';
      codecovQuiz.phase = 'graded';
      render();
    });

    const qReset = root.querySelector('[data-testid="codecov-quiz-reset"]');
    if (qReset) qReset.addEventListener('click', () => {
      codecovQuiz.phase = 'question'; codecovQuiz.answer = ''; render();
    });

    // Lab Reflect
    const lrStart = root.querySelector('[data-testid="codecov-lab-reflect-start"]');
    if (lrStart) lrStart.addEventListener('click', () => { codecovLabReflect.active = true; render(); });

    const lrClose = root.querySelector('[data-testid="codecov-lab-reflect-close"]');
    if (lrClose) lrClose.addEventListener('click', () => {
      const a1el = root.querySelector('[data-testid="codecov-lab-reflect-a1"]');
      const a2el = root.querySelector('[data-testid="codecov-lab-reflect-a2"]');
      if (a1el) codecovLabReflect.a1 = a1el.value;
      if (a2el) codecovLabReflect.a2 = a2el.value;
      codecovLabReflect.active = false;
      render();
    });

    const lrA1 = root.querySelector('[data-testid="codecov-lab-reflect-a1"]');
    if (lrA1) lrA1.addEventListener('input', () => { codecovLabReflect.a1 = lrA1.value; });

    const lrA2 = root.querySelector('[data-testid="codecov-lab-reflect-a2"]');
    if (lrA2) lrA2.addEventListener('input', () => { codecovLabReflect.a2 = lrA2.value; });

    const lrShare = root.querySelector('[data-testid="codecov-lab-reflect-share"]');
    if (lrShare) lrShare.addEventListener('click', () => {
      const a1 = root.querySelector('[data-testid="codecov-lab-reflect-a1"]')?.value || codecovLabReflect.a1;
      const a2 = root.querySelector('[data-testid="codecov-lab-reflect-a2"]')?.value || codecovLabReflect.a2;
      const url = buildShareUrl(encodeResult({
        v: 1, explorer: 'codecov', explorerLabel: t('lab.reflect.title'),
        mode: 'lab-reflect', ts: Date.now(), lang: getLocale(),
        score: 0, total: 0,
        items: [
          { q: t('lab.reflect.q.codecov.1'), a: a1, ok: true },
          { q: t('lab.reflect.q.codecov.2'), a: a2, ok: true },
        ],
      }));
      navigator.clipboard?.writeText(url).catch(() => {});
      lrShare.textContent = t('quiz.share.copied');
      setTimeout(() => { if (lrShare.isConnected) lrShare.textContent = `📋 ${t('quiz.share.btn')}`; }, 1800);
    });
  }

  render();
  return root;
}
