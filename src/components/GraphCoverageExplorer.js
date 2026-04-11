import {
  graphCoverageCodeLanguages,
  graphCoverageCriteria,
  graphCoverageGraph,
  graphCoverageProgramExamples,
} from '../data/testingData.js';
import { buildTestPathSetForRequirements, getCoverageRequirements } from '../utils/graphCoverage.js';
import { generateControlFlowGraphFromProgram } from '../utils/programToGraph.js';

function cloneGraph(graph) {
  return {
    ...graph,
    nodes: graph.nodes.map((node) => ({ ...node })),
    edges: graph.edges.map((edge) => ({
      ...edge,
      control: edge.control ? { ...edge.control } : undefined,
    })),
  };
}

function escapeHtml(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function createDraftFromGraph(graph) {
  return {
    nodesText: serializeNodes(graph.nodes),
    edgesText: serializeEdges(graph.edges),
    startNodeId: graph.startNodeId,
    endNodeId: graph.endNodeId,
  };
}

function serializeNodes(nodes) {
  return nodes.map((node) => `${node.id},${node.label},${node.x},${node.y}`).join('\n');
}

function serializeEdges(edges) {
  return edges
    .map((edge) => {
      if (edge.control?.x !== undefined && edge.control?.y !== undefined) {
        return `${edge.id},${edge.from},${edge.to},${edge.control.x},${edge.control.y}`;
      }

      return `${edge.id},${edge.from},${edge.to}`;
    })
    .join('\n');
}

function parseNodesText(nodesText) {
  const rows = nodesText.split('\n').map((item) => item.trim()).filter(Boolean);

  if (!rows.length) {
    throw new Error('節點不能為空。');
  }

  return rows.map((row, index) => {
    const [id, label, x, y] = row.split(',').map((item) => item.trim());

    if (!id || !label || x === undefined || y === undefined) {
      throw new Error(`節點格式錯誤（第 ${index + 1} 行），請使用 id,label,x,y。`);
    }

    const parsedX = Number(x);
    const parsedY = Number(y);

    if (!Number.isFinite(parsedX) || !Number.isFinite(parsedY)) {
      throw new Error(`節點座標格式錯誤（第 ${index + 1} 行），x,y 必須是數字。`);
    }

    return { id, label, x: parsedX, y: parsedY, kind: 'node' };
  });
}

function parseEdgesText(edgesText, nodeIds) {
  const rows = edgesText.split('\n').map((item) => item.trim()).filter(Boolean);

  if (!rows.length) {
    throw new Error('邊不能為空。');
  }

  return rows.map((row, index) => {
    const cols = row.split(',').map((item) => item.trim());

    let id;
    let from;
    let to;
    let controlX;
    let controlY;

    if (cols.length === 2) {
      [from, to] = cols;
      id = `${from}-${to}`;
    } else if (cols.length === 3) {
      [id, from, to] = cols;
    } else if (cols.length === 5) {
      [id, from, to, controlX, controlY] = cols;
    } else {
      throw new Error(`邊格式錯誤（第 ${index + 1} 行），請使用 from,to 或 id,from,to 或 id,from,to,cx,cy。`);
    }

    if (!from || !to) {
      throw new Error(`邊格式錯誤（第 ${index + 1} 行），缺少 from/to。`);
    }

    if (!nodeIds.has(from) || !nodeIds.has(to)) {
      throw new Error(`邊節點不存在（第 ${index + 1} 行）：${from} -> ${to}`);
    }

    if (controlX !== undefined && controlY !== undefined) {
      const cx = Number(controlX);
      const cy = Number(controlY);

      if (!Number.isFinite(cx) || !Number.isFinite(cy)) {
        throw new Error(`邊控制點格式錯誤（第 ${index + 1} 行），cx,cy 必須是數字。`);
      }

      return { id, from, to, control: { x: cx, y: cy } };
    }

    return { id, from, to };
  });
}

function parseGraphDraft({ nodesText, edgesText, startNodeId, endNodeId }) {
  const nodes = parseNodesText(nodesText);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = parseEdgesText(edgesText, nodeIds);

  if (!nodeIds.has(startNodeId)) {
    throw new Error('Start node 不存在於節點清單。');
  }

  if (!nodeIds.has(endNodeId)) {
    throw new Error('End node 不存在於節點清單。');
  }

  return {
    id: 'custom-graph',
    title: '自訂控制流程圖',
    nodes,
    edges,
    startNodeId,
    endNodeId,
  };
}

function parseUploadedGraphSpec(rawText) {
  let payload;

  try {
    payload = JSON.parse(rawText);
  } catch {
    throw new Error('上傳內容不是有效的 JSON。');
  }

  const graphPayload = payload.graph || payload;

  if (!graphPayload || !Array.isArray(graphPayload.nodes) || !Array.isArray(graphPayload.edges)) {
    throw new Error('JSON 需包含 graph 物件，或直接包含 nodes / edges / startNodeId / endNodeId。');
  }

  const graph = {
    ...graphPayload,
    id: graphPayload.id || payload.id || 'uploaded-graph',
    title: graphPayload.title || payload.title || 'Uploaded Graph',
  };
  const validatedGraph = parseGraphDraft(createDraftFromGraph(graph));

  return {
    program: {
      id: payload.id || 'uploaded-spec',
      name: payload.name || payload.title || graph.title,
      description: payload.description || 'Uploaded graph specification for graph coverage exploration.',
      sourceCode: payload.sourceCode || payload.code || '',
      uploadName: payload.fileName || null,
    },
    graph: {
      ...validatedGraph,
      id: graph.id,
      title: graph.title,
    },
  };
}

function readUploadedFile(file) {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('無法讀取上傳檔案。'));
    reader.readAsText(file);
  });
}

