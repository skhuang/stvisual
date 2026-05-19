# TDD Visualization Design

**Date:** 2026-05-19
**Scope:** A new `tdd` course section teaching **Test-Driven Development** as two
interactive Explorers. Becomes Plan.md §O.

## Goal

Add a `tdd` section to the stvisual course with two Explorer tabs that together
cover the three interaction models chosen during brainstorming:

1. **TDD Cycle** (`cycle` tab) — step through an authored TDD session on a small
   kata, watching the red-green-refactor rhythm play out. A **Predict mode**
   toggle covers both the "predict the phase" self-test model and the plain
   step-through model.
2. **TDD Rules** (`rules` tab) — the red-green-refactor discipline as a
   rule-enforced state machine; the learner attempts actions and only
   TDD-legal moves are allowed.

Models #1 ("predict the phase") and #2 ("pure step-through") are the same kata
replay — #1 is #2 plus a prediction step — so they are one Explorer with a
toggle, not two tabs. Model #3 is genuinely different and is its own tab.

## Context

The app is vanilla-JS ES modules; each testing method is one Explorer, grouped
into tabbed sections. The most recent section, `slicing` (Plan.md §N, 4 tabs),
is the precedent this section mirrors: a new section id in `urlRouter.js`
`TAB_SECTIONS`, a `<section data-testid="section-<id>">` shell with a tabbed
panel, one Explorer component per tab, authored data files (no interpreter),
per-Explorer `explorerTags.js` metadata, `dict.js` i18n (en + zh), one CSS file
per Explorer `@import`ed into `styles.css`, and a lecture deck.

Reusable conventions:
- Explorer idiom — a `create<Name>Explorer()` factory returning a root element;
  module-level `state` reset in the factory; `render()` sets `root.innerHTML`
  then `bindEvents()`; a quiz panel; re-render on `onLocaleChange`; `data-testid`
  attributes throughout.
- `src/data/explorerTags.js` — per-Explorer tag metadata + an integrity test.
- `src/utils/urlRouter.js` — `TAB_SECTIONS`, `EXPLORER_TO_LOCATION`.
- `scripts/build-slide-decks.mjs` + `docs/slides/` — the slide-deck pipeline;
  deck data is bundled raw into `src/data/slideDecks.generated.js`.

Today TDD is touched only by the J7 ATDD Cycle Explorer, whose `develop` stage
lists red/green/refactor as three static items. This section makes the TDD
micro-cycle itself interactive.

## Engine — `src/utils/tddRules.js`

A pure, DOM-free state machine for the red-green-refactor discipline (Tab 2).

**State** — `{ phase, hasFailingTest, allGreen, cycleCount }`:
- `phase` — `'start' | 'red' | 'green' | 'refactor'`.
- `hasFailingTest` — a written-but-not-yet-passing test exists.
- `allGreen` — every written test passes (vacuously true at `start`).
- `cycleCount` — completed red→green cycles, for progress display.

**Actions** — three ids: `'write-failing-test'`, `'write-production-code'`,
`'refactor'`.

```js
// The initial TDD state.
export function initialTddState() {
  return { phase: 'start', hasFailingTest: false, allGreen: true, cycleCount: 0 };
}

// The TDD-legal actions from `state` — a Set of action ids.
export function legalActions(state) { /* see rules below */ }

// Apply `action`. If legal, returns { state: <next state>, blocked: false }.
// If illegal, returns { state: <unchanged>, blocked: true, reasonKey: <i18n key> }.
export function applyAction(state, action) { /* ... */ }
```

**Rules:**
- `write-failing-test` — legal iff `!hasFailingTest`. Effect: `hasFailingTest =
  true`, `allGreen = false`, `phase = 'red'`. Illegal reason
  (`tdd.rules.reason.alreadyRed`): "A test is already failing — make it pass
  before writing another."
- `write-production-code` — legal iff `hasFailingTest`. Effect: `hasFailingTest
  = false`, `allGreen = true`, `phase = 'green'`, `cycleCount++`. Illegal reason
  (`tdd.rules.reason.noRed`): "No failing test is driving this code — write a
  failing test first (RED)."
- `refactor` — legal iff `allGreen && !hasFailingTest`. Effect: `phase =
  'refactor'` (state otherwise unchanged). Illegal reason
  (`tdd.rules.reason.notGreen`): "A test is failing — get to GREEN before
  refactoring."

Pure, fully unit-testable. `reasonKey` is an i18n key; the Explorer resolves it
with `t()`.

## Data — `src/data/tddKatas.js`

Authored TDD sessions for Tab 1. No interpreter — every step is a hand-authored
snapshot, the same authored-data idiom as `slicingExamples.js`.

