# Backend Dockerfile - Optimized Production Build with Daily Reset
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV TZ=UTC

# Install curl for health checks, timezone data, and cleanup
RUN apk add --no-cache curl tzdata && \
    rm -rf /var/cache/apk/*

# Copy package files first for better caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --cache /tmp/.npm && \
    npm cache clean --force

# Copy application source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Enhanced health check with daily reset status
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health && \
      curl -f http://localhost:5000/api/employee/reset-status || exit 1

# Start the application with optimizations and daily reset functionality
CMD ["node", "--max-old-space-size=2048", "index.js"]
