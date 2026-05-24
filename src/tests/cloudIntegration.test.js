import { describe, expect, it } from 'vitest';
import { createCloudIntegrationClient } from '../utils/cloudIntegration.js';


describe('cloudIntegration client', () => {
  it('exposes expected capability flags', () => {
    const client = createCloudIntegrationClient();

    expect(typeof client.isConfigured).toBe('boolean');
    expect(Array.isArray(client.missingKeys)).toBe(true);
    expect(typeof client.isSupportedOrigin).toBe('boolean');
  });

  it('exposes getUser method', () => {
    const client = createCloudIntegrationClient();
    expect(typeof client.getUser).toBe('function');
    expect(client.getUser()).toBeNull();
  });

  it('exposes saveResult method', () => {
    const client = createCloudIntegrationClient();
    expect(typeof client.saveResult).toBe('function');
  });

  it('exposes loadCourseResults method that resolves to empty array when unconfigured', async () => {
    const client = createCloudIntegrationClient();
    const results = await client.loadCourseResults('TEST');
    expect(Array.isArray(results)).toBe(true);
    expect(results).toHaveLength(0);
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

  it('saveResult rejects when unconfigured or unsupported', async () => {
    const client = createCloudIntegrationClient();
    if (client.isConfigured && client.isSupportedOrigin) return; // skip in live env
    await expect(
      client.saveResult('uid', 'Name', 'a@b.com', 'ABC', { explorer: 'graph', score: 1, total: 2 })
    ).rejects.toThrow();
  });
});

import { DRIVE_SCOPES } from '../utils/cloudIntegration.js';

describe('cloudIntegration — private-slides additions', () => {
  it('exports both drive.file and drive.readonly in DRIVE_SCOPES', () => {
    expect(DRIVE_SCOPES).toEqual(expect.arrayContaining([
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.readonly',
    ]));
    expect(DRIVE_SCOPES.length).toBe(2);
  });

  it('createCloudIntegrationClient returns the same instance on repeated calls', () => {
    const a = createCloudIntegrationClient();
    const b = createCloudIntegrationClient();
    expect(a).toBe(b);
  });

  it('the client exposes getAccessToken returning null when not signed in', () => {
    const client = createCloudIntegrationClient();
    expect(typeof client.getAccessToken).toBe('function');
    expect(client.getAccessToken()).toBe(null);
  });
});
