---
title: Language Model
description: Learn Thinai's strategic DDD concepts, bounded contexts, context maps, and imports.
---

Thinai models strategic DDD concepts and lets you compose a bounded context
across multiple `.tni` files.

Separate sibling declarations and statements with line breaks, both at model
scope and inside brace-delimited bodies. A single declaration or comma-separated
list may wrap across lines, but the next sibling starts on a new line. Commas
are required between enum values, and reserved-word identifiers use backticks.
See [syntax and formatting](syntax-and-formatting.md) for the lexical rules.

## A Small Model

This example declares a subdomain, bounded context, aggregate, application-service command method, and domain event:

```thinai
subdomain OrderManagement kind core

bounded context Ordering realizes OrderManagement

in bounded context Ordering {
  aggregate Order {
    root entity Order {
      method place() {
        emits OrderPlaced
        transition status from Draft to Placed
      }

      identifier id: OrderId
      status: OrderStatus
    }

    value object OrderId {
      raw: string
    }

    enum OrderStatus {
      Draft,
      Placed
    }
  }

  repository OrderRepository {
    manages Order.Order
  }

  event OrderPlaced

  application service OrderApplication {
    method placeOrder(id: OrderId) {
      invokes Order.Order.place
    }
  }
}
```

An aggregate has exactly one root entity. Every entity, including a child
entity, has exactly one `identifier` field typed by a value object declared in
the same aggregate. Child-entity identities are scoped to their aggregate.

## Subdomains and Bounded Contexts

Subdomains can be classified as `core`, `supporting`, or `generic`. A bounded
context can realize one or more subdomains:

```thinai
subdomain Fulfillment kind supporting

bounded context Shipping realizes Fulfillment

in bounded context Shipping {
  // Context members go here.
}
```

Declare a bounded context canonically once, without braces. Put its members in
one or more `in bounded context Name { ... }` blocks. A contribution in another
file must directly import the file containing the canonical declaration.

## Context Maps and Shared Kernels

A context map describes relationships between bounded contexts:

```thinai
bounded context Ordering

bounded context Shipping

bounded context Billing

bounded context CustomerSupport

shared kernel CommonTypes {}

context map FulfillmentMap {
  customer Shipping {
    integrationPatterns: ["AntiCorruptionLayer"]
  } -> supplier Ordering {
    integrationPatterns: ["OpenHostService", "PublishedLanguage"]
  }

  partner Ordering <-> partner Billing

  separateWays Ordering -x- CustomerSupport

  sharedKernel CommonTypes {
    participants: [Ordering, Shipping]
  }
}
```

The customer-to-supplier arrow points from the downstream customer to the
upstream supplier; it describes the relationship direction, not message flow.
Each endpoint may list its own `integrationPatterns`: `Conformist` and
`AntiCorruptionLayer` typically describe the downstream side, while
`OpenHostService` and `PublishedLanguage` describe the upstream side. These are
quoted labels from a predefined set, recorded as descriptive metadata. They do
not assert that an implementation conforms to a pattern or affect event
authorization. Only their spelling and uniqueness are validated; unknown and
duplicate labels are rejected.

`partner ... <-> partner ...` expresses a symmetric partnership. An imported
customer-supplier relationship authorizes the customer to consume the
supplier's IntegrationEvents; an imported partnership authorizes consumption
in either direction. Pattern labels do not affect this authorization.
`separateWays ... -x- ...` expresses a deliberate lack of integration and does
not take integration patterns. A `sharedKernel` relationship names the actual
shared-kernel component and lists the bounded contexts that share it.

A shared kernel is an explicit place for concepts genuinely shared across
contexts. It may contain value objects, enumerations, modules, and domain
services for stable, jointly-owned policies. A shared-kernel domain service may
use shared-kernel types, but must not depend on a bounded context's model.
To invoke one from a bounded context, the shared kernel and a context map that
declares the context as a participant must be visible. When they are in separate
files, import both explicitly. Data objects are not shared-kernel members; use
shared value objects for shared domain concepts.

```thinai
shared kernel Common {
  value object Currency {
    code: string
  }
}
```

A shared-kernel domain service may be invoked from a participating bounded
context when the shared kernel and an authorizing context map are visible.
Application and domain services use the normal `invokes` clause:

```thinai
shared kernel Shared {
  domain service Rates {
    method convert(amount: decimal, rate: decimal) returns decimal {
      behavior "Convert [[amount]] at [[rate]]."
    }
  }
}

bounded context Source

bounded context Consumer

context map LocalMap {
  sharedKernel Shared {
    participants: [Source, Consumer]
  }
}

in bounded context Source {
  application service SourceApp {
    method convert(amount: decimal, rate: decimal) {
      invokes Shared.Rates.convert
    }
  }
}
```

A context map may be imported, or declared in the same document as both
endpoints. Same-document maps authorize event consumption and query reads in the
same way as imported maps. Shared-kernel relationships do not authorize event
consumption or cross-context query reads by themselves.

## Working Across Files

Imports are explicit, direct, and relative to the importing `.tni` file. A
declaration in an unrelated workspace file is not automatically visible. A
later file can contribute to a bounded context by importing the file that
declares it and using an `in bounded context` block:

```thinai
// ordering-events.tni
import "./context-catalog.tni"
import "./ordering.tni"

in bounded context Ordering {
  application service OrderApplication {
    method placeOrder(id: OrderId) {
      invokes Order.Order.place
    }
  }

  event OrderPlaced
}
```

When an imported file declares several bounded contexts, context maps, or shared
kernels, you can select the components needed by the importing file, or use a
bare import to bring in all components. A context map can also be selected and
imported when a cross-context IntegrationEvent is consumed. An alias applies to
the selected component:

```thinai
import { Ordering as Orders, Shipping } from "./contexts.tni"
```

An alias applies to the whole selected component. It must not collide with any
visible path-root spelling, including a context-relative suffix such as `Module`
or `Type`; terminal fields, methods, enum values, and parameters do not
conflict. Strategic declarations (actors, journeys, and subdomains) are imported
with a bare file import rather than a component selection.

Cross-context IntegrationEvent use requires an authorized relationship in an
imported context map, or a context map declared in the same document as both
endpoints; DomainEvents remain private to their context.

## Language Tooling

The language server provides keyword and cross-reference completion, relative
`.tni` import-path completion, navigation, and diagnostics. It also offers
quick fixes for unresolved declarations that can be imported from another
workspace file. The [Order Fulfillment example](https://github.com/thinai-lang/thinai-lang.github.io/blob/main/examples/order-fulfillment/README.md)
demonstrates these features in a complete multi-file model.
