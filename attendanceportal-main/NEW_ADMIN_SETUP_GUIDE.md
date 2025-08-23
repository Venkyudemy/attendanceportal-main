# 🚀 New Admin Setup Guide

## 🎯 **Overview**

This guide covers the updated admin user setup with new credentials and Docker configuration to ensure automatic admin creation on every deployment.

## 🔑 **New Admin Credentials**

- **Email:** `admin@portal.com`
- **Password:** `Admin@123`
- **Name:** `Admin`
- **Department:** `HR`
- **Position:** `Administrator`
- **Role:** `admin`

## 📁 **Files Updated/Created**

### **1. `Backend/initAdmin.js` (NEW)**
- **Purpose:** Main admin initialization script
- **Features:**
  - Creates admin user with new credentials
  - Uses bcryptjs for secure password hashing
  - Verifies admin user creation
  - Can be run independently or during startup

### **2. `Backend/index.js` (UPDATED)**
- **Changes:** Updated to use new `initAdmin.js` script
- **Integration:** Automatically runs admin creation on server startup

### **3. `Backend/Dockerfile` (UPDATED)**
- **Changes:**
  - Ensures `bcryptjs` is installed
  - Copies `initAdmin.js` into container
  - Maintains existing health checks and dependencies

### **4. `Backend/docker-start.sh` (UPDATED)**
- **Changes:** Updated to prioritize `initAdmin.js` script
- **Fallback:** Still supports existing scripts if needed

## 🚀 **How It Works**

### **1. Server Startup Process**
```
Backend Starts → Connects to MongoDB → Runs initAdmin.js → Creates/Updates Admin → Starts HTTP Server
```

### **2. Admin User Creation**
```
Check for admin@portal.com → Create if missing → Update password → Verify creation → Log results
```

### **3. Docker Container Process**
```
Container Starts → Wait for MongoDB → Run initAdmin.js → Start Node.js App → Admin Ready
```

## ✅ **Verification Steps**

### **1. Check Backend Logs**
Look for these messages:
```
🔧 Ensuring admin user exists...
🔗 Connecting to MongoDB...
✅ Admin user verification completed
🚀 Starting HTTP server...
```

### **2. Test Admin Login**
```bash
# Test with curl
curl -X POST http://YOUR_BACKEND_IP:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portal.com","password":"Admin@123"}'
```

### **3. Check MongoDB Directly**
```bash
# Connect to MongoDB
mongo mongodb://YOUR_MONGODB_IP:27017/attendanceportal

# Check admin user
db.employees.findOne({email: "admin@portal.com"})

# Check total users
db.employees.countDocuments()
```

### **4. Run Manual Verification**
```bash
# On your backend server
cd Backend
node initAdmin.js
```

## 🐳 **Docker Deployment**

### **1. Build the Image**
```bash
cd Backend
docker build -t attendance-backend .
```

### **2. Run the Container**
```bash
docker run -d \
  --name attendance-backend \
  -p 5000:5000 \
  -e MONGO_URL=mongodb://YOUR_MONGODB_IP:27017/attendanceportal \
  -e NODE_ENV=production \
  attendance-backend
```

### **3. Check Container Logs**
```bash
docker logs attendance-backend
```

## 🔧 **Manual Admin Creation**

If you need to create the admin user manually:

```bash
# Navigate to backend directory
cd Backend

# Run the init script
node initAdmin.js
```

## 🚨 **Troubleshooting**

### **Issue 1: Admin User Not Created**
```bash
# Check if script is running
grep "Ensuring admin user exists" /path/to/your/logs

# Manually create admin
node initAdmin.js

# Check MongoDB connection
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://YOUR_MONGODB_IP:27017/attendanceportal').then(() => console.log('Connected')).catch(console.error)"
```

### **Issue 2: Script Not Found**
```bash
# Check if files exist
ls -la Backend/initAdmin.js
ls -la Backend/docker-start.sh

# Check file permissions
chmod +x Backend/*.js
chmod +x Backend/*.sh
```

### **Issue 3: bcryptjs Not Installed**
```bash
# Install bcryptjs manually
npm install bcryptjs --save

# Check package.json
cat package.json | grep bcryptjs
```

### **Issue 4: Docker Build Issues**
```bash
# Clean build
docker build --no-cache -t attendance-backend .

# Check Dockerfile syntax
docker build --dry-run .
```

## 📊 **Expected Results**

After successful deployment:

1. **Backend logs show:**
   - Admin user creation/verification
   - Server started successfully

2. **MongoDB contains:**
   - Admin user with email `admin@portal.com`
   - Proper password hashing
   - Complete user profile

3. **Login works with:**
   - `admin@portal.com` / `Admin@123`

## 🔄 **Update Process**

### **For Code Changes:**
```bash
# Stop backend
sudo systemctl stop your-backend-service
# or
docker stop attendance-backend

# Update files
# Copy new initAdmin.js

# Start backend
sudo systemctl start your-backend-service
# or
docker start attendance-backend
```

### **For Admin User Changes:**
```bash
# Update admin user
node initAdmin.js

# Or restart backend to trigger automatic creation
sudo systemctl restart your-backend-service
# or
docker restart attendance-backend
```

## 💡 **Key Benefits**

- ✅ **Automatic admin creation** - No manual intervention needed
- ✅ **Secure password hashing** - Uses bcryptjs with salt rounds
- ✅ **Docker integration** - Works seamlessly with containerized deployments
- ✅ **Fallback mechanisms** - Multiple scripts for reliability
- ✅ **Easy verification** - Simple commands to check status
- ✅ **New credentials** - Updated to `admin@portal.com` / `Admin@123`

## 🆘 **Emergency Fix**

If nothing works, use this quick fix:

```bash
# 1. Connect to MongoDB
mongo mongodb://YOUR_MONGODB_IP:27017/attendanceportal

# 2. Create admin user manually
db.employees.insertOne({
  name: "Admin",
  email: "admin@portal.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8QqHqOe",
  role: "admin",
  department: "HR",
  position: "Administrator",
  status: "Active",
  joinDate: new Date(),
  phone: "+91-9999999999"
})

# 3. Test login
curl -X POST http://YOUR_BACKEND_IP:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portal.com","password":"Admin@123"}'
```

---

**🎯 Goal:** Ensure admin user `admin@portal.com` with password `Admin@123` is automatically created when your backend starts and connects to MongoDB, with full Docker support.
