---
title: Getting Started
description: Install the Thinai alpha editor extension, CLI, and language package.
---

Thinai is a domain-specific modeling language for domain-driven design. The
guides on this site introduce the language and its current syntax. Thinai is in
alpha; syntax and language-service behavior may still change between releases.

## Requirements

- Visual Studio Code 1.91 or newer for the editor extension
- Node.js 22 or newer for the CLI and the language package

The editor extension bundles the language server. You do not need a separate
language-server installation to use Thinai in VS Code.

## Install the editor extension

Install the pre-release version from the Visual Studio Marketplace:

```bash
code --install-extension thinai-lang.vscode-thinai --pre-release
```

You can also search for **Thinai** in the Extensions view and select **Install
Pre-Release Version**. The extension provides diagnostics, completion,
navigation, formatting, and import quick fixes for `.tni` files.

Open a folder that contains `.tni` files. The extension activates on `.tni`
files and builds the model from the file and its imports.

## Install the CLI

```bash
npm install -g thinai-cli@alpha
thinai-cli --version
```

You can also run it without a global install:

```bash
npx thinai-cli@alpha --version
```

## Use the CLI

The CLI generates a JavaScript summary, exports the model graph, produces
task-scoped context slices, reports model impact, validates models, and runs a
read-only MCP server.

```bash
# Generate the JavaScript summary
thinai-cli generate path/to/model.tni

# Export the model graph
thinai-cli inspect path/to/model.tni --out model.json

# Get one aggregate or context and its dependencies
thinai-cli context path/to/model.tni Aggregate:Ordering.Order --format md

# Report elements affected by a change
thinai-cli impact path/to/model.tni ValueObject:Ordering.Order.OrderId --json

# Validate the source file and its transitive imports
thinai-cli validate path/to/model.tni

# Start a read-only MCP server
thinai-cli mcp path/to/model.tni
```

Pass `--destination <dir>` to choose the generation output directory.

The CLI validates the source file and its transitive imports. It does not
discover separate files that import the source file. Use the VS Code extension
or another workspace-aware client when you need to validate the complete
import-connected model, including importers.

See [agent workflow](agent-workflow.md) for the model-first workflow and MCP
tools.

## Use the language package

```bash
npm install thinai-language@alpha
```

The package exports the language services used by the CLI and the editor
extension.

## Examples

The [Order Fulfillment example](https://github.com/thinai-lang/thinai-lang.github.io/tree/main/examples/order-fulfillment)
is a complete multi-file model that exercises imports, modules, context maps,
events, and published query contracts. The
[Language Tour](https://github.com/thinai-lang/thinai-lang.github.io/tree/main/examples/language-tour)
is a compact syntax and visibility tour.

## Source and support

The Thinai source repository is private during the alpha. Report bugs and
feature requests in the public
[issue tracker](https://github.com/thinai-lang/issues). See
[alpha notes and limitations](alpha-notes.md) before relying on the extension
for production work.

## Learn the language

Start with the [language model](language-model.md) for strategic DDD concepts,
then read [tactical modeling](tactical-modeling.md) and
[events and behavior](events-and-behavior.md).
