/**
 * Fuzz Testing Engine
 *
 * Generates random test inputs and executes the target function,
 * capturing outputs, detecting crashes, and recording branch traces
 * for CFG coverage analysis.
 */

const MAX_TEST_CASES = 200;
const MAX_INT_VALUE = 100;
const MAX_LOOP_ITERATIONS = 10000;

/**
 * Instrument `if`/`while` conditions in a function body to record branch traces.
 * Each condition evaluation pushes `{ taken: boolean }` into a `__b__` array.
 * While loops get an iteration guard to prevent infinite loops.
 */
function instrumentBranches(body) {
  const result = [];
  let pos = 0;
  let loopId = 0;
  const re = /\b(if|while)\s*\(/g;
  let match;

  while ((match = re.exec(body)) !== null) {
    result.push(body.slice(pos, match.index));
    const keyword = match[1];
    const condStart = match.index + match[0].length;

    // Find the matching closing paren by counting depth
    let depth = 1;
    let i = condStart;
    while (i < body.length && depth > 0) {
      if (body[i] === '(') depth++;
      else if (body[i] === ')') depth--;
      if (depth > 0) i++;
    }
    const cond = body.slice(condStart, i);

    if (keyword === 'while') {
      const guard = `__lc${loopId}__`;
      result.push(
        `var ${guard}=0; while ((++${guard}<=${MAX_LOOP_ITERATIONS})&&(__b__.push({taken: !!(${cond})}), __b__[__b__.length-1].taken))`
      );
      loopId++;
    } else {
      result.push(
        `${keyword} ((__b__.push({taken: !!(${cond})}), __b__[__b__.length-1].taken))`
      );
    }
    pos = i + 1; // skip past closing paren
    re.lastIndex = pos;
  }

  result.push(body.slice(pos));
  return result.join('');
}

/**
 * Parse function source code to extract parameters and body.
 * Creates an instrumented version that records branch decisions.
 */
function parseFunctionSignature(sourceCode) {
  const match = sourceCode.match(/function\s+\w*\s*\(([^)]*)\)\s*\{([\s\S]*)\}/);
  if (!match) {
    throw new Error('Invalid function signature. Expected: function name(params) { ... }');
  }

  const paramStr = match[1].trim();
  const paramNames = paramStr ? paramStr.split(/\s*,\s*/).map((p) => p.trim()) : [];
  const body = match[2];
  const instrumented = instrumentBranches(body);

  try {
    // __b__ is the branch-trace array, injected as the first parameter
    // eslint-disable-next-line no-new-func
    const func = new Function('__b__', ...paramNames, instrumented);
    return { paramNames, body, func };
  } catch (err) {
    throw new Error(`Failed to parse function: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Generate random value for a parameter.
 * Only integers and booleans — strings cause NaN-based infinite loops.
 */
function generateRandomValue(_index) {
  if (Math.random() < 0.7) {
    return Math.floor(Math.random() * (2 * MAX_INT_VALUE + 1)) - MAX_INT_VALUE;
  }
  return Math.random() < 0.5;
}

// Mutation strategies applied one-at-a-time to individual parameter values.
const MUTATIONS = [
  (v) => (typeof v === 'number' ? v + 1 : v),           // +1 nudge
  (v) => (typeof v === 'number' ? v - 1 : v),           // −1 nudge
  (v) => (typeof v === 'number' ? 0 : v),               // boundary: zero
  (v) => (typeof v === 'number' ? 1 : v),               // boundary: one
  (v) => (typeof v === 'number' ? -1 : v),              // boundary: minus-one
  (v) => (typeof v === 'number' ? MAX_INT_VALUE : v),   // boundary: max
  (v) => (typeof v === 'number' ? -MAX_INT_VALUE : v),  // boundary: min
  (v) => (typeof v === 'number' ? v ^ 1 : v),           // bitflip LSB
  (v) => (typeof v === 'boolean' ? !v : v),             // boolean flip
];

// Returns a mutated copy of an input object by applying one random mutation
// to one randomly-chosen parameter.
function mutateInput(input) {
  const keys = Object.keys(input);
  if (!keys.length) return { ...input };
  const key = keys[Math.floor(Math.random() * keys.length)];
  const mut = MUTATIONS[Math.floor(Math.random() * MUTATIONS.length)];
  return { ...input, [key]: mut(input[key]) };
}

// Serialise branch trace to a string for novelty detection.
function branchKey(branches) {
  return branches.map((b) => (b.taken ? '1' : '0')).join('');
}

/**
 * Execute fuzz testing on the given source code.
 * Phase 1 (first half of budget): pure random inputs.
 * Phase 2 (second half): mutation of interesting seeds (crashes + novel branch patterns).
 */
export function fuzzTest(sourceCode, maxTests = MAX_TEST_CASES) {
  const testCases = [];
  const uniqueErrors = new Map();
  let passedTests = 0;
  let failedTests = 0;
  let crashes = 0;
  let totalDuration = 0;

  try {
    const parsed = parseFunctionSignature(sourceCode);

    // Phase boundary: first half random, second half mutation.
    const seedBudget = Math.ceil(maxTests / 2);
    const mutBudget = maxTests - seedBudget;

    const seenBranchKeys = new Set();
    const interestingSeeds = []; // inputs worth mutating

    function runOne(input, isMutated) {
      const args = parsed.paramNames.map((p) => input[p]);
      let output = null;
      let error = null;
      let crashed = false;
      const branches = [];
      const startTime = performance.now();

      try {
        output = parsed.func(branches, ...args);
      } catch (err) {
        crashed = true;
        crashes++;
        error = err instanceof Error ? err.message : String(err);
        uniqueErrors.set(error, (uniqueErrors.get(error) ?? 0) + 1);
        failedTests++;
      }

      const duration = performance.now() - startTime;
      totalDuration += duration;
      if (!crashed) passedTests++;

      const idx = testCases.length;
      testCases.push({
        id: `fuzz-${idx}`,
        input,
        output,
        error,
        crashed,
        duration,
        branches,
        mutated: isMutated,
      });

      // Track novelty for seed selection.
      const bk = branchKey(branches);
      if (crashed || !seenBranchKeys.has(bk)) {
        seenBranchKeys.add(bk);
        interestingSeeds.push(input);
      }
    }

    // Phase 1: random seeds.
    for (let i = 0; i < seedBudget; i++) {
      const input = {};
      for (const p of parsed.paramNames) input[p] = generateRandomValue();
      runOne(input, false);
    }

    // Phase 2: mutate interesting seeds (or random if none yet).
    for (let i = 0; i < mutBudget; i++) {
      const pool = interestingSeeds.length ? interestingSeeds : testCases.map((tc) => tc.input);
      const seed = pool[Math.floor(Math.random() * pool.length)];
      runOne(mutateInput(seed), true);
    }
  } catch (err) {
    throw new Error(`Fuzz testing setup failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  return {
    totalTests: testCases.length,
    passedTests,
    failedTests,
    crashes,
    testCases,
    uniqueErrors,
    averageDuration: testCases.length > 0 ? totalDuration / testCases.length : 0,
    truncated: testCases.length >= maxTests,
  };
}

/**
 * Format a test case input for display.
 */
export function formatInput(input) {
  return Object.entries(input)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join(', ');
}

/**
 * Format output for display.
 */
export function formatOutput(output) {
  if (output === null || output === undefined) {
    return 'undefined';
  }
  if (typeof output === 'object') {
    try {
      return JSON.stringify(output);
    } catch {
      return String(output);
    }
  }
  return String(output);
}
