# TDD Visualization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `tdd` course section with two Explorers teaching Test-Driven Development — a kata-replay cycle explorer and a rule-enforced red-green-refactor state machine.

**Architecture:** A pure `tddRules.js` state machine backs the `rules` tab. Authored TDD katas in `tddKatas.js` (no interpreter, the app's standard authored-data idiom) back the `cycle` tab. Two Explorer components follow the established factory idiom; a new `tdd` section is wired exactly like the `slicing` section.

**Tech Stack:** Vanilla ES-module JS; Vitest + jsdom; Marp slide decks.

**Branch:** `feat/tdd-visualization` (created; design spec already committed).

**Spec:** `docs/superpowers/specs/2026-05-19-tdd-visualization-design.md`

---

## File Structure

| File | Responsibility | Change |
| --- | --- | --- |
| `src/utils/tddRules.js` | Pure red-green-refactor rules engine | Create |
| `src/data/tddKatas.js` | The authored TDD katas | Create |
| `src/components/TddCycleExplorer.js` (+ `.css`) | The `cycle` tab | Create |
| `src/components/TddRulesExplorer.js` (+ `.css`) | The `rules` tab | Create |
| `src/app.js`, `src/utils/urlRouter.js`, `src/data/explorerTags.js`, `src/i18n/dict.js`, `src/styles.css` | Wiring | Modify |
| `docs/slides/62-test-driven-development.{en,zh-TW}.md` | Deck #62 | Create |
| `scripts/build-slide-decks.mjs`, `src/data/slideDecks.generated.js` | Register deck | Modify |
| `src/tests/tddRules.test.js`, `tddKatas.test.js`, `TddCycleExplorer.test.jsx`, `TddRulesExplorer.test.jsx` | Tests | Create |
| `src/tests/urlRouter.test.js`, `slideDecks.test.js` | Extend | Modify |
| `Plan.md` | New §O | Modify |

---

## Task 1: The `tddRules` engine

**Files:**
- Create: `src/utils/tddRules.js`
- Test: `src/tests/tddRules.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/tests/tddRules.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { initialTddState, legalActions, applyAction } from '../utils/tddRules.js';

describe('tddRules', () => {
  it('starts in the start phase with no failing test', () => {
    const s = initialTddState();
    expect(s.phase).toBe('start');
    expect(s.hasFailingTest).toBe(false);
    expect(s.allGreen).toBe(true);
    expect(s.cycleCount).toBe(0);
  });

  it('only allows writing a failing test from the start', () => {
    expect([...legalActions(initialTddState())]).toEqual(['write-failing-test']);
  });

  it('write-failing-test goes RED', () => {
    const { state, blocked } = applyAction(initialTddState(), 'write-failing-test');
    expect(blocked).toBe(false);
    expect(state.phase).toBe('red');
    expect(state.hasFailingTest).toBe(true);
    expect(state.allGreen).toBe(false);
  });

  it('blocks production code when no test is failing', () => {
    const r = applyAction(initialTddState(), 'write-production-code');
    expect(r.blocked).toBe(true);
    expect(r.reasonKey).toBe('tdd.rules.reason.noRed');
    expect(r.state).toEqual(initialTddState());
  });

  it('blocks a second failing test while one is still red', () => {
    const red = applyAction(initialTddState(), 'write-failing-test').state;
    const r = applyAction(red, 'write-failing-test');
    expect(r.blocked).toBe(true);
    expect(r.reasonKey).toBe('tdd.rules.reason.alreadyRed');
  });

  it('write-production-code goes GREEN and counts a cycle', () => {
    const red = applyAction(initialTddState(), 'write-failing-test').state;
    const { state, blocked } = applyAction(red, 'write-production-code');
    expect(blocked).toBe(false);
    expect(state.phase).toBe('green');
    expect(state.hasFailingTest).toBe(false);
    expect(state.allGreen).toBe(true);
    expect(state.cycleCount).toBe(1);
  });

  it('blocks refactor while a test is failing', () => {
    const red = applyAction(initialTddState(), 'write-failing-test').state;
    const r = applyAction(red, 'refactor');
    expect(r.blocked).toBe(true);
    expect(r.reasonKey).toBe('tdd.rules.reason.notGreen');
  });

  it('blocks refactor at the very start (nothing built yet)', () => {
    const r = applyAction(initialTddState(), 'refactor');
    expect(r.blocked).toBe(true);
    expect(r.reasonKey).toBe('tdd.rules.reason.nothingYet');
  });

  it('allows refactor once green', () => {
    let s = applyAction(initialTddState(), 'write-failing-test').state;
    s = applyAction(s, 'write-production-code').state;
    const { state, blocked } = applyAction(s, 'refactor');
    expect(blocked).toBe(false);
    expect(state.phase).toBe('refactor');
  });

  it('an unknown action is blocked without changing state', () => {
    const r = applyAction(initialTddState(), 'nope');
    expect(r.blocked).toBe(true);
    expect(r.reasonKey).toBe('tdd.rules.reason.unknown');
    expect(r.state).toEqual(initialTddState());
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/tddRules.test.js`
Expected: FAIL — `../utils/tddRules.js` does not exist.

- [ ] **Step 3: Implement `src/utils/tddRules.js`**

Create `src/utils/tddRules.js`:

```js
// Pure red-green-refactor state machine for Test-Driven Development.
// State: { phase, hasFailingTest, allGreen, cycleCount }.
//   phase          — 'start' | 'red' | 'green' | 'refactor'
//   hasFailingTest — a written test is not yet passing
//   allGreen       — every written test passes (vacuously true at start)
//   cycleCount     — completed red->green cycles
// No DOM, no app state. The Explorer resolves `reasonKey` with t().

const ACTIONS = ['write-failing-test', 'write-production-code', 'refactor'];

// The initial TDD state.
export function initialTddState() {
  return { phase: 'start', hasFailingTest: false, allGreen: true, cycleCount: 0 };
}

// Is `action` a TDD-legal move from `state`?
function isLegal(state, action) {
  if (action === 'write-failing-test') return !state.hasFailingTest;
  if (action === 'write-production-code') return state.hasFailingTest;
  if (action === 'refactor') {
    return state.allGreen && !state.hasFailingTest && state.cycleCount > 0;
  }
  return false;
}

// The TDD-legal actions from `state`, as a Set of action ids.
export function legalActions(state) {
  return new Set(ACTIONS.filter((a) => isLegal(state, a)));
}

// The i18n reason key for why `action` is illegal from `state`.
function reasonKey(state, action) {
  if (action === 'write-failing-test') return 'tdd.rules.reason.alreadyRed';
  if (action === 'write-production-code') return 'tdd.rules.reason.noRed';
  // refactor
  if (state.hasFailingTest) return 'tdd.rules.reason.notGreen';
  return 'tdd.rules.reason.nothingYet';
}

// Apply `action`. Legal -> { state: <next>, blocked: false }.
// Illegal -> { state: <unchanged>, blocked: true, reasonKey }.
export function applyAction(state, action) {
  if (!ACTIONS.includes(action)) {
    return { state, blocked: true, reasonKey: 'tdd.rules.reason.unknown' };
  }
  if (!isLegal(state, action)) {
    return { state, blocked: true, reasonKey: reasonKey(state, action) };
  }
  if (action === 'write-failing-test') {
    return {
      state: { ...state, phase: 'red', hasFailingTest: true, allGreen: false },
      blocked: false,
    };
  }
  if (action === 'write-production-code') {
    return {
      state: {
        ...state, phase: 'green', hasFailingTest: false, allGreen: true,
        cycleCount: state.cycleCount + 1,
      },
      blocked: false,
    };
  }
  // refactor
  return { state: { ...state, phase: 'refactor' }, blocked: false };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/tddRules.test.js`
Expected: PASS — all 10 tests.

- [ ] **Step 5: Run the full suite, then commit**

Run: `npx vitest run` — expect green, no regressions.

```bash
git add src/utils/tddRules.js src/tests/tddRules.test.js
git commit -m "$(cat <<'EOF'
feat(tdd): red-green-refactor rules engine

Pure state machine: legalActions / applyAction enforce the TDD
discipline — no production code without a failing test, refactor
only on green — returning an i18n reason key for blocked moves.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: The `tddKatas` data

**Files:**
- Create: `src/data/tddKatas.js`
- Test: `src/tests/tddKatas.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/tests/tddKatas.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { TDD_KATAS } from '../data/tddKatas.js';

describe('TDD_KATAS', () => {
  it('ships at least two katas, each with an id, titleKey and steps', () => {
    expect(TDD_KATAS.length).toBeGreaterThanOrEqual(2);
    for (const k of TDD_KATAS) {
      expect(typeof k.id).toBe('string');
      expect(typeof k.titleKey).toBe('string');
      expect(Array.isArray(k.steps)).toBe(true);
      expect(k.steps.length).toBeGreaterThan(0);
    }
  });

  it('every kata starts on a red step', () => {
    for (const k of TDD_KATAS) expect(k.steps[0].phase).toBe('red');
  });

  it('every step has a valid phase, testList, code, suite and noteKey', () => {
    for (const k of TDD_KATAS) {
      for (const s of k.steps) {
        expect(['red', 'green', 'refactor']).toContain(s.phase);
        expect(Array.isArray(s.testList)).toBe(true);
        expect(typeof s.code).toBe('string');
        expect(typeof s.suite.passing).toBe('number');
        expect(typeof s.suite.failing).toBe('number');
        expect(typeof s.noteKey).toBe('string');
        for (const t of s.testList) {
          expect(['todo', 'red', 'green']).toContain(t.status);
        }
      }
    }
  });

  it('a green step always follows a red step', () => {
    for (const k of TDD_KATAS) {
      k.steps.forEach((s, i) => {
        if (s.phase === 'green') expect(k.steps[i - 1]?.phase).toBe('red');
      });
    }
  });

  it('refactor steps have no failing tests', () => {
    for (const k of TDD_KATAS) {
      for (const s of k.steps) {
        if (s.phase === 'refactor') expect(s.suite.failing).toBe(0);
      }
    }
  });

  it("each step's suite counts match its testList statuses", () => {
    for (const k of TDD_KATAS) {
      for (const s of k.steps) {
        const red = s.testList.filter((t) => t.status === 'red').length;
        const green = s.testList.filter((t) => t.status === 'green').length;
        expect(s.suite.failing).toBe(red);
        expect(s.suite.passing).toBe(green);
      }
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/tddKatas.test.js`
Expected: FAIL — `../data/tddKatas.js` does not exist.

- [ ] **Step 3: Implement `src/data/tddKatas.js`**

Create `src/data/tddKatas.js`. It exports `TDD_KATAS`, an array of two katas. Each step is the full snapshot **after** that step: `phase` (`'red'`/`'green'`/`'refactor'`), `testList` (every test known so far, each `{ name, status }` with status `'todo'`/`'red'`/`'green'`), `code` (production code so far), `suite` (`{ passing, failing }`), `noteKey` (an i18n key for a one-line rationale).

Use this exact file for the **FizzBuzz** kata (the reference shape) and author the **Stack** kata to the outline that follows it:

```js
// Authored TDD sessions for the TDD Cycle Explorer. Each step is the full
// snapshot AFTER that step. No interpreter — hand-authored, the same idiom
// as src/data/slicingExamples.js. tddKatas.test.js enforces the invariants.

const FIZZBUZZ = {
  id: 'fizzbuzz',
  titleKey: 'tdd.kata.fizzbuzz',
  steps: [
    {
      phase: 'red',
      testList: [{ name: 'fizzbuzz(1) === "1"', status: 'red' }],
      code: '',
      suite: { passing: 0, failing: 1 },
      noteKey: 'tdd.kata.fizzbuzz.s1',
    },
    {
      phase: 'green',
      testList: [{ name: 'fizzbuzz(1) === "1"', status: 'green' }],
      code: 'function fizzbuzz(n) {\n  return "1";\n}',
      suite: { passing: 1, failing: 0 },
      noteKey: 'tdd.kata.fizzbuzz.s2',
    },
    {
      phase: 'red',
      testList: [
        { name: 'fizzbuzz(1) === "1"', status: 'green' },
        { name: 'fizzbuzz(3) === "Fizz"', status: 'red' },
      ],
      code: 'function fizzbuzz(n) {\n  return "1";\n}',
      suite: { passing: 1, failing: 1 },
      noteKey: 'tdd.kata.fizzbuzz.s3',
    },
    {
      phase: 'green',
      testList: [
        { name: 'fizzbuzz(1) === "1"', status: 'green' },
        { name: 'fizzbuzz(3) === "Fizz"', status: 'green' },
      ],
      code: 'function fizzbuzz(n) {\n  if (n % 3 === 0) return "Fizz";\n  return String(n);\n}',
      suite: { passing: 2, failing: 0 },
      noteKey: 'tdd.kata.fizzbuzz.s4',
    },
    {
      phase: 'red',
      testList: [
        { name: 'fizzbuzz(1) === "1"', status: 'green' },
        { name: 'fizzbuzz(3) === "Fizz"', status: 'green' },
        { name: 'fizzbuzz(5) === "Buzz"', status: 'red' },
      ],
      code: 'function fizzbuzz(n) {\n  if (n % 3 === 0) return "Fizz";\n  return String(n);\n}',
      suite: { passing: 2, failing: 1 },
      noteKey: 'tdd.kata.fizzbuzz.s5',
    },
    {
      phase: 'green',
      testList: [
        { name: 'fizzbuzz(1) === "1"', status: 'green' },
        { name: 'fizzbuzz(3) === "Fizz"', status: 'green' },
        { name: 'fizzbuzz(5) === "Buzz"', status: 'green' },
      ],
      code: 'function fizzbuzz(n) {\n  if (n % 3 === 0) return "Fizz";\n  if (n % 5 === 0) return "Buzz";\n  return String(n);\n}',
      suite: { passing: 3, failing: 0 },
      noteKey: 'tdd.kata.fizzbuzz.s6',
    },
    {
      phase: 'red',
      testList: [
        { name: 'fizzbuzz(1) === "1"', status: 'green' },
        { name: 'fizzbuzz(3) === "Fizz"', status: 'green' },
        { name: 'fizzbuzz(5) === "Buzz"', status: 'green' },
        { name: 'fizzbuzz(15) === "FizzBuzz"', status: 'red' },
      ],
      code: 'function fizzbuzz(n) {\n  if (n % 3 === 0) return "Fizz";\n  if (n % 5 === 0) return "Buzz";\n  return String(n);\n}',
      suite: { passing: 3, failing: 1 },
      noteKey: 'tdd.kata.fizzbuzz.s7',
    },
    {
      phase: 'green',
      testList: [
        { name: 'fizzbuzz(1) === "1"', status: 'green' },
        { name: 'fizzbuzz(3) === "Fizz"', status: 'green' },
        { name: 'fizzbuzz(5) === "Buzz"', status: 'green' },
        { name: 'fizzbuzz(15) === "FizzBuzz"', status: 'green' },
      ],
      code: 'function fizzbuzz(n) {\n  if (n % 15 === 0) return "FizzBuzz";\n  if (n % 3 === 0) return "Fizz";\n  if (n % 5 === 0) return "Buzz";\n  return String(n);\n}',
      suite: { passing: 4, failing: 0 },
      noteKey: 'tdd.kata.fizzbuzz.s8',
    },
    {
      phase: 'refactor',
      testList: [
        { name: 'fizzbuzz(1) === "1"', status: 'green' },
        { name: 'fizzbuzz(3) === "Fizz"', status: 'green' },
        { name: 'fizzbuzz(5) === "Buzz"', status: 'green' },
        { name: 'fizzbuzz(15) === "FizzBuzz"', status: 'green' },
      ],
      code: 'function fizzbuzz(n) {\n  const fizz = n % 3 === 0 ? "Fizz" : "";\n  const buzz = n % 5 === 0 ? "Buzz" : "";\n  return (fizz + buzz) || String(n);\n}',
      suite: { passing: 4, failing: 0 },
      noteKey: 'tdd.kata.fizzbuzz.s9',
    },
  ],
};

const STACK = {
  id: 'stack',
  titleKey: 'tdd.kata.stack',
  steps: [ /* see the Stack outline below — author 7 steps in the same shape */ ],
};

export const TDD_KATAS = [FIZZBUZZ, STACK];
```

Author the **Stack** kata's 7 steps in the identical step shape. The Stack is a
`class Stack` with `isEmpty()`, `push(x)`, `pop()`. Steps (each step's `code` is
the full class after that step; `suite` counts must equal the red/green tallies
in `testList`; `noteKey` is `tdd.kata.stack.s1` … `s7`):

1. **red** — test `new Stack().isEmpty() === true`. `testList`: that one test
   `red`. `code: ''`. `suite {0,1}`.
2. **green** — fake it: `class Stack {\n  isEmpty() {\n    return true;\n  }\n}`.
   test 1 `green`. `suite {1,0}`.
3. **red** — add test `after push(1), isEmpty() === false`. test 1 `green`,
   test 2 `red`. `code` unchanged from step 2. `suite {1,1}`.
4. **green** — real state: `class Stack {\n  constructor() {\n    this.items = [];\n  }\n  push(x) {\n    this.items.push(x);\n  }\n  isEmpty() {\n    return this.items.length === 0;\n  }\n}`.
   tests 1–2 `green`. `suite {2,0}`.
5. **red** — add test `push(1) then pop() === 1`. tests 1–2 `green`, test 3
   `red`. `code` unchanged from step 4. `suite {2,1}`.
6. **green** — add `pop() {\n    return this.items.pop();\n  }` to the class.
   tests 1–3 `green`. `suite {3,0}`.
7. **refactor** — introduce a `size()` helper and express `isEmpty()` through
   it: the class keeps `constructor`, `push`, `pop`, adds `size() {\n    return this.items.length;\n  }`, and `isEmpty()` becomes `return this.size() === 0;`.
   tests 1–3 stay `green`. `suite {3,0}`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/tddKatas.test.js`
Expected: PASS — all 6 invariant tests, both katas.

- [ ] **Step 5: Run the full suite, then commit**

Run: `npx vitest run` — expect green.

```bash
git add src/data/tddKatas.js src/tests/tddKatas.test.js
git commit -m "$(cat <<'EOF'
feat(tdd): authored FizzBuzz and Stack TDD katas

Each kata is an ordered list of red/green/refactor step snapshots —
test list, production code, and suite status — for the Cycle Explorer.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: The Cycle Explorer — `TddCycleExplorer`

**Files:**
- Create: `src/components/TddCycleExplorer.js`, `src/components/TddCycleExplorer.css`
- Test: `src/tests/TddCycleExplorer.test.jsx`

Build by mirroring `src/components/SliceRegressionExplorer.js` and its `.css` —
read both as the structural template (module-level `state` reset in the
factory, `render()` setting `root.innerHTML` then `bindEvents()`, the chip bar,
the quiz panel, `onLocaleChange` re-render).

- [ ] **Step 1: Write the failing test**

Create `src/tests/TddCycleExplorer.test.jsx`:

```js
import { describe, expect, it, beforeEach } from 'vitest';
import { createTddCycleExplorer } from '../components/TddCycleExplorer.js';

describe('TddCycleExplorer', () => {
  let root;
  beforeEach(() => {
    root = createTddCycleExplorer();
    document.body.appendChild(root);
  });

  it('renders with the root testid and kata chips', () => {
    expect(root.dataset.testid).toBe('tdd-cycle-explorer');
    expect(root.querySelector('[data-testid="tdd-kata-fizzbuzz"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="tdd-kata-stack"]')).toBeTruthy();
  });

  it('shows the test list, code and suite panels', () => {
    expect(root.querySelector('[data-testid="tdd-test-list"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="tdd-code"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="tdd-suite"]')).toBeTruthy();
  });

  it('advancing a step changes the suite panel', () => {
    root.querySelector('[data-testid="tdd-kata-fizzbuzz"]').click();
    const before = root.querySelector('[data-testid="tdd-suite"]').textContent;
    root.querySelector('[data-testid="tdd-next-step"]').click();
    const after = root.querySelector('[data-testid="tdd-suite"]').textContent;
    expect(after).not.toEqual(before);
  });

  it('predict mode reveals a correct/incorrect marker after a guess', () => {
    root.querySelector('[data-testid="tdd-kata-fizzbuzz"]').click();
    // predict mode is on by default; step 1 is red, step 2 is green
    root.querySelector('[data-testid="tdd-predict-green"]').click();
    root.querySelector('[data-testid="tdd-next-step"]').click();
    expect(root.querySelector('[data-testid="tdd-predict-result"]')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/TddCycleExplorer.test.jsx`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement `TddCycleExplorer.js` + `.css`**

`createTddCycleExplorer()` returns a root `<div>` with `dataset.testid = 'tdd-cycle-explorer'`. Behaviour:

- **Imports:** `t`, `onLocaleChange` from `../i18n/index.js`; `TDD_KATAS` from `../data/tddKatas.js`.
- **State** (module-level, reset in the factory): `kataId` (default `TDD_KATAS[0].id`), `stepIndex` (default `0`), `predict` (default `true`), `prediction` (default `null`), `predictResult` (default `null` — `'correct'`/`'incorrect'` after a revealed guess), `quiz` (`{ active:false, phase:'idle', answer:'' }`).
- **Kata chips** — one per `TDD_KATAS`, `data-testid="tdd-kata-<id>"`. Selecting one sets `kataId`, resets `stepIndex` to 0, `prediction` and `predictResult` to null.
- **Current step** — `const kata = TDD_KATAS.find(k => k.id === state.kataId); const step = kata.steps[state.stepIndex];`.
- **Red-Green-Refactor ring** — three phase nodes, `data-testid="tdd-phase-red"` / `tdd-phase-green"` / `tdd-phase-refactor"`; the node matching `step.phase` carries an active class.
- **Three panels:**
  - **Test list** — `data-testid="tdd-test-list"`: each `step.testList` entry as a row showing its `name` and a status tone class for `todo`/`red`/`green`.
  - **Code** — `data-testid="tdd-code"`: `step.code` inside a `<pre>` (HTML-escaped).
  - **Suite bar** — `data-testid="tdd-suite"`: the `step.suite.passing` and `step.suite.failing` counts, with a green/red bar; its `textContent` must include the counts so a change is observable.
  - The step's `t(step.noteKey)` rationale is shown beneath.
- **Predict mode** — a toggle button `data-testid="tdd-predict-toggle"` flipping `state.predict`.
  - When `predict` is true and not on the last step: three predict buttons `data-testid="tdd-predict-red"` / `tdd-predict-green"` / `tdd-predict-refactor"` set `state.prediction`.
  - **Next step** (`data-testid="tdd-next-step"`): if `predict` is true and `state.prediction` is set, compare `state.prediction` to `kata.steps[stepIndex + 1].phase`, set `state.predictResult` to `'correct'`/`'incorrect'`, render a `data-testid="tdd-predict-result"` marker; then advance `stepIndex`, clear `prediction`. If `predict` is false, just advance. Disable `tdd-next-step` on the last step.
- **Reset** — `data-testid="tdd-reset"`: `stepIndex` to 0, `prediction`/`predictResult` to null. A step counter shows `stepIndex+1 / kata.steps.length`.
- **Quiz** — one multiple-choice question mirroring `SliceRegressionExplorer`'s quiz panel, `data-testid` `tdd-cycle-quiz-start` / `tdd-cycle-quiz-submit` / `tdd-cycle-quiz-close` / `tdd-cycle-quiz-result`; correct-answer key `'c'`.
- Re-render on `onLocaleChange`. All user-facing strings via `t()` — it is fine that `tdd.*` keys are not yet in `dict.js` (Task 5 adds them); `t()` falls back to the key string so tests pass.
- `TddCycleExplorer.css` — reuse the class idiom of `SliceRegressionExplorer.css` (use a `tdc-*` namespace). Style the three-panel layout, the red/green/refactor ring, the suite bar, and red/green/todo test-row tones.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/TddCycleExplorer.test.jsx`
Expected: PASS — all 4 tests.

- [ ] **Step 5: Run the full suite — note the expected explorerTags gap**

Run: `npx vitest run`
`explorerTags.test.js` will fail ONLY because `TddCycleExplorer` has no tag entry yet — that is Task 5's job. Report it; do NOT add the entry here, do NOT weaken the test. Everything else must be green.

- [ ] **Step 6: Commit**

```bash
git add src/components/TddCycleExplorer.js src/components/TddCycleExplorer.css src/tests/TddCycleExplorer.test.jsx
git commit -m "$(cat <<'EOF'
feat(tdd): TDD Cycle Explorer

Steps through an authored TDD kata — test list, code and suite panels
plus a red-green-refactor ring; a predict-mode toggle turns each step
into a phase-prediction self-test.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: The Rules Explorer — `TddRulesExplorer`

**Files:**
- Create: `src/components/TddRulesExplorer.js`, `src/components/TddRulesExplorer.css`
- Test: `src/tests/TddRulesExplorer.test.jsx`

Build by mirroring `src/components/SliceRegressionExplorer.js` (factory idiom,
quiz panel, `onLocaleChange`).

- [ ] **Step 1: Write the failing test**

Create `src/tests/TddRulesExplorer.test.jsx`:

```js
import { describe, expect, it, beforeEach } from 'vitest';
import { createTddRulesExplorer } from '../components/TddRulesExplorer.js';

describe('TddRulesExplorer', () => {
  let root;
  beforeEach(() => {
    root = createTddRulesExplorer();
    document.body.appendChild(root);
  });

  it('renders with the root testid and the three action buttons', () => {
    expect(root.dataset.testid).toBe('tdd-rules-explorer');
    expect(root.querySelector('[data-testid="tdd-action-write-failing-test"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="tdd-action-write-production-code"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="tdd-action-refactor"]')).toBeTruthy();
  });

  it('a legal action advances the state panel', () => {
    const before = root.querySelector('[data-testid="tdd-rules-state"]').textContent;
    root.querySelector('[data-testid="tdd-action-write-failing-test"]').click();
    const after = root.querySelector('[data-testid="tdd-rules-state"]').textContent;
    expect(after).not.toEqual(before);
  });

  it('an illegal action shows the blocking reason and does not advance', () => {
    const before = root.querySelector('[data-testid="tdd-rules-state"]').textContent;
    // production code with no failing test is illegal from the start
    root.querySelector('[data-testid="tdd-action-write-production-code"]').click();
    expect(root.querySelector('[data-testid="tdd-rules-feedback"]').textContent.trim())
      .not.toBe('');
    expect(root.querySelector('[data-testid="tdd-rules-state"]').textContent)
      .toEqual(before);
  });

  it('reset returns to the start state', () => {
    root.querySelector('[data-testid="tdd-action-write-failing-test"]').click();
    root.querySelector('[data-testid="tdd-rules-reset"]').click();
    root.querySelector('[data-testid="tdd-action-write-production-code"]').click();
    // after reset, production code is illegal again -> feedback shown
    expect(root.querySelector('[data-testid="tdd-rules-feedback"]').textContent.trim())
      .not.toBe('');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/TddRulesExplorer.test.jsx`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement `TddRulesExplorer.js` + `.css`**

`createTddRulesExplorer()` returns a root `<div>` with `dataset.testid = 'tdd-rules-explorer'`. Behaviour:

- **Imports:** `t`, `onLocaleChange` from `../i18n/index.js`; `initialTddState`, `legalActions`, `applyAction` from `../utils/tddRules.js`.
- **State** (module-level, reset in the factory): `tdd` (default `initialTddState()`), `feedback` (default `null` — `{ blocked, reasonKey }` or `{ blocked:false }` after a move), `quiz` (`{ active:false, phase:'idle', answer:'' }`).
- **State display** — `data-testid="tdd-rules-state"`: render `state.tdd.phase`, the `hasFailingTest` / `allGreen` booleans and `cycleCount` as a small status panel. Its `textContent` must change when the state changes. A red-green-refactor ring lights the node for `state.tdd.phase` (`start` lights none).
- **Action buttons** — three, `data-testid="tdd-action-write-failing-test"`, `tdd-action-write-production-code`, `tdd-action-refactor`. Compute `const legal = legalActions(state.tdd);` — a button for an action not in `legal` gets a visual "illegal" class but **stays clickable**.
- **Click handling** — on click, `const r = applyAction(state.tdd, action);` set `state.feedback = { blocked: r.blocked, reasonKey: r.reasonKey };` and, if `!r.blocked`, `state.tdd = r.state;` then re-render.
- **Feedback** — `data-testid="tdd-rules-feedback"`: when `feedback.blocked`, show `t(feedback.reasonKey)`; when a move succeeded, show a short `t('tdd.rules.ok')` confirmation. Empty before the first action.
- **Reset** — `data-testid="tdd-rules-reset"`: `state.tdd = initialTddState()`, `state.feedback = null`.
- **Quiz** — one multiple-choice question mirroring `SliceRegressionExplorer`'s quiz panel, `data-testid` `tdd-rules-quiz-start` / `tdd-rules-quiz-submit` / `tdd-rules-quiz-close` / `tdd-rules-quiz-result`; correct-answer key `'c'`.
- Re-render on `onLocaleChange`. All strings via `t()` (the `tdd.*` keys arrive in Task 5).
- `TddRulesExplorer.css` — reuse the `SliceRegressionExplorer.css` idiom (a `tdr-*` namespace). Style the action buttons (legal vs illegal tone), the state panel, the feedback area, and the red-green-refactor ring.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/TddRulesExplorer.test.jsx`
Expected: PASS — all 4 tests.

- [ ] **Step 5: Run the full suite — note the expected explorerTags gap**

Run: `npx vitest run`
`explorerTags.test.js` will fail because `TddCycleExplorer` and `TddRulesExplorer` have no tag entries yet — that is Task 5's job. Report it; do NOT add the entries here, do NOT weaken the test. Everything else must be green.

- [ ] **Step 6: Commit**

```bash
git add src/components/TddRulesExplorer.js src/components/TddRulesExplorer.css src/tests/TddRulesExplorer.test.jsx
git commit -m "$(cat <<'EOF'
feat(tdd): TDD Rules Explorer

A rule-enforced red-green-refactor state machine: the learner attempts
actions and an illegal move is blocked with the discipline rule it
breaks, backed by the pure tddRules engine.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Wiring — the new `tdd` section

**Files:**
- Modify: `src/app.js`, `src/utils/urlRouter.js`, `src/data/explorerTags.js`, `src/i18n/dict.js`, `src/styles.css`
- Test: `src/tests/urlRouter.test.js`, `src/tests/explorerTags.test.js`

The `tdd` section is a brand-new tabbed section. Mirror the existing `slicing`
section exactly — it is the closest precedent (a tabbed section with one
Explorer component per tab).

- [ ] **Step 1: urlRouter**

In `src/utils/urlRouter.js`:
- Add to `TAB_SECTIONS`: `tdd: { tabs: ['cycle', 'rules'], default: 'cycle' }`.
- Add to `EXPLORER_TO_LOCATION`:

```js
  TddCycleExplorer:            { section: 'tdd', tab: 'cycle' },
  TddRulesExplorer:            { section: 'tdd', tab: 'rules' },
```

- [ ] **Step 2: explorerTags**

In `src/data/explorerTags.js`, add to `EXPLORER_TAGS` (the `source` uses the `TEXTBOOK` constant already defined in that file):

```js
  TddCycleExplorer: {
    level: ['unit'], technique: ['tdd'], series: ['tdd'],
    difficulty: 'intro', source: [TEXTBOOK],
  },
  TddRulesExplorer: {
    level: ['unit'], technique: ['tdd'], series: ['tdd'],
    difficulty: 'intermediate', source: [TEXTBOOK],
  },
```

Add a `tdd` group to `SECTION_EXPLORERS`: `tdd: ['TddCycleExplorer', 'TddRulesExplorer']` (mirror how `slicing` is listed). If `explorerTags.js` keeps controlled-vocabulary lists for `technique` / `series` values, add `'tdd'` to both — open the file and check; the `explorerTags.test.js` integrity test will tell you if a vocabulary entry is missing.

- [ ] **Step 3: i18n — `src/i18n/dict.js`**

Open `src/components/TddCycleExplorer.js` and `src/components/TddRulesExplorer.js` and grep both for every `t('...')` / `t(\`...\`)` call. Also collect the `noteKey` values used in `src/data/tddKatas.js` (`tdd.kata.fizzbuzz.s1`…`s9`, `tdd.kata.stack.s1`…`s7`) and the reason keys from `src/utils/tddRules.js` (`tdd.rules.reason.alreadyRed`, `.noRed`, `.notGreen`, `.nothingYet`, `.unknown`). For EVERY key, add an entry to BOTH the `en` and the `zh` message objects, matching the existing key style (English in `en`, Traditional Chinese in `zh`). This must cover at least: `section.tdd.title`, `section.tdd.*` blurb keys used by the section shell, `tag.technique.tdd`, `tag.series.tdd`, the two kata `titleKey`s, all 16 kata `noteKey`s, the 5 rule reason keys, `tdd.rules.ok`, both explorers' UI strings (panel labels, the predict/next/reset buttons, the phase names, the action-button labels), and the quiz strings for both explorers (`tdd.cycle.quiz.*`, `tdd.rules.quiz.*` — prompt, `a`/`b`/`c`/`d`, `correct`, `wrong`). Every new key appears exactly once in `en` and once in `zh` — no duplicates. `dict.js` is large and has had concurrent-edit issues: after editing, verify each new key appears exactly twice in the file. zh terminology: 測試驅動開發 (TDD), 紅燈/綠燈/重構 (red/green/refactor), 測試清單 (test list).

- [ ] **Step 4: app.js**

In `src/app.js`:
1. Import `createTddCycleExplorer` from `./components/TddCycleExplorer.js` and `createTddRulesExplorer` from `./components/TddRulesExplorer.js` (next to the slicing-explorer imports).
2. Add to the section nav list (the array of `{ id, key }` around line 90-97): `{ id: 'tdd', key: 'section.tdd' }` (place it right after the `slicing` entry).
3. Add the section shell to the markup template (the block of `<section data-testid="section-…">` lines around line 238-246), right after the `section-slicing` line:

```js
          <section data-testid="section-tdd" tabindex="-1" aria-labelledby="section-tdd-title"><h2 id="section-tdd-title">${t('section.tdd.title')}</h2><div data-slot="tdd"></div></section>
```

4. Add `tdd` to the section-element lookup map (around line 289, where `slicing: main.querySelector('[data-testid="section-slicing"]')` is): `tdd: main.querySelector('[data-testid="section-tdd"]'),`.
5. Add both components to the `components` map (around line 365-371): `tddcycle: createTddCycleExplorer(),` and `tddrules: createTddRulesExplorer(),`.
6. Add a `tdd` tabbed-section block. Copy the entire `slicing` tabbed-section block (it begins at the comment `// --- Slice-Based Testing: tabbed …` near line 696 and runs through its `renderSlicingTabs(); updateSlicingPanels();` calls), paste it immediately after, and transform the copy:
   - every identifier `slicing` → `tdd`, `Slicing` → `Tdd` (e.g. `slicingSlot` → `tddSlot`, `slicingTabBar` → `tddTabBar`, `SLICING_TAB_KEY` → `TDD_TAB_KEY`, `renderSlicingTabs` → `renderTddTabs`, `activeSlicingTab` → `activeTddTab`, `data-slicing-panel` → `data-tdd-panel`, `data-slot="slicing"` → `data-slot="tdd"`, `slicing-tab-row` testid → `tdd-tab-row`);
   - the tab list is `['cycle', 'rules']`;
   - the `cycle` panel appends `components.tddcycle`, the `rules` panel appends `components.tddrules` — both are live, so there is **no** "coming soon" placeholder branch;
   - the tab-item label keys are `tdd.tab.cycle` and `tdd.tab.rules`;
   - the `localStorage` key is `'stvisual.tddActiveTab'`.

- [ ] **Step 5: styles.css**

In `src/styles.css`, add next to the slicing-explorer `@import`s:

```css
@import url('./components/TddCycleExplorer.css');
@import url('./components/TddRulesExplorer.css');
```

- [ ] **Step 6: Update integrity tests**

- `src/tests/urlRouter.test.js` — add tests that `parseAppLocation('?explorer=TddCycleExplorer')` resolves to `{ explorer: 'TddCycleExplorer', section: 'tdd', tab: 'cycle' }` and `?explorer=TddRulesExplorer` to `{ explorer: 'TddRulesExplorer', section: 'tdd', tab: 'rules' }`. Mirror the existing `SliceRegressionExplorer` test's assertion idiom.
- `src/tests/explorerTags.test.js` — the two new tag entries should make the integrity scan pass; confirm it passes. Only change the test if it still legitimately flags something.

- [ ] **Step 7: Run the full suite**

Run: `npx vitest run` — expect ALL tests green, no regressions, the previously-expected `explorerTags` gap resolved.

- [ ] **Step 8: Commit**

```bash
git add src/app.js src/utils/urlRouter.js src/data/explorerTags.js src/i18n/dict.js src/styles.css src/tests/urlRouter.test.js src/tests/explorerTags.test.js
git commit -m "$(cat <<'EOF'
feat(tdd): wire the TDD section live

New tdd section with two tabs — Cycle and Rules — mirroring the
slicing section's tabbed-section wiring.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Lecture deck #62

**Files:**
- Create: `docs/slides/62-test-driven-development.{en,zh-TW}.md`
- Modify: `scripts/build-slide-decks.mjs`, `src/data/slideDecks.generated.js`, `src/tests/slideDecks.test.js`

- [ ] **Step 1: Write the two decks**

Create `docs/slides/62-test-driven-development.en.md` and `docs/slides/62-test-driven-development.zh-TW.md`, mirroring the format of `docs/slides/61-regression-test-selection.{en,zh-TW}.md` exactly (Marp front-matter, title slide, content slides, two tool-demo slides, summary, further reading, speaker-note comments).

Content to cover:
- Why TDD — test-first flips the order: the test is written before the code it checks; the test is a specification and a safety net.
- The **red-green-refactor** micro-cycle: RED (write a small failing test; run it; watch it fail for the right reason), GREEN (write the *minimal* code to pass — "fake it" is allowed), REFACTOR (improve the code with the suite as a safety net; stay green).
- The **discipline rules**: no production code without a failing test; write the simplest code that passes; refactor only on green.
- "Fake it till you make it" and **triangulation** — a second test forces generalisation (the FizzBuzz `"1"` → `String(n)` move).
- The **test list** — capture behaviours to test as you discover them; it grows and shrinks.
- A worked **FizzBuzz** walkthrough using the kata's real steps from `src/data/tddKatas.js` (red→green fake-it, the triangulating second test, the `% 15`-first ordering, the final refactor).
- TDD vs test-after — what test-first buys: design pressure, a always-runnable suite, small steps.
- **Two tool-demo slides** — one for the Cycle tab (`/section-tdd` → Cycle: pick a kata, step through, predict the phase), one for the Rules tab (`/section-tdd` → Rules: attempt actions, see illegal moves blocked).
- Summary; further reading (Beck, *Test-Driven Development: By Example*; the FizzBuzz and Stack katas).

Titles: en front-matter `title:` = `Software Testing Visualization #62 — Test-Driven Development`; zh = `軟體測試視覺化 #62 — 測試驅動開發`. zh terminology: 測試驅動開發, 紅燈／綠燈／重構, 測試清單, 三角測量 (triangulation). No screenshots (a later pass adds them, as for the slicing decks).

- [ ] **Step 2: Register the deck**

In `scripts/build-slide-decks.mjs`, append to the `DECKS` array after the `61-regression-test-selection` entry (match the exact object-key shape of that entry):

```js
  { base: '62-test-driven-development', id: 'test-driven-development', num: 62, section: 'tdd' },
```

- [ ] **Step 3: Regenerate the bundled deck data**

Run: `npm run build:slide-decks`
Expected: prints `slideDecks: wrote 62 decks`.

- [ ] **Step 4: Update the deck-count test**

In `src/tests/slideDecks.test.js`, change the expected deck count from `61` to `62`.

- [ ] **Step 5: Run the slide tests, then commit**

Run: `npx vitest run src/tests/slideDecks.test.js` — expect PASS. Then `npx vitest run` — expect fully green.

```bash
git add docs/slides/62-test-driven-development.en.md docs/slides/62-test-driven-development.zh-TW.md scripts/build-slide-decks.mjs src/data/slideDecks.generated.js src/tests/slideDecks.test.js
git commit -m "$(cat <<'EOF'
docs(slides): deck #62 — test-driven development

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Plan.md + finalize

**Files:**
- Modify: `Plan.md`

- [ ] **Step 1: Add the §O section to Plan.md**

In `Plan.md`, after the §N (Slice-Based Testing) block, add a new section:

```markdown
## O. Test-Driven Development Explorer（全部完成 2026-05-19）

| 分頁 | Explorer | 內容 | 狀態 |
| --- | --- | --- | --- |
| **O1** | TDD Cycle | 走訪 authored TDD kata：測試清單／程式碼／套件狀態三面板，紅綠重構環，predict mode 自我測驗 | ✅ 已完成 2026-05-19 |
| **O2** | TDD Rules | 紅綠重構規則狀態機：嘗試動作，違規即擋下並說明違反的紀律規則 | ✅ 已完成 2026-05-19 |

紅綠重構規則引擎 `src/utils/tddRules.js`（純函式）＋ authored katas `src/data/tddKatas.js`。
附簡報 #62。設計與計畫：`docs/superpowers/specs/2026-05-19-tdd-visualization-design.md`、
`docs/superpowers/plans/2026-05-19-tdd-visualization.md`。
```

- [ ] **Step 2: Run the full suite**

Run: `npx vitest run` — expect every test green.

- [ ] **Step 3: Commit**

```bash
git add Plan.md
git commit -m "$(cat <<'EOF'
docs(plan): record §O TDD Explorer section complete

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Push and open the PR**

```bash
git push -u origin feat/tdd-visualization
gh pr create --title "feat(tdd): Test-Driven Development section (Cycle + Rules)" --body "Adds a new tdd section with two Explorers: the Cycle Explorer (authored kata replay with a predict-the-phase mode) and the Rules Explorer (a rule-enforced red-green-refactor state machine), backed by the pure tddRules engine and authored tddKatas data. Includes deck #62. Spec: docs/superpowers/specs/2026-05-19-tdd-visualization-design.md"
```

---

## Self-review notes

- **Spec coverage:** Task 1 ↔ `tddRules.js` engine; Task 2 ↔ `tddKatas.js` data; Task 3 ↔ `TddCycleExplorer` (kata replay, three panels, RGR ring, predict mode — covering interaction models #1 and #2); Task 4 ↔ `TddRulesExplorer` (rule-enforced machine — model #3); Task 5 ↔ all wiring rows + the new section shell; Task 6 ↔ deck #62; Task 7 ↔ Plan.md §O.
- **Type consistency:** `initialTddState()` → `{ phase, hasFailingTest, allGreen, cycleCount }`; `legalActions(state)` → `Set`; `applyAction(state, action)` → `{ state, blocked, reasonKey? }` — defined in Task 1, consumed by `TddRulesExplorer` in Task 4. `TDD_KATAS` step shape `{ phase, testList:[{name,status}], code, suite:{passing,failing}, noteKey }` — defined in Task 2, consumed by `TddCycleExplorer` in Task 3 and asserted by `tddKatas.test.js`. The five `tdd.rules.reason.*` keys and the kata `noteKey`s are produced in Tasks 1–2 and translated in Task 5.
- **testid consistency:** `tdd-cycle-explorer` / `tdd-rules-explorer` (roots), `tdd-kata-<id>`, `tdd-phase-red/green/refactor`, `tdd-test-list`, `tdd-code`, `tdd-suite`, `tdd-predict-toggle`, `tdd-predict-red/green/refactor`, `tdd-predict-result`, `tdd-next-step`, `tdd-reset`, `tdd-rules-state`, `tdd-action-write-failing-test` / `-write-production-code` / `-refactor`, `tdd-rules-feedback`, `tdd-rules-reset`, `tdd-cycle-quiz-*` / `tdd-rules-quiz-*` — each used identically in the component spec, the component test, and (for the explorer roots) the Task 5 routing wiring.
- **Quiz key `'c'`** matches the repo-wide convention.
- **Section wiring:** Task 5 copies the `slicing` tabbed-section block wholesale and renames — the safest way to add a new tabbed section, since `slicing` is the most recent working example.
