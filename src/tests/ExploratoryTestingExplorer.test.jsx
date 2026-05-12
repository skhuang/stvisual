import { describe, expect, it } from 'vitest';
import { createExploratoryTestingExplorer } from '../components/ExploratoryTestingExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createExploratoryTestingExplorer();
  document.body.appendChild(el);
  return el;
}

describe('ExploratoryTestingExplorer smoke', () => {
  it('renders root element with correct testid', () => {
    mount();
    expect(document.querySelector('[data-testid="et-explorer"]')).toBeInTheDocument();
  });

  it('renders charter section', () => {
    mount();
    expect(document.querySelector('[data-testid="et-charter-section"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="et-charter"]')).toBeInTheDocument();
  });

  it('renders SFDIPOT section with checkboxes', () => {
    mount();
    expect(document.querySelector('[data-testid="et-sfdipot-section"]')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-sfdipot]').length).toBe(7);
  });

  it('renders HICCUPPS section', () => {
    mount();
    expect(document.querySelector('[data-testid="et-hiccupps-section"]')).toBeInTheDocument();
  });

  it('renders timer section with start/stop/reset buttons', () => {
    mount();
    expect(document.querySelector('[data-testid="et-timer-section"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="et-timer-start"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="et-timer-stop"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="et-timer-reset"]')).toBeInTheDocument();
  });

  it('renders notes section with add button', () => {
    mount();
    expect(document.querySelector('[data-testid="et-notes-section"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="et-note-form"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="et-note-add"]')).toBeInTheDocument();
  });

  it('adding a note appends it to the list', () => {
    mount();
    const textInput = document.querySelector('[data-testid="et-note-text"]');
    textInput.value = 'Found a bug in the login form';
    document.querySelector('[data-testid="et-note-add"]').click();
    expect(document.querySelector('[data-testid="et-note-0"]')).toBeInTheDocument();
  });

  it('toggling SFDIPOT checkbox does not throw', () => {
    mount();
    const cb = document.querySelector('[data-sfdipot]');
    expect(() => { cb.checked = true; cb.dispatchEvent(new Event('change')); }).not.toThrow();
  });

  it('timer start/stop cycle does not throw', () => {
    mount();
    const startBtn = document.querySelector('[data-testid="et-timer-start"]');
    const stopBtn  = document.querySelector('[data-testid="et-timer-stop"]');
    expect(() => { startBtn.click(); stopBtn.click(); }).not.toThrow();
  });

  it('note stats chips render for all note types', () => {
    mount();
    expect(document.querySelector('[data-testid="et-stat-bug"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="et-stat-observation"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="et-stat-question"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="et-stat-idea"]')).toBeInTheDocument();
  });
});
