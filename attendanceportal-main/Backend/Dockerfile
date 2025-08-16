# Use Node.js 18 Alpine for backend
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

# Expose port
EXPOSE 5000

# Start the app
CMD ["node", "index.js"]
