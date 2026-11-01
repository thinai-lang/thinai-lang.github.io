---
title: Agent Workflow
description: Use Thinai as a model-first source of truth for coding agents.
---

Thinai is designed to be read by coding agents as well as people. The model
describes the domain; the agent implements code using the repository’s
conventions. There is no code generator.

## Interfaces

Use whichever interface is available:

- **LSP** — diagnostics, completion, definitions, references, document symbols,
  hover, formatting, and code actions.
- **CLI** — model export, context slices, impact, validation, and an MCP server.
- **MCP** — structured model queries for agents that support tool calling.

All three read the same model. The model remains the source of truth.

Install the CLI with `npm install -g thinai-cli@alpha` or run it with
`npx thinai-cli@alpha`. The commands below assume `thinai-cli` is on `PATH`.

## Inspect the model

```bash
thinai-cli inspect path/to/model.tni --out model.json
```

The output uses the `thinai-model-v1` schema. Element IDs are canonical and
kind-prefixed. Each element reports `visibility` (immediate exposure),
`publicApi` (fully visible from the context boundary), and `exposedBy` (the
modules that expose it directly). Relationships report a semantic `role` and a
`kind` of `reference` or `qualifier`:

```text
Aggregate:Ordering.Order
Field:Ordering.Order.Order.id
IntegrationEvent:Ordering.OrderPlacedV1
```

## Request a context slice

Prefer one aggregate, bounded context, module, or contract over loading the
whole model.

```bash
thinai-cli context path/to/model.tni Aggregate:Ordering.Order --format md
```

The slice includes the root, its members, relevant dependencies, contracts, and
the relationships between included elements. Module and cross-context visibility
metadata is preserved.

## Report impact

```bash
thinai-cli impact path/to/model.tni ValueObject:Ordering.Order.OrderId --json --depth 2
```

The report lists the changed element, its descendants, incoming references, and
the elements that reference it. `--depth` follows reverse references up to the
requested level (default 1), and `--limit` caps the returned affected elements
(default 200). Check `totalAffected`, `returned`, and `truncated` before
assuming the report is complete.

## Validate

```bash
thinai-cli validate path/to/model.tni
```

The CLI validates the source file and its transitive imports. It does not
discover separate files that import the source file. Use a workspace-aware
client for the complete import-connected model.

## MCP server

```bash
thinai-cli mcp path/to/model.tni
```

The server is read-only. Available tools:

- `list_elements` — filter by kind, context, or text; paginate with `offset`/`limit`.
- `search_elements` — case-insensitive search by ID, name, or qualified name.
- `resolve_element` — exact qualified-name lookup with optional `kind` and `context`.
- `get_element` — one element with its source, properties, and direct relationships.
- `get_context` — task-scoped model slice.
- `get_dependencies` — filter by `direction`, `kind` (`reference`, `qualifier`, or `all`), and exact `role`; paginate with `offset`/`limit`.
- `get_visibility` — context, module path, exposure, `visibility`, and `publicApi`.
- `get_source` — exact declaration text from a loaded model document, bounded by `maxCharacters`.
- `validate_model` — reload and validate the model.
- `impact_of_change` — direct or transitive reverse-reference impact with `depth` (default 1, maximum 10) and `limit` (default 200, maximum 1000).

Dependency results default to semantic `reference` edges. Pass
`kind: "all"` to include `qualifier` edges, which represent module and namespace
path segments. Use exact `role` filters such as `invokes`, `emits`, or `type`.

`resolve_element` matches the `qualifiedName` exactly and case-sensitively. It
returns the full element when there is one match, and summaries when several
elements share the name:

```json
{ "qualifiedName": "Ordering.Order" }
```

`get_source` accepts only a model element ID. It never accepts an arbitrary
filesystem path and reads only documents in the loaded model:

```json
{ "id": "Aggregate:Ordering.Order", "maxCharacters": 4000 }
```

Use MCP when the agent supports structured tool calls but not LSP or shell
commands. Use the CLI when shell access is available. Use LSP for editor and
agent navigation.

## Workflow

1. Locate the model and the relevant bounded context.
2. Request a context slice.
3. Respect module exposure and cross-context boundaries.
4. Implement code using the repository’s language and framework conventions.
5. Validate the model and run the repository’s tests.
6. Check that every touched aggregate, event, contract, and exposed operation has
   a code counterpart.

## Model rules to preserve

- `identifier` fields reference a value object declared in the same aggregate.
- Module visibility requires exposure and, for sibling modules, `depends on`.
- Cross-context use requires a mirror, shared kernel, integration event, or
  published query contract.
- Domain events are context-private; integration events are cross-context
  contracts.
- Data objects are boundary shapes, not domain state.
- Primitives are `string`, `boolean`, `integer`, `decimal`, `date`, `time`, and
  `instant`.

A deterministic conformance manifest and `thinai verify` workflow are planned
after the first alpha.
