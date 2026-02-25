# Stage 1: Build
FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y python3 make g++ 
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY pnpm-lock.yaml package.json ./
# Install ALL deps for building and migration support
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2: Runtime
FROM node:20-slim
WORKDIR /app

# Install native sqlite3 library
RUN apt-get update && apt-get install -y libsqlite3-0 && rm -rf /var/lib/apt/lists/*

# 1. Copy the build output
COPY --from=builder /app/.output ./.output

# 2. Copy EVERYTHING needed for migrations
# We copy node_modules here because drizzle-kit needs the full deps to read the config
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/server/database/schema.ts ./server/database/schema.ts

# 3. FIX: Create the symlink for Nitro so better-sqlite3 is found
RUN mkdir -p /app/.output/server/node_modules && \
    ln -s /app/node_modules/better-sqlite3 /app/.output/server/node_modules/better-sqlite3 && \
    ln -s /app/node_modules/bindings /app/.output/server/node_modules/bindings

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV NUXT_DB_PATH=/app/data/finance.db

EXPOSE 3000

# Use local drizzle-kit binary to avoid npx download/isolation issues
CMD ["sh", "-c", "./node_modules/.bin/drizzle-kit push && node .output/server/index.mjs"]