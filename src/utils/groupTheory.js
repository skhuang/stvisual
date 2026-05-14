/**
 * Group Theory utilities for Boolean formula testing.
 *
 * Automorphism groups of Boolean formulas, orbit partitioning,
 * CACC determination pair analysis, and covering array generation.
 *
 * Formula syntax identical to causeEffect.js: atoms, AND, OR, NOT, parentheses.
 * Feasible for |vars| ≤ 6 (at most 6! = 720 permutations checked).
 */

import { evaluateFormula, getUsedCauses } from './causeEffect.js';

// ── Internal helpers ──────────────────────────────────────────────────────────

function allAssignments(vars) {
  const n = vars.length;
  const rows = [];
  for (let mask = 0; mask < (1 << n); mask++) {
    const env = {};
    for (let i = 0; i < n; i++) env[vars[i]] = !!(mask & (1 << (n - 1 - i)));
    rows.push(env);
  }
  return rows;
}

function permutationsOf(arr) {
  if (arr.length <= 1) return [arr.slice()];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutationsOf(rest)) result.push([arr[i], ...p]);
  }
  return result;
}

// permVars[i] = the original variable whose value now fills position i
function applyPerm(env, vars, permVars) {
  const out = {};
  for (let i = 0; i < vars.length; i++) out[vars[i]] = env[permVars[i]];
  return out;
}

function envToMask(env, vars) {
  let mask = 0;
  const n = vars.length;
  for (let i = 0; i < n; i++) if (env[vars[i]]) mask |= (1 << (n - 1 - i));
  return mask;
}

function maskForPerm(mask, vars, perm) {
  const n = vars.length;
  const env = {};
  for (let i = 0; i < n; i++) env[vars[i]] = !!(mask & (1 << (n - 1 - i)));
  return envToMask(applyPerm(env, vars, perm), vars);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Extract ordered variable names from a Boolean formula.
 * Returns { vars: string[], valid: boolean }
 */
export function parseDNF(formula) {
  const used = getUsedCauses(formula.trim());
  const vars = [...used.keys()];
  const testEnv = Object.fromEntries(vars.map(v => [v, false]));
  const valid = vars.length > 0 && evaluateFormula(formula, testEnv) !== null;
  return { vars, valid };
}

/**
 * Compute the automorphism group of a Boolean formula:
 * all variable permutations that preserve the truth table.
 * Returns array of permuted-vars arrays, e.g. ['B','A','C'] means A↔B swapped.
 */
export function computeAutGroup(vars, formula) {
  if (!vars.length) return [];
  const rows = allAssignments(vars);
  const truth = rows.map(env => evaluateFormula(formula, env));
  return permutationsOf(vars).filter(perm => {
    for (let i = 0; i < rows.length; i++) {
      if (evaluateFormula(formula, applyPerm(rows[i], vars, perm)) !== truth[i])
        return false;
    }
    return true;
  });
}

/**
 * Partition 2^n truth-table rows into orbits under autGroup.
 * Returns Map<reprMask, number[]> — repr is the smallest mask in each orbit.
 */
export function orbitPartition(vars, autGroup) {
  const total = 1 << vars.length;
  const orbitOf = new Array(total).fill(-1);
  for (let start = 0; start < total; start++) {
    if (orbitOf[start] !== -1) continue;
    const visited = new Set([start]);
    const queue = [start];
    while (queue.length) {
      const cur = queue.shift();
      for (const perm of autGroup) {
        const img = maskForPerm(cur, vars, perm);
        if (!visited.has(img)) { visited.add(img); queue.push(img); }
      }
    }
    const repr = Math.min(...visited);
    for (const m of visited) orbitOf[m] = repr;
  }
  const orbits = new Map();
  for (let m = 0; m < total; m++) {
    const r = orbitOf[m];
    if (!orbits.has(r)) orbits.set(r, []);
    orbits.get(r).push(m);
  }
  return orbits;
}

/**
 * For each variable, compute CACC determination pairs (pairs where only that
 * variable differs and the predicate outcome changes).  A pair is marked
 * `derived: true` if an earlier-processed pair already covers it via an
 * autGroup symmetry — meaning no extra test is needed.
 *
 * Returns { varName, pairs: [{ row1, row2, derived }] }[]
 */
export function determinationPairs(vars, formula, autGroup) {
  const n = vars.length;
  const total = 1 << n;
  const truth = allAssignments(vars).map(env => evaluateFormula(formula, env));
  const canonical = new Set();

  return vars.map((v, vi) => {
    const bit = 1 << (n - 1 - vi);
    const rawPairs = [];
    for (let m = 0; m < total; m++) {
      const m2 = m ^ bit;
      if (m2 <= m) continue;
      if (truth[m] !== truth[m2]) rawPairs.push([m, m2]);
    }
    return {
      varName: v,
      pairs: rawPairs.map(([r1, r2]) => {
        const key = `${r1},${r2}`;
        if (canonical.has(key)) return { row1: r1, row2: r2, derived: true };
        for (const perm of autGroup) {
          const ir1 = maskForPerm(r1, vars, perm);
          const ir2 = maskForPerm(r2, vars, perm);
          canonical.add(`${Math.min(ir1, ir2)},${Math.max(ir1, ir2)}`);
        }
        return { row1: r1, row2: r2, derived: false };
      }),
    };
  });
}

/**
 * Generate an Orthogonal Array using GF(p), p prime.
 *   t=1 → p rows (trivial, any value works)
 *   t=2 → p² rows, k ≤ p+1 (standard GF(p) construction)
 * Returns string[][] — rows × columns.
 */
export function coveringArray(p, k, t) {
  if (t === 1) {
    return Array.from({ length: p }, (_, i) =>
      Array.from({ length: k }, () => String(i))
    );
  }
  const rows = [];
  for (let s = 0; s < p; s++) {
    for (let d = 0; d < p; d++) {
      const row = [];
      for (let j = 0; j < Math.min(k, p); j++) row.push(String((s + j * d) % p));
      if (k > p) row.push(String(d));
      rows.push(row);
    }
  }
  return rows;
}

/**
 * Express an orbit as a human-readable metamorphic relation string.
 * e.g. "f(A=F, B=T) = f(A=T, B=F)"
 */
export function mrFromOrbit(orbit, vars) {
  if (orbit.length <= 1) return 'f is constant on this orbit (trivial MR)';
  const n = vars.length;
  const fmt = mask =>
    'f(' + vars.map((v, i) => `${v}=${(mask >> (n - 1 - i)) & 1 ? 'T' : 'F'}`).join(', ') + ')';
  return orbit.map(fmt).join(' = ');
}
