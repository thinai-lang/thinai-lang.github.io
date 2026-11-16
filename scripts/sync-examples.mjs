import { cp, readdir, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative, resolve, sep } from 'node:path';

const check = process.argv.includes('--check');
const thinaiRepo = process.env.THINAI_REPO ?? resolve(fileURLToPath(new URL('../..', import.meta.url)), 'thinai');
const source = resolve(thinaiRepo, 'examples');
const target = fileURLToPath(new URL('../examples', import.meta.url));

if (!existsSync(source)) {
  console.error(`Thinai examples not found at ${source}. Set THINAI_REPO to the repository checkout.`);
  process.exit(1);
}

if (source === target || target.startsWith(`${source}${sep}`) || source.startsWith(`${target}${sep}`)) {
  console.error(`Refusing to sync overlapping paths: ${source} and ${target}`);
  process.exit(1);
}

const supported = (file) => file.endsWith('.tni') || file.endsWith('.md');

const listFiles = async (directory) => {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => relative(directory, join(entry.parentPath ?? entry.path, entry.name)))
    .sort();
};

if (check) {
  if (!existsSync(target)) {
    console.error(`Missing public examples mirror at ${target}`);
    process.exit(1);
  }
  const expected = await listFiles(source);
  const actual = await listFiles(target);
  const unsupported = expected.filter((file) => !supported(file));
  const missing = expected.filter((file) => !actual.includes(file));
  const extra = actual.filter((file) => !expected.includes(file));
  const changed = [];
  for (const file of expected) {
    if (missing.includes(file)) {
      continue;
    }
    const [left, right] = await Promise.all([
      readFile(resolve(source, file)),
      readFile(resolve(target, file))
    ]);
    if (!left.equals(right)) {
      changed.push(file);
    }
  }
  if (unsupported.length || missing.length || extra.length || changed.length) {
    for (const file of unsupported) console.error(`unsupported: ${file}`);
    for (const file of missing) console.error(`missing: ${file}`);
    for (const file of extra) console.error(`unexpected: ${file}`);
    for (const file of changed) console.error(`outdated: ${file}`);
    console.error('Public examples mirror is stale. Run `npm run sync:examples`.');
    process.exit(1);
  }
  console.log(`Public examples mirror is up to date (${expected.length} files).`);
} else {
  const unsupported = (await listFiles(source)).filter((file) => !supported(file));
  if (unsupported.length) {
    for (const file of unsupported) console.error(`unsupported: ${file}`);
    console.error('Public examples may contain only .tni and .md files.');
    process.exit(1);
  }
  await rm(target, { recursive: true, force: true });
  await cp(source, target, { recursive: true });
  const files = await listFiles(target);
  console.log(`Copied ${files.length} example files from ${source} to ${target}`);
}
