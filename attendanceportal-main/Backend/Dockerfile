# ---- Backend Dockerfile (Node.js + Express) ----
FROM node:18-alpine

WORKDIR /app

# Install system dependencies for better functionality
RUN apk add --no-cache \
    curl \
    netcat-openbsd \
    bash \
    git

# Install dependencies for better caching
COPY package*.json ./
RUN npm ci --legacy-peer-deps --only=production

# Copy source code
COPY . .

# Set timezone for consistent date handling
ENV TZ=UTC

# Make startup script executable and ensure proper line endings
RUN chmod +x docker-start.sh && \
    chmod +x initAdmin.js && \
    dos2unix docker-start.sh 2>/dev/null || true && \
    dos2unix initAdmin.js 2>/dev/null || true

# Create logs directory
RUN mkdir -p /app/logs && chmod 755 /app/logs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD curl -f http://localhost:5000/api/health || exit 1

EXPOSE 5000

# Use the startup script that ensures admin user creation
CMD ["./docker-start.sh"]
