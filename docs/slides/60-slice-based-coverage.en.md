---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #60 — Slice-Based Coverage
description: Measuring test thoroughness relative to the statements that actually influence a given output — slice coverage as a complement to structural coverage.
lang: en
---

# Slice-Based Coverage
### *Measuring test effort against what actually matters for each output*

Software Testing Visualization series #60 · Slice-Based Testing
Companion tool: `/section-slicing` → Coverage tab ([SliceCoverageExplorer](../../src/components/SliceCoverageExplorer.js))

<!-- Builds on decks #58 (Program Slicing) and #59 (Fault Localization & Dicing). The key shift: structural coverage tells you which statements were executed; slice coverage tells you whether those executed statements are the ones that matter for a given output. -->

---

## Structural coverage — a quick recap

Two widely used structural coverage criteria:

- **Statement coverage** — every executable statement is run by at least one test.
- **Branch coverage** — every branch of every conditional is taken by at least one test.

These metrics are universal (they do not depend on what the program computes) and inexpensive to collect with standard instrumentation.

**What they guarantee:** no statement (or branch) was completely ignored by the test suite.

**What they do NOT guarantee:** the statements that were executed are the ones *relevant to the outputs you care about*.

<!-- Statement and branch coverage have been the industry baseline since the 1970s (Myers 1979, McCabe 1976). They are cheap, well-supported by tools (Istanbul, JaCoCo, gcov), and required by many safety standards (DO-178C, ISO 26262). But they are input-agnostic: a statement is "covered" whether or not it participates in producing any tested output. -->

---

## The limitation — coverage does not imply relevance

Consider a function with two distinct computation paths:

- Path A: computes the output variable the test checks.
- Path B: computes some internal state that has no effect on that output in this run.

A test that takes Path A and Path B is **fully statement-covered**.
But Path B statements contribute nothing to the observed output — testing them tells you nothing about whether the output is correct.

**The gap:** a statement is "covered" if it was executed, regardless of whether it influenced the output under test.

Slice-based coverage closes this gap by restricting the coverage denominator to the statements in the **backward slice** of the output — the only statements that *can* influence the output.

<!-- This was articulated formally by Weiser (1984) and later studied empirically by Gyimóthy, Besz and Forgács (1999) in "An Efficient Relevant Slicing Method for Debugging". The intuition is that executing a statement that cannot influence the observed output gives no evidence about that output's correctness. -->

---

## Backward slice as the relevant-statement set

**Backward slice** of output `v` at statement `s` (notation: `S(v, s)`):
> The set of all statements that *could* have affected the value of `v` at `s`, considering both data dependences and control dependences.

This is exactly the set of statements whose correct execution is **necessary** for `v` to be correct.

A test that fails to exercise a statement in `S(v, s)` cannot expose a fault in that statement's contribution to `v` — no matter how many other statements it covers.

**Key insight:** the backward slice of an output defines the *relevant coverage universe* for that output.

<!-- Data dependence: statement t defines a variable used by statement s. Control dependence: the execution of s depends on a branch taken at t. Together these form the program dependence graph (PDG), introduced by Ferrante, Ottenstein, and Warren (1987). The backward slice is a backwards reachability closure in the PDG. -->

---

## Slice coverage — the definition

Let `T` be a test suite and `v` an output of interest.

**Slice coverage of `v`** with respect to `T`:

$$\text{SliceCov}(v, T) = \frac{|\{s \in S(v) \mid \exists t \in T : t \text{ executes } s\}|}{|S(v)|}$$

- Numerator: slice statements *executed* by at least one test in `T`.
- Denominator: total number of statements in the backward slice of `v`.

$$\text{SliceCov}(v, T) = \frac{\text{covered slice statements}}{\text{slice size}}$$

**100% slice coverage** means every statement that can influence `v` has been exercised by the suite — a much stronger guarantee than 100% statement coverage alone.

<!-- The formula is conceptually identical to statement coverage, but the denominator is restricted to the slice. This restriction is what makes it meaningful for output-focused testing. The idea appears in various forms in the literature; Gyimóthy et al. (1999) provided the first systematic empirical study. -->

---

## Slice coverage vs plain statement coverage

| Property | Statement coverage | Slice coverage of output `v` |
|---|---|---|
| Denominator | All statements | Statements in `S(v)` |
| 100% means | Every statement executed | Every slice statement executed |
| Sensitive to irrelevant code? | Yes — irrelevant code inflates % | No — irrelevant code excluded |
| Detects gaps in output-relevant paths? | Only by accident | By design |

**Critical observation:** a statement can be **fully statement-covered yet lie outside every output's slice** — testing it yields zero evidence about any output's correctness.

Conversely, a statement can be **inside the slice but never executed** — it is statement-uncovered *within the relevant set*, a gap that statement coverage inflated by irrelevant code might obscure.

<!-- Example: a logging branch that writes to a file is always executed. It covers those statements. But if the output being tested is a numeric return value, the logging statements are outside that output's slice and contribute nothing to slice coverage of that output. The denominator difference is what matters. -->

---

## Worked example — `classify`

```javascript
function classify(n) {
  let label = "zero";       // s2
  let sign = 0;             // s3
  if (n > 0) {              // s4
    label = "positive";     // s5
    sign = 1;               // s6
  } else if (n < 0) {       // s7
    label = "negative";     // s8
    sign = -1;              // s9
  }
  return label;             // s11
}
```

