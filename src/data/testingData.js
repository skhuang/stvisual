export const testingMethods = [
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
      { id: 'lc', name: '邏輯覆蓋', nameEn: 'Logic Coverage', description: '以述詞與子句為核心的覆蓋策略，包含 PC、CC、ACC 系列' },
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

export const testingFlow = [
  { id: 'req',      label: '需求分析', labelEn: 'Requirements', icon: '📋', description: '分析軟體需求，確定測試目標與範圍' },
  { id: 'plan',     label: '測試計劃', labelEn: 'Test Plan',     icon: '📝', description: '制定測試策略、資源分配與進度計劃' },
  { id: 'design',   label: '測試設計', labelEn: 'Test Design',   icon: '✏️', description: '設計測試用例、腳本與測試數據' },
  { id: 'exec',     label: '測試執行', labelEn: 'Execution',     icon: '▶️', description: '執行測試用例，記錄實際與預期結果' },
  { id: 'analysis', label: '結果分析', labelEn: 'Analysis',      icon: '🔍', description: '比較結果，識別缺陷並評估測試覆蓋率' },
  { id: 'report',   label: '缺陷報告', labelEn: 'Defect Report', icon: '📊', description: '撰寫測試報告，追蹤缺陷修復狀態' },
];

export const testingTypes = [
  { id: 'unit',        type: '單元測試',  typeEn: 'Unit Testing',        purpose: '測試最小單位',  timing: '開發階段',  color: '#3498db', width: 30 },
  { id: 'integration', type: '集成測試',  typeEn: 'Integration Testing', purpose: '測試模組組合',  timing: '開發後期',  color: '#27ae60', width: 55 },
  { id: 'system',      type: '系統測試',  typeEn: 'System Testing',      purpose: '測試整體系統',  timing: '集成完成後', color: '#f39c12', width: 80 },
  { id: 'acceptance',  type: '驗收測試',  typeEn: 'Acceptance Testing',  purpose: '驗證需求達成',  timing: '部署前',    color: '#e74c3c', width: 100 },
];

export const graphCoverageCriteria = [
  {
    id: 'node',
    label: 'Node Coverage',
    labelZh: '節點覆蓋',
    description: '每個節點至少被一個測試路徑拜訪一次。',
  },
  {
    id: 'edge',
    label: 'Edge Coverage',
    labelZh: '邊覆蓋',
    description: '每條有向邊至少被一個測試路徑經過一次。',
  },
  {
    id: 'prime-path',
    label: 'Prime Path Coverage',
    labelZh: 'Prime Path 覆蓋',
    description: '所有 prime path 都必須被測試需求涵蓋，包含迴圈。',
  },
  {
    id: 'edge-pair',
    label: 'Edge-Pair Coverage',
    labelZh: '邊對覆蓋',
    description: '每一組相鄰的兩條邊都要至少被一條測試路徑覆蓋。',
  },
  {
    id: 'complete-path',
    label: 'Complete Path Coverage',
    labelZh: '完整路徑覆蓋',
    description: '以有限深度列舉 start 到 end 的完整可行路徑集合。',
  },
];

export const graphCoverageCodeLanguages = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'pseudocode', label: 'Pseudo Code' },
];

export const graphCoverageGraph = {
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
];

export const logicCoverageCriteria = [
  {
    id: 'pc',
    label: 'Predicate Coverage',
    labelZh: 'Predicate Coverage',
    description: '使整體 predicate 至少評估為 true 與 false 各一次。',
  },
  {
    id: 'cc',
    label: 'Clause Coverage',
    labelZh: '子句覆蓋',
    description: '每個子句皆至少各取 true 與 false 一次。',
  },
  {
    id: 'coc',
    label: 'Combinatorial Coverage',
    labelZh: '組合覆蓋',
    description: '列舉所有 2^n 個子句真假組合。',
  },
  {
    id: 'gacc',
    label: 'General Active Clause Coverage',
    labelZh: 'GACC',
    description: '對每個主子句找一對列，使該子句決定 predicate 的值。',
  },
  {
    id: 'cacc',
    label: 'Correlated Active Clause Coverage',
    labelZh: 'CACC',
    description: '主子句決定 predicate，且兩列產生不同的 predicate 值。',
  },
  {
    id: 'racc',
    label: 'Restricted Active Clause Coverage',
    labelZh: 'RACC',
    description: '主子句決定 predicate，且兩列的次子句值完全相同。',
  },
  {
    id: 'gicc',
    label: 'General Inactive Clause Coverage',
    labelZh: 'GICC',
    description: '主子句不決定 predicate，覆蓋 (c=T/F)×(P=T/F) 共 4 種組合。',
  },
  {
    id: 'ricc',
    label: 'Restricted Inactive Clause Coverage',
    labelZh: 'RICC',
    description: '同 GICC，但成對列需所有次子句相同，僅主子句翻轉。',
  },
];

export const logicCoveragePredicates = [
  {
    id: 'simple-and-or',
    name: '(a && b) || c',
    expression: '(a && b) || c',
    description: '常見的混合 AND/OR predicate，三個子句。',
  },
  {
    id: 'guarded-exit',
    name: 'a && (b || !c)',
    expression: 'a && (b || !c)',
    description: '帶有否定子句的守衛條件。',
  },
  {
    id: 'four-clause',
    name: '(a || b) && (c || d)',
    expression: '(a || b) && (c || d)',
    description: '四個子句的乘積式 predicate，常見於範圍檢查。',
  },
];
