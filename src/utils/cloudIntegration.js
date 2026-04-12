import { getResolvedCloudConfig } from '../config/cloudConfig.js';

const REQUIRED_FIREBASE_KEYS = ['apiKey', 'authDomain', 'projectId', 'appId'];
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

function getMissingFirebaseKeys(firebaseConfig) {
  return REQUIRED_FIREBASE_KEYS.filter((key) => !firebaseConfig?.[key]);
}

function createMultipartBody(file, metadata) {
  const boundary = `stvisual-${Date.now()}`;
  const head = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
  const middle = `--${boundary}\r\nContent-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;
  const tail = `\r\n--${boundary}--`;

  return {
    boundary,
    body: new Blob([head, middle, file, tail]),
  };
}

export function createCloudIntegrationClient() {
  const config = getResolvedCloudConfig();
  const missingKeys = getMissingFirebaseKeys(config.firebase);
  const isFileProtocol = globalThis.location?.protocol === 'file:';
  const isSupportedOrigin = !isFileProtocol;
  const isConfigured = missingKeys.length === 0;
  const firebase = globalThis.firebase;

  if (!isSupportedOrigin) {
    const originMessage = 'Google OAuth 不支援 file://。請改用 http://localhost 或 https 網址開啟頁面。';

    return {
      isConfigured,
      missingKeys,
      isSupportedOrigin,
      originWarning: originMessage,
      subscribeAuthState(callback) {
        callback(null);
        return () => {};
      },
      async signInWithGoogle() {
        throw new Error(originMessage);
      },
      async signOutGoogle() {
        throw new Error(originMessage);
      },
      async saveSettings() {
        throw new Error(originMessage);
      },
      async loadSettings() {
        throw new Error(originMessage);
      },
      async uploadFileToDrive() {
        throw new Error(originMessage);
      },
    };
  }

  if (!isConfigured) {
    return {
      isConfigured,
      missingKeys,
      isSupportedOrigin,
      originWarning: '',
      subscribeAuthState(callback) {
        callback(null);
        return () => {};
      },
      async signInWithGoogle() {
        throw new Error(`Firebase 設定不完整，缺少：${missingKeys.join(', ')}`);
      },
      async signOutGoogle() {
        throw new Error(`Firebase 設定不完整，缺少：${missingKeys.join(', ')}`);
      },
      async saveSettings() {
        throw new Error(`Firebase 設定不完整，缺少：${missingKeys.join(', ')}`);
      },
      async loadSettings() {
        throw new Error(`Firebase 設定不完整，缺少：${missingKeys.join(', ')}`);
      },
      async uploadFileToDrive() {
        throw new Error(`Firebase 設定不完整，缺少：${missingKeys.join(', ')}`);
      },
    };
  }

  if (!firebase?.apps || typeof firebase.initializeApp !== 'function') {
    const sdkMessage = 'Firebase SDK 尚未載入，請確認 index.html 已引入 firebase-app/auth/firestore compat scripts。';

    return {
      isConfigured,
      missingKeys,
      isSupportedOrigin,
      originWarning: '',
      subscribeAuthState(callback) {
        callback(null);
        return () => {};
      },
      async signInWithGoogle() {
        throw new Error(sdkMessage);
      },
      async signOutGoogle() {
        throw new Error(sdkMessage);
      },
      async saveSettings() {
        throw new Error(sdkMessage);
      },
      async loadSettings() {
        throw new Error(sdkMessage);
      },
      async uploadFileToDrive() {
        throw new Error(sdkMessage);
      },
    };
  }

  const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(config.firebase);
  const auth = firebase.auth(app);
  const db = firebase.firestore(app);
  let driveAccessToken = null;

  return {
    isConfigured,
    missingKeys,
    isSupportedOrigin,
    originWarning: '',
    subscribeAuthState(callback) {
      return auth.onAuthStateChanged(callback);
    },
    async signInWithGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope(DRIVE_SCOPE);

      const result = await auth.signInWithPopup(provider);
      const credential = result.credential;
      driveAccessToken = credential?.accessToken || null;

      return {
        user: result.user,
        hasDriveToken: Boolean(driveAccessToken),
      };
    },
    async signOutGoogle() {
      driveAccessToken = null;
      await auth.signOut();
    },
    async loadSettings(userId) {
      const snapshot = await db.collection('users').doc(userId).collection('settings').doc('default').get();

      if (!snapshot.exists()) {
        return null;
      }

      return snapshot.data();
    },
    async saveSettings(userId, settings) {
      await db.collection('users').doc(userId).collection('settings').doc('default').set({
        ...settings,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    },
    async uploadFileToDrive(file, options = {}) {
      if (!driveAccessToken) {
        throw new Error('目前沒有 Drive 存取權杖，請先重新 Google 登入。');
      }

      const metadata = {
        name: file.name,
      };

      const folderId = options.folderId || config.drive.uploadFolderId;
      if (folderId) {
        metadata.parents = [folderId];
      }

      const { boundary, body } = createMultipartBody(file, metadata);
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${driveAccessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error?.message || '上傳到 Google Drive 失敗。');
      }

      return payload;
    },
  };
}