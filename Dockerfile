# ─── Stage 1: Install all dependencies ───────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ─── Stage 2: Build Next.js app ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NOTE: output: 'standalone' is NOT used for admin-panel because Next.js 16.0.8
# has a bug where standalone output fails with ENOENT on middleware.js.nft.json
# when Edge Runtime middleware (middleware.ts) is present. The runner stage uses
# `next start` instead, which requires the full production node_modules.
#
# NEXTAUTH_URL and NEXTAUTH_SECRET are passed as build args for NextAuth
# initialization checks that run at module evaluation time.
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Stage 3: Production dependencies only ───────────────────────────────────
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ─── Stage 4: Runtime image ──────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# Copy built output and production node_modules
# (not standalone — uses `next start` instead due to Next.js 16 standalone bug)
COPY --from=builder    --chown=nextjs:nodejs /app/.next        ./.next
COPY --from=builder    --chown=nextjs:nodejs /app/public       ./public
COPY --from=prod-deps  --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder    --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder    --chown=nextjs:nodejs /app/next.config.mjs ./next.config.mjs

USER nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3001/ || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node_modules/.bin/next", "start", "-p", "3001"]
