---
title: Alpha Notes and Limitations
description: What to expect from the Thinai alpha, how to install it, and which limitations are intentional.
---

Thinai is in alpha. The current alpha release is `0.1.9-alpha.1`; the VS Code
Marketplace version is `0.1.9` (published as a pre-release). Older alpha releases
are superseded. Syntax and language-service behavior may still change between
releases. The examples, grammar, and validation rules in this documentation
describe the current alpha behavior.

`0.1.7-alpha.7` added path-aware completion for qualified and abbreviated
references, smart selection, `[[...]]` auto-closing, document symbols that
include the bounded-context breadcrumb, and the integration-event ownership
rule for handlers. `0.1.8-alpha.8` added role-aware context-map pattern
warnings and role-filtered completion. `0.1.9-alpha.1` adds first-class
multi-file bounded contexts, root/part import quick fixes, a shared
context-name warning, and a video walkthrough page.

## Installing the alpha

Install the pre-release editor extension from the Visual Studio Marketplace:

```bash
code --install-extension thinai-lang.vscode-thinai --pre-release
```

For editors that use Open VSX, install the same extension from the
[Open VSX listing](https://open-vsx.org/extension/thinai-lang/vscode-thinai).

Install the CLI and language package from npm:

```bash
npm install -g thinai-cli@alpha
npm install thinai-language@alpha
```

The Thinai source repository is private during the alpha. See
[Getting started](/getting-started/) for installation details and CLI usage.

## Design rules, not limitations

Thinai intentionally rejects direct use of another bounded context's value
object, data object, read model, or enum as a field, parameter, or return type.
Cross-context collaboration must be explicit: a mirror, shared kernel,
integration event, or published query contract. This enforces bounded-context
autonomy rather than restricting the language; see
[cross-context restrictions](/modules-and-visibility/#cross-context-restrictions).

Quick fixes that would import a context part directly are intentionally absent;
import the context root instead.

## Known CLI limitations

- The CLI validates the source file and its transitive imports, not files that
  import the source file. For a multi-file bounded context, validate the root;
  validating a part reports an unrooted-part diagnostic. Use the language server
  for the full model unit.

## Known editor limitations

The current extension focuses on core language support. It provides diagnostics,
completion, definitions, find-all-references, document symbols with
bounded-context breadcrumbs, hover, rename, call hierarchy, import links,
automatic import updates on file moves, formatting, and code actions. Rename
supports declarations, references, and import aliases, and validates new names
and collisions.

Type hierarchy, inlay hints, code lens, and signature help are not provided yet.
Thinai has containment and mirrors but no inheritance/subtyping, so a type
hierarchy would currently be misleading. Invocations do not have argument lists
in source, so signature help has no natural trigger.

Same-label completion items can represent different structural path targets.
Their details distinguish them; the list does not collapse them because doing so
could hide a valid target.

Unicode identifiers are checked for NFC normalization, with a warning when a
name is not normalized. Mixed-script/confusable-name detection is not yet
implemented.

## Reporting issues

Use the [public issue tracker](https://github.com/thinai-lang/issues) and include:

- the smallest `.tni` source that reproduces the issue;
- the expected and actual result;
- whether the issue appears in the CLI, the VS Code extension, or both;
- your operating system and Thinai version/commit.

For language-server issues, the Thinai output channel in VS Code often contains
a useful stack trace or diagnostic.
