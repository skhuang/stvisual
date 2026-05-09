// Reads environment variables (from process.env or a local .env file)
// and replaces the __PLACEHOLDER__ tokens in src/config/cloudConfig.js.
//
// Usage:
//   node scripts/inject-env.mjs          # reads .env if present
//   FIREBASE_API_KEY=xxx node scripts/inject-env.mjs  # uses shell env

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(projectRoot, 'src', 'config', 'cloudConfig.js');

// Load .env file if it exists (does NOT override existing process.env).
const dotenvPath = path.join(projectRoot, '.env');
try {
  const dotenv = await readFile(dotenvPath, 'utf8');
  for (const line of dotenv.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
} catch {
  // No .env file — rely on process.env (CI secrets).
}

const PLACEHOLDERS = {
  __FIREBASE_API_KEY__: 'FIREBASE_API_KEY',
  __FIREBASE_AUTH_DOMAIN__: 'FIREBASE_AUTH_DOMAIN',
  __FIREBASE_PROJECT_ID__: 'FIREBASE_PROJECT_ID',
  __FIREBASE_STORAGE_BUCKET__: 'FIREBASE_STORAGE_BUCKET',
  __FIREBASE_MESSAGING_SENDER_ID__: 'FIREBASE_MESSAGING_SENDER_ID',
  __FIREBASE_APP_ID__: 'FIREBASE_APP_ID',
  __FIREBASE_MEASUREMENT_ID__: 'FIREBASE_MEASUREMENT_ID',
  __DRIVE_UPLOAD_FOLDER_ID__: 'DRIVE_UPLOAD_FOLDER_ID',
};

let source = await readFile(configPath, 'utf8');
let replaced = 0;

for (const [placeholder, envKey] of Object.entries(PLACEHOLDERS)) {
  const value = process.env[envKey] || '';
  if (source.includes(placeholder)) {
    source = source.replaceAll(placeholder, value);
    replaced += 1;
    if (!value) {
      console.warn(`  ⚠  ${envKey} is empty — placeholder ${placeholder} replaced with blank.`);
    }
  }
}

await writeFile(configPath, source, 'utf8');
console.log(`inject-env: replaced ${replaced} placeholder(s) in cloudConfig.js`);
