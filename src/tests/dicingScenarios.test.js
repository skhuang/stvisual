import { describe, expect, it } from 'vitest';
import { DICING_SCENARIOS, getDicingScenario } from '../data/dicingScenarios.js';
import { backwardSlice, dynamicSlice, programDice } from '../utils/slicing.js';

describe('dicingScenarios integrity', () => {
  it('has the two scenarios, each with a unique id', () => {
    expect(DICING_SCENARIOS.map((s) => s.id).sort())
      .toEqual(['fare', 'summary-stats']);
  });

  it('getDicingScenario finds by id and returns null for an unknown id', () => {
    expect(getDicingScenario('fare')?.id).toBe('fare');
    expect(getDicingScenario('nope')).toBeNull();
  });

  it('every dependence edge and trace step references a real statement id', () => {
    for (const sc of DICING_SCENARIOS) {
      const ids = new Set(sc.statements.map((s) => s.id));
      for (const [from, to] of sc.controlDeps) {
        expect(ids.has(from), `${sc.id} ctrl ${from}`).toBe(true);
        expect(ids.has(to), `${sc.id} ctrl ${to}`).toBe(true);
      }
      for (const [from, to, v] of sc.dataDeps) {
        expect(ids.has(from), `${sc.id} data ${from}`).toBe(true);
        expect(ids.has(to), `${sc.id} data ${to}`).toBe(true);
        expect(typeof v).toBe('string');
      }
      for (const tr of sc.traces || []) {
        for (const sid of tr.steps) {
          expect(ids.has(sid), `${sc.id} trace ${tr.id} step ${sid}`).toBe(true);
        }
      }
    }
  });

  it('static scenario summary-stats: outputs valid and the dice catches the bug', () => {
    const sc = getDicingScenario('summary-stats');
    expect(sc.mode).toBe('static');
    const ids = new Set(sc.statements.map((s) => s.id));
    for (const o of sc.outputs) expect(ids.has(o.stmtId)).toBe(true);
    expect(sc.outputs.some((o) => o.variable === sc.wrongOutput)).toBe(true);
    const wrong = sc.outputs.find((o) => o.variable === sc.wrongOutput);
    const failing = backwardSlice(sc, { stmtId: wrong.stmtId, variable: wrong.variable });
    const passing = sc.outputs
      .filter((o) => o.variable !== sc.wrongOutput)
      .map((o) => backwardSlice(sc, { stmtId: o.stmtId, variable: o.variable }));
    const dice = programDice(failing, passing);
    expect(dice.has(sc.bug.stmtId), 'bug in dice').toBe(true);
  });

  it('dynamic scenario fare: exactly one failing trace and the dice catches the bug', () => {
    const sc = getDicingScenario('fare');
    expect(sc.mode).toBe('dynamic');
    const failTraces = sc.traces.filter((tr) => tr.outcome === 'fail');
    expect(failTraces).toHaveLength(1);
    const failing = dynamicSlice(sc, failTraces[0], sc.criterion);
    const passing = sc.traces
      .filter((tr) => tr.outcome === 'pass')
      .map((tr) => dynamicSlice(sc, tr, sc.criterion));
    const dice = programDice(failing, passing);
    expect(dice.has(sc.bug.stmtId), 'bug in dice').toBe(true);
  });
});
