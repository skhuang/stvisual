import { describe, expect, it } from 'vitest';
import { createBoundaryValueExplorer } from '../components/BoundaryValueExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createBoundaryValueExplorer();
  document.body.appendChild(el);
  return el;
}

describe('BoundaryValueExplorer smoke', () => {
  it('renders root element with correct testid', () => {
    mount();
    expect(document.querySelector('[data-testid="bva-explorer"]')).toBeInTheDocument();
  });

  it('renders example buttons', () => {
    mount();
    expect(document.querySelector('[data-testid="bva-examples"]')).toBeInTheDocument();
    const btns = document.querySelectorAll('[data-testid^="bva-example-"]');
    expect(btns.length).toBeGreaterThan(0);
  });

  it('renders param table with name/min/max inputs', () => {
    mount();
    expect(document.querySelector('[data-testid="bva-param-table"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid^="bva-param-name-"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid^="bva-param-min-"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid^="bva-param-max-"]')).toBeInTheDocument();
  });

  it('renders results table with test cases', () => {
    mount();
    expect(document.querySelector('[data-testid="bva-table"]')).toBeInTheDocument();
    const rows = document.querySelectorAll('[data-testid^="bva-row-"]');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('clicking an example does not throw', () => {
    mount();
    const btn = document.querySelector('[data-testid^="bva-example-"]');
    expect(() => btn.click()).not.toThrow();
  });

  it('robust checkbox toggles row styles', () => {
    mount();
    const checkbox = document.querySelector('[data-testid="bva-robust-toggle"]');
    expect(checkbox).toBeInTheDocument();
    const before = document.querySelectorAll('.bva-row-robust').length;
    checkbox.click();
    const after = document.querySelectorAll('.bva-row-robust').length;
    expect(after).not.toBe(before);
  });

  it('add param button creates a new param row', () => {
    mount();
    const before = document.querySelectorAll('[data-testid^="bva-param-name-"]').length;
    document.querySelector('[data-testid="bva-add-param"]').click();
    const after = document.querySelectorAll('[data-testid^="bva-param-name-"]').length;
    expect(after).toBe(before + 1);
  });
});
