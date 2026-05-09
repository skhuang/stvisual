import { defineConfig } from 'vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local for dev mode (mimics inject-env behavior)
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const env = {};
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '').trim();
        env[key.trim()] = value;
      }
    });
    return env;
  } catch {
    return {};
  }
}

const env = loadEnv();

export default defineConfig({
  root: '.',
  server: {
    port: 4173,
    open: true,
    middlewareMode: false,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
    // Preserve existing esbuild-based bundle for standalone.js
  },
  define: {
    __FIREBASE_API_KEY__: JSON.stringify(env.FIREBASE_API_KEY || ''),
    __FIREBASE_AUTH_DOMAIN__: JSON.stringify(env.FIREBASE_AUTH_DOMAIN || ''),
    __FIREBASE_PROJECT_ID__: JSON.stringify(env.FIREBASE_PROJECT_ID || ''),
    __FIREBASE_STORAGE_BUCKET__: JSON.stringify(env.FIREBASE_STORAGE_BUCKET || ''),
    __FIREBASE_MESSAGING_SENDER_ID__: JSON.stringify(env.FIREBASE_MESSAGING_SENDER_ID || ''),
    __FIREBASE_APP_ID__: JSON.stringify(env.FIREBASE_APP_ID || ''),
    __GOOGLE_DRIVE_CLIENT_ID__: JSON.stringify(env.GOOGLE_DRIVE_CLIENT_ID || ''),
    __GITHUB_PAGES_BASE_PATH__: JSON.stringify(env.GITHUB_PAGES_BASE_PATH || ''),
  },
});
