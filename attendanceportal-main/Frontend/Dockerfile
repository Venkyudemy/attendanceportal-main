# Multi-stage Dockerfile for React Frontend

# Stage 1: Build stage - Install dependencies and build the React app
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production=false
COPY . .
RUN npm run build

# Stage 2: Production stage - Serve with nginx
FROM nginx:alpine AS production
# Install curl for health checks
RUN apk add --no-cache curl

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

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

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
