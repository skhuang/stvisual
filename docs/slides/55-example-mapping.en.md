---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #55 — Three Amigos & Example Mapping
description: Refining a story before code — rules, examples and questions on coloured cards, and the readiness signal.
lang: en
---

# Three Amigos & Example Mapping
### Quality starts at refinement, before a line of code

Software Testing Visualization series #55 · Agile Testing
Companion tool: `/section-agile` ([ExampleMappingExplorer](../../src/components/ExampleMappingExplorer.js))

<!-- The upstream feeder for BDD (#38) and the DoR (#54). The lecture's point: the cheapest bug to fix is the one you talk out before coding. -->

---

## Why this lecture exists

- The cost curve (#14) says the cheapest defect is the one caught in *requirements*.
- But how, concretely, do you catch a defect *before any code exists*?
- The answer is a structured **refinement conversation** — and a technique to run it.
- **Three Amigos** + **Example Mapping** turn a vague story into a clear, testable one.

---

## The Three Amigos

A story is refined by three perspectives — the "three amigos":

| Role | Brings |
| --- | --- |
| **Business / BA** | *intent* — why the story matters, the business rules |
| **Developer** | *feasibility* — edge cases, technical constraints |
| **Tester** | *doubt* — the missing examples, the ambiguous wording |

No single role sees the whole story. The conversation between them surfaces what each one alone would miss.

---

## Example Mapping: four colours of card

Matt Wynne's **Example Mapping** structures the conversation with four card colours:

| Card | Colour | Holds |
| --- | --- | --- |
| **Story** | yellow | the user story being refined |
| **Rule** | blue | a business rule / acceptance criterion |
| **Example** | green | a concrete example illustrating a rule |
| **Question** | red | an open, unanswered question |

A story breaks into rules; each rule is illustrated by examples; anything unknown becomes a red question.

---

## A worked map: discount codes

```
 [yellow]  As a shopper, I can apply a discount code at checkout

 [blue] A valid code reduces the total
    [green] SAVE10 on a $50 order → $45
    [green] FREESHIP on a $50 order → shipping $0
 [blue] An expired code is rejected
    [green] XMAS2023 entered in 2026 → "code expired"

 [red] Can a discount make the total negative?
 [red] Do codes stack with a loyalty discount?
```

The map *is* the refined specification — concrete, and visibly incomplete where the red cards are.

---

## Red cards are the readiness signal

The count of **red (question) cards** is a direct readiness signal:

- **Few or no red cards** → the story is well understood — it can enter the sprint (it passes the Definition of Ready, #54).
- **Many red cards** → the story is **not ready**; pulling it in now means it will **stall mid-sprint** when a question finally surfaces.

> Red cards are unknowns. A story carrying unknowns into a sprint is a story that will stall.

---

## Examples become BDD scenarios

The **green example cards** are not throwaway — they are the raw material for the next step:

- Each green example maps directly onto a Gherkin **Scenario** (#38): the example's setup → *Given*, the action → *When*, the outcome → *Then*.
- So Example Mapping is the **upstream feeder** of BDD: the conversation produces examples; BDD writes them down as executable scenarios.

Refinement → examples → scenarios → tests. One unbroken chain, starting before any code.

---

## Tool demonstration

In `/section-agile`, open the **Example Mapping Explorer**:

1. Read a story's example map — yellow, blue, green and red cards.
2. Resolve the red question cards and watch the readiness meter change.
3. Switch role perspectives — BA, developer, tester.
4. Turn a green example into a Gherkin scenario.

---

## Summary

- **Three Amigos** (business, dev, tester) refine a story so no single blind spot survives.
- **Example Mapping** structures it with four cards: **story (yellow), rules (blue), examples (green), questions (red)**.
- **Red cards** are the readiness signal — too many means the story is not ready (#54).
- **Green examples** feed directly into BDD/Gherkin scenarios (#38) — quality starts before code.

**In-class exercise:** for "users can reset their password", write one rule (blue), two examples (green), and one open question (red).

---

## Further reading

- Course specification — agile testing chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- Wynne, *Introducing Example Mapping* (2015)
- Tool source: [ExampleMappingExplorer.js](../../src/components/ExampleMappingExplorer.js)
- Related: **#38 BDD & Gherkin** · **#54 Definition of Ready/Done** · **#44 ATDD Cycle**
