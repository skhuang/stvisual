# Input Space Partitioning Explorer Design

**Date:** 2026-05-21
**Scope:** A new `isp` tab in the black-box section — an interactive Explorer
for Ammann & Offutt's Input Space Partitioning: input-domain modelling
(characteristics → blocks) and the six coverage criteria with their
subsumption lattice.

## Goal

The course already has the *pieces* of input partitioning — `ec`
(equivalence partitioning), `bva`, and `pairwise` in the black-box section —
but no explorer for Ammann & Offutt's actual **Input Space Partitioning (ISP)
framework**: modelling the input domain as *characteristics* each split into
*blocks*, then choosing a **coverage criterion** that decides which
block-combinations become tests. The genuinely missing, highly-visualizable
content is the **coverage-criteria hierarchy** — ACoC, TWC, PWC, ECC, BCC,
MBCC — their **subsumption relationships**, and the **test-count tradeoff**
(ACoC explodes as the product of block counts; ECC is minimal). The course's
own taxonomy names category #2 "Input Space (Black-box)" after this very
framework, so the explorer fills a named gap.

## Placement & structure

A new `isp` tab in the `blackbox` section, inserted **after `ec`** (ISP is the
framework that equivalence partitioning is a piece of, so they sit adjacent).
The black-box tabs become:
`bva · ec · isp · dt · st · mt · et · td · pairwise · ceg` (10 tabs).

One Explorer — `InputSpacePartitioningExplorer` — using the **closure-factory
style** of `PairwiseExplorer` (per-instance local state, not module-level).
It is a single interactive view, not a phase-stepper.

- **Input Domain Model (IDM)** — a set of *characteristics*, each partitioned
  into *blocks*. Ships with **2–3 authored example IDMs** (chips) — including
  A&O's canonical `findElement(list, target)` — **and is editable**: the
  learner adds/renames/removes characteristics and blocks and marks base
  block(s). Mirrors how `PairwiseExplorer` ships PRESETS yet allows editing.
- **Coverage criterion selector** — all six A&O criteria. Selecting one
  regenerates the test set live.
- **Live coverage engine** — a new pure module `src/utils/inputSpacePartition.js`
  computes each criterion's test set algorithmically, reusing `pairwise.js`'s
  `generatePairwise` for the PWC / t=2 case.

The existing `ec` tab is unchanged — it teaches equivalence partitioning as a
standalone idea; ISP needs its own surface for the criteria hierarchy.

## The coverage engine — `src/utils/inputSpacePartition.js`

A pure, DOM-free module. Notation: characteristics C₁…Cₙ, each Cᵢ with kᵢ
blocks; a *test* picks one block per characteristic.

| Criterion | Rule | Test count | Generator |
| --- | --- | --- | --- |
| **ACoC** All Combinations | every combination of blocks | ∏ kᵢ | Cartesian product |
| **TWC** T-Wise | every block-combination from every group of `t` characteristics appears ≥1× | covering-array size | greedy t-wise covering array; `t` ∈ 2…n |
| **PWC** Pair-Wise | TWC with t = 2 | pairwise covering-array size | delegates to `pairwise.js` `generatePairwise` |
| **ECC** Each Choice | every block of every characteristic appears ≥1× | max kᵢ | test j picks block `j mod kᵢ` of each Cᵢ |
| **BCC** Base Choice | one *base block* per characteristic → base test; then vary each Cᵢ through its non-base blocks, others held at base | 1 + Σ(kᵢ − 1) | base test + per-characteristic variations |
| **MBCC** Multiple Base Choice | ≥1 base blocks per characteristic; base tests = combinations of base choices; vary non-base blocks from each base test | M + M·Σ(kᵢ − mᵢ), M = ∏ mᵢ | as BCC, looped over each base test |

**Exports:** `allCombinations`, `tWise`, `pairWise`, `eachChoice`,
`baseChoice`, `multipleBaseChoice`. Each takes the characteristic list (and
`t` for `tWise`) and returns a test set — an array of tests, each test a
`{ characteristicId → blockId }` map. The test count is the array length.
`pairWise` delegates to the shipped, tested `generatePairwise`; `tWise`
handles t > 2 with a greedy covering-array algorithm.

**Subsumption lattice** — static pedagogical knowledge, not computed by the
engine: `ACoC → TWC → PWC → ECC` and `MBCC → BCC → ECC`. ECC is the weakest
(bottom); ACoC and MBCC are the two independent tops.

```
   ACoC          MBCC
    │             │
   TWC           BCC
    │             │
   PWC ───→ ECC ←─┘
```

