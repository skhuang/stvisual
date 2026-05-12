# 軟體測試視覺化 — 課程簡報目錄

stvisual 課程共 **12 講**，每講皆有：
- **觀念**：定義 + subsumption / 演算法總覽
- **範例**：手算示範 + 教科書引用
- **工具演示**：對應的 testid、互動步驟、截圖
- **小結 + 課堂練習**
- **延伸閱讀**：對應規格章節與原始碼

所有簡報為 Marp Markdown，可一鍵轉 PPTX；截圖由 [scripts/capture-slide-screenshots.mjs](../../scripts/capture-slide-screenshots.mjs) 統一產生。

---

## 課程目錄

| # | 主題 | ZH | EN | 截圖 |
| --- | --- | --- | --- | --- |
| 1 | 課程概觀 & 測試方法分類 | [01-course-intro.zh-TW.md](01-course-intro.zh-TW.md) | [01-course-intro.en.md](01-course-intro.en.md) | methods-overview、methods-whitebox |
| 2 | 測試流程 & 測試金字塔 | [02-testing-flow-pyramid.zh-TW.md](02-testing-flow-pyramid.zh-TW.md) | [02-testing-flow-pyramid.en.md](02-testing-flow-pyramid.en.md) | flow-overview、pyramid-overview |
| 3 | Graph Coverage（結構性） | [03-graph-coverage.zh-TW.md](03-graph-coverage.zh-TW.md) | [03-graph-coverage.en.md](03-graph-coverage.en.md) | graph-coverage-node、edge、prime-path、metrics、triangle、editor |
| 4 | Data Flow Coverage | [04-data-flow-coverage.zh-TW.md](04-data-flow-coverage.zh-TW.md) | [04-data-flow-coverage.en.md](04-data-flow-coverage.en.md) | dfg-empty、triangle、all-defs、all-uses、all-du-paths |
| 5 | Logic Coverage（14 準則）| [05-logic-coverage.zh-TW.md](05-logic-coverage.zh-TW.md) | [05-logic-coverage.en.md](05-logic-coverage.en.md) | logic-overview、truth-table、cacc、ic-kmap、cutpnfp |
| 6 | Program Mutation（15 operators） | [06-program-mutation.zh-TW.md](06-program-mutation.zh-TW.md) | [06-program-mutation.en.md](06-program-mutation.en.md) | mutation-overview、mutant-list、per-test、shape-hierarchy |
| 7 | Grammar + String Mutation | [07-grammar-and-string-mutation.zh-TW.md](07-grammar-and-string-mutation.zh-TW.md) | [07-grammar-and-string-mutation.en.md](07-grammar-and-string-mutation.en.md) | grammar-overview、derivations、mutants、string-mutants |
| 8 | Specification Mutation + SMV + Safety Monitor FSM | [08-spec-mutation.zh-TW.md](08-spec-mutation.zh-TW.md) | [08-spec-mutation.en.md](08-spec-mutation.en.md) | spec-overview、mutants、fsm、smv-source |
| 9 | Fuzz Testing | [09-fuzz-testing.zh-TW.md](09-fuzz-testing.zh-TW.md) | [09-fuzz-testing.en.md](09-fuzz-testing.en.md) | fuzz-overview、fuzz-cfg |
| 10 | Symbolic Execution | [10-symbolic-execution.zh-TW.md](10-symbolic-execution.zh-TW.md) | [10-symbolic-execution.en.md](10-symbolic-execution.en.md) | symbex-overview、paths、cfg |
| 11 | Concolic Execution | [11-concolic-execution.zh-TW.md](11-concolic-execution.zh-TW.md) | [11-concolic-execution.en.md](11-concolic-execution.en.md) | concolic-overview、iters、cfg |
| 12 | Test Generation from Coverage | [12-test-generation.zh-TW.md](12-test-generation.zh-TW.md) | [12-test-generation.en.md](12-test-generation.en.md) | testgen-overview、requirements、tests、cfg |
| 13 | Logic Coverage Binding | [13-logic-binding.zh-TW.md](13-logic-binding.zh-TW.md) | [13-logic-binding.en.md](13-logic-binding.en.md) | binding-panel、binding-results |

---

## 學習依賴關係

