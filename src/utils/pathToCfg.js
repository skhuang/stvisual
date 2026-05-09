// Map a symbolic / concolic execution branch trace onto a CFG produced by
// `programToGraph.generateControlFlowGraphFromProgram` and produce a small
// SVG canvas highlighting the visited nodes and edges.
//
// Branch trace items use the shape `{ taken: boolean, loop?: boolean, ... }`
// in source order. Each item corresponds to ONE visit of a decision node in
// the CFG. Loops therefore appear multiple times in the trace (one entry per
// iteration plus one final `taken: false` exit).

function nodeOrder(id) {
  // Builder ids: 'S', 'N1', 'N2', ..., 'T'. Larger numeric N# means it was
  // created later in the AST traversal.
  if (id === 'S') return -1;
  if (id === 'T') return Number.POSITIVE_INFINITY;
  const m = /^N(\d+)$/.exec(id);
  return m ? Number(m[1]) : 0;
}

function buildCfgIndex(cfg) {
  const nodeById = new Map();
  for (const n of cfg.nodes) nodeById.set(n.id, n);
  const outgoing = new Map();
  const incoming = new Map();
  for (const n of cfg.nodes) { outgoing.set(n.id, []); incoming.set(n.id, []); }
  for (const e of cfg.edges) {
    outgoing.get(e.from)?.push(e);
    incoming.get(e.to)?.push(e);
  }
  // Loop heads: decision nodes that have an incoming edge from a later-built
  // node. For loops the body's normal exit edges back to the decision and the
  // body is built after the decision, so its N# is strictly greater.
  const loopHeads = new Set();
  for (const n of cfg.nodes) {
    if (n.kind !== 'decision') continue;
    const order = nodeOrder(n.id);
    for (const e of incoming.get(n.id) || []) {
      if (nodeOrder(e.from) > order) { loopHeads.add(n.id); break; }
    }
  }
  return { nodeById, outgoing, loopHeads };
}

export function mapBranchesToCfg(cfg, branches = []) {
  if (!cfg) return { nodes: [], edges: [], decisions: [], unresolved: 0 };
  const { nodeById, outgoing, loopHeads } = buildCfgIndex(cfg);

  const visitedNodes = [];
  const visitedEdges = [];
  const decisions = [];
  const seenNodes = new Set();
  const seenEdges = new Set();

  let current = cfg.startNodeId || 'S';
  let branchIdx = 0;
  let unresolved = 0;
  const HARD_CAP = 4096;

  for (let step = 0; step < HARD_CAP; step += 1) {
    const node = nodeById.get(current);
    if (!node) break;
    if (!seenNodes.has(current)) { seenNodes.add(current); visitedNodes.push(current); }
    if (current === (cfg.endNodeId || 'T')) break;

    const outs = outgoing.get(current) || [];
    if (outs.length === 0) break;

    let chosen;
    if (node.kind === 'decision' && outs.length >= 2) {
      const isLoop = loopHeads.has(current);
      const branch = branches[branchIdx];
      if (!branch) {
        // No more branch info — fall through to the most plausible exit so
        // the path still terminates. For a loop, that's the exit edge; for an
        // if, take the first outgoing edge.
        unresolved += 1;
        chosen = isLoop ? outs[0] : outs[0];
      } else {
        branchIdx += 1;
        const taken = Boolean(branch.taken);
        // For an if-statement the builder emits [consequent, alternate]; for
        // a loop it emits [exit, body].
        const idx = isLoop ? (taken ? 1 : 0) : (taken ? 0 : 1);
        chosen = outs[Math.min(idx, outs.length - 1)];
        decisions.push({ nodeId: current, edgeId: chosen.id, taken, loop: isLoop });
      }
    } else {
      chosen = outs[0];
    }

    if (!chosen) break;
    if (!seenEdges.has(chosen.id)) { seenEdges.add(chosen.id); visitedEdges.push(chosen.id); }
    current = chosen.to;
  }

  return {
    nodes: visitedNodes,
    edges: visitedEdges,
    decisions,
    unresolved,
    truncated: branchIdx < branches.length,
  };
}

