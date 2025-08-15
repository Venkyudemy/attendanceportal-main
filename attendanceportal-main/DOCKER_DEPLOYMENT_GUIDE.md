# Docker Deployment Guide - Attendance Portal

## 🚀 **Enhanced Docker Configuration**

This guide covers the updated Docker configuration with enhanced security, performance optimizations, and production-ready settings.

---

## 📋 **Updated Components**

### **1. Frontend Dockerfile**
- ✅ Multi-stage build optimization
- ✅ Security audit integration
- ✅ Enhanced nginx configuration
- ✅ Non-root user execution
- ✅ Health check monitoring
- ✅ Optimized caching layers

### **2. Backend Dockerfile**
- ✅ Security hardening with dumb-init
- ✅ Non-root user execution
- ✅ Enhanced health checks
- ✅ Memory optimization
- ✅ Security audit integration
- ✅ Proper signal handling

### **3. Nginx Configuration**
- ✅ Rate limiting for API endpoints
- ✅ Enhanced security headers
- ✅ Gzip compression optimization
- ✅ Static asset caching
- ✅ Proxy buffering
- ✅ Error handling improvements

### **4. Docker Compose**
- ✅ Enhanced security options
- ✅ Resource limits and reservations
- ✅ Health checks for all services
- ✅ Persistent volumes
- ✅ Custom network configuration
- ✅ Secrets management

---

## 🔧 **Quick Start**

### **Prerequisites**
```bash
# Ensure Docker and Docker Compose are installed
docker --version
docker-compose --version

# Create necessary directories
mkdir -p data/mongodb secrets
```

### **Environment Setup**
```bash
# Create MongoDB password file
echo "password123" > secrets/mongo_root_password.txt

# Set proper permissions (Linux/Mac)
chmod 600 secrets/mongo_root_password.txt
```

### **Build and Deploy**
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

---

## 🔒 **Security Enhancements**

### **Frontend Security**
- ✅ Non-root nginx user
- ✅ Enhanced security headers
- ✅ Rate limiting on API endpoints
- ✅ Content Security Policy
- ✅ XSS protection
- ✅ Clickjacking protection

### **Backend Security**
- ✅ Non-root nodejs user
- ✅ Signal handling with dumb-init
- ✅ Security audit integration
- ✅ Read-only file system where possible
- ✅ No new privileges flag

### **Network Security**
- ✅ Custom bridge network
- ✅ Isolated service communication
- ✅ Secrets management for sensitive data
- ✅ Resource limits to prevent DoS

---

## 📊 **Performance Optimizations**

### **Frontend Performance**
- ✅ Multi-stage build for smaller images
- ✅ Gzip compression for all assets
- ✅ Static asset caching (1 year)
- ✅ HTML caching (1 hour)
- ✅ Proxy buffering for API calls
- ✅ Keep-alive connections

### **Backend Performance**
- ✅ Memory optimization (2GB heap)
- ✅ Connection pooling
- ✅ Efficient logging
- ✅ Health check monitoring
- ✅ Resource limits

### **Database Performance**
- ✅ Persistent volume storage
- ✅ Health check monitoring
- ✅ Resource limits
- ✅ Optimized MongoDB configuration

---

## 🔍 **Monitoring & Health Checks**

### **Health Check Endpoints**
- **Frontend:** `http://localhost/health`
- **Backend:** `http://localhost:5000/api/health`
- **MongoDB:** Internal ping command

### **Health Check Configuration**
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 15s
```

### **Logging Configuration**
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

---

## 🛠 **Troubleshooting**

### **Common Issues**

#### **1. Permission Denied Errors**
```bash
# Fix nginx permissions
docker-compose exec frontend chown -R nginx:nginx /var/cache/nginx /var/log/nginx
```

#### **2. MongoDB Connection Issues**
```bash
# Check MongoDB status
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check MongoDB logs
docker-compose logs mongodb
```

#### **3. Frontend Not Loading**
```bash
# Check nginx configuration
docker-compose exec frontend nginx -t

# Check frontend logs
docker-compose logs frontend
```

#### **4. Backend API Errors**
```bash
# Check backend logs
docker-compose logs backend

# Test API connectivity
curl http://localhost:5000/api/health
```

### **Debug Commands**
```bash
# Enter container for debugging
docker-compose exec frontend sh
docker-compose exec backend sh
docker-compose exec mongodb mongosh

# Check resource usage
docker stats

# View network configuration
docker network ls
docker network inspect attendanceportal-main_attendance-network
```

---

## 📈 **Production Deployment**

### **Environment Variables**
Create `.env` file for production:
```env
NODE_ENV=production
MONGODB_URI=mongodb://admin:password123@mongodb:27017/attendanceportal?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-in-production
TZ=Asia/Kolkata
```

### **SSL/HTTPS Setup**
1. Add SSL certificates to `ssl_certs` volume
2. Update nginx configuration for HTTPS
3. Configure automatic redirects

### **Backup Strategy**
```bash
# MongoDB backup
docker-compose exec mongodb mongodump --out /backup

# Volume backup
docker run --rm -v attendanceportal-main_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb_backup.tar.gz -C /data .
```

---

## 🔄 **Maintenance**

### **Regular Updates**
```bash
# Update images
docker-compose pull

# Rebuild with latest changes
docker-compose build --no-cache

# Restart services
docker-compose restart
```

### **Cleanup**
```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Complete cleanup
docker system prune -a
```

---

## 📝 **Configuration Files**

### **Key Files Updated**
- ✅ `Frontend/Dockerfile` - Enhanced build process
- ✅ `Frontend/nginx.conf` - Security and performance
- ✅ `Backend/Dockerfile` - Security hardening
- ✅ `docker-compose.yml` - Production-ready configuration

### **New Files Added**
- ✅ `secrets/mongo_root_password.txt` - MongoDB password
- ✅ `data/mongodb/` - Persistent data directory

---

## 🎯 **Best Practices**

### **Security**
- ✅ Use secrets for sensitive data
- ✅ Run containers as non-root users
- ✅ Implement rate limiting
- ✅ Regular security updates
- ✅ Network isolation

### **Performance**
- ✅ Multi-stage builds
- ✅ Layer caching optimization
- ✅ Resource limits
- ✅ Health check monitoring
- ✅ Efficient logging

### **Reliability**
- ✅ Health checks for all services
- ✅ Automatic restart policies
- ✅ Persistent data storage
- ✅ Backup strategies
- ✅ Monitoring and alerting

---

## 🚀 **Deployment Commands**

### **Development**
```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### **Production**
```bash
# Build production images
docker-compose -f docker-compose.yml build

# Deploy to production
docker-compose -f docker-compose.yml up -d

# Monitor deployment
docker-compose ps
docker-compose logs -f
```

---

## ✅ **Verification Checklist**

- ✅ All services start successfully
- ✅ Health checks pass
- ✅ Frontend accessible on port 80
- ✅ Backend API accessible on port 5000
- ✅ MongoDB connection established
- ✅ SSL certificates configured (if applicable)
- ✅ Logs show no errors
- ✅ Resource usage within limits
- ✅ Security headers present
- ✅ Rate limiting active

---

## 📞 **Support**

For issues or questions:
1. Check the troubleshooting section
2. Review service logs
3. Verify configuration files
4. Test individual components
5. Check resource usage

**Happy Deploying! 🎉**
