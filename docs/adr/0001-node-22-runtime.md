# ADR 0001: Move the runtime from Node 20 to Node 22

- Status: accepted
- Date: 2026-11-04

## Context

- `mermaid@12.2.0` (added in Phase 4 for diagrams in posts) declares `engines.node >=22.12.0`.
  With `engine-strict=true` in `.npmrc`, `pnpm install` fails on Node 20, which broke CI (`.nvmrc`)
  and the web Docker image (`node:20-alpine`). Local machines on Node 22 hid the problem.
- Node 20 reached end of life in April 2026: no security patches for the runtime of a public API.

## Decision

Node 22 (active LTS) everywhere: `.nvmrc` 22, root `engines.node >=22.12`, Docker base
`node:22-alpine`, tsup target `node22`, `@types/node` 22, Vercel Node.js 22.x.

## Alternatives considered

- **Pin `mermaid` to 11.x**: keeps Node 20, but on an EOL runtime and blocks future mermaid updates.
- **Drop `engine-strict`**: hides real incompatibilities; rejected.

## Consequences

- One runtime version across dev, CI, images and hosting.
- Dependabot ignores `@types/node` majors so types stay on the runtime major.
- Moving to Node 24 later is a new ADR when it becomes the active LTS on all hosts.
