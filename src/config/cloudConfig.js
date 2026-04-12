export const cloudConfig = {
  firebase: {
    apiKey: "AIzaSyB9QlOS2IodbRQWxGGe_a8cEviSZURyo3k",
    authDomain: "stvisual-a88cd.firebaseapp.com",
    projectId: "stvisual-a88cd",
    storageBucket: "stvisual-a88cd.firebasestorage.app",
    messagingSenderId: "1030102454109",
    appId: "1:1030102454109:web:cb50e6da22b4b5dda2a2b4",
    measurementId: "G-RBRGPW34JQ",
  },
  drive: {
    uploadFolderId: '333974166897-l4mfva3ntjghf90ogp5f3mqvik9rje2p.apps.googleusercontent.com',
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