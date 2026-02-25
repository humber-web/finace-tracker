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

# Install native sqlite3 library
RUN apt-get update && apt-get install -y libsqlite3-0 && rm -rf /var/lib/apt/lists/*

# 1. Copy the built output and the minimum files needed for migrations
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/server/database/schema.ts ./server/database/schema.ts

# 2. Re-install only production dependencies in the runtime stage
# This ensures better-sqlite3 is compiled correctly for the runtime OS
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# 3. Create the symlink that Nitro needs to find the binary
RUN mkdir -p /app/.output/server/node_modules && \
    ln -s /app/node_modules/better-sqlite3 /app/.output/server/node_modules/better-sqlite3

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV NUXT_DB_PATH=/app/data/finance.db

EXPOSE 3000

# Push changes then start
CMD ["sh", "-c", "npx drizzle-kit push && node .output/server/index.mjs"]