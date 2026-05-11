import { describe, it, expect } from 'vitest';
import {
  extractVarsFromBindings,
  solveBinding,
  formatWitnessStr,
  validateBindingExpr,
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
  it('finds a witness for a satisfiable row', () => {
    const result = solveBinding({
      clauseValues: { a: true },
      bindings: { a: 'x > 0' },
    });
    expect(result.error).toBeUndefined();
    expect(result.witness.x).toBeGreaterThan(0);
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
    // a=F means !(x > 0), i.e. x <= 0
    const result = solveBinding({
      clauseValues: { a: false },
      bindings: { a: 'x > 0' },
    });
    expect(result.error).toBeUndefined();
    expect(result.witness.x).toBeLessThanOrEqual(0);
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

  it('solves a three-clause CACC-style row', () => {
    // a=T, b=F, c=T  →  x>0 && !(y<10) && z===0
    const result = solveBinding({
      clauseValues: { a: true, b: false, c: true },
      bindings: { a: 'x > 0', b: 'y < 10', c: 'z === 0' },
    });
    expect(result.error).toBeUndefined();
    const { x, y, z } = result.witness;
    expect(x).toBeGreaterThan(0);
    expect(y).toBeGreaterThanOrEqual(10);
    expect(z).toBe(0);
  });

  it('returns no-vars when bindings have no expressions', () => {
    const result = solveBinding({
      clauseValues: { a: true },
      bindings: { a: '' },
    });
    expect(result.error).toBe('no-vars');
  });

  it('respects a custom search range', () => {
    // x > 50 is only satisfiable with range [51, 100]
    const infeasible = solveBinding({
      clauseValues: { a: true },
      bindings: { a: 'x > 50' },
      searchRange: [-10, 10],
    });
    expect(infeasible.error).toBe('infeasible');

    const feasible = solveBinding({
      clauseValues: { a: true },
      bindings: { a: 'x > 50' },
      searchRange: [0, 100],
    });
    expect(feasible.error).toBeUndefined();
    expect(feasible.witness.x).toBeGreaterThan(50);
  });
});

describe('formatWitnessStr', () => {
  it('produces readable key=value pairs', () => {
    expect(formatWitnessStr({ x: 1, y: -3 })).toBe('x=1, y=-3');
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
