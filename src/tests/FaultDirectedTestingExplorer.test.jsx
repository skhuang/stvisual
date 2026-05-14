import { describe, expect, it } from 'vitest';
import { createFaultDirectedTestingExplorer } from '../components/FaultDirectedTestingExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createFaultDirectedTestingExplorer();
  document.body.appendChild(el);
  return el;
}

describe('FaultDirectedTestingExplorer smoke', () => {
  it('renders wrap container', () => {
    mount();
    expect(document.querySelector('[data-testid="fdx-wrap"]')).toBeInTheDocument();
  });

  it('renders paper citation', () => {
    mount();
    expect(document.querySelector('[data-testid="fdx-paper-cite"]')).toBeInTheDocument();
  });

  it('renders first issue card', () => {
    mount();
    expect(document.querySelector('[data-testid="fdx-issue"]')).toBeInTheDocument();
    const counter = document.querySelector('.fdx-issue-counter');
    expect(counter.textContent).toMatch(/1\s*\/\s*4/);
  });

  it('renders blind and targeted mutant lists', () => {
    mount();
    expect(document.querySelector('.fdx-mutants-col--blind')).toBeInTheDocument();
    expect(document.querySelector('.fdx-mutants-col--targeted')).toBeInTheDocument();
  });

  it('selecting the correct targeted mutant shows right feedback', () => {
    mount();
    document.querySelector('[data-testid="fdx-mutant-targeted-0"]').click();
    const fb = document.querySelector('[data-testid="fdx-feedback"]');
    expect(fb).toBeInTheDocument();
    expect(fb.classList.contains('fdx-feedback--right')).toBe(true);
  });

  it('selecting a blind mutant shows wrong feedback', () => {
    mount();
    document.querySelector('[data-testid="fdx-mutant-blind-0"]').click();
    const fb = document.querySelector('[data-testid="fdx-feedback"]');
    expect(fb).toBeInTheDocument();
    expect(fb.classList.contains('fdx-feedback--wrong')).toBe(true);
  });

  it('next button advances to next issue and resets selection', () => {
    mount();
    document.querySelector('[data-testid="fdx-mutant-targeted-0"]').click();
    document.querySelector('[data-testid="fdx-next"]').click();
    expect(document.querySelector('.fdx-issue-counter').textContent).toMatch(/2\s*\/\s*4/);
    expect(document.querySelector('[data-testid="fdx-feedback"]')).toBeNull();
  });

  it('prev button is disabled on first issue', () => {
    mount();
    const btn = document.querySelector('[data-testid="fdx-prev"]');
    expect(btn.disabled).toBe(true);
  });

  it('renders insight panel comparing coverage-driven vs spec-directed', () => {
    mount();
    expect(document.querySelector('[data-testid="fdx-insight"]')).toBeInTheDocument();
    expect(document.querySelectorAll('.fdx-insight-col').length).toBe(2);
  });

  it('quiz activates on Start button click', () => {
    mount();
    document.querySelector('[data-testid="fdx-quiz-start"]').click();
    expect(document.querySelector('[data-testid="fdx-quiz"]')).toBeInTheDocument();
  });

  it('quiz submit shows result', () => {
    mount();
    document.querySelector('[data-testid="fdx-quiz-start"]').click();
    document.querySelector('input[name="fdx-quiz"][value="a"]').click();
    document.querySelector('[data-testid="fdx-quiz-submit"]').click();
    expect(document.querySelector('[data-testid="fdx-quiz-result"]')).toBeInTheDocument();
  });

  it('lab reflect activates and shows textarea', () => {
    mount();
    document.querySelector('[data-testid="fdx-lab-start"]').click();
    expect(document.querySelector('[data-testid="fdx-lab"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="fdx-lab-text"]')).toBeInTheDocument();
  });
});
