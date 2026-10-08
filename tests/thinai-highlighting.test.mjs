import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createHighlighter } from 'shiki';

const grammar = JSON.parse(
  await readFile(new URL('../src/grammars/thinai.tmLanguage.json', import.meta.url), 'utf8')
);
grammar.aliases = ['tni'];

test('Shiki highlights Thinai declarations with the VS Code grammar', async () => {
  const highlighter = await createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: [grammar],
  });

  for (const theme of ['github-light', 'github-dark']) {
    const html = highlighter.codeToHtml('aggregate Order {}', { lang: 'thinai', theme });
    assert.match(html, /<span style="color:[^"]+">aggregate<\/span>/);
    assert.match(html, /Order/);
  }

  const aliasHtml = highlighter.codeToHtml('entity Item {}', {
    lang: 'tni',
    theme: 'github-light',
  });
  assert.match(aliasHtml, /<span style="color:[^"]+">entity<\/span>/);

  highlighter.dispose();
});
