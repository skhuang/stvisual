import { describe, expect, it } from 'vitest';
import { createEquivalenceClassExplorer } from '../components/EquivalenceClassExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createEquivalenceClassExplorer();
  document.body.appendChild(el);
  return el;
}

describe('EquivalenceClassExplorer smoke', () => {
  it('renders root element with correct testid', () => {
    mount();
    expect(document.querySelector('[data-testid="ec-explorer"]')).toBeInTheDocument();
  });

  it('renders example buttons', () => {
    mount();
    expect(document.querySelector('[data-testid="ec-examples"]')).toBeInTheDocument();
    const btns = document.querySelectorAll('[data-testid^="ec-example-"]');
    expect(btns.length).toBeGreaterThan(0);
  });

  it('renders WECT/SECT mode toggle', () => {
    mount();
    expect(document.querySelector('[data-testid="ec-mode-wect"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="ec-mode-sect"]')).toBeInTheDocument();
  });

  it('renders params pane with class tables', () => {
    mount();
    expect(document.querySelector('[data-testid="ec-params-pane"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid^="ec-class-table-"]')).toBeInTheDocument();
  });

  it('renders results table', () => {
    mount();
    expect(document.querySelector('[data-testid="ec-results"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="ec-table"]')).toBeInTheDocument();
  });

  it('switching to SECT mode does not throw and re-renders results', () => {
    mount();
    const sectBtn = document.querySelector('[data-testid="ec-mode-sect"]');
    expect(() => sectBtn.click()).not.toThrow();
    expect(document.querySelector('[data-testid="ec-results"]')).toBeInTheDocument();
  });

  it('clicking an example loads it without throwing', () => {
    mount();
    const btn = document.querySelector('[data-testid^="ec-example-"]');
    expect(() => btn.click()).not.toThrow();
    expect(document.querySelector('[data-testid="ec-table"]')).toBeInTheDocument();
  });

  it('add class button appends a class row', () => {
    mount();
    const addBtn = document.querySelector('[data-testid="ec-add-class-0"]');
    const before = document.querySelectorAll('[data-testid^="ec-class-name-0-"]').length;
    addBtn.click();
    const after = document.querySelectorAll('[data-testid^="ec-class-name-0-"]').length;
    expect(after).toBe(before + 1);
  });

  it('add param button creates a new param block', () => {
    mount();
    const before = document.querySelectorAll('[data-testid^="ec-param-"]').length;
    document.querySelector('[data-testid="ec-add-param"]').click();
    const after = document.querySelectorAll('[data-testid^="ec-param-"]').length;
    expect(after).toBeGreaterThan(before);
  });
});
