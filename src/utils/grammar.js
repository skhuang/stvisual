// Grammar-Based Testing utilities (Ammann/Offutt style).
//
// Grammar text format (BNF-like, line-based):
//   <S> ::= <A> | <A> "+" <S>
//   <A> ::= "0" | "1"
// - Non-terminals: angle-bracketed identifiers, e.g. <expr>.
// - Terminals: double-quoted strings, e.g. "0".
// - "|" separates alternatives; whitespace between symbols.
// - First production's LHS is the start symbol (unless overridden).
// - Empty RHS is written as the literal token "" (empty terminal) or by writing
//   nothing after "::=", which we treat as an epsilon production.
//
// Exports:
//   parseGrammar(text) -> Grammar
//   generateDerivations(grammar, options) -> Derivation[]
//   computeCoverage(derivations, grammar) -> { pdc, tsc }
//   generateGrammarMutants(grammar, opIds) -> Mutant[]
//
// A Grammar is:
//   { start: string,
//     productions: [{ id: number, lhs: string, rhs: Symbol[] }],
//     nonTerminals: Set<string>,
//     terminals: Set<string> }
// where Symbol = { kind: 'NT'|'T', value: string }.

const NT_PATTERN = /<([^<>\s]+)>/y;
const TERMINAL_PATTERN = /"((?:[^"\\]|\\.)*)"/y;

