// Generates src/data/slideDecks.generated.js from the docs/slides Marp decks
// and copies the screenshots they reference into public/slide-assets/.
// Run via `npm run build:slide-decks`.
import {
  readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync,
  symlinkSync, lstatSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, posix } from 'node:path';

// Repo-relative source/doc links in the decks point at files that the app
// cannot serve; rewrite them to viewable GitHub URLs.
const REPO_URL = 'https://github.com/skhuang/stvisual';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SLIDES_DIR = join(ROOT, 'docs/slides');
const ASSETS_SRC = join(ROOT, 'docs/assets/slides');
const ASSETS_OUT = join(ROOT, 'public/slide-assets');

// base file name (without lang/extension) → deck metadata
const DECKS = [
  { base: '01-course-intro',                 id: 'course-intro',        num: 1,  section: 'methods' },
  { base: '02-testing-flow-pyramid',         id: 'testing-flow-pyramid',num: 2,  section: 'flow' },
  { base: '03-graph-coverage',               id: 'graph-coverage',      num: 3,  section: 'graph' },
  { base: '04-data-flow-coverage',           id: 'data-flow-coverage',  num: 4,  section: 'graph' },
  { base: '05-logic-coverage',               id: 'logic-coverage',      num: 5,  section: 'logic' },
  { base: '06-program-mutation',             id: 'program-mutation',    num: 6,  section: 'syntax' },
  { base: '07-grammar-and-string-mutation',  id: 'grammar-mutation',    num: 7,  section: 'syntax' },
  { base: '08-spec-mutation',                id: 'spec-mutation',       num: 8,  section: 'syntax' },
  { base: '09-fuzz-testing',                 id: 'fuzz-testing',        num: 9,  section: 'fuzz' },
  { base: '10-symbolic-execution',           id: 'symbolic-execution',  num: 10, section: 'symbex' },
  { base: '11-concolic-execution',           id: 'concolic-execution',  num: 11, section: 'concolic' },
  { base: '12-test-generation',              id: 'test-generation',     num: 12, section: 'testgen' },
  { base: '13-logic-binding',                id: 'logic-binding',       num: 13, section: 'logic' },
  { base: '14-defect-cost',                  id: 'defect-cost',         num: 14, section: 'flow' },
  { base: '15-v-model',                      id: 'v-model',             num: 15, section: 'flow' },
  { base: '16-testing-types',                id: 'testing-types',       num: 16, section: 'types' },
  { base: '17-test-pyramid',                 id: 'test-pyramid',        num: 17, section: 'types' },
  { base: '18-code-coverage',                id: 'code-coverage',       num: 18, section: 'codecov' },
  { base: '19-boundary-value',               id: 'boundary-value',      num: 19, section: 'blackbox' },
  { base: '20-equivalence-partitioning',     id: 'equivalence-partitioning', num: 20, section: 'blackbox' },
  { base: '21-decision-table',               id: 'decision-table',      num: 21, section: 'blackbox' },
  { base: '22-state-transition',             id: 'state-transition',    num: 22, section: 'blackbox' },
  { base: '23-pairwise',                     id: 'pairwise',            num: 23, section: 'blackbox' },
  { base: '24-cause-effect',                 id: 'cause-effect',        num: 24, section: 'blackbox' },
  { base: '25-metamorphic',                  id: 'metamorphic',         num: 25, section: 'blackbox' },
  { base: '26-exploratory',                  id: 'exploratory',         num: 26, section: 'blackbox' },
  { base: '27-test-doubles',                 id: 'test-doubles',        num: 27, section: 'blackbox' },
  { base: '28-group-theory',                 id: 'group-theory',        num: 28, section: 'groupth' },
  { base: '29-property-based',               id: 'property-based',      num: 29, section: 'pbt' },
  { base: '30-integration-testing',          id: 'integration-testing', num: 30, section: 'inttest' },
  { base: '31-risk-based',                   id: 'risk-based',          num: 31, section: 'rbt' },
  { base: '32-equivalent-mutants',           id: 'equivalent-mutants',  num: 32, section: 'advanced' },
  { base: '33-mutation-score',               id: 'mutation-score',      num: 33, section: 'advanced' },
  { base: '34-llm-test-pipeline',            id: 'llm-test-pipeline',   num: 34, section: 'advanced' },
  { base: '35-test-quality-gates',           id: 'test-quality-gates',  num: 35, section: 'advanced' },
  { base: '36-fault-directed-testing',       id: 'fault-directed-testing', num: 36, section: 'advanced' },
  { base: '37-sailor-vulnerability',         id: 'sailor-vulnerability', num: 37, section: 'advanced' },
  { base: '38-bdd-gherkin',                  id: 'bdd-gherkin',         num: 38, section: 'acceptance' },
  { base: '39-use-case-derivation',          id: 'use-case-derivation', num: 39, section: 'acceptance' },
  { base: '40-e2e-user-journey',             id: 'e2e-user-journey',    num: 40, section: 'acceptance' },
  { base: '41-contract-testing',             id: 'contract-testing',    num: 41, section: 'acceptance' },
  { base: '42-performance-load',             id: 'performance-load',    num: 42, section: 'acceptance' },
  { base: '43-chaos-engineering',            id: 'chaos-engineering',   num: 43, section: 'acceptance' },
  { base: '44-atdd-cycle',                   id: 'atdd-cycle',          num: 44, section: 'acceptance' },
  { base: '45-flaky-diagnosis',              id: 'flaky-diagnosis',     num: 45, section: 'acceptance' },
  { base: '46-mbt-workflow',                 id: 'mbt-workflow',        num: 46, section: 'mbt' },
  { base: '47-fsm-test-generation',          id: 'fsm-test-generation', num: 47, section: 'mbt' },
  { base: '48-w-method',                     id: 'w-method',            num: 48, section: 'mbt' },
  { base: '49-efsm-guarded-transition',      id: 'efsm-guarded-transition', num: 49, section: 'mbt' },
  { base: '50-usage-model-statistical',      id: 'usage-model-statistical', num: 50, section: 'mbt' },
  { base: '51-model-mutation',               id: 'model-mutation',      num: 51, section: 'mbt' },
  { base: '52-agile-quadrants',              id: 'agile-quadrants',     num: 52, section: 'agile' },
  { base: '53-sprint-cadence',               id: 'sprint-cadence',      num: 53, section: 'agile' },
  { base: '54-definition-gates',             id: 'definition-gates',    num: 54, section: 'agile' },
  { base: '55-example-mapping',              id: 'example-mapping',     num: 55, section: 'agile' },
  { base: '56-continuous-testing',           id: 'continuous-testing',  num: 56, section: 'agile' },
  { base: '57-regression-debt',              id: 'regression-debt',     num: 57, section: 'agile' },
  { base: '58-program-slicing',              id: 'program-slicing',     num: 58, section: 'slicing' },
  { base: '59-fault-localization-dicing',    id: 'fault-localization-dicing', num: 59, section: 'slicing' },
  { base: '60-slice-based-coverage',         id: 'slice-based-coverage',      num: 60, section: 'slicing' },
  { base: '61-regression-test-selection',   id: 'regression-test-selection', num: 61, section: 'slicing' },
  { base: '62-test-driven-development', id: 'test-driven-development', num: 62, section: 'tdd' },
  { base: '63-exploit-generation', id: 'exploit-generation', num: 63, section: 'exploit' },
  { base: '64-input-space-partitioning', id: 'input-space-partitioning', num: 64, section: 'blackbox' },
];

