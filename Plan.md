# stvisual — 改善建議與路線圖

> 最後更新：2026-05-12

---

## 現況（已完成功能）

### 互動式 Explorer（12 個）

| Explorer | 主要功能 |
|----------|----------|
| TestingMethodTree | 測試方法分類樹狀圖 |
| TestingFlow + TestingTypesTable | 測試流程 & 測試金字塔 |
| GraphCoverageExplorer | CFG 建構、Node/Edge/Prime-path 準則、DFG 資料流準則 |
| LogicCoverageExplorer | 14 項 Logic Coverage 準則、K-map、clause binding（#12.2） |
| SyntaxCoverageExplorer | Program Mutation（15 operators）、Grammar Mutation、String Mutation |
| SpecMutationExplorer | FSM Safety Monitor、SMV-style 規格突變 |
| FuzzTestingExplorer | 隨機 fuzzing + CFG 覆蓋熱度圖 |
| SymbolicExecutionExplorer | 符號執行路徑樹 + CFG 映射 + 縮放 |
| ConcolicExecutionExplorer | DART/CUTE-style concolic + CFG 映射 + 縮放 |
| TestGenerationExplorer | 從 Graph / DFG 準則自動產生具體測試輸入（#12.1） |
| CloudStoragePanel | Firebase / Google Drive 雲端同步 |
| 全站 i18n | ZH-TW / EN 切換 |

### 投影片（12 講，雙語）

01 課程概觀、02 測試流程、03 Graph Coverage、04 Data Flow、05 Logic Coverage、
06 Program Mutation、07 Grammar & String、08 Spec Mutation、09 Fuzz Testing、
10 Symbolic Execution、11 Concolic Execution、12 Test Generation

- 44 張 Playwright 截圖（`docs/assets/slides/`）
- 一鍵轉 PPTX：`npx @marp-team/marp-cli <file> --pptx`

### 測試

- 229 個 unit tests（Vitest）
- Playwright E2E：GraphCoverage、LogicCoverage、SyntaxCoverage、TestingFlow 等

---

## 待修補（已知問題）

| # | 說明 | 狀態 |
|---|------|------|
| [#78](https://github.com/skhuang/stvisual/issues/78) | Symbolic/Concolic split layout — issue 未關閉（#79 已修） | 關閉 issue |
| [#72](https://github.com/skhuang/stvisual/issues/72) | CI secrets fix — issue 未關閉（ae84cd6 已修） | 關閉 issue |
| 投影片 index 截圖數 | `index.zh-TW.md` / `index.en.md` 寫「43 張」，實際 44 張 | 小修 |

---

## 改善建議

### A 優先（功能明確、學習價值高）

#### A1. #13 Logic Coverage Binding 投影片

- 對應 `LogicCoverageExplorer` 的 clause binding 子面板（#12.2 功能）
- 內容：clause → 程式變數對應、brute-force witness 求解、constraint 欄位說明
- 產出：`docs/slides/13-logic-binding.zh-TW.md` + `.en.md` + 截圖 2–3 張
- 投影片 index 更新為 13 講

#### A2. E2E 測試補齊（Playwright / JSDOM）

目前缺 browser-level 測試的 explorer：

| Explorer | 目前測試層級 | 缺少 |
|----------|------------|------|
| FuzzTestingExplorer | unit | JSDOM render smoke test |
| TestGenerationExplorer | unit | JSDOM render smoke test |
| LogicCoverageExplorer binding 面板 | unit（logicBinding.test.js） | binding inputs UI test |
| SymbolicExecutionExplorer | unit | JSDOM render smoke test |
| ConcolicExecutionExplorer | unit | JSDOM render smoke test |

每個只需 20–30 行的 JSDOM render smoke test，確認不 crash 即可。

#### A3. Test Generation 匯出

- 在 TestGenerationExplorer 加「Download as JS」按鈕
- 將產生的測試集輸出為可直接執行的 Vitest / Jest 檔案
- 格式範例：
  ```js
  import { describe, it, expect } from 'vitest';
  describe('generated tests', () => {
    it('test 1: x=1, y=0', () => { /* ... */ });
  });
  ```

---

### B 中優先（技術品質）

#### B1. SMT Solver 整合（Logic Binding）

- 目前：暴力窮舉整數 `[-10, 10]`，限制多
- 改善：接入 [z3-solver](https://github.com/nicowillis/z3-solver-js)（WebAssembly 版）
- 效益：支援大範圍整數、浮點、字串 constraint，不再有「infeasible」誤報

#### B2. Logic Binding 更多程式範例

- 目前 6 個：`abs`, `max(a,b)`, `triangle`, `triangle-valid`, `abs-predicate`, `max3-predicate`
- 建議新增：`calendar`（月份邊界，多子句）、`gcd`、`binarySearch`
- 每個附 `sourceCode` + `defaultBindings` + `bindingParams`

#### B3. Fuzz Testing：Mutation-based Fuzzer

- 目前：純隨機產生輸入
- 改善：對現有 seed input 做小幅擾動（±1、bitflip、boundary nudge）
- 效益：更快發現邊界 bug，覆蓋率上升更穩定

---

### C 低優先（教學加值）

#### C1. Speaker Notes

- 對所有 12 份 Marp deck 加 `<!-- speaker -->` 區塊
- 提供講師逐張說明文字（不影響投影片視覺）

#### C2. 邊界值 / 等價類分割 Explorer

- 目前 Plan.md 原本規劃的黑盒測試方法尚未實作
- `BoundaryValueExplorer`：輸入數值範圍，自動列出 on/off/in-point
- `EquivalenceClassExplorer`：分割條件設定，產生測試用例

#### C3. 課程進度追蹤 / Quiz 模式

- 在每個 Explorer 加「自我測驗」按鈕
- 出題：給定程式，要求選出滿足指定準則的最小測試集
- 評分：對比學生答案與最小集

---

## 建議執行順序

```
A1（#13 投影片）→ A2（E2E 補測試）→ A3（匯出功能）
→ B1（SMT solver）→ B2（更多範例）→ B3（mutation fuzzer）
→ C1–C3（視課程需求選做）
```

---

## 技術棧備忘

| 工具 | 用途 |
|------|------|
| Vite + 原生 JS | 前端，無框架 |
| Vitest | Unit tests |
| Playwright | E2E / screenshot capture |
| Marp CLI | Markdown → PPTX |
| Firebase / Google Drive | 雲端同步 |
| z3-solver-js | （B1 預計引入）SMT solver |