```
   #1 課程概觀
       │
       ▼
   #2 測試流程
       │
       ├──► #3 Graph Coverage ──► #4 Data Flow Coverage
       │
       ├──► #5 Logic Coverage  ◄── 共用 parsePredicate ──► #8 Spec Mutation
       │
       ├──► #6 Program Mutation ──► #7 Grammar Mutation ──► #8 Spec Mutation
       │
       └──► #9 Fuzz Testing ──► #10 Symbolic Execution ──► #11 Concolic Execution
                                                                      │
                                                                      ▼
                                          #12 Test Generation from Coverage (#3+#4+#10 橋接)
                                                                      │
                                                                      ▼
                                          #13 Logic Coverage Binding (#5 延伸：clause → concrete witness)
```

四條子線（圖、邏輯、突變、執行式測試）：
- #3–#4 圖與資料流 → **#12 自動測試產生**（橋接 #3/#4 需求與 #10 witness）
- #5、#8 共用 predicate parser
- #6–#8 一脈：突變對象從**程式**走到**規格**
- #9–#11 一脈：搜尋從**隨機**走到**符號**再走到**concolic**

---

## 投影片與規格章節對照

| 簡報 # | 對應規格章節 | 主要工具 |
| --- | --- | --- |
| 1 | §1, §2 | TestingMethodTree |
| 2 | §2.B | TestingFlow + TestingTypesTable |
| 3 | §3 | GraphCoverageExplorer（CFG） |
| 4 | §15 | GraphCoverageExplorer（DFG）+ dataFlow.js |
| 5 | §4–5 | LogicCoverageExplorer + karnaughMap.js |
| 6 | §11.2 / §17.3 | SyntaxCoverageExplorer + mutation.js |
| 7 | §12 / §13 | GrammarCoverageExplorer + grammar.js |
| 8 | §14 / §16 | SpecMutationExplorer + specMutation.js + specFsm.js |
| 9 | §15 | FuzzTestingExplorer + fuzzTesting.js + pathToCfg.js |
| 10 | §16 | SymbolicExecutionExplorer + symbolicExecution.js |
| 11 | §17 | ConcolicExecutionExplorer + concolicExecution.js |
| 12 | §12 | TestGenerationExplorer + testGeneration.js |
| 13 | §4–5 (延伸) | LogicCoverageExplorer（Binding）+ logicBinding.js |

完整規格：[docs/Specification.zh-TW.md](../Specification.zh-TW.md)。

---

## 操作指南

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

### 重新擷取所有截圖

```bash
node scripts/capture-slide-screenshots.mjs
```

腳本會：
1. 偵測 `http://127.0.0.1:4173` 是否在跑；沒跑就自己啟 `python3 -m http.server`。
2. 把 locale pin 成 `zh`、`viewport 1440×900 @2x`。
3. 依序走訪所有 explorer 區塊，把對應 testid 截下來存到 [docs/assets/slides/](../assets/slides/)。
4. 全部完成後關閉自啟的 server。

### Marp Watch 模式（開發中用）

```bash
npx -y @marp-team/marp-cli --watch docs/slides/03-graph-coverage.zh-TW.md --html
```

開啟 `docs/slides/03-graph-coverage.zh-TW.html`，存檔即重渲染。

---

## 截圖清單（46 張）

存放於 [docs/assets/slides/](../assets/slides/)：

```
methods-overview.png            methods-whitebox.png
flow-overview.png               pyramid-overview.png
graph-coverage-{node,edge,prime-path,metrics,triangle,editor}.png
dfg-{empty,triangle,all-defs,all-uses,all-du-paths}.png
logic-{overview,truth-table,cacc,ic-kmap,cutpnfp}.png
mutation-{overview,mutant-list,per-test,shape-hierarchy}.png
grammar-{overview,derivations,mutants,string-mutants}.png
spec-{overview,mutants,fsm,smv-source}.png
fuzz-{overview,cfg}.png
symbex-{overview,paths,cfg}.png
concolic-{overview,iters,cfg}.png
testgen-{overview,requirements,tests,cfg}.png
binding-{panel,results}.png
```

---

## 後續可能擴充

- **Speaker notes**：每張投影片下方加 `<!-- speaker -->` Marp speaker notes（目前刻意省略，方便講師自行擴展）。
- **SMT solver 整合**：把 #10 / #11 的 brute-force witness solver 換成 z3-solver-js，支援大整數與字串 constraint。

---

簡報配色與 layout：純 Marp default theme + paginate；如需企業內部風格，請在每份的 front-matter 加 `theme: <yourtheme>`。
