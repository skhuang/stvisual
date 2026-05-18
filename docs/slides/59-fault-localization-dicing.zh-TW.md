---
marp: true
theme: default
paginate: true
size: 16:9
title: 軟體測試視覺化 #59 — 缺陷定位與切丁
description: 利用程式切丁從失敗切片縮小到可疑陳述式集合 —— 靜態多輸出切丁與動態多輸入切丁。
lang: zh-TW
---

# 缺陷定位與切丁
### *從切片縮小到可疑陳述式集合*

軟體測試視覺化系列 #59 · 切片式測試
搭配工具：`/section-slicing` → 切丁分頁（[SliceDicingExplorer](../../src/components/SliceDicingExplorer.js)）

<!-- 直接建立在第 58 講（程式切片）之上。核心轉變：切片告訴你「這些陳述式『可能』造成了錯誤」；切丁告訴你「這些是讓錯誤輸出與正確輸出產生差異的陳述式」。 -->

---

## 為什麼切片還不夠

- 錯誤輸出的**向後切片**列出了每一個*可能*影響它的陳述式 —— 往往涵蓋大部分程式。
- 範例：在 `gradeAverage` 中，`grade` 的向後切片包含全部 8 個陳述式。
- 這是一個**必要**條件 —— 錯誤必定在切片之內 —— 但並非*充分*：大型切片仍然是一個龐大的搜索空間。
- 我們需要一種方法，捨棄那些雖在切片中、但顯然**與特定缺陷無關**的陳述式。

**核心想法：** 若某些輸出是*正確的*，則負責產生這些正確輸出的陳述式是*無辜的* —— 即使它們出現在失敗切片之中。

<!-- Weiser 1984 年的原始切片論文就已承認這一點：切片縮小了搜索範圍，但仍可能很大。Lyle 與 Weiser 在 1987 年的後續論文引入了切丁，利用正確輸出提供的額外資訊。 -->

---

## 程式切丁 —— 核心定義

錯誤輸出 `W`、正確輸出 `C₁, C₂, …` 的**程式切丁**：

$$\text{dice}(W) = \text{slice}(W) \;\setminus\; \bigl(\text{slice}(C_1) \cup \text{slice}(C_2) \cup \cdots\bigr)$$

- 以錯誤輸出的**向後切片**為起點 —— 這是嫌疑人集合。
- 減去**正確**輸出的向後切片的聯集 —— 這是無辜集合。
- 剩下的就是**切丁**：唯一影響錯誤輸出、且未與任何正確輸出共享的陳述式。

切丁中的陳述式負責計算正確輸出中所沒有的東西 —— 這是缺陷位置的強力指示。

<!-- 集合差是關鍵運算。C₁… 的正確性告訴我們，它們切片中的陳述式「運作正確」（至少對此次執行而言）。減去它們，就隔離出了唯一出錯的計算。 -->

---

## 靜態多輸出切丁 —— Lyle–Weiser 方法

場景：`summaryStats(nums)` 回傳 `{ total, mean, highest }`。

```javascript
function summaryStats(nums) {
  let total = 0;              // s2
  let highest = nums[0];      // s3
  for (const n of nums) {     // s4
    total = total + n;        // s5
    if (n > highest) {        // s6
      highest = total;        // s7  ← 錯誤：應為 highest = n
    }
  }
  const mean = total / nums.length; // s10
  return { total, mean, highest };  // 輸出陳述式
}
```

- 輸入 `[2, 5, 1]`：`total = 8` ✓，`mean = 2.67` ✓，`highest = 8` ✗（應為 5）。
- 錯誤輸出：`highest`。正確輸出：`total`、`mean`。

<!-- 這是本課程改編自 Lyle–Weiser 的典型範例。s7 的錯誤透過把累計總和賦給 highest（而非目前元素）來污染 highest。total 與 mean 不受影響，因此它們的切片充當無辜集合。 -->

---

## 靜態切丁 —— 實作過程

計算每個輸出的切片：

| 輸出 | 向後切片（靜態） |
|------|----------------|
| `total` | {out-total, s2, s4, s5} |
| `mean` | {out-mean, s2, s4, s5, s10} |
| `highest` | {out-highest, s2, s3, s4, s5, s6, s7} |

