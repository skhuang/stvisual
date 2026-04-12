import { describe, expect, it } from 'vitest';
import { createCloudIntegrationClient } from '../utils/cloudIntegration.js';

describe('cloudIntegration client', () => {
  it('exposes expected capability flags', () => {
    const client = createCloudIntegrationClient();

    expect(typeof client.isConfigured).toBe('boolean');
    expect(Array.isArray(client.missingKeys)).toBe(true);
    expect(typeof client.isSupportedOrigin).toBe('boolean');
  });

  it('fails sign-in in unsupported test environment with meaningful message', async () => {
    const client = createCloudIntegrationClient();

    if (!client.isSupportedOrigin) {
      await expect(client.signInWithGoogle()).rejects.toThrow('Google OAuth 不支援 file://');
      return;
    }

    if (!client.isConfigured) {
      await expect(client.signInWithGoogle()).rejects.toThrow('Firebase 設定不完整');
      return;
    }

    await expect(client.signInWithGoogle()).rejects.toThrow(/operation-not-supported|popup|auth|SDK 尚未載入/i);
  });
});