import { describe, it, expect } from 'vitest';
import {
  parsePredicate,
  buildTruthTable,
  buildPredicateCoverageSet,
  buildClauseCoverageSet,
  buildCombinatorialCoverageSet,
  buildGACCSet,
  buildCACCSet,
  buildRACCSet,
  buildAllCoverageSets,
} from '../utils/logicCoverage.js';

describe('parsePredicate', () => {
  it('parses simple predicate and extracts clauses in order', () => {
    const parsed = parsePredicate('(a && b) || c');
    expect(parsed.clauses).toEqual(['a', 'b', 'c']);
  });

  it('handles negation', () => {
    const parsed = parsePredicate('a && !b');
    expect(parsed.clauses).toEqual(['a', 'b']);
  });

  it('throws for empty input', () => {
    expect(() => parsePredicate('')).toThrow();
  });

  it('throws on invalid syntax', () => {
    expect(() => parsePredicate('a &&')).toThrow();
  });

  it('throws on unsupported character', () => {
    expect(() => parsePredicate('a & b')).toThrow();
  });
});

describe('buildTruthTable', () => {
  it('produces 2^n rows with correct predicate evaluation', () => {
    const parsed = parsePredicate('a && b');
    const rows = buildTruthTable(parsed);
    expect(rows).toHaveLength(4);
    const trueRows = rows.filter((row) => row.predicate);
    expect(trueRows).toHaveLength(1);
    expect(trueRows[0].values).toEqual({ a: true, b: true });
  });

  it('marks determining clauses correctly for OR', () => {
    const parsed = parsePredicate('a || b');
    const rows = buildTruthTable(parsed);
    const aFalseBFalse = rows.find((row) => !row.values.a && !row.values.b);
    expect(aFalseBFalse.determines.a).toBe(true);
    expect(aFalseBFalse.determines.b).toBe(true);
    const aTrueBTrue = rows.find((row) => row.values.a && row.values.b);
    expect(aTrueBTrue.determines.a).toBe(false);
    expect(aTrueBTrue.determines.b).toBe(false);
  });
});

describe('coverage set builders', () => {
  const parsed = parsePredicate('(a && b) || c');
  const rows = buildTruthTable(parsed);

  it('PC requires both predicate values', () => {
    const set = buildPredicateCoverageSet(rows);
    expect(set.tests).toHaveLength(2);
    const predicateValues = set.tests.map((t) => t.row.predicate);
    expect(predicateValues).toContain(true);
    expect(predicateValues).toContain(false);
  });

  it('CC covers each clause both ways', () => {
    const set = buildClauseCoverageSet(rows, parsed.clauses);
    parsed.clauses.forEach((clause) => {
      const seenTrue = set.tests.some((t) => t.row.values[clause] === true);
      const seenFalse = set.tests.some((t) => t.row.values[clause] === false);
      expect(seenTrue).toBe(true);
      expect(seenFalse).toBe(true);
    });
  });

  it('CoC contains all 2^n rows', () => {
    const set = buildCombinatorialCoverageSet(rows);
    expect(set.tests).toHaveLength(rows.length);
  });

  it('GACC includes determining rows for each clause', () => {
    const set = buildGACCSet(rows, parsed.clauses);
    expect(set.tests.length).toBeGreaterThanOrEqual(parsed.clauses.length);
    expect(set.unsatisfied).toEqual([]);
  });

  it('CACC pairs produce different predicate values per major clause', () => {
    const set = buildCACCSet(rows, parsed.clauses);
    const byMajor = new Map();
    set.tests.forEach((t) => {
      if (!byMajor.has(t.majorClause)) byMajor.set(t.majorClause, []);
      byMajor.get(t.majorClause).push(t.row);
    });
    byMajor.forEach((pair) => {
      expect(pair.length).toBe(2);
      expect(pair[0].predicate).not.toBe(pair[1].predicate);
    });
  });

  it('RACC pairs differ only in major clause', () => {
    const set = buildRACCSet(rows, parsed.clauses);
    const byMajor = new Map();
    set.tests.forEach((t) => {
      if (!byMajor.has(t.majorClause)) byMajor.set(t.majorClause, []);
      byMajor.get(t.majorClause).push(t.row);
    });
    byMajor.forEach((pair, major) => {
      expect(pair.length).toBe(2);
      Object.keys(pair[0].values).forEach((clause) => {
        if (clause === major) {
          expect(pair[0].values[clause]).not.toBe(pair[1].values[clause]);
        } else {
          expect(pair[0].values[clause]).toBe(pair[1].values[clause]);
        }
      });
    });
  });
});

describe('buildAllCoverageSets', () => {
  it('returns analysis for every criterion id', () => {
    const parsed = parsePredicate('a && (b || !c)');
    const analysis = buildAllCoverageSets(parsed);
    expect(analysis.rows).toHaveLength(8);
    ['pc', 'cc', 'coc', 'gacc', 'cacc', 'racc'].forEach((id) => {
      expect(analysis.sets[id]).toBeDefined();
      expect(analysis.sets[id].tests.length).toBeGreaterThan(0);
    });
  });
});
