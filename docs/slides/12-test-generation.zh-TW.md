---
marp: true
theme: default
paginate: true
size: 16:9
title: 軟體測試視覺化 #12 — Test Generation from Coverage
description: 從 Graph / Data Flow Coverage 需求自動產生最小測試集
lang: zh-TW
---

# Test Generation from Coverage
### 讓 Coverage 需求自己長出測試用例

軟體測試視覺化系列 #12
搭配工具：`/section-testgen`（[TestGenerationExplorer](../../src/components/TestGenerationExplorer.js) + [testGeneration.js](../../src/utils/testGeneration.js)）

<!-- 本講把前面所有準則串起來：用覆蓋準則生成「最少的測試集」覆蓋「所有需求」。這是整個系列的綜合應用。 -->
---

## 本講在系列中的位置

```
#3 Graph Coverage   ──► 列出 requirements（node / edge / prime-path / …）
#4 Data Flow Cov.   ──► 列出 du-pair requirements（all-defs / all-uses / all-du-paths）
#10 Symbolic Exec.  ──► 對每條路徑求解 witness（具體輸入）
                             ↓
#12 Test Generation ──► 把 requirements + witnesses → 最小測試集
```

> 本講是 #3、#4、#10 的「橋」：
> 從**抽象結構需求**出發，自動求得**最少幾組具體輸入**可以涵蓋所有可行需求。

<!-- 前面各講「定義準則」，本講「自動化生成滿足準則的測試集」。這是從理論到工程實踐的最後一哩路。 -->
---

## 問題定義

給定：
- 一段 JavaScript 函式原始碼
- 一個 Coverage 準則（node / edge / prime-path / all-defs / …）

求：
1. 列出所有抽象 **coverage requirements**（節點、邊、du-pair…）
2. 判斷每個 requirement 是否**可行**（symbolic execution 找不到 witness → infeasible）
3. 選出**最小測試集**：每個可行 requirement 至少被一個測試覆蓋

> 等同於 greedy set cover on feasible requirements。

<!-- 問題：給定一個函式和一個覆蓋準則，找出最少的測試案例集合，使得所有準則要求的 requirement 都被覆蓋。 -->
---

## 計算流水線

```
sourceCode
    │
    ▼ programToGraph()
  CFG / DFG
    │
    ▼ getCoverageRequirements(criterion)
  requirements[ ]
    │
    ▼ symbolicExecute() → witnessedPaths[ ]
    │       (每條可行路徑帶 witness + branch trace)
    ▼ mapBranchesToCfg()
  cfgNodes / cfgEdges per path
    │
    ▼ requirementCoveredByRecord() × each requirement × each path
  requirementCoverage[ ]   (feasible / infeasible + representativeWitness)
    │
    ▼ greedy set cover
  selectedTests[ ]   ← 最小測試集
```

<!-- 流水線：程式碼 → CFG → 覆蓋需求 → Greedy Set Cover → 最少測試集 → 執行驗證。 -->
---

## 關鍵模組

| 模組 | 功能 | 來源 |
| --- | --- | --- |
| `programToGraph.js` | JS → CFG/DFG | 新建於 #3/#4 |
| `getCoverageRequirements` | 列出 requirements | 來自 `graphCoverage.js` |
| `symbolicExecute` | path condition + witness | 來自 `symbolicExecution.js` |
| `mapBranchesToCfg` | branch trace → CFG node/edge | 來自 `pathToCfg.js` |
| `requirementCoveredByRecord` | 判斷一個 path 是否覆蓋某 requirement | 來自 `graphCoverage.js`（新 export） |
| `testGeneration.js` | 以上五步串成一條流水線 + greedy cover | **本講新增** |

<!-- 四個模組各司其職：pathFinder（路徑搜尋）、TestPathSelector（貪婪選取）、TestCaseBuilder（具體化）、Runner（執行驗證）。 -->
---

## Greedy Set Cover

```
input:  feasiblePaths P, requirements R
output: minimal T ⊆ P

T = ∅
while R 不空：
  p* = argmax_{p ∈ P} |{ r ∈ R : p covers r }|
       （tie-break：選 witness 絕對值最小者 → 教學時看起來最簡單）
  T = T ∪ { p* }
  R = R − { r : p* covers r }
```

> 不保證最優（NP-hard）；但 greedy 往往在實際函式中達到接近最優，且可讀性好。

<!-- Greedy Set Cover 是 NP-hard 問題的近似算法：每次選覆蓋最多未覆蓋 requirement 的路徑。近似比 ln(n)，通常實際效果很好。 -->
---

