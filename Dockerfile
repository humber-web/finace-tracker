# Stage 1: Build
FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y python3 make g++ 
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY pnpm-lock.yaml package.json ./
# Install ALL dependencies (including drizzle-kit)
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Stage 2: Runtime
FROM node:20-slim
WORKDIR /app

# Install native library for SQLite
RUN apt-get update && apt-get install -y libsqlite3-0 && rm -rf /var/lib/apt/lists/*

# Copy built Nuxt output
COPY --from=builder /app/.output ./.output

# FIX 1: Copy better-sqlite3 binary specifically
RUN mkdir -p /app/.output/server/node_modules/better-sqlite3
COPY --from=builder /app/node_modules/better-sqlite3 /app/.output/server/node_modules/better-sqlite3

# FIX 2: Copy drizzle-kit and its dependencies so 'npx drizzle-kit' works
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/server/database/schema.ts ./server/database/schema.ts

ENV NODE_ENV=production
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0
# Ensure this matches your Dokploy Volume mount
ENV NUXT_DB_PATH=/app/data/finance.db

EXPOSE 3000

# Push schema changes (creates file if missing) then start
CMD npx drizzle-kit push && node .output/server/index.mjs