# Search-Based Software Testing — Design

**Date:** 2026-05-21
**Status:** Approved — ready for implementation planning

## Goal

Add Search-Based Software Testing (SBST) to the stvisual course as a complete
new section: an interactive explorer with three tabs, a shared search engine,
a bilingual Marp slide deck, and captured tool-demonstration screenshots.

SBST reframes test generation as an optimisation problem — a metaheuristic
search guided by a fitness function. It is genuinely distinct from the existing
`testgen` section (deck #12), which does deterministic coverage-driven minimal
test generation via greedy set cover. SBST belongs alongside the other automated
input-generation methods (symbolic execution, concolic, fuzzing).

## Placement

- **New section id:** `sbst`, in the `generation` taxonomy category.
- **Companion route:** `/section-sbst`.
- **Three tabs:** `branch`, `compare`, `suite`.

## Architecture

```
src/utils/searchBasedTesting.js   — shared search engine (RNG, fitness, metaheuristics)
src/data/sbstExamples.js          — instrumented example SUTs
src/components/SbstBranchExplorer.js   + .css   — tab 1
src/components/SbstCompareExplorer.js  + .css   — tab 2
src/components/SbstSuiteExplorer.js    + .css   — tab 3
docs/slides/65-search-based-testing.{en,zh-TW}.md  — deck #65
scripts/capture-sbst-screenshots.mjs   — screenshot capture
```

The three explorers share one engine. They follow existing explorer conventions:
a closure/factory `create…Explorer()` returning a root element with a unique
`data-testid`, `onLocaleChange` re-render, predict-mode self-test and a quiz.

### Shared engine — `src/utils/searchBasedTesting.js`

- **Seeded RNG.** A deterministic pseudo-random generator (e.g. mulberry32).
  Every search run takes an explicit seed so unit tests and captured
  screenshots are reproducible.
- **Fitness function.** For a target branch, fitness combines:
  - **Approach level** — how many of the target branch's enclosing decisions
    the execution diverged from before reaching the target. Lower is closer.
  - **Branch distance** — at the decision where execution diverged, how close
    the predicate was to taking the desired outcome, normalised to [0, 1) via
    `d / (d + 1)`. Standard Korel/Tracey branch-distance functions per operator:
    `a == b` → `|a − b|`; `a != b` → `0 if a≠b else 1`; `a < b` → `a − b + 1 if a≥b else 0`;
    `a <= b` → `a − b if a>b else 0`; `a > b` and `a >= b` symmetric.
  - Combined cost to **minimise**: `approachLevel + normalisedBranchDistance`.
    A cost of 0 means the target branch is covered.
- **Metaheuristic operators.** Tournament selection, crossover (one-point on the
  input vector), and mutation (per-component perturbation). Each is a small pure
  function taking the RNG.
- **Search drivers**, each returning a per-iteration history (best cost, best
  individual, evaluation count) so the explorers can replay generation by
  generation:
  - `randomSearch` — sample inputs uniformly.
  - `hillClimb` — neighbourhood search; gets trapped in local optima.
  - `geneticAlgorithm` — population, elitism, selection/crossover/mutation.
- **Whole-suite fitness.** `suiteCost` = sum over all branches of the best
  branch cost achieved by any test in the suite; `suiteCoverage` = fraction of
  branches with cost 0. Plus a whole-suite GA driver.

### Example SUTs — `src/data/sbstExamples.js`

A small set (3–4) of authored example programs, each an **instrumented
function**: it takes the input vector plus a `probe(branchId, op, lhs, rhs, taken)`
callback and calls `probe` at every decision point, reporting the operator and
operand values. The engine runs the instrumented function, collects the branch
trace, and computes approach level + branch distance for any target branch.
This mirrors the instrumentation approach of the existing `concolicExecution.js`.

Each example carries: a display name, the source text (for the code panel), the
input-vector schema (names + numeric ranges), the instrumented function, the
list of branches, and a designated hard-to-reach target branch. At least one
example must contain a nested guard whose target branch is hard for random
search but reachable by guided search (e.g. `if (x == 17) { if (y > 100) … }`).

## The three explorer tabs

### Tab 1 — GA branch search (`SbstBranchExplorer`)

**Root testid:** `sbst-branch-explorer`.

A genetic algorithm evolving a population of input vectors toward covering one
target branch — the canonical SBST teaching example.

- Example-picker chips; a code panel showing the SUT source with the target
  branch highlighted.
- A GA run over the selected example. Controls: **Next generation** (single
  step), **Run to coverage** (auto-advance until covered or budget exhausted),
  **Reset**; a generation counter.
- Population panel: every individual's input values and fitness cost, the
  best-so-far highlighted; a success state when an individual reaches cost 0
  (target branch covered).
- A parallel **random-search baseline** panel under the same evaluation budget,
  visibly lagging the GA.
- A best-cost-over-generations sparkline.
- Predict-mode self-test and a quiz, per existing explorer convention.

### Tab 2 — Metaheuristic comparison (`SbstCompareExplorer`)

**Root testid:** `sbst-compare-explorer`.

The same target-branch goal solved by three strategies side by side.

- Three strategies: random search, hill climbing, genetic algorithm.
- Three best-cost-over-evaluations curves overlaid; each strategy's panel shows
  whether and at which evaluation count it reached cost 0, or that it exhausted
  the budget.
- The pedagogical point is explicit in the UI copy: hill climbing stalls in a
  local optimum, the GA's population diversity escapes it, random search is
  worst.
- Controls: example-picker, **Run**, **Reset**; predict-mode and quiz.

### Tab 3 — Whole-suite evolution (`SbstSuiteExplorer`)

**Root testid:** `sbst-suite-explorer`.

EvoSuite-style whole-test-suite generation: an individual is an entire test
suite, fitness is total branch coverage.

- A whole-suite GA over the selected example. Controls: **Next generation**,
  **Run to coverage**, **Reset**; generation counter.
- A coverage gauge climbing generation by generation; the evolving suite listed
  with the branches each test covers; the final suite shown after a minimisation
  pass that drops redundant tests.
- Predict-mode and quiz.

## Slide deck #65 — Search-Based Software Testing

**Files:** `docs/slides/65-search-based-testing.{en,zh-TW}.md`. Bilingual Marp,
~20 slides, modelled on deck #63 (`63-exploit-generation.en.md`): front-matter,
title slide with a `Companion tool: /section-sbst` link, concept slides, a block
of `## Tool demonstration — …` screenshot slides, `## Summary`, `## Further reading`.

Concept outline:
1. Title.
2. What is SBST? — test generation reframed as search / optimisation.
3. The search formulation — search space (inputs), objective (coverage); no
   enumeration of source-derived requirements.
4. The fitness function — approach level + branch distance.
5. Branch-distance formulas — the per-operator Korel/Tracey table.
6. Random search — the unguided baseline.
7. Hill climbing — neighbourhood search and the local-optimum trap.
8. Genetic algorithms — population, selection, crossover, mutation.
9. Escaping local optima — why population diversity helps.
10. Whole-test-suite generation — the EvoSuite formulation.
11. Tools & foundations — EvoSuite; Korel's branch-distance work; McMinn's SBST survey.
12–18. Tool demonstration — 7 screenshot slides (see below).
19. Summary.
20. Further reading.

## Screenshots

Captured now (consistent with decks #63/#64). A new
`scripts/capture-sbst-screenshots.mjs`, mirroring `capture-exploit-screenshots.mjs`:
spawns the local server, drives each explorer via `?explorer=<ComponentName>`,
runs twice (`SLIDE_LOCALE=zh` and `=en`), writes PNGs to `docs/assets/slides/`
(zh bare names, en `-en` suffix). `build:slide-decks` copies referenced PNGs to
`public/slide-assets/`.

Seven shots (base names):

| Base name | Explorer | State |
|---|---|---|
| `sbst-branch-start` | `SbstBranchExplorer` | initial population, generation 0 |
| `sbst-branch-covered` | `SbstBranchExplorer` | run to coverage — target branch covered |
| `sbst-compare-curves` | `SbstCompareExplorer` | three strategies run, curves overlaid |
| `sbst-compare-stuck` | `SbstCompareExplorer` | hill climbing trapped in a local optimum |
| `sbst-suite-start` | `SbstSuiteExplorer` | early generation, low coverage |
| `sbst-suite-covered` | `SbstSuiteExplorer` | evolved suite at full coverage |
| `sbst-suite-minimised` | `SbstSuiteExplorer` | final minimised suite |

Each search reaches a deterministic state via the seeded RNG, so screenshots are
reproducible.

## Registration changes

| File | Change |
|---|---|
| `src/data/sectionTaxonomy.js` | Append `'sbst'` to the `generation` category's `sectionIds` |
| `src/utils/urlRouter.js` | Add `SbstBranchExplorer`/`SbstCompareExplorer`/`SbstSuiteExplorer` → `{ section: 'sbst', tab: … }` to `EXPLORER_TO_LOCATION`; add the `sbst` section's tab config |
| `src/app.js` | Add the `section-sbst` `<section>`, its `data-slot`, the `sbst-tab-row` tab wiring, and component construction |
| `src/i18n/dict.js` | Add `en` + `zh` strings: section/tab titles, all explorer UI copy, deck-independent labels |
| `scripts/build-slide-decks.mjs` | Append `{ base: '65-search-based-testing', id: 'search-based-testing', num: 65, section: 'sbst' }` to `DECKS` |
| `src/data/slideDecks.generated.js` | Regenerated by `npm run build:slide-decks` |
| `src/standalone.js` | Regenerated by `npm run build:standalone` |
| `src/tests/slideDecks.test.js` | Deck-count assertion 64 → 65 |

## Testing

- **Engine unit tests** (`src/tests/searchBasedTesting.test.js`): branch-distance
  formulas per operator; approach-level computation; fitness combination; seeded
  RNG reproducibility; GA converges on the nested-guard example within a bounded
  budget; hill climbing demonstrably stalls in a local optimum where the GA
  succeeds; whole-suite coverage reaches 100% on a small example.
- **Explorer tests** (one test file per explorer): render, example switching,
  step/run/reset controls, the covered/success state, predict-mode and quiz —
  mirroring existing explorer test files.
- **Deck data** (`slideDecks.test.js`): passes with the 65-deck assertion.
- `npm run build:slide-decks` (65 decks), `npm run test:run`, and
  `npm run build:standalone` (committed up to date) all pass.

## Out of scope

- No real-language (Java/Python) SUTs — examples are authored instrumented JS.
- No multi-objective search (e.g. NSGA-II); single aggregated fitness only.
- No changes to the existing `testgen` section or deck #12.
- No `.pptx` exports (recent decks ship markdown-only).
- No new taxonomy category — `sbst` joins the existing `generation` category.

## Implementation staging note

The implementation plan should stage the work: the shared engine + example data
first (fully unit-tested), then the three explorers one tab at a time, then the
deck + screenshots + registration. The engine is the foundation every tab
depends on.
