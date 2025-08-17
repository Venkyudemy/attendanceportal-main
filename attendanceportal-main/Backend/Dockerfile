# Stage 1: Install dependencies
FROM node:18-alpine AS base
WORKDIR /app

# Install curl for health checks, netcat for MongoDB checks, and set timezone
RUN apk add --no-cache curl tzdata netcat-openbsd && \
    cp /usr/share/zoneinfo/Asia/Kolkata /etc/localtime && \
    echo "Asia/Kolkata" > /etc/timezone

# Set environment variables
ENV NODE_ENV=production
ENV TZ=Asia/Kolkata
ENV PORT=5000

COPY package.json package-lock.json ./
RUN npm ci --only=production --legacy-peer-deps

# Stage 2: Copy source
COPY . .

# Create logs directory and set permissions
RUN mkdir -p /app/logs && \
    chmod +x /app/docker-start.sh

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application using the startup script
CMD ["/app/docker-start.sh"]
