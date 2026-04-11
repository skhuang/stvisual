import { expect, test } from '@playwright/test';

test.describe('Code Upload to CFG', () => {
  test('uploads source code, generates CFG, and shows source mapping', async ({ page }) => {
    await page.goto('/index.html');

    await page.getByTestId('program-language-select').selectOption('javascript');
    await page.getByTestId('code-upload-input').setInputFiles({
      name: 'calendar.js',
      mimeType: 'application/javascript',
      buffer: Buffer.from(`function daysInMonth(month, leapYear) {
  switch (month) {
    case 2:
      if (leapYear) {
        return 29;
      }
      break;
    default:
      return 31;
  }
}`),
    });

    await expect(page.getByTestId('graph-source-status')).toContainText('已根據 calendar.js 自動產生簡化 CFG。');
    await expect(page.getByTestId('program-source-code')).toContainText('switch (month)');

    await page.locator('[data-requirement-id]').nth(1).click();

    await expect(page.getByTestId('program-source-line-2')).toHaveClass(/graph-source-line--active/);
    await expect(page.getByTestId('detail-source-mapping')).toContainText('L2');

    const requirementCount = await page.getByTestId('requirement-list').locator('li').count();
    expect(requirementCount).toBeGreaterThan(3);
  });
});