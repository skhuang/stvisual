---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #58 — Program Slicing
description: Understanding which statements affect a value — backward/forward slices, the PDG, and static vs dynamic slicing.
lang: en
---

# Program Slicing
### *Which statements affect this value?*

Software Testing Visualization series #58 · Slice-Based Testing
Companion tool: `/section-slicing` ([ProgramSlicingExplorer](../../src/components/ProgramSlicingExplorer.js))

<!-- Opens the Slice-Based Testing series. Slicing is the foundation: every later tab (dicing, coverage, regression) reuses the same engine and example data. -->

---

## Why slicing exists

- When a test fails, you see a **wrong output** — but the whole program ran. Which lines are responsible?
- Tracing by hand is tedious; a coverage report shows *what ran*, not *what mattered*.
- **Program slicing** (Weiser, 1984) answers a sharper question: given this **variable at this point**, which statements could have influenced its value?
- The result is a smaller program — the **slice** — that preserves the variable's behaviour and discards everything irrelevant.

<!-- Program slicing was Weiser's PhD thesis insight: a programmer mentally simulates a subset of the program, not the whole. Slicing makes that subset explicit and computable. -->

---

## The Program Dependence Graph (PDG)

A slice is computed over a **Program Dependence Graph**, which has two kinds of edges:

- **Data dependence** — statement B *data-depends* on statement A if A defines a variable that B later uses, without any re-definition in between.
- **Control dependence** — statement B *control-depends* on statement A if A (a branch or loop guard) determines whether B executes at all.

```
  s2: total = 0    ──data──▶  s5: total = total + s
  s4: for s of scores  ──control──▶  s5
  s4: for s of scores  ──control──▶  s6
```

Both edge types are needed: a wrong accumulator value (data) and a wrong loop condition (control) can both corrupt an output.

<!-- The PDG combines the control-flow graph's dominator information with def-use chains from data-flow analysis. In this course we use authored PDGs to keep the focus on slicing logic, not on the mechanics of building the graph. -->

---

## The slicing criterion

To compute a slice you need a **criterion**: a pair ⟨statement, variable⟩.

- The **statement** is the point of interest — typically a `return` or an assertion.
- The **variable** is the value you care about at that point.

Example: ⟨s10, grade⟩ — "what affects the value of `grade` when `return grade` executes?"

```
criterion = { stmtId: 's10', variable: 'grade' }
```

Every slice in this course is relative to a criterion. Changing the criterion — even at the same statement — can give a very different slice.

<!-- A single program can have many slices, one per criterion. This is what makes slicing a flexible analysis tool: you zoom in on exactly what you care about. -->

---

## Backward slice

A **backward slice** of criterion ⟨s, v⟩ is the set of statements that *may have affected* the value of `v` at statement `s`.

Computed by: start from `s`; follow **incoming** data-dep and control-dep edges backwards through the PDG; collect every reachable statement.

```
backward slice of ⟨s10, grade⟩ in gradeAverage:
  s10 → s9 (data: grade) → s8 (data: avg) → s4 (control) → s5 (data: total)
       → s2 (data: total) → s6 (data: count) → s3 (data: count)
  Result: {s2, s3, s4, s5, s6, s8, s9, s10}
```

Backward slices answer **debugging** questions: "What could have caused this wrong output?"

<!-- The backward slice of the output variable is often used in fault localization: it tells you which statements are candidates for the bug. Statements outside the slice cannot possibly affect this output. -->

---

## Forward slice

A **forward slice** of criterion ⟨s, v⟩ is the set of statements that *may be affected by* the value of `v` at statement `s`.

Computed by: start from `s`; follow **outgoing** data-dep and control-dep edges forwards through the PDG; collect every reachable statement.

```
forward slice of ⟨s2, total⟩ in gradeAverage:
  s2 → s5 (data: total) → s5 (self-loop: total)
     → s8 (data: total) → s9 (data: avg)
     → s10 (data: grade)
  Result: {s2, s5, s8, s9, s10}
```

