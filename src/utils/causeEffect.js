/**
 * Boolean formula parser and evaluator for Cause-Effect Graphing.
 * Supported syntax:  C1, C2, ..., NOT, AND, OR, ( )
 * Precedence: NOT > AND > OR  (standard logic)
 */

function tokenize(str) {
  const tokens = [];
  let i = 0;
  while (i < str.length) {
    if (/\s/.test(str[i])) { i++; continue; }
    if (str[i] === '(') { tokens.push({ type: 'LPAREN' }); i++; }
    else if (str[i] === ')') { tokens.push({ type: 'RPAREN' }); i++; }
    else {
      let word = '';
      while (i < str.length && /[\w]/.test(str[i])) word += str[i++];
      if (word === 'AND') tokens.push({ type: 'AND' });
      else if (word === 'OR')  tokens.push({ type: 'OR' });
      else if (word === 'NOT') tokens.push({ type: 'NOT' });
      else if (word)           tokens.push({ type: 'ATOM', value: word });
    }
  }
  return tokens;
}

function buildParser(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  function primary() {
    const t = peek();
    if (!t) throw new Error('Unexpected end of expression');
    if (t.type === 'LPAREN') {
      consume();
      const node = expr();
      if (peek()?.type !== 'RPAREN') throw new Error('Expected )');
      consume();
      return node;
    }
    if (t.type === 'ATOM') { consume(); return { type: 'ATOM', value: t.value }; }
    throw new Error(`Unexpected token: ${t.type}`);
  }

  function notExpr() {
    if (peek()?.type === 'NOT') { consume(); return { type: 'NOT', child: notExpr() }; }
    return primary();
  }

  function andExpr() {
    let left = notExpr();
    while (peek()?.type === 'AND') { consume(); left = { type: 'AND', left, right: notExpr() }; }
    return left;
  }

  function expr() {
    let left = andExpr();
    while (peek()?.type === 'OR') { consume(); left = { type: 'OR', left, right: andExpr() }; }
    return left;
  }

  return expr();
}

function evalNode(node, env) {
  if (node.type === 'ATOM')  return !!env[node.value];
  if (node.type === 'NOT')   return !evalNode(node.child, env);
  if (node.type === 'AND')   return evalNode(node.left, env) && evalNode(node.right, env);
  if (node.type === 'OR')    return evalNode(node.left, env) || evalNode(node.right, env);
  return false;
}

/** Evaluate a formula string against causeValues = { C1: true, C2: false, ... }
 *  Returns true/false, or null if the formula is invalid / empty. */
export function evaluateFormula(formula, causeValues) {
  const f = formula.trim();
  if (!f) return null;
  try {
    const tokens = tokenize(f);
    if (!tokens.length) return null;
    const ast = buildParser(tokens);
    return evalNode(ast, causeValues);
  } catch {
    return null;
  }
}

/** Returns a Map<atomId, { direct: bool, negated: bool }> of causes used in the formula. */
export function getUsedCauses(formula) {
  const result = new Map();
  const f = formula.trim();
  if (!f) return result;
  try {
    const tokens = tokenize(f);
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== 'ATOM') continue;
      const id = tokens[i].value;
      if (!result.has(id)) result.set(id, { direct: false, negated: false });
      const entry = result.get(id);
      // Check if immediately preceded by NOT (simple heuristic for SVG display)
      if (i > 0 && tokens[i - 1].type === 'NOT') entry.negated = true;
      else entry.direct = true;
    }
  } catch { /* ignore */ }
  return result;
}

/** Returns true if the formula string is syntactically valid, else false. */
export function isValidFormula(formula) {
  const f = formula.trim();
  if (!f) return false;
  try {
    const tokens = tokenize(f);
    if (!tokens.length) return false;
    buildParser(tokens);
    return true;
  } catch {
    return false;
  }
}