function frontMatterTitle(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return '';
  const t = m[1].match(/^title:\s*(.+)$/m);
  return t ? t[1].trim() : '';
}

// Copy every referenced screenshot and rewrite ../assets/slides/X -> ./slide-assets/X
function processImages(md) {
  return md.replace(/(!\[[^\]]*\]\()(?:\.\.\/)+assets\/slides\/([^)]+)(\))/g, (_, pre, file, post) => {
    const from = join(ASSETS_SRC, file);
    if (existsSync(from)) copyFileSync(from, join(ASSETS_OUT, file));
    return `${pre}./slide-assets/${file}${post}`;
  });
}

// Rewrite remaining repo-relative markdown links (../../src/x.js, ../foo.md)
// to GitHub URLs. Resolved against docs/slides/, where the decks live.
// Run after processImages so screenshot links are already ./slide-assets/.
function rewriteLinks(md) {
  return md.replace(/(\]\()(\.\.[^)\s]+)(\))/g, (_, pre, rel, post) => {
    const repoPath = posix.normalize(posix.join('docs/slides', rel));
    const kind = posix.extname(repoPath.split('#')[0]) ? 'blob' : 'tree';
    return `${pre}${REPO_URL}/${kind}/main/${repoPath}${post}`;
  });
}

// Decks reference screenshots as ./slide-assets/X — a path that resolves only
// when public/ is the web root (Vite dev, the deployed GitHub Pages site).
// When the app is served straight from the repo root instead (`npm run serve`,
// or opening index.html as a file://), ./slide-assets/ would 404. A repo-root
// `slide-assets` symlink into public/slide-assets/ makes the path resolve in
// every serving mode. The symlink is committed; this just self-heals it.
function ensureRepoRootSymlink() {
  const link = join(ROOT, 'slide-assets');
  try {
    lstatSync(link);
    return; // already present — leave it
  } catch { /* missing — create below */ }
  symlinkSync('public/slide-assets', link);
  console.log('slideDecks: created repo-root slide-assets symlink');
}

mkdirSync(ASSETS_OUT, { recursive: true });
mkdirSync(join(ROOT, 'src/data'), { recursive: true });
ensureRepoRootSymlink();

const records = DECKS.map((d) => {
  const enRaw = readFileSync(join(SLIDES_DIR, `${d.base}.en.md`), 'utf8');
  const zhRaw = readFileSync(join(SLIDES_DIR, `${d.base}.zh-TW.md`), 'utf8');
  return {
    id: d.id, num: d.num, section: d.section,
    titleEn: frontMatterTitle(enRaw) || d.id,
    titleZh: frontMatterTitle(zhRaw) || d.id,
    en: rewriteLinks(processImages(enRaw)),
    zh: rewriteLinks(processImages(zhRaw)),
  };
});

const out = `// AUTO-GENERATED by scripts/build-slide-decks.mjs — do not edit.
// Run \`npm run build:slide-decks\` to regenerate.
export const SLIDE_DECKS = ${JSON.stringify(records, null, 2)};
`;
writeFileSync(join(ROOT, 'src/data/slideDecks.generated.js'), out);
console.log(`slideDecks: wrote ${records.length} decks`);
