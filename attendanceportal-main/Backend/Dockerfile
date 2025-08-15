# Backend Dockerfile - Optimized Node.js App with Enhanced Security
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=5000
ENV TZ=Asia/Kolkata
ENV NODE_OPTIONS="--max-old-space-size=2048 --enable-source-maps"

# Install system dependencies for security and health checks
RUN apk add --no-cache \
    curl \
    tzdata \
    dumb-init && \
    apk upgrade --no-cache && \
    rm -rf /var/cache/apk/*

# Copy package files first for better layer caching
COPY package*.json ./

# Install only production dependencies with security audit
RUN npm ci --only=production --cache /tmp/.npm && \
    npm audit fix --audit-level=moderate || true && \
    npm cache clean --force

# Copy application source code
COPY . .

# Create non-root user for enhanced security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Create necessary directories and set proper permissions
RUN mkdir -p /app/logs /app/uploads /tmp && \
    chown -R nodejs:nodejs /app && \
    chmod -R 755 /app && \
    chmod 755 /app/logs /app/uploads /tmp

# Switch to non-root user for security
USER nodejs

# Expose port
EXPOSE 5000

# Health check for backend with enhanced monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application with optimizations
CMD ["node", "index.js"]
