---
title: Examples
description: Complete Thinai models and where to find their feature coverage indexes.
---

Two example locations complement each other:

- **Order Fulfillment** is a realistic multi-file model with strategic design,
  aggregates, services, events, modules, context maps, and journeys.
- **Language Tour** is a compact syntax and visibility tour for features that
  are easier to read outside the main domain model.

Both examples are validated by the Thinai test suite.

## Order Fulfillment

Repository: [`examples/order-fulfillment`](https://github.com/thinai-lang/thinai-lang.github.io/tree/main/examples/order-fulfillment)

The model spans Ordering, Shipping, Billing, Customer Support, shared-kernel
types, and a context map. It demonstrates subdomains and bounded contexts,
customer-supplier and partnership relationships, shared kernels, modules and
visibility, aggregates and events, event-driven projectors, direct and
projector-backed query repositories, published query contracts, and
cross-context journeys.

For the full feature coverage index and file map, see the
[Order Fulfillment README](https://github.com/thinai-lang/thinai-lang.github.io/blob/main/examples/order-fulfillment/README.md).

## Language Tour

Repository: [`examples/language-tour`](https://github.com/thinai-lang/thinai-lang.github.io/tree/main/examples/language-tour)

The language tour covers syntax, quoted identifiers and strings, optional
markers, collections, nested modules and re-exports, module dependencies,
explicit method exposure, mirrored identifiers, shared kernels, published query
contracts, cross-context query reads, command-led journeys, and a bounded
context split across a root and two parts.

For the full feature coverage index and file map, see the
[Language Tour README](https://github.com/thinai-lang/thinai-lang.github.io/blob/main/examples/language-tour/README.md).

## Running the examples

The examples are mirrored in this repository under `examples/`. Install the CLI
first, then run it against a copied checkout:

```bash
git clone https://github.com/thinai-lang/thinai-lang.github.io.git
cd thinai-lang.github.io
npx thinai-cli@alpha validate examples/order-fulfillment/shipping.tni
npx thinai-cli@alpha validate examples/language-tour/sharing.tni
npx thinai-cli@alpha validate examples/language-tour/multi-file/program.tni
npx thinai-cli@alpha inspect examples/order-fulfillment/shipping.tni --out model.json
```

Open either directory in VS Code with the Thinai extension to exercise
completion, navigation, references, rename, call hierarchy, diagnostics, quick
fixes, import links, and formatting.

## See also

- [Syntax and formatting](/syntax-and-formatting/)
- [Modules and visibility](/modules-and-visibility/)
- [References and paths](/references-and-paths/)
- [Validation rules](/validation-rules/)
