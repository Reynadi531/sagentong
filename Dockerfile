# Stage 1: Pruner - Use Node Alpine to prune the monorepo (most reliable for turbo)
FROM node:20-alpine AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune web --docker

# Stage 2: Builder - Install dependencies and build the app using Bun Alpine
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Copy pruned locks and package.json
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock .
RUN bun install --frozen-lockfile

# Copy pruned source code
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

# Build the project
# SKIP_ENV_VALIDATION=1 ensures the build doesn't fail due to missing env vars
# We provide dummy values to satisfy code that initializes with these vars at top-level
ENV SKIP_ENV_VALIDATION=1
ENV DATABASE_URL=dummy
ENV BETTER_AUTH_SECRET=a_very_long_dummy_secret_for_build_purposes_only
ENV BETTER_AUTH_URL=http://localhost:3000
ENV CORS_ORIGIN=http://localhost:3000
ENV SMTP_HOST=localhost
ENV SMTP_PORT=1025
ENV SMTP_USER=dummy
ENV SMTP_PASS=dummy
ENV SMTP_FROM=dummy
ENV NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# Perform the build
RUN bunx turbo build --filter=web...

# Stage 3: Runner - Final production image using Bun Alpine
FROM oven/bun:1-alpine AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 bunjs
RUN adduser --system --uid 1001 bunjs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy essential files from builder
# Standalone mode in monorepo puts the entrypoint in /apps/web/server.js
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Set permissions
RUN chown -R bunjs:bunjs /app

USER bunjs

EXPOSE 3000

# Use Bun to run the standalone server
CMD ["bun", "apps/web/server.js"]
