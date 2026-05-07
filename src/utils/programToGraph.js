function summarizeText(text, maxLength = 28) {
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1)}…`;
}

function stripBlockComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

function splitJavascriptFragments(text) {
  const fragments = [];
  let remaining = text.trim();

  if (!remaining) {
    return fragments;
  }

  while (remaining.startsWith('} else if') || remaining.startsWith('} else')) {
    fragments.push('}');
    remaining = remaining.replace(/^}\s*/, '');
  }

  const caseMatch = remaining.match(/^(case\s+.+:|default:)(.+)$/);
  if (caseMatch) {
    fragments.push(caseMatch[1].trim());
    if (caseMatch[2].trim()) {
      fragments.push(caseMatch[2].trim());
    }
    return fragments;
  }

  fragments.push(remaining);
  return fragments;
}

function normalizeJavascriptLines(source) {
  return stripBlockComments(source)
    .split('\n')
    .flatMap((rawLine, index) => {
      const cleaned = rawLine.replace(/\/\/.*$/g, '').trim();

      if (!cleaned) {
        return [];
      }

      return splitJavascriptFragments(cleaned).map((text) => ({
        text,
        lineNumber: index + 1,
        sourceText: cleaned,
      }));
    });
}

function normalizePseudocodeLines(source) {
  return stripBlockComments(source)
    .split('\n')
    .map((rawLine, index) => ({
      text: rawLine.replace(/#.*$/g, '').replace(/\/\/.*$/g, '').trim(),
      lineNumber: index + 1,
      sourceText: rawLine.trim(),
    }))
    .filter((item) => item.text);
}

function extractParenthesizedContent(text) {
  const match = text.match(/^[^(]*\((.*)\)\s*\{?\s*$/);
  return match ? match[1].trim() : '';
}

function createParserState(lines) {
  return { lines, index: 0 };
}

function currentLine(state) {
  return state.lines[state.index] || null;
}

function consumeLine(state) {
  const line = currentLine(state);
  state.index += 1;
  return line;
}

function createAstNode(type, line, extra = {}) {
  return {
    type,
    sourceLine: line?.lineNumber ?? null,
    sourceText: line?.sourceText || line?.text || '',
    ...extra,
  };
}

function isJavascriptStop(line, stopWhen) {
  if (!line) {
    return true;
  }

  return stopWhen.some((token) => {
    if (token === '}') {
      return line.text === '}';
    }

    return line.text.startsWith(token);
  });
}

function parseJavascriptSingleStatement(state) {
  const line = currentLine(state);

  if (!line) {
    return [];
  }

  if (line.text.startsWith('if')) {
    return [parseJavascriptIf(state)];
  }

  if (line.text.startsWith('while')) {
    return [parseJavascriptLoop(state, 'while')];
  }

  if (line.text.startsWith('for')) {
    return [parseJavascriptLoop(state, 'for')];
  }

  if (line.text.startsWith('switch')) {
    return [parseJavascriptSwitch(state)];
  }

  if (line.text.startsWith('return')) {
    consumeLine(state);
    return [createAstNode('return', line, { text: line.text.replace(/;$/, '') })];
  }

  if (line.text.startsWith('break')) {
    consumeLine(state);
    return [createAstNode('break', line, { text: line.text.replace(/;$/, '') })];
  }

  if (line.text.startsWith('continue')) {
    consumeLine(state);
    return [createAstNode('continue', line, { text: line.text.replace(/;$/, '') })];
  }

  consumeLine(state);
  return [createAstNode('statement', line, { text: line.text.replace(/;$/, '') })];
}

function parseJavascriptIf(state) {
  const line = consumeLine(state);
  const condition = extractParenthesizedContent(line.text) || line.text.replace(/^if\s*/, '').replace(/\{$/, '').trim();
  const consequent = line.text.endsWith('{')
    ? parseJavascriptStatements(state)
    : parseJavascriptSingleStatement(state);

  let alternate = [];
  const nextLine = currentLine(state);

  if (nextLine?.text.startsWith('else if')) {
    state.lines[state.index] = { ...nextLine, text: nextLine.text.replace(/^else\s+/, '') };
    alternate = [parseJavascriptIf(state)];
  } else if (nextLine?.text.startsWith('else')) {
    const elseLine = consumeLine(state);
    alternate = elseLine.text.endsWith('{')
      ? parseJavascriptStatements(state)
      : parseJavascriptSingleStatement(state);
  }

  return createAstNode('if', line, {
    condition,
    consequent,
    alternate,
  });
}

function parseJavascriptLoop(state, type) {
  const line = consumeLine(state);
  const condition = extractParenthesizedContent(line.text)
    || line.text.replace(new RegExp(`^${type}\\s*`), '').replace(/\{$/, '').trim();
  const body = line.text.endsWith('{')
    ? parseJavascriptStatements(state)
    : parseJavascriptSingleStatement(state);

  return createAstNode(type, line, {
    condition,
    body,
  });
}

function parseJavascriptSwitch(state) {
  const line = consumeLine(state);
  const expression = extractParenthesizedContent(line.text) || line.text.replace(/^switch\s*/, '').replace(/\{$/, '').trim();
  const cases = [];

  while (state.index < state.lines.length) {
    const nextLine = currentLine(state);

    if (!nextLine) {
      break;
    }

    if (nextLine.text === '}') {
      consumeLine(state);
      break;
    }

    if (/^(case\s+.+:|default:)$/i.test(nextLine.text)) {
      const caseLine = consumeLine(state);
      const isDefault = caseLine.text.startsWith('default:');
      const label = isDefault ? 'default' : caseLine.text.replace(/^case\s+/i, '').replace(/:$/, '').trim();
      const statements = parseJavascriptStatements(state, ['case ', 'default:', '}']);
      cases.push(createAstNode('case', caseLine, {
        label,
        isDefault,
        statements,
      }));
      continue;
    }

    consumeLine(state);
  }

  return createAstNode('switch', line, {
    expression,
    cases,
  });
}

function parseJavascriptStatements(state, stopWhen = ['}']) {
  const statements = [];

  while (state.index < state.lines.length) {
    const line = currentLine(state);

    if (!line) {
      break;
    }

    if (isJavascriptStop(line, stopWhen)) {
      if (line.text === '}') {
        consumeLine(state);
      }
      break;
    }

    if ((line.text.startsWith('function ') || line.text.startsWith('export function ')) && line.text.endsWith('{')) {
      // Emit the header as a node so the parameter list is preserved for
      // data-flow analysis (parameters count as definitions on entry).
      consumeLine(state);
      statements.push(createAstNode('statement', line, {
        text: line.text.replace(/\{$/, '').trim(),
      }));
      statements.push(...parseJavascriptStatements(state));
      continue;
    }

    if (line.text === '{') {
      consumeLine(state);
      statements.push(...parseJavascriptStatements(state));
      continue;
    }

    statements.push(...parseJavascriptSingleStatement(state));
  }

  return statements;
}

function isPseudocodeStop(line, stopWhen) {
  if (!line) {
    return true;
  }

  const upper = line.text.toUpperCase();
  return stopWhen.some((token) => upper.startsWith(token));
}

function parsePseudocodeIf(state) {
  const line = consumeLine(state);
  const condition = line.text.replace(/^IF\s*/i, '').replace(/\s*THEN$/i, '').trim();
  const consequent = parsePseudocodeStatements(state, ['ELSE', 'ELSE IF', 'END IF', 'ENDIF', 'END']);
  let alternate = [];
  const nextLine = currentLine(state);

  if (/^ELSE IF\b/i.test(nextLine?.text || '')) {
    state.lines[state.index] = { ...nextLine, text: nextLine.text.replace(/^ELSE\s+/i, '') };
    alternate = [parsePseudocodeIf(state)];
  } else if (/^ELSE\b/i.test(nextLine?.text || '')) {
    consumeLine(state);
    alternate = parsePseudocodeStatements(state, ['END IF', 'ENDIF', 'END']);
  }

  if (/^(END IF|ENDIF|END)$/i.test(currentLine(state)?.text || '')) {
    consumeLine(state);
  }

  return createAstNode('if', line, {
    condition,
    consequent,
    alternate,
  });
}

function parsePseudocodeLoop(state) {
  const line = consumeLine(state);
  const condition = line.text.replace(/^(WHILE|FOR)\s*/i, '').replace(/\s*DO$/i, '').trim();
  const body = parsePseudocodeStatements(state, ['END WHILE', 'END FOR', 'END']);

  if (/^(END WHILE|END FOR|END)$/i.test(currentLine(state)?.text || '')) {
    consumeLine(state);
  }

  return createAstNode(/^WHILE\b/i.test(line.text) ? 'while' : 'for', line, {
    condition,
    body,
  });
}

function parsePseudocodeStatements(state, stopWhen = []) {
  const statements = [];

  while (state.index < state.lines.length) {
    const line = currentLine(state);

    if (!line || isPseudocodeStop(line, stopWhen)) {
      break;
    }

    if (/^FUNCTION\b/i.test(line.text)) {
      consumeLine(state);
      continue;
    }

    if (/^IF\b/i.test(line.text)) {
      statements.push(parsePseudocodeIf(state));
      continue;
    }

    if (/^(WHILE|FOR)\b/i.test(line.text)) {
      statements.push(parsePseudocodeLoop(state));
      continue;
    }

    if (/^RETURN\b/i.test(line.text)) {
      statements.push(createAstNode('return', consumeLine(state), { text: line.text }));
      continue;
    }

    if (/^BREAK\b/i.test(line.text)) {
      statements.push(createAstNode('break', consumeLine(state), { text: line.text }));
      continue;
    }

    if (/^CONTINUE\b/i.test(line.text)) {
      statements.push(createAstNode('continue', consumeLine(state), { text: line.text }));
      continue;
    }

    statements.push(createAstNode('statement', consumeLine(state), { text: line.text }));
  }

  return statements;
}

function parseStructuredProgram(sourceCode, language) {
  if (!sourceCode.trim()) {
    throw new Error('程式碼內容不能為空。');
  }

  if (language === 'javascript') {
    return parseJavascriptStatements(createParserState(normalizeJavascriptLines(sourceCode)));
  }

  if (language === 'pseudocode') {
    return parsePseudocodeStatements(createParserState(normalizePseudocodeLines(sourceCode)));
  }

  throw new Error(`目前不支援 ${language} 的自動 CFG 產生。`);
}

function createGraphBuilder() {
  return {
    sequence: 0,
    edgeSequence: 0,
    nodes: [{ id: 'S', label: 'Start', kind: 'start' }],
    edges: [],
    terminalNodes: new Set(),
  };
}

function addNode(builder, label, kind = 'node', source = null) {
  builder.sequence += 1;
  const id = `N${builder.sequence}`;
  const node = { id, label: summarizeText(label), kind };

  if (source?.sourceLine) {
    node.sourceLine = source.sourceLine;
    node.sourceText = source.sourceText || '';
  }

  builder.nodes.push(node);
  return id;
}

function addEdge(builder, from, to) {
  builder.edgeSequence += 1;
  builder.edges.push({
    id: `E${builder.edgeSequence}`,
    from,
    to,
  });
}

function buildSequence(builder, statements) {
  let entry = null;
  let normalExits = [];
  let breakExits = [];
  let continueExits = [];

  statements.forEach((statement) => {
    const built = buildStatement(builder, statement);

    if (!entry) {
      entry = built.entry;
    }

    normalExits.forEach((exitId) => {
      addEdge(builder, exitId, built.entry);
    });

    normalExits = [...built.normalExits];
    breakExits = [...breakExits, ...built.breakExits];
    continueExits = [...continueExits, ...built.continueExits];
  });

  return {
    entry,
    normalExits,
    breakExits,
    continueExits,
  };
}

function buildIfStatement(builder, statement) {
  const decisionId = addNode(builder, `${statement.condition}?`, 'decision', statement);
  const consequent = buildSequence(builder, statement.consequent || []);
  const alternate = buildSequence(builder, statement.alternate || []);
  const needsMerge = !alternate.entry || consequent.normalExits.length > 0 || alternate.normalExits.length > 0;
  const mergeId = needsMerge ? addNode(builder, 'Merge') : null;

  if (consequent.entry) {
    addEdge(builder, decisionId, consequent.entry);
  } else if (mergeId) {
    addEdge(builder, decisionId, mergeId);
  }

  if (alternate.entry) {
    addEdge(builder, decisionId, alternate.entry);
  } else if (mergeId) {
    addEdge(builder, decisionId, mergeId);
  }

  consequent.normalExits.forEach((exitId) => {
    if (mergeId) {
      addEdge(builder, exitId, mergeId);
    }
  });

  alternate.normalExits.forEach((exitId) => {
    if (mergeId) {
      addEdge(builder, exitId, mergeId);
    }
  });

  return {
    entry: decisionId,
    normalExits: mergeId ? [mergeId] : [],
    breakExits: [...consequent.breakExits, ...alternate.breakExits],
    continueExits: [...consequent.continueExits, ...alternate.continueExits],
  };
}

function buildLoopStatement(builder, statement) {
  const decisionId = addNode(builder, `${statement.condition}?`, 'decision', statement);
  const body = buildSequence(builder, statement.body || []);
  const mergeId = addNode(builder, 'Loop Exit');

  addEdge(builder, decisionId, mergeId);

  if (body.entry) {
    addEdge(builder, decisionId, body.entry);
    body.normalExits.forEach((exitId) => {
      addEdge(builder, exitId, decisionId);
    });
    body.continueExits.forEach((exitId) => {
      addEdge(builder, exitId, decisionId);
    });
  }

  body.breakExits.forEach((exitId) => {
    addEdge(builder, exitId, mergeId);
  });

  return {
    entry: decisionId,
    normalExits: [mergeId],
    breakExits: [],
    continueExits: [],
  };
}

function buildSwitchStatement(builder, statement) {
  const decisionId = addNode(builder, `switch ${statement.expression}`, 'decision', statement);
  const mergeId = addNode(builder, 'Switch Exit');
  const continueExits = [];

  if (!statement.cases.length) {
    addEdge(builder, decisionId, mergeId);
  }

  statement.cases.forEach((switchCase) => {
    const caseId = addNode(
      builder,
      switchCase.isDefault ? 'default' : `case ${switchCase.label}`,
      'node',
      switchCase
    );
    const built = buildSequence(builder, switchCase.statements || []);

    addEdge(builder, decisionId, caseId);

    if (built.entry) {
      addEdge(builder, caseId, built.entry);
    } else {
      addEdge(builder, caseId, mergeId);
    }

    built.normalExits.forEach((exitId) => {
      addEdge(builder, exitId, mergeId);
    });

    built.breakExits.forEach((exitId) => {
      addEdge(builder, exitId, mergeId);
    });

    continueExits.push(...built.continueExits);
  });

  return {
    entry: decisionId,
    normalExits: [mergeId],
    breakExits: [],
    continueExits,
  };
}

function buildStatement(builder, statement) {
  if (statement.type === 'if') {
    return buildIfStatement(builder, statement);
  }

  if (statement.type === 'while' || statement.type === 'for') {
    return buildLoopStatement(builder, statement);
  }

  if (statement.type === 'switch') {
    return buildSwitchStatement(builder, statement);
  }

  if (statement.type === 'return') {
    const returnId = addNode(builder, statement.text, 'node', statement);
    builder.terminalNodes.add(returnId);
    return {
      entry: returnId,
      normalExits: [],
      breakExits: [],
      continueExits: [],
    };
  }

  if (statement.type === 'break') {
    const breakId = addNode(builder, statement.text, 'node', statement);
    return {
      entry: breakId,
      normalExits: [],
      breakExits: [breakId],
      continueExits: [],
    };
  }

  if (statement.type === 'continue') {
    const continueId = addNode(builder, statement.text, 'node', statement);
    return {
      entry: continueId,
      normalExits: [],
      breakExits: [],
      continueExits: [continueId],
    };
  }

  const statementId = addNode(builder, statement.text, 'node', statement);
  return {
    entry: statementId,
    normalExits: [statementId],
    breakExits: [],
    continueExits: [],
  };
}

function computeDepths(nodes, edges) {
  const adjacency = new Map(nodes.map((node) => [node.id, []]));
  const depths = new Map([['S', 0]]);
  const queue = ['S'];

  edges.forEach((edge) => {
    adjacency.get(edge.from)?.push(edge.to);
  });

  while (queue.length) {
    const current = queue.shift();
    const currentDepth = depths.get(current) || 0;

    (adjacency.get(current) || []).forEach((next) => {
      if (!depths.has(next)) {
        depths.set(next, currentDepth + 1);
        queue.push(next);
      }
    });
  }

  return depths;
}

function assignLayout(nodes, edges) {
  const depths = computeDepths(nodes, edges);
  const incoming = new Map(nodes.map((n) => [n.id, []]));
  const outgoing = new Map(nodes.map((n) => [n.id, []]));
  edges.forEach((e) => {
    if (incoming.has(e.to)) incoming.get(e.to).push(e.from);
    if (outgoing.has(e.from)) outgoing.get(e.from).push(e.to);
  });

  // Group nodes by depth (top-down: depth → y).
  const layers = new Map();
  nodes.forEach((node) => {
    const depth = depths.get(node.id) ?? 0;
    if (!layers.has(depth)) layers.set(depth, []);
    layers.get(depth).push(node);
  });

  const NODE_SPACING_X = 170;   // horizontal gap between siblings
  const LAYER_SPACING_Y = 130;  // vertical gap between layers
  const MARGIN_X = 110;
  const MARGIN_Y = 90;

  const sortedDepths = [...layers.keys()].sort((a, b) => a - b);
  const placed = new Map(); // id → x

  // Initial top-down placement: parent average + collision push.
  for (const depth of sortedDepths) {
    const layer = layers.get(depth);
    layer.forEach((node) => { node.y = MARGIN_Y + depth * LAYER_SPACING_Y; });

    layer.forEach((node, idx) => {
      const preds = (incoming.get(node.id) || []).filter((p) => placed.has(p));
      if (preds.length > 0) {
        const avg = preds.reduce((sum, p) => sum + placed.get(p), 0) / preds.length;
        node.x = avg;
      } else {
        node.x = MARGIN_X + idx * NODE_SPACING_X;
      }
    });

    spreadLayer(layer, NODE_SPACING_X);
    layer.forEach((node) => { placed.set(node.id, node.x); });
  }

  // A few sweeps of barycenter relaxation (Sugiyama-style) to reduce
  // edge crossings: alternately re-centre each node above its
  // predecessors (down sweep) and below its successors (up sweep).
  const SWEEPS = 4;
  for (let s = 0; s < SWEEPS; s++) {
    // Down sweep: re-centre using already-relaxed predecessors.
    for (const depth of sortedDepths) {
      const layer = layers.get(depth);
      layer.forEach((node) => {
        const preds = (incoming.get(node.id) || []).map((p) => placed.get(p)).filter((v) => v !== undefined);
        if (preds.length > 0) node.x = preds.reduce((a, b) => a + b, 0) / preds.length;
      });
      layer.sort((a, b) => a.x - b.x);
      spreadLayer(layer, NODE_SPACING_X);
      layer.forEach((node) => { placed.set(node.id, node.x); });
    }
    // Up sweep: re-centre using successors.
    for (let i = sortedDepths.length - 1; i >= 0; i--) {
      const layer = layers.get(sortedDepths[i]);
      layer.forEach((node) => {
        const succ = (outgoing.get(node.id) || []).map((q) => placed.get(q)).filter((v) => v !== undefined);
        if (succ.length > 0) node.x = succ.reduce((a, b) => a + b, 0) / succ.length;
      });
      layer.sort((a, b) => a.x - b.x);
      spreadLayer(layer, NODE_SPACING_X);
      layer.forEach((node) => { placed.set(node.id, node.x); });
    }
  }

  // Normalise so that the leftmost node sits at MARGIN_X.
  const minX = Math.min(...nodes.map((n) => n.x));
  const shift = MARGIN_X - minX;
  nodes.forEach((n) => { n.x = Math.round(n.x + shift); });

  // Edge routing: curve back-edges, long forward edges, diagonals; fan
  // out multiple edges sharing the same source so their labels and
  // arrows don't sit on top of each other.
  const coordinates = new Map(nodes.map((node) => [node.id, node]));
  const fanOutCounters = new Map();
  const allXs = nodes.map((n) => n.x);
  const layoutMinX = Math.min(...allXs);
  const layoutMaxX = Math.max(...allXs);
  const layoutMidX = (layoutMinX + layoutMaxX) / 2;

  // Pre-collect back-edges so we can stagger them (left vs. right of the
  // graph, multiple offsets) and avoid a single bundle of crossing arcs.
  const backEdges = edges.filter((e) => {
    const a = coordinates.get(e.from);
    const b = coordinates.get(e.to);
    return a && b && b.y <= a.y;
  });
  const backEdgeOrder = new Map();
  // Group back-edges by side (left if both endpoints sit left of centre,
  // otherwise right) and assign a per-side stagger index ordered by
  // vertical span so the largest loop sits furthest from the body.
  const left = [];
  const right = [];
  backEdges.forEach((e) => {
    const a = coordinates.get(e.from);
    const b = coordinates.get(e.to);
    if (Math.max(a.x, b.x) < layoutMidX) left.push(e);
    else right.push(e);
  });
  const sortBySpan = (list) => list.slice().sort((p, q) => {
    const ap = coordinates.get(p.from);
    const aq = coordinates.get(q.from);
    const bp = coordinates.get(p.to);
    const bq = coordinates.get(q.to);
    return Math.abs(ap.y - bp.y) - Math.abs(aq.y - bq.y);
  });
  sortBySpan(left).forEach((e, idx) => backEdgeOrder.set(e, { side: -1, idx }));
  sortBySpan(right).forEach((e, idx) => backEdgeOrder.set(e, { side: 1, idx }));

  edges.forEach((edge) => {
    const fromNode = coordinates.get(edge.from);
    const toNode = coordinates.get(edge.to);
    if (!fromNode || !toNode) return;

    const sibs = outgoing.get(edge.from) || [];
    const sibCount = sibs.length;
    const fanIdx = fanOutCounters.get(edge.from) || 0;
    fanOutCounters.set(edge.from, fanIdx + 1);
    // Symmetric fan: -((n-1)/2) … +((n-1)/2)
    const fan = sibCount > 1 ? (fanIdx - (sibCount - 1) / 2) : 0;
    const FAN_STEP = 28;

    if (toNode.y <= fromNode.y) {
      // Back-edge (loop). Route to whichever side it sits on, and
      // stagger by index so nested / sibling loops don't share an arc.
      const meta = backEdgeOrder.get(edge) || { side: 1, idx: 0 };
      const baseAnchor = meta.side > 0
        ? Math.max(fromNode.x, toNode.x)
        : Math.min(fromNode.x, toNode.x);
      const offset = Math.max(120, Math.abs(toNode.y - fromNode.y) / 2 + 80) + meta.idx * 60;
      let controlX = baseAnchor + meta.side * (offset + fan * FAN_STEP);

      // Push the arc outside any node that sits inside the y-band of
      // this back-edge so the curve doesn't cut through the node body.
      // For a quadratic Bézier P(t) = (1-t)^2*A + 2(1-t)t*C + t^2*B the
      // midpoint sits at (A.x + B.x)/4 + C.x/2; require this midpoint
      // to clear every blocker (node radius ~32 + small buffer).
      const NODE_CLEAR = 32 + 18;
      const yLo = Math.min(fromNode.y, toNode.y);
      const yHi = Math.max(fromNode.y, toNode.y);
      const blockers = nodes.filter((n) => (
        n.id !== edge.from
        && n.id !== edge.to
        && n.y >= yLo - 1
        && n.y <= yHi + 1
      ));
      if (blockers.length) {
        if (meta.side > 0) {
          const limitX = Math.max(...blockers.map((n) => n.x + NODE_CLEAR));
          const requiredCx = 2 * limitX - (fromNode.x + toNode.x) / 2;
          if (controlX < requiredCx) controlX = requiredCx + 24;
        } else {
          const limitX = Math.min(...blockers.map((n) => n.x - NODE_CLEAR));
          const requiredCx = 2 * limitX - (fromNode.x + toNode.x) / 2;
          if (controlX > requiredCx) controlX = requiredCx - 24;
        }
      }

      edge.control = {
        x: controlX,
        y: (fromNode.y + toNode.y) / 2,
      };
    } else if (toNode.y - fromNode.y > LAYER_SPACING_Y * 1.5) {
      // Long forward edge (e.g. break/return → end). Bend to the side.
      edge.control = {
        x: (fromNode.x + toNode.x) / 2 + 80 + fan * FAN_STEP,
        y: (fromNode.y + toNode.y) / 2,
      };
    } else if (sibCount > 1 || Math.abs(toNode.x - fromNode.x) > NODE_SPACING_X * 1.2) {
      // Branch from a decision node OR a diagonal sibling-to-sibling
      // edge. Curve via a midpoint that fans out so the two/three
      // branches separate visibly.
      const midX = (fromNode.x + toNode.x) / 2;
      const midY = fromNode.y + (toNode.y - fromNode.y) * 0.35;
      edge.control = {
        x: midX + fan * FAN_STEP,
        y: midY,
      };
    }
  });
}

function spreadLayer(layer, spacing) {
  // Push siblings rightward to enforce minimum spacing.
  for (let i = 1; i < layer.length; i++) {
    const minX = layer[i - 1].x + spacing;
    if (layer[i].x < minX) layer[i].x = minX;
  }
  // Pull siblings leftward as long as they keep spacing — keeps the
  // layer tight after a barycenter relaxation step.
  for (let i = layer.length - 2; i >= 0; i--) {
    const maxX = layer[i + 1].x - spacing;
    if (layer[i].x > maxX) layer[i].x = maxX;
  }
}

export function generateControlFlowGraphFromProgram({ sourceCode, language, title }) {
  const statements = parseStructuredProgram(sourceCode, language);
  const builder = createGraphBuilder();
  const built = buildSequence(builder, statements);

  builder.nodes.push({ id: 'T', label: 'End', kind: 'end' });

  if (built.entry) {
    addEdge(builder, 'S', built.entry);
  } else {
    addEdge(builder, 'S', 'T');
  }

  built.normalExits.forEach((exitId) => {
    addEdge(builder, exitId, 'T');
  });

  builder.terminalNodes.forEach((terminalId) => {
    addEdge(builder, terminalId, 'T');
  });

  assignLayout(builder.nodes, builder.edges);

  return {
    id: `${(title || 'generated').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-cfg`,
    title: title || 'Generated Control Flow Graph',
    startNodeId: 'S',
    endNodeId: 'T',
    nodes: builder.nodes,
    edges: builder.edges,
  };
}
