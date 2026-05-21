// Search-Based Software Testing engine — a deterministic, dependency-free
// metaheuristic search over numeric input vectors, guided by a fitness
// function built from branch distance and approach level.

// ── Seeded RNG ──────────────────────────────────────────────────────────────
// mulberry32: a small, well-distributed 32-bit PRNG. Deterministic — the same
// seed always yields the same sequence, so searches are reproducible.
export function makeRng(seed) {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Integer in [lo, hi] inclusive, drawn from an rng() in [0, 1).
export function rngInt(rng, lo, hi) {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

// ── Branch distance ─────────────────────────────────────────────────────────
// For a decision `lhs OP rhs`, how far the operands are from making the
// predicate TRUE. 0 means it is already true. Standard Korel/Tracey formulas
// with constant K = 1.
const K = 1;
export function branchDistance(op, lhs, rhs) {
  switch (op) {
    case '==': return Math.abs(lhs - rhs);
    case '!=': return lhs !== rhs ? 0 : K;
    case '<':  return lhs < rhs ? 0 : (lhs - rhs) + K;
    case '<=': return lhs <= rhs ? 0 : (lhs - rhs);
    case '>':  return lhs > rhs ? 0 : (rhs - lhs) + K;
    case '>=': return lhs >= rhs ? 0 : (rhs - lhs);
    default:   throw new Error(`branchDistance: unknown operator ${op}`);
  }
}

// Normalise a non-negative distance into [0, 1).
export function normalize(d) {
  return d / (d + 1);
}

// Operator that is true exactly when the given operator is false.
export const NEGATE = { '==': '!=', '!=': '==', '<': '>=', '>=': '<', '<=': '>', '>': '<=' };

// ── Fitness ─────────────────────────────────────────────────────────────────
// Run an example's instrumented function and collect the decision trace.
export function trace(example, inputs) {
  const events = [];
  example.run(inputs, (branchId, op, lhs, rhs, outcome) =>
    events.push({ branchId, op, lhs, rhs, outcome }));
  return events;
}

// Evaluate an input vector against the example's target branch.
// Returns { covered, approachLevel, branchDistance, cost }. cost === 0 ⇔ covered.
// cost = approachLevel + normalised branch distance at the first divergence.
export function evaluate(example, inputs) {
  const events = trace(example, inputs);
  const branch = example.branches.find((b) => b.id === example.target.branchId);
  const required = [...branch.requires, { branchId: example.target.branchId, outcome: example.target.outcome }];
  for (let i = 0; i < required.length; i++) {
    const req = required[i];
    const ev = events.find((e) => e.branchId === req.branchId);
    if (ev && ev.outcome === req.outcome) continue;   // satisfied — descend
    const approachLevel = required.length - i - 1;
    let raw;
    if (ev) {
      const op = req.outcome ? ev.op : NEGATE[ev.op];
      raw = branchDistance(op, ev.lhs, ev.rhs);
    } else {
      raw = Infinity;   // decision never reached — no operands available
    }
    const bd = raw === Infinity ? 1 : normalize(raw);
    return { covered: false, approachLevel, branchDistance: bd, cost: approachLevel + bd };
  }
  return { covered: true, approachLevel: 0, branchDistance: 0, cost: 0 };
}

// ── Search drivers ──────────────────────────────────────────────────────────
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function randomIndividual(rng, schema) { return schema.map((s) => rngInt(rng, s.min, s.max)); }

// Random search — sample input vectors uniformly; keep the best seen.
export function randomSearch(example, { seed, budget }) {
  const rng = makeRng(seed);
  const history = [];
  let bestCost = Infinity, bestIndividual = null;
  for (let i = 0; i < budget; i++) {
    const ind = randomIndividual(rng, example.inputSchema);
    const cost = evaluate(example, ind).cost;
    if (cost < bestCost) { bestCost = cost; bestIndividual = ind; }
    history.push({ evaluation: i + 1, bestCost, bestIndividual, covered: bestCost === 0 });
    if (bestCost === 0) break;
  }
  return { strategy: 'random', history, covered: bestCost === 0, bestIndividual, bestCost };
}

// Hill climbing — from one random start, repeatedly move to the best improving
// ±1 neighbour. Stops when no neighbour improves (a local optimum) or budget runs out.
export function hillClimb(example, { seed, budget }) {
  const rng = makeRng(seed);
  const schema = example.inputSchema;
  let current = randomIndividual(rng, schema);
  let currentCost = evaluate(example, current).cost;
  const history = [{ evaluation: 1, bestCost: currentCost, bestIndividual: current, covered: currentCost === 0 }];
  let evals = 1;
  while (evals < budget && currentCost > 0) {
    let bestNeighbour = null, bestNeighbourCost = currentCost;
    for (let d = 0; d < schema.length; d++) {
      for (const delta of [-1, 1]) {
        if (evals >= budget) break;
        const n = current.slice();
        n[d] = clamp(n[d] + delta, schema[d].min, schema[d].max);
        const cost = evaluate(example, n).cost;
        evals++;
        const entryBest = Math.min(currentCost, bestNeighbourCost, cost);
        history.push({ evaluation: evals, bestCost: entryBest,
          bestIndividual: cost < bestNeighbourCost ? n : (bestNeighbour || current),
          covered: entryBest === 0 });
        if (cost < bestNeighbourCost) { bestNeighbourCost = cost; bestNeighbour = n; }
      }
    }
    if (bestNeighbour && bestNeighbourCost < currentCost) {
      current = bestNeighbour; currentCost = bestNeighbourCost;
    } else {
      break;   // local optimum — no improving neighbour
    }
  }
  return { strategy: 'hillClimb', history, covered: currentCost === 0,
    bestIndividual: current, bestCost: currentCost, stuck: currentCost > 0 };
}

// Genetic algorithm — a population of input vectors evolved with tournament
// selection, one-point crossover, per-component mutation, and elitism.
export function geneticAlgorithm(example, { seed, budget, populationSize = 20 }) {
  const rng = makeRng(seed);
  const schema = example.inputSchema;
  const history = [];
  let evals = 0;
  let gen = 0;
  let bestCost = Infinity, bestIndividual = null;

  function score(ind) {
    const cost = evaluate(example, ind).cost;
    evals++;
    if (cost < bestCost) { bestCost = cost; bestIndividual = ind; }
    history.push({ evaluation: evals, generation: gen, individual: ind, cost, bestCost, bestIndividual, covered: bestCost === 0 });
    return cost;
  }
  function tournament(pop, costs) {
    const a = Math.floor(rng() * pop.length);
    const b = Math.floor(rng() * pop.length);
    return costs[a] <= costs[b] ? pop[a] : pop[b];
  }
  function crossover(p1, p2) {
    if (schema.length === 1) return p1.slice();
    const cut = 1 + Math.floor(rng() * (schema.length - 1));
    return p1.slice(0, cut).concat(p2.slice(cut));
  }
  function mutate(ind) {
    return ind.map((v, d) => {
      if (rng() < 1 / schema.length) {
        const span = Math.max(1, Math.round((schema[d].max - schema[d].min) * 0.1));
        return clamp(v + rngInt(rng, -span, span), schema[d].min, schema[d].max);
      }
      return v;
    });
  }

  let population = Array.from({ length: populationSize }, () => randomIndividual(rng, schema));
  let costs = [];                                   // generation 0 — budget-capped
  for (const ind of population) {
    if (evals >= budget) break;
    costs.push(score(ind));
  }
  while (evals < budget && bestCost > 0) {
    gen++;
    const eliteIdx = costs.indexOf(Math.min(...costs));
    const next = [population[eliteIdx]];   // elitism — carry the best forward
    while (next.length < populationSize) {
      const child = mutate(crossover(tournament(population, costs), tournament(population, costs)));
      next.push(child);
    }
    population = next;
    const nextCosts = [costs[eliteIdx]];   // elite cost carried forward — no re-evaluation
    for (let k = 1; k < population.length; k++) {
      if (evals >= budget) break;
      nextCosts.push(score(population[k]));
    }
    costs = nextCosts;
    if (bestCost === 0) break;
  }
  return { strategy: 'genetic', history, covered: bestCost === 0, bestIndividual, bestCost };
}

// ── Whole-suite search ──────────────────────────────────────────────────────
// Every branch's two outcomes are coverage goals. A suite's cost is the sum,
// over all goals, of the best cost any test achieves toward that goal.
function coverageGoals(example) {
  const goals = [];
  for (const b of example.branches) {
    goals.push({ branchId: b.id, outcome: true });
    goals.push({ branchId: b.id, outcome: false });
  }
  return goals;
}

// Cost of one test toward one goal: 0 if the test takes that branch outcome,
// else approachLevel + normalised branch distance, using the same divergence
// walk as evaluate() but against an arbitrary goal.
function costForGoal(example, inputs, goal) {
  const events = trace(example, inputs);
  const branch = example.branches.find((b) => b.id === goal.branchId);
  const required = [...branch.requires, { branchId: goal.branchId, outcome: goal.outcome }];
  for (let i = 0; i < required.length; i++) {
    const req = required[i];
    const ev = events.find((e) => e.branchId === req.branchId);
    if (ev && ev.outcome === req.outcome) continue;
    const approachLevel = required.length - i - 1;
    let raw;
    if (ev) { raw = branchDistance(req.outcome ? ev.op : NEGATE[ev.op], ev.lhs, ev.rhs); }
    else { raw = Infinity; }
    return approachLevel + (raw === Infinity ? 1 : normalize(raw));
  }
  return 0;
}

export function suiteFitness(example, suite) {
  const goals = coverageGoals(example);
  let cost = 0, covered = 0;
  for (const goal of goals) {
    let best = Infinity;
    for (const test of suite) best = Math.min(best, costForGoal(example, test, goal));
    cost += best;
    if (best === 0) covered++;
  }
  return { cost, coverage: covered / goals.length, goals: goals.length, covered };
}

// Drop tests that do not change the set of covered goals.
function minimiseSuite(example, suite) {
  const goals = coverageGoals(example);
  const covers = (s) => goals.filter((g) => s.some((t) => costForGoal(example, t, g) === 0)).length;
  const full = covers(suite);
  const kept = suite.slice();
  for (let i = kept.length - 1; i >= 0; i--) {
    const without = kept.slice(0, i).concat(kept.slice(i + 1));
    if (covers(without) === full) kept.splice(i, 1);
  }
  return kept;
}

// Genetic algorithm where each individual is a whole suite of `suiteSize` tests.
export function wholeSuiteGA(example, { seed, budget, populationSize = 16, suiteSize = 4 }) {
  const rng = makeRng(seed);
  const schema = example.inputSchema;
  const history = [];
  let evals = 0;
  let gen = 0;
  let bestCost = Infinity, bestSuite = null, bestCoverage = 0;

  const randomTest = () => schema.map((s) => rngInt(rng, s.min, s.max));
  const randomSuite = () => Array.from({ length: suiteSize }, randomTest);
  function score(suite) {
    const f = suiteFitness(example, suite);
    evals++;
    if (f.cost < bestCost) { bestCost = f.cost; bestSuite = suite; bestCoverage = f.coverage; }
    history.push({ evaluation: evals, generation: gen, bestCost, coverage: bestCoverage, bestSuite });
    return f.cost;
  }
  function tournament(pop, costs) {
    const a = Math.floor(rng() * pop.length);
    const b = Math.floor(rng() * pop.length);
    return costs[a] <= costs[b] ? pop[a] : pop[b];
  }
  function crossover(s1, s2) {
    const cut = 1 + Math.floor(rng() * (suiteSize - 1));
    return s1.slice(0, cut).concat(s2.slice(cut));
  }
  function mutate(suite) {
    return suite.map((test) => (rng() < 1 / suiteSize ? randomTest() : test));
  }

  let population = Array.from({ length: populationSize }, randomSuite);
  let costs = population.map(score);                // generation 0
  while (evals < budget && bestCost > 0) {
    gen++;
    const eliteIdx = costs.indexOf(Math.min(...costs));
    const next = [population[eliteIdx]];
    while (next.length < populationSize) {
      next.push(mutate(crossover(tournament(population, costs), tournament(population, costs))));
    }
    population = next;
    costs = [costs[eliteIdx], ...population.slice(1).map(score)];
    if (bestCost === 0) break;
  }
  return {
    strategy: 'wholeSuite', history, bestSuite, bestCost, coverage: bestCoverage,
    minimisedSuite: minimiseSuite(example, bestSuite),
  };
}
