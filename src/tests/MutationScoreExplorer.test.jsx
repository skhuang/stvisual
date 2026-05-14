import { describe, expect, it } from 'vitest';
import { createMutationScoreExplorer } from '../components/MutationScoreExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createMutationScoreExplorer();
  document.body.appendChild(el);
  return el;
}

describe('MutationScoreExplorer smoke', () => {
  it('renders the wrap container', () => {
    mount();
    expect(document.querySelector('[data-testid="msx-wrap"]')).toBeInTheDocument();
  });

  it('renders paper citation', () => {
    mount();
    expect(document.querySelector('[data-testid="msx-paper-cite"]')).toBeInTheDocument();
  });

  it('renders the function box', () => {
    mount();
    expect(document.querySelector('[data-testid="msx-fn-box"]')).toBeInTheDocument();
  });

  it('renders the metric dashboard', () => {
    mount();
    expect(document.querySelector('[data-testid="msx-dashboard"]')).toBeInTheDocument();
    const meters = document.querySelectorAll('.msx-meter');
    expect(meters.length).toBe(2);
  });

  it('renders mutant list with 7 rows', () => {
    mount();
    const list = document.querySelector('[data-testid="msx-mutant-list"]');
    expect(list).toBeInTheDocument();
    const rows = list.querySelectorAll('tbody tr');
    expect(rows.length).toBe(7);
  });

  it('renders test list with preset tests', () => {
    mount();
    expect(document.querySelector('[data-testid="msx-test-list"]')).toBeInTheDocument();
  });

  it('renders add-test panel', () => {
    mount();
    expect(document.querySelector('[data-testid="msx-add-test"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="msx-score-input"]')).toBeInTheDocument();
  });

  it('loads empty preset and shows empty state', () => {
    mount();
    document.querySelector('[data-preset="empty"]').click();
    expect(document.querySelector('.msx-empty')).toBeInTheDocument();
  });

  it('loads high-mutation-score preset', () => {
    mount();
    document.querySelector('[data-preset="highmut"]').click();
    const rows = document.querySelectorAll('[data-testid="msx-test-list"] tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('add test button adds a row', () => {
    mount();
    document.querySelector('[data-preset="empty"]').click();
    document.querySelector('[data-testid="msx-score-input"]').value = '60';
    document.querySelector('[data-testid="msx-score-input"]').dispatchEvent(new Event('input'));
    document.querySelector('[data-testid="msx-add-btn"]').click();
    const rows = document.querySelectorAll('[data-testid="msx-test-list"] tbody tr');
    expect(rows.length).toBe(1);
  });

  it('quiz activates on Start button click', () => {
    mount();
    document.querySelector('[data-testid="msx-quiz-start"]').click();
    expect(document.querySelector('[data-testid="msx-quiz"]')).toBeInTheDocument();
  });

  it('lab metric activates on Start button click', () => {
    mount();
    document.querySelector('[data-testid="msx-lab-start"]').click();
    expect(document.querySelector('[data-testid="msx-lab"]')).toBeInTheDocument();
  });

  it('removing a test updates the list', () => {
    mount();
    const before = document.querySelectorAll('[data-testid="msx-test-list"] tbody tr').length;
    document.querySelector('[data-testid="msx-remove-0"]').click();
    const after = document.querySelectorAll('[data-testid="msx-test-list"] tbody tr').length;
    expect(after).toBe(before - 1);
  });
});
