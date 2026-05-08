export const testingMethods = [
  {
    id: 'blackbox',
    name: '黑盒測試',
    nameEn: 'Black Box Testing',
    description: '不考慮內部實現，完全聚焦輸入與輸出行為',
    descriptionEn: 'Ignores internal implementation; focuses entirely on input and output behavior.',
    visibility: 0,
    colorScheme: 'dark',
    techniques: [
      { id: 'bva', name: '邊界值分析', nameEn: 'Boundary Value Analysis', description: '測試輸入的邊界條件', descriptionEn: 'Test inputs at the boundaries of input domains.' },
      { id: 'ep',  name: '等價類分割', nameEn: 'Equivalence Partitioning', description: '將輸入空間劃分為等價類', descriptionEn: 'Partition the input space into equivalence classes.' },
      { id: 'ceg', name: '因果圖', nameEn: 'Cause-Effect Graph', description: '分析輸入輸出間的因果關係', descriptionEn: 'Analyze cause-effect relations between inputs and outputs.' },
      { id: 'stt', name: '狀態遷移測試', nameEn: 'State Transition Testing', description: '驗證系統的狀態轉換行為', descriptionEn: 'Validate the state transition behavior of the system.' },
    ],
  },
  {
    id: 'whitebox',
    name: '白盒測試',
    nameEn: 'White Box Testing',
    description: '基於內部代碼結構，確保所有路徑皆被覆蓋',
    descriptionEn: 'Based on internal code structure; aims to cover all paths.',
    visibility: 100,
    colorScheme: 'light',
    techniques: [
      { id: 'sc',  name: '語句覆蓋', nameEn: 'Statement Coverage', description: '確保每條語句至少執行一次', descriptionEn: 'Ensure every statement executes at least once.' },
      { id: 'bc',  name: '分支覆蓋', nameEn: 'Branch Coverage', description: '確保每個分支（true/false）都被執行', descriptionEn: 'Ensure every branch (true/false) is executed.' },
      { id: 'gc',  name: '圖形覆蓋', nameEn: 'Graph Coverage', description: '以控制流程圖推導節點、邊與 Prime Path 的測試需求', descriptionEn: 'Derive node, edge, and prime-path requirements from the CFG.' },
      { id: 'lc',  name: '邏輯覆蓋', nameEn: 'Logic Coverage', description: '以述詞與子句為核心的覆蓋策略，包含 PC、CC、ACC 系列', descriptionEn: 'Predicate/clause-centric strategy: PC, CC, ACC family, etc.' },
      { id: 'pc',  name: '路徑覆蓋', nameEn: 'Path Coverage', description: '確保每條獨立路徑都被執行', descriptionEn: 'Ensure each independent path is executed.' },
      { id: 'ppc', name: 'Prime Path Coverage', nameEn: 'Prime Path Coverage', description: '最小化且完整的路徑覆蓋集合', descriptionEn: 'Minimal yet complete prime-path coverage set.' },
      { id: 'cc',  name: '條件覆蓋', nameEn: 'Condition Coverage', description: '確保每個布林條件的真假都被測試', descriptionEn: 'Ensure each Boolean condition is tested for true and false.' },
      { id: 'mc',  name: '多重條件覆蓋', nameEn: 'Multiple Conditions', description: '測試所有條件組合的真假情況', descriptionEn: 'Test all true/false combinations of conditions.' },
      { id: 'symbex', name: '符號執行', nameEn: 'Symbolic Execution', description: '以符號值代入程式變數，沿路徑收集 path condition 並求解可達輸入', descriptionEn: 'Substitute symbolic values for program inputs, collect a path condition along each path, and solve for concrete witnesses.' },
      { id: 'concolic', name: '具體符號執行', nameEn: 'Concolic Execution', description: '結合具體執行與符號執行 (DART/CUTE)：每次具體跑一條路徑，再翻轉分支條件求解新輸入以涵蓋更多路徑', descriptionEn: 'Concrete + symbolic (DART/CUTE): runs the program concretely, then negates branch conditions to derive new inputs that cover additional paths.' },
    ],
  },
  {
    id: 'graybox',
    name: '灰盒測試',
    nameEn: 'Gray Box Testing',
    description: '部分了解內部實現，結合兩者優點以提高效率',
    descriptionEn: 'Partial knowledge of internals; combines black- and white-box advantages.',
    visibility: 50,
    colorScheme: 'medium',
    techniques: [
      { id: 'combined', name: '結合黑盒與白盒', nameEn: 'Combined Approach', description: '靈活運用兩種方法的測試策略', descriptionEn: 'Flexible mix of both black- and white-box strategies.' },
      { id: 'partial',  name: '部分代碼可見', nameEn: 'Partial Code Visibility', description: '利用可見的部分實現輔助設計測試', descriptionEn: 'Use the visible portion of the code to guide test design.' },
    ],
  },
];

