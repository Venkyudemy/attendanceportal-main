# 🐳 Docker Deployment Guide

This guide covers deploying the Attendance Portal using Docker for both production and development environments.

## 🚀 Quick Start

### Production Deployment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Development Deployment
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development services
docker-compose -f docker-compose.dev.yml down
```

## 📁 Docker Files

### Frontend
- **`Dockerfile`** - Production build with nginx
- **`Dockerfile.dev`** - Development with hot reloading
- **`nginx.conf`** - Production nginx configuration

### Backend
- **`Dockerfile`** - Node.js production server

### Docker Compose
- **`docker-compose.yml`** - Production stack
- **`docker-compose.dev.yml`** - Development stack

## 🔧 Production Deployment

### Features
- ✅ Multi-stage builds for optimized images
- ✅ Non-root user for security
- ✅ Health checks for all services
- ✅ Proper service dependencies
- ✅ Production-optimized nginx configuration

### Build and Deploy
```bash
# Build and start production services
docker-compose up --build -d

# Check service status
docker-compose ps

# View service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mongodb
```

### Health Checks
- **Frontend**: `http://localhost/health`
- **Backend**: `http://localhost:5000/api/health`
- **MongoDB**: Database connection ping

## 🛠️ Development Deployment

### Features
- ✅ Hot reloading for frontend and backend
- ✅ Volume mounting for live code changes
- ✅ Development-specific environment variables
- ✅ Separate containers to avoid conflicts

### Start Development Environment
```bash
# Start development stack
docker-compose -f docker-compose.dev.yml up -d

# Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB: localhost:27017
```

### Development Workflow
1. Start development environment
2. Make code changes in your editor
3. Changes automatically reload in containers
4. View logs for debugging: `docker-compose -f docker-compose.dev.yml logs -f`

## 🔍 Troubleshooting

### Common Issues

#### Frontend Connection Error
**Problem**: "Connection error: Failed to fetch"
**Solution**: Ensure backend is running and accessible at `http://backend:5000`

#### Port Conflicts
**Problem**: Port already in use
**Solution**: Stop conflicting services or change ports in docker-compose files

#### Build Failures
**Problem**: Docker build fails
**Solution**: 
```bash
# Clean up and rebuild
docker-compose down
docker system prune -f
docker-compose up --build -d
```

### Debug Commands
```bash
# Check container status
docker ps -a

# View container logs
docker logs attendance-frontend
docker logs attendance-backend
docker logs attendance-mongodb

# Access container shell
docker exec -it attendance-frontend sh
docker exec -it attendance-backend sh

# Check network connectivity
docker network ls
docker network inspect attendanceportal-main_attendance-network
```

## 📊 Monitoring

### Health Check Endpoints
- **Frontend Health**: `http://localhost/health`
- **Backend Health**: `http://localhost:5000/api/health`

### Log Monitoring
```bash
# Follow all logs
docker-compose logs -f

# Follow specific service
docker-compose logs -f frontend

# View recent logs
docker-compose logs --tail=100 frontend
```

## 🔒 Security Features

### Production Security
- ✅ Non-root user execution
- ✅ Proper file permissions
- ✅ Security headers in nginx
- ✅ Environment variable isolation
- ✅ Network isolation

### Environment Variables
```bash
# Backend
NODE_ENV=production
MONGODB_URI=mongodb://admin:password123@mongodb:27017/attendanceportal?authSource=admin
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Frontend
NODE_ENV=production
GENERATE_SOURCEMAP=false
```

## 📈 Performance Optimization

### Frontend Optimizations
- ✅ Gzip compression
- ✅ Static asset caching
- ✅ Optimized build process
- ✅ Source map generation disabled

### Backend Optimizations
- ✅ Production mode
- ✅ Optimized dependencies
- ✅ Health monitoring

## 🚀 Deployment Commands

### Production
```bash
# Deploy to production
docker-compose up -d

# Update deployment
docker-compose pull
docker-compose up -d

# Scale services (if needed)
docker-compose up -d --scale backend=2
```

### Development
```bash
# Start development
docker-compose -f docker-compose.dev.yml up -d

# Rebuild after dependency changes
docker-compose -f docker-compose.dev.yml up --build -d
```

## 📝 Environment Configuration

### Production Environment
```bash
# Copy and edit environment file
cp .env.example .env

# Set production values
NODE_ENV=production
MONGODB_URI=mongodb://admin:password123@mongodb:27017/attendanceportal?authSource=admin
JWT_SECRET=your-production-secret-key
```

### Development Environment
```bash
# Development uses default values
# Hot reloading enabled
# Debug logging enabled
# Source maps enabled
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          docker-compose pull
          docker-compose up -d
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review container logs
3. Verify network connectivity
4. Check service dependencies
5. Ensure proper environment configuration
