import { t } from '../i18n/index.js';
import {
  TAG_LEVELS,
  TAG_TECHNIQUES,
  TAG_SERIES,
  TAG_DIFFICULTY,
} from '../data/explorerTags.js';

const DIMENSIONS = [
  { id: 'level',      values: TAG_LEVELS },
  { id: 'series',     values: TAG_SERIES },
  { id: 'difficulty', values: TAG_DIFFICULTY },
  { id: 'technique',  values: TAG_TECHNIQUES },
];

const EMPTY_FILTER = () => ({ level: [], technique: [], series: [], difficulty: [] });

export function createTagFilterBar({ initial, onChange } = {}) {
  const state = {
    filter: normalizeFilter(initial),
    listener: typeof onChange === 'function' ? onChange : () => {},
  };

  const root = document.createElement('div');
  root.className = 'tag-filter-bar';
  root.dataset.testid = 'tag-filter-bar';

  function render() {
    const totalActive = Object.values(state.filter).reduce((n, arr) => n + arr.length, 0);
    root.innerHTML = `
      <div class="tag-filter-bar__header">
        <span class="tag-filter-bar__title">${t('filter.title')}</span>
        <button type="button" class="tag-filter-bar__clear"
          data-testid="tag-filter-clear"
          ${totalActive === 0 ? 'disabled' : ''}>
          ${t('filter.clear')}
        </button>
      </div>
      ${DIMENSIONS.map((dim) => `
        <div class="tag-filter-row" data-dim="${dim.id}" data-testid="tag-filter-row-${dim.id}">
          <span class="tag-filter-row__label">${t('filter.dim.' + dim.id)}</span>
          <div class="tag-filter-row__chips">
            ${dim.values.map((v) => {
              const active = state.filter[dim.id].includes(v);
              return `
                <button type="button"
                  class="tag-chip${active ? ' tag-chip--active' : ''}"
                  data-dim="${dim.id}" data-value="${v}"
                  data-testid="tag-chip-${dim.id}-${v}"
                  aria-pressed="${active ? 'true' : 'false'}">
                  ${t('tag.' + dim.id + '.' + v)}
                </button>`;
            }).join('')}
          </div>
        </div>
      `).join('')}`;

    root.querySelectorAll('[data-dim][data-value]').forEach((btn) => {
      btn.addEventListener('click', () => toggle(btn.dataset.dim, btn.dataset.value));
    });
    root.querySelector('[data-testid="tag-filter-clear"]')?.addEventListener('click', () => clear());
  }

  function toggle(dim, value) {
    const arr = state.filter[dim] ?? [];
    const i = arr.indexOf(value);
    if (i === -1) arr.push(value); else arr.splice(i, 1);
    state.filter[dim] = arr;
    render();
    state.listener(getFilter());
  }

  function clear() {
    state.filter = EMPTY_FILTER();
    render();
    state.listener(getFilter());
  }

  function getFilter() {
    // Return a shallow clone so external consumers can't mutate internal state.
    return {
      level: [...state.filter.level],
      technique: [...state.filter.technique],
      series: [...state.filter.series],
      difficulty: [...state.filter.difficulty],
    };
  }

  function setFilter(next) {
    state.filter = normalizeFilter(next);
    render();
  }

  render();
  return { element: root, getFilter, setFilter, clear };
}

function normalizeFilter(input) {
  const out = EMPTY_FILTER();
  if (!input || typeof input !== 'object') return out;
  for (const dim of ['level', 'technique', 'series', 'difficulty']) {
    const v = input[dim];
    if (Array.isArray(v)) out[dim] = [...v];
  }
  return out;
}

// ── URL query-param sync helpers (used by app.js) ────────────────────

export function filterFromQuery(search) {
  const params = new URLSearchParams(search ?? '');
  const out = EMPTY_FILTER();
  for (const dim of ['level', 'technique', 'series', 'difficulty']) {
    const v = params.get(dim);
    if (v) out[dim] = v.split(',').filter(Boolean);
  }
  return out;
}

export function filterToQuery(filter) {
  const params = new URLSearchParams();
  for (const dim of ['level', 'technique', 'series', 'difficulty']) {
    const arr = filter?.[dim];
    if (Array.isArray(arr) && arr.length > 0) params.set(dim, arr.join(','));
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}
