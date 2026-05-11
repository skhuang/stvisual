// Clause Binding — map abstract logic-coverage clauses to concrete program
// expressions, then brute-force a witness for each test row.
//
// Example:
//   predicate : (a && b) || c
//   bindings  : { a: 'x > 0', b: 'y < 10', c: 'z === 0' }
//   test row  : { a: true, b: false, c: true }
//   → need: x > 0 && !(y < 10) && z === 0
//   → search integers → witness: { x: 1, y: 10, z: 0 }

const JS_KEYWORDS = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
  'default', 'delete', 'do', 'else', 'export', 'extends', 'false', 'finally',
  'for', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'null',
  'return', 'static', 'super', 'switch', 'this', 'throw', 'true', 'try',
  'typeof', 'undefined', 'var', 'void', 'while', 'with', 'yield',
  'Math', 'Number', 'parseInt', 'parseFloat', 'Infinity', 'NaN',
]);

const IDENT_RE = /\b([A-Za-z_$][A-Za-z0-9_$]*)\b/g;

// Returns unique program variable names appearing in binding expressions.
// Excludes JS keywords, built-ins, and the clause names themselves.
export function extractVarsFromBindings(bindings) {
  const clauseNames = new Set(Object.keys(bindings));
  const vars = new Set();
  for (const expr of Object.values(bindings)) {
    if (!expr || !expr.trim()) continue;
    for (const [, name] of (expr.matchAll ? expr.matchAll(IDENT_RE) : [])) {
      if (!JS_KEYWORDS.has(name) && !clauseNames.has(name)) {
        vars.add(name);
      }
    }
  }
  return [...vars].sort();
}

// Build a JS checker function for one test row.
// clauseValues: { a: true, b: false, c: true }
// bindings:     { a: 'x > 0', b: 'y < 10', c: 'z === 0' }
// varNames: ['x', 'y', 'z']
// Returns a function (...values) => boolean, or null if any expression is empty/invalid.
function buildChecker(clauseValues, bindings, varNames) {
  const parts = [];
  for (const [clause, val] of Object.entries(clauseValues)) {
    const expr = bindings[clause]?.trim();
    if (!expr) return null;
    parts.push(val ? `(${expr})` : `!(${expr})`);
  }
  if (!parts.length) return null;
  try {
    return new Function(...varNames, `'use strict'; return ${parts.join(' && ')};`);
  } catch {
    return null;
  }
}

// Yields integers in [min, max] ordered by ascending absolute value:
// 0, 1, -1, 2, -2, … so witnesses prefer small, readable numbers.
function* smallAbsFirst(min, max) {
  const limit = Math.max(Math.abs(min), Math.abs(max));
  for (let d = 0; d <= limit; d++) {
    if (d >= min && d <= max) yield d;
    if (d > 0 && -d >= min && -d <= max) yield -d;
  }
}

// Cartesian product over integer range, smallest-abs-value first.
function* cartesian(vars, range) {
  function* gen(depth, current) {
    if (depth === vars.length) {
      yield [...current];
      return;
    }
    for (const v of smallAbsFirst(range[0], range[1])) {
      current.push(v);
      yield* gen(depth + 1, current);
      current.pop();
    }
  }
  yield* gen(0, []);
}

// Main export.
// clauseValues: { a: true, b: false, ... }
// bindings:     { a: 'x > 0', b: 'y < 10', ... }
// searchRange:  [min, max]  defaults to [-10, 10]
// Returns { witness: {x: 1, y: 11, ...} } or { error: 'infeasible' | '<message>' }
export function solveBinding({ clauseValues, bindings, searchRange = [-10, 10] }) {
  const varNames = extractVarsFromBindings(bindings);
  if (!varNames.length) return { error: 'no-vars' };

  let checker;
  try {
    checker = buildChecker(clauseValues, bindings, varNames);
  } catch (e) {
    return { error: String(e.message || e) };
  }
  if (!checker) return { error: 'bad-expr' };

  for (const combo of cartesian(varNames, searchRange)) {
    let result;
    try {
      result = checker(...combo);
    } catch {
      continue;
    }
    if (result) {
      const witness = {};
      varNames.forEach((v, i) => { witness[v] = combo[i]; });
      return { witness };
    }
  }
  return { error: 'infeasible' };
}

// Pretty-print a witness as "x=1, y=11, z=0".
export function formatWitnessStr(witness) {
  return Object.entries(witness).map(([k, v]) => `${k}=${v}`).join(', ');
}

// Build a human-readable constraint string for one test row.
// clauseValues: { a: true, b: false, c: true }
// bindings:     { a: 'x > 0', b: 'y < 10', c: 'z === 0' }
// → '(x > 0) && !(y < 10) && (z === 0)'
export function buildConstraintStr(clauseValues, bindings) {
  const parts = [];
  for (const [clause, val] of Object.entries(clauseValues)) {
    const expr = bindings[clause]?.trim();
    if (!expr) continue;
    parts.push(val ? `(${expr})` : `!(${expr})`);
  }
  return parts.join(' && ') || '—';
}

// Validate a single binding expression for a given clause.
// Returns null if valid, or an error string.
export function validateBindingExpr(expr) {
  if (!expr || !expr.trim()) return null;
  try {
    new Function('__x__', `'use strict'; return (${expr.trim()});`);
    return null;
  } catch (e) {
    return e.message || 'Invalid expression';
  }
}
