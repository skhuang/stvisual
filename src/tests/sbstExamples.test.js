import { describe, expect, it } from 'vitest';
import { SBST_EXAMPLES } from '../data/sbstExamples.js';

describe('SBST_EXAMPLES', () => {
  it('ships at least three examples, each well-formed', () => {
    expect(SBST_EXAMPLES.length).toBeGreaterThanOrEqual(3);
    for (const ex of SBST_EXAMPLES) {
      expect(typeof ex.id).toBe('string');
      expect(typeof ex.nameKey).toBe('string');
      expect(typeof ex.source).toBe('string');
      expect(Array.isArray(ex.inputSchema)).toBe(true);
      expect(ex.inputSchema.length).toBeGreaterThan(0);
      for (const s of ex.inputSchema) {
        expect(typeof s.name).toBe('string');
        expect(s.min).toBeLessThan(s.max);
      }
      expect(typeof ex.run).toBe('function');
      const ids = ex.branches.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).toContain(ex.target.branchId);
      for (const b of ex.branches) {
        for (const req of b.requires) expect(ids).toContain(req.branchId);
      }
    }
  });
  it('run() probes decisions for every example without throwing', () => {
    for (const ex of SBST_EXAMPLES) {
      const events = [];
      ex.run(ex.inputSchema.map((s) => s.min),
        (branchId, op, lhs, rhs, outcome) => events.push({ branchId, op, lhs, rhs, outcome }));
      for (const e of events) {
        expect(ex.branches.some((b) => b.id === e.branchId)).toBe(true);
        expect(typeof e.outcome).toBe('boolean');
      }
    }
  });
  it('has one example with a nested guard whose target is hard for random search', () => {
    const nested = SBST_EXAMPLES.find((ex) => ex.id === 'nested-guard');
    expect(nested).toBeTruthy();
    const target = nested.branches.find((b) => b.id === nested.target.branchId);
    expect(target.requires.length).toBeGreaterThanOrEqual(1);
  });
});
