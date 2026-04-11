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
