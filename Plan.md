# stvisual — 改善建議與路線圖

> 最後更新：2026-05-14（I1–I5 AI 輔助測試 Explorer 全數完成；新增 Advanced Testing 分頁；新增 J 節 系統 / E2E / 驗收測試路線圖）

---

## 現況（已完成功能）

### 互動式 Explorer（30 個 + 5 個 Advanced Testing）

| Explorer | 主要功能 | Quiz |
|----------|----------|------|
| TestingMethodTree | 測試方法分類樹狀圖 | — |
| TestingFlow + TestingTypesTable | 測試流程 & 測試金字塔 | — |
| GraphCoverageExplorer | CFG 建構、Node/Edge/Prime-path 準則、DFG 資料流準則 | ✓ |
| LogicCoverageExplorer | 14 項 Logic Coverage 準則、K-map、clause binding | ✓ |
| SyntaxCoverageExplorer | Program Mutation（6 operators）、Grammar Mutation | ✓ |
| SpecMutationExplorer | FSM Safety Monitor、SMV-style 規格突變 | — |
| FuzzTestingExplorer | mutation-based fuzzing + CFG 覆蓋熱度圖 | ✓ |
| SymbolicExecutionExplorer | 符號執行路徑樹 + CFG 映射 + 縮放 | ✓ |
| ConcolicExecutionExplorer | DART/CUTE-style concolic + CFG 映射 + 縮放 | ✓ |
| TestGenerationExplorer | 從 Graph / DFG 準則自動產生具體測試輸入 + JS 匯出 | — |
| CloudStoragePanel | Firebase / Google Drive 雲端同步；班級代碼輸入、結果自動上傳 | — |
| TeacherDashboard | 全班成績儀表板（Firestore 載入）、學生列表、Explorer 篩選 | — |
| BoundaryValueExplorer | 5-point BVA + Robustness BVA、多參數 | ✓ |
| EquivalenceClassExplorer | WECT / SECT、分割條件編輯器 | ✓ |
| DecisionTableExplorer | 條件/動作矩陣、T/F/– 儲存格、覆蓋率徽章 | ✓ |
| StateTransitionExplorer | SVG 狀態圖、轉移覆蓋 + BFS 序列覆蓋 | ✓ |
| MetamorphicTestingExplorer | 5 個程式 × 2–3 個 MR、產生 8 對測試、通過/失敗表 | ✓ |
| ExploratoryTestingExplorer | 任務書、SFDIPOT 清單、HICCUPPS 參考、計時器、觀察日誌 | — |
| TestDoublesExplorer | Dummy/Stub/Fake/Mock/Spy、2 個可執行情境/類型、呼叫記錄 | ✓ |
| PairwiseExplorer | IPO greedy 演算法、覆蓋矩陣視覺化、vs 全配對比較 | ✓ |
| CauseEffectExplorer | 因果圖（SVG）、AND/OR/NOT 連接、自動推導決策表 | ✓ |
| CodeCoverageExplorer | Statement/Branch/Condition/MC-DC 覆蓋、逐行高亮 | ✓ |
| IntegrationTestingExplorer | Big Bang/Top-down/Bottom-up/Sandwich 動畫、Stub/Driver 計數 | ✓ |
| PropertyBasedTestingExplorer | QuickCheck-style、隨機生成器、Shrinking、反例視覺化 | ✓ |
| RiskBasedTestingExplorer | 風險矩陣熱圖、模組優先排序、Lab Metric | ✓ |
| GroupTheoryExplorer | Orbit Explorer（Tab 1）、CACC Bridge（Tab 2）、Covering Array（Tab 3）；理論橋接 Logic & MT | ✓ |
| **Advanced Testing 分頁** | 基於 arXiv 2501.12862（FSE 2025 / Meta ACH）— I1–I5 五個進階 Explorer | — |
| ↳ EquivalentMutantExplorer (I1) | 等效突變體偵測：三階段前處理（syntactic / strip-comments / LLM-as-judge）+ 8 對題庫 | ✓ |
| ↳ MutationScoreExplorer (I2) | 突變分數 vs 行覆蓋率雙儀表板；49% kill-no-cov 反直覺示範 | ✓ |
| ↳ LLMPipelineExplorer (I3) | 三 Agent 流程（Mutation/Equivalence/Test）；ACH vs TestGen-LLM ~6× 對比 | ✓ |
| ↳ TestQualityExplorer (I4) | 五品質維度（Buildable/Non-flaky/Hardening/Relevant/Style）× 6 情境 | ✓ |
| ↳ FaultDirectedTestingExplorer (I5) | Blind coverage-driven vs Fault-directed 突變對比、4 issue 情境 | ✓ |
| 全站 i18n | ZH-TW / EN 切換 | — |

### 投影片（13 講，雙語，含 speaker notes）

01 課程概觀、02 測試流程、03 Graph Coverage、04 Data Flow、05 Logic Coverage、
06 Program Mutation、07 Grammar & String、08 Spec Mutation、09 Fuzz Testing、
10 Symbolic Execution、11 Concolic Execution、12 Test Generation、13 Logic Binding

### 測試

- 475 個 unit tests（Vitest + jsdom），42 個測試檔案
- Playwright E2E：GraphCoverage、LogicCoverage、SyntaxCoverage、TestingFlow 等

### CI / 佈署

- GitHub Actions：Node.js 24、兩個 workflow（`test.yml` + `deploy-pages.yml`）
- GitHub Pages 自動部署：push to main → test → inject-env → build:standalone → site/

