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
