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
        { id: "lc", name: "\u908F\u8F2F\u8986\u84CB", nameEn: "Logic Coverage", description: "\u4EE5\u8FF0\u8A5E\u8207\u5B50\u53E5\u70BA\u6838\u5FC3\u7684\u8986\u84CB\u7B56\u7565\uFF0C\u5305\u542B PC\u3001CC\u3001ACC \u7CFB\u5217" },
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
    }
  ];
  var logicCoverageCriteria = [
    {
      id: "pc",
      label: "Predicate Coverage",
      labelZh: "Predicate Coverage",
      description: "\u4F7F\u6574\u9AD4 predicate \u81F3\u5C11\u8A55\u4F30\u70BA true \u8207 false \u5404\u4E00\u6B21\u3002"
    },
    {
      id: "cc",
      label: "Clause Coverage",
      labelZh: "\u5B50\u53E5\u8986\u84CB",
      description: "\u6BCF\u500B\u5B50\u53E5\u7686\u81F3\u5C11\u5404\u53D6 true \u8207 false \u4E00\u6B21\u3002"
    },
    {
      id: "coc",
      label: "Combinatorial Coverage",
      labelZh: "\u7D44\u5408\u8986\u84CB",
      description: "\u5217\u8209\u6240\u6709 2^n \u500B\u5B50\u53E5\u771F\u5047\u7D44\u5408\u3002"
    },
    {
      id: "gacc",
      label: "General Active Clause Coverage",
      labelZh: "GACC",
      description: "\u5C0D\u6BCF\u500B\u4E3B\u5B50\u53E5\u627E\u4E00\u5C0D\u5217\uFF0C\u4F7F\u8A72\u5B50\u53E5\u6C7A\u5B9A predicate \u7684\u503C\u3002"
    },
    {
      id: "cacc",
      label: "Correlated Active Clause Coverage",
      labelZh: "CACC",
      description: "\u4E3B\u5B50\u53E5\u6C7A\u5B9A predicate\uFF0C\u4E14\u5169\u5217\u7522\u751F\u4E0D\u540C\u7684 predicate \u503C\u3002"
    },
    {
      id: "racc",
      label: "Restricted Active Clause Coverage",
      labelZh: "RACC",
      description: "\u4E3B\u5B50\u53E5\u6C7A\u5B9A predicate\uFF0C\u4E14\u5169\u5217\u7684\u6B21\u5B50\u53E5\u503C\u5B8C\u5168\u76F8\u540C\u3002"
    },
    {
      id: "gicc",
      label: "General Inactive Clause Coverage",
      labelZh: "GICC",
      description: "\u4E3B\u5B50\u53E5\u4E0D\u6C7A\u5B9A predicate\uFF0C\u8986\u84CB (c=T/F)\xD7(P=T/F) \u5171 4 \u7A2E\u7D44\u5408\u3002"
    },
    {
      id: "ricc",
      label: "Restricted Inactive Clause Coverage",
      labelZh: "RICC",
      description: "\u540C GICC\uFF0C\u4F46\u6210\u5C0D\u5217\u9700\u6240\u6709\u6B21\u5B50\u53E5\u76F8\u540C\uFF0C\u50C5\u4E3B\u5B50\u53E5\u7FFB\u8F49\u3002"
    },
    {
      id: "ic",
      label: "Implicant Coverage",
      labelZh: "IC",
      description: "\u5C0D DNF \u7684\u6BCF\u500B implicant\uFF0C\u81F3\u5C11\u627E\u5230\u4E00\u500B true point\u3002"
    },
    {
      id: "utpc",
      label: "Unique True Point Coverage",
      labelZh: "UTPC",
      description: "\u70BA\u6BCF\u500B implicant \u6311\u4E00\u500B\u53EA\u6EFF\u8DB3\u8A72 implicant \u7684 unique true point\u3002"
    },
    {
      id: "nfpc",
      label: "Near False Point Coverage",
      labelZh: "NFPC",
      description: "\u70BA\u6BCF\u500B implicant \u7684\u6BCF\u500B literal \u627E\u4E00\u500B\u7FFB\u8F49\u5F8C\u4F7F P \u70BA false \u7684\u5217\u3002"
    },
    {
      id: "cutpnfp",
      label: "Corresponding UTP + NFP Pair Coverage",
      labelZh: "CUTPNFP",
      description: "\u70BA\u6BCF\u500B implicant \u7684\u6BCF\u500B literal\uFF0C\u6311\u4E00\u5C0D\u50C5\u5728\u8A72 literal \u4E0D\u540C\u7684 UTP \u8207 NFP\u3002"
    }
  ];
  var logicCoveragePredicates = [
    {
      id: "simple-and-or",
      name: "(a && b) || c",
      expression: "(a && b) || c",
      description: "\u5E38\u898B\u7684\u6DF7\u5408 AND/OR predicate\uFF0C\u4E09\u500B\u5B50\u53E5\u3002"
    },
    {
      id: "guarded-exit",
      name: "a && (b || !c)",
      expression: "a && (b || !c)",
      description: "\u5E36\u6709\u5426\u5B9A\u5B50\u53E5\u7684\u5B88\u885B\u689D\u4EF6\u3002"
    },
    {
      id: "four-clause",
      name: "(a || b) && (c || d)",
      expression: "(a || b) && (c || d)",
      description: "\u56DB\u500B\u5B50\u53E5\u7684\u4E58\u7A4D\u5F0F predicate\uFF0C\u5E38\u898B\u65BC\u7BC4\u570D\u6AA2\u67E5\u3002"
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
    var _a;
    return {
      type,
      sourceLine: (_a = line == null ? void 0 : line.lineNumber) != null ? _a : null,
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
    var _a;
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
    if (/^(END IF|ENDIF|END)$/i.test(((_a = currentLine(state)) == null ? void 0 : _a.text) || "")) {
      consumeLine(state);
    }
    return createAstNode("if", line, {
      condition,
      consequent,
      alternate
    });
  }
  function parsePseudocodeLoop(state) {
    var _a;
    const line = consumeLine(state);
    const condition = line.text.replace(/^(WHILE|FOR)\s*/i, "").replace(/\s*DO$/i, "").trim();
    const body = parsePseudocodeStatements(state, ["END WHILE", "END FOR", "END"]);
    if (/^(END WHILE|END FOR|END)$/i.test(((_a = currentLine(state)) == null ? void 0 : _a.text) || "")) {
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
        node.y = 90 + index * 96;
      });
    });
    const coordinates = new Map(nodes.map((node) => [node.id, node]));
    edges.forEach((edge) => {
      const fromNode = coordinates.get(edge.from);
      const toNode = coordinates.get(edge.to);
      if (fromNode && toNode && toNode.x <= fromNode.x) {
        edge.control = {
          x: Math.round((fromNode.x + toNode.x) / 2),
          y: Math.min(fromNode.y, toNode.y) - 72
        };
      }
    });
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
  function getSelectedSourceNodes(graph, requirement) {
    if (!requirement) {
      return [];
    }
    return requirement.nodes.map((nodeId) => graph.nodes.find((node) => node.id === nodeId)).filter((node) => node == null ? void 0 : node.sourceLine).filter((node, index, nodes) => nodes.findIndex((item) => item.id === node.id) === index);
  }
  function renderSourceCode(sourceCode, selectedSourceNodes) {
    if (!sourceCode) {
      return '<p class="graph-source-empty" data-testid="program-source-empty">\u9019\u500B\u4F86\u6E90\u76EE\u524D\u53EA\u63D0\u4F9B graph\uFF0C\u6C92\u6709\u9644\u5E36\u7A0B\u5F0F\u78BC\u7247\u6BB5\u3002</p>';
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
            ${node.sourceLine ? `<title>Line ${node.sourceLine}: ${escapeHtml(node.sourceText || node.label)}</title>` : ""}
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
        ${renderSourceCode(activeProgram.sourceCode, selectedSourceNodes)}
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
              <div>
                <span class="detail-label">Source Mapping</span>
                <ul class="source-mapping-list" data-testid="detail-source-mapping">
                  ${selectedSourceNodes.length ? selectedSourceNodes.map((node) => `<li>${node.label} -> L${node.sourceLine}: ${escapeHtml(node.sourceText || "")}</li>`).join("") : "<li>\u76EE\u524D requirement \u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u7A0B\u5F0F\u78BC\u884C\u865F\u3002</li>"}
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
          selectedProgramId = "uploaded-code";
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

  // src/utils/logicCoverage.js
  var TOKEN_REGEX = /\s*(?:(\()|(\))|(&&)|(\|\|)|(!)|([A-Za-z_][A-Za-z0-9_]*))/y;
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
        throw new Error(`\u4E0D\u652F\u63F4\u7684\u5B57\u5143\uFF1A\u300C${remainder[0]}\u300D\u65BC\u4F4D\u7F6E ${start + 1}`);
      }
      const [, lparen, rparen, andOp, orOp, notOp, ident] = match;
      if (lparen) tokens.push({ type: "lparen" });
      else if (rparen) tokens.push({ type: "rparen" });
      else if (andOp) tokens.push({ type: "and" });
      else if (orOp) tokens.push({ type: "or" });
      else if (notOp) tokens.push({ type: "not" });
      else if (ident) tokens.push({ type: "ident", value: ident });
      lastIndex = TOKEN_REGEX.lastIndex;
    }
    if (lastIndex < expression.length && expression.slice(lastIndex).trim()) {
      throw new Error(`\u7121\u6CD5\u89E3\u6790\u5269\u9918\u5B57\u4E32\uFF1A\u300C${expression.slice(lastIndex).trim()}\u300D`);
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
        throw new Error(`\u8A9E\u6CD5\u932F\u8AA4\uFF1A\u9810\u671F ${type}\uFF0C\u5BE6\u969B ${token ? token.type : "EOF"}`);
      }
      pos += 1;
      return token;
    }
    function parseOr() {
      var _a;
      let node = parseAnd();
      while (((_a = peek()) == null ? void 0 : _a.type) === "or") {
        consume("or");
        node = { type: "or", left: node, right: parseAnd() };
      }
      return node;
    }
    function parseAnd() {
      var _a;
      let node = parseNot();
      while (((_a = peek()) == null ? void 0 : _a.type) === "and") {
        consume("and");
        node = { type: "and", left: node, right: parseNot() };
      }
      return node;
    }
    function parseNot() {
      var _a;
      if (((_a = peek()) == null ? void 0 : _a.type) === "not") {
        consume("not");
        return { type: "not", operand: parseNot() };
      }
      return parseAtom();
    }
    function parseAtom() {
      const token = peek();
      if (!token) throw new Error("\u8A9E\u6CD5\u932F\u8AA4\uFF1A\u672A\u9810\u671F\u7684\u7D50\u5C3E\u3002");
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
      throw new Error(`\u8A9E\u6CD5\u932F\u8AA4\uFF1A\u672A\u9810\u671F\u7684 ${token.type}`);
    }
    const ast = parseOr();
    if (pos !== tokens.length) {
      throw new Error("\u8A9E\u6CD5\u932F\u8AA4\uFF1A\u5269\u9918 token \u672A\u89E3\u6790\u3002");
    }
    return ast;
  }
  function evaluateAst(ast, values) {
    switch (ast.type) {
      case "clause": {
        if (!(ast.name in values)) {
          throw new Error(`\u7F3A\u5C11\u5B50\u53E5\u503C\uFF1A${ast.name}`);
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
        throw new Error(`\u672A\u77E5 AST \u7BC0\u9EDE\uFF1A${ast.type}`);
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
      throw new Error("Predicate \u4E0D\u80FD\u70BA\u7A7A\u3002");
    }
    const tokens = tokenize(trimmed);
    if (!tokens.length) {
      throw new Error("Predicate \u4E0D\u542B\u4EFB\u4F55 token\u3002");
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
      description: "\u8B93\u6574\u500B predicate \u81F3\u5C11\u8A55\u4F30\u70BA true \u8207 false \u5404\u4E00\u6B21\u3002",
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
      description: "\u6BCF\u500B\u5B50\u53E5\u90FD\u5FC5\u9808\u5404\u53D6 true \u8207 false \u4E00\u6B21\u3002",
      tests,
      requirementCount: clauses.length * 2
    };
  }
  function buildCombinatorialCoverageSet(rows) {
    return {
      id: "coc",
      name: "Combinatorial Coverage",
      description: "\u5217\u8209\u6240\u6709\u5B50\u53E5\u771F\u5047\u7D44\u5408\uFF08\u5171 2^n \u5217\uFF09\u3002",
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
          label: `${clause}=${row.values[clause] ? "T" : "F"} (\u4E3B\u5C0E ${clause})`,
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
      "\u5C0D\u6BCF\u500B\u4E3B\u5B50\u53E5\uFF0C\u627E\u4E00\u5C0D\u5217\u4F7F\u5176\u6C7A\u5B9A predicate \u7684\u503C\uFF0C\u6B21\u5B50\u53E5\u53EF\u4EFB\u610F\u3002",
      rows,
      clauses,
      "gacc"
    );
  }
  function buildCACCSet(rows, clauses) {
    return buildActiveClauseSet(
      "cacc",
      "Correlated Active Clause Coverage",
      "\u4E3B\u5B50\u53E5\u6C7A\u5B9A predicate \u7D50\u679C\uFF0C\u4E14\u5169\u5217\u7522\u751F\u4E0D\u540C\u7684 predicate \u503C\u3002",
      rows,
      clauses,
      "cacc"
    );
  }
  function buildRACCSet(rows, clauses) {
    return buildActiveClauseSet(
      "racc",
      "Restricted Active Clause Coverage",
      "\u4E3B\u5B50\u53E5\u6C7A\u5B9A predicate \u7D50\u679C\uFF0C\u4E14\u5169\u5217\u7684\u6B21\u5B50\u53E5\u503C\u5B8C\u5168\u76F8\u540C\u3002",
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
          label: `${clause}=${row.values[clause] ? "T" : "F"}, P=${row.predicate ? "T" : "F"} (\u975E\u4E3B\u5C0E ${clause})`,
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
      "\u5C0D\u6BCF\u500B\u4E3B\u5B50\u53E5\uFF0C\u65BC\u4E0D\u6C7A\u5B9A predicate \u7684\u5217\u4E2D\uFF0C\u8986\u84CB (c=T/F)\xD7(P=T/F) \u5171 4 \u7A2E\u7D44\u5408\u3002",
      rows,
      clauses,
      "gicc"
    );
  }
  function buildRICCSet(rows, clauses) {
    return buildInactiveClauseSet(
      "ricc",
      "Restricted Inactive Clause Coverage",
      "\u540C GICC\uFF0C\u4F46\u6210\u5C0D\u5217\uFF08\u540C P \u503C\uFF09\u9700\u6240\u6709\u6B21\u5B50\u53E5\u5B8C\u5168\u76F8\u540C\uFF0C\u50C5\u4E3B\u5B50\u53E5\u7FFB\u8F49\u3002",
      rows,
      clauses,
      "ricc"
    );
  }
  function buildAllCoverageSets(parsed) {
    const rows = buildTruthTable(parsed);
    const dnf = toDNF(parsed.ast);
    return {
      rows,
      clauses: parsed.clauses,
      dnf,
      sets: {
        pc: buildPredicateCoverageSet(rows),
        cc: buildClauseCoverageSet(rows, parsed.clauses),
        coc: buildCombinatorialCoverageSet(rows),
        gacc: buildGACCSet(rows, parsed.clauses),
        cacc: buildCACCSet(rows, parsed.clauses),
        racc: buildRACCSet(rows, parsed.clauses),
        gicc: buildGICCSet(rows, parsed.clauses),
        ricc: buildRICCSet(rows, parsed.clauses),
        ic: buildImplicantCoverageSet(rows, dnf),
        utpc: buildUTPCSet(rows, dnf),
        nfpc: buildNFPCSet(rows, dnf),
        cutpnfp: buildCUTPNFPSet(rows, dnf)
      }
    };
  }
  function literalKey(lit) {
    return `${lit.negated ? "!" : ""}${lit.name}`;
  }
  function termKey(term) {
    return term.map(literalKey).sort().join("&");
  }
  function termToString(term) {
    if (!term.length) return "true";
    return term.map(literalKey).join(" && ");
  }
  function mergeLiterals(a, b) {
    const map = /* @__PURE__ */ new Map();
    for (const lit of [...a, ...b]) {
      const existing = map.get(lit.name);
      if (existing && existing.negated !== lit.negated) {
        return null;
      }
      if (!existing) {
        map.set(lit.name, lit);
      }
    }
    return [...map.values()];
  }
  function dedupeTerms(terms) {
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    terms.forEach((t) => {
      const key = termKey(t);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(t);
      }
    });
    return out;
  }
  function dnfFromAst(ast) {
    switch (ast.type) {
      case "clause":
        return [[{ name: ast.name, negated: false }]];
      case "not":
        return dnfNegate(ast.operand);
      case "and": {
        const left = dnfFromAst(ast.left);
        const right = dnfFromAst(ast.right);
        const terms = [];
        left.forEach((lt) => right.forEach((rt) => {
          const merged = mergeLiterals(lt, rt);
          if (merged) terms.push(merged);
        }));
        return dedupeTerms(terms);
      }
      case "or":
        return dedupeTerms([...dnfFromAst(ast.left), ...dnfFromAst(ast.right)]);
      default:
        throw new Error(`\u672A\u77E5 AST \u7BC0\u9EDE\uFF1A${ast.type}`);
    }
  }
  function dnfNegate(ast) {
    switch (ast.type) {
      case "clause":
        return [[{ name: ast.name, negated: true }]];
      case "not":
        return dnfFromAst(ast.operand);
      case "and":
        return dedupeTerms([...dnfNegate(ast.left), ...dnfNegate(ast.right)]);
      case "or": {
        const left = dnfNegate(ast.left);
        const right = dnfNegate(ast.right);
        const terms = [];
        left.forEach((lt) => right.forEach((rt) => {
          const merged = mergeLiterals(lt, rt);
          if (merged) terms.push(merged);
        }));
        return dedupeTerms(terms);
      }
      default:
        throw new Error(`\u672A\u77E5 AST \u7BC0\u9EDE\uFF1A${ast.type}`);
    }
  }
  function toDNF(ast) {
    return dnfFromAst(ast);
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
  function buildImplicantCoverageSet(rows, dnf) {
    const tests = [];
    const seen = /* @__PURE__ */ new Set();
    const unsatisfied = [];
    dnf.forEach((term, index) => {
      const candidates = findRowsForTerm(rows, term);
      if (!candidates.length) {
        unsatisfied.push(`implicant {${termLabel(term)}}`);
        return;
      }
      const row = candidates[0];
      const key = `r${row.index}-i${index}`;
      if (seen.has(key)) return;
      seen.add(key);
      tests.push({
        id: key,
        row,
        label: `implicant {${termLabel(term)}}`,
        implicantIndex: index
      });
    });
    return {
      id: "ic",
      name: "Implicant Coverage",
      description: "\u5C0D DNF \u4E2D\u6BCF\u500B implicant\uFF0C\u81F3\u5C11\u627E\u5230\u4E00\u500B\u4F7F\u5176\u70BA\u771F\u7684 true point\u3002",
      tests,
      requirementCount: dnf.length,
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
      const row = utps[0];
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
    return {
      id: "utpc",
      name: "Unique True Point Coverage",
      description: "\u5C0D\u6BCF\u500B implicant\uFF0C\u6311\u4E00\u500B\u53EA\u6EFF\u8DB3\u8A72 implicant \u7684 unique true point\u3002",
      tests,
      requirementCount: dnf.length,
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
        tests.push({
          id: key,
          row,
          label: `NFP {${termLabel(term)}} \u7FFB\u8F49 ${literalKey(literal)}`,
          implicantIndex: index
        });
      });
    });
    return {
      id: "nfpc",
      name: "Near False Point Coverage",
      description: "\u5C0D\u6BCF\u500B implicant \u7684\u6BCF\u500B literal\uFF0C\u627E\u4E00\u500B\u7FFB\u8F49\u8A72 literal \u5F8C\u4F7F implicant \u70BA\u5047\u4E14 P \u70BA\u5047\u7684 row\u3002",
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
          unsatisfied.push(`CUTPNFP {${termLabel(term)}} \u7FFB\u8F49 ${literalKey(literal)}`);
          return;
        }
        pair.forEach((row, role) => {
          const key = `r${row.index}-cutp${index}-${literalIndex}-${role}`;
          if (seen.has(key)) return;
          seen.add(key);
          tests.push({
            id: key,
            row,
            label: `${role === 0 ? "UTP" : "NFP"} pair {${termLabel(term)}} \u7FFB\u8F49 ${literalKey(literal)}`,
            implicantIndex: index
          });
        });
      });
    });
    return {
      id: "cutpnfp",
      name: "Corresponding UTP + NFP Pair Coverage",
      description: "\u70BA\u6BCF\u500B implicant \u7684\u6BCF\u500B literal\uFF0C\u6311\u4E00\u5C0D\u50C5\u5728\u8A72 literal \u4E0D\u540C\u7684 UTP \u8207 NFP\u3002",
      tests,
      requirementCount,
      unsatisfied
    };
  }

  // src/components/LogicCoverageExplorer.js
  var RECENT_KEY = "stvisual.logic.recentPredicates";
  var RECENT_LIMIT = 8;
  function loadRecent() {
    var _a;
    try {
      const raw = (_a = globalThis.localStorage) == null ? void 0 : _a.getItem(RECENT_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((p) => typeof p === "string") : [];
    } catch {
      return [];
    }
  }
  function saveRecent(list) {
    var _a;
    try {
      (_a = globalThis.localStorage) == null ? void 0 : _a.setItem(RECENT_KEY, JSON.stringify(list));
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
      recent: loadRecent()
    };
    function rememberCurrentExpression() {
      const expr = state.expression.trim();
      if (!expr || state.error) return false;
      if (isBuiltinExpression(expr)) return false;
      const next = [expr, ...state.recent.filter((item) => item !== expr)].slice(0, RECENT_LIMIT);
      if (next.length === state.recent.length && next[0] === state.recent[0]) {
        return false;
      }
      state.recent = next;
      saveRecent(state.recent);
      return true;
    }
    function removeRecent(expr) {
      const next = state.recent.filter((item) => item !== expr);
      if (next.length === state.recent.length) return;
      state.recent = next;
      saveRecent(state.recent);
      render();
    }
    function recompute() {
      try {
        state.parsed = parsePredicate(state.expression);
        if (state.parsed.clauses.length > 6) {
          throw new Error("\u70BA\u4E86\u8996\u89BA\u5316\u53EF\u8B80\u6027\uFF0C\u5B50\u53E5\u6578\u91CF\u8ACB\u9650\u5236\u5728 6 \u500B\u4EE5\u5167\u3002");
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
      return new Set(set.tests.map((t) => `r${t.row.index}`));
    }
    function render() {
      const examplesMarkup = logicCoveragePredicates.map((p) => `
        <button
          type="button"
          class="logic-example-btn${state.expression === p.expression ? " active" : ""}"
          data-expression="${escapeHtml2(p.expression)}"
          data-testid="logic-example-${p.id}"
          title="${escapeHtml2(p.description)}"
        >
          ${escapeHtml2(p.name)}
        </button>
      `).join("");
      const recentMarkup = state.recent.length ? `
        <div class="logic-recent" data-testid="logic-recent">
          <span class="logic-recent-label">\u6700\u8FD1\uFF1A</span>
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
                  aria-label="\u79FB\u9664 ${escapeHtml2(expr)}"
                  title="\u79FB\u9664"
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
          <span class="logic-criterion-label">${escapeHtml2(c.label)}</span>
          <span class="logic-criterion-zh">${escapeHtml2(c.labelZh)}</span>
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
        <div class="logic-examples">${examplesMarkup}</div>
        ${recentMarkup}
      </div>

      ${state.error ? `<div class="logic-error" data-testid="logic-error">${escapeHtml2(state.error)}</div>` : ""}

      <div class="logic-criteria" role="tablist" aria-label="Logic Coverage \u6E96\u5247">
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
      var _a;
      if (state.error || !state.analysis) {
        return "";
      }
      const set = getActiveSet();
      if (!set) return "";
      const seenRows = /* @__PURE__ */ new Set();
      const annotated = set.tests.map((t) => {
        const key = `r${t.row.index}`;
        const isDuplicate = seenRows.has(key);
        if (!isDuplicate) seenRows.add(key);
        return { test: t, isDuplicate };
      });
      const totalCount = annotated.length;
      const duplicateCount = annotated.filter((item) => item.isDuplicate).length;
      const uniqueCount = totalCount - duplicateCount;
      const testList = annotated.map(({ test: t, isDuplicate }) => `
        <li class="logic-test-item${isDuplicate ? " duplicate" : ""}" data-testid="logic-test-${escapeHtml2(t.id)}">
          <span class="logic-test-row">#${t.row.index}</span>
          <span class="logic-test-values">${state.analysis.clauses.map((c) => `${c}=${t.row.values[c] ? "T" : "F"}`).join(", ")}</span>
          <span class="logic-test-pred ${t.row.predicate ? "is-true" : "is-false"}">P=${t.row.predicate ? "T" : "F"}</span>
          <span class="logic-test-label">${escapeHtml2(t.label)}</span>
          ${isDuplicate ? '<span class="logic-test-dup-tag" aria-label="\u91CD\u8907">\u91CD\u8907</span>' : ""}
        </li>
      `).join("");
      const unsatisfied = ((_a = set.unsatisfied) == null ? void 0 : _a.length) ? `<p class="logic-unsatisfied" data-testid="logic-unsatisfied">\u7121\u6CD5\u627E\u5230\u4E0B\u5217\u9700\u6C42\u5C0D\u61C9\u5217\uFF1A${set.unsatisfied.join(", ")}</p>` : "";
      const dnfMarkup = ["ic", "utpc", "nfpc", "cutpnfp"].includes(set.id) && state.analysis.dnf ? `<p class="logic-dnf" data-testid="logic-dnf">DNF\uFF1A${state.analysis.dnf.map((term) => `<code>${escapeHtml2(termToHtml(term))}</code>`).join(" &nbsp;\u2228&nbsp; ") || "<code>true</code>"}</p>` : "";
      return `
      <h3 class="logic-summary-title">${escapeHtml2(set.name)}</h3>
      <p class="logic-summary-desc">${escapeHtml2(set.description)}</p>
      ${dnfMarkup}
      <p class="logic-summary-stats">
        \u6E2C\u8A66\u5217\u6578\uFF1A<strong data-testid="logic-test-count">${totalCount}</strong>
        <span class="logic-divider">\xB7</span>
        \u5BE6\u969B\u9700\u8981\uFF08\u53BB\u91CD\uFF09\uFF1A<strong data-testid="logic-test-unique-count">${uniqueCount}</strong>
        <span class="logic-divider">\xB7</span>
        \u91CD\u8907\u6578\u91CF\uFF1A<strong data-testid="logic-test-duplicate-count">${duplicateCount}</strong>
        <span class="logic-divider">\xB7</span>
        \u5EFA\u8B70\u6E2C\u8A66\u9700\u6C42\uFF1A<strong>${set.requirementCount}</strong>
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

  // src/config/cloudConfig.js
  var cloudConfig = {
    firebase: {
      apiKey: "AIzaSyB9QlOS2IodbRQWxGGe_a8cEviSZURyo3k",
      authDomain: "stvisual-a88cd.firebaseapp.com",
      projectId: "stvisual-a88cd",
      storageBucket: "stvisual-a88cd.firebasestorage.app",
      messagingSenderId: "1030102454109",
      appId: "1:1030102454109:web:cb50e6da22b4b5dda2a2b4",
      measurementId: "G-RBRGPW34JQ"
    },
    drive: {
      uploadFolderId: "1B5hCB2Scte4Sds0d03mYNu-iGZS0JKbJ"
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
    var _a;
    const config = getResolvedCloudConfig();
    const missingKeys = getMissingFirebaseKeys(config.firebase);
    const isFileProtocol = ((_a = globalThis.location) == null ? void 0 : _a.protocol) === "file:";
    const isSupportedOrigin = !isFileProtocol;
    const isConfigured = missingKeys.length === 0;
    const firebase = globalThis.firebase;
    if (!isSupportedOrigin) {
      const originMessage = "Google OAuth \u4E0D\u652F\u63F4 file://\u3002\u8ACB\u6539\u7528 http://localhost \u6216 https \u7DB2\u5740\u958B\u555F\u9801\u9762\u3002";
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
          throw new Error(`Firebase \u8A2D\u5B9A\u4E0D\u5B8C\u6574\uFF0C\u7F3A\u5C11\uFF1A${missingKeys.join(", ")}`);
        },
        async signOutGoogle() {
          throw new Error(`Firebase \u8A2D\u5B9A\u4E0D\u5B8C\u6574\uFF0C\u7F3A\u5C11\uFF1A${missingKeys.join(", ")}`);
        },
        async saveSettings() {
          throw new Error(`Firebase \u8A2D\u5B9A\u4E0D\u5B8C\u6574\uFF0C\u7F3A\u5C11\uFF1A${missingKeys.join(", ")}`);
        },
        async loadSettings() {
          throw new Error(`Firebase \u8A2D\u5B9A\u4E0D\u5B8C\u6574\uFF0C\u7F3A\u5C11\uFF1A${missingKeys.join(", ")}`);
        },
        async uploadFileToDrive() {
          throw new Error(`Firebase \u8A2D\u5B9A\u4E0D\u5B8C\u6574\uFF0C\u7F3A\u5C11\uFF1A${missingKeys.join(", ")}`);
        }
      };
    }
    if (!(firebase == null ? void 0 : firebase.apps) || typeof firebase.initializeApp !== "function") {
      const sdkMessage = "Firebase SDK \u5C1A\u672A\u8F09\u5165\uFF0C\u8ACB\u78BA\u8A8D index.html \u5DF2\u5F15\u5165 firebase-app/auth/firestore compat scripts\u3002";
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
        if (!snapshot.exists()) {
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
      async uploadFileToDrive(file, options = {}) {
        var _a2;
        if (!driveAccessToken) {
          throw new Error("\u76EE\u524D\u6C92\u6709 Drive \u5B58\u53D6\u6B0A\u6756\uFF0C\u8ACB\u5148\u91CD\u65B0 Google \u767B\u5165\u3002");
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
          throw new Error(((_a2 = payload == null ? void 0 : payload.error) == null ? void 0 : _a2.message) || "\u4E0A\u50B3\u5230 Google Drive \u5931\u6557\u3002");
        }
        return payload;
      }
    };
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
    let status = canUseCloudAuth ? "\u8ACB\u5148\u4EE5 Google \u767B\u5165\u5F8C\uFF0C\u518D\u5132\u5B58\u8A2D\u5B9A\u6216\u4E0A\u50B3\u6A94\u6848\u3002" : client.isSupportedOrigin ? `Firebase \u8A2D\u5B9A\u4E0D\u5B8C\u6574\uFF1A${client.missingKeys.join(", ")}` : client.originWarning;
    let settings = { ...DEFAULT_SETTINGS };
    let uploadedFiles = [];
    let selectedFile = null;
    function render() {
      root2.className = "cloud-storage";
      root2.dataset.testid = "cloud-storage-panel";
      root2.innerHTML = `
      <div class="cloud-card">
        <div class="cloud-header">
          <div>
            <p class="cloud-kicker">Google + Firebase</p>
            <h3>\u96F2\u7AEF\u8A2D\u5B9A\u8207\u6A94\u6848\u5132\u5B58</h3>
            <p class="cloud-subtitle">Google \u767B\u5165\u5F8C\uFF1A\u8A2D\u5B9A\u5B58 Firebase\u3001\u6A94\u6848\u4E0A\u50B3\u5230 Google Drive\u3002</p>
            ${!client.isSupportedOrigin ? '<p class="cloud-warning" data-testid="cloud-origin-warning">\u76EE\u524D\u70BA file:// \u6A21\u5F0F\u3002Google OAuth \u9700\u8981 http://localhost \u6216 https\u3002</p>' : ""}
          </div>
          <div class="cloud-auth-actions">
            <button type="button" class="cloud-btn" data-testid="cloud-signin-btn" ${!canUseCloudAuth ? "disabled" : ""}>Google \u767B\u5165</button>
            <button type="button" class="cloud-btn cloud-btn--secondary" data-testid="cloud-signout-btn" ${!user ? "disabled" : ""}>\u767B\u51FA</button>
          </div>
        </div>

        <div class="cloud-meta">
          <p data-testid="cloud-status">${status}</p>
          <p data-testid="cloud-user">${user ? `\u76EE\u524D\u4F7F\u7528\u8005\uFF1A${user.email || user.uid}` : "\u5C1A\u672A\u767B\u5165"}</p>
        </div>

        <div class="cloud-grid">
          <section class="cloud-section">
            <h4>\u8A2D\u5B9A\uFF08Firebase Firestore\uFF09</h4>
            <label>
              \u9810\u8A2D Coverage Criterion
              <select data-testid="cloud-criterion-select">
                ${graphCoverageCriteria.map((criterion) => `
                  <option value="${criterion.id}"${settings.preferredCriterion === criterion.id ? " selected" : ""}>${criterion.label}</option>
                `).join("")}
              </select>
            </label>

            <label>
              \u5099\u8A3B
              <textarea data-testid="cloud-notes-input">${settings.notes || ""}</textarea>
            </label>

            <label>
              \u984D\u5916\u8A2D\u5B9A JSON
              <textarea data-testid="cloud-extras-input">${formatJson(settings.extras || {})}</textarea>
            </label>

            <div class="cloud-actions-row">
              <button type="button" class="cloud-btn" data-testid="cloud-load-settings-btn" ${!user ? "disabled" : ""}>\u8B80\u53D6\u8A2D\u5B9A</button>
              <button type="button" class="cloud-btn" data-testid="cloud-save-settings-btn" ${!user ? "disabled" : ""}>\u5132\u5B58\u8A2D\u5B9A</button>
            </div>
          </section>

          <section class="cloud-section">
            <h4>\u6A94\u6848\uFF08Google Drive\uFF09</h4>
            <label class="cloud-file-picker">
              \u9078\u64C7\u8981\u4E0A\u50B3\u7684\u6A94\u6848
              <input type="file" data-testid="cloud-file-input" ${!user ? "disabled" : ""} />
            </label>
            <p data-testid="cloud-file-name">${selectedFile ? `\u5F85\u4E0A\u50B3\uFF1A${selectedFile.name}` : "\u5C1A\u672A\u9078\u64C7\u6A94\u6848"}</p>
            <button type="button" class="cloud-btn" data-testid="cloud-upload-btn" ${!selectedFile || !user ? "disabled" : ""}>\u4E0A\u50B3\u5230 Google Drive</button>

            <ul class="cloud-upload-list" data-testid="cloud-upload-list">
              ${uploadedFiles.map((item) => `<li><strong>${item.name}</strong>${item.webViewLink ? ` \xB7 <a href="${item.webViewLink}" target="_blank" rel="noreferrer">\u958B\u555F</a>` : ""}</li>`).join("") || "<li>\u5C1A\u7121\u4E0A\u50B3\u7D00\u9304</li>"}
            </ul>
          </section>
        </div>
      </div>
    `;
      root2.querySelector('[data-testid="cloud-signin-btn"]').addEventListener("click", async () => {
        try {
          const result = await client.signInWithGoogle();
          user = result.user;
          status = result.hasDriveToken ? "Google \u767B\u5165\u6210\u529F\uFF0C\u5DF2\u53D6\u5F97 Drive \u4E0A\u50B3\u6B0A\u9650\u3002" : "Google \u767B\u5165\u6210\u529F\uFF0C\u4F46\u672A\u53D6\u5F97 Drive \u6B0A\u9650\uFF0C\u8ACB\u91CD\u65B0\u767B\u5165\u3002";
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
          status = "\u5DF2\u767B\u51FA\u3002";
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
            status = "\u5DF2\u5F9E Firebase \u8F09\u5165\u8A2D\u5B9A\u3002";
          } else {
            status = "Firebase \u5C1A\u7121\u5DF2\u5132\u5B58\u8A2D\u5B9A\u3002";
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
          status = "\u8A2D\u5B9A\u5DF2\u5132\u5B58\u5230 Firebase\u3002";
          render();
        } catch (error) {
          status = error.message.includes("JSON") ? "\u984D\u5916\u8A2D\u5B9A JSON \u683C\u5F0F\u932F\u8AA4\u3002" : error.message;
          render();
        }
      });
      root2.querySelector('[data-testid="cloud-upload-btn"]').addEventListener("click", async () => {
        try {
          const uploaded = await client.uploadFileToDrive(selectedFile);
          uploadedFiles = [uploaded, ...uploadedFiles].slice(0, 8);
          status = `\u6A94\u6848 ${uploaded.name} \u5DF2\u4E0A\u50B3\u5230 Google Drive\u3002`;
          selectedFile = null;
          render();
        } catch (error) {
          status = error.message;
          render();
        }
      });
    }
    client.subscribeAuthState(async (nextUser) => {
      user = nextUser;
      if (!user && canUseCloudAuth) {
        status = "\u8ACB\u5148\u4EE5 Google \u767B\u5165\u5F8C\uFF0C\u518D\u5132\u5B58\u8A2D\u5B9A\u6216\u4E0A\u50B3\u6A94\u6848\u3002";
      }
      render();
    });
    render();
    return root2;
  }

  // src/app.js
  var sectionsConfig = [
    { id: "all", label: "\u5168\u89BD" },
    { id: "methods", label: "\u6E2C\u8A66\u65B9\u6CD5" },
    { id: "graph", label: "Graph Coverage" },
    { id: "logic", label: "Logic Coverage" },
    { id: "cloud", label: "\u96F2\u7AEF\u6574\u5408" },
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
        <section data-testid="section-logic">
          <h2>Logic Coverage \u8996\u89BA\u5316</h2>
          <div data-slot="logic"></div>
        </section>
        <section data-testid="section-cloud">
          <h2>Google \u96F2\u7AEF\u6574\u5408</h2>
          <div data-slot="cloud"></div>
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
      logic: main.querySelector('[data-testid="section-logic"]'),
      cloud: main.querySelector('[data-testid="section-cloud"]'),
      flow: main.querySelector('[data-testid="section-flow"]'),
      types: main.querySelector('[data-testid="section-types"]')
    };
    const components = {
      methods: createTestingMethodTree(),
      graph: createGraphCoverageExplorer(),
      logic: createLogicCoverageExplorer(),
      cloud: createCloudStoragePanel(),
      flow: createTestingFlow(),
      types: createTestingTypesTable()
    };
    container.querySelector('[data-slot="methods"]').appendChild(components.methods);
    container.querySelector('[data-slot="graph"]').appendChild(components.graph);
    container.querySelector('[data-slot="logic"]').appendChild(components.logic);
    container.querySelector('[data-slot="cloud"]').appendChild(components.cloud);
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
