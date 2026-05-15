import { describe, expect, it } from 'vitest';
import {
  createMBTWorkflowExplorer,
  STAGES,
  MODES,
} from '../components/MBTWorkflowExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createMBTWorkflowExplorer();
  document.body.appendChild(el);
  return el;
}

describe('MBT workflow data', () => {
  it('defines the six canonical pipeline stages in order', () => {
    expect(STAGES.map((s) => s.id)).toEqual([
      'model', 'criterion', 'abstract', 'concretize', 'execute', 'verdict',
    ]);
  });

  it('every stage carries an example and two failure modes', () => {
    for (const stage of STAGES) {
      expect(stage.exampleInput, stage.id).toBeTruthy();
      expect(stage.exampleOutput, stage.id).toBeTruthy();
      expect(stage.failureModes.length, stage.id).toBe(2);
    }
  });

  it('contrasts offline and online MBT with three rows each', () => {
    expect(MODES.map((m) => m.id)).toEqual(['offline', 'online']);
    for (const m of MODES) expect(m.rows.length).toBe(3);
  });
});

describe('MBTWorkflowExplorer smoke', () => {
  it('renders wrap container + pipeline', () => {
    mount();
    expect(document.querySelector('[data-testid="mbtw-wrap"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="mbtw-pipeline"]')).toBeInTheDocument();
  });

  it('renders all six stage cards', () => {
    mount();
    for (const s of STAGES) {
      expect(document.querySelector(`[data-testid="mbtw-stage-${s.id}"]`), s.id).toBeInTheDocument();
    }
  });

  it('clicking a stage card updates the detail panel', () => {
    mount();
    document.querySelector('[data-testid="mbtw-stage-concretize"]').click();
    expect(document.querySelector('[data-testid="mbtw-detail"]')).toBeInTheDocument();
    expect(
      document.querySelector('[data-testid="mbtw-stage-concretize"]').classList.contains('mbtw-stage--active'),
    ).toBe(true);
  });

  it('detail tabs switch between role / example / failures', () => {
    mount();
    expect(document.querySelector('.mbtw-detail-role')).toBeInTheDocument();
    document.querySelector('[data-testid="mbtw-detail-example"]').click();
    expect(document.querySelector('.mbtw-example-grid')).toBeInTheDocument();
    document.querySelector('[data-testid="mbtw-detail-failures"]').click();
    expect(document.querySelectorAll('.mbtw-failure-list li').length).toBe(2);
  });

  it('renders the offline vs online comparison', () => {
    mount();
    expect(document.querySelector('[data-testid="mbtw-modes"]')).toBeInTheDocument();
    expect(document.querySelectorAll('.mbtw-mode-col').length).toBe(2);
  });

  it('exposes a bridge to the V-Model', () => {
    mount();
    expect(document.querySelector('[data-testid="mbtw-bridge-vmodel"]')).toBeInTheDocument();
  });

  it('quiz: start, pick correct option c, submit → correct + share button', () => {
    mount();
    document.querySelector('[data-testid="mbtw-quiz-start"]').click();
    document.querySelector('input[name="mbtw-quiz"][value="c"]').click();
    document.querySelector('[data-testid="mbtw-quiz-submit"]').click();
    const result = document.querySelector('[data-testid="mbtw-quiz-result"]');
    expect(result.classList.contains('quiz-correct')).toBe(true);
    const share = document.querySelector('[data-testid="mbtw-quiz-share"]');
    expect(share).toBeInTheDocument();
    expect(share.getAttribute('data-share-payload')).toBeTruthy();
  });

  it('quiz: a wrong option submits as incorrect', () => {
    mount();
    document.querySelector('[data-testid="mbtw-quiz-start"]').click();
    document.querySelector('input[name="mbtw-quiz"][value="a"]').click();
    document.querySelector('[data-testid="mbtw-quiz-submit"]').click();
    expect(
      document.querySelector('[data-testid="mbtw-quiz-result"]').classList.contains('quiz-wrong'),
    ).toBe(true);
  });

  it('lab reflect activates and shows textarea', () => {
    mount();
    document.querySelector('[data-testid="mbtw-lab-start"]').click();
    expect(document.querySelector('[data-testid="mbtw-lab"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="mbtw-lab-text"]')).toBeInTheDocument();
  });
});
