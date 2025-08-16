# Stage 1: Build the application
FROM node:16-alpine as builder

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Stage 2: Run the application
FROM node:16-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built node_modules and application from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Create directory for logs
RUN mkdir -p /app/logs

# Expose the application port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=60s \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "index.js"]
