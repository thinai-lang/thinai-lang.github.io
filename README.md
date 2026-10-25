# Thinai documentation site

This repository contains the source for [thinai-lang.github.io](https://thinai-lang.github.io/). Documentation updates are built with Astro Starlight and deployed from `main` with GitHub Actions when the repository is public.

The Shiki language grammar at `src/grammars/thinai.tmLanguage.json` is mirrored from `thinai/packages/extension/syntaxes/thinai.tmLanguage.json`. Keep it in sync when Thinai's TextMate grammar changes; `npm test` verifies that Shiki loads and highlights it.

When the language repository is checked out as a sibling directory, refresh the mirror with:

```bash
npm run sync:grammar
```

Set `THINAI_REPO` to point at a different checkout location.

Code block token colors come from Shiki themes matched against Thinai's TextMate scopes; the grammar describes token roles without hard-coding colors.

## Local preview

Use Node.js 22.12 or later. Install the locked dependencies and run the lexer tests:

```bash
npm ci
npm test
```

Preview the current branch locally:

```bash
npm run dev
```

Open <http://localhost:4321/>. To verify the production build, run:

```bash
npm run build
npm run preview
```
