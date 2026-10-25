---
title: Getting Started
description: Build and run the Thinai alpha from the project repository.
---

Thinai is a domain-specific modeling language for domain-driven design. The
guides on this site introduce the language and its current syntax. Thinai is in
alpha; syntax and language-service behavior may still change between releases.

## Requirements

- Node.js 22 or newer
- npm 10.2.3 or newer
- Visual Studio Code 1.91 or newer for the editor extension

## Build from source

The alpha is distributed from the
[project repository](https://github.com/thinai-lang/thinai). Clone it, install
the workspace dependencies, and generate the parser and language metadata:

```bash
git clone https://github.com/thinai-lang/thinai.git
cd thinai
npm install
npm run build
```

`npm run build` runs Langium generation and compiles the language, CLI, and
extension packages. Run the test suite with:

```bash
npm test
```

## Use the editor extension

Open the repository in Visual Studio Code, build the workspace, then run the
**Run Extension** launch configuration (F5). This starts an Extension
Development Host with Thinai support for `.tni` files, including diagnostics,
completion, navigation, formatting, and import quick fixes.

For iterative work, `npm run watch` rebuilds the language and extension while
the development host is running.

To install a packaged alpha VSIX:

```bash
cd packages/extension
npx --yes @vscode/vsce package --out /tmp/opencode/vscode-thinai-alpha.vsix
code --install-extension /tmp/opencode/vscode-thinai-alpha.vsix
```

See [alpha notes and limitations](alpha-notes.md) before relying on the
extension for production work.

## Use the CLI

The CLI currently generates a JavaScript summary from a model and its imported
files:

```bash
node packages/cli/bin/cli.js generate path/to/model.tni
```

Pass `--destination <dir>` to choose the output directory.

## Learn the language

Start with the [language model](language-model.md) for strategic DDD concepts,
then read [tactical modeling](tactical-modeling.md) and
[events and behavior](events-and-behavior.md). The
[Order Fulfillment example](https://github.com/thinai-lang/thinai/blob/main/examples/order-fulfillment/README.md)
is a complete multi-file model that exercises imports, modules, context maps,
events, and published query contracts.
