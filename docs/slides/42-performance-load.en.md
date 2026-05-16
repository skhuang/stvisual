---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #42 — Performance & Load Testing
description: How a system behaves under concurrency — load shapes, the latency-vs-load curve, capacity and the knee.
lang: en
---

# Performance & Load Testing
### Does it still work when *everyone* shows up?

Software Testing Visualization series #42 · Acceptance & E2E
Companion tool: `/section-acceptance` ([PerformanceLoadProfileExplorer](../../src/components/PerformanceLoadProfileExplorer.js))

<!-- A non-functional testing lecture. The single concept to land: latency is not constant — it depends on load. -->

---

## Why this lecture exists

- Every test so far asked *"is the answer correct?"* — a **functional** question.
- Performance testing asks a **non-functional** question: *is the answer fast enough, under realistic concurrency?*
- A system that is correct for one user can be unusably slow for ten thousand.
- This lecture is about one curve: **latency as a function of load.**

---

## The four load shapes

Different risks need different load *profiles* over time:

| Shape | Profile | Tests for |
| --- | --- | --- |
| **Steady (load)** | flat, expected level | normal-day behaviour |
| **Stress** | ramps up past capacity | the breaking point |
| **Spike** | a brief, sharp surge | sudden traffic (a launch, a sale) |
| **Soak** | flat, but for a long time | leaks, slow degradation |

Each shape answers a different question — "stress" finds the limit; "soak" finds the slow rot.

---

## The latency-vs-load curve

The central model: latency depends on concurrency.

```
 latency
   │                          ╱  ← the "knee"
   │                       ╱
   │__________________╱
   │   (flat below capacity)
   └──────────────────────────── concurrency
                    ▲ capacity
```

- **Below capacity** — latency is roughly **flat**; the system keeps up.
- **At capacity** — the **knee**: latency starts climbing sharply.
- **Above capacity** — latency rises steeply; requests queue, then time out.

---

## Capacity and the knee

- **Capacity** is the concurrency level the system can serve before latency degrades.
- The **knee** is where the flat curve bends upward — the practical limit.
- Performance testing's job is to **find the knee** and check it sits comfortably above your real expected load.
- If expected load is *near* the knee, you have no headroom — a spike will tip you over.

---

## Key metrics — and why averages lie

Report latency as **percentiles**, not the mean:

- **p50 (median)** — the typical experience.
- **p95 / p99** — the *tail*: the slowest 5% / 1% of requests.

> The average hides the tail. A "200 ms average" can still mean 1% of users wait 5 seconds.

Also track **throughput** (requests/sec served) and **error rate** (failures / timeouts). All three move together near the knee.

---

## Tool demonstration

In `/section-acceptance`, open the **Performance Load Profile Explorer**:

1. Pick a load shape: **steady → stress → spike → soak**.
2. Watch concurrency drive the latency curve over time.
3. Find the **knee** — where latency leaves its flat region.
4. Compare the spike shape with steady: same peak, very different latency.

---

## Summary

- Performance testing is **non-functional**: not "is it correct?" but "is it fast enough under load?"
- Four load shapes — **steady, stress, spike, soak** — each probes a different risk.
- Latency is **flat below capacity**, then bends sharply at the **knee**.
- Report **percentiles (p95/p99)**, not averages — the average hides the tail.

**In-class exercise:** your service's knee is at 800 concurrent users; expected peak is 700. Is that safe? What shape of test would you run before a product launch?

---

## Further reading

- Course specification — non-functional testing chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- Gregg, *Systems Performance* — latency, throughput, saturation
- Tool source: [PerformanceLoadProfileExplorer.js](../../src/components/PerformanceLoadProfileExplorer.js)
- Related: **#43 Chaos Engineering** · **#16 Testing Types** (non-functional levels)