```js
// TDD_KATAS: array of katas. Each step is the full snapshot AFTER that step.
{
  id: 'fizzbuzz',
  titleKey: 'tdd.kata.fizzbuzz',
  steps: [
    {
      phase: 'red',                       // 'red' | 'green' | 'refactor'
      testList: [                         // every test known so far
        { name: 'returns "1" for 1', status: 'red' },   // 'todo'|'red'|'green'
      ],
      code: '',                           // production code after this step
      suite: { passing: 0, failing: 1 },  // suite status after this step
      noteKey: 'tdd.kata.fizzbuzz.s1',    // i18n key: one-line rationale
    },
    // … green, refactor, red, … ordered micro-steps
  ],
}
```

Ship **two** katas:
- **`fizzbuzz`** — the canonical beginner kata; shows minimal-code and the
  "fake it" → triangulate progression.
- **`stack`** — `push` / `pop` / `isEmpty`; shows the **test list growing** as
  new behaviours are discovered, and a refactor step.

Each kata's `steps` form a valid red→green→refactor→… sequence (the first step
is `red`; a `green` step always follows a `red`; `refactor` steps only appear
when `suite.failing === 0`). A unit test enforces these invariants so authored
data cannot drift.

## Tab 1 — `src/components/TddCycleExplorer.js` (+ `.css`)

`createTddCycleExplorer()` — factory mirroring the slicing-section explorers
(module `state`, `render()` + `bindEvents()`, quiz panel, `onLocaleChange`).
Root `data-testid="tdd-cycle-explorer"`.

- **State** (module-level, reset in factory): `kataId` (default
  `TDD_KATAS[0].id`), `stepIndex` (default `0`), `predict` (default `true`),
  `prediction` (`null` | `'red'` | `'green'` | `'refactor'` — the learner's
  pick for the *next* step, before it is revealed), `quiz`.
- **Kata chips** — `data-testid="tdd-kata-<id>"`, one per `TDD_KATAS`. Selecting
  one resets `stepIndex` to 0 and `prediction` to null.
- **Red-Green-Refactor ring** — three phase nodes (`data-testid="tdd-phase-red"`
  / `-green` / `-refactor`); the current step's `phase` node is lit.
- **Three live panels** — reflecting the current step's snapshot:
  - **Test list** — `data-testid="tdd-test-list"`: each `testList` entry with a
    status tone (todo / red / green).
  - **Code** — `data-testid="tdd-code"`: the step's `code` in a `<pre>`.
  - **Suite bar** — `data-testid="tdd-suite"`: `passing` green / `failing` red,
    with the counts.
  - The step's `noteKey` rationale is shown beneath.
- **Predict mode** — a toggle `data-testid="tdd-predict-toggle"`.
  - ON: before advancing, three predict buttons `data-testid="tdd-predict-red"`
    / `-green` / `-refactor`; the learner picks the *next* step's phase. On
    **Next step**, the explorer reveals whether the prediction matched the next
    step's `phase` (a correct/incorrect marker, `data-testid="tdd-predict-result"`)
    and then advances.
  - OFF: **Next step** simply advances; no prediction UI.
- **Next step** — `data-testid="tdd-next-step"`: advances `stepIndex`; disabled
  at the last step. A **Reset** (`data-testid="tdd-reset"`) returns to step 0.
  A step counter shows `stepIndex+1 / steps.length`.
- **Quiz** — one multiple-choice question, `data-testid` `tdd-cycle-quiz-start`
  / `-submit` / `-close` / `-result`; correct-answer key `'c'` (the repo-wide
  convention).
- Re-render on `onLocaleChange`; all strings via `t()`.

## Tab 2 — `src/components/TddRulesExplorer.js` (+ `.css`)

`createTddRulesExplorer()` — same factory idiom. Root
`data-testid="tdd-rules-explorer"`.

- **State** (module-level, reset in factory): `tdd` (a `tddRules` state, init
  `initialTddState()`), `feedback` (`null` | `{ blocked, reasonKey }`), `quiz`.
- **State display** — `data-testid="tdd-rules-state"`: the current `phase`, the
  `hasFailingTest` / `allGreen` flags, and `cycleCount`, rendered as a small
  status panel; the red-green-refactor ring lights the current `phase`.
- **Action buttons** — one per action, `data-testid="tdd-action-write-failing-test"`,
  `tdd-action-write-production-code`, `tdd-action-refactor`. Each button shows
  whether it is currently legal (`legalActions(state)`), but **all remain
  clickable** — clicking an illegal one is the teaching moment.
