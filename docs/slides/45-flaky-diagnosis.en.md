---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #45 — Flaky Test Diagnosis
description: Tests that pass and fail without a code change — the flaky-test taxonomy, diagnosis from logs, and quarantine.
lang: en
---

# Flaky Test Diagnosis
### The test that fails for no reason — and why that is a reason

Software Testing Visualization series #45 · Acceptance & E2E
Companion tool: `/section-acceptance` ([FlakyDiagnosisExplorer](../../src/components/FlakyDiagnosisExplorer.js))

<!-- Closes the Acceptance series. E2E (#40) named flakiness as the cost; this lecture is how to diagnose and manage it. -->

---

## Why this lecture exists

- A **flaky test** passes and fails **without any change to the code or the test**.
- It is the most corrosive thing in a test suite: it trains the team to **ignore red**.
- Once "just re-run it" becomes the habit, a *real* failure hides among the flakes.
- Flakiness is not noise to tolerate — it is a defect **in the test** to diagnose and fix.

---

## Why flaky tests are so damaging

- A red build no longer means "broken" → the team stops trusting the suite.
- Real regressions slip through, dismissed as "probably just flaky."
- CI time is burned on re-runs.
- Trust, once lost, is expensive to rebuild.

> One ignored flaky test poisons the whole suite's signal.

---

## The flaky-test taxonomy

Flakiness has identifiable **causes** — and each leaves a fingerprint in the logs:

| Cause | Typical symptom |
| --- | --- |
| **Timing / async** | acted before an element / response was ready |
| **Network** | a slow or dropped request to a dependency |
| **Animation** | interacted with an element mid-transition |
| **Test order** | passes alone, fails after another test (shared state) |
| **Concurrency** | a race between parallel operations |
| **Environment / data** | a clock, locale, or fixture differed between runs |

Diagnosis is **classification**: read the failure log, match the fingerprint.

---

## Diagnosing from the log

You rarely watch a flake happen — you diagnose it from the **failure log** afterwards:

- *"Element not found"* right after navigation → **timing**.
- *Passes in isolation, fails in the suite* → **test order** / shared state.
- *Timeout waiting on a request* → **network**.
- *Differs by machine or time of day* → **environment**.

The log is the evidence; the taxonomy is the set of suspects.

---

## Order dependence — the sneaky one

A test that **passes alone but fails after another test** is order-dependent:

```
   testB alone        → PASS
   testA, then testB  → FAIL   ← testA left shared state behind
```

The bug is not in `testB` — it is that tests are **not isolated**. The fix: each test sets up and tears down its own state, so order cannot matter.

---

## Quarantine: stop the bleeding, then fix

You cannot fix every flake immediately — but you must stop it eroding trust:

1. **Quarantine** — move the flaky test out of the blocking suite. The build is trustworthy again *now*.
2. **Schedule the fix** — quarantine is a holding pen, not a graveyard. A quarantined test still owns a to-do.
3. **Fix the root cause** — by category: wait on conditions not delays; isolate state; stub the network; control the clock.
4. **Return it** to the blocking suite once stable.

> Quarantine ≠ delete. Delete loses coverage; quarantine buys time.

---

## Tool demonstration

In `/section-acceptance`, open the **Flaky Diagnosis Explorer**:

1. Read a failure log sample.
2. Classify it into the taxonomy — match the fingerprint to a cause.
3. Check your diagnosis against the rationale.
4. Note the recommended fix differs by category.

---

## Summary

- A **flaky test** passes and fails with no code change — it **poisons trust** in the whole suite.
- Flakiness has identifiable causes: **timing, network, animation, test order, concurrency, environment**.
- **Diagnosis = classification** — read the log, match the fingerprint.
- **Quarantine** stops the bleeding; then fix the **root cause** by category. Quarantine is not deletion.

**In-class exercise:** a test fails ~1 in 20 runs with "stale element reference". Which category? What is the fix?

---

## Further reading

- Course specification — test reliability chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- Google Testing Blog — *Flaky Tests* series
- Tool source: [FlakyDiagnosisExplorer.js](../../src/components/FlakyDiagnosisExplorer.js)
- Related: **#40 E2E User Journeys** · **#M4 Continuous Testing** · **#M6 Regression & Test Debt**
