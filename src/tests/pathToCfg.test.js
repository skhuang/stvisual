import { describe, it, expect } from 'vitest';
import { mapBranchesToCfg } from '../utils/pathToCfg.js';
import { generateControlFlowGraphFromProgram } from '../utils/programToGraph.js';
import { symbolicExecute } from '../utils/symbolicExecution.js';
import { concolicExecute } from '../utils/concolicExecution.js';

const ABS = `function abs(x) {
  if (x < 0) {
    return -x;
  }
  return x;
}
`;

const TRIANGLE = `function classify(a, b, c) {
  if (a <= 0 || b <= 0 || c <= 0) {
    return 0;
  }
  if (a + b <= c || a + c <= b || b + c <= a) {
    return 0;
  }
  if (a == b && b == c) {
    return 3;
  }
  if (a == b || b == c || a == c) {
    return 2;
  }
  return 1;
}
`;

const SUM = `function sumN(n) {
  let s = 0;
  let i = 0;
  while (i < n) {
    s = s + i;
    i = i + 1;
  }
  return s;
}
`;

describe('mapBranchesToCfg', () => {
  it('maps both branches of an if-statement to the correct CFG edges', () => {
    const cfg = generateControlFlowGraphFromProgram({ sourceCode: ABS, language: 'javascript' });
    const decision = cfg.nodes.find((n) => n.kind === 'decision');
    const outs = cfg.edges.filter((e) => e.from === decision.id);
    expect(outs).toHaveLength(2);

    const taken = mapBranchesToCfg(cfg, [{ taken: true }]);
    const notTaken = mapBranchesToCfg(cfg, [{ taken: false }]);

    expect(taken.edges).toContain(outs[0].id);
    expect(notTaken.edges).toContain(outs[1].id);
    expect(taken.nodes).toContain('S');
    expect(taken.nodes).toContain(cfg.endNodeId);
    expect(notTaken.nodes).toContain(cfg.endNodeId);
    expect(taken.unresolved).toBe(0);
    expect(notTaken.unresolved).toBe(0);
  });

  it('covers every CFG decision node across the symbolic paths of triangle', () => {
    const cfg = generateControlFlowGraphFromProgram({ sourceCode: TRIANGLE, language: 'javascript' });
    const result = symbolicExecute(TRIANGLE, { maxLoopUnroll: 0 });
    const decisionNodes = cfg.nodes.filter((n) => n.kind === 'decision').map((n) => n.id);

    const seenDecisions = new Set();
    for (const path of result.paths) {
      const mapping = mapBranchesToCfg(cfg, path.branches);
      mapping.decisions.forEach((d) => seenDecisions.add(d.nodeId));
      expect(mapping.nodes).toContain(cfg.endNodeId);
      expect(mapping.unresolved).toBe(0);
    }
    for (const id of decisionNodes) expect(seenDecisions.has(id)).toBe(true);
  });

  it('walks loop iterations as repeated visits to the loop-head decision', () => {
    const cfg = generateControlFlowGraphFromProgram({ sourceCode: SUM, language: 'javascript' });
    const result = symbolicExecute(SUM, { maxLoopUnroll: 3 });
    const twoIters = result.paths.find((p) => p.branches.filter((b) => b.taken).length === 2);
    expect(twoIters).toBeDefined();
    const mapping = mapBranchesToCfg(cfg, twoIters.branches);
    const loopHeadId = cfg.nodes.find((n) => n.kind === 'decision').id;
    expect(mapping.nodes).toContain(loopHeadId);
    expect(mapping.unresolved).toBe(0);
    expect(mapping.decisions.filter((d) => d.taken)).toHaveLength(2);
    expect(mapping.decisions.filter((d) => !d.taken)).toHaveLength(1);
  });

  it('maps a concolic iteration onto the CFG end-to-end', () => {
    const cfg = generateControlFlowGraphFromProgram({ sourceCode: TRIANGLE, language: 'javascript' });
    const result = concolicExecute(TRIANGLE, { initialInputs: { a: 1, b: 1, c: 1 }, maxIterations: 16 });
    for (const it of result.iterations) {
      const mapping = mapBranchesToCfg(cfg, it.branches);
      expect(mapping.nodes).toContain(cfg.endNodeId);
      expect(mapping.unresolved).toBe(0);
    }
  });
});
