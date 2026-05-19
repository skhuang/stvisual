# N4 — Slice-Based Regression Test Selection Design

**Date:** 2026-05-19
**Scope:** The fourth and final tab of the Slicing section (Plan.md §N) — the
`SliceRegressionExplorer`. Builds on N1 (PR #284), N2 (PR #288), N3 (PR #289).

## Goal

Teach **regression test selection (RTS)** — after editing a program, decide
which tests must be re-run and which are provably safe to skip — as the
`regression` tab of the `slicing` section. The tab is currently a placeholder;
N4 makes it live and completes the section (4/4 tabs).

The idea: the learner marks one statement as **changed** (an edit). The
**forward slice** of that statement is its **impact set** — every statement the
edit can reach through control and data dependence. A test (an authored
execution trace) must be **re-run** when the edit can affect it; otherwise it is
**safe to skip**. Slicing turns "re-run everything" into a precise selection.

Two selection criteria are offered as a toggle — the same safety-vs-precision
contrast N1 and N2 teach:

- **static** — conservative. A test is *affected* iff the set of statements it
  executed intersects the impact set. If the test ran anything the edit can
  reach, re-run it.
- **dynamic** — precise. A test is *affected* iff the changed statement lies in
  that test's **dynamic backward slice** from the output — i.e. the edit
  actually flows to *that test's* output on *its* run. Strictly tighter:
  dynamic-affected ⊆ static-affected.

The learner edits a statement, flips the toggle, and watches the re-run set
shrink — the saved tests are the payoff.

## Context

N1–N3, all merged, shipped:

- `src/utils/slicing.js` — pure engine: `backwardSlice(pdg, criterion)`,
  `forwardSlice(pdg, criterion)`, `dynamicSlice(pdg, trace, criterion)`,
  `programDice(failingSlice, passingSlices)`, `slicesIntersect(a, b)`,
  `sliceCoverage(slice, executed)`.
- `src/data/slicingExamples.js` — `SLICING_EXAMPLES`, `getSlicingExample`. Each
  example is a PDG `{ id, titleKey, language, source, statements:[{id,line,text,
  defs,uses,kind?}], controlDeps:[[from,to]], dataDeps:[[from,to,variable]],
  traces:[{id,inputLabel,label?,steps:[stmtId...]}] }`. Each example has exactly
  one `kind:'output'` statement and ≥2 traces.
- `src/components/SlicePdgView.js` — `renderSliceCodeListing(example, sliceSet,
  options)` and `renderSlicePdgGraph(example, sliceSet, options)`;
  `options.secondary` (a Set) renders a lighter `slice-stmt--ctx` /
  `pdg-node--ctx` tone; `options.zoom`, `options.idPrefix`.
- `src/components/ProgramSlicingExplorer.js` (N1), `SliceDicingExplorer.js`
  (N2), `SliceCoverageExplorer.js` (N3) — the Explorer idiom this tab follows.
- The `slicing` section: 4 tabs in `urlRouter.js` `TAB_SECTIONS`
  (`program`, `dicing`, `coverage` live; `regression` placeholder).

A criterion is `{ stmtId, variable }`. Slices are `Set<stmtId>`.

## Engine — one new pure helper in `slicing.js`

```js
// Regression test selection. Given a PDG, its output criterion, the id of the
// changed statement, and a mode ('static' | 'dynamic'), classify every trace
// in `pdg.traces` as affected (must re-run) or safe (can skip).
//
// impact  = the forward slice of the changed statement — every statement the
//           edit can reach. Computed over each variable the statement defines
//           (or, for a def-less control statement, a single variable-less
//           pass so control-dependent children are still reached).
// static  : a trace is affected iff the statements it executed intersect
//           `impact`  (slicesIntersect).
// dynamic : a trace is affected iff `changedStmtId` is in that trace's
//           dynamic backward slice from `criterion`.
export function affectedTests(pdg, criterion, changedStmtId, mode) {
  const changed = pdg.statements.find((s) => s.id === changedStmtId);
  const impact = new Set();
  const vars = changed && changed.defs.length ? changed.defs : [undefined];
  for (const v of vars) {
    for (const id of forwardSlice(pdg, { stmtId: changedStmtId, variable: v })) {
      impact.add(id);
    }
  }
  const affected = new Set();
  const safe = new Set();
  for (const trace of pdg.traces || []) {
    let hit;
    if (mode === 'dynamic') {
      hit = dynamicSlice(pdg, trace, criterion).has(changedStmtId);
    } else {
      hit = slicesIntersect(impact, new Set(trace.steps));
    }
    (hit ? affected : safe).add(trace.id);
  }
  return { affected, safe, impact };
}
```

Pure, no DOM. `affected`/`safe` are `Set<traceId>`; `impact` is `Set<stmtId>`.
This is the only engine change. `forwardSlice`, `dynamicSlice`, `slicesIntersect`
already exist; `affectedTests` composes them.

`dynamicSlice` already returns the empty set when the trace did not execute the
criterion statement, so a trace that never reaches the output is `safe` under
the dynamic criterion without a special case. When `changedStmtId` matches no
statement, `impact` is `{changedStmtId}` only (the variable-less branch) and
every trace executing that id is still classified — no throw.

## Examples — reuse `slicingExamples.js`, no new data file

N4 needs, per example: one changed statement, an output, and a set of traces.
Every `slicingExamples.js` example already has an output and ≥2 traces, and any
statement can be marked changed — so **no new data file**.

- **`classify`** is the showcase: traces `pos` / `neg` / `zero` exercise
  different branches.
  - Editing `s3` (`sign = 0`) — `static` re-runs all three traces (each
    executes `s3`); `dynamic` re-runs **none** (`sign` never flows to `label`).
    The "ran the line but it did not matter" lesson.
  - Editing `s4` (`if (n > 0)`) — `static` re-runs all three; `dynamic` re-runs
    `pos` and `neg` but skips `zero` (whose `label` came from the unconditional
    `s2`). The three-way contrast.
- **`grade-average`** / **`grade-average-buggy`** — simpler: the loop traces
  exercise similar statements, so static and dynamic mostly agree.

## The Explorer — `src/components/SliceRegressionExplorer.js` (+ `.css`)

`createSliceRegressionExplorer()` — factory mirroring the N1–N3 explorers
(module `state`, `render()` + `bindEvents()`, quiz panel, `onLocaleChange`).
Root `data-testid="slice-regression-explorer"`.

- **Example chips** — `data-testid="regression-example-<id>"`, one per
  `SLICING_EXAMPLES`. Selecting one resets the changed statement to none.
- **The output** — the example's `kind:'output'` statement; its variable is
  `outputStmt.uses[0]`. The criterion is `{ stmtId: outputStmt.id, variable }`.
  Shown read-only (the learner picks the *edit*, not the output).
- **Pick the edit** — clicking a statement in the code listing or a PDG node
  marks it the changed statement; `state.changedStmtId` (default `null`).
  Re-clicking the same statement clears it. While none is chosen the
  test-suite panel prompts the learner to pick one.
- **Mode toggle** — `data-testid="regression-mode-static"` /
  `regression-mode-dynamic`; `state.mode` (default `'static'`).
- **`affectedTests`** — `affectedTests(example, criterion, changedStmtId, mode)`
  supplies `{ affected, safe, impact }`.
- **Code + PDG** — `renderSliceCodeListing` / `renderSlicePdgGraph`: the changed
  statement takes the strong `--in` highlight; the rest of the `impact` set
  takes the lighter `--ctx` tone. So `sliceSet = new Set([changedStmtId])`,
  `options.secondary = impact`. Graph left, panel right, mirroring
  `ProgramSlicingExplorer`'s `pse-graph-row`; a zoom control like the others.
- **Test-suite panel** — `data-testid="regression-tests"`: one row per the
  example's traces, `data-testid="regression-test-<id>"`, each carrying the
  trace's `inputLabel || label || id` and a badge — **must re-run** (in
  `affected`) or **safe to skip** (in `safe`). Before an edit is chosen the
  panel shows a pick-a-statement prompt.
