# stvisual 對外簡報稿（中文版）

日期：2026-04-12

## 產品定位
stvisual 是一個互動式的軟體測試教學與分析平台，核心聚焦於 Graph Coverage，並同時支援「手動編輯控制流程圖」與「上傳程式碼自動產生簡化 CFG」。

## 問題背景
測試覆蓋準則（例如 Node / Edge / Prime Path）常常停留在概念層，學習者雖然理解定義，卻難以把理論連結到可執行的測試需求與真實程式流程。

## 解決方案
stvisual 把抽象理論變成可操作、可驗證的視覺化流程：

- 測試方法全覽：黑盒、白盒、灰盒
- Graph Coverage Explorer：Node、Edge、Prime Path、Edge-Pair、Complete Path
- 由 CFG 自動推導測試需求（requirements）
- 自動產生測試路徑，並提供最佳化前後指標
- 上傳程式碼後自動轉成簡化 CFG
- 依 requirement 顯示程式碼行號對應（source mapping）

## 差異化價值
- 雙入口學習模式：Graph-first 與 Code-first
- 可解釋性導向：需求、路徑、原始碼對應同畫面可追蹤
- 工程可重現：具備單元測試、瀏覽器 E2E、CI 流程
- 佈署友善：支援 GitHub Pages 與 file protocol 場景

## 技術亮點
- 純 HTML + JavaScript 靜態架構
- 具 protocol-aware bootstrap，支援 file:// fallback
- 程式碼轉 CFG parser，支援 if、switch、巢狀 loop、break、continue
- 使用 greedy set-cover 近似法進行測試路徑精簡

## 驗證證據
- Unit Tests：覆蓋演算法、資料契約、元件互動、parser 行為
- Browser E2E：覆蓋上傳流程、複雜控制流程 mapping、coverage criterion 切換一致性
- GitHub Actions：自動化測試與部署流程

## 交付狀態
- 測試方法視覺化：已完成
- Graph Coverage 進階能力：已完成
- 路徑最佳化與指標呈現：已完成
- README 與文件化：已完成
- 程式碼上傳 + 行號映射：已完成

## 典型使用情境
- 軟體測試課程教學示範
- 由控制流程圖推導測試需求的實務演練
- 比較不同 coverage criteria 的行為差異
- 展示測試路徑精簡與覆蓋率權衡

## 對外連結
- Repository：https://github.com/skhuang/stvisual
- Live Demo：https://skhuang.github.io/stvisual/

## 下一步發展方向
1. 擴充 source-to-CFG 支援語言。
2. 強化 parser 對更複雜語法的解析能力。
3. 建立雙向導航（點 code line 高亮 CFG node，反向亦然）。
4. 提供 coverage 報表與輸出格式，支援教學評量與成果留存。
