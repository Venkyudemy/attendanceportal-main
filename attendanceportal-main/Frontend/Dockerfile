# Frontend Dockerfile - Optimized React Build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Set environment variables for build
ENV NODE_ENV=production
ENV CI=false
ENV GENERATE_SOURCEMAP=false
ENV REACT_APP_API_URL=/api

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with clean npm cache
RUN npm ci --only=production=false --cache /tmp/.npm && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the React app with optimizations
RUN npm run build && \
    npm prune --production

# Production stage with nginx
FROM nginx:alpine AS production

# Install curl for health checks and cleanup
RUN apk add --no-cache curl && \
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
    /var/log/nginx && \
    touch /tmp/nginx.pid && \
    chown -R nginx:nginx /var/cache/nginx \
    /var/log/nginx \
    /usr/share/nginx/html \
    /etc/nginx/conf.d \
    /tmp/nginx.pid && \
    chmod -R 755 /var/cache/nginx \
    /var/log/nginx \
    /usr/share/nginx/html && \
    chmod 644 /etc/nginx/conf.d/default.conf \
    /tmp/nginx.pid

# Switch to nginx user (nginx user already exists in nginx:alpine)
USER nginx

# Expose port 80
EXPOSE 80

# Health check for frontend
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
