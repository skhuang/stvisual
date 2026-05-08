// Teaching-grade symbolic execution engine.
//
// Accepts a small JavaScript-like subset:
//   function name(p1, p2, ...) {
//     let x = expr;            // or: var x = ...
//     x = expr;
//     if (cond) { ... } else { ... }
//     while (cond) { ... }     // bounded by maxLoopUnroll
//     return expr;
//   }
//
// Expressions support: integer literals, true/false, identifiers, parens,
//   unary  -, !
//   binary +, -, *, /, %, ==, !=, <, <=, >, >=, &&, ||
//
// Symbolic execution walks the function as a tree. At every branch the
// engine forks into the true/false continuations and accumulates a path
// condition (PC). For each completed path it tries to find a witness
// (concrete integer assignment for each input parameter) by brute-force
// enumeration over a small bounded domain. The witness is then re-executed
// concretely so the UI can show the resulting return value.
//
// This is intentionally bounded and naive — it is meant for classroom
// demonstrations of how symbolic execution enumerates feasible paths,
// not as a production analyzer.

import { getLocale } from '../i18n/index.js';

const L = (en, zh) => (getLocale() === 'en' ? en : zh);

// --- Tokeniser ---------------------------------------------------------

const KEYWORDS = new Set([
  'function', 'let', 'var', 'const', 'if', 'else', 'while', 'return', 'true', 'false',
]);

const PUNCT2 = ['==', '!=', '<=', '>=', '&&', '||'];
const PUNCT1 = '(){};,+-*/%<>!=';

function tokenize(source) {
  const tokens = [];
  let i = 0;
  let line = 1;
  let col = 1;
  const advance = (n = 1) => {
    for (let k = 0; k < n; k += 1) {
      if (source[i] === '\n') { line += 1; col = 1; } else { col += 1; }
      i += 1;
    }
  };
  while (i < source.length) {
    const ch = source[i];
    if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') { advance(); continue; }
    if (ch === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') advance();
      continue;
    }
    if (ch === '/' && source[i + 1] === '*') {
      advance(2);
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) advance();
      if (i < source.length) advance(2);
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < source.length && /[0-9]/.test(source[j])) j += 1;
      tokens.push({ type: 'num', value: Number(source.slice(i, j)), line, col });
      advance(j - i);
      continue;
    }
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i;
      while (j < source.length && /[A-Za-z0-9_$]/.test(source[j])) j += 1;
      const word = source.slice(i, j);
      if (KEYWORDS.has(word)) {
        tokens.push({ type: word, line, col });
      } else {
        tokens.push({ type: 'ident', value: word, line, col });
      }
      advance(j - i);
      continue;
    }
    const two = source.slice(i, i + 2);
    if (PUNCT2.includes(two)) { tokens.push({ type: two, line, col }); advance(2); continue; }
    if (PUNCT1.includes(ch)) { tokens.push({ type: ch, line, col }); advance(1); continue; }
    throw new Error(L(
      `Unexpected character "${ch}" at line ${line}, column ${col}`,
      `非預期字元「${ch}」於第 ${line} 行第 ${col} 欄`,
    ));
  }
  tokens.push({ type: 'EOF', line, col });
  return tokens;
}

// --- Parser ------------------------------------------------------------
//
// Produces a small AST. Each node carries `kind` plus children.
//   { kind: 'function', name, params, body }
//   { kind: 'let'|'assign', target, value }
//   { kind: 'if', test, consequent, alternate }
//   { kind: 'while', test, body }
//   { kind: 'return', argument }
//   { kind: 'block', statements }
// Expressions:
//   { kind: 'num', value } | { kind: 'bool', value } | { kind: 'var', name }
//   { kind: 'unary', op, operand } | { kind: 'binary', op, left, right }

