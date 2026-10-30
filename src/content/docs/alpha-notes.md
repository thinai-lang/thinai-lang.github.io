---
title: Alpha Notes and Limitations
description: What to expect from the Thinai alpha, how to install it, and which limitations are intentional.
---

Thinai is in alpha. The first release is `0.1.0-alpha.1`. Syntax and
language-service behavior may still change between releases. The examples,
grammar, and validation rules in this documentation describe the current alpha
behavior.

## Installing the alpha

Install the pre-release editor extension from the Visual Studio Marketplace:

```bash
code --install-extension thinai-lang.vscode-thinai --pre-release
```

Install the CLI and language package from npm:

```bash
npm install -g thinai-cli@alpha
npm install thinai-language@alpha
```

The Thinai source repository is private during the alpha. See
[Getting started](getting-started.md) for installation details and CLI usage.

## Design rules, not limitations

Thinai intentionally rejects direct use of another bounded context's value
object, data object, read model, or enum as a field, parameter, or return type.
Cross-context collaboration must be explicit: a mirror, shared kernel,
integration event, or published query contract. This enforces bounded-context
autonomy rather than restricting the language; see
[cross-context restrictions](modules-and-visibility.md#cross-context-restrictions).

Cross-context contribution quick fixes are intentionally absent for the same
reason. Same-context contribution quick fixes are supported.

## Known CLI limitations

- The CLI validates the source file and its transitive imports, not files that
  import the source file. Use the language server for the full import-connected
  model.

## Known editor limitations

The current extension focuses on core language support. It provides diagnostics,
completion, definitions, find-all-references, document symbols, hover, formatting,
and code actions. Rename and refactor operations are not yet available.

Same-label completion items can represent different structural path targets.
Their details distinguish them; the list does not collapse them because doing so
could hide a valid target.

## Reporting issues

Use the [public issue tracker](https://github.com/thinai-lang/issues) and include:

- the smallest `.tni` source that reproduces the issue;
- the expected and actual result;
- whether the issue appears in the CLI, the VS Code extension, or both;
- your operating system and Thinai version/commit.

For language-server issues, the Thinai output channel in VS Code often contains
a useful stack trace or diagnostic.
