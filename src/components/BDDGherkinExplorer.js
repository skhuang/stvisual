import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';

// Three preset feature files; tiny on purpose so students can read end-to-end.
const PRESETS = [
  {
    id: 'login',
    titleKey: 'bdd.preset.login',
    text: `Feature: User login
  Authenticated users see their dashboard; invalid credentials are rejected.

  Scenario: Valid credentials
    Given I am on the login page
    When I sign in as "alice" with password "secret"
    Then I see the "Welcome, alice" greeting

  Scenario: Invalid password
    Given I am on the login page
    When I sign in as "alice" with password "wrong"
    Then I see the "Invalid credentials" error`,
  },
  {
    id: 'discount',
    titleKey: 'bdd.preset.discount',
    text: `Feature: Checkout discount

  Scenario Outline: Apply percentage discount
    Given a cart subtotal of <subtotal>
    When the customer enters discount code "<code>"
    Then the displayed total is <total>

    Examples:
      | subtotal | code    | total |
      | 100      | TEN     | 90    |
      | 200      | TEN     | 180   |
      | 100      | TWENTY  | 80    |
      | 100      | NONE    | 100   |
      | 50       | TWENTY  | 40    |`,
  },
  {
    id: 'cart',
    titleKey: 'bdd.preset.cart',
    text: `Feature: Shopping cart
  Background:
    Given an empty cart

  Scenario: Add a single item
    When I add the "Notebook" item with quantity 1
    Then the cart total is 1

  Scenario: Add multiple items
    When I add the "Notebook" item with quantity 2
    And I add the "Pen" item with quantity 3
    Then the cart total is 5`,
  },
];

// Step definitions: regex + label. Anything that doesn't match goes red.
const STEP_DEFINITIONS = [
  { re: /^I am on the .+ page$/,                                   labelKey: 'bdd.step.def.onPage' },
  { re: /^I sign in as "[^"]+" with password "[^"]+"$/,            labelKey: 'bdd.step.def.signIn' },
  { re: /^I see the "[^"]+" (greeting|error)$/,                    labelKey: 'bdd.step.def.seeMessage' },
  { re: /^a cart subtotal of \S+$/,                                labelKey: 'bdd.step.def.subtotal' },
  { re: /^the customer enters discount code "[^"]+"$/,             labelKey: 'bdd.step.def.enterCode' },
  { re: /^the displayed total is \S+$/,                            labelKey: 'bdd.step.def.totalIs' },
  { re: /^an empty cart$/,                                         labelKey: 'bdd.step.def.emptyCart' },
  { re: /^I add the "[^"]+" item with quantity \d+$/,              labelKey: 'bdd.step.def.addItem' },
  { re: /^the cart total is \d+$/,                                 labelKey: 'bdd.step.def.cartTotal' },
];

// Minimal Gherkin parser. Returns:
// { feature: string, description: string, background: [steps], scenarios: [{ title, kind, steps, examples? }] }
export function parseGherkin(text) {
  const lines = text.split('\n');
  const out = { feature: '', description: '', background: [], scenarios: [] };
  let mode = 'feature';      // feature | background | scenario | outline | examples
  let current = null;
  let exampleHeader = null;

  function pushCurrent() {
    if (current) out.scenarios.push(current);
    current = null;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (/^Feature:/i.test(line)) {
      out.feature = line.replace(/^Feature:\s*/i, '');
      mode = 'feature';
      continue;
    }
    if (/^Background:/i.test(line)) {
      pushCurrent();
      mode = 'background';
      continue;
    }
    if (/^Scenario Outline:/i.test(line)) {
      pushCurrent();
      current = {
        title: line.replace(/^Scenario Outline:\s*/i, ''),
        kind: 'outline', steps: [], examples: { header: [], rows: [] },
      };
      mode = 'outline';
      continue;
    }
    if (/^Scenario:/i.test(line)) {
      pushCurrent();
      current = { title: line.replace(/^Scenario:\s*/i, ''), kind: 'scenario', steps: [] };
      mode = 'scenario';
      continue;
    }
    if (/^Examples:/i.test(line)) {
      mode = 'examples';
      exampleHeader = null;
      continue;
    }
    if (/^(Given|When|Then|And|But) /.test(line)) {
      const [, keyword] = line.match(/^(\S+) /);
      const body = line.slice(keyword.length + 1);
      const step = { keyword, body };
      if (mode === 'background') out.background.push(step);
      else if (current) current.steps.push(step);
      continue;
    }
    if (mode === 'examples' && /^\|/.test(line)) {
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      if (!exampleHeader) {
        exampleHeader = cells;
        if (current?.examples) current.examples.header = cells;
      } else {
        if (current?.examples) current.examples.rows.push(cells);
      }
      continue;
    }
    if (mode === 'feature' && !out.description) {
      out.description = line;
    }
  }
  pushCurrent();
  return out;
}

