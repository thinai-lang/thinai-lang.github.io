---
title: Examples
description: Complete Thinai models and a feature coverage index.
---

Two example locations complement each other:

- **Order Fulfillment** is a realistic multi-file model with strategic design,
  aggregates, services, events, modules, context maps, and journeys.
- **Language Tour** is a compact syntax and visibility tour for features that
  are easier to read outside the main domain model.

Both examples are validated by the repository test suite.

## Order Fulfillment

Repository: [`examples/order-fulfillment`](https://github.com/thinai-lang/thinai/tree/main/examples/order-fulfillment)

The model spans Ordering, Shipping, Billing, Customer Support, shared-kernel
types, and a context map. It demonstrates:

| Feature | File |
| --- | --- |
| All subdomain kinds, an unclassified subdomain, and zero/one/multiple context realizations | `strategic.tni`, `context-catalog.tni` |
| Bare and selective imports, aliases, and qualified references | several files |
| Customer-supplier, partnership, separate-ways, and shared-kernel relationships; all integration patterns | `context-map.tni` |
| Shared-kernel values, enum, domain service, nested modules, and nested-module re-export | `common-types.tni` |
| Primitive and nested collection types | `ordering.tni`, `ordering-events.tni` |
| Backtick-quoted identifiers, triple-quoted specifications, and escaped markers | `ordering.tni` |
| Shared-kernel domain-service invocation | `ordering.tni` |
| Guarded multi-event emissions and guarded `reads from` | `ordering-events.tni` |
| Nested data objects, optional fields/parameters, identifiers, initial enum states, constructors, and mirrors | several files |
| Application/domain/query services, repositories, factories, projectors, read models, events, and exposed integration contracts | several files |
| Entity and aggregate-owned value-object constructors/methods, factory methods, and application/domain/query/projector method kinds | `ordering.tni`, `ordering-events.tni`, `shipping.tni` |
| Module exposure, dependency, nested re-export, and local identifier mirroring | `shipping.tni`, `common-types.tni` |
| Authorized cross-context integration-event consumption | `shipping.tni`, `ordering-events.tni` |
| Multiple actor blocks, `with`/`when` journey prose, and a prior-command result link | `ordering-events.tni`, `cross-context-journey.tni` |
| Cross-context journey command invocation | `cross-context-journey.tni` |

Start with the
[Order Fulfillment README](https://github.com/thinai-lang/thinai/blob/main/examples/order-fulfillment/README.md).

## Language Tour

Repository: [`examples/language-tour`](https://github.com/thinai-lang/thinai/tree/main/examples/language-tour)

| Feature | File |
| --- | --- |
| Backtick-quoted reserved identifiers and references | `syntax.tni` |
| Triple-quoted specifications and escaped `\[[` markers | `syntax.tni` |
| Line and block comments | `syntax.tni` |
| Optional fields and optional method parameters | `syntax.tni` |
| Primitive, value-object, and nested `List`/`Set`/`Map` types | `syntax.tni` |
| Context-level value-object constructor and method | `syntax.tni` |
| Nested modules and nested-module re-exports | `modules.tni` |
| Module dependencies and qualified exposure paths | `modules.tni` |
| Exposed methods and event-triggered cross-service dispatch | `modules.tni` |
| Local identifier mirror of a module-private identifier | `modules.tni` |
| Shared-kernel value objects and domain services | `sharing.tni` |
| Same-document context map and shared-kernel relationship | `sharing.tni` |
| Module-exposed query service and authorized cross-context query read | `sharing.tni` |

### Method and constructor coverage

| Method or constructor | Location |
| --- | --- |
| Entity constructor | `../order-fulfillment/ordering.tni` |
| Context-level value-object constructor | `syntax.tni` |
| Aggregate-owned value-object constructor | `../order-fulfillment/ordering.tni` |
| Entity method | `../order-fulfillment/ordering.tni` |
| Aggregate-owned value-object method | `../order-fulfillment/ordering.tni` |
| Context-level value-object method | `syntax.tni` |
| Factory method | `../order-fulfillment/ordering.tni`, `../order-fulfillment/shipping.tni` |
| Domain-service method | `sharing.tni`, `../order-fulfillment/shipping.tni` |
| Application-service method | `syntax.tni`, `modules.tni`, `sharing.tni` |
| Query-service method | `sharing.tni`, `../order-fulfillment/ordering-events.tni` |
| Projector method | `../order-fulfillment/ordering-events.tni` |

### Visibility coverage

| Visibility route | Location |
| --- | --- |
| Context-level and same-module access | `syntax.tni`, `modules.tni` |
| Sibling-module exposure and `depends on` | `modules.tni`, `../order-fulfillment/shipping.tni` |
| Nested-module re-export through an exposed parent | `modules.tni`, `../order-fulfillment/common-types.tni` |
| Module-private identifier `mirrors` | `modules.tni` |
| Shared-kernel type and service with a `sharedKernel` relationship | `sharing.tni` |
| Authorized cross-context query result | `sharing.tni` |
| Authorized cross-context IntegrationEvent | `../order-fulfillment/shipping.tni`, `../order-fulfillment/ordering-events.tni` |
| Cross-context journey command invocation | `../order-fulfillment/cross-context-journey.tni` |

## Running the examples

From the repository root:

```bash
node packages/cli/bin/cli.js generate examples/order-fulfillment/shipping.tni
node packages/cli/bin/cli.js generate examples/language-tour/sharing.tni
```

Open either directory in VS Code with the Thinai extension to exercise
completion, navigation, diagnostics, quick fixes, and formatting.

## See also

- [Syntax and formatting](syntax-and-formatting.md)
- [Modules and visibility](modules-and-visibility.md)
- [References and paths](references-and-paths.md)
- [Validation rules](validation-rules.md)
