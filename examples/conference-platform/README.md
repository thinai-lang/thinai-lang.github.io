# Conference Platform

The completed model from the Conference Platform walkthrough video.

This example keeps all three contexts in one root file with inline
`in bounded context` parts:

- `Program`
- `Venue`
- `Ticketing`

`shared.tni` and `extra.tni` are shared kernels.

The walkthrough demonstrates strategic contexts and subdomains, aggregates and
value objects, modules, domain and integration events, all four context-map
relationship forms, query contracts, projectors, and journeys.

For the multi-file root/part teaching example, see
[`../language-tour/multi-file`](../language-tour/multi-file).

Validate the model:

```bash
npx thinai-cli@alpha validate examples/conference-platform/conference.tni
```
