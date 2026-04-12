# Google 登入 + Firebase/Drive 設定指南

本專案支援：
- Google 登入（Firebase Authentication）
- 使用 Firebase Firestore 儲存使用者設定
- 使用 Google Drive 上傳檔案

## 1. 建立 Firebase 專案
1. 到 Firebase Console 建立專案。
2. 啟用 Authentication -> Sign-in method -> Google。
3. 啟用 Firestore Database。
4. 建立 Web App 並取得 `apiKey`、`authDomain`、`projectId`、`appId`。

## 2. 設定 Drive API
1. 到 Google Cloud Console 啟用 Google Drive API。
2. 確認 OAuth consent screen 已設定。
3. 確認 Firebase Google 登入可取得 scope：
   - `https://www.googleapis.com/auth/drive.file`

## 3. 在前端注入設定
可用兩種方式：

### 方式 A：直接修改
編輯 [src/config/cloudConfig.js](../src/config/cloudConfig.js)，填入你的 Firebase 參數。

### 方式 B：執行時覆寫（建議）
在 `index.html` 載入 `bootstrap.js` 前注入：

```html
<script>
  window.STVISUAL_CLOUD_CONFIG = {
    firebase: {
      apiKey: 'YOUR_API_KEY',
      authDomain: 'YOUR_AUTH_DOMAIN',
      projectId: 'YOUR_PROJECT_ID',
      appId: 'YOUR_APP_ID'
    },
    drive: {
      uploadFolderId: 'OPTIONAL_DRIVE_FOLDER_ID'
    }
  };
</script>
```

## 4. Firestore 建議規則（開發版）
僅供開發測試，正式環境請再強化：

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/settings/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 5. 功能入口
進入應用後，切到「Google 雲端整合」區塊即可操作：
- Google 登入 / 登出
- 設定讀取 / 儲存（Firestore）
- 檔案上傳（Google Drive）

## 6. 常見錯誤：file:// 登入失敗
若你看到類似錯誤：

`Failed to execute 'postMessage' on 'DOMWindow': The target origin provided ('file://') does not match ... ('null')`

代表目前是用 `file://` 開啟頁面。Google OAuth 不支援 `file://` origin。

請改用本機伺服器或 https 網址開啟：

```bash
python3 -m http.server 4273
```

然後使用：

`http://127.0.0.1:4273/`
