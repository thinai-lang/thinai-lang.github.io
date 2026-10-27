---
title: References and Paths
description: Link model elements with specification references, qualified paths, parameters, results, and journey timelines.
---

Specification text can contain navigable references written as `[[...]]`.
References are descriptive links; they are not expressions and are never
executed. Some examples below are fragments; complete models need the enclosing
context and imports.

## Basic references

A reference names a visible declaration, method, parameter, repository, type,
enum value, or field.

```thinai
behavior "Read [[OrderRepository]] and [[Order.Order.status]]."
```

When a domain term is also a reserved word, quote that segment with backticks:

```thinai
data object Request {
  `value`: string
}

behavior "Use [[Request.`value`]]."
```

The validator reports reserved-word reference segments that are not quoted.
Ordinary identifiers do not need quotes.

## Path segments

A dotted reference is one linked path with independently navigable segments:

```thinai
behavior "Use [[input.address.street]]."
```

- `input` targets the parameter.
- `address` targets its field.
- `street` targets the nested field.

Qualified paths may continue through a field's declared type:

```thinai
behavior "Use [[Shop.Dto.address.city]]."
```

Use fully qualified paths when names collide:

```thinai
behavior "Compare [[Ordering.Order]] with [[Ordering.Order.Order]]."
```

The first link targets an aggregate; the second targets its same-named root
entity.

## Parameters and results

Inside a method, refer to parameters by their local names and to the operation
result through the `result` binding:

```thinai
application service OrderApplication {
  method place(input: PlaceOrderInput) returns PlaceOrderResult {
    behavior "Place [[input.orderId]] and return [[result.status]]."
  }
}
```

- The canonical current-result form is `[[result.field]]`.
- `result` is reserved on methods that declare a result and on
  application-service commands. It cannot be used as a parameter name there.
- A bare method path such as `[[run.status]]` works only inside the enclosing
  entity or value object.
- Outside that enclosing object, use a qualified method path such as
  `[[Context.Service.method.status]]`.

## Specification segments and visibility

A specification path may traverse structural containers such as bounded
contexts, context maps, shared kernels, modules, aggregates, entities, services,
projectors, and factories without exposing every structural segment.

Data-bearing declarations—value objects, data objects, read models, enums, and
fields—require one of:

- same-module access;
- exposure by the owning module plus a direct dependency or public API route;
- an authorized shared-kernel relationship;
- an authorized event or published-query contract.

From outside all modules or across bounded contexts, the full public exposure
chain is required. An identifier value object named by `mirrors` is the explicit
exception and may be module-private.

| Path segment | Requirement |
| --- | --- |
| Structural container (context, map, kernel, aggregate, entity, service, projector, factory) | May be traversed without exposing the segment. |
| Module | Must be accessible through the public module API or a direct dependency; a cross-context contract path may reach a private nested module only when authorized. |
| Method used as a non-terminal segment | Must be exposed by its owning module unless the source is in that module; context-level methods are public within their context. |
| Data-bearing non-terminal (value object, data object, read model, enum, field) | Must be exposed by its owning module and reachable through the same module, a direct dependency or exposing ancestor, the public API, an authorized shared kernel, or an authorized event or query contract. |
| Terminal declaration | Must satisfy the declaration, contract, or journey visibility rule that applies to it. |

For module and cross-context details, see
[modules and visibility](modules-and-visibility.md).

## Journey references

Journey `with` and `when` text follows the journey timeline:

- Current inputs are visible.
- Results of earlier command invocations are visible to later steps.
- The current command's result binding is not visible to its own step.
- A command invoked later in the same journey is not visible from an earlier
  step.
- Referencing the same command more than once is ambiguous and produces a
  warning.

Use the command's qualified result path for a prior invocation:

```thinai
actor Customer

journey FulfillPlacedOrder {
  by Customer {
    invoke Ordering.OrderApplication.placeOrder
      with "Place the selected order."

    invoke Shipping.ShipmentApplication.createShipment
      with "Create a shipment for [[Ordering.OrderApplication.placeOrder.result.orderId]]."
      when "The order has been placed."
  }
}
```

The journey example assumes the context and service declarations are imported
into the same model.

A query result can be linked without invoking the query in the journey:

```thinai
when "The eligibility result [[Ordering.OrderQueries.canPlaceOrder.result.eligible]] is true."
```

Journey links are not executable conditions. They do not bind command
arguments, invoke methods, or evaluate expressions.

## Escaping and multiline text

- Use `\[[` for a literal `[[` marker.
- Use triple double quotes for multiline specifications.
- Keep the opening and closing `"""` delimiters on their own lines.
- The formatter preserves relative indentation and linked references.

```thinai
behavior """
  Check [[Order.Order.ensureOwner]].
  The sequence \[[ is literal text.
"""
```

## Visibility and diagnostics

If a reference does not resolve, check:

1. Is the declaration imported or visible in the current model?
2. Is the module accessible, is the declaration exposed, and is this a direct
   dependency on its module?
3. Does a cross-context read or event require an authorized context map?
4. Is a data-bearing path segment private to another module or aggregate?
5. Does a non-terminal method path require method exposure?
6. Does a reserved-word segment need backticks?
7. For a journey, was the referenced command invoked earlier in the same
   journey?

See [validation rules](validation-rules.md) for the corresponding constraints.
