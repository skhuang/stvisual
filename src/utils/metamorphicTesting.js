// Metamorphic Testing utilities.
// Each example defines a program + a set of metamorphic relations (MRs).
// A MR is: given input x, transform it to x', then check relation R(f(x), f(x')).

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randInt(lo, hi) { return Math.floor(Math.random() * (hi - lo + 1)) + lo; }
function randArr(len, lo = 1, hi = 20) { return Array.from({ length: len }, () => randInt(lo, hi)); }
function randStr(len = randInt(3, 10)) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length: len }, () => chars[randInt(0, 25)]).join('');
}

// ---------------------------------------------------------------------------
// Program runners
// ---------------------------------------------------------------------------

function makeRunner(src, callExpr) {
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`${src}; return (${callExpr});`)();
    return (input) => {
      try { return { ok: true, value: fn(input) }; } catch (e) { return { ok: false, error: e.message }; }
    };
  } catch (e) {
    return () => ({ ok: false, error: e.message });
  }
}

function makeRunner2(src, callExpr) {
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`${src}; return (${callExpr});`)();
    return (a, b) => {
      try { return { ok: true, value: fn(a, b) }; } catch (e) { return { ok: false, error: e.message }; }
    };
  } catch (e) {
    return () => ({ ok: false, error: e.message });
  }
}

function make3Runner(src, callExpr) {
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`${src}; return (${callExpr});`)();
    return (a, b, c) => {
      try { return { ok: true, value: fn(a, b, c) }; } catch (e) { return { ok: false, error: e.message }; }
    };
  } catch (e) {
    return () => ({ ok: false, error: e.message });
  }
}

// ---------------------------------------------------------------------------
// Built-in examples
// ---------------------------------------------------------------------------

const SORT_SRC = `
function mySort(arr) {
  return [...arr].sort((a, b) => a - b);
}`.trim();

const REVERSE_SRC = `
function strReverse(s) {
  return s.split('').reverse().join('');
}`.trim();

const TRIANGLE_SRC = `
function classify(a, b, c) {
  if (a <= 0 || b <= 0 || c <= 0) return 'invalid';
  if (a + b <= c || a + c <= b || b + c <= a) return 'scalene-invalid';
  if (a === b && b === c) return 'equilateral';
  if (a === b || b === c || a === c) return 'isosceles';
  return 'scalene';
}`.trim();

const MAX_SRC = `
function arrMax(arr) {
  if (!arr.length) return null;
  return Math.max(...arr);
}`.trim();

const SEARCH_SRC = `
function linearSearch(arr, target) {
  return arr.indexOf(target);
}`.trim();

