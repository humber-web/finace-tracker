# Stage 1: Build
FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y python3 make g++ 
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2: Runtime
FROM node:20-slim

WORKDIR /app

# Install native dependencies for SQLite
RUN apt-get update && apt-get install -y libsqlite3-0 && rm -rf /var/lib/apt/lists/*

# Copy built Nuxt output
COPY --from=builder /app/.output ./.output

# FIX: Copy the better-sqlite3 binary manually so bindings are found
RUN mkdir -p /app/.output/server/node_modules/better-sqlite3
COPY --from=builder /app/node_modules/better-sqlite3 /app/.output/server/node_modules/better-sqlite3

# OPTIONAL: Copy drizzle-kit if you want to use 'push' on startup
# However, the best practice is to include it in your build
COPY --from=builder /app/node_modules/drizzle-kit /app/node_modules/drizzle-kit
COPY --from=builder /app/drizzle.config.ts /app/drizzle.config.ts
COPY --from=builder /app/server/database/schema.ts /app/server/database/schema.ts

ENV NODE_ENV=production
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0
# Point to your Dokploy Volume mount path
ENV NUXT_DB_PATH=/app/data/finance.db

EXPOSE 3000

# Script to run migrations then start the app
CMD npx drizzle-kit push && node .output/server/index.mjs