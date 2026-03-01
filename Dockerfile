FROM node:20-bookworm-slim

# 1. Install system dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Install pnpm and configure hoisting
RUN npm install -g pnpm
RUN pnpm config set node-linker hoisted

# 3. Copy dependency files
COPY package.json pnpm-lock.yaml ./

# 4. Install all dependencies
RUN pnpm install

# 5. Copy the rest of the source code
COPY . .

# 6. Build the Nuxt application for production
# This pre-compiles everything so the login redirect is nearly instant
RUN pnpm build

# 7. Environment Variables
ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# 8. Start-up sequence
# Running the compiled output directly avoids the "nuxi dev" overhead
CMD ["node", ".output/server/index.mjs"]