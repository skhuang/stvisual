# stvisual 投影片逐頁講者備忘欄（中文版）

日期：2026-04-12
建議總長：3"4 分鐘（加入 Logic Coverage + Symbolic/Concolic + Fuzz Testing 段落時建議拉長為 5～6 分鐘）

## Slide 1 - 標題頁（15 秒）
### 畫面重點
- 專案名稱：stvisual
- 副標：Software Testing Visualization

### 講者備忘
- 關鍵句：
  - 「這是一個把軟體測試理論轉成互動流程的視覺化平台。」
  - 「今天會同時說 Graph Coverage、程式碼自動 CFG、Logic Coverage、Symbolic/Concolic Execution，以及 Fuzz Testing。」
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

## Slide 5b - Logic Coverage Explorer（40 秒）
### 畫面重點
- predicate 輸入與內建例子
- 真值表 + 主／次子句標記
- 準則切換：PC / CC / CoC / GACC / CACC / RACC / GICC / RICC
- IC 系列：DNF、Quine–McCluskey 最小化、重複列刪除線、¬f 的 implicants
- f 與 ¬f 的 Karnaugh map

### 講者備忘
- 講法順序：
  - 先示範 PC/CC 看到語意準則的差異
  - 切到 GACC/CACC/RACC 說明 Active Clause 的原則
  - 最後切到 IC，帶出 DNF、K-map 與重複列刪除的視覺效果
- 關鍵句：
  - 「邏輯覆蓋不再是黑板上的定義，而是可以選一條 predicate 马上看到所有語意與語法準則的具體測試。」
- 建議示範動作：
  - 輸入一條自訂 predicate，讓它進 recent chips
  - 切一輪準則讓聽眾看到選取列變化

## Slide 5c - Symbolic / Concolic Execution Explorer（40 秒）
### 畫面重點
- 左右分欄：左側 CFG、右側結果 + 程式碼編輯器
- 內建範例程式（Triangle、Absolute Value 等）
- 符號執行路徑列表與約束條件
- Concolic 模式：具體＋符號混合執行
- 路徑條件 → CFG 節點／邊高亮

### 講者備忘
- 講法順序：
  - 先選一個內建範例，展示 CFG 自動產生
  - 切到 Symbolic 結果，說明路徑約束如何產生
  - 再切到 Concolic 模式，帶出具體值與符號值並行的差異
  - 點選一條路徑，讓聽眾看到 CFG 上對應節點高亮
- 關鍵句：
  - 「符號執行把測試需求的產生自動化——不再手動猜測輸入，而是讓求解器找到能走到特定路徑的值。」
- 建議示範動作：
  - 點一條路徑，指向 CFG 上高亮的節點與邊
  - 修改程式碼，讓 CFG 與路徑即時更新

## Slide 5d - Fuzz Testing Explorer（40 秒）
### 畫面重點
- 左右分欄：左側 CFG（含覆蓋率 badge）、右側測試案例列表 + 程式碼編輯器
- 內建範例程式（Triangle、GCD、Absolute Value 等 6 組）
- 隨機輸入產生 + 結果統計（pass / crash / 平均時間）
- 測試案例點擊 → CFG 單一路徑高亮（toggle 切換）
- 聚合覆蓋率：N%（節點）/ E%（邊）即時顯示

### 講者備忘
- 講法順序：
  - 先選 Triangle Classifier 範例，展示 CFG + 覆蓋率 badge
  - 說明 N 100% / E 100% 代表所有節點與邊都被至少一條測試走過
  - 點選某一條測試案例，展示單一路徑在 CFG 上的高亮變化
  - 再點一次取消選取，回到聚合覆蓋視圖
  - 切換到 GCD 範例，帶出 while 迴圈的迭代保護機制
- 關鍵句：
  - 「Fuzz testing 是用大量隨機輸入暴力搜尋缺陷——這裡我們把每條路徑映射回 CFG，讓覆蓋率不只是數字，而是看得見的路徑。」
- 建議示範動作：
  - 點選 fuzz-0，指向 CFG 上高亮的節點與邊
  - 再點一次 fuzz-0 取消，回到 N%/E% 聚合覆蓋
  - 修改程式碼或測試次數，觀察覆蓋率即時變化

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
- 如果含 Logic Coverage：記得切一輪準則讓聽眾看到真值表與 K-map 變化。
- Symbolic/Concolic：展示路徑點選 → CFG 高亮。
- Fuzz Testing：點選測試案例切換 CFG 路徑高亮，秀 N%/E% 覆蓋率 badge。
- 時間不夠就縮短技術細節，保留問題、解法、成果、下一步四段。