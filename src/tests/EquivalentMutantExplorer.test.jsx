import { describe, expect, it } from 'vitest';
import { createEquivalentMutantExplorer } from '../components/EquivalentMutantExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createEquivalentMutantExplorer();
  document.body.appendChild(el);
  return el;
}

describe('EquivalentMutantExplorer smoke', () => {
  it('renders the wrap container', () => {
    mount();
    expect(document.querySelector('[data-testid="emx-wrap"]')).toBeInTheDocument();
  });

  it('renders paper citation with arXiv link', () => {
    mount();
    const cite = document.querySelector('[data-testid="emx-paper-cite"]');
    expect(cite).toBeInTheDocument();
    expect(cite.querySelector('a').href).toContain('2501.12862');
  });

  it('renders the 3-step pipeline', () => {
    mount();
    expect(document.querySelector('[data-testid="emx-pipeline"]')).toBeInTheDocument();
  });

  it('renders practice section with first pair', () => {
    mount();
    expect(document.querySelector('[data-testid="emx-practice"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="emx-judgment-row"]')).toBeInTheDocument();
  });

  it('renders code diff for current pair', () => {
    mount();
    expect(document.querySelector('[data-testid="emx-code-diff"]')).toBeInTheDocument();
  });

  it('clicking Equivalent records answer and shows result', () => {
    mount();
    document.querySelector('[data-testid="emx-btn-eq"]').click();
    expect(document.querySelector('[data-testid="emx-result"]')).toBeInTheDocument();
  });

  it('clicking Not Equivalent records answer and shows result', () => {
    mount();
    document.querySelector('[data-testid="emx-btn-neq"]').click();
    expect(document.querySelector('[data-testid="emx-result"]')).toBeInTheDocument();
  });

  it('Next button advances to second pair', () => {
    mount();
    document.querySelector('[data-testid="emx-next"]').click();
    const counter = document.querySelector('.emx-pair-counter');
    expect(counter.textContent).toMatch(/2/);
  });

  it('Prev button is disabled on first pair', () => {
    mount();
    expect(document.querySelector('[data-testid="emx-prev"]').disabled).toBe(true);
  });

  it('metrics appear after answering at least one pair', () => {
    mount();
    expect(document.querySelector('[data-testid="emx-metrics"]')).not.toBeInTheDocument();
    document.querySelector('[data-testid="emx-btn-eq"]').click();
    expect(document.querySelector('[data-testid="emx-metrics"]')).toBeInTheDocument();
  });

  it('quiz activates on Start button click', () => {
    mount();
    document.querySelector('[data-testid="emx-quiz-start"]').click();
    expect(document.querySelector('[data-testid="emx-quiz"]')).toBeInTheDocument();
  });

  it('quiz submit shows result', () => {
    mount();
    document.querySelector('[data-testid="emx-quiz-start"]').click();
    document.querySelector('input[name="emx-quiz"][value="b"]').click();
    document.querySelector('[data-testid="emx-quiz-submit"]').click();
    expect(document.querySelector('[data-testid="emx-quiz-result"]')).toBeInTheDocument();
  });

  it('lab reflect activates and shows textarea', () => {
    mount();
    document.querySelector('[data-testid="emx-lab-start"]').click();
    expect(document.querySelector('[data-testid="emx-lab"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="emx-lab-text"]')).toBeInTheDocument();
  });
});
