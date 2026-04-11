import { describe, expect, it } from 'vitest';
import { graphCoverageGraph } from '../data/testingData';
import {
  enumerateSimplePaths,
  getCoverageRequirements,
  getEdgeRequirements,
  getNodeRequirements,
  getPrimePathRequirements,
  getPrimePaths,
} from '../utils/graphCoverage';

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
  });
});
