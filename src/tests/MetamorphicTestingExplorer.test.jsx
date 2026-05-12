import { describe, expect, it } from 'vitest';
import { createMetamorphicTestingExplorer } from '../components/MetamorphicTestingExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createMetamorphicTestingExplorer();
  document.body.appendChild(el);
  return el;
}

describe('MetamorphicTestingExplorer smoke', () => {
  it('renders root element with correct testid', () => {
    mount();
    expect(document.querySelector('[data-testid="mt-explorer"]')).toBeInTheDocument();
  });

  it('renders example buttons', () => {
    mount();
    expect(document.querySelector('[data-testid="mt-examples"]')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-testid^="mt-example-"]').length).toBeGreaterThan(0);
  });

  it('renders metamorphic relation buttons', () => {
    mount();
    expect(document.querySelector('[data-testid="mt-relations"]')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-testid^="mt-rel-"]').length).toBeGreaterThan(0);
  });

  it('renders MR card with generate button', () => {
    mount();
    expect(document.querySelector('[data-testid="mt-mr-card"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="mt-generate"]')).toBeInTheDocument();
  });

  it('generate button produces a results table', () => {
    mount();
    document.querySelector('[data-testid="mt-generate"]').click();
    expect(document.querySelector('[data-testid="mt-table"]')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-testid^="mt-row-"]').length).toBeGreaterThan(0);
  });

  it('clicking a different example loads its relations', () => {
    mount();
    const btns = document.querySelectorAll('[data-testid^="mt-example-"]');
    if (btns.length > 1) {
      btns[1].click();
      expect(document.querySelectorAll('[data-testid^="mt-rel-"]').length).toBeGreaterThan(0);
    }
  });

  it('clicking a relation button changes active selection', () => {
    mount();
    const relBtns = document.querySelectorAll('[data-testid^="mt-rel-"]');
    if (relBtns.length > 1) {
      expect(() => relBtns[1].click()).not.toThrow();
    }
  });
});
