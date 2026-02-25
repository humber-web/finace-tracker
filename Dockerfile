FROM node:20-bookworm-slim

# Use 'slim' to save space, but we still need basic SSL for Postgres connections
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN npm install -g pnpm
RUN pnpm config set node-linker hoisted

COPY package.json pnpm-lock.yaml ./

# No more python/g++/make needed for standard Postgres setups!
RUN pnpm install

COPY . .

ENV NODE_ENV=development
ENV NITRO_HOST=0.0.0.0

EXPOSE 3000

