# N2 — Fault Localization / Dicing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `dicing` tab of the Slicing section live — a `SliceDicingExplorer` teaching program dicing in two modes (static multi-output, dynamic multi-input).

**Architecture:** Reuse N1's `slicing.js` engine unchanged (`programDice`, `backwardSlice`, `dynamicSlice`). Two authored dicing scenarios in a new `dicingScenarios.js`. `SlicePdgView` gains a backward-compatible `secondary` highlight set. `SliceDicingExplorer` mirrors `ProgramSlicingExplorer`.

**Tech Stack:** Vanilla ES-module JS; Vitest + jsdom; Marp slide decks.

**Branch:** `feat/slicing-n2-dicing` (created; design spec already committed).

**Spec:** `docs/superpowers/specs/2026-05-18-slicing-n2-dicing-design.md`

---

## File Structure

| File | Responsibility | Change |
| --- | --- | --- |
| `src/data/dicingScenarios.js` | Two authored dicing scenarios + getter | Create |
| `src/components/SlicePdgView.js` | Optional `secondary` highlight set | Modify (backward-compatible) |
| `src/components/SliceDicingExplorer.js` (+ `.css`) | The `dicing` tab | Create |
| `src/app.js` | `dicing` panel → `SliceDicingExplorer` | Modify |
| `src/utils/urlRouter.js` | `EXPLORER_TO_LOCATION.SliceDicingExplorer` | Modify |
| `src/data/explorerTags.js` | `SliceDicingExplorer` tag entry | Modify |
| `src/i18n/dict.js` | `dicing.*` keys (en + zh) | Modify |
| `src/styles.css` | `@import` `SliceDicingExplorer.css` | Modify |
| `docs/slides/59-fault-localization-dicing.{en,zh-TW}.md` | Deck #59 | Create |
| `scripts/build-slide-decks.mjs`, `src/data/slideDecks.generated.js` | Register deck | Modify |
| `src/tests/dicingScenarios.test.js`, `src/tests/SliceDicingExplorer.test.jsx` | Tests | Create |
| `src/tests/SlicePdgView.test.jsx`, `urlRouter.test.js`, `slideDecks.test.js` | Extend | Modify |
| `Plan.md` | Mark N2 done | Modify |

The N1 engine `src/utils/slicing.js` is **not** modified — `programDice(failingSlice, passingSlices)` already does the job.

---

## Task 1: Authored dicing scenarios — `src/data/dicingScenarios.js`

**Files:**
- Create: `src/data/dicingScenarios.js`
- Test: `src/tests/dicingScenarios.test.js`

Two scenarios. A scenario is a PDG (same shape as `slicingExamples.js`) plus dicing
metadata. The dice math below was verified by hand.

- [ ] **Step 1: Write the failing integrity test**