// Expand `<placeholder>` tokens in an outline step body against an example row.
function substitute(body, header, row) {
  let out = body;
  for (let i = 0; i < header.length; i++) {
    out = out.replaceAll(`<${header[i]}>`, row[i] ?? '');
  }
  return out;
}

// Test cases derived from scenarios: 1 per Scenario, N per Scenario Outline.
export function deriveTestCases(parsed) {
  const cases = [];
  for (const sc of parsed.scenarios) {
    if (sc.kind === 'scenario') {
      cases.push({ title: sc.title, source: 'scenario', steps: [...parsed.background, ...sc.steps] });
    } else {
      const { header, rows } = sc.examples;
      rows.forEach((row, i) => {
        const steps = sc.steps.map((s) => ({ ...s, body: substitute(s.body, header, row) }));
        cases.push({
          title: `${sc.title} [#${i + 1}]`,
          source: 'outline',
          steps: [...parsed.background, ...steps],
          row,
        });
      });
    }
  }
  return cases;
}

export function isStepBound(body) {
  return STEP_DEFINITIONS.some(({ re }) => re.test(body));
}

// ── State ────────────────────────────────────────────────────────────

const state = {
  presetIdx: 0,
  quiz: { active: false, phase: 'idle', answer: '' },
  lab:  { active: false, text: '' },
};

let root;

function renderFeaturePane() {
  const text = PRESETS[state.presetIdx].text;
  return `
    <div class="bdd-feature-pane" data-testid="bdd-feature-pane">
      <h3>${t('bdd.feature.title')}</h3>
      <pre class="bdd-feature-pre">${text.replace(/</g, '&lt;')}</pre>
    </div>`;
}

function renderStepDefs(parsed) {
  // De-dupe by `body` so the same step that appears in multiple scenarios is
  // listed once.
  const allSteps = [
    ...parsed.background,
    ...parsed.scenarios.flatMap((s) => s.steps),
  ];
  const seen = new Set();
  const items = allSteps.filter((s) => {
    if (seen.has(s.body)) return false;
    seen.add(s.body);
    return true;
  });
  return `
    <div class="bdd-stepdefs" data-testid="bdd-stepdefs">
      <h3>${t('bdd.stepdefs.title')}</h3>
      <ul class="bdd-stepdefs__list">
        ${items.map((s) => {
          const bound = isStepBound(s.body);
          return `
            <li class="bdd-stepdef ${bound ? 'bdd-stepdef--bound' : 'bdd-stepdef--unbound'}"
                data-testid="bdd-step-${bound ? 'bound' : 'unbound'}">
              <span class="bdd-stepdef__keyword">${s.keyword}</span>
              <span class="bdd-stepdef__body">${s.body.replace(/</g, '&lt;')}</span>
              <span class="bdd-stepdef__status">${bound ? '✓' : '✗'}</span>
            </li>`;
        }).join('')}
      </ul>
      <p class="bdd-stepdefs__legend">${t('bdd.stepdefs.legend')}</p>
    </div>`;
}

