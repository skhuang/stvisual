# 軟體測試視覺化 — 課程簡報目錄

stvisual 課程共 **57 講**，每講皆有：
- **觀念**：定義 + subsumption / 演算法總覽
- **範例**：手算示範 + 教科書引用
- **工具演示**：對應的 explorer、互動步驟（截圖）
- **小結 + 課堂練習**
- **延伸閱讀**：對應規格章節與原始碼

所有簡報為 Marp Markdown，可一鍵轉 PPTX。簡報亦可直接在 app 內檢視：每個 section 標題下都有「📊 課程簡報」按鈕。截圖由 [scripts/capture-slide-screenshots.mjs](../../scripts/capture-slide-screenshots.mjs) 統一產生。

> #1–#13 由原始課程建立；#14–#57 為 slide-completion 計畫（Waves A–G）補齊，涵蓋全部 54 個 explorer。截圖補強仍在分批進行中。

---

## 課程目錄

### 基礎（Foundations）

| # | 主題 | ZH | EN |
| --- | --- | --- | --- |
| 1 | 課程概觀 & 測試方法分類 | [01-course-intro.zh-TW.md](01-course-intro.zh-TW.md) | [01-course-intro.en.md](01-course-intro.en.md) |
| 2 | 測試流程 & 測試金字塔 | [02-testing-flow-pyramid.zh-TW.md](02-testing-flow-pyramid.zh-TW.md) | [02-testing-flow-pyramid.en.md](02-testing-flow-pyramid.en.md) |
| 14 | 缺陷的延遲成本 | [14-defect-cost.zh-TW.md](14-defect-cost.zh-TW.md) | [14-defect-cost.en.md](14-defect-cost.en.md) |
| 15 | V 模型 | [15-v-model.zh-TW.md](15-v-model.zh-TW.md) | [15-v-model.en.md](15-v-model.en.md) |
| 16 | 測試層級與類型 | [16-testing-types.zh-TW.md](16-testing-types.zh-TW.md) | [16-testing-types.en.md](16-testing-types.en.md) |
| 17 | 測試自動化金字塔 | [17-test-pyramid.zh-TW.md](17-test-pyramid.zh-TW.md) | [17-test-pyramid.en.md](17-test-pyramid.en.md) |

### 覆蓋準則（Coverage Criteria）

| # | 主題 | ZH | EN |
| --- | --- | --- | --- |
| 3 | Graph Coverage（結構性） | [03-graph-coverage.zh-TW.md](03-graph-coverage.zh-TW.md) | [03-graph-coverage.en.md](03-graph-coverage.en.md) |
| 4 | Data Flow Coverage | [04-data-flow-coverage.zh-TW.md](04-data-flow-coverage.zh-TW.md) | [04-data-flow-coverage.en.md](04-data-flow-coverage.en.md) |
| 5 | Logic Coverage（14 準則） | [05-logic-coverage.zh-TW.md](05-logic-coverage.zh-TW.md) | [05-logic-coverage.en.md](05-logic-coverage.en.md) |
| 18 | 程式碼覆蓋準則 | [18-code-coverage.zh-TW.md](18-code-coverage.zh-TW.md) | [18-code-coverage.en.md](18-code-coverage.en.md) |
| 28 | 群論與測試對稱性 | [28-group-theory.zh-TW.md](28-group-theory.zh-TW.md) | [28-group-theory.en.md](28-group-theory.en.md) |

### 突變與規格（Mutation & Specification）

| # | 主題 | ZH | EN |
| --- | --- | --- | --- |
| 6 | Program Mutation（15 operators） | [06-program-mutation.zh-TW.md](06-program-mutation.zh-TW.md) | [06-program-mutation.en.md](06-program-mutation.en.md) |
| 7 | Grammar + String Mutation | [07-grammar-and-string-mutation.zh-TW.md](07-grammar-and-string-mutation.zh-TW.md) | [07-grammar-and-string-mutation.en.md](07-grammar-and-string-mutation.en.md) |
| 8 | Specification Mutation + SMV + Safety Monitor FSM | [08-spec-mutation.zh-TW.md](08-spec-mutation.zh-TW.md) | [08-spec-mutation.en.md](08-spec-mutation.en.md) |

### 執行式測試與測試生成（Execution & Test Generation）

