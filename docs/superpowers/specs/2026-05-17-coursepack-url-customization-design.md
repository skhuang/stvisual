# Course Customization — URL & Pack Ordering Design

**Date:** 2026-05-17
**Scope:** Plan.md section K "延後項目" — three deferred items enabling customizable
sub-courses (language, order).

## Goal

Implement the three deferred items from Plan.md §K so a teacher can hand out a
customized sub-course via a share link:

1. `?lang=` URL lock — a share link forces a display language.
2. Native `#anchor` jump — a `#section-<id>` hash is an alternative entry path
   to `?section=`.
3. CoursePack custom ordering — an optional `order: [...]` field controls the
   Explorer sequence within a pack.

All three are small, independent additions. They ship as one PR.

## Context

- **`src/utils/urlRouter.js`** — single source of truth for URL ↔ state.
  `parseAppLocation(search)` parses `?section/?tab/?explorer/?pack/?<filter>`;
  `serializeLocation(state)` rebuilds the query string. History uses
  `replaceState`/`pushState`; `syncUrl()` in app.js preserves `location.hash`.
- **`src/i18n/index.js`** — `current` locale resolved at module load from
  `localStorage['stvisual.locale']` → browser language → `'en'`.
  `setLocale(locale)` always persists to localStorage and notifies listeners.
  `SUPPORTED = ['en', 'zh']`.
- **`src/data/courseSeries.js`** — `COURSE_PACKS` (7 packs, each
  `{ id, titleKey, descKey, filter }`). `getCoursePackExplorers(id)` returns
  matched Explorers in `Object.entries(EXPLORER_TAGS)` key order. K5's Markdown
  export consumes this order.
- **`src/app.js`** — sections render as `<section data-testid="section-<id>">`,
  shown/hidden by `display`; one active at a time. `setActiveSection(id)` drives
  navigation. The language `<select>` calls `setLocale(value)`.

## Feature 1 — `?lang=` URL lock

**Decisions (confirmed):** session-only override; keep & sync in the URL.

### i18n/index.js

`setLocale` gains an options arg:

```js
export function setLocale(locale, { persist = true } = {}) {
  if (!SUPPORTED.includes(locale) || locale === current) return;
  current = locale;
  if (persist) {
    try { globalThis.localStorage?.setItem(STORAGE_KEY, locale); } catch {}
  }
  listeners.forEach((cb) => { try { cb(locale); } catch (err) { console.error(err); } });
  applyDocumentLocale();
}
```

`persist: false` applies the locale for the session without overwriting the
visitor's saved preference. The early-return when `locale === current` means a
`?lang=` matching the already-resolved locale is a harmless no-op.

### urlRouter.js

- `parseAppLocation` reads `lang`: `const lang = params.get('lang');`
  if `lang === 'en' || lang === 'zh'`, set `out.lang = lang`.
- `serializeLocation` emits it: `if (state.lang) params.set('lang', state.lang);`
  Placed first so the param order reads `?lang=…&section=…`.

### app.js

- On boot, after `parseAppLocation`, if `urlState.lang` is present call
  `setLocale(urlState.lang, { persist: false })`.
- A module-scope flag `let langInUrl = Boolean(urlState.lang);`.
- The language `<select>` handler: after `setLocale(value)` (persisting — an
  explicit user choice), set `langInUrl = true` and call `syncUrl()`.
- `syncUrl()` builds `state.lang = langInUrl ? getLocale() : undefined`.
- Register `onLocaleChange(() => { if (langInUrl) syncUrl(); })` so a locale
  change keeps `?lang=` current. (The existing locale-change re-render is
  unaffected.)

Net effect: a fresh visit with no `?lang=` keeps a clean URL. Once `?lang=` is
present — typed in, or after the user flips the dropdown — every URL the app
writes carries the current language.

## Feature 2 — `#anchor` jump

