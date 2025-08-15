# Frontend Dockerfile - Optimized React Build with Enhanced Security
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Set environment variables for build optimization
ENV NODE_ENV=production
ENV CI=false
ENV GENERATE_SOURCEMAP=false
ENV REACT_APP_API_URL=/api
ENV REACT_APP_VERSION=1.0.0

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies with clean npm cache and security audit
RUN npm ci --only=production=false --cache /tmp/.npm && \
    npm audit fix --audit-level=moderate || true && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the React app with production optimizations
RUN npm run build && \
    npm prune --production

# Production stage with nginx
FROM nginx:alpine AS production

# Install curl for health checks and security updates
RUN apk add --no-cache curl && \
    apk upgrade --no-cache && \
    rm -rf /var/cache/apk/*

# Copy built app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create necessary directories and set proper permissions for nginx
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/scgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/log/nginx \
    /tmp/nginx && \
    touch /tmp/nginx.pid && \
    chown -R nginx:nginx /var/cache/nginx \
    /var/log/nginx \
    /usr/share/nginx/html \
    /etc/nginx/conf.d \
    /tmp/nginx.pid \
    /tmp/nginx && \
    chmod -R 755 /var/cache/nginx \
    /var/log/nginx \
    /usr/share/nginx/html && \
    chmod 644 /etc/nginx/conf.d/default.conf \
    /tmp/nginx.pid && \
    chmod 755 /tmp/nginx

# Switch to nginx user for security
USER nginx

# Expose port 80
EXPOSE 80

# Health check for frontend with enhanced monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Start nginx with optimized settings
CMD ["nginx", "-g", "daemon off;"]
