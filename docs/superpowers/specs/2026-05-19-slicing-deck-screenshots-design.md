# Slicing Deck Tool-Demo Screenshots Design

**Date:** 2026-05-19
**Scope:** Add screenshots to the **Tool demonstration** slide of the four
slicing lecture decks (#58–#61). Those decks were authored after the earlier
screenshot waves, so their tool-demo slides are text-only.

## Goal

Every other tool-demo slide in the course (e.g. deck #3) pairs the walkthrough
steps with a screenshot of the live explorer. The four slicing decks do not.
This change captures screenshots of the four slicing explorers and embeds them,
so each tool-demo slide shows the learner what the tool looks like.

## What changes

Each deck's single **Tool demonstration** slide becomes **two** slides, each
carrying one screenshot plus the relevant walkthrough steps. The two shots per
deck capture the contrast that deck teaches:

| Deck | Explorer (`?explorer=`) | Shot A | Shot B |
| --- | --- | --- | --- |
| #58 Program Slicing | `ProgramSlicingExplorer` | a backward **static** slice highlighted | the same criterion in **dynamic** mode — slice shrunk |
| #59 Fault Localization / Dicing | `SliceDicingExplorer` | `summaryStats` **static** dicing — the dice isolating the suspect | `fare` **dynamic** dicing — the dice `{s8,s9}` |
| #60 Slice-Based Coverage | `SliceCoverageExplorer` | `classify`, all 3 traces on — 100% slice coverage | `neg` trace off — 83%, the `s8` gap |
| #61 Regression Test Selection | `SliceRegressionExplorer` | `classify`, `s3` edited, **static** mode — 3 traces must-rerun | **dynamic** mode — 3 traces safe |

## Capture

A capture script drives the four explorers with Playwright and saves PNGs,
mirroring the existing `scripts/capture-slide-screenshots.mjs` (deck #3):

- Reuse that script's structure — spawn `python3 -m http.server 4173`, launch
  Chromium, `viewport 1440×900`, `deviceScaleFactor: 2`, `SLIDE_LOCALE` env
  (`zh` default, `en`), and the locale-suffix `shot()` helper (`zh` → bare
  name, `en` → `-en` suffix).
- Add a new script `scripts/capture-slicing-screenshots.mjs` (the existing one
  is a deck-#3 one-off; do not entangle the two).
- Navigate straight to each explorer with `?explorer=<Component>` (the URL
  router resolves it to the right section + tab), wait for the explorer's root
  testid (`program-slicing-explorer`, `slice-dicing-explorer`,
  `slice-coverage-explorer`, `slice-regression-explorer`), drive it through the
  interactions for each shot, and screenshot the explorer element.
- Run once per locale → 16 PNGs in `docs/assets/slides/`.

Screenshot base names (`.png` for zh, `-en.png` for en):

| Base name | Content |
| --- | --- |
| `slice-program-backward` | #58 shot A |
| `slice-program-dynamic` | #58 shot B |
| `slice-dicing-static` | #59 shot A |
| `slice-dicing-dynamic` | #59 shot B |
| `slice-coverage-full` | #60 shot A |
| `slice-coverage-gap` | #60 shot B |
| `slice-regression-static` | #61 shot A |
| `slice-regression-dynamic` | #61 shot B |

## Embed

In each deck file (`.en.md` + `.zh-TW.md`, 8 files): split the single
`## Tool demonstration` slide into two slides, each headed
`## Tool demonstration — <short label>`, each with the relevant subset of the
existing numbered steps and one image:

```markdown
![w:1000](../assets/slides/slice-program-backward.png)
```

en decks reference the `-en.png` variant; zh decks the bare `.png`. Width
`w:1000` matches deck #3's tool-demo screenshots. The walkthrough prose is
preserved — only re-distributed across the two slides — and no step text is
deleted.

Regenerate `src/data/slideDecks.generated.js` via `npm run build:slide-decks`.
The deck **count** is unchanged (still 61) — only the slide count within each
of the four decks grows by one — so `src/tests/slideDecks.test.js` needs no
change.

## File structure

| File | Responsibility | Change |
| --- | --- | --- |
| `scripts/capture-slicing-screenshots.mjs` | Playwright capture of the 4 explorers | Create |
| `docs/assets/slides/slice-*.png`, `slice-*-en.png` | 16 captured PNGs | Create (generated) |
| `docs/slides/58-program-slicing.{en,zh-TW}.md` | Split tool-demo slide, embed 2 shots | Modify |
| `docs/slides/59-fault-localization-dicing.{en,zh-TW}.md` | Split tool-demo slide, embed 2 shots | Modify |
| `docs/slides/60-slice-based-coverage.{en,zh-TW}.md` | Split tool-demo slide, embed 2 shots | Modify |
| `docs/slides/61-regression-test-selection.{en,zh-TW}.md` | Split tool-demo slide, embed 2 shots | Modify |
| `src/data/slideDecks.generated.js` | Regenerated bundle | Modify |

## Testing

- `npm run build:slide-decks` regenerates cleanly and still reports 61 decks.
- `npx vitest run` stays green (no test asserts slide-internal counts).
- Manual: each of the 16 PNGs exists and shows the explorer in the intended
  state; rendered decks show the image under each tool-demo slide.

## Out of scope

- Screenshots for any deck other than #58–#61.
- Re-capturing or changing existing screenshots in other decks.
- Changing the explorers themselves.
