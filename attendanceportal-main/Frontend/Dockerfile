# Multi-stage Dockerfile for React Frontend
# Stage 1 - Build React app
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --cache /tmp/.npm

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Stage 2 - Production (serve with nginx)
FROM nginx:alpine AS production

# Install curl for health checks and connectivity testing
RUN apk add --no-cache curl

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy startup script
COPY start.sh /start.sh

# Make startup script executable
RUN chmod +x /start.sh

# Create necessary directories and set permissions
RUN mkdir -p /var/log/nginx /var/cache/nginx /tmp/nginx && \
    chown -R nginx:nginx /var/log/nginx /var/cache/nginx /tmp/nginx /usr/share/nginx/html && \
    chmod -R 755 /var/log/nginx /var/cache/nginx /tmp/nginx

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Start the application with the startup script
CMD ["/start.sh"]
