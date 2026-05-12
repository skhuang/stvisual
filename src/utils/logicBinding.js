// Clause Binding — map abstract logic-coverage clauses to concrete program
// expressions, then solve a witness for each test row.
//
// Solving strategy (two phases):
//   1. Analytic interval solver — parses expressions of the form "VAR OP k"
//      (where OP ∈ {>, >=, <, <=, ===, ==, !==, !=} and k is a number literal).
//      Computes the exact integer interval per variable, picks the integer with
//      the smallest absolute value.  Works for any range, returns instantly.
//   2. Brute-force fallback — for expressions the analytic solver cannot handle
//      (multi-variable comparisons, arithmetic, method calls, etc.).  Iterates
//      the Cartesian product of [min, max] in smallest-absolute-value order.

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

// ---- Analytic interval solver ----

// Regex for a simple single-variable comparison: "VAR OP NUMBER" or "NUMBER OP VAR"
const SIMPLE_RE_LHS = /^([A-Za-z_$][A-Za-z0-9_$]*)\s*(===|!==|==|!=|>=|<=|>|<)\s*(-?\d+(?:\.\d*)?)$/;
const SIMPLE_RE_RHS = /^(-?\d+(?:\.\d*)?)\s*(===|!==|==|!=|>=|<=|>|<)\s*([A-Za-z_$][A-Za-z0-9_$]*)$/;

const FLIP_OP = { '>': '<', '>=': '<=', '<': '>', '<=': '>=', '===': '===', '!==': '!==', '==': '==', '!=': '!=' };
const NEG_OP  = { '>': '<=', '>=': '<', '<': '>=', '<=': '>', '===': '!==', '!==': '===', '==': '!=', '!=': '==' };

function parseSimpleConstraint(expr) {
  const s = expr.trim();
  const m1 = s.match(SIMPLE_RE_LHS);
  if (m1) return { varName: m1[1], op: m1[2], val: Number(m1[3]) };
  const m2 = s.match(SIMPLE_RE_RHS);
  if (m2) return { varName: m2[3], op: FLIP_OP[m2[2]], val: Number(m2[1]) };
  return null;
}

// An interval is { lo, loOpen, hi, hiOpen, neq: Set<number> }.
// lo=-Infinity / hi=+Infinity means unbounded.
function mkInterval(op, val) {
  switch (op) {
    case '===': case '==':  return { lo: val,       loOpen: false, hi: val,       hiOpen: false, neq: new Set() };
    case '!==': case '!=':  return { lo: -Infinity,  loOpen: true,  hi: Infinity,  hiOpen: true,  neq: new Set([val]) };
    case '>':               return { lo: val,        loOpen: true,  hi: Infinity,  hiOpen: true,  neq: new Set() };
    case '>=':              return { lo: val,        loOpen: false, hi: Infinity,  hiOpen: true,  neq: new Set() };
    case '<':               return { lo: -Infinity,  loOpen: true,  hi: val,       hiOpen: true,  neq: new Set() };
    case '<=':              return { lo: -Infinity,  loOpen: true,  hi: val,       hiOpen: false, neq: new Set() };
    default:                return null;
  }
}

function intersectIntervals(a, b) {
  let lo, loOpen, hi, hiOpen;
  if (a.lo === b.lo) {
    lo = a.lo; loOpen = a.loOpen || b.loOpen;
  } else if (a.lo > b.lo) {
    lo = a.lo; loOpen = a.loOpen;
  } else {
    lo = b.lo; loOpen = b.loOpen;
  }
  if (a.hi === b.hi) {
    hi = a.hi; hiOpen = a.hiOpen || b.hiOpen;
  } else if (a.hi < b.hi) {
    hi = a.hi; hiOpen = a.hiOpen;
  } else {
    hi = b.hi; hiOpen = b.hiOpen;
  }
  const neq = new Set([...a.neq, ...b.neq]);
  return { lo, loOpen, hi, hiOpen, neq };
}

