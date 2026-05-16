---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #32 — The Equivalent Mutant Problem
description: Mutants that no test can ever kill — why they distort the mutation score, and an LLM-assisted classifier to detect them.
lang: en
---

# The Equivalent Mutant Problem
### The mutant that *cannot* be killed

Software Testing Visualization series #32 · Advanced Testing
Companion tool: `/section-advanced` ([EquivalentMutantExplorer](../../src/components/EquivalentMutantExplorer.js))

<!-- First of the Advanced Testing series. It sets up the central nuisance of mutation testing, which #33 then measures around. -->

---

## Why this lecture exists

- Mutation testing seeds a program with small faults (**mutants**) and asks: does the test suite **kill** them?
- But some mutants are **behaviourally identical** to the original — *no input* produces a different output.
- These **equivalent mutants** can never be killed — yet they drag down the mutation score.
- Detecting them is undecidable in general; this lecture shows a practical, LLM-assisted approach.

---

## What is an equivalent mutant?

A mutant is **equivalent** if it computes the *same function* as the original for **every** input:

```js
// original
for (i = 0; i < n; i++) { … }

// mutant — '<' changed to '!='
for (i = 0; i != n; i++) { … }
```

If `i` only ever increases from `0`, `i < n` and `i != n` are **equivalent** — the loop behaves identically. No test can tell them apart.

---

## Why equivalent mutants hurt

The mutation score is `killed / non-equivalent total` (see #33). If equivalent mutants are *miscounted as live*:

- The score is **artificially low** — the suite looks worse than it is.
- Engineers chase "uncovered" mutants that are **impossible** to cover.
- Time is wasted writing tests for behaviour that does not exist.

> An equivalent mutant surviving is *not* a test gap — it is a *non-bug*.

Telling the two apart is the equivalent-mutant problem.

---

## Why it is hard

Deciding whether two programs compute the same function is **undecidable** — equivalent to the halting problem.

- You cannot, in general, *prove* equivalence automatically.
- Historically this was the biggest manual cost of mutation testing.
- The practical answer: don't aim for a decision procedure — aim for a **good-enough classifier** that handles the common cases cheaply and flags the rest.

---

## A three-step classifier

The ACH approach (Meta, arXiv 2501.12862) screens mutants in increasing cost order:

| Step | Check | Catches |
| --- | --- | --- |
| 1. Syntactic | Is the mutant textually identical to the original? | trivial no-ops |
| 2. Strip comments / formatting | Identical after normalizing whitespace & comments? | cosmetic mutations |
| 3. LLM judge | Ask an LLM: *are these two snippets behaviourally equivalent?* | semantic equivalence |

Cheap deterministic checks first; the expensive LLM judgement only on what survives.

---

## The LLM judge — strengths and limits

Step 3 uses an LLM as a *semantic* equivalence judge:

**Why it helps** — LLMs reason about intent and common idioms (`i<n` vs `i!=n` under a monotone loop) that syntactic checks miss.

**Its limits** — an LLM verdict is a *heuristic*, not a proof. It can be wrong both ways. So:
- A "equivalent" verdict is a **strong hint**, subject to review.
- The classifier *reduces* manual effort; it does not eliminate the human.

---

## Tool demonstration

In `/section-advanced`, open the **Equivalent Mutant Explorer**:

1. Step through the three-stage classifier on a sample mutant.
2. See which mutants are filtered by the cheap syntactic checks.
3. Read the LLM judge's equivalence verdict and reasoning.
4. Watch how excluding equivalent mutants changes the mutation score.

---

## Summary

- An **equivalent mutant** computes the same function as the original — *no test can kill it*.
- Counted as live, it makes the mutation score **artificially low** and wastes effort.
- Detecting equivalence is **undecidable** — aim for a classifier, not a proof.
- A cheap-to-expensive pipeline (syntactic → normalize → **LLM judge**) handles most cases; the verdict is a hint, not a proof.

**In-class exercise:** is `x = x + 0` always an equivalent mutation? Is `a && b` → `b && a`? Justify each.

---

## Further reading

- Course specification — mutation testing chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- *Mutation-Guided LLM-based Test Generation at Meta* (arXiv 2501.12862, FSE 2025)
- Tool source: [EquivalentMutantExplorer.js](../../src/components/EquivalentMutantExplorer.js)
- Next: **#33 Mutation Score** — measuring suite quality once equivalents are removed
