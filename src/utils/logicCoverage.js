// Logic Coverage utilities (Ammann & Offutt).
// Parses a boolean predicate over named clauses (identifiers) using only
// `!`, `&&`, `||`, parentheses, and whitespace. Provides truth-table generation
// and test-set computation for several criteria:
//   - PC  (Predicate Coverage)
//   - CC  (Clause Coverage)
//   - CoC (Combinatorial Coverage)
//   - GACC (General Active Clause Coverage)
//   - CACC (Correlated Active Clause Coverage)
//   - RACC (Restricted Active Clause Coverage)

const TOKEN_REGEX = /\s*(?:(\()|(\))|(&&)|(\|\|)|(!)|([A-Za-z_][A-Za-z0-9_]*))/y;

function tokenize(expression) {
  const tokens = [];
  TOKEN_REGEX.lastIndex = 0;
  let lastIndex = 0;

  while (TOKEN_REGEX.lastIndex < expression.length) {
    const start = TOKEN_REGEX.lastIndex;
    const match = TOKEN_REGEX.exec(expression);
    if (!match) {
      const remainder = expression.slice(start).trim();
      if (!remainder) break;
      throw new Error(`不支援的字元：「${remainder[0]}」於位置 ${start + 1}`);
    }
    const [, lparen, rparen, andOp, orOp, notOp, ident] = match;
    if (lparen) tokens.push({ type: 'lparen' });
    else if (rparen) tokens.push({ type: 'rparen' });
    else if (andOp) tokens.push({ type: 'and' });
    else if (orOp) tokens.push({ type: 'or' });
    else if (notOp) tokens.push({ type: 'not' });
    else if (ident) tokens.push({ type: 'ident', value: ident });
    lastIndex = TOKEN_REGEX.lastIndex;
  }

  if (lastIndex < expression.length && expression.slice(lastIndex).trim()) {
    throw new Error(`無法解析剩餘字串：「${expression.slice(lastIndex).trim()}」`);
  }

  return tokens;
}

function parseExpression(tokens) {
  let pos = 0;

  function peek() {
    return tokens[pos];
  }

  function consume(type) {
    const token = tokens[pos];
    if (!token || token.type !== type) {
      throw new Error(`語法錯誤：預期 ${type}，實際 ${token ? token.type : 'EOF'}`);
    }
    pos += 1;
    return token;
  }

  function parseOr() {
    let node = parseAnd();
    while (peek()?.type === 'or') {
      consume('or');
      node = { type: 'or', left: node, right: parseAnd() };
    }
    return node;
  }

  function parseAnd() {
    let node = parseNot();
    while (peek()?.type === 'and') {
      consume('and');
      node = { type: 'and', left: node, right: parseNot() };
    }
    return node;
  }

  function parseNot() {
    if (peek()?.type === 'not') {
      consume('not');
      return { type: 'not', operand: parseNot() };
    }
    return parseAtom();
  }

  function parseAtom() {
    const token = peek();
    if (!token) throw new Error('語法錯誤：未預期的結尾。');
    if (token.type === 'lparen') {
      consume('lparen');
      const node = parseOr();
      consume('rparen');
      return node;
    }
    if (token.type === 'ident') {
      consume('ident');
      return { type: 'clause', name: token.value };
    }
    throw new Error(`語法錯誤：未預期的 ${token.type}`);
  }

  const ast = parseOr();
  if (pos !== tokens.length) {
    throw new Error('語法錯誤：剩餘 token 未解析。');
  }
  return ast;
}

function evaluateAst(ast, values) {
  switch (ast.type) {
    case 'clause': {
      if (!(ast.name in values)) {
        throw new Error(`缺少子句值：${ast.name}`);
      }
      return Boolean(values[ast.name]);
    }
    case 'not':
      return !evaluateAst(ast.operand, values);
    case 'and':
      return evaluateAst(ast.left, values) && evaluateAst(ast.right, values);
    case 'or':
      return evaluateAst(ast.left, values) || evaluateAst(ast.right, values);
    default:
      throw new Error(`未知 AST 節點：${ast.type}`);
  }
}

function collectClauses(ast, accumulator = []) {
  if (ast.type === 'clause') {
    if (!accumulator.includes(ast.name)) accumulator.push(ast.name);
  } else if (ast.type === 'not') {
    collectClauses(ast.operand, accumulator);
  } else {
    collectClauses(ast.left, accumulator);
    collectClauses(ast.right, accumulator);
  }
  return accumulator;
}

export function parsePredicate(expression) {
  const trimmed = String(expression || '').trim();
  if (!trimmed) {
    throw new Error('Predicate 不能為空。');
  }
  const tokens = tokenize(trimmed);
  if (!tokens.length) {
    throw new Error('Predicate 不含任何 token。');
  }
  const ast = parseExpression(tokens);
  const clauses = collectClauses(ast);
  return { ast, clauses, expression: trimmed };
}

export function buildTruthTable(parsed) {
  const { ast, clauses } = parsed;
  const total = 1 << clauses.length;
  const rows = [];

  for (let mask = 0; mask < total; mask += 1) {
    const values = {};
    clauses.forEach((clause, index) => {
      values[clause] = Boolean((mask >> (clauses.length - 1 - index)) & 1);
    });
    const predicate = evaluateAst(ast, values);
    const determines = {};

    clauses.forEach((clause) => {
      const flipped = { ...values, [clause]: !values[clause] };
      const flippedResult = evaluateAst(ast, flipped);
      determines[clause] = flippedResult !== predicate;
    });

    rows.push({ index: mask, values, predicate, determines });
  }

  return rows;
}

