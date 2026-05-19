// Authored TDD sessions for the TDD Cycle Explorer. Each step is the full
// snapshot AFTER that step. No interpreter — hand-authored, the same idiom
// as src/data/slicingExamples.js. tddKatas.test.js enforces the invariants.

const FIZZBUZZ = {
  id: 'fizzbuzz',
  titleKey: 'tdd.kata.fizzbuzz',
  steps: [
    {
      phase: 'red',
      testList: [{ name: 'fizzbuzz(1) === "1"', status: 'red' }],
      code: '',
      suite: { passing: 0, failing: 1 },
      noteKey: 'tdd.kata.fizzbuzz.s1',
    },
    {
      phase: 'green',
      testList: [{ name: 'fizzbuzz(1) === "1"', status: 'green' }],
      code: 'function fizzbuzz(n) {\n  return "1";\n}',
      suite: { passing: 1, failing: 0 },
      noteKey: 'tdd.kata.fizzbuzz.s2',
    },
    {
      phase: 'red',
      testList: [
        { name: 'fizzbuzz(1) === "1"', status: 'green' },
        { name: 'fizzbuzz(3) === "Fizz"', status: 'red' },
      ],
      code: 'function fizzbuzz(n) {\n  return "1";\n}',
      suite: { passing: 1, failing: 1 },
      noteKey: 'tdd.kata.fizzbuzz.s3',
    },
    {
      phase: 'green',
      testList: [
        { name: 'fizzbuzz(1) === "1"', status: 'green' },
        { name: 'fizzbuzz(3) === "Fizz"', status: 'green' },
      ],
      code: 'function fizzbuzz(n) {\n  if (n % 3 === 0) return "Fizz";\n  return String(n);\n}',
      suite: { passing: 2, failing: 0 },
      noteKey: 'tdd.kata.fizzbuzz.s4',
    },
    {
      phase: 'red',
      testList: [
        { name: 'fizzbuzz(1) === "1"', status: 'green' },
        { name: 'fizzbuzz(3) === "Fizz"', status: 'green' },
        { name: 'fizzbuzz(5) === "Buzz"', status: 'red' },
      ],
      code: 'function fizzbuzz(n) {\n  if (n % 3 === 0) return "Fizz";\n  return String(n);\n}',
      suite: { passing: 2, failing: 1 },
      noteKey: 'tdd.kata.fizzbuzz.s5',
    },
    {
      phase: 'green',
      testList: [
        { name: 'fizzbuzz(1) === "1"', status: 'green' },
        { name: 'fizzbuzz(3) === "Fizz"', status: 'green' },
        { name: 'fizzbuzz(5) === "Buzz"', status: 'green' },
      ],
      code: 'function fizzbuzz(n) {\n  if (n % 3 === 0) return "Fizz";\n  if (n % 5 === 0) return "Buzz";\n  return String(n);\n}',
      suite: { passing: 3, failing: 0 },
      noteKey: 'tdd.kata.fizzbuzz.s6',
    },
    {
      phase: 'red',
      testList: [
        { name: 'fizzbuzz(1) === "1"', status: 'green' },
        { name: 'fizzbuzz(3) === "Fizz"', status: 'green' },
        { name: 'fizzbuzz(5) === "Buzz"', status: 'green' },
        { name: 'fizzbuzz(15) === "FizzBuzz"', status: 'red' },
      ],
      code: 'function fizzbuzz(n) {\n  if (n % 3 === 0) return "Fizz";\n  if (n % 5 === 0) return "Buzz";\n  return String(n);\n}',
      suite: { passing: 3, failing: 1 },
      noteKey: 'tdd.kata.fizzbuzz.s7',
    },
    {
      phase: 'green',
      testList: [
        { name: 'fizzbuzz(1) === "1"', status: 'green' },
        { name: 'fizzbuzz(3) === "Fizz"', status: 'green' },
        { name: 'fizzbuzz(5) === "Buzz"', status: 'green' },
        { name: 'fizzbuzz(15) === "FizzBuzz"', status: 'green' },
      ],
      code: 'function fizzbuzz(n) {\n  if (n % 15 === 0) return "FizzBuzz";\n  if (n % 3 === 0) return "Fizz";\n  if (n % 5 === 0) return "Buzz";\n  return String(n);\n}',
      suite: { passing: 4, failing: 0 },
      noteKey: 'tdd.kata.fizzbuzz.s8',
    },
    {
      phase: 'refactor',
      testList: [
        { name: 'fizzbuzz(1) === "1"', status: 'green' },
        { name: 'fizzbuzz(3) === "Fizz"', status: 'green' },
        { name: 'fizzbuzz(5) === "Buzz"', status: 'green' },
        { name: 'fizzbuzz(15) === "FizzBuzz"', status: 'green' },
      ],
      code: 'function fizzbuzz(n) {\n  const fizz = n % 3 === 0 ? "Fizz" : "";\n  const buzz = n % 5 === 0 ? "Buzz" : "";\n  return (fizz + buzz) || String(n);\n}',
      suite: { passing: 4, failing: 0 },
      noteKey: 'tdd.kata.fizzbuzz.s9',
    },
  ],
};

