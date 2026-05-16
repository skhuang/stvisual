# Software Testing Visualization — Slide-Deck Index

The stvisual course is **57 lectures**. Each deck contains:
- **Concept**: definitions + subsumption / algorithm overview
- **Worked example**: hand calculation + textbook citation
- **Tool demo**: matching explorer, click-by-click steps (screenshots)
- **Summary + exercises**
- **Further reading**: matching spec section + source files

All decks are Marp Markdown — convert to PPTX with a single command. Decks are also viewable inside the app: every section header carries a "📊 Slides" button. Screenshots are produced by [scripts/capture-slide-screenshots.mjs](../../scripts/capture-slide-screenshots.mjs).

> #1–#13 ship with the original course; #14–#57 were authored by the slide-completion programme (Waves A–G), covering all 54 explorers. Every deck carries tool screenshots in its own interface language — English decks show the English UI, Chinese decks the Chinese UI.

---

## Course catalogue

### Foundations

| # | Topic | ZH | EN |
| --- | --- | --- | --- |
| 1 | Course intro & testing method classification | [01-course-intro.zh-TW.md](01-course-intro.zh-TW.md) | [01-course-intro.en.md](01-course-intro.en.md) |
| 2 | Testing flow & testing pyramid | [02-testing-flow-pyramid.zh-TW.md](02-testing-flow-pyramid.zh-TW.md) | [02-testing-flow-pyramid.en.md](02-testing-flow-pyramid.en.md) |
| 14 | The deferred cost of defects | [14-defect-cost.zh-TW.md](14-defect-cost.zh-TW.md) | [14-defect-cost.en.md](14-defect-cost.en.md) |
| 15 | The V-model | [15-v-model.zh-TW.md](15-v-model.zh-TW.md) | [15-v-model.en.md](15-v-model.en.md) |
| 16 | Testing levels & types | [16-testing-types.zh-TW.md](16-testing-types.zh-TW.md) | [16-testing-types.en.md](16-testing-types.en.md) |
| 17 | The test automation pyramid | [17-test-pyramid.zh-TW.md](17-test-pyramid.zh-TW.md) | [17-test-pyramid.en.md](17-test-pyramid.en.md) |

### Coverage Criteria

| # | Topic | ZH | EN |
| --- | --- | --- | --- |
| 3 | Graph Coverage (structural) | [03-graph-coverage.zh-TW.md](03-graph-coverage.zh-TW.md) | [03-graph-coverage.en.md](03-graph-coverage.en.md) |
| 4 | Data Flow Coverage | [04-data-flow-coverage.zh-TW.md](04-data-flow-coverage.zh-TW.md) | [04-data-flow-coverage.en.md](04-data-flow-coverage.en.md) |
| 5 | Logic Coverage (14 criteria) | [05-logic-coverage.zh-TW.md](05-logic-coverage.zh-TW.md) | [05-logic-coverage.en.md](05-logic-coverage.en.md) |
| 18 | Code coverage criteria | [18-code-coverage.zh-TW.md](18-code-coverage.zh-TW.md) | [18-code-coverage.en.md](18-code-coverage.en.md) |
| 28 | Group theory & test symmetry | [28-group-theory.zh-TW.md](28-group-theory.zh-TW.md) | [28-group-theory.en.md](28-group-theory.en.md) |

### Mutation & Specification

| # | Topic | ZH | EN |
| --- | --- | --- | --- |
| 6 | Program Mutation (15 operators) | [06-program-mutation.zh-TW.md](06-program-mutation.zh-TW.md) | [06-program-mutation.en.md](06-program-mutation.en.md) |
| 7 | Grammar + String Mutation | [07-grammar-and-string-mutation.zh-TW.md](07-grammar-and-string-mutation.zh-TW.md) | [07-grammar-and-string-mutation.en.md](07-grammar-and-string-mutation.en.md) |
| 8 | Specification Mutation + SMV + Safety Monitor FSM | [08-spec-mutation.zh-TW.md](08-spec-mutation.zh-TW.md) | [08-spec-mutation.en.md](08-spec-mutation.en.md) |

### Execution & Test Generation

