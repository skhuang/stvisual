import { describe, expect, it } from 'vitest';
import { createConcolicExecutionExplorer } from '../components/ConcolicExecutionExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createConcolicExecutionExplorer();
  document.body.appendChild(el);
  return el;
}

describe('ConcolicExecutionExplorer smoke', () => {
  it('renders root element with correct testid', () => {
    mount();
    expect(document.querySelector('[data-testid="concolic-explorer"]')).toBeInTheDocument();
  });

  it('renders example buttons and source editor', () => {
    mount();
    expect(document.querySelector('[data-testid="concolic-examples"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="concolic-source"]')).toBeInTheDocument();
    const btns = document.querySelectorAll('[data-testid^="concolic-example-"]');
    expect(btns.length).toBeGreaterThan(0);
  });

  it('renders seed input and max-iter input', () => {
    mount();
    expect(document.querySelector('[data-testid="concolic-seed"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="concolic-max-iter"]')).toBeInTheDocument();
  });

  it('clicking an example does not throw', () => {
    mount();
    const btn = document.querySelector('[data-testid^="concolic-example-"]');
    expect(() => btn.click()).not.toThrow();
  });

  it('shows iteration list and summary after selecting an example', () => {
    mount();
    document.querySelector('[data-testid^="concolic-example-"]').click();
    expect(document.querySelector('[data-testid="concolic-iters"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="concolic-summary"]')).toBeInTheDocument();
  });

  it('shows at least one iteration after selecting an example', () => {
    mount();
    document.querySelector('[data-testid^="concolic-example-"]').click();
    const iters = document.querySelector('[data-testid="concolic-iters"]');
    expect(iters.children.length).toBeGreaterThan(0);
  });

  it('shows CFG area', () => {
    mount();
    document.querySelector('[data-testid^="concolic-example-"]').click();
    expect(document.querySelector('[data-testid="concolic-cfg"]')).toBeInTheDocument();
  });

  it('clicking an iteration does not throw', () => {
    mount();
    document.querySelector('[data-testid^="concolic-example-"]').click();
    const firstIter = document.querySelector('[data-concolic-iter]');
    if (firstIter) expect(() => firstIter.click()).not.toThrow();
  });
});
