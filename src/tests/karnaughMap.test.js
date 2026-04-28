import { describe, it, expect } from 'vitest';
import { parsePredicate, buildTruthTable } from '../utils/logicCoverage.js';
import { buildKMap } from '../utils/karnaughMap.js';

describe('buildKMap', () => {
  it('returns a 2x4 grid for 3 clauses with Gray-code column order', () => {
    const parsed = parsePredicate('(a && b) || c');
    const rows = buildTruthTable(parsed);
    const map = buildKMap(rows, parsed.clauses, true);
    expect(map.unsupported).toBe(false);
    expect(map.rowVars).toEqual(['a']);
    expect(map.colVars).toEqual(['b', 'c']);
    expect(map.colHeaders).toEqual(['00', '01', '11', '10']);
    expect(map.grid).toHaveLength(2);
    map.grid.forEach((r) => expect(r.cells).toHaveLength(4));
    // a=1,b=1,c=1 → minterm 7 → true
    const onCell = map.grid[1].cells[2];
    expect(onCell.minterm).toBe(7);
    expect(onCell.value).toBe(true);
  });

  it('flags target=false (¬f) cells correctly', () => {
    const parsed = parsePredicate('a && b');
    const rows = buildTruthTable(parsed);
    const map = buildKMap(rows, parsed.clauses, false);
    // ¬(a∧b) is true everywhere except a=b=1 (minterm 3)
    const trues = map.grid.flatMap((r) => r.cells).filter((c) => c.value);
    expect(trues).toHaveLength(3);
    expect(trues.find((c) => c.minterm === 3)).toBeUndefined();
  });

  it('returns unsupported flag for >4 clauses', () => {
    const parsed = parsePredicate('a && b && c && d && e');
    const rows = buildTruthTable(parsed);
    const map = buildKMap(rows, parsed.clauses, true);
    expect(map.unsupported).toBe(true);
    expect(map.n).toBe(5);
  });
});
