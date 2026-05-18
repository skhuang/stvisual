# Section N — Slice-Based Testing Design

**Date:** 2026-05-18
**Scope:** A new course section teaching **program slicing** and its three testing
applications, as four interactive Explorers. Becomes Plan.md §N.

## Goal

Add a `slicing` section to the stvisual course with four Explorer tabs:

1. **N1 — Program Slicing** (foundation): what a slice *is* — backward / forward,
   static / dynamic, over the Program Dependence Graph.
2. **N2 — Fault Localization / Dicing**: localize a bug by slicing a failing
   output and dicing against passing runs.
3. **N3 — Slice-Based Coverage**: a test-adequacy criterion built on slices.
4. **N4 — Regression Test Selection**: pick which tests to re-run after an edit,
   via slice intersection.

N1 is the foundation; N2–N4 consume its slicing engine and example data.

## Context

The app is vanilla-JS ES modules; each testing method is one Explorer, grouped
into tabbed sections (`syntax`, `blackbox`, `advanced`, `mbt`, `agile`, …). The L
(Model-Based Testing, 6 tabs) and M (Agile, 6 tabs) sections are the precedent
this section mirrors.

Reusable machinery already present:
- `src/utils/dataFlow.js` — `extractDefUse`, `buildDataFlowGraph` (data dependences).
- `src/utils/programToGraph.js` — `generateControlFlowGraphFromProgram` (CFG).
- `src/utils/pathToCfg.js` — `renderCfgSvg(cfg, highlight, options)` (SVG render).
- `src/data/explorerTags.js` — per-Explorer tag metadata + the integrity test.
- `src/utils/urlRouter.js` — `TAB_SECTIONS`, `EXPLORER_TO_LOCATION`.
- `scripts/build-slide-decks.mjs` + `docs/slides/` — the slide-deck pipeline.

## Engine approach — authored PDGs

A general program-dependence-graph builder correct on arbitrary JavaScript is out
of scope: extracting **control dependences** from real parsed code is hard and
error-prone. Every model-driven Explorer in this app instead ships **curated
authored models** (authored FSMs, codecov presets with explicit statement/branch
lists, decision tables). This section does the same.

**Each example program ships an authored PDG.** The slicing logic is then pure
graph reachability — small, fully unit-testable, no parser edge-cases.

### Data model — the authored PDG

```js
// src/data/slicingExamples.js
{
  id: 'grade-average',
  titleKey: 'slicing.example.gradeAverage',
  language: 'javascript',
  // Source lines, 1-indexed; rendered verbatim.
  source: [
    'function gradeAverage(scores) {',          // 1
    '  let total = 0;',                          // 2
    '  let count = 0;',                          // 3
    '  for (const s of scores) {',               // 4
    '    total = total + s;',                    // 5
    '    count = count + 1;',                    // 6
    '  }',                                       // 7
    '  const avg = total / count;',              // 8
    '  const grade = avg >= 60 ? "pass" : "fail";', // 9
    '  return grade;',                           // 10
  ],
  // One PDG node per executable statement.
  statements: [
    { id: 's2', line: 2, text: 'total = 0',        defs: ['total'], uses: [] },
    { id: 's3', line: 3, text: 'count = 0',        defs: ['count'], uses: [] },
    { id: 's4', line: 4, text: 'for s of scores',  defs: ['s'],     uses: ['scores'], kind: 'control' },
    { id: 's5', line: 5, text: 'total = total+s',  defs: ['total'], uses: ['total','s'] },
    { id: 's6', line: 6, text: 'count = count+1',  defs: ['count'], uses: ['count'] },
    { id: 's8', line: 8, text: 'avg = total/count',defs: ['avg'],   uses: ['total','count'] },
    { id: 's9', line: 9, text: 'grade = avg>=60?', defs: ['grade'], uses: ['avg'],  kind: 'control' },
    { id: 's10', line: 10, text: 'return grade',   defs: [],        uses: ['grade'], kind: 'output' },
  ],
  // Control-dependence edges: parent statement → dependent statement.
  controlDeps: [['s4','s5'], ['s4','s6']],
  // Data-dependence edges: defining statement → using statement, per variable.
  dataDeps: [
    ['s2','s5','total'], ['s5','s5','total'], ['s5','s8','total'],
    ['s3','s6','count'], ['s6','s6','count'], ['s6','s8','count'],
    ['s8','s9','avg'], ['s9','s10','grade'],
  ],
  // Authored execution traces for dynamic slicing — ordered executed
  // statement ids for a given input. (Loop iterations expand the list.)
  traces: [
    { id: 'pass', inputLabel: 'scores=[80,90]', label: 'pass',
      steps: ['s2','s3','s4','s5','s6','s4','s5','s6','s4','s8','s9','s10'] },
    { id: 'fail', inputLabel: 'scores=[50]',    label: 'fail',
      steps: ['s2','s3','s4','s5','s6','s4','s8','s9','s10'] },
  ],
}
```

