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
});
