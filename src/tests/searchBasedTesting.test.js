import { describe, expect, it } from 'vitest';
import { makeRng, rngInt, branchDistance, normalize } from '../utils/searchBasedTesting.js';
import { trace, evaluate } from '../utils/searchBasedTesting.js';
import { suiteFitness, wholeSuiteGA } from '../utils/searchBasedTesting.js';
import { SBST_EXAMPLES } from '../data/sbstExamples.js';

describe('makeRng', () => {
  it('is deterministic for a given seed', () => {
    const a = makeRng(42); const b = makeRng(42);
    const seqA = [a(), a(), a()]; const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });
  it('produces values in [0, 1)', () => {
    const r = makeRng(7);
    for (let i = 0; i < 1000; i++) { const v = r(); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1); }
  });
  it('different seeds produce different sequences', () => {
    expect(makeRng(1)()).not.toEqual(makeRng(2)());
  });
});

describe('rngInt', () => {
  it('stays within [lo, hi] inclusive', () => {
    const r = makeRng(99);
    for (let i = 0; i < 1000; i++) { const v = rngInt(r, -5, 5); expect(v).toBeGreaterThanOrEqual(-5); expect(v).toBeLessThanOrEqual(5); expect(Number.isInteger(v)).toBe(true); }
  });
});

describe('branchDistance', () => {
  it('is 0 when the predicate is already true', () => {
    expect(branchDistance('==', 5, 5)).toBe(0);
    expect(branchDistance('<', 3, 9)).toBe(0);
    expect(branchDistance('>', 9, 3)).toBe(0);
    expect(branchDistance('!=', 3, 9)).toBe(0);
  });
  it('grows with the gap for ==', () => {
    expect(branchDistance('==', 10, 17)).toBe(7);
    expect(branchDistance('==', 17, 17)).toBe(0);
  });
  it('uses constant K=1 for strict operators just past the boundary', () => {
    expect(branchDistance('<', 5, 5)).toBe(1);
    expect(branchDistance('>', 5, 5)).toBe(1);
    expect(branchDistance('!=', 4, 4)).toBe(1);
  });
  it('throws on an unknown operator', () => {
    expect(() => branchDistance('~~', 1, 2)).toThrow();
  });
});

describe('normalize', () => {
  it('maps 0 to 0 and grows monotonically toward 1', () => {
    expect(normalize(0)).toBe(0);
    expect(normalize(1)).toBeCloseTo(0.5);
    expect(normalize(1e9)).toBeLessThan(1);
    expect(normalize(10)).toBeGreaterThan(normalize(3));
  });
});

const nested = SBST_EXAMPLES.find((e) => e.id === 'nested-guard');

describe('trace', () => {
  it('records every probed decision in execution order', () => {
    const events = trace(nested, [17, 50]);
    expect(events.map((e) => e.branchId)).toEqual(['b1', 'b2']);
    expect(events[0].outcome).toBe(true);   // x === 17
    expect(events[1].outcome).toBe(false);  // 50 > 100 is false
  });
  it('stops at an unsatisfied outer guard', () => {
    const events = trace(nested, [3, 150]);
    expect(events.map((e) => e.branchId)).toEqual(['b1']);  // x !== 17 → b2 unreached
  });
});

describe('evaluate', () => {
  it('reports cost 0 and covered when the target branch is taken', () => {
    const r = evaluate(nested, [17, 150]);
    expect(r.covered).toBe(true);
    expect(r.cost).toBe(0);
  });
  it('charges approach level 1 when the outer guard diverges', () => {
    const r = evaluate(nested, [10, 150]);   // x !== 17 → diverge at b1
    expect(r.covered).toBe(false);
    expect(r.approachLevel).toBe(1);          // b2 still ahead
    // branch distance at b1: |10 - 17| = 7 → normalize(7) = 7/8
    expect(r.branchDistance).toBeCloseTo(7 / 8);
    expect(r.cost).toBeCloseTo(1 + 7 / 8);
  });
  it('charges approach level 0 when only the target predicate misses', () => {
    const r = evaluate(nested, [17, 90]);     // reached b2, 90 > 100 false
    expect(r.covered).toBe(false);
    expect(r.approachLevel).toBe(0);
    // distance to make 90 > 100 true: branchDistance('>',90,100) = (100-90)+1 = 11
    expect(r.branchDistance).toBeCloseTo(11 / 12);
    expect(r.cost).toBeCloseTo(11 / 12);
  });
  it('a lower cost means closer to covering the target', () => {
    expect(evaluate(nested, [17, 99]).cost).toBeLessThan(evaluate(nested, [17, 10]).cost);
    expect(evaluate(nested, [16, 150]).cost).toBeLessThan(evaluate(nested, [0, 150]).cost);
  });
});

import { randomSearch, hillClimb, geneticAlgorithm } from '../utils/searchBasedTesting.js';

