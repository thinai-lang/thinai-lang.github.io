---
title: Tactical Modeling
description: Model aggregates, entities, value objects, operations, and modules in Thinai.
---

Thinai models aggregates, entities, value objects, and related tactical DDD
declarations. For application services, events, and descriptive domain behavior, see
[Events and behavior](events-and-behavior.md).

## Aggregates, Entities, and Value Objects

An aggregate groups its root entity and other domain types. Entities and value
objects may have typed fields, invariants, constructors, and methods. Common
field types are `string`, `number`, `boolean`, and `date`; fields can be
optional with `?`. Built-in collections are `List<T>`, `Set<T>`, and
`Map<K, V>`.
Every entity has exactly one identifier field. A child entity's identity is
scoped to its aggregate; references to an entity in another aggregate must use
that aggregate's identifier rather than the entity itself.

```thinai
bounded context Ordering

in bounded context Ordering {
  aggregate Order {
    root entity Order {
      method update()

      identifier id: OrderId
      status: OrderStatus
      lines: List<OrderLine>
      customerMemo?: string
    }

    value object OrderId {
      raw: string
    }

    entity OrderLine {
      method ship() {
        transition status from Open to Shipped
      }

      identifier id: OrderLineId
      sku: string
      quantity: number
      status: LineStatus initial Open
    }

    value object OrderLineId {
      raw: string
    }

    enum OrderStatus {
      Draft,
      Placed,
      Paid
    }

    enum LineStatus {
      Open,
      Shipped
    }
  }
}
```

Identifier value objects can mirror identifiers owned by another context.
Define a local mirror rather than making a foreign context's private type part
of the local model:

```thinai
import "./context-catalog.tni"
import "./ordering.tni"

bounded context Shipping

in bounded context Shipping {
  value object OrderId mirrors Ordering.Order.OrderId {
    raw: string
  }
}
```

## Operations and Domain Constraints

Entity and value-object bodies contain fields, constructors, and methods at the
same level; write constructors and methods before fields. Invariants may appear
in constructor and method bodies, but not beside fields. Constructors take typed
parameters and return their owning type implicitly. Methods may declare a return
type with `returns`:

Constructor parameters should be domain values such as primitives, enums, and
value objects. Keep DataObjects and events at operation-handler boundaries, and
refer to entities in another aggregate by their identifiers rather than passing
the entity instances.

```thinai
bounded context Ordering

in bounded context Ordering {
  aggregate Order {
    root entity Order {
      constructor(id: OrderId) {
        precondition "The identifier is non-empty."
        postcondition "The order has an identifier."
      }

      method ensureOwner() returns boolean {
        invariant "An order has an owner; check [[Order.owner]]."
      }

      identifier id: OrderId
      owner: string
    }

    value object OrderId {
      raw: string
    }
  }

  factory OrderFactory {
    method createOrder() returns Order.Order
  }
}
```

Factory operations are methods that return the root entity of the aggregate
named by `for`. Behavior specifications can link to these methods, just as they
can link to other methods; constructors themselves are not link targets.

Aggregate behavior belongs on the root entity, which protects aggregate
invariants. Domain services are bounded-context or module peers of aggregates,
not aggregate members. In Thinai, domain services express domain policies or
calculations and do not invoke aggregate-owned methods; aggregate-owned methods
do not invoke domain services. Application services coordinate both directly,
so aggregate behavior remains explicit in the use-case invocation paths. A
domain service may invoke another domain service only when the call chain does
not reach aggregate-owned behavior. Behavior specifications are explained in
[Events and behavior](events-and-behavior.md).

Root and child entities can both own state and declare transitions, but each
transition must target an enum field declared on that entity. Application
services enter through the aggregate root; root behavior coordinates changes to
child entities so the aggregate's invariants remain protected. An enum state
field may declare an initial value with `initial State`; when present, every enum
state must be reachable through the entity's declared transition graph. A
transition statement may group changes to multiple enum fields on the same
entity, with one descriptive `when` guard applying to the whole group:

