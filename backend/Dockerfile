FROM oven/bun:1.1-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lockb* ./
COPY packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/
RUN bun install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY packages ./packages
COPY backend ./backend
WORKDIR /app/backend
RUN bun run build

# Production
FROM oven/bun:1.1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 4000

CMD ["bun", "run", "start"]
