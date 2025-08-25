# Multi-Instance Deployment Guide

## Overview
This guide explains how to deploy the Attendance Portal application across multiple server instances using private IP connections for optimal performance and security.

## Architecture

### Server Layout
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    MongoDB      │
│   Server        │    │    Server       │    │    Server       │
│                 │    │                 │    │                 │
│ Port: 3000      │    │ Port: 5000      │    │ Port: 27017     │
│ Private IP:     │    │ Private IP:     │    │ Private IP:     │
│ 10.0.1.10      │    │ 10.0.1.20      │    │ 10.0.1.30      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    Private Network Communication
```

## Deployment Files

### 1. MongoDB Server (`database/docker-compose.mongo.yml`)
```yaml
version: '3.8'
services:
  mongo:
    image: mongo:6
    container_name: mongo
    ports:
      - "27017:27017"
    environment:
      - TZ=Asia/Kolkata
    volumes:
      - mongo_data:/data/db
      - ./scripts:/docker-entrypoint-initdb.d:ro
    restart: unless-stopped
    command: mongod --bind_ip_all
```

### 2. Backend Server (`Backend/docker-compose.backend.yml`)
```yaml
version: '3.8'
services:
  backend:
    build:
      context: ./Backend
      dockerfile: Dockerfile
    container_name: backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URL=mongodb://<MONGO_PRIVATE_IP>:27017/attendanceportal
      # ... other environment variables
    restart: unless-stopped
    command: npm start
```

### 3. Frontend Server (`Frontend/docker-compose.frontend.yml`)
```yaml
version: '3.8'
services:
  frontend:
    build:
      context: ./Frontend
      dockerfile: Dockerfile
    container_name: frontend
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://<BACKEND_PRIVATE_IP>:5000/api
      - TZ=Asia/Kolkata
    restart: unless-stopped
```

## Deployment Steps

### Step 1: Deploy MongoDB Server

#### 1.1. On MongoDB Server Instance
```bash
# Clone the repository
git clone https://github.com/Venkyudemy/attendanceportal-main.git
cd attendanceportal-main

# Copy MongoDB compose file
cp database/docker-compose.mongo.yml docker-compose.yml

# Start MongoDB
docker-compose up -d

# Verify MongoDB is running
docker-compose ps
docker logs mongo
```

#### 1.2. Get MongoDB Private IP
```bash
# Get the private IP address
ip addr show | grep inet
# or
hostname -I
```

**Note:** Remember this IP (e.g., `10.0.1.30`) for backend configuration.

### Step 2: Deploy Backend Server

#### 2.1. On Backend Server Instance
```bash
# Clone the repository
git clone https://github.com/Venkyudemy/attendanceportal-main.git
cd attendanceportal-main

# Copy backend compose file
cp Backend/docker-compose.backend.yml docker-compose.yml

# Edit the compose file to set MongoDB private IP
sed -i 's/<MONGO_PRIVATE_IP>/10.0.1.30/g' docker-compose.yml

# Start backend
docker-compose up -d

# Verify backend is running
docker-compose ps
docker logs backend
```

#### 2.2. Get Backend Private IP
```bash
# Get the private IP address
ip addr show | grep inet
# or
hostname -I
```

**Note:** Remember this IP (e.g., `10.0.1.20`) for frontend configuration.

### Step 3: Deploy Frontend Server

#### 3.1. On Frontend Server Instance (Method 1: Manual)
```bash
# Clone the repository
git clone https://github.com/Venkyudemy/attendanceportal-main.git
cd attendanceportal-main

# Copy frontend compose file
cp Frontend/docker-compose.frontend.yml docker-compose.yml

# Edit the compose file to set backend private IP
sed -i 's/<BACKEND_PRIVATE_IP>/10.0.1.20/g' docker-compose.yml

# Start frontend
docker-compose up -d

# Verify frontend is running
docker-compose ps
docker logs frontend
```

#### 3.2. On Frontend Server Instance (Method 2: Automated Script)
```bash
# Clone the repository
git clone https://github.com/Venkyudemy/attendanceportal-main.git
cd attendanceportal-main/Frontend

