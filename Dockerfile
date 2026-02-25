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

# 1. First, copy the .output and the node_modules from builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/server/database/schema.ts ./server/database/schema.ts

# 2. Now that node_modules exists, we can move the bindings into the Nitro server folder
RUN mkdir -p /app/.output/server/node_modules && \
    cp -r /app/node_modules/better-sqlite3 /app/.output/server/node_modules/ && \
    if [ -d "/app/node_modules/bindings" ]; then cp -r /app/node_modules/bindings /app/.output/server/node_modules/; fi

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV NUXT_DB_PATH=/app/data/finance.db

EXPOSE 3000

# JSON Arguments recommended for CMD (Fixes the warning)
# We use a shell script format to allow running two commands
CMD ["sh", "-c", "npx drizzle-kit push && node .output/server/index.mjs"]