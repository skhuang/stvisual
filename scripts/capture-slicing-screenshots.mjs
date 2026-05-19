// Screenshot capture script for the four slicing explorers (Section N, decks #58–#61).
//
// Spawns a local server on http://127.0.0.1:4173 if not already running, opens
// each explorer in Chromium via Playwright, drives it to the target state, and
// saves 8 PNGs into docs/assets/slides/.
//
//   node scripts/capture-slicing-screenshots.mjs         # zh locale (bare filenames)
//   SLIDE_LOCALE=en node scripts/capture-slicing-screenshots.mjs  # en locale (-en suffix)
//
// Requires: dev dependency @playwright/test (already installed) and python3.

import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const OUT_DIR = join(ROOT, 'docs/assets/slides');
const BASE_URL = 'http://127.0.0.1:4173/index.html';

// Locale handling — mirrors the existing deck-#3 capture script exactly.
const SLIDE_LOCALE = process.env.SLIDE_LOCALE === 'en' ? 'en' : 'zh';
function shot(name) {
  return join(OUT_DIR, SLIDE_LOCALE === 'en' ? `${name}-en.png` : `${name}.png`);
}

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function isServerUp() {
  try {
    const res = await fetch(BASE_URL);
    return res.ok;
  } catch {
    return false;
  }
}

async function startServer() {
  const child = spawn('python3', ['-m', 'http.server', '4173'], {
    cwd: ROOT,
    stdio: 'ignore',
    detached: false,
  });
  for (let i = 0; i < 40; i++) {
    if (await isServerUp()) return child;
    await sleep(250);
  }
  child.kill();
  throw new Error('Failed to start http.server on :4173');
}