- **Savings metric** — `data-testid="regression-metric"`: "re-run A of N — X%
  skipped", with `A = affected.size`, `N = traces.length`,
  `X = round(safe.size / N * 100)`.
- **Quiz** — one multiple-choice question (answer key `'c'`, mirroring
  N1–N3): given an edit, which tests must be re-run. `data-testid`
  `regression-quiz-start` / `-submit` / `-close` / `-result`.
- Re-render on `onLocaleChange`; all strings via `t()`.
- `SliceRegressionExplorer.css` — reuse the `ProgramSlicingExplorer.css` /
  `SliceCoverageExplorer.css` idiom; add a re-run / safe badge style.

`SlicePdgView.js` is **not** modified — N4 uses its existing `sliceSet` +
`options.secondary` two-tone API as-is.

## Wiring

| Concern | Change |
| --- | --- |
| `app.js` | The `regression` panel renders `createSliceRegressionExplorer()` instead of the placeholder; add `regression: createSliceRegressionExplorer()` to the `components` map + the import. |
| `urlRouter.js` | `EXPLORER_TO_LOCATION.SliceRegressionExplorer = { section:'slicing', tab:'regression' }`. (`TAB_SECTIONS.slicing` already lists `regression`.) |
| `explorerTags.js` | `SliceRegressionExplorer` entry: `level:['unit']`, `technique:['slicing']`, `series:['slicing']`, `difficulty:'intermediate'`, `source:['textbook']`; added to `SECTION_EXPLORERS.slicing`. |
| i18n `dict.js` | `regression.*` UI keys, en + zh. |
| `styles.css` | `@import` `SliceRegressionExplorer.css`. |
| Slides | Deck **#61** `61-regression-test-selection.{en,zh-TW}.md`; register in `build-slide-decks.mjs` (`section:'slicing'`); regenerate `slideDecks.generated.js`; deck-count test 60 → 61. |

