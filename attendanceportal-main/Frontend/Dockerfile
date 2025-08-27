# Stage 1: Build React app
FROM node:18-alpine AS build
WORKDIR /app

# Set environment variables for build
ENV NODE_ENV=production
ENV REACT_APP_API_URL=/api

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine AS production

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

# Copy built React app
COPY --from=build /app/build .

# Copy nginx configuration template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Create a custom entrypoint script that uses envsubst
RUN echo '#!/bin/sh' > /docker-entrypoint.d/configure-nginx.sh && \
    echo 'set -e' >> /docker-entrypoint.d/configure-nginx.sh && \
    echo 'echo "Configuring nginx with BACKEND_PRIVATE_IP: $BACKEND_PRIVATE_IP"' >> /docker-entrypoint.d/configure-nginx.sh && \
    echo 'envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.d/configure-nginx.sh && \
    echo 'echo "Nginx configuration generated successfully"' >> /docker-entrypoint.d/configure-nginx.sh && \
    echo 'nginx -t' >> /docker-entrypoint.d/configure-nginx.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.d/configure-nginx.sh && \
    chmod +x /docker-entrypoint.d/configure-nginx.sh

EXPOSE 80

CMD ["/docker-entrypoint.d/configure-nginx.sh"]
