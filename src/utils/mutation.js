// Program Mutation utilities (Ammann & Offutt, Chapter 9 — Syntax-Based Testing).
//
// MVP 範圍：
//   - 目標語言：純 JavaScript 函式（單一 return / 無副作用為主）。
//   - Mutation operators：
//       AOR (Arithmetic Operator Replacement)
//       ROR (Relational Operator Replacement)
//       LOR (Logical Operator Replacement)
//       COR (Conditional Operator Replacement，含位元/條件）
//       UOI (Unary Operator Insertion，僅 ! 與 -)
//       ABS (Absolute Value Insertion，將 expr 取代為 Math.abs(expr))
//
// 突變方式：以 token 取代為主（不依賴完整 AST），確保 MVP 可控。
// 評估方式：使用 new Function(...params, body) 在當前 JS engine 內執行。
//   - 若執行拋例外 / 超過步數限制，視該 mutant 為被該 test「killed」。
//   - 若所有 test 結果都與原程式相同，mutant 為 live；可由使用者標記 equivalent。

const OPERATORS = {
  AOR: ['+', '-', '*', '/', '%'],
  ROR: ['<', '<=', '>', '>=', '==', '!=', '===', '!=='],
  LOR: ['&&', '||'],
  COR: ['&&', '||'], // 同 LOR，但與 ! 一同套用時為條件運算的補集
};

// 排序使長 token 先比對（避免 `==` 被 `=` 比中）。
const SORTED = {
  AOR: [...OPERATORS.AOR].sort((a, b) => b.length - a.length),
  ROR: [...OPERATORS.ROR].sort((a, b) => b.length - a.length),
  LOR: [...OPERATORS.LOR].sort((a, b) => b.length - a.length),
  COR: [...OPERATORS.COR].sort((a, b) => b.length - a.length),
};

// 內建 AOI 與 UOI 的位置條件：在識別字 / 數字 / 右括號之前 / 之後插入 `!` 或 `-`。
const ID_REGEX = /[A-Za-z_$][A-Za-z0-9_$]*/y;
const NUM_REGEX = /\d+(?:\.\d+)?/y;

function isIdentChar(ch) {
  return /[A-Za-z0-9_$]/.test(ch);
}

// 判斷某個位置是否在字串字面值或註解中（避免 mutate 字串內容）。
function buildSkipMap(source) {
  const skip = new Array(source.length).fill(false);
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];
    if (ch === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') { skip[i] = true; i += 1; }
    } else if (ch === '/' && next === '*') {
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) {
        skip[i] = true;
        i += 1;
      }
      if (i < source.length) { skip[i] = skip[i + 1] = true; i += 2; }
    } else if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      skip[i] = true;
      i += 1;
      while (i < source.length && source[i] !== quote) {
        if (source[i] === '\\') { skip[i] = skip[i + 1] = true; i += 2; }
        else { skip[i] = true; i += 1; }
      }
      if (i < source.length) { skip[i] = true; i += 1; }
    } else {
      i += 1;
    }
  }
  return skip;
}

function lineColOf(source, index) {
  let line = 1;
  let col = 1;
  for (let i = 0; i < index && i < source.length; i += 1) {
    if (source[i] === '\n') { line += 1; col = 1; } else { col += 1; }
  }
  return { line, col };
}

function applyReplacement(source, start, end, replacement) {
  return source.slice(0, start) + replacement + source.slice(end);
}

function findOperatorOccurrences(source, operatorList, skip) {
  const hits = [];
  for (let i = 0; i < source.length; i += 1) {
    if (skip[i]) continue;
    for (const op of operatorList) {
      if (i + op.length > source.length) continue;
      if (source.slice(i, i + op.length) !== op) continue;
      // 防止 `=` 取到 `==`：左右字元不可組成更長運算子。
      const before = source[i - 1] || '';
      const after = source[i + op.length] || '';
      // 排除 `===` 在比 `==` 時被誤截斷：若 after 也是 `=` 而 op 不含 `=`，跳過。
      if (op === '=' || op.endsWith('=')) {
        // 不應出現，因為 OPERATORS 不包含 `=`
      }
      // 排除 `+=` `-=` `*=` 等指派
      if (after === '=' && op.length === 1 && '+-*/%'.includes(op)) continue;
      // 排除 `**` 連寫被當成 `*`
      if (op === '*' && (before === '*' || after === '*')) continue;
      // 排除 `||=` `&&=`
      if ((op === '||' || op === '&&') && after === '=') continue;
      // 排除 `<<` `>>` `>>>` 被當成 `<` 或 `>`
      if (op === '<' && (after === '<' || before === '<')) continue;
      if (op === '>' && (after === '>' || before === '>')) continue;
      hits.push({ start: i, end: i + op.length, text: op });
      i += op.length - 1;
      break;
    }
  }
  return hits;
}

function findIdentifierOccurrences(source, skip) {
  const hits = [];
  let i = 0;
  while (i < source.length) {
    if (skip[i]) { i += 1; continue; }
    ID_REGEX.lastIndex = i;
    const m = ID_REGEX.exec(source);
    if (m && m.index === i) {
      // 過濾關鍵字
      const keywords = new Set([
        'true', 'false', 'null', 'undefined', 'return', 'if', 'else', 'for',
        'while', 'do', 'switch', 'case', 'break', 'continue', 'function',
        'var', 'let', 'const', 'new', 'typeof', 'in', 'of', 'this',
      ]);
      if (!keywords.has(m[0])) {
        hits.push({ start: i, end: i + m[0].length, text: m[0] });
      }
      i += m[0].length;
    } else {
      i += 1;
    }
  }
  return hits;
}

