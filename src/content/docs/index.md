---
title: Thinai Language Docs
description: Guides to Thinai, a domain-specific modeling language for domain-driven design.
---

<p><img src="/assets/thinai-light.svg" alt="Thinai logo" width="80"></p>

Thinai is a domain-specific modeling language for expressing DDD structures,
relationships, and behavioral intent in a shared, navigable model. Use these
guides to learn the language and model a domain by topic:

- [Language model](language-model.md) — subdomains, bounded contexts, context
  maps, shared kernels, imports, and working across files.
- [Tactical modeling](tactical-modeling.md) — aggregates, entities, value
  objects, operations, modules, and domain constraints.
- [Events and behavior](events-and-behavior.md) — application-service methods,
  aggregate events, integration contracts, journeys, and behavior specifications.
- [Syntax and formatting](syntax-and-formatting.md) — line layout, identifiers,
  strings, collections, and the formatter.
- [Modules and visibility](modules-and-visibility.md) — exposures, dependencies,
  nested re-exports, and published query contracts.
- [References and paths](references-and-paths.md) — specification links,
  qualified paths, parameters, results, and journey timelines.
- [Validation rules](validation-rules.md) — the rules behind common diagnostics.
- [Examples](examples.md) — the Order Fulfillment model and the Language Tour.
- [Alpha notes](alpha-notes.md) — installation, known limitations, and issue
  reporting.

For a complete multi-file model, see the
[Order Fulfillment example](https://github.com/thinai-lang/thinai/blob/main/examples/order-fulfillment/README.md). The
[language package README](https://github.com/thinai-lang/thinai/blob/main/packages/language/README.md) describes the
implementation package; the [grammar](https://github.com/thinai-lang/thinai/blob/main/packages/language/src/thinai.langium)
defines the syntax precisely.
