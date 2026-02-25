# Stage 1: Build the Nuxt app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy the rest of the app files
COPY . .

# Build the Nuxt app
RUN pnpm build

# Stage 2: Run the app
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy built files from the builder stage
COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/finance.db /app/finance.db
COPY --from=builder /app/.env /app/.env

# Install production dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# Expose the port
EXPOSE 3001

# Start the app
CMD ["node", ".output/server/index.mjs"]