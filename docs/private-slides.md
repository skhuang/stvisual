# Private course slides on Google Drive

Some course slides shouldn't be public. stvisual can fetch them from a Google
Drive folder at runtime, gated by Drive-native per-user sharing. Public
bundled decks and private Drive decks appear together in the same in-app
slide viewer; private decks get a 🔒 chip and require sign-in.

## What you need

- A Google account with Drive.
- A Google Cloud project with the Drive API enabled (the same project used by
  Firebase Auth for this deployment — already set up if the cloud drawer
  works).
- The deployment's `cloudConfig.js` (filled at build time via inject-env).

## One-time setup

1. **Create a Drive folder.** Name it something memorable, e.g.
   `stvisual — course private slides`. Copy its folder ID from the URL
   (the bit after `/folders/`).
2. **Share the folder** with the Google accounts (or Google Group) of the
   users who should see private decks. Use Drive's normal "Share" dialog;
   "Viewer" permission is enough. Revoke any time from the same dialog.
3. **Set the folder ID** in your deployment's environment:
   `DRIVE_PRIVATE_SLIDES_FOLDER_ID=<the folder ID>`.
   Leave it unset to disable the feature entirely (no 🔒 in the UI, no Drive
   calls).

## Writing a private deck

1. Author your Marp markdown locally (the same `marp: true` front-matter as
   public decks). Two files per deck — `*.en.md` and `*.zh-TW.md`.
2. Upload both files to the Drive folder.
3. Add an entry to `private-decks.json` in the same folder. Create the file
   if it doesn't exist. Schema:

   ```json
   {
     "version": 1,
     "decks": [
       {
         "id": "advanced-extras",
         "section": "graph",
         "files": {
           "en": "advanced-extras.en.md",
           "zh-TW": "advanced-extras.zh-TW.md"
         },
         "titleEn": "Graph coverage — instructor notes",
         "titleZh": "圖形涵蓋 —— 講師補充"
       }
     ]
   }
   ```

   All six fields per entry are required. `section` must match the id of an
   existing app section — the deck will appear in that section's slide
   viewer.

4. That's it — the next time an authorised user opens the section's slide
   viewer, the deck appears with a 🔒 chip.

## What users see

- **Signed-in, in the share list:** the deck appears alongside public decks
  marked `🔒 <title>`. Clicking it renders the markdown via the same viewer.
- **Signed-in, not in the share list:** no 🔒 row appears at all — the deck
  is invisible (Drive returns 403 for the manifest, and the app falls back
  silently).
- **Not signed in:** the deck picker shows a single
  `🔒 Sign in to see private slides` row. Clicking it opens the cloud drawer
  for Google sign-in.

## OAuth scope note

The app requests `https://www.googleapis.com/auth/drive.readonly` alongside
the existing `drive.file` scope. On the Google consent screen this appears
as "See and download your Drive files". Users who decline see no 🔒 rows
(graceful degradation, no error).

## Images

Images referenced from a private deck must still live in the public
`public/slide-assets/` bundle (i.e. they ship with the app). Hosting deck
images on Drive is not currently supported.

## Limitations

- One Drive folder per deployment.
- No live updates — the manifest is fetched once per slide-viewer open.
- No editing slides from the app — author in Drive's UI.
- Per-deck sharing isn't first-class — share at the folder level.
