---
title: Alpha Notes and Limitations
description: What to expect from the Thinai alpha, how to install it, and which limitations are intentional.
---

Thinai is in alpha. The first release is `0.1.0-alpha.1`. Syntax and
language-service behavior may still change between releases. The examples,
grammar, and validation rules in this documentation describe the current alpha
behavior.

## Installing the alpha

The alpha is distributed from the
[project repository](https://github.com/thinai-lang/thinai). Build it from source
or install a packaged VSIX.

```bash
git clone https://github.com/thinai-lang/thinai.git
cd thinai
npm install
npm run build
npm test
```

To build a VSIX from the workspace:

```bash
cd packages/extension
npx --yes @vscode/vsce package --out /tmp/opencode/vscode-thinai-alpha.vsix
code --install-extension /tmp/opencode/vscode-thinai-alpha.vsix
```

See [Getting started](getting-started.md) for the development-host workflow and
CLI usage.

## Known language limitations

- **Identifiers are ASCII-only**, including backtick-quoted names. Quoted names
  may contain spaces and hyphens, but not non-ASCII letters.
- There is no direct use of another bounded context's value object, data object,
  read model, or enum as a field, parameter, or return type. Use a mirror, shared
  kernel, integration event, or published query contract as appropriate.
- Cross-context contribution quick fixes are intentionally unavailable because
  private cross-context type use is rejected. Same-context contribution quick
  fixes are supported.

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

## Implementation notes

The keyword-completion policy is spread across a few internal modules. This is
maintainability debt, not a user-facing language limitation. A behavior-preserving
consolidation is planned after alpha.

## Reporting issues

Use the
[project issue tracker](https://github.com/thinai-lang/thinai/issues) and include:

- the smallest `.tni` source that reproduces the issue;
- the expected and actual result;
- whether the issue appears in the CLI, the VS Code extension, or both;
- your operating system and Thinai version/commit.

For language-server issues, the Thinai output channel in VS Code often contains
a useful stack trace or diagnostic.
