import { describe, expect, it } from 'vitest';
import { createSymbolicExecutionExplorer } from '../components/SymbolicExecutionExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createSymbolicExecutionExplorer();
  document.body.appendChild(el);
  return el;
}

describe('SymbolicExecutionExplorer smoke', () => {
  it('renders root element with correct testid', () => {
    mount();
    expect(document.querySelector('[data-testid="symbex-explorer"]')).toBeInTheDocument();
  });

  it('renders example buttons and source editor', () => {
    mount();
    expect(document.querySelector('[data-testid="symbex-examples"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="symbex-source"]')).toBeInTheDocument();
    const btns = document.querySelectorAll('[data-testid^="symbex-example-"]');
    expect(btns.length).toBeGreaterThan(0);
  });

  it('clicking an example does not throw', () => {
    mount();
    const btn = document.querySelector('[data-testid^="symbex-example-"]');
    expect(() => btn.click()).not.toThrow();
  });

  it('shows path list and summary after selecting an example', () => {
    mount();
    document.querySelector('[data-testid^="symbex-example-"]').click();
    expect(document.querySelector('[data-testid="symbex-paths"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="symbex-summary"]')).toBeInTheDocument();
  });

  it('shows at least one path after selecting an example', () => {
    mount();
    document.querySelector('[data-testid^="symbex-example-"]').click();
    const paths = document.querySelector('[data-testid="symbex-paths"]');
    expect(paths.children.length).toBeGreaterThan(0);
  });

  it('shows CFG area', () => {
    mount();
    document.querySelector('[data-testid^="symbex-example-"]').click();
    expect(document.querySelector('[data-testid="symbex-cfg"]')).toBeInTheDocument();
  });

  it('clicking a path does not throw', () => {
    mount();
    document.querySelector('[data-testid^="symbex-example-"]').click();
    const firstPath = document.querySelector('[data-symbex-path]');
    if (firstPath) expect(() => firstPath.click()).not.toThrow();
  });
});
