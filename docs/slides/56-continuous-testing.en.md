---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #56 — Continuous Testing Pipeline
description: Tiered automated feedback — commit, PR and nightly tiers, feedback latency, flaky impact and test-impact analysis.
lang: en
---

# Continuous Testing Pipeline
### Fast feedback is a design problem

Software Testing Visualization series #56 · Agile Testing
Companion tool: `/section-agile` ([ContinuousTestingPipelineExplorer](../../src/components/ContinuousTestingPipelineExplorer.js))

<!-- The CI/CD side of agile testing. The lecture's spine: feedback time is a budget, and tier assignment is how you spend it. -->

---

## Why this lecture exists

- The sprint cadence (#53) said: test on every commit. But a test suite has thousands of tests.
- Run them all on every commit and feedback takes **hours** — developers stop waiting and lose flow.
- Run too few and bugs slip through.
- A **continuous testing pipeline** solves this by running tests in **tiers**, each with its own speed budget.

---

## The three tiers

Tests run at different points in the delivery flow, each with a feedback budget:

| Tier | Runs on | Budget | Typical tests |
| --- | --- | --- | --- |
| **Commit** | every commit / push | seconds | unit tests |
| **PR** | every pull request | minutes | unit + integration |
| **Nightly** | once per day | hours | + end-to-end |

The earlier the tier, the **tighter the time budget** — and the faster the feedback.

---

## Assigning tests to tiers

Every test type is assigned a tier — and the assignment *is* the design decision:

- A test runs at its assigned tier **and every later one**.
- Put fast unit tests on **commit** → instant feedback on most regressions.
- Put slow E2E tests (#40) on **nightly** → they never block a commit.

> Put a slow test on the commit tier and you wreck the loop for *everyone*.

This is the test pyramid (#17) expressed as a pipeline.

---

## Feedback latency is the metric

The number that matters is **how long a developer waits** before knowing if a change is safe.

- A 10-second commit tier → the developer stays in flow.
- A 20-minute commit tier → they context-switch, and a failure found later is more expensive to fix (#14).

Adding one slow end-to-end test to the commit tier can turn seconds into minutes. **Feedback latency is a budget you actively spend.**

---

## Flaky tests poison the pipeline

A flaky test (#45) in an early tier is corrosive:

- It fails spuriously → the commit tier goes red for no real reason.
- Developers learn to **ignore red** → a real regression now hides among the flakes.
- The probability that *some* test flakes rises with the test count: a 2% flaky rate across 500 commit-tier tests makes a clean run unlikely.

A fast pipeline that no one trusts is worse than a slow one.

---

## Test-impact analysis

The smartest lever: don't run *every* test on every commit — run only the tests **affected by the change**.

- **Test-impact analysis** maps each test to the code it exercises.
- A commit touching one module runs only that module's tests.
- The commit tier shrinks dramatically → fast feedback *and* broad coverage.

It is how large codebases keep the commit tier fast as the suite grows (compare #M6's risk-based selection).

---

## Tool demonstration

In `/section-agile`, open the **Continuous Testing Pipeline Explorer**:

1. Assign each test type to a tier — watch the feedback time per tier.
2. Move e2e tests onto the commit tier and see the loop break.
3. Raise the flaky rate and read the spurious-failure probability.
4. Toggle test-impact analysis and watch the commit tier shrink.

---

## Summary

- A **continuous testing pipeline** runs tests in **tiers** — commit (seconds), PR (minutes), nightly (hours).
- **Tier assignment** is the design decision; a slow test on the commit tier wrecks feedback for everyone.
- **Feedback latency** is the metric — and a budget you actively spend.
- **Flaky tests** poison early tiers; **test-impact analysis** keeps the commit tier fast as the suite grows.

**In-class exercise:** an 8-minute end-to-end test — which tier? What happens to feedback latency if it goes on the commit tier?

---

## Further reading

- Course specification — continuous testing chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- Humble & Farley, *Continuous Delivery* (2010)
- Tool source: [ContinuousTestingPipelineExplorer.js](../../src/components/ContinuousTestingPipelineExplorer.js)
- Related: **#17 The Test Pyramid** · **#45 Flaky Diagnosis** · **#57 Regression & Test Debt**
