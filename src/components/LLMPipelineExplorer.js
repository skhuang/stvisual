import { t } from '../i18n/index.js';

const AGENTS = [
  {
    id: 'mutation',
    colorClass: 'llmp-agent--blue',
    prompt: `You are a software mutation testing expert.
Given the following Kotlin class and an issue description,
write a NEW version of the class containing a typical bug
that is similar to faults described in: {issue_description}

Original class:
{source_code}

Respond with ONLY the mutated class, delimited by:
// MUTANT <START>
[mutated code]
// MUTANT <END>`,
    exampleInput: `Issue: "Null user ID may be logged in analytics events"\n\nOriginal:\nfun trackEvent(userId: String?, event: String) {\n    analytics.log(userId ?: "anon", event)\n}`,
    exampleOutput: `// MUTANT <START>\nfun trackEvent(userId: String?, event: String) {\n    analytics.log(userId, event)  // removed null-safety check\n}\n// MUTANT <END>`,
    failureModes: ['llmp.agent1.failure1', 'llmp.agent1.failure2'],
  },
  {
    id: 'equivalence',
    colorClass: 'llmp-agent--purple',
    prompt: `You are a software testing expert specializing in mutation analysis.
Given two versions of a Kotlin function, determine if they are semantically equivalent
(i.e., they produce identical outputs for all possible inputs).

Version A (original):
{original_code}

Version B (mutant):
{mutant_code}

If they always behave identically, respond with exactly: yes
Otherwise, respond with: no
Followed by a brief explanation and a concrete counterexample input.`,
    exampleInput: `Version A:\nfun square(x: Int) = x * x\n\nVersion B:\nfun square(x: Int) = x * x // computes square`,
    exampleOutput: `yes\n(Comment-only difference — behavior is identical for all inputs)`,
    failureModes: ['llmp.agent2.failure1', 'llmp.agent2.failure2'],
  },
  {
    id: 'test',
    colorClass: 'llmp-agent--green',
    prompt: `You are an expert in writing unit tests for Android Kotlin code.
Given the original class and a mutant version, write JUnit test cases that:
1. PASS on the original version
2. FAIL on the mutant version (i.e., kill the mutant)
3. Are non-flaky (deterministic)
4. Follow the existing test style in the codebase

Original class:
{original_code}

Mutant class:
{mutant_code}

Write the test methods as an extension of the existing test class.`,
    exampleInput: `Original:\nfun isAdult(age: Int) = age >= 18\n\nMutant:\nfun isAdult(age: Int) = age > 18`,
    exampleOutput: `@Test\nfun testBoundaryAge() {\n    assertTrue(isAdult(18))  // kills M2: >= vs >\n    assertFalse(isAdult(17))\n}`,
    failureModes: ['llmp.agent3.failure1', 'llmp.agent3.failure2'],
  },
];

const PLATFORM_STATS = [
  { name: 'Messenger',     classes: 3339, mutants: 2922, tests: 196, killRate: 14 },
  { name: 'WhatsApp',      classes: 1273, mutants: 1087, tests: 135, killRate: 25 },
  { name: 'Instagram',     classes: 1691, mutants: 1381, tests: 122, killRate: 16 },
  { name: 'Wearables',     classes: 2841, mutants: 2468, tests: 45,  killRate: 3  },
  { name: 'Facebook Feed', classes: 346,  mutants: 252,  tests: 15,  killRate: 9  },
];

const state = {
  activeAgent: 'mutation',
  expandedSection: 'prompt',
  quiz: { active: false, phase: 'idle', answer: '' },
  lab: { active: false, text: '' },
};

let root;

function renderPipelineFlow() {
  return `
    <div class="llmp-pipeline" data-testid="llmp-pipeline">
      ${AGENTS.map((agent, i) => `
        ${i > 0 ? '<div class="llmp-arrow" aria-hidden="true">→</div>' : ''}
        <button type="button"
          class="llmp-agent-card ${agent.colorClass} ${state.activeAgent === agent.id ? 'llmp-agent--active' : ''}"
          data-agent="${agent.id}"
          data-testid="llmp-agent-${agent.id}"
        >
          <div class="llmp-agent-num">Agent ${i + 1}</div>
          <div class="llmp-agent-name">${t('llmp.agent.' + agent.id + '.name')}</div>
          <div class="llmp-agent-sub">${t('llmp.agent.' + agent.id + '.sub')}</div>
        </button>
      `).join('')}
    </div>`;
}

