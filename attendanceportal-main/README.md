# 🚀 Attendance Portal - Full Stack Application

A modern, responsive attendance management system built with React, Node.js, Express, and MongoDB.

## ✨ Features

- **🔐 User Authentication** - Secure login with JWT tokens
- **👥 Employee Management** - Complete employee lifecycle management
- **📊 Attendance Tracking** - Real-time attendance monitoring
- **📅 Leave Management** - Comprehensive leave request system
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **🔒 Role-Based Access** - Admin and employee permissions
- **📈 Analytics Dashboard** - Attendance statistics and reports
- **⚡ Performance Optimized** - Fast loading and smooth interactions

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **CSS3** - Responsive design with media queries
- **Nginx** - Production web server

### Backend
- **Node.js 18** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Health Checks** - Service monitoring
- **Production Optimizations** - Performance tuning

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- Docker & Docker Compose (optional)

### Option 1: Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/attendanceportal.git
cd attendanceportal

# Start services using batch scripts
.\start-services.bat          # Basic startup
.\start-production.bat        # Production mode
.\fix-connection.bat          # Troubleshooting
```

### Option 2: Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d --build

# Access the application
Frontend: http://localhost:80
Backend: http://localhost:5000
API Health: http://localhost:5000/api/health
```

## 📁 Project Structure

```
attendanceportal/
├── 📁 Frontend/              # React application
│   ├── 📁 public/            # Static assets
│   ├── 📁 src/               # Source code
│   └── Dockerfile            # Frontend container
├── 📁 Backend/               # Node.js API server
│   ├── 📁 config/            # Configuration files
│   ├── 📁 models/            # Database models
│   ├── 📁 routes/            # API endpoints
│   ├── 📁 scripts/           # Database scripts
│   └── Dockerfile            # Backend container
├── 📁 tests/                 # Test files
├── docker-compose.yml        # Multi-container setup
├── .dockerignore             # Docker build exclusions
└── 📋 Documentation          # Guides and instructions
```

## 🔐 Default Credentials

### Admin User
- **Email**: `admin@company.com`
- **Password**: `admin123`

### Test Employee
- **Email**: `venkatesh111@gmail.com`
- **Password**: `password123`

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Employee Management
- `GET /api/employee/stats` - Employee statistics
- `GET /api/employee/attendance` - Attendance records
- `POST /api/employee/checkin` - Check-in
- `POST /api/employee/checkout` - Check-out

### Leave Management
- `GET /api/leave` - Leave requests
- `POST /api/leave` - Create leave request
- `PUT /api/leave/:id` - Update leave request

### Health Check
- `GET /api/health` - Service health status

## 🐳 Docker Configuration

### Frontend Container
- **Base**: Node.js 18 Alpine + Nginx
- **Port**: 80
- **Features**: Multi-stage build, security hardening, health checks

### Backend Container
- **Base**: Node.js 18 Alpine
- **Port**: 5000
- **Features**: Multi-stage build, production optimizations, memory management

### MongoDB Container
- **Base**: MongoDB 6.0
- **Port**: 27017
- **Features**: Persistent storage, health monitoring, initialization scripts

## ⚡ Performance Features

- **Gzip Compression** - Faster data transfer
- **Database Connection Pooling** - Optimized database connections
- **Memory Optimization** - 2GB heap for backend
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Caching Headers** - Browser caching optimization
- **Code Splitting** - Lazy loading for better performance

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt with 12 rounds
- **CORS Protection** - Configurable origin policies
- **Rate Limiting** - DDoS protection
- **Non-root Containers** - Security hardening
- **Input Validation** - SQL injection prevention

## 📱 Responsive Design

- **Mobile First** - Optimized for mobile devices
- **Hamburger Menu** - Touch-friendly navigation
- **Flexible Grid** - Adapts to all screen sizes
- **Touch Targets** - Proper button sizing for mobile

## 🚨 Troubleshooting

### Common Issues

#### Connection Errors
```bash
# Kill all Node processes
taskkill /f /im node.exe

# Restart services
.\fix-connection.bat
```

#### Port Conflicts
```bash
# Check port usage
netstat -an | findstr :5000
netstat -an | findstr :3000

# Kill conflicting processes
taskkill /f /PID <process_id>
```

#### Database Issues
```bash
# Check MongoDB status
curl http://localhost:5000/api/health

# Run database scripts
cd Backend/scripts
node createAdmin.js
node createTestUser.js
```

## 📊 Monitoring & Health Checks

### Service Health
- **Backend**: `http://localhost:5000/api/health`
- **Frontend**: `http://localhost/health`
- **MongoDB**: Container health monitoring

### Performance Metrics
- Response times
- Memory usage
- Database connections
- Error rates

## 🚀 Deployment

### Local Network
- **Frontend**: `http://YOUR_IP:80`
- **Backend**: `http://YOUR_IP:5000`

### Production
- **Load Balancer**: Configure Nginx/Apache
- **SSL**: Set up HTTPS certificates
- **Domain**: Configure DNS routing
- **Monitoring**: Set up application monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/attendanceportal/issues)
- **Documentation**: Check the `docs/` folder
- **Email**: your-email@example.com

---

**🎉 Built with ❤️ for modern attendance management**

**⭐ Star this repository if you find it helpful!** 