/**
 * Code Coverage Drill-down Engine.
 *
 * Provides 4 preset programs with explicit statement/branch/condition/MC/DC metadata.
 * Each preset exposes a `run(args)` function that returns coverage data for one test case.
 * Post-processing functions compute aggregate coverage across a test suite.
 */

/* ── Preset definitions ── */

function makeAbsVal() {
  const code = `function absVal(x) {
  let result;
  if (x < 0) {
    result = -x;
  } else {
    result = x;
  }
  return result;
}`;

  const stmts = [
    { id: 's0', line: 1, text: 'let result' },
    { id: 's1', line: 2, text: 'if (x < 0)' },
    { id: 's2', line: 3, text: 'result = -x  [true branch]' },
    { id: 's3', line: 5, text: 'result = x   [false branch]' },
    { id: 's4', line: 7, text: 'return result' },
  ];

  const branches = [
    { id: 'b0', predicate: 'x < 0', trueLabel: 'x < 0 is true', falseLabel: 'x < 0 is false' },
  ];

  const conditions = [
    { id: 'c0', branchId: 'b0', clause: 'x < 0' },
  ];

  function run(x) {
    const hit = new Set();
    let result;
    hit.add('s0');
    hit.add('s1'); // if line
    const b0 = x < 0;
    if (b0) {
      hit.add('s2');
      result = -x;
    } else {
      hit.add('s3');
      result = x;
    }
    hit.add('s4');
    return {
      output: result,
      stmtsHit: hit,
      branchResults: [{ id: 'b0', taken: b0 }],
      condResults: [{ id: 'c0', val: b0 }],
    };
  }

  return { id: 'absVal', nameKey: 'codecov.preset.absval', code, params: ['x'], stmts, branches, conditions, run };
}

function makeClassify() {
  const code = `function classify(x) {
  if (x > 0 && x < 10) {
    return 'small';
  } else if (x >= 10) {
    return 'large';
  }
  return 'other';
}`;

  const stmts = [
    { id: 's0', line: 1, text: "if (x > 0 && x < 10)" },
    { id: 's1', line: 2, text: "return 'small'  [true branch]" },
    { id: 's2', line: 3, text: "else if (x >= 10)" },
    { id: 's3', line: 4, text: "return 'large'  [true branch]" },
    { id: 's4', line: 6, text: "return 'other'" },
  ];

  const branches = [
    { id: 'b0', predicate: 'x > 0 && x < 10', trueLabel: 'x in (0,10)', falseLabel: 'x not in (0,10)' },
    { id: 'b1', predicate: 'x >= 10',          trueLabel: 'x ≥ 10',       falseLabel: 'x < 0 or x = 0' },
  ];

  const conditions = [
    { id: 'c0', branchId: 'b0', clause: 'x > 0' },
    { id: 'c1', branchId: 'b0', clause: 'x < 10' },
    { id: 'c2', branchId: 'b1', clause: 'x >= 10' },
  ];

  function run(x) {
    const hit = new Set();
    hit.add('s0');
    const c0 = x > 0;
    const c1 = x < 10;
    const b0 = c0 && c1;
    if (b0) {
      hit.add('s1');
      return {
        output: 'small',
        stmtsHit: hit,
        branchResults: [{ id: 'b0', taken: true }, { id: 'b1', taken: null }],
        condResults: [{ id: 'c0', val: c0 }, { id: 'c1', val: c1 }, { id: 'c2', val: null }],
      };
    }
    hit.add('s2');
    const c2 = x >= 10;
    const b1 = c2;
    if (b1) {
      hit.add('s3');
      return {
        output: 'large',
        stmtsHit: hit,
        branchResults: [{ id: 'b0', taken: false }, { id: 'b1', taken: true }],
        condResults: [{ id: 'c0', val: c0 }, { id: 'c1', val: c1 }, { id: 'c2', val: c2 }],
      };
    }
    hit.add('s4');
    return {
      output: 'other',
      stmtsHit: hit,
      branchResults: [{ id: 'b0', taken: false }, { id: 'b1', taken: false }],
      condResults: [{ id: 'c0', val: c0 }, { id: 'c1', val: c1 }, { id: 'c2', val: c2 }],
    };
  }

  return { id: 'classify', nameKey: 'codecov.preset.classify', code, params: ['x'], stmts, branches, conditions, run };
}

