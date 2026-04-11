# stvisual 投影片逐頁講者備忘欄（中文版）

日期：2026-04-12
建議總長：3 分鐘

## Slide 1 - 標題頁（15 秒）
### 畫面重點
- 專案名稱：stvisual
- 副標：Software Testing Visualization

### 講者備忘
- 關鍵句：
  - 「這是一個把軟體測試理論轉成互動流程的視覺化平台。」
  - 「今天會聚焦 Graph Coverage 與程式碼上傳自動 CFG。」
- 語氣建議：先講價值，不先講技術細節。

## Slide 2 - 問題背景（25 秒）
### 畫面重點
- Node / Edge / Prime Path 等準則
- 理論與實務落差

### 講者備忘
- 關鍵句：
  - 「多數學習卡點不在定義，而是在不知道如何把定義變成可執行測試需求。」
- 可補一句：
  - 「這也是為什麼課堂上懂概念，實作時仍然困難。」

## Slide 3 - 解決方案總覽（30 秒）
### 畫面重點
- Graph-first：手動編輯 CFG
- Code-first：上傳程式碼自動產生 CFG
- Requirement 與 Source Mapping

### 講者備忘
- 關鍵句：
  - 「stvisual 同時支援從圖出發與從程式碼出發，讓教學與實務都能對齊。」
  - 「每個 requirement 可以對回原始碼行號，強化可解釋性。」

## Slide 4 - 功能展示（35 秒）
### 畫面重點
- Coverage criteria 切換
- Requirements 清單
- Test path 與 optimization metrics

### 講者備忘
- 講法順序：
  - 先說 criteria 切換（node/edge/prime-path）
  - 再說 requirements 自動重算
  - 最後說路徑最佳化前後指標
- 關鍵句：
  - 「不是只看圖，而是把需求、路徑、最佳化結果放在同一個分析視角。」

## Slide 5 - 程式碼上傳與行號映射（35 秒）
### 畫面重點
- 上傳 source code + language
- 自動產生簡化 CFG
- 切換 requirement 時高亮對應行

### 講者備忘
- 關鍵句：
  - 「這是差異化重點：理論結果可直接回到原始碼行號。」
- 建議示範動作：
  - 點一個 requirement，指向 source mapping 的 Lx 行
  - 再切另一個 requirement，讓聽眾看到映射變化

## Slide 6 - 技術與品質保證（25 秒）
### 畫面重點
- 靜態架構（HTML + JS）
- parser 支援 if/switch/nested loop/break/continue
- Unit + E2E + CI

### 講者備忘
- 關鍵句：
  - 「這個專案是可驗證、可維護的，不只是視覺 demo。」
- 補一句：
  - 「E2E 已覆蓋複雜控制流程上傳與 criteria 切換一致性。」

## Slide 7 - 成果與狀態（20 秒）
### 畫面重點
- 已交付功能清單
- GitHub Pages / PR / Issue 流程

### 講者備忘
- 關鍵句：
  - 「目前核心能力已完整交付，並透過 issue/PR 流程持續迭代。」

## Slide 8 - 結語與下一步（15 秒）
### 畫面重點
- 擴語言支援
- 更完整 parser
- code/CFG 雙向導航

### 講者備忘
- 關鍵句：
  - 「我們下一步是把 source-to-CFG 做得更廣、更深，同時維持可解釋與可驗證。」
- 收尾句：
  - 「stvisual 的目標，是讓測試理論真正可操作、可學習、可落地。」

---

## 講者速記卡（上台前 10 秒看）
- 先講價值，再講技術。
- 三個關鍵詞反覆強調：可操作、可解釋、可驗證。
- 展示時一定做「requirement 切換 -> 行號跟著變」。
- 時間不夠就縮短技術細節，保留問題、解法、成果、下一步四段。