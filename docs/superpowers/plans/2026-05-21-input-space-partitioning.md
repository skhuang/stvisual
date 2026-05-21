# Input Space Partitioning Explorer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `isp` tab to the black-box section — an Explorer for Ammann & Offutt's Input Space Partitioning: an editable input-domain model and the six coverage criteria (ACoC/TWC/PWC/ECC/BCC/MBCC) with a live engine, test-count comparison, and subsumption lattice.

**Architecture:** A pure coverage engine (`src/utils/inputSpacePartition.js`, six generators) feeds a closure-factory Explorer component (`PairwiseExplorer` style). The component holds an editable runtime IDM, dispatches to the engine per selected criterion, and renders the test set, a 6-criterion count comparison, and the static subsumption lattice.

**Tech Stack:** Vanilla ES modules; reuses `pairwise.js`'s `generatePairwise`; vitest + jsdom; CSS via `src/styles.css`.

**Spec:** `docs/superpowers/specs/2026-05-21-input-space-partitioning-design.md`

---

## Engine facts (verified)

- `generatePairwise(params)` — `params` is `[{ name, values }]`; returns `tests` as an array of arrays, each inner array length = #params, element = a value. Order matches `params`.
- Black-box tabs in `src/app.js` (~line 914): a `blackboxTabs` array of `{ id, key, component }`; a generic panel-build loop iterates it — adding a tab = one array entry, no loop change.
- `src/tests/urlRouter.test.js` has a `EXPLORER_TO_LOCATION` coverage test that fails if a component is in `EXPLORER_TAGS` but not `EXPLORER_TO_LOCATION` — so registering a new component forces the urlRouter entry too.

---

## File Structure

| File | Responsibility | Change |
| --- | --- | --- |
| `src/utils/inputSpacePartition.js` | Pure 6-criteria coverage engine | Create |
| `src/tests/inputSpacePartition.test.js` | Engine unit tests (critical correctness surface) | Create |
| `src/data/ispExamples.js` | 3 authored IDMs | Create |
| `src/tests/ispExamples.test.js` | IDM data invariants | Create |
| `src/components/InputSpacePartitioningExplorer.js` (+ `.css`) | The `isp` tab Explorer | Create |
| `src/tests/InputSpacePartitioningExplorer.test.jsx` | jsdom component tests | Create |
| `src/i18n/dict.js` | `blackboxTab.isp` + `isp.*` keys (en + zh) | Modify |
| `src/data/explorerTags.js` | `InputSpacePartitioningExplorer` entry + `SECTION_EXPLORERS.blackbox` | Modify |
| `src/utils/urlRouter.js` | `TAB_SECTIONS.blackbox.tabs` += `isp`; `EXPLORER_TO_LOCATION` entry | Modify |
| `src/app.js` | Import + components map + `blackboxTabs` entry | Modify |
| `src/styles.css` | `@import` the new CSS | Modify |
| `src/tests/urlRouter.test.js` | Routing assertion | Modify |
| `src/standalone.js` | Regenerated bundle | Modify (generated) |

**Not touched:** the existing black-box explorers, `pairwise.js`, `sectionTaxonomy.js`.

---

## Task 0: Branch

- [ ] **Step 1: Confirm clean `main`**

Run: `git status && git branch --show-current`
Expected: on `main`, clean (untracked `.claude/`, `PLAN_group_theory_testing.md` are fine). The spec commit `f165aa2` is on `main`.

- [ ] **Step 2: Create the branch**

Run: `git checkout -b feat/input-space-partitioning`

---

## Task 1: The coverage engine

**Files:**
- Create: `src/utils/inputSpacePartition.js`
- Create: `src/tests/inputSpacePartition.test.js`

The engine is pure and DOM-free. A **characteristic** is `{ id, blocks: [{ id }], baseBlockIds: [id, …] }`; a **test** is `{ [characteristicId]: blockId }`. TDD: write the test first.

### Step 1 — Write the engine test

Create `src/tests/inputSpacePartition.test.js`:

```javascript
import { describe, expect, it } from 'vitest';
import {
  allCombinations, tWise, pairWise, eachChoice, baseChoice, multipleBaseChoice,
} from '../utils/inputSpacePartition.js';

// A 3-characteristic IDM: kinds 2, 3, 2 blocks.
function idm() {
  return [
    { id: 'A', blocks: [{ id: 'a1' }, { id: 'a2' }], baseBlockIds: ['a1'] },
    { id: 'B', blocks: [{ id: 'b1' }, { id: 'b2' }, { id: 'b3' }], baseBlockIds: ['b1'] },
    { id: 'C', blocks: [{ id: 'c1' }, { id: 'c2' }], baseBlockIds: ['c1'] },
  ];
}

// --- criterion-satisfaction checkers ---
function everyBlockHit(tests, chars) {
  for (const c of chars) {
    for (const b of c.blocks) {
      if (!tests.some((t) => t[c.id] === b.id)) return false;
    }
  }
  return true;
}
function everyPairHit(tests, chars) {
  for (let i = 0; i < chars.length - 1; i++) {
    for (let j = i + 1; j < chars.length; j++) {
      for (const bi of chars[i].blocks) {
        for (const bj of chars[j].blocks) {
          if (!tests.some((t) => t[chars[i].id] === bi.id && t[chars[j].id] === bj.id)) return false;
        }
      }
    }
  }
  return true;
}

describe('inputSpacePartition engine', () => {
  it('allCombinations = full Cartesian product (count ∏ kᵢ)', () => {
    const chars = idm();
    const tests = allCombinations(chars);
    expect(tests.length).toBe(2 * 3 * 2);
    const keys = new Set(tests.map((t) => `${t.A}|${t.B}|${t.C}`));
    expect(keys.size).toBe(12); // all distinct
    expect(everyBlockHit(tests, chars)).toBe(true);
  });

  it('eachChoice hits every block, count = max kᵢ', () => {
    const chars = idm();
    const tests = eachChoice(chars);
    expect(tests.length).toBe(3); // max(2,3,2)
    expect(everyBlockHit(tests, chars)).toBe(true);
  });

  it('pairWise covers every block-pair and subsumes ECC', () => {
    const chars = idm();
    const tests = pairWise(chars);
    expect(everyPairHit(tests, chars)).toBe(true);
    expect(everyBlockHit(tests, chars)).toBe(true);
    expect(tests.length).toBeLessThan(allCombinations(chars).length);
  });

  it('tWise(t=3) on a 3-characteristic IDM equals allCombinations', () => {
    const chars = idm();
    expect(tWise(chars, 3).length).toBe(allCombinations(chars).length);
  });

  it('tWise(t=2) covers every pair', () => {
    const chars = idm();
    expect(everyPairHit(tWise(chars, 2), chars)).toBe(true);
  });

  it('baseChoice: base test first, count = 1 + Σ(kᵢ−1), each variation differs in one characteristic', () => {
    const chars = idm();
    const tests = baseChoice(chars);
    expect(tests.length).toBe(1 + (2 - 1) + (3 - 1) + (2 - 1)); // 1 + 1 + 2 + 1 = 5
    expect(tests[0]).toEqual({ A: 'a1', B: 'b1', C: 'c1' }); // base test
    for (let i = 1; i < tests.length; i++) {
      const diff = ['A', 'B', 'C'].filter((k) => tests[i][k] !== tests[0][k]);
      expect(diff.length).toBe(1);
    }
    expect(everyBlockHit(tests, chars)).toBe(true); // BCC subsumes ECC
  });

  it('multipleBaseChoice with two bases on B includes both base tests and hits every block', () => {
    const chars = idm();
    chars[1].baseBlockIds = ['b1', 'b2']; // two base choices for B
    const tests = multipleBaseChoice(chars);
    expect(tests.some((t) => t.A === 'a1' && t.B === 'b1' && t.C === 'c1')).toBe(true);
    expect(tests.some((t) => t.A === 'a1' && t.B === 'b2' && t.C === 'c1')).toBe(true);
    expect(everyBlockHit(tests, chars)).toBe(true);
    // MBCC subsumes BCC: at least as many tests as the single-base BCC.
    expect(tests.length).toBeGreaterThanOrEqual(baseChoice(chars).length);
  });

  it('ACoC output satisfies PWC and ECC (subsumption)', () => {
    const chars = idm();
    const all = allCombinations(chars);
    expect(everyPairHit(all, chars)).toBe(true);
    expect(everyBlockHit(all, chars)).toBe(true);
  });

  it('empty characteristic list yields no tests', () => {
    expect(allCombinations([])).toEqual([]);
    expect(eachChoice([])).toEqual([]);
    expect(baseChoice([])).toEqual([]);
  });
});
```

