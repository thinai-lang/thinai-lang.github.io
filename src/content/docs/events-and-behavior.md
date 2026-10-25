---
title: Events and Behavior
description: Describe application-service operations, events, and journeys in Thinai.
---

Thinai models application-service operations, aggregate behavior, domain and
integration events, and user-started journeys. Behavior specifications remain
descriptive; structured clauses such as `invokes`, `emits`, and `transition`
provide navigable semantic relationships.

Quoted specifications can link to methods, parameters, repositories, domain
types, and fields by surrounding a qualified name with `[[` and `]]`. A link
identifies a model element; it does not evaluate an expression or invoke the method. Plain
quoted specifications remain unlinked text. Use triple double quotes for multiline
specification blocks, or keep single or double quotes; the formatter normalizes
the common outer indentation while preserving relative indentation, line breaks,
linked references, and the delimiters you chose.

Use `invariant` for a domain rule that should hold for the relevant model
element, `precondition` for what must hold before an operation, and
`postcondition` for what the operation guarantees when it succeeds. Use
`behavior` for a general human-readable description that does not frame the
statement as a condition or guarantee. These clauses are optional and
descriptive: Thinai does not execute them or verify that their text is true.
Prefer not to repeat relationships already expressed by structured clauses such
as `invokes`, `emits`, or `transition`.

## Aggregate Effects and Application Services

An ordinary application-service method is a command operation. It coordinates
aggregate-root behavior; root and child entity methods own their respective
state changes, and the aggregate root protects invariants across the aggregate.
Application services may also invoke domain-service methods for domain policies
or calculations, but should invoke the aggregate root directly for state changes.
In Thinai, domain services cannot invoke aggregate-owned methods, and
aggregate-owned methods cannot invoke domain services; this keeps both directions
of the invocation boundary explicit.
Domain events are emitted by aggregate-root behavior:

```thinai
bounded context Ordering

in bounded context Ordering {
  aggregate Order {
    root entity Order {
      method place() {
        emits OrderPlaced
        transition status from Draft to Placed
      }

      identifier id: OrderId
      status: OrderStatus initial Draft
    }

    value object OrderId {
      raw: string
    }

    value object OrderLine {
      sku: string
    }

    enum OrderStatus {
      Draft,
      Placed
    }
  }

  repository OrderRepository {
    manages Order.Order
  }

  factory OrderFactory {
    method createOrder() returns Order.Order
  }

  event OrderPlaced {
    orderId: OrderId
  }

  application service OrderApplication {
    method placeOrder(orderId: OrderId, items: List<OrderLine>) {
      precondition "The order contains at least one item."
      invokes Order.Order.place
        when "The order is ready to be placed."
      behavior "Place the order while its status is [[Order.Order.status]]."
    }

    method createOrder() {
      invokes OrderFactory.createOrder
    }
  }
}
```

Factories and repositories are declared beside aggregates in the bounded
context. A factory creates exactly one aggregate root: all of its valid methods
return that same root, and different roots need separate factories. Behavior
specifications link to the factory method rather than to a constructor or the
factory declaration itself.

Aggregate-root methods may emit multiple domain events. Emissions are listed in
order. Application-service methods coordinate aggregate-root behavior, and may
invoke a factory method when creation is part of the use case. Thinai describes
these domain relationships; it does not require a load/save sequence or declare
transaction mechanics.

An `emits` clause may list multiple events and may have a descriptive `when`
guard. The guard applies to every event in that clause; use separate `emits`
clauses when the events have different conditions. A transition can similarly
group changes to multiple enum fields declared on the same entity under one
descriptive `when` guard. Each field change is validated against its own enum.
An `invokes` clause may also have a descriptive `when` guard. It describes when
the invocation is intended to occur, but does not change which calls are allowed
by Thinai's invocation rules or turn the relationship into executable behavior.
Grouping records coordinated intent, not an implementation-level atomicity
guarantee. Guards are prose, not evaluated conditions; state-graph reachability
therefore treats guarded transitions as possible edges. The `when` guard on a
journey step is separate and describes a condition for invoking the command.

## Integration Events and Event-Triggered Methods

