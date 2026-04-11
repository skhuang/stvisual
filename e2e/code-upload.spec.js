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

  test('keeps mapping correct when switching requirements on complex control flow', async ({ page }) => {
    await page.goto('/index.html');

    await page.getByTestId('program-language-select').selectOption('javascript');
    await page.getByTestId('code-upload-input').setInputFiles({
      name: 'complex-flow.js',
      mimeType: 'application/javascript',
      buffer: Buffer.from(`function analyze(items, mode) {
  switch (mode) {
    case 'scan':
      for (const item of items) {
        while (item.active) {
          if (item.skip) {
            continue;
          }
          if (item.stop) {
            break;
          }
          return item.id;
        }
      }
      break;
    default:
      return 'none';
  }
  return 'done';
}`),
    });

    await expect(page.getByTestId('graph-source-status')).toContainText('已根據 complex-flow.js 自動產生簡化 CFG。');
    await expect(page.getByTestId('program-source-code')).toContainText("case 'scan'");

    await page.getByRole('button', { name: /case 'scan'/i }).click();
    await expect(page.getByTestId('detail-source-mapping')).toContainText('L3');
    await expect(page.getByTestId('program-source-line-3')).toHaveClass(/graph-source-line--active/);

    await page.getByTestId('requirement-list').locator('button', { hasText: 'continue' }).first().click();
    await expect(page.getByTestId('detail-source-mapping')).toContainText('L7');
    await expect(page.getByTestId('program-source-line-7')).toHaveClass(/graph-source-line--active/);
    await expect(page.getByTestId('program-source-line-3')).not.toHaveClass(/graph-source-line--active/);

    await page.getByTestId('requirement-list').locator('button', { hasText: 'break' }).first().click();
    await expect(page.getByTestId('detail-source-mapping')).toContainText('L10');
    await expect(page.getByTestId('program-source-line-10')).toHaveClass(/graph-source-line--active/);
  });
});