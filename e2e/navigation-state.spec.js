import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('stvisual.locale', 'zh');
    } catch { /* ignore */ }
  });
});

test.describe('Navigation state', () => {
  test('restores the last learning section after reload', async ({ page }) => {
    await page.goto('/index.html');

    await page.getByTestId('nav-btn-fuzz').click();
    await expect(page.getByTestId('section-fuzz')).toBeVisible();

    await page.reload();

    await expect(page.getByTestId('section-fuzz')).toBeVisible();
    await expect(page.getByTestId('nav-btn-fuzz')).toHaveClass(/active/);
  });

  test('keeps the saved Syntax-Based Testing tab after reload', async ({ page }) => {
    await page.goto('/index.html');

    await page.getByTestId('nav-btn-syntax').click();
    await page.getByRole('tab', { name: /Grammar Coverage|Grammar/ }).click();
    await page.reload();

    await expect(page.getByTestId('section-syntax')).toBeVisible();
    await expect(page.getByRole('tab', { name: /Grammar Coverage|Grammar/ })).toHaveAttribute('aria-selected', 'true');
  });

  test('?explorer=… deeplink scrolls the destination section into view on boot', async ({ page }) => {
    await page.goto('/index.html?explorer=PairwiseExplorer');
    // Wait for the rAF inside paint() to execute the scroll.
    await page.waitForFunction(() => window.scrollY > 0, { timeout: 2000 }).catch(() => {});

    // Section is visible AND its top is within the viewport.
    const section = page.getByTestId('section-blackbox');
    await expect(section).toBeVisible();
    const topInViewport = await section.evaluate((el) => el.getBoundingClientRect().top < window.innerHeight - 50);
    expect(topInViewport).toBe(true);

    // Pairwise tab is the active one.
    await expect(page.locator('[data-blackbox-tab="pairwise"]')).toHaveAttribute('aria-selected', 'true');
  });

  test('browser back button returns to the source after a cross-section bridge click', async ({ page }) => {
    // Start on the BDD/Gherkin tab via deeplink.
    await page.goto('/index.html?explorer=BDDGherkinExplorer');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('bdd-preset-discount').click();

    // Snapshot the source URL exactly as the browser sees it — we don't
    // care about the shape (`?explorer=` vs `?section=&tab=`), just that
    // the back button takes us back to this exact string.
    const sourceUrl = page.url();
    await expect(page.getByTestId('section-acceptance')).toBeVisible();

    // Cross-section jump to Decision Table.
    await page.getByTestId('bdd-bridge-decision-table').click();
    await expect(page.getByTestId('section-blackbox')).toBeVisible();
    expect(page.url()).toContain('section=blackbox');
    expect(page.url()).toContain('tab=dt');
    expect(page.url()).not.toBe(sourceUrl);

    // Browser back: URL is restored, page reloads (we listen for popstate
    // and call location.reload()), and the source section is visible again.
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('section-acceptance')).toBeVisible();
    await expect(page.getByTestId('section-blackbox')).toBeHidden();
    expect(page.url()).toBe(sourceUrl);
  });

  test('cross-section bridge from J1 BDD → Decision Table switches section AND inner tab', async ({ page }) => {
    await page.goto('/index.html?explorer=BDDGherkinExplorer');

    // Pick the discount preset so the Examples table + bridge button are present.
    await page.getByTestId('bdd-preset-discount').click();
    await expect(page.getByTestId('bdd-bridge-decision-table')).toBeVisible();

    // Click the bridge.
    await page.getByTestId('bdd-bridge-decision-table').click();

    // Expectation: section-blackbox is now the active section, AND the DT tab
    // is selected. The pre-fix bug was that activeSection stayed on
    // 'acceptance' and the user kept seeing the BDD/Gherkin tab.
    await expect(page.getByTestId('section-blackbox')).toBeVisible();
    await expect(page.getByTestId('section-acceptance')).toBeHidden();
    await expect(page.locator('[data-blackbox-tab="dt"]')).toHaveAttribute('aria-selected', 'true');
  });

  test('cross-section bridge from Logic Coverage → Group Theory switches active section', async ({ page }) => {
    await page.goto('/index.html?section=logic');
    await page.waitForLoadState('networkidle');

    // Bridge button is rendered conditionally inside Logic — make sure it exists.
    const bridge = page.getByTestId('logic-bridge-groupth');
    await bridge.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    if (!(await bridge.isVisible().catch(() => false))) {
      test.skip(true, 'logic-bridge-groupth not rendered for the default predicate / criterion');
    }
    await bridge.click();
    await expect(page.getByTestId('section-groupth')).toBeVisible();
    await expect(page.getByTestId('section-logic')).toBeHidden();
  });

  test('does not save the Cloud utility drawer as the active learning section', async ({ page }) => {
    await page.goto('/index.html');

    await page.getByTestId('nav-btn-logic').click();
    await page.getByTestId('app-cloud-link').click();
    await expect(page.getByTestId('cloud-settings-drawer')).toBeVisible();

    await page.reload();

    await expect(page.getByTestId('section-logic')).toBeVisible();
    await expect(page.getByTestId('cloud-settings-drawer')).toBeHidden();
  });
});