export const testingFlow = [
  { id: 'req',      label: '需求分析', labelEn: 'Requirements', icon: '📋', description: '分析軟體需求，確定測試目標與範圍', descriptionEn: 'Analyze requirements; determine test goals and scope.' },
  { id: 'plan',     label: '測試計劃', labelEn: 'Test Plan',     icon: '📝', description: '制定測試策略、資源分配與進度計劃', descriptionEn: 'Define test strategy, resource allocation, and schedule.' },
  { id: 'design',   label: '測試設計', labelEn: 'Test Design',   icon: '✏️', description: '設計測試用例、腳本與測試數據', descriptionEn: 'Design test cases, scripts, and test data.' },
  { id: 'exec',     label: '測試執行', labelEn: 'Execution',     icon: '▶️', description: '執行測試用例，記錄實際與預期結果', descriptionEn: 'Execute test cases; record actual vs. expected results.' },
  { id: 'analysis', label: '結果分析', labelEn: 'Analysis',      icon: '🔍', description: '比較結果，識別缺陷並評估測試覆蓋率', descriptionEn: 'Compare results, identify defects, and assess coverage.' },
  { id: 'report',   label: '缺陷報告', labelEn: 'Defect Report', icon: '📊', description: '撰寫測試報告，追蹤缺陷修復狀態', descriptionEn: 'Write reports and track defect-fix status.' },
];

export const testingTypes = [
  { id: 'unit',        type: '單元測試',  typeEn: 'Unit Testing',        purpose: '測試最小單位',  purposeEn: 'Test the smallest units of code.',          timing: '開發階段',  timingEn: 'Development',    color: '#3498db', width: 30 },
  { id: 'integration', type: '集成測試',  typeEn: 'Integration Testing', purpose: '測試模組組合',  purposeEn: 'Test combinations of modules.',             timing: '開發後期',  timingEn: 'Late development', color: '#27ae60', width: 55 },
  { id: 'system',      type: '系統測試',  typeEn: 'System Testing',      purpose: '測試整體系統',  purposeEn: 'Test the system as a whole.',               timing: '集成完成後', timingEn: 'After integration', color: '#f39c12', width: 80 },
  { id: 'acceptance',  type: '驗收測試',  typeEn: 'Acceptance Testing',  purpose: '驗證需求達成',  purposeEn: 'Verify requirements are satisfied.',        timing: '部署前',    timingEn: 'Before deployment', color: '#e74c3c', width: 100 },
];

