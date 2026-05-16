---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #36 — Fault-Directed Test Generation
description: Aiming test generation at real fault classes instead of blind coverage — the 2.4% → 15% leap from coverage-driven to fault-directed.
lang: en
---

# Fault-Directed Test Generation
### Generate tests *toward a fault*, not toward coverage

Software Testing Visualization series #36 · Advanced Testing
Companion tool: `/section-advanced` ([FaultDirectedTestingExplorer](../../src/components/FaultDirectedTestingExplorer.js))

<!-- The lecture contrasts two philosophies of automatic test generation. The headline number (2.4% -> 15%) is the whole argument. -->

---

## Why this lecture exists

- Automatic test generators traditionally chase **coverage**: reach every line, every branch.
- But coverage-driven generation produces mutants and tests that are **blind** — unrelated to faults anyone actually cares about.
- ACH instead generates tests **directed at a fault class** described in plain language.
- The result is a large jump in *useful* tests — this lecture explains why.

---

## Two philosophies of generation

| | Coverage-driven (blind) | Fault-directed |
| --- | --- | --- |
| Goal | execute uncovered code | catch a *specific kind* of fault |
| Mutants | wherever code is uncovered | where the described fault could occur |
| Test value | "a line ran" | "this fault would be caught" |
| Acceptance by engineers | low | high |

Coverage-driven asks *"what haven't I executed?"* Fault-directed asks *"what could go wrong here, and would I catch it?"*

---

## What "directed" means

ACH starts from a **fault description** — often a real issue report:

> *"A null device token can leak into the logging path and crash the worker."*

That description **steers** every stage:

- Mutation generation seeds faults *of that kind* (null-handling), not random edits.
- Test generation aims to catch *that* failure mode.

The generator is no longer wandering — it is **hunting a named fault**.

---

## Worked example: a null-token leak

A function processes a device token; the issue says a `null` token can leak.

- **Coverage-driven:** mutate any uncovered line, generate a test that reaches it. Most generated tests touch code unrelated to the leak.
- **Fault-directed:** seed mutants in the *null-handling* paths; generate a test that feeds a `null` token and asserts it is rejected — directly reproducing the described fault.

Same target function — but the fault-directed tests are *about the bug*.

---

## The headline result

On Meta's codebase, moving from coverage-driven to fault-directed generation:

| Approach | Tests judged useful by engineers |
| --- | --- |
| TestGen-LLM (coverage-driven) | ~2.4% |
| ACH (fault-directed) | ~15% |

A **~6× improvement** in the rate of accepted tests. The numbers are illustrative of the paper's headline — the *direction* of the effect is the point: aiming at faults beats aiming at coverage.

---

## Why direction beats coverage

- Coverage is a **proxy** — executing a line is not catching a bug (#18, #33).
- A fault description is **ground truth about risk** — it names what the team actually fears.
- Generation steered by that description spends its budget on the **fault classes that matter** (this is risk-based thinking, #31, applied to generation).

> Don't generate tests to *cover code*. Generate tests to *catch the faults you can name*.

---

## Tool demonstration

In `/section-advanced`, open the **Fault-Directed Testing Explorer**:

1. Read an annotated issue and its target function.
2. Compare the **blind (coverage-driven)** mutants with the **fault-directed** mutants.
3. See which generated tests actually relate to the described fault.
4. Note the acceptance-rate contrast — the 2.4% → 15% story.

---

## Summary

- Coverage-driven generation is **blind** — it chases lines, not faults.
- Fault-directed generation starts from a **fault description** and steers every stage toward it.
- On Meta's data, the accepted-test rate rose from ~2.4% to ~15% — a ~6× gain.
- Coverage is a proxy; a named fault is ground truth — **aim at the fault.**

**In-class exercise:** given the issue "negative quantities bypass the stock check", describe one fault-directed mutant and the test that would kill it.

---

## Further reading

- *Mutation-Guided LLM-based Test Generation at Meta* (arXiv 2501.12862, FSE 2025)
- Course specification — AI-assisted testing chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- Tool source: [FaultDirectedTestingExplorer.js](../../src/components/FaultDirectedTestingExplorer.js)
- Related: **#31 Risk-Based Testing** · **#34 LLM Test Pipeline** · **#37 SAILOR**
