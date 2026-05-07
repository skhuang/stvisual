import { describe, expect, it } from 'vitest';
import {
  buildTestPathSetForRequirements,
  getAllDefsRequirements,
  getAllDuPathsRequirements,
  getAllUsesRequirements,
  getCoverageRequirements,
} from '../utils/graphCoverage.js';
import { generateControlFlowGraphFromProgram } from '../utils/programToGraph.js';

const sumProgram = `function sum(n) {
  let total = 0;
  let i = 1;
  while (i <= n) {
    total = total + i;
    i = i + 1;
  }
  return total;
}`;

function buildSumGraph() {
  return generateControlFlowGraphFromProgram({
    sourceCode: sumProgram,
    language: 'javascript',
  });
}

describe('data flow coverage', () => {
  const graph = buildSumGraph();

  it('All-Defs 對每個 (節點, 變數) 定義產生一個 requirement', () => {
    const reqs = getAllDefsRequirements(graph);
    expect(reqs.length).toBeGreaterThan(0);
    reqs.forEach((req) => {
      expect(req.type).toBe('all-defs');
      expect(req.path[0]).toBe(req.defNodeId);
      expect(req.path[req.path.length - 1]).toBe(req.useNodeId);
      expect(req.variable).toBeTruthy();
    });
  });

  it('All-Uses 至少包含 i 與 total 的 def-use 對', () => {
    const reqs = getAllUsesRequirements(graph);
    const variables = new Set(reqs.map((r) => r.variable));
    expect(variables.has('i')).toBe(true);
    expect(variables.has('total')).toBe(true);
  });

  it('All-DU-Paths 數量 >= All-Uses 數量 (每對至少一條路徑)', () => {
    const uses = getAllUsesRequirements(graph);
    const duPaths = getAllDuPathsRequirements(graph);
    expect(duPaths.length).toBeGreaterThanOrEqual(uses.length);
    duPaths.forEach((req) => {
      expect(req.type).toBe('all-du-paths');
      expect(req.path.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('getCoverageRequirements 支援 all-defs / all-uses / all-du-paths', () => {
    expect(getCoverageRequirements(graph, 'all-defs').length).toBeGreaterThan(0);
    expect(getCoverageRequirements(graph, 'all-uses').length).toBeGreaterThan(0);
    expect(getCoverageRequirements(graph, 'all-du-paths').length).toBeGreaterThan(0);
  });

  it('All-Uses 的測試路徑集合可覆蓋大多數 requirements', () => {
    const reqs = getAllUsesRequirements(graph);
    const plan = buildTestPathSetForRequirements(graph, reqs);
    expect(plan.selectedPaths.length).toBeGreaterThan(0);
    expect(plan.uncoveredRequirements.length).toBeLessThan(reqs.length);
  });

  it('函式參數視為入口節點的 def', () => {
    const reqs = getAllDefsRequirements(graph);
    const variables = new Set(reqs.map((r) => r.variable));
    // sum(n) — parameter `n` should appear as a definition
    expect(variables.has('n')).toBe(true);
  });

  it('沒有 sourceText 的 graph 回傳空 requirements', () => {
    const plain = {
      startNodeId: 'A',
      endNodeId: 'B',
      nodes: [
        { id: 'A', label: 'A' },
        { id: 'B', label: 'B' },
      ],
      edges: [{ id: 'A-B', from: 'A', to: 'B' }],
    };
    expect(getAllDefsRequirements(plain)).toHaveLength(0);
    expect(getAllUsesRequirements(plain)).toHaveLength(0);
    expect(getAllDuPathsRequirements(plain)).toHaveLength(0);
  });
});
