import { t } from '../i18n/index.js';

const PAPER = {
  title: 'Mutation-Guided LLM-based Test Generation at Meta',
  url: 'https://arxiv.org/abs/2501.12862',
  venue: 'FSE 2025 · arXiv:2501.12862',
  authors: 'Foster, Gulati, Harman, Harper, Mao, Ritchey, Robert, Sengupta (Meta)',
  abstract:
    'We present ACH (Automated Compliance Hardener), an agentic LLM system that generates ' +
    'unit tests targeting specific fault classes through mutation-guided testing. Deployed ' +
    'across 10,795 Android Kotlin classes at Meta across 7 platforms, ACH achieved 73% ' +
    'engineer acceptance rate and a 15% mutant kill rate (vs 2.4% for coverage-only). ' +
    'Key finding: LLM-as-judge equivalence detection improved from precision 0.79 / recall 0.47 ' +
    'to 0.95 / 0.96 after comment-stripping preprocessing.',
};

const PAIRS = [
  {
    id: 1, equivalent: true, category: 'comment-only', detectedBy: 'strip-comments',
    label: 'square() — inline comment added',
    original: 'function square(x) {\n  return x * x;\n}',
    mutant:   'function square(x) {\n  return x * x; // x squared\n}',
    reasonKey: 'emx.pair.1.reason',
  },
  {
    id: 2, equivalent: true, category: 'comment-block', detectedBy: 'strip-comments',
    label: 'clamp() — comment block prepended',
    original: 'function clamp(x, lo, hi) {\n  if (x < lo) return lo;\n  if (x > hi) return hi;\n  return x;\n}',
    mutant:   '// boundary clamping utility\nfunction clamp(x, lo, hi) {\n  if (x < lo) return lo;\n  if (x > hi) return hi;\n  return x;\n}',
    reasonKey: 'emx.pair.2.reason',
  },
  {
    id: 3, equivalent: true, category: 'semantic', detectedBy: 'llm-judge',
    label: 'max() — condition direction flipped',
    original: 'function max(a, b) {\n  return a > b ? a : b;\n}',
    mutant:   'function max(a, b) {\n  return b < a ? a : b;\n}',
    reasonKey: 'emx.pair.3.reason',
  },
  {
    id: 4, equivalent: true, category: 'semantic', detectedBy: 'llm-judge',
    label: 'nand() — De Morgan rewrite',
    original: 'function nand(a, b) {\n  return !(a && b);\n}',
    mutant:   'function nand(a, b) {\n  return !a || !b;\n}',
    reasonKey: 'emx.pair.4.reason',
  },
  {
    id: 5, equivalent: false, category: 'AOR',
    label: 'sub() — AOR: − replaced with +',
    original: 'function sub(a, b) {\n  return a - b;\n}',
    mutant:   'function sub(a, b) {\n  return a + b;\n}',
    killedBy: 'sub(3, 1) → 2 (original) vs 4 (mutant)',
  },
  {
    id: 6, equivalent: false, category: 'ROR',
    label: 'isAdult() — ROR: >= replaced with >',
    original: 'function isAdult(age) {\n  return age >= 18;\n}',
    mutant:   'function isAdult(age) {\n  return age > 18;\n}',
    killedBy: 'isAdult(18) → true (original) vs false (mutant)',
  },
  {
    id: 7, equivalent: false, category: 'LCR',
    label: 'both() — LCR: && replaced with ||',
    original: 'function both(a, b) {\n  return a && b;\n}',
    mutant:   'function both(a, b) {\n  return a || b;\n}',
    killedBy: 'both(true, false) → false (original) vs true (mutant)',
  },
  {
    id: 8, equivalent: false, category: 'SDL',
    label: 'clampMin() — SDL: guard deleted',
    original: 'function clampMin(x, lo) {\n  if (x < lo) return lo;\n  return x;\n}',
    mutant:   'function clampMin(x, lo) {\n  return x;\n}',
    killedBy: 'clampMin(1, 5) → 5 (original) vs 1 (mutant)',
  },
];

const STEP_ORDER = ['syntactic', 'strip-comments', 'llm-judge'];

const state = {
  pairIndex: 0,
  answers: {},
  quiz: { active: false, phase: 'idle', answer: '' },
  lab: { active: false, text: '' },
};

let root;

