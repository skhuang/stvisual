// Specification-Based Mutation (Ammann/Offutt §9.4).
//
// Treats a Boolean predicate (a precondition / postcondition / invariant) as
// a specification and applies mutation operators to it. A test "kills" a
// mutant when the predicate's value differs between the original and the
// mutant for some assignment of clauses.
//
// Reuses the predicate parser from logicCoverage.js so that both modules
// accept the same surface syntax (`&&`, `||`, `!`, juxtaposition, `+`).
//
// Operators implemented:
//   ENF  Expression Negation Failure         negate the entire predicate
//   BCR  Boolean Constant Replacement        replace a clause with true|false
//   CRR  Clause Reference Replacement        replace a clause with another clause
//   LRO  Logical Operator Replacement        and ↔ or
//   UOI  Unary Operator Insertion            wrap a clause with NOT
//   MCR  Missing Clause Replacement          drop a clause from a binary op
//                                            (replace the binary node with the
//                                            surviving operand)

import { parsePredicate } from './logicCoverage.js';

export const SPEC_MUTATION_OPERATORS = ['ENF', 'BCR', 'CRR', 'LRO', 'UOI', 'MCR'];

const TRUE_NODE = { type: 'const', value: true };
const FALSE_NODE = { type: 'const', value: false };

function cloneAst(node) {
  switch (node.type) {
    case 'clause':
      return { type: 'clause', name: node.name };
    case 'const':
      return { type: 'const', value: node.value };
    case 'not':
      return { type: 'not', operand: cloneAst(node.operand) };
    case 'and':
    case 'or':
      return { type: node.type, left: cloneAst(node.left), right: cloneAst(node.right) };
    default:
      throw new Error(`Unknown AST node: ${node.type}`);
  }
}

export function evaluateAst(node, values) {
  switch (node.type) {
    case 'const':
      return Boolean(node.value);
    case 'clause': {
      if (!(node.name in values)) throw new Error(`Missing clause value: ${node.name}`);
      return Boolean(values[node.name]);
    }
    case 'not':
      return !evaluateAst(node.operand, values);
    case 'and':
      return evaluateAst(node.left, values) && evaluateAst(node.right, values);
    case 'or':
      return evaluateAst(node.left, values) || evaluateAst(node.right, values);
    default:
      throw new Error(`Unknown AST node: ${node.type}`);
  }
}

export function astToString(node) {
  switch (node.type) {
    case 'const':
      return node.value ? 'true' : 'false';
    case 'clause':
      return node.name;
    case 'not': {
      const inner = node.operand;
      const innerStr = astToString(inner);
      const needParen = inner.type === 'and' || inner.type === 'or';
      return `!${needParen ? `(${innerStr})` : innerStr}`;
    }
    case 'and':
    case 'or': {
      const op = node.type === 'and' ? '&&' : '||';
      const wrap = (child) => {
        const s = astToString(child);
        if (child.type === 'and' || child.type === 'or') return `(${s})`;
        return s;
      };
      return `${wrap(node.left)} ${op} ${wrap(node.right)}`;
    }
    default:
      throw new Error(`Unknown AST node: ${node.type}`);
  }
}

// Walk the AST in pre-order yielding [node, replace] pairs where `replace(newNode)`
// returns a fresh root with the visited node swapped out. Used by the operators
// to build per-position mutants without mutating shared structure.
function* walkWithReplacers(root) {
  function* walk(node, replaceInParent) {
    yield [node, replaceInParent];
    if (node.type === 'not') {
      yield* walk(node.operand, (newOperand) => {
        const replaced = { ...node, operand: newOperand };
        return replaceInParent(replaced);
      });
    } else if (node.type === 'and' || node.type === 'or') {
      yield* walk(node.left, (newLeft) => {
        const replaced = { ...node, left: newLeft };
        return replaceInParent(replaced);
      });
      yield* walk(node.right, (newRight) => {
        const replaced = { ...node, right: newRight };
        return replaceInParent(replaced);
      });
    }
  }
  // Track the current root via a closure so each replacer rebuilds from scratch.
  function topReplace(newRoot) {
    return cloneAst(newRoot);
  }
  yield* walk(root, topReplace);
}

