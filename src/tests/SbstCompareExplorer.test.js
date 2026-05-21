import { describe, expect, it, beforeEach } from 'vitest';
import { createSbstCompareExplorer } from '../components/SbstCompareExplorer.js';

function q(root, testid) { return root.querySelector(`[data-testid="${testid}"]`); }

describe('SbstCompareExplorer', () => {
  let root;
  beforeEach(() => { root = createSbstCompareExplorer(); document.body.innerHTML = ''; document.body.appendChild(root); });

  it('renders with the explorer root testid', () => {
    expect(root.dataset.testid).toBe('sbst-compare-explorer');
  });
  it('shows all three strategy panels and the chart', () => {
    expect(q(root, 'sbst-compare-random')).toBeTruthy();
    expect(q(root, 'sbst-compare-hillclimb')).toBeTruthy();
    expect(q(root, 'sbst-compare-genetic')).toBeTruthy();
    expect(q(root, 'sbst-compare-chart')).toBeTruthy();
  });
  it('shows a takeaway and switches examples', () => {
    expect(q(root, 'sbst-compare-takeaway')).toBeTruthy();
    q(root, 'sbst-compare-example-multimodal').click();
    expect(q(root, 'sbst-compare-genetic')).toBeTruthy();
  });
});