| # | 主題 | ZH | EN |
| --- | --- | --- | --- |
| 9 | Fuzz Testing | [09-fuzz-testing.zh-TW.md](09-fuzz-testing.zh-TW.md) | [09-fuzz-testing.en.md](09-fuzz-testing.en.md) |
| 10 | Symbolic Execution | [10-symbolic-execution.zh-TW.md](10-symbolic-execution.zh-TW.md) | [10-symbolic-execution.en.md](10-symbolic-execution.en.md) |
| 11 | Concolic Execution | [11-concolic-execution.zh-TW.md](11-concolic-execution.zh-TW.md) | [11-concolic-execution.en.md](11-concolic-execution.en.md) |
| 12 | Test Generation from Coverage | [12-test-generation.zh-TW.md](12-test-generation.zh-TW.md) | [12-test-generation.en.md](12-test-generation.en.md) |
| 13 | Logic Coverage Binding | [13-logic-binding.zh-TW.md](13-logic-binding.zh-TW.md) | [13-logic-binding.en.md](13-logic-binding.en.md) |
| 29 | 性質導向測試 | [29-property-based.zh-TW.md](29-property-based.zh-TW.md) | [29-property-based.en.md](29-property-based.en.md) |
| 30 | 整合測試 | [30-integration-testing.zh-TW.md](30-integration-testing.zh-TW.md) | [30-integration-testing.en.md](30-integration-testing.en.md) |

### 黑箱測試設計（Black-Box Test Design）

| # | 主題 | ZH | EN |
| --- | --- | --- | --- |
| 19 | 邊界值分析 | [19-boundary-value.zh-TW.md](19-boundary-value.zh-TW.md) | [19-boundary-value.en.md](19-boundary-value.en.md) |
| 20 | 等價類分割 | [20-equivalence-partitioning.zh-TW.md](20-equivalence-partitioning.zh-TW.md) | [20-equivalence-partitioning.en.md](20-equivalence-partitioning.en.md) |
| 21 | 決策表測試 | [21-decision-table.zh-TW.md](21-decision-table.zh-TW.md) | [21-decision-table.en.md](21-decision-table.en.md) |
| 22 | 狀態遷移測試 | [22-state-transition.zh-TW.md](22-state-transition.zh-TW.md) | [22-state-transition.en.md](22-state-transition.en.md) |
| 23 | 成對測試 | [23-pairwise.zh-TW.md](23-pairwise.zh-TW.md) | [23-pairwise.en.md](23-pairwise.en.md) |
| 24 | 因果圖 | [24-cause-effect.zh-TW.md](24-cause-effect.zh-TW.md) | [24-cause-effect.en.md](24-cause-effect.en.md) |
| 25 | 蛻變測試 | [25-metamorphic.zh-TW.md](25-metamorphic.zh-TW.md) | [25-metamorphic.en.md](25-metamorphic.en.md) |
| 26 | 探索式測試 | [26-exploratory.zh-TW.md](26-exploratory.zh-TW.md) | [26-exploratory.en.md](26-exploratory.en.md) |
| 27 | 測試替身 | [27-test-doubles.zh-TW.md](27-test-doubles.zh-TW.md) | [27-test-doubles.en.md](27-test-doubles.en.md) |
| 31 | 風險導向測試 | [31-risk-based.zh-TW.md](31-risk-based.zh-TW.md) | [31-risk-based.en.md](31-risk-based.en.md) |

### AI 輔助 / 進階測試（Advanced）

| # | 主題 | ZH | EN |
| --- | --- | --- | --- |
| 32 | 等價突變體問題 | [32-equivalent-mutants.zh-TW.md](32-equivalent-mutants.zh-TW.md) | [32-equivalent-mutants.en.md](32-equivalent-mutants.en.md) |
| 33 | 突變分數 | [33-mutation-score.zh-TW.md](33-mutation-score.zh-TW.md) | [33-mutation-score.en.md](33-mutation-score.en.md) |
| 34 | LLM 測試生成管線 | [34-llm-test-pipeline.zh-TW.md](34-llm-test-pipeline.zh-TW.md) | [34-llm-test-pipeline.en.md](34-llm-test-pipeline.en.md) |
| 35 | 測試品質閘門 | [35-test-quality-gates.zh-TW.md](35-test-quality-gates.zh-TW.md) | [35-test-quality-gates.en.md](35-test-quality-gates.en.md) |
| 36 | 缺陷導向測試生成 | [36-fault-directed-testing.zh-TW.md](36-fault-directed-testing.zh-TW.md) | [36-fault-directed-testing.en.md](36-fault-directed-testing.en.md) |
| 37 | SAILOR — 引導式符號執行 | [37-sailor-vulnerability.zh-TW.md](37-sailor-vulnerability.zh-TW.md) | [37-sailor-vulnerability.en.md](37-sailor-vulnerability.en.md) |

### 驗收與 E2E（Acceptance & E2E）

