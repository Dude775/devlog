# CLAUDE.md

Operating manual for AI/human contributors. Read this and `PROGRESS.md` before touching code.

## Project

Personal tech blog + project showcase for David Rubin (DevOps/Cloud, AWS SAA).
The repo is itself a portfolio piece: architecture, repo hygiene and CI matter as much as UI.

## Stack (fixed, do not change without an ADR in `docs/`)

| Area     | Choice                                                                        |
| -------- | ----------------------------------------------------------------------------- |
| Monorepo | pnpm 10 workspaces + Turborepo 2                                              |
| Web      | Next.js 15 App Router, React 19, RSC, TypeScript strict, Tailwind CSS v4      |
| Content  | MDX via velite (fallback: next-mdx-remote)                                    |
| API      | Hono on Node 22, TypeScript, Drizzle ORM, PostgreSQL 16, zod                  |
| Shared   | `@devlog/shared`: zod schemas, inferred types, typed API client               |
| Config   | `@devlog/config`: ESLint 9 flat config, tsconfig presets, Prettier            |
| Infra    | Docker multi-stage non-root images, docker compose (postgres + api + web)     |
| CI       | GitHub Actions: format, matrix verify, Playwright e2e, Docker -> GHCR, CodeQL |

## Folder map

```
apps/
  web/                     Next.js app (@devlog/web)
    content/posts/*.mdx    Blog posts (velite "posts"; frontmatter: title, slug, date, updated?, category, tags,
                           summary, cover?, dir, draft, featured, project?). Unknown `project` fails the build.
    content/projects/*.yml Projects (velite "projects": title, slug, stack, repo, portfolio_url, live?, status,
                           featured, summary). Only real, public repos; never invent URLs or stack.
    src/app/               Routes (RSC by default)
    src/components/ui/     Design system primitives (Button, Card, Badge, Tag, Container, Section, Prose, CodeBlock)
    src/components/*/      Feature components (layout, blog, projects, home, command, mdx, motion)
    src/config/            site.ts (identity, links, nav), categories.ts (allowed category slugs),
                           security-headers.ts (CSP/HSTS/etc., applied in next.config.ts headers())
    src/lib/content.ts     Typed queries over velite output; the only place pages read content (drops drafts in prod)
    src/lib/seo.ts         pageMetadata/postMetadata, canonical + RSS alternates, JSON-LD builders
    src/lib/og.tsx         next/og frame + local font loading (@fontsource woff); mirrors dark tokens
    src/app/{sitemap,robots}.ts, rss.xml/route.ts, opengraph-image.tsx   SEO routes (static)
    src/lib/api.ts         Server-only typed API client factory
    src/lib/api-browser.ts Browser API client for client islands (views, reactions, forms)
    src/components/engagement/  ViewCounter, ReactionBar (render nothing if the API fails)
    src/components/forms/  NewsletterForm (footer), ContactForm (/contact), honeypot field
    src/env.ts             zod-validated env (publicEnv, getServerEnv)
    velite.config.ts       Content schema
    e2e/*.spec.ts          Playwright smoke tests (standalone server, API down; fail on CSP violations)
    playwright.config.ts   Playwright config (port 3100)
  api/                     Hono API (@devlog/api)
    src/index.ts           Process entry: env, logger, DB, server, graceful shutdown
    src/migrate.ts         One-shot migration entry (dist/migrate.js, compose `migrate` job)
    src/wiring.ts          repositories -> services wiring against a real DB
    src/app.ts             HTTP composition root (pure, DI, testable); middleware order + rate-limit rules
    src/routes/            HTTP only: parse/validate input, call service, shape response
    src/services/          Business logic; no HTTP, no SQL
    src/repositories/      Data access via Drizzle; no business rules (*.integration.test.ts hit Postgres)
    src/middleware/        request logger, client IP, rate limit, admin auth
    src/lib/               HttpError + parseInput, pino logger, visitor hash, rate-limit stores
    src/testing/fakes.ts   In-memory repositories for service/route tests
    src/db/                Drizzle client, schema, runMigrations()
    src/config/env.ts      zod-validated env (the only place reading process.env)
    drizzle/               Generated SQL migrations (drizzle-kit), committed
packages/
  shared/                  @devlog/shared: schemas/, client/
  config/                  @devlog/config: eslint/, tsconfig/, prettier.js
infra/
  docker/*.Dockerfile      Multi-stage, turbo prune, non-root runtime
  docker-compose.yml       Local full stack
scripts/dev-setup.mjs      `pnpm dev:setup`: apps/api/.env, Postgres via compose, migrations
docs/ARCHITECTURE.md       Diagrams + boundaries
docs/adr/                  Architecture decision records (stack changes need one)
docs/DEPLOYMENT.md         Vercel (web) + Render Docker (api) + Neon (Postgres), env tables, rollback
.github/workflows/ci.yml   CI: format, verify matrix, e2e, docker (push to GHCR on main)
.github/workflows/codeql.yml  CodeQL security-extended (TS + Actions)
.github/dependabot.yml     Weekly grouped npm + Actions updates (respects pinned majors)
```

## Architecture rules (enforced in review)

