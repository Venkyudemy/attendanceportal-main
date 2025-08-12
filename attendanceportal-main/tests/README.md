# 🧪 Test Scripts

This folder contains test scripts for verifying the Attendance Portal application functionality.

## 📁 Test Files

### `test-api-connectivity.js`
- **Purpose**: Tests API connectivity from frontend perspective
- **Tests**: Different API base URLs (backend:5000, localhost:5000, 127.0.0.1:5000)
- **Endpoints**: Health check, employee stats, admin recent activities
- **Usage**: `node tests/test-api-connectivity.js`

### `test-backend.js`
- **Purpose**: Simple backend connectivity test
- **Tests**: Root endpoint and health endpoint
- **Usage**: `node tests/test-backend.js`

### `test-docker-network.js`
- **Purpose**: Tests backend connectivity from Docker network perspective
- **Tests**: Frontend-to-backend communication simulation
- **Usage**: `node tests/test-docker-network.js`

### `test-endpoints.js`
- **Purpose**: Comprehensive endpoint testing
- **Tests**: All major API endpoints
- **Usage**: `node tests/test-endpoints.js`

## 🚀 Quick Test Commands

### Test All Connectivity
```bash
# Test API connectivity
node tests/test-api-connectivity.js

# Test backend endpoints
node tests/test-endpoints.js

# Test Docker network
node tests/test-docker-network.js
```

### Test from Docker Container
```bash
# Test from frontend container
docker exec attendance-frontend node test-api-connectivity.js

# Test from backend container
docker exec attendance-backend node test-endpoints.js
```

## 🔧 Troubleshooting

### If tests fail:
1. **Check if services are running:**
   ```bash
   docker-compose ps
   ```

2. **Check backend logs:**
   ```bash
   docker logs attendance-backend
   ```

3. **Check frontend logs:**
   ```bash
   docker logs attendance-frontend
   ```

4. **Test direct API calls:**
   ```bash
   curl http://localhost:5000/api/health
   curl http://localhost:5000/api/employee/stats
   ```

## 📝 Notes

- These tests help diagnose connectivity issues between frontend and backend
- Use them when the dashboard shows zeros or API calls fail
- All tests include retry logic and fallback URLs
- Tests are designed to work in both local and Docker environments
