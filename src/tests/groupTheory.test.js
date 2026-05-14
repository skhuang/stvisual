import { describe, it, expect } from 'vitest';
import {
  parseDNF,
  computeAutGroup,
  orbitPartition,
  determinationPairs,
  coveringArray,
  mrFromOrbit,
} from '../utils/groupTheory.js';

// ── parseDNF ─────────────────────────────────────────────────────────────────

describe('parseDNF', () => {
  it('extracts variables from a two-variable AND formula', () => {
    const { vars, valid } = parseDNF('A AND B');
    expect(vars).toEqual(['A', 'B']);
    expect(valid).toBe(true);
  });

  it('returns valid=false for empty string', () => {
    const { vars, valid } = parseDNF('');
    expect(vars).toEqual([]);
    expect(valid).toBe(false);
  });

  it('handles single variable', () => {
    const { vars, valid } = parseDNF('X');
    expect(vars).toEqual(['X']);
    expect(valid).toBe(true);
  });

  it('extracts three variables from nested formula', () => {
    const { vars, valid } = parseDNF('A OR (B AND C)');
    expect(vars).toHaveLength(3);
    expect(valid).toBe(true);
  });

  it('handles NOT prefix', () => {
    const { vars, valid } = parseDNF('NOT A');
    expect(vars).toEqual(['A']);
    expect(valid).toBe(true);
  });
});

// ── computeAutGroup ───────────────────────────────────────────────────────────

describe('computeAutGroup', () => {
  it('returns identity only for single variable', () => {
    const auts = computeAutGroup(['A'], 'A');
    expect(auts).toHaveLength(1);
    expect(auts[0]).toEqual(['A']);
  });

  it('finds Z₂ symmetry for A AND B (commutative)', () => {
    const auts = computeAutGroup(['A', 'B'], 'A AND B');
    expect(auts).toHaveLength(2);
    const perms = auts.map(p => p.join(','));
    expect(perms).toContain('A,B');
    expect(perms).toContain('B,A');
  });

  it('finds Z₂ symmetry for A OR B', () => {
    const auts = computeAutGroup(['A', 'B'], 'A OR B');
    expect(auts).toHaveLength(2);
  });

  it('returns identity only when B does not appear in formula', () => {
    const auts = computeAutGroup(['A', 'B'], 'A');
    expect(auts).toHaveLength(1);
    expect(auts[0]).toEqual(['A', 'B']);
  });

  it('finds full S₃ for symmetric 3-variable AND', () => {
    const auts = computeAutGroup(['A', 'B', 'C'], 'A AND B AND C');
    expect(auts).toHaveLength(6);
  });

  it('finds full S₃ for (A AND B) OR (B AND C) OR (A AND C)', () => {
    const auts = computeAutGroup(['A', 'B', 'C'], '(A AND B) OR (B AND C) OR (A AND C)');
    expect(auts).toHaveLength(6);
  });

  it('returns [] for empty vars', () => {
    expect(computeAutGroup([], '')).toEqual([]);
  });

  it('identity always included in autGroup', () => {
    const auts = computeAutGroup(['A', 'B'], 'A AND NOT B');
    const identityStr = ['A', 'B'].join(',');
    expect(auts.map(p => p.join(','))).toContain(identityStr);
  });
});

// ── orbitPartition ────────────────────────────────────────────────────────────

describe('orbitPartition', () => {
  it('trivial autGroup (identity only) produces 2^n singleton orbits', () => {
    const auts = computeAutGroup(['A', 'B'], 'A AND NOT B');
    const orbits = orbitPartition(['A', 'B'], auts);
    expect(orbits.size).toBe(4);
  });

  it('Z₂ symmetry on A AND B produces 3 orbits', () => {
    const auts = computeAutGroup(['A', 'B'], 'A AND B');
    const orbits = orbitPartition(['A', 'B'], auts);
    expect(orbits.size).toBe(3);
  });

  it('single variable produces 2 orbits', () => {
    const auts = computeAutGroup(['A'], 'A');
    const orbits = orbitPartition(['A'], auts);
    expect(orbits.size).toBe(2);
  });

  it('S₃ on 3 vars produces 4 orbits (Hamming weight classes)', () => {
    const vars = ['A', 'B', 'C'];
    const auts = computeAutGroup(vars, 'A AND B AND C');
    const orbits = orbitPartition(vars, auts);
    expect(orbits.size).toBe(4);
  });

  it('total rows across all orbits equals 2^n', () => {
    const vars = ['A', 'B', 'C'];
    const auts = computeAutGroup(vars, '(A AND B) OR (B AND C) OR (A AND C)');
    const orbits = orbitPartition(vars, auts);
    const total = [...orbits.values()].reduce((s, o) => s + o.length, 0);
    expect(total).toBe(8);
  });

  it('repr of each orbit is its minimum mask', () => {
    const vars = ['A', 'B'];
    const auts = computeAutGroup(vars, 'A AND B');
    const orbits = orbitPartition(vars, auts);
    for (const [repr, members] of orbits) {
      expect(Math.min(...members)).toBe(repr);
    }
  });
});

// ── determinationPairs ────────────────────────────────────────────────────────