function renderTestCases(parsed) {
  const cases = deriveTestCases(parsed);
  const outlineScenario = parsed.scenarios.find((s) => s.kind === 'outline');
  return `
    <div class="bdd-cases" data-testid="bdd-cases">
      <h3>${t('bdd.cases.title', { n: cases.length })}</h3>
      ${outlineScenario ? renderExamples(outlineScenario) : ''}
      <ol class="bdd-cases__list">
        ${cases.map((c) => `
          <li class="bdd-case bdd-case--${c.source}">
            <p class="bdd-case__title">${c.title}</p>
            <ul class="bdd-case__steps">
              ${c.steps.map((s) => `
                <li>
                  <span class="bdd-case__kw">${s.keyword}</span>
                  ${s.body.replace(/</g, '&lt;')}
                </li>`).join('')}
            </ul>
          </li>`).join('')}
      </ol>
    </div>`;
}

function renderExamples(outline) {
  const { header, rows } = outline.examples;
  return `
    <div class="bdd-examples" data-testid="bdd-examples">
      <div class="bdd-examples__header">
        <strong>${t('bdd.examples.title', { n: rows.length })}</strong>
        <button type="button" class="bdd-examples__bridge"
          data-testid="bdd-bridge-decision-table"
          title="${t('bdd.bridge.dt.title')}">
          🔗 → ${t('section.blackbox')} · ${t('blackboxTab.dt')}
        </button>
      </div>
      <table class="bdd-examples__table">
        <thead>
          <tr>${header.map((h) => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="bdd-quiz-start" data-testid="bdd-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'b';
    const shareEncoded = encodeResult({
      v: 1, explorer: 'bdd', explorerLabel: t('bdd.title'),
      mode: 'quiz', ts: Date.now(), lang: getLocale(),
      score: correct ? 1 : 0, total: 1,
      items: [{
        q: t('bdd.quiz.prompt'),
        a: state.quiz.answer ? t('bdd.quiz.' + state.quiz.answer) : '',
        expected: t('bdd.quiz.b'),
        ok: correct,
      }],
    });
    return `<div class="bdd-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="bdd-quiz-result">
      <p>${correct ? t('bdd.quiz.correct') : t('bdd.quiz.wrong')}</p>
      <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="bdd-quiz-share">📋 ${t('quiz.share.btn')}</button>
    </div>`;
  }
  return `
    <div class="bdd-quiz" data-testid="bdd-quiz">
      <p class="bdd-quiz-prompt">${t('bdd.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="bdd-quiz-option">
          <input type="radio" name="bdd-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('bdd.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="bdd-quiz-submit" data-testid="bdd-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="bdd-lab-start" data-testid="bdd-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="bdd-lab" data-testid="bdd-lab">
      <p class="bdd-lab-prompt">${t('bdd.lab.prompt')}</p>
      <textarea class="bdd-lab-textarea" data-testid="bdd-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  const parsed = parseGherkin(PRESETS[state.presetIdx].text);
  root.innerHTML = `
    <div class="bdd-wrap" data-testid="bdd-wrap">
      <h2 class="bdd-title">${t('bdd.title')}</h2>
      <p class="bdd-desc">${t('bdd.desc')}</p>

      <div class="bdd-presets" data-testid="bdd-presets">
        ${PRESETS.map((p, i) => `
          <button type="button"
            class="bdd-preset-chip${i === state.presetIdx ? ' bdd-preset-chip--active' : ''}"
            data-preset="${i}"
            data-testid="bdd-preset-${p.id}">${t(p.titleKey)}</button>`).join('')}
      </div>

      ${renderFeaturePane()}

      <div class="bdd-two-col">
        ${renderStepDefs(parsed)}
        ${renderTestCases(parsed)}
      </div>

      <section class="bdd-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.presetIdx = Number(btn.dataset.preset);
      render();
    });
  });
  root.querySelector('[data-testid="bdd-bridge-decision-table"]')?.addEventListener('click', () => {
    // Switch the section via the nav button (setActiveSection + scroll),
    // then click the inner Decision-Table tab.
    document.querySelector('[data-section="blackbox"]')?.click();
    document.querySelector('[data-blackbox-tab="dt"]')?.click();
  });
  root.querySelector('[data-testid="bdd-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="bdd-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="bdd-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="bdd-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="bdd-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createBDDGherkinExplorer() {
  state.presetIdx = 0;
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab  = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}
