# Build stage
FROM node:20-alpine AS builder

WORKDIR /build

# Install pnpm
RUN npm install -g pnpm@9

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/web ./apps/web

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build Web app
RUN pnpm --filter @trustshield/web build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm in production
RUN npm install -g pnpm@9

# Copy built app from builder
COPY --from=builder /build/apps/web/.next ./.next
COPY --from=builder /build/apps/web/public ./public
COPY --from=builder /build/apps/web/package.json ./
COPY --from=builder /build/packages ./packages

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000

CMD ["pnpm", "start"]
