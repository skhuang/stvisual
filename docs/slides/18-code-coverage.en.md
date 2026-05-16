---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #18 — Code Coverage Criteria
description: Statement, branch, condition and MC/DC coverage — what each measures, the subsumption hierarchy, and why 100% coverage is not 100% tested.
lang: en
---

# Code Coverage Criteria
### Statement · Branch · Condition · MC/DC

Software Testing Visualization series #18
Companion tool: `/section-codecov` ([CodeCoverageExplorer](../../src/components/CodeCoverageExplorer.js))

<!-- This lecture is the white-box counterpart to the graph/logic coverage lectures, but grounded in the everyday metric a coverage tool reports. -->

---

## Why this lecture exists

- "We have 80% coverage" — 80% of *what*, exactly?
- Coverage tools report a number; few students know which **criterion** it measures.
- Different criteria can score the *same test suite* very differently.
- This lecture defines four criteria and the hierarchy that orders them.

---

## The running example

A tiny function with one compound decision:

```js
function discount(amount, isMember) {
  if (amount > 50 && isMember) {
    return amount * 0.9;   // 10% off
  }
  return amount;
}
```

One `if`, two atomic conditions: `amount > 50` and `isMember`.
We will score four coverage criteria against it.

---

## Criterion 1 — Statement coverage

**Every executable statement runs at least once.**

```
discount(70, true)   → runs the return inside the if
discount(10, false)  → runs the final return
```

Two tests → **100% statement coverage.** Every line executed.

But: did we ever take the `if` as **false** *because of `isMember`*? Statement coverage cannot tell — it only counts lines.

---

## Criterion 2 — Branch (decision) coverage

**Every decision outcome — true *and* false — is exercised.**

The `if` must evaluate both ways:

```
discount(70, true)   → if is TRUE
discount(10, false)  → if is FALSE
```

Same two tests → **100% branch coverage.** Branch subsumes statement: cover every branch and every statement is covered too.

Still hidden: the decision is *compound*. Which condition flipped it?

---

## Criterion 3 — Condition coverage

**Every atomic condition takes both true and false** across the suite.

| Test | `amount > 50` | `isMember` |
| --- | --- | --- |
| `discount(70, true)` | T | T |
| `discount(10, false)` | F | F |

Each condition has been T and F → **100% condition coverage.**
Yet we never saw `amount>50` **T** while `isMember` was **F** — a case branch coverage *and* condition coverage both miss.

---

## Criterion 4 — MC/DC

**Modified Condition / Decision Coverage:** each condition must be shown to **independently** change the decision outcome — hold the others fixed, flip one, watch the result flip.

| `amount>50` | `isMember` | decision |
| --- | --- | --- |
| T | T | **true** |
| F | T | false  ← flipping `amount>50` alone flips it |
| T | F | false  ← flipping `isMember` alone flips it |

Three tests prove **each** condition matters on its own. MC/DC is the aviation standard (DO-178C) for exactly this reason.

---

## The subsumption hierarchy

A stronger criterion **subsumes** a weaker one — satisfy it and you automatically satisfy the weaker:

```
MC/DC  ⊃  Branch  ⊃  Statement
            (Condition is stronger than Statement,
             but does NOT subsume Branch by itself)
```

Stronger criteria need more tests and catch more defects. MC/DC is demanding — reserved for safety-critical code.

---

## Why 100% coverage is not "fully tested"

Coverage measures **what the tests executed**, never **what they checked.**

- A test can run every line and **assert nothing** — still 100% statement coverage.
- Coverage cannot see a *missing* `else`, an unhandled case, a wrong requirement.
- 100% coverage = "no code is unexecuted". It is a **floor, not a ceiling.**

> Coverage tells you what you *haven't* tested. It cannot tell you what you *have*.

---

## Tool demonstration

In `/section-codecov`, open the **Code Coverage Explorer**:

1. Pick a preset (`discount`, `absVal`, `classify`, `maxOf3`).
2. Run the default test suite — read the four percentages.
3. Find a suite at **100% branch** but **below 100% MC/DC** — that gap is the lecture.
4. Add the missing test and watch MC/DC complete.

---

## Summary

- Four criteria, increasing strength: **statement → branch → condition / MC/DC.**
- **Subsumption:** branch subsumes statement; MC/DC subsumes branch.
- MC/DC proves each condition *independently* affects the decision — the safety-critical standard.
- 100% coverage means *nothing unexecuted* — it is a floor; assertions still do the real testing.

**In-class exercise:** write a 3-condition predicate. How many tests for branch coverage? For MC/DC? (MC/DC needs only ~N+1, not 2^N.)

---

## Further reading

- Course specification — white-box coverage chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- RTCA DO-178C — MC/DC in airborne software
- Ammann & Offutt, *Introduction to Software Testing* — logic coverage
- Tool source: [CodeCoverageExplorer.js](../../src/components/CodeCoverageExplorer.js) · [codeCoverage.js](../../src/utils/codeCoverage.js)
- Related: **#3 Graph Coverage** · **#5 Logic Coverage** (the 14-criterion treatment)
