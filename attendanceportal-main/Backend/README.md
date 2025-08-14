# 🚀 Attendance Portal Backend

## 📁 Project Structure

```
Backend/
├── 📁 models/           # Database models
│   ├── Employee.js      # Employee data model
│   ├── LeaveRequest.js  # Leave request model
│   └── User.js         # User authentication model
├── 📁 routes/           # API routes
│   ├── auth.js         # Authentication routes
│   ├── employee.js     # Employee management routes
│   ├── health.js       # Health check routes
│   └── leave.js        # Leave management routes
├── 📁 tests/            # Test files
│   ├── test-admin-api.js
│   ├── test-employee-api.js
│   ├── test-attendance-details.js
│   ├── test-recent-activities.js
│   ├── test-employee-data-storage.js
│   ├── test-recalculate-summaries.js
│   ├── test-payroll-api.js
│   ├── test-routes.js
│   ├── test-server.js
│   └── test-login.js
├── 📁 scripts/          # Utility scripts
│   ├── createAdmin.js   # Admin creation script
│   └── seedData.js      # Database seeding
├── 📁 docs/             # Documentation
│   └── ENHANCED_DATA_PERSISTENCE_README.md
├── 📁 startup/          # Startup scripts
│   ├── start.sh         # Linux/Mac startup
│   └── start.bat        # Windows startup

├── 📁 config/           # Configuration
│   └── healthcheck.js   # Health check script
├── package.json          # Dependencies
├── package-lock.json     # Locked dependencies
└── index.js             # Main server file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- npm or yarn

### Installation
```bash
cd Backend
npm install
```

### Environment Variables
Create a `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance_portal
JWT_SECRET=your-secret-key
```

### Running the Server
```bash
# Development
npm start

# Production
npm run start

# Using scripts
./start.sh          # Linux/Mac
start.bat           # Windows
```



## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Employee Management
- `GET /api/employee/:id/portal-data` - Employee dashboard data
- `POST /api/employee/:id/check-in` - Employee check-in
- `POST /api/employee/:id/check-out` - Employee check-out
- `GET /api/employee/:id/attendance-details` - Attendance calendar
- `GET /api/employee/admin/recent-activities` - Recent activities
- `GET /api/employee/admin/verify-data-integrity` - Data integrity check

### Leave Management
- `GET /api/leave` - Get leave requests
- `POST /api/leave` - Create leave request
- `PUT /api/leave/:id` - Update leave request

### Health Check
- `GET /api/health` - Service health status

## 🧪 Testing
```bash
# Run specific tests
node test-admin-api.js
node test-employee-api.js
node test-attendance-details.js
node test-recent-activities.js
node test-employee-data-storage.js
```

## 📚 Features

### ✅ Employee Attendance
- Real-time check-in/check-out
- Automatic late detection
- Hours calculation
- Weekly/monthly summaries

### ✅ Data Persistence
- MongoDB integration
- Automatic data backup
- Data integrity verification
- Comprehensive logging

### ✅ Admin Features
- Employee management
- Leave request approval
- Recent activities monitoring
- Data integrity checks

### ✅ Security
- JWT authentication
- Role-based access control
- Input validation
- Error handling

## 🔧 Configuration

### MongoDB Connection
The backend automatically connects to MongoDB and handles connection failures gracefully.

### JWT Configuration
JWT tokens are used for authentication with configurable expiration times.

### CORS
Cross-Origin Resource Sharing is enabled for frontend integration.

## 📝 Logging
Comprehensive logging for:
- Database operations
- API requests
- Error tracking
- Performance monitoring

## 🚨 Error Handling
- Graceful error responses
- Detailed error logging
- Fallback mechanisms
- Health check monitoring
