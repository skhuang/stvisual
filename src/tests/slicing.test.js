import { describe, expect, it } from 'vitest';
import {
  backwardSlice, forwardSlice, dynamicSlice, programDice, slicesIntersect,
} from '../utils/slicing.js';

// Minimal PDG:  s1: x=1   s2: y=2   s3: z=x+y   s4: return z
const pdg = {
  statements: [
    { id: 's1', line: 1, text: 'x=1', defs: ['x'], uses: [] },
    { id: 's2', line: 2, text: 'y=2', defs: ['y'], uses: [] },
    { id: 's3', line: 3, text: 'z=x+y', defs: ['z'], uses: ['x', 'y'] },
    { id: 's4', line: 4, text: 'return z', defs: [], uses: ['z'], kind: 'output' },
  ],
  controlDeps: [],
  dataDeps: [['s1', 's3', 'x'], ['s2', 's3', 'y'], ['s3', 's4', 'z']],
};

describe('backwardSlice', () => {
  it('includes every statement affecting the criterion variable', () => {
    const slice = backwardSlice(pdg, { stmtId: 's4', variable: 'z' });
    expect([...slice].sort()).toEqual(['s1', 's2', 's3', 's4']);
  });
  it('a criterion on a never-defined variable yields only the criterion stmt', () => {
    const slice = backwardSlice(pdg, { stmtId: 's3', variable: 'q' });
    expect([...slice]).toEqual(['s3']);
  });
});

describe('forwardSlice', () => {
  it('includes every statement affected by the criterion variable', () => {
    const slice = forwardSlice(pdg, { stmtId: 's1', variable: 'x' });
    expect([...slice].sort()).toEqual(['s1', 's3', 's4']);
  });
});

describe('dynamicSlice', () => {
  it('restricts to the live data-dep edges of a trace', () => {
    const dynPdg = {
      statements: [
        { id: 's1', line: 1, text: 'x=1', defs: ['x'], uses: [] },
        { id: 's1b', line: 2, text: 'x=9', defs: ['x'], uses: [] },
        { id: 's3', line: 3, text: 'z=x', defs: ['z'], uses: ['x'] },
      ],
      controlDeps: [],
      dataDeps: [['s1', 's3', 'x'], ['s1b', 's3', 'x']],
    };
    const trace = { id: 't', steps: ['s1', 's1b', 's3'] };
    const slice = dynamicSlice(dynPdg, trace, { stmtId: 's3', variable: 'x' });
    expect([...slice].sort()).toEqual(['s1b', 's3']); // s1 is shadowed
  });
  it('returns an empty set when the criterion stmt is not executed', () => {
    const trace = { id: 't', steps: ['s1', 's2'] };
    expect(dynamicSlice(pdg, trace, { stmtId: 's4', variable: 'z' }).size).toBe(0);
  });
});

describe('programDice', () => {
  it('keeps statements in the failing slice but in no passing slice', () => {
    const failing = new Set(['s1', 's2', 's3']);
    const passing = [new Set(['s1']), new Set(['s2'])];
    expect([...programDice(failing, passing)]).toEqual(['s3']);
  });
});

describe('slicesIntersect', () => {
  it('is true iff the slices share a statement', () => {
    expect(slicesIntersect(new Set(['a', 'b']), new Set(['b', 'c']))).toBe(true);
    expect(slicesIntersect(new Set(['a']), new Set(['z']))).toBe(false);
  });
});
