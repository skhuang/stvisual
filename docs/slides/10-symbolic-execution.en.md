---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #10 — Symbolic Execution
description: Treat inputs as symbols, enumerate all paths, derive concrete witnesses via path conditions
lang: en
---

# Symbolic Execution
### Turn “run the program” into “solve the conditions”

Software Testing Visualization, Lecture #10
Tool: `/section-symbex` ([SymbolicExecutionExplorer](../../src/components/SymbolicExecutionExplorer.js) + [symbolicExecution.js](../../src/utils/symbolicExecution.js))

<!-- Symbolic execution is the most "mathematical" method in this series: treating program inputs as symbols and using constraint solvers to find concrete inputs for every path. -->
---

## From fuzz to symbex

| #9 Fuzz Testing | #10 Symbolic Execution |
| --- | --- |
| Throw concrete inputs at random | Treat inputs as **symbols** (`a`, `b`, `c`) |
| Walk wherever you happen to | **Enumerate every path** and solve for inputs that hit each one |
| No direction | Use **path conditions** to guide search |
| Easy to crash, hard to hit deep branches | Easy to hit deep branches, but path explosion |

> Pivot: **treat branch conditions as equations to solve**.

<!-- Fuzz is "blind trial"; symbex is "systematic analysis." Symbex guarantees finding inputs for every reachable path (if solvable). -->
---

## Three things to track: env / pc / branches

Every path is a 3-tuple:

| Component | Content |
| --- | --- |
| `env` | `{ var → symbolic expr }` (substituted to be in terms of parameters) |
| `pc` | Accumulated path condition: `[cond₁, cond₂, …]` (Boolean ASTs) |
| `branches` | UI-facing record: line + taken value per branch |

> Imagine walking through the CFG in shadow form: every `if` forks; each child appends its condition to `pc`.

<!-- Execution state = environment (symbolic variable values) + path condition (constraints to reach this point) + branch trace (which branches taken). -->
---

## The fork mechanism

```
            if (cond)
               │
               ▼
        ┌────────────┐
        │            │
        ▼            ▼
   pc += cond    pc += !cond
   take then     take else
```

Each child continues; when it hits `return`, **one path is complete**.

> `while` loops are unrolled up to `maxLoopUnroll` (default 3); each iteration forks “enter loop” vs “exit”.

<!-- At each conditional branch, symbex "forks" into two execution states (true and false paths). This is the root of path explosion. -->
---

## Finding a witness: bounded brute force

Each completed path has `pc = [c₁, c₂, …]`:

[`findWitness(pc, params, domain)`](../../src/utils/symbolicExecution.js):

```js
for (const value combination of domain^|params|) {
  if (every pc[i] evaluates to true) return witness;
}
return null;
```

- `searchDomain` defaults to `[-5, 12]` (18 values); with 3 params that’s 18³ = 5832 combinations.
- No witness found → `feasible: false` (infeasible path).

> No SMT solver — sufficient for teaching, students get it immediately.

<!-- The tool uses bounded brute-force search ([-10, 10] integer grid) to find concrete values satisfying the path condition. Real symbex systems use SMT solvers (e.g., Z3). -->
---

## Why infeasible paths matter

```js
if (x > 0) {
  if (x < 0) {     ← infeasible
    return crash;
  }
}
```

