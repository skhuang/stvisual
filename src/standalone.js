(() => {
  // src/data/testingData.js
  var testingMethods = [
    {
      id: "blackbox",
      name: "\u9ED1\u76D2\u6E2C\u8A66",
      nameEn: "Black Box Testing",
      description: "\u4E0D\u8003\u616E\u5167\u90E8\u5BE6\u73FE\uFF0C\u5B8C\u5168\u805A\u7126\u8F38\u5165\u8207\u8F38\u51FA\u884C\u70BA",
      visibility: 0,
      colorScheme: "dark",
      techniques: [
        { id: "bva", name: "\u908A\u754C\u503C\u5206\u6790", nameEn: "Boundary Value Analysis", description: "\u6E2C\u8A66\u8F38\u5165\u7684\u908A\u754C\u689D\u4EF6" },
        { id: "ep", name: "\u7B49\u50F9\u985E\u5206\u5272", nameEn: "Equivalence Partitioning", description: "\u5C07\u8F38\u5165\u7A7A\u9593\u5283\u5206\u70BA\u7B49\u50F9\u985E" },
        { id: "ceg", name: "\u56E0\u679C\u5716", nameEn: "Cause-Effect Graph", description: "\u5206\u6790\u8F38\u5165\u8F38\u51FA\u9593\u7684\u56E0\u679C\u95DC\u4FC2" },
        { id: "stt", name: "\u72C0\u614B\u9077\u79FB\u6E2C\u8A66", nameEn: "State Transition Testing", description: "\u9A57\u8B49\u7CFB\u7D71\u7684\u72C0\u614B\u8F49\u63DB\u884C\u70BA" }
      ]
    },
    {
      id: "whitebox",
      name: "\u767D\u76D2\u6E2C\u8A66",
      nameEn: "White Box Testing",
      description: "\u57FA\u65BC\u5167\u90E8\u4EE3\u78BC\u7D50\u69CB\uFF0C\u78BA\u4FDD\u6240\u6709\u8DEF\u5F91\u7686\u88AB\u8986\u84CB",
      visibility: 100,
      colorScheme: "light",
      techniques: [
        { id: "sc", name: "\u8A9E\u53E5\u8986\u84CB", nameEn: "Statement Coverage", description: "\u78BA\u4FDD\u6BCF\u689D\u8A9E\u53E5\u81F3\u5C11\u57F7\u884C\u4E00\u6B21" },
        { id: "bc", name: "\u5206\u652F\u8986\u84CB", nameEn: "Branch Coverage", description: "\u78BA\u4FDD\u6BCF\u500B\u5206\u652F\uFF08true/false\uFF09\u90FD\u88AB\u57F7\u884C" },
        { id: "gc", name: "\u5716\u5F62\u8986\u84CB", nameEn: "Graph Coverage", description: "\u4EE5\u63A7\u5236\u6D41\u7A0B\u5716\u63A8\u5C0E\u7BC0\u9EDE\u3001\u908A\u8207 Prime Path \u7684\u6E2C\u8A66\u9700\u6C42" },
        { id: "pc", name: "\u8DEF\u5F91\u8986\u84CB", nameEn: "Path Coverage", description: "\u78BA\u4FDD\u6BCF\u689D\u7368\u7ACB\u8DEF\u5F91\u90FD\u88AB\u57F7\u884C" },
        { id: "ppc", name: "Prime Path Coverage", nameEn: "Prime Path Coverage", description: "\u6700\u5C0F\u5316\u4E14\u5B8C\u6574\u7684\u8DEF\u5F91\u8986\u84CB\u96C6\u5408" },
        { id: "cc", name: "\u689D\u4EF6\u8986\u84CB", nameEn: "Condition Coverage", description: "\u78BA\u4FDD\u6BCF\u500B\u5E03\u6797\u689D\u4EF6\u7684\u771F\u5047\u90FD\u88AB\u6E2C\u8A66" },
        { id: "mc", name: "\u591A\u91CD\u689D\u4EF6\u8986\u84CB", nameEn: "Multiple Conditions", description: "\u6E2C\u8A66\u6240\u6709\u689D\u4EF6\u7D44\u5408\u7684\u771F\u5047\u60C5\u6CC1" }
      ]
    },
    {
      id: "graybox",
      name: "\u7070\u76D2\u6E2C\u8A66",
      nameEn: "Gray Box Testing",
      description: "\u90E8\u5206\u4E86\u89E3\u5167\u90E8\u5BE6\u73FE\uFF0C\u7D50\u5408\u5169\u8005\u512A\u9EDE\u4EE5\u63D0\u9AD8\u6548\u7387",
      visibility: 50,
      colorScheme: "medium",
      techniques: [
        { id: "combined", name: "\u7D50\u5408\u9ED1\u76D2\u8207\u767D\u76D2", nameEn: "Combined Approach", description: "\u9748\u6D3B\u904B\u7528\u5169\u7A2E\u65B9\u6CD5\u7684\u6E2C\u8A66\u7B56\u7565" },
        { id: "partial", name: "\u90E8\u5206\u4EE3\u78BC\u53EF\u898B", nameEn: "Partial Code Visibility", description: "\u5229\u7528\u53EF\u898B\u7684\u90E8\u5206\u5BE6\u73FE\u8F14\u52A9\u8A2D\u8A08\u6E2C\u8A66" }
      ]
    }
  ];
  var testingFlow = [
    { id: "req", label: "\u9700\u6C42\u5206\u6790", labelEn: "Requirements", icon: "\u{1F4CB}", description: "\u5206\u6790\u8EDF\u9AD4\u9700\u6C42\uFF0C\u78BA\u5B9A\u6E2C\u8A66\u76EE\u6A19\u8207\u7BC4\u570D" },
    { id: "plan", label: "\u6E2C\u8A66\u8A08\u5283", labelEn: "Test Plan", icon: "\u{1F4DD}", description: "\u5236\u5B9A\u6E2C\u8A66\u7B56\u7565\u3001\u8CC7\u6E90\u5206\u914D\u8207\u9032\u5EA6\u8A08\u5283" },
    { id: "design", label: "\u6E2C\u8A66\u8A2D\u8A08", labelEn: "Test Design", icon: "\u270F\uFE0F", description: "\u8A2D\u8A08\u6E2C\u8A66\u7528\u4F8B\u3001\u8173\u672C\u8207\u6E2C\u8A66\u6578\u64DA" },
    { id: "exec", label: "\u6E2C\u8A66\u57F7\u884C", labelEn: "Execution", icon: "\u25B6\uFE0F", description: "\u57F7\u884C\u6E2C\u8A66\u7528\u4F8B\uFF0C\u8A18\u9304\u5BE6\u969B\u8207\u9810\u671F\u7D50\u679C" },
    { id: "analysis", label: "\u7D50\u679C\u5206\u6790", labelEn: "Analysis", icon: "\u{1F50D}", description: "\u6BD4\u8F03\u7D50\u679C\uFF0C\u8B58\u5225\u7F3A\u9677\u4E26\u8A55\u4F30\u6E2C\u8A66\u8986\u84CB\u7387" },
    { id: "report", label: "\u7F3A\u9677\u5831\u544A", labelEn: "Defect Report", icon: "\u{1F4CA}", description: "\u64B0\u5BEB\u6E2C\u8A66\u5831\u544A\uFF0C\u8FFD\u8E64\u7F3A\u9677\u4FEE\u5FA9\u72C0\u614B" }
  ];
  var testingTypes = [
    { id: "unit", type: "\u55AE\u5143\u6E2C\u8A66", typeEn: "Unit Testing", purpose: "\u6E2C\u8A66\u6700\u5C0F\u55AE\u4F4D", timing: "\u958B\u767C\u968E\u6BB5", color: "#3498db", width: 30 },
    { id: "integration", type: "\u96C6\u6210\u6E2C\u8A66", typeEn: "Integration Testing", purpose: "\u6E2C\u8A66\u6A21\u7D44\u7D44\u5408", timing: "\u958B\u767C\u5F8C\u671F", color: "#27ae60", width: 55 },
    { id: "system", type: "\u7CFB\u7D71\u6E2C\u8A66", typeEn: "System Testing", purpose: "\u6E2C\u8A66\u6574\u9AD4\u7CFB\u7D71", timing: "\u96C6\u6210\u5B8C\u6210\u5F8C", color: "#f39c12", width: 80 },
    { id: "acceptance", type: "\u9A57\u6536\u6E2C\u8A66", typeEn: "Acceptance Testing", purpose: "\u9A57\u8B49\u9700\u6C42\u9054\u6210", timing: "\u90E8\u7F72\u524D", color: "#e74c3c", width: 100 }
  ];
  var graphCoverageCriteria = [
    {
      id: "node",
      label: "Node Coverage",
      labelZh: "\u7BC0\u9EDE\u8986\u84CB",
      description: "\u6BCF\u500B\u7BC0\u9EDE\u81F3\u5C11\u88AB\u4E00\u500B\u6E2C\u8A66\u8DEF\u5F91\u62DC\u8A2A\u4E00\u6B21\u3002"
    },
    {
      id: "edge",
      label: "Edge Coverage",
      labelZh: "\u908A\u8986\u84CB",
      description: "\u6BCF\u689D\u6709\u5411\u908A\u81F3\u5C11\u88AB\u4E00\u500B\u6E2C\u8A66\u8DEF\u5F91\u7D93\u904E\u4E00\u6B21\u3002"
    },
    {
      id: "prime-path",
      label: "Prime Path Coverage",
      labelZh: "Prime Path \u8986\u84CB",
      description: "\u6240\u6709 prime path \u90FD\u5FC5\u9808\u88AB\u6E2C\u8A66\u9700\u6C42\u6DB5\u84CB\uFF0C\u5305\u542B\u8FF4\u5708\u3002"
    },
    {
      id: "edge-pair",
      label: "Edge-Pair Coverage",
      labelZh: "\u908A\u5C0D\u8986\u84CB",
      description: "\u6BCF\u4E00\u7D44\u76F8\u9130\u7684\u5169\u689D\u908A\u90FD\u8981\u81F3\u5C11\u88AB\u4E00\u689D\u6E2C\u8A66\u8DEF\u5F91\u8986\u84CB\u3002"
    },
    {
      id: "complete-path",
      label: "Complete Path Coverage",
      labelZh: "\u5B8C\u6574\u8DEF\u5F91\u8986\u84CB",
      description: "\u4EE5\u6709\u9650\u6DF1\u5EA6\u5217\u8209 start \u5230 end \u7684\u5B8C\u6574\u53EF\u884C\u8DEF\u5F91\u96C6\u5408\u3002"
    }
  ];
  var graphCoverageCodeLanguages = [
    { id: "javascript", label: "JavaScript" },
    { id: "pseudocode", label: "Pseudo Code" }
  ];
  var graphCoverageGraph = {
    id: "control-flow-sample",
    title: "\u63A7\u5236\u6D41\u7A0B\u5716\u7BC4\u4F8B",
    startNodeId: "S",
    endNodeId: "T",
    nodes: [
      { id: "S", label: "Start", x: 80, y: 170, kind: "start" },
      { id: "A", label: "A", x: 210, y: 170, kind: "decision" },
      { id: "B", label: "B", x: 360, y: 80, kind: "node" },
      { id: "C", label: "C", x: 360, y: 260, kind: "node" },
      { id: "D", label: "D", x: 520, y: 170, kind: "decision" },
      { id: "E", label: "E", x: 680, y: 80, kind: "node" },
      { id: "F", label: "F", x: 680, y: 260, kind: "node" },
      { id: "T", label: "End", x: 840, y: 170, kind: "end" }
    ],
    edges: [
      { id: "S-A", from: "S", to: "A" },
      { id: "A-B", from: "A", to: "B" },
      { id: "A-C", from: "A", to: "C" },
      { id: "B-D", from: "B", to: "D" },
      { id: "C-D", from: "C", to: "D" },
      { id: "D-E", from: "D", to: "E" },
      { id: "D-F", from: "D", to: "F" },
      { id: "E-B", from: "E", to: "B", control: { x: 520, y: -10 } },
      { id: "E-T", from: "E", to: "T" },
      { id: "F-T", from: "F", to: "T" }
    ]
  };
  var graphCoverageProgramExamples = [
    {
      id: "triangle-problem",
      name: "Triangle Problem",
      language: "javascript",
      description: "Classic triangle classification logic with validity, equilateral, isosceles, and scalene branches.",
      sourceCode: `function classifyTriangle(a, b, c) {
  if (a <= 0 || b <= 0 || c <= 0) {
    return 'invalid';
  }

  if (a + b <= c || a + c <= b || b + c <= a) {
    return 'invalid';
  }

  if (a === b && b === c) {
    return 'equilateral';
  }

  if (a === b || b === c || a === c) {
    return 'isosceles';
  }

  return 'scalene';
}`,
      graph: {
        id: "triangle-problem-cfg",
        title: "Triangle Problem Control Flow Graph",
        startNodeId: "S",
        endNodeId: "T",
        nodes: [
          { id: "S", label: "Start", x: 80, y: 180, kind: "start" },
          { id: "V", label: "Positive?", x: 220, y: 180, kind: "decision" },
          { id: "R1", label: "Invalid", x: 380, y: 70, kind: "node" },
          { id: "I", label: "Triangle?", x: 380, y: 180, kind: "decision" },
          { id: "E", label: "Equilateral?", x: 560, y: 100, kind: "decision" },
          { id: "J", label: "Isosceles?", x: 560, y: 260, kind: "decision" },
          { id: "R2", label: "Equilateral", x: 740, y: 60, kind: "node" },
          { id: "R3", label: "Isosceles", x: 740, y: 180, kind: "node" },
          { id: "R4", label: "Scalene", x: 740, y: 300, kind: "node" },
          { id: "T", label: "End", x: 880, y: 180, kind: "end" }
        ],
        edges: [
          { id: "S-V", from: "S", to: "V" },
          { id: "V-R1", from: "V", to: "R1" },
          { id: "V-I", from: "V", to: "I" },
          { id: "I-R1", from: "I", to: "R1" },
          { id: "I-E", from: "I", to: "E" },
          { id: "E-R2", from: "E", to: "R2" },
          { id: "E-J", from: "E", to: "J" },
          { id: "J-R3", from: "J", to: "R3" },
          { id: "J-R4", from: "J", to: "R4" },
          { id: "R1-T", from: "R1", to: "T" },
          { id: "R2-T", from: "R2", to: "T" },
          { id: "R3-T", from: "R3", to: "T" },
          { id: "R4-T", from: "R4", to: "T" }
        ]
      }
    },
    {
      id: "next-date",
      name: "Next Date",
      language: "javascript",
      description: "A simplified next-date program that validates the date, advances within a month, and handles year rollover.",
      sourceCode: `function nextDate(year, month, day) {
  if (!isValidDate(year, month, day)) {
    return 'invalid';
  }

  if (day < daysInMonth(year, month)) {
    return { year, month, day: day + 1 };
  }

  if (month === 12) {
    return { year: year + 1, month: 1, day: 1 };
  }

  return { year, month: month + 1, day: 1 };
}`,
      graph: {
        id: "next-date-cfg",
        title: "Next Date Control Flow Graph",
        startNodeId: "S",
        endNodeId: "T",
        nodes: [
          { id: "S", label: "Start", x: 80, y: 180, kind: "start" },
          { id: "V", label: "Valid Date?", x: 230, y: 180, kind: "decision" },
          { id: "R1", label: "Invalid", x: 410, y: 70, kind: "node" },
          { id: "D", label: "Day < Max?", x: 410, y: 180, kind: "decision" },
          { id: "R2", label: "Next Day", x: 610, y: 70, kind: "node" },
          { id: "M", label: "Month=12?", x: 610, y: 250, kind: "decision" },
          { id: "R3", label: "Next Year", x: 790, y: 140, kind: "node" },
          { id: "R4", label: "Next Month", x: 790, y: 300, kind: "node" },
          { id: "T", label: "End", x: 900, y: 220, kind: "end" }
        ],
        edges: [
          { id: "S-V", from: "S", to: "V" },
          { id: "V-R1", from: "V", to: "R1" },
          { id: "V-D", from: "V", to: "D" },
          { id: "D-R2", from: "D", to: "R2" },
          { id: "D-M", from: "D", to: "M" },
          { id: "M-R3", from: "M", to: "R3" },
          { id: "M-R4", from: "M", to: "R4" },
          { id: "R1-T", from: "R1", to: "T" },
          { id: "R2-T", from: "R2", to: "T" },
          { id: "R3-T", from: "R3", to: "T" },
          { id: "R4-T", from: "R4", to: "T" }
        ]
      }
    },
    {
      id: "commission-problem",
      name: "Commission Problem",
      language: "javascript",
      description: "A classic sales commission example with threshold-based decision logic.",
      sourceCode: `function commission(locks, stocks, barrels) {
  if (locks < 1 || stocks < 1 || barrels < 1) {
    return 'invalid';
  }

  const sales = locks * 45 + stocks * 30 + barrels * 25;

  if (sales <= 1000) {
    return sales * 0.1;
  }

  if (sales <= 1800) {
    return 100 + (sales - 1000) * 0.15;
  }

  return 220 + (sales - 1800) * 0.2;
}`
    },
    {
      id: "next-date-leap-year",
      name: "Next Date Leap-Year Variant",
      language: "javascript",
      description: "A next-date variant that separates leap-year February handling from other month transitions.",
      sourceCode: `function nextDateLeapYear(year, month, day) {
  if (!isValidDate(year, month, day)) {
    return 'invalid';
  }

  if (month === 2 && isLeapYear(year) && day === 28) {
    return { year, month: 2, day: 29 };
  }

  if (day < daysInMonth(year, month)) {
    return { year, month, day: day + 1 };
  }

  if (month === 12) {
    return { year: year + 1, month: 1, day: 1 };
  }

  return { year, month: month + 1, day: 1 };
}`
    }
  ];

  // src/components/TestingMethodTree.js
  function createTestingMethodTree() {
    const root2 = document.createElement("div");
    let expandedIds = /* @__PURE__ */ new Set();
    function render() {
      const allExpanded = expandedIds.size === testingMethods.length;
      root2.className = "testing-method-tree";
      root2.dataset.testid = "testing-method-tree";
      root2.innerHTML = `
      <div class="tree-controls">
        <button class="btn-toggle-all" type="button" data-testid="toggle-all-btn">
          ${allExpanded ? "\u5168\u90E8\u6536\u5408" : "\u5168\u90E8\u5C55\u958B"}
        </button>
      </div>
      <div class="tree-cards">
        ${testingMethods.map((method) => {
        const expanded = expandedIds.has(method.id);
        return `
            <div class="method-card method-card--${method.colorScheme}${expanded ? " method-card--expanded" : ""}" data-testid="method-card-${method.id}">
              <button
                class="method-card-header"
                type="button"
                data-testid="method-card-btn-${method.id}"
                aria-expanded="${expanded}"
              >
                <div class="method-card-title">
                  <h3>${method.name}</h3>
                  <span class="method-card-en">${method.nameEn}</span>
                </div>
                <span class="method-card-toggle${expanded ? " rotated" : ""}">\u25B7</span>
              </button>
              <div class="method-card-body">
                <p class="method-description">${method.description}</p>
                <div class="visibility-meter" aria-label="\u4EE3\u78BC\u53EF\u898B\u5EA6 ${method.visibility}%">
                  <span class="visibility-label">\u4EE3\u78BC\u53EF\u898B\u5EA6</span>
                  <div class="visibility-track">
                    <div
                      class="visibility-fill"
                      style="width: ${method.visibility}%"
                      data-testid="visibility-fill"
                      role="progressbar"
                      aria-valuenow="${method.visibility}"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <span class="visibility-value">${method.visibility}%</span>
                </div>
                <div class="method-count-badge">${method.techniques.length} \u9805\u6280\u8853</div>
                ${expanded ? `
                  <ul class="technique-list" data-testid="technique-list-${method.id}">
                    ${method.techniques.map((tech, index) => `
                      <li
                        class="technique-item"
                        data-testid="technique-${tech.id}"
                        style="animation-delay: ${index * 0.06}s"
                      >
                        <div class="technique-name">${tech.name}</div>
                        <div class="technique-name-en">${tech.nameEn}</div>
                        <div class="technique-desc">${tech.description}</div>
                      </li>
                    `).join("")}
                  </ul>
                ` : ""}
              </div>
            </div>
          `;
      }).join("")}
      </div>
    `;
      root2.querySelector('[data-testid="toggle-all-btn"]').addEventListener("click", () => {
        expandedIds = allExpanded ? /* @__PURE__ */ new Set() : new Set(testingMethods.map((method) => method.id));
        render();
      });
      testingMethods.forEach((method) => {
        root2.querySelector(`[data-testid="method-card-btn-${method.id}"]`).addEventListener("click", () => {
          const next = new Set(expandedIds);
          if (next.has(method.id)) {
            next.delete(method.id);
          } else {
            next.add(method.id);
          }
          expandedIds = next;
          render();
        });
      });
    }
    render();
    return root2;
  }

  // src/utils/graphCoverage.js
  function buildAdjacency(graph) {
    const adjacency = /* @__PURE__ */ new Map();
    graph.nodes.forEach((node) => {
      adjacency.set(node.id, []);
    });
    graph.edges.forEach((edge) => {
      adjacency.get(edge.from).push(edge);
    });
    return adjacency;
  }
  function normalizeGraph(graph) {
    const nodes = Array.isArray(graph == null ? void 0 : graph.nodes) ? graph.nodes : [];
    const edges = Array.isArray(graph == null ? void 0 : graph.edges) ? graph.edges : [];
    return {
      ...graph,
      nodes,
      edges
    };
  }
  function buildReverseAdjacency(graph) {
    const reverseAdjacency = /* @__PURE__ */ new Map();
    graph.nodes.forEach((node) => {
      reverseAdjacency.set(node.id, []);
    });
    graph.edges.forEach((edge) => {
      reverseAdjacency.get(edge.to).push(edge);
    });
    return reverseAdjacency;
  }
  function isCycle(path) {
    return path.length > 2 && path[0] === path[path.length - 1];
  }
  function canonicalCycleKey(path) {
    const cycleBody = path.slice(0, -1);
    const rotations = cycleBody.map((_, index) => {
      const rotated = [...cycleBody.slice(index), ...cycleBody.slice(0, index)];
      return [...rotated, rotated[0]].join("->");
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
  function containsNodePath(path, targetNodes) {
    if (!targetNodes.length || targetNodes.length > path.length) {
      return false;
    }
    for (let index = 0; index <= path.length - targetNodes.length; index += 1) {
      const matched = targetNodes.every((nodeId, offset) => path[index + offset] === nodeId);
      if (matched) {
        return true;
      }
    }
    return false;
  }
  function containsEdgePath(pathEdges, targetEdges) {
    if (!targetEdges.length || targetEdges.length > pathEdges.length) {
      return false;
    }
    for (let index = 0; index <= pathEdges.length - targetEdges.length; index += 1) {
      const matched = targetEdges.every((edgeId, offset) => pathEdges[index + offset] === edgeId);
      if (matched) {
        return true;
      }
    }
    return false;
  }
  function requirementCoveredByRecord(requirement, record) {
    if (requirement.type === "node") {
      return record.path.includes(requirement.nodes[0]);
    }
    if (requirement.type === "edge") {
      return record.edgeIds.includes(requirement.edges[0]);
    }
    if (requirement.type === "edge-pair") {
      return containsEdgePath(record.edgeIds, requirement.edges);
    }
    if (requirement.type === "prime-path" || requirement.type === "complete-path") {
      return containsNodePath(record.path, requirement.nodes);
    }
    return false;
  }
  function greedySetCover(pathRecords, requirements) {
    const uncovered = new Set(requirements.map((item) => item.id));
    const selected = [];
    while (uncovered.size > 0) {
      let bestRecord = null;
      let bestGain = 0;
      pathRecords.forEach((record) => {
        const gain = record.covers.reduce(
          (count, requirementId) => count + (uncovered.has(requirementId) ? 1 : 0),
          0
        );
        if (gain > bestGain) {
          bestGain = gain;
          bestRecord = record;
        }
      });
      if (!bestRecord || bestGain === 0) {
        break;
      }
      selected.push(bestRecord.path);
      bestRecord.covers.forEach((requirementId) => {
        uncovered.delete(requirementId);
      });
    }
    return {
      selectedPaths: selected,
      uncoveredRequirementIds: uncovered
    };
  }
  function enumerateSimplePaths(graph) {
    const normalizedGraph = normalizeGraph(graph);
    const adjacency = buildAdjacency(normalizedGraph);
    const uniquePaths = /* @__PURE__ */ new Map();
    function addPath(path) {
      if (path.length < 2) {
        return;
      }
      const key = isCycle(path) ? canonicalCycleKey(path) : path.join("->");
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
          addPath([...path, nextNodeId]);
          return;
        }
        if (!visited.has(nextNodeId)) {
          const nextPath = [...path, nextNodeId];
          addPath(nextPath);
          visited.add(nextNodeId);
          dfs(startNodeId, nextPath, visited);
          visited.delete(nextNodeId);
        }
      });
    }
    normalizedGraph.nodes.forEach((node) => {
      dfs(node.id, [node.id], /* @__PURE__ */ new Set([node.id]));
    });
    return Array.from(uniquePaths.values());
  }
  function canExtendForward(path, graph, adjacency) {
    if (isCycle(path)) {
      return false;
    }
    const currentNodeId = path[path.length - 1];
    const outgoingEdges = adjacency.get(currentNodeId) || [];
    return outgoingEdges.some((edge) => {
      const nextNodeId = edge.to;
      return nextNodeId === path[0] || !path.includes(nextNodeId);
    });
  }
  function canExtendBackward(path, reverseAdjacency) {
    if (isCycle(path)) {
      return false;
    }
    const firstNodeId = path[0];
    const incomingEdges = reverseAdjacency.get(firstNodeId) || [];
    return incomingEdges.some((edge) => {
      const previousNodeId = edge.from;
      return previousNodeId === path[path.length - 1] || !path.includes(previousNodeId);
    });
  }
  function getPrimePaths(graph) {
    const normalizedGraph = normalizeGraph(graph);
    const adjacency = buildAdjacency(normalizedGraph);
    const reverseAdjacency = buildReverseAdjacency(normalizedGraph);
    return enumerateSimplePaths(normalizedGraph).filter((path) => {
      if (isCycle(path)) {
        return true;
      }
      return !canExtendForward(path, graph, adjacency) && !canExtendBackward(path, reverseAdjacency);
    });
  }
  function getNodeRequirements(graph) {
    const normalizedGraph = normalizeGraph(graph);
    return normalizedGraph.nodes.map((node) => ({
      id: `node-${node.id}`,
      type: "node",
      label: `Node ${node.label}`,
      displayText: node.label,
      nodes: [node.id],
      edges: []
    }));
  }
  function getEdgeRequirements(graph) {
    const normalizedGraph = normalizeGraph(graph);
    return normalizedGraph.edges.map((edge) => ({
      id: `edge-${edge.id}`,
      type: "edge",
      label: `Edge ${edge.from} -> ${edge.to}`,
      displayText: `${edge.from} -> ${edge.to}`,
      nodes: [edge.from, edge.to],
      edges: [edge.id]
    }));
  }
  function getPrimePathRequirements(graph) {
    const normalizedGraph = normalizeGraph(graph);
    return getPrimePaths(normalizedGraph).map((path, index) => ({
      id: `prime-path-${index + 1}`,
      type: "prime-path",
      label: `Path ${path.join(" -> ")}`,
      displayText: path.join(" -> "),
      nodes: [...new Set(path)],
      edges: edgeIdsFromPath(normalizedGraph, path),
      path
    }));
  }
  function getEdgePairRequirements(graph) {
    const normalizedGraph = normalizeGraph(graph);
    const adjacency = buildAdjacency(normalizedGraph);
    const pairMap = /* @__PURE__ */ new Map();
    normalizedGraph.edges.forEach((firstEdge) => {
      const nextEdges = adjacency.get(firstEdge.to) || [];
      nextEdges.forEach((secondEdge) => {
        const id = `edge-pair-${firstEdge.id}__${secondEdge.id}`;
        if (!pairMap.has(id)) {
          pairMap.set(id, {
            id,
            type: "edge-pair",
            label: `Edge Pair ${firstEdge.from} -> ${firstEdge.to} -> ${secondEdge.to}`,
            displayText: `${firstEdge.from} -> ${firstEdge.to} -> ${secondEdge.to}`,
            nodes: [firstEdge.from, firstEdge.to, secondEdge.to],
            edges: [firstEdge.id, secondEdge.id]
          });
        }
      });
    });
    return Array.from(pairMap.values());
  }
  function getCompletePathRequirements(graph) {
    const normalizedGraph = normalizeGraph(graph);
    const testPaths = generateTestPaths(normalizedGraph, { maxDepthMultiplier: 2 });
    return testPaths.map((path, index) => ({
      id: `complete-path-${index + 1}`,
      type: "complete-path",
      label: `Complete Path ${path.join(" -> ")}`,
      displayText: path.join(" -> "),
      nodes: path,
      edges: edgeIdsFromPath(normalizedGraph, path),
      path
    }));
  }
  function generateTestPaths(graph, options = {}) {
    var _a, _b;
    const normalizedGraph = normalizeGraph(graph);
    const adjacency = buildAdjacency(normalizedGraph);
    const nodeVisitLimit = (_a = options.nodeVisitLimit) != null ? _a : 2;
    const maxDepthMultiplier = (_b = options.maxDepthMultiplier) != null ? _b : 2;
    const maxDepth = Math.max(2, normalizedGraph.nodes.length * maxDepthMultiplier);
    const uniquePaths = /* @__PURE__ */ new Map();
    if (!normalizedGraph.startNodeId || !normalizedGraph.endNodeId) {
      return [];
    }
    function dfs(currentNodeId, path, visitCount2) {
      if (path.length > maxDepth) {
        return;
      }
      if (currentNodeId === normalizedGraph.endNodeId) {
        const key = path.join("->");
        if (!uniquePaths.has(key)) {
          uniquePaths.set(key, [...path]);
        }
        return;
      }
      const outgoingEdges = adjacency.get(currentNodeId) || [];
      outgoingEdges.forEach((edge) => {
        const nextNodeId = edge.to;
        const visited = visitCount2.get(nextNodeId) || 0;
        if (visited >= nodeVisitLimit) {
          return;
        }
        visitCount2.set(nextNodeId, visited + 1);
        path.push(nextNodeId);
        dfs(nextNodeId, path, visitCount2);
        path.pop();
        visitCount2.set(nextNodeId, visited);
      });
    }
    const visitCount = /* @__PURE__ */ new Map([[normalizedGraph.startNodeId, 1]]);
    dfs(normalizedGraph.startNodeId, [normalizedGraph.startNodeId], visitCount);
    return Array.from(uniquePaths.values());
  }
  function buildTestPathSetForRequirements(graph, requirements, options = {}) {
    var _a;
    const normalizedGraph = normalizeGraph(graph);
    const candidatePaths = generateTestPaths(normalizedGraph, options);
    const optimizationMode = (_a = options.optimization) != null ? _a : "greedy-set-cover";
    const pathRecords = candidatePaths.map((path) => ({
      path,
      edgeIds: edgeIdsFromPath(normalizedGraph, path)
    }));
    pathRecords.forEach((record) => {
      record.covers = requirements.filter((requirement) => requirementCoveredByRecord(requirement, record)).map((requirement) => requirement.id);
    });
    const requirementPaths = requirements.map((requirement) => {
      const matchedRecord = pathRecords.find((record) => requirementCoveredByRecord(requirement, record));
      return {
        requirement,
        path: matchedRecord ? matchedRecord.path : null,
        covered: Boolean(matchedRecord)
      };
    });
    const baselinePathSet = new Set(
      requirementPaths.filter((entry) => entry.covered).map((entry) => entry.path.join("->"))
    );
    let selectedPaths;
    let uncoveredRequirementIds;
    if (optimizationMode === "none") {
      selectedPaths = Array.from(baselinePathSet).map((item) => item.split("->"));
      uncoveredRequirementIds = new Set(
        requirementPaths.filter((entry) => !entry.covered).map((entry) => entry.requirement.id)
      );
    } else {
      const optimized = greedySetCover(pathRecords, requirements);
      selectedPaths = optimized.selectedPaths;
      uncoveredRequirementIds = optimized.uncoveredRequirementIds;
    }
    return {
      candidatePaths,
      requirementPaths,
      selectedPaths,
      optimizationMetrics: {
        baselinePathCount: baselinePathSet.size,
        optimizedPathCount: selectedPaths.length,
        savedPathCount: Math.max(0, baselinePathSet.size - selectedPaths.length),
        optimizationMode
      },
      uncoveredRequirements: requirementPaths.filter((entry) => !entry.covered || uncoveredRequirementIds.has(entry.requirement.id)).map((entry) => entry.requirement)
    };
  }
  function getCoverageRequirements(graph, criterion) {
    if (criterion === "node") {
      return getNodeRequirements(graph);
    }
    if (criterion === "edge") {
      return getEdgeRequirements(graph);
    }
    if (criterion === "prime-path") {
      return getPrimePathRequirements(graph);
    }
    if (criterion === "edge-pair") {
      return getEdgePairRequirements(graph);
    }
    if (criterion === "complete-path") {
      return getCompletePathRequirements(graph);
    }
    return [];
  }

  // src/utils/programToGraph.js
  function summarizeText(text, maxLength = 26) {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (normalized.length <= maxLength) {
      return normalized;
    }
    return `${normalized.slice(0, maxLength - 1)}\u2026`;
  }
  function stripBlockComments(source) {
    return source.replace(/\/\*[\s\S]*?\*\//g, "");
  }
  function normalizeJavascriptLines(source) {
    return stripBlockComments(source).replace(/}\s*else\s+if/g, "}\nelse if").replace(/}\s*else/g, "}\nelse").split("\n").map((line) => line.replace(/\/\/.*$/g, "").trim()).filter(Boolean);
  }
  function normalizePseudocodeLines(source) {
    return stripBlockComments(source).split("\n").map((line) => line.replace(/#.*$/g, "").replace(/\/\/.*$/g, "").trim()).filter(Boolean);
  }
  function extractParenthesizedContent(line) {
    const match = line.match(/^[^(]*\((.*)\)\s*\{?\s*$/);
    return match ? match[1].trim() : "";
  }
  function createParserState(lines) {
    return { lines, index: 0 };
  }
  function currentLine(state) {
    return state.lines[state.index] || null;
  }
  function consumeLine(state) {
    const line = currentLine(state);
    state.index += 1;
    return line;
  }
  function parseJavascriptSingleStatement(state) {
    const line = currentLine(state);
    if (!line) {
      return [];
    }
    if (line.startsWith("if")) {
      return [parseJavascriptIf(state)];
    }
    if (line.startsWith("while")) {
      return [parseJavascriptWhile(state)];
    }
    if (line.startsWith("for")) {
      return [parseJavascriptFor(state)];
    }
    if (line.startsWith("return")) {
      consumeLine(state);
      return [{ type: "return", text: line.replace(/;$/, "") }];
    }
    consumeLine(state);
    return [{ type: "statement", text: line.replace(/;$/, "") }];
  }
  function parseJavascriptIf(state) {
    const line = consumeLine(state);
    const condition = extractParenthesizedContent(line) || line.replace(/^if\s*/, "").replace(/\{$/, "").trim();
    const consequent = line.endsWith("{") ? parseJavascriptStatements(state) : parseJavascriptSingleStatement(state);
    let alternate = [];
    const nextLine = currentLine(state);
    if (nextLine == null ? void 0 : nextLine.startsWith("else if")) {
      state.lines[state.index] = nextLine.replace(/^else\s+/, "");
      alternate = [parseJavascriptIf(state)];
    } else if (nextLine == null ? void 0 : nextLine.startsWith("else")) {
      const elseLine = consumeLine(state);
      alternate = elseLine.endsWith("{") ? parseJavascriptStatements(state) : parseJavascriptSingleStatement(state);
    }
    return {
      type: "if",
      condition,
      consequent,
      alternate
    };
  }
  function parseJavascriptWhile(state) {
    const line = consumeLine(state);
    const condition = extractParenthesizedContent(line) || line.replace(/^while\s*/, "").replace(/\{$/, "").trim();
    const body = line.endsWith("{") ? parseJavascriptStatements(state) : parseJavascriptSingleStatement(state);
    return {
      type: "while",
      condition,
      body
    };
  }
  function parseJavascriptFor(state) {
    const line = consumeLine(state);
    const condition = extractParenthesizedContent(line) || line.replace(/^for\s*/, "").replace(/\{$/, "").trim();
    const body = line.endsWith("{") ? parseJavascriptStatements(state) : parseJavascriptSingleStatement(state);
    return {
      type: "for",
      condition,
      body
    };
  }
  function parseJavascriptStatements(state) {
    const statements = [];
    while (state.index < state.lines.length) {
      const line = currentLine(state);
      if (!line) {
        break;
      }
      if (line === "}") {
        consumeLine(state);
        break;
      }
      if (line.startsWith("else")) {
        break;
      }
      if ((line.startsWith("function ") || line.startsWith("export function ")) && line.endsWith("{")) {
        consumeLine(state);
        statements.push(...parseJavascriptStatements(state));
        continue;
      }
      if (line === "{") {
        consumeLine(state);
        statements.push(...parseJavascriptStatements(state));
        continue;
      }
      if (line.startsWith("if")) {
        statements.push(parseJavascriptIf(state));
        continue;
      }
      if (line.startsWith("while")) {
        statements.push(parseJavascriptWhile(state));
        continue;
      }
      if (line.startsWith("for")) {
        statements.push(parseJavascriptFor(state));
        continue;
      }
      if (line.startsWith("return")) {
        statements.push({ type: "return", text: consumeLine(state).replace(/;$/, "") });
        continue;
      }
      statements.push({ type: "statement", text: consumeLine(state).replace(/;$/, "") });
    }
    return statements;
  }
  function parsePseudocodeIf(state) {
    const line = consumeLine(state);
    const condition = line.replace(/^IF\s*/i, "").replace(/\s*THEN$/i, "").trim();
    const consequent = parsePseudocodeStatements(state, ["ELSE", "ELSE IF", "END IF", "ENDIF", "END"]);
    let alternate = [];
    const nextLine = currentLine(state);
    if (/^ELSE IF\b/i.test(nextLine || "")) {
      state.lines[state.index] = nextLine.replace(/^ELSE\s+/i, "");
      alternate = [parsePseudocodeIf(state)];
    } else if (/^ELSE\b/i.test(nextLine || "")) {
      consumeLine(state);
      alternate = parsePseudocodeStatements(state, ["END IF", "ENDIF", "END"]);
    }
    if (/^(END IF|ENDIF|END)$/i.test(currentLine(state) || "")) {
      consumeLine(state);
    }
    return {
      type: "if",
      condition,
      consequent,
      alternate
    };
  }
  function parsePseudocodeLoop(state) {
    const line = consumeLine(state);
    const condition = line.replace(/^(WHILE|FOR)\s*/i, "").replace(/\s*DO$/i, "").trim();
    const body = parsePseudocodeStatements(state, ["END WHILE", "END FOR", "END"]);
    if (/^(END WHILE|END FOR|END)$/i.test(currentLine(state) || "")) {
      consumeLine(state);
    }
    return {
      type: /^WHILE\b/i.test(line) ? "while" : "for",
      condition,
      body
    };
  }
  function parsePseudocodeStatements(state, stopTokens = []) {
    const statements = [];
    while (state.index < state.lines.length) {
      const line = currentLine(state);
      if (!line) {
        break;
      }
      const upper = line.toUpperCase();
      if (stopTokens.some((token) => upper.startsWith(token))) {
        break;
      }
      if (/^FUNCTION\b/i.test(line)) {
        consumeLine(state);
        continue;
      }
      if (/^IF\b/i.test(line)) {
        statements.push(parsePseudocodeIf(state));
        continue;
      }
      if (/^(WHILE|FOR)\b/i.test(line)) {
        statements.push(parsePseudocodeLoop(state));
        continue;
      }
      if (/^RETURN\b/i.test(line)) {
        statements.push({ type: "return", text: consumeLine(state) });
        continue;
      }
      statements.push({ type: "statement", text: consumeLine(state) });
    }
    return statements;
  }
  function parseStructuredProgram(sourceCode, language) {
    if (!sourceCode.trim()) {
      throw new Error("\u7A0B\u5F0F\u78BC\u5167\u5BB9\u4E0D\u80FD\u70BA\u7A7A\u3002");
    }
    if (language === "javascript") {
      return parseJavascriptStatements(createParserState(normalizeJavascriptLines(sourceCode)));
    }
    if (language === "pseudocode") {
      return parsePseudocodeStatements(createParserState(normalizePseudocodeLines(sourceCode)));
    }
    throw new Error(`\u76EE\u524D\u4E0D\u652F\u63F4 ${language} \u7684\u81EA\u52D5 CFG \u7522\u751F\u3002`);
  }
  function createGraphBuilder(title) {
    return {
      title,
      sequence: 0,
      nodes: [{ id: "S", label: "Start", kind: "start" }],
      edges: [],
      terminalNodes: []
    };
  }
  function addNode(builder, label, kind = "node") {
    builder.sequence += 1;
    const id = `N${builder.sequence}`;
    builder.nodes.push({
      id,
      label: summarizeText(label),
      kind
    });
    return id;
  }
  function addEdge(builder, from, to) {
    builder.edges.push({
      id: `${from}-${to}-${builder.edges.length + 1}`,
      from,
      to
    });
  }
  function buildSequence(builder, statements) {
    let entry = null;
    let exits = [];
    statements.forEach((statement) => {
      const built = buildStatement(builder, statement);
      if (!entry) {
        entry = built.entry;
      }
      exits.forEach((exitId) => {
        addEdge(builder, exitId, built.entry);
      });
      exits = [...built.exits];
    });
    return { entry, exits };
  }
  function buildIfStatement(builder, statement) {
    var _a;
    const decisionId = addNode(builder, `${statement.condition}?`, "decision");
    const consequent = buildSequence(builder, statement.consequent);
    const alternate = buildSequence(builder, statement.alternate || []);
    const needsMerge = consequent.exits.length > 0 || alternate.exits.length > 0 || !((_a = statement.alternate) == null ? void 0 : _a.length);
    const mergeId = needsMerge ? addNode(builder, "Merge", "node") : null;
    if (consequent.entry) {
      addEdge(builder, decisionId, consequent.entry);
    } else if (mergeId) {
      addEdge(builder, decisionId, mergeId);
    }
    if (alternate.entry) {
      addEdge(builder, decisionId, alternate.entry);
    } else if (mergeId) {
      addEdge(builder, decisionId, mergeId);
    }
    consequent.exits.forEach((exitId) => {
      if (mergeId) {
        addEdge(builder, exitId, mergeId);
      }
    });
    alternate.exits.forEach((exitId) => {
      if (mergeId) {
        addEdge(builder, exitId, mergeId);
      }
    });
    return {
      entry: decisionId,
      exits: mergeId ? [mergeId] : []
    };
  }
  function buildLoopStatement(builder, statement) {
    const decisionId = addNode(builder, `${statement.condition}?`, "decision");
    const body = buildSequence(builder, statement.body || []);
    const mergeId = addNode(builder, "Loop Exit", "node");
    if (body.entry) {
      addEdge(builder, decisionId, body.entry);
      body.exits.forEach((exitId) => {
        addEdge(builder, exitId, decisionId);
      });
    } else {
      addEdge(builder, decisionId, decisionId);
    }
    addEdge(builder, decisionId, mergeId);
    return {
      entry: decisionId,
      exits: [mergeId]
    };
  }
  function buildStatement(builder, statement) {
    if (statement.type === "if") {
      return buildIfStatement(builder, statement);
    }
    if (statement.type === "while" || statement.type === "for") {
      return buildLoopStatement(builder, statement);
    }
    if (statement.type === "return") {
      const returnId = addNode(builder, statement.text, "node");
      builder.terminalNodes.push(returnId);
      return {
        entry: returnId,
        exits: []
      };
    }
    const statementId = addNode(builder, statement.text, "node");
    return {
      entry: statementId,
      exits: [statementId]
    };
  }
  function computeDepths(nodes, edges) {
    const adjacency = new Map(nodes.map((node) => [node.id, []]));
    const depths = /* @__PURE__ */ new Map([["S", 0]]);
    const queue = ["S"];
    edges.forEach((edge) => {
      var _a;
      (_a = adjacency.get(edge.from)) == null ? void 0 : _a.push(edge.to);
    });
    while (queue.length) {
      const current = queue.shift();
      const currentDepth = depths.get(current) || 0;
      (adjacency.get(current) || []).forEach((next) => {
        if (!depths.has(next)) {
          depths.set(next, currentDepth + 1);
          queue.push(next);
        }
      });
    }
    return depths;
  }
  function assignLayout(nodes, edges) {
    const depths = computeDepths(nodes, edges);
    const grouped = /* @__PURE__ */ new Map();
    nodes.forEach((node) => {
      var _a;
      const depth = (_a = depths.get(node.id)) != null ? _a : 1;
      if (!grouped.has(depth)) {
        grouped.set(depth, []);
      }
      grouped.get(depth).push(node);
    });
    Array.from(grouped.entries()).forEach(([depth, group]) => {
      group.forEach((node, index) => {
        node.x = 90 + depth * 150;
        node.y = 90 + index * 100;
      });
    });
    const coordinates = new Map(nodes.map((node) => [node.id, node]));
    edges.forEach((edge) => {
      const fromNode = coordinates.get(edge.from);
      const toNode = coordinates.get(edge.to);
      if (fromNode && toNode && toNode.x <= fromNode.x) {
        edge.control = {
          x: Math.round((fromNode.x + toNode.x) / 2),
          y: Math.min(fromNode.y, toNode.y) - 70
        };
      }
    });
  }
  function generateControlFlowGraphFromProgram({ sourceCode, language, title }) {
    const statements = parseStructuredProgram(sourceCode, language);
    const builder = createGraphBuilder(title || "Generated Control Flow Graph");
    const built = buildSequence(builder, statements);
    builder.nodes.push({ id: "T", label: "End", kind: "end" });
    if (built.entry) {
      addEdge(builder, "S", built.entry);
    } else {
      addEdge(builder, "S", "T");
    }
    built.exits.forEach((exitId) => {
      addEdge(builder, exitId, "T");
    });
    builder.terminalNodes.forEach((terminalId) => {
      addEdge(builder, terminalId, "T");
    });
    assignLayout(builder.nodes, builder.edges);
    return {
      id: `${(title || "generated").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-cfg`,
      title: title || "Generated Control Flow Graph",
      startNodeId: "S",
      endNodeId: "T",
      nodes: builder.nodes,
      edges: builder.edges
    };
  }

  // src/components/GraphCoverageExplorer.js
  function cloneGraph(graph) {
    return {
      ...graph,
      nodes: graph.nodes.map((node) => ({ ...node })),
      edges: graph.edges.map((edge) => ({
        ...edge,
        control: edge.control ? { ...edge.control } : void 0
      }))
    };
  }
  function escapeHtml(value = "") {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  function createDraftFromGraph(graph) {
    return {
      nodesText: serializeNodes(graph.nodes),
      edgesText: serializeEdges(graph.edges),
      startNodeId: graph.startNodeId,
      endNodeId: graph.endNodeId
    };
  }
  function serializeNodes(nodes) {
    return nodes.map((node) => `${node.id},${node.label},${node.x},${node.y}`).join("\n");
  }
  function serializeEdges(edges) {
    return edges.map((edge) => {
      var _a, _b;
      if (((_a = edge.control) == null ? void 0 : _a.x) !== void 0 && ((_b = edge.control) == null ? void 0 : _b.y) !== void 0) {
        return `${edge.id},${edge.from},${edge.to},${edge.control.x},${edge.control.y}`;
      }
      return `${edge.id},${edge.from},${edge.to}`;
    }).join("\n");
  }
  function parseNodesText(nodesText) {
    const rows = nodesText.split("\n").map((item) => item.trim()).filter(Boolean);
    if (!rows.length) {
      throw new Error("\u7BC0\u9EDE\u4E0D\u80FD\u70BA\u7A7A\u3002");
    }
    return rows.map((row, index) => {
      const [id, label, x, y] = row.split(",").map((item) => item.trim());
      if (!id || !label || x === void 0 || y === void 0) {
        throw new Error(`\u7BC0\u9EDE\u683C\u5F0F\u932F\u8AA4\uFF08\u7B2C ${index + 1} \u884C\uFF09\uFF0C\u8ACB\u4F7F\u7528 id,label,x,y\u3002`);
      }
      const parsedX = Number(x);
      const parsedY = Number(y);
      if (!Number.isFinite(parsedX) || !Number.isFinite(parsedY)) {
        throw new Error(`\u7BC0\u9EDE\u5EA7\u6A19\u683C\u5F0F\u932F\u8AA4\uFF08\u7B2C ${index + 1} \u884C\uFF09\uFF0Cx,y \u5FC5\u9808\u662F\u6578\u5B57\u3002`);
      }
      return { id, label, x: parsedX, y: parsedY, kind: "node" };
    });
  }
  function parseEdgesText(edgesText, nodeIds) {
    const rows = edgesText.split("\n").map((item) => item.trim()).filter(Boolean);
    if (!rows.length) {
      throw new Error("\u908A\u4E0D\u80FD\u70BA\u7A7A\u3002");
    }
    return rows.map((row, index) => {
      const cols = row.split(",").map((item) => item.trim());
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
        throw new Error(`\u908A\u683C\u5F0F\u932F\u8AA4\uFF08\u7B2C ${index + 1} \u884C\uFF09\uFF0C\u8ACB\u4F7F\u7528 from,to \u6216 id,from,to \u6216 id,from,to,cx,cy\u3002`);
      }
      if (!from || !to) {
        throw new Error(`\u908A\u683C\u5F0F\u932F\u8AA4\uFF08\u7B2C ${index + 1} \u884C\uFF09\uFF0C\u7F3A\u5C11 from/to\u3002`);
      }
      if (!nodeIds.has(from) || !nodeIds.has(to)) {
        throw new Error(`\u908A\u7BC0\u9EDE\u4E0D\u5B58\u5728\uFF08\u7B2C ${index + 1} \u884C\uFF09\uFF1A${from} -> ${to}`);
      }
      if (controlX !== void 0 && controlY !== void 0) {
        const cx = Number(controlX);
        const cy = Number(controlY);
        if (!Number.isFinite(cx) || !Number.isFinite(cy)) {
          throw new Error(`\u908A\u63A7\u5236\u9EDE\u683C\u5F0F\u932F\u8AA4\uFF08\u7B2C ${index + 1} \u884C\uFF09\uFF0Ccx,cy \u5FC5\u9808\u662F\u6578\u5B57\u3002`);
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
      throw new Error("Start node \u4E0D\u5B58\u5728\u65BC\u7BC0\u9EDE\u6E05\u55AE\u3002");
    }
    if (!nodeIds.has(endNodeId)) {
      throw new Error("End node \u4E0D\u5B58\u5728\u65BC\u7BC0\u9EDE\u6E05\u55AE\u3002");
    }
    return {
      id: "custom-graph",
      title: "\u81EA\u8A02\u63A7\u5236\u6D41\u7A0B\u5716",
      nodes,
      edges,
      startNodeId,
      endNodeId
    };
  }
  function parseUploadedGraphSpec(rawText) {
    let payload;
    try {
      payload = JSON.parse(rawText);
    } catch {
      throw new Error("\u4E0A\u50B3\u5167\u5BB9\u4E0D\u662F\u6709\u6548\u7684 JSON\u3002");
    }
    const graphPayload = payload.graph || payload;
    if (!graphPayload || !Array.isArray(graphPayload.nodes) || !Array.isArray(graphPayload.edges)) {
      throw new Error("JSON \u9700\u5305\u542B graph \u7269\u4EF6\uFF0C\u6216\u76F4\u63A5\u5305\u542B nodes / edges / startNodeId / endNodeId\u3002");
    }
    const graph = {
      ...graphPayload,
      id: graphPayload.id || payload.id || "uploaded-graph",
      title: graphPayload.title || payload.title || "Uploaded Graph"
    };
    const validatedGraph = parseGraphDraft(createDraftFromGraph(graph));
    return {
      program: {
        id: payload.id || "uploaded-spec",
        name: payload.name || payload.title || graph.title,
        description: payload.description || "Uploaded graph specification for graph coverage exploration.",
        sourceCode: payload.sourceCode || payload.code || "",
        uploadName: payload.fileName || null
      },
      graph: {
        ...validatedGraph,
        id: graph.id,
        title: graph.title
      }
    };
  }
  function readUploadedFile(file) {
    if (typeof file.text === "function") {
      return file.text();
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error("\u7121\u6CD5\u8B80\u53D6\u4E0A\u50B3\u6A94\u6848\u3002"));
      reader.readAsText(file);
    });
  }
  function resolveProgramGraph(program) {
    if (program.sourceCode && program.language) {
      return generateControlFlowGraphFromProgram({
        sourceCode: program.sourceCode,
        language: program.language,
        title: `${program.name} Control Flow Graph`
      });
    }
    if (program.graph) {
      return cloneGraph(program.graph);
    }
    throw new Error("\u627E\u4E0D\u5230\u53EF\u7528\u7684 graph \u4F86\u6E90\u3002");
  }
  function createGraphCanvas(graph, requirement) {
    const highlightedNodes = new Set((requirement == null ? void 0 : requirement.nodes) || []);
    const highlightedEdges = new Set((requirement == null ? void 0 : requirement.edges) || []);
    const width = Math.max(920, ...graph.nodes.map((node) => node.x + 120));
    const height = Math.max(340, ...graph.nodes.map((node) => node.y + 90));
    return `
    <div class="graph-canvas" data-testid="graph-canvas">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Graph coverage \u63A7\u5236\u6D41\u7A0B\u5716">
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
                class="graph-edge${active ? " graph-edge--active" : ""}"
                d="M ${fromNode.x} ${fromNode.y} Q ${edge.control.x} ${edge.control.y} ${toNode.x} ${toNode.y}"
                marker-end="url(#${active ? "arrow-active" : "arrow-default"})"
                data-testid="graph-edge-${edge.id}"
              ></path>
            `;
      }
      return `
            <line
              class="graph-edge${active ? " graph-edge--active" : ""}"
              x1="${fromNode.x}"
              y1="${fromNode.y}"
              x2="${toNode.x}"
              y2="${toNode.y}"
              marker-end="url(#${active ? "arrow-active" : "arrow-default"})"
              data-testid="graph-edge-${edge.id}"
            ></line>
          `;
    }).join("")}
        ${graph.nodes.map((node) => `
          <g class="graph-node${highlightedNodes.has(node.id) ? " graph-node--active" : ""}" data-testid="graph-node-${node.id}">
            <circle cx="${node.x}" cy="${node.y}" r="28"></circle>
            <text x="${node.x}" y="${node.y + 5}" text-anchor="middle">${node.label}</text>
          </g>
        `).join("")}
      </svg>
    </div>
  `;
  }
  function createGraphCoverageExplorer() {
    const root2 = document.createElement("div");
    const defaultGraph = cloneGraph(graphCoverageGraph);
    const defaultProgram = {
      id: "default-sample",
      name: "Default CFG Sample",
      description: "A generic control flow graph used to compare graph coverage criteria on the same structure.",
      sourceCode: ""
    };
    let graph = defaultGraph;
    let baseGraph = cloneGraph(defaultGraph);
    let criterionId = "node";
    let selectedRequirementId = null;
    let parseError = "";
    let sourceStatus = "\u53EF\u5207\u63DB\u56FA\u5B9A\u7A0B\u5F0F\u7BC4\u4F8B\uFF0C\u6216\u4E0A\u50B3 JSON graph spec\u3001\u7A0B\u5F0F\u78BC\u6A94\u6848\u3002";
    let activeProgram = defaultProgram;
    let selectedProgramId = defaultProgram.id;
    let selectedCodeLanguage = "javascript";
    let autoApplyTimer = null;
    let draft = createDraftFromGraph(defaultGraph);
    function loadGraphSource(program, nextGraph, statusMessage) {
      activeProgram = { ...program };
      selectedProgramId = program.id;
      baseGraph = cloneGraph(nextGraph);
      graph = cloneGraph(nextGraph);
      draft = createDraftFromGraph(graph);
      parseError = "";
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
            title: `${activeProgram.name} CFG`
          };
          parseError = "";
          sourceStatus = `${activeProgram.name} \u5DF2\u4F9D\u7167\u7DE8\u8F2F\u5167\u5BB9\u91CD\u65B0\u8A08\u7B97\u3002`;
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
      parseError = "";
      sourceStatus = `${activeProgram.name} \u5DF2\u9084\u539F\u70BA\u8F09\u5165\u6642\u7684 graph\u3002`;
      selectedRequirementId = null;
      render();
    }
    function getState() {
      var _a;
      const requirements = getCoverageRequirements(graph, criterionId);
      if (!requirements.some((item) => item.id === selectedRequirementId)) {
        selectedRequirementId = ((_a = requirements[0]) == null ? void 0 : _a.id) || null;
      }
      const selectedRequirement = requirements.find((item) => item.id === selectedRequirementId) || requirements[0] || null;
      const selectedCriterion = graphCoverageCriteria.find((item) => item.id === criterionId);
      const pathPlan = buildTestPathSetForRequirements(graph, requirements);
      return {
        requirements,
        selectedRequirement,
        selectedCriterion,
        pathPlan
      };
    }
    function render() {
      const { requirements, selectedRequirement, selectedCriterion, pathPlan } = getState();
      root2.className = "graph-coverage";
      root2.dataset.testid = "graph-coverage-explorer";
      root2.innerHTML = `
      <div class="graph-source-card" data-testid="graph-source-card">
        <div class="graph-source-toolbar">
          <label>
            Program Example
            <select data-testid="program-example-select">
              <option value="${defaultProgram.id}"${selectedProgramId === defaultProgram.id ? " selected" : ""}>Default CFG Sample</option>
              ${graphCoverageProgramExamples.map((example) => `
                <option value="${example.id}"${selectedProgramId === example.id ? " selected" : ""}>${example.name}</option>
              `).join("")}
              <option value="uploaded-code"${selectedProgramId === "uploaded-code" ? " selected" : ""}>Uploaded Source Code</option>
              <option value="uploaded-spec"${selectedProgramId === "uploaded-spec" ? " selected" : ""}>Uploaded Graph Spec</option>
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
                <option value="${language.id}"${selectedCodeLanguage === language.id ? " selected" : ""}>${language.label}</option>
              `).join("")}
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
            <p class="graph-source-status${parseError ? " graph-editor-status--error" : ""}" data-testid="graph-source-status">${parseError || sourceStatus}</p>
          </div>
          <div class="graph-upload-hint">
            <span class="detail-label">Upload Format</span>
            <p>JSON \u53EF\u76F4\u63A5\u63D0\u4F9B graph \u7269\u4EF6\uFF0C\u6216\u76F4\u63A5\u63D0\u4F9B nodes\u3001edges\u3001startNodeId\u3001endNodeId\uFF0C\u4E5F\u53EF\u9644\u5E36 title\u3001description\u3001sourceCode\u3002\u7A0B\u5F0F\u78BC\u4E0A\u50B3\u5247\u6703\u4F9D\u8A9E\u8A00\u985E\u578B\u81EA\u52D5\u7522\u751F\u7C21\u5316 CFG\u3002</p>
          </div>
        </div>
        ${activeProgram.sourceCode ? `<pre class="graph-source-code" data-testid="program-source-code"><code>${escapeHtml(activeProgram.sourceCode)}</code></pre>` : '<p class="graph-source-empty" data-testid="program-source-empty">\u9019\u500B\u4F86\u6E90\u76EE\u524D\u53EA\u63D0\u4F9B graph\uFF0C\u6C92\u6709\u9644\u5E36\u7A0B\u5F0F\u78BC\u7247\u6BB5\u3002</p>'}
      </div>

      <div class="graph-editor-card" data-testid="graph-editor-card">
        <div class="graph-editor-header">
          <h4>Graph Editor</h4>
          <p>\u53EF\u5F9E\u771F\u5BE6\u7A0B\u5F0F\u7BC4\u4F8B\u8F09\u5165 CFG\uFF0C\u518D\u5FAE\u8ABF graph \u4E26\u5373\u6642\u8A08\u7B97 coverage requirements \u8207 test paths\u3002</p>
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
          <button type="button" class="graph-editor-reset" data-testid="graph-reset-btn">\u9084\u539F\u9810\u8A2D\u5716</button>
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
        <p class="graph-editor-status${parseError ? " graph-editor-status--error" : ""}" data-testid="graph-editor-status">
          ${parseError || "Graph \u5DF2\u540C\u6B65\u66F4\u65B0"}
        </p>
      </div>

      <div class="graph-coverage-header">
        <div>
          <p class="graph-coverage-kicker">White Box Testing</p>
          <h3>${graph.title}</h3>
          <p class="graph-coverage-desc">\u7528\u540C\u4E00\u5F35\u63A7\u5236\u6D41\u7A0B\u5716\uFF0C\u5207\u63DB\u4E0D\u540C coverage criteria\uFF0C\u76F4\u63A5\u770B\u5230\u5FC5\u9808\u6DB5\u84CB\u7684\u7BC0\u9EDE\u3001\u908A\u8207 path\u3002</p>
        </div>
        <div class="graph-coverage-stats">
          <div class="graph-stat-card"><span class="graph-stat-label">Nodes</span><strong>${graph.nodes.length}</strong></div>
          <div class="graph-stat-card"><span class="graph-stat-label">Edges</span><strong>${graph.edges.length}</strong></div>
          <div class="graph-stat-card"><span class="graph-stat-label">Requirements</span><strong>${requirements.length}</strong></div>
        </div>
      </div>

      <div class="graph-criterion-switcher" role="tablist" aria-label="coverage criteria \u5207\u63DB">
        ${graphCoverageCriteria.map((criterion) => `
          <button
            class="criterion-chip${criterionId === criterion.id ? " active" : ""}"
            type="button"
            data-testid="criterion-${criterion.id}"
            data-criterion="${criterion.id}"
            role="tab"
            aria-selected="${criterionId === criterion.id}"
          >
            <span>${criterion.labelZh}</span>
            <small>${criterion.label}</small>
          </button>
        `).join("")}
      </div>

      <div class="graph-coverage-layout">
        <div class="graph-main-panel">
          ${createGraphCanvas(graph, selectedRequirement)}
          <div class="graph-selected-summary" data-testid="selected-requirement-summary">
            <span class="summary-label">\u76EE\u524D requirement</span>
            <strong>${(selectedRequirement == null ? void 0 : selectedRequirement.label) || "\u7121"}</strong>
            <p>${(selectedCriterion == null ? void 0 : selectedCriterion.description) || ""}</p>
          </div>

          <div class="graph-test-path-card" data-testid="graph-test-path-card">
            <h4>Generated Test Path Set</h4>
            <p class="sidebar-text">\u5C07 requirement \u81EA\u52D5\u7D44\u5408\u6210\u53EF\u57F7\u884C\u6E2C\u8A66\u8DEF\u5F91\uFF08Start \u5230 End\uFF09\u3002</p>
            <div class="test-path-metrics" data-testid="test-path-metrics">
              <div class="test-path-metric">
                <span class="detail-label">\u6700\u4F73\u5316\u524D</span>
                <strong data-testid="baseline-path-count">${pathPlan.optimizationMetrics.baselinePathCount}</strong>
              </div>
              <div class="test-path-metric">
                <span class="detail-label">\u6700\u4F73\u5316\u5F8C</span>
                <strong data-testid="optimized-path-count">${pathPlan.optimizationMetrics.optimizedPathCount}</strong>
              </div>
              <div class="test-path-metric test-path-metric--accent">
                <span class="detail-label">\u7CBE\u7C21\u6578\u91CF</span>
                <strong data-testid="saved-path-count">${pathPlan.optimizationMetrics.savedPathCount}</strong>
              </div>
            </div>
            <ul class="test-path-list" data-testid="test-path-list">
              ${pathPlan.selectedPaths.map((path, index) => `
                <li data-testid="test-path-${index + 1}">T${index + 1}: ${path.join(" -> ")}</li>
              `).join("") || "<li>\u7121\u53EF\u7528\u8DEF\u5F91</li>"}
            </ul>
            <p class="test-path-meta" data-testid="test-path-meta">
              Covered Requirements: ${pathPlan.requirementPaths.filter((item) => item.covered).length} / ${pathPlan.requirementPaths.length}
            </p>
            ${pathPlan.uncoveredRequirements.length ? `<p class="graph-editor-status graph-editor-status--error">\u5C1A\u672A\u8986\u84CB\uFF1A${pathPlan.uncoveredRequirements.map((item) => item.displayText).join("\u3001")}</p>` : '<p class="graph-editor-status">\u5168\u90E8 requirement \u5DF2\u5C0D\u61C9\u5230 test paths</p>'}
          </div>
        </div>

        <aside class="graph-sidebar">
          <div class="graph-sidebar-card">
            <h4>Test Requirements</h4>
            <p class="sidebar-text">\u5207\u63DB criteria \u5F8C\uFF0C\u5217\u8868\u6703\u91CD\u7B97\u5C0D\u61C9\u5FC5\u9808\u8986\u84CB\u7684 requirement\u3002</p>
            <ul class="requirement-list" data-testid="requirement-list">
              ${requirements.map((requirement) => `
                <li>
                  <button
                    class="requirement-item${(selectedRequirement == null ? void 0 : selectedRequirement.id) === requirement.id ? " active" : ""}"
                    type="button"
                    data-testid="requirement-${requirement.id}"
                    data-requirement-id="${requirement.id}"
                  >
                    <span class="requirement-kind">${requirement.type}</span>
                    <strong>${requirement.displayText}</strong>
                  </button>
                </li>
              `).join("")}
            </ul>
          </div>

          <div class="graph-sidebar-card">
            <h4>Requirement Detail</h4>
            <div class="detail-grid">
              <div>
                <span class="detail-label">Nodes</span>
                <p data-testid="detail-nodes">${(selectedRequirement == null ? void 0 : selectedRequirement.nodes.join(" -> ")) || "\u7121"}</p>
              </div>
              <div>
                <span class="detail-label">Edges</span>
                <p data-testid="detail-edges">${(selectedRequirement == null ? void 0 : selectedRequirement.edges.join(", ")) || "\u7121"}</p>
              </div>
              <div>
                <span class="detail-label">Criterion</span>
                <p>${(selectedCriterion == null ? void 0 : selectedCriterion.labelZh) || ""}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    `;
      root2.querySelector('[data-testid="graph-reset-btn"]').addEventListener("click", () => {
        resetGraph();
      });
      root2.querySelector('[data-testid="program-example-select"]').addEventListener("change", (event) => {
        const nextProgramId = event.target.value;
        if (nextProgramId === defaultProgram.id) {
          loadGraphSource(defaultProgram, defaultGraph, "\u5DF2\u8F09\u5165\u9810\u8A2D\u63A7\u5236\u6D41\u7A0B\u5716\u7BC4\u4F8B\u3002");
          return;
        }
        if (nextProgramId === "uploaded-spec") {
          selectedProgramId = nextProgramId;
          sourceStatus = "\u8ACB\u9078\u64C7 JSON \u6A94\u6848\u4EE5\u4E0A\u50B3 graph spec\u3002";
          render();
          return;
        }
        if (nextProgramId === "uploaded-code") {
          selectedProgramId = nextProgramId;
          sourceStatus = "\u8ACB\u9078\u64C7\u7A0B\u5F0F\u78BC\u6A94\u6848\u8207\u8A9E\u8A00\u985E\u578B\uFF0C\u7CFB\u7D71\u6703\u81EA\u52D5\u7522\u751F\u7C21\u5316 CFG\u3002";
          render();
          return;
        }
        const example = graphCoverageProgramExamples.find((item) => item.id === nextProgramId);
        if (example) {
          const nextGraph = resolveProgramGraph(example);
          selectedCodeLanguage = example.language || selectedCodeLanguage;
          loadGraphSource(example, nextGraph, `\u5DF2\u8F09\u5165 ${example.name}\u3002`);
        }
      });
      root2.querySelector('[data-testid="program-language-select"]').addEventListener("change", (event) => {
        selectedCodeLanguage = event.target.value;
      });
      root2.querySelector('[data-testid="graph-upload-input"]').addEventListener("change", async (event) => {
        const [file] = event.target.files || [];
        if (!file) {
          return;
        }
        try {
          const spec = parseUploadedGraphSpec(await readUploadedFile(file));
          loadGraphSource(
            { ...spec.program, id: "uploaded-spec" },
            spec.graph,
            `\u5DF2\u8F09\u5165\u4E0A\u50B3\u6A94\u6848\uFF1A${file.name}`
          );
        } catch (error) {
          selectedProgramId = "uploaded-spec";
          parseError = error.message;
          render();
        }
      });
      root2.querySelector('[data-testid="code-upload-input"]').addEventListener("change", async (event) => {
        const [file] = event.target.files || [];
        if (!file) {
          return;
        }
        try {
          const sourceCode = await readUploadedFile(file);
          const uploadedProgram = {
            id: "uploaded-code",
            name: file.name.replace(/\.[^.]+$/, "") || "Uploaded Code",
            description: `Uploaded ${selectedCodeLanguage} source file converted into a simplified control flow graph.`,
            sourceCode,
            language: selectedCodeLanguage
          };
          const generatedGraph = resolveProgramGraph(uploadedProgram);
          loadGraphSource(uploadedProgram, generatedGraph, `\u5DF2\u6839\u64DA ${file.name} \u81EA\u52D5\u7522\u751F\u7C21\u5316 CFG\u3002`);
        } catch (error) {
          parseError = error.message;
          sourceStatus = "\u7A0B\u5F0F\u78BC\u4E0A\u50B3\u5931\u6557\u3002";
          render();
        }
      });
      root2.querySelectorAll("[data-draft-field]").forEach((input) => {
        input.addEventListener("input", () => {
          draft = {
            ...draft,
            [input.dataset.draftField]: input.value
          };
          scheduleAutoApply();
        });
      });
      root2.querySelectorAll("[data-criterion]").forEach((button) => {
        button.addEventListener("click", () => {
          criterionId = button.dataset.criterion;
          selectedRequirementId = null;
          render();
        });
      });
      root2.querySelectorAll("[data-requirement-id]").forEach((button) => {
        button.addEventListener("click", () => {
          selectedRequirementId = button.dataset.requirementId;
          render();
        });
      });
    }
    render();
    return root2;
  }

  // src/components/TestingFlow.js
  function createTestingFlow() {
    const root2 = document.createElement("div");
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
      root2.className = "testing-flow";
      root2.dataset.testid = "testing-flow";
      root2.innerHTML = `
      <div class="flow-controls">
        <button
          class="flow-play-btn${isPlaying ? " playing" : ""}"
          type="button"
          data-testid="flow-play-btn"
          aria-label="${isPlaying ? "\u66AB\u505C\u52D5\u756B" : "\u64AD\u653E\u52D5\u756B"}"
        >
          ${isPlaying ? "\u23F8 \u66AB\u505C" : "\u25B6 \u64AD\u653E"}
        </button>
      </div>
      <div class="flow-track" data-testid="flow-track">
        ${testingFlow.map((step, index) => `
          <div class="flow-step-group">
            <div
              class="flow-step${activeStep === index ? " flow-step--active" : ""}${hoveredStep === index ? " flow-step--hovered" : ""}"
              data-testid="flow-step-${step.id}"
              data-step-index="${index}"
              role="button"
              tabindex="0"
              aria-label="\u6B65\u9A5F ${index + 1}: ${step.label}"
            >
              <div class="flow-step-num">${index + 1}</div>
              <div class="flow-step-icon">${step.icon}</div>
              <div class="flow-step-label">${step.label}</div>
              <div class="flow-step-label-en">${step.labelEn}</div>
              ${hoveredStep === index || activeStep === index ? `
                <div class="flow-step-tooltip" data-testid="flow-tooltip-${step.id}">${step.description}</div>
              ` : ""}
            </div>
            ${index < testingFlow.length - 1 ? `
              <div
                class="flow-arrow${activeStep > index ? " flow-arrow--passed" : ""}${activeStep === index ? " flow-arrow--active" : ""}"
                data-testid="flow-arrow-${index}"
                aria-hidden="true"
              >
                <div class="flow-arrow-line"></div>
                <div class="flow-arrow-head"></div>
              </div>
            ` : ""}
          </div>
        `).join("")}
      </div>
      <div class="flow-progress-bar" aria-hidden="true">
        <div
          class="flow-progress-fill"
          data-testid="flow-progress-fill"
          style="width: ${(activeStep + 1) / testingFlow.length * 100}%"
        ></div>
      </div>
      <div class="flow-progress-label">\u9032\u5EA6\uFF1A${activeStep + 1} / ${testingFlow.length} \u2014 ${testingFlow[activeStep].label}</div>
    `;
      root2.querySelector('[data-testid="flow-play-btn"]').addEventListener("click", () => {
        isPlaying = !isPlaying;
        restartTimer();
        render();
      });
      root2.querySelectorAll("[data-step-index]").forEach((element) => {
        const stepIndex = Number(element.dataset.stepIndex);
        element.addEventListener("mouseenter", () => {
          hoveredStep = stepIndex;
          isPlaying = false;
          restartTimer();
          render();
        });
        element.addEventListener("mouseleave", () => {
          hoveredStep = null;
          isPlaying = true;
          restartTimer();
          render();
        });
        element.addEventListener("click", () => {
          activeStep = stepIndex;
          render();
        });
      });
    }
    restartTimer();
    render();
    root2.cleanup = () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
    return root2;
  }

  // src/components/TestingTypesTable.js
  function createTestingTypesTable() {
    const root2 = document.createElement("div");
    root2.className = "testing-types";
    root2.dataset.testid = "testing-types";
    root2.innerHTML = `
    <div class="pyramid-section">
      <h3 class="pyramid-title">\u6E2C\u8A66\u91D1\u5B57\u5854\uFF08\u7531\u5E95\u5C64\u81F3\u9802\u5C64\uFF09</h3>
      <div class="pyramid" data-testid="pyramid">
        ${[...testingTypes].reverse().map((type, index) => `
          <div
            class="pyramid-row"
            data-testid="pyramid-row-${type.id}"
            style="--row-color: ${type.color}; --row-width: ${type.width}%; animation-delay: ${index * 0.12}s"
          >
            <span class="pyramid-row-label">${type.type}</span>
            <span class="pyramid-row-en">${type.typeEn}</span>
          </div>
        `).join("")}
      </div>
    </div>
    <div class="types-grid" data-testid="types-grid">
      ${testingTypes.map((type, index) => `
        <div
          class="type-card"
          data-testid="type-card-${type.id}"
          style="--card-color: ${type.color}; animation-delay: ${index * 0.1}s"
        >
          <div class="type-card-stripe"></div>
          <div class="type-card-body">
            <div class="type-header">
              <span class="type-phase">Phase ${index + 1}</span>
              <h4 class="type-name">${type.type}</h4>
              <span class="type-name-en">${type.typeEn}</span>
            </div>
            <div class="type-detail">
              <div class="type-detail-row">
                <span class="type-detail-label">\u76EE\u7684</span>
                <span class="type-detail-value">${type.purpose}</span>
              </div>
              <div class="type-detail-row">
                <span class="type-detail-label">\u6642\u6A5F</span>
                <span class="type-detail-value">${type.timing}</span>
              </div>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
    return root2;
  }

  // src/app.js
  var sectionsConfig = [
    { id: "all", label: "\u5168\u89BD" },
    { id: "methods", label: "\u6E2C\u8A66\u65B9\u6CD5" },
    { id: "graph", label: "Graph Coverage" },
    { id: "flow", label: "\u6E2C\u8A66\u6D41\u7A0B" },
    { id: "types", label: "\u6E2C\u8A66\u985E\u578B" }
  ];
  function renderApp(container) {
    container.innerHTML = `
    <div class="app">
      <header class="app-header">
        <h1>\u8EDF\u9AD4\u6E2C\u8A66\u65B9\u6CD5\u8996\u89BA\u5316</h1>
        <p>Software Testing Methods Visualization</p>
      </header>

      <nav class="app-nav" aria-label="\u5207\u63DB\u5340\u584A" data-testid="app-nav"></nav>

      <main class="app-main">
        <section data-testid="section-methods">
          <h2>\u6E2C\u8A66\u65B9\u6CD5\u5206\u985E</h2>
          <div data-slot="methods"></div>
        </section>
        <section data-testid="section-graph">
          <h2>Graph Coverage \u8996\u89BA\u5316</h2>
          <div data-slot="graph"></div>
        </section>
        <section data-testid="section-flow">
          <h2>\u6E2C\u8A66\u6D41\u7A0B</h2>
          <div data-slot="flow"></div>
        </section>
        <section data-testid="section-types">
          <h2>\u5E38\u898B\u6E2C\u8A66\u985E\u578B</h2>
          <div data-slot="types"></div>
        </section>
      </main>

      <footer class="app-footer">
        <p>\u6839\u64DA Plan.md \u5EFA\u7ACB \xB7 \u8EDF\u9AD4\u6E2C\u8A66\u65B9\u6CD5\u8996\u89BA\u5316\u7CFB\u7D71</p>
      </footer>
    </div>
  `;
    const nav = container.querySelector(".app-nav");
    const main = container.querySelector(".app-main");
    const sections = {
      methods: main.querySelector('[data-testid="section-methods"]'),
      graph: main.querySelector('[data-testid="section-graph"]'),
      flow: main.querySelector('[data-testid="section-flow"]'),
      types: main.querySelector('[data-testid="section-types"]')
    };
    const components = {
      methods: createTestingMethodTree(),
      graph: createGraphCoverageExplorer(),
      flow: createTestingFlow(),
      types: createTestingTypesTable()
    };
    container.querySelector('[data-slot="methods"]').appendChild(components.methods);
    container.querySelector('[data-slot="graph"]').appendChild(components.graph);
    container.querySelector('[data-slot="flow"]').appendChild(components.flow);
    container.querySelector('[data-slot="types"]').appendChild(components.types);
    let activeSection = "all";
    function renderNav() {
      nav.innerHTML = sectionsConfig.map((section) => `
      <button
        class="nav-btn${activeSection === section.id ? " active" : ""}"
        data-testid="nav-btn-${section.id}"
        data-section="${section.id}"
        type="button"
      >
        ${section.label}
      </button>
    `).join("");
      nav.querySelectorAll("[data-section]").forEach((button) => {
        button.addEventListener("click", () => {
          activeSection = button.dataset.section;
          renderNav();
          updateSectionVisibility();
        });
      });
    }
    function updateSectionVisibility() {
      Object.entries(sections).forEach(([id, element]) => {
        const visible = activeSection === "all" || activeSection === id;
        element.style.display = visible ? "" : "none";
      });
    }
    renderNav();
    updateSectionVisibility();
  }

  // src/main.js
  var root = document.getElementById("root");
  if (root) {
    renderApp(root);
  }
})();