## 8 個 Coverage 準則

| 準則 | 類別 | requirements 的型態 |
| --- | --- | --- |
| Node Coverage | 結構性 | 每個 CFG 節點 |
| Edge Coverage | 結構性 | 每條 CFG 邊 |
| Edge-Pair Coverage | 結構性 | 連續兩條邊 |
| Prime Path Coverage | 結構性 | 所有極大簡單路徑 |
| Complete Path Coverage | 結構性 | 所有有限路徑 |
| All-Defs | 資料流 | (var, def node) |
| All-Uses | 資料流 | (var, def node, use node) |
| All-DU-Paths | 資料流 | (var, def→use 簡單路徑) |

<!-- 工具支援 NC/EC/ECC/PPC/ADUP/ADU/ADef + CACC。可以讓學生選不同準則，觀察測試集大小的差異。 -->
---

## 工具：總覽

![w:1050](../assets/slides/testgen-overview.png)

- 上方：範例選擇（同 #10/#11 的 `symbolicExecutionExamples`）+ 準則下拉選單
- 左側：CFG 視覺化（與選中 requirement/test 互動高亮）
- 右側：Requirements 卡 + Minimal Tests 卡

<!-- 左側輸入程式碼，右側分三區：requirements 列表、selected tests 列表、CFG 視圖。 -->
---

## 工具：Requirements 卡

![w:1050](../assets/slides/testgen-requirements.png)

- 每筆顯示：requirement id、feasible/infeasible 標籤、代表性 witness（具體呼叫）
- 點擊後在 CFG 高亮該 requirement 的節點/邊

<!-- Requirements 卡列出所有覆蓋需求（node/edge/path/clause）。點擊需求高亮 CFG，並顯示哪個測試覆蓋它。 -->
---

## 工具：Minimal Tests 卡

![w:1050](../assets/slides/testgen-tests.png)

- 每筆顯示：測試編號 T₁/T₂/…、path id、具體呼叫 + 預期回傳值、covers 清單
- 點擊後在 CFG 高亮該測試的完整執行路徑

<!-- Minimal Tests 卡列出 Greedy Set Cover 選出的最少測試集。每個測試顯示它覆蓋了哪些 requirement。 -->
---

## 工具：CFG 互動

![w:1050](../assets/slides/testgen-cfg.png)

- 左側 CFG 與右側 requirements/tests 雙向連動
- 選 requirement → 高亮該 requirement 涵蓋的節點/邊（藍色加粗）
- 選 test → 高亮整條執行路徑（橘色加粗）
- 縮放按鈕 `+/−/100%` 可調整 CFG 大小

<!-- 點擊 requirement 或 test，CFG 同步高亮相關的 node/edge/path。幫助學生建立準則和程式結構的視覺連結。 -->
---

## 範例：abs(x) + Edge Coverage

```js
function abs(x) {
  if (x < 0) { return -x; }
  return x;
}
```

Edge Coverage requirements：
- `E1: entry → if-node`（任何輸入都滿足）
- `E2: if-node → return-x` (x < 0)
- `E3: if-node → return-neg-x` (x ≥ 0)
- `E4: return-x → exit`
- `E5: return-neg-x → exit`

→ 最小測試集 T = { `abs(-1)`, `abs(1)` }（2 個測試覆蓋 5 條邊）

<!-- abs(x) 是最簡單的示範：只有兩條 edge，需要兩個測試（x>0 和 x<=0）。 -->
---

## 範例：triangle + Prime Path Coverage

Triangle Classifier `classify(a, b, c)` 有 7–8 條 prime paths。

Symbolic execution 在符號空間求解每條路徑條件，例如：
- 路徑 `a==b && b==c` → witness `(1, 1, 1)` → `classify(1,1,1)` = `"Equilateral"`
- 路徑 `a+b <= c` → witness `(1, 1, 3)` → `classify(1,1,3)` = `"Not a triangle"`

Greedy set cover 選出最少測試涵蓋全部可行路徑。

<!-- Triangle 有多條 prime path，需要的測試集明顯比 edge coverage 大。這展示了準則強度的影響。 -->
---

## Infeasible Requirements

```
requirement:  E3 (path: n1 → n2 → n3 → n5 with x > 0 && x < 0)
symbolic:     no witness found within depth limit
status:       infeasible
```

