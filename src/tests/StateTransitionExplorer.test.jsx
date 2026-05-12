import { describe, expect, it } from 'vitest';
import { createStateTransitionExplorer } from '../components/StateTransitionExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createStateTransitionExplorer();
  document.body.appendChild(el);
  return el;
}

describe('StateTransitionExplorer smoke', () => {
  it('renders root element with correct testid', () => {
    mount();
    expect(document.querySelector('[data-testid="st-explorer"]')).toBeInTheDocument();
  });

  it('renders example buttons', () => {
    mount();
    expect(document.querySelector('[data-testid="st-examples"]')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-testid^="st-example-"]').length).toBeGreaterThan(0);
  });

  it('renders state machine diagram', () => {
    mount();
    expect(document.querySelector('[data-testid="st-diagram"]')).toBeInTheDocument();
  });

  it('renders test table in transition mode', () => {
    mount();
    expect(document.querySelector('[data-testid="st-table"]')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-testid^="st-test-"]').length).toBeGreaterThan(0);
  });

  it('switching to sequence mode rerenders test table', () => {
    mount();
    document.querySelector('[data-testid="st-mode-sequence"]').click();
    expect(document.querySelector('[data-testid="st-table"]')).toBeInTheDocument();
  });

  it('clicking an example loads without throwing', () => {
    mount();
    const btn = document.querySelector('[data-testid^="st-example-"]');
    expect(() => btn.click()).not.toThrow();
    expect(document.querySelector('[data-testid="st-table"]')).toBeInTheDocument();
  });

  it('add state button appends a new state', () => {
    mount();
    const before = document.querySelectorAll('[data-testid^="st-state-"]').length;
    document.querySelector('[data-testid="st-add-state"]').click();
    const after = document.querySelectorAll('[data-testid^="st-state-"]').length;
    expect(after).toBeGreaterThan(before);
  });

  it('add transition button appends a new transition row', () => {
    mount();
    const before = document.querySelectorAll('[data-testid^="st-transition-"]').length;
    document.querySelector('[data-testid="st-add-transition"]').click();
    const after = document.querySelectorAll('[data-testid^="st-transition-"]').length;
    expect(after).toBe(before + 1);
  });
});
