import { t } from '../i18n/index.js';

// Four annotated issues paired with a target function, blind mutants (coverage-driven),
// and the small set of fault-directed mutants the ACH pipeline would propose from the
// issue description. Numbers are illustrative but consistent with the paper's
// 2.4% (TestGen-LLM) → 15% (ACH) headline.
const ISSUES = [
  {
    id: 'null-leak',
    titleKey: 'fdx.issue.null-leak.title',
    descKey: 'fdx.issue.null-leak.desc',
    code: `fun logEvent(userId: String?, event: String) {
    if (userId == null) return
    analytics.send(userId, event)
}`,
    blind: [
      { op: 'ROR', label: '== → !=', killRate: 12 },
      { op: 'ROR', label: '== → <',  killRate: 0  },
      { op: 'SDL', label: 'delete analytics.send', killRate: 35 },
      { op: 'SRC', label: 'send(userId, "")', killRate: 8 },
      { op: 'SRC', label: 'send("anon", event)', killRate: 0 },
    ],
    targeted: [
      { op: 'NEG', label: 'remove null-check (if branch deleted)', killRate: 92, targetKey: 'fdx.target.null-leak' },
    ],
    correctTargetedIdx: 0,
    quizCorrect: 'null-leak',
  },
  {
    id: 'off-by-one',
    titleKey: 'fdx.issue.off-by-one.title',
    descKey: 'fdx.issue.off-by-one.desc',
    code: `fun firstNAdults(users: List<User>, n: Int): List<User> {
    val out = mutableListOf<User>()
    for (i in 0 until users.size) {
        if (out.size == n) break
        if (users[i].age >= 18) out.add(users[i])
    }
    return out
}`,
    blind: [
      { op: 'ROR', label: '== → !=', killRate: 18 },
      { op: 'SRC', label: 'users.size + 1', killRate: 22 },
      { op: 'SDL', label: 'delete break',  killRate: 30 },
    ],
    targeted: [
      { op: 'ROR', label: '>= 18 → > 18', killRate: 88, targetKey: 'fdx.target.off-by-one' },
      { op: 'ROR', label: 'out.size == n → out.size > n', killRate: 65, targetKey: 'fdx.target.off-by-one.alt' },
    ],
    correctTargetedIdx: 0,
    quizCorrect: 'off-by-one',
  },
  {
    id: 'missing-cleanup',
    titleKey: 'fdx.issue.missing-cleanup.title',
    descKey: 'fdx.issue.missing-cleanup.desc',
    code: `fun loadConfig(path: String): Config {
    val stream = openStream(path)
    val cfg = parse(stream.readAll())
    stream.close()
    return cfg
}`,
    blind: [
      { op: 'SRC', label: 'readAll() → read()', killRate: 5 },
      { op: 'ROR', label: '== → !=', killRate: 0 },
    ],
    targeted: [
      { op: 'SDL', label: 'delete stream.close()', killRate: 78, targetKey: 'fdx.target.missing-cleanup' },
    ],
    correctTargetedIdx: 0,
    quizCorrect: 'missing-cleanup',
  },
  {
    id: 'unchecked-exception',
    titleKey: 'fdx.issue.unchecked-exception.title',
    descKey: 'fdx.issue.unchecked-exception.desc',
    code: `fun divideOrDefault(a: Int, b: Int, default: Int): Int {
    return try { a / b } catch (e: ArithmeticException) { default }
}`,
    blind: [
      { op: 'AOR', label: 'a / b → a * b', killRate: 40 },
      { op: 'SRC', label: 'default → 0', killRate: 25 },
    ],
    targeted: [
      { op: 'SDL', label: 'delete try/catch (unhandled exception)', killRate: 86, targetKey: 'fdx.target.unchecked-exception' },
    ],
    correctTargetedIdx: 0,
    quizCorrect: 'unchecked-exception',
  },
];

