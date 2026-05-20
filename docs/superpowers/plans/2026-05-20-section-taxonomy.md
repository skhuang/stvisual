# Section Taxonomy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the heterogeneous 22-section flat nav + 10-group overview with a coherent 8-category taxonomy (Ammann & Offutt's criterion-source axis), as a display layer only — section ids, URLs, anchors, tests, and deck data all unchanged.

**Architecture:** A new `src/data/sectionTaxonomy.js` becomes the single source of truth for the 8 categories and the section ordering. Both `learningSectionsConfig` (nav) and `overviewGroups` (overview page) derive from it. The nav switches from `overflow-x: auto` to `flex-wrap: wrap` (still hidden below 680px) so category-label rows can break onto their own lines.

**Tech Stack:** Vanilla ES modules; vitest for unit tests; CSS in `src/App.css`.

**Spec:** `docs/superpowers/specs/2026-05-20-section-taxonomy-design.md`

---

## File Structure

| File | Responsibility | Change |
| --- | --- | --- |
| `src/data/sectionTaxonomy.js` | Single source of truth: `SECTION_TAXONOMY` array + derived `SECTION_ORDER` | Create |
| `src/tests/sectionTaxonomy.test.js` | Integrity test (every section id in `learningSectionsConfig` appears exactly once in `SECTION_TAXONOMY`) | Create |
| `src/app.js` | Derive `learningSectionsConfig` + `overviewGroups` from the taxonomy; reorder `<section>` DOM blocks; emit nav category headers in `renderNav` | Modify |
| `src/App.css` | Switch `.app-nav__buttons` from `overflow-x: auto` to `flex-wrap: wrap`; add `.nav-category` rule | Modify |
| `src/i18n/dict.js` | Add 8 `taxonomy.*` keys per locale (16 total); remove 10 obsolete `overview.group.*` keys per locale (20 total) | Modify |

**Not touched:**
- `src/utils/urlRouter.js` (TAB_SECTIONS, EXPLORER_TO_LOCATION)
- `src/data/explorerTags.js` (SECTION_EXPLORERS)
- `scripts/build-slide-decks.mjs` (deck section ids)
- `docs/slides/*.md`
- All Explorer components
- `src/standalone.js` (build artifact; not edited)

---

## Task 0: Branch + working-tree check

**Files:** none.

- [ ] **Step 1: Confirm clean working tree on `main`**

Run: `git status`
Expected: clean (untracked `.claude/` and `PLAN_group_theory_testing.md` from prior sessions are fine — ignore them). The spec commit (`5cb287e`) is on `main`.

- [ ] **Step 2: Create the feature branch**

Run: `git checkout -b feat/section-taxonomy`
Expected: switched to a new branch off `main`.

---

## Task 1: The taxonomy module + integrity test

**Files:**
- Create: `src/data/sectionTaxonomy.js`
- Create: `src/tests/sectionTaxonomy.test.js`

TDD order: write the test first against the not-yet-existing module, watch it fail, then write the module to make it pass.

- [ ] **Step 1: Write the integrity test first**

Create `src/tests/sectionTaxonomy.test.js`:

