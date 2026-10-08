import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createHighlighter } from 'shiki';

const grammar = JSON.parse(
  await readFile(new URL('../src/grammars/thinai.tmLanguage.json', import.meta.url), 'utf8')
);
grammar.aliases = ['tni'];
const lightTheme = JSON.parse(
  await readFile(new URL('../src/themes/thinai-light.json', import.meta.url), 'utf8')
);
const darkTheme = JSON.parse(
  await readFile(new URL('../src/themes/thinai-dark.json', import.meta.url), 'utf8')
);

test('Shiki colors Thinai declaration roles with the VS Code grammar', async () => {
  const highlighter = await createHighlighter({
    themes: [lightTheme, darkTheme],
    langs: [grammar],
  });

  const cases = [
    ['aggregate Order {}', 'aggregate', 'thinai-light', '#cf222e'],
    ['aggregate Order {}', 'Order', 'thinai-light', '#8250df'],
    ['value object OrderId {}', 'OrderId', 'thinai-light', '#953800'],
    ['bounded context Ordering', 'Ordering', 'thinai-dark', '#79c0ff'],
    ['method placeOrder() {}', 'placeOrder', 'thinai-dark', '#7ee787'],
    ['enum OrderStatus { Draft, Placed }', 'Draft', 'thinai-light', '#8250df'],
  ];

  for (const [code, token, theme, expectedColor] of cases) {
    const html = highlighter.codeToHtml(code, { lang: 'thinai', theme });
    const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(
      html,
      new RegExp(`<span style="color:${expectedColor}(?:;[^\"]*)?">\\s*${escapedToken}\\s*<\\/span>`, 'i'),
      `${token} in ${code} should use ${expectedColor}`
    );
  }

  const aliasHtml = highlighter.codeToHtml('entity Item {}', {
    lang: 'tni',
    theme: 'thinai-light',
  });
  assert.ok(aliasHtml.includes('entity'));

  highlighter.dispose();
});
