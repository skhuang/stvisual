---
marp: true
theme: default
paginate: true
size: 16:9
title: 軟體測試視覺化 #7 — Grammar-Based Testing + Mutation on Strings
description: BNF 文法、Production / Terminal 覆蓋、Grammar Mutation（TR/PR/SD/DUP）、String Mutation（REP/DEL/DUP/INS/SWP）
lang: zh-TW
---

# Grammar-Based Testing
### 從文法到測資、從文法到突變

軟體測試視覺化系列 #7
搭配工具：`/section-syntax → Grammar Coverage`（[GrammarCoverageExplorer](../../src/components/GrammarCoverageExplorer.js) + [grammar.js](../../src/utils/grammar.js)）

<!-- 本講把「文法」當作測試的 subject，不是測試的工具。文法定義合法輸入的結構，覆蓋準則要求生成覆蓋文法的測試案例。 -->
---

## 為什麼是 Grammar-Based Testing？

很多輸入是 **structured strings**：
- 配置檔（JSON / YAML / TOML）
- 查詢語言（SQL / GraphQL）
- DSL（regex、Markdown、shell command-line）

> 用 grammar 生測資 → 同時逼出**語法錯誤偵測**與**正向流暢路徑**。
> 用 grammar 變異 → 測**規格本身**寫得夠不夠精確。

<!-- 本講把「文法」當作測試的 subject，不是測試的工具。文法定義合法輸入的結構，覆蓋準則要求生成覆蓋文法的測試案例。 -->
---

## 兩條教學主線

| 主線 | 對象 | 突變對象 |
| --- | --- | --- |
| **Grammar Coverage** | 用 BNF 生合法字串 | — |
| **Grammar Mutation** | 改 grammar 本身 | grammar |
| **Mutation on Strings** | 改 grammar 生出的合法字串 | 字串 |

三者共用同一個工具卡片，靠分頁切換（`grammar-subtab-row`）。

<!-- 本講同時涵蓋 Grammar Coverage（測覆蓋 BNF）和 String Mutation（突變字串找邊界）。兩條主線互補。 -->
---

## BNF 速覽

```
<E> ::= <E> "+" <T> | <T>
<T> ::= <T> "*" <F> | <F>
<F> ::= "(" <E> ")" | <D>
<D> ::= "0" | "1" | "2"
```

| 符號 | 意義 |
| --- | --- |
| `<X>` | 非終端 (non-terminal) |
| `"x"` | 終端 (terminal) — 字串字面值 |
| `\|` | alternative |
| `#` / `//` | 註解（工具支援） |

> 工具的 BNF parser：`parseGrammar(text)`，產出 `{ rules, productions, terminals, start }`。

<!-- BNF 的 `::=`、`|`、`*`、`+` 語法是文法測試的語言。工具接受標準 BNF 格式，自動推導。 -->
---

## 內建文法

| id | 名稱 | 主要終端 |
| --- | --- | --- |
| `arith` | 算術運算式 | `+`、`*`、`(`、`)`、`0`、`1`、`2` |
| `json-tiny` | 迷你 JSON | `{`、`}`、`[`、`]`、`:`、`,`、`"a"`、`"b"`、`0`、`1` |
| `palindrome` | a/b 回文 | `a`、`b` |

> 三個都刻意做小（≤ 10 productions），讓 derivation 與 mutation 的視覺密度可控。

<!-- 工具有三個內建文法（arithmetic、URL、JSON）。讓學生先試 arithmetic，觀察 derivation 樹狀展開。 -->
---

## Derivation：BFS 左推導

`generateDerivations(grammar, { maxStrings, maxDepth, maxStringLen })`：

1. 從 `start` 出發。
2. 每步：把句型最左邊的 non-terminal 換成它的某個 production。
3. 達到「全是 terminal」 → 成功 derivation。
4. 限制：字串數、深度、字串長度三個上限避免爆炸。

回傳 `[{ string, productionsUsed, depth }]`。

<!-- BFS 左推導保證最短推導先出現。這讓工具能在合理時間內找到滿足覆蓋準則的最少測試集。 -->
---

## 兩條覆蓋指標

| id | 名稱 | 定義 |
| --- | --- | --- |
| **PDC** | Production Coverage | 每條 production 都至少被某個 derivation 用過 |
| **TSC** | Terminal Symbol Coverage | 每個 terminal 都至少出現在某個 derivation 中 |

> 工具會把 covered production 標綠（`grammar-prod covered`）、covered terminal 籌碼變色。
> 顯示為 `covered / all (ratio%)`。

<!-- PDC（Production Coverage）要求每個產生式至少用一次；TSC（Terminal Symbol Coverage）要求每個終端符號至少出現一次。 -->
---

