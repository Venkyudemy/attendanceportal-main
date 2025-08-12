# Use Alpine-based Node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install curl (and any other Alpine packages needed)
RUN apk update && apk add --no-cache curl bash

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all frontend code
COPY . .

# Build the app
RUN npm run build

# Serve using Nginx
FROM nginx:1.25-alpine
RUN apk update && apk add --no-cache curl bash

# Copy build output to Nginx html directory
COPY --from=0 /app/build /usr/share/nginx/html

# Copy custom nginx.conf if you have one
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
