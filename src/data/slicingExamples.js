// Authored Program Dependence Graphs for the slice-based-testing section.
// Each example carries its source, per-statement def/use sets, control- and
// data-dependence edges, and execution traces. Slicing runs over this data;
// see src/utils/slicing.js. The integrity test keeps the edges consistent.

export const SLICING_EXAMPLES = [
  {
    id: 'grade-average',
    titleKey: 'slicing.example.gradeAverage',
    language: 'javascript',
    source: [
      'function gradeAverage(scores) {',
      '  let total = 0;',
      '  let count = 0;',
      '  for (const s of scores) {',
      '    total = total + s;',
      '    count = count + 1;',
      '  }',
      '  const avg = total / count;',
      '  const grade = avg >= 60 ? "pass" : "fail";',
      '  return grade;',
    ],
    statements: [
      { id: 's2', line: 2, text: 'total = 0', defs: ['total'], uses: [] },
      { id: 's3', line: 3, text: 'count = 0', defs: ['count'], uses: [] },
      { id: 's4', line: 4, text: 'for (s of scores)', defs: ['s'], uses: ['scores'], kind: 'control' },
      { id: 's5', line: 5, text: 'total = total + s', defs: ['total'], uses: ['total', 's'] },
      { id: 's6', line: 6, text: 'count = count + 1', defs: ['count'], uses: ['count'] },
      { id: 's8', line: 8, text: 'avg = total / count', defs: ['avg'], uses: ['total', 'count'] },
      { id: 's9', line: 9, text: 'grade = avg >= 60 ? ...', defs: ['grade'], uses: ['avg'] },
      { id: 's10', line: 10, text: 'return grade', defs: [], uses: ['grade'], kind: 'output' },
    ],
    controlDeps: [['s4', 's5'], ['s4', 's6']],
    dataDeps: [
      ['s2', 's5', 'total'], ['s5', 's5', 'total'], ['s5', 's8', 'total'],
      ['s4', 's5', 's'],
      ['s3', 's6', 'count'], ['s6', 's6', 'count'], ['s6', 's8', 'count'],
      ['s8', 's9', 'avg'], ['s9', 's10', 'grade'],
    ],
    traces: [
      { id: 'pass', inputLabel: 'scores=[80,90]', label: 'pass',
        steps: ['s2', 's3', 's4', 's5', 's6', 's4', 's5', 's6', 's4', 's8', 's9', 's10'] },
      { id: 'fail', inputLabel: 'scores=[50]', label: 'fail',
        steps: ['s2', 's3', 's4', 's5', 's6', 's4', 's8', 's9', 's10'] },
    ],
  },
  {
    id: 'classify',
    titleKey: 'slicing.example.classify',
    language: 'javascript',
    source: [
      'function classify(n) {',
      '  let label = "zero";',
      '  let sign = 0;',
      '  if (n > 0) {',
      '    label = "positive";',
      '    sign = 1;',
      '  } else if (n < 0) {',
      '    label = "negative";',
      '    sign = -1;',
      '  }',
      '  return label;',
    ],
    statements: [
      { id: 's2', line: 2, text: 'label = "zero"', defs: ['label'], uses: [] },
      { id: 's3', line: 3, text: 'sign = 0', defs: ['sign'], uses: [] },
      { id: 's4', line: 4, text: 'if (n > 0)', defs: [], uses: ['n'], kind: 'control' },
      { id: 's5', line: 5, text: 'label = "positive"', defs: ['label'], uses: [] },
      { id: 's6', line: 6, text: 'sign = 1', defs: ['sign'], uses: [] },
      { id: 's7', line: 7, text: 'else if (n < 0)', defs: [], uses: ['n'], kind: 'control' },
      { id: 's8', line: 8, text: 'label = "negative"', defs: ['label'], uses: [] },
      { id: 's9', line: 9, text: 'sign = -1', defs: ['sign'], uses: [] },
      { id: 's11', line: 11, text: 'return label', defs: [], uses: ['label'], kind: 'output' },
    ],
    controlDeps: [['s4', 's5'], ['s4', 's6'], ['s4', 's7'], ['s7', 's8'], ['s7', 's9']],
    dataDeps: [
      ['s2', 's11', 'label'], ['s5', 's11', 'label'], ['s8', 's11', 'label'],
    ],
    traces: [
      { id: 'pos', inputLabel: 'n=5', label: 'positive',
        steps: ['s2', 's3', 's4', 's5', 's6', 's11'] },
      { id: 'neg', inputLabel: 'n=-3', label: 'negative',
        steps: ['s2', 's3', 's4', 's7', 's8', 's9', 's11'] },
      { id: 'zero', inputLabel: 'n=0', label: 'zero',
        steps: ['s2', 's3', 's4', 's7', 's11'] },
    ],
  },
  {
    id: 'grade-average-buggy',
    titleKey: 'slicing.example.gradeAverageBuggy',
    language: 'javascript',
    bug: { stmtId: 's6', note: 'counts the score value, not 1' },
    source: [
      'function gradeAverage(scores) {',
      '  let total = 0;',
      '  let count = 0;',
      '  for (const s of scores) {',
      '    total = total + s;',
      '    count = count + s;',
      '  }',
      '  const avg = total / count;',
      '  const grade = avg >= 60 ? "pass" : "fail";',
      '  return grade;',
    ],
    statements: [
      { id: 's2', line: 2, text: 'total = 0', defs: ['total'], uses: [] },
      { id: 's3', line: 3, text: 'count = 0', defs: ['count'], uses: [] },
      { id: 's4', line: 4, text: 'for (s of scores)', defs: ['s'], uses: ['scores'], kind: 'control' },
      { id: 's5', line: 5, text: 'total = total + s', defs: ['total'], uses: ['total', 's'] },
      { id: 's6', line: 6, text: 'count = count + s', defs: ['count'], uses: ['count', 's'] },
      { id: 's8', line: 8, text: 'avg = total / count', defs: ['avg'], uses: ['total', 'count'] },
      { id: 's9', line: 9, text: 'grade = avg >= 60 ? ...', defs: ['grade'], uses: ['avg'] },
      { id: 's10', line: 10, text: 'return grade', defs: [], uses: ['grade'], kind: 'output' },
    ],
    controlDeps: [['s4', 's5'], ['s4', 's6']],
    dataDeps: [
      ['s2', 's5', 'total'], ['s5', 's5', 'total'], ['s5', 's8', 'total'],
      ['s4', 's5', 's'], ['s4', 's6', 's'],
      ['s3', 's6', 'count'], ['s6', 's6', 'count'], ['s6', 's8', 'count'],
      ['s8', 's9', 'avg'], ['s9', 's10', 'grade'],
    ],
    // Traces are named by their input, not by an outcome: this program is
    // buggy, so "pass"/"fail" would be misleading. N2 (dicing) will design
    // proper passing/failing runs when it specs its fault scenarios.
    traces: [
      { id: 'in-80-90', inputLabel: 'scores=[80,90]', label: 'scores=[80,90]',
        steps: ['s2', 's3', 's4', 's5', 's6', 's4', 's5', 's6', 's4', 's8', 's9', 's10'] },
      { id: 'in-50', inputLabel: 'scores=[50]', label: 'scores=[50]',
        steps: ['s2', 's3', 's4', 's5', 's6', 's4', 's8', 's9', 's10'] },
    ],
  },
];

export function getSlicingExample(id) {
  return SLICING_EXAMPLES.find((e) => e.id === id) ?? null;
}
