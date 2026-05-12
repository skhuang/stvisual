---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualizer #13 — Logic Coverage Binding
description: Map abstract clauses (a, b, c) to program variables and auto-solve concrete integer witnesses
lang: en
---

# Logic Coverage Binding
### Map Abstract Clauses to Program Variables, Auto-solve Concrete Witnesses

Software Testing Visualizer Series #13
Tool: `/section-logic` → Clause Binding sub-panel ([LogicCoverageExplorer](../../src/components/LogicCoverageExplorer.js) + [logicBinding.js](../../src/utils/logicBinding.js))

---

## The "Last Mile" Problem in Logic Coverage

Lecture #5 says:
> CACC requires test rows `(a=T, b=F)` and `(a=F, b=T)`…

But the actual program is:

```js
if (x > 0 && y < 10) { ... }
```

**Problem**: What does `a=T` mean? Which `x`? Which `y`? The tester must derive inputs manually.

> **Clause Binding** closes this gap — automatically solving concrete integer witnesses from abstract truth-table rows.

---

## Core Concept: Three Layers of Mapping

```
Abstract layer (Logic Coverage)
  predicate: a && b
  test row:  a=T, b=F

       ↓ binding (clause → JS expression)
         a ↦ x > 0
         b ↦ y < 10

       ↓ solve (brute-force integer search)
         constraint: (x > 0) && !(y < 10)
         witness:    x=1, y=10
```

> Every coverage requirement row becomes a concrete, executable test input.

---

## The Binding UI

![w:1000](../assets/slides/binding-panel.png)

- **Clause Binding** sub-panel sits below the Logic Coverage Explorer (expandable)
- Each clause (a, b, c…) has a JS expression input
- Results show a **Constraint** column (full Boolean predicate) and a **Witness** column (concrete integers)

---

## Clause Binding Sub-panel Elements

| Element | Purpose |
|---------|---------|
| Clause inputs (`c ↦ …`) | Enter JS comparison expressions, e.g. `x > 0` |
| Params hint | Shows available program variables, e.g. `x, y` |
| Source code block | Annotated function body (`← a` marks which clause maps where) |
| Search range | Integer search domain (default −10 to 10) |
| Restore button | Reset to example default bindings |
| Results table | Test row / Clause values / Constraint / Witness |

---

## The Four-Column Results Table

```
┌──────────┬────────────────┬───────────────────────────┬──────────────┐
│ Test row │ Clause values  │ Constraint                │ Witness      │
├──────────┼────────────────┼───────────────────────────┼──────────────┤
│    1     │ a=T, b=F       │ (x>0) && !(y<10)          │ x=1, y=10    │
│    2     │ a=F, b=T       │ !(x>0) && (y<10)          │ x=0, y=0     │
│    3     │ a=T, b=T       │ (x>0) && (y<10)           │ x=1, y=0     │
│    4     │ a=F, b=F       │ !(x>0) && !(y<10)         │ x=0, y=10    │
└──────────┴────────────────┴───────────────────────────┴──────────────┘
```

- **Constraint**: automatically combines positive/negated clauses (`!(expr)` for False)
- **Witness**: smallest absolute-value integer solution (0, 1, −1, 2, −2, …)
- **infeasible**: shown in red when no solution exists (e.g. `x>0 && x<0`)

---

## The Solving Algorithm: Bounded Brute-force

**Core idea**: Cartesian-product enumeration with smallest-absolute-value-first ordering

```js
function* smallAbsFirst(min, max) {
  // yields: 0, 1, -1, 2, -2, 3, -3, ...
  for (let r = 0; r <= max - min; r++) {
    if (r === 0) yield 0;
    else { if (r <= max) yield r; if (-r >= min) yield -r; }
  }
}
```

Enumerate Cartesian products over all variables, evaluate constraint via `new Function()`:

```js
const checker = new Function(...vars, `return ${constraintStr};`);
for (const combo of cartesianSmallFirst(vars, range)) {
  if (checker(...combo)) return combo;  // ← witness found
}
```

---

## Why "Smallest Absolute Value" Order?

| Search order | Witness for `z ≠ 0` | Readability |
|--------------|---------------------|-------------|
| Linear (−10, −9, …) | z=−10 | Poor (large, meaningless) |
| Smallest absolute value | **z=1** | Good (closest positive integer to 0) |

> Test witnesses should be **simple and close to boundaries** — easiest to understand and debug.

---

## Example Program: abs(x)

```js
function abs(x) {
  if (x < 0) {   // ← a
    return -x;
  }
  return x;
}
```

