---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #9 — Fuzz Testing
description: Random input generation, branch instrumentation, live CFG coverage
lang: en
---

# Fuzz Testing
### Use random inputs to flush out unreached branches fast

Software Testing Visualization, Lecture #9
Tool: `/section-fuzz` ([FuzzTestingExplorer](../../src/components/FuzzTestingExplorer.js) + [fuzzTesting.js](../../src/utils/fuzzTesting.js))

<!-- From this lecture, the series enters the "automated test generation" trilogy (Fuzz → Symbex → Concolic). Fuzz is the simplest but still highly effective method. -->
---

## Where this fits

| Earlier lectures | This lecture |
| --- | --- |
| You **design** test cases (hand-written / coverage-derived) | You **throw inputs in** and watch what the oracle / crashes catch |
| Actively list requirements (#3–#5) | Passively observe behaviour (crash / branch hits) |
| Subject: static structure | Subject: **runtime behaviour of the program** |

> Pivot: **randomness is the cheapest search strategy**. With branch tracing it still reflects real coverage.

<!-- Fuzz testing's key advantage: fully automated, no specification required, can find boundary cases hard to find through manual testing. Drawback: unpredictable coverage. -->
---

## When to fuzz

- Early-stage projects with no test suite → run 100 random inputs to find crashes.
- Augment an existing suite → catch the “should-have-thought-of” input combinations.
- Regression smoke: run fuzz on every commit.
- Black-box interfaces (parsers / APIs): throw garbage, see if crashes happen.

> Real-world milestones: AFL, libFuzzer, ClusterFuzz. This tool is a teaching-grade demo of the core idea.

<!-- Best for: systems accepting large volumes of external input (parsers, network protocols, file handlers). Less suitable for: bugs requiring specific semantic inputs. -->
---

## Fuzz in three steps

```
function f(...) {...}
       │
       ▼ ① generate
input₁, input₂, …, inputₙ
       │
       ▼ ② run (one execution per input)
{ output, error, crashed, branches[] }
       │
       ▼ ③ aggregate
node coverage, edge coverage, unique error list
```

Each testCase carries `branches[]` — the taken/not-taken record for every `if/while`.

<!-- This tool implements: generate random integer/boolean inputs → execute the target function → record crashes and branch traces. -->
---

## Technical core: branch instrumentation

[`fuzzTesting.js → instrumentBranches(body)`](../../src/utils/fuzzTesting.js) rewrites every `if(cond) {...}` as:

```js
if ((__b__.push({ taken: !!(cond) }), __b__[__b__.length-1].taken))
```

`while` also gains a `++__lcN__ <= 10000` iteration guard so runaway loops can’t hang the page.

> The whole function is wrapped with `new Function('__b__', ...paramNames, instrumented)`.
> Each fuzz run hands in a fresh `branches=[]` array to collect the trace.

<!-- The tool "instruments" each if/while condition before execution, recording taken/not-taken into a branch trace array. -->
---

## From trace to CFG coverage

For every testCase:

1. [`programToGraph.generateControlFlowGraphFromProgram`](../../src/utils/programToGraph.js) turns the same source into a CFG.
2. [`pathToCfg.mapBranchesToCfg(cfg, branches)`](../../src/utils/pathToCfg.js) maps the trace back to CFG nodes / edges.
3. Union over all testCases → live `N%` (node) and `E%` (edge) badges.

> Clicking a testCase highlights the path **that run** took on the CFG.

<!-- Branch traces correspond to CFG edges. The tool computes node coverage and edge coverage percentages. -->
---

## Built-in 6 examples

| id | Function | Highlight |
| --- | --- | --- |
| `triangle-classifier` | `classify(a, b, c)` | Classic multi-branch |
| `gcd-function` | `gcd(a, b)` | While loop |
| `absolute-value` | `abs(x)` | Smallest example |
| `quadratic-formula` | Quadratic equation | Arithmetic + branches |
| `array-sum` | Array sum | Simple linear |
| `max-value` | `max3(...)` | Nested if |

> All six use pure integer / boolean inputs — strings cause NaN-based infinite loops, so they’re excluded by design.

<!-- Six examples cover: simple arithmetic, boundary checks, recursion (fibonacci), string handling, loops, and multi-branch logic. -->
---

## Tool: overview

![w:1000](../assets/slides/fuzz-overview.png)

- Top row: example chips `fuzz-example-{id}`.
- `fuzz-source` is the code editor; `fuzz-test-count-input` accepts 1–200.
- `fuzz-run-btn` triggers a run; `fuzz-summary` shows tests / passed / crashes.
- Top-right `fuzz-node-cov` / `fuzz-edge-cov` are live N% / E% badges.

<!-- Left side: code input and test count. Right side: test case list (pass/crash) and CFG view. -->
---

## Tool: testCases and CFG

![w:1000](../assets/slides/fuzz-cfg.png)

- The middle `fuzz-cfg` renders the CFG, with `fuzz-cfg-zoom-{in,out,reset}` controls.
- `fuzz-cases` lists every testCase (`fuzz-case-{id}`) with input, output, crash flag.
- Click a case → its path is highlighted on the CFG.
- `fuzz-cfg-selected` shows the currently selected test case id.

<!-- Click a test case and the CFG highlights the nodes and edges visited in that run. Ask students to find "which branch has never been covered." -->
---

## Tool: crash detection

For any testCase that throws:
- `crashed = true`; `error` is the message string.
- The `crashes` counter is highlighted red (`highlight-crash` class).
- `uniqueErrors: Map<message, count>` — duplicates collapse into a single entry for triage.

> The triangle classifier doesn’t guard against integer overflow on `a + b <= c` → easy to crash with large numbers; a good teaching case.

<!-- Crash = runtime exception. The tool shows crash rate and error messages to help locate issues. -->
---

## Random-input strategy

[`generateRandomValue`](../../src/utils/fuzzTesting.js):

```js
if (Math.random() < 0.7) {
  return integer in [-100, 100];
}
return boolean;
```

- 70% integers, 30% booleans.
- Integer range `MAX_INT_VALUE = 100`.
- **No strings** — otherwise `a + b` becomes string concatenation, the condition stays truthy, and the while loop spins forever.

> The focus is “branch search”, not “boundary precision” — pair with BVA from Lecture #1 if you need that.

<!-- Phase 1 uses pure random integers/booleans. Phase 2 mutates interesting seeds (crashes + novel branch patterns) using ±1, boundary values, and bitflip. -->
---

## Fundamental limits of random fuzzing

1. **No direction** — pure randomness may never hit deep branches in 1000 runs.
2. **No structure (no grammar-aware fuzzing)** — this tool only throws atoms, not JSON / SQL.
3. **Coverage ceiling** — if a condition is too precise (`a == 12345`), random virtually never hits it.
4. **No persistent learning** — every run starts from scratch, unlike AFL/libFuzzer with corpus minimisation.

> These four ceilings are exactly what #10 symbex / #11 concolic address.

<!-- Pure random fuzz cannot handle "magic numbers" (specific constants needed to trigger certain branches). Concolic execution (#11) solves this. -->
---

## Common pitfalls

- **NaN infinite loops**: avoided here by excluding strings; remember to guard your own uploads.
- **`MAX_LOOP_ITERATIONS = 10000`**: when this guard fires, it looks like a crash — it is actually the instrumentation safety net.
- **Empty `branches[]`**: the function has no if/while → every testCase walks the same path.
- **CFG mapping fails**: source uses syntax the parser doesn’t understand (try/catch, destructuring) → CFG empty, coverage uncomputable.

<!-- High node coverage ≠ good testing: if assertions only check "no crash," fuzz cannot find logic errors. -->
---

## Algorithm peek

```js
function fuzzTest(sourceCode, maxTests) {
  const parsed = parseFunctionSignature(sourceCode);  // injects __b__
  for (let i = 0; i < maxTests; i++) {
    const args = paramNames.map(generateRandomValue);
    const branches = [];
    try {
      output = parsed.func(branches, ...args);
    } catch (err) { crashed = true; ... }
    testCases.push({ input, output, error, crashed, branches });
  }
  return { totalTests, passedTests, crashes, testCases, uniqueErrors };
}
```

> Fits on one page — but already captures the core mental model behind production fuzzers.

<!-- Instrumentation uses regex replacement of if/while conditions. Loops have an iteration limit (10,000) to prevent infinite loops. -->
---

## Summary

- Fuzz testing = **random inputs + behaviour observation + coverage aggregation**.
- This tool uses source-level **instrumentation** to capture the trace, then maps it back to a CFG to compute node/edge coverage.
- 6 built-in examples cover common branch shapes; edit source / test count to re-run live.
- The first line of defence in modern testing — limited by direction, structure, and precision (those gaps are #10/#11’s job).

<!-- Fuzz is a "volume" strategy. Phase 2 mutation lets the tool explore boundaries missed by pure random testing. -->
---

## Exercises

1. Open `triangle-classifier` and set `fuzz-test-count-input` to 10, 50, 200. Observe how many runs N% / E% need to reach 100%.
2. Switch to `gcd-function` and sort `fuzz-cases` for the **slowest** entry (largest `duration`). Why is that input slow?
3. Write a function with 4 levels of nested `if`. Estimate the max edge coverage random fuzzing can reach.
4. Which example crashes most often in 200 runs? Do the crashes cluster around one error message?

<!-- Exercise 1 (observe crash rate) is the most intuitive. Exercise 3 (compare fuzz vs. random) works well as a discussion topic. -->
---

## Further reading

- Miller et al., *An Empirical Study of the Reliability of UNIX Utilities* (1990) — the original fuzz paper.
- AFL: <https://lcamtuf.coredump.cx/afl/>
- libFuzzer: <https://llvm.org/docs/LibFuzzer.html>
- Implementation:
  - [src/utils/fuzzTesting.js](../../src/utils/fuzzTesting.js) — 192 lines of instrumentation + runner.
  - [src/utils/pathToCfg.js](../../src/utils/pathToCfg.js) — branches → CFG mapping.
  - [src/components/FuzzTestingExplorer.js](../../src/components/FuzzTestingExplorer.js) — UI.
- Next → **Lecture #10 — Symbolic Execution** (no direction → use path conditions for precise search).

<!-- AFL and libFuzzer are the most widely used fuzz tools in industry. Interested students can try running AFL on their own programs. -->
