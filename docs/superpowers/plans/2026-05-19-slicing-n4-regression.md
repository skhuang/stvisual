# N4 — Slice-Based Regression Test Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `regression` tab of the Slicing section live — a `SliceRegressionExplorer` teaching regression test selection: mark a statement as edited, then split the test suite into must-rerun vs safe-to-skip.

**Architecture:** Add one pure helper `affectedTests` to N1's `slicing.js`, composing the existing `forwardSlice` / `dynamicSlice` / `slicesIntersect`. The Explorer reuses the existing `slicingExamples.js` examples (their `traces` are the suite) and `SlicePdgView`'s two-tone API. No new data file; `SlicePdgView` unchanged. This is the last of the four Slicing tabs.

**Tech Stack:** Vanilla ES-module JS; Vitest + jsdom; Marp slide decks.

**Branch:** `feat/slicing-n4-regression` (created; design spec already committed).

**Spec:** `docs/superpowers/specs/2026-05-19-slicing-n4-regression-design.md`

---

## File Structure

| File | Responsibility | Change |
| --- | --- | --- |
| `src/utils/slicing.js` | add the pure `affectedTests` helper | Modify |
| `src/components/SliceRegressionExplorer.js` (+ `.css`) | The `regression` tab | Create |
| `src/app.js` | `regression` panel → `SliceRegressionExplorer` | Modify |
| `src/utils/urlRouter.js` | `EXPLORER_TO_LOCATION.SliceRegressionExplorer` | Modify |
| `src/data/explorerTags.js` | `SliceRegressionExplorer` tag entry | Modify |
| `src/i18n/dict.js` | `regression.*` keys (en + zh) | Modify |
| `src/styles.css` | `@import` `SliceRegressionExplorer.css` | Modify |
| `docs/slides/61-regression-test-selection.{en,zh-TW}.md` | Deck #61 | Create |
| `scripts/build-slide-decks.mjs`, `src/data/slideDecks.generated.js` | Register deck | Modify |
| `src/tests/slicing.test.js`, `src/tests/urlRouter.test.js`, `src/tests/slideDecks.test.js` | Extend | Modify |
| `src/tests/SliceRegressionExplorer.test.jsx` | Tests | Create |
| `Plan.md` | Mark N4 done — Slicing section complete | Modify |

`SlicePdgView.js` and `slicingExamples.js` are **not** modified.

---

## Task 1: The `affectedTests` engine helper

**Files:**
- Modify: `src/utils/slicing.js`
- Test: `src/tests/slicing.test.js`

- [ ] **Step 1: Write the failing test**

The file `src/tests/slicing.test.js` already imports from `../utils/slicing.js` — add `affectedTests` to that existing import statement (it currently imports `backwardSlice, forwardSlice, dynamicSlice, programDice, slicesIntersect, sliceCoverage`). Then append this new `describe` block to the end of the file. It builds a small branchy PDG inline so the test does not depend on `slicingExamples.js`:

```js
describe('affectedTests', () => {
  // s1: label="zero"  s2: sign=0  s3: if(n>0)[control]  s4: label="pos"
  // s5: return label[output].  sign is defined but never used.
  const branchy = {
    statements: [
      { id: 's1', line: 1, text: 'label="zero"', defs: ['label'], uses: [] },
      { id: 's2', line: 2, text: 'sign=0', defs: ['sign'], uses: [] },
      { id: 's3', line: 3, text: 'if(n>0)', defs: [], uses: ['n'], kind: 'control' },
      { id: 's4', line: 4, text: 'label="pos"', defs: ['label'], uses: [] },
      { id: 's5', line: 5, text: 'return label', defs: [], uses: ['label'], kind: 'output' },
    ],
    controlDeps: [['s3', 's4']],
    dataDeps: [['s1', 's5', 'label'], ['s4', 's5', 'label']],
    traces: [
      { id: 'pos', steps: ['s1', 's2', 's3', 's4', 's5'] },
      { id: 'zero', steps: ['s1', 's2', 's3', 's5'] },
    ],
  };
  const outCrit = { stmtId: 's5', variable: 'label' };

  it('static: editing dead-output code (s2) still re-runs every trace that ran it', () => {
    const r = affectedTests(branchy, outCrit, 's2', 'static');
    expect([...r.affected].sort()).toEqual(['pos', 'zero']);
    expect([...r.safe]).toEqual([]);
  });
  it('dynamic: editing dead-output code (s2) re-runs nothing', () => {
    const r = affectedTests(branchy, outCrit, 's2', 'dynamic');
    expect([...r.affected]).toEqual([]);
    expect([...r.safe].sort()).toEqual(['pos', 'zero']);
  });
  it('dynamic: editing the positive branch (s4) re-runs only the trace it reaches', () => {
    const r = affectedTests(branchy, outCrit, 's4', 'dynamic');
    expect([...r.affected]).toEqual(['pos']);
    expect([...r.safe]).toEqual(['zero']);
  });
  it('impact always contains the changed statement itself', () => {
    const r = affectedTests(branchy, outCrit, 's2', 'static');
    expect(r.impact.has('s2')).toBe(true);
  });
  it('an unknown changed statement id does not throw', () => {
    expect(() => affectedTests(branchy, outCrit, 'nope', 'static')).not.toThrow();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/slicing.test.js`
