# syntax=docker/dockerfile:1.7
# Build context: repo root.  docker build -f infra/docker/api.Dockerfile .
# Override to use a registry mirror, e.g. mirror.gcr.io/library/node:20-alpine
ARG NODE_IMAGE=node:20-alpine

FROM ${NODE_IMAGE} AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo

# 1. Prune the monorepo to only what @devlog/api needs (better layer caching).
FROM base AS pruner
COPY . .
RUN pnpm dlx turbo@^2 prune @devlog/api --docker

# 2. Install from the pruned lockfile, then build and extract prod deps.
FROM base AS builder
COPY --from=pruner /repo/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=pruner /repo/out/full/ .
RUN pnpm turbo run build --filter=@devlog/api \
 && pnpm --filter=@devlog/api deploy --prod --legacy /prod/api

# 3. Minimal runtime, non-root.
FROM ${NODE_IMAGE} AS runner
ENV NODE_ENV=production PORT=4000 HOST=0.0.0.0
WORKDIR /app
COPY --from=builder --chown=node:node /prod/api ./
USER node
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" >/dev/null || exit 1
CMD ["node", "--enable-source-maps", "dist/index.js"]
