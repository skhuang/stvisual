/**
 * Property-Based Testing Engine (QuickCheck-style).
 *
 * Provides preset programs + properties, a random generator, and a
 * shrinking algorithm that finds minimal counterexamples.
 */

const MAX_SHRINK_STEPS = 500;

/* ── Generators ── */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function genIntArray(minLen, maxLen, min, max) {
  const len = randInt(minLen, maxLen);
  return Array.from({ length: len }, () => randInt(min, max));
}

/* ── Shrinkers ── */

function shrinkInt(n) {
  if (n === 0) return [];
  const s = [];
  s.push(0);
  if (Math.abs(n) > 1) s.push(n > 0 ? Math.floor(n / 2) : Math.ceil(n / 2));
  s.push(n > 0 ? n - 1 : n + 1);
  return [...new Set(s)].filter((v) => v !== n);
}

function shrinkIntArray(arr) {
  const candidates = [];
  // Drop each element
  for (let i = 0; i < arr.length; i++) {
    candidates.push([...arr.slice(0, i), ...arr.slice(i + 1)]);
  }
  // Shrink each element
  for (let i = 0; i < arr.length; i++) {
    for (const sv of shrinkInt(arr[i])) {
      const copy = [...arr];
      copy[i] = sv;
      candidates.push(copy);
    }
  }
  return candidates;
}

function shrinkPair(a, b) {
  const candidates = [];
  for (const sa of shrinkInt(a)) candidates.push([sa, b]);
  for (const sb of shrinkInt(b)) candidates.push([a, sb]);
  return candidates;
}

/* ── Preset definitions ── */

function makeMySort() {
  function mySort(arr) { return [...arr].sort((a, b) => a - b); }

  const properties = [
    {
      id: 'p0',
      label: 'Length preserved: sorted.length === arr.length',
      check: (arr) => { const s = mySort(arr); return s.length === arr.length; },
    },
    {
      id: 'p1',
      label: 'Output is sorted: sorted[i] ≤ sorted[i+1]',
      check: (arr) => { const s = mySort(arr); return s.every((v, i) => i === 0 || s[i - 1] <= v); },
    },
    {
      id: 'p2',
      label: 'Same elements: sum(sorted) === sum(arr)',
      check: (arr) => { const s = mySort(arr); return s.reduce((a, b) => a + b, 0) === arr.reduce((a, b) => a + b, 0); },
    },
  ];

  function generate() { return [genIntArray(0, 6, -20, 20)]; }
  function shrink(args) { return shrinkIntArray(args[0]).map((a) => [a]); }
  function format(args) { return `[${args[0].join(', ')}]`; }

  return {
    id: 'mySort', nameKey: 'pbt.preset.mysort',
    code: 'function mySort(arr) {\n  return [...arr].sort((a, b) => a - b);\n}',
    properties, generate, shrink, format,
    expectsCounterexample: false,
  };
}

function makeBuggyMax() {
  function buggyMax(a, b) {
    if (a === b) return a - 1; // deliberate bug
    return a > b ? a : b;
  }

  const properties = [
    {
      id: 'p0',
      label: 'result ≥ a',
      check: (a, b) => buggyMax(a, b) >= a,
    },
    {
      id: 'p1',
      label: 'result ≥ b',
      check: (a, b) => buggyMax(a, b) >= b,
    },
    {
      id: 'p2',
      label: 'result === a or result === b',
      check: (a, b) => { const r = buggyMax(a, b); return r === a || r === b; },
    },
  ];

  function generate() { return [randInt(-10, 10), randInt(-10, 10)]; }
  function shrink(args) { return shrinkPair(args[0], args[1]); }
  function format(args) { return `(a=${args[0]}, b=${args[1]})`; }

  return {
    id: 'buggyMax', nameKey: 'pbt.preset.buggymax',
    code: 'function buggyMax(a, b) {\n  if (a === b) return a - 1; // bug!\n  return a > b ? a : b;\n}',
    properties, generate, shrink, format,
    expectsCounterexample: true,
  };
}