---

## 待辦事項

### D1. 為所有尚未有 Quiz 模式的 Explorer 增加 self-test（已完成 2026-05-12）

| PR | Explorer | 出題形式 | 完成日 |
|----|----------|---------|--------|
| #120 | LogicCoverageExplorer | 給定謂詞+準則，輸入不重複測試案例數 | 2026-05-12 |
| #120 | DecisionTableExplorer | 輸入已覆蓋規則數 + 重複規則數 | 2026-05-12 |
| #120 | StateTransitionExplorer | 輸入目前覆蓋模式所需測試數 | 2026-05-12 |
| #122 | SyntaxCoverageExplorer | 輸入測試套件可殺死的突變體數 | 2026-05-12 |
| #122 | MetamorphicTestingExplorer | 輸入 8 對測試中成立的對數（自動生成） | 2026-05-12 |
| #122 | TestDoublesExplorer | 多選題：選出最適合的替身類型 | 2026-05-12 |
| #124 | SymbolicExecutionExplorer | 輸入可行路徑數 | 2026-05-12 |
| #124 | ConcolicExecutionExplorer | 輸入不重複路徑數 | 2026-05-12 |
| #124 | FuzzTestingExplorer | 輸入節點覆蓋率 % | 2026-05-12 |

不適合 quiz（工具型）：TestingMethodTree、TestingFlow、TestingTypesTable、
ExploratoryTestingExplorer、CloudStoragePanel。

---

### E. Testing Flow 新增視覺化功能（已完成 2026-05-13）

| PR | 功能 | 說明 | 完成日 |
|----|------|------|--------|
| #126 | E1 — DefectCostExplorer | 6 階段缺陷修復成本曲線；hover/click 顯示倍數、技術建議 | 2026-05-13 |
| #128 | E2 — VModelExplorer | 互動式 V-model；點擊開發階段高亮對應測試階段 | 2026-05-13 |
| #130 | E3 — PyramidAdjusterExplorer | 三滑桿金字塔比例調整器；速度/維護/信心衍生指標 | 2026-05-13 |

---

### F. Google Classroom 整合 + Self-Test 強化（進行中）

#### 背景與目標

讓老師可以透過 Google Classroom 出作業，學生在工具中完成 **Quiz 模式**（有正確答案、自動批改）或 **Lab 模式**（互動探索 + 反思問題 / 量化指標），再將成績回報給老師。

#### Self-Test 模式定義

| 模式 | 說明 | 批改方式 |
|------|------|---------|
| **Quiz** | 給定場景，輸入正確答案（數字、選擇題） | 自動批改，有確定正解 |
| **Lab — Reflection** | 探索互動後回答 2–3 個反思問題（開放式文字） | 榮譽制，老師閱覽 |
| **Lab — Metric** | 達成量化指標（如覆蓋率 ≥ 80%、消滅突變體 ≥ N 個） | 自動判定通過/未通過 |

---

#### F-A — Phase A：純前端成績匯出（進行中）

**目標**：不需後端，學生完成 quiz/lab → 產生可分享的結果連結 → 貼到 Classroom 作業留言 → 老師點連結驗證。

**元件**

- `src/utils/resultExporter.js` — 將答題記錄序列化為 Base64 URL 參數
- `src/components/ResultViewer.js` + CSS — 讀取 URL `?result=` 參數，呈現唯讀成績單
- 各 Explorer quiz panel 加「📋 分享成績」按鈕（複製連結到剪貼板）
- Lab — Reflection：在數個 Explorer 加「反思問題」（open-ended 文字輸入），同樣可匯出
- Lab — Metric：在支援量化指標的 Explorer（Graph/Syntax/Fuzz 等）加「達標紀錄」匯出

**URL 格式**（無後端簽章，榮譽制）

```
https://site/?result=<base64(JSON)>
JSON = { v:1, explorer, mode:"quiz"|"lab-reflect"|"lab-metric",
         ts, lang, items:[{q,a,correct?,score?}], total, passed? }
```

**限制**：純榮譽制，學生可自行修改連結；Phase B 才加簽章與身份驗證。

**子任務**（全部完成 2026-05-13，PR #133 / #135）

- [x] F-A1：`resultExporter.js` + `ResultViewer` 元件 + i18n + 測試（#133）
- [x] F-A2：所有現有 Quiz Explorer 加「分享成績」按鈕（#133）
- [x] F-A3：Lab — Reflection：為 Graph / Logic / Fuzz / Symbex 加反思問題 + 匯出（#135）
- [x] F-A4：Lab — Metric：Graph（覆蓋率）、Syntax（殺死突變體 %）、Fuzz（節點覆蓋 %）加達標匯出（#135）
- [x] F-A5：`ResultViewer` 整合進 app 首頁（URL 有 `?result=` 時自動彈出）（#133）

---

#### F-B — Phase B：Firebase Auth + Firestore 成績儀表板（已完成 2026-05-14）

**目標**：Google Sign-In（Firebase Auth）+ Firestore 存分數；老師 dashboard 頁面看全班成績。Classroom 作業仍手動建（連結到工具特定 section），但成績追蹤自動化。

**架構決策**：不需 Firebase Functions — Firestore 直接寫入 + Security Rules 即可；省去冷啟動費用與 CI 複雜度。

**子任務**