**Decision (confirmed):** coexist; `?section=`/`?explorer=` (query) win; `#hash`
is an additional entry path. K4/K5 generated links are unchanged.

### Section ids

Each `<section>` gains `id="section-<id>"` alongside its existing
`data-testid="section-<id>"` (e.g. `id="section-graph"`, `id="section-overview"`).

### urlRouter.js

- `parseAppLocation(search, hash)` — new optional second argument.
- After query parsing, if **no** `?section=`/`?explorer=` resolved a section and
  `hash` matches `/^#section-([a-z0-9-]+)$/`, set `out.section = <captured id>`
  and `out.fromHash = true`. The captured id is **not** validated here (the full
  section-id list lives in app.js); app.js validates against its `sections` map
  and ignores an unknown id.
- Non-`section-*` hashes (skip-links such as `#main`) are ignored.

### app.js

- Boot: `parseAppLocation(location.search, location.hash)`.
- A `hashchange` listener: if `location.hash` matches `#section-<id>` and `<id>`
  is a known section, call `setActiveSection(id)`; otherwise ignore (skip-links
  keep working).
- On UI-driven navigation (`setActiveSection` from a nav control or `?section`),
  if `location.hash` currently matches `#section-<knownid>`, clear it so the URL
  carries no contradictory stale anchor. Any other hash is left untouched.
- `syncUrl()` continues to preserve `location.hash` verbatim.

### Precedence summary

`?explorer=` > `?section=` > `#section-<id>` hash. When a query param resolves a
section, the hash is ignored on parse.

## Feature 3 — CoursePack custom ordering

`COURSE_PACKS` entries gain an optional `order` field:

```js
{
  id: 'foundations',
  titleKey: 'pack.foundations.title',
  descKey: 'pack.foundations.desc',
  filter: { series: ['foundations'] },
  order: ['TestingMethodTree', 'TestingFlow', 'DefectCostExplorer',
          'VModelExplorer', 'TestingTypesTable', 'PyramidAdjusterExplorer'],
}
```

`getCoursePackExplorers(id)` becomes order-aware:

1. Compute `matched` — Explorers whose tags satisfy the pack filter (unchanged).
2. If the pack has no `order`, return `matched` in `EXPLORER_TAGS` key order
   (unchanged behaviour).
3. Otherwise: emit, first, every id in `order` that is also in `matched`
   (in `order` sequence); then the remaining `matched` ids in `EXPLORER_TAGS`
   key order. Ids in `order` that are not in `matched` are skipped.

Partial orders are therefore valid — listing one Explorer pins it to the front,
the rest keep their natural order. K5's Markdown export, which already calls
`getCoursePackExplorers`, picks up the new order with no change.

The `foundations` pack gets the worked-example `order` shown above (a
pedagogical sequence: method tree → flow → defect cost → V-model → testing
types → pyramid). The other six packs are unchanged.

## Testing

TDD, one slice per feature. New/extended unit tests:

- **`urlRouter` test** — `?lang=en` round-trips through
  `parseAppLocation`/`serializeLocation`; an invalid `?lang=fr` is dropped;
  `#section-graph` parses to `section: 'graph'` when no query section;
  `?section=logic#section-graph` yields `section: 'logic'` (query wins);
  a non-`section-*` hash is ignored.
- **`i18n` test** — `setLocale(other, { persist: false })` changes `getLocale()`
  but does not write `localStorage`; `setLocale(other)` does write it.
- **`courseSeries` test** — a pack with `order` returns Explorers in that
  sequence; a partial `order` pins the listed ones and appends the rest;
  an `order` id outside the filter is skipped.

All existing slide/url/i18n tests must stay green. No generated-data
regeneration is needed.

## Out of scope

- Rewriting `?section=` away in favour of `#anchor` (the "fully replace" option
  was declined).
- A UI for editing pack order — `order` is authored in `courseSeries.js`.
- Persisting `?lang=` to localStorage.
