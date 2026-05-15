import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';

// SAILOR — "Guiding Symbolic Execution with Static Analysis and LLMs for
// Vulnerability Discovery" (Shafiuzzaman, Desai, Guo, Bultan;
// arXiv:2604.06506, 2026). Four-phase pipeline; phase 2 is iterative.
const PHASES = [
  {
    id: 'static',
    colorClass: 'sailor-phase--amber',
    // Each phase carries an illustrative I/O pair drawn from the worked
    // strcpy buffer-overflow example below.
    exampleInput: `// scanned source — config_loader.c
void load_name(const char *raw) {
    char name[32];
    strcpy(name, raw);   // ← flagged
    register_user(name);
}`,
    exampleOutput: `SUSPECT  config_loader.c:4  CWE-787 (out-of-bounds write)
SPEC     precondition: strlen(raw) < 32
ENTRY    load_name(const char *raw)
TAINT    raw — untrusted (caller-supplied)`,
    failureModes: ['sailor.static.failure1', 'sailor.static.failure2'],
  },
  {
    id: 'harness',
    colorClass: 'sailor-phase--blue',
    iterative: true,
    exampleInput: `SUSPECT  config_loader.c:4
SPEC     precondition: strlen(raw) < 32
ENTRY    load_name(const char *raw)

[compiler feedback, round 1]
error: 'raw' may be used uninitialized`,
    exampleOutput: `// harness — round 2 (compiles clean)
int main() {
    char raw[64];
    klee_make_symbolic(raw, sizeof raw, "raw");
    raw[63] = '\\0';                 // bound the symbolic string
    load_name(raw);
    return 0;
}`,
    failureModes: ['sailor.harness.failure1', 'sailor.harness.failure2'],
  },
  {
    id: 'symbolic',
    colorClass: 'sailor-phase--purple',
    exampleInput: `// harness + symbolic string 'raw'
load_name(raw);   // explore all feasible paths`,
    exampleOutput: `PATH 1   strlen(raw) < 32   → safe
PATH 2   strlen(raw) ≥ 32   → strcpy writes past name[32]
VIOLATION  out-of-bounds write @ config_loader.c:4
WITNESS    raw = "AAAAAAA…A" (40 bytes)`,
    failureModes: ['sailor.symbolic.failure1', 'sailor.symbolic.failure2'],
  },
  {
    id: 'replay',
    colorClass: 'sailor-phase--green',
    exampleInput: `WITNESS  raw = "AAAA…A" (40 bytes)
// run UNMODIFIED config_loader.c with this concrete input`,
    exampleOutput: `$ ./config_loader < witness.txt
==4127== Invalid write of size 1
==4127==    at load_name (config_loader.c:4)
CONFIRMED — real crash, not a harness artifact`,
    failureModes: ['sailor.replay.failure1', 'sailor.replay.failure2'],
  },
];

// Ablation numbers from the paper's evaluation (10 OSS projects, 6.8M
// LOC C/C++). `confirmed` = confirmed crashes.
const ABLATION = [
  { id: 'full',       confirmed: 421, noteKey: 'sailor.abl.full' },
  { id: 'no-static',  confirmed: 35,  noteKey: 'sailor.abl.noStatic' },   // 12.2× drop
  { id: 'no-llm',     confirmed: 0,   noteKey: 'sailor.abl.noLlm' },
  { id: 'baseline',   confirmed: 12,  noteKey: 'sailor.abl.baseline' },
];

const state = {
  activePhase: 'static',
  detailTab: 'role',
  quiz: { active: false, phase: 'idle', answer: '' },
  lab: { active: false, text: '' },
};

let root;

function renderPipeline() {
  return `
    <div class="sailor-pipeline" data-testid="sailor-pipeline">
      ${PHASES.map((phase, i) => `
        ${i > 0 ? '<div class="sailor-arrow" aria-hidden="true">→</div>' : ''}
        <button type="button"
          class="sailor-phase-card ${phase.colorClass} ${state.activePhase === phase.id ? 'sailor-phase--active' : ''}"
          data-phase="${phase.id}"
          data-testid="sailor-phase-${phase.id}">
          <div class="sailor-phase-num">${t('sailor.phase.num', { n: i + 1 })}${phase.iterative ? ' ⟳' : ''}</div>
          <div class="sailor-phase-name">${t('sailor.phase.' + phase.id + '.name')}</div>
          <div class="sailor-phase-sub">${t('sailor.phase.' + phase.id + '.sub')}</div>
        </button>
      `).join('')}
    </div>`;
}

