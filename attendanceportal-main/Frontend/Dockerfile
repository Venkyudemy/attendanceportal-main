# Stage 1: Build React app
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine AS production

# Set working dir to nginx html folder
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

# Copy built React app from build stage
COPY --from=build /app/build .

# Copy nginx config template (with BACKEND_PRIVATE_IP placeholder)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# ✅ Use official nginx entrypoint (it auto-renders templates from /etc/nginx/templates)
# Do NOT override with custom CMD
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