# Make the deployment script executable
chmod +x deploy-frontend.sh

# Deploy frontend with backend IP
./deploy-frontend.sh 10.0.1.20
```

#### 3.3. On Frontend Server Instance (Method 3: Windows)
```cmd
# Clone the repository
git clone https://github.com/Venkyudemy/attendanceportal-main.git
cd attendanceportal-main\Frontend

# Deploy frontend with backend IP
deploy-frontend.bat 10.0.1.20
```

## Configuration Examples

### Example 1: AWS EC2 Instances
```bash
# MongoDB Server (10.0.1.30)
MONGO_PRIVATE_IP=10.0.1.30

# Backend Server (10.0.1.20)
MONGO_URL=mongodb://10.0.1.30:27017/attendanceportal

# Frontend Server (10.0.1.10)
REACT_APP_API_URL=http://10.0.1.20:5000/api
```

### Example 2: DigitalOcean Droplets
```bash
# MongoDB Server (10.116.0.30)
MONGO_PRIVATE_IP=10.116.0.30

# Backend Server (10.116.0.20)
MONGO_URL=mongodb://10.116.0.30:27017/attendanceportal

# Frontend Server (10.116.0.10)
REACT_APP_API_URL=http://10.116.0.20:5000/api
```

### Example 3: Google Cloud VMs
```bash
# MongoDB Server (10.132.0.30)
MONGO_PRIVATE_IP=10.132.0.30

# Backend Server (10.132.0.20)
MONGO_URL=mongodb://10.132.0.30:27017/attendanceportal

# Frontend Server (10.132.0.10)
REACT_APP_API_URL=http://10.132.0.20:5000/api
```

## Security Configuration

### 1. MongoDB Security
```yaml
# In docker-compose.mongo.yml
services:
  mongo:
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=secure_password
    command: mongod --bind_ip_all --auth
```

### 2. Backend Security
```yaml
# In docker-compose.backend.yml
services:
  backend:
    environment:
      - MONGO_URL=mongodb://admin:secure_password@10.0.1.30:27017/attendanceportal
      - JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 3. Network Security
```bash
# Configure firewall rules
# MongoDB Server
sudo ufw allow from 10.0.1.0/24 to any port 27017

# Backend Server
sudo ufw allow from 10.0.1.0/24 to any port 5000

# Frontend Server
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
```

## Monitoring and Health Checks

### 1. MongoDB Health Check
```bash
# Check MongoDB status
docker exec mongo mongosh --eval "db.adminCommand('ping')"

# Check MongoDB logs
docker logs mongo

# Check MongoDB metrics
docker exec mongo mongosh --eval "db.stats()"
```

### 2. Backend Health Check
```bash
# Check backend status
curl http://10.0.1.20:5000/api/health

# Check admin status
curl http://10.0.1.20:5000/api/admin/status

# Check backend logs
docker logs backend
```

### 3. Frontend Health Check
```bash
# Check frontend status
curl http://10.0.1.10:3000

# Check frontend logs
docker logs frontend
```

## Troubleshooting

### 1. Connection Issues

#### MongoDB Connection Failed
```bash
# Check MongoDB is running
docker ps | grep mongo

# Check MongoDB logs
docker logs mongo

# Test MongoDB connection
telnet 10.0.1.30 27017

# Check firewall rules
sudo ufw status
```

#### Backend Connection Failed
```bash
# Check backend is running
docker ps | grep backend

# Check backend logs
docker logs backend

# Test backend connection
curl http://10.0.1.20:5000/api/health

# Check MongoDB connection from backend
docker exec backend ping 10.0.1.30
```

#### Frontend Connection Failed
```bash
# Check frontend is running
docker ps | grep frontend

# Check frontend logs
docker logs frontend

# Test frontend connection
curl http://10.0.1.10:3000

# Check backend connection from frontend
docker exec frontend ping 10.0.1.20
```

