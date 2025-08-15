# Deployment Instructions for Public Access

This document explains how to deploy your Attendance Portal application so it can be accessed publicly without localhost issues.

## Overview of Changes Made

1. **Backend**: Already configured to listen on `0.0.0.0:5000` with CORS support
2. **Frontend**: Updated to use environment variables for API URLs
3. **Docker Compose**: Configured with proper networking and port exposure
4. **Nginx**: Added API proxy functionality to route `/api` requests to backend
5. **Jenkins**: Created automated deployment pipeline

## Architecture

```
Internet → AWS Load Balancer → Port 80 → Nginx (Frontend + API Proxy) → Backend:5000
```

- **Port 80**: Serves the React frontend and proxies API requests
- **Port 5000**: Backend API service (exposed for direct access if needed)
- **Internal Communication**: Frontend and backend communicate via Docker network

## Prerequisites

- Docker and Docker Compose installed on your server
- Jenkins configured with Docker credentials
- AWS Load Balancer pointing to your server's port 80

## Quick Start (Local Testing)

1. **Clone and navigate to project**:
   ```bash
   cd attendanceportal-main
   ```

2. **Build and run**:
   ```bash
   docker-compose up --build
   ```

3. **Access application**:
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - API via proxy: http://localhost/api

## Production Deployment

### Option 1: Manual Deployment

1. **Set environment variables**:
   ```bash
   export NODE_ENV=production
   export REACT_APP_API_URL=/api
   export PORT=5000
   export JWT_SECRET=your-secure-jwt-secret
   ```

2. **Build and deploy**:
   ```bash
   docker-compose -f docker-compose.yml down
   docker-compose -f docker-compose.yml up --build -d
   ```

3. **Verify deployment**:
   ```bash
   curl http://localhost/api/health
   curl http://localhost/health
   ```

### Option 2: Jenkins Automated Deployment

1. **Configure Jenkins**:
   - Install Docker plugin
   - Add Docker registry credentials
   - Update `DOCKER_REGISTRY` in Jenkinsfile

2. **Run pipeline**:
   - Jenkins will automatically build, test, and deploy
   - Monitor deployment in Jenkins console

## Environment Configuration

### Production Environment File
Copy `env.production` to `.env` and customize:
```bash
cp env.production .env
```

### Key Environment Variables
- `NODE_ENV=production`: Sets production mode
- `REACT_APP_API_URL=/api`: Frontend uses relative API paths
- `PORT=5000`: Backend listens on port 5000
- `JWT_SECRET`: Secure JWT signing key

## AWS Load Balancer Configuration

1. **Target Group**:
   - Protocol: HTTP
   - Port: 80
   - Health Check Path: `/health`

2. **Security Groups**:
   - Inbound: HTTP (80) from 0.0.0.0/0
   - Optional: HTTPS (443) for SSL termination

3. **Health Check**:
   - Path: `/health`
   - Interval: 30 seconds
   - Timeout: 5 seconds
   - Healthy threshold: 2
   - Unhealthy threshold: 3

## Troubleshooting

### Common Issues

1. **Frontend can't connect to backend**:
   - Check if backend container is running: `docker ps`
   - Verify network connectivity: `docker network ls`
   - Check backend logs: `docker logs attendance-backend`

2. **API calls return 502 Bad Gateway**:
   - Verify backend health: `curl http://localhost:5000/api/health`
   - Check Nginx logs: `docker logs attendance-frontend`
   - Ensure backend is accessible from frontend container

3. **CORS errors**:
   - Backend CORS is configured to allow all origins in production
   - Check if `NODE_ENV=production` is set

### Health Checks

```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend health
curl http://localhost/health

# API via proxy
curl http://localhost/api/health

# Container status
docker ps
docker logs attendance-backend
docker logs attendance-frontend
```

## Monitoring and Logs

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Real-time logs
docker logs -f attendance-backend
docker logs -f attendance-frontend
```

### Performance Monitoring
- Nginx access logs: `/var/log/nginx/access.log`
- Nginx error logs: `/var/log/nginx/error.log`
- Backend logs: Docker container logs

## Security Considerations

1. **JWT Secret**: Change default JWT secret in production
2. **MongoDB**: Use strong passwords and restrict network access
3. **Environment Variables**: Never commit secrets to version control
4. **Firewall**: Only expose necessary ports (80, 443)
5. **HTTPS**: Consider adding SSL termination at load balancer

## Scaling

### Horizontal Scaling
```yaml
# In docker-compose.yml
backend:
  deploy:
    replicas: 3
  ports:
    - "5000-5002:5000"
```

### Load Balancer
- Use AWS Application Load Balancer for better traffic distribution
- Configure sticky sessions if needed
- Monitor metrics and scale based on demand

## Backup and Recovery

1. **Database Backup**:
   ```bash
   docker exec attendance-mongodb mongodump --out /backup
   docker cp attendance-mongodb:/backup ./backup
   ```

2. **Configuration Backup**:
   - Backup `.env` files
   - Backup `docker-compose.yml`
   - Backup Nginx configuration

## Support

For issues or questions:
1. Check container logs first
2. Verify environment variables
3. Test individual services
4. Check network connectivity between containers

## Summary

Your application is now configured to:
- ✅ Listen on all interfaces (0.0.0.0)
- ✅ Use environment variables for configuration
- ✅ Support CORS for cross-origin requests
- ✅ Proxy API requests through Nginx
- ✅ Work with AWS Load Balancer
- ✅ Support Jenkins automated deployment

The frontend will now work correctly when accessed via your AWS Load Balancer DNS, and users will be able to log in without localhost connection issues.
