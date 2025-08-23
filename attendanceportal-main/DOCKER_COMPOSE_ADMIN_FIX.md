# 🐳 Docker Compose Admin User Fix Guide

## 🚨 **Problem Summary**

Your Docker Compose setup has:
- ✅ Backend connects to MongoDB successfully
- ❌ No admin user created automatically
- ❌ Login always fails
- ❌ Helper scripts never run

## 🔧 **Solution Overview**

I've implemented a **dual approach** to ensure admin user creation:

1. **MongoDB Initialization Script** - Runs when MongoDB container starts
2. **Backend Startup Script** - Runs when backend container starts
3. **Fallback Mechanisms** - Multiple ways to create admin user

## 📁 **Files Created/Modified**

### **1. `docker-compose.yml`**
- Added MongoDB initialization script mounting
- Proper service dependencies with health checks
- Environment variables for admin creation

### **2. `Backend/scripts/init-mongo.js`**
- **Automatically runs** when MongoDB container starts
- Creates admin user with hashed password
- Creates sample employee user
- Sets up database indexes

### **3. `Backend/Dockerfile`**
- Uses startup script instead of direct `npm start`
- Installs necessary tools (curl, netcat)
- Proper health checks

### **4. `Backend/docker-start.sh`**
- Waits for MongoDB to be ready
- Runs admin user creation scripts
- Ensures admin exists before starting app

### **5. `Backend/scripts/verify-admin.js`**
- Verification script to check admin user
- Can be run manually to troubleshoot

## 🚀 **How to Deploy**

### **Step 1: Update Your Files**
Copy the updated files to your project:
- `docker-compose.yml`
- `Backend/scripts/init-mongo.js`
- `Backend/Dockerfile`
- `Backend/docker-start.sh`
- `Backend/scripts/verify-admin.js`

### **Step 2: Rebuild and Start**
```bash
# Stop existing containers
docker-compose down

# Remove existing volumes (if you want fresh start)
docker volume rm attendanceportal-main_mongodb_data

# Rebuild and start
docker-compose up --build
```

### **Step 3: Monitor the Logs**
```bash
# Watch MongoDB initialization
docker-compose logs mongodb

# Watch backend startup
docker-compose logs backend

# Watch all services
docker-compose logs -f
```

## 🔍 **How It Works**

### **1. MongoDB Container Starts**
```
MongoDB Container → Runs init-mongo.js → Creates admin user
```

### **2. Backend Container Starts**
```
Backend Container → Waits for MongoDB → Runs startup scripts → Starts app
```

### **3. Admin User Creation**
```
Multiple Scripts → Ensure admin exists → Fallback mechanisms
```

## ✅ **Verification Steps**

### **1. Check MongoDB Logs**
```bash
docker-compose logs mongodb
```
Look for:
```
🚀 MongoDB initialization starting...
✅ Admin user created successfully
🎉 MongoDB initialization completed successfully!
```

### **2. Check Backend Logs**
```bash
docker-compose logs backend
```
Look for:
```
✅ MongoDB is ready!
✅ Admin user creation completed
🎯 Starting Node.js application...
```

### **3. Verify Admin User in MongoDB**
```bash
# Connect to MongoDB container
docker exec -it attendance-mongodb mongosh attendanceportal

# Check admin user
db.employees.findOne({email: "admin@techcorp.com"})

# Check total users
db.employees.countDocuments()
```

### **4. Test Login API**
```bash
# Test admin login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techcorp.com","password":"password123"}'
```

### **5. Run Verification Script**
```bash
# Run from backend container
docker exec -it attendance-backend node scripts/verify-admin.js
```

## 🔑 **Default Credentials**

- **Admin:** `admin@techcorp.com` / `password123`
- **Employee:** `venkatesh@gmail.com` / `venkatesh`

## 🚨 **Troubleshooting**

### **Issue 1: Admin User Still Not Created**
```bash
# Check if MongoDB init script ran
docker-compose logs mongodb | grep "Admin user"

# Manually run admin creation
docker exec -it attendance-backend node scripts/createAdminUser.js
```

### **Issue 2: Backend Can't Connect to MongoDB**
```bash
# Check MongoDB container status
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Test connectivity from backend
docker exec -it attendance-backend nc -zv mongodb 27017
```

### **Issue 3: Scripts Not Found**
```bash
# Check if scripts exist in container
docker exec -it attendance-backend ls -la scripts/

# Check file permissions
docker exec -it attendance-backend ls -la docker-start.sh
```

### **Issue 4: Permission Denied**
```bash
# Fix script permissions
docker exec -it attendance-backend chmod +x docker-start.sh
docker exec -it attendance-backend chmod +x scripts/*.js
```

## 📊 **Monitoring Commands**

```bash
# Check all container statuses
docker-compose ps

# View real-time logs
docker-compose logs -f

# Check specific service logs
docker-compose logs -f backend
docker-compose logs -f mongodb

# Check container health
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

## 🔄 **Update Process**

### **For Code Changes:**
```bash
# Rebuild and restart
docker-compose down
docker-compose up --build
```

### **For Admin User Changes:**
```bash
# Update admin user
docker exec -it attendance-backend node scripts/createAdminUser.js

# Verify changes
docker exec -it attendance-backend node scripts/verify-admin.js
```

## 🎯 **Expected Results**

After successful deployment:

1. **MongoDB logs show:**
   - Admin user created successfully
   - Sample employee created
   - Database indexes created

2. **Backend logs show:**
   - MongoDB connection successful
   - Admin user verification completed
   - Server started successfully

3. **Login works with:**
   - `admin@techcorp.com` / `password123`
   - `venkatesh@gmail.com` / `venkatesh`

## 💡 **Key Benefits**

- ✅ **Automatic admin creation** - No manual intervention needed
- ✅ **Multiple fallback mechanisms** - Ensures admin always exists
- ✅ **Proper startup sequence** - Services start in correct order
- ✅ **Health checks** - Ensures services are ready
- ✅ **Easy verification** - Simple commands to check status

---

**🎯 Goal:** Ensure admin user `admin@techcorp.com` with password `password123` is automatically created when you run `docker-compose up`.
