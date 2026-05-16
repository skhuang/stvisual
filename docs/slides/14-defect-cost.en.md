---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #14 — The Cost of Late Defects
description: Why a defect costs more the later it is found — the cost-escalation curve, rework propagation, and the shift-left strategy.
lang: en
---

# The Cost of Late Defects
### Why *when* you find a bug matters more than *how*

Software Testing Visualization series #14
Companion tool: `/section-flow` ([DefectCostExplorer](../../src/components/DefectCostExplorer.js))

<!-- This is a short, motivational lecture. It justifies every other lecture in the series: testing earlier is not a preference, it is an economic argument. -->

---

## Why this lecture exists

- Beginners ask: *"Why test early? Can't we just test at the end?"*
- The answer is economic, not stylistic.
- A defect is not a fixed-price item — **its price depends on when you catch it.**
- This lecture gives you the one curve every test strategy is built to bend.

> Conceptual anchor: a defect is a *liability that accrues interest*.

---

## The cost-escalation curve

Relative cost to fix one defect, by the phase it is **found** in:

| Phase found | Relative cost |
| --- | --- |
| Requirements | 1× |
| Design | 3× |
| Coding | 10× |
| Testing | 40× |
| Production | 100× |

The exact numbers vary by study (Boehm 1981; NIST 2002) — the **shape** does not: cost rises roughly an order of magnitude per phase.

<!-- Stress that the numbers are illustrative and rounded. The defensible claim is the order-of-magnitude shape, not "100x exactly". -->

---

## Why does the cost escalate?

A defect introduced early but found late has had time to **propagate**:

- A wrong requirement is read by designers, coders, and testers.
- Each downstream artifact built on it is now also wrong.
- Fixing it means unwinding *every* artifact that depended on it.

```
bad requirement
   └─ wrong design
        └─ wrong code
             └─ wrong tests  ← all must be redone
```

The defect did not get worse — **the blast radius did.**

---

## Worked example: one misunderstood requirement

A requirement says "users may retry login"; the team assumes *unlimited* retries.

| Found in | What it costs |
| --- | --- |
| Requirements review | One hour — edit a sentence (**1×**) |
| Design review | Re-design the lockout state (**3×**) |
| Unit testing | Rework the auth module + its tests (**10×**) |
| System testing | Fix, full re-test cycle, doc update (**40×**) |
| Production | Security incident, hotfix, audit, apology (**100×**) |

Same defect. The only variable is **the date it was caught.**

---

## The strategy this curve implies: shift left

If cost rises with phase, push every detection activity **as early as possible**:

- Review requirements *before* design starts.
- Write unit tests *with* the code, not after.
- Run static analysis on every commit.
- Test acceptance criteria *while refining the story*.

"Shift left" is just **acting on the cost curve.** It is not a process fad — it is arithmetic.

---

## Phase-appropriate detection techniques

Each phase has techniques that catch its own defects cheaply:

| Phase | Catch it with |
| --- | --- |
| Requirements | Requirements review, prototyping, example mapping |
| Design | Design review, architecture walkthrough |
| Coding | Code review, static analysis, unit testing |
| Testing | Integration / system / regression testing |
| Production | Monitoring, incident response, hotfixes |

The goal: move detection **up** this table.

---

## Tool demonstration

In `/section-flow`, open the **Defect Cost Explorer**:

1. Read the five phase bars — note the **logarithmic** height scale.
2. Click a phase to see its example and the techniques that catch defects there.
3. Compare the requirements bar (1×) with the production bar (100×).
4. Trace one defect down the phases and watch the multiplier grow.

The explorer makes the curve concrete — the same curve this whole course is organized around.

---

## A fair caveat

- The "100×" figure is **illustrative**, from older waterfall studies.
- Modern continuous delivery shortens the phases — but the *shape* survives: a production incident still costs far more than a review comment.
- The lesson is directional: **earlier is cheaper**, not "exactly 100×".

<!-- Pre-empt the smart student who has read that the 100x figure is disputed. Concede the number, defend the shape. -->

---

## Summary

- A defect's cost depends on **when it is found**, not what it is.
- Cost rises ~10× per phase because defects **propagate** into downstream work.
- "Shift left" means acting on that curve — detect early, where it is cheap.
- Every later lecture in this series is a *technique for shifting left*.

**In-class exercise:** take a bug your team shipped recently. Which phase introduced it? Which phase *could* have caught it? Estimate the cost difference.

---

## Further reading

- Course specification — testing lifecycle chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- Boehm, *Software Engineering Economics* (1981) — the original cost curve
- NIST, *The Economic Impacts of Inadequate Infrastructure for Software Testing* (2002)
- Tool source: [DefectCostExplorer.js](../../src/components/DefectCostExplorer.js)
- Next: **#15 The V-Model** — pairing each build phase with a test phase