- **Feedback** — `data-testid="tdd-rules-feedback"`: after a click, either the
  state advanced, or the blocked `reasonKey` is shown via `t()` explaining the
  rule violated.
- **Reset** — `data-testid="tdd-rules-reset"` returns to `initialTddState()`.
- **Quiz** — `data-testid` `tdd-rules-quiz-start` / `-submit` / `-close` /
  `-result`; correct-answer key `'c'`.
- Re-render on `onLocaleChange`; all strings via `t()`.

## Wiring

| Concern | Change |
| --- | --- |
| Section | New `tdd` section: nav entry, `<section data-testid="section-tdd">` with a tabbed panel (`cycle` / `rules`), mirroring the `slicing` block in `app.js`. |
| `app.js` | Import `createTddCycleExplorer` + `createTddRulesExplorer`; add both to the `components` map; render the `tdd` section's two panels. |
| `urlRouter.js` | `TAB_SECTIONS.tdd = { tabs: ['cycle','rules'], default: 'cycle' }`; `EXPLORER_TO_LOCATION.TddCycleExplorer = { section:'tdd', tab:'cycle' }` and `.TddRulesExplorer = { section:'tdd', tab:'rules' }`. |
| `explorerTags.js` | Two entries: `level:['unit']`, `technique:['tdd']`, `series:['tdd']`, `difficulty:'intro'` (cycle) / `'intermediate'` (rules), `source:['textbook']`; new controlled-vocabulary values `technique:tdd` and `series:tdd`; a `SECTION_EXPLORERS.tdd` group. |
| i18n `dict.js` | `section.tdd.*`, `tag.technique.tdd`, `tag.series.tdd`, all `tdd.*` UI keys (kata titles, step notes, rule reasons, quiz strings), en + zh. |
| `styles.css` | `@import` `TddCycleExplorer.css` and `TddRulesExplorer.css`. |
| Slides | One deck **#62** `62-test-driven-development.{en,zh-TW}.md`; register in `build-slide-decks.mjs` (`section:'tdd'`); regenerate `slideDecks.generated.js`; deck-count test 61 → 62. |
| `Plan.md` | New §O — TDD section, both tabs marked done. |

## File structure

| File | Responsibility | Change |
| --- | --- | --- |
| `src/utils/tddRules.js` | Pure red-green-refactor rules engine | Create |
| `src/data/tddKatas.js` | The authored TDD katas | Create |
| `src/components/TddCycleExplorer.js` (+ `.css`) | The `cycle` tab | Create |
| `src/components/TddRulesExplorer.js` (+ `.css`) | The `rules` tab | Create |
| `src/app.js`, `src/utils/urlRouter.js`, `src/data/explorerTags.js`, `src/i18n/dict.js`, `src/styles.css` | Wiring | Modify |
| `docs/slides/62-test-driven-development.{en,zh-TW}.md` | Deck #62 | Create |
| `scripts/build-slide-decks.mjs`, `src/data/slideDecks.generated.js` | Register deck | Modify |
| `src/tests/tddRules.test.js` | Rules-engine unit tests | Create |
| `src/tests/tddKatas.test.js` | Kata-data invariant tests | Create |
| `src/tests/TddCycleExplorer.test.jsx`, `src/tests/TddRulesExplorer.test.jsx` | Explorer tests | Create |
| `src/tests/urlRouter.test.js`, `slideDecks.test.js` | Extend | Modify |
| `Plan.md` | Mark §O done | Modify |

## Testing

- `tddRules.js` — unit tests: each action's legal/illegal cases; a full
  red→green→refactor→red cycle drives the state correctly; illegal actions
  return the right `reasonKey` and leave state unchanged.
- `tddKatas.js` — invariant tests: every kata's `steps` start with `red`, a
  `green` follows each `red`, `refactor` steps have `suite.failing === 0`, and
  each step's `suite` counts are consistent with its `testList` statuses.
- `TddCycleExplorer` — jsdom: kata select, step advance updates the panels,
  predict mode reveals a correct/incorrect marker, the suite bar reflects the
  step, quiz flow.
- `TddRulesExplorer` — jsdom: a legal action advances the state, an illegal
  action shows the blocking reason and does not advance, reset, quiz flow.
- `?explorer=TddCycleExplorer` / `TddRulesExplorer` routing tests; deck-count
  test → 62.

## Out of scope

- A real interpreter / running actual tests — every kata step is authored, like
  every other Explorer's data.
- The learner writing real code or real tests.
- Mocking / test-doubles, property-based testing, TDD-vs-test-after metrics —
  TDD-adjacent topics that are not the red-green-refactor core; a later section
  could add them.
