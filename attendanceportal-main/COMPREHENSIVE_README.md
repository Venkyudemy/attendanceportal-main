# 🚀 Attendance Portal - Complete Application Guide

## 📋 **Application Overview**

The Attendance Portal is a comprehensive employee management system built with **Node.js + Express.js** backend and **React.js** frontend, featuring:

- ✅ **Employee Authentication** - Secure login with JWT tokens
- ✅ **Attendance Management** - Check-in/check-out with late detection
- ✅ **Leave Management** - Annual, sick, and personal leave tracking
- ✅ **Admin Dashboard** - Employee overview and management
- ✅ **Employee Portal** - Personal attendance and leave history
- ✅ **Daily Reset System** - Automatic attendance reset at midnight
- ✅ **Multiple Deployment Options** - Docker Compose, separated instances, cloud deployment

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    MongoDB      │
│   (React.js)    │◄──►│   (Node.js)     │◄──►│   (Database)    │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔑 **Default Login Credentials**

- **👑 Admin User:**
  - Email: `admin@techcorp.com`
  - Password: `password123`
  - Role: `admin`
  - Capabilities: Full system access, employee management

- **👤 Sample Employee:**
  - Email: `venkatesh@gmail.com`
  - Password: `venkatesh`
  - Role: `employee`
  - Capabilities: Personal attendance, leave requests

## 📁 **Project Structure**

```
attendanceportal-main/
├── Backend/                          # Node.js + Express backend
│   ├── models/                       # MongoDB schemas
│   │   ├── Employee.js              # Employee model with attendance
│   │   ├── LeaveRequest.js          # Leave request model
│   │   └── Settings.js              # Application settings
│   ├── routes/                       # API endpoints
│   │   ├── auth.js                  # Authentication routes
│   │   ├── employee.js              # Employee management
│   │   ├── leave.js                 # Leave management
│   │   └── health.js                # Health check endpoint
│   ├── scripts/                      # Database scripts
│   │   ├── init-mongo.js            # MongoDB initialization
│   │   ├── verify-admin.js          # Admin verification
│   │   └── fix-leave-balance.js     # Database fixes
│   ├── index.js                      # Main server file
│   ├── startup-admin-creation.js    # Automatic admin creation
│   ├── create-admin-manual.js       # Manual admin creation
│   ├── Dockerfile                    # Backend container
│   └── package.json                  # Backend dependencies
├── Frontend/                         # React.js frontend
│   ├── src/                          # Source code
│   │   ├── components/               # React components
│   │   ├── services/                 # API services
│   │   └── pages/                    # Application pages
│   ├── Dockerfile                    # Frontend container
│   └── package.json                  # Frontend dependencies
├── docker-compose.yml                # Docker Compose configuration
├── SEPARATED_INSTANCES_ADMIN_FIX.md  # Separated deployment guide
├── DOCKER_COMPOSE_ADMIN_FIX.md       # Docker Compose guide
├── verify-deployment.bat             # Deployment verification script
└── test-application.js               # Application test script
```

## 🚀 **Deployment Options**

### **Option 1: Docker Compose (Recommended for Development)**

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Features:**
- ✅ Automatic admin user creation
- ✅ MongoDB initialization scripts
- ✅ Health checks and monitoring
- ✅ Easy development setup

### **Option 2: Separated Instances (Production)**

Follow the `SEPARATED_INSTANCES_ADMIN_FIX.md` guide for:
- Frontend on one server
- Backend on another server  
- MongoDB on a separate database server
- Automatic admin user creation

### **Option 3: Manual Backend (Testing)**

```bash
cd Backend
npm install
npm start
```

## 🔧 **Key Features**

### **1. Automatic Admin User Creation**
- ✅ Runs automatically when backend starts
- ✅ Creates admin user if not exists
- ✅ Updates password to ensure consistency
- ✅ Creates sample employee user
- ✅ Multiple fallback mechanisms

### **2. Smart Attendance System**
- ✅ Daily check-in/check-out
- ✅ Late arrival detection
- ✅ Working hours calculation
- ✅ Automatic daily reset at midnight
- ✅ Attendance history tracking

### **3. Leave Management**
- ✅ Annual leave (20 days)
- ✅ Sick leave (10 days)
- ✅ Personal leave (5 days)
- ✅ Leave request workflow
- ✅ Leave balance tracking

### **4. Security Features**
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ CORS configuration
- ✅ Input validation

## 📊 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### **Employee Management**
- `GET /api/employee/stats` - Employee statistics
- `POST /api/employee/attendance` - Mark attendance
- `GET /api/employee/attendance` - Get attendance history

