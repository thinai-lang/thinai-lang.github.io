---
title: Modules and Visibility
description: Organize declarations with modules, exposures, dependencies, nested re-exports, and published contracts.
---

Modules organize declarations inside one bounded context or shared kernel. They
do not move a declaration into a different context.

## Declaring modules

Use `exposes` to publish declarations and `depends on` to declare a module
dependency. Exposures must appear before the module's members. A module may
expose declarations it owns, including methods and members of its own
aggregates, plus its direct child modules.

```thinai
bounded context Shipping

in bounded context Shipping {
  module Operations {
    exposes TrackingCode

    value object TrackingCode {
      raw: string
    }
  }

  module Fulfillment depends on Operations {
    value object ShipmentMetadata {
      trackingCode: TrackingCode
    }
  }
}
```

Visibility depends on where the source and target live:

- Context-level declarations are public within their bounded context or shared
  kernel.
- A context-level declaration may reference a module declaration only when the
  owning module and every enclosing module expose the path.
- A declaration in another module requires exposure by its owning module and a
  route to that module: a direct dependency, a dependency on an exposing
  ancestor, or the source module's own public API.
- A parent module that exposes a child module may use the child's public API
  without a redundant dependency. Sibling modules require both exposure and
  `depends on`.
- A direct dependency on a nested module is valid even when its parent does not
  expose it, provided that nested module exposes the declaration.
- `depends on` is not a re-export.
- A method used as a non-terminal path segment must be exposed when the source
  is outside its module, just like a terminal method reference.

### Visibility at a glance

Within one bounded context or shared kernel:

| Target declaration | From its own module | From another module | From outside all modules |
| --- | --- | --- | --- |
| Context-level declaration | ✓ | ✓ | ✓ |
| Declaration in a top-level module | ✓ | exposure + `depends on` | exposure |
| Declaration in a nested module | ✓ | exposure by its owning module plus a dependency or exposing-ancestor route | exposure at each level |

From outside all modules, every enclosing module must expose the next segment.
Across bounded contexts, and across different shared kernels, the full public
exposure chain is always required.

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

  module Consumer depends on Outer {
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

  module DirectConsumer depends on PrivateOuter.PrivateInner {
    value object UsesInner {
      innerValue: InnerValue
    }
  }
}
```

`PrivateOuter` does not expose `PrivateInner`, but `DirectConsumer` depends
directly on `PrivateInner`, and `InnerValue` is exposed there.

## Exposed methods and services

Modules may expose any declaration they own that the grammar permits, including
aggregates, entities, value objects, data objects, read models, enums, events,
services, projectors, repositories, factories, methods, and direct child
modules. Exposing a method publishes that operation through the module's API.

```thinai
bounded context CommandsTour

in bounded context CommandsTour {
  module Api {
    exposes Handler.run

    application service Handler {
      method run() {}
    }
  }

  module Consumer depends on Api {
    event Triggered

    application service UsesApi {
      method onTriggered(source: Triggered) {
        invokes Api.Handler.run
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

Exposing a query service publishes only operations whose results are primitives
or public DataObjects. A published query contract exposes the nested DataObject,
value-object, and enum shape of each published result, including enum values.

Operations returning read models, value objects, enums, or module-nested
DataObjects that are not exposed remain local to the context. A context-level
query service is local and journey-visible, but it is not automatically a
cross-context query API.

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
  module plus a dependency or public re-export route. A direct dependency on a
  nested module is enough when that module exposes the declaration.
- A method used as a path segment requires method exposure outside its own
  module.
- Exposing a declaration makes it part of a published contract; it does not make
  the declaration a directly reusable signature type in another bounded context.
- Integration-event payloads may use exposed value objects or enums from a
  sibling module when the event's module depends on the payload module and every
  enclosing module exposes the payload type.

For path syntax and reference visibility, see
[references and paths](references-and-paths.md).
