# 🐳 Docker Build Troubleshooting Guide

This guide helps resolve common Docker build issues for the Attendance Portal.

## 🚨 Common Build Issues

### 1. Alpine Package Manager Issues

**Problem**: `apk add` commands fail with repository errors

**Symptoms**:
```
ERROR: https://dl-cdn.alpinelinux.org/alpine/v3.18/main: temporary error (try again later)
```

**Solutions**:

#### Option A: Use Updated Dockerfile
```bash
# Use the main Dockerfile (already fixed)
docker-compose up --build -d
```

#### Option B: Use Simple Dockerfile
```bash
# Use the simplified version
docker-compose -f docker-compose.yml up --build -d
```

#### Option C: Manual Fix
If you need to modify the Dockerfile manually:
```dockerfile
# Replace this line:
RUN apk add --no-cache curl

# With this:
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.edge.kernel.org/g' /etc/apk/repositories && \
    apk update && \
    apk add --no-cache curl
```

### 2. Network Issues During Build

**Problem**: Cannot fetch packages during build

**Solutions**:
```bash
# Check Docker network
docker network ls

# Use alternative DNS
docker build --network=host .

# Use specific DNS
docker build --dns 8.8.8.8 .
```

### 3. Base Image Issues

**Problem**: Wrong base image causing package manager conflicts

**Check Current Base Image**:
```dockerfile
# Should be Alpine-based for apk commands
FROM nginx:alpine
FROM node:18-alpine
```

**Fix**: Ensure all stages use Alpine if using `apk` commands

### 4. Permission Issues

**Problem**: Permission denied errors during build

**Solutions**:
```bash
# Run with sudo (Linux/Mac)
sudo docker-compose up --build -d

# Run as administrator (Windows)
# Right-click PowerShell and "Run as Administrator"
```

## 🔧 Quick Fixes

### For Jenkins/CI Environments

**Option 1: Use Simple Dockerfile**
```yaml
# In your CI pipeline
docker build -f Frontend/Dockerfile.simple -t attendance-frontend .
```

**Option 2: Add Build Args**
```dockerfile
# Add to Dockerfile
ARG APK_REPO="http://dl-cdn.alpinelinux.org/alpine/v3.18/main/"
RUN apk add --no-cache --repository ${APK_REPO} curl
```

**Option 3: Use Alternative Base Image**
```dockerfile
# Replace Alpine with Debian
FROM nginx:stable
RUN apt-get update && apt-get install -y curl
```

### For Local Development

**Clean Build**:
```bash
# Remove all images and rebuild
docker system prune -af
docker-compose up --build -d
```

**Use Development Environment**:
```bash
# Use development compose (no Alpine issues)
docker-compose -f docker-compose.dev.yml up -d
```

## 🛠️ Debug Commands

### Check Build Context
```bash
# Verify files exist
ls -la Frontend/
ls -la Frontend/package.json
ls -la Frontend/nginx.conf
```

### Test Dockerfile Locally
```bash
# Test build step by step
docker build -f Frontend/Dockerfile.simple -t test-frontend Frontend/

# Check what's in the image
docker run -it test-frontend sh
```

### Check Network Connectivity
```bash
# Test if Docker can reach internet
docker run alpine ping -c 3 google.com

# Test Alpine package manager
docker run alpine apk update
```

## 📋 Build Checklist

Before building, ensure:

- [ ] All source files are present
- [ ] package.json exists in Frontend/
- [ ] nginx.conf exists in Frontend/
- [ ] Docker has internet access
- [ ] Sufficient disk space
- [ ] Proper permissions

## 🚀 Alternative Deployment Methods

### 1. Use Development Environment
```bash
# Avoid production build issues
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Build Locally, Deploy Remotely
```bash
# Build on your machine
docker build -t attendance-frontend Frontend/

# Save and transfer
docker save attendance-frontend > frontend.tar
# Transfer to server and load
docker load < frontend.tar
```

### 3. Use Pre-built Images
```bash
# Use official nginx and build only app
FROM nginx:alpine
COPY build/ /usr/share/nginx/html/
```

## 🔍 Log Analysis

### Common Error Patterns

**Repository Error**:
```
ERROR: https://dl-cdn.alpinelinux.org/alpine/v3.18/main: temporary error
```
→ Use alternative repository or simple Dockerfile

**Permission Error**:
```
permission denied: unknown
```
→ Run with sudo/administrator privileges

**Network Error**:
```
failed to fetch: temporary error
```
→ Check network connectivity and DNS

**Build Context Error**:
```
failed to compute cache key: "/package.json" not found
```
→ Check file paths and build context

## 📞 Support

If issues persist:

1. **Check Docker version**: `docker --version`
2. **Check Docker Compose version**: `docker-compose --version`
3. **Check system resources**: `docker system df`
4. **Review build logs**: `docker-compose logs --tail=50`
5. **Try alternative Dockerfile**: Use `Dockerfile.simple`

## 🎯 Quick Start After Fix

```bash
# Clean everything
docker-compose down
docker system prune -af

# Rebuild with simple Dockerfile
docker-compose up --build -d

# Check status
docker-compose ps
```
