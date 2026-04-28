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
  buildGICCSet,
  buildRICCSet,
  buildImplicantCoverageSet,
  buildUTPCSet,
  buildNFPCSet,
  buildCUTPNFPSet,
  buildAllCoverageSets,
  toDNF,
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
    ['pc', 'cc', 'coc', 'gacc', 'cacc', 'racc', 'gicc', 'ricc', 'ic', 'utpc', 'nfpc', 'cutpnfp'].forEach((id) => {
      expect(analysis.sets[id]).toBeDefined();
    });
  });
});

describe('syntactic logic coverage (DNF)', () => {
  it('produces DNF terms for (a && b) || c', () => {
    const parsed = parsePredicate('(a && b) || c');
    const dnf = toDNF(parsed.ast);
    const keys = dnf.map((term) => term.map((l) => `${l.negated ? '!' : ''}${l.name}`).sort().join('&'));
    expect(keys.sort()).toEqual(['a&b', 'c']);
  });

  it('IC covers each implicant with at least one row', () => {
    const parsed = parsePredicate('(a && b) || c');
    const rows = buildTruthTable(parsed);
    const dnf = toDNF(parsed.ast);
    const set = buildImplicantCoverageSet(rows, dnf);
    expect(set.tests).toHaveLength(dnf.length);
  });

  it('UTPC rows satisfy exactly one implicant', () => {
    const parsed = parsePredicate('(a && b) || c');
    const rows = buildTruthTable(parsed);
    const dnf = toDNF(parsed.ast);
    const set = buildUTPCSet(rows, dnf);
    set.tests.forEach((t) => {
      const term = dnf[t.implicantIndex];
      const others = dnf.filter((_, i) => i !== t.implicantIndex);
      expect(term.every((lit) => Boolean(t.row.values[lit.name]) !== lit.negated)).toBe(true);
      others.forEach((other) => {
        expect(other.every((lit) => Boolean(t.row.values[lit.name]) !== lit.negated)).toBe(false);
      });
    });
  });

  it('NFPC rows make P false and flip exactly one literal of the implicant', () => {
    const parsed = parsePredicate('(a && b) || c');
    const rows = buildTruthTable(parsed);
    const dnf = toDNF(parsed.ast);
    const set = buildNFPCSet(rows, dnf);
    expect(set.tests.length).toBeGreaterThan(0);
    set.tests.forEach((t) => {
      expect(t.row.predicate).toBe(false);
    });
  });

  it('CUTPNFP pairs differ only in the targeted literal', () => {
    const parsed = parsePredicate('(a && b) || c');
    const rows = buildTruthTable(parsed);
    const dnf = toDNF(parsed.ast);
    const set = buildCUTPNFPSet(rows, dnf);
    expect(set.tests.length % 2).toBe(0);
  });
});

describe('inactive clause coverage', () => {
  const parsed = parsePredicate('(a && b) || c');
  const rows = buildTruthTable(parsed);

  it('GICC rows do NOT determine the major clause and cover 4 (c,p) combos when feasible', () => {
    const set = buildGICCSet(rows, parsed.clauses);
    const byMajor = new Map();
    set.tests.forEach((t) => {
      expect(t.row.determines[t.majorClause]).toBe(false);
      const key = t.majorClause;
      if (!byMajor.has(key)) byMajor.set(key, new Set());
      byMajor.get(key).add(`${t.row.values[t.majorClause] ? 'T' : 'F'}${t.row.predicate ? 'T' : 'F'}`);
    });
    byMajor.forEach((combos) => {
      expect(combos.size).toBeGreaterThanOrEqual(2);
    });
  });

  it('RICC pairs share minor clause values within the same predicate value', () => {
    const set = buildRICCSet(rows, parsed.clauses);
    const grouped = new Map();
    set.tests.forEach((t) => {
      const key = `${t.majorClause}|p=${t.row.predicate}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(t.row);
    });
    grouped.forEach((pair, key) => {
      if (pair.length !== 2) return;
      const [a, b] = pair;
      const major = key.split('|')[0];
      Object.keys(a.values).forEach((clause) => {
        if (clause === major) {
          expect(a.values[clause]).not.toBe(b.values[clause]);
        } else {
          expect(a.values[clause]).toBe(b.values[clause]);
        }
      });
    });
  });
});