function generateForOperator(source, opName, skip, idCounter) {
  const list = SORTED[opName];
  if (!list) return [];
  const hits = findOperatorOccurrences(source, list, skip);
  const mutants = [];
  hits.forEach((hit) => {
    list.forEach((replacement) => {
      if (replacement === hit.text) return;
      const mutated = applyReplacement(source, hit.start, hit.end, replacement);
      const { line, col } = lineColOf(source, hit.start);
      mutants.push({
        id: `M${idCounter.value++}`,
        operator: opName,
        line, col,
        original: hit.text,
        mutated: replacement,
        source: mutated,
        status: 'live',
        killedBy: [],
      });
    });
  });
  return mutants;
}

function generateUOI(source, skip, idCounter) {
  const hits = findIdentifierOccurrences(source, skip);
  const mutants = [];
  hits.forEach((hit) => {
    ['!', '-'].forEach((unary) => {
      const mutated = applyReplacement(source, hit.start, hit.end, `${unary}${hit.text}`);
      const { line, col } = lineColOf(source, hit.start);
      mutants.push({
        id: `M${idCounter.value++}`,
        operator: 'UOI',
        line, col,
        original: hit.text,
        mutated: `${unary}${hit.text}`,
        source: mutated,
        status: 'live',
        killedBy: [],
      });
    });
  });
  return mutants;
}

function generateABS(source, skip, idCounter) {
  // 將每個識別字（變數）替換為 (-x) 與 ((x)===0 ? 1 : x) 兩種變體較複雜，
  // MVP 採用 Math.abs(x) 與 -(x)（負值化）兩種突變。
  const hits = findIdentifierOccurrences(source, skip);
  const mutants = [];
  hits.forEach((hit) => {
    const variants = [
      { suffix: 'abs', text: `Math.abs(${hit.text})` },
      { suffix: 'neg', text: `(-(${hit.text}))` },
    ];
    variants.forEach(({ suffix, text }) => {
      const mutated = applyReplacement(source, hit.start, hit.end, text);
      const { line, col } = lineColOf(source, hit.start);
      mutants.push({
        id: `M${idCounter.value++}`,
        operator: 'ABS',
        line, col,
        original: hit.text,
        mutated: text,
        source: mutated,
        status: 'live',
        killedBy: [],
        variant: suffix,
      });
    });
  });
  return mutants;
}

export function generateMutants(source, operators = ['AOR', 'ROR', 'LOR', 'UOI']) {
  const skip = buildSkipMap(source);
  const idCounter = { value: 1 };
  const out = [];
  operators.forEach((op) => {
    if (op === 'UOI') {
      out.push(...generateUOI(source, skip, idCounter));
    } else if (op === 'ABS') {
      out.push(...generateABS(source, skip, idCounter));
    } else {
      out.push(...generateForOperator(source, op, skip, idCounter));
    }
  });
  return out;
}

// ---------------- 執行與計分 ----------------

function compileFunction(params, body) {
  // 安全：函式只接受指定 params；body 由使用者輸入，視同信任本機開發者。
  // eslint-disable-next-line no-new-func
  return new Function(...params, body);
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'number' && Number.isNaN(a) && Number.isNaN(b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ak = Object.keys(a); const bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    return ak.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

function runOnce(fn, args) {
  try {
    const result = fn(...args);
    return { ok: true, value: result };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  }
}

export function runTestSuite(params, body, tests) {
  const fn = compileFunction(params, body);
  return tests.map((t) => {
    const outcome = runOnce(fn, t.args);
    const expected = t.expected;
    const passed = outcome.ok && deepEqual(outcome.value, expected);
    return { id: t.id, passed, outcome };
  });
}

export function evaluateMutants(params, body, tests, mutants) {
  // 先計算原程式輸出，作為 oracle。
  const baseFn = compileFunction(params, body);
  const baseOutcomes = tests.map((t) => runOnce(baseFn, t.args));

  return mutants.map((m) => {
    let mutantFn;
    try {
      mutantFn = compileFunction(params, m.source);
    } catch (err) {
      // 編譯錯誤視為被所有 test killed（語法等價已被消除）。
      return { ...m, status: 'killed', killedBy: tests.map((t) => t.id), compileError: err?.message };
    }
    const killedBy = [];
    tests.forEach((t, i) => {
      const base = baseOutcomes[i];
      const mut = runOnce(mutantFn, t.args);
      const sameOk = base.ok === mut.ok;
      const sameValue = sameOk && (base.ok ? deepEqual(base.value, mut.value) : true);
      if (!sameOk || !sameValue) killedBy.push(t.id);
    });
    return {
      ...m,
      status: killedBy.length ? 'killed' : 'live',
      killedBy,
    };
  });
}

export function computeMutationScore(mutants) {
  const total = mutants.length;
  const equivalent = mutants.filter((m) => m.status === 'equivalent').length;
  const killed = mutants.filter((m) => m.status === 'killed').length;
  const live = mutants.filter((m) => m.status === 'live').length;
  const denominator = total - equivalent;
  const score = denominator === 0 ? 1 : killed / denominator;
  return { total, killed, live, equivalent, score };
}