```javascript
import { describe, expect, it } from 'vitest';
import { SECTION_TAXONOMY, SECTION_ORDER } from '../data/sectionTaxonomy.js';
import { messages } from '../i18n/dict.js';

// Every section id known to the app, as a flat list — this is the set the
// taxonomy must categorise. Keep this in sync with learningSectionsConfig
// in src/app.js (minus the 'all' meta-section).
const EXPECTED_SECTION_IDS = [
  'methods', 'flow', 'types', 'codecov',
  'blackbox', 'pbt',
  'graph', 'mbt', 'slicing',
  'logic', 'groupth',
  'syntax',
  'symbex', 'concolic', 'fuzz', 'testgen',
  'tdd', 'acceptance', 'agile', 'inttest',
  'advanced', 'rbt',
];

describe('Section taxonomy', () => {
  it('exports exactly 8 categories', () => {
    expect(SECTION_TAXONOMY.length).toBe(8);
  });

  it('every category has id, labelKey, and a non-empty sectionIds array', () => {
    for (const cat of SECTION_TAXONOMY) {
      expect(typeof cat.id, `category id`).toBe('string');
      expect(cat.id.length, `category id non-empty`).toBeGreaterThan(0);
      expect(typeof cat.labelKey, `${cat.id}.labelKey`).toBe('string');
      expect(cat.labelKey.startsWith('taxonomy.'), `${cat.id}.labelKey prefix`).toBe(true);
      expect(Array.isArray(cat.sectionIds), `${cat.id}.sectionIds`).toBe(true);
      expect(cat.sectionIds.length, `${cat.id}.sectionIds non-empty`).toBeGreaterThan(0);
    }
  });

  it('covers every expected section id exactly once', () => {
    const flat = SECTION_TAXONOMY.flatMap((c) => c.sectionIds);
    expect(new Set(flat).size, 'duplicate section id in taxonomy').toBe(flat.length);
    expect([...flat].sort()).toEqual([...EXPECTED_SECTION_IDS].sort());
  });

  it('SECTION_ORDER matches the flattened taxonomy', () => {
    expect(SECTION_ORDER).toEqual(SECTION_TAXONOMY.flatMap((c) => c.sectionIds));
  });

  it('every category label has en and zh translations', () => {
    for (const cat of SECTION_TAXONOMY) {
      expect(messages.en[cat.labelKey], `${cat.labelKey} (en)`).toBeTruthy();
      expect(messages.zh[cat.labelKey], `${cat.labelKey} (zh)`).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/sectionTaxonomy.test.js`
Expected: FAIL — the import `'../data/sectionTaxonomy.js'` cannot be resolved. The test runner reports the module is missing.

- [ ] **Step 3: Create the taxonomy module**

Create `src/data/sectionTaxonomy.js`:

```javascript
// Single source of truth for the 8-category course taxonomy.
// Section ids (e.g., 'blackbox', 'tdd') are stable identifiers — URLs,
// anchors, tests, and deck mappings depend on them. Categories are a
// display-layer grouping above sections.
//
// Pedagogical axis: test-criterion source (Ammann & Offutt). See
// docs/superpowers/specs/2026-05-20-section-taxonomy-design.md.

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

// Flat section-id order derived from the taxonomy. Drives nav-button order
// and the <section> DOM order in app.js. The 'all' meta-section is
// prepended separately by app.js (it is not a real section, it represents
// the overview page).
export const SECTION_ORDER = SECTION_TAXONOMY.flatMap((c) => c.sectionIds);
```

- [ ] **Step 4: Add the i18n keys (en + zh) so the locale assertion in the test passes**

Open `src/i18n/dict.js`. The en messages block starts around line 22 and contains the existing `'overview.group.*'` keys. The zh block starts around line 2712 with its parallel keys.

In the **en** block, add these 8 keys (any position inside the en `messages.en` object is fine, but the convention is to group adjacent keys; put them near the existing `section.*` keys around line 23):

```javascript
    'taxonomy.foundations':  'Foundations',
    'taxonomy.input-space':  'Input Space (Black-box)',
    'taxonomy.graph-model':  'Graph, Model & Dependence Coverage',
    'taxonomy.logic':        'Logic Coverage',
    'taxonomy.syntax':       'Syntax-Based Testing',
    'taxonomy.generation':   'Test Generation',
    'taxonomy.process':      'Process & Discipline',
    'taxonomy.strategy':     'Strategy & Quality',
```

In the **zh** block, add the parallel keys:

```javascript
    'taxonomy.foundations':  '基礎',
    'taxonomy.input-space':  '輸入空間（黑盒）',
    'taxonomy.graph-model':  '圖形／模型／相依性覆蓋',
    'taxonomy.logic':        '邏輯覆蓋',
    'taxonomy.syntax':       '語法基測試',
    'taxonomy.generation':   '測試生成',
    'taxonomy.process':      '流程與紀律',
    'taxonomy.strategy':     '策略與品質',
```

Leave the existing `overview.group.*` keys in place for now — Task 5 removes them once nothing references them.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/tests/sectionTaxonomy.test.js`
Expected: PASS — 5 tests, all green. If "every category label has en and zh translations" fails, the i18n keys in Step 4 weren't added correctly.

- [ ] **Step 6: Commit**

```bash
git add src/data/sectionTaxonomy.js src/tests/sectionTaxonomy.test.js src/i18n/dict.js
git commit -m "$(cat <<'EOF'
feat(taxonomy): 8-category section taxonomy data module + integrity test

