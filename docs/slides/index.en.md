# Software Testing Visualization — Slide-Deck Index

The stvisual course is **12 lectures**. Each deck contains:
- **Concept**: definitions + subsumption / algorithm overview
- **Worked example**: hand calculation + textbook citation
- **Tool demo**: testids, click-by-click steps, screenshots
- **Summary + exercises**
- **Further reading**: matching spec section + source files

All decks are Marp Markdown — convert to PPTX with a single command. Screenshots are produced by [scripts/capture-slide-screenshots.mjs](../../scripts/capture-slide-screenshots.mjs).

---

## Course catalogue

| # | Topic | ZH | EN | Screenshots |
| --- | --- | --- | --- | --- |
| 1 | Course intro & testing method classification | [01-course-intro.zh-TW.md](01-course-intro.zh-TW.md) | [01-course-intro.en.md](01-course-intro.en.md) | methods-overview, methods-whitebox |
| 2 | Testing flow & testing pyramid | [02-testing-flow-pyramid.zh-TW.md](02-testing-flow-pyramid.zh-TW.md) | [02-testing-flow-pyramid.en.md](02-testing-flow-pyramid.en.md) | flow-overview, pyramid-overview |
| 3 | Graph Coverage (structural) | [03-graph-coverage.zh-TW.md](03-graph-coverage.zh-TW.md) | [03-graph-coverage.en.md](03-graph-coverage.en.md) | graph-coverage-node, edge, prime-path, metrics, triangle, editor |
| 4 | Data Flow Coverage | [04-data-flow-coverage.zh-TW.md](04-data-flow-coverage.zh-TW.md) | [04-data-flow-coverage.en.md](04-data-flow-coverage.en.md) | dfg-empty, triangle, all-defs, all-uses, all-du-paths |
| 5 | Logic Coverage (14 criteria) | [05-logic-coverage.zh-TW.md](05-logic-coverage.zh-TW.md) | [05-logic-coverage.en.md](05-logic-coverage.en.md) | logic-overview, truth-table, cacc, ic-kmap, cutpnfp |
| 6 | Program Mutation (15 operators) | [06-program-mutation.zh-TW.md](06-program-mutation.zh-TW.md) | [06-program-mutation.en.md](06-program-mutation.en.md) | mutation-overview, mutant-list, per-test, shape-hierarchy |
| 7 | Grammar + String Mutation | [07-grammar-and-string-mutation.zh-TW.md](07-grammar-and-string-mutation.zh-TW.md) | [07-grammar-and-string-mutation.en.md](07-grammar-and-string-mutation.en.md) | grammar-overview, derivations, mutants, string-mutants |
| 8 | Specification Mutation + SMV + Safety Monitor FSM | [08-spec-mutation.zh-TW.md](08-spec-mutation.zh-TW.md) | [08-spec-mutation.en.md](08-spec-mutation.en.md) | spec-overview, mutants, fsm, smv-source |
| 9 | Fuzz Testing | [09-fuzz-testing.zh-TW.md](09-fuzz-testing.zh-TW.md) | [09-fuzz-testing.en.md](09-fuzz-testing.en.md) | fuzz-overview, fuzz-cfg |
| 10 | Symbolic Execution | [10-symbolic-execution.zh-TW.md](10-symbolic-execution.zh-TW.md) | [10-symbolic-execution.en.md](10-symbolic-execution.en.md) | symbex-overview, paths, cfg |
| 11 | Concolic Execution | [11-concolic-execution.zh-TW.md](11-concolic-execution.zh-TW.md) | [11-concolic-execution.en.md](11-concolic-execution.en.md) | concolic-overview, iters, cfg |
| 12 | Test Generation from Coverage | [12-test-generation.zh-TW.md](12-test-generation.zh-TW.md) | [12-test-generation.en.md](12-test-generation.en.md) | testgen-overview, requirements, tests, cfg |
| 13 | Logic Coverage Binding | [13-logic-binding.zh-TW.md](13-logic-binding.zh-TW.md) | [13-logic-binding.en.md](13-logic-binding.en.md) | binding-panel, binding-results |

