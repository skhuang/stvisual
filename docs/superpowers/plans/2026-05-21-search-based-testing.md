# Search-Based Software Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Search-Based Software Testing (SBST) section to the stvisual course — a shared metaheuristic search engine, three interactive explorer tabs, and a bilingual slide deck #65.

**Architecture:** A dependency-free, deterministic (seeded-RNG) search engine in `src/utils/searchBasedTesting.js` powers three explorer components. Examples are authored instrumented JS functions in `src/data/sbstExamples.js`. The section registers in the existing `generation` taxonomy category and follows the established multi-tab section pattern (the `exploit` section is the structural precedent).

**Tech Stack:** Vanilla-JS ES modules; vitest + jsdom; Playwright capture; Marp slide decks; esbuild standalone bundle.

---

## Background the engineer needs

- **The repo** is at `/Users/skhuang/course/stvisual`. Work on the current git branch `feat/search-based-testing` — do not switch branches. Two pre-existing untracked files (`.claude/`, `PLAN_group_theory_testing.md`) must never be committed; always `git add` specific files.
- **Explorer pattern.** Every explorer is a factory `createXxxExplorer()` returning a root `<div>` with a unique `data-testid`. It renders its own HTML into the root, binds events after each render, and re-renders on `onLocaleChange`. **`src/components/ExploitOverflowExplorer.js` is the structural precedent for this plan** — read it before Tasks 6–8. It shows: module-level `state`, an `esc()` HTML-escape helper, `render()` → `root.innerHTML = …` → `bindEvents()`, a phase/step control row, predict-mode self-test, and a quiz block.
- **Section wiring.** A tabbed section is wired in `src/app.js`. The `exploit` section (app.js ≈ lines 196, 719–789) is the exact template: a `<section data-testid="section-…">` with a `<div data-slot="…">`, a `…-tab-row` nav, panels, `resolveInitialTab(...)`, a localStorage tab key, `render…Tabs()` / `update…Panels()`.
- **Section registration** touches: `src/data/sectionTaxonomy.js` (category membership), `src/utils/urlRouter.js` (`TAB_SECTIONS` + `EXPLORER_TO_LOCATION`), `src/app.js` (the `<section>`, the `components` map, the tab wiring), `src/i18n/dict.js` (`en` + `zh` string maps).
- **Slide-deck pipeline.** `scripts/build-slide-decks.mjs` has a `DECKS` array (last entry #64). `npm run build:slide-decks` reads `docs/slides/<base>.{en,zh-TW}.md`, writes `src/data/slideDecks.generated.js`, copies referenced PNGs to `public/slide-assets/`. `src/tests/slideDecks.test.js` asserts the deck count (currently **64**). After `slideDecks.generated.js` changes, `npm run build:standalone` must rebuild `src/standalone.js` (CI `standalone-bundle` guard).
- **Screenshot capture.** Standalone Playwright scripts in `scripts/` serve the app with `python3 -m http.server 4173`, drive an explorer via `?explorer=<ComponentName>`, set locale via `SLIDE_LOCALE`, save PNGs to `docs/assets/slides/` (zh bare name, en `-en` suffix). `scripts/capture-exploit-screenshots.mjs` is the precedent.
- **Tests** live in `src/tests/`. vitest + jsdom. Run a single file with `npx vitest run src/tests/<file>`.
- **Determinism is a hard requirement.** Every search takes an explicit integer `seed`; the same seed must always produce the same result, so unit tests and captured screenshots are reproducible.

## File Structure

| File | Responsibility |
|---|---|
| `src/utils/searchBasedTesting.js` | The search engine: seeded RNG, branch distance, fitness, the three metaheuristics, whole-suite search |
| `src/data/sbstExamples.js` | Authored instrumented example SUTs |
| `src/components/SbstBranchExplorer.js` + `.css` | Tab 1 — GA branch search |
| `src/components/SbstCompareExplorer.js` + `.css` | Tab 2 — metaheuristic comparison |
| `src/components/SbstSuiteExplorer.js` + `.css` | Tab 3 — whole-suite evolution |
| `docs/slides/65-search-based-testing.{en,zh-TW}.md` | Deck #65 |
| `scripts/capture-sbst-screenshots.mjs` | Screenshot capture |
| `src/tests/searchBasedTesting.test.js` | Engine unit tests |
| `src/tests/sbstExamples.test.js` | Example-data tests |
| `src/tests/SbstBranchExplorer.test.js` / `SbstCompareExplorer.test.js` / `SbstSuiteExplorer.test.js` | Explorer tests |

**Modified:** `src/data/sectionTaxonomy.js`, `src/utils/urlRouter.js`, `src/app.js`, `src/i18n/dict.js`, `scripts/build-slide-decks.mjs`, `src/data/slideDecks.generated.js`, `src/standalone.js`, `src/tests/slideDecks.test.js`.

---

## Task 1: Search engine — seeded RNG and branch distance

**Files:**
- Create: `src/utils/searchBasedTesting.js`
- Test: `src/tests/searchBasedTesting.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/tests/searchBasedTesting.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { makeRng, rngInt, branchDistance, normalize } from '../utils/searchBasedTesting.js';

describe('makeRng', () => {
  it('is deterministic for a given seed', () => {
    const a = makeRng(42); const b = makeRng(42);
    const seqA = [a(), a(), a()]; const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });
  it('produces values in [0, 1)', () => {
    const r = makeRng(7);
    for (let i = 0; i < 1000; i++) { const v = r(); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1); }
  });
  it('different seeds produce different sequences', () => {
    expect(makeRng(1)()).not.toEqual(makeRng(2)());
  });
});

describe('rngInt', () => {
  it('stays within [lo, hi] inclusive', () => {
    const r = makeRng(99);
    for (let i = 0; i < 1000; i++) { const v = rngInt(r, -5, 5); expect(v).toBeGreaterThanOrEqual(-5); expect(v).toBeLessThanOrEqual(5); expect(Number.isInteger(v)).toBe(true); }
  });
});

describe('branchDistance', () => {
  it('is 0 when the predicate is already true', () => {
    expect(branchDistance('==', 5, 5)).toBe(0);
    expect(branchDistance('<', 3, 9)).toBe(0);
    expect(branchDistance('>', 9, 3)).toBe(0);
    expect(branchDistance('!=', 3, 9)).toBe(0);
  });
  it('grows with the gap for ==', () => {
    expect(branchDistance('==', 10, 17)).toBe(7);
    expect(branchDistance('==', 17, 17)).toBe(0);
  });
  it('uses constant K=1 for strict operators just past the boundary', () => {
    expect(branchDistance('<', 5, 5)).toBe(1);   // need 5 < 5 false → distance K
    expect(branchDistance('>', 5, 5)).toBe(1);
    expect(branchDistance('!=', 4, 4)).toBe(1);
  });
  it('throws on an unknown operator', () => {
    expect(() => branchDistance('~~', 1, 2)).toThrow();
  });
});

describe('normalize', () => {
  it('maps 0 to 0 and grows monotonically toward 1', () => {
    expect(normalize(0)).toBe(0);
    expect(normalize(1)).toBeCloseTo(0.5);
    expect(normalize(1e9)).toBeLessThan(1);
    expect(normalize(10)).toBeGreaterThan(normalize(3));
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/tests/searchBasedTesting.test.js`
Expected: FAIL — `searchBasedTesting.js` does not exist.

- [ ] **Step 3: Create `src/utils/searchBasedTesting.js` with the RNG and distance functions**

```js
// Search-Based Software Testing engine — a deterministic, dependency-free
// metaheuristic search over numeric input vectors, guided by a fitness
// function built from branch distance and approach level.

// ── Seeded RNG ──────────────────────────────────────────────────────────────
// mulberry32: a small, well-distributed 32-bit PRNG. Deterministic — the same
// seed always yields the same sequence, so searches are reproducible.
export function makeRng(seed) {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Integer in [lo, hi] inclusive, drawn from an rng() in [0, 1).
export function rngInt(rng, lo, hi) {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

// ── Branch distance ─────────────────────────────────────────────────────────
// For a decision `lhs OP rhs`, how far the operands are from making the
// predicate TRUE. 0 means it is already true. Standard Korel/Tracey formulas
// with constant K = 1.
const K = 1;
export function branchDistance(op, lhs, rhs) {
  switch (op) {
    case '==': return Math.abs(lhs - rhs);
    case '!=': return lhs !== rhs ? 0 : K;
    case '<':  return lhs < rhs ? 0 : (lhs - rhs) + K;
    case '<=': return lhs <= rhs ? 0 : (lhs - rhs);
    case '>':  return lhs > rhs ? 0 : (rhs - lhs) + K;
    case '>=': return lhs >= rhs ? 0 : (rhs - lhs);
    default:   throw new Error(`branchDistance: unknown operator ${op}`);
  }
}

// Normalise a non-negative distance into [0, 1).
export function normalize(d) {
  return d / (d + 1);
}

// Operator that is true exactly when the given operator is false.
export const NEGATE = { '==': '!=', '!=': '==', '<': '>=', '>=': '<', '<=': '>', '>': '<=' };
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/tests/searchBasedTesting.test.js`
Expected: PASS — all RNG / branchDistance / normalize tests green.

- [ ] **Step 5: Commit**

```bash
git add src/utils/searchBasedTesting.js src/tests/searchBasedTesting.test.js
git commit -m "feat(sbst): seeded RNG and branch-distance functions"
```

---

## Task 2: Example SUTs

**Files:**
- Create: `src/data/sbstExamples.js`
- Test: `src/tests/sbstExamples.test.js`

**Example model.** Each example is an object:
```
{
  id: string,
  nameKey: string,            // i18n key for the chip label
  source: string,             // human-readable source for the code panel
  inputSchema: [{ name, min, max }],   // numeric input components, in order
  branches: [{ id, op, requires: [{ branchId, outcome }] }],  // every decision
  target: { branchId, outcome },        // the branch the search must cover
  run(inputs, probe),         // instrumented execution
}
```
`run` calls `probe(branchId, op, lhs, rhs, outcome)` at every decision, in
execution order. `inputs` is an array aligned to `inputSchema`. `branches[].requires`
lists the enclosing decisions (and the outcome each must take) needed to reach
that branch; an outermost branch has `requires: []`. Target paths must be
loop-free (each branch on the path is hit at most once).

- [ ] **Step 1: Write the failing tests**

Create `src/tests/sbstExamples.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { SBST_EXAMPLES } from '../data/sbstExamples.js';

describe('SBST_EXAMPLES', () => {
  it('ships at least three examples, each well-formed', () => {
    expect(SBST_EXAMPLES.length).toBeGreaterThanOrEqual(3);
    for (const ex of SBST_EXAMPLES) {
      expect(typeof ex.id).toBe('string');
      expect(typeof ex.nameKey).toBe('string');
      expect(typeof ex.source).toBe('string');
      expect(Array.isArray(ex.inputSchema)).toBe(true);
      expect(ex.inputSchema.length).toBeGreaterThan(0);
      for (const s of ex.inputSchema) {
        expect(typeof s.name).toBe('string');
        expect(s.min).toBeLessThan(s.max);
      }
      expect(typeof ex.run).toBe('function');
      const ids = ex.branches.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);             // unique branch ids
      expect(ids).toContain(ex.target.branchId);              // target is a real branch
      for (const b of ex.branches) {
        for (const req of b.requires) expect(ids).toContain(req.branchId);
      }
    }
  });
  it('run() probes decisions for every example without throwing', () => {
    for (const ex of SBST_EXAMPLES) {
      const events = [];
      ex.run(ex.inputSchema.map((s) => s.min),
        (branchId, op, lhs, rhs, outcome) => events.push({ branchId, op, lhs, rhs, outcome }));
      for (const e of events) {
        expect(ex.branches.some((b) => b.id === e.branchId)).toBe(true);
        expect(typeof e.outcome).toBe('boolean');
      }
    }
  });
  it('has one example with a nested guard whose target is hard for random search', () => {
    const nested = SBST_EXAMPLES.find((ex) => ex.id === 'nested-guard');
    expect(nested).toBeTruthy();
    const target = nested.branches.find((b) => b.id === nested.target.branchId);
    expect(target.requires.length).toBeGreaterThanOrEqual(1);   // at least one enclosing decision
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/tests/sbstExamples.test.js`
Expected: FAIL — `sbstExamples.js` does not exist.

- [ ] **Step 3: Create `src/data/sbstExamples.js`**

```js
// Authored example programs for the SBST explorers. Each is an instrumented
// function: run(inputs, probe) calls probe(branchId, op, lhs, rhs, outcome) at
// every decision. The search engine derives branch distance + approach level
// from the probe trace. Display-only source strings accompany each.

export const SBST_EXAMPLES = [
  {
    id: 'nested-guard',
    nameKey: 'sbst.example.nestedGuard',
    source: [
      'function classify(x, y) {',
      '  if (x === 17) {        // b1',
      '    if (y > 100) {       // b2  ← target',
      '      return "JACKPOT";',
      '    }',
      '  }',
      '  return "none";',
      '}',
    ].join('\n'),
    inputSchema: [
      { name: 'x', min: 0, max: 50 },
      { name: 'y', min: 0, max: 200 },
    ],
    branches: [
      { id: 'b1', op: '==', requires: [] },
      { id: 'b2', op: '>',  requires: [{ branchId: 'b1', outcome: true }] },
    ],
    target: { branchId: 'b2', outcome: true },
    run([x, y], probe) {
      const c1 = x === 17;
      probe('b1', '==', x, 17, c1);
      if (c1) {
        const c2 = y > 100;
        probe('b2', '>', y, 100, c2);
      }
    },
  },
  {
    id: 'triangle',
    nameKey: 'sbst.example.triangle',
    source: [
      'function classify(a, b, c) {',
      '  if (a === b) {         // b1',
      '    if (b === c) {       // b2  ← target (equilateral)',
      '      return "equilateral";',
      '    }',
      '    return "isosceles";',
      '  }',
      '  return "scalene";',
      '}',
    ].join('\n'),
    inputSchema: [
      { name: 'a', min: 1, max: 30 },
      { name: 'b', min: 1, max: 30 },
      { name: 'c', min: 1, max: 30 },
    ],
    branches: [
      { id: 'b1', op: '==', requires: [] },
      { id: 'b2', op: '==', requires: [{ branchId: 'b1', outcome: true }] },
    ],
    target: { branchId: 'b2', outcome: true },
    run([a, b, c], probe) {
      const c1 = a === b;
      probe('b1', '==', a, b, c1);
      if (c1) {
        const c2 = b === c;
        probe('b2', '==', b, c, c2);
      }
    },
  },
  {
    id: 'multimodal',
    nameKey: 'sbst.example.multimodal',
    source: [
      'function check(x) {',
      '  const r = x % 20;     // non-monotone — creates many basins',
      '  if (r === 7) {        // b1',
      '    if (x > 50) {       // b2  ← target',
      '      return "hit";',
      '    }',
      '  }',
      '  return "miss";',
      '}',
    ].join('\n'),
    inputSchema: [{ name: 'x', min: 0, max: 100 }],
    branches: [
      { id: 'b1', op: '==', requires: [] },
      { id: 'b2', op: '>',  requires: [{ branchId: 'b1', outcome: true }] },
    ],
    target: { branchId: 'b2', outcome: true },
    run([x], probe) {
      const r = x % 20;
      const c1 = r === 7;
      probe('b1', '==', r, 7, c1);
      if (c1) {
        const c2 = x > 50;
        probe('b2', '>', x, 50, c2);
      }
    },
  },
];
```

> **Why `multimodal` is shaped this way:** `x % 20` makes the fitness landscape
> multi-basin. The target needs `r === 7` **and** `x > 50`, so the covering
> inputs are `x ∈ {67, 87}`, while `x ∈ {7, 27, 47}` are non-covering **local
> optima** — the `r === 7` guard is satisfied but `x > 50` is not, and every ±1
> neighbour diverges at the guard and scores worse. A single-trajectory hill
> climb can settle on one of these; the genetic algorithm's population escapes
> them. This is what Task 7's comparison tab and the `sbst-compare-stuck`
> screenshot illustrate.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/tests/sbstExamples.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/sbstExamples.js src/tests/sbstExamples.test.js
git commit -m "feat(sbst): authored instrumented example SUTs"
```

---

## Task 3: Fitness — trace, approach level, cost

**Files:**
- Modify: `src/utils/searchBasedTesting.js` (append)
- Modify: `src/tests/searchBasedTesting.test.js` (append)

- [ ] **Step 1: Write the failing tests**

Append to `src/tests/searchBasedTesting.test.js`:

```js
import { trace, evaluate } from '../utils/searchBasedTesting.js';
import { SBST_EXAMPLES } from '../data/sbstExamples.js';

const nested = SBST_EXAMPLES.find((e) => e.id === 'nested-guard');

describe('trace', () => {
  it('records every probed decision in execution order', () => {
    const events = trace(nested, [17, 50]);
    expect(events.map((e) => e.branchId)).toEqual(['b1', 'b2']);
    expect(events[0].outcome).toBe(true);   // x === 17
    expect(events[1].outcome).toBe(false);  // 50 > 100 is false
  });
  it('stops at an unsatisfied outer guard', () => {
    const events = trace(nested, [3, 150]);
    expect(events.map((e) => e.branchId)).toEqual(['b1']);  // x !== 17 → b2 unreached
  });
});

describe('evaluate', () => {
  it('reports cost 0 and covered when the target branch is taken', () => {
    const r = evaluate(nested, [17, 150]);
    expect(r.covered).toBe(true);
    expect(r.cost).toBe(0);
  });
  it('charges approach level 1 when the outer guard diverges', () => {
    const r = evaluate(nested, [10, 150]);   // x !== 17 → diverge at b1
    expect(r.covered).toBe(false);
    expect(r.approachLevel).toBe(1);          // b2 still ahead
    // branch distance at b1: |10 - 17| = 7 → normalize(7) = 7/8
    expect(r.branchDistance).toBeCloseTo(7 / 8);
    expect(r.cost).toBeCloseTo(1 + 7 / 8);
  });
  it('charges approach level 0 when only the target predicate misses', () => {
    const r = evaluate(nested, [17, 90]);     // reached b2, 90 > 100 false
    expect(r.covered).toBe(false);
    expect(r.approachLevel).toBe(0);
    // distance to make 90 > 100 true: branchDistance('>',90,100) = (100-90)+1 = 11
    expect(r.branchDistance).toBeCloseTo(11 / 12);
    expect(r.cost).toBeCloseTo(11 / 12);
  });
  it('a lower cost means closer to covering the target', () => {
    expect(evaluate(nested, [17, 99]).cost).toBeLessThan(evaluate(nested, [17, 10]).cost);
    expect(evaluate(nested, [16, 150]).cost).toBeLessThan(evaluate(nested, [0, 150]).cost);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/tests/searchBasedTesting.test.js`
Expected: FAIL — `trace` / `evaluate` not exported.

- [ ] **Step 3: Append the fitness functions to `src/utils/searchBasedTesting.js`**

```js
// ── Fitness ─────────────────────────────────────────────────────────────────
// Run an example's instrumented function and collect the decision trace.
export function trace(example, inputs) {
  const events = [];
  example.run(inputs, (branchId, op, lhs, rhs, outcome) =>
    events.push({ branchId, op, lhs, rhs, outcome }));
  return events;
}

// Evaluate an input vector against the example's target branch.
// Returns { covered, approachLevel, branchDistance, cost }. cost === 0 ⇔ covered.
// cost = approachLevel + normalised branch distance at the first divergence.
export function evaluate(example, inputs) {
  const events = trace(example, inputs);
  const branch = example.branches.find((b) => b.id === example.target.branchId);
  const required = [...branch.requires, { branchId: example.target.branchId, outcome: example.target.outcome }];
  for (let i = 0; i < required.length; i++) {
    const req = required[i];
    const ev = events.find((e) => e.branchId === req.branchId);
    if (ev && ev.outcome === req.outcome) continue;   // satisfied — descend
    const approachLevel = required.length - i - 1;
    let raw;
    if (ev) {
      const op = req.outcome ? ev.op : NEGATE[ev.op];
      raw = branchDistance(op, ev.lhs, ev.rhs);
    } else {
      raw = Infinity;   // decision never reached — no operands available
    }
    const bd = raw === Infinity ? 1 : normalize(raw);
    return { covered: false, approachLevel, branchDistance: bd, cost: approachLevel + bd };
  }
  return { covered: true, approachLevel: 0, branchDistance: 0, cost: 0 };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/tests/searchBasedTesting.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/searchBasedTesting.js src/tests/searchBasedTesting.test.js
git commit -m "feat(sbst): fitness — trace, approach level, cost"
```

---

## Task 4: Metaheuristic drivers — random search, hill climbing, genetic algorithm

**Files:**
- Modify: `src/utils/searchBasedTesting.js` (append)
- Modify: `src/tests/searchBasedTesting.test.js` (append)

Each driver returns `{ strategy, history, covered, bestIndividual, bestCost }`.
`history` is an array of `{ evaluation, bestCost, bestIndividual, covered }` — one
entry per fitness evaluation — so an explorer can replay the search step by step.

- [ ] **Step 1: Write the failing tests**

Append to `src/tests/searchBasedTesting.test.js`:

```js
import { randomSearch, hillClimb, geneticAlgorithm } from '../utils/searchBasedTesting.js';

describe('randomSearch', () => {
  it('is deterministic for a fixed seed', () => {
    const a = randomSearch(nested, { seed: 1, budget: 200 });
    const b = randomSearch(nested, { seed: 1, budget: 200 });
    expect(a.bestCost).toEqual(b.bestCost);
    expect(a.history.length).toEqual(b.history.length);
  });
  it('records non-increasing bestCost over the history', () => {
    const { history } = randomSearch(nested, { seed: 5, budget: 300 });
    for (let i = 1; i < history.length; i++) {
      expect(history[i].bestCost).toBeLessThanOrEqual(history[i - 1].bestCost);
    }
  });
});

describe('geneticAlgorithm', () => {
  it('covers the nested-guard target within budget', () => {
    const r = geneticAlgorithm(nested, { seed: 1, budget: 2000, populationSize: 20 });
    expect(r.covered).toBe(true);
    expect(r.bestCost).toBe(0);
  });
  it('is deterministic for a fixed seed', () => {
    const a = geneticAlgorithm(nested, { seed: 3, budget: 2000, populationSize: 20 });
    const b = geneticAlgorithm(nested, { seed: 3, budget: 2000, populationSize: 20 });
    expect(a.bestCost).toEqual(b.bestCost);
    expect(a.history.length).toEqual(b.history.length);
  });
});

describe('hillClimb', () => {
  it('is deterministic for a fixed seed', () => {
    const a = hillClimb(nested, { seed: 2, budget: 2000 });
    const b = hillClimb(nested, { seed: 2, budget: 2000 });
    expect(a.bestCost).toEqual(b.bestCost);
  });
});

describe('strategy comparison', () => {
  it('the genetic algorithm covers every example within budget', () => {
    for (const ex of SBST_EXAMPLES) {
      const r = geneticAlgorithm(ex, { seed: 1, budget: 8000, populationSize: 24 });
      expect(r.covered, ex.id).toBe(true);
    }
  });
  it('hill climbing can get trapped below full coverage on the multimodal example', () => {
    // The modulo creates non-covering local optima (e.g. x = 47); a single
    // trajectory can settle there. At least one seed must exhibit the trap.
    const multimodal = SBST_EXAMPLES.find((e) => e.id === 'multimodal');
    let sawTrap = false;
    for (let seed = 1; seed <= 30 && !sawTrap; seed++) {
      const hc = hillClimb(multimodal, { seed, budget: 4000 });
      if (hc.stuck && !hc.covered) sawTrap = true;
    }
    expect(sawTrap).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/tests/searchBasedTesting.test.js`
Expected: FAIL — drivers not exported.

- [ ] **Step 3: Append the drivers to `src/utils/searchBasedTesting.js`**

```js
// ── Search drivers ──────────────────────────────────────────────────────────
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function randomIndividual(rng, schema) { return schema.map((s) => rngInt(rng, s.min, s.max)); }

// Random search — sample input vectors uniformly; keep the best seen.
export function randomSearch(example, { seed, budget }) {
  const rng = makeRng(seed);
  const history = [];
  let bestCost = Infinity, bestIndividual = null;
  for (let i = 0; i < budget; i++) {
    const ind = randomIndividual(rng, example.inputSchema);
    const cost = evaluate(example, ind).cost;
    if (cost < bestCost) { bestCost = cost; bestIndividual = ind; }
    history.push({ evaluation: i + 1, bestCost, bestIndividual, covered: bestCost === 0 });
    if (bestCost === 0) break;
  }
  return { strategy: 'random', history, covered: bestCost === 0, bestIndividual, bestCost };
}

// Hill climbing — from one random start, repeatedly move to the best improving
// ±1 neighbour. Stops when no neighbour improves (a local optimum) or budget runs out.
export function hillClimb(example, { seed, budget }) {
  const rng = makeRng(seed);
  const schema = example.inputSchema;
  let current = randomIndividual(rng, schema);
  let currentCost = evaluate(example, current).cost;
  const history = [{ evaluation: 1, bestCost: currentCost, bestIndividual: current, covered: currentCost === 0 }];
  let evals = 1;
  while (evals < budget && currentCost > 0) {
    let bestNeighbour = null, bestNeighbourCost = currentCost;
    for (let d = 0; d < schema.length; d++) {
      for (const delta of [-1, 1]) {
        if (evals >= budget) break;
        const n = current.slice();
        n[d] = clamp(n[d] + delta, schema[d].min, schema[d].max);
        const cost = evaluate(example, n).cost;
        evals++;
        history.push({ evaluation: evals, bestCost: Math.min(currentCost, bestNeighbourCost, cost),
          bestIndividual: cost < bestNeighbourCost ? n : (bestNeighbour || current), covered: cost === 0 });
        if (cost < bestNeighbourCost) { bestNeighbourCost = cost; bestNeighbour = n; }
      }
    }
    if (bestNeighbour && bestNeighbourCost < currentCost) {
      current = bestNeighbour; currentCost = bestNeighbourCost;
    } else {
      break;   // local optimum — no improving neighbour
    }
  }
  return { strategy: 'hillClimb', history, covered: currentCost === 0,
    bestIndividual: current, bestCost: currentCost, stuck: currentCost > 0 };
}

// Genetic algorithm — a population of input vectors evolved with tournament
// selection, one-point crossover, per-component mutation, and elitism.
export function geneticAlgorithm(example, { seed, budget, populationSize = 20 }) {
  const rng = makeRng(seed);
  const schema = example.inputSchema;
  const history = [];
  let evals = 0;
  let gen = 0;
  let bestCost = Infinity, bestIndividual = null;

  function score(ind) {
    const cost = evaluate(example, ind).cost;
    evals++;
    if (cost < bestCost) { bestCost = cost; bestIndividual = ind; }
    history.push({ evaluation: evals, generation: gen, bestCost, bestIndividual, covered: bestCost === 0 });
    return cost;
  }
  function tournament(pop, costs) {
    const a = Math.floor(rng() * pop.length);
    const b = Math.floor(rng() * pop.length);
    return costs[a] <= costs[b] ? pop[a] : pop[b];
  }
  function crossover(p1, p2) {
    if (schema.length === 1) return p1.slice();
    const cut = 1 + Math.floor(rng() * (schema.length - 1));
    return p1.slice(0, cut).concat(p2.slice(cut));
  }
  function mutate(ind) {
    return ind.map((v, d) => {
      if (rng() < 1 / schema.length) {
        const span = Math.max(1, Math.round((schema[d].max - schema[d].min) * 0.1));
        return clamp(v + rngInt(rng, -span, span), schema[d].min, schema[d].max);
      }
      return v;
    });
  }

  let population = Array.from({ length: populationSize }, () => randomIndividual(rng, schema));
  let costs = population.map(score);                // generation 0
  while (evals < budget && bestCost > 0) {
    gen++;
    const eliteIdx = costs.indexOf(Math.min(...costs));
    const next = [population[eliteIdx]];   // elitism — carry the best forward
    while (next.length < populationSize) {
      const child = mutate(crossover(tournament(population, costs), tournament(population, costs)));
      next.push(child);
    }
    population = next;
    costs = [costs[eliteIdx], ...population.slice(1).map(score)];
    if (bestCost === 0) break;
  }
  return { strategy: 'genetic', history, covered: bestCost === 0, bestIndividual, bestCost };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/tests/searchBasedTesting.test.js`
Expected: PASS — all driver and comparison tests green. If the GA does not cover
the `multimodal` example within budget, raise the `budget` in the failing test —
do not weaken the example.

- [ ] **Step 5: Commit**

```bash
git add src/utils/searchBasedTesting.js src/tests/searchBasedTesting.test.js
git commit -m "feat(sbst): random search, hill climbing, genetic algorithm"
```

---

## Task 5: Whole-suite search

**Files:**
- Modify: `src/utils/searchBasedTesting.js` (append)
- Modify: `src/tests/searchBasedTesting.test.js` (append)

A whole-suite individual is an array of input vectors (tests). Its fitness sums,
over **every branch outcome** in the example, the best cost any test achieves
toward covering that outcome. `suiteCoverage` is the fraction of branch outcomes
that some test covers (cost 0).

- [ ] **Step 1: Write the failing tests**

Append to `src/tests/searchBasedTesting.test.js`:

```js
import { suiteFitness, wholeSuiteGA } from '../utils/searchBasedTesting.js';

describe('suiteFitness', () => {
  it('reports full coverage when tests cover every branch outcome', () => {
    // nested-guard outcomes: b1 true/false, b2 true/false.
    const suite = [[17, 150], [17, 10], [3, 0]];
    const r = suiteFitness(nested, suite);
    expect(r.coverage).toBe(1);
    expect(r.cost).toBe(0);
  });
  it('reports partial coverage and positive cost when outcomes are missed', () => {
    const r = suiteFitness(nested, [[3, 0]]);   // only b1=false reached
    expect(r.coverage).toBeLessThan(1);
    expect(r.cost).toBeGreaterThan(0);
  });
});

describe('wholeSuiteGA', () => {
  it('evolves a suite to full coverage of nested-guard within budget', () => {
    const r = wholeSuiteGA(nested, { seed: 1, budget: 3000, populationSize: 16, suiteSize: 4 });
    expect(r.coverage).toBe(1);
  });
  it('is deterministic for a fixed seed', () => {
    const a = wholeSuiteGA(nested, { seed: 7, budget: 3000, populationSize: 16, suiteSize: 4 });
    const b = wholeSuiteGA(nested, { seed: 7, budget: 3000, populationSize: 16, suiteSize: 4 });
    expect(a.coverage).toEqual(b.coverage);
    expect(a.history.length).toEqual(b.history.length);
  });
  it('returns a minimised suite no larger than the evolved suite', () => {
    const r = wholeSuiteGA(nested, { seed: 1, budget: 3000, populationSize: 16, suiteSize: 4 });
    expect(r.minimisedSuite.length).toBeLessThanOrEqual(r.bestSuite.length);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/tests/searchBasedTesting.test.js`
Expected: FAIL — `suiteFitness` / `wholeSuiteGA` not exported.

- [ ] **Step 3: Append the whole-suite engine to `src/utils/searchBasedTesting.js`**

```js
// ── Whole-suite search ──────────────────────────────────────────────────────
// Every branch's two outcomes are coverage goals. A suite's cost is the sum,
// over all goals, of the best cost any test achieves toward that goal.
function coverageGoals(example) {
  const goals = [];
  for (const b of example.branches) {
    goals.push({ branchId: b.id, outcome: true });
    goals.push({ branchId: b.id, outcome: false });
  }
  return goals;
}

// Cost of one test toward one goal: 0 if the test takes that branch outcome,
// else approachLevel + normalised branch distance, using the same divergence
// walk as evaluate() but against an arbitrary goal.
function costForGoal(example, inputs, goal) {
  const events = trace(example, inputs);
  const branch = example.branches.find((b) => b.id === goal.branchId);
  const required = [...branch.requires, { branchId: goal.branchId, outcome: goal.outcome }];
  for (let i = 0; i < required.length; i++) {
    const req = required[i];
    const ev = events.find((e) => e.branchId === req.branchId);
    if (ev && ev.outcome === req.outcome) continue;
    const approachLevel = required.length - i - 1;
    let raw;
    if (ev) { raw = branchDistance(req.outcome ? ev.op : NEGATE[ev.op], ev.lhs, ev.rhs); }
    else { raw = Infinity; }
    return approachLevel + (raw === Infinity ? 1 : normalize(raw));
  }
  return 0;
}

export function suiteFitness(example, suite) {
  const goals = coverageGoals(example);
  let cost = 0, covered = 0;
  for (const goal of goals) {
    let best = Infinity;
    for (const test of suite) best = Math.min(best, costForGoal(example, test, goal));
    cost += best;
    if (best === 0) covered++;
  }
  return { cost, coverage: covered / goals.length, goals: goals.length, covered };
}

// Drop tests that do not change the set of covered goals.
function minimiseSuite(example, suite) {
  const goals = coverageGoals(example);
  const covers = (s) => goals.filter((g) => s.some((t) => costForGoal(example, t, g) === 0)).length;
  const full = covers(suite);
  const kept = suite.slice();
  for (let i = kept.length - 1; i >= 0; i--) {
    const without = kept.slice(0, i).concat(kept.slice(i + 1));
    if (covers(without) === full) kept.splice(i, 1);
  }
  return kept;
}

// Genetic algorithm where each individual is a whole suite of `suiteSize` tests.
export function wholeSuiteGA(example, { seed, budget, populationSize = 16, suiteSize = 4 }) {
  const rng = makeRng(seed);
  const schema = example.inputSchema;
  const history = [];
  let evals = 0;
  let gen = 0;
  let bestCost = Infinity, bestSuite = null, bestCoverage = 0;

  const randomTest = () => schema.map((s) => rngInt(rng, s.min, s.max));
  const randomSuite = () => Array.from({ length: suiteSize }, randomTest);
  function score(suite) {
    const f = suiteFitness(example, suite);
    evals++;
    if (f.cost < bestCost) { bestCost = f.cost; bestSuite = suite; bestCoverage = f.coverage; }
    history.push({ evaluation: evals, generation: gen, bestCost, coverage: bestCoverage, bestSuite });
    return f.cost;
  }
  function tournament(pop, costs) {
    const a = Math.floor(rng() * pop.length);
    const b = Math.floor(rng() * pop.length);
    return costs[a] <= costs[b] ? pop[a] : pop[b];
  }
  function crossover(s1, s2) {
    const cut = 1 + Math.floor(rng() * (suiteSize - 1));
    return s1.slice(0, cut).concat(s2.slice(cut));
  }
  function mutate(suite) {
    return suite.map((test) => (rng() < 1 / suiteSize ? randomTest() : test));
  }

  let population = Array.from({ length: populationSize }, randomSuite);
  let costs = population.map(score);                // generation 0
  while (evals < budget && bestCost > 0) {
    gen++;
    const eliteIdx = costs.indexOf(Math.min(...costs));
    const next = [population[eliteIdx]];
    while (next.length < populationSize) {
      next.push(mutate(crossover(tournament(population, costs), tournament(population, costs))));
    }
    population = next;
    costs = [costs[eliteIdx], ...population.slice(1).map(score)];
    if (bestCost === 0) break;
  }
  return {
    strategy: 'wholeSuite', history, bestSuite, bestCost, coverage: bestCoverage,
    minimisedSuite: minimiseSuite(example, bestSuite),
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/tests/searchBasedTesting.test.js`
Expected: PASS — all engine tests across Tasks 1, 3, 4, 5 green.

- [ ] **Step 5: Commit**

```bash
git add src/utils/searchBasedTesting.js src/tests/searchBasedTesting.test.js
git commit -m "feat(sbst): whole-suite fitness, whole-suite GA, minimisation"
```

---

## Task 6: SbstBranchExplorer (tab 1 — GA branch search)

**Files:**
- Modify: `src/utils/searchBasedTesting.js` — one-line engine prerequisite (see below)
- Create: `src/components/SbstBranchExplorer.js`, `src/components/SbstBranchExplorer.css`
- Test: `src/tests/SbstBranchExplorer.test.js`

**Engine prerequisite (do this first).** The population panel needs each GA
history entry to carry the individual that was scored and its own cost. In
`src/utils/searchBasedTesting.js`, inside `geneticAlgorithm`'s `score(ind)`
function, change the `history.push` to also record `individual` and `cost`:

```js
  function score(ind) {
    const cost = evaluate(example, ind).cost;
    evals++;
    if (cost < bestCost) { bestCost = cost; bestIndividual = ind; }
    history.push({ evaluation: evals, generation: gen, individual: ind, cost, bestCost, bestIndividual, covered: bestCost === 0 });
    return cost;
  }
```

This is purely additive (two new fields) — the existing engine tests still pass.
Run `npx vitest run src/tests/searchBasedTesting.test.js` after the change to
confirm all 29 tests still pass, then proceed with the explorer.

**Read `src/components/ExploitOverflowExplorer.js` first** — mirror its shape:
module-level `state`, `esc()` helper, `render()` → `root.innerHTML` → `bindEvents()`,
`onLocaleChange(() => render())`, a factory `createSbstBranchExplorer()` that
resets state, sets `root.dataset.testid`, renders, returns `root`.

**Component spec.** Root `<div data-testid="sbst-branch-explorer">`. The
explorer runs `geneticAlgorithm` on the selected example and replays its
`history` generation by generation, alongside a `randomSearch` baseline.

State: `{ exampleId, genIndex, gaResult, randomResult, quiz }`.
- On load and on example change: pick the example, call
  `geneticAlgorithm(example, { seed: 1, budget: 8000, populationSize: 20 })` and
  `randomSearch(example, { seed: 1, budget: 8000 })`, store both; reset `genIndex` to 0.
  (Budget 8000 matches the engine test that guarantees the GA covers every example.)
- `genIndex` selects a generation. `gaResult.history` entries each carry a
  `generation` field (0 = the initial population) plus `individual` and `cost`
  (the population member scored at that evaluation) and `bestCost` (running
  best). Group entries by `generation`: the entries for generation N are that
  generation's scored population members. The total generation count is
  `max(generation) + 1`. (Note: generation 0 has `populationSize` entries;
  later generations have `populationSize − 1`, because the elite is carried
  forward without re-evaluation — that is expected.)

Rendered structure (testids in **bold**):
- A title (`t('section.sbst.title')`).
- Example-picker chips, one per `SBST_EXAMPLES` entry — **`sbst-branch-example-<id>`**;
  active example marked.
- A code panel — **`sbst-branch-code`** — `example.source` with the line of the
  target branch highlighted (match the line containing `← target`).
- The GA population panel — **`sbst-branch-population`** — for the current
  generation, list each scored member: its `individual` input values and its
  `cost` (both read straight from that generation's history entries), with the
  lowest-cost member of the generation marked. A success banner —
  **`sbst-branch-covered`** — appears when the generation's best `bestCost` is 0.
- A best-cost sparkline — **`sbst-branch-sparkline`** — best cost per generation.
- The random-search baseline panel — **`sbst-branch-random`** — best cost at the
  same evaluation budget, with text noting whether it covered the target.
- A generation counter `genIndex + 1 / <total>` and step controls:
  **`sbst-branch-next`** (advance one generation, disabled at the last),
  **`sbst-branch-run`** (jump to the generation that first reaches cost 0, or the
  last), **`sbst-branch-reset`** (genIndex → 0).
- A predict-mode self-test and a quiz block, modelled exactly on
  ExploitOverflowExplorer's `renderQuiz()` — testids **`sbst-branch-quiz-start`**,
  **`sbst-branch-quiz`**, **`sbst-branch-quiz-submit`**, **`sbst-branch-quiz-result`**,
  **`sbst-branch-quiz-close`**. One authored multiple-choice question about why
  the GA covers the nested target faster than random search.

`SbstBranchExplorer.css`: import `./ExploitOverflowExplorer.css` for shared
tokens (as `ExploitSqliExplorer.css` does), then add `sbst-branch-*` rules.

- [ ] **Step 1: Write the failing test**

Create `src/tests/SbstBranchExplorer.test.js`:

```js
import { describe, expect, it, beforeEach } from 'vitest';
import { createSbstBranchExplorer } from '../components/SbstBranchExplorer.js';

function q(root, testid) { return root.querySelector(`[data-testid="${testid}"]`); }

describe('SbstBranchExplorer', () => {
  let root;
  beforeEach(() => { root = createSbstBranchExplorer(); document.body.innerHTML = ''; document.body.appendChild(root); });

  it('renders with the explorer root testid', () => {
    expect(root.dataset.testid).toBe('sbst-branch-explorer');
  });
  it('shows the code panel and a population panel', () => {
    expect(q(root, 'sbst-branch-code')).toBeTruthy();
    expect(q(root, 'sbst-branch-population')).toBeTruthy();
  });
  it('advances generations with Next and reaches the covered state via Run', () => {
    const run = q(root, 'sbst-branch-run');
    run.click();
    expect(q(root, 'sbst-branch-covered')).toBeTruthy();
  });
  it('Reset returns to the first generation', () => {
    q(root, 'sbst-branch-run').click();
    q(root, 'sbst-branch-reset').click();
    expect(q(root, 'sbst-branch-next').disabled).toBe(false);
  });
  it('switches examples', () => {
    q(root, 'sbst-branch-example-triangle').click();
    expect(q(root, 'sbst-branch-code').textContent).toContain('classify(a, b, c)');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/SbstBranchExplorer.test.js`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement `SbstBranchExplorer.js` and `.css`**

Implement the component per the spec above, mirroring `ExploitOverflowExplorer.js`'s
structure. Import `{ SBST_EXAMPLES }` from `../data/sbstExamples.js`, and
`{ geneticAlgorithm, randomSearch, evaluate }` from `../utils/searchBasedTesting.js`,
and `{ t, onLocaleChange }` from `../i18n/index.js`. Create the CSS file importing
`./ExploitOverflowExplorer.css`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/SbstBranchExplorer.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/SbstBranchExplorer.js src/components/SbstBranchExplorer.css src/tests/SbstBranchExplorer.test.js
git commit -m "feat(sbst): SbstBranchExplorer — GA branch-search tab"
```

---

## Task 7: SbstCompareExplorer (tab 2 — metaheuristic comparison)

**Files:**
- Create: `src/components/SbstCompareExplorer.js`, `src/components/SbstCompareExplorer.css`
- Test: `src/tests/SbstCompareExplorer.test.js`

**Component spec.** Root `<div data-testid="sbst-compare-explorer">`. Runs all
three drivers on the selected example and shows them side by side.

State: `{ exampleId, results: { random, hillClimb, genetic }, quiz }`.
- On load / example change: run `randomSearch` and `geneticAlgorithm` with
  `{ seed: 1, budget: 8000 }` (GA also `populationSize: 20`). Run `hillClimb` with
  `budget: 8000` and an illustrative seed: for the `multimodal` example, scan
  `seed` 1..30 and use the first whose `hillClimb` run returns `stuck && !covered`
  (so the local-optimum trap is always visible in the demo); for the other
  examples use `seed: 1`.

Rendered structure (testids in **bold**):
- Title; example-picker chips — **`sbst-compare-example-<id>`**.
- Three strategy panels — **`sbst-compare-random`**, **`sbst-compare-hillclimb`**,
  **`sbst-compare-genetic`** — each showing: the strategy name, whether it
  covered the target (and at which evaluation count, from `history.length`) or
  that it exhausted the budget, and its final best cost.
- An overlaid best-cost-vs-evaluations chart — **`sbst-compare-chart`** — three
  polylines from the three `history` arrays (a simple inline `<svg>`; no library).
- A takeaway line — **`sbst-compare-takeaway`** — stating that guided search
  (GA, hill climbing) beats random, and that the GA's population escapes the
  local optimum that traps hill climbing.
- Controls: **`sbst-compare-run`** (re-run all three), **`sbst-compare-reset`**.
- Predict-mode + quiz: **`sbst-compare-quiz-start`** / **`-quiz`** /
  **`-quiz-submit`** / **`-quiz-result`** / **`-quiz-close`**. One authored
  question about why hill climbing underperforms the GA.

`SbstCompareExplorer.css` imports `./ExploitOverflowExplorer.css` then adds
`sbst-compare-*` rules.

- [ ] **Step 1: Write the failing test**

Create `src/tests/SbstCompareExplorer.test.js`:

```js
import { describe, expect, it, beforeEach } from 'vitest';
import { createSbstCompareExplorer } from '../components/SbstCompareExplorer.js';

function q(root, testid) { return root.querySelector(`[data-testid="${testid}"]`); }

describe('SbstCompareExplorer', () => {
  let root;
  beforeEach(() => { root = createSbstCompareExplorer(); document.body.innerHTML = ''; document.body.appendChild(root); });

  it('renders with the explorer root testid', () => {
    expect(root.dataset.testid).toBe('sbst-compare-explorer');
  });
  it('shows all three strategy panels and the chart', () => {
    expect(q(root, 'sbst-compare-random')).toBeTruthy();
    expect(q(root, 'sbst-compare-hillclimb')).toBeTruthy();
    expect(q(root, 'sbst-compare-genetic')).toBeTruthy();
    expect(q(root, 'sbst-compare-chart')).toBeTruthy();
  });
  it('shows a takeaway and switches examples', () => {
    expect(q(root, 'sbst-compare-takeaway')).toBeTruthy();
    q(root, 'sbst-compare-example-multimodal').click();
    expect(q(root, 'sbst-compare-genetic')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/SbstCompareExplorer.test.js`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement `SbstCompareExplorer.js` and `.css`**

Implement per the spec, mirroring `ExploitOverflowExplorer.js`. Import the three
drivers from `../utils/searchBasedTesting.js`, `SBST_EXAMPLES`, and the i18n helpers.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/SbstCompareExplorer.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/SbstCompareExplorer.js src/components/SbstCompareExplorer.css src/tests/SbstCompareExplorer.test.js
git commit -m "feat(sbst): SbstCompareExplorer — metaheuristic comparison tab"
```

---

## Task 8: SbstSuiteExplorer (tab 3 — whole-suite evolution)

**Files:**
- Create: `src/components/SbstSuiteExplorer.js`, `src/components/SbstSuiteExplorer.css`
- Test: `src/tests/SbstSuiteExplorer.test.js`

**Component spec.** Root `<div data-testid="sbst-suite-explorer">`. Runs
`wholeSuiteGA` and replays its `history` generation by generation.

State: `{ exampleId, genIndex, result, quiz }`.
- On load / example change: `wholeSuiteGA(example, { seed: 1, budget: 5000, populationSize: 16, suiteSize: 4 })`;
  reset `genIndex` to 0. `result.history` entries each carry a `generation` field
  (0 = the initial population); group by it for the per-generation view.

Rendered structure (testids in **bold**):
- Title; example-picker chips — **`sbst-suite-example-<id>`**.
- A code panel — **`sbst-suite-code`** — `example.source`.
- A coverage gauge — **`sbst-suite-coverage`** — the `coverage` of the current
  generation as a percentage with a bar.
- The current best suite — **`sbst-suite-tests`** — each test's input values and
  the branch outcomes it covers.
- A success banner — **`sbst-suite-covered`** — when coverage reaches 100%.
- The minimised suite — **`sbst-suite-minimised`** — shown once full coverage is
  reached, listing `result.minimisedSuite`.
- Generation counter and controls: **`sbst-suite-next`**, **`sbst-suite-run`**
  (jump to the first 100%-coverage generation, or the last), **`sbst-suite-reset`**.
- Predict-mode + quiz: **`sbst-suite-quiz-start`** / **`-quiz`** /
  **`-quiz-submit`** / **`-quiz-result`** / **`-quiz-close`**. One authored
  question about whole-suite fitness vs. single-branch fitness.

`SbstSuiteExplorer.css` imports `./ExploitOverflowExplorer.css` then adds
`sbst-suite-*` rules.

- [ ] **Step 1: Write the failing test**

Create `src/tests/SbstSuiteExplorer.test.js`:

```js
import { describe, expect, it, beforeEach } from 'vitest';
import { createSbstSuiteExplorer } from '../components/SbstSuiteExplorer.js';

function q(root, testid) { return root.querySelector(`[data-testid="${testid}"]`); }

describe('SbstSuiteExplorer', () => {
  let root;
  beforeEach(() => { root = createSbstSuiteExplorer(); document.body.innerHTML = ''; document.body.appendChild(root); });

  it('renders with the explorer root testid', () => {
    expect(root.dataset.testid).toBe('sbst-suite-explorer');
  });
  it('shows the coverage gauge and the test list', () => {
    expect(q(root, 'sbst-suite-coverage')).toBeTruthy();
    expect(q(root, 'sbst-suite-tests')).toBeTruthy();
  });
  it('Run reaches full coverage and shows the minimised suite', () => {
    q(root, 'sbst-suite-run').click();
    expect(q(root, 'sbst-suite-covered')).toBeTruthy();
    expect(q(root, 'sbst-suite-minimised')).toBeTruthy();
  });
  it('Reset returns to the first generation', () => {
    q(root, 'sbst-suite-run').click();
    q(root, 'sbst-suite-reset').click();
    expect(q(root, 'sbst-suite-next').disabled).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/SbstSuiteExplorer.test.js`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement `SbstSuiteExplorer.js` and `.css`**

Implement per the spec, mirroring `ExploitOverflowExplorer.js`. Import
`{ wholeSuiteGA, suiteFitness }` from `../utils/searchBasedTesting.js`,
`SBST_EXAMPLES`, and the i18n helpers.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/SbstSuiteExplorer.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/SbstSuiteExplorer.js src/components/SbstSuiteExplorer.css src/tests/SbstSuiteExplorer.test.js
git commit -m "feat(sbst): SbstSuiteExplorer — whole-suite evolution tab"
```

---

## Task 9: Register and wire the `sbst` section

**Files:**
- Modify: `src/data/sectionTaxonomy.js`
- Modify: `src/utils/urlRouter.js`
- Modify: `src/data/explorerTags.js`
- Modify: `src/app.js`
- Modify: `src/i18n/dict.js`

> **Context:** `src/tests/explorerTags.test.js` requires every explorer
> component file under `src/components/` to have an `EXPLORER_TAGS` entry, and
> requires an i18n key for every controlled-vocabulary tag value. After Tasks
> 6–8 added three explorer components, that test is RED until Step 2b below
> registers them. This task must end with the **full** suite green.

- [ ] **Step 1: Add `sbst` to the taxonomy**

In `src/data/sectionTaxonomy.js`, change the `generation` category's `sectionIds`
to include `'sbst'` at the end:

```js
  { id: 'generation',   labelKey: 'taxonomy.generation',
    sectionIds: ['symbex', 'concolic', 'fuzz', 'testgen', 'exploit', 'sbst'] },
```

- [ ] **Step 2: Register the section in `urlRouter.js`**

In `src/utils/urlRouter.js`, add to `TAB_SECTIONS` (after the `exploit` entry):

```js
  // Section — Search-Based Software Testing.
  sbst: { tabs: ['branch', 'compare', 'suite'], default: 'branch' },
```

And add to `EXPLORER_TO_LOCATION` (after the `ExploitPathExplorer` entry):

```js
  SbstBranchExplorer:  { section: 'sbst', tab: 'branch' },
  SbstCompareExplorer: { section: 'sbst', tab: 'compare' },
  SbstSuiteExplorer:   { section: 'sbst', tab: 'suite' },
```

- [ ] **Step 2b: Register the explorers in `src/data/explorerTags.js`**

The vocabularies in this file are CLOSED; new tag values must be added to the
vocab arrays first.

1. Add `'search-based'` to the `TAG_TECHNIQUES` array (append at the end).
2. Add `'sbst'` to the `TAG_SERIES` array (append at the end).
3. Add three entries to `EXPLORER_TAGS`, after the `ExploitPathExplorer` entry
   (just before the closing `};` of the object):

```js
  // ── Search-Based Software Testing ────────────────────────────────
  SbstBranchExplorer: {
    level: ['unit'], technique: ['search-based'], series: ['sbst'],
    difficulty: 'intermediate', source: [TEXTBOOK],
  },
  SbstCompareExplorer: {
    level: ['unit'], technique: ['search-based'], series: ['sbst'],
    difficulty: 'intermediate', source: [TEXTBOOK],
  },
  SbstSuiteExplorer: {
    level: ['unit'], technique: ['search-based'], series: ['sbst'],
    difficulty: 'advanced', source: [TEXTBOOK],
  },
```

4. Add to the `SECTION_EXPLORERS` map:

```js
  sbst: ['SbstBranchExplorer', 'SbstCompareExplorer', 'SbstSuiteExplorer'],
```

- [ ] **Step 3: Add the i18n strings**

In `src/i18n/dict.js`, add these keys to **both** the `en` map and the `zh` map
(English values shown; provide natural Traditional-Chinese translations for `zh`):

```
'section.sbst': 'Search-Based Testing'
'section.sbst.title': 'Search-Based Software Testing'
'sbst.tab.branch': 'GA Branch Search'
'sbst.tab.compare': 'Metaheuristic Comparison'
'sbst.tab.suite': 'Whole-Suite Evolution'
'sbst.example.nestedGuard': 'Nested guard'
'sbst.example.triangle': 'Triangle classifier'
'sbst.example.multimodal': 'Multimodal (mod 20)'
'tag.technique.search-based': 'Search-based'
'tag.series.sbst': 'Search-Based Testing'
```

The last two keys are required by `explorerTags.test.js`, which asserts an
EN+ZH i18n key exists for every controlled-vocabulary tag value (`tag.technique.*`,
`tag.series.*`) — they pair with the `TAG_TECHNIQUES`/`TAG_SERIES` additions in
Step 2b.

Also add any UI-copy keys the three explorers reference (panel headings, button
labels, the comparison takeaway, the three quiz questions and their options).
Place them next to the keys above, `en` and `zh` in parallel. To find them, grep
the three `Sbst*Explorer.js` files for `t('sbst.` and add every key referenced.
Use the existing `exploit.*` keys as a naming and tone model.

- [ ] **Step 4: Wire the section into `app.js`**

In `src/app.js`:

1. Import the three factories near the other explorer imports:
```js
import { createSbstBranchExplorer } from './components/SbstBranchExplorer.js';
import { createSbstCompareExplorer } from './components/SbstCompareExplorer.js';
import { createSbstSuiteExplorer } from './components/SbstSuiteExplorer.js';
```

2. Add the `<section>` markup next to the `section-exploit` block (≈ line 196):
```js
<section data-testid="section-sbst" tabindex="-1" aria-labelledby="section-sbst-title"><h2 id="section-sbst-title">${t('section.sbst.title')}</h2><div data-slot="sbst"></div></section>
```

3. In the `components` map (≈ line 258+), add:
```js
      sbstbranch:  createSbstBranchExplorer(),
      sbstcompare: createSbstCompareExplorer(),
      sbstsuite:   createSbstSuiteExplorer(),
```

4. After the `exploit` tab-wiring block (after app.js line 789), add an
   analogous block for `sbst` — copy the exploit block verbatim and substitute:
   `exploit`→`sbst`, slot `"exploit"`→`"sbst"`, testid `exploit-tab-row`→`sbst-tab-row`,
   `data-exploit-*`→`data-sbst-*`, `EXPLOIT_TAB_KEY`→`'stvisual.sbstActiveTab'`,
   tab defs `['overflow','sqli','cmdi','path']`→`['branch','compare','suite']`,
   the panel-append branches to append `components.sbstbranch` / `components.sbstcompare`
   / `components.sbstsuite`, and `exploitTabItems` to:
```js
    const sbstTabItems = [
      { id: 'branch',  key: 'sbst.tab.branch' },
      { id: 'compare', key: 'sbst.tab.compare' },
      { id: 'suite',   key: 'sbst.tab.suite' },
    ];
```

- [ ] **Step 5: Verify the full suite is green**

Run: `npm run test:run`
Expected: **all tests pass**, including `src/tests/explorerTags.test.js` (its
"matches the component files actually shipped" and "i18n keys exist" tests turn
green now that Step 2b + Step 3 registered the three SBST explorers). No
deck-count change yet — that is Task 11.

- [ ] **Step 6: Rebuild the standalone bundle**

This task changed bundled source (`app.js`, `urlRouter.js`, `dict.js`, …), so
the bundle must be regenerated and committed (the CI `standalone-bundle` job
guards `src/standalone.js` freshness).

Run: `npm run build:standalone`
Expected: completes without error; `src/standalone.js` is updated.

- [ ] **Step 7: Commit**

```bash
git add src/data/sectionTaxonomy.js src/utils/urlRouter.js src/data/explorerTags.js src/app.js src/i18n/dict.js src/standalone.js
git commit -m "feat(sbst): register and wire the Search-Based Testing section"
```

---

## Task 10: Screenshot capture

**Files:**
- Create: `scripts/capture-sbst-screenshots.mjs`
- Produces: `docs/assets/slides/sbst-*.png` (14 files)

- [ ] **Step 1: Ensure Playwright Chromium is installed**

Run: `npx playwright install chromium`
Expected: downloaded or already installed.

- [ ] **Step 2: Write the capture script**

Create `scripts/capture-sbst-screenshots.mjs`:

```js
// Screenshot capture for the three Search-Based Testing explorers (deck #65).
//
//   node scripts/capture-sbst-screenshots.mjs                  # zh locale
//   SLIDE_LOCALE=en node scripts/capture-sbst-screenshots.mjs  # en locale
//
// Requires: dev dependency @playwright/test and python3.

import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const OUT_DIR = join(ROOT, 'docs/assets/slides');
const BASE_URL = 'http://127.0.0.1:4173/index.html';

const SLIDE_LOCALE = process.env.SLIDE_LOCALE === 'en' ? 'en' : 'zh';
function shot(name) {
  return join(OUT_DIR, SLIDE_LOCALE === 'en' ? `${name}-en.png` : `${name}.png`);
}

async function ensureDir(p) { await mkdir(p, { recursive: true }); }

async function isServerUp() {
  try { const res = await fetch(BASE_URL); return res.ok; } catch { return false; }
}

async function startServer() {
  const child = spawn('python3', ['-m', 'http.server', '4173'], {
    cwd: ROOT, stdio: 'ignore', detached: false,
  });
  for (let i = 0; i < 40; i++) {
    if (await isServerUp()) return child;
    await sleep(250);
  }
  child.kill();
  throw new Error('Failed to start http.server on :4173');
}

async function main() {
  await ensureDir(OUT_DIR);

  let serverChild = null;
  if (!(await isServerUp())) {
    serverChild = await startServer();
    console.log(`[capture] started http.server on :4173 (locale=${SLIDE_LOCALE})`);
  } else {
    console.log('[capture] reusing existing :4173 server');
  }

  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  await ctx.addInitScript((locale) => {
    try { window.localStorage.setItem('stvisual.locale', locale); } catch { /* ignore */ }
  }, SLIDE_LOCALE);

  try {
    // ── Tab 1: branch search ─────────────────────────────────────────────────
    const br = await ctx.newPage();
    await br.goto(`${BASE_URL}?explorer=SbstBranchExplorer`, { waitUntil: 'networkidle' });
    await br.getByTestId('sbst-branch-explorer').waitFor();
    const brRoot = br.getByTestId('sbst-branch-explorer');

    await sleep(250);
    await brRoot.screenshot({ path: shot('sbst-branch-start') });
    console.log('[capture] saved', shot('sbst-branch-start'));

    await brRoot.getByTestId('sbst-branch-run').click();
    await sleep(250);
    await brRoot.screenshot({ path: shot('sbst-branch-covered') });
    console.log('[capture] saved', shot('sbst-branch-covered'));
    await br.close();

    // ── Tab 2: metaheuristic comparison ──────────────────────────────────────
    const cmp = await ctx.newPage();
    await cmp.goto(`${BASE_URL}?explorer=SbstCompareExplorer`, { waitUntil: 'networkidle' });
    await cmp.getByTestId('sbst-compare-explorer').waitFor();
    const cmpRoot = cmp.getByTestId('sbst-compare-explorer');

    await sleep(250);
    await cmpRoot.screenshot({ path: shot('sbst-compare-curves') });
    console.log('[capture] saved', shot('sbst-compare-curves'));

    await cmpRoot.getByTestId('sbst-compare-example-multimodal').click();
    await sleep(250);
    await cmpRoot.screenshot({ path: shot('sbst-compare-stuck') });
    console.log('[capture] saved', shot('sbst-compare-stuck'));
    await cmp.close();

    // ── Tab 3: whole-suite evolution ─────────────────────────────────────────
    const su = await ctx.newPage();
    await su.goto(`${BASE_URL}?explorer=SbstSuiteExplorer`, { waitUntil: 'networkidle' });
    await su.getByTestId('sbst-suite-explorer').waitFor();
    const suRoot = su.getByTestId('sbst-suite-explorer');

    await sleep(250);
    await suRoot.screenshot({ path: shot('sbst-suite-start') });
    console.log('[capture] saved', shot('sbst-suite-start'));

    await suRoot.getByTestId('sbst-suite-run').click();
    await sleep(250);
    await suRoot.screenshot({ path: shot('sbst-suite-covered') });
    console.log('[capture] saved', shot('sbst-suite-covered'));

    await suRoot.getByTestId('sbst-suite-minimised').screenshot({ path: shot('sbst-suite-minimised') });
    console.log('[capture] saved', shot('sbst-suite-minimised'));
    await su.close();

    console.log(`[capture] done — 7 PNGs written to ${OUT_DIR}`);
  } finally {
    await browser.close();
    if (serverChild) {
      serverChild.kill();
      console.log('[capture] stopped http.server');
    }
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
```

- [ ] **Step 3: Run the capture for both locales**

Run: `node scripts/capture-sbst-screenshots.mjs`
Expected: 7 `[capture] saved` lines with bare filenames, then `done — 7 PNGs`.

Run: `SLIDE_LOCALE=en node scripts/capture-sbst-screenshots.mjs`
Expected: 7 `[capture] saved` lines with `-en` filenames.

- [ ] **Step 4: Verify all 14 PNGs exist**

Run: `ls docs/assets/slides/sbst-*.png | wc -l`
Expected: `14`

- [ ] **Step 5: Commit**

```bash
git add scripts/capture-sbst-screenshots.mjs docs/assets/slides/sbst-branch-start.png docs/assets/slides/sbst-branch-start-en.png docs/assets/slides/sbst-branch-covered.png docs/assets/slides/sbst-branch-covered-en.png docs/assets/slides/sbst-compare-curves.png docs/assets/slides/sbst-compare-curves-en.png docs/assets/slides/sbst-compare-stuck.png docs/assets/slides/sbst-compare-stuck-en.png docs/assets/slides/sbst-suite-start.png docs/assets/slides/sbst-suite-start-en.png docs/assets/slides/sbst-suite-covered.png docs/assets/slides/sbst-suite-covered-en.png docs/assets/slides/sbst-suite-minimised.png docs/assets/slides/sbst-suite-minimised-en.png
git commit -m "docs(sbst): capture script + screenshots for deck #65"
```

---

## Task 11: Slide deck #65 — Search-Based Software Testing

**Files:**
- Create: `docs/slides/65-search-based-testing.en.md`, `docs/slides/65-search-based-testing.zh-TW.md`
- Modify: `scripts/build-slide-decks.mjs`, `src/tests/slideDecks.test.js`

**Authoring rules:** Match deck #63 (`docs/slides/63-exploit-generation.en.md`)
exactly — Marp front-matter, a title slide with a `Companion tool:` link,
concept slides each closed by a `<!-- speaker note -->`, a block of
`## Tool demonstration — …` slides each with one image, `## Summary`,
`## Further reading`. 20 slides, `---`-separated.

- [ ] **Step 1: Write `docs/slides/65-search-based-testing.en.md`**

Front-matter (exact):

```markdown
---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #65 — Search-Based Software Testing
description: Test generation as optimisation — the branch-distance + approach-level fitness function, the random / hill-climbing / genetic-algorithm metaheuristics, and whole-test-suite evolution.
lang: en
---
```

Title slide:

```markdown
# Search-Based Software Testing
### *Let a fitness function search for the tests*

Software Testing Visualization series #65 · Search-Based Testing
Companion tool: `/section-sbst` → GA Branch Search ([SbstBranchExplorer](../../src/components/SbstBranchExplorer.js)) · Metaheuristic Comparison ([SbstCompareExplorer](../../src/components/SbstCompareExplorer.js)) · Whole-Suite Evolution ([SbstSuiteExplorer](../../src/components/SbstSuiteExplorer.js))

<!-- Opening deck for the Search-Based Software Testing section. SBST reframes test generation as an optimisation problem: a metaheuristic search over the input space, guided by a fitness function that measures how close an input is to covering a target. The deck covers the fitness function (branch distance + approach level), the random / hill-climbing / genetic-algorithm metaheuristics, and whole-test-suite generation. -->
```

Concept slides 2–11 — one `## Heading` each, ~80–160 words of body in deck #63's
voice, each closed by a `<!-- speaker note -->`:

| # | Heading | Content |
|---|---|---|
| 2 | Test generation as search | Reframe: instead of enumerating coverage requirements, treat test generation as optimisation — search the input space for inputs that cover a goal. Search space = input vectors; objective = coverage. Contrast with the coverage-driven `testgen` section (deck #12). |
| 3 | The fitness function | A search needs a gradient. Fitness measures how close an input is to covering the target branch — two components: approach level and branch distance. Lower is closer; 0 means covered. |
| 4 | Branch distance | At a decision, how close the predicate was to flipping. Per-operator Korel/Tracey formulas: `==`→`|a−b|`; `<`→`a−b+K if a≥b`; etc. Normalised to [0,1) via `d/(d+1)`. |
| 5 | Approach level | How many of the target's enclosing decisions the execution diverged from before reaching it. Cost = approach level + normalised branch distance at the first divergence. |
| 6 | Random search — the baseline | Sample inputs uniformly; keep the best. Unguided — wastes the fitness signal. Works for easy targets, stalls on nested guards. |
| 7 | Hill climbing | From one start, move to the best improving neighbour. Uses the gradient — but a single trajectory gets trapped in a local optimum. |
| 8 | Genetic algorithms | A population of inputs evolved with tournament selection, crossover, mutation, and elitism. Population diversity explores many regions at once. |
| 9 | Escaping local optima | Why the GA beats hill climbing: crossover recombines partial solutions and the population keeps diversity, so the search escapes basins that trap a single climber. |
| 10 | Whole-test-suite generation | An individual is an entire suite; fitness is total coverage over all branch goals. The EvoSuite formulation — evolve the suite, then minimise it. |
| 11 | Tools & foundations | EvoSuite (whole-suite generation for Java); Korel's branch-distance work; McMinn's SBST survey. |

Demo slides 12–18 — `## Tool demonstration — …` headings, each one image
`![w:1000](../assets/slides/<name>-en.png)` and a 1–2 sentence caption:

| # | Heading | Image (`-en`) | Caption |
|---|---|---|---|
| 12 | Tool demonstration — GA branch search · start | `sbst-branch-start-en.png` | In `/section-sbst`, the GA Branch Search tab — generation 0: a random initial population, each individual's fitness cost shown. (Speaker note: introduce the three-tab section.) |
| 13 | Tool demonstration — GA branch search · covered | `sbst-branch-covered-en.png` | After running to coverage — an evolved individual reaches cost 0 and covers the nested target branch; the random-search baseline lags. |
| 14 | Tool demonstration — metaheuristic comparison | `sbst-compare-curves-en.png` | The Metaheuristic Comparison tab — random / hill-climbing / GA best-cost curves overlaid on one goal. |
| 15 | Tool demonstration — the local-optimum trap | `sbst-compare-stuck-en.png` | On the multimodal example, hill climbing settles on a non-covering local optimum while the genetic algorithm's population escapes it to cover the target. |
| 16 | Tool demonstration — whole-suite · start | `sbst-suite-start-en.png` | The Whole-Suite Evolution tab — an early generation with low total branch coverage. |
| 17 | Tool demonstration — whole-suite · covered | `sbst-suite-covered-en.png` | The evolved suite reaches full branch coverage. |
| 18 | Tool demonstration — whole-suite · minimised | `sbst-suite-minimised-en.png` | The minimisation pass drops redundant tests, leaving a small suite that keeps full coverage. |

Slide 19 — `## Summary`: 6–7 bullets (search reframing; fitness = approach level
+ branch distance; the three metaheuristics; local optima; whole-suite generation
+ minimisation) and an **In-class exercise** line.

Slide 20 — `## Further reading`: the design spec
([2026-05-21-search-based-testing-design.md](../superpowers/specs/2026-05-21-search-based-testing-design.md));
McMinn, P. (2004) "Search-Based Software Test Data Generation: A Survey";
Korel, B. (1990) "Automated Software Test Data Generation"; the EvoSuite project;
tool source ([SbstBranchExplorer.js](../../src/components/SbstBranchExplorer.js),
[SbstCompareExplorer.js](../../src/components/SbstCompareExplorer.js),
[SbstSuiteExplorer.js](../../src/components/SbstSuiteExplorer.js),
[searchBasedTesting.js](../../src/utils/searchBasedTesting.js)); a "Next in series" line.

- [ ] **Step 2: Write `docs/slides/65-search-based-testing.zh-TW.md`**

A faithful Traditional-Chinese translation, same 20-slide structure. Front-matter
identical except `title: 軟體測試視覺化 #65 — 搜尋式軟體測試`, a Chinese
`description:`, `lang: zh-TW`. Title-slide series line:
`軟體測試視覺化系列 #65 · 搜尋式測試`. **Image references use the bare filename**
(no `-en`). Companion-link targets stay identical to the English deck.

- [ ] **Step 3: Register deck #65 in `scripts/build-slide-decks.mjs`**

After the `64-input-space-partitioning` entry in `DECKS`, add:

```js
  { base: '65-search-based-testing', id: 'search-based-testing', num: 65, section: 'sbst' },
```

- [ ] **Step 4: Bump the deck-count assertion in `src/tests/slideDecks.test.js`**

Change line 5 to `it('ships 65 decks, each with both languages and a title', () => {`
and line 6 to `expect(SLIDE_DECKS).toHaveLength(65);`.

- [ ] **Step 5: Rebuild the slide-deck data**

Run: `npm run build:slide-decks`
Expected: `slideDecks: wrote 65 decks`; the 14 `sbst-*.png` files are copied into `public/slide-assets/`.

- [ ] **Step 6: Run the full test suite**

Run: `npm run test:run`
Expected: all tests pass, including `slideDecks.test.js` (65 decks) and the SBST engine + explorer tests.

- [ ] **Step 7: Rebuild the standalone bundle**

Run: `npm run build:standalone`
Expected: completes; `src/standalone.js` updated.

- [ ] **Step 8: Commit**

```bash
git add docs/slides/65-search-based-testing.en.md docs/slides/65-search-based-testing.zh-TW.md scripts/build-slide-decks.mjs src/tests/slideDecks.test.js src/data/slideDecks.generated.js src/standalone.js public/slide-assets/sbst-branch-start.png public/slide-assets/sbst-branch-start-en.png public/slide-assets/sbst-branch-covered.png public/slide-assets/sbst-branch-covered-en.png public/slide-assets/sbst-compare-curves.png public/slide-assets/sbst-compare-curves-en.png public/slide-assets/sbst-compare-stuck.png public/slide-assets/sbst-compare-stuck-en.png public/slide-assets/sbst-suite-start.png public/slide-assets/sbst-suite-start-en.png public/slide-assets/sbst-suite-covered.png public/slide-assets/sbst-suite-covered-en.png public/slide-assets/sbst-suite-minimised.png public/slide-assets/sbst-suite-minimised-en.png
git commit -m "feat(sbst): Search-Based Software Testing lecture deck #65"
```

---

## Final verification (after all tasks)

- [ ] `npm run test:run` — all tests pass; `slideDecks.test.js` asserts 65 decks; the SBST engine and three explorer test files are green.
- [ ] `npm run build:slide-decks` — `slideDecks: wrote 65 decks`; re-running leaves `src/data/slideDecks.generated.js` unchanged (idempotent).
- [ ] `npm run build:standalone` then `git diff --quiet -- src/standalone.js` — exits 0 (CI `standalone-bundle` guard).
- [ ] `ls docs/assets/slides/sbst-*.png public/slide-assets/sbst-*.png | wc -l` is `28` (14 in each location).
- [ ] Serve the app, open `?explorer=SbstBranchExplorer` / `=SbstCompareExplorer` / `=SbstSuiteExplorer` — the `sbst` section shows three working tabs.

## Notes & rationale

- **Task order is load-bearing.** The engine (1–5) underpins the explorers (6–8);
  the explorers must exist before the section is wired (9); the section must be
  wired before screenshots can be captured (10); screenshots must exist before
  the deck build copies them (11).
- **Determinism.** Every search takes `seed: 1` in the explorers and capture, so
  screenshots and tests are reproducible. Never introduce `Math.random()`.
- **The `multimodal` example.** Its `x % 20` structure deliberately creates
  non-covering local optima (`x ∈ {7, 27, 47}`) so hill climbing can get trapped
  while the genetic algorithm's population escapes — the basis of Task 7's
  comparison tab. Engine tests assert only robust properties (the GA covers every
  example; the trap is reachable by some seed), never a fragile head-to-head race.
- **Branch dependency.** This branch (`feat/search-based-testing`) was cut from
  `docs/exploit-isp-slide-decks`, so decks #63/#64 exist and the count goes
  64→65. If that branch merges to main first, rebase before opening the PR.
- **No new taxonomy category** — `sbst` joins the existing `generation` category.