### Step 2 — Run the test, verify it fails

Run: `npx vitest run src/tests/inputSpacePartition.test.js`
Expected: FAIL — module unresolved.

### Step 3 — Create the engine

Create `src/utils/inputSpacePartition.js`:

```javascript
// Input Space Partitioning — the six Ammann & Offutt coverage criteria.
// Pure and DOM-free. A `characteristic` is { id, blocks: [{ id }],
// baseBlockIds: [id, …] }; a `test` is { [characteristicId]: blockId }.
// See docs/superpowers/specs/2026-05-21-input-space-partitioning-design.md.

import { generatePairwise } from './pairwise.js';

// ── small helpers ──────────────────────────────────────────────────────────────

// Cartesian product of a list of arrays.
function cartesian(lists) {
  let out = [[]];
  for (const list of lists) {
    const next = [];
    for (const prefix of out) for (const item of list) next.push([...prefix, item]);
    out = next;
  }
  return out;
}

// All k-element subsets of `arr`, preserving order.
function combinations(arr, k) {
  if (k === 0) return [[]];
  if (k > arr.length) return [];
  const [head, ...rest] = arr;
  return [
    ...combinations(rest, k - 1).map((c) => [head, ...c]),
    ...combinations(rest, k),
  ];
}

function baseListOf(c) {
  return (c.baseBlockIds && c.baseBlockIds.length > 0)
    ? c.baseBlockIds
    : [c.blocks[0].id];
}

// ── ACoC ───────────────────────────────────────────────────────────────────────

export function allCombinations(characteristics) {
  if (characteristics.length === 0) return [];
  const blockLists = characteristics.map((c) => c.blocks.map((b) => b.id));
  return cartesian(blockLists).map((combo) => {
    const test = {};
    characteristics.forEach((c, i) => { test[c.id] = combo[i]; });
    return test;
  });
}

// ── ECC ────────────────────────────────────────────────────────────────────────

export function eachChoice(characteristics) {
  if (characteristics.length === 0) return [];
  const maxBlocks = Math.max(...characteristics.map((c) => c.blocks.length));
  const tests = [];
  for (let j = 0; j < maxBlocks; j += 1) {
    const test = {};
    for (const c of characteristics) {
      test[c.id] = c.blocks[j % c.blocks.length].id;
    }
    tests.push(test);
  }
  return tests;
}

// ── PWC (delegates to the shipped, tested pairwise generator) ───────────────────

export function pairWise(characteristics) {
  if (characteristics.length === 0) return [];
  if (characteristics.length === 1) return eachChoice(characteristics);
  const params = characteristics.map((c) => ({
    name: c.id,
    values: c.blocks.map((b) => b.id),
  }));
  const rows = generatePairwise(params);
  return rows.map((row) => {
    const test = {};
    characteristics.forEach((c, i) => { test[c.id] = row[i]; });
    return test;
  });
}

// ── TWC ────────────────────────────────────────────────────────────────────────

// Greedy t-wise covering array. Minimal covering arrays are NP-hard; greedy is
// the standard pedagogical construction (and matches pairwise.js).
export function tWise(characteristics, t) {
  const n = characteristics.length;
  if (n === 0) return [];
  const tt = Math.max(2, Math.min(t, n));
  if (tt >= n) return allCombinations(characteristics);
  if (tt === 2) return pairWise(characteristics);

  const indexCombos = combinations([...Array(n).keys()], tt);
  const tupleKey = (combo, blockIds) =>
    combo.map((ci, k) => `${ci}=${blockIds[k]}`).join('&');

  const uncovered = new Set();
  for (const combo of indexCombos) {
    const blockLists = combo.map((ci) => characteristics[ci].blocks.map((b) => b.id));
    for (const blockIds of cartesian(blockLists)) {
      uncovered.add(tupleKey(combo, blockIds));
    }
  }

  const tests = [];
  let guard = 100000;
  while (uncovered.size > 0 && guard > 0) {
    guard -= 1;
    const test = {};
    // Greedily pick each characteristic's block to maximise newly-covered tuples.
    for (let ci = 0; ci < n; ci += 1) {
      const c = characteristics[ci];
      let bestBlock = c.blocks[0].id;
      let bestGain = -1;
      for (const b of c.blocks) {
        const trial = { ...test, [c.id]: b.id };
        let gain = 0;
        for (const combo of indexCombos) {
          if (!combo.every((idx) => trial[characteristics[idx].id] !== undefined)) continue;
          const key = tupleKey(combo, combo.map((idx) => trial[characteristics[idx].id]));
          if (uncovered.has(key)) gain += 1;
        }
        if (gain > bestGain) { bestGain = gain; bestBlock = b.id; }
      }
      test[c.id] = bestBlock;
    }
    for (const combo of indexCombos) {
      uncovered.delete(tupleKey(combo, combo.map((idx) => test[characteristics[idx].id])));
    }
    tests.push(test);
  }
  return tests;
}

// ── BCC ────────────────────────────────────────────────────────────────────────

export function baseChoice(characteristics) {
  if (characteristics.length === 0) return [];
  const baseOf = (c) => baseListOf(c)[0];
  const baseTest = {};
  for (const c of characteristics) baseTest[c.id] = baseOf(c);
  const tests = [{ ...baseTest }];
  for (const c of characteristics) {
    for (const b of c.blocks) {
      if (b.id === baseOf(c)) continue;
      tests.push({ ...baseTest, [c.id]: b.id });
    }
  }
  return tests;
}

// ── MBCC ───────────────────────────────────────────────────────────────────────

export function multipleBaseChoice(characteristics) {
  if (characteristics.length === 0) return [];
  const baseCombos = cartesian(characteristics.map(baseListOf));
  const tests = [];
  const seen = new Set();
  const keyOf = (test) => characteristics.map((c) => test[c.id]).join('|');
  const add = (test) => {
    const k = keyOf(test);
    if (!seen.has(k)) { seen.add(k); tests.push(test); }
  };
  for (const combo of baseCombos) {
    const baseTest = {};
    characteristics.forEach((c, i) => { baseTest[c.id] = combo[i]; });
    add({ ...baseTest });
    for (const c of characteristics) {
      const bases = baseListOf(c);
      for (const b of c.blocks) {
        if (bases.includes(b.id)) continue;
        add({ ...baseTest, [c.id]: b.id });
      }
    }
  }
  return tests;
}
```