function rowKey(row) {
  return `r${row.index}`;
}

export function buildPredicateCoverageSet(rows) {
  const truthRow = rows.find((row) => row.predicate === true);
  const falseRow = rows.find((row) => row.predicate === false);
  const tests = [];
  if (truthRow) tests.push({ id: rowKey(truthRow), row: truthRow, label: 'P = T' });
  if (falseRow) tests.push({ id: rowKey(falseRow), row: falseRow, label: 'P = F' });
  return {
    id: 'pc',
    name: 'Predicate Coverage',
    description: '讓整個 predicate 至少評估為 true 與 false 各一次。',
    tests,
    requirementCount: 2,
  };
}

export function buildClauseCoverageSet(rows, clauses) {
  const tests = [];
  const used = new Set();

  clauses.forEach((clause) => {
    ['T', 'F'].forEach((label) => {
      const target = label === 'T';
      const row = rows.find((r) => r.values[clause] === target);
      if (!row) return;
      const id = `${rowKey(row)}-${clause}=${label}`;
      if (used.has(id)) return;
      used.add(id);
      tests.push({ id, row, label: `${clause} = ${label}` });
    });
  });

  return {
    id: 'cc',
    name: 'Clause Coverage',
    description: '每個子句都必須各取 true 與 false 一次。',
    tests,
    requirementCount: clauses.length * 2,
  };
}

export function buildCombinatorialCoverageSet(rows) {
  return {
    id: 'coc',
    name: 'Combinatorial Coverage',
    description: '列舉所有子句真假組合（共 2^n 列）。',
    tests: rows.map((row) => ({ id: rowKey(row), row, label: `Row ${row.index}` })),
    requirementCount: rows.length,
  };
}

function pickPair(rows, clause, mode) {
  const tCandidates = rows.filter((row) => row.determines[clause] && row.values[clause] === true);
  const fCandidates = rows.filter((row) => row.determines[clause] && row.values[clause] === false);
  if (!tCandidates.length || !fCandidates.length) {
    return null;
  }

  if (mode === 'gacc') {
    return [tCandidates[0], fCandidates[0]];
  }

  if (mode === 'cacc') {
    for (const tRow of tCandidates) {
      for (const fRow of fCandidates) {
        if (tRow.predicate !== fRow.predicate) {
          return [tRow, fRow];
        }
      }
    }
    return null;
  }

  if (mode === 'racc') {
    for (const tRow of tCandidates) {
      const minorMatch = fCandidates.find((fRow) =>
        Object.keys(tRow.values).every((name) =>
          name === clause ? fRow.values[name] !== tRow.values[name] : fRow.values[name] === tRow.values[name],
        ),
      );
      if (minorMatch) {
        return [tRow, minorMatch];
      }
    }
    return null;
  }

  return null;
}

function buildActiveClauseSet(id, name, description, rows, clauses, mode) {
  const tests = [];
  const seen = new Set();
  const unsatisfied = [];

  clauses.forEach((clause) => {
    const pair = pickPair(rows, clause, mode);
    if (!pair) {
      unsatisfied.push(clause);
      return;
    }
    pair.forEach((row, index) => {
      const testId = `${rowKey(row)}-${clause}-${index}`;
      if (seen.has(testId)) return;
      seen.add(testId);
      tests.push({
        id: testId,
        row,
        label: `${clause}=${row.values[clause] ? 'T' : 'F'} (主導 ${clause})`,
        majorClause: clause,
      });
    });
  });

  return {
    id,
    name,
    description,
    tests,
    requirementCount: clauses.length * 2,
    unsatisfied,
  };
}

export function buildGACCSet(rows, clauses) {
  return buildActiveClauseSet(
    'gacc',
    'General Active Clause Coverage',
    '對每個主子句，找一對列使其決定 predicate 的值，次子句可任意。',
    rows,
    clauses,
    'gacc',
  );
}

export function buildCACCSet(rows, clauses) {
  return buildActiveClauseSet(
    'cacc',
    'Correlated Active Clause Coverage',
    '主子句決定 predicate 結果，且兩列產生不同的 predicate 值。',
    rows,
    clauses,
    'cacc',
  );
}

export function buildRACCSet(rows, clauses) {
  return buildActiveClauseSet(
    'racc',
    'Restricted Active Clause Coverage',
    '主子句決定 predicate 結果，且兩列的次子句值完全相同。',
    rows,
    clauses,
    'racc',
  );
}

export function buildAllCoverageSets(parsed) {
  const rows = buildTruthTable(parsed);
  return {
    rows,
    clauses: parsed.clauses,
    sets: {
      pc: buildPredicateCoverageSet(rows),
      cc: buildClauseCoverageSet(rows, parsed.clauses),
      coc: buildCombinatorialCoverageSet(rows),
      gacc: buildGACCSet(rows, parsed.clauses),
      cacc: buildCACCSet(rows, parsed.clauses),
      racc: buildRACCSet(rows, parsed.clauses),
    },
  };
}
