# ---- Backend Dockerfile (Node.js + Express) ----
FROM node:18-alpine

WORKDIR /app

# Install dependencies for better caching
COPY package*.json ./
RUN npm ci --legacy-peer-deps --only=production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy source code
COPY . .

# Set timezone for consistent date handling
ENV TZ=Asia/Kolkata

# Create scripts directory if it doesn't exist
RUN mkdir -p scripts

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD curl -f http://localhost:5000/api/health || exit 1

EXPOSE 5000

CMD ["npm", "start"]