Expected: FAIL — `affectedTests` is not exported.

- [ ] **Step 3: Implement `affectedTests` in `src/utils/slicing.js`**

Append this exported function to the end of `src/utils/slicing.js` (after `sliceCoverage`). It references `forwardSlice`, `dynamicSlice`, and `slicesIntersect`, all already defined above it in the same file:

```js
// Regression test selection. Given a PDG, its output criterion, the id of the
// changed statement, and a mode ('static' | 'dynamic'), classify every trace
// in `pdg.traces` as affected (must re-run) or safe (can skip).
//
// impact  = the forward slice of the changed statement — every statement the
//           edit can reach. Computed over each variable the statement defines
//           (or, for a def-less statement, a single variable-less pass so
//           control-dependent children are still reached).
// static  : a trace is affected iff the statements it executed intersect
//           `impact`.
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

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/slicing.test.js`
Expected: PASS — all tests, including the 5 new `affectedTests` cases.

- [ ] **Step 5: Run the full suite, then commit**

Run: `npx vitest run` — expect green, no regressions.

```bash
git add src/utils/slicing.js src/tests/slicing.test.js
git commit -m "$(cat <<'EOF'
feat(slicing): affectedTests helper

Pure helper for regression test selection: given an edited statement,
classify each authored trace as must-rerun or safe-to-skip, under a
static (impact-set intersection) or dynamic (dynamic-slice) criterion.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: The Explorer — `SliceRegressionExplorer`

**Files:**
- Create: `src/components/SliceRegressionExplorer.js`, `src/components/SliceRegressionExplorer.css`
- Test: `src/tests/SliceRegressionExplorer.test.jsx`

Build by mirroring `src/components/SliceCoverageExplorer.js` (N3) and
`src/components/ProgramSlicingExplorer.js` (N1) — read both as the structural
template (module-level `state`, `render()` setting `root.innerHTML` then
`bindEvents()`, the graph-left / panel-right layout, the zoom control, the quiz
panel, `onLocaleChange` re-render). Reuse the CSS idiom of
`SliceCoverageExplorer.css`.

- [ ] **Step 1: Write the failing test**

Create `src/tests/SliceRegressionExplorer.test.jsx`:

```js
import { describe, expect, it, beforeEach } from 'vitest';
import { createSliceRegressionExplorer } from '../components/SliceRegressionExplorer.js';