| PR | 功能 | 完成日 |
|----|------|--------|
| #162 | F-B1：`cloudIntegration.js` 新增 `saveResult` / `loadCourseResults`；Firestore schema `courses/{classCode}/results/{uid}_{ts}`；`firestore.rules` | 2026-05-14 |
| #164 | F-B2：`CloudStoragePanel` 班級代碼輸入（localStorage 持久化）、Upload Count 徽章、document-level `[data-share-payload]` 自動攔截上傳 | 2026-05-14 |
| #166 | F-B3：`TeacherDashboard` 元件；全班成績表格（學生/Explorer/分數/時間）；Explorer 篩選；Summary 徽章；`stvisual:open-teacher-dashboard` 事件整合 | 2026-05-14 |

**Firestore 資料結構**
```
courses/{classCode}/results/{uid}_{ts}
  uid, displayName, email, explorer, explorerLabel,
  mode, score, total, ts, lang, items[], savedAt
```

**Security Rules**：學生只能寫入自己的 uid 記錄；任何已登入用戶可讀（老師查詢全班）；禁止更新與刪除。

---

#### F-C — Phase C：完整 Google Classroom API 整合（待規劃）

**目標**：老師在工具內一鍵建 Classroom 作業，學生完成後成績自動回寫 Classroom。

**需要新增**
- Firebase Functions 作 Classroom API OAuth proxy（避免 client secret 暴露）
- Classroom API scopes：`classroom.coursework.students`、`classroom.rosters.readonly`
- 作業類型：
  - Quiz → Google Forms（FormItems API）或 Classroom Link 作業
  - Lab-Reflect → Classroom 附件（學生填寫後提交）
  - Lab-Metric → Classroom Link + 工具端自動 POST 成績
- Google OAuth App 審查（需提交至 Google Cloud Console，審核約 1–4 週）

**前置條件**：F-B 完成；Google Cloud 專案已申請 Classroom API 存取

---

### D2. 關閉已完成的 GitHub Issues（已執行 2026-05-13）

下列 issue 的對應 PR 均已 merge，已手動關閉：

| Issue | 說明 | 關閉時間 |
|-------|------|---------|
| #97 | Logic Binding 投影片 | 2026-05-13 |
| #99 | JSDOM smoke tests | 2026-05-13 |
| #101 | Download-as-JS 匯出 | 2026-05-13 |
| #103 | Analytic interval solver | 2026-05-13 |
| #111 | BVA + EC explorers | 2026-05-13 |
| #113 | Quiz 模式 | 2026-05-13 |
| #115 | Decision Table + State Transition | 2026-05-13 |

目前無開放 issue。

---

### D3. CI 升級 Node.js 20 → 24（已執行 2026-05-13）

GitHub 警告 Node.js 20 將不再被支援；已更新兩個 workflow：

- `.github/workflows/test.yml` — `node-version: 24`
- `.github/workflows/deploy-pages.yml` — `node-version: 24`
- `README.md` — 文件同步更新

**待確認**：push 後觀察 CI 是否全數通過（Vite / esbuild / Playwright 與 Node.js 24 相容性）。

---

## G. 新測試方法 Explorer（全部完成 2026-05-13/14）

| PR | Explorer | 主要功能 | 完成日 |
|----|----------|---------|--------|
| #137 | G1 — PairwiseExplorer | IPO greedy 演算法、覆蓋矩陣視覺化、vs 全配對比較、Quiz | 2026-05-13 |
| #139 | G2 — CauseEffectExplorer | 因果圖（SVG）、AND/OR/NOT 連接、自動推導決策表、Quiz | 2026-05-13 |
| #141 | G3 — CodeCoverageExplorer | Statement/Branch/Condition/MC-DC 覆蓋、逐行高亮、Quiz + Lab Reflect | 2026-05-13 |
| #143 | G4 — IntegrationTestingExplorer | Big Bang/Top-down/Bottom-up/Sandwich 動畫、Stub/Driver 計數、Quiz | 2026-05-13 |
| #145 | G5 — PropertyBasedTestingExplorer | QuickCheck-style、隨機生成器、Shrinking、反例視覺化、Lab Reflect | 2026-05-13 |
| #147 | G6 — RiskBasedTestingExplorer | 風險矩陣熱圖、模組優先排序、Lab Metric | 2026-05-14 |

---

## H. Group Theory Explorer（全部完成 2026-05-14）

> 以群論為核心，連結 Logic Coverage（CACC）與 Metamorphic Testing（對稱性），具備理論橋接按鈕。

| PR | 子任務 | 說明 | 完成日 |
|----|--------|------|--------|
| #149 | H1 — 群論工具函式庫 | `computeAutGroupFromTable`、`determinationPairsFromTable`、35 個單元測試 | 2026-05-14 |
| #151 | H2 — Orbit Explorer（Tab 1） | 運算表格輸入 → 自動計算自同構群、軌道分割、視覺化 | 2026-05-14 |
| #153 | H3 — CACC Bridge（Tab 2） | 用群論 determination pairs 橋接 Logic Coverage；高亮對稱對 | 2026-05-14 |
| #155 | H4 — Covering Array（Tab 3） | GF(p) 有限域 covering array 生成器；strength 滑桿 | 2026-05-14 |
| #157 | H5 — Theory Bridge 按鈕 | GroupTheory → Metamorphic Testing（點擊 MT tab + 滾動至 section-blackbox）；Logic → GroupTheory | 2026-05-14 |
| #159 + #160 | H6 — Per-tab Quiz & Lab Reflect | 每個 tab 獨立出題（動態計算正解）；Lab Reflect 雙 textarea；bridge 按鈕 bug 修復 | 2026-05-14 |

