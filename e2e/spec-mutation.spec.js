import { expect, test } from '@playwright/test';
import { openSectionFromNav } from './helpers/navigation.js';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('stvisual.locale', 'zh');
      window.localStorage.removeItem('stvisual.specMutation.v1');
    } catch { /* ignore */ }
  });
});

test.describe('Specification Mutation Explorer', () => {
  test('SMV model-checking examples include the cross-coupled latch source', async ({ page }) => {
    await page.goto('/index.html');

    await openSectionFromNav(page, 'syntax');
    await page.locator('[data-syntax-tab="spec"]').click();
    await page.locator('[data-spec-category="smv"]').click();
    await page.getByRole('button', { name: 'Cross-coupled latch' }).click();

    await expect(page.getByTestId('spec-text')).toHaveValue('!(x && y)');
    await expect(page.getByTestId('spec-smv-source')).toContainText('MODULE main');
    await expect(page.getByTestId('spec-smv-source')).toContainText('next (x) := case');
    await expect(page.getByTestId('spec-smv-source')).toContainText('INVARSPEC !(x & y)');
  });
});
