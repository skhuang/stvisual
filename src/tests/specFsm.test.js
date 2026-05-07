import { describe, it, expect } from 'vitest';
import { parsePredicate, generateSpecMutants, evaluateSpecMutants, buildAssignmentSpace } from '../utils/specMutation.js';
import { buildMonitor, diffMonitors, renderMonitorSvg, flippedKeysFromKillers } from '../utils/specFsm.js';

describe('specFsm', () => {
  it('partitions assignments into trueSet (SAFE) and falseSet (VIOLATION)', () => {
    const parsed = parsePredicate('a && b');
    const mon = buildMonitor(parsed.ast, parsed.clauses);
    expect(mon.trueSet).toHaveLength(1);
    expect(mon.falseSet).toHaveLength(3);
    expect(mon.trueSet[0]).toEqual({ a: true, b: true });
  });

  it('diffMonitors returns flipped assignments matching killer set', () => {
    const parsed = parsePredicate('a && b');
    // LRO mutant is `a || b`.
    const [mutant] = generateSpecMutants(parsed, ['LRO']);
    expect(mutant.text).toBe('a || b');
    const flipped = diffMonitors(parsed.ast, mutant.ast, parsed.clauses);
    // a&&b vs a||b differ on (T,F) and (F,T).
    expect(flipped).toHaveLength(2);
    const tests = buildAssignmentSpace(parsed.clauses);
    const [evaluated] = evaluateSpecMutants(parsed, [mutant], tests);
    const keys = flippedKeysFromKillers(evaluated.killers, parsed.clauses);
    expect(keys.size).toBe(2);
    expect(keys.has('a=T b=F')).toBe(true);
    expect(keys.has('a=F b=T')).toBe(true);
  });

  it('renderMonitorSvg produces an SVG with two states and adds .killer when flipped', () => {
    const parsed = parsePredicate('a && b');
    const [mutant] = generateSpecMutants(parsed, ['LRO']);
    const tests = buildAssignmentSpace(parsed.clauses);
    const [evaluated] = evaluateSpecMutants(parsed, [mutant], tests);
    const flippedSet = flippedKeysFromKillers(evaluated.killers, parsed.clauses);
    const svg = renderMonitorSvg({ ast: mutant.ast, clauses: parsed.clauses, title: 'mutant', flippedSet });
    expect(svg).toContain('<svg');
    expect(svg).toContain('SAFE');
    expect(svg).toContain('VIOLATION');
    // The forward (SAFE -> VIOLATION) transition carries killer assignments.
    expect(svg).toContain('spec-fsm-edge killer');
  });

  it('renders an empty placeholder when no clauses are present', () => {
    const html = renderMonitorSvg({ ast: null, clauses: [], title: 'x' });
    expect(html).toContain('spec-fsm-empty');
  });
});
