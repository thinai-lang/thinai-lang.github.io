---
title: Modules and Visibility
description: Organize declarations with modules, exposures, dependencies, nested re-exports, and published contracts.
---

Modules organize declarations inside one bounded context or shared kernel. They
do not move a declaration into a different context.

## Visibility scopes

Thinai distinguishes four visibility scopes:

| Scope | Meaning |
| --- | --- |
| **Aggregate/module-local** | Internal to its aggregate or module; not visible outside unless published |
| **Context-visible** | Directly usable anywhere in the same bounded context or shared kernel; no `exposes` needed |
| **Module-exposed** | Published by a module and usable by modules that depend on it |
| **Contract-published** | Explicitly usable across bounded contexts through an integration event, published query result, shared kernel, or identifier mirror |

Context-visible is not the same as contract-published. A context-level value
object is visible throughout its bounded context, but another bounded context
cannot use it as a field, parameter, or return type:

```thinai
bounded context Alpha

in bounded context Alpha {
  value object Money {
    raw: string
  }
}

bounded context Beta

in bounded context Beta {
  data object Price {
    amount: Alpha.Money // rejected
  }
}
```

Use a local identifier mirror, an IntegrationEvent payload, a shared-kernel
type, or a published query result contract instead.

Mirrors apply to identifier value objects. Integration events are published
contracts owned by the producer: reference them directly and map their payload
into local domain concepts when isolation is needed. Do not mirror an
IntegrationEvent.

## Declaring modules

Use `exposes` to publish declarations and `depends on` to declare a module
dependency. A module declares `exposes` once and `depends on` once; both clauses
may appear anywhere in the module body and apply to the whole module.

Exposing a container publishes its behavioral members:

- an aggregate publishes its root entity and the root entity's methods;
- an entity, value object, service, projector, or factory publishes its methods;
- child entities, nested value objects, and nested enums remain private unless
  exposed explicitly;
- fields, parameters, and enum values inherit visibility from their declaration.

Explicit member paths remain valid when precise control is needed.

```thinai
bounded context Shipping

in bounded context Shipping {
  module Operations {
    exposes TrackingCode

    value object TrackingCode {
      raw: string
    }
  }

  module Fulfillment {
    depends on Operations

    value object ShipmentMetadata {
      trackingCode: TrackingCode
    }
  }
}
```

Context-level declarations are context-visible within their bounded context or
shared kernel. A context-level declaration may reference a module declaration
only when the owning module and every enclosing module expose the path.

A declaration in another module requires exposure by its owning module and a
route to that module: a direct dependency, a dependency on an exposing ancestor,
or the source module's own public API. A parent module that exposes a child
module may use the child's public API without a redundant dependency. Sibling
modules require both exposure and `depends on`.

A direct dependency on a nested module is valid even when its parent does not
expose it, provided that nested module exposes the declaration. `depends on` is
not a re-export.

### Visibility at a glance

Within one bounded context or shared kernel:

| Target declaration | From its own module | From another module | From outside all modules |
| --- | --- | --- | --- |
| Context-visible declaration | ✓ | ✓ | ✓ |
| Declaration in a top-level module | ✓ | exposure + `depends on` | exposure |
| Declaration in a nested module | ✓ | exposure by its owning module plus a dependency or exposing-ancestor route | exposure at each level |

From outside all modules, every enclosing module must expose the next segment.
Across bounded contexts, and across different shared kernels, the full
module-exposure chain is always required. Module exposure and context-level
visibility make a declaration available inside the bounded context; they do not
by themselves publish it to another bounded context.

## Nested modules and re-exports

A module may expose another module. Exposing a nested module re-exports that
module's public API through the enclosing module, recursively through each
exposure edge.

```thinai
bounded context ModulesTour

in bounded context ModulesTour {
  module Outer {
    exposes Inner, PublicValue

    module Inner {
      exposes InnerValue

      value object InnerValue {
        raw: string
      }
    }

    value object PublicValue {
      raw: string
    }
  }

  module Consumer {
    depends on Outer

    value object UsesPublic {
      publicValue: PublicValue
      innerValue: Outer.Inner.InnerValue
    }
  }

  data object OutsideUsesNested {
    innerValue: Outer.Inner.InnerValue
  }
}
```

