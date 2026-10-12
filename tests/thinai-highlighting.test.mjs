import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createHighlighter } from 'shiki';

const grammar = JSON.parse(
  await readFile(new URL('../src/grammars/thinai.tmLanguage.json', import.meta.url), 'utf8')
);
grammar.aliases = ['tni'];

test('Vitesse themes color Thinai scopes without custom overrides', async () => {
  const highlighter = await createHighlighter({
    themes: ['vitesse-light', 'vitesse-dark'],
    langs: [grammar],
  });

  const cases = [
    ['aggregate Order {}', 'aggregate', 'vitesse-light', '#1E754F'],
    ['aggregate Order {}', 'aggregate', 'vitesse-dark', '#4D9375'],
    ['aggregate Order {}', 'Order', 'vitesse-light', '#59873A'],
    ['bounded context Ordering', 'Ordering', 'vitesse-dark', '#80A665'],
    ['method placeOrder() {}', 'placeOrder', 'vitesse-dark', '#80A665'],
    ['adjustments?: List<number>', 'adjustments', 'vitesse-light', '#B07D48'],
    ['adjustments?: List<number>', '?', 'vitesse-light', '#AB5959'],
    ['adjustments?: List<number>', 'adjustments', 'vitesse-dark', '#BD976A'],
    ['adjustments?: List<number>', '?', 'vitesse-dark', '#CB7676'],
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
    theme: 'vitesse-light',
  });
  assert.ok(aliasHtml.includes('entity'));

  highlighter.dispose();
});

test('Vitesse themes color general code blocks', async () => {
  const highlighter = await createHighlighter({
    themes: ['vitesse-light', 'vitesse-dark'],
    langs: ['javascript'],
  });

  for (const theme of ['vitesse-light', 'vitesse-dark']) {
    const html = highlighter.codeToHtml('const greeting = "hello"; console.log(greeting)', {
      lang: 'javascript',
      theme,
    });
    const colors = new Set([...html.matchAll(/style="color:(#[0-9A-F]{6})/gi)].map((match) => match[1]));

    assert.ok(html.includes(`class="shiki ${theme}"`));
    assert.ok(colors.size >= 4, `${theme} should color multiple JavaScript token roles`);
  }

  highlighter.dispose();
});