function stripComments(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

function computePipelineResult(pair) {
  const o = pair.original.trim();
  const m = pair.mutant.trim();
  if (o === m) return 'syntactic';
  if (stripComments(o) === stripComments(m)) return 'strip-comments';
  if (pair.equivalent) return 'llm-judge';
  return 'none';
}

function computeDiff(original, mutant) {
  const oLines = original.split('\n');
  const mLines = mutant.split('\n');
  const out = [];
  let oi = 0, mi = 0;
  while (oi < oLines.length || mi < mLines.length) {
    if (oi >= oLines.length) {
      out.push({ type: 'add', text: mLines[mi++] });
    } else if (mi >= mLines.length) {
      out.push({ type: 'del', text: oLines[oi++] });
    } else if (oLines[oi] === mLines[mi]) {
      out.push({ type: 'ctx', text: oLines[oi] }); oi++; mi++;
    } else {
      const inO = mLines.slice(mi + 1).includes(oLines[oi]);
      const inM = oLines.slice(oi + 1).includes(mLines[mi]);
      if (!inO && !inM) {
        out.push({ type: 'del', text: oLines[oi++] });
        out.push({ type: 'add', text: mLines[mi++] });
      } else if (inO) {
        out.push({ type: 'add', text: mLines[mi++] });
      } else {
        out.push({ type: 'del', text: oLines[oi++] });
      }
    }
  }
  return out;
}

function computeMetrics() {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  for (const pair of PAIRS) {
    const ans = state.answers[pair.id];
    if (!ans) continue;
    const predicted = ans === 'eq';
    if (predicted && pair.equivalent) tp++;
    else if (predicted && !pair.equivalent) fp++;
    else if (!predicted && pair.equivalent) fn++;
    else tn++;
  }
  const precision = tp + fp > 0 ? (tp / (tp + fp)).toFixed(2) : '—';
  const recall = tp + fn > 0 ? (tp / (tp + fn)).toFixed(2) : '—';
  return { tp, fp, fn, tn, precision, recall };
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderPaperCite() {
  return `
    <div class="emx-paper-cite" data-testid="emx-paper-cite">
      <div class="emx-paper-header">
        <span class="emx-paper-badge">arXiv</span>
        <a class="emx-paper-link" href="${PAPER.url}" target="_blank" rel="noopener noreferrer">${PAPER.title}</a>
        <span class="emx-paper-venue">${PAPER.venue}</span>
      </div>
      <details class="emx-paper-details">
        <summary class="emx-paper-summary">${t('emx.paper.showAbstract')}</summary>
        <p class="emx-paper-abstract">${PAPER.abstract}</p>
        <p class="emx-paper-authors">${PAPER.authors}</p>
      </details>
    </div>`;
}

function renderPipeline() {
  const pair = PAIRS[state.pairIndex];
  const detected = computePipelineResult(pair);
  const detectedIdx = STEP_ORDER.indexOf(detected);
  const steps = [
    { id: 'syntactic',      nameKey: 'emx.step1.name', descKey: 'emx.step1.desc' },
    { id: 'strip-comments', nameKey: 'emx.step2.name', descKey: 'emx.step2.desc' },
    { id: 'llm-judge',      nameKey: 'emx.step3.name', descKey: 'emx.step3.desc' },
  ];
  return `
    <div class="emx-pipeline" data-testid="emx-pipeline">
      <h3>${t('emx.pipeline.title')}</h3>
      <p class="emx-pipeline-desc">${t('emx.pipeline.desc')}</p>
      <div class="emx-steps">
        ${steps.map((step, i) => {
          const isCaught = detectedIdx === i;
          const isPassed = detectedIdx > i || (detectedIdx === -1 && i < 3);
          let cls = 'emx-step';
          let badge = '';
          if (isCaught) {
            cls += ' emx-step--caught';
            badge = `<span class="emx-step-badge emx-step-badge--caught">${t('emx.step.caught')}</span>`;
          } else if (isPassed && !isCaught) {
            cls += ' emx-step--pass';
            badge = `<span class="emx-step-badge emx-step-badge--pass">${t('emx.step.pass')}</span>`;
          }
          return `<div class="${cls}">${i > 0 ? '<div class="emx-step-arrow">→</div>' : ''}
            <div class="emx-step-body">
              <div class="emx-step-name">${t(step.nameKey)}</div>
              <div class="emx-step-desc">${t(step.descKey)}</div>
              ${badge}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
}

function renderPractice() {
  const pair = PAIRS[state.pairIndex];
  const diff = computeDiff(pair.original, pair.mutant);
  const answered = state.answers[pair.id];
  const correct = answered !== undefined ? (answered === 'eq') === pair.equivalent : null;

  return `
    <div class="emx-practice" data-testid="emx-practice">
      <div class="emx-practice-header">
        <h3>${t('emx.practice.title')}</h3>
        <span class="emx-pair-counter">${t('emx.practice.pair', { n: state.pairIndex + 1, total: PAIRS.length })}</span>
      </div>
      <div class="emx-pair-meta">
        <span class="emx-pair-label">${pair.label}</span>
        <span class="emx-category-badge">${pair.category}</span>
      </div>
      <div class="emx-code-diff" data-testid="emx-code-diff">
        <div class="emx-diff-label">${t('emx.diff.label')}</div>
        <pre class="emx-diff-pre">${diff.map(line => {
          const text = esc(line.text);
          if (line.type === 'add') return `<span class="emx-diff-add">+ ${text}</span>`;
          if (line.type === 'del') return `<span class="emx-diff-del">- ${text}</span>`;
          return `<span class="emx-diff-ctx">  ${text}</span>`;
        }).join('\n')}</pre>
      </div>
      ${answered === undefined ? `
        <div class="emx-judgment-row" data-testid="emx-judgment-row">
          <button type="button" class="emx-btn emx-btn-eq" data-testid="emx-btn-eq">${t('emx.btn.eq')}</button>
          <button type="button" class="emx-btn emx-btn-neq" data-testid="emx-btn-neq">${t('emx.btn.neq')}</button>
        </div>
      ` : `
        <div class="emx-result ${correct ? 'emx-result--correct' : 'emx-result--wrong'}" data-testid="emx-result">
          <span class="emx-result-icon">${correct ? '✓' : '✗'}</span>
          <strong>${correct ? t('emx.result.correct') : t('emx.result.wrong')}</strong>
          ${pair.equivalent
            ? `<p>${t('emx.result.eq.expl', { reason: t(pair.reasonKey) })}</p>
               <p class="emx-detected-by">${t('emx.detected.by')}: <strong>${t('emx.detected.' + pair.detectedBy)}</strong></p>`
            : `<p>${t('emx.result.neq.expl', { test: pair.killedBy })}</p>`}
        </div>
      `}
      <div class="emx-nav-row">
        <button type="button" class="emx-nav-btn" data-testid="emx-prev" ${state.pairIndex === 0 ? 'disabled' : ''}>← ${t('emx.nav.prev')}</button>
        <button type="button" class="emx-nav-btn" data-testid="emx-next" ${state.pairIndex === PAIRS.length - 1 ? 'disabled' : ''}>${t('emx.nav.next')} →</button>
      </div>
    </div>`;
}

function renderMetrics() {
  const answered = Object.keys(state.answers).length;
  if (answered === 0) return '';
  const m = computeMetrics();
  return `
    <div class="emx-metrics" data-testid="emx-metrics">
      <h3>${t('emx.metrics.title')}</h3>
      <div class="emx-metrics-grid">
        <div class="emx-metric">
          <span class="emx-metric-val">${m.precision}</span>
          <span class="emx-metric-label">${t('emx.metrics.precision')}</span>
        </div>
        <div class="emx-metric">
          <span class="emx-metric-val">${m.recall}</span>
          <span class="emx-metric-label">${t('emx.metrics.recall')}</span>
        </div>
        <div class="emx-metric">
          <span class="emx-metric-val">${answered}/${PAIRS.length}</span>
          <span class="emx-metric-label">${t('emx.metrics.answered')}</span>
        </div>
      </div>
      <p class="emx-metrics-note">${t('emx.metrics.note', { tp: m.tp, fp: m.fp, fn: m.fn, tn: m.tn })}</p>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="emx-quiz-start" data-testid="emx-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'b';
    return `<div class="emx-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="emx-quiz-result">
      <p>${correct ? t('emx.quiz.correct') : t('emx.quiz.wrong')}</p>
    </div>`;
  }
  return `
    <div class="emx-quiz" data-testid="emx-quiz">
      <p class="emx-quiz-prompt">${t('emx.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map(k => `
        <label class="emx-quiz-option">
          <input type="radio" name="emx-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('emx.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="emx-quiz-submit" data-testid="emx-quiz-submit" ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="emx-lab-start" data-testid="emx-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="emx-lab" data-testid="emx-lab">
      <p class="emx-lab-prompt">${t('emx.lab.prompt')}</p>
      <textarea class="emx-lab-textarea" data-testid="emx-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="emx-wrap" data-testid="emx-wrap">
      ${renderPaperCite()}
      <h2 class="emx-title">${t('emx.title')}</h2>
      <p class="emx-desc">${t('emx.desc')}</p>
      ${renderPipeline()}
      ${renderPractice()}
      ${renderMetrics()}
      <section class="emx-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelector('[data-testid="emx-btn-eq"]')?.addEventListener('click', () => {
    state.answers[PAIRS[state.pairIndex].id] = 'eq'; render();
  });
  root.querySelector('[data-testid="emx-btn-neq"]')?.addEventListener('click', () => {
    state.answers[PAIRS[state.pairIndex].id] = 'neq'; render();
  });
  root.querySelector('[data-testid="emx-prev"]')?.addEventListener('click', () => {
    if (state.pairIndex > 0) { state.pairIndex--; render(); }
  });
  root.querySelector('[data-testid="emx-next"]')?.addEventListener('click', () => {
    if (state.pairIndex < PAIRS.length - 1) { state.pairIndex++; render(); }
  });
  root.querySelector('[data-testid="emx-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' }; render();
  });
  root.querySelectorAll('input[name="emx-quiz"]').forEach(inp => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="emx-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done'; render();
  });
  root.querySelector('[data-testid="emx-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true; render();
  });
  root.querySelector('[data-testid="emx-lab-text"]')?.addEventListener('input', e => {
    state.lab.text = e.target.value;
  });
}

export function createEquivalentMutantExplorer() {
  state.pairIndex = 0;
  state.answers = {};
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}
