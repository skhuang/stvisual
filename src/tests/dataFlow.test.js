import { describe, it, expect } from 'vitest';
import { extractDefUse, buildDataFlowGraph } from '../utils/dataFlow.js';
import { generateControlFlowGraphFromProgram } from '../utils/programToGraph.js';

describe('extractDefUse', () => {
  it('treats LHS of an assignment as def and RHS as use', () => {
    const { defs, uses } = extractDefUse({ sourceText: 'sum = a + b' });
    expect([...defs]).toEqual(['sum']);
    expect([...uses].sort()).toEqual(['a', 'b']);
  });

  it('handles let / const / var', () => {
    const { defs, uses } = extractDefUse({ sourceText: 'let i = n - 1' });
    expect([...defs]).toEqual(['i']);
    expect([...uses]).toEqual(['n']);
  });

  it('handles compound assignment', () => {
    const { defs, uses } = extractDefUse({ sourceText: 'count += step' });
    expect([...defs]).toEqual(['count']);
    expect([...uses].sort()).toEqual(['count', 'step']);
  });

  it('handles ++/--', () => {
    const { defs, uses } = extractDefUse({ sourceText: 'i++' });
    expect([...defs]).toEqual(['i']);
    expect([...uses]).toEqual(['i']);
  });

  it('treats function-header parameters as defs', () => {
    const { defs } = extractDefUse({ sourceText: 'function add(a, b) {' });
    expect([...defs].sort()).toEqual(['a', 'b']);
  });

  it('treats for-init as def, condition/update as use+def', () => {
    const { defs, uses } = extractDefUse({ sourceText: 'for (let i = 0; i < n; i++) {' });
    expect([...defs].sort()).toEqual(['i']);
    expect([...uses].sort()).toEqual(['i', 'n']);
  });

  it('treats a bare condition as pure uses', () => {
    const { defs, uses } = extractDefUse({ sourceText: 'if (a > b)' });
    expect(defs.size).toBe(0);
    expect([...uses].sort()).toEqual(['a', 'b']);
  });
});

describe('buildDataFlowGraph', () => {
  it('produces a def→use edge along a straight CFG', () => {
    const cfg = {
      nodes: [
        { id: 'n1', sourceText: 'a = 1' },
        { id: 'n2', sourceText: 'b = a + 2' },
      ],
      edges: [{ id: 'e1', from: 'n1', to: 'n2' }],
    };
    const dfg = buildDataFlowGraph(cfg);
    expect(dfg.edges).toHaveLength(1);
    expect(dfg.edges[0]).toMatchObject({ from: 'n1', to: 'n2', variable: 'a' });
  });

  it('a redefinition kills earlier defs (definition-clear paths only)', () => {
    const cfg = {
      nodes: [
        { id: 'n1', sourceText: 'x = 1' },
        { id: 'n2', sourceText: 'x = 2' },
        { id: 'n3', sourceText: 'y = x + 1' },
      ],
      edges: [
        { id: 'e1', from: 'n1', to: 'n2' },
        { id: 'e2', from: 'n2', to: 'n3' },
      ],
    };
    const dfg = buildDataFlowGraph(cfg);
    // Only n2 → n3 should remain for x; n1 → n3 is killed by n2.
    const xEdges = dfg.edges.filter((e) => e.variable === 'x');
    expect(xEdges).toHaveLength(1);
    expect(xEdges[0]).toMatchObject({ from: 'n2', to: 'n3' });
  });

  it('integrates with programToGraph for a small JS function', () => {
    const cfg = generateControlFlowGraphFromProgram({
      sourceCode: [
        'function f(n) {',
        '  let s = 0;',
        '  for (let i = 0; i < n; i++) {',
        '    s = s + i;',
        '  }',
        '  return s;',
        '}',
      ].join('\n'),
      language: 'javascript',
      title: 'f',
    });
    const dfg = buildDataFlowGraph(cfg);
    // We expect at least one edge for `s` and one for `i` reaching the body / return.
    expect(dfg.edges.some((e) => e.variable === 's')).toBe(true);
    expect(dfg.edges.some((e) => e.variable === 'i')).toBe(true);
  });
});
