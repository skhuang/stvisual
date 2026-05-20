# Section Taxonomy Design

**Date:** 2026-05-20
**Scope:** Re-organise the course's 22 sections into a coherent 8-category
display taxonomy following Ammann & Offutt's test-criterion-source axis.
Display-layer only — section ids and URLs stay stable.

## Goal

The course currently exposes 22 flat section ids in `learningSectionsConfig`
that drive a 22-button nav and a 10-group overview, where 7 of the overview
groups are singletons. The grouping is heterogeneous (technique like
`syntax`/`fuzz`/`slicing`, lifecycle phase like `agile`/`tdd`, quality like
`codecov`/`advanced`), so the nav order and the overview's group split don't
reflect a coherent pedagogy.

Introduce a single 8-category taxonomy that organises every section along one
axis (test-criterion source, per Ammann & Offutt's *Introduction to Software
Testing*), surfaces in both the nav and the overview page, and leaves every
section id, URL, anchor, test selector, and deck mapping unchanged.

## The 8-category taxonomy

| # | Category id | en label | zh label | Section ids (in order) |
| --- | --- | --- | --- | --- |
| 1 | `foundations` | Foundations | 基礎 | `methods`, `flow`, `types`, `codecov` |
| 2 | `input-space` | Input Space (Black-box) | 輸入空間（黑盒） | `blackbox`, `pbt` |
| 3 | `graph-model` | Graph, Model & Dependence Coverage | 圖形／模型／相依性覆蓋 | `graph`, `mbt`, `slicing` |
| 4 | `logic` | Logic Coverage | 邏輯覆蓋 | `logic`, `groupth` |
| 5 | `syntax` | Syntax-Based Testing | 語法基測試 | `syntax` |
| 6 | `generation` | Test Generation | 測試生成 | `symbex`, `concolic`, `fuzz`, `testgen` |
| 7 | `process` | Process & Discipline | 流程與紀律 | `tdd`, `acceptance`, `agile`, `inttest` |
| 8 | `strategy` | Strategy & Quality | 策略與品質 | `advanced`, `rbt` |

**Total:** 22 section ids → 8 categories. Each section id appears in exactly
one category.

**Pedagogical placement notes:**

- `pbt` lives in **Input Space** because the course's PBT decks teach
  property-driven input invariants (input-space partitioning), not generation
  infrastructure.
- `mbt` and `slicing` join `graph` in **Graph/Model/Dependence** because
  FSM/EFSM coverage is graph coverage on a state model and slicing is
  dependence-graph coverage (PDG/DDG/SDG) — one conceptual family.
- `groupth` (algebraic-equivalence-class derivation) joins `logic` in **Logic
  Coverage**, matching the existing `overviewGroups.coverage` convention that
  groups it next to `logic`.
- `codecov` lives in **Foundations** as the overarching coverage concept; the
  criterion-specific decks (graph/logic/syntax) live in their own categories.
- `inttest` lives in **Process & Discipline** because the course teaches
  integration as a *practice* (when/how to integrate), not as a coverage level.

## Surfaces that change

**A. Overview page.** `app.js:112` defines `overviewGroups` — today, 10 groups
with 7 singletons (`blackbox`, `advanced`, `acceptance`, `mbt`, `agile`,
`slicing`, `tdd`). Replace the array with a derivation from the new
taxonomy; the existing renderer at `app.js:1192` is unchanged. The overview
page renders 8 group headings instead of 10.

**B. Nav bar.** `app.js:1247` renders 22 flat buttons from
`learningSectionsConfig`. The new nav inserts a small category-label header
between each group's buttons, producing visually grouped 8 categories without
adding any second-tier click target. The nav button data-testids
(`nav-btn-<id>`) are unchanged so every existing test selector still works.

**C. Section DOM order + nav order.** The `<section data-testid="section-…">`
blocks in `app.js:233–254` and the entries in `learningSectionsConfig`
(`app.js:79–103`) are reordered to walk the 8 categories in their
pedagogical order:

```
foundations:  methods, flow, types, codecov
input-space:  blackbox, pbt
graph-model:  graph, mbt, slicing
logic:        logic, groupth
syntax:       syntax
generation:   symbex, concolic, fuzz, testgen
process:      tdd, acceptance, agile, inttest
strategy:     advanced, rbt
```

DOM order matches nav order matches overview order — the page reads in
pedagogical sequence.

## What does NOT change

