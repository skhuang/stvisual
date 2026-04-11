(function () {
  const testingMethods = [
    {
      id: 'blackbox',
      name: '黑盒測試',
      nameEn: 'Black Box Testing',
      description: '不考慮內部實現，完全聚焦輸入與輸出行為',
      visibility: 0,
      colorScheme: 'dark',
      techniques: [
        { id: 'bva', name: '邊界值分析', nameEn: 'Boundary Value Analysis', description: '測試輸入的邊界條件' },
        { id: 'ep', name: '等價類分割', nameEn: 'Equivalence Partitioning', description: '將輸入空間劃分為等價類' },
        { id: 'ceg', name: '因果圖', nameEn: 'Cause-Effect Graph', description: '分析輸入輸出間的因果關係' },
        { id: 'stt', name: '狀態遷移測試', nameEn: 'State Transition Testing', description: '驗證系統的狀態轉換行為' },
      ],
    },
    {
      id: 'whitebox',
      name: '白盒測試',
      nameEn: 'White Box Testing',
      description: '基於內部代碼結構，確保所有路徑皆被覆蓋',
      visibility: 100,
      colorScheme: 'light',
      techniques: [
        { id: 'sc', name: '語句覆蓋', nameEn: 'Statement Coverage', description: '確保每條語句至少執行一次' },
        { id: 'bc', name: '分支覆蓋', nameEn: 'Branch Coverage', description: '確保每個分支（true/false）都被執行' },
        { id: 'gc', name: '圖形覆蓋', nameEn: 'Graph Coverage', description: '以控制流程圖推導節點、邊與 Prime Path 的測試需求' },
        { id: 'pc', name: '路徑覆蓋', nameEn: 'Path Coverage', description: '確保每條獨立路徑都被執行' },
        { id: 'ppc', name: 'Prime Path Coverage', nameEn: 'Prime Path Coverage', description: '最小化且完整的路徑覆蓋集合' },
        { id: 'cc', name: '條件覆蓋', nameEn: 'Condition Coverage', description: '確保每個布林條件的真假都被測試' },
        { id: 'mc', name: '多重條件覆蓋', nameEn: 'Multiple Conditions', description: '測試所有條件組合的真假情況' },
      ],
    },
    {
      id: 'graybox',
      name: '灰盒測試',
      nameEn: 'Gray Box Testing',
      description: '部分了解內部實現，結合兩者優點以提高效率',
      visibility: 50,
      colorScheme: 'medium',
      techniques: [
        { id: 'combined', name: '結合黑盒與白盒', nameEn: 'Combined Approach', description: '靈活運用兩種方法的測試策略' },
        { id: 'partial', name: '部分代碼可見', nameEn: 'Partial Code Visibility', description: '利用可見的部分實現輔助設計測試' },
      ],
    },
  ];

  const testingFlow = [
    { id: 'req', label: '需求分析', labelEn: 'Requirements', icon: '📋', description: '分析軟體需求，確定測試目標與範圍' },
    { id: 'plan', label: '測試計劃', labelEn: 'Test Plan', icon: '📝', description: '制定測試策略、資源分配與進度計劃' },
    { id: 'design', label: '測試設計', labelEn: 'Test Design', icon: '✏️', description: '設計測試用例、腳本與測試數據' },
    { id: 'exec', label: '測試執行', labelEn: 'Execution', icon: '▶️', description: '執行測試用例，記錄實際與預期結果' },
    { id: 'analysis', label: '結果分析', labelEn: 'Analysis', icon: '🔍', description: '比較結果，識別缺陷並評估測試覆蓋率' },
    { id: 'report', label: '缺陷報告', labelEn: 'Defect Report', icon: '📊', description: '撰寫測試報告，追蹤缺陷修復狀態' },
  ];

  const testingTypes = [
    { id: 'unit', type: '單元測試', typeEn: 'Unit Testing', purpose: '測試最小單位', timing: '開發階段', color: '#3498db', width: 30 },
    { id: 'integration', type: '集成測試', typeEn: 'Integration Testing', purpose: '測試模組組合', timing: '開發後期', color: '#27ae60', width: 55 },
    { id: 'system', type: '系統測試', typeEn: 'System Testing', purpose: '測試整體系統', timing: '集成完成後', color: '#f39c12', width: 80 },
    { id: 'acceptance', type: '驗收測試', typeEn: 'Acceptance Testing', purpose: '驗證需求達成', timing: '部署前', color: '#e74c3c', width: 100 },
  ];

  const graphCoverageCriteria = [
    { id: 'node', label: 'Node Coverage', labelZh: '節點覆蓋', description: '每個節點至少被一個測試路徑拜訪一次。' },
    { id: 'edge', label: 'Edge Coverage', labelZh: '邊覆蓋', description: '每條有向邊至少被一個測試路徑經過一次。' },
    { id: 'prime-path', label: 'Prime Path Coverage', labelZh: 'Prime Path 覆蓋', description: '所有 prime path 都必須被測試需求涵蓋，包含迴圈。' },
  ];

  const graphCoverageGraph = {
    id: 'control-flow-sample',
    title: '控制流程圖範例',
    startNodeId: 'S',
    endNodeId: 'T',
    nodes: [
      { id: 'S', label: 'Start', x: 80, y: 170, kind: 'start' },
      { id: 'A', label: 'A', x: 210, y: 170, kind: 'decision' },
      { id: 'B', label: 'B', x: 360, y: 80, kind: 'node' },
      { id: 'C', label: 'C', x: 360, y: 260, kind: 'node' },
      { id: 'D', label: 'D', x: 520, y: 170, kind: 'decision' },
      { id: 'E', label: 'E', x: 680, y: 80, kind: 'node' },
      { id: 'F', label: 'F', x: 680, y: 260, kind: 'node' },
      { id: 'T', label: 'End', x: 840, y: 170, kind: 'end' },
    ],
    edges: [
      { id: 'S-A', from: 'S', to: 'A' },
      { id: 'A-B', from: 'A', to: 'B' },
      { id: 'A-C', from: 'A', to: 'C' },
      { id: 'B-D', from: 'B', to: 'D' },
      { id: 'C-D', from: 'C', to: 'D' },
      { id: 'D-E', from: 'D', to: 'E' },
      { id: 'D-F', from: 'D', to: 'F' },
      { id: 'E-B', from: 'E', to: 'B', control: { x: 520, y: -10 } },
      { id: 'E-T', from: 'E', to: 'T' },
      { id: 'F-T', from: 'F', to: 'T' },
    ],
  };

  function buildAdjacency(graph) {
    const adjacency = new Map();
    graph.nodes.forEach((node) => adjacency.set(node.id, []));
    graph.edges.forEach((edge) => adjacency.get(edge.from).push(edge));
    return adjacency;
  }

  function buildReverseAdjacency(graph) {
    const reverseAdjacency = new Map();
    graph.nodes.forEach((node) => reverseAdjacency.set(node.id, []));
    graph.edges.forEach((edge) => reverseAdjacency.get(edge.to).push(edge));
    return reverseAdjacency;
  }

  function isCycle(path) {
    return path.length > 2 && path[0] === path[path.length - 1];
  }

  function canonicalCycleKey(path) {
    const cycleBody = path.slice(0, -1);
    const rotations = cycleBody.map((_, index) => {
      const rotated = cycleBody.slice(index).concat(cycleBody.slice(0, index));
      return rotated.concat(rotated[0]).join('->');
    });
    return rotations.sort()[0];
  }

  function edgeIdsFromPath(graph, path) {
    const edgeIds = [];
    for (let index = 0; index < path.length - 1; index += 1) {
      const from = path[index];
      const to = path[index + 1];
      const edge = graph.edges.find((item) => item.from === from && item.to === to);
      if (edge) {
        edgeIds.push(edge.id);
      }
    }
    return edgeIds;
  }

  function enumerateSimplePaths(graph) {
    const adjacency = buildAdjacency(graph);
    const uniquePaths = new Map();

    function addPath(path) {
      if (path.length < 2) {
        return;
      }
      const key = isCycle(path) ? canonicalCycleKey(path) : path.join('->');
      if (!uniquePaths.has(key)) {
        uniquePaths.set(key, path);
      }
    }

    function dfs(startNodeId, path, visited) {
      const currentNodeId = path[path.length - 1];
      const outgoingEdges = adjacency.get(currentNodeId) || [];
      outgoingEdges.forEach((edge) => {
        const nextNodeId = edge.to;
        if (nextNodeId === startNodeId && path.length > 1) {
          addPath(path.concat(nextNodeId));
          return;
        }
        if (!visited.has(nextNodeId)) {
          const nextPath = path.concat(nextNodeId);
          addPath(nextPath);
          visited.add(nextNodeId);
          dfs(startNodeId, nextPath, visited);
          visited.delete(nextNodeId);
        }
      });
    }

    graph.nodes.forEach((node) => {
      dfs(node.id, [node.id], new Set([node.id]));
    });

    return Array.from(uniquePaths.values());
  }

  function canExtendForward(path, adjacency) {
    if (isCycle(path)) {
      return false;
    }
    const currentNodeId = path[path.length - 1];
    const outgoingEdges = adjacency.get(currentNodeId) || [];
    return outgoingEdges.some((edge) => edge.to === path[0] || !path.includes(edge.to));
  }

  function canExtendBackward(path, reverseAdjacency) {
    if (isCycle(path)) {
      return false;
    }
    const firstNodeId = path[0];
    const incomingEdges = reverseAdjacency.get(firstNodeId) || [];
    return incomingEdges.some((edge) => edge.from === path[path.length - 1] || !path.includes(edge.from));
  }

  function getPrimePaths(graph) {
    const adjacency = buildAdjacency(graph);
    const reverseAdjacency = buildReverseAdjacency(graph);
    return enumerateSimplePaths(graph).filter((path) => {
      if (isCycle(path)) {
        return true;
      }
      return !canExtendForward(path, adjacency) && !canExtendBackward(path, reverseAdjacency);
    });
  }

  function getNodeRequirements(graph) {
    return graph.nodes.map((node) => ({
      id: 'node-' + node.id,
      type: 'node',
      label: 'Node ' + node.label,
      displayText: node.label,
      nodes: [node.id],
      edges: [],
    }));
  }

  function getEdgeRequirements(graph) {
    return graph.edges.map((edge) => ({
      id: 'edge-' + edge.id,
      type: 'edge',
      label: 'Edge ' + edge.from + ' -> ' + edge.to,
      displayText: edge.from + ' -> ' + edge.to,
      nodes: [edge.from, edge.to],
      edges: [edge.id],
    }));
  }

  function getPrimePathRequirements(graph) {
    return getPrimePaths(graph).map((path, index) => ({
      id: 'prime-path-' + (index + 1),
      type: 'prime-path',
      label: 'Path ' + path.join(' -> '),
      displayText: path.join(' -> '),
      nodes: Array.from(new Set(path)),
      edges: edgeIdsFromPath(graph, path),
      path,
    }));
  }

  function getCoverageRequirements(graph, criterion) {
    if (criterion === 'node') return getNodeRequirements(graph);
    if (criterion === 'edge') return getEdgeRequirements(graph);
    if (criterion === 'prime-path') return getPrimePathRequirements(graph);
    return [];
  }

  function createTestingMethodTree() {
    const root = document.createElement('div');
    let expandedIds = new Set();

    function render() {
      const allExpanded = expandedIds.size === testingMethods.length;
      root.className = 'testing-method-tree';
      root.innerHTML = `
        <div class="tree-controls">
          <button class="btn-toggle-all" type="button" data-testid="toggle-all-btn">${allExpanded ? '全部收合' : '全部展開'}</button>
        </div>
        <div class="tree-cards">
          ${testingMethods.map((method) => {
            const expanded = expandedIds.has(method.id);
            return `
              <div class="method-card method-card--${method.colorScheme}${expanded ? ' method-card--expanded' : ''}" data-testid="method-card-${method.id}">
                <button class="method-card-header" type="button" data-testid="method-card-btn-${method.id}" aria-expanded="${expanded}">
                  <div class="method-card-title">
                    <h3>${method.name}</h3>
                    <span class="method-card-en">${method.nameEn}</span>
                  </div>
                  <span class="method-card-toggle${expanded ? ' rotated' : ''}">▷</span>
                </button>
                <div class="method-card-body">
                  <p class="method-description">${method.description}</p>
                  <div class="visibility-meter" aria-label="代碼可見度 ${method.visibility}%">
                    <span class="visibility-label">代碼可見度</span>
                    <div class="visibility-track">
                      <div class="visibility-fill" style="width: ${method.visibility}%"></div>
                    </div>
                    <span class="visibility-value">${method.visibility}%</span>
                  </div>
                  <div class="method-count-badge">${method.techniques.length} 項技術</div>
                  ${expanded ? `
                    <ul class="technique-list">
                      ${method.techniques.map((tech, index) => `
                        <li class="technique-item" style="animation-delay: ${index * 0.06}s">
                          <div class="technique-name">${tech.name}</div>
                          <div class="technique-name-en">${tech.nameEn}</div>
                          <div class="technique-desc">${tech.description}</div>
                        </li>
                      `).join('')}
                    </ul>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      root.querySelector('[data-testid="toggle-all-btn"]').addEventListener('click', () => {
        expandedIds = allExpanded ? new Set() : new Set(testingMethods.map((method) => method.id));
        render();
      });

      testingMethods.forEach((method) => {
        root.querySelector('[data-testid="method-card-btn-' + method.id + '"]').addEventListener('click', () => {
          const next = new Set(expandedIds);
          if (next.has(method.id)) next.delete(method.id); else next.add(method.id);
          expandedIds = next;
          render();
        });
      });
    }

    render();
    return root;
  }

  function createTestingFlow() {
    const root = document.createElement('div');
    let activeStep = 0;
    let isPlaying = true;
    let hoveredStep = null;
    let timerId = null;

    function restartTimer() {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      if (isPlaying) {
        timerId = window.setInterval(() => {
          activeStep = (activeStep + 1) % testingFlow.length;
          render();
        }, 1800);
      }
    }

    function render() {
      root.className = 'testing-flow';
      root.innerHTML = `
        <div class="flow-controls">
          <button class="flow-play-btn${isPlaying ? ' playing' : ''}" type="button" data-testid="flow-play-btn">${isPlaying ? '⏸ 暫停' : '▶ 播放'}</button>
        </div>
        <div class="flow-track">
          ${testingFlow.map((step, index) => `
            <div class="flow-step-group">
              <div class="flow-step${activeStep === index ? ' flow-step--active' : ''}${hoveredStep === index ? ' flow-step--hovered' : ''}" data-step-index="${index}">
                <div class="flow-step-num">${index + 1}</div>
                <div class="flow-step-icon">${step.icon}</div>
                <div class="flow-step-label">${step.label}</div>
                <div class="flow-step-label-en">${step.labelEn}</div>
                ${(hoveredStep === index || activeStep === index) ? `<div class="flow-step-tooltip">${step.description}</div>` : ''}
              </div>
              ${index < testingFlow.length - 1 ? `<div class="flow-arrow${activeStep > index ? ' flow-arrow--passed' : ''}${activeStep === index ? ' flow-arrow--active' : ''}"><div class="flow-arrow-line"></div><div class="flow-arrow-head"></div></div>` : ''}
            </div>
          `).join('')}
        </div>
        <div class="flow-progress-bar"><div class="flow-progress-fill" style="width: ${((activeStep + 1) / testingFlow.length) * 100}%"></div></div>
        <div class="flow-progress-label">進度：${activeStep + 1} / ${testingFlow.length} — ${testingFlow[activeStep].label}</div>
      `;

      root.querySelector('[data-testid="flow-play-btn"]').addEventListener('click', () => {
        isPlaying = !isPlaying;
        restartTimer();
        render();
      });

      root.querySelectorAll('[data-step-index]').forEach((element) => {
        const stepIndex = Number(element.dataset.stepIndex);
        element.addEventListener('mouseenter', () => {
          hoveredStep = stepIndex;
          isPlaying = false;
          restartTimer();
          render();
        });
        element.addEventListener('mouseleave', () => {
          hoveredStep = null;
          isPlaying = true;
          restartTimer();
          render();
        });
        element.addEventListener('click', () => {
          activeStep = stepIndex;
          render();
        });
      });
    }

    restartTimer();
    render();
    return root;
  }

  function createTestingTypesTable() {
    const root = document.createElement('div');
    root.className = 'testing-types';
    root.innerHTML = `
      <div class="pyramid-section">
        <h3 class="pyramid-title">測試金字塔（由底層至頂層）</h3>
        <div class="pyramid">
          ${testingTypes.slice().reverse().map((type, index) => `
            <div class="pyramid-row" style="--row-color: ${type.color}; --row-width: ${type.width}%; animation-delay: ${index * 0.12}s">
              <span class="pyramid-row-label">${type.type}</span>
              <span class="pyramid-row-en">${type.typeEn}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="types-grid">
        ${testingTypes.map((type, index) => `
          <div class="type-card" style="--card-color: ${type.color}; animation-delay: ${index * 0.1}s">
            <div class="type-card-stripe"></div>
            <div class="type-card-body">
              <div class="type-header">
                <span class="type-phase">Phase ${index + 1}</span>
                <h4 class="type-name">${type.type}</h4>
                <span class="type-name-en">${type.typeEn}</span>
              </div>
              <div class="type-detail">
                <div class="type-detail-row"><span class="type-detail-label">目的</span><span class="type-detail-value">${type.purpose}</span></div>
                <div class="type-detail-row"><span class="type-detail-label">時機</span><span class="type-detail-value">${type.timing}</span></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    return root;
  }

  function createGraphCanvas(graph, requirement) {
    const highlightedNodes = new Set((requirement && requirement.nodes) || []);
    const highlightedEdges = new Set((requirement && requirement.edges) || []);

    return `
      <div class="graph-canvas">
        <svg viewBox="0 0 920 340" role="img" aria-label="Graph coverage 控制流程圖">
          <defs>
            <marker id="arrow-default" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 z" fill="#9aa8b6"></path></marker>
            <marker id="arrow-active" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 z" fill="#ea580c"></path></marker>
          </defs>
          ${graph.edges.map((edge) => {
            const fromNode = graph.nodes.find((node) => node.id === edge.from);
            const toNode = graph.nodes.find((node) => node.id === edge.to);
            const active = highlightedEdges.has(edge.id);
            if (edge.control) {
              return `<path class="graph-edge${active ? ' graph-edge--active' : ''}" d="M ${fromNode.x} ${fromNode.y} Q ${edge.control.x} ${edge.control.y} ${toNode.x} ${toNode.y}" marker-end="url(#${active ? 'arrow-active' : 'arrow-default'})"></path>`;
            }
            return `<line class="graph-edge${active ? ' graph-edge--active' : ''}" x1="${fromNode.x}" y1="${fromNode.y}" x2="${toNode.x}" y2="${toNode.y}" marker-end="url(#${active ? 'arrow-active' : 'arrow-default'})"></line>`;
          }).join('')}
          ${graph.nodes.map((node) => `<g class="graph-node${highlightedNodes.has(node.id) ? ' graph-node--active' : ''}"><circle cx="${node.x}" cy="${node.y}" r="28"></circle><text x="${node.x}" y="${node.y + 5}" text-anchor="middle">${node.label}</text></g>`).join('')}
        </svg>
      </div>
    `;
  }

  function createGraphCoverageExplorer() {
    const root = document.createElement('div');
    let criterionId = 'node';
    let selectedRequirementId = null;

    function getState() {
      const requirements = getCoverageRequirements(graphCoverageGraph, criterionId);
      if (!requirements.some((item) => item.id === selectedRequirementId)) {
        selectedRequirementId = requirements[0] ? requirements[0].id : null;
      }
      const selectedRequirement = requirements.find((item) => item.id === selectedRequirementId) || requirements[0] || null;
      const selectedCriterion = graphCoverageCriteria.find((item) => item.id === criterionId);
      return { requirements, selectedRequirement, selectedCriterion };
    }

    function render() {
      const state = getState();
      root.className = 'graph-coverage';
      root.innerHTML = `
        <div class="graph-coverage-header">
          <div>
            <p class="graph-coverage-kicker">White Box Testing</p>
            <h3>${graphCoverageGraph.title}</h3>
            <p class="graph-coverage-desc">用同一張控制流程圖，切換不同 coverage criteria，直接看到必須涵蓋的節點、邊與 prime path。</p>
          </div>
          <div class="graph-coverage-stats">
            <div class="graph-stat-card"><span class="graph-stat-label">Nodes</span><strong>${graphCoverageGraph.nodes.length}</strong></div>
            <div class="graph-stat-card"><span class="graph-stat-label">Edges</span><strong>${graphCoverageGraph.edges.length}</strong></div>
            <div class="graph-stat-card"><span class="graph-stat-label">Requirements</span><strong>${state.requirements.length}</strong></div>
          </div>
        </div>
        <div class="graph-criterion-switcher">
          ${graphCoverageCriteria.map((criterion) => `
            <button class="criterion-chip${criterionId === criterion.id ? ' active' : ''}" type="button" data-criterion="${criterion.id}">
              <span>${criterion.labelZh}</span>
              <small>${criterion.label}</small>
            </button>
          `).join('')}
        </div>
        <div class="graph-coverage-layout">
          <div class="graph-main-panel">
            ${createGraphCanvas(graphCoverageGraph, state.selectedRequirement)}
            <div class="graph-selected-summary">
              <span class="summary-label">目前 requirement</span>
              <strong>${state.selectedRequirement ? state.selectedRequirement.label : '無'}</strong>
              <p>${state.selectedCriterion ? state.selectedCriterion.description : ''}</p>
            </div>
          </div>
          <aside class="graph-sidebar">
            <div class="graph-sidebar-card">
              <h4>Test Requirements</h4>
              <p class="sidebar-text">切換 criteria 後，列表會重算對應必須覆蓋的 requirement。</p>
              <ul class="requirement-list">
                ${state.requirements.map((requirement) => `
                  <li>
                    <button class="requirement-item${state.selectedRequirement && state.selectedRequirement.id === requirement.id ? ' active' : ''}" type="button" data-requirement-id="${requirement.id}">
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
                <div><span class="detail-label">Nodes</span><p>${state.selectedRequirement ? state.selectedRequirement.nodes.join(' -> ') : '無'}</p></div>
                <div><span class="detail-label">Edges</span><p>${state.selectedRequirement ? state.selectedRequirement.edges.join(', ') : '無'}</p></div>
                <div><span class="detail-label">Criterion</span><p>${state.selectedCriterion ? state.selectedCriterion.labelZh : ''}</p></div>
              </div>
            </div>
          </aside>
        </div>
      `;

      root.querySelectorAll('[data-criterion]').forEach((button) => {
        button.addEventListener('click', () => {
          criterionId = button.getAttribute('data-criterion');
          selectedRequirementId = null;
          render();
        });
      });

      root.querySelectorAll('[data-requirement-id]').forEach((button) => {
        button.addEventListener('click', () => {
          selectedRequirementId = button.getAttribute('data-requirement-id');
          render();
        });
      });
    }

    render();
    return root;
  }

  function renderApp(container) {
    const sectionsConfig = [
      { id: 'all', label: '全覽' },
      { id: 'methods', label: '測試方法' },
      { id: 'graph', label: 'Graph Coverage' },
      { id: 'flow', label: '測試流程' },
      { id: 'types', label: '測試類型' },
    ];

    container.innerHTML = `
      <div class="app">
        <header class="app-header">
          <h1>軟體測試方法視覺化</h1>
          <p>Software Testing Methods Visualization</p>
        </header>
        <nav class="app-nav" aria-label="切換區塊"></nav>
        <main class="app-main">
          <section data-section-id="methods"><h2>測試方法分類</h2><div data-slot="methods"></div></section>
          <section data-section-id="graph"><h2>Graph Coverage 視覺化</h2><div data-slot="graph"></div></section>
          <section data-section-id="flow"><h2>測試流程</h2><div data-slot="flow"></div></section>
          <section data-section-id="types"><h2>常見測試類型</h2><div data-slot="types"></div></section>
        </main>
        <footer class="app-footer"><p>根據 Plan.md 建立 · 軟體測試方法視覺化系統</p></footer>
      </div>
    `;

    const nav = container.querySelector('.app-nav');
    const sections = {
      methods: container.querySelector('[data-section-id="methods"]'),
      graph: container.querySelector('[data-section-id="graph"]'),
      flow: container.querySelector('[data-section-id="flow"]'),
      types: container.querySelector('[data-section-id="types"]'),
    };

    container.querySelector('[data-slot="methods"]').appendChild(createTestingMethodTree());
    container.querySelector('[data-slot="graph"]').appendChild(createGraphCoverageExplorer());
    container.querySelector('[data-slot="flow"]').appendChild(createTestingFlow());
    container.querySelector('[data-slot="types"]').appendChild(createTestingTypesTable());

    let activeSection = 'all';

    function updateSectionVisibility() {
      Object.keys(sections).forEach((id) => {
        sections[id].style.display = activeSection === 'all' || activeSection === id ? '' : 'none';
      });
    }

    function renderNav() {
      nav.innerHTML = sectionsConfig.map((section) => `
        <button class="nav-btn${activeSection === section.id ? ' active' : ''}" type="button" data-section="${section.id}">${section.label}</button>
      `).join('');

      nav.querySelectorAll('[data-section]').forEach((button) => {
        button.addEventListener('click', () => {
          activeSection = button.getAttribute('data-section');
          renderNav();
          updateSectionVisibility();
        });
      });
    }

    renderNav();
    updateSectionVisibility();
  }

  const root = document.getElementById('root');
  if (root) {
    renderApp(root);
  }
})();
