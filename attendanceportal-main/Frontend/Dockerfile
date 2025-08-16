# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies (using npm install instead of ci since lock file might be out of sync)
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build:prod

# Stage 2: Serve the application using Nginx
FROM nginx:1.21-alpine

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
