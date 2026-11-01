---
title: Tactical Modeling
description: Model aggregates, entities, value objects, operations, and modules in Thinai.
---

Thinai models aggregates, entities, value objects, and related tactical DDD
declarations. For application services, events, and descriptive domain behavior, see
[Events and behavior](events-and-behavior.md).

## Aggregates, Entities, and Value Objects

An aggregate groups its root entity and other domain types. Entities and value
objects may have typed fields, constructors, and methods; invariants belong on
aggregates or inside constructor and method bodies. Common
field types are `string`, `boolean`, `integer`, `decimal`, `date`, `time`, and
`instant`; fields and method parameters can be optional with `?`. Use `integer`
for counts and `decimal` for money, prices, rates, and exact fractional business
values; precision, scale, currency, and units belong in a value object.
Built-in collections are `List<T>`, `Set<T>`, and `Map<K, V>`, and collections
may nest.
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
      quantity: integer
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

Collections may nest and may use value-object types:

```thinai
bounded context Catalog

in bounded context Catalog {
  value object Money {
    amount: decimal
  }

  data object Search {
    ids: List<string>
    labels: Set<string>
    quantities: Map<string, List<Set<integer>>>
    prices: List<Money>
  }
}
```

Identifier value objects can mirror identifiers owned by another context.
Define a local mirror rather than making a foreign context's private type part
of the local model. The mirror must declare the same fields, types, and
optionality as the source, and the two contexts must be connected by a
customer-supplier, partnership, or shared-kernel relationship in a context map:

```thinai
import "./context-catalog.tni"
import "./ordering.tni"

bounded context Shipping

in bounded context Shipping {
  value object OrderId mirrors Ordering.Order.OrderId {
    raw: string
  }
}

context map ShippingOrdering {
  customer Shipping -> supplier Ordering
}
```

## Operations and Domain Constraints

Entity and value-object bodies contain fields, constructors, and methods at the
same level; constructors, methods, and fields may appear in any source order.
Invariants may appear in constructor and method bodies, but not beside fields.
Constructors take typed parameters and return their owning type implicitly.
Methods may declare a return type with `returns`:

Constructor parameters should be domain values such as primitives, enums, and
value objects. Keep DataObjects and events at operation-handler boundaries, and
refer to entities in another aggregate by their identifiers rather than passing
the entity instances.

Method and constructor signatures follow these rules:

| Kind | Inputs | Outputs |
| --- | --- | --- |
| Entity constructor | Domain values; same-aggregate entity references; no DataObjects, events, read models, or foreign entities | No return |
| Context-level value-object constructor | Domain values; no entities, DataObjects, events, or read models | No return |
| Aggregate-owned value-object constructor | Domain values; same-aggregate entity references; no DataObjects, events, read models, or foreign entities | No return |
| Entity method | Domain values; same-aggregate entity references; no DataObjects, events, read models, or foreign entities | Domain values; same-aggregate entity references |
| Aggregate-owned value-object method | Domain values; same-aggregate entity references; no DataObjects, events, read models, or foreign entities | Domain values; same-aggregate entity references |
| Context-level value-object method | Domain values; no entities, DataObjects, events, or read models | Domain values |
| Factory method | Identifiers, value objects, primitives, enums, and collections of those; no entities, DataObjects, events, or read models | The single aggregate root created by that factory |
| Domain-service method | Entity or aggregate-root entity parameters and domain values; no DataObjects, events, or read models | Domain values; no entities, DataObjects, or read models |
| Application-service method | Domain values and DataObjects; no entities or read models; event handlers have exactly one event parameter and no other parameters | Domain values and DataObjects; no entities or read models |
| Query-service method | Domain values and DataObjects; no entities, read models, or events | Domain values, DataObjects, and read models; no entities |
| Projector method | Exactly one domain or integration event | No return; only `projects` targets |

“Domain values” means primitives, enums, value objects, identifiers, and
collections of those values. DataObjects belong at application-service and
query-service boundaries.

Context-level value objects may declare constructors and methods too:

```thinai
bounded context Pricing

in bounded context Pricing {
  value object Money {
    constructor(amount: decimal, currency: string) {
      invariant "The amount is not negative."
    }

    method add(other: Money) returns Money {
      behavior "Return a new amount based on [[Money.amount]] and [[other.amount]]."
    }

    amount: decimal
    currency: string
  }
}
```

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

Factory operations are methods that return the single aggregate root created by
that factory. All valid methods in one factory must return the same root;
different roots need separate factories. Behavior specifications can link to
these methods, just as they can link to other methods; constructors themselves
are not link targets.

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
field may declare an initial value with `initial State`; when present, every
transition source on that field must be reachable from the initial state through
the entity's declared transition graph. Unused enum values remain valid, so a
state enum can be shared with contracts or other entities. A transition
statement may group changes to multiple enum fields on the same entity, with one
descriptive `when` guard applying to the whole group:

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
Read models may compose other read models, but not data objects. Published query
contracts expose only primitive or public DataObject results; see
[modules and visibility](modules-and-visibility.md#published-query-contracts).
Projectors are optional event-driven projections. A query service reads through
query repositories, which may source the same relational tables as the write
side; it does not read aggregate repositories directly. Query-service methods can
return primitives, data objects, read models, value objects, enums, or
collections of these; application-service methods must not return entities. For
example:

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

  repository OrderRepository {
    manages Order.Order
  }

  factory OrderFactory {
    method create() returns Order.Order
  }

  read model OrderSearch {
    orderNumber: string
    status: string
  }

  query repository OrderSearchRepository {
    serves OrderSearch
  }

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
to declare a module dependency. A module may expose declarations it owns,
including methods and members of its own aggregates, plus its direct child
modules. Declarations outside modules are visible to modules by default. In the
other direction, a context-level declaration may reference a module declaration
only when its owning module and every enclosing module expose the path. A
reference from another module requires exposure by the owning module plus a
dependency or public re-export route. A direct dependency on a nested module is
valid when that module exposes the declaration, even if its parent does not
expose it. A parent that exposes a child module needs no redundant dependency.
`depends on` is not a re-export.
Exposing a nested module re-exports its public API through the enclosing module;
see [modules and visibility](modules-and-visibility.md) for nested re-exports,
exposed methods, and published query contracts.

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

Qualified specification paths may traverse bounded contexts, context maps,
shared kernels, modules, aggregates, entities, services, projectors, and
factories without exposing each structural segment. Value objects, data objects,
read models, enums, and fields are data-bearing: using one as a non-terminal
path segment requires same-module access; exposure by its owning module plus a
direct dependency or public API route; an authorized shared-kernel relationship;
or an authorized event or published-query contract. From outside all modules or
across contexts, the full public exposure chain is required.
