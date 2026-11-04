# Progress

Legend: `[x]` done, `[ ]` open. Update in the same commit that completes an item.

## Phase 1: Scaffold

- [x] pnpm workspaces + Turborepo pipeline (`build`, `lint`, `typecheck`, `test`, `dev`)
- [x] `packages/config`: ESLint 9 flat config (strict type-checked, no `any`), tsconfig presets, Prettier
- [x] `packages/shared`: zod health schemas, typed API client with runtime validation + tests
- [x] `apps/api`: Hono app, layered `routes -> services -> repositories -> db`, zod env, Drizzle + postgres-js
- [x] `apps/api`: `GET /health` -> `{ status, version, uptime }`, `GET /health/ready` (DB check, 503 when down) + tests
- [x] `apps/web`: Next.js 15 App Router, Tailwind v4, velite MDX collection, "Hello" home page
- [x] `apps/web`: `/status` page consuming api through `@devlog/shared/client` (server-only)
- [x] `infra/`: multi-stage non-root Dockerfiles (turbo prune), compose stack (postgres + api + web), `.env.example` files
- [x] CI: format check, per-app matrix lint/typecheck/test/build with turbo cache, Docker build check
- [x] Docs: `CLAUDE.md`, `PROGRESS.md`, `docs/ARCHITECTURE.md`
- [x] Verified locally: install, lint, typecheck, test, build green; compose stack healthy end to end

## Phase 2: Frontend design

