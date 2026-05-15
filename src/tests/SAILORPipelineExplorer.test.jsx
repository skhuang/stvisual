import { describe, expect, it } from 'vitest';
import {
  createSAILORPipelineExplorer,
  PHASES,
  ABLATION,
} from '../components/SAILORPipelineExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createSAILORPipelineExplorer();
  document.body.appendChild(el);
  return el;
}

describe('SAILOR pipeline data', () => {
  it('defines exactly the four canonical phases in order', () => {
    expect(PHASES.map((p) => p.id)).toEqual(['static', 'harness', 'symbolic', 'replay']);
  });

  it('only the harness phase is marked iterative', () => {
    expect(PHASES.find((p) => p.id === 'harness').iterative).toBe(true);
    expect(PHASES.filter((p) => p.iterative).length).toBe(1);
  });

  it('ablation: full SAILOR leads, no-LLM is zero, baseline is 12', () => {
    const byId = Object.fromEntries(ABLATION.map((a) => [a.id, a.confirmed]));
    expect(byId.full).toBe(421);
    expect(byId['no-llm']).toBe(0);
    expect(byId.baseline).toBe(12);
    // Removing static analysis is severe but not zero.
    expect(byId['no-static']).toBeGreaterThan(0);
    expect(byId['no-static']).toBeLessThan(byId.full);
  });
});

describe('SAILORPipelineExplorer smoke', () => {
  it('renders wrap container + paper citation (arXiv 2604.06506)', () => {
    mount();
    expect(document.querySelector('[data-testid="sailor-wrap"]')).toBeInTheDocument();
    const cite = document.querySelector('[data-testid="sailor-paper-cite"]');
    expect(cite).toBeInTheDocument();
    expect(cite.querySelector('a').getAttribute('href')).toContain('2604.06506');
  });

  it('renders all four phase cards', () => {
    mount();
    expect(document.querySelector('[data-testid="sailor-pipeline"]')).toBeInTheDocument();
    for (const id of ['static', 'harness', 'symbolic', 'replay']) {
      expect(document.querySelector(`[data-testid="sailor-phase-${id}"]`), id).toBeInTheDocument();
    }
  });

  it('clicking a phase card updates the detail panel', () => {
    mount();
    document.querySelector('[data-testid="sailor-phase-symbolic"]').click();
    expect(document.querySelector('[data-testid="sailor-detail"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="sailor-phase-symbolic"]').classList.contains('sailor-phase--active')).toBe(true);
  });

  it('detail tabs switch between role / example / failures', () => {
    mount();
    // Default tab is role.
    expect(document.querySelector('.sailor-detail-role')).toBeInTheDocument();
    document.querySelector('[data-testid="sailor-detail-example"]').click();
    expect(document.querySelector('.sailor-example-grid')).toBeInTheDocument();
    document.querySelector('[data-testid="sailor-detail-failures"]').click();
    expect(document.querySelector('.sailor-failure-list')).toBeInTheDocument();
  });

  it('renders the ablation chart with one row per ablation entry', () => {
    mount();
    expect(document.querySelector('[data-testid="sailor-ablation"]')).toBeInTheDocument();
    for (const a of ABLATION) {
      expect(document.querySelector(`[data-testid="sailor-abl-${a.id}"]`), a.id).toBeInTheDocument();
    }
  });

  it('exposes a bridge to the Symbolic Execution section', () => {
    mount();
    expect(document.querySelector('[data-testid="sailor-bridge-symbex"]')).toBeInTheDocument();
  });

  it('quiz: start, pick correct option b, submit → correct + share button', () => {
    mount();
    document.querySelector('[data-testid="sailor-quiz-start"]').click();
    document.querySelector('input[name="sailor-quiz"][value="b"]').click();
    document.querySelector('[data-testid="sailor-quiz-submit"]').click();
    const result = document.querySelector('[data-testid="sailor-quiz-result"]');
    expect(result.classList.contains('quiz-correct')).toBe(true);
    const share = document.querySelector('[data-testid="sailor-quiz-share"]');
    expect(share).toBeInTheDocument();
    expect(share.getAttribute('data-share-payload')).toBeTruthy();
  });

  it('lab reflect activates and shows textarea', () => {
    mount();
    document.querySelector('[data-testid="sailor-lab-start"]').click();
    expect(document.querySelector('[data-testid="sailor-lab"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="sailor-lab-text"]')).toBeInTheDocument();
  });
});