describe('randomSearch', () => {
  it('is deterministic for a fixed seed', () => {
    const a = randomSearch(nested, { seed: 1, budget: 200 });
    const b = randomSearch(nested, { seed: 1, budget: 200 });
    expect(a.bestCost).toEqual(b.bestCost);
    expect(a.history.length).toEqual(b.history.length);
  });
  it('records non-increasing bestCost over the history', () => {
    const { history } = randomSearch(nested, { seed: 5, budget: 300 });
    for (let i = 1; i < history.length; i++) {
      expect(history[i].bestCost).toBeLessThanOrEqual(history[i - 1].bestCost);
    }
  });
});

describe('geneticAlgorithm', () => {
  it('covers the nested-guard target within budget', () => {
    const r = geneticAlgorithm(nested, { seed: 1, budget: 2000, populationSize: 20 });
    expect(r.covered).toBe(true);
    expect(r.bestCost).toBe(0);
  });
  it('is deterministic for a fixed seed', () => {
    const a = geneticAlgorithm(nested, { seed: 3, budget: 2000, populationSize: 20 });
    const b = geneticAlgorithm(nested, { seed: 3, budget: 2000, populationSize: 20 });
    expect(a.bestCost).toEqual(b.bestCost);
    expect(a.history.length).toEqual(b.history.length);
  });
});

describe('hillClimb', () => {
  it('is deterministic for a fixed seed', () => {
    const a = hillClimb(nested, { seed: 2, budget: 2000 });
    const b = hillClimb(nested, { seed: 2, budget: 2000 });
    expect(a.bestCost).toEqual(b.bestCost);
  });
});

describe('driver invariants', () => {
  it('hillClimb history never pairs bestCost 0 with covered false', () => {
    const { history } = hillClimb(nested, { seed: 5, budget: 2000 });
    for (const h of history) {
      expect(h.covered).toBe(h.bestCost === 0);
    }
  });
  it('geneticAlgorithm treats budget as a hard cap', () => {
    for (const budget of [10, 50, 137]) {
      const r = geneticAlgorithm(nested, { seed: 1, budget, populationSize: 20 });
      expect(r.history.length).toBeLessThanOrEqual(budget);
    }
  });
});

describe('strategy comparison', () => {
  it('the genetic algorithm covers every example within budget', () => {
    for (const ex of SBST_EXAMPLES) {
      const r = geneticAlgorithm(ex, { seed: 1, budget: 8000, populationSize: 24 });
      expect(r.covered, ex.id).toBe(true);
    }
  });
  it('hill climbing can get trapped below full coverage on the multimodal example', () => {
    // The modulo creates non-covering local optima (e.g. x = 47); a single
    // trajectory can settle there. At least one seed must exhibit the trap.
    const multimodal = SBST_EXAMPLES.find((e) => e.id === 'multimodal');
    let sawTrap = false;
    for (let seed = 1; seed <= 30 && !sawTrap; seed++) {
      const hc = hillClimb(multimodal, { seed, budget: 4000 });
      if (hc.stuck && !hc.covered) sawTrap = true;
    }
    expect(sawTrap).toBe(true);
  });
});

describe('suiteFitness', () => {
  it('reports full coverage when tests cover every branch outcome', () => {
    // nested-guard outcomes: b1 true/false, b2 true/false.
    const suite = [[17, 150], [17, 10], [3, 0]];
    const r = suiteFitness(nested, suite);
    expect(r.coverage).toBe(1);
    expect(r.cost).toBe(0);
  });
  it('reports partial coverage and positive cost when outcomes are missed', () => {
    const r = suiteFitness(nested, [[3, 0]]);   // only b1=false reached
    expect(r.coverage).toBeLessThan(1);
    expect(r.cost).toBeGreaterThan(0);
  });
});

describe('wholeSuiteGA', () => {
  it('evolves a suite to full coverage of nested-guard within budget', () => {
    const r = wholeSuiteGA(nested, { seed: 1, budget: 3000, populationSize: 16, suiteSize: 4 });
    expect(r.coverage).toBe(1);
  });
  it('is deterministic for a fixed seed', () => {
    const a = wholeSuiteGA(nested, { seed: 7, budget: 3000, populationSize: 16, suiteSize: 4 });
    const b = wholeSuiteGA(nested, { seed: 7, budget: 3000, populationSize: 16, suiteSize: 4 });
    expect(a.coverage).toEqual(b.coverage);
    expect(a.history.length).toEqual(b.history.length);
  });
  it('returns a minimised suite no larger than the evolved suite', () => {
    const r = wholeSuiteGA(nested, { seed: 1, budget: 3000, populationSize: 16, suiteSize: 4 });
    expect(r.minimisedSuite.length).toBeLessThanOrEqual(r.bestSuite.length);
  });
});
