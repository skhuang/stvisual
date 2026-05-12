---
marp: true
theme: default
paginate: true
size: 16:9
title: 軟體測試視覺化 #8 — Specification Mutation + SMV + Safety Monitor FSM
description: 對 Boolean 規格做 mutation；對應 7 個 SMV 模型；雙 FSM 顯示 killer assignments
lang: zh-TW
---

# Specification Mutation
### 對「規格」本身做突變 — 配上 SMV 範例與安全監視 FSM

軟體測試視覺化系列 #8
搭配工具：`/section-syntax → Specification Mutation`（[SpecMutationExplorer](../../src/components/SpecMutationExplorer.js) + [specMutation.js](../../src/utils/specMutation.js) + [specFsm.js](../../src/utils/specFsm.js)）

<!-- 本講是突變系列的終點站：把突變的對象從程式碼換成規格（predicate）和狀態機（FSM）。 -->
---

## 三講對照

| # | 突變對象 | Kill 條件 |
| --- | --- | --- |
| #6 Program Mutation | **程式碼** | 任一 test 輸出不同 |
| #7 Grammar/String Mutation | **grammar / 字串** | 語言歸屬翻轉 |
| **#8 Specification Mutation** | **規格 predicate** | 任一 assignment 評估值不同 |

> 觀念支點：把 predicate 視為待測「規格」，看真值表上有沒有 assignment 能區分它與 mutant。

<!-- 第 6 講突變「程式」，第 7 講突變「文法」，本講突變「規格（predicate）」和「狀態機（FSM）」。 -->
---

## Specification Mutation 是什麼？

**Ammann/Offutt §9.4** — 把 precondition / postcondition / loop invariant 視為布林規格：

```
原 predicate  P  ─┐
                   │ 套用 6 個結構性 mutation operators
                   ▼
                  P′  ──►  在 2^n 個 assignments 上跑
                              │
                              ▼
                  ┌─ ∃ a 使 P(a) ≠ P′(a)  → killed
                  └─ ∀ a P(a) = P′(a)    → equivalent
```

> 與 #6 不同：subject 是 **規格**而不是程式；assignments 取代了「test 集」。

<!-- 本講是突變系列的終點站：把突變的對象從程式碼換成規格（predicate）和狀態機（FSM）。 -->
---

## 6 個 Operators

[`SPEC_MUTATION_OPERATORS = ['ENF', 'BCR', 'CRR', 'LRO', 'UOI', 'MCR']`](../../src/utils/specMutation.js)

| Op | 全名 | 動作 |
| --- | --- | --- |
| `ENF` | Expression Negation Failure | 對整個 predicate 取反 |
| `BCR` | Boolean Constant Replacement | 把 clause 換成 `true` 或 `false` |
| `CRR` | Clause Reference Replacement | 把 clause 換成另一個 clause |
| `LRO` | Logical Operator Replacement | `&&` ↔ `\|\|` |
| `UOI` | Unary Operator Insertion | 在 clause 外加 NOT |
| `MCR` | Missing Clause Replacement | 從 `&&` 或 `\|\|` 刪掉一邊 |

> 與 #5 Logic Coverage **共用** `parsePredicate`：語法（`&& \|\| !` + juxtaposition + `+`）完全一致。

<!-- AOR/ROR/LCR/MOR/AOD/COD 是 specification mutation 的六個 operator。LCR（&&↔||）和 ROR（>↔>=）是最常見的。 -->
---

## 範例分類：basic vs SMV

工具上有兩個 segmented control 分類：

| 分類 | 用途 | 範例 |
| --- | --- | --- |
| `basic` | 教學起手式 | `guard`、`leap`、`triangle` |
| `smv` | 對應真實 SMV 模型 | `smv-mutex`、`smv-cruise`、`smv-sis`、`smv-train`、`smv-elevator`、`smv-garage`、`smv-wiper` |