function tokenizeRhs(text) {
  const tokens = [];
  let i = 0;
  const len = text.length;
  while (i < len) {
    const ch = text[i];
    if (ch === ' ' || ch === '\t') { i++; continue; }
    if (ch === '<') {
      NT_PATTERN.lastIndex = i;
      const m = NT_PATTERN.exec(text);
      if (!m) throw new Error(`Invalid non-terminal at position ${i}: "${text.slice(i, i + 12)}"`);
      tokens.push({ kind: 'NT', value: m[1] });
      i = NT_PATTERN.lastIndex;
      continue;
    }
    if (ch === '"') {
      TERMINAL_PATTERN.lastIndex = i;
      const m = TERMINAL_PATTERN.exec(text);
      if (!m) throw new Error(`Unterminated terminal at position ${i}: "${text.slice(i, i + 12)}"`);
      tokens.push({ kind: 'T', value: m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\') });
      i = TERMINAL_PATTERN.lastIndex;
      continue;
    }
    throw new Error(`Unexpected character "${ch}" at position ${i}`);
  }
  return tokens;
}

export function parseGrammar(text) {
  if (typeof text !== 'string') throw new Error('Grammar must be a string.');
  const lines = text.split(/\r?\n/);
  const productions = [];
  const nonTerminals = new Set();
  const terminals = new Set();
  let start = null;
  let nextId = 0;

  for (let lineNo = 0; lineNo < lines.length; lineNo++) {
    const raw = lines[lineNo].trim();
    if (!raw || raw.startsWith('#') || raw.startsWith('//')) continue;
    const sepIdx = raw.indexOf('::=');
    if (sepIdx === -1) {
      throw new Error(`Line ${lineNo + 1}: missing "::=".`);
    }
    const lhsText = raw.slice(0, sepIdx).trim();
    const rhsText = raw.slice(sepIdx + 3);
    const lhsTokens = tokenizeRhs(lhsText);
    if (lhsTokens.length !== 1 || lhsTokens[0].kind !== 'NT') {
      throw new Error(`Line ${lineNo + 1}: LHS must be a single non-terminal like "<S>".`);
    }
    const lhs = lhsTokens[0].value;
    nonTerminals.add(lhs);
    if (start === null) start = lhs;

    const alternatives = splitAlternatives(rhsText);
    for (const alt of alternatives) {
      const rhs = tokenizeRhs(alt);
      for (const sym of rhs) {
        if (sym.kind === 'NT') nonTerminals.add(sym.value);
        else terminals.add(sym.value);
      }
      productions.push({ id: nextId++, lhs, rhs });
    }
  }

  if (productions.length === 0) {
    throw new Error('Grammar has no productions.');
  }

  return { start, productions, nonTerminals, terminals };
}

// Split RHS text on top-level "|" (none of our tokens contain "|"
// because terminals are quoted). Quoted strings may contain "|".
function splitAlternatives(rhsText) {
  const parts = [];
  let current = '';
  let inString = false;
  for (let i = 0; i < rhsText.length; i++) {
    const ch = rhsText[i];
    if (ch === '"') { inString = !inString; current += ch; continue; }
    if (ch === '\\' && inString) { current += ch + (rhsText[++i] || ''); continue; }
    if (ch === '|' && !inString) { parts.push(current); current = ''; continue; }
    current += ch;
  }
  parts.push(current);
  return parts.map((p) => p.trim());
}

// Produce up to `maxStrings` distinct derived strings via leftmost derivation.
// Uses BFS so shorter strings come first; bounds protect against unbounded grammars.
export function generateDerivations(grammar, options = {}) {
  const maxStrings = options.maxStrings ?? 12;
  const maxDepth = options.maxDepth ?? 20;
  const maxStringLen = options.maxStringLen ?? 60;

  const startSym = options.start || grammar.start;
  const initial = {
    sentential: [{ kind: 'NT', value: startSym }],
    productionsUsed: [],
    depth: 0,
  };
  const queue = [initial];
  const results = [];
  const seenStrings = new Set();
  let iterations = 0;
  const iterationCap = 50000;

  while (queue.length > 0 && results.length < maxStrings && iterations < iterationCap) {
    iterations++;
    const node = queue.shift();
    const firstNT = node.sentential.findIndex((s) => s.kind === 'NT');
    if (firstNT === -1) {
      const stringValue = node.sentential.map((s) => s.value).join('');
      if (!seenStrings.has(stringValue)) {
        seenStrings.add(stringValue);
        results.push({
          string: stringValue,
          productionsUsed: node.productionsUsed,
          depth: node.depth,
        });
      }
      continue;
    }
    if (node.depth >= maxDepth) continue;
    const sym = node.sentential[firstNT];
    const matching = grammar.productions.filter((p) => p.lhs === sym.value);
    for (const prod of matching) {
      const next = [
        ...node.sentential.slice(0, firstNT),
        ...prod.rhs,
        ...node.sentential.slice(firstNT + 1),
      ];
      // Quick length pruning: terminals already laid down + any further NT must
      // produce at least 0 chars; just cap on terminals seen so far.
      const currentTermLen = next.filter((s) => s.kind === 'T').reduce((sum, s) => sum + s.value.length, 0);
      if (currentTermLen > maxStringLen) continue;
      queue.push({
        sentential: next,
        productionsUsed: [...node.productionsUsed, prod.id],
        depth: node.depth + 1,
      });
    }
  }

  return results;
}

export function computeCoverage(derivations, grammar) {
  const allProductionIds = new Set(grammar.productions.map((p) => p.id));
  const allTerminals = new Set(grammar.terminals);
  const usedProductions = new Set();
  const usedTerminals = new Set();

  const productionLookup = new Map(grammar.productions.map((p) => [p.id, p]));
  for (const d of derivations) {
    for (const pid of d.productionsUsed) {
      usedProductions.add(pid);
      const prod = productionLookup.get(pid);
      if (prod) {
        for (const sym of prod.rhs) {
          if (sym.kind === 'T') usedTerminals.add(sym.value);
        }
      }
    }
  }

  const denom = (s) => (s.size === 0 ? 1 : s.size);
  return {
    pdc: {
      covered: usedProductions,
      all: allProductionIds,
      ratio: usedProductions.size / denom(allProductionIds),
    },
    tsc: {
      covered: usedTerminals,
      all: allTerminals,
      ratio: usedTerminals.size / denom(allTerminals),
    },
  };
}

// Grammar mutation operators (Ammann/Offutt §9):
//   TR  Terminal Replacement:  swap a terminal for another from the alphabet
//   PR  Production Replacement: swap an RHS for another LHS's first RHS
//   SD  Symbol Deletion:        delete one symbol from an RHS
//   DUP Symbol Duplication:     duplicate one symbol on an RHS
export const GRAMMAR_OPERATORS = ['TR', 'PR', 'SD', 'DUP'];

function cloneGrammar(grammar) {
  return {
    start: grammar.start,
    productions: grammar.productions.map((p) => ({
      id: p.id,
      lhs: p.lhs,
      rhs: p.rhs.map((s) => ({ ...s })),
    })),
    nonTerminals: new Set(grammar.nonTerminals),
    terminals: new Set(grammar.terminals),
  };
}

function formatProduction(prod) {
  const rhsText = prod.rhs.length === 0
    ? '""'
    : prod.rhs.map((s) => (s.kind === 'NT' ? `<${s.value}>` : `"${s.value}"`)).join(' ');
  return `<${prod.lhs}> ::= ${rhsText}`;
}

export function generateGrammarMutants(grammar, opIds = GRAMMAR_OPERATORS) {
  const mutants = [];
  const ops = new Set(opIds);
  const terms = [...grammar.terminals];

  if (ops.has('TR') && terms.length >= 2) {
    grammar.productions.forEach((prod, pIdx) => {
      prod.rhs.forEach((sym, sIdx) => {
        if (sym.kind !== 'T') return;
        for (const replacement of terms) {
          if (replacement === sym.value) continue;
          const mutated = cloneGrammar(grammar);
          mutated.productions[pIdx].rhs[sIdx] = { kind: 'T', value: replacement };
          mutants.push({
            id: `TR:p${prod.id}:s${sIdx}:${replacement}`,
            operator: 'TR',
            description: `Replace "${sym.value}" with "${replacement}" in ${formatProduction(prod)}`,
            grammar: mutated,
          });
        }
      });
    });
  }

  if (ops.has('PR')) {
    const firstByLhs = new Map();
    grammar.productions.forEach((p) => { if (!firstByLhs.has(p.lhs)) firstByLhs.set(p.lhs, p); });
    grammar.productions.forEach((prod, pIdx) => {
      for (const [otherLhs, otherProd] of firstByLhs) {
        if (otherLhs === prod.lhs) continue;
        const mutated = cloneGrammar(grammar);
        mutated.productions[pIdx].rhs = otherProd.rhs.map((s) => ({ ...s }));
        mutants.push({
          id: `PR:p${prod.id}:from-${otherLhs}`,
          operator: 'PR',
          description: `Replace RHS of ${formatProduction(prod)} with RHS of <${otherLhs}>`,
          grammar: mutated,
        });
      }
    });
  }

  if (ops.has('SD')) {
    grammar.productions.forEach((prod, pIdx) => {
      if (prod.rhs.length === 0) return;
      prod.rhs.forEach((sym, sIdx) => {
        const mutated = cloneGrammar(grammar);
        mutated.productions[pIdx].rhs.splice(sIdx, 1);
        mutants.push({
          id: `SD:p${prod.id}:s${sIdx}`,
          operator: 'SD',
          description: `Delete ${sym.kind === 'NT' ? `<${sym.value}>` : `"${sym.value}"`} from ${formatProduction(prod)}`,
          grammar: mutated,
        });
      });
    });
  }

  if (ops.has('DUP')) {
    grammar.productions.forEach((prod, pIdx) => {
      prod.rhs.forEach((sym, sIdx) => {
        const mutated = cloneGrammar(grammar);
        mutated.productions[pIdx].rhs.splice(sIdx, 0, { ...sym });
        mutants.push({
          id: `DUP:p${prod.id}:s${sIdx}`,
          operator: 'DUP',
          description: `Duplicate ${sym.kind === 'NT' ? `<${sym.value}>` : `"${sym.value}"`} in ${formatProduction(prod)}`,
          grammar: mutated,
        });
      });
    });
  }

  return mutants;
}

// Decide whether a string belongs to the language of `grammar`. Uses a
// memoized recursive descent over the production set with depth/length bounds.
// Sufficient for the small teaching grammars we ship; not a full CYK parser.
export function recognizes(grammar, input, options = {}) {
  const maxDepth = options.maxDepth ?? 40;
  const memo = new Map();

  function tryNT(name, pos, depth) {
    if (depth > maxDepth) return [];
    const key = `${name}@${pos}@${depth}`;
    if (memo.has(key)) return memo.get(key);
    const matches = [];
    for (const prod of grammar.productions) {
      if (prod.lhs !== name) continue;
      const ends = trySequence(prod.rhs, 0, pos, depth + 1);
      for (const e of ends) matches.push(e);
    }
    const dedup = [...new Set(matches)];
    memo.set(key, dedup);
    return dedup;
  }

  function trySequence(seq, idx, pos, depth) {
    if (idx === seq.length) return [pos];
    const sym = seq[idx];
    const ends = [];
    if (sym.kind === 'T') {
      const v = sym.value;
      if (input.slice(pos, pos + v.length) === v) {
        const next = trySequence(seq, idx + 1, pos + v.length, depth);
        for (const e of next) ends.push(e);
      }
    } else {
      const matches = tryNT(sym.value, pos, depth);
      for (const m of matches) {
        const next = trySequence(seq, idx + 1, m, depth);
        for (const e of next) ends.push(e);
      }
    }
    return [...new Set(ends)];
  }

  return tryNT(grammar.start, 0, 0).includes(input.length);
}

// A test string "kills" a grammar mutant when membership in the original
// grammar's language differs from membership in the mutant's language.
export function evaluateMutantsAgainstStrings(originalGrammar, mutants, strings, recOptions) {
  const originalAccepts = strings.map((s) => recognizes(originalGrammar, s, recOptions));
  return mutants.map((m) => {
    const mutantAccepts = strings.map((s) => recognizes(m.grammar, s, recOptions));
    const killers = [];
    for (let i = 0; i < strings.length; i++) {
      if (originalAccepts[i] !== mutantAccepts[i]) {
        killers.push({ string: strings[i], origAccepts: originalAccepts[i], mutAccepts: mutantAccepts[i] });
      }
    }
    return {
      ...m,
      killed: killers.length > 0,
      killers,
    };
  });
}

// ----- Phase 3: Mutation on Strings (BNF Mutation) ------------------------
// Apply mutation operators to a seed string (typically a derivation produced
// by `generateDerivations`). Each mutant is a candidate test input; combined
// with `recognizes` it yields positive (in-language) and negative
// (out-of-language) tests for the system under test.
//
// Operators (Ammann/Offutt §9.2):
//   REP  Replace one character with another from the alphabet
//   DEL  Delete one character
//   DUP  Duplicate one character
//   INS  Insert a character from the alphabet at a position
//   SWP  Swap two adjacent (different) characters
export const STRING_MUTATION_OPERATORS = ['REP', 'DEL', 'DUP', 'INS', 'SWP'];

export function deriveAlphabet(grammar, seedStrings = []) {
  const set = new Set();
  if (grammar?.terminals) {
    for (const t of grammar.terminals) {
      // Decompose multi-character terminals into characters so the mutated
      // strings stay within the surface alphabet of the language.
      for (const ch of String(t)) set.add(ch);
    }
  }
  for (const s of seedStrings) {
    for (const ch of String(s)) set.add(ch);
  }
  return [...set];
}

export function generateStringMutants(seed, opIds = STRING_MUTATION_OPERATORS, options = {}) {
  if (typeof seed !== 'string') throw new Error('Seed must be a string.');
  const ops = new Set(opIds);
  const alphabet = (options.alphabet && options.alphabet.length > 0)
    ? [...new Set(options.alphabet)]
    : [...new Set(seed.split(''))];
  const maxPerOp = options.maxPerOp ?? 30;
  const out = [];
  const seen = new Set();

  const push = (operator, mutated, description) => {
    if (mutated === seed) return;
    const key = `${operator}|${mutated}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({
      id: `${operator}:${out.length}`,
      operator,
      original: seed,
      mutated,
      description,
    });
  };

  if (ops.has('REP')) {
    let count = 0;
    outer: for (let i = 0; i < seed.length; i++) {
      for (const ch of alphabet) {
        if (ch === seed[i]) continue;
        push('REP', seed.slice(0, i) + ch + seed.slice(i + 1),
          `Replace position ${i} '${seed[i]}' → '${ch}'`);
        count++;
        if (count >= maxPerOp) break outer;
      }
    }
  }

  if (ops.has('DEL')) {
    let count = 0;
    for (let i = 0; i < seed.length; i++) {
      push('DEL', seed.slice(0, i) + seed.slice(i + 1),
        `Delete position ${i} '${seed[i]}'`);
      count++;
      if (count >= maxPerOp) break;
    }
  }

  if (ops.has('DUP')) {
    let count = 0;
    for (let i = 0; i < seed.length; i++) {
      push('DUP', seed.slice(0, i + 1) + seed[i] + seed.slice(i + 1),
        `Duplicate position ${i} '${seed[i]}'`);
      count++;
      if (count >= maxPerOp) break;
    }
  }

  if (ops.has('INS')) {
    let count = 0;
    outer: for (let i = 0; i <= seed.length; i++) {
      for (const ch of alphabet) {
        push('INS', seed.slice(0, i) + ch + seed.slice(i),
          `Insert '${ch}' at position ${i}`);
        count++;
        if (count >= maxPerOp) break outer;
      }
    }
  }

  if (ops.has('SWP')) {
    let count = 0;
    for (let i = 0; i < seed.length - 1; i++) {
      if (seed[i] === seed[i + 1]) continue;
      push('SWP', seed.slice(0, i) + seed[i + 1] + seed[i] + seed.slice(i + 2),
        `Swap positions ${i}/${i + 1}`);
      count++;
      if (count >= maxPerOp) break;
    }
  }

  return out;
}

// Classify each string mutant by language membership against the grammar.
// Returns each mutant augmented with origAccepts / mutAccepts and a `kind`
// of either 'positive' (in-language → exercises the parser's accept path)
// or 'negative' (out-of-language → exercises error handling).
export function classifyStringMutants(grammar, mutants, recOptions) {
  const cache = new Map();
  const accepts = (s) => {
    if (cache.has(s)) return cache.get(s);
    const v = recognizes(grammar, s, recOptions);
    cache.set(s, v);
    return v;
  };
  return mutants.map((m) => {
    const origAccepts = accepts(m.original);
    const mutAccepts = accepts(m.mutated);
    return {
      ...m,
      origAccepts,
      mutAccepts,
      kind: mutAccepts ? 'positive' : 'negative',
      flipped: origAccepts !== mutAccepts,
    };
  });
}
