import { describe, expect, it } from 'vitest';
import { createLLMPipelineExplorer } from '../components/LLMPipelineExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createLLMPipelineExplorer();
  document.body.appendChild(el);
  return el;
}

describe('LLMPipelineExplorer smoke', () => {
  it('renders wrap container', () => {
    mount();
    expect(document.querySelector('[data-testid="llmp-wrap"]')).toBeInTheDocument();
  });

  it('renders paper citation', () => {
    mount();
    expect(document.querySelector('[data-testid="llmp-paper-cite"]')).toBeInTheDocument();
  });

  it('renders pipeline with three agent cards', () => {
    mount();
    expect(document.querySelector('[data-testid="llmp-pipeline"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="llmp-agent-mutation"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="llmp-agent-equivalence"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="llmp-agent-test"]')).toBeInTheDocument();
  });

  it('clicking an agent card updates the detail panel', () => {
    mount();
    document.querySelector('[data-testid="llmp-agent-equivalence"]').click();
    expect(document.querySelector('[data-testid="llmp-detail"]')).toBeInTheDocument();
  });

  it('detail tabs switch content sections', () => {
    mount();
    expect(document.querySelector('[data-testid="llmp-section-prompt"]')).toBeInTheDocument();
    document.querySelector('[data-testid="llmp-section-example"]').click();
    expect(document.querySelector('.llmp-example-grid')).toBeInTheDocument();
  });

  it('renders comparison table', () => {
    mount();
    expect(document.querySelector('[data-testid="llmp-comparison"]')).toBeInTheDocument();
  });

  it('renders platform stats', () => {
    mount();
    expect(document.querySelector('[data-testid="llmp-stats"]')).toBeInTheDocument();
    const bars = document.querySelectorAll('.llmp-stat-row');
    expect(bars.length).toBe(5);
  });

  it('quiz activates on Start button click', () => {
    mount();
    document.querySelector('[data-testid="llmp-quiz-start"]').click();
    expect(document.querySelector('[data-testid="llmp-quiz"]')).toBeInTheDocument();
  });

  it('quiz submit shows result', () => {
    mount();
    document.querySelector('[data-testid="llmp-quiz-start"]').click();
    document.querySelector('input[name="llmp-quiz"][value="c"]').click();
    document.querySelector('[data-testid="llmp-quiz-submit"]').click();
    expect(document.querySelector('[data-testid="llmp-quiz-result"]')).toBeInTheDocument();
  });

  it('lab reflect activates and shows textarea', () => {
    mount();
    document.querySelector('[data-testid="llmp-lab-start"]').click();
    expect(document.querySelector('[data-testid="llmp-lab"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="llmp-lab-text"]')).toBeInTheDocument();
  });
});
