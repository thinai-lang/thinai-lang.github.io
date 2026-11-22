# Multi-file bounded context

This example splits one bounded context across a root and two part files.

- `program.tni` declares the canonical `bounded context Program` and imports
  both parts.
- `program-domain.tni` contributes the `Domain` module.
- `program-api.tni` contributes the `Api` module and references `Domain`
  declarations without importing the peer part.
- `ticketing.tni` imports only the `Program` root and consumes its published
  integration event through an authorized context map.

Validate the root, not a part:

```bash
npx thinai-cli@alpha validate examples/language-tour/multi-file/program.tni
npx thinai-cli@alpha validate examples/language-tour/multi-file/ticketing.tni
```
