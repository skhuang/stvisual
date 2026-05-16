# In-App Slide Docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface the `docs/slides/` Marp decks inside the app as an in-app, bilingual slide viewer opened from a per-section button.

**Architecture:** A build-time generator bakes the 13 Marp decks into a committed `src/data/slideDecks.generated.js` module and copies their screenshots into `public/slide-assets/`. A dependency-free markdown renderer turns deck text into slide HTML. A `SlideViewer` overlay component presents the slides; `app.js` adds a Slides button to each section that owns decks.

**Tech Stack:** Vanilla JS, Vite, Vitest + jsdom, Node ESM scripts.

**Reviewable milestone:** Tasks 1–4 deliver the generator, renderer and viewer with passing tests (the viewer is unit-testable but not yet on screen). Task 5 makes it visible in the app. The user may review after Task 4.

---

## File Structure

- Create: `scripts/build-slide-decks.mjs` — generator: reads decks, copies images, emits the data module.
- Create: `src/data/slideDecks.generated.js` — generated; committed. `export const SLIDE_DECKS`.
- Create: `public/slide-assets/*.png` — generated; committed. Deck screenshots.
- Create: `src/utils/slideMarkdown.js` — `parseDeck` + `renderMarkdown`.
- Create: `src/components/SlideViewer.js` — overlay viewer, `openSlideViewer`.
- Create: `src/components/SlideViewer.css` — viewer styles.
- Create: `src/tests/slideMarkdown.test.js`, `src/tests/SlideViewer.test.jsx`, `src/tests/slideDecks.test.js`.
- Modify: `src/app.js` — import `openSlideViewer` + `SLIDE_DECKS`; add per-section Slides buttons.
- Modify: `src/styles.css` — `@import` the viewer CSS.
- Modify: `src/i18n/dict.js` — `slides.*` keys, EN + ZH.
- Modify: `package.json` — add `build:slide-decks` script; chain it into `pages:prepare`.

---

## Task 1: Slide-deck generator and data module

**Files:**
- Create: `scripts/build-slide-decks.mjs`
- Create (generated, committed): `src/data/slideDecks.generated.js`, `public/slide-assets/*.png`
- Modify: `package.json`
- Test: `src/tests/slideDecks.test.js`

- [ ] **Step 1: Write the generator script**

Create `scripts/build-slide-decks.mjs`:

```js
// Generates src/data/slideDecks.generated.js from the docs/slides Marp decks
// and copies the screenshots they reference into public/slide-assets/.
// Run via `npm run build:slide-decks`.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SLIDES_DIR = join(ROOT, 'docs/slides');
const ASSETS_SRC = join(ROOT, 'docs/assets/slides');
const ASSETS_OUT = join(ROOT, 'public/slide-assets');

// base file name (without lang/extension) → deck metadata
const DECKS = [
  { base: '01-course-intro',                 id: 'course-intro',        num: 1,  section: 'methods' },
  { base: '02-testing-flow-pyramid',         id: 'testing-flow-pyramid',num: 2,  section: 'flow' },
  { base: '03-graph-coverage',               id: 'graph-coverage',      num: 3,  section: 'graph' },
  { base: '04-data-flow-coverage',           id: 'data-flow-coverage',  num: 4,  section: 'graph' },
  { base: '05-logic-coverage',               id: 'logic-coverage',      num: 5,  section: 'logic' },
  { base: '06-program-mutation',             id: 'program-mutation',    num: 6,  section: 'syntax' },
  { base: '07-grammar-and-string-mutation',  id: 'grammar-mutation',    num: 7,  section: 'syntax' },
  { base: '08-spec-mutation',                id: 'spec-mutation',       num: 8,  section: 'syntax' },
  { base: '09-fuzz-testing',                 id: 'fuzz-testing',        num: 9,  section: 'fuzz' },
  { base: '10-symbolic-execution',           id: 'symbolic-execution',  num: 10, section: 'symbex' },
  { base: '11-concolic-execution',           id: 'concolic-execution',  num: 11, section: 'concolic' },
  { base: '12-test-generation',              id: 'test-generation',     num: 12, section: 'testgen' },
  { base: '13-logic-binding',                id: 'logic-binding',       num: 13, section: 'logic' },
];

function frontMatterTitle(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return '';
  const t = m[1].match(/^title:\s*(.+)$/m);
  return t ? t[1].trim() : '';
}

// Copy every referenced screenshot and rewrite ../assets/slides/X -> ./slide-assets/X
function processImages(md) {
  return md.replace(/(!\[[^\]]*\]\()(?:\.\.\/)+assets\/slides\/([^)]+)(\))/g, (_, pre, file, post) => {
    const from = join(ASSETS_SRC, file);
    if (existsSync(from)) copyFileSync(from, join(ASSETS_OUT, file));
    return `${pre}./slide-assets/${file}${post}`;
  });
}

mkdirSync(ASSETS_OUT, { recursive: true });
mkdirSync(join(ROOT, 'src/data'), { recursive: true });

const records = DECKS.map((d) => {
  const enRaw = readFileSync(join(SLIDES_DIR, `${d.base}.en.md`), 'utf8');
  const zhRaw = readFileSync(join(SLIDES_DIR, `${d.base}.zh-TW.md`), 'utf8');
  return {
    id: d.id, num: d.num, section: d.section,
    titleEn: frontMatterTitle(enRaw) || d.id,
    titleZh: frontMatterTitle(zhRaw) || d.id,
    en: processImages(enRaw),
    zh: processImages(zhRaw),
  };
});

const out = `// AUTO-GENERATED by scripts/build-slide-decks.mjs — do not edit.
// Run \`npm run build:slide-decks\` to regenerate.
export const SLIDE_DECKS = ${JSON.stringify(records, null, 2)};
`;
writeFileSync(join(ROOT, 'src/data/slideDecks.generated.js'), out);
console.log(`slideDecks: wrote ${records.length} decks`);
```

