---
name: thinai-model
description: Use or author Thinai models. Covers model discovery, context slices, module visibility, MCP/CLI/LSP access, authoring references, validation, and verification.
user-invocable: false
---

# Working with Thinai Models

Thinai is a descriptive DDD modeling language. There is no code generator: use the model to understand the domain, then implement code in the repository using its conventions.

## Access paths

Use whichever interface the environment provides:

- **LSP** — completion, diagnostics, definitions, references, symbols, hover, formatting, and code actions in an editor.
- **CLI** — `thinai-cli inspect`, `context`, `impact`, `validate`, and `mcp`.
- **MCP** — structured, read-only model queries when an MCP server is available.

The model is the source of truth. Do not infer domain rules from generated code.

## Reference files

Load these only when the task needs them:

- `references/authoring.md` — condensed language and authoring guide.
- `references/validation.md` — validation checklist for context maps, events, modules, CQRS, and journeys.
- `references/examples/` — small validated models.

Before writing or changing a model, read `references/authoring.md`. Before changing a context map, event handler, module boundary, or query repository, also read `references/validation.md`.

## Workflow

1. **Locate the model**
   - Find `.tni` files and the root model for the task.
   - Use `thinai-cli inspect <file>` if you need the full graph.
   - Use MCP `list_elements` or `search_elements` for targeted discovery.
   - Use MCP `resolve_element` when you already know a qualified name such as `Ordering.Order`.

2. **Select a context slice**
   - Prefer one aggregate, bounded context, module, or contract.
   - CLI: `thinai-cli context <file> <element-id> --format md --depth 1`
   - MCP: `get_context`
   - Do not load the entire model when one slice is enough.

3. **Read the declaration**
   - MCP: `get_source({ id })` returns the exact declaration text for elements in the loaded model.
   - `get_source` accepts only model element IDs; it never accepts arbitrary filesystem paths.
   - Use `maxCharacters` to bound large declarations.

4. **Respect the model**
   - Context-level declarations are inside their bounded context or shared kernel.
   - Module-nested declarations follow exposure and `depends on` rules.
   - Cross-context type use requires a mirror, shared kernel, integration event, or published query contract.
   - Identifier fields require a value object declared in the same aggregate.
   - Use `string`, `boolean`, `integer`, `decimal`, `date`, `time`, and `instant`.
   - Do not use `number`; it is not a Thinai primitive.
   - Integration events are handled only outside their owning bounded context; same-context reactions use domain events.
   - Put `Conformist`/`AntiCorruptionLayer` on customer endpoints and `OpenHostService`/`PublishedLanguage` on supplier endpoints. A wrong-side pattern is a warning.
   - A query repository uses either `reads from` or a projector-maintained read model; prefer separate repositories instead of mixing forms.

5. **Check dependencies and impact**
   - MCP `get_dependencies` returns `reference` edges by default.
   - Pass `kind: "all"` to include `qualifier` edges (module and namespace path segments).
   - Filter with `role` (for example `invokes`, `emits`, `type`) and paginate with `offset`/`limit`.
   - MCP `impact_of_change` follows reverse references up to `depth` (default 1, maximum 10) and caps results with `limit`.
   - Check `truncated` and `totalAffected` before assuming a complete result.

6. **Implement**
   - Follow the existing repository’s language, framework, and naming conventions.
   - Keep domain invariants and preconditions represented in the implementation or tests.
   - Keep boundary types (data objects, integration events) out of the domain layer.

7. **Validate**
   - CLI: `thinai-cli validate <file>`
   - LSP diagnostics
   - MCP: `validate_model`
   - Run the repository’s tests.

8. **Verify model coverage**
   - Check that every aggregate, event, contract, and exposed operation you touched has a code counterpart.
   - A deterministic `thinai verify` manifest workflow is planned but not part of this alpha.

## Useful commands

```bash
thinai-cli inspect path/to/model.tni
thinai-cli context path/to/model.tni Aggregate:Ordering.Order --format md
thinai-cli impact path/to/model.tni ValueObject:Ordering.Order.OrderId --json --depth 2
thinai-cli validate path/to/model.tni
thinai-cli mcp path/to/model.tni
```

## MCP tools

- `list_elements` — filter by kind, context, or text; paginate with `offset`/`limit`.
- `search_elements` — case-insensitive search by ID, name, or qualified name.
- `resolve_element` — exact qualified-name lookup with optional `kind` and `context`.
- `get_element` — one element with its source, properties, and direct relationships.
- `get_context` — task-scoped model slice.
- `get_dependencies` — relationship filters (`direction`, `kind`, `role`) and pagination.
- `get_visibility` — context, module path, exposure, `visibility`, and `publicApi`.
- `get_source` — exact declaration text from a loaded model document.
- `validate_model` — reload and validate the model.
- `impact_of_change` — direct or transitive reverse-reference impact with `depth`/`limit`.

The server is read-only. Edit files through the workspace, not through MCP.

## Edge kinds

- `reference` — a semantic dependency such as a type, event emission, invocation, exposure, or mirror.
- `qualifier` — a navigation segment in a qualified path, such as `Types` in `Types.OrderId`.

Prefer `reference` edges when reasoning about behavior. Include `qualifier` edges when a namespace, module, or context rename can affect qualified paths.

## Interface selection

- **LSP** — navigation, diagnostics, and refactoring while editing.
- **CLI** — shell-driven inspection, validation, and CI.
- **MCP** — structured, read-only context for agents without shell or editor access.

## What not to do

- Do not invent a code generator or assume generated artifacts exist.
- Do not use private module declarations from outside their allowed scope.
- Do not treat journeys, behavior text, or invariants as executable code.
- Do not silently change the model to fit an implementation; surface the mismatch.
- Do not ask MCP to edit files or add write tools; it is read-only by design.
