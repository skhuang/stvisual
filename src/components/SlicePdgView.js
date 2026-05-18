// Pure render helpers for the Program Dependence Graph view used by the
// slice-based testing explorers. No DOM APIs — every function returns an
// HTML string. Mirror the string-building style of renderCfgSvg in
// src/utils/pathToCfg.js.

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

/**
 * renderSliceCodeListing(example, sliceSet)
 * The source code as an <ol class="slice-code">; statements in `sliceSet`
 * get class `slice-stmt--in` and every statement line carries `data-stmt`.
 */
export function renderSliceCodeListing(example, sliceSet, options = {}) {
  const secondary = options.secondary || new Set();
  const lineIndex = buildLineIndex(example.statements);
  const items = example.source.map((rawLine, i) => {
    const lineNum = i + 1; // source is 0-indexed array, lines are 1-indexed
    const stmtId = lineIndex.get(lineNum);
    const escaped = escapeSourceLine(rawLine);
    if (stmtId) {
      let cls;
      if (sliceSet.has(stmtId)) {
        cls = 'slice-stmt slice-stmt--in';
      } else if (secondary.has(stmtId)) {
        cls = 'slice-stmt slice-stmt--ctx';
      } else {
        cls = 'slice-stmt';
      }
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

/**
 * renderSlicePdgGraph(example, sliceSet, options)
 * Just the inline <svg> dependence graph. Each node carries `data-pdg-node`;
 * nodes in `sliceSet` get class `pdg-node--in`. Control-dep edges are solid,
 * data-dep edges dashed.
 *
 * @param {object} [options]
 * @param {string} [options.idPrefix='slice'] - Namespace for SVG marker ids
 * @param {number} [options.zoom=1] - Width multiplier; at zoom>1 the svg
 *   overflows its container (which should scroll), mirroring renderCfgSvg.
 */
export function renderSlicePdgGraph(example, sliceSet, options = {}) {
  const idPrefix = options.idPrefix || 'slice';
  const zoom = Number.isFinite(options.zoom) && options.zoom > 0 ? options.zoom : 1;
  const secondary = options.secondary || new Set();
  const stmts = example.statements;
  const positions = new Map(stmts.map((s, i) => [s.id, nodePos(i)]));

  const svgWidth = SVG_X * 2 + SVG_PAD;
  const svgHeight = SVG_Y_START + stmts.length * SVG_Y_STEP + SVG_PAD;

  // Control-dep edges (solid)
  const controlEdges = (example.controlDeps || []).map(([from, to]) => {
    const fPos = positions.get(from);
    const tPos = positions.get(to);
    if (!fPos || !tPos) return '';
    const ARROW_GAP = 4;
    const offsetX = 30;
    const cpX = SVG_X + offsetX;
    const cpY = (fPos.y + tPos.y) / 2;
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
    let cls;
    if (sliceSet.has(stmt.id)) {
      cls = 'pdg-node pdg-node--in';
    } else if (secondary.has(stmt.id)) {
      cls = 'pdg-node pdg-node--ctx';
    } else {
      cls = 'pdg-node';
    }
    const label = escapeHtml(stmt.id);
    const title = `<title>${escapeHtml(stmt.text)}</title>`;
    return `<g data-pdg-node="${escapeAttr(stmt.id)}" class="${cls}">${title}<circle cx="${pos.x}" cy="${pos.y}" r="${NODE_R}"></circle><text x="${pos.x}" y="${pos.y + 5}" text-anchor="middle">${label}</text></g>`;
  }).join('');

  // At zoom=1 the svg fills 100% of its container; at zoom>1 it renders wider
  // so the container scrolls — same approach as renderCfgSvg.
  const widthStyle = `width:${Math.round(zoom * 100)}%;height:auto;`;

  return `<svg class="pdg-svg" style="${widthStyle}" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Program dependence graph">
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
 * Convenience wrapper: the source listing followed by the PDG graph, inside a
 * single `slice-pdg-view` container. Kept for callers that want both pieces
 * together; the explorer composes the pieces itself for a custom layout.
 *
 * @param {object}  example   - A SLICING_EXAMPLES entry
 * @param {Set}     sliceSet  - Set of statement ids currently in the slice
 * @param {object}  [options] - Passed through to renderSlicePdgGraph
 * @returns {string}
 */
export function renderSlicePdgView(example, sliceSet, options = {}) {
  const listing = renderSliceCodeListing(example, sliceSet, options);
  const svg = renderSlicePdgGraph(example, sliceSet, options);
  return `<div class="slice-pdg-view">\n${listing}\n${svg}\n</div>`;
}