**架構特點**
- Quiz 正解依當前 tab 動態計算（`_quizCorrect()`），不用硬編碼
- Bridge 按鈕：MT 是 `section-blackbox` 的子 tab，需 `.click()` 先切換再 `scrollIntoView`

---

## 已完成的改善項目（歸檔）

| 項目 | PR | 完成日 |
|------|----|--------|
| A1 — #13 Logic Binding 投影片 | #98 | 2026-05-12 |
| A2 — Explorer JSDOM smoke tests | #100 | 2026-05-12 |
| A3 — TestGen Download-as-JS | #102 | 2026-05-12 |
| B1 — Analytic interval solver | #104 | 2026-05-12 |
| B2 — Logic Binding 更多範例（isLeapYear/gcdStep/binarySearch） | #106 | 2026-05-12 |
| B3 — Mutation-based fuzzing engine | #108 | 2026-05-12 |
| C1 — Speaker notes（13 講） | #110 | 2026-05-12 |
| C2 — BVA + EC explorers | #112 | 2026-05-12 |
| C3 — Quiz 模式（Graph/BVA/EC） | #114 | 2026-05-12 |
| Decision Table + State Transition explorers | #116 | 2026-05-12 |
| Metamorphic Testing + Exploratory Testing + Test Doubles | #118 | 2026-05-12 |
| D1 — Quiz 高優先（Logic/DT/ST） | #120 | 2026-05-12 |
| D1 — Quiz 中優先（Syntax/MT/TD） | #122 | 2026-05-12 |
| D1 — Quiz 低優先（Symbolic/Concolic/Fuzz） | #124 | 2026-05-12 |
| E1 — DefectCostExplorer | #126 | 2026-05-13 |
| E2 — VModelExplorer | #128 | 2026-05-13 |
| E3 — PyramidAdjusterExplorer | #130 | 2026-05-13 |
| F-A1/A2/A5 — ResultExporter + ResultViewer + 分享按鈕 | #133 | 2026-05-13 |
| F-A3/A4 — Lab Reflect + Lab Metric 模式 | #135 | 2026-05-13 |
| G1 — PairwiseExplorer | #137 | 2026-05-13 |
| G2 — CauseEffectExplorer | #139 | 2026-05-13 |
| G3 — CodeCoverageExplorer | #141 | 2026-05-13 |
| G4 — IntegrationTestingExplorer | #143 | 2026-05-13 |
| G5 — PropertyBasedTestingExplorer | #145 | 2026-05-13 |
| G6 — RiskBasedTestingExplorer | #147 | 2026-05-14 |
| H1 — 群論工具函式庫 | #149 | 2026-05-14 |
| H2 — GroupTheoryExplorer Tab 1 Orbit | #151 | 2026-05-14 |
| H3 — GroupTheoryExplorer Tab 2 CACC Bridge | #153 | 2026-05-14 |
| H4 — GroupTheoryExplorer Tab 3 Covering Array | #155 | 2026-05-14 |
| H5 — Theory Bridge 按鈕（GroupTheory ↔ Logic ↔ MT） | #157 | 2026-05-14 |
| H6 — Per-tab Quiz & Lab Reflect；bridge bug fix | #159 / #160 | 2026-05-14 |
| F-B1 — Firestore saveResult / loadCourseResults + Security Rules | #162 | 2026-05-14 |
| F-B2 — CloudStoragePanel 班級代碼 UI + 自動上傳攔截 | #164 | 2026-05-14 |
| F-B3 — TeacherDashboard 全班成績儀表板 | #166 | 2026-05-14 |
| I1 — EquivalentMutantExplorer（三階段前處理 + 8 對題庫） | #168 | 2026-05-14 |
| I2 — MutationScoreExplorer（突變分數 vs 行覆蓋率雙儀表板） | #170 | 2026-05-14 |
| I3 — LLMPipelineExplorer（三 Agent 流程 + 平台 kill-rate 對比） | #172 | 2026-05-14 |
| I4 — TestQualityExplorer（五品質維度 × 6 情境） | #174 | 2026-05-14 |
| I5 — FaultDirectedTestingExplorer（blind vs fault-directed mutation） | #176 | 2026-05-14 |

---

## I. AI 輔助測試 Explorer（全部完成 2026-05-14）

> 參考論文：**"Mutation-Guided LLM-based Test Generation at Meta"**（arXiv 2501.12862，FSE 2025）
> Foster, Gulati, Harman, Harper, Mao, Ritchey, Robert, Sengupta（Meta）
>
> ACH（Automated Compliance Hardener）三階段 LLM Agent 流程在 10,795 個 Android Kotlin 類別上達到 73% 工程師接受率、15% 突變體殺死率（vs TestGen-LLM 2.4%）。

| Item | Explorer | 核心教學點 | PR |
|------|----------|-----------|-----|
| I1 | EquivalentMutantExplorer | 三階段前處理（syntactic identity / strip-comments / LLM-as-judge）把 precision 0.79→0.95、recall 0.47→0.96 | #168 |
| I2 | MutationScoreExplorer | 49% 的 ACH 測試殺死突變體卻不增加行覆蓋率——反直覺示範 | #170 |
| I3 | LLMPipelineExplorer | 三 Agent 流程（Mutation→Equivalence→Test），含各 Agent 的 prompt、I/O、失敗模式 | #172 |
| I4 | TestQualityExplorer | 五品質維度 Buildable / Non-flaky / Hardening / Relevant / Style；非穩定是普遍拒絕門檻 | #174 |
| I5 | FaultDirectedTestingExplorer | Blind coverage-driven vs 規格導向 fault-directed mutation；6× 殺死率提升的本質 | #176 |

