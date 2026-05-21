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
  // generatePairwise returns an array of objects keyed by param name
  return generatePairwise(params);
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
  // Safety bound: for the course's IDM sizes (≤ ~6 characteristics × ≤ ~5
  // blocks) this loop terminates in well under 1000 iterations. Exhausting
  // the guard would mean a bug in the greedy logic, not a legitimate input.
  let guard = 100000;
  while (uncovered.size > 0 && guard > 0) {
    guard -= 1;
    const test = {};
    // One-pass left-to-right greedy: pick each characteristic's block to
    // maximise newly-covered tuples given the choices already committed.
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
  // Fail loud rather than silently return an incomplete covering array.
  if (guard <= 0) throw new Error('tWise: guard exhausted — possible infinite loop');
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
