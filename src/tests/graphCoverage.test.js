import { describe, expect, it } from 'vitest';
import { graphCoverageGraph } from '../data/testingData';
import {
  buildTestPathSetForRequirements,
  enumerateSimplePaths,
  getCoverageRequirements,
  getCompletePathRequirements,
  getEdgePairRequirements,
  getEdgeRequirements,
  getNodeRequirements,
  getPrimePathRequirements,
  generateTestPaths,
  getPrimePaths,
} from '../utils/graphCoverage';

function naivePathCountForRequirements(graph, requirements) {
  const plan = buildTestPathSetForRequirements(graph, requirements, { optimization: 'none' });
  const unique = new Set(
    plan.requirementPaths
      .filter((entry) => entry.covered)
      .map((entry) => entry.path.join('->'))
  );

  return unique.size;
}

describe('graphCoverage utilities', () => {
  it('node coverage 產生每個節點一個 requirement', () => {
    const requirements = getNodeRequirements(graphCoverageGraph);
    expect(requirements).toHaveLength(8);
    expect(requirements.map((item) => item.displayText)).toEqual(['Start', 'A', 'B', 'C', 'D', 'E', 'F', 'End']);
  });

  it('edge coverage 產生每條邊一個 requirement', () => {
    const requirements = getEdgeRequirements(graphCoverageGraph);
    expect(requirements).toHaveLength(10);
    expect(requirements.map((item) => item.displayText)).toContain('E -> B');
  });

  it('能列舉圖中的 simple paths', () => {
    const paths = enumerateSimplePaths(graphCoverageGraph).map((path) => path.join('->'));
    expect(paths).toContain('S->A');
    expect(paths).toContain('S->A->B->D->F->T');
    expect(paths).toContain('B->D->E->B');
  });

  it('prime paths 包含迴圈與最大簡單路徑', () => {
    const paths = getPrimePaths(graphCoverageGraph).map((path) => path.join('->'));
    expect(paths).toContain('B->D->E->B');
    expect(paths).toContain('S->A->B->D->E->T');
    expect(paths).toContain('S->A->C->D->F->T');
    expect(paths).toContain('E->B->D->F->T');
  });

  it('prime path requirements 轉成對應節點與邊', () => {
    const requirements = getPrimePathRequirements(graphCoverageGraph);
    const loopRequirement = requirements.find((item) => item.displayText === 'B -> D -> E -> B');
    expect(loopRequirement.edges).toEqual(['B-D', 'D-E', 'E-B']);
    expect(loopRequirement.nodes).toEqual(['B', 'D', 'E']);
  });

  it('getCoverageRequirements 可依 criterion 切換結果', () => {
    expect(getCoverageRequirements(graphCoverageGraph, 'node')).toHaveLength(8);
    expect(getCoverageRequirements(graphCoverageGraph, 'edge')).toHaveLength(10);
    expect(getCoverageRequirements(graphCoverageGraph, 'prime-path').length).toBeGreaterThan(0);
    expect(getCoverageRequirements(graphCoverageGraph, 'edge-pair').length).toBeGreaterThan(0);
    expect(getCoverageRequirements(graphCoverageGraph, 'complete-path').length).toBeGreaterThan(0);
  });

  it('edge-pair requirements 包含連續兩邊', () => {
    const requirements = getEdgePairRequirements(graphCoverageGraph);
    expect(requirements.map((item) => item.displayText)).toContain('S -> A -> B');
    expect(requirements.map((item) => item.displayText)).toContain('D -> E -> B');
  });

  it('complete path requirements 來自 start 到 end 的完整路徑', () => {
    const requirements = getCompletePathRequirements(graphCoverageGraph);
    expect(requirements.map((item) => item.displayText)).toContain('S -> A -> B -> D -> E -> T');
    expect(requirements.map((item) => item.displayText)).toContain('S -> A -> C -> D -> F -> T');
  });

  it('generateTestPaths 會產生 start 到 end 的候選路徑', () => {
    const paths = generateTestPaths(graphCoverageGraph).map((path) => path.join('->'));
    expect(paths).toContain('S->A->B->D->F->T');
    expect(paths).toContain('S->A->C->D->F->T');
  });

  it('可將 requirements 組合成測試路徑集合', () => {
    const requirements = getCoverageRequirements(graphCoverageGraph, 'edge-pair');
    const plan = buildTestPathSetForRequirements(graphCoverageGraph, requirements);

    expect(plan.selectedPaths.length).toBeGreaterThan(0);
    expect(plan.requirementPaths.length).toBe(requirements.length);
    expect(plan.uncoveredRequirements).toHaveLength(0);
  });

  it('使用 set-cover 近似可得到更精簡或等量路徑集合', () => {
    const requirements = getCoverageRequirements(graphCoverageGraph, 'edge-pair');
    const optimized = buildTestPathSetForRequirements(graphCoverageGraph, requirements);
    const naiveCount = naivePathCountForRequirements(graphCoverageGraph, requirements);

    expect(optimized.uncoveredRequirements).toHaveLength(0);
    expect(optimized.selectedPaths.length).toBeLessThanOrEqual(naiveCount);
  });

  it('set-cover 產生的路徑集合可覆蓋所有 complete-path requirements', () => {
    const requirements = getCoverageRequirements(graphCoverageGraph, 'complete-path');
    const plan = buildTestPathSetForRequirements(graphCoverageGraph, requirements);

    expect(plan.selectedPaths.length).toBeGreaterThan(0);
    expect(plan.uncoveredRequirements).toHaveLength(0);
  });
});