function renderAgentDetail() {
  const agent = AGENTS.find((a) => a.id === state.activeAgent);
  if (!agent) return '';
  const sections = ['prompt', 'example', 'failures'];
  return `
    <div class="llmp-detail" data-testid="llmp-detail">
      <div class="llmp-detail-tabs">
        ${sections.map((s) => `
          <button type="button"
            class="llmp-detail-tab ${state.expandedSection === s ? 'llmp-detail-tab--active' : ''}"
            data-section="${s}"
            data-testid="llmp-section-${s}"
          >${t('llmp.section.' + s)}</button>
        `).join('')}
      </div>
      <div class="llmp-detail-body">
        ${state.expandedSection === 'prompt' ? `
          <p class="llmp-detail-note">${t('llmp.prompt.note')}</p>
          <pre class="llmp-prompt-pre">${agent.prompt}</pre>
        ` : ''}
        ${state.expandedSection === 'example' ? `
          <div class="llmp-example-grid">
            <div>
              <h4>${t('llmp.example.input')}</h4>
              <pre class="llmp-example-pre">${agent.exampleInput}</pre>
            </div>
            <div>
              <h4>${t('llmp.example.output')}</h4>
              <pre class="llmp-example-pre llmp-example-out">${agent.exampleOutput}</pre>
            </div>
          </div>
        ` : ''}
        ${state.expandedSection === 'failures' ? `
          <ul class="llmp-failure-list">
            ${agent.failureModes.map((k) => `<li>${t(k)}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    </div>`;
}

function renderComparison() {
  const rows = [
    { label: t('llmp.cmp.approach'),    ruleVal: t('llmp.cmp.rulebased'), llmVal: t('llmp.cmp.llmbased') },
    { label: t('llmp.cmp.killrate'),    ruleVal: '2.4%',   llmVal: '15%' },
    { label: t('llmp.cmp.equivrate'),   ruleVal: '~10–15%', llmVal: '~25%' },
    { label: t('llmp.cmp.domainaware'), ruleVal: '✗', llmVal: '✓' },
    { label: t('llmp.cmp.acceptance'),  ruleVal: '—', llmVal: '73%' },
  ];
  return `
    <div class="llmp-comparison" data-testid="llmp-comparison">
      <h3>${t('llmp.cmp.title')}</h3>
      <table class="llmp-cmp-table">
        <thead><tr>
          <th>${t('llmp.cmp.metric')}</th>
          <th>${t('llmp.cmp.rulebased')}</th>
          <th class="llmp-th-llm">${t('llmp.cmp.llmbased')} (ACH)</th>
        </tr></thead>
        <tbody>
          ${rows.map((r) => `
            <tr>
              <td>${r.label}</td>
              <td>${r.ruleVal}</td>
              <td class="llmp-td-llm">${r.llmVal}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderStats() {
  const maxKill = Math.max(...PLATFORM_STATS.map((p) => p.killRate));
  return `
    <div class="llmp-stats" data-testid="llmp-stats">
      <h3>${t('llmp.stats.title')}</h3>
      <p class="llmp-stats-note">${t('llmp.stats.note')}</p>
      <div class="llmp-stats-bars">
        ${PLATFORM_STATS.map((p) => `
          <div class="llmp-stat-row">
            <span class="llmp-stat-platform">${p.name}</span>
            <div class="llmp-stat-bar-wrap">
              <div class="llmp-stat-bar" style="width:${(p.killRate / maxKill) * 100}%"></div>
            </div>
            <span class="llmp-stat-pct">${p.killRate}%</span>
            <span class="llmp-stat-detail">${p.tests} tests / ${p.mutants} mutants</span>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="llmp-quiz-start" data-testid="llmp-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    return `<div class="llmp-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="llmp-quiz-result">
      <p>${correct ? t('llmp.quiz.correct') : t('llmp.quiz.wrong')}</p>
    </div>`;
  }
  return `
    <div class="llmp-quiz" data-testid="llmp-quiz">
      <p class="llmp-quiz-prompt">${t('llmp.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="llmp-quiz-option">
          <input type="radio" name="llmp-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('llmp.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="llmp-quiz-submit" data-testid="llmp-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="llmp-lab-start" data-testid="llmp-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="llmp-lab" data-testid="llmp-lab">
      <p class="llmp-lab-prompt">${t('llmp.lab.prompt')}</p>
      <textarea class="llmp-lab-textarea" data-testid="llmp-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="llmp-wrap" data-testid="llmp-wrap">
      <div class="emx-paper-cite" data-testid="llmp-paper-cite">
        <div class="emx-paper-header">
          <span class="emx-paper-badge">arXiv</span>
          <a class="emx-paper-link" href="https://arxiv.org/abs/2501.12862" target="_blank" rel="noopener noreferrer">
            Mutation-Guided LLM-based Test Generation at Meta
          </a>
          <span class="emx-paper-venue">FSE 2025 · arXiv:2501.12862</span>
        </div>
      </div>
      <h2 class="llmp-title">${t('llmp.title')}</h2>
      <p class="llmp-desc">${t('llmp.desc')}</p>
      ${renderPipelineFlow()}
      ${renderAgentDetail()}
      <div class="llmp-two-col">
        ${renderComparison()}
        ${renderStats()}
      </div>
      <section class="llmp-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-agent]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeAgent = btn.dataset.agent;
      state.expandedSection = 'prompt';
      render();
    });
  });
  root.querySelectorAll('[data-section]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.expandedSection = btn.dataset.section;
      render();
    });
  });
  root.querySelector('[data-testid="llmp-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' }; render();
  });
  root.querySelectorAll('input[name="llmp-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="llmp-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done'; render();
  });
  root.querySelector('[data-testid="llmp-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true; render();
  });
  root.querySelector('[data-testid="llmp-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createLLMPipelineExplorer() {
  state.activeAgent = 'mutation';
  state.expandedSection = 'prompt';
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}