Create `src/tests/dicingScenarios.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { DICING_SCENARIOS, getDicingScenario } from '../data/dicingScenarios.js';
import { backwardSlice, dynamicSlice, programDice } from '../utils/slicing.js';

describe('dicingScenarios integrity', () => {
  it('has the two scenarios, each with a unique id', () => {
    expect(DICING_SCENARIOS.map((s) => s.id).sort())
      .toEqual(['fare', 'summary-stats']);
  });

  it('getDicingScenario finds by id and returns null for an unknown id', () => {
    expect(getDicingScenario('fare')?.id).toBe('fare');
    expect(getDicingScenario('nope')).toBeNull();
  });

  it('every dependence edge and trace step references a real statement id', () => {
    for (const sc of DICING_SCENARIOS) {
      const ids = new Set(sc.statements.map((s) => s.id));
      for (const [from, to] of sc.controlDeps) {
        expect(ids.has(from), `${sc.id} ctrl ${from}`).toBe(true);
        expect(ids.has(to), `${sc.id} ctrl ${to}`).toBe(true);
      }
      for (const [from, to, v] of sc.dataDeps) {
        expect(ids.has(from), `${sc.id} data ${from}`).toBe(true);
        expect(ids.has(to), `${sc.id} data ${to}`).toBe(true);
        expect(typeof v).toBe('string');
      }
      for (const tr of sc.traces || []) {
        for (const sid of tr.steps) {
          expect(ids.has(sid), `${sc.id} trace ${tr.id} step ${sid}`).toBe(true);
        }
      }
    }
  });

  it('static scenario summary-stats: outputs valid and the dice catches the bug', () => {
    const sc = getDicingScenario('summary-stats');
    expect(sc.mode).toBe('static');
    const ids = new Set(sc.statements.map((s) => s.id));
    for (const o of sc.outputs) expect(ids.has(o.stmtId)).toBe(true);
    expect(sc.outputs.some((o) => o.variable === sc.wrongOutput)).toBe(true);
    const wrong = sc.outputs.find((o) => o.variable === sc.wrongOutput);
    const failing = backwardSlice(sc, { stmtId: wrong.stmtId, variable: wrong.variable });
    const passing = sc.outputs
      .filter((o) => o.variable !== sc.wrongOutput)
      .map((o) => backwardSlice(sc, { stmtId: o.stmtId, variable: o.variable }));
    const dice = programDice(failing, passing);
    expect(dice.has(sc.bug.stmtId), 'bug in dice').toBe(true);
  });

  it('dynamic scenario fare: exactly one failing trace and the dice catches the bug', () => {
    const sc = getDicingScenario('fare');
    expect(sc.mode).toBe('dynamic');
    const failTraces = sc.traces.filter((tr) => tr.outcome === 'fail');
    expect(failTraces).toHaveLength(1);
    const failing = dynamicSlice(sc, failTraces[0], sc.criterion);
    const passing = sc.traces
      .filter((tr) => tr.outcome === 'pass')
      .map((tr) => dynamicSlice(sc, tr, sc.criterion));
    const dice = programDice(failing, passing);
    expect(dice.has(sc.bug.stmtId), 'bug in dice').toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/dicingScenarios.test.js`
Expected: FAIL — `dicingScenarios.js` does not exist.

- [ ] **Step 3: Create `src/data/dicingScenarios.js` with EXACTLY this content**

