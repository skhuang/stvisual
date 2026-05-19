import { describe, expect, it } from 'vitest';
import { initialTddState, legalActions, applyAction } from '../utils/tddRules.js';

describe('tddRules', () => {
  it('starts in the start phase with no failing test', () => {
    const s = initialTddState();
    expect(s.phase).toBe('start');
    expect(s.hasFailingTest).toBe(false);
    expect(s.allGreen).toBe(true);
    expect(s.cycleCount).toBe(0);
  });

  it('only allows writing a failing test from the start', () => {
    expect([...legalActions(initialTddState())]).toEqual(['write-failing-test']);
  });

  it('write-failing-test goes RED', () => {
    const { state, blocked } = applyAction(initialTddState(), 'write-failing-test');
    expect(blocked).toBe(false);
    expect(state.phase).toBe('red');
    expect(state.hasFailingTest).toBe(true);
    expect(state.allGreen).toBe(false);
  });

  it('blocks production code when no test is failing', () => {
    const r = applyAction(initialTddState(), 'write-production-code');
    expect(r.blocked).toBe(true);
    expect(r.reasonKey).toBe('tdd.rules.reason.noRed');
    expect(r.state).toEqual(initialTddState());
  });

  it('blocks a second failing test while one is still red', () => {
    const red = applyAction(initialTddState(), 'write-failing-test').state;
    const r = applyAction(red, 'write-failing-test');
    expect(r.blocked).toBe(true);
    expect(r.reasonKey).toBe('tdd.rules.reason.alreadyRed');
  });

  it('write-production-code goes GREEN and counts a cycle', () => {
    const red = applyAction(initialTddState(), 'write-failing-test').state;
    const { state, blocked } = applyAction(red, 'write-production-code');
    expect(blocked).toBe(false);
    expect(state.phase).toBe('green');
    expect(state.hasFailingTest).toBe(false);
    expect(state.allGreen).toBe(true);
    expect(state.cycleCount).toBe(1);
  });

  it('blocks refactor while a test is failing', () => {
    const red = applyAction(initialTddState(), 'write-failing-test').state;
    const r = applyAction(red, 'refactor');
    expect(r.blocked).toBe(true);
    expect(r.reasonKey).toBe('tdd.rules.reason.notGreen');
  });

  it('blocks refactor at the very start (nothing built yet)', () => {
    const r = applyAction(initialTddState(), 'refactor');
    expect(r.blocked).toBe(true);
    expect(r.reasonKey).toBe('tdd.rules.reason.nothingYet');
  });

  it('allows refactor once green', () => {
    let s = applyAction(initialTddState(), 'write-failing-test').state;
    s = applyAction(s, 'write-production-code').state;
    const { state, blocked } = applyAction(s, 'refactor');
    expect(blocked).toBe(false);
    expect(state.phase).toBe('refactor');
  });

  it('an unknown action is blocked without changing state', () => {
    const r = applyAction(initialTddState(), 'nope');
    expect(r.blocked).toBe(true);
    expect(r.reasonKey).toBe('tdd.rules.reason.unknown');
    expect(r.state).toEqual(initialTddState());
  });
});