- [ ] **Step 2: Add npm scripts**

In `package.json` `scripts`, add `build:slide-decks` and chain it into `pages:prepare`:

```json
    "build:slide-decks": "node scripts/build-slide-decks.mjs",
    "pages:prepare": "npm run build:slide-decks && npm run inject-env && npm run build:standalone && node scripts/prepare-pages.mjs",
```

(Replace the existing `pages:prepare` line; keep its other steps in order.)

- [ ] **Step 3: Run the generator**

Run: `npm run build:slide-decks`
Expected: prints `slideDecks: wrote 13 decks`; creates `src/data/slideDecks.generated.js` and `public/slide-assets/` with PNGs.

- [ ] **Step 4: Write the deck-data integrity test**

Create `src/tests/slideDecks.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { SLIDE_DECKS } from '../data/slideDecks.generated.js';

describe('slide deck data', () => {
  it('ships 13 decks, each with both languages and a title', () => {
    expect(SLIDE_DECKS).toHaveLength(13);
    for (const d of SLIDE_DECKS) {
      expect(d.en.length, d.id).toBeGreaterThan(0);
      expect(d.zh.length, d.id).toBeGreaterThan(0);
      expect(d.titleEn, d.id).toBeTruthy();
      expect(d.titleZh, d.id).toBeTruthy();
    }
  });

  it('every deck is attached to a section', () => {
    for (const d of SLIDE_DECKS) expect(typeof d.section, d.id).toBe('string');
  });

  it('rewrites screenshot paths to the bundled location', () => {
    for (const d of SLIDE_DECKS) {
      expect(d.en.includes('../assets/slides/'), d.id).toBe(false);
      expect(d.zh.includes('../assets/slides/'), d.id).toBe(false);
    }
  });
});
```

- [ ] **Step 5: Run the test**

Run: `npm run test -- --run src/tests/slideDecks.test.js`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add scripts/build-slide-decks.mjs src/data/slideDecks.generated.js public/slide-assets package.json src/tests/slideDecks.test.js
git commit -m "feat(slides): slide-deck generator + bundled deck data"
```

---

## Task 2: Markdown renderer

**Files:**
- Create: `src/utils/slideMarkdown.js`
- Test: `src/tests/slideMarkdown.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/tests/slideMarkdown.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { parseDeck, renderMarkdown } from '../utils/slideMarkdown.js';

