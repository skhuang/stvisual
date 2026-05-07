// Lightweight intra-procedural data-flow analyzer.
//
// Input: a CFG produced by programToGraph.js (nodes have `id`, `kind`,
// `sourceText`, `sourceLine`; edges have `id`, `from`, `to`).
// Output:
//   - extractDefUse(node) → { defs: Set<string>, uses: Set<string> }
//   - buildDataFlowGraph(cfg) → { nodes, edges } where each edge is a
//     definition-clear def→use pair (`{ id, from, to, variable }`).
//
// The parser is a small heuristic that recognises the JavaScript-ish
// subset already understood by programToGraph (assignments, ++/--, +=,
// for-init, function parameters in the header). It is intentionally
// conservative: anything it does not recognise as a definition is
// treated as a pure use.

const KEYWORDS = new Set([
  'if', 'else', 'while', 'for', 'do', 'switch', 'case', 'default',
  'break', 'continue', 'return', 'function', 'let', 'const', 'var',
  'true', 'false', 'null', 'undefined', 'new', 'in', 'of', 'typeof',
  'instanceof', 'void', 'this', 'try', 'catch', 'throw', 'finally',
  'class', 'extends', 'import', 'from', 'export', 'yield', 'async',
  'await', 'and', 'or', 'not', 'then', 'end', 'do',
]);

const IDENT_RE = /[A-Za-z_][A-Za-z0-9_]*/g;

function tokensIn(text) {
  const found = [];
  for (const m of text.matchAll(IDENT_RE)) {
    if (!KEYWORDS.has(m[0])) found.push(m[0]);
  }
  return found;
}

function stripStringsAndComments(text) {
  return String(text)
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*$/g, ' ')
    .replace(/"(?:[^"\\]|\\.)*"/g, ' ""')
    .replace(/'(?:[^'\\]|\\.)*'/g, " ''")
    .replace(/`(?:[^`\\]|\\.)*`/g, ' ``');
}

/**
 * Heuristically extract definitions and uses for a single CFG-node line.
 * @param {{ kind?: string, sourceText?: string, label?: string }} node
 * @returns {{ defs: Set<string>, uses: Set<string> }}
 */
export function extractDefUse(node) {
  const defs = new Set();
  const uses = new Set();
  if (!node) return { defs, uses };

  const raw = node.sourceText || node.label || '';
  const text = stripStringsAndComments(raw);

  // Function parameters as definitions on the entry line.
  const fn = text.match(/function\s+[A-Za-z_][\w]*\s*\(([^)]*)\)/)
    || text.match(/\(([^)]*)\)\s*=>/);
  if (fn) {
    for (const p of fn[1].split(',').map((s) => s.trim()).filter(Boolean)) {
      const name = p.replace(/=.*$/, '').trim();
      if (name && !KEYWORDS.has(name)) defs.add(name);
    }
    for (const u of tokensIn(text.replace(/function\s+[A-Za-z_][\w]*/, ''))) uses.add(u);
    for (const d of defs) uses.delete(d);
    return { defs, uses };
  }

  // for ( init ; cond ; update )
  const forMatch = text.match(/for\s*\(([^;]*);([^;]*);([^)]*)\)/);
  if (forMatch) {
    const [, init, cond, upd] = forMatch;
    collectAssignment(init, defs, uses);
    for (const u of tokensIn(cond)) uses.add(u);
    collectAssignment(upd, defs, uses);
    return { defs, uses };
  }

  // Plain assignment(s) on a single line, including `let x = …`.
  const matched = collectAssignment(text, defs, uses);

  // Anything else is treated as a pure use (conditions, return, calls…).
  if (!matched) {
    for (const u of tokensIn(text)) uses.add(u);
  }
  return { defs, uses };
}

function collectAssignment(text, defs, uses) {
  if (!text) return false;
  // `let a = b + c`, `a = b`, `a += b`, `a++`, `a--`
  // Match a single (non-property) lvalue followed by an assignment op.
  const incDec = text.match(/^[\s(]*([A-Za-z_][\w]*)\s*(\+\+|--)/);
  if (incDec) {
    defs.add(incDec[1]);
    uses.add(incDec[1]);
    return true;
  }
  const compound = text.match(
    /^[\s(]*([A-Za-z_][\w]*)\s*(?:\+|-|\*|\/|%|&|\||\^|<<|>>|>>>)=(.*)$/,
  );
  if (compound) {
    const [, name, rhs] = compound;
    if (!KEYWORDS.has(name)) {
      defs.add(name);
      uses.add(name); // compound: lvalue is also a use
    }
    for (const u of tokensIn(rhs)) uses.add(u);
    return true;
  }
  const assign = text.match(
    /^[\s(]*(?:let\s+|const\s+|var\s+)?([A-Za-z_][\w]*)\s*=(?!=)(.*)$/,
  );
  if (assign) {
    const [, name, rhs] = assign;
    if (!KEYWORDS.has(name)) defs.add(name);
    for (const u of tokensIn(rhs)) uses.add(u);
    // Strip the freshly-defined name from uses (RHS may not reference it).
    if (!KEYWORDS.has(name)) uses.delete(name);
    return true;
  }
  return false;
}

/**
 * Build the data-flow graph (definition-clear def→use edges) for a CFG.
 * @param {{ nodes: Array, edges: Array, startNodeId?: string }} cfg
 * @returns {{ nodes: Array, edges: Array<{id:string,from:string,to:string,variable:string}>, defUseByNode: Map }}
 */
export function buildDataFlowGraph(cfg) {
  const out = { nodes: cfg?.nodes || [], edges: [], defUseByNode: new Map() };
  if (!cfg?.nodes?.length) return out;

  // Predecessor map.
  const preds = new Map(cfg.nodes.map((n) => [n.id, []]));
  for (const e of cfg.edges || []) {
    if (preds.has(e.to)) preds.get(e.to).push(e.from);
  }

  // Per-node defs/uses.
  for (const n of cfg.nodes) out.defUseByNode.set(n.id, extractDefUse(n));

  const seenEdges = new Set();
  for (const useNode of cfg.nodes) {
    const { uses } = out.defUseByNode.get(useNode.id);
    for (const v of uses) {
      // Walk predecessors to find every definition-clear def of `v`.
      const visited = new Set([useNode.id]);
      const stack = [...preds.get(useNode.id)];
      while (stack.length) {
        const cur = stack.pop();
        if (visited.has(cur)) continue;
        visited.add(cur);
        const du = out.defUseByNode.get(cur);
        if (du && du.defs.has(v)) {
          const id = `du-${cur}-${useNode.id}-${v}`;
          if (!seenEdges.has(id)) {
            seenEdges.add(id);
            out.edges.push({ id, from: cur, to: useNode.id, variable: v });
          }
          continue; // Stop: this path's def is killed by `cur`.
        }
        for (const p of preds.get(cur) || []) stack.push(p);
      }
    }
  }
  return out;
}
