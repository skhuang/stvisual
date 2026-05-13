import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';
import { metamorphicExamples, generateMrTests } from '../utils/metamorphicTesting.js';

function escapeHtml(v = '') {
  return String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function createMetamorphicTestingExplorer() {
  const root = document.createElement('div');
  root.dataset.testid = 'mt-explorer';

  let state = {
    exampleId: metamorphicExamples[0].id,
    relationId: metamorphicExamples[0].relations[0].id,
    results: null,
  };

  const mtQuiz = { active: false, phase: 'question', answer: '', autoResults: null };

  function renderMtQuizPanel() {
    if (!mtQuiz.active) return '';
    const isZh = getLocale() === 'zh';
    const rel = getRelation();
    const relName = isZh ? rel.nameZh : rel.name;
    if (mtQuiz.phase === 'graded') {
      const correct = mtQuiz.autoResults ? mtQuiz.autoResults.filter((r) => r.holds).length : 0;
      const userAns = parseInt(mtQuiz.answer, 10);
      const ok = userAns === correct;
      const shareEncoded = encodeResult({ v: 1, explorer: 'mt', explorerLabel: t('quiz.mt.title'), mode: 'quiz', ts: Date.now(), lang: getLocale(), score: ok ? 1 : 0, total: 1, items: [{ q: t('quiz.mt.prompt', { rel: relName }), a: String(mtQuiz.answer), expected: String(correct), ok }] });
      return `
        <div class="quiz-panel" data-testid="mt-quiz-panel">
          <div class="quiz-header">
            <span>${t('quiz.mt.title')}</span>
            <button type="button" class="quiz-close-btn" data-testid="mt-quiz-close">✕</button>
          </div>
          <p class="quiz-prompt">${t('quiz.mt.prompt', { rel: escapeHtml(relName) })}</p>
          <p class="quiz-score ${ok ? 'quiz-score--perfect' : 'quiz-score--wrong'}">
            ${ok ? t('quiz.graph.perfect') : ''}
            ${t('quiz.mt.answer', { count: correct })}
          </p>
          <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="mt-quiz-share">📋 ${t('quiz.share.btn')}</button>
          <button type="button" class="quiz-start-btn" data-testid="mt-quiz-reset">${t('quiz.retry')}</button>
        </div>
      `;
    }
    return `
      <div class="quiz-panel" data-testid="mt-quiz-panel">
        <div class="quiz-header">
          <span>${t('quiz.mt.title')}</span>
          <button type="button" class="quiz-close-btn" data-testid="mt-quiz-close">✕</button>
        </div>
        <p class="quiz-prompt">${t('quiz.mt.prompt', { rel: escapeHtml(relName) })}</p>
        <div class="quiz-bva-inputs">
          <label class="quiz-bva-field">
            ${t('quiz.mt.label')}
            <input type="number" min="0" max="8" class="quiz-input" data-testid="mt-quiz-input" value="${escapeHtml(mtQuiz.answer)}" />
          </label>
        </div>
        <button type="button" class="quiz-start-btn" data-testid="mt-quiz-check">${t('quiz.check')}</button>
      </div>
    `;
  }

  function getExample() {
    return metamorphicExamples.find((e) => e.id === state.exampleId) ?? metamorphicExamples[0];
  }

  function getRelation() {
    const ex = getExample();
    return ex.relations.find((r) => r.id === state.relationId) ?? ex.relations[0];
  }

  function render() {
    const ex = getExample();
    const rel = getRelation();
    const isZh = getLocale() === 'zh';

    root.innerHTML = `
      <div class="mt-layout">
        <div class="mt-sidebar">
          <h3 class="mt-section-title">${t('mt.examples.title')}</h3>
          <div class="mt-example-btns" data-testid="mt-examples">
            ${metamorphicExamples.map((e) => `
              <button type="button"
                class="mt-example-btn${e.id === state.exampleId ? ' active' : ''}"
                data-testid="mt-example-${e.id}"
                data-example="${e.id}"
              >${e.name}</button>
            `).join('')}
          </div>

          <h3 class="mt-section-title">${t('mt.relations.title')}</h3>
          <div class="mt-relation-list" data-testid="mt-relations">
            ${ex.relations.map((r) => `
              <button type="button"
                class="mt-rel-btn${r.id === state.relationId ? ' active' : ''}"
                data-testid="mt-rel-${r.id}"
                data-rel="${r.id}"
              >
                <span class="mt-rel-name">${isZh ? r.nameZh : r.name}</span>
                <code class="mt-rel-formula">${escapeHtml(r.formula)}</code>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="mt-main">
          <div class="mt-info-card">
            <h3 class="mt-info-title">${ex.name}</h3>
            <p class="mt-info-desc">${isZh ? ex.descriptionZh : ex.description}</p>
            <details class="mt-source-details">
              <summary>${t('mt.source.label')}</summary>
              <pre class="mt-source-pre"><code>${escapeHtml(ex.sourceCode)}</code></pre>
            </details>
          </div>

          <div class="mt-mr-card" data-testid="mt-mr-card">
            <div class="mt-mr-header">
              <span class="mt-mr-name">${isZh ? rel.nameZh : rel.name}</span>
              <code class="mt-mr-formula">${escapeHtml(rel.formula)}</code>
              ${!mtQuiz.active ? `<button type="button" class="quiz-start-btn" data-testid="mt-quiz-start">${t('quiz.start')}</button>` : ''}
            </div>
            <p class="mt-mr-desc">${isZh ? rel.descZh : rel.desc}</p>
            <button type="button" class="mt-generate-btn" data-testid="mt-generate">
              ${t('mt.generate')}
            </button>
          </div>

          ${renderMtQuizPanel()}

          <div class="mt-results" data-testid="mt-results">
            ${state.results ? renderResults(state.results) : `<p class="mt-hint">${t('mt.hint')}</p>`}
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function renderResults(results) {
    const passing = results.filter((r) => r.holds).length;
    const total = results.length;
    const allPass = passing === total;

    return `
      <div class="mt-results-header">
        <span class="mt-results-title">${t('mt.results.title')}</span>
        <span class="mt-results-badge${allPass ? ' mt-results-badge--pass' : ' mt-results-badge--fail'}">
          ${passing}/${total} ${t('mt.results.hold')}
        </span>
      </div>
      <div class="mt-table-wrap">
        <table class="mt-table" data-testid="mt-table">
          <thead>
            <tr>
              <th>${t('mt.col.no')}</th>
              <th>${t('mt.col.input')}</th>
              <th>${t('mt.col.output')}</th>
              <th>${t('mt.col.transInput')}</th>
              <th>${t('mt.col.transOutput')}</th>
              <th>${t('mt.col.holds')}</th>
            </tr>
          </thead>
          <tbody>
            ${results.map((r, i) => `
              <tr class="${r.holds ? 'mt-row--pass' : 'mt-row--fail'}" data-testid="mt-row-${i}">
                <td>${i + 1}</td>
                <td><code>${escapeHtml(r.input)}</code></td>
                <td><code>${escapeHtml(r.output)}</code></td>
                <td><code>${escapeHtml(r.transformedInput)}</code></td>
                <td><code>${escapeHtml(r.transformedOutput)}</code></td>
                <td class="mt-holds">${r.holds ? '✓' : '✗'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function bindEvents() {
    root.querySelectorAll('[data-example]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.exampleId = btn.dataset.example;
        const ex = getExample();
        state.relationId = ex.relations[0].id;
        state.results = null;
        mtQuiz.active = false;
        render();
      });
    });

    root.querySelectorAll('[data-rel]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.relationId = btn.dataset.rel;
        state.results = null;
        mtQuiz.active = false;
        render();
      });
    });

    const generateBtn = root.querySelector('[data-testid="mt-generate"]');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        const ex = getExample();
        const rel = getRelation();
        state.results = generateMrTests(ex, rel, 8);
        const resultsEl = root.querySelector('[data-testid="mt-results"]');
        if (resultsEl) resultsEl.innerHTML = renderResults(state.results);
      });
    }

    const mqStart = root.querySelector('[data-testid="mt-quiz-start"]');
    if (mqStart) {
      mqStart.addEventListener('click', () => {
        const ex = getExample();
        const rel = getRelation();
        mtQuiz.autoResults = generateMrTests(ex, rel, 8);
        mtQuiz.active = true;
        mtQuiz.phase = 'question';
        mtQuiz.answer = '';
        render();
      });
    }
    const mqClose = root.querySelector('[data-testid="mt-quiz-close"]');
    if (mqClose) {
      mqClose.addEventListener('click', () => { mtQuiz.active = false; render(); });
    }
    const mqCheck = root.querySelector('[data-testid="mt-quiz-check"]');
    if (mqCheck) {
      mqCheck.addEventListener('click', () => {
        const inp = root.querySelector('[data-testid="mt-quiz-input"]');
        mtQuiz.answer = inp ? inp.value : '';
        mtQuiz.phase = 'graded';
        render();
      });
    }
    const mqReset = root.querySelector('[data-testid="mt-quiz-reset"]');
    if (mqReset) {
      mqReset.addEventListener('click', () => {
        const ex = getExample();
        const rel = getRelation();
        mtQuiz.autoResults = generateMrTests(ex, rel, 8);
        mtQuiz.phase = 'question';
        mtQuiz.answer = '';
        render();
      });
    }
  }

  render();
  return root;
}
