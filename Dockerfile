# ─────────────────────────────────────────────────────────────
# Stage 1: builder — install all deps + compile TS
# ─────────────────────────────────────────────────────────────
FROM node:22.22.3-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src/ src/

RUN npm run build

# Sanity check: migrations must be compiled
RUN ls dist/database/migrations || \
    (echo "❌ No compiled migrations in dist/database/migrations" && exit 1)


# ─────────────────────────────────────────────────────────────
# Stage 2: prod-deps — production-only node_modules
# ─────────────────────────────────────────────────────────────
FROM node:22.22.3-alpine AS prod-deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force


# ─────────────────────────────────────────────────────────────
# Stage 3: runner — minimal runtime
# ─────────────────────────────────────────────────────────────
FROM node:22.22.3-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nestjs -u 1001 -G nodejs

# Copy prod deps + built artifacts
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder   --chown=nestjs:nodejs /app/dist         ./dist
COPY --chown=nestjs:nodejs package.json ./

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/api/v1/health || exit 1

CMD ["node", "dist/main"]