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

ENV BETTER_AUTH_SECRET=your_better_auth_secret
ENV BETTER_AUTH_URL=http://localhost:3000
ENV CORS_ORIGIN=http://localhost:3000

ENV DATABASE_URL=postgresql://user:password@localhost:5432/db

ENV SUPERADMIN_EMAIL=admin@example.com
ENV SUPERADMIN_PASSWORD=password

ENV SMTP_USER=user@example.com
ENV SMTP_PASS=password
ENV SMTP_HOST=smtp.example.com
ENV SMTP_PORT=587
ENV SMTP_FROM=noreply@example.com

ENV MINIO_ENDPOINT=http://localhost:9000
ENV MINIO_ACCESS_KEY=minio_access_key
ENV MINIO_SECRET_KEY=minio_secret_key
ENV MINIO_BUCKET=bucket_name

# Perform the build
RUN bun turbo build

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
