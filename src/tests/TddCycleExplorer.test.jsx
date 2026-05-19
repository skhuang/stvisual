import { describe, expect, it, beforeEach } from 'vitest';
import { createTddCycleExplorer } from '../components/TddCycleExplorer.js';

describe('TddCycleExplorer', () => {
  let root;
  beforeEach(() => {
    root = createTddCycleExplorer();
    document.body.appendChild(root);
  });

  it('renders with the root testid and kata chips', () => {
    expect(root.dataset.testid).toBe('tdd-cycle-explorer');
    expect(root.querySelector('[data-testid="tdd-kata-fizzbuzz"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="tdd-kata-stack"]')).toBeTruthy();
  });

  it('shows the test list, code and suite panels', () => {
    expect(root.querySelector('[data-testid="tdd-test-list"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="tdd-code"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="tdd-suite"]')).toBeTruthy();
  });

  it('advancing a step changes the suite panel', () => {
    root.querySelector('[data-testid="tdd-kata-fizzbuzz"]').click();
    const before = root.querySelector('[data-testid="tdd-suite"]').textContent;
    root.querySelector('[data-testid="tdd-next-step"]').click();
    const after = root.querySelector('[data-testid="tdd-suite"]').textContent;
    expect(after).not.toEqual(before);
  });

  it('predict mode reveals a correct/incorrect marker after a guess', () => {
    root.querySelector('[data-testid="tdd-kata-fizzbuzz"]').click();
    // predict mode is on by default; step 1 is red, step 2 is green
    root.querySelector('[data-testid="tdd-predict-green"]').click();
    root.querySelector('[data-testid="tdd-next-step"]').click();
    expect(root.querySelector('[data-testid="tdd-predict-result"]')).toBeTruthy();
  });
});