### Step 4 — Run the test, verify it passes

Run: `npx vitest run src/tests/inputSpacePartition.test.js`
Expected: PASS — all engine cases green.

### Step 5 — Full suite

Run: `npx vitest run 2>&1 | tail -3`
Expected: every pre-existing test green; total grows by ~9.

### Step 6 — Commit

```bash
git add src/utils/inputSpacePartition.js src/tests/inputSpacePartition.test.js
git commit -m "$(cat <<'EOF'
feat(isp): input space partitioning coverage engine

Pure six-criteria engine (ACoC / TWC / PWC / ECC / BCC / MBCC) for the
new Input Space Partitioning Explorer. PWC delegates to the shipped
generatePairwise; TWC is a greedy covering array. Unit tests verify
each generator genuinely satisfies its criterion and the subsumption
relationships hold.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Authored IDMs + i18n

**Files:**
- Create: `src/data/ispExamples.js`
- Create: `src/tests/ispExamples.test.js`
- Modify: `src/i18n/dict.js`

### Step 1 — Write the data-invariant test

Create `src/tests/ispExamples.test.js`:

```javascript
import { describe, expect, it } from 'vitest';
import { ISP_EXAMPLES } from '../data/ispExamples.js';
import { messages } from '../i18n/dict.js';

describe('ISP examples', () => {
  it('ships at least three IDMs', () => {
    expect(ISP_EXAMPLES.length).toBeGreaterThanOrEqual(3);
  });

  for (const ex of ISP_EXAMPLES) {
    describe(`IDM: ${ex.id}`, () => {
      it('has a nameKey that resolves in en and zh', () => {
        expect(messages.en[ex.nameKey], `${ex.nameKey} (en)`).toBeTruthy();
        expect(messages.zh[ex.nameKey], `${ex.nameKey} (zh)`).toBeTruthy();
      });
      it('has ≥1 characteristic, each with ≥2 blocks and an in-range baseIndex', () => {
        expect(ex.characteristics.length).toBeGreaterThanOrEqual(1);
        for (const c of ex.characteristics) {
          expect(typeof c.name).toBe('string');
          expect(c.name.length).toBeGreaterThan(0);
          expect(c.blocks.length).toBeGreaterThanOrEqual(2);
          expect(c.baseIndex).toBeGreaterThanOrEqual(0);
          expect(c.baseIndex).toBeLessThan(c.blocks.length);
        }
      });
    });
  }
});
```

### Step 2 — Run it, verify it fails

Run: `npx vitest run src/tests/ispExamples.test.js`
Expected: FAIL — `ISP_EXAMPLES` unresolved.

### Step 3 — Create the data module

Create `src/data/ispExamples.js`:

```javascript
// Authored Input Domain Models for the ISP Explorer. Following the
// PairwiseExplorer precedent, characteristic names and block labels are
// plain strings (uniform with user-edited content); only `nameKey` — the
// example chip's display name — is an i18n key.

export const ISP_EXAMPLES = [
  {
    id: 'find-element',
    nameKey: 'isp.example.findElement',
    characteristics: [
      { name: 'list length',  blocks: ['0', '1', '≥2'],             baseIndex: 1 },
      { name: 'target found', blocks: ['absent', 'once', 'many'],   baseIndex: 1 },
      { name: 'position',     blocks: ['first', 'middle', 'last'],  baseIndex: 0 },
    ],
  },
  {
    id: 'password',
    nameKey: 'isp.example.password',
    characteristics: [
      { name: 'length',  blocks: ['<8', '8–16', '>16'], baseIndex: 1 },
      { name: 'digit',   blocks: ['yes', 'no'],          baseIndex: 0 },
      { name: 'symbol',  blocks: ['yes', 'no'],          baseIndex: 0 },
    ],
  },
  {
    id: 'date',
    nameKey: 'isp.example.date',
    characteristics: [
      { name: 'month',     blocks: ['31-day', '30-day', 'Feb'],     baseIndex: 0 },
      { name: 'day',       blocks: ['1–28', '29', '30', '31'],      baseIndex: 0 },
      { name: 'leap year', blocks: ['yes', 'no'],                   baseIndex: 1 },
    ],
  },
];
```

### Step 4 — Add i18n keys (en + zh)

Open `src/i18n/dict.js`. In the **en** `messages.en` block, near the existing `blackboxTab.ceg` key, add:

```javascript
    'blackboxTab.isp': 'Input Space Partitioning',
    'isp.example.findElement': 'findElement(list, target)',
    'isp.example.password': 'Password validator',
    'isp.example.date': 'Date validity',
    'isp.idmTitle': 'Input Domain Model',
    'isp.addCharacteristic': '+ characteristic',
    'isp.addBlock': '+ block',
    'isp.removeCharacteristic': 'Remove characteristic',
    'isp.baseHint': 'When BCC or MBCC is selected, click a block to mark it as a base choice.',
    'isp.criterionTitle': 'Coverage criterion',
    'isp.criterion.acoc': 'All Combinations (ACoC)',
    'isp.criterion.twc': 'T-Wise (TWC)',
    'isp.criterion.pwc': 'Pair-Wise (PWC)',
    'isp.criterion.ecc': 'Each Choice (ECC)',
    'isp.criterion.bcc': 'Base Choice (BCC)',
    'isp.criterion.mbcc': 'Multiple Base Choice (MBCC)',
    'isp.twiseT': 't =',
    'isp.testSetTitle': 'Test set',
    'isp.testCountUnit': 'tests',
    'isp.countComparison': 'Test-count comparison',
    'isp.subsumption': 'Subsumption',
    'isp.subsumptionHint': 'A stronger criterion (above) subsumes the weaker ones it points to.',
    'isp.capNote': '… and more (table capped)',
    'isp.invalidIDM': 'Each characteristic needs at least one block.',
    'isp.invalidBCC': 'BCC needs exactly one base block per characteristic.',
    'isp.invalidMBCC': 'MBCC needs at least one base block per characteristic.',
    'isp.tooLarge': 'This criterion produces too many tests to enumerate — showing the count only.',
    'isp.quiz.prompt': 'A test set that satisfies All Combinations Coverage (ACoC) automatically satisfies which of these?',
    'isp.quiz.a': 'None — each criterion is independent',
    'isp.quiz.b': 'Only ECC',
    'isp.quiz.c': 'TWC, PWC, and ECC — ACoC subsumes them all',
    'isp.quiz.d': 'BCC and MBCC',
