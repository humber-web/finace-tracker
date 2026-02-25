# Stage 1: Build the Nuxt app
FROM node:20-alpine AS builder

# Enable pnpm directly via corepack (faster than npm install -g pnpm)
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDeps for the build)
RUN pnpm install --frozen-lockfile

# Copy the rest of the app files
COPY . .

# Build the Nuxt app (generates the .output folder)
RUN pnpm build

# Stage 2: Run the app
FROM node:20-alpine

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Copy built files from the builder stage
COPY --from=builder /app/.output /app/.output

# Expose the Nitro port
EXPOSE 3000

# Start the app using the Nitro server entry point
CMD ["node", ".output/server/index.mjs"]