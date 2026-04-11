function summarizeText(text, maxLength = 26) {
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1)}…`;
}

function stripBlockComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

function normalizeJavascriptLines(source) {
  return stripBlockComments(source)
    .replace(/}\s*else\s+if/g, '}\nelse if')
    .replace(/}\s*else/g, '}\nelse')
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/g, '').trim())
    .filter(Boolean);
}

function normalizePseudocodeLines(source) {
  return stripBlockComments(source)
    .split('\n')
    .map((line) => line.replace(/#.*$/g, '').replace(/\/\/.*$/g, '').trim())
    .filter(Boolean);
}

function extractParenthesizedContent(line) {
  const match = line.match(/^[^(]*\((.*)\)\s*\{?\s*$/);
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

function parseJavascriptSingleStatement(state) {
  const line = currentLine(state);

  if (!line) {
    return [];
  }

  if (line.startsWith('if')) {
    return [parseJavascriptIf(state)];
  }

  if (line.startsWith('while')) {
    return [parseJavascriptWhile(state)];
  }

  if (line.startsWith('for')) {
    return [parseJavascriptFor(state)];
  }

  if (line.startsWith('return')) {
    consumeLine(state);
    return [{ type: 'return', text: line.replace(/;$/, '') }];
  }

  consumeLine(state);
  return [{ type: 'statement', text: line.replace(/;$/, '') }];
}

function parseJavascriptBlock(state) {
  const line = currentLine(state);

  if (!line) {
    return [];
  }

  if (line === '{') {
    consumeLine(state);
    return parseJavascriptStatements(state);
  }

  if (line.endsWith('{')) {
    return parseJavascriptStatements(state);
  }

  return parseJavascriptSingleStatement(state);
}

function parseJavascriptIf(state) {
  const line = consumeLine(state);
  const condition = extractParenthesizedContent(line) || line.replace(/^if\s*/, '').replace(/\{$/, '').trim();
  const consequent = line.endsWith('{') ? parseJavascriptStatements(state) : parseJavascriptSingleStatement(state);

  let alternate = [];
  const nextLine = currentLine(state);

  if (nextLine?.startsWith('else if')) {
    state.lines[state.index] = nextLine.replace(/^else\s+/, '');
    alternate = [parseJavascriptIf(state)];
  } else if (nextLine?.startsWith('else')) {
    const elseLine = consumeLine(state);
    alternate = elseLine.endsWith('{') ? parseJavascriptStatements(state) : parseJavascriptSingleStatement(state);
  }

  return {
    type: 'if',
    condition,
    consequent,
    alternate,
  };
}

function parseJavascriptWhile(state) {
  const line = consumeLine(state);
  const condition = extractParenthesizedContent(line) || line.replace(/^while\s*/, '').replace(/\{$/, '').trim();
  const body = line.endsWith('{') ? parseJavascriptStatements(state) : parseJavascriptSingleStatement(state);

  return {
    type: 'while',
    condition,
    body,
  };
}

function parseJavascriptFor(state) {
  const line = consumeLine(state);
  const condition = extractParenthesizedContent(line) || line.replace(/^for\s*/, '').replace(/\{$/, '').trim();
  const body = line.endsWith('{') ? parseJavascriptStatements(state) : parseJavascriptSingleStatement(state);

  return {
    type: 'for',
    condition,
    body,
  };
}

function parseJavascriptStatements(state) {
  const statements = [];

  while (state.index < state.lines.length) {
    const line = currentLine(state);

    if (!line) {
      break;
    }

    if (line === '}') {
      consumeLine(state);
      break;
    }

    if (line.startsWith('else')) {
      break;
    }

    if ((line.startsWith('function ') || line.startsWith('export function ')) && line.endsWith('{')) {
      consumeLine(state);
      statements.push(...parseJavascriptStatements(state));
      continue;
    }

    if (line === '{') {
      consumeLine(state);
      statements.push(...parseJavascriptStatements(state));
      continue;
    }

    if (line.startsWith('if')) {
      statements.push(parseJavascriptIf(state));
      continue;
    }

    if (line.startsWith('while')) {
      statements.push(parseJavascriptWhile(state));
      continue;
    }

    if (line.startsWith('for')) {
      statements.push(parseJavascriptFor(state));
      continue;
    }

    if (line.startsWith('return')) {
      statements.push({ type: 'return', text: consumeLine(state).replace(/;$/, '') });
      continue;
    }

    statements.push({ type: 'statement', text: consumeLine(state).replace(/;$/, '') });
  }

  return statements;
}

function parsePseudocodeSingleStatement(state) {
  const line = currentLine(state);

  if (!line) {
    return [];
  }

  if (/^IF\b/i.test(line)) {
    return [parsePseudocodeIf(state)];
  }

  if (/^(WHILE|FOR)\b/i.test(line)) {
    return [parsePseudocodeLoop(state)];
  }

  if (/^RETURN\b/i.test(line)) {
    consumeLine(state);
    return [{ type: 'return', text: line }];
  }

  consumeLine(state);
  return [{ type: 'statement', text: line }];
}

function parsePseudocodeIf(state) {
  const line = consumeLine(state);
  const condition = line.replace(/^IF\s*/i, '').replace(/\s*THEN$/i, '').trim();
  const consequent = parsePseudocodeStatements(state, ['ELSE', 'ELSE IF', 'END IF', 'ENDIF', 'END']);
  let alternate = [];
  const nextLine = currentLine(state);

  if (/^ELSE IF\b/i.test(nextLine || '')) {
    state.lines[state.index] = nextLine.replace(/^ELSE\s+/i, '');
    alternate = [parsePseudocodeIf(state)];
  } else if (/^ELSE\b/i.test(nextLine || '')) {
    consumeLine(state);
    alternate = parsePseudocodeStatements(state, ['END IF', 'ENDIF', 'END']);
  }

  if (/^(END IF|ENDIF|END)$/i.test(currentLine(state) || '')) {
    consumeLine(state);
  }

  return {
    type: 'if',
    condition,
    consequent,
    alternate,
  };
}

function parsePseudocodeLoop(state) {
  const line = consumeLine(state);
  const condition = line.replace(/^(WHILE|FOR)\s*/i, '').replace(/\s*DO$/i, '').trim();
  const body = parsePseudocodeStatements(state, ['END WHILE', 'END FOR', 'END']);

  if (/^(END WHILE|END FOR|END)$/i.test(currentLine(state) || '')) {
    consumeLine(state);
  }

  return {
    type: /^WHILE\b/i.test(line) ? 'while' : 'for',
    condition,
    body,
  };
}

function parsePseudocodeStatements(state, stopTokens = []) {
  const statements = [];

  while (state.index < state.lines.length) {
    const line = currentLine(state);

    if (!line) {
      break;
    }

    const upper = line.toUpperCase();
    if (stopTokens.some((token) => upper.startsWith(token))) {
      break;
    }

    if (/^FUNCTION\b/i.test(line)) {
      consumeLine(state);
      continue;
    }

    if (/^IF\b/i.test(line)) {
      statements.push(parsePseudocodeIf(state));
      continue;
    }

    if (/^(WHILE|FOR)\b/i.test(line)) {
      statements.push(parsePseudocodeLoop(state));
      continue;
    }

    if (/^RETURN\b/i.test(line)) {
      statements.push({ type: 'return', text: consumeLine(state) });
      continue;
    }

    statements.push({ type: 'statement', text: consumeLine(state) });
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

function createGraphBuilder(title) {
  return {
    title,
    sequence: 0,
    nodes: [{ id: 'S', label: 'Start', kind: 'start' }],
    edges: [],
    terminalNodes: [],
  };
}

function addNode(builder, label, kind = 'node') {
  builder.sequence += 1;
  const id = `N${builder.sequence}`;

  builder.nodes.push({
    id,
    label: summarizeText(label),
    kind,
  });

  return id;
}

function addEdge(builder, from, to) {
  builder.edges.push({
    id: `${from}-${to}-${builder.edges.length + 1}`,
    from,
    to,
  });
}

function buildSequence(builder, statements) {
  let entry = null;
  let exits = [];

  statements.forEach((statement) => {
    const built = buildStatement(builder, statement);

    if (!entry) {
      entry = built.entry;
    }

    exits.forEach((exitId) => {
      addEdge(builder, exitId, built.entry);
    });

    exits = [...built.exits];
  });

  return { entry, exits };
}

function buildIfStatement(builder, statement) {
  const decisionId = addNode(builder, `${statement.condition}?`, 'decision');
  const consequent = buildSequence(builder, statement.consequent);
  const alternate = buildSequence(builder, statement.alternate || []);
  const needsMerge = consequent.exits.length > 0 || alternate.exits.length > 0 || !statement.alternate?.length;
  const mergeId = needsMerge ? addNode(builder, 'Merge', 'node') : null;

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

  consequent.exits.forEach((exitId) => {
    if (mergeId) {
      addEdge(builder, exitId, mergeId);
    }
  });

  alternate.exits.forEach((exitId) => {
    if (mergeId) {
      addEdge(builder, exitId, mergeId);
    }
  });

  return {
    entry: decisionId,
    exits: mergeId ? [mergeId] : [],
  };
}

function buildLoopStatement(builder, statement) {
  const decisionId = addNode(builder, `${statement.condition}?`, 'decision');
  const body = buildSequence(builder, statement.body || []);
  const mergeId = addNode(builder, 'Loop Exit', 'node');

  if (body.entry) {
    addEdge(builder, decisionId, body.entry);
    body.exits.forEach((exitId) => {
      addEdge(builder, exitId, decisionId);
    });
  } else {
    addEdge(builder, decisionId, decisionId);
  }

  addEdge(builder, decisionId, mergeId);

  return {
    entry: decisionId,
    exits: [mergeId],
  };
}

function buildStatement(builder, statement) {
  if (statement.type === 'if') {
    return buildIfStatement(builder, statement);
  }

  if (statement.type === 'while' || statement.type === 'for') {
    return buildLoopStatement(builder, statement);
  }

  if (statement.type === 'return') {
    const returnId = addNode(builder, statement.text, 'node');
    builder.terminalNodes.push(returnId);
    return {
      entry: returnId,
      exits: [],
    };
  }

  const statementId = addNode(builder, statement.text, 'node');
  return {
    entry: statementId,
    exits: [statementId],
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
  const grouped = new Map();

  nodes.forEach((node) => {
    const depth = depths.get(node.id) ?? 1;
    if (!grouped.has(depth)) {
      grouped.set(depth, []);
    }
    grouped.get(depth).push(node);
  });

  Array.from(grouped.entries()).forEach(([depth, group]) => {
    group.forEach((node, index) => {
      node.x = 90 + depth * 150;
      node.y = 90 + index * 100;
    });
  });

  const coordinates = new Map(nodes.map((node) => [node.id, node]));
  edges.forEach((edge) => {
    const fromNode = coordinates.get(edge.from);
    const toNode = coordinates.get(edge.to);

    if (fromNode && toNode && toNode.x <= fromNode.x) {
      edge.control = {
        x: Math.round((fromNode.x + toNode.x) / 2),
        y: Math.min(fromNode.y, toNode.y) - 70,
      };
    }
  });
}

export function generateControlFlowGraphFromProgram({ sourceCode, language, title }) {
  const statements = parseStructuredProgram(sourceCode, language);
  const builder = createGraphBuilder(title || 'Generated Control Flow Graph');
  const built = buildSequence(builder, statements);

  builder.nodes.push({ id: 'T', label: 'End', kind: 'end' });

  if (built.entry) {
    addEdge(builder, 'S', built.entry);
  } else {
    addEdge(builder, 'S', 'T');
  }

  built.exits.forEach((exitId) => {
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