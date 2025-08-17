# ---- Backend Dockerfile (Node.js + Express) ----
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source
COPY . .

# Set timezone for consistent date handling
ENV TZ=Asia/Kolkata

EXPOSE 5000

CMD ["npm", "start"]
