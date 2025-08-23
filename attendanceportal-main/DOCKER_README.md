# 🐳 Attendance Portal - Complete Docker Setup

## 🚀 Quick Start

### **Option 1: Use the Startup Script (Recommended)**
```bash
# Run the interactive startup script
start-docker.bat
```

### **Option 2: Manual Commands**
```bash
# Development mode (with logs)
docker-compose up

# Production mode (background)
docker-compose up -d

# Clean rebuild (solves most issues)
docker-compose down -v --rmi all
docker-compose up --build -d
```

## 🏗️ What's New in This Update

### ✅ **Enhanced Backend Dockerfile**
- **Security**: Non-root user execution
- **Dependencies**: All necessary build tools included
- **Error Handling**: Better npm installation and build process
- **Permissions**: Proper file ownership and access rights

### ✅ **Optimized Frontend Dockerfile**
- **Multi-stage Build**: Separate build and production stages
- **Build Tools**: Python3, make, g++ for native dependencies
- **Error Handling**: Fallback build process with CI=false
- **Security**: Nginx user execution with proper permissions

### ✅ **Advanced Docker Compose**
- **Service Ordering**: Proper dependency management
- **Health Checks**: All services have comprehensive health monitoring
- **Volume Management**: Persistent logs and data storage
- **Network Configuration**: Isolated network with custom subnet

### ✅ **Production Ready Features**
- **Nginx Proxy**: Optional reverse proxy with SSL support
- **Rate Limiting**: API protection against abuse
- **Load Balancing**: Backend service scaling ready
- **SSL Support**: HTTPS configuration included

## 📁 File Structure

```
attendanceportal-main/
├── Backend/
│   ├── Dockerfile          # Enhanced backend container
│   ├── docker-start.sh     # Improved startup script
│   ├── initAdmin.js        # Admin user creation
│   └── scripts/
│       └── init-mongo.js   # MongoDB initialization
├── Frontend/
│   ├── Dockerfile          # Multi-stage frontend build
│   └── docker/
│       └── nginx.conf      # Frontend nginx configuration
├── nginx/
│   └── nginx.conf          # Production reverse proxy
├── docker-compose.yml      # Complete service orchestration
├── start-docker.bat        # Interactive startup script
├── test-frontend-docker.bat # Frontend testing script
└── DOCKER_TROUBLESHOOTING.md # Comprehensive troubleshooting
```

## 🔧 Service Configuration

### **MongoDB Service**
- **Image**: mongo:6
- **Port**: 27017
- **Features**: Replica set, logging, health checks
- **Volumes**: Data persistence, init scripts

### **Backend Service**
- **Build**: Custom Node.js image
- **Port**: 5000
- **Features**: Auto admin creation, health monitoring
- **Dependencies**: Waits for MongoDB health

### **Frontend Service**
- **Build**: Multi-stage React + Nginx
- **Port**: 3000 (mapped to 80)
- **Features**: Static file serving, API proxy
- **Dependencies**: Waits for backend health

### **Nginx Proxy (Optional)**
- **Ports**: 80, 443 (SSL)
- **Features**: Reverse proxy, load balancing, SSL
- **Profile**: production (use --profile production)

## 🎯 Usage Scenarios

### **Development**
```bash
# Start with live logs
docker-compose up

# Or use the startup script
start-docker.bat
# Choose option 1
```

### **Production**
```bash
# Background mode
docker-compose up -d

# With nginx proxy
docker-compose --profile production up -d
```

### **Testing**
```bash
# Test individual services
start-docker.bat
# Choose option 5

# Test frontend build
test-frontend-docker.bat
```

### **Troubleshooting**
```bash
# Clean rebuild
start-docker.bat
# Choose option 3

# Check logs
docker-compose logs -f
```

## 🔍 Health Monitoring

### **Health Check Endpoints**
- **Frontend**: `http://localhost:3000/health`
- **Backend**: `http://localhost:5000/api/health`
- **MongoDB**: Internal ping command

### **Service Status**
```bash
# Check all services
docker-compose ps

# Check specific service
docker-compose ps backend

# View health status
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"
```

## 📊 Logging

### **Access Logs**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Follow with timestamps
docker-compose logs -f --timestamps
```

### **Log Locations**
- **Backend**: `./Backend/logs/`
- **Frontend**: `./Frontend/logs/`
- **MongoDB**: `./Backend/logs/mongo/`
- **Nginx Proxy**: `./nginx/logs/`

## 🚨 Common Issues & Solutions

### **Port Conflicts**
```bash
# Check what's using ports
netstat -an | findstr ":3000\|:5000\|:27017"

# Kill conflicting processes
taskkill /F /PID <PID>
```

### **Build Failures**
```bash
# Clean rebuild
docker-compose down -v --rmi all
docker system prune -af
docker-compose up --build -d
```

### **Service Communication**
```bash
# Check network
docker network ls
docker network inspect attendanceportal-main_attendance-network

# Test connectivity
docker exec -it attendance-backend nc -z mongo 27017
```

## 🔐 Security Features

### **User Isolation**
- **Backend**: Runs as `node` user
- **Frontend**: Runs as `nginx` user
- **MongoDB**: Runs as `mongodb` user

### **Network Security**
- **Isolated Network**: Custom subnet (172.20.0.0/16)
- **Port Exposure**: Only necessary ports exposed
- **Internal Communication**: Services communicate via internal network

### **File Permissions**
- **Read-only Mounts**: Scripts and configs mounted read-only
- **Proper Ownership**: Files owned by appropriate users
- **Limited Access**: Minimal required permissions

## 🚀 Production Deployment

### **Environment Variables**
```bash
# Set production values
export NODE_ENV=production
export JWT_SECRET=your-production-secret
export MONGO_URL=mongodb://production-mongo:27017/attendanceportal
```

### **SSL Configuration**
1. **Generate SSL certificates**
2. **Place in `./nginx/ssl/`**
3. **Uncomment HTTPS section in `nginx/nginx.conf`**
4. **Start with production profile**

### **Scaling**
```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Use nginx proxy for load balancing
docker-compose --profile production up -d
```

## 💡 Best Practices

1. **Always use health checks** - Ensures proper startup order
2. **Use volume mounts** - Persist logs and data
3. **Monitor resource usage** - Check `docker stats`
4. **Regular cleanup** - Run `docker system prune` periodically
5. **Backup volumes** - Important data in `mongo_data` volume

## 📞 Getting Help

### **Immediate Issues**
1. **Check logs**: `docker-compose logs -f`
2. **Run startup script**: `start-docker.bat`
3. **Check troubleshooting guide**: `DOCKER_TROUBLESHOOTING.md`

### **Common Commands**
```bash
# Service management
docker-compose up/down/restart
docker-compose ps/logs/exec

# System management
docker system df/prune
docker volume ls/inspect
docker network ls/inspect
```

---

## 🎉 **Your Docker Setup is Now Production-Ready!**

**Next Steps:**
1. **Run `start-docker.bat`** to start your application
2. **Choose option 3** for clean rebuild (recommended first time)
3. **Access your app** at http://localhost:3000
4. **Login with admin** credentials

**🎯 The frontend container creation issues are now completely resolved!**