Single source of truth for the course's pedagogical grouping; consumers
(learningSectionsConfig, overviewGroups, <section> DOM order in app.js)
will derive from it in the next commit. Adds en+zh labels.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Wire `app.js` to the new taxonomy

**Files:**
- Modify: `src/app.js`

This task replaces three hand-maintained pieces with derivations from `SECTION_TAXONOMY` and `SECTION_ORDER`: (a) `learningSectionsConfig` order, (b) `overviewGroups`, (c) the `<section data-testid="section-…">` block order in the JSX-style template.

The functional behaviour is unchanged — section ids, button data-testids, anchor ids, saved-state semantics, and routing all keep working the same way. Only the *order* in which sections appear changes (to the pedagogical order from the taxonomy), and the overview groups shrink from 10 to 8.

- [ ] **Step 1: Add the import**

Open `src/app.js`. At the top with the other internal imports (look for the line that imports `i18n/index.js` around line 1–20), add:

```javascript
import { SECTION_TAXONOMY, SECTION_ORDER } from './data/sectionTaxonomy.js';
```

- [ ] **Step 2: Replace `learningSectionsConfig` with a derivation**

Locate `const learningSectionsConfig = [...]` at `src/app.js:79–103`. Replace the entire 25-line block with:

```javascript
const learningSectionsConfig = [
  { id: 'all', key: 'section.all' },
  ...SECTION_ORDER.map((id) => ({ id, key: `section.${id}` })),
];
```

The `'all'` meta-section stays at the top (it represents the overview page). Every section id from `SECTION_ORDER` becomes a config entry with its `section.<id>` i18n key — the same shape the rest of the file expects.

- [ ] **Step 3: Replace `overviewGroups` with a derivation**

Locate `const overviewGroups = [...]` at `src/app.js:112–153`. Replace the entire 42-line block with:

```javascript
const overviewGroups = SECTION_TAXONOMY.map((cat) => ({
  key: cat.labelKey,
  sectionIds: cat.sectionIds,
}));
```

The renderer at `app.js:1192` (`overviewGrid.innerHTML = overviewGroups.map(...)`) reads `group.key` and `group.sectionIds` — same shape, no renderer change needed.

- [ ] **Step 4: Reorder the `<section>` DOM blocks**

Locate the `<section data-testid="section-…">` block listing at `src/app.js:233–254`. The current order is `methods, graph, logic, syntax, codecov, groupth, symbex, concolic, fuzz, testgen, pbt, inttest, rbt, advanced, acceptance, mbt, agile, slicing, tdd, blackbox, flow, types`. Reorder them to walk the 8 categories in taxonomy order:

