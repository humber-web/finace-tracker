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

# Install runtime library for SQLite
RUN apt-get update && apt-get install -y libsqlite3-0 && rm -rf /var/lib/apt/lists/*

# Copy built Nuxt output
COPY --from=builder /app/.output ./.output
# Copy all node_modules so drizzle-kit and native bindings are available
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/server/database/schema.ts ./server/database/schema.ts

# --- THE FIX ---
# Create the directory Nitro is looking in and copy the compiled library there
RUN mkdir -p /app/.output/server/node_modules && \
    cp -r /app/node_modules/better-sqlite3 /app/.output/server/node_modules/ && \
    cp -r /app/node_modules/bindings /app/.output/server/node_modules/
# ----------------

ENV NODE_ENV=production
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0
# Matches your Dokploy Volume
ENV NUXT_DB_PATH=/app/data/finance.db

EXPOSE 3000

# Push schema changes then start
CMD npx drizzle-kit push && node .output/server/index.mjs