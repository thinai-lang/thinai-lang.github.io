# Order Fulfillment Example

This single example folder demonstrates Thinai's language concepts through one
coherent, multi-file Order Fulfillment model. The coverage index below points to
the syntax variants so readers can review the language without switching
examples.

## Files

- `strategic.tni` defines all subdomain kinds and an unclassified subdomain.
- `context-catalog.tni` declares canonical bounded contexts, including zero, one, and multiple subdomain realizations.
- `ordering.tni` demonstrates aggregates, entities, value objects, enums, primitive and nested collection fields, constructors, all specification clauses including method-level invariants, escaped specification markers, grouped guarded transitions, rich domain-event payloads, and a local inventory aggregate.
- `ordering-events.tni` demonstrates nested data objects, services, repositories, factories, read models, projectors with multiple targets, multiple emitted contracts, same-context domain-event handling, domain-to-integration translation, composed read models, query-service composition, and multi-actor journeys.
- `shipping.tni` demonstrates a mirrored identifier, an integration-event handler, a pending-versus-dispatched shipment split, a published query contract, module exposures, and multiple module dependencies.
- `cross-context-journey.tni` demonstrates a command-led journey that invokes queries and commands from both Ordering and Shipping.
- `context-map.tni` demonstrates every relationship form and every integration-pattern label.
- `common-types.tni` defines shared-kernel values, services, and nested modules, including a nested-module re-export.
- `language-tour/` contains a compact syntax, visibility, and published-query tour for features that are easier to read outside the main domain model.

The model demonstrates root and child entity identities and transitions, constructors that accept domain values and describe non-state initialization in postconditions (for example, `createdAt`), DataObjects kept at the application-service boundary, a grouped transition across two status fields with one shared descriptive guard, guarded method invocations, conditional emissions, application-service calls to aggregate-root and factory methods, multiple command services per aggregate, query projections reused across aggregates, event-driven projectors, same-context domain-event handling for aggregate integration, event-to-integration-event translation, incoming integration-event handling, composed read models, query-service composition, and descriptive cross-context journeys with optional query reads. Where authorization is relevant, application-service behavior specifications describe it as the first step, using a context-local authorization domain service and roles from the shared-kernel enum. It also shows all four behavior-specification kinds, method-level invariants, inline links to parameters and event/read-model fields, optional fields and collections, `Map` value-shape paths, mirrored identifiers, component-selective imports, context maps, module dependencies, shared-kernel domain-service invocation, module-nested domain-service invocation, explicit method exposure, direct dependencies on unexposed nested modules, nested-module re-export, backtick-quoted identifiers, triple-quoted specifications, guarded multi-event emissions, guarded read dependencies, and prior command/query result links in a journey.

## Event-driven reactions

The example keeps event handoffs outside actor journeys and models them as
application-service handlers:

1. `Order.Order.place` emits the private `OrderPlaced` domain event.
2. `InventoryReservation.onOrderPlaced` handles `OrderPlaced` inside Ordering and
   invokes `Inventory.StockItem.reserve`. This is same-context aggregate
   integration.
3. `OrderApplication.publishOrderPlaced` handles the same domain event and emits
   `Contracts.OrderPlacedV1` and `Contracts.OrderPlacedAuditV1`. This is
   domain-to-integration-event translation.
4. `ShipmentApplication.onOrderPlaced` handles
   `Ordering.Contracts.OrderPlacedV1` in Shipping and invokes `createShipment`,
   which creates a pending `Shipment` aggregate. This is cross-context aggregate
   integration.
5. `ShipmentApplication.dispatchShipment` is the actor-initiated fulfillment
   step used by the Warehouse journey.

The Shipping `ShipmentProjector` also demonstrates a projector with methods for
both event kinds: `onOrderPlaced` handles the integration event
`OrderPlacedV1`, while `onShipmentStarted` handles the domain event
`ShipmentStarted`.

## Query repository paths

The example keeps the two query-side paths separate:

- `OrderLookupRepository` serves `OrderLookup` and declares
  `reads from Order, Customer`. It reads the write-model tables directly.
- `OrderSummaryRepository`, `CustomerSummaryRepository`, and
  `OrderAuditSummaryRepository` serve projector-maintained read models and
  declare no `reads from`.
