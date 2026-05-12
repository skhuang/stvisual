---
marp: true
theme: default
paginate: true
size: 16:9
title: 軟體測試視覺化 #6 — Syntax-Based Testing: Program Mutation
description: Program Mutation 視覺化：15 個 operators、mutation score、6 個內建範例
lang: zh-TW
---

# Program Mutation
### Syntax-Based Testing 之一：把程式碼變壞，看你的測試集挑不挑得出來

軟體測試視覺化系列 #6
搭配工具：`/section-syntax → Program Mutation`（[SyntaxCoverageExplorer](../../src/components/SyntaxCoverageExplorer.js) + [mutation.js](../../src/utils/mutation.js)）

<!-- 本講換個視角：不測「程式」，而是測「測試集」有多強。Mutation score 是一個客觀的測試品質指標。 -->
---

## 換個視角：測「測試」

| 前面五講 | 本講 |
| --- | --- |
| 測「程式有沒有覆蓋到」 | 測「**測試集有沒有偵錯能力**」 |
| Bug 找出來，但測試足夠嗎？ | 給程式注入小錯誤，看測試能否抓出來 |
| 對象：程式 | 對象：**測試集** |

> 觀念支點：好的測試集要能殺死大量「合理但錯誤」的程式變體。

<!-- 傳統測試回答「程式對不對」，Mutation Testing 回答「我的測試好不好」。這是個元問題（meta-question）。 -->
---

## Mutation Testing 三步驟

```
原程式  P  ─┐
             │ 套用 mutation operator
             ▼
            P′  ──►  在 test set T 上跑
                       │
                       ▼
              ┌─ 任一 test 結果不同？ ──► killed ✅
              ├─ 全部 test 相同 ─────► live ❌
              └─ 人工標記為等價 ──► equivalent ⚪
```

> **Mutation Score** = killed ÷ (total − equivalent)

<!-- 三步驟：生成 mutants → 對每個 mutant 跑測試集 → 計算 mutation score。分子是 killed，分母是所有 mutants。 -->
---

## 為什麼是「killed」？

對某個 test `t` 與 mutant `P′`：

- `P(t) ≠ P′(t)` → t 殺死 P′
- `P(t) = P′(t)` 對所有 t → P′ 仍 live（測試力不足，或 P′ 是 equivalent）

教學重點：
- **Live mutants 是改進測試集的目標** — 想想看為什麼 t 沒抓到。
- **Equivalent mutants 無解** — 屬於 undecidable，必須人工標記。

<!-- killed 意味著測試集至少有一個測試能區分 mutant 和原始程式。這就是測試集「殺死」mutant 的意思。 -->
---

## 15 個 Operators（Procedural 11 個）

| Op | 全名 | 動作 |
| --- | --- | --- |
| AOR | Arithmetic Operator Replacement | `+ - * / %` 互換 |
| ROR | Relational Operator Replacement | `< <= > >= == != === !==` 互換 |
| LOR | Logical Operator Replacement | `&&` ↔ `\|\|` |
| COR | Conditional Operator Replacement | （同 LOR 集合） |
| SOR | Shift Operator Replacement | `<<` `>>` `>>>` 互換 |
| ASR | Assignment Operator Replacement | `+= -= *= /= %= …` 互換 |
| UOI | Unary Operator Insertion | 在識別字前加 `!` 或 `-` |
| UOD | Unary Operator Deletion | 刪除 `! - + ~` |
| SVR | Scalar Variable Replacement | 同 scope 識別字互換 |
| BSR | Bomb Statement Replacement | 整行換成 `throw` |
| ABS | Absolute Value Insertion | 把 `x` 包成 `Math.abs(x)` / `-(x)` |

<!-- AOR（算術替換）和 ROR（關係替換）是最常見的 operator，也是最容易手算的。 -->
---

## 15 個 Operators（Object-Oriented 4 個）

| Op | 全名 | 動作 |
| --- | --- | --- |
| JTD | OO: `this` Deletion | 刪除 `this.` 前綴 |
| ISD | OO: `super` Call Deletion | 把 `super(...)` 換成 `undefined` |
| IOD | OO: Overriding Method Deletion | 刪除子類覆寫方法，fallback 到父類 |
| PRV | OO: Reference Type Change | `new ClassA(...)` → 其他 class，例如 `new ClassB(...)` |

> OO 算子需要 `class` 範例才會生效；工具內建 `shapeHierarchy`（Square / Circle 繼承 Shape）演示。

<!-- OO operator 針對類別繼承和多型，在 Java/C++ 程式中特別重要。本工具目前實作 11 個 procedural operator。 -->
---

## 教科書範例：AOR on max(a, b)

```js
function max(a, b) {
  if (a > b) return a;       // AOR：沒有算術 → 跳過
  return b;
}
```