`Consumer` depends only on `Outer`, not on `Outer.Inner`. A client of `Outer`
does not need a separate dependency on every nested module that `Outer` exposes.

A direct dependency on a nested module is also valid when its parent does not
expose it, as long as the nested module exposes the declaration:

```thinai
bounded context PrivateModules

in bounded context PrivateModules {
  module PrivateOuter {
    module PrivateInner {
      exposes InnerValue

      value object InnerValue {
        raw: string
      }
    }
  }

  module DirectConsumer {
    depends on PrivateOuter.PrivateInner

    value object UsesInner {
      innerValue: InnerValue
    }
  }
}
```

`PrivateOuter` does not expose `PrivateInner`, but `DirectConsumer` depends
directly on `PrivateInner`, and `InnerValue` is exposed there.

## Exposed containers and services

Modules may expose any declaration they own that the grammar permits, including
aggregates, entities, value objects, data objects, read models, enums, events,
services, projectors, repositories, factories, methods, and direct child
modules.

Exposing a container publishes its behavioral members, so an aggregate exposes
its root entity and root-entity methods, and a service exposes its methods:

```thinai
bounded context CommandsTour

in bounded context CommandsTour {
  module Domain {
    exposes OrderAggregate

    aggregate OrderAggregate {
      value object OrderId {
        raw: string
      }
      root entity Order {
        identifier id: OrderId
        method place() {}
      }
    }
  }

  module Api {
    depends on Domain
    exposes Handler

    application service Handler {
      method run() {
        invokes Domain.OrderAggregate.Order.place
      }
    }
  }
}
```

Only an event handler may dispatch to a command in another application service.
An ordinary command method coordinates aggregate-root, factory, or domain-service
behavior; it does not call another application service's command.

## Shared-kernel modules

Modules may also live inside a shared kernel. The same exposure and dependency
rules apply within that kernel. A shared-kernel module is not a business bounded
context module, and its declarations remain shared-kernel declarations.

```thinai
shared kernel Common {
  module Contracts {
    exposes CorrelationId

    value object CorrelationId {
      raw: string
    }
  }
}
```

## Published query contracts

Exposing a query service publishes its methods under the normal container
exposure rules. A published query contract exposes only operations whose results
are primitives or context-visible or module-exposed DataObjects. It exposes the
nested DataObject, value-object, and enum shape of each published result,
including enum values.

Operations returning read models, value objects, enums, or module-nested
DataObjects that are not exposed remain local to the context. A context-level
query service is local and journey-visible, but it is not automatically a
cross-context query API. A journey may invoke a context-level query service as a
read step even when the journey spans contexts, because journeys are
model-level timelines. A method-level cross-context query read still requires
the published query contract and an authorized context-map relationship.

```thinai
bounded context Source

in bounded context Source {
  module Api {
    exposes Queries

    query service Queries {
      method lookup() returns string {
        behavior "Return the published value."
      }
    }
  }
}
```

A consumer still needs an authorized context-map relationship, or a context map
declared in the same document as both endpoints, before reading the published
query. Shared-kernel relationships do not authorize query reads.

## Cross-context restrictions

- Module dependencies do not cross bounded-context boundaries. Use an import
  and a context-map relationship for cross-context use.
- A declaration outside a module may reference a module declaration only when
  the module and every enclosing module expose it.
- A module-to-module reference in one context requires exposure by the owning
  module plus a dependency or module-exposure route. A direct dependency on a
  nested module is enough when that module exposes the declaration.
- Another bounded context cannot directly use a value object, data object, read
  model, or enum as a field, parameter, or return type.
- Integration events are published contracts. Reference them directly with an
  authorized relationship; map their payloads into local domain concepts when
  isolation is needed. Do not mirror an integration event.
- Identifier mirrors are the explicit exception for identifiers: the mirror may
  name a module-private identifier and must be backed by a customer-supplier,
  partnership, or shared-kernel relationship.
- Integration-event payloads may use exposed value objects or enums from a
  sibling module when the event's module depends on the payload module and every
  enclosing module exposes the payload type.

For path syntax and reference visibility, see
[references and paths](references-and-paths.md).
