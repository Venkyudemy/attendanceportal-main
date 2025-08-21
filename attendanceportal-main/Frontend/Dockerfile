# Stage 1: Build React app
FROM node:18-alpine AS build
WORKDIR /app

# Set environment variables for build
ENV NODE_ENV=production
ENV REACT_APP_API_URL=/api

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --legacy-peer-deps --only=production

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine AS production

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /app/build .
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
