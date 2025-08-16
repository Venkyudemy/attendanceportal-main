# Production Deployment Guide - Worldwide Access

This guide explains how to deploy your Attendance Portal application for worldwide access with MongoDB data persistence in Docker containers.

## 🌐 Worldwide Access Configuration

### Key Changes Made

1. **Frontend API URL**: Changed from `localhost:5000` to `backend:5000` (Docker service name)
2. **MongoDB Data Persistence**: All data saved in Docker containers with volume mounts
3. **Network Configuration**: Proper Docker networking for service communication
4. **Health Checks**: Comprehensive health monitoring for all services
5. **Environment Variables**: Production-ready configuration

## 🚀 Quick Production Deployment

### 1. Build and Start All Services
```bash
# Build and start all services
docker compose up --build -d

# Check service status
docker compose ps

# View logs
docker compose logs -f
```

### 2. Access Your Application
- **Frontend**: http://your-server-ip:3000
- **Backend API**: http://your-server-ip:5000
- **MongoDB**: your-server-ip:27017

## 🔧 Production Environment Setup

### Environment Variables for Production

Create a `.env` file in your project root:

```env
# Production Environment
NODE_ENV=production

# Frontend Configuration
REACT_APP_API_URL=http://your-domain.com/api

# Backend Configuration
PORT=5000
MONGO_URL=mongodb://mongo:27017/attendanceportal
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# MongoDB Configuration
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password123

# CORS Configuration (allow worldwide access)
CORS_ORIGIN=*
```

### Updated docker-compose.yml for Production

```yaml
version: "3.9"

services:
  frontend:
    build:
      context: ./Frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      backend:
        condition: service_healthy
    environment:
      - REACT_APP_API_URL=http://backend:5000/api
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - attendance-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  backend:
    build:
      context: ./Backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MONGO_URL=mongodb://mongo:27017/attendanceportal
      - JWT_SECRET=your-super-secret-jwt-key-change-in-production
      - CORS_ORIGIN=*
    depends_on:
      mongo:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - attendance-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 120s
    volumes:
      - backend_logs:/app/logs

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password123
    volumes:
      - mongo_data:/data/db
      - mongo_config:/data/configdb
    restart: unless-stopped
    networks:
      - attendance-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

volumes:
  mongo_data:
  mongo_config:
  backend_logs:

networks:
  attendance-network:
    driver: bridge
```

## 🌍 Domain and SSL Configuration

### 1. Domain Configuration

For worldwide access, configure your domain:

```bash
# Point your domain to your server IP
# Example DNS records:
# A     your-domain.com     -> YOUR_SERVER_IP
# A     www.your-domain.com -> YOUR_SERVER_IP
```

### 2. Nginx Reverse Proxy (Recommended)

Install Nginx on your host server:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 3. Nginx Configuration

Create `/etc/nginx/sites-available/attendance-portal`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health checks
    location /health {
        proxy_pass http://localhost:5000/api/health;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/attendance-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL Certificate (Let's Encrypt)

Install Certbot:

```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 🔒 Security Configuration

### 1. Firewall Setup

```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 2. Environment Security

```bash
# Generate strong JWT secret
openssl rand -base64 64

# Update your .env file with the generated secret
JWT_SECRET=your-generated-secret-here
```

### 3. MongoDB Security

```bash
# Create admin user
docker compose exec mongo mongosh --eval "
  use admin;
  db.createUser({
    user: 'admin',
    pwd: 'password123',
    roles: ['root']
  });
"

# Create application user
docker compose exec mongo mongosh --eval "
  use attendanceportal;
  db.createUser({
    user: 'appuser',
    pwd: 'apppassword123',
    roles: [
      { role: 'readWrite', db: 'attendanceportal' }
    ]
  });
"
```

## 📊 Monitoring and Logging

### 1. Health Monitoring

```bash
# Check all services
docker compose ps

# Monitor logs
docker compose logs -f

# Health check endpoints
curl http://your-domain.com/health
curl http://your-domain.com/api/health
```

### 2. Log Management

```bash
# View backend logs
docker compose logs backend

# View frontend logs
docker compose logs frontend

# View MongoDB logs
docker compose logs mongo
```

### 3. Performance Monitoring

```bash
# Check resource usage
docker stats

# Monitor disk usage
docker system df
```

## 🔄 Backup and Recovery

### 1. MongoDB Backup

```bash
# Create backup script
cat > backup-mongo.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker compose exec mongo mongodump \
  --db attendanceportal \
  --out /data/backup_$DATE

docker cp attendanceportal-main-mongo-1:/data/backup_$DATE $BACKUP_DIR/
echo "Backup completed: $BACKUP_DIR/backup_$DATE"
EOF

chmod +x backup-mongo.sh
```

### 2. Automated Backups

```bash
# Add to crontab (daily backup at 2 AM)
crontab -e

# Add this line:
0 2 * * * /path/to/your/project/backup-mongo.sh
```

## 🚨 Troubleshooting

### Common Issues

1. **Services won't start**
   ```bash
   # Check logs
   docker compose logs
   
   # Restart services
   docker compose restart
   ```

2. **MongoDB connection failed**
   ```bash
   # Check MongoDB status
   docker compose exec mongo mongosh --eval "db.adminCommand('ping')"
   
   # Check network
   docker network ls
   docker network inspect attendanceportal-main_attendance-network
   ```

3. **Frontend can't reach backend**
   ```bash
   # Check service names
   docker compose ps
   
   # Test internal communication
   docker compose exec frontend curl http://backend:5000/api/health
   ```

### Performance Issues

1. **High memory usage**
   ```bash
   # Check memory usage
   docker stats
   
   # Restart services
   docker compose restart
   ```

2. **Slow response times**
   ```bash
   # Check MongoDB performance
   docker compose exec mongo mongosh --eval "db.currentOp()"
   
   # Check backend logs
   docker compose logs backend | grep "slow"
   ```

## 📈 Scaling Considerations

### 1. Load Balancer

For high traffic, consider using a load balancer:

```yaml
# docker-compose.scale.yml
version: "3.9"

services:
  backend:
    build: ./Backend
    deploy:
      replicas: 3
    # ... other config
```

### 2. Database Scaling

For production databases, consider:
- MongoDB Atlas (cloud)
- MongoDB replica sets
- Database sharding

### 3. Caching

Add Redis for caching:

```yaml
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - attendance-network
```

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] Docker images built successfully
- [ ] All services running and healthy
- [ ] Domain configured and pointing to server
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] MongoDB users created
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Security measures implemented

## 🎯 Next Steps

1. **Deploy to your server** using the commands above
2. **Configure your domain** to point to your server
3. **Set up SSL** for secure HTTPS access
4. **Monitor performance** and adjust as needed
5. **Set up automated backups** for data safety
6. **Configure monitoring** for production alerts

Your application is now ready for worldwide access with persistent MongoDB data storage in Docker containers! 🚀
