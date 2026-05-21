import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { createInputSpacePartitioningExplorer } from '../components/InputSpacePartitioningExplorer.js';

let dom;
let document;
let container;

beforeEach(() => {
  dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>');
  document = dom.window.document;
  globalThis.document = document;
  globalThis.window = dom.window;
  globalThis.HTMLElement = dom.window.HTMLElement;
  container = document.getElementById('root');
});

afterEach(() => {
  dom.window.close();
  delete globalThis.document;
  delete globalThis.window;
  delete globalThis.HTMLElement;
});

function mount() {
  const el = createInputSpacePartitioningExplorer();
  container.appendChild(el);
  return el;
}

describe('InputSpacePartitioningExplorer', () => {
  it('mounts with the root testid and the first example loaded', () => {
    const root = mount();
    expect(root.dataset.testid).toBe('isp-explorer');
    expect(root.querySelector('[data-testid="isp-characteristic-0"]')).toBeTruthy();
  });

  it('defaults to ACoC and shows a full-product test set', () => {
    const root = mount();
    const rows = root.querySelectorAll('[data-testid^="isp-test-row-"]');
    expect(rows.length).toBe(27);
  });

  it('switching to ECC shrinks the test set to max block count (3)', () => {
    const root = mount();
    root.querySelector('[data-testid="isp-criterion-ecc"]').click();
    const rows = root.querySelectorAll('[data-testid^="isp-test-row-"]');
    expect(rows.length).toBe(3);
  });

  it('switching to BCC yields 1 + Σ(kᵢ−1) tests', () => {
    const root = mount();
    root.querySelector('[data-testid="isp-criterion-bcc"]').click();
    const rows = root.querySelectorAll('[data-testid^="isp-test-row-"]');
    expect(rows.length).toBe(7);
  });

  it('renders the 6-criterion count comparison', () => {
    const root = mount();
    for (const c of ['acoc', 'twc', 'pwc', 'ecc', 'bcc', 'mbcc']) {
      expect(root.querySelector(`[data-testid="isp-count-bar-${c}"]`), c).toBeTruthy();
    }
  });

  it('switching the example reloads the IDM', () => {
    const root = mount();
    root.querySelector('[data-testid="isp-example-password"]').click();
    const nameInput = root.querySelector('[data-testid="isp-characteristic-0"] .isp-char-name');
    expect(nameInput.value).toContain('length');
  });

  it('adding a block to a characteristic changes the ACoC count', () => {
    const root = mount();
    const before = root.querySelectorAll('[data-testid^="isp-test-row-"]').length;
    const input = root.querySelector('[data-testid="isp-add-block-0"]');
    input.value = 'huge';
    input.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    const after = root.querySelectorAll('[data-testid^="isp-test-row-"]').length;
    expect(after).toBeGreaterThan(before);
  });

  it('renders the subsumption lattice with all six nodes', () => {
    const root = mount();
    for (const c of ['acoc', 'twc', 'pwc', 'ecc', 'bcc', 'mbcc']) {
      expect(root.querySelector(`[data-testid="isp-lattice-node-${c}"]`), c).toBeTruthy();
    }
  });

  it('quiz flow: pick c, correct', () => {
    const root = mount();
    root.querySelector('[data-testid="isp-quiz-start"]').click();
    root.querySelector('input[name="isp-quiz"][value="c"]').click();
    root.querySelector('[data-testid="isp-quiz-submit"]').click();
    expect(root.querySelector('[data-testid="isp-quiz-result"]').classList.contains('quiz-correct')).toBe(true);
  });
});
