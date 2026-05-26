import { describe, it, expect } from 'vitest';
import {
  parsePredicate,
  generateSpecMutants,
  evaluateSpecMutants,
  buildAssignmentSpace,
  evaluateAst,
  astToString,
  SPEC_MUTATION_OPERATORS,
} from '../utils/specMutation.js';
import { createSpecMutationExplorer } from '../components/SpecMutationExplorer.js';

describe('specMutation', () => {
  it('exports the documented operator list', () => {
    expect(SPEC_MUTATION_OPERATORS).toEqual(['ENF', 'BCR', 'CRR', 'LRO', 'UOI', 'MCR']);
  });

  it('astToString round-trips parsed predicates (semantically)', () => {
    const parsed = parsePredicate('(a || b) && c');
    const text = astToString(parsed.ast);
    const reparsed = parsePredicate(text);
    const tests = buildAssignmentSpace(parsed.clauses);
    for (const t of tests) {
      expect(evaluateAst(reparsed.ast, t)).toBe(evaluateAst(parsed.ast, t));
    }
  });

  it('produces ENF, BCR, CRR, LRO, UOI, MCR mutants for (a || b) && c', () => {
    const parsed = parsePredicate('(a || b) && c');
    const mutants = generateSpecMutants(parsed, SPEC_MUTATION_OPERATORS);
    const ops = new Set(mutants.map((m) => m.operator));
    for (const op of SPEC_MUTATION_OPERATORS) {
      expect(ops.has(op)).toBe(true);
    }
    // No mutant equals the original textually.
    const original = astToString(parsed.ast);
    for (const m of mutants) expect(m.text).not.toBe(original);
  });

  it('evaluateSpecMutants kills almost all mutants on the full truth table', () => {
    const parsed = parsePredicate('(a || b) && c');
    const mutants = generateSpecMutants(parsed, SPEC_MUTATION_OPERATORS);
    const tests = buildAssignmentSpace(parsed.clauses);
    const evaluated = evaluateSpecMutants(parsed, mutants, tests);
    // The full truth table distinguishes every non-equivalent mutant; for this
    // predicate we expect at least 90% kill ratio.
    const killed = evaluated.filter((m) => m.killed).length;
    expect(killed / evaluated.length).toBeGreaterThan(0.9);
    // Each killed mutant has at least one killer assignment.
    for (const m of evaluated) {
      if (m.killed) expect(m.killers.length).toBeGreaterThan(0);
    }
  });

  it('LRO swap on a single AND becomes OR and is killed by F-F-F-style assignments', () => {
    const parsed = parsePredicate('a && b');
    const mutants = generateSpecMutants(parsed, ['LRO']);
    expect(mutants).toHaveLength(1);
    expect(mutants[0].text).toBe('a || b');
    const tests = buildAssignmentSpace(parsed.clauses);
    const [evaluated] = evaluateSpecMutants(parsed, mutants, tests);
    expect(evaluated.killed).toBe(true);
    // a=T,b=F flips T→F? No: a&&b = F, a||b = T. Yes flip.
    expect(evaluated.killers.some((k) => k.test.a === true && k.test.b === false)).toBe(true);
  });

  it('BCR replacing a clause with true/false creates two mutants per clause', () => {
    const parsed = parsePredicate('a');
    const mutants = generateSpecMutants(parsed, ['BCR']);
    const texts = new Set(mutants.map((m) => m.text));
    expect(texts.has('true')).toBe(true);
    expect(texts.has('false')).toBe(true);
  });

  // SMV-flavored invariants (Ammann/Offutt §9.5).
  describe('SMV-style specifications', () => {
    const SMV_CASES = [
      { name: 'mutex',    text: '!(c1 && c2)' },
      { name: 'cruise',   text: '!cruise || (ignition && running && !brake)' },
      { name: 'sis',      text: '(si && pressure && !override) || (!si && (!pressure || override))' },
      { name: 'train',    text: '!train || (gate && signal)' },
      { name: 'elevator', text: '!moving || !door' },
      { name: 'latch',    text: '!(x && y)' },
    ];

    for (const c of SMV_CASES) {
      it(`${c.name}: full truth table kills the majority of mutants`, () => {
        const parsed = parsePredicate(c.text);
        const mutants = generateSpecMutants(parsed, SPEC_MUTATION_OPERATORS);
        expect(mutants.length).toBeGreaterThan(0);
        const tests = buildAssignmentSpace(parsed.clauses);
        const evaluated = evaluateSpecMutants(parsed, mutants, tests);
        // ENF must always be killed (negation under any non-tautology / non-contradiction).
        const enf = evaluated.find((m) => m.operator === 'ENF');
        expect(enf?.killed).toBe(true);
        // The truth table should distinguish at least 40% of all mutants — wider
        // predicates have many CRR/MCR mutants that happen to be equivalent.
        const killed = evaluated.filter((m) => m.killed).length;
        expect(killed / evaluated.length).toBeGreaterThan(0.4);
      });
    }
  });
});

describe('SpecMutationExplorer SMV examples', () => {
  function mount() {
    window.localStorage.clear();
    document.body.innerHTML = '';
    const el = createSpecMutationExplorer();
    document.body.appendChild(el);
    return el;
  }

  it('includes the cross-coupled latch SMV source example', () => {
    mount();
    document.querySelector('[data-spec-category="smv"]').click();
    const latchButton = [...document.querySelectorAll('[data-spec-example]')]
      .find((btn) => btn.textContent.trim() === 'Cross-coupled latch');
    expect(latchButton).toBeInTheDocument();

    latchButton.click();
    expect(document.querySelector('[data-testid="spec-text"]')).toHaveValue('!(x && y)');
    const source = document.querySelector('[data-testid="spec-smv-source"]').textContent;
    expect(source).toContain('MODULE main');
    expect(source).toContain('#define false 0');
    expect(source).toContain('next (x) := case');
    expect(source).toContain('INVARSPEC !(x & y)');
  });
});
