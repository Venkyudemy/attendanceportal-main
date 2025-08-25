# Stage 1: Build React app
FROM node:18-alpine AS build
WORKDIR /app

# Accept backend IP as build argument
ARG BACKEND_PRIVATE_IP
ENV BACKEND_PRIVATE_IP=${BACKEND_PRIVATE_IP}

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

# Accept backend IP as build argument
ARG BACKEND_PRIVATE_IP
ENV BACKEND_PRIVATE_IP=${BACKEND_PRIVATE_IP}

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /app/build .

# Create a script to replace the backend IP in nginx config
RUN echo '#!/bin/sh' > /docker-entrypoint.d/configure-nginx.sh && \
    echo 'sed -i "s|http://backend:5000|http://$BACKEND_PRIVATE_IP:5000|g" /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.d/configure-nginx.sh && \
    chmod +x /docker-entrypoint.d/configure-nginx.sh

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
