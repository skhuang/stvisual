---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #33 — Mutation Score
description: Measuring test-suite quality by how many seeded faults it kills — mutation operators, the kill criterion, and the score formula.
lang: en
---

# Mutation Score
### Coverage says "executed"; mutation says "*tested*"

Software Testing Visualization series #33 · Advanced Testing
Companion tool: `/section-advanced` ([MutationScoreExplorer](../../src/components/MutationScoreExplorer.js))

<!-- This lecture answers the limitation raised in #18: coverage measures execution, not checking. Mutation testing measures checking. -->

---

## Why this lecture exists

- Code coverage (#18) tells you a line **ran** — not that a test would **catch a bug** in it.
- A test can execute every line and assert *nothing*: 100% coverage, 0% fault detection.
- Mutation testing asks a sharper question: *if I break the code, does a test fail?*
- The **mutation score** turns "is this suite any good?" into a number.

---

## The idea: seed faults, see who notices

1. Take the program and the test suite (which currently **passes**).
2. Make many small faulty copies — **mutants** — one change each.
3. Run the suite against each mutant.
4. If some test now **fails**, the mutant is **killed**. If all tests still pass, it **survived**.

> A surviving mutant is a real bug your suite would not catch.

---

## Mutation operators

A **mutation operator** is a rule for generating one fault. Common ones:

| Operator | Example change |
| --- | --- |
| Relational | `a < b` → `a <= b` |
| Arithmetic | `a + b` → `a - b` |
| Logical | `a && b` → `a \|\| b` |
| Constant | `return 0` → `return 1` |
| Statement deletion | remove a line |

Each operator models a *plausible programmer mistake*. Applying them across the code yields the mutant population.

---

## Killed, survived, equivalent

Every mutant ends in one of three states:

- **Killed** — a test failed → the suite *detected* this fault. Good.
- **Survived** — all tests passed → the suite *missed* this fault. A test gap.
- **Equivalent** — behaviourally identical to the original (#32) → *cannot* be killed. Excluded from the score.

The equivalent class is exactly why #32 came first.

---

## The mutation score formula

$$
\text{Mutation Score} = \frac{\text{killed mutants}}{\text{total mutants} - \text{equivalent mutants}}
$$

- The denominator **excludes** equivalent mutants — otherwise the score is unfairly capped below 100%.
- A higher score = a suite that catches more seeded faults.
- A **surviving (non-equivalent)** mutant is an actionable to-do: write the test that kills it.

---

## Coverage vs mutation — the contrast

| | Code coverage | Mutation score |
| --- | --- | --- |
| Measures | code **executed** | faults **detected** |
| Fooled by assertion-free tests? | yes | no |
| Cost | cheap | expensive (run the suite ×#mutants) |
| Answers | "what did I *run*?" | "what would I *catch*?" |

Mutation testing is the stronger signal — and the costlier one. Coverage is the daily metric; mutation score is the audit.

---

## Tool demonstration

In `/section-advanced`, open the **Mutation Score Explorer**:

1. Read the target function and its seeded mutants.
2. Pick a test preset — see which mutants it kills and which survive.
3. Watch the score: `killed / (total − equivalent)`.
4. Add a test to kill a survivor and see the score rise.

---

## Tool — seeded mutants and a test suite

![w:980](../assets/slides/msx-overview-en.png)

A target function, its mutants, and the suite run against each.

---

## Tool — the score dashboard

![w:980](../assets/slides/msx-dashboard-en.png)

killed / (total − equivalent) — survivors point at the suite's gaps.

---


## Summary

- Mutation testing seeds **mutants** (small faults) and checks whether the suite **kills** them.
- **Mutation operators** model plausible programmer mistakes.
- Each mutant is **killed**, **survived**, or **equivalent** (excluded).
- **Mutation score = killed / (total − equivalent)** — it measures *fault detection*, where coverage only measures *execution*.

**In-class exercise:** a test runs a function but has no `assert`. Its statement coverage is 100%. What is its mutation score? Why?

---

## Further reading

- Course specification — mutation testing chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- DeMillo, Lipton & Sayward (1978) — original mutation analysis
- Tool source: [MutationScoreExplorer.js](../../src/components/MutationScoreExplorer.js)
- Related: **#18 Code Coverage** · **#32 Equivalent Mutants** · **#34 LLM Test-Generation Pipeline**
