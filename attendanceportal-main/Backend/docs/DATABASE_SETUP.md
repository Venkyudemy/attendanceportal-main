# 🗄️ Database Connection & Issue Resolution Guide

## 🚨 Issues Fixed

### 1. **Employee Portal Check-in Error**
- **Problem**: "Failed to check in: Failed to fetch. Please check if the backend server is running"
- **Cause**: Database connection issues and missing null checks
- **Solution**: Enhanced MongoDB connection with fallback options and proper error handling

### 2. **Admin Leave Management Error**
- **Problem**: "Failed to update leave request status. Please try again."
- **Cause**: Database connectivity and API endpoint issues
- **Solution**: Improved database connection and API error handling

## 🔧 Quick Fix Steps

### Option 1: Use Docker (Recommended)
```bash
# 1. Start MongoDB container
docker-compose up -d mongodb

# 2. Initialize database
cd Backend
node scripts/initDatabase.js

# 3. Test connection
node scripts/testConnection.js

# 4. Start backend
npm start

# 5. Start frontend (in new terminal)
cd ../Frontend
npm start
```

### Option 2: Use Startup Scripts
- **Windows**: Run `start-system.bat`
- **Linux/Mac**: Run `./start-system.sh`

## 🗄️ Database Configuration

### MongoDB Connection Strings
- **Docker**: `mongodb://admin:password123@mongodb:27017/attendanceportal?authSource=admin`
- **Local**: `mongodb://admin:password123@localhost:27017/attendanceportal?authSource=admin`
- **Fallback**: `mongodb://localhost:27017/attendanceportal`

### Environment Variables
```bash
MONGODB_URI=mongodb://admin:password123@localhost:27017/attendanceportal?authSource=admin
NODE_ENV=development
PORT=5000
```

## 🧪 Test Credentials

### Admin User
- **Email**: `admin@techcorp.com`
- **Password**: `admin123`
- **Role**: Administrator

### Employee User
- **Email**: `employee@techcorp.com`
- **Password**: `employee123`
- **Role**: Employee

## 🔍 Troubleshooting

### 1. MongoDB Connection Issues
```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Check MongoDB logs
docker logs attendance-mongodb

# Test connection manually
cd Backend
node scripts/testConnection.js
```

### 2. Backend Server Issues
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check backend logs
# Look for MongoDB connection messages
```

### 3. Frontend Connection Issues
```bash
# Check if frontend can reach backend
curl http://localhost:5000

# Check browser console for CORS errors
```

## 📁 File Structure

```
attendanceportal-main/
├── Backend/
│   ├── scripts/
│   │   ├── initDatabase.js      # Database initialization
│   │   ├── testConnection.js    # Connection testing
│   │   └── seedData.js          # Sample data creation
│   ├── models/
│   │   ├── Employee.js          # Employee schema
│   │   ├── Settings.js          # Global settings
│   │   └── LeaveRequest.js      # Leave requests
│   └── routes/
│       ├── employee.js          # Employee operations
│       ├── leaveRequests.js     # Leave management
│       └── settings.js          # Settings management
├── Frontend/
│   └── src/
│       ├── components/
│       │   ├── employee/
│       │   │   ├── EmployeePortal.js
│       │   │   └── LeaveRequestForm.js
│       │   └── admin/
│       │       └── AdminLeaveManagement.js
│       └── services/
│           └── api.js           # API calls
├── docker-compose.yml           # Docker configuration
├── start-system.bat            # Windows startup
└── start-system.sh             # Linux/Mac startup
```

## 🚀 Features Fixed

### ✅ Employee Portal
- Check-in/Check-out functionality
- Leave request submission
- Leave balance display
- Attendance tracking
- Real-time status updates

### ✅ Admin Portal
- Leave request management
- Employee management
- Settings configuration
- Statistics dashboard
- Status approval/rejection

### ✅ Database Integration
- MongoDB connection with authentication
- Data persistence
- Real-time updates
- Error handling
- Connection fallbacks

## 🔒 Security Features

- MongoDB authentication
- Input validation
- Error handling
- CORS configuration
- Environment variables

## 📊 Data Models

### Employee
- Personal information
- Attendance records
- Leave history
- Emergency contacts

### Settings
- Company information
- Leave types
- Working hours
- Holidays

### LeaveRequest
- Employee details
- Leave type and duration
- Status tracking
- Admin responses

## 🎯 Next Steps

1. **Start MongoDB**: `docker-compose up -d mongodb`
2. **Initialize Database**: `node Backend/scripts/initDatabase.js`
3. **Start Backend**: `cd Backend && npm start`
4. **Start Frontend**: `cd Frontend && npm start`
5. **Login**: Use test credentials above
6. **Test Features**: Check-in, leave requests, admin approval

## 📞 Support

If issues persist:
1. Check MongoDB container status
2. Verify network connectivity
3. Review backend logs
4. Test database connection
5. Check browser console for errors

---

**🎉 All database connection issues have been resolved!**
