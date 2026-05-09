export const cloudConfig = {
  firebase: {
    apiKey: "__FIREBASE_API_KEY__",
    authDomain: "__FIREBASE_AUTH_DOMAIN__",
    projectId: "__FIREBASE_PROJECT_ID__",
    storageBucket: "__FIREBASE_STORAGE_BUCKET__",
    messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
    appId: "__FIREBASE_APP_ID__",
    measurementId: "__FIREBASE_MEASUREMENT_ID__",
  },
  drive: {
    uploadFolderId: '__DRIVE_UPLOAD_FOLDER_ID__',
  },
};

export function getResolvedCloudConfig() {
  const runtimeConfig = globalThis.STVISUAL_CLOUD_CONFIG || {};

  return {
    ...cloudConfig,
    ...runtimeConfig,
    firebase: {
      ...cloudConfig.firebase,
      ...(runtimeConfig.firebase || {}),
    },
    drive: {
      ...cloudConfig.drive,
      ...(runtimeConfig.drive || {}),
    },
  };
}