- **Section ids** — `methods`, `blackbox`, `slicing`, `tdd`, etc. stay
  verbatim. No id renames.
- **URL parameters** — `?section=X&tab=Y` keeps working unchanged.
- **Hash anchors** — `#section-blackbox`, etc. still resolve.
- **Saved state** — `localStorage['stvisual.activeSection']` still resolves to
  the same section.
- **`TAB_SECTIONS`** in `src/utils/urlRouter.js` — untouched.
- **`EXPLORER_TO_LOCATION`** in `src/utils/urlRouter.js` — untouched.
- **`SECTION_EXPLORERS`** in `src/data/explorerTags.js` — untouched.
- **Deck-to-section mapping** in `scripts/build-slide-decks.mjs` — untouched.
- **Deck markdown** in `docs/slides/*.md` — untouched.
- **Test selectors** — `nav-btn-<id>`, `section-<id>`, all data-testids
  unchanged.
- **Explorer components** — unchanged.

## Architecture

### New module — `src/data/sectionTaxonomy.js`

Single source of truth for the taxonomy and the derived section order. Both
the nav config and the overview-groups config derive from this module — no
more duplicating section ids in two places.

```js
// Single source of truth for the 8-category course taxonomy.
// Section ids are stable identifiers (URLs, anchors, tests depend on them);
// categories are a display-layer grouping above sections.
export const SECTION_TAXONOMY = [
  { id: 'foundations',  labelKey: 'taxonomy.foundations',
    sectionIds: ['methods', 'flow', 'types', 'codecov'] },
  { id: 'input-space',  labelKey: 'taxonomy.input-space',
    sectionIds: ['blackbox', 'pbt'] },
  { id: 'graph-model',  labelKey: 'taxonomy.graph-model',
    sectionIds: ['graph', 'mbt', 'slicing'] },
  { id: 'logic',        labelKey: 'taxonomy.logic',
    sectionIds: ['logic', 'groupth'] },
  { id: 'syntax',       labelKey: 'taxonomy.syntax',
    sectionIds: ['syntax'] },
  { id: 'generation',   labelKey: 'taxonomy.generation',
    sectionIds: ['symbex', 'concolic', 'fuzz', 'testgen'] },
  { id: 'process',      labelKey: 'taxonomy.process',
    sectionIds: ['tdd', 'acceptance', 'agile', 'inttest'] },
  { id: 'strategy',     labelKey: 'taxonomy.strategy',
    sectionIds: ['advanced', 'rbt'] },
];

// Flat section-id order derived from the taxonomy — drives nav order and the
// <section> DOM order. The 'all' meta-section is prepended in app.js.
export const SECTION_ORDER = SECTION_TAXONOMY.flatMap((c) => c.sectionIds);
```

### `src/app.js` changes

- Import `SECTION_TAXONOMY` and `SECTION_ORDER` from the new module.
- Replace the hand-maintained `learningSectionsConfig` (lines 79–103) with a
  derivation:
  ```js
  const learningSectionsConfig = [
    { id: 'all', key: 'section.all' },
    ...SECTION_ORDER.map((id) => ({ id, key: `section.${id}` })),
  ];
  ```
- Replace `overviewGroups` (lines 112–153) with a derivation:
  ```js
  const overviewGroups = SECTION_TAXONOMY.map((c) => ({
    key: c.labelKey,
    sectionIds: c.sectionIds,
  }));
  ```
- Reorder the `<section data-testid="section-…">` blocks (lines 233–254) and
  the `sections` object lookup (lines 280–303) so DOM order matches
  `SECTION_ORDER`. Section ids unchanged; only positions change.
- Update `renderNav` (line 1236) so the button row interleaves a small
  category-label header (`<div class="nav-category" data-testid="nav-category-<id>">${t(category.labelKey)}</div>`) before each category's buttons. The
  `all` button stays at the top, outside any category.

### `src/i18n/dict.js` changes

Add 8 new keys per locale (16 entries total):

