// Pure render helper for the Program Dependence Graph view used by the
// slice-based testing explorer. No DOM APIs — returns an HTML string.
// Mirror the string-building style of renderCfgSvg in src/utils/pathToCfg.js.

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

// Source lines only need & and < escaped (> is safe in HTML text content and
// the tests only pre-process & and < when building expected strings).
function escapeSourceLine(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;');
}

function escapeAttr(value = '') {
  return escapeHtml(value).replaceAll('"', '&quot;');
}

// Build a map from line number -> statement id for fast lookup.
function buildLineIndex(statements) {
  const map = new Map();
  for (const stmt of statements) {
    map.set(stmt.line, stmt.id);
  }
  return map;
}

// --- Source listing -----------------------------------------------------------

function renderSourceListing(example, sliceSet) {
  const lineIndex = buildLineIndex(example.statements);
  const stmtById = new Map(example.statements.map((s) => [s.id, s]));
  const items = example.source.map((rawLine, i) => {
    const lineNum = i + 1; // source is 0-indexed array, lines are 1-indexed
    const stmtId = lineIndex.get(lineNum);
    const escaped = escapeSourceLine(rawLine);
    if (stmtId) {
      const inSlice = sliceSet.has(stmtId);
      const cls = `slice-stmt${inSlice ? ' slice-stmt--in' : ''}`;
      // data-stmt must come before class so the regex /data-stmt="..."[^>]*slice-stmt--in/ matches
      return `<li data-stmt="${escapeAttr(stmtId)}" class="${cls}">${escaped}</li>`;
    }
    return `<li>${escaped}</li>`;
  });
  return `<ol class="slice-code">\n${items.join('\n')}\n</ol>`;
}

// --- SVG dependence graph -----------------------------------------------------

const NODE_R = 22;
const SVG_X = 120;        // all nodes share a fixed x
const SVG_Y_START = 50;   // y of first node
const SVG_Y_STEP = 60;    // vertical spacing between nodes
const SVG_PAD = 40;

function nodePos(index) {
  return { x: SVG_X, y: SVG_Y_START + index * SVG_Y_STEP };
}

function trimToCircle(from, to, radius) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: to.x - (dx / len) * radius, y: to.y - (dy / len) * radius };
}

function renderPdgSvg(example, sliceSet, idPrefix) {
  const stmts = example.statements;
  const indexById = new Map(stmts.map((s, i) => [s.id, i]));

  // Pre-compute positions
  const positions = new Map(stmts.map((s, i) => [s.id, nodePos(i)]));

  const svgWidth = SVG_X * 2 + SVG_PAD;
  const svgHeight = SVG_Y_START + stmts.length * SVG_Y_STEP + SVG_PAD;

  // Control-dep edges (solid)
  const controlEdges = (example.controlDeps || []).map(([from, to]) => {
    const fPos = positions.get(from);
    const tPos = positions.get(to);
    if (!fPos || !tPos) return '';
    // Use a slight horizontal offset so edges don't overlap node circles
    const ARROW_GAP = 4;
    // For a straight line between same-x nodes, offset x by a small amount
    const offsetX = 30;
    const cpX = SVG_X + offsetX;
    const cpY = (fPos.y + tPos.y) / 2;
    // Quadratic bezier start/end trimmed to circle border
    const startTrimmed = trimToCircle({ x: cpX, y: cpY }, fPos, NODE_R);
    const endTrimmed = trimToCircle({ x: cpX, y: cpY }, tPos, NODE_R + ARROW_GAP);
    const marker = `url(#pdg-arrow-ctrl-${escapeAttr(idPrefix)})`;
    return `<path class="pdg-edge pdg-edge--control" d="M ${startTrimmed.x} ${startTrimmed.y} Q ${cpX} ${cpY} ${endTrimmed.x} ${endTrimmed.y}" marker-end="${marker}"></path>`;
  }).join('');

  // Data-dep edges (dashed)
  const dataEdges = (example.dataDeps || []).map(([from, to, variable]) => {
    const fPos = positions.get(from);
    const tPos = positions.get(to);
    if (!fPos || !tPos) return '';
    const ARROW_GAP = 4;
    const offsetX = -30;
    const cpX = SVG_X + offsetX;
    const cpY = (fPos.y + tPos.y) / 2;
    const startTrimmed = trimToCircle({ x: cpX, y: cpY }, fPos, NODE_R);
    const endTrimmed = trimToCircle({ x: cpX, y: cpY }, tPos, NODE_R + ARROW_GAP);
    const marker = `url(#pdg-arrow-data-${escapeAttr(idPrefix)})`;
    const varLabel = variable ? escapeHtml(variable) : '';
    return `<path class="pdg-edge pdg-edge--data" stroke-dasharray="5,3" d="M ${startTrimmed.x} ${startTrimmed.y} Q ${cpX} ${cpY} ${endTrimmed.x} ${endTrimmed.y}" marker-end="${marker}"><title>${varLabel}</title></path>`;
  }).join('');

  // Nodes
  const nodes = stmts.map((stmt) => {
    const pos = positions.get(stmt.id);
    const inSlice = sliceSet.has(stmt.id);
    const cls = `pdg-node${inSlice ? ' pdg-node--in' : ''}`;
    const label = escapeHtml(stmt.id);
    const title = `<title>${escapeHtml(stmt.text)}</title>`;
    return `<g class="${cls}" data-pdg-node="${escapeAttr(stmt.id)}">${title}<circle cx="${pos.x}" cy="${pos.y}" r="${NODE_R}"></circle><text x="${pos.x}" y="${pos.y + 5}" text-anchor="middle">${label}</text></g>`;
  }).join('');

  return `<svg class="pdg-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Program dependence graph">
  <defs>
    <marker id="pdg-arrow-ctrl-${escapeAttr(idPrefix)}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
      <path d="M0,0 L7,3.5 L0,7 z" fill="#64748b"></path>
    </marker>
    <marker id="pdg-arrow-data-${escapeAttr(idPrefix)}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
      <path d="M0,0 L7,3.5 L0,7 z" fill="#0ea5e9"></path>
    </marker>
  </defs>
  ${controlEdges}
  ${dataEdges}
  ${nodes}
</svg>`;
}

// --- Public API ---------------------------------------------------------------

/**
 * renderSlicePdgView(example, sliceSet, options)
 *
 * Returns an HTML string containing:
 *   1. An <ol class="slice-code"> with the source listing; statements in
 *      `sliceSet` get class `slice-stmt--in` and a `data-stmt` attribute.
 *   2. An inline <svg> PDG where each node carries `data-pdg-node`; nodes in
 *      `sliceSet` get class `pdg-node--in`.
 *
 * @param {object}  example   - A SLICING_EXAMPLES entry
 * @param {Set}     sliceSet  - Set of statement ids currently in the slice
 * @param {object}  [options]
 * @param {string}  [options.idPrefix='slice'] - Namespace for SVG marker ids
 * @returns {string}
 */
export function renderSlicePdgView(example, sliceSet, options = {}) {
  const idPrefix = options.idPrefix || 'slice';
  const listing = renderSourceListing(example, sliceSet);
  const svg = renderPdgSvg(example, sliceSet, idPrefix);
  return `<div class="slice-pdg-view">\n${listing}\n${svg}\n</div>`;
}
