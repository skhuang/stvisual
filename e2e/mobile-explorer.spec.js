import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('stvisual.locale', 'zh');
    } catch { /* ignore */ }
  });
});

test.describe('Mobile explorer navigation', () => {
  test('shows a sticky subnav for long explorers on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/index.html');

    await page.getByTestId('app-section-select').selectOption('fuzz');
    await expect(page.getByTestId('section-fuzz')).toBeVisible();

    const mobileNav = page.getByTestId('fuzz-mobile-nav');
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: '輸入' })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: '控制流程圖' })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: '結果' })).toBeVisible();

    await mobileNav.getByRole('link', { name: '結果' }).click();
    await expect(page.locator('#fuzz-results-panel')).toBeInViewport();
    await expect.poll(async () => page.evaluate(() => document.body.scrollWidth > innerWidth)).toBe(false);
  });

  test('keeps explorer subnav hidden on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/index.html');

    await page.getByTestId('nav-btn-fuzz').click();
    await expect(page.getByTestId('section-fuzz')).toBeVisible();
    await expect(page.getByTestId('fuzz-mobile-nav')).toBeHidden();
  });
});