```

In the **zh** `messages.zh` block, near the parallel `blackboxTab.ceg` key, add:

```javascript
    'blackboxTab.isp': '輸入空間劃分',
    'isp.example.findElement': 'findElement(list, target)',
    'isp.example.password': '密碼驗證器',
    'isp.example.date': '日期有效性',
    'isp.idmTitle': '輸入域模型',
    'isp.addCharacteristic': '+ 特徵',
    'isp.addBlock': '+ 區塊',
    'isp.removeCharacteristic': '移除特徵',
    'isp.baseHint': '選擇 BCC 或 MBCC 時，點擊區塊可將其標記為基準選擇。',
    'isp.criterionTitle': '覆蓋準則',
    'isp.criterion.acoc': '全組合（ACoC）',
    'isp.criterion.twc': 'T 維（TWC）',
    'isp.criterion.pwc': '成對（PWC）',
    'isp.criterion.ecc': '各選擇（ECC）',
    'isp.criterion.bcc': '基準選擇（BCC）',
    'isp.criterion.mbcc': '多重基準選擇（MBCC）',
    'isp.twiseT': 't =',
    'isp.testSetTitle': '測試集合',
    'isp.testCountUnit': '個測試',
    'isp.countComparison': '測試數比較',
    'isp.subsumption': '包含關係',
    'isp.subsumptionHint': '較強的準則（上方）包含它所指向的較弱準則。',
    'isp.capNote': '……還有更多（表格已截斷）',
    'isp.invalidIDM': '每個特徵至少需要一個區塊。',
    'isp.invalidBCC': 'BCC 每個特徵需要剛好一個基準區塊。',
    'isp.invalidMBCC': 'MBCC 每個特徵至少需要一個基準區塊。',
    'isp.tooLarge': '此準則產生的測試過多，無法逐一列出——僅顯示數量。',
    'isp.quiz.prompt': '滿足全組合覆蓋（ACoC）的測試集合，會自動滿足下列哪一項？',
    'isp.quiz.a': '都不會——每個準則彼此獨立',
    'isp.quiz.b': '只有 ECC',
    'isp.quiz.c': 'TWC、PWC 與 ECC——ACoC 包含它們全部',
    'isp.quiz.d': 'BCC 與 MBCC',
```

Do NOT remove or modify existing keys.

### Step 5 — Run both tests

Run: `npx vitest run src/tests/ispExamples.test.js`
Expected: PASS.

### Step 6 — Full suite

Run: `npx vitest run 2>&1 | tail -3`
Expected: green.

### Step 7 — Commit

```bash
git add src/data/ispExamples.js src/tests/ispExamples.test.js src/i18n/dict.js
git commit -m "$(cat <<'EOF'
feat(isp): authored IDMs + i18n for the ISP Explorer

Three authored Input Domain Models (findElement / password / date) and
the en+zh i18n keys for the explorer chrome, six criterion names, and
the quiz.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: The Explorer component

**Files:**
- Create: `src/components/InputSpacePartitioningExplorer.js`
- Create: `src/components/InputSpacePartitioningExplorer.css`
- Create: `src/tests/InputSpacePartitioningExplorer.test.jsx`
- Modify: `src/styles.css`
- Modify: `src/data/explorerTags.js`, `src/utils/urlRouter.js` (test-forced registration)

Closure-factory style (read `src/components/PairwiseExplorer.js` for the idiom — `createX()` returns a root element, local `let` state, a `render()` that sets `innerHTML` and re-binds events).

### Step 1 — Write the jsdom test first

Create `src/tests/InputSpacePartitioningExplorer.test.jsx`:

```javascript
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { createInputSpacePartitioningExplorer } from '../components/InputSpacePartitioningExplorer.js';

let dom;
let document;
let container;

beforeEach(() => {
  dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>');
  document = dom.window.document;
  globalThis.document = document;
  globalThis.window = dom.window;
  globalThis.HTMLElement = dom.window.HTMLElement;
  container = document.getElementById('root');
});

afterEach(() => {
  dom.window.close();
  delete globalThis.document;
  delete globalThis.window;
  delete globalThis.HTMLElement;
});

function mount() {
  const el = createInputSpacePartitioningExplorer();
  container.appendChild(el);
  return el;
}

describe('InputSpacePartitioningExplorer', () => {
  it('mounts with the root testid and the first example loaded', () => {
    const root = mount();
    expect(root.dataset.testid).toBe('isp-explorer');
    expect(root.querySelector('[data-testid="isp-characteristic-0"]')).toBeTruthy();
  });

  it('defaults to ACoC and shows a full-product test set', () => {
    const root = mount();
    // find-element default IDM: 3 × 3 × 3 = 27 ACoC tests.
    const rows = root.querySelectorAll('[data-testid^="isp-test-row-"]');
    expect(rows.length).toBe(27);
  });

  it('switching to ECC shrinks the test set to max block count (3)', () => {
    const root = mount();
    root.querySelector('[data-testid="isp-criterion-ecc"]').click();
    const rows = root.querySelectorAll('[data-testid^="isp-test-row-"]');
    expect(rows.length).toBe(3);
  });

  it('switching to BCC yields 1 + Σ(kᵢ−1) tests', () => {
    const root = mount();
    root.querySelector('[data-testid="isp-criterion-bcc"]').click();
    const rows = root.querySelectorAll('[data-testid^="isp-test-row-"]');
    // find-element: 1 + (3-1) + (3-1) + (3-1) = 7
    expect(rows.length).toBe(7);
  });

  it('renders the 6-criterion count comparison', () => {
    const root = mount();
    for (const c of ['acoc', 'twc', 'pwc', 'ecc', 'bcc', 'mbcc']) {
      expect(root.querySelector(`[data-testid="isp-count-bar-${c}"]`), c).toBeTruthy();
    }
  });

  it('switching the example reloads the IDM', () => {
    const root = mount();
    root.querySelector('[data-testid="isp-example-password"]').click();
    expect(root.querySelector('[data-testid="isp-characteristic-0"]').textContent).toContain('length');
  });

  it('adding a block to a characteristic changes the ACoC count', () => {
    const root = mount();
    const before = root.querySelectorAll('[data-testid^="isp-test-row-"]').length;
    const input = root.querySelector('[data-testid="isp-add-block-0"]');
    input.value = 'huge';
    input.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    const after = root.querySelectorAll('[data-testid^="isp-test-row-"]').length;
    expect(after).toBeGreaterThan(before);
  });

  it('renders the subsumption lattice with all six nodes', () => {
    const root = mount();
    for (const c of ['acoc', 'twc', 'pwc', 'ecc', 'bcc', 'mbcc']) {
      expect(root.querySelector(`[data-testid="isp-lattice-node-${c}"]`), c).toBeTruthy();
    }
  });

  it('quiz flow: pick c, correct', () => {
    const root = mount();
    root.querySelector('[data-testid="isp-quiz-start"]').click();
    root.querySelector('input[name="isp-quiz"][value="c"]').click();
    root.querySelector('[data-testid="isp-quiz-submit"]').click();
    expect(root.querySelector('[data-testid="isp-quiz-result"]').classList.contains('quiz-correct')).toBe(true);
  });
});
```

