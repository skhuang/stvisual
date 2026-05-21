// Screenshot capture script for the Input Space Partitioning explorer (deck #64).
//
//   node scripts/capture-isp-screenshots.mjs                  # zh locale (bare names)
//   SLIDE_LOCALE=en node scripts/capture-isp-screenshots.mjs  # en locale (-en suffix)
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

const SLIDE_LOCALE = process.env.SLIDE_LOCALE === 'en' ? 'en' : 'zh';
function shot(name) {
  return join(OUT_DIR, SLIDE_LOCALE === 'en' ? `${name}-en.png` : `${name}.png`);
}

async function ensureDir(p) { await mkdir(p, { recursive: true }); }

async function isServerUp() {
  try { const res = await fetch(BASE_URL); return res.ok; } catch { return false; }
}

async function startServer() {
  const child = spawn('python3', ['-m', 'http.server', '4173'], {
    cwd: ROOT, stdio: 'ignore', detached: false,
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
  await ctx.addInitScript((locale) => {
    try { window.localStorage.setItem('stvisual.locale', locale); } catch { /* ignore */ }
  }, SLIDE_LOCALE);

  try {
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}?explorer=InputSpacePartitioningExplorer`, { waitUntil: 'networkidle' });
    await page.getByTestId('isp-explorer').waitFor();
    const root = page.getByTestId('isp-explorer');

    // Shot 1 — isp-idm: the Input Domain Model panel (boot, find-element example).
    await sleep(250);
    await root.getByTestId('isp-idm').screenshot({ path: shot('isp-idm') });
    console.log('[capture] saved', shot('isp-idm'));

    // Shot 2 — isp-acoc: All Combinations test set.
    await root.getByTestId('isp-criterion-acoc').click();
    await sleep(250);
    await root.getByTestId('isp-test-set').screenshot({ path: shot('isp-acoc') });
    console.log('[capture] saved', shot('isp-acoc'));

    // Shot 3 — isp-ecc: Each Choice test set.
    await root.getByTestId('isp-criterion-ecc').click();
    await sleep(250);
    await root.getByTestId('isp-test-set').screenshot({ path: shot('isp-ecc') });
    console.log('[capture] saved', shot('isp-ecc'));

    // Shot 4 — isp-pwc: Pair-Wise test set.
    await root.getByTestId('isp-criterion-pwc').click();
    await sleep(250);
    await root.getByTestId('isp-test-set').screenshot({ path: shot('isp-pwc') });
    console.log('[capture] saved', shot('isp-pwc'));

    // Shot 5 — isp-lattice: the criteria subsumption lattice.
    await sleep(250);
    await root.getByTestId('isp-lattice').screenshot({ path: shot('isp-lattice') });
    console.log('[capture] saved', shot('isp-lattice'));

    await page.close();
    console.log(`[capture] done — 5 PNGs written to ${OUT_DIR}`);
  } finally {
    await browser.close();
    if (serverChild) {
      serverChild.kill();
      console.log('[capture] stopped http.server');
    }
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