- Pure structural coverage (#3) would say “both `if` have then/else” → 4 paths.
- Symbex **solves the pc** and discovers the second `then` is unreachable.
- The tool marks `feasible: false` paths in red — dead code is visible at a glance.

<!-- If a path's constraints are unsatisfiable (infeasible), no test case can reach that path — this itself is important test information. -->
---

## Built-in 4 examples

| id | Function | Teaching focus |
| --- | --- | --- |
| `triangle` | Triangle classifier | Many branches + short-circuit |
| `max3` | Max of three | Sequential `if` + variable re-assignment |
| `abs` | Absolute value | Smallest (2 paths) |
| `gcd` | GCD with `while` | Loop unrolling + path explosion |

> `abs` is great for first exposure; `gcd` shows why max-unroll matters.

<!-- Four examples cover: simple conditionals, multi-branch, nested conditions, and paths with equality constraints. -->
---

## Tool: overview

![w:1000](../assets/slides/symbex-overview.png)

- Example chips: `symbex-example-{id}`.
- `symbex-source` is the code editor; `symbex-max-unroll` sets the while-unroll cap (default 3).
- `symbex-summary` shows total paths, feasible count, and whether the run truncated.

<!-- Left side: code input. Right side: path list (each path shows path condition, witness, infeasibility flag). -->
---

## Tool: path list

![w:1000](../assets/slides/symbex-paths.png)

- Each entry `symbex-{path-id}` lists the pc, return expression, witness, and the concrete return value.
- Feasible paths are green, infeasible ones grey; clicking one highlights the matching nodes on the CFG.
- `symbex-feasible-count` shows the “solvable” path count — fewer than `total` means dead code exists.

<!-- Each path entry shows: path condition (formula), concrete witness (x=1, y=-3), execution result. Click a path to highlight the CFG. -->
---

## Tool: CFG path highlight

![w:1000](../assets/slides/symbex-cfg.png)

- The `symbex-cfg` shares the same CFG engine as Lectures #3 / #9.
- Click any path → the matching nodes / edges colour up, end-to-end from start to return.
- `symbex-cfg-zoom-{in,out,reset}` controls scale (useful for `gcd` once unrolled).

<!-- Clicking a path entry highlights the corresponding node and edge sequence in purple. Have students confirm the path condition matches the CFG path. -->
---

## Path explosion

```
for (let i=0; i<n; i++)         ← n iterations
  if (cond1) ...                ← 2 paths
  if (cond2) ...                ← 2 paths
```

Pure enumeration → `2^(2n)` paths — exponential.

The tool’s safeguards:
1. `maxLoopUnroll` (default 3) — caps each while at 3 unrolls.
2. `maxPaths` (default 64) — overall cap; setting `truncated: true`.
3. UI banner indicating “results may be incomplete”.

<!-- Exponential path count is symbex's biggest challenge. The tool uses a depth limit (max paths) to avoid explosion. -->
---

## Algorithm peek

[`symbolicExecute(sourceCode, options)`](../../src/utils/symbolicExecution.js):

```js
1. parse(sourceCode)              → AST
2. walk(stmts, idx, env, pc, branches)
   - let / assign     → env[x] = substitute(value, env)
   - if               → fork: walk(then, pc+cond) + walk(else, pc+!cond)
   - while            → unroll up to maxLoopUnroll
   - return           → record(env, pc, branches, retExpr)
3. record() calls findWitness(pc) for each path to compute a concrete input
4. returns { function, paths, truncated }
```

> ≈ 570 lines of pure JS — tokenizer, parser, evaluator, solver in one file.

<!-- The tool uses recursive DFS to unfold the AST, cloning execution state at each conditional branch, accumulating the path condition, then solving. -->
---

## How real symbex systems differ

| Dimension | This tool | KLEE / Angr / Triton |
| --- | --- | --- |
| Solver | brute-force enumerate ±5–12 | SMT (Z3, STP) |
| Types | integer + boolean | integer, float, bit-vector, array, string |
| Path exploration | DFS + maxPaths | DFS / BFS / coverage-guided |
| External calls | unsupported | model libraries (libc, etc.) |
| Use | teaching | security analysis, automated test generation |

> The tool is the “smallest textbook version” — porting to KLEE keeps every concept the same.

<!-- Real systems (KLEE, Angr, S2E) use Z3/Boolector SMT solvers and can handle integers, characters, pointers, and complex constraints. -->
---

## Summary

- Symbex = **symbolic inputs + CFG forking + witness search on the path condition**.
- Each path carries `env / pc / branches`; the UI renders it on the CFG.
- The tool uses brute-force witness search (no SMT) — perfect for teaching; production systems use Z3 etc.
- **Path explosion** is the core challenge — `maxLoopUnroll` + `maxPaths` are the teaching-grade response.

<!-- Symbex systematically covers all reachable paths but is limited by path explosion. Concolic (#11) is a hybrid strategy combining concrete execution with symbolic analysis. -->
---

## Exercises

1. Open `triangle` and read the total vs feasible path counts. How many paths are infeasible — and why?
2. On `gcd`, change `symbex-max-unroll` from 3 to 1 — what happens to feasibility counts? Try 5.
3. Write a function with `if (a + b == 7)`. Does the witness search slow down? What would changing the domain do (the tool’s domain is fixed)?
4. Why does `abs` always yield exactly 2 feasible paths? Can you rewrite it to have 3?

<!-- Exercise 1 (manually trace path conditions) is the most important. Exercise 3 (infeasible paths) suits students with linear algebra background. -->
---

## Further reading

- King, J.C., *Symbolic Execution and Program Testing* (CACM, 1976) — the seminal paper.
- Cadar et al., *KLEE: Unassisted and Automatic Generation of High-Coverage Tests* (OSDI 2008).
- Baldoni et al., *A Survey of Symbolic Execution Techniques* (2018).
- Implementation:
  - [src/utils/symbolicExecution.js](../../src/utils/symbolicExecution.js) — 570 lines, self-contained engine.
  - [src/components/SymbolicExecutionExplorer.js](../../src/components/SymbolicExecutionExplorer.js) — UI.
- Next → **Lecture #11 — Concolic Execution** (concrete + symbolic = DART/CUTE).

<!-- KLEE is the most famous symbex tool. EXE is KLEE's predecessor. A&O §13 has a detailed introduction. -->
