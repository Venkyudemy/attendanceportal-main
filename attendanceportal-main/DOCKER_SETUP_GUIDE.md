# 🐳 Docker Setup Guide for Attendance Portal

## 🚀 Quick Start

### 1. Start the Application
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

## 🔧 What's New in This Update

### ✅ Improved Dockerfile
- Added `bash`, `git`, and other essential tools
- Better handling of line endings (Windows compatibility)
- Proper permissions for logs directory
- Enhanced health checks

### ✅ Enhanced Docker Compose
- Better service startup order
- Improved health checks
- Automatic admin user creation
- MongoDB replication setup
- Volume mounting for logs

### ✅ Optimized Startup Scripts
- Better MongoDB connection handling
- Improved admin user creation process
- Enhanced error handling and logging

## 🗄️ Admin User Creation

The system automatically creates admin users when starting:

**Default Admin:**
- **Email**: `admin@techcorp.com`
- **Password**: `password123`

**Default Employee:**
- **Email**: `venkatesh@gmail.com`
- **Password**: `venkatesh`

## 🔍 Troubleshooting

### Check Service Status
```bash
# Check all services
docker-compose ps

# Check specific service logs
docker-compose logs backend
docker-compose logs mongo
docker-compose logs frontend
```

### Reset Everything
```bash
# Stop and remove everything
docker-compose down -v

# Rebuild and start
docker-compose up --build -d
```

### Check Admin Users
```bash
# Connect to MongoDB
docker-compose exec mongo mongosh attendanceportal

# Check users
db.employees.find({role: "admin"})
db.employees.find({})
```

## 🚨 Common Issues

### 1. Port Already in Use
```bash
# Check what's using the ports
netstat -an | findstr ":3000\|:5000\|:27017"

# Kill processes if needed
taskkill /F /PID <PID>
```

### 2. MongoDB Connection Issues
```bash
# Check MongoDB logs
docker-compose logs mongo

# Restart MongoDB
docker-compose restart mongo
```

### 3. Admin User Not Created
```bash
# Check backend logs
docker-compose logs backend

# Manually create admin
docker-compose exec backend node initAdmin.js
```

## 📁 File Structure

```
attendanceportal-main/
├── Backend/
│   ├── Dockerfile          # Backend container configuration
│   ├── docker-start.sh     # Startup script
│   ├── initAdmin.js        # Admin user creation
│   └── scripts/
│       └── init-mongo.js   # MongoDB initialization
├── Frontend/
│   └── Dockerfile          # Frontend container configuration
├── docker-compose.yml      # Service orchestration
└── DOCKER_SETUP_GUIDE.md   # This guide
```

## 🎯 Next Steps

1. **Start the application**: `docker-compose up -d`
2. **Wait for services to be healthy** (check with `docker-compose ps`)
3. **Access frontend**: http://localhost:3000
4. **Login with admin**: `admin@techcorp.com` / `password123`

## 💡 Tips

- **First time**: Use `docker-compose up --build` to build images
- **Subsequent runs**: Use `docker-compose up -d` for faster startup
- **View logs**: Use `docker-compose logs -f` to monitor in real-time
- **Reset database**: Use `docker-compose down -v` to clear all data

---

**🎉 Your attendance portal should now work perfectly with Docker!**
