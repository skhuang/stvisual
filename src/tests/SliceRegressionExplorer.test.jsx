import { describe, expect, it, beforeEach } from 'vitest';
import { createSliceRegressionExplorer } from '../components/SliceRegressionExplorer.js';

describe('SliceRegressionExplorer', () => {
  let root;
  beforeEach(() => {
    root = createSliceRegressionExplorer();
    document.body.appendChild(root);
  });

  it('renders with the root testid and example chips', () => {
    expect(root.dataset.testid).toBe('slice-regression-explorer');
    expect(root.querySelector('[data-testid="regression-example-classify"]')).toBeTruthy();
  });

  it('has a static/dynamic mode toggle and a test-suite panel', () => {
    expect(root.querySelector('[data-testid="regression-mode-static"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="regression-mode-dynamic"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="regression-tests"]')).toBeTruthy();
  });

  it('picking an edit then switching to dynamic mode moves a test to safe', () => {
    root.querySelector('[data-testid="regression-example-classify"]').click();
    // mark s3 (`sign = 0`) as the edited statement — dead w.r.t. the `label` output
    root.querySelector('[data-stmt="s3"]').click();
    // static: every classify trace executes s3 → all must re-run
    root.querySelector('[data-testid="regression-mode-static"]').click();
    const staticText = root.querySelector('[data-testid="regression-metric"]').textContent;
    // dynamic: sign never reaches label → nothing must re-run
    root.querySelector('[data-testid="regression-mode-dynamic"]').click();
    const dynamicText = root.querySelector('[data-testid="regression-metric"]').textContent;
    expect(staticText).not.toEqual(dynamicText);
  });
});
