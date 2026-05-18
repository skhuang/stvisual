import { describe, expect, it } from 'vitest';
import { SLICING_EXAMPLES, getSlicingExample } from '../data/slicingExamples.js';
import { backwardSlice } from '../utils/slicing.js';

describe('slicingExamples integrity', () => {
  it('has at least three examples, each with a unique id', () => {
    expect(SLICING_EXAMPLES.length).toBeGreaterThanOrEqual(3);
    const ids = SLICING_EXAMPLES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('getSlicingExample finds by id and returns null for an unknown id', () => {
    expect(getSlicingExample('grade-average')?.id).toBe('grade-average');
    expect(getSlicingExample('nope')).toBeNull();
  });

  it('every dependence edge and trace step references a real statement id', () => {
    for (const ex of SLICING_EXAMPLES) {
      const ids = new Set(ex.statements.map((s) => s.id));
      for (const [from, to] of ex.controlDeps) {
        expect(ids.has(from), `${ex.id} controlDep from ${from}`).toBe(true);
        expect(ids.has(to), `${ex.id} controlDep to ${to}`).toBe(true);
      }
      for (const [from, to, v] of ex.dataDeps) {
        expect(ids.has(from), `${ex.id} dataDep from ${from}`).toBe(true);
        expect(ids.has(to), `${ex.id} dataDep to ${to}`).toBe(true);
        expect(typeof v).toBe('string');
      }
      for (const tr of ex.traces) {
        for (const sid of tr.steps) {
          expect(ids.has(sid), `${ex.id} trace ${tr.id} step ${sid}`).toBe(true);
        }
      }
    }
  });

  it('every dataDep variable is declared in the source statements', () => {
    for (const ex of SLICING_EXAMPLES) {
      const byId = new Map(ex.statements.map((s) => [s.id, s]));
      for (const [from, to, v] of ex.dataDeps) {
        expect((byId.get(from).defs || []).includes(v),
          `${ex.id}: ${from} should def ${v}`).toBe(true);
        expect((byId.get(to).uses || []).includes(v),
          `${ex.id}: ${to} should use ${v}`).toBe(true);
      }
    }
  });

  it('grade-average: backward slice of the return covers the whole computation', () => {
    const ex = getSlicingExample('grade-average');
    const out = ex.statements.find((s) => s.kind === 'output');
    const slice = backwardSlice(ex, { stmtId: out.id, variable: out.uses[0] });
    expect(slice.size).toBeGreaterThanOrEqual(6);
  });
});