## 工具：總覽

![w:1000](../assets/slides/grammar-overview.png)

- 範例 chips：`grammar-example=arith / json-tiny / palindrome`。
- `grammar-text` textarea 可手改 BNF；`grammar-parse-error` 即時報錯。
- 中段顯示所有 productions（編號 + 對應 RHS），下方是 terminals 籌碼。

<!-- 左側輸入文法，右側看 derivation 列表和覆蓋統計。讓學生先試預設文法，再換成自己寫的文法。 -->
---

## 工具：derivations + PDC / TSC

![w:1000](../assets/slides/grammar-derivations.png)

- 切到 `derivations` 分頁 → 列出衍生字串、深度、用到的 production 編號。
- 上方 `grammar-pdc` / `grammar-tsc` 即時更新 ratio。
- 可加 `grammar-extra-tests`（一行一個合法字串），讓你手動補測沒覆蓋到的 production。

<!-- 工具同步高亮哪些產生式被覆蓋（PDC）和哪些終端符號被覆蓋（TSC）。 -->
---

## Grammar Mutation：4 個 operators

[`GRAMMAR_OPERATORS = ['TR', 'PR', 'SD', 'DUP']`](../../src/utils/grammar.js)

| Op | 全名 | 動作 |
| --- | --- | --- |
| `TR` | Terminal Replacement | 把某個 terminal 換成另一個 terminal |
| `PR` | Production Replacement | 把某條 production 換成同 LHS 的另一條 |
| `SD` | Symbol Deletion | 從 production RHS 刪一個符號 |
| `DUP` | Symbol Duplication | 把 RHS 某個符號重複一次 |

> 這是 grammar 層級的「突變」— 變的是規則本身，**不是字串**。

<!-- operator 針對文法本身：替換、刪除、插入非終端、修改量詞。這些 mutant 模擬「文法錯誤」。 -->
---

## Kill criterion（Grammar Mutation）

對某 mutant grammar `G′`：
- 取一組「課堂測試字串」（derivations + 使用者加的 extra tests）
- 在原 G 和 mutant G′ 上都跑 `recognizes(...)` 識別
- 任一字串「在 G 接受、在 G′ 不接受」或反之 → mutant **killed**

`evaluateMutantsAgainstStrings(orig, mutants, strings)` 一次跑完。

<!-- 如果測試案例能接受 original grammar 生成的字串但拒絕 mutant grammar 生成的字串（或反之），則 mutant 被殺死。 -->
---

## 工具：grammar mutants

![w:1000](../assets/slides/grammar-mutants.png)

- 4 個 operator checkbox：`data-grammar-op=TR/PR/SD/DUP`。
- 上方 `grammar-mutation-score` 顯示 killed / total。
- 列表中每個 mutant：操作描述、killed/live、（若 killed）區分性字串。

> 教學脈絡：**很多 mutant 仍 live → grammar 描述太寬鬆**，可以提示學生加 production 或縮 terminal。

<!-- 工具列出所有 grammar mutant 和它們的 kill 狀態。可以問學生：哪種 operator 的 mutant 最難被殺死？ -->
---

## 接到 Strings：Mutation on Strings（§9.2 Ammann/Offutt）

換個視角：**保留 grammar，變字串。**

```
取一個合法 seed string  s
                │
                │ 套用 5 個字元層級 operators
                ▼
              s′
                │
                │ 用同一個 recognizer 判定
                ▼
          ┌─ s′ 仍合法 → positive test
          └─ s′ 不合法 → negative test
```

<!-- String Mutation 是字串層次的突變測試，不修改文法，而是修改單個字串輸入，尋找邊界情況。 -->
---

## 5 個 String Mutation Operators

[`STRING_MUTATION_OPERATORS = ['REP','DEL','DUP','INS','SWP']`](../../src/utils/grammar.js)

| Op | 動作 |
| --- | --- |
| `REP` | 換某位置字元為 alphabet 中其他字元 |
| `DEL` | 刪除一個字元 |
| `DUP` | 重複一個字元 |
| `INS` | 在某位置插入 alphabet 中的字元 |
| `SWP` | 交換兩個相鄰且不同的字元 |

> Alphabet 由 `deriveAlphabet(grammar, derivations)` 自 grammar 的所有 terminal 拆字 + derivation 出現過的字元取聯集。

<!-- AOR/LCR/SOR/UOI/COR 在字串層次有對應版本：插入、刪除、替換字元等。 -->
---

## 為什麼分 positive / negative？

| kind | 用途 |
| --- | --- |
| **positive** | parser happy path 的壓力測試（仍是合法輸入） |
| **negative** | parser 的錯誤處理路徑（變後**不**合法） |

