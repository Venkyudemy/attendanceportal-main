# Frontend Docker + Nginx Setup

This setup uses nginx's built-in `envsubst` mechanism to dynamically configure the backend API proxy at container startup, avoiding conflicts with nginx's official entrypoint scripts.

## Key Features

- **Multi-stage Docker build**: React app is built in one stage and served by nginx in another
- **Environment variable substitution**: Uses `$BACKEND_PRIVATE_IP` placeholder in nginx config
- **No sed conflicts**: Avoids resource busy errors by not directly editing nginx config files
- **Automatic configuration**: Backend IP is substituted at container startup using `envsubst`

## Files

### `Dockerfile`
- Multi-stage build with React build stage + nginx serve stage
- Uses `envsubst` to substitute environment variables in nginx config
- Custom entrypoint script handles configuration generation

### `nginx.conf.template`
- Template file with `$BACKEND_PRIVATE_IP` placeholder
- All API requests to `/api/*` are proxied to the backend
- Includes CORS handling and health check endpoint

### `docker-compose.frontend.yml`
- Sets `BACKEND_PRIVATE_IP` environment variable
- Maps port 3000 to container port 80
- No volume mounts needed (configuration is generated at runtime)

## Usage

### Basic Usage
```bash
# Build and run with default backend IP
docker-compose -f docker-compose.frontend.yml up --build
```

### Custom Backend IP
```bash
# Set custom backend IP
BACKEND_PRIVATE_IP=192.168.1.100 docker-compose -f docker-compose.frontend.yml up --build
```

### Using docker-compose.example.yml
```bash
# Edit the example file to set your backend IP
# Then run:
docker-compose -f docker-compose.example.yml up --build
```

## Environment Variables

- `BACKEND_PRIVATE_IP`: The private IP address of your backend server
- `REACT_APP_API_URL`: API base URL for the React app (set to `/api`)
- `TZ`: Timezone setting

## How It Works

1. **Build Stage**: React app is built using Node.js
2. **Production Stage**: Built app is copied to nginx container
3. **Startup**: Custom entrypoint script uses `envsubst` to:
   - Read `nginx.conf.template`
   - Substitute `$BACKEND_PRIVATE_IP` with actual value
   - Generate final nginx configuration
   - Start nginx with the generated config

## Benefits

- ✅ No resource busy errors from conflicting entrypoint scripts
- ✅ Clean separation of build and runtime configuration
- ✅ Easy to change backend IP without rebuilding
- ✅ Uses nginx's official mechanism for environment substitution
- ✅ Maintains all existing API routes and functionality

## Troubleshooting

### Check Configuration
```bash
# View the generated nginx config
docker exec frontend cat /etc/nginx/conf.d/default.conf
```

### Check Logs
```bash
# View nginx logs
docker logs frontend
```

### Test API Proxy
```bash
# Test if API proxy is working
curl http://localhost:3000/api/health
```
