import { describe, it, expect } from 'vitest';
import {
  parseGrammar,
  generateDerivations,
  computeCoverage,
  generateGrammarMutants,
  recognizes,
  evaluateMutantsAgainstStrings,
  GRAMMAR_OPERATORS,
} from '../utils/grammar.js';

const arithText = [
  '<E> ::= <E> "+" <T> | <T>',
  '<T> ::= "0" | "1"',
].join('\n');

describe('parseGrammar', () => {
  it('parses non-terminals and terminals correctly', () => {
    const g = parseGrammar(arithText);
    expect(g.start).toBe('E');
    expect(g.productions).toHaveLength(4);
    expect([...g.nonTerminals].sort()).toEqual(['E', 'T']);
    expect([...g.terminals].sort()).toEqual(['+', '0', '1']);
    expect(g.productions[0]).toMatchObject({
      lhs: 'E',
      rhs: [
        { kind: 'NT', value: 'E' },
        { kind: 'T', value: '+' },
        { kind: 'NT', value: 'T' },
      ],
    });
  });

  it('rejects malformed input', () => {
    expect(() => parseGrammar('<E> = "x"')).toThrow(/::=/);
    expect(() => parseGrammar('"x" ::= "y"')).toThrow(/LHS/);
  });
});

describe('generateDerivations', () => {
  it('produces strings entirely composed of terminals', () => {
    const g = parseGrammar(arithText);
    const ds = generateDerivations(g, { maxStrings: 6, maxDepth: 8 });
    expect(ds.length).toBeGreaterThan(0);
    for (const d of ds) {
      // Only terminal characters: 0, 1, +
      expect(/^[01+]+$/.test(d.string)).toBe(true);
    }
    // Must include at least the simplest strings.
    const set = new Set(ds.map((d) => d.string));
    expect(set.has('0') || set.has('1')).toBe(true);
  });
});

describe('computeCoverage', () => {
  it('reports PDC and TSC ratios', () => {
    const g = parseGrammar(arithText);
    const ds = generateDerivations(g, { maxStrings: 6, maxDepth: 8 });
    const cov = computeCoverage(ds, g);
    expect(cov.pdc.all.size).toBe(4);
    expect(cov.tsc.all.size).toBe(3);
    expect(cov.pdc.ratio).toBeGreaterThan(0);
    expect(cov.tsc.ratio).toBeGreaterThan(0);
  });
});

describe('recognizes', () => {
  it('accepts strings in the language and rejects others', () => {
    const g = parseGrammar(arithText);
    expect(recognizes(g, '0')).toBe(true);
    expect(recognizes(g, '1+0+1')).toBe(true);
    expect(recognizes(g, '+')).toBe(false);
    expect(recognizes(g, '0+')).toBe(false);
  });
});

describe('generateGrammarMutants', () => {
  it('produces mutants for each operator that applies', () => {
    const g = parseGrammar(arithText);
    const mutants = generateGrammarMutants(g, GRAMMAR_OPERATORS);
    const ops = new Set(mutants.map((m) => m.operator));
    expect(ops.has('TR')).toBe(true);
    expect(ops.has('PR')).toBe(true);
    expect(ops.has('SD')).toBe(true);
    expect(ops.has('DUP')).toBe(true);
  });

  it('killing strings flip language membership', () => {
    const g = parseGrammar(arithText);
    const mutants = generateGrammarMutants(g, ['SD']);
    // Test strings include valid and invalid cases.
    const strings = ['0', '1', '0+1', '+', ''];
    const evaluated = evaluateMutantsAgainstStrings(g, mutants, strings);
    // At least one SD mutant should be killed.
    expect(evaluated.some((m) => m.killed)).toBe(true);
  });
});
