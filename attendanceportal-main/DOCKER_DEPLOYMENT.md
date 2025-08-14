# 🐳 Docker Deployment Guide - Attendance Portal with Daily Reset

## 🎯 **Overview**
This guide provides complete instructions for deploying the Attendance Portal with Daily Reset functionality using Docker and Docker Compose.

## ✅ **Features Included**
- **🕛 Automatic Daily Reset**: Runs at 12:00 AM UTC every day
- **🔄 Manual Reset Controls**: Admin portal reset buttons
- **📊 Real-time Monitoring**: Health checks and status endpoints
- **🛡️ Production Ready**: Optimized containers with security
- **📈 Scalable Architecture**: Microservices with load balancing

## 🚀 **Quick Start**

### **Option 1: Automated Deployment (Recommended)**

#### **Windows:**
```bash
# Run the Windows batch file
docker-start.bat
```

#### **Linux/Mac:**
```bash
# Make the script executable
chmod +x docker-start.sh

# Run the deployment script
./docker-start.sh
```

### **Option 2: Manual Deployment**
```bash
# Build and start all services
docker-compose up --build -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

## 📋 **Prerequisites**

### **Required Software**
- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** (usually included with Docker Desktop)
- **Git** (for cloning the repository)

### **System Requirements**
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: At least 10GB free space
- **CPU**: 2 cores minimum, 4 cores recommended

## 🔧 **Configuration**

### **Environment Variables**
The system uses the following environment variables:

```yaml
# Backend Configuration
NODE_ENV: production
MONGODB_URI: mongodb://admin:password123@mongodb:27017/attendanceportal?authSource=admin
PORT: 5000
JWT_SECRET: your-super-secret-jwt-key-change-in-production
TZ: UTC

# Daily Reset Configuration
DAILY_RESET_ENABLED: "true"
DAILY_RESET_TIME: "00:00"
DAILY_RESET_TIMEZONE: "UTC"

# Frontend Configuration
REACT_APP_API_URL: /api
REACT_APP_DAILY_RESET_ENABLED: true
```

### **Customizing Reset Time**
To change the daily reset time, modify the environment variables:

```yaml
DAILY_RESET_TIME: "06:00"  # Reset at 6 AM UTC
DAILY_RESET_TIMEZONE: "America/New_York"  # Use specific timezone
```

## 🏗️ **Architecture**

### **Services Overview**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    MongoDB      │
│   (Nginx)       │◄──►│   (Node.js)     │◄──►│   (Database)    │
│   Port: 80      │    │   Port: 5000    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Service Details**

#### **Frontend Service**
- **Image**: Custom React app with Nginx
- **Port**: 80 (HTTP)
- **Features**: Static file serving, API proxy
- **Health Check**: HTTP endpoint monitoring

#### **Backend Service**
- **Image**: Node.js 18 Alpine
- **Port**: 5000 (API)
- **Features**: REST API, Daily Reset, Authentication
- **Health Check**: API health and reset status endpoints

#### **MongoDB Service**
- **Image**: MongoDB 6.0
- **Port**: 27017 (Database)
- **Features**: Data persistence, Authentication
- **Health Check**: Database connectivity

## 📊 **Monitoring & Health Checks**

### **Health Check Endpoints**
```bash
# Backend Health
curl http://localhost:5000/api/health

# Daily Reset Status
curl http://localhost:5000/api/employee/reset-status

# Frontend Health
curl http://localhost:80
```

### **Logging**
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# View daily reset logs
docker-compose logs -f backend | grep "Daily reset"
```

## 🛠️ **Management Commands**

### **Service Management**
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Rebuild and start
docker-compose up --build -d

# View service status
docker-compose ps
```

### **Data Management**
```bash
# Backup MongoDB data
docker exec attendance-mongodb mongodump --out /data/backup

# Restore MongoDB data
docker exec attendance-mongodb mongorestore /data/backup

# View data volume
docker volume ls | grep attendanceportal
```

### **Troubleshooting**
```bash
# Check container logs
docker-compose logs -f

# Access container shell
docker exec -it attendance-backend sh
docker exec -it attendance-frontend sh

# Check resource usage
docker stats

# Clean up unused resources
docker system prune -a
```

## 🔒 **Security Considerations**

### **Production Deployment**
1. **Change Default Passwords**:
   ```yaml
   MONGO_INITDB_ROOT_PASSWORD: your-secure-password
   JWT_SECRET: your-very-secure-jwt-secret
   ```

2. **Use Environment Files**:
   ```bash
   # Create .env file
   cp .env.example .env
   # Edit .env with secure values
   ```

3. **Enable HTTPS**:
   ```yaml
   # Add SSL certificates
   volumes:
     - ./ssl:/etc/nginx/ssl:ro
   ```

4. **Network Security**:
   ```yaml
   # Use custom networks
   networks:
     attendance-network:
       driver: bridge
       internal: true  # No external access
   ```

## 📈 **Scaling**

### **Horizontal Scaling**
```bash
# Scale backend service
docker-compose up -d --scale backend=3

# Scale with load balancer
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### **Resource Limits**
```yaml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '0.5'
    reservations:
      memory: 512M
      cpus: '0.25'
```

## 🧪 **Testing**

### **Automated Testing**
```bash
# Run the enhanced test script
docker exec attendance-backend node test-daily-reset-enhanced.js

# Test API endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/employee/reset-status
```

### **Manual Testing**
1. **Access Frontend**: http://localhost:80
2. **Test Check-in**: Use employee portal
3. **Test Admin Controls**: Use admin portal reset buttons
4. **Monitor Logs**: Check daily reset execution

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Services Not Starting**
```bash
# Check Docker status
docker info

# Check available resources
docker system df

# Restart Docker service
sudo systemctl restart docker
```

#### **Database Connection Issues**
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Test database connection
docker exec attendance-backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected'))
  .catch(err => console.error(err));
"
```

#### **Daily Reset Not Working**
```bash
# Check reset logs
docker-compose logs backend | grep -i reset

# Test reset endpoint
curl -X POST http://localhost:5000/api/employee/manual-daily-reset

# Check timezone settings
docker exec attendance-backend date
```

### **Performance Issues**
```bash
# Monitor resource usage
docker stats

# Check container health
docker-compose ps

# Optimize images
docker-compose build --no-cache
```

## 📚 **Additional Resources**

### **Documentation**
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Image](https://hub.docker.com/_/mongo)
- [Node.js Docker Image](https://hub.docker.com/_/node)

### **Support**
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check README files in each directory
- **Logs**: Use `docker-compose logs` for debugging

## 🎉 **Success Indicators**

### **System Working Correctly**
- ✅ All containers are running (`docker-compose ps`)
- ✅ Health checks are passing
- ✅ Frontend accessible at http://localhost:80
- ✅ Backend API accessible at http://localhost:5000
- ✅ Daily reset logs appear in backend logs
- ✅ Admin portal shows reset controls

### **Daily Reset Verification**
- ✅ Console shows reset scheduling messages
- ✅ Manual reset button works in admin portal
- ✅ Reset status endpoint returns data
- ✅ All employees reset to "Absent" status

---

## 🚀 **Next Steps**

1. **Deploy**: Use the provided scripts to deploy
2. **Configure**: Set up environment variables for production
3. **Monitor**: Set up logging and monitoring
4. **Scale**: Add load balancing and scaling as needed
5. **Secure**: Implement HTTPS and security measures

**Your Docker deployment with daily reset functionality is ready!** 🎉
