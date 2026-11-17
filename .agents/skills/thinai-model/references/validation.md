# Thinai Validation Checklist

Use this before and after changing a model. The validator is authoritative; the
items below are the rules most likely to affect agent edits.

## Context maps and integration patterns

- Customer/supplier arrows point from the downstream customer to the upstream
  supplier.
- `Conformist` and `AntiCorruptionLayer` belong on the customer endpoint.
- `OpenHostService` and `PublishedLanguage` belong on the supplier endpoint.
- A pattern on the wrong side produces a warning, not a parse error.
- A partnership may use any pattern on either side.
- Separate-ways and shared-kernel relationships do not authorize event
  consumption or query reads.
- Cross-context integration-event handling requires an explicit producer import
  and an authorized map, imported or declared in the same document as both
  endpoints.

## Events

- Domain events are private to their bounded context.
- Only aggregate-root behavior emits domain events.
- An integration event is handled only outside its owning bounded context;
  same-context reactions use the domain event.
- Integration events are emitted by application-service methods reacting to a
  local domain event.
- An event handler has exactly one event-typed parameter and no other
  parameters.
- A projector method handles exactly one domain or integration event.
- A module-nested integration event must be exposed by its module and every
  enclosing module before another context can consume it.
- Event payloads cannot expose entity instances or aggregate-owned types.

## Mirrors

- `mirrors` targets an aggregate-root identifier value object.
- The mirror declares the same fields, types, and optionality as the source.
- The two contexts must be connected by customer-supplier, partnership, or
  shared-kernel relationship in a visible context map.
- For customer-supplier, the mirroring context is the customer.
- A mirror may name a module-private identifier; this is the explicit exception
  to terminal module exposure.

## Modules and visibility

- A module declares `exposes` and `depends on` at most once each.
- An exposed aggregate publishes its root entity and root-entity methods.
- Child entities, nested value objects, and nested enums stay private unless
  exposed.
- A context-level declaration referencing a module declaration requires
  exposure by the owning module and every enclosing module.
- A module-to-module reference requires exposure plus a dependency or
  module-exposure route.
- A direct dependency on a nested module is enough when that nested module
  exposes the declaration.
- Exposing a nested module re-exports its public API; `depends on` does not.
- Module dependencies do not cross bounded-context boundaries.
- A method used as a non-terminal path segment requires method exposure outside
  its own module.

## CQRS reads

- A query repository serves a read model.
- With `reads from`, it reads aggregate-owned write-model tables directly.
- Without `reads from`, it serves a projector-maintained read model.
- A bounded context may use both forms, but one repository does not switch
  forms; prefer separate repositories.
- A query service may read query repositories but not aggregate repositories.
- A projector does not read query repositories and does not call application
  services or change aggregates.
- A projector's `projects` targets must belong to its bounded context.
- Query-service methods return data, not entity instances.
- A published query operation returns primitives or context-level or
  module-exposed data objects.

## Journeys

- Each actor block has at least one command step.
- A query step targets a context-level or module-exposed query service.
- Event handlers, projectors, query repositories, repositories, domain
  services, and factories are not journey step targets.
- Current inputs and earlier command results are visible; later commands are
  not.
- The current command’s result is not visible to its own step.
- A prior command result uses its qualified path.
- Reusing the same command makes result references ambiguous and produces a
  warning; duplicate query reads are allowed.

## Common diagnostics

- `Could not resolve reference` — check imports, module exposure, and path
  spelling.
- `This specification path segment is not visible` — expose the method or
  module path, or use a direct dependency on an exposed nested module.
- `Only an event handler may dispatch to a command` — make the caller an event
  handler or invoke an allowed target.
- `Event-triggered method must have exactly one event-typed parameter` — remove
  extra or non-event parameters.
- `An integration-event payload must not expose types owned by an aggregate` —
  move the type out of the aggregate or use a public contract value.
- `A repository must manage an aggregate-root entity` — point `manages` at the
  root entity.
- `A query must declare a result type` — add `returns ...`.
