# devlog

Tech blog and project showcase by David Rubin (DevOps/Cloud engineer).

Monorepo: Next.js 15 (web) + Hono (api) + PostgreSQL, shared zod contracts, Turborepo, Docker, GitHub Actions.

- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Conventions and commands: [CLAUDE.md](CLAUDE.md)
- Roadmap: [PROGRESS.md](PROGRESS.md)

## Run the full stack (Docker)

```bash
cp infra/.env.example infra/.env
# set real secrets (min 32 chars): VIEW_HASH_SALT and, to enable /v1/stats, ADMIN_API_KEY
#   openssl rand -hex 32
docker compose -f infra/docker-compose.yml --env-file infra/.env up --build
```

| Service    | What it does                                             | URL                   |
| ---------- | -------------------------------------------------------- | --------------------- |
| `postgres` | PostgreSQL 16, volume `pgdata`                           | `127.0.0.1:5432`      |
| `migrate`  | One-shot: applies `apps/api/drizzle/*.sql`, then exits 0 | -                     |
| `api`      | Hono API, starts only after `migrate` succeeds           | http://localhost:4000 |
| `web`      | Next.js standalone, starts after `api` is healthy        | http://localhost:3000 |

Smoke test:

```bash
curl -s -X POST localhost:4000/v1/views/devlog-monorepo-architecture
```

```bash
curl -s localhost:4000/v1/stats -H "x-admin-api-key: $(grep ^ADMIN_API_KEY infra/.env | cut -d= -f2)"
```

`NEXT_PUBLIC_API_URL` is inlined into the web bundle at build time and must be listed in the api's
`WEB_ORIGIN` (CORS). If the api is down, the site still works: view counts and reactions simply do
not render.

## Local development

```bash
pnpm install
cp apps/api/.env.example apps/api/.env   # point DATABASE_URL at a Postgres 16
pnpm --filter @devlog/api db:migrate
pnpm dev                                  # web :3000, api :4000
```

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Repository integration tests run against a real Postgres when `TEST_DATABASE_URL` is set (CI does this with a service container).

## API (v1)

| Endpoint                         | Notes                                                      |
| -------------------------------- | ---------------------------------------------------------- |
| `GET`/`POST /v1/views/:slug`     | Unique views per visitor per day; raw IPs are never stored |
| `GET`/`POST /v1/reactions/:slug` | Types `fire`, `brain`, `rocket`; body `{ "type": "fire" }` |
| `POST /v1/subscribe`             | `{ "email" }` -> 202 `{ "status": "pending" }`             |
| `POST /v1/contact`               | `{ "name", "email", "message" }` -> 202                    |
| `GET /v1/stats`                  | Header `x-admin-api-key`                                   |
| `GET /health`, `/health/ready`   | Liveness / readiness (DB check)                            |

Errors: `{ "error": { "code", "message" } }`. Per-IP rate limits, `X-Request-Id` propagation, pino JSON logs.
