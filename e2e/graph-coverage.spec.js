import { expect, test } from '@playwright/test';

test.describe('Graph Coverage Browser Tests', () => {
  test('supports advanced criteria and generated test paths', async ({ page }) => {
    await page.goto('/index.html');

    await page.getByTestId('criterion-edge-pair').click();
    await expect(page.getByTestId('requirement-list')).toContainText('S -> A -> B');

    await page.getByTestId('criterion-complete-path').click();
    await expect(page.getByTestId('requirement-list')).toContainText('S -> A -> B -> D -> E -> T');

    await expect(page.getByTestId('graph-test-path-card')).toBeVisible();
    await expect(page.getByTestId('test-path-list')).toContainText('T1:');
    await expect(page.getByTestId('test-path-meta')).toContainText('Covered Requirements:');
  });

  test('recomputes requirements and test paths after graph editing', async ({ page }) => {
    await page.goto('/index.html');

    await page.getByTestId('graph-nodes-input').fill([
      'S,Start,80,170',
      'A,A,220,170',
      'T,End,360,170',
    ].join('\n'));

    await page.getByTestId('graph-edges-input').fill([
      'S-A,S,A',
      'A-T,A,T',
    ].join('\n'));

    await page.getByTestId('graph-start-input').fill('S');
    await page.getByTestId('graph-end-input').fill('T');

    await expect(page.getByTestId('graph-editor-status')).toContainText('Graph 已同步更新');
    await expect(page.getByTestId('requirement-list').locator('li')).toHaveCount(3);
    await expect(page.getByTestId('test-path-list')).toContainText('S -> A -> T');
    await expect(page.getByTestId('test-path-meta')).toContainText('Covered Requirements: 3 / 3');
  });
});
