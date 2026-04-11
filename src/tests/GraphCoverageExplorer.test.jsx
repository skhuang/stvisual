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

  it('可載入固定程式範例', () => {
    renderGraphCoverageExplorer();

    const select = document.querySelector('[data-testid="program-example-select"]');
    select.value = 'triangle-problem';
    select.dispatchEvent(new Event('change', { bubbles: true }));

    expect(document.querySelector('[data-testid="program-source-name"]')).toHaveTextContent('Triangle Problem');
    expect(document.querySelector('[data-testid="program-source-code"]')).toHaveTextContent('classifyTriangle');
    expect(document.querySelector('[data-testid="selected-requirement-summary"]')).toHaveTextContent('Node Start');
  });

  it('可載入新增的經典程式範例', () => {
    renderGraphCoverageExplorer();

    const select = document.querySelector('[data-testid="program-example-select"]');
    select.value = 'commission-problem';
    select.dispatchEvent(new Event('change', { bubbles: true }));

    expect(document.querySelector('[data-testid="program-source-name"]')).toHaveTextContent('Commission Problem');
    expect(document.querySelector('[data-testid="program-source-code"]')).toHaveTextContent('function commission');
    expect(document.querySelector('[data-testid="requirement-list"]').children.length).toBeGreaterThan(3);
  });

  it('會顯示 requirement 對應的程式碼行號映射', () => {
    renderGraphCoverageExplorer();

    const select = document.querySelector('[data-testid="program-example-select"]');
    select.value = 'calendar-days';
    select.dispatchEvent(new Event('change', { bubbles: true }));

    document.querySelectorAll('[data-requirement-id]')[1].click();

    expect(document.querySelector('[data-testid="program-source-line-2"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="detail-source-mapping"]')).toHaveTextContent('L2');
  });

  it('可上傳 graph JSON spec', async () => {
    renderGraphCoverageExplorer();

    const uploadInput = document.querySelector('[data-testid="graph-upload-input"]');
    const file = {
      name: 'demo-graph.json',
      text: async () => JSON.stringify({
        title: 'Uploaded Demo Graph',
        description: 'Small uploaded CFG.',
        sourceCode: 'function demo() { return true; }',
        graph: {
          startNodeId: 'S',
          endNodeId: 'T',
          nodes: [
            { id: 'S', label: 'Start', x: 80, y: 170 },
            { id: 'A', label: 'A', x: 220, y: 170 },
            { id: 'T', label: 'End', x: 360, y: 170 },
          ],
          edges: [
            { id: 'S-A', from: 'S', to: 'A' },
            { id: 'A-T', from: 'A', to: 'T' },
          ],
        },
      }),
    };

    Object.defineProperty(uploadInput, 'files', {
      configurable: true,
      value: [file],
    });

    uploadInput.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.querySelector('[data-testid="program-source-name"]')).toHaveTextContent('Uploaded Demo Graph');
    expect(document.querySelector('[data-testid="program-source-code"]')).toHaveTextContent('function demo()');
    expect(document.querySelector('[data-testid="graph-source-status"]')).toHaveTextContent('已載入上傳檔案：demo-graph.json');
    expect(document.querySelector('[data-testid="requirement-list"]').children).toHaveLength(3);
  });

  it('可上傳程式碼並自動產生簡化 CFG', async () => {
    renderGraphCoverageExplorer();

    const languageSelect = document.querySelector('[data-testid="program-language-select"]');
    languageSelect.value = 'javascript';
    languageSelect.dispatchEvent(new Event('change', { bubbles: true }));

    const uploadInput = document.querySelector('[data-testid="code-upload-input"]');
    const file = {
      name: 'triangle.js',
      text: async () => `function classifyTriangle(a, b, c) {
  if (a <= 0 || b <= 0 || c <= 0) {
    return 'invalid';
  }

  return 'valid';
}`,
    };

    Object.defineProperty(uploadInput, 'files', {
      configurable: true,
      value: [file],
    });

    uploadInput.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    document.querySelectorAll('[data-requirement-id]')[1].click();

    expect(document.querySelector('[data-testid="program-source-name"]')).toHaveTextContent('triangle');
    expect(document.querySelector('[data-testid="graph-source-status"]')).toHaveTextContent('已根據 triangle.js 自動產生簡化 CFG。');
    expect(document.querySelector('[data-testid="program-source-code"]')).toHaveTextContent('classifyTriangle');
    expect(document.querySelector('[data-testid="requirement-list"]').children.length).toBeGreaterThan(3);
    expect(document.querySelector('[data-testid="detail-source-mapping"]')).toHaveTextContent('L2');
  });
});