共新增 5 個 Explorer、~2,500 行程式碼、60 個新測試（unit suite 415 → 475）、`section.advanced` + `advancedTabs` 分頁佈線、`emx.* / msx.* / llmp.* / tqx.* / fdx.*` i18n 命名空間（EN+ZH），全部 Explorer 共用 `.emx-paper-cite` 論文引用橫幅。

---

## I. AI 輔助測試 — 原始路線圖（已歸檔）

> 參考論文：**"Mutation-Guided LLM-based Test Generation at Meta"**（arXiv 2501.12862，FSE 2025）
> 作者：Foster, Gulati, Harman, Harper, Mao, Ritchey, Robert, Sengupta（Meta）
>
> 論文核心：ACH（Automated Compliance Hardener）系統 — 三階段 LLM Agent 流程，針對特定故障類型（隱私合規）生成能殺死突變體的單元測試，在 10,795 個 Android Kotlin 類別上達到 73% 工程師接受率。
>
> 下列 Explorer 將論文中的技術概念轉化為互動教材，不需呼叫真實 LLM（使用預計算範例）。

---

### I1（高優先）— Equivalent Mutant Explorer（等效突變體偵測）

**教學動機**：等效突變體是突變測試的核心難題 — 語法不同但語義相同的程式，任何測試都無法殺死它們。論文顯示 LLM 原始偵測 precision 0.79/recall 0.47，透過「移除注解」前處理後提升至 0.95/0.96，說明預處理步驟的關鍵性。

**功能規劃**

- 程式碼對比面板：左欄原始碼、右欄突變體，diff 高亮
- 學生手動判斷：「這個突變體是否等效？」（Yes / No）→ 解釋原因
- 前處理模擬器：
  - Step 1：語法完全比對（字串相等 → 直接判等效）
  - Step 2：移除注解後比對（說明 25% 假陽性來源）
  - Step 3：LLM-as-judge（模擬，顯示 prompt 範本與判斷結果）
- Precision/Recall 儀表板：隨學生答題即時更新
- 預設題庫：8 組突變體對（4 組等效、4 組非等效），含 `// comment only` 型態
- **Quiz**：「下列哪個步驟對偵測等效突變體的 recall 提升最大？」
- **Lab Reflect**：「為什麼等效突變體的存在讓突變分數（mutation score）具有誤導性？」

**實作估計**：1 個 PR，約 500 行

---

### I2（高優先）— Mutation Score vs Coverage Explorer（突變分數對比覆蓋率）

**教學動機**：論文關鍵發現 — ACH 生成的測試中，49% 能殺死突變體但不增加行覆蓋率，顛覆「高覆蓋率 = 高品質測試」的直覺。現有 CodeCoverageExplorer（G3）只展示覆蓋率，本 Explorer 補足突變分數維度。

**功能規劃**

- 雙面板：左側程式碼（可執行小型 JS 函數）、右側測試套件編輯器
- 即時計算兩個指標：
  - **Line Coverage %**（已覆蓋行 / 總行數）
  - **Mutation Score %**（已殺死突變體 / 非等效突變體總數）
- 突變體清單：每個突變體顯示（存活 / 已殺死 / 等效）
- 反例演示：預設一組「高覆蓋率但低突變分數」的測試套件 vs 「低覆蓋率但高突變分數」的測試套件
- 新增測試後，動態高亮哪些突變體被新測試殺死、行覆蓋率如何變化
- 數據視覺化：ACH 論文中的 kill rate 比較（ACH 15% vs TestGen-LLM 2.4%）
- **Quiz**：「以下測試套件的突變分數是多少？（填數字）」
- **Lab Metric**：Mutation Score ≥ 80% 才通過

**實作估計**：1–2 個 PR，需擴充突變執行引擎

---

### I3（中優先）— LLM Test Generation Pipeline Explorer（三階段 Agent 流程）

**教學動機**：ACH 的三 Agent 流程（突變生成 → 等效過濾 → 測試生成）是現代 AI 輔助測試的代表架構。讓學生理解每個 Agent 的職責、輸入/輸出、以及失敗模式。

**功能規劃**

- 流程圖視覺化（三個階段橫向排列）：
  - **Agent 1（Mutation Agent）**：輸入 issue 描述 + 原始碼 → 輸出突變體候選清單
  - **Agent 2（Equivalence Agent）**：輸入原始碼 + 突變體 → 過濾等效突變體，輸出非等效清單
  - **Agent 3（Test Agent）**：輸入原始碼 + 非等效突變體 → 輸出能殺死突變體的測試
- 每個 Stage 可點擊展開，顯示：
  - 實際 Prompt 範本（來自論文附錄）
  - 範例輸入/輸出（預計算，不需真實 LLM）
  - 常見失敗情境（equivalent mutant leak、flaky test、build error）
- 對比面板：Rule-based 突變測試流程 vs LLM-guided 流程
- 論文數據摘要：各平台 kill rate（Messenger 14%、WhatsApp 25%…）
- **Lab Reflect**：「LLM 生成突變體的等效率（~25%）為何高於 rule-based（~10-15%）？如何改善？」

**實作估計**：1 個 PR，約 400 行（以 SVG 流程圖 + 可折疊說明面板為主）

---