1. **web never touches the DB.** No `drizzle-orm`, `postgres` or SQL in `apps/web`. All dynamic data goes through `apps/api` via `@devlog/shared/client`.
2. **API layering is one-directional:** `routes/ -> services/ -> repositories/ -> db/`. No skipping layers, no upward imports.
3. **Contracts live in `@devlog/shared/schemas`.** Every request/response shape is a zod schema; types are `z.infer`. API responses and client parsing use the same schema.
4. **Dependency injection over singletons.** Factories (`createXService({ deps })`) wired in `apps/api/src/index.ts`; `createApp()` stays pure so tests use `app.request()` with fakes.
5. **Static content (MDX) is build-time** via velite. Dynamic data (views, likes, comments) is API-backed.
6. **Portfolio owns project detail.** https://system-portfolio.vercel.app is canonical; this site links out, never duplicates case studies. No `/projects/[slug]`.
7. **SEO via helpers.** Pages export metadata through `pageMetadata()` / `postMetadata()` (Next merges metadata shallowly, so partial objects drop OG/canonical). New indexable routes go in `src/app/sitemap.ts`.
8. **Design tokens only.** Colors come from CSS vars in `globals.css` (`bg`, `surface`, `fg`, `muted`, `accent`, ...); no raw palette colors in components (exceptions: status tones like the `warn` Callout, and `src/lib/og.tsx` which mirrors the dark tokens because satori cannot read CSS vars). Motion must respect `prefers-reduced-motion`.
9. `@devlog/shared` must stay runtime-agnostic (no Node or DOM-only APIs, no React).

## Conventions

- **TypeScript:** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. **No `any`** (lint error). Prefer `unknown` + zod parsing at boundaries.
- **Env:** all env vars go through a zod schema (`apps/api/src/config/env.ts`, `apps/web/src/env.ts`). Never read `process.env` elsewhere. Every new var must be added to the matching `.env.example`.
- **Naming:** files `kebab-case`; layer suffixes `*.routes.ts`, `*.service.ts`, `*.repository.ts`; tests `*.test.ts` next to the source; React components `PascalCase` exports; zod schemas `camelCaseSchema`, types `PascalCase`.
- **Imports:** `import { type X }` for types (lint enforced). Web uses `@/` alias.
- **Errors:** API errors use `apiErrorSchema` shape `{ error: { code, message } }`. Throw `HttpError` (or let `parseInput` throw) and `app.onError` renders it; never `c.json` an error by hand.
- **Security headers:** web headers live in `src/config/security-headers.ts`; a new third-party origin (script, image, API) must be added to the CSP there, and the e2e suite fails on CSP violations. API headers are configured in `createApp()`.
- **Privacy:** never persist or log raw IPs. Visitor identity is `VisitorHasher` output only.
- **Logging:** use `c.get("logger")` (request-scoped pino child with `reqId`), never `console.*` in the API.
- **Web + API failures:** API-backed widgets render `null` on any failure; forms show a calm fallback with the email address.
- **Commits:** Conventional Commits (`feat|fix|chore|docs|refactor|test|build|ci|perf(scope): subject`). Scopes: `web`, `api`, `shared`, `config`, `infra`, `ci`, `docs`. Small, single-purpose commits.
- **Formatting:** Prettier (`pnpm format`). CI fails on unformatted files.

## Commands

```bash
pnpm install                    # install all workspaces
pnpm dev:setup                  # once: apps/api/.env, Postgres in Docker, migrations
pnpm dev                        # web :3000 + api :4000
pnpm lint | typecheck | test | build
pnpm test:e2e                   # build web + Playwright smoke (CI: playwright install --with-deps chromium)
pnpm format                     # write; format:check in CI
pnpm --filter @devlog/api db:generate   # create migration from src/db/schema.ts
pnpm --filter @devlog/api db:migrate    # apply migrations (src/migrate.ts)
TEST_DATABASE_URL=postgres://... pnpm --filter @devlog/api test   # include Postgres integration tests
cp infra/.env.example infra/.env && docker compose -f infra/docker-compose.yml --env-file infra/.env up --build
```

Docker base images are overridable via `infra/.env`: `NODE_IMAGE=mirror.gcr.io/library/node:22-alpine`, `POSTGRES_IMAGE=mirror.gcr.io/library/postgres:16-alpine` (useful when Docker Hub rate-limits).

## How to continue (rules for future sessions)

1. Start by reading `PROGRESS.md`; pick the first unchecked item of the current phase. Do not start a later phase while the current one has open items unless asked.
2. Work on the designated branch; keep commits small and conventional.
3. Before every commit: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm format:check` must pass (plus `pnpm test:e2e` for web UI, routing or header changes). Never disable a lint rule or skip a test to get green; fix the cause.
4. New API feature checklist: schema in `@devlog/shared/schemas` -> repository -> service -> route -> client method in `@devlog/shared/client` -> `app.test.ts`-style test with fakes -> web consumer.
5. DB changes: edit `src/db/schema.ts`, run `db:generate`, commit the SQL in `apps/api/drizzle/`.
6. Update `PROGRESS.md` checkboxes in the same commit that completes the item. Update `docs/ARCHITECTURE.md` when boundaries change.
7. Pinned decisions: TypeScript stays on 5.9.x (TS 7 native compiler breaks the tooling chain); ESLint stays on 9.x until typescript-eslint and the Next plugin support 10.
