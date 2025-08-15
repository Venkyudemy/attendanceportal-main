# 🚀 Attendance Portal - Production Deployment Guide

## 📋 **Prerequisites**
- Node.js 16+ installed
- MongoDB running (local or cloud)
- Windows Server or Windows 10/11

## 🔧 **Quick Start (Production Mode)**

### **Option 1: Use Production Script (Recommended)**
```bash
# Run the production startup script
.\start-production.bat
```

### **Option 2: Manual Start**
```bash
# Terminal 1 - Backend
cd Backend
set NODE_ENV=production
node --max-old-space-size=2048 index.js

# Terminal 2 - Frontend  
cd Frontend
set NODE_ENV=production
npm start
```

## 🌐 **Public Access Configuration**

### **Backend (Public Access)**
- **URL**: `http://YOUR_SERVER_IP:5000`
- **Status**: ✅ Publicly accessible
- **CORS**: ✅ All origins allowed
- **Port**: 5000 (configurable via PORT env var)

### **Frontend (Local Access)**
- **URL**: `http://localhost:3000`
- **Status**: 🔒 Local access only
- **Note**: Use Nginx/Apache for public frontend access

## ⚡ **Performance Optimizations Enabled**

### **Backend Optimizations**
- ✅ Gzip compression
- ✅ Database connection pooling
- ✅ Rate limiting (100 requests/15min per IP)
- ✅ Memory optimization (2GB heap)
- ✅ Request timeout (30 seconds)
- ✅ Body size limit (10MB)

### **Frontend Optimizations**
- ✅ Production build mode
- ✅ Code splitting
- ✅ Minified bundles
- ✅ Cache headers
- ✅ Optimized assets

## 🔐 **Security Features**

### **Authentication**
- JWT tokens with configurable secret
- Password hashing (bcrypt, 12 rounds)
- Rate limiting on login attempts
- CORS protection

### **Database Security**
- Connection pooling limits
- Query timeout protection
- Input validation
- SQL injection prevention

## 📱 **User Access**

### **Local Network Users**
- **Backend API**: `http://YOUR_SERVER_IP:5000/api/*`
- **Frontend**: `http://YOUR_SERVER_IP:3000`

### **Internet Users (with Load Balancer)**
- **Backend API**: `https://your-domain.com/api/*`
- **Frontend**: `https://your-domain.com`

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Port Already in Use**
```bash
# Kill all Node processes
taskkill /f /im node.exe
```

#### **2. CORS Errors**
- Backend is configured to allow all origins in production
- Check if NODE_ENV=production is set

#### **3. Slow Performance**
- Ensure MongoDB is running locally
- Check server resources (CPU, RAM)
- Use production script for optimizations

#### **4. Connection Refused**
- Verify backend is listening on 0.0.0.0:5000
- Check firewall settings
- Ensure MongoDB is accessible

### **Performance Monitoring**
```bash
# Check backend status
curl http://localhost:5000/api/health

# Check frontend status  
curl http://localhost:3000

# Monitor processes
netstat -an | findstr ":5000\|:3000"
```

## 📊 **Environment Variables**

### **Required for Production**
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance_portal
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### **Optional for Production**
```bash
# Database optimizations
MONGODB_MAX_POOL_SIZE=10
MONGODB_TIMEOUT=30000

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

## 🎯 **Next Steps for Production**

### **1. Load Balancer Setup**
- Configure Nginx/Apache as reverse proxy
- Set up SSL certificates
- Configure domain routing

### **2. Database Migration**
- Move to cloud MongoDB (Atlas, AWS, etc.)
- Set up database backups
- Configure monitoring

### **3. Monitoring & Logging**
- Set up application monitoring
- Configure error logging
- Set up performance metrics

## 📞 **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all services are running
3. Check console logs in both terminal windows
4. Ensure MongoDB is accessible

---

**🎉 Your Attendance Portal is now production-ready and publicly accessible!**