- Infeasible 的 requirement 在 UI 中以**紅色邊框**標示，不計入最小測試集
- 常見原因：
  - 路徑條件矛盾（`x > 0 && x < 0`）
  - 超過 symbolic execution 的深度上限（bounded search）

> 提示：depth limit 可透過 `symbexOptions.maxDepth` 調高，但測試數會指數成長。

<!-- 有些需求對應的路徑在程式語意上不可達（infeasible）。工具用紅色標示這些需求，並跳過它們。 -->
---

## 與 #10/#11 的差異

| 面向 | #10 Symbolic Exec | #11 Concolic Exec | **#12 Test Generation** |
| --- | --- | --- | --- |
| 目標 | 枚舉**所有可行路徑** | 系統性地**翻轉分支** | 找到**覆蓋所有 requirements 的最小測試集** |
| 輸入 | source code | source code | source code + **coverage criterion** |
| 輸出 | path list + witnesses | iteration list + witnesses | **minimal test set** + coverage report |
| 使用場景 | 完整路徑分析 | 自動引導測試 | 直接對接 test runner |

<!-- Symbex/Concolic 用約束求解找輸入；本工具用 brute-force 整數格點搜尋。前者更強大，後者更直觀易解釋。 -->
---

## 程式設計重點

```js
// testGeneration.js (簡化)
export function generateTestsFromCoverage({ sourceCode, criterion }) {
  const { cfg, dfg } = programToGraph(sourceCode);
  const requirements = getCoverageRequirements(cfg, dfg, criterion);
  const { paths: witnessedPaths } = symbolicExecute(cfg, sourceCode);
  const requirementCoverage = requirements.map((req) => {
    const covered = witnessedPaths.find((p) =>
      requirementCoveredByRecord(req, { nodes: p.cfgNodes, edges: p.cfgEdges })
    );
    return { requirement: req, feasible: !!covered, witness: covered?.witness };
  });
  const selectedTests = greedySetCover(witnessedPaths, requirementCoverage);
  return { requirements, requirementCoverage, selectedTests, ... };
}
```

<!-- 工具的核心挑戰：如何把 coverage requirement（抽象路徑）轉化為具體的輸入值（整數組合）。 -->
---

## 小結

- **Test Generation from Coverage** = requirements（#3/#4）+ witnesses（#10）+ greedy cover
- 把「應該測什麼」自動轉成「用這幾組輸入測試」
- Infeasible requirements 自動排除，不拖累測試集
- 工具支援 8 個準則，涵蓋 Graph Coverage 與 Data Flow Coverage 全部類別
- 輸出即「測試規格」：可直接貼到 Jest / Pytest 等框架執行

<!-- 本講把前面的「定義準則」轉化為「自動化生成」。目標是讓學生理解：覆蓋準則不只是評量指標，也是生成測試的規格。 -->
---

## 課堂練習

1. 開 `abs(x)` + Edge Coverage。最小測試集有幾個測試？手算是否一致？
2. 換 `triangle-classifier` + Prime Path Coverage。哪幾個 requirement 是 infeasible？為什麼？
3. 比較 Edge Coverage 與 All-Uses 的最小測試集數量。哪個需要更多測試？
4. 在 Source 編輯器中加一個新分支（例如 `if (x === 0) return 0;`），觀察 requirements 與 tests 如何變化。
5. 改成 All-DU-Paths + `max3(a, b, c)`，數出需要幾組測試才能覆蓋全部可行需求。

<!-- 練習 1（觀察不同準則的測試集大小）最直觀。練習 3（修改程式觀察 CFG 和需求的變化）適合作互動演示。 -->
---

## 進一步閱讀

- Ammann & Offutt, *Introduction to Software Testing* §3–§4（coverage criteria）
- King, *Symbolic Execution and Program Testing*（1976）
- 本工具實作：
  - [src/utils/testGeneration.js](../../src/utils/testGeneration.js) — 完整流水線（197 行）
  - [src/utils/graphCoverage.js](../../src/utils/graphCoverage.js) — `requirementCoveredByRecord`（新 export）
  - [src/components/TestGenerationExplorer.js](../../src/components/TestGenerationExplorer.js) — UI（389 行）
- 完整規格：[docs/Specification.zh-TW.md §12](../Specification.zh-TW.md)
- 下一步 → **#12.2 Logic Coverage Binding**（把 clause → 程式變數，自動求 concrete inputs）

<!-- A&O §8 有 Test Path 的完整理論。工具的 Set Cover 實作在 src/utils/setCover.js。 -->
