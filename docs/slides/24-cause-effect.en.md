---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #24 — Cause-Effect Graphing
description: Turning a logical specification into causes, effects and Boolean formulas — then into a decision table of tests.
lang: en
---

# Cause-Effect Graphing
### From a logic spec to a test suite, formally

Software Testing Visualization series #24
Companion tool: `/section-blackbox` ([CauseEffectExplorer](../../src/components/CauseEffectExplorer.js))

<!-- This lecture is the bridge: it shows decision tables (#21) are not invented, they are *derived* from a logical model of the spec. -->

---

## Why this lecture exists

- A decision table (#21) is powerful — but where do its rows come from?
- For logic-heavy requirements you need a disciplined way to **extract** the conditions and outcomes.
- Cause-effect graphing models a specification as a **Boolean network**: causes → logic → effects.
- From that network you derive the decision table — and the tests — *systematically*, not by guesswork.

---

## Causes and effects

| Term | Meaning |
| --- | --- |
| **Cause** | A distinct input condition (a Boolean) |
| **Effect** | A distinct output / system action |
| **Graph** | Boolean logic (`AND`, `OR`, `NOT`) wiring causes to effects |

```
 C1 ─┐
     AND──▶ E1
 C2 ─┘
```

Read the specification once; name every cause and every effect.

---

## Worked example: a checkout system

**Causes:** C1 user logged in · C2 cart not empty · C3 payment valid.

**Effects**, each a Boolean formula over the causes:

| Effect | Formula |
| --- | --- |
| E1 Show checkout | `C1 AND C2` |
| E2 Process order | `C1 AND C2 AND C3` |
| E3 Show error | `C1 AND C2 AND NOT C3` |

The graph makes the spec **executable as logic** — no prose ambiguity left.

---

## From graph to decision table

Each combination of cause values is a column; evaluate every effect formula:

| | C1 | C2 | C3 | E1 | E2 | E3 |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | T | T | T | ✓ | ✓ | – |
| R2 | T | T | F | ✓ | – | ✓ |
| R3 | T | F | * | – | – | – |
| R4 | F | * | * | – | – | – |

The cause-effect graph **generates** the decision table; the decision table **generates** the tests. One unbroken chain from spec to suite.

---

## Constraints prune impossible columns

Real causes are not always independent. Cause-effect graphs add **constraints**:

- **E (exclusive)** — at most one of these causes is true.
- **I (inclusive)** — at least one is true.
- **R (requires)** — cause A true requires cause B true.
- **O (one and only one)** — exactly one is true.

Constraints delete physically-impossible columns *before* you waste a test on them — e.g. "paid in full" and "paid nothing" cannot both be true.

---

## Where it fits among the black-box techniques

- **Equivalence partitioning / BVA** — handle one input *dimension* at a time.
- **Cause-effect graphing** — handles the *logical relationships between* inputs.
- **Decision table** — the tabular form the graph produces.

Cause-effect graphing is the **modelling** step; the decision table is its **output**. Use it when the requirement is a knot of interacting Boolean conditions.

---

## Tool demonstration

In `/section-blackbox`, open the **Cause-Effect Explorer**:

1. Read the checkout causes (C1–C3) and effects (E1–E3) with their formulas.
2. Edit an effect formula and watch the derived decision table update.
3. Add a constraint and see impossible columns disappear.
4. Read off one test case per surviving rule.

---

## Summary

- Cause-effect graphing models a spec as **causes → Boolean logic → effects**.
- It **derives** a decision table systematically — rows are not guessed.
- **Constraints** (E, I, R, O) delete physically impossible combinations.
- Chain: specification → cause-effect graph → decision table → test cases.

**In-class exercise:** write the cause-effect formulas for an ATM withdrawal (card valid · PIN correct · sufficient balance). Add one constraint.

---

## Further reading

- Course specification — black-box design chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- Myers, *The Art of Software Testing* — cause-effect graphing
- Tool source: [CauseEffectExplorer.js](../../src/components/CauseEffectExplorer.js)
- Related: **#21 Decision Table Testing** (the output form) · **#5 Logic Coverage**