| # | Topic | ZH | EN |
| --- | --- | --- | --- |
| 9 | Fuzz Testing | [09-fuzz-testing.zh-TW.md](09-fuzz-testing.zh-TW.md) | [09-fuzz-testing.en.md](09-fuzz-testing.en.md) |
| 10 | Symbolic Execution | [10-symbolic-execution.zh-TW.md](10-symbolic-execution.zh-TW.md) | [10-symbolic-execution.en.md](10-symbolic-execution.en.md) |
| 11 | Concolic Execution | [11-concolic-execution.zh-TW.md](11-concolic-execution.zh-TW.md) | [11-concolic-execution.en.md](11-concolic-execution.en.md) |
| 12 | Test Generation from Coverage | [12-test-generation.zh-TW.md](12-test-generation.zh-TW.md) | [12-test-generation.en.md](12-test-generation.en.md) |
| 13 | Logic Coverage Binding | [13-logic-binding.zh-TW.md](13-logic-binding.zh-TW.md) | [13-logic-binding.en.md](13-logic-binding.en.md) |
| 29 | Property-based testing | [29-property-based.zh-TW.md](29-property-based.zh-TW.md) | [29-property-based.en.md](29-property-based.en.md) |
| 30 | Integration testing | [30-integration-testing.zh-TW.md](30-integration-testing.zh-TW.md) | [30-integration-testing.en.md](30-integration-testing.en.md) |

### Black-Box Test Design

| # | Topic | ZH | EN |
| --- | --- | --- | --- |
| 19 | Boundary value analysis | [19-boundary-value.zh-TW.md](19-boundary-value.zh-TW.md) | [19-boundary-value.en.md](19-boundary-value.en.md) |
| 20 | Equivalence partitioning | [20-equivalence-partitioning.zh-TW.md](20-equivalence-partitioning.zh-TW.md) | [20-equivalence-partitioning.en.md](20-equivalence-partitioning.en.md) |
| 21 | Decision table testing | [21-decision-table.zh-TW.md](21-decision-table.zh-TW.md) | [21-decision-table.en.md](21-decision-table.en.md) |
| 22 | State transition testing | [22-state-transition.zh-TW.md](22-state-transition.zh-TW.md) | [22-state-transition.en.md](22-state-transition.en.md) |
| 23 | Pairwise testing | [23-pairwise.zh-TW.md](23-pairwise.zh-TW.md) | [23-pairwise.en.md](23-pairwise.en.md) |
| 24 | Cause-effect graphing | [24-cause-effect.zh-TW.md](24-cause-effect.zh-TW.md) | [24-cause-effect.en.md](24-cause-effect.en.md) |
| 25 | Metamorphic testing | [25-metamorphic.zh-TW.md](25-metamorphic.zh-TW.md) | [25-metamorphic.en.md](25-metamorphic.en.md) |
| 26 | Exploratory testing | [26-exploratory.zh-TW.md](26-exploratory.zh-TW.md) | [26-exploratory.en.md](26-exploratory.en.md) |
| 27 | Test doubles | [27-test-doubles.zh-TW.md](27-test-doubles.zh-TW.md) | [27-test-doubles.en.md](27-test-doubles.en.md) |
| 31 | Risk-based testing | [31-risk-based.zh-TW.md](31-risk-based.zh-TW.md) | [31-risk-based.en.md](31-risk-based.en.md) |

### Advanced / AI-Assisted

| # | Topic | ZH | EN |
| --- | --- | --- | --- |
| 32 | The equivalent mutant problem | [32-equivalent-mutants.zh-TW.md](32-equivalent-mutants.zh-TW.md) | [32-equivalent-mutants.en.md](32-equivalent-mutants.en.md) |
| 33 | Mutation score | [33-mutation-score.zh-TW.md](33-mutation-score.zh-TW.md) | [33-mutation-score.en.md](33-mutation-score.en.md) |
| 34 | LLM test-generation pipeline | [34-llm-test-pipeline.zh-TW.md](34-llm-test-pipeline.zh-TW.md) | [34-llm-test-pipeline.en.md](34-llm-test-pipeline.en.md) |
| 35 | Test quality gates | [35-test-quality-gates.zh-TW.md](35-test-quality-gates.zh-TW.md) | [35-test-quality-gates.en.md](35-test-quality-gates.en.md) |
| 36 | Fault-directed test generation | [36-fault-directed-testing.zh-TW.md](36-fault-directed-testing.zh-TW.md) | [36-fault-directed-testing.en.md](36-fault-directed-testing.en.md) |
| 37 | SAILOR — guided symbolic execution | [37-sailor-vulnerability.zh-TW.md](37-sailor-vulnerability.zh-TW.md) | [37-sailor-vulnerability.en.md](37-sailor-vulnerability.en.md) |

### Acceptance & E2E

