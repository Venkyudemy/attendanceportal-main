# 🚀 Deployment Guide

This guide covers deploying the Attendance Portal using Docker for production environments.

## 🐳 Quick Deployment

### Option 1: Using Deployment Scripts

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Windows:**
```cmd
deploy.bat
```

### Option 2: Manual Deployment

```bash
# Stop existing containers
docker-compose down

# Clean up old images
docker system prune -f

# Build and start services
docker-compose up --build -d

# Check status
docker-compose ps
```

## 📁 Docker Files

### Production Files
- **`docker-compose.yml`** - Standard production stack
- **`docker-compose.prod.yml`** - Production with resource limits
- **`Frontend/Dockerfile`** - Production React build with nginx
- **`Backend/Dockerfile`** - Production Node.js server

### Development Files
- **`docker-compose.dev.yml`** - Development environment
- **`Frontend/Dockerfile.dev`** - Development with hot reloading

## 🔧 Production Deployment

### Features
- ✅ Multi-stage builds for optimized images
- ✅ Non-root user execution for security
- ✅ Health checks for all services
- ✅ Proper service dependencies
- ✅ Resource limits and monitoring
- ✅ Production-optimized configurations

### Environment Variables

**Backend:**
```env
NODE_ENV=production
MONGODB_URI=mongodb://admin:password123@mongodb:27017/attendanceportal?authSource=admin
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Frontend:**
```env
NODE_ENV=production
```

### Health Check Endpoints
- **Frontend**: `http://localhost/health`
- **Backend**: `http://localhost:5000/api/health`
- **MongoDB**: Database connection ping

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check what's using port 80
netstat -tulpn | grep :80

# Check what's using port 5000
netstat -tulpn | grep :5000
```

#### 2. Build Failures
```bash
# Clean everything and rebuild
docker-compose down
docker system prune -af
docker-compose up --build -d
```

#### 3. Connection Issues
```bash
# Check container logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mongodb

# Check network connectivity
docker network ls
docker network inspect attendanceportal-main_attendance-network
```

#### 4. Memory Issues
```bash
# Check container resource usage
docker stats

# Use production compose with resource limits
docker-compose -f docker-compose.prod.yml up -d
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

# Check health status
docker-compose exec frontend curl -f http://localhost/health
docker-compose exec backend curl -f http://localhost:5000/api/health
```

## 📊 Monitoring

### Health Monitoring
```bash
# Check all service health
docker-compose ps

# Monitor logs in real-time
docker-compose logs -f

# Monitor specific service
docker-compose logs -f frontend
```

### Performance Monitoring
```bash
# Check resource usage
docker stats

# Check disk usage
docker system df
```

## 🔒 Security

### Production Security Features
- ✅ Non-root user execution
- ✅ Proper file permissions
- ✅ Security headers in nginx
- ✅ Environment variable isolation
- ✅ Network isolation
- ✅ Resource limits

### Security Checklist
- [ ] Change default MongoDB credentials
- [ ] Update JWT_SECRET
- [ ] Configure firewall rules
- [ ] Enable HTTPS (recommended)
- [ ] Set up monitoring and logging

## 🚀 Scaling

### Horizontal Scaling
```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Scale with load balancer
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Resource Optimization
```bash
# Use production compose with resource limits
docker-compose -f docker-compose.prod.yml up -d

# Monitor resource usage
docker stats
```

## 📝 Environment Configuration

### Production Environment
```bash
# Create production environment file
cp .env.example .env.prod

# Edit production values
nano .env.prod

# Use production environment
docker-compose --env-file .env.prod up -d
```

### Custom Configuration
```bash
# Override specific values
MONGODB_URI=mongodb://custom:password@mongodb:27017/customdb docker-compose up -d

# Use external MongoDB
MONGODB_URI=mongodb://external-host:27017/database docker-compose up -d
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

### Automated Deployment
```bash
# Pull latest changes
git pull origin main

# Deploy with zero downtime
docker-compose pull
docker-compose up -d --no-deps
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## 🆘 Support

For deployment issues:
1. Check the troubleshooting section
2. Review container logs
3. Verify network connectivity
4. Check service dependencies
5. Ensure proper environment configuration
6. Monitor resource usage