describe('renderMarkdown', () => {
  it('renders headings, escaping HTML', () => {
    expect(renderMarkdown('## A <b> title')).toBe('<h2>A &lt;b&gt; title</h2>');
  });
  it('renders bold, italic and inline code', () => {
    expect(renderMarkdown('a **b** *c* `d`')).toBe('<p>a <strong>b</strong> <em>c</em> <code>d</code></p>');
  });
  it('renders an unordered list', () => {
    expect(renderMarkdown('- one\n- two')).toBe('<ul><li>one</li><li>two</li></ul>');
  });
  it('renders a fenced code block without interpreting markdown inside', () => {
    expect(renderMarkdown('```\n**x**\n```')).toBe('<pre class="slide-code"><code>**x**</code></pre>');
  });
  it('renders a GFM table', () => {
    const html = renderMarkdown('| A | B |\n| --- | --- |\n| 1 | 2 |');
    expect(html).toContain('<table');
    expect(html).toContain('<th>A</th>');
    expect(html).toContain('<td>1</td>');
  });
  it('renders an image', () => {
    expect(renderMarkdown('![alt](./slide-assets/x.png)'))
      .toBe('<p><img alt="alt" src="./slide-assets/x.png"></p>');
  });
});

describe('parseDeck', () => {
  const raw = [
    '---', 'marp: true', 'title: Demo', '---',
    '# Slide one', '<!-- note one -->',
    '---', '## Slide two', 'body',
  ].join('\n');

  it('strips front-matter and splits on slide separators', () => {
    const { slides } = parseDeck(raw);
    expect(slides).toHaveLength(2);
    expect(slides[0].html).toContain('<h1>Slide one</h1>');
    expect(slides[1].html).toContain('<h2>Slide two</h2>');
  });
  it('separates speaker notes from slide content', () => {
    const { slides } = parseDeck(raw);
    expect(slides[0].notes).toBe('note one');
    expect(slides[0].html).not.toContain('note one');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- --run src/tests/slideMarkdown.test.js`
Expected: FAIL — `slideMarkdown.js` does not exist.

- [ ] **Step 3: Write the renderer**

Create `src/utils/slideMarkdown.js`:

```js
// Minimal, dependency-free renderer for the Marp-markdown subset the
// docs/slides decks use. Not a general markdown engine.

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Inline formatting. Escapes first, then applies image/link/code/bold/italic.
function renderInline(text) {
  let h = escapeHtml(text);
  h = h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => `<img alt="${alt}" src="${src}">`);
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
    (_, t, u) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`);
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  return h;
}

function splitRow(line) {
  return line.replace(/^\s*\|?/, '').replace(/\|?\s*$/, '').split('|').map((c) => c.trim());
}

function isBlockStart(line) {
  return /^(#{1,6}\s|>|\s*([-*+]|\d+\.)\s|```)/.test(line) || line.includes('|');
}

export function renderMarkdown(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (line.trim().startsWith('```')) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) { code.push(lines[i]); i++; }
      i++;
      out.push(`<pre class="slide-code"><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      out.push(`<h${heading[1].length}>${renderInline(heading[2])}</h${heading[1].length}>`);
      i++;
      continue;
    }

    if (/^(\*\*\*|---|___)\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

    if (line.startsWith('>')) {
      const bq = [];
      while (i < lines.length && lines[i].startsWith('>')) { bq.push(lines[i].replace(/^>\s?/, '')); i++; }
      out.push(`<blockquote>${renderInline(bq.join(' '))}</blockquote>`);
      continue;
    }

    if (line.includes('|') && i + 1 < lines.length
        && /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(lines[i + 1])) {
      const header = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      const thead = `<tr>${header.map((c) => `<th>${renderInline(c)}</th>`).join('')}</tr>`;
      const tbody = rows.map((r) => `<tr>${r.map((c) => `<td>${renderInline(c)}</td>`).join('')}</tr>`).join('');
      out.push(`<table class="slide-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table>`);
      continue;
    }

    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, ''));
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((it) => `<li>${renderInline(it)}</li>`).join('')}</${tag}>`);
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    if (para.length) out.push(`<p>${renderInline(para.join(' '))}</p>`);
    else { i++; }
  }
  return out.join('');
}

// Parse a whole Marp deck: strip front-matter, split slides on `---`,
// peel out <!-- speaker notes --> per slide.
export function parseDeck(raw) {
  let body = raw;
  if (body.startsWith('---')) {
    const close = body.indexOf('\n---', 3);
    if (close !== -1) {
      const nl = body.indexOf('\n', close + 1);
      body = nl !== -1 ? body.slice(nl + 1) : '';
    }
  }
  const slides = body.split(/\n---\n/).map((chunk) => {
    const notes = [];
    const content = chunk.replace(/<!--([\s\S]*?)-->/g, (_, n) => { notes.push(n.trim()); return ''; });
    return { html: renderMarkdown(content.trim()), notes: notes.filter(Boolean).join('\n\n') };
  }).filter((s) => s.html.trim());
  return { slides };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- --run src/tests/slideMarkdown.test.js`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/utils/slideMarkdown.js src/tests/slideMarkdown.test.js
