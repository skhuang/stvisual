import { expect, test } from '@playwright/test';

test.describe('Logic Coverage Explorer', () => {
  test('default predicate renders truth table with 8 rows', async ({ page }) => {
    await page.goto('/index.html');

    const explorer = page.getByTestId('logic-coverage');
    await expect(explorer).toBeVisible();

    const truthRows = explorer.getByTestId('logic-truth-table').locator('tbody tr');
    await expect(truthRows).toHaveCount(8);
  });

  test('Implicant Coverage tab shows K-maps with columns=ab, rows=c', async ({ page }) => {
    await page.goto('/index.html');

    await page.getByTestId('logic-criterion-ic').click();

    const fMap = page.getByTestId('logic-kmap-f');
    const negMap = page.getByTestId('logic-kmap-not-f');
    await expect(fMap).toBeVisible();
    await expect(negMap).toBeVisible();

    const headerCells = fMap.locator('thead th').allInnerTexts();
    const headers = (await headerCells).map((s) => s.trim());
    // First cell is the corner label; the rest are the column headers.
    expect(headers.slice(1)).toEqual(['00', '01', '11', '10']);

    // 2 body rows since rows=c (Gray code 0,1).
    await expect(fMap.locator('tbody tr')).toHaveCount(2);

    // Highlighted (value=1) cells for (a&&b)||c are minterms 1,3,5,6,7.
    const onCells = fMap.locator('td.logic-kmap-on');
    const titles = await onCells.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute('title')),
    );
    expect(titles.sort()).toEqual(['m1', 'm3', 'm5', 'm6', 'm7']);
  });

  test('switching to a 4-clause predicate yields a 4x4 K-map', async ({ page }) => {
    await page.goto('/index.html');

    await page.getByTestId('logic-example-four-clause').click();
    await page.getByTestId('logic-criterion-ic').click();

    const fMap = page.getByTestId('logic-kmap-f');
    await expect(fMap).toBeVisible();
    await expect(fMap.locator('tbody tr')).toHaveCount(4);
    await expect(fMap.locator('tbody tr').first().locator('td')).toHaveCount(4);
  });
});
