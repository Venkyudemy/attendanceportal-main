# 🕛 Attendance Portal with Daily Reset

A comprehensive employee attendance management system with **automatic daily reset functionality** that runs at 12:00 AM every day.

## 🎯 **Features**

### **🕛 Daily Reset System**
- **Automatic Reset**: Runs every day at 12:00 AM (midnight)
- **Manual Reset**: Admin-controlled reset for testing
- **Force Reset**: Emergency reset for critical situations
- **Status Monitoring**: Real-time reset status dashboard
- **Timezone Support**: Configurable timezone settings

### **✅ Employee Portal**
- **Check-in/Check-out**: Daily attendance tracking
- **Duplicate Prevention**: One check-in per day per employee
- **Status Messages**: Real-time feedback and notifications
- **Responsive Design**: Works on all devices
- **Leave Management**: Request and track leave

### **👑 Admin Portal**
- **Employee Management**: Add, edit, and manage employees
- **Attendance Monitoring**: Real-time attendance tracking
- **Reset Controls**: Manual and force reset options
- **Statistics Dashboard**: Comprehensive attendance analytics
- **Leave Approval**: Approve/reject leave requests

### **🐳 Docker Support**
- **Production Ready**: Optimized Docker containers
- **Easy Deployment**: One-command deployment
- **Health Checks**: Automated health monitoring
- **Scalable**: Microservices architecture

## 🚀 **Quick Start**

### **Option 1: Docker Deployment (Recommended)**

#### **Windows:**
```bash
# Clone the repository
git clone https://github.com/Venkyudemy/attendanceportal-main.git
cd attendanceportal-main

# Run Docker deployment
docker-start.bat
```

#### **Linux/Mac:**
```bash
# Clone the repository
git clone https://github.com/Venkyudemy/attendanceportal-main.git
cd attendanceportal-main

# Make script executable and run
chmod +x docker-start.sh
./docker-start.sh
```

### **Option 2: Manual Development Setup**

#### **Backend Setup:**
```bash
cd Backend
npm install
npm start
```

#### **Frontend Setup:**
```bash
cd Frontend
npm install
npm start
```

#### **Database Setup:**
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.0
```

## 📋 **Prerequisites**

### **For Docker Deployment:**
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose
- Git

### **For Manual Setup:**
- Node.js 18+
- MongoDB 6.0+
- Git

## 🔧 **Configuration**

### **Environment Variables**

#### **Backend (.env):**
```env
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/attendanceportal
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
TZ=UTC

# Daily Reset Configuration
DAILY_RESET_ENABLED=true
DAILY_RESET_TIME=00:00
DAILY_RESET_TIMEZONE=UTC
```

#### **Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_DAILY_RESET_ENABLED=true
```

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    MongoDB      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Database)    │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Components:**
- **Frontend**: React.js with responsive UI
- **Backend**: Node.js/Express.js REST API
- **Database**: MongoDB with Mongoose ODM
- **Daily Reset**: Automated scheduling system

## 📊 **API Endpoints**

### **Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### **Employee Management:**
- `GET /api/employee/attendance` - Get all employees
- `POST /api/employee/:id/check-in` - Employee check-in
- `POST /api/employee/:id/check-out` - Employee check-out
- `GET /api/employee/:id/portal-data` - Employee portal data

### **Daily Reset:**
- `POST /api/employee/manual-daily-reset` - Manual reset
- `POST /api/employee/force-reset` - Force reset
- `GET /api/employee/reset-status` - Reset status

### **Leave Management:**
- `POST /api/leave` - Create leave request
- `GET /api/leave/employee/:id` - Get employee leave requests
- `PATCH /api/leave/:id/status` - Update leave status

## 🧪 **Testing**

### **Automated Testing:**
```bash
# Run daily reset tests
node test-daily-reset-enhanced.js

# Run backend tests
cd Backend
npm test

# Run frontend tests
cd Frontend
npm test
```

