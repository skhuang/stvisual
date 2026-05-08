// Logic Coverage utilities (Ammann & Offutt).
// Parses a boolean predicate over named clauses (single-letter identifiers,
// optionally followed by digits, e.g. `a`, `b`, `c1`). Supports two notations
// that can be mixed freely:
//   - Programming style: `&&`, `||`, `!`, parentheses, whitespace
//   - Textbook style:    juxtaposition for AND (e.g. `ab`), `+` for OR
//                        (e.g. `a+b`), and `!` for NOT
// Provides truth-table generation and test-set computation for several criteria:
//   - PC  (Predicate Coverage)
//   - CC  (Clause Coverage)
//   - CoC (Combinatorial Coverage)
//   - GACC (General Active Clause Coverage)
//   - CACC (Correlated Active Clause Coverage)
//   - RACC (Restricted Active Clause Coverage)

import { getLocale } from '../i18n/index.js';

// Tiny locale helper for messages and dynamic labels emitted from this module.
// English first because the module's identifiers / API are English by default.
const L = (en, zh) => (getLocale() === 'en' ? en : zh);

// Tokens：
//   `(` `)` `&&` `||` `!`  以及識別字（單一英文字母可選跟數字，如 a、b、c1、x2）。
//   為了支援教科書記號，額外接受：
//     `+`        表示 OR（等同 `||`）
//     juxtaposition（兩個原子相鄰，例如 `ab`、`a!b`、`(a+b)(c+d)`）表示 AND
const TOKEN_REGEX = /\s*(?:(\()|(\))|(&&)|(\|\|)|(\+)|(!)|([A-Za-z][0-9]*))/y;

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
      throw new Error(L(`Unsupported character "${remainder[0]}" at position ${start + 1}`, `不支援的字元：「${remainder[0]}」於位置 ${start + 1}`));
    }
    const [, lparen, rparen, andOp, orOp, plusOp, notOp, ident] = match;
    if (lparen) tokens.push({ type: 'lparen' });
    else if (rparen) tokens.push({ type: 'rparen' });
    else if (andOp) tokens.push({ type: 'and' });
    else if (orOp || plusOp) tokens.push({ type: 'or' });
    else if (notOp) tokens.push({ type: 'not' });
    else if (ident) tokens.push({ type: 'ident', value: ident });
    lastIndex = TOKEN_REGEX.lastIndex;
  }

  if (lastIndex < expression.length && expression.slice(lastIndex).trim()) {
    throw new Error(L(`Could not parse trailing input "${expression.slice(lastIndex).trim()}"`, `無法解析剩餘字串：「${expression.slice(lastIndex).trim()}」`));
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
      throw new Error(L(`Syntax error: expected ${type}, got ${token ? token.type : 'EOF'}`, `語法錯誤：預期 ${type}，實際 ${token ? token.type : 'EOF'}`));
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
    // 接受 `&&` 或 juxtaposition（下一個 token 直接是另一個 atom 的開頭）。
    while (true) {
      const next = peek();
      if (!next) break;
      if (next.type === 'and') {
        consume('and');
        node = { type: 'and', left: node, right: parseNot() };
      } else if (next.type === 'lparen' || next.type === 'not' || next.type === 'ident') {
        node = { type: 'and', left: node, right: parseNot() };
      } else {
        break;
      }
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
    if (!token) throw new Error(L('Syntax error: unexpected end of input.', '語法錯誤：未預期的結尾。'));
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
    throw new Error(L(`Syntax error: unexpected ${token.type}`, `語法錯誤：未預期的 ${token.type}`));
  }

  const ast = parseOr();
  if (pos !== tokens.length) {
    throw new Error(L('Syntax error: trailing tokens were not parsed.', '語法錯誤：剩餘 token 未解析。'));
  }
  return ast;
}