## File structure

| File | Responsibility | Change |
| --- | --- | --- |
| `src/utils/slicing.js` | add `affectedTests` | Modify |
| `src/components/SliceRegressionExplorer.js` (+ `.css`) | The `regression` tab | Create |
| `src/app.js`, `src/utils/urlRouter.js`, `src/data/explorerTags.js`, `src/i18n/dict.js`, `src/styles.css` | Wiring | Modify |
| `docs/slides/61-regression-test-selection.{en,zh-TW}.md` | Deck #61 | Create |
| `scripts/build-slide-decks.mjs`, `src/data/slideDecks.generated.js` | Register deck | Modify |
| `src/tests/slicing.test.js` | extend — `affectedTests` cases | Modify |
| `src/tests/SliceRegressionExplorer.test.jsx` | Tests | Create |
| `src/tests/urlRouter.test.js`, `slideDecks.test.js` | Extend | Modify |
| `Plan.md` | Mark N4 done — Slicing section complete | Modify |

## Testing

- `slicing.js` — `affectedTests` unit tests: `classify` editing `s3`
  (static → all traces affected, dynamic → none); `classify` editing `s4`
  (static → all, dynamic → `pos`+`neg` affected, `zero` safe); the
  changed-statement-itself is in `impact`; an unknown `changedStmtId` does not
  throw.
- `SliceRegressionExplorer` — jsdom: example select, picking a statement marks
  the edit, the mode toggle moves traces between affected/safe, the savings
  metric updates, the quiz flow.
- `?explorer=SliceRegressionExplorer` routing test; deck-count test → 61.

## Out of scope

- Editing multiple statements at once — the learner marks exactly one changed
  statement; multi-edit RTS is not modelled.
- Test prioritisation / ordering — N4 selects, it does not rank.
- A real interpreter or diff tool — the "edit" is a marked statement, traces
  remain authored.
- Per-output selection across multiple outputs — the `slicingExamples.js`
  examples are single-output.