`tWise` is a **greedy** covering array — minimal covering arrays are
NP-hard; greedy is the standard pedagogical approach and matches `pairwise.js`.

## UI layout

A single interactive view, top to bottom:

```
┌─ Input Space Partitioning Explorer ───────────────────────────┐
│ [findElement] [password validator] [date]   ← example chips   │
│                                                               │
│ INPUT DOMAIN MODEL                          [+ characteristic]│
│  list length    │ ⦿0  ◦1  ◦≥2          │   ← blocks (chips,   │
│  target found   │ ⦿absent ◦once ◦multi │     editable; ⦿ = base│
│  position       │ ⦿first ◦middle ◦last │     for BCC/MBCC)    │
│                                                               │
│ CRITERION:  [ACoC] [TWC t:▸3◂] [PWC] [ECC] [BCC] [MBCC]       │
│                                                               │
│ TEST SET (BCC — 7 tests)        │ COUNT COMPARISON            │
│  # │ length │ found  │ position │  ACoC ████████ 27          │
│  1 │ 0      │ absent │ first    │  TWC  ███ 9                 │
│  …                              │  ECC  █ 3                   │
│                                 │  BCC  ██ 7  ◀ selected      │
│ SUBSUMPTION:  ACoC→TWC→PWC→ECC ; MBCC→BCC→ECC  (BCC lit)      │
│ [Quiz ▸]                                                      │
└───────────────────────────────────────────────────────────────┘
```

**Components and test IDs:**

- Root: `data-testid="isp-explorer"`.
- **Example chips** (`isp-example-<id>`) — load an authored IDM; editing then
  mutates it in place (same as `PairwiseExplorer`).
- **IDM editor** — each characteristic a row (`isp-characteristic-<cid>`):
  editable name, blocks as editable/removable chips (`isp-block-<cid>-<bid>`)
  plus an add-block input (`isp-add-block-<cid>`), a base-block marker, and a
  remove-characteristic control. An `isp-add-characteristic` control. Base
  markers (⦿) are interactive only when the criterion is BCC/MBCC — dimmed
  otherwise.
- **Criterion selector** (`isp-criterion-<crit>` for `crit` ∈ `acoc twc pwc
  ecc bcc mbcc`) — six buttons; TWC carries a `t` stepper (`isp-twise-t`,
  range 2…n).
- **Test-set table** (`isp-test-set`, rows `isp-test-row-<n>`) — columns =
  characteristics, each cell = the chosen block, for the selected criterion.
  If a criterion explodes (e.g. ACoC on a large edited IDM), the table caps
  at 100 rows with an "…and N more" note.
- **Count comparison** (`isp-count`, bars `isp-count-bar-<crit>`) — all six
  counts side by side, selected one highlighted. ACoC/ECC/BCC/MBCC counts come
  from the formulas; PWC/TWC counts from generation (cheap for small IDMs).
- **Subsumption lattice** (`isp-lattice`, nodes `isp-lattice-node-<crit>`) —
  the static graph above; the selected criterion lit, with stronger (above)
  and weaker (below) relationships shown.
- **Quiz** (`isp-quiz-start` / `-submit` / `-close` / `-result`) — one MCQ;
  correct-answer key `'c'` per the repo convention.

**Validation** is structural only — every characteristic needs ≥1 block; ≥1
characteristic overall. For BCC exactly one base per characteristic; for MBCC
≥1. If the IDM is invalid for the selected criterion (e.g. BCC with a
base-less characteristic), the test-set area shows a gentle inline message
instead of a table. Semantic disjoint/complete checking is impossible from
labels and is out of scope.

## Data — `src/data/ispExamples.js`

The 2–3 authored IDMs. Following the `PairwiseExplorer` precedent, IDM content
(characteristic names, block labels) is plain strings — uniform with
user-edited content, so the editable runtime model has no key/string split;
only the preset's display name and all UI chrome are i18n'd.

```js
export const ISP_EXAMPLES = [
  {
    id: 'find-element',
    nameKey: 'isp.example.findElement',          // i18n — chip label only
    characteristics: [
      { name: 'list length',  blocks: ['0', '1', '≥2'],            baseIndex: 0 },
      { name: 'target found', blocks: ['absent', 'once', 'multi'], baseIndex: 0 },
      { name: 'position',     blocks: ['first', 'middle', 'last'], baseIndex: 0 },
    ],
  },
  // password-validator and date-validity IDMs — parallel shape.
];
```