`dataDeps` is the contract; it can be cross-checked at build/test time against
`dataFlow.js extractDefUse` on each statement's `defs`/`uses`, so the authored
data matches the existing engine rather than drifting from it.

3–4 example programs ship: a loop accumulator (`grade-average` above), a branchy
`classify`, and a deliberately **buggy** variant used by N2 (e.g. `s6` reads the
wrong variable). N3/N4 reuse the same examples.

### Slicing core — `src/utils/slicing.js`

Pure functions over an authored PDG. No DOM, no app state.

```js
// A criterion is { stmtId, variable }.

// Statements that may affect `variable` at `stmtId` — backward reachability
// over controlDeps ∪ dataDeps, starting from stmtId.
export function backwardSlice(pdg, criterion) -> Set<stmtId>

// Statements that may be affected by `variable` at `stmtId` — forward
// reachability over the same edges.
export function forwardSlice(pdg, criterion) -> Set<stmtId>

// Backward slice restricted to dependence edges whose endpoints both occur
// (in the right order) in `trace.steps`. Smaller and input-specific.
export function dynamicSlice(pdg, trace, criterion) -> Set<stmtId>

// Program dice: statements in the failing slice but in NONE of the passing
// slices — the localized suspect set.
export function programDice(failingSlice, passingSlices) -> Set<stmtId>

// True iff two slices share at least one statement.
export function slicesIntersect(a, b) -> boolean
```

Reachability is breadth-first over an adjacency map built once from
`controlDeps` + `dataDeps`. `dynamicSlice` additionally requires, for a data-dep
edge `def → use`, that `def` is the *most recent* preceding occurrence of that
definition before `use` in `trace.steps` (last-definition rule).

## The four Explorers

All four follow the established Explorer idiom: a `create<Name>Explorer()`
factory returning a root element, an example/scenario chip bar, an SVG/code main
view, a detail panel, plus quiz + lab-reflect modes and `data-testid`s.

The shared **code+PDG view** renders the source with each statement line tinted
by slice membership, beside an SVG dependence graph (`renderCfgSvg`-style:
control-dep edges solid, data-dep edges dashed, sliced nodes highlighted).

### N1 — `ProgramSlicingExplorer`

- Pick an example program; pick a **criterion** (click a statement, choose one of
  its variables).