```js
// Authored dicing scenarios for the slice-based-testing section's N2 tab.
// Each scenario is a Program Dependence Graph (same shape as slicingExamples.js)
// plus dicing metadata. The dice math is verified by the integrity test.

export const DICING_SCENARIOS = [
  // ── Static, multi-output: classic Lyle-Weiser dicing ───────────────────────
  // dice(highest) = slice(out-highest) - slice(out-total) - slice(out-mean)
  //              = { out-highest, s3, s7, s6 } — the seeded bug is s7.
  {
    id: 'summary-stats',
    mode: 'static',
    titleKey: 'dicing.scenario.summaryStats',
    language: 'javascript',
    source: [
      'function summaryStats(nums) {',     // 1
      '  let total = 0;',                   // 2
      '  let highest = nums[0];',           // 3
      '  for (const n of nums) {',          // 4
      '    total = total + n;',             // 5
      '    if (n > highest) {',             // 6
      '      highest = total;',             // 7  BUG: should be highest = n
      '    }',                              // 8
      '  }',                                // 9
      '  const mean = total / nums.length;',// 10
      '  return [',                         // 11
      '    total,',                         // 12
      '    mean,',                          // 13
      '    highest,',                       // 14
      '  ];',                               // 15
      '}',                                  // 16
    ],
    statements: [
      { id: 's2', line: 2, text: 'total = 0', defs: ['total'], uses: [] },
      { id: 's3', line: 3, text: 'highest = nums[0]', defs: ['highest'], uses: ['nums'] },
      { id: 's4', line: 4, text: 'for (n of nums)', defs: ['n'], uses: ['nums'], kind: 'control' },
      { id: 's5', line: 5, text: 'total = total + n', defs: ['total'], uses: ['total', 'n'] },
      { id: 's6', line: 6, text: 'if (n > highest)', defs: [], uses: ['n', 'highest'], kind: 'control' },
      { id: 's7', line: 7, text: 'highest = total', defs: ['highest'], uses: ['total'] },
      { id: 's10', line: 10, text: 'mean = total / nums.length', defs: ['mean'], uses: ['total', 'nums'] },
      { id: 'out-total', line: 12, text: 'return total', defs: [], uses: ['total'], kind: 'output' },
      { id: 'out-mean', line: 13, text: 'return mean', defs: [], uses: ['mean'], kind: 'output' },
      { id: 'out-highest', line: 14, text: 'return highest', defs: [], uses: ['highest'], kind: 'output' },
    ],
    controlDeps: [['s4', 's5'], ['s4', 's6'], ['s6', 's7']],
    dataDeps: [
      ['s2', 's5', 'total'], ['s5', 's5', 'total'], ['s5', 's7', 'total'],
      ['s5', 's10', 'total'], ['s5', 'out-total', 'total'],
      ['s4', 's5', 'n'], ['s4', 's6', 'n'],
      ['s3', 's6', 'highest'], ['s7', 's6', 'highest'],
      ['s3', 'out-highest', 'highest'], ['s7', 'out-highest', 'highest'],
      ['s10', 'out-mean', 'mean'],
    ],
    outputs: [
      { variable: 'total', stmtId: 'out-total' },
      { variable: 'mean', stmtId: 'out-mean' },
      { variable: 'highest', stmtId: 'out-highest' },
    ],
    wrongOutput: 'highest',
    bug: { stmtId: 's7', note: 'assigns total, not n' },
  },

  // ── Dynamic, multi-input: dice across a failing vs passing run ─────────────
  // dynamicSlice(fail) - union(dynamicSlice(pass...)) = { s8, s9 } — bug is s9.
  // The static dice across these inputs would be empty (slices input-independent).
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
      '}',                              // 12
    ],
    statements: [
      { id: 's2', line: 2, text: 'price = 10', defs: ['price'], uses: [] },
      { id: 's3', line: 3, text: 'if (age < 18)', defs: [], uses: ['age'], kind: 'control' },
      { id: 's4', line: 4, text: 'price = 5', defs: ['price'], uses: [] },
      { id: 's5', line: 5, text: 'else if (age >= 65)', defs: [], uses: ['age'], kind: 'control' },
      { id: 's6', line: 6, text: 'price = 3', defs: ['price'], uses: [] },
      { id: 's8', line: 8, text: 'if (peak)', defs: [], uses: ['peak'], kind: 'control' },
      { id: 's9', line: 9, text: 'price = price + 2 + 2', defs: ['price'], uses: ['price'] },
      { id: 's11', line: 11, text: 'return price', defs: [], uses: ['price'], kind: 'output' },
    ],
    controlDeps: [['s3', 's4'], ['s3', 's5'], ['s5', 's6'], ['s8', 's9']],
    dataDeps: [
      ['s2', 's9', 'price'], ['s4', 's9', 'price'], ['s6', 's9', 'price'],
      ['s2', 's11', 'price'], ['s4', 's11', 'price'], ['s6', 's11', 'price'],
      ['s9', 's11', 'price'],
    ],
    criterion: { stmtId: 's11', variable: 'price' },
    traces: [
      { id: 'adult-peak', outcome: 'fail', expected: 12, actual: 14,
        inputLabel: 'age=30, peak=true',
        steps: ['s2', 's3', 's5', 's8', 's9', 's11'] },
      { id: 'adult-off', outcome: 'pass', expected: 10, actual: 10,
        inputLabel: 'age=30, peak=false',
        steps: ['s2', 's3', 's5', 's8', 's11'] },
      { id: 'child-off', outcome: 'pass', expected: 5, actual: 5,
        inputLabel: 'age=12, peak=false',
        steps: ['s2', 's3', 's4', 's8', 's11'] },
      { id: 'senior-off', outcome: 'pass', expected: 3, actual: 3,
        inputLabel: 'age=70, peak=false',
        steps: ['s2', 's3', 's5', 's6', 's8', 's11'] },
    ],
    bug: { stmtId: 's9', note: 'adds 2 twice' },
  },
];

export function getDicingScenario(id) {
  return DICING_SCENARIOS.find((s) => s.id === id) ?? null;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/dicingScenarios.test.js`
Expected: PASS — all 5 `it` blocks. If a dice test fails, the PDG data is wrong;
fix the data (the test is the source of truth for the dice math).

