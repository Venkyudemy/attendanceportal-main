# 📁 Attendance Portal - Scripts & Files Organization

## 🚀 **Quick Start Scripts (Root Directory)**

### **Production Deployment:**
- **`start-production.bat`** - Start services with production optimizations
- **`fix-connection.bat`** - Fix connection issues and restart services
- **`start-services.bat`** - Basic service startup script

### **Testing & Deployment:**
- **`test-deployment.bat`** - Test Docker deployment (Windows)
- **`test-deployment.sh`** - Test Docker deployment (Linux/Mac)

## 📂 **Frontend Files (`Frontend/` folder)**

### **Public Assets (`Frontend/public/`):**
- **`index.html`** - Main HTML file
- **`test-api.html`** - API testing page
- **`test-login.html`** - Login testing page
- **`favicon.ico`** - Application icon

### **Source Code (`Frontend/src/`):**
- **`components/`** - React components
- **`services/`** - API service layer
- **`App.js`** - Main application component

## 🔧 **Backend Files (`Backend/` folder)**

### **Configuration (`Backend/config/`):**
- **`production-config.js`** - Production settings
- **`healthcheck.js`** - Health check configuration
- **`production.js`** - Production environment config

### **Scripts (`Backend/scripts/`):**
- **`createAdmin.js`** - Create admin user
- **`createTestUser.js`** - Create test employee user
- **`seed-data.js`** - Populate database with sample data
- **`seedData.js`** - Alternative seed script

### **Core Files:**
- **`index.js`** - Main server file
- **`models/`** - Database models
- **`routes/`** - API routes

## 📋 **Documentation Files (Root Directory)**

- **`DEPLOYMENT_GUIDE.md`** - Production deployment guide
- **`DEPLOYMENT_INSTRUCTIONS.md`** - Detailed deployment instructions
- **`README.md`** - Main project documentation
- **`docker-compose.yml`** - Docker configuration
- **`env.production`** - Production environment variables

## 🎯 **How to Use:**

### **For Development:**
```bash
# Start basic services
.\start-services.bat
```

### **For Production:**
```bash
# Start with production optimizations
.\start-production.bat
```

### **For Troubleshooting:**
```bash
# Fix connection issues
.\fix-connection.bat
```

### **For Testing:**
- Open `http://localhost:3000/test-api.html` to test API
- Open `http://localhost:3000/test-login.html` to test login

## 📱 **File Access:**

### **Frontend Testing:**
- **API Test**: `http://localhost:3000/test-api.html`
- **Login Test**: `http://localhost:3000/test-login.html`
- **Main App**: `http://localhost:3000`

### **Backend API:**
- **Health Check**: `http://localhost:5000/api/health`
- **Login API**: `http://localhost:5000/api/auth/login`
- **Employee API**: `http://localhost:5000/api/employee/*`

---

**🎉 Your project is now properly organized and ready for development!**
