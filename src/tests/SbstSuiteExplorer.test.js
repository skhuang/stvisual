import { describe, expect, it, beforeEach } from 'vitest';
import { createSbstSuiteExplorer } from '../components/SbstSuiteExplorer.js';

function q(root, testid) { return root.querySelector(`[data-testid="${testid}"]`); }

describe('SbstSuiteExplorer', () => {
  let root;
  beforeEach(() => { root = createSbstSuiteExplorer(); document.body.innerHTML = ''; document.body.appendChild(root); });

  it('renders with the explorer root testid', () => {
    expect(root.dataset.testid).toBe('sbst-suite-explorer');
  });
  it('shows the coverage gauge and the test list', () => {
    expect(q(root, 'sbst-suite-coverage')).toBeTruthy();
    expect(q(root, 'sbst-suite-tests')).toBeTruthy();
  });
  it('Run reaches full coverage and shows the minimised suite', () => {
    q(root, 'sbst-suite-run').click();
    expect(q(root, 'sbst-suite-covered')).toBeTruthy();
    expect(q(root, 'sbst-suite-minimised')).toBeTruthy();
  });
  it('Reset returns to the first generation', () => {
    q(root, 'sbst-suite-run').click();
    q(root, 'sbst-suite-reset').click();
    expect(q(root, 'sbst-suite-next').disabled).toBe(false);
  });
});
