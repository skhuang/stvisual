import { describe, expect, it } from 'vitest';
import { createFuzzTestingExplorer } from '../components/FuzzTestingExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createFuzzTestingExplorer();
  document.body.appendChild(el);
  return el;
}

describe('FuzzTestingExplorer smoke', () => {
  it('renders root element with correct testid', () => {
    mount();
    expect(document.querySelector('[data-testid="fuzz-explorer"]')).toBeInTheDocument();
  });

  it('renders example buttons', () => {
    mount();
    expect(document.querySelector('[data-testid="fuzz-examples"]')).toBeInTheDocument();
    const btns = document.querySelectorAll('[data-testid^="fuzz-example-"]');
    expect(btns.length).toBeGreaterThan(0);
  });

  it('renders run button and source editor', () => {
    mount();
    expect(document.querySelector('[data-testid="fuzz-run-btn"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="fuzz-source"]')).toBeInTheDocument();
  });

  it('clicking an example does not throw', () => {
    mount();
    const btn = document.querySelector('[data-testid^="fuzz-example-"]');
    expect(() => btn.click()).not.toThrow();
  });

  it('clicking run button after selecting an example does not throw', () => {
    mount();
    const exampleBtn = document.querySelector('[data-testid^="fuzz-example-"]');
    exampleBtn.click();
    const runBtn = document.querySelector('[data-testid="fuzz-run-btn"]');
    expect(() => runBtn.click()).not.toThrow();
    expect(document.querySelector('[data-testid="fuzz-summary"]')).toBeInTheDocument();
  });

  it('shows CFG area after a run', () => {
    mount();
    document.querySelector('[data-testid^="fuzz-example-"]').click();
    document.querySelector('[data-testid="fuzz-run-btn"]').click();
    expect(document.querySelector('[data-testid="fuzz-cfg"]')).toBeInTheDocument();
  });
});
