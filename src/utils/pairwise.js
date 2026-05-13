/**
 * IPO (In-Parameter-Order) greedy pairwise test generation.
 * Produces a minimal set of test cases where every pair of
 * (param_i value, param_j value) appears in at least one test.
 */

function pairKey(pi, vi, pj, vj) {
  return pi <= pj
    ? `${pi}\x00${vi}\x00${pj}\x00${vj}`
    : `${pj}\x00${vj}\x00${pi}\x00${vi}`;
}

export function generatePairwise(params) {
  const valid = params.filter((p) => p.name.trim() && p.values.length >= 1);
  if (valid.length < 2) return [];

  // Collect all required pairs
  const uncovered = new Set();
  for (let i = 0; i < valid.length - 1; i++) {
    for (let j = i + 1; j < valid.length; j++) {
      for (const vi of valid[i].values) {
        for (const vj of valid[j].values) {
          uncovered.add(pairKey(i, vi, j, vj));
        }
      }
    }
  }

  // tests[t] = array of length valid.length, null = unassigned
  const tests = [];

  // Seed: full cross-product of first two parameters
  for (const v0 of valid[0].values) {
    for (const v1 of valid[1].values) {
      const row = new Array(valid.length).fill(null);
      row[0] = v0;
      row[1] = v1;
      tests.push(row);
      uncovered.delete(pairKey(0, v0, 1, v1));
    }
  }

  for (let k = 2; k < valid.length; k++) {
    const pk = valid[k];

    // Horizontal growth: extend each existing test with best value for param k
    for (const row of tests) {
      let bestVal = pk.values[0];
      let bestCount = -1;
      for (const vk of pk.values) {
        let count = 0;
        for (let i = 0; i < k; i++) {
          if (row[i] !== null && uncovered.has(pairKey(i, row[i], k, vk))) count++;
        }
        if (count > bestCount) { bestCount = count; bestVal = vk; }
      }
      row[k] = bestVal;
      for (let i = 0; i < k; i++) {
        if (row[i] !== null) uncovered.delete(pairKey(i, row[i], k, bestVal));
      }
    }

    // Vertical growth: new rows for remaining uncovered pairs involving column k
    let guard = 0;
    while (guard++ < 1000) {
      let target = null;
      for (const key of uncovered) {
        const parts = key.split('\x00');
        if (parseInt(parts[0]) === k || parseInt(parts[2]) === k) { target = key; break; }
      }
      if (!target) break;

      const row = new Array(valid.length).fill(null);
      const parts = target.split('\x00');
      row[parseInt(parts[0])] = parts[1];
      row[parseInt(parts[2])] = parts[3];

      // Greedily fill remaining positions 0..k
      for (let m = 0; m <= k; m++) {
        if (row[m] !== null) continue;
        let bestVal = valid[m].values[0];
        let bestCount = -1;
        for (const vm of valid[m].values) {
          let count = 0;
          for (let n = 0; n <= k; n++) {
            if (n !== m && row[n] !== null && uncovered.has(pairKey(m, vm, n, row[n]))) count++;
          }
          if (count > bestCount) { bestCount = count; bestVal = vm; }
        }
        row[m] = bestVal;
      }

      tests.push(row);
      for (let i = 0; i <= k; i++) {
        for (let j = i + 1; j <= k; j++) {
          if (row[i] !== null && row[j] !== null) uncovered.delete(pairKey(i, row[i], j, row[j]));
        }
      }
    }
  }

  return tests.map((row) => {
    const obj = {};
    valid.forEach((p, i) => { obj[p.name] = row[i] ?? p.values[0]; });
    return obj;
  });
}

export function exhaustiveCount(params) {
  const valid = params.filter((p) => p.name.trim() && p.values.length >= 1);
  return valid.reduce((acc, p) => acc * p.values.length, 1);
}

export function totalPairCount(params) {
  const valid = params.filter((p) => p.name.trim() && p.values.length >= 1);
  let total = 0;
  for (let i = 0; i < valid.length - 1; i++) {
    for (let j = i + 1; j < valid.length; j++) {
      total += valid[i].values.length * valid[j].values.length;
    }
  }
  return total;
}