> SMV 範例附完整 NuSMV 模組原始碼，按 `spec-smv-source` 摺疊區可展開。

<!-- basic operator 直接替換算子；SMV（Safety Monitor Violation）operator 則針對安全監控模式設計。 -->
---

## SMV 範例對照表

| id | 安全性 | predicate |
| --- | --- | --- |
| `smv-mutex` | 雙程序互斥 | `!(c1 && c2)` |
| `smv-cruise` | 巡航控制 | `!cruise \|\| (ignition && running && !brake)` |
| `smv-sis` | 安全注水（Parnas）| `(si && pressure && !override) \|\| (!si && (!pressure \|\| override))` |
| `smv-train` | 平交道控制 | `!train \|\| (gate && signal)` |
| `smv-elevator` | 電梯門 | `!moving \|\| !door` |
| `smv-garage` | 車庫門控制器 | `(!u \|\| !t) && (!d \|\| !o)` |
| `smv-wiper` | 雨刷控制 | `!w \|\| (i && (l \|\| h))` |

> 7 條皆從 NuSMV `INVARSPEC` 抽出，可在工具裡看原始 SMV 模組。

<!-- SMV 在形式驗證（formal verification）場景中特別重要，例如航空、汽車電子的安全規格。 -->
---

## 範例：`(a || b) && c` 對 6 個 operator

| Op | 一個典型 mutant | killer assignment |
| --- | --- | --- |
| ENF | `!((a \|\| b) && c)` | 任一 P=T 列 |
| BCR | `(true \|\| b) && c` | `a=F b=F c=T` 等 |
| CRR | `(a \|\| a) && c` | 任一 a≠b 且 c=T 列 |
| LRO | `(a && b) && c` | `a=F b=T c=T` |
| UOI | `(a \|\| !b) && c` | b=T 時翻轉 |
| MCR | `a && c` | `a=F b=T c=T` |

> 工具會列出每個位置展開後的全部 mutants（按 operator 分組）。

<!-- 讓學生手算每個 operator 對這個 predicate 的效果，再比對工具的 mutant 列表。 -->
---

## Kill 演算法

[`evaluateSpecMutants(parsed, mutants, tests)`](../../src/utils/specMutation.js)：

```js
const originalValues = tests.map(t => evaluateAst(parsed.ast, t));
mutants.map(m => {
  const killers = [];
  for (let i = 0; i < tests.length; i++) {
    const mutValue = evaluateAst(m.ast, tests[i]);
    if (mutValue !== originalValues[i])
      killers.push({ test: tests[i], orig: originalValues[i], mut: mutValue });
  }
  return { ...m, killed: killers.length > 0, killers };
});
```

預設 `tests = buildAssignmentSpace(clauses)` → 完整真值表。

<!-- kill 的條件：原始 predicate 和 mutant predicate 在某個輸入下輸出不同。測試集需要包含這樣的輸入。 -->
---

## Safety Monitor FSM

把 predicate 視為 **memoryless 安全監視器**：

```
       P=T (assignment)
       ┌───────────────┐
       ▼               │
   ┌───────┐         ┌─────────────┐
   │ SAFE  │◄────────┤  VIOLATION  │
   │ P=T   │  P=T    │  P=F        │
   └───┬───┘ assign  └──────▲──────┘
       │ P=F                │
       └─assignment────────┘
                 P=F
```

兩態：
- `SAFE` (P=T) — 規格成立
- `VIOLATION` (P=F) — 規格違反

四條轉移：兩自迴圈 + 兩雙向。

<!-- FSM（有限狀態機）是規格的另一種形式。工具同時展示 original FSM 和 mutant FSM 的並列對比。 -->
---

## 為什麼是 memoryless？

`buildMonitor(ast, clauses)`：
- 對完整 assignment space（$2^n$）evaluate predicate。
- 結果只分兩桶：`trueSet` / `falseSet`。
- 下個狀態只看新 assignment 的 P 值 → **與起點無關**。

