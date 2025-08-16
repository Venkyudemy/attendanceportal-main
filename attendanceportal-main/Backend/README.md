# Attendance Portal Backend

A Node.js backend API for the Attendance Portal application with MongoDB database integration.

## 🚀 Features

- **User Authentication**: JWT-based login/registration system
- **Employee Management**: CRUD operations for employee data
- **Attendance Tracking**: Check-in/check-out functionality with time tracking
- **Leave Management**: Employee leave requests and approvals
- **Settings Management**: Global application settings and configurations
- **Health Monitoring**: Built-in health check endpoints
- **Data Persistence**: MongoDB with Docker volume persistence

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- MongoDB (local or Docker)

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the Backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URL=mongodb://localhost:27017/attendanceportal

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production

# Optional: Timezone
TZ=Asia/Kolkata
```

### 3. Start Development Server
```bash
npm start
```

The server will start on `http://localhost:5000`

## 🐳 Docker Deployment

### Quick Start with Docker Compose
```bash
# Build and start all services
docker compose up --build

# Run in background
docker compose up -d --build
```

### Individual Service Deployment

#### Backend Only
```bash
cd Backend
docker build -t attendance-backend .
docker run -p 5000:5000 -e MONGO_URL=mongodb://your-mongo-host:27017/attendanceportal attendance-backend
```

#### MongoDB Only
```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongo_data:/data/db \
  mongo:6
```

## 🌐 Worldwide Access Configuration

### For Production Deployment

#### 1. Update Environment Variables
```env
# Production Environment
NODE_ENV=production
PORT=5000

# MongoDB Connection (use your production MongoDB)
MONGO_URL=mongodb://your-production-mongo:27017/attendanceportal

# JWT Secret (use strong, unique secret)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# CORS Configuration (allow worldwide access)
CORS_ORIGIN=*
```

#### 2. Docker Compose for Production
```yaml
version: "3.9"

services:
  backend:
    build:
      context: ./Backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MONGO_URL=mongodb://mongo:27017/attendanceportal
      - JWT_SECRET=your-super-secret-jwt-key-change-in-production
      - CORS_ORIGIN=*
    depends_on:
      mongo:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - attendance-network
    volumes:
      - backend_logs:/app/logs

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped
    networks:
      - attendance-network

volumes:
  mongo_data:
  backend_logs:

networks:
  attendance-network:
    driver: bridge
```

#### 3. Reverse Proxy Configuration (Nginx)
For worldwide access, configure Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://frontend:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 API Endpoints

### Health Check
- `GET /api/health` - Service health status

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Employee Management
- `GET /api/employee` - Get all employees
- `GET /api/employee/:id` - Get employee by ID
- `POST /api/employee` - Create new employee
- `PUT /api/employee/:id` - Update employee
- `DELETE /api/employee/:id` - Delete employee

### Attendance
- `POST /api/employee/checkin` - Employee check-in
- `POST /api/employee/checkout` - Employee check-out
- `GET /api/employee/attendance/:id` - Get attendance history

### Leave Management
- `GET /api/leave-requests` - Get all leave requests
- `POST /api/leave-requests` - Create leave request
- `PUT /api/leave-requests/:id` - Update leave request status

### Settings
- `GET /api/settings` - Get global settings
- `PUT /api/settings` - Update global settings

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Input Validation**: Request data validation and sanitization
- **Error Handling**: Secure error responses without sensitive information
- **Rate Limiting**: Built-in request rate limiting (configurable)

## 📝 Logging

The application logs to:
- **Console**: Development and debugging information
- **File**: `/app/logs` directory (when running in Docker)
- **Structured**: JSON format for production environments

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Tests
```bash
npm test -- --grep "auth"
```

## 🔧 Configuration Options

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `MONGO_URL` | `mongodb://localhost:27017/attendanceportal` | MongoDB connection string |
| `JWT_SECRET` | `your-secret-key` | JWT signing secret |
| `TZ` | `UTC` | Timezone for date operations |

### MongoDB Configuration
- **Database**: `attendanceportal`
- **Collections**: `employees`, `users`, `leaveRequests`, `settings`
- **Indexes**: Automatic indexing on `_id`, `email`, `employeeId`

## 🚀 Performance Optimization

- **Connection Pooling**: MongoDB connection optimization
- **Query Optimization**: Efficient database queries with proper indexing
- **Caching**: In-memory caching for frequently accessed data
- **Compression**: Response compression for large payloads

## 📦 Production Deployment

### 1. Build Production Image
```bash
docker build -t attendance-backend:latest .
```

### 2. Run with Environment Variables
```bash
docker run -d \
  --name attendance-backend \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGO_URL=mongodb://your-mongo:27017/attendanceportal \
  -e JWT_SECRET=your-production-secret \
  attendance-backend:latest
```

### 3. Health Monitoring
```bash
# Check container health
docker ps

# View logs
docker logs attendance-backend

# Health check endpoint
curl http://localhost:5000/api/health
```

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB service status
   - Verify connection string in environment variables
   - Check network connectivity

2. **Port Already in Use**
   - Change PORT in environment variables
   - Check for other services using the port

3. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Validate token format

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm start

# Run with additional logging
NODE_ENV=development npm start
```

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/guide/routing.html)
- [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)
- [JWT.io](https://jwt.io/) - JWT token debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
