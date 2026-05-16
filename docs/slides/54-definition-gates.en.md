---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #54 — Definition of Ready / Done
description: The two agile quality gates — a story not "ready" wastes a sprint; a story not "done" leaks defects.
lang: en
---

# Definition of Ready / Done
### Two gates: one into the sprint, one out

Software Testing Visualization series #54 · Agile Testing
Companion tool: `/section-agile` ([DefinitionGatesExplorer](../../src/components/DefinitionGatesExplorer.js))

<!-- The lecture frames DoR and DoD as quality GATES. The key contrast: entry gate vs exit gate, clarity vs completeness. -->

---

## Why this lecture exists

- The sprint cadence (#53) has stories flowing in and out. Without **gates**, anything flows.
- A story pulled in while still vague **stalls mid-sprint** — the team discovers the ambiguity too late.
- A story called "done" while still defective **leaks bugs** to the next stage.
- The **Definition of Ready** and **Definition of Done** are those two gates.

---

## Two gates, two questions

```
        ┌─ DoR ─┐                    ┌─ DoD ─┐
 backlog│ entry │  ──▶ development ──▶│ exit  │──▶ done
        │ gate  │                    │ gate  │
        └───────┘                    └───────┘
   "clear enough                "truly finished
    to START?"                   to be DONE?"
```

- **Definition of Ready** — an *entry* gate. *Clarity*: is the story understood well enough to begin?
- **Definition of Done** — an *exit* gate. *Completeness*: is the work genuinely finished?

They are not the same checklist applied twice — different questions, different points.

---

## What a Definition of Ready checks

DoR criteria are about **clarity** — could the team start *today* without guessing?

- Acceptance criteria are written, testable and unambiguous.
- Test data and environment are identified.
- External dependencies are resolved or stubbed.
- The story is small enough to finish within the sprint.

A story failing DoR is **not pulled in** — fixing the gap now costs an hour, not a sprint.

---

## What a Definition of Done checks

DoD criteria are about **completeness** — is the work *truly* finished, not just "code written"?

- All automated tests pass in CI.
- Code has been reviewed and merged.
- Every acceptance criterion has been verified.
- No known Sev-1 / Sev-2 defects remain.

A story failing DoD is **not done** — regardless of how finished it looks.

---

## A weak gate does not stop work — it leaks

The critical insight: a gate you do not enforce **does not block the defect** — it just lets it through to a **more expensive stage** (the cost curve, #14).

- DoR skipped → ambiguity leaks into development → rework mid-sprint.
- A DoD criterion treated as "optional" → a defect leaks into production.

Each disabled gate criterion is a **specific class of defect** you have chosen to let escape.

---

## DoD and "done done"

A common anti-pattern: "done" means *code written* — but not reviewed, not tested, not verified.

The DoD exists precisely to make **"done" mean done.** It is a *shared, explicit* agreement so that "done" cannot quietly mean different things to a developer, a tester and the PO.

> If your team argues about whether a story is "done", you have a DoD problem.

---

## Tool demonstration

In `/section-agile`, open the **Definition of Ready / Done Explorer**:

1. Read the two gate checklists, DoR and DoD.
2. Toggle a criterion off and run a story through the gates.
3. Watch a latent issue **leak** to the next stage when its gate criterion is disabled.
4. Compare which issues a strong gate catches vs a weak one.

---

## Summary

- **DoR** and **DoD** are agile's two quality gates — one *into* the sprint, one *out*.
- **DoR** = *clarity* (ready to start?); **DoD** = *completeness* (truly finished?).
- A weak gate does not stop the work — it **leaks the defect** to a more expensive stage.
- The DoD makes **"done" mean done** — a shared, explicit agreement.

**In-class exercise:** classify each as DoR or DoD — "acceptance criteria are testable", "CI is green", "no known Sev-1 bugs", "dependencies resolved".

---

## Further reading

- Course specification — agile testing chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- Scrum Guide — Definition of Done
- Tool source: [DefinitionGatesExplorer.js](../../src/components/DefinitionGatesExplorer.js)
- Related: **#14 Defect Cost** · **#55 Example Mapping** (feeds the DoR) · **#44 ATDD Cycle**
