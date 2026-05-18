# N2 — Fault Localization / Dicing Design

**Date:** 2026-05-18
**Scope:** The second tab of the Slicing section (Plan.md §N) — the
`SliceDicingExplorer`. Builds on N1 (PR #284).

## Goal

Teach **program dicing** — localizing a fault by subtracting "innocent" slices
from a failing slice — as the `dicing` tab of the `slicing` section. The tab is
currently a placeholder; N2 makes it live.

Two dicing models, as two switchable modes in one Explorer:

1. **Static dicing (multi-output).** One buggy run of a program with several
   output variables. The dice of the wrong output is its slice minus the union
   of the correct outputs' slices. Static slices suffice because distinct
   output variables genuinely have distinct static slices. (The classic
   Lyle–Weiser 1987 "program dicing".)
2. **Dynamic dicing (multi-input).** One buggy program, one output, several test
   inputs — one failing, the rest passing. The dice is the failing run's
   dynamic slice minus the union of the passing runs' dynamic slices. Static
   slices are input-independent, so a *static* dice across inputs is empty —
   which is itself the lesson for why dynamic slicing matters in fault
   localization.

## Context

N1 (merged, PR #284) shipped:
- `src/utils/slicing.js` — `backwardSlice(pdg, criterion)`, `forwardSlice`,
  `dynamicSlice(pdg, trace, criterion)`, `programDice(failingSlice, passingSlices)`,
  `slicesIntersect`. All pure.
- `src/data/slicingExamples.js` — authored PDGs (`SLICING_EXAMPLES`,
  `getSlicingExample`).
- `src/components/SlicePdgView.js` — `renderSlicePdgView(example, sliceSet, options)`,
  source-with-slice-highlight + SVG dependence graph.
- `src/components/ProgramSlicingExplorer.js` — the N1 tab.
- The `slicing` section: 4 tabs in `urlRouter.js` `TAB_SECTIONS`
  (`program` live; `dicing`/`coverage`/`regression` placeholder), section
  wiring in `app.js`, `explorerTags.js`, `i18n/dict.js`.

A PDG is `{ statements:[{id,line,text,defs,uses,kind?}], controlDeps:[[from,to]],
dataDeps:[[from,to,variable]], traces:[{id,...,steps}] }`. A criterion is
`{stmtId, variable}`.

## Engine — no changes

`programDice(failingSlice, passingSlices)` is generic over slice `Set`s
regardless of how they were produced. Static mode passes it the
`backwardSlice` of each output variable; dynamic mode passes it the
`dynamicSlice` of each trace. **`slicing.js` is not modified.** Any
dice-formatting helper N2 needs is local to the Explorer.

## Example data — new file `src/data/dicingScenarios.js`

N1's `slicingExamples.js` is left untouched. A dicing scenario is a PDG (same
shape as N1's examples) plus dicing metadata. Two scenarios:

### `summary-stats` — static, multi-output

```js
{
  id: 'summary-stats',
  mode: 'static',
  titleKey: 'dicing.scenario.summaryStats',
  language: 'javascript',
  source: [
    'function summaryStats(nums) {',          // 1
    '  let total = 0;',                        // 2
    '  let highest = nums[0];',                // 3
    '  for (const n of nums) {',               // 4
    '    total = total + n;',                  // 5
    '    if (n > highest) {',                  // 6
    '      highest = total;',                  // 7  BUG: should be highest = n
    '    }',                                   // 8
    '  }',                                     // 9
    '  const mean = total / nums.length;',     // 10
    '  return { total, mean, highest };',      // 11
  ],
  statements: [ /* s2,s3,s4,s5,s6,s7,s10 + three output statements */ ],
  controlDeps: [ /* s4 -> s5,s6 ; s6 -> s7 */ ],
  dataDeps: [ /* total/highest/n/mean/nums chains */ ],
  // The observed output variables, each with the statement that returns it.
  outputs: [
    { variable: 'total',   stmtId: 'out-total' },
    { variable: 'mean',    stmtId: 'out-mean' },
    { variable: 'highest', stmtId: 'out-highest' },
  ],
  wrongOutput: 'highest',           // the output whose value is incorrect
  bug: { stmtId: 's7', note: 'assigns total, not n' },
}
```

Each output is its own `kind:'output'` statement (`return` is modelled as three
single-variable output statements `out-total` / `out-mean` / `out-highest`, so
each output variable can be sliced independently). `dice(highest)` =
`backwardSlice(out-highest)` − `backwardSlice(out-total)` − `backwardSlice(out-mean)`
→ the statements unique to `highest`, including the buggy `s7`.

### `fare` — dynamic, multi-input

```js
{
  id: 'fare',
  mode: 'dynamic',
  titleKey: 'dicing.scenario.fare',
  language: 'javascript',
  source: [
    'function fare(age, peak) {',     // 1
    '  let price = 10;',              // 2
    '  if (age < 18) {',              // 3
    '    price = 5;',                 // 4
    '  } else if (age >= 65) {',      // 5
    '    price = 3;',                 // 6
    '  }',                            // 7
    '  if (peak) {',                  // 8
    '    price = price + 2 + 2;',     // 9  BUG: should be price + 2
    '  }',                            // 10
    '  return price;',                // 11
  ],
  statements: [ /* s2,s3,s4,s5,s6,s8,s9 + output s11 */ ],
  controlDeps: [ /* s3 -> s4 ; s5 -> s6 ; s8 -> s9 */ ],
  dataDeps: [ /* price chains */ ],
  criterion: { stmtId: 's11', variable: 'price' },
  // Traces tagged with the run's outcome and its expected/actual output.
  traces: [
    { id: 'adult-peak',  outcome: 'fail', expected: 12, actual: 14,
      inputLabel: 'age=30, peak=true',  steps: [/* ... s8,s9 ... */] },
    { id: 'adult-off',   outcome: 'pass', expected: 10, actual: 10,
      inputLabel: 'age=30, peak=false', steps: [/* ... no s9 ... */] },
    { id: 'child-off',   outcome: 'pass', expected: 5,  actual: 5,
      inputLabel: 'age=12, peak=false', steps: [/* ... s4 ... */] },
    { id: 'senior-off',  outcome: 'pass', expected: 3,  actual: 3,
      inputLabel: 'age=70, peak=false', steps: [/* ... s6 ... */] },
  ],
  bug: { stmtId: 's9', note: 'adds 2 twice' },
}
```

`dice` = `dynamicSlice(fail trace)` − ∪`dynamicSlice(pass traces)`. The passing
traces between them exercise every age branch, so those subtract out; the
peak-branch `s9` is unique to the failing run → the dice.

Exports: `DICING_SCENARIOS` (array) and `getDicingScenario(id)`. An integrity
test asserts: every dependence edge / trace step references a real statement
id; `bug.stmtId` exists; for `static` scenarios every `outputs[].stmtId` exists
and `wrongOutput` is one of them; for `dynamic` scenarios exactly one trace has
`outcome:'fail'` and `bug.stmtId` lies inside the computed dice.

## The Explorer — `src/components/SliceDicingExplorer.js` (+ `.css`)

`createSliceDicingExplorer()` — factory mirroring `ProgramSlicingExplorer`
(module `state`, `render()`+`bindEvents()`, quiz panel, `onLocaleChange`). Root
`data-testid="slice-dicing-explorer"`.

- **Mode toggle** — `data-testid="dicing-mode-static"` / `dicing-mode-dynamic`.
  Each mode shows only its scenario(s).
- **Scenario chips** — `data-testid="dicing-scenario-<id>"`.
- **Static mode:** an output picker (`data-testid="dicing-output-<variable>"`)
  to choose the wrong output; the others are the "correct" set. Defaults to the
  scenario's `wrongOutput`.
- **Dynamic mode:** the four traces listed with their `outcome` badge; the
  `fail` trace is the dice subject, the `pass` traces are the subtrahend.
- **Computation:** static — `programDice(backwardSlice(wrong), [backwardSlice(correct)…])`;
  dynamic — `programDice(dynamicSlice(failTrace), passTraces.map(dynamicSlice))`.
- **Render:** reuse `renderSlicePdgView` to show code + PDG; the failing slice
  and the passing union get a two-tone highlight, the **dice** the strongest
  highlight. Pass the dice as the highlight `Set`; the view already supports a
  highlight set, and `SlicePdgView` gains an optional second-tone parameter (a
  small, backward-compatible extension — see below).
- **Detail panel** `data-testid="dicing-detail"`: the dice statement count, a
  confirmation that `bug.stmtId` is in the dice, and — dynamic mode only — the
  note that the static dice across these inputs would be empty.
- **Quiz** — one multiple-choice question per mode ("which statement does the
  dice point at?"), answer-key convention `'c'`, mirroring `ProgramSlicingExplorer`.

### `SlicePdgView` extension

`renderSlicePdgView(example, sliceSet, options)` gains an optional
`options.secondary` — a `Set` of statement ids rendered with a second,
lighter highlight class (`slice-stmt--ctx` / `pdg-node--ctx`). When absent,
behaviour is identical to N1 (backward-compatible; N1's tests and the
ProgramSlicingExplorer are unaffected). N2 uses it to show the passing-union
under the dice.

## Wiring

| Concern | Change |
| --- | --- |
| `app.js` | The `dicing` panel renders `createSliceDicingExplorer()` instead of the placeholder; add `dicing: createSliceDicingExplorer()` to the `components` map and the import. |
| `urlRouter.js` | `EXPLORER_TO_LOCATION.SliceDicingExplorer = { section:'slicing', tab:'dicing' }`. (`TAB_SECTIONS.slicing` already lists `dicing`.) |
| `explorerTags.js` | `SliceDicingExplorer` entry: `level:['unit']`, `technique:['slicing']`, `series:['slicing']`, `difficulty:'intermediate'`. |
| i18n `dict.js` | `dicing.*` UI keys + `dicing.scenario.*`, en + zh. |
| `styles.css` | `@import` `SliceDicingExplorer.css`. |
| Slides | Deck **#59** `59-fault-localization-dicing.{en,zh-TW}.md`; register in `build-slide-decks.mjs` (`section:'slicing'`); regenerate `slideDecks.generated.js`; deck-count test 58 → 59. |

## File structure

| File | Responsibility | Change |
| --- | --- | --- |
| `src/data/dicingScenarios.js` | Two authored dicing scenarios | Create |
| `src/components/SliceDicingExplorer.js` (+ `.css`) | The `dicing` tab | Create |
| `src/components/SlicePdgView.js` | Optional `secondary` highlight set | Modify (backward-compatible) |
| `src/app.js`, `src/utils/urlRouter.js`, `src/data/explorerTags.js`, `src/i18n/dict.js`, `src/styles.css` | Wiring | Modify |
| `docs/slides/59-fault-localization-dicing.{en,zh-TW}.md` | Deck #59 | Create |
| `scripts/build-slide-decks.mjs`, `src/data/slideDecks.generated.js` | Register deck | Modify |
| `src/tests/dicingScenarios.test.js`, `src/tests/SliceDicingExplorer.test.jsx` | Tests | Create |
| `src/tests/SlicePdgView.test.jsx`, `urlRouter.test.js`, `slideDecks.test.js` | Extend | Modify |
| `Plan.md` | Mark N2 done | Modify |

## Testing

- `dicingScenarios.js` — integrity test (edges/traces reference real ids;
  `bug.stmtId` lands in the computed dice for each scenario; static scenarios'
  `outputs`/`wrongOutput` valid; dynamic scenarios have exactly one `fail`
  trace).
- `SlicePdgView` — a test that `options.secondary` adds the `--ctx` class and
  that omitting it reproduces N1 behaviour.
- `SliceDicingExplorer` — jsdom: mode toggle, scenario select, the dice
  highlights, the bug-confirmation text.
- `?explorer=SliceDicingExplorer` routing test; deck-count test → 59.

## Out of scope

- Statistical fault localization (Tarantula / Ochiai spectra) — dicing only.
- Ranking statements within the dice — the dice is a plain set.
- N3 / N4 — their own specs.
- A real interpreter — traces remain authored.
