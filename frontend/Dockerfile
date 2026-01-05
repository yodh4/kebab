# Build stage
FROM oven/bun:1.1-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./
COPY packages/shared/package.json ./packages/shared/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY packages ./packages
COPY frontend ./frontend

# Build frontend
WORKDIR /app/frontend
RUN bun run build

# Production stage with Nginx
FROM nginx:alpine AS runner

# Copy built files
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