function parse(source) {
  const tokens = tokenize(source);
  let pos = 0;
  const peek = (n = 0) => tokens[pos + n];
  const eat = (type) => {
    const t = tokens[pos];
    if (t.type !== type) {
      throw new Error(L(
        `Expected "${type}" but got "${t.type}" at line ${t.line}`,
        `預期「${type}」但取得「${t.type}」於第 ${t.line} 行`,
      ));
    }
    pos += 1;
    return t;
  };

  function parseFunction() {
    eat('function');
    const name = eat('ident').value;
    eat('(');
    const params = [];
    if (peek().type !== ')') {
      params.push(eat('ident').value);
      while (peek().type === ',') { eat(','); params.push(eat('ident').value); }
    }
    eat(')');
    const body = parseBlock();
    return { kind: 'function', name, params, body };
  }

  function parseBlock() {
    eat('{');
    const statements = [];
    while (peek().type !== '}' && peek().type !== 'EOF') {
      statements.push(parseStatement());
    }
    eat('}');
    return { kind: 'block', statements };
  }

  function parseStatement() {
    const t = peek();
    if (t.type === '{') return parseBlock();
    if (t.type === 'if') return parseIf();
    if (t.type === 'while') return parseWhile();
    if (t.type === 'return') return parseReturn();
    if (t.type === 'let' || t.type === 'var' || t.type === 'const') return parseDeclaration();
    if (t.type === 'ident') return parseAssignment();
    throw new Error(L(
      `Unexpected token "${t.type}" at line ${t.line}`,
      `非預期 token「${t.type}」於第 ${t.line} 行`,
    ));
  }

  function parseDeclaration() {
    eat(peek().type); // let|var|const
    const target = eat('ident').value;
    eat('=');
    const value = parseExpression();
    eatSemicolon();
    return { kind: 'let', target, value };
  }

  function parseAssignment() {
    const target = eat('ident').value;
    eat('=');
    const value = parseExpression();
    eatSemicolon();
    return { kind: 'assign', target, value };
  }

  function eatSemicolon() {
    if (peek().type === ';') eat(';');
  }

  function parseIf() {
    eat('if'); eat('(');
    const test = parseExpression();
    eat(')');
    const consequent = parseBranchBody();
    let alternate = null;
    if (peek().type === 'else') {
      eat('else');
      alternate = peek().type === 'if' ? parseIf() : parseBranchBody();
    }
    return { kind: 'if', test, consequent, alternate };
  }

  function parseWhile() {
    eat('while'); eat('(');
    const test = parseExpression();
    eat(')');
    const body = parseBranchBody();
    return { kind: 'while', test, body };
  }

  function parseReturn() {
    eat('return');
    let argument = null;
    if (peek().type !== ';' && peek().type !== '}') argument = parseExpression();
    eatSemicolon();
    return { kind: 'return', argument };
  }

  function parseBranchBody() {
    if (peek().type === '{') return parseBlock();
    return { kind: 'block', statements: [parseStatement()] };
  }

  // --- Expression parser (Pratt-ish) ---
  // Precedence (low → high):
  //   || , && , == != , < <= > >= , + - , * / % , unary ! - , atoms
  function parseExpression() { return parseOr(); }
  function parseOr() {
    let n = parseAnd();
    while (peek().type === '||') { eat('||'); n = { kind: 'binary', op: '||', left: n, right: parseAnd() }; }
    return n;
  }
  function parseAnd() {
    let n = parseEquality();
    while (peek().type === '&&') { eat('&&'); n = { kind: 'binary', op: '&&', left: n, right: parseEquality() }; }
    return n;
  }
  function parseEquality() {
    let n = parseRel();
    while (peek().type === '==' || peek().type === '!=') {
      const op = peek().type; eat(op); n = { kind: 'binary', op, left: n, right: parseRel() };
    }
    return n;
  }
  function parseRel() {
    let n = parseAdd();
    while (['<', '<=', '>', '>='].includes(peek().type)) {
      const op = peek().type; eat(op); n = { kind: 'binary', op, left: n, right: parseAdd() };
    }
    return n;
  }
  function parseAdd() {
    let n = parseMul();
    while (peek().type === '+' || peek().type === '-') {
      const op = peek().type; eat(op); n = { kind: 'binary', op, left: n, right: parseMul() };
    }
    return n;
  }
  function parseMul() {
    let n = parseUnary();
    while (['*', '/', '%'].includes(peek().type)) {
      const op = peek().type; eat(op); n = { kind: 'binary', op, left: n, right: parseUnary() };
    }
    return n;
  }
  function parseUnary() {
    if (peek().type === '!' || peek().type === '-') {
      const op = peek().type; eat(op); return { kind: 'unary', op, operand: parseUnary() };
    }
    return parseAtom();
  }
  function parseAtom() {
    const t = peek();
    if (t.type === 'num') { eat('num'); return { kind: 'num', value: t.value }; }
    if (t.type === 'true') { eat('true'); return { kind: 'bool', value: true }; }
    if (t.type === 'false') { eat('false'); return { kind: 'bool', value: false }; }
    if (t.type === 'ident') { eat('ident'); return { kind: 'var', name: t.value }; }
    if (t.type === '(') { eat('('); const e = parseExpression(); eat(')'); return e; }
    throw new Error(L(
      `Unexpected token "${t.type}" in expression at line ${t.line}`,
      `運算式中非預期 token「${t.type}」於第 ${t.line} 行`,
    ));
  }

  const fn = parseFunction();
  if (peek().type !== 'EOF') {
    throw new Error(L('Trailing input after function definition.', '函式定義後仍有未解析內容。'));
  }
  return fn;
}

