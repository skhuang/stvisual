# Private Course Slides on Google Drive — Design

**Date:** 2026-05-24
**Status:** Approved — ready for implementation planning
**Scope:** Shared across **rdvisual** and **stvisual**. This spec is committed
identically to both repos at the same path. Keep the two copies in sync.
**Implementation rollout:** One plan per repo, separate branches & PRs.
**rdvisual first** (validates the contract end-to-end), then **stvisual**
(carries the same shape into stvisual's path layout).

## Goal

Today every Marp `.md` deck is bundled into the app at build time and is
therefore public. Some decks (instructor notes, in-class exercises with
solutions, draft material) should not ship publicly. This design adds a second
deck source: a Google Drive folder whose contents are gated by Drive-native
per-user sharing. Authorised users sign in with Google; the app fetches the
private decks at runtime through the user's own OAuth token and renders them
in the same `SlideViewer` overlay as the public decks.

## Background

Both repos share the same lineage (rdvisual was forked from stvisual). They
already have:

- A `SlideViewer` overlay rendered from `SLIDE_DECKS` (compiled from `.md`
  files by `scripts/build-slide-decks.mjs`).
- A `cloudIntegration.js` that uses Firebase Auth's `GoogleAuthProvider` with
  the `https://www.googleapis.com/auth/drive.file` scope, plus Firestore.
- A `cloudConfig.js` (per repo) that holds Firebase credentials + the Drive
  folder used for user-owned data.

So the design adds one new module, widens the Drive OAuth scope, and extends
the existing `SlideViewer` deck-picker — no new auth system, no new viewer.

## Decisions settled during brainstorming

1. **OAuth scope: `drive.readonly` added alongside the existing `drive.file`.**
   Lets the app list/read any Drive file the signed-in user has been shared,
   so the deck picker can show 🔒 private decks without an extra per-file
   "open" action. The narrower `drive.file` + Drive Picker alternative was
   ruled out for UX (every deck would need a per-session pick).
2. **Drive folder + manifest, transparent fetch.** Decks live in a Drive
   folder; a `private-decks.json` manifest in the folder names them and maps
   them to app sections. Per-file Drive IDs are never hard-coded in the repo.
3. **Shared spec, two plans.** One design (this document, mirrored in both
   repos), one plan per repo, two PRs.
4. **One Drive folder per course.** rdvisual and stvisual each have their own
   `privateSlidesFolderId`; access lists are independent. Students of one
   course don't see the other course's decks.

## Architecture

```
              ┌──────────────────────────────────────┐
              │ Google Drive folder per course       │
              │  (course owner shares with specific  │
              │   Google accounts or a Group)        │
              │   ├─ private-decks.json (manifest)   │
              │   ├─ <section>-extras.en.md          │
              │   └─ <section>-extras.zh-TW.md       │
              └────────────────────┬─────────────────┘
                                   │ drive.readonly
                                   ▼
       ┌─────────────────────────────────────────────┐
       │ Drive REST v3 (files.list, files.get media) │
       └──────────────────┬──────────────────────────┘
                          │  Bearer accessToken
       ┌──────────────────┴──────────────────┐
       │ existing cloud sign-in (Firebase    │
       │ GoogleAuthProvider, scope widened)  │
       └──────────────────┬──────────────────┘
                          │
                          ▼
       ┌─────────────────────────────────────┐
       │ NEW: privateDecks.js                │
       │   fetchPrivateDecks(accessToken)    │
       │     → [SLIDE_DECKS-shaped entries]  │
       │   in-memory per-session cache       │
       └──────────────────┬──────────────────┘
                          │
                          ▼
       ┌─────────────────────────────────────┐
       │ SlideViewer (extended)              │
       │   public bundled decks +            │
       │   🔒 private fetched decks merged   │
       │   in the same deck picker           │
       └─────────────────────────────────────┘
```

## The Drive layout

One folder per course (operator's choice — could also be one folder shared
across all of a course owner's courses). Inside:

- **`private-decks.json`** — the manifest. Schema:
  ```json
  {
    "version": 1,
    "decks": [
      {
        "id": "sailor-instructor-notes",
        "section": "sailor",
        "files": {
          "en": "sailor-instructor.en.md",
          "zh-TW": "sailor-instructor.zh-TW.md"
        },
        "titleEn": "SAILOR — instructor notes",
        "titleZh": "SAILOR —— 講師補充"
      }
    ]
  }
  ```
  `id`, `section`, `files.en`, `files.zh-TW`, `titleEn`, `titleZh` are
  required. `section` must match an existing app section id; if it doesn't,
  the deck is silently dropped (logged in the dev console).
- One or more Marp `.md` files referenced from the manifest.

**Images.** Images stay in each repo's public bundle (`public/slide-assets/`).
Only the narrative markdown is private. If a private deck references an image
not in the public bundle, the image will 404; the markdown still renders.
Putting images on Drive is out of scope (see "Out of scope").

**Permission model.** Pure Drive: the course owner shares the folder (the
whole folder is the unit) with individual Google accounts or a Google Group
via Drive's UI. Revocation is instant (unshare). Per-deck sharing is possible
but not used by this design — if a user can read the manifest, they can see
the deck IDs/titles even if a specific file fetch later 403s.

## Config

One new field in each repo's `src/config/cloudConfig.js`:

```js
// "" disables the feature (no Drive listing, no 🔒 in the deck picker).
privateSlidesFolderId: '',
```

The empty default keeps the feature opt-in at the deployment level — local
dev and CI builds never call Drive unless an operator sets the folder ID.

## Auth — minimal change to the existing flow

Both `cloudIntegration.js` files currently do:

```js
const provider = new firebase.auth.GoogleAuthProvider();
// (existing scope handling for drive.file)
```

The change is to also add the read-only scope, e.g.:

```js
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
```

Effects:
- The Google consent screen now lists "See and download your Drive files"
  alongside what it asks for today. Google's incremental consent UX prompts
  existing signed-in users to re-grant on next sign-in; users who decline the
  new scope see no 🔒 decks (graceful degradation, no error).
- `cloudIntegration` exposes the OAuth `accessToken` from the
  `GoogleAuthProvider` credential after sign-in. `privateDecks.js` consumes it.

This change applies even when `privateSlidesFolderId` is empty — the scope is
declared in the sign-in flow so that future deployments can enable the folder
without forcing a re-consent.

## The new `privateDecks` module

One file per repo, single public API:

```js
// Returns deck entries shaped like SLIDE_DECKS:
//   { id, section, num, titleEn, titleZh, en, zh, private: true, access }
// `access` is 'ok' | 'denied' | 'error'. Resolves to [] when the folder is
// not configured, the user is not signed in, or the manifest is not visible.
export async function fetchPrivateDecks(accessToken);
```

**Internals:**
1. If no folder ID or no access token → return `[]`.
2. List the folder for `private-decks.json`:
   `GET /drive/v3/files?q='{folderId}'+in+parents+and+name='private-decks.json'+and+trashed=false&fields=files(id,name)`.
3. Fetch the manifest by ID: `GET /drive/v3/files/{id}?alt=media`. Parse.
4. For each manifest entry, look up `files.en` and `files.zh-TW` in the
   folder (one batched `files.list` query) and `alt=media` fetch each. Store
   results.
5. Build deck objects shaped like `SLIDE_DECKS` entries, with `private: true`.
   Assign `num` from a private range starting at 1001 to avoid clashing with
   the build-time-assigned 1..N for public decks.
6. Cache the result in module scope, keyed by accessToken (token rotation
   resets the cache). No `localStorage` for private content.

**Error policy:**

| Drive response | App behaviour |
|---|---|
| Manifest list 200, file present | Continue. |
| Manifest list 200, file absent | Config miss — `console.warn`, return `[]`. |
| Manifest get 200 | Parse; fall through to per-deck fetch. |
| Manifest get 403 | User not in share list — return `[]` silently (do not reveal that private decks exist). |
| Manifest get 404 | Same as above — return `[]` silently. |
| Per-deck fetch 403 | Keep the deck entry with `access: 'denied'` — SlideViewer shows it disabled with a "no access" message. |
| Per-deck fetch 404 | Same as above — likely a manifest typo; log a console warning. |
| Network error | `access: 'error'` — SlideViewer offers retry. |
| `accessToken` rejected (401) | Treat as not signed in — return `[]`; the app's existing token-refresh path picks it up on next sign-in. |

## SlideViewer integration — UX

`openSlideViewer(sectionId)` (rdvisual: `src/framework/SlideViewer.js`;
stvisual: `src/components/SlideViewer.js`) becomes:

1. **Synchronously** show the public decks for `sectionId` (no regression for
   existing users; the public-only behaviour is unchanged when the feature is
   disabled).
2. If `privateSlidesFolderId` is configured **and** a sign-in session exists,
   kick off `fetchPrivateDecks(accessToken)` in parallel. When it resolves,
   filter the returned decks by `section === sectionId` and merge them into
   the deck picker. Private decks render as `🔒 <title>`.
3. If the folder is configured but the user is **not** signed in, show a
   single `🔒 Sign in to see private slides` row in the picker. Clicking it
   opens the existing cloud drawer with the sign-in CTA. After successful
   sign-in, the viewer re-fetches and updates the picker.
4. If the folder is configured and a fetched deck has `access: 'denied'`,
   show it as `🔒 <title> — no access` (disabled row).
5. If the folder is **not** configured, behave exactly as today (no 🔒 row,
   no Drive calls, no changes to the public deck picker).

The deck rendering itself — `parseDeck()`, the slide overlay, keyboard
navigation, the existing close/prev/next testids — is **unchanged**. Private
decks render identically to public ones; only the picker row gets the 🔒.

## i18n keys (added in both repos)

To both `en` and `zh` blocks of each repo's content dict:

| Key | en | zh |
|---|---|---|
| `slides.private.chipAria` | `Private deck` | `私人投影片` |
| `slides.private.signInRow` | `🔒 Sign in to see private slides` | `🔒 登入以檢視私人投影片` |
| `slides.private.noAccess` | `no access` | `無存取權` |
| `slides.private.fetchError` | `couldn't load — retry` | `載入失敗 —— 重試` |
| `slides.private.retryBtn` | `Retry` | `重試` |

## Testing

**Per repo:**

- `privateDecks.test.js` (jsdom + `fetch` mock): manifest parse; the four
  error states (folder missing, manifest 403/404, deck 403/404, network);
  deck-shape output; per-session cache; no token → `[]`.
- `SlideViewer.test.jsx` extension: given a mixed list of public + private
  decks, the picker renders both with the correct icons; clicking a
  `needs-auth` row triggers the sign-in path; clicking a `denied` row shows
  the gate message; selecting an `ok` private deck renders via the same
  `parseDeck` path as a public deck.
- `cloudIntegration.test.js` (existing): assert that `drive.readonly` is now
  added to the provider's scopes.

**No e2e**: real Drive auth in CI is not worth the setup. Manual verification
uses a test Drive folder with a known manifest in each repo's first
deployment.

## Files

**rdvisual** (canonical first):
- Create: `src/framework/privateDecks.js`, `src/tests/privateDecks.test.js`,
  `src/tests/cloudIntegration.test.js` (rdvisual does not yet have one — Plan
  A adds a minimal test covering the new scope addition), `docs/private-slides.md`
  (operator guide).
- Modify: `src/framework/SlideViewer.js` + `.css`,
  `src/framework/cloudIntegration.js`, `src/config/cloudConfig.js`,
  `src/content/i18n/dict.js`.
- Test updates: `src/tests/SlideViewer.test.jsx` does not currently exist in
  rdvisual either — Plan A adds it (covers the deck picker for public-only,
  public + private merged, and the sign-in row).
- Regenerated: `src/standalone.js`.

**stvisual** (Plan B, mirrors rdvisual's shape into stvisual paths):
- Create: `src/utils/privateDecks.js`, `src/tests/privateDecks.test.js`,
  `docs/private-slides.md`.
- Modify: `src/components/SlideViewer.js` + `.css`,
  `src/utils/cloudIntegration.js`, `src/config/cloudConfig.js`,
  `src/i18n/dict.js`.
- Test updates: `src/tests/SlideViewer.test.jsx` (existing) and
  `src/tests/cloudIntegration.test.js` (existing) get the new private-deck
  and `drive.readonly` scope assertions added.
- Regenerated: `src/standalone.js`.

## Rollout

**Plan A — rdvisual** (first):

1. Brainstorm-output is this spec (committed to rdvisual on
   `feat/private-slides-on-drive`).
2. Write the implementation plan in
   `docs/superpowers/plans/2026-05-24-private-slides-on-drive.md`.
3. Implement subagent-driven; PR → main → deploy.

**Plan B — stvisual** (after Plan A merges):

1. Commit an identical copy of this spec to stvisual at the same path on a
   new `feat/private-slides-on-drive` branch.
2. Write the stvisual implementation plan — same task structure as rdvisual's
   plan, with file paths swapped per the table above. Use the merged
   rdvisual implementation as the reference (it is the canonical
   working code).
3. Implement subagent-driven; PR → main → deploy.

This is analogous to the SAILOR / Meta ACH ports earlier this session, except
the canonical "source" is rdvisual rather than stvisual.

## Out of scope

- Uploading or editing slides from inside the app (course owner edits in
  Drive's UI).
- Real-time / push updates (manifest is fetched once per `openSlideViewer`
  call).
- Per-deck sharing (the folder is the share unit).
- Multiple Drive folders per repo.
- Anonymous-but-gated access (use the public bundle for any deck that should
  be visible to everyone).
- Hosting images on Drive (images stay in `public/slide-assets/`).
- Server-side proxy — everything is client-side with the user's own OAuth
  token.
- Extracting `SlideViewer` + `cloudIntegration` into a shared npm package
  consumed by both repos — large refactor, separate future cycle.
