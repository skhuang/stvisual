---
marp: true
theme: default
paginate: true
size: 16:9
title: Software Testing Visualization #59 — Fault Localization & Dicing
description: Narrowing from a failing slice to a suspect set using program dicing — static multi-output dicing and dynamic multi-input dicing.
lang: en
---

# Fault Localization & Dicing
### *Narrowing from a slice to a suspect set*

Software Testing Visualization series #59 · Slice-Based Testing
Companion tool: `/section-slicing` → Dicing tab ([SliceDicingExplorer](../../src/components/SliceDicingExplorer.js))

<!-- Builds directly on deck #58 (Program Slicing). The key shift: slicing tells you "these statements *could* have caused the bug"; dicing tells you "these are the statements that make a *difference* between the wrong output and the correct ones." -->

---

## Why a slice is not enough

- A **backward slice** of a wrong output lists every statement that *could* have influenced it — often most of the program.
- Example: in `gradeAverage`, the backward slice of `grade` is all 8 statements.
- This is a **necessary** condition — the bug must be inside the slice — but it is not *sufficient*: a large slice is still a large haystack.
- We need a way to discard statements that, while in the slice, are clearly **not responsible** for the specific fault.

**Key idea:** if some outputs are *correct*, the statements responsible for those correct outputs are *innocent* — even if they appear in the failing slice.

<!-- Weiser's original 1984 slicing paper acknowledged this: a slice reduces the search space, but it can still be large. Lyle and Weiser's 1987 follow-up introduced dicing to exploit the additional information provided by correct outputs. -->

---

## Program dicing — the core definition

**Program dice** of a wrong output `W` given correct outputs `C₁, C₂, …`:

$$\text{dice}(W) = \text{slice}(W) \;\setminus\; \bigl(\text{slice}(C_1) \cup \text{slice}(C_2) \cup \cdots\bigr)$$

- Start with the **backward slice** of the wrong output — the suspects.
- Subtract the union of the backward slices of the **correct** outputs — the innocent.
- What remains is the **dice**: statements that uniquely influence the wrong output and are not shared with any correct output.

A statement in the dice is *responsible* for something the correct outputs do not compute — a strong indicator of the fault location.

<!-- The set-minus is the crucial operation. Correctness of C₁ … tells us that the statements in their slices are "working correctly" (at least for this run). Subtracting them isolates the uniquely-wrong computation. -->

---

## Static multi-output dicing — the Lyle–Weiser method

Scenario: `summaryStats(nums)` returns `{ total, mean, highest }`.

```javascript
function summaryStats(nums) {
  let total = 0;              // s2
  let highest = nums[0];      // s3
  for (const n of nums) {     // s4
    total = total + n;        // s5
    if (n > highest) {        // s6
      highest = total;        // s7  ← BUG: should be highest = n
    }
  }
  const mean = total / nums.length; // s10
  return { total, mean, highest };  // output statements
}
```

- On input `[2, 5, 1]`: `total = 8` ✓, `mean = 2.67` ✓, `highest = 8` ✗ (should be 5).
- Wrong output: `highest`. Correct outputs: `total`, `mean`.

<!-- This is the canonical Lyle–Weiser example adapted for this course. The bug at s7 corrupts highest by assigning the running total instead of the current element. Total and mean are unaffected, so their slices serve as the innocent set. -->

---

## Static dicing — worked example

Compute slices for each output:

| Output | Backward slice (static) |
|--------|------------------------|
| `total` | {out-total, s2, s4, s5} |
| `mean` | {out-mean, s2, s4, s5, s10} |
| `highest` | {out-highest, s2, s3, s4, s5, s6, s7} |

**Innocent union** = slice(`total`) ∪ slice(`mean`) = {out-total, out-mean, s2, s4, s5, s10}

**dice(`highest`)** = {out-highest, s2, s3, s4, s5, s6, s7} − {out-total, out-mean, s2, s4, s5, s10}
= **{out-highest, s3, s6, s7}**

Statement `s7` (`highest = total`) is in the dice — the exact bug location.

<!-- Notice that s4 (the for-loop header) drops out of the dice because it appears in total's and mean's slices too — the loop structure is shared. What remains is the initialization of highest (s3), the guard (s6), the update (s7), and the output itself. The bug is s7. -->

---

## Why static dicing does NOT work across different inputs

Suppose we try multi-*input* dicing using static slices:

- Failing run: `fare(30, true)` → actual 14, expected 12.
- Passing run: `fare(30, false)` → actual 10, expected 10.
- Static backward slice of `price` at `return price` is **the same** for both runs — static slices are **input-independent**.

$$\text{static-dice} = \text{staticSlice}(\text{fail}) \setminus \text{staticSlice}(\text{pass}) = \emptyset$$

**The static dice is always empty when the criterion is the same statement and variable** — subtracting an equal set leaves nothing.

This is why **dynamic slicing** is essential for fault localization across different test inputs.

<!-- This is the key insight that the spec emphasizes. Static slices over-approximate: they include every statement that *could* affect the output under any input. Two different runs of the same program produce identical static slices for the same criterion. Dicing requires variation between the slices — and that variation only appears in dynamic slices. -->

---

## Dynamic multi-input dicing

**Dynamic slice** of a criterion on one execution trace = the backward slice restricted to dependence edges whose endpoints both appear in that trace, applying the *last-definition rule*.

Dynamic slices **vary with the input** — different traces exercise different branches and def-use chains.

