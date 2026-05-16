---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #23 — Pairwise Testing
description: Covering every pair of parameter values without the combinatorial explosion — the 2-way coverage heuristic.
lang: en
---

# Pairwise Testing
### Test every *pair*, not every *combination*

Software Testing Visualization series #23
Companion tool: `/section-blackbox` ([PairwiseExplorer](../../src/components/PairwiseExplorer.js))

<!-- This lecture answers the question the equivalence-partitioning lecture (#20) raised: how do we test interactions without the Cartesian product? -->

---

## Why this lecture exists

- Configuration spaces explode: 3 OSes × 3 browsers × 2 versions × 4 locales = **72** combinations.
- Testing all of them (exhaustive / SECT, #20) is infeasible.
- Testing one value of each in isolation misses **interaction** bugs.
- Pairwise testing is the empirically-backed middle ground.

---

## The empirical observation

Studies of real defect data (NIST and others) found:

- Most interaction faults are triggered by **just two** parameters interacting.
- Faults needing three or more parameters to interact are comparatively rare.

> If most bugs hide in *pairs*, cover **every pair** — and stop there.

This is a **heuristic**, not a proof — but a remarkably effective one.

---

## What pairwise coverage means

A test suite has **pairwise (2-way) coverage** if:

> for *every two parameters*, *every combination of their values* appears together in *at least one* test.

You are not covering every full combination — only every **pair** of values. The same test reuses its values to satisfy many pairs at once.

---

## Worked example: OS × Browser × Version

3 × 3 × 2 = **18** exhaustive combinations. A pairwise suite needs far fewer:

| Test | OS | Browser | Version |
| --- | --- | --- | --- |
| 1 | Windows | Chrome | Latest |
| 2 | Windows | Firefox | Previous |
| 3 | Mac | Chrome | Previous |
| 4 | Mac | Safari | Latest |
| 5 | Linux | Firefox | Latest |
| 6 | Linux | Safari | Previous |
| … | … | … | … |

~9 tests cover **every (OS,Browser), (OS,Version), (Browser,Version) pair** — half the exhaustive count, and it grows logarithmically, not multiplicatively.

---

## The payoff: sub-linear growth

| Parameters | Exhaustive | Pairwise |
| --- | --- | --- |
| 3 (×3 values) | 27 | ~9 |
| 5 | 243 | ~13 |
| 10 | 59,049 | ~15 |

Exhaustive grows **multiplicatively**; pairwise grows roughly **logarithmically**. That gap is the whole reason the technique exists.

---

## Strengths and limits

**Strengths**
- Massive test reduction with strong empirical defect coverage.
- Tooling generates the suite automatically from the parameter list.

**Limits**
- A **heuristic** — it can miss a genuine 3-way interaction fault.
- For higher assurance, use **t-way** coverage (`t = 3, 4 …`) at higher cost.
- Needs a parameter model first — garbage parameters, garbage suite.

---

## Tool demonstration

In `/section-blackbox`, open the **Pairwise Explorer**:

1. Pick a preset (`OS × Browser`, then add `Version`).
2. Compare the **exhaustive** count with the generated **pairwise** suite.
3. Pick any two parameters — confirm every value pair appears in some test.
4. Add a parameter and watch the suite grow only slightly.

---

## Summary

- Most interaction bugs involve **two** parameters — so cover **every pair**.
- Pairwise (2-way) coverage: every value combination of every parameter *pair* appears in some test.
- Growth is ~logarithmic, not multiplicative — the key advantage over exhaustive/SECT.
- It is a heuristic; raise to **t-way** when two-way assurance is not enough.

**In-class exercise:** a form has 4 parameters with 3 values each. Exhaustive = 81. Estimate the pairwise suite size, then check with the tool.

---

## Further reading

- Course specification — combinatorial testing chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- Kuhn, Kacker & Lei, *Practical Combinatorial Testing* (NIST, 2010)
- Tool source: [PairwiseExplorer.js](../../src/components/PairwiseExplorer.js)
- Related: **#20 Equivalence Partitioning** (WECT vs SECT) · **#24 Cause-Effect Graphing**
