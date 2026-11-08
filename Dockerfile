# syntax=docker/dockerfile:1.7
# Tek Dockerfile, üç hedef:  docker build --target api|admin|web .
# (compose.prod.yaml bunları otomatik kullanır.)

ARG NODE_IMAGE=node:24-bookworm-slim

# ───────────── Ortak: bağımlılıklar ─────────────
FROM ${NODE_IMAGE} AS deps
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=1 NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/admin/package.json apps/admin/
COPY apps/web/package.json apps/web/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ───────────── API derleme ─────────────
FROM deps AS build-api
COPY apps/api apps/api
RUN pnpm --filter api exec prisma generate \
 && pnpm --filter api build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter api deploy --prod --legacy /out \
 && rm -rf /out/test /out/storage /out/*.tsbuildinfo

# ───────────── Next derlemeleri ─────────────
FROM deps AS build-admin
COPY apps/admin apps/admin
RUN pnpm --filter admin build

FROM deps AS build-web
COPY apps/web apps/web
RUN pnpm --filter web build

# ───────────── Çalışma imajları (root olmayan kullanıcı) ─────────────
FROM ${NODE_IMAGE} AS runtime
RUN apt-get update \
 && apt-get install -y --no-install-recommends tini openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
ENTRYPOINT ["/usr/bin/tini", "--"]

FROM runtime AS api
COPY --from=build-api --chown=node:node /out ./
RUN mkdir -p storage/media && chown -R node:node storage
USER node
ENV PORT=4000
EXPOSE 4000
# Migration: docker compose run --rm migrate  (aynı imaj, farklı komut)
CMD ["node", "dist/main.js"]

FROM runtime AS admin
COPY --from=build-admin --chown=node:node /repo/apps/admin/.next/standalone ./
COPY --from=build-admin --chown=node:node /repo/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=build-admin --chown=node:node /repo/apps/admin/public ./apps/admin/public
USER node
ENV PORT=3001 HOSTNAME=0.0.0.0
EXPOSE 3001
CMD ["node", "apps/admin/server.js"]

FROM runtime AS web
COPY --from=build-web --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build-web --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build-web --chown=node:node /repo/apps/web/public ./apps/web/public
USER node
ENV PORT=3000 HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
