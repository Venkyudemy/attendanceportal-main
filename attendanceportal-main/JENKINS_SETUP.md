# Jenkins Pipeline Setup and Fixes

This document explains the Jenkins pipeline configuration and the fixes applied to resolve build issues.

## 🔧 **Fixes Applied**

### **1. Node Version Update**
- **Changed from**: Node 16 to Node 18
- **Reason**: Matches your package requirements and provides better compatibility
- **Files updated**: 
  - `Frontend/Dockerfile`
  - `Backend/Dockerfile`

### **2. Package Installation Method**
- **Changed from**: `npm ci` to `npm install`
- **Reason**: More resilient to package-lock.json sync issues
- **Benefit**: Automatically handles lock file synchronization

### **3. Environment Variables**
- **Added**: `NODE_ENV: production` to frontend service
- **Location**: `docker-compose.yml`
- **Purpose**: Ensures proper production build configuration

## 🚀 **Jenkins Pipeline Configuration**

### **Jenkinsfile Features**

#### **Pre-Build Stage**
```groovy
stage('Pre-Build') {
    steps {
        dir('Frontend') {
            sh 'npm install'  // Updates package-lock.json if needed
        }
        dir('Backend') {
            sh 'npm install'  // Updates package-lock.json if needed
        }
    }
}
```

**Purpose**: Ensures package-lock.json is synchronized before building Docker images

#### **Build Stage**
```groovy
stage('Build Docker Images') {
    steps {
        script {
            // Build frontend image
            docker.build("${DOCKER_IMAGE}-frontend:${BUILD_NUMBER}", "./Frontend")
            
            // Build backend image
            docker.build("${DOCKER_IMAGE}-backend:${BUILD_NUMBER}", "./Backend")
        }
    }
}
```

**Purpose**: Builds both frontend and backend Docker images with proper tagging

#### **Deploy Stage**
```groovy
stage('Deploy') {
    steps {
        script {
            // Stop existing containers
            sh 'docker compose down || true'
            
            // Start services with new images
            sh 'docker compose up -d --build'
            
            // Wait for services to be healthy
            sh 'sleep 30'
            
            // Health check
            sh 'curl -f http://localhost:3000 || exit 1'
            sh 'curl -f http://localhost:5000/api/health || exit 1'
        }
    }
}
```

**Purpose**: Deploys the application and verifies it's running correctly

## 📋 **Pipeline Stages**

1. **Pre-Build**: Syncs package-lock.json files
2. **Checkout**: Gets latest code from repository
3. **Build Docker Images**: Builds frontend and backend images
4. **Test**: Runs automated tests
5. **Deploy**: Deploys and verifies the application

## 🔍 **Why These Fixes Work**

### **1. Node Version Compatibility**
- **Problem**: Node 16 might not support all your dependencies
- **Solution**: Node 18 provides better compatibility and performance
- **Result**: Fewer build errors and better dependency resolution

### **2. Package Lock Synchronization**
- **Problem**: `npm ci` requires perfect sync between package.json and package-lock.json
- **Solution**: `npm install` automatically handles sync issues
- **Result**: More reliable builds even with lock file discrepancies

### **3. Pre-Build Step**
- **Problem**: Jenkins might have outdated package-lock.json
- **Solution**: Run `npm install` before building Docker images
- **Result**: Ensures all dependencies are properly resolved

## 🚀 **Usage Instructions**

### **1. Local Testing**
```bash
# Test the Docker setup locally
docker compose up --build

# Verify services are running
docker compose ps

# Check health endpoints
curl http://localhost:3000
curl http://localhost:5000/api/health
```

### **2. Jenkins Pipeline**
1. **Push code** to your repository
2. **Jenkins automatically** detects changes
3. **Pipeline runs** with the pre-build step
4. **Docker images** are built successfully
5. **Application deploys** automatically

### **3. Manual Jenkins Trigger**
```bash
# If you need to manually trigger the pipeline
# Go to Jenkins dashboard and click "Build Now"
```

## 🔧 **Troubleshooting**

### **Common Issues**

1. **Build Still Fails**
   ```bash
   # Check Jenkins logs for specific errors
   # Verify Node.js version in Jenkins environment
   # Ensure Docker is available in Jenkins
   ```

2. **Package Lock Issues**
   ```bash
   # Run locally first
   cd Frontend && npm install
   cd Backend && npm install
   
   # Commit updated package-lock.json files
   git add package-lock.json
   git commit -m "Update package-lock.json"
   git push
   ```

3. **Docker Build Issues**
   ```bash
   # Test Docker build locally
   cd Frontend && docker build -t test-frontend .
   cd Backend && docker build -t test-backend .
   ```

## 📊 **Expected Results**

After applying these fixes:

- ✅ **Jenkins builds succeed** without package-lock.json errors
- ✅ **Docker images build** successfully with Node 18
- ✅ **Application deploys** automatically after successful build
- ✅ **Health checks pass** for both frontend and backend
- ✅ **Package dependencies** are properly resolved

## 🎯 **Next Steps**

1. **Commit and push** these changes to your repository
2. **Jenkins will automatically** detect the changes
3. **Pipeline will run** with the new configuration
4. **Build should succeed** with the applied fixes
5. **Application will deploy** successfully

## 📝 **Files Modified**

- `Frontend/Dockerfile` - Updated to Node 18 and npm install
- `Backend/Dockerfile` - Updated to Node 18
- `docker-compose.yml` - Added NODE_ENV for frontend
- `Jenkinsfile` - Created with pre-build step
- `JENKINS_SETUP.md` - This documentation file

Your Jenkins pipeline is now configured to handle package-lock.json synchronization issues and should build successfully! 🚀