### Step 2 — Run it, verify it fails

Run: `npx vitest run src/tests/InputSpacePartitioningExplorer.test.jsx`
Expected: FAIL — module unresolved.

### Step 3 — Create the component

Create `src/components/InputSpacePartitioningExplorer.js`:

```javascript
import { t, onLocaleChange } from '../i18n/index.js';
import { ISP_EXAMPLES } from '../data/ispExamples.js';
import {
  allCombinations, tWise, pairWise, eachChoice, baseChoice, multipleBaseChoice,
} from '../utils/inputSpacePartition.js';

// Input Space Partitioning Explorer — Ammann & Offutt's IDM + the six
// coverage criteria with a subsumption lattice and test-count comparison.
// Closure-factory style (per-instance state), matching PairwiseExplorer.

const CRITERIA = ['acoc', 'twc', 'pwc', 'ecc', 'bcc', 'mbcc'];
const MAX_ENUMERATE = 500;   // never build a test set larger than this
const MAX_ROWS = 100;        // cap the displayed table

let _uid = 0;
function uid() { _uid += 1; return `i${_uid}`; }

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

// Build a runtime IDM (with per-instance ids) from an authored example.
function idmFromExample(ex) {
  return ex.characteristics.map((c) => {
    const blocks = c.blocks.map((label) => ({ id: uid(), label }));
    return { id: uid(), name: c.name, blocks, baseBlockIds: [blocks[c.baseIndex].id] };
  });
}

export function createInputSpacePartitioningExplorer() {
  const root = document.createElement('div');
  root.className = 'isp-explorer';
  root.dataset.testid = 'isp-explorer';

  let exampleId = ISP_EXAMPLES[0].id;
  let idm = idmFromExample(ISP_EXAMPLES[0]);
  let criterion = 'acoc';
  let twiseT = 2;
  const blockDraft = {};   // characteristicId → pending new-block text
  const quiz = { active: false, phase: 'idle', answer: '' };

  // ── engine dispatch ──────────────────────────────────────────────────────────

  function generate(crit) {
    switch (crit) {
      case 'acoc': return allCombinations(idm);
      case 'twc':  return tWise(idm, twiseT);
      case 'pwc':  return pairWise(idm);
      case 'ecc':  return eachChoice(idm);
      case 'bcc':  return baseChoice(idm);
      case 'mbcc': return multipleBaseChoice(idm);
      default:     return [];
    }
  }

  // Count for a criterion — uses formulas where they avoid enumerating a huge
  // set (ACoC), generation otherwise.
  function countFor(crit) {
    if (crit === 'acoc') return idm.length === 0 ? 0 : idm.reduce((n, c) => n * c.blocks.length, 1);
    if (crit === 'ecc')  return idm.length === 0 ? 0 : Math.max(...idm.map((c) => c.blocks.length));
    if (crit === 'bcc')  return idm.length === 0 ? 0 : 1 + idm.reduce((n, c) => n + c.blocks.length - 1, 0);
    return generate(crit).length;   // pwc / twc / mbcc — covering arrays stay small
  }

  // ── validation ───────────────────────────────────────────────────────────────

  function idmError() {
    if (idm.some((c) => c.blocks.length < 1)) return 'isp.invalidIDM';
    if (criterion === 'bcc' && idm.some((c) => c.baseBlockIds.length !== 1)) return 'isp.invalidBCC';
    if (criterion === 'mbcc' && idm.some((c) => c.baseBlockIds.length < 1)) return 'isp.invalidMBCC';
    return null;
  }

  // ── sub-renderers ────────────────────────────────────────────────────────────

  function renderExampleChips() {
    return `<div class="isp-chip-bar" data-testid="isp-examples">
      ${ISP_EXAMPLES.map((ex) => `
        <button type="button"
          class="isp-chip${exampleId === ex.id ? ' isp-chip--active' : ''}"
          data-testid="isp-example-${esc(ex.id)}" data-isp-example="${esc(ex.id)}">
          ${esc(t(ex.nameKey))}
        </button>`).join('')}
    </div>`;
  }

  function renderIdm() {
    const baseInteractive = criterion === 'bcc' || criterion === 'mbcc';
    const rows = idm.map((c, ci) => `
      <div class="isp-char-row" data-testid="isp-characteristic-${ci}">
        <input class="isp-char-name" data-isp-char-name="${esc(c.id)}" value="${esc(c.name)}" />
        <div class="isp-block-bar">
          ${c.blocks.map((b) => `
            <span class="isp-block${c.baseBlockIds.includes(b.id) ? ' isp-block--base' : ''}${baseInteractive ? ' isp-block--base-interactive' : ''}"
              data-testid="isp-block-${esc(c.id)}-${esc(b.id)}"
              data-isp-block="${esc(c.id)}:${esc(b.id)}">
              ${esc(b.label)}
              <button type="button" class="isp-block-x" data-isp-block-remove="${esc(c.id)}:${esc(b.id)}">×</button>
            </span>`).join('')}
          <input class="isp-add-block" data-testid="isp-add-block-${ci}" data-isp-add-block="${esc(c.id)}"
            placeholder="${esc(t('isp.addBlock'))}" value="${esc(blockDraft[c.id] || '')}" />
        </div>
        <button type="button" class="isp-char-x" data-isp-char-remove="${esc(c.id)}"
          title="${esc(t('isp.removeCharacteristic'))}">×</button>
      </div>`).join('');
    return `<div class="isp-idm" data-testid="isp-idm">
      <div class="isp-idm-head">
        <h3>${esc(t('isp.idmTitle'))}</h3>
        <button type="button" class="isp-add-char" data-testid="isp-add-characteristic" data-isp-add-char>
          ${esc(t('isp.addCharacteristic'))}
        </button>
      </div>
      ${rows}
      ${baseInteractive ? `<p class="isp-hint">${esc(t('isp.baseHint'))}</p>` : ''}
    </div>`;
  }

  function renderCriterionSelector() {
    const btns = CRITERIA.map((c) => `
      <button type="button"
        class="isp-criterion-btn${criterion === c ? ' isp-criterion-btn--active' : ''}"
        data-testid="isp-criterion-${c}" data-isp-criterion="${c}">
        ${esc(t(`isp.criterion.${c}`))}
      </button>`).join('');
    const tStep = criterion === 'twc' ? `
      <label class="isp-twise-t">${esc(t('isp.twiseT'))}
        <input type="number" min="2" max="${idm.length}" value="${twiseT}"
          data-testid="isp-twise-t" data-isp-twise-t />
      </label>` : '';
    return `<div class="isp-criterion-bar">
      <span class="isp-criterion-title">${esc(t('isp.criterionTitle'))}</span>
      ${btns}${tStep}
    </div>`;
  }

  function renderTestSet() {
    const err = idmError();
    if (err) {
      return `<div class="isp-test-set" data-testid="isp-test-set">
        <p class="isp-invalid">${esc(t(err))}</p></div>`;
    }
    const count = countFor(criterion);
    if (count > MAX_ENUMERATE) {
      return `<div class="isp-test-set" data-testid="isp-test-set">
        <h3>${esc(t('isp.testSetTitle'))} — ${count} ${esc(t('isp.testCountUnit'))}</h3>
        <p class="isp-invalid">${esc(t('isp.tooLarge'))}</p></div>`;
    }
    const tests = generate(criterion);
    const shown = tests.slice(0, MAX_ROWS);
    const header = idm.map((c) => `<th>${esc(c.name)}</th>`).join('');
    const rows = shown.map((test, ri) => `
      <tr data-testid="isp-test-row-${ri}">
        <td>${ri + 1}</td>
        ${idm.map((c) => {
          const block = c.blocks.find((b) => b.id === test[c.id]);
          return `<td>${esc(block ? block.label : '')}</td>`;
        }).join('')}
      </tr>`).join('');
    const capNote = tests.length > MAX_ROWS
      ? `<p class="isp-cap-note">${esc(t('isp.capNote'))}</p>` : '';
    return `<div class="isp-test-set" data-testid="isp-test-set">
      <h3>${esc(t('isp.testSetTitle'))} — ${tests.length} ${esc(t('isp.testCountUnit'))}</h3>
      <table class="isp-test-table">
        <thead><tr><th>#</th>${header}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${capNote}
    </div>`;
  }

  function renderCountComparison() {
    const counts = CRITERIA.map((c) => ({ c, n: countFor(c) }));
    const max = Math.max(1, ...counts.map((x) => x.n));
    return `<div class="isp-count" data-testid="isp-count">
      <h3>${esc(t('isp.countComparison'))}</h3>
      ${counts.map(({ c, n }) => `
        <div class="isp-count-row${criterion === c ? ' isp-count-row--active' : ''}">
          <span class="isp-count-label">${esc(t(`isp.criterion.${c}`))}</span>
          <span class="isp-count-bar" data-testid="isp-count-bar-${c}"
            style="width:${Math.round((n / max) * 100)}%"></span>
          <span class="isp-count-n">${n}</span>
        </div>`).join('')}
    </div>`;
  }

  function renderLattice() {
    // Static subsumption: acoc→twc→pwc→ecc ; mbcc→bcc→ecc.
    return `<div class="isp-lattice" data-testid="isp-lattice">
      <h3>${esc(t('isp.subsumption'))}</h3>
      <div class="isp-lattice-graph">
        ${CRITERIA.map((c) => `
          <span class="isp-lattice-node isp-lattice-node--${c}${criterion === c ? ' isp-lattice-node--active' : ''}"
            data-testid="isp-lattice-node-${c}">${esc(t(`isp.criterion.${c}`))}</span>`).join('')}
      </div>
      <p class="isp-hint">${esc(t('isp.subsumptionHint'))}</p>
    </div>`;
  }

  function renderQuiz() {
    if (!quiz.active) {
      return `<button type="button" class="isp-quiz-start" data-testid="isp-quiz-start">${esc(t('quiz.start'))}</button>`;
    }
    if (quiz.phase === 'done') {
      const correct = quiz.answer === 'c';
      return `<div class="isp-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="isp-quiz-result">
        <p>${correct ? esc(t('quiz.correct')) : esc(t('quiz.wrong'))}</p>
        <button type="button" data-testid="isp-quiz-close">${esc(t('quiz.close'))}</button>
      </div>`;
    }
    return `<div class="isp-quiz" data-testid="isp-quiz">
      <p>${esc(t('isp.quiz.prompt'))}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="isp-quiz-option">
          <input type="radio" name="isp-quiz" value="${k}" ${quiz.answer === k ? 'checked' : ''} />
          ${esc(t(`isp.quiz.${k}`))}
        </label>`).join('')}
      <button type="button" data-testid="isp-quiz-submit" ${!quiz.answer ? 'disabled' : ''}>${esc(t('quiz.submit'))}</button>
    </div>`;
  }

  function render() {
    root.innerHTML = `
      <div class="isp-wrap">
        ${renderExampleChips()}
        ${renderIdm()}
        ${renderCriterionSelector()}
        <div class="isp-panels-row">
          ${renderTestSet()}
          ${renderCountComparison()}
        </div>
        ${renderLattice()}
        <section class="isp-self-test">
          <h3>${esc(t('quiz.title'))}</h3>
          ${renderQuiz()}
        </section>
      </div>`;
    bindEvents();
  }

  function findChar(cid) { return idm.find((c) => c.id === cid); }

  function bindEvents() {
    root.querySelectorAll('[data-isp-example]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ex = ISP_EXAMPLES.find((e) => e.id === btn.dataset.ispExample);
        if (!ex || ex.id === exampleId) return;
        exampleId = ex.id;
        idm = idmFromExample(ex);
        render();
      });
    });
    root.querySelectorAll('[data-isp-criterion]').forEach((btn) => {
      btn.addEventListener('click', () => { criterion = btn.dataset.ispCriterion; render(); });
    });
    root.querySelector('[data-isp-twise-t]')?.addEventListener('change', (e) => {
      const v = parseInt(e.target.value, 10);
      twiseT = Number.isFinite(v) ? Math.max(2, Math.min(v, idm.length)) : 2;
      render();
    });
    root.querySelectorAll('[data-isp-char-name]').forEach((inp) => {
      inp.addEventListener('change', () => {
        const c = findChar(inp.dataset.ispCharName);
        if (c) { c.name = inp.value; render(); }
      });
    });
    root.querySelector('[data-isp-add-char]')?.addEventListener('click', () => {
      const b1 = { id: uid(), label: 'block 1' };
      const b2 = { id: uid(), label: 'block 2' };
      idm.push({ id: uid(), name: 'new characteristic', blocks: [b1, b2], baseBlockIds: [b1.id] });
      render();
    });
    root.querySelectorAll('[data-isp-char-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        idm = idm.filter((c) => c.id !== btn.dataset.ispCharRemove);
        render();
      });
    });
    root.querySelectorAll('[data-isp-add-block]').forEach((inp) => {
      inp.addEventListener('change', () => {
        const cid = inp.dataset.ispAddBlock;
        const label = inp.value.trim();
        const c = findChar(cid);
        if (c && label) { c.blocks.push({ id: uid(), label }); blockDraft[cid] = ''; }
        else { blockDraft[cid] = inp.value; }
        render();
      });
    });
    root.querySelectorAll('[data-isp-block-remove]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const [cid, bid] = btn.dataset.ispBlockRemove.split(':');
        const c = findChar(cid);
        if (!c || c.blocks.length <= 1) return;  // keep ≥1 block
        c.blocks = c.blocks.filter((b) => b.id !== bid);
        c.baseBlockIds = c.baseBlockIds.filter((id) => id !== bid);
        if (c.baseBlockIds.length === 0) c.baseBlockIds = [c.blocks[0].id];
        render();
      });
    });
    // Base-block marking — only when BCC/MBCC is active.
    root.querySelectorAll('.isp-block--base-interactive').forEach((span) => {
      span.addEventListener('click', () => {
        const [cid, bid] = span.dataset.ispBlock.split(':');
        const c = findChar(cid);
        if (!c) return;
        if (criterion === 'bcc') {
          c.baseBlockIds = [bid];                       // exactly one base
        } else {                                        // mbcc — toggle
          c.baseBlockIds = c.baseBlockIds.includes(bid)
            ? c.baseBlockIds.filter((id) => id !== bid)
            : [...c.baseBlockIds, bid];
          if (c.baseBlockIds.length === 0) c.baseBlockIds = [bid];
        }
        render();
      });
    });
    root.querySelector('[data-testid="isp-quiz-start"]')?.addEventListener('click', () => {
      quiz.active = true; quiz.phase = 'question'; quiz.answer = ''; render();
    });
    root.querySelectorAll('input[name="isp-quiz"]').forEach((inp) => {
      inp.addEventListener('change', () => { quiz.answer = inp.value; render(); });
    });
    root.querySelector('[data-testid="isp-quiz-submit"]')?.addEventListener('click', () => {
      quiz.phase = 'done'; render();
    });
    root.querySelector('[data-testid="isp-quiz-close"]')?.addEventListener('click', () => {
      quiz.active = false; quiz.phase = 'idle'; quiz.answer = ''; render();
    });
  }

  onLocaleChange(() => render());
  render();
  return root;
}
```

### Step 4 — Create the CSS

Create `src/components/InputSpacePartitioningExplorer.css`:

```css
.isp-wrap { display: flex; flex-direction: column; gap: 16px; }

