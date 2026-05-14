import { t } from '../i18n/index.js';
import { COURSE_PACKS, getCoursePackExplorers, getCoursePackFilter } from '../data/courseSeries.js';
import { downloadCoursePackMarkdown } from '../utils/coursePackExporter.js';

export function createCoursePackBar({ initial, onApplyFilter } = {}) {
  const validInitial = COURSE_PACKS.some((p) => p.id === initial);
  const state = { activeId: validInitial ? initial : null };
  const root = document.createElement('div');
  root.className = 'course-pack-bar';
  root.dataset.testid = 'course-pack-bar';

  function render() {
    root.innerHTML = `
      <div class="course-pack-bar__header">
        <span class="course-pack-bar__title">${t('pack.title')}</span>
        ${state.activeId ? `
          <button type="button"
            class="course-pack-bar__export"
            data-testid="course-pack-export">
            ${t('pack.export')}
          </button>` : ''}
      </div>
      <div class="course-pack-bar__chips">
        ${COURSE_PACKS.map((pack) => {
          const count = getCoursePackExplorers(pack.id).length;
          const active = state.activeId === pack.id;
          return `
            <button type="button"
              class="course-pack-chip${active ? ' course-pack-chip--active' : ''}"
              data-pack="${pack.id}"
              data-testid="course-pack-${pack.id}"
              aria-pressed="${active ? 'true' : 'false'}"
              title="${t(pack.descKey).replace(/"/g, '&quot;')}">
              <span class="course-pack-chip__title">${t(pack.titleKey)}</span>
              <span class="course-pack-chip__count">${count}</span>
            </button>`;
        }).join('')}
      </div>
      ${state.activeId ? `
        <p class="course-pack-bar__desc" data-testid="course-pack-desc">
          ${t(COURSE_PACKS.find((p) => p.id === state.activeId).descKey)}
        </p>` : ''}`;

    root.querySelectorAll('[data-pack]').forEach((btn) => {
      btn.addEventListener('click', () => choose(btn.dataset.pack));
    });
    root.querySelector('[data-testid="course-pack-export"]')?.addEventListener('click', () => {
      if (state.activeId) downloadCoursePackMarkdown(state.activeId);
    });
  }

  function choose(packId) {
    if (state.activeId === packId) {
      // Second click on the same chip clears it.
      state.activeId = null;
      onApplyFilter?.(null);
    } else {
      state.activeId = packId;
      onApplyFilter?.(getCoursePackFilter(packId));
    }
    render();
  }

  function clear() {
    state.activeId = null;
    render();
  }

  function getActiveId() {
    return state.activeId;
  }

  render();
  return { element: root, choose, clear, getActiveId };
}