export const metamorphicExamples = [
  {
    id: 'sort',
    name: 'mySort(arr)',
    description: 'An array sorting function. Result should be deterministic regardless of input order or scale.',
    descriptionZh: '陣列排序函式。結果應與輸入順序無關，且對縮放保持一致。',
    sourceCode: SORT_SRC,
    relations: [
      {
        id: 'perm',
        name: 'Permutation Invariance',
        nameZh: '排列不變性',
        formula: 'sort(shuffle(A)) == sort(A)',
        desc: 'The sorted result should be the same regardless of the input order.',
        descZh: '輸入順序不影響排序結果。',
        generateInput: () => randArr(randInt(3, 6)),
        transform: (arr) => shuffle(arr),
        transformLabel: (arr) => `shuffle([${arr}])`,
        check: (o1, o2) => JSON.stringify(o1.value) === JSON.stringify(o2.value),
        outputRelation: 'sort(A) == sort(shuffle(A))',
        run: (arr, runner) => runner(arr),
      },
      {
        id: 'reverse',
        name: 'Reverse Invariance',
        nameZh: '反轉不變性',
        formula: 'sort(reverse(A)) == sort(A)',
        desc: 'Reversing the input before sorting gives the same result.',
        descZh: '先反轉再排序，結果與直接排序相同。',
        generateInput: () => randArr(randInt(3, 6)),
        transform: (arr) => [...arr].reverse(),
        transformLabel: (arr) => `reverse([${arr}])`,
        check: (o1, o2) => JSON.stringify(o1.value) === JSON.stringify(o2.value),
        outputRelation: 'sort(A) == sort(reverse(A))',
        run: (arr, runner) => runner(arr),
      },
      {
        id: 'scale',
        name: 'Scaling Relation',
        nameZh: '縮放關係',
        formula: 'sort(A×k)[i] == sort(A)[i] × k',
        desc: 'Multiplying all elements by k>0 should scale the sorted output by the same factor.',
        descZh: '所有元素乘以正整數 k，排序後的每個元素也會乘以 k。',
        generateInput: () => randArr(randInt(3, 5), 1, 10),
        transform: (arr) => arr.map((x) => x * 2),
        transformLabel: (arr) => `[${arr}].map(x=>x*2)`,
        check: (o1, o2) => {
          if (!o1.ok || !o2.ok) return false;
          return o1.value.every((v, i) => o2.value[i] === v * 2);
        },
        outputRelation: 'sort(A×2)[i] == sort(A)[i]×2',
        run: (arr, runner) => runner(arr),
      },
    ],
    makeRunner: () => makeRunner(SORT_SRC, '(arr) => mySort(arr)'),
  },
  {
    id: 'reverse',
    name: 'strReverse(s)',
    description: 'A string reversal function. Multiple algebraic laws should hold.',
    descriptionZh: '字串反轉函式。有多個代數性質成立。',
    sourceCode: REVERSE_SRC,
    relations: [
      {
        id: 'involution',
        name: 'Involution',
        nameZh: '對合性',
        formula: 'reverse(reverse(s)) == s',
        desc: 'Applying reverse twice gives back the original string.',
        descZh: '反轉兩次等於原字串。',
        generateInput: () => randStr(),
        transform: (s, runner) => runner(s).value ?? s,
        transformLabel: (s) => `reverse("${s}")`,
        check: (o1, o2) => o1.ok && o2.ok && o2.value === o1.value.split('').reverse().join(''),
        outputRelation: 'reverse(reverse(s)) == s',
        run: (s, runner) => {
          const r1 = runner(s);
          if (!r1.ok) return r1;
          return runner(r1.value);
        },
        isSpecial: true,
      },
      {
        id: 'length',
        name: 'Length Invariance',
        nameZh: '長度不變性',
        formula: 'len(reverse(s)) == len(s)',
        desc: 'Reversing a string does not change its length.',
        descZh: '反轉不改變字串長度。',
        generateInput: () => randStr(),
        transform: (s, runner) => runner(s).value ?? s,
        transformLabel: (s) => `reverse("${s}")`,
        check: (o1, o2) => o1.ok && o2.ok && o2.value.length === o1.value.length,
        outputRelation: 'len(reverse(s)) == len(s)',
        run: (s, runner) => runner(s),
        checkRaw: (origInput, origOut, transInput, transOut) =>
          origOut.ok && transOut.ok && transOut.value.length === origInput.length,
      },
      {
        id: 'concat',
        name: 'Concatenation Relation',
        nameZh: '串接關係',
        formula: 'reverse(a+b) == reverse(b)+reverse(a)',
        desc: 'The reverse of a concatenation equals the concatenation of the reverses in swapped order.',
        descZh: '兩個字串串接後反轉 = 各自反轉後以反序串接。',
        generateInput: () => [randStr(randInt(2, 5)), randStr(randInt(2, 5))],
        isConcat: true,
      },
    ],
    makeRunner: () => makeRunner(REVERSE_SRC, '(s) => strReverse(s)'),
  },
  {
    id: 'triangle',
    name: 'classify(a, b, c)',
    description: 'Triangle classifier. The result should be independent of side order and positive scaling.',
    descriptionZh: '三角形分類器。結果不應受邊長順序或正數縮放影響。',
    sourceCode: TRIANGLE_SRC,
    relations: [
      {
        id: 'perm',
        name: 'Permutation of Sides',
        nameZh: '邊長排列不變性',
        formula: 'classify(a,b,c) == classify(b,a,c) == classify(c,b,a)',
        desc: 'The triangle type does not depend on the order of the three sides.',
        descZh: '三角形類型不受邊長輸入順序影響。',
        generateInput: () => { const v = randInt(1,15); const w = randInt(1,15); const u = randInt(Math.abs(v-w)+1, v+w-1) || 1; return [v, w, u]; },
        transform: ([a, b, c]) => [c, a, b],
        transformLabel: ([a, b, c]) => `(${c}, ${a}, ${b})`,
        check: (o1, o2) => o1.ok && o2.ok && o1.value === o2.value,
        outputRelation: 'classify(a,b,c) == classify(c,a,b)',
        run: ([a, b, c], runner) => runner(a, b, c),
      },
      {
        id: 'scale',
        name: 'Positive Scaling',
        nameZh: '正縮放不變性',
        formula: 'classify(a,b,c) == classify(2a,2b,2c)',
        desc: 'Scaling all sides by a positive constant k does not change the triangle type.',
        descZh: '所有邊長同乘以正常數不改變三角形類型。',
        generateInput: () => { const v = randInt(1,10); const w = randInt(1,10); const u = randInt(Math.abs(v-w)+1, v+w-1) || 1; return [v, w, u]; },
        transform: ([a, b, c]) => [a * 2, b * 2, c * 2],
        transformLabel: ([a, b, c]) => `(${a*2}, ${b*2}, ${c*2})`,
        check: (o1, o2) => o1.ok && o2.ok && o1.value === o2.value,
        outputRelation: 'classify(a,b,c) == classify(2a,2b,2c)',
        run: ([a, b, c], runner) => runner(a, b, c),
      },
    ],
    makeRunner: () => make3Runner(TRIANGLE_SRC, '(a,b,c) => classify(a,b,c)'),
  },
  {
    id: 'max',
    name: 'arrMax(arr)',
    description: 'Find the maximum of an array. Two key algebraic laws relate shifted and negated inputs.',
    descriptionZh: '找陣列最大值。位移與取負有明確的代數關係。',
    sourceCode: MAX_SRC,
    relations: [
      {
        id: 'shift',
        name: 'Shift Invariance',
        nameZh: '位移關係',
        formula: 'max(A + k) == max(A) + k',
        desc: 'Adding k to every element increases the maximum by exactly k.',
        descZh: '所有元素加 k，最大值也加 k。',
        generateInput: () => randArr(randInt(2, 6)),
        transform: (arr) => arr.map((x) => x + 5),
        transformLabel: (arr) => `[${arr}].map(x=>x+5)`,
        check: (o1, o2) => o1.ok && o2.ok && o2.value === o1.value + 5,
        outputRelation: 'max(A+5) == max(A)+5',
        run: (arr, runner) => runner(arr),
      },
      {
        id: 'negate',
        name: 'Negation Relation',
        nameZh: '取負關係',
        formula: 'max(-A) == -min(A)',
        desc: 'The maximum of negated elements equals the negation of the minimum.',
        descZh: '所有元素取負後的最大值等於原陣列最小值的負數。',
        generateInput: () => randArr(randInt(2, 5)),
        transform: (arr) => arr.map((x) => -x),
        transformLabel: (arr) => `[${arr}].map(x=>-x)`,
        check: (o1, o2) => {
          if (!o1.ok || !o2.ok) return false;
          const minOrig = Math.min(...o1.value ?? []);
          return o2.value === -minOrig;
        },
        outputRelation: 'max(-A) == -min(A)',
        run: (arr, runner) => ({ ok: true, value: arr }),
        isNegate: true,
      },
    ],
    makeRunner: () => makeRunner(MAX_SRC, '(arr) => arrMax(arr)'),
  },
  {
    id: 'search',
    name: 'linearSearch(arr, target)',
    description: 'Linear search. Adding elements that are not the target should not change the result index.',
    descriptionZh: '線性搜尋。在不改變原始排列的情況下附加非目標元素，不應影響搜尋結果。',
    sourceCode: SEARCH_SRC,
    relations: [
      {
        id: 'append-nonmatch',
        name: 'Append Non-target',
        nameZh: '附加非目標元素',
        formula: 'search(A, x) == search(A ++ [y], x) where y ≠ x',
        desc: 'Appending an element that is not the target does not change the search result.',
        descZh: '在陣列末尾附加一個非目標元素，搜尋結果不變。',
        generateInput: () => {
          const arr = randArr(randInt(2, 5));
          const idx = randInt(0, arr.length - 1);
          return [arr, arr[idx]];
        },
        transformInput: ([arr, target]) => {
          let extra = randInt(1, 30);
          while (extra === target) extra = randInt(1, 30);
          return [[...arr, extra], target];
        },
        transformLabel: ([arr, target]) => `([${arr}, <y≠${target}>], ${target})`,
        check: (o1, o2) => o1.ok && o2.ok && o1.value === o2.value,
        outputRelation: 'indexOf result unchanged',
        isSearch: true,
      },
      {
        id: 'duplicate',
        name: 'Duplicate Element',
        nameZh: '重複目標元素',
        formula: 'search(A, x) == search(A ++ [x], x)',
        desc: 'Appending another copy of the target at the end does not change the first occurrence index.',
        descZh: '在末尾再加一個目標元素，不改變第一個出現的索引值。',
        generateInput: () => {
          const arr = randArr(randInt(2, 5));
          const idx = randInt(0, arr.length - 1);
          return [arr, arr[idx]];
        },
        transformInput: ([arr, target]) => [[...arr, target], target],
        transformLabel: ([arr, target]) => `([${arr}, ${target}], ${target})`,
        check: (o1, o2) => o1.ok && o2.ok && o1.value === o2.value,
        outputRelation: 'first occurrence index unchanged',
        isSearch: true,
      },
    ],
    makeRunner: () => makeRunner2(SEARCH_SRC, '(arr, target) => linearSearch(arr, target)'),
  },
];

