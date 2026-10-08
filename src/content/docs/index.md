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

For a complete multi-file model, see the
[Order Fulfillment example](https://github.com/thinai-lang/thinai/blob/main/examples/order-fulfillment/README.md). The
[language package README](https://github.com/thinai-lang/thinai/blob/main/packages/language/README.md) describes the
implementation package; the [grammar](https://github.com/thinai-lang/thinai/blob/main/packages/language/src/thinai.langium)
defines the syntax precisely.