`classifyStringMutants(grammar, mutants)`：
- `origAccepts` 一定是 `true`（seed 必合法）
- `mutAccepts === (kind === 'positive')`
- `flipped` 旗標 → kind === 'negative'

<!-- positive test 應該通過（文法正確的輸入），negative test 應該失敗（故意錯誤的輸入）。兩種都要設計。 -->
---

## 工具：string mutation

![w:1000](../assets/slides/grammar-string-mutants.png)

- 種子下拉：列出目前 derivations，挑一個合法字串。
- 5 個 operator checkbox（預設 REP / DEL）+ 每 operator 最大數欄位（1–50）。
- `grammar-string-mutant-table`：Op / Mutated / Result（綠勾＝in language、紅叉＝not in language）。
- `grammar-string-stats`：positive / negative 數量。

<!-- 工具的 string mutant 列表同時顯示 positive/negative 分類，方便學生確認每個 mutant 的預期行為。 -->
---

## 演算法窺探

[`grammar.js`](../../src/utils/grammar.js) 的關鍵函式：

1. `parseGrammar(text)` — BNF parser。
2. `generateDerivations(g, opts)` — 左推導 BFS，三個上限避免發散。
3. `computeCoverage(derivations, grammar)` — PDC / TSC 計算。
4. `recognizes(grammar, input)` — 教學用遞迴下降識別器（memoised，深度上限）。
5. `generateGrammarMutants` + `evaluateMutantsAgainstStrings`。
6. `generateStringMutants` + `classifyStringMutants` + `deriveAlphabet`。

<!-- BFS 推導用遞迴展開 + 去重複。Grammar mutation 是對 AST（文法樹）做 operator 替換。 -->
---

## 從雲端載入 grammar

工具透過跨元件事件接 Cloud Storage 上傳的檔案：

```js
window.dispatchEvent(new CustomEvent('stvisual:load-program-source', {
  detail: { target: 'grammar', name, content }
}));
```

- CloudStoragePanel 為每個 Drive 檔案多一顆 **Use for Grammar Coverage** 按鈕。
- 按下後：捲動到 syntax 區塊、切到 `grammar` 子分頁、建立 `uploaded-grammar-<ts>` 範例。
- 之後 BNF / derivations / mutants 全部即時重算。

<!-- 雲端載入功能讓學生可以共享自定義文法。適合分組作業：每組設計一個文法，互相測試。 -->
---

## 小結

- 三個層次堆疊：
  1. **Grammar Coverage**：PDC / TSC 兩條客觀指標
  2. **Grammar Mutation**：4 個 operators 變規則，看測試集是否敏感
  3. **String Mutation**：5 個 char-level operators 變字串，產出 positive / negative tests
- 同一個 grammar 串起三層：改一處 BNF → 衍生字串、覆蓋、mutants 全部即時重算。
- 跟 #6 Program Mutation 的核心心智模型一致：**「變壞 → 測試集該抓到」**，只是 subject 換成 grammar / string。

<!-- 文法既是測試輸入的規格，也可以是測試的 subject。PDC/TSC 幫助確保文法的所有「路徑」都被測試。 -->
---

## 課堂練習

1. 在 `arith` 文法下，把 `maxStrings` 從預設值降到 4。觀察 PDC 與 TSC 哪個先掉？為什麼？
2. 對 `palindrome` 啟用 `SD`（symbol deletion）。哪些 mutant 仍是合法 grammar？哪些變成什麼都不接受？
3. 切到 `Mutation on Strings`，挑 `aba` 為 seed、只開 `SWP`。能不能產出 negative test？為什麼？
4. 在 `json-tiny` 啟用 `INS`，看 INS 把 `{` 或 `,` 插到不該的位置時，是否變 negative test？

<!-- 練習 1（手工推導）是最基本的技能。練習 3（JSON 文法覆蓋）適合作進階作業。 -->
---

## 進一步閱讀

- Ammann & Offutt, *Introduction to Software Testing*, Ch. 9.1–9.2（Grammar-Based Testing / Mutation on Ground Strings）
- 工具實作：
  - [src/utils/grammar.js](../../src/utils/grammar.js) — BNF parser、derivation、coverage、grammar mutation、string mutation
  - [src/data/grammarData.js](../../src/data/grammarData.js) — 3 個內建文法
  - [src/components/GrammarCoverageExplorer.js](../../src/components/GrammarCoverageExplorer.js) — UI（含子分頁）
- 規格文件 §12 / §13：[docs/Specification.zh-TW.md](../Specification.zh-TW.md)
- 下一講 → **#8 Specification Mutation + SMV + Safety Monitor FSM**