/**
 * Generate N test pairs for a given example + relation.
 * Returns array of {id, input, transformedInput, output, transformedOutput, holds}.
 */
export function generateMrTests(example, relation, count = 8) {
  const runner = example.makeRunner();
  const results = [];

  for (let i = 0; i < count; i++) {
    try {
      if (relation.isConcat) {
        // Special case: strReverse concat relation
        const [s1, s2] = relation.generateInput();
        const catRunner = makeRunner(REVERSE_SRC, '(s) => strReverse(s)');
        const origOut   = catRunner(s1 + s2);
        const r1 = catRunner(s1);
        const r2 = catRunner(s2);
        const transOut = (!r1.ok || !r2.ok) ? { ok: false, error: 'error' } : { ok: true, value: r2.value + r1.value };
        const holds = origOut.ok && transOut.ok && origOut.value === transOut.value;
        results.push({
          id: `mr-${i}`,
          input: JSON.stringify([s1, s2]),
          transformedInput: `reverse("${s2}") + reverse("${s1}")`,
          output: formatVal(origOut),
          transformedOutput: formatVal(transOut),
          holds,
          origOk: origOut.ok,
          transOk: transOut.ok,
        });
        continue;
      }

      if (relation.isSpecial) {
        // involution: run reverse twice
        const input = relation.generateInput();
        const r1 = runner(input);
        const r2 = runner(r1.ok ? r1.value : input);
        const holds = r2.ok && r2.value === input;
        results.push({
          id: `mr-${i}`,
          input: JSON.stringify(input),
          transformedInput: `reverse(reverse("${input}"))`,
          output: formatVal(r1),
          transformedOutput: formatVal(r2),
          holds,
          origOk: r1.ok,
          transOk: r2.ok,
        });
        continue;
      }

      if (relation.isSearch) {
        const runner2 = example.makeRunner();
        const input = relation.generateInput();
        const [arr, target] = input;
        const [transArr, transTgt] = relation.transformInput(input);
        const origOut  = runner2(arr, target);
        const transOut = runner2(transArr, transTgt);
        const holds = relation.check(origOut, transOut);
        results.push({
          id: `mr-${i}`,
          input: `([${arr}], ${target})`,
          transformedInput: relation.transformLabel(input),
          output: formatVal(origOut),
          transformedOutput: formatVal(transOut),
          holds,
          origOk: origOut.ok,
          transOk: transOut.ok,
        });
        continue;
      }

      if (relation.isNegate) {
        const input = relation.generateInput();
        const negInput = input.map((x) => -x);
        const origOut  = runner(input);
        const transOut = runner(negInput);
        const min = Math.min(...input);
        const holds = transOut.ok && transOut.value === -min;
        results.push({
          id: `mr-${i}`,
          input: JSON.stringify(input),
          transformedInput: relation.transformLabel(input),
          output: formatVal(origOut),
          transformedOutput: formatVal(transOut),
          holds,
          origOk: origOut.ok,
          transOk: transOut.ok,
        });
        continue;
      }

      const input = relation.generateInput();
      const transInput = relation.transform(input, runner);
      const origOut  = relation.run(input, runner);
      const transOut = relation.run(transInput, runner);
      const holds = relation.check(origOut, transOut);
      results.push({
        id: `mr-${i}`,
        input: Array.isArray(input) ? `[${input}]` : JSON.stringify(input),
        transformedInput: relation.transformLabel ? relation.transformLabel(input) : JSON.stringify(transInput),
        output: formatVal(origOut),
        transformedOutput: formatVal(transOut),
        holds,
        origOk: origOut.ok,
        transOk: transOut.ok,
      });
    } catch (e) {
      results.push({
        id: `mr-${i}`,
        input: '?', transformedInput: '?', output: '?', transformedOutput: '?',
        holds: false, origOk: false, transOk: false,
      });
    }
  }
  return results;
}

function formatVal(result) {
  if (!result.ok) return `Error: ${result.error}`;
  if (Array.isArray(result.value)) return `[${result.value}]`;
  return String(result.value);
}
