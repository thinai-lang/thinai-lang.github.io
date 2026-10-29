import { copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const thinaiRepo = process.env.THINAI_REPO ?? resolve(fileURLToPath(new URL('../..', import.meta.url)), 'thinai');
const source = resolve(thinaiRepo, 'packages/extension/syntaxes/thinai.tmLanguage.json');
const target = fileURLToPath(new URL('../src/grammars/thinai.tmLanguage.json', import.meta.url));

await copyFile(source, target);
console.log(`Copied Thinai grammar from ${source} to ${target}`);
