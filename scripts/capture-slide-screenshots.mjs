// One-off screenshot script for slide deck #3 (Graph Coverage).
//
// Spawns a local server on http://127.0.0.1:4173 (npm run serve), opens the
// page in Chromium via Playwright, drives the GraphCoverageExplorer through
// the views referenced from docs/slides/03-graph-coverage.zh-TW.md and saves
// PNGs into docs/assets/slides/.
//
//   node scripts/capture-slide-screenshots.mjs
//
// Requires: dev dependency @playwright/test (already installed) and python3
// (for `npm run serve`).

import { spawn } from 'node:child_process';
import { mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const OUT_DIR = join(ROOT, 'docs/assets/slides');
const URL = 'http://127.0.0.1:4173/index.html';

// Locale to drive the UI in. Run once per locale:
//   SLIDE_LOCALE=zh node scripts/capture-slide-screenshots.mjs
//   SLIDE_LOCALE=en node scripts/capture-slide-screenshots.mjs
// zh shots keep their bare name; en shots get a `-en` suffix so the
// English decks can reference an English-interface screenshot.
const SLIDE_LOCALE = process.env.SLIDE_LOCALE === 'en' ? 'en' : 'zh';
function shot(name) {
  return join(OUT_DIR, SLIDE_LOCALE === 'en' ? `${name}-en.png` : `${name}.png`);
}

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function isServerUp() {
  try {
    const res = await fetch(URL);
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
  // Wait until reachable.
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

  // Lazy import to keep CLI args minimal.
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  await ctx.addInitScript(() => {
    try {
      window.localStorage.setItem('stvisual.locale', SLIDE_LOCALE);
      window.localStorage.setItem('stvisual.syntaxActiveTab', 'mutation');
    } catch { /* ignore */ }
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.getByTestId('nav-btn-graph').click();
  await page.getByTestId('graph-coverage-explorer').waitFor();

  const explorer = page.getByTestId('graph-coverage-explorer');

  // 1. Full Graph Coverage explorer with Node Coverage selected (default).
  await page.getByTestId('criterion-node').click();
  await sleep(200);
  await explorer.screenshot({ path: shot('graph-coverage-node') });
  console.log('[capture] saved graph-coverage-node.png');

  // 2. Edge Coverage — shows the back-edge E-B in requirement list.
  await page.getByTestId('criterion-edge').click();
  await sleep(200);
  await explorer.screenshot({ path: shot('graph-coverage-edge') });
  console.log('[capture] saved graph-coverage-edge.png');

  // 3. Prime Path Coverage + test-path-card with metrics.
  await page.getByTestId('criterion-prime-path').click();
  await sleep(300);
  await explorer.screenshot({ path: shot('graph-coverage-prime-path') });
  await page.getByTestId('graph-test-path-card').scrollIntoViewIfNeeded();
  await page.getByTestId('graph-test-path-card').screenshot({
    path: shot('graph-coverage-metrics'),
  });
  console.log('[capture] saved graph-coverage-prime-path.png + graph-coverage-metrics.png');

  // 4. Triangle Problem CFG (program upload demo).
  await page.selectOption('[data-testid="program-example-select"]', 'triangle-problem');
  await sleep(400);
  // Click the first requirement to show source mapping highlight.
  const firstReq = page.getByTestId('requirement-list').locator('li').first();
  if (await firstReq.count()) {
    await firstReq.click();
    await sleep(200);
  }
  await explorer.screenshot({ path: shot('graph-coverage-triangle') });
  console.log('[capture] saved graph-coverage-triangle.png');

  // 5. CFG editor card focused (live editing).
  await page.selectOption('[data-testid="program-example-select"]', '__none__').catch(() => {});
  await page.getByTestId('graph-editor-card').scrollIntoViewIfNeeded();
  await page.getByTestId('graph-editor-card').screenshot({
    path: shot('graph-coverage-editor'),
  });
  console.log('[capture] saved graph-coverage-editor.png');

  // ---- Deck #4: Data Flow Coverage ----

  // 6. DFG empty state — open a fresh page so the sample CFG (no source) is active.
  const emptyPage = await ctx.newPage();
  await emptyPage.goto(URL, { waitUntil: 'networkidle' });
  await emptyPage.getByTestId('graph-coverage-explorer').waitFor();
  const emptyDfg = emptyPage.getByTestId('graph-dfg-empty');
  if (await emptyDfg.count()) {
    await emptyPage.getByTestId('graph-dfg-card').scrollIntoViewIfNeeded();
    await emptyPage.getByTestId('graph-dfg-card').screenshot({
      path: shot('dfg-empty'),
    });
    console.log('[capture] saved dfg-empty.png');
  } else {
    console.log('[capture] skipped dfg-empty.png (empty DFG card not visible)');
  }
  await emptyPage.close();

  // 7. Triangle Problem with DFG view + all-defs criterion.
  await page.selectOption('[data-testid="program-example-select"]', 'triangle-problem');
  await sleep(400);
  await page.getByTestId('graph-dfg-card').scrollIntoViewIfNeeded();
  await page.getByTestId('graph-dfg-card').screenshot({
    path: shot('dfg-triangle'),
  });
  console.log('[capture] saved dfg-triangle.png');

  // 8. All-Defs requirements view (full explorer screenshot).
  await page.getByTestId('criterion-all-defs').click();
  await sleep(300);
  await explorer.screenshot({ path: shot('dfg-all-defs') });
  console.log('[capture] saved dfg-all-defs.png');

  // 9. All-Uses requirements view.
  await page.getByTestId('criterion-all-uses').click();
  await sleep(300);
  await explorer.screenshot({ path: shot('dfg-all-uses') });
  console.log('[capture] saved dfg-all-uses.png');

  // 10. All-DU-Paths requirements view.
  await page.getByTestId('criterion-all-du-paths').click();
  await sleep(300);
  await explorer.screenshot({ path: shot('dfg-all-du-paths') });
  console.log('[capture] saved dfg-all-du-paths.png');

  // ---- Deck #5: Logic Coverage ----

  // Open a fresh page focused on the Logic Coverage section to avoid scrolling
  // through everything above it.
  const logicPage = await ctx.newPage();
  await logicPage.goto(URL, { waitUntil: 'networkidle' });
  // Filter section to "logic" so only this card is rendered (less scrolling).
  await logicPage.getByTestId('nav-btn-logic').click();
  await logicPage.getByTestId('logic-coverage').waitFor();
  const logicExplorer = logicPage.getByTestId('logic-coverage');

  // Pick the simplest 3-clause example: (a && b) || c
  await logicPage.getByTestId('logic-example-simple-and-or').click();
  await sleep(300);

  // 11. Overview — example chips, expression input, recent chips.
  await logicExplorer.screenshot({ path: shot('logic-overview') });
  console.log('[capture] saved logic-overview.png');

  // 12. PC criterion + truth table (focus on truth-table card).
  await logicPage.getByTestId('logic-criterion-pc').click();
  await sleep(200);
  const truthTable = logicPage.getByTestId('logic-truth-table');
  if (await truthTable.count()) {
    await truthTable.scrollIntoViewIfNeeded();
    await truthTable.screenshot({ path: shot('logic-truth-table') });
    console.log('[capture] saved logic-truth-table.png');
  }

  // 13. CACC view (full explorer).
  await logicPage.getByTestId('logic-criterion-cacc').click();
  await sleep(200);
  await logicExplorer.screenshot({ path: shot('logic-cacc') });
  console.log('[capture] saved logic-cacc.png');

  // 14. IC + DNF + K-map (full explorer to capture both kmaps and DNF text).
  await logicPage.getByTestId('logic-criterion-ic').click();
  await sleep(300);
  await logicExplorer.screenshot({ path: shot('logic-ic-kmap') });
  console.log('[capture] saved logic-ic-kmap.png');

  // 15. CUTPNFP K-map — switch to 4-clause example for richer K-map.
  await logicPage.getByTestId('logic-example-four-clause').click();
  await sleep(200);
  await logicPage.getByTestId('logic-criterion-cutpnfp').click();
  await sleep(300);
  await logicExplorer.screenshot({ path: shot('logic-cutpnfp') });
  console.log('[capture] saved logic-cutpnfp.png');

  await logicPage.close();

  // ---- Deck #6: Program Mutation ----

  const mutPage = await ctx.newPage();
  await mutPage.goto(URL, { waitUntil: 'networkidle' });
  await mutPage.getByTestId('nav-btn-syntax').click();
  // Make sure the Program Mutation tab is active.
  await mutPage.locator('[data-syntax-tab="mutation"]').click();
  await mutPage.getByTestId('syntax-coverage').waitFor();
  const mutExplorer = mutPage.getByTestId('syntax-coverage');

  // 16. Overview — max example default.
  await mutPage.getByTestId('syntax-example-max').click();
  await sleep(400);
  await mutExplorer.screenshot({ path: shot('mutation-overview') });
  console.log('[capture] saved mutation-overview.png');

  // 17. Mutant list — switch to triangle (richer mutant variety).
  await mutPage.getByTestId('syntax-example-triangle').click();
  await sleep(500);
  const mutantList = mutPage.getByTestId('syntax-mutant-list');
  if (await mutantList.count()) {
    await mutantList.scrollIntoViewIfNeeded();
    await mutantList.screenshot({ path: shot('mutation-mutant-list') });
    console.log('[capture] saved mutation-mutant-list.png');
  }

  // 18. Per-test output — click the first live mutant so the test table shows
  // per-row outputs.
  const firstMutant = mutPage.locator('[data-testid^="syntax-mutant-"]').first();
  if (await firstMutant.count()) {
    await firstMutant.click();
    await sleep(200);
  }
  await mutExplorer.screenshot({ path: shot('mutation-per-test') });
  console.log('[capture] saved mutation-per-test.png');

  // 19. Object-Oriented example.
  await mutPage.getByTestId('syntax-example-shapeHierarchy').click();
  await sleep(500);
  await mutExplorer.screenshot({ path: shot('mutation-shape-hierarchy') });
  console.log('[capture] saved mutation-shape-hierarchy.png');

  await mutPage.close();

  // ---- Deck #7: Grammar / String Mutation ----

  const gramPage = await ctx.newPage();
  await gramPage.goto(URL, { waitUntil: 'networkidle' });
  await gramPage.getByTestId('nav-btn-syntax').click();
  await gramPage.locator('[data-syntax-tab="grammar"]').click();
  await gramPage.getByTestId('grammar-coverage').waitFor();
  const gramExplorer = gramPage.getByTestId('grammar-coverage');

  // Use the arithmetic grammar as the running example.
  await gramPage.locator('[data-grammar-example="arith"]').click();
  await sleep(500);

  // 20. Grammar overview — BNF editor + productions + terminals.
  await gramExplorer.screenshot({ path: shot('grammar-overview') });
  console.log('[capture] saved grammar-overview.png');

  // 21. Derivations + PDC/TSC view.
  await gramPage.locator('[data-grammar-subtab="derivations"]').click().catch(() => {});
  await sleep(300);
  await gramExplorer.screenshot({ path: shot('grammar-derivations') });
  console.log('[capture] saved grammar-derivations.png');

  // 22. Grammar mutants view.
  await gramPage.locator('[data-grammar-subtab="mutation"]').click().catch(() => {});
  await sleep(400);
  await gramExplorer.screenshot({ path: shot('grammar-mutants') });
  console.log('[capture] saved grammar-mutants.png');

  // 23. String mutants view.
  await gramPage.locator('[data-grammar-subtab="string"]').click().catch(() => {});
  await sleep(400);
  await gramExplorer.screenshot({ path: shot('grammar-string-mutants') });
  console.log('[capture] saved grammar-string-mutants.png');

  await gramPage.close();

  // ---- Deck #8: Specification Mutation ----

  const specPage = await ctx.newPage();
  await specPage.goto(URL, { waitUntil: 'networkidle' });
  await specPage.getByTestId('nav-btn-syntax').click();
  await specPage.locator('[data-syntax-tab="spec"]').click();
  await specPage.getByTestId('spec-mutation').waitFor();
  const specExplorer = specPage.getByTestId('spec-mutation');

  // Start from the basic guard example.
  await specPage.locator('[data-spec-category="basic"]').click().catch(() => {});
  await sleep(200);
  await specPage.locator('[data-spec-example="guard"]').click();
  await sleep(400);

  // 24. Spec overview — category + example chips, predicate input.
  await specExplorer.screenshot({ path: shot('spec-overview') });
  console.log('[capture] saved spec-overview.png');

  // 25. Mutants list — focus on guarded predicate with ENF / BCR / LRO / UOI.
  const specMutantList = specPage.getByTestId('spec-mutant-list');
  if (await specMutantList.count()) {
    // Select the first mutant so the killer-assignment detail panel renders.
    const firstSpecMutant = specPage.locator('[data-spec-mutant]').first();
    if (await firstSpecMutant.count()) {
      await firstSpecMutant.click();
      await sleep(200);
    }
    await specExplorer.screenshot({ path: shot('spec-mutants') });
    console.log('[capture] saved spec-mutants.png');
  }

  // 26. Dual FSM view — focused on the spec-fsm-grid (with a mutant selected
  // we should see killer transitions on the right monitor).
  const fsmGrid = specPage.getByTestId('spec-fsm-grid');
  if (await fsmGrid.count()) {
    await fsmGrid.scrollIntoViewIfNeeded();
    await fsmGrid.screenshot({ path: shot('spec-fsm') });
    console.log('[capture] saved spec-fsm.png');
  }

  // 27. SMV source — switch to SMV category and pick smv-cruise (rich enough).
  await specPage.locator('[data-spec-category="smv"]').click();
  await sleep(200);
  await specPage.locator('[data-spec-example="smv-cruise"]').click();
  await sleep(500);
  const smvSource = specPage.getByTestId('spec-smv-source');
  if (await smvSource.count()) {
    await smvSource.scrollIntoViewIfNeeded();
    await smvSource.screenshot({ path: shot('spec-smv-source') });
    console.log('[capture] saved spec-smv-source.png');
  }

  await specPage.close();

  // ---- Decks #1 + #2: Methods / Flow / Pyramid ----

  const overviewPage = await ctx.newPage();
  await overviewPage.goto(URL, { waitUntil: 'networkidle' });

  // 28. Methods overview — expand all so all 16 techniques are visible.
  await overviewPage.getByTestId('nav-btn-methods').click();
  await overviewPage.getByTestId('testing-method-tree').waitFor();
  await overviewPage.getByTestId('toggle-all-btn').click();
  await sleep(300);
  await overviewPage.getByTestId('testing-method-tree').screenshot({
    path: shot('methods-overview'),
  });
  console.log('[capture] saved methods-overview.png');

  // 29. White-box card detail — collapse all, then expand only whitebox.
  await overviewPage.getByTestId('toggle-all-btn').click();
  await sleep(200);
  await overviewPage.getByTestId('method-card-btn-whitebox').click();
  await sleep(200);
  await overviewPage.getByTestId('method-card-whitebox').screenshot({
    path: shot('methods-whitebox'),
  });
  console.log('[capture] saved methods-whitebox.png');

  // 30. Testing flow — auto-play not necessary; just capture the strip.
  await overviewPage.getByTestId('nav-btn-flow').click();
  await overviewPage.getByTestId('testing-flow').waitFor();
  await sleep(200);
  await overviewPage.getByTestId('testing-flow').screenshot({
    path: shot('flow-overview'),
  });
  console.log('[capture] saved flow-overview.png');

  // 31. Testing pyramid + type cards.
  await overviewPage.getByTestId('nav-btn-types').click();
  await overviewPage.getByTestId('testing-types').waitFor();
  await sleep(200);
  await overviewPage.getByTestId('testing-types').screenshot({
    path: shot('pyramid-overview'),
  });
  console.log('[capture] saved pyramid-overview.png');

  await overviewPage.close();

  // ---- Deck #9: Fuzz Testing ----

  const fuzzPage = await ctx.newPage();
  await fuzzPage.goto(URL, { waitUntil: 'networkidle' });
  await fuzzPage.getByTestId('nav-btn-fuzz').click();
  await fuzzPage.getByTestId('fuzz-explorer').waitFor();
  const fuzzExplorer = fuzzPage.getByTestId('fuzz-explorer');

  // Use the triangle classifier as the running example.
  await fuzzPage.getByTestId('fuzz-example-triangle-classifier').click();
  await sleep(300);
  await fuzzPage.getByTestId('fuzz-run-btn').click();
  await sleep(800);

  // 32. Overview — full explorer after a run.
  await fuzzExplorer.screenshot({ path: shot('fuzz-overview') });
  console.log('[capture] saved fuzz-overview.png');

  // 33. CFG with a selected test case.
  const fuzzFirstCase = fuzzPage.locator('[data-testid^="fuzz-case-"]').first();
  if (await fuzzFirstCase.count()) {
    await fuzzFirstCase.click();
    await sleep(200);
  }
  const fuzzCfg = fuzzPage.getByTestId('fuzz-cfg');
  if (await fuzzCfg.count()) {
    await fuzzCfg.scrollIntoViewIfNeeded();
    await fuzzCfg.screenshot({ path: shot('fuzz-cfg') });
    console.log('[capture] saved fuzz-cfg.png');
  }
  await fuzzPage.close();

  // ---- Deck #10: Symbolic Execution ----

  const symbexPage = await ctx.newPage();
  await symbexPage.goto(URL, { waitUntil: 'networkidle' });
  await symbexPage.getByTestId('nav-btn-symbex').click();
  await symbexPage.getByTestId('symbex-explorer').waitFor();
  const symbexExplorer = symbexPage.getByTestId('symbex-explorer');

  await symbexPage.getByTestId('symbex-example-triangle').click();
  await sleep(500);

  // 34. Symbex overview — explorer with full path list.
  await symbexExplorer.screenshot({ path: shot('symbex-overview') });
  console.log('[capture] saved symbex-overview.png');

  // 35. Path list focused.
  const symbexPathList = symbexPage.getByTestId('symbex-paths');
  if (await symbexPathList.count()) {
    await symbexPathList.scrollIntoViewIfNeeded();
    await symbexPathList.screenshot({ path: shot('symbex-paths') });
    console.log('[capture] saved symbex-paths.png');
  }

  // 36. CFG with a selected path.
  const firstSymbexPath = symbexPage.locator('[data-symbex-path]').first();
  if (await firstSymbexPath.count()) {
    await firstSymbexPath.click();
    await sleep(200);
  }
  const symbexCfg = symbexPage.getByTestId('symbex-cfg');
  if (await symbexCfg.count()) {
    await symbexCfg.scrollIntoViewIfNeeded();
    await symbexCfg.screenshot({ path: shot('symbex-cfg') });
    console.log('[capture] saved symbex-cfg.png');
  }
  await symbexPage.close();

  // ---- Deck #11: Concolic Execution ----

  const concolicPage = await ctx.newPage();
  await concolicPage.goto(URL, { waitUntil: 'networkidle' });
  await concolicPage.getByTestId('nav-btn-concolic').click();
  await concolicPage.getByTestId('concolic-explorer').waitFor();
  const concolicExplorer = concolicPage.getByTestId('concolic-explorer');

  await concolicPage.getByTestId('concolic-example-triangle').click();
  await sleep(500);

  // 37. Concolic overview.
  await concolicExplorer.screenshot({ path: shot('concolic-overview') });
  console.log('[capture] saved concolic-overview.png');

  // 38. Iteration list focused.
  const concolicIters = concolicPage.getByTestId('concolic-iters');
  if (await concolicIters.count()) {
    await concolicIters.scrollIntoViewIfNeeded();
    await concolicIters.screenshot({ path: shot('concolic-iters') });
    console.log('[capture] saved concolic-iters.png');
  }

  // 39. CFG with a selected iteration.
  const firstConcolicIter = concolicPage.locator('[data-concolic-iter]').first();
  if (await firstConcolicIter.count()) {
    await firstConcolicIter.click();
    await sleep(200);
  }
  const concolicCfg = concolicPage.getByTestId('concolic-cfg');
  if (await concolicCfg.count()) {
    await concolicCfg.scrollIntoViewIfNeeded();
    await concolicCfg.screenshot({ path: shot('concolic-cfg') });
    console.log('[capture] saved concolic-cfg.png');
  }
  await concolicPage.close();

  // ---- Deck #12: Test Generation from Coverage ----

  const testgenPage = await ctx.newPage();
  await testgenPage.goto(URL, { waitUntil: 'networkidle' });
  await testgenPage.getByTestId('nav-btn-testgen').click();
  await testgenPage.getByTestId('testgen-explorer').waitFor();
  const testgenExplorer = testgenPage.getByTestId('testgen-explorer');

  // Use the triangle classifier as the running example with Edge Coverage (default).
  await testgenPage.getByTestId('testgen-example-triangle-classifier').click().catch(() => {});
  await sleep(400);

  // 40. Full testgen explorer overview.
  await testgenExplorer.screenshot({ path: shot('testgen-overview') });
  console.log('[capture] saved testgen-overview.png');

  // 41. Requirements card — click first requirement to highlight it.
  const firstTestgenReq = testgenPage.locator('[data-testgen-req]').first();
  if (await firstTestgenReq.count()) {
    await firstTestgenReq.click();
    await sleep(300);
  }
  const reqCard = testgenPage.getByTestId('testgen-requirements-card');
  if (await reqCard.count()) {
    await reqCard.scrollIntoViewIfNeeded();
    await reqCard.screenshot({ path: shot('testgen-requirements') });
    console.log('[capture] saved testgen-requirements.png');
  }

  // 42. Minimal tests card — select first test to see CFG path highlight.
  const firstTest = testgenPage.locator('[data-testgen-test]').first();
  if (await firstTest.count()) {
    await firstTest.click();
    await sleep(300);
  }
  const testsCard = testgenPage.getByTestId('testgen-tests-card');
  if (await testsCard.count()) {
    await testsCard.scrollIntoViewIfNeeded();
    await testsCard.screenshot({ path: shot('testgen-tests') });
    console.log('[capture] saved testgen-tests.png');
  }

  // 43. CFG pane with a selected test highlighted.
  const testgenCfg = testgenPage.getByTestId('testgen-cfg');
  if (await testgenCfg.count()) {
    await testgenCfg.scrollIntoViewIfNeeded();
    await testgenCfg.screenshot({ path: shot('testgen-cfg') });
    console.log('[capture] saved testgen-cfg.png');
  }

  await testgenPage.close();

  // ---- Deck #13: Logic Coverage Binding ----

  const bindingPage = await ctx.newPage();
  await bindingPage.goto(URL, { waitUntil: 'networkidle' });
  await bindingPage.getByTestId('nav-btn-logic').click();
  await bindingPage.getByTestId('logic-coverage').waitFor();

  // Pick the triangle predicate example and select CACC.
  const triangleBtn = bindingPage.locator('[data-expression="p && q"]').first();
  if (await triangleBtn.count()) {
    await triangleBtn.click();
    await sleep(300);
  }
  await bindingPage.locator('[data-criterion="CACC"]').click().catch(() => {});
  await sleep(300);

  // Scroll binding panel into view.
  const bindingPanel = bindingPage.getByTestId('logic-binding');
  if (await bindingPanel.count()) {
    await bindingPanel.scrollIntoViewIfNeeded();
    // 44. Binding panel — inputs + source code.
    await bindingPanel.screenshot({ path: shot('binding-panel') });
    console.log('[capture] saved binding-panel.png');

    // 45. Binding results table.
    const bindingResults = bindingPage.getByTestId('logic-binding-results');
    if (await bindingResults.count()) {
      await bindingResults.screenshot({ path: shot('binding-results') });
      console.log('[capture] saved binding-results.png');
    }
  }

  await bindingPage.close();

  // ---- Deck #14: Defect Cost (DefectCostExplorer) ----

  const dcePage = await ctx.newPage();
  await dcePage.goto(URL, { waitUntil: 'networkidle' });
  await dcePage.getByTestId('nav-btn-flow').click();
  await dcePage.locator('[data-flow-tab="defectCost"]').click();
  await dcePage.getByTestId('defect-cost-explorer').waitFor();
  const dceExplorer = dcePage.getByTestId('defect-cost-explorer');

  // 46. Overview — escalating-cost pyramid, no phase selected.
  await dceExplorer.screenshot({ path: shot('defect-cost-overview') });
  console.log('[capture] saved defect-cost-overview.png');

  // 47. Requirements phase selected — cheapest fix.
  await dcePage.getByTestId('dce-col-requirements').click();
  await sleep(250);
  await dceExplorer.screenshot({ path: shot('defect-cost-requirements') });
  console.log('[capture] saved defect-cost-requirements.png');

  // 48. Production phase selected — most expensive fix.
  await dcePage.getByTestId('dce-col-production').click();
  await sleep(250);
  await dceExplorer.screenshot({ path: shot('defect-cost-production') });
  console.log('[capture] saved defect-cost-production.png');

  // 49. Cost chart focused.
  const dceChart = dcePage.getByTestId('dce-chart');
  if (await dceChart.count()) {
    await dceChart.scrollIntoViewIfNeeded();
    await dceChart.screenshot({ path: shot('defect-cost-chart') });
    console.log('[capture] saved defect-cost-chart.png');
  }
  await dcePage.close();

  // ---- Deck #15: V-Model (VModelExplorer) ----

  const vmePage = await ctx.newPage();
  await vmePage.goto(URL, { waitUntil: 'networkidle' });
  await vmePage.getByTestId('nav-btn-flow').click();
  await vmePage.locator('[data-flow-tab="vmodel"]').click();
  await vmePage.getByTestId('vmodel-explorer').waitFor();
  const vmeExplorer = vmePage.getByTestId('vmodel-explorer');

  // 50. Overview — full V diagram, no pair selected.
  await sleep(200);
  await vmeExplorer.screenshot({ path: shot('vmodel-overview') });
  console.log('[capture] saved vmodel-overview.png');

  // 51. Requirements ↔ acceptance pair selected (top of the V).
  await vmePage.getByTestId('vme-dev-requirements').click();
  await sleep(250);
  await vmeExplorer.screenshot({ path: shot('vmodel-requirements') });
  console.log('[capture] saved vmodel-requirements.png');

  // 52. Implementation node selected (bottom of the V).
  const vmeImpl = vmePage.getByTestId('vme-impl');
  if (await vmeImpl.count()) {
    await vmeImpl.click();
    await sleep(250);
    await vmeExplorer.screenshot({ path: shot('vmodel-implementation') });
    console.log('[capture] saved vmodel-implementation.png');
  }

  // 53. Diagram focused.
  const vmeDiagram = vmePage.getByTestId('vme-diagram');
  if (await vmeDiagram.count()) {
    await vmeDiagram.scrollIntoViewIfNeeded();
    await vmeDiagram.screenshot({ path: shot('vmodel-diagram') });
    console.log('[capture] saved vmodel-diagram.png');
  }
  await vmePage.close();

  // ---- Deck #16: Testing Types (TestingTypesTable) ----

  const ttPage = await ctx.newPage();
  await ttPage.goto(URL, { waitUntil: 'networkidle' });
  await ttPage.getByTestId('nav-btn-types').click();
  await ttPage.getByTestId('testing-types').waitFor();

  // 54. Pyramid focused.
  await sleep(300);
  const ttPyramid = ttPage.getByTestId('pyramid');
  if (await ttPyramid.count()) {
    await ttPyramid.scrollIntoViewIfNeeded();
    await ttPyramid.screenshot({ path: shot('testing-types-pyramid') });
    console.log('[capture] saved testing-types-pyramid.png');
  }

  // 55. Type-card grid focused.
  const ttGrid = ttPage.getByTestId('types-grid');
  if (await ttGrid.count()) {
    await ttGrid.scrollIntoViewIfNeeded();
    await ttGrid.screenshot({ path: shot('testing-types-grid') });
    console.log('[capture] saved testing-types-grid.png');
  }

  // 56. A single type card (unit testing).
  const ttCard = ttPage.getByTestId('type-card-unit');
  if (await ttCard.count()) {
    await ttCard.scrollIntoViewIfNeeded();
    await ttCard.screenshot({ path: shot('testing-types-card') });
    console.log('[capture] saved testing-types-card.png');
  }
  await ttPage.close();

  // ---- Deck #17: Test Pyramid (PyramidAdjusterExplorer) ----

  const pyaPage = await ctx.newPage();
  await pyaPage.goto(URL, { waitUntil: 'networkidle' });
  await pyaPage.getByTestId('nav-btn-types').click();
  await pyaPage.locator('[data-types-tab="adjuster"]').click();
  await pyaPage.getByTestId('pyramid-adjuster').waitFor();
  const pyaExplorer = pyaPage.getByTestId('pyramid-adjuster');

  // 57. Ideal pyramid (default preset).
  await pyaPage.locator('[data-pya-preset="ideal"]').click().catch(() => {});
  await sleep(300);
  await pyaExplorer.screenshot({ path: shot('test-pyramid-ideal') });
  console.log('[capture] saved test-pyramid-ideal.png');

  // 58. Ice-cream-cone anti-pattern.
  await pyaPage.locator('[data-pya-preset="icecream"]').click().catch(() => {});
  await sleep(300);
  await pyaExplorer.screenshot({ path: shot('test-pyramid-icecream') });
  console.log('[capture] saved test-pyramid-icecream.png');

  // 59. Trait bars focused (with the ice-cream preset still active).
  const pyaTraits = pyaPage.getByTestId('pya-traits');
  if (await pyaTraits.count()) {
    await pyaTraits.scrollIntoViewIfNeeded();
    await pyaTraits.screenshot({ path: shot('test-pyramid-traits') });
    console.log('[capture] saved test-pyramid-traits.png');
  }
  await pyaPage.close();

  // ---- Deck #18: Code Coverage (CodeCoverageExplorer) ----

  const ccPage = await ctx.newPage();
  await ccPage.goto(URL, { waitUntil: 'networkidle' });
  await ccPage.getByTestId('nav-btn-codecov').click();
  await ccPage.getByTestId('codecov-explorer').waitFor();
  const ccExplorer = ccPage.getByTestId('codecov-explorer');

  // 60. Overview — absVal preset (default).
  await sleep(300);
  await ccExplorer.screenshot({ path: shot('codecov-overview') });
  console.log('[capture] saved codecov-overview.png');

  // 61. Discount preset — a two-clause predicate (richer condition coverage).
  await ccPage.getByTestId('codecov-preset-discount').click().catch(() => {});
  await sleep(400);
  await ccExplorer.screenshot({ path: shot('codecov-discount') });
  console.log('[capture] saved codecov-discount.png');

  // 62. Coverage bars focused (stmt / branch / cond / mcdc).
  const ccBranch = ccPage.getByTestId('codecov-bar-branch');
  if (await ccBranch.count()) {
    const ccBars = ccBranch.locator('xpath=..');
    await ccBranch.scrollIntoViewIfNeeded();
    await ccBars.screenshot({ path: shot('codecov-bars') });
    console.log('[capture] saved codecov-bars.png');
  }

  // 63. Code view focused — line-by-line coverage marking.
  const ccCode = ccPage.getByTestId('codecov-code-view');
  if (await ccCode.count()) {
    await ccCode.scrollIntoViewIfNeeded();
    await ccCode.screenshot({ path: shot('codecov-code') });
    console.log('[capture] saved codecov-code.png');
  }
  await ccPage.close();

  // ---- Decks #19–#27: Black-box design explorers ----
  // The blackbox section is tabbed; each explorer is one tab. For every deck
  // we grab an overview shot of the explorer root plus one focused sub-card.

  const blackboxShots = [
    { tab: 'bva',      root: 'bva-explorer',      card: 'bva-table',          names: ['bva-overview', 'bva-table'] },
    { tab: 'ec',       root: 'ec-explorer',       card: 'ec-results',         names: ['ec-overview', 'ec-results'] },
    { tab: 'dt',       root: 'dt-explorer',       card: 'dt-table',           names: ['dt-overview', 'dt-table'] },
    { tab: 'st',       root: 'st-explorer',       card: 'st-diagram',         names: ['st-overview', 'st-diagram'] },
    { tab: 'pairwise', root: 'pairwise-explorer', card: 'pairwise-table',     names: ['pairwise-overview', 'pairwise-table'] },
    { tab: 'ceg',      root: 'ceg-explorer',      card: 'ceg-table',          names: ['ceg-overview', 'ceg-table'] },
    { tab: 'mt',       root: 'mt-explorer',       card: 'mt-results',         names: ['mt-overview', 'mt-results'], pre: 'mt-generate' },
    { tab: 'et',       root: 'et-explorer',       card: 'et-sfdipot-section', names: ['et-overview', 'et-sfdipot'] },
    { tab: 'td',       root: 'td-explorer',       card: 'td-result',          names: ['td-overview', 'td-result'], pre: 'td-run' },
  ];
  for (const s of blackboxShots) {
    const bp = await ctx.newPage();
    await bp.goto(URL, { waitUntil: 'networkidle' });
    await bp.getByTestId('nav-btn-blackbox').click();
    await bp.locator(`[data-blackbox-tab="${s.tab}"]`).click();
    await bp.getByTestId(s.root).waitFor();
    await sleep(400);
    await bp.getByTestId(s.root).screenshot({ path: shot(s.names[0]) });
    console.log(`[capture] saved ${s.names[0]}.png`);
    if (s.pre) {
      await bp.getByTestId(s.pre).click().catch(() => {});
      await sleep(600);
    }
    const card = bp.getByTestId(s.card);
    if (await card.count()) {
      await card.scrollIntoViewIfNeeded();
      await card.screenshot({ path: shot(s.names[1]) });
      console.log(`[capture] saved ${s.names[1]}.png`);
    } else {
      await bp.getByTestId(s.root).screenshot({ path: shot(s.names[1]) });
      console.log(`[capture] saved ${s.names[1]}.png (root fallback)`);
    }
    await bp.close();
  }

  // ---- Decks #28–#31: Wave C — coverage & execution explorers ----
  // Each lives in its own (untabbed) section.

  const waveCShots = [
    { sect: 'groupth', root: 'gth-explorer',     card: 'gth-cov-table',      names: ['gth-overview', 'gth-cov-table'], tabClick: '[data-tab="covarray"]' },
    { sect: 'pbt',     root: 'pbt-explorer',     card: 'pbt-distribution',   names: ['pbt-overview', 'pbt-distribution'], pre: 'pbt-run-btn' },
    { sect: 'inttest', root: 'inttest-explorer', card: 'inttest-svg-wrap',   names: ['inttest-overview', 'inttest-diagram'] },
    { sect: 'rbt',     root: 'rbt-explorer',     card: 'rbt-heatmap',        names: ['rbt-overview', 'rbt-heatmap'] },
  ];
  for (const s of waveCShots) {
    const wp = await ctx.newPage();
    await wp.goto(URL, { waitUntil: 'networkidle' });
    await wp.getByTestId(`nav-btn-${s.sect}`).click();
    await wp.getByTestId(s.root).waitFor();
    await sleep(400);
    await wp.getByTestId(s.root).screenshot({ path: shot(s.names[0]) });
    console.log(`[capture] saved ${s.names[0]}.png`);
    if (s.tabClick) {
      await wp.locator(s.tabClick).click().catch(() => {});
      await sleep(500);
    }
    if (s.pre) {
      await wp.getByTestId(s.pre).click().catch(() => {});
      await sleep(700);
    }
    const card = wp.getByTestId(s.card);
    if (await card.count()) {
      await card.scrollIntoViewIfNeeded();
      await card.screenshot({ path: shot(s.names[1]) });
      console.log(`[capture] saved ${s.names[1]}.png`);
    } else {
      await wp.getByTestId(s.root).screenshot({ path: shot(s.names[1]) });
      console.log(`[capture] saved ${s.names[1]}.png (root fallback)`);
    }
    await wp.close();
  }

  // ---- Decks #32–#37: Wave D — advanced / AI-assisted explorers ----
  // The advanced section is tabbed; each explorer is one leaf tab. These
  // components have no root testid, so the overview shot uses the panel div.

  const waveDShots = [
    { paper: 'ach',    tab: 'equivmutant',   panel: 'equivmutant',   card: 'emx-practice',    names: ['emx-overview', 'emx-practice'] },
    { paper: 'ach',    tab: 'mutationscore', panel: 'mutationscore', card: 'msx-dashboard',   names: ['msx-overview', 'msx-dashboard'] },
    { paper: 'ach',    tab: 'llmpipeline',   panel: 'llmpipeline',   card: 'llmp-detail',     names: ['llmp-overview', 'llmp-detail'] },
    { paper: 'ach',    tab: 'testquality',   panel: 'testquality',   card: 'tqx-dims',        names: ['tqx-overview', 'tqx-dims'] },
    { paper: 'ach',    tab: 'faultdirected', panel: 'faultdirected', card: 'fdx-issue',       names: ['fdx-overview', 'fdx-issue'] },
    { paper: 'sailor', tab: 'sailor',        panel: 'sailor',        card: 'sailor-pipeline', names: ['sailor-overview', 'sailor-pipeline'] },
  ];
  for (const s of waveDShots) {
    const wp = await ctx.newPage();
    await wp.goto(URL, { waitUntil: 'networkidle' });
    await wp.getByTestId('nav-btn-advanced').click();
    await wp.locator(`[data-advanced-paper="${s.paper}"]`).click().catch(() => {});
    await sleep(200);
    await wp.locator(`[data-advanced-tab="${s.tab}"]`).click();
    const panel = wp.locator(`[data-advanced-panel="${s.panel}"]`);
    await panel.waitFor();
    await sleep(500);
    await panel.screenshot({ path: shot(s.names[0]) });
    console.log(`[capture] saved ${s.names[0]}.png`);
    const card = wp.getByTestId(s.card);
    if (await card.count()) {
      await card.scrollIntoViewIfNeeded();
      await card.screenshot({ path: shot(s.names[1]) });
      console.log(`[capture] saved ${s.names[1]}.png`);
    } else {
      await panel.screenshot({ path: shot(s.names[1]) });
      console.log(`[capture] saved ${s.names[1]}.png (panel fallback)`);
    }
    await wp.close();
  }

  // ---- Decks #38–#45: Wave E — acceptance / E2E explorers ----
  // The acceptance section is tabbed; the overview shot uses the panel div.

  const waveEShots = [
    { tab: 'gherkin',    card: 'bdd-feature-pane', names: ['bdd-overview', 'bdd-feature'] },
    { tab: 'usecase',    card: 'uc-cases',         names: ['uc-overview', 'uc-cases'] },
    { tab: 'e2ejourney', card: 'e2e-journey',      names: ['e2e-overview', 'e2e-journey'] },
    { tab: 'contract',   card: 'ct-matrix',        names: ['ct-overview', 'ct-matrix'] },
    { tab: 'perfload',   card: 'plp-dashboard',    names: ['plp-overview', 'plp-dashboard'] },
    { tab: 'chaos',      card: 'chx-graph',        names: ['chx-overview', 'chx-graph'] },
    { tab: 'atdd',       card: 'atdd-cycle',       names: ['atdd-overview', 'atdd-cycle'] },
    { tab: 'flaky',      card: 'flx-taxonomy',     names: ['flx-overview', 'flx-taxonomy'] },
  ];
  for (const s of waveEShots) {
    const wp = await ctx.newPage();
    await wp.goto(URL, { waitUntil: 'networkidle' });
    await wp.getByTestId('nav-btn-acceptance').click();
    await wp.locator(`[data-acceptance-tab="${s.tab}"]`).click();
    const panel = wp.locator(`[data-acceptance-panel="${s.tab}"]`);
    await panel.waitFor();
    await sleep(500);
    await panel.screenshot({ path: shot(s.names[0]) });
    console.log(`[capture] saved ${s.names[0]}.png`);
    const card = wp.getByTestId(s.card);
    if (await card.count()) {
      await card.scrollIntoViewIfNeeded();
      await card.screenshot({ path: shot(s.names[1]) });
      console.log(`[capture] saved ${s.names[1]}.png`);
    } else {
      await panel.screenshot({ path: shot(s.names[1]) });
      console.log(`[capture] saved ${s.names[1]}.png (panel fallback)`);
    }
    await wp.close();
  }

  // ---- Decks #46–#51: Wave F — model-based testing explorers ----
  // The mbt section is tabbed; the overview shot uses the panel div.

  const waveFShots = [
    { tab: 'workflow', card: 'mbtw-pipeline',  names: ['mbtw-overview', 'mbtw-pipeline'] },
    { tab: 'fsmgen',   card: 'fsmgen-model',   names: ['fsmgen-overview', 'fsmgen-model'] },
    { tab: 'wmethod',  card: 'wmethod-fsm',    names: ['wmethod-overview', 'wmethod-fsm'] },
    { tab: 'efsm',     card: 'efsm-model',     names: ['efsm-overview', 'efsm-model'] },
    { tab: 'usage',    card: 'usage-model',    names: ['usage-overview', 'usage-model'] },
    { tab: 'modelmut', card: 'modelmut-model', names: ['modelmut-overview', 'modelmut-model'] },
  ];
  for (const s of waveFShots) {
    const wp = await ctx.newPage();
    await wp.goto(URL, { waitUntil: 'networkidle' });
    await wp.getByTestId('nav-btn-mbt').click();
    await wp.locator(`[data-mbt-tab="${s.tab}"]`).click();
    const panel = wp.locator(`[data-mbt-panel="${s.tab}"]`);
    await panel.waitFor();
    await sleep(500);
    await panel.screenshot({ path: shot(s.names[0]) });
    console.log(`[capture] saved ${s.names[0]}.png`);
    const card = wp.getByTestId(s.card);
    if (await card.count()) {
      await card.scrollIntoViewIfNeeded();
      await card.screenshot({ path: shot(s.names[1]) });
      console.log(`[capture] saved ${s.names[1]}.png`);
    } else {
      await panel.screenshot({ path: shot(s.names[1]) });
      console.log(`[capture] saved ${s.names[1]}.png (panel fallback)`);
    }
    await wp.close();
  }

  // ---- Decks #52–#57: Wave G — agile testing explorers ----
  // The agile section is tabbed; the overview shot uses the panel div.

  const waveGShots = [
    { tab: 'quadrants',  card: 'agq-grid',          names: ['agq-overview', 'agq-grid'] },
    { tab: 'cadence',    card: 'cadence-timeline',  names: ['cadence-overview', 'cadence-timeline'] },
    { tab: 'gates',      card: 'gate-summary',      names: ['gate-overview', 'gate-summary'] },
    { tab: 'examplemap', card: 'emap-map',          names: ['emap-overview', 'emap-map'] },
    { tab: 'pipeline',   card: 'ctp-pipeline',      names: ['ctp-overview', 'ctp-pipeline'] },
    { tab: 'regression', card: 'rdebt-chart',       names: ['rdebt-overview', 'rdebt-chart'] },
  ];
  for (const s of waveGShots) {
    const wp = await ctx.newPage();
    await wp.goto(URL, { waitUntil: 'networkidle' });
    await wp.getByTestId('nav-btn-agile').click();
    await wp.locator(`[data-agile-tab="${s.tab}"]`).click();
    const panel = wp.locator(`[data-agile-panel="${s.tab}"]`);
    await panel.waitFor();
    await sleep(500);
    await panel.screenshot({ path: shot(s.names[0]) });
    console.log(`[capture] saved ${s.names[0]}.png`);
    const card = wp.getByTestId(s.card);
    if (await card.count()) {
      await card.scrollIntoViewIfNeeded();
      await card.screenshot({ path: shot(s.names[1]) });
      console.log(`[capture] saved ${s.names[1]}.png`);
    } else {
      await panel.screenshot({ path: shot(s.names[1]) });
      console.log(`[capture] saved ${s.names[1]}.png (panel fallback)`);
    }
    await wp.close();
  }

  await browser.close();
  if (serverChild) {
    serverChild.kill();
    console.log('[capture] stopped http.server');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
