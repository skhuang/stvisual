// Authored dicing scenarios for the slice-based-testing section's N2 tab.
// Each scenario is a Program Dependence Graph (same shape as slicingExamples.js)
// plus dicing metadata. The dice math is verified by the integrity test.

export const DICING_SCENARIOS = [
  // ── Static, multi-output: classic Lyle-Weiser dicing ───────────────────────
  // dice(highest) = slice(out-highest) - slice(out-total) - slice(out-mean)
  //              = { out-highest, s3, s7, s6 } — the seeded bug is s7.
  {
    id: 'summary-stats',
    mode: 'static',
    titleKey: 'dicing.scenario.summaryStats',
    language: 'javascript',
    source: [
      'function summaryStats(nums) {',
      '  let total = 0;',
      '  let highest = nums[0];',
      '  for (const n of nums) {',
      '    total = total + n;',
      '    if (n > highest) {',
      '      highest = total;',
      '    }',
      '  }',
      '  const mean = total / nums.length;',
      '  return [',
      '    total,',
      '    mean,',
      '    highest,',
      '  ];',
      '}',
    ],
    statements: [
      { id: 's2', line: 2, text: 'total = 0', defs: ['total'], uses: [] },
      { id: 's3', line: 3, text: 'highest = nums[0]', defs: ['highest'], uses: ['nums'] },
      { id: 's4', line: 4, text: 'for (n of nums)', defs: ['n'], uses: ['nums'], kind: 'control' },
      { id: 's5', line: 5, text: 'total = total + n', defs: ['total'], uses: ['total', 'n'] },
      { id: 's6', line: 6, text: 'if (n > highest)', defs: [], uses: ['n', 'highest'], kind: 'control' },
      { id: 's7', line: 7, text: 'highest = total', defs: ['highest'], uses: ['total'] },
      { id: 's10', line: 10, text: 'mean = total / nums.length', defs: ['mean'], uses: ['total', 'nums'] },
      { id: 'out-total', line: 12, text: 'return total', defs: [], uses: ['total'], kind: 'output' },
      { id: 'out-mean', line: 13, text: 'return mean', defs: [], uses: ['mean'], kind: 'output' },
      { id: 'out-highest', line: 14, text: 'return highest', defs: [], uses: ['highest'], kind: 'output' },
    ],
    controlDeps: [['s4', 's5'], ['s4', 's6'], ['s6', 's7']],
    dataDeps: [
      ['s2', 's5', 'total'], ['s5', 's5', 'total'], ['s5', 's7', 'total'],
      ['s5', 's10', 'total'], ['s5', 'out-total', 'total'],
      ['s4', 's5', 'n'], ['s4', 's6', 'n'],
      ['s3', 's6', 'highest'], ['s7', 's6', 'highest'],
      ['s3', 'out-highest', 'highest'], ['s7', 'out-highest', 'highest'],
      ['s10', 'out-mean', 'mean'],
    ],
    outputs: [
      { variable: 'total', stmtId: 'out-total' },
      { variable: 'mean', stmtId: 'out-mean' },
      { variable: 'highest', stmtId: 'out-highest' },
    ],
    wrongOutput: 'highest',
    bug: { stmtId: 's7', note: 'assigns total, not n' },
  },

  // ── Dynamic, multi-input: dice across a failing vs passing run ─────────────
  // dynamicSlice(fail) - union(dynamicSlice(pass...)) = { s8, s9 } — bug is s9.
  // The static dice across these inputs would be empty (slices input-independent).
  {
    id: 'fare',
    mode: 'dynamic',
    titleKey: 'dicing.scenario.fare',
    language: 'javascript',
    source: [
      'function fare(age, peak) {',
      '  let price = 10;',
      '  if (age < 18) {',
      '    price = 5;',
      '  } else if (age >= 65) {',
      '    price = 3;',
      '  }',
      '  if (peak) {',
      '    price = price + 2 + 2;',
      '  }',
      '  return price;',
      '}',
    ],
    statements: [
      { id: 's2', line: 2, text: 'price = 10', defs: ['price'], uses: [] },
      { id: 's3', line: 3, text: 'if (age < 18)', defs: [], uses: ['age'], kind: 'control' },
      { id: 's4', line: 4, text: 'price = 5', defs: ['price'], uses: [] },
      { id: 's5', line: 5, text: 'else if (age >= 65)', defs: [], uses: ['age'], kind: 'control' },
      { id: 's6', line: 6, text: 'price = 3', defs: ['price'], uses: [] },
      { id: 's8', line: 8, text: 'if (peak)', defs: [], uses: ['peak'], kind: 'control' },
      { id: 's9', line: 9, text: 'price = price + 2 + 2', defs: ['price'], uses: ['price'] },
      { id: 's11', line: 11, text: 'return price', defs: [], uses: ['price'], kind: 'output' },
    ],
    controlDeps: [['s3', 's4'], ['s3', 's5'], ['s5', 's6'], ['s8', 's9']],
    dataDeps: [
      ['s2', 's9', 'price'], ['s4', 's9', 'price'], ['s6', 's9', 'price'],
      ['s2', 's11', 'price'], ['s4', 's11', 'price'], ['s6', 's11', 'price'],
      ['s9', 's11', 'price'],
    ],
    criterion: { stmtId: 's11', variable: 'price' },
    traces: [
      { id: 'adult-peak', outcome: 'fail', expected: 12, actual: 14,
        inputLabel: 'age=30, peak=true',
        steps: ['s2', 's3', 's5', 's8', 's9', 's11'] },
      { id: 'adult-off', outcome: 'pass', expected: 10, actual: 10,
        inputLabel: 'age=30, peak=false',
        steps: ['s2', 's3', 's5', 's8', 's11'] },
      { id: 'child-off', outcome: 'pass', expected: 5, actual: 5,
        inputLabel: 'age=12, peak=false',
        steps: ['s2', 's3', 's4', 's8', 's11'] },
      { id: 'senior-off', outcome: 'pass', expected: 3, actual: 3,
        inputLabel: 'age=70, peak=false',
        steps: ['s2', 's3', 's5', 's6', 's8', 's11'] },
    ],
    bug: { stmtId: 's9', note: 'adds 2 twice' },
  },
];

export function getDicingScenario(id) {
  return DICING_SCENARIOS.find((s) => s.id === id) ?? null;
}