.isp-chip-bar { display: flex; flex-wrap: wrap; gap: 6px; }
.isp-chip {
  padding: 5px 12px;
  border: 1px solid var(--app-border);
  border-radius: 999px;
  background: var(--app-surface);
  font: inherit; font-size: 0.82rem; font-weight: 600; cursor: pointer;
}
.isp-chip--active {
  background: var(--app-primary-strong);
  border-color: var(--app-primary-strong);
  color: #fff;
}

.isp-idm {
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface);
  padding: 12px;
}
.isp-idm-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.isp-add-char, .isp-add-block {
  font: inherit; font-size: 0.8rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-sm);
  background: var(--app-surface); padding: 4px 8px; cursor: pointer;
}
.isp-char-row {
  display: grid;
  grid-template-columns: 12em 1fr auto;
  gap: 8px; align-items: center;
  padding: 6px 0; border-bottom: 1px solid var(--app-border-muted);
}
.isp-char-name {
  font: inherit; font-weight: 600;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-sm); padding: 4px 8px;
}
.isp-block-bar { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.isp-block {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 8px;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-sm);
  background: var(--app-surface-muted);
  font-size: 0.82rem;
}
.isp-block--base { border-color: var(--app-primary); font-weight: 700; }
.isp-block--base-interactive { cursor: pointer; }
.isp-block-x, .isp-char-x {
  border: none; background: transparent; cursor: pointer;
  color: var(--app-text-subtle); font-size: 0.9rem; padding: 0 2px;
}
.isp-hint { font-size: 0.78rem; color: var(--app-text-subtle); margin-top: 6px; }

