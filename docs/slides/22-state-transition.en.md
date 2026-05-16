---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #22 — State Transition Testing
description: Testing systems whose behavior depends on history — states, events, transitions, and transition / state coverage.
lang: en
---

# State Transition Testing
### When the same input does different things

Software Testing Visualization series #22
Companion tool: `/section-blackbox` ([StateTransitionExplorer](../../src/components/StateTransitionExplorer.js))

<!-- Decision tables (#21) handled combinational logic; this lecture handles *sequential* logic, where order and history matter. -->

---

## Why this lecture exists

- Decision tables (#21) assume the output depends only on the **current inputs**.
- But many systems have **memory**: a media player's "play" button means different things when playing vs paused.
- The same event produces different results depending on **history**.
- State-transition testing models that memory explicitly — as a machine.

---

## The model: a finite-state machine

Four ingredients:

| Element | Meaning |
| --- | --- |
| **State** | A mode the system can be in |
| **Event** | An input that may cause a change |
| **Transition** | `(state, event) → next state` |
| **Action / output** | What the system emits on a transition |

```
  Red ──timer──▶ Green ──timer──▶ Yellow ──timer──▶ Red
```

A transition diagram *is* the test basis.

---

## Worked example: a traffic light

States: `Red`, `Green`, `Yellow`. One event: `timer`.

| From | Event | To | Action |
| --- | --- | --- | --- |
| Red | timer | Green | "Go" |
| Green | timer | Yellow | "Slow" |
| Yellow | timer | Red | "Stop" |

Three states, three transitions. A real system (a vending machine, an ATM session) simply has more of each.

---

## Coverage criteria on the machine

How thoroughly do we exercise the machine?

- **State coverage** — every state is visited at least once. Weakest.
- **Transition coverage** — every transition is fired at least once. The usual baseline; it subsumes state coverage.
- **Transition-pair coverage** — every pair of consecutive transitions. Catches "wrong target state" faults.
- **Round-trip / path coverage** — every loop or full path. Strongest, largest.

Most teams target **transition coverage** and treat it as the floor.

---

## Why transition coverage matters

A transition can be **missing**, go to the **wrong state**, or emit the **wrong action**.

- *State coverage* can visit a state via a different route and never test the broken transition into it.
- *Transition coverage* forces every `(state, event)` edge to fire — so a missing or misrouted transition is caught.

The diagram also exposes **invalid events** — pressing "eject" while `Idle` — which are tests in their own right.

---

## Generating test sequences

A test case is a **path through the machine** — a sequence of events from the start state:

```
Red → (timer) Green → (timer) Yellow → (timer) Red
```

- Each step checks: did we land in the expected state? was the expected action emitted?
- Transition coverage = a set of paths that together fire every edge.
- This is the black-box root of **model-based testing** — see the whole #L series.

---

## Tool demonstration

In `/section-blackbox`, open the **State Transition Explorer**:

1. Load the **Traffic Light** (or **Vending Machine**, **ATM**) machine.
2. Read the SVG state diagram — states as nodes, transitions as edges.
3. Switch between **state coverage** and **transition coverage** and read the generated sequences.
4. Try an invalid event and see it has no transition.

---

## Summary

- Use state-transition testing when behavior depends on **history**, not just current input.
- Model = **states, events, transitions, actions** — a finite-state machine.
- Coverage ladder: state ⊂ transition ⊂ transition-pair ⊂ round-trip.
- **Transition coverage** is the practical baseline; a test case is a path through the machine.

**In-class exercise:** model a media player (`Stopped`, `Playing`, `Paused`). List every transition. Which `(state, event)` pairs are invalid?

---

## Further reading

- Course specification — black-box design chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- Binder, *Testing Object-Oriented Systems* — state-based testing
- Tool source: [StateTransitionExplorer.js](../../src/components/StateTransitionExplorer.js)
- Related: **#21 Decision Tables** (combinational) · **#L2 FSM Test Generation** (model-based)
