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
