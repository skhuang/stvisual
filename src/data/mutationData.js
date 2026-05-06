// Syntax-Based Testing 範例與設定。
// MVP：Program Mutation 用的小型 JavaScript 函式 + 對應 test set。

export const mutationOperators = [
  { id: 'AOR', label: 'Arithmetic Operator Replacement', desc: '替換 + - * / % 等算術運算子。' },
  { id: 'ROR', label: 'Relational Operator Replacement', desc: '替換 < <= > >= == != === !==。' },
  { id: 'LOR', label: 'Logical Operator Replacement', desc: '替換 && 與 ||。' },
  { id: 'COR', label: 'Conditional Operator Replacement', desc: '替換條件運算子（與 LOR 相同集合）。' },
  { id: 'UOI', label: 'Unary Operator Insertion', desc: '在識別字前插入 ! 或 -。' },
  { id: 'ABS', label: 'Absolute Value Insertion', desc: '把識別字包成 Math.abs(x) 或 -(x)。' },
];

export const programExamples = [
  {
    id: 'max',
    name: 'max(a, b)',
    params: ['a', 'b'],
    body: 'return a > b ? a : b;',
    description: '回傳兩數中較大者。',
    tests: [
      { id: 't1', args: [3, 5], expected: 5 },
      { id: 't2', args: [7, 2], expected: 7 },
      { id: 't3', args: [4, 4], expected: 4 },
      { id: 't4', args: [-1, -3], expected: -1 },
    ],
  },
  {
    id: 'isLeapYear',
    name: 'isLeapYear(y)',
    params: ['y'],
    body: 'return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);',
    description: '判斷是否為閏年。',
    tests: [
      { id: 't1', args: [2024], expected: true },
      { id: 't2', args: [1900], expected: false },
      { id: 't3', args: [2000], expected: true },
      { id: 't4', args: [2023], expected: false },
    ],
  },
  {
    id: 'triangle',
    name: 'triangle(a, b, c)',
    params: ['a', 'b', 'c'],
    body: [
      'if (a <= 0 || b <= 0 || c <= 0) return "invalid";',
      'if (a + b <= c || a + c <= b || b + c <= a) return "invalid";',
      'if (a === b && b === c) return "equilateral";',
      'if (a === b || b === c || a === c) return "isosceles";',
      'return "scalene";',
    ].join('\n'),
    description: '依三邊長判斷三角形類型。',
    tests: [
      { id: 't1', args: [3, 3, 3], expected: 'equilateral' },
      { id: 't2', args: [3, 3, 4], expected: 'isosceles' },
      { id: 't3', args: [3, 4, 5], expected: 'scalene' },
      { id: 't4', args: [1, 2, 5], expected: 'invalid' },
      { id: 't5', args: [0, 1, 1], expected: 'invalid' },
    ],
  },
];
