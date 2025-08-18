# 🌐 External Deployment Guide for Attendance Portal

## 🎯 Overview

This guide will help you deploy your Attendance Portal application so it can be accessed from external devices and the internet.

## 📋 Prerequisites

- Docker and Docker Compose installed on your server
- Server with public IP address
- Firewall access to configure ports
- Domain name (optional but recommended)

## 🚀 Step-by-Step Deployment

### Step 1: Get Your Server IP Address

```bash
# On Linux/Mac
curl ifconfig.me

# On Windows
nslookup myip.opendns.com resolver1.opendns.com
```

### Step 2: Configure External Access

1. **Edit the external configuration file:**
   ```bash
   # Open docker-compose.external.yml
   # Replace YOUR_SERVER_IP with your actual server IP
   ```

2. **Example configuration:**
   ```yaml
   environment:
     - REACT_APP_API_URL=http://203.0.113.1:5000/api
   ```

### Step 3: Configure Firewall

**For Windows Server:**
```powershell
# Allow ports 80 and 5000
netsh advfirewall firewall add rule name="Attendance Portal Frontend" dir=in action=allow protocol=TCP localport=80
netsh advfirewall firewall add rule name="Attendance Portal Backend" dir=in action=allow protocol=TCP localport=5000
```

**For Linux Server:**
```bash
# Allow ports 80 and 5000
sudo ufw allow 80
sudo ufw allow 5000
sudo ufw enable
```

### Step 4: Deploy the Application

```bash
# Stop any existing containers
docker-compose down

# Deploy with external configuration
docker-compose -f docker-compose.external.yml up --build -d

# Check status
docker-compose -f docker-compose.external.yml ps
```

### Step 5: Verify Deployment

1. **Check if services are running:**
   ```bash
   docker-compose -f docker-compose.external.yml logs -f
   ```

2. **Test access:**
   - Frontend: `http://YOUR_SERVER_IP`
   - Backend API: `http://YOUR_SERVER_IP:5000`

## 🔑 Login Credentials

- **Admin Email:** `admin@techcorp.com`
- **Admin Password:** `password123`
- **Employee Email:** `venkatesh@gmail.com`
- **Employee Password:** `venkatesh`

## 🌍 Domain Configuration (Optional)

If you have a domain name:

1. **Point your domain to your server IP**
2. **Update the configuration:**
   ```yaml
   environment:
     - REACT_APP_API_URL=https://yourdomain.com:5000/api
   ```

3. **Set up SSL certificates for HTTPS**

## 🔧 Troubleshooting

### Connection Issues

1. **Check if ports are open:**
   ```bash
   # Test port 80
   telnet YOUR_SERVER_IP 80
   
   # Test port 5000
   telnet YOUR_SERVER_IP 5000
   ```

2. **Check Docker logs:**
   ```bash
   docker-compose -f docker-compose.external.yml logs frontend
   docker-compose -f docker-compose.external.yml logs backend
   ```

3. **Verify API URL:**
   - Make sure `REACT_APP_API_URL` points to the correct server IP
   - Test the API endpoint directly: `http://YOUR_SERVER_IP:5000/api/health`

### Common Issues

1. **"Connection error" on login:**
   - Verify backend is running on port 5000
   - Check if API URL is correct in configuration
   - Ensure firewall allows port 5000

2. **Frontend loads but can't connect to backend:**
   - Check if `REACT_APP_API_URL` is set correctly
   - Verify backend service is healthy
   - Check network connectivity between frontend and backend

## 📊 Monitoring

### Check Service Status
```bash
docker-compose -f docker-compose.external.yml ps
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.external.yml logs -f

# Specific service
docker-compose -f docker-compose.external.yml logs -f frontend
docker-compose -f docker-compose.external.yml logs -f backend
```

### Restart Services
```bash
docker-compose -f docker-compose.external.yml restart
```

## 🔒 Security Recommendations

1. **Change default passwords** after first login
2. **Use HTTPS** with SSL certificates
3. **Configure firewall** to only allow necessary ports
4. **Regular updates** of Docker images
5. **Backup database** regularly

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose -f docker-compose.external.yml logs`
2. Verify network connectivity
3. Ensure all prerequisites are met
4. Check firewall configuration