**Dynamic dicing** formula:
$$\text{dice}_{\text{dyn}} = \text{dynSlice}(\text{fail trace}) \;\setminus\; \bigl(\bigcup_i \text{dynSlice}(\text{pass}_i)\bigr)$$

The passing traces together cover the "innocent" execution paths; subtracting them from the failing trace's dynamic slice isolates what is unique to the failure.

<!-- This was extended by Agrawal, DeMillo, and Spafford ("Debugging with Dynamic Slicing and Backtracking", 1993) and further formalized by Korel and Laski. The key advantage over static dicing is that different inputs genuinely produce different dynamic slices for the same criterion. -->

---

## Dynamic dicing — `fare` worked example

```javascript
function fare(age, peak) {
  let price = 10;             // s2
  if (age < 18) {             // s3
    price = 5;                // s4
  } else if (age >= 65) {     // s5
    price = 3;                // s6
  }
  if (peak) {                 // s8
    price = price + 2 + 2;   // s9  ← BUG: should be price + 2
  }
  return price;               // s11
}
```

| Trace | Input | Expected | Actual | Outcome | Dynamic slice of `price` at s11 |
|-------|-------|----------|--------|---------|----------------------------------|
| A | age=30, peak=true | 12 | 14 | **fail** | {s2, s8, s9, s11} |
| B | age=30, peak=false | 10 | 10 | pass | {s2, s11} |
| C | age=12, peak=false | 5 | 5 | pass | {s3, s4, s11} |
| D | age=70, peak=false | 3 | 3 | pass | {s3, s5, s6, s11} |

<!-- The three passing traces collectively exercise every age branch. Crucially, none of them exercises s9 (peak=false in all passing runs), so s8 — the if(peak) guard — never becomes a control dependency of any sliced statement in passing traces. s8 appears in the failing trace's slice only because it controls s9. -->

---

## Dynamic dicing — `fare` result

**Failing dynamic slice** (trace A): {s2, s8, s9, s11}

**Passing union** (traces B ∪ C ∪ D): {s2, s3, s4, s5, s6, s11}

**dice** = {s2, s8, s9, s11} − {s2, s3, s4, s5, s6, s11} = **{s8, s9}**

Dicing narrowed 8 executed statements down to **2 suspects**: the `if (peak)` guard `s8` and the buggy assignment `s9`. The bug is `s9`, and it is in the dice.

- `s8` survives because the failing trace is the only run that takes the peak branch — `s8` controls `s9`, so it enters the failing slice as a control dependency, but no passing trace ever reaches `s9`, so `s8` never appears in any passing dynamic slice.
- `s2` and `s11` subtract out (they appear in every passing trace's slice). The age branches `s3`–`s6` subtract out too.

<!-- The dice isolates the whole if(peak) block — both the guard and the buggy body. This is the honest teaching point: dicing narrows the search to a small suspect set (here just two statements), and the bug is guaranteed to be among them. In practice, more diverse passing traces give a smaller dice; here no passing trace exercises the peak branch, so the entire peak block remains. -->

---

## Tool demonstration

In `/section-slicing`, open the **Dicing** tab (Slice Dicing Explorer):

1. **Static mode** — select the `summaryStats` scenario.
   - See the three output variable slices highlighted in the PDG.
   - The dice of `highest` (the wrong output) is shown with the strongest highlight — observe that `s7` is isolated.
2. **Dynamic mode** — select the `fare` scenario.
   - All four traces are listed with their outcome badges.
   - The failing trace's dynamic slice and the passing union are shown in two tones.
   - The dice ({s8, s9}) — the two statements of the `if (peak)` block — are highlighted strongest.
3. Notice the detail panel: dice size, confirmation that the bug statement is in the dice.
4. Try the quiz: "what does dicing remove from the failing slice?"

---

## Summary

- A **backward slice** of a wrong output is a necessary but often large set of suspects.
- **Program dicing** (Lyle & Weiser, 1987) subtracts the slices of *correct* outputs from the slice of the *wrong* output, leaving only statements that uniquely influence the fault.
- **Static multi-output dicing** exploits different output variables in one run; it works because distinct output variables have genuinely distinct static slices.
- **Static dicing across different inputs is always empty** — static slices are input-independent, so the set-minus yields nothing.
- **Dynamic multi-input dicing** uses execution-specific dynamic slices; passing traces subtract out the innocent paths, leaving only what is unique to the failure.

**In-class exercise:** trace the dynamic slices for all four `fare` inputs by hand, then verify the dice in the Explorer.

---

## Further reading

- Course specification — dicing design ([2026-05-18-slicing-n2-dicing-design.md](../superpowers/specs/2026-05-18-slicing-n2-dicing-design.md))
- Lyle, J. R., & Weiser, M. (1987). "Automatic program bug location by program slicing." *Proceedings of the 2nd International Conference on Computers and Applications*, 877–883.
- Agrawal, H., DeMillo, R. A., & Spafford, E. H. (1993). "Debugging with dynamic slicing and backtracking." *Software—Practice and Experience*, 23(6), 589–616.
- Korel, B., & Laski, J. (1988). "Dynamic program slicing." *Information Processing Letters*, 29(3), 155–163.
- Tool source: [SliceDicingExplorer.js](../../src/components/SliceDicingExplorer.js), [slicing.js](../../src/utils/slicing.js)
- Previous: **#58 Program Slicing** — the foundation this deck builds on
