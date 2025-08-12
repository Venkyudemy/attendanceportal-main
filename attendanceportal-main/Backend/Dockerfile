# Backend Dockerfile - Optimized Production Build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for potential build tools)
RUN npm ci --cache /tmp/.npm && \
    npm cache clean --force

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Install curl for health checks and cleanup
RUN apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --cache /tmp/.npm && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application with optimizations
CMD ["node", "--max-old-space-size=2048", "index.js"]
