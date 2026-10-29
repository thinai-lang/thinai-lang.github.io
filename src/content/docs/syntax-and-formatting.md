---
title: Syntax and Formatting
description: Lexical rules, identifiers, strings, collections, line layout, and formatting in Thinai.
---

This page is the compact reference for Thinai's surface syntax. For strategic
and tactical modeling concepts, start with the
[language model](language-model.md) and [tactical modeling](tactical-modeling.md).
Some later snippets are declaration fragments; only complete models need an
enclosing bounded context or shared kernel.

## Line layout

Thinai uses braces for blocks and does not use semicolon terminators.

- Start every sibling declaration and statement on its own line.
- In a non-empty block, put the first statement on the line after `{`.
- Empty blocks may use `{}`.
- A comma-separated list may wrap across lines, but the next sibling statement
  still starts on a new line.
- A declaration header may continue on the next line when the grammar expects
  more input, for example `module Api` followed by `depends on ...`.

```thinai
bounded context Ordering

in bounded context Ordering {
  aggregate Order {
    root entity Order {
      identifier id: OrderId
      status: OrderStatus initial Draft
    }

    value object OrderId {
      raw: string
    }

    enum OrderStatus {
      Draft,
      Placed
    }
  }
}
```

Enum values are a list rather than statements:

- Commas are required between enum values.
- A single value may start on the next line after `{`; the first-statement
  rule applies to declarations and statements, not enum values.
- Inline enums are valid when their commas are present, for example
  `enum Status { Draft, Placed }`. The formatter expands inline enums to one
  value per line.

## Identifiers

Identifiers are ASCII-only. Plain identifiers start with a letter or underscore
and continue with letters, digits, or underscores.

Use backticks when a name:

- is a reserved word, such as `value`, `event`, or `context`;
- contains spaces or hyphens.

```thinai
bounded context RequestContext

in bounded context RequestContext {
  data object Request {
    `value`: string
    `display-name`: string
  }

  application service Api {
    method inspect(request: Request) {
      behavior "Read [[Request.`value`]] and [[Request.`display-name`]]."
    }
  }
}
```

Declarations and references both require backticks for reserved words. The
validator reports an error when a `[[...]]` reference uses a reserved word
without backticks. Completion inserts the quoted form automatically.

## Types

Fields, parameters, and method results may use:

- primitives: `string`, `boolean`, `integer`, `decimal`, `date`, `time`, and
  `instant`;
- declared types: entities, value objects, enums, data objects, and read models;
- collections: `List<T>`, `Set<T>`, and `Map<K, V>`;
- qualified paths through modules and aggregates.

Use `integer` for counts and other whole numbers, and `decimal` for money,
prices, rates, and exact fractional business values. Neither numeric type
encodes precision, scale, currency, or units; use a value object when those
matter. There is no generic `number` primitive; choose `integer` or `decimal`
based on the domain value.

Collections may nest:

```thinai
bounded context SearchContext

in bounded context SearchContext {
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

`Map` takes exactly two type arguments. `List` and `Set` take exactly one.
A field or parameter may be optional with `?`:

```thinai
bounded context PricingContext

in bounded context PricingContext {
  data object Adjustment {
    amount?: decimal
    reason: string
  }

  application service Pricing {
    method quote(amount: decimal, note?: string) returns decimal {
      behavior "Apply the adjustment to the amount."
    }
  }
}
```

An entity enum field may declare its initial state:

```thinai
status: OrderStatus initial Draft
```

Method and constructor bodies are optional when no clauses are needed. Domain
services, factories, domain events, and integration events may also omit their
braces when they have no members.

## Strings, specifications, and comments

Specification text uses single quotes, double quotes, or triple double quotes.
Use triple double quotes for multiline text and put the delimiters on their own
lines.

```thinai
behavior """
  Check [[Order.Order.ensureOwner]], then read [[Order.Order.status]].
"""

behavior 'Escape a literal marker with \[[ and keep [[Order.Order.owner]] linked.'
```

- `[[...]]` marks a navigable reference.
- `\[[` writes a literal marker in the text.
- Backticks inside a reference quote reserved-word segments.
- Line comments start with `//`.
- Block comments use `/* ... */`.

## Formatting

The formatter:

- uses braces and two-space indentation by default;
- preserves declaration order and comments;
- respects the document's newline style;
- keeps empty blocks empty;
- expands inline enums to one value per line;
- normalizes parameter-list parentheses and comma/operator spacing.

Formatting is not required for validity. Completion and validation work on
unformatted source as well.

## Imports and aliases

Imports are relative to the importing `.tni` file. A bare import makes the whole
file part of the model; a selective import brings in named components.

```thinai
import "./common-types.tni"
import { Ordering as Orders, Shipping } from "./contexts.tni"
```

Selective imports are required when a file declares multiple bounded contexts,
context maps, or shared kernels. Strategic declarations such as actors and
journeys are brought in with a bare import. See
[the language model](language-model.md#working-across-files) for the full file
model and visibility rules.