export const graphCoverageCriteria = [
  { id: 'node',          label: 'Node Coverage',          labelZh: '節點覆蓋',     description: '每個節點至少被一個測試路徑拜訪一次。', descriptionEn: 'Every node is visited by at least one test path.' },
  { id: 'edge',          label: 'Edge Coverage',          labelZh: '邊覆蓋',       description: '每條有向邊至少被一個測試路徑經過一次。', descriptionEn: 'Every directed edge is traversed by at least one test path.' },
  { id: 'prime-path',    label: 'Prime Path Coverage',    labelZh: 'Prime Path 覆蓋', description: '所有 prime path 都必須被測試需求涵蓋，包含迴圈。', descriptionEn: 'All prime paths (including loops) must be covered.' },
  { id: 'edge-pair',     label: 'Edge-Pair Coverage',     labelZh: '邊對覆蓋',     description: '每一組相鄰的兩條邊都要至少被一條測試路徑覆蓋。', descriptionEn: 'Every pair of adjacent edges must be covered by some test path.' },
  { id: 'complete-path', label: 'Complete Path Coverage', labelZh: '完整路徑覆蓋', description: '以有限深度列舉 start 到 end 的完整可行路徑集合。', descriptionEn: 'Enumerate all complete feasible paths from start to end up to a finite depth.' },
  { id: 'all-defs',      label: 'All-Defs Coverage',      labelZh: '所有定義覆蓋',     description: '對於每個 (節點, 變數) 的定義，至少有一條從該定義到某個使用的 def-clear 路徑被覆蓋。', descriptionEn: 'For every (node, variable) definition, cover at least one definition-clear path from the def to some use of that variable.' },
  { id: 'all-uses',      label: 'All-Uses Coverage',      labelZh: '所有使用覆蓋',     description: '對於每對 (定義, 使用, 變數)，至少有一條 def-clear 路徑被測試路徑覆蓋。', descriptionEn: 'For every (def, use, variable) pair, cover at least one definition-clear path from the def to that use.' },
  { id: 'all-du-paths',  label: 'All-DU-Paths Coverage',  labelZh: '所有 DU 路徑覆蓋', description: '對於每對 (定義, 使用, 變數)，所有 def-clear 簡單路徑都必須被測試路徑覆蓋。', descriptionEn: 'For every (def, use, variable) pair, every definition-clear simple path from the def to that use must be covered.' },
];

export const graphCoverageCodeLanguages = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'pseudocode', label: 'Pseudo Code' },
];