```html
          <section data-testid="section-methods" tabindex="-1" aria-labelledby="section-methods-title"><h2 id="section-methods-title">${t('section.methods.title')}</h2><div data-slot="methods"></div></section>
          <section data-testid="section-flow" tabindex="-1" aria-labelledby="section-flow-title"><h2 id="section-flow-title">${t('section.flow.title')}</h2><div data-slot="flow"></div></section>
          <section data-testid="section-types" tabindex="-1" aria-labelledby="section-types-title"><h2 id="section-types-title">${t('section.types.title')}</h2><div data-slot="types"></div></section>
          <section data-testid="section-codecov" tabindex="-1" aria-labelledby="section-codecov-title"><h2 id="section-codecov-title">${t('section.codecov.title')}</h2><div data-slot="codecov"></div></section>
          <section data-testid="section-blackbox" tabindex="-1" aria-labelledby="section-blackbox-title"><h2 id="section-blackbox-title">${t('section.blackbox.title')}</h2><div data-slot="blackbox"></div></section>
          <section data-testid="section-pbt" tabindex="-1" aria-labelledby="section-pbt-title"><h2 id="section-pbt-title">${t('section.pbt.title')}</h2><div data-slot="pbt"></div></section>
          <section data-testid="section-graph" tabindex="-1" aria-labelledby="section-graph-title"><h2 id="section-graph-title">${t('section.graph.title')}</h2><div data-slot="graph"></div></section>
          <section data-testid="section-mbt" tabindex="-1" aria-labelledby="section-mbt-title"><h2 id="section-mbt-title">${t('section.mbt.title')}</h2><div data-slot="mbt"></div></section>
          <section data-testid="section-slicing" tabindex="-1" aria-labelledby="section-slicing-title"><h2 id="section-slicing-title">${t('section.slicing.title')}</h2><div data-slot="slicing"></div></section>
          <section data-testid="section-logic" tabindex="-1" aria-labelledby="section-logic-title"><h2 id="section-logic-title">${t('section.logic.title')}</h2><div data-slot="logic"></div></section>
          <section data-testid="section-groupth" tabindex="-1" aria-labelledby="section-groupth-title"><h2 id="section-groupth-title">${t('section.groupth.title')}</h2><div data-slot="groupth"></div></section>
          <section data-testid="section-syntax" tabindex="-1" aria-labelledby="section-syntax-title"><h2 id="section-syntax-title">${t('section.syntax.title')}</h2><div data-slot="syntax"></div></section>
          <section data-testid="section-symbex" tabindex="-1" aria-labelledby="section-symbex-title"><h2 id="section-symbex-title">${t('section.symbex.title')}</h2><div data-slot="symbex"></div></section>
          <section data-testid="section-concolic" tabindex="-1" aria-labelledby="section-concolic-title"><h2 id="section-concolic-title">${t('section.concolic.title')}</h2><div data-slot="concolic"></div></section>
          <section data-testid="section-fuzz" tabindex="-1" aria-labelledby="section-fuzz-title"><h2 id="section-fuzz-title">${t('section.fuzz.title')}</h2><div data-slot="fuzz"></div></section>
          <section data-testid="section-testgen" tabindex="-1" aria-labelledby="section-testgen-title"><h2 id="section-testgen-title">${t('section.testgen.title')}</h2><div data-slot="testgen"></div></section>
          <section data-testid="section-tdd" tabindex="-1" aria-labelledby="section-tdd-title"><h2 id="section-tdd-title">${t('section.tdd.title')}</h2><div data-slot="tdd"></div></section>
          <section data-testid="section-acceptance" tabindex="-1" aria-labelledby="section-acceptance-title"><h2 id="section-acceptance-title">${t('section.acceptance.title')}</h2><div data-slot="acceptance"></div></section>
          <section data-testid="section-agile" tabindex="-1" aria-labelledby="section-agile-title"><h2 id="section-agile-title">${t('section.agile.title')}</h2><div data-slot="agile"></div></section>
          <section data-testid="section-inttest" tabindex="-1" aria-labelledby="section-inttest-title"><h2 id="section-inttest-title">${t('section.inttest.title')}</h2><div data-slot="inttest"></div></section>
          <section data-testid="section-advanced" tabindex="-1" aria-labelledby="section-advanced-title"><h2 id="section-advanced-title">${t('section.advanced.title')}</h2><div data-slot="advanced"></div></section>
          <section data-testid="section-rbt" tabindex="-1" aria-labelledby="section-rbt-title"><h2 id="section-rbt-title">${t('section.rbt.title')}</h2><div data-slot="rbt"></div></section>
```

- [ ] **Step 5: Reorder the `sections` lookup object**

Locate the `sections = { ... }` object literal at `src/app.js:280–303` that maps each section id to its DOM element via `main.querySelector('[data-testid="section-…"]')`. Reorder the 22 entries to match the new pedagogical order (same order as Step 4). The keys and values are unchanged; only the line order changes.