const state = {
  issueIdx: 0,
  selectedMutant: null,    // 'blind-i' | 'targeted-i'
  testDraft: '',
  quiz: { active: false, phase: 'idle', answer: '' },
  lab: { active: false, text: '' },
};

let root;

function avgKillRate(set) {
  if (set.length === 0) return 0;
  return Math.round(set.reduce((a, b) => a + b.killRate, 0) / set.length);
}

function renderMutantList(set, prefix, issue) {
  return set.map((m, i) => {
    const id = `${prefix}-${i}`;
    const correct = prefix === 'targeted' && i === issue.correctTargetedIdx;
    return `
      <button type="button"
        class="fdx-mutant-row${state.selectedMutant === id ? ' fdx-mutant--selected' : ''}${correct && state.selectedMutant === id ? ' fdx-mutant--correct' : ''}"
        data-mutant="${id}"
        data-testid="fdx-mutant-${id}"
      >
        <span class="fdx-mutant-op">${m.op}</span>
        <span class="fdx-mutant-label">${m.label}</span>
        <span class="fdx-mutant-kill">${m.killRate}%</span>
      </button>`;
  }).join('');
}

function renderIssue() {
  const issue = ISSUES[state.issueIdx];
  const blindAvg = avgKillRate(issue.blind);
  const targetedAvg = avgKillRate(issue.targeted);
  return `
    <div class="fdx-issue" data-testid="fdx-issue">
      <div class="fdx-issue-header">
        <h3>${t(issue.titleKey)}</h3>
        <span class="fdx-issue-counter">${state.issueIdx + 1} / ${ISSUES.length}</span>
      </div>
      <p class="fdx-issue-desc">${t(issue.descKey)}</p>
      <pre class="fdx-code">${issue.code}</pre>

      <div class="fdx-mutants-grid">
        <div class="fdx-mutants-col fdx-mutants-col--blind">
          <h4>${t('fdx.blind.title')} <span class="fdx-avg">${t('fdx.avg.kill', { pct: blindAvg })}</span></h4>
          <p class="fdx-col-note">${t('fdx.blind.note')}</p>
          <div class="fdx-mutant-list">
            ${renderMutantList(issue.blind, 'blind', issue)}
          </div>
        </div>
        <div class="fdx-mutants-col fdx-mutants-col--targeted">
          <h4>${t('fdx.targeted.title')} <span class="fdx-avg">${t('fdx.avg.kill', { pct: targetedAvg })}</span></h4>
          <p class="fdx-col-note">${t('fdx.targeted.note')}</p>
          <div class="fdx-mutant-list">
            ${renderMutantList(issue.targeted, 'targeted', issue)}
          </div>
        </div>
      </div>

      ${state.selectedMutant ? renderSelectedFeedback(issue) : ''}

      <div class="fdx-test-draft">
        <label for="fdx-test-input">${t('fdx.test.prompt')}</label>
        <textarea id="fdx-test-input" class="fdx-test-textarea" data-testid="fdx-test-draft"
          rows="4" placeholder="${t('fdx.test.placeholder')}">${state.testDraft}</textarea>
      </div>

      <div class="fdx-nav-row">
        <button type="button" class="fdx-nav-btn" data-testid="fdx-prev"
          ${state.issueIdx === 0 ? 'disabled' : ''}>← ${t('emx.nav.prev')}</button>
        <button type="button" class="fdx-nav-btn" data-testid="fdx-next"
          ${state.issueIdx === ISSUES.length - 1 ? 'disabled' : ''}>${t('emx.nav.next')} →</button>
      </div>
    </div>`;
}

