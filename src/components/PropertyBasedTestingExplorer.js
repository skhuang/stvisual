import { t, getLocale } from '../i18n/index.js';
import { encodeResult, buildShareUrl } from '../utils/resultExporter.js';
import { PBT_PRESETS, runPropertyTests } from '../utils/propertyTesting.js';

function escapeHtml(v = '') {
  return String(v)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function createPropertyBasedTestingExplorer() {
  const root = document.createElement('div');
  root.className = 'pbt-explorer';
  root.dataset.testid = 'pbt-explorer';

  let activePresetId = PBT_PRESETS[0].id;
  let numTests = 100;
  let lastResult = null;

  const pbtQuiz = { active: false, phase: 'question', gotAnswer: '', expectedAnswer: '' };
  const pbtLabReflect = { active: false, a1: '', a2: '' };

  /* ── helpers ── */

  function preset() { return PBT_PRESETS.find((p) => p.id === activePresetId); }

  /* ── quiz ── */

  function renderQuizPanel() {
    if (!pbtQuiz.active) return '';
    if (pbtQuiz.phase === 'graded') {
      const ok = pbtQuiz.gotAnswer.trim() === '-1' && pbtQuiz.expectedAnswer.trim() === '0';
      const shareEncoded = encodeResult({
        v: 1, explorer: 'pbt', explorerLabel: t('quiz.pbt.title'),
        mode: 'quiz', ts: Date.now(), lang: getLocale(),
        score: ok ? 1 : 0, total: 1,
        items: [{ q: t('quiz.pbt.prompt'), a: `got=${pbtQuiz.gotAnswer}, expected=${pbtQuiz.expectedAnswer}`, expected: 'got=-1,expected=0', ok }],
      });
      return `
        <div class="quiz-panel" data-testid="pbt-quiz-panel">
          <div class="quiz-header">
            <span>${t('quiz.pbt.title')}</span>
            <button type="button" class="quiz-close-btn" data-testid="pbt-quiz-close">✕</button>
          </div>
          <p class="quiz-prompt">${t('quiz.pbt.prompt')}</p>
          <p class="quiz-score ${ok ? 'quiz-score--perfect' : 'quiz-score--wrong'}">
            ${ok ? t('quiz.graph.perfect') : ''}
            ${t('quiz.pbt.answer')}
          </p>
          <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="pbt-quiz-share">📋 ${t('quiz.share.btn')}</button>
          <button type="button" class="quiz-start-btn" data-testid="pbt-quiz-reset">${t('quiz.reset')}</button>
        </div>`;
    }
    return `
      <div class="quiz-panel" data-testid="pbt-quiz-panel">
        <div class="quiz-header">
          <span>${t('quiz.pbt.title')}</span>
          <button type="button" class="quiz-close-btn" data-testid="pbt-quiz-close">✕</button>
        </div>
        <p class="quiz-prompt">${t('quiz.pbt.prompt')}</p>
        <div class="quiz-bva-inputs">
          <label class="quiz-bva-field">
            ${t('quiz.pbt.label.got')}
            <input type="number" class="quiz-input" data-testid="pbt-quiz-got" value="${escapeHtml(pbtQuiz.gotAnswer)}" />
          </label>
          <label class="quiz-bva-field">
            ${t('quiz.pbt.label.expected')}
            <input type="number" class="quiz-input" data-testid="pbt-quiz-expected" value="${escapeHtml(pbtQuiz.expectedAnswer)}" />
          </label>
        </div>
        <button type="button" class="quiz-start-btn" data-testid="pbt-quiz-check">${t('quiz.check')}</button>
      </div>`;
  }

  /* ── lab reflect ── */

  function renderLabReflectPanel() {
    if (!pbtLabReflect.active) return '';
    return `
      <div class="lab-panel" data-testid="pbt-lab-reflect-panel">
        <div class="lab-panel-header">
          <span class="lab-panel-title">${t('lab.reflect.title')}</span>
          <button type="button" class="quiz-close-btn" data-testid="pbt-lab-reflect-close">✕</button>
        </div>
        <div class="lab-reflect-field">
          <label class="lab-reflect-label">${t('lab.reflect.q.pbt.1')}</label>
          <textarea class="lab-reflect-textarea" data-testid="pbt-lab-reflect-a1" rows="3" placeholder="${t('lab.reflect.placeholder')}">${escapeHtml(pbtLabReflect.a1)}</textarea>
        </div>
        <div class="lab-reflect-field">
          <label class="lab-reflect-label">${t('lab.reflect.q.pbt.2')}</label>
          <textarea class="lab-reflect-textarea" data-testid="pbt-lab-reflect-a2" rows="3" placeholder="${t('lab.reflect.placeholder')}">${escapeHtml(pbtLabReflect.a2)}</textarea>
        </div>
        <div class="lab-reflect-actions">
          <button type="button" class="quiz-share-btn" data-testid="pbt-lab-reflect-share">📋 ${t('quiz.share.btn')}</button>
        </div>
      </div>`;
  }

  /* ── main render ── */

  function render() {
    const p = preset();

    const presetBtns = PBT_PRESETS.map((pr) => {
      const isBug = pr.expectsCounterexample;
      return `<button type="button"
          class="pbt-preset-btn ${pr.id === activePresetId ? 'pbt-preset-btn--active' : ''} ${isBug ? 'pbt-preset-btn--bug' : ''}"
          data-preset="${pr.id}" data-testid="pbt-preset-${pr.id}">${t(pr.nameKey)}</button>`;
    }).join('');

    const propsHtml = p.properties.map((prop, i) => `
      <div class="pbt-prop-row">
        <span class="pbt-prop-id">P${i + 1}</span>
        <span class="pbt-prop-text">${escapeHtml(prop.label)}</span>
      </div>`).join('');

    let resultHtml = '';
    let cxHtml = '';
    let distHtml = '';

    if (lastResult) {
      const { results, counterexample } = lastResult;
      const totalTests = results.filter((r) => r.passed !== undefined).length;
      const passedTests = results.filter((r) => r.passed).length;

      if (!counterexample) {
        resultHtml = `
          <div class="pbt-all-pass" data-testid="pbt-all-pass">${t('pbt.all.pass', { n: numTests })}</div>`;
      } else {
        const failedProp = p.properties.find((prop) => prop.id === counterexample.propId);
        resultHtml = `
          <span class="pbt-badge--fail" data-testid="pbt-fail-badge">${t('pbt.results.failed', { n: counterexample.testNum })}</span>`;
        cxHtml = `
          <div class="pbt-cx-card" data-testid="pbt-counterexample">
            <p class="pbt-cx-title">${t('pbt.counterexample.title')}</p>
            <div class="pbt-cx-row">
              <span class="pbt-cx-key">${t('pbt.counterexample.input')}</span>
              <span class="pbt-cx-val">${escapeHtml(p.format(counterexample.args))}</span>
            </div>
            <div class="pbt-cx-row">
              <span class="pbt-cx-key">${t('pbt.counterexample.property')}</span>
              <span class="pbt-cx-prop">${escapeHtml(failedProp?.label || counterexample.propId)}</span>
            </div>
          </div>`;
      }

      // Sample up to 20 inputs from results for distribution display
      const sampleInputs = results.slice(0, 20);
      const sampleChips = sampleInputs.map((r, i) => {
        const isFail = !r.passed;
        return `<span class="pbt-dist-sample ${isFail ? 'pbt-dist-sample--fail' : ''}" title="${isFail ? 'FAIL' : 'pass'}">${escapeHtml(p.format(r.args))}</span>`;
      }).join('');
      distHtml = `
        <div class="pbt-dist-card" data-testid="pbt-distribution">
          <p class="pbt-dist-title">${t('pbt.distribution.title')}</p>
          <div class="pbt-dist-samples">${sampleChips}</div>
        </div>`;
    }

    const metricEncoded = encodeResult({
      v: 1, explorer: 'pbt', explorerLabel: t('section.pbt'),
      mode: 'lab-metric', ts: Date.now(), lang: getLocale(),
      score: 1, total: 1,
      items: [{ q: `${activePresetId} · ${numTests} tests`, a: lastResult && lastResult.counterexample ? 'fail' : 'pass', ok: true }],
    });

    root.innerHTML = `
      <div class="pbt-presets" data-testid="pbt-preset-bar">${presetBtns}</div>

      <div class="pbt-main">
        <div class="pbt-code-card">
          <p class="pbt-code-title">${t('pbt.code.title')}</p>
          <pre class="pbt-code-block" data-testid="pbt-code">${escapeHtml(p.code)}</pre>
        </div>

        <div class="pbt-props-card">
          <p class="pbt-props-title">${t('pbt.properties.title')}</p>
          ${propsHtml}
        </div>
      </div>

      <div class="pbt-controls" data-testid="pbt-controls">
        <label class="pbt-numtests-label">
          ${t('pbt.numtests')}:
          <input type="number" min="10" max="500" step="10" class="pbt-numtests-input"
            value="${numTests}" data-testid="pbt-numtests-input" />
        </label>
        <button type="button" class="pbt-run-btn" data-testid="pbt-run-btn">${t('pbt.run', { n: numTests })}</button>
      </div>

      ${lastResult !== null ? `
      <div class="pbt-result-card">
        <div class="pbt-result-header">
          <h4 class="pbt-result-title">${t('pbt.results.title')}</h4>
          ${resultHtml}
        </div>
        ${cxHtml}
      </div>
      ${distHtml}
      ` : ''}

      <div class="pbt-bottom-card">
        <div class="pbt-bottom-header">
          <h4 class="pbt-bottom-title">${t('section.pbt')}</h4>
          <div class="pbt-bottom-actions">
            ${!pbtQuiz.active ? `<button type="button" class="quiz-start-btn" data-testid="pbt-quiz-start">${t('quiz.start')}</button>` : ''}
            ${!pbtLabReflect.active ? `<button type="button" class="quiz-start-btn" data-testid="pbt-lab-reflect-start">${t('lab.reflect.start')}</button>` : ''}
            <button type="button" class="quiz-share-btn" data-share-payload="${metricEncoded}" data-testid="pbt-lab-metric">📊 ${t('lab.metric.record')}</button>
          </div>
        </div>
        ${renderQuizPanel()}
        ${renderLabReflectPanel()}
      </div>

      <p class="pbt-hint">${t('pbt.hint')}</p>
    `;

    bindEvents();
  }

  /* ── event binding ── */

  function bindEvents() {
    root.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activePresetId = btn.dataset.preset;
        lastResult = null;
        render();
      });
    });

    const numInput = root.querySelector('[data-testid="pbt-numtests-input"]');
    if (numInput) numInput.addEventListener('change', () => {
      const v = parseInt(numInput.value, 10);
      if (v >= 10 && v <= 500) numTests = v;
      render();
    });

    const runBtn = root.querySelector('[data-testid="pbt-run-btn"]');
    if (runBtn) runBtn.addEventListener('click', () => {
      const p = preset();
      lastResult = runPropertyTests(p, numTests);
      render();
    });

    // Quiz
    const qStart = root.querySelector('[data-testid="pbt-quiz-start"]');
    if (qStart) qStart.addEventListener('click', () => {
      pbtQuiz.active = true; pbtQuiz.phase = 'question'; pbtQuiz.gotAnswer = ''; pbtQuiz.expectedAnswer = ''; render();
    });

    const qClose = root.querySelector('[data-testid="pbt-quiz-close"]');
    if (qClose) qClose.addEventListener('click', () => { pbtQuiz.active = false; render(); });

    const qCheck = root.querySelector('[data-testid="pbt-quiz-check"]');
    if (qCheck) qCheck.addEventListener('click', () => {
      const gotEl = root.querySelector('[data-testid="pbt-quiz-got"]');
      const expEl = root.querySelector('[data-testid="pbt-quiz-expected"]');
      pbtQuiz.gotAnswer = gotEl ? gotEl.value : '';
      pbtQuiz.expectedAnswer = expEl ? expEl.value : '';
      pbtQuiz.phase = 'graded';
      render();
    });

    const qReset = root.querySelector('[data-testid="pbt-quiz-reset"]');
    if (qReset) qReset.addEventListener('click', () => {
      pbtQuiz.phase = 'question'; pbtQuiz.gotAnswer = ''; pbtQuiz.expectedAnswer = ''; render();
    });

    // Lab Reflect
    const lrStart = root.querySelector('[data-testid="pbt-lab-reflect-start"]');
    if (lrStart) lrStart.addEventListener('click', () => { pbtLabReflect.active = true; render(); });

    const lrClose = root.querySelector('[data-testid="pbt-lab-reflect-close"]');
    if (lrClose) lrClose.addEventListener('click', () => {
      const a1el = root.querySelector('[data-testid="pbt-lab-reflect-a1"]');
      const a2el = root.querySelector('[data-testid="pbt-lab-reflect-a2"]');
      if (a1el) pbtLabReflect.a1 = a1el.value;
      if (a2el) pbtLabReflect.a2 = a2el.value;
      pbtLabReflect.active = false;
      render();
    });

    const lrA1 = root.querySelector('[data-testid="pbt-lab-reflect-a1"]');
    if (lrA1) lrA1.addEventListener('input', () => { pbtLabReflect.a1 = lrA1.value; });

    const lrA2 = root.querySelector('[data-testid="pbt-lab-reflect-a2"]');
    if (lrA2) lrA2.addEventListener('input', () => { pbtLabReflect.a2 = lrA2.value; });

    const lrShare = root.querySelector('[data-testid="pbt-lab-reflect-share"]');
    if (lrShare) lrShare.addEventListener('click', () => {
      const a1 = root.querySelector('[data-testid="pbt-lab-reflect-a1"]')?.value || pbtLabReflect.a1;
      const a2 = root.querySelector('[data-testid="pbt-lab-reflect-a2"]')?.value || pbtLabReflect.a2;
      const url = buildShareUrl(encodeResult({
        v: 1, explorer: 'pbt', explorerLabel: t('lab.reflect.title'),
        mode: 'lab-reflect', ts: Date.now(), lang: getLocale(),
        score: 0, total: 0,
        items: [
          { q: t('lab.reflect.q.pbt.1'), a: a1, ok: true },
          { q: t('lab.reflect.q.pbt.2'), a: a2, ok: true },
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
