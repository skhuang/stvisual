---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #35 — Test Quality Gates
description: Five filters every machine-generated test must pass before a human ever sees it — buildable, non-flaky, hardening, relevant, well-styled.
lang: en
---

# Test Quality Gates
### A generated test is worthless until it earns trust

Software Testing Visualization series #35 · Advanced Testing
Companion tool: `/section-advanced` ([TestQualityExplorer](../../src/components/TestQualityExplorer.js))

<!-- The lecture's job: a test-generation pipeline (#34) produces volume; quality gates produce TRUST. Without gates, automation just makes more noise. -->

---

## Why this lecture exists

- An LLM pipeline (#34) can generate **thousands** of candidate tests.
- Volume without quality is *worse* than nothing — it floods code review with noise.
- For automation to be adopted, each generated test must clear a **quality bar** *before* a human sees it.
- ACH defines that bar as **five filters** every test must pass.

---

## The trust problem

A reviewer asked to approve a machine-generated test will ask:

- Does it even **build**?
- Will it **fail randomly** tomorrow and erode trust?
- Does it actually **catch** something, or just inflate coverage?
- Is it about *this* code, or noise?
- Will I be able to **read** it in six months?

If the pipeline cannot answer all five *automatically*, the human carries the whole burden — and adoption fails.

---

## The five quality gates

ACH runs every generated test through five filters, in order:

| Gate | The test must… |
| --- | --- |
| 🔨 **Buildable** | compile and run without errors |
| 🔁 **Non-flaky** | pass deterministically across repeated runs |
| 🛡 **Hardening** | actually kill its target mutant — it *catches a fault* (#33) |
| 🎯 **Relevant** | exercise the intended code, not something incidental |
| ✏️ **Well-styled** | match the project's conventions and be readable |

A test that fails *any* gate is discarded automatically. Only survivors reach a human.

---

## Each gate rejects a specific failure mode

- **Buildable** — rejects hallucinated APIs and syntax errors.
- **Non-flaky** — rejects tests depending on time, ordering, or randomness (the #M4 / J8 flaky problem).
- **Hardening** — rejects assertion-free or tautological tests; this is the **mutation-kill** check — the objective core.
- **Relevant** — rejects tests that pass for unrelated reasons.
- **Well-styled** — rejects unreadable tests that would rot the codebase.

Together they convert "the LLM produced output" into "this test is worth a reviewer's time."

---

## Why "hardening" is the load-bearing gate

Buildable, non-flaky, relevant and styled are **hygiene** — necessary, but a perfectly hygienic test can still check *nothing*.

The **hardening** gate is the one that asserts *value*: the test must kill a real (non-equivalent) mutant. It is the same mutation-kill criterion from #33–#34.

> The other four gates make a test *acceptable*; hardening makes it *worth keeping*.

---

## Quality gates as a pattern

This is not specific to LLMs. Any generator of test artifacts — fuzzers, search-based tools, AI agents — needs an automated acceptance bar:

- Define the failure modes you will not tolerate.
- Encode each as a **filter that runs without a human**.
- Let only survivors reach review.

The lesson generalizes: **automation must filter its own output**, or it just shifts the work to the reviewer.

---

## Tool demonstration

In `/section-advanced`, open the **Test Quality Explorer**:

1. Take a generated test through the five gates one by one.
2. See a test rejected at each gate — and why.
3. Note that the **hardening** gate is the mutation-kill check.
4. Read the final accept/reject verdict — only all-five-pass survives.

---

## Summary

- A test-generation pipeline produces **volume**; quality gates produce **trust**.
- Five gates: **buildable · non-flaky · hardening · relevant · well-styled** — all automated.
- Each gate rejects a specific failure mode; a test failing any gate is discarded before review.
- **Hardening** (kills a mutant) is the load-bearing gate — it proves the test has *value*.

**In-class exercise:** a generated test builds, never flakes, is readable — but asserts `expect(true).toBe(true)`. Which gate stops it?

---

## Further reading

- *Mutation-Guided LLM-based Test Generation at Meta* (arXiv 2501.12862, FSE 2025)
- Course specification — AI-assisted testing chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- Tool source: [TestQualityExplorer.js](../../src/components/TestQualityExplorer.js)
- Related: **#34 LLM Test Pipeline** · **#J8 Flaky Test Diagnosis**