### **Manual Testing:**
1. **Start the system** using Docker or manual setup
2. **Access frontend** at http://localhost:80 (Docker) or http://localhost:3000 (dev)
3. **Test check-in/check-out** functionality
4. **Use admin portal** to test reset controls
5. **Monitor logs** for daily reset activity

## 📈 **Monitoring**

### **Health Checks:**
```bash
# Backend health
curl http://localhost:5000/api/health

# Daily reset status
curl http://localhost:5000/api/employee/reset-status

# Frontend health
curl http://localhost:80
```

### **Logs:**
```bash
# Docker logs
docker-compose logs -f

# Daily reset logs
docker-compose logs -f backend | grep "Daily reset"

# Application logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🛠️ **Management**

### **Docker Commands:**
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View status
docker-compose ps

# View logs
docker-compose logs -f
```

### **Development Commands:**
```bash
# Backend
cd Backend
npm start
npm run dev

# Frontend
cd Frontend
npm start
npm run build
```

## 🔒 **Security**

### **Production Considerations:**
1. **Change default passwords** in environment variables
2. **Use HTTPS** in production
3. **Implement rate limiting**
4. **Set up proper authentication**
5. **Regular security updates**

### **Environment Security:**
```env
# Production settings
NODE_ENV=production
JWT_SECRET=your-very-secure-jwt-secret
MONGODB_URI=mongodb://user:password@host:port/database
```

## 📚 **Documentation**

### **Guides:**
- [Daily Reset System](DAILY_RESET_SOLUTION.md)
- [Docker Deployment](DOCKER_DEPLOYMENT.md)
- [API Documentation](API_DOCUMENTATION.md)

### **Architecture:**
- [Project Structure](PROJECT_STRUCTURE.md)
- [Database Schema](DATABASE_SCHEMA.md)
- [Component Documentation](COMPONENT_DOCS.md)

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **Daily Reset Not Working:**
```bash
# Check logs
docker-compose logs backend | grep -i reset

# Test reset endpoint
curl -X POST http://localhost:5000/api/employee/manual-daily-reset

# Check timezone
docker exec attendance-backend date
```

#### **Database Connection Issues:**
```bash
# Check MongoDB status
docker-compose logs mongodb

# Test connection
docker exec attendance-backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected'))
  .catch(err => console.error(err));
"
```

#### **Frontend Not Loading:**
```bash
# Check frontend logs
docker-compose logs frontend

# Check nginx configuration
docker exec attendance-frontend nginx -t
```

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### **Development Setup:**
```bash
# Clone your fork
git clone https://github.com/your-username/attendanceportal-main.git
cd attendanceportal-main

# Install dependencies
cd Backend && npm install
cd ../Frontend && npm install

# Start development servers
cd ../Backend && npm run dev
cd ../Frontend && npm start
```

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

### **Getting Help:**
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check the guides in the docs folder
- **Logs**: Use `docker-compose logs` for debugging

### **Contact:**
- **Repository**: https://github.com/Venkyudemy/attendanceportal-main
- **Issues**: https://github.com/Venkyudemy/attendanceportal-main/issues

## 🎉 **Success Indicators**

### **System Working Correctly:**
- ✅ All services are running
- ✅ Health checks are passing
- ✅ Frontend is accessible
- ✅ Backend API is responding
- ✅ Daily reset is scheduled
- ✅ Admin controls are functional

### **Daily Reset Verification:**
- ✅ Console shows reset scheduling
- ✅ Manual reset button works
- ✅ Reset status endpoint returns data
- ✅ All employees reset to "Absent"

---

## 🚀 **Next Steps**

1. **Deploy**: Use Docker for production deployment
2. **Configure**: Set up environment variables
3. **Monitor**: Implement logging and monitoring
4. **Scale**: Add load balancing as needed
5. **Secure**: Implement production security measures

**Your attendance portal with daily reset functionality is ready!** 🎉

---

**Made with ❤️ for efficient employee attendance management** 