function makeDiscount() {
  const code = `function discount(age, isMember) {
  if (age >= 65 || isMember) {
    return 20;
  }
  return 0;
}`;

  const stmts = [
    { id: 's0', line: 1, text: 'if (age >= 65 || isMember)' },
    { id: 's1', line: 2, text: 'return 20  [true branch]' },
    { id: 's2', line: 4, text: 'return 0' },
  ];

  const branches = [
    { id: 'b0', predicate: 'age >= 65 || isMember', trueLabel: 'senior or member', falseLabel: 'not senior, not member' },
  ];

  const conditions = [
    { id: 'c0', branchId: 'b0', clause: 'age >= 65' },
    { id: 'c1', branchId: 'b0', clause: 'isMember' },
  ];

  function run(age, isMember) {
    const hit = new Set();
    hit.add('s0');
    const c0 = age >= 65;
    const c1 = !!isMember;
    const b0 = c0 || c1;
    if (b0) {
      hit.add('s1');
      return {
        output: 20,
        stmtsHit: hit,
        branchResults: [{ id: 'b0', taken: true }],
        condResults: [{ id: 'c0', val: c0 }, { id: 'c1', val: c1 }],
      };
    }
    hit.add('s2');
    return {
      output: 0,
      stmtsHit: hit,
      branchResults: [{ id: 'b0', taken: false }],
      condResults: [{ id: 'c0', val: c0 }, { id: 'c1', val: c1 }],
    };
  }

  return { id: 'discount', nameKey: 'codecov.preset.discount', code, params: ['age', 'isMember'], stmts, branches, conditions, run };
}

function makeMaxOf3() {
  const code = `function maxOf3(a, b, c) {
  let m = a;
  if (b > m) {
    m = b;
  }
  if (c > m) {
    m = c;
  }
  return m;
}`;

  const stmts = [
    { id: 's0', line: 1, text: 'let m = a' },
    { id: 's1', line: 2, text: 'if (b > m)' },
    { id: 's2', line: 3, text: 'm = b  [true branch]' },
    { id: 's3', line: 5, text: 'if (c > m)' },
    { id: 's4', line: 6, text: 'm = c  [true branch]' },
    { id: 's5', line: 8, text: 'return m' },
  ];

  const branches = [
    { id: 'b0', predicate: 'b > m', trueLabel: 'b > current max', falseLabel: 'b ≤ current max' },
    { id: 'b1', predicate: 'c > m', trueLabel: 'c > current max', falseLabel: 'c ≤ current max' },
  ];

  const conditions = [
    { id: 'c0', branchId: 'b0', clause: 'b > m (where m = a initially)' },
    { id: 'c1', branchId: 'b1', clause: 'c > m (where m = max(a,b))' },
  ];

  function run(a, b, c) {
    const hit = new Set();
    hit.add('s0');
    let m = a;
    hit.add('s1');
    const b0 = b > m;
    if (b0) { hit.add('s2'); m = b; }
    hit.add('s3');
    const b1 = c > m;
    if (b1) { hit.add('s4'); m = c; }
    hit.add('s5');
    return {
      output: m,
      stmtsHit: hit,
      branchResults: [{ id: 'b0', taken: b0 }, { id: 'b1', taken: b1 }],
      condResults: [{ id: 'c0', val: b0 }, { id: 'c1', val: b1 }],
    };
  }

  return { id: 'maxOf3', nameKey: 'codecov.preset.maxof3', code, params: ['a', 'b', 'c'], stmts, branches, conditions, run };
}

export const COVERAGE_PRESETS = [
  makeAbsVal(),
  makeDiscount(),
  makeClassify(),
  makeMaxOf3(),
];

/* ── Coverage computation ── */