const STACK = {
  id: 'stack',
  titleKey: 'tdd.kata.stack',
  steps: [
    // Step 1 — red: write the first failing test; no implementation yet
    {
      phase: 'red',
      testList: [{ name: 'new Stack().isEmpty() === true', status: 'red' }],
      code: '',
      suite: { passing: 0, failing: 1 },
      noteKey: 'tdd.kata.stack.s1',
    },
    // Step 2 — green: fake it to make the test pass
    {
      phase: 'green',
      testList: [{ name: 'new Stack().isEmpty() === true', status: 'green' }],
      code: 'class Stack {\n  isEmpty() {\n    return true;\n  }\n}',
      suite: { passing: 1, failing: 0 },
      noteKey: 'tdd.kata.stack.s2',
    },
    // Step 3 — red: add a second test that the fake implementation can't pass
    {
      phase: 'red',
      testList: [
        { name: 'new Stack().isEmpty() === true', status: 'green' },
        { name: 'after push(1), isEmpty() === false', status: 'red' },
      ],
      code: 'class Stack {\n  isEmpty() {\n    return true;\n  }\n}',
      suite: { passing: 1, failing: 1 },
      noteKey: 'tdd.kata.stack.s3',
    },
    // Step 4 — green: introduce real state to make both tests pass
    {
      phase: 'green',
      testList: [
        { name: 'new Stack().isEmpty() === true', status: 'green' },
        { name: 'after push(1), isEmpty() === false', status: 'green' },
      ],
      code: 'class Stack {\n  constructor() {\n    this.items = [];\n  }\n  push(x) {\n    this.items.push(x);\n  }\n  isEmpty() {\n    return this.items.length === 0;\n  }\n}',
      suite: { passing: 2, failing: 0 },
      noteKey: 'tdd.kata.stack.s4',
    },
    // Step 5 — red: add a test for pop()
    {
      phase: 'red',
      testList: [
        { name: 'new Stack().isEmpty() === true', status: 'green' },
        { name: 'after push(1), isEmpty() === false', status: 'green' },
        { name: 'push(1) then pop() === 1', status: 'red' },
      ],
      code: 'class Stack {\n  constructor() {\n    this.items = [];\n  }\n  push(x) {\n    this.items.push(x);\n  }\n  isEmpty() {\n    return this.items.length === 0;\n  }\n}',
      suite: { passing: 2, failing: 1 },
      noteKey: 'tdd.kata.stack.s5',
    },
    // Step 6 — green: implement pop() to pass all three tests
    {
      phase: 'green',
      testList: [
        { name: 'new Stack().isEmpty() === true', status: 'green' },
        { name: 'after push(1), isEmpty() === false', status: 'green' },
        { name: 'push(1) then pop() === 1', status: 'green' },
      ],
      code: 'class Stack {\n  constructor() {\n    this.items = [];\n  }\n  push(x) {\n    this.items.push(x);\n  }\n  pop() {\n    return this.items.pop();\n  }\n  isEmpty() {\n    return this.items.length === 0;\n  }\n}',
      suite: { passing: 3, failing: 0 },
      noteKey: 'tdd.kata.stack.s6',
    },
    // Step 7 — refactor: introduce size() and express isEmpty() through it
    {
      phase: 'refactor',
      testList: [
        { name: 'new Stack().isEmpty() === true', status: 'green' },
        { name: 'after push(1), isEmpty() === false', status: 'green' },
        { name: 'push(1) then pop() === 1', status: 'green' },
      ],
      code: 'class Stack {\n  constructor() {\n    this.items = [];\n  }\n  push(x) {\n    this.items.push(x);\n  }\n  pop() {\n    return this.items.pop();\n  }\n  size() {\n    return this.items.length;\n  }\n  isEmpty() {\n    return this.size() === 0;\n  }\n}',
      suite: { passing: 3, failing: 0 },
      noteKey: 'tdd.kata.stack.s7',
    },
  ],
};

export const TDD_KATAS = [FIZZBUZZ, STACK];
