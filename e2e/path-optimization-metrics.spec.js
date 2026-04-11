import { expect, test } from '@playwright/test';

test.describe('Path Optimization Metrics', () => {
  test('shows before and after path counts', async ({ page }) => {
    await page.goto('/index.html');

    await expect(page.getByTestId('test-path-metrics')).toBeVisible();

    const baseline = Number(await page.getByTestId('baseline-path-count').textContent());
    const optimized = Number(await page.getByTestId('optimized-path-count').textContent());
    const saved = Number(await page.getByTestId('saved-path-count').textContent());

    expect(baseline).toBeGreaterThan(0);
    expect(optimized).toBeGreaterThan(0);
    expect(optimized).toBeLessThanOrEqual(baseline);
    expect(saved).toBe(baseline - optimized);
  });
});