測試集：
```js
[3,5]→5  [7,2]→7  [4,4]→4  [-1,-3]→-1
```

- 對 max() AOR 無法產生 mutants（沒有 `+ - * / %`）。
- 改 ROR 才有戲：`a > b` 可變成 `a >= b` / `a < b` / `a == b` ...

<!-- 手算時，把 a + b 換成 a - b、a * b 等，問學生哪個 mutant 最容易被殺死。 -->
---

## 教科書範例：ROR on max(a, b)

| Mutant | 表達式 | 在 t₃=[4,4] 的行為 |
| --- | --- | --- |
| 原 | `a > b` | 不取，回 `b=4` |
| `a >= b` | 取，回 `a=4` | 一樣是 4 |
| `a < b` | 不取，回 `b=4` | 一樣是 4 |
| `a === b` | 取，回 `a=4` | 一樣是 4 |

- t₃ 太弱 — 在 `a=b` 時看不出差別。
- 加一個 t₅=[5,5]→5 也救不了：本來就只看回傳值。
- **需要一個「a 與 b 不同且只有一邊符合」的 test** 才能殺死所有 ROR mutants。

<!-- a > b 換成 a >= b 是最微妙的 ROR mutant——只有在 a == b 時才有差異，測試集需要包含這個邊界情況。 -->
---

## Equivalent Mutant：難解的部分

```js
function isZero(x) {
  return x === 0;          // 原
}
function isZero(x) {       // mutant: UOI 插入 -
  return -x === 0;
}
```

- 因為 `-0 === 0` 為真 → 對所有 x，兩支函式行為一致。
- 任何測試都殺不死它 → **equivalent mutant**。
- 工具提供「mark as equivalent」按鈕，把它從分母拿掉，讓 mutation score 不被誤判為「未達 100%」。

<!-- Equivalent mutant 是 mutation testing 最大的挑戰——無論如何跑測試，它都不會被殺死，因為它和原始程式語意上等價。 -->
---

## 工具：總覽

![w:1000](../assets/slides/mutation-overview.png)

- 內建範例：`syntax-example-{max, isLeapYear, triangle, shapeHierarchy, nextDate, nextWeek}`。
- `syntax-operators` 是 15 顆按鈕，可多選。
- `syntax-params` / `syntax-body` 直接編輯程式；`syntax-test-table` 編輯測試集。

<!-- 工具左側是程式輸入和測試集，右側是 mutant 列表和 killed/alive 統計。建議讓學生先看 summary 數字。 -->
---

## 工具：執行流程

每次改 program / tests / operators，內部三步：

1. **compile**：把 `params` + `body` 包成 `new Function(params, body)`，跑一次驗證能用。
2. **mutate**：對 AST / token 序列套 15 個 operators，列出所有候選 mutants。
3. **evaluate**：每個 mutant 都在測試集跑一遍，比對 `expected` → 標記 killed / live。

> 全部在瀏覽器內完成（Worker 不必要 — JS 函式呼叫很便宜）。

<!-- 點 "Run Mutation" 後工具會依序：解析程式 → 生成所有 mutant → 對每個 mutant 跑所有測試 → 計算 score。 -->
---

## 工具：mutants 列表

![w:1000](../assets/slides/mutation-mutant-list.png)

- 依 operator 分組（`syntax-mutant-group-{op}`），killed 綠、live 紅、equivalent 灰。
- 每筆顯示 `L<行>:<列>`、`original → mutated` 的對照。
- 點任一 mutant → 右側 `syntax-mutant-detail` 顯示完整變更後 source 與殺手測試 id。

<!-- 每個 mutant 可以點開看 diff——哪一個 operator 在哪個 token 上做了什麼替換。 -->
---

## 工具：per-test 結果

![w:1000](../assets/slides/mutation-per-test.png)

- 選中某 mutant 後，`syntax-test-table` 為每列加上**該 mutant 的實際輸出**。
- 殺死 mutant 的列高亮紅色，沒殺到的列灰階。
- 教學心得：直接看出「為什麼這個 test 沒抓到」。

<!-- 在 mutant 詳細頁可以看哪些測試殺死了它、哪些沒有。這幫助學生理解為什麼某個測試比另一個強。 -->
---

## OO 演示：shapeHierarchy

```js
class Shape { area() { return 0; } describe() { return 'shape:' + this.area(); } }
class Square extends Shape { constructor(s){ super(); this.s=s; } area(){ return this.s*this.s; } }
class Circle extends Shape { constructor(r){ super(); this.r=r; } area(){ return this.r*this.r*3; } }
```

