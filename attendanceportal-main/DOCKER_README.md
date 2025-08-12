# 🐳 Docker Setup - Attendance Portal

Simple Docker setup for the Attendance Portal application.

## 📁 Files

- **`Frontend/Dockerfile`** - React frontend with nginx
- **`Backend/Dockerfile`** - Node.js backend API
- **`docker-compose.yml`** - Complete application stack

## 🚀 Quick Start

### Build and Run
```bash
# Build and start all services
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Seed Database with Test Data
```bash
# Run the seed script to add test employees
docker exec attendance-backend node scripts/seed-data.js

# Or run it manually
docker exec -it attendance-backend sh
cd /app
node scripts/seed-data.js
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 🌐 Access Points

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

## 🔧 Services

### MongoDB
- **Image**: mongo:6.0
- **Port**: 27017
- **Credentials**: admin/password123
- **Database**: attendanceportal

### Backend
- **Port**: 5000
- **Health Check**: http://localhost:5000/api/health
- **Environment**: Production

### Frontend
- **Port**: 80
- **Health Check**: http://localhost/health
- **Server**: nginx

## 🛠️ Troubleshooting

### Backend Connection Issues

If you see "Connection error: Failed to fetch" in the frontend:

1. **Check if backend is running:**
```bash
docker-compose ps
```

2. **Check backend logs:**
```bash
docker-compose logs backend
```

3. **Test backend directly:**
```bash
curl http://localhost:5000/api/health
```

4. **Check if MongoDB is connected:**
```bash
docker-compose logs mongodb
```

5. **Restart backend service:**
```bash
docker-compose restart backend
```

### Common Issues

#### 1. Backend not starting
```bash
# Check backend logs
docker-compose logs backend

# Rebuild backend
docker-compose build backend
docker-compose up -d backend
```

#### 2. MongoDB connection failed
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

#### 3. Frontend can't connect to backend
```bash
# Check if backend is accessible
curl http://localhost:5000/

# Check network connectivity
docker network ls
docker network inspect attendanceportal-main_attendance-network
```

### Check Service Status
```bash
docker-compose ps
```

### View Service Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mongodb
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Clean Up
```bash
# Remove containers and images
docker-compose down --rmi all

# Remove everything including volumes
docker-compose down -v --rmi all
```

## 📝 Environment Variables

### Backend
- `NODE_ENV`: production
- `MONGODB_URI`: mongodb://admin:password123@mongodb:27017/attendanceportal?authSource=admin
- `PORT`: 5000
- `JWT_SECRET`: your-super-secret-jwt-key-change-in-production

### Frontend
- `NODE_ENV`: production

## 🔒 Security Notes

- Change default MongoDB credentials in production
- Update JWT_SECRET for production use
- Consider using Docker secrets for sensitive data

## 🚨 Quick Fix Commands

If the frontend shows connection errors:

```bash
# 1. Stop all services
docker-compose down

# 2. Clean up
docker system prune -f

# 3. Rebuild and start
docker-compose up --build -d

# 4. Check status
docker-compose ps

# 5. Test backend
curl http://localhost:5000/api/health
```