/**
 * Run a test suite against a preset and return aggregate coverage data.
 * testCases = [{args: [v1, v2, ...], active: bool}]
 */
export function runSuite(preset, testCases) {
  const results = [];
  for (const tc of testCases) {
    if (!tc.active) continue;
    try {
      const r = preset.run(...tc.args);
      results.push(r);
    } catch {
      results.push(null);
    }
  }
  return results.filter(Boolean);
}

/** Statement coverage: fraction of stmts executed by at least one test. */
export function stmtCoverage(preset, results) {
  const covered = new Set();
  for (const r of results) r.stmtsHit.forEach((id) => covered.add(id));
  const total = preset.stmts.length;
  return { covered: covered.size, total, pct: total ? Math.round((covered.size / total) * 100) : 0, coveredIds: covered };
}

/** Branch coverage: fraction of branch outcomes (true + false) observed. */
export function branchCoverage(preset, results) {
  const trueSet = new Set();
  const falseSet = new Set();
  for (const r of results) {
    for (const br of r.branchResults) {
      if (br.taken === null) continue;
      if (br.taken) trueSet.add(br.id);
      else falseSet.add(br.id);
    }
  }
  const total = preset.branches.length * 2;
  const covered = [...trueSet].filter((id) => trueSet.has(id)).length
    + [...falseSet].filter((id) => falseSet.has(id)).length;
  // Simply: count unique true branch ids + unique false branch ids
  const coveredCount = trueSet.size + falseSet.size;
  return {
    covered: coveredCount,
    total,
    pct: total ? Math.round((coveredCount / total) * 100) : 0,
    trueSet,
    falseSet,
  };
}

/** Condition coverage: each condition takes both T and F across the test suite. */
export function condCoverage(preset, results) {
  const trueSet = new Set();
  const falseSet = new Set();
  for (const r of results) {
    for (const cr of r.condResults) {
      if (cr.val === null) continue;
      if (cr.val) trueSet.add(cr.id);
      else falseSet.add(cr.id);
    }
  }
  const total = preset.conditions.length * 2;
  const covered = trueSet.size + falseSet.size;
  return {
    covered,
    total,
    pct: total ? Math.round((covered / total) * 100) : 0,
    trueSet,
    falseSet,
  };
}

/**
 * MC/DC coverage: for each condition, there exist two test results where
 * only that condition differs (others in same predicate equal) AND the
 * branch outcome differs.
 */
export function mcdcCoverage(preset, results) {
  const satisfied = new Map(); // condId → bool

  for (const cond of preset.conditions) {
    let ok = false;
    const siblings = preset.conditions.filter((c) => c.branchId === cond.branchId && c.id !== cond.id);

    outer:
    for (let i = 0; i < results.length && !ok; i++) {
      for (let j = i + 1; j < results.length && !ok; j++) {
        const ri = results[i];
        const rj = results[j];

        const ci = ri.condResults.find((c) => c.id === cond.id);
        const cj = rj.condResults.find((c) => c.id === cond.id);
        if (!ci || !cj || ci.val === null || cj.val === null) continue;
        if (ci.val === cj.val) continue; // this condition must differ

        // All siblings must have same value in both rows
        const siblingsMatch = siblings.every((sib) => {
          const si = ri.condResults.find((c) => c.id === sib.id);
          const sj = rj.condResults.find((c) => c.id === sib.id);
          return si && sj && si.val !== null && sj.val !== null && si.val === sj.val;
        });
        if (!siblingsMatch) continue;

        // Branch outcome must differ
        const bi = ri.branchResults.find((b) => b.id === cond.branchId);
        const bj = rj.branchResults.find((b) => b.id === cond.branchId);
        if (!bi || !bj || bi.taken === null || bj.taken === null) continue;
        if (bi.taken !== bj.taken) { ok = true; break outer; }
      }
    }
    satisfied.set(cond.id, ok);
  }

  const total = preset.conditions.length;
  const covered = [...satisfied.values()].filter(Boolean).length;
  return {
    covered,
    total,
    pct: total ? Math.round((covered / total) * 100) : 0,
    satisfied,
  };
}
