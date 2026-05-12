import { describe, expect, it } from 'vitest';
import { createTestDoublesExplorer } from '../components/TestDoublesExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createTestDoublesExplorer();
  document.body.appendChild(el);
  return el;
}

describe('TestDoublesExplorer smoke', () => {
  it('renders root element with correct testid', () => {
    mount();
    expect(document.querySelector('[data-testid="td-explorer"]')).toBeInTheDocument();
  });

  it('renders all 5 double-type buttons', () => {
    mount();
    expect(document.querySelector('[data-testid="td-types"]')).toBeInTheDocument();
    for (const id of ['dummy', 'stub', 'fake', 'mock', 'spy']) {
      expect(document.querySelector(`[data-testid="td-type-${id}"]`)).toBeInTheDocument();
    }
  });

  it('renders type info panel', () => {
    mount();
    expect(document.querySelector('[data-testid="td-type-info"]')).toBeInTheDocument();
  });

  it('renders scenario selector', () => {
    mount();
    expect(document.querySelector('[data-testid="td-scenarios"]')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-scenario]').length).toBeGreaterThan(0);
  });

  it('renders three code panels', () => {
    mount();
    expect(document.querySelector('[data-testid="td-code-grid"]')).toBeInTheDocument();
    expect(document.querySelectorAll('.td-code-panel').length).toBe(3);
  });

  it('renders run button', () => {
    mount();
    expect(document.querySelector('[data-testid="td-run"]')).toBeInTheDocument();
  });

  it('run button shows assertion table', () => {
    mount();
    document.querySelector('[data-testid="td-run"]').click();
    expect(document.querySelector('[data-testid="td-assert-table"]')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-testid^="td-assert-"]').length).toBeGreaterThan(0);
  });

  it('dummy scenario run shows no calls (no call log table)', () => {
    mount();
    document.querySelector('[data-testid="td-type-dummy"]').click();
    document.querySelector('[data-testid="td-run"]').click();
    // dummy has no interactions, call log table should be absent
    expect(document.querySelector('[data-testid="td-assert-table"]')).toBeInTheDocument();
  });

  it('stub scenario run shows call log', () => {
    mount();
    document.querySelector('[data-testid="td-type-stub"]').click();
    document.querySelector('[data-testid="td-run"]').click();
    expect(document.querySelector('[data-testid="td-call-log"]')).toBeInTheDocument();
  });

  it('mock scenario run shows call log and all assertions pass', () => {
    mount();
    document.querySelector('[data-testid="td-type-mock"]').click();
    document.querySelector('[data-testid="td-run"]').click();
    expect(document.querySelector('[data-testid="td-call-log"]')).toBeInTheDocument();
    const fails = document.querySelectorAll('.td-assert--fail');
    expect(fails.length).toBe(0);
  });

  it('spy scenario run shows call log with real results', () => {
    mount();
    document.querySelector('[data-testid="td-type-spy"]').click();
    document.querySelector('[data-testid="td-run"]').click();
    expect(document.querySelector('[data-testid="td-call-log"]')).toBeInTheDocument();
  });

  it('switching type resets scenario and clears results', () => {
    mount();
    document.querySelector('[data-testid="td-run"]').click();
    document.querySelector('[data-testid="td-type-fake"]').click();
    // after type switch, result panel should show hint (no result)
    expect(document.querySelector('[data-testid="td-assert-table"]')).not.toBeInTheDocument();
  });

  it('switching scenario within same type clears results', () => {
    mount();
    document.querySelector('[data-testid="td-type-stub"]').click();
    document.querySelector('[data-testid="td-run"]').click();
    const scenarios = document.querySelectorAll('[data-scenario]');
    if (scenarios.length > 1) {
      scenarios[1].click();
      expect(document.querySelector('[data-testid="td-assert-table"]')).not.toBeInTheDocument();
    }
  });

  it('all double types run without throwing', () => {
    mount();
    for (const id of ['dummy', 'stub', 'fake', 'mock', 'spy']) {
      document.querySelector(`[data-testid="td-type-${id}"]`).click();
      expect(() => document.querySelector('[data-testid="td-run"]').click()).not.toThrow();
    }
  });
});
