import { describe, it, expect } from 'vitest';
import {
  generateMutants,
  evaluateMutants,
  computeMutationScore,
  runTestSuite,
} from '../utils/mutation.js';

describe('generateMutants', () => {
  it('AOR：a + b 產生 sub/mul/div/mod 共 4 個 mutants', () => {
    const mutants = generateMutants('return a + b;', ['AOR']);
    expect(mutants).toHaveLength(4);
    const replacements = mutants.map((m) => m.mutated).sort();
    expect(replacements).toEqual(['%', '*', '-', '/'].sort());
    expect(mutants.every((m) => m.operator === 'AOR')).toBe(true);
  });

  it('ROR：a > b 產生 7 個替換', () => {
    const mutants = generateMutants('return a > b;', ['ROR']);
    expect(mutants).toHaveLength(7);
  });

  it('LOR：a && b 產生 1 個 mutant（變 ||）', () => {
    const mutants = generateMutants('return a && b;', ['LOR']);
    expect(mutants).toHaveLength(1);
    expect(mutants[0].mutated).toBe('||');
  });

  it('UOI：每個識別字產生 ! 與 - 共 2 個 mutants', () => {
    const mutants = generateMutants('return a + b;', ['UOI']);
    expect(mutants).toHaveLength(4);
    const variants = mutants.map((m) => m.mutated).sort();
    expect(variants).toEqual(['!a', '!b', '-a', '-b']);
  });

  it('忽略字串字面值內的運算子', () => {
    const mutants = generateMutants('return "a + b";', ['AOR']);
    expect(mutants).toHaveLength(0);
  });

  it('忽略註解中的運算子', () => {
    const mutants = generateMutants('return a; // a + b', ['AOR']);
    expect(mutants).toHaveLength(0);
  });

  it('不會把 += 當成 +', () => {
    const mutants = generateMutants('let x = 0; x += a; return x;', ['AOR']);
    // 只有 += 的位置不會被視為 +，但 `let x = 0` 中沒有算術運算子；應為 0
    expect(mutants).toHaveLength(0);
  });
});

describe('evaluateMutants 與 mutation score', () => {
  it('完整 test suite 能 kill 所有 AOR mutants', () => {
    const params = ['a', 'b'];
    const body = 'return a + b;';
    const tests = [
      { id: 't1', args: [2, 3], expected: 5 },
      { id: 't2', args: [10, 4], expected: 14 },
    ];
    const mutants = generateMutants(body, ['AOR']);
    const evaluated = evaluateMutants(params, body, tests, mutants);
    expect(evaluated.every((m) => m.status === 'killed')).toBe(true);
    const score = computeMutationScore(evaluated);
    expect(score.score).toBe(1);
    expect(score.killed).toBe(4);
    expect(score.live).toBe(0);
  });

  it('弱 test suite 會留下 live mutants', () => {
    const params = ['a', 'b'];
    const body = 'return a + b;';
    const tests = [{ id: 't1', args: [0, 0], expected: 0 }];
    const mutants = generateMutants(body, ['AOR']);
    const evaluated = evaluateMutants(params, body, tests, mutants);
    // 0+0 = 0-0 = 0*0 = 0, 0/0 = NaN, 0%0 = NaN
    // 因此 - 與 * 的 mutants 不會被 killed
    const live = evaluated.filter((m) => m.status === 'live');
    expect(live.length).toBeGreaterThan(0);
  });

  it('runTestSuite 能正確判斷 pass/fail', () => {
    const results = runTestSuite(['a', 'b'], 'return a + b;', [
      { id: 't1', args: [1, 2], expected: 3 },
      { id: 't2', args: [1, 2], expected: 99 },
    ]);
    expect(results[0].passed).toBe(true);
    expect(results[1].passed).toBe(false);
  });

  it('mutation score 排除 equivalent mutants', () => {
    const mutants = [
      { id: 'M1', status: 'killed', killedBy: ['t1'] },
      { id: 'M2', status: 'live', killedBy: [] },
      { id: 'M3', status: 'equivalent', killedBy: [] },
    ];
    const score = computeMutationScore(mutants);
    expect(score.total).toBe(3);
    expect(score.killed).toBe(1);
    expect(score.live).toBe(1);
    expect(score.equivalent).toBe(1);
    expect(score.score).toBeCloseTo(0.5);
  });
});

describe('OO mutation operators', () => {
  const ooSource = [
    'class Shape {',
    '  constructor(n) { this.n = n; }',
    '  area() { return 0; }',
    '  describe() { return "shape:" + this.area(); }',
    '}',
    'class Square extends Shape {',
    '  constructor(side) { super(side); this.side = side; }',
    '  area() { return this.side * this.side; }',
    '}',
    'return new Square(kind).describe();',
  ].join('\n');

  it('JTD：刪除 this. 前綴', () => {
    const mutants = generateMutants(ooSource, ['JTD']);
    expect(mutants.length).toBeGreaterThan(0);
    expect(mutants.every((m) => m.operator === 'JTD' && m.original === 'this.')).toBe(true);
  });

  it('ISD：把 super(...) 換成 undefined', () => {
    const mutants = generateMutants(ooSource, ['ISD']);
    expect(mutants).toHaveLength(1);
    expect(mutants[0].mutated).toBe('undefined');
    expect(mutants[0].original.startsWith('super')).toBe(true);
  });

  it('IOD：刪除非 constructor 的方法定義', () => {
    const mutants = generateMutants(ooSource, ['IOD']);
    // Shape.area, Shape.describe, Square.area
    expect(mutants).toHaveLength(3);
    expect(mutants.every((m) => m.operator === 'IOD')).toBe(true);
  });

  it('PRV：new Square(...) 可換成 new Shape(...)', () => {
    const mutants = generateMutants(ooSource, ['PRV']);
    expect(mutants.length).toBeGreaterThan(0);
    expect(mutants.some((m) => m.mutated === 'new Shape')).toBe(true);
  });
});