| # | 主題 | ZH | EN |
| --- | --- | --- | --- |
| 38 | BDD 與 Gherkin | [38-bdd-gherkin.zh-TW.md](38-bdd-gherkin.zh-TW.md) | [38-bdd-gherkin.en.md](38-bdd-gherkin.en.md) |
| 39 | 用例測試衍生 | [39-use-case-derivation.zh-TW.md](39-use-case-derivation.zh-TW.md) | [39-use-case-derivation.en.md](39-use-case-derivation.en.md) |
| 40 | E2E 使用者旅程 | [40-e2e-user-journey.zh-TW.md](40-e2e-user-journey.zh-TW.md) | [40-e2e-user-journey.en.md](40-e2e-user-journey.en.md) |
| 41 | 契約測試 | [41-contract-testing.zh-TW.md](41-contract-testing.zh-TW.md) | [41-contract-testing.en.md](41-contract-testing.en.md) |
| 42 | 效能與負載測試 | [42-performance-load.zh-TW.md](42-performance-load.zh-TW.md) | [42-performance-load.en.md](42-performance-load.en.md) |
| 43 | 混沌工程 | [43-chaos-engineering.zh-TW.md](43-chaos-engineering.zh-TW.md) | [43-chaos-engineering.en.md](43-chaos-engineering.en.md) |
| 44 | ATDD 循環 | [44-atdd-cycle.zh-TW.md](44-atdd-cycle.zh-TW.md) | [44-atdd-cycle.en.md](44-atdd-cycle.en.md) |
| 45 | Flaky 測試診斷 | [45-flaky-diagnosis.zh-TW.md](45-flaky-diagnosis.zh-TW.md) | [45-flaky-diagnosis.en.md](45-flaky-diagnosis.en.md) |

### 模型驅動測試（Model-Based Testing）

| # | 主題 | ZH | EN |
| --- | --- | --- | --- |
| 46 | MBT 工作流程 | [46-mbt-workflow.zh-TW.md](46-mbt-workflow.zh-TW.md) | [46-mbt-workflow.en.md](46-mbt-workflow.en.md) |
| 47 | FSM 測試生成 | [47-fsm-test-generation.zh-TW.md](47-fsm-test-generation.zh-TW.md) | [47-fsm-test-generation.en.md](47-fsm-test-generation.en.md) |
| 48 | W 方法 | [48-w-method.zh-TW.md](48-w-method.zh-TW.md) | [48-w-method.en.md](48-w-method.en.md) |
| 49 | EFSM 與守衛轉移 | [49-efsm-guarded-transition.zh-TW.md](49-efsm-guarded-transition.zh-TW.md) | [49-efsm-guarded-transition.en.md](49-efsm-guarded-transition.en.md) |
| 50 | 使用模型統計測試 | [50-usage-model-statistical.zh-TW.md](50-usage-model-statistical.zh-TW.md) | [50-usage-model-statistical.en.md](50-usage-model-statistical.en.md) |
| 51 | 模型突變 | [51-model-mutation.zh-TW.md](51-model-mutation.zh-TW.md) | [51-model-mutation.en.md](51-model-mutation.en.md) |

### 敏捷測試（Agile Testing）

| # | 主題 | ZH | EN |
| --- | --- | --- | --- |
| 52 | 敏捷測試象限 | [52-agile-quadrants.zh-TW.md](52-agile-quadrants.zh-TW.md) | [52-agile-quadrants.en.md](52-agile-quadrants.en.md) |
| 53 | 衝刺測試節奏 | [53-sprint-cadence.zh-TW.md](53-sprint-cadence.zh-TW.md) | [53-sprint-cadence.en.md](53-sprint-cadence.en.md) |
| 54 | 就緒／完成準則 | [54-definition-gates.zh-TW.md](54-definition-gates.zh-TW.md) | [54-definition-gates.en.md](54-definition-gates.en.md) |
| 55 | 三方會談與範例映射 | [55-example-mapping.zh-TW.md](55-example-mapping.zh-TW.md) | [55-example-mapping.en.md](55-example-mapping.en.md) |
| 56 | 持續測試管線 | [56-continuous-testing.zh-TW.md](56-continuous-testing.zh-TW.md) | [56-continuous-testing.en.md](56-continuous-testing.en.md) |
| 57 | 回歸與測試債 | [57-regression-debt.zh-TW.md](57-regression-debt.zh-TW.md) | [57-regression-debt.en.md](57-regression-debt.en.md) |

---

## 操作指南

### 在 app 內檢視

每個 section 的標題下有「📊 課程簡報」按鈕，開啟全螢幕簡報檢視器（上一張／下一張、←/→ 鍵、講者備註切換、Esc 關閉）。語言依當前 locale 自動選 zh-TW / en。

### 轉 PPTX（單份）

```bash
npx -y @marp-team/marp-cli docs/slides/03-graph-coverage.zh-TW.md --pptx
```

### 批次轉所有簡報

```bash
for f in docs/slides/*-*.md; do
  npx -y @marp-team/marp-cli "$f" --pptx
done
```

> 排除 `index.*.md` 是因為它不是 Marp 簡報。

### 重新擷取截圖

```bash
node scripts/capture-slide-screenshots.mjs
```

腳本會偵測 `http://127.0.0.1:4173`、把 locale pin 成 `zh`、依序走訪 explorer 區塊並把對應 testid 截到 [docs/assets/slides/](../assets/slides/)。

### 重新產生 app 內簡報資料

```bash
npm run build:slide-decks
```

把 `docs/slides/*.md` 烤進 `src/data/slideDecks.generated.js`，供 app 內檢視器使用。

---

## 完整規格

[docs/Specification.zh-TW.md](../Specification.zh-TW.md)。
