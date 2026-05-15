import { t } from '../i18n/index.js';
import { EXPLORER_TAGS } from '../data/explorerTags.js';
import { getCoursePack, getCoursePackExplorers } from '../data/courseSeries.js';
import { explorerToUrl } from './urlRouter.js';

const DEMO_URL = 'https://skhuang.github.io/stvisual/';

// Most Explorer files declare an i18n description key. Falls back to the
// component id (stripping the `Explorer` suffix) if no key matches.
function explorerDisplayName(id) {
  const stripped = id.replace(/Explorer$/, '');
  // Translation keys vary per Explorer; try a few common patterns.
  const candidates = [
    `section.${stripped.toLowerCase()}.title`,
    `${stripped.toLowerCase()}.title`,
    `emx.title`, `msx.title`, `llmp.title`, `tqx.title`, `fdx.title`,
  ];
  for (const key of candidates) {
    const v = t(key);
    if (v && v !== key) return v;
  }
  // Convert CamelCase → "Space-Separated Words".
  return stripped.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function tagLine(tags) {
  const parts = [];
  if (tags.level?.length) parts.push(`level: ${tags.level.join(', ')}`);
  if (tags.technique?.length) parts.push(`technique: ${tags.technique.join(', ')}`);
  if (tags.difficulty) parts.push(`difficulty: ${tags.difficulty}`);
  if (tags.source?.length) parts.push(`source: ${tags.source.join(', ')}`);
  return parts.join(' · ');
}

// `baseUrl` is injectable so self-hosted deployments can swap the demo
// origin and tests can pin a stable value. Defaults to the public demo.
export function buildCoursePackMarkdown(packId, { baseUrl = DEMO_URL } = {}) {
  const pack = getCoursePack(packId);
  if (!pack) return '';
  const ids = getCoursePackExplorers(packId);
  const title = t(pack.titleKey);
  const desc = t(pack.descKey);
  const lines = [];
  lines.push(`# ${title}`);
  lines.push('');
  lines.push(desc);
  lines.push('');
  lines.push(`**Live demo:** ${baseUrl}`);
  lines.push('');
  lines.push(`## Explorers (${ids.length})`);
  lines.push('');
  for (const id of ids) {
    const tags = EXPLORER_TAGS[id] ?? {};
    lines.push(`### ${explorerDisplayName(id)}`);
    lines.push('');
    lines.push(`- **ID:** \`${id}\``);
    const openUrl = explorerToUrl(id, baseUrl);
    if (openUrl) lines.push(`- **Open:** ${openUrl}`);
    const tagBits = tagLine(tags);
    if (tagBits) lines.push(`- **Tags:** ${tagBits}`);
    lines.push('');
  }
  lines.push('---');
  lines.push('');
  lines.push(`_Generated from stvisual · pack \`${pack.id}\` · ${ids.length} Explorer(s)._`);
  return lines.join('\n');
}

// Trigger a browser download. Pure DOM, no test pollution outside the
// invocation. Safe to call from a click handler. Returns the markdown
// string so tests / non-browser callers can still inspect it without
// relying on the file-save side-effect.
export function downloadCoursePackMarkdown(packId, options) {
  const md = buildCoursePackMarkdown(packId, options);
  if (!md) return null;
  if (typeof document === 'undefined') return md;
  // Some test environments (jsdom) don't implement URL.createObjectURL.
  const createUrl = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL.bind(URL)
    : null;
  if (!createUrl) return md;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = createUrl(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stvisual-pack-${packId}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revoke so the click handler completes first.
  if (typeof URL.revokeObjectURL === 'function') {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  return md;
}