Forward slices answer **impact analysis** questions: "If I change `total = 0`, which statements are affected?"

<!-- Forward slices underpin regression test selection (N4): if you change a statement, the forward slice tells you which tests might now fail. -->

---

## Static vs dynamic slicing

Both directions can be computed in two modes:

| | **Static** | **Dynamic** |
|---|---|---|
| Inputs needed | None — uses the full PDG | One execution trace |
| Edges used | All PDG edges | Only edges exercised in that trace |
| Slice size | Larger (safe over-approximation) | Smaller (input-specific) |
| Use case | General analysis, debugging aid | Precise fault localization |

**Dynamic slicing** restricts dependence edges to those whose endpoints both appear in the trace, applying the *last-definition rule*: for a data dep `def → use`, only the *most recent* preceding definition of that variable counts.

<!-- Dynamic slices are strictly smaller than or equal to static slices on the same criterion. The shrinkage can be dramatic for loops: a variable redefined 100 times in a loop still has only the last-definition edge active for any given use. -->

---

## Worked example — `gradeAverage`

```javascript
function gradeAverage(scores) {
  let total = 0;              // s2
  let count = 0;              // s3
  for (const s of scores) {  // s4
    total = total + s;        // s5
    count = count + 1;        // s6
  }
  const avg = total / count;  // s8
  const grade = avg >= 60     // s9
    ? "pass" : "fail";
  return grade;               // s10
}
```

- **Backward slice of ⟨s10, grade⟩** (static) = all 8 statements — the whole function is relevant.
- **Dynamic backward slice of ⟨s10, grade⟩** on trace `scores=[80,90]`: same statements, but loop body nodes appear only as many times as the loop ran.
- Comparing static and dynamic slice *sizes* reveals how much the trace constrains the analysis.

<!-- This example is deliberately simple so the slice can be traced by hand. In the Explorer you can click any statement, choose a variable, and watch the PDG highlight the slice. -->

---

## Tool demonstration

In `/section-slicing`, open the **Program Slicing Explorer**:

1. Select the `gradeAverage` example — read the source and PDG side by side.
2. Click a statement (e.g. `return grade` at line 10) and choose a variable.
3. Toggle **Backward / Forward** — watch the highlighted set change.
4. Switch to **Dynamic** mode; pick a trace — observe the slice shrink.
5. Check the detail panel: slice size, statement list, static-vs-dynamic delta.
6. Try the quiz: "which statements are in the backward slice of ⟨s10, grade⟩?"

---

## Summary

- A **Program Dependence Graph** combines data-dependence edges (def → use) and control-dependence edges (guard → controlled statement).
- A **slicing criterion** ⟨statement, variable⟩ pins both the point and the value of interest.
- A **backward slice** collects statements that *may affect* the criterion — used for debugging.
- A **forward slice** collects statements *affected by* the criterion — used for impact analysis.
- **Static** slicing covers all possible inputs (over-approximation); **dynamic** slicing restricts to one trace (smaller, more precise).

**In-class exercise:** trace the backward slice of ⟨s8, avg⟩ in `gradeAverage` by hand, then verify it in the Explorer.

---

## Further reading

- Course specification — slice-based testing chapter ([2026-05-18-slice-based-testing-design.md](../superpowers/specs/2026-05-18-slice-based-testing-design.md))
- Weiser, M. (1984). "Program Slicing." *IEEE Transactions on Software Engineering*, 10(4), 352–357.
- Tip, F. (1995). "A Survey of Program Slicing Techniques." *Journal of Programming Languages*, 3(3).
- Tool source: [ProgramSlicingExplorer.js](../../src/components/ProgramSlicingExplorer.js), [slicing.js](../../src/utils/slicing.js)
- Next: **#59 Fault Localization via Dicing** — narrow from a slice to a suspect set
