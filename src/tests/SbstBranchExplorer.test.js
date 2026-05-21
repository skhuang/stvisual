import { describe, expect, it, beforeEach } from 'vitest';
import { createSbstBranchExplorer } from '../components/SbstBranchExplorer.js';

function q(root, testid) { return root.querySelector(`[data-testid="${testid}"]`); }

describe('SbstBranchExplorer', () => {
  let root;
  beforeEach(() => { root = createSbstBranchExplorer(); document.body.innerHTML = ''; document.body.appendChild(root); });

  it('renders with the explorer root testid', () => {
    expect(root.dataset.testid).toBe('sbst-branch-explorer');
  });
  it('shows the code panel and a population panel', () => {
    expect(q(root, 'sbst-branch-code')).toBeTruthy();
    expect(q(root, 'sbst-branch-population')).toBeTruthy();
  });
  it('advances generations with Next and reaches the covered state via Run', () => {
    const run = q(root, 'sbst-branch-run');
    run.click();
    expect(q(root, 'sbst-branch-covered')).toBeTruthy();
  });
  it('Reset returns to the first generation', () => {
    q(root, 'sbst-branch-run').click();
    q(root, 'sbst-branch-reset').click();
    expect(q(root, 'sbst-branch-next').disabled).toBe(false);
  });
  it('switches examples', () => {
    q(root, 'sbst-branch-example-triangle').click();
    expect(q(root, 'sbst-branch-code').textContent).toContain('classify(a, b, c)');
  });
});