.isp-criterion-bar { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.isp-criterion-title { font-size: 0.82rem; font-weight: 700; color: var(--app-text-subtle); }
.isp-criterion-btn {
  font: inherit; font-size: 0.8rem; font-weight: 600; cursor: pointer;
  padding: 5px 10px;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-sm);
  background: var(--app-surface);
}
.isp-criterion-btn--active {
  background: var(--app-primary-strong);
  border-color: var(--app-primary-strong); color: #fff;
}
.isp-twise-t { font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px; }
.isp-twise-t input { width: 3em; font: inherit; padding: 2px 4px; }

.isp-panels-row {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 16px;
}
.isp-test-set, .isp-count, .isp-lattice {
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface); padding: 12px;
}
.isp-test-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
.isp-test-table th, .isp-test-table td {
  text-align: left; padding: 4px 8px;
  border-bottom: 1px solid var(--app-border-muted);
}
.isp-test-table th { color: var(--app-text-subtle); font-size: 0.74rem; text-transform: uppercase; }
.isp-cap-note, .isp-invalid { font-size: 0.8rem; color: var(--app-text-subtle); margin-top: 8px; }

.isp-count-row {
  display: grid;
  grid-template-columns: 9em 1fr 2.5em;
  gap: 8px; align-items: center; margin: 6px 0;
}
.isp-count-row--active .isp-count-label { font-weight: 700; }
.isp-count-label { font-size: 0.78rem; }
.isp-count-bar {
  display: inline-block; height: 12px;
  background: var(--app-primary); border-radius: 3px; min-width: 2px;
}
.isp-count-row--active .isp-count-bar { background: var(--app-primary-strong); }
.isp-count-n { font-size: 0.8rem; text-align: right; font-variant-numeric: tabular-nums; }

