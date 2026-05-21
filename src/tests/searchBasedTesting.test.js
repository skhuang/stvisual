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
    expect(branchDistance('<', 5, 5)).toBe(1);
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