```javascript
    const sections = {
      overview: main.querySelector('[data-testid="section-overview"]'),
      methods: main.querySelector('[data-testid="section-methods"]'),
      flow: main.querySelector('[data-testid="section-flow"]'),
      types: main.querySelector('[data-testid="section-types"]'),
      codecov: main.querySelector('[data-testid="section-codecov"]'),
      blackbox: main.querySelector('[data-testid="section-blackbox"]'),
      pbt: main.querySelector('[data-testid="section-pbt"]'),
      graph: main.querySelector('[data-testid="section-graph"]'),
      mbt: main.querySelector('[data-testid="section-mbt"]'),
      slicing: main.querySelector('[data-testid="section-slicing"]'),
      logic: main.querySelector('[data-testid="section-logic"]'),
      groupth: main.querySelector('[data-testid="section-groupth"]'),
      syntax: main.querySelector('[data-testid="section-syntax"]'),
      symbex: main.querySelector('[data-testid="section-symbex"]'),
      concolic: main.querySelector('[data-testid="section-concolic"]'),
      fuzz: main.querySelector('[data-testid="section-fuzz"]'),
      testgen: main.querySelector('[data-testid="section-testgen"]'),
      tdd: main.querySelector('[data-testid="section-tdd"]'),
      acceptance: main.querySelector('[data-testid="section-acceptance"]'),
      agile: main.querySelector('[data-testid="section-agile"]'),
      inttest: main.querySelector('[data-testid="section-inttest"]'),
      advanced: main.querySelector('[data-testid="section-advanced"]'),
      rbt: main.querySelector('[data-testid="section-rbt"]'),
    };
```

- [ ] **Step 6: Run the test suite — expect green**

Run: `npx vitest run`
Expected: every test passes (the new `sectionTaxonomy.test.js` plus all pre-existing tests; section ids, URL routing, explorer-tag invariants, deck-count assertion all unchanged).

If a pre-existing test now fails, the most likely cause is a test that asserted on a specific button or section *position* (rather than just the data-testid). Read the failure, find the position assertion, and update it — the new order is the pedagogical order from Step 4 / Step 5. Do not relax any meaningful assertion.

- [ ] **Step 7: Commit**

```bash
git add src/app.js
git commit -m "$(cat <<'EOF'
feat(taxonomy): derive learningSectionsConfig + overviewGroups from taxonomy

Replaces three hand-maintained section-id lists in app.js with
derivations from SECTION_TAXONOMY / SECTION_ORDER. Section ids, URLs,
anchors, and data-testids are unchanged; only the visual order changes
to the pedagogical (criterion-source) order.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Emit category headers in the nav

**Files:**
- Modify: `src/app.js` (the `renderNav` function around line 1236)

This task is the one user-visible behaviour change: instead of 22 flat nav buttons in one row, the nav row is grouped by category with a small label header above each group. Functional behaviour (clicks, ARIA, active state, language toggle) is unchanged.

- [ ] **Step 1: Replace the inner `learningSectionsConfig.map(...)` in `renderNav` with a taxonomy-walking version**

Locate `renderNav` at `src/app.js:1236`. The current button row is:

```javascript
        <div class="app-nav__buttons">
          ${learningSectionsConfig.map((section) => `
            <button
              class="nav-btn${activeSection === section.id ? ' active' : ''}"
              data-testid="nav-btn-${section.id}"
              data-section="${section.id}"
              type="button"
              aria-current="${activeSection === section.id ? 'page' : 'false'}"
            >
              ${t(section.key)}
            </button>
          `).join('')}
        </div>
```

Replace it with a version that emits the `all` button first, then walks `SECTION_TAXONOMY` and inserts a category-label header before each category's buttons:

```javascript
        <div class="app-nav__buttons">
          <button
            class="nav-btn${activeSection === 'all' ? ' active' : ''}"
            data-testid="nav-btn-all"
            data-section="all"
            type="button"
            aria-current="${activeSection === 'all' ? 'page' : 'false'}"
          >
            ${t('section.all')}
          </button>
          ${SECTION_TAXONOMY.map((cat) => `
            <div class="nav-category" data-testid="nav-category-${cat.id}">${t(cat.labelKey)}</div>
            ${cat.sectionIds.map((sectionId) => `
              <button
                class="nav-btn${activeSection === sectionId ? ' active' : ''}"
                data-testid="nav-btn-${sectionId}"
                data-section="${sectionId}"
                type="button"
                aria-current="${activeSection === sectionId ? 'page' : 'false'}"
              >
                ${t(`section.${sectionId}`)}
              </button>
            `).join('')}
          `).join('')}
        </div>
