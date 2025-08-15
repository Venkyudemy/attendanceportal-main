# Backend Dockerfile with production stage
FROM node:18-alpine AS production
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production --cache /tmp/.npm

# Copy source code
COPY . .

# Expose port 5000
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
