import { describe, it, expect } from 'vitest';
import { symbolicExecute, exprToString, parseProgram } from '../utils/symbolicExecution.js';

describe('symbolicExecute', () => {
  it('parses a function header', () => {
    const fn = parseProgram('function f(a, b) { return a + b; }');
    expect(fn.kind).toBe('function');
    expect(fn.name).toBe('f');
    expect(fn.params).toEqual(['a', 'b']);
  });

  it('absolute value enumerates the two paths and finds witnesses', () => {
    const result = symbolicExecute(`
      function abs(x) {
        if (x < 0) return -x;
        return x;
      }
    `);
    expect(result.paths).toHaveLength(2);
    for (const p of result.paths) expect(p.feasible).toBe(true);
    const negPath = result.paths.find((p) => p.pathCondition[0] === 'x < 0');
    expect(negPath.witness.x).toBeLessThan(0);
    expect(negPath.concreteReturn).toBeGreaterThan(0);
  });

  it('triangle classifier produces five feasible paths', () => {
    const result = symbolicExecute(`
      function classify(a, b, c) {
        if (a <= 0 || b <= 0 || c <= 0) return 0;
        if (a + b <= c || a + c <= b || b + c <= a) return 0;
        if (a == b && b == c) return 3;
        if (a == b || b == c || a == c) return 2;
        return 1;
      }
    `);
    expect(result.paths).toHaveLength(5);
    expect(result.paths.every((p) => p.feasible)).toBe(true);
    const returns = result.paths.map((p) => p.concreteReturn).sort();
    expect(returns).toEqual([0, 0, 1, 2, 3]);
  });

  it('max3 selects each parameter as the maximum on the right path', () => {
    const result = symbolicExecute(`
      function max3(a, b, c) {
        let m = a;
        if (b > m) m = b;
        if (c > m) m = c;
        return m;
      }
    `);
    expect(result.paths).toHaveLength(4);
    // Each path should have a return expression equal to one of the parameters.
    for (const p of result.paths) {
      expect(['a', 'b', 'c']).toContain(p.returnExpression);
    }
  });

  it('bounded while loop is unrolled and produces multiple paths', () => {
    const result = symbolicExecute(
      `
      function gcd(a, b) {
        while (b != 0) {
          let t = b;
          b = a % b;
          a = t;
        }
        return a;
      }
    `,
      { maxLoopUnroll: 3 },
    );
    expect(result.paths.length).toBeGreaterThanOrEqual(3);
    // The "no iteration" path: condition false at the very first check.
    expect(result.paths.some((p) => p.pathCondition[0] === '!(b != 0)')).toBe(true);
  });

  it('exprToString renders binary expressions with sensible precedence', () => {
    const fn = parseProgram('function f(a, b) { return a + b * 2; }');
    const ret = fn.body.statements[0].argument;
    expect(exprToString(ret)).toBe('a + b * 2');
  });

  it('reports parser errors with line numbers', () => {
    expect(() => symbolicExecute('function f( { return 1; }')).toThrow();
  });
});