Domain events are private to their bounded context. To publish a fact across a
context boundary, an application-service method can receive a domain event and
emit one or more integration events. The integration-event declaration defines
the public schema; the method's behavior text describes any payload mapping.
Event payloads carry stable value data rather than entity instances or other
aggregate-owned types. An IntegrationEvent nested in a module must be explicitly
exposed before another bounded context can consume it. When the event is in a
module and a direct payload type lives in a sibling module, the event module
must depend on that payload module and the payload must still be exposed;
nested payload types follow their outer type's module dependencies.

For CQRS reads, a `read model` is an optional query-result shape, not necessarily
a materialized projection or separate database. A `query repository` is an
optional logical read boundary and may query the same physical tables as the
write side. A `projector` is needed only when the model uses an event-driven
projection. Query services may read through query or aggregate repositories and
must return data, not entity instances. Projectors do not call application
services or change aggregates:

```thinai
bounded context Ordering

in bounded context Ordering {
  event OrderPlaced {
    orderId: string
  }

  read model OrderSummary {
    orderId: string
    status: string
  }

  query repository OrderSummaryRepository {
    serves OrderSummary
  }

  projector OrderSummaryProjector {
    method onOrderPlaced(source: OrderPlaced) {
      projects OrderSummary
      behavior "Copy [[OrderPlaced.orderId]] into [[OrderSummary.orderId]] via [[OrderSummaryRepository]]."
    }
  }
}
```

```thinai
bounded context Ordering

in bounded context Ordering {
  event OrderPlaced {
    orderId: OrderId
  }

  module Contracts {
    exposes OrderPlacedV1

    integration event OrderPlacedV1 {
      orderId: string
    }
  }

  application service OrderApplication {
    method publishOrderPlaced(source: OrderPlaced) {
      emits Contracts.OrderPlacedV1
      behavior "Map the internal event to the public contract."
    }
  }
}
```

A method whose parameter type is a DomainEvent or IntegrationEvent is
event-triggered. A consumer's method can receive an imported integration event
and invoke a local command method:

```thinai
bounded context Shipping

in bounded context Shipping {
  application service ShipmentApplication {
    method createShipment(shipmentId: ShipmentId) {
      invokes Shipment.Shipment.start
    }

    method onOrderPlaced(source: Ordering.Contracts.OrderPlacedV1) {
      invokes createShipment
      behavior "Map the incoming event to the local command input."
    }
  }
}
```

Keep the imported contract at this boundary; use local types in ordinary
command methods and aggregates. Do not model arbitrary payload transformations
as expressions. Integration-event publication is an application-layer reaction
to a local DomainEvent. Delivery ordering, broker behavior, and outbox mechanics
are outside the DSL.

Cross-context integration-event use requires an explicit bounded-context
import and an imported context map with an authorized, correctly directed
relationship. The customer-to-supplier arrow points from the downstream
consumer to the upstream producer. This relationship authorizes the customer to
consume the supplier's IntegrationEvents; a partnership authorizes consumption
in either direction. `integrationPatterns` are descriptive labels and do not
affect authorization or assert implementation conformance. Separate-ways and
shared-kernel relationships do not authorize event handling. Context maps do
not make domain events public.

## Journeys

A journey is a top-level, descriptive EventStorming timeline of user-invoked
application-service commands. It can span bounded contexts. Each command remains
owned by its bounded context; the journey does not imply a synchronous remote
call or shared transaction. Background event handoffs are modeled by the
contexts' events and handlers, not as journey steps. Queries and event-triggered
handlers are not journey commands. Optional `with` input descriptions and `when`
guards are linked prose, not executable data flow or conditions; each command
must still enforce its own invariant:

```thinai
actor Customer

journey PlaceOrder {
  by Customer {
    invoke Ordering.OrderApplication.placeOrder
      with "orderId from [[Ordering.OrderSummary.orderId]] and items from the selected order lines"
      when "The eligibility result [[Ordering.OrderQueries.canPlaceOrder.result.eligible]] allows this order."
  }
}
```

Actors are declared once at the top level and referenced in `by Actor { ... }`
blocks, which group commands initiated by that actor. Journey order is
significant. A query result linked from `when` is not bound to a command
argument, invoked by the journey, or evaluated by the DSL. Emitted events are
derived from the invoked methods and need not be repeated in the journey.

See the [Order Fulfillment example](https://github.com/thinai-lang/thinai/blob/main/examples/order-fulfillment/README.md)
for a multi-file model with an integration-event consumer.
