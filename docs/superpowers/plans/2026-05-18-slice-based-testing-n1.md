# N1 — Program Slicing (Section N foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the new `slicing` course section with its first tab — the Program Slicing Explorer — plus the pure slicing engine and authored example data that N2–N4 will reuse.

**Architecture:** A pure `slicing.js` engine does backward/forward/dynamic slices by graph reachability over authored per-example PDGs (`slicingExamples.js`). A shared `SlicePdgView` renders source-with-slice-highlight beside an SVG dependence graph. `ProgramSlicingExplorer` is the N1 tab; the `slicing` section is wired into app.js / urlRouter / explorerTags / i18n / slides exactly like the M (agile) section.

**Tech Stack:** Vanilla ES-module JS; Vitest + jsdom unit tests; Marp slide decks.

**Branch:** `feat/slice-based-testing` (already created; design spec already committed).

**Spec:** `docs/superpowers/specs/2026-05-18-slice-based-testing-design.md`

---

## File Structure

| File | Responsibility | Change |
| --- | --- | --- |
| `src/utils/slicing.js` | Pure slicing engine — backward/forward/dynamic slice, dice, intersect | Create |
| `src/data/slicingExamples.js` | 3 authored example PDGs + traces | Create |
| `src/components/SlicePdgView.js` | Shared code+PDG render helper | Create |
| `src/components/ProgramSlicingExplorer.js` (+ `.css`) | N1 Explorer | Create |
| `src/app.js` | `slicing` section: import, components map, section markup, sections map, tab bar | Modify |
| `src/utils/urlRouter.js` | `TAB_SECTIONS.slicing`, 4 `EXPLORER_TO_LOCATION` entries (only N1 wired now) | Modify |
| `src/data/explorerTags.js` | `slicing` technique + series vocab; `ProgramSlicingExplorer` entry | Modify |
| `src/i18n/dict.js` | `slicing.*`, `tag.technique.slicing`, `tag.series.slicing`, `section.slicing.*` keys | Modify |
| `src/styles.css` | `@import` the two new CSS files | Modify |
| `docs/slides/58-program-slicing.{en,zh-TW}.md` | Lecture deck #58 | Create |
| `scripts/build-slide-decks.mjs` | Register deck #58 | Modify |
| `src/data/slideDecks.generated.js` | Regenerated | Modify (generated) |
| `Plan.md` | New §N section | Modify |

Only the N1 tab is implemented here. N2–N4 tabs are registered in `TAB_SECTIONS`/`EXPLORER_TO_LOCATION` only when their own plans land — **do not** stub them now.

---

## Task 1: The slicing engine — `src/utils/slicing.js`

**Files:**
- Create: `src/utils/slicing.js`
- Test: `src/tests/slicing.test.js`

A PDG is `{ statements: [{id, line, text, defs, uses, kind?}], controlDeps: [[from,to]], dataDeps: [[from,to,variable]] }`. A criterion is `{ stmtId, variable }`. A trace is `{ id, steps: [stmtId...] }`. All slice functions return a `Set<stmtId>`.

- [ ] **Step 1: Write the failing test**

Create `src/tests/slicing.test.js`:

```js
import { describe, expect, it } from 'vitest';
import {
  backwardSlice, forwardSlice, dynamicSlice, programDice, slicesIntersect,
} from '../utils/slicing.js';

// Minimal PDG:  s1: x=1   s2: y=2   s3: z=x+y   s4: return z
const pdg = {
  statements: [
    { id: 's1', line: 1, text: 'x=1', defs: ['x'], uses: [] },
    { id: 's2', line: 2, text: 'y=2', defs: ['y'], uses: [] },
    { id: 's3', line: 3, text: 'z=x+y', defs: ['z'], uses: ['x', 'y'] },
    { id: 's4', line: 4, text: 'return z', defs: [], uses: ['z'], kind: 'output' },
  ],
  controlDeps: [],
  dataDeps: [['s1', 's3', 'x'], ['s2', 's3', 'y'], ['s3', 's4', 'z']],
};

describe('backwardSlice', () => {
  it('includes every statement affecting the criterion variable', () => {
    const slice = backwardSlice(pdg, { stmtId: 's4', variable: 'z' });
    expect([...slice].sort()).toEqual(['s1', 's2', 's3', 's4']);
  });
  it('a criterion on a never-defined variable yields only the criterion stmt', () => {
    const slice = backwardSlice(pdg, { stmtId: 's3', variable: 'q' });
    expect([...slice]).toEqual(['s3']);
  });
});

describe('forwardSlice', () => {
  it('includes every statement affected by the criterion variable', () => {
    const slice = forwardSlice(pdg, { stmtId: 's1', variable: 'x' });
    expect([...slice].sort()).toEqual(['s1', 's3', 's4']);
  });
});

describe('dynamicSlice', () => {
  it('restricts to the live data-dep edges of a trace', () => {
    // x is redefined at s1b before s3 uses it — only the live def counts.
    const dynPdg = {
      statements: [
        { id: 's1', line: 1, text: 'x=1', defs: ['x'], uses: [] },
        { id: 's1b', line: 2, text: 'x=9', defs: ['x'], uses: [] },
        { id: 's3', line: 3, text: 'z=x', defs: ['z'], uses: ['x'] },
      ],
      controlDeps: [],
      dataDeps: [['s1', 's3', 'x'], ['s1b', 's3', 'x']],
    };
    const trace = { id: 't', steps: ['s1', 's1b', 's3'] };
    const slice = dynamicSlice(dynPdg, trace, { stmtId: 's3', variable: 'x' });
    expect([...slice].sort()).toEqual(['s1b', 's3']); // s1 is shadowed
  });
  it('returns an empty set when the criterion stmt is not executed', () => {
    const trace = { id: 't', steps: ['s1', 's2'] };
    expect(dynamicSlice(pdg, trace, { stmtId: 's4', variable: 'z' }).size).toBe(0);
  });
});

describe('programDice', () => {
  it('keeps statements in the failing slice but in no passing slice', () => {
    const failing = new Set(['s1', 's2', 's3']);
    const passing = [new Set(['s1']), new Set(['s2'])];
    expect([...programDice(failing, passing)]).toEqual(['s3']);
  });
});

describe('slicesIntersect', () => {
  it('is true iff the slices share a statement', () => {
    expect(slicesIntersect(new Set(['a', 'b']), new Set(['b', 'c']))).toBe(true);
    expect(slicesIntersect(new Set(['a']), new Set(['z']))).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/slicing.test.js`
Expected: FAIL — `slicing.js` does not exist.

- [ ] **Step 3: Implement `src/utils/slicing.js`**

