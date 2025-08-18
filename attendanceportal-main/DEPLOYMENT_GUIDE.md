# 🚀 Attendance Portal Deployment Guide

## 📋 Prerequisites

Before deploying the Attendance Portal, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Git** (for cloning the repository)

## 🔧 Quick Deployment

### Option 1: Automated Deployment (Recommended)

#### For Linux/Mac:
```bash
chmod +x deploy.sh
./deploy.sh
```

#### For Windows:
```cmd
deploy.bat
```

### Option 2: Manual Deployment

```bash
# Clone the repository
git clone <your-repository-url>
cd attendanceportal-main

# Build and start services
docker-compose up --build -d

# Check status
docker-compose ps
```

## 🌐 Application Access

After successful deployment, access your application at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🔑 Default Admin Login

```
Email: admin@techcorp.com
Password: [Contact system administrator for credentials]
```

## ⏰ Working Hours Configuration

The application is configured with the following working hours:

- **Check-in Time**: 9:00 AM
- **Check-out Time**: 5:45 PM (17:45)
- **Late Arrival Threshold**: 9:15 AM (15 minutes grace period)

## 🔒 Security Features

- ✅ **No Registration**: Users cannot create new accounts
- ✅ **Admin-Only Access**: Only authorized users can access the system
- ✅ **JWT Authentication**: Secure token-based authentication
- ✅ **Controlled Access**: Admin manages all user accounts

## 📊 Services Overview

The application consists of three main services:

1. **Frontend** (React.js)
   - Port: 3000
   - Technology: React, Nginx

2. **Backend** (Node.js/Express)
   - Port: 5000
   - Technology: Node.js, Express, MongoDB

3. **Database** (MongoDB)
   - Port: 27017
   - Technology: MongoDB 6

## 🛠️ Management Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up --build -d
```

### Backup Database
```bash
# Create backup
docker-compose exec mongo mongodump --out /data/backup

# Copy backup to host
docker cp attendanceportal-main_mongo_1:/data/backup ./backup
```

## 🔧 Environment Variables

Key environment variables in `docker-compose.yml`:

```yaml
# Backend Configuration
NODE_ENV: production
PORT: 5000
MONGO_URL: mongodb://mongo:27017/attendanceportal
JWT_SECRET: your-super-secret-jwt-key-change-in-production

# Working Hours
WORKING_HOURS_START: 09:00
WORKING_HOURS_END: 17:45
LATE_THRESHOLD_MINUTES: 15

# Timezone
TZ: Asia/Kolkata
```

## 🚨 Production Considerations

### Security
1. **Change JWT Secret**: Update `JWT_SECRET` in production
2. **Use HTTPS**: Configure SSL certificates for production
3. **Firewall**: Restrict access to necessary ports only
4. **Database Security**: Use strong MongoDB authentication

### Performance
1. **Resource Limits**: Set appropriate CPU/memory limits
2. **Load Balancing**: Use Nginx or similar for high traffic
3. **Monitoring**: Implement application monitoring
4. **Backup Strategy**: Regular database backups

### Scaling
1. **Horizontal Scaling**: Use Docker Swarm or Kubernetes
2. **Database Clustering**: MongoDB replica sets
3. **Caching**: Implement Redis for session management

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :5000

# Kill the process or change ports in docker-compose.yml
```

#### 2. MongoDB Connection Issues
```bash
# Check MongoDB logs
docker-compose logs mongo

# Restart MongoDB
docker-compose restart mongo
```

#### 3. Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up --build frontend
```

#### 4. Admin User Not Created
```bash
# Manually create admin user
docker-compose exec backend node scripts/createAdmin.js
```

### Health Checks

```bash
# Check all services
docker-compose ps

# Check specific service health
docker-compose exec backend node healthcheck.js
```

## 📞 Support

For deployment issues or questions:

1. Check the logs: `docker-compose logs -f`
2. Verify Docker is running: `docker info`