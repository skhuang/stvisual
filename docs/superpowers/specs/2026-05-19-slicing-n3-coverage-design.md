# N3 — Slice-Based Coverage Design

**Date:** 2026-05-19
**Scope:** The third tab of the Slicing section (Plan.md §N) — the
`SliceCoverageExplorer`. Builds on N1 (PR #284) and N2 (PR #288).

## Goal

Teach **slice-based coverage** — a test-adequacy criterion built on program
slices — as the `coverage` tab of the `slicing` section. The tab is currently a
placeholder; N3 makes it live.

The idea: for a chosen output variable, its **backward static slice** is the set
of statements *relevant to that output*. A test suite is a set of execution
traces. A slice statement is **covered** when some trace in the suite executes
it. **Slice coverage** = covered-slice-statements ÷ slice-size. The learner
toggles authored traces in and out of the suite, watches slice coverage rise and
fall, and hunts the **gaps** — slice statements no trace reaches.

The Explorer shows slice coverage **beside plain statement coverage** so the
contrast lands: a statement can be executed (statement-covered) yet lie outside
the output's slice — effort spent on code irrelevant to that output; and
conversely, slice coverage concentrates the adequacy measure on what actually
affects the output.

## Context

N1 (PR #284) and N2 (PR #288), both merged, shipped:
- `src/utils/slicing.js` — pure engine: `backwardSlice(pdg, criterion)`,
  `forwardSlice`, `dynamicSlice(pdg, trace, criterion)`,
  `programDice(failingSlice, passingSlices)`, `slicesIntersect`.
- `src/data/slicingExamples.js` — `SLICING_EXAMPLES`, `getSlicingExample`.
  Each example is a PDG `{ id, titleKey, language, source, statements:[{id,line,
  text,defs,uses,kind?}], controlDeps:[[from,to]], dataDeps:[[from,to,variable]],
  traces:[{id,inputLabel,label?,steps:[stmtId...]}] }`. Each example has exactly
  one `kind:'output'` statement.
- `src/components/SlicePdgView.js` — `renderSliceCodeListing(example, sliceSet,
  options)` and `renderSlicePdgGraph(example, sliceSet, options)`; `options.
  secondary` (a Set) renders a lighter `slice-stmt--ctx` / `pdg-node--ctx` tone;
  `options.zoom`, `options.idPrefix`.
- `src/components/ProgramSlicingExplorer.js` (N1) and `SliceDicingExplorer.js`
  (N2) — the Explorer idiom this tab follows.
- The `slicing` section: 4 tabs in `urlRouter.js` `TAB_SECTIONS`
  (`program` and `dicing` live; `coverage`/`regression` placeholder).

A criterion is `{ stmtId, variable }`. Slices are `Set<stmtId>`.

## Engine — one new pure helper in `slicing.js`

```js
// Slice-based coverage. Given a slice (Set of stmt ids) and the set of
// statement ids executed by a test suite, report which slice statements
// were covered, which were missed, and the coverage percentage.
export function sliceCoverage(slice, executed) {
  const covered = new Set();
  const uncovered = new Set();
  for (const id of slice) {
    if (executed.has(id)) covered.add(id);
    else uncovered.add(id);
  }
  const total = slice.size;
  const pct = total === 0 ? 100 : Math.round((covered.size / total) * 100);
  return { covered, uncovered, pct };
}
```

Pure, no DOM. The empty-slice case returns 100% (vacuously covered). This is the
only engine change; `backwardSlice` supplies the slice and the Explorer unions
the active traces' `steps` to form `executed`.

## Examples — reuse `slicingExamples.js`, no new data file

N3 needs, per example: one output statement and a set of traces. Every
`slicingExamples.js` example already has both, so **no new data file**. The
Explorer reads the example's output statement (the `kind:'output'` one) and its
variable (`outputStmt.uses[0]`), computes `backwardSlice(example, {stmtId:
outputStmt.id, variable})`, and treats the example's `traces` as the togglable
suite.

- **`classify`** is the showcase: output `label`; traces `pos` / `neg` / `zero`
  each exercise a different branch, so the `label` slice is only fully covered
  by a multi-trace suite — a single trace leaves real gaps.
- **`grade-average`** and **`grade-average-buggy`** are the simpler examples
  (the loop traces cover similar statements).

## The Explorer — `src/components/SliceCoverageExplorer.js` (+ `.css`)

`createSliceCoverageExplorer()` — factory mirroring `ProgramSlicingExplorer` /
`SliceDicingExplorer` (module `state`, `render()` + `bindEvents()`, quiz panel,
`onLocaleChange`). Root `data-testid="slice-coverage-explorer"`.

- **Example chips** — `data-testid="coverage-example-<id>"`, one per
  `SLICING_EXAMPLES`. Selecting one resets the suite to *all traces on*.
- **The target** — the example's output statement's variable; its
  `backwardSlice` is the relevant-statement set. Shown read-only (the criterion
  is the output; the learner does not pick it here — N1 is for that).
- **Trace toggle chips** — `data-testid="coverage-trace-<id>"`, one per the
  example's `traces`; clicking toggles the trace's membership in the suite.
  `state.activeTraceIds` is a Set; default all on.
- **`executed`** — the union of every active trace's `steps`.
- **Two metrics, side by side** — a `data-testid="coverage-metrics"` panel:
  - **Slice coverage** — `sliceCoverage(slice, executed).pct`, with
    `covered.size / slice.size`.
  - **Statement coverage** — plain: executed-statements ∩ all-statements over
    all statements, as a percentage.
  Each as a labelled bar + percentage.
- **Code + PDG** — `renderSliceCodeListing` / `renderSlicePdgGraph`: the
  **uncovered** slice statements (the gaps) take the strong `--in` highlight
  (they are what needs attention); the **covered** slice statements take the
  lighter `--ctx` tone. So `sliceSet = uncovered`, `options.secondary = covered`.
- **Gap list** — `data-testid="coverage-gaps"`: the uncovered slice statements
  (id + text); when slice coverage is 100% it shows a "fully covered" message.
  A secondary line names statements **executed but outside the slice** — the
  contrast (statement-covered yet output-irrelevant).
- **Quiz** — one multiple-choice question (answer key `'c'`, mirroring N1/N2's
  quiz panel): with a partial suite given, which trace closes the slice-coverage
  gap. `data-testid` `coverage-quiz-start` / `-submit` / `-close` / `-result`.
- Re-render on `onLocaleChange`; all strings via `t()`.
- `SliceCoverageExplorer.css` — reuse the `ProgramSlicingExplorer.css` /
  `SliceDicingExplorer.css` idiom; add a two-bar coverage-meter style.

## Wiring

| Concern | Change |
| --- | --- |
| `app.js` | The `coverage` panel renders `createSliceCoverageExplorer()` instead of the placeholder; add `coverage: createSliceCoverageExplorer()` to the `components` map + the import. |
| `urlRouter.js` | `EXPLORER_TO_LOCATION.SliceCoverageExplorer = { section:'slicing', tab:'coverage' }`. (`TAB_SECTIONS.slicing` already lists `coverage`.) |
| `explorerTags.js` | `SliceCoverageExplorer` entry: `level:['unit']`, `technique:['slicing']`, `series:['slicing']`, `difficulty:'intermediate'`, `source:['textbook']`; added to `SECTION_EXPLORERS.slicing`. |
| i18n `dict.js` | `coverage.*` UI keys, en + zh. |
| `styles.css` | `@import` `SliceCoverageExplorer.css`. |
| Slides | Deck **#60** `60-slice-based-coverage.{en,zh-TW}.md`; register in `build-slide-decks.mjs` (`section:'slicing'`); regenerate `slideDecks.generated.js`; deck-count test 59 → 60. |

## File structure

| File | Responsibility | Change |
| --- | --- | --- |
| `src/utils/slicing.js` | add `sliceCoverage` | Modify |
| `src/components/SliceCoverageExplorer.js` (+ `.css`) | The `coverage` tab | Create |
| `src/app.js`, `src/utils/urlRouter.js`, `src/data/explorerTags.js`, `src/i18n/dict.js`, `src/styles.css` | Wiring | Modify |
| `docs/slides/60-slice-based-coverage.{en,zh-TW}.md` | Deck #60 | Create |
| `scripts/build-slide-decks.mjs`, `src/data/slideDecks.generated.js` | Register deck | Modify |
| `src/tests/slicing.test.js` | extend — `sliceCoverage` cases | Modify |
| `src/tests/SliceCoverageExplorer.test.jsx` | Tests | Create |
| `src/tests/urlRouter.test.js`, `slideDecks.test.js` | Extend | Modify |
| `Plan.md` | Mark N3 done | Modify |

`SlicePdgView.js` is **not** modified — N3 uses its existing `sliceSet` +
`options.secondary` two-tone API as-is.

## Testing

- `slicing.js` — `sliceCoverage` unit tests: full coverage, partial coverage
  with the right `covered`/`uncovered` split, the empty-slice → 100% case.
- `SliceCoverageExplorer` — jsdom: example select, trace toggle changes the
  metrics, gaps appear/clear, the two-metric panel renders, quiz flow.
- `?explorer=SliceCoverageExplorer` routing test; deck-count test → 60.

## Out of scope

- Per-output coverage across multiple outputs — the `slicingExamples.js`
  examples are single-output; slice coverage is for that one output.
- Editing examples or authoring new traces in the UI — traces are the authored,
  fixed `slicingExamples.js` data; the learner only toggles their suite
  membership.
- N4 (Regression Test Selection) — its own spec.
- A real interpreter — traces remain authored.