```js
// Pure program-slicing engine over an authored Program Dependence Graph.
// A PDG: { statements:[{id,line,text,defs,uses,kind?}],
//          controlDeps:[[from,to]], dataDeps:[[from,to,variable]] }.
// A criterion: { stmtId, variable }. A trace: { id, steps:[stmtId...] }.
// Every slice function returns a Set<stmtId> that includes the criterion
// statement itself.

// Backward slice: statements that may affect `variable` at `stmtId`.
export function backwardSlice(pdg, criterion) {
  const { stmtId, variable } = criterion;
  const slice = new Set([stmtId]);
  const queue = [];
  // Seed: control parents of stmtId, and defs of `variable` flowing into it.
  for (const [from, to] of pdg.controlDeps) {
    if (to === stmtId && !slice.has(from)) { slice.add(from); queue.push(from); }
  }
  for (const [from, to, v] of pdg.dataDeps) {
    if (to === stmtId && v === variable && !slice.has(from)) {
      slice.add(from); queue.push(from);
    }
  }
  // Transitive closure over every dependence edge.
  while (queue.length) {
    const cur = queue.shift();
    for (const [from, to] of pdg.controlDeps) {
      if (to === cur && !slice.has(from)) { slice.add(from); queue.push(from); }
    }
    for (const [from, to] of pdg.dataDeps) {
      if (to === cur && !slice.has(from)) { slice.add(from); queue.push(from); }
    }
  }
  return slice;
}

// Forward slice: statements that may be affected by `variable` at `stmtId`.
export function forwardSlice(pdg, criterion) {
  const { stmtId, variable } = criterion;
  const slice = new Set([stmtId]);
  const queue = [];
  for (const [from, to] of pdg.controlDeps) {
    if (from === stmtId && !slice.has(to)) { slice.add(to); queue.push(to); }
  }
  for (const [from, to, v] of pdg.dataDeps) {
    if (from === stmtId && v === variable && !slice.has(to)) {
      slice.add(to); queue.push(to);
    }
  }
  while (queue.length) {
    const cur = queue.shift();
    for (const [from, to] of pdg.controlDeps) {
      if (from === cur && !slice.has(to)) { slice.add(to); queue.push(to); }
    }
    for (const [from, to] of pdg.dataDeps) {
      if (from === cur && !slice.has(to)) { slice.add(to); queue.push(to); }
    }
  }
  return slice;
}

// The data-dep edges actually exercised by a trace, by the last-definition
// rule: when a use of v executes, only the most recent preceding def of v
// is live. Returns a Set of "from|to|variable" keys.
function liveDataDeps(pdg, trace) {
  const stmtById = new Map(pdg.statements.map((s) => [s.id, s]));
  const lastDef = new Map();
  const live = new Set();
  for (const sid of trace.steps) {
    const st = stmtById.get(sid);
    if (!st) continue;
    for (const v of st.uses || []) {
      const d = lastDef.get(v);
      if (d !== undefined) live.add(`${d}|${sid}|${v}`);
    }
    for (const v of st.defs || []) lastDef.set(v, sid);
  }
  return live;
}

// Dynamic backward slice: backwardSlice restricted to statements executed
// in `trace` and data-dep edges that were live in it.
export function dynamicSlice(pdg, trace, criterion) {
  const { stmtId, variable } = criterion;
  const executed = new Set(trace.steps);
  if (!executed.has(stmtId)) return new Set();
  const live = liveDataDeps(pdg, trace);
  const slice = new Set([stmtId]);
  const queue = [];
  for (const [from, to] of pdg.controlDeps) {
    if (to === stmtId && executed.has(from) && !slice.has(from)) {
      slice.add(from); queue.push(from);
    }
  }
  for (const [from, to, v] of pdg.dataDeps) {
    if (to === stmtId && v === variable
        && live.has(`${from}|${to}|${v}`) && !slice.has(from)) {
      slice.add(from); queue.push(from);
    }
  }
  while (queue.length) {
    const cur = queue.shift();
    for (const [from, to] of pdg.controlDeps) {
      if (to === cur && executed.has(from) && !slice.has(from)) {
        slice.add(from); queue.push(from);
      }
    }
    for (const [from, to, v] of pdg.dataDeps) {
      if (to === cur && live.has(`${from}|${to}|${v}`) && !slice.has(from)) {
        slice.add(from); queue.push(from);
      }
    }
  }
  return slice;
}

// Program dice: statements in the failing slice but in no passing slice.
export function programDice(failingSlice, passingSlices) {
  const dice = new Set(failingSlice);
  for (const ps of passingSlices) {
    for (const s of ps) dice.delete(s);
  }
  return dice;
}

// True iff two slices share at least one statement.
export function slicesIntersect(a, b) {
  for (const s of a) {
    if (b.has(s)) return true;
  }
  return false;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/slicing.test.js`
Expected: PASS — all 8 tests.

- [ ] **Step 5: Commit**

```bash
git add src/utils/slicing.js src/tests/slicing.test.js
git commit -m "$(cat <<'EOF'
feat(slicing): pure program-slicing engine

backwardSlice / forwardSlice / dynamicSlice (last-definition rule) /
programDice / slicesIntersect — graph reachability over an authored PDG.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Authored example PDGs — `src/data/slicingExamples.js`

**Files:**
- Create: `src/data/slicingExamples.js`
- Test: `src/tests/slicingExamples.test.js`

Three examples: `grade-average` (loop accumulator — the design-spec example), `classify` (branchy), `grade-average-buggy` (a seeded fault for N2's reuse). Each follows the design spec's data model exactly.

- [ ] **Step 1: Write the failing integrity test**

Create `src/tests/slicingExamples.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { SLICING_EXAMPLES } from '../data/slicingExamples.js';
import { backwardSlice } from '../utils/slicing.js';

