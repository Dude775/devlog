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

- [ ] Migrations workflow (`drizzle/`), migrate-on-deploy job in compose
- [ ] Post views counter: `POST /posts/:slug/views`, `GET /posts/:slug/stats`
- [ ] Projects endpoint (GitHub repos metadata, cached)
- [ ] Contact/newsletter endpoint with zod validation and spam protection
- [ ] Rate limiting, request id propagation, structured JSON logging (pino)
- [ ] Integration tests against real Postgres (testcontainers or CI service)
- [ ] OpenAPI spec generated from zod (`@hono/zod-openapi`)

## Phase 4: Content + SEO

- [ ] Post page rendering velite MDX, reading time, TOC, tags pages
- [ ] Metadata API: per-page OG/Twitter, canonical URLs, JSON-LD (`BlogPosting`, `Person`)
- [ ] `sitemap.xml`, `robots.txt`, RSS/Atom feed
- [ ] Dynamic OG images (`next/og`)
- [ ] First 3 real posts + project case studies

## Phase 5: Hardening + docs

- [ ] Security headers/CSP for web, CORS review, dependency audit + Renovate/Dependabot
- [ ] Image scanning (Trivy) and SBOM in CI; push images to GHCR on `main`
- [ ] Deployment target documented (e.g. AWS ECS Fargate or Lightsail) with IaC (Terraform)
- [ ] Observability: health/readiness probes wired, uptime check, error tracking
- [ ] Backup/restore runbook for Postgres
- [ ] README with badges, screenshots, architecture summary; ADRs in `docs/adr/`