function resolveProgramGraph(program) {
  if (program.sourceCode && program.language) {
    return generateControlFlowGraphFromProgram({
      sourceCode: program.sourceCode,
      language: program.language,
      title: `${program.name} Control Flow Graph`,
    });
  }

  if (program.graph) {
    return cloneGraph(program.graph);
  }

  throw new Error('找不到可用的 graph 來源。');
}

function createGraphCanvas(graph, requirement) {
  const highlightedNodes = new Set(requirement?.nodes || []);
  const highlightedEdges = new Set(requirement?.edges || []);
  const width = Math.max(920, ...graph.nodes.map((node) => node.x + 120));
  const height = Math.max(340, ...graph.nodes.map((node) => node.y + 90));

  return `
    <div class="graph-canvas" data-testid="graph-canvas">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Graph coverage 控制流程圖">
        <defs>
          <marker id="arrow-default" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
            <path d="M0,0 L12,6 L0,12 z" fill="#9aa8b6"></path>
          </marker>
          <marker id="arrow-active" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
            <path d="M0,0 L12,6 L0,12 z" fill="#ea580c"></path>
          </marker>
        </defs>
        ${graph.edges.map((edge) => {
          const fromNode = graph.nodes.find((node) => node.id === edge.from);
          const toNode = graph.nodes.find((node) => node.id === edge.to);
          const active = highlightedEdges.has(edge.id);

          if (edge.control) {
            return `
              <path
                class="graph-edge${active ? ' graph-edge--active' : ''}"
                d="M ${fromNode.x} ${fromNode.y} Q ${edge.control.x} ${edge.control.y} ${toNode.x} ${toNode.y}"
                marker-end="url(#${active ? 'arrow-active' : 'arrow-default'})"
                data-testid="graph-edge-${edge.id}"
              ></path>
            `;
          }

          return `
            <line
              class="graph-edge${active ? ' graph-edge--active' : ''}"
              x1="${fromNode.x}"
              y1="${fromNode.y}"
              x2="${toNode.x}"
              y2="${toNode.y}"
              marker-end="url(#${active ? 'arrow-active' : 'arrow-default'})"
              data-testid="graph-edge-${edge.id}"
            ></line>
          `;
        }).join('')}
        ${graph.nodes.map((node) => `
          <g class="graph-node${highlightedNodes.has(node.id) ? ' graph-node--active' : ''}" data-testid="graph-node-${node.id}">
            <circle cx="${node.x}" cy="${node.y}" r="28"></circle>
            <text x="${node.x}" y="${node.y + 5}" text-anchor="middle">${node.label}</text>
          </g>
        `).join('')}
      </svg>
    </div>
  `;
}

