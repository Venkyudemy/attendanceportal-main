# 🏢 Attendance Portal - Complete Management System

A modern, responsive attendance management system built with **React Frontend** and **Node.js Backend**, featuring comprehensive employee attendance tracking, leave management, and administrative features.

## 🏗️ **Project Architecture**

```
attendanceportal-main/
├── 🎨 Frontend/           # React Application
│   ├── 📁 components/     # React Components
│   ├── 📁 services/       # API Services
│   ├── 📁 styles/         # CSS & Styling
│   └── 📁 docker/         # Frontend Docker
├── 🔧 Backend/            # Node.js API Server
│   ├── 📁 models/         # Database Models
│   ├── 📁 routes/         # API Routes
│   ├── 📁 tests/          # Test Files
│   ├── 📁 scripts/        # Utility Scripts
│   └── 📁 docker/         # Backend Docker
├── 🐳 docker-compose.yml  # Complete Stack
├── 📚 Documentation/      # Project Docs
└── 🚀 Deployment/         # Deployment Scripts
```

## ✨ **Key Features**

### 🎯 **Employee Portal**
- ✅ Real-time check-in/check-out
- ✅ Attendance calendar view
- ✅ Weekly/monthly summaries
- ✅ Leave request submission
- ✅ Personal dashboard

### 👨‍💼 **Admin Portal**
- ✅ Employee management
- ✅ Leave approval system
- ✅ Attendance monitoring
- ✅ Recent activities feed
- ✅ Data integrity verification

### 📊 **Dashboard & Analytics**
- ✅ Real-time statistics
- ✅ Interactive charts
- ✅ Attendance tracking
- ✅ Performance metrics

### 🔐 **Security & Authentication**
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Secure API endpoints
- ✅ Input validation

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- MongoDB 6.0+
- Docker (optional)
- npm or yarn

### **1. Clone Repository**
```bash
git clone <your-repo-url>
cd attendanceportal-main
```

### **2. Backend Setup**
```bash
cd Backend
npm install
npm start
```

### **3. Frontend Setup**
```bash
cd Frontend
npm install
npm start
```

### **4. Access Application**
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **MongoDB:** localhost:27017

## 🐳 **Docker Deployment**

### **Complete Stack**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### **Individual Services**
```bash
# Backend only
cd Backend
docker build -t attendance-backend .
docker run -p 5000:5000 attendance-backend

# Frontend only
cd Frontend
docker build -t attendance-frontend .
docker run -p 80:80 attendance-frontend
```

## 📱 **Responsive Design**

### **Breakpoints**
- 📱 **Mobile:** 320px - 767px
- 📱 **Tablet:** 768px - 1023px
- 💻 **Desktop:** 1024px - 1439px
- 🖥️ **Large Desktop:** 1440px+

### **Features**
- ✅ Mobile-first approach
- ✅ Touch-friendly interfaces
- ✅ Adaptive layouts
- ✅ Consistent spacing
- ✅ Optimized navigation

## 🔧 **Technology Stack**

### **Frontend**
- **React 18** - UI Framework
- **React Router 6** - Navigation
- **CSS3** - Styling & Responsiveness
- **Axios** - HTTP Client

### **Backend**
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication

### **DevOps**
- **Docker** - Containerization
- **Docker Compose** - Multi-service
- **Nginx** - Web Server
- **MongoDB** - Database

## 📊 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### **Employee Management**
- `GET /api/employee/:id/portal-data` - Dashboard data
- `POST /api/employee/:id/check-in` - Check-in
- `POST /api/employee/:id/check-out` - Check-out
- `GET /api/employee/:id/attendance-details` - Calendar

### **Admin Features**
- `GET /api/employee/admin/recent-activities` - Recent activities
- `GET /api/employee/admin/verify-data-integrity` - Data check

### **Leave Management**
- `GET /api/leave` - Get leave requests
- `POST /api/leave` - Create request
- `PUT /api/leave/:id` - Update request

## 🧪 **Testing**

### **Backend Tests**
```bash
cd Backend
node test-admin-api.js
node test-employee-api.js
node test-attendance-details.js
node test-recent-activities.js
node test-employee-data-storage.js
```

### **Frontend Tests**
```bash
cd Frontend
npm test
```

## 📚 **Documentation**

- 📖 [Backend Documentation](./Backend/README.md)
- 🎨 [Frontend Documentation](./Frontend/README.md)
- 🐳 [Docker Deployment](./docker-compose.yml)
- 🔧 [API Reference](./Backend/README.md#api-endpoints)

## 🌟 **Demo Credentials**

### **Admin Access**
- **Email:** admin@company.com
- **Password:** admin123

### **Employee Access**
- **Email:** employee@company.com
- **Password:** employee123

## 🚨 **Troubleshooting**

### **Common Issues**
1. **Backend not starting** - Check MongoDB connection
2. **Frontend build errors** - Clear node_modules and reinstall
3. **Docker issues** - Ensure Docker is running
4. **Port conflicts** - Check if ports 3000, 5000, 27017 are free

### **Debug Commands**
```bash
# Check running processes
netstat -ano | findstr :5000

# Kill Node processes
taskkill /f /im node.exe

# Docker logs
docker-compose logs backend
docker-compose logs frontend
```

## 🔄 **Development Workflow**

### **1. Feature Development**
```bash
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

### **2. Testing**
```bash
# Backend tests
cd Backend && npm test

# Frontend tests
cd Frontend && npm test

# Integration tests
npm run test:integration
```

### **3. Deployment**
```bash
# Build and deploy
docker-compose up -d --build

# Update environment
docker-compose down
docker-compose up -d
```

## 📈 **Performance Optimization**

### **Frontend**
- Code splitting
- Lazy loading
- Memoization
- Bundle optimization

### **Backend**
- Database indexing
- Query optimization
- Caching strategies
- Load balancing

## 🔒 **Security Features**

- JWT token authentication
- Role-based access control
- Input validation & sanitization
- CORS configuration
- Rate limiting
- Secure headers

## 🌐 **Browser Support**

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is open source and available under the MIT License.

---

## 🎯 **Next Steps**

1. **Set up environment variables**
2. **Configure MongoDB connection**
3. **Run the application**
4. **Test all features**
5. **Deploy to production**

For detailed setup instructions, see the individual README files in each folder. 