---

## Learning dependencies

```
   #1 Intro
       │
       ▼
   #2 Testing flow
       │
       ├──► #3 Graph Coverage ──► #4 Data Flow Coverage
       │
       ├──► #5 Logic Coverage  ◄── shares parsePredicate ──► #8 Spec Mutation
       │
       ├──► #6 Program Mutation ──► #7 Grammar Mutation ──► #8 Spec Mutation
       │
       └──► #9 Fuzz Testing ──► #10 Symbolic Execution ──► #11 Concolic Execution
                                                                      │
                                                                      ▼
                                          #12 Test Generation from Coverage (#3+#4+#10 bridge)
                                                                      │
                                                                      ▼
                                          #13 Logic Coverage Binding (#5 extension: clause → concrete witness)
```

Four threads:
- #3–#4 graphs & data flow → **#12 auto test generation** (bridges #3/#4 requirements with #10 witnesses)
- #5 and #8 share the predicate parser
- #6–#8 chain — the mutation subject walks from **program** to **spec**
- #9–#11 chain — the search strategy walks from **random** to **symbolic** to **concolic**

---

## Slide → spec section map

| Deck # | Spec section | Primary tool |
| --- | --- | --- |
| 1 | §1, §2 | TestingMethodTree |
| 2 | §2.B | TestingFlow + TestingTypesTable |
| 3 | §3 | GraphCoverageExplorer (CFG) |
| 4 | §15 | GraphCoverageExplorer (DFG) + dataFlow.js |
| 5 | §4–5 | LogicCoverageExplorer + karnaughMap.js |
| 6 | §11.2 / §17.3 | SyntaxCoverageExplorer + mutation.js |
| 7 | §12 / §13 | GrammarCoverageExplorer + grammar.js |
| 8 | §14 / §16 | SpecMutationExplorer + specMutation.js + specFsm.js |
| 9 | §15 | FuzzTestingExplorer + fuzzTesting.js + pathToCfg.js |
| 10 | §16 | SymbolicExecutionExplorer + symbolicExecution.js |
| 11 | §17 | ConcolicExecutionExplorer + concolicExecution.js |
| 12 | §12 | TestGenerationExplorer + testGeneration.js |
| 13 | §4–5 (ext.) | LogicCoverageExplorer (Binding) + logicBinding.js |

Full spec: [docs/Specification.zh-TW.md](../Specification.zh-TW.md).

---

## How to use

### Convert one deck to PPTX

```bash
npx -y @marp-team/marp-cli docs/slides/03-graph-coverage.en.md --pptx
```

### Batch-convert every deck

```bash
for f in docs/slides/*-*.md; do
  npx -y @marp-team/marp-cli "$f" --pptx
done
```

> The pattern excludes `index.*.md`, which is not a Marp deck.

### Refresh every screenshot

```bash
node scripts/capture-slide-screenshots.mjs
```

The script:
1. Detects whether `http://127.0.0.1:4173` is already up; if not, launches `python3 -m http.server`.
2. Pins locale to `zh`, viewport `1440×900 @2x`.
3. Walks each explorer in order, capturing the relevant testid and saving into [docs/assets/slides/](../assets/slides/).
4. Shuts down the self-started server when done.

### Live preview (Marp watch)

```bash
npx -y @marp-team/marp-cli --watch docs/slides/03-graph-coverage.en.md --html
```

Open `docs/slides/03-graph-coverage.en.html` — saving the source re-renders.

---

## Screenshot inventory (46 files)

Located in [docs/assets/slides/](../assets/slides/):

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

## Possible extensions

- **#12.2 Logic Coverage Binding** — manually map clause variables to program expressions, auto-solve concrete inputs.
- **Speaker notes** — add `<!-- speaker -->` Marp speaker notes below each slide (deliberately omitted today so instructors can adapt freely).
- **SMT solver integration** — replace #10 / #11’s brute-force witness solver with z3-solver-js for large integers and string constraints.

---

Styling and layout: vanilla Marp default theme with pagination; for a corporate look, add `theme: <yourtheme>` to each deck’s front-matter.
