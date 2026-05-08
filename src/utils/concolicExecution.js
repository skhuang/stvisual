// Concolic execution (DART/CUTE-style dynamic symbolic execution).
//
// Workflow (per iteration):
//   1. Run the program *concretely* with the current input.
//   2. Along the way, also record the *symbolic* condition at every
//      branch (substituting symbolic expressions for the original
//      parameters into the live environment) and the direction the
//      concrete run took.
//   3. After the run completes, walk the recorded trace prefix-by-prefix:
//      for each branch i, build a candidate path constraint
//        c_0 ∧ c_1 ∧ … ∧ c_{i-1} ∧ ¬c_i
//      and ask the brute-force solver (`findWitness` from
//      `symbolicExecution.js`) for a fresh input that exercises it.
//      Each unseen new input is appended to the worklist.
//   4. Repeat with the next worklist input until no new path appears or
//      `maxIterations` is reached.
//
// The result is an ordered list of iterations, each with the concrete
// input, the executed branches (line + symbolic condition), the path
// condition, the return value, and (for the branch that produced the
// next iteration) the negated suffix and the resulting new input.

import {
  parseProgram,
  evalExpr,
  substitute,
  negate,
  findWitness,
  exprToString,
} from './symbolicExecution.js';

const DEFAULT_OPTIONS = {
  maxIterations: 16,
  searchDomain: { min: -5, max: 12 },
};

// Run the program concretely with `concreteInputs` while also recording
// the symbolic branch trace.
//
// Returns: {
//   branches: [{ id, condition, taken, line, column }],
//   returnValue, returnExpression,
// }
function runConcolicOnce(fn, concreteInputs) {
  // Concrete environment: parameter → value.
  const concreteEnv = {};
  // Symbolic environment: variable → AST expression in terms of original params.
  const symbolicEnv = {};
  for (const p of fn.params) {
    concreteEnv[p] = concreteInputs[p];
    symbolicEnv[p] = { kind: 'var', name: p };
  }

  const branches = [];
  let returnValue = null;
  let returnExpression = null;

  // We model statements as a JS-like flat block list with explicit
  // recursion for nested blocks, mirroring the symbolic walker.
  const HALT = Symbol('HALT');

  function execStatements(stmts) {
    for (const s of stmts) {
      const r = execOne(s);
      if (r === HALT) return HALT;
    }
    return null;
  }

  function execOne(stmt) {
    if (stmt.kind === 'block') return execStatements(stmt.statements);
    if (stmt.kind === 'let' || stmt.kind === 'assign') {
      concreteEnv[stmt.target] = evalExpr(stmt.value, concreteEnv);
      symbolicEnv[stmt.target] = substitute(stmt.value, symbolicEnv);
      return null;
    }
    if (stmt.kind === 'return') {
      if (stmt.argument) {
        returnValue = evalExpr(stmt.argument, concreteEnv);
        returnExpression = exprToString(substitute(stmt.argument, symbolicEnv));
      } else {
        returnValue = null;
        returnExpression = null;
      }
      return HALT;
    }
    if (stmt.kind === 'if') {
      const concrete = evalExpr(stmt.test, concreteEnv);
      const symbolic = substitute(stmt.test, symbolicEnv);
      branches.push({
        condition: exprToString(symbolic),
        symbolic,
        taken: Boolean(concrete),
      });
      if (concrete) return execOne(stmt.consequent);
      if (stmt.alternate) return execOne(stmt.alternate);
      return null;
    }
    if (stmt.kind === 'while') {
      // Concolic execution naturally bounds the loop because we follow
      // the concrete run. We still record one branch per guard test.
      // Guard against runaway loops with a hard ceiling.
      let safety = 256;
      while (safety > 0) {
        safety -= 1;
        const concrete = evalExpr(stmt.test, concreteEnv);
        const symbolic = substitute(stmt.test, symbolicEnv);
        branches.push({
          condition: exprToString(symbolic),
          symbolic,
          taken: Boolean(concrete),
          loop: true,
        });
        if (!concrete) return null;
        const r = execOne(stmt.body);
        if (r === HALT) return HALT;
      }
      throw new Error('Loop iteration limit exceeded (256).');
    }
    return null;
  }

  execStatements(fn.body.statements);

  return { branches, returnValue, returnExpression };
}

// Canonical key for a path: the sequence of taken booleans, joined.
function pathKey(branches) {
  return branches.map((b) => (b.taken ? 'T' : 'F')).join('');
}

function inputKey(inputs, params) {
  return params.map((p) => `${p}=${inputs[p]}`).join(',');
}

export function concolicExecute(programSource, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const fn = parseProgram(programSource);
  const params = fn.params.slice();

  // Initial concrete inputs: caller-provided, else all-zero.
  const seed = {};
  for (const p of params) {
    seed[p] = options.initialInputs?.[p] != null ? options.initialInputs[p] : 0;
  }

  const worklist = [seed];
  const seenInputs = new Set([inputKey(seed, params)]);
  const seenPaths = new Set();
  const iterations = [];
  let truncated = false;

  while (worklist.length > 0) {
    if (iterations.length >= opts.maxIterations) {
      truncated = true;
      break;
    }
    const inputs = worklist.shift();
    let trace;
    try {
      trace = runConcolicOnce(fn, inputs);
    } catch (err) {
      iterations.push({
        id: `iter-${iterations.length}`,
        inputs,
        branches: [],
        pathCondition: [],
        pathKey: '',
        returnValue: null,
        returnExpression: null,
        runtimeError: err.message || String(err),
        nextInput: null,
        negatedAt: null,
      });
      continue;
    }
    const branches = trace.branches;
    const pkey = pathKey(branches);
    seenPaths.add(pkey);

    // Try to derive a new input by negating the last unexplored branch.
    let nextInput = null;
    let negatedAt = null;
    let negatedNewKey = null;

    for (let i = branches.length - 1; i >= 0; i -= 1) {
      // Build prefix path constraint: c_0 ∧ … ∧ c_{i-1} ∧ ¬c_i.
      const constraint = [];
      for (let j = 0; j < i; j += 1) {
        const b = branches[j];
        constraint.push(b.taken ? b.symbolic : negate(b.symbolic));
      }
      const flipped = branches[i];
      constraint.push(flipped.taken ? negate(flipped.symbolic) : flipped.symbolic);
      const candidatePathKey = `${pkey.slice(0, i)}${flipped.taken ? 'F' : 'T'}`;
      if (seenPaths.has(candidatePathKey)) continue;

      const witness = findWitness(constraint, params, opts.searchDomain);
      if (!witness) continue;
      const wkey = inputKey(witness, params);
      if (seenInputs.has(wkey)) continue;
      seenInputs.add(wkey);
      nextInput = witness;
      negatedAt = i;
      negatedNewKey = candidatePathKey;
      break;
    }

    iterations.push({
      id: `iter-${iterations.length}`,
      inputs: { ...inputs },
      branches: branches.map((b, idx) => ({
        index: idx,
        condition: b.condition,
        taken: b.taken,
        loop: Boolean(b.loop),
        negated: idx === negatedAt,
      })),
      pathCondition: branches.map((b) => (b.taken ? b.condition : `!(${b.condition})`)),
      pathKey: pkey,
      returnValue: trace.returnValue,
      returnExpression: trace.returnExpression,
      runtimeError: null,
      nextInput,
      negatedAt,
      negatedNewKey,
    });

    if (nextInput) worklist.push(nextInput);
  }

  return {
    function: { name: fn.name, params },
    iterations,
    truncated,
    uniquePathCount: seenPaths.size,
    uniqueInputCount: seenInputs.size,
  };
}