Direction: "terminal meets editorial". Dark-first, cyan `#22d3ee` accent, grid + noise backdrop. Inter / JetBrains Mono / Heebo.
Portfolio (https://system-portfolio.vercel.app) owns project detail; this site links to it and to repos (no `/projects/[slug]`).

- [x] Design tokens (CSS vars mapped via Tailwind v4 `@theme inline`), fluid type scale, dark/light toggle without FOUC (next-themes)
- [x] Design system `src/components/ui`: Button, Card, Badge, Tag, Container, Section, Prose, CodeBlock (shiki dual theme, filename header, copy)
- [x] Layout shell: sticky glass header (Portfolio ↗ link), mobile menu, footer (GitHub/LinkedIn/email), skip link, grid/noise backdrop
- [x] Content model: velite `posts` (`category`, `project`, `dir`, `featured`, toc, reading time) + `projects` (YAML); dangling `project` refs fail the build
- [x] Pages: `/` (terminal hero, featured posts/projects, categories), `/blog` (category + tag filters synced to URL), `/blog/[slug]` (progress bar, auto ToC, reading time, prev/next, related project), `/projects`, `/categories/[category]`, `/about`, 404
- [x] Cmd/Ctrl+K command palette (cmdk): posts, projects, repos, pages, categories, theme action
- [x] RTL posts (`dir: rtl`) render right-to-left with Heebo; code blocks stay LTR
- [x] Motion: framer-motion (LazyMotion) section reveals + page transitions, `MotionConfig reducedMotion="user"`; no entrance on first paint (LCP)
- [x] MDX components: CodeBlock, Callout, smart links
- [x] Placeholder content: 2 posts (EN + HE/RTL), 1 project (devlog)
- [ ] Accessibility audit (axe) + Lighthouse >= 95 on all categories (not yet measured)
- [ ] Component tests (Vitest + Testing Library) and Playwright smoke test

## Phase 3: Backend features

- [x] Drizzle schema + committed migration (`drizzle/0000_init.sql`): `post_views`, `post_view_visitors`, `reactions`, `reaction_visitors`, `subscribers`, `contact_messages`
- [x] Migrate-on-deploy: one-shot `migrate` service in compose (`dist/migrate.js`); `api` waits for `service_completed_successfully`
- [x] `GET/POST /v1/views/:slug` with unique counting: `HMAC-SHA256(VIEW_HASH_SALT, day|ip|ua)`, raw IP never stored or logged
- [x] `GET/POST /v1/reactions/:slug` (`fire`, `brain`, `rocket`), one per type per visitor per day
- [x] `POST /v1/subscribe`, `POST /v1/contact`: zod from `@devlog/shared`, honeypot, 16 KB body cap, no email enumeration
- [x] `GET /v1/stats` protected by `x-admin-api-key` (`ADMIN_API_KEY`, timing-safe compare; disabled when unset)
- [x] Consistent `{ error: { code, message } }` via `HttpError` + `app.onError`
- [x] Per-IP rate limiting with pluggable `RateLimitStore` (in-memory, bounded), CORS restricted to `WEB_ORIGIN`
- [x] pino structured logging bound to request id (`X-Request-Id` reused or generated), graceful shutdown (drain, close DB + limiter, 10 s hard timeout)
- [x] Typed client methods in `@devlog/shared/client` (`views`, `reactions`, `subscribe`, `contact`, `stats`) with API error codes
- [x] Web: view counter + reaction bar on post page, newsletter form in footer, `/contact` page; widgets render nothing when the API is down
- [x] Tests: service unit tests, route tests via `app.request()` with in-memory fakes, Postgres integration tests for repositories (CI service container)
- [x] Verified: `docker compose up` runs postgres -> migrate -> api -> web; browser e2e (views, reactions, newsletter, contact) and API-down degradation checked
- [ ] Double opt-in for subscribers (confirmation email + token; `confirmed` column is ready)
- [ ] Prune job for `*_visitors` ledgers older than 2 days (indexed on `day`)
- [ ] Redis `RateLimitStore` when running more than one api instance
- [ ] Projects endpoint (GitHub repos metadata, cached)
- [ ] OpenAPI spec generated from zod (`@hono/zod-openapi`)

## Phase 4: Content + SEO

- [x] Content model (velite): posts `{title, slug, date, updated?, category, tags, summary, cover?, dir, draft, featured, project?}`, projects `{title, slug, stack[], repo, portfolio_url, live?, status, featured, summary}`
- [x] Referential integrity: unknown `project:` slug on any post (drafts included) fails `velite build` via `prepare` hook
- [x] Categories: `devops`, `cloud-aws`, `kubernetes`, `ci-cd`, `iac-terraform`, `observability`, `osint-research`, `career`, `build-log`
- [x] Post page rendering velite MDX with reading time + TOC; fenced ` ```mermaid ` blocks rendered client-side (lazy `mermaid`, theme from tokens, source fallback)
- [x] Starter content (placeholders removed): "From ERP to DevOps" (career), "Building this blog" (build-log, project devlog, mermaid), Hebrew RTL OSINT methodology skeleton (osint-research)
- [x] Projects: only confirmed public repos (`devlog`, `system-portfolio`, `genspark-conversation-toolbox`); GitHub user listing API blocked from CI sandbox, so no auto-discovery
- [x] Metadata API via `src/lib/seo.ts`: per-page title/description, canonical, OG + Twitter, RSS discovery link; `/status` noindex
- [x] JSON-LD: site-wide `WebSite` + `Person` (`sameAs` GitHub, LinkedIn, portfolio), `BlogPosting` per post
- [x] `sitemap.xml` (posts with `lastModified`, static pages, non-empty categories), `robots.txt`, RSS 2.0 `/rss.xml` (all static)
- [x] Dynamic OG images (`next/og`): site default + per post, terminal frame in site design, local fonts (Inter, JetBrains Mono, Heebo), RTL titles laid out word-by-word (satori has no bidi)
- [x] Drafts hidden in production (pages, sitemap, RSS, OG), visible in `next dev`; verified both
- [ ] Tags pages (`/tags/[tag]`); today tags filter `/blog?tag=`
- [ ] Fill the OSINT methodology post (headings only) and add more posts
- [ ] Verify stack/status for `system-portfolio` and `genspark-conversation-toolbox` from their repos (currently minimal)
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production domain at build time (canonical, sitemap, RSS, JSON-LD use it)

## Phase 5: Hardening + docs

- [ ] Security headers/CSP for web, CORS review, dependency audit + Renovate/Dependabot
- [ ] Image scanning (Trivy) and SBOM in CI; push images to GHCR on `main`
- [ ] Deployment target documented (e.g. AWS ECS Fargate or Lightsail) with IaC (Terraform)
- [ ] Observability: health/readiness probes wired, uptime check, error tracking
- [ ] Backup/restore runbook for Postgres
- [ ] README with badges, screenshots, architecture summary; ADRs in `docs/adr/`