### I4（中優先）— Test Quality Assessment Explorer（測試品質五維度）

**教學動機**：論文定義的五類測試品質保證（Buildable、Valid Regression、Hardening、Relevant、Fashion Following）提供了系統化評估測試的框架，超越單純的覆蓋率思維。

**功能規劃**

- 給定一段程式碼 + 一份測試，學生依五個維度評分（0/1 或 1–5 分）：
  1. **Buildable**：語法正確、依賴可解析
  2. **Non-flaky**：多次執行結果一致（顯示執行 10 次的結果）
  3. **Hardening**：能殺死現有測試套件殺不死的突變體
  4. **Relevant**：與目標 issue/功能緊密相關
  5. **Style Conforming**：符合既有程式碼風格
- 預設 6 組測試情境，每組有不同品質缺陷（如：buildable 但 flaky；hardening 但不 relevant）
- 評分後顯示論文中工程師接受/拒絕的理由分布（51% 增加覆蓋率、27% 角落案例、36% 隱私相關）
- **Quiz**：多選題「以下哪些情況會讓測試被工程師拒絕？」
- **Lab Reflect**：「Hardening 與 Relevant 兩個維度如何取捨？」

**實作估計**：1 個 PR，約 400 行

---

### I5（低優先）— Fault-Directed Testing Explorer（缺陷導向測試）

**教學動機**：ACH 的核心創新是「針對特定 issue 類型生成突變體」而非盲目套用全部算子。讓學生體驗從問題描述出發、設計針對性測試的思路。

**功能規劃**

- Issue 描述輸入（如「函數可能在 null 時洩漏用戶 ID」）
- 系統展示三種可能的針對性突變（移除 null 檢查、改變條件方向、刪除清除操作）
- 學生選擇最有意義的突變，並撰寫對應測試
- 對比：同樣函數用 Statement Coverage 生成的測試 vs Fault-Directed 測試的殺傷力差異
- **Lab Reflect**：「規格導向（specification-directed）測試與覆蓋率驅動（coverage-driven）測試的本質差異是什麼？」

**實作估計**：1 個 PR，約 350 行

---

### 優先順序

| 排序 | 項目 | 理由 |
|------|------|------|
| ① | I1 等效突變體偵測 | 補足現有 SyntaxCoverageExplorer 的缺口；概念獨立、易實作 |
| ② | I2 突變分數 vs 覆蓋率 | 最具反直覺教學效果；與現有 G3 CodeCoverage 形成對比閉環 |
| ③ | I3 三階段 Agent 流程 | 系統架構概念，適合投影片搭配講解 |
| ④ | I4 測試品質五維度 | 高度實務導向，適合進階課程 |
| ⑤ | I5 缺陷導向測試 | 概念較抽象，適合研究所課程 |

---

## J. 系統 / E2E / 驗收測試 Explorer（路線圖）

> 補足現有 Explorer 的層級分布：30 個 Explorer 多落在 unit / coverage / 黑盒設計，**系統測試（system）、端到端（E2E）、驗收測試（acceptance）** 是明顯空白。
>
> 與既有 Explorer 的關係：本節各 Explorer 屬於測試金字塔上層（V-Model 右上），補完 PyramidAdjuster (E3)、VModel (E2)、IntegrationTesting (G4)、Exploratory、RiskBased (G6) 之後的對話。
>
> 預設新增 `section.acceptance` 區塊，分頁形式擺放 J1–J8（與 Advanced Testing 同樣樣式）。

---

### J1（高優先）— BDD / Gherkin Explorer（行為驅動驗收）

**教學動機**：BDD（Behavior-Driven Development）與 Gherkin 是業界最普遍的驗收測試語法（Cucumber、SpecFlow、Behave）。讓學生親手操作 Feature → Scenario → Step 的階層，理解「一個 Scenario Outline 如何自動展開成 N 個參數化測試」。

**功能規劃**

- 三欄佈局：
  - **左欄**：Feature 檔編輯器（Gherkin 語法，含語法高亮）
  - **中欄**：Step Definitions（Given/When/Then ↔ JS 函數綁定表）
  - **右欄**：生成的測試案例表（Scenario Outline 自動展開）
- 預設 3 個 Feature 範例：
  - `login.feature`（基本 Given/When/Then 流程）
  - `discount.feature`（Scenario Outline + Examples 表 → 5 列參數化）
  - `cart.feature`（Background + Scenario + And 連接）
- 即時驗證：未綁定的 step 以紅色標示；綁定後可「Run」執行模擬測試
- **Bridge to D**：點擊 Examples 表可跳轉至 Decision Table Explorer
- **Quiz**：「Scenario Outline with N=4 examples 與 4 個獨立 Scenario 在執行結果上有何差異？」
- **Lab Reflect**：「Given/When/Then 三段式對測試可讀性的價值在哪？什麼時候 BDD 是過度設計？」

**實作估計**：1 個 PR，約 450 行（Gherkin parser 是核心，可手寫小型 parser 或用最簡 regex）

---

### J2（高優先）— Use Case → Test Case Derivation Explorer（用例衍生）

**教學動機**：Jacobson 的 Use Case 是經典系統測試起點。讓學生理解「一個 use case = happy path + N 個 alternate flow + M 個 exception flow」，並能機械地衍生最少測試案例集合。

**功能規劃**

- Use Case Diagram（SVG）：Actor + Use Case ovals + include / extend 關係
- 內嵌 Use Case Detail 編輯器：
  - 前置條件 / 後置條件
  - 主要流程（Main Success Scenario）
  - 替代流程（Alternate Flow，從某步驟分岔）
  - 例外流程（Exception Flow）
