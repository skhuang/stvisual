---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #38 — BDD & Gherkin
description: Behaviour-driven acceptance tests in plain language — Feature, Scenario, Given-When-Then, and Scenario Outlines.
lang: en
---

# BDD & Gherkin
### Acceptance tests the whole team can read

Software Testing Visualization series #38 · Acceptance & E2E
Companion tool: `/section-acceptance` ([BDDGherkinExplorer](../../src/components/BDDGherkinExplorer.js))

<!-- First of the Acceptance series. The key shift: a test that is also a specification, written in business language. -->

---

## Why this lecture exists

- Unit-level tests (#16) speak in code — the business cannot read them.
- An acceptance test must answer: *did we build what the customer asked for?* (validation, #15).
- **BDD** writes acceptance tests in **structured plain language** — readable by developers, testers *and* the business.
- The same document is the **specification** and the **test**.

---

## The Gherkin structure

Gherkin is the language BDD tests are written in. Three levels:

| Keyword | Meaning |
| --- | --- |
| **Feature** | A capability being described |
| **Scenario** | One concrete example of that capability |
| **Given / When / Then** | The steps of a scenario |

```gherkin
Feature: Discount codes

  Scenario: A valid code reduces the total
    Given a cart subtotal of $50
    When the customer applies code "SAVE10"
    Then the order total is $45
```

---

## Given-When-Then

The three step keywords map to a clear structure:

- **Given** — the *context* / preconditions. The world before the action.
- **When** — the *action* / event. The one thing under test.
- **Then** — the *expected outcome*. What must be observable afterwards.

> Given a state · When an event · Then an outcome.

This is the same arrange-act-assert shape as a unit test — but in business language.

---

## Step definitions: from prose to code

A Gherkin step is plain text; a **step definition** binds it to executable code:

```
"the customer applies code {string}"  ──▶  applyCode(code)
```

- Each step matches a definition (often by a pattern).
- A step with **no** definition is *unbound* — the scenario cannot run.
- The feature file stays readable; the wiring lives in step definitions.

---

## Scenario Outline: one scenario, many cases

Repeating a scenario for each data row is wasteful. A **Scenario Outline** parameterizes it:

```gherkin
  Scenario Outline: Discount tiers
    Given a cart subtotal of <subtotal>
    When the customer applies "<code>"
    Then the total is <total>

    Examples:
      | subtotal | code    | total |
      | 50       | SAVE10  | 45    |
      | 200      | SAVE20  | 160   |
```

An *N*-row Examples table fans out into ***N* parameterized test cases** — the table *is* a decision table (#21) in disguise.

---

## Strengths and limits

**Strengths**
- One artifact serves as **spec, test and living documentation**.
- Business-readable — supports the Three Amigos conversation (#M5).
- Examples tables make data-driven cases explicit.

**Limits**
- The plain language is a *veneer* — the step definitions still need real engineering.
- Vague steps produce vague tests; Gherkin does not enforce good assertions.
- Over-used for low-level logic, it adds ceremony without readers — keep it for *business-facing* behaviour.

---

## Tool demonstration

In `/section-acceptance`, open the **BDD / Gherkin Explorer**:

1. Load a preset feature (`login`, `discount`, `cart`).
2. See unbound steps flagged in red — bind them and the scenario runs.
3. Open a Scenario Outline and watch the Examples table fan out into cases.
4. Follow the bridge to the Decision Table Explorer (#21).

---

## Summary

- **BDD** writes acceptance tests in structured plain language — readable by the whole team.
- **Gherkin** structure: **Feature → Scenario → Given/When/Then**.
- **Step definitions** bind plain-text steps to executable code.
- A **Scenario Outline + Examples** table fans out into *N* parameterized cases — a decision table in disguise.

**In-class exercise:** write a Feature with one Scenario for "password reset". Then turn it into a Scenario Outline with three Examples rows.

---

## Further reading

- Course specification — acceptance testing chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- North, *Introducing BDD* (2006); Wynne & Hellesøy, *The Cucumber Book*
- Tool source: [BDDGherkinExplorer.js](../../src/components/BDDGherkinExplorer.js)
- Related: **#21 Decision Tables** · **#M5 Example Mapping** · **#44 ATDD Cycle**