git commit -m "feat(slides): minimal Marp-markdown renderer"
```

---

## Task 3: i18n keys and viewer styles

**Files:**
- Modify: `src/i18n/dict.js`
- Create: `src/components/SlideViewer.css`
- Modify: `src/styles.css`

- [ ] **Step 1: Add EN i18n keys**

In `src/i18n/dict.js`, inside the `en` object, after the `agileTab.regression` key, add:

```js
    // Slide viewer
    'slides.open': '📊 Course slides',
    'slides.prev': 'Previous',
    'slides.next': 'Next',
    'slides.close': 'Close',
    'slides.notes.show': '🗒 Notes',
    'slides.notes.hide': '🗒 Hide notes',
    'slides.counter': 'Slide {n} / {total}',
    'slides.empty': 'No slides available.',
```

- [ ] **Step 2: Add ZH i18n keys**

In `src/i18n/dict.js`, inside the `zh` object, after the `agileTab.regression` key, add:

```js
    // 簡報檢視器
    'slides.open': '📊 課程簡報',
    'slides.prev': '上一張',
    'slides.next': '下一張',
    'slides.close': '關閉',
    'slides.notes.show': '🗒 講者備註',
    'slides.notes.hide': '🗒 隱藏備註',
    'slides.counter': '第 {n} / {total} 張',
    'slides.empty': '尚無簡報。',