所以教學上四條轉移簡化為：「新 assignment 算出 T → 進 SAFE；算出 F → 進 VIOLATION」。

<!-- 大多數 FSM 是無記憶的（memoryless）：下一狀態只取決於當前狀態和輸入，不記得歷史。 -->
---

## diff = killer set

[`diffMonitors(origAst, mutAst, clauses)`](../../src/utils/specFsm.js)：

```js
const flipped = [];
for (const a of assignments) {
  if (evaluateAst(origAst, a) !== evaluateAst(mutAst, a))
    flipped.push(a);
}
return flipped;
```

> `flipped` 就是 killer assignments — 雙 FSM 在這些 assignment 上「跑去不同的目標狀態」。
> 工具把這些轉移畫成**橘色虛線**。

<!-- 兩個 FSM 的差異集（diff）就是能殺死 FSM mutant 的測試集。工具直接計算並顯示這個差異。 -->
---

## 工具：總覽

![w:1000](../assets/slides/spec-overview.png)

- 上方 segmented control：`spec-category-row`（basic / smv）。
- 中段：範例按鈕（`data-spec-example`）+ 範例描述（`spec-example-caption`）。
- `spec-text` 是單行 predicate input（即時解析）；下方顯示 clauses 與 canonical 字串。

<!-- 工具分三區：左側是 predicate 輸入，中間是 mutant 列表，右側是 FSM 並列視圖。 -->
---

## 工具：mutants 與 score

![w:1000](../assets/slides/spec-mutants.png)

- 6 個 operator checkbox（預設 ENF / BCR / LRO / UOI）。
- `spec-mutant-list`：mutant 文字 / operator / killed 或 live。
- `spec-mutation-score`：killed / total（%）。
- 點任一 mutant → 右側顯示 killer assignments（如 `a=T b=F c=T`）。

<!-- 工具同時顯示 predicate mutant 和 FSM mutant 的 kill 狀態，以及整體 mutation score。 -->
---

## 工具：雙 FSM 並列

![w:1000](../assets/slides/spec-fsm.png)

- `spec-fsm-grid`：左是原 predicate，右是 selected mutant。
- 兩張各畫 SAFE / VIOLATION 二態 + 四條轉移。
- 轉移標籤格式：`P=T · {assignments}` 或 `N / 2^n assignments`（clauses > 4 時退化）。
- **橘色虛線轉移 = killer**：兩 FSM 在那些 assignment 上的目標狀態不同。

<!-- 並列視圖讓學生直接看出 original 和 mutant FSM 的差異在哪個狀態轉換。 -->
---

## 工具：SMV 原始碼

![w:1000](../assets/slides/spec-smv-source.png)

- 選 `smv` 分類 + 任一範例 → 上方多一個 `spec-smv-source` 摺疊區。
- 顯示完整 NuSMV 模組（MODULE / VAR / ASSIGN / INVARSPEC ...）。
- 教學脈絡：先看 NuSMV invariant → 再看抽成 Boolean predicate 後做 mutation → 對應的 SAFE/VIOLATION FSM。

<!-- 工具展示 SMV 格式的規格，讓學生理解形式驗證工具（如 NuSMV）如何解讀這些規格。 -->
---

## 持久化

| 儲存 | Key | 內容 |
| --- | --- | --- |
| `localStorage` | `stvisual.specMutation.v1` | `{ category, exampleId, text, operators, ... }` |

行為：
- predicate、operator 集合、選擇的範例與分類都會保存。
- 不同於 Logic Coverage / Mutation Test，**SpecMutation 目前不接 Firestore** — 未來可擴充。

<!-- 工具儲存最近的 predicate 和 FSM，方便跨 session 繼續工作。 -->
---

## 演算法總覽