```thinai
bounded context Ordering

in bounded context Ordering {
  aggregate Order {
    root entity Order {
      method confirmPayment() {
        transition status from Draft to Placed,
                   paymentStatus from Pending to Confirmed
          when "The payment has been accepted."
      }

      identifier id: OrderId
      status: OrderStatus
      paymentStatus: PaymentStatus
    }

    value object OrderId {
      raw: string
    }

    enum OrderStatus {
      Draft,
      Placed
    }

    enum PaymentStatus {
      Pending,
      Confirmed
    }
  }
}
```

Each change is validated against its field's enum. Grouping conveys coordinated
intent, not runtime atomicity. Guards are descriptive and do not affect the
state-graph reachability check. Identical transitions are allowed in different
methods; repeating one within a method produces a warning.

Repositories and factories are declared beside their target aggregate at
bounded-context or module scope. Application services orchestrate use cases and
may coordinate multiple aggregates; query services provide read-only operations.
Application-service methods may link to aggregate-root or factory methods with
`invokes`, and may also link to domain-service methods for policies or
calculations. When both are needed, the application service links to the domain
service and aggregate root separately; the domain service does not call the
aggregate. Thinai describes those domain relationships without prescribing
loads, saves, deletes, or transaction mechanics. An aggregate may declare at most
one write repository; the declaration is optional.
Use identity-free data objects for operation input/output shapes. They can contain
primitives, collections, enums, value objects, and nested data objects, but not
entities or read models; they have no identifiers or behavior. Prefer value
objects for shapes that represent domain concepts.

Read models and query repositories are optional. A read model describes a query
result shape; it need not be materialized or backed by a separate database.
Projectors are optional event-driven projections. A query service may read through
query repositories or aggregate repositories, including from the same relational
tables as the write side. Query-service methods can return primitives, data
objects, read models, or collections of these; application-service methods must
not return entities. For example:

```thinai
bounded context Ordering

in bounded context Ordering {
  aggregate Order {
    root entity Order {
      method update()

      identifier id: OrderId
    }

    value object OrderId {
      raw: string
    }
  }

  repository OrderRepository manages Order.Order

  factory OrderFactory {
    method create() returns Order.Order
  }

  read model OrderSearch {
    orderNumber: string
    status: string
  }

  query repository OrderSearchRepository serves OrderSearch

  event OrderUpdated

  projector OrderSearchProjector {
    method onOrderUpdated(source: OrderUpdated) {
      projects OrderSearch
      behavior "Project the changed order into [[OrderSearch]] via [[OrderSearchRepository]]."
    }
  }

  application service OrderApplication {
    method updateOrder(id: OrderId) {
      invokes Order.Order.update
    }

    method createOrder() {
      invokes OrderFactory.create
    }
  }

  query service OrderQueries {
    method getOrderStatus(id: OrderId) returns string {
      behavior "Read [[OrderSearchRepository]] for the selected order."
    }

    method searchOrders(term: string) returns List<string> {
      behavior "Search [[OrderSearchRepository]] for orders matching the term."
    }
  }
}
```

Repository links in specification text are descriptive references, not storage
instructions. Each projector method declares one or more logical targets with
`projects ReadModel`; behavior text can link a specific query repository when
that routing matters.

## Modules

Modules organize declarations within one bounded context or shared kernel.
Use `exposes` to list declarations available to other modules, and `depends on`
to declare a module dependency. Declarations outside modules are visible to
modules by default. In the other direction, a context-level declaration may
reference a module declaration only when its module exposes it. A reference
between two different modules requires both an exposure and a dependency.

```thinai
bounded context Shipping

in bounded context Shipping {
  module Operations {
    exposes TrackingCode

    value object TrackingCode {
      raw: string
    }
  }

  value object ShipmentRouting {
    trackingCode: TrackingCode
  }

  module Fulfillment depends on Operations {
    value object ShipmentMetadata {
      trackingCode: TrackingCode
    }
  }
}
```

Module dependencies across bounded contexts are not supported. Shared value
objects belong in an explicit shared kernel rather than in a business bounded
context.
