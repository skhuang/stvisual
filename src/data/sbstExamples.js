// Authored example programs for the SBST explorers. Each is an instrumented
// function: run(inputs, probe) calls probe(branchId, op, lhs, rhs, outcome) at
// every decision. The search engine derives branch distance + approach level
// from the probe trace. Display-only source strings accompany each.

export const SBST_EXAMPLES = [
  {
    id: 'nested-guard',
    nameKey: 'sbst.example.nestedGuard',
    source: [
      'function classify(x, y) {',
      '  if (x === 17) {        // b1',
      '    if (y > 100) {       // b2  ← target',
      '      return "JACKPOT";',
      '    }',
      '  }',
      '  return "none";',
      '}',
    ].join('\n'),
    inputSchema: [
      { name: 'x', min: 0, max: 50 },
      { name: 'y', min: 0, max: 200 },
    ],
    branches: [
      { id: 'b1', op: '==', requires: [] },
      { id: 'b2', op: '>',  requires: [{ branchId: 'b1', outcome: true }] },
    ],
    target: { branchId: 'b2', outcome: true },
    run([x, y], probe) {
      const c1 = x === 17;
      probe('b1', '==', x, 17, c1);
      if (c1) {
        const c2 = y > 100;
        probe('b2', '>', y, 100, c2);
      }
    },
  },
  {
    id: 'triangle',
    nameKey: 'sbst.example.triangle',
    source: [
      'function classify(a, b, c) {',
      '  if (a === b) {         // b1',
      '    if (b === c) {       // b2  ← target (equilateral)',
      '      return "equilateral";',
      '    }',
      '    return "isosceles";',
      '  }',
      '  return "scalene";',
      '}',
    ].join('\n'),
    inputSchema: [
      { name: 'a', min: 1, max: 30 },
      { name: 'b', min: 1, max: 30 },
      { name: 'c', min: 1, max: 30 },
    ],
    branches: [
      { id: 'b1', op: '==', requires: [] },
      { id: 'b2', op: '==', requires: [{ branchId: 'b1', outcome: true }] },
    ],
    target: { branchId: 'b2', outcome: true },
    run([a, b, c], probe) {
      const c1 = a === b;
      probe('b1', '==', a, b, c1);
      if (c1) {
        const c2 = b === c;
        probe('b2', '==', b, c, c2);
      }
    },
  },
  {
    id: 'multimodal',
    nameKey: 'sbst.example.multimodal',
    source: [
      'function check(x) {',
      '  const r = x % 20;     // non-monotone — creates many basins',
      '  if (r === 7) {        // b1',
      '    if (x > 50) {       // b2  ← target',
      '      return "hit";',
      '    }',
      '  }',
      '  return "miss";',
      '}',
    ].join('\n'),
    inputSchema: [{ name: 'x', min: 0, max: 100 }],
    branches: [
      { id: 'b1', op: '==', requires: [] },
      { id: 'b2', op: '>',  requires: [{ branchId: 'b1', outcome: true }] },
    ],
    target: { branchId: 'b2', outcome: true },
    run([x], probe) {
      const r = x % 20;
      const c1 = r === 7;
      probe('b1', '==', r, 7, c1);
      if (c1) {
        const c2 = x > 50;
        probe('b2', '>', x, 50, c2);
      }
    },
  },
];