### **Leave Management**
- `POST /api/leave` - Request leave
- `GET /api/leave` - Get leave history
- `PUT /api/leave/:id` - Update leave request

### **Health & Monitoring**
- `GET /api/health` - Service health check
- `GET /` - Backend status

## 🧪 **Testing & Verification**

### **1. Run Application Test**
```bash
cd Backend
node test-application.js
```

### **2. Verify Deployment**
```bash
# Windows
verify-deployment.bat

# Linux/Mac
./verify-deployment.sh
```

### **3. Test API Endpoints**
```bash
# Test health check
curl http://localhost:5000/api/health

# Test admin login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techcorp.com","password":"password123"}'
```

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Admin User Not Created**
   - Check backend logs for admin creation messages
   - Run manual admin creation: `node create-admin-manual.js`
   - Verify MongoDB connection

2. **Login Fails**
   - Ensure admin user exists in database
   - Check password is correct: `password123`
   - Verify backend is running and accessible

3. **MongoDB Connection Issues**
   - Check MongoDB service status
   - Verify connection string in environment variables
   - Check network connectivity between services

4. **Frontend Can't Connect to Backend**
   - Verify backend is running on port 5000
   - Check CORS configuration
   - Ensure API URL is correctly configured

### **Debug Commands**

```bash
# Check backend status
curl http://localhost:5000/api/health

# Check MongoDB connection
mongo mongodb://localhost:27017/attendanceportal

# View backend logs
docker logs attendance-backend
# or
pm2 logs
# or
sudo journalctl -u your-backend-service -f

# Test database operations
cd Backend
node test-application.js
```

## 🌐 **Environment Variables**

### **Backend (.env or environment)**
```bash
NODE_ENV=production
PORT=5000
MONGO_URL=mongodb://localhost:27017/attendanceportal
JWT_SECRET=your-super-secret-jwt-key-change-in-production
TZ=Asia/Kolkata
WORKING_HOURS_START=09:00
WORKING_HOURS_END=17:45
LATE_THRESHOLD_MINUTES=15
```

### **Frontend (.env)**
```bash
REACT_APP_API_URL=http://localhost:5000/api
NODE_ENV=production
```

## 📈 **Performance & Scaling**

### **Current Capabilities**
- ✅ Handles multiple concurrent users
- ✅ Efficient MongoDB queries with indexes
- ✅ JWT token caching
- ✅ Daily attendance reset optimization

### **Scaling Options**
- Horizontal scaling with load balancer
- MongoDB replica sets for high availability
- Redis caching for session management
- Microservices architecture for large deployments

## 🔒 **Security Considerations**

### **Production Security**
- ✅ Change default JWT secret
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Add input sanitization
- ✅ Regular security updates
- ✅ Database access controls

### **Network Security**
- ✅ Firewall configuration
- ✅ VPN access for remote workers
- ✅ Secure MongoDB authentication
- ✅ API key management

## 📚 **Documentation Files**

- **`SEPARATED_INSTANCES_ADMIN_FIX.md`** - Separated deployment guide
- **`DOCKER_COMPOSE_ADMIN_FIX.md`** - Docker Compose deployment guide
- **`ATTENDANCE_PORTAL_DOCUMENTATION.md`** - Detailed feature documentation
- **`COMPONENT_VERIFICATION_REPORT.md`** - Component verification report

## 🆘 **Support & Maintenance**

### **Regular Maintenance**
- ✅ Monitor application logs
- ✅ Check database performance
- ✅ Update dependencies regularly
- ✅ Backup database regularly
- ✅ Monitor system resources

### **Emergency Procedures**
- ✅ Database backup and restore
- ✅ Service restart procedures
- ✅ Rollback procedures
- ✅ Contact information for issues

## 🎯 **Getting Started**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Venkyudemy/attendanceportal-main.git
   cd attendanceportal-main
   ```

2. **Choose deployment method**
   - Docker Compose: `docker-compose up`
   - Separated instances: Follow `SEPARATED_INSTANCES_ADMIN_FIX.md`
   - Manual: `cd Backend && npm start`

3. **Verify deployment**
   ```bash
   verify-deployment.bat  # Windows
   # or
   ./verify-deployment.sh # Linux/Mac
   ```

4. **Test the application**
   - Open frontend: `http://localhost:3000`
   - Login with: `admin@techcorp.com` / `password123`
   - Verify admin dashboard loads

5. **Monitor logs**
   - Check backend logs for admin creation
   - Verify MongoDB connection
   - Test API endpoints

---

**🎉 Your Attendance Portal is now ready for production use!**

For additional support, refer to the specific deployment guides or run the verification scripts to ensure everything is working correctly.