describe('slicingExamples integrity', () => {
  it('has at least three examples, each with a unique id', () => {
    expect(SLICING_EXAMPLES.length).toBeGreaterThanOrEqual(3);
    const ids = SLICING_EXAMPLES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every dependence edge and trace step references a real statement id', () => {
    for (const ex of SLICING_EXAMPLES) {
      const ids = new Set(ex.statements.map((s) => s.id));
      for (const [from, to] of ex.controlDeps) {
        expect(ids.has(from), `${ex.id} controlDep from ${from}`).toBe(true);
        expect(ids.has(to), `${ex.id} controlDep to ${to}`).toBe(true);
      }
      for (const [from, to, v] of ex.dataDeps) {
        expect(ids.has(from), `${ex.id} dataDep from ${from}`).toBe(true);
        expect(ids.has(to), `${ex.id} dataDep to ${to}`).toBe(true);
        expect(typeof v).toBe('string');
      }
      for (const tr of ex.traces) {
        for (const sid of tr.steps) {
          expect(ids.has(sid), `${ex.id} trace ${tr.id} step ${sid}`).toBe(true);
        }
      }
    }
  });

  it('every dataDep variable is declared in the source statements', () => {
    for (const ex of SLICING_EXAMPLES) {
      const byId = new Map(ex.statements.map((s) => [s.id, s]));
      for (const [from, to, v] of ex.dataDeps) {
        expect((byId.get(from).defs || []).includes(v),
          `${ex.id}: ${from} should def ${v}`).toBe(true);
        expect((byId.get(to).uses || []).includes(v),
          `${ex.id}: ${to} should use ${v}`).toBe(true);
      }
    }
  });

  it('grade-average: backward slice of the return covers the whole computation', () => {
    const ex = SLICING_EXAMPLES.find((e) => e.id === 'grade-average');
    const out = ex.statements.find((s) => s.kind === 'output');
    const slice = backwardSlice(ex, { stmtId: out.id, variable: out.uses[0] });
    // Every accumulator + branch statement participates.
    expect(slice.size).toBeGreaterThanOrEqual(6);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/slicingExamples.test.js`
Expected: FAIL — `slicingExamples.js` does not exist.

- [ ] **Step 3: Implement `src/data/slicingExamples.js`**

Author three examples. The `grade-average` example is given in full in the design spec (§ "Data model — the authored PDG") — use that verbatim as the first array entry, including its `source`, `statements`, `controlDeps`, `dataDeps`, and two `traces`. Add a `titleKey` of `'slicing.example.gradeAverage'`.

Add a second example `classify` and a third `grade-average-buggy`:

```js
// classify(n): branch-heavy, two outputs
{
  id: 'classify',
  titleKey: 'slicing.example.classify',
  language: 'javascript',
  source: [
    'function classify(n) {',          // 1
    '  let label = "zero";',           // 2
    '  let sign = 0;',                 // 3
    '  if (n > 0) {',                  // 4
    '    label = "positive";',         // 5
    '    sign = 1;',                   // 6
    '  } else if (n < 0) {',           // 7
    '    label = "negative";',         // 8
    '    sign = -1;',                  // 9
    '  }',                             // 10
    '  return label;',                 // 11
  ],
  statements: [
    { id: 's2', line: 2, text: 'label="zero"',   defs: ['label'], uses: [] },
    { id: 's3', line: 3, text: 'sign=0',          defs: ['sign'],  uses: [] },
    { id: 's4', line: 4, text: 'if n>0',          defs: [], uses: ['n'], kind: 'control' },
    { id: 's5', line: 5, text: 'label="positive"',defs: ['label'], uses: [] },
    { id: 's6', line: 6, text: 'sign=1',          defs: ['sign'],  uses: [] },
    { id: 's7', line: 7, text: 'if n<0',          defs: [], uses: ['n'], kind: 'control' },
    { id: 's8', line: 8, text: 'label="negative"',defs: ['label'], uses: [] },
    { id: 's9', line: 9, text: 'sign=-1',         defs: ['sign'],  uses: [] },
    { id: 's11', line: 11, text: 'return label',  defs: [], uses: ['label'], kind: 'output' },
  ],
  controlDeps: [['s4', 's5'], ['s4', 's6'], ['s4', 's7'], ['s7', 's8'], ['s7', 's9']],
  dataDeps: [
    ['s2', 's11', 'label'], ['s5', 's11', 'label'], ['s8', 's11', 'label'],
  ],
  traces: [
    { id: 'pos',  inputLabel: 'n=5',  label: 'positive',
      steps: ['s2', 's3', 's4', 's5', 's6', 's11'] },
    { id: 'neg',  inputLabel: 'n=-3', label: 'negative',
      steps: ['s2', 's3', 's4', 's7', 's8', 's9', 's11'] },
    { id: 'zero', inputLabel: 'n=0',  label: 'zero',
      steps: ['s2', 's3', 's4', 's7', 's11'] },
  ],
},
```

For `grade-average-buggy`: copy the `grade-average` example object, change `id` to `'grade-average-buggy'`, `titleKey` to `'slicing.example.gradeAverageBuggy'`, and seed a fault — statement `s6` reads the wrong variable: change its `text` to `'count = count + s'`, set `uses: ['count', 's']`, and add the data-dep `['s4', 's6', 's']` (the loop variable `s` now flows into `s6`). Add a `bug: { stmtId: 's6', note: 'counts the score value, not 1' }` field so N2 can reference the seeded fault. Keep its traces (they exercise `s6`).

Export them as a single array:

```js
export const SLICING_EXAMPLES = [
  /* grade-average */ { ... },
  /* classify */      { ... },
  /* grade-average-buggy */ { ... },
];

export function getSlicingExample(id) {
  return SLICING_EXAMPLES.find((e) => e.id === id) ?? null;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/slicingExamples.test.js`
Expected: PASS — all four `it` blocks. If the "dataDep variable declared" test fails, fix the example's `defs`/`uses` to match the declared `dataDeps` (the test is the source of truth for consistency).

- [ ] **Step 5: Commit**

```bash
git add src/data/slicingExamples.js src/tests/slicingExamples.test.js
git commit -m "$(cat <<'EOF'
feat(slicing): authored example PDGs

grade-average, classify, and a seeded-fault grade-average-buggy — each
with statements, control/data dependence edges, and execution traces.
An integrity test keeps the edges and traces consistent.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Shared render helper — `src/components/SlicePdgView.js`

**Files:**
- Create: `src/components/SlicePdgView.js`
- Test: `src/tests/SlicePdgView.test.jsx`

A pure render helper (no state): given an example and a `Set` of sliced statement ids, returns an HTML string with (a) the source listing, each statement line tinted if in the slice, and (b) an inline SVG dependence graph — one node per statement, control-dep edges solid, data-dep edges dashed, sliced nodes highlighted.

- [ ] **Step 1: Write the failing test**

Create `src/tests/SlicePdgView.test.jsx`:

```js
import { describe, expect, it } from 'vitest';
import { renderSlicePdgView } from '../components/SlicePdgView.js';
import { SLICING_EXAMPLES } from '../data/slicingExamples.js';

const ex = SLICING_EXAMPLES.find((e) => e.id === 'grade-average');

describe('renderSlicePdgView', () => {
  it('renders one source line per source entry', () => {
    const html = renderSlicePdgView(ex, new Set());
    for (const line of ex.source) {
      expect(html).toContain(line.replace(/</g, '&lt;'));
    }
  });
  it('marks sliced statements with the slice class', () => {
    const html = renderSlicePdgView(ex, new Set(['s2']));
    expect(html).toMatch(/data-stmt="s2"[^>]*slice-stmt--in/);
  });
  it('renders an svg dependence graph', () => {
    const html = renderSlicePdgView(ex, new Set());
    expect(html).toContain('<svg');
    expect(html).toContain('data-pdg-node="s2"');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/SlicePdgView.test.jsx`
Expected: FAIL — `SlicePdgView.js` does not exist.

- [ ] **Step 3: Implement `src/components/SlicePdgView.js`**

Export `renderSlicePdgView(example, sliceSet, options = {})`. Requirements:
- Escape `<`/`>`/`&` in all source text and statement text.
- Render the source as a `<ol class="slice-code">`; each `<li data-stmt="<id>">` for a line that maps to a statement, with class `slice-stmt slice-stmt--in` when the id is in `sliceSet`, else `slice-stmt`. Lines with no statement (e.g. `}`) render as plain `<li>`.
- Render an inline `<svg>`: lay statement nodes out vertically in source order at a fixed x; each node is a `<circle>`/`<text>` group with `data-pdg-node="<id>"`, given class `pdg-node--in` when sliced. Draw `controlDeps` as solid `<path>`/`<line>` and `dataDeps` as `stroke-dasharray` dashed lines. A curved edge is fine; exact geometry is the implementer's choice.
- `options.idPrefix` (default `'slice'`) namespaces any SVG marker ids.
- No DOM APIs — return a string, like the other render helpers in `src/utils/pathToCfg.js`.

Read `src/utils/pathToCfg.js` `renderCfgSvg` for the established SVG-string idiom (markers, node circles, edge paths) and follow it.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/SlicePdgView.test.jsx`
Expected: PASS — all three tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/SlicePdgView.js src/tests/SlicePdgView.test.jsx
git commit -m "$(cat <<'EOF'
feat(slicing): shared code + PDG render helper

renderSlicePdgView returns source-with-slice-highlight beside an SVG
dependence graph (control edges solid, data edges dashed).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: The Explorer — `ProgramSlicingExplorer`

**Files:**
- Create: `src/components/ProgramSlicingExplorer.js`, `src/components/ProgramSlicingExplorer.css`
- Test: `src/tests/ProgramSlicingExplorer.test.jsx`

A `createProgramSlicingExplorer()` factory returning a root `<div>`, following the idiom of a recent Explorer — **read `src/components/AgileQuadrantsExplorer.js` as the structural template** (factory, `root.dataset.testid`, module-level `state`, `render()` + `bindEvents()`, quiz panel, `i18n` `t()` + `onLocaleChange` re-render).

Behaviour:
- Root `data-testid="program-slicing-explorer"`.
- Example chips (`data-testid="slicing-example-<id>"`) — one per `SLICING_EXAMPLES` entry.
- Clicking a source statement (`data-stmt`) selects it as the criterion statement; a variable picker (`data-testid="slicing-var-<name>"`) lists that statement's `defs ∪ uses`.
- Direction toggle: `data-testid="slicing-dir-backward"` / `slicing-dir-forward`.
- Mode toggle: `data-testid="slicing-mode-static"` / `slicing-mode-dynamic`. In dynamic mode a trace picker (`data-testid="slicing-trace-<id>"`) appears.
- On any change, recompute the slice via `backwardSlice` / `forwardSlice` / `dynamicSlice` and re-render the `SlicePdgView`.
- A detail panel `data-testid="slicing-detail"` shows the slice's statement count and, in dynamic mode, the static-vs-dynamic size delta.
- Quiz mode (`data-testid="slicing-quiz-start"` etc.) — one multiple-choice question per example: "which statements are in the backward slice of `<criterion>`?", answer key `'c'` by convention. Mirror the quiz panel of `AgileQuadrantsExplorer`.
- `ProgramSlicingExplorer.css` — styles for `.slice-code`, `.slice-stmt--in`, `.pdg-node--in`; follow the visual idiom of `src/components/GroupTheoryExplorer.css`.

- [ ] **Step 1: Write the failing test**

Create `src/tests/ProgramSlicingExplorer.test.jsx`:

```js
import { describe, expect, it, beforeEach } from 'vitest';
import { createProgramSlicingExplorer } from '../components/ProgramSlicingExplorer.js';

describe('ProgramSlicingExplorer', () => {
  let root;
  beforeEach(() => { root = createProgramSlicingExplorer(); document.body.appendChild(root); });

  it('renders with the root testid and example chips', () => {
    expect(root.dataset.testid).toBe('program-slicing-explorer');
    expect(root.querySelector('[data-testid="slicing-example-grade-average"]')).toBeTruthy();
  });

  it('selecting a statement then a variable highlights a non-empty slice', () => {
    const stmt = root.querySelector('[data-stmt]');
    stmt.click();
    const varBtn = root.querySelector('[data-testid^="slicing-var-"]');
    varBtn.click();
    expect(root.querySelectorAll('.slice-stmt--in').length).toBeGreaterThan(0);
  });

  it('switching to dynamic mode reveals a trace picker', () => {
    root.querySelector('[data-testid="slicing-mode-dynamic"]').click();
    expect(root.querySelector('[data-testid^="slicing-trace-"]')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/ProgramSlicingExplorer.test.jsx`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement the component + CSS**

Build `ProgramSlicingExplorer.js` and `.css` to satisfy the behaviour list above and the three tests. Use `backwardSlice`/`forwardSlice`/`dynamicSlice` from `../utils/slicing.js`, `SLICING_EXAMPLES` from `../data/slicingExamples.js`, `renderSlicePdgView` from `./SlicePdgView.js`, and `t`/`getLocale`/`onLocaleChange` from `../i18n/index.js`. Mirror `AgileQuadrantsExplorer.js`'s factory/render/quiz structure.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/ProgramSlicingExplorer.test.jsx`
Expected: PASS — all three tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProgramSlicingExplorer.js src/components/ProgramSlicingExplorer.css src/tests/ProgramSlicingExplorer.test.jsx
git commit -m "$(cat <<'EOF'
feat(slicing): Program Slicing Explorer (N1)

Pick a criterion, see the backward/forward slice highlighted on the
code + PDG; toggle static vs dynamic. Includes quiz mode.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Section wiring

**Files:**
- Modify: `src/app.js`, `src/utils/urlRouter.js`, `src/data/explorerTags.js`, `src/i18n/dict.js`, `src/styles.css`
- Test: `src/tests/urlRouter.test.js`, `src/tests/explorerTags.test.js`

Wire the `slicing` section. **The agile (`M`) section is the template — mirror it.**

- [ ] **Step 1: urlRouter — register the section**

In `src/utils/urlRouter.js`, add to `TAB_SECTIONS`:

```js
  // Section N — slice-based testing. N1 ships 'program'; N2-N4 tabs are
  // added to this list as their plans land.
  slicing: { tabs: ['program', 'dicing', 'coverage', 'regression'], default: 'program' },
```

and add to `EXPLORER_TO_LOCATION`:

```js
  ProgramSlicingExplorer:      { section: 'slicing', tab: 'program' },
```

- [ ] **Step 2: explorerTags — extend vocab + add the entry**

In `src/data/explorerTags.js`: append `'slicing'` to `TAG_TECHNIQUES`, and append `'slicing'` to `TAG_SERIES`. Add to `EXPLORER_TAGS`:

```js
  ProgramSlicingExplorer: {
    level: ['unit'],
    technique: ['slicing'],
    series: ['slicing'],
    difficulty: 'intermediate',
    source: ['textbook'],
  },
```

- [ ] **Step 3: i18n — add keys**

In `src/i18n/dict.js`, add to BOTH the `en` and `zh` objects: `section.slicing` / `section.slicing.title`, `tag.technique.slicing`, `tag.series.slicing`, `slicing.example.gradeAverage`, `slicing.example.gradeAverageBuggy`, `slicing.example.classify`, and every `slicing.*` UI string the Explorer's `t()` calls reference. Match the existing key style; English in `en`, Traditional Chinese in `zh`.

- [ ] **Step 4: app.js — wire the section**

In `src/app.js`, mirroring the agile section in every spot:
- `import { createProgramSlicingExplorer } from './components/ProgramSlicingExplorer.js';`
- a `slicing` nav entry in the section list (`{ id: 'slicing', key: 'section.slicing' }`);
- the overview-group `sectionIds` array that lists the new section;
- `<section data-testid="section-slicing" tabindex="-1" aria-labelledby="section-slicing-title"><h2 id="section-slicing-title">${t('section.slicing.title')}</h2><div data-slot="slicing"></div></section>` in the main markup;
- `slicing: main.querySelector('[data-testid="section-slicing"]')` in the `sections` map;
- `programslicing: createProgramSlicingExplorer()` in the `components` map;
- a tabbed-section block for `slicing` modelled on the agile block — a tab bar with `data-slicing-tab` buttons, panels keyed `data-slicing-panel`, `STORAGE`/`resolveInitialTab` wiring. Only the `program` tab has a component now; the other three render a short "coming soon" placeholder `<p>` (no Explorer). `getCurrentTabForSection` gains a `case 'slicing':` returning the active slicing tab.

- [ ] **Step 5: styles.css — import the CSS**

In `src/styles.css`, add `@import './components/ProgramSlicingExplorer.css';` alongside the other component imports.

- [ ] **Step 6: Update integrity tests**

`src/tests/urlRouter.test.js`: add a test that `parseAppLocation('?explorer=ProgramSlicingExplorer')` resolves to `{ explorer:'ProgramSlicingExplorer', section:'slicing', tab:'program' }`. `src/tests/explorerTags.test.js`: the existing scan that "every component file has a tag entry" must still pass — confirm `ProgramSlicingExplorer` has its entry and the new `SlicePdgView.js` (a helper, not an Explorer) is added to that test's exclusion list if the scan flags it.

- [ ] **Step 7: Run the full suite**

Run: `npx vitest run`
Expected: PASS — all tests green, no regressions.

- [ ] **Step 8: Commit**

```bash
git add src/app.js src/utils/urlRouter.js src/data/explorerTags.js src/i18n/dict.js src/styles.css src/tests/urlRouter.test.js src/tests/explorerTags.test.js
git commit -m "$(cat <<'EOF'
feat(slicing): wire the slicing section (N1 tab live)

New `slicing` section with the Program Slicing tab; the dicing /
coverage / regression tabs are registered but placeholder until N2-N4.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Lecture deck #58

**Files:**
- Create: `docs/slides/58-program-slicing.en.md`, `docs/slides/58-program-slicing.zh-TW.md`
- Modify: `scripts/build-slide-decks.mjs`, `src/data/slideDecks.generated.js` (generated), `src/tests/slideDecks.test.js`

- [ ] **Step 1: Write the two decks**

Create `docs/slides/58-program-slicing.{en,zh-TW}.md` following the exact template of an existing recent deck (e.g. `docs/slides/52-agile-quadrants.{en,zh-TW}.md`): Marp front-matter (`marp: true`, `theme: default`, `paginate: true`, `size: 16:9`, `title`, `description`, `lang`), then slides — motivation, the PDG (control + data dependence), backward vs forward slice, static vs dynamic, a worked example on `grade-average`, a tool-demo slide pointing at `/section-slicing`, summary + exercise, further reading. Screenshots are added later by the screenshot programme — do not embed images now.

- [ ] **Step 2: Register the deck**

In `scripts/build-slide-decks.mjs`, append to the `DECKS` array:

```js
  { base: '58-program-slicing', id: 'program-slicing', num: 58, section: 'slicing' },
```

- [ ] **Step 3: Regenerate the bundled deck data**

Run: `npm run build:slide-decks`
Expected: console prints `slideDecks: wrote 58 decks`.

- [ ] **Step 4: Update the deck-count test**

In `src/tests/slideDecks.test.js`, change the expected deck count from `57` to `58`.

- [ ] **Step 5: Run the slide tests**

Run: `npx vitest run src/tests/slideDecks.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add docs/slides/58-program-slicing.en.md docs/slides/58-program-slicing.zh-TW.md scripts/build-slide-decks.mjs src/data/slideDecks.generated.js src/tests/slideDecks.test.js
git commit -m "$(cat <<'EOF'
docs(slides): deck #58 — program slicing

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Plan.md §N + finalize

**Files:**
- Modify: `Plan.md`

- [ ] **Step 1: Add §N to Plan.md**

After the §M section, add a `## N. Slice-Based Testing Explorer` section: the teaching gap, the four-tab plan (N1 done; N2 Dicing / N3 Slice Coverage / N4 Regression — 待實作), and a pointer to `docs/superpowers/specs/2026-05-18-slice-based-testing-design.md`. Mark N1 complete.

- [ ] **Step 2: Run the full suite**

Run: `npx vitest run`
Expected: PASS — every test green.

- [ ] **Step 3: Commit**

```bash
git add Plan.md
git commit -m "$(cat <<'EOF'
docs(plan): add §N slice-based testing; N1 complete

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Push and open the PR**

```bash
git push -u origin feat/slice-based-testing
gh pr create --title "feat(slicing): N1 — Program Slicing Explorer + slicing section" --body "Implements N1 of the slice-based testing section: the pure slicing engine, authored example PDGs, the Program Slicing Explorer, the new \`slicing\` section, and lecture deck #58. N2-N4 follow in their own PRs. Spec: docs/superpowers/specs/2026-05-18-slice-based-testing-design.md"
```

---

## Self-review notes

- **Spec coverage:** Task 1 ↔ slicing.js engine; Task 2 ↔ slicingExamples.js + integrity; Task 3 ↔ SlicePdgView; Task 4 ↔ ProgramSlicingExplorer (N1); Task 5 ↔ all wiring rows of the spec's architecture table; Task 6 ↔ deck #58; Task 7 ↔ Plan.md. N2/N3/N4 are explicitly out of this plan (own plans later) per the spec's build order.
- **Engine signatures** are fixed in Task 1 and referenced unchanged in Tasks 3–4: `backwardSlice(pdg, criterion)`, `forwardSlice(pdg, criterion)`, `dynamicSlice(pdg, trace, criterion)`, `programDice`, `slicesIntersect` — `criterion` is always `{ stmtId, variable }`.
- **Data model** (`statements/controlDeps/dataDeps/traces`, dataDeps as `[from,to,variable]` triples) is fixed in the spec and used identically by Tasks 1–4.
- Tasks 4–6 reference named template files (`AgileQuadrantsExplorer.js`, `52-agile-quadrants` decks, the agile section block) rather than inlining hundreds of mirrored lines — the executing subagent reads those templates directly.
