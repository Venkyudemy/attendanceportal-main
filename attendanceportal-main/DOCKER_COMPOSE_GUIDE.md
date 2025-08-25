# Docker Compose Setup Guide

## Overview
This guide explains the Docker Compose configuration for the Attendance Portal application, including data persistence solutions and individual service configurations.

## Data Persistence Issue Resolution

### Problem
The MongoDB container was not persisting data, causing the admin user to disappear after container restarts.

### Solution
1. **Named Volume Configuration**: MongoDB now uses a named volume `mongo_data` mounted to `/data/db`
2. **Smart Initialization**: Backend services now check if admin user exists before running initialization scripts
3. **Improved MongoDB Configuration**: Added `--bind_ip_all` command for better network connectivity

## Docker Compose Files

### 1. Main Docker Compose (`docker-compose.yml`)
Complete setup with all services (frontend, backend, MongoDB):
```bash
docker-compose up -d
```

### 2. Individual Service Docker Compose Files

#### Frontend Only (`Frontend/docker-compose.yml`)
```bash
cd Frontend
docker-compose up -d
```
- Runs on port 3000
- Uses Nginx to serve React app
- Network: `frontend-network` (172.21.0.0/16)

#### Backend + MongoDB (`Backend/docker-compose.yml`)
```bash
cd Backend
docker-compose up -d
```
- Backend runs on port 5000
- MongoDB runs on port 27017
- Includes data persistence for MongoDB
- Network: `backend-network` (172.22.0.0/16)

#### Database Only (`database/docker-compose.yml`)
```bash
cd database
docker-compose up -d
```
- MongoDB only
- Runs on port 27017
- Includes data persistence
- Network: `database-network` (172.23.0.0/16)

## Data Persistence Configuration

### MongoDB Volume
```yaml
volumes:
  mongo_data:
    driver: local
```

### Volume Mount
```yaml
volumes:
  - mongo_data:/data/db
```

## Smart Initialization

The backend services now include intelligent initialization that:
1. Checks if admin user already exists in MongoDB
2. Only runs initialization scripts if admin user is missing
3. Prevents data loss from repeated initialization

### Implementation
```javascript
const adminExists = await User.findOne({ role: 'admin' });
if (!adminExists) {
  // Run initialization scripts
} else {
  // Skip initialization
}
```

## Production Configurations

### `docker-compose.prod.yml`
- Production-ready configuration
- External API URL configuration
- Optimized for production deployment

### `docker-compose.external.yml`
- External deployment configuration
- Configured for external server access
- Same data persistence features

## Usage Instructions

### Starting All Services
```bash
# From root directory
docker-compose up -d
```

### Starting Individual Services
```bash
# Frontend only
cd Frontend && docker-compose up -d

# Backend + Database
cd Backend && docker-compose up -d

# Database only
cd database && docker-compose up -d
```

### Stopping Services
```bash
# Stop all services
docker-compose down

# Stop individual services
cd Frontend && docker-compose down
cd Backend && docker-compose down
cd database && docker-compose down
```

### Data Backup
```bash
# Backup MongoDB data
docker run --rm -v attendanceportal-main_mongo_data:/data -v $(pwd):/backup mongo:6 tar czf /backup/mongo_backup.tar.gz /data

# Restore MongoDB data
docker run --rm -v attendanceportal-main_mongo_data:/data -v $(pwd):/backup mongo:6 tar xzf /backup/mongo_backup.tar.gz -C /
```

## Troubleshooting

### Admin User Disappears
1. Check if MongoDB volume is properly mounted
2. Verify volume exists: `docker volume ls`
3. Check volume contents: `docker run --rm -v attendanceportal-main_mongo_data:/data mongo:6 ls -la /data`

### Connection Issues
1. Ensure all services are on the same network
2. Check container logs: `docker-compose logs`
3. Verify MongoDB is accessible: `docker exec -it <mongo-container> mongosh`

### Data Loss
1. Check volume persistence: `docker volume inspect attendanceportal-main_mongo_data`
2. Verify backup procedures
3. Check initialization scripts for data clearing

## Network Configuration

Each service uses isolated networks:
- Main: `attendance-network` (172.20.0.0/16)
- Frontend: `frontend-network` (172.21.0.0/16)
- Backend: `backend-network` (172.22.0.0/16)
- Database: `database-network` (172.23.0.0/16)

## Environment Variables

### Backend Environment
- `NODE_ENV`: Environment mode
- `PORT`: Server port
- `MONGO_URL`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `MONGODB_URI`: Alternative MongoDB URI
- `WORKING_HOURS_START/END`: Business hours
- `LATE_THRESHOLD_MINUTES`: Late arrival threshold

### Frontend Environment
- `REACT_APP_API_URL`: Backend API URL
- `TZ`: Timezone setting

## Security Considerations

1. **JWT Secret**: Change default JWT secret in production
2. **MongoDB Access**: Consider adding authentication
3. **Network Isolation**: Services use isolated networks
4. **Volume Permissions**: Ensure proper volume permissions

## Monitoring

### Container Health
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Monitor resource usage
docker stats
```

### Database Health
```bash
# Connect to MongoDB
docker exec -it <mongo-container> mongosh

# Check database status
db.stats()

# List collections
show collections
```
