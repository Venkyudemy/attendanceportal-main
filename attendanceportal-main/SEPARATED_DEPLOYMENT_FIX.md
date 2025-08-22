# 🔧 Separated Deployment Login Fix Guide

## 🚨 **Common Issues & Solutions**

### **1. Frontend-Backend Connection Issue**

**Problem:** Frontend can't reach backend API
**Solution:** Update frontend environment variables

Create `Frontend/.env.production`:
```env
REACT_APP_API_URL=http://YOUR_BACKEND_PRIVATE_IP:5000/api
REACT_APP_DAILY_RESET_ENABLED=true
NODE_ENV=production
```

Replace `YOUR_BACKEND_PRIVATE_IP` with your actual backend server's private IP.

### **2. Backend-MongoDB Connection Issue**

**Problem:** Backend can't connect to MongoDB
**Solution:** Update backend environment variables

Create `Backend/.env`:
```env
NODE_ENV=production
PORT=5000
MONGO_URL=mongodb://YOUR_MONGODB_PRIVATE_IP:27017/attendanceportal
JWT_SECRET=your-super-secret-jwt-key-change-in-production
TZ=UTC
```

Replace `YOUR_MONGODB_PRIVATE_IP` with your MongoDB server's private IP.

### **3. CORS Configuration Issue**

**Problem:** Browser blocks cross-origin requests
**Solution:** Update backend CORS settings

In `Backend/index.js`, update the CORS configuration:
```javascript
const corsOptions = {
  origin: ['http://YOUR_FRONTEND_PUBLIC_IP', 'http://YOUR_FRONTEND_PRIVATE_IP'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### **4. Network Security Group Issues**

**Problem:** Firewall blocking connections
**Solution:** Configure security groups

**Backend Server Security Group:**
- Inbound: Port 5000 (from Frontend server)
- Inbound: Port 27017 (from MongoDB server)

**Frontend Server Security Group:**
- Inbound: Port 80/443 (from internet)
- Outbound: Port 5000 (to Backend server)

**MongoDB Server Security Group:**
- Inbound: Port 27017 (from Backend server)

### **5. Admin User Not Created**

**Problem:** No admin user in database
**Solution:** Run admin user creation script

```bash
# On backend server
cd Backend
node scripts/createAdmin.js
```

Or manually create admin user:
```javascript
// Connect to MongoDB and run:
db.employees.insertOne({
  name: "Admin User",
  email: "admin@techcorp.com",
  password: "$2a$12$hashed_password_here", // Use bcrypt to hash "password123"
  role: "admin",
  position: "System Administrator",
  department: "IT",
  employeeId: "ADMIN001"
})
```

## 🔍 **Step-by-Step Troubleshooting**

### **Step 1: Test Backend Connectivity**
```bash
# From frontend server
curl -X GET http://YOUR_BACKEND_PRIVATE_IP:5000/api/health
```

### **Step 2: Test MongoDB Connectivity**
```bash
# From backend server
mongo mongodb://YOUR_MONGODB_PRIVATE_IP:27017/attendanceportal
```

### **Step 3: Test Login API**
```bash
# From frontend server
curl -X POST http://YOUR_BACKEND_PRIVATE_IP:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techcorp.com","password":"password123"}'
```

### **Step 4: Check Browser Console**
Open browser developer tools and check:
- Network tab for failed requests
- Console tab for JavaScript errors
- Application tab for localStorage issues

## 🛠️ **Quick Fix Commands**

### **1. Update Frontend Build**
```bash
cd Frontend
# Create .env.production with correct backend IP
echo "REACT_APP_API_URL=http://YOUR_BACKEND_PRIVATE_IP:5000/api" > .env.production
npm run build
```

### **2. Restart Backend with Correct Config**
```bash
cd Backend
# Create .env with correct MongoDB IP
echo "MONGO_URL=mongodb://YOUR_MONGODB_PRIVATE_IP:27017/attendanceportal" > .env
npm start
```

### **3. Verify MongoDB Connection**
```bash
# On MongoDB server
mongo --eval "db.runCommand('ping')"
```

## 📋 **Checklist**

- [ ] Frontend `.env.production` has correct backend IP
- [ ] Backend `.env` has correct MongoDB IP
- [ ] Security groups allow necessary traffic
- [ ] Admin user exists in database
- [ ] Backend server is running on port 5000
- [ ] MongoDB server is running on port 27017
- [ ] CORS is configured for frontend IP
- [ ] Network connectivity between servers

## 🔑 **Default Admin Credentials**
- **Email:** admin@techcorp.com
- **Password:** password123

## 🆘 **Emergency Fix**

If nothing works, try this temporary fix:
1. Temporarily allow all traffic in security groups
2. Use public IPs instead of private IPs
3. Test login functionality
4. Once working, secure the configuration

## 📞 **Debug Commands**

```bash
# Check if services are running
sudo systemctl status nginx
sudo systemctl status node
sudo systemctl status mongod

# Check network connectivity
ping YOUR_BACKEND_PRIVATE_IP
ping YOUR_MONGODB_PRIVATE_IP

# Check open ports
netstat -tlnp | grep :5000
netstat -tlnp | grep :27017
```
