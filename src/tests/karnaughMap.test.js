import { describe, it, expect } from 'vitest';
import { parsePredicate, buildTruthTable } from '../utils/logicCoverage.js';
import { buildKMap } from '../utils/karnaughMap.js';

describe('buildKMap', () => {
  it('uses columns=ab and rows=c for 3 clauses', () => {
    const parsed = parsePredicate('(a && b) || c');
    const rows = buildTruthTable(parsed);
    const map = buildKMap(rows, parsed.clauses, true);
    expect(map.unsupported).toBe(false);
    expect(map.rowVars).toEqual(['c']);
    expect(map.colVars).toEqual(['a', 'b']);
    expect(map.colHeaders).toEqual(['00', '01', '11', '10']);
    expect(map.grid).toHaveLength(2);
    map.grid.forEach((r) => expect(r.cells).toHaveLength(4));
    // c=1 row, ab=11 col → minterm 7 → true
    const cellAB11C1 = map.grid[1].cells[2];
    expect(cellAB11C1.minterm).toBe(7);
    expect(cellAB11C1.value).toBe(true);
    // c=0 row, ab=11 col → minterm 6 → true ((a∧b))
    const cellAB11C0 = map.grid[0].cells[2];
    expect(cellAB11C0.minterm).toBe(6);
    expect(cellAB11C0.value).toBe(true);
    // c=0 row, ab=10 col → minterm 4 → false
    const cellAB10C0 = map.grid[0].cells[3];
    expect(cellAB10C0.minterm).toBe(4);
    expect(cellAB10C0.value).toBe(false);
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