// --- Tiny SVG renderer ----------------------------------------------------
// Produces a self-contained <svg> string sized to the CFG's natural bounds.
// Highlighted nodes / edges receive the same active classes used by
// GraphCoverageExplorer (graph-node--active / graph-edge--active) so we can
// rely on existing CSS.

function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function trimToCircle(from, to, radius) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: to.x - (dx / len) * radius, y: to.y - (dy / len) * radius };
}

function computeBounds(cfg, padding = 60) {
  const xs = [], ys = [];
  for (const n of cfg.nodes) {
    xs.push((n.x ?? 0) - 32, (n.x ?? 0) + 32);
    ys.push((n.y ?? 0) - 32, (n.y ?? 0) + 32);
  }
  for (const e of cfg.edges) {
    if (e.control) { xs.push(e.control.x); ys.push(e.control.y); }
  }
  if (!xs.length) return { minX: 0, minY: 0, width: 600, height: 320 };
  const minX = Math.min(...xs) - padding;
  const minY = Math.min(...ys) - padding;
  const maxX = Math.max(...xs) + padding;
  const maxY = Math.max(...ys) + padding;
  return { minX, minY, width: Math.max(560, maxX - minX), height: Math.max(280, maxY - minY) };
}

export function renderCfgSvg(cfg, highlight = {}, options = {}) {
  if (!cfg) return '';
  const idPrefix = options.idPrefix || 'cfg';
  const ariaLabel = options.ariaLabel || 'Control flow graph';
  const activeNodes = new Set(highlight.nodes || []);
  const activeEdges = new Set(highlight.edges || []);
  const { minX, minY, width, height } = computeBounds(cfg);
  const NODE_R = 28;
  const ARROW_GAP = 4;

  const edges = cfg.edges.map((edge) => {
    const fromNode = cfg.nodes.find((n) => n.id === edge.from);
    const toNode = cfg.nodes.find((n) => n.id === edge.to);
    if (!fromNode || !toNode) return '';
    const active = activeEdges.has(edge.id);
    const cls = `graph-edge${active ? ' graph-edge--active' : ''}`;
    const marker = active ? `arrow-active-${idPrefix}` : `arrow-default-${idPrefix}`;
    if (edge.control) {
      const end = trimToCircle(edge.control, toNode, NODE_R + ARROW_GAP);
      const start = trimToCircle(edge.control, fromNode, NODE_R);
      return `<path class="${cls}" d="M ${start.x} ${start.y} Q ${edge.control.x} ${edge.control.y} ${end.x} ${end.y}" marker-end="url(#${marker})" data-testid="${idPrefix}-edge-${edge.id}"></path>`;
    }
    const end = trimToCircle(fromNode, toNode, NODE_R + ARROW_GAP);
    const start = trimToCircle(toNode, fromNode, NODE_R);
    return `<line class="${cls}" x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" marker-end="url(#${marker})" data-testid="${idPrefix}-edge-${edge.id}"></line>`;
  }).join('');

  const nodes = cfg.nodes.map((node) => {
    const active = activeNodes.has(node.id);
    const cls = `graph-node${active ? ' graph-node--active' : ''}`;
    const title = node.sourceLine
      ? `<title>Line ${node.sourceLine}: ${escapeXml(node.sourceText || node.label)}</title>`
      : '';
    return `<g class="${cls}" data-testid="${idPrefix}-node-${node.id}">${title}<circle cx="${node.x}" cy="${node.y}" r="${NODE_R}"></circle><text x="${node.x}" y="${node.y + 5}" text-anchor="middle">${escapeXml(node.label)}</text></g>`;
  }).join('');

  return `
    <svg viewBox="${minX} ${minY} ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escapeXml(ariaLabel)}">
      <defs>
        <marker id="arrow-default-${idPrefix}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 z" fill="#9aa8b6"></path>
        </marker>
        <marker id="arrow-active-${idPrefix}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 z" fill="#ea580c"></path>
        </marker>
      </defs>
      ${edges}
      ${nodes}
    </svg>
  `;
}
