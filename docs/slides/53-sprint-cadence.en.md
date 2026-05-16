---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #53 — Sprint Testing Cadence
description: Testing as a continuous activity woven through a sprint — refinement to retro, and the waterfall contrast.
lang: en
---

# Sprint Testing Cadence
### Testing is not a phase — it is the whole sprint

Software Testing Visualization series #53 · Agile Testing
Companion tool: `/section-agile` ([SprintCadenceExplorer](../../src/components/SprintCadenceExplorer.js))

<!-- The quadrants (#52) were a static map; this lecture is the timeline — testing happening continuously across the sprint. -->

---

## Why this lecture exists

- The V-model (#15) and the cost curve (#14) said: test early.
- The quadrants (#52) said: there are four kinds of testing.
- This lecture puts them on a **timeline** — *when* in a sprint does each happen?
- The answer corrects the deepest beginner instinct: **"build first, test later."**

---

## The waterfall instinct — and its cost

The intuitive sequence:

```
 requirements ─▶ design ─▶ code ───────────────▶ TEST ─▶ release
                                                  ▲
                                          one big phase, at the end
```

- A misunderstanding from *requirements* is not detected until the test phase — **months** later.
- The cost curve (#14) makes that catastrophically expensive.
- Defects from every earlier stage surface **all at once**, far from where they were made.

---

## The agile cadence — testing woven through

In an agile sprint, testing happens at **every** stage:

| Sprint stage | Testing activity |
| --- | --- |
| Backlog refinement | clarify acceptance criteria, example mapping (#55) |
| Sprint planning | agree the Definition of Done (#54), plan test tasks |
| Daily development | TDD, CI on every commit |
| Story testing | test each story as it is finished; exploratory testing |
| Sprint review | demo, acceptance feedback, UAT |
| Retrospective | inspect the testing process itself |

No separate test phase — testing is **continuous.**

---

## Feedback latency: the core difference

The contrast is about *how long a defect stays hidden*:

- **Waterfall** — a defect from requirements waits until the test phase: **weeks to months**.
- **Agile** — a regression is caught on the **commit** that caused it; a story is tested **days** after it is built.

Short feedback latency means defects are caught **near their source** — cheap to fix (#14). The cadence is the cost curve, applied to a sprint.

---

## "Shift left" — acting on the cadence

**Shift left** means: move every testing activity to the **earliest** sprint stage it can run in.

- Don't wait for "story testing" to think about tests — clarify acceptance criteria at **refinement**.
- Don't wait for a test phase to run regression — run it on **every commit**.
- Whole-team responsibility: developers, testers and the PO all test, *all sprint long*.

The cadence is just shift-left made concrete.

---

## Agile keeps the V-model's pairing

Agile does **not** throw away the V-model (#15) — it keeps the *pairing* of build and test, but **collapses the timeline.**

- The four V-model verification pairs still exist.
- They no longer span months — they all happen **inside one sprint.**

The V-model is the *structure*; the sprint cadence is that structure compressed into a continuous loop.

---

## Tool demonstration

In `/section-agile`, open the **Sprint Cadence Explorer**:

1. Walk the agile sprint timeline — each stage and its testing activities.
2. Toggle to **waterfall** mode — see testing collapse into one late phase.
3. Compare the feedback-latency and defect-escape figures.
4. Try shifting a testing activity earlier and watch the cost fall.

---

## Summary

- Agile testing is **continuous** — woven through refinement, planning, development, story testing, review and retro.
- The waterfall "test at the end" defers detection by **weeks to months**, against the cost curve (#14).
- Short **feedback latency** catches defects near their source — cheap to fix.
- **Shift left** = run each test activity at its earliest possible stage; agile keeps the V-model pairing but collapses its timeline.

**In-class exercise:** name one testing activity your team currently defers to "later." Which sprint stage should it move to?

---

## Further reading

- Course specification — agile testing chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- Crispin & Gregory, *Agile Testing* — testing through the iteration
- Tool source: [SprintCadenceExplorer.js](../../src/components/SprintCadenceExplorer.js)
- Related: **#14 Defect Cost** · **#15 V-Model** · **#52 Agile Testing Quadrants**
