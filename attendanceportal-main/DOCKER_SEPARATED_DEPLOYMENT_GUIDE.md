# 🐳 Docker Separated Deployment Guide

## 📋 **Overview**

This guide helps you deploy the Attendance Portal with three separate instances:
- **Frontend Server** (React + Nginx)
- **Backend Server** (Node.js + Express)
- **MongoDB Server** (Database)

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    MongoDB      │
│   (Nginx)       │◄──►│   (Node.js)     │◄──►│   (Database)    │
│   Port: 80      │    │   Port: 5000    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 **Deployment Steps**

### **1. Backend Server Setup**

#### **Create Backend Dockerfile:**
```dockerfile
# Backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps --only=production

# Install curl and netcat for health checks
RUN apk add --no-cache curl netcat-openbsd

# Copy source code
COPY . .

# Set timezone
ENV TZ=Asia/Kolkata

# Make startup script executable
RUN chmod +x docker-start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD curl -f http://localhost:5000/api/health || exit 1

EXPOSE 5000

# Use startup script
CMD ["./docker-start.sh"]
```

#### **Create Backend Environment File:**
```env
# Backend/.env
NODE_ENV=production
PORT=5000
MONGO_URL=mongodb://YOUR_MONGODB_PRIVATE_IP:27017/attendanceportal
JWT_SECRET=your-super-secret-jwt-key-change-in-production
TZ=UTC
```

#### **Build and Deploy Backend:**
```bash
# On backend server
cd Backend
docker build -t attendance-backend .
docker run -d \
  --name attendance-backend \
  -p 5000:5000 \
  --env-file .env \
  attendance-backend
```

### **2. MongoDB Server Setup**

#### **Create MongoDB Dockerfile:**
```dockerfile
# MongoDB/Dockerfile
FROM mongo:6.0

# Create data directory
RUN mkdir -p /data/db

# Expose port
EXPOSE 27017

# Start MongoDB
CMD ["mongod", "--bind_ip_all"]
```

#### **Deploy MongoDB:**
```bash
# On MongoDB server
docker build -t attendance-mongodb .
docker run -d \
  --name attendance-mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  attendance-mongodb
```

### **3. Frontend Server Setup**

#### **Create Frontend Environment File:**
```env
# Frontend/.env.production
REACT_APP_API_URL=http://YOUR_BACKEND_PRIVATE_IP:5000/api
REACT_APP_DAILY_RESET_ENABLED=true
NODE_ENV=production
```

#### **Build Frontend:**
```bash
# On frontend server
cd Frontend
npm install
npm run build
```

#### **Create Nginx Configuration:**
```nginx
# Frontend/nginx.conf
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Serve static files
    location / {
        try_files $uri /index.html;
    }

    # Forward API requests to backend
    location /api {
        proxy_pass http://YOUR_BACKEND_PRIVATE_IP:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### **Deploy Frontend:**
```bash
# On frontend server
docker run -d \
  --name attendance-frontend \
  -p 80:80 \
  -v $(pwd)/build:/usr/share/nginx/html \
  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf \
  nginx:alpine
```

## 🔧 **Admin User Creation**

### **Automatic Creation (Recommended)**

The backend will automatically create the admin user during startup. The process includes:

1. **Startup Script** (`docker-start.sh`) runs database initialization
2. **Database Script** (`initDatabase.js`) creates admin user
3. **Fallback** in `index.js` ensures admin user exists

### **Manual Creation (If Needed)**

If automatic creation fails, run manually:

```bash
# On backend server
cd Backend
node scripts/createAdminUser.js
```

### **Admin Credentials:**
- **Email:** `admin@techcorp.com`
- **Password:** `password123`
- **Role:** `admin`

## 🔍 **Verification Steps**

### **1. Check Backend Health:**
```bash
curl http://YOUR_BACKEND_PRIVATE_IP:5000/api/health
```

### **2. Test Admin Login:**
```bash
curl -X POST http://YOUR_BACKEND_PRIVATE_IP:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techcorp.com","password":"password123"}'
```

### **3. Check MongoDB Connection:**
```bash
# On backend server
mongo mongodb://YOUR_MONGODB_PRIVATE_IP:27017/attendanceportal
db.employees.findOne({email: "admin@techcorp.com"})
```

## 🛡️ **Security Configuration**

### **Security Groups:**

#### **Backend Server:**
- Inbound: Port 5000 (from Frontend server)
- Inbound: Port 27017 (from MongoDB server)

#### **Frontend Server:**
- Inbound: Port 80/443 (from internet)
- Outbound: Port 5000 (to Backend server)

#### **MongoDB Server:**
- Inbound: Port 27017 (from Backend server)

### **Environment Variables:**
- Use strong JWT secrets
- Change default passwords
- Use private IPs for internal communication

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Admin User Not Created:**
   ```bash
   # Check backend logs
   docker logs attendance-backend
   
   # Manually create admin
   node scripts/createAdminUser.js
   ```

2. **Connection Issues:**
   ```bash
   # Test connectivity
   ping YOUR_BACKEND_PRIVATE_IP
   ping YOUR_MONGODB_PRIVATE_IP
   
   # Check ports
   netstat -tlnp | grep :5000
   netstat -tlnp | grep :27017
   ```

3. **CORS Issues:**
   - Update CORS configuration in `Backend/index.js`
   - Ensure frontend IP is allowed

### **Debug Commands:**
```bash
# Check container status
docker ps -a

# View logs
docker logs attendance-backend
docker logs attendance-mongodb
docker logs attendance-frontend

# Execute commands in containers
docker exec -it attendance-backend sh
docker exec -it attendance-mongodb mongo
```

## 📊 **Monitoring**

### **Health Checks:**
- Backend: `http://YOUR_BACKEND_PRIVATE_IP:5000/api/health`
- Frontend: `http://YOUR_FRONTEND_PUBLIC_IP/`

### **Logs:**
- Backend logs show admin user creation
- MongoDB logs show connection status
- Frontend logs show API requests

## 🔄 **Updates**

### **Backend Updates:**
```bash
# Rebuild and restart
docker stop attendance-backend
docker rm attendance-backend
docker build -t attendance-backend .
docker run -d --name attendance-backend -p 5000:5000 --env-file .env attendance-backend
```

### **Frontend Updates:**
```bash
# Rebuild and restart
npm run build
docker restart attendance-frontend
```

## 📞 **Support**

If you encounter issues:
1. Check the troubleshooting section
2. Review container logs
3. Verify network connectivity
4. Ensure admin user exists in database

---

**🎯 Goal:** Ensure admin user `admin@techcorp.com` with password `password123` is automatically created during deployment.
