# ---- Backend Dockerfile (Node.js + Express) ----
FROM node:18-alpine

WORKDIR /app

# Install dependencies for better caching
COPY package*.json ./
RUN npm ci --legacy-peer-deps --only=production

# Copy source code
COPY . .

# Set timezone for consistent date handling
ENV TZ=Asia/Kolkata

# Create scripts directory if it doesn't exist
RUN mkdir -p scripts

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

EXPOSE 5000

CMD ["npm", "start"]
