import { readFileSync } from 'node:fs';

import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

const thinaiGrammar = JSON.parse(
  readFileSync(new URL('./src/grammars/thinai.tmLanguage.json', import.meta.url), 'utf8')
);
thinaiGrammar.aliases = ['tni'];
const thinaiLightTheme = JSON.parse(
  readFileSync(new URL('./src/themes/thinai-light.json', import.meta.url), 'utf8')
);
const thinaiDarkTheme = JSON.parse(
  readFileSync(new URL('./src/themes/thinai-dark.json', import.meta.url), 'utf8')
);

export default defineConfig({
  site: 'https://thinai-lang.github.io',
  output: 'static',
  integrations: [
    starlight({
      title: 'Thinai',
      description: 'A domain-specific modeling language for domain-driven design.',
      logo: {
        light: './src/assets/thinai-light.svg',
        dark: './src/assets/thinai-dark.svg',
        alt: 'Thinai',
      },
      favicon: '/assets/thinai-light.svg',
      customCss: ['./src/styles/brand.css'],
      sidebar: [
        { label: 'Home', link: '/' },
        { label: 'Getting started', items: ['getting-started'] },
        {
          label: 'Language guides',
          items: ['language-model', 'tactical-modeling', 'events-and-behavior'],
        },
        {
          label: 'Order Fulfillment example',
          link: 'https://github.com/thinai-lang/thinai/tree/main/examples/order-fulfillment',
        },
      ],
      expressiveCode: {
        themes: ['catppuccin-latte', 'catppuccin-mocha'],
        customizeTheme: (theme) => {
          const thinaiTheme = theme.type === 'dark' ? thinaiDarkTheme : thinaiLightTheme;
          theme.settings.push(...thinaiTheme.settings);
          return theme;
        },
        shiki: {
          langs: [thinaiGrammar],
        },
      },
    }),
  ],
});
