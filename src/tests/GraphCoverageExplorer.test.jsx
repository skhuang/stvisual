import { describe, expect, it } from 'vitest';
import { createGraphCoverageExplorer } from '../components/GraphCoverageExplorer.js';

function renderGraphCoverageExplorer() {
  document.body.innerHTML = '';
  const element = createGraphCoverageExplorer();
  document.body.appendChild(element);
}

describe('GraphCoverageExplorer', () => {
  it('預設顯示 node coverage requirements', () => {
    renderGraphCoverageExplorer();
    expect(document.querySelector('[data-testid="graph-coverage-explorer"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="requirement-list"]').children).toHaveLength(8);
    expect(document.querySelector('[data-testid="selected-requirement-summary"]')).toHaveTextContent('Node Start');
  });

  it('切換到 edge coverage 後顯示 10 個 requirement', () => {
    renderGraphCoverageExplorer();
    document.querySelector('[data-testid="criterion-edge"]').click();
    expect(document.querySelector('[data-testid="requirement-list"]').children).toHaveLength(10);
    expect(document.querySelector('[data-testid="selected-requirement-summary"]')).toHaveTextContent('Edge S -> A');
  });

  it('切換到 prime path coverage 後顯示 prime path requirement', () => {
    renderGraphCoverageExplorer();
    document.querySelector('[data-testid="criterion-prime-path"]').click();
    expect(document.querySelector('[data-testid="requirement-list"]')).toHaveTextContent('B -> D -> E -> B');
  });

  it('切換到 edge-pair coverage 後顯示邊對 requirement', () => {
    renderGraphCoverageExplorer();
    document.querySelector('[data-testid="criterion-edge-pair"]').click();
    expect(document.querySelector('[data-testid="requirement-list"]')).toHaveTextContent('S -> A -> B');
  });

  it('切換到 complete path coverage 後顯示完整路徑 requirement', () => {
    renderGraphCoverageExplorer();
    document.querySelector('[data-testid="criterion-complete-path"]').click();
    expect(document.querySelector('[data-testid="requirement-list"]')).toHaveTextContent('S -> A -> B -> D -> E -> T');
  });

  it('點擊 requirement 會更新 detail 區塊', () => {
    renderGraphCoverageExplorer();
    document.querySelector('[data-testid="criterion-edge"]').click();
    document.querySelector('[data-testid="requirement-edge-E-B"]').click();
    expect(document.querySelector('[data-testid="detail-nodes"]')).toHaveTextContent('E -> B');
    expect(document.querySelector('[data-testid="detail-edges"]')).toHaveTextContent('E-B');
  });

  it('渲染所有 graph nodes', () => {
    renderGraphCoverageExplorer();
    ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'T'].forEach((nodeId) => {
      expect(document.querySelector(`[data-testid="graph-node-${nodeId}"]`)).toBeInTheDocument();
    });
  });

  it('會顯示根據 requirements 產生的 test paths', () => {
    renderGraphCoverageExplorer();
    expect(document.querySelector('[data-testid="graph-test-path-card"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="test-path-list"]')).toHaveTextContent('S -> A');
    expect(document.querySelector('[data-testid="test-path-metrics"]')).toBeInTheDocument();
    expect(Number(document.querySelector('[data-testid="baseline-path-count"]').textContent)).toBeGreaterThan(0);
    expect(Number(document.querySelector('[data-testid="optimized-path-count"]').textContent)).toBeGreaterThan(0);
    expect(Number(document.querySelector('[data-testid="saved-path-count"]').textContent)).toBeGreaterThanOrEqual(0);
  });

  it('編輯 graph 會即時計算 requirement', async () => {
    renderGraphCoverageExplorer();

    const nodesInput = document.querySelector('[data-testid="graph-nodes-input"]');
    const edgesInput = document.querySelector('[data-testid="graph-edges-input"]');
    const startInput = document.querySelector('[data-testid="graph-start-input"]');
    const endInput = document.querySelector('[data-testid="graph-end-input"]');

    nodesInput.value = 'S,Start,80,170\nA,A,220,170\nT,End,360,170';
    nodesInput.dispatchEvent(new Event('input', { bubbles: true }));

    edgesInput.value = 'S-A,S,A\nA-T,A,T';
    edgesInput.dispatchEvent(new Event('input', { bubbles: true }));

    startInput.value = 'S';
    startInput.dispatchEvent(new Event('input', { bubbles: true }));

    endInput.value = 'T';
    endInput.dispatchEvent(new Event('input', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(document.querySelector('[data-testid="graph-editor-status"]')).toHaveTextContent('Graph 已同步更新');
    expect(document.querySelector('[data-testid="requirement-list"]').children).toHaveLength(3);
  });
});