- [ ] **Step 5: Run the full suite, then commit**

Run: `npx vitest run` — expect green, no regressions.

```bash
git add src/data/dicingScenarios.js src/tests/dicingScenarios.test.js
git commit -m "$(cat <<'EOF'
feat(slicing): authored dicing scenarios

summary-stats (static multi-output) and fare (dynamic multi-input,
input-dependent bug). Each PDG carries dicing metadata; an integrity
test confirms the dice catches the seeded bug.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `SlicePdgView` secondary highlight

**Files:**
- Modify: `src/components/SlicePdgView.js`
- Test: `src/tests/SlicePdgView.test.jsx`

Add an optional `options.secondary` Set. A statement in `secondary` but not in
`sliceSet` renders with a lighter context class (`slice-stmt--ctx` /
`pdg-node--ctx`). Absent `secondary` ⇒ identical to today (backward-compatible).

- [ ] **Step 1: Write the failing test**

Append to `src/tests/SlicePdgView.test.jsx` (inside the file, new `describe`):

```js
describe('secondary highlight', () => {
  it('renderSliceCodeListing marks secondary-only statements with --ctx', () => {
    const html = renderSliceCodeListing(ex, new Set(['s2']), { secondary: new Set(['s3']) });
    expect(html).toMatch(/data-stmt="s3"[^>]*slice-stmt--ctx/);
    // a statement in the primary slice keeps --in, not --ctx
    expect(html).toMatch(/data-stmt="s2"[^>]*slice-stmt--in/);
  });
  it('renderSlicePdgGraph marks secondary-only nodes with --ctx', () => {
    const html = renderSlicePdgGraph(ex, new Set(['s2']), { secondary: new Set(['s3']) });
    expect(html).toMatch(/data-pdg-node="s3"[^>]*pdg-node--ctx/);
  });
  it('omitting secondary leaves output unchanged (no --ctx)', () => {
    expect(renderSliceCodeListing(ex, new Set(['s2']))).not.toContain('--ctx');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/SlicePdgView.test.jsx`
Expected: FAIL — `--ctx` classes are not produced.

- [ ] **Step 3: Implement the `secondary` option**

In `src/components/SlicePdgView.js`:

`renderSliceCodeListing(example, sliceSet, options = {})` — accept a third arg; compute `const secondary = options.secondary || new Set();`. When building each statement `<li>`: if `sliceSet.has(stmtId)` use class `slice-stmt slice-stmt--in`; else if `secondary.has(stmtId)` use `slice-stmt slice-stmt--ctx`; else `slice-stmt`.

`renderSlicePdgGraph(example, sliceSet, options = {})` — same: `const secondary = options.secondary || new Set();`. For each node: `pdg-node pdg-node--in` if in `sliceSet`, else `pdg-node pdg-node--ctx` if in `secondary`, else `pdg-node`.

`renderSlicePdgView(example, sliceSet, options = {})` — pass `options` through to both (it already does for the graph; also pass to `renderSliceCodeListing`).

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/SlicePdgView.test.jsx`
Expected: PASS — all tests (the new 3 plus the existing ones unchanged).

- [ ] **Step 5: Commit**

```bash
git add src/components/SlicePdgView.js src/tests/SlicePdgView.test.jsx
git commit -m "$(cat <<'EOF'
feat(slicing): SlicePdgView secondary highlight tone

An optional options.secondary Set renders a lighter --ctx tone on code
lines and PDG nodes. Backward-compatible: absent ⇒ unchanged output.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: The Explorer — `SliceDicingExplorer`

**Files:**
- Create: `src/components/SliceDicingExplorer.js`, `src/components/SliceDicingExplorer.css`
- Test: `src/tests/SliceDicingExplorer.test.jsx`

Build by mirroring `src/components/ProgramSlicingExplorer.js` — read it as the
structural template (module `state`, `render()` + `bindEvents()`, the
graph-left / right-panel `pse-graph-row` layout, the quiz panel,
`onLocaleChange`). Reuse its CSS idiom from `ProgramSlicingExplorer.css`.

- [ ] **Step 1: Write the failing test**

Create `src/tests/SliceDicingExplorer.test.jsx`:

```js
import { describe, expect, it, beforeEach } from 'vitest';
import { createSliceDicingExplorer } from '../components/SliceDicingExplorer.js';

describe('SliceDicingExplorer', () => {
  let root;
  beforeEach(() => {
    root = createSliceDicingExplorer();
    document.body.appendChild(root);
  });

  it('renders with the root testid and a mode toggle', () => {
    expect(root.dataset.testid).toBe('slice-dicing-explorer');
    expect(root.querySelector('[data-testid="dicing-mode-static"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="dicing-mode-dynamic"]')).toBeTruthy();
  });

  it('static mode shows the summary-stats scenario and highlights a non-empty dice', () => {
    root.querySelector('[data-testid="dicing-mode-static"]').click();
    expect(root.querySelector('[data-testid="dicing-scenario-summary-stats"]')).toBeTruthy();
    // the dice highlights at least one statement
    expect(root.querySelectorAll('.slice-stmt--in').length).toBeGreaterThan(0);
  });

  it('dynamic mode lists traces with pass/fail outcome badges', () => {
    root.querySelector('[data-testid="dicing-mode-dynamic"]').click();
    expect(root.querySelector('[data-testid="dicing-scenario-fare"]')).toBeTruthy();
    expect(root.querySelector('[data-testid^="dicing-trace-"]')).toBeTruthy();
  });

  it('the detail panel confirms the seeded bug lands in the dice', () => {
    root.querySelector('[data-testid="dicing-mode-static"]').click();
    const detail = root.querySelector('[data-testid="dicing-detail"]');
    expect(detail).toBeTruthy();
    expect(detail.textContent.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/SliceDicingExplorer.test.jsx`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement `SliceDicingExplorer.js` + `.css`**

`createSliceDicingExplorer()` returns a root `<div>` with `dataset.testid = 'slice-dicing-explorer'`. Behaviour:

- **Mode toggle** — `data-testid="dicing-mode-static"` / `dicing-mode-dynamic`; default `static`.
- **Scenario chips** — the scenarios for the active mode (`DICING_SCENARIOS` filtered by `mode`), each `data-testid="dicing-scenario-<id>"`. Default to the first.
- **Static mode** — an output picker, one button per `scenario.outputs`, `data-testid="dicing-output-<variable>"`; the picked one is the *wrong* output (default `scenario.wrongOutput`). Compute `failing = backwardSlice(scenario, { stmtId, variable })` for the picked output; `passing = the other outputs' backwardSlice`; `dice = programDice(failing, passing)`.
- **Dynamic mode** — list `scenario.traces`, each `data-testid="dicing-trace-<id>"` with a pass/fail outcome badge. Compute `failing = dynamicSlice(scenario, failTrace, scenario.criterion)` (the `outcome:'fail'` trace), `passing = the pass traces' dynamicSlice`, `dice = programDice(failing, passing)`.
- **Render** — reuse `renderSliceCodeListing` and `renderSlicePdgGraph` from `SlicePdgView.js` with `sliceSet = dice` (primary `--in`) and `options.secondary = failing` (the rest of the failing slice shows as `--ctx`). Lay the graph left and a right panel (mirror `ProgramSlicingExplorer`'s `pse-graph-row`).
- **Detail panel** `data-testid="dicing-detail"`: the dice statement count; a line confirming `scenario.bug.stmtId` is in the dice (use `slicing`/`dicing` i18n); in dynamic mode, a note that the static dice across these inputs would be empty.
- **Quiz** — one multiple-choice question, answer key `'c'`, mirroring `ProgramSlicingExplorer`'s quiz panel (`dicing-quiz-start` / `-submit` / `-close` / `-result`).
- `onLocaleChange` re-render. All strings via `t()`.
- `SliceDicingExplorer.css` — reuse class names/idiom from `ProgramSlicingExplorer.css`; add a `.slice-stmt--ctx` / `.pdg-node--ctx` lighter tone (e.g. a pale blue) and an outcome-badge style.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/SliceDicingExplorer.test.jsx`
Expected: PASS — all 4 tests.

- [ ] **Step 5: Run the full suite — note the expected explorerTags gap**

Run: `npx vitest run`
`explorerTags.test.js` will fail ONLY because `SliceDicingExplorer` has no tag entry yet — that is Task 4's job. Report it; do not add the entry here, do not weaken the test.

- [ ] **Step 6: Commit**

```bash
git add src/components/SliceDicingExplorer.js src/components/SliceDicingExplorer.css src/tests/SliceDicingExplorer.test.jsx
git commit -m "$(cat <<'EOF'
feat(slicing): Slice Dicing Explorer (N2)

Two modes: static multi-output dicing and dynamic multi-input dicing.
The dice highlights the suspect statements; the detail panel confirms
the seeded bug is caught.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Wiring

**Files:**
- Modify: `src/app.js`, `src/utils/urlRouter.js`, `src/data/explorerTags.js`, `src/i18n/dict.js`, `src/styles.css`
- Test: `src/tests/urlRouter.test.js`, `src/tests/explorerTags.test.js`

- [ ] **Step 1: urlRouter**

In `src/utils/urlRouter.js`, add to `EXPLORER_TO_LOCATION`:

```js
  SliceDicingExplorer:         { section: 'slicing', tab: 'dicing' },
```

(`TAB_SECTIONS.slicing` already lists `dicing`.)

- [ ] **Step 2: explorerTags**

In `src/data/explorerTags.js`, add to `EXPLORER_TAGS`:

```js
  SliceDicingExplorer: {
    level: ['unit'],
    technique: ['slicing'],
    series: ['slicing'],
    difficulty: 'intermediate',
    source: ['textbook'],
  },
```

Add `SliceDicingExplorer` to the `SECTION_EXPLORERS` `slicing` group if that file lists explorers per section (mirror how `ProgramSlicingExplorer` is listed there).

- [ ] **Step 3: i18n — `src/i18n/dict.js`**

Add to BOTH the `en` and `zh` objects, matching existing key style: every `dicing.*` key referenced by `SliceDicingExplorer.js` — grep the component for `t('dicing.` and `t(\`dicing.` and add each, in both languages. Include `dicing.scenario.summaryStats`, `dicing.scenario.fare`, the mode-toggle labels, output-picker label, trace pass/fail badge labels, the detail-panel strings, and the quiz strings. No duplicate keys.

- [ ] **Step 4: app.js**

In `src/app.js`: import `createSliceDicingExplorer`; add `dicing: createSliceDicingExplorer()` to the `components` map; in the `slicing` tabbed-section block, the `dicing` panel renders `components.dicing` instead of the "coming soon" placeholder. Leave `coverage` / `regression` as placeholders.

- [ ] **Step 5: styles.css**

In `src/styles.css`, add `@import url('./components/SliceDicingExplorer.css');` alongside the other component imports.

- [ ] **Step 6: Update integrity tests**

`src/tests/urlRouter.test.js` — add a test that `parseAppLocation('?explorer=SliceDicingExplorer')` resolves to `{ explorer:'SliceDicingExplorer', section:'slicing', tab:'dicing' }`. `src/tests/explorerTags.test.js` — confirm it now passes (the `SliceDicingExplorer` tag entry resolves the Task 3 gap).

- [ ] **Step 7: Run the full suite, then commit**

Run: `npx vitest run` — expect all green, no regressions.

```bash
git add src/app.js src/utils/urlRouter.js src/data/explorerTags.js src/i18n/dict.js src/styles.css src/tests/urlRouter.test.js src/tests/explorerTags.test.js
git commit -m "$(cat <<'EOF'
feat(slicing): wire the dicing tab live

The slicing section's dicing tab now renders SliceDicingExplorer;
coverage / regression remain placeholders until N3-N4.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Lecture deck #59

**Files:**
- Create: `docs/slides/59-fault-localization-dicing.{en,zh-TW}.md`
- Modify: `scripts/build-slide-decks.mjs`, `src/data/slideDecks.generated.js`, `src/tests/slideDecks.test.js`

- [ ] **Step 1: Write the two decks**

Create `docs/slides/59-fault-localization-dicing.{en,zh-TW}.md`, mirroring the format of `docs/slides/58-program-slicing.{en,zh-TW}.md` exactly (Marp front-matter, title slide, content slides, a tool-demo slide, summary, further reading, speaker-note comments). Content: fault localization with slices; backward-slicing a wrong output; program dicing = failing slice minus passing slices; static multi-output dicing vs dynamic multi-input dicing; why a static dice across inputs is empty; a worked example on `summary-stats` and `fare`; a tool-demo slide pointing at `/section-slicing` → the Dicing tab. `title: Software Testing Visualization #59 — Fault Localization & Dicing` (en) / `軟體測試視覺化 #59 — 缺陷定位與切丁` (zh-TW). No screenshots.

- [ ] **Step 2: Register the deck**

In `scripts/build-slide-decks.mjs`, append to the `DECKS` array:

```js
  { base: '59-fault-localization-dicing', id: 'fault-localization-dicing', num: 59, section: 'slicing' },
```

- [ ] **Step 3: Regenerate the bundled deck data**

Run: `npm run build:slide-decks`
Expected: prints `slideDecks: wrote 59 decks`.

- [ ] **Step 4: Update the deck-count test**

In `src/tests/slideDecks.test.js`, change the expected deck count from `58` to `59`.

- [ ] **Step 5: Run the slide tests, then commit**

Run: `npx vitest run src/tests/slideDecks.test.js` — expect PASS.

```bash
git add docs/slides/59-fault-localization-dicing.en.md docs/slides/59-fault-localization-dicing.zh-TW.md scripts/build-slide-decks.mjs src/data/slideDecks.generated.js src/tests/slideDecks.test.js
git commit -m "$(cat <<'EOF'
docs(slides): deck #59 — fault localization & dicing

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Plan.md + finalize

**Files:**
- Modify: `Plan.md`

- [ ] **Step 1: Mark N2 done in Plan.md**

In `Plan.md` §N, change the N2 row's status from `待實作` to `✅ 已完成 2026-05-18`.

- [ ] **Step 2: Run the full suite**

Run: `npx vitest run` — expect every test green.

- [ ] **Step 3: Commit**

```bash
git add Plan.md
git commit -m "$(cat <<'EOF'
docs(plan): mark §N N2 (dicing) complete

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Push and open the PR**

```bash
git push -u origin feat/slicing-n2-dicing
gh pr create --title "feat(slicing): N2 — Fault Localization / Dicing Explorer" --body "Implements N2 of the slicing section: the SliceDicingExplorer (static multi-output + dynamic multi-input dicing), two authored dicing scenarios, the SlicePdgView secondary highlight, and deck #59. N3-N4 follow. Spec: docs/superpowers/specs/2026-05-18-slicing-n2-dicing-design.md"
```

---

## Self-review notes

- **Spec coverage:** Task 1 ↔ `dicingScenarios.js` (both modes' data + integrity); Task 2 ↔ `SlicePdgView` `secondary`; Task 3 ↔ `SliceDicingExplorer` (both modes, dice, detail, quiz); Task 4 ↔ all wiring rows; Task 5 ↔ deck #59; Task 6 ↔ Plan.md. Engine reuse (`programDice`) — no task needed, no change.
- **Dice math** (verified by hand, enforced by Task 1's test): static `summary-stats` dice = `{out-highest, s3, s7, s6}` ∋ bug `s7`; dynamic `fare` dice = `{s8, s9}` ∋ bug `s9`.
- **Type consistency:** a scenario has `{ id, mode, titleKey, language, source, statements, controlDeps, dataDeps }` plus — for `static` — `outputs:[{variable,stmtId}]` + `wrongOutput`; for `dynamic` — `criterion:{stmtId,variable}` + `traces:[{id,outcome,expected,actual,inputLabel,steps}]`; both have `bug:{stmtId,note}`. `programDice(failingSlice, passingSlices)`, `backwardSlice(pdg,criterion)`, `dynamicSlice(pdg,trace,criterion)` are N1's existing signatures, used unchanged.
- Tasks 3–5 reference named template files (`ProgramSlicingExplorer.js/.css`, deck `58-program-slicing`) rather than inlining mirrored code — the executing subagent reads those.
