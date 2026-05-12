---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #3 — Graph Coverage
description: Structural coverage criteria on the control-flow graph: Node / Edge / Edge-Pair / Prime Path / Complete Path
lang: en
---

# Graph Coverage
### Deriving Test Requirements from the Control-Flow Graph

Software Testing Visualization, Lecture #3
Tool: `/section-graph` ([GraphCoverageExplorer](../../src/components/GraphCoverageExplorer.js))

<!-- This lecture is the graph-theoretic foundation of the entire series. Mastering CFG and coverage criteria here makes Data Flow (#4) and Test Generation (#12) flow naturally. -->
---

## Why Graph Coverage?

- Turn “testing” into a measurable proposition: **every X is traversed at least once**
  - X = node / edge / edge-pair / prime path / complete path
- Mirrors what coverage tools (Istanbul, JaCoCo) report — only finer-grained
- A single framework expresses both:
  - **Structural** criteria — this lecture
  - **Data-flow** criteria — Lecture #4, on the same CFG

> Pivot: abstract the program into a graph, then reason about coverage on the graph.

<!-- This lecture is the graph-theoretic foundation of the entire series. Mastering CFG and coverage criteria here makes Data Flow (#4) and Test Generation (#12) flow naturally. -->
---

## Abstraction: what is a CFG?

```
G = (N, E, n_s, n_f)
```

| Element | Meaning |
| --- | --- |
| `N` | Nodes (basic blocks / statements) |
| `E ⊆ N × N` | Directed edges (control transfers) |
| `n_s ∈ N` | Start node |
| `n_f ∈ N` | End node |

**Test path** = any path from `n_s` to `n_f`.
**Test requirement** = a sub-structure of the graph that must be covered.

<!-- Node = basic block, Edge = control flow transfer. Whiteboard a simple if-else CFG and have students fill in the nodes collaboratively. -->
---

## Five Structural Coverage Criteria

| id | Name | Requirement shape |
| --- | --- | --- |
| `node` | Node Coverage (NC) | every node |
| `edge` | Edge Coverage (EC) | every directed edge |
| `edge-pair` | Edge-Pair Coverage (EPC) | every adjacent edge pair (a→b→c) |
| `prime-path` | Prime Path Coverage (PPC) | every maximal simple path (incl. cycles) |
| `complete-path` | Complete Path Coverage (CPC) | every `n_s ⤳ n_f` path |

> In the tool, each one is bound to a `criterion-{id}` button on the left.

<!-- These five criteria form a strict subsumption hierarchy. Prime Path Coverage is the "king" — it subsumes most criteria below it. -->
---

## Subsumption Hierarchy

```
CPC  ──►  PPC  ──►  EPC  ──►  EC  ──►  NC
```

> “A → B” means “satisfying A implies satisfying B”.

- Cheapest: NC. Most complete: CPC.
- PPC is the classroom sweet spot: subsumes EPC, handles loops, still hand-computable.
- CPC is only feasible on acyclic graphs (the tool exposes a `maxDepth`).

<!-- The subsumption diagram is the key tool for understanding criterion strength. Ask: why does Edge Coverage not subsume Prime Path Coverage? -->
---

## Worked example: the sample CFG

Built-in [`graphCoverageGraph`](../../src/data/testingData.js):

- `nodes` = { S, A, B, C, D, E, F, T }
- `edges` = { S-A, A-B, A-C, B-D, C-D, D-E, D-F, E-B, E-T, F-T }
- start = S, end = T
- **Key**: `E-B` forms a loop B → D → E → B

```
        ┌─► B ─┐         ┌─► E ─┐
S ─► A ─┤      ├─► D ─►──┤      ├─► T
        └─► C ─┘         └─► F ─┘
                              ▲
              (back-edge E ──► B)
```

<!-- This sample CFG is the standard A&O textbook example. Have students compute NC by hand first, then check against the tool. -->
---

## By Hand: Node Coverage

Cover 8 nodes: `{S, A, B, C, D, E, F, T}`

Two test paths are enough:

| Test | Path |
| --- | --- |
| TP₁ | S → A → B → D → E → T |
| TP₂ | S → A → C → D → F → T |

> NC does **not** force you to traverse `E-B` — that edge can remain unexercised.
> This is exactly where NC is weaker than EC.

<!-- NC requires each node to be visited at least once. Have students find the minimum number of test paths. -->
---

## By Hand: Edge Coverage

10 edges: `{S-A, A-B, A-C, B-D, C-D, D-E, D-F, E-B, E-T, F-T}`

TP₁ + TP₂ miss `E-B`; we need a third path:

| Test | Path |
| --- | --- |
| TP₁ | S → A → B → D → E → T |
| TP₂ | S → A → C → D → F → T |
| TP₃ | S → A → B → D → E → **B** → D → F → T |

> Notice: **EC forces you to enter the loop**. NC never does.
> In the tool, click `criterion-edge` to see all 10 requirements plus the test set that covers them.

<!-- EC requires each edge to be covered at least once. Usually just one or two more paths than NC. -->
---

## By Hand: Prime Path Coverage

A prime path is a simple path (no node repeats except endpoints) that is **maximal** — it cannot be extended at either end.

A few prime paths (non-exhaustive):

- `[S, A, B, D, E, T]`
- `[S, A, B, D, E, B]` (endpoints equal → cycle, counts as prime)
- `[S, A, C, D, F, T]`
- `[E, B, D, E]` (cycle on its own is also a prime path)
- ...

> PPC subsumes EPC: every adjacent edge pair is contained inside some prime path.
> The tool enumerates them and minimises the test-path set automatically.

<!-- PPC requires covering all prime paths (longest simple paths). Emphasize this may be fewer than total paths — not every path needs to be covered. -->
---

## Tool demo: pick a criterion

![w:1000](../assets/slides/graph-coverage-node.png)

1. The sample CFG loads by default (left-hand `graph-canvas`).
2. The button row switches the 5 criteria (`criterion-{id}`).
3. `requirement-list` updates live; click a requirement and the canvas highlights the matching nodes/edges.

<!-- Open the tool live, select Node Coverage, and let it compute the requirement list. Observe how requirement count grows as criterion strength increases. -->
---

## Tool demo: metrics and greedy set cover

![w:780](../assets/slides/graph-coverage-metrics.png)

Sample CFG + Prime Path Coverage: baseline **7** → optimised **6**, saved 1, 7/7 requirements covered.

> Algorithm: [`graphCoverage.js → greedySetCover`](../../src/utils/graphCoverage.js) — each step picks the path that covers the most still-uncovered requirements.
> Engineering takeaway: trade “walk everything” for “walk enough”.

<!-- The tool uses greedy set cover to find the minimum test set. Ask: does the greedy solution guarantee optimality? (No, but it's usually very close.) -->
---

## Tool demo: upload code

![w:1000](../assets/slides/graph-coverage-triangle.png)

- Pick `Triangle Problem` from `program-example-select` (or upload JS / pseudocode).
- [`programToGraph.js`](../../src/utils/programToGraph.js) converts source to a CFG.
- Selecting a requirement highlights the matching source lines in `program-source-code`.
- Built-in examples: `triangle-problem`, `next-date`, `commission-problem`, `next-date-leap-year`, `calendar-days`, `quadrilateral-problem`, `next-week`.

<!-- Let students upload a simple function they wrote and watch the tool auto-generate a CFG. Note: the tool only handles JavaScript function syntax. -->
---

## Live CFG editor

![w:1000](../assets/slides/graph-coverage-editor.png)

| Field | Meaning |
| --- | --- |
| `graph-start-input` / `graph-end-input` | start / end node id |
| `graph-nodes-input` | one node per line: `id,label,x,y,kind` |
| `graph-edges-input` | one edge per line: `id,from,to[,viaX,viaY]` |

Requirements and paths re-compute on every edit. `graph-reset-btn` restores the sample.

<!-- Live edit mode lets students directly modify the dot-format CFG, useful for manually constructing textbook examples. -->
---

## Summary

- Five criteria, weakest to strongest: **NC → EC → EPC → PPC → CPC**.
- Stronger criteria need more test paths but expose more bugs.
- The tool automates three steps:
  1. Compute **requirements** from the CFG.
  2. Enumerate candidate **test paths**.
  3. **Optimise** with greedy set cover.
- The same CFG is reused in **Lecture #4 — Data Flow Coverage**.

<!-- CFG + five criteria are the graph-theoretic backbone of this series. Mastering this makes Data Flow (#4) and Test Generation (#12) follow naturally. -->
---

## Exercises

1. Open `Triangle Problem` in the tool. Compare `optimized-path-count` between NC and PPC — how many extra paths does PPC require, and what do they cover?
2. Delete the back-edge `E-B` from the sample CFG and re-run EC. Explain why the number of test paths drops.
3. Build a 3-node graph with a self-loop `A → A`. Is the self-loop a prime path? (Hint: a cycle has equal endpoints → counts as prime.)
4. Compare EPC vs PPC on `Next Date`. Why is the difference smaller than on `Triangle Problem`?

<!-- Exercise 1 (compute prime paths by hand) is the most important foundational skill. Exercise 3 (upload your own code) works well as homework. -->
---

## Further Reading

- Ammann & Offutt, *Introduction to Software Testing*, Ch. 7 (Graph Coverage Criteria).
- Source:
  - Algorithms: [src/utils/graphCoverage.js](../../src/utils/graphCoverage.js)
  - Code → CFG: [src/utils/programToGraph.js](../../src/utils/programToGraph.js)
  - UI: [src/components/GraphCoverageExplorer.js](../../src/components/GraphCoverageExplorer.js)
- Spec §3: [docs/Specification.zh-TW.md](../Specification.zh-TW.md)
- Next → **Lecture #4 — Data Flow Coverage** (same CFG, now with defs and uses).

<!-- A&O §3 has the complete CFG theory. The prime path algorithm in the tool is in src/utils/graphCoverage.js. -->
