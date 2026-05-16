---
marp: true
theme: default
paginate: true
size: 16:9
title: 軟體測試視覺化 #38 — BDD 與 Gherkin
description: 用平實語言寫的行為驅動驗收測試 — Feature、Scenario、Given-When-Then 與 Scenario Outline。
lang: zh-TW
---

# BDD 與 Gherkin
### 整個團隊都讀得懂的驗收測試

軟體測試視覺化系列 #38 · 驗收與 E2E
搭配工具：`/section-acceptance`（[BDDGherkinExplorer](../../src/components/BDDGherkinExplorer.js)）

<!-- 驗收系列的第一講。關鍵轉變：一個同時也是規格的測試，用業務語言寫成。 -->

---

## 為什麼有這一講

- 單元層級的測試（#16）說的是程式碼 —— 業務方讀不懂。
- 一個驗收測試必須回答：*我們建的是客戶要的東西嗎？*（確認，#15）。
- **BDD** 用**結構化的平實語言**寫驗收測試 —— 開發者、測試者*與*業務方都讀得懂。
- 同一份文件，既是**規格**、也是**測試**。

---

## Gherkin 結構

Gherkin 是 BDD 測試所用的語言。三個層級：

| 關鍵字 | 意義 |
| --- | --- |
| **Feature** | 被描述的一項能力 |
| **Scenario** | 該能力的一個具體例子 |
| **Given / When / Then** | 一個 scenario 的步驟 |

```gherkin
Feature: 折扣碼

  Scenario: 有效的折扣碼降低總額
    Given 購物車小計為 $50
    When 顧客套用折扣碼 "SAVE10"
    Then 訂單總額為 $45
```

---

## Given-When-Then

三個步驟關鍵字對應一個清楚的結構：

- **Given** —— *脈絡*／前置條件。動作之前的世界。
- **When** —— *動作*／事件。受測的那一件事。
- **Then** —— *預期結果*。之後必須可觀察到的東西。

> Given 一個狀態 · When 一個事件 · Then 一個結果。

這和單元測試的 arrange-act-assert 是同一個形狀 —— 只是用業務語言寫。

---

## 步驟定義：從散文到程式碼

一個 Gherkin 步驟是純文字；一個**步驟定義（step definition）**把它綁到可執行的程式碼：

```
"顧客套用折扣碼 {string}"  ──▶  applyCode(code)
```

- 每個步驟對應到一個定義（常以樣式比對）。
- 一個**沒有**定義的步驟是*未綁定的* —— scenario 無法執行。
- feature 檔維持可讀；接線住在步驟定義裡。

---

## Scenario Outline：一個 scenario、多個案例

替每一列資料重複一個 scenario 很浪費。一個 **Scenario Outline** 把它參數化：

```gherkin
  Scenario Outline: 折扣級距
    Given 購物車小計為 <subtotal>
    When 顧客套用 "<code>"
    Then 總額為 <total>

    Examples:
      | subtotal | code    | total |
      | 50       | SAVE10  | 45    |
      | 200      | SAVE20  | 160   |
```

一張 *N* 列的 Examples 表，展開成 ***N* 個參數化測試案例** —— 那張表*就是*一張喬裝的決策表（#21）。

---

## 優點與限制

**優點**
- 一份產物同時兼任**規格、測試與活文件**。
- 業務方可讀 —— 支撐 Three Amigos 對話（#M5）。
- Examples 表讓資料驅動的案例變得明確。

**限制**
- 那層平實語言是一層*外觀* —— 步驟定義仍需真正的工程。
- 含糊的步驟產生含糊的測試；Gherkin 不強制好的斷言。
- 用在底層邏輯上會變成沒有讀者的繁文縟節 —— 把它留給*面向業務*的行為。

---

## 工具演示

在 `/section-acceptance` 開啟 **BDD／Gherkin 探索器**：

1. 載入一個預設 feature（`login`、`discount`、`cart`）。
2. 看未綁定的步驟以紅色標出 —— 綁定它們，scenario 就能跑。
3. 打開一個 Scenario Outline，看 Examples 表展開成案例。
4. 沿橋接前往決策表探索器（#21）。

---

## 小結

- **BDD** 用結構化的平實語言寫驗收測試 —— 整個團隊可讀。
- **Gherkin** 結構：**Feature → Scenario → Given/When/Then**。
- **步驟定義**把純文字步驟綁到可執行的程式碼。
- 一個 **Scenario Outline ＋ Examples** 表展開成 *N* 個參數化案例 —— 一張喬裝的決策表。

**課堂練習：** 為「密碼重設」寫一個 Feature 與一個 Scenario。再把它變成一個有三列 Examples 的 Scenario Outline。

---

## 延伸閱讀

- 課程規格 —— 驗收測試章節（[Specification.zh-TW.md](../Specification.zh-TW.md)）
- North, *Introducing BDD*（2006）；Wynne & Hellesøy, *The Cucumber Book*
- 工具原始碼：[BDDGherkinExplorer.js](../../src/components/BDDGherkinExplorer.js)
- 相關：**#21 決策表** · **#M5 範例映射** · **#44 ATDD 循環**
