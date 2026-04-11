# 軟體測試方法視覺化

以互動式方式呈現軟體測試方法，包含測試方法分類、測試流程、常見測試類型，以及 graph coverage 的視覺化分析。

線上展示：<https://skhuang.github.io/stvisual/>

## 功能

- 測試方法分類視覺化：黑盒、白盒、灰盒與子技術展開
- 測試流程動畫：需求分析到缺陷報告的流程播放
- 測試類型展示：單元、集成、系統、驗收測試
- Graph Coverage 視覺化：
  - Node Coverage
  - Edge Coverage
  - Prime Path Coverage
  - Edge-Pair Coverage
  - Complete Path Coverage
- 自動產生 test requirements
- 自動產生 test path set
- 使用 greedy set-cover 近似做 test path 集合最佳化
- 顯示最佳化前/後路徑數與精簡數量
- 可編輯 graph（節點、邊、Start、End）並即時重算 coverage 結果

## 專案特色

- 可部署到 GitHub Pages
- 可直接用 `file://` 開啟 `index.html`
- 同時具備單元測試與真實瀏覽器測試
- 所有主要 graph coverage 擴充功能都有測試覆蓋

## 本機執行

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動本機靜態伺服器

```bash
npm run serve
```

預設網址：<http://127.0.0.1:4173>

### 3. 直接開啟檔案

也可以直接打開 `index.html`。

專案有兩種入口模式：
- `http/https`：使用模組化入口
- `file://`：自動使用 standalone fallback，避免 module CORS 問題

## 測試

### 單元測試

```bash
npm run test:run
```

### Browser E2E 測試

```bash
npm run test:browser
```

### 有畫面的 Browser 測試

```bash
npm run test:browser:headed
```

## GitHub Actions

Repo 已配置兩類 workflow：

- `Test`
  - `unit-test`
  - `browser-test`
- `Deploy GitHub Pages`
  - 測試通過後建立 Pages artifact
  - 自動部署到 GitHub Pages

相關設定檔：
- `.github/workflows/test.yml`
- `.github/workflows/deploy-pages.yml`

## GitHub Pages 部署

靜態站台輸出指令：

```bash
npm run pages:prepare
```

這會：
- 重新產生 `src/standalone.js`
- 建立 `site/` 靜態輸出
- 供 GitHub Pages workflow 上傳與部署

## 專案結構

```text
.
├── index.html
├── src/
│   ├── app.js
│   ├── bootstrap.js
│   ├── main.js
│   ├── standalone.js
│   ├── data/
│   ├── utils/
│   ├── components/
│   └── tests/
├── e2e/
├── scripts/
└── .github/workflows/
```

## Graph Coverage 重點

Graph Coverage 區塊目前支援：

- requirement 生成
- test path 生成
- 最小 test path 集合近似最佳化
- graph editor 即時重算
- UI 顯示最佳化前/後差異

這個專案適合用來：
- 教學展示 graph coverage 概念
- 比較不同 coverage criteria 的差異
- 觀察 requirement 與 test path 的對應關係
- 示範 path reduction / set-cover 近似最佳化

## License

目前未附加授權條款。如需公開授權，可再補上 LICENSE。
