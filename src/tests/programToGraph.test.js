import { describe, expect, it } from 'vitest';
import { generateControlFlowGraphFromProgram } from '../utils/programToGraph.js';

describe('generateControlFlowGraphFromProgram', () => {
  it('converts JavaScript if/return flow into a simplified CFG', () => {
    const graph = generateControlFlowGraphFromProgram({
      language: 'javascript',
      title: 'Triangle',
      sourceCode: `function classifyTriangle(a, b, c) {
  if (a <= 0 || b <= 0 || c <= 0) {
    return 'invalid';
  }

  return 'valid';
}`,
    });

    expect(graph.startNodeId).toBe('S');
    expect(graph.endNodeId).toBe('T');
    expect(graph.nodes.some((node) => node.label.includes('a <= 0'))).toBe(true);
    expect(graph.nodes.some((node) => node.label.includes('return'))).toBe(true);
    expect(graph.edges.length).toBeGreaterThan(3);
  });

  it('converts pseudocode into a simplified CFG', () => {
    const graph = generateControlFlowGraphFromProgram({
      language: 'pseudocode',
      title: 'Pseudo Demo',
      sourceCode: `FUNCTION NextStep
IF valid THEN
  RETURN approved
ELSE
  RETURN rejected
END IF`,
    });

    expect(graph.nodes.some((node) => node.label.includes('valid'))).toBe(true);
    expect(graph.nodes.filter((node) => node.label.includes('RETURN')).length).toBe(2);
  });

  it('throws on unsupported language', () => {
    expect(() => generateControlFlowGraphFromProgram({
      language: 'python',
      title: 'Unsupported',
      sourceCode: 'print(1)',
    })).toThrow('目前不支援 python 的自動 CFG 產生。');
  });
});