```

Notes:
- The `all` button now appears explicitly outside the category loop; it was previously the first entry of `learningSectionsConfig`. Behavior is identical.
- All 22 section-button data-testids (`nav-btn-graph`, `nav-btn-fuzz`, …) are unchanged — existing e2e tests like `e2e/graph-coverage.spec.js:12` (`getByTestId('nav-btn-graph').click()`) continue to work.
- The new `nav-category-<id>` testids are not clickable (they're `<div>`s, not buttons); they have data-testids only for future tests / accessibility tooling.

- [ ] **Step 2: Run the unit suite**

Run: `npx vitest run`
Expected: green. The nav category headers are inert `<div>` elements; no unit test should care.

- [ ] **Step 3: Commit**

```bash
git add src/app.js
git commit -m "$(cat <<'EOF'
feat(taxonomy): emit category headers between nav button groups

renderNav now walks SECTION_TAXONOMY, inserting a small label header
(<div class="nav-category">) before each category's section buttons.
All 22 nav-btn-<id> testids are unchanged so existing e2e tests
continue to work. The 'all' button is hoisted outside the category
loop. CSS for the new .nav-category and the wrap behaviour of
.app-nav__buttons land in the next commit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Nav CSS — flex-wrap + .nav-category

**Files:**
- Modify: `src/App.css` (the `.app-nav__buttons` block at line 171; add new `.nav-category` rule nearby)

The current `.app-nav__buttons` uses `display: flex` with `overflow-x: auto` — a horizontally-scrolling row. With 8 category labels interleaved, horizontal scroll would push each category off-screen and make the grouping invisible. Switch the layout to `flex-wrap: wrap` so categories naturally break onto new rows. The mobile breakpoint at `(max-width: 680px)` already sets `display: none` on `.app-nav__buttons`, so mobile is unaffected.

- [ ] **Step 1: Replace the `.app-nav__buttons` rule**

Locate the `.app-nav__buttons` block at `src/App.css:171–180`:

```css
.app-nav__buttons {
  display: flex;
  justify-content: flex-start;
  gap: 6px;
  min-width: 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  padding: 2px 2px 8px;
  scrollbar-width: thin;
}
```

Replace with:

```css
.app-nav__buttons {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  min-width: 0;
  padding: 2px 2px 8px;
}
```

