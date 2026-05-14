import { describe, expect, it, beforeEach } from 'vitest';
import { createCoursePackBar } from '../components/CoursePackBar.js';
import { COURSE_PACKS } from '../data/courseSeries.js';

function mount(opts = {}) {
  document.body.innerHTML = '';
  const bar = createCoursePackBar(opts);
  document.body.appendChild(bar.element);
  return bar;
}

describe('CoursePackBar smoke', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('renders bar container with one chip per pack', () => {
    mount();
    expect(document.querySelector('[data-testid="course-pack-bar"]')).toBeInTheDocument();
    for (const p of COURSE_PACKS) {
      expect(document.querySelector(`[data-testid="course-pack-${p.id}"]`)).toBeInTheDocument();
    }
  });

  it('clicking a pack chip calls onApplyFilter with the pack filter', () => {
    let applied = null;
    mount({ onApplyFilter: (f) => { applied = f; } });
    document.querySelector('[data-testid="course-pack-ai-assisted"]').click();
    expect(applied).toEqual({ series: ['ai-assisted'] });
  });

  it('Export Markdown button only appears after a pack is chosen', () => {
    mount();
    expect(document.querySelector('[data-testid="course-pack-export"]')).toBeNull();
    document.querySelector('[data-testid="course-pack-ai-assisted"]').click();
    expect(document.querySelector('[data-testid="course-pack-export"]')).toBeInTheDocument();
  });

  it('clicking the same chip twice clears it (null filter)', () => {
    let applied = 'starting-value';
    const bar = mount({ onApplyFilter: (f) => { applied = f; } });
    const chip = document.querySelector('[data-testid="course-pack-ai-assisted"]');
    chip.click();
    expect(bar.getActiveId()).toBe('ai-assisted');
    chip.click();
    expect(bar.getActiveId()).toBeNull();
    expect(applied).toBeNull();
  });

  it('clear() resets the active id and re-renders without the export button', () => {
    const bar = mount();
    document.querySelector('[data-testid="course-pack-mutation"]').click();
    expect(document.querySelector('[data-testid="course-pack-export"]')).toBeInTheDocument();
    bar.clear();
    expect(bar.getActiveId()).toBeNull();
    expect(document.querySelector('[data-testid="course-pack-export"]')).toBeNull();
  });

  it('Export button click triggers download (smoke: no throw, anchor cleaned up)', () => {
    // jsdom supports Blob & URL.createObjectURL via stubs; this test just
    // verifies the click handler runs cleanly.
    mount();
    document.querySelector('[data-testid="course-pack-ai-assisted"]').click();
    const before = document.body.children.length;
    expect(() => document.querySelector('[data-testid="course-pack-export"]').click()).not.toThrow();
    // The temp anchor is appended then immediately removed.
    expect(document.body.children.length).toBe(before);
  });
});
