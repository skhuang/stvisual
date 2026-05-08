import { describe, it, expect } from 'vitest';
import { concolicExecute } from '../utils/concolicExecution.js';

describe('concolicExecute', () => {
  it('absolute value: seeded with x=0 then flips to discover x<0 path', () => {
    const result = concolicExecute(
      `function abs(x) { if (x < 0) return -x; return x; }`,
      { initialInputs: { x: 0 }, maxIterations: 10 },
    );
    expect(result.iterations).toHaveLength(2);
    expect(result.uniquePathCount).toBe(2);
    // First iteration: concrete x=0 → branch !taken; engine negates and proposes x<0 input.
    expect(result.iterations[0].pathKey).toBe('F');
    expect(result.iterations[0].nextInput.x).toBeLessThan(0);
    // Second iteration: x<0 → branch taken, no further branches to negate.
    expect(result.iterations[1].pathKey).toBe('T');
    expect(result.iterations[1].nextInput).toBeNull();
  });

  it('triangle classifier: covers all 5 paths from the equilateral seed', () => {
    const result = concolicExecute(
      `
      function classify(a, b, c) {
        if (a <= 0 || b <= 0 || c <= 0) return 0;
        if (a + b <= c || a + c <= b || b + c <= a) return 0;
        if (a == b && b == c) return 3;
        if (a == b || b == c || a == c) return 2;
        return 1;
      }
      `,
      { initialInputs: { a: 1, b: 1, c: 1 }, maxIterations: 16 },
    );
    expect(result.uniquePathCount).toBe(5);
    const returns = result.iterations
      .map((it) => it.returnValue)
      .filter((v) => v != null)
      .sort();
    expect(returns).toEqual([0, 0, 1, 2, 3]);
    // Last iteration must have no further branch to negate.
    expect(result.iterations.at(-1).nextInput).toBeNull();
  });

  it('marks the branch that was negated to derive the next input', () => {
    const result = concolicExecute(
      `function f(x) { if (x < 5) return 1; return 2; }`,
      { initialInputs: { x: 0 } },
    );
    const first = result.iterations[0];
    const negated = first.branches.find((b) => b.negated);
    expect(negated).toBeDefined();
    expect(negated.condition).toBe('x < 5');
    // The new input must satisfy the negated condition (x >= 5).
    expect(first.nextInput.x).toBeGreaterThanOrEqual(5);
  });

  it('respects maxIterations and reports truncation', () => {
    const result = concolicExecute(
      `
      function classify(a, b, c) {
        if (a <= 0 || b <= 0 || c <= 0) return 0;
        if (a + b <= c || a + c <= b || b + c <= a) return 0;
        if (a == b && b == c) return 3;
        if (a == b || b == c || a == c) return 2;
        return 1;
      }
      `,
      { initialInputs: { a: 1, b: 1, c: 1 }, maxIterations: 2 },
    );
    expect(result.iterations).toHaveLength(2);
    expect(result.truncated).toBe(true);
  });
});