- In Shipping, `ShipmentSummaryRepository` reads directly from `Shipment`,
  while `ShipmentRequestRepository` and `ShipmentTrackingRepository` serve
  projector-maintained views.
- `OrderQueries` and `ShipmentQueries` use both repository kinds.

A repository may intentionally mix both paths, but the example keeps them
separate so the tradeoff is explicit.

## Journey query steps

Journeys remain command-led. Each actor block must contain at least one command
step. Query steps are optional read steps that document what an actor looks up
before or after acting. Query steps use the same `with` and `when` prose as
commands, and query results remain public contract links rather than private
timeline bindings.

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
| Same-context domain-event handler integrating another local aggregate | `ordering-events.tni` |
| Domain-to-integration-event translation with a rich payload | `ordering-events.tni` |
| Cross-context integration-event handler creating a local aggregate | `shipping.tni` |
| Rich domain/integration event payloads with value objects, enums, and collections | `ordering.tni`, `ordering-events.tni` |
| Published query DataObject with nested DataObject and enum shape | `shipping.tni`, `../language-tour/sharing.tni` |
| Authorized cross-context query read | `../language-tour/sharing.tni` |
| Composed read models and nested read-model paths | `ordering-events.tni` |
| Direct aggregate-backed query repository with `reads from` | `ordering-events.tni`, `shipping.tni` |
| Projector-backed query repository without `reads from` | `ordering-events.tni`, `shipping.tni` |
| Query service using both direct and projector-backed repositories | `ordering-events.tni`, `shipping.tni` |
| Projector with methods for both domain and integration events | `shipping.tni` |
| Query-service composition and primitive/DataObject/read-model/value-object/enum/collection results | `ordering-events.tni` |
| Command-led journeys with optional query steps | `ordering-events.tni`, `cross-context-journey.tni`, `../language-tour/sharing.tni` |
| Prior command and query result links in a journey | `ordering-events.tni`, `cross-context-journey.tni` |
| Cross-context journey with query and command steps | `cross-context-journey.tni` |
| Explicit method exposure and direct dependency on an unexposed nested module | `../language-tour/modules.tni` |
| Module-nested domain-service exposure and invocation | `../language-tour/modules.tni` |
| Shared-kernel domain-service invocation | `ordering.tni` |
| Backtick-quoted identifiers, triple-quoted specifications, and escaped markers | `ordering.tni` |
| Guarded multi-event emissions and guarded `reads from` clauses | `ordering-events.tni` |
| `string`, `boolean`, `integer`, `decimal`, `date`, `time`, and `instant`; `List`, `Set`, `Map`, and nested collection types | `ordering.tni`, `ordering-events.tni` |
| Nested data objects, optional fields/parameters/collections, identifiers, enum initial states, constructors, and mirrored value objects | `ordering.tni`, `ordering-events.tni`, `shipping.tni` |
| Application/domain/query services, repositories, factories, projectors, read models, events, and exposed integration contracts | `ordering.tni`, `ordering-events.tni`, `shipping.tni` |
| All behavior clauses including method-level `invariant`, multiple emits/projects targets, guarded and grouped transitions, enum-value links | `ordering.tni`, `ordering-events.tni` |
| `Map` value-shape specification paths | `ordering-events.tni` |
| Single- and double-quoted strings, line/block comments, and escaped `\[[` markers | `strategic.tni`, `common-types.tni`, `ordering.tni`, `context-map.tni` |
| Multiple journey actors/steps with `with` and `when` descriptions | `ordering-events.tni`, `cross-context-journey.tni` |

## Try It

Open this directory in VS Code with the Thinai extension installed. The language server will index all `.tni` files and enable cross-file navigation, completion, validation, and import quick fixes.

From the repository root, validate the model or inspect its graph with:

```bash
npx thinai-cli@alpha validate examples/order-fulfillment/shipping.tni
npx thinai-cli@alpha inspect examples/order-fulfillment/shipping.tni --out model.json
```

The example uses a private `OrderPlaced` domain event and maps it to the separate `OrderPlacedV1` integration contract. Shipping imports both the producer context and context map, consumes only the IntegrationEvent, and creates a pending shipment that the Warehouse journey dispatches. The same example also demonstrates a published query contract, direct and projector-backed query repositories, a projector with both domain- and integration-event methods, and command-led journeys with query read steps.
