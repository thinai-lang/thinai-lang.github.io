# Order Fulfillment Example

This single example folder demonstrates Thinai's language concepts through one
coherent, multi-file Order Fulfillment model. The coverage index below points to
the syntax variants so readers can review the language without switching
examples.

## Files

- `strategic.tni` defines all subdomain kinds and an unclassified subdomain.
- `context-catalog.tni` declares canonical bounded contexts, including zero, one, and multiple subdomain realizations.
- `ordering.tni` demonstrates aggregates, entities, value objects, enums, primitive and nested collection fields, constructors, all specification clauses, escaped specification markers, and grouped guarded transitions.
- `ordering-events.tni` demonstrates nested data objects, services, repositories, factories, read models, projectors with multiple targets, multiple emitted contracts, and multi-actor journeys.
- `shipping.tni` demonstrates a mirrored identifier, an integration-event handler, module exposures, and multiple module dependencies.
- `cross-context-journey.tni` demonstrates a journey that invokes commands from both Ordering and Shipping.
- `context-map.tni` demonstrates every relationship form and every integration-pattern label.
- `common-types.tni` defines shared-kernel values, services, and nested modules, including a nested-module re-export.
- `language-tour/` contains a compact syntax and visibility tour for features that are easier to read outside the main domain model.

The model demonstrates root and child entity identities and transitions, constructors that accept domain values and describe non-state initialization in postconditions (for example, `createdAt`), DataObjects kept at the application-service boundary, a grouped transition across two status fields with one shared descriptive guard, guarded method invocations, conditional emissions, application-service calls to aggregate-root and factory methods, multiple command services per aggregate, query projections reused across aggregates, event-driven projectors, event-to-integration-event translation, incoming integration-event handling, and descriptive cross-context journeys. Where authorization is relevant, application-service behavior specifications describe it as the first step, using a context-local authorization domain service and roles from the shared-kernel enum. It also shows all four behavior-specification kinds, inline links to parameters and event/read-model fields, optional fields/parameters, collections, mirrored identifiers, component-selective imports, context maps, module dependencies, a shared-kernel domain-service invocation, nested-module re-export, backtick-quoted identifiers, triple-quoted specifications, guarded multi-event emissions, guarded read dependencies, and a prior-command result link in a journey.

## Language coverage index

| Language feature | Example location |
| --- | --- |
| All subdomain kinds, an unkinded subdomain, and contexts with zero, one, or multiple realizations | `strategic.tni`, `context-catalog.tni` |
| Simple and component-selective imports, aliases, and qualified references | `ordering.tni`, `context-map.tni`, `ordering-events.tni`, `shipping.tni` |
| Customer-supplier, partnership, separate-ways, and shared-kernel relationships; all integration-pattern labels | `context-map.tni` |
| Shared-kernel value objects, enum, domain services, nested modules, and multiple exposures | `common-types.tni` |
| Nested-module re-export and qualified nested module types | `common-types.tni`, `ordering.tni` |
| Sibling-module exposure and dependency | `shipping.tni`, `../language-tour/modules.tni` |
| Exposed-method invocation across modules | `../language-tour/modules.tni` |
| Local identifier mirror | `shipping.tni` |
| Module-private identifier mirror | `../language-tour/modules.tni` |
| Context-level value-object constructor and method | `../language-tour/syntax.tni` |
| Entity and aggregate-owned value-object constructors and methods, and factory methods | `ordering.tni`, `shipping.tni` |
| Application-, domain-, query-, and projector method kinds | `ordering.tni`, `ordering-events.tni`, `shipping.tni`, `../language-tour/sharing.tni` |
| Authorized cross-context integration-event consumption | `shipping.tni`, `ordering-events.tni` |
| Cross-context journey command invocation | `cross-context-journey.tni` |
| Authorized cross-context query read | `../language-tour/sharing.tni` |
| Shared-kernel domain-service invocation | `ordering.tni` |
| Backtick-quoted identifiers, triple-quoted specifications, and escaped markers | `ordering.tni` |
| Guarded multi-event emissions and guarded `reads from` clauses | `ordering-events.tni` |
| Prior-command result binding in a journey | `cross-context-journey.tni` |
| `string`, `boolean`, `integer`, `decimal`, `date`, `time`, and `instant`; `List`, `Set`, `Map`, and nested collection types | `ordering.tni`, `ordering-events.tni` |
| Nested data objects, optional fields/parameters, identifiers, enum initial states, constructors, and mirrored value objects | `ordering.tni`, `ordering-events.tni`, `shipping.tni` |
| Application/domain/query services, repositories, factories, projectors, read models, events, and exposed integration contracts | `ordering.tni`, `ordering-events.tni`, `shipping.tni` |
| All behavior clauses, multiple emits/projects targets, guarded and grouped transitions, enum-value links | `ordering.tni`, `ordering-events.tni` |
| Single- and double-quoted strings, line/block comments, and escaped `\[[` markers | `strategic.tni`, `common-types.tni`, `ordering.tni`, `context-map.tni` |
| Multiple journey actors/steps with `with` and `when` descriptions | `ordering-events.tni` |
| A journey spanning commands in multiple bounded contexts | `cross-context-journey.tni` |

## Try It

Open this directory as a workspace in the Thinai Extension Development Host. The language server will index all `.tni` files and enable cross-file navigation, completion, validation, and import quick fixes.

From the repository root, validate and generate a summary with:

```bash
node packages/cli/bin/cli.js generate examples/order-fulfillment/shipping.tni -d examples/order-fulfillment/generated
```

The example uses a private `OrderPlaced` domain event and maps it to the separate `OrderPlacedV1` integration contract. Shipping imports both the producer context and context map, and consumes only the IntegrationEvent.