describe('determinationPairs', () => {
  it('single variable: one non-derived pair', () => {
    const vars = ['A'];
    const auts = computeAutGroup(vars, 'A');
    const dp = determinationPairs(vars, 'A', auts);
    expect(dp).toHaveLength(1);
    expect(dp[0].varName).toBe('A');
    expect(dp[0].pairs).toHaveLength(1);
    expect(dp[0].pairs[0].derived).toBe(false);
  });

  it('A AND B: B pair is derivable from A pair via swap symmetry', () => {
    const vars = ['A', 'B'];
    const formula = 'A AND B';
    const auts = computeAutGroup(vars, formula);
    const dp = determinationPairs(vars, formula, auts);
    const dpA = dp.find(d => d.varName === 'A');
    const dpB = dp.find(d => d.varName === 'B');
    expect(dpA.pairs.some(p => !p.derived)).toBe(true);
    expect(dpB.pairs.every(p => p.derived)).toBe(true);
  });

  it('A OR B: same derivability pattern as AND (Z₂ symmetry)', () => {
    const vars = ['A', 'B'];
    const formula = 'A OR B';
    const auts = computeAutGroup(vars, formula);
    const dp = determinationPairs(vars, formula, auts);
    const derivedCount = dp.flatMap(d => d.pairs).filter(p => p.derived).length;
    const nonDerivedCount = dp.flatMap(d => d.pairs).filter(p => !p.derived).length;
    expect(derivedCount).toBeGreaterThan(0);
    expect(nonDerivedCount).toBeGreaterThan(0);
  });

  it('asymmetric formula: no pairs are derived', () => {
    const vars = ['A', 'B'];
    const formula = 'A AND NOT B';
    const auts = computeAutGroup(vars, formula);
    const dp = determinationPairs(vars, formula, auts);
    const derived = dp.flatMap(d => d.pairs).filter(p => p.derived);
    expect(derived).toHaveLength(0);
  });

  it('returns one entry per variable', () => {
    const vars = ['A', 'B', 'C'];
    const formula = '(A AND B) OR (B AND C) OR (A AND C)';
    const auts = computeAutGroup(vars, formula);
    const dp = determinationPairs(vars, formula, auts);
    expect(dp).toHaveLength(3);
    expect(dp.map(d => d.varName)).toEqual(['A', 'B', 'C']);
  });
});

// ── coveringArray ─────────────────────────────────────────────────────────────

describe('coveringArray', () => {
  it('t=1 produces exactly p rows', () => {
    expect(coveringArray(2, 4, 1)).toHaveLength(2);
    expect(coveringArray(3, 4, 1)).toHaveLength(3);
  });

  it('t=1 rows each have k columns', () => {
    const ca = coveringArray(2, 5, 1);
    for (const row of ca) expect(row).toHaveLength(5);
  });

  it('t=2 with p=2, k=3 produces 4 rows', () => {
    expect(coveringArray(2, 3, 2)).toHaveLength(4);
  });

  it('t=2 with p=3, k=4 produces 9 rows', () => {
    expect(coveringArray(3, 4, 2)).toHaveLength(9);
  });

  it('each row has exactly k columns', () => {
    const ca = coveringArray(2, 3, 2);
    for (const row of ca) expect(row).toHaveLength(3);
  });

  it('all values are valid alphabet symbols (0..p-1 as strings)', () => {
    const ca = coveringArray(3, 4, 2);
    for (const row of ca) for (const v of row) expect(['0', '1', '2']).toContain(v);
  });

  it('t=2, p=2, k=3: every pair of columns covers all 4 combinations', () => {
    const ca = coveringArray(2, 3, 2);
    for (let c1 = 0; c1 < 3; c1++) {
      for (let c2 = c1 + 1; c2 < 3; c2++) {
        const seen = new Set(ca.map(r => `${r[c1]},${r[c2]}`));
        expect(seen.size).toBe(4);
      }
    }
  });

  it('t=2, p=3, k=4: every pair of columns covers all 9 combinations', () => {
    const ca = coveringArray(3, 4, 2);
    for (let c1 = 0; c1 < 4; c1++) {
      for (let c2 = c1 + 1; c2 < 4; c2++) {
        const seen = new Set(ca.map(r => `${r[c1]},${r[c2]}`));
        expect(seen.size).toBe(9);
      }
    }
  });
});

// ── mrFromOrbit ───────────────────────────────────────────────────────────────

describe('mrFromOrbit', () => {
  it('single-element orbit returns trivial MR message', () => {
    const mr = mrFromOrbit([0b11], ['A', 'B']);
    expect(mr).toMatch(/trivial/i);
  });

  it('two-element orbit contains both input tuples', () => {
    const mr = mrFromOrbit([0b01, 0b10], ['A', 'B']);
    expect(mr).toContain('A=F');
    expect(mr).toContain('B=T');
    expect(mr).toContain('A=T');
    expect(mr).toContain('B=F');
  });

  it('output contains equality sign between orbit members', () => {
    const mr = mrFromOrbit([0b01, 0b10], ['A', 'B']);
    expect(mr).toContain('=');
    expect(mr.split('=').length).toBeGreaterThanOrEqual(2);
  });
});
