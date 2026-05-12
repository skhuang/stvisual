import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('stvisual.locale', 'zh');
    } catch { /* ignore */ }
  });
});

test.describe('Accessibility navigation', () => {
  test('supports skip link and announces active navigation state', async ({ page }) => {
    await page.goto('/index.html');

    await page.getByRole('link', { name: '跳到主要內容' }).focus();
    await expect(page.getByRole('link', { name: '跳到主要內容' })).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page.locator('#app-main')).toBeFocused();

    await page.getByTestId('nav-btn-logic').click();
    await expect(page.getByTestId('section-logic')).toBeFocused();
    await expect(page.getByTestId('nav-btn-logic')).toHaveAttribute('aria-current', 'page');
    await expect(page.getByTestId('nav-btn-graph')).toHaveAttribute('aria-current', 'false');
  });

  test('keeps keyboard focus inside the cloud drawer and restores it on close', async ({ page }) => {
    await page.goto('/index.html');

    await page.getByTestId('app-cloud-link').click();
    const drawer = page.getByTestId('cloud-settings-drawer');
    await expect(drawer).toBeVisible();
    await expect(page.locator('.cloud-drawer__panel')).toBeFocused();

    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press('Tab');
      await expect.poll(async () => page.evaluate(() => (
        document.activeElement?.closest('[data-testid="cloud-settings-drawer"]') !== null
      ))).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(page.getByTestId('app-cloud-link')).toBeFocused();
  });
});
