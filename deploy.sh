#!/bin/bash
set -euo pipefail
# Production deployment - TrustShield Ubuntu Server
# 91.99.184.153 as xipx

APP_DIR="/home/xipx/trustshield"
REPO="https://github.com/RebellDesign/yourefuture-platform.git"

echo "=== TrustShield Production Deployment ==="
echo "Server: 91.99.184.153"
echo "App Directory: $APP_DIR"
echo ""

# 1. Create app directory and clone repo
echo "[1/5] Setting up application directory..."
ssh -T xipx@91.99.184.153 << 'EOF'
mkdir -p /home/xipx/trustshield
cd /home/xipx/trustshield
git clone --depth 1 https://github.com/RebellDesign/yourefuture-platform.git . > /dev/null 2>&1
echo "✓ Repository cloned"
EOF

# 2. Copy docker-compose file
echo "[2/5] Uploading Docker Compose configuration..."
scp -q docker-compose.prod.yml xipx@91.99.184.153:$APP_DIR/
echo "✓ docker-compose.prod.yml uploaded"

# 3. Copy nginx config
echo "[3/5] Uploading Nginx configuration..."
scp -q nginx.conf xipx@91.99.184.153:$APP_DIR/
echo "✓ nginx.conf uploaded"

# 4. Create .env and self-signed SSL
echo "[4/5] Configuring environment and SSL..."
ssh -T xipx@91.99.184.153 << 'ENVEOF'
cd /home/xipx/trustshield

# Create .env with auto-generated secrets
cat > .env.production << 'DOTENVEOF'
# Database
DB_PASSWORD=trustshield-secure-$(date +%s)

# Redis  
REDIS_PASSWORD=trustshield-redis-$(date +%s)

# JWT
JWT_SECRET=$(openssl rand -base64 32)

# OIDC (placeholder - update with real values)
OIDC_CLIENT_ID=dev-placeholder
OIDC_CLIENT_SECRET=dev-placeholder
OIDC_ISSUER_URL=https://dev-placeholder.com

# AWS S3
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=dev-placeholder
AWS_SECRET_ACCESS_KEY=dev-placeholder
S3_BUCKET=trustshield-assets
USE_S3_SIGV4=true

# Frontend
NEXT_PUBLIC_API_URL=https://api.trustshield.local
NEXT_PUBLIC_OIDC_CLIENT_ID=dev-placeholder
NEXT_PUBLIC_OIDC_ISSUER_URL=https://dev-placeholder.com

LOG_LEVEL=info
SEED_DEMO_DATA=false
DOTENVEOF

chmod 600 .env.production

# Create SSL directory and self-signed cert
mkdir -p ssl
openssl req -x509 -newkey rsa:2048 -nodes -out ssl/cert.pem -keyout ssl/key.pem -days 365 \
  -subj '/CN=trustshield.local' 2>/dev/null

echo "✓ Configuration created"
ENVEOF

# 5. Start containers
echo "[5/5] Starting Docker containers..."
ssh -T xipx@91.99.184.153 << 'STARTEOF'
cd /home/xipx/trustshield

# Create logs directory
mkdir -p logs/api logs/nginx

# Start services
docker compose --env-file .env.production -f docker-compose.prod.yml config > /dev/null
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Wait and show status
sleep 3
docker compose -f docker-compose.prod.yml ps

echo "✓ Containers started"
STARTEOF

echo ""
echo "=== ✅ Deployment Complete ==="
echo ""
echo "📋 Next Steps:"
echo "  1. Update OIDC and AWS credentials:"
echo "     ssh xipx@91.99.184.153 nano /home/xipx/trustshield/.env.production"
echo ""
echo "  2. Restart API to apply changes:"
echo "     ssh xipx@91.99.184.153 'cd /home/xipx/trustshield && docker compose -f docker-compose.prod.yml restart api'"
echo ""
echo "  3. Check logs:"
echo "     ssh xipx@91.99.184.153 'docker compose -f /home/xipx/trustshield/docker-compose.prod.yml logs -f'"
echo ""
echo "  4. Add to /etc/hosts for local testing:"
echo "     91.99.184.153  trustshield.local api.trustshield.local admin.trustshield.local"
echo ""
echo "🌐 Access (after DNS/hosts update):"
echo "  - API: https://api.trustshield.local"
echo "  - Web: https://trustshield.local"
echo "  - Admin: https://admin.trustshield.local"
echo ""
