# Simple Docker Setup for Leave Calendar Integration

This is a simplified Docker setup for the Attendance Portal with leave calendar integration.

## 🚀 Quick Start

### 1. Build and Start Services
```bash
cd attendanceportal-main
docker-compose up -d --build
```

### 2. Wait for Services to Start
```bash
# Check service status
docker-compose ps

# Monitor logs
docker-compose logs -f
```

### 3. Test the Integration
```bash
# On Linux/Mac
./test-docker-simple.sh

# On Windows
test-docker-simple.bat
```

## 📁 Updated Files

### Backend Dockerfile (`Backend/Dockerfile`)
- **Simple Node.js setup**: Uses `npm start` command
- **Timezone support**: Asia/Kolkata for consistent date handling
- **No complex health checks**: Simple and reliable

### Frontend Dockerfile (`Frontend/Dockerfile`)
- **Two-stage build**: Node.js build + Nginx serve
- **Simple configuration**: Focused on essential functionality
- **No complex security**: Basic setup for development/testing

### Docker Compose (`docker-compose.yml`)
- **Simple dependencies**: Basic service orchestration
- **Volume mounts**: Scripts accessible for testing
- **Network isolation**: Custom subnet for services

### Nginx Configuration (`Frontend/docker/nginx.conf`)
- **API routing**: Proxy to backend
- **CORS handling**: Basic cross-origin support
- **Health endpoint**: Simple health check

## 🔧 What This Fixes

### Leave Calendar Display Issue
- ✅ **Problem**: Approved leave requests weren't showing in calendar
- ✅ **Solution**: Fixed date comparison and employee ID matching
- ✅ **Docker Impact**: Proper timezone handling ensures consistency

### Date Handling
- ✅ **Problem**: Inconsistent date formats
- ✅ **Solution**: Normalized date parsing
- ✅ **Docker Impact**: Container timezone set to Asia/Kolkata

### Employee ID Matching
- ✅ **Problem**: Different ID formats in leave requests
- ✅ **Solution**: Fallback search strategy
- ✅ **Docker Impact**: Proper MongoDB connectivity

## 🧪 Testing

### Automated Testing
The test scripts automatically:
1. **Start services** with Docker Compose
2. **Create test data** (approved leave requests)
3. **Test API endpoints** for functionality
4. **Verify calendar integration** shows leave days
5. **Check frontend** accessibility

### Manual Testing
1. **Access Frontend**: http://localhost:3000
2. **Navigate to Attendance**: Employee attendance details
3. **Set Month to August 2025**: Use month navigation
4. **Verify Leave Days**: Should see "Leave" instead of "Absent"
5. **Check Statistics**: Month stats should include leave count

## 🔍 Troubleshooting

### Services Not Starting
```bash
# Check Docker logs
docker-compose logs

# Restart services
docker-compose down
docker-compose up -d
```

### Backend Issues
```bash
# Check backend logs
docker-compose logs backend

# Test backend directly
curl http://localhost:5000/api/health
```

### Frontend Issues
```bash
# Check frontend logs
docker-compose logs frontend

# Test frontend
curl http://localhost:3000
```

### MongoDB Issues
```bash
# Check MongoDB container
docker exec attendanceportal-main-mongo-1 mongosh --eval "db.adminCommand('ping')"

# Check MongoDB logs
docker-compose logs mongo
```

## 📊 Expected Results

After successful setup:
- ✅ **Backend**: Running on port 5000 with API endpoints
- ✅ **Frontend**: Accessible on port 3000 with React app
- ✅ **MongoDB**: Running on port 27017 with test data
- ✅ **Leave Calendar**: Shows approved leave as "Leave" days
- ✅ **Statistics**: Month stats include leave day counts

## 🧹 Cleanup

### Stop Services
```bash
docker-compose down
```

### Remove Volumes (WARNING: This deletes all data)
```bash
docker-compose down -v
```

### Remove Images
```bash
docker-compose down --rmi all
```

## 💡 Tips

1. **First Run**: Services may take 1-2 minutes to fully start
2. **Test Data**: The script creates test leave requests automatically
3. **Logs**: Use `docker-compose logs -f` to monitor real-time logs
4. **Ports**: Ensure ports 3000, 5000, and 27017 are available
5. **Memory**: Docker needs at least 2GB RAM for all services

## 🎯 Success Criteria

You'll know it's working when:
- All Docker containers show "Up" status
- Backend health check returns success
- Frontend loads without errors
- Test script completes successfully
- Leave days appear in calendar view
- Month statistics show correct leave counts

This simplified setup focuses on getting the leave calendar integration working quickly without complex configurations.
