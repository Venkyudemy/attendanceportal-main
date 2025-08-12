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
docker-compose restart frontend
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