function makeMyAbs() {
  function myAbs(x) { return x < 0 ? -x : x; }

  const properties = [
    {
      id: 'p0',
      label: 'result ≥ 0',
      check: (x) => myAbs(x) >= 0,
    },
    {
      id: 'p1',
      label: 'myAbs(-x) === myAbs(x)  (symmetry)',
      check: (x) => myAbs(-x) === myAbs(x),
    },
    {
      id: 'p2',
      label: 'myAbs(x) * myAbs(x) === x * x  (squared)',
      check: (x) => myAbs(x) * myAbs(x) === x * x,
    },
  ];

  function generate() { return [randInt(-50, 50)]; }
  function shrink(args) { return shrinkInt(args[0]).map((v) => [v]); }
  function format(args) { return `x=${args[0]}`; }

  return {
    id: 'myAbs', nameKey: 'pbt.preset.myabs',
    code: 'function myAbs(x) {\n  return x < 0 ? -x : x;\n}',
    properties, generate, shrink, format,
    expectsCounterexample: false,
  };
}

function makeBuggyFlatten() {
  function buggyFlatten(arr) {
    // Bug: misses negative numbers at second level
    return arr.map((x) => (Array.isArray(x) ? x.filter((v) => v >= 0) : x));
  }

  const properties = [
    {
      id: 'p0',
      label: 'output.length === arr.length  (same top-level count)',
      check: (arr) => buggyFlatten(arr).length === arr.length,
    },
    {
      id: 'p1',
      label: 'sum(flatten(arr)) === sum(arr) for flat arrays',
      check: (arr) => {
        const flat = arr.filter((x) => !Array.isArray(x));
        const flatFlat = buggyFlatten(arr).filter((x) => !Array.isArray(x));
        return flat.reduce((a, b) => a + b, 0) === flatFlat.reduce((a, b) => a + b, 0);
      },
    },
    {
      id: 'p2',
      label: 'nested negative numbers preserved',
      check: (arr) => {
        const out = buggyFlatten(arr);
        for (let i = 0; i < arr.length; i++) {
          if (Array.isArray(arr[i])) {
            const negatives = arr[i].filter((v) => v < 0);
            const outNeg = Array.isArray(out[i]) ? out[i].filter((v) => v < 0) : [];
            if (negatives.length !== outNeg.length) return false;
          }
        }
        return true;
      },
    },
  ];

  function generateInner() {
    return randInt(0, 1) === 0 ? randInt(-5, 5) : [randInt(-5, 5), randInt(-5, 5)];
  }
  function generate() {
    return [Array.from({ length: randInt(1, 3) }, generateInner)];
  }
  function shrink(args) {
    const arr = args[0];
    const candidates = [];
    for (let i = 0; i < arr.length; i++) {
      candidates.push([[...arr.slice(0, i), ...arr.slice(i + 1)]]);
    }
    return candidates;
  }
  function format(args) { return JSON.stringify(args[0]); }

  return {
    id: 'buggyFlatten', nameKey: 'pbt.preset.buggyflatten',
    code: 'function buggyFlatten(arr) {\n  return arr.map(x =>\n    Array.isArray(x) ? x.filter(v => v >= 0) : x\n  );\n}',
    properties, generate, shrink, format,
    expectsCounterexample: true,
  };
}

export const PBT_PRESETS = [makeBuggyMax(), makeMySort(), makeMyAbs(), makeBuggyFlatten()];

/* ── Engine ── */

/**
 * Run property tests for a preset.
 * Returns { results: [{args, propId, passed}], counterexample: {args, propId} | null }
 */
export function runPropertyTests(preset, numTests) {
  const results = [];
  let counterexample = null;

  for (let i = 0; i < numTests && !counterexample; i++) {
    const args = preset.generate();
    for (const prop of preset.properties) {
      let passed = false;
      try { passed = !!prop.check(...args); } catch { passed = false; }
      results.push({ args, propId: prop.id, passed, testNum: i + 1 });
      if (!passed) {
        counterexample = { args, propId: prop.id, testNum: i + 1 };
        break;
      }
    }
  }

  // Shrink counterexample
  let minimal = counterexample;
  if (counterexample) {
    let current = counterexample.args;
    let steps = 0;
    while (steps++ < MAX_SHRINK_STEPS) {
      const candidates = preset.shrink(current);
      let shrunk = false;
      for (const candidate of candidates) {
        const prop = preset.properties.find((p) => p.id === counterexample.propId);
        if (!prop) break;
        let stillFails = false;
        try { stillFails = !prop.check(...candidate); } catch { stillFails = true; }
        if (stillFails) {
          current = candidate;
          minimal = { ...counterexample, args: candidate };
          shrunk = true;
          break;
        }
      }
      if (!shrunk) break;
    }
  }

  return { results, counterexample: minimal };
}