export const graphCoverageGraph = {
  id: 'control-flow-sample',
  title: '控制流程圖範例',
  titleEn: 'Sample Control Flow Graph',
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

export const graphCoverageProgramExamples = [
  {
    id: 'triangle-problem',
    name: 'Triangle Problem',
    language: 'javascript',
    description: 'Classic triangle classification logic with validity, equilateral, isosceles, and scalene branches.',
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
      id: 'triangle-problem-cfg',
      title: 'Triangle Problem Control Flow Graph',
      startNodeId: 'S',
      endNodeId: 'T',
      nodes: [
        { id: 'S', label: 'Start', x: 80, y: 180, kind: 'start' },
        { id: 'V', label: 'Positive?', x: 220, y: 180, kind: 'decision' },
        { id: 'R1', label: 'Invalid', x: 380, y: 70, kind: 'node' },
        { id: 'I', label: 'Triangle?', x: 380, y: 180, kind: 'decision' },
        { id: 'E', label: 'Equilateral?', x: 560, y: 100, kind: 'decision' },
        { id: 'J', label: 'Isosceles?', x: 560, y: 260, kind: 'decision' },
        { id: 'R2', label: 'Equilateral', x: 740, y: 60, kind: 'node' },
        { id: 'R3', label: 'Isosceles', x: 740, y: 180, kind: 'node' },
        { id: 'R4', label: 'Scalene', x: 740, y: 300, kind: 'node' },
        { id: 'T', label: 'End', x: 880, y: 180, kind: 'end' },
      ],
      edges: [
        { id: 'S-V', from: 'S', to: 'V' },
        { id: 'V-R1', from: 'V', to: 'R1' },
        { id: 'V-I', from: 'V', to: 'I' },
        { id: 'I-R1', from: 'I', to: 'R1' },
        { id: 'I-E', from: 'I', to: 'E' },
        { id: 'E-R2', from: 'E', to: 'R2' },
        { id: 'E-J', from: 'E', to: 'J' },
        { id: 'J-R3', from: 'J', to: 'R3' },
        { id: 'J-R4', from: 'J', to: 'R4' },
        { id: 'R1-T', from: 'R1', to: 'T' },
        { id: 'R2-T', from: 'R2', to: 'T' },
        { id: 'R3-T', from: 'R3', to: 'T' },
        { id: 'R4-T', from: 'R4', to: 'T' },
      ],
    },
  },
  {
    id: 'next-date',
    name: 'Next Date',
    language: 'javascript',
    description: 'A simplified next-date program that validates the date, advances within a month, and handles year rollover.',
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
      id: 'next-date-cfg',
      title: 'Next Date Control Flow Graph',
      startNodeId: 'S',
      endNodeId: 'T',
      nodes: [
        { id: 'S', label: 'Start', x: 80, y: 180, kind: 'start' },
        { id: 'V', label: 'Valid Date?', x: 230, y: 180, kind: 'decision' },
        { id: 'R1', label: 'Invalid', x: 410, y: 70, kind: 'node' },
        { id: 'D', label: 'Day < Max?', x: 410, y: 180, kind: 'decision' },
        { id: 'R2', label: 'Next Day', x: 610, y: 70, kind: 'node' },
        { id: 'M', label: 'Month=12?', x: 610, y: 250, kind: 'decision' },
        { id: 'R3', label: 'Next Year', x: 790, y: 140, kind: 'node' },
        { id: 'R4', label: 'Next Month', x: 790, y: 300, kind: 'node' },
        { id: 'T', label: 'End', x: 900, y: 220, kind: 'end' },
      ],
      edges: [
        { id: 'S-V', from: 'S', to: 'V' },
        { id: 'V-R1', from: 'V', to: 'R1' },
        { id: 'V-D', from: 'V', to: 'D' },
        { id: 'D-R2', from: 'D', to: 'R2' },
        { id: 'D-M', from: 'D', to: 'M' },
        { id: 'M-R3', from: 'M', to: 'R3' },
        { id: 'M-R4', from: 'M', to: 'R4' },
        { id: 'R1-T', from: 'R1', to: 'T' },
        { id: 'R2-T', from: 'R2', to: 'T' },
        { id: 'R3-T', from: 'R3', to: 'T' },
        { id: 'R4-T', from: 'R4', to: 'T' },
      ],
    },
  },
  {
    id: 'commission-problem',
    name: 'Commission Problem',
    language: 'javascript',
    description: 'A classic sales commission example with threshold-based decision logic.',
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
}`,
  },
  {
    id: 'next-date-leap-year',
    name: 'Next Date Leap-Year Variant',
    language: 'javascript',
    description: 'A next-date variant that separates leap-year February handling from other month transitions.',
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
}`,
  },
  {
    id: 'calendar-days',
    name: 'Calendar Days Switch Variant',
    language: 'javascript',
    description: 'A calendar-style example using switch-case branches to classify month lengths.',
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
}`,
  },
  {
    id: 'quadrilateral-problem',
    name: 'The Quadrilateral Program',
    language: 'javascript',
    description: 'Classify a quadrilateral from four side lengths and two diagonals into square, rectangle, rhombus, parallelogram, trapezoid, or general.',
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
}`,
  },
  {
    id: 'next-week',
    name: 'Next Week',
    language: 'javascript',
    description: 'Advance a date by seven days, handling month-end and year rollover.',
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
}`,
  },
];

export const logicCoverageCriteria = [
  {
    id: 'pc',
    label: 'Predicate Coverage',
    labelZh: 'Predicate Coverage',
    description: '使整體 predicate 至少評估為 true 與 false 各一次。',
    descriptionEn: 'The predicate as a whole evaluates to true and to false at least once each.',
  },
  {
    id: 'cc',
    label: 'Clause Coverage',
    labelZh: '子句覆蓋',
    description: '每個子句皆至少各取 true 與 false 一次。',
    descriptionEn: 'Every clause takes both true and false at least once.',
  },
  {
    id: 'coc',
    label: 'Combinatorial Coverage',
    labelZh: '組合覆蓋',
    description: '列舉所有 2^n 個子句真假組合。',
    descriptionEn: 'Enumerate all 2^n true/false combinations of the clauses.',
  },
  {
    id: 'gacc',
    label: 'General Active Clause Coverage',
    labelZh: 'GACC',
    description: '對每個主子句找一對列，使該子句決定 predicate 的值。',
    descriptionEn: 'For each major clause find a pair of rows where it determines the predicate.',
  },
  {
    id: 'cacc',
    label: 'Correlated Active Clause Coverage',
    labelZh: 'CACC',
    description: '主子句決定 predicate，且兩列產生不同的 predicate 值。',
    descriptionEn: 'Major clause determines the predicate, and the two rows yield different predicate values.',
  },
  {
    id: 'racc',
    label: 'Restricted Active Clause Coverage',
    labelZh: 'RACC',
    description: '主子句決定 predicate，且兩列的次子句值完全相同。',
    descriptionEn: 'Major clause determines the predicate, and the two rows have identical minor-clause values.',
  },
  {
    id: 'gicc',
    label: 'General Inactive Clause Coverage',
    labelZh: 'GICC',
    description: '主子句不決定 predicate，覆蓋 (c=T/F)×(P=T/F) 共 4 種組合。',
    descriptionEn: 'Major clause does not determine the predicate; cover (c=T/F)×(P=T/F) — four combinations.',
  },
  {
    id: 'ricc',
    label: 'Restricted Inactive Clause Coverage',
    labelZh: 'RICC',
    description: '同 GICC，但成對列需所有次子句相同，僅主子句翻轉。',
    descriptionEn: 'Same as GICC but the paired rows keep all minor clauses identical; only the major clause flips.',
  },
  {
    id: 'ic',
    label: 'Implicant Coverage',
    labelZh: 'IC',
    description: '對 DNF 的每個 implicant，至少找到一個 true point。',
    descriptionEn: 'For every implicant of the DNF, find at least one true point.',
  },
  {
    id: 'utpc',
    label: 'Unique True Point Coverage',
    labelZh: 'UTPC',
    description: '為每個 implicant 挑一個只滿足該 implicant 的 unique true point。',
    descriptionEn: 'For every implicant pick a unique true point that satisfies only that implicant.',
  },
  {
    id: 'mutpc',
    label: 'Multiple Unique True Point Coverage',
    labelZh: 'MUTPC',
    description: '為每個 implicant 挑一組 UTPs，使每個次子句都至少出現一次 T 與一次 F。',
    descriptionEn: 'For every implicant pick a set of UTPs such that each minor clause takes both T and F.',
  },
  {
    id: 'nfpc',
    label: 'Near False Point Coverage',
    labelZh: 'NFPC',
    description: '為每個 implicant 的每個 literal 找一個翻轉後使 P 為 false 的列。',
    descriptionEn: 'For every literal of every implicant find a row that, after flipping that literal, makes P false.',
  },
  {
    id: 'mnfpc',
    label: 'Multiple Near False Point Coverage',
    labelZh: 'MNFPC',
    description: '為每個 implicant 的每個 literal 挑一組 NFPs，使每個次子句都至少出現一次 T 與一次 F。',
    descriptionEn: 'For every implicant pick a set of NFPs such that each minor clause takes both T and F.',
  },
  {
    id: 'cutpnfp',
    label: 'Corresponding UTP + NFP Pair Coverage',
    labelZh: 'CUTPNFP',
    description: '為每個 implicant 的每個 literal，挑一對僅在該 literal 不同的 UTP 與 NFP。',
    descriptionEn: 'For every literal of every implicant pick a UTP/NFP pair that differs only in that literal.',
  },
];

export const logicCoveragePredicates = [
  {
    id: 'simple-and-or',
    name: '(a && b) || c',
    expression: '(a && b) || c',
    description: '常見的混合 AND/OR predicate，三個子句。',
    descriptionEn: 'A common mixed AND/OR predicate with three clauses.',
  },
  {
    id: 'guarded-exit',
    name: 'a && (b || !c)',
    expression: 'a && (b || !c)',
    description: '帶有否定子句的守衛條件。',
    descriptionEn: 'A guarded condition that includes a negated clause.',
  },
  {
    id: 'four-clause',
    name: '(a || b) && (c || d)',
    expression: '(a || b) && (c || d)',
    description: '四個子句的乘積式 predicate，常見於範圍檢查。',
    descriptionEn: 'A four-clause product predicate, common in range checks.',
  },
];

export const symbolicExecutionExamples = [
  {
    id: 'triangle',
    name: 'Triangle classifier',
    nameEn: 'Triangle classifier',
    description: '經典三角形分類：回傳 0 (非三角形)、1 (一般)、2 (等腰)、3 (等邊)。',
    descriptionEn: 'Classic triangle classifier: returns 0 (none), 1 (scalene), 2 (isosceles), 3 (equilateral).',
    sourceCode: `function classify(a, b, c) {
  if (a <= 0 || b <= 0 || c <= 0) return 0;
  if (a + b <= c || a + c <= b || b + c <= a) return 0;
  if (a == b && b == c) return 3;
  if (a == b || b == c || a == c) return 2;
  return 1;
}
`,
  },
  {
    id: 'max3',
    name: 'Max of three',
    nameEn: 'Max of three',
    description: '回傳 a, b, c 三者最大值；經典分支結構示範。',
    descriptionEn: 'Return the maximum of three integers — a canonical branching example.',
    sourceCode: `function max3(a, b, c) {
  let m = a;
  if (b > m) m = b;
  if (c > m) m = c;
  return m;
}
`,
  },
  {
    id: 'abs',
    name: 'Absolute value',
    nameEn: 'Absolute value',
    description: '只有兩條路徑的最小範例：x >= 0 與 x < 0。',
    descriptionEn: 'A minimal two-path example: x >= 0 versus x < 0.',
    sourceCode: `function abs(x) {
  if (x < 0) return -x;
  return x;
}
`,
  },
  {
    id: 'gcd',
    name: 'GCD (bounded)',
    nameEn: 'GCD (bounded)',
    description: '歐幾里得演算法，含 while 迴圈；以最大展開次數模擬有界路徑列舉。',
    descriptionEn: 'Euclidean algorithm with a while loop — bounded unrolling enumerates the first paths.',
    sourceCode: `function gcd(a, b) {
  while (b != 0) {
    let t = b;
    b = a % b;
    a = t;
  }
  return a;
}
`,
  },
];

export const concolicExecutionExamples = [
  {
    id: 'triangle',
    name: 'Triangle classifier',
    nameEn: 'Triangle classifier',
    description: '從 (1,1,1) 等邊三角形種子出發，每次翻轉最後一個未探索的分支，自動產生新輸入。',
    descriptionEn: 'Seeded with the equilateral triangle (1,1,1); each step flips the last unexplored branch to derive a new input.',
    seed: 'a=1, b=1, c=1',
    sourceCode: `function classify(a, b, c) {
  if (a <= 0 || b <= 0 || c <= 0) return 0;
  if (a + b <= c || a + c <= b || b + c <= a) return 0;
  if (a == b && b == c) return 3;
  if (a == b || b == c || a == c) return 2;
  return 1;
}
`,
  },
  {
    id: 'abs',
    name: 'Absolute value',
    nameEn: 'Absolute value',
    description: '最小範例：從 x=0 出發，concolic 走完一條路徑後翻轉條件得到 x<0 的對偶輸入。',
    descriptionEn: 'Minimal example: starting from x=0, concolic flips the branch to discover the x<0 dual input.',
    seed: 'x=0',
    sourceCode: `function abs(x) {
  if (x < 0) return -x;
  return x;
}
`,
  },
  {
    id: 'max3',
    name: 'Max of three',
    nameEn: 'Max of three',
    description: '示範雙分支結構：每條路徑對應 (b>a, c>m) 兩個分支的真假組合。',
    descriptionEn: 'Demonstrates a two-branch structure: each path corresponds to a (b>a, c>m) truth combination.',
    seed: 'a=0, b=0, c=0',
    sourceCode: `function max3(a, b, c) {
  let m = a;
  if (b > m) m = b;
  if (c > m) m = c;
  return m;
}
`,
  },
  {
    id: 'middle',
    name: 'Middle value',
    nameEn: 'Middle value',
    description: '經典 DART 測試對象（Khurshid et al.）：回傳三數的中位數。',
    descriptionEn: 'A classic DART benchmark (Khurshid et al.): returns the median of three integers.',
    seed: 'a=0, b=0, c=0',
    sourceCode: `function middle(a, b, c) {
  let m = c;
  if (b < c) {
    if (a < b) m = b;
    else if (a < c) m = a;
  } else {
    if (a > b) m = b;
    else if (a > c) m = a;
  }
  return m;
}
`,
  },
];