describe('SliceRegressionExplorer', () => {
  let root;
  beforeEach(() => {
    root = createSliceRegressionExplorer();
    document.body.appendChild(root);
  });

  it('renders with the root testid and example chips', () => {
    expect(root.dataset.testid).toBe('slice-regression-explorer');
    expect(root.querySelector('[data-testid="regression-example-classify"]')).toBeTruthy();
  });

  it('has a static/dynamic mode toggle and a test-suite panel', () => {
    expect(root.querySelector('[data-testid="regression-mode-static"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="regression-mode-dynamic"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="regression-tests"]')).toBeTruthy();
  });

  it('picking an edit then switching to dynamic mode moves a test to safe', () => {
    root.querySelector('[data-testid="regression-example-classify"]').click();
    // mark s3 (`sign = 0`) as the edited statement — dead w.r.t. the `label` output
    root.querySelector('[data-stmt="s3"]').click();
    // static: every classify trace executes s3 → all must re-run
    root.querySelector('[data-testid="regression-mode-static"]').click();
    const staticText = root.querySelector('[data-testid="regression-metric"]').textContent;
    // dynamic: sign never reaches label → nothing must re-run
    root.querySelector('[data-testid="regression-mode-dynamic"]').click();
    const dynamicText = root.querySelector('[data-testid="regression-metric"]').textContent;
    expect(staticText).not.toEqual(dynamicText);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/SliceRegressionExplorer.test.jsx`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement `SliceRegressionExplorer.js` + `.css`**

`createSliceRegressionExplorer()` returns a root `<div>` with `dataset.testid = 'slice-regression-explorer'`. Behaviour:

- **Imports:** `t`, `onLocaleChange` from `../i18n/index.js`; `SLICING_EXAMPLES` from `../data/slicingExamples.js`; `affectedTests` from `../utils/slicing.js`; `renderSliceCodeListing`, `renderSlicePdgGraph` from `./SlicePdgView.js`.
- **State** (module-level, reset in the factory): `exampleId` (default `SLICING_EXAMPLES[0].id`), `changedStmtId` (default `null`), `mode` (default `'static'`), `pdgZoom` (default 1), `quiz` (`{ active:false, phase:'idle', answer:'' }`).
- **Example chips** — one per `SLICING_EXAMPLES`, `data-testid="regression-example-<id>"`. Selecting a different example resets `changedStmtId` to `null`.
- **The output criterion** — find the example's `kind:'output'` statement; its variable is `outputStmt.uses[0]`; `criterion = { stmtId: outputStmt.id, variable }`. Shown read-only.
- **Pick the edit** — every statement line in the code listing (`[data-stmt="<id>"]`) and every PDG node (`[data-pdg-node="<id>"]`) is clickable; clicking sets `state.changedStmtId` to that id; clicking the currently-changed statement again clears it back to `null`.
- **Mode toggle** — two buttons, `data-testid="regression-mode-static"` and `regression-mode-dynamic`, setting `state.mode`; the active one carries an active class.
- **`affectedTests`** — when `changedStmtId` is set, call `affectedTests(example, criterion, state.changedStmtId, state.mode)` → `{ affected, safe, impact }`. When `changedStmtId` is `null`, treat `affected`/`safe`/`impact` as empty sets.
- **Code + PDG** — `renderSliceCodeListing(example, sliceSet, { secondary: impact })` and `renderSlicePdgGraph(example, sliceSet, { secondary: impact, zoom: state.pdgZoom })` where `sliceSet = state.changedStmtId ? new Set([state.changedStmtId]) : new Set()`. So the changed statement gets the strong `--in` highlight and the rest of the impact set the lighter `--ctx` tone. Lay the graph left and the panel right, mirroring `ProgramSlicingExplorer`'s `pse-graph-row`. Reuse a zoom control like the other explorers.
- **Test-suite panel** — `data-testid="regression-tests"`: one row per the example's `traces`, each `data-testid="regression-test-<id>"`, carrying the trace's `inputLabel || label || id` and a badge — `t('regression.mustRerun')` when the trace id is in `affected`, `t('regression.safe')` when in `safe`. When `changedStmtId` is `null`, instead of rows show a `t('regression.pickPrompt')` message.
- **Savings metric** — `data-testid="regression-metric"`: when an edit is chosen, show "re-run A of N — X% skipped" via `t()` with `A = affected.size`, `N = example.traces.length`, `X = Math.round(safe.size / N * 100)`. When no edit is chosen, show `t('regression.pickPrompt')`.
- **Quiz** — one multiple-choice question, mirroring `SliceCoverageExplorer`'s quiz panel, `data-testid` `regression-quiz-start` / `regression-quiz-submit` / `regression-quiz-close` / `regression-quiz-result`; correct-answer key `'c'`. The question asks which tests must be re-run after a given edit; make option `'c'` the correct one.
- Re-render on `onLocaleChange`. All user-facing strings via `t()` — it is fine that `regression.*` keys are not yet in `dict.js` (Task 3 adds them); `t()` falls back to the key string so tests pass.
- `SliceRegressionExplorer.css` — reuse the class idiom of `SliceCoverageExplorer.css` (you may use `sre-*` names; stay consistent). Add a re-run / safe badge style (two visually distinct badges — e.g. a warning tone for must-rerun, a muted/positive tone for safe).

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/SliceRegressionExplorer.test.jsx`
Expected: PASS — all 3 tests.

- [ ] **Step 5: Run the full suite — note the expected explorerTags gap**

Run: `npx vitest run`
`explorerTags.test.js` will fail ONLY because `SliceRegressionExplorer` has no tag entry yet — that is Task 3's job. Report it; do NOT add the entry here, do NOT weaken the test. Everything else must be green.

- [ ] **Step 6: Commit**

```bash
git add src/components/SliceRegressionExplorer.js src/components/SliceRegressionExplorer.css src/tests/SliceRegressionExplorer.test.jsx
git commit -m "$(cat <<'EOF'
feat(slicing): Slice Regression Explorer (N4)

Mark a statement as edited; the explorer splits the authored test
suite into must-rerun and safe-to-skip, contrasting the conservative
static criterion with the precise dynamic one.

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
  SliceRegressionExplorer:     { section: 'slicing', tab: 'regression' },
```

(`TAB_SECTIONS.slicing` already lists `regression`.)

- [ ] **Step 2: explorerTags**

In `src/data/explorerTags.js`, add to `EXPLORER_TAGS` (mirror exactly how `SliceCoverageExplorer` is written — same `TEXTBOOK` constant for `source` if the neighbouring entries use it):

```js
  SliceRegressionExplorer: {
    level: ['unit'],
    technique: ['slicing'],
    series: ['slicing'],
    difficulty: 'intermediate',
    source: ['textbook'],
  },
```

Add `SliceRegressionExplorer` to the `slicing` group of `SECTION_EXPLORERS`, right after `SliceCoverageExplorer` (mirror exactly how `SliceCoverageExplorer` is listed).

- [ ] **Step 3: i18n — `src/i18n/dict.js`**

Open `src/components/SliceRegressionExplorer.js` and grep it for every `t('...')` / `t(\`...\`)` call. For EVERY `regression.*` key it references, add an entry to BOTH the `en` and the `zh` message objects, matching the existing key style (English in `en`, Traditional Chinese in `zh`). Cover at least: the title/description, the mode-toggle labels (static / dynamic), the output-criterion label, the pick-an-edit prompt (`regression.pickPrompt`), the test-suite heading, the `regression.mustRerun` and `regression.safe` badges, the savings-metric string, and the quiz strings (`regression.quiz.prompt`, `regression.quiz.a/b/c/d`, `regression.quiz.correct`, `regression.quiz.wrong`). Every new key appears exactly once in `en` and once in `zh` — no duplicates. `dict.js` is large and has had concurrent-edit issues: after editing, sanity-check that each new key appears exactly twice in the file. The zh-TW for the slicing section uses 程式切片 (slicing) / 向後切片 (backward slice) / 切片覆蓋 (slice coverage) — for "regression test selection" use 回歸測試選擇.

If the savings-metric string needs to interpolate the counts `A`, `N`, `X`, follow whatever interpolation idiom `dict.js` already uses for parameterised strings (check how `coverage.*` or other metric strings handle counts — many entries in this codebase are plain strings the component concatenates around; match the approach `SliceCoverageExplorer.js` used for its metric).

- [ ] **Step 4: app.js**

In `src/app.js`:
1. Import `createSliceRegressionExplorer` from `./components/SliceRegressionExplorer.js` (next to the other slicing-explorer imports).
2. Add `regression: createSliceRegressionExplorer()` to the `components` map (next to `coverage: createSliceCoverageExplorer()`).
3. In the `slicing` tabbed-section block (around line 707-725), the `regression` panel must render `components.regression` instead of the placeholder. Change the `if/else` chain so `regression` is handled like `coverage`:

```js
      if (tabId === 'program') {
        panel.appendChild(components.programslicing);
      } else if (tabId === 'dicing') {
        panel.appendChild(components.dicing);
      } else if (tabId === 'coverage') {
        panel.appendChild(components.coverage);
      } else if (tabId === 'regression') {
        panel.appendChild(components.regression);
      } else {
        const placeholder = document.createElement('p');
        placeholder.textContent = t('slicing.tab.comingSoon');
        panel.appendChild(placeholder);
      }
```

Also update the comment on line 696 / 707 if it still says N3-N4 are placeholders — all four slicing tabs are now live.

- [ ] **Step 5: styles.css**

In `src/styles.css`, add `@import url('./components/SliceRegressionExplorer.css');` next to the `SliceCoverageExplorer.css` import.

- [ ] **Step 6: Update integrity tests**

- `src/tests/urlRouter.test.js` — add a test that `parseAppLocation('?explorer=SliceRegressionExplorer')` resolves to `{ explorer: 'SliceRegressionExplorer', section: 'slicing', tab: 'regression' }`. Mirror the exact assertion idiom the existing `SliceCoverageExplorer` test in that file uses.
- `src/tests/explorerTags.test.js` — `SliceRegressionExplorer` now has a tag entry, so the integrity scan should pass; confirm it passes — only change the test if it still flags something.

- [ ] **Step 7: Run the full suite**

Run: `npx vitest run` — expect ALL tests green, no regressions, the previously-expected `explorerTags` gap resolved.

- [ ] **Step 8: Commit**

```bash
git add src/app.js src/utils/urlRouter.js src/data/explorerTags.js src/i18n/dict.js src/styles.css src/tests/urlRouter.test.js src/tests/explorerTags.test.js
git commit -m "$(cat <<'EOF'
feat(slicing): wire the regression tab live

The slicing section's regression tab now renders SliceRegressionExplorer
— all four slicing tabs are live.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Lecture deck #61

**Files:**
- Create: `docs/slides/61-regression-test-selection.{en,zh-TW}.md`
- Modify: `scripts/build-slide-decks.mjs`, `src/data/slideDecks.generated.js`, `src/tests/slideDecks.test.js`

- [ ] **Step 1: Write the two decks**

Create `docs/slides/61-regression-test-selection.en.md` and `docs/slides/61-regression-test-selection.zh-TW.md`, mirroring the format of `docs/slides/60-slice-based-coverage.{en,zh-TW}.md` exactly (Marp front-matter, title slide, content slides, a tool-demo slide, summary, further reading, speaker-note comments).

Content to cover:
- The regression-testing problem — after an edit, re-running the entire suite is slow; **regression test selection (RTS)** picks the subset that can be affected.
- The **safe** requirement — RTS must not drop a test whose outcome the edit could change.
- An edit at one statement; its **forward slice** = the impact set (every statement the edit can reach through control + data dependence).
- **Static (conservative) selection** — re-run a test if it executed anything in the impact set.
- **Dynamic (precise) selection** — re-run a test only if the changed statement is in that test's dynamic backward slice from the output; the edit actually flows to the output on that run. Dynamic-affected ⊆ static-affected.
- A worked example on `classify` (output `label`, variable `label`, traces `pos` / `neg` / `zero`):
  - Editing `s2` (`sign = 0`) — static re-runs all three traces (each executes `s2`); dynamic re-runs **none** (`sign` never flows to `label`). The "ran the line but it did not matter" lesson.

    NOTE — verify the exact statement id of `sign = 0` in `classify` against `src/data/slicingExamples.js` before writing this slide; the engine-test PDG in the plan numbers it `s2`, but the real `classify` example may number it differently. Use the real id, the real slice, and the real trace ids from `slicingExamples.js`. State the percentage as `safe / total` rounded.
- The tool-demo slide pointing learners at `/section-slicing` → the Regression tab.
- Summary; a note that this completes the four slice-based testing techniques (slicing, dicing, coverage, regression); further reading.

Titles: en front-matter `title:` = `Software Testing Visualization #61 — Regression Test Selection`; zh = `軟體測試視覺化 #61 — 回歸測試選擇`. zh terminology: 程式切片 (slicing), 向後切片 (backward slice), 前向切片 (forward slice), 回歸測試選擇 (regression test selection). No screenshots.

- [ ] **Step 2: Verify the `classify` facts the deck states**

Before finalising the deck, run this to confirm the worked-example numbers:

Run:
```bash
node -e "
import('./src/data/slicingExamples.js').then(async m => {
  const ex = m.SLICING_EXAMPLES.find(e=>e.id==='classify');
  const out = ex.statements.find(s=>s.kind==='output');
  const { affectedTests } = await import('./src/utils/slicing.js');
  const crit = { stmtId: out.id, variable: out.uses[0] };
  const sign0 = ex.statements.find(s=>/sign\s*=\s*0/.test(s.text));
  console.log('sign=0 is statement', sign0 && sign0.id);
  for (const mode of ['static','dynamic']) {
    const r = affectedTests(ex, crit, sign0.id, mode);
    console.log(mode, 'affected:', [...r.affected].sort(), 'safe:', [...r.safe].sort());
  }
});
"
```
Expected: `sign=0` resolves to a real statement id; `static` affected = all `classify` trace ids; `dynamic` affected = `[]`. Use the printed ids/values in the deck. If the output differs from the spec's worked example, STOP and report the discrepancy rather than writing wrong numbers.

- [ ] **Step 3: Register the deck**

In `scripts/build-slide-decks.mjs`, append to the `DECKS` array after the `60-slice-based-coverage` entry (match the exact object-key shape of the #60 entry):

```js
  { base: '61-regression-test-selection', id: 'regression-test-selection', num: 61, section: 'slicing' },
```

- [ ] **Step 4: Regenerate the bundled deck data**

Run: `npm run build:slide-decks`
Expected: prints `slideDecks: wrote 61 decks`.

- [ ] **Step 5: Update the deck-count test**

In `src/tests/slideDecks.test.js`, change the expected deck count from `60` to `61`.

- [ ] **Step 6: Run the slide tests, then commit**

Run: `npx vitest run src/tests/slideDecks.test.js` — expect PASS. Then `npx vitest run` — expect fully green.

```bash
git add docs/slides/61-regression-test-selection.en.md docs/slides/61-regression-test-selection.zh-TW.md scripts/build-slide-decks.mjs src/data/slideDecks.generated.js src/tests/slideDecks.test.js
git commit -m "$(cat <<'EOF'
docs(slides): deck #61 — regression test selection

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Plan.md + finalize

**Files:**
- Modify: `Plan.md`

- [ ] **Step 1: Mark N4 done in Plan.md**

In `Plan.md` §N, change the **N4** row's status from `待實作` to `✅ 已完成 2026-05-19`. The N4 row currently reads:

```
| **N4** | Regression Test Selection | 以切片相交判斷修改影響哪些測試需重跑 | 待實作 |
```

Change the last cell to `✅ 已完成 2026-05-19`. With this, all four §N rows (N1–N4) are complete.

- [ ] **Step 2: Run the full suite**

Run: `npx vitest run` — expect every test green.

- [ ] **Step 3: Commit**

```bash
git add Plan.md
git commit -m "$(cat <<'EOF'
docs(plan): mark §N N4 (regression test selection) complete

The Slicing section is complete — all four tabs live.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Push and open the PR**

```bash
git push -u origin feat/slicing-n4-regression
gh pr create --title "feat(slicing): N4 — Slice-Based Regression Test Selection" --body "Implements N4 of the slicing section: the affectedTests engine helper, the SliceRegressionExplorer (mark an edit, split the suite into must-rerun vs safe-to-skip, static vs dynamic criterion), and deck #61. Completes the Slicing section — all four tabs live. Spec: docs/superpowers/specs/2026-05-19-slicing-n4-regression-design.md"
```

---

## Self-review notes

- **Spec coverage:** Task 1 ↔ `affectedTests` helper; Task 2 ↔ `SliceRegressionExplorer` (output criterion, pick-the-edit, mode toggle, code+PDG two-tone, test-suite panel, savings metric, quiz); Task 3 ↔ all wiring rows; Task 4 ↔ deck #61; Task 5 ↔ Plan.md. `SlicePdgView` and `slicingExamples.js` unchanged, as the spec states.
- **Type consistency:** `affectedTests(pdg, criterion, changedStmtId, mode)` → `{ affected, safe, impact }` — defined in Task 1, consumed in Task 2 (`affected`/`safe` as `Set<traceId>` for the badges and the metric, `impact` as `options.secondary`, `state.changedStmtId` as the single-element primary `sliceSet`). `criterion` is `{ stmtId, variable }` — N1's existing shape. `forwardSlice` / `dynamicSlice` / `slicesIntersect` are N1's existing exports, used inside `affectedTests`.
- **testid consistency:** `slice-regression-explorer` (root), `regression-example-<id>`, `regression-mode-static` / `regression-mode-dynamic`, `regression-tests`, `regression-test-<id>`, `regression-metric`, `regression-quiz-start/submit/close/result` — used identically in the Task 2 spec, the Task 2 test, and the Task 3 routing wiring.
- **Worked-example caveat:** the Task 1 engine test uses a self-contained inline PDG numbered `s1..s5` so it does not depend on `slicingExamples.js`. The Task 2 test and Task 4 deck use the real `classify` example; Task 2's test marks `s3` and only asserts that static and dynamic metrics differ (robust to the exact `classify` numbering), and Task 4 Step 2 verifies the real ids/values before the deck states them. This avoids hard-coding `classify` statement ids that the plan author has not re-confirmed.
- **Quiz key `'c'`** matches the repo-wide convention used by N1/N2/N3.