export function createGraphCoverageExplorer() {
  const root = document.createElement('div');
  const defaultGraph = cloneGraph(graphCoverageGraph);
  const defaultProgram = {
    id: 'default-sample',
    name: 'Default CFG Sample',
    description: 'A generic control flow graph used to compare graph coverage criteria on the same structure.',
    sourceCode: '',
  };

  let graph = defaultGraph;
  let baseGraph = cloneGraph(defaultGraph);
  let criterionId = 'node';
  let selectedRequirementId = null;
  let parseError = '';
  let sourceStatus = '可切換固定程式範例，或上傳 JSON graph spec、程式碼檔案。';
  let activeProgram = defaultProgram;
  let selectedProgramId = defaultProgram.id;
  let selectedCodeLanguage = 'javascript';
  let autoApplyTimer = null;
  let draft = createDraftFromGraph(defaultGraph);

  function loadGraphSource(program, nextGraph, statusMessage) {
    activeProgram = { ...program };
    selectedProgramId = program.id;
    baseGraph = cloneGraph(nextGraph);
    graph = cloneGraph(nextGraph);
    draft = createDraftFromGraph(graph);
    parseError = '';
    sourceStatus = statusMessage;
    selectedRequirementId = null;
    render();
  }

  function scheduleAutoApply() {
    if (autoApplyTimer) {
      clearTimeout(autoApplyTimer);
    }

    autoApplyTimer = window.setTimeout(() => {
      try {
        graph = {
          ...parseGraphDraft(draft),
          title: `${activeProgram.name} CFG`,
        };
        parseError = '';
        sourceStatus = `${activeProgram.name} 已依照編輯內容重新計算。`;
        selectedRequirementId = null;
        render();
      } catch (error) {
        parseError = error.message;
        render();
      }
    }, 300);
  }

  function resetGraph() {
    graph = cloneGraph(baseGraph);
    draft = createDraftFromGraph(graph);
    parseError = '';
    sourceStatus = `${activeProgram.name} 已還原為載入時的 graph。`;
    selectedRequirementId = null;
    render();
  }

  function getState() {
    const requirements = getCoverageRequirements(graph, criterionId);
    if (!requirements.some((item) => item.id === selectedRequirementId)) {
      selectedRequirementId = requirements[0]?.id || null;
    }

    const selectedRequirement = requirements.find((item) => item.id === selectedRequirementId) || requirements[0] || null;
    const selectedCriterion = graphCoverageCriteria.find((item) => item.id === criterionId);
    const pathPlan = buildTestPathSetForRequirements(graph, requirements);

    return {
      requirements,
      selectedRequirement,
      selectedCriterion,
      pathPlan,
    };
  }

  function render() {
    const { requirements, selectedRequirement, selectedCriterion, pathPlan } = getState();

    root.className = 'graph-coverage';
    root.dataset.testid = 'graph-coverage-explorer';
    root.innerHTML = `
      <div class="graph-source-card" data-testid="graph-source-card">
        <div class="graph-source-toolbar">
          <label>
            Program Example
            <select data-testid="program-example-select">
              <option value="${defaultProgram.id}"${selectedProgramId === defaultProgram.id ? ' selected' : ''}>Default CFG Sample</option>
              ${graphCoverageProgramExamples.map((example) => `
                <option value="${example.id}"${selectedProgramId === example.id ? ' selected' : ''}>${example.name}</option>
              `).join('')}
              <option value="uploaded-code"${selectedProgramId === 'uploaded-code' ? ' selected' : ''}>Uploaded Source Code</option>
              <option value="uploaded-spec"${selectedProgramId === 'uploaded-spec' ? ' selected' : ''}>Uploaded Graph Spec</option>
            </select>
          </label>
          <label class="graph-upload-field">
            Upload JSON Graph Spec
            <input type="file" accept="application/json,.json" data-testid="graph-upload-input" />
          </label>
          <label>
            Code Language
            <select data-testid="program-language-select">
              ${graphCoverageCodeLanguages.map((language) => `
                <option value="${language.id}"${selectedCodeLanguage === language.id ? ' selected' : ''}>${language.label}</option>
              `).join('')}
            </select>
          </label>
          <label class="graph-upload-field">
            Upload Source Code
            <input type="file" accept=".js,.txt,.code,.pseudo" data-testid="code-upload-input" />
          </label>
        </div>
        <div class="graph-source-copy">
          <div>
            <span class="detail-label">Current Source</span>
            <h4 data-testid="program-source-name">${activeProgram.name}</h4>
            <p class="graph-source-description" data-testid="program-source-description">${activeProgram.description}</p>
            <p class="graph-source-status${parseError ? ' graph-editor-status--error' : ''}" data-testid="graph-source-status">${parseError || sourceStatus}</p>
          </div>
          <div class="graph-upload-hint">
            <span class="detail-label">Upload Format</span>
            <p>JSON 可直接提供 graph 物件，或直接提供 nodes、edges、startNodeId、endNodeId，也可附帶 title、description、sourceCode。程式碼上傳則會依語言類型自動產生簡化 CFG。</p>
          </div>
        </div>
        ${activeProgram.sourceCode
          ? `<pre class="graph-source-code" data-testid="program-source-code"><code>${escapeHtml(activeProgram.sourceCode)}</code></pre>`
          : '<p class="graph-source-empty" data-testid="program-source-empty">這個來源目前只提供 graph，沒有附帶程式碼片段。</p>'}
      </div>

      <div class="graph-editor-card" data-testid="graph-editor-card">
        <div class="graph-editor-header">
          <h4>Graph Editor</h4>
          <p>可從真實程式範例載入 CFG，再微調 graph 並即時計算 coverage requirements 與 test paths。</p>
        </div>
        <div class="graph-editor-meta">
          <label>
            Start
            <input type="text" value="${draft.startNodeId}" data-testid="graph-start-input" data-draft-field="startNodeId" />
          </label>
          <label>
            End
            <input type="text" value="${draft.endNodeId}" data-testid="graph-end-input" data-draft-field="endNodeId" />
          </label>
          <button type="button" class="graph-editor-reset" data-testid="graph-reset-btn">還原預設圖</button>
        </div>
        <div class="graph-editor-grid">
          <label>
            Nodes (id,label,x,y)
            <textarea data-testid="graph-nodes-input" data-draft-field="nodesText">${draft.nodesText}</textarea>
          </label>
          <label>
            Edges (from,to | id,from,to | id,from,to,cx,cy)
            <textarea data-testid="graph-edges-input" data-draft-field="edgesText">${draft.edgesText}</textarea>
          </label>
        </div>
        <p class="graph-editor-status${parseError ? ' graph-editor-status--error' : ''}" data-testid="graph-editor-status">
          ${parseError || 'Graph 已同步更新'}
        </p>
      </div>

      <div class="graph-coverage-header">
        <div>
          <p class="graph-coverage-kicker">White Box Testing</p>
          <h3>${graph.title}</h3>
          <p class="graph-coverage-desc">用同一張控制流程圖，切換不同 coverage criteria，直接看到必須涵蓋的節點、邊與 path。</p>
        </div>
        <div class="graph-coverage-stats">
          <div class="graph-stat-card"><span class="graph-stat-label">Nodes</span><strong>${graph.nodes.length}</strong></div>
          <div class="graph-stat-card"><span class="graph-stat-label">Edges</span><strong>${graph.edges.length}</strong></div>
          <div class="graph-stat-card"><span class="graph-stat-label">Requirements</span><strong>${requirements.length}</strong></div>
        </div>
      </div>

      <div class="graph-criterion-switcher" role="tablist" aria-label="coverage criteria 切換">
        ${graphCoverageCriteria.map((criterion) => `
          <button
            class="criterion-chip${criterionId === criterion.id ? ' active' : ''}"
            type="button"
            data-testid="criterion-${criterion.id}"
            data-criterion="${criterion.id}"
            role="tab"
            aria-selected="${criterionId === criterion.id}"
          >
            <span>${criterion.labelZh}</span>
            <small>${criterion.label}</small>
          </button>
        `).join('')}
      </div>

      <div class="graph-coverage-layout">
        <div class="graph-main-panel">
          ${createGraphCanvas(graph, selectedRequirement)}
          <div class="graph-selected-summary" data-testid="selected-requirement-summary">
            <span class="summary-label">目前 requirement</span>
            <strong>${selectedRequirement?.label || '無'}</strong>
            <p>${selectedCriterion?.description || ''}</p>
          </div>

          <div class="graph-test-path-card" data-testid="graph-test-path-card">
            <h4>Generated Test Path Set</h4>
            <p class="sidebar-text">將 requirement 自動組合成可執行測試路徑（Start 到 End）。</p>
            <div class="test-path-metrics" data-testid="test-path-metrics">
              <div class="test-path-metric">
                <span class="detail-label">最佳化前</span>
                <strong data-testid="baseline-path-count">${pathPlan.optimizationMetrics.baselinePathCount}</strong>
              </div>
              <div class="test-path-metric">
                <span class="detail-label">最佳化後</span>
                <strong data-testid="optimized-path-count">${pathPlan.optimizationMetrics.optimizedPathCount}</strong>
              </div>
              <div class="test-path-metric test-path-metric--accent">
                <span class="detail-label">精簡數量</span>
                <strong data-testid="saved-path-count">${pathPlan.optimizationMetrics.savedPathCount}</strong>
              </div>
            </div>
            <ul class="test-path-list" data-testid="test-path-list">
              ${pathPlan.selectedPaths.map((path, index) => `
                <li data-testid="test-path-${index + 1}">T${index + 1}: ${path.join(' -> ')}</li>
              `).join('') || '<li>無可用路徑</li>'}
            </ul>
            <p class="test-path-meta" data-testid="test-path-meta">
              Covered Requirements: ${pathPlan.requirementPaths.filter((item) => item.covered).length} / ${pathPlan.requirementPaths.length}
            </p>
            ${pathPlan.uncoveredRequirements.length
              ? `<p class="graph-editor-status graph-editor-status--error">尚未覆蓋：${pathPlan.uncoveredRequirements.map((item) => item.displayText).join('、')}</p>`
              : '<p class="graph-editor-status">全部 requirement 已對應到 test paths</p>'}
          </div>
        </div>

        <aside class="graph-sidebar">
          <div class="graph-sidebar-card">
            <h4>Test Requirements</h4>
            <p class="sidebar-text">切換 criteria 後，列表會重算對應必須覆蓋的 requirement。</p>
            <ul class="requirement-list" data-testid="requirement-list">
              ${requirements.map((requirement) => `
                <li>
                  <button
                    class="requirement-item${selectedRequirement?.id === requirement.id ? ' active' : ''}"
                    type="button"
                    data-testid="requirement-${requirement.id}"
                    data-requirement-id="${requirement.id}"
                  >
                    <span class="requirement-kind">${requirement.type}</span>
                    <strong>${requirement.displayText}</strong>
                  </button>
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="graph-sidebar-card">
            <h4>Requirement Detail</h4>
            <div class="detail-grid">
              <div>
                <span class="detail-label">Nodes</span>
                <p data-testid="detail-nodes">${selectedRequirement?.nodes.join(' -> ') || '無'}</p>
              </div>
              <div>
                <span class="detail-label">Edges</span>
                <p data-testid="detail-edges">${selectedRequirement?.edges.join(', ') || '無'}</p>
              </div>
              <div>
                <span class="detail-label">Criterion</span>
                <p>${selectedCriterion?.labelZh || ''}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    `;

    root.querySelector('[data-testid="graph-reset-btn"]').addEventListener('click', () => {
      resetGraph();
    });

    root.querySelector('[data-testid="program-example-select"]').addEventListener('change', (event) => {
      const nextProgramId = event.target.value;

      if (nextProgramId === defaultProgram.id) {
        loadGraphSource(defaultProgram, defaultGraph, '已載入預設控制流程圖範例。');
        return;
      }

      if (nextProgramId === 'uploaded-spec') {
        selectedProgramId = nextProgramId;
        sourceStatus = '請選擇 JSON 檔案以上傳 graph spec。';
        render();
        return;
      }

      if (nextProgramId === 'uploaded-code') {
        selectedProgramId = nextProgramId;
        sourceStatus = '請選擇程式碼檔案與語言類型，系統會自動產生簡化 CFG。';
        render();
        return;
      }

      const example = graphCoverageProgramExamples.find((item) => item.id === nextProgramId);
      if (example) {
        const nextGraph = resolveProgramGraph(example);
        selectedCodeLanguage = example.language || selectedCodeLanguage;
        loadGraphSource(example, nextGraph, `已載入 ${example.name}。`);
      }
    });

    root.querySelector('[data-testid="program-language-select"]').addEventListener('change', (event) => {
      selectedCodeLanguage = event.target.value;
    });

    root.querySelector('[data-testid="graph-upload-input"]').addEventListener('change', async (event) => {
      const [file] = event.target.files || [];

      if (!file) {
        return;
      }

      try {
        const spec = parseUploadedGraphSpec(await readUploadedFile(file));
        loadGraphSource(
          { ...spec.program, id: 'uploaded-spec' },
          spec.graph,
          `已載入上傳檔案：${file.name}`
        );
      } catch (error) {
        selectedProgramId = 'uploaded-spec';
        parseError = error.message;
        render();
      }
    });

    root.querySelector('[data-testid="code-upload-input"]').addEventListener('change', async (event) => {
      const [file] = event.target.files || [];

      if (!file) {
        return;
      }

      try {
        const sourceCode = await readUploadedFile(file);
        const uploadedProgram = {
          id: 'uploaded-code',
          name: file.name.replace(/\.[^.]+$/, '') || 'Uploaded Code',
          description: `Uploaded ${selectedCodeLanguage} source file converted into a simplified control flow graph.`,
          sourceCode,
          language: selectedCodeLanguage,
        };
        const generatedGraph = resolveProgramGraph(uploadedProgram);
        loadGraphSource(uploadedProgram, generatedGraph, `已根據 ${file.name} 自動產生簡化 CFG。`);
      } catch (error) {
        parseError = error.message;
        sourceStatus = '程式碼上傳失敗。';
        render();
      }
    });

    root.querySelectorAll('[data-draft-field]').forEach((input) => {
      input.addEventListener('input', () => {
        draft = {
          ...draft,
          [input.dataset.draftField]: input.value,
        };
        scheduleAutoApply();
      });
    });

    root.querySelectorAll('[data-criterion]').forEach((button) => {
      button.addEventListener('click', () => {
        criterionId = button.dataset.criterion;
        selectedRequirementId = null;
        render();
      });
    });

    root.querySelectorAll('[data-requirement-id]').forEach((button) => {
      button.addEventListener('click', () => {
        selectedRequirementId = button.dataset.requirementId;
        render();
      });
    });
  }

  render();
  return root;
}
