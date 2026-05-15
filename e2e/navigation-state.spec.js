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