function renderPhaseDetail() {
  const phase = PHASES.find((p) => p.id === state.activePhase);
  if (!phase) return '';
  const tabs = ['role', 'example', 'failures'];
  return `
    <div class="sailor-detail" data-testid="sailor-detail">
      <div class="sailor-detail-tabs">
        ${tabs.map((tab) => `
          <button type="button"
            class="sailor-detail-tab ${state.detailTab === tab ? 'sailor-detail-tab--active' : ''}"
            data-detail-tab="${tab}"
            data-testid="sailor-detail-${tab}">${t('sailor.detail.' + tab)}</button>
        `).join('')}
      </div>
      <div class="sailor-detail-body">
        ${state.detailTab === 'role' ? `
          <p class="sailor-detail-role">${t('sailor.phase.' + phase.id + '.role')}</p>
          ${phase.iterative ? `<p class="sailor-detail-loop">${t('sailor.phase.harness.loop')}</p>` : ''}
        ` : ''}
        ${state.detailTab === 'example' ? `
          <div class="sailor-example-grid">
            <div>
              <h4>${t('sailor.example.in')}</h4>
              <pre class="sailor-example-pre">${phase.exampleInput.replace(/</g, '&lt;')}</pre>
            </div>
            <div>
              <h4>${t('sailor.example.out')}</h4>
              <pre class="sailor-example-pre sailor-example-out">${phase.exampleOutput.replace(/</g, '&lt;')}</pre>
            </div>
          </div>
        ` : ''}
        ${state.detailTab === 'failures' ? `
          <ul class="sailor-failure-list">
            ${phase.failureModes.map((k) => `<li>${t(k)}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    </div>`;
}

function renderAblation() {
  const max = Math.max(...ABLATION.map((a) => a.confirmed), 1);
  return `
    <div class="sailor-ablation" data-testid="sailor-ablation">
      <h3>${t('sailor.abl.title')}</h3>
      <p class="sailor-ablation-note">${t('sailor.abl.note')}</p>
      <div class="sailor-ablation-bars">
        ${ABLATION.map((a) => `
          <div class="sailor-abl-row" data-testid="sailor-abl-${a.id}">
            <span class="sailor-abl-label">${t('sailor.abl.' + a.id + '.label')}</span>
            <div class="sailor-abl-bar-wrap">
              <div class="sailor-abl-bar sailor-abl-bar--${a.id}" style="width:${(a.confirmed / max) * 100}%"></div>
            </div>
            <span class="sailor-abl-val">${a.confirmed}</span>
            <span class="sailor-abl-detail">${t(a.noteKey)}</span>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderBridge() {
  return `
    <div class="sailor-bridges">
      <button type="button" class="sailor-bridge" data-testid="sailor-bridge-symbex"
        title="${t('sailor.bridge.symbex.title')}">
        🔗 → ${t('section.symbex')}
      </button>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="sailor-quiz-start" data-testid="sailor-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'b';
    const shareEncoded = encodeResult({
      v: 1, explorer: 'sailor', explorerLabel: t('sailor.title'),
      mode: 'quiz', ts: Date.now(), lang: getLocale(),
      score: correct ? 1 : 0, total: 1,
      items: [{
        q: t('sailor.quiz.prompt'),
        a: state.quiz.answer ? t('sailor.quiz.' + state.quiz.answer) : '',
        expected: t('sailor.quiz.b'),
        ok: correct,
      }],
    });
    return `<div class="sailor-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="sailor-quiz-result">
      <p>${correct ? t('sailor.quiz.correct') : t('sailor.quiz.wrong')}</p>
      <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="sailor-quiz-share">📋 ${t('quiz.share.btn')}</button>
    </div>`;
  }
  return `
    <div class="sailor-quiz" data-testid="sailor-quiz">
      <p class="sailor-quiz-prompt">${t('sailor.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="sailor-quiz-option">
          <input type="radio" name="sailor-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('sailor.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="sailor-quiz-submit" data-testid="sailor-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="sailor-lab-start" data-testid="sailor-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="sailor-lab" data-testid="sailor-lab">
      <p class="sailor-lab-prompt">${t('sailor.lab.prompt')}</p>
      <textarea class="sailor-lab-textarea" data-testid="sailor-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="sailor-wrap" data-testid="sailor-wrap">
      <div class="emx-paper-cite" data-testid="sailor-paper-cite">
        <div class="emx-paper-header">
          <span class="emx-paper-badge">arXiv</span>
          <a class="emx-paper-link" href="https://arxiv.org/abs/2604.06506" target="_blank" rel="noopener noreferrer">
            Guiding Symbolic Execution with Static Analysis and LLMs for Vulnerability Discovery
          </a>
          <span class="emx-paper-venue">arXiv:2604.06506 · 2026</span>
        </div>
      </div>
      <h2 class="sailor-title">${t('sailor.title')}</h2>
      <p class="sailor-desc">${t('sailor.desc')}</p>
      ${renderPipeline()}
      ${renderPhaseDetail()}
      ${renderAblation()}
      ${renderBridge()}
      <section class="sailor-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-phase]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activePhase = btn.dataset.phase;
      state.detailTab = 'role';
      render();
    });
  });
  root.querySelectorAll('[data-detail-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.detailTab = btn.dataset.detailTab;
      render();
    });
  });
  root.querySelector('[data-testid="sailor-bridge-symbex"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="symbex"]')?.click();
  });
  root.querySelector('[data-testid="sailor-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="sailor-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="sailor-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="sailor-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="sailor-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createSAILORPipelineExplorer() {
  state.activePhase = 'static';
  state.detailTab = 'role';
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}

export { PHASES, ABLATION };
