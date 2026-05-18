# N3 — Slice-Based Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `coverage` tab of the Slicing section live — a `SliceCoverageExplorer` teaching slice-based coverage as a test-adequacy criterion.

**Architecture:** Add one pure helper `sliceCoverage` to N1's `slicing.js`. The Explorer reuses N1's `backwardSlice` (the output's slice = the coverage target), the existing `slicingExamples.js` examples (their `traces` are the togglable suite), and `SlicePdgView`'s existing two-tone API. No new data file; `SlicePdgView` unchanged.

**Tech Stack:** Vanilla ES-module JS; Vitest + jsdom; Marp slide decks.

**Branch:** `feat/slicing-n3-coverage` (created; design spec already committed).

**Spec:** `docs/superpowers/specs/2026-05-19-slicing-n3-coverage-design.md`

---

## File Structure

| File | Responsibility | Change |
| --- | --- | --- |
| `src/utils/slicing.js` | add the pure `sliceCoverage` helper | Modify |
| `src/components/SliceCoverageExplorer.js` (+ `.css`) | The `coverage` tab | Create |
| `src/app.js` | `coverage` panel → `SliceCoverageExplorer` | Modify |
| `src/utils/urlRouter.js` | `EXPLORER_TO_LOCATION.SliceCoverageExplorer` | Modify |
| `src/data/explorerTags.js` | `SliceCoverageExplorer` tag entry | Modify |
| `src/i18n/dict.js` | `coverage.*` keys (en + zh) | Modify |
| `src/styles.css` | `@import` `SliceCoverageExplorer.css` | Modify |
| `docs/slides/60-slice-based-coverage.{en,zh-TW}.md` | Deck #60 | Create |
| `scripts/build-slide-decks.mjs`, `src/data/slideDecks.generated.js` | Register deck | Modify |
| `src/tests/slicing.test.js`, `src/tests/urlRouter.test.js`, `src/tests/slideDecks.test.js` | Extend | Modify |
| `src/tests/SliceCoverageExplorer.test.jsx` | Tests | Create |
| `Plan.md` | Mark N3 done | Modify |

`SlicePdgView.js` and `slicingExamples.js` are **not** modified.

---

## Task 1: The `sliceCoverage` engine helper

**Files:**
- Modify: `src/utils/slicing.js`
- Test: `src/tests/slicing.test.js`

- [ ] **Step 1: Write the failing test**

Append to `src/tests/slicing.test.js` a new `describe` block (the file already imports from `../utils/slicing.js` — add `sliceCoverage` to that import):

```js
describe('sliceCoverage', () => {
  it('reports full coverage when every slice statement is executed', () => {
    const r = sliceCoverage(new Set(['a', 'b']), new Set(['a', 'b', 'c']));
    expect([...r.covered].sort()).toEqual(['a', 'b']);
    expect([...r.uncovered]).toEqual([]);
    expect(r.pct).toBe(100);
  });
  it('splits covered vs uncovered on a partial suite', () => {
    const r = sliceCoverage(new Set(['a', 'b', 'c']), new Set(['a', 'c']));
    expect([...r.covered].sort()).toEqual(['a', 'c']);
    expect([...r.uncovered]).toEqual(['b']);
    expect(r.pct).toBe(67); // round(2/3 * 100)
  });
  it('reports 0% when nothing is executed', () => {
    const r = sliceCoverage(new Set(['a', 'b']), new Set());
    expect(r.pct).toBe(0);
    expect([...r.uncovered].sort()).toEqual(['a', 'b']);
  });
  it('an empty slice is vacuously 100% covered', () => {
    const r = sliceCoverage(new Set(), new Set(['a']));
    expect(r.pct).toBe(100);
    expect(r.covered.size).toBe(0);
    expect(r.uncovered.size).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/slicing.test.js`
Expected: FAIL — `sliceCoverage` is not exported.

- [ ] **Step 3: Implement `sliceCoverage` in `src/utils/slicing.js`**

Append this exported function to `src/utils/slicing.js` (after the existing exports):

```js
// Slice-based coverage. Given a slice (Set of statement ids) and the set of
// statement ids executed by a test suite, report which slice statements were
// covered, which were missed, and the coverage percentage. An empty slice is
// vacuously 100% covered.
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

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/slicing.test.js`
Expected: PASS — all tests, including the 4 new `sliceCoverage` cases.

- [ ] **Step 5: Run the full suite, then commit**

Run: `npx vitest run` — expect green, no regressions.

```bash
git add src/utils/slicing.js src/tests/slicing.test.js
git commit -m "$(cat <<'EOF'
feat(slicing): sliceCoverage helper

Pure helper: given a slice and the statements a test suite executed,
return the covered set, the uncovered (gap) set, and the coverage %.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: The Explorer — `SliceCoverageExplorer`

**Files:**
- Create: `src/components/SliceCoverageExplorer.js`, `src/components/SliceCoverageExplorer.css`
- Test: `src/tests/SliceCoverageExplorer.test.jsx`

Build by mirroring `src/components/SliceDicingExplorer.js` and
`src/components/ProgramSlicingExplorer.js` — read both as the structural template
(module-level `state`, `render()` setting `root.innerHTML` then `bindEvents()`,
the graph-left / panel-right layout, the quiz panel, `onLocaleChange`
re-render). Reuse the CSS idiom of `ProgramSlicingExplorer.css`.

- [ ] **Step 1: Write the failing test**

Create `src/tests/SliceCoverageExplorer.test.jsx`:

```js
import { describe, expect, it, beforeEach } from 'vitest';
import { createSliceCoverageExplorer } from '../components/SliceCoverageExplorer.js';

describe('SliceCoverageExplorer', () => {
  let root;
  beforeEach(() => {
    root = createSliceCoverageExplorer();
    document.body.appendChild(root);
  });

  it('renders with the root testid and example chips', () => {
    expect(root.dataset.testid).toBe('slice-coverage-explorer');
    expect(root.querySelector('[data-testid="coverage-example-classify"]')).toBeTruthy();
  });

  it('shows both a slice-coverage and a statement-coverage metric', () => {
    const metrics = root.querySelector('[data-testid="coverage-metrics"]');
    expect(metrics).toBeTruthy();
    expect(root.querySelector('[data-testid="coverage-slice-pct"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="coverage-stmt-pct"]')).toBeTruthy();
  });

  it('toggling a trace out of the suite opens a slice-coverage gap', () => {
    root.querySelector('[data-testid="coverage-example-classify"]').click();
    // all traces on → the classify `label` slice is fully covered, no s8 gap
    expect(root.querySelector('[data-testid="coverage-gaps"]').textContent)
      .not.toContain('s8');
    // 'neg' is the only trace that executes s8 — drop it
    root.querySelector('[data-testid="coverage-trace-neg"]').click();
    expect(root.querySelector('[data-testid="coverage-gaps"]').textContent)
      .toContain('s8');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/SliceCoverageExplorer.test.jsx`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement `SliceCoverageExplorer.js` + `.css`**

`createSliceCoverageExplorer()` returns a root `<div>` with `dataset.testid = 'slice-coverage-explorer'`. Behaviour:

- **Imports:** `t`, `onLocaleChange` from `../i18n/index.js`; `SLICING_EXAMPLES` from `../data/slicingExamples.js`; `backwardSlice`, `sliceCoverage` from `../utils/slicing.js`; `renderSliceCodeListing`, `renderSlicePdgGraph` from `./SlicePdgView.js`.
- **State** (module-level, reset in the factory): `exampleId` (default `SLICING_EXAMPLES[0].id`), `activeTraceIds` (a Set, default = all trace ids of the current example), `pdgZoom` (default 1), `quiz` (`{ active:false, phase:'idle', answer:'' }`).
- **Example chips** — one per `SLICING_EXAMPLES`, `data-testid="coverage-example-<id>"`. Selecting a different example resets `activeTraceIds` to all of that example's trace ids.
- **The target slice** — find the example's `kind:'output'` statement; its variable is `outputStmt.uses[0]`; `slice = backwardSlice(example, { stmtId: outputStmt.id, variable })`.
- **Trace toggle chips** — one per the example's `traces`, `data-testid="coverage-trace-<id>"`, shown active/inactive by membership in `activeTraceIds`; clicking toggles membership. The chip label is the trace's `inputLabel || label || id`.
- **`executed`** — a Set: the union of `steps` over every trace whose id is in `activeTraceIds`.
- **Metrics** — `data-testid="coverage-metrics"` panel with two labelled bars:
  - **Slice coverage** — `const cov = sliceCoverage(slice, executed);` show `cov.pct`% in `<span data-testid="coverage-slice-pct">`, with `cov.covered.size / slice.size`.
  - **Statement coverage** — plain: `stmtPct = round(executed.size / example.statements.length * 100)`; show in `<span data-testid="coverage-stmt-pct">`.
- **Code + PDG** — `renderSliceCodeListing(example, cov.uncovered, { secondary: cov.covered })` and `renderSlicePdgGraph(example, cov.uncovered, { secondary: cov.covered })` so uncovered slice statements (the gaps) take the strong `--in` highlight and covered slice statements the lighter `--ctx` tone. Lay the graph left and the panel right, mirroring `ProgramSlicingExplorer`'s `pse-graph-row`. Reuse a zoom control like the other explorers.
- **Gap list** — `data-testid="coverage-gaps"`: list each uncovered slice statement as `<code>id</code> text`; when `cov.uncovered.size === 0` show a `t('coverage.fullyCovered')` message. Below it, a line listing statement ids that are in `executed` but NOT in `slice` (statement-covered yet outside the output's slice) — the contrast; via a `t('coverage.outsideSlice')` label.
- **Quiz** — one multiple-choice question, mirroring `ProgramSlicingExplorer`'s quiz panel, `data-testid` `coverage-quiz-start` / `coverage-quiz-submit` / `coverage-quiz-close` / `coverage-quiz-result`; correct-answer key `'c'`.
- Re-render on `onLocaleChange`. All user-facing strings via `t()` — it is fine that `coverage.*` keys are not yet in `dict.js` (Task 3 adds them); `t()` falls back to the key string so tests pass.
- `SliceCoverageExplorer.css` — reuse the class idiom of `ProgramSlicingExplorer.css` (you may reuse `pse-*` names or introduce `sce-*`; stay consistent). Add a two-bar coverage-meter style (a labelled bar + percentage for each of slice / statement coverage).

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/SliceCoverageExplorer.test.jsx`
Expected: PASS — all 3 tests.

- [ ] **Step 5: Run the full suite — note the expected explorerTags gap**

Run: `npx vitest run`
`explorerTags.test.js` will fail ONLY because `SliceCoverageExplorer` has no tag entry yet — that is Task 3's job. Report it; do NOT add the entry here, do NOT weaken the test. Everything else must be green.

- [ ] **Step 6: Commit**

```bash
git add src/components/SliceCoverageExplorer.js src/components/SliceCoverageExplorer.css src/tests/SliceCoverageExplorer.test.jsx
git commit -m "$(cat <<'EOF'
feat(slicing): Slice Coverage Explorer (N3)

An output's backward slice is the coverage target; the learner toggles
authored test traces and watches slice coverage beside plain statement
coverage, with the uncovered slice statements surfaced as gaps.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Wiring

**Files:**
- Modify: `src/app.js`, `src/utils/urlRouter.js`, `src/data/explorerTags.js`, `src/i18n/dict.js`, `src/styles.css`
- Test: `src/tests/urlRouter.test.js`, `src/tests/explorerTags.test.js`

- [ ] **Step 1: urlRouter**

In `src/utils/urlRouter.js`, add to `EXPLORER_TO_LOCATION`:

```js
  SliceCoverageExplorer:       { section: 'slicing', tab: 'coverage' },
```

(`TAB_SECTIONS.slicing` already lists `coverage`.)

- [ ] **Step 2: explorerTags**

In `src/data/explorerTags.js`, add to `EXPLORER_TAGS`:

```js
  SliceCoverageExplorer: {
    level: ['unit'],
    technique: ['slicing'],
    series: ['slicing'],
    difficulty: 'intermediate',
    source: ['textbook'],
  },
```

Add `SliceCoverageExplorer` to the `slicing` group of `SECTION_EXPLORERS`, right after `SliceDicingExplorer` (mirror exactly how `SliceDicingExplorer` is listed).

- [ ] **Step 3: i18n — `src/i18n/dict.js`**

Open `src/components/SliceCoverageExplorer.js` and grep it for every `t('...')` / `t(\`...\`)` call. For EVERY `coverage.*` key it references, add an entry to BOTH the `en` and the `zh` message objects, matching the existing key style (English in `en`, Traditional Chinese in `zh`). Cover at least: the title/description, the slice-coverage and statement-coverage metric labels, the trace-suite label, `coverage.fullyCovered`, `coverage.outsideSlice`, the gap-list heading, and the quiz strings (`coverage.quiz.prompt`, `coverage.quiz.a/b/c/d`, `coverage.quiz.correct`, `coverage.quiz.wrong`). Every new key appears exactly once in `en` and once in `zh` — no duplicates. `dict.js` is large and has had concurrent-edit issues: after editing, sanity-check for duplicate keys.

- [ ] **Step 4: app.js**

In `src/app.js`: import `createSliceCoverageExplorer` from `./components/SliceCoverageExplorer.js`; add `coverage: createSliceCoverageExplorer()` to the `components` map; in the `slicing` tabbed-section block, the `coverage` panel renders `components.coverage` instead of the "coming soon" placeholder (mirror how the `dicing` panel renders `components.dicing`). Leave `regression` as a placeholder.

- [ ] **Step 5: styles.css**

In `src/styles.css`, add `@import url('./components/SliceCoverageExplorer.css');` next to the `SliceDicingExplorer.css` import.

- [ ] **Step 6: Update integrity tests**

- `src/tests/urlRouter.test.js` — add a test that `parseAppLocation('?explorer=SliceCoverageExplorer')` resolves to `{ explorer: 'SliceCoverageExplorer', section: 'slicing', tab: 'coverage' }`.
- `src/tests/explorerTags.test.js` — `SliceCoverageExplorer` now has a tag entry, so the integrity scan should pass; confirm it passes — only change the test if it still flags something.

- [ ] **Step 7: Run the full suite**

Run: `npx vitest run` — expect ALL tests green, no regressions, the previously-expected `explorerTags` gap resolved.

- [ ] **Step 8: Commit**

```bash
git add src/app.js src/utils/urlRouter.js src/data/explorerTags.js src/i18n/dict.js src/styles.css src/tests/urlRouter.test.js src/tests/explorerTags.test.js
git commit -m "$(cat <<'EOF'
feat(slicing): wire the coverage tab live

The slicing section's coverage tab now renders SliceCoverageExplorer;
regression remains a placeholder until N4.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Lecture deck #60

**Files:**
- Create: `docs/slides/60-slice-based-coverage.{en,zh-TW}.md`
- Modify: `scripts/build-slide-decks.mjs`, `src/data/slideDecks.generated.js`, `src/tests/slideDecks.test.js`

- [ ] **Step 1: Write the two decks**

Create `docs/slides/60-slice-based-coverage.{en,zh-TW}.md`, mirroring the format of `docs/slides/59-fault-localization-dicing.{en,zh-TW}.md` exactly (Marp front-matter, title slide, content slides, a tool-demo slide, summary, further reading, speaker-note comments). Content: structural coverage recap (statement/branch coverage); the limitation — it does not say whether testing effort reached the statements *relevant to an output*; an output's backward slice as the relevant-statement set; **slice coverage** = covered slice statements ÷ slice size; slice coverage vs plain statement coverage (a statement can be executed yet outside every output's slice); a worked example on `classify` (the `label` slice, three traces, dropping `neg` opens the `s8` gap); the tool-demo slide pointing at `/section-slicing` → the Coverage tab; summary; further reading. `title:` en `Software Testing Visualization #60 — Slice-Based Coverage`, zh `軟體測試視覺化 #60 — 切片覆蓋`. No screenshots.

- [ ] **Step 2: Register the deck**

In `scripts/build-slide-decks.mjs`, append to the `DECKS` array after the `59-fault-localization-dicing` entry:

```js
  { base: '60-slice-based-coverage', id: 'slice-based-coverage', num: 60, section: 'slicing' },
```

- [ ] **Step 3: Regenerate the bundled deck data**

Run: `npm run build:slide-decks`
Expected: prints `slideDecks: wrote 60 decks`.

- [ ] **Step 4: Update the deck-count test**

In `src/tests/slideDecks.test.js`, change the expected deck count from `59` to `60`.

- [ ] **Step 5: Run the slide tests, then commit**

Run: `npx vitest run src/tests/slideDecks.test.js` — expect PASS. Then `npx vitest run` — expect fully green.

```bash
git add docs/slides/60-slice-based-coverage.en.md docs/slides/60-slice-based-coverage.zh-TW.md scripts/build-slide-decks.mjs src/data/slideDecks.generated.js src/tests/slideDecks.test.js
git commit -m "$(cat <<'EOF'
docs(slides): deck #60 — slice-based coverage

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Plan.md + finalize

**Files:**
- Modify: `Plan.md`

- [ ] **Step 1: Mark N3 done in Plan.md**

In `Plan.md` §N, change the **N3** row's status from `待實作` to `✅ 已完成 2026-05-19`.

- [ ] **Step 2: Run the full suite**

Run: `npx vitest run` — expect every test green.

- [ ] **Step 3: Commit**

```bash
git add Plan.md
git commit -m "$(cat <<'EOF'
docs(plan): mark §N N3 (slice coverage) complete

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Push and open the PR**

```bash
git push -u origin feat/slicing-n3-coverage
gh pr create --title "feat(slicing): N3 — Slice-Based Coverage Explorer" --body "Implements N3 of the slicing section: the sliceCoverage engine helper, the SliceCoverageExplorer (slice coverage vs plain statement coverage, togglable trace suite, gap surfacing), and deck #60. N4 follows. Spec: docs/superpowers/specs/2026-05-19-slicing-n3-coverage-design.md"
```

---

## Self-review notes

- **Spec coverage:** Task 1 ↔ `sliceCoverage` helper; Task 2 ↔ `SliceCoverageExplorer` (target slice, trace toggles, two metrics, gaps, quiz); Task 3 ↔ all wiring rows; Task 4 ↔ deck #60; Task 5 ↔ Plan.md. `SlicePdgView` and `slicingExamples.js` unchanged, as the spec states.
- **Type consistency:** `sliceCoverage(slice, executed)` → `{ covered, uncovered, pct }` — defined in Task 1, consumed in Task 2 (`cov.uncovered` as the primary highlight set, `cov.covered` as `options.secondary`, `cov.pct` as the slice-coverage metric). `backwardSlice(example, { stmtId, variable })` is N1's existing signature.
- **`classify` slice fact** (used by Task 2's test): `backwardSlice` of `classify`'s output (`return label`, variable `label`) = `{s11, s2, s5, s8, s4, s7}`. The three traces together execute all six → 100%. Only the `neg` trace executes `s8`; dropping `neg` leaves `s8` uncovered — the test asserts exactly that gap.
- Tasks 2–4 reference named template files (`SliceDicingExplorer.js`, deck `59-fault-localization-dicing`) rather than inlining mirrored code — the executing subagent reads those.
