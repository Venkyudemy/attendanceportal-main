# Docker Leave Calendar Integration Guide

This guide explains how to deploy and test the Attendance Portal with the enhanced leave calendar integration in Docker.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Docker Compose available
- At least 4GB RAM available for Docker

### 1. Build and Start Services
```bash
cd attendanceportal-main
docker-compose up -d --build
```

### 2. Wait for Services to Start
```bash
# Check service status
docker-compose ps

# Wait for all services to be healthy
docker-compose logs -f
```

### 3. Test the Integration
```bash
# On Linux/Mac
./test-docker-leave-integration.sh

# On Windows
test-docker-leave-integration.bat
```

## 🔧 Docker Configuration Updates

### Backend Dockerfile (`Backend/Dockerfile`)
- **Timezone Support**: Added Asia/Kolkata timezone for proper date handling
- **Health Checks**: Built-in health check for container monitoring
- **Startup Script**: Uses `docker-start.sh` for proper initialization
- **Dependencies**: Added netcat for MongoDB connectivity checks

### Frontend Dockerfile (`Frontend/Dockerfile`)
- **Build Optimization**: Uses `npm ci` for faster, reliable builds
- **Security**: Runs as non-root nginx user
- **Compression**: Built-in gzip compression for better performance
- **Health Checks**: Container health monitoring

### Docker Compose (`docker-compose.yml`)
- **Version**: Updated to 3.8 for modern features
- **Environment Variables**: Proper timezone and MongoDB configuration
- **Volume Mounts**: Scripts directory accessible for initialization
- **Network Configuration**: Custom subnet for better isolation
- **Health Checks**: Service dependency management

### Nginx Configuration (`Frontend/docker/nginx.conf`)
- **API Routing**: Proper proxy configuration to backend
- **CORS Handling**: Comprehensive CORS support for all HTTP methods
- **Security Headers**: XSS protection, frame options, etc.
- **Performance**: Gzip compression and static file caching
- **Error Handling**: Proper error page routing

## 📊 What the Updates Fix

### 1. **Leave Calendar Display Issue**
- **Problem**: Approved leave requests weren't showing in the calendar
- **Solution**: Fixed date comparison logic and employee ID matching
- **Docker Impact**: Proper timezone handling ensures consistent date processing

### 2. **Date Handling**
- **Problem**: Inconsistent date formats between leave requests and calendar
- **Solution**: Normalized date parsing and comparison
- **Docker Impact**: Container timezone set to Asia/Kolkata for consistency

### 3. **Employee ID Matching**
- **Problem**: Leave requests stored with different ID formats
- **Solution**: Fallback search strategy for multiple ID formats
- **Docker Impact**: Proper MongoDB connectivity and initialization

### 4. **Month Statistics**
- **Problem**: Leave days not counted in monthly statistics
- **Solution**: Statistics calculated from calendar data, not just records
- **Docker Impact**: Consistent data flow between services

## 🧪 Testing the Integration

### Automated Testing
The test scripts automatically:
1. **Start Services**: Ensures all containers are running
2. **Create Test Data**: Generates approved leave requests
3. **Test API Endpoints**: Verifies all endpoints are working
4. **Verify Calendar Integration**: Checks if leave days appear correctly
5. **Test Frontend**: Ensures the UI loads properly

### Manual Testing
1. **Access Frontend**: http://localhost:3000
2. **Navigate to Attendance**: Go to employee attendance details
3. **Set Month to August 2025**: Use the month navigation
4. **Verify Leave Days**: Should see approved leave dates marked as "Leave"
5. **Check Statistics**: Month stats should include leave day count

## 🔍 Troubleshooting

### Common Issues

#### 1. **Services Not Starting**
```bash
# Check Docker logs
docker-compose logs

# Restart services
docker-compose down
docker-compose up -d
```

#### 2. **MongoDB Connection Issues**
```bash
# Check MongoDB container
docker exec attendanceportal-main-mongo-1 mongosh --eval "db.adminCommand('ping')"

# Check backend logs
docker logs attendanceportal-main-backend-1
```

#### 3. **Leave Days Not Showing**
```bash
# Check if test data exists
docker exec attendanceportal-main-backend-1 node /app/scripts/create-test-leave.js

# Verify API response
curl http://localhost:5000/api/leave/admin
```

