# Backend Dockerfile with production stage
FROM node:18-alpine AS production
WORKDIR /app

# Install curl and netcat for health checks and connectivity testing
RUN apk add --no-cache curl netcat-openbsd

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --cache /tmp/.npm

# Copy source code
COPY . .

# Make startup script executable
RUN chmod +x start.sh

# Expose port 5000
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application with the startup script
CMD ["./start.sh"]
