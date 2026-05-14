import { describe, expect, it } from 'vitest';
import { createTestQualityExplorer } from '../components/TestQualityExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createTestQualityExplorer();
  document.body.appendChild(el);
  return el;
}

describe('TestQualityExplorer smoke', () => {
  it('renders wrap container', () => {
    mount();
    expect(document.querySelector('[data-testid="tqx-wrap"]')).toBeInTheDocument();
  });

  it('renders paper citation', () => {
    mount();
    expect(document.querySelector('[data-testid="tqx-paper-cite"]')).toBeInTheDocument();
  });

  it('renders dims legend with 5 items', () => {
    mount();
    expect(document.querySelector('[data-testid="tqx-dims-legend"]')).toBeInTheDocument();
    expect(document.querySelectorAll('.tqx-legend-item').length).toBe(5);
  });

  it('renders first scenario card', () => {
    mount();
    expect(document.querySelector('[data-testid="tqx-scenario"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="tqx-dims"]')).toBeInTheDocument();
  });

  it('renders acceptance chart', () => {
    mount();
    expect(document.querySelector('[data-testid="tqx-acceptance"]')).toBeInTheDocument();
  });

  it('prev button is disabled on first scenario', () => {
    mount();
    const btn = document.querySelector('[data-testid="tqx-prev"]');
    expect(btn).toBeInTheDocument();
    expect(btn.disabled).toBe(true);
  });

  it('next button advances to next scenario', () => {
    mount();
    const counter = document.querySelector('.tqx-scenario-counter');
    expect(counter.textContent).toMatch(/1\s*\/\s*6/);
    document.querySelector('[data-testid="tqx-next"]').click();
    expect(document.querySelector('.tqx-scenario-counter').textContent).toMatch(/2\s*\/\s*6/);
  });

  it('rating a dimension enables reveal button after all rated', () => {
    mount();
    const dims = ['buildable', 'nonflaky', 'hardening', 'relevant', 'style'];
    for (const d of dims) {
      document.querySelector(`[data-testid="tqx-dim-yes-${d}"]`).click();
    }
    const revealBtn = document.querySelector('[data-testid="tqx-reveal"]');
    expect(revealBtn.disabled).toBe(false);
  });

  it('reveal shows verdict', () => {
    mount();
    const dims = ['buildable', 'nonflaky', 'hardening', 'relevant', 'style'];
    for (const d of dims) {
      document.querySelector(`[data-testid="tqx-dim-yes-${d}"]`).click();
    }
    document.querySelector('[data-testid="tqx-reveal"]').click();
    expect(
      document.querySelector('.tqx-verdict--accepted, .tqx-verdict--rejected')
    ).toBeInTheDocument();
  });

  it('quiz activates on Start button click', () => {
    mount();
    document.querySelector('[data-testid="tqx-quiz-start"]').click();
    expect(document.querySelector('[data-testid="tqx-quiz"]')).toBeInTheDocument();
  });

  it('quiz submit shows result', () => {
    mount();
    document.querySelector('[data-testid="tqx-quiz-start"]').click();
    document.querySelector('input[name="tqx-quiz"][value="b"]').click();
    document.querySelector('[data-testid="tqx-quiz-submit"]').click();
    expect(document.querySelector('[data-testid="tqx-quiz-result"]')).toBeInTheDocument();
  });

  it('lab reflect activates and shows textarea', () => {
    mount();
    document.querySelector('[data-testid="tqx-lab-start"]').click();
    expect(document.querySelector('[data-testid="tqx-lab"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="tqx-lab-text"]')).toBeInTheDocument();
  });
});
