---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #28 — Group Theory & Test Symmetry
description: The symmetry group of a predicate — variable permutations that leave a function invariant, orbits, and how symmetry collapses test cases.
lang: en
---

# Group Theory & Test Symmetry
### When two test cases are "the same test"

Software Testing Visualization series #28
Companion tool: `/section-groupth` ([GroupTheoryExplorer](../../src/components/GroupTheoryExplorer.js))

<!-- A research-flavoured lecture. The point is concrete: symmetry in a specification means redundancy in a test suite. -->

---

## Why this lecture exists

- Logic coverage (#5) generates a row per input combination — `2ⁿ` of them.
- But some of those rows are *structurally identical*: swap two variables and the function is unchanged.
- If a swap leaves the function invariant, the two inputs exercise **the same logic**.
- Group theory makes "the same logic" precise — and lets us *count* the redundancy.

---

## The core idea: invariance under permutation

Take the predicate `f(A, B) = A OR B`. Swap `A` and `B`:

```
f(A, B) = A OR B
f(B, A) = B OR A   ≡  A OR B   ✓ unchanged
```

`OR` is **symmetric** — the swap is a *symmetry* of the function.
Now try `f(A, B) = A AND NOT B`: swapping gives `B AND NOT A` — **different**. No symmetry.

---

## The automorphism group Aut(f)

Collect *every* variable permutation that leaves `f` invariant:

- They include the identity (do nothing).
- Compose two of them → another one (closure).
- Each is reversible (inverse).

That set is a **group** — the **automorphism group** `Aut(f)` of the predicate. Its size measures **how symmetric** the specification is.

| Predicate | Aut(f) | Meaning |
| --- | --- | --- |
| `A OR B` | swap (A B) + identity | fully symmetric |
| majority of A,B,C | all 6 permutations of S₃ | maximally symmetric |
| `A AND NOT B` | identity only | no symmetry |

---

## Orbits: which test cases collapse together

A symmetry group **partitions** the input rows into **orbits** — sets of inputs mapped onto each other by some symmetry.

```
 A=1,B=0  ──swap──▶  A=0,B=1     one orbit
```

Within an orbit, every input drives `f` through identical logic. **One representative per orbit** is enough — the rest are redundant.

> Symmetry in the spec ⇒ orbits in the input space ⇒ redundancy in the suite.

---

## Why a tester cares

- A logic-coverage suite that ignores symmetry tests every orbit *multiple* times.
- Pick **one input per orbit** → a smaller suite with the *same* fault-detection power.
- The number of orbits, not `2ⁿ`, is the real test budget for a symmetric predicate.

Group theory turns "this feels redundant" into a computed count.

---

## The link to metamorphic relations

A symmetry of `f` is exactly a **metamorphic relation** (#25):

> *transform the input by a symmetry → the output must not change.*

- `f(A,B) = f(B,A)` is both a group element of `Aut(f)` **and** a metamorphic relation.
- So the symmetry group is a *source of MRs* — and a failed MR means a symmetry the implementation broke.

Group theory and metamorphic testing are two views of the same structure.

---

## Tool demonstration

In `/section-groupth`, open the **Group Theory Explorer**:

1. Pick a predicate (`A OR B`, the 3-variable majority, `A AND NOT B`).
2. Read its automorphism group `Aut(f)` in cycle notation.
3. See the input rows grouped into **orbits**.
4. Follow the bridge to metamorphic testing — each symmetry as an MR.

---

## Summary

- A **symmetry** of a predicate is a variable permutation that leaves it invariant.
- All symmetries form the **automorphism group** `Aut(f)` — its size measures the spec's symmetry.
- Symmetries partition inputs into **orbits**; one representative per orbit suffices.
- Each symmetry is a **metamorphic relation** — the two techniques meet here.

**In-class exercise:** find `Aut(f)` for `f = (A AND B) OR C`. Is `A`↔`B` a symmetry? Is `B`↔`C`?

---

## Further reading

- Course specification — logic coverage & symmetry chapter ([Specification.zh-TW.md](../Specification.zh-TW.md))
- Ammann & Offutt, *Introduction to Software Testing* — logic coverage
- Tool source: [GroupTheoryExplorer.js](../../src/components/GroupTheoryExplorer.js)
- Related: **#5 Logic Coverage** · **#25 Metamorphic Testing**