### 2. Admin User Issues
```bash
# Check admin user status
curl http://10.0.1.20:5000/api/admin/status

# Manually create admin user
curl -X POST http://10.0.1.20:5000/api/admin/init

# Check admin user in MongoDB
docker exec mongo mongosh attendanceportal --eval "db.employees.findOne({email: 'admin@techcorp.com'})"
```

### 3. Data Persistence Issues
```bash
# Check MongoDB volume
docker volume ls | grep mongo_data

# Check volume contents
docker run --rm -v attendanceportal-main_mongo_data:/data mongo:6 ls -la /data

# Backup MongoDB data
docker run --rm -v attendanceportal-main_mongo_data:/data -v $(pwd):/backup mongo:6 tar czf /backup/mongo_backup.tar.gz /data
```

## Performance Optimization

### 1. MongoDB Optimization
```yaml
# In docker-compose.mongo.yml
services:
  mongo:
    command: mongod --bind_ip_all --wiredTigerCacheSizeGB 2
    ulimits:
      nproc: 64000
      nofile:
        soft: 64000
        hard: 64000
```

### 2. Backend Optimization
```yaml
# In docker-compose.backend.yml
services:
  backend:
    environment:
      - NODE_ENV=production
      - NODE_OPTIONS=--max-old-space-size=2048
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

### 3. Frontend Optimization
```yaml
# In docker-compose.frontend.yml
services:
  frontend:
    environment:
      - NODE_ENV=production
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

## Backup and Recovery

### 1. MongoDB Backup
```bash
# Create backup script
cat > backup_mongo.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
docker run --rm -v attendanceportal-main_mongo_data:/data -v $BACKUP_DIR:/backup mongo:6 tar czf /backup/mongo_backup_$DATE.tar.gz /data
echo "Backup created: mongo_backup_$DATE.tar.gz"
EOF

chmod +x backup_mongo.sh
```

### 2. Automated Backup
```bash
# Add to crontab
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * /path/to/backup_mongo.sh
```

### 3. Restore MongoDB
```bash
# Restore from backup
docker run --rm -v attendanceportal-main_mongo_data:/data -v /backup:/backup mongo:6 tar xzf /backup/mongo_backup_20231201_020000.tar.gz -C /
```

## Scaling Considerations

### 1. MongoDB Scaling
- Consider MongoDB replica sets for high availability
- Use MongoDB Atlas for managed MongoDB service
- Implement read replicas for read-heavy workloads

### 2. Backend Scaling
- Use load balancer for multiple backend instances
- Implement horizontal scaling with multiple backend containers
- Consider using Redis for session management

### 3. Frontend Scaling
- Use CDN for static assets
- Implement caching strategies
- Consider using a reverse proxy like Nginx

## Best Practices

### 1. Security
- Change default passwords
- Use environment variables for sensitive data
- Implement proper firewall rules
- Regular security updates

### 2. Monitoring
- Set up log aggregation
- Implement health checks
- Monitor resource usage
- Set up alerts for failures

### 3. Maintenance
- Regular backups
- Update dependencies
- Monitor disk space
- Clean up old containers and images

## Quick Start Commands

### Complete Deployment
```bash
# 1. Deploy MongoDB
cd attendanceportal-main
cp database/docker-compose.mongo.yml docker-compose.yml
docker-compose up -d

# 2. Deploy Backend (replace IP)
cp Backend/docker-compose.backend.yml docker-compose.yml
sed -i 's/<MONGO_PRIVATE_IP>/10.0.1.30/g' docker-compose.yml
docker-compose up -d

# 3. Deploy Frontend (replace IP)
cp Frontend/docker-compose.frontend.yml docker-compose.yml
sed -i 's/<BACKEND_PRIVATE_IP>/10.0.1.20/g' docker-compose.yml
docker-compose up -d
```

### Health Check
```bash
# Check all services
curl http://10.0.1.30:27017  # MongoDB
curl http://10.0.1.20:5000/api/health  # Backend
curl http://10.0.1.10:3000  # Frontend
```