```

- [ ] **Step 3: Verify i18n parity**

Run: `npm run test -- --run src/tests/i18n.test.js`
Expected: PASS — EN and ZH key sets still match.

- [ ] **Step 4: Write the viewer styles**

Create `src/components/SlideViewer.css`:

```css
.slideviewer-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(15, 23, 42, 0.72);
  display: flex; align-items: center; justify-content: center; padding: 1.5rem;
}
.slideviewer-overlay[hidden] { display: none; }
.slideviewer-panel {
  background: #fff; border-radius: 12px; width: min(960px, 100%);
  max-height: 92vh; display: flex; flex-direction: column; overflow: hidden;
}
.slideviewer-bar {
  display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
  padding: 0.6rem 0.85rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc;
}
.slideviewer-decks { display: flex; gap: 0.3rem; flex-wrap: wrap; }
.slideviewer-deck-btn {
  padding: 0.2rem 0.6rem; border: 1px solid #cbd5e1; border-radius: 999px;
  background: #fff; color: #475569; font-size: 0.78rem; cursor: pointer;
}
.slideviewer-deck-btn--active { background: #1d4ed8; border-color: #1d4ed8; color: #fff; font-weight: 700; }
.slideviewer-close { margin-left: auto; border: none; background: transparent; font-size: 1.1rem; cursor: pointer; color: #475569; }
.slideviewer-slide {
  flex: 1; overflow-y: auto; padding: 1.4rem 1.6rem; color: #1f2a44; line-height: 1.6;
}
.slideviewer-slide h1 { font-size: 1.5rem; margin: 0 0 0.6rem; }
.slideviewer-slide h2 { font-size: 1.2rem; margin: 0 0 0.5rem; }
.slideviewer-slide h3, .slideviewer-slide h4 { font-size: 1rem; margin: 0.6rem 0 0.4rem; }
.slideviewer-slide img { max-width: 100%; height: auto; border-radius: 6px; }
.slideviewer-slide pre.slide-code {
  background: #1e1e1e; color: #d4d4d4; border-radius: 6px; padding: 0.7rem;
  overflow-x: auto; font-size: 0.82rem;
}
.slideviewer-slide table.slide-table { border-collapse: collapse; font-size: 0.85rem; }
.slideviewer-slide table.slide-table th, .slideviewer-slide table.slide-table td {
  border: 1px solid #e2e8f0; padding: 0.3rem 0.55rem; text-align: left;
}
.slideviewer-slide blockquote {
  margin: 0.5rem 0; padding: 0.4rem 0.8rem; border-left: 3px solid #1d4ed8;
  background: #eff6ff; color: #1e3a8a;
}
.slideviewer-notes {
  border-top: 1px dashed #cbd5e1; background: #fffbeb; color: #78350f;
  padding: 0.6rem 1rem; font-size: 0.83rem; white-space: pre-wrap;
}
.slideviewer-notes[hidden] { display: none; }
.slideviewer-foot {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.6rem 0.85rem; border-top: 1px solid #e2e8f0; background: #f8fafc;
}
.slideviewer-nav-btn {
  padding: 0.3rem 0.85rem; border: 1px solid #1d4ed8; border-radius: 6px;
  background: #fff; color: #1d4ed8; font-size: 0.82rem; cursor: pointer;
}
.slideviewer-nav-btn:disabled { opacity: 0.4; cursor: default; }
.slideviewer-counter { font-size: 0.82rem; color: #475569; }
.slideviewer-notes-toggle {
  margin-left: auto; padding: 0.3rem 0.7rem; border: 1px solid #cbd5e1;
  border-radius: 6px; background: #fff; color: #475569; font-size: 0.8rem; cursor: pointer;
}
```

- [ ] **Step 5: Import the viewer CSS**

In `src/styles.css`, after the `@import url('./components/RegressionDebtExplorer.css');` line, add:

```css
@import url('./components/SlideViewer.css');
```

- [ ] **Step 6: Commit**

```bash
git add src/i18n/dict.js src/components/SlideViewer.css src/styles.css
git commit -m "feat(slides): viewer i18n keys and styles"
```

---

## Task 4: SlideViewer overlay component

**Files:**
- Create: `src/components/SlideViewer.js`
- Test: `src/tests/SlideViewer.test.jsx`

- [ ] **Step 1: Write the failing smoke tests**

Create `src/tests/SlideViewer.test.jsx`:

```js
import { describe, expect, it, beforeEach } from 'vitest';
import { openSlideViewer, closeSlideViewer } from '../components/SlideViewer.js';

beforeEach(() => {
  document.body.innerHTML = '';
  closeSlideViewer();
});

describe('SlideViewer', () => {
  it('opens an overlay showing the first slide of a section deck', () => {
    openSlideViewer('graph');
    const overlay = document.querySelector('[data-testid="slideviewer"]');
    expect(overlay).toBeInTheDocument();
    expect(overlay.hasAttribute('hidden')).toBe(false);
    expect(document.querySelector('[data-testid="slideviewer-slide"]').innerHTML.trim()).not.toBe('');
  });

  it('advances and rewinds slides with the nav buttons', () => {
    openSlideViewer('graph');
    const counter = () => document.querySelector('[data-testid="slideviewer-counter"]').textContent;
    const first = counter();
    document.querySelector('[data-testid="slideviewer-next"]').click();
    expect(counter()).not.toBe(first);
    document.querySelector('[data-testid="slideviewer-prev"]').click();
    expect(counter()).toBe(first);
  });

  it('toggles the speaker-notes panel', () => {
    openSlideViewer('graph');
    const notes = document.querySelector('[data-testid="slideviewer-notes"]');
    expect(notes.hasAttribute('hidden')).toBe(true);
    document.querySelector('[data-testid="slideviewer-notes-toggle"]').click();
    expect(notes.hasAttribute('hidden')).toBe(false);
  });

  it('shows a deck selector when the section owns more than one deck', () => {
    openSlideViewer('graph'); // graph owns decks 3 + 4
    expect(document.querySelectorAll('[data-testid^="slideviewer-deck-"]').length).toBeGreaterThan(1);
  });

  it('closes the overlay', () => {
    openSlideViewer('graph');
    document.querySelector('[data-testid="slideviewer-close"]').click();
    expect(document.querySelector('[data-testid="slideviewer"]')).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- --run src/tests/SlideViewer.test.jsx`
Expected: FAIL — `SlideViewer.js` does not exist.

- [ ] **Step 3: Write the component**

Create `src/components/SlideViewer.js`:

```js
import { t, getLocale } from '../i18n/index.js';
import { SLIDE_DECKS } from '../data/slideDecks.generated.js';
import { parseDeck } from '../utils/slideMarkdown.js';

// One reused overlay node, lazily created and appended to <body>.
let overlay = null;
let returnFocusTo = null;
const view = { decks: [], deckIndex: 0, slideIndex: 0, slides: [], notesOn: false };

function decksForSection(sectionId) {
  return SLIDE_DECKS.filter((d) => d.section === sectionId);
}
function deckTitle(deck) {
  return getLocale() === 'en' ? deck.titleEn : deck.titleZh;
}
function loadDeck(index) {
  view.deckIndex = index;
  view.slideIndex = 0;
  const deck = view.decks[index];
  const raw = getLocale() === 'en' ? deck.en : deck.zh;
  view.slides = parseDeck(raw).slides;
}

function onKey(e) {
  if (!overlay || overlay.hidden) return;
  if (e.key === 'Escape') closeSlideViewer();
  else if (e.key === 'ArrowRight') { go(1); }
  else if (e.key === 'ArrowLeft') { go(-1); }
}

function go(delta) {
  const next = view.slideIndex + delta;
  if (next < 0 || next >= view.slides.length) return;
  view.slideIndex = next;
  paint();
}

function paint() {
  const slide = view.slides[view.slideIndex] || { html: `<p>${t('slides.empty')}</p>`, notes: '' };
  const multi = view.decks.length > 1;
  overlay.innerHTML = `
    <div class="slideviewer-panel" role="dialog" aria-modal="true">
      <div class="slideviewer-bar">
        ${multi ? `<div class="slideviewer-decks">${view.decks.map((d, i) => `
          <button type="button" class="slideviewer-deck-btn ${i === view.deckIndex ? 'slideviewer-deck-btn--active' : ''}"
            data-deck="${i}" data-testid="slideviewer-deck-${i}">${deckTitle(d)}</button>`).join('')}</div>` : ''}
        <button type="button" class="slideviewer-close" data-testid="slideviewer-close"
          aria-label="${t('slides.close')}">✕</button>
      </div>
      <div class="slideviewer-slide" data-testid="slideviewer-slide">${slide.html}</div>
      <div class="slideviewer-notes" data-testid="slideviewer-notes" ${view.notesOn ? '' : 'hidden'}>${slide.notes || ''}</div>
      <div class="slideviewer-foot">
        <button type="button" class="slideviewer-nav-btn" data-testid="slideviewer-prev"
          ${view.slideIndex === 0 ? 'disabled' : ''}>${t('slides.prev')}</button>
        <button type="button" class="slideviewer-nav-btn" data-testid="slideviewer-next"
          ${view.slideIndex >= view.slides.length - 1 ? 'disabled' : ''}>${t('slides.next')}</button>
        <span class="slideviewer-counter" data-testid="slideviewer-counter">${t('slides.counter', {
          n: view.slideIndex + 1, total: view.slides.length,
        })}</span>
        <button type="button" class="slideviewer-notes-toggle" data-testid="slideviewer-notes-toggle">${
          view.notesOn ? t('slides.notes.hide') : t('slides.notes.show')}</button>
      </div>
    </div>`;
  overlay.querySelector('[data-testid="slideviewer-close"]').addEventListener('click', closeSlideViewer);
  overlay.querySelector('[data-testid="slideviewer-prev"]').addEventListener('click', () => go(-1));
  overlay.querySelector('[data-testid="slideviewer-next"]').addEventListener('click', () => go(1));
  overlay.querySelector('[data-testid="slideviewer-notes-toggle"]').addEventListener('click', () => {
    view.notesOn = !view.notesOn;
    paint();
  });
  overlay.querySelectorAll('[data-deck]').forEach((btn) => {
    btn.addEventListener('click', () => { loadDeck(Number(btn.dataset.deck)); paint(); });
  });
}

export function openSlideViewer(sectionId) {
  const decks = decksForSection(sectionId);
  if (!decks.length) return;
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'slideviewer-overlay';
    overlay.dataset.testid = 'slideviewer';
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSlideViewer(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(overlay);
  }
  returnFocusTo = document.activeElement;
  overlay.hidden = false;
  view.decks = decks;
  view.notesOn = false;
  loadDeck(0);
  paint();
}

export function closeSlideViewer() {
  if (!overlay) return;
  overlay.remove();
  overlay = null;
  if (returnFocusTo && returnFocusTo.focus) returnFocusTo.focus();
  returnFocusTo = null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- --run src/tests/SlideViewer.test.jsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/SlideViewer.js src/tests/SlideViewer.test.jsx
git commit -m "feat(slides): SlideViewer overlay component"
```

---

## Task 5: Wire Slides buttons into sections

**Files:**
- Modify: `src/app.js`

- [ ] **Step 1: Add the imports**

In `src/app.js`, after the line `import { createRegressionDebtExplorer } from './components/RegressionDebtExplorer.js';`, add:

```js
import { openSlideViewer } from './components/SlideViewer.js';
import { SLIDE_DECKS } from './data/slideDecks.generated.js';
```

- [ ] **Step 2: Add the button-injection block**

In `src/app.js`, find the `const sections = { … };` object (the one mapping section ids to `main.querySelector('[data-testid="section-…"]')` nodes). Immediately **after** that object's closing `};`, add:

```js
    // Attach a "course slides" button to every section that owns decks.
    const sectionsWithDecks = [...new Set(SLIDE_DECKS.map((d) => d.section))];
    for (const sectionId of sectionsWithDecks) {
      const node = sections[sectionId];
      const heading = node?.querySelector('h2');
      if (!heading) continue;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'section-slides-btn';
      btn.dataset.testid = `slides-btn-${sectionId}`;
      btn.textContent = t('slides.open');
      btn.addEventListener('click', () => openSlideViewer(sectionId));
      heading.insertAdjacentElement('afterend', btn);
    }
```

(If `sections` is not the exact identifier in this file, use whatever object holds the per-section DOM nodes; the lookup must return the `<section>` element so `.querySelector('h2')` finds its heading.)

- [ ] **Step 3: Add the button style**

In `src/styles.css`, after the `@import` lines, add:

```css
.section-slides-btn {
  margin: 0.2rem 0 0.6rem; padding: 0.25rem 0.7rem;
  border: 1px solid #1d4ed8; border-radius: 999px;
  background: #fff; color: #1d4ed8; font-size: 0.78rem; cursor: pointer;
}
.section-slides-btn:hover { background: #1d4ed8; color: #fff; }
```

- [ ] **Step 4: Manual check in the dev server**

Run: `npm run dev`, open the app, go to the Graph Coverage section.
Expected: a "📊 課程簡報 / Course slides" button under the heading; clicking it opens the overlay; the graph section shows a deck selector (decks 3 + 4); arrows and the notes toggle work; Esc closes it.

- [ ] **Step 5: Commit**

```bash
git add src/app.js src/styles.css
git commit -m "feat(slides): per-section course-slides button"
```

---

## Task 6: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the whole unit suite**

Run: `npm run test -- --run`
Expected: all test files pass, including `slideDecks`, `slideMarkdown`, `SlideViewer`.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: build succeeds; `dist/` contains the `slide-assets` images.

- [ ] **Step 3: Standalone/pages build**

Run: `npm run build:slide-decks` then `npm run build`
Expected: both succeed; `src/data/slideDecks.generated.js` unchanged (regeneration is deterministic).

- [ ] **Step 4: Commit any regeneration diff**

```bash
git status --short
# If the generator produced no diff, nothing to commit. If it did, commit it:
git add src/data/slideDecks.generated.js public/slide-assets
git commit -m "chore(slides): regenerate deck data"
```

---

## Self-Review Notes

- **Spec coverage:** generator + data module (Task 1), markdown renderer (Task 2), SlideViewer with deck selector / nav / notes toggle / close (Tasks 3–4), per-section button (Task 5), i18n (Task 3), tests for all three units (Tasks 1, 2, 4), build integration via `pages:prepare` (Task 1). All spec sections covered.
- **Locale:** `SlideViewer` reads `getLocale()` at open time; reopening after a language switch picks the other language. Live re-render while open is out of scope (matches the spec — viewer is opened on demand).
- **Type consistency:** deck record fields `id, num, section, titleEn, titleZh, en, zh` are identical across Task 1 (generator), Task 4 (viewer), and the tests.