// --- Pretty-printer for expression AST (used to format path conditions) ---

const PRECEDENCE = {
  '||': 1, '&&': 2, '==': 3, '!=': 3,
  '<': 4, '<=': 4, '>': 4, '>=': 4,
  '+': 5, '-': 5, '*': 6, '/': 6, '%': 6,
};

export function exprToString(node, parentPrec = 0) {
  if (!node) return '';
  if (node.kind === 'num') return String(node.value);
  if (node.kind === 'bool') return node.value ? 'true' : 'false';
  if (node.kind === 'var') return node.name;
  if (node.kind === 'unary') {
    const inner = exprToString(node.operand, 7);
    const text = `${node.op}${inner}`;
    return parentPrec > 7 ? `(${text})` : text;
  }
  if (node.kind === 'binary') {
    const prec = PRECEDENCE[node.op] || 0;
    const text = `${exprToString(node.left, prec)} ${node.op} ${exprToString(node.right, prec + 1)}`;
    return parentPrec > prec ? `(${text})` : text;
  }
  return '?';
}

// --- Concrete evaluator (used both for solver enumeration and for replay) ---

function evalExpr(node, env) {
  if (node.kind === 'num') return node.value;
  if (node.kind === 'bool') return node.value;
  if (node.kind === 'var') {
    if (!(node.name in env)) {
      throw new Error(L(`Unbound variable: ${node.name}`, `未定義變數：${node.name}`));
    }
    return env[node.name];
  }
  if (node.kind === 'unary') {
    const v = evalExpr(node.operand, env);
    if (node.op === '!') return !v;
    if (node.op === '-') return -v;
  }
  if (node.kind === 'binary') {
    const L_ = evalExpr(node.left, env);
    const R_ = evalExpr(node.right, env);
    switch (node.op) {
      case '+': return L_ + R_;
      case '-': return L_ - R_;
      case '*': return L_ * R_;
      case '/': return R_ === 0 ? NaN : Math.trunc(L_ / R_);
      case '%': return R_ === 0 ? NaN : L_ % R_;
      case '==': return L_ === R_;
      case '!=': return L_ !== R_;
      case '<': return L_ < R_;
      case '<=': return L_ <= R_;
      case '>': return L_ > R_;
      case '>=': return L_ >= R_;
      case '&&': return Boolean(L_) && Boolean(R_);
      case '||': return Boolean(L_) || Boolean(R_);
      default: throw new Error(`Unknown op ${node.op}`);
    }
  }
  throw new Error(`Unknown node ${node.kind}`);
}

// --- Symbolic substitution: replace each `var` with its current symbolic expr ---