function pickSmallestInInterval(interval) {
  const { lo, loOpen, hi, hiOpen, neq } = interval;
  const loInt = isFinite(lo) ? (loOpen ? Math.floor(lo) + 1 : Math.ceil(lo)) : -Infinity;
  const hiInt = isFinite(hi) ? (hiOpen ? Math.ceil(hi) - 1 : Math.floor(hi)) : Infinity;
  if (loInt > hiInt) return null;

  const absMax = Math.max(
    isFinite(loInt) ? Math.abs(loInt) : 1000,
    isFinite(hiInt) ? Math.abs(hiInt) : 1000,
  );
  for (let d = 0; d <= absMax + 1; d++) {
    for (const v of d === 0 ? [0] : [d, -d]) {
      if (v < loInt || v > hiInt) continue;
      if (neq.has(v)) continue;
      return v;
    }
  }
  return null;
}

function solveAnalytic(clauseValues, bindings, varNames) {
  const intervals = {};
  for (const v of varNames) {
    intervals[v] = { lo: -Infinity, loOpen: true, hi: Infinity, hiOpen: true, neq: new Set() };
  }

  for (const [clause, clauseIsTrue] of Object.entries(clauseValues)) {
    const expr = bindings[clause]?.trim();
    if (!expr) continue;
    const parsed = parseSimpleConstraint(expr);
    if (!parsed) return null; // can't solve analytically — fall back
    if (!intervals[parsed.varName]) return null; // variable not in our set

    const op = clauseIsTrue ? parsed.op : NEG_OP[parsed.op];
    const iv = mkInterval(op, parsed.val);
    if (!iv) return null;
    intervals[parsed.varName] = intersectIntervals(intervals[parsed.varName], iv);
  }

  const witness = {};
  for (const [varName, iv] of Object.entries(intervals)) {
    const v = pickSmallestInInterval(iv);
    if (v === null) return { error: 'infeasible' };
    witness[varName] = v;
  }
  return { witness };
}

// ---- Brute-force fallback ----

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

function* smallAbsFirst(min, max) {
  const limit = Math.max(Math.abs(min), Math.abs(max));
  for (let d = 0; d <= limit; d++) {
    if (d >= min && d <= max) yield d;
    if (d > 0 && -d >= min && -d <= max) yield -d;
  }
}

function* cartesian(vars, range) {
  function* gen(depth, current) {
    if (depth === vars.length) { yield [...current]; return; }
    for (const v of smallAbsFirst(range[0], range[1])) {
      current.push(v);
      yield* gen(depth + 1, current);
      current.pop();
    }
  }
  yield* gen(0, []);
}

// ---- Main export ----
//
// clauseValues: { a: true, b: false, ... }
// bindings:     { a: 'x > 0', b: 'y < 10', ... }
// searchRange:  [min, max]  defaults to [-10, 10] (only used for brute-force fallback)
//
// Returns { witness: {x: 1, y: 11, ...}, analytic: true|false }
//      or { error: 'infeasible' | 'no-vars' | 'bad-expr' | '<message>' }
export function solveBinding({ clauseValues, bindings, searchRange = [-10, 10] }) {
  const varNames = extractVarsFromBindings(bindings);
  if (!varNames.length) return { error: 'no-vars' };

  // Phase 1: analytic interval solver (exact, unlimited range).
  const analyticResult = solveAnalytic(clauseValues, bindings, varNames);
  if (analyticResult !== null) {
    // analyticResult is either { witness } or { error: 'infeasible' }
    return analyticResult.error ? analyticResult : { ...analyticResult, analytic: true };
  }

  // Phase 2: brute-force fallback for complex expressions.
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
      return { witness, analytic: false };
    }
  }
  return { error: 'infeasible' };
}

// Pretty-print a witness as "x=1, y=11, z=0".
export function formatWitnessStr(witness) {
  return Object.entries(witness).map(([k, v]) => `${k}=${v}`).join(', ');
}

// Build a human-readable constraint string for one test row.
export function buildConstraintStr(clauseValues, bindings) {
  const parts = [];
  for (const [clause, val] of Object.entries(clauseValues)) {
    const expr = bindings[clause]?.trim();
    if (!expr) continue;
    parts.push(val ? `(${expr})` : `!(${expr})`);
  }
  return parts.join(' && ') || '—';
}

// Validate a single binding expression. Returns null if valid, or an error string.
export function validateBindingExpr(expr) {
  if (!expr || !expr.trim()) return null;
  try {
    new Function('__x__', `'use strict'; return (${expr.trim()});`);
    return null;
  } catch (e) {
    return e.message || 'Invalid expression';
  }
}
