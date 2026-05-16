# In-App Slide Docs — Design

**Date:** 2026-05-16
**Status:** Approved (brainstorming) — ready for implementation plan

## Goal

Surface the existing `docs/slides/` Marp decks inside the stvisual app, so a
learner reading an explorer can open the matching course slides as an
in-app presentation. Bilingual: `zh-TW` and `en`, following the app's
current locale.

## Background

- `docs/slides/` holds **13 Marp-markdown decks**, each in two languages:
  `NN-topic.en.md` and `NN-topic.zh-TW.md` (numbered 01–13), plus `.pptx`
  exports and an `index` file.
- Deck format: a YAML front-matter block (`---\nmarp: true\n…\n---`),
  then slides separated by a `---` line, with Marp speaker notes as
  `<!-- … -->` HTML comments. Slides use headings, lists, tables, fenced
  code, blockquotes, bold/italic/inline-code, images and `hr`.
- Images are referenced as `../assets/slides/*.png`, i.e. they live in
  `docs/assets/slides/`.
- The app is vanilla JS (Vite) with **no markdown library**; the only
  runtime dependency is `firebase`. Deployment goes through the esbuild
  `build:standalone` path (`npm run pages:prepare`), not plain `vite build`.

## Deck → section mapping

The 13 decks map to 11 existing sections (a section may own several decks):

| Deck | Topic | Section |
| --- | --- | --- |
| 1 | course-intro | `methods` |
| 2 | testing-flow-pyramid | `flow` |
| 3 | graph-coverage | `graph` |
| 4 | data-flow-coverage | `graph` |
| 5 | logic-coverage | `logic` |
| 6 | program-mutation | `syntax` |
| 7 | grammar-and-string-mutation | `syntax` |
| 8 | spec-mutation | `syntax` |
| 9 | fuzz-testing | `fuzz` |
| 10 | symbolic-execution | `symbex` |
| 11 | concolic-execution | `concolic` |
| 12 | test-generation | `testgen` |
| 13 | logic-binding | `logic` |

`graph`, `logic` and `syntax` therefore own multiple decks. The ~37 newer
explorers (G/H/I/J/K/L/M series) have no decks and are unchanged.

## Architecture

Five units, each independently testable:

### 1. Generated deck data — `src/data/slideDecks.generated.js`

A build-time generator, `scripts/build-slide-decks.mjs`, reads the 13
decks in both languages and emits a committed JS module:

```js
export const SLIDE_DECKS = [
  { id: 'graph-coverage', num: 3, section: 'graph',
    titleEn: 'Graph Coverage', titleZh: 'Graph Coverage（結構性）',
    en: '<raw markdown>', zh: '<raw markdown>' },
  …
];
```

Rationale for a generated, committed module over `import.meta.glob('?raw')`:
the deployment build uses esbuild, which has no glob import. A plain JS
module works for `vite build`, `vite dev`, and `build:standalone` alike.

The generator also copies every screenshot referenced by the 13 decks from
`docs/assets/slides/` into `public/slide-assets/`, and rewrites the image
paths in the baked markdown from `../assets/slides/X.png` to
`./slide-assets/X.png` (served from the site root). An `npm run
build:slide-decks` script runs the generator; it is also a prerequisite
step in `pages:prepare`. The generated module and the copied assets are
committed so a normal `vite build` needs no extra step.

### 2. Markdown renderer — `src/utils/slideMarkdown.js`

A minimal, dependency-free Marp-markdown parser/renderer. No `marked`
dependency — this keeps the project's zero-runtime-dependency style.

- `parseDeck(rawMd)` → `{ slides: [{ html, notes }] }`
  - strips the leading YAML front-matter block
  - splits the body on lines that are exactly `---`
  - for each slide, separates `<!-- … -->` speaker-note comments into
    `notes` (joined plain text) and renders the rest to `html`
- `renderMarkdown(md)` → HTML string for the markdown subset the decks
  use: headings (`#`–`####`), unordered/ordered lists (one nesting
  level), tables (GFM pipe syntax), fenced code blocks, blockquotes,
  `hr`, images, links, and inline `**bold**` / `*italic*` / `` `code` ``.
  All text is HTML-escaped before inline formatting is applied.

### 3. Slide viewer — `src/components/SlideViewer.js`

A full-screen overlay component, opened on demand with a set of decks and
a locale.

- `openSlideViewer(sectionId)` builds and shows the overlay for that
  section's decks in the current locale (`getLocale()`).
- Deck selector: a row of deck tabs, shown only when the section owns
  more than one deck.
- Slide area: renders one slide at a time.
- Controls: prev / next buttons, `←` / `→` keyboard navigation, a slide
  counter (`3 / 18`), a 🗒 Notes toggle, and a close control (button +
  `Esc`). Notes are hidden by default; the toggle reveals the current
  slide's speaker note beneath the slide.
- The overlay is a single reused DOM node appended to `document.body`;
  closing hides it and restores focus to the triggering button.

### 4. `app.js` wiring

Each section listed in the mapping gets a **"📊 課程簡報 / Slides"**
button rendered next to its `<h2>`. Clicking calls
`openSlideViewer(sectionId)`. Sections with no deck are untouched.

### 5. i18n

EN + ZH keys for: the section button label and the viewer controls
(previous, next, notes show/hide, close, slide counter). Per-deck titles
are *not* i18n keys — the generator extracts each deck's `title:` from
its `en` and `zh-TW` front-matter into `titleEn` / `titleZh` fields on
the deck record, and the viewer picks by locale.

## Data flow

1. Build time: `build-slide-decks.mjs` → `slideDecks.generated.js` +
   `public/slide-assets/*.png`.
2. Runtime: user clicks a section's Slides button → `openSlideViewer` looks
   up that section's decks in `SLIDE_DECKS`, picks `en`/`zh` by locale,
   `parseDeck` each → renders slide 0 → user navigates.

## Error handling

- A section mapped to a deck id that is missing from `SLIDE_DECKS` →
  the integrity test fails at build/CI time, not at runtime.
- A deck missing one language → generator fails loudly.
- Missing image at runtime → normal broken-image; acceptable, and caught
  by the generator copying step.

## Testing

- `slideMarkdown` unit tests: front-matter stripped, slides split on
  `---`, speaker notes separated, each markdown construct renders, text
  is escaped.
- `SlideViewer` smoke tests: overlay opens, renders slide 1, next/prev
  move the counter, notes toggle shows/hides, close removes the overlay,
  deck selector appears only for multi-deck sections.
- Deck-data integrity test: every section in the mapping resolves to at
  least one deck; every deck has non-empty `en` and `zh`.

## Out of scope

- Marp theme/CSS fidelity — slides render in the app's own style, not
  pixel-faithful to the Marp PPTX.
- `.pptx` files — ignored.
- Decks for the newer G/H/I/J/K/L/M explorers — none exist; not created
  here.
- Editing slides in-app — read-only viewer.
