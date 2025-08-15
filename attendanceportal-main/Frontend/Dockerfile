# Multi-stage Dockerfile for React Frontend
# Stage 1: Build stage - Install dependencies and build the React app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Production stage - Serve with nginx
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create nginx directories and set permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /tmp && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /usr/share/nginx/html /tmp && \
    chmod -R 755 /var/cache/nginx /var/log/nginx /usr/share/nginx/html

# Switch to nginx user
USER nginx

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
