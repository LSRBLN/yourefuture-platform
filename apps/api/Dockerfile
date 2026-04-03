# Build stage
FROM node:20-alpine AS builder

WORKDIR /build

# Install pnpm
RUN npm install -g pnpm@9

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build API
RUN pnpm --filter @trustshield/api build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm in production
RUN npm install -g pnpm@9

# Copy built app from builder
COPY --from=builder /build/apps/api/dist ./dist
COPY --from=builder /build/apps/api/package.json ./
COPY --from=builder /build/packages ./packages

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/health', (res) => { if (res.statusCode !== 200) throw new Error(res.statusCode) })"

EXPOSE 4000

CMD ["node", "dist/nest/main.js"]
