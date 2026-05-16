---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #44 — The ATDD Cycle
description: Acceptance-test-driven development — discuss, distill, develop, demo — agreeing on the test before writing the code.
lang: en
---

# The ATDD Cycle
### Agree on the acceptance test *before* writing the code

Software Testing Visualization series #44 · Acceptance & E2E
Companion tool: `/section-acceptance` ([ATDDCycleExplorer](../../src/components/ATDDCycleExplorer.js))

<!-- ATDD is the process wrapper around BDD (#38). The lecture's point: the acceptance test is a SHARED AGREEMENT made up front, not a check done at the end. -->

---

## Why this lecture exists

- BDD (#38) gave us a *notation* for acceptance tests. ATDD gives us the *process* for creating them.
- The usual order — build, then test — discovers misunderstandings **late** (the #14 cost curve).
- **ATDD** (Acceptance-Test-Driven Development) flips it: the team agrees on the acceptance test **first**, and that test *defines done*.
- The acceptance test becomes a contract written before any code.

---

## The four-stage cycle: the four D's

ATDD runs each story through four stages:

```
   Discuss ──▶ Distill ──▶ Develop ──▶ Demo
      ▲                                  │
      └──────────────────────────────────┘
```

| Stage | What happens |
| --- | --- |
| **Discuss** | The team explores the story with concrete examples |
| **Distill** | Examples are distilled into explicit acceptance tests |
| **Develop** | Code is written to make those tests pass |
| **Demo** | The passing tests are demonstrated against the real story |

---

## Discuss — shared understanding first

The story is explored *as a team* — typically the **Three Amigos** (business, dev, test; see #M5):

- Concrete examples surface the edge cases prose hid.
- Open questions are raised *now*, while they cost an hour, not a sprint (#14).
- The output is a shared understanding — not yet a test, but the raw material for one.

Discuss is where ambiguity is killed cheaply.

---

## Distill — examples become acceptance tests

The examples from *Discuss* are **distilled** into explicit, checkable acceptance tests:

- Written in business-readable form — Gherkin (#38) is the common notation.
- Each test names a precondition, an action and an expected outcome.
- This set of tests now **defines "done"**: the story is finished when, and only when, they pass.

> Distill turns "we talked about it" into "here is the test we agreed on."

---

## Develop & Demo — build to a known target

**Develop** — the team writes code to make the distilled tests pass.
- The target is fixed and explicit; there is no "what did they mean?" mid-sprint.
- The acceptance tests are run continuously as a definition-of-done check.

**Demo** — the passing tests are demonstrated against the original story.
- The demo *is* the acceptance: the stakeholder sees the agreed tests pass.
- Anything not covered by a distilled test is, by definition, not in scope.

---

## ATDD vs TDD

Both are "test-first" — at different altitudes:

| | TDD | ATDD |
| --- | --- | --- |
| Level | unit | acceptance / story |
| Audience | a developer | the whole team |
| Test asks | "does this function work?" | "did we build the right feature?" |
| Written by | the developer | the Three Amigos together |

TDD drives the *code*; ATDD drives the *feature*. They nest — an ATDD story contains many TDD loops.

---

## Tool demonstration

In `/section-acceptance`, open the **ATDD Cycle Explorer**:

1. Step through **Discuss → Distill → Develop → Demo**.
2. At *Discuss*, see examples gathered; at *Distill*, see them become acceptance tests.
3. Note that *Develop* targets a fixed, pre-agreed set of tests.
4. See *Demo* close the loop against the original story.

---

## Summary

- **ATDD** agrees on the acceptance test **before** the code — the test defines "done".
- The cycle is four D's: **Discuss → Distill → Develop → Demo**.
- *Discuss* kills ambiguity early; *Distill* turns examples into checkable tests; *Develop* builds to a fixed target; *Demo* is the acceptance.
- ATDD drives the **feature**; TDD drives the **code** — they nest.

**In-class exercise:** take a story you know. List two examples you would raise in *Discuss*, then distill one into a Given/When/Then test.

---

## Further reading

- Course specification — agile acceptance chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- Pugh, *Lean-Agile Acceptance Test-Driven Development* (2011)
- Tool source: [ATDDCycleExplorer.js](../../src/components/ATDDCycleExplorer.js)
- Related: **#38 BDD & Gherkin** · **#M5 Example Mapping** · **#M3 Definition of Ready/Done**