#### 4. **Frontend Not Loading**
```bash
# Check nginx logs
docker logs attendanceportal-main-frontend-1

# Verify nginx configuration
docker exec attendanceportal-main-frontend-1 nginx -t
```

### Debug Commands

#### Check Container Status
```bash
docker-compose ps
docker-compose logs -f [service-name]
```

#### Access Container Shell
```bash
# Backend
docker exec -it attendanceportal-main-backend-1 sh

# Frontend
docker exec -it attendanceportal-main-frontend-1 sh

# MongoDB
docker exec -it attendanceportal-main-mongo-1 mongosh
```

#### Test API Endpoints
```bash
# Health check
curl http://localhost:5000/api/health

# Leave requests
curl http://localhost:5000/api/leave/admin

# Employee attendance (replace EMPLOYEE_ID)
curl "http://localhost:5000/api/employee/EMPLOYEE_ID/attendance-details?month=8&year=2025"
```

## 📈 Performance Optimizations

### Backend
- **Connection Pooling**: MongoDB connection optimization
- **Health Checks**: Built-in monitoring
- **Logging**: Structured logging with rotation

### Frontend
- **Gzip Compression**: Reduced bandwidth usage
- **Static Caching**: Long-term caching for static assets
- **Security Headers**: Protection against common attacks

### Database
- **Indexes**: Optimized queries for leave requests
- **Connection Limits**: Proper connection management
- **Health Monitoring**: Automatic health checks

## 🔐 Security Features

### Network Security
- **Custom Subnet**: Isolated network for services
- **Port Exposure**: Only necessary ports exposed
- **Internal Communication**: Services communicate via internal network

### Application Security
- **Non-root Users**: Frontend runs as nginx user
- **Security Headers**: XSS protection, frame options
- **CORS Configuration**: Proper cross-origin handling

### Data Security
- **Environment Variables**: Sensitive data in environment files
- **Volume Mounts**: Read-only access where possible
- **Health Checks**: Service integrity monitoring

## 📝 Environment Configuration

### Backend Environment (`Backend/docker.env`)
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://mongo:27017/attendanceportal
JWT_SECRET=your-secret-key
TZ=Asia/Kolkata
```

### Frontend Environment
```bash
REACT_APP_API_URL=/api
TZ=Asia/Kolkata
```

### MongoDB Environment
```bash
TZ=Asia/Kolkata
```

## 🚀 Production Deployment

### 1. **Environment Variables**
- Update `JWT_SECRET` with strong secret
- Set proper `MONGODB_URI` for production database
- Configure `NODE_ENV=production`

### 2. **Security Considerations**
- Use secrets management for sensitive data
- Enable HTTPS with proper certificates
- Configure firewall rules

### 3. **Monitoring**
- Enable logging aggregation
- Set up health check monitoring
- Configure alerting for service failures

### 4. **Scaling**
- Use Docker Swarm or Kubernetes for orchestration
- Implement load balancing
- Set up auto-scaling policies

## 📚 Additional Resources

### Documentation
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [MongoDB Docker Image](https://hub.docker.com/_/mongo)
- [Nginx Docker Image](https://hub.docker.com/_/nginx)

### Scripts
- `create-test-leave.js`: Creates test leave requests
- `test-leave-calendar-integration.js`: Tests the integration
- `docker-start.sh`: Backend startup script

### Configuration Files
- `docker-config.js`: Docker-specific backend configuration
- `nginx.conf`: Frontend proxy configuration
- `docker-compose.yml`: Service orchestration

## 🎯 Success Criteria

After following this guide, you should have:
- ✅ All services running in Docker containers
- ✅ Leave calendar properly displaying approved leave requests
- ✅ Month statistics including leave day counts
- ✅ Proper timezone handling for dates
- ✅ Health monitoring for all services
- ✅ Automated testing working correctly

## 🆘 Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review Docker logs for error messages
3. Verify all prerequisites are met
4. Ensure proper network connectivity
5. Check container resource usage

The leave calendar integration should now work correctly in the Docker environment, displaying approved leave requests as "Leave" days instead of "Absent" days in the employee's monthly attendance calendar.
