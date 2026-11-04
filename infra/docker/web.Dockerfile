# syntax=docker/dockerfile:1.7
# Build context: repo root.  docker build -f infra/docker/web.Dockerfile .
# Override to use a registry mirror, e.g. mirror.gcr.io/library/node:20-alpine
ARG NODE_IMAGE=node:20-alpine

FROM ${NODE_IMAGE} AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH COREPACK_ENABLE_DOWNLOAD_PROMPT=0 NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /repo

FROM base AS pruner
COPY . .
RUN pnpm dlx turbo@^2 prune @devlog/web --docker

FROM base AS builder
COPY --from=pruner /repo/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=pruner /repo/out/full/ .
# Public vars are inlined at build time.
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN pnpm turbo run build --filter=@devlog/web

# Standalone output: no node_modules install in the runtime image.
FROM ${NODE_IMAGE} AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=builder --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=node:node /repo/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/" >/dev/null || exit 1
CMD ["node", "apps/web/server.js"]
