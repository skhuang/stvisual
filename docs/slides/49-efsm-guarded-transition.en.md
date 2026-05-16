---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #49 — EFSM & Guarded Transitions
description: Extended FSMs add data variables and guard conditions — feasible vs infeasible paths, and constraint solving for concrete inputs.
lang: en
---

# EFSM & Guarded Transitions
### When a transition depends on *data*, not just an event

Software Testing Visualization series #49 · Model-Based Testing
Companion tool: `/section-mbt` ([EFSMGuardedTransitionExplorer](../../src/components/EFSMGuardedTransitionExplorer.js))

<!-- The bridge from black-box FSM models to white-box reasoning. Guards make some abstract paths infeasible — and that needs a solver. -->

---

## Why this lecture exists

- A plain FSM (#47–#48) fires a transition on an **event** alone.
- Real systems guard transitions with **data conditions**: *withdraw* only fires if `amount ≤ balance`.
- An **Extended FSM (EFSM)** adds data variables and **guard conditions** to transitions.
- Guards change the game: some abstract paths become **impossible** — and detecting that needs a constraint solver.

---

## What a guard is

A **guarded transition** fires only when its **guard** — a boolean condition over data variables — is true:

```
 Checking ──[ amount <= 100 ]── approve ──▶ Approved
 Checking ──[ amount >= 101 ]── decline ──▶ Denied
```

One graph edge, conditioned on data. The guard **splits** a transition: the same source state branches differently depending on the data.

---

## Feasible vs infeasible paths

A path through the EFSM collects the guards along it. The path is:

- **Feasible** — if *some* assignment of the data variables satisfies **all** the guards together.
- **Infeasible** — if the conjoined guards **contradict**: no input can ever drive this path.

```
 path guards:  amount ≥ 1  ∧  amount ≤ 100  ∧  amount ≥ 200
                              └── unsatisfiable ──┘
```

An infeasible path is a *dead test* — generating a test for it wastes effort.

---

## Plain FSM vs EFSM path counts

A plain FSM treats every graph path as testable. An EFSM does not:

```
 graph paths (FSM view):   5
 feasible paths (EFSM):    3   ← 2 pruned by contradictory guards
```

Guards **prune** the impossible paths *before* you waste a test on each. The EFSM's feasible-path count, not the raw graph count, is the real test budget.

---

## Constraint solving — concrete inputs

For a **feasible** path, you still need real input *values*. The conjoined guards form a constraint system; a solver finds a satisfying assignment:

```
 amount ≥ 1  ∧  amount ≤ 100   ──solve──▶   amount = 50
```

This is the same constraint-solving idea as symbolic execution (#10): a path condition → a solver → a concrete witness. The EFSM is where black-box modelling meets white-box path reasoning.

---

## What the extra modelling buys you

An EFSM costs more than a plain FSM — you must write guards and data variables. In return:

- **Infeasible paths are pruned** — no wasted tests.
- **Feasible paths come with concrete inputs** — generated, not hand-picked.
- The model catches **data-dependent** faults a plain FSM cannot express.

When behaviour genuinely depends on data, the extra modelling pays for itself.

---

## Tool demonstration

In `/section-mbt`, open the **EFSM Guarded-Transition Explorer**:

1. Read the EFSM — transitions with their guards.
2. For each abstract path, see its guard conjunction and a feasible / infeasible verdict.
3. For a feasible path, see the solver's concrete input value.
4. Compare the plain-FSM path count with the EFSM feasible count.

---

## Tool — guarded transitions

![w:980](../assets/slides/efsm-overview-en.png)

Each path carries a guard conjunction — feasible only if the solver agrees.

---

## Tool — the EFSM

![w:980](../assets/slides/efsm-model-en.png)

Transitions with guards — many syntactic paths turn out infeasible.

---


## Summary

- An **EFSM** adds data variables and **guard conditions** to a plain FSM's transitions.
- A guard **splits** a transition; a path is **feasible** only if its conjoined guards are satisfiable.
- Guards **prune infeasible paths** — the feasible count is the real test budget.
- A **constraint solver** turns a feasible path's guards into concrete input values.

**In-class exercise:** a path collects `x > 0`, `x < 50`, `x > 100`. Feasible? If a path is feasible, what does the solver give you that path coverage alone does not?

---

## Further reading

- Course specification — model-based testing chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- Utting & Legeard, *Practical Model-Based Testing* — extended FSMs
- Tool source: [EFSMGuardedTransitionExplorer.js](../../src/components/EFSMGuardedTransitionExplorer.js)
- Related: **#10 Symbolic Execution** · **#5 Logic Coverage** (clause binding) · **#48 W-Method**
