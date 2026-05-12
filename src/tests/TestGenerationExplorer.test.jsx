import { describe, expect, it } from 'vitest';
import { createTestGenerationExplorer } from '../components/TestGenerationExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createTestGenerationExplorer();
  document.body.appendChild(el);
  return el;
}

describe('TestGenerationExplorer smoke', () => {
  it('renders root element with correct testid', () => {
    mount();
    expect(document.querySelector('[data-testid="testgen-explorer"]')).toBeInTheDocument();
  });

  it('renders example buttons and criterion selector', () => {
    mount();
    expect(document.querySelector('[data-testid="testgen-examples"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="testgen-criterion"]')).toBeInTheDocument();
    const btns = document.querySelectorAll('[data-testid^="testgen-example-"]');
    expect(btns.length).toBeGreaterThan(0);
  });

  it('renders source editor', () => {
    mount();
    expect(document.querySelector('[data-testid="testgen-source"]')).toBeInTheDocument();
  });

  it('clicking an example does not throw', () => {
    mount();
    const btn = document.querySelector('[data-testid^="testgen-example-"]');
    expect(() => btn.click()).not.toThrow();
  });

  it('shows requirements and tests cards after selecting an example', () => {
    mount();
    document.querySelector('[data-testid^="testgen-example-"]').click();
    expect(document.querySelector('[data-testid="testgen-requirements-card"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="testgen-tests-card"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="testgen-summary"]')).toBeInTheDocument();
  });

  it('shows at least one requirement after selecting an example', () => {
    mount();
    document.querySelector('[data-testid^="testgen-example-"]').click();
    const reqList = document.querySelector('[data-testid="testgen-req-list"]');
    expect(reqList).toBeInTheDocument();
    expect(reqList.children.length).toBeGreaterThan(0);
  });

  it('switching criterion does not throw', () => {
    mount();
    document.querySelector('[data-testid^="testgen-example-"]').click();
    const sel = document.querySelector('[data-testid="testgen-criterion"]');
    sel.value = sel.options[1]?.value ?? sel.value;
    expect(() => sel.dispatchEvent(new Event('change', { bubbles: true }))).not.toThrow();
  });

  it('shows CFG area', () => {
    mount();
    document.querySelector('[data-testid^="testgen-example-"]').click();
    expect(document.querySelector('[data-testid="testgen-cfg"]')).toBeInTheDocument();
  });

  it('shows download button when tests exist', () => {
    mount();
    document.querySelector('[data-testid^="testgen-example-"]').click();
    const testList = document.querySelector('[data-testid="testgen-test-list"]');
    if (testList && testList.children.length > 0) {
      expect(document.querySelector('[data-testid="testgen-download-btn"]')).toBeInTheDocument();
    }
  });
});