async function main() {
  await ensureDir(OUT_DIR);

  let serverChild = null;
  if (!(await isServerUp())) {
    serverChild = await startServer();
    console.log(`[capture] started http.server on :4173 (locale=${SLIDE_LOCALE})`);
  } else {
    console.log('[capture] reusing existing :4173 server');
  }

  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  // Set the locale in localStorage before any navigation — same mechanism as
  // the existing deck-#3 capture script.
  await ctx.addInitScript((locale) => {
    try {
      window.localStorage.setItem('stvisual.locale', locale);
    } catch { /* ignore */ }
  }, SLIDE_LOCALE);

  try {
    // ── N1: ProgramSlicingExplorer ────────────────────────────────────────────────
    // Two shots: backward-static on s11/label (classify), then dynamic on pos trace.
    // The classify example gives a visible shrink: 6 statements static vs 3 dynamic.

    const pse = await ctx.newPage();
    await pse.goto(`${BASE_URL}?explorer=ProgramSlicingExplorer`, { waitUntil: 'networkidle' });
    await pse.getByTestId('program-slicing-explorer').waitFor();
    const pseRoot = pse.getByTestId('program-slicing-explorer');

    // Select the classify example.
    await pse.getByTestId('slicing-example-classify').click();

    // Ensure backward + static are active.
    await pse.getByTestId('slicing-dir-backward').click();
    await pse.getByTestId('slicing-mode-static').click();

    // Select the criterion: click statement s11 (return label), then variable chip.
    // Scope to the explorer root so strict-mode doesn't complain about duplicate
    // data-stmt elements that live in other explorers pre-rendered on the same DOM.
    await pseRoot.locator('[data-stmt="s11"]').click();
    await pse.getByTestId('slicing-var-label').click();
    await sleep(250);

    // Shot 1 — slice-program-backward (6 statements highlighted)
    await pseRoot.screenshot({ path: shot('slice-program-backward') });
    console.log('[capture] saved', shot('slice-program-backward'));

    // Shot 2 — slice-program-dynamic: switch to dynamic, pick the pos trace.
    // Dynamic slice of label for pos (n=5) is only 3 statements — the contrast
    // deck #58 needs.
    await pse.getByTestId('slicing-mode-dynamic').click();
    await pse.getByTestId('slicing-trace-pos').click();
    await sleep(250);

    await pseRoot.screenshot({ path: shot('slice-program-dynamic') });
    console.log('[capture] saved', shot('slice-program-dynamic'));

    await pse.close();

    // ── N2: SliceDicingExplorer ───────────────────────────────────────────────────
    // Two shots: static / summary-stats scenario, then dynamic / fare scenario.

    const sde = await ctx.newPage();
    await sde.goto(`${BASE_URL}?explorer=SliceDicingExplorer`, { waitUntil: 'networkidle' });
    await sde.getByTestId('slice-dicing-explorer').waitFor();
    const sdeRoot = sde.getByTestId('slice-dicing-explorer');

    // Shot 3 — slice-dicing-static
    await sde.getByTestId('dicing-mode-static').click();
    await sde.getByTestId('dicing-scenario-summary-stats').click();
    await sleep(250);

    await sdeRoot.screenshot({ path: shot('slice-dicing-static') });
    console.log('[capture] saved', shot('slice-dicing-static'));

    // Shot 4 — slice-dicing-dynamic
    await sde.getByTestId('dicing-mode-dynamic').click();
    await sde.getByTestId('dicing-scenario-fare').click();
    await sleep(250);

    await sdeRoot.screenshot({ path: shot('slice-dicing-dynamic') });
    console.log('[capture] saved', shot('slice-dicing-dynamic'));

    await sde.close();

    // ── N3: SliceCoverageExplorer ─────────────────────────────────────────────────
    // Two shots: classify example (all traces on = 100%), then drop neg trace (83%).

    const sce = await ctx.newPage();
    await sce.goto(`${BASE_URL}?explorer=SliceCoverageExplorer`, { waitUntil: 'networkidle' });
    await sce.getByTestId('slice-coverage-explorer').waitFor();
    const sceRoot = sce.getByTestId('slice-coverage-explorer');

    // Click the classify example chip — resets traces to all-on.
    await sce.getByTestId('coverage-example-classify').click();
    await sleep(250);

    // Shot 5 — slice-coverage-full (100%, all traces active)
    await sceRoot.screenshot({ path: shot('slice-coverage-full') });
    console.log('[capture] saved', shot('slice-coverage-full'));

    // Shot 6 — slice-coverage-gap: drop the neg trace to reveal the s8 gap.
    await sce.getByTestId('coverage-trace-neg').click();
    await sleep(250);

    await sceRoot.screenshot({ path: shot('slice-coverage-gap') });
    console.log('[capture] saved', shot('slice-coverage-gap'));

    await sce.close();

    // ── N4: SliceRegressionExplorer ───────────────────────────────────────────────
    // Two shots: static mode (classify / s3 edited), then dynamic mode.

    const sre = await ctx.newPage();
    await sre.goto(`${BASE_URL}?explorer=SliceRegressionExplorer`, { waitUntil: 'networkidle' });
    await sre.getByTestId('slice-regression-explorer').waitFor();
    const sreRoot = sre.getByTestId('slice-regression-explorer');

    // Select the classify example, mark s3 as the edited statement.
    // Scope to the explorer root to avoid strict-mode violations from duplicate
    // data-stmt elements in other explorers pre-rendered on the same DOM.
    await sre.getByTestId('regression-example-classify').click();
    await sreRoot.locator('[data-stmt="s3"]').click();

    // Shot 7 — slice-regression-static
    await sre.getByTestId('regression-mode-static').click();
    await sleep(250);

    await sreRoot.screenshot({ path: shot('slice-regression-static') });
    console.log('[capture] saved', shot('slice-regression-static'));

    // Shot 8 — slice-regression-dynamic (state continues from shot 7)
    await sre.getByTestId('regression-mode-dynamic').click();
    await sleep(250);

    await sreRoot.screenshot({ path: shot('slice-regression-dynamic') });
    console.log('[capture] saved', shot('slice-regression-dynamic'));

    await sre.close();

    console.log(`[capture] done — 8 PNGs written to ${OUT_DIR}`);
  } finally {
    // ── Teardown ──────────────────────────────────────────────────────────────────
    await browser.close();
    if (serverChild) {
      serverChild.kill();
      console.log('[capture] stopped http.server');
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
