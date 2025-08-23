# Stage 1: Build React app
FROM node:18-alpine AS build
WORKDIR /app

# Install necessary build tools
RUN apk add --no-cache python3 make g++

# Set environment variables for build
ENV NODE_ENV=production
ENV CI=false
ENV GENERATE_SOURCEMAP=false

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm ci --legacy-peer-deps --silent

# Copy source code
COPY . .

# Build the React app with error handling
RUN npm run build || (echo "Build failed, trying with CI=false" && CI=false npm run build)

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine AS production

# Install necessary tools for debugging
RUN apk add --no-cache curl

WORKDIR /usr/share/nginx/html

# Remove default nginx content
RUN rm -rf ./*

# Copy built React app
COPY --from=build /app/build .

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Create a simple health check file
RUN echo "healthy" > /usr/share/nginx/html/health

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Switch to nginx user for security
USER nginx

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