Output: `label` at `s11`.

**Backward slice** of `label` at `s11`: {s2, s4, s5, s7, s8, s11} — **6 statements**.

`s3`, `s6`, `s9` (`sign`) are **not** in the slice: `sign` has no path to `label`.

<!-- s3 defines `sign`; s6 and s9 update it. But `sign` is never used in any computation that reaches `label`. Statement coverage counts s3/s6/s9 as "covered" whenever a test runs through them; slice coverage of `label` correctly excludes them from the denominator. Note: s7 IS in the slice because it is a control node (else if) whose branch determines whether s8 executes, and s8 data-depends label at s11. -->

---

## Worked example — three test traces

| Test | Input | Executes | Slice statements executed |
|---|---|---|---|
| `pos` | n=5 | s2, s3, s4, s5, s6, s11 | s2, s4, s5, s11 |
| `neg` | n=−3 | s2, s3, s4, s7, s8, s9, s11 | s2, s4, s7, s8, s11 |
| `zero` | n=0 | s2, s3, s4, s7, s11 | s2, s4, s7, s11 |

Slice = {s2, s4, s5, s7, s8, s11}

With all three tests: every slice statement is covered → **slice coverage = 6/6 = 100%**.

Statement coverage is also 100% — but note: `s3`, `s6`, `s9` appear as "covered" in statement coverage even though they contribute nothing to slice coverage of `label`.

<!-- Each test covers a different branch of the if-else chain and thus a different subset of slice statements. Together the three tests saturate the 6-statement slice. s3/s6/s9 (the sign assignments) are executed by various tests but never enter the slice denominator — they are "extra" coverage that does not strengthen our confidence in label's correctness. -->

---

## Dropping the `neg` trace — a gap appears

With only `pos` and `zero`:

| Slice statement | Covered? |
|---|---|
| s2 | yes |
| s4 | yes |
| s5 | yes (by `pos`) |
| s7 | yes (by `zero`) |
| s8 | **no** — only `neg` exercises this branch |
| s11 | yes |

**Slice coverage = 5/6 = 83%** — the gap at `s8` (`label = "negative"`) is visible.

Statement coverage without `neg`: `s8` and `s9` are uncovered, `s3`/`s6` are covered.
Slice coverage correctly focuses attention on the output-relevant gap at `s8`, not the irrelevant execution of `s3`/`s6`.

<!-- This is the teaching point: statement coverage would show s3 and s6 as "bonus covered" and report s8 and s9 as missing. Slice coverage shows only s8 as missing (s9 is outside the slice) and does not count s3/s6 at all — the denominator correctly excludes them. The result is a cleaner signal about what matters for output correctness. -->

---

## Tool demonstration

In `/section-slicing`, open the **Coverage** tab (Slice Coverage Explorer):

1. Select the `classify` scenario.
   - The backward slice of `label` is highlighted in the PDG on the left (6 statements: s2, s4, s5, s7, s8, s11).
   - `s3`, `s6`, `s9` are shown as outside the slice (greyed out in the denominator panel).
2. Enable all three traces (`pos`, `neg`, `zero`) — observe 100% slice coverage (6/6).
3. Disable the `neg` trace — watch the coverage meter drop to 83% and `s8` turn red.
4. Compare the **Slice coverage** bar with the **Statement coverage** bar:
   - Statement coverage: `s3`/`s6` appear covered, giving a falsely optimistic view.
   - Slice coverage: `s3`/`s6`/`s9` are excluded; the uncovered `s8` is the only gap.
5. Try the quiz: "which statement is covered by every test but contributes nothing to slice coverage of `label`?"

---

## Summary

- **Structural coverage** (statement / branch) measures whether statements were executed, regardless of their relevance to any particular output.
- Every output's **backward slice** defines the set of statements whose execution is *necessary* for that output to be correct.
- **Slice coverage** = covered slice statements ÷ slice size — restricts the denominator to output-relevant statements.
- A statement can be **statement-covered but slice-irrelevant** (outside every output's slice): executing it provides no evidence about any output's correctness.
- A statement can be **inside the slice but uncovered**: a genuine gap that coarse structural metrics may obscure behind irrelevant covered code.
- Slice coverage complements, not replaces, structural coverage — use both.

**In-class exercise:** for the `classify` function, identify all outputs and compute the backward slice and slice coverage for each output independently.

---

## Further reading

- Course specification — coverage design ([2026-05-19-slicing-n3-coverage-design.md](../superpowers/specs/2026-05-19-slicing-n3-coverage-design.md))
- Weiser, M. (1984). "Program slicing." *IEEE Transactions on Software Engineering*, 10(4), 352–357.
- Gyimóthy, T., Beszédes, Á., & Forgács, I. (1999). "An efficient relevant slicing method for debugging." *ACM SIGSOFT Software Engineering Notes*, 24(6), 303–321.
- Ferrante, J., Ottenstein, K. J., & Warren, J. D. (1987). "The program dependence graph and its use in optimization." *ACM Transactions on Programming Languages and Systems*, 9(3), 319–349.
- Tool source: [SliceCoverageExplorer.js](../../src/components/SliceCoverageExplorer.js), [slicing.js](../../src/utils/slicing.js)
- Previous: **#59 Fault Localization & Dicing** — slicing applied to fault narrowing