- 自動衍生測試案例樹：每個流程 = 一個測試案例，標示對應步驟
- 預設 3 個範例：ATM 提款、線上訂票、新增使用者
- 覆蓋指標：主要流程 100% 覆蓋；替代+例外流程的覆蓋率以進度條顯示
- **Bridge to G6**：點擊例外流程 → 跳至 RiskBased（依風險排序測試順序）
- **Quiz**：「給定 use case 有 1 個 main、3 個 alternate、2 個 exception，至少需要幾個測試案例覆蓋所有 flow？」
- **Lab Reflect**：「Use case 衍生與 BDD scenario 衍生的差異？何時各自更適合？」

**實作估計**：1 個 PR，約 400 行

---

### J3（高優先）— E2E User Journey Explorer（端到端使用者旅程）

**教學動機**：E2E 測試常見痛點是「flaky」與「維護成本」。讓學生看見一個多步驟使用者旅程的失敗點分佈（timing、network、animation、async），理解何處需要顯式等待、何處需要重試。

**功能規劃**

- 旅程時間軸：橫向 6–8 步驟（例：login → search → add to cart → checkout → pay → confirm）
- 每步驟可標記風險來源：
  - ⏱ Timing（race condition、未等待 DOM 穩定）
  - 🌐 Network（API 延遲、回應變動）
  - 🎬 Animation（CSS transition 干擾點擊）
  - ⚙ Async（背景任務、WebSocket、polling）
- 模擬模式：點擊「執行 100 次」觀察 flakiness 分佈（紅綠長條圖）
- 修復對照：每種風險顯示對應的 Playwright / Cypress 寫法（顯式等待、retry、network mock）
- **Bridge to I4**：與 TestQuality Non-flaky 維度連動
- **Quiz**：「下列失敗 log 屬於哪一類 flakiness？」（4 選 1）
- **Lab Reflect**：「在你的專案中最常見的 flaky 來源是什麼？如何重現以便修復？」

**實作估計**：1 個 PR，約 400 行

---

### J4（中優先）— Consumer-Driven Contract Testing Explorer（Pact 風格）

**教學動機**：微服務架構下，服務級驗收測試的主流方法是 Consumer-Driven Contract（Pact）。讓學生理解「消費者寫契約、提供者驗證契約」與「broker 中介」的協作模式，補上 service-level acceptance 空白。

**功能規劃**

- 三方圖（SVG）：Consumer、Pact Broker、Provider
- Consumer 端：定義 expected request / response（互動式 JSON 編輯器）
- 自動生成 Pact 契約檔（JSON）並上傳至模擬 Broker
- Provider 端：拉取契約 → 驗證自己的實作是否符合
- Verification Matrix：Consumer × Provider 版本相容性矩陣（綠/紅儲存格）
- 預設情境：3 個 consumer（web、mobile、partner-api）× 2 個 provider 版本
- 反例展示：欄位移除、型態變更、必填變選填——分別會發生什麼破壞？
- **Bridge to G4**：對比 Integration Testing 的 stub vs contract test
- **Quiz**：「Provider 新增非必填欄位是否破壞契約？為什麼？」
- **Lab Reflect**：「Contract test 與 E2E test 在微服務系統中的角色如何分工？」

**實作估計**：1 個 PR，約 500 行（broker / matrix 視覺化是重點）

---

### J5（中優先）— Performance Load Profile Explorer（非功能驗收）

**教學動機**：效能/負載測試常用四種負載剖面（load shape）：穩態（load）、極限（stress）、突波（spike）、持久（soak）。每種揭露不同問題。讓學生看見負載曲線與系統指標的關係。

**功能規劃**

- 上方：負載剖面選擇器（4 種曲線可疊加比較）
- 中間：模擬系統指標（response time p50/p95/p99、throughput、error rate）
- Little's Law 互動：L = λ × W，調 throughput 與 latency 觀察排隊長度
- Knee-of-the-curve 視覺化：找出系統 saturation point
- 預設情境：API gateway、DB-bound service、CPU-bound service（三種瓶頸特徵）
- **Bridge to G6**：高風險模組搭配什麼負載剖面？
- **Quiz**：「給定吞吐量 200 req/s、平均回應 50ms，依 Little's Law 系統內並行請求數為何？」
- **Lab Reflect**：「Soak test 為何能找到 load test 找不到的記憶體洩漏？」

**實作估計**：1 個 PR，約 500 行（負載曲線 + 指標圖表為主）

---

### J6（低優先）— Chaos Engineering Steady-State Explorer

**教學動機**：Chaos Engineering（Netflix Simian Army、Principles of Chaos）以「對 steady-state 假說做實驗」為核心。讓學生體驗 fault injection → 觀察 blast radius → 學習迴圈。

**功能規劃**

- 系統拓撲圖（SVG）：5–7 個服務節點 + 依賴邊
- Steady-state 指標儀表板（成功率、p95 latency、QPS）
- Fault injection 選單：
  - Latency（注入 200ms / 500ms / 1s）
  - Packet drop（10% / 30% / 50%）
  - Dependency death（強制下線某節點）
