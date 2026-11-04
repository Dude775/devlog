# Architecture

## Runtime topology

```mermaid
flowchart LR
    user([Browser])

    subgraph web["apps/web (Next.js 15, RSC)"]
        pages["App Router pages"]
        velite[("velite content<br/>(MDX, build time)")]
        client["@devlog/shared/client<br/>(server-only, zod-validated)"]
        pages --> velite
        pages --> client
    end

    subgraph api["apps/api (Hono, Node 20)"]
        routes["routes/"] --> services["services/"] --> repos["repositories/"] --> db["db/ (Drizzle)"]
    end

    pg[("PostgreSQL 16")]

    user -->|HTTPS| pages
    client -->|HTTP JSON| routes
    db -->|SQL| pg

    shared["packages/shared<br/>zod schemas + types"]
    shared -.contract.-> client
    shared -.contract.-> routes
```

### Boundaries

| Rule                                                    | Why                                                |
| ------------------------------------------------------- | -------------------------------------------------- |
| Web has no DB driver; all dynamic data via the API      | Single owner of data, API is reusable and testable |
| API layers only call downward                           | Swap storage or transport without touching logic   |
| Request/response shapes are zod schemas in `shared`     | One contract, validated at both ends at runtime    |
| `createApp()` is pure; wiring happens in `src/index.ts` | HTTP tests run in-process with fakes, no DB needed |
| Env parsed once by zod at startup                       | Fail fast on misconfiguration                      |

### Health endpoints

| Endpoint            | Purpose   | Behaviour                                                  |
| ------------------- | --------- | ---------------------------------------------------------- |
| `GET /health`       | Liveness  | Always 200 `{ status: "ok", version, uptime }`; no DB call |
| `GET /health/ready` | Readiness | 200 when `select 1` succeeds, else 503 `not_ready`         |

## CI/CD flow

```mermaid
flowchart TD
    push["push to main / pull_request"] --> fmt["format: prettier --check"]
    push --> matrix{{"verify matrix: web, api"}}
    matrix --> install["pnpm install --frozen-lockfile<br/>(pnpm store cache)"]
    install --> cache["restore .turbo/cache"]
    cache --> turbo["turbo run lint typecheck test build<br/>--filter=@devlog/APP..."]
    turbo --> docker{{"docker matrix: web, api"}}
    docker --> build["buildx: multi-stage image<br/>(GHA layer cache, no push)"]
```

## Container images

Both Dockerfiles follow the same pattern:

1. `pruner`: `turbo prune <app> --docker` emits only the app's workspace graph and a pruned lockfile.
2. `builder`: install from `out/json` (cache-friendly layer), copy `out/full`, `turbo build`.
3. `runner`: clean `node:20-alpine`, runs as `node` (uid 1000), `HEALTHCHECK` built in.
   - web: Next.js `output: "standalone"` (no `node_modules` install).
   - api: `pnpm deploy --prod` (production deps only) + tsup bundle with `@devlog/*` inlined.

Compose runs `postgres -> api -> web` gated on `service_healthy`, binds ports to `127.0.0.1` only, and sets `no-new-privileges` (api is also `read_only`).
