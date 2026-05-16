---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #48 — The W-Method
description: The classic FSM conformance test — state cover, characterizing set, and a suite guaranteed to catch every transfer and output fault.
lang: en
---

# The W-Method
### A conformance test with a *guarantee*

Software Testing Visualization series #48 · Model-Based Testing
Companion tool: `/section-mbt` ([WMethodConformanceExplorer](../../src/components/WMethodConformanceExplorer.js))

<!-- The theoretical peak of the FSM lectures. The headline is the word "guarantee" — under a stated assumption, the W-method misses nothing. -->

---

## Why this lecture exists

- FSM test generation (#47) gave us *coverage* criteria — heuristics with no guarantee.
- The **W-method** (Chow, 1978) is different: under one stated assumption, it **provably catches every transfer and output fault.**
- It answers *conformance*: does the implementation match the specification FSM?
- A test method with a proof behind it is worth understanding precisely.

---

## The conformance question

You have a **specification FSM** and an **implementation**. Does the implementation **conform** — behave exactly as the spec FSM says?

Two fault kinds can break conformance:

- **Output fault** — a transition emits the wrong output.
- **Transfer fault** — a transition goes to the wrong target state.

Output faults are easy to see. **Transfer faults are sneaky** — same output, wrong state — and the W-method is built to catch them.

---

## Ingredient 1 — the state cover P

The **state cover** `P` is a set of input sequences that, between them, **reach every state** of the FSM from the start state.

- It includes the empty sequence ε (reaches the initial state).
- `|P|` ≈ the number of states.

`P` answers: *"can I get to every state?"* — but reaching a state is not the same as *identifying* it.

---

## Ingredient 2 — the characterizing set W

The **characterizing set** `W` is the clever part. It is a set of input sequences that **tells every pair of states apart**:

> for any two states, *some* sequence in `W` produces a different output from each.

`W` is a **state identifier**: run a `W` sequence from an unknown state, read the output, and you know *which* state you were in. This is exactly how a transfer fault — landing in the wrong state — gets exposed.

---

## The test suite

Combine the ingredients. The transition cover is `P ∪ P·X` (P, plus P extended by one input). The full W-suite is:

$$
T = (P \cup P{\cdot}X) \cdot X^{\le m} \cdot W
$$

- `(P ∪ P·X)` — drive into and across every transition.
- `· W` — after each, run a characterizing sequence to **identify the state you landed in**.
- `X^{≤m}` — the extra-states allowance (next slide).

Appending `W` turns every landing state into an observable output trace.

---

## The guarantee — and its price

> **Under the assumption that the implementation has at most *m* extra states**, the W-suite catches **every** transfer and output fault.

- That assumption is the price. The guarantee is conditional.
- Bigger `m` → a stronger guarantee → a larger suite: it grows polynomially, roughly with `n²` and `|X|^(m+1)`.
- Violate the assumption (the implementation has *more* hidden states) and a fault can slip through.

A real guarantee — but read the fine print.

---

## Tool demonstration

In `/section-mbt`, open the **W-Method Conformance Explorer**:

1. Read the spec FSM; see `P`, `W`, the transition cover and the suite computed.
2. Use the *distinguish* panel — watch a `W` sequence separate two look-alike states.
3. Inject a transfer-fault mutant and see which suite test catches it.
4. Raise `m` and watch the suite size grow.

---

## Summary

- The **W-method** is a conformance test: does the implementation match the spec FSM?
- **State cover P** reaches every state; **characterizing set W** tells every state pair apart.
- The suite **(P ∪ P·X)·X^≤m·W** appends `W` to identify the landing state — exposing transfer faults.
- Under the **"at most *m* extra states"** assumption it catches *every* transfer / output fault — a conditional guarantee.

**In-class exercise:** why is a characterizing set `W` needed at all — why is firing every transition not enough?

---

## Further reading

- Course specification — FSM conformance chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- Chow, *Testing Software Design Modeled by Finite-State Machines* (1978)
- Tool source: [WMethodConformanceExplorer.js](../../src/components/WMethodConformanceExplorer.js)
- Related: **#47 FSM Test Generation** · **#49 EFSM Guarded Transitions**
