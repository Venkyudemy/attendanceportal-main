# 🚀 Attendance Portal - Production Deployment Guide

## 📋 Overview

This guide explains how to deploy the Attendance Portal application with proper admin user creation and database initialization.

## 🏗️ Architecture

- **Frontend**: React + Nginx (Port 3000)
- **Backend**: Node.js + Express (Port 5000)
- **Database**: MongoDB (Port 27017)
- **Containerization**: Docker + Docker Compose

## 🚀 Quick Deployment

### Option 1: Automated Deployment (Recommended)

#### For Linux/Mac:
```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

#### For Windows:
```cmd
deploy-production.bat
```

### Option 2: Manual Deployment

```bash
# 1. Stop existing containers
docker-compose down --remove-orphans

# 2. Build and start services
docker-compose up --build -d

# 3. Wait for initialization (60 seconds)
sleep 60

# 4. Check service status
docker-compose ps
```

## 🔑 Admin Login Credentials

After deployment, use these credentials to log in:

- **Email**: `admin@techcorp.com`
- **Password**: `password123`

## 🔧 Deployment Process Explained

### Why Admin User Creation Fails Without Proper Initialization

1. **Container Isolation**: Docker containers are isolated environments
2. **Database Connection**: Backend container connects to MongoDB container
3. **Timing Issues**: MongoDB needs time to start up
4. **Script Execution**: Admin creation scripts must run inside the backend container

### How Our Solution Works

1. **Robust Initialization Script** (`Backend/scripts/init-deployment.js`):
   - Waits for MongoDB to be ready with retry logic
   - Creates admin user with proper structure
   - Verifies admin user creation
   - Handles errors gracefully

2. **Docker Compose Integration**:
   - Runs initialization script before starting the server
   - Ensures proper service dependencies
   - Provides adequate wait times

3. **Verification Process**:
   - Checks if admin user exists
   - Tests password verification
   - Confirms role assignment

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. "Invalid username and password" Error

**Cause**: Admin user not created in database
**Solution**: 
```bash
# Check backend logs
docker-compose logs backend

# Restart deployment
./deploy-production.sh
```

#### 2. MongoDB Connection Failed

**Cause**: MongoDB container not ready
**Solution**:
```bash
# Check MongoDB status
docker-compose ps mongo

# Check MongoDB logs
docker-compose logs mongo

# Restart MongoDB
docker-compose restart mongo
```

#### 3. Backend Service Not Starting

**Cause**: Initialization script failing
**Solution**:
```bash
# Check backend logs for errors
docker-compose logs backend

# Manually run initialization
docker-compose exec backend node scripts/init-deployment.js
```

#### 4. Frontend Can't Connect to Backend

**Cause**: API URL configuration issue
**Solution**:
```bash
# Check frontend environment
docker-compose exec frontend env | grep REACT_APP_API_URL

# Update API URL if needed
# Edit docker-compose.yml and restart
docker-compose restart frontend
```

### Manual Admin User Creation

If automatic creation fails, manually create admin user:

```bash
# Connect to backend container
docker-compose exec backend bash

# Run admin creation script
node scripts/init-deployment.js

# Exit container
exit
```

### Database Reset

To completely reset the database:

```bash
# Stop all services
docker-compose down

# Remove MongoDB volume
docker volume rm attendanceportal-main_mongo_data

# Restart deployment
./deploy-production.sh
```

## 📊 Service Status Commands

```bash
# Check all services
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo

# Check service health
docker-compose exec backend curl http://localhost:5000/api/health
```

## 🔒 Security Considerations

1. **Change Default Passwords**: Update admin password after first login
2. **Environment Variables**: Use proper JWT_SECRET in production
3. **Network Security**: Configure firewall rules appropriately
4. **SSL/TLS**: Use HTTPS in production environments

## 🌐 External Deployment

For external server deployment:

1. **Update API URL**: Change `REACT_APP_API_URL` in docker-compose.yml
2. **Configure Firewall**: Open ports 3000, 5000, and 27017
3. **Domain Setup**: Configure domain name and SSL certificates
4. **Environment Variables**: Set production environment variables

## 📝 Useful Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Update deployment
./deploy-production.sh

# View logs
docker-compose logs -f

# Access backend shell
docker-compose exec backend bash

# Access MongoDB shell
docker-compose exec mongo mongosh
```

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify service status: `docker-compose ps`
3. Test admin login manually
4. Review this troubleshooting guide
5. Check GitHub issues for known problems

## ✅ Success Indicators

Deployment is successful when:

- ✅ All services show "Up" status
- ✅ Backend logs show "Admin user verification successful"
- ✅ Admin login works with provided credentials
- ✅ Frontend loads without errors
- ✅ No connection errors in browser console