function substitute(node, env) {
  if (node.kind === 'num' || node.kind === 'bool') return node;
  if (node.kind === 'var') return env[node.name] ? cloneExpr(env[node.name]) : node;
  if (node.kind === 'unary') return { kind: 'unary', op: node.op, operand: substitute(node.operand, env) };
  if (node.kind === 'binary') {
    return { kind: 'binary', op: node.op, left: substitute(node.left, env), right: substitute(node.right, env) };
  }
  return node;
}

function cloneExpr(node) {
  if (!node) return node;
  if (node.kind === 'num' || node.kind === 'bool') return { ...node };
  if (node.kind === 'var') return { ...node };
  if (node.kind === 'unary') return { kind: 'unary', op: node.op, operand: cloneExpr(node.operand) };
  if (node.kind === 'binary') {
    return { kind: 'binary', op: node.op, left: cloneExpr(node.left), right: cloneExpr(node.right) };
  }
  return node;
}

function negate(expr) {
  if (expr.kind === 'unary' && expr.op === '!') return expr.operand;
  return { kind: 'unary', op: '!', operand: expr };
}

// --- Symbolic walker ---------------------------------------------------

const DEFAULT_OPTIONS = {
  maxLoopUnroll: 3,    // expand each `while` at most this many times per path
  maxPaths: 64,        // total path cap
  searchDomain: { min: -5, max: 12 },  // brute-force solver domain
};