**無辜聯集** = slice(`total`) ∪ slice(`mean`) = {out-total, out-mean, s2, s4, s5, s10}

**dice(`highest`)** = {out-highest, s2, s3, s4, s5, s6, s7} − {out-total, out-mean, s2, s4, s5, s10}
= **{out-highest, s3, s6, s7}**

陳述式 `s7`（`highest = total`）在切丁中 —— 正是錯誤所在。

<!-- 注意 s4（for 迴圈標頭）從切丁中消失了，因為它同時出現在 total 和 mean 的切片中 —— 迴圈結構是共享的。留下來的是 highest 的初始化（s3）、條件判斷（s6）、更新（s7）以及輸出本身。錯誤就在 s7。 -->

---

## 為什麼靜態切丁在不同輸入間無效

假設我們嘗試用靜態切片進行多*輸入*切丁：

- 失敗執行：`fare(30, true)` → 實際 14，預期 12。
- 通過執行：`fare(30, false)` → 實際 10，預期 10。
- `return price` 處 `price` 的靜態向後切片對兩次執行都**相同** —— 靜態切片是**與輸入無關的**。

$$\text{靜態切丁} = \text{staticSlice}(\text{失敗}) \setminus \text{staticSlice}(\text{通過}) = \emptyset$$

**當準則是相同的陳述式與變數時，靜態切丁永遠是空集合** —— 減去相等的集合什麼也不剩。

這就是**動態切片**對於跨不同測試輸入的缺陷定位至關重要的原因。

<!-- 這是本規格強調的核心洞見。靜態切片過度近似：它包含了在任何輸入下*可能*影響輸出的每個陳述式。同一程式的兩次不同執行，對相同準則產生相同的靜態切片。切丁需要切片之間的差異 —— 而這種差異只出現在動態切片中。 -->

---

## 動態多輸入切丁

一次執行軌跡上的準則的**動態切片** = 限縮於該軌跡中端點均出現的相依邊的向後切片，並應用*最近定義規則*。

動態切片**隨輸入而變化** —— 不同的軌跡走過不同的分支與 def-use 鏈。

**動態切丁**公式：
$$\text{dice}_{\text{dyn}} = \text{dynSlice}(\text{失敗軌跡}) \;\setminus\; \bigl(\bigcup_i \text{dynSlice}(\text{通過}_i)\bigr)$$

通過軌跡一起涵蓋了「無辜」的執行路徑；從失敗軌跡的動態切片中減去它們，就隔離出了唯一屬於失敗的部分。

<!-- 此方法由 Agrawal、DeMillo 與 Spafford（《Debugging with Dynamic Slicing and Backtracking》，1993）推廣，並由 Korel 與 Laski 進一步形式化。相對於靜態切丁，其核心優勢在於不同輸入確實會對相同準則產生不同的動態切片。 -->

---

## 動態切丁 —— `fare` 實作範例

```javascript
function fare(age, peak) {
  let price = 10;             // s2
  if (age < 18) {             // s3
    price = 5;                // s4
  } else if (age >= 65) {     // s5
    price = 3;                // s6
  }
  if (peak) {                 // s8
    price = price + 2 + 2;   // s9  ← 錯誤：應為 price + 2
  }
  return price;               // s11
}
```

| 軌跡 | 輸入 | 預期 | 實際 | 結果 | s11 處 `price` 的動態切片 |
|------|------|------|------|------|--------------------------|
| A | age=30, peak=true | 12 | 14 | **失敗** | {s2, s8, s9, s11} |
| B | age=30, peak=false | 10 | 10 | 通過 | {s2, s11} |
| C | age=12, peak=false | 5 | 5 | 通過 | {s3, s4, s11} |
| D | age=70, peak=false | 3 | 3 | 通過 | {s3, s5, s6, s11} |

<!-- 三條通過軌跡共同涵蓋了每個年齡分支。關鍵是：因為所有通過執行中 peak=false，所以沒有任何一條通過軌跡走到 s9，因此 s8（if(peak) 條件判斷）從未成為任何通過軌跡切片中陳述式的控制相依來源。s8 只在失敗軌跡的切片中出現，因為它控制了 s9。 -->

