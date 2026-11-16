import { copyFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const check = process.argv.includes('--check');
const thinaiRepo = process.env.THINAI_REPO ?? resolve(fileURLToPath(new URL('../..', import.meta.url)), 'thinai');
const source = resolve(thinaiRepo, 'packages/extension/syntaxes/thinai.tmLanguage.json');
const target = fileURLToPath(new URL('../src/grammars/thinai.tmLanguage.json', import.meta.url));

if (check) {
  const [expected, actual] = await Promise.all([readFile(source), readFile(target)]);
  if (!expected.equals(actual)) {
    console.error(`Thinai grammar mirror is stale. Run \`npm run sync:grammar\`.`);
    process.exit(1);
  }
  console.log('Thinai grammar mirror is up to date.');
} else {
  await copyFile(source, target);
  console.log(`Copied Thinai grammar from ${source} to ${target}`);
}
