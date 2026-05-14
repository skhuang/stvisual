import { describe, expect, it } from 'vitest';
import { createTeacherDashboard } from '../components/TeacherDashboard.js';

function mount() {
  document.body.innerHTML = '';
  const el = createTeacherDashboard();
  document.body.appendChild(el);
  return el;
}

describe('TeacherDashboard smoke', () => {
  it('renders root with correct testid', () => {
    mount();
    expect(document.querySelector('[data-testid="teacher-dashboard"]')).toBeInTheDocument();
  });

  it('renders panel with close button and class code input', () => {
    mount();
    expect(document.querySelector('[data-testid="td-panel"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="td-close"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="td-code-input"]')).toBeInTheDocument();
  });

  it('renders Load button', () => {
    mount();
    expect(document.querySelector('[data-testid="td-load-btn"]')).toBeInTheDocument();
  });

  it('close button hides the panel', () => {
    const el = mount();
    el.hidden = false;
    document.querySelector('[data-testid="td-close"]').click();
    expect(el.hidden).toBe(true);
  });

  it('shows error when Load clicked with empty code', async () => {
    mount();
    document.querySelector('[data-testid="td-code-input"]').value = '';
    document.querySelector('[data-testid="td-load-btn"]').click();
    await new Promise(r => setTimeout(r, 50));
    expect(document.querySelector('[data-testid="td-error"]')).toBeInTheDocument();
  });

  it('shows empty state after loading with unconfigured client', async () => {
    mount();
    document.querySelector('[data-testid="td-code-input"]').value = 'TEST01';
    document.querySelector('[data-testid="td-load-btn"]').click();
    await new Promise(r => setTimeout(r, 100));
    // loadCourseResults returns [] in unconfigured env → empty state or error
    const empty = document.querySelector('[data-testid="td-empty"]');
    const error = document.querySelector('[data-testid="td-error"]');
    expect(empty || error).toBeInTheDocument();
  });

  it('opens via stvisual:open-teacher-dashboard event', () => {
    const el = mount();
    el.hidden = true;
    window.dispatchEvent(new CustomEvent('stvisual:open-teacher-dashboard', {
      detail: { classCode: 'ABC123' },
    }));
    expect(el.hidden).toBe(false);
  });
});