function evaluateAst(ast, values) {
  switch (ast.type) {
    case 'clause': {
      if (!(ast.name in values)) {
        throw new Error(L(`Missing clause value: ${ast.name}`, `缺少子句值：${ast.name}`));
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
      throw new Error(L(`Unknown AST node: ${ast.type}`, `未知 AST 節點：${ast.type}`));
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
    throw new Error(L('Predicate must not be empty.', 'Predicate 不能為空。'));
  }
  const tokens = tokenize(trimmed);
  if (!tokens.length) {
    throw new Error(L('Predicate did not yield any token.', 'Predicate 不含任何 token。'));
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
    description: L('Make the predicate evaluate to true and false at least once each.', '讓整個 predicate 至少評估為 true 與 false 各一次。'),
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
    description: L('Each clause must take both true and false at least once.', '每個子句都必須各取 true 與 false 一次。'),
    tests,
    requirementCount: clauses.length * 2,
  };
}

export function buildCombinatorialCoverageSet(rows) {
  return {
    id: 'coc',
    name: 'Combinatorial Coverage',
    description: L('Enumerate all clause T/F combinations (2^n rows).', '列舉所有子句真假組合（共 2^n 列）。'),
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
        label: `${clause}=${row.values[clause] ? 'T' : 'F'} ${L(`(major ${clause})`, `(主導 ${clause})`)}`,
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
    L('For each major clause, find a row pair such that the major clause determines the predicate while minor clauses are unconstrained.', '對每個主子句，找一對列使其決定 predicate 的值，次子句可任意。'),
    rows,
    clauses,
    'gacc',
  );
}

export function buildCACCSet(rows, clauses) {
  return buildActiveClauseSet(
    'cacc',
    'Correlated Active Clause Coverage',
    L('The major clause determines the predicate, and the two rows produce different predicate values.', '主子句決定 predicate 結果，且兩列產生不同的 predicate 值。'),
    rows,
    clauses,
    'cacc',
  );
}

export function buildRACCSet(rows, clauses) {
  return buildActiveClauseSet(
    'racc',
    'Restricted Active Clause Coverage',
    L('The major clause determines the predicate, and the two rows have identical minor-clause values.', '主子句決定 predicate 結果，且兩列的次子句值完全相同。'),
    rows,
    clauses,
    'racc',
  );
}

function buildInactiveClauseSet(id, name, description, rows, clauses, mode) {
  const tests = [];
  const seen = new Set();
  const unsatisfied = [];

  clauses.forEach((clause) => {
    const nonDet = rows.filter((row) => !row.determines[clause]);
    const combos = [
      [true, true],
      [true, false],
      [false, true],
      [false, false],
    ];

    function addRow(row, comboLabel) {
      const testId = `${rowKey(row)}-${clause}-${comboLabel}`;
      if (seen.has(testId)) return;
      seen.add(testId);
      tests.push({
        id: testId,
        row,
        label: `${clause}=${row.values[clause] ? 'T' : 'F'}, P=${row.predicate ? 'T' : 'F'} ${L(`(minor ${clause})`, `(非主導 ${clause})`)}`,
        majorClause: clause,
      });
    }

    if (mode === 'gicc') {
      combos.forEach(([cVal, pVal]) => {
        const row = nonDet.find((r) => r.values[clause] === cVal && r.predicate === pVal);
        if (!row) {
          unsatisfied.push(`${clause}@(c=${cVal ? 'T' : 'F'},p=${pVal ? 'T' : 'F'})`);
          return;
        }
        addRow(row, `c${cVal ? 'T' : 'F'}p${pVal ? 'T' : 'F'}`);
      });
      return;
    }

    if (mode === 'ricc') {
      [true, false].forEach((pVal) => {
        const tCandidates = nonDet.filter((r) => r.values[clause] === true && r.predicate === pVal);
        const fCandidates = nonDet.filter((r) => r.values[clause] === false && r.predicate === pVal);
        let pair = null;
        for (const tRow of tCandidates) {
          const minorMatch = fCandidates.find((fRow) =>
            Object.keys(tRow.values).every((name) =>
              name === clause ? true : fRow.values[name] === tRow.values[name],
            ),
          );
          if (minorMatch) {
            pair = [tRow, minorMatch];
            break;
          }
        }
        if (!pair) {
          unsatisfied.push(`${clause}@p=${pVal ? 'T' : 'F'}`);
          return;
        }
        pair.forEach((row, index) => {
          addRow(row, `p${pVal ? 'T' : 'F'}-${index}`);
        });
      });
    }
  });

  return {
    id,
    name,
    description,
    tests,
    requirementCount: clauses.length * 4,
    unsatisfied,
  };
}

export function buildGICCSet(rows, clauses) {
  return buildInactiveClauseSet(
    'gicc',
    'General Inactive Clause Coverage',
    L('For each major clause, in rows where it does not determine the predicate, cover all (c=T/F) × (P=T/F) combinations.', '對每個主子句，於不決定 predicate 的列中，覆蓋 (c=T/F)×(P=T/F) 共 4 種組合。'),
    rows,
    clauses,
    'gicc',
  );
}

export function buildRICCSet(rows, clauses) {
  return buildInactiveClauseSet(
    'ricc',
    'Restricted Inactive Clause Coverage',
    L('Same as GICC, but paired rows (same P) must agree on every minor clause; only the major clause flips.', '同 GICC，但成對列（同 P 值）需所有次子句完全相同，僅主子句翻轉。'),
    rows,
    clauses,
    'ricc',
  );
}

export function buildAllCoverageSets(parsed) {
  const rows = buildTruthTable(parsed);
  const dnf = minimalDNF(rows, parsed.clauses, true);
  const negDnf = minimalDNF(rows, parsed.clauses, false);
  return {
    rows,
    clauses: parsed.clauses,
    dnf,
    negDnf,
    sets: {
      pc: buildPredicateCoverageSet(rows),
      cc: buildClauseCoverageSet(rows, parsed.clauses),
      coc: buildCombinatorialCoverageSet(rows),
      gacc: buildGACCSet(rows, parsed.clauses),
      cacc: buildCACCSet(rows, parsed.clauses),
      racc: buildRACCSet(rows, parsed.clauses),
      gicc: buildGICCSet(rows, parsed.clauses),
      ricc: buildRICCSet(rows, parsed.clauses),
      ic: buildImplicantCoverageSet(rows, dnf, negDnf),
      utpc: buildUTPCSet(rows, dnf),
      mutpc: buildMUTPCSet(rows, parsed.clauses, dnf),
      nfpc: buildNFPCSet(rows, dnf),
      mnfpc: buildMNFPCSet(rows, parsed.clauses, dnf),
      cutpnfp: buildCUTPNFPSet(rows, dnf),
    },
  };
}

// ---------- Syntactic Logic Coverage (DNF-based) ----------

function literalKey(lit) {
  return `${lit.negated ? '!' : ''}${lit.name}`;
}

function termKey(term) {
  return term.map(literalKey).sort().join('&');
}

export function termToString(term) {
  if (!term.length) return 'true';
  return term.map(literalKey).join(' && ');
}

function mergeLiterals(a, b) {
  const map = new Map();
  for (const lit of [...a, ...b]) {
    const existing = map.get(lit.name);
    if (existing && existing.negated !== lit.negated) {
      return null;
    }
    if (!existing) {
      map.set(lit.name, lit);
    }
  }
  return [...map.values()];
}

function dedupeTerms(terms) {
  const seen = new Set();
  const out = [];
  terms.forEach((t) => {
    const key = termKey(t);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(t);
    }
  });
  return out;
}

function dnfFromAst(ast) {
  switch (ast.type) {
    case 'clause':
      return [[{ name: ast.name, negated: false }]];
    case 'not':
      return dnfNegate(ast.operand);
    case 'and': {
      const left = dnfFromAst(ast.left);
      const right = dnfFromAst(ast.right);
      const terms = [];
      left.forEach((lt) => right.forEach((rt) => {
        const merged = mergeLiterals(lt, rt);
        if (merged) terms.push(merged);
      }));
      return dedupeTerms(terms);
    }
    case 'or':
      return dedupeTerms([...dnfFromAst(ast.left), ...dnfFromAst(ast.right)]);
    default:
      throw new Error(L(`Unknown AST node: ${ast.type}`, `未知 AST 節點：${ast.type}`));
  }
}

function dnfNegate(ast) {
  switch (ast.type) {
    case 'clause':
      return [[{ name: ast.name, negated: true }]];
    case 'not':
      return dnfFromAst(ast.operand);
    case 'and':
      return dedupeTerms([...dnfNegate(ast.left), ...dnfNegate(ast.right)]);
    case 'or': {
      const left = dnfNegate(ast.left);
      const right = dnfNegate(ast.right);
      const terms = [];
      left.forEach((lt) => right.forEach((rt) => {
        const merged = mergeLiterals(lt, rt);
        if (merged) terms.push(merged);
      }));
      return dedupeTerms(terms);
    }
    default:
      throw new Error(L(`Unknown AST node: ${ast.type}`, `未知 AST 節點：${ast.type}`));
  }
}

export function toDNF(ast) {
  return dnfFromAst(ast);
}

// 透過 Quine–McCluskey 找 prime implicants，
// 再用 essential + greedy 找最小覆蓋，產生最小 DNF。
export function minimalDNF(rows, clauses, target = true) {
  const n = clauses.length;
  const onSet = rows.filter((r) => r.predicate === target).map((r) => r.index);
  if (!onSet.length) return [];
  if (onSet.length === (1 << n)) return [[]]; // tautology

  let current = onSet.map((i) => ({ bits: i, dash: 0, covers: new Set([i]) }));
  const primes = [];
  while (current.length) {
    const used = new Array(current.length).fill(false);
    const seen = new Map();
    const next = [];
    for (let i = 0; i < current.length; i += 1) {
      for (let j = i + 1; j < current.length; j += 1) {
        const a = current[i];
        const b = current[j];
        if (a.dash !== b.dash) continue;
        const diff = a.bits ^ b.bits;
        if (diff && (diff & (diff - 1)) === 0 && (diff & a.dash) === 0) {
          used[i] = true;
          used[j] = true;
          const newDash = a.dash | diff;
          const newBits = a.bits & ~diff;
          const key = `${newBits}|${newDash}`;
          if (!seen.has(key)) {
            const covers = new Set([...a.covers, ...b.covers]);
            const entry = { bits: newBits, dash: newDash, covers };
            seen.set(key, entry);
            next.push(entry);
          } else {
            const ex = seen.get(key);
            a.covers.forEach((v) => ex.covers.add(v));
            b.covers.forEach((v) => ex.covers.add(v));
          }
        }
      }
    }
    current.forEach((imp, idx) => {
      if (!used[idx]) primes.push(imp);
    });
    current = next;
  }

  const remaining = new Set(onSet);
  const chargeMap = new Map();
  primes.forEach((p, idx) => {
    p.covers.forEach((m) => {
      if (!chargeMap.has(m)) chargeMap.set(m, []);
      chargeMap.get(m).push(idx);
    });
  });
  const chosen = new Set();
  let changed = true;
  while (changed) {
    changed = false;
    for (const m of [...remaining]) {
      const list = chargeMap.get(m).filter((idx) => !chosen.has(idx));
      if (list.length === 1) {
        chosen.add(list[0]);
        primes[list[0]].covers.forEach((c) => remaining.delete(c));
        changed = true;
      }
    }
  }
  while (remaining.size) {
    let best = -1;
    let bestCover = -1;
    primes.forEach((p, idx) => {
      if (chosen.has(idx)) return;
      let cnt = 0;
      p.covers.forEach((m) => { if (remaining.has(m)) cnt += 1; });
      if (cnt > bestCover) { bestCover = cnt; best = idx; }
    });
    if (best === -1) break;
    chosen.add(best);
    primes[best].covers.forEach((c) => remaining.delete(c));
  }

  return [...chosen].map((idx) => {
    const p = primes[idx];
    const lits = [];
    for (let bit = 0; bit < n; bit += 1) {
      const mask = 1 << (n - 1 - bit);
      if (p.dash & mask) continue;
      const val = Boolean(p.bits & mask);
      lits.push({ name: clauses[bit], negated: !val });
    }
    return lits;
  });
}

function termSatisfiedBy(term, values) {
  return term.every((lit) => Boolean(values[lit.name]) !== lit.negated);
}

function findRowsForTerm(rows, term) {
  return rows.filter((row) => termSatisfiedBy(term, row.values));
}

function uniqueTruePointsForTerm(rows, term, dnf, termIndex) {
  return findRowsForTerm(rows, term).filter((row) =>
    dnf.every((other, idx) => idx === termIndex || !termSatisfiedBy(other, row.values)),
  );
}

function termLabel(term) {
  return termToString(term);
}

export function buildImplicantCoverageSet(rows, dnf, negDnf = []) {
  const tests = [];
  const unsatisfied = [];

  // 對單一 polarity 求最小 row 集合，使每個 implicant 至少被一個 row 覆蓋。
  function selectMinimalRows(implicants, predicateValue, kind) {
    if (!implicants.length) return;
    // 每個 implicant 對應的候選 rows（須符合 predicate 真值）。
    const candidatesPerImp = implicants.map((term) =>
      findRowsForTerm(rows, term).filter((r) => r.predicate === predicateValue),
    );
    candidatesPerImp.forEach((cands, idx) => {
      if (!cands.length) {
        unsatisfied.push(`${kind} implicant {${termLabel(implicants[idx])}}`);
      }
    });
    // row.index -> Set(implicant indices it covers)
    const rowCoverage = new Map();
    candidatesPerImp.forEach((cands, impIdx) => {
      cands.forEach((row) => {
        if (!rowCoverage.has(row.index)) rowCoverage.set(row.index, { row, covers: new Set() });
        rowCoverage.get(row.index).covers.add(impIdx);
      });
    });
    const remaining = new Set(implicants.map((_, i) => i).filter((i) => candidatesPerImp[i].length));
    const chosen = [];
    // essential：只有單一 row 能覆蓋的 implicant，必選那個 row。
    let changed = true;
    while (changed) {
      changed = false;
      for (const impIdx of [...remaining]) {
        const owners = [...rowCoverage.values()].filter((entry) => entry.covers.has(impIdx));
        if (owners.length === 1 && !chosen.includes(owners[0])) {
          chosen.push(owners[0]);
          owners[0].covers.forEach((c) => remaining.delete(c));
          changed = true;
        }
      }
    }
    // greedy：每次選覆蓋最多剩餘 implicant 的 row。
    while (remaining.size) {
      let best = null;
      let bestCount = -1;
      rowCoverage.forEach((entry) => {
        if (chosen.includes(entry)) return;
        let cnt = 0;
        entry.covers.forEach((c) => { if (remaining.has(c)) cnt += 1; });
        if (cnt > bestCount) { bestCount = cnt; best = entry; }
      });
      if (!best || bestCount <= 0) break;
      chosen.push(best);
      best.covers.forEach((c) => remaining.delete(c));
    }
    chosen.forEach((entry) => {
      const coveredImps = [...entry.covers].sort((a, b) => a - b);
      const labels = coveredImps.map((i) => `{${termLabel(implicants[i])}}`).join(', ');
      tests.push({
        id: `r${entry.row.index}-${kind}`,
        row: entry.row,
        label: `${kind === 'pos' ? 'P=T' : '¬P=T'} implicants ${labels}`,
        implicantIndex: coveredImps[0],
        implicantIndices: coveredImps,
        polarity: kind,
      });
    });
  }

  selectMinimalRows(dnf, true, 'pos');
  selectMinimalRows(negDnf, false, 'neg');

  return {
    id: 'ic',
    name: 'Implicant Coverage',
    description: L('For every prime implicant in the minimal DNF of f and ¬f, find at least one row that satisfies it (test rows are minimised).', '對 f 與 ¬f 的最小 DNF 中每個 prime implicant，至少找到一個使其為真的 row（已最小化測試列數）。'),
    tests,
    requirementCount: dnf.length + negDnf.length,
    unsatisfied,
  };
}

export function buildUTPCSet(rows, dnf) {
  const tests = [];
  const seen = new Set();
  const unsatisfied = [];

  dnf.forEach((term, index) => {
    const utps = uniqueTruePointsForTerm(rows, term, dnf, index);
    if (!utps.length) {
      unsatisfied.push(`UTP for {${termLabel(term)}}`);
      return;
    }
    utps.forEach((row) => {
      const key = `r${row.index}-utp${index}`;
      if (seen.has(key)) return;
      seen.add(key);
      tests.push({
        id: key,
        row,
        label: `UTP for {${termLabel(term)}}`,
        implicantIndex: index,
      });
    });
  });

  return {
    id: 'utpc',
    name: 'Unique True Point Coverage',
    description: L('For each implicant, list every unique true point that only satisfies that implicant (any one of them satisfies the criterion).', '對每個 implicant，列出所有只滿足該 implicant 的 unique true point（任選其一即可滿足準則）。'),
    tests,
    requirementCount: dnf.length,
    unsatisfied,
  };
}

// MUTPC（Multiple Unique True Point Coverage）：
// 對 DNF 中每個 implicant i，挑一組 UTPs，使得每個「次子句」（不在 i 中的 clause c）
// 都至少出現一次 c=T 與一次 c=F。
export function buildMUTPCSet(rows, clauses, dnf) {
  const tests = [];
  const seen = new Set();
  const unsatisfied = [];
  let requirementCount = 0;

  dnf.forEach((term, index) => {
    const inImplicant = new Set(term.map((lit) => lit.name));
    const minorClauses = clauses.filter((c) => !inImplicant.has(c));
    requirementCount += minorClauses.length * 2;

    const utps = uniqueTruePointsForTerm(rows, term, dnf, index);
    if (!utps.length) {
      minorClauses.forEach((c) => {
        unsatisfied.push(L(`MUTP {${termLabel(term)}} missing ${c}=T`, `MUTP {${termLabel(term)}} 缺 ${c}=T`));
        unsatisfied.push(L(`MUTP {${termLabel(term)}} missing ${c}=F`, `MUTP {${termLabel(term)}} 缺 ${c}=F`));
      });
      return;
    }

    if (!minorClauses.length) {
      // 沒有次子句時退化為 UTPC（任一 UTP 即可）。
      const row = utps[0];
      const key = `r${row.index}-mutp${index}`;
      if (!seen.has(key)) {
        seen.add(key);
        tests.push({
          id: key,
          row,
          label: `MUTP {${termLabel(term)}}`,
          implicantIndex: index,
        });
      }
      return;
    }

    // 需求集：每個次子句的 (T, F) 共 2*minorClauses.length 個 (clause, value)。
    const remaining = new Set();
    minorClauses.forEach((c) => {
      remaining.add(`${c}=T`);
      remaining.add(`${c}=F`);
    });

    const chosen = [];
    const utpReqs = utps.map((row) => {
      const reqs = new Set();
      minorClauses.forEach((c) => {
        reqs.add(`${c}=${row.values[c] ? 'T' : 'F'}`);
      });
      return reqs;
    });

    while (remaining.size) {
      let bestIdx = -1;
      let bestCount = 0;
      utpReqs.forEach((reqs, i) => {
        if (chosen.includes(i)) return;
        let cnt = 0;
        reqs.forEach((r) => { if (remaining.has(r)) cnt += 1; });
        if (cnt > bestCount) { bestCount = cnt; bestIdx = i; }
      });
      if (bestIdx < 0) break;
      chosen.push(bestIdx);
      utpReqs[bestIdx].forEach((r) => remaining.delete(r));
    }

    if (remaining.size) {
      remaining.forEach((r) => {
        unsatisfied.push(L(`MUTP {${termLabel(term)}} missing ${r}`, `MUTP {${termLabel(term)}} 缺 ${r}`));
      });
    }

    chosen.forEach((i) => {
      const row = utps[i];
      const covered = [...utpReqs[i]].join(', ');
      const key = `r${row.index}-mutp${index}`;
      if (seen.has(key)) return;
      seen.add(key);
      tests.push({
        id: key,
        row,
        label: `MUTP {${termLabel(term)}} (${covered})`,
        implicantIndex: index,
      });
    });
  });

  return {
    id: 'mutpc',
    name: 'Multiple Unique True Point Coverage',
    description:
      L('For each implicant, pick a set of UTPs so that every minor clause (clauses not in the implicant) takes both T and F at least once.', '對每個 implicant，挑選一組 UTPs，使每個次子句（不在 implicant 中的 clause）都至少出現一次 T 與一次 F。'),
    tests,
    requirementCount,
    unsatisfied,
  };
}

function nearFalsePointsFor(rows, term, literalIndex) {
  const literal = term[literalIndex];
  return rows.filter((row) => {
    if (row.predicate) return false;
    if (Boolean(row.values[literal.name]) === !literal.negated) return false;
    return term.every((lit, idx) => {
      if (idx === literalIndex) return true;
      return Boolean(row.values[lit.name]) === !lit.negated;
    });
  });
}

export function buildNFPCSet(rows, dnf) {
  const tests = [];
  const seen = new Set();
  const unsatisfied = [];
  let requirementCount = 0;

  dnf.forEach((term, index) => {
    term.forEach((literal, literalIndex) => {
      requirementCount += 1;
      const nfps = nearFalsePointsFor(rows, term, literalIndex);
      if (!nfps.length) {
        unsatisfied.push(`NFP {${termLabel(term)}} on ${literalKey(literal)}`);
        return;
      }
      const row = nfps[0];
      const key = `r${row.index}-nfp${index}-${literalIndex}`;
      if (seen.has(key)) return;
      seen.add(key);
      // 對應的 near-true point：把 literal 翻回 term 的極性後仍滿足整個 term 的列。
      const pairedTruePoint = rows.find((candidate) =>
        termSatisfiedBy(term, candidate.values)
        && Object.keys(candidate.values).every((name) => {
          if (name === literal.name) return candidate.values[name] !== row.values[name];
          return candidate.values[name] === row.values[name];
        }),
      );
      tests.push({
        id: key,
        row,
        label: L(`NFP {${termLabel(term)}} flip ${literalKey(literal)}`, `NFP {${termLabel(term)}} 翻轉 ${literalKey(literal)}`),
        implicantIndex: index,
        literal,
        pairedTruePointIndex: pairedTruePoint ? pairedTruePoint.index : null,
      });
    });
  });

  return {
    id: 'nfpc',
    name: 'Near False Point Coverage',
    description: L('For every literal in every implicant, find a row that flips that literal so the implicant becomes false and P is false.', '對每個 implicant 的每個 literal，找一個翻轉該 literal 後使 implicant 為假且 P 為假的 row。'),
    tests,
    requirementCount,
    unsatisfied,
  };
}

// MNFPC（Multiple Near False Point Coverage）：
// 對每個 implicant i 與其每個 literal l，挑一組 NFPs of (i, l)，
// 使每個次子句（不在 i 中的 clause）都至少出現一次 T 與一次 F。
export function buildMNFPCSet(rows, clauses, dnf) {
  const tests = [];
  const seen = new Set();
  const unsatisfied = [];
  let requirementCount = 0;

  dnf.forEach((term, index) => {
    const inImplicant = new Set(term.map((lit) => lit.name));
    const minorClauses = clauses.filter((c) => !inImplicant.has(c));

    term.forEach((literal, literalIndex) => {
      requirementCount += Math.max(minorClauses.length * 2, 1);
      const nfps = nearFalsePointsFor(rows, term, literalIndex);
      if (!nfps.length) {
        if (!minorClauses.length) {
          unsatisfied.push(L(`MNFP {${termLabel(term)}} flip ${literalKey(literal)}`, `MNFP {${termLabel(term)}} 翻轉 ${literalKey(literal)}`));
        } else {
          minorClauses.forEach((c) => {
            unsatisfied.push(L(`MNFP {${termLabel(term)}} flip ${literalKey(literal)} missing ${c}=T`, `MNFP {${termLabel(term)}} 翻轉 ${literalKey(literal)} 缺 ${c}=T`));
            unsatisfied.push(L(`MNFP {${termLabel(term)}} flip ${literalKey(literal)} missing ${c}=F`, `MNFP {${termLabel(term)}} 翻轉 ${literalKey(literal)} 缺 ${c}=F`));
          });
        }
        return;
      }

      if (!minorClauses.length) {
        const row = nfps[0];
        const key = `r${row.index}-mnfp${index}-${literalIndex}`;
        if (!seen.has(key)) {
          seen.add(key);
          tests.push({
            id: key,
            row,
            label: L(`MNFP {${termLabel(term)}} flip ${literalKey(literal)}`, `MNFP {${termLabel(term)}} 翻轉 ${literalKey(literal)}`),
            implicantIndex: index,
            literal,
          });
        }
        return;
      }

      const remaining = new Set();
      minorClauses.forEach((c) => {
        remaining.add(`${c}=T`);
        remaining.add(`${c}=F`);
      });

      const reqsPerNfp = nfps.map((row) => {
        const reqs = new Set();
        minorClauses.forEach((c) => {
          reqs.add(`${c}=${row.values[c] ? 'T' : 'F'}`);
        });
        return reqs;
      });

      const chosen = [];
      while (remaining.size) {
        let bestIdx = -1;
        let bestCount = 0;
        reqsPerNfp.forEach((reqs, i) => {
          if (chosen.includes(i)) return;
          let cnt = 0;
          reqs.forEach((r) => { if (remaining.has(r)) cnt += 1; });
          if (cnt > bestCount) { bestCount = cnt; bestIdx = i; }
        });
        if (bestIdx < 0) break;
        chosen.push(bestIdx);
        reqsPerNfp[bestIdx].forEach((r) => remaining.delete(r));
      }

      if (remaining.size) {
        remaining.forEach((r) => {
          unsatisfied.push(L(`MNFP {${termLabel(term)}} flip ${literalKey(literal)} missing ${r}`, `MNFP {${termLabel(term)}} 翻轉 ${literalKey(literal)} 缺 ${r}`));
        });
      }

      chosen.forEach((i) => {
        const row = nfps[i];
        const covered = [...reqsPerNfp[i]].join(', ');
        const key = `r${row.index}-mnfp${index}-${literalIndex}`;
        if (seen.has(key)) return;
        seen.add(key);
        tests.push({
          id: key,
          row,
          label: L(`MNFP {${termLabel(term)}} flip ${literalKey(literal)} (${covered})`, `MNFP {${termLabel(term)}} 翻轉 ${literalKey(literal)}（${covered}）`),
          implicantIndex: index,
          literal,
        });
      });
    });
  });

  return {
    id: 'mnfpc',
    name: 'Multiple Near False Point Coverage',
    description:
      L('For every literal in every implicant, pick a set of NFPs so that every minor clause takes both T and F at least once.', '對每個 implicant 的每個 literal，挑一組 NFPs，使每個次子句都至少出現一次 T 與一次 F。'),
    tests,
    requirementCount,
    unsatisfied,
  };
}

export function buildCUTPNFPSet(rows, dnf) {
  const tests = [];
  const seen = new Set();
  const unsatisfied = [];
  let requirementCount = 0;

  dnf.forEach((term, index) => {
    const utps = uniqueTruePointsForTerm(rows, term, dnf, index);
    term.forEach((literal, literalIndex) => {
      requirementCount += 1;
      let pair = null;
      for (const utp of utps) {
        const nfp = rows.find((row) => {
          if (row.predicate) return false;
          return Object.keys(utp.values).every((name) => {
            if (name === literal.name) return row.values[name] !== utp.values[name];
            return row.values[name] === utp.values[name];
          });
        });
        if (nfp) {
          pair = [utp, nfp];
          break;
        }
      }
      if (!pair) {
        unsatisfied.push(L(`CUTPNFP {${termLabel(term)}} flip ${literalKey(literal)}`, `CUTPNFP {${termLabel(term)}} 翻轉 ${literalKey(literal)}`));
        return;
      }
      pair.forEach((row, role) => {
        const key = `r${row.index}-cutp${index}-${literalIndex}-${role}`;
        if (seen.has(key)) return;
        seen.add(key);
        tests.push({
          id: key,
          row,
          label: L(`${role === 0 ? 'UTP' : 'NFP'} pair {${termLabel(term)}} flip ${literalKey(literal)}`, `${role === 0 ? 'UTP' : 'NFP'} pair {${termLabel(term)}} 翻轉 ${literalKey(literal)}`),
          implicantIndex: index,
          literal,
          role: role === 0 ? 'utp' : 'nfp',
          pairedRowIndex: pair[role === 0 ? 1 : 0].index,
        });
      });
    });
  });

  return {
    id: 'cutpnfp',
    name: 'Corresponding UTP + NFP Pair Coverage',
    description: L('For every literal in every implicant, pick a UTP/NFP pair that differs only in that literal.', '為每個 implicant 的每個 literal，挑一對僅在該 literal 不同的 UTP 與 NFP。'),
    tests,
    requirementCount,
    unsatisfied,
  };
}
