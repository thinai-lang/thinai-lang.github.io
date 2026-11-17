# Authoring Thinai Models

This is the condensed authoring reference for agents. The grammar and validators
are authoritative. Use `references/examples/` for complete models and validate
every edit with `thinai-cli validate` or MCP `validate_model`.

## Line layout

- Use braces for blocks and no semicolon terminators.
- Put every sibling declaration and statement on its own line.
- In a non-empty block, put the first statement on the line after `{`.
- Empty blocks may use `{}`.
- A comma-separated list may wrap, but the next sibling starts on a new line.
- Enum values are comma-separated; inline enums are valid, but the formatter
  expands them.

## Strategic model

- `subdomain Name kind core|supporting|generic`. A subdomain may omit `kind`
  while unclassified.
- `bounded context Name realizes Subdomain, ...`. Declare the canonical context
  once without braces; put members in `in bounded context Name { ... }` blocks.
- A contribution in another file must directly import the file that declares the
  bounded context.
- A context may realize zero, one, or several subdomains.
- `shared kernel Name { ... }` contains value objects, enums, modules, and
  domain services. It does not contain data objects or entities.
- Context maps declare relationships:
  - `customer Downstream -> supplier Upstream`
  - `partner A <-> partner B`
  - `separateWays A -x- B`
  - `sharedKernel Kernel { participants: [A, B] }`
- Integration patterns are descriptive:
  - customer side: `Conformist`, `AntiCorruptionLayer`
  - supplier side: `OpenHostService`, `PublishedLanguage`
  - partnership: any pattern on either side
  - wrong-side patterns parse but produce a warning; put them on the correct
    endpoint.
- Separate-ways and shared-kernel relationships do not authorize event
  consumption or query reads.

## Tactical model

- An aggregate contains exactly one root entity declared directly inside it.
- Every entity, including child entities, has exactly one `identifier` field.
- An identifier is a value object declared in the same aggregate.
- An aggregate may contain entities, value objects, enums, and invariants.
- Reference another aggregate by its identifier, not by an entity instance.
- A value object may mirror an aggregate-root identifier from another context:
  `value object LocalId mirrors Other.Aggregate.Id { ... }`.
  The mirror must match fields, types, and optionality, and the contexts must be
  connected by customer-supplier, partnership, or shared-kernel relationship.
- A data object is an identity-free boundary shape. Use it for application- and
  query-service inputs/results. It may contain primitives, collections, value
  objects, enums, and nested data objects, but not entities or read models.
- A read model is a query-result shape. It may compose other read models, but
  not data objects, and cannot hold entity instances.
- Enums are state lists. An entity enum field may declare `initial State`.
  Transitions target enum fields declared on the owning entity and must start
  from a reachable state when the field has an initial state.
- A method may group several `field from State to State` changes under one
  descriptive `when` guard. Do not duplicate the exact same transition within
  one method.
- Constructors take typed parameters and have no explicit return type.

## Services, events, and CQRS

- Domain events are private to their bounded context and are emitted by
  aggregate-root behavior.
- An integration event is a public cross-context contract. It is emitted by an
  application-service method reacting to a local domain event.
- An integration event is handled only outside its owning bounded context.
  Same-context reactions use the domain event.
- An event handler has exactly one event-typed parameter and no other
  parameters.
- A projector method handles exactly one domain or integration event and
  declares one or more `projects` targets. A projector in a consumer context may
  handle an authorized integration event; a projector in the owning context uses
  the domain event.
- A repository `manages` an aggregate-root entity. An aggregate has at most one
  write repository.
- Query repositories have two forms:
  - with `reads from`: reads aggregate-owned write-model tables directly;
  - without `reads from`: serves a read model maintained by a projector.
  A bounded context may use both forms, but prefer separate repositories. A
  single repository does not switch forms per operation.
- A query service reads query repositories, not aggregate repositories, and
  returns data, not entities.
- A published cross-context query operation returns primitives or context-level
  or module-exposed data objects. Read models, value objects, enums, and
  unexposed nested data objects remain local.
- Application services coordinate use cases. They may invoke aggregate-root,
  factory, domain-service, or same-service methods. They must not invoke
  value-object methods directly.
- Only an event handler may dispatch to a command in another application
  service.
- Domain services model policies or calculations. They must not invoke
  aggregate-owned methods, directly or transitively.

## Modules and visibility

- `module Name { ... }` organizes declarations in one bounded context or shared
  kernel. Module dependencies never cross a bounded-context boundary.
- A module declares `exposes` at most once and `depends on` at most once. Both
  clauses may appear anywhere in the body and apply to the whole module.
- Exposing a container publishes its behavioral members: an aggregate exposes
  its root entity and root-entity methods; a service, entity, value object,
  projector, or factory exposes its methods.
- Child entities, nested value objects, and nested enums remain private unless
  explicitly exposed.
- Context-level declarations are visible throughout their context or shared
  kernel. The reverse requires exposure by the owning module and every enclosing
  module.
- A reference from another module requires exposure by the owning module plus a
  direct dependency or module-exposure route. A direct dependency on a nested
  module is valid when that module exposes the declaration; the parent does not
  have to expose it.
- Exposing a nested module re-exports its public API. `depends on` is not a
  re-export.

## Journeys

- Declare actors once at model scope.
- A journey is a command-led timeline: `journey Name { by Actor { ... } }`.
- Each actor block has at least one command step. A read-only use case belongs
  in a query service.
- A step uses `invoke Qualifier.Service.method`; journeys use `invoke`, not
  `invokes`.
- Query steps target a context-level or module-exposed query service.
- Step order is significant across actor blocks. Current inputs and earlier
  command results are visible; later commands are not.
- A prior command result is referenced through its qualified path:
  `[[Ordering.OrderApplication.placeOrder.result.orderId]]`.
- `result` is reserved on methods with a result and on application-service
  commands.
- Reusing the same command in one journey produces a warning because result
  references become ambiguous. Duplicate query reads are allowed.
- Journeys do not model background event handoffs, synchronous remote calls, or
  shared transactions.

## Validation loop

1. Run `thinai-cli validate path/to/model.tni` or MCP `validate_model`.
2. Treat warnings as guidance:
   - wrong-side integration patterns;
   - exposed commands publishing private contract types;
   - duplicate transitions;
   - reused journey commands.
3. Re-read the declaration with MCP `get_source` or a context slice when a
   reference does not resolve.
4. Re-run validation after every structural change.
5. Check that every touched aggregate, event, contract, and exposed operation
   has a code counterpart.

## Examples

- `examples/strategic.tni` — contexts and role-aware context-map patterns.
- `examples/tactical.tni` — aggregate, events, projector, and query repository.
- `examples/integration/` — producer and consumer across a bounded-context
  boundary.
