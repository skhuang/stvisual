(() => {
  // src/data/testingData.js
  var testingMethods = [
    {
      id: "blackbox",
      name: "\u9ED1\u76D2\u6E2C\u8A66",
      nameEn: "Black Box Testing",
      description: "\u4E0D\u8003\u616E\u5167\u90E8\u5BE6\u73FE\uFF0C\u5B8C\u5168\u805A\u7126\u8F38\u5165\u8207\u8F38\u51FA\u884C\u70BA",
      descriptionEn: "Ignores internal implementation; focuses entirely on input and output behavior.",
      visibility: 0,
      colorScheme: "dark",
      techniques: [
        { id: "bva", name: "\u908A\u754C\u503C\u5206\u6790", nameEn: "Boundary Value Analysis", description: "\u6E2C\u8A66\u8F38\u5165\u7684\u908A\u754C\u689D\u4EF6", descriptionEn: "Test inputs at the boundaries of input domains." },
        { id: "ep", name: "\u7B49\u50F9\u985E\u5206\u5272", nameEn: "Equivalence Partitioning", description: "\u5C07\u8F38\u5165\u7A7A\u9593\u5283\u5206\u70BA\u7B49\u50F9\u985E", descriptionEn: "Partition the input space into equivalence classes." },
        { id: "ceg", name: "\u56E0\u679C\u5716", nameEn: "Cause-Effect Graph", description: "\u5206\u6790\u8F38\u5165\u8F38\u51FA\u9593\u7684\u56E0\u679C\u95DC\u4FC2", descriptionEn: "Analyze cause-effect relations between inputs and outputs." },
        { id: "stt", name: "\u72C0\u614B\u9077\u79FB\u6E2C\u8A66", nameEn: "State Transition Testing", description: "\u9A57\u8B49\u7CFB\u7D71\u7684\u72C0\u614B\u8F49\u63DB\u884C\u70BA", descriptionEn: "Validate the state transition behavior of the system." }
      ]
    },
    {
      id: "whitebox",
      name: "\u767D\u76D2\u6E2C\u8A66",
      nameEn: "White Box Testing",
      description: "\u57FA\u65BC\u5167\u90E8\u4EE3\u78BC\u7D50\u69CB\uFF0C\u78BA\u4FDD\u6240\u6709\u8DEF\u5F91\u7686\u88AB\u8986\u84CB",
      descriptionEn: "Based on internal code structure; aims to cover all paths.",
      visibility: 100,
      colorScheme: "light",
      techniques: [
        { id: "sc", name: "\u8A9E\u53E5\u8986\u84CB", nameEn: "Statement Coverage", description: "\u78BA\u4FDD\u6BCF\u689D\u8A9E\u53E5\u81F3\u5C11\u57F7\u884C\u4E00\u6B21", descriptionEn: "Ensure every statement executes at least once." },
        { id: "bc", name: "\u5206\u652F\u8986\u84CB", nameEn: "Branch Coverage", description: "\u78BA\u4FDD\u6BCF\u500B\u5206\u652F\uFF08true/false\uFF09\u90FD\u88AB\u57F7\u884C", descriptionEn: "Ensure every branch (true/false) is executed." },
        { id: "gc", name: "\u5716\u5F62\u8986\u84CB", nameEn: "Graph Coverage", description: "\u4EE5\u63A7\u5236\u6D41\u7A0B\u5716\u63A8\u5C0E\u7BC0\u9EDE\u3001\u908A\u8207 Prime Path \u7684\u6E2C\u8A66\u9700\u6C42", descriptionEn: "Derive node, edge, and prime-path requirements from the CFG." },
        { id: "lc", name: "\u908F\u8F2F\u8986\u84CB", nameEn: "Logic Coverage", description: "\u4EE5\u8FF0\u8A5E\u8207\u5B50\u53E5\u70BA\u6838\u5FC3\u7684\u8986\u84CB\u7B56\u7565\uFF0C\u5305\u542B PC\u3001CC\u3001ACC \u7CFB\u5217", descriptionEn: "Predicate/clause-centric strategy: PC, CC, ACC family, etc." },
        { id: "pc", name: "\u8DEF\u5F91\u8986\u84CB", nameEn: "Path Coverage", description: "\u78BA\u4FDD\u6BCF\u689D\u7368\u7ACB\u8DEF\u5F91\u90FD\u88AB\u57F7\u884C", descriptionEn: "Ensure each independent path is executed." },
        { id: "ppc", name: "Prime Path Coverage", nameEn: "Prime Path Coverage", description: "\u6700\u5C0F\u5316\u4E14\u5B8C\u6574\u7684\u8DEF\u5F91\u8986\u84CB\u96C6\u5408", descriptionEn: "Minimal yet complete prime-path coverage set." },
        { id: "cc", name: "\u689D\u4EF6\u8986\u84CB", nameEn: "Condition Coverage", description: "\u78BA\u4FDD\u6BCF\u500B\u5E03\u6797\u689D\u4EF6\u7684\u771F\u5047\u90FD\u88AB\u6E2C\u8A66", descriptionEn: "Ensure each Boolean condition is tested for true and false." },
        { id: "mc", name: "\u591A\u91CD\u689D\u4EF6\u8986\u84CB", nameEn: "Multiple Conditions", description: "\u6E2C\u8A66\u6240\u6709\u689D\u4EF6\u7D44\u5408\u7684\u771F\u5047\u60C5\u6CC1", descriptionEn: "Test all true/false combinations of conditions." },
        { id: "symbex", name: "\u7B26\u865F\u57F7\u884C", nameEn: "Symbolic Execution", description: "\u4EE5\u7B26\u865F\u503C\u4EE3\u5165\u7A0B\u5F0F\u8B8A\u6578\uFF0C\u6CBF\u8DEF\u5F91\u6536\u96C6 path condition \u4E26\u6C42\u89E3\u53EF\u9054\u8F38\u5165", descriptionEn: "Substitute symbolic values for program inputs, collect a path condition along each path, and solve for concrete witnesses." },
        { id: "concolic", name: "\u5177\u9AD4\u7B26\u865F\u57F7\u884C", nameEn: "Concolic Execution", description: "\u7D50\u5408\u5177\u9AD4\u57F7\u884C\u8207\u7B26\u865F\u57F7\u884C (DART/CUTE)\uFF1A\u6BCF\u6B21\u5177\u9AD4\u8DD1\u4E00\u689D\u8DEF\u5F91\uFF0C\u518D\u7FFB\u8F49\u5206\u652F\u689D\u4EF6\u6C42\u89E3\u65B0\u8F38\u5165\u4EE5\u6DB5\u84CB\u66F4\u591A\u8DEF\u5F91", descriptionEn: "Concrete + symbolic (DART/CUTE): runs the program concretely, then negates branch conditions to derive new inputs that cover additional paths." }
      ]
    },
    {
      id: "graybox",
      name: "\u7070\u76D2\u6E2C\u8A66",
      nameEn: "Gray Box Testing",
      description: "\u90E8\u5206\u4E86\u89E3\u5167\u90E8\u5BE6\u73FE\uFF0C\u7D50\u5408\u5169\u8005\u512A\u9EDE\u4EE5\u63D0\u9AD8\u6548\u7387",
      descriptionEn: "Partial knowledge of internals; combines black- and white-box advantages.",
      visibility: 50,
      colorScheme: "medium",
      techniques: [
        { id: "combined", name: "\u7D50\u5408\u9ED1\u76D2\u8207\u767D\u76D2", nameEn: "Combined Approach", description: "\u9748\u6D3B\u904B\u7528\u5169\u7A2E\u65B9\u6CD5\u7684\u6E2C\u8A66\u7B56\u7565", descriptionEn: "Flexible mix of both black- and white-box strategies." },
        { id: "partial", name: "\u90E8\u5206\u4EE3\u78BC\u53EF\u898B", nameEn: "Partial Code Visibility", description: "\u5229\u7528\u53EF\u898B\u7684\u90E8\u5206\u5BE6\u73FE\u8F14\u52A9\u8A2D\u8A08\u6E2C\u8A66", descriptionEn: "Use the visible portion of the code to guide test design." }
      ]
    }
  ];
  var testingFlow = [
    { id: "req", label: "\u9700\u6C42\u5206\u6790", labelEn: "Requirements", icon: "\u{1F4CB}", description: "\u5206\u6790\u8EDF\u9AD4\u9700\u6C42\uFF0C\u78BA\u5B9A\u6E2C\u8A66\u76EE\u6A19\u8207\u7BC4\u570D", descriptionEn: "Analyze requirements; determine test goals and scope." },
    { id: "plan", label: "\u6E2C\u8A66\u8A08\u5283", labelEn: "Test Plan", icon: "\u{1F4DD}", description: "\u5236\u5B9A\u6E2C\u8A66\u7B56\u7565\u3001\u8CC7\u6E90\u5206\u914D\u8207\u9032\u5EA6\u8A08\u5283", descriptionEn: "Define test strategy, resource allocation, and schedule." },
    { id: "design", label: "\u6E2C\u8A66\u8A2D\u8A08", labelEn: "Test Design", icon: "\u270F\uFE0F", description: "\u8A2D\u8A08\u6E2C\u8A66\u7528\u4F8B\u3001\u8173\u672C\u8207\u6E2C\u8A66\u6578\u64DA", descriptionEn: "Design test cases, scripts, and test data." },
    { id: "exec", label: "\u6E2C\u8A66\u57F7\u884C", labelEn: "Execution", icon: "\u25B6\uFE0F", description: "\u57F7\u884C\u6E2C\u8A66\u7528\u4F8B\uFF0C\u8A18\u9304\u5BE6\u969B\u8207\u9810\u671F\u7D50\u679C", descriptionEn: "Execute test cases; record actual vs. expected results." },
    { id: "analysis", label: "\u7D50\u679C\u5206\u6790", labelEn: "Analysis", icon: "\u{1F50D}", description: "\u6BD4\u8F03\u7D50\u679C\uFF0C\u8B58\u5225\u7F3A\u9677\u4E26\u8A55\u4F30\u6E2C\u8A66\u8986\u84CB\u7387", descriptionEn: "Compare results, identify defects, and assess coverage." },
    { id: "report", label: "\u7F3A\u9677\u5831\u544A", labelEn: "Defect Report", icon: "\u{1F4CA}", description: "\u64B0\u5BEB\u6E2C\u8A66\u5831\u544A\uFF0C\u8FFD\u8E64\u7F3A\u9677\u4FEE\u5FA9\u72C0\u614B", descriptionEn: "Write reports and track defect-fix status." }
  ];
  var testingTypes = [
    { id: "unit", type: "\u55AE\u5143\u6E2C\u8A66", typeEn: "Unit Testing", purpose: "\u6E2C\u8A66\u6700\u5C0F\u55AE\u4F4D", purposeEn: "Test the smallest units of code.", timing: "\u958B\u767C\u968E\u6BB5", timingEn: "Development", color: "#3498db", width: 30 },
    { id: "integration", type: "\u96C6\u6210\u6E2C\u8A66", typeEn: "Integration Testing", purpose: "\u6E2C\u8A66\u6A21\u7D44\u7D44\u5408", purposeEn: "Test combinations of modules.", timing: "\u958B\u767C\u5F8C\u671F", timingEn: "Late development", color: "#27ae60", width: 55 },
    { id: "system", type: "\u7CFB\u7D71\u6E2C\u8A66", typeEn: "System Testing", purpose: "\u6E2C\u8A66\u6574\u9AD4\u7CFB\u7D71", purposeEn: "Test the system as a whole.", timing: "\u96C6\u6210\u5B8C\u6210\u5F8C", timingEn: "After integration", color: "#f39c12", width: 80 },
    { id: "acceptance", type: "\u9A57\u6536\u6E2C\u8A66", typeEn: "Acceptance Testing", purpose: "\u9A57\u8B49\u9700\u6C42\u9054\u6210", purposeEn: "Verify requirements are satisfied.", timing: "\u90E8\u7F72\u524D", timingEn: "Before deployment", color: "#e74c3c", width: 100 }
  ];
  var graphCoverageCriteria = [
    { id: "node", label: "Node Coverage", labelZh: "\u7BC0\u9EDE\u8986\u84CB", description: "\u6BCF\u500B\u7BC0\u9EDE\u81F3\u5C11\u88AB\u4E00\u500B\u6E2C\u8A66\u8DEF\u5F91\u62DC\u8A2A\u4E00\u6B21\u3002", descriptionEn: "Every node is visited by at least one test path." },
    { id: "edge", label: "Edge Coverage", labelZh: "\u908A\u8986\u84CB", description: "\u6BCF\u689D\u6709\u5411\u908A\u81F3\u5C11\u88AB\u4E00\u500B\u6E2C\u8A66\u8DEF\u5F91\u7D93\u904E\u4E00\u6B21\u3002", descriptionEn: "Every directed edge is traversed by at least one test path." },
    { id: "prime-path", label: "Prime Path Coverage", labelZh: "Prime Path \u8986\u84CB", description: "\u6240\u6709 prime path \u90FD\u5FC5\u9808\u88AB\u6E2C\u8A66\u9700\u6C42\u6DB5\u84CB\uFF0C\u5305\u542B\u8FF4\u5708\u3002", descriptionEn: "All prime paths (including loops) must be covered." },
    { id: "edge-pair", label: "Edge-Pair Coverage", labelZh: "\u908A\u5C0D\u8986\u84CB", description: "\u6BCF\u4E00\u7D44\u76F8\u9130\u7684\u5169\u689D\u908A\u90FD\u8981\u81F3\u5C11\u88AB\u4E00\u689D\u6E2C\u8A66\u8DEF\u5F91\u8986\u84CB\u3002", descriptionEn: "Every pair of adjacent edges must be covered by some test path." },
    { id: "complete-path", label: "Complete Path Coverage", labelZh: "\u5B8C\u6574\u8DEF\u5F91\u8986\u84CB", description: "\u4EE5\u6709\u9650\u6DF1\u5EA6\u5217\u8209 start \u5230 end \u7684\u5B8C\u6574\u53EF\u884C\u8DEF\u5F91\u96C6\u5408\u3002", descriptionEn: "Enumerate all complete feasible paths from start to end up to a finite depth." },
    { id: "all-defs", label: "All-Defs Coverage", labelZh: "\u6240\u6709\u5B9A\u7FA9\u8986\u84CB", description: "\u5C0D\u65BC\u6BCF\u500B (\u7BC0\u9EDE, \u8B8A\u6578) \u7684\u5B9A\u7FA9\uFF0C\u81F3\u5C11\u6709\u4E00\u689D\u5F9E\u8A72\u5B9A\u7FA9\u5230\u67D0\u500B\u4F7F\u7528\u7684 def-clear \u8DEF\u5F91\u88AB\u8986\u84CB\u3002", descriptionEn: "For every (node, variable) definition, cover at least one definition-clear path from the def to some use of that variable." },
    { id: "all-uses", label: "All-Uses Coverage", labelZh: "\u6240\u6709\u4F7F\u7528\u8986\u84CB", description: "\u5C0D\u65BC\u6BCF\u5C0D (\u5B9A\u7FA9, \u4F7F\u7528, \u8B8A\u6578)\uFF0C\u81F3\u5C11\u6709\u4E00\u689D def-clear \u8DEF\u5F91\u88AB\u6E2C\u8A66\u8DEF\u5F91\u8986\u84CB\u3002", descriptionEn: "For every (def, use, variable) pair, cover at least one definition-clear path from the def to that use." },
    { id: "all-du-paths", label: "All-DU-Paths Coverage", labelZh: "\u6240\u6709 DU \u8DEF\u5F91\u8986\u84CB", description: "\u5C0D\u65BC\u6BCF\u5C0D (\u5B9A\u7FA9, \u4F7F\u7528, \u8B8A\u6578)\uFF0C\u6240\u6709 def-clear \u7C21\u55AE\u8DEF\u5F91\u90FD\u5FC5\u9808\u88AB\u6E2C\u8A66\u8DEF\u5F91\u8986\u84CB\u3002", descriptionEn: "For every (def, use, variable) pair, every definition-clear simple path from the def to that use must be covered." }
  ];
  var graphCoverageCodeLanguages = [
    { id: "javascript", label: "JavaScript" },
    { id: "pseudocode", label: "Pseudo Code" }
  ];
  var graphCoverageGraph = {
    id: "control-flow-sample",
    title: "\u63A7\u5236\u6D41\u7A0B\u5716\u7BC4\u4F8B",
    titleEn: "Sample Control Flow Graph",
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
    },
    {
      id: "calendar-days",
      name: "Calendar Days Switch Variant",
      language: "javascript",
      description: "A calendar-style example using switch-case branches to classify month lengths.",
      sourceCode: `function daysInMonth(month, leapYear) {
  switch (month) {
    case 2:
      if (leapYear) {
        return 29;
      }
      break;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      return 31;
  }
}`
    },
    {
      id: "quadrilateral-problem",
      name: "The Quadrilateral Program",
      language: "javascript",
      description: "Classify a quadrilateral from four side lengths and two diagonals into square, rectangle, rhombus, parallelogram, trapezoid, or general.",
      sourceCode: `function classifyQuadrilateral(a, b, c, d, p, q) {
  if (a <= 0 || b <= 0 || c <= 0 || d <= 0) {
    return 'invalid';
  }

  if (a === b && b === c && c === d) {
    if (p === q) {
      return 'square';
    }
    return 'rhombus';
  }

  if (a === c && b === d) {
    if (p === q) {
      return 'rectangle';
    }
    return 'parallelogram';
  }

  if (a === c || b === d) {
    return 'trapezoid';
  }

  return 'general';
}`
    },
    {
      id: "next-week",
      name: "Next Week",
      language: "javascript",
      description: "Advance a date by seven days, handling month-end and year rollover.",
      sourceCode: `function nextWeek(year, month, day) {
  if (!isValidDate(year, month, day)) {
    return 'invalid';
  }

  let newDay = day + 7;
  let newMonth = month;
  let newYear = year;
  const limit = daysInMonth(newYear, newMonth);

  if (newDay > limit) {
    newDay = newDay - limit;
    if (newMonth === 12) {
      newMonth = 1;
      newYear = newYear + 1;
    } else {
      newMonth = newMonth + 1;
    }
  }

  return { year: newYear, month: newMonth, day: newDay };
}`
    }
  ];
  var logicCoverageCriteria = [
    {
      id: "pc",
      label: "Predicate Coverage",
      labelZh: "Predicate Coverage",
      description: "\u4F7F\u6574\u9AD4 predicate \u81F3\u5C11\u8A55\u4F30\u70BA true \u8207 false \u5404\u4E00\u6B21\u3002",
      descriptionEn: "The predicate as a whole evaluates to true and to false at least once each."
    },
    {
      id: "cc",
      label: "Clause Coverage",
      labelZh: "\u5B50\u53E5\u8986\u84CB",
      description: "\u6BCF\u500B\u5B50\u53E5\u7686\u81F3\u5C11\u5404\u53D6 true \u8207 false \u4E00\u6B21\u3002",
      descriptionEn: "Every clause takes both true and false at least once."
    },
    {
      id: "coc",
      label: "Combinatorial Coverage",
      labelZh: "\u7D44\u5408\u8986\u84CB",
      description: "\u5217\u8209\u6240\u6709 2^n \u500B\u5B50\u53E5\u771F\u5047\u7D44\u5408\u3002",
      descriptionEn: "Enumerate all 2^n true/false combinations of the clauses."
    },
    {
      id: "gacc",
      label: "General Active Clause Coverage",
      labelZh: "GACC",
      description: "\u5C0D\u6BCF\u500B\u4E3B\u5B50\u53E5\u627E\u4E00\u5C0D\u5217\uFF0C\u4F7F\u8A72\u5B50\u53E5\u6C7A\u5B9A predicate \u7684\u503C\u3002",
      descriptionEn: "For each major clause find a pair of rows where it determines the predicate."
    },
    {
      id: "cacc",
      label: "Correlated Active Clause Coverage",
      labelZh: "CACC",
      description: "\u4E3B\u5B50\u53E5\u6C7A\u5B9A predicate\uFF0C\u4E14\u5169\u5217\u7522\u751F\u4E0D\u540C\u7684 predicate \u503C\u3002",
      descriptionEn: "Major clause determines the predicate, and the two rows yield different predicate values."
    },
    {
      id: "racc",
      label: "Restricted Active Clause Coverage",
      labelZh: "RACC",
      description: "\u4E3B\u5B50\u53E5\u6C7A\u5B9A predicate\uFF0C\u4E14\u5169\u5217\u7684\u6B21\u5B50\u53E5\u503C\u5B8C\u5168\u76F8\u540C\u3002",
      descriptionEn: "Major clause determines the predicate, and the two rows have identical minor-clause values."
    },
    {
      id: "gicc",
      label: "General Inactive Clause Coverage",
      labelZh: "GICC",
      description: "\u4E3B\u5B50\u53E5\u4E0D\u6C7A\u5B9A predicate\uFF0C\u8986\u84CB (c=T/F)\xD7(P=T/F) \u5171 4 \u7A2E\u7D44\u5408\u3002",
      descriptionEn: "Major clause does not determine the predicate; cover (c=T/F)\xD7(P=T/F) \u2014 four combinations."
    },
    {
      id: "ricc",
      label: "Restricted Inactive Clause Coverage",
      labelZh: "RICC",
      description: "\u540C GICC\uFF0C\u4F46\u6210\u5C0D\u5217\u9700\u6240\u6709\u6B21\u5B50\u53E5\u76F8\u540C\uFF0C\u50C5\u4E3B\u5B50\u53E5\u7FFB\u8F49\u3002",
      descriptionEn: "Same as GICC but the paired rows keep all minor clauses identical; only the major clause flips."
    },
    {
      id: "ic",
      label: "Implicant Coverage",
      labelZh: "IC",
      description: "\u5C0D DNF \u7684\u6BCF\u500B implicant\uFF0C\u81F3\u5C11\u627E\u5230\u4E00\u500B true point\u3002",
      descriptionEn: "For every implicant of the DNF, find at least one true point."
    },
    {
      id: "utpc",
      label: "Unique True Point Coverage",
      labelZh: "UTPC",
      description: "\u70BA\u6BCF\u500B implicant \u6311\u4E00\u500B\u53EA\u6EFF\u8DB3\u8A72 implicant \u7684 unique true point\u3002",
      descriptionEn: "For every implicant pick a unique true point that satisfies only that implicant."
    },
    {
      id: "mutpc",
      label: "Multiple Unique True Point Coverage",
      labelZh: "MUTPC",
      description: "\u70BA\u6BCF\u500B implicant \u6311\u4E00\u7D44 UTPs\uFF0C\u4F7F\u6BCF\u500B\u6B21\u5B50\u53E5\u90FD\u81F3\u5C11\u51FA\u73FE\u4E00\u6B21 T \u8207\u4E00\u6B21 F\u3002",
      descriptionEn: "For every implicant pick a set of UTPs such that each minor clause takes both T and F."
    },
    {
      id: "nfpc",
      label: "Near False Point Coverage",
      labelZh: "NFPC",
      description: "\u70BA\u6BCF\u500B implicant \u7684\u6BCF\u500B literal \u627E\u4E00\u500B\u7FFB\u8F49\u5F8C\u4F7F P \u70BA false \u7684\u5217\u3002",
      descriptionEn: "For every literal of every implicant find a row that, after flipping that literal, makes P false."
    },
    {
      id: "mnfpc",
      label: "Multiple Near False Point Coverage",
      labelZh: "MNFPC",
      description: "\u70BA\u6BCF\u500B implicant \u7684\u6BCF\u500B literal \u6311\u4E00\u7D44 NFPs\uFF0C\u4F7F\u6BCF\u500B\u6B21\u5B50\u53E5\u90FD\u81F3\u5C11\u51FA\u73FE\u4E00\u6B21 T \u8207\u4E00\u6B21 F\u3002",
      descriptionEn: "For every implicant pick a set of NFPs such that each minor clause takes both T and F."
    },
    {
      id: "cutpnfp",
      label: "Corresponding UTP + NFP Pair Coverage",
      labelZh: "CUTPNFP",
      description: "\u70BA\u6BCF\u500B implicant \u7684\u6BCF\u500B literal\uFF0C\u6311\u4E00\u5C0D\u50C5\u5728\u8A72 literal \u4E0D\u540C\u7684 UTP \u8207 NFP\u3002",
      descriptionEn: "For every literal of every implicant pick a UTP/NFP pair that differs only in that literal."
    }
  ];
  var logicCoveragePredicates = [
    {
      id: "simple-and-or",
      name: "(a && b) || c",
      expression: "(a && b) || c",
      description: "\u5E38\u898B\u7684\u6DF7\u5408 AND/OR predicate\uFF0C\u4E09\u500B\u5B50\u53E5\u3002",
      descriptionEn: "A common mixed AND/OR predicate with three clauses."
    },
    {
      id: "guarded-exit",
      name: "a && (b || !c)",
      expression: "a && (b || !c)",
      description: "\u5E36\u6709\u5426\u5B9A\u5B50\u53E5\u7684\u5B88\u885B\u689D\u4EF6\u3002",
      descriptionEn: "A guarded condition that includes a negated clause."
    },
    {
      id: "four-clause",
      name: "(a || b) && (c || d)",
      expression: "(a || b) && (c || d)",
      description: "\u56DB\u500B\u5B50\u53E5\u7684\u4E58\u7A4D\u5F0F predicate\uFF0C\u5E38\u898B\u65BC\u7BC4\u570D\u6AA2\u67E5\u3002",
      descriptionEn: "A four-clause product predicate, common in range checks."
    }
  ];
  var symbolicExecutionExamples = [
    {
      id: "triangle",
      name: "Triangle classifier",
      nameEn: "Triangle classifier",
      description: "\u7D93\u5178\u4E09\u89D2\u5F62\u5206\u985E\uFF1A\u56DE\u50B3 0 (\u975E\u4E09\u89D2\u5F62)\u30011 (\u4E00\u822C)\u30012 (\u7B49\u8170)\u30013 (\u7B49\u908A)\u3002",
      descriptionEn: "Classic triangle classifier: returns 0 (none), 1 (scalene), 2 (isosceles), 3 (equilateral).",
      sourceCode: `function classify(a, b, c) {
  if (a <= 0 || b <= 0 || c <= 0) {
    return 0;
  }
  if (a + b <= c || a + c <= b || b + c <= a) {
    return 0;
  }
  if (a == b && b == c) {
    return 3;
  }
  if (a == b || b == c || a == c) {
    return 2;
  }
  return 1;
}
`
    },
    {
      id: "max3",
      name: "Max of three",
      nameEn: "Max of three",
      description: "\u56DE\u50B3 a, b, c \u4E09\u8005\u6700\u5927\u503C\uFF1B\u7D93\u5178\u5206\u652F\u7D50\u69CB\u793A\u7BC4\u3002",
      descriptionEn: "Return the maximum of three integers \u2014 a canonical branching example.",
      sourceCode: `function max3(a, b, c) {
  let m = a;
  if (b > m) {
    m = b;
  }
  if (c > m) {
    m = c;
  }
  return m;
}
`
    },
    {
      id: "abs",
      name: "Absolute value",
      nameEn: "Absolute value",
      description: "\u53EA\u6709\u5169\u689D\u8DEF\u5F91\u7684\u6700\u5C0F\u7BC4\u4F8B\uFF1Ax >= 0 \u8207 x < 0\u3002",
      descriptionEn: "A minimal two-path example: x >= 0 versus x < 0.",
      sourceCode: `function abs(x) {
  if (x < 0) {
    return -x;
  }
  return x;
}
`
    },
    {
      id: "gcd",
      name: "GCD (bounded)",
      nameEn: "GCD (bounded)",
      description: "\u6B50\u5E7E\u91CC\u5F97\u6F14\u7B97\u6CD5\uFF0C\u542B while \u8FF4\u5708\uFF1B\u4EE5\u6700\u5927\u5C55\u958B\u6B21\u6578\u6A21\u64EC\u6709\u754C\u8DEF\u5F91\u5217\u8209\u3002",
      descriptionEn: "Euclidean algorithm with a while loop \u2014 bounded unrolling enumerates the first paths.",
      sourceCode: `function gcd(a, b) {
  while (b != 0) {
    let t = b;
    b = a % b;
    a = t;
  }
  return a;
}
`
    }
  ];
  var concolicExecutionExamples = [
    {
      id: "triangle",
      name: "Triangle classifier",
      nameEn: "Triangle classifier",
      description: "\u5F9E (1,1,1) \u7B49\u908A\u4E09\u89D2\u5F62\u7A2E\u5B50\u51FA\u767C\uFF0C\u6BCF\u6B21\u7FFB\u8F49\u6700\u5F8C\u4E00\u500B\u672A\u63A2\u7D22\u7684\u5206\u652F\uFF0C\u81EA\u52D5\u7522\u751F\u65B0\u8F38\u5165\u3002",
      descriptionEn: "Seeded with the equilateral triangle (1,1,1); each step flips the last unexplored branch to derive a new input.",
      seed: "a=1, b=1, c=1",
      sourceCode: `function classify(a, b, c) {
  if (a <= 0 || b <= 0 || c <= 0) {
    return 0;
  }
  if (a + b <= c || a + c <= b || b + c <= a) {
    return 0;
  }
  if (a == b && b == c) {
    return 3;
  }
  if (a == b || b == c || a == c) {
    return 2;
  }
  return 1;
}
`
    },
    {
      id: "abs",
      name: "Absolute value",
      nameEn: "Absolute value",
      description: "\u6700\u5C0F\u7BC4\u4F8B\uFF1A\u5F9E x=0 \u51FA\u767C\uFF0Cconcolic \u8D70\u5B8C\u4E00\u689D\u8DEF\u5F91\u5F8C\u7FFB\u8F49\u689D\u4EF6\u5F97\u5230 x<0 \u7684\u5C0D\u5076\u8F38\u5165\u3002",
      descriptionEn: "Minimal example: starting from x=0, concolic flips the branch to discover the x<0 dual input.",
      seed: "x=0",
      sourceCode: `function abs(x) {
  if (x < 0) {
    return -x;
  }
  return x;
}
`
    },
    {
      id: "max3",
      name: "Max of three",
      nameEn: "Max of three",
      description: "\u793A\u7BC4\u96D9\u5206\u652F\u7D50\u69CB\uFF1A\u6BCF\u689D\u8DEF\u5F91\u5C0D\u61C9 (b>a, c>m) \u5169\u500B\u5206\u652F\u7684\u771F\u5047\u7D44\u5408\u3002",
      descriptionEn: "Demonstrates a two-branch structure: each path corresponds to a (b>a, c>m) truth combination.",
      seed: "a=0, b=0, c=0",
      sourceCode: `function max3(a, b, c) {
  let m = a;
  if (b > m) {
    m = b;
  }
  if (c > m) {
    m = c;
  }
  return m;
}
`
    },
    {
      id: "middle",
      name: "Middle value",
      nameEn: "Middle value",
      description: "\u7D93\u5178 DART \u6E2C\u8A66\u5C0D\u8C61\uFF08Khurshid et al.\uFF09\uFF1A\u56DE\u50B3\u4E09\u6578\u7684\u4E2D\u4F4D\u6578\u3002",
      descriptionEn: "A classic DART benchmark (Khurshid et al.): returns the median of three integers.",
      seed: "a=0, b=0, c=0",
      sourceCode: `function middle(a, b, c) {
  let m = c;
  if (b < c) {
    if (a < b) {
      m = b;
    } else if (a < c) {
      m = a;
    }
  } else {
    if (a > b) {
      m = b;
    } else if (a > c) {
      m = a;
    }
  }
  return m;
}
`
    }
  ];

  // src/i18n/dict.js
  var messages = {
    en: {
      // App shell
      "app.title": "Software Testing Methods Visualization",
      "app.subtitle": "Software Testing Methods Visualization",
      "app.nav.aria": "Switch section",
      "app.footer": "Built per Plan.md \xB7 Software Testing Methods Visualization",
      "app.lang.label": "Language",
      "app.lang.en": "English",
      "app.lang.zh": "\u4E2D\u6587",
      // Sections
      "section.all": "Overview",
      "section.methods": "Testing Methods",
      "section.graph": "Graph Coverage",
      "section.logic": "Logic Coverage",
      "section.syntax": "Syntax-Based Testing",
      "section.cloud": "Cloud Integration",
      "section.flow": "Testing Flow",
      "section.types": "Testing Types",
      "section.methods.title": "Testing Method Categories",
      "section.graph.title": "Graph Coverage Visualization",
      "section.logic.title": "Logic Coverage Visualization",
      "section.syntax.title": "Syntax-Based Testing: Program Mutation",
      "syntaxTab.mutation": "Program Mutation",
      "syntaxTab.grammar": "Grammar Coverage",
      "syntaxTab.spec": "Specification Mutation",
      "section.cloud.title": "Google Cloud Integration",
      "section.flow.title": "Testing Flow",
      "section.types.title": "Common Testing Types",
      "section.symbex": "Symbolic Execution",
      "section.symbex.title": "Symbolic Execution Explorer",
      "symbex.source": "Program source",
      "symbex.maxUnroll": "Loop unroll limit",
      "symbex.summary.paths": "Paths: ",
      "symbex.summary.feasible": "Feasible: ",
      "symbex.summary.truncated": "truncated (max-paths reached)",
      "symbex.feasible": "feasible",
      "symbex.infeasible": "No witness found within the search domain.",
      "symbex.infeasible.short": "infeasible",
      "symbex.witness": "Witness",
      "symbex.return": "Return",
      "symbex.empty": "No paths to display.",
      "symbex.pc.empty": "Path condition: (always reachable)",
      "symbex.hint": "Supports a small JS subset: function with int/bool params, let/=, if/else, bounded while, return, +-*/% comparisons, &&/||/!. Witnesses are searched over a small integer domain.",
      "symbex.cfg.title": "Selected path on the CFG",
      "symbex.cfg.none": "(no path selected)",
      "symbex.cfg.zoom": "Zoom",
      "symbex.cfg.zoomIn": "Zoom in",
      "symbex.cfg.zoomOut": "Zoom out",
      "symbex.cfg.zoomReset": "Reset zoom",
      "section.concolic": "Concolic Execution",
      "section.concolic.title": "Concolic Execution Explorer",
      "concolic.source": "Program source",
      "concolic.seed": "Seed input",
      "concolic.maxIterations": "Max iterations",
      "concolic.summary.iterations": "Iterations: ",
      "concolic.summary.uniquePaths": "Unique paths: ",
      "concolic.summary.uniqueInputs": "Unique inputs: ",
      "concolic.summary.truncated": "truncated (max iterations reached)",
      "concolic.return": "Return",
      "concolic.nextInput": "Next input",
      "concolic.exhausted": "no further branch to negate",
      "concolic.negated": "negate",
      "concolic.pathKey": "Path signature (taken=T, not-taken=F)",
      "concolic.empty": "No iterations to display.",
      "concolic.noBranches": "No branches encountered (straight-line program).",
      "concolic.runtimeError": "Runtime error:",
      "concolic.hint": "Concolic execution = concrete + symbolic. Each iteration runs the program concretely, then negates the last unexplored branch and asks the solver for a new input. Same JS subset as Symbolic Execution.",
      "concolic.cfg.title": "Selected iteration on the CFG",
      "concolic.cfg.none": "(no iteration selected)",
      "concolic.cfg.zoom": "Zoom",
      "concolic.cfg.zoomIn": "Zoom in",
      "concolic.cfg.zoomOut": "Zoom out",
      "concolic.cfg.zoomReset": "Reset zoom",
      // Common
      "common.run": "Run",
      "common.reset": "Reset",
      "common.save": "Save",
      "common.delete": "Delete",
      "common.add": "Add",
      "common.notes": "Notes",
      "common.actual": "Actual",
      "common.expected": "Expected",
      "common.input": "Input",
      "common.output": "Output",
      "common.status": "Status",
      "common.passed": "Passed",
      "common.failed": "Failed",
      "common.killed": "Killed",
      "common.live": "Live",
      "common.equivalent": "Equivalent",
      "common.markEquivalent": "Mark equivalent",
      "common.unmarkEquivalent": "Unmark equivalent",
      "common.reload": "Reload",
      "common.signedIn": "\u2713 Signed in",
      "common.notSignedIn": "Not signed in",
      "common.googleSignIn": "Google Sign in",
      "common.signOut": "Sign out",
      // Cloud panel
      "cloud.kicker": "Google + Firebase",
      "cloud.title": "Cloud settings & file storage",
      "cloud.subtitle": "Sign in with Google: settings stored in Firebase, files uploaded to Google Drive.",
      "cloud.fileWarning": "Currently in file:// mode. Google OAuth requires http://localhost or https.",
      "cloud.signInPrompt": "Sign in with Google to save settings or upload files.",
      "cloud.userPrefix": "Current user: {name}",
      "cloud.section.settings": "Settings (Firebase Firestore)",
      "cloud.section.files": "Files (Google Drive)",
      "cloud.preferredCriterion": "Default Coverage Criterion",
      "cloud.notes": "Notes",
      "cloud.extras": "Extra settings JSON",
      "cloud.saveSettings": "Save settings",
      "cloud.upload": "Upload to Google Drive",
      "cloud.refreshFiles": "Refresh file list",
      "cloud.uploadHint": "Choose a file to upload",
      "cloud.pendingUpload": "Pending: {name}",
      "cloud.noFileSelected": "No file selected",
      "cloud.noSavedSettings": "No settings saved in Firebase yet.",
      "cloud.extrasJsonError": "Extra settings JSON is malformed.",
      "cloud.loadSettings": "Load settings",
      "cloud.signedInOk": "Signed in. Drive upload permission granted.",
      "cloud.signedInNoDrive": "Signed in but Drive permission not granted. Please sign in again.",
      "cloud.signedOut": "Signed out.",
      "cloud.savedOk": "Settings saved to Firebase.",
      "cloud.loadedOk": "Settings loaded from Firebase.",
      "cloud.uploadedOk": "File uploaded: {name}",
      "cloud.noFiles": "No uploads yet",
      "cloud.openFile": "Open",
      "cloud.useForMutation": "Use for Mutation Test",
      "cloud.useForGraph": "Use for Graph Coverage",
      "cloud.useForGrammar": "Use for Grammar Coverage",
      "cloud.sentToMutation": "Sent {name} to Mutation Test section.",
      "cloud.sentToGraph": "Sent {name} to Graph Coverage section.",
      "cloud.sentToGrammar": "Sent {name} to Grammar Coverage section.",
      "cloud.readError": "Could not read file: {msg}",
      "cloud.noContent": "File content is unavailable. Please re-upload the file.",
      "cloud.driveFilesTitle": "Files in Google Drive",
      "cloud.refreshDriveFiles": "Refresh Drive list",
      "cloud.refreshing": "Refreshing\u2026",
      "cloud.noDriveFiles": "No files found in Drive yet.",
      "cloud.signInToList": "Sign in to list your Drive files.",
      "cloud.driveListed": "Loaded {count} file(s) from Drive.",
      "cloud.driveListError": "Could not list Drive files: {msg}",
      "cloud.downloading": "Downloading {name}\u2026",
      "cloud.firebaseMissing": "Firebase config incomplete: {keys}",
      "cloud.err.fileProtocol": "Google OAuth does not support file://. Please use http://localhost or an https URL.",
      "cloud.err.firebaseIncomplete": "Firebase config incomplete: {keys}",
      "cloud.err.sdkNotLoaded": "Firebase SDK not loaded. Please ensure index.html includes firebase-app/auth/firestore compat scripts.",
      "cloud.err.noDriveToken": "No Drive access token available. Please sign in with Google again.",
      "cloud.err.uploadFailed": "Failed to upload to Google Drive.",
      "cloud.err.listFailed": "Failed to list Google Drive files.",
      "cloud.err.downloadFailed": "Failed to download Google Drive file.",
      // Testing method tree
      "methods.intro": "Hierarchical view of common testing methods. Hover or click each branch.",
      "methods.expandAll": "Expand all",
      "methods.collapseAll": "Collapse all",
      "methods.codeVisibility": "Code visibility",
      "methods.countBadge": "{n} techniques",
      // Testing flow
      "flow.intro": "A typical testing flow:",
      "flow.play": "Play",
      "flow.pause": "Pause",
      "flow.step": "Step {n}: {label}",
      "flow.progress": "Progress: {current} / {total} \u2014 {label}",
      // Testing types
      "types.intro": "Common testing types in the industry:",
      "types.col.name": "Type",
      "types.col.purpose": "Purpose",
      "types.col.example": "Example",
      "types.col.timing": "Timing",
      "types.pyramid.title": "Test Pyramid (bottom to top)",
      // Graph coverage
      "graph.title": "Graph Coverage Explorer",
      "graph.subtitle": "Choose a sample program or upload your own JS function. The system extracts CFG and covers it by selected criterion.",
      "graph.example": "Sample program",
      "graph.criterion": "Coverage criterion",
      "graph.uploadLabel": "Upload JS file",
      "graph.uploadHint": "Upload a single function written in JavaScript.",
      "graph.run": "Generate coverage",
      "graph.cfg": "Control Flow Graph",
      "graph.paths": "Paths satisfying criterion",
      "graph.coverage": "Coverage report",
      "graph.testCases": "Suggested test cases",
      "graph.noTests": "No test inputs needed for this criterion.",
      "graph.parseError": "Parse error: {msg}",
      // Common (extra)
      "common.none": "(none)",
      "common.chooseFile": "Choose File",
      // Graph coverage
      "graph.aria.canvas": "Graph coverage CFG",
      "graph.dfg.title": "Data Flow Graph (def \u2192 use)",
      "graph.dfg.help": "Definition-clear edges derived from each statement\u2019s assignments. Edges are labelled with the variable carried.",
      "graph.dfg.empty": "No definition\u2192use pair detected from the current source.",
      "graph.dfg.aria": "Data flow graph",
      "graph.aria.switcher": "Switch coverage criteria",
      "graph.customTitle": "Custom Control Flow Graph",
      "graph.source.empty": "This source only provides a graph; no source code snippet attached.",
      "graph.headerDesc": "Same CFG, switch criteria to instantly see the nodes/edges/paths that must be covered.",
      "graph.editor.help": "Load a CFG from a real program example, then tweak the graph and recompute coverage requirements/test paths in real time.",
      "graph.editor.reset": "Reset graph",
      "graph.editor.synced": "Graph updated.",
      "graph.uploadFormatHelp": "JSON may provide a graph object directly, or top-level nodes/edges/startNodeId/endNodeId, plus optional title/description/sourceCode. Code uploads are converted into a simplified CFG by language.",
      "graph.summary.current": "Current requirement",
      "graph.path.help": "Combine requirements into executable test paths (Start \u2192 End).",
      "graph.path.before": "Before optimization",
      "graph.path.after": "After optimization",
      "graph.path.saved": "Reduced by",
      "graph.path.none": "No available paths",
      "graph.path.uncovered": "Not yet covered: {items}",
      "graph.path.allCovered": "All requirements mapped to test paths.",
      "graph.req.help": "When the criterion changes, this list recomputes the corresponding requirements.",
      "graph.detail.noSourceMap": "This requirement has no associated source-line mapping.",
      "graph.status.initial": "Pick a built-in program example, or upload a JSON graph spec / source-code file.",
      "graph.status.recomputed": "{name} recomputed from edited graph.",
      "graph.status.reset": "{name} restored to the originally loaded graph.",
      "graph.status.defaultLoaded": "Loaded the default control-flow-graph sample.",
      "graph.status.pickJson": "Pick a JSON file to upload as a graph spec.",
      "graph.status.pickCode": "Pick a source-code file and language; the system will produce a simplified CFG.",
      "graph.status.exampleLoaded": "Loaded {name}.",
      "graph.status.uploadLoaded": "Loaded uploaded file: {name}",
      "graph.status.codeGenerated": "Generated a simplified CFG from {name}.",
      "graph.status.codeFailed": "Code upload failed.",
      "graph.err.nodesEmpty": "Nodes cannot be empty.",
      "graph.err.nodeFmt": "Bad node format (line {line}); expected id,label,x,y.",
      "graph.err.nodeCoord": "Bad node coordinate (line {line}); x,y must be numbers.",
      "graph.err.edgesEmpty": "Edges cannot be empty.",
      "graph.err.edgeFmt": "Bad edge format (line {line}); use from,to or id,from,to or id,from,to,cx,cy.",
      "graph.err.edgeMissing": "Bad edge (line {line}); missing from/to.",
      "graph.err.edgeNode": "Edge endpoint not found (line {line}): {from} -> {to}",
      "graph.err.edgeCtl": "Bad edge control point (line {line}); cx,cy must be numbers.",
      "graph.err.startMissing": "Start node is not in the node list.",
      "graph.err.endMissing": "End node is not in the node list.",
      "graph.err.notJson": "Uploaded content is not valid JSON.",
      "graph.err.jsonShape": "JSON must include a graph object, or top-level nodes / edges / startNodeId / endNodeId.",
      "graph.err.readFile": "Failed to read uploaded file.",
      "graph.err.noSource": "No usable graph source found.",
      // Logic coverage
      "logic.title": "Logic Coverage Explorer",
      "logic.subtitle": "Pick a Boolean predicate; the system computes truth tables, K-maps, and ACC/CACC/MUTPC/MNFPC.",
      "logic.predicate": "Predicate",
      "logic.criterion": "Coverage criterion",
      "logic.truthTable": "Truth Table",
      "logic.kmap": "Karnaugh Map",
      "logic.implicants": "Prime Implicants",
      "logic.testRows": "Test rows",
      "logic.utp": "UTP",
      "logic.nfp": "NFP",
      "logic.notation.adjacency": "adjacency notation",
      "logic.notation.plus": "+ notation",
      "logic.kmap.unsupported": "Karnaugh map supports only 1\u20134 clauses (currently {n}).",
      "logic.err.tooManyClauses": "For visual readability, please limit clauses to 6 or fewer.",
      "logic.recent": "Recent:",
      "logic.remove": "Remove",
      "logic.inputHint": "Supports <code>&amp;&amp;</code> / <code>||</code> / <code>!</code>; textbook notation also accepted: adjacency = AND (e.g. <code>ab</code>), <code>+</code> = OR (e.g. <code>a+b</code>).",
      "logic.aria.criteria": "Logic Coverage criteria",
      "logic.duplicate": "Duplicate",
      "logic.unsatisfied": "No matching rows found for: {items}",
      "logic.dnfPrefix": "Minimal DNF of f: ",
      "logic.dnfNegPrefix": "Minimal DNF of \xACf: ",
      "logic.textbookOpen": " (textbook notation: ",
      "logic.textbookClose": ")",
      "logic.kmap.title.fStar": "Karnaugh Map of f (\u2605 = chosen test case)",
      "logic.kmap.title.fNegStar": "Karnaugh Map of \xACf (\u2605 = chosen test case)",
      "logic.kmap.title.utp": "Karnaugh Map of f (\u2605 = chosen UTP)",
      "logic.kmap.title.mutp": "Karnaugh Map of f (\u2605 = chosen MUTP)",
      "logic.kmap.title.mnfp": "Karnaugh Map of f (MNFP: NFPs per implicant \xD7 literal)",
      "logic.kmap.title.nfp": "Karnaugh Map of f (NFP and corresponding UTP)",
      "logic.kmap.title.cutpnfp": "Karnaugh Map of f (\u2605 = chosen test case; UTP\u2194NFP paired)",
      "logic.flipLabel": "{{term}} flip {lit}",
      "logic.metric.total": "Test rows: ",
      "logic.metric.unique": "Unique rows: ",
      "logic.metric.duplicate": "Duplicates: ",
      "logic.metric.requirements": "Suggested requirements: ",
      // Syntax / mutation
      "syntax.title": "Syntax-Based Testing: Program Mutation",
      "syntax.subtitle": "Pick a program, choose mutation operators, and a test set; the system generates mutants and reports the score.",
      "syntax.example": "Sample program",
      "syntax.params": "Parameters (comma-separated)",
      "syntax.body": "Function body (JS)",
      "syntax.operators": "Mutation operators",
      "syntax.tests": "Test set",
      "syntax.test.args": "Args",
      "syntax.test.expected": "Expected",
      "syntax.test.add": "Add test",
      "syntax.test.delete": "Delete",
      "syntax.run": "Generate & evaluate mutants",
      "syntax.reset": "Reset to sample defaults",
      "syntax.score": "Mutation Score",
      "syntax.summary": "{killed} killed / {total} mutants ({equivalent} equivalent)",
      "syntax.mutants": "Mutants",
      "syntax.mutant.line": "Line {line}",
      "syntax.mutant.original": "Original",
      "syntax.mutant.mutated": "Mutated",
      "syntax.mutant.killedBy": "Killed by",
      "syntax.mutant.survived": "Survived",
      "syntax.cloud.idle": "Cloud sync idle.",
      "syntax.cloud.syncing": "\u2601 Syncing\u2026",
      "syntax.cloud.synced": "Synced to cloud",
      "syntax.cloud.error": "Cloud sync error: {msg}",
      "syntax.cloud.notSignedIn": "Sign in with Google to sync test sets across devices.",
      "syntax.cloud.reload": "Reload from cloud",
      "syntax.parseError": "Parse error in args: {msg}",
      "grammar.kicker": "Grammar-Based Testing",
      "grammar.title": "Grammar Coverage Explorer",
      "grammar.subtitle": "Edit a BNF grammar, sample derivations, and inspect Production / Terminal coverage and grammar mutants.",
      "grammar.bnfEditor": "Grammar (BNF):",
      "grammar.maxStrings": "Max strings",
      "grammar.maxDepth": "Max depth",
      "grammar.extraTests": "Extra test strings (one per line)",
      "grammar.extraTestsHint": 'e.g. "0+1+1"',
      "grammar.productions": "Productions",
      "grammar.derivations": "Derived strings",
      "grammar.tab.derivations": "Derivations & Coverage",
      "grammar.tab.mutation": "Grammar Mutation",
      "grammar.tab.string": "String Mutation",
      "grammar.noDerivations": "No derivations yet \u2014 adjust limits or grammar.",
      "grammar.mutations": "Mutants",
      "grammar.noMutants": "No mutants (select at least one operator).",
      "grammar.killed": "killed",
      "grammar.live": "live",
      "grammar.killedBy": "Killed by:",
      "grammar.liveHint": "No string distinguishes the mutant from the original within the current bounds.",
      "grammar.selectMutantHint": "Select a mutant on the left to see details.",
      "grammar.scoreLabel": "Mutation score",
      "grammar.origAccepts": "orig: accept",
      "grammar.origRejects": "orig: reject",
      "grammar.mutAccepts": "mut: accept",
      "grammar.mutRejects": "mut: reject",
      "grammar.string.title": "Mutation on Strings (BNF Mutation)",
      "grammar.string.subtitle": "Apply mutation operators to a derived string. In-language results stress the parser; out-of-language results test error handling.",
      "grammar.string.seed": "Seed string",
      "grammar.string.maxPerOp": "Max mutants / op",
      "grammar.string.empty": "No string mutants \u2014 pick a seed and at least one operator.",
      "grammar.string.colMutated": "Mutated string",
      "grammar.string.colKind": "Result",
      "grammar.string.inLang": "in language",
      "grammar.string.outLang": "not in language",
      "grammar.string.statsPositive": "Positive (in-language)",
      "grammar.string.statsNegative": "Negative (out-of-language)",
      "grammar.string.original": "Original",
      "grammar.string.mutated": "Mutated",
      "grammar.string.flipped": "Flips language membership vs. seed.",
      "grammar.string.sameLang": "Same membership as seed.",
      "grammar.string.selectHint": "Select a row to inspect.",
      "spec.kicker": "Specification-Based Mutation",
      "spec.title": "Specification Mutation Explorer",
      "spec.subtitle": "Mutate a Boolean specification (precondition / invariant) and find assignments that distinguish the original from each mutant.",
      "spec.predicateLabel": "Predicate (e.g. (a || b) && c)",
      "spec.clauses": "Clauses",
      "spec.canonical": "Canonical",
      "spec.mutants": "Specification mutants",
      "spec.noMutants": "No mutants \u2014 enable at least one operator.",
      "spec.testNote": "Tests are the full truth table over the predicate clauses; a mutant is killed when its value differs from the original on any row.",
      "spec.mutantText": "Mutant predicate",
      "spec.equivalentHint": "No assignment in the truth table distinguishes this mutant from the original (likely equivalent).",
      "spec.op.ENF": "ENF \u2014 negate entire predicate",
      "spec.op.BCR": "BCR \u2014 replace clause with true / false",
      "spec.op.CRR": "CRR \u2014 replace clause with another clause",
      "spec.op.LRO": "LRO \u2014 swap && and ||",
      "spec.op.UOI": "UOI \u2014 insert NOT around a clause",
      "spec.op.MCR": "MCR \u2014 drop one operand of && or ||",
      "spec.fsm.original": "Original predicate (safety monitor)",
      "spec.fsm.mutant": "Mutant",
      "spec.fsm.pickMutant": "Pick a mutant to compare",
      "spec.fsm.legend": "Two-state monitor: SAFE = predicate holds, VIOLATION = predicate fails. Orange transitions are routed differently by the mutant (killer assignments).",
      "spec.smv.viewSource": "NuSMV source",
      "spec.cat.basic": "Basic predicates",
      "spec.cat.smv": "SMV / model checking",
      "spec.cat.aria": "Specification example category",
      "syntax.cloud.failed": "Sync failed",
      "syntax.cloud.linked": "Linked: {name}",
      "syntax.cloud.reloading": "Reloading from cloud\u2026",
      "syntax.cloud.loaded": "Loaded from cloud",
      "syntax.cloud.saveError": "Cloud save failed: {msg}",
      "syntax.cloud.loadError": "Cloud load failed: {msg}",
      "syntax.removeTest": "Remove",
      "syntax.mutant.statusLabel": "Status: ",
      "syntax.mutant.killedByList": "Killed by: {ids}",
      "syntax.mutant.liveHint": "This mutant is still live; you can mark it equivalent.",
      "syntax.mutant.empty": "Click a mutant on the left to see details.",
      "syntax.col.args": "args (JSON elements, comma-separated)",
      "syntax.col.expected": "expected (JSON)",
      "syntax.col.mutantGroupHeading": "{op} ({count})",
      "syntax.totalLabel": "Total",
      "syntax.noMutants": "No mutants (please select at least one operator).",
      "syntax.err.argsParse": "Failed to parse args: {msg}",
      "syntax.err.compile": "Original program failed to compile/run: {msg}"
    },
    zh: {
      "app.title": "\u8EDF\u9AD4\u6E2C\u8A66\u65B9\u6CD5\u8996\u89BA\u5316",
      "app.subtitle": "Software Testing Methods Visualization",
      "app.nav.aria": "\u5207\u63DB\u5340\u584A",
      "app.footer": "\u6839\u64DA Plan.md \u5EFA\u7ACB \xB7 \u8EDF\u9AD4\u6E2C\u8A66\u65B9\u6CD5\u8996\u89BA\u5316\u7CFB\u7D71",
      "app.lang.label": "\u8A9E\u8A00",
      "app.lang.en": "English",
      "app.lang.zh": "\u4E2D\u6587",
      "section.all": "\u5168\u89BD",
      "section.methods": "\u6E2C\u8A66\u65B9\u6CD5",
      "section.graph": "Graph Coverage",
      "section.logic": "Logic Coverage",
      "section.syntax": "Syntax-Based Testing",
      "section.cloud": "\u96F2\u7AEF\u6574\u5408",
      "section.flow": "\u6E2C\u8A66\u6D41\u7A0B",
      "section.types": "\u6E2C\u8A66\u985E\u578B",
      "section.methods.title": "\u6E2C\u8A66\u65B9\u6CD5\u5206\u985E",
      "section.graph.title": "Graph Coverage \u8996\u89BA\u5316",
      "section.logic.title": "Logic Coverage \u8996\u89BA\u5316",
      "section.syntax.title": "Syntax-Based Testing\uFF1AProgram Mutation",
      "syntaxTab.mutation": "\u7A0B\u5F0F Mutation",
      "syntaxTab.grammar": "Grammar Coverage",
      "syntaxTab.spec": "\u898F\u683C Mutation",
      "section.cloud.title": "Google \u96F2\u7AEF\u6574\u5408",
      "section.flow.title": "\u6E2C\u8A66\u6D41\u7A0B",
      "section.types.title": "\u5E38\u898B\u6E2C\u8A66\u985E\u578B",
      "section.symbex": "\u7B26\u865F\u57F7\u884C",
      "section.symbex.title": "Symbolic Execution Explorer",
      "symbex.source": "\u7A0B\u5F0F\u539F\u59CB\u78BC",
      "symbex.maxUnroll": "\u8FF4\u5708\u5C55\u958B\u4E0A\u9650",
      "symbex.summary.paths": "\u8DEF\u5F91\u6578\uFF1A",
      "symbex.summary.feasible": "\u53EF\u6EFF\u8DB3\u8DEF\u5F91\uFF1A",
      "symbex.summary.truncated": "\u5DF2\u622A\u65B7\uFF08\u9054\u8DEF\u5F91\u4E0A\u9650\uFF09",
      "symbex.feasible": "\u53EF\u6EFF\u8DB3",
      "symbex.infeasible": "\u5728\u641C\u5C0B\u7BC4\u570D\u5167\u672A\u627E\u5230\u898B\u8B49\u3002",
      "symbex.infeasible.short": "\u4E0D\u53EF\u6EFF\u8DB3",
      "symbex.witness": "\u898B\u8B49\u8F38\u5165",
      "symbex.return": "\u56DE\u50B3\u503C",
      "symbex.empty": "\u7121\u8DEF\u5F91\u53EF\u986F\u793A\u3002",
      "symbex.pc.empty": "Path condition\uFF1A\uFF08\u6C38\u9060\u53EF\u9054\uFF09",
      "symbex.hint": "\u652F\u63F4\u5C0F\u578B JS \u5B50\u96C6\uFF1Afunction \u5B63\u544A\u3001let/=\u3001if/else\u3001\u6709\u754C while\u3001return\u3001\u7B97\u8853\u8207\u6BD4\u8F03\u904B\u7B97\u3001&&/||/!\u3002\u898B\u8B49\u4EE5\u5C0F\u578B\u6574\u6578\u57DF\u7A6E\u8209\u6C42\u89E3\u3002",
      "symbex.cfg.title": "\u5728 CFG \u4E0A\u9AD8\u4EAE\u9078\u4E2D\u8DEF\u5F91",
      "symbex.cfg.none": "\uFF08\u5C1A\u672A\u9078\u53D6\u8DEF\u5F91\uFF09",
      "symbex.cfg.zoom": "\u7E2E\u653E",
      "symbex.cfg.zoomIn": "\u653E\u5927",
      "symbex.cfg.zoomOut": "\u7E2E\u5C0F",
      "symbex.cfg.zoomReset": "\u91CD\u8A2D\u7E2E\u653E",
      "section.concolic": "\u5177\u9AD4\u7B26\u865F\u57F7\u884C",
      "section.concolic.title": "Concolic Execution Explorer",
      "concolic.source": "\u7A0B\u5F0F\u539F\u59CB\u78BC",
      "concolic.seed": "\u521D\u59CB\u8F38\u5165",
      "concolic.maxIterations": "\u6700\u5927\u8FED\u4EE3\u6B21\u6578",
      "concolic.summary.iterations": "\u8FED\u4EE3\u6B21\u6578\uFF1A",
      "concolic.summary.uniquePaths": "\u552F\u4E00\u8DEF\u5F91\uFF1A",
      "concolic.summary.uniqueInputs": "\u552F\u4E00\u8F38\u5165\uFF1A",
      "concolic.summary.truncated": "\u5DF2\u622A\u65B7\uFF08\u9054\u8FED\u4EE3\u4E0A\u9650\uFF09",
      "concolic.return": "\u56DE\u50B3\u503C",
      "concolic.nextInput": "\u4E0B\u4E00\u500B\u8F38\u5165",
      "concolic.exhausted": "\u5DF2\u7121\u53EF\u7FFB\u8F49\u7684\u672A\u63A2\u7D22\u5206\u652F",
      "concolic.negated": "\u7FFB\u8F49",
      "concolic.pathKey": "\u8DEF\u5F91\u7C3D\u540D\uFF08\u9078\u4E2D=T\u3001\u672A\u9078=F\uFF09",
      "concolic.empty": "\u7121\u8FED\u4EE3\u53EF\u986F\u793A\u3002",
      "concolic.noBranches": "\u672A\u906D\u9047\u5206\u652F\uFF08\u76F4\u7DDA\u7A0B\u5F0F\uFF09\u3002",
      "concolic.runtimeError": "\u57F7\u884C\u6642\u932F\u8AA4\uFF1A",
      "concolic.hint": "Concolic execution = concrete + symbolic\u3002\u6BCF\u500B\u8FED\u4EE3\u5148\u5177\u9AD4\u8DD1\u4E00\u689D\u8DEF\u5F91\uFF0C\u518D\u7FFB\u8F49\u6700\u5F8C\u4E00\u500B\u672A\u63A2\u7D22\u5206\u652F\u4E26\u8ACB\u6C42\u89E3\u5668\u7522\u751F\u65B0\u8F38\u5165\u3002\u8A9E\u6CD5\u5B50\u96C6\u540C Symbolic Execution\u3002",
      "concolic.cfg.title": "\u5728 CFG \u4E0A\u9AD8\u4EAE\u9078\u4E2D\u7684\u8FED\u4EE3",
      "concolic.cfg.none": "\uFF08\u5C1A\u672A\u9078\u53D6\u8FED\u4EE3\uFF09",
      "concolic.cfg.zoom": "\u7E2E\u653E",
      "concolic.cfg.zoomIn": "\u653E\u5927",
      "concolic.cfg.zoomOut": "\u7E2E\u5C0F",
      "concolic.cfg.zoomReset": "\u91CD\u8A2D\u7E2E\u653E",
      "common.run": "\u57F7\u884C",
      "common.reset": "\u91CD\u8A2D",
      "common.save": "\u5132\u5B58",
      "common.delete": "\u522A\u9664",
      "common.add": "\u65B0\u589E",
      "common.notes": "\u5099\u8A3B",
      "common.actual": "\u5BE6\u969B",
      "common.expected": "\u9810\u671F",
      "common.input": "\u8F38\u5165",
      "common.output": "\u8F38\u51FA",
      "common.status": "\u72C0\u614B",
      "common.passed": "\u901A\u904E",
      "common.failed": "\u5931\u6557",
      "common.killed": "\u88AB\u6BBA\u6B7B",
      "common.live": "\u5B58\u6D3B",
      "common.equivalent": "\u7B49\u50F9",
      "common.markEquivalent": "\u6A19\u8A18\u70BA\u7B49\u50F9",
      "common.unmarkEquivalent": "\u53D6\u6D88\u7B49\u50F9\u6A19\u8A18",
      "common.reload": "\u91CD\u65B0\u8F09\u5165",
      "common.signedIn": "\u2713 \u5DF2\u767B\u5165",
      "common.notSignedIn": "\u5C1A\u672A\u767B\u5165",
      "common.googleSignIn": "Google \u767B\u5165",
      "common.signOut": "\u767B\u51FA",
      "cloud.kicker": "Google + Firebase",
      "cloud.title": "\u96F2\u7AEF\u8A2D\u5B9A\u8207\u6A94\u6848\u5132\u5B58",
      "cloud.subtitle": "Google \u767B\u5165\u5F8C\uFF1A\u8A2D\u5B9A\u5B58 Firebase\u3001\u6A94\u6848\u4E0A\u50B3\u5230 Google Drive\u3002",
      "cloud.fileWarning": "\u76EE\u524D\u70BA file:// \u6A21\u5F0F\u3002Google OAuth \u9700\u8981 http://localhost \u6216 https\u3002",
      "cloud.signInPrompt": "\u8ACB\u5148\u4EE5 Google \u767B\u5165\u5F8C\uFF0C\u518D\u5132\u5B58\u8A2D\u5B9A\u6216\u4E0A\u50B3\u6A94\u6848\u3002",
      "cloud.userPrefix": "\u76EE\u524D\u4F7F\u7528\u8005\uFF1A{name}",
      "cloud.section.settings": "\u8A2D\u5B9A\uFF08Firebase Firestore\uFF09",
      "cloud.section.files": "\u6A94\u6848\uFF08Google Drive\uFF09",
      "cloud.preferredCriterion": "\u9810\u8A2D Coverage Criterion",
      "cloud.notes": "\u5099\u8A3B",
      "cloud.extras": "\u984D\u5916\u8A2D\u5B9A JSON",
      "cloud.saveSettings": "\u5132\u5B58\u8A2D\u5B9A",
      "cloud.upload": "\u4E0A\u50B3\u5230 Google Drive",
      "cloud.refreshFiles": "\u91CD\u65B0\u6574\u7406\u6A94\u6848\u5217\u8868",
      "cloud.uploadHint": "\u9078\u64C7\u8981\u4E0A\u50B3\u7684\u6A94\u6848",
      "cloud.pendingUpload": "\u5F85\u4E0A\u50B3\uFF1A{name}",
      "cloud.noFileSelected": "\u5C1A\u672A\u9078\u64C7\u6A94\u6848",
      "cloud.noSavedSettings": "Firebase \u5C1A\u7121\u5DF2\u5132\u5B58\u8A2D\u5B9A\u3002",
      "cloud.extrasJsonError": "\u984D\u5916\u8A2D\u5B9A JSON \u683C\u5F0F\u932F\u8AA4\u3002",
      "cloud.loadSettings": "\u8B80\u53D6\u8A2D\u5B9A",
      "cloud.signedInOk": "Google \u767B\u5165\u6210\u529F\uFF0C\u5DF2\u53D6\u5F97 Drive \u4E0A\u50B3\u6B0A\u9650\u3002",
      "cloud.signedInNoDrive": "Google \u767B\u5165\u6210\u529F\uFF0C\u4F46\u672A\u53D6\u5F97 Drive \u6B0A\u9650\uFF0C\u8ACB\u91CD\u65B0\u767B\u5165\u3002",
      "cloud.signedOut": "\u5DF2\u767B\u51FA\u3002",
      "cloud.savedOk": "\u8A2D\u5B9A\u5DF2\u5132\u5B58\u5230 Firebase\u3002",
      "cloud.loadedOk": "\u5DF2\u5F9E Firebase \u8F09\u5165\u8A2D\u5B9A\u3002",
      "cloud.uploadedOk": "\u6A94\u6848\u5DF2\u4E0A\u50B3\uFF1A{name}",
      "cloud.noFiles": "\u5C1A\u7121\u4E0A\u50B3\u7D00\u9304",
      "cloud.openFile": "\u958B\u555F",
      "cloud.useForMutation": "\u7528\u65BC Mutation Test",
      "cloud.useForGraph": "\u7528\u65BC Graph Coverage",
      "cloud.useForGrammar": "\u7528\u65BC Grammar Coverage",
      "cloud.sentToMutation": "\u5DF2\u5C07 {name} \u50B3\u9001\u81F3 Mutation Test \u5340\u584A\u3002",
      "cloud.sentToGraph": "\u5DF2\u5C07 {name} \u50B3\u9001\u81F3 Graph Coverage \u5340\u584A\u3002",
      "cloud.sentToGrammar": "\u5DF2\u5C07 {name} \u50B3\u9001\u81F3 Grammar Coverage \u5340\u584A\u3002",
      "cloud.readError": "\u7121\u6CD5\u8B80\u53D6\u6A94\u6848\uFF1A{msg}",
      "cloud.noContent": "\u6A94\u6848\u5167\u5BB9\u4E0D\u53EF\u7528\uFF0C\u8ACB\u91CD\u65B0\u4E0A\u50B3\u3002",
      "cloud.driveFilesTitle": "Google Drive \u6A94\u6848",
      "cloud.refreshDriveFiles": "\u91CD\u65B0\u6574\u7406 Drive \u6A94\u6848",
      "cloud.refreshing": "\u8B80\u53D6\u4E2D\u2026",
      "cloud.noDriveFiles": "Drive \u4E2D\u5C1A\u7121\u6A94\u6848\u3002",
      "cloud.signInToList": "\u8ACB\u5148\u767B\u5165\u4EE5\u8B80\u53D6 Drive \u6A94\u6848\u3002",
      "cloud.driveListed": "\u5DF2\u5F9E Drive \u8B80\u53D6 {count} \u500B\u6A94\u6848\u3002",
      "cloud.driveListError": "\u8B80\u53D6 Drive \u6A94\u6848\u5217\u8868\u5931\u6557\uFF1A{msg}",
      "cloud.downloading": "\u4E0B\u8F09 {name} \u4E2D\u2026",
      "cloud.firebaseMissing": "Firebase \u8A2D\u5B9A\u4E0D\u5B8C\u6574\uFF1A{keys}",
      "cloud.err.fileProtocol": "Google OAuth \u4E0D\u652F\u63F4 file://\u3002\u8ACB\u6539\u7528 http://localhost \u6216 https \u7DB2\u5740\u958B\u555F\u9801\u9762\u3002",
      "cloud.err.firebaseIncomplete": "Firebase \u8A2D\u5B9A\u4E0D\u5B8C\u6574\uFF0C\u7F3A\u5C11\uFF1A{keys}",
      "cloud.err.sdkNotLoaded": "Firebase SDK \u5C1A\u672A\u8F09\u5165\uFF0C\u8ACB\u78BA\u8A8D index.html \u5DF2\u5F15\u5165 firebase-app/auth/firestore compat scripts\u3002",
      "cloud.err.noDriveToken": "\u76EE\u524D\u6C92\u6709 Drive \u5B58\u53D6\u6B0A\u6756\uFF0C\u8ACB\u5148\u91CD\u65B0 Google \u767B\u5165\u3002",
      "cloud.err.uploadFailed": "\u4E0A\u50B3\u5230 Google Drive \u5931\u6557\u3002",
      "cloud.err.listFailed": "\u8B80\u53D6 Google Drive \u6A94\u6848\u5217\u8868\u5931\u6557\u3002",
      "cloud.err.downloadFailed": "\u4E0B\u8F09 Google Drive \u6A94\u6848\u5931\u6557\u3002",
      "methods.intro": "\u5C64\u7D1A\u5F0F\u5448\u73FE\u5E38\u898B\u6E2C\u8A66\u65B9\u6CD5\u5206\u985E\uFF0C\u53EF\u6ED1\u9F20\u79FB\u4E0A\u6216\u9EDE\u9078\u67E5\u770B\u7D30\u7BC0\u3002",
      "methods.expandAll": "\u5168\u90E8\u5C55\u958B",
      "methods.collapseAll": "\u5168\u90E8\u6536\u5408",
      "methods.codeVisibility": "\u4EE3\u78BC\u53EF\u898B\u5EA6",
      "methods.countBadge": "{n} \u9805\u6280\u8853",
      "flow.intro": "\u4E00\u500B\u5178\u578B\u7684\u6E2C\u8A66\u6D41\u7A0B\uFF1A",
      "flow.play": "\u64AD\u653E",
      "flow.pause": "\u66AB\u505C",
      "flow.step": "\u6B65\u9A5F {n}: {label}",
      "flow.progress": "\u9032\u5EA6\uFF1A{current} / {total} \u2014 {label}",
      "types.intro": "\u696D\u754C\u5E38\u898B\u7684\u6E2C\u8A66\u985E\u578B\uFF1A",
      "types.col.name": "\u985E\u578B",
      "types.col.purpose": "\u76EE\u7684",
      "types.col.example": "\u7BC4\u4F8B",
      "types.col.timing": "\u6642\u6A5F",
      "types.pyramid.title": "\u6E2C\u8A66\u91D1\u5B57\u5854\uFF08\u7531\u5E95\u5C64\u81F3\u9802\u5C64\uFF09",
      "graph.title": "Graph Coverage \u4E92\u52D5\u63A2\u7D22",
      "graph.subtitle": "\u9078\u64C7\u7BC4\u4F8B\u7A0B\u5F0F\u6216\u81EA\u884C\u4E0A\u50B3 JS \u51FD\u5F0F\uFF0C\u7CFB\u7D71\u6703\u62BD\u53D6 CFG \u4E26\u4F9D\u6E96\u5247\u8986\u84CB\u3002",
      "graph.example": "\u7BC4\u4F8B\u7A0B\u5F0F",
      "graph.criterion": "Coverage \u6E96\u5247",
      "graph.uploadLabel": "\u4E0A\u50B3 JS \u6A94\u6848",
      "graph.uploadHint": "\u4E0A\u50B3\u4EE5 JavaScript \u64B0\u5BEB\u7684\u55AE\u4E00\u51FD\u5F0F\u3002",
      "graph.run": "\u7522\u751F\u8986\u84CB\u7D50\u679C",
      "graph.cfg": "\u63A7\u5236\u6D41\u7A0B\u5716\uFF08CFG\uFF09",
      "graph.paths": "\u6EFF\u8DB3\u6E96\u5247\u4E4B\u8DEF\u5F91",
      "graph.coverage": "Coverage \u5831\u544A",
      "graph.testCases": "\u5EFA\u8B70\u6E2C\u8A66\u6848\u4F8B",
      "graph.noTests": "\u6B64\u6E96\u5247\u4E0D\u9700\u6E2C\u8A66\u8F38\u5165\u3002",
      "graph.parseError": "\u89E3\u6790\u932F\u8AA4\uFF1A{msg}",
      "common.none": "\u7121",
      "common.chooseFile": "\u9078\u64C7\u6A94\u6848",
      "graph.aria.canvas": "Graph coverage \u63A7\u5236\u6D41\u7A0B\u5716",
      "graph.dfg.title": "\u8CC7\u6599\u6D41\u7A0B\u5716\uFF08def \u2192 use\uFF09",
      "graph.dfg.help": "\u4F9D\u6BCF\u500B\u53E5\u7684\u8CE6\u503C\u63A8\u5C0E\u5B9A\u7FA9\u8207\u4F7F\u7528\uFF0C\u6CBF CFG \u8D70\u5230\u672A\u88AB\u4E2D\u9593 def \u8986\u5BEB\u7684 use\u3002\u908A\u4E0A\u6A19\u793A\u8B8A\u6578\u540D\u3002",
      "graph.dfg.empty": "\u5F9E\u76EE\u524D\u539F\u59CB\u7A0B\u5F0F\u672A\u5075\u6E2C\u5230 def\u2192use \u95DC\u4FC2\u3002",
      "graph.dfg.aria": "\u8CC7\u6599\u6D41\u7A0B\u5716",
      "graph.aria.switcher": "coverage criteria \u5207\u63DB",
      "graph.customTitle": "\u81EA\u8A02\u63A7\u5236\u6D41\u7A0B\u5716",
      "graph.source.empty": "\u9019\u500B\u4F86\u6E90\u76EE\u524D\u53EA\u63D0\u4F9B graph\uFF0C\u6C92\u6709\u9644\u5E36\u7A0B\u5F0F\u78BC\u7247\u6BB5\u3002",
      "graph.headerDesc": "\u7528\u540C\u4E00\u5F35\u63A7\u5236\u6D41\u7A0B\u5716\uFF0C\u5207\u63DB\u4E0D\u540C coverage criteria\uFF0C\u76F4\u63A5\u770B\u5230\u5FC5\u9808\u6DB5\u84CB\u7684\u7BC0\u9EDE\u3001\u908A\u8207 path\u3002",
      "graph.editor.help": "\u53EF\u5F9E\u771F\u5BE6\u7A0B\u5F0F\u7BC4\u4F8B\u8F09\u5165 CFG\uFF0C\u518D\u5FAE\u8ABF graph \u4E26\u5373\u6642\u8A08\u7B97 coverage requirements \u8207 test paths\u3002",
      "graph.editor.reset": "\u9084\u539F\u9810\u8A2D\u5716",
      "graph.editor.synced": "Graph \u5DF2\u540C\u6B65\u66F4\u65B0",
      "graph.uploadFormatHelp": "JSON \u53EF\u76F4\u63A5\u63D0\u4F9B graph \u7269\u4EF6\uFF0C\u6216\u76F4\u63A5\u63D0\u4F9B nodes\u3001edges\u3001startNodeId\u3001endNodeId\uFF0C\u4E5F\u53EF\u9644\u5E36 title\u3001description\u3001sourceCode\u3002\u7A0B\u5F0F\u78BC\u4E0A\u50B3\u5247\u6703\u4F9D\u8A9E\u8A00\u985E\u578B\u81EA\u52D5\u7522\u751F\u7C21\u5316 CFG\u3002",
      "graph.summary.current": "\u76EE\u524D requirement",
      "graph.path.help": "\u5C07 requirement \u81EA\u52D5\u7D44\u5408\u6210\u53EF\u57F7\u884C\u6E2C\u8A66\u8DEF\u5F91\uFF08Start \u5230 End\uFF09\u3002",
      "graph.path.before": "\u6700\u4F73\u5316\u524D",
      "graph.path.after": "\u6700\u4F73\u5316\u5F8C",
      "graph.path.saved": "\u7CBE\u7C21\u6578\u91CF",
      "graph.path.none": "\u7121\u53EF\u7528\u8DEF\u5F91",
      "graph.path.uncovered": "\u5C1A\u672A\u8986\u84CB\uFF1A{items}",
      "graph.path.allCovered": "\u5168\u90E8 requirement \u5DF2\u5C0D\u61C9\u5230 test paths",
      "graph.req.help": "\u5207\u63DB criteria \u5F8C\uFF0C\u5217\u8868\u6703\u91CD\u7B97\u5C0D\u61C9\u5FC5\u9808\u8986\u84CB\u7684 requirement\u3002",
      "graph.detail.noSourceMap": "\u76EE\u524D requirement \u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u7A0B\u5F0F\u78BC\u884C\u865F\u3002",
      "graph.status.initial": "\u53EF\u5207\u63DB\u56FA\u5B9A\u7A0B\u5F0F\u7BC4\u4F8B\uFF0C\u6216\u4E0A\u50B3 JSON graph spec\u3001\u7A0B\u5F0F\u78BC\u6A94\u6848\u3002",
      "graph.status.recomputed": "{name} \u5DF2\u4F9D\u7167\u7DE8\u8F2F\u5167\u5BB9\u91CD\u65B0\u8A08\u7B97\u3002",
      "graph.status.reset": "{name} \u5DF2\u9084\u539F\u70BA\u8F09\u5165\u6642\u7684 graph\u3002",
      "graph.status.defaultLoaded": "\u5DF2\u8F09\u5165\u9810\u8A2D\u63A7\u5236\u6D41\u7A0B\u5716\u7BC4\u4F8B\u3002",
      "graph.status.pickJson": "\u8ACB\u9078\u64C7 JSON \u6A94\u6848\u4EE5\u4E0A\u50B3 graph spec\u3002",
      "graph.status.pickCode": "\u8ACB\u9078\u64C7\u7A0B\u5F0F\u78BC\u6A94\u6848\u8207\u8A9E\u8A00\u985E\u578B\uFF0C\u7CFB\u7D71\u6703\u81EA\u52D5\u7522\u751F\u7C21\u5316 CFG\u3002",
      "graph.status.exampleLoaded": "\u5DF2\u8F09\u5165 {name}\u3002",
      "graph.status.uploadLoaded": "\u5DF2\u8F09\u5165\u4E0A\u50B3\u6A94\u6848\uFF1A{name}",
      "graph.status.codeGenerated": "\u5DF2\u6839\u64DA {name} \u81EA\u52D5\u7522\u751F\u7C21\u5316 CFG\u3002",
      "graph.status.codeFailed": "\u7A0B\u5F0F\u78BC\u4E0A\u50B3\u5931\u6557\u3002",
      "graph.err.nodesEmpty": "\u7BC0\u9EDE\u4E0D\u80FD\u70BA\u7A7A\u3002",
      "graph.err.nodeFmt": "\u7BC0\u9EDE\u683C\u5F0F\u932F\u8AA4\uFF08\u7B2C {line} \u884C\uFF09\uFF0C\u8ACB\u4F7F\u7528 id,label,x,y\u3002",
      "graph.err.nodeCoord": "\u7BC0\u9EDE\u5EA7\u6A19\u683C\u5F0F\u932F\u8AA4\uFF08\u7B2C {line} \u884C\uFF09\uFF0Cx,y \u5FC5\u9808\u662F\u6578\u5B57\u3002",
      "graph.err.edgesEmpty": "\u908A\u4E0D\u80FD\u70BA\u7A7A\u3002",
      "graph.err.edgeFmt": "\u908A\u683C\u5F0F\u932F\u8AA4\uFF08\u7B2C {line} \u884C\uFF09\uFF0C\u8ACB\u4F7F\u7528 from,to \u6216 id,from,to \u6216 id,from,to,cx,cy\u3002",
      "graph.err.edgeMissing": "\u908A\u683C\u5F0F\u932F\u8AA4\uFF08\u7B2C {line} \u884C\uFF09\uFF0C\u7F3A\u5C11 from/to\u3002",
      "graph.err.edgeNode": "\u908A\u7BC0\u9EDE\u4E0D\u5B58\u5728\uFF08\u7B2C {line} \u884C\uFF09\uFF1A{from} -> {to}",
      "graph.err.edgeCtl": "\u908A\u63A7\u5236\u9EDE\u683C\u5F0F\u932F\u8AA4\uFF08\u7B2C {line} \u884C\uFF09\uFF0Ccx,cy \u5FC5\u9808\u662F\u6578\u5B57\u3002",
      "graph.err.startMissing": "Start node \u4E0D\u5B58\u5728\u65BC\u7BC0\u9EDE\u6E05\u55AE\u3002",
      "graph.err.endMissing": "End node \u4E0D\u5B58\u5728\u65BC\u7BC0\u9EDE\u6E05\u55AE\u3002",
      "graph.err.notJson": "\u4E0A\u50B3\u5167\u5BB9\u4E0D\u662F\u6709\u6548\u7684 JSON\u3002",
      "graph.err.jsonShape": "JSON \u9700\u5305\u542B graph \u7269\u4EF6\uFF0C\u6216\u76F4\u63A5\u5305\u542B nodes / edges / startNodeId / endNodeId\u3002",
      "graph.err.readFile": "\u7121\u6CD5\u8B80\u53D6\u4E0A\u50B3\u6A94\u6848\u3002",
      "graph.err.noSource": "\u627E\u4E0D\u5230\u53EF\u7528\u7684 graph \u4F86\u6E90\u3002",
      "logic.title": "Logic Coverage \u4E92\u52D5\u63A2\u7D22",
      "logic.subtitle": "\u6311\u9078\u5E03\u6797\u8FF0\u8A5E\uFF0C\u7CFB\u7D71\u6703\u8A08\u7B97\u771F\u503C\u8868\u3001K-map \u8207 ACC / CACC / MUTPC / MNFPC\u3002",
      "logic.predicate": "\u8FF0\u8A5E",
      "logic.criterion": "Coverage \u6E96\u5247",
      "logic.truthTable": "\u771F\u503C\u8868",
      "logic.kmap": "Karnaugh Map",
      "logic.implicants": "Prime Implicants",
      "logic.testRows": "\u6E2C\u8A66\u5217",
      "logic.utp": "UTP",
      "logic.nfp": "NFP",
      "logic.notation.adjacency": "\u76F8\u9130\u8868\u793A\u6CD5",
      "logic.notation.plus": "+ \u8868\u793A\u6CD5",
      "logic.kmap.unsupported": "Karnaugh map \u50C5\u652F\u63F4 1\u20134 \u500B clauses\uFF08\u76EE\u524D\u70BA {n}\uFF09\u3002",
      "logic.err.tooManyClauses": "\u70BA\u4E86\u8996\u89BA\u5316\u53EF\u8B80\u6027\uFF0C\u5B50\u53E5\u6578\u91CF\u8ACB\u9650\u5236\u5728 6 \u500B\u4EE5\u5167\u3002",
      "logic.recent": "\u6700\u8FD1\uFF1A",
      "logic.remove": "\u79FB\u9664",
      "logic.inputHint": "\u652F\u63F4 <code>&amp;&amp;</code> / <code>||</code> / <code>!</code>\uFF0C\u4E5F\u63A5\u53D7\u6559\u79D1\u66F8\u8A18\u865F\uFF1A\u76F8\u9130\u5373 AND\uFF08\u5982 <code>ab</code>\uFF09\u3001<code>+</code> \u70BA OR\uFF08\u5982 <code>a+b</code>\uFF09\u3002",
      "logic.aria.criteria": "Logic Coverage \u6E96\u5247",
      "logic.duplicate": "\u91CD\u8907",
      "logic.unsatisfied": "\u7121\u6CD5\u627E\u5230\u4E0B\u5217\u9700\u6C42\u5C0D\u61C9\u5217\uFF1A{items}",
      "logic.dnfPrefix": "f \u7684\u6700\u5C0F DNF\uFF1A",
      "logic.dnfNegPrefix": "\xACf \u7684\u6700\u5C0F DNF\uFF1A",
      "logic.textbookOpen": "\uFF08\u6559\u79D1\u66F8\u8A18\u865F\uFF1A",
      "logic.textbookClose": "\uFF09",
      "logic.kmap.title.fStar": "f \u7684 Karnaugh Map\uFF08\u2605 = \u9078\u7528 test case\uFF09",
      "logic.kmap.title.fNegStar": "\xACf \u7684 Karnaugh Map\uFF08\u2605 = \u9078\u7528 test case\uFF09",
      "logic.kmap.title.utp": "f \u7684 Karnaugh Map\uFF08\u2605 = \u9078\u53D6\u7684 UTP\uFF09",
      "logic.kmap.title.mutp": "f \u7684 Karnaugh Map\uFF08\u2605 = \u9078\u53D6\u7684 MUTP\uFF09",
      "logic.kmap.title.mnfp": "f \u7684 Karnaugh Map\uFF08MNFP\uFF1A\u6BCF\u500B implicant \xD7 literal \u9078\u53D6\u7684 NFPs\uFF09",
      "logic.kmap.title.nfp": "f \u7684 Karnaugh Map\uFF08NFP \u8207\u5C0D\u61C9 UTP\uFF09",
      "logic.kmap.title.cutpnfp": "f \u7684 Karnaugh Map\uFF08\u2605 = \u9078\u53D6\u7684 test case\uFF1BUTP\u2194NFP \u6210\u5C0D\u6A19\u793A\uFF09",
      "logic.flipLabel": "{{term}} \u7FFB\u8F49 {lit}",
      "logic.metric.total": "\u6E2C\u8A66\u5217\u6578\uFF1A",
      "logic.metric.unique": "\u5BE6\u969B\u9700\u8981\uFF08\u53BB\u91CD\uFF09\uFF1A",
      "logic.metric.duplicate": "\u91CD\u8907\u6578\u91CF\uFF1A",
      "logic.metric.requirements": "\u5EFA\u8B70\u6E2C\u8A66\u9700\u6C42\uFF1A",
      "syntax.title": "Syntax-Based Testing\uFF1AProgram Mutation",
      "syntax.subtitle": "\u6311\u9078\u7A0B\u5F0F\u3001\u9078\u64C7 mutation operators \u8207 test set\uFF0C\u7CFB\u7D71\u6703\u7522\u751F mutants \u4E26\u8A08\u5206\u3002",
      "syntax.example": "\u7BC4\u4F8B\u7A0B\u5F0F",
      "syntax.params": "\u53C3\u6578\uFF08\u4EE5\u9017\u865F\u5206\u9694\uFF09",
      "syntax.body": "\u51FD\u5F0F\u5167\u5BB9\uFF08JS\uFF09",
      "syntax.operators": "Mutation operators",
      "syntax.tests": "\u6E2C\u8A66\u96C6\u5408",
      "syntax.test.args": "\u53C3\u6578",
      "syntax.test.expected": "\u9810\u671F",
      "syntax.test.add": "\u65B0\u589E\u6E2C\u8A66",
      "syntax.test.delete": "\u522A\u9664",
      "syntax.run": "\u7522\u751F & \u8A55\u4F30 mutants",
      "syntax.reset": "\u9084\u539F\u6210\u7BC4\u4F8B\u9810\u8A2D\u503C",
      "syntax.score": "Mutation Score",
      "syntax.summary": "{killed} \u88AB\u6BBA / \u5171 {total} \u500B mutants\uFF08\u5176\u4E2D {equivalent} equivalent\uFF09",
      "syntax.mutants": "Mutants",
      "syntax.mutant.line": "\u7B2C {line} \u884C",
      "syntax.mutant.original": "\u539F\u59CB",
      "syntax.mutant.mutated": "\u7A81\u8B8A",
      "syntax.mutant.killedBy": "\u88AB\u6BBA\u65BC",
      "syntax.mutant.survived": "\u5B58\u6D3B",
      "syntax.cloud.idle": "\u96F2\u7AEF\u540C\u6B65\uFF1A\u9592\u7F6E\u3002",
      "syntax.cloud.syncing": "\u2601 \u6B63\u5728\u540C\u6B65\u2026",
      "syntax.cloud.synced": "\u5DF2\u540C\u6B65\u5230\u96F2\u7AEF",
      "syntax.cloud.error": "\u96F2\u7AEF\u540C\u6B65\u932F\u8AA4\uFF1A{msg}",
      "syntax.cloud.notSignedIn": "\u4EE5 Google \u767B\u5165\u5373\u53EF\u8DE8\u88DD\u7F6E\u540C\u6B65\u6E2C\u8A66\u96C6\u5408\u3002",
      "syntax.cloud.reload": "\u5F9E\u96F2\u7AEF\u91CD\u65B0\u8F09\u5165",
      "syntax.parseError": "\u53C3\u6578\u89E3\u6790\u932F\u8AA4\uFF1A{msg}",
      "grammar.kicker": "\u57FA\u65BC\u6587\u6CD5\u7684\u6E2C\u8A66",
      "grammar.title": "Grammar Coverage \u63A2\u7D22\u5668",
      "grammar.subtitle": "\u7DE8\u8F2F BNF \u6587\u6CD5\u3001\u7522\u751F\u884D\u751F\u5B57\u4E32\uFF0C\u4E26\u89C0\u5BDF Production / Terminal \u8986\u84CB\u8207 Grammar Mutants\u3002",
      "grammar.bnfEditor": "\u6587\u6CD5\uFF08BNF\uFF09\uFF1A",
      "grammar.maxStrings": "\u6700\u5927\u5B57\u4E32\u6578",
      "grammar.maxDepth": "\u6700\u5927\u63A8\u5C0E\u6DF1\u5EA6",
      "grammar.extraTests": "\u984D\u5916\u6E2C\u8A66\u5B57\u4E32\uFF08\u6BCF\u884C\u4E00\u500B\uFF09",
      "grammar.extraTestsHint": "\u4F8B\uFF1A0+1+1",
      "grammar.productions": "\u7522\u751F\u898F\u5247",
      "grammar.derivations": "\u884D\u751F\u5B57\u4E32",
      "grammar.tab.derivations": "\u8986\u84CB\u8207\u884D\u751F",
      "grammar.tab.mutation": "\u6587\u6CD5 Mutation",
      "grammar.tab.string": "\u5B57\u4E32 Mutation",
      "grammar.noDerivations": "\u5C1A\u7121\u884D\u751F\u7D50\u679C\uFF0C\u8ACB\u8ABF\u6574\u53C3\u6578\u6216\u6587\u6CD5\u3002",
      "grammar.mutations": "Mutants",
      "grammar.noMutants": "\u7121 mutants\uFF08\u8ACB\u9078\u64C7\u81F3\u5C11\u4E00\u500B operator\uFF09\u3002",
      "grammar.killed": "\u5DF2 killed",
      "grammar.live": "live",
      "grammar.killedBy": "\u88AB\u4EE5\u4E0B\u5B57\u4E32 killed\uFF1A",
      "grammar.liveHint": "\u5728\u76EE\u524D\u754C\u9650\u5167\u6C92\u6709\u5B57\u4E32\u80FD\u5340\u5206 mutant \u8207\u539F grammar\u3002",
      "grammar.selectMutantHint": "\u9EDE\u9078\u5DE6\u5074 mutant \u67E5\u770B\u7D30\u7BC0\u3002",
      "grammar.scoreLabel": "Mutation Score",
      "grammar.origAccepts": "\u539F grammar\uFF1A\u63A5\u53D7",
      "grammar.origRejects": "\u539F grammar\uFF1A\u62D2\u7D55",
      "grammar.mutAccepts": "mutant\uFF1A\u63A5\u53D7",
      "grammar.mutRejects": "mutant\uFF1A\u62D2\u7D55",
      "grammar.string.title": "\u5B57\u4E32\u7A81\u8B8A\uFF08Mutation on Strings\uFF09",
      "grammar.string.subtitle": "\u5C0D\u884D\u751F\u5B57\u4E32\u5957\u7528\u7A81\u8B8A\u904B\u7B97\u5B50\uFF1B\u843D\u5728\u8A9E\u8A00\u5167\u7684\u5B57\u4E32\u53EF\u4F5C\u70BA\u6B63\u5411\u6E2C\u8A66\uFF0C\u843D\u5728\u8A9E\u8A00\u5916\u7684\u5B57\u4E32\u5247\u7528\u65BC\u932F\u8AA4\u8655\u7406\u6E2C\u8A66\u3002",
      "grammar.string.seed": "\u7A2E\u5B50\u5B57\u4E32",
      "grammar.string.maxPerOp": "\u6BCF\u904B\u7B97\u5B50\u6700\u591A mutants",
      "grammar.string.empty": "\u5C1A\u7121\u5B57\u4E32 mutants\uFF1B\u8ACB\u9078\u64C7\u7A2E\u5B50\u4E26\u81F3\u5C11\u555F\u7528\u4E00\u500B\u904B\u7B97\u5B50\u3002",
      "grammar.string.colMutated": "\u7A81\u8B8A\u5B57\u4E32",
      "grammar.string.colKind": "\u5224\u5B9A",
      "grammar.string.inLang": "\u5C6C\u65BC\u8A9E\u8A00",
      "grammar.string.outLang": "\u4E0D\u5C6C\u65BC\u8A9E\u8A00",
      "grammar.string.statsPositive": "\u6B63\u5411\uFF08in-language\uFF09",
      "grammar.string.statsNegative": "\u53CD\u5411\uFF08out-of-language\uFF09",
      "grammar.string.original": "\u539F\u5B57\u4E32",
      "grammar.string.mutated": "\u7A81\u8B8A\u5F8C",
      "grammar.string.flipped": "\u76F8\u5C0D\u7A2E\u5B50\u7FFB\u8F49\u4E86\u8A9E\u8A00\u6B78\u5C6C\u3002",
      "grammar.string.sameLang": "\u8207\u7A2E\u5B50\u5728\u540C\u4E00\u5074\uFF08\u5C6C\u65BC / \u4E0D\u5C6C\u65BC\uFF09\u3002",
      "grammar.string.selectHint": "\u9EDE\u9078\u4E00\u5217\u67E5\u770B\u7D30\u7BC0\u3002",
      "spec.kicker": "\u898F\u683C\u7A81\u8B8A\u6E2C\u8A66",
      "spec.title": "Specification Mutation \u63A2\u7D22\u5668",
      "spec.subtitle": "\u5C0D\u4E00\u500B\u5E03\u6797\u898F\u683C\uFF08\u524D\u7F6E\u689D\u4EF6 / \u4E0D\u8B8A\u5F0F\uFF09\u5957\u7528\u7A81\u8B8A\u904B\u7B97\u5B50\uFF0C\u4E26\u5728\u771F\u503C\u8868\u4E2D\u627E\u51FA\u80FD\u5340\u5206\u539F predicate \u8207 mutant \u7684\u8CDC\u503C\u3002",
      "spec.predicateLabel": "Predicate\uFF08\u4F8B\uFF1A(a || b) && c\uFF09",
      "spec.clauses": "\u5B50\u53E5",
      "spec.canonical": "\u6A19\u6E96\u5316",
      "spec.mutants": "\u898F\u683C Mutants",
      "spec.noMutants": "\u5C1A\u7121 mutants\uFF1B\u8ACB\u81F3\u5C11\u555F\u7528\u4E00\u500B\u904B\u7B97\u5B50\u3002",
      "spec.testNote": "\u6E2C\u8A66\u96C6\u70BA\u8A72 predicate \u6240\u6709\u5B50\u53E5\u7684\u5B8C\u6574\u771F\u503C\u8868\uFF1Bmutant \u53EA\u8981\u5728\u67D0\u4E00\u5217\u4E0A\u8207\u539F predicate \u8A55\u4F30\u7D50\u679C\u4E0D\u540C\u5373\u8996\u70BA killed\u3002",
      "spec.mutantText": "Mutant Predicate",
      "spec.equivalentHint": "\u771F\u503C\u8868\u4E2D\u6C92\u6709\u4EFB\u4F55\u8CDC\u503C\u80FD\u5340\u5206\u9019\u500B mutant\uFF08\u5F88\u53EF\u80FD\u662F equivalent mutant\uFF09\u3002",
      "spec.op.ENF": "ENF \u2014 \u5C0D\u6574\u500B predicate \u53D6\u53CD",
      "spec.op.BCR": "BCR \u2014 \u5C07\u5B50\u53E5\u63DB\u6210 true / false",
      "spec.op.CRR": "CRR \u2014 \u5C07\u5B50\u53E5\u63DB\u6210\u53E6\u4E00\u500B\u5B50\u53E5",
      "spec.op.LRO": "LRO \u2014 \u4EA4\u63DB && \u8207 ||",
      "spec.op.UOI": "UOI \u2014 \u5728\u5B50\u53E5\u5916\u63D2\u5165 NOT",
      "spec.op.MCR": "MCR \u2014 \u522A\u9664 && \u6216 || \u7684\u4E00\u500B\u64CD\u4F5C\u5143",
      "spec.fsm.original": "\u539F predicate\uFF08\u5B89\u5168\u76E3\u63A7\u72C0\u614B\u6A5F\uFF09",
      "spec.fsm.mutant": "Mutant",
      "spec.fsm.pickMutant": "\u9078\u64C7 mutant \u9032\u884C\u6BD4\u5C0D",
      "spec.fsm.legend": "\u5169\u72C0\u614B\u76E3\u63A7\uFF1ASAFE = predicate \u70BA\u771F\uFF0CVIOLATION = predicate \u70BA\u5047\u3002\u6A58\u8272\u908A\u4EE3\u8868 mutant \u5C07\u8A72\u8CDC\u503C\u5C0E\u5411\u4E0D\u540C\u72C0\u614B\uFF08\u5373 killer assignments\uFF09\u3002",
      "spec.smv.viewSource": "NuSMV \u539F\u59CB\u7A0B\u5F0F",
      "spec.cat.basic": "\u57FA\u672C predicate",
      "spec.cat.smv": "SMV / \u6A21\u578B\u6AA2\u67E5",
      "spec.cat.aria": "\u898F\u683C\u7BC4\u4F8B\u5206\u985E",
      "syntax.cloud.failed": "\u540C\u6B65\u5931\u6557",
      "syntax.cloud.linked": "\u5DF2\u9023\u7D50 {name}",
      "syntax.cloud.reloading": "\u91CD\u65B0\u5F9E\u96F2\u7AEF\u8B80\u53D6\u2026",
      "syntax.cloud.loaded": "\u5DF2\u5F9E\u96F2\u7AEF\u8F09\u5165",
      "syntax.cloud.saveError": "\u96F2\u7AEF\u5132\u5B58\u5931\u6557\uFF1A{msg}",
      "syntax.cloud.loadError": "\u96F2\u7AEF\u8B80\u53D6\u5931\u6557\uFF1A{msg}",
      "syntax.removeTest": "\u79FB\u9664",
      "syntax.mutant.statusLabel": "\u72C0\u614B\uFF1A",
      "syntax.mutant.killedByList": "\u88AB\u4EE5\u4E0B test killed\uFF1A{ids}",
      "syntax.mutant.liveHint": "\u6B64 mutant \u4ECD live\uFF1B\u53EF\u624B\u52D5\u6A19\u70BA equivalent\u3002",
      "syntax.mutant.empty": "\u9EDE\u9078\u5DE6\u5074 mutant \u67E5\u770B\u7D30\u7BC0\u3002",
      "syntax.col.args": "args\uFF08JSON \u5143\u7D20\uFF0C\u9017\u865F\u5206\u9694\uFF09",
      "syntax.col.expected": "expected\uFF08JSON\uFF09",
      "syntax.col.mutantGroupHeading": "{op}\uFF08{count}\uFF09",
      "syntax.totalLabel": "\u7E3D\u6578",
      "syntax.noMutants": "\u7121 mutants\uFF08\u8ACB\u9078\u64C7\u81F3\u5C11\u4E00\u500B operator\uFF09\u3002",
      "syntax.err.argsParse": "\u53C3\u6578\u89E3\u6790\u5931\u6557\uFF1A{msg}",
      "syntax.err.compile": "\u539F\u7A0B\u5F0F\u7DE8\u8B6F/\u57F7\u884C\u5931\u6557\uFF1A{msg}"
    }
  };

  // src/i18n/index.js
  var STORAGE_KEY = "stvisual.locale";
  var DEFAULT_LOCALE = "en";
  var SUPPORTED = ["en", "zh"];
  var current = (() => {
    var _a2;
    try {
      const saved = (_a2 = globalThis.localStorage) == null ? void 0 : _a2.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.includes(saved)) return saved;
    } catch {
    }
    return DEFAULT_LOCALE;
  })();
  var listeners = /* @__PURE__ */ new Set();
  function getLocale() {
    return current;
  }
  function setLocale(locale) {
    var _a2, _b;
    if (!SUPPORTED.includes(locale) || locale === current) return;
    current = locale;
    try {
      (_a2 = globalThis.localStorage) == null ? void 0 : _a2.setItem(STORAGE_KEY, locale);
    } catch {
    }
    listeners.forEach((cb) => {
      try {
        cb(locale);
      } catch (err) {
        console.error(err);
      }
    });
    if (typeof document !== "undefined") {
      (_b = document.documentElement) == null ? void 0 : _b.setAttribute("lang", locale === "zh" ? "zh-TW" : "en");
    }
  }
  function onLocaleChange(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  }
  function t(key, params) {
    const table = messages[current] || messages[DEFAULT_LOCALE];
    let value = table[key];
    if (value === void 0) {
      value = messages[DEFAULT_LOCALE][key];
    }
    if (value === void 0) {
      return key;
    }
    if (params) {
      return String(value).replace(/\{(\w+)\}/g, (m, name) => Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : m);
    }
    return value;
  }
  function pickField(item, base) {
    var _a2, _b, _c, _d;
    if (!item) return "";
    if (current === "en") {
      return (_b = (_a2 = item[base + "En"]) != null ? _a2 : item[base]) != null ? _b : "";
    }
    return (_d = (_c = item[base]) != null ? _c : item[base + "En"]) != null ? _d : "";
  }
  var _a;
  if (typeof document !== "undefined") {
    (_a = document.documentElement) == null ? void 0 : _a.setAttribute("lang", current === "zh" ? "zh-TW" : "en");
  }

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
          ${allExpanded ? t("methods.collapseAll") : t("methods.expandAll")}
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
                  <h3>${pickField(method, "name")}</h3>
                  <span class="method-card-en">${getLocale() === "zh" ? method.nameEn : ""}</span>
                </div>
                <span class="method-card-toggle${expanded ? " rotated" : ""}">\u25B7</span>
              </button>
              <div class="method-card-body">
                <p class="method-description">${pickField(method, "description")}</p>
                <div class="visibility-meter" aria-label="${t("methods.codeVisibility")} ${method.visibility}%">
                  <span class="visibility-label">${t("methods.codeVisibility")}</span>
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
                <div class="method-count-badge">${t("methods.countBadge", { n: method.techniques.length })}</div>
                ${expanded ? `
                  <ul class="technique-list" data-testid="technique-list-${method.id}">
                    ${method.techniques.map((tech, index) => `
                      <li
                        class="technique-item"
                        data-testid="technique-${tech.id}"
                        style="animation-delay: ${index * 0.06}s"
                      >
                        <div class="technique-name">${pickField(tech, "name")}</div>
                        <div class="technique-name-en">${getLocale() === "zh" ? tech.nameEn : ""}</div>
                        <div class="technique-desc">${pickField(tech, "description")}</div>
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

  // src/utils/dataFlow.js
  var KEYWORDS = /* @__PURE__ */ new Set([
    "if",
    "else",
    "while",
    "for",
    "do",
    "switch",
    "case",
    "default",
    "break",
    "continue",
    "return",
    "function",
    "let",
    "const",
    "var",
    "true",
    "false",
    "null",
    "undefined",
    "new",
    "in",
    "of",
    "typeof",
    "instanceof",
    "void",
    "this",
    "try",
    "catch",
    "throw",
    "finally",
    "class",
    "extends",
    "import",
    "from",
    "export",
    "yield",
    "async",
    "await",
    "and",
    "or",
    "not",
    "then",
    "end",
    "do"
  ]);
  var IDENT_RE = /[A-Za-z_][A-Za-z0-9_]*/g;
  function tokensIn(text) {
    const found = [];
    for (const m of text.matchAll(IDENT_RE)) {
      if (!KEYWORDS.has(m[0])) found.push(m[0]);
    }
    return found;
  }
  function stripStringsAndComments(text) {
    return String(text).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/g, " ").replace(/"(?:[^"\\]|\\.)*"/g, ' ""').replace(/'(?:[^'\\]|\\.)*'/g, " ''").replace(/`(?:[^`\\]|\\.)*`/g, " ``");
  }
  function extractDefUse(node) {
    const defs = /* @__PURE__ */ new Set();
    const uses = /* @__PURE__ */ new Set();
    if (!node) return { defs, uses };
    const raw = node.sourceText || node.label || "";
    const text = stripStringsAndComments(raw);
    const fn = text.match(/function\s+[A-Za-z_][\w]*\s*\(([^)]*)\)/) || text.match(/\(([^)]*)\)\s*=>/);
    if (fn) {
      for (const p of fn[1].split(",").map((s) => s.trim()).filter(Boolean)) {
        const name = p.replace(/=.*$/, "").trim();
        if (name && !KEYWORDS.has(name)) defs.add(name);
      }
      for (const u of tokensIn(text.replace(/function\s+[A-Za-z_][\w]*/, ""))) uses.add(u);
      for (const d of defs) uses.delete(d);
      return { defs, uses };
    }
    const forMatch = text.match(/for\s*\(([^;]*);([^;]*);([^)]*)\)/);
    if (forMatch) {
      const [, init, cond, upd] = forMatch;
      collectAssignment(init, defs, uses);
      for (const u of tokensIn(cond)) uses.add(u);
      collectAssignment(upd, defs, uses);
      return { defs, uses };
    }
    const matched = collectAssignment(text, defs, uses);
    if (!matched) {
      for (const u of tokensIn(text)) uses.add(u);
    }
    return { defs, uses };
  }
  function collectAssignment(text, defs, uses) {
    if (!text) return false;
    const incDec = text.match(/^[\s(]*([A-Za-z_][\w]*)\s*(\+\+|--)/);
    if (incDec) {
      defs.add(incDec[1]);
      uses.add(incDec[1]);
      return true;
    }
    const compound = text.match(
      /^[\s(]*([A-Za-z_][\w]*)\s*(?:\+|-|\*|\/|%|&|\||\^|<<|>>|>>>)=(.*)$/
    );
    if (compound) {
      const [, name, rhs] = compound;
      if (!KEYWORDS.has(name)) {
        defs.add(name);
        uses.add(name);
      }
      for (const u of tokensIn(rhs)) uses.add(u);
      return true;
    }
    const assign = text.match(
      /^[\s(]*(?:let\s+|const\s+|var\s+)?([A-Za-z_][\w]*)\s*=(?!=)(.*)$/
    );
    if (assign) {
      const [, name, rhs] = assign;
      if (!KEYWORDS.has(name)) defs.add(name);
      for (const u of tokensIn(rhs)) uses.add(u);
      if (!KEYWORDS.has(name)) uses.delete(name);
      return true;
    }
    return false;
  }
  function buildDataFlowGraph(cfg) {
    var _a2;
    const out = { nodes: (cfg == null ? void 0 : cfg.nodes) || [], edges: [], defUseByNode: /* @__PURE__ */ new Map() };
    if (!((_a2 = cfg == null ? void 0 : cfg.nodes) == null ? void 0 : _a2.length)) return out;
    const preds = new Map(cfg.nodes.map((n) => [n.id, []]));
    for (const e of cfg.edges || []) {
      if (preds.has(e.to)) preds.get(e.to).push(e.from);
    }
    for (const n of cfg.nodes) out.defUseByNode.set(n.id, extractDefUse(n));
    const seenEdges = /* @__PURE__ */ new Set();
    for (const useNode of cfg.nodes) {
      const { uses } = out.defUseByNode.get(useNode.id);
      for (const v of uses) {
        const visited = /* @__PURE__ */ new Set([useNode.id]);
        const stack = [...preds.get(useNode.id)];
        while (stack.length) {
          const cur = stack.pop();
          if (visited.has(cur)) continue;
          visited.add(cur);
          const du = out.defUseByNode.get(cur);
          if (du && du.defs.has(v)) {
            const id = `du-${cur}-${useNode.id}-${v}`;
            if (!seenEdges.has(id)) {
              seenEdges.add(id);
              out.edges.push({ id, from: cur, to: useNode.id, variable: v });
            }
            continue;
          }
          for (const p of preds.get(cur) || []) stack.push(p);
        }
      }
    }
    return out;
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
    if (requirement.type === "all-defs" || requirement.type === "all-uses" || requirement.type === "all-du-paths") {
      return containsNodePath(record.path, requirement.path || requirement.nodes);
    }
    return false;
  }
  function buildDefUseMap(graph) {
    const map = /* @__PURE__ */ new Map();
    graph.nodes.forEach((node) => {
      map.set(node.id, extractDefUse(node));
    });
    return map;
  }
  function enumerateDefClearPaths(graph, defNodeId, useNodeId, variable, defUseMap, maxDepth) {
    const adjacency = buildAdjacency(graph);
    const limit = maxDepth != null ? maxDepth : Math.max(8, graph.nodes.length * 2);
    const results = [];
    function walk(currentId, path, visited) {
      if (path.length > limit) return;
      if (currentId === useNodeId && path.length >= 2) {
        results.push([...path]);
        return;
      }
      const out = adjacency.get(currentId) || [];
      for (const edge of out) {
        const next = edge.to;
        if (visited.has(next)) continue;
        if (next !== useNodeId) {
          const du = defUseMap.get(next);
          if (du && du.defs.has(variable)) continue;
        }
        visited.add(next);
        path.push(next);
        walk(next, path, visited);
        path.pop();
        visited.delete(next);
      }
    }
    walk(defNodeId, [defNodeId], /* @__PURE__ */ new Set([defNodeId]));
    return results;
  }
  function shortestDefClearPath(graph, defNodeId, useNodeId, variable, defUseMap) {
    const adjacency = buildAdjacency(graph);
    const queue = [[defNodeId]];
    const seenStates = /* @__PURE__ */ new Set([defNodeId]);
    while (queue.length) {
      const path = queue.shift();
      const head = path[path.length - 1];
      if (head === useNodeId && path.length >= 2) return path;
      const out = adjacency.get(head) || [];
      for (const edge of out) {
        const next = edge.to;
        if (path.includes(next)) continue;
        if (next !== useNodeId) {
          const du = defUseMap.get(next);
          if (du && du.defs.has(variable)) continue;
        }
        const stateKey = `${path.join(">")}>${next}`;
        if (seenStates.has(stateKey)) continue;
        seenStates.add(stateKey);
        queue.push([...path, next]);
      }
    }
    return null;
  }
  function collectDefUsePairs(graph, defUseMap) {
    const pairs = [];
    graph.nodes.forEach((defNode) => {
      var _a2;
      const defs = (_a2 = defUseMap.get(defNode.id)) == null ? void 0 : _a2.defs;
      if (!defs || defs.size === 0) return;
      defs.forEach((variable) => {
        graph.nodes.forEach((useNode) => {
          var _a3;
          const uses = (_a3 = defUseMap.get(useNode.id)) == null ? void 0 : _a3.uses;
          if (!uses || !uses.has(variable)) return;
          const sample = shortestDefClearPath(graph, defNode.id, useNode.id, variable, defUseMap);
          if (sample) {
            pairs.push({ defNodeId: defNode.id, useNodeId: useNode.id, variable, samplePath: sample });
          }
        });
      });
    });
    return pairs;
  }
  function nodeLabelOf(graph, nodeId) {
    var _a2;
    return ((_a2 = graph.nodes.find((n) => n.id === nodeId)) == null ? void 0 : _a2.label) || nodeId;
  }
  function getAllDefsRequirements(graph) {
    const normalizedGraph = normalizeGraph(graph);
    const defUseMap = buildDefUseMap(normalizedGraph);
    const pairs = collectDefUsePairs(normalizedGraph, defUseMap);
    const byDef = /* @__PURE__ */ new Map();
    pairs.forEach((p) => {
      const key = `${p.defNodeId}|${p.variable}`;
      const existing = byDef.get(key);
      if (!existing || p.samplePath.length < existing.samplePath.length) {
        byDef.set(key, p);
      }
    });
    return Array.from(byDef.values()).map((p, index) => ({
      id: `all-defs-${index + 1}-${p.defNodeId}-${p.variable}`,
      type: "all-defs",
      label: `Def ${nodeLabelOf(normalizedGraph, p.defNodeId)} (${p.variable}) -> use ${nodeLabelOf(normalizedGraph, p.useNodeId)}`,
      displayText: `${p.variable}@${p.defNodeId} -> ${p.useNodeId} : ${p.samplePath.join(" -> ")}`,
      nodes: [...new Set(p.samplePath)],
      edges: edgeIdsFromPath(normalizedGraph, p.samplePath),
      path: p.samplePath,
      variable: p.variable,
      defNodeId: p.defNodeId,
      useNodeId: p.useNodeId
    }));
  }
  function getAllUsesRequirements(graph) {
    const normalizedGraph = normalizeGraph(graph);
    const defUseMap = buildDefUseMap(normalizedGraph);
    const pairs = collectDefUsePairs(normalizedGraph, defUseMap);
    return pairs.map((p, index) => ({
      id: `all-uses-${index + 1}-${p.defNodeId}-${p.useNodeId}-${p.variable}`,
      type: "all-uses",
      label: `Use ${nodeLabelOf(normalizedGraph, p.useNodeId)} of ${p.variable} from ${nodeLabelOf(normalizedGraph, p.defNodeId)}`,
      displayText: `${p.variable}: ${p.defNodeId} -> ${p.useNodeId} : ${p.samplePath.join(" -> ")}`,
      nodes: [...new Set(p.samplePath)],
      edges: edgeIdsFromPath(normalizedGraph, p.samplePath),
      path: p.samplePath,
      variable: p.variable,
      defNodeId: p.defNodeId,
      useNodeId: p.useNodeId
    }));
  }
  function getAllDuPathsRequirements(graph) {
    const normalizedGraph = normalizeGraph(graph);
    const defUseMap = buildDefUseMap(normalizedGraph);
    const pairs = collectDefUsePairs(normalizedGraph, defUseMap);
    const requirements = [];
    pairs.forEach((p) => {
      const allPaths = enumerateDefClearPaths(
        normalizedGraph,
        p.defNodeId,
        p.useNodeId,
        p.variable,
        defUseMap
      );
      allPaths.forEach((path, idx) => {
        requirements.push({
          id: `all-du-paths-${requirements.length + 1}-${p.defNodeId}-${p.useNodeId}-${p.variable}-${idx + 1}`,
          type: "all-du-paths",
          label: `DU-Path ${p.variable}: ${path.join(" -> ")}`,
          displayText: `${p.variable}: ${path.join(" -> ")}`,
          nodes: [...new Set(path)],
          edges: edgeIdsFromPath(normalizedGraph, path),
          path,
          variable: p.variable,
          defNodeId: p.defNodeId,
          useNodeId: p.useNodeId
        });
      });
    });
    return requirements;
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
    var _a2, _b;
    const normalizedGraph = normalizeGraph(graph);
    const adjacency = buildAdjacency(normalizedGraph);
    const nodeVisitLimit = (_a2 = options.nodeVisitLimit) != null ? _a2 : 2;
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
    var _a2;
    const normalizedGraph = normalizeGraph(graph);
    const candidatePaths = generateTestPaths(normalizedGraph, options);
    const optimizationMode = (_a2 = options.optimization) != null ? _a2 : "greedy-set-cover";
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
    if (criterion === "all-defs") {
      return getAllDefsRequirements(graph);
    }
    if (criterion === "all-uses") {
      return getAllUsesRequirements(graph);
    }
    if (criterion === "all-du-paths") {
      return getAllDuPathsRequirements(graph);
    }
    return [];
  }

  // src/utils/programToGraph.js
  function summarizeText(text, maxLength = 28) {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (normalized.length <= maxLength) {
      return normalized;
    }
    return `${normalized.slice(0, maxLength - 1)}\u2026`;
  }
  function stripBlockComments(source) {
    return source.replace(/\/\*[\s\S]*?\*\//g, "");
  }
  function splitJavascriptFragments(text) {
    const fragments = [];
    let remaining = text.trim();
    if (!remaining) {
      return fragments;
    }
    while (remaining.startsWith("} else if") || remaining.startsWith("} else")) {
      fragments.push("}");
      remaining = remaining.replace(/^}\s*/, "");
    }
    const caseMatch = remaining.match(/^(case\s+.+:|default:)(.+)$/);
    if (caseMatch) {
      fragments.push(caseMatch[1].trim());
      if (caseMatch[2].trim()) {
        fragments.push(caseMatch[2].trim());
      }
      return fragments;
    }
    fragments.push(remaining);
    return fragments;
  }
  function normalizeJavascriptLines(source) {
    return stripBlockComments(source).split("\n").flatMap((rawLine, index) => {
      const cleaned = rawLine.replace(/\/\/.*$/g, "").trim();
      if (!cleaned) {
        return [];
      }
      return splitJavascriptFragments(cleaned).map((text) => ({
        text,
        lineNumber: index + 1,
        sourceText: cleaned
      }));
    });
  }
  function normalizePseudocodeLines(source) {
    return stripBlockComments(source).split("\n").map((rawLine, index) => ({
      text: rawLine.replace(/#.*$/g, "").replace(/\/\/.*$/g, "").trim(),
      lineNumber: index + 1,
      sourceText: rawLine.trim()
    })).filter((item) => item.text);
  }
  function extractParenthesizedContent(text) {
    const match = text.match(/^[^(]*\((.*)\)\s*\{?\s*$/);
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
  function createAstNode(type, line, extra = {}) {
    var _a2;
    return {
      type,
      sourceLine: (_a2 = line == null ? void 0 : line.lineNumber) != null ? _a2 : null,
      sourceText: (line == null ? void 0 : line.sourceText) || (line == null ? void 0 : line.text) || "",
      ...extra
    };
  }
  function isJavascriptStop(line, stopWhen) {
    if (!line) {
      return true;
    }
    return stopWhen.some((token) => {
      if (token === "}") {
        return line.text === "}";
      }
      return line.text.startsWith(token);
    });
  }
  function parseJavascriptSingleStatement(state) {
    const line = currentLine(state);
    if (!line) {
      return [];
    }
    if (line.text.startsWith("if")) {
      return [parseJavascriptIf(state)];
    }
    if (line.text.startsWith("while")) {
      return [parseJavascriptLoop(state, "while")];
    }
    if (line.text.startsWith("for")) {
      return [parseJavascriptLoop(state, "for")];
    }
    if (line.text.startsWith("switch")) {
      return [parseJavascriptSwitch(state)];
    }
    if (line.text.startsWith("return")) {
      consumeLine(state);
      return [createAstNode("return", line, { text: line.text.replace(/;$/, "") })];
    }
    if (line.text.startsWith("break")) {
      consumeLine(state);
      return [createAstNode("break", line, { text: line.text.replace(/;$/, "") })];
    }
    if (line.text.startsWith("continue")) {
      consumeLine(state);
      return [createAstNode("continue", line, { text: line.text.replace(/;$/, "") })];
    }
    consumeLine(state);
    return [createAstNode("statement", line, { text: line.text.replace(/;$/, "") })];
  }
  function parseJavascriptIf(state) {
    const line = consumeLine(state);
    const condition = extractParenthesizedContent(line.text) || line.text.replace(/^if\s*/, "").replace(/\{$/, "").trim();
    const consequent = line.text.endsWith("{") ? parseJavascriptStatements(state) : parseJavascriptSingleStatement(state);
    let alternate = [];
    const nextLine = currentLine(state);
    if (nextLine == null ? void 0 : nextLine.text.startsWith("else if")) {
      state.lines[state.index] = { ...nextLine, text: nextLine.text.replace(/^else\s+/, "") };
      alternate = [parseJavascriptIf(state)];
    } else if (nextLine == null ? void 0 : nextLine.text.startsWith("else")) {
      const elseLine = consumeLine(state);
      alternate = elseLine.text.endsWith("{") ? parseJavascriptStatements(state) : parseJavascriptSingleStatement(state);
    }
    return createAstNode("if", line, {
      condition,
      consequent,
      alternate
    });
  }
  function parseJavascriptLoop(state, type) {
    const line = consumeLine(state);
    const condition = extractParenthesizedContent(line.text) || line.text.replace(new RegExp(`^${type}\\s*`), "").replace(/\{$/, "").trim();
    const body = line.text.endsWith("{") ? parseJavascriptStatements(state) : parseJavascriptSingleStatement(state);
    return createAstNode(type, line, {
      condition,
      body
    });
  }
  function parseJavascriptSwitch(state) {
    const line = consumeLine(state);
    const expression = extractParenthesizedContent(line.text) || line.text.replace(/^switch\s*/, "").replace(/\{$/, "").trim();
    const cases = [];
    while (state.index < state.lines.length) {
      const nextLine = currentLine(state);
      if (!nextLine) {
        break;
      }
      if (nextLine.text === "}") {
        consumeLine(state);
        break;
      }
      if (/^(case\s+.+:|default:)$/i.test(nextLine.text)) {
        const caseLine = consumeLine(state);
        const isDefault = caseLine.text.startsWith("default:");
        const label = isDefault ? "default" : caseLine.text.replace(/^case\s+/i, "").replace(/:$/, "").trim();
        const statements = parseJavascriptStatements(state, ["case ", "default:", "}"]);
        cases.push(createAstNode("case", caseLine, {
          label,
          isDefault,
          statements
        }));
        continue;
      }
      consumeLine(state);
    }
    return createAstNode("switch", line, {
      expression,
      cases
    });
  }
  function parseJavascriptStatements(state, stopWhen = ["}"]) {
    const statements = [];
    while (state.index < state.lines.length) {
      const line = currentLine(state);
      if (!line) {
        break;
      }
      if (isJavascriptStop(line, stopWhen)) {
        if (line.text === "}") {
          consumeLine(state);
        }
        break;
      }
      if ((line.text.startsWith("function ") || line.text.startsWith("export function ")) && line.text.endsWith("{")) {
        consumeLine(state);
        statements.push(createAstNode("statement", line, {
          text: line.text.replace(/\{$/, "").trim()
        }));
        statements.push(...parseJavascriptStatements(state));
        continue;
      }
      if (line.text === "{") {
        consumeLine(state);
        statements.push(...parseJavascriptStatements(state));
        continue;
      }
      statements.push(...parseJavascriptSingleStatement(state));
    }
    return statements;
  }
  function isPseudocodeStop(line, stopWhen) {
    if (!line) {
      return true;
    }
    const upper = line.text.toUpperCase();
    return stopWhen.some((token) => upper.startsWith(token));
  }
  function parsePseudocodeIf(state) {
    var _a2;
    const line = consumeLine(state);
    const condition = line.text.replace(/^IF\s*/i, "").replace(/\s*THEN$/i, "").trim();
    const consequent = parsePseudocodeStatements(state, ["ELSE", "ELSE IF", "END IF", "ENDIF", "END"]);
    let alternate = [];
    const nextLine = currentLine(state);
    if (/^ELSE IF\b/i.test((nextLine == null ? void 0 : nextLine.text) || "")) {
      state.lines[state.index] = { ...nextLine, text: nextLine.text.replace(/^ELSE\s+/i, "") };
      alternate = [parsePseudocodeIf(state)];
    } else if (/^ELSE\b/i.test((nextLine == null ? void 0 : nextLine.text) || "")) {
      consumeLine(state);
      alternate = parsePseudocodeStatements(state, ["END IF", "ENDIF", "END"]);
    }
    if (/^(END IF|ENDIF|END)$/i.test(((_a2 = currentLine(state)) == null ? void 0 : _a2.text) || "")) {
      consumeLine(state);
    }
    return createAstNode("if", line, {
      condition,
      consequent,
      alternate
    });
  }
  function parsePseudocodeLoop(state) {
    var _a2;
    const line = consumeLine(state);
    const condition = line.text.replace(/^(WHILE|FOR)\s*/i, "").replace(/\s*DO$/i, "").trim();
    const body = parsePseudocodeStatements(state, ["END WHILE", "END FOR", "END"]);
    if (/^(END WHILE|END FOR|END)$/i.test(((_a2 = currentLine(state)) == null ? void 0 : _a2.text) || "")) {
      consumeLine(state);
    }
    return createAstNode(/^WHILE\b/i.test(line.text) ? "while" : "for", line, {
      condition,
      body
    });
  }
  function parsePseudocodeStatements(state, stopWhen = []) {
    const statements = [];
    while (state.index < state.lines.length) {
      const line = currentLine(state);
      if (!line || isPseudocodeStop(line, stopWhen)) {
        break;
      }
      if (/^FUNCTION\b/i.test(line.text)) {
        consumeLine(state);
        continue;
      }
      if (/^IF\b/i.test(line.text)) {
        statements.push(parsePseudocodeIf(state));
        continue;
      }
      if (/^(WHILE|FOR)\b/i.test(line.text)) {
        statements.push(parsePseudocodeLoop(state));
        continue;
      }
      if (/^RETURN\b/i.test(line.text)) {
        statements.push(createAstNode("return", consumeLine(state), { text: line.text }));
        continue;
      }
      if (/^BREAK\b/i.test(line.text)) {
        statements.push(createAstNode("break", consumeLine(state), { text: line.text }));
        continue;
      }
      if (/^CONTINUE\b/i.test(line.text)) {
        statements.push(createAstNode("continue", consumeLine(state), { text: line.text }));
        continue;
      }
      statements.push(createAstNode("statement", consumeLine(state), { text: line.text }));
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
  function createGraphBuilder() {
    return {
      sequence: 0,
      edgeSequence: 0,
      nodes: [{ id: "S", label: "Start", kind: "start" }],
      edges: [],
      terminalNodes: /* @__PURE__ */ new Set()
    };
  }
  function addNode(builder, label, kind = "node", source = null) {
    builder.sequence += 1;
    const id = `N${builder.sequence}`;
    const node = { id, label: summarizeText(label), kind };
    if (source == null ? void 0 : source.sourceLine) {
      node.sourceLine = source.sourceLine;
      node.sourceText = source.sourceText || "";
    }
    builder.nodes.push(node);
    return id;
  }
  function addEdge(builder, from, to) {
    builder.edgeSequence += 1;
    builder.edges.push({
      id: `E${builder.edgeSequence}`,
      from,
      to
    });
  }
  function buildSequence(builder, statements) {
    let entry = null;
    let normalExits = [];
    let breakExits = [];
    let continueExits = [];
    statements.forEach((statement) => {
      const built = buildStatement(builder, statement);
      if (!entry) {
        entry = built.entry;
      }
      normalExits.forEach((exitId) => {
        addEdge(builder, exitId, built.entry);
      });
      normalExits = [...built.normalExits];
      breakExits = [...breakExits, ...built.breakExits];
      continueExits = [...continueExits, ...built.continueExits];
    });
    return {
      entry,
      normalExits,
      breakExits,
      continueExits
    };
  }
  function buildIfStatement(builder, statement) {
    const decisionId = addNode(builder, `${statement.condition}?`, "decision", statement);
    const consequent = buildSequence(builder, statement.consequent || []);
    const alternate = buildSequence(builder, statement.alternate || []);
    const needsMerge = !alternate.entry || consequent.normalExits.length > 0 || alternate.normalExits.length > 0;
    const mergeId = needsMerge ? addNode(builder, "Merge") : null;
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
    consequent.normalExits.forEach((exitId) => {
      if (mergeId) {
        addEdge(builder, exitId, mergeId);
      }
    });
    alternate.normalExits.forEach((exitId) => {
      if (mergeId) {
        addEdge(builder, exitId, mergeId);
      }
    });
    return {
      entry: decisionId,
      normalExits: mergeId ? [mergeId] : [],
      breakExits: [...consequent.breakExits, ...alternate.breakExits],
      continueExits: [...consequent.continueExits, ...alternate.continueExits]
    };
  }
  function buildLoopStatement(builder, statement) {
    const decisionId = addNode(builder, `${statement.condition}?`, "decision", statement);
    const body = buildSequence(builder, statement.body || []);
    const mergeId = addNode(builder, "Loop Exit");
    addEdge(builder, decisionId, mergeId);
    if (body.entry) {
      addEdge(builder, decisionId, body.entry);
      body.normalExits.forEach((exitId) => {
        addEdge(builder, exitId, decisionId);
      });
      body.continueExits.forEach((exitId) => {
        addEdge(builder, exitId, decisionId);
      });
    }
    body.breakExits.forEach((exitId) => {
      addEdge(builder, exitId, mergeId);
    });
    return {
      entry: decisionId,
      normalExits: [mergeId],
      breakExits: [],
      continueExits: []
    };
  }
  function buildSwitchStatement(builder, statement) {
    const decisionId = addNode(builder, `switch ${statement.expression}`, "decision", statement);
    const mergeId = addNode(builder, "Switch Exit");
    const continueExits = [];
    if (!statement.cases.length) {
      addEdge(builder, decisionId, mergeId);
    }
    statement.cases.forEach((switchCase) => {
      const caseId = addNode(
        builder,
        switchCase.isDefault ? "default" : `case ${switchCase.label}`,
        "node",
        switchCase
      );
      const built = buildSequence(builder, switchCase.statements || []);
      addEdge(builder, decisionId, caseId);
      if (built.entry) {
        addEdge(builder, caseId, built.entry);
      } else {
        addEdge(builder, caseId, mergeId);
      }
      built.normalExits.forEach((exitId) => {
        addEdge(builder, exitId, mergeId);
      });
      built.breakExits.forEach((exitId) => {
        addEdge(builder, exitId, mergeId);
      });
      continueExits.push(...built.continueExits);
    });
    return {
      entry: decisionId,
      normalExits: [mergeId],
      breakExits: [],
      continueExits
    };
  }
  function buildStatement(builder, statement) {
    if (statement.type === "if") {
      return buildIfStatement(builder, statement);
    }
    if (statement.type === "while" || statement.type === "for") {
      return buildLoopStatement(builder, statement);
    }
    if (statement.type === "switch") {
      return buildSwitchStatement(builder, statement);
    }
    if (statement.type === "return") {
      const returnId = addNode(builder, statement.text, "node", statement);
      builder.terminalNodes.add(returnId);
      return {
        entry: returnId,
        normalExits: [],
        breakExits: [],
        continueExits: []
      };
    }
    if (statement.type === "break") {
      const breakId = addNode(builder, statement.text, "node", statement);
      return {
        entry: breakId,
        normalExits: [],
        breakExits: [breakId],
        continueExits: []
      };
    }
    if (statement.type === "continue") {
      const continueId = addNode(builder, statement.text, "node", statement);
      return {
        entry: continueId,
        normalExits: [],
        breakExits: [],
        continueExits: [continueId]
      };
    }
    const statementId = addNode(builder, statement.text, "node", statement);
    return {
      entry: statementId,
      normalExits: [statementId],
      breakExits: [],
      continueExits: []
    };
  }
  function computeDepths(nodes, edges) {
    const adjacency = new Map(nodes.map((node) => [node.id, []]));
    const depths = /* @__PURE__ */ new Map([["S", 0]]);
    const queue = ["S"];
    edges.forEach((edge) => {
      var _a2;
      (_a2 = adjacency.get(edge.from)) == null ? void 0 : _a2.push(edge.to);
    });
    while (queue.length) {
      const current2 = queue.shift();
      const currentDepth = depths.get(current2) || 0;
      (adjacency.get(current2) || []).forEach((next) => {
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
    const incoming = new Map(nodes.map((n) => [n.id, []]));
    const outgoing = new Map(nodes.map((n) => [n.id, []]));
    edges.forEach((e) => {
      if (incoming.has(e.to)) incoming.get(e.to).push(e.from);
      if (outgoing.has(e.from)) outgoing.get(e.from).push(e.to);
    });
    const layers = /* @__PURE__ */ new Map();
    nodes.forEach((node) => {
      var _a2;
      const depth = (_a2 = depths.get(node.id)) != null ? _a2 : 0;
      if (!layers.has(depth)) layers.set(depth, []);
      layers.get(depth).push(node);
    });
    const NODE_SPACING_X = 170;
    const LAYER_SPACING_Y = 130;
    const MARGIN_X = 110;
    const MARGIN_Y = 90;
    const sortedDepths = [...layers.keys()].sort((a, b) => a - b);
    const placed = /* @__PURE__ */ new Map();
    for (const depth of sortedDepths) {
      const layer = layers.get(depth);
      layer.forEach((node) => {
        node.y = MARGIN_Y + depth * LAYER_SPACING_Y;
      });
      layer.forEach((node, idx) => {
        const preds = (incoming.get(node.id) || []).filter((p) => placed.has(p));
        if (preds.length > 0) {
          const avg = preds.reduce((sum, p) => sum + placed.get(p), 0) / preds.length;
          node.x = avg;
        } else {
          node.x = MARGIN_X + idx * NODE_SPACING_X;
        }
      });
      spreadLayer(layer, NODE_SPACING_X);
      layer.forEach((node) => {
        placed.set(node.id, node.x);
      });
    }
    const SWEEPS = 4;
    for (let s = 0; s < SWEEPS; s++) {
      for (const depth of sortedDepths) {
        const layer = layers.get(depth);
        layer.forEach((node) => {
          const preds = (incoming.get(node.id) || []).map((p) => placed.get(p)).filter((v) => v !== void 0);
          if (preds.length > 0) node.x = preds.reduce((a, b) => a + b, 0) / preds.length;
        });
        layer.sort((a, b) => a.x - b.x);
        spreadLayer(layer, NODE_SPACING_X);
        layer.forEach((node) => {
          placed.set(node.id, node.x);
        });
      }
      for (let i = sortedDepths.length - 1; i >= 0; i--) {
        const layer = layers.get(sortedDepths[i]);
        layer.forEach((node) => {
          const succ = (outgoing.get(node.id) || []).map((q) => placed.get(q)).filter((v) => v !== void 0);
          if (succ.length > 0) node.x = succ.reduce((a, b) => a + b, 0) / succ.length;
        });
        layer.sort((a, b) => a.x - b.x);
        spreadLayer(layer, NODE_SPACING_X);
        layer.forEach((node) => {
          placed.set(node.id, node.x);
        });
      }
    }
    const minX = Math.min(...nodes.map((n) => n.x));
    const shift = MARGIN_X - minX;
    nodes.forEach((n) => {
      n.x = Math.round(n.x + shift);
    });
    const coordinates = new Map(nodes.map((node) => [node.id, node]));
    const fanOutCounters = /* @__PURE__ */ new Map();
    const allXs = nodes.map((n) => n.x);
    const layoutMinX = Math.min(...allXs);
    const layoutMaxX = Math.max(...allXs);
    const layoutMidX = (layoutMinX + layoutMaxX) / 2;
    const backEdges = edges.filter((e) => {
      const a = coordinates.get(e.from);
      const b = coordinates.get(e.to);
      return a && b && b.y <= a.y;
    });
    const backEdgeOrder = /* @__PURE__ */ new Map();
    const left = [];
    const right = [];
    backEdges.forEach((e) => {
      const a = coordinates.get(e.from);
      const b = coordinates.get(e.to);
      if (Math.max(a.x, b.x) < layoutMidX) left.push(e);
      else right.push(e);
    });
    const sortBySpan = (list) => list.slice().sort((p, q) => {
      const ap = coordinates.get(p.from);
      const aq = coordinates.get(q.from);
      const bp = coordinates.get(p.to);
      const bq = coordinates.get(q.to);
      return Math.abs(ap.y - bp.y) - Math.abs(aq.y - bq.y);
    });
    sortBySpan(left).forEach((e, idx) => backEdgeOrder.set(e, { side: -1, idx }));
    sortBySpan(right).forEach((e, idx) => backEdgeOrder.set(e, { side: 1, idx }));
    edges.forEach((edge) => {
      const fromNode = coordinates.get(edge.from);
      const toNode = coordinates.get(edge.to);
      if (!fromNode || !toNode) return;
      const sibs = outgoing.get(edge.from) || [];
      const sibCount = sibs.length;
      const fanIdx = fanOutCounters.get(edge.from) || 0;
      fanOutCounters.set(edge.from, fanIdx + 1);
      const fan = sibCount > 1 ? fanIdx - (sibCount - 1) / 2 : 0;
      const FAN_STEP = 28;
      if (toNode.y <= fromNode.y) {
        const meta = backEdgeOrder.get(edge) || { side: 1, idx: 0 };
        const baseAnchor = meta.side > 0 ? Math.max(fromNode.x, toNode.x) : Math.min(fromNode.x, toNode.x);
        const offset = Math.max(120, Math.abs(toNode.y - fromNode.y) / 2 + 80) + meta.idx * 60;
        let controlX = baseAnchor + meta.side * (offset + fan * FAN_STEP);
        const NODE_CLEAR = 32 + 18;
        const yLo = Math.min(fromNode.y, toNode.y);
        const yHi = Math.max(fromNode.y, toNode.y);
        const blockers = nodes.filter((n) => n.id !== edge.from && n.id !== edge.to && n.y >= yLo - 1 && n.y <= yHi + 1);
        if (blockers.length) {
          if (meta.side > 0) {
            const limitX = Math.max(...blockers.map((n) => n.x + NODE_CLEAR));
            const requiredCx = 2 * limitX - (fromNode.x + toNode.x) / 2;
            if (controlX < requiredCx) controlX = requiredCx + 24;
          } else {
            const limitX = Math.min(...blockers.map((n) => n.x - NODE_CLEAR));
            const requiredCx = 2 * limitX - (fromNode.x + toNode.x) / 2;
            if (controlX > requiredCx) controlX = requiredCx - 24;
          }
        }
        edge.control = {
          x: controlX,
          y: (fromNode.y + toNode.y) / 2
        };
      } else if (toNode.y - fromNode.y > LAYER_SPACING_Y * 1.5) {
        edge.control = {
          x: (fromNode.x + toNode.x) / 2 + 80 + fan * FAN_STEP,
          y: (fromNode.y + toNode.y) / 2
        };
      } else if (sibCount > 1 || Math.abs(toNode.x - fromNode.x) > NODE_SPACING_X * 1.2) {
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = fromNode.y + (toNode.y - fromNode.y) * 0.35;
        edge.control = {
          x: midX + fan * FAN_STEP,
          y: midY
        };
      }
    });
  }
  function spreadLayer(layer, spacing) {
    for (let i = 1; i < layer.length; i++) {
      const minX = layer[i - 1].x + spacing;
      if (layer[i].x < minX) layer[i].x = minX;
    }
    for (let i = layer.length - 2; i >= 0; i--) {
      const maxX = layer[i + 1].x - spacing;
      if (layer[i].x > maxX) layer[i].x = maxX;
    }
  }
  function generateControlFlowGraphFromProgram({ sourceCode, language, title }) {
    const statements = parseStructuredProgram(sourceCode, language);
    const builder = createGraphBuilder();
    const built = buildSequence(builder, statements);
    builder.nodes.push({ id: "T", label: "End", kind: "end" });
    if (built.entry) {
      addEdge(builder, "S", built.entry);
    } else {
      addEdge(builder, "S", "T");
    }
    built.normalExits.forEach((exitId) => {
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
      var _a2, _b;
      if (((_a2 = edge.control) == null ? void 0 : _a2.x) !== void 0 && ((_b = edge.control) == null ? void 0 : _b.y) !== void 0) {
        return `${edge.id},${edge.from},${edge.to},${edge.control.x},${edge.control.y}`;
      }
      return `${edge.id},${edge.from},${edge.to}`;
    }).join("\n");
  }
  function parseNodesText(nodesText) {
    const rows = nodesText.split("\n").map((item) => item.trim()).filter(Boolean);
    if (!rows.length) {
      throw new Error(t("graph.err.nodesEmpty"));
    }
    return rows.map((row, index) => {
      const [id, label, x, y] = row.split(",").map((item) => item.trim());
      if (!id || !label || x === void 0 || y === void 0) {
        throw new Error(t("graph.err.nodeFmt", { line: index + 1 }));
      }
      const parsedX = Number(x);
      const parsedY = Number(y);
      if (!Number.isFinite(parsedX) || !Number.isFinite(parsedY)) {
        throw new Error(t("graph.err.nodeCoord", { line: index + 1 }));
      }
      return { id, label, x: parsedX, y: parsedY, kind: "node" };
    });
  }
  function parseEdgesText(edgesText, nodeIds) {
    const rows = edgesText.split("\n").map((item) => item.trim()).filter(Boolean);
    if (!rows.length) {
      throw new Error(t("graph.err.edgesEmpty"));
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
        throw new Error(t("graph.err.edgeFmt", { line: index + 1 }));
      }
      if (!from || !to) {
        throw new Error(t("graph.err.edgeMissing", { line: index + 1 }));
      }
      if (!nodeIds.has(from) || !nodeIds.has(to)) {
        throw new Error(t("graph.err.edgeNode", { line: index + 1, from, to }));
      }
      if (controlX !== void 0 && controlY !== void 0) {
        const cx = Number(controlX);
        const cy = Number(controlY);
        if (!Number.isFinite(cx) || !Number.isFinite(cy)) {
          throw new Error(t("graph.err.edgeCtl", { line: index + 1 }));
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
      throw new Error(t("graph.err.startMissing"));
    }
    if (!nodeIds.has(endNodeId)) {
      throw new Error(t("graph.err.endMissing"));
    }
    return {
      id: "custom-graph",
      title: t("graph.customTitle"),
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
      throw new Error(t("graph.err.notJson"));
    }
    const graphPayload = payload.graph || payload;
    if (!graphPayload || !Array.isArray(graphPayload.nodes) || !Array.isArray(graphPayload.edges)) {
      throw new Error(t("graph.err.jsonShape"));
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
      reader.onerror = () => reject(new Error(t("graph.err.readFile")));
      reader.readAsText(file);
    });
  }
  function getSelectedSourceNodes(graph, requirement) {
    if (!requirement) {
      return [];
    }
    return requirement.nodes.map((nodeId) => graph.nodes.find((node) => node.id === nodeId)).filter((node) => node == null ? void 0 : node.sourceLine).filter((node, index, nodes) => nodes.findIndex((item) => item.id === node.id) === index);
  }
  function renderSourceCode(sourceCode, selectedSourceNodes) {
    if (!sourceCode) {
      return `<p class="graph-source-empty" data-testid="program-source-empty">${t("graph.source.empty")}</p>`;
    }
    const highlightedLines = new Set(selectedSourceNodes.map((node) => node.sourceLine));
    return `
    <pre class="graph-source-code" data-testid="program-source-code"><code>
      ${sourceCode.split("\n").map((line, index) => `
        <span class="graph-source-line${highlightedLines.has(index + 1) ? " graph-source-line--active" : ""}" data-testid="program-source-line-${index + 1}">
          <span class="graph-source-line-number">${index + 1}</span>
          <span class="graph-source-line-text">${escapeHtml(line) || "&nbsp;"}</span>
        </span>
      `).join("")}
    </code></pre>
  `;
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
    throw new Error(t("graph.err.noSource"));
  }
  function trimToCircle(from, to, radius) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    return {
      x: to.x - dx / len * radius,
      y: to.y - dy / len * radius
    };
  }
  function computeGraphBounds(graph, edgeList = graph.edges, padding = 60) {
    const xs = [];
    const ys = [];
    for (const node of graph.nodes) {
      xs.push(node.x - 32, node.x + 32);
      ys.push(node.y - 32, node.y + 32);
    }
    for (const edge of edgeList) {
      if (edge == null ? void 0 : edge.control) {
        xs.push(edge.control.x);
        ys.push(edge.control.y);
      }
    }
    if (xs.length === 0) return { minX: 0, minY: 0, width: 920, height: 340 };
    const minX = Math.min(...xs) - padding;
    const minY = Math.min(...ys) - padding;
    const maxX = Math.max(...xs) + padding;
    const maxY = Math.max(...ys) + padding;
    return {
      minX,
      minY,
      width: Math.max(920, maxX - minX),
      height: Math.max(340, maxY - minY)
    };
  }
  function createGraphCanvas(graph, requirement) {
    const highlightedNodes = new Set((requirement == null ? void 0 : requirement.nodes) || []);
    const highlightedEdges = new Set((requirement == null ? void 0 : requirement.edges) || []);
    const { minX, minY, width, height } = computeGraphBounds(graph);
    return `
    <div class="graph-canvas" data-testid="graph-canvas">
      <svg viewBox="${minX} ${minY} ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${t("graph.aria.canvas")}">
        <defs>
          <marker id="arrow-default" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 z" fill="#9aa8b6"></path>
          </marker>
          <marker id="arrow-active" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 z" fill="#ea580c"></path>
          </marker>
        </defs>
        ${graph.edges.map((edge) => {
      const fromNode = graph.nodes.find((node) => node.id === edge.from);
      const toNode = graph.nodes.find((node) => node.id === edge.to);
      const active = highlightedEdges.has(edge.id);
      const NODE_R = 28;
      const ARROW_GAP = 4;
      if (edge.control) {
        const end2 = trimToCircle(edge.control, toNode, NODE_R + ARROW_GAP);
        const start2 = trimToCircle(edge.control, fromNode, NODE_R);
        return `
              <path
                class="graph-edge${active ? " graph-edge--active" : ""}"
                d="M ${start2.x} ${start2.y} Q ${edge.control.x} ${edge.control.y} ${end2.x} ${end2.y}"
                marker-end="url(#${active ? "arrow-active" : "arrow-default"})"
                data-testid="graph-edge-${edge.id}"
              ></path>
            `;
      }
      const end = trimToCircle(fromNode, toNode, NODE_R + ARROW_GAP);
      const start = trimToCircle(toNode, fromNode, NODE_R);
      return `
            <line
              class="graph-edge${active ? " graph-edge--active" : ""}"
              x1="${start.x}"
              y1="${start.y}"
              x2="${end.x}"
              y2="${end.y}"
              marker-end="url(#${active ? "arrow-active" : "arrow-default"})"
              data-testid="graph-edge-${edge.id}"
            ></line>
          `;
    }).join("")}
        ${graph.nodes.map((node) => `
          <g class="graph-node${highlightedNodes.has(node.id) ? " graph-node--active" : ""}" data-testid="graph-node-${node.id}">
            ${node.sourceLine ? `<title>Line ${node.sourceLine}: ${escapeHtml(node.sourceText || node.label)}</title>` : ""}
            <circle cx="${node.x}" cy="${node.y}" r="28"></circle>
            <text x="${node.x}" y="${node.y + 5}" text-anchor="middle">${node.label}</text>
          </g>
        `).join("")}
      </svg>
    </div>
  `;
  }
  function createDataFlowCanvas(graph) {
    const dfg = buildDataFlowGraph(graph);
    const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
    const { minX, minY, width, height } = computeGraphBounds(graph, dfg.edges);
    const grouped = /* @__PURE__ */ new Map();
    for (const e of dfg.edges) {
      const key = `${e.from}->${e.to}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(e);
    }
    const edgeMarkup = [...grouped.entries()].map(([key, group]) => {
      const sample = group[0];
      const a = nodeById.get(sample.from);
      const b = nodeById.get(sample.to);
      if (!a || !b) return "";
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const sign = a.y <= b.y ? -1 : 1;
      const offset = 28 + group.length * 6;
      const cx = (a.x + b.x) / 2 + -dy / len * offset * sign;
      const cy = (a.y + b.y) / 2 + dx / len * offset * sign;
      const labels = group.map((e) => e.variable).join(", ");
      const DFG_R = 24;
      const ARROW_GAP = 4;
      const start = trimToCircle({ x: cx, y: cy }, a, DFG_R);
      const end = trimToCircle({ x: cx, y: cy }, b, DFG_R + ARROW_GAP);
      return `
      <g class="graph-dfg-edge" data-testid="dfg-edge-${escapeHtml(key)}">
        <path d="M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}"
              marker-end="url(#dfg-arrow)"></path>
        <text x="${cx}" y="${cy}" text-anchor="middle">${escapeHtml(labels)}</text>
      </g>
    `;
    }).join("");
    const empty = dfg.edges.length === 0 ? `<p class="graph-dfg-empty" data-testid="graph-dfg-empty">${t("graph.dfg.empty")}</p>` : "";
    return `
    <div class="graph-dfg-card" data-testid="graph-dfg-card">
      <div class="graph-dfg-header">
        <h4>${t("graph.dfg.title")}</h4>
        <p>${t("graph.dfg.help")}</p>
      </div>
      <div class="graph-canvas graph-dfg-canvas" data-testid="graph-dfg-canvas">
        <svg viewBox="${minX} ${minY} ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${t("graph.dfg.aria")}">
          <defs>
            <marker id="dfg-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 z" fill="#0ea5e9"></path>
            </marker>
          </defs>
          ${edgeMarkup}
          ${graph.nodes.map((node) => `
            <g class="graph-node graph-dfg-node" data-testid="dfg-node-${node.id}">
              <circle cx="${node.x}" cy="${node.y}" r="24"></circle>
              <text x="${node.x}" y="${node.y + 5}" text-anchor="middle">${node.label}</text>
            </g>
          `).join("")}
        </svg>
      </div>
      ${empty}
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
    let sourceStatus = t("graph.status.initial");
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
          sourceStatus = t("graph.status.recomputed", { name: activeProgram.name });
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
      sourceStatus = t("graph.status.reset", { name: activeProgram.name });
      selectedRequirementId = null;
      render();
    }
    function getState() {
      var _a2;
      const requirements = getCoverageRequirements(graph, criterionId);
      if (!requirements.some((item) => item.id === selectedRequirementId)) {
        selectedRequirementId = ((_a2 = requirements[0]) == null ? void 0 : _a2.id) || null;
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
      const selectedSourceNodes = getSelectedSourceNodes(graph, selectedRequirement);
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
          <div class="graph-upload-field">
            <span>Upload JSON Graph Spec</span>
            <button type="button" class="graph-upload-btn" data-testid="graph-upload-btn">${t("common.chooseFile")}</button>
            <input type="file" accept="application/json,.json" data-testid="graph-upload-input" class="sr-only" />
          </div>
          <label>
            Code Language
            <select data-testid="program-language-select">
              ${graphCoverageCodeLanguages.map((language) => `
                <option value="${language.id}"${selectedCodeLanguage === language.id ? " selected" : ""}>${language.label}</option>
              `).join("")}
            </select>
          </label>
          <div class="graph-upload-field">
            <span>Upload Source Code</span>
            <button type="button" class="graph-upload-btn" data-testid="code-upload-btn">${t("common.chooseFile")}</button>
            <input type="file" accept=".js,.txt,.code,.pseudo" data-testid="code-upload-input" class="sr-only" />
          </div>
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
            <p>${t("graph.uploadFormatHelp")}</p>
          </div>
        </div>
        ${renderSourceCode(activeProgram.sourceCode, selectedSourceNodes)}
      </div>

      <div class="graph-editor-card" data-testid="graph-editor-card">
        <div class="graph-editor-header">
          <h4>Graph Editor</h4>
          <p>${t("graph.editor.help")}</p>
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
          <button type="button" class="graph-editor-reset" data-testid="graph-reset-btn">${t("graph.editor.reset")}</button>
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
          ${parseError || t("graph.editor.synced")}
        </p>
      </div>

      <div class="graph-coverage-header">
        <div>
          <p class="graph-coverage-kicker">White Box Testing</p>
          <h3>${pickField(graph, "title")}</h3>
          <p class="graph-coverage-desc">${t("graph.headerDesc")}</p>
        </div>
        <div class="graph-coverage-stats">
          <div class="graph-stat-card"><span class="graph-stat-label">Nodes</span><strong>${graph.nodes.length}</strong></div>
          <div class="graph-stat-card"><span class="graph-stat-label">Edges</span><strong>${graph.edges.length}</strong></div>
          <div class="graph-stat-card"><span class="graph-stat-label">Requirements</span><strong>${requirements.length}</strong></div>
        </div>
      </div>

      <div class="graph-criterion-switcher" role="tablist" aria-label="${t("graph.aria.switcher")}">
        ${graphCoverageCriteria.map((criterion) => `
          <button
            class="criterion-chip${criterionId === criterion.id ? " active" : ""}"
            type="button"
            data-testid="criterion-${criterion.id}"
            data-criterion="${criterion.id}"
            role="tab"
            aria-selected="${criterionId === criterion.id}"
          >
            <span>${pickField(criterion, "label")}</span>
            <small>${criterion.label}</small>
          </button>
        `).join("")}
      </div>

      <div class="graph-coverage-layout">
        <div class="graph-main-panel">
          ${createGraphCanvas(graph, selectedRequirement)}
          ${createDataFlowCanvas(graph)}
          <div class="graph-selected-summary" data-testid="selected-requirement-summary">
            <span class="summary-label">${t("graph.summary.current")}</span>
            <strong>${(selectedRequirement == null ? void 0 : selectedRequirement.label) || t("common.none")}</strong>
            <p>${selectedCriterion ? pickField(selectedCriterion, "description") : ""}</p>
          </div>

          <div class="graph-test-path-card" data-testid="graph-test-path-card">
            <h4>Generated Test Path Set</h4>
            <p class="sidebar-text">${t("graph.path.help")}</p>
            <div class="test-path-metrics" data-testid="test-path-metrics">
              <div class="test-path-metric">
                <span class="detail-label">${t("graph.path.before")}</span>
                <strong data-testid="baseline-path-count">${pathPlan.optimizationMetrics.baselinePathCount}</strong>
              </div>
              <div class="test-path-metric">
                <span class="detail-label">${t("graph.path.after")}</span>
                <strong data-testid="optimized-path-count">${pathPlan.optimizationMetrics.optimizedPathCount}</strong>
              </div>
              <div class="test-path-metric test-path-metric--accent">
                <span class="detail-label">${t("graph.path.saved")}</span>
                <strong data-testid="saved-path-count">${pathPlan.optimizationMetrics.savedPathCount}</strong>
              </div>
            </div>
            <ul class="test-path-list" data-testid="test-path-list">
              ${pathPlan.selectedPaths.map((path, index) => `
                <li data-testid="test-path-${index + 1}">T${index + 1}: ${path.join(" -> ")}</li>
              `).join("") || `<li>${t("graph.path.none")}</li>`}
            </ul>
            <p class="test-path-meta" data-testid="test-path-meta">
              Covered Requirements: ${pathPlan.requirementPaths.filter((item) => item.covered).length} / ${pathPlan.requirementPaths.length}
            </p>
            ${pathPlan.uncoveredRequirements.length ? `<p class="graph-editor-status graph-editor-status--error">${t("graph.path.uncovered", { items: pathPlan.uncoveredRequirements.map((item) => item.displayText).join("\u3001") })}</p>` : `<p class="graph-editor-status">${t("graph.path.allCovered")}</p>`}
          </div>
        </div>

        <aside class="graph-sidebar">
          <div class="graph-sidebar-card">
            <h4>Test Requirements</h4>
            <p class="sidebar-text">${t("graph.req.help")}</p>
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
                <p data-testid="detail-nodes">${(selectedRequirement == null ? void 0 : selectedRequirement.nodes.join(" -> ")) || t("common.none")}</p>
              </div>
              <div>
                <span class="detail-label">Edges</span>
                <p data-testid="detail-edges">${(selectedRequirement == null ? void 0 : selectedRequirement.edges.join(", ")) || t("common.none")}</p>
              </div>
              <div>
                <span class="detail-label">Criterion</span>
                <p>${selectedCriterion ? pickField(selectedCriterion, "label") : ""}</p>
              </div>
              <div>
                <span class="detail-label">Source Mapping</span>
                <ul class="source-mapping-list" data-testid="detail-source-mapping">
                  ${selectedSourceNodes.length ? selectedSourceNodes.map((node) => `<li>${node.label} -> L${node.sourceLine}: ${escapeHtml(node.sourceText || "")}</li>`).join("") : `<li>${t("graph.detail.noSourceMap")}</li>`}
                </ul>
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
          loadGraphSource(defaultProgram, defaultGraph, t("graph.status.defaultLoaded"));
          return;
        }
        if (nextProgramId === "uploaded-spec") {
          selectedProgramId = nextProgramId;
          sourceStatus = t("graph.status.pickJson");
          render();
          return;
        }
        if (nextProgramId === "uploaded-code") {
          selectedProgramId = nextProgramId;
          sourceStatus = t("graph.status.pickCode");
          render();
          return;
        }
        const example = graphCoverageProgramExamples.find((item) => item.id === nextProgramId);
        if (example) {
          const nextGraph = resolveProgramGraph(example);
          selectedCodeLanguage = example.language || selectedCodeLanguage;
          loadGraphSource(example, nextGraph, t("graph.status.exampleLoaded", { name: example.name }));
        }
      });
      root2.querySelector('[data-testid="program-language-select"]').addEventListener("change", (event) => {
        selectedCodeLanguage = event.target.value;
      });
      root2.querySelector('[data-testid="graph-upload-btn"]').addEventListener("click", () => {
        root2.querySelector('[data-testid="graph-upload-input"]').click();
      });
      root2.querySelector('[data-testid="code-upload-btn"]').addEventListener("click", () => {
        root2.querySelector('[data-testid="code-upload-input"]').click();
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
            t("graph.status.uploadLoaded", { name: file.name })
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
          selectedProgramId = "uploaded-code";
          loadGraphSource(uploadedProgram, generatedGraph, t("graph.status.codeGenerated", { name: file.name }));
        } catch (error) {
          parseError = error.message;
          sourceStatus = t("graph.status.codeFailed");
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
    if (typeof globalThis.addEventListener === "function") {
      globalThis.addEventListener("stvisual:load-program-source", (event) => {
        var _a2;
        if (!root2.isConnected) return;
        const detail = event.detail || {};
        if (detail.target !== "graph") return;
        const content = String((_a2 = detail.content) != null ? _a2 : "");
        const fileName = detail.name || "uploaded.code";
        try {
          const uploadedProgram = {
            id: "uploaded-code",
            name: fileName.replace(/\.[^.]+$/, "") || "Uploaded Code",
            description: `Uploaded ${selectedCodeLanguage} source from cloud, converted into a simplified control flow graph.`,
            sourceCode: content,
            language: selectedCodeLanguage
          };
          const generatedGraph = resolveProgramGraph(uploadedProgram);
          loadGraphSource(uploadedProgram, generatedGraph, t("graph.status.codeGenerated", { name: fileName }));
        } catch (error) {
          parseError = error.message;
          sourceStatus = t("graph.status.codeFailed");
          render();
        }
      });
    }
    return root2;
  }

  // src/utils/logicCoverage.js
  var L = (en, zh) => getLocale() === "en" ? en : zh;
  var TOKEN_REGEX = /\s*(?:(\()|(\))|(&&)|(\|\|)|(\+)|(!)|([A-Za-z][0-9]*))/y;
  function tokenize(expression) {
    const tokens = [];
    TOKEN_REGEX.lastIndex = 0;
    let lastIndex = 0;
    while (TOKEN_REGEX.lastIndex < expression.length) {
      const start = TOKEN_REGEX.lastIndex;
      const match = TOKEN_REGEX.exec(expression);
      if (!match) {
        const remainder = expression.slice(start).trim();
        if (!remainder) break;
        throw new Error(L(`Unsupported character "${remainder[0]}" at position ${start + 1}`, `\u4E0D\u652F\u63F4\u7684\u5B57\u5143\uFF1A\u300C${remainder[0]}\u300D\u65BC\u4F4D\u7F6E ${start + 1}`));
      }
      const [, lparen, rparen, andOp, orOp, plusOp, notOp, ident] = match;
      if (lparen) tokens.push({ type: "lparen" });
      else if (rparen) tokens.push({ type: "rparen" });
      else if (andOp) tokens.push({ type: "and" });
      else if (orOp || plusOp) tokens.push({ type: "or" });
      else if (notOp) tokens.push({ type: "not" });
      else if (ident) tokens.push({ type: "ident", value: ident });
      lastIndex = TOKEN_REGEX.lastIndex;
    }
    if (lastIndex < expression.length && expression.slice(lastIndex).trim()) {
      throw new Error(L(`Could not parse trailing input "${expression.slice(lastIndex).trim()}"`, `\u7121\u6CD5\u89E3\u6790\u5269\u9918\u5B57\u4E32\uFF1A\u300C${expression.slice(lastIndex).trim()}\u300D`));
    }
    return tokens;
  }
  function parseExpression(tokens) {
    let pos = 0;
    function peek() {
      return tokens[pos];
    }
    function consume(type) {
      const token = tokens[pos];
      if (!token || token.type !== type) {
        throw new Error(L(`Syntax error: expected ${type}, got ${token ? token.type : "EOF"}`, `\u8A9E\u6CD5\u932F\u8AA4\uFF1A\u9810\u671F ${type}\uFF0C\u5BE6\u969B ${token ? token.type : "EOF"}`));
      }
      pos += 1;
      return token;
    }
    function parseOr() {
      var _a2;
      let node = parseAnd();
      while (((_a2 = peek()) == null ? void 0 : _a2.type) === "or") {
        consume("or");
        node = { type: "or", left: node, right: parseAnd() };
      }
      return node;
    }
    function parseAnd() {
      let node = parseNot();
      while (true) {
        const next = peek();
        if (!next) break;
        if (next.type === "and") {
          consume("and");
          node = { type: "and", left: node, right: parseNot() };
        } else if (next.type === "lparen" || next.type === "not" || next.type === "ident") {
          node = { type: "and", left: node, right: parseNot() };
        } else {
          break;
        }
      }
      return node;
    }
    function parseNot() {
      var _a2;
      if (((_a2 = peek()) == null ? void 0 : _a2.type) === "not") {
        consume("not");
        return { type: "not", operand: parseNot() };
      }
      return parseAtom();
    }
    function parseAtom() {
      const token = peek();
      if (!token) throw new Error(L("Syntax error: unexpected end of input.", "\u8A9E\u6CD5\u932F\u8AA4\uFF1A\u672A\u9810\u671F\u7684\u7D50\u5C3E\u3002"));
      if (token.type === "lparen") {
        consume("lparen");
        const node = parseOr();
        consume("rparen");
        return node;
      }
      if (token.type === "ident") {
        consume("ident");
        return { type: "clause", name: token.value };
      }
      throw new Error(L(`Syntax error: unexpected ${token.type}`, `\u8A9E\u6CD5\u932F\u8AA4\uFF1A\u672A\u9810\u671F\u7684 ${token.type}`));
    }
    const ast = parseOr();
    if (pos !== tokens.length) {
      throw new Error(L("Syntax error: trailing tokens were not parsed.", "\u8A9E\u6CD5\u932F\u8AA4\uFF1A\u5269\u9918 token \u672A\u89E3\u6790\u3002"));
    }
    return ast;
  }
  function evaluateAst(ast, values) {
    switch (ast.type) {
      case "clause": {
        if (!(ast.name in values)) {
          throw new Error(L(`Missing clause value: ${ast.name}`, `\u7F3A\u5C11\u5B50\u53E5\u503C\uFF1A${ast.name}`));
        }
        return Boolean(values[ast.name]);
      }
      case "not":
        return !evaluateAst(ast.operand, values);
      case "and":
        return evaluateAst(ast.left, values) && evaluateAst(ast.right, values);
      case "or":
        return evaluateAst(ast.left, values) || evaluateAst(ast.right, values);
      default:
        throw new Error(L(`Unknown AST node: ${ast.type}`, `\u672A\u77E5 AST \u7BC0\u9EDE\uFF1A${ast.type}`));
    }
  }
  function collectClauses(ast, accumulator = []) {
    if (ast.type === "clause") {
      if (!accumulator.includes(ast.name)) accumulator.push(ast.name);
    } else if (ast.type === "not") {
      collectClauses(ast.operand, accumulator);
    } else {
      collectClauses(ast.left, accumulator);
      collectClauses(ast.right, accumulator);
    }
    return accumulator;
  }
  function parsePredicate(expression) {
    const trimmed = String(expression || "").trim();
    if (!trimmed) {
      throw new Error(L("Predicate must not be empty.", "Predicate \u4E0D\u80FD\u70BA\u7A7A\u3002"));
    }
    const tokens = tokenize(trimmed);
    if (!tokens.length) {
      throw new Error(L("Predicate did not yield any token.", "Predicate \u4E0D\u542B\u4EFB\u4F55 token\u3002"));
    }
    const ast = parseExpression(tokens);
    const clauses = collectClauses(ast);
    return { ast, clauses, expression: trimmed };
  }
  function buildTruthTable(parsed) {
    const { ast, clauses } = parsed;
    const total = 1 << clauses.length;
    const rows = [];
    for (let mask = 0; mask < total; mask += 1) {
      const values = {};
      clauses.forEach((clause, index) => {
        values[clause] = Boolean(mask >> clauses.length - 1 - index & 1);
      });
      const predicate = evaluateAst(ast, values);
      const determines = {};
      clauses.forEach((clause) => {
        const flipped = { ...values, [clause]: !values[clause] };
        const flippedResult = evaluateAst(ast, flipped);
        determines[clause] = flippedResult !== predicate;
      });
      rows.push({ index: mask, values, predicate, determines });
    }
    return rows;
  }
  function rowKey(row) {
    return `r${row.index}`;
  }
  function buildPredicateCoverageSet(rows) {
    const truthRow = rows.find((row) => row.predicate === true);
    const falseRow = rows.find((row) => row.predicate === false);
    const tests = [];
    if (truthRow) tests.push({ id: rowKey(truthRow), row: truthRow, label: "P = T" });
    if (falseRow) tests.push({ id: rowKey(falseRow), row: falseRow, label: "P = F" });
    return {
      id: "pc",
      name: "Predicate Coverage",
      description: L("Make the predicate evaluate to true and false at least once each.", "\u8B93\u6574\u500B predicate \u81F3\u5C11\u8A55\u4F30\u70BA true \u8207 false \u5404\u4E00\u6B21\u3002"),
      tests,
      requirementCount: 2
    };
  }
  function buildClauseCoverageSet(rows, clauses) {
    const tests = [];
    const used = /* @__PURE__ */ new Set();
    clauses.forEach((clause) => {
      ["T", "F"].forEach((label) => {
        const target = label === "T";
        const row = rows.find((r) => r.values[clause] === target);
        if (!row) return;
        const id = `${rowKey(row)}-${clause}=${label}`;
        if (used.has(id)) return;
        used.add(id);
        tests.push({ id, row, label: `${clause} = ${label}` });
      });
    });
    return {
      id: "cc",
      name: "Clause Coverage",
      description: L("Each clause must take both true and false at least once.", "\u6BCF\u500B\u5B50\u53E5\u90FD\u5FC5\u9808\u5404\u53D6 true \u8207 false \u4E00\u6B21\u3002"),
      tests,
      requirementCount: clauses.length * 2
    };
  }
  function buildCombinatorialCoverageSet(rows) {
    return {
      id: "coc",
      name: "Combinatorial Coverage",
      description: L("Enumerate all clause T/F combinations (2^n rows).", "\u5217\u8209\u6240\u6709\u5B50\u53E5\u771F\u5047\u7D44\u5408\uFF08\u5171 2^n \u5217\uFF09\u3002"),
      tests: rows.map((row) => ({ id: rowKey(row), row, label: `Row ${row.index}` })),
      requirementCount: rows.length
    };
  }
  function pickPair(rows, clause, mode) {
    const tCandidates = rows.filter((row) => row.determines[clause] && row.values[clause] === true);
    const fCandidates = rows.filter((row) => row.determines[clause] && row.values[clause] === false);
    if (!tCandidates.length || !fCandidates.length) {
      return null;
    }
    if (mode === "gacc") {
      return [tCandidates[0], fCandidates[0]];
    }
    if (mode === "cacc") {
      for (const tRow of tCandidates) {
        for (const fRow of fCandidates) {
          if (tRow.predicate !== fRow.predicate) {
            return [tRow, fRow];
          }
        }
      }
      return null;
    }
    if (mode === "racc") {
      for (const tRow of tCandidates) {
        const minorMatch = fCandidates.find(
          (fRow) => Object.keys(tRow.values).every(
            (name) => name === clause ? fRow.values[name] !== tRow.values[name] : fRow.values[name] === tRow.values[name]
          )
        );
        if (minorMatch) {
          return [tRow, minorMatch];
        }
      }
      return null;
    }
    return null;
  }
  function buildActiveClauseSet(id, name, description, rows, clauses, mode) {
    const tests = [];
    const seen = /* @__PURE__ */ new Set();
    const unsatisfied = [];
    clauses.forEach((clause) => {
      const pair = pickPair(rows, clause, mode);
      if (!pair) {
        unsatisfied.push(clause);
        return;
      }
      pair.forEach((row, index) => {
        const testId = `${rowKey(row)}-${clause}-${index}`;
        if (seen.has(testId)) return;
        seen.add(testId);
        tests.push({
          id: testId,
          row,
          label: `${clause}=${row.values[clause] ? "T" : "F"} ${L(`(major ${clause})`, `(\u4E3B\u5C0E ${clause})`)}`,
          majorClause: clause
        });
      });
    });
    return {
      id,
      name,
      description,
      tests,
      requirementCount: clauses.length * 2,
      unsatisfied
    };
  }
  function buildGACCSet(rows, clauses) {
    return buildActiveClauseSet(
      "gacc",
      "General Active Clause Coverage",
      L("For each major clause, find a row pair such that the major clause determines the predicate while minor clauses are unconstrained.", "\u5C0D\u6BCF\u500B\u4E3B\u5B50\u53E5\uFF0C\u627E\u4E00\u5C0D\u5217\u4F7F\u5176\u6C7A\u5B9A predicate \u7684\u503C\uFF0C\u6B21\u5B50\u53E5\u53EF\u4EFB\u610F\u3002"),
      rows,
      clauses,
      "gacc"
    );
  }
  function buildCACCSet(rows, clauses) {
    return buildActiveClauseSet(
      "cacc",
      "Correlated Active Clause Coverage",
      L("The major clause determines the predicate, and the two rows produce different predicate values.", "\u4E3B\u5B50\u53E5\u6C7A\u5B9A predicate \u7D50\u679C\uFF0C\u4E14\u5169\u5217\u7522\u751F\u4E0D\u540C\u7684 predicate \u503C\u3002"),
      rows,
      clauses,
      "cacc"
    );
  }
  function buildRACCSet(rows, clauses) {
    return buildActiveClauseSet(
      "racc",
      "Restricted Active Clause Coverage",
      L("The major clause determines the predicate, and the two rows have identical minor-clause values.", "\u4E3B\u5B50\u53E5\u6C7A\u5B9A predicate \u7D50\u679C\uFF0C\u4E14\u5169\u5217\u7684\u6B21\u5B50\u53E5\u503C\u5B8C\u5168\u76F8\u540C\u3002"),
      rows,
      clauses,
      "racc"
    );
  }
  function buildInactiveClauseSet(id, name, description, rows, clauses, mode) {
    const tests = [];
    const seen = /* @__PURE__ */ new Set();
    const unsatisfied = [];
    clauses.forEach((clause) => {
      const nonDet = rows.filter((row) => !row.determines[clause]);
      const combos = [
        [true, true],
        [true, false],
        [false, true],
        [false, false]
      ];
      function addRow(row, comboLabel) {
        const testId = `${rowKey(row)}-${clause}-${comboLabel}`;
        if (seen.has(testId)) return;
        seen.add(testId);
        tests.push({
          id: testId,
          row,
          label: `${clause}=${row.values[clause] ? "T" : "F"}, P=${row.predicate ? "T" : "F"} ${L(`(minor ${clause})`, `(\u975E\u4E3B\u5C0E ${clause})`)}`,
          majorClause: clause
        });
      }
      if (mode === "gicc") {
        combos.forEach(([cVal, pVal]) => {
          const row = nonDet.find((r) => r.values[clause] === cVal && r.predicate === pVal);
          if (!row) {
            unsatisfied.push(`${clause}@(c=${cVal ? "T" : "F"},p=${pVal ? "T" : "F"})`);
            return;
          }
          addRow(row, `c${cVal ? "T" : "F"}p${pVal ? "T" : "F"}`);
        });
        return;
      }
      if (mode === "ricc") {
        [true, false].forEach((pVal) => {
          const tCandidates = nonDet.filter((r) => r.values[clause] === true && r.predicate === pVal);
          const fCandidates = nonDet.filter((r) => r.values[clause] === false && r.predicate === pVal);
          let pair = null;
          for (const tRow of tCandidates) {
            const minorMatch = fCandidates.find(
              (fRow) => Object.keys(tRow.values).every(
                (name2) => name2 === clause ? true : fRow.values[name2] === tRow.values[name2]
              )
            );
            if (minorMatch) {
              pair = [tRow, minorMatch];
              break;
            }
          }
          if (!pair) {
            unsatisfied.push(`${clause}@p=${pVal ? "T" : "F"}`);
            return;
          }
          pair.forEach((row, index) => {
            addRow(row, `p${pVal ? "T" : "F"}-${index}`);
          });
        });
      }
    });
    return {
      id,
      name,
      description,
      tests,
      requirementCount: clauses.length * 4,
      unsatisfied
    };
  }
  function buildGICCSet(rows, clauses) {
    return buildInactiveClauseSet(
      "gicc",
      "General Inactive Clause Coverage",
      L("For each major clause, in rows where it does not determine the predicate, cover all (c=T/F) \xD7 (P=T/F) combinations.", "\u5C0D\u6BCF\u500B\u4E3B\u5B50\u53E5\uFF0C\u65BC\u4E0D\u6C7A\u5B9A predicate \u7684\u5217\u4E2D\uFF0C\u8986\u84CB (c=T/F)\xD7(P=T/F) \u5171 4 \u7A2E\u7D44\u5408\u3002"),
      rows,
      clauses,
      "gicc"
    );
  }
  function buildRICCSet(rows, clauses) {
    return buildInactiveClauseSet(
      "ricc",
      "Restricted Inactive Clause Coverage",
      L("Same as GICC, but paired rows (same P) must agree on every minor clause; only the major clause flips.", "\u540C GICC\uFF0C\u4F46\u6210\u5C0D\u5217\uFF08\u540C P \u503C\uFF09\u9700\u6240\u6709\u6B21\u5B50\u53E5\u5B8C\u5168\u76F8\u540C\uFF0C\u50C5\u4E3B\u5B50\u53E5\u7FFB\u8F49\u3002"),
      rows,
      clauses,
      "ricc"
    );
  }
  function buildAllCoverageSets(parsed) {
    const rows = buildTruthTable(parsed);
    const dnf = minimalDNF(rows, parsed.clauses, true);
    const negDnf = minimalDNF(rows, parsed.clauses, false);
    return {
      rows,
      clauses: parsed.clauses,
      dnf,
      negDnf,
      sets: {
        pc: buildPredicateCoverageSet(rows),
        cc: buildClauseCoverageSet(rows, parsed.clauses),
        coc: buildCombinatorialCoverageSet(rows),
        gacc: buildGACCSet(rows, parsed.clauses),
        cacc: buildCACCSet(rows, parsed.clauses),
        racc: buildRACCSet(rows, parsed.clauses),
        gicc: buildGICCSet(rows, parsed.clauses),
        ricc: buildRICCSet(rows, parsed.clauses),
        ic: buildImplicantCoverageSet(rows, dnf, negDnf),
        utpc: buildUTPCSet(rows, dnf),
        mutpc: buildMUTPCSet(rows, parsed.clauses, dnf),
        nfpc: buildNFPCSet(rows, dnf),
        mnfpc: buildMNFPCSet(rows, parsed.clauses, dnf),
        cutpnfp: buildCUTPNFPSet(rows, dnf)
      }
    };
  }
  function literalKey(lit) {
    return `${lit.negated ? "!" : ""}${lit.name}`;
  }
  function termToString(term) {
    if (!term.length) return "true";
    return term.map(literalKey).join(" && ");
  }
  function minimalDNF(rows, clauses, target = true) {
    const n = clauses.length;
    const onSet = rows.filter((r) => r.predicate === target).map((r) => r.index);
    if (!onSet.length) return [];
    if (onSet.length === 1 << n) return [[]];
    let current2 = onSet.map((i) => ({ bits: i, dash: 0, covers: /* @__PURE__ */ new Set([i]) }));
    const primes = [];
    while (current2.length) {
      const used = new Array(current2.length).fill(false);
      const seen = /* @__PURE__ */ new Map();
      const next = [];
      for (let i = 0; i < current2.length; i += 1) {
        for (let j = i + 1; j < current2.length; j += 1) {
          const a = current2[i];
          const b = current2[j];
          if (a.dash !== b.dash) continue;
          const diff = a.bits ^ b.bits;
          if (diff && (diff & diff - 1) === 0 && (diff & a.dash) === 0) {
            used[i] = true;
            used[j] = true;
            const newDash = a.dash | diff;
            const newBits = a.bits & ~diff;
            const key = `${newBits}|${newDash}`;
            if (!seen.has(key)) {
              const covers = /* @__PURE__ */ new Set([...a.covers, ...b.covers]);
              const entry = { bits: newBits, dash: newDash, covers };
              seen.set(key, entry);
              next.push(entry);
            } else {
              const ex = seen.get(key);
              a.covers.forEach((v) => ex.covers.add(v));
              b.covers.forEach((v) => ex.covers.add(v));
            }
          }
        }
      }
      current2.forEach((imp, idx) => {
        if (!used[idx]) primes.push(imp);
      });
      current2 = next;
    }
    const remaining = new Set(onSet);
    const chargeMap = /* @__PURE__ */ new Map();
    primes.forEach((p, idx) => {
      p.covers.forEach((m) => {
        if (!chargeMap.has(m)) chargeMap.set(m, []);
        chargeMap.get(m).push(idx);
      });
    });
    const chosen = /* @__PURE__ */ new Set();
    let changed = true;
    while (changed) {
      changed = false;
      for (const m of [...remaining]) {
        const list = chargeMap.get(m).filter((idx) => !chosen.has(idx));
        if (list.length === 1) {
          chosen.add(list[0]);
          primes[list[0]].covers.forEach((c) => remaining.delete(c));
          changed = true;
        }
      }
    }
    while (remaining.size) {
      let best = -1;
      let bestCover = -1;
      primes.forEach((p, idx) => {
        if (chosen.has(idx)) return;
        let cnt = 0;
        p.covers.forEach((m) => {
          if (remaining.has(m)) cnt += 1;
        });
        if (cnt > bestCover) {
          bestCover = cnt;
          best = idx;
        }
      });
      if (best === -1) break;
      chosen.add(best);
      primes[best].covers.forEach((c) => remaining.delete(c));
    }
    return [...chosen].map((idx) => {
      const p = primes[idx];
      const lits = [];
      for (let bit = 0; bit < n; bit += 1) {
        const mask = 1 << n - 1 - bit;
        if (p.dash & mask) continue;
        const val = Boolean(p.bits & mask);
        lits.push({ name: clauses[bit], negated: !val });
      }
      return lits;
    });
  }
  function termSatisfiedBy(term, values) {
    return term.every((lit) => Boolean(values[lit.name]) !== lit.negated);
  }
  function findRowsForTerm(rows, term) {
    return rows.filter((row) => termSatisfiedBy(term, row.values));
  }
  function uniqueTruePointsForTerm(rows, term, dnf, termIndex) {
    return findRowsForTerm(rows, term).filter(
      (row) => dnf.every((other, idx) => idx === termIndex || !termSatisfiedBy(other, row.values))
    );
  }
  function termLabel(term) {
    return termToString(term);
  }
  function buildImplicantCoverageSet(rows, dnf, negDnf = []) {
    const tests = [];
    const unsatisfied = [];
    function selectMinimalRows(implicants, predicateValue, kind) {
      if (!implicants.length) return;
      const candidatesPerImp = implicants.map(
        (term) => findRowsForTerm(rows, term).filter((r) => r.predicate === predicateValue)
      );
      candidatesPerImp.forEach((cands, idx) => {
        if (!cands.length) {
          unsatisfied.push(`${kind} implicant {${termLabel(implicants[idx])}}`);
        }
      });
      const rowCoverage = /* @__PURE__ */ new Map();
      candidatesPerImp.forEach((cands, impIdx) => {
        cands.forEach((row) => {
          if (!rowCoverage.has(row.index)) rowCoverage.set(row.index, { row, covers: /* @__PURE__ */ new Set() });
          rowCoverage.get(row.index).covers.add(impIdx);
        });
      });
      const remaining = new Set(implicants.map((_, i) => i).filter((i) => candidatesPerImp[i].length));
      const chosen = [];
      let changed = true;
      while (changed) {
        changed = false;
        for (const impIdx of [...remaining]) {
          const owners = [...rowCoverage.values()].filter((entry) => entry.covers.has(impIdx));
          if (owners.length === 1 && !chosen.includes(owners[0])) {
            chosen.push(owners[0]);
            owners[0].covers.forEach((c) => remaining.delete(c));
            changed = true;
          }
        }
      }
      while (remaining.size) {
        let best = null;
        let bestCount = -1;
        rowCoverage.forEach((entry) => {
          if (chosen.includes(entry)) return;
          let cnt = 0;
          entry.covers.forEach((c) => {
            if (remaining.has(c)) cnt += 1;
          });
          if (cnt > bestCount) {
            bestCount = cnt;
            best = entry;
          }
        });
        if (!best || bestCount <= 0) break;
        chosen.push(best);
        best.covers.forEach((c) => remaining.delete(c));
      }
      chosen.forEach((entry) => {
        const coveredImps = [...entry.covers].sort((a, b) => a - b);
        const labels = coveredImps.map((i) => `{${termLabel(implicants[i])}}`).join(", ");
        tests.push({
          id: `r${entry.row.index}-${kind}`,
          row: entry.row,
          label: `${kind === "pos" ? "P=T" : "\xACP=T"} implicants ${labels}`,
          implicantIndex: coveredImps[0],
          implicantIndices: coveredImps,
          polarity: kind
        });
      });
    }
    selectMinimalRows(dnf, true, "pos");
    selectMinimalRows(negDnf, false, "neg");
    return {
      id: "ic",
      name: "Implicant Coverage",
      description: L("For every prime implicant in the minimal DNF of f and \xACf, find at least one row that satisfies it (test rows are minimised).", "\u5C0D f \u8207 \xACf \u7684\u6700\u5C0F DNF \u4E2D\u6BCF\u500B prime implicant\uFF0C\u81F3\u5C11\u627E\u5230\u4E00\u500B\u4F7F\u5176\u70BA\u771F\u7684 row\uFF08\u5DF2\u6700\u5C0F\u5316\u6E2C\u8A66\u5217\u6578\uFF09\u3002"),
      tests,
      requirementCount: dnf.length + negDnf.length,
      unsatisfied
    };
  }
  function buildUTPCSet(rows, dnf) {
    const tests = [];
    const seen = /* @__PURE__ */ new Set();
    const unsatisfied = [];
    dnf.forEach((term, index) => {
      const utps = uniqueTruePointsForTerm(rows, term, dnf, index);
      if (!utps.length) {
        unsatisfied.push(`UTP for {${termLabel(term)}}`);
        return;
      }
      utps.forEach((row) => {
        const key = `r${row.index}-utp${index}`;
        if (seen.has(key)) return;
        seen.add(key);
        tests.push({
          id: key,
          row,
          label: `UTP for {${termLabel(term)}}`,
          implicantIndex: index
        });
      });
    });
    return {
      id: "utpc",
      name: "Unique True Point Coverage",
      description: L("For each implicant, list every unique true point that only satisfies that implicant (any one of them satisfies the criterion).", "\u5C0D\u6BCF\u500B implicant\uFF0C\u5217\u51FA\u6240\u6709\u53EA\u6EFF\u8DB3\u8A72 implicant \u7684 unique true point\uFF08\u4EFB\u9078\u5176\u4E00\u5373\u53EF\u6EFF\u8DB3\u6E96\u5247\uFF09\u3002"),
      tests,
      requirementCount: dnf.length,
      unsatisfied
    };
  }
  function buildMUTPCSet(rows, clauses, dnf) {
    const tests = [];
    const seen = /* @__PURE__ */ new Set();
    const unsatisfied = [];
    let requirementCount = 0;
    dnf.forEach((term, index) => {
      const inImplicant = new Set(term.map((lit) => lit.name));
      const minorClauses = clauses.filter((c) => !inImplicant.has(c));
      requirementCount += minorClauses.length * 2;
      const utps = uniqueTruePointsForTerm(rows, term, dnf, index);
      if (!utps.length) {
        minorClauses.forEach((c) => {
          unsatisfied.push(L(`MUTP {${termLabel(term)}} missing ${c}=T`, `MUTP {${termLabel(term)}} \u7F3A ${c}=T`));
          unsatisfied.push(L(`MUTP {${termLabel(term)}} missing ${c}=F`, `MUTP {${termLabel(term)}} \u7F3A ${c}=F`));
        });
        return;
      }
      if (!minorClauses.length) {
        const row = utps[0];
        const key = `r${row.index}-mutp${index}`;
        if (!seen.has(key)) {
          seen.add(key);
          tests.push({
            id: key,
            row,
            label: `MUTP {${termLabel(term)}}`,
            implicantIndex: index
          });
        }
        return;
      }
      const remaining = /* @__PURE__ */ new Set();
      minorClauses.forEach((c) => {
        remaining.add(`${c}=T`);
        remaining.add(`${c}=F`);
      });
      const chosen = [];
      const utpReqs = utps.map((row) => {
        const reqs = /* @__PURE__ */ new Set();
        minorClauses.forEach((c) => {
          reqs.add(`${c}=${row.values[c] ? "T" : "F"}`);
        });
        return reqs;
      });
      while (remaining.size) {
        let bestIdx = -1;
        let bestCount = 0;
        utpReqs.forEach((reqs, i) => {
          if (chosen.includes(i)) return;
          let cnt = 0;
          reqs.forEach((r) => {
            if (remaining.has(r)) cnt += 1;
          });
          if (cnt > bestCount) {
            bestCount = cnt;
            bestIdx = i;
          }
        });
        if (bestIdx < 0) break;
        chosen.push(bestIdx);
        utpReqs[bestIdx].forEach((r) => remaining.delete(r));
      }
      if (remaining.size) {
        remaining.forEach((r) => {
          unsatisfied.push(L(`MUTP {${termLabel(term)}} missing ${r}`, `MUTP {${termLabel(term)}} \u7F3A ${r}`));
        });
      }
      chosen.forEach((i) => {
        const row = utps[i];
        const covered = [...utpReqs[i]].join(", ");
        const key = `r${row.index}-mutp${index}`;
        if (seen.has(key)) return;
        seen.add(key);
        tests.push({
          id: key,
          row,
          label: `MUTP {${termLabel(term)}} (${covered})`,
          implicantIndex: index
        });
      });
    });
    return {
      id: "mutpc",
      name: "Multiple Unique True Point Coverage",
      description: L("For each implicant, pick a set of UTPs so that every minor clause (clauses not in the implicant) takes both T and F at least once.", "\u5C0D\u6BCF\u500B implicant\uFF0C\u6311\u9078\u4E00\u7D44 UTPs\uFF0C\u4F7F\u6BCF\u500B\u6B21\u5B50\u53E5\uFF08\u4E0D\u5728 implicant \u4E2D\u7684 clause\uFF09\u90FD\u81F3\u5C11\u51FA\u73FE\u4E00\u6B21 T \u8207\u4E00\u6B21 F\u3002"),
      tests,
      requirementCount,
      unsatisfied
    };
  }
  function nearFalsePointsFor(rows, term, literalIndex) {
    const literal = term[literalIndex];
    return rows.filter((row) => {
      if (row.predicate) return false;
      if (Boolean(row.values[literal.name]) === !literal.negated) return false;
      return term.every((lit, idx) => {
        if (idx === literalIndex) return true;
        return Boolean(row.values[lit.name]) === !lit.negated;
      });
    });
  }
  function buildNFPCSet(rows, dnf) {
    const tests = [];
    const seen = /* @__PURE__ */ new Set();
    const unsatisfied = [];
    let requirementCount = 0;
    dnf.forEach((term, index) => {
      term.forEach((literal, literalIndex) => {
        requirementCount += 1;
        const nfps = nearFalsePointsFor(rows, term, literalIndex);
        if (!nfps.length) {
          unsatisfied.push(`NFP {${termLabel(term)}} on ${literalKey(literal)}`);
          return;
        }
        const row = nfps[0];
        const key = `r${row.index}-nfp${index}-${literalIndex}`;
        if (seen.has(key)) return;
        seen.add(key);
        const pairedTruePoint = rows.find(
          (candidate) => termSatisfiedBy(term, candidate.values) && Object.keys(candidate.values).every((name) => {
            if (name === literal.name) return candidate.values[name] !== row.values[name];
            return candidate.values[name] === row.values[name];
          })
        );
        tests.push({
          id: key,
          row,
          label: L(`NFP {${termLabel(term)}} flip ${literalKey(literal)}`, `NFP {${termLabel(term)}} \u7FFB\u8F49 ${literalKey(literal)}`),
          implicantIndex: index,
          literal,
          pairedTruePointIndex: pairedTruePoint ? pairedTruePoint.index : null
        });
      });
    });
    return {
      id: "nfpc",
      name: "Near False Point Coverage",
      description: L("For every literal in every implicant, find a row that flips that literal so the implicant becomes false and P is false.", "\u5C0D\u6BCF\u500B implicant \u7684\u6BCF\u500B literal\uFF0C\u627E\u4E00\u500B\u7FFB\u8F49\u8A72 literal \u5F8C\u4F7F implicant \u70BA\u5047\u4E14 P \u70BA\u5047\u7684 row\u3002"),
      tests,
      requirementCount,
      unsatisfied
    };
  }
  function buildMNFPCSet(rows, clauses, dnf) {
    const tests = [];
    const seen = /* @__PURE__ */ new Set();
    const unsatisfied = [];
    let requirementCount = 0;
    dnf.forEach((term, index) => {
      const inImplicant = new Set(term.map((lit) => lit.name));
      const minorClauses = clauses.filter((c) => !inImplicant.has(c));
      term.forEach((literal, literalIndex) => {
        requirementCount += Math.max(minorClauses.length * 2, 1);
        const nfps = nearFalsePointsFor(rows, term, literalIndex);
        if (!nfps.length) {
          if (!minorClauses.length) {
            unsatisfied.push(L(`MNFP {${termLabel(term)}} flip ${literalKey(literal)}`, `MNFP {${termLabel(term)}} \u7FFB\u8F49 ${literalKey(literal)}`));
          } else {
            minorClauses.forEach((c) => {
              unsatisfied.push(L(`MNFP {${termLabel(term)}} flip ${literalKey(literal)} missing ${c}=T`, `MNFP {${termLabel(term)}} \u7FFB\u8F49 ${literalKey(literal)} \u7F3A ${c}=T`));
              unsatisfied.push(L(`MNFP {${termLabel(term)}} flip ${literalKey(literal)} missing ${c}=F`, `MNFP {${termLabel(term)}} \u7FFB\u8F49 ${literalKey(literal)} \u7F3A ${c}=F`));
            });
          }
          return;
        }
        if (!minorClauses.length) {
          const row = nfps[0];
          const key = `r${row.index}-mnfp${index}-${literalIndex}`;
          if (!seen.has(key)) {
            seen.add(key);
            tests.push({
              id: key,
              row,
              label: L(`MNFP {${termLabel(term)}} flip ${literalKey(literal)}`, `MNFP {${termLabel(term)}} \u7FFB\u8F49 ${literalKey(literal)}`),
              implicantIndex: index,
              literal
            });
          }
          return;
        }
        const remaining = /* @__PURE__ */ new Set();
        minorClauses.forEach((c) => {
          remaining.add(`${c}=T`);
          remaining.add(`${c}=F`);
        });
        const reqsPerNfp = nfps.map((row) => {
          const reqs = /* @__PURE__ */ new Set();
          minorClauses.forEach((c) => {
            reqs.add(`${c}=${row.values[c] ? "T" : "F"}`);
          });
          return reqs;
        });
        const chosen = [];
        while (remaining.size) {
          let bestIdx = -1;
          let bestCount = 0;
          reqsPerNfp.forEach((reqs, i) => {
            if (chosen.includes(i)) return;
            let cnt = 0;
            reqs.forEach((r) => {
              if (remaining.has(r)) cnt += 1;
            });
            if (cnt > bestCount) {
              bestCount = cnt;
              bestIdx = i;
            }
          });
          if (bestIdx < 0) break;
          chosen.push(bestIdx);
          reqsPerNfp[bestIdx].forEach((r) => remaining.delete(r));
        }
        if (remaining.size) {
          remaining.forEach((r) => {
            unsatisfied.push(L(`MNFP {${termLabel(term)}} flip ${literalKey(literal)} missing ${r}`, `MNFP {${termLabel(term)}} \u7FFB\u8F49 ${literalKey(literal)} \u7F3A ${r}`));
          });
        }
        chosen.forEach((i) => {
          const row = nfps[i];
          const covered = [...reqsPerNfp[i]].join(", ");
          const key = `r${row.index}-mnfp${index}-${literalIndex}`;
          if (seen.has(key)) return;
          seen.add(key);
          tests.push({
            id: key,
            row,
            label: L(`MNFP {${termLabel(term)}} flip ${literalKey(literal)} (${covered})`, `MNFP {${termLabel(term)}} \u7FFB\u8F49 ${literalKey(literal)}\uFF08${covered}\uFF09`),
            implicantIndex: index,
            literal
          });
        });
      });
    });
    return {
      id: "mnfpc",
      name: "Multiple Near False Point Coverage",
      description: L("For every literal in every implicant, pick a set of NFPs so that every minor clause takes both T and F at least once.", "\u5C0D\u6BCF\u500B implicant \u7684\u6BCF\u500B literal\uFF0C\u6311\u4E00\u7D44 NFPs\uFF0C\u4F7F\u6BCF\u500B\u6B21\u5B50\u53E5\u90FD\u81F3\u5C11\u51FA\u73FE\u4E00\u6B21 T \u8207\u4E00\u6B21 F\u3002"),
      tests,
      requirementCount,
      unsatisfied
    };
  }
  function buildCUTPNFPSet(rows, dnf) {
    const tests = [];
    const seen = /* @__PURE__ */ new Set();
    const unsatisfied = [];
    let requirementCount = 0;
    dnf.forEach((term, index) => {
      const utps = uniqueTruePointsForTerm(rows, term, dnf, index);
      term.forEach((literal, literalIndex) => {
        requirementCount += 1;
        let pair = null;
        for (const utp of utps) {
          const nfp = rows.find((row) => {
            if (row.predicate) return false;
            return Object.keys(utp.values).every((name) => {
              if (name === literal.name) return row.values[name] !== utp.values[name];
              return row.values[name] === utp.values[name];
            });
          });
          if (nfp) {
            pair = [utp, nfp];
            break;
          }
        }
        if (!pair) {
          unsatisfied.push(L(`CUTPNFP {${termLabel(term)}} flip ${literalKey(literal)}`, `CUTPNFP {${termLabel(term)}} \u7FFB\u8F49 ${literalKey(literal)}`));
          return;
        }
        pair.forEach((row, role) => {
          const key = `r${row.index}-cutp${index}-${literalIndex}-${role}`;
          if (seen.has(key)) return;
          seen.add(key);
          tests.push({
            id: key,
            row,
            label: L(`${role === 0 ? "UTP" : "NFP"} pair {${termLabel(term)}} flip ${literalKey(literal)}`, `${role === 0 ? "UTP" : "NFP"} pair {${termLabel(term)}} \u7FFB\u8F49 ${literalKey(literal)}`),
            implicantIndex: index,
            literal,
            role: role === 0 ? "utp" : "nfp",
            pairedRowIndex: pair[role === 0 ? 1 : 0].index
          });
        });
      });
    });
    return {
      id: "cutpnfp",
      name: "Corresponding UTP + NFP Pair Coverage",
      description: L("For every literal in every implicant, pick a UTP/NFP pair that differs only in that literal.", "\u70BA\u6BCF\u500B implicant \u7684\u6BCF\u500B literal\uFF0C\u6311\u4E00\u5C0D\u50C5\u5728\u8A72 literal \u4E0D\u540C\u7684 UTP \u8207 NFP\u3002"),
      tests,
      requirementCount,
      unsatisfied
    };
  }

  // src/utils/karnaughMap.js
  var GRAY2 = [0, 1];
  var GRAY4 = [0, 1, 3, 2];
  function bits(value, width) {
    return value.toString(2).padStart(width, "0");
  }
  function composeMinterm(n, rowBits, colBits, rowClauseIdx, colClauseIdx) {
    let minterm = 0;
    rowClauseIdx.forEach((clauseIdx, i) => {
      const localBit = rowBits >> rowClauseIdx.length - 1 - i & 1;
      if (localBit) minterm |= 1 << n - 1 - clauseIdx;
    });
    colClauseIdx.forEach((clauseIdx, i) => {
      const localBit = colBits >> colClauseIdx.length - 1 - i & 1;
      if (localBit) minterm |= 1 << n - 1 - clauseIdx;
    });
    return minterm;
  }
  function buildKMap(rows, clauses, target = true, dnf = []) {
    const n = clauses.length;
    if (n < 1 || n > 4) {
      return { unsupported: true, n };
    }
    const map = /* @__PURE__ */ new Map();
    rows.forEach((row) => {
      map.set(row.index, { value: row.predicate === target, minterm: row.index, values: row.values });
    });
    let rowOrder;
    let colOrder;
    let rowVars;
    let colVars;
    let rowClauseIdx;
    let colClauseIdx;
    if (n === 1) {
      rowOrder = [0];
      colOrder = GRAY2;
      rowVars = [];
      colVars = [clauses[0]];
      rowClauseIdx = [];
      colClauseIdx = [0];
    } else if (n === 2) {
      rowOrder = GRAY2;
      colOrder = GRAY2;
      rowVars = [clauses[0]];
      colVars = [clauses[1]];
      rowClauseIdx = [0];
      colClauseIdx = [1];
    } else if (n === 3) {
      rowOrder = GRAY2;
      colOrder = GRAY4;
      rowVars = [clauses[2]];
      colVars = [clauses[0], clauses[1]];
      rowClauseIdx = [2];
      colClauseIdx = [0, 1];
    } else {
      rowOrder = GRAY4;
      colOrder = GRAY4;
      rowVars = [clauses[2], clauses[3]];
      colVars = [clauses[0], clauses[1]];
      rowClauseIdx = [2, 3];
      colClauseIdx = [0, 1];
    }
    const rowWidth = rowClauseIdx.length;
    const colWidth = colClauseIdx.length;
    const grid = rowOrder.map((rBits) => {
      const cells = colOrder.map((cBits) => {
        const minterm = composeMinterm(n, rBits, cBits, rowClauseIdx, colClauseIdx);
        const entry = map.get(minterm);
        const values = (entry == null ? void 0 : entry.values) || {};
        const implicants = [];
        if (entry == null ? void 0 : entry.value) {
          dnf.forEach((term, idx) => {
            if (term.every((lit) => Boolean(values[lit.name]) !== lit.negated)) {
              implicants.push(idx);
            }
          });
        }
        return {
          minterm,
          value: entry ? entry.value : false,
          implicants
        };
      });
      return {
        header: rowWidth ? bits(rBits, rowWidth) : "",
        cells
      };
    });
    return {
      unsupported: false,
      n,
      rowVars,
      colVars,
      colHeaders: colOrder.map((cBits) => bits(cBits, colWidth)),
      grid
    };
  }

  // src/config/cloudConfig.js
  var cloudConfig = {
    firebase: {
      apiKey: "__FIREBASE_API_KEY__",
      authDomain: "__FIREBASE_AUTH_DOMAIN__",
      projectId: "__FIREBASE_PROJECT_ID__",
      storageBucket: "__FIREBASE_STORAGE_BUCKET__",
      messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
      appId: "__FIREBASE_APP_ID__",
      measurementId: "__FIREBASE_MEASUREMENT_ID__"
    },
    drive: {
      uploadFolderId: "__DRIVE_UPLOAD_FOLDER_ID__"
    }
  };
  function getResolvedCloudConfig() {
    const runtimeConfig = globalThis.STVISUAL_CLOUD_CONFIG || {};
    return {
      ...cloudConfig,
      ...runtimeConfig,
      firebase: {
        ...cloudConfig.firebase,
        ...runtimeConfig.firebase || {}
      },
      drive: {
        ...cloudConfig.drive,
        ...runtimeConfig.drive || {}
      }
    };
  }

  // src/utils/cloudIntegration.js
  var REQUIRED_FIREBASE_KEYS = ["apiKey", "authDomain", "projectId", "appId"];
  var DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
  function getMissingFirebaseKeys(firebaseConfig) {
    return REQUIRED_FIREBASE_KEYS.filter((key) => !(firebaseConfig == null ? void 0 : firebaseConfig[key]));
  }
  function createMultipartBody(file, metadata) {
    const boundary = `stvisual-${Date.now()}`;
    const head = `--${boundary}\r
Content-Type: application/json; charset=UTF-8\r
\r
${JSON.stringify(metadata)}\r
`;
    const middle = `--${boundary}\r
Content-Type: ${file.type || "application/octet-stream"}\r
\r
`;
    const tail = `\r
--${boundary}--`;
    return {
      boundary,
      body: new Blob([head, middle, file, tail])
    };
  }
  function createCloudIntegrationClient() {
    var _a2;
    const config = getResolvedCloudConfig();
    const missingKeys = getMissingFirebaseKeys(config.firebase);
    const isFileProtocol = ((_a2 = globalThis.location) == null ? void 0 : _a2.protocol) === "file:";
    const isSupportedOrigin = !isFileProtocol;
    const isConfigured = missingKeys.length === 0;
    const firebase = globalThis.firebase;
    if (!isSupportedOrigin) {
      const originMessage = t("cloud.err.fileProtocol");
      return {
        isConfigured,
        missingKeys,
        isSupportedOrigin,
        originWarning: originMessage,
        subscribeAuthState(callback) {
          callback(null);
          return () => {
          };
        },
        async signInWithGoogle() {
          throw new Error(originMessage);
        },
        async signOutGoogle() {
          throw new Error(originMessage);
        },
        async saveSettings() {
          throw new Error(originMessage);
        },
        async loadSettings() {
          throw new Error(originMessage);
        },
        async uploadFileToDrive() {
          throw new Error(originMessage);
        }
      };
    }
    if (!isConfigured) {
      return {
        isConfigured,
        missingKeys,
        isSupportedOrigin,
        originWarning: "",
        subscribeAuthState(callback) {
          callback(null);
          return () => {
          };
        },
        async signInWithGoogle() {
          throw new Error(t("cloud.err.firebaseIncomplete", { keys: missingKeys.join(", ") }));
        },
        async signOutGoogle() {
          throw new Error(t("cloud.err.firebaseIncomplete", { keys: missingKeys.join(", ") }));
        },
        async saveSettings() {
          throw new Error(t("cloud.err.firebaseIncomplete", { keys: missingKeys.join(", ") }));
        },
        async loadSettings() {
          throw new Error(t("cloud.err.firebaseIncomplete", { keys: missingKeys.join(", ") }));
        },
        async uploadFileToDrive() {
          throw new Error(t("cloud.err.firebaseIncomplete", { keys: missingKeys.join(", ") }));
        }
      };
    }
    if (!(firebase == null ? void 0 : firebase.apps) || typeof firebase.initializeApp !== "function") {
      const sdkMessage = t("cloud.err.sdkNotLoaded");
      return {
        isConfigured,
        missingKeys,
        isSupportedOrigin,
        originWarning: "",
        subscribeAuthState(callback) {
          callback(null);
          return () => {
          };
        },
        async signInWithGoogle() {
          throw new Error(sdkMessage);
        },
        async signOutGoogle() {
          throw new Error(sdkMessage);
        },
        async saveSettings() {
          throw new Error(sdkMessage);
        },
        async loadSettings() {
          throw new Error(sdkMessage);
        },
        async uploadFileToDrive() {
          throw new Error(sdkMessage);
        }
      };
    }
    const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(config.firebase);
    const auth = firebase.auth(app);
    const db = firebase.firestore(app);
    let driveAccessToken = null;
    function snapshotExists(snapshot) {
      if (!snapshot) return false;
      return typeof snapshot.exists === "function" ? snapshot.exists() : Boolean(snapshot.exists);
    }
    return {
      isConfigured,
      missingKeys,
      isSupportedOrigin,
      originWarning: "",
      subscribeAuthState(callback) {
        return auth.onAuthStateChanged(callback);
      },
      async signInWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope(DRIVE_SCOPE);
        const result = await auth.signInWithPopup(provider);
        const credential = result.credential;
        driveAccessToken = (credential == null ? void 0 : credential.accessToken) || null;
        return {
          user: result.user,
          hasDriveToken: Boolean(driveAccessToken)
        };
      },
      async signOutGoogle() {
        driveAccessToken = null;
        await auth.signOut();
      },
      async loadSettings(userId) {
        const snapshot = await db.collection("users").doc(userId).collection("settings").doc("default").get();
        if (!snapshotExists(snapshot)) {
          return null;
        }
        return snapshot.data();
      },
      async saveSettings(userId, settings) {
        await db.collection("users").doc(userId).collection("settings").doc("default").set({
          ...settings,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      },
      async loadLogicRecent(userId) {
        const snapshot = await db.collection("users").doc(userId).collection("settings").doc("logicCoverage").get();
        if (!snapshotExists(snapshot)) return [];
        const data = snapshot.data() || {};
        return Array.isArray(data.recentPredicates) ? data.recentPredicates.filter((p) => typeof p === "string") : [];
      },
      async saveLogicRecent(userId, list) {
        await db.collection("users").doc(userId).collection("settings").doc("logicCoverage").set({
          recentPredicates: Array.isArray(list) ? list.filter((p) => typeof p === "string") : [],
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      },
      async loadSyntaxTests(userId) {
        const snapshot = await db.collection("users").doc(userId).collection("settings").doc("syntaxCoverage").get();
        if (!snapshotExists(snapshot)) return {};
        const data = snapshot.data() || {};
        return data.programs && typeof data.programs === "object" ? data.programs : {};
      },
      async saveSyntaxTests(userId, programs) {
        await db.collection("users").doc(userId).collection("settings").doc("syntaxCoverage").set({
          programs: programs && typeof programs === "object" ? programs : {},
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      },
      async uploadFileToDrive(file, options = {}) {
        var _a3;
        if (!driveAccessToken) {
          throw new Error(t("cloud.err.noDriveToken"));
        }
        const metadata = {
          name: file.name
        };
        const folderId = options.folderId || config.drive.uploadFolderId;
        if (folderId) {
          metadata.parents = [folderId];
        }
        const { boundary, body } = createMultipartBody(file, metadata);
        const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${driveAccessToken}`,
            "Content-Type": `multipart/related; boundary=${boundary}`
          },
          body
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(((_a3 = payload == null ? void 0 : payload.error) == null ? void 0 : _a3.message) || t("cloud.err.uploadFailed"));
        }
        return payload;
      },
      async listDriveFiles(options = {}) {
        var _a3;
        if (!driveAccessToken) {
          throw new Error(t("cloud.err.noDriveToken"));
        }
        const params = new URLSearchParams({
          pageSize: String(options.pageSize || 30),
          fields: "files(id,name,mimeType,modifiedTime,webViewLink)",
          orderBy: "modifiedTime desc"
        });
        const folderId = options.folderId || config.drive.uploadFolderId;
        const queryParts = ["trashed=false"];
        if (folderId) queryParts.push(`'${folderId}' in parents`);
        params.set("q", queryParts.join(" and "));
        const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
          headers: { Authorization: `Bearer ${driveAccessToken}` }
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(((_a3 = payload == null ? void 0 : payload.error) == null ? void 0 : _a3.message) || t("cloud.err.listFailed"));
        }
        return Array.isArray(payload.files) ? payload.files : [];
      },
      async downloadDriveFile(fileId) {
        var _a3;
        if (!driveAccessToken) {
          throw new Error(t("cloud.err.noDriveToken"));
        }
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`, {
          headers: { Authorization: `Bearer ${driveAccessToken}` }
        });
        if (!response.ok) {
          let msg = t("cloud.err.downloadFailed");
          try {
            const j = await response.json();
            msg = ((_a3 = j == null ? void 0 : j.error) == null ? void 0 : _a3.message) || msg;
          } catch {
          }
          throw new Error(msg);
        }
        return response.text();
      }
    };
  }

  // src/components/LogicCoverageExplorer.js
  var RECENT_KEY = "stvisual.logic.recentPredicates";
  var RECENT_LIMIT = 8;
  function loadRecent() {
    var _a2;
    try {
      const raw = (_a2 = globalThis.localStorage) == null ? void 0 : _a2.getItem(RECENT_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((p) => typeof p === "string") : [];
    } catch {
      return [];
    }
  }
  function saveRecent(list) {
    var _a2;
    try {
      (_a2 = globalThis.localStorage) == null ? void 0 : _a2.setItem(RECENT_KEY, JSON.stringify(list));
    } catch {
    }
  }
  function isBuiltinExpression(expr) {
    return logicCoveragePredicates.some((p) => p.expression === expr);
  }
  function escapeHtml2(value = "") {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  function termToHtml(term) {
    if (!term.length) return "true";
    return term.map((lit) => `${lit.negated ? "!" : ""}${lit.name}`).join(" \u2227 ");
  }
  function literalToCompactHtml(lit) {
    const name = escapeHtml2(lit.name);
    return lit.negated ? `<span class="logic-overline">${name}</span>` : name;
  }
  function termToCompactHtml(term) {
    if (!term.length) return "1";
    return term.map(literalToCompactHtml).join("");
  }
  function dnfToHtml(dnf) {
    if (!dnf.length) return "<code>false</code>";
    return dnf.map((term) => `<code>${escapeHtml2(termToHtml(term))}</code>`).join(" &nbsp;\u2228&nbsp; ");
  }
  function dnfToCompactHtml(dnf) {
    if (!dnf.length) return "<code>0</code>";
    return dnf.map((term) => `<code>${termToCompactHtml(term)}</code>`).join(" &nbsp;+&nbsp; ");
  }
  var IMPLICANT_PALETTE = [
    "#e67e22",
    "#27ae60",
    "#2980b9",
    "#8e44ad",
    "#c0392b",
    "#16a085",
    "#d35400",
    "#7f8c8d"
  ];
  function renderKMap(rows, clauses, target, title, options = {}) {
    const {
      highlightedMinterms = null,
      implicantGroups = [],
      highlightLabel = "UTP",
      nfpMarks = null,
      // Map<minterm, { color, label }>
      ntpMarks = null
      // Map<minterm, { color, label }>
    } = options;
    const map = buildKMap(rows, clauses, target);
    if (map.unsupported) {
      return `<div class="logic-kmap"><h4 class="logic-kmap-title">${escapeHtml2(title)}</h4>
      <p class="logic-kmap-note">${t("logic.kmap.unsupported", { n: map.n })}</p></div>`;
    }
    const colHeaderLabel = map.colVars.length ? map.colVars.join("") : "";
    const rowHeaderLabel = map.rowVars.length ? map.rowVars.join("") : "";
    const colHeadHtml = map.colHeaders.map((h) => `<th scope="col">${escapeHtml2(h)}</th>`).join("");
    const bodyHtml = map.grid.map((row) => {
      const cells = row.cells.map((cell) => {
        const classes = ["logic-kmap-cell"];
        if (cell.value) classes.push("logic-kmap-on");
        const isHighlighted = highlightedMinterms == null ? void 0 : highlightedMinterms.has(cell.minterm);
        if (isHighlighted) classes.push("logic-kmap-utp");
        const text = cell.value ? "1" : "0";
        const marker = isHighlighted ? '<span class="logic-kmap-utp-mark" aria-hidden="true">\u2605</span>' : "";
        const groupsCovering = implicantGroups.filter((g) => g.minterms.has(cell.minterm));
        const dots = groupsCovering.length ? `<span class="logic-kmap-dots">${groupsCovering.map((g) => `<span class="logic-kmap-dot" style="background:${g.color}" title="${escapeHtml2(g.label)}"></span>`).join("")}</span>` : "";
        const nfpInfo = nfpMarks == null ? void 0 : nfpMarks.get(cell.minterm);
        const ntpInfo = ntpMarks == null ? void 0 : ntpMarks.get(cell.minterm);
        if (nfpInfo) classes.push("logic-kmap-nfp");
        if (ntpInfo) classes.push("logic-kmap-ntp");
        const badge = (() => {
          const parts = [];
          if (ntpInfo) {
            parts.push(`<span class="logic-kmap-badge logic-kmap-badge-ntp" style="background:${ntpInfo.color}" title="${escapeHtml2(ntpInfo.label)}">UTP</span>`);
          }
          if (nfpInfo) {
            parts.push(`<span class="logic-kmap-badge logic-kmap-badge-nfp" style="border-color:${nfpInfo.color};color:${nfpInfo.color}" title="${escapeHtml2(nfpInfo.label)}">NFP</span>`);
          }
          return parts.length ? `<span class="logic-kmap-badges">${parts.join("")}</span>` : "";
        })();
        const titleAttr = `m${cell.minterm}${isHighlighted ? `\uFF08${highlightLabel}\uFF09` : ""}${groupsCovering.length ? `\uFF5C${groupsCovering.map((g) => g.label).join(" / ")}` : ""}${nfpInfo ? `\uFF5CNFP: ${nfpInfo.label}` : ""}${ntpInfo ? `\uFF5CUTP: ${ntpInfo.label}` : ""}`;
        return `<td class="${classes.join(" ")}" title="${escapeHtml2(titleAttr)}">${marker}${badge}${text}<sub>${cell.minterm}</sub>${dots}</td>`;
      }).join("");
      const rowHead = rowHeaderLabel ? `<th scope="row">${escapeHtml2(row.header)}</th>` : "";
      return `<tr>${rowHead}${cells}</tr>`;
    }).join("");
    const corner = rowHeaderLabel ? `<th class="logic-kmap-corner"><span>${escapeHtml2(rowHeaderLabel)}</span><span class="logic-kmap-slash">\\</span><span>${escapeHtml2(colHeaderLabel)}</span></th>` : `<th class="logic-kmap-corner">${escapeHtml2(colHeaderLabel)}</th>`;
    const legend = implicantGroups.length ? `<ul class="logic-kmap-legend">${implicantGroups.map((g) => {
      var _a2;
      return `
          <li>
            <span class="logic-kmap-dot" style="background:${g.color}"></span>
            <code>${g.labelHtml || escapeHtml2(g.label)}</code>
            ${((_a2 = g.testRowIndices) == null ? void 0 : _a2.length) ? `<span class="logic-kmap-legend-tests">tests: ${g.testRowIndices.map((i) => `m${i}`).join(", ")}</span>` : ""}
          </li>`;
    }).join("")}</ul>` : "";
    return `<div class="logic-kmap" data-testid="${target ? "logic-kmap-f" : "logic-kmap-not-f"}">
    <h4 class="logic-kmap-title">${escapeHtml2(title)}</h4>
    <table class="logic-kmap-table"><thead><tr>${corner}${colHeadHtml}</tr></thead>
    <tbody>${bodyHtml}</tbody></table>
    ${legend}
  </div>`;
  }
  function buildImplicantGroups(rows, terms, target, paletteOffset = 0, testsForPolarity = []) {
    return terms.map((term, idx) => {
      const minterms = new Set(
        rows.filter((row) => row.predicate === target && term.every((lit) => Boolean(row.values[lit.name]) !== lit.negated)).map((row) => row.index)
      );
      const testRowIndices = testsForPolarity.filter((t2) => {
        var _a2;
        return ((_a2 = t2.implicantIndices) == null ? void 0 : _a2.includes(idx)) || t2.implicantIndex === idx;
      }).map((t2) => t2.row.index);
      return {
        color: IMPLICANT_PALETTE[(idx + paletteOffset) % IMPLICANT_PALETTE.length],
        label: termToString(term),
        labelHtml: termToCompactHtml(term),
        minterms,
        testRowIndices: [...new Set(testRowIndices)]
      };
    });
  }
  function createLogicCoverageExplorer() {
    const root2 = document.createElement("div");
    root2.className = "logic-coverage";
    root2.dataset.testid = "logic-coverage";
    const state = {
      expression: logicCoveragePredicates[0].expression,
      selectedCriterion: "pc",
      error: null,
      parsed: null,
      analysis: null,
      recent: loadRecent(),
      cloudUser: null
    };
    let cloudClient = null;
    try {
      cloudClient = createCloudIntegrationClient();
    } catch {
      cloudClient = null;
    }
    function pushRecentToCloud(list) {
      if (!cloudClient || !state.cloudUser || typeof cloudClient.saveLogicRecent !== "function") return;
      cloudClient.saveLogicRecent(state.cloudUser.uid, list).catch(() => {
      });
    }
    function persistRecent() {
      saveRecent(state.recent);
      pushRecentToCloud(state.recent);
    }
    function rememberCurrentExpression() {
      const expr = state.expression.trim();
      if (!expr || state.error) return false;
      if (isBuiltinExpression(expr)) return false;
      const next = [expr, ...state.recent.filter((item) => item !== expr)].slice(0, RECENT_LIMIT);
      if (next.length === state.recent.length && next[0] === state.recent[0]) {
        return false;
      }
      state.recent = next;
      persistRecent();
      return true;
    }
    function removeRecent(expr) {
      const next = state.recent.filter((item) => item !== expr);
      if (next.length === state.recent.length) return;
      state.recent = next;
      persistRecent();
      render();
    }
    function recompute() {
      try {
        state.parsed = parsePredicate(state.expression);
        if (state.parsed.clauses.length > 6) {
          throw new Error(t("logic.err.tooManyClauses"));
        }
        state.analysis = buildAllCoverageSets(state.parsed);
        state.error = null;
      } catch (err) {
        state.parsed = null;
        state.analysis = null;
        state.error = err.message || String(err);
      }
    }
    function getActiveSet() {
      if (!state.analysis) return null;
      return state.analysis.sets[state.selectedCriterion] || null;
    }
    function activeRowIds() {
      const set = getActiveSet();
      if (!set) return /* @__PURE__ */ new Set();
      return new Set(set.tests.map((t2) => `r${t2.row.index}`));
    }
    function render() {
      const examplesMarkup = logicCoveragePredicates.map((p) => `
        <button
          type="button"
          class="logic-example-btn${state.expression === p.expression ? " active" : ""}"
          data-expression="${escapeHtml2(p.expression)}"
          data-testid="logic-example-${p.id}"
          title="${escapeHtml2(pickField(p, "description") || "")}"
        >
          ${escapeHtml2(p.name)}
        </button>
      `).join("");
      const recentMarkup = state.recent.length ? `
        <div class="logic-recent" data-testid="logic-recent">
          <span class="logic-recent-label">${t("logic.recent")}</span>
          ${state.recent.map((expr) => `
              <span class="logic-recent-chip${state.expression === expr ? " active" : ""}" data-testid="logic-recent-chip">
                <button
                  type="button"
                  class="logic-recent-select"
                  data-recent-select="${escapeHtml2(expr)}"
                  title="${escapeHtml2(expr)}"
                >${escapeHtml2(expr)}</button>
                <button
                  type="button"
                  class="logic-recent-remove"
                  data-recent-remove="${escapeHtml2(expr)}"
                  aria-label="${t("logic.remove")} ${escapeHtml2(expr)}"
                  title="${t("logic.remove")}"
                >\xD7</button>
              </span>
            `).join("")}
        </div>
      ` : "";
      const criteriaMarkup = logicCoverageCriteria.map((c) => `
        <button
          type="button"
          class="logic-criterion-btn${state.selectedCriterion === c.id ? " active" : ""}"
          data-criterion="${c.id}"
          data-testid="logic-criterion-${c.id}"
        >
          <span class="logic-criterion-label">${escapeHtml2(pickField(c, "label") || c.label)}</span>
          <span class="logic-criterion-zh">${escapeHtml2(getLocale() === "en" ? c.descriptionEn || c.description || "" : c.labelZh || "")}</span>
        </button>
      `).join("");
      const truthTableMarkup = renderTruthTable();
      const summaryMarkup = renderSummary();
      root2.innerHTML = `
      <div class="logic-toolbar">
        <label class="logic-input-label" for="logic-expression-input">Predicate</label>
        <input
          id="logic-expression-input"
          class="logic-expression-input"
          type="text"
          value="${escapeHtml2(state.expression)}"
          spellcheck="false"
          autocomplete="off"
          data-testid="logic-expression-input"
        />
        <p class="logic-input-hint">${t("logic.inputHint")}</p>
        <div class="logic-examples">${examplesMarkup}</div>
        ${recentMarkup}
      </div>

      ${state.error ? `<div class="logic-error" data-testid="logic-error">${escapeHtml2(state.error)}</div>` : ""}

      <div class="logic-criteria" role="tablist" aria-label="${t("logic.aria.criteria")}">
        ${criteriaMarkup}
      </div>

      <div class="logic-summary" data-testid="logic-summary">${summaryMarkup}</div>

      <div class="logic-truth-table-wrap">${truthTableMarkup}</div>
    `;
      bindEvents();
    }
    function renderTruthTable() {
      if (!state.analysis) {
        return "";
      }
      const { rows, clauses } = state.analysis;
      const highlighted = activeRowIds();
      const activeSet = getActiveSet();
      const majorByRow = /* @__PURE__ */ new Map();
      if (activeSet && ["gacc", "cacc", "racc", "gicc", "ricc"].includes(activeSet.id)) {
        activeSet.tests.forEach((test) => {
          const key = `r${test.row.index}`;
          if (!majorByRow.has(key)) {
            majorByRow.set(key, /* @__PURE__ */ new Set());
          }
          majorByRow.get(key).add(test.majorClause);
        });
      }
      const headerCells = clauses.map((c) => `<th scope="col">${escapeHtml2(c)}</th>`).join("");
      const bodyRows = rows.map((row) => {
        const rowKey2 = `r${row.index}`;
        const isActive = highlighted.has(rowKey2);
        const majors = majorByRow.get(rowKey2);
        const cells = clauses.map((c) => {
          const determining = row.determines[c];
          const isMajor = majors == null ? void 0 : majors.has(c);
          return `
              <td class="logic-cell-clause${determining ? " determining" : ""}${isMajor ? " major" : ""}" data-clause="${escapeHtml2(c)}">
                ${row.values[c] ? "T" : "F"}
              </td>
            `;
        }).join("");
        return `
          <tr class="logic-row${isActive ? " active" : ""}${row.predicate ? " p-true" : " p-false"}" data-row="${row.index}" data-testid="logic-row-${row.index}">
            <th scope="row">${row.index}</th>
            ${cells}
            <td class="logic-cell-result ${row.predicate ? "is-true" : "is-false"}">${row.predicate ? "T" : "F"}</td>
          </tr>
        `;
      }).join("");
      return `
      <table class="logic-truth-table" data-testid="logic-truth-table">
        <thead>
          <tr>
            <th scope="col">#</th>
            ${headerCells}
            <th scope="col">P</th>
          </tr>
        </thead>
        <tbody>${bodyRows}</tbody>
      </table>
    `;
    }
    function renderSummary() {
      var _a2;
      if (state.error || !state.analysis) {
        return "";
      }
      const set = getActiveSet();
      if (!set) return "";
      const seenRows = /* @__PURE__ */ new Set();
      const annotated = set.tests.map((t2) => {
        const key = `r${t2.row.index}`;
        const isDuplicate = seenRows.has(key);
        if (!isDuplicate) seenRows.add(key);
        return { test: t2, isDuplicate };
      });
      const totalCount = annotated.length;
      const duplicateCount = annotated.filter((item) => item.isDuplicate).length;
      const uniqueCount = totalCount - duplicateCount;
      const testList = annotated.map(({ test, isDuplicate }) => `
        <li class="logic-test-item${isDuplicate ? " duplicate" : ""}" data-testid="logic-test-${escapeHtml2(test.id)}">
          <span class="logic-test-row">#${test.row.index}</span>
          <span class="logic-test-values">${state.analysis.clauses.map((c) => `${c}=${test.row.values[c] ? "T" : "F"}`).join(", ")}</span>
          <span class="logic-test-pred ${test.row.predicate ? "is-true" : "is-false"}">P=${test.row.predicate ? "T" : "F"}</span>
          <span class="logic-test-label">${escapeHtml2(test.label)}</span>
          ${isDuplicate ? `<span class="logic-test-dup-tag" aria-label="${t("logic.duplicate")}">${t("logic.duplicate")}</span>` : ""}
        </li>
      `).join("");
      const unsatisfied = ((_a2 = set.unsatisfied) == null ? void 0 : _a2.length) ? `<p class="logic-unsatisfied" data-testid="logic-unsatisfied">${t("logic.unsatisfied", { items: set.unsatisfied.join(", ") })}</p>` : "";
      const dnfMarkup = ["ic", "utpc", "mutpc", "nfpc", "mnfpc", "cutpnfp"].includes(set.id) && state.analysis.dnf ? `<p class="logic-dnf" data-testid="logic-dnf">${t("logic.dnfPrefix")}${dnfToHtml(state.analysis.dnf)}
          <span class="logic-dnf-alt">${t("logic.textbookOpen")}${dnfToCompactHtml(state.analysis.dnf)}${t("logic.textbookClose")}</span>
        </p>${set.id === "ic" && state.analysis.negDnf ? `<p class="logic-dnf" data-testid="logic-dnf-neg">${t("logic.dnfNegPrefix")}${dnfToHtml(state.analysis.negDnf)}
                <span class="logic-dnf-alt">${t("logic.textbookOpen")}${dnfToCompactHtml(state.analysis.negDnf)}${t("logic.textbookClose")}</span>
              </p>` : ""}` : "";
      const kmapMarkup = state.parsed && (set.id === "ic" || set.id === "utpc" || set.id === "mutpc" || set.id === "nfpc" || set.id === "mnfpc" || set.id === "cutpnfp") ? set.id === "ic" ? (() => {
        const posTests = set.tests.filter((t2) => t2.polarity === "pos");
        const negTests = set.tests.filter((t2) => t2.polarity === "neg");
        const posGroups = buildImplicantGroups(
          state.analysis.rows,
          state.analysis.dnf || [],
          true,
          0,
          posTests
        );
        const negGroups = buildImplicantGroups(
          state.analysis.rows,
          state.analysis.negDnf || [],
          false,
          (state.analysis.dnf || []).length,
          negTests
        );
        const posTestSet = new Set(posTests.map((t2) => t2.row.index));
        const negTestSet = new Set(negTests.map((t2) => t2.row.index));
        return `<div class="logic-kmap-row">
                ${renderKMap(
          state.analysis.rows,
          state.parsed.clauses,
          true,
          t("logic.kmap.title.fStar"),
          { highlightedMinterms: posTestSet, implicantGroups: posGroups, highlightLabel: "test" }
        )}
                ${renderKMap(
          state.analysis.rows,
          state.parsed.clauses,
          false,
          t("logic.kmap.title.fNegStar"),
          { highlightedMinterms: negTestSet, implicantGroups: negGroups, highlightLabel: "test" }
        )}
              </div>`;
      })() : set.id === "utpc" ? `<div class="logic-kmap-row">
                ${renderKMap(
        state.analysis.rows,
        state.parsed.clauses,
        true,
        t("logic.kmap.title.utp"),
        { highlightedMinterms: new Set(set.tests.map((t2) => t2.row.index)) }
      )}
              </div>` : set.id === "mutpc" ? (() => {
        const dnf = state.analysis.dnf || [];
        const groups = buildImplicantGroups(state.analysis.rows, dnf, true, 0, set.tests);
        return `<div class="logic-kmap-row">
                  ${renderKMap(
          state.analysis.rows,
          state.parsed.clauses,
          true,
          t("logic.kmap.title.mutp"),
          {
            highlightedMinterms: new Set(set.tests.map((t2) => t2.row.index)),
            implicantGroups: groups,
            highlightLabel: "MUTP"
          }
        )}
                </div>`;
      })() : set.id === "nfpc" || set.id === "mnfpc" ? (() => {
        const dnf = state.analysis.dnf || [];
        const groups = buildImplicantGroups(state.analysis.rows, dnf, true, 0, []);
        const nfpMarks = /* @__PURE__ */ new Map();
        const ntpMarks = /* @__PURE__ */ new Map();
        set.tests.forEach((test) => {
          const color = IMPLICANT_PALETTE[test.implicantIndex % IMPLICANT_PALETTE.length];
          const termText = termToString(dnf[test.implicantIndex] || []);
          const litText = test.literal ? `${test.literal.negated ? "!" : ""}${test.literal.name}` : "";
          const label = t("logic.flipLabel", { term: termText, lit: litText });
          nfpMarks.set(test.row.index, { color, label });
          if (typeof test.pairedTruePointIndex === "number") {
            ntpMarks.set(test.pairedTruePointIndex, { color, label });
          }
        });
        const titleText = set.id === "mnfpc" ? t("logic.kmap.title.mnfp") : t("logic.kmap.title.nfp");
        return `<div class="logic-kmap-row">
                  ${renderKMap(
          state.analysis.rows,
          state.parsed.clauses,
          true,
          titleText,
          { implicantGroups: groups, nfpMarks, ntpMarks, highlightLabel: "test" }
        )}
                </div>`;
      })() : (() => {
        const dnf = state.analysis.dnf || [];
        const groups = buildImplicantGroups(state.analysis.rows, dnf, true, 0, []);
        const nfpMarks = /* @__PURE__ */ new Map();
        const ntpMarks = /* @__PURE__ */ new Map();
        const testRowSet = /* @__PURE__ */ new Set();
        set.tests.forEach((test) => {
          const color = IMPLICANT_PALETTE[test.implicantIndex % IMPLICANT_PALETTE.length];
          const termText = termToString(dnf[test.implicantIndex] || []);
          const litText = test.literal ? `${test.literal.negated ? "!" : ""}${test.literal.name}` : "";
          const label = t("logic.flipLabel", { term: termText, lit: litText });
          testRowSet.add(test.row.index);
          if (test.role === "utp") {
            ntpMarks.set(test.row.index, { color, label });
          } else {
            nfpMarks.set(test.row.index, { color, label });
          }
        });
        return `<div class="logic-kmap-row">
                  ${renderKMap(
          state.analysis.rows,
          state.parsed.clauses,
          true,
          t("logic.kmap.title.cutpnfp"),
          {
            implicantGroups: groups,
            nfpMarks,
            ntpMarks,
            highlightedMinterms: testRowSet,
            highlightLabel: "test"
          }
        )}
                </div>`;
      })() : "";
      return `
      <h3 class="logic-summary-title">${escapeHtml2(set.name)}</h3>
      <p class="logic-summary-desc">${escapeHtml2(set.description || "")}</p>
      ${dnfMarkup}
      ${kmapMarkup}
      <p class="logic-summary-stats">
        ${t("logic.metric.total")}<strong data-testid="logic-test-count">${totalCount}</strong>
        <span class="logic-divider">\xB7</span>
        ${t("logic.metric.unique")}<strong data-testid="logic-test-unique-count">${uniqueCount}</strong>
        <span class="logic-divider">\xB7</span>
        ${t("logic.metric.duplicate")}<strong data-testid="logic-test-duplicate-count">${duplicateCount}</strong>
        <span class="logic-divider">\xB7</span>
        ${t("logic.metric.requirements")}<strong>${set.requirementCount}</strong>
      </p>
      <ol class="logic-test-list">${testList}</ol>
      ${unsatisfied}
    `;
    }
    function bindEvents() {
      const input = root2.querySelector('[data-testid="logic-expression-input"]');
      if (input) {
        input.addEventListener("input", (event) => {
          state.expression = event.target.value;
          recompute();
          renderPreservingFocus("logic-expression-input");
        });
        input.addEventListener("blur", () => {
          if (rememberCurrentExpression()) render();
        });
        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (rememberCurrentExpression()) render();
          }
        });
      }
      root2.querySelectorAll("[data-expression]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.expression = btn.dataset.expression;
          recompute();
          render();
        });
      });
      root2.querySelectorAll("[data-recent-select]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.expression = btn.dataset.recentSelect;
          recompute();
          render();
        });
      });
      root2.querySelectorAll("[data-recent-remove]").forEach((btn) => {
        btn.addEventListener("click", (event) => {
          event.stopPropagation();
          removeRecent(btn.dataset.recentRemove);
        });
      });
      root2.querySelectorAll("[data-criterion]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.selectedCriterion = btn.dataset.criterion;
          render();
        });
      });
    }
    function renderPreservingFocus(testid) {
      const previouslyFocused = root2.querySelector(`[data-testid="${testid}"]`);
      const selectionStart = previouslyFocused == null ? void 0 : previouslyFocused.selectionStart;
      const selectionEnd = previouslyFocused == null ? void 0 : previouslyFocused.selectionEnd;
      render();
      const next = root2.querySelector(`[data-testid="${testid}"]`);
      if (next) {
        next.focus();
        if (typeof selectionStart === "number" && typeof selectionEnd === "number" && next.setSelectionRange) {
          next.setSelectionRange(selectionStart, selectionEnd);
        }
      }
    }
    recompute();
    render();
    if (cloudClient && typeof cloudClient.subscribeAuthState === "function") {
      cloudClient.subscribeAuthState(async (user) => {
        state.cloudUser = user || null;
        if (!user || typeof cloudClient.loadLogicRecent !== "function") {
          return;
        }
        try {
          const remote = await cloudClient.loadLogicRecent(user.uid);
          const merged = [];
          const seen = /* @__PURE__ */ new Set();
          [...remote, ...state.recent].forEach((expr) => {
            if (typeof expr !== "string") return;
            if (seen.has(expr)) return;
            seen.add(expr);
            merged.push(expr);
          });
          const next = merged.slice(0, RECENT_LIMIT);
          const changed = next.length !== state.recent.length || next.some((v, i) => v !== state.recent[i]);
          state.recent = next;
          saveRecent(state.recent);
          if (next.length !== remote.length || next.some((v, i) => v !== remote[i])) {
            pushRecentToCloud(state.recent);
          }
          if (changed) render();
        } catch {
        }
      });
    }
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
          aria-label="${isPlaying ? t("flow.pause") : t("flow.play")}"
        >
          ${isPlaying ? `\u23F8 ${t("flow.pause")}` : `\u25B6 ${t("flow.play")}`}
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
              aria-label="${t("flow.step", { n: index + 1, label: pickField(step, "label") })}"
            >
              <div class="flow-step-num">${index + 1}</div>
              <div class="flow-step-icon">${step.icon}</div>
              <div class="flow-step-label">${pickField(step, "label")}</div>
              <div class="flow-step-label-en">${getLocale() === "zh" ? step.labelEn : ""}</div>
              ${hoveredStep === index || activeStep === index ? `
                <div class="flow-step-tooltip" data-testid="flow-tooltip-${step.id}">${pickField(step, "description")}</div>
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
      <div class="flow-progress-label">${t("flow.progress", { current: activeStep + 1, total: testingFlow.length, label: pickField(testingFlow[activeStep], "label") })}</div>
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
      <h3 class="pyramid-title">${t("types.pyramid.title")}</h3>
      <div class="pyramid" data-testid="pyramid">
        ${[...testingTypes].reverse().map((type, index) => `
          <div
            class="pyramid-row"
            data-testid="pyramid-row-${type.id}"
            style="--row-color: ${type.color}; --row-width: ${type.width}%; animation-delay: ${index * 0.12}s"
          >
            <span class="pyramid-row-label">${pickField(type, "type")}</span>
            <span class="pyramid-row-en">${getLocale() === "zh" ? type.typeEn : ""}</span>
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
              <h4 class="type-name">${pickField(type, "type")}</h4>
              <span class="type-name-en">${getLocale() === "zh" ? type.typeEn : ""}</span>
            </div>
            <div class="type-detail">
              <div class="type-detail-row">
                <span class="type-detail-label">${t("types.col.purpose")}</span>
                <span class="type-detail-value">${pickField(type, "purpose")}</span>
              </div>
              <div class="type-detail-row">
                <span class="type-detail-label">${t("types.col.timing")}</span>
                <span class="type-detail-value">${pickField(type, "timing")}</span>
              </div>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
    return root2;
  }

  // src/components/CloudStoragePanel.js
  var DEFAULT_SETTINGS = {
    preferredCriterion: "node",
    notes: "",
    extras: {}
  };
  function formatJson(value) {
    return JSON.stringify(value, null, 2);
  }
  function parseJson(value) {
    if (!value.trim()) {
      return {};
    }
    return JSON.parse(value);
  }
  function createCloudStoragePanel() {
    const root2 = document.createElement("div");
    const client = createCloudIntegrationClient();
    const canUseCloudAuth = client.isConfigured && client.isSupportedOrigin;
    let user = null;
    let status = canUseCloudAuth ? t("cloud.signInPrompt") : client.isSupportedOrigin ? t("cloud.firebaseMissing", { keys: client.missingKeys.join(", ") }) : client.originWarning;
    let settings = { ...DEFAULT_SETTINGS };
    let uploadedFiles = [];
    let selectedFile = null;
    let driveFiles = [];
    let driveFilesLoading = false;
    function render() {
      var _a2, _b;
      root2.className = "cloud-storage";
      root2.dataset.testid = "cloud-storage-panel";
      root2.innerHTML = `
      <div class="cloud-card">
        <div class="cloud-header">
          <div>
            <p class="cloud-kicker">${t("cloud.kicker")}</p>
            <h3>${t("cloud.title")}</h3>
            <p class="cloud-subtitle">${t("cloud.subtitle")}</p>
            ${!client.isSupportedOrigin ? `<p class="cloud-warning" data-testid="cloud-origin-warning">${t("cloud.fileWarning")}</p>` : ""}
          </div>
          <div class="cloud-auth-actions">
            ${user ? `<span class="cloud-signed-in" data-testid="cloud-signed-in">${t("common.signedIn")}</span>` : `<button type="button" class="cloud-btn" data-testid="cloud-signin-btn" ${!canUseCloudAuth ? "disabled" : ""}>${t("common.googleSignIn")}</button>`}
            <button type="button" class="cloud-btn cloud-btn--secondary" data-testid="cloud-signout-btn" ${!user ? "disabled" : ""}>${t("common.signOut")}</button>
          </div>
        </div>

        <div class="cloud-meta">
          <p data-testid="cloud-status">${status}</p>
          <p data-testid="cloud-user">${user ? t("cloud.userPrefix", { name: user.email || user.uid }) : t("common.notSignedIn")}</p>
        </div>

        <div class="cloud-grid">
          <section class="cloud-section">
            <h4>${t("cloud.section.settings")}</h4>
            <label>
              ${t("cloud.preferredCriterion")}
              <select data-testid="cloud-criterion-select">
                ${graphCoverageCriteria.map((criterion) => `
                  <option value="${criterion.id}"${settings.preferredCriterion === criterion.id ? " selected" : ""}>${pickField(criterion, "label")}</option>
                `).join("")}
              </select>
            </label>

            <label>
              ${t("cloud.notes")}
              <textarea data-testid="cloud-notes-input">${settings.notes || ""}</textarea>
            </label>

            <label>
              ${t("cloud.extras")}
              <textarea data-testid="cloud-extras-input">${formatJson(settings.extras || {})}</textarea>
            </label>

            <div class="cloud-actions-row">
              <button type="button" class="cloud-btn" data-testid="cloud-load-settings-btn" ${!user ? "disabled" : ""}>${t("cloud.loadSettings")}</button>
              <button type="button" class="cloud-btn" data-testid="cloud-save-settings-btn" ${!user ? "disabled" : ""}>${t("cloud.saveSettings")}</button>
            </div>
          </section>

          <section class="cloud-section">
            <h4>${t("cloud.section.files")}</h4>
            <div class="cloud-file-picker">
              <span>${t("cloud.uploadHint")}</span>
              <button type="button" class="cloud-file-btn" data-testid="cloud-file-btn" ${!user ? "disabled" : ""}>${t("common.chooseFile")}</button>
              <input type="file" data-testid="cloud-file-input" class="sr-only" ${!user ? "disabled" : ""} />
            </div>
            <p data-testid="cloud-file-name">${selectedFile ? t("cloud.pendingUpload", { name: selectedFile.name }) : t("cloud.noFileSelected")}</p>
            <button type="button" class="cloud-btn" data-testid="cloud-upload-btn" ${!selectedFile || !user ? "disabled" : ""}>${t("cloud.upload")}</button>

            <ul class="cloud-upload-list" data-testid="cloud-upload-list">
              ${uploadedFiles.map((item, idx) => `<li>
                <div class="cloud-upload-row">
                  <strong>${item.name}</strong>${item.webViewLink ? ` \xB7 <a href="${item.webViewLink}" target="_blank" rel="noreferrer">${t("cloud.openFile")}</a>` : ""}
                </div>
                <div class="cloud-upload-actions">
                  <button type="button" class="cloud-btn cloud-btn--small" data-use-target="mutation" data-use-idx="${idx}">${t("cloud.useForMutation")}</button>
                  <button type="button" class="cloud-btn cloud-btn--small" data-use-target="graph" data-use-idx="${idx}">${t("cloud.useForGraph")}</button>
                  <button type="button" class="cloud-btn cloud-btn--small" data-use-target="grammar" data-use-idx="${idx}">${t("cloud.useForGrammar")}</button>
                </div>
              </li>`).join("") || `<li>${t("cloud.noFiles")}</li>`}
            </ul>

            <div class="cloud-drive-list-header">
              <h5>${t("cloud.driveFilesTitle")}</h5>
              <button type="button" class="cloud-btn cloud-btn--small" data-testid="cloud-refresh-drive-btn" ${!user ? "disabled" : ""}>${driveFilesLoading ? t("cloud.refreshing") : t("cloud.refreshDriveFiles")}</button>
            </div>
            <ul class="cloud-drive-list" data-testid="cloud-drive-list">
              ${driveFiles.length === 0 ? `<li class="cloud-drive-empty">${user ? driveFilesLoading ? t("cloud.refreshing") : t("cloud.noDriveFiles") : t("cloud.signInToList")}</li>` : driveFiles.map((f, idx) => `<li>
                    <div class="cloud-upload-row">
                      <strong>${f.name}</strong>${f.modifiedTime ? ` \xB7 <span class="cloud-drive-time">${new Date(f.modifiedTime).toLocaleString()}</span>` : ""}${f.webViewLink ? ` \xB7 <a href="${f.webViewLink}" target="_blank" rel="noreferrer">${t("cloud.openFile")}</a>` : ""}
                    </div>
                    <div class="cloud-upload-actions">
                      <button type="button" class="cloud-btn cloud-btn--small" data-drive-target="mutation" data-drive-idx="${idx}">${t("cloud.useForMutation")}</button>
                      <button type="button" class="cloud-btn cloud-btn--small" data-drive-target="graph" data-drive-idx="${idx}">${t("cloud.useForGraph")}</button>
                      <button type="button" class="cloud-btn cloud-btn--small" data-drive-target="grammar" data-drive-idx="${idx}">${t("cloud.useForGrammar")}</button>
                    </div>
                  </li>`).join("")}
            </ul>
          </section>
        </div>
      </div>
    `;
      (_a2 = root2.querySelector('[data-testid="cloud-signin-btn"]')) == null ? void 0 : _a2.addEventListener("click", async () => {
        try {
          const result = await client.signInWithGoogle();
          user = result.user;
          status = result.hasDriveToken ? t("cloud.signedInOk") : t("cloud.signedInNoDrive");
          ;
          render();
        } catch (error) {
          status = error.message;
          render();
        }
      });
      root2.querySelector('[data-testid="cloud-signout-btn"]').addEventListener("click", async () => {
        try {
          await client.signOutGoogle();
          user = null;
          selectedFile = null;
          status = t("cloud.signedOut");
          ;
          render();
        } catch (error) {
          status = error.message;
          render();
        }
      });
      root2.querySelector('[data-testid="cloud-criterion-select"]').addEventListener("change", (event) => {
        settings.preferredCriterion = event.target.value;
      });
      root2.querySelector('[data-testid="cloud-notes-input"]').addEventListener("input", (event) => {
        settings.notes = event.target.value;
      });
      root2.querySelector('[data-testid="cloud-file-btn"]').addEventListener("click", () => {
        root2.querySelector('[data-testid="cloud-file-input"]').click();
      });
      root2.querySelector('[data-testid="cloud-file-input"]').addEventListener("change", (event) => {
        [selectedFile] = event.target.files || [];
        render();
      });
      root2.querySelector('[data-testid="cloud-load-settings-btn"]').addEventListener("click", async () => {
        try {
          const loaded = await client.loadSettings(user.uid);
          if (loaded) {
            settings = {
              preferredCriterion: loaded.preferredCriterion || "node",
              notes: loaded.notes || "",
              extras: loaded.extras || {}
            };
            status = t("cloud.loadedOk");
          } else {
            status = t("cloud.noSavedSettings");
          }
          render();
        } catch (error) {
          status = error.message;
          render();
        }
      });
      root2.querySelector('[data-testid="cloud-save-settings-btn"]').addEventListener("click", async () => {
        try {
          const extras = parseJson(root2.querySelector('[data-testid="cloud-extras-input"]').value);
          settings.extras = extras;
          await client.saveSettings(user.uid, settings);
          status = t("cloud.savedOk");
          render();
        } catch (error) {
          status = error.message.includes("JSON") ? t("cloud.extrasJsonError") : error.message;
          render();
        }
      });
      root2.querySelector('[data-testid="cloud-upload-btn"]').addEventListener("click", async () => {
        try {
          const fileToUpload = selectedFile;
          let content = null;
          try {
            if (typeof fileToUpload.text === "function") {
              content = await fileToUpload.text();
            } else if (typeof FileReader !== "undefined") {
              content = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ""));
                reader.onerror = () => reject(reader.error);
                reader.readAsText(fileToUpload);
              });
            }
          } catch {
            content = null;
          }
          const uploaded = await client.uploadFileToDrive(fileToUpload);
          uploadedFiles = [{ ...uploaded, content, fileName: fileToUpload.name, file: fileToUpload }, ...uploadedFiles].slice(0, 8);
          status = t("cloud.uploadedOk", { name: uploaded.name });
          selectedFile = null;
          render();
        } catch (error) {
          status = error.message;
          render();
        }
      });
      root2.querySelectorAll("[data-use-target]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          var _a3, _b2;
          const idx = Number(btn.dataset.useIdx);
          const target = btn.dataset.useTarget;
          const item = uploadedFiles[idx];
          if (!item) return;
          let content = item.content;
          if (content == null && item.file) {
            try {
              content = typeof item.file.text === "function" ? await item.file.text() : await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ""));
                reader.onerror = () => reject(reader.error);
                reader.readAsText(item.file);
              });
              item.content = content;
            } catch (err) {
              status = t("cloud.readError", { msg: (err == null ? void 0 : err.message) || err });
              render();
              return;
            }
          }
          if (content == null) {
            status = t("cloud.noContent");
            render();
            return;
          }
          const sectionId = target === "graph" ? "section-graph" : "section-syntax";
          const targetSection = (_a3 = globalThis.document) == null ? void 0 : _a3.querySelector(`[data-testid="${sectionId}"]`);
          targetSection == null ? void 0 : targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
          (_b2 = globalThis.dispatchEvent) == null ? void 0 : _b2.call(globalThis, new CustomEvent("stvisual:load-program-source", {
            detail: { target, name: item.fileName || item.name, content }
          }));
          status = target === "mutation" ? t("cloud.sentToMutation", { name: item.name }) : target === "grammar" ? t("cloud.sentToGrammar", { name: item.name }) : t("cloud.sentToGraph", { name: item.name });
          render();
        });
      });
      (_b = root2.querySelector('[data-testid="cloud-refresh-drive-btn"]')) == null ? void 0 : _b.addEventListener("click", async () => {
        if (!user || typeof client.listDriveFiles !== "function") return;
        driveFilesLoading = true;
        status = t("cloud.refreshing");
        render();
        try {
          driveFiles = await client.listDriveFiles();
          status = t("cloud.driveListed", { count: driveFiles.length });
        } catch (err) {
          status = t("cloud.driveListError", { msg: (err == null ? void 0 : err.message) || err });
        } finally {
          driveFilesLoading = false;
          render();
        }
      });
      root2.querySelectorAll("[data-drive-target]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          var _a3, _b2;
          const idx = Number(btn.dataset.driveIdx);
          const target = btn.dataset.driveTarget;
          const f = driveFiles[idx];
          if (!f) return;
          try {
            status = t("cloud.downloading", { name: f.name });
            render();
            const content = await client.downloadDriveFile(f.id);
            const sectionId = target === "graph" ? "section-graph" : "section-syntax";
            const targetSection = (_a3 = globalThis.document) == null ? void 0 : _a3.querySelector(`[data-testid="${sectionId}"]`);
            targetSection == null ? void 0 : targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
            (_b2 = globalThis.dispatchEvent) == null ? void 0 : _b2.call(globalThis, new CustomEvent("stvisual:load-program-source", {
              detail: { target, name: f.name, content }
            }));
            status = target === "mutation" ? t("cloud.sentToMutation", { name: f.name }) : target === "grammar" ? t("cloud.sentToGrammar", { name: f.name }) : t("cloud.sentToGraph", { name: f.name });
          } catch (err) {
            status = t("cloud.readError", { msg: (err == null ? void 0 : err.message) || err });
          }
          render();
        });
      });
    }
    client.subscribeAuthState(async (nextUser) => {
      user = nextUser;
      if (!user && canUseCloudAuth) {
        status = t("cloud.signInPrompt");
        driveFiles = [];
      } else if (user && typeof client.listDriveFiles === "function") {
        try {
          driveFiles = await client.listDriveFiles();
        } catch {
        }
      }
      render();
    });
    render();
    return root2;
  }

  // src/data/mutationData.js
  var mutationOperators = [
    { id: "AOR", label: "Arithmetic Operator Replacement", desc: "\u66FF\u63DB + - * / % \u7B49\u7B97\u8853\u904B\u7B97\u5B50\u3002", labelEn: "Arithmetic Operator Replacement", descEn: "Replace + - * / % arithmetic operators." },
    { id: "ROR", label: "Relational Operator Replacement", desc: "\u66FF\u63DB < <= > >= == != === !==\u3002", labelEn: "Relational Operator Replacement", descEn: "Replace < <= > >= == != === !==." },
    { id: "LOR", label: "Logical Operator Replacement", desc: "\u66FF\u63DB && \u8207 ||\u3002", labelEn: "Logical Operator Replacement", descEn: "Replace && and ||." },
    { id: "COR", label: "Conditional Operator Replacement", desc: "\u66FF\u63DB\u689D\u4EF6\u904B\u7B97\u5B50\uFF08\u8207 LOR \u76F8\u540C\u96C6\u5408\uFF09\u3002", labelEn: "Conditional Operator Replacement", descEn: "Replace conditional operators (same set as LOR)." },
    { id: "SOR", label: "Shift Operator Replacement", desc: "\u66FF\u63DB << >> >>> \u4F4D\u79FB\u904B\u7B97\u5B50\u3002", labelEn: "Shift Operator Replacement", descEn: "Replace << >> >>> shift operators." },
    { id: "ASR", label: "Assignment Operator Replacement", desc: "\u66FF\u63DB += -= *= /= %= <<= >>= >>>= &= |= ^= \u8907\u5408\u6307\u6D3E\u3002", labelEn: "Assignment Operator Replacement", descEn: "Replace += -= *= /= %= <<= >>= >>>= &= |= ^= compound assignments." },
    { id: "UOI", label: "Unary Operator Insertion", desc: "\u5728\u8B58\u5225\u5B57\u524D\u63D2\u5165 ! \u6216 -\u3002", labelEn: "Unary Operator Insertion", descEn: "Insert ! or - before identifiers." },
    { id: "UOD", label: "Unary Operator Deletion", desc: "\u522A\u9664 expression \u524D\u7684\u4E00\u5143\u904B\u7B97\u5B50\uFF08!\u3001-\u3001+\u3001~\uFF09\u3002", labelEn: "Unary Operator Deletion", descEn: "Delete a leading unary operator (!, -, +, ~) before an expression." },
    { id: "SVR", label: "Scalar Variable Replacement", desc: "\u628A\u8B58\u5225\u5B57\u66FF\u63DB\u70BA\u53E6\u4E00\u500B in-scope \u8B58\u5225\u5B57\u3002", labelEn: "Scalar Variable Replacement", descEn: "Replace an identifier with another in-scope identifier." },
    { id: "BSR", label: "Bomb Statement Replacement", desc: "\u628A\u6574\u884C\u9673\u8FF0\u66FF\u63DB\u6210 throw\uFF08\u5FC5\u88AB\u4EFB\u4F55 test \u6BBA\u6B7B\uFF09\u3002", labelEn: "Bomb Statement Replacement", descEn: "Replace a whole statement with throw (always killed by any test that runs it)." },
    { id: "ABS", label: "Absolute Value Insertion", desc: "\u628A\u8B58\u5225\u5B57\u5305\u6210 Math.abs(x) \u6216 -(x)\u3002", labelEn: "Absolute Value Insertion", descEn: "Wrap an identifier as Math.abs(x) or -(x)." },
    // Object-Oriented mutation operators
    { id: "JTD", label: "OO: this Deletion", desc: "\u522A\u9664 `this.` \u524D\u7DB4\uFF0C\u5E38\u7528\u4EE5\u66B4\u9732\u907A\u6F0F\u6210\u54E1\u5B58\u53D6\u7684\u6E2C\u8A66\u3002", labelEn: "OO: this Deletion", descEn: "Delete the `this.` prefix to expose tests that miss member access." },
    { id: "ISD", label: "OO: super Call Deletion", desc: "\u628A `super(...)` \u6216 `super.method(...)` \u6574\u6BB5\u547C\u53EB\u66FF\u63DB\u70BA undefined\u3002", labelEn: "OO: super Call Deletion", descEn: "Replace `super(...)` or `super.method(...)` calls with undefined." },
    { id: "IOD", label: "OO: Overriding Method Deletion", desc: "\u522A\u9664 class \u5167\u975E constructor \u7684\u6574\u500B\u65B9\u6CD5\u5B9A\u7FA9\uFF0C\u8FEB\u4F7F\u547C\u53EB fallback \u81F3\u7236\u985E\u5225\u3002", labelEn: "OO: Overriding Method Deletion", descEn: "Delete a non-constructor class method, falling back to the parent class." },
    { id: "PRV", label: "OO: Reference Type Change", desc: "\u628A `new ClassA(...)` \u63DB\u6210\u540C\u6A94\u6848\u5167\u5176\u4ED6 class\uFF0C\u4F8B\u5982 `new ClassB(...)`\u3002", labelEn: "OO: Reference Type Change", descEn: "Replace `new ClassA(...)` with another in-file class, e.g. `new ClassB(...)`." }
  ];
  var programExamples = [
    {
      id: "max",
      name: "max(a, b)",
      params: ["a", "b"],
      body: "return a > b ? a : b;",
      description: "\u56DE\u50B3\u5169\u6578\u4E2D\u8F03\u5927\u8005\u3002",
      descriptionEn: "Returns the larger of two numbers.",
      tests: [
        { id: "t1", args: [3, 5], expected: 5 },
        { id: "t2", args: [7, 2], expected: 7 },
        { id: "t3", args: [4, 4], expected: 4 },
        { id: "t4", args: [-1, -3], expected: -1 }
      ]
    },
    {
      id: "isLeapYear",
      name: "isLeapYear(y)",
      params: ["y"],
      body: "return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);",
      description: "\u5224\u65B7\u662F\u5426\u70BA\u958F\u5E74\u3002",
      descriptionEn: "Determines whether a year is a leap year.",
      tests: [
        { id: "t1", args: [2024], expected: true },
        { id: "t2", args: [1900], expected: false },
        { id: "t3", args: [2e3], expected: true },
        { id: "t4", args: [2023], expected: false }
      ]
    },
    {
      id: "triangle",
      name: "triangle(a, b, c)",
      params: ["a", "b", "c"],
      body: [
        'if (a <= 0 || b <= 0 || c <= 0) return "invalid";',
        'if (a + b <= c || a + c <= b || b + c <= a) return "invalid";',
        'if (a === b && b === c) return "equilateral";',
        'if (a === b || b === c || a === c) return "isosceles";',
        'return "scalene";'
      ].join("\n"),
      description: "\u4F9D\u4E09\u908A\u9577\u5224\u65B7\u4E09\u89D2\u5F62\u985E\u578B\u3002",
      descriptionEn: "Classifies a triangle by its three side lengths.",
      tests: [
        { id: "t1", args: [3, 3, 3], expected: "equilateral" },
        { id: "t2", args: [3, 3, 4], expected: "isosceles" },
        { id: "t3", args: [3, 4, 5], expected: "scalene" },
        { id: "t4", args: [1, 2, 5], expected: "invalid" },
        { id: "t5", args: [0, 1, 1], expected: "invalid" }
      ]
    },
    {
      id: "shapeHierarchy",
      name: "shape(kind, size)",
      params: ["kind", "size"],
      body: [
        "class Shape {",
        "  constructor(n) { this.n = n; }",
        "  area() { return 0; }",
        '  describe() { return "shape:" + this.area(); }',
        "}",
        "class Square extends Shape {",
        "  constructor(side) { super(side); this.side = side; }",
        "  area() { return this.side * this.side; }",
        "}",
        "class Circle extends Shape {",
        "  constructor(r) { super(r); this.r = r; }",
        "  area() { return Math.round(this.r * this.r * 3); }",
        "}",
        'if (kind === "sq") return new Square(size).describe();',
        'if (kind === "ci") return new Circle(size).describe();',
        'return "unknown";'
      ].join("\n"),
      description: "OO \u7BC4\u4F8B\uFF1AShape / Square / Circle \u7E7C\u627F\u968E\u5C64\uFF0C\u53EF\u793A\u7BC4 JTD\u3001ISD\u3001IOD\u3001PRV\u3002",
      descriptionEn: "OOP example: Shape / Square / Circle inheritance hierarchy, demonstrates JTD, ISD, IOD, PRV.",
      tests: [
        { id: "t1", args: ["sq", 3], expected: "shape:9" },
        { id: "t2", args: ["sq", 5], expected: "shape:25" },
        { id: "t3", args: ["ci", 2], expected: "shape:12" },
        { id: "t4", args: ["ci", 4], expected: "shape:48" },
        { id: "t5", args: ["xx", 1], expected: "unknown" }
      ]
    },
    {
      id: "nextDate",
      name: "nextDate(y, m, d)",
      params: ["y", "m", "d"],
      body: [
        "function isLeap(y) {",
        "  return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);",
        "}",
        "function daysInMonth(y, m) {",
        "  if (m === 2) return isLeap(y) ? 29 : 28;",
        "  if (m === 4 || m === 6 || m === 9 || m === 11) return 30;",
        "  return 31;",
        "}",
        'if (m < 1 || m > 12 || d < 1) return "invalid";',
        'if (d > daysInMonth(y, m)) return "invalid";',
        "if (d < daysInMonth(y, m)) return { y: y, m: m, d: d + 1 };",
        "if (m === 12) return { y: y + 1, m: 1, d: 1 };",
        "return { y: y, m: m + 1, d: 1 };"
      ].join("\n"),
      description: "\u56DE\u50B3\u4E0B\u4E00\u5929\uFF0C\u8655\u7406\u6708\u5E95\u8207\u5E74\u5E95\u8DE8\u5E74\u3002",
      descriptionEn: "Returns the next date, handling month-end and year-end rollovers.",
      tests: [
        { id: "t1", args: [2024, 1, 15], expected: { y: 2024, m: 1, d: 16 } },
        { id: "t2", args: [2024, 1, 31], expected: { y: 2024, m: 2, d: 1 } },
        { id: "t3", args: [2024, 2, 28], expected: { y: 2024, m: 2, d: 29 } },
        { id: "t4", args: [2023, 2, 28], expected: { y: 2023, m: 3, d: 1 } },
        { id: "t5", args: [2024, 12, 31], expected: { y: 2025, m: 1, d: 1 } },
        { id: "t6", args: [2024, 13, 1], expected: "invalid" },
        { id: "t7", args: [2024, 4, 31], expected: "invalid" }
      ]
    },
    {
      id: "nextWeek",
      name: "nextWeek(y, m, d)",
      params: ["y", "m", "d"],
      body: [
        "function isLeap(y) {",
        "  return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);",
        "}",
        "function daysInMonth(y, m) {",
        "  if (m === 2) return isLeap(y) ? 29 : 28;",
        "  if (m === 4 || m === 6 || m === 9 || m === 11) return 30;",
        "  return 31;",
        "}",
        'if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) return "invalid";',
        "var nd = d + 7;",
        "var nm = m;",
        "var ny = y;",
        "var limit = daysInMonth(ny, nm);",
        "if (nd > limit) {",
        "  nd = nd - limit;",
        "  if (nm === 12) { nm = 1; ny = ny + 1; } else { nm = nm + 1; }",
        "}",
        "return { y: ny, m: nm, d: nd };"
      ].join("\n"),
      description: "\u628A\u65E5\u671F\u52A0 7 \u5929\uFF0C\u8DE8\u6708/\u8DE8\u5E74\u3002",
      descriptionEn: "Adds 7 days to a date, handling month/year rollovers.",
      tests: [
        { id: "t1", args: [2024, 1, 1], expected: { y: 2024, m: 1, d: 8 } },
        { id: "t2", args: [2024, 1, 28], expected: { y: 2024, m: 2, d: 4 } },
        { id: "t3", args: [2024, 2, 25], expected: { y: 2024, m: 3, d: 3 } },
        { id: "t4", args: [2023, 2, 25], expected: { y: 2023, m: 3, d: 4 } },
        { id: "t5", args: [2024, 12, 28], expected: { y: 2025, m: 1, d: 4 } },
        { id: "t6", args: [2024, 0, 1], expected: "invalid" }
      ]
    }
  ];

  // src/utils/mutation.js
  var OPERATORS = {
    AOR: ["+", "-", "*", "/", "%"],
    ROR: ["<", "<=", ">", ">=", "==", "!=", "===", "!=="],
    LOR: ["&&", "||"],
    COR: ["&&", "||"],
    // 同 LOR，但與 ! 一同套用時為條件運算的補集
    SOR: ["<<", ">>", ">>>"],
    ASR: ["+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^="]
  };
  var SORTED = {
    AOR: [...OPERATORS.AOR].sort((a, b) => b.length - a.length),
    ROR: [...OPERATORS.ROR].sort((a, b) => b.length - a.length),
    LOR: [...OPERATORS.LOR].sort((a, b) => b.length - a.length),
    COR: [...OPERATORS.COR].sort((a, b) => b.length - a.length),
    SOR: [...OPERATORS.SOR].sort((a, b) => b.length - a.length),
    ASR: [...OPERATORS.ASR].sort((a, b) => b.length - a.length)
  };
  var ID_REGEX = /[A-Za-z_$][A-Za-z0-9_$]*/y;
  function buildSkipMap(source) {
    const skip = new Array(source.length).fill(false);
    let i = 0;
    while (i < source.length) {
      const ch = source[i];
      const next = source[i + 1];
      if (ch === "/" && next === "/") {
        while (i < source.length && source[i] !== "\n") {
          skip[i] = true;
          i += 1;
        }
      } else if (ch === "/" && next === "*") {
        while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) {
          skip[i] = true;
          i += 1;
        }
        if (i < source.length) {
          skip[i] = skip[i + 1] = true;
          i += 2;
        }
      } else if (ch === '"' || ch === "'" || ch === "`") {
        const quote = ch;
        skip[i] = true;
        i += 1;
        while (i < source.length && source[i] !== quote) {
          if (source[i] === "\\") {
            skip[i] = skip[i + 1] = true;
            i += 2;
          } else {
            skip[i] = true;
            i += 1;
          }
        }
        if (i < source.length) {
          skip[i] = true;
          i += 1;
        }
      } else {
        i += 1;
      }
    }
    return skip;
  }
  function lineColOf(source, index) {
    let line = 1;
    let col = 1;
    for (let i = 0; i < index && i < source.length; i += 1) {
      if (source[i] === "\n") {
        line += 1;
        col = 1;
      } else {
        col += 1;
      }
    }
    return { line, col };
  }
  function applyReplacement(source, start, end, replacement) {
    return source.slice(0, start) + replacement + source.slice(end);
  }
  function findOperatorOccurrences(source, operatorList, skip) {
    const hits = [];
    for (let i = 0; i < source.length; i += 1) {
      if (skip[i]) continue;
      for (const op of operatorList) {
        if (i + op.length > source.length) continue;
        if (source.slice(i, i + op.length) !== op) continue;
        const before = source[i - 1] || "";
        const after = source[i + op.length] || "";
        if (op === "=" || op.endsWith("=")) {
        }
        if (after === "=" && op.length === 1 && "+-*/%".includes(op)) continue;
        if (op === "*" && (before === "*" || after === "*")) continue;
        if ((op === "||" || op === "&&") && after === "=") continue;
        if (op === "<" && (after === "<" || before === "<")) continue;
        if (op === ">" && (after === ">" || before === ">")) continue;
        if ((op === "<<" || op === ">>" || op === ">>>") && after === "=") continue;
        if (op === "*=" && before === "*") continue;
        hits.push({ start: i, end: i + op.length, text: op });
        i += op.length - 1;
        break;
      }
    }
    return hits;
  }
  function findIdentifierOccurrences(source, skip) {
    const hits = [];
    let i = 0;
    while (i < source.length) {
      if (skip[i]) {
        i += 1;
        continue;
      }
      ID_REGEX.lastIndex = i;
      const m = ID_REGEX.exec(source);
      if (m && m.index === i) {
        const keywords = /* @__PURE__ */ new Set([
          "true",
          "false",
          "null",
          "undefined",
          "return",
          "if",
          "else",
          "for",
          "while",
          "do",
          "switch",
          "case",
          "break",
          "continue",
          "function",
          "var",
          "let",
          "const",
          "new",
          "typeof",
          "in",
          "of",
          "this"
        ]);
        if (!keywords.has(m[0])) {
          hits.push({ start: i, end: i + m[0].length, text: m[0] });
        }
        i += m[0].length;
      } else {
        i += 1;
      }
    }
    return hits;
  }
  function generateForOperator(source, opName, skip, idCounter) {
    const list = SORTED[opName];
    if (!list) return [];
    const hits = findOperatorOccurrences(source, list, skip);
    const mutants = [];
    hits.forEach((hit) => {
      list.forEach((replacement) => {
        if (replacement === hit.text) return;
        const mutated = applyReplacement(source, hit.start, hit.end, replacement);
        const { line, col } = lineColOf(source, hit.start);
        mutants.push({
          id: `M${idCounter.value++}`,
          operator: opName,
          line,
          col,
          original: hit.text,
          mutated: replacement,
          source: mutated,
          status: "live",
          killedBy: []
        });
      });
    });
    return mutants;
  }
  function generateUOI(source, skip, idCounter) {
    const hits = findIdentifierOccurrences(source, skip);
    const mutants = [];
    hits.forEach((hit) => {
      ["!", "-"].forEach((unary) => {
        const mutated = applyReplacement(source, hit.start, hit.end, `${unary}${hit.text}`);
        const { line, col } = lineColOf(source, hit.start);
        mutants.push({
          id: `M${idCounter.value++}`,
          operator: "UOI",
          line,
          col,
          original: hit.text,
          mutated: `${unary}${hit.text}`,
          source: mutated,
          status: "live",
          killedBy: []
        });
      });
    });
    return mutants;
  }
  function generateABS(source, skip, idCounter) {
    const hits = findIdentifierOccurrences(source, skip);
    const mutants = [];
    hits.forEach((hit) => {
      const variants = [
        { suffix: "abs", text: `Math.abs(${hit.text})` },
        { suffix: "neg", text: `(-(${hit.text}))` }
      ];
      variants.forEach(({ suffix, text }) => {
        const mutated = applyReplacement(source, hit.start, hit.end, text);
        const { line, col } = lineColOf(source, hit.start);
        mutants.push({
          id: `M${idCounter.value++}`,
          operator: "ABS",
          line,
          col,
          original: hit.text,
          mutated: text,
          source: mutated,
          status: "live",
          killedBy: [],
          variant: suffix
        });
      });
    });
    return mutants;
  }
  function generateUOD(source, skip, idCounter) {
    const mutants = [];
    const unary = /* @__PURE__ */ new Set(["!", "-", "+", "~"]);
    for (let i = 0; i < source.length; i += 1) {
      if (skip[i]) continue;
      const ch = source[i];
      if (!unary.has(ch)) continue;
      const next = source[i + 1] || "";
      if (next === "=" || next === ch) continue;
      let j = i - 1;
      while (j >= 0 && /\s/.test(source[j])) j -= 1;
      const prev = j >= 0 ? source[j] : "";
      const prevIsBoundary = j < 0 || "([{,;?:=&|<>!+-*/%~^".includes(prev) || /[A-Za-z]/.test(prev) === false && !/[0-9_$)\]]/.test(prev);
      if (/[A-Za-z0-9_$)\]]/.test(prev)) continue;
      if (!prevIsBoundary) continue;
      let k = i + 1;
      while (k < source.length && /\s/.test(source[k])) k += 1;
      const after = source[k] || "";
      if (!/[A-Za-z0-9_$(]/.test(after)) continue;
      const mutated = applyReplacement(source, i, i + 1, "");
      const { line, col } = lineColOf(source, i);
      mutants.push({
        id: `M${idCounter.value++}`,
        operator: "UOD",
        line,
        col,
        original: ch,
        mutated: "(deleted)",
        source: mutated,
        status: "live",
        killedBy: []
      });
    }
    return mutants;
  }
  function generateSVR(source, skip, idCounter) {
    const hits = findIdentifierOccurrences(source, skip);
    const names = Array.from(new Set(hits.map((h) => h.text)));
    if (names.length < 2) return [];
    const mutants = [];
    hits.forEach((hit) => {
      names.forEach((repl) => {
        if (repl === hit.text) return;
        const mutated = applyReplacement(source, hit.start, hit.end, repl);
        const { line, col } = lineColOf(source, hit.start);
        mutants.push({
          id: `M${idCounter.value++}`,
          operator: "SVR",
          line,
          col,
          original: hit.text,
          mutated: repl,
          source: mutated,
          status: "live",
          killedBy: []
        });
      });
    });
    return mutants;
  }
  function generateBSR(source, skip, idCounter) {
    const mutants = [];
    const lines = source.split("\n");
    let offset = 0;
    lines.forEach((line, idx) => {
      const start = offset;
      const end = offset + line.length;
      offset = end + 1;
      const trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed === "{" || trimmed === "}" || trimmed === "};") return;
      if (trimmed.startsWith("//")) return;
      if (trimmed.startsWith("/*") || trimmed.endsWith("*/")) return;
      if (trimmed.startsWith("function") || trimmed.startsWith("}")) return;
      const indent = line.match(/^\s*/)[0];
      const replacement = `${indent}throw new Error("BSR mutant");`;
      const mutated = source.slice(0, start) + replacement + source.slice(end);
      mutants.push({
        id: `M${idCounter.value++}`,
        operator: "BSR",
        line: idx + 1,
        col: indent.length + 1,
        original: trimmed,
        mutated: 'throw new Error("BSR mutant");',
        source: mutated,
        status: "live",
        killedBy: []
      });
    });
    return mutants;
  }
  function findCallEnd(source, openParenIdx) {
    let depth = 0;
    for (let i = openParenIdx; i < source.length; i += 1) {
      const ch = source[i];
      if (ch === "(") depth += 1;
      else if (ch === ")") {
        depth -= 1;
        if (depth === 0) return i + 1;
      }
    }
    return -1;
  }
  function findBlockEnd(source, openBraceIdx) {
    let depth = 0;
    for (let i = openBraceIdx; i < source.length; i += 1) {
      const ch = source[i];
      if (ch === "{") depth += 1;
      else if (ch === "}") {
        depth -= 1;
        if (depth === 0) return i + 1;
      }
    }
    return -1;
  }
  function generateJTD(source, skip, idCounter) {
    const mutants = [];
    const needle = "this.";
    for (let i = 0; i + needle.length <= source.length; i += 1) {
      if (skip[i]) continue;
      if (source.slice(i, i + needle.length) !== needle) continue;
      const before = source[i - 1] || "";
      if (/[A-Za-z0-9_$]/.test(before)) continue;
      const mutated = applyReplacement(source, i, i + needle.length, "");
      const { line, col } = lineColOf(source, i);
      mutants.push({
        id: `M${idCounter.value++}`,
        operator: "JTD",
        line,
        col,
        original: "this.",
        mutated: "(deleted)",
        source: mutated,
        status: "live",
        killedBy: []
      });
      i += needle.length - 1;
    }
    return mutants;
  }
  function generateISD(source, skip, idCounter) {
    const mutants = [];
    for (let i = 0; i + 5 <= source.length; i += 1) {
      if (skip[i]) continue;
      if (source.slice(i, i + 5) !== "super") continue;
      const before = source[i - 1] || "";
      if (/[A-Za-z0-9_$]/.test(before)) continue;
      let cursor = i + 5;
      while (cursor < source.length && /\s/.test(source[cursor])) cursor += 1;
      let callStart = -1;
      if (source[cursor] === "(") {
        callStart = cursor;
      } else if (source[cursor] === ".") {
        cursor += 1;
        while (cursor < source.length && /[A-Za-z0-9_$]/.test(source[cursor])) cursor += 1;
        while (cursor < source.length && /\s/.test(source[cursor])) cursor += 1;
        if (source[cursor] !== "(") continue;
        callStart = cursor;
      } else {
        continue;
      }
      const callEnd = findCallEnd(source, callStart);
      if (callEnd < 0) continue;
      const original = source.slice(i, callEnd);
      const mutated = applyReplacement(source, i, callEnd, "undefined");
      const { line, col } = lineColOf(source, i);
      mutants.push({
        id: `M${idCounter.value++}`,
        operator: "ISD",
        line,
        col,
        original,
        mutated: "undefined",
        source: mutated,
        status: "live",
        killedBy: []
      });
      i = callEnd - 1;
    }
    return mutants;
  }
  function findClassMethods(source) {
    const methods = [];
    const classRegex = /\bclass\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*(?:extends\s+[A-Za-z_$][A-Za-z0-9_$.]*\s*)?\{/g;
    let m;
    while (m = classRegex.exec(source)) {
      const bodyStart = m.index + m[0].length - 1;
      const bodyEnd = findBlockEnd(source, bodyStart);
      if (bodyEnd < 0) continue;
      const className = m[1];
      const inner = source.slice(bodyStart + 1, bodyEnd - 1);
      const methodRegex = /(^|\n)([ \t]*)(?:(?:static|async|get|set)\s+)*(#?[A-Za-z_$][A-Za-z0-9_$]*)\s*\([^)]*\)\s*\{/g;
      let mm;
      while (mm = methodRegex.exec(inner)) {
        const headerStartInInner = mm.index + (mm[1] ? mm[1].length : 0);
        const braceInInner = methodRegex.lastIndex - 1;
        const braceAbs = bodyStart + 1 + braceInInner;
        const blockEndAbs = findBlockEnd(source, braceAbs);
        if (blockEndAbs < 0) continue;
        methods.push({
          className,
          methodName: mm[3],
          headerStart: bodyStart + 1 + headerStartInInner,
          blockEnd: blockEndAbs
        });
      }
    }
    return methods;
  }
  function generateIOD(source, skip, idCounter) {
    const methods = findClassMethods(source);
    const mutants = [];
    methods.forEach((m) => {
      if (m.methodName === "constructor") return;
      if (skip[m.headerStart]) return;
      const mutated = applyReplacement(source, m.headerStart, m.blockEnd, "");
      const { line, col } = lineColOf(source, m.headerStart);
      mutants.push({
        id: `M${idCounter.value++}`,
        operator: "IOD",
        line,
        col,
        original: `${m.className}.${m.methodName}(...)`,
        mutated: "(deleted)",
        source: mutated,
        status: "live",
        killedBy: []
      });
    });
    return mutants;
  }
  function generatePRV(source, skip, idCounter) {
    const classNames = [];
    const classRegex = /\bclass\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
    let cm;
    while (cm = classRegex.exec(source)) classNames.push(cm[1]);
    if (classNames.length < 2) return [];
    const mutants = [];
    const newRegex = /\bnew\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
    let nm;
    while (nm = newRegex.exec(source)) {
      const idStart = nm.index + nm[0].length - nm[1].length;
      if (skip[idStart]) continue;
      const original = nm[1];
      if (!classNames.includes(original)) continue;
      classNames.forEach((repl) => {
        if (repl === original) return;
        const mutated = applyReplacement(source, idStart, idStart + original.length, repl);
        const { line, col } = lineColOf(source, idStart);
        mutants.push({
          id: `M${idCounter.value++}`,
          operator: "PRV",
          line,
          col,
          original: `new ${original}`,
          mutated: `new ${repl}`,
          source: mutated,
          status: "live",
          killedBy: []
        });
      });
    }
    return mutants;
  }
  function generateMutants(source, operators = ["AOR", "ROR", "LOR", "UOI"]) {
    const skip = buildSkipMap(source);
    const idCounter = { value: 1 };
    const out = [];
    operators.forEach((op) => {
      if (op === "UOI") {
        out.push(...generateUOI(source, skip, idCounter));
      } else if (op === "ABS") {
        out.push(...generateABS(source, skip, idCounter));
      } else if (op === "UOD") {
        out.push(...generateUOD(source, skip, idCounter));
      } else if (op === "SVR") {
        out.push(...generateSVR(source, skip, idCounter));
      } else if (op === "BSR") {
        out.push(...generateBSR(source, skip, idCounter));
      } else if (op === "JTD") {
        out.push(...generateJTD(source, skip, idCounter));
      } else if (op === "ISD") {
        out.push(...generateISD(source, skip, idCounter));
      } else if (op === "IOD") {
        out.push(...generateIOD(source, skip, idCounter));
      } else if (op === "PRV") {
        out.push(...generatePRV(source, skip, idCounter));
      } else {
        out.push(...generateForOperator(source, op, skip, idCounter));
      }
    });
    return out;
  }
  function compileFunction(params, body) {
    return new Function(...params, body);
  }
  function deepEqual(a, b) {
    if (a === b) return true;
    if (typeof a === "number" && typeof b === "number" && Number.isNaN(a) && Number.isNaN(b)) return true;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((v, i) => deepEqual(v, b[i]));
    }
    if (a && b && typeof a === "object" && typeof b === "object") {
      const ak = Object.keys(a);
      const bk = Object.keys(b);
      if (ak.length !== bk.length) return false;
      return ak.every((k) => deepEqual(a[k], b[k]));
    }
    return false;
  }
  function runOnce(fn, args) {
    try {
      const result = fn(...args);
      return { ok: true, value: result };
    } catch (err) {
      return { ok: false, error: (err == null ? void 0 : err.message) || String(err) };
    }
  }
  function runTestSuite(params, body, tests) {
    const fn = compileFunction(params, body);
    return tests.map((t2) => {
      const outcome = runOnce(fn, t2.args);
      const expected = t2.expected;
      const passed = outcome.ok && deepEqual(outcome.value, expected);
      return { id: t2.id, passed, outcome };
    });
  }
  function evaluateMutants(params, body, tests, mutants) {
    const baseFn = compileFunction(params, body);
    const baseOutcomes = tests.map((t2) => runOnce(baseFn, t2.args));
    return mutants.map((m) => {
      let mutantFn;
      try {
        mutantFn = compileFunction(params, m.source);
      } catch (err) {
        return { ...m, status: "killed", killedBy: tests.map((t2) => t2.id), compileError: err == null ? void 0 : err.message };
      }
      const killedBy = [];
      tests.forEach((t2, i) => {
        const base = baseOutcomes[i];
        const mut = runOnce(mutantFn, t2.args);
        const sameOk = base.ok === mut.ok;
        const sameValue = sameOk && (base.ok ? deepEqual(base.value, mut.value) : true);
        if (!sameOk || !sameValue) killedBy.push(t2.id);
      });
      return {
        ...m,
        status: killedBy.length ? "killed" : "live",
        killedBy
      };
    });
  }
  function computeMutationScore(mutants) {
    const total = mutants.length;
    const equivalent = mutants.filter((m) => m.status === "equivalent").length;
    const killed = mutants.filter((m) => m.status === "killed").length;
    const live = mutants.filter((m) => m.status === "live").length;
    const denominator = total - equivalent;
    const score = denominator === 0 ? 1 : killed / denominator;
    return { total, killed, live, equivalent, score };
  }

  // src/components/SyntaxCoverageExplorer.js
  var DEFAULT_OPERATORS = ["AOR", "ROR", "LOR", "UOI"];
  var STORAGE_KEY2 = "stvisual.syntaxTests.v1";
  var SAVE_DEBOUNCE_MS = 600;
  function loadLocalPrograms() {
    var _a2;
    try {
      const raw = (_a2 = globalThis.localStorage) == null ? void 0 : _a2.getItem(STORAGE_KEY2);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  function saveLocalPrograms(programs) {
    var _a2;
    try {
      (_a2 = globalThis.localStorage) == null ? void 0 : _a2.setItem(STORAGE_KEY2, JSON.stringify(programs));
    } catch {
    }
  }
  function defaultProgramSnapshot(ex) {
    return {
      params: ex.params.join(", "),
      body: ex.body,
      tests: ex.tests.map((t2) => ({
        id: t2.id,
        argsText: t2.args.map((a) => JSON.stringify(a)).join(", "),
        expectedText: JSON.stringify(t2.expected)
      }))
    };
  }
  function escapeHtml3(value = "") {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  function formatValue(v) {
    if (v === void 0) return "undefined";
    if (typeof v === "string") return JSON.stringify(v);
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  function parseTestArgs(text) {
    const trimmed = text.trim();
    if (!trimmed) return [];
    try {
      return JSON.parse(`[${trimmed}]`);
    } catch (err) {
      throw new Error(t("syntax.err.argsParse", { msg: err.message }));
    }
  }
  function parseExpected(text) {
    const trimmed = text.trim();
    if (!trimmed) return void 0;
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
  function parseFunctionSource(text) {
    const m = text.match(/function\s+\w*\s*\(([^)]*)\)\s*\{/);
    if (!m) return null;
    const params = m[1].trim();
    const startIdx = m.index + m[0].length;
    let depth = 1;
    for (let i = startIdx; i < text.length; i++) {
      const ch = text[i];
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          return { params, body: text.slice(startIdx, i).replace(/^\n+|\n+$/g, "") };
        }
      }
    }
    return null;
  }
  function createSyntaxCoverageExplorer() {
    var _a2;
    const root2 = document.createElement("div");
    root2.className = "syntax-coverage";
    root2.dataset.testid = "syntax-coverage";
    const initial = programExamples[0];
    const localPrograms = loadLocalPrograms();
    const initialSnapshot = localPrograms[initial.id] || defaultProgramSnapshot(initial);
    const state = {
      exampleId: initial.id,
      params: initialSnapshot.params,
      body: initialSnapshot.body,
      operators: new Set(DEFAULT_OPERATORS),
      tests: initialSnapshot.tests.map((t2) => ({ ...t2 })),
      programs: localPrograms,
      mutants: [],
      suiteResults: [],
      parsedTests: [],
      parsedParams: [],
      score: { total: 0, killed: 0, live: 0, equivalent: 0, score: 0 },
      error: null,
      selectedMutantId: null,
      cloudUser: null,
      cloudStatus: "idle",
      // 'idle' | 'syncing' | 'synced' | 'error'
      cloudMessage: "",
      customExamples: []
    };
    let cloudClient = null;
    try {
      cloudClient = createCloudIntegrationClient();
    } catch {
      cloudClient = null;
    }
    function snapshotCurrent() {
      return {
        params: state.params,
        body: state.body,
        tests: state.tests.map((t2) => ({
          id: t2.id,
          argsText: t2.argsText,
          expectedText: t2.expectedText
        }))
      };
    }
    function persistCurrent() {
      state.programs[state.exampleId] = snapshotCurrent();
      saveLocalPrograms(state.programs);
      pushToCloud();
    }
    let saveTimer = null;
    let pendingSave = null;
    function pushToCloud() {
      if (!cloudClient || !state.cloudUser || typeof cloudClient.saveSyntaxTests !== "function") return;
      if (saveTimer) clearTimeout(saveTimer);
      state.cloudStatus = "syncing";
      state.cloudMessage = "";
      updateCloudIndicator();
      pendingSave = new Promise((resolve) => {
        saveTimer = setTimeout(async () => {
          saveTimer = null;
          try {
            await cloudClient.saveSyntaxTests(state.cloudUser.uid, state.programs);
            state.cloudStatus = "synced";
            state.cloudMessage = t("syntax.cloud.synced");
          } catch (err) {
            state.cloudStatus = "error";
            state.cloudMessage = t("syntax.cloud.saveError", { msg: (err == null ? void 0 : err.message) || err });
          }
          updateCloudIndicator();
          resolve();
          pendingSave = null;
        }, SAVE_DEBOUNCE_MS);
      });
    }
    async function flushPendingSave() {
      if (!pendingSave) return;
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
        try {
          await cloudClient.saveSyntaxTests(state.cloudUser.uid, state.programs);
        } catch {
        }
      } else {
        await pendingSave;
      }
      pendingSave = null;
    }
    function updateCloudIndicator() {
      const node = root2.querySelector('[data-testid="syntax-cloud-indicator"]');
      if (!node) return;
      node.dataset.status = state.cloudStatus;
      node.textContent = cloudIndicatorText();
    }
    function cloudIndicatorText() {
      if (!state.cloudUser) return t("syntax.cloud.notSignedIn");
      switch (state.cloudStatus) {
        case "syncing":
          return t("syntax.cloud.syncing");
        case "synced":
          return `\u2601 ${state.cloudMessage || t("syntax.cloud.synced")}`;
        case "error":
          return `\u2601 ${state.cloudMessage || t("syntax.cloud.failed")}`;
        default:
          return `\u2601 ${t("syntax.cloud.linked", { name: state.cloudUser.email || state.cloudUser.uid })}`;
      }
    }
    async function reloadFromCloud({ force = false } = {}) {
      var _a3, _b;
      if (!cloudClient || !state.cloudUser) return;
      if (typeof cloudClient.loadSyntaxTests !== "function") return;
      await flushPendingSave();
      state.cloudStatus = "syncing";
      state.cloudMessage = force ? t("syntax.cloud.reloading") : "";
      updateCloudIndicator();
      try {
        const remote = await cloudClient.loadSyntaxTests(state.cloudUser.uid);
        const remoteObj = remote && typeof remote === "object" ? remote : {};
        const localOnly = Object.keys(state.programs).filter((k) => !(k in remoteObj));
        const merged = { ...remoteObj };
        localOnly.forEach((k) => {
          merged[k] = state.programs[k];
        });
        state.programs = merged;
        saveLocalPrograms(state.programs);
        const current2 = state.programs[state.exampleId];
        if (current2) {
          state.params = (_a3 = current2.params) != null ? _a3 : state.params;
          state.body = (_b = current2.body) != null ? _b : state.body;
          state.tests = Array.isArray(current2.tests) ? current2.tests.map((t2) => ({ ...t2 })) : state.tests;
          state.selectedMutantId = null;
        }
        state.cloudStatus = "synced";
        state.cloudMessage = t("syntax.cloud.loaded");
        render();
        if (localOnly.length > 0) pushToCloud();
      } catch (err) {
        state.cloudStatus = "error";
        state.cloudMessage = t("syntax.cloud.loadError", { msg: (err == null ? void 0 : err.message) || err });
        updateCloudIndicator();
      }
    }
    function recompute() {
      var _a3;
      state.error = null;
      let params;
      try {
        params = state.params.split(",").map((s) => s.trim()).filter(Boolean);
      } catch (err) {
        state.error = t("syntax.err.argsParse", { msg: err.message });
        return;
      }
      let parsedTests;
      try {
        parsedTests = state.tests.map((t2) => ({
          id: t2.id,
          args: parseTestArgs(t2.argsText),
          expected: parseExpected(t2.expectedText)
        }));
      } catch (err) {
        state.error = err.message;
        return;
      }
      let suiteResults;
      try {
        suiteResults = runTestSuite(params, state.body, parsedTests);
      } catch (err) {
        state.error = t("syntax.err.compile", { msg: err.message });
        return;
      }
      const operators = [...state.operators];
      const generated = generateMutants(state.body, operators);
      const evaluated = evaluateMutants(params, state.body, parsedTests, generated);
      const prevEquivalent = new Set(
        state.mutants.filter((m) => m.status === "equivalent").map((m) => m.id)
      );
      const finalMutants = evaluated.map(
        (m) => prevEquivalent.has(m.id) ? { ...m, status: "equivalent", killedBy: [] } : m
      );
      state.suiteResults = suiteResults;
      state.parsedTests = parsedTests;
      state.parsedParams = params;
      state.mutants = finalMutants;
      state.score = computeMutationScore(finalMutants);
      if (!state.mutants.find((m) => m.id === state.selectedMutantId)) {
        state.selectedMutantId = ((_a3 = finalMutants[0]) == null ? void 0 : _a3.id) || null;
      }
    }
    function loadExample(id) {
      const ex = programExamples.find((e) => e.id === id) || state.customExamples.find((e) => e.id === id);
      if (!ex) return;
      state.exampleId = id;
      const snap = state.programs[id] || defaultProgramSnapshot(ex);
      state.params = snap.params;
      state.body = snap.body;
      state.tests = snap.tests.map((t2) => ({ ...t2 }));
      state.selectedMutantId = null;
    }
    function render() {
      recompute();
      const allExamples = [...programExamples, ...state.customExamples];
      const exampleButtons = allExamples.map((ex) => `
      <button
        type="button"
        class="syntax-example-btn${state.exampleId === ex.id ? " active" : ""}"
        data-example="${ex.id}"
        title="${escapeHtml3(getLocale() === "en" ? ex.descriptionEn || ex.description : ex.description)}"
        data-testid="syntax-example-${ex.id}"
      >${escapeHtml3(ex.name)}</button>
    `).join("");
      const operatorButtons = mutationOperators.map((op) => `
      <label class="syntax-op-btn${state.operators.has(op.id) ? " active" : ""}" title="${escapeHtml3(getLocale() === "en" ? op.descEn || op.desc : op.desc)}">
        <input type="checkbox" data-operator="${op.id}" ${state.operators.has(op.id) ? "checked" : ""} />
        <span>${escapeHtml3(op.id)}</span>
      </label>
    `).join("");
      const selectedMutant = state.mutants.find((m) => m.id === state.selectedMutantId) || null;
      let mutantSuiteResults = null;
      if (selectedMutant) {
        try {
          mutantSuiteResults = runTestSuite(
            state.parsedParams,
            selectedMutant.source,
            state.parsedTests
          );
        } catch {
          mutantSuiteResults = state.parsedTests.map(() => ({
            outcome: { ok: false, error: "compile error" }
          }));
        }
      }
      const showMutantCol = !!selectedMutant;
      const killedByIds = selectedMutant ? new Set(selectedMutant.killedBy) : /* @__PURE__ */ new Set();
      const testRows = state.tests.map((tc, i) => {
        const result = state.suiteResults[i];
        const passClass = (result == null ? void 0 : result.passed) ? "pass" : result ? "fail" : "";
        const actual = (result == null ? void 0 : result.outcome.ok) ? formatValue(result.outcome.value) : `\u26A0 ${(result == null ? void 0 : result.outcome.error) || ""}`;
        let mutantCell = "";
        let killClass = "";
        if (showMutantCol) {
          const mr = mutantSuiteResults == null ? void 0 : mutantSuiteResults[i];
          const mutantActual = (mr == null ? void 0 : mr.outcome.ok) ? formatValue(mr.outcome.value) : `\u26A0 ${(mr == null ? void 0 : mr.outcome.error) || ""}`;
          const isKilled = killedByIds.has(tc.id);
          killClass = isKilled ? "killed-by" : "survived-by";
          mutantCell = `<td class="syntax-test-mutant ${killClass}"><code>${escapeHtml3(mutantActual)}</code>${isKilled ? '<span class="syntax-test-kill-badge">killed</span>' : ""}</td>`;
        }
        return `
        <tr class="syntax-test-row ${passClass} ${killClass}" data-testid="syntax-test-row-${tc.id}">
          <td><code>${escapeHtml3(tc.id)}</code></td>
          <td><input type="text" class="syntax-test-input" data-test-args="${tc.id}" value="${escapeHtml3(tc.argsText)}" /></td>
          <td><input type="text" class="syntax-test-input" data-test-expected="${tc.id}" value="${escapeHtml3(tc.expectedText)}" /></td>
          <td><code>${escapeHtml3(actual)}</code></td>
          ${mutantCell}
          <td>
            <button type="button" class="syntax-test-remove" data-remove-test="${tc.id}" aria-label="${t("syntax.removeTest")}">\xD7</button>
          </td>
        </tr>
      `;
      }).join("");
      const mutantHeaderCol = showMutantCol ? `<th class="syntax-test-mutant-head">mutant actual${selectedMutant ? `<br><small>(${escapeHtml3(selectedMutant.id)})</small>` : ""}</th>` : "";
      const grouped = /* @__PURE__ */ new Map();
      state.mutants.forEach((m) => {
        if (!grouped.has(m.operator)) grouped.set(m.operator, []);
        grouped.get(m.operator).push(m);
      });
      const mutantList = [...grouped.entries()].map(([op, list]) => {
        const items = list.map((m) => `
        <li class="syntax-mutant-item ${m.status}${state.selectedMutantId === m.id ? " selected" : ""}" data-mutant-id="${m.id}" data-testid="syntax-mutant-${m.id}">
          <span class="syntax-mutant-id">${escapeHtml3(m.id)}</span>
          <span class="syntax-mutant-loc">L${m.line}:${m.col}</span>
          <span class="syntax-mutant-diff"><code>${escapeHtml3(m.original)}</code> \u2192 <code>${escapeHtml3(m.mutated)}</code></span>
          <span class="syntax-mutant-status">${escapeHtml3(m.status)}</span>
        </li>
      `).join("");
        return `
        <div class="syntax-mutant-group" data-testid="syntax-mutant-group-${op}">
          <h5>${t("syntax.col.mutantGroupHeading", { op: escapeHtml3(op), count: list.length })}</h5>
          <ul>${items}</ul>
        </div>
      `;
      }).join("");
      const selected = selectedMutant;
      const selectedDetail = selected ? `
      <div class="syntax-mutant-detail" data-testid="syntax-mutant-detail">
        <h4>${escapeHtml3(selected.id)} <span class="syntax-mutant-op">${escapeHtml3(selected.operator)}</span></h4>
        <p class="syntax-mutant-meta">L${selected.line}:${selected.col} \xB7 ${t("syntax.mutant.statusLabel")}<strong>${escapeHtml3(selected.status)}</strong></p>
        <pre class="syntax-mutant-source"><code>${escapeHtml3(selected.source)}</code></pre>
        <p class="syntax-mutant-killed">
          ${selected.killedBy.length ? t("syntax.mutant.killedByList", { ids: selected.killedBy.map((id) => `<code>${escapeHtml3(id)}</code>`).join(", ") }) : t("syntax.mutant.liveHint")}
        </p>
        <div class="syntax-mutant-actions">
          <button type="button" data-toggle-equivalent="${selected.id}">
            ${selected.status === "equivalent" ? t("common.unmarkEquivalent") : t("common.markEquivalent")}
          </button>
        </div>
      </div>
    ` : `<p class="syntax-mutant-empty">${t("syntax.mutant.empty")}</p>`;
      const scorePct = Math.round(state.score.score * 100);
      root2.innerHTML = `
      <div class="syntax-toolbar">
        <div class="syntax-examples" role="tablist">${exampleButtons}</div>
        <div class="syntax-operators" data-testid="syntax-operators">${operatorButtons}</div>
      </div>
      <div class="syntax-cloud-bar">
        <span
          class="syntax-cloud-indicator"
          data-testid="syntax-cloud-indicator"
          data-status="${state.cloudStatus}"
        >${escapeHtml3(cloudIndicatorText())}</span>
        <span class="syntax-cloud-actions">
          ${state.cloudUser ? `<button type="button" class="syntax-reload-btn" data-testid="syntax-cloud-reload">\u21BB ${t("syntax.cloud.reload")}</button>` : ""}
          <button type="button" class="syntax-reset-btn" data-testid="syntax-reset-program">\u21BA ${t("syntax.reset")}</button>
        </span>
      </div>

      <div class="syntax-grid">
        <section class="syntax-program">
          <label class="syntax-label">${t("syntax.params")}</label>
          <input type="text" class="syntax-params" data-testid="syntax-params" value="${escapeHtml3(state.params)}" />
          <label class="syntax-label">${t("syntax.body")}</label>
          <textarea class="syntax-body" rows="8" data-testid="syntax-body">${escapeHtml3(state.body)}</textarea>
        </section>

        <section class="syntax-tests">
          <header class="syntax-tests-header">
            <h4>${t("syntax.tests")}</h4>
            <button type="button" class="syntax-test-add" data-testid="syntax-test-add">\uFF0B ${t("syntax.test.add")}</button>
          </header>
          <table class="syntax-test-table" data-testid="syntax-test-table">
            <thead>
              <tr>
                <th>id</th>
                <th>${t("syntax.col.args")}</th>
                <th>${t("syntax.col.expected")}</th>
                <th>actual</th>
                ${mutantHeaderCol}
                <th></th>
              </tr>
            </thead>
            <tbody>${testRows}</tbody>
          </table>
        </section>
      </div>

      ${state.error ? `<p class="syntax-error" data-testid="syntax-error">${escapeHtml3(state.error)}</p>` : ""}

      <section class="syntax-score-section">
        <div class="syntax-score-bar">
          <div class="syntax-score-fill" style="width:${scorePct}%" data-testid="syntax-score-fill"></div>
        </div>
        <p class="syntax-score-stats" data-testid="syntax-score-stats">
          ${t("syntax.score")}: <strong>${scorePct}%</strong>
          <span class="syntax-divider">\xB7</span>
          ${t("syntax.totalLabel")} ${state.score.total}
          <span class="syntax-divider">\xB7</span>
          killed <strong>${state.score.killed}</strong>
          <span class="syntax-divider">\xB7</span>
          live <strong>${state.score.live}</strong>
          <span class="syntax-divider">\xB7</span>
          equivalent <strong>${state.score.equivalent}</strong>
        </p>
      </section>

      <section class="syntax-mutant-section">
        <div class="syntax-mutant-list" data-testid="syntax-mutant-list">${mutantList || `<p class="syntax-mutant-empty">${t("syntax.noMutants")}</p>`}</div>
        ${selectedDetail}
      </section>
    `;
      bindEvents();
    }
    function bindEvents() {
      root2.querySelectorAll("[data-example]").forEach((btn) => {
        btn.addEventListener("click", () => {
          loadExample(btn.dataset.example);
          render();
        });
      });
      const resetBtn = root2.querySelector('[data-testid="syntax-reset-program"]');
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          const ex = programExamples.find((e) => e.id === state.exampleId);
          if (!ex) return;
          const snap = defaultProgramSnapshot(ex);
          state.params = snap.params;
          state.body = snap.body;
          state.tests = snap.tests.map((t2) => ({ ...t2 }));
          state.selectedMutantId = null;
          persistCurrent();
          render();
        });
      }
      const reloadBtn = root2.querySelector('[data-testid="syntax-cloud-reload"]');
      if (reloadBtn) {
        reloadBtn.addEventListener("click", () => {
          reloadFromCloud({ force: true });
        });
      }
      root2.querySelectorAll("[data-operator]").forEach((cb) => {
        cb.addEventListener("change", () => {
          const op = cb.dataset.operator;
          if (cb.checked) state.operators.add(op);
          else state.operators.delete(op);
          render();
        });
      });
      const params = root2.querySelector('[data-testid="syntax-params"]');
      if (params) {
        params.addEventListener("input", (e) => {
          state.params = e.target.value;
          persistCurrent();
        });
        params.addEventListener("change", (e) => {
          state.params = e.target.value;
          persistCurrent();
          render();
        });
      }
      const body = root2.querySelector('[data-testid="syntax-body"]');
      if (body) {
        body.addEventListener("input", (e) => {
          state.body = e.target.value;
          persistCurrent();
        });
        body.addEventListener("change", (e) => {
          state.body = e.target.value;
          persistCurrent();
          render();
        });
      }
      root2.querySelectorAll("[data-test-args]").forEach((input) => {
        input.addEventListener("input", (e) => {
          const id = input.dataset.testArgs;
          const t2 = state.tests.find((x) => x.id === id);
          if (t2) t2.argsText = e.target.value;
          persistCurrent();
        });
        input.addEventListener("change", (e) => {
          const id = input.dataset.testArgs;
          const t2 = state.tests.find((x) => x.id === id);
          if (t2) t2.argsText = e.target.value;
          persistCurrent();
          render();
        });
      });
      root2.querySelectorAll("[data-test-expected]").forEach((input) => {
        input.addEventListener("input", (e) => {
          const id = input.dataset.testExpected;
          const t2 = state.tests.find((x) => x.id === id);
          if (t2) t2.expectedText = e.target.value;
          persistCurrent();
        });
        input.addEventListener("change", (e) => {
          const id = input.dataset.testExpected;
          const t2 = state.tests.find((x) => x.id === id);
          if (t2) t2.expectedText = e.target.value;
          persistCurrent();
          render();
        });
      });
      root2.querySelectorAll("[data-remove-test]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.tests = state.tests.filter((t2) => t2.id !== btn.dataset.removeTest);
          persistCurrent();
          render();
        });
      });
      const addBtn = root2.querySelector('[data-testid="syntax-test-add"]');
      if (addBtn) {
        addBtn.addEventListener("click", () => {
          const next = `t${state.tests.length + 1}`;
          state.tests.push({ id: next, argsText: "", expectedText: "" });
          persistCurrent();
          render();
        });
      }
      root2.querySelectorAll("[data-mutant-id]").forEach((li) => {
        li.addEventListener("click", () => {
          state.selectedMutantId = li.dataset.mutantId;
          render();
        });
      });
      root2.querySelectorAll("[data-toggle-equivalent]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const m = state.mutants.find((x) => x.id === btn.dataset.toggleEquivalent);
          if (!m) return;
          m.status = m.status === "equivalent" ? m.killedBy.length ? "killed" : "live" : "equivalent";
          state.score = computeMutationScore(state.mutants);
          render();
        });
      });
    }
    render();
    if (cloudClient && typeof cloudClient.subscribeAuthState === "function") {
      cloudClient.subscribeAuthState(async (user) => {
        state.cloudUser = user || null;
        if (!user) {
          state.cloudStatus = "idle";
          state.cloudMessage = "";
          render();
          return;
        }
        await reloadFromCloud();
      });
      if (typeof ((_a2 = globalThis.document) == null ? void 0 : _a2.addEventListener) === "function") {
        globalThis.document.addEventListener("visibilitychange", () => {
          if (globalThis.document.visibilityState === "visible" && state.cloudUser) {
            reloadFromCloud();
          }
        });
      }
      if (typeof globalThis.addEventListener === "function") {
        globalThis.addEventListener("pagehide", () => {
          flushPendingSave();
        });
        globalThis.addEventListener("beforeunload", () => {
          flushPendingSave();
        });
      }
    }
    if (typeof globalThis.addEventListener === "function") {
      globalThis.addEventListener("stvisual:load-program-source", (event) => {
        var _a3;
        if (!root2.isConnected) return;
        const detail = event.detail || {};
        if (detail.target !== "mutation") return;
        const content = String((_a3 = detail.content) != null ? _a3 : "");
        const parsed = parseFunctionSource(content);
        const baseName = (detail.name || "uploaded").replace(/\.[^.]+$/, "") || "uploaded";
        const id = `uploaded-${Date.now().toString(36)}`;
        const params = parsed ? parsed.params : "";
        const body = parsed ? parsed.body : content;
        const newExample = {
          id,
          name: baseName,
          nameEn: baseName,
          description: `Uploaded from cloud: ${detail.name || baseName}`,
          descriptionEn: `Uploaded from cloud: ${detail.name || baseName}`,
          params: params ? params.split(",").map((s) => s.trim()).filter(Boolean) : [],
          body,
          tests: []
        };
        state.customExamples = [...state.customExamples, newExample];
        state.programs[id] = { params, body, tests: [] };
        state.exampleId = id;
        state.params = params;
        state.body = body;
        state.tests = [];
        state.selectedMutantId = null;
        persistCurrent();
        render();
      });
    }
    return root2;
  }

  // src/data/grammarData.js
  var grammarExamples = [
    {
      id: "arith",
      name: "\u7B97\u8853\u904B\u7B97\u5F0F / Arithmetic Expression",
      nameEn: "Arithmetic Expression",
      description: "\u7C21\u55AE\u6574\u6578\u52A0\u6E1B\u4E58\u7684\u4E2D\u7DB4\u904B\u7B97\u5F0F\uFF0C\u542B\u62EC\u865F\u3002",
      descriptionEn: "Simple integer infix expression with +, *, and parentheses.",
      text: [
        '<E> ::= <E> "+" <T> | <T>',
        '<T> ::= <T> "*" <F> | <F>',
        '<F> ::= "(" <E> ")" | <D>',
        '<D> ::= "0" | "1" | "2"'
      ].join("\n")
    },
    {
      id: "json-tiny",
      name: "Mini JSON",
      nameEn: "Mini JSON",
      description: "\u6975\u7C21 JSON\uFF1A\u7269\u4EF6\u3001\u9663\u5217\u3001\u5B57\u4E32\u3001\u6578\u5B57\u3002",
      descriptionEn: "Minimal JSON subset: object, array, string, number.",
      text: [
        "<V> ::= <O> | <A> | <S> | <N>",
        '<O> ::= "{" "}" | "{" <P> "}"',
        '<P> ::= <S> ":" <V> | <S> ":" <V> "," <P>',
        '<A> ::= "[" "]" | "[" <V> "]" | "[" <V> "," <A> "]"',
        '<S> ::= "\\"a\\"" | "\\"b\\""',
        '<N> ::= "0" | "1"'
      ].join("\n")
    },
    {
      id: "palindrome",
      name: "\u56DE\u6587 / Palindrome",
      nameEn: "Palindrome",
      description: "a/b \u5B57\u6BCD\u7D44\u6210\u7684\u5076\u6578/\u5947\u6578\u9577\u5EA6\u56DE\u6587\u3002",
      descriptionEn: "Even/odd-length palindromes over {a,b}.",
      text: [
        '<P> ::= "a" | "b" | "a" <P> "a" | "b" <P> "b"'
      ].join("\n")
    }
  ];

  // src/utils/grammar.js
  var NT_PATTERN = /<([^<>\s]+)>/y;
  var TERMINAL_PATTERN = /"((?:[^"\\]|\\.)*)"/y;
  function tokenizeRhs(text) {
    const tokens = [];
    let i = 0;
    const len = text.length;
    while (i < len) {
      const ch = text[i];
      if (ch === " " || ch === "	") {
        i++;
        continue;
      }
      if (ch === "<") {
        NT_PATTERN.lastIndex = i;
        const m = NT_PATTERN.exec(text);
        if (!m) throw new Error(`Invalid non-terminal at position ${i}: "${text.slice(i, i + 12)}"`);
        tokens.push({ kind: "NT", value: m[1] });
        i = NT_PATTERN.lastIndex;
        continue;
      }
      if (ch === '"') {
        TERMINAL_PATTERN.lastIndex = i;
        const m = TERMINAL_PATTERN.exec(text);
        if (!m) throw new Error(`Unterminated terminal at position ${i}: "${text.slice(i, i + 12)}"`);
        tokens.push({ kind: "T", value: m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\") });
        i = TERMINAL_PATTERN.lastIndex;
        continue;
      }
      throw new Error(`Unexpected character "${ch}" at position ${i}`);
    }
    return tokens;
  }
  function parseGrammar(text) {
    if (typeof text !== "string") throw new Error("Grammar must be a string.");
    const lines = text.split(/\r?\n/);
    const productions = [];
    const nonTerminals = /* @__PURE__ */ new Set();
    const terminals = /* @__PURE__ */ new Set();
    let start = null;
    let nextId = 0;
    for (let lineNo = 0; lineNo < lines.length; lineNo++) {
      const raw = lines[lineNo].trim();
      if (!raw || raw.startsWith("#") || raw.startsWith("//")) continue;
      const sepIdx = raw.indexOf("::=");
      if (sepIdx === -1) {
        throw new Error(`Line ${lineNo + 1}: missing "::=".`);
      }
      const lhsText = raw.slice(0, sepIdx).trim();
      const rhsText = raw.slice(sepIdx + 3);
      const lhsTokens = tokenizeRhs(lhsText);
      if (lhsTokens.length !== 1 || lhsTokens[0].kind !== "NT") {
        throw new Error(`Line ${lineNo + 1}: LHS must be a single non-terminal like "<S>".`);
      }
      const lhs = lhsTokens[0].value;
      nonTerminals.add(lhs);
      if (start === null) start = lhs;
      const alternatives = splitAlternatives(rhsText);
      for (const alt of alternatives) {
        const rhs = tokenizeRhs(alt);
        for (const sym of rhs) {
          if (sym.kind === "NT") nonTerminals.add(sym.value);
          else terminals.add(sym.value);
        }
        productions.push({ id: nextId++, lhs, rhs });
      }
    }
    if (productions.length === 0) {
      throw new Error("Grammar has no productions.");
    }
    return { start, productions, nonTerminals, terminals };
  }
  function splitAlternatives(rhsText) {
    const parts = [];
    let current2 = "";
    let inString = false;
    for (let i = 0; i < rhsText.length; i++) {
      const ch = rhsText[i];
      if (ch === '"') {
        inString = !inString;
        current2 += ch;
        continue;
      }
      if (ch === "\\" && inString) {
        current2 += ch + (rhsText[++i] || "");
        continue;
      }
      if (ch === "|" && !inString) {
        parts.push(current2);
        current2 = "";
        continue;
      }
      current2 += ch;
    }
    parts.push(current2);
    return parts.map((p) => p.trim());
  }
  function generateDerivations(grammar, options = {}) {
    var _a2, _b, _c;
    const maxStrings = (_a2 = options.maxStrings) != null ? _a2 : 12;
    const maxDepth = (_b = options.maxDepth) != null ? _b : 20;
    const maxStringLen = (_c = options.maxStringLen) != null ? _c : 60;
    const startSym = options.start || grammar.start;
    const initial = {
      sentential: [{ kind: "NT", value: startSym }],
      productionsUsed: [],
      depth: 0
    };
    const queue = [initial];
    const results = [];
    const seenStrings = /* @__PURE__ */ new Set();
    let iterations = 0;
    const iterationCap = 5e4;
    while (queue.length > 0 && results.length < maxStrings && iterations < iterationCap) {
      iterations++;
      const node = queue.shift();
      const firstNT = node.sentential.findIndex((s) => s.kind === "NT");
      if (firstNT === -1) {
        const stringValue = node.sentential.map((s) => s.value).join("");
        if (!seenStrings.has(stringValue)) {
          seenStrings.add(stringValue);
          results.push({
            string: stringValue,
            productionsUsed: node.productionsUsed,
            depth: node.depth
          });
        }
        continue;
      }
      if (node.depth >= maxDepth) continue;
      const sym = node.sentential[firstNT];
      const matching = grammar.productions.filter((p) => p.lhs === sym.value);
      for (const prod of matching) {
        const next = [
          ...node.sentential.slice(0, firstNT),
          ...prod.rhs,
          ...node.sentential.slice(firstNT + 1)
        ];
        const currentTermLen = next.filter((s) => s.kind === "T").reduce((sum, s) => sum + s.value.length, 0);
        if (currentTermLen > maxStringLen) continue;
        queue.push({
          sentential: next,
          productionsUsed: [...node.productionsUsed, prod.id],
          depth: node.depth + 1
        });
      }
    }
    return results;
  }
  function computeCoverage(derivations, grammar) {
    const allProductionIds = new Set(grammar.productions.map((p) => p.id));
    const allTerminals = new Set(grammar.terminals);
    const usedProductions = /* @__PURE__ */ new Set();
    const usedTerminals = /* @__PURE__ */ new Set();
    const productionLookup = new Map(grammar.productions.map((p) => [p.id, p]));
    for (const d of derivations) {
      for (const pid of d.productionsUsed) {
        usedProductions.add(pid);
        const prod = productionLookup.get(pid);
        if (prod) {
          for (const sym of prod.rhs) {
            if (sym.kind === "T") usedTerminals.add(sym.value);
          }
        }
      }
    }
    const denom = (s) => s.size === 0 ? 1 : s.size;
    return {
      pdc: {
        covered: usedProductions,
        all: allProductionIds,
        ratio: usedProductions.size / denom(allProductionIds)
      },
      tsc: {
        covered: usedTerminals,
        all: allTerminals,
        ratio: usedTerminals.size / denom(allTerminals)
      }
    };
  }
  var GRAMMAR_OPERATORS = ["TR", "PR", "SD", "DUP"];
  function cloneGrammar(grammar) {
    return {
      start: grammar.start,
      productions: grammar.productions.map((p) => ({
        id: p.id,
        lhs: p.lhs,
        rhs: p.rhs.map((s) => ({ ...s }))
      })),
      nonTerminals: new Set(grammar.nonTerminals),
      terminals: new Set(grammar.terminals)
    };
  }
  function formatProduction(prod) {
    const rhsText = prod.rhs.length === 0 ? '""' : prod.rhs.map((s) => s.kind === "NT" ? `<${s.value}>` : `"${s.value}"`).join(" ");
    return `<${prod.lhs}> ::= ${rhsText}`;
  }
  function generateGrammarMutants(grammar, opIds = GRAMMAR_OPERATORS) {
    const mutants = [];
    const ops = new Set(opIds);
    const terms = [...grammar.terminals];
    if (ops.has("TR") && terms.length >= 2) {
      grammar.productions.forEach((prod, pIdx) => {
        prod.rhs.forEach((sym, sIdx) => {
          if (sym.kind !== "T") return;
          for (const replacement of terms) {
            if (replacement === sym.value) continue;
            const mutated = cloneGrammar(grammar);
            mutated.productions[pIdx].rhs[sIdx] = { kind: "T", value: replacement };
            mutants.push({
              id: `TR:p${prod.id}:s${sIdx}:${replacement}`,
              operator: "TR",
              description: `Replace "${sym.value}" with "${replacement}" in ${formatProduction(prod)}`,
              grammar: mutated
            });
          }
        });
      });
    }
    if (ops.has("PR")) {
      const firstByLhs = /* @__PURE__ */ new Map();
      grammar.productions.forEach((p) => {
        if (!firstByLhs.has(p.lhs)) firstByLhs.set(p.lhs, p);
      });
      grammar.productions.forEach((prod, pIdx) => {
        for (const [otherLhs, otherProd] of firstByLhs) {
          if (otherLhs === prod.lhs) continue;
          const mutated = cloneGrammar(grammar);
          mutated.productions[pIdx].rhs = otherProd.rhs.map((s) => ({ ...s }));
          mutants.push({
            id: `PR:p${prod.id}:from-${otherLhs}`,
            operator: "PR",
            description: `Replace RHS of ${formatProduction(prod)} with RHS of <${otherLhs}>`,
            grammar: mutated
          });
        }
      });
    }
    if (ops.has("SD")) {
      grammar.productions.forEach((prod, pIdx) => {
        if (prod.rhs.length === 0) return;
        prod.rhs.forEach((sym, sIdx) => {
          const mutated = cloneGrammar(grammar);
          mutated.productions[pIdx].rhs.splice(sIdx, 1);
          mutants.push({
            id: `SD:p${prod.id}:s${sIdx}`,
            operator: "SD",
            description: `Delete ${sym.kind === "NT" ? `<${sym.value}>` : `"${sym.value}"`} from ${formatProduction(prod)}`,
            grammar: mutated
          });
        });
      });
    }
    if (ops.has("DUP")) {
      grammar.productions.forEach((prod, pIdx) => {
        prod.rhs.forEach((sym, sIdx) => {
          const mutated = cloneGrammar(grammar);
          mutated.productions[pIdx].rhs.splice(sIdx, 0, { ...sym });
          mutants.push({
            id: `DUP:p${prod.id}:s${sIdx}`,
            operator: "DUP",
            description: `Duplicate ${sym.kind === "NT" ? `<${sym.value}>` : `"${sym.value}"`} in ${formatProduction(prod)}`,
            grammar: mutated
          });
        });
      });
    }
    return mutants;
  }
  function recognizes(grammar, input, options = {}) {
    var _a2;
    const maxDepth = (_a2 = options.maxDepth) != null ? _a2 : 40;
    const memo = /* @__PURE__ */ new Map();
    function tryNT(name, pos, depth) {
      if (depth > maxDepth) return [];
      const key = `${name}@${pos}@${depth}`;
      if (memo.has(key)) return memo.get(key);
      const matches = [];
      for (const prod of grammar.productions) {
        if (prod.lhs !== name) continue;
        const ends = trySequence(prod.rhs, 0, pos, depth + 1);
        for (const e of ends) matches.push(e);
      }
      const dedup = [...new Set(matches)];
      memo.set(key, dedup);
      return dedup;
    }
    function trySequence(seq, idx, pos, depth) {
      if (idx === seq.length) return [pos];
      const sym = seq[idx];
      const ends = [];
      if (sym.kind === "T") {
        const v = sym.value;
        if (input.slice(pos, pos + v.length) === v) {
          const next = trySequence(seq, idx + 1, pos + v.length, depth);
          for (const e of next) ends.push(e);
        }
      } else {
        const matches = tryNT(sym.value, pos, depth);
        for (const m of matches) {
          const next = trySequence(seq, idx + 1, m, depth);
          for (const e of next) ends.push(e);
        }
      }
      return [...new Set(ends)];
    }
    return tryNT(grammar.start, 0, 0).includes(input.length);
  }
  function evaluateMutantsAgainstStrings(originalGrammar, mutants, strings, recOptions) {
    const originalAccepts = strings.map((s) => recognizes(originalGrammar, s, recOptions));
    return mutants.map((m) => {
      const mutantAccepts = strings.map((s) => recognizes(m.grammar, s, recOptions));
      const killers = [];
      for (let i = 0; i < strings.length; i++) {
        if (originalAccepts[i] !== mutantAccepts[i]) {
          killers.push({ string: strings[i], origAccepts: originalAccepts[i], mutAccepts: mutantAccepts[i] });
        }
      }
      return {
        ...m,
        killed: killers.length > 0,
        killers
      };
    });
  }
  var STRING_MUTATION_OPERATORS = ["REP", "DEL", "DUP", "INS", "SWP"];
  function deriveAlphabet(grammar, seedStrings = []) {
    const set = /* @__PURE__ */ new Set();
    if (grammar == null ? void 0 : grammar.terminals) {
      for (const t2 of grammar.terminals) {
        for (const ch of String(t2)) set.add(ch);
      }
    }
    for (const s of seedStrings) {
      for (const ch of String(s)) set.add(ch);
    }
    return [...set];
  }
  function generateStringMutants(seed, opIds = STRING_MUTATION_OPERATORS, options = {}) {
    var _a2;
    if (typeof seed !== "string") throw new Error("Seed must be a string.");
    const ops = new Set(opIds);
    const alphabet = options.alphabet && options.alphabet.length > 0 ? [...new Set(options.alphabet)] : [...new Set(seed.split(""))];
    const maxPerOp = (_a2 = options.maxPerOp) != null ? _a2 : 30;
    const out = [];
    const seen = /* @__PURE__ */ new Set();
    const push = (operator, mutated, description) => {
      if (mutated === seed) return;
      const key = `${operator}|${mutated}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({
        id: `${operator}:${out.length}`,
        operator,
        original: seed,
        mutated,
        description
      });
    };
    if (ops.has("REP")) {
      let count = 0;
      outer: for (let i = 0; i < seed.length; i++) {
        for (const ch of alphabet) {
          if (ch === seed[i]) continue;
          push(
            "REP",
            seed.slice(0, i) + ch + seed.slice(i + 1),
            `Replace position ${i} '${seed[i]}' \u2192 '${ch}'`
          );
          count++;
          if (count >= maxPerOp) break outer;
        }
      }
    }
    if (ops.has("DEL")) {
      let count = 0;
      for (let i = 0; i < seed.length; i++) {
        push(
          "DEL",
          seed.slice(0, i) + seed.slice(i + 1),
          `Delete position ${i} '${seed[i]}'`
        );
        count++;
        if (count >= maxPerOp) break;
      }
    }
    if (ops.has("DUP")) {
      let count = 0;
      for (let i = 0; i < seed.length; i++) {
        push(
          "DUP",
          seed.slice(0, i + 1) + seed[i] + seed.slice(i + 1),
          `Duplicate position ${i} '${seed[i]}'`
        );
        count++;
        if (count >= maxPerOp) break;
      }
    }
    if (ops.has("INS")) {
      let count = 0;
      outer: for (let i = 0; i <= seed.length; i++) {
        for (const ch of alphabet) {
          push(
            "INS",
            seed.slice(0, i) + ch + seed.slice(i),
            `Insert '${ch}' at position ${i}`
          );
          count++;
          if (count >= maxPerOp) break outer;
        }
      }
    }
    if (ops.has("SWP")) {
      let count = 0;
      for (let i = 0; i < seed.length - 1; i++) {
        if (seed[i] === seed[i + 1]) continue;
        push(
          "SWP",
          seed.slice(0, i) + seed[i + 1] + seed[i] + seed.slice(i + 2),
          `Swap positions ${i}/${i + 1}`
        );
        count++;
        if (count >= maxPerOp) break;
      }
    }
    return out;
  }
  function classifyStringMutants(grammar, mutants, recOptions) {
    const cache = /* @__PURE__ */ new Map();
    const accepts = (s) => {
      if (cache.has(s)) return cache.get(s);
      const v = recognizes(grammar, s, recOptions);
      cache.set(s, v);
      return v;
    };
    return mutants.map((m) => {
      const origAccepts = accepts(m.original);
      const mutAccepts = accepts(m.mutated);
      return {
        ...m,
        origAccepts,
        mutAccepts,
        kind: mutAccepts ? "positive" : "negative",
        flipped: origAccepts !== mutAccepts
      };
    });
  }

  // src/components/GrammarCoverageExplorer.js
  var STORAGE_KEY3 = "stvisual.grammarPrograms.v1";
  var TAB_STORAGE_KEY = "stvisual.grammarActiveTab.v1";
  var DEFAULT_OPS = ["TR", "SD"];
  var DEFAULT_STRING_OPS = ["REP", "DEL"];
  var GRAMMAR_TABS = [
    { id: "derivations", labelKey: "grammar.tab.derivations" },
    { id: "mutation", labelKey: "grammar.tab.mutation" },
    { id: "string", labelKey: "grammar.tab.string" }
  ];
  var DEFAULT_TAB = "derivations";
  function loadActiveTab() {
    var _a2;
    try {
      const v = (_a2 = globalThis.localStorage) == null ? void 0 : _a2.getItem(TAB_STORAGE_KEY);
      return GRAMMAR_TABS.find((t2) => t2.id === v) ? v : DEFAULT_TAB;
    } catch {
      return DEFAULT_TAB;
    }
  }
  function saveActiveTab(id) {
    var _a2;
    try {
      (_a2 = globalThis.localStorage) == null ? void 0 : _a2.setItem(TAB_STORAGE_KEY, id);
    } catch {
    }
  }
  function escapeHtml4(value = "") {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  function loadLocalGrammars() {
    var _a2;
    try {
      const raw = (_a2 = globalThis.localStorage) == null ? void 0 : _a2.getItem(STORAGE_KEY3);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  function saveLocalGrammars(programs) {
    var _a2;
    try {
      (_a2 = globalThis.localStorage) == null ? void 0 : _a2.setItem(STORAGE_KEY3, JSON.stringify(programs));
    } catch {
    }
  }
  function formatProductionHtml(prod, highlight) {
    const rhs = prod.rhs.length === 0 ? '""' : prod.rhs.map((s) => s.kind === "NT" ? `<span class="grammar-nt">&lt;${escapeHtml4(s.value)}&gt;</span>` : `<span class="grammar-t">"${escapeHtml4(s.value)}"</span>`).join(" ");
    const cls = highlight ? "grammar-prod covered" : "grammar-prod";
    return `<div class="${cls}" data-prod-id="${prod.id}">
    <span class="grammar-prod-id">p${prod.id}</span>
    <span class="grammar-nt">&lt;${escapeHtml4(prod.lhs)}&gt;</span>
    <span class="grammar-arrow">::=</span>
    ${rhs}
  </div>`;
  }
  function createGrammarCoverageExplorer() {
    const root2 = document.createElement("div");
    root2.className = "grammar-coverage";
    root2.dataset.testid = "grammar-coverage";
    const initial = grammarExamples[0];
    const localPrograms = loadLocalGrammars();
    const initialText = localPrograms[initial.id] || initial.text;
    const state = {
      exampleId: initial.id,
      text: initialText,
      programs: localPrograms,
      customExamples: [],
      operators: new Set(DEFAULT_OPS),
      maxStrings: 8,
      maxDepth: 12,
      parseError: null,
      grammar: null,
      derivations: [],
      coverage: null,
      mutants: [],
      selectedMutantId: null,
      extraTests: "",
      // user-added test strings, one per line
      // Phase 3: Mutation on Strings (BNF Mutation)
      stringOperators: new Set(DEFAULT_STRING_OPS),
      seedIndex: 0,
      maxPerStringOp: 12,
      stringMutants: [],
      selectedStringMutantId: null,
      activeTab: loadActiveTab()
    };
    function persistCurrent() {
      state.programs[state.exampleId] = state.text;
      saveLocalGrammars(state.programs);
    }
    function recompute() {
      var _a2, _b;
      state.parseError = null;
      state.grammar = null;
      state.derivations = [];
      state.coverage = null;
      state.mutants = [];
      try {
        const g = parseGrammar(state.text);
        state.grammar = g;
        state.derivations = generateDerivations(g, {
          maxStrings: state.maxStrings,
          maxDepth: state.maxDepth
        });
        state.coverage = computeCoverage(state.derivations, g);
        const ops = [...state.operators];
        if (ops.length > 0) {
          const generated = generateGrammarMutants(g, ops);
          const allTestStrings = [
            ...state.derivations.map((d) => d.string),
            ...state.extraTests.split("\n").map((s) => s).filter((_, idx, arr) => arr.indexOf(arr[idx]) === idx)
          ];
          state.mutants = evaluateMutantsAgainstStrings(g, generated, allTestStrings);
        }
        if (!state.mutants.find((m) => m.id === state.selectedMutantId)) {
          state.selectedMutantId = ((_a2 = state.mutants[0]) == null ? void 0 : _a2.id) || null;
        }
        state.stringMutants = [];
        if (state.derivations.length > 0 && state.stringOperators.size > 0) {
          const idx = Math.min(state.seedIndex, state.derivations.length - 1);
          const seed = state.derivations[idx].string;
          const alphabet = deriveAlphabet(g, state.derivations.map((d) => d.string));
          const raw = generateStringMutants(seed, [...state.stringOperators], {
            alphabet,
            maxPerOp: state.maxPerStringOp
          });
          state.stringMutants = classifyStringMutants(g, raw);
        }
        if (!state.stringMutants.find((m) => m.id === state.selectedStringMutantId)) {
          state.selectedStringMutantId = ((_b = state.stringMutants[0]) == null ? void 0 : _b.id) || null;
        }
      } catch (err) {
        state.parseError = err.message || String(err);
      }
    }
    function loadExample(id) {
      const ex = grammarExamples.find((e) => e.id === id) || state.customExamples.find((e) => e.id === id);
      if (!ex) return;
      state.exampleId = id;
      state.text = state.programs[id] || ex.text;
      state.selectedMutantId = null;
    }
    function render() {
      var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      recompute();
      const allExamples = [...grammarExamples, ...state.customExamples];
      const exampleButtons = allExamples.map((ex) => `
      <button
        type="button"
        class="grammar-example-btn${state.exampleId === ex.id ? " active" : ""}"
        data-grammar-example="${ex.id}"
        title="${escapeHtml4(getLocale() === "en" ? ex.descriptionEn || ex.description : ex.description)}"
      >${escapeHtml4(pickField(ex, "name"))}</button>
    `).join("");
      const operatorButtons = GRAMMAR_OPERATORS.map((op) => `
      <label class="grammar-op-btn${state.operators.has(op) ? " active" : ""}">
        <input type="checkbox" data-grammar-op="${op}" ${state.operators.has(op) ? "checked" : ""} />
        <span>${op}</span>
      </label>
    `).join("");
      const productionsHtml = state.grammar ? state.grammar.productions.map((p) => {
        var _a3;
        return formatProductionHtml(p, (_a3 = state.coverage) == null ? void 0 : _a3.pdc.covered.has(p.id));
      }).join("") : "";
      const derivationsHtml = state.derivations.length === 0 ? `<p class="grammar-empty">${escapeHtml4(t("grammar.noDerivations"))}</p>` : `<ol class="grammar-derivations">
          ${state.derivations.map((d) => `<li><code>${escapeHtml4(d.string === "" ? "\u2205" : d.string)}</code>
            <span class="grammar-derivation-meta">depth ${d.depth} \xB7 p[${d.productionsUsed.join(", ")}]</span></li>`).join("")}
         </ol>`;
      const pdcRatio = state.coverage ? Math.round(state.coverage.pdc.ratio * 100) : 0;
      const tscRatio = state.coverage ? Math.round(state.coverage.tsc.ratio * 100) : 0;
      const terminalsHtml = state.grammar ? [...state.grammar.terminals].map((tm) => {
        var _a3;
        const covered = (_a3 = state.coverage) == null ? void 0 : _a3.tsc.covered.has(tm);
        return `<span class="grammar-terminal-chip${covered ? " covered" : ""}">"${escapeHtml4(tm)}"</span>`;
      }).join("") : "";
      const mutantsHtml = state.mutants.length === 0 ? `<p class="grammar-empty">${escapeHtml4(t("grammar.noMutants"))}</p>` : `<ul class="grammar-mutant-list">
          ${state.mutants.map((m) => `<li>
            <button type="button"
              class="grammar-mutant-btn${state.selectedMutantId === m.id ? " active" : ""} ${m.killed ? "killed" : "live"}"
              data-grammar-mutant="${escapeHtml4(m.id)}">
              <span class="grammar-mutant-op">${m.operator}</span>
              <span class="grammar-mutant-status">${m.killed ? t("grammar.killed") : t("grammar.live")}</span>
              <span class="grammar-mutant-desc">${escapeHtml4(m.description)}</span>
            </button>
          </li>`).join("")}
         </ul>`;
      const selectedMutant = state.mutants.find((m) => m.id === state.selectedMutantId) || null;
      const selectedMutantDetailHtml = selectedMutant ? `<div class="grammar-mutant-detail">
          <h5>${escapeHtml4(selectedMutant.id)}</h5>
          <p>${escapeHtml4(selectedMutant.description)}</p>
          ${selectedMutant.killed ? `<p class="grammar-mutant-killers"><strong>${escapeHtml4(t("grammar.killedBy"))}</strong></p>
               <ul class="grammar-killer-list">${selectedMutant.killers.slice(0, 8).map((k) => `<li><code>${escapeHtml4(k.string === "" ? "\u2205" : k.string)}</code> \xB7 ${k.origAccepts ? t("grammar.origAccepts") : t("grammar.origRejects")} \xB7 ${k.mutAccepts ? t("grammar.mutAccepts") : t("grammar.mutRejects")}</li>`).join("")}</ul>` : `<p class="grammar-mutant-live">${escapeHtml4(t("grammar.liveHint"))}</p>`}
        </div>` : `<p class="grammar-empty">${escapeHtml4(t("grammar.selectMutantHint"))}</p>`;
      const score = state.mutants.length === 0 ? null : { killed: state.mutants.filter((m) => m.killed).length, total: state.mutants.length };
      const seedOptionsHtml = state.derivations.map((d, idx) => `
      <option value="${idx}" ${idx === Math.min(state.seedIndex, state.derivations.length - 1) ? "selected" : ""}>
        #${idx + 1}: ${escapeHtml4(d.string === "" ? "\u2205" : d.string)}
      </option>`).join("");
      const stringOpButtons = STRING_MUTATION_OPERATORS.map((op) => `
      <label class="grammar-op-btn${state.stringOperators.has(op) ? " active" : ""}">
        <input type="checkbox" data-grammar-string-op="${op}" ${state.stringOperators.has(op) ? "checked" : ""} />
        <span>${op}</span>
      </label>
    `).join("");
      const stringMutantsHtml = state.stringMutants.length === 0 ? `<p class="grammar-empty">${escapeHtml4(t("grammar.string.empty"))}</p>` : `<table class="grammar-string-mutant-table" data-testid="grammar-string-mutant-table">
          <thead><tr>
            <th>Op</th>
            <th>${escapeHtml4(t("grammar.string.colMutated"))}</th>
            <th>${escapeHtml4(t("grammar.string.colKind"))}</th>
          </tr></thead>
          <tbody>
            ${state.stringMutants.map((m) => `<tr
                class="grammar-string-row ${m.kind === "positive" ? "positive" : "negative"}${state.selectedStringMutantId === m.id ? " active" : ""}"
                data-grammar-string-mutant="${escapeHtml4(m.id)}">
                <td><span class="grammar-op-tag">${m.operator}</span></td>
                <td><code>${escapeHtml4(m.mutated === "" ? "\u2205" : m.mutated)}</code></td>
                <td>${m.kind === "positive" ? `<span class="grammar-string-kind positive">\u2713 ${escapeHtml4(t("grammar.string.inLang"))}</span>` : `<span class="grammar-string-kind negative">\u2717 ${escapeHtml4(t("grammar.string.outLang"))}</span>`}</td>
              </tr>`).join("")}
          </tbody>
         </table>`;
      const positives = state.stringMutants.filter((m) => m.kind === "positive").length;
      const negatives = state.stringMutants.length - positives;
      const stringStats = state.stringMutants.length === 0 ? null : `<span class="grammar-string-stats" data-testid="grammar-string-stats">
          ${escapeHtml4(t("grammar.string.statsPositive"))}: ${positives} \xB7 ${escapeHtml4(t("grammar.string.statsNegative"))}: ${negatives}
        </span>`;
      const selectedStringMutant = state.stringMutants.find((m) => m.id === state.selectedStringMutantId) || null;
      const selectedStringDetailHtml = selectedStringMutant ? `<div class="grammar-string-detail">
          <p><strong>${escapeHtml4(selectedStringMutant.operator)}</strong> \xB7 ${escapeHtml4(selectedStringMutant.description)}</p>
          <p>${escapeHtml4(t("grammar.string.original"))}: <code>${escapeHtml4(selectedStringMutant.original === "" ? "\u2205" : selectedStringMutant.original)}</code></p>
          <p>${escapeHtml4(t("grammar.string.mutated"))}: <code>${escapeHtml4(selectedStringMutant.mutated === "" ? "\u2205" : selectedStringMutant.mutated)}</code></p>
          <p>${selectedStringMutant.flipped ? `<span class="grammar-string-flip">\u26A1 ${escapeHtml4(t("grammar.string.flipped"))}</span>` : `<span class="grammar-string-same">${escapeHtml4(t("grammar.string.sameLang"))}</span>`}</p>
        </div>` : `<p class="grammar-empty">${escapeHtml4(t("grammar.string.selectHint"))}</p>`;
      root2.innerHTML = `
      <div class="grammar-card">
        <header class="grammar-header">
          <p class="grammar-kicker">${escapeHtml4(t("grammar.kicker"))}</p>
          <h3>${escapeHtml4(t("grammar.title"))}</h3>
          <p class="grammar-subtitle">${escapeHtml4(t("grammar.subtitle"))}</p>
        </header>

        <div class="grammar-example-row" data-testid="grammar-example-row">
          ${exampleButtons}
        </div>

        <div class="grammar-editor-grid">
          <div class="grammar-editor-col">
            <label class="grammar-editor-label">
              ${escapeHtml4(t("grammar.bnfEditor"))}
              <textarea data-testid="grammar-text" rows="8" spellcheck="false">${escapeHtml4(state.text)}</textarea>
            </label>
            ${state.parseError ? `<p class="grammar-error" data-testid="grammar-parse-error">${escapeHtml4(state.parseError)}</p>` : ""}
            <div class="grammar-controls-row">
              <label>${escapeHtml4(t("grammar.maxStrings"))}
                <input type="number" min="1" max="40" value="${state.maxStrings}" data-grammar-max-strings />
              </label>
              <label>${escapeHtml4(t("grammar.maxDepth"))}
                <input type="number" min="1" max="40" value="${state.maxDepth}" data-grammar-max-depth />
              </label>
            </div>
            <label class="grammar-editor-label">
              ${escapeHtml4(t("grammar.extraTests"))}
              <textarea data-testid="grammar-extra-tests" rows="3" spellcheck="false" placeholder="${escapeHtml4(t("grammar.extraTestsHint"))}">${escapeHtml4(state.extraTests)}</textarea>
            </label>
          </div>

          <div class="grammar-editor-col">
            <h4>${escapeHtml4(t("grammar.productions"))}</h4>
            <div class="grammar-productions">${productionsHtml}</div>
            <div class="grammar-coverage-summary">
              <div class="grammar-metric">
                <span class="grammar-metric-label">PDC</span>
                <span class="grammar-metric-value" data-testid="grammar-pdc">${((_a2 = state.coverage) == null ? void 0 : _a2.pdc.covered.size) || 0} / ${((_b = state.coverage) == null ? void 0 : _b.pdc.all.size) || 0} (${pdcRatio}%)</span>
              </div>
              <div class="grammar-metric">
                <span class="grammar-metric-label">TSC</span>
                <span class="grammar-metric-value" data-testid="grammar-tsc">${((_c = state.coverage) == null ? void 0 : _c.tsc.covered.size) || 0} / ${((_d = state.coverage) == null ? void 0 : _d.tsc.all.size) || 0} (${tscRatio}%)</span>
              </div>
            </div>
            <div class="grammar-terminals">${terminalsHtml}</div>
          </div>
        </div>

        <nav class="grammar-subtab-row" data-testid="grammar-subtab-row" role="tablist">
          ${GRAMMAR_TABS.map((tab) => `
            <button type="button"
              class="grammar-subtab-btn${state.activeTab === tab.id ? " active" : ""}"
              data-grammar-subtab="${tab.id}"
              role="tab"
              aria-selected="${state.activeTab === tab.id ? "true" : "false"}"
            >${escapeHtml4(t(tab.labelKey))}</button>
          `).join("")}
        </nav>

        <div class="grammar-derivation-block" data-grammar-panel="derivations" style="display:${state.activeTab === "derivations" ? "" : "none"}">
          <h4>${escapeHtml4(t("grammar.derivations"))}</h4>
          ${derivationsHtml}
        </div>

        <div class="grammar-mutation-block" data-grammar-panel="mutation" style="display:${state.activeTab === "mutation" ? "" : "none"}">
          <div class="grammar-mutation-header">
            <h4>${escapeHtml4(t("grammar.mutations"))}</h4>
            ${score ? `<span class="grammar-score" data-testid="grammar-mutation-score">${t("grammar.scoreLabel")}: ${score.killed} / ${score.total} (${Math.round(score.killed / score.total * 100)}%)</span>` : ""}
          </div>
          <div class="grammar-op-row">${operatorButtons}</div>
          <div class="grammar-mutation-grid">
            <div>${mutantsHtml}</div>
            <div>${selectedMutantDetailHtml}</div>
          </div>
        </div>

        <div class="grammar-string-block" data-testid="grammar-string-block" data-grammar-panel="string" style="display:${state.activeTab === "string" ? "" : "none"}">
          <div class="grammar-mutation-header">
            <h4>${escapeHtml4(t("grammar.string.title"))}</h4>
            ${stringStats || ""}
          </div>
          <p class="grammar-string-subtitle">${escapeHtml4(t("grammar.string.subtitle"))}</p>
          <div class="grammar-string-controls">
            <label>${escapeHtml4(t("grammar.string.seed"))}
              <select data-grammar-seed-select ${state.derivations.length === 0 ? "disabled" : ""}>${seedOptionsHtml}</select>
            </label>
            <label>${escapeHtml4(t("grammar.string.maxPerOp"))}
              <input type="number" min="1" max="50" value="${state.maxPerStringOp}" data-grammar-max-per-string-op />
            </label>
          </div>
          <div class="grammar-op-row">${stringOpButtons}</div>
          <div class="grammar-mutation-grid">
            <div>${stringMutantsHtml}</div>
            <div>${selectedStringDetailHtml}</div>
          </div>
        </div>
      </div>
    `;
      root2.querySelectorAll("[data-grammar-example]").forEach((btn) => {
        btn.addEventListener("click", () => {
          loadExample(btn.dataset.grammarExample);
          render();
        });
      });
      root2.querySelectorAll("[data-grammar-subtab]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.activeTab = btn.dataset.grammarSubtab;
          saveActiveTab(state.activeTab);
          render();
        });
      });
      const ta = root2.querySelector('[data-testid="grammar-text"]');
      ta == null ? void 0 : ta.addEventListener("input", (e) => {
        state.text = e.target.value;
        persistCurrent();
      });
      ta == null ? void 0 : ta.addEventListener("change", () => {
        render();
      });
      (_e = root2.querySelector('[data-testid="grammar-extra-tests"]')) == null ? void 0 : _e.addEventListener("input", (e) => {
        state.extraTests = e.target.value;
      });
      (_f = root2.querySelector('[data-testid="grammar-extra-tests"]')) == null ? void 0 : _f.addEventListener("change", () => render());
      (_g = root2.querySelector("[data-grammar-max-strings]")) == null ? void 0 : _g.addEventListener("change", (e) => {
        state.maxStrings = Math.max(1, Math.min(40, Number(e.target.value) || 1));
        render();
      });
      (_h = root2.querySelector("[data-grammar-max-depth]")) == null ? void 0 : _h.addEventListener("change", (e) => {
        state.maxDepth = Math.max(1, Math.min(40, Number(e.target.value) || 1));
        render();
      });
      root2.querySelectorAll("[data-grammar-op]").forEach((cb) => {
        cb.addEventListener("change", (e) => {
          const op = e.target.dataset.grammarOp;
          if (e.target.checked) state.operators.add(op);
          else state.operators.delete(op);
          render();
        });
      });
      root2.querySelectorAll("[data-grammar-mutant]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.selectedMutantId = btn.dataset.grammarMutant;
          render();
        });
      });
      (_i = root2.querySelector("[data-grammar-seed-select]")) == null ? void 0 : _i.addEventListener("change", (e) => {
        state.seedIndex = Math.max(0, Number(e.target.value) || 0);
        state.selectedStringMutantId = null;
        render();
      });
      (_j = root2.querySelector("[data-grammar-max-per-string-op]")) == null ? void 0 : _j.addEventListener("change", (e) => {
        state.maxPerStringOp = Math.max(1, Math.min(50, Number(e.target.value) || 1));
        render();
      });
      root2.querySelectorAll("[data-grammar-string-op]").forEach((cb) => {
        cb.addEventListener("change", (e) => {
          const op = e.target.dataset.grammarStringOp;
          if (e.target.checked) state.stringOperators.add(op);
          else state.stringOperators.delete(op);
          render();
        });
      });
      root2.querySelectorAll("[data-grammar-string-mutant]").forEach((row) => {
        row.addEventListener("click", () => {
          state.selectedStringMutantId = row.dataset.grammarStringMutant;
          render();
        });
      });
    }
    render();
    if (typeof globalThis.addEventListener === "function") {
      globalThis.addEventListener("stvisual:load-program-source", (event) => {
        var _a2;
        if (!root2.isConnected) return;
        const detail = event.detail || {};
        if (detail.target !== "grammar") return;
        const content = String((_a2 = detail.content) != null ? _a2 : "");
        const baseName = (detail.name || "uploaded").replace(/\.[^.]+$/, "") || "uploaded";
        const id = `uploaded-grammar-${Date.now().toString(36)}`;
        const newExample = {
          id,
          name: baseName,
          nameEn: baseName,
          description: `Uploaded from cloud: ${detail.name || baseName}`,
          descriptionEn: `Uploaded from cloud: ${detail.name || baseName}`,
          text: content
        };
        state.customExamples = [...state.customExamples, newExample];
        state.programs[id] = content;
        state.exampleId = id;
        state.text = content;
        state.selectedMutantId = null;
        persistCurrent();
        render();
      });
    }
    return root2;
  }

  // src/utils/specMutation.js
  var SPEC_MUTATION_OPERATORS = ["ENF", "BCR", "CRR", "LRO", "UOI", "MCR"];
  var TRUE_NODE = { type: "const", value: true };
  var FALSE_NODE = { type: "const", value: false };
  function cloneAst(node) {
    switch (node.type) {
      case "clause":
        return { type: "clause", name: node.name };
      case "const":
        return { type: "const", value: node.value };
      case "not":
        return { type: "not", operand: cloneAst(node.operand) };
      case "and":
      case "or":
        return { type: node.type, left: cloneAst(node.left), right: cloneAst(node.right) };
      default:
        throw new Error(`Unknown AST node: ${node.type}`);
    }
  }
  function evaluateAst2(node, values) {
    switch (node.type) {
      case "const":
        return Boolean(node.value);
      case "clause": {
        if (!(node.name in values)) throw new Error(`Missing clause value: ${node.name}`);
        return Boolean(values[node.name]);
      }
      case "not":
        return !evaluateAst2(node.operand, values);
      case "and":
        return evaluateAst2(node.left, values) && evaluateAst2(node.right, values);
      case "or":
        return evaluateAst2(node.left, values) || evaluateAst2(node.right, values);
      default:
        throw new Error(`Unknown AST node: ${node.type}`);
    }
  }
  function astToString(node) {
    switch (node.type) {
      case "const":
        return node.value ? "true" : "false";
      case "clause":
        return node.name;
      case "not": {
        const inner = node.operand;
        const innerStr = astToString(inner);
        const needParen = inner.type === "and" || inner.type === "or";
        return `!${needParen ? `(${innerStr})` : innerStr}`;
      }
      case "and":
      case "or": {
        const op = node.type === "and" ? "&&" : "||";
        const wrap = (child) => {
          const s = astToString(child);
          if (child.type === "and" || child.type === "or") return `(${s})`;
          return s;
        };
        return `${wrap(node.left)} ${op} ${wrap(node.right)}`;
      }
      default:
        throw new Error(`Unknown AST node: ${node.type}`);
    }
  }
  function* walkWithReplacers(root2) {
    function* walk(node, replaceInParent) {
      yield [node, replaceInParent];
      if (node.type === "not") {
        yield* walk(node.operand, (newOperand) => {
          const replaced = { ...node, operand: newOperand };
          return replaceInParent(replaced);
        });
      } else if (node.type === "and" || node.type === "or") {
        yield* walk(node.left, (newLeft) => {
          const replaced = { ...node, left: newLeft };
          return replaceInParent(replaced);
        });
        yield* walk(node.right, (newRight) => {
          const replaced = { ...node, right: newRight };
          return replaceInParent(replaced);
        });
      }
    }
    function topReplace(newRoot) {
      return cloneAst(newRoot);
    }
    yield* walk(root2, topReplace);
  }
  function generateSpecMutants(parsed, opIds = SPEC_MUTATION_OPERATORS) {
    if (!(parsed == null ? void 0 : parsed.ast)) throw new Error("parsed.ast is required");
    const ops = new Set(opIds);
    const mutants = [];
    const seenStrings = /* @__PURE__ */ new Set();
    const originalStr = astToString(parsed.ast);
    const push = (operator, ast, description) => {
      const text = astToString(ast);
      if (text === originalStr) return;
      const key = `${operator}|${text}`;
      if (seenStrings.has(key)) return;
      seenStrings.add(key);
      mutants.push({
        id: `${operator}:${mutants.length}`,
        operator,
        description,
        ast,
        text
      });
    };
    if (ops.has("ENF")) {
      push("ENF", { type: "not", operand: cloneAst(parsed.ast) }, "Negate the entire predicate");
    }
    for (const [node, replace] of walkWithReplacers(parsed.ast)) {
      if (ops.has("BCR") && node.type === "clause") {
        push("BCR", replace(TRUE_NODE), `Replace clause '${node.name}' with true`);
        push("BCR", replace(FALSE_NODE), `Replace clause '${node.name}' with false`);
      }
      if (ops.has("CRR") && node.type === "clause") {
        for (const other of parsed.clauses) {
          if (other === node.name) continue;
          push("CRR", replace({ type: "clause", name: other }), `Replace clause '${node.name}' with '${other}'`);
        }
      }
      if (ops.has("LRO") && (node.type === "and" || node.type === "or")) {
        const swapped = node.type === "and" ? "or" : "and";
        push("LRO", replace({ ...node, type: swapped }), `Replace ${node.type.toUpperCase()} with ${swapped.toUpperCase()}`);
      }
      if (ops.has("UOI") && node.type === "clause") {
        push("UOI", replace({ type: "not", operand: { type: "clause", name: node.name } }), `Insert NOT around clause '${node.name}'`);
      }
      if (ops.has("MCR") && (node.type === "and" || node.type === "or")) {
        push("MCR", replace(cloneAst(node.left)), `Drop right operand of ${node.type.toUpperCase()} (keep left)`);
        push("MCR", replace(cloneAst(node.right)), `Drop left operand of ${node.type.toUpperCase()} (keep right)`);
      }
    }
    return mutants;
  }
  function evaluateSpecMutants(parsed, mutants, tests) {
    const originalValues = tests.map((t2) => evaluateAst2(parsed.ast, t2));
    return mutants.map((m) => {
      const killers = [];
      for (let i = 0; i < tests.length; i++) {
        let mutValue;
        try {
          mutValue = evaluateAst2(m.ast, tests[i]);
        } catch {
          continue;
        }
        if (mutValue !== originalValues[i]) {
          killers.push({ test: tests[i], orig: originalValues[i], mut: mutValue });
        }
      }
      return { ...m, killed: killers.length > 0, killers };
    });
  }
  function buildAssignmentSpace(clauses) {
    const total = 1 << clauses.length;
    const out = [];
    for (let mask = 0; mask < total; mask++) {
      const values = {};
      clauses.forEach((c, i) => {
        values[c] = Boolean(mask >> clauses.length - 1 - i & 1);
      });
      out.push(values);
    }
    return out;
  }

  // src/utils/specFsm.js
  var STATE_RADIUS = 34;
  var SVG_W = 280;
  var SVG_H = 200;
  var SAFE_X = 70;
  var VIO_X = SVG_W - 70;
  var Y = SVG_H / 2;
  function escapeXml(s = "") {
    return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  function shortAssignment(values, clauses) {
    return clauses.map((c) => `${c}=${values[c] ? "T" : "F"}`).join(" ");
  }
  function buildMonitor(ast, clauses) {
    const assignments = buildAssignmentSpace(clauses);
    const trueSet = [];
    const falseSet = [];
    for (const a of assignments) {
      if (evaluateAst2(ast, a)) trueSet.push(a);
      else falseSet.push(a);
    }
    return { assignments, trueSet, falseSet };
  }
  function transitionLabel(assignments, clauses, max = 3) {
    if (assignments.length === 0) return "\u2205";
    const sample = assignments.slice(0, max).map((a) => shortAssignment(a, clauses));
    const more = assignments.length - max;
    return more > 0 ? `${sample.join(" ; ")} (+${more})` : sample.join(" ; ");
  }
  function renderMonitorSvg({
    ast,
    clauses,
    title,
    flippedSet = null,
    // Set<string> of assignment keys (e.g. "a=T b=F")
    emptyLabel = "\u2205",
    testId = "spec-fsm"
  } = {}) {
    if (!ast || !clauses || clauses.length === 0) {
      return `<div class="spec-fsm-empty">${escapeXml(emptyLabel)}</div>`;
    }
    const tooBig = clauses.length > 4;
    const monitor = buildMonitor(ast, clauses);
    const mark = (a) => {
      if (!flippedSet) return false;
      return flippedSet.has(shortAssignment(a, clauses));
    };
    const safeToVio = monitor.falseSet;
    const safeToSafe = monitor.trueSet;
    const vioToSafe = monitor.trueSet;
    const vioToVio = monitor.falseSet;
    const anyKiller = (xs) => flippedSet ? xs.some((a) => mark(a)) : false;
    const labelForward = tooBig ? `${safeToVio.length} / ${monitor.assignments.length} assignments` : transitionLabel(safeToVio, clauses);
    const labelRecover = tooBig ? `${vioToSafe.length} / ${monitor.assignments.length} assignments` : transitionLabel(vioToSafe, clauses);
    const labelSafeLoop = tooBig ? `${safeToSafe.length}` : transitionLabel(safeToSafe, clauses);
    const labelVioLoop = tooBig ? `${vioToVio.length}` : transitionLabel(vioToVio, clauses);
    const fwdKiller = anyKiller(safeToVio);
    const recKiller = anyKiller(vioToSafe);
    const safeLoopKiller = anyKiller(safeToSafe);
    const vioLoopKiller = anyKiller(vioToVio);
    const cls = (killer) => `spec-fsm-edge${killer ? " killer" : ""}`;
    const topArc = `M ${SAFE_X + STATE_RADIUS},${Y - 6} Q ${SVG_W / 2},${Y - 80} ${VIO_X - STATE_RADIUS},${Y - 6}`;
    const bottomArc = `M ${VIO_X - STATE_RADIUS},${Y + 6} Q ${SVG_W / 2},${Y + 80} ${SAFE_X + STATE_RADIUS},${Y + 6}`;
    const safeLoop = `M ${SAFE_X - 14},${Y - STATE_RADIUS + 4} q -22,-30 0,-44 q 22,14 0,44`;
    const vioLoop = `M ${VIO_X - 14},${Y - STATE_RADIUS + 4} q -22,-30 0,-44 q 22,14 0,44`;
    return `
    <figure class="spec-fsm" data-testid="${escapeXml(testId)}">
      ${title ? `<figcaption class="spec-fsm-title">${escapeXml(title)}</figcaption>` : ""}
      <svg viewBox="0 0 ${SVG_W} ${SVG_H}" role="img" aria-label="${escapeXml(title || "monitor")}">
        <defs>
          <marker id="arrow-${escapeXml(testId)}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>

        <!-- self loops -->
        <path d="${safeLoop}" class="${cls(safeLoopKiller)}" fill="none" marker-end="url(#arrow-${escapeXml(testId)})" />
        <path d="${vioLoop}" class="${cls(vioLoopKiller)}" fill="none" marker-end="url(#arrow-${escapeXml(testId)})" />
        <text x="${SAFE_X - 14}" y="${Y - STATE_RADIUS - 32}" class="spec-fsm-edge-label">P=T (${labelSafeLoop})</text>
        <text x="${VIO_X - 14}" y="${Y - STATE_RADIUS - 32}" class="spec-fsm-edge-label">P=F (${labelVioLoop})</text>

        <!-- safe -> violation (top arc) -->
        <path d="${topArc}" class="${cls(fwdKiller)}" fill="none" marker-end="url(#arrow-${escapeXml(testId)})" />
        <text x="${SVG_W / 2}" y="${Y - 60}" text-anchor="middle" class="spec-fsm-edge-label">P=F \xB7 ${escapeXml(labelForward)}</text>

        <!-- violation -> safe (bottom arc) -->
        <path d="${bottomArc}" class="${cls(recKiller)}" fill="none" marker-end="url(#arrow-${escapeXml(testId)})" />
        <text x="${SVG_W / 2}" y="${Y + 70}" text-anchor="middle" class="spec-fsm-edge-label">P=T \xB7 ${escapeXml(labelRecover)}</text>

        <!-- states -->
        <g class="spec-fsm-state safe">
          <circle cx="${SAFE_X}" cy="${Y}" r="${STATE_RADIUS}" />
          <text x="${SAFE_X}" y="${Y - 2}" text-anchor="middle">SAFE</text>
          <text x="${SAFE_X}" y="${Y + 14}" text-anchor="middle" class="spec-fsm-state-sub">P=T</text>
        </g>
        <g class="spec-fsm-state violation">
          <circle cx="${VIO_X}" cy="${Y}" r="${STATE_RADIUS}" />
          <text x="${VIO_X}" y="${Y - 2}" text-anchor="middle">VIOLATION</text>
          <text x="${VIO_X}" y="${Y + 14}" text-anchor="middle" class="spec-fsm-state-sub">P=F</text>
        </g>
      </svg>
    </figure>
  `;
  }
  function flippedKeysFromKillers(killers, clauses) {
    return new Set(killers.map((k) => shortAssignment(k.test, clauses)));
  }

  // src/components/SpecMutationExplorer.js
  var STORAGE_KEY4 = "stvisual.specMutation.v1";
  var DEFAULT_PREDICATE = "(a || b) && c";
  var DEFAULT_OPS2 = ["ENF", "BCR", "LRO", "UOI"];
  var SPEC_CATEGORIES = [
    { id: "basic", labelKey: "spec.cat.basic" },
    { id: "smv", labelKey: "spec.cat.smv" }
  ];
  var DEFAULT_CATEGORY = "basic";
  function escapeHtml5(value = "") {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  var SPEC_EXAMPLES = [
    {
      id: "guard",
      name: "Guard",
      category: "basic",
      text: "(a || b) && c",
      description: "Generic Boolean guard for an action."
    },
    {
      id: "leap",
      name: "Leap year",
      category: "basic",
      text: "(y && !c) || (y && c && q)",
      description: "Leap-year predicate: divisible by 4 (y) and (not by 100 (c) or by 400 (q))."
    },
    {
      id: "triangle",
      name: "Triangle ineq.",
      category: "basic",
      text: "a && b && c",
      description: "All three triangle-inequality clauses must hold."
    },
    // --- SMV / model-checking style invariants (Ammann/Offutt §9.5) ---
    {
      id: "smv-mutex",
      name: "Mutual exclusion",
      category: "smv",
      text: "!(c1 && c2)",
      description: "Two-process mutual exclusion invariant: never both critical.",
      smv: `MODULE proc(other_critical, turn, id)
VAR
  state : { idle, trying, critical };
ASSIGN
  init(state) := idle;
  next(state) :=
    case
      state = idle                                : { idle, trying };
      state = trying & !other_critical & turn=id : critical;
      state = trying                              : trying;
      state = critical                            : { critical, idle };
      TRUE                                        : state;
    esac;

MODULE main
VAR
  turn : { 1, 2 };
  p1   : proc(p2.state = critical, turn, 1);
  p2   : proc(p1.state = critical, turn, 2);
DEFINE
  c1 := p1.state = critical;
  c2 := p2.state = critical;

-- Safety: never both processes in the critical section
INVARSPEC !(c1 & c2)`
    },
    {
      id: "smv-cruise",
      name: "Cruise control",
      category: "smv",
      text: "!cruise || (ignition && running && !brake)",
      description: "Cruise control safety: cruise active implies ignition on, engine running, brake released.",
      smv: `MODULE main
VAR
  ignition : boolean;
  running  : boolean;
  brake    : boolean;
  cruise   : boolean;
ASSIGN
  init(ignition) := FALSE;
  init(running)  := FALSE;
  init(brake)    := FALSE;
  init(cruise)   := FALSE;

  -- Driver may toggle ignition / brake non-deterministically.
  next(ignition) := { TRUE, FALSE };
  next(brake)    := { TRUE, FALSE };
  -- Engine runs only while ignition is on.
  next(running)  := ignition;
  -- Cruise can only be engaged when ignition is on, engine is running and
  -- the brake is released; pressing brake disengages cruise.
  next(cruise) :=
    case
      brake          : FALSE;
      !ignition      : FALSE;
      !running       : FALSE;
      TRUE           : { TRUE, FALSE };
    esac;

-- Safety: cruise active implies ignition on, engine running, brake released
INVARSPEC !cruise | (ignition & running & !brake)`
    },
    {
      id: "smv-sis",
      name: "Safety injection",
      category: "smv",
      text: "(si && pressure && !override) || (!si && (!pressure || override))",
      description: "Safety Injection System (Parnas/Heimdahl): SI on iff pressure low and not overridden.",
      smv: `MODULE main
VAR
  pressure : boolean;   -- TRUE when reactor pressure is BELOW threshold
  override : boolean;   -- operator override switch
  si       : boolean;   -- safety injection actuator
ASSIGN
  init(pressure) := FALSE;
  init(override) := FALSE;
  init(si)       := FALSE;

  next(pressure) := { TRUE, FALSE };
  next(override) := { TRUE, FALSE };
  -- SI must turn on iff pressure is below threshold AND not overridden.
  next(si) := pressure & !override;

-- Functional spec: SI on  <-> (pressure low AND not overridden)
INVARSPEC (si & pressure & !override) | (!si & (!pressure | override))`
    },
    {
      id: "smv-train",
      name: "Train-gate",
      category: "smv",
      text: "!train || (gate && signal)",
      description: "Train-Gate-Controller invariant: when a train is at the crossing, gate is down and signal is red.",
      smv: `MODULE main
VAR
  train  : boolean;   -- train present at crossing
  gate   : boolean;   -- gate down
  signal : boolean;   -- signal red (stop)
ASSIGN
  init(train)  := FALSE;
  init(gate)   := FALSE;
  init(signal) := FALSE;

  -- Train arrives / departs non-deterministically.
  next(train) := { TRUE, FALSE };
  -- Controller lowers gate and turns red signal whenever a train is present
  -- (and may keep them set briefly after the train leaves).
  next(gate)   := train | gate & next(train);
  next(signal) := train | signal & next(train);

-- Safety: train present  ->  gate down AND signal red
INVARSPEC !train | (gate & signal)`
    },
    {
      id: "smv-elevator",
      name: "Elevator door",
      category: "smv",
      text: "!moving || !door",
      description: "Elevator safety invariant: cabin must not move while a door is open.",
      smv: `MODULE main
VAR
  door   : boolean;   -- TRUE  = door open
  moving : boolean;   -- TRUE  = cabin moving
ASSIGN
  init(door)   := TRUE;
  init(moving) := FALSE;

  -- Door may open/close while the cabin is stopped.
  next(door) :=
    case
      moving : door;            -- cannot change door state mid-travel
      TRUE   : { TRUE, FALSE };
    esac;
  -- Cabin may start moving only when the door is closed.
  next(moving) :=
    case
      door   : FALSE;
      TRUE   : { TRUE, FALSE };
    esac;

-- Safety: never moving while a door is open
INVARSPEC !moving | !door`
    },
    {
      id: "smv-garage",
      name: "Garage door",
      category: "smv",
      text: "(!u || !t) && (!d || !o)",
      description: "Garage-door controller: drive up only when not at top sensor; drive down only when no obstruction.",
      smv: `MODULE main
VAR
  u : boolean;   -- motor driving up
  d : boolean;   -- motor driving down
  t : boolean;   -- top end-stop sensor
  o : boolean;   -- IR obstruction beam broken
ASSIGN
  init(u) := FALSE;
  init(d) := FALSE;
  init(t) := FALSE;
  init(o) := FALSE;

  -- End-stop and obstruction change non-deterministically.
  next(t) := { TRUE, FALSE };
  next(o) := { TRUE, FALSE };

  -- Controller: never drive both directions; cut UP when at top;
  -- cut DOWN when an obstruction is detected.
  next(u) :=
    case
      next(t)        : FALSE;
      d              : FALSE;
      TRUE           : { TRUE, FALSE };
    esac;
  next(d) :=
    case
      next(o)        : FALSE;
      u              : FALSE;
      TRUE           : { TRUE, FALSE };
    esac;

-- Safety: motor up implies not at top, motor down implies no obstruction
INVARSPEC (!u | !t) & (!d | !o)`
    },
    {
      id: "smv-wiper",
      name: "Windshield wiper",
      category: "smv",
      text: "!w || (i && (l || h))",
      description: "Windshield-wiper controller: wipers operate only when ignition is on and the lever is in a non-off position.",
      smv: `MODULE main
VAR
  i : boolean;   -- ignition on
  l : boolean;   -- lever in LOW position
  h : boolean;   -- lever in HIGH position
  w : boolean;   -- wiper motor running
ASSIGN
  init(i) := FALSE;
  init(l) := FALSE;
  init(h) := FALSE;
  init(w) := FALSE;

  -- Driver may toggle ignition; lever positions are mutually exclusive.
  next(i) := { TRUE, FALSE };
  next(l) :=
    case
      next(h) : FALSE;
      TRUE    : { TRUE, FALSE };
    esac;
  next(h) := { TRUE, FALSE };

  -- Wipers run iff ignition is on AND lever selects LOW or HIGH.
  next(w) := next(i) & (next(l) | next(h));

-- Safety: wipers on implies ignition on and lever not in OFF position
INVARSPEC !w | (i & (l | h))`
    }
  ];
  function loadSaved() {
    var _a2;
    try {
      const raw = (_a2 = globalThis.localStorage) == null ? void 0 : _a2.getItem(STORAGE_KEY4);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }
  function persist(state) {
    var _a2;
    try {
      (_a2 = globalThis.localStorage) == null ? void 0 : _a2.setItem(STORAGE_KEY4, JSON.stringify({
        text: state.text,
        operators: [...state.operators],
        activeCategory: state.activeCategory,
        tests: state.tests
      }));
    } catch {
    }
  }
  function formatAssignment(values) {
    return Object.entries(values).map(([k, v]) => `${k}=${v ? "T" : "F"}`).join(", ");
  }
  function createSpecMutationExplorer() {
    const root2 = document.createElement("div");
    root2.className = "spec-mutation";
    root2.dataset.testid = "spec-mutation";
    const saved = loadSaved();
    const state = {
      text: (saved == null ? void 0 : saved.text) || DEFAULT_PREDICATE,
      operators: new Set((saved == null ? void 0 : saved.operators) || DEFAULT_OPS2),
      activeCategory: (saved == null ? void 0 : saved.activeCategory) || DEFAULT_CATEGORY,
      parseError: null,
      parsed: null,
      mutants: [],
      selectedMutantId: null,
      // tests: array of {id, values:{clause:bool}, manual:bool}
      tests: Array.isArray(saved == null ? void 0 : saved.tests) ? saved.tests : null,
      useFullTable: true
      // when true tests = full truth table
    };
    function recompute() {
      var _a2;
      state.parseError = null;
      state.parsed = null;
      state.mutants = [];
      try {
        const parsed = parsePredicate(state.text);
        state.parsed = parsed;
        const ops = [...state.operators];
        const generated = ops.length > 0 ? generateSpecMutants(parsed, ops) : [];
        let tests;
        if (state.useFullTable) {
          tests = buildAssignmentSpace(parsed.clauses);
        } else {
          tests = (state.tests || []).map((t2) => {
            var _a3;
            const v = {};
            for (const c of parsed.clauses) v[c] = !!((_a3 = t2.values) == null ? void 0 : _a3[c]);
            return v;
          });
        }
        state.mutants = evaluateSpecMutants(parsed, generated, tests);
        if (!state.mutants.find((m) => m.id === state.selectedMutantId)) {
          state.selectedMutantId = ((_a2 = state.mutants[0]) == null ? void 0 : _a2.id) || null;
        }
      } catch (err) {
        state.parseError = err.message || String(err);
      }
      persist(state);
    }
    function render() {
      var _a2, _b, _c;
      recompute();
      const currentExample = SPEC_EXAMPLES.find((ex) => state.text.trim() === ex.text) || null;
      const categoryButtons = SPEC_CATEGORIES.map((cat) => `
      <button type="button"
        class="spec-category-btn${state.activeCategory === cat.id ? " active" : ""}"
        data-spec-category="${cat.id}">${escapeHtml5(t(cat.labelKey))}</button>
    `).join("");
      const visibleExamples = SPEC_EXAMPLES.filter((ex) => ex.category === state.activeCategory);
      const exampleButtons = visibleExamples.map((ex) => `
      <button type="button" class="spec-example-btn${state.text.trim() === ex.text ? " active" : ""}"
        data-spec-example="${ex.id}" title="${escapeHtml5(ex.description || "")}">${escapeHtml5(ex.name)}</button>
    `).join("");
      const operatorButtons = SPEC_MUTATION_OPERATORS.map((op) => `
      <label class="grammar-op-btn${state.operators.has(op) ? " active" : ""}" title="${escapeHtml5(t(`spec.op.${op}`))}">
        <input type="checkbox" data-spec-op="${op}" ${state.operators.has(op) ? "checked" : ""} />
        <span>${op}</span>
      </label>
    `).join("");
      const score = state.mutants.length === 0 ? null : { killed: state.mutants.filter((m) => m.killed).length, total: state.mutants.length };
      const mutantsHtml = state.mutants.length === 0 ? `<p class="grammar-empty">${escapeHtml5(t("spec.noMutants"))}</p>` : `<ul class="grammar-mutant-list" data-testid="spec-mutant-list">
          ${state.mutants.map((m) => `<li>
            <button type="button"
              class="grammar-mutant-btn${state.selectedMutantId === m.id ? " active" : ""} ${m.killed ? "killed" : "live"}"
              data-spec-mutant="${escapeHtml5(m.id)}">
              <span class="grammar-mutant-op">${m.operator}</span>
              <span class="grammar-mutant-status">${m.killed ? t("grammar.killed") : t("grammar.live")}</span>
              <span class="grammar-mutant-desc">
                <code>${escapeHtml5(m.text)}</code>
                <small>${escapeHtml5(m.description)}</small>
              </span>
            </button>
          </li>`).join("")}
         </ul>`;
      const selected = state.mutants.find((m) => m.id === state.selectedMutantId) || null;
      const flippedSet = selected ? flippedKeysFromKillers(selected.killers, ((_a2 = state.parsed) == null ? void 0 : _a2.clauses) || []) : null;
      const fsmHtml = state.parsed ? `<div class="spec-fsm-grid" data-testid="spec-fsm-grid">
          ${renderMonitorSvg({
        ast: state.parsed.ast,
        clauses: state.parsed.clauses,
        title: t("spec.fsm.original"),
        flippedSet: null,
        testId: "spec-fsm-original"
      })}
          ${renderMonitorSvg({
        ast: selected ? selected.ast : state.parsed.ast,
        clauses: state.parsed.clauses,
        title: selected ? `${t("spec.fsm.mutant")}: ${selected.id}` : t("spec.fsm.pickMutant"),
        flippedSet,
        testId: "spec-fsm-mutant"
      })}
         </div>
         <p class="spec-fsm-legend">${escapeHtml5(t("spec.fsm.legend"))}</p>` : "";
      const selectedDetailHtml = selected ? `<div class="spec-mutant-detail">
          <h5>${escapeHtml5(selected.id)}</h5>
          <p>${escapeHtml5(selected.description)}</p>
          <p><strong>${escapeHtml5(t("spec.mutantText"))}:</strong> <code>${escapeHtml5(selected.text)}</code></p>
          ${selected.killed ? `<p><strong>${escapeHtml5(t("grammar.killedBy"))}</strong></p>
               <ul class="grammar-killer-list">${selected.killers.slice(0, 8).map((k) => `<li>
                 <code>${escapeHtml5(formatAssignment(k.test))}</code>
                 \xB7 orig=${k.orig ? "T" : "F"} \xB7 mut=${k.mut ? "T" : "F"}
               </li>`).join("")}</ul>` : `<p class="grammar-mutant-live">${escapeHtml5(t("spec.equivalentHint"))}</p>`}
        </div>` : `<p class="grammar-empty">${escapeHtml5(t("grammar.selectMutantHint"))}</p>`;
      root2.innerHTML = `
      <div class="grammar-card spec-card">
        <header class="grammar-header">
          <p class="grammar-kicker">${escapeHtml5(t("spec.kicker"))}</p>
          <h3>${escapeHtml5(t("spec.title"))}</h3>
          <p class="grammar-subtitle">${escapeHtml5(t("spec.subtitle"))}</p>
        </header>

        <nav class="spec-category-row" data-testid="spec-category-row" role="tablist" aria-label="${escapeHtml5(t("spec.cat.aria"))}">${categoryButtons}</nav>
        <div class="grammar-example-row" data-testid="spec-example-row">${exampleButtons}</div>
        ${(currentExample == null ? void 0 : currentExample.description) ? `<p class="spec-example-caption" data-testid="spec-example-caption">${escapeHtml5(currentExample.description)}</p>` : ""}
        ${(currentExample == null ? void 0 : currentExample.smv) ? `<details class="spec-smv-source" data-testid="spec-smv-source" open>
          <summary>${escapeHtml5(t("spec.smv.viewSource"))}</summary>
          <pre><code>${escapeHtml5(currentExample.smv)}</code></pre>
        </details>` : ""}

        <div class="spec-editor-row">
          <label class="grammar-editor-label">
            ${escapeHtml5(t("spec.predicateLabel"))}
            <input type="text" data-testid="spec-text" value="${escapeHtml5(state.text)}" spellcheck="false" />
          </label>
          ${state.parseError ? `<p class="grammar-error" data-testid="spec-parse-error">${escapeHtml5(state.parseError)}</p>` : ""}
          ${state.parsed ? `<p class="spec-clauses">
            <strong>${escapeHtml5(t("spec.clauses"))}:</strong> ${state.parsed.clauses.map((c) => `<code>${escapeHtml5(c)}</code>`).join(", ") || "\u2014"}
            \xB7 <strong>${escapeHtml5(t("spec.canonical"))}:</strong> <code>${escapeHtml5(astToString(state.parsed.ast))}</code>
          </p>` : ""}
        </div>

        <div class="grammar-mutation-block">
          <div class="grammar-mutation-header">
            <h4>${escapeHtml5(t("spec.mutants"))}</h4>
            ${score ? `<span class="grammar-score" data-testid="spec-mutation-score">${escapeHtml5(t("grammar.scoreLabel"))}: ${score.killed} / ${score.total} (${Math.round(score.killed / score.total * 100)}%)</span>` : ""}
          </div>
          <p class="spec-test-note">${escapeHtml5(t("spec.testNote"))}</p>
          <div class="grammar-op-row">${operatorButtons}</div>
          <div class="grammar-mutation-grid">
            <div>${mutantsHtml}</div>
            <div>${selectedDetailHtml}</div>
          </div>
          ${fsmHtml}
        </div>
      </div>
    `;
      root2.querySelectorAll("[data-spec-category]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.activeCategory = btn.dataset.specCategory;
          render();
        });
      });
      root2.querySelectorAll("[data-spec-example]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const ex = SPEC_EXAMPLES.find((e) => e.id === btn.dataset.specExample);
          if (!ex) return;
          state.text = ex.text;
          state.activeCategory = ex.category || state.activeCategory;
          state.selectedMutantId = null;
          render();
        });
      });
      (_b = root2.querySelector('[data-testid="spec-text"]')) == null ? void 0 : _b.addEventListener("input", (e) => {
        state.text = e.target.value;
      });
      (_c = root2.querySelector('[data-testid="spec-text"]')) == null ? void 0 : _c.addEventListener("change", () => {
        state.selectedMutantId = null;
        render();
      });
      root2.querySelectorAll("[data-spec-op]").forEach((cb) => {
        cb.addEventListener("change", (e) => {
          const op = e.target.dataset.specOp;
          if (e.target.checked) state.operators.add(op);
          else state.operators.delete(op);
          render();
        });
      });
      root2.querySelectorAll("[data-spec-mutant]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.selectedMutantId = btn.dataset.specMutant;
          render();
        });
      });
    }
    render();
    return root2;
  }

  // src/utils/symbolicExecution.js
  var L2 = (en, zh) => getLocale() === "en" ? en : zh;
  var KEYWORDS2 = /* @__PURE__ */ new Set([
    "function",
    "let",
    "var",
    "const",
    "if",
    "else",
    "while",
    "return",
    "true",
    "false"
  ]);
  var PUNCT2 = ["==", "!=", "<=", ">=", "&&", "||"];
  var PUNCT1 = "(){};,+-*/%<>!=";
  function tokenize2(source) {
    const tokens = [];
    let i = 0;
    let line = 1;
    let col = 1;
    const advance = (n = 1) => {
      for (let k = 0; k < n; k += 1) {
        if (source[i] === "\n") {
          line += 1;
          col = 1;
        } else {
          col += 1;
        }
        i += 1;
      }
    };
    while (i < source.length) {
      const ch = source[i];
      if (ch === " " || ch === "	" || ch === "\r" || ch === "\n") {
        advance();
        continue;
      }
      if (ch === "/" && source[i + 1] === "/") {
        while (i < source.length && source[i] !== "\n") advance();
        continue;
      }
      if (ch === "/" && source[i + 1] === "*") {
        advance(2);
        while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) advance();
        if (i < source.length) advance(2);
        continue;
      }
      if (/[0-9]/.test(ch)) {
        let j = i;
        while (j < source.length && /[0-9]/.test(source[j])) j += 1;
        tokens.push({ type: "num", value: Number(source.slice(i, j)), line, col });
        advance(j - i);
        continue;
      }
      if (/[A-Za-z_$]/.test(ch)) {
        let j = i;
        while (j < source.length && /[A-Za-z0-9_$]/.test(source[j])) j += 1;
        const word = source.slice(i, j);
        if (KEYWORDS2.has(word)) {
          tokens.push({ type: word, line, col });
        } else {
          tokens.push({ type: "ident", value: word, line, col });
        }
        advance(j - i);
        continue;
      }
      const two = source.slice(i, i + 2);
      if (PUNCT2.includes(two)) {
        tokens.push({ type: two, line, col });
        advance(2);
        continue;
      }
      if (PUNCT1.includes(ch)) {
        tokens.push({ type: ch, line, col });
        advance(1);
        continue;
      }
      throw new Error(L2(
        `Unexpected character "${ch}" at line ${line}, column ${col}`,
        `\u975E\u9810\u671F\u5B57\u5143\u300C${ch}\u300D\u65BC\u7B2C ${line} \u884C\u7B2C ${col} \u6B04`
      ));
    }
    tokens.push({ type: "EOF", line, col });
    return tokens;
  }
  function parse(source) {
    const tokens = tokenize2(source);
    let pos = 0;
    const peek = (n = 0) => tokens[pos + n];
    const eat = (type) => {
      const t2 = tokens[pos];
      if (t2.type !== type) {
        throw new Error(L2(
          `Expected "${type}" but got "${t2.type}" at line ${t2.line}`,
          `\u9810\u671F\u300C${type}\u300D\u4F46\u53D6\u5F97\u300C${t2.type}\u300D\u65BC\u7B2C ${t2.line} \u884C`
        ));
      }
      pos += 1;
      return t2;
    };
    function parseFunction() {
      eat("function");
      const name = eat("ident").value;
      eat("(");
      const params = [];
      if (peek().type !== ")") {
        params.push(eat("ident").value);
        while (peek().type === ",") {
          eat(",");
          params.push(eat("ident").value);
        }
      }
      eat(")");
      const body = parseBlock();
      return { kind: "function", name, params, body };
    }
    function parseBlock() {
      eat("{");
      const statements = [];
      while (peek().type !== "}" && peek().type !== "EOF") {
        statements.push(parseStatement());
      }
      eat("}");
      return { kind: "block", statements };
    }
    function parseStatement() {
      const t2 = peek();
      if (t2.type === "{") return parseBlock();
      if (t2.type === "if") return parseIf();
      if (t2.type === "while") return parseWhile();
      if (t2.type === "return") return parseReturn();
      if (t2.type === "let" || t2.type === "var" || t2.type === "const") return parseDeclaration();
      if (t2.type === "ident") return parseAssignment();
      throw new Error(L2(
        `Unexpected token "${t2.type}" at line ${t2.line}`,
        `\u975E\u9810\u671F token\u300C${t2.type}\u300D\u65BC\u7B2C ${t2.line} \u884C`
      ));
    }
    function parseDeclaration() {
      eat(peek().type);
      const target = eat("ident").value;
      eat("=");
      const value = parseExpression2();
      eatSemicolon();
      return { kind: "let", target, value };
    }
    function parseAssignment() {
      const target = eat("ident").value;
      eat("=");
      const value = parseExpression2();
      eatSemicolon();
      return { kind: "assign", target, value };
    }
    function eatSemicolon() {
      if (peek().type === ";") eat(";");
    }
    function parseIf() {
      eat("if");
      eat("(");
      const test = parseExpression2();
      eat(")");
      const consequent = parseBranchBody();
      let alternate = null;
      if (peek().type === "else") {
        eat("else");
        alternate = peek().type === "if" ? parseIf() : parseBranchBody();
      }
      return { kind: "if", test, consequent, alternate };
    }
    function parseWhile() {
      eat("while");
      eat("(");
      const test = parseExpression2();
      eat(")");
      const body = parseBranchBody();
      return { kind: "while", test, body };
    }
    function parseReturn() {
      eat("return");
      let argument = null;
      if (peek().type !== ";" && peek().type !== "}") argument = parseExpression2();
      eatSemicolon();
      return { kind: "return", argument };
    }
    function parseBranchBody() {
      if (peek().type === "{") return parseBlock();
      return { kind: "block", statements: [parseStatement()] };
    }
    function parseExpression2() {
      return parseOr();
    }
    function parseOr() {
      let n = parseAnd();
      while (peek().type === "||") {
        eat("||");
        n = { kind: "binary", op: "||", left: n, right: parseAnd() };
      }
      return n;
    }
    function parseAnd() {
      let n = parseEquality();
      while (peek().type === "&&") {
        eat("&&");
        n = { kind: "binary", op: "&&", left: n, right: parseEquality() };
      }
      return n;
    }
    function parseEquality() {
      let n = parseRel();
      while (peek().type === "==" || peek().type === "!=") {
        const op = peek().type;
        eat(op);
        n = { kind: "binary", op, left: n, right: parseRel() };
      }
      return n;
    }
    function parseRel() {
      let n = parseAdd();
      while (["<", "<=", ">", ">="].includes(peek().type)) {
        const op = peek().type;
        eat(op);
        n = { kind: "binary", op, left: n, right: parseAdd() };
      }
      return n;
    }
    function parseAdd() {
      let n = parseMul();
      while (peek().type === "+" || peek().type === "-") {
        const op = peek().type;
        eat(op);
        n = { kind: "binary", op, left: n, right: parseMul() };
      }
      return n;
    }
    function parseMul() {
      let n = parseUnary();
      while (["*", "/", "%"].includes(peek().type)) {
        const op = peek().type;
        eat(op);
        n = { kind: "binary", op, left: n, right: parseUnary() };
      }
      return n;
    }
    function parseUnary() {
      if (peek().type === "!" || peek().type === "-") {
        const op = peek().type;
        eat(op);
        return { kind: "unary", op, operand: parseUnary() };
      }
      return parseAtom();
    }
    function parseAtom() {
      const t2 = peek();
      if (t2.type === "num") {
        eat("num");
        return { kind: "num", value: t2.value };
      }
      if (t2.type === "true") {
        eat("true");
        return { kind: "bool", value: true };
      }
      if (t2.type === "false") {
        eat("false");
        return { kind: "bool", value: false };
      }
      if (t2.type === "ident") {
        eat("ident");
        return { kind: "var", name: t2.value };
      }
      if (t2.type === "(") {
        eat("(");
        const e = parseExpression2();
        eat(")");
        return e;
      }
      throw new Error(L2(
        `Unexpected token "${t2.type}" in expression at line ${t2.line}`,
        `\u904B\u7B97\u5F0F\u4E2D\u975E\u9810\u671F token\u300C${t2.type}\u300D\u65BC\u7B2C ${t2.line} \u884C`
      ));
    }
    const fn = parseFunction();
    if (peek().type !== "EOF") {
      throw new Error(L2("Trailing input after function definition.", "\u51FD\u5F0F\u5B9A\u7FA9\u5F8C\u4ECD\u6709\u672A\u89E3\u6790\u5167\u5BB9\u3002"));
    }
    return fn;
  }
  var PRECEDENCE = {
    "||": 1,
    "&&": 2,
    "==": 3,
    "!=": 3,
    "<": 4,
    "<=": 4,
    ">": 4,
    ">=": 4,
    "+": 5,
    "-": 5,
    "*": 6,
    "/": 6,
    "%": 6
  };
  function exprToString(node, parentPrec = 0) {
    if (!node) return "";
    if (node.kind === "num") return String(node.value);
    if (node.kind === "bool") return node.value ? "true" : "false";
    if (node.kind === "var") return node.name;
    if (node.kind === "unary") {
      const inner = exprToString(node.operand, 7);
      const text = `${node.op}${inner}`;
      return parentPrec > 7 ? `(${text})` : text;
    }
    if (node.kind === "binary") {
      const prec = PRECEDENCE[node.op] || 0;
      const text = `${exprToString(node.left, prec)} ${node.op} ${exprToString(node.right, prec + 1)}`;
      return parentPrec > prec ? `(${text})` : text;
    }
    return "?";
  }
  function evalExpr(node, env) {
    if (node.kind === "num") return node.value;
    if (node.kind === "bool") return node.value;
    if (node.kind === "var") {
      if (!(node.name in env)) {
        throw new Error(L2(`Unbound variable: ${node.name}`, `\u672A\u5B9A\u7FA9\u8B8A\u6578\uFF1A${node.name}`));
      }
      return env[node.name];
    }
    if (node.kind === "unary") {
      const v = evalExpr(node.operand, env);
      if (node.op === "!") return !v;
      if (node.op === "-") return -v;
    }
    if (node.kind === "binary") {
      const L_ = evalExpr(node.left, env);
      const R_ = evalExpr(node.right, env);
      switch (node.op) {
        case "+":
          return L_ + R_;
        case "-":
          return L_ - R_;
        case "*":
          return L_ * R_;
        case "/":
          return R_ === 0 ? NaN : Math.trunc(L_ / R_);
        case "%":
          return R_ === 0 ? NaN : L_ % R_;
        case "==":
          return L_ === R_;
        case "!=":
          return L_ !== R_;
        case "<":
          return L_ < R_;
        case "<=":
          return L_ <= R_;
        case ">":
          return L_ > R_;
        case ">=":
          return L_ >= R_;
        case "&&":
          return Boolean(L_) && Boolean(R_);
        case "||":
          return Boolean(L_) || Boolean(R_);
        default:
          throw new Error(`Unknown op ${node.op}`);
      }
    }
    throw new Error(`Unknown node ${node.kind}`);
  }
  function substitute(node, env) {
    if (node.kind === "num" || node.kind === "bool") return node;
    if (node.kind === "var") return env[node.name] ? cloneExpr(env[node.name]) : node;
    if (node.kind === "unary") return { kind: "unary", op: node.op, operand: substitute(node.operand, env) };
    if (node.kind === "binary") {
      return { kind: "binary", op: node.op, left: substitute(node.left, env), right: substitute(node.right, env) };
    }
    return node;
  }
  function cloneExpr(node) {
    if (!node) return node;
    if (node.kind === "num" || node.kind === "bool") return { ...node };
    if (node.kind === "var") return { ...node };
    if (node.kind === "unary") return { kind: "unary", op: node.op, operand: cloneExpr(node.operand) };
    if (node.kind === "binary") {
      return { kind: "binary", op: node.op, left: cloneExpr(node.left), right: cloneExpr(node.right) };
    }
    return node;
  }
  function negate(expr) {
    if (expr.kind === "unary" && expr.op === "!") return expr.operand;
    return { kind: "unary", op: "!", operand: expr };
  }
  var DEFAULT_OPTIONS = {
    maxLoopUnroll: 3,
    // expand each `while` at most this many times per path
    maxPaths: 64,
    // total path cap
    searchDomain: { min: -5, max: 12 }
    // brute-force solver domain
  };
  function symbolicExecute(programSource, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const fn = parse(programSource);
    const params = fn.params.slice();
    const initialEnv = {};
    for (const p of params) initialEnv[p] = { kind: "var", name: p };
    const paths = [];
    let pathIdSeq = 0;
    let truncated = false;
    function walk(stmts, idx, env, pc, branches) {
      if (paths.length >= opts.maxPaths) {
        truncated = true;
        return;
      }
      if (idx >= stmts.length) {
        record(env, pc, branches, null);
        return;
      }
      const s = stmts[idx];
      if (s.kind === "block") {
        walk([...s.statements, ...stmts.slice(idx + 1)], 0, env, pc, branches);
        return;
      }
      if (s.kind === "let" || s.kind === "assign") {
        const next = { ...env, [s.target]: substitute(s.value, env) };
        walk(stmts, idx + 1, next, pc, branches);
        return;
      }
      if (s.kind === "return") {
        const ret = s.argument ? substitute(s.argument, env) : { kind: "bool", value: true };
        record(env, pc, branches, ret);
        return;
      }
      if (s.kind === "if") {
        const cond = substitute(s.test, env);
        walk(
          [s.consequent, ...stmts.slice(idx + 1)],
          0,
          env,
          [...pc, cond],
          [...branches, { line: describeBranch(s.test), taken: true }]
        );
        const altBlock = s.alternate || { kind: "block", statements: [] };
        walk(
          [altBlock, ...stmts.slice(idx + 1)],
          0,
          env,
          [...pc, negate(cond)],
          [...branches, { line: describeBranch(s.test), taken: false }]
        );
        return;
      }
      if (s.kind === "while") {
        let unroll = function(unrollCount, envCur, pcCur, branchesCur) {
          if (paths.length >= opts.maxPaths) {
            truncated = true;
            return;
          }
          const cond = substitute(s.test, envCur);
          if (unrollCount >= opts.maxLoopUnroll) {
            walk(
              stmts,
              idx + 1,
              envCur,
              [...pcCur, negate(cond)],
              [...branchesCur, { line: describeBranch(s.test), taken: false, loop: true }]
            );
            return;
          }
          walk(
            stmts,
            idx + 1,
            envCur,
            [...pcCur, negate(cond)],
            [...branchesCur, { line: describeBranch(s.test), taken: false, loop: true }]
          );
          symbolicExecBlock(
            s.body,
            envCur,
            [...pcCur, cond],
            [...branchesCur, { line: describeBranch(s.test), taken: true, loop: true }],
            (env2, pc2, br2) => unroll(unrollCount + 1, env2, pc2, br2)
          );
        };
        unroll(0, env, pc, branches);
        return;
      }
      walk(stmts, idx + 1, env, pc, branches);
    }
    function symbolicExecBlock(block, env, pc, branches, cont) {
      function step(stmts, idx, env_, pc_, br_) {
        if (paths.length >= opts.maxPaths) {
          truncated = true;
          return;
        }
        if (idx >= stmts.length) {
          cont(env_, pc_, br_);
          return;
        }
        const s = stmts[idx];
        if (s.kind === "block") {
          step([...s.statements, ...stmts.slice(idx + 1)], 0, env_, pc_, br_);
          return;
        }
        if (s.kind === "let" || s.kind === "assign") {
          step(stmts, idx + 1, { ...env_, [s.target]: substitute(s.value, env_) }, pc_, br_);
          return;
        }
        if (s.kind === "return") {
          const ret = s.argument ? substitute(s.argument, env_) : { kind: "bool", value: true };
          record(env_, pc_, br_, ret);
          return;
        }
        if (s.kind === "if") {
          const cond = substitute(s.test, env_);
          step(
            [s.consequent, ...stmts.slice(idx + 1)],
            0,
            env_,
            [...pc_, cond],
            [...br_, { line: describeBranch(s.test), taken: true }]
          );
          const altBlock = s.alternate || { kind: "block", statements: [] };
          step(
            [altBlock, ...stmts.slice(idx + 1)],
            0,
            env_,
            [...pc_, negate(cond)],
            [...br_, { line: describeBranch(s.test), taken: false }]
          );
          return;
        }
        if (s.kind === "while") {
          walk([s, ...stmts.slice(idx + 1)], 0, env_, pc_, br_);
          return;
        }
        step(stmts, idx + 1, env_, pc_, br_);
      }
      step([block], 0, env, pc, branches);
    }
    function describeBranch(node) {
      return exprToString(node);
    }
    function record(env, pc, branches, returnExpr) {
      const id = `path-${pathIdSeq}`;
      pathIdSeq += 1;
      const witness = findWitness(pc, params, opts.searchDomain);
      let concreteReturn = null;
      let concreteEnv = null;
      if (witness) {
        try {
          concreteEnv = { ...witness };
          const finalEnv = {};
          for (const k of Object.keys(env)) {
            if (params.includes(k)) finalEnv[k] = witness[k];
            else finalEnv[k] = evalExpr(env[k], witness);
          }
          for (const p of params) if (!(p in finalEnv)) finalEnv[p] = witness[p];
          concreteEnv = finalEnv;
          concreteReturn = returnExpr ? evalExpr(returnExpr, witness) : null;
        } catch {
          concreteReturn = null;
        }
      }
      paths.push({
        id,
        branches,
        pathCondition: pc.map((c) => exprToString(c)),
        returnExpression: returnExpr ? exprToString(returnExpr) : null,
        feasible: Boolean(witness),
        witness: witness || null,
        concreteEnv,
        concreteReturn
      });
    }
    walk(fn.body.statements, 0, initialEnv, [], []);
    return { function: { name: fn.name, params }, paths, truncated };
  }
  function findWitness(pc, params, domain) {
    if (!pc.length) {
      const w = {};
      for (const p of params) w[p] = 0;
      return w;
    }
    const values = [];
    for (let v = domain.min; v <= domain.max; v += 1) values.push(v);
    const result = {};
    function recurse(i) {
      if (i === params.length) {
        try {
          for (const c of pc) {
            if (!evalExpr(c, result)) return false;
          }
          return true;
        } catch {
          return false;
        }
      }
      for (const v of values) {
        result[params[i]] = v;
        if (recurse(i + 1)) return true;
      }
      return false;
    }
    return recurse(0) ? { ...result } : null;
  }

  // src/utils/pathToCfg.js
  function nodeOrder(id) {
    if (id === "S") return -1;
    if (id === "T") return Number.POSITIVE_INFINITY;
    const m = /^N(\d+)$/.exec(id);
    return m ? Number(m[1]) : 0;
  }
  function buildCfgIndex(cfg) {
    var _a2, _b;
    const nodeById = /* @__PURE__ */ new Map();
    for (const n of cfg.nodes) nodeById.set(n.id, n);
    const outgoing = /* @__PURE__ */ new Map();
    const incoming = /* @__PURE__ */ new Map();
    for (const n of cfg.nodes) {
      outgoing.set(n.id, []);
      incoming.set(n.id, []);
    }
    for (const e of cfg.edges) {
      (_a2 = outgoing.get(e.from)) == null ? void 0 : _a2.push(e);
      (_b = incoming.get(e.to)) == null ? void 0 : _b.push(e);
    }
    const loopHeads = /* @__PURE__ */ new Set();
    for (const n of cfg.nodes) {
      if (n.kind !== "decision") continue;
      const order = nodeOrder(n.id);
      for (const e of incoming.get(n.id) || []) {
        if (nodeOrder(e.from) > order) {
          loopHeads.add(n.id);
          break;
        }
      }
    }
    return { nodeById, outgoing, loopHeads };
  }
  function mapBranchesToCfg(cfg, branches = []) {
    if (!cfg) return { nodes: [], edges: [], decisions: [], unresolved: 0 };
    const { nodeById, outgoing, loopHeads } = buildCfgIndex(cfg);
    const visitedNodes = [];
    const visitedEdges = [];
    const decisions = [];
    const seenNodes = /* @__PURE__ */ new Set();
    const seenEdges = /* @__PURE__ */ new Set();
    let current2 = cfg.startNodeId || "S";
    let branchIdx = 0;
    let unresolved = 0;
    const HARD_CAP = 4096;
    for (let step = 0; step < HARD_CAP; step += 1) {
      const node = nodeById.get(current2);
      if (!node) break;
      if (!seenNodes.has(current2)) {
        seenNodes.add(current2);
        visitedNodes.push(current2);
      }
      if (current2 === (cfg.endNodeId || "T")) break;
      const outs = outgoing.get(current2) || [];
      if (outs.length === 0) break;
      let chosen;
      if (node.kind === "decision" && outs.length >= 2) {
        const isLoop = loopHeads.has(current2);
        const branch = branches[branchIdx];
        if (!branch) {
          unresolved += 1;
          chosen = isLoop ? outs[0] : outs[0];
        } else {
          branchIdx += 1;
          const taken = Boolean(branch.taken);
          const idx = isLoop ? taken ? 1 : 0 : taken ? 0 : 1;
          chosen = outs[Math.min(idx, outs.length - 1)];
          decisions.push({ nodeId: current2, edgeId: chosen.id, taken, loop: isLoop });
        }
      } else {
        chosen = outs[0];
      }
      if (!chosen) break;
      if (!seenEdges.has(chosen.id)) {
        seenEdges.add(chosen.id);
        visitedEdges.push(chosen.id);
      }
      current2 = chosen.to;
    }
    return {
      nodes: visitedNodes,
      edges: visitedEdges,
      decisions,
      unresolved,
      truncated: branchIdx < branches.length
    };
  }
  function escapeXml2(value = "") {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  function trimToCircle2(from, to, radius) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: to.x - dx / len * radius, y: to.y - dy / len * radius };
  }
  function computeBounds(cfg, padding = 60) {
    var _a2, _b, _c, _d;
    const xs = [], ys = [];
    for (const n of cfg.nodes) {
      xs.push(((_a2 = n.x) != null ? _a2 : 0) - 32, ((_b = n.x) != null ? _b : 0) + 32);
      ys.push(((_c = n.y) != null ? _c : 0) - 32, ((_d = n.y) != null ? _d : 0) + 32);
    }
    for (const e of cfg.edges) {
      if (e.control) {
        xs.push(e.control.x);
        ys.push(e.control.y);
      }
    }
    if (!xs.length) return { minX: 0, minY: 0, width: 600, height: 320 };
    const minX = Math.min(...xs) - padding;
    const minY = Math.min(...ys) - padding;
    const maxX = Math.max(...xs) + padding;
    const maxY = Math.max(...ys) + padding;
    return { minX, minY, width: Math.max(560, maxX - minX), height: Math.max(280, maxY - minY) };
  }
  function renderCfgSvg(cfg, highlight = {}, options = {}) {
    if (!cfg) return "";
    const idPrefix = options.idPrefix || "cfg";
    const ariaLabel = options.ariaLabel || "Control flow graph";
    const zoom = Number.isFinite(options.zoom) && options.zoom > 0 ? options.zoom : 1;
    const activeNodes = new Set(highlight.nodes || []);
    const activeEdges = new Set(highlight.edges || []);
    const { minX, minY, width, height } = computeBounds(cfg);
    const widthStyle = `width:${Math.round(zoom * 100)}%;height:auto;`;
    const NODE_R = 28;
    const ARROW_GAP = 4;
    const edges = cfg.edges.map((edge) => {
      const fromNode = cfg.nodes.find((n) => n.id === edge.from);
      const toNode = cfg.nodes.find((n) => n.id === edge.to);
      if (!fromNode || !toNode) return "";
      const active = activeEdges.has(edge.id);
      const cls = `graph-edge${active ? " graph-edge--active" : ""}`;
      const marker = active ? `arrow-active-${idPrefix}` : `arrow-default-${idPrefix}`;
      if (edge.control) {
        const end2 = trimToCircle2(edge.control, toNode, NODE_R + ARROW_GAP);
        const start2 = trimToCircle2(edge.control, fromNode, NODE_R);
        return `<path class="${cls}" d="M ${start2.x} ${start2.y} Q ${edge.control.x} ${edge.control.y} ${end2.x} ${end2.y}" marker-end="url(#${marker})" data-testid="${idPrefix}-edge-${edge.id}"></path>`;
      }
      const end = trimToCircle2(fromNode, toNode, NODE_R + ARROW_GAP);
      const start = trimToCircle2(toNode, fromNode, NODE_R);
      return `<line class="${cls}" x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" marker-end="url(#${marker})" data-testid="${idPrefix}-edge-${edge.id}"></line>`;
    }).join("");
    const nodes = cfg.nodes.map((node) => {
      const active = activeNodes.has(node.id);
      const cls = `graph-node${active ? " graph-node--active" : ""}`;
      const title = node.sourceLine ? `<title>Line ${node.sourceLine}: ${escapeXml2(node.sourceText || node.label)}</title>` : "";
      return `<g class="${cls}" data-testid="${idPrefix}-node-${node.id}">${title}<circle cx="${node.x}" cy="${node.y}" r="${NODE_R}"></circle><text x="${node.x}" y="${node.y + 5}" text-anchor="middle">${escapeXml2(node.label)}</text></g>`;
    }).join("");
    return `
    <svg viewBox="${minX} ${minY} ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escapeXml2(ariaLabel)}" style="${widthStyle}">
      <defs>
        <marker id="arrow-default-${idPrefix}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 z" fill="#9aa8b6"></path>
        </marker>
        <marker id="arrow-active-${idPrefix}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 z" fill="#ea580c"></path>
        </marker>
      </defs>
      ${edges}
      ${nodes}
    </svg>
  `;
  }

  // src/components/SymbolicExecutionExplorer.js
  var STORAGE_KEY5 = "stvisual.symbex.v1";
  function escapeHtml6(value = "") {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  function loadSaved2() {
    var _a2;
    try {
      const raw = (_a2 = globalThis.localStorage) == null ? void 0 : _a2.getItem(STORAGE_KEY5);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }
  function persist2(state) {
    var _a2;
    try {
      (_a2 = globalThis.localStorage) == null ? void 0 : _a2.setItem(STORAGE_KEY5, JSON.stringify({
        sourceCode: state.sourceCode,
        exampleId: state.exampleId,
        maxLoopUnroll: state.maxLoopUnroll,
        cfgZoom: state.cfgZoom
      }));
    } catch {
    }
  }
  function createSymbolicExecutionExplorer() {
    const root2 = document.createElement("div");
    root2.className = "symbex-explorer";
    root2.dataset.testid = "symbex-explorer";
    const saved = loadSaved2();
    const defaultExample = symbolicExecutionExamples[0];
    const state = {
      exampleId: (saved == null ? void 0 : saved.exampleId) || defaultExample.id,
      sourceCode: (saved == null ? void 0 : saved.sourceCode) || defaultExample.sourceCode,
      maxLoopUnroll: typeof (saved == null ? void 0 : saved.maxLoopUnroll) === "number" ? saved.maxLoopUnroll : 3,
      cfgZoom: typeof (saved == null ? void 0 : saved.cfgZoom) === "number" ? saved.cfgZoom : 1,
      result: null,
      cfg: null,
      cfgError: null,
      selectedPathId: null,
      error: null
    };
    function recompute() {
      var _a2, _b;
      state.result = null;
      state.error = null;
      state.cfg = null;
      state.cfgError = null;
      try {
        state.result = symbolicExecute(state.sourceCode, { maxLoopUnroll: state.maxLoopUnroll });
      } catch (err) {
        state.error = err.message || String(err);
      }
      try {
        state.cfg = generateControlFlowGraphFromProgram({
          sourceCode: state.sourceCode,
          language: "javascript",
          title: "Symbolic Execution CFG"
        });
      } catch (err) {
        state.cfgError = err.message || String(err);
      }
      if ((_b = (_a2 = state.result) == null ? void 0 : _a2.paths) == null ? void 0 : _b.length) {
        const stillExists = state.result.paths.some((p) => p.id === state.selectedPathId);
        if (!stillExists) {
          const firstFeasible = state.result.paths.find((p) => p.feasible) || state.result.paths[0];
          state.selectedPathId = firstFeasible.id;
        }
      } else {
        state.selectedPathId = null;
      }
      persist2(state);
    }
    function render() {
      recompute();
      const exampleButtons = symbolicExecutionExamples.map((ex) => `
      <button type="button"
        class="symbex-example-btn${state.exampleId === ex.id ? " active" : ""}"
        data-symbex-example="${ex.id}"
        data-testid="symbex-example-${ex.id}"
        title="${escapeHtml6(pickField(ex, "description") || "")}">
        ${escapeHtml6(pickField(ex, "name") || ex.name)}
      </button>
    `).join("");
      const pathsMarkup = state.error ? `<div class="symbex-error" data-testid="symbex-error">${escapeHtml6(state.error)}</div>` : renderPaths(state.result);
      const summary = state.result ? `${t("symbex.summary.paths")}<strong data-testid="symbex-path-count">${state.result.paths.length}</strong>
         <span class="symbex-divider">\xB7</span>
         ${t("symbex.summary.feasible")}<strong data-testid="symbex-feasible-count">${state.result.paths.filter((p) => p.feasible).length}</strong>
         ${state.result.truncated ? `<span class="symbex-divider">\xB7</span><span class="symbex-truncated">${t("symbex.summary.truncated")}</span>` : ""}` : "";
      root2.innerHTML = `
      <div class="symbex-toolbar">
        <div class="symbex-examples" data-testid="symbex-examples">${exampleButtons}</div>
        <div class="symbex-controls">
          <label class="symbex-control">
            <span>${t("symbex.maxUnroll")}</span>
            <input type="number" min="0" max="6" step="1"
              value="${state.maxLoopUnroll}"
              data-testid="symbex-max-unroll" />
          </label>
        </div>
      </div>

      <div class="symbex-body">
        <div class="symbex-editor-pane">
          <label class="symbex-editor-label" for="symbex-source">${t("symbex.source")}</label>
          <textarea id="symbex-source"
            class="symbex-editor"
            data-testid="symbex-source"
            spellcheck="false"
            autocomplete="off"
            rows="14">${escapeHtml6(state.sourceCode)}</textarea>
        </div>

        <div class="symbex-results-pane">
          <p class="symbex-summary" data-testid="symbex-summary">${summary}</p>
          ${pathsMarkup}
        </div>
      </div>

      ${renderCfgPane()}

      <p class="symbex-hint">${t("symbex.hint")}</p>
    `;
      bindEvents();
    }
    function renderCfgPane() {
      var _a2, _b;
      if (state.cfgError) {
        return `<div class="symbex-cfg" data-testid="symbex-cfg">
        <p class="symbex-cfg-error">${escapeHtml6(state.cfgError)}</p>
      </div>`;
      }
      if (!state.cfg) return "";
      const selected = (_b = (_a2 = state.result) == null ? void 0 : _a2.paths) == null ? void 0 : _b.find((p) => p.id === state.selectedPathId);
      const mapping = selected ? mapBranchesToCfg(state.cfg, selected.branches) : { nodes: [], edges: [] };
      const svg = renderCfgSvg(state.cfg, mapping, {
        idPrefix: "symbex-cfg",
        ariaLabel: "Symbolic execution CFG",
        zoom: state.cfgZoom
      });
      const zoomPct = Math.round(state.cfgZoom * 100);
      return `
      <div class="symbex-cfg" data-testid="symbex-cfg">
        <div class="symbex-cfg-header">
          <h3>${t("symbex.cfg.title")}</h3>
          <span class="symbex-cfg-selected" data-testid="symbex-cfg-selected">${selected ? escapeHtml6(selected.id) : t("symbex.cfg.none")}</span>
          <div class="symbex-cfg-zoom" role="group" aria-label="${t("symbex.cfg.zoom")}">
            <button type="button" data-symbex-zoom="out" data-testid="symbex-cfg-zoom-out" title="${t("symbex.cfg.zoomOut")}">\u2212</button>
            <button type="button" data-symbex-zoom="reset" data-testid="symbex-cfg-zoom-reset" title="${t("symbex.cfg.zoomReset")}">${zoomPct}%</button>
            <button type="button" data-symbex-zoom="in" data-testid="symbex-cfg-zoom-in" title="${t("symbex.cfg.zoomIn")}">+</button>
          </div>
        </div>
        <div class="symbex-cfg-canvas graph-canvas">${svg}</div>
      </div>
    `;
    }
    function renderPaths(result) {
      if (!result || !result.paths.length) {
        return `<p class="symbex-empty">${t("symbex.empty")}</p>`;
      }
      const items = result.paths.map((p) => {
        const pcMarkup = p.pathCondition.length ? `<ol class="symbex-pc">${p.pathCondition.map((c) => `<li><code>${escapeHtml6(c)}</code></li>`).join("")}</ol>` : `<p class="symbex-pc-empty">${t("symbex.pc.empty")}</p>`;
        const witness = p.feasible ? `<dl class="symbex-witness">
             <dt>${t("symbex.witness")}</dt>
             <dd><code>${escapeHtml6(formatAssignment2(p.witness))}</code></dd>
             <dt>${t("symbex.return")}</dt>
             <dd><code>${escapeHtml6(formatReturn(p.returnExpression, p.concreteReturn))}</code></dd>
           </dl>` : `<p class="symbex-infeasible">${t("symbex.infeasible")}</p>`;
        return `
        <li class="symbex-path${p.feasible ? "" : " infeasible"}${state.selectedPathId === p.id ? " selected" : ""}"
          data-testid="symbex-${p.id}"
          data-symbex-path="${p.id}"
          tabindex="0"
          role="button">
          <header class="symbex-path-header">
            <span class="symbex-path-id">${escapeHtml6(p.id)}</span>
            <span class="symbex-path-status">${p.feasible ? t("symbex.feasible") : t("symbex.infeasible.short")}</span>
          </header>
          ${pcMarkup}
          ${witness}
        </li>
      `;
      }).join("");
      return `<ol class="symbex-paths" data-testid="symbex-paths">${items}</ol>`;
    }
    function formatAssignment2(env) {
      if (!env) return "";
      return Object.entries(env).map(([k, v]) => `${k}=${v}`).join(", ");
    }
    function formatReturn(expr, concrete) {
      if (expr == null) return "\u2205";
      if (concrete === null || concrete === void 0) return expr;
      return `${expr}  \u2192  ${concrete}`;
    }
    function bindEvents() {
      root2.querySelectorAll("[data-symbex-example]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.symbexExample;
          const ex = symbolicExecutionExamples.find((x) => x.id === id);
          if (!ex) return;
          state.exampleId = ex.id;
          state.sourceCode = ex.sourceCode;
          state.selectedPathId = null;
          render();
        });
      });
      root2.querySelectorAll("[data-symbex-path]").forEach((el) => {
        const select = () => {
          state.selectedPathId = el.dataset.symbexPath;
          render();
        };
        el.addEventListener("click", select);
        el.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            select();
          }
        });
      });
      const editor = root2.querySelector('[data-testid="symbex-source"]');
      if (editor) {
        let timer = null;
        editor.addEventListener("input", () => {
          state.sourceCode = editor.value;
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            renderPreservingFocus("symbex-source");
          }, 220);
        });
      }
      const unroll = root2.querySelector('[data-testid="symbex-max-unroll"]');
      if (unroll) {
        unroll.addEventListener("change", () => {
          const n = Number(unroll.value);
          if (Number.isFinite(n) && n >= 0 && n <= 12) {
            state.maxLoopUnroll = n;
            render();
          }
        });
      }
      root2.querySelectorAll("[data-symbex-zoom]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const action = btn.dataset.symbexZoom;
          if (action === "in") state.cfgZoom = Math.min(4, +(state.cfgZoom + 0.25).toFixed(2));
          else if (action === "out") state.cfgZoom = Math.max(0.25, +(state.cfgZoom - 0.25).toFixed(2));
          else state.cfgZoom = 1;
          render();
        });
      });
    }
    function renderPreservingFocus(testid) {
      const previously = root2.querySelector(`[data-testid="${testid}"]`);
      const start = previously == null ? void 0 : previously.selectionStart;
      const end = previously == null ? void 0 : previously.selectionEnd;
      render();
      const next = root2.querySelector(`[data-testid="${testid}"]`);
      if (next) {
        next.focus();
        if (typeof start === "number" && typeof end === "number" && next.setSelectionRange) {
          next.setSelectionRange(start, end);
        }
      }
    }
    render();
    return root2;
  }

  // src/utils/concolicExecution.js
  var DEFAULT_OPTIONS2 = {
    maxIterations: 16,
    searchDomain: { min: -5, max: 12 }
  };
  function runConcolicOnce(fn, concreteInputs) {
    const concreteEnv = {};
    const symbolicEnv = {};
    for (const p of fn.params) {
      concreteEnv[p] = concreteInputs[p];
      symbolicEnv[p] = { kind: "var", name: p };
    }
    const branches = [];
    let returnValue = null;
    let returnExpression = null;
    const HALT = Symbol("HALT");
    function execStatements(stmts) {
      for (const s of stmts) {
        const r = execOne(s);
        if (r === HALT) return HALT;
      }
      return null;
    }
    function execOne(stmt) {
      if (stmt.kind === "block") return execStatements(stmt.statements);
      if (stmt.kind === "let" || stmt.kind === "assign") {
        concreteEnv[stmt.target] = evalExpr(stmt.value, concreteEnv);
        symbolicEnv[stmt.target] = substitute(stmt.value, symbolicEnv);
        return null;
      }
      if (stmt.kind === "return") {
        if (stmt.argument) {
          returnValue = evalExpr(stmt.argument, concreteEnv);
          returnExpression = exprToString(substitute(stmt.argument, symbolicEnv));
        } else {
          returnValue = null;
          returnExpression = null;
        }
        return HALT;
      }
      if (stmt.kind === "if") {
        const concrete = evalExpr(stmt.test, concreteEnv);
        const symbolic = substitute(stmt.test, symbolicEnv);
        branches.push({
          condition: exprToString(symbolic),
          symbolic,
          taken: Boolean(concrete)
        });
        if (concrete) return execOne(stmt.consequent);
        if (stmt.alternate) return execOne(stmt.alternate);
        return null;
      }
      if (stmt.kind === "while") {
        let safety = 256;
        while (safety > 0) {
          safety -= 1;
          const concrete = evalExpr(stmt.test, concreteEnv);
          const symbolic = substitute(stmt.test, symbolicEnv);
          branches.push({
            condition: exprToString(symbolic),
            symbolic,
            taken: Boolean(concrete),
            loop: true
          });
          if (!concrete) return null;
          const r = execOne(stmt.body);
          if (r === HALT) return HALT;
        }
        throw new Error("Loop iteration limit exceeded (256).");
      }
      return null;
    }
    execStatements(fn.body.statements);
    return { branches, returnValue, returnExpression };
  }
  function pathKey(branches) {
    return branches.map((b) => b.taken ? "T" : "F").join("");
  }
  function inputKey(inputs, params) {
    return params.map((p) => `${p}=${inputs[p]}`).join(",");
  }
  function concolicExecute(programSource, options = {}) {
    var _a2;
    const opts = { ...DEFAULT_OPTIONS2, ...options };
    const fn = parse(programSource);
    const params = fn.params.slice();
    const seed = {};
    for (const p of params) {
      seed[p] = ((_a2 = options.initialInputs) == null ? void 0 : _a2[p]) != null ? options.initialInputs[p] : 0;
    }
    const worklist = [seed];
    const seenInputs = /* @__PURE__ */ new Set([inputKey(seed, params)]);
    const seenPaths = /* @__PURE__ */ new Set();
    const iterations = [];
    let truncated = false;
    while (worklist.length > 0) {
      if (iterations.length >= opts.maxIterations) {
        truncated = true;
        break;
      }
      const inputs = worklist.shift();
      let trace;
      try {
        trace = runConcolicOnce(fn, inputs);
      } catch (err) {
        iterations.push({
          id: `iter-${iterations.length}`,
          inputs,
          branches: [],
          pathCondition: [],
          pathKey: "",
          returnValue: null,
          returnExpression: null,
          runtimeError: err.message || String(err),
          nextInput: null,
          negatedAt: null
        });
        continue;
      }
      const branches = trace.branches;
      const pkey = pathKey(branches);
      seenPaths.add(pkey);
      let nextInput = null;
      let negatedAt = null;
      let negatedNewKey = null;
      for (let i = branches.length - 1; i >= 0; i -= 1) {
        const constraint = [];
        for (let j = 0; j < i; j += 1) {
          const b = branches[j];
          constraint.push(b.taken ? b.symbolic : negate(b.symbolic));
        }
        const flipped = branches[i];
        constraint.push(flipped.taken ? negate(flipped.symbolic) : flipped.symbolic);
        const candidatePathKey = `${pkey.slice(0, i)}${flipped.taken ? "F" : "T"}`;
        if (seenPaths.has(candidatePathKey)) continue;
        const witness = findWitness(constraint, params, opts.searchDomain);
        if (!witness) continue;
        const wkey = inputKey(witness, params);
        if (seenInputs.has(wkey)) continue;
        seenInputs.add(wkey);
        nextInput = witness;
        negatedAt = i;
        negatedNewKey = candidatePathKey;
        break;
      }
      iterations.push({
        id: `iter-${iterations.length}`,
        inputs: { ...inputs },
        branches: branches.map((b, idx) => ({
          index: idx,
          condition: b.condition,
          taken: b.taken,
          loop: Boolean(b.loop),
          negated: idx === negatedAt
        })),
        pathCondition: branches.map((b) => b.taken ? b.condition : `!(${b.condition})`),
        pathKey: pkey,
        returnValue: trace.returnValue,
        returnExpression: trace.returnExpression,
        runtimeError: null,
        nextInput,
        negatedAt,
        negatedNewKey
      });
      if (nextInput) worklist.push(nextInput);
    }
    return {
      function: { name: fn.name, params },
      iterations,
      truncated,
      uniquePathCount: seenPaths.size,
      uniqueInputCount: seenInputs.size
    };
  }

  // src/components/ConcolicExecutionExplorer.js
  var STORAGE_KEY6 = "stvisual.concolic.v1";
  function escapeHtml7(value = "") {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  function loadSaved3() {
    var _a2;
    try {
      const raw = (_a2 = globalThis.localStorage) == null ? void 0 : _a2.getItem(STORAGE_KEY6);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }
  function persist3(state) {
    var _a2;
    try {
      (_a2 = globalThis.localStorage) == null ? void 0 : _a2.setItem(STORAGE_KEY6, JSON.stringify({
        sourceCode: state.sourceCode,
        exampleId: state.exampleId,
        seedText: state.seedText,
        maxIterations: state.maxIterations,
        cfgZoom: state.cfgZoom
      }));
    } catch {
    }
  }
  function parseSeed(text) {
    const out = {};
    if (!text) return out;
    for (const part of text.split(/[,;\n]/)) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const m = /^([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(-?\d+|true|false)$/.exec(trimmed);
      if (!m) throw new Error(`Cannot parse seed: ${trimmed}`);
      const value = m[2] === "true" ? true : m[2] === "false" ? false : Number(m[2]);
      out[m[1]] = value;
    }
    return out;
  }
  function createConcolicExecutionExplorer() {
    const root2 = document.createElement("div");
    root2.className = "concolic-explorer";
    root2.dataset.testid = "concolic-explorer";
    const saved = loadSaved3();
    const defaultExample = concolicExecutionExamples[0];
    const state = {
      exampleId: (saved == null ? void 0 : saved.exampleId) || defaultExample.id,
      sourceCode: (saved == null ? void 0 : saved.sourceCode) || defaultExample.sourceCode,
      seedText: (saved == null ? void 0 : saved.seedText) || defaultExample.seed || "",
      maxIterations: typeof (saved == null ? void 0 : saved.maxIterations) === "number" ? saved.maxIterations : 16,
      cfgZoom: typeof (saved == null ? void 0 : saved.cfgZoom) === "number" ? saved.cfgZoom : 1,
      result: null,
      cfg: null,
      cfgError: null,
      selectedIterId: null,
      error: null
    };
    function recompute() {
      var _a2, _b;
      state.result = null;
      state.error = null;
      state.cfg = null;
      state.cfgError = null;
      try {
        const initialInputs = parseSeed(state.seedText);
        state.result = concolicExecute(state.sourceCode, {
          initialInputs,
          maxIterations: state.maxIterations
        });
      } catch (err) {
        state.error = err.message || String(err);
      }
      try {
        state.cfg = generateControlFlowGraphFromProgram({
          sourceCode: state.sourceCode,
          language: "javascript",
          title: "Concolic Execution CFG"
        });
      } catch (err) {
        state.cfgError = err.message || String(err);
      }
      if ((_b = (_a2 = state.result) == null ? void 0 : _a2.iterations) == null ? void 0 : _b.length) {
        const stillExists = state.result.iterations.some((it) => it.id === state.selectedIterId);
        if (!stillExists) {
          state.selectedIterId = state.result.iterations[0].id;
        }
      } else {
        state.selectedIterId = null;
      }
      persist3(state);
    }
    function render() {
      recompute();
      const exampleButtons = concolicExecutionExamples.map((ex) => `
      <button type="button"
        class="concolic-example-btn${state.exampleId === ex.id ? " active" : ""}"
        data-concolic-example="${ex.id}"
        data-testid="concolic-example-${ex.id}"
        title="${escapeHtml7(pickField(ex, "description") || "")}">
        ${escapeHtml7(pickField(ex, "name") || ex.name)}
      </button>
    `).join("");
      const body = state.error ? `<div class="concolic-error" data-testid="concolic-error">${escapeHtml7(state.error)}</div>` : renderIterations(state.result);
      const summary = state.result ? `${t("concolic.summary.iterations")}<strong data-testid="concolic-iter-count">${state.result.iterations.length}</strong>
         <span class="concolic-divider">\xB7</span>
         ${t("concolic.summary.uniquePaths")}<strong data-testid="concolic-path-count">${state.result.uniquePathCount}</strong>
         <span class="concolic-divider">\xB7</span>
         ${t("concolic.summary.uniqueInputs")}<strong>${state.result.uniqueInputCount}</strong>
         ${state.result.truncated ? `<span class="concolic-divider">\xB7</span><span class="concolic-truncated">${t("concolic.summary.truncated")}</span>` : ""}` : "";
      root2.innerHTML = `
      <div class="concolic-toolbar">
        <div class="concolic-examples" data-testid="concolic-examples">${exampleButtons}</div>
        <div class="concolic-controls">
          <label class="concolic-control">
            <span>${t("concolic.seed")}</span>
            <input type="text" value="${escapeHtml7(state.seedText)}"
              data-testid="concolic-seed"
              placeholder="a=1, b=1, c=1" />
          </label>
          <label class="concolic-control">
            <span>${t("concolic.maxIterations")}</span>
            <input type="number" min="1" max="64" step="1"
              value="${state.maxIterations}"
              data-testid="concolic-max-iter" />
          </label>
        </div>
      </div>

      <div class="concolic-body">
        <div class="concolic-editor-pane">
          <label class="concolic-editor-label" for="concolic-source">${t("concolic.source")}</label>
          <textarea id="concolic-source"
            class="concolic-editor"
            data-testid="concolic-source"
            spellcheck="false"
            autocomplete="off"
            rows="14">${escapeHtml7(state.sourceCode)}</textarea>
        </div>
        <div class="concolic-results-pane">
          <p class="concolic-summary" data-testid="concolic-summary">${summary}</p>
          ${body}
        </div>
      </div>

      ${renderCfgPane()}

      <p class="concolic-hint">${t("concolic.hint")}</p>
    `;
      bindEvents();
    }
    function renderCfgPane() {
      var _a2, _b;
      if (state.cfgError) {
        return `<div class="concolic-cfg" data-testid="concolic-cfg">
        <p class="concolic-cfg-error">${escapeHtml7(state.cfgError)}</p>
      </div>`;
      }
      if (!state.cfg) return "";
      const selected = (_b = (_a2 = state.result) == null ? void 0 : _a2.iterations) == null ? void 0 : _b.find((it) => it.id === state.selectedIterId);
      const mapping = selected ? mapBranchesToCfg(state.cfg, selected.branches) : { nodes: [], edges: [] };
      const svg = renderCfgSvg(state.cfg, mapping, {
        idPrefix: "concolic-cfg",
        ariaLabel: "Concolic execution CFG",
        zoom: state.cfgZoom
      });
      const zoomPct = Math.round(state.cfgZoom * 100);
      return `
      <div class="concolic-cfg" data-testid="concolic-cfg">
        <div class="concolic-cfg-header">
          <h3>${t("concolic.cfg.title")}</h3>
          <span class="concolic-cfg-selected" data-testid="concolic-cfg-selected">${selected ? escapeHtml7(selected.id) : t("concolic.cfg.none")}</span>
          <div class="concolic-cfg-zoom" role="group" aria-label="${t("concolic.cfg.zoom")}">
            <button type="button" data-concolic-zoom="out" data-testid="concolic-cfg-zoom-out" title="${t("concolic.cfg.zoomOut")}">\u2212</button>
            <button type="button" data-concolic-zoom="reset" data-testid="concolic-cfg-zoom-reset" title="${t("concolic.cfg.zoomReset")}">${zoomPct}%</button>
            <button type="button" data-concolic-zoom="in" data-testid="concolic-cfg-zoom-in" title="${t("concolic.cfg.zoomIn")}">+</button>
          </div>
        </div>
        <div class="concolic-cfg-canvas graph-canvas">${svg}</div>
      </div>
    `;
    }
    function renderIterations(result) {
      if (!result || !result.iterations.length) {
        return `<p class="concolic-empty">${t("concolic.empty")}</p>`;
      }
      const items = result.iterations.map((it) => {
        const inputCode = formatAssignment2(it.inputs);
        const branchesMarkup = it.branches.length ? `<ol class="concolic-branches">${it.branches.map((b) => {
          const cls = ["concolic-branch"];
          if (b.taken) cls.push("taken");
          else cls.push("not-taken");
          if (b.negated) cls.push("negated");
          const arrow = b.taken ? "\u2713" : "\u2717";
          const negTag = b.negated ? `<span class="concolic-neg-tag">${t("concolic.negated")}</span>` : "";
          return `<li class="${cls.join(" ")}">
              <span class="concolic-branch-arrow">${arrow}</span>
              <code>${escapeHtml7(b.condition)}</code>
              ${negTag}
            </li>`;
        }).join("")}</ol>` : `<p class="concolic-empty-branches">${t("concolic.noBranches")}</p>`;
        const ret = it.runtimeError ? `<p class="concolic-runtime-error"><strong>${t("concolic.runtimeError")}</strong> ${escapeHtml7(it.runtimeError)}</p>` : `<dl class="concolic-meta">
            <dt>${t("concolic.return")}</dt>
            <dd><code>${escapeHtml7(formatReturn(it.returnExpression, it.returnValue))}</code></dd>
            ${it.nextInput ? `
              <dt>${t("concolic.nextInput")}</dt>
              <dd><code>${escapeHtml7(formatAssignment2(it.nextInput))}</code></dd>
            ` : `
              <dt>${t("concolic.nextInput")}</dt>
              <dd><em>${t("concolic.exhausted")}</em></dd>
            `}
          </dl>`;
        return `
        <li class="concolic-iter${state.selectedIterId === it.id ? " selected" : ""}"
          data-testid="concolic-${it.id}"
          data-concolic-iter="${it.id}"
          tabindex="0"
          role="button">
          <header class="concolic-iter-header">
            <span class="concolic-iter-id">${escapeHtml7(it.id)}</span>
            <span class="concolic-iter-input"><code>${escapeHtml7(inputCode)}</code></span>
            <span class="concolic-iter-pathkey" title="${t("concolic.pathKey")}">
              ${escapeHtml7(it.pathKey || "\u03B5")}
            </span>
          </header>
          ${branchesMarkup}
          ${ret}
        </li>
      `;
      }).join("");
      return `<ol class="concolic-iters" data-testid="concolic-iters">${items}</ol>`;
    }
    function formatAssignment2(env) {
      if (!env) return "";
      return Object.entries(env).map(([k, v]) => `${k}=${v}`).join(", ");
    }
    function formatReturn(expr, concrete) {
      if (expr == null && concrete == null) return "\u2205";
      if (expr == null) return String(concrete);
      if (concrete == null) return expr;
      return `${expr}  \u2192  ${concrete}`;
    }
    function bindEvents() {
      root2.querySelectorAll("[data-concolic-example]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.concolicExample;
          const ex = concolicExecutionExamples.find((x) => x.id === id);
          if (!ex) return;
          state.exampleId = ex.id;
          state.sourceCode = ex.sourceCode;
          state.seedText = ex.seed || "";
          state.selectedIterId = null;
          render();
        });
      });
      root2.querySelectorAll("[data-concolic-iter]").forEach((el) => {
        const select = () => {
          state.selectedIterId = el.dataset.concolicIter;
          render();
        };
        el.addEventListener("click", select);
        el.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            select();
          }
        });
      });
      const editor = root2.querySelector('[data-testid="concolic-source"]');
      if (editor) {
        let timer = null;
        editor.addEventListener("input", () => {
          state.sourceCode = editor.value;
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => renderPreservingFocus("concolic-source"), 220);
        });
      }
      const seed = root2.querySelector('[data-testid="concolic-seed"]');
      if (seed) {
        let timer = null;
        seed.addEventListener("input", () => {
          state.seedText = seed.value;
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => renderPreservingFocus("concolic-seed"), 220);
        });
      }
      const iter = root2.querySelector('[data-testid="concolic-max-iter"]');
      if (iter) {
        iter.addEventListener("change", () => {
          const n = Number(iter.value);
          if (Number.isFinite(n) && n >= 1 && n <= 128) {
            state.maxIterations = n;
            render();
          }
        });
      }
      root2.querySelectorAll("[data-concolic-zoom]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const action = btn.dataset.concolicZoom;
          if (action === "in") state.cfgZoom = Math.min(4, +(state.cfgZoom + 0.25).toFixed(2));
          else if (action === "out") state.cfgZoom = Math.max(0.25, +(state.cfgZoom - 0.25).toFixed(2));
          else state.cfgZoom = 1;
          render();
        });
      });
    }
    function renderPreservingFocus(testid) {
      const previously = root2.querySelector(`[data-testid="${testid}"]`);
      const start = previously == null ? void 0 : previously.selectionStart;
      const end = previously == null ? void 0 : previously.selectionEnd;
      render();
      const next = root2.querySelector(`[data-testid="${testid}"]`);
      if (next) {
        next.focus();
        if (typeof start === "number" && typeof end === "number" && next.setSelectionRange) {
          next.setSelectionRange(start, end);
        }
      }
    }
    render();
    return root2;
  }

  // src/app.js
  var sectionsConfig = [
    { id: "all", key: "section.all" },
    { id: "methods", key: "section.methods" },
    { id: "graph", key: "section.graph" },
    { id: "logic", key: "section.logic" },
    { id: "syntax", key: "section.syntax" },
    { id: "symbex", key: "section.symbex" },
    { id: "concolic", key: "section.concolic" },
    { id: "cloud", key: "section.cloud" },
    { id: "flow", key: "section.flow" },
    { id: "types", key: "section.types" }
  ];
  function renderApp(container) {
    function paint() {
      container.innerHTML = `
      <div class="app">
        <header class="app-header">
          <div class="app-header__text">
            <h1>${t("app.title")}</h1>
            <p>${t("app.subtitle")}</p>
          </div>
          <div class="app-lang" role="group" aria-label="${t("app.lang.label")}">
            <label class="app-lang__label" for="app-lang-select">${t("app.lang.label")}</label>
            <select id="app-lang-select" data-testid="app-lang-select">
              <option value="en"${getLocale() === "en" ? " selected" : ""}>${t("app.lang.en")}</option>
              <option value="zh"${getLocale() === "zh" ? " selected" : ""}>${t("app.lang.zh")}</option>
            </select>
          </div>
        </header>

        <nav class="app-nav" aria-label="${t("app.nav.aria")}" data-testid="app-nav"></nav>

        <main class="app-main">
          <section data-testid="section-methods"><h2>${t("section.methods.title")}</h2><div data-slot="methods"></div></section>
          <section data-testid="section-graph"><h2>${t("section.graph.title")}</h2><div data-slot="graph"></div></section>
          <section data-testid="section-logic"><h2>${t("section.logic.title")}</h2><div data-slot="logic"></div></section>
          <section data-testid="section-syntax"><h2>${t("section.syntax.title")}</h2><div data-slot="syntax"></div></section>
          <section data-testid="section-symbex"><h2>${t("section.symbex.title")}</h2><div data-slot="symbex"></div></section>
          <section data-testid="section-concolic"><h2>${t("section.concolic.title")}</h2><div data-slot="concolic"></div></section>
          <section data-testid="section-cloud"><h2>${t("section.cloud.title")}</h2><div data-slot="cloud"></div></section>
          <section data-testid="section-flow"><h2>${t("section.flow.title")}</h2><div data-slot="flow"></div></section>
          <section data-testid="section-types"><h2>${t("section.types.title")}</h2><div data-slot="types"></div></section>
        </main>

        <footer class="app-footer">
          <p>${t("app.footer")}</p>
        </footer>
      </div>
    `;
      const nav = container.querySelector(".app-nav");
      const main = container.querySelector(".app-main");
      const sections = {
        methods: main.querySelector('[data-testid="section-methods"]'),
        graph: main.querySelector('[data-testid="section-graph"]'),
        logic: main.querySelector('[data-testid="section-logic"]'),
        syntax: main.querySelector('[data-testid="section-syntax"]'),
        symbex: main.querySelector('[data-testid="section-symbex"]'),
        concolic: main.querySelector('[data-testid="section-concolic"]'),
        cloud: main.querySelector('[data-testid="section-cloud"]'),
        flow: main.querySelector('[data-testid="section-flow"]'),
        types: main.querySelector('[data-testid="section-types"]')
      };
      const components = {
        methods: createTestingMethodTree(),
        graph: createGraphCoverageExplorer(),
        logic: createLogicCoverageExplorer(),
        syntax: createSyntaxCoverageExplorer(),
        grammar: createGrammarCoverageExplorer(),
        specMutation: createSpecMutationExplorer(),
        symbex: createSymbolicExecutionExplorer(),
        concolic: createConcolicExecutionExplorer(),
        cloud: createCloudStoragePanel(),
        flow: createTestingFlow(),
        types: createTestingTypesTable()
      };
      container.querySelector('[data-slot="methods"]').appendChild(components.methods);
      container.querySelector('[data-slot="graph"]').appendChild(components.graph);
      container.querySelector('[data-slot="logic"]').appendChild(components.logic);
      const syntaxTabs = [
        { id: "mutation", key: "syntaxTab.mutation", component: components.syntax },
        { id: "grammar", key: "syntaxTab.grammar", component: components.grammar },
        { id: "spec", key: "syntaxTab.spec", component: components.specMutation }
      ];
      const syntaxSlot = container.querySelector('[data-slot="syntax"]');
      const syntaxTabBar = document.createElement("nav");
      syntaxTabBar.className = "syntax-tab-row";
      syntaxTabBar.dataset.testid = "syntax-tab-row";
      syntaxTabBar.setAttribute("role", "tablist");
      syntaxSlot.appendChild(syntaxTabBar);
      const syntaxPanels = document.createElement("div");
      syntaxPanels.className = "syntax-tab-panels";
      syntaxSlot.appendChild(syntaxPanels);
      for (const tab of syntaxTabs) {
        const panel = document.createElement("div");
        panel.className = "syntax-tab-panel";
        panel.dataset.syntaxPanel = tab.id;
        panel.appendChild(tab.component);
        syntaxPanels.appendChild(panel);
      }
      const SYNTAX_TAB_KEY = "stvisual.syntaxActiveTab";
      let activeSyntaxTab = (() => {
        var _a2;
        try {
          const v = (_a2 = globalThis.localStorage) == null ? void 0 : _a2.getItem(SYNTAX_TAB_KEY);
          return syntaxTabs.find((t2) => t2.id === v) ? v : "mutation";
        } catch {
          return "mutation";
        }
      })();
      function renderSyntaxTabs() {
        syntaxTabBar.innerHTML = syntaxTabs.map((tab) => `
        <button type="button"
          class="syntax-tab-btn${activeSyntaxTab === tab.id ? " active" : ""}"
          data-syntax-tab="${tab.id}"
          role="tab"
          aria-selected="${activeSyntaxTab === tab.id ? "true" : "false"}"
        >${t(tab.key)}</button>
      `).join("");
        syntaxTabBar.querySelectorAll("[data-syntax-tab]").forEach((btn) => {
          btn.addEventListener("click", () => {
            var _a2;
            activeSyntaxTab = btn.dataset.syntaxTab;
            try {
              (_a2 = globalThis.localStorage) == null ? void 0 : _a2.setItem(SYNTAX_TAB_KEY, activeSyntaxTab);
            } catch {
            }
            renderSyntaxTabs();
            updateSyntaxPanels();
          });
        });
      }
      function updateSyntaxPanels() {
        syntaxPanels.querySelectorAll("[data-syntax-panel]").forEach((panel) => {
          panel.style.display = panel.dataset.syntaxPanel === activeSyntaxTab ? "" : "none";
        });
      }
      renderSyntaxTabs();
      updateSyntaxPanels();
      container.querySelector('[data-slot="cloud"]').appendChild(components.cloud);
      container.querySelector('[data-slot="symbex"]').appendChild(components.symbex);
      container.querySelector('[data-slot="concolic"]').appendChild(components.concolic);
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
          ${t(section.key)}
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
      container.querySelector("#app-lang-select").addEventListener("change", (e) => {
        setLocale(e.target.value);
      });
      renderNav();
      updateSectionVisibility();
    }
    paint();
    onLocaleChange(() => paint());
  }

  // src/main.js
  var root = document.getElementById("root");
  if (root) {
    renderApp(root);
  }
})();
