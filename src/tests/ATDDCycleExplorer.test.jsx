import { describe, expect, it } from 'vitest';
import {
  createATDDCycleExplorer,
  STAGES,
  nextStage,
  poInvolvedIn,
} from '../components/ATDDCycleExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createATDDCycleExplorer();
  document.body.appendChild(el);
  return el;
}

describe('ATDD cycle helpers', () => {
  it('STAGES enumerates the canonical four', () => {
    expect(STAGES).toEqual(['discuss', 'distill', 'develop', 'demo']);
  });

  it('nextStage wraps from demo back to discuss', () => {
    expect(nextStage('discuss')).toBe('distill');
    expect(nextStage('distill')).toBe('develop');
    expect(nextStage('develop')).toBe('demo');
    expect(nextStage('demo')).toBe('discuss');
  });

  it('poInvolvedIn returns true for Discuss and Demo only', () => {
    expect(poInvolvedIn('discuss')).toBe(true);
    expect(poInvolvedIn('distill')).toBe(false);
    expect(poInvolvedIn('develop')).toBe(false);
    expect(poInvolvedIn('demo')).toBe(true);
  });
});

describe('ATDDCycleExplorer smoke', () => {
  it('renders wrap, story, cycle, detail', () => {
    mount();
    expect(document.querySelector('[data-testid="atdd-wrap"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="atdd-story"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="atdd-cycle"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="atdd-detail"]')).toBeInTheDocument();
  });

  it('clicking a stage chip selects it', () => {
    mount();
    document.querySelector('[data-testid="atdd-stage-distill"]').click();
    expect(document.querySelector('[data-testid="atdd-stage-distill"]').classList.contains('atdd-stage--active')).toBe(true);
  });

  it('Develop stage exposes the TDD inner loop', () => {
    mount();
    document.querySelector('[data-testid="atdd-stage-develop"]').click();
    expect(document.querySelector('[data-testid="atdd-tdd"]')).toBeInTheDocument();
  });

  it('PO chip appears only on Discuss / Demo', () => {
    mount();
    document.querySelector('[data-testid="atdd-stage-discuss"]').click();
    expect(document.querySelector('.atdd-detail__chip--po')).toBeInTheDocument();

    document.querySelector('[data-testid="atdd-stage-distill"]').click();
    expect(document.querySelector('.atdd-detail__chip--po')).toBeNull();

    document.querySelector('[data-testid="atdd-stage-demo"]').click();
    expect(document.querySelector('.atdd-detail__chip--po')).toBeInTheDocument();
  });

  it('Next button advances and wraps back to discuss after demo', () => {
    mount();
    // Start at discuss (idx 0); Next four times should bring us back to discuss.
    for (let i = 0; i < 4; i++) {
      document.querySelector('[data-testid="atdd-next"]').click();
    }
    expect(document.querySelector('[data-testid="atdd-stage-discuss"]').classList.contains('atdd-stage--active')).toBe(true);
  });

  it('Prev button is disabled at the first stage', () => {
    mount();
    const prev = document.querySelector('[data-testid="atdd-prev"]');
    expect(prev.disabled).toBe(true);
  });

  it('quiz: pick C (Discuss + Demo), submit → correct', () => {
    mount();
    document.querySelector('[data-testid="atdd-quiz-start"]').click();
    document.querySelector('input[name="atdd-quiz"][value="c"]').click();
    document.querySelector('[data-testid="atdd-quiz-submit"]').click();
    expect(document.querySelector('[data-testid="atdd-quiz-result"]').classList.contains('quiz-correct')).toBe(true);
  });

  it('lab reflect activates', () => {
    mount();
    document.querySelector('[data-testid="atdd-lab-start"]').click();
    expect(document.querySelector('[data-testid="atdd-lab-text"]')).toBeInTheDocument();
  });
});