- Blast radius 視覺化：受影響節點以漣漪動畫擴散
- 假說對照：選定 hypothesis（「即使 service-X 死亡，使用者旅程成功率仍 ≥ 99%」）→ 注入錯誤 → 觀察是否成立
- 預設情境：micro-services e-commerce、video streaming pipeline
- **Bridge to J3**：失敗發生時，E2E user journey 的哪一步斷裂？
- **Quiz**：「Hypothesis 不成立時應該繼續注入更大故障，還是停止實驗？」
- **Lab Reflect**：「Chaos engineering 與傳統 disaster recovery test 的差異是什麼？」

**實作估計**：1 個 PR，約 600 行（SVG 拓撲與動畫為主，複雜度較高）

---

### J7（低優先）— ATDD Cycle Explorer（驗收測試驅動開發）

**教學動機**：ATDD（Acceptance Test-Driven Development，Discuss → Distill → Develop → Demo）是 BDD 的方法論前身。讓學生看見驗收測試從「對話」到「demo」的完整循環，並與 TDD 的 red-green-refactor 對比。

**功能規劃**

- 四階段循環圖（SVG）：Discuss / Distill / Develop / Demo，可逐步動畫
- 每階段有具體產出物：
  - Discuss → user story + acceptance criteria
  - Distill → Gherkin scenarios（連結 J1）
  - Develop → step definitions + production code（TDD inner loop）
  - Demo → 給 PO 看的驗收會
- 對比模式：ATDD 大循環 vs TDD 小循環（兩個動畫並列）
- 預設情境：使用者故事「賦予折扣碼可被結帳套用」走完一輪
- **Bridge to J1**：點擊 Distill 階段跳至 Gherkin Explorer
- **Quiz**：「四 D 流程中哪一步包含 PO（Product Owner）？哪一步包含 dev only？」
- **Lab Reflect**：「ATDD 與 TDD 的對話成本權衡為何？」

**實作估計**：1 個 PR，約 350 行（概念與動畫為主，邏輯較少）

---

### J8（低優先）— Flaky Test Diagnosis Explorer

**教學動機**：與 I4 TestQuality 的 Non-flaky 維度形成深度對：把 flaky 細分為 6 種來源並讓學生練習分類。

**功能規劃**

- 8 個失敗 log 樣本（隨機順序），學生分類為：
  - Timing / Order dependency / Async / Network / Animation / Data pollution
- 每分類附「典型修法」說明
- 統計面板：學生在哪一類最常分錯
- 與 I4 Non-flaky 連動：本 Explorer 是 I4 該維度的「深潛」版本
- **Quiz**：「下列哪一種 flaky 用 retry 修復通常治標不治本？」
- **Lab Reflect**：「同一個測試在 CI 上 flaky 但在本機穩定，最可能是哪種來源？」

**實作估計**：1 個 PR，約 350 行

---

### 優先順序與分組

| 排序 | 項目 | 理由 | 預估完成 |
|------|------|------|---------|
| ① | J1 BDD / Gherkin | 業界最普遍的驗收方法；視覺化效果好；可重用 Lab/Quiz 框架 | 1 個 PR |
| ② | J2 Use Case → Test Case | 補上 Jacobson 經典；衍生邏輯機械化、易實作 | 1 個 PR |
| ③ | J3 E2E User Journey | 補 E2E 缺口；與 I4 Non-flaky 與 PyramidAdjuster 形成對話 | 1 個 PR |
| ④ | J4 Contract Testing (Pact) | 補 service-level acceptance；微服務時代必備 | 1 個 PR |
| ⑤ | J5 Performance Load Profile | 補非功能驗收；Little's Law 視覺化教學效果強 | 1 個 PR |
| ⑥ | J6 Chaos Engineering | 趨勢主題；有 Netflix 論文背書；實作較複雜 | 1 個 PR |
| ⑦ | J7 ATDD Cycle | 概念性、適合搭配投影片；可作 J1 的前置講解 | 1 個 PR |
| ⑧ | J8 Flaky Diagnosis | I4 的深潛；不需引論文也成立 | 1 個 PR |

### 建議的合併策略

- **第一波（核心驗收）**：J1 + J2 + J3 — 三個 PR 一氣完成，新建 `section.acceptance` 分頁
- **第二波（服務 / 非功能）**：J4 + J5 — 兩個 PR，建立服務級驗收 & 非功能測試版圖
- **第三波（彈性）**：J6 + J7 + J8 — 視課程需求選做

### 與既有 Explorer 的關聯

| J Explorer | 連動的既有 Explorer |
|------------|---------------------|
| J1 BDD / Gherkin | DecisionTable (E2/D)、PairwiseExplorer (G1) |
| J2 Use Case → Test Case | RiskBased (G6)、IntegrationTesting (G4) |
| J3 E2E User Journey | PyramidAdjuster (E3)、TestQuality (I4)、RiskBased (G6) |
| J4 Contract Testing | IntegrationTesting (G4)、TestDoubles |
| J5 Performance Load | RiskBased (G6)、FuzzTesting |
| J6 Chaos Engineering | J3 (E2E)、J4 (Contract) |
| J7 ATDD Cycle | J1 (Gherkin)、VModel (E2) |
| J8 Flaky Diagnosis | TestQuality (I4)、E2E (J3) |

---

## 技術棧備忘

| 工具 | 用途 |
|------|------|
| Vite + 原生 JS | 前端，無框架 |
| Vitest + jsdom | Unit tests（415 個，37 檔） |
| Playwright | E2E / screenshot capture |
| Marp CLI | Markdown → PPTX |
| Firebase / Google Drive | 雲端同步 |
| esbuild | standalone.js 打包（file:// 模式） |
| Node.js 24 | CI / GitHub Actions |