- predicate: `a` (single clause)
- binding: `a ↦ x < 0`
- CACC test set:

| Test | a | Constraint | Witness |
|------|---|-----------|---------|
| 1 | T | `(x < 0)` | x=−1 |
| 2 | F | `!(x < 0)` | x=0 |

---

## Example Program: max(a, b)

```js
function max(a, b) {
  if (a > b) {   // ← p (single clause)
    return a;
  }
  return b;
}
```

- predicate: `p`
- binding: `p ↦ a > b`
- CACC test set:

| Test | p | Constraint | Witness |
|------|---|-----------|---------|
| 1 | T | `(a > b)` | a=1, b=0 |
| 2 | F | `!(a > b)` | a=0, b=0 |

---

## Example Program: triangle

```js
function triangle(a, b, c) {
  if (a === b) {           // ← p
    if (b === c) return 'equilateral';  // ← q
    return 'isosceles';
  }
  ...
}
```

predicate: `p && q`; binding: `p ↦ a === b`, `q ↦ b === c`

| Test | p | q | Constraint | Witness |
|------|---|---|-----------|---------|
| 1 | T | T | `(a===b) && (b===c)` | a=0, b=0, c=0 |
| 2 | T | F | `(a===b) && !(b===c)` | a=0, b=0, c=1 |

---

## Auto-fill from Predicate Examples

Clicking an example chip auto-fills `defaultBindings`:

```
[abs(x) branch]  →  a ↦ x < 0
[max(a,b)]       →  p ↦ a > b
[triangle p&&q]  →  p ↦ a === b, q ↦ b === c
```

- Also shows **source code** with `// ← a` annotations
- "Restore defaults" button resets bindings to example values
- Manual changes update the results immediately (200ms debounce)

---

## Binding Tool in Action

![w:1000](../assets/slides/binding-results.png)

- Left: clause input boxes (a ↦, b ↦, c ↦)
- Middle: annotated source code (`← a` marks)
- Bottom: four-column results table (infeasible shown in red)

---

## Tuning the Search Range

Default range: **[−10, 10]**; adjustable:

- If the constraint needs `x > 50`, raise max to at least 51
- Larger range = slower search (enumeration = `(max−min+1)^num_vars`)
- Recommended: start small to validate bindings, then widen for boundary values

```
Range [-10, 10], 2 variables → 21² = 441 attempts (instant)
Range [-100, 100], 3 variables → 201³ ≈ 8M attempts (~1–2 s)
```

---

## Limitations and Future Work

| Current | Potential improvement |
|---------|----------------------|
| Integer brute-force only | SMT solver (z3-solver-js) — arbitrary ranges, floats, strings |
| ~3 variables comfortably | Parallel Web Worker acceleration |
| Manual JS expression entry | AST-based auto-extraction of clause expressions |
| Comparison / logical ops only | Arrays, method calls, complex predicates |

> Current implementation demonstrates the core concept; SMT solver integration is a planned B1 improvement.

---

## Summary

- **Clause Binding** connects Logic Coverage's abstract test rows to concrete program inputs.
- Three layers: clause → JS expression → integer witness.
- The Constraint column shows exactly which Boolean predicate is being solved.
- Smallest-absolute-value search produces simple, readable witnesses.
- Auto-fill and source code display lower the learning curve.

---

## Classroom Exercises

1. Open the `triangle` example, change `p ↦ a === b` to `p ↦ a > b` — which rows become infeasible?
2. Enter predicate `a || b` (OR) with `a ↦ x > 5`, `b ↦ y > 5`. Which CACC rows produce the most interesting witnesses?
3. Shrink the search range to `[0, 2]` — does `a ↦ x < 0` become infeasible?
4. Design a RACC test set for `a && b && c` and use binding to find three concrete variable values.

---

## Further Reading

- Ammann & Offutt, *Introduction to Software Testing* §5 (Logic Coverage)
- Godefroid, Klarlund, Sen, *DART: Directed Automated Random Testing* (PLDI 2005) — brute-force witness pioneer
- de Moura & Bjørner, *Z3: An Efficient SMT Solver* (TACAS 2008) — next-step solver target
- Tool implementation:
  - [src/utils/logicBinding.js](../../src/utils/logicBinding.js) — solver, constraint builder, witness formatter
  - [src/components/LogicCoverageExplorer.js](../../src/components/LogicCoverageExplorer.js) — binding sub-panel UI
  - [src/data/testingData.js](../../src/data/testingData.js) — 6 example programs with default bindings
- Series continues — full index at [docs/slides/index.en.md](index.en.md)
