# Language Tour

These files are a compact syntax tour that complements the realistic
[Order Fulfillment](../order-fulfillment/README.md) model. Every file is valid
Thinai source and is validated by the repository test suite.

## Files

- `syntax.tni` demonstrates quoted reserved-word identifiers, single and
  multiline specification text, escaped specification markers, comments,
  optional fields and parameters, primitive and nested collection types,
  qualified value-object references, and a context-level value-object
  constructor and method.
- `modules.tni` demonstrates nested modules, module re-exports, dependencies,
  qualified exposure paths, exposed methods, an event-triggered command
  dispatched to an exposed method in another application service, and a local
  identifier mirror that names a module-private identifier.
- `sharing.tni` demonstrates a shared kernel with a domain service, a
  same-document context map, a shared-kernel service invocation, a
  module-exposed query service, and an authorized cross-context query read.

## Feature coverage

| Feature | Location |
| --- | --- |
| Backtick-quoted reserved identifiers and references | `syntax.tni` |
| Triple-quoted specification text and escaped `\[[` markers | `syntax.tni` |
| Line comments and block comments | `syntax.tni` |
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

## Method and constructor coverage

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

## Visibility coverage

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

The main Order Fulfillment example remains the reference for a realistic
multi-file model. Use this tour when you want to see an individual syntax or
visibility feature without following the full domain model.

## Try It

Open this directory in VS Code with the Thinai extension installed, or validate
any file from the repository root:

```bash
npx thinai-cli@alpha validate examples/language-tour/sharing.tni
npx thinai-cli@alpha inspect examples/language-tour/sharing.tni --out model.json
```
