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

  // Issue 2 fix: turn predict mode OFF before clicking Next so the button is enabled
  it('advancing a step changes the suite panel', () => {
    root.querySelector('[data-testid="tdd-kata-fizzbuzz"]').click();
    // predict mode is ON by default — turn it OFF so Next is not gated
    root.querySelector('[data-testid="tdd-predict-toggle"]').click();
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

  // Issue 4 — additional tests

  it('reset returns to step 1 after advancing', () => {
    root.querySelector('[data-testid="tdd-kata-fizzbuzz"]').click();
    // Turn predict mode OFF to freely advance
    root.querySelector('[data-testid="tdd-predict-toggle"]').click();
    const step1Suite = root.querySelector('[data-testid="tdd-suite"]').textContent;
    root.querySelector('[data-testid="tdd-next-step"]').click();
    root.querySelector('[data-testid="tdd-next-step"]').click();
    // Confirm we've moved forward
    expect(root.querySelector('[data-testid="tdd-suite"]').textContent).not.toEqual(step1Suite);
    // Now reset
    root.querySelector('[data-testid="tdd-reset"]').click();
    expect(root.querySelector('[data-testid="tdd-suite"]').textContent).toEqual(step1Suite);
  });

  it('predict toggle hides and restores predict buttons', () => {
    root.querySelector('[data-testid="tdd-kata-fizzbuzz"]').click();
    // Predict is ON by default — buttons should be present
    expect(root.querySelector('[data-testid="tdd-predict-red"]')).toBeTruthy();
    // Toggle OFF
    root.querySelector('[data-testid="tdd-predict-toggle"]').click();
    expect(root.querySelector('[data-testid="tdd-predict-red"]')).toBeNull();
    // Toggle back ON
    root.querySelector('[data-testid="tdd-predict-toggle"]').click();
    expect(root.querySelector('[data-testid="tdd-predict-red"]')).toBeTruthy();
  });

  it('correct prediction shows correct result, wrong prediction shows incorrect', () => {
    // fizzbuzz step 1→2: red→green
    // Wrong prediction: predict red (step 2 is green, so incorrect)
    const wrongRoot = createTddCycleExplorer();
    wrongRoot.querySelector('[data-testid="tdd-kata-fizzbuzz"]').click();
    wrongRoot.querySelector('[data-testid="tdd-predict-red"]').click();
    wrongRoot.querySelector('[data-testid="tdd-next-step"]').click();
    const wrongResult = wrongRoot.querySelector('[data-testid="tdd-predict-result"]').textContent;

    // Correct prediction: predict green (step 2 is green, so correct)
    const rightRoot = createTddCycleExplorer();
    rightRoot.querySelector('[data-testid="tdd-kata-fizzbuzz"]').click();
    rightRoot.querySelector('[data-testid="tdd-predict-green"]').click();
    rightRoot.querySelector('[data-testid="tdd-next-step"]').click();
    const rightResult = rightRoot.querySelector('[data-testid="tdd-predict-result"]').textContent;

    expect(wrongResult).not.toEqual(rightResult);
  });

  it('phase ring marks the active phase on step 1 (red)', () => {
    root.querySelector('[data-testid="tdd-kata-fizzbuzz"]').click();
    // Step 1 phase is red
    const redNode = root.querySelector('[data-testid="tdd-phase-red"]');
    const greenNode = root.querySelector('[data-testid="tdd-phase-green"]');
    expect(redNode.classList.contains('tdc-phase-node--active')).toBe(true);
    expect(greenNode.classList.contains('tdc-phase-node--active')).toBe(false);
  });
});
