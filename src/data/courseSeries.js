// Named course packs — a curated subset of Explorers a teacher can hand
// out as a self-contained mini-course. Each pack carries a tag filter; the
// concrete Explorer list is derived from EXPLORER_TAGS so packs stay in
// sync with the source of truth.

import { EXPLORER_TAGS, sectionMatchesFilter } from './explorerTags.js';

// Match logic: an Explorer belongs to a pack if its own tags satisfy the
// pack's filter (AND across dims, OR within a dim). Empty arrays act as
// wildcards.
function explorerMatchesFilter(tags, filter) {
  if (!filter) return true;
  for (const dim of ['level', 'technique', 'series', 'difficulty', 'source']) {
    const wanted = filter[dim];
    if (!Array.isArray(wanted) || wanted.length === 0) continue;
    const has = tags[dim];
    if (has === undefined) return false;
    const arr = Array.isArray(has) ? has : [has];
    if (!wanted.some((v) => arr.includes(v))) return false;
  }
  return true;
}

export const COURSE_PACKS = [
  {
    id: 'foundations',
    titleKey: 'pack.foundations.title',
    descKey: 'pack.foundations.desc',
    filter: { series: ['foundations'] },
    // Pedagogical sequence: method map → flow → cost → V-model → types → pyramid.
    order: ['TestingMethodTree', 'TestingFlow', 'DefectCostExplorer',
            'VModelExplorer', 'TestingTypesTable', 'PyramidAdjusterExplorer'],
  },
  {
    id: 'coverage',
    titleKey: 'pack.coverage.title',
    descKey: 'pack.coverage.desc',
    filter: { series: ['coverage-criteria'] },
  },
  {
    id: 'blackbox',
    titleKey: 'pack.blackbox.title',
    descKey: 'pack.blackbox.desc',
    filter: { series: ['blackbox'] },
  },
  {
    id: 'execution',
    titleKey: 'pack.execution.title',
    descKey: 'pack.execution.desc',
    filter: { series: ['execution'] },
  },
  {
    id: 'mutation',
    titleKey: 'pack.mutation.title',
    descKey: 'pack.mutation.desc',
    filter: { technique: ['mutation'] },
  },
  {
    id: 'group-theory',
    titleKey: 'pack.group-theory.title',
    descKey: 'pack.group-theory.desc',
    filter: { series: ['group-theory'] },
  },
  {
    id: 'ai-assisted',
    titleKey: 'pack.ai-assisted.title',
    descKey: 'pack.ai-assisted.desc',
    filter: { series: ['ai-assisted'] },
  },
];

export function getCoursePack(id) {
  return COURSE_PACKS.find((p) => p.id === id) ?? null;
}

// Apply a pack's optional `order`: ids in `order` that are also in
// `matched` come first (in `order` sequence); the rest keep their
// original sequence. Order ids outside `matched` are skipped.
export function applyPackOrder(matched, order) {
  if (!Array.isArray(order) || order.length === 0) return matched;
  const matchedSet = new Set(matched);
  // Dedup `order` first so a repeated id cannot appear twice in the result.
  const pinned = [...new Set(order)].filter((id) => matchedSet.has(id));
  const pinnedSet = new Set(pinned);
  return [...pinned, ...matched.filter((id) => !pinnedSet.has(id))];
}

export function getCoursePackExplorers(id) {
  const pack = getCoursePack(id);
  if (!pack) return [];
  const matched = Object.entries(EXPLORER_TAGS)
    .filter(([, tags]) => explorerMatchesFilter(tags, pack.filter))
    .map(([explorerId]) => explorerId);
  return applyPackOrder(matched, pack.order);
}

// Convenience: which top-level Overview sections a pack covers.
// Used by app.js to apply a pack's filter to TagFilterBar (the filter UI
// works on sections, not raw explorers).
export function getCoursePackFilter(id) {
  return getCoursePack(id)?.filter ?? null;
}

// Re-export the section-level matcher for tests that want to assert
// "this pack ends up showing exactly these sections".
export { sectionMatchesFilter };
