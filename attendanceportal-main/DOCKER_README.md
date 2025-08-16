# Docker Setup for Frontend React Application

This document explains how to use Docker to build and run the frontend React application.

## 🐳 Docker Setup

### Prerequisites
- Docker installed on your system
- Docker Compose installed

### File Structure
```
Frontend/
├── Dockerfile              # Multi-stage Docker build
├── docker/
│   └── nginx.conf         # Nginx configuration
├── package.json           # Updated with Docker scripts
└── src/                   # React source code
```

### 🚀 Quick Start

1. **Install dependencies** (if not already done):
   ```bash
   cd Frontend
   npm install
   ```

2. **Build and run with Docker Compose**:
   ```bash
   docker compose up --build
   ```

3. **Access the application**:
   - Open your browser and go to: `http://localhost:3000`

### 🔧 Manual Docker Commands

1. **Build the Docker image**:
   ```bash
   cd Frontend
   docker build -t attendance-frontend .
   ```

2. **Run the container**:
   ```bash
   docker run -p 3000:80 attendance-frontend
   ```

### 📋 Available Scripts

The `package.json` has been updated with the following scripts:

- `npm start` - Start development server
- `npm run build` - Build for development
- `npm run build:prod` - Build for production (no source maps)
- `npm run start:prod` - Serve production build locally using `serve`

### 🏗️ Multi-Stage Build

The Dockerfile uses a multi-stage build approach:

1. **Build Stage**: Uses Node.js to install dependencies and build the React app
2. **Production Stage**: Uses lightweight Nginx to serve the built static files

### 🌐 Nginx Configuration

The Nginx configuration:
- Serves static files from `/usr/share/nginx/html`
- Handles client-side routing with `try_files`
- Listens on port 80
- Includes error page handling

### 🔍 Troubleshooting

1. **Port already in use**:
   - Change the port in `docker-compose.yml` from `3000:80` to `8080:80`
   - Access at `http://localhost:8080`

2. **Build fails**:
   - Ensure all dependencies are installed: `npm install`
   - Check that `package-lock.json` exists

3. **Container won't start**:
   - Check Docker logs: `docker compose logs frontend`
   - Verify the Dockerfile path is correct

### 🧹 Cleanup

To stop and remove containers:
```bash
docker compose down
```

To remove images and rebuild:
```bash
docker compose down --rmi all
docker compose up --build
```

### 📝 Notes

- The production build disables source maps for smaller bundle size
- Nginx serves the built files efficiently
- The container runs on port 80 internally, mapped to port 3000 on your host
- Environment variable `NODE_ENV=production` is set in the container
