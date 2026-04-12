import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
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

  const app = getApps()[0] || initializeApp(config.firebase);
  const auth = getAuth(app);
  const db = getFirestore(app);
  let driveAccessToken = null;

  return {
    isConfigured,
    missingKeys,
    isSupportedOrigin,
    originWarning: '',
    subscribeAuthState(callback) {
      return onAuthStateChanged(auth, callback);
    },
    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      provider.addScope(DRIVE_SCOPE);

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      driveAccessToken = credential?.accessToken || null;

      return {
        user: result.user,
        hasDriveToken: Boolean(driveAccessToken),
      };
    },
    async signOutGoogle() {
      driveAccessToken = null;
      await signOut(auth);
    },
    async loadSettings(userId) {
      const snapshot = await getDoc(doc(db, 'users', userId, 'settings', 'default'));

      if (!snapshot.exists()) {
        return null;
      }

      return snapshot.data();
    },
    async saveSettings(userId, settings) {
      await setDoc(doc(db, 'users', userId, 'settings', 'default'), {
        ...settings,
        updatedAt: serverTimestamp(),
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