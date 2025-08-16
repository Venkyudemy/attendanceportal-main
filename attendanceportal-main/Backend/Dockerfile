# Stage 1: Install dependencies
FROM node:18-alpine AS base
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

COPY package.json package-lock.json ./
RUN npm install --only=production --legacy-peer-deps

# Stage 2: Copy source
COPY . .

# Use production environment
ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "index.js"]
