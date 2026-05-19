import { describe, expect, it } from 'vitest';
import { TDD_KATAS } from '../data/tddKatas.js';

describe('TDD_KATAS', () => {
  it('ships at least two katas, each with an id, titleKey and steps', () => {
    expect(TDD_KATAS.length).toBeGreaterThanOrEqual(2);
    for (const k of TDD_KATAS) {
      expect(typeof k.id).toBe('string');
      expect(typeof k.titleKey).toBe('string');
      expect(Array.isArray(k.steps)).toBe(true);
      expect(k.steps.length).toBeGreaterThan(0);
    }
  });

  it('every kata starts on a red step', () => {
    for (const k of TDD_KATAS) expect(k.steps[0].phase).toBe('red');
  });

  it('every step has a valid phase, testList, code, suite and noteKey', () => {
    for (const k of TDD_KATAS) {
      for (const s of k.steps) {
        expect(['red', 'green', 'refactor']).toContain(s.phase);
        expect(Array.isArray(s.testList)).toBe(true);
        expect(typeof s.code).toBe('string');
        expect(typeof s.suite.passing).toBe('number');
        expect(typeof s.suite.failing).toBe('number');
        expect(typeof s.noteKey).toBe('string');
        for (const t of s.testList) {
          expect(['todo', 'red', 'green']).toContain(t.status);
        }
      }
    }
  });

  it('a green step always follows a red step', () => {
    for (const k of TDD_KATAS) {
      k.steps.forEach((s, i) => {
        if (s.phase === 'green') expect(k.steps[i - 1]?.phase).toBe('red');
      });
    }
  });

  it('refactor steps have no failing tests', () => {
    for (const k of TDD_KATAS) {
      for (const s of k.steps) {
        if (s.phase === 'refactor') expect(s.suite.failing).toBe(0);
      }
    }
  });

  it("each step's suite counts match its testList statuses", () => {
    for (const k of TDD_KATAS) {
      for (const s of k.steps) {
        const red = s.testList.filter((t) => t.status === 'red').length;
        const green = s.testList.filter((t) => t.status === 'green').length;
        expect(s.suite.failing).toBe(red);
        expect(s.suite.passing).toBe(green);
      }
    }
  });
});
