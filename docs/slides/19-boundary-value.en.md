---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #19 — Boundary Value Analysis
description: Why bugs cluster at the edges — 5-point and robustness boundary value analysis, and how to derive test inputs from input ranges.
lang: en
---

# Boundary Value Analysis
### Bugs live at the edges

Software Testing Visualization series #19
Companion tool: `/section-blackbox` ([BoundaryValueExplorer](../../src/components/BoundaryValueExplorer.js))

<!-- First black-box technique of the series. The whole lecture rests on one empirical fact: defects cluster at boundaries. -->

---

## Why this lecture exists

- A variable with range `1–12` has thousands of possible values — you cannot test them all.
- But defects are **not uniformly distributed**: they cluster at the **boundaries**.
- Off-by-one errors, `<` vs `<=`, `==` instead of `>=` — all live at the edge.
- BVA spends your test budget where the bugs actually are.

---

## The core idea

For each input range, the dangerous values are the **edges**, not the middle.

```
   ●────────────────────────────●
  min       (typical)          max
```

A test in the middle exercises the "happy" path. A test *at* `min` or `max` — and just *outside* — exercises the code that **decides** the range.

> Conceptual anchor: test the *decision*, not the *region*.

---

## 5-point boundary value analysis

For a range `[min, max]`, pick five values per variable:

| Point | Value | Tests |
| --- | --- | --- |
| Below min | `min − 1` | the lower guard |
| At min | `min` | inclusive lower edge |
| Nominal | a typical mid value | the normal case |
| At max | `max` | inclusive upper edge |
| Above max | `max + 1` | the upper guard |

Hold all *other* variables at their nominal value while you vary one.

---

## Robustness BVA

Standard 5-point BVA already includes the just-outside values.
**Robustness BVA** makes the out-of-range cases first-class — it explicitly asks: *what does the program do with invalid input?*

- Does `day = 32` raise an error, clamp, or silently corrupt?
- Robustness testing treats `min−1` and `max+1` as **required** tests, not optional.

This matters most where input is untrusted (user forms, APIs).

---

## Worked example: `NextDate(month, day)`

Ranges: `month ∈ [1,12]`, `day ∈ [1,31]`.

Vary `month`, hold `day` nominal (= 15):

| month | expected |
| --- | --- |
| 0 | invalid |
| 1 | January 16 |
| 6 | June 16 |
| 12 | December 16 |
| 13 | invalid |

Then repeat, varying `day` and holding `month` nominal. 5 points × 2 variables.

---

## How many tests?

For *n* variables, each with a range:

- **5-point BVA:** `4n + 1` tests — vary one variable through its 5 points, others nominal; the single all-nominal test is shared.
- BVA does **not** test boundary *combinations* (both at max at once) — that is the job of pairwise testing (#23).

BVA is cheap and linear in *n* — its discipline is *one variable at a time*.

---

## Strengths and limits

**Strengths**
- Tiny, targeted suites that hit the highest-defect-density inputs.
- Pairs naturally with equivalence partitioning (#20) — pick boundaries *of each partition*.

**Limits**
- Assumes the input is an *ordered range* — useless for unordered/categorical input.
- Misses defects that need *combinations* of extreme values.
- A range with no real ordering (an enum) has no meaningful boundary.

---

## Tool demonstration

In `/section-blackbox`, open the **Boundary Value Explorer**:

1. Choose an example (`NextDate`, `triangle`).
2. Toggle between **5-point** and **robustness** BVA.
3. Read the generated points for each variable — note which are in/out of range.
4. Add a variable and watch the test count grow as `4n + 1`.

---

## Summary

- Defects cluster at **boundaries** — test the edges, not the middle.
- **5-point BVA:** below-min, min, nominal, max, above-max — one variable at a time.
- **Robustness BVA** promotes the out-of-range cases to required tests.
- Cost is `4n + 1`; combinations of extremes are out of scope — see pairwise (#23).

**In-class exercise:** for an `age` field accepting `18–65`, list the 5 BVA values. What does your system do with `17` and `66`?

---

## Further reading

- Course specification — black-box design chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- Jorgensen, *Software Testing: A Craftsman's Approach* — boundary value testing
- Tool source: [BoundaryValueExplorer.js](../../src/components/BoundaryValueExplorer.js)
- Next: **#20 Equivalence Partitioning** — choosing *which* values, not just the edges