- Choose **direction** (backward / forward) and **mode** (static / dynamic).
- Static mode slices over the full PDG. Dynamic mode also asks for a **trace**
  (one of the example's authored inputs) and slices over the dynamic dependence
  graph — the highlight visibly shrinks.
- Detail panel: the slice statement list, its size, and the static-vs-dynamic
  size delta. Quiz: "which statements are in the backward slice of `grade@10`?"

### N2 — `SliceDicingExplorer`

- An example with a seeded bug and a set of authored test runs (pass/fail).
- Backward-slice the **wrong output** of the failing run; show it.
- Show the union of the **passing** runs' slices; the **dice** = failing slice −
  passing union, highlighted as the suspect set.
- Toggle static vs dynamic dicing (dynamic dice is tighter). Detail panel ranks
  the suspect statements; the seeded bug should land in the dice.
- Quiz: "the dice has N statements — which is the most likely fault site?"

### N3 — `SliceCoverageExplorer`

- An example with one or more **output variables**; the backward slice of each
  output is its "relevant statement set".
- A small authored **test suite** (each test = a trace). A statement of an
  output's slice is *covered* iff some test's trace executes it.
- **Slice coverage** = covered slice-statements / total slice-statements, per
  output and overall. Uncovered slice statements are surfaced as gaps.
- Contrast with plain statement coverage: a statement can be covered yet not in
  any output's slice (dead w.r.t. outputs), and vice-versa.
- Quiz: "add the test that closes the slice-coverage gap."

### N4 — `SliceRegressionExplorer`

- Start from a baseline example + its test suite (traces).
- **Edit** a statement (pick one to mark "changed").
- The **forward slice** of the changed statement = the statements affected by the
  edit. A test is **affected** iff its backward slice (of any output) intersects
  the changed set — `slicesIntersect`.
- Show the **affected** tests (must re-run) vs the **safe** tests (can skip), and
  the time saved. Edge case: an edit whose forward slice reaches no output.
- Quiz: "after changing statement X, which tests must re-run?"

## Architecture wiring

| Concern | Change |
| --- | --- |
| Section | New `slicing` section: nav entry, `<section data-testid="section-slicing">`, tabbed panel with tabs `program / dicing / coverage / regression`. |
| `urlRouter.js` | `TAB_SECTIONS.slicing = { tabs: ['program','dicing','coverage','regression'], default: 'program' }`; 4 `EXPLORER_TO_LOCATION` entries. |
| `explorerTags.js` | 4 entries: `technique: ['slicing']`, `level: ['unit']`, `series: ['slicing']`, `difficulty` per tab; new controlled-vocabulary values `technique:slicing` and `series:slicing`. |
| i18n | `tag.technique.slicing`, `tag.series.slicing`, all `slicing.*` UI keys, en + zh. |
| Course pack | A `slicing` pack in `courseSeries.js` (`filter: { series: ['slicing'] }`). |
| Slides | Decks **#58–#61**, one per tab, en + zh, registered in `build-slide-decks.mjs` (`DECKS` array, `section: 'slicing'`); regenerate `slideDecks.generated.js`. |
| Styles | One CSS file per Explorer, `@import`ed in `styles.css`. |

## File structure

| File | Responsibility |
| --- | --- |
| `src/utils/slicing.js` | Pure slicing engine (backward/forward/dynamic slice, dice, intersect). |
| `src/data/slicingExamples.js` | The 3–4 authored example PDGs + traces. |
| `src/components/ProgramSlicingExplorer.js` (+ `.css`) | N1. |
| `src/components/SliceDicingExplorer.js` (+ `.css`) | N2. |
| `src/components/SliceCoverageExplorer.js` (+ `.css`) | N3. |
| `src/components/SliceRegressionExplorer.js` (+ `.css`) | N4. |
| `src/components/SlicePdgView.js` | Shared code+PDG render helper (used by all four). |
| `docs/slides/58-…61-…{en,zh-TW}.md` | The four lecture decks. |

## Testing

- `slicing.js` — pure, so thorough unit tests: backward/forward/dynamic slice on
  each example, last-definition rule for dynamic, dicing, `slicesIntersect`,
  edge cases (criterion on a constant, empty slice, self-data-dep loops).
- `slicingExamples.js` — an integrity test: every `dataDep`/`controlDep`
  references real statement ids; every `trace.steps` id exists; `defs`/`uses`
  are consistent with the `dataDeps` declared.
- Each Explorer — jsdom render + interaction tests (pick criterion → slice
  highlights; quiz answer flow), following existing Explorer test patterns.
- Integrity tests updated: `explorerTags.test.js`, `urlRouter.test.js`,
  `slideDecks.test.js` (count 57 → 61).

## Build order & decomposition

One spec (this document); implementation in dependency order, each its own
plan + PR, exactly as L1–L6 / M1–M6 were sequenced:

1. **N1** — `slicing.js` + `slicingExamples.js` + `SlicePdgView.js` +
   `ProgramSlicingExplorer` + section scaffolding (nav, tab bar, urlRouter,
   tags, deck #58). This PR stands up the section with one working tab.
2. **N2** — `SliceDicingExplorer` + deck #59 (adds the buggy example + traces).
3. **N3** — `SliceCoverageExplorer` + deck #60.
4. **N4** — `SliceRegressionExplorer` + deck #61.

N1 must land first — it ships the engine and example data N2–N4 depend on.

## Out of scope

- A general PDG builder for arbitrary user-entered code (authored PDGs only).
- Interprocedural slicing (examples are single functions).
- A real execution interpreter — dynamic traces are authored, not computed.
- Editing example programs in the UI — examples are fixed, authored data.