.isp-lattice-graph { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
.isp-lattice-node {
  padding: 4px 10px;
  border: 1px solid var(--app-border);
  border-radius: 999px;
  font-size: 0.78rem; background: var(--app-surface-muted);
}
.isp-lattice-node--active {
  background: var(--app-primary-strong);
  border-color: var(--app-primary-strong); color: #fff;
}

.isp-self-test { margin-top: 8px; }
.isp-quiz, .isp-quiz-result {
  background: var(--app-surface-muted);
  border-radius: var(--app-radius-md);
  padding: 12px; display: flex; flex-direction: column; gap: 8px;
}
.isp-quiz-option { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; }
.quiz-correct { background: #dcfce7; color: #166534; }
.quiz-wrong { background: #fee2e2; color: #991b1b; }
```

### Step 5 — Import the CSS

Open `src/styles.css`. Near the other component imports, add:

```css
@import url('./components/InputSpacePartitioningExplorer.css');
```

### Step 6 — Register the explorer (test-forced)

`src/tests/explorerTags.test.js` globs `src/components/*.js` and requires an `EXPLORER_TAGS` entry; `src/tests/urlRouter.test.js` then requires a matching `EXPLORER_TO_LOCATION` entry. Make both:

**`src/data/explorerTags.js`** — add to `EXPLORER_TAGS` (next to the other black-box entries):
```javascript
  InputSpacePartitioningExplorer: {
    level: ['unit'], technique: ['equivalence', 'pairwise'], series: ['blackbox'],
    difficulty: 'intermediate', source: [TEXTBOOK],
  },
```
Append `'InputSpacePartitioningExplorer'` to the `SECTION_EXPLORERS.blackbox` array.

**`src/utils/urlRouter.js`** — in `TAB_SECTIONS.blackbox.tabs`, insert `'isp'` after `'ec'` so it reads `['bva', 'ec', 'isp', 'dt', 'st', 'mt', 'et', 'td', 'pairwise', 'ceg']`. Add to `EXPLORER_TO_LOCATION`:
```javascript
  InputSpacePartitioningExplorer: { section: 'blackbox', tab: 'isp' },
```

### Step 7 — Run the component test

Run: `npx vitest run src/tests/InputSpacePartitioningExplorer.test.jsx`
Expected: PASS — all 9 it() cases green.

### Step 8 — Full suite

Run: `npx vitest run 2>&1 | tail -3`
Expected: green.

### Step 9 — Commit

```bash
git add src/components/InputSpacePartitioningExplorer.js src/components/InputSpacePartitioningExplorer.css src/tests/InputSpacePartitioningExplorer.test.jsx src/styles.css src/data/explorerTags.js src/utils/urlRouter.js
git commit -m "$(cat <<'EOF'
feat(isp): InputSpacePartitioningExplorer component

The `isp` black-box tab — an editable input-domain model, the six
coverage criteria via the live engine, a test-count comparison, and
the subsumption lattice. Registers the explorer in explorerTags +
urlRouter (test-forced).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Wire the tab into the section

**Files:**
- Modify: `src/app.js`
- Modify: `src/tests/urlRouter.test.js`
- Modify (generated): `src/standalone.js`

### Step 1 — app.js

Open `src/app.js`. Three edits:

**1a — import.** With the other black-box explorer imports:
```javascript
import { createInputSpacePartitioningExplorer } from './components/InputSpacePartitioningExplorer.js';
```

**1b — components map.** Find the `components = { ... }` object literal; next to the `ec:` entry add:
```javascript
      isp: createInputSpacePartitioningExplorer(),
```

**1c — blackboxTabs.** Find the `blackboxTabs` array (~line 914). Insert, immediately after the `ec` entry:
```javascript
      { id: 'isp', key: 'blackboxTab.isp', component: components.isp },
```
The panel-build loop iterates `blackboxTabs` generically — no other change needed.

### Step 2 — urlRouter test

Open `src/tests/urlRouter.test.js`. Next to the other black-box `?explorer=` routing assertions, add (matching the file's style):
```javascript
  it('routes ?explorer=InputSpacePartitioningExplorer to section=blackbox tab=isp', () => {
    const out = parseAppLocation('?explorer=InputSpacePartitioningExplorer', '');
    expect(out.section).toBe('blackbox');
    expect(out.tab).toBe('isp');
  });
```
Confirm the parser import name and assertion style against the existing tests before writing.

### Step 3 — Run the suite

Run: `npx vitest run 2>&1 | tail -4`
Expected: all green. If a test asserts a fixed black-box tab count, update it to 10 — do not relax meaningful assertions.

### Step 4 — Regenerate the standalone bundle

Run: `npm run build:standalone`
Expected: `Built standalone bundle at src/standalone.js`.

### Step 5 — Manual smoke

Run: `npm run dev`. In the browser: black-box section → a new `Input Space Partitioning` tab after `ec`. Confirm: the IDM editor shows characteristics/blocks; the 6 criterion buttons regenerate the test set; the count comparison shows 6 bars; TWC reveals a `t` stepper; selecting BCC/MBCC lets you click blocks to mark base choices; editing a block label / adding a characteristic updates counts; the lattice and quiz render; en↔zh toggles labels. Kill the dev server after.

### Step 6 — Commit

```bash
git add src/app.js src/tests/urlRouter.test.js src/standalone.js
git commit -m "$(cat <<'EOF'
feat(isp): wire the Input Space Partitioning tab into the black-box section

Mounts InputSpacePartitioningExplorer as the `isp` tab (after `ec`) in
app.js; adds the urlRouter routing test; regenerates the standalone
bundle.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Final verification + PR

**Files:** none.

### Step 1 — Full suite

Run: `npx vitest run 2>&1 | tail -3`
Expected: every test green.

### Step 2 — Bundle guard

Run: `npm run build:standalone && git diff --quiet src/standalone.js && echo "bundle current" || echo "bundle stale"`
Expected: `bundle current`.

### Step 3 — Scope check

Run: `git diff main..HEAD --stat` — confirm only `src/` files (the 6 created + `app.js`, `dict.js`, `styles.css`, `explorerTags.js`, `urlRouter.js`, `urlRouter.test.js`, `standalone.js`). No `docs/slides/`, no `sectionTaxonomy.js`.

### Step 4 — Push and open the PR

```bash
git push -u origin feat/input-space-partitioning
gh pr create --base main --title "feat(isp): Input Space Partitioning Explorer — A&O coverage criteria" --body "$(cat <<'EOF'
## Summary
- New `isp` tab in the black-box section: an Explorer for Ammann & Offutt's Input Space Partitioning.
- Editable input-domain model (characteristics → blocks) with three authored example IDMs (findElement / password / date).
- A live six-criteria coverage engine — ACoC, TWC, PWC, ECC, BCC, MBCC — with a test-count comparison and the subsumption lattice. PWC reuses the shipped `generatePairwise`; TWC is a greedy covering array.

## Test Plan
- [x] engine unit tests verify each generator satisfies its criterion + subsumption
- [x] IDM data-invariant test
- [x] 9 jsdom cases for the Explorer
- [x] urlRouter routing for InputSpacePartitioningExplorer
- [x] full suite green; standalone bundle regenerated (CI guard satisfied)
- [ ] manual: the tab renders, criteria regenerate the test set, editing updates counts, en↔zh

Spec: docs/superpowers/specs/2026-05-21-input-space-partitioning-design.md
Plan: docs/superpowers/plans/2026-05-21-input-space-partitioning.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-review notes

- **Spec coverage:** Task 1 ↔ §"The coverage engine" (6 generators); Task 2 ↔ §Data + i18n; Task 3 ↔ §UI layout + the component; Task 4 ↔ §Wiring; Task 5 ↔ the PR. The subsumption lattice (§UI) is `renderLattice()`; the count comparison is `renderCountComparison()`; the cap/validation behaviour is `MAX_ENUMERATE` / `MAX_ROWS` / `idmError()`.
- **No placeholders:** the engine, data, component, CSS, and all three test files are spelled out in full; the i18n block lists every key with en + zh values.
- **Type/name consistency:** a characteristic is `{ id, name, blocks: [{id,label}], baseBlockIds }` throughout — `idmFromExample` builds it, the engine consumes `{ id, blocks:[{id}], baseBlockIds }` (the component's blocks also carry `label`, which the engine ignores). The engine exports `allCombinations / tWise / pairWise / eachChoice / baseChoice / multipleBaseChoice` — same names imported by the component. Test IDs (`isp-explorer`, `isp-example-*`, `isp-characteristic-N`, `isp-block-*`, `isp-add-block-N`, `isp-criterion-*`, `isp-twise-t`, `isp-test-set`, `isp-test-row-N`, `isp-count-bar-*`, `isp-lattice-node-*`, `isp-quiz-*`) are consistent between the component and its test.
- **ACoC explosion guard:** `countFor('acoc')` uses the product formula (never enumerates); `renderTestSet` refuses to generate when the count exceeds `MAX_ENUMERATE`. PWC/TWC/MBCC counts come from generation but their covering arrays stay small.
- **Test-forced registration:** Task 3 touches `explorerTags.js` (component-glob test) and `urlRouter.js` (the `EXPLORER_TO_LOCATION` coverage test) — same pattern as prior explorers. `app.js` and the routing test land in Task 4.
- **Standalone bundle:** Task 4 regenerates it; the `standalone-bundle` CI job enforces it.
