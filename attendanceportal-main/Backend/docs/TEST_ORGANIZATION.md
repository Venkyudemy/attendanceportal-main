# Test File Organization

This document outlines the organization of test files in the attendance portal project.

## Backend Tests (`Backend/tests/`)

### API Tests
- `test-admin-api.js` - Admin API functionality tests
- `test-employee-api.js` - Employee API functionality tests
- `test-payroll-api.js` - Payroll API functionality tests
- `test-api.js` - General API tests
- `test-routes.js` - Route testing
- `test-server.js` - Server connectivity tests

### Employee Management Tests
- `test-employee-route.js` - Employee route functionality
- `test-employee-data-storage.js` - Employee data storage tests
- `test-attendance-details.js` - Attendance details testing
- `test-recent-activities.js` - Recent activities testing
- `test-recalculate-summaries.js` - Summary recalculation tests

### Leave Management Tests
- `test-leave-status.js` - Leave status update functionality
- `test-leave-status.ps1` - PowerShell leave status testing

### Daily Reset Tests
- `test-daily-reset.js` - Daily reset functionality
- `test-daily-reset-enhanced.js` - Enhanced daily reset testing

### Authentication Tests
- `test-login.js` - Login functionality tests
- `test-admin-portal.js` - Admin portal access tests

## Frontend Tests (`Frontend/tests/`)

### Connection Tests
- `test-connection.html` - Backend connection testing
- `fix-backend-connection-v2.html` - Connection debugging

### API Integration Tests
- `test-api.html` - Frontend API integration
- `test-patch-method.html` - PATCH method testing

### Leave Management UI Tests
- `debug-leave-issue.html` - Leave management debugging

## Infrastructure Tests (Root Directory)

### Docker Tests
- `test-docker-build.sh` - Linux Docker build testing
- `test-docker-build.bat` - Windows Docker build testing

### Deployment Tests
- `test-deployment.sh` - Linux deployment testing
- `test-deployment.bat` - Windows deployment testing

## Usage

### Running Backend Tests
```bash
cd Backend/tests
node test-employee-route.js
node test-leave-status.js
node test-daily-reset.js
```

### Running Frontend Tests
Open the HTML files in a web browser:
- `Frontend/tests/test-connection.html`
- `Frontend/tests/test-patch-method.html`

### Running Infrastructure Tests
```bash
# Linux
./test-docker-build.sh
./test-deployment.sh

# Windows
test-docker-build.bat
test-deployment.bat
```

## Notes

- All backend tests use Node.js and require the backend server to be running
- Frontend tests are HTML files that can be opened in any web browser
- Infrastructure tests are shell/batch scripts for Docker and deployment verification
- PowerShell tests are specifically for Windows environments
