import { describe, expect, it } from 'vitest';
import { createDecisionTableExplorer } from '../components/DecisionTableExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createDecisionTableExplorer();
  document.body.appendChild(el);
  return el;
}

describe('DecisionTableExplorer smoke', () => {
  it('renders root element with correct testid', () => {
    mount();
    expect(document.querySelector('[data-testid="dt-explorer"]')).toBeInTheDocument();
  });

  it('renders example buttons', () => {
    mount();
    expect(document.querySelector('[data-testid="dt-examples"]')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-testid^="dt-example-"]').length).toBeGreaterThan(0);
  });

  it('renders decision table with rules', () => {
    mount();
    expect(document.querySelector('[data-testid="dt-table"]')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-testid^="dt-row-"]').length).toBeGreaterThan(0);
  });

  it('renders condition and action inputs', () => {
    mount();
    expect(document.querySelector('[data-testid="dt-cond-name-0"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="dt-act-name-0"]')).toBeInTheDocument();
  });

  it('clicking an example loads it without throwing', () => {
    mount();
    const btn = document.querySelector('[data-testid^="dt-example-"]');
    expect(() => btn.click()).not.toThrow();
    expect(document.querySelector('[data-testid="dt-table"]')).toBeInTheDocument();
  });

  it('add rule button appends a new row', () => {
    mount();
    const before = document.querySelectorAll('[data-testid^="dt-row-"]').length;
    document.querySelector('[data-testid="dt-add-rule"]').click();
    const after = document.querySelectorAll('[data-testid^="dt-row-"]').length;
    expect(after).toBe(before + 1);
  });

  it('add condition button appends a new condition', () => {
    mount();
    const before = document.querySelectorAll('[data-testid^="dt-cond-name-"]').length;
    document.querySelector('[data-testid="dt-add-cond"]').click();
    const after = document.querySelectorAll('[data-testid^="dt-cond-name-"]').length;
    expect(after).toBe(before + 1);
  });

  it('shows coverage badge', () => {
    mount();
    expect(document.querySelector('[data-testid="dt-coverage"]')).toBeInTheDocument();
  });
});
