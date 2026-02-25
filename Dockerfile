FROM node:20-bookworm-slim

# 1. Install basic SSL/system dependencies for PostgreSQL
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Install pnpm
RUN npm install -g pnpm

# 3. Configure pnpm to use "hoisted" node_modules
# This ensures that binaries like drizzle-kit are easily accessible
RUN pnpm config set node-linker hoisted

# 4. Copy dependency files first for better caching
COPY package.json pnpm-lock.yaml ./

# 5. Install dependencies 
# (No build-essentials needed for pure Postgres 'pg' driver)
RUN pnpm install

# 6. Copy the rest of the source code
COPY . .

# 7. Environment Variables
ENV NODE_ENV=development
ENV NITRO_HOST=0.0.0.0

EXPOSE 3000

# 8. Start-up sequence
# We attempt the push, then start Nuxt. 
# If it fails, we keep the container alive for 1 hour so you can read the logs.
CMD ["sh", "-c", "npx drizzle-kit push && npx nuxi dev --host 0.0.0.0 || (echo 'DEPLOYMENT FAILED: Check logs below' && sleep 3600)"]