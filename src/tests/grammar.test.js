import { describe, it, expect } from 'vitest';
import {
  parseGrammar,
  generateDerivations,
  computeCoverage,
  generateGrammarMutants,
  recognizes,
  evaluateMutantsAgainstStrings,
  GRAMMAR_OPERATORS,
  STRING_MUTATION_OPERATORS,
  generateStringMutants,
  classifyStringMutants,
  deriveAlphabet,
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

describe('string mutation (Phase 3)', () => {
  it('exports the documented operator list', () => {
    expect(STRING_MUTATION_OPERATORS).toEqual(['REP', 'DEL', 'DUP', 'INS', 'SWP']);
  });

  it('produces distinct mutants of the seed for each requested operator', () => {
    const seed = '0+1';
    const mutants = generateStringMutants(seed, STRING_MUTATION_OPERATORS, {
      alphabet: ['0', '1', '+'],
      maxPerOp: 50,
    });
    // None should equal the seed.
    expect(mutants.every((m) => m.mutated !== seed)).toBe(true);
    // All declared operators should have at least one mutant.
    const ops = new Set(mutants.map((m) => m.operator));
    for (const op of STRING_MUTATION_OPERATORS) {
      expect(ops.has(op)).toBe(true);
    }
    // Sanity: DEL of the seed has length-1, DUP has length+1.
    const del = mutants.find((m) => m.operator === 'DEL');
    const dup = mutants.find((m) => m.operator === 'DUP');
    expect(del.mutated.length).toBe(seed.length - 1);
    expect(dup.mutated.length).toBe(seed.length + 1);
  });

  it('classifies mutants as positive or negative against the grammar', () => {
    const g = parseGrammar(arithText);
    const ds = generateDerivations(g, { maxStrings: 4, maxDepth: 8 });
    const seed = ds[0].string;
    const alphabet = deriveAlphabet(g, ds.map((d) => d.string));
    const raw = generateStringMutants(seed, ['DEL', 'INS'], { alphabet, maxPerOp: 12 });
    const classified = classifyStringMutants(g, raw);
    // Every classified mutant should have a kind and origAccepts === true (seed is in language).
    for (const m of classified) {
      expect(m.origAccepts).toBe(true);
      expect(m.kind === 'positive' || m.kind === 'negative').toBe(true);
      expect(m.mutAccepts).toBe(m.kind === 'positive');
    }
    // For arithmetic with single-char terminals, deletion of "+" or operands typically yields negatives.
    expect(classified.some((m) => m.kind === 'negative')).toBe(true);
  });

  it('deriveAlphabet decomposes multi-character terminals', () => {
    const g = parseGrammar('<S> ::= "true" | "false"');
    const alpha = deriveAlphabet(g);
    expect(new Set(alpha)).toEqual(new Set(['t', 'r', 'u', 'e', 'f', 'a', 'l', 's']));
  });
});
