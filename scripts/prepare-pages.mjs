import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFilePath), '..');
const outputDir = path.join(projectRoot, 'site');

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await mkdir(path.join(outputDir, 'src'), { recursive: true });

await cp(path.join(projectRoot, 'index.html'), path.join(outputDir, 'index.html'));
await cp(path.join(projectRoot, 'src', 'main.js'), path.join(outputDir, 'src', 'main.js'));
await cp(path.join(projectRoot, 'src', 'bootstrap.js'), path.join(outputDir, 'src', 'bootstrap.js'));
await cp(path.join(projectRoot, 'src', 'standalone.js'), path.join(outputDir, 'src', 'standalone.js'));
await cp(path.join(projectRoot, 'src', 'app.js'), path.join(outputDir, 'src', 'app.js'));
await cp(path.join(projectRoot, 'src', 'styles.css'), path.join(outputDir, 'src', 'styles.css'));
await cp(path.join(projectRoot, 'src', 'App.css'), path.join(outputDir, 'src', 'App.css'));
await cp(path.join(projectRoot, 'src', 'components'), path.join(outputDir, 'src', 'components'), { recursive: true });
await cp(path.join(projectRoot, 'src', 'data'), path.join(outputDir, 'src', 'data'), { recursive: true });
await cp(path.join(projectRoot, 'src', 'utils'), path.join(outputDir, 'src', 'utils'), { recursive: true });
await writeFile(path.join(outputDir, '.nojekyll'), '');

console.log(`Prepared GitHub Pages site at ${outputDir}`);