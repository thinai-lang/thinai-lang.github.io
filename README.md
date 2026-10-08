# Thinai documentation site

This repository contains the source for [thinai-lang.github.io](https://thinai-lang.github.io/). Documentation updates are published automatically from `main` with GitHub Actions and MkDocs Material.

## Local preview

Install [uv](https://docs.astral.sh/uv/), then sync the locked documentation dependencies:

```bash
uv sync --group docs
```

Run the lexer tests and preview the current branch locally:

```bash
uv run --locked --group docs python -m unittest discover -s tests -v
uv run --locked --group docs mkdocs serve
```

Open <http://127.0.0.1:8000/>. To verify the production build, run:

```bash
uv run --locked --group docs mkdocs build --strict
```
