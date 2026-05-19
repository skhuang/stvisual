import { describe, expect, it, beforeEach } from 'vitest';
import { createTddRulesExplorer } from '../components/TddRulesExplorer.js';

describe('TddRulesExplorer', () => {
  let root;
  beforeEach(() => {
    root = createTddRulesExplorer();
    document.body.appendChild(root);
  });

  it('renders with the root testid and the three action buttons', () => {
    expect(root.dataset.testid).toBe('tdd-rules-explorer');
    expect(root.querySelector('[data-testid="tdd-action-write-failing-test"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="tdd-action-write-production-code"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="tdd-action-refactor"]')).toBeTruthy();
  });

  it('a legal action advances the state panel', () => {
    const before = root.querySelector('[data-testid="tdd-rules-state"]').textContent;
    root.querySelector('[data-testid="tdd-action-write-failing-test"]').click();
    const after = root.querySelector('[data-testid="tdd-rules-state"]').textContent;
    expect(after).not.toEqual(before);
  });

  it('an illegal action shows the blocking reason and does not advance', () => {
    const before = root.querySelector('[data-testid="tdd-rules-state"]').textContent;
    // production code with no failing test is illegal from the start
    root.querySelector('[data-testid="tdd-action-write-production-code"]').click();
    expect(root.querySelector('[data-testid="tdd-rules-feedback"]').textContent.trim())
      .not.toBe('');
    expect(root.querySelector('[data-testid="tdd-rules-state"]').textContent)
      .toEqual(before);
  });

  it('reset returns to the start state', () => {
    root.querySelector('[data-testid="tdd-action-write-failing-test"]').click();
    root.querySelector('[data-testid="tdd-rules-reset"]').click();
    root.querySelector('[data-testid="tdd-action-write-production-code"]').click();
    // after reset, production code is illegal again -> feedback shown
    expect(root.querySelector('[data-testid="tdd-rules-feedback"]').textContent.trim())
      .not.toBe('');
  });
});
