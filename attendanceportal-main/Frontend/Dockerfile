# Multi-stage build for production-ready React application
FROM node:18-alpine AS deps

# Install dependencies for building
RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --audit=false --fund=false && \
    npm cache clean --force

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:1.25-alpine AS production

# Install security updates and curl for health checks
RUN apk add --no-cache \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create nginx user for security
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# Copy built application
WORKDIR /usr/share/nginx/html
RUN rm -rf ./* && \
    cp -r /app/build/* . && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Expose port
EXPOSE 80

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
