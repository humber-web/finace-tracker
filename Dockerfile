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

# 1. Copy the build and ALL node_modules
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/server/database/schema.ts ./server/database/schema.ts

# 2. THE CRITICAL LINK: Link the root node_modules into the Nitro server folder
# This makes /app/.output/server/node_modules point to /app/node_modules
RUN mkdir -p /app/.output/server && \
    ln -s /app/node_modules /app/.output/server/node_modules

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV NUXT_DB_PATH=/app/data/finance.db

EXPOSE 3000

# Push changes then start the app
CMD ["sh", "-c", "./node_modules/.bin/drizzle-kit push && node .output/server/index.mjs"]