function renderSelectedFeedback(issue) {
  const [prefix, idxStr] = state.selectedMutant.split('-');
  const idx = parseInt(idxStr, 10);
  if (prefix === 'targeted' && idx === issue.correctTargetedIdx) {
    const m = issue.targeted[idx];
    return `
      <div class="fdx-feedback fdx-feedback--right" data-testid="fdx-feedback">
        <strong>${t('fdx.feedback.right')}</strong>
        <p>${t(m.targetKey)}</p>
      </div>`;
  }
  if (prefix === 'targeted') {
    return `
      <div class="fdx-feedback fdx-feedback--partial" data-testid="fdx-feedback">
        <strong>${t('fdx.feedback.partial')}</strong>
        <p>${t('fdx.feedback.partial.desc')}</p>
      </div>`;
  }
  return `
    <div class="fdx-feedback fdx-feedback--wrong" data-testid="fdx-feedback">
      <strong>${t('fdx.feedback.wrong')}</strong>
      <p>${t('fdx.feedback.wrong.desc')}</p>
    </div>`;
}

function renderInsight() {
  return `
    <div class="fdx-insight" data-testid="fdx-insight">
      <h3>${t('fdx.insight.title')}</h3>
      <div class="fdx-insight-grid">
        <div class="fdx-insight-col">
          <h4>${t('fdx.insight.coverage.title')}</h4>
          <p>${t('fdx.insight.coverage.desc')}</p>
        </div>
        <div class="fdx-insight-col">
          <h4>${t('fdx.insight.spec.title')}</h4>
          <p>${t('fdx.insight.spec.desc')}</p>
        </div>
      </div>
      <p class="fdx-insight-source">${t('fdx.insight.source')}</p>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="fdx-quiz-start" data-testid="fdx-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'a';
    return `<div class="fdx-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="fdx-quiz-result">
      <p>${correct ? t('fdx.quiz.correct') : t('fdx.quiz.wrong')}</p>
    </div>`;
  }
  return `
    <div class="fdx-quiz" data-testid="fdx-quiz">
      <p class="fdx-quiz-prompt">${t('fdx.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="fdx-quiz-option">
          <input type="radio" name="fdx-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('fdx.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="fdx-quiz-submit" data-testid="fdx-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="fdx-lab-start" data-testid="fdx-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="fdx-lab" data-testid="fdx-lab">
      <p class="fdx-lab-prompt">${t('fdx.lab.prompt')}</p>
      <textarea class="fdx-lab-textarea" data-testid="fdx-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="fdx-wrap" data-testid="fdx-wrap">
      <div class="emx-paper-cite" data-testid="fdx-paper-cite">
        <div class="emx-paper-header">
          <span class="emx-paper-badge">arXiv</span>
          <a class="emx-paper-link" href="https://arxiv.org/abs/2501.12862" target="_blank" rel="noopener noreferrer">
            Mutation-Guided LLM-based Test Generation at Meta
          </a>
          <span class="emx-paper-venue">FSE 2025 · arXiv:2501.12862</span>
        </div>
      </div>
      <h2 class="fdx-title">${t('fdx.title')}</h2>
      <p class="fdx-desc">${t('fdx.desc')}</p>
      ${renderIssue()}
      ${renderInsight()}
      <section class="fdx-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-mutant]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedMutant = btn.dataset.mutant;
      render();
    });
  });
  root.querySelector('[data-testid="fdx-prev"]')?.addEventListener('click', () => {
    if (state.issueIdx > 0) {
      state.issueIdx--;
      state.selectedMutant = null;
      state.testDraft = '';
      render();
    }
  });
  root.querySelector('[data-testid="fdx-next"]')?.addEventListener('click', () => {
    if (state.issueIdx < ISSUES.length - 1) {
      state.issueIdx++;
      state.selectedMutant = null;
      state.testDraft = '';
      render();
    }
  });
  root.querySelector('[data-testid="fdx-test-draft"]')?.addEventListener('input', (e) => {
    state.testDraft = e.target.value;
  });
  root.querySelector('[data-testid="fdx-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="fdx-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="fdx-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="fdx-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="fdx-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createFaultDirectedTestingExplorer() {
  state.issueIdx = 0;
  state.selectedMutant = null;
  state.testDraft = '';
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}