function nodePosition(root, target) {
  let counter = 0;
  function visit(node) {
    if (node === target) return counter;
    counter += 1;
    if (node.type === 'not') return visit(node.operand);
    if (node.type === 'and' || node.type === 'or') {
      const l = visit(node.left);
      if (l !== undefined) return l;
      return visit(node.right);
    }
    return undefined;
  }
  return visit(root);
}

export function generateSpecMutants(parsed, opIds = SPEC_MUTATION_OPERATORS) {
  if (!parsed?.ast) throw new Error('parsed.ast is required');
  const ops = new Set(opIds);
  const mutants = [];
  const seenStrings = new Set();
  const originalStr = astToString(parsed.ast);

  const push = (operator, ast, description) => {
    const text = astToString(ast);
    if (text === originalStr) return;
    const key = `${operator}|${text}`;
    if (seenStrings.has(key)) return;
    seenStrings.add(key);
    mutants.push({
      id: `${operator}:${mutants.length}`,
      operator,
      description,
      ast,
      text,
    });
  };

  // ENF: negate the entire predicate.
  if (ops.has('ENF')) {
    push('ENF', { type: 'not', operand: cloneAst(parsed.ast) }, 'Negate the entire predicate');
  }

  // Per-position operators.
  for (const [node, replace] of walkWithReplacers(parsed.ast)) {
    if (ops.has('BCR') && node.type === 'clause') {
      push('BCR', replace(TRUE_NODE), `Replace clause '${node.name}' with true`);
      push('BCR', replace(FALSE_NODE), `Replace clause '${node.name}' with false`);
    }
    if (ops.has('CRR') && node.type === 'clause') {
      for (const other of parsed.clauses) {
        if (other === node.name) continue;
        push('CRR', replace({ type: 'clause', name: other }), `Replace clause '${node.name}' with '${other}'`);
      }
    }
    if (ops.has('LRO') && (node.type === 'and' || node.type === 'or')) {
      const swapped = node.type === 'and' ? 'or' : 'and';
      push('LRO', replace({ ...node, type: swapped }), `Replace ${node.type.toUpperCase()} with ${swapped.toUpperCase()}`);
    }
    if (ops.has('UOI') && node.type === 'clause') {
      push('UOI', replace({ type: 'not', operand: { type: 'clause', name: node.name } }), `Insert NOT around clause '${node.name}'`);
    }
    if (ops.has('MCR') && (node.type === 'and' || node.type === 'or')) {
      // Drop the right operand → keep left, and vice-versa. This is the "missing
      // clause" mutant typical of specification mutation.
      push('MCR', replace(cloneAst(node.left)), `Drop right operand of ${node.type.toUpperCase()} (keep left)`);
      push('MCR', replace(cloneAst(node.right)), `Drop left operand of ${node.type.toUpperCase()} (keep right)`);
    }
  }

  return mutants;
}

// Returns each mutant augmented with `killed` and `killers` (assignments that
// distinguish original from mutant). Tests are an array of objects mapping
// clause name -> boolean.
export function evaluateSpecMutants(parsed, mutants, tests) {
  const originalValues = tests.map((t) => evaluateAst(parsed.ast, t));
  return mutants.map((m) => {
    const killers = [];
    for (let i = 0; i < tests.length; i++) {
      let mutValue;
      try {
        mutValue = evaluateAst(m.ast, tests[i]);
      } catch {
        // Mutant references a clause not in the assignment; skip.
        continue;
      }
      if (mutValue !== originalValues[i]) {
        killers.push({ test: tests[i], orig: originalValues[i], mut: mutValue });
      }
    }
    return { ...m, killed: killers.length > 0, killers };
  });
}

// Convenience: build the full truth table over `parsed.clauses` as test cases.
export function buildAssignmentSpace(clauses) {
  const total = 1 << clauses.length;
  const out = [];
  for (let mask = 0; mask < total; mask++) {
    const values = {};
    clauses.forEach((c, i) => {
      values[c] = Boolean((mask >> (clauses.length - 1 - i)) & 1);
    });
    out.push(values);
  }
  return out;
}

// Re-export parsePredicate so consumers don't need to import from two modules.
export { parsePredicate };
