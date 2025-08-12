# 🚀 Jenkins CI/CD Deployment Guide

This guide covers deploying the Attendance Portal using Jenkins CI/CD pipeline.

## 🐳 Jenkins Pipeline Configuration

### Jenkinsfile Example
```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'attendance-frontend'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('Frontend') {
                    sh '''
                        # Set environment variables for CI build
                        export CI=false
                        export GENERATE_SOURCEMAP=false
                        export DISABLE_ESLINT_PLUGIN=true
                        
                        # Install dependencies
                        npm ci --only=production=false
                        
                        # Build with warnings allowed
                        npm run build:ci
                    '''
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                dir('.') {
                    sh '''
                        # Build using Jenkins-optimized Dockerfile
                        docker build -f Frontend/Dockerfile.jenkins -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                        
                        # Tag as latest
                        docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                    '''
                }
            }
        }
        
        stage('Deploy') {
            steps {
                sh '''
                    # Stop existing containers
                    docker-compose down
                    
                    # Start with new image
                    docker-compose up -d
                    
                    # Wait for health checks
                    sleep 30
                    
                    # Check status
                    docker-compose ps
                '''
            }
        }
    }
    
    post {
        always {
            // Cleanup
            sh 'docker system prune -f'
        }
    }
}
```

## 🔧 Build Configuration

### Environment Variables for Jenkins
```bash
# Set these in Jenkins environment or build script
export CI=false                    # Allow warnings
export GENERATE_SOURCEMAP=false    # Reduce build size
export DISABLE_ESLINT_PLUGIN=true  # Skip ESLint during build
export SKIP_PREFLIGHT_CHECK=true   # Skip preflight checks
```

### Package.json Scripts
```json
{
  "scripts": {
    "build:ci": "CI=false react-scripts build",
    "build:prod": "GENERATE_SOURCEMAP=false react-scripts build",
    "lint": "eslint src --ext .js,.jsx",
    "lint:fix": "eslint src --ext .js,.jsx --fix"
  }
}
```

## 🚨 Common Jenkins Build Issues

### 1. ESLint Errors in CI

**Problem**: ESLint treats warnings as errors in CI mode

**Solution**:
```bash
# Use CI=false to allow warnings
CI=false npm run build

# Or use the CI-friendly build script
npm run build:ci
```

### 2. React Hook Dependencies Warning

**Problem**: useEffect missing dependencies

**Solution**:
```javascript
// Add eslint-disable comment for specific cases
useEffect(() => {
  // Your effect code
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

### 3. Unused Variables Warning

**Problem**: Unused imports or variables

**Solution**:
```javascript
// Remove unused imports
// import { useNavigate } from 'react-router-dom'; // Remove if not used

// Or prefix with underscore
const _unusedVariable = 'value';
```

### 4. Alpine Package Manager Issues

**Problem**: apk add fails in Jenkins environment

**Solution**:
```dockerfile
# Use multiple fallback methods
RUN apk add --no-cache curl || \
    (sed -i 's/dl-cdn.alpinelinux.org/mirrors.edge.kernel.org/g' /etc/apk/repositories && \
     apk update && \
     apk add --no-cache curl)
```

## 🛠️ Jenkins Build Commands

### Quick Build Test
```bash
# Test build locally before Jenkins
cd Frontend
CI=false npm run build:ci
```

### Docker Build Test
```bash
# Test Docker build
docker build -f Frontend/Dockerfile.jenkins -t test-frontend .
```

### Full Deployment Test
```bash
# Test complete deployment
docker-compose down
docker-compose up --build -d
docker-compose ps
```

## 📋 Jenkins Pipeline Checklist

### Before Running Pipeline
- [ ] Code is committed to repository
- [ ] Jenkins has access to Docker
- [ ] Jenkins has sufficient disk space
- [ ] Network connectivity is available
- [ ] Docker daemon is running

### During Pipeline Execution
- [ ] Checkout stage completes
- [ ] Build stage succeeds without errors
- [ ] Docker build completes
- [ ] Deployment stage succeeds
- [ ] Health checks pass

### After Pipeline Execution
- [ ] Application is accessible
- [ ] All services are running
- [ ] Logs show no errors
- [ ] Performance is acceptable

## 🔍 Debugging Jenkins Builds

### Check Build Logs
```bash
# View Jenkins build logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mongodb
```

### Test Individual Components
```bash
# Test frontend build
cd Frontend && npm run build:ci

# Test Docker build
docker build -f Frontend/Dockerfile.jenkins .

# Test container
docker run -p 80:80 attendance-frontend
```

### Network Connectivity
```bash
# Test Docker network
docker network ls
docker network inspect attendanceportal-main_attendance-network

# Test container connectivity
docker exec attendance-frontend curl -f http://localhost/health
```

## 🚀 Alternative Jenkins Configurations

### Multi-Stage Pipeline
```groovy
pipeline {
    agent any
    
    stages {
        stage('Build & Test') {
            parallel {
                stage('Frontend Build') {
                    steps {
                        dir('Frontend') {
                            sh 'CI=false npm run build:ci'
                        }
                    }
                }
                stage('Backend Build') {
                    steps {
                        dir('Backend') {
                            sh 'npm ci && npm test'
                        }
                    }
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                sh 'docker-compose build'
            }
        }
        
        stage('Deploy') {
            steps {
                sh 'docker-compose up -d'
            }
        }
    }
}
```

### Blue Ocean Pipeline
```yaml
# jenkins.yml
pipeline:
  agent: any
  stages:
    - stage: 'Build'
      steps:
        - sh: 'cd Frontend && CI=false npm run build:ci'
    - stage: 'Deploy'
      steps:
        - sh: 'docker-compose up -d'
```

## 📊 Monitoring & Alerts

### Health Check Monitoring
```bash
# Monitor service health
docker-compose ps
docker stats

# Check application endpoints
curl -f http://localhost/health
curl -f http://localhost:5000/api/health
```

### Log Monitoring
```bash
# Monitor logs in real-time
docker-compose logs -f

# Check for errors
docker-compose logs | grep -i error
```

## 🔒 Security Considerations

### Jenkins Security
- Use Jenkins credentials for sensitive data
- Restrict Docker access
- Use non-root containers
- Implement proper access controls

### Build Security
- Scan Docker images for vulnerabilities
- Use multi-stage builds
- Minimize attack surface
- Keep dependencies updated

## 📞 Troubleshooting

### Build Fails with ESLint Errors
1. Check if `CI=false` is set
2. Use `npm run build:ci` instead of `npm run build`
3. Fix ESLint warnings in code
4. Add `DISABLE_ESLINT_PLUGIN=true`

### Docker Build Fails
1. Check Alpine repository connectivity
2. Use `Dockerfile.jenkins`
3. Verify Docker daemon is running
4. Check disk space

### Deployment Fails
1. Check container logs
2. Verify network connectivity
3. Check port availability
4. Verify environment variables

## 🎯 Quick Start Commands

```bash
# Complete Jenkins deployment
git pull origin main
docker-compose down
docker-compose up --build -d
docker-compose ps

# Check application
curl http://localhost
curl http://localhost:5000/api/health
```
