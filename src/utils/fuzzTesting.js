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

/**
 * Execute fuzz testing on the given source code.
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

    for (let i = 0; i < maxTests; i++) {
      const input = {};
      const args = [];

      for (let j = 0; j < parsed.paramNames.length; j++) {
        const value = generateRandomValue(j);
        input[parsed.paramNames[j]] = value;
        args.push(value);
      }

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

      if (!crashed) {
        passedTests++;
      }

      testCases.push({
        id: `fuzz-${i}`,
        input,
        output,
        error,
        crashed,
        duration,
        branches,
      });
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
