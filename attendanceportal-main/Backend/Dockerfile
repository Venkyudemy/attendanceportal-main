# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --cache /tmp/.npm && \
    npm audit fix --audit-level=moderate || true && \
    npm cache clean --force

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV TZ=Asia/Kolkata
ENV NODE_OPTIONS="--max-old-space-size=2048 --enable-source-maps"

RUN apk add --no-cache curl tzdata dumb-init && \
    apk upgrade --no-cache && \
    rm -rf /var/cache/apk/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    mkdir -p /app/logs /app/uploads /tmp && \
    chown -R nodejs:nodejs /app && \
    chmod -R 755 /app && \
    chmod 755 /app/logs /app/uploads /tmp

USER nodejs

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]
