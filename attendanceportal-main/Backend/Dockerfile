FROM node:18-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --cache /tmp/.npm
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
