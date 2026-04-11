import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFilePath), '..');

await build({
  entryPoints: [path.join(projectRoot, 'src', 'main.js')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2019'],
  outfile: path.join(projectRoot, 'src', 'standalone.js'),
  sourcemap: false,
  minify: false,
});

console.log('Built standalone bundle at src/standalone.js');