---

## 動態切丁 —— `fare` 結果

**失敗動態切片**（軌跡 A）：{s2, s8, s9, s11}

**通過聯集**（軌跡 B ∪ C ∪ D）：{s2, s3, s4, s5, s6, s11}

**切丁** = {s2, s8, s9, s11} − {s2, s3, s4, s5, s6, s11} = **{s8, s9}**

切丁將執行到的 8 個陳述式縮小為 **2 個嫌疑陳述式**：`if (peak)` 的條件判斷 `s8` 與有錯誤的賦值 `s9`。錯誤就是 `s9`，且它確實在切丁之中。

- `s8` 留下來是因為失敗軌跡是唯一走過 peak 分支的執行 —— `s8` 控制了 `s9`，因此以控制相依的身份進入失敗切片；但沒有任何通過軌跡執行到 `s9`，所以 `s8` 從未出現在任何通過軌跡的動態切片中。
- `s2` 與 `s11` 被減掉（出現在每條通過軌跡的切片中）。年齡分支 `s3`–`s6` 也被減掉。

<!-- 切丁隔離出了整個 if(peak) 區塊 —— 包括條件判斷與有錯誤的主體。這是正確的教學重點：切丁將嫌疑人縮小到一個小集合（此處僅兩個陳述式），而錯誤保證在其中。在實務中，越多樣化的通過軌跡能給出越小的切丁；此處由於沒有任何通過軌跡走到 peak 分支，整個 peak 區塊都被保留下來。 -->

---

## 工具演示

在 `/section-slicing` 開啟**切丁**分頁（切丁探索器）：

1. **靜態模式** —— 選取 `summaryStats` 場景。
   - 在 PDG 中看到三個輸出變數的切片高亮顯示。
   - `highest`（錯誤輸出）的切丁以最強的高亮顯示 —— 觀察 `s7` 被隔離出來。
2. **動態模式** —— 選取 `fare` 場景。
   - 四條軌跡都列出，並附有執行結果標籤。
   - 失敗軌跡的動態切片與通過聯集以兩種色調顯示。
   - 切丁（{s8, s9}）—— `if (peak)` 區塊的兩個陳述式 —— 以最強高亮顯示。
3. 注意詳細面板：切丁大小、確認錯誤陳述式位於切丁之中。
4. 嘗試小測驗：「切丁從失敗切片中移除哪些陳述句？」

---

## 小結

- 錯誤輸出的**向後切片**是必要但往往龐大的嫌疑人集合。
- **程式切丁**（Lyle & Weiser，1987）從錯誤輸出的切片中減去*正確*輸出的切片，只留下唯一影響缺陷的陳述式。
- **靜態多輸出切丁**利用同一次執行中的不同輸出變數；其有效性在於不同輸出變數具有真正不同的靜態切片。
- **跨不同輸入的靜態切丁永遠是空集合** —— 靜態切片與輸入無關，集合差運算什麼也不剩。
- **動態多輸入切丁**使用特定執行的動態切片；通過軌跡減去無辜的路徑，只留下失敗所獨有的部分。

**課堂練習：** 用手追蹤 `fare` 全部四個輸入的動態切片，再在探索器中驗證切丁。

---

## 延伸閱讀

- 課程規格 —— 切丁設計（[2026-05-18-slicing-n2-dicing-design.md](../superpowers/specs/2026-05-18-slicing-n2-dicing-design.md)）
- Lyle, J. R., & Weiser, M.（1987）。〈Automatic program bug location by program slicing〉。*Proceedings of the 2nd International Conference on Computers and Applications*，877–883。
- Agrawal, H., DeMillo, R. A., & Spafford, E. H.（1993）。〈Debugging with dynamic slicing and backtracking〉。*Software—Practice and Experience*，23(6)，589–616。
- Korel, B., & Laski, J.（1988）。〈Dynamic program slicing〉。*Information Processing Letters*，29(3)，155–163。
- 工具原始碼：[SliceDicingExplorer.js](../../src/components/SliceDicingExplorer.js)、[slicing.js](../../src/utils/slicing.js)
- 上一講：**#58 程式切片** —— 本講所建立的基礎