| # | Topic | ZH | EN |
| --- | --- | --- | --- |
| 38 | BDD & Gherkin | [38-bdd-gherkin.zh-TW.md](38-bdd-gherkin.zh-TW.md) | [38-bdd-gherkin.en.md](38-bdd-gherkin.en.md) |
| 39 | Use-case test derivation | [39-use-case-derivation.zh-TW.md](39-use-case-derivation.zh-TW.md) | [39-use-case-derivation.en.md](39-use-case-derivation.en.md) |
| 40 | E2E user journey | [40-e2e-user-journey.zh-TW.md](40-e2e-user-journey.zh-TW.md) | [40-e2e-user-journey.en.md](40-e2e-user-journey.en.md) |
| 41 | Contract testing | [41-contract-testing.zh-TW.md](41-contract-testing.zh-TW.md) | [41-contract-testing.en.md](41-contract-testing.en.md) |
| 42 | Performance & load testing | [42-performance-load.zh-TW.md](42-performance-load.zh-TW.md) | [42-performance-load.en.md](42-performance-load.en.md) |
| 43 | Chaos engineering | [43-chaos-engineering.zh-TW.md](43-chaos-engineering.zh-TW.md) | [43-chaos-engineering.en.md](43-chaos-engineering.en.md) |
| 44 | The ATDD cycle | [44-atdd-cycle.zh-TW.md](44-atdd-cycle.zh-TW.md) | [44-atdd-cycle.en.md](44-atdd-cycle.en.md) |
| 45 | Flaky test diagnosis | [45-flaky-diagnosis.zh-TW.md](45-flaky-diagnosis.zh-TW.md) | [45-flaky-diagnosis.en.md](45-flaky-diagnosis.en.md) |

### Model-Based Testing

| # | Topic | ZH | EN |
| --- | --- | --- | --- |
| 46 | MBT workflow | [46-mbt-workflow.zh-TW.md](46-mbt-workflow.zh-TW.md) | [46-mbt-workflow.en.md](46-mbt-workflow.en.md) |
| 47 | FSM test generation | [47-fsm-test-generation.zh-TW.md](47-fsm-test-generation.zh-TW.md) | [47-fsm-test-generation.en.md](47-fsm-test-generation.en.md) |
| 48 | The W-method | [48-w-method.zh-TW.md](48-w-method.zh-TW.md) | [48-w-method.en.md](48-w-method.en.md) |
| 49 | EFSM & guarded transitions | [49-efsm-guarded-transition.zh-TW.md](49-efsm-guarded-transition.zh-TW.md) | [49-efsm-guarded-transition.en.md](49-efsm-guarded-transition.en.md) |
| 50 | Usage-model statistical testing | [50-usage-model-statistical.zh-TW.md](50-usage-model-statistical.zh-TW.md) | [50-usage-model-statistical.en.md](50-usage-model-statistical.en.md) |
| 51 | Model mutation | [51-model-mutation.zh-TW.md](51-model-mutation.zh-TW.md) | [51-model-mutation.en.md](51-model-mutation.en.md) |

### Agile Testing

| # | Topic | ZH | EN |
| --- | --- | --- | --- |
| 52 | Agile testing quadrants | [52-agile-quadrants.zh-TW.md](52-agile-quadrants.zh-TW.md) | [52-agile-quadrants.en.md](52-agile-quadrants.en.md) |
| 53 | Sprint testing cadence | [53-sprint-cadence.zh-TW.md](53-sprint-cadence.zh-TW.md) | [53-sprint-cadence.en.md](53-sprint-cadence.en.md) |
| 54 | Definition of Ready / Done | [54-definition-gates.zh-TW.md](54-definition-gates.zh-TW.md) | [54-definition-gates.en.md](54-definition-gates.en.md) |
| 55 | Three Amigos & example mapping | [55-example-mapping.zh-TW.md](55-example-mapping.zh-TW.md) | [55-example-mapping.en.md](55-example-mapping.en.md) |
| 56 | Continuous testing pipeline | [56-continuous-testing.zh-TW.md](56-continuous-testing.zh-TW.md) | [56-continuous-testing.en.md](56-continuous-testing.en.md) |
| 57 | Regression & test debt | [57-regression-debt.zh-TW.md](57-regression-debt.zh-TW.md) | [57-regression-debt.en.md](57-regression-debt.en.md) |

---

## How to use

### View inside the app

Every section header carries a "📊 Slides" button that opens the full-screen slide viewer (prev/next, ←/→ keys, speaker-notes toggle, Esc to close). The language follows the current locale — zh-TW / en.

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

The script detects `http://127.0.0.1:4173`, pins the locale to `zh`, walks each explorer in order, and captures the relevant testid into [docs/assets/slides/](../assets/slides/).

### Rebuild the in-app slide data

```bash
npm run build:slide-decks
```

Bakes `docs/slides/*.md` into `src/data/slideDecks.generated.js` for the in-app viewer.

---

## Full specification

[docs/Specification.zh-TW.md](../Specification.zh-TW.md).