| Operator | 觸發樣態 |
| --- | --- |
| `JTD` | `this.area()` → `area()`（ReferenceError） |
| `IOD` | 刪掉 `Square.area()`，fallback 父類 → 都回 0 |
| `ISD` | `super()` → `undefined`，破壞繼承初始化 |
| `PRV` | `new Square(s)` → `new Circle(s)` |

<!-- shapeHierarchy 範例展示 OO mutation：把子類別實例替換、修改多型呼叫等。適合有物件導向背景的學生。 -->
---

## 持久化：test set 與 cloud sync

| 儲存 | Key | 內容 |
| --- | --- | --- |
| `localStorage` | `stvisual.syntax.<exampleId>` | 該範例的 params / body / tests |
| Firestore | `users/{uid}/settings/syntax.<exampleId>` | 同上，附 `updatedAt` |

行為：
- 未登入 → 只寫 localStorage。
- 登入後 → debounced 寫 Firestore；面板有 `syntax-cloud-reload` 手動重抓。
- `pagehide` 時觸發最後一次 flush，避免關掉分頁丟資料。

<!-- 工具支援雲端同步測試集，方便課堂上學生共用同一份 mutant 清單討論。 -->
---

## 演算法窺探：mutate pipeline

[`mutation.js`](../../src/utils/mutation.js) 的核心：

1. **tokenize** `body`（regex-based，保留位置資訊）。
2. **find candidates**：每個 operator 都有 `match(token)` + `mutate(token)`。
3. **產生 mutant id** = `<op>:<line>:<col>:<seq>`，避免同位置重複。
4. **deduplicate**：用 `<op>|<text>` 去重（同變更只留一個）。

> OO operators（JTD/ISD/IOD/PRV）走 source-level pattern matching，因為 class structure 用 regex 比 token 容易。

<!-- AST 轉換是生成 mutant 的核心技術。工具對每個 operator 都有對應的 AST visitor。 -->
---

## 常見陷阱

1. **Equivalent mutants 太多**：尤其 `UOI` (`!a` vs `!!a`)、`ABS` 在常數上 → 養成「先看 live、再標 equivalent」的習慣。
2. **`BSR` 容易掩蓋細節**：整行 throw 一定被殺，分母虛胖。可以先關掉 `BSR` 評估 baseline。
3. **昂貴測試**：複雜 mutant × 大測試集 → O(M × T)。內建範例小到可即時跑；自己上傳時請保持測試 < 50 筆。
4. **Cloud race**：debounce 與 reload 同時觸發 → 工具會以「最後 successful write」勝出；若有疑慮按 `syntax-reload-btn`。

<!-- Coverage 高 ≠ Mutation score 高。可以舉例：coverage 100% 但測試只斷言不崩潰，mutation score 可能很低。 -->
---

## 小結

- Program Mutation 透過 **「程式變壞 → 測試該抓到」** 來度量測試品質。
- 工具支援 **15 個 operators**（11 procedural + 4 OO），多選互不干擾。
- Mutation score 顯示 killed / total（可扣除 equivalent）— 是測試集的單一健康指標。
- 同時提供 **per-mutant** 與 **per-test** 兩個視角 — 找出「哪個 mutant 沒殺」與「哪個 test 沒貢獻」。

<!-- Mutation score 是測試集強度的客觀衡量指標。目標不是 100%（equivalent mutants 做不到），而是接近 80–90%。 -->
---

## 課堂練習

1. 在 `max` 範例下，**新增** 1 個 test，使 ROR 的所有 mutants 全部 killed。提示：選一個 `a ≠ b` 的 case。
2. 開 `isLeapYear`，記下 LOR 的 live 數；改 1 個 test 讓它降到 0。
3. 切到 `shapeHierarchy`，找出哪個 OO operator 最容易產生 equivalent mutants？為什麼？
4. 自寫一個短函式（≤ 10 行）上傳。看哪個 operator 對你的程式產生最多 mutants？

<!-- 練習 1（手算 AOR mutants）是最重要的基礎技能。練習 3（等價 mutant 判斷）適合進階學生。 -->
---

## 進一步閱讀

- Ammann & Offutt, *Introduction to Software Testing*, Ch. 9.2（Program Mutation）
- 工具實作：
  - [src/utils/mutation.js](../../src/utils/mutation.js) — 15 個 operator 的 token / source-level 邏輯
  - [src/data/mutationData.js](../../src/data/mutationData.js) — 6 個內建範例 + operator metadata
  - [src/components/SyntaxCoverageExplorer.js](../../src/components/SyntaxCoverageExplorer.js) — UI / cloud sync
- 規格文件 §11.2 / §17.3：[docs/Specification.zh-TW.md](../Specification.zh-TW.md)
- 下一講 → **#7 Grammar-Based Testing + Mutation on Strings**

<!-- A&O §11.2 有完整的 mutation operator 定義。PIT 是業界最常用的 Java mutation testing 工具。 -->
