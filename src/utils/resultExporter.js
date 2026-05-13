/**
 * Utilities for encoding quiz/lab results into shareable URL parameters.
 * Phase A uses Base64 only (no server-side signing) — honour system.
 *
 * Payload schema v1:
 *   { v, explorer, explorerLabel, mode, ts, lang, score, total, items? }
 *   items: [{ q, a, expected?, ok }]
 */

export function encodeResult(payload) {
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

export function decodeResult(b64) {
  try {
    return JSON.parse(decodeURIComponent(atob(b64)));
  } catch {
    return null;
  }
}

export function buildShareUrl(encoded) {
  const base = `${location.origin}${location.pathname}`;
  return `${base}?result=${encoded}`;
}

export function parseResultFromUrl() {
  const params = new URLSearchParams(location.search);
  const b64 = params.get('result');
  if (!b64) return null;
  return decodeResult(b64);
}
