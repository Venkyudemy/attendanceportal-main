# ---- Backend Dockerfile (Node.js + Express) ----
FROM node:18-alpine

WORKDIR /app

# Install dependencies for better caching
COPY package*.json ./
RUN npm ci --legacy-peer-deps --only=production

# Ensure bcryptjs is installed
RUN npm install bcryptjs --save

# Install curl and netcat for health checks and MongoDB connectivity
RUN apk add --no-cache curl netcat-openbsd

# Copy source code
COPY . .

# Set timezone for consistent date handling
ENV TZ=UTC

# Make startup script executable
RUN chmod +x docker-start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD curl -f http://localhost:5000/api/health || exit 1

EXPOSE 5000

# Use the startup script that ensures admin user creation
CMD ["./docker-start.sh"]
