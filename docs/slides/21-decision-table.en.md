---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #21 — Decision Table Testing
description: Turning tangled business rules into a complete, non-redundant set of test cases — conditions, actions, rules, and rule collapsing.
lang: en
---

# Decision Table Testing
### When the logic is "it depends" — tabulate it

Software Testing Visualization series #21
Companion tool: `/section-blackbox` ([DecisionTableExplorer](../../src/components/DecisionTableExplorer.js))

<!-- Decision tables are the go-to technique whenever a requirement is a tangle of "if this and that but not the other". -->

---

## Why this lecture exists

- Some requirements are pure combinational logic: *"discount applies if member **and** cart ≥ \$50 **and** not on sale."*
- Prose hides cases; a developer reading it will miss a combination.
- A decision table makes the logic **exhaustive and visible** — every combination is a column.
- It generates a test suite that is **complete by construction**.

---

## Anatomy of a decision table

| Part | Meaning |
| --- | --- |
| **Conditions** | The boolean inputs that drive the decision |
| **Actions** | The outcomes the system can produce |
| **Rules** | One column = one combination of condition values → its actions |

```
            Rule1  Rule2  Rule3  Rule4 …
Condition C1   T      T      F      F
Condition C2   T      F      T      F
─────────────────────────────────────
Action A1      ✓      –      –      –
```

With *n* conditions, a full table has **2ⁿ rules**.

---

## Worked example: a login system

Conditions: **valid username**, **valid password**, **account locked**.

| | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Valid username | T | T | T | T | F | F | F | F |
| Valid password | T | T | F | F | T | T | F | F |
| Account locked | T | F | T | F | T | F | T | F |
| **Action** | deny | **grant** | deny | deny | deny | deny | deny | deny |

8 rules = 2³ combinations. Exactly one grants access — and you can *see* it.

---

## Rule collapsing — the "don't care"

When some conditions **cannot affect the outcome**, merge their rules with a *don't-care* (`–`):

```
Valid username  F            ← if the username is wrong,
Valid password  –              password and lock state
Account locked  –              are irrelevant
Action          deny
```

Four rules (R5–R8) collapse into one. The collapsed table is **smaller but still complete** — fewer test cases, same coverage.

---

## Deriving the test suite

Each **rule (column)** becomes one test case:

- **Inputs** = the condition values in that column.
- **Expected result** = the action(s) marked for that column.

A collapsed table → one test per collapsed rule. The suite is complete *by construction*: every reachable combination of conditions is represented.

---

## Strengths and limits

**Strengths**
- **Completeness is guaranteed** — no combination is forgotten.
- Collapsing keeps the suite small without losing coverage.
- Doubles as a precise *specification* — ambiguous prose becomes a table.

**Limits**
- 2ⁿ grows fast — 6 conditions = 64 rules before collapsing.
- Only models **combinational** logic — for *sequential* behavior (order matters) use state-transition testing (#22).

---

## Tool demonstration

In `/section-blackbox`, open the **Decision Table Explorer**:

1. Load the **Login System** example — read the 8 rules.
2. Toggle a cell to a *don't-care* and watch rules collapse.
3. Read the coverage badge — every combination accounted for.
4. Add a condition and watch the rule count double.

---

## Summary

- A decision table = **conditions × actions**, one **rule** per combination — `2ⁿ` rules.
- **Rule collapsing** with don't-cares shrinks the table while keeping it complete.
- Each rule → one test case; the suite is **complete by construction**.
- For combinational logic only — sequential behavior needs state-transition testing (#22).

**In-class exercise:** build a 3-condition decision table for "free shipping" (member · order ≥ \$50 · weekday promo). Which rules collapse?

---

## Further reading

- Course specification — black-box design chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- Copeland, *A Practitioner's Guide to Software Test Design* — decision tables
- Tool source: [DecisionTableExplorer.js](../../src/components/DecisionTableExplorer.js)
- Related: **#24 Cause-Effect Graphing** (derives a decision table from logic) · **#22 State Transition Testing**
