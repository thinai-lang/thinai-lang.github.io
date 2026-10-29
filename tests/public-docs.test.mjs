import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';

const root = new URL('..', import.meta.url);
const docs = new URL('../src/content/docs/', import.meta.url);

const listMarkdown = async (directory) => {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => join(entry.parentPath ?? entry.path, entry.name));
};

const pages = await listMarkdown(docs);

test('public pages do not link to the private source repository', async () => {
  const privateLink = /github\.com\/thinai-lang\/thinai(?![\w-])/;
  for (const page of pages) {
    const text = await readFile(page, 'utf8');
    assert.doesNotMatch(text, privateLink, `${page} links to the private repository`);
  }
  for (const file of ['README.md', 'astro.config.mjs']) {
    const text = await readFile(new URL(file, root), 'utf8');
    assert.doesNotMatch(text, privateLink, `${file} links to the private repository`);
  }
});

test('public pages do not use source-checkout commands', async () => {
  const sourceCommands = [/npm run build/, /npm test/, /packages\/(cli|language|extension)/];
  for (const page of pages) {
    const text = await readFile(page, 'utf8');
    for (const pattern of sourceCommands) {
      assert.doesNotMatch(text, pattern, `${page} references a source-only command`);
    }
  }
});

test('public pages link to mirrored examples that exist', async () => {
  const link = /thinai-lang\.github\.io\/(?:blob|tree)\/main\/(examples\/[^\s)#]+)/g;
  for (const page of pages) {
    const text = await readFile(page, 'utf8');
    for (const match of text.matchAll(link)) {
      const target = new URL(match[1], root);
      await assert.doesNotReject(
        stat(target),
        `${page} links to missing example ${match[1]}`
      );
    }
  }
});
