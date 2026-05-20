// Screenshot capture script for the two TDD Explorers (deck #62).
//
//   node scripts/capture-tdd-screenshots.mjs                       # zh locale
//   SLIDE_LOCALE=en node scripts/capture-tdd-screenshots.mjs       # en locale

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
    // ── Cycle tab ────────────────────────────────────────────────────────────────
    const cyc = await ctx.newPage();
    await cyc.goto(`${BASE_URL}?explorer=TddCycleExplorer`, { waitUntil: 'networkidle' });
    await cyc.getByTestId('tdd-cycle-explorer').waitFor();
    const cycRoot = cyc.getByTestId('tdd-cycle-explorer');

    // Shot 1 — tdd-cycle-fb-start (FizzBuzz s1 RED, empty code)
    await sleep(250);
    await cycRoot.screenshot({ path: shot('tdd-cycle-fb-start') });
    console.log('[capture] saved', shot('tdd-cycle-fb-start'));

    // Turn predict-mode OFF so Next is not gated on a prediction.
    await cyc.getByTestId('tdd-predict-toggle').click();

    // Shot 2 — tdd-cycle-fb-fake (FizzBuzz s3 RED, fake still in place)
    await cyc.getByTestId('tdd-next-step').click(); // s1 → s2
    await cyc.getByTestId('tdd-next-step').click(); // s2 → s3
    await sleep(250);
    await cycRoot.screenshot({ path: shot('tdd-cycle-fb-fake') });
    console.log('[capture] saved', shot('tdd-cycle-fb-fake'));

    // Shot 3 — tdd-cycle-fb-triangulate (FizzBuzz s4 GREEN)
    await cyc.getByTestId('tdd-next-step').click(); // s3 → s4
    await sleep(250);
    await cycRoot.screenshot({ path: shot('tdd-cycle-fb-triangulate') });
    console.log('[capture] saved', shot('tdd-cycle-fb-triangulate'));

    // Shot 4 — tdd-cycle-fb-refactor (FizzBuzz s9 REFACTOR)
    for (let i = 0; i < 5; i++) {
      await cyc.getByTestId('tdd-next-step').click(); // s4 → s5 → … → s9
    }
    await sleep(250);
    await cycRoot.screenshot({ path: shot('tdd-cycle-fb-refactor') });
    console.log('[capture] saved', shot('tdd-cycle-fb-refactor'));

    // Shot 5 — tdd-cycle-stack-start (Stack kata, step 1 RED)
    await cyc.getByTestId('tdd-kata-stack').click(); // resets stepIndex to 0
    await sleep(250);
    await cycRoot.screenshot({ path: shot('tdd-cycle-stack-start') });
    console.log('[capture] saved', shot('tdd-cycle-stack-start'));

    await cyc.close();

    // ── Rules tab ────────────────────────────────────────────────────────────────
    const rul = await ctx.newPage();
    await rul.goto(`${BASE_URL}?explorer=TddRulesExplorer`, { waitUntil: 'networkidle' });
    await rul.getByTestId('tdd-rules-explorer').waitFor();
    const rulRoot = rul.getByTestId('tdd-rules-explorer');

    // Shot 6 — tdd-rules-block-r1 (write-production-code from start; reason.noRed)
    await rul.getByTestId('tdd-action-write-production-code').click();
    await sleep(250);
    await rulRoot.screenshot({ path: shot('tdd-rules-block-r1') });
    console.log('[capture] saved', shot('tdd-rules-block-r1'));

    // Shot 7 — tdd-rules-block-r3 (refactor while in RED; reason.notGreen)
    await rul.getByTestId('tdd-rules-reset').click();
    await rul.getByTestId('tdd-action-write-failing-test').click(); // → RED
    await rul.getByTestId('tdd-action-refactor').click(); // illegal — notGreen
    await sleep(250);
    await rulRoot.screenshot({ path: shot('tdd-rules-block-r3') });
    console.log('[capture] saved', shot('tdd-rules-block-r3'));

    // Shot 8 — tdd-rules-cycle-done (legal red→green→refactor; cycleCount=1)
    await rul.getByTestId('tdd-rules-reset').click();
    await rul.getByTestId('tdd-action-write-failing-test').click();    // → RED
    await rul.getByTestId('tdd-action-write-production-code').click(); // → GREEN, cycleCount=1
    await rul.getByTestId('tdd-action-refactor').click();              // → REFACTOR
    await sleep(250);
    await rulRoot.screenshot({ path: shot('tdd-rules-cycle-done') });
    console.log('[capture] saved', shot('tdd-rules-cycle-done'));

    await rul.close();

    console.log(`[capture] done — 8 PNGs written to ${OUT_DIR}`);
  } finally {
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
