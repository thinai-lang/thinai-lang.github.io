---
title: Validation Rules
description: A practical checklist of Thinai's structural, visibility, CQRS, event, and journey validation rules.
---

This page summarizes the rules behind Thinai diagnostics. It is a guide to the
most common errors, not a replacement for the grammar or the language server.

## Aggregates and entities

- An aggregate has exactly one root entity.
- Every entity, including a child entity, has exactly one `identifier` field.
- An identifier is a value object declared in the same aggregate.
- Child-entity identity is scoped to its aggregate.
- Aggregate-owned methods cannot invoke domain services.
- Domain services cannot invoke aggregate-owned methods.
- Only aggregate-root behavior may emit DomainEvents.
- Root behavior coordinates changes to child entities.

## Value objects, data objects, and read models

- A value object has no identity and may contain fields, constructors, and
  methods.
- A value object may mirror an identifier value object from another bounded
  context with `mirrors`. The mirror must declare the same fields, types, and
  optionality as the source. A customer-supplier, partnership, or shared-kernel
  relationship must connect the two contexts in an imported context map.
- A data object has fields but no identifier, methods, invariants, or
  transitions.
- Data objects may contain primitives, collections, value objects, enums, and
  nested data objects.
- Data objects are not allowed in entity, value-object, factory, or
  domain-service signatures; use them at application-service and query-service
  boundaries.
- Data objects and read models cannot contain entity instances.
- Read models may compose other read models, but not data objects.
- Read models may be returned by query services or composed into another read
  model only.

## Enums and state

- Commas are required between enum values.
- An enum state field may declare `initial State`.
- A transition must target an enum field declared on the owning entity.
- A transition source must be an enum value of that field's enum.
- Every transition source must be reachable from the initial state when the
  field declares one.
- Unused enum values remain valid.
- A grouped transition may change multiple enum fields under one `when` guard;
  each change is validated against its own field.
- Repeating the exact same transition within one method produces a warning.

## Methods, services, and factories

- Constructors take typed parameters and have no explicit return type.
- Methods may return a primitive, a declared type, or a collection type.
- Application services coordinate use cases and may invoke aggregate-root,
  factory, domain-service, or same-service methods.
- Application services must not invoke value-object methods directly.
- Only an event handler may dispatch to a command in another application
  service.
- Domain services model policies or calculations and may invoke another domain
  service only when the call chain does not reach aggregate-owned behavior.
- A factory creates exactly one aggregate root; every valid factory method
  returns that same root.
- A repository manages an aggregate-root entity.
- An aggregate may declare at most one write repository.

## Events

- Domain events are private to their bounded context.
- Domain events are emitted by aggregate-root behavior.
- Integration events are emitted by application-service methods reacting to a
  local DomainEvent.
- Event handlers have exactly one event-typed parameter and no additional
  parameters.
- Projector methods handle exactly one domain or integration event.
- Domain-event payloads must not expose entity instances, including inside
  collections or nested value-object shapes.
- Integration-event payloads carry stable value data, not entities or
  aggregate-owned types. Validation covers collection element and value types,
  including nested value-object shapes.
- An integration event nested in a module must be exposed before another context
  can consume it.

## CQRS reads

- Query services may read query repositories, which may source aggregate tables,
  but not aggregate repositories directly.
- Query-service methods return primitives, data objects, read models, value
  objects, enums, or collections of those values.
- Application-service methods must not return entities.
- Projectors do not read query repositories and do not call application
  services or change aggregates.
- A query repository serves a read model and may list aggregate table sources
  with `reads from`.
- Query-service and application-service methods may use a descriptive
  `reads from ... when ...` guard.

## Modules and visibility

- `exposes` entries appear before module members.
- A module may expose declarations it owns, including methods and members of
  its own aggregates, plus its direct child modules.
- A context-level declaration may reference a module declaration only when the
  owning module and every enclosing module expose the path.
- A reference from another module requires exposure by the owning module plus a
  dependency or public re-export route. A direct dependency on a nested module
  is enough when that module exposes the declaration.
- A parent module that exposes a child module does not need a redundant
  dependency on the child.
- Exposing a nested module re-exports that module's public API through the
  enclosing module.
- `depends on` is not a re-export.
- Module dependencies do not cross bounded-context boundaries.
- Exposing a query service publishes only primitive or public DataObject results.
- A method used as a non-terminal path segment requires method exposure outside
  its own module.
- An unexposed module-nested declaration cannot be referenced from outside its
  module.

## Context maps and cross-context use

- A context map may declare customer-supplier, partnership, separate-ways, and
  shared-kernel relationships.
- The customer-to-supplier arrow points from downstream customer to upstream
  supplier.
- Integration patterns are quoted descriptive labels; they do not affect
  authorization.
- Separate-ways does not authorize event consumption or queries.
- Shared-kernel relationships do not authorize event consumption or query reads.
- Cross-context IntegrationEvent handling requires an explicit import of the
  producer context and an authorized relationship in an imported context map, or
  in a context map declared in the same document as both endpoints.
- A customer-supplier relationship authorizes customer-to-supplier event
  consumption; a partnership authorizes consumption in either direction.
- Cross-context query reads follow the same context-map authorization model.

## Journeys

- Actors are declared once at model scope.
- A journey is a top-level timeline of non-event application-service commands.
  Any application-service method without an event parameter is treated as a
  command; a method with an event parameter is an event handler.
- Each actor may have at most one `by` block per journey.
- A step names at least a service or context segment before the command.
- Journey order is significant across actor blocks.
- Current inputs and earlier command results are visible; later commands are
  not.
- The current command's result is not visible to its own step.
- `result` is reserved on methods with a result and on application-service
  commands.
- Reusing the same command in one journey makes result references ambiguous and
  produces a warning.
- Journeys do not model background event handoffs, synchronous remote calls, or
  shared transactions.

## Common diagnostic patterns

| Diagnostic | Usual fix |
| --- | --- |
| `Could not resolve reference` | Import the file or component; check module exposure and path spelling |
| `Start the first statement on a new line after the opening brace` | Put the first statement after `{` on its own line |
| `Start each sibling declaration or statement on a new line` | Split the declarations or statements onto separate lines |
| `Reserved word ... must be backtick-quoted` | Add backticks around the reference segment |
| `Duplicate declaration` | Rename the declaration or check the import-connected model |
| `A repository must manage an aggregate-root entity` | Point `manages` at the root entity |
| `A query must declare a result type` | Add `returns ...` to the query method |
| `Event-triggered method must have exactly one event-typed parameter` | Remove extra parameters or the non-event parameter |
| `Conflicting relationships` | Remove or reconcile the incompatible context-map relationships |
| `Only an event handler may dispatch to a command` | Make the caller an event handler or invoke an allowed target |
| `This specification path segment is not visible` | Expose the method or module path, or use a direct dependency on an exposed nested module |
| `Event payloads must not expose entity instances` | Replace entity data with identifiers or stable value data, including inside collections |
| `An integration-event payload must not expose types owned by an aggregate` | Move the type out of the aggregate or use a public contract value |
| `Import component name ... conflicts with a declaration` | Rename the local declaration or alias the imported component |