```js
// en (around line 23, with the existing section.* keys)
'taxonomy.foundations':  'Foundations',
'taxonomy.input-space':  'Input Space (Black-box)',
'taxonomy.graph-model':  'Graph, Model & Dependence Coverage',
'taxonomy.logic':        'Logic Coverage',
'taxonomy.syntax':       'Syntax-Based Testing',
'taxonomy.generation':   'Test Generation',
'taxonomy.process':      'Process & Discipline',
'taxonomy.strategy':     'Strategy & Quality',

// zh (around line 2713, with the existing section.* keys)
'taxonomy.foundations':  '基礎',
'taxonomy.input-space':  '輸入空間（黑盒）',
'taxonomy.graph-model':  '圖形／模型／相依性覆蓋',
'taxonomy.logic':        '邏輯覆蓋',
'taxonomy.syntax':       '語法基測試',
'taxonomy.generation':   '測試生成',
'taxonomy.process':      '流程與紀律',
'taxonomy.strategy':     '策略與品質',
```

Remove the 10 obsolete `overview.group.*` keys (`overview.group.foundations`,
`overview.group.coverage`, `overview.group.execution`, `overview.group.blackbox`,
`overview.group.advanced`, `overview.group.acceptance`, `overview.group.mbt`,
`overview.group.agile`, `overview.group.slicing`, `overview.group.tdd`) per
locale (20 entries total). Verify by `grep "overview.group" src/` returns no
hits outside `dict.js` itself before deleting.

### `src/styles.css` changes

Add CSS for the category-label rows so each category starts on its own line
in the nav:

```css
.nav-category {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem;
  margin-top: 0.5rem;
  width: 100%;
  /* Forces a row break in the flex-wrap nav, so each category starts
     on its own line. */
  flex-basis: 100%;
}
.nav-category:first-of-type {
  margin-top: 0;
}
```

The exact selector and `flex-basis: 100%` mechanism depends on the existing
`.app-nav__buttons` layout. If `.app-nav__buttons` is `display: flex;
flex-wrap: wrap`, `flex-basis: 100%` on a child forces a wrap. If the existing
layout uses `display: grid`, adjust the rule to use `grid-column: 1 / -1` to
span all columns. The plan task confirms the existing layout before writing
the CSS.

## File structure

| File | Responsibility | Change |
| --- | --- | --- |
| `src/data/sectionTaxonomy.js` | Single source of truth for the 8-category taxonomy + derived `SECTION_ORDER` | Create |
| `src/app.js` | Wire `learningSectionsConfig`, `overviewGroups`, the `<section>` DOM order, and `renderNav` to the new taxonomy | Modify |
| `src/i18n/dict.js` | Add 16 `taxonomy.*` keys; remove 20 obsolete `overview.group.*` keys | Modify |
| `src/styles.css` | Add `.nav-category` rule | Modify |
| `src/tests/sectionTaxonomy.test.js` | Integrity test: every section id in `learningSectionsConfig` appears exactly once in `SECTION_TAXONOMY` | Create |

## Testing

- **Existing tests** stay green. `urlRouter.test.js`, `explorerTags.test.js`,
  `slideDecks.test.js`, and every Explorer component test continue to pass
  because TAB_SECTIONS, EXPLORER_TO_LOCATION, SECTION_EXPLORERS, and deck
  section ids are unchanged.
- **New integrity test** (`src/tests/sectionTaxonomy.test.js`): asserts that
  the set of section ids in `learningSectionsConfig` (minus the `'all'`
  meta-section) equals the union of all `SECTION_TAXONOMY[*].sectionIds`,
  with no duplicates and no orphans. Catches drift if someone adds a section
  in the future without categorising it.
- **Manual:** `npm run dev` → confirm (1) nav renders 8 category labels in
  pedagogical order with their section buttons under each, (2) overview page
  renders 8 group headings in the same order, (3) clicking any nav button
  routes to the right section, (4) a saved-section URL like `?section=tdd`
  still works, (5) a deep-link hash like `#section-blackbox` still works,
  (6) the language toggle re-renders both surfaces correctly.

## Out of scope

- Renaming section ids (e.g., merging singletons into bigger ids). The
  "Display-only" scope choice during brainstorming preserves all ids.
- Adding category-level URL routing (`?category=foundations`). The taxonomy
  is a display layer; URLs continue to address sections directly.
- Reorganising decks within sections. Only the section *order* changes; the
  deck-to-section mapping in `build-slide-decks.mjs` is untouched.
- Hierarchical nav (two-tier expandable menu). The chosen UI is grouped flat
  nav (option 1 from brainstorming).
- Touching `src/standalone.js`. That file is a generated bundle, regenerated
  by `npm run build:standalone` when the source modules change.
- A redirect map for old `?section=` URLs. Not needed since no ids are
  renamed.