| 模組 | 函式 | 用途 |
| --- | --- | --- |
| [`specMutation.js`](../../src/utils/specMutation.js) | `parsePredicate` (re-export from logicCoverage) | 解析 predicate |
| | `generateSpecMutants(parsed, opIds)` | 套 6 個 operator 列舉 mutants |
| | `evaluateSpecMutants(parsed, mutants, tests)` | 計算 killed / killers |
| | `buildAssignmentSpace(clauses)` | 完整真值表 |
| [`specFsm.js`](../../src/utils/specFsm.js) | `buildMonitor(ast, clauses)` | 兩桶分類 trueSet / falseSet |
| | `diffMonitors(origAst, mutAst, clauses)` | 取出 killer set |
| | `renderMonitorSvg(opts)` | 輸出 280×200 SVG |

<!-- predicate mutation 用 AST 替換算子；FSM mutation 用狀態轉換表的增刪改；diff 計算用 BFS。 -->
---

## 與其他章節的關聯

| 連結 | 用途 |
| --- | --- |
| #5 Logic Coverage | 共用 `parsePredicate` / `evaluateAst` — 同樣的 Boolean DSL |
| #6 Program Mutation | 同樣「變壞 → 測試該抓到」心智模型，subject 不同 |
| #4 Data Flow | 無直接關聯（資料流 vs 規格邏輯） |
| Spec §14 / §16 | 完整實作說明 |

> 課程結尾的「合題」：六、七、八三講把 mutation 的 subject 從**程式**走到**規格 / 文法 / 字串**，覆蓋 Ammann/Offutt §9 全章。

<!-- Specification Mutation 連接形式驗證（§16）和 Logic Coverage（§4–5）。這是課程中「最理論」的一講。 -->
---

## 小結

- **6 個 operators**（ENF / BCR / CRR / LRO / UOI / MCR）對 Boolean 規格做結構性突變。
- Kill 用完整 $2^n$ 真值表，無需測試集 — 直接看「哪個 assignment 在 original 與 mutant 評估出不同值」。
- **Safety Monitor FSM** 把 predicate 具象化為兩態自動機，雙 FSM 並列直接看出 killer assignments。
- **7 個 SMV 範例**串起教科書與真實模型檢驗 — 從 cruise control 到車庫門皆有對應。

<!-- Specification Mutation 讓我們測試「規格本身」是否足夠精確。一個好的測試集應該能殺死所有非等價的規格 mutant。 -->
---

## 課堂練習

1. 開 `(a || b) && c`，只啟用 `MCR`，列出 mutants 與 killer assignments。哪個 mutant 是 equivalent？
2. 切到 `smv-mutex`（`!(c1 && c2)`），對 ENF / LRO 觀察 mutation score 有何差？為什麼 ENF 一定被殺？
3. 雙 FSM 視圖中找一條 killer 轉移：把它對應到真值表的哪一列？並驗證在 original 與 mutant 上預測子值的確不同。
4. 寫一個你自己的 invariant（≤ 4 clauses），全開 6 個 operator，估算「會出現多少 equivalent mutants」並用工具驗證。

<!-- 練習 1（手算 LCR mutant）最基本。練習 3（FSM diff）適合有自動機基礎的學生。 -->
---

## 進一步閱讀

- Ammann & Offutt, *Introduction to Software Testing*, Ch. 9.4–9.5（Specification Mutation / SMV）
- NuSMV：<https://nusmv.fbk.eu/> — Symbolic Model Verifier
- 工具實作：
  - [src/utils/specMutation.js](../../src/utils/specMutation.js) — 6 個 operator + 評估
  - [src/utils/specFsm.js](../../src/utils/specFsm.js) — 安全監視 FSM 渲染
  - [src/components/SpecMutationExplorer.js](../../src/components/SpecMutationExplorer.js) — UI（含 SMV 摺疊區、雙 FSM）
- 規格文件 §14 / §16：[docs/Specification.zh-TW.md](../Specification.zh-TW.md)
- 本系列結尾 — 完整課程目錄請見 [docs/slides/](../slides/)
