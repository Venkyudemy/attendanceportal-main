# 🐳 Docker Troubleshooting Guide

## 🚨 Common Docker Issues and Solutions

### 1. Frontend Container Creation Failed

#### **Problem**: Frontend container fails to build or start

#### **Solutions**:

##### **A. Check Docker Build Logs**
```bash
# Build frontend with detailed logs
cd Frontend
docker build -t attendance-frontend-test . --progress=plain --no-cache

# Check for specific build errors
docker build -t attendance-frontend-test . 2>&1 | findstr "ERROR\|FAILED"
```

##### **B. Common Build Issues**

**Issue 1: Missing Build Dependencies**
```dockerfile
# Add these to Dockerfile if build fails
RUN apk add --no-cache python3 make g++
```

**Issue 2: npm ci fails**
```dockerfile
# Use legacy peer deps
RUN npm ci --legacy-peer-deps --silent
```

**Issue 3: Build script fails**
```dockerfile
# Add error handling
RUN npm run build || (echo "Build failed, trying with CI=false" && CI=false npm run build)
```

##### **C. Test Frontend Build Locally**
```bash
# Test the build process outside Docker
cd Frontend
npm ci --legacy-peer-deps
npm run build

# If this fails, fix the React app first
```

### 2. Container Won't Start

#### **Problem**: Container builds but fails to start

#### **Solutions**:

##### **A. Check Container Logs**
```bash
# Get container logs
docker logs <container_name>

# Follow logs in real-time
docker logs -f <container_name>
```

##### **B. Check Port Conflicts**
```bash
# Check what's using the ports
netstat -an | findstr ":3000\|:5000\|:27017"

# Kill conflicting processes
taskkill /F /PID <PID>
```

##### **C. Check Resource Limits**
```bash
# Check Docker system info
docker system df
docker system prune -f
```

### 3. Network Issues

#### **Problem**: Services can't communicate with each other

#### **Solutions**:

##### **A. Check Network Configuration**
```bash
# List networks
docker network ls

# Inspect network
docker network inspect attendanceportal-main_attendance-network
```

##### **B. Test Service Communication**
```bash
# Test from frontend to backend
docker exec -it <frontend_container> curl http://backend:5000/api/health

# Test from backend to mongo
docker exec -it <backend_container> nc -z mongo 27017
```

### 4. Volume Mount Issues

#### **Problem**: Files not persisting or not accessible

#### **Solutions**:

##### **A. Check Volume Mounts**
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect <volume_name>
```

##### **B. Fix Permission Issues**
```dockerfile
# In Dockerfile, set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html
```

### 5. Health Check Failures

#### **Problem**: Services show as unhealthy

#### **Solutions**:

##### **A. Check Health Check Endpoints**
```bash
# Test frontend health
curl http://localhost:3000/health

# Test backend health
curl http://localhost:5000/api/health

# Test MongoDB
docker exec -it <mongo_container> mongosh --eval "db.adminCommand('ping')"
```

##### **B. Adjust Health Check Settings**
```yaml
# In docker-compose.yml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/health"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 60s  # Increase this if service needs more time
```

## 🔧 Step-by-Step Debugging

### **Step 1: Check Docker Status**
```bash
# Check if Docker is running
docker --version
docker info
```

### **Step 2: Clean Up**
```bash
# Stop all containers
docker-compose down

# Remove all containers and images
docker-compose down -v --rmi all

# Clean Docker system
docker system prune -af
```

### **Step 3: Rebuild Everything**
```bash
# Rebuild all services
docker-compose up --build -d

# Check logs
docker-compose logs -f
```

### **Step 4: Test Individual Services**
```bash
# Test MongoDB
docker-compose up mongo -d
docker-compose logs mongo

# Test Backend
docker-compose up backend -d
docker-compose logs backend

# Test Frontend
docker-compose up frontend -d
docker-compose logs frontend
```

## 🧪 Testing Scripts

### **Test Frontend Docker Build**
```bash
# Run the test script
test-frontend-docker.bat
```

### **Test Full Application**
```bash
# Start everything
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## 🚨 Emergency Fixes

### **Quick Reset**
```bash
# Nuclear option - reset everything
docker-compose down -v --rmi all
docker system prune -af
docker-compose up --build -d
```

### **Manual Container Creation**
```bash
# If docker-compose fails, create containers manually
docker run -d --name mongo -p 27017:27017 mongo:6
docker run -d --name backend -p 5000:5000 --link mongo attendance-backend
docker run -d --name frontend -p 3000:80 --link backend attendance-frontend
```

## 💡 Prevention Tips

1. **Always use `--build` flag** when making changes
2. **Check logs immediately** after starting services
3. **Use health checks** to ensure proper startup order
4. **Test individual services** before running the full stack
5. **Keep Docker updated** to avoid compatibility issues

## 📞 Getting Help

If you're still having issues:

1. **Check the logs**: `docker-compose logs -f`
2. **Run the test script**: `test-frontend-docker.bat`
3. **Check this guide** for your specific error
4. **Clean and rebuild**: `docker-compose down -v --build`

---

**🎯 Remember: Most Docker issues can be solved by cleaning up and rebuilding!**
