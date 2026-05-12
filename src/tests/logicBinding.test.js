import { describe, it, expect } from 'vitest';
import {
  extractVarsFromBindings,
  solveBinding,
  formatWitnessStr,
  validateBindingExpr,
  buildConstraintStr,
} from '../utils/logicBinding.js';

describe('extractVarsFromBindings', () => {
  it('extracts unique variable names from expressions', () => {
    const bindings = { a: 'x > 0', b: 'y < 10', c: 'x === 0' };
    expect(extractVarsFromBindings(bindings)).toEqual(['x', 'y']);
  });

  it('excludes JS keywords', () => {
    // 'true' and 'false' are keywords; only 'x' is a program variable
    const bindings = { a: 'x > 0 && true', b: 'false || x < 10' };
    expect(extractVarsFromBindings(bindings)).toEqual(['x']);
  });

  it('returns empty for empty bindings', () => {
    expect(extractVarsFromBindings({})).toEqual([]);
  });

  it('excludes clause names themselves', () => {
    const bindings = { a: 'b > 0', b: 'a < 10' };
    // 'a' and 'b' are clause names, not program vars
    expect(extractVarsFromBindings(bindings)).toEqual([]);
  });
});

describe('solveBinding', () => {
  it('finds the smallest satisfying witness', () => {
    // x > 0: smallest positive integer is 1, not 10 or -10.
    const result = solveBinding({
      clauseValues: { a: true },
      bindings: { a: 'x > 0' },
    });
    expect(result.error).toBeUndefined();
    expect(result.witness.x).toBe(1);
  });

  it('returns infeasible for a contradictory row', () => {
    // a=T requires x > 0; b=T requires x < 0 — impossible
    const result = solveBinding({
      clauseValues: { a: true, b: true },
      bindings: { a: 'x > 0', b: 'x < 0' },
    });
    expect(result.error).toBe('infeasible');
  });

  it('correctly negates clause expressions for false values', () => {
    // a=F means !(x > 0), i.e. x <= 0; smallest abs value satisfying is 0.
    const result = solveBinding({
      clauseValues: { a: false },
      bindings: { a: 'x > 0' },
    });
    expect(result.error).toBeUndefined();
    expect(result.witness.x).toBe(0);
  });

  it('handles two-variable expressions', () => {
    // a=T: x > y  →  e.g. x=1, y=0
    const result = solveBinding({
      clauseValues: { a: true },
      bindings: { a: 'x > y' },
    });
    expect(result.error).toBeUndefined();
    expect(result.witness.x).toBeGreaterThan(result.witness.y);
  });

  it('solves a three-clause CACC-style row with minimal values', () => {
    // a=T, b=F, c=T  →  x>0 && !(y<10) && z===0
    // smallest: x=1, y=10, z=0
    const result = solveBinding({
      clauseValues: { a: true, b: false, c: true },
      bindings: { a: 'x > 0', b: 'y < 10', c: 'z === 0' },
    });
    expect(result.error).toBeUndefined();
    const { x, y, z } = result.witness;
    expect(x).toBe(1);
    expect(y).toBe(10);
    expect(z).toBe(0);
  });

  it('analytic solver: negated clause flips operator correctly', () => {
    // a=F means !(x > 0) → x <= 0 → smallest abs is 0
    const result = solveBinding({
      clauseValues: { a: false },
      bindings: { a: 'x > 0' },
    });
    expect(result.error).toBeUndefined();
    expect(result.witness.x).toBe(0);
    expect(result.analytic).toBe(true);
  });

  it('analytic solver: handles !== correctly', () => {
    // z !== 0 → z = 1 (smallest abs ≠ 0)
    const result = solveBinding({
      clauseValues: { a: true },
      bindings: { a: 'z !== 0' },
    });
    expect(result.error).toBeUndefined();
    expect(result.witness.z).not.toBe(0);
    expect(result.analytic).toBe(true);
  });

  it('analytic solver: handles multi-clause single-var intersection', () => {
    // a=T: x > 0, b=F: !(y < 10) → y >= 10. Two independent variables.
    const result = solveBinding({
      clauseValues: { a: true, b: false },
      bindings: { a: 'x > 0', b: 'y < 10' },
    });
    expect(result.error).toBeUndefined();
    expect(result.witness.x).toBe(1);
    expect(result.witness.y).toBe(10);
    expect(result.analytic).toBe(true);
  });

  it('analytic solver: infeasible when interval is empty', () => {
    // x > 0 AND x < 0 → empty intersection
    const result = solveBinding({
      clauseValues: { a: true, b: true },
      bindings: { a: 'x > 0', b: 'x < 0' },
    });
    expect(result.error).toBe('infeasible');
  });

  it('returns no-vars when bindings have no expressions', () => {
    const result = solveBinding({
      clauseValues: { a: true },
      bindings: { a: '' },
    });
    expect(result.error).toBe('no-vars');
  });

  it('analytic solver finds x > 50 without needing a wide search range', () => {
    // The analytic solver handles simple linear constraints exactly,
    // ignoring the search range, so x > 50 → x = 51 even with [-10, 10].
    const result = solveBinding({
      clauseValues: { a: true },
      bindings: { a: 'x > 50' },
      searchRange: [-10, 10],
    });
    expect(result.error).toBeUndefined();
    expect(result.witness.x).toBe(51);
    expect(result.analytic).toBe(true);
  });

  it('brute-force fallback respects searchRange for complex expressions', () => {
    // x > y requires two-variable constraint — analytic falls back to brute-force.
    const infeasible = solveBinding({
      clauseValues: { a: true },
      bindings: { a: 'x > y' },
      searchRange: [5, 5],  // only one value, x > x is impossible
    });
    expect(infeasible.error).toBe('infeasible');

    const feasible = solveBinding({
      clauseValues: { a: true },
      bindings: { a: 'x > y' },
      searchRange: [-5, 5],
    });
    expect(feasible.error).toBeUndefined();
    expect(feasible.witness.x).toBeGreaterThan(feasible.witness.y);
  });
});

describe('formatWitnessStr', () => {
  it('produces readable key=value pairs', () => {
    expect(formatWitnessStr({ x: 1, y: -3 })).toBe('x=1, y=-3');
  });
});

describe('buildConstraintStr', () => {
  it('wraps true clauses without negation', () => {
    expect(buildConstraintStr({ a: true }, { a: 'x > 0' })).toBe('(x > 0)');
  });

  it('negates false clauses', () => {
    expect(buildConstraintStr({ a: false }, { a: 'x > 0' })).toBe('!(x > 0)');
  });

  it('joins multiple clauses with &&', () => {
    const str = buildConstraintStr(
      { a: true, b: false, c: true },
      { a: 'x > 0', b: 'y < 10', c: 'z === 0' },
    );
    expect(str).toBe('(x > 0) && !(y < 10) && (z === 0)');
  });

  it('skips clauses with no binding expression', () => {
    const str = buildConstraintStr(
      { a: true, b: false },
      { a: 'x > 0', b: '' },
    );
    expect(str).toBe('(x > 0)');
  });
});

describe('validateBindingExpr', () => {
  it('returns null for valid expressions', () => {
    expect(validateBindingExpr('x > 0')).toBeNull();
    expect(validateBindingExpr('x + y > z')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(validateBindingExpr('')).toBeNull();
    expect(validateBindingExpr(null)).toBeNull();
  });

  it('returns an error string for syntax errors', () => {
    const err = validateBindingExpr('x >>>>> 0');
    expect(typeof err).toBe('string');
    expect(err.length).toBeGreaterThan(0);
  });
});