export function symbolicExecute(programSource, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const fn = parse(programSource);
  const params = fn.params.slice();
  const initialEnv = {};
  for (const p of params) initialEnv[p] = { kind: 'var', name: p };

  const paths = [];
  let pathIdSeq = 0;
  let truncated = false;

  function walk(stmts, idx, env, pc, branches) {
    if (paths.length >= opts.maxPaths) { truncated = true; return; }
    if (idx >= stmts.length) {
      record(env, pc, branches, null);
      return;
    }
    const s = stmts[idx];
    if (s.kind === 'block') { walk([...s.statements, ...stmts.slice(idx + 1)], 0, env, pc, branches); return; }
    if (s.kind === 'let' || s.kind === 'assign') {
      const next = { ...env, [s.target]: substitute(s.value, env) };
      walk(stmts, idx + 1, next, pc, branches);
      return;
    }
    if (s.kind === 'return') {
      const ret = s.argument ? substitute(s.argument, env) : { kind: 'bool', value: true };
      record(env, pc, branches, ret);
      return;
    }
    if (s.kind === 'if') {
      const cond = substitute(s.test, env);
      // True branch
      walk(
        [s.consequent, ...stmts.slice(idx + 1)], 0, env,
        [...pc, cond], [...branches, { line: describeBranch(s.test), taken: true }],
      );
      // False branch
      const altBlock = s.alternate || { kind: 'block', statements: [] };
      walk(
        [altBlock, ...stmts.slice(idx + 1)], 0, env,
        [...pc, negate(cond)], [...branches, { line: describeBranch(s.test), taken: false }],
      );
      return;
    }
    if (s.kind === 'while') {
      // Unroll up to maxLoopUnroll times, then close the loop.
      function unroll(unrollCount, envCur, pcCur, branchesCur) {
        if (paths.length >= opts.maxPaths) { truncated = true; return; }
        const cond = substitute(s.test, envCur);
        if (unrollCount >= opts.maxLoopUnroll) {
          // Force exit (assume condition false).
          walk(stmts, idx + 1, envCur, [...pcCur, negate(cond)],
               [...branchesCur, { line: describeBranch(s.test), taken: false, loop: true }]);
          return;
        }
        // Exit branch: condition is false → continue after the loop.
        walk(stmts, idx + 1, envCur, [...pcCur, negate(cond)],
             [...branchesCur, { line: describeBranch(s.test), taken: false, loop: true }]);
        // Enter branch: condition is true → execute body, then loop again.
        // We model the body as a new walk that, on completion, recurses.
        symbolicExecBlock(s.body, envCur, [...pcCur, cond],
          [...branchesCur, { line: describeBranch(s.test), taken: true, loop: true }],
          (env2, pc2, br2) => unroll(unrollCount + 1, env2, pc2, br2));
      }
      unroll(0, env, pc, branches);
      return;
    }
    walk(stmts, idx + 1, env, pc, branches);
  }

  // Walk a block synchronously and invoke `cont(env, pc, branches)` at each leaf
  // (used by `while` body unrolling).
  function symbolicExecBlock(block, env, pc, branches, cont) {
    function step(stmts, idx, env_, pc_, br_) {
      if (paths.length >= opts.maxPaths) { truncated = true; return; }
      if (idx >= stmts.length) { cont(env_, pc_, br_); return; }
      const s = stmts[idx];
      if (s.kind === 'block') { step([...s.statements, ...stmts.slice(idx + 1)], 0, env_, pc_, br_); return; }
      if (s.kind === 'let' || s.kind === 'assign') {
        step(stmts, idx + 1, { ...env_, [s.target]: substitute(s.value, env_) }, pc_, br_);
        return;
      }
      if (s.kind === 'return') {
        const ret = s.argument ? substitute(s.argument, env_) : { kind: 'bool', value: true };
        record(env_, pc_, br_, ret);
        return;
      }
      if (s.kind === 'if') {
        const cond = substitute(s.test, env_);
        step([s.consequent, ...stmts.slice(idx + 1)], 0, env_,
             [...pc_, cond], [...br_, { line: describeBranch(s.test), taken: true }]);
        const altBlock = s.alternate || { kind: 'block', statements: [] };
        step([altBlock, ...stmts.slice(idx + 1)], 0, env_,
             [...pc_, negate(cond)], [...br_, { line: describeBranch(s.test), taken: false }]);
        return;
      }
      // Nested while: run via the outer walker which handles unrolling.
      if (s.kind === 'while') {
        // Splice remainder so that after the inner `while` finishes, control
        // returns to the surrounding block via `walk`.
        walk([s, ...stmts.slice(idx + 1)], 0, env_, pc_, br_);
        return;
      }
      step(stmts, idx + 1, env_, pc_, br_);
    }
    step([block], 0, env, pc, branches);
  }

  function describeBranch(node) {
    return exprToString(node);
  }

  function record(env, pc, branches, returnExpr) {
    const id = `path-${pathIdSeq}`;
    pathIdSeq += 1;
    const witness = findWitness(pc, params, opts.searchDomain);
    let concreteReturn = null;
    let concreteEnv = null;
    if (witness) {
      try {
        concreteEnv = { ...witness };
        // Replay each environment binding concretely so the witness yields the
        // same final values the symbolic walker computed.
        // (`env` has already been substituted, so binding values mention only
        // the original parameters.)
        const finalEnv = {};
        for (const k of Object.keys(env)) {
          if (params.includes(k)) finalEnv[k] = witness[k];
          else finalEnv[k] = evalExpr(env[k], witness);
        }
        for (const p of params) if (!(p in finalEnv)) finalEnv[p] = witness[p];
        concreteEnv = finalEnv;
        concreteReturn = returnExpr ? evalExpr(returnExpr, witness) : null;
      } catch {
        concreteReturn = null;
      }
    }
    paths.push({
      id,
      branches,
      pathCondition: pc.map((c) => exprToString(c)),
      returnExpression: returnExpr ? exprToString(returnExpr) : null,
      feasible: Boolean(witness),
      witness: witness || null,
      concreteEnv,
      concreteReturn,
    });
  }

  walk(fn.body.statements, 0, initialEnv, [], []);
  return { function: { name: fn.name, params }, paths, truncated };
}

// --- Witness search: brute-force enumeration over a small integer domain ---

function findWitness(pc, params, domain) {
  if (!pc.length) {
    const w = {};
    for (const p of params) w[p] = 0;
    return w;
  }
  const values = [];
  for (let v = domain.min; v <= domain.max; v += 1) values.push(v);
  const result = {};
  function recurse(i) {
    if (i === params.length) {
      try {
        for (const c of pc) {
          if (!evalExpr(c, result)) return false;
        }
        return true;
      } catch {
        return false;
      }
    }
    for (const v of values) {
      result[params[i]] = v;
      if (recurse(i + 1)) return true;
    }
    return false;
  }
  return recurse(0) ? { ...result } : null;
}

export { parse as parseProgram };