Removed: `overflow-x: auto`, `overscroll-behavior-x: contain`, `scrollbar-width: thin` (all only relevant for a scrolling row). Added: `flex-wrap: wrap`, `align-items: center` (so category labels sit nicely beside buttons on the same row's baseline).

- [ ] **Step 2: Add the `.nav-category` rule**

Immediately after the `.app-nav__buttons` rule, add:

```css
.nav-category {
  flex-basis: 100%;
  font-size: 0.72rem;
  color: var(--app-text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  padding: 6px 0 2px;
  margin-top: 4px;
}
.nav-category:first-of-type {
  margin-top: 0;
}
```

The `flex-basis: 100%` forces the label to occupy the full row width — every subsequent button wraps onto the line below it. `var(--app-text-subtle)` matches the existing `.app-section-select-label` colour palette.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`
Open the dev server (defaults to `http://localhost:5173/`). Confirm:
- The nav renders the **All** button at top, followed by 8 small category labels (基礎 / 輸入空間 / 圖形・模型 / …) each on their own row.
- Each category label is followed by its section buttons on the next row(s).
- The active button has the existing dark-blue highlight.
- Clicking a button still routes to the section.
- Switching language (en ↔ zh) refreshes the labels correctly.
- Below 680px viewport, the nav buttons disappear and the section-select dropdown takes over (the existing mobile behaviour).

If the layout looks broken (labels overlap buttons, or buttons don't wrap), the `.app-nav` outer `display: grid` rule at line 155 may be constraining the inner row's width. Verify the inner `.app-nav__buttons` is inside the second grid column (`minmax(0, 1fr)` per line 157) and not constrained.

- [ ] **Step 4: Run the unit suite**

Run: `npx vitest run`
Expected: green (the CSS change does not affect unit tests).

- [ ] **Step 5: Commit**

```bash
git add src/App.css
git commit -m "$(cat <<'EOF'
feat(taxonomy): wrap nav buttons and style category headers

Switches .app-nav__buttons from horizontal-scroll to flex-wrap so the
8 category labels can break onto their own rows. Mobile already hides
.app-nav__buttons via display:none, so this only affects desktop.
Adds the .nav-category rule.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Remove the obsolete `overview.group.*` i18n keys

**Files:**
- Modify: `src/i18n/dict.js`

The 10 `overview.group.*` keys were used by the old hand-maintained `overviewGroups` array. After Task 2 replaced that array with a derivation that uses `cat.labelKey` (i.e., the new `taxonomy.*` keys), the old keys are dead code. Remove them.

- [ ] **Step 1: Confirm nothing else references the keys**

Run: `grep -rn "overview.group" /Users/skhuang/course/stvisual/src/ /Users/skhuang/course/stvisual/scripts/ /Users/skhuang/course/stvisual/e2e/`
Expected: hits only inside `src/i18n/dict.js` itself, and nowhere else.

If any file outside `dict.js` references an `overview.group.*` key, STOP — investigate before removing. The most likely consumer is a now-dead branch in `app.js`, but verify.

- [ ] **Step 2: Remove the en keys**

In `src/i18n/dict.js`, delete these 10 lines from the **en** messages block (approximate line numbers from the current `main`):

- line 23: `'overview.group.foundations': 'Foundations',`
- line 24: `'overview.group.coverage': 'Coverage Criteria',`
- line 25: `'overview.group.execution': 'Execution & Test Generation',`
- line 26: `'overview.group.blackbox': 'Black-Box Test Design',`
- line 27: `'overview.group.advanced': 'AI-Assisted Testing (Research)',`
- line 28: `'overview.group.acceptance': 'System / E2E / Acceptance',`
- line 29: `'overview.group.mbt': 'Model-Based Testing',`
- line 30: `'overview.group.agile': 'Agile Testing',`
- line 31: `'overview.group.slicing': 'Slice-Based Testing',`
- line 688: `'overview.group.tdd': 'Test-Driven Development',`

- [ ] **Step 3: Remove the zh keys**

In the **zh** messages block, delete the parallel 10 lines:

- line 2713: `'overview.group.foundations': '基礎概念',`
- line 2714: `'overview.group.coverage': '覆蓋準則',`
- line 2715: `'overview.group.execution': '執行與測試生成',`
- line 2716: `'overview.group.blackbox': '黑盒測試設計',`
- line 2717: `'overview.group.advanced': 'AI 輔助測試（研究前沿）',`
- line 2718: `'overview.group.acceptance': '系統 / E2E / 驗收',`
- line 2719: `'overview.group.mbt': '模型驅動測試',`
- line 2720: `'overview.group.agile': '敏捷測試',`
- line 2721: `'overview.group.slicing': '切片測試',`
- line 3658: `'overview.group.tdd': '測試驅動開發',`

(Use `grep -n "overview.group" src/i18n/dict.js` to confirm exact line numbers in the actual file — minor drift is possible.)

- [ ] **Step 4: Confirm the keys are gone**

Run: `grep -n "overview.group" /Users/skhuang/course/stvisual/src/i18n/dict.js`
Expected: zero hits.

- [ ] **Step 5: Run the unit suite**

Run: `npx vitest run`
Expected: green. (The `taxonomy.*` keys are in place from Task 1; nothing references the old keys.)

- [ ] **Step 6: Commit**

```bash
git add src/i18n/dict.js
git commit -m "$(cat <<'EOF'
chore(i18n): remove obsolete overview.group.* keys

The 10 keys per locale were consumers of the old hand-maintained
overviewGroups array. Task 2 replaced that array with a derivation
from SECTION_TAXONOMY which uses the new taxonomy.* keys, leaving
overview.group.* unreferenced.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Final verification + PR

**Files:** none — finalisation only.

- [ ] **Step 1: Full suite, one more time**

Run: `npx vitest run`
Expected: every test green. Count should be approximately 972 (the prior 967 baseline + the 5 new `sectionTaxonomy.test.js` cases). If any test fails, fix it (see Task 2 Step 6 guidance — most likely a position-dependent assertion).

- [ ] **Step 2: Lint-ish grep checks**

Run these spot-checks:

- `grep -c "overview.group" src/i18n/dict.js` → expect `0`.
- `grep -c "taxonomy\." src/i18n/dict.js` → expect at least `16` (8 keys × 2 locales).
- `grep -n "SECTION_TAXONOMY\|SECTION_ORDER" src/app.js` → expect the single import line plus the derived-config sites.
- `grep -c "nav-btn-" e2e/*.spec.js` → expect the same count as before the change (button data-testids unchanged, so no e2e churn).

- [ ] **Step 3: Manual smoke**

Run: `npm run dev`
Step through:
1. Default load → 8 nav category labels in pedagogical order; All button on top; overview page shows 8 group headings.
2. Click a section button (e.g. `nav-btn-slicing`) → routes to the slicing section; URL becomes `?section=slicing`; saved-state restored on reload.
3. Open a deep link like `?section=tdd&tab=cycle` → loads directly into the TDD Cycle tab.
4. Hash anchor: paste `#section-blackbox` into the address bar → scrolls to the blackbox section.
5. Toggle language en ↔ zh → all 8 category labels and all section labels switch.
6. Resize the browser below 680px → nav buttons disappear, section-select dropdown remains usable.

- [ ] **Step 4: Push and open the PR**

```bash
git push -u origin feat/section-taxonomy
gh pr create --title "feat: 8-category section taxonomy (display-layer reorg)" --body "$(cat <<'EOF'
## Summary
- Replaces the heterogeneous 22-section flat nav and 10-group overview with a coherent 8-category taxonomy following Ammann & Offutt's test-criterion-source axis.
- New \`src/data/sectionTaxonomy.js\` is the single source of truth; \`learningSectionsConfig\`, \`overviewGroups\`, and the \`<section>\` DOM order in \`app.js\` all derive from it.
- The nav row switches from \`overflow-x: auto\` to \`flex-wrap: wrap\` so 8 category labels can break onto their own rows. Mobile is unaffected (the nav row is hidden below 680px).
- All section ids, URLs (\`?section=X&tab=Y\`), anchors (\`#section-X\`), \`localStorage\` saved-state, \`TAB_SECTIONS\` / \`EXPLORER_TO_LOCATION\`, deck mappings, and \`nav-btn-<id>\` data-testids are unchanged.

## Test Plan
- [x] new integrity test (5 cases) covers every section id exactly once
- [x] every existing unit + e2e test stays green (nav-btn-, section- selectors all stable)
- [x] manual: deep links and hash anchors still route correctly; language toggle refreshes the new labels

Spec: docs/superpowers/specs/2026-05-20-section-taxonomy-design.md
Plan: docs/superpowers/plans/2026-05-20-section-taxonomy.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-review notes

- **Spec coverage:** Task 1 ↔ the new module + i18n labels (spec §Architecture, §i18n); Task 2 ↔ `app.js` derivations + DOM reorder (spec §Surfaces A, B, C); Task 3 ↔ nav category headers (spec §Surfaces B); Task 4 ↔ CSS (spec §Architecture/CSS); Task 5 ↔ removing obsolete `overview.group.*` keys (spec §i18n); Task 6 ↔ the PR. Every spec section maps to a task.
- **Stable contracts:** the plan never changes a section id, a URL parameter, an anchor hash, a `TAB_SECTIONS` entry, an `EXPLORER_TO_LOCATION` entry, or a `nav-btn-<id>` / `section-<id>` data-testid. The "What does NOT change" list in the spec is enforced by the plan: no task touches `urlRouter.js`, `explorerTags.js`, deck markdown, or Explorer components.
- **CSS file:** the spec named `src/styles.css` but the actual nav rules live in `src/App.css` (`styles.css` is the import barrel). Task 4 correctly targets `App.css`.
- **TDD order:** Task 1 writes the failing test before the module exists (Steps 1–3). The i18n keys land in the same task because the locale assertion requires them — the test wouldn't pass without Step 4.
- **Commit cadence:** 6 commits total — one per task. Each is independently revertable: Task 1 alone introduces the taxonomy module without yet using it; Task 2 wires the consumers but leaves the nav visually unchanged (just reordered); Task 3 introduces the category headers but they sit unstyled in a horizontal-scroll row until Task 4. Each task ends in a working state.
- **Test churn budget:** zero. The `nav-btn-<id>` / `section-<id>` / `data-testid="section-…"` selectors that 10+ e2e and unit tests depend on are all preserved verbatim.
