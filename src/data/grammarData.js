// Built-in grammars for the Grammar-Based Testing explorer.
// Format consumed by parseGrammar() in ../utils/grammar.js.

export const grammarExamples = [
  {
    id: 'arith',
    name: '算術運算式 / Arithmetic Expression',
    nameEn: 'Arithmetic Expression',
    description: '簡單整數加減乘的中綴運算式，含括號。',
    descriptionEn: 'Simple integer infix expression with +, *, and parentheses.',
    text: [
      '<E> ::= <E> "+" <T> | <T>',
      '<T> ::= <T> "*" <F> | <F>',
      '<F> ::= "(" <E> ")" | <D>',
      '<D> ::= "0" | "1" | "2"',
    ].join('\n'),
  },
  {
    id: 'json-tiny',
    name: 'Mini JSON',
    nameEn: 'Mini JSON',
    description: '極簡 JSON：物件、陣列、字串、數字。',
    descriptionEn: 'Minimal JSON subset: object, array, string, number.',
    text: [
      '<V> ::= <O> | <A> | <S> | <N>',
      '<O> ::= "{" "}" | "{" <P> "}"',
      '<P> ::= <S> ":" <V> | <S> ":" <V> "," <P>',
      '<A> ::= "[" "]" | "[" <V> "]" | "[" <V> "," <A> "]"',
      '<S> ::= "\\"a\\"" | "\\"b\\""',
      '<N> ::= "0" | "1"',
    ].join('\n'),
  },
  {
    id: 'palindrome',
    name: '回文 / Palindrome',
    nameEn: 'Palindrome',
    description: 'a/b 字母組成的偶數/奇數長度回文。',
    descriptionEn: 'Even/odd-length palindromes over {a,b}.',
    text: [
      '<P> ::= "a" | "b" | "a" <P> "a" | "b" <P> "b"',
    ].join('\n'),
  },
];
