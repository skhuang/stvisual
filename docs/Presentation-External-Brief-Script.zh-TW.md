# stvisual 3 分鐘超短講稿（中文版）

日期：2026-04-12

## 0:00 - 0:20 開場
大家好，我們今天介紹的是 stvisual。
stvisual 是一個把軟體測試理論「視覺化」的互動平台，特別聚焦在 Graph Coverage。

## 0:20 - 0:45 問題
傳統上我們在學 Node Coverage、Edge Coverage、Prime Path Coverage 時，常常只看到定義。
但從定義走到可執行的測試需求，很多人會卡住，因為缺少可操作、可對照的工具。

## 0:45 - 1:20 解法
stvisual 的核心做法是把理論轉成可操作流程：
- 可以直接編輯控制流程圖，立即看到 requirements 變化
- 可以從程式碼上傳，自動產生簡化 CFG
- 可以看到測試路徑與最佳化前後指標
- 可以把 requirement 反查到程式碼行號，知道「為什麼」要測這條路徑

## 1:20 - 1:50 技術亮點
在技術上，我們採用靜態 HTML + JavaScript 架構，部署簡單、可攜性高。
同時支援 GitHub Pages 與 file protocol 的執行模式。
另外我們加入了 source-to-CFG parser，支援 if、switch、巢狀 loop、break、continue，讓輸入更接近真實程式。

## 1:50 - 2:20 驗證方式
我們不是只做畫面，而是完整驗證流程：
- Unit tests 驗證演算法、parser、元件互動
- Browser E2E 驗證上傳、mapping、criteria 切換一致性
- GitHub Actions 自動跑測試與部署
所以這個系統不只是 demo，而是可持續演進的教學與分析平台。

## 2:20 - 2:45 目前成果
目前已完成：
- 測試方法視覺化
- Graph Coverage 進階準則
- 路徑最佳化與指標呈現
- 程式碼上傳與 source mapping
- CI/CD 與文件化

## 2:45 - 3:00 收尾
總結來說，stvisual 的價值是把抽象測試理論轉成可觀察、可操作、可驗證的流程。
下一步我們會擴充更多語言與語法支援，並強化 code 與 CFG 的雙向導航體驗。
謝謝大家。

---

## 備用 30 秒版本
stvisual 是一個 Graph Coverage 互動平台，能從圖或程式碼兩種方式產生測試需求，並把 requirement 對回原始碼行號。
它不只可視化，也有完整 unit/E2E 與 CI，適合教學示範與測試分析。
