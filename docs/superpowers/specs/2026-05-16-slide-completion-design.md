# Slide Completion — Design

**Date:** 2026-05-16
**Status:** Approved (brainstorming) — program-level spec; Wave A ready for a plan

## Goal

Author full lecture slide decks for every explorer that has none, so all
54 explorers are covered by the in-app slide viewer and the Marp/PPTX
course set. Bilingual `en` + `zh-TW`, matching the existing 13 decks.

## Background

- 13 Marp decks exist in `docs/slides/` (`NN-topic.{en,zh-TW}.md`),
  covering ~11 explorer topics: methods, flow, graph, data-flow, logic,
  program/grammar/spec mutation, fuzz, symbex, concolic, test-gen,
  logic-binding.
- The in-app slide viewer (PRs #251–256) renders any deck registered in
  `scripts/build-slide-decks.mjs`; adding a deck needs no app code.
- 54 explorers exist; ~44 have no deck.

## Scope — the 44 missing decks

Decomposed into 7 waves, in teaching order. Each wave is a separate
sub-project (its own plan); this spec covers the program and Wave A.

| Wave | Decks (explorer → deck topic) | Count |
| --- | --- | --- |
| **A — Foundations gaps** | DefectCost, V-Model, TestingTypesTable, PyramidAdjuster, CodeCoverage | 5 |
| **B — Black-box design** | BVA, EquivalenceClass, DecisionTable, StateTransition, Pairwise, CauseEffect, Metamorphic, Exploratory, TestDoubles | 9 |
| **C — Coverage & execution gaps** | GroupTheory, PropertyBased, IntegrationTesting, RiskBased | 4 |
| **D — AI-assisted (Advanced)** | EquivalentMutant, MutationScore, LLMPipeline, TestQuality, FaultDirected, SAILOR | 6 |
| **E — Acceptance / E2E** | BDDGherkin, UseCaseDerivation, E2EUserJourney, Contract, PerfLoad, Chaos, ATDD, Flaky | 8 |
| **F — Model-based** | MBTWorkflow, FSMTestGeneration, WMethod, EFSM, UsageModel, ModelMutation | 6 |
| **G — Agile** | AgileQuadrants, SprintCadence, DefinitionGates, ExampleMapping, ContinuousTesting, RegressionDebt | 6 |

Total: 44 decks × 2 languages = 88 markdown files.

## Deck template

Each deck mirrors the existing 13. Marp front-matter (`marp: true`,
`theme: default`, `paginate: true`, `size: 16:9`, `title`, `description`,
`lang`), then slides separated by `---`:

1. **Title** — topic + one-line framing + the tool reference
   (`/section-…` and a GitHub link to the explorer component).
2. **Motivation** — the teaching gap this method fills.
3. **Concept** — definitions, and where it sits relative to neighbours
   (subsumption / classification).
4. **Algorithm / procedure** — how the method works, step by step.
5. **Worked example** — a concrete multi-step example, with a textbook
   citation where one applies.
6. **Tool demo** — the explorer's `data-testid`s and an interaction
   walkthrough in text; no screenshot in this pass (see Screenshots).
7. **Summary + in-class exercise.**
8. **Further reading** — spec chapter and source file links.

Marp speaker-note comments (`<!-- … -->`) carry teaching notes, as in the
existing decks. Numbered `14`–`57`; files `NN-topic.{en,zh-TW}.md`.

## Screenshots — deferred

The existing decks embed screenshots from
`scripts/capture-slide-screenshots.mjs`. Extending that pipeline for 44
explorers is a sub-project of its own. Decision: author the full lecture
**text** content first; each deck's tool-demo slide describes the
interaction and may carry a screenshot later. Screenshots are a separate
follow-up pass per wave, not part of the deck-authoring tasks here.

## Per-deck workflow

1. Read the explorer component + the matching `Plan.md` section to gather
   the real concept, algorithm and example.
2. Write `docs/slides/NN-topic.en.md` and `.zh-TW.md` from the template.
3. Add the deck to the `DECKS` array in `scripts/build-slide-decks.mjs`
   (`base`, `id`, `num`, `section`).
4. Run `npm run build:slide-decks` to regenerate
   `src/data/slideDecks.generated.js`. The viewer picks the deck up
   automatically — no app code changes.
5. The `slideDecks` integrity test must still pass.

## Process

- **One PR per wave** — a wave's 5–9 decks ship together. Decks are
  markdown plus a one-line generator entry, so the per-deck risk is low
  and a wave-sized PR keeps CI cycles reasonable.
- Waves are built in order A→G.
- Each wave after A gets its own short plan referencing this spec.

## Out of scope

- The screenshot-capture pipeline extension (separate follow-up).
- `.pptx` regeneration (the Marp source is the deliverable here).
- New explorers — only the 54 that exist today.
- Decks for K-series infrastructure (tagging/filtering) — not lecture
  topics, no explorer entries.

## Testing

- `slideDecks` integrity test: still 0 repo-relative links, both
  languages present, every deck attached to a section — extended to the
  new deck count as each wave lands.
- `npm run build:slide-decks` stays deterministic.
- A deck registered for a section makes the viewer's section button
  appear (covered by existing `SlideViewer` behaviour).
