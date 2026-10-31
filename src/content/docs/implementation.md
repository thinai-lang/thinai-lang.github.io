---
title: Implementation
description: How Thinai's language tooling is organized.
---

Thinai is implemented in TypeScript. The grammar is the single source of truth
for syntax, and the language services provide parsing, linking, validation, and
language-server behavior.

## What the language services provide

- a lexer and parser generated from the grammar;
- cross-reference linking and scope handling;
- semantic validation;
- language-server features: diagnostics, completion, hover, definitions,
  references, document symbols, formatting, and semantic tokens;
- document lifecycle and workspace indexing.

## Thinai-specific services

Thinai adds the domain rules on top of the base language services:

- scope computation and a scope provider for modules, context maps, and
  cross-context visibility;
- a validator for DDD rules, including aggregate identity, module exposure, and
  read dependencies;
- a formatter;
- completion providers for references, keywords, imports, and paths;
- the `thinai-model-v1` export used by context slices, impact reports, and the
  MCP server.

## Packages

| Package | Role |
| --- | --- |
| `thinai-language` | Grammar and language services |
| `thinai-cli` | Model generation, inspection, validation, and the MCP server |
| `vscode-thinai` | VS Code extension, bundling the language server |

The extension bundles the language server, so installing the extension is enough
for editor support.

## No code generation

Thinai models are not compiled into application code. `thinai-cli generate`
emits a JavaScript summary of the model for inspection; it does not produce an
implementation.

## Why it matters

Integrators can embed the language through the npm package instead of
reimplementing the parser. Editor clients can rely on the language server
protocol. Keeping the grammar as the single definition means syntax
documentation and tooling stay aligned.
