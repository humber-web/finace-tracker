# Stage 1: Build
FROM node:20-slim AS builder

# Install build tools required to compile better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ 

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build the Nuxt application
RUN pnpm build

# Stage 2: Runtime
FROM node:20-slim AS runtime

# Install libsqlite3 so the system has the library available
RUN apt-get update && apt-get install -y libsqlite3-0 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the build output
COPY --from=builder /app/.output ./.output

# Copy your database file (optional - see volume note below)
# COPY --from=builder /app/finance.db ./finance.db

ENV NODE_ENV=production
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0

EXPOSE 3000

# Run the app
CMD ["node", ".output/server/index.mjs"]