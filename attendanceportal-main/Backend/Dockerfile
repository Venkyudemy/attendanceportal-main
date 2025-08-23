# ---- Backend Dockerfile (Node.js + Express) ----
FROM node:18-alpine

WORKDIR /app

# Install system dependencies for better functionality
RUN apk add --no-cache \
    curl \
    netcat-openbsd \
    bash \
    git \
    python3 \
    make \
    g++

# Install dependencies for better caching
COPY package*.json ./
RUN npm ci --legacy-peer-deps --only=production --silent

# Copy source code
COPY . .

# Set timezone for consistent date handling
ENV TZ=UTC
ENV NODE_ENV=production

# Make startup script executable and ensure proper line endings
RUN chmod +x docker-start.sh && \
    chmod +x initAdmin.js && \
    dos2unix docker-start.sh 2>/dev/null || true && \
    dos2unix initAdmin.js 2>/dev/null || true

# Create logs directory and set permissions
RUN mkdir -p /app/logs && \
    chmod 755 /app/logs && \
    chown -R node:node /app

# Switch to non-root user for security
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD curl -f http://localhost:5000/api/health || exit 1

EXPOSE 5000

# Use the startup script that ensures admin user creation
CMD ["./docker-start.sh"]