On load, the component builds the runtime IDM by assigning per-instance ids to
characteristics and blocks (like `PairwiseExplorer`'s `freshParams`);
`baseIndex` seeds each characteristic's base block.

**Invariants enforced by `ispExamples.test.js`:** each IDM has ≥1
characteristic; each characteristic has ≥2 blocks; `baseIndex` is in range;
`nameKey` resolves in both `messages.en` and `messages.zh`.

## Wiring

| File | Change |
| --- | --- |
| `src/utils/urlRouter.js` | `TAB_SECTIONS.blackbox.tabs` — insert `'isp'` after `'ec'`; add `EXPLORER_TO_LOCATION.InputSpacePartitioningExplorer = { section:'blackbox', tab:'isp' }` |
| `src/data/explorerTags.js` | Add `InputSpacePartitioningExplorer` entry (`level:['unit']`, `technique:['equivalence','pairwise']`, `series:['blackbox']`, `difficulty:'intermediate'`, `source:['textbook']`); append to `SECTION_EXPLORERS.blackbox` |
| `src/i18n/dict.js` | The `isp` black-box tab label + all `isp.*` keys (criterion names, panel headers, example display names, quiz strings), en + zh |
| `src/app.js` | Import `createInputSpacePartitioningExplorer`; add to the `components` map; add `'isp'` to the black-box section's tab defs + the panel-build branch |
| `src/styles.css` | `@import` `InputSpacePartitioningExplorer.css` |
| `src/standalone.js` | Regenerate via `npm run build:standalone` — the `standalone-bundle` CI job enforces it |

## File structure

| File | Responsibility | Change |
| --- | --- | --- |
| `src/utils/inputSpacePartition.js` | Pure 6-criteria coverage engine | Create |
| `src/data/ispExamples.js` | Authored IDMs | Create |
| `src/components/InputSpacePartitioningExplorer.js` (+ `.css`) | The `isp` tab — closure-factory Explorer | Create |
| `src/tests/inputSpacePartition.test.js` | Engine unit tests — the critical correctness surface | Create |
| `src/tests/ispExamples.test.js` | IDM data invariants | Create |
| `src/tests/InputSpacePartitioningExplorer.test.jsx` | jsdom component tests | Create |
| `src/utils/urlRouter.js`, `src/data/explorerTags.js`, `src/i18n/dict.js`, `src/app.js`, `src/styles.css` | Wiring | Modify |
| `src/standalone.js` | Regenerated bundle | Modify (generated) |
| `src/tests/urlRouter.test.js` | Assert `InputSpacePartitioningExplorer` routing | Modify |

`InputSpacePartitioningExplorer.css` uses an `isp-*` class prefix and is its
own file (the black-box explorers each own their CSS).

## Testing

- **`inputSpacePartition.test.js`** — the critical surface. For each
  generator: the output genuinely *satisfies* its criterion (ECC hits every
  block; PWC covers every block-pair across every characteristic pair;
  `tWise(_, t)` covers every t-tuple; BCC = the base test plus exactly
  Σ(kᵢ−1) single-block variations; ACoC = the full product; MBCC has the
  right base-test and variation structure); test counts match the formulas in
  §"The coverage engine"; subsumption sanity — an ACoC set satisfies PWC, a
  PWC set satisfies ECC, a BCC set satisfies ECC.
- **`ispExamples.test.js`** — the IDM data invariants above.
- **`InputSpacePartitioningExplorer.test.jsx`** — jsdom: mounts with the root
  testid; example chips load the IDMs; the six criterion buttons regenerate
  the test set; the test-set row count matches the selected criterion's
  count; editing the IDM (add a block) shifts the counts; the count
  comparison renders six bars; BCC base-block selection works; the quiz
  flow scores correctly.
- `urlRouter.test.js` — `?explorer=InputSpacePartitioningExplorer` resolves to
  `{ section:'blackbox', tab:'isp' }`.
- `explorerTags.test.js` — auto-covered: the component-glob integrity test
  forces the new explorer to be registered.
- Full suite stays green; `npm run build:standalone` regenerates cleanly.

## Out of scope

- A slide deck — a follow-up, as the exploit section deferred its deck.
- Semantic verification that blocks are truly disjoint and complete —
  impossible from labels; validation stays structural.
- Minimal covering arrays for TWC — NP-hard; the engine uses a greedy
  covering array, the standard pedagogical approach.
- Changing or merging the existing `ec` tab.
- Persisting an edited IDM across reloads — the editable model is runtime
  state only; reloading resets to the authored presets.

## PR sequencing

The exploit-section branches are merged; `main` is clean. This Explorer ships
on its own branch off `main`, its own PR.
