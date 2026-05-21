// Screenshot capture for the three Search-Based Testing explorers (deck #65).
//
//   node scripts/capture-sbst-screenshots.mjs                  # zh locale
//   SLIDE_LOCALE=en node scripts/capture-sbst-screenshots.mjs  # en locale
//
// Requires: dev dependency @playwright/test and python3.

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
    // ── Tab 1: branch search ─────────────────────────────────────────────────
    const br = await ctx.newPage();
    await br.goto(`${BASE_URL}?explorer=SbstBranchExplorer`, { waitUntil: 'networkidle' });
    await br.getByTestId('sbst-branch-explorer').waitFor();
    const brRoot = br.getByTestId('sbst-branch-explorer');

    await sleep(250);
    await brRoot.screenshot({ path: shot('sbst-branch-start') });
    console.log('[capture] saved', shot('sbst-branch-start'));

    await brRoot.getByTestId('sbst-branch-run').click();
    await sleep(250);
    await brRoot.screenshot({ path: shot('sbst-branch-covered') });
    console.log('[capture] saved', shot('sbst-branch-covered'));
    await br.close();

    // ── Tab 2: metaheuristic comparison ──────────────────────────────────────
    const cmp = await ctx.newPage();
    await cmp.goto(`${BASE_URL}?explorer=SbstCompareExplorer`, { waitUntil: 'networkidle' });
    await cmp.getByTestId('sbst-compare-explorer').waitFor();
    const cmpRoot = cmp.getByTestId('sbst-compare-explorer');

    await sleep(250);
    await cmpRoot.screenshot({ path: shot('sbst-compare-curves') });
    console.log('[capture] saved', shot('sbst-compare-curves'));

    await cmpRoot.getByTestId('sbst-compare-example-multimodal').click();
    await sleep(250);
    await cmpRoot.screenshot({ path: shot('sbst-compare-stuck') });
    console.log('[capture] saved', shot('sbst-compare-stuck'));
    await cmp.close();

    // ── Tab 3: whole-suite evolution ─────────────────────────────────────────
    const su = await ctx.newPage();
    await su.goto(`${BASE_URL}?explorer=SbstSuiteExplorer`, { waitUntil: 'networkidle' });
    await su.getByTestId('sbst-suite-explorer').waitFor();
    const suRoot = su.getByTestId('sbst-suite-explorer');

    await sleep(250);
    await suRoot.screenshot({ path: shot('sbst-suite-start') });
    console.log('[capture] saved', shot('sbst-suite-start'));

    await suRoot.getByTestId('sbst-suite-run').click();
    await sleep(250);
    await suRoot.screenshot({ path: shot('sbst-suite-covered') });
    console.log('[capture] saved', shot('sbst-suite-covered'));

    await suRoot.getByTestId('sbst-suite-minimised').screenshot({ path: shot('sbst-suite-minimised') });
    console.log('[capture] saved', shot('sbst-suite-minimised'));
    await su.close();

    console.log(`[capture] done — 7 PNGs written to ${OUT_DIR}`);
  } finally {
    await browser.close();
    if (serverChild) {
      serverChild.kill();
      console.log('[capture] stopped http.server');
    }
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
