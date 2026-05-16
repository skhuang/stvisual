---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #43 — Chaos Engineering
description: Deliberately injecting failure to discover how a system breaks — blast radius, fault propagation, and the resilience hypothesis.
lang: en
---

# Chaos Engineering
### Break it on purpose, before it breaks on its own

Software Testing Visualization series #43 · Acceptance & E2E
Companion tool: `/section-acceptance` ([ChaosEngineeringExplorer](../../src/components/ChaosEngineeringExplorer.js))

<!-- The lecture inverts the student's instinct: instead of proving the system works, deliberately make it fail and watch. -->

---

## Why this lecture exists

- Every test so far asked: *does the system work?* Chaos engineering asks: *how does it **fail**?*
- A distributed system has dependencies that *will* fail in production — a slow database, a dead service, a network partition.
- You cannot stop those failures. You **can** discover, in advance, whether the system survives them.
- Chaos engineering injects those failures **deliberately**, while you are watching.

---

## The core idea: experiment on a real system

Chaos engineering is not random destruction — it is a **controlled experiment**:

1. Form a **hypothesis**: "if the payment service goes down, checkout degrades gracefully and search still works."
2. **Inject** the failure (kill the service, add latency, drop packets).
3. **Observe** what actually happens.
4. **Compare** to the hypothesis. A gap is a resilience defect — found *before* a real outage.

> You are testing the system's *response to failure*, not its happy path.

---

## Dependency graphs and fault propagation

Model the system as a graph: nodes are services, edges are "depends on".

```
        Web
       /    \
    Auth    Orders
              |
           Payment   ← inject failure here
```

When `Payment` fails, the failure **propagates** *backward* along the edges:

- `Orders` depends on `Payment` → `Orders` is affected.
- `Web` depends on `Orders` → `Web` is affected.
- `Auth` does **not** depend on `Payment` → `Auth` is unaffected.

---

## Blast radius

The **blast radius** of a fault is the set of services it ends up affecting.

- A small blast radius = the failure was **contained** — good isolation.
- A large blast radius = one dead service took down half the system — poor isolation.

Chaos experiments **measure** the blast radius. Shrinking it — with timeouts, retries, fallbacks, bulkheads — is the resilience work the experiment motivates.

> A fault you cannot prevent, you can still **contain.**

---

## Principles of doing it safely

Chaos engineering is deliberate, not reckless:

- **Start small** — one fault, in a controlled environment, before production.
- **Have a blast-radius limit** — and an abort switch ("game day" stop button).
- **Monitor heavily** — an experiment you cannot observe teaches you nothing.
- **Steady state first** — know what "healthy" looks like, or you cannot tell what the fault changed.

---

## Tool demonstration

In `/section-acceptance`, open the **Chaos Engineering Explorer**:

1. Read a service dependency topology.
2. Inject a fault into one node.
3. Watch the failure **propagate** backward along the dependency edges.
4. Read the **blast radius** — which services lost pass rate, which were isolated.

---

## Summary

- Chaos engineering asks *how the system fails*, by **injecting failure deliberately** while observing.
- It is a **controlled experiment**: hypothesis → inject → observe → compare.
- A fault **propagates** backward through a dependency graph; the affected set is the **blast radius**.
- You cannot prevent dependency failures — but you can **contain** them; chaos experiments measure how well.

**In-class exercise:** in the graph above, inject a fault into `Auth`. What is its blast radius? Why is it different from `Payment`'s?

---

## Further reading

- Course specification — resilience testing chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- *Principles of Chaos Engineering* (principlesofchaos.org); Netflix Chaos Monkey
- Tool source: [ChaosEngineeringExplorer.js](../../src/components/ChaosEngineeringExplorer.js)
- Related: **#42 Performance & Load Testing** · **#30 Integration Testing**
