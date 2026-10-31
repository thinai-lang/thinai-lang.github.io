# Thinai documentation site

This repository contains the source for [thinai-lang.dev](https://thinai-lang.dev/). Documentation updates are built with Astro Starlight and deployed from `main` with GitHub Actions when the repository is public.

The Shiki language grammar at `src/grammars/thinai.tmLanguage.json` is mirrored from `thinai/packages/extension/syntaxes/thinai.tmLanguage.json`. Keep it in sync when Thinai's TextMate grammar changes; `npm test` verifies that Shiki loads and highlights it.

The example models at `examples/` are mirrored from `thinai/examples/`. Keep them in sync when the source examples change.

When the language repository is checked out as a sibling directory, refresh the mirrors with:

```bash
npm run sync:grammar
npm run sync:examples
```

Verify both mirrors without writing:

```bash
npm run check:examples
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
