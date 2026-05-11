import { describe, expect, it } from 'vitest';
import {
  generateTestsFromCoverage,
  formatConcreteCall,
} from '../utils/testGeneration.js';

const ABS_SRC = `function abs(x) {
  if (x < 0) {
    return -x;
  }
  return x;
}
`;

const MAX3_SRC = `function max3(a, b, c) {
  let m = a;
  if (b > m) {
    m = b;
  }
  if (c > m) {
    m = c;
  }
  return m;
}
`;

describe('generateTestsFromCoverage', () => {
  it('rejects an unsupported criterion', () => {
    const result = generateTestsFromCoverage({ sourceCode: ABS_SRC, criterion: 'mc/dc' });
    expect(result.error).toMatch(/Unsupported criterion/);
    expect(result.selectedTests).toEqual([]);
  });

  it('reports parse errors without throwing', () => {
    const result = generateTestsFromCoverage({
      sourceCode: 'this is not a function',
      criterion: 'node',
    });
    expect(result.error).toBeTruthy();
  });

  it('abs(x) under node coverage yields 2 selected tests covering both branches', () => {
    const result = generateTestsFromCoverage({ sourceCode: ABS_SRC, criterion: 'node' });
    expect(result.error).toBeUndefined();
    expect(result.function.name).toBe('abs');
    expect(result.totalRequirements).toBeGreaterThanOrEqual(1);
    // At least the start/decision/end nodes are feasible.
    expect(result.feasibleRequirements).toBe(result.totalRequirements);
    // Selected tests should witness both x<0 and x>=0.
    const xs = result.selectedTests.map((t) => t.witness.x).sort((a, b) => a - b);
    expect(xs.length).toBeGreaterThanOrEqual(2);
    expect(xs[0]).toBeLessThan(0);
    expect(xs[xs.length - 1]).toBeGreaterThanOrEqual(0);
  });

  it('abs(x) under edge coverage covers every directed edge', () => {
    const result = generateTestsFromCoverage({ sourceCode: ABS_SRC, criterion: 'edge' });
    expect(result.error).toBeUndefined();
    const edgesCovered = new Set();
    for (const t of result.selectedTests) {
      for (const id of t.coveredRequirementIds) edgesCovered.add(id);
    }
    // All edge requirements present in the suite must be covered.
    const edgeReqIds = result.requirements.filter((r) => r.type === 'edge').map((r) => r.id);
    for (const id of edgeReqIds) expect(edgesCovered.has(id)).toBe(true);
  });

  it('max3 under node coverage yields witnesses for "b > m" and "c > m" branches', () => {
    const result = generateTestsFromCoverage({ sourceCode: MAX3_SRC, criterion: 'node' });
    expect(result.error).toBeUndefined();
    expect(result.totalRequirements).toBeGreaterThan(0);
    expect(result.feasibleRequirements).toBe(result.totalRequirements);

    // Among the witnessed paths there should exist at least one where b > a
    // (taking the first if's then-branch) and one where c > m (taking the
    // second if's then-branch).
    const enteringFirst = result.witnessedPaths.some(
      (wp) => wp.feasible && wp.witness && wp.witness.b > wp.witness.a,
    );
    const enteringSecond = result.witnessedPaths.some(
      (wp) =>
        wp.feasible
        && wp.witness
        && wp.witness.c > Math.max(wp.witness.a, wp.witness.b),
    );
    expect(enteringFirst).toBe(true);
    expect(enteringSecond).toBe(true);
  });

  it('greedy set cover never selects more tests than feasible requirements', () => {
    const result = generateTestsFromCoverage({ sourceCode: MAX3_SRC, criterion: 'edge-pair' });
    expect(result.error).toBeUndefined();
    expect(result.selectedCount).toBeLessThanOrEqual(result.feasibleRequirements);
  });

  it('selected tests collectively cover every feasible requirement', () => {
    const result = generateTestsFromCoverage({ sourceCode: MAX3_SRC, criterion: 'edge' });
    const feasibleIds = new Set(
      result.requirementCoverage.filter((r) => r.feasible).map((r) => r.requirementId),
    );
    const covered = new Set();
    for (const t of result.selectedTests) {
      for (const id of t.coveredRequirementIds) covered.add(id);
    }
    for (const id of feasibleIds) expect(covered.has(id)).toBe(true);
  });

  it('formatConcreteCall produces a recognisable JS call expression', () => {
    expect(formatConcreteCall('abs', ['x'], { x: -3 })).toBe('abs(-3)');
    expect(formatConcreteCall('max3', ['a', 'b', 'c'], { a: 1, b: 2, c: 3 })).toBe('max3(1, 2, 3)');
    expect(formatConcreteCall('abs', ['x'], null)).toBe('abs(?)');
  });
});
