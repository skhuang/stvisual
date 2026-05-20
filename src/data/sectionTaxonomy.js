// Single source of truth for the 8-category course taxonomy.
// Section ids (e.g., 'blackbox', 'tdd') are stable identifiers — URLs,
// anchors, tests, and deck mappings depend on them. Categories are a
// display-layer grouping above sections.
//
// Pedagogical axis: test-criterion source (Ammann & Offutt). See
// docs/superpowers/specs/2026-05-20-section-taxonomy-design.md.

export const SECTION_TAXONOMY = [
  { id: 'foundations',  labelKey: 'taxonomy.foundations',
    sectionIds: ['methods', 'flow', 'types', 'codecov'] },
  { id: 'input-space',  labelKey: 'taxonomy.input-space',
    sectionIds: ['blackbox', 'pbt'] },
  { id: 'graph-model',  labelKey: 'taxonomy.graph-model',
    sectionIds: ['graph', 'mbt', 'slicing'] },
  { id: 'logic',        labelKey: 'taxonomy.logic',
    sectionIds: ['logic', 'groupth'] },
  { id: 'syntax',       labelKey: 'taxonomy.syntax',
    sectionIds: ['syntax'] },
  { id: 'generation',   labelKey: 'taxonomy.generation',
    sectionIds: ['symbex', 'concolic', 'fuzz', 'testgen'] },
  { id: 'process',      labelKey: 'taxonomy.process',
    sectionIds: ['tdd', 'acceptance', 'agile', 'inttest'] },
  { id: 'strategy',     labelKey: 'taxonomy.strategy',
    sectionIds: ['advanced', 'rbt'] },
];

// Flat section-id order derived from the taxonomy. Drives nav-button order
// and the <section> DOM order in app.js. The 'all' meta-section is
// prepended separately by app.js (it is not a real section, it represents
// the overview page).
export const SECTION_ORDER = SECTION_TAXONOMY.flatMap((c) => c.sectionIds);
