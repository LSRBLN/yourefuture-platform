#!/bin/bash

# Achtung: Dieses Skript erwartet, dass SSH-Key-Auth konfiguriert ist
# Oder nutze: sshpass -p "Gewapc" ssh xipx@91.99.184.153 "command"

SERVER="91.99.184.153"
USER="xipx"
PASSWORD="Gewapc"
APP_DIR="/home/xipx/trustshield"

echo "=== TrustShield Production Deployment ==="

# Check if sshpass is available
if ! command -v sshpass &> /dev/null; then
    echo "Installing sshpass..."
    apt-get update && apt-get install -y sshpass 2>/dev/null || brew install sshpass 2>/dev/null
fi

SSH="sshpass -p '${PASSWORD}' ssh -o StrictHostKeyChecking=no ${USER}@${SERVER}"
SCP="sshpass -p '${PASSWORD}' scp -o StrictHostKeyChecking=no"

echo "[1/6] Creating application directory..."
$SSH "mkdir -p ${APP_DIR} && cd ${APP_DIR} && pwd"

echo "[2/6] Cloning repository..."
$SSH "cd ${APP_DIR} && git clone --depth 1 https://github.com/RebellDesign/yourefuture-platform.git . 2>&1 | tail -3"

echo "[3/6] Uploading docker-compose.prod.yml..."
$SCP docker-compose.prod.yml ${USER}@${SERVER}:${APP_DIR}/

echo "[4/6] Uploading nginx.conf..."
$SCP nginx.conf ${USER}@${SERVER}:${APP_DIR}/

echo "[5/6] Configuring environment variables and SSL..."
$SSH << 'SSHEOF'
cd /home/xipx/trustshield

# Create .env.production
cat > .env.production << 'ENVEOF'
DB_PASSWORD=trustshield-db-$(date +%s)
REDIS_PASSWORD=trustshield-redis-$(date +%s)
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)

OIDC_CLIENT_ID=dev-placeholder
OIDC_CLIENT_SECRET=dev-placeholder
OIDC_ISSUER_URL=https://dev.example.com

AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=dev-placeholder
AWS_SECRET_ACCESS_KEY=dev-placeholder
S3_BUCKET=trustshield-assets
USE_S3_SIGV4=false

NEXT_PUBLIC_API_URL=https://api.trustshield.local
NEXT_PUBLIC_OIDC_CLIENT_ID=dev-placeholder
NEXT_PUBLIC_OIDC_ISSUER_URL=https://dev.example.com

LOG_LEVEL=info
SEED_DEMO_DATA=false
ENVEOF

# Create SSL cert
mkdir -p ssl logs/api logs/nginx
openssl req -x509 -newkey rsa:2048 -nodes -out ssl/cert.pem -keyout ssl/key.pem -days 365 \
  -subj '/CN=trustshield.local' 2>/dev/null

echo "✓ Configuration ready"
SSHEOF

echo "[6/6] Starting Docker containers..."
$SSH << 'STARTEOF'
cd /home/xipx/trustshield
docker compose -f docker-compose.prod.yml up -d
sleep 3
docker compose -f docker-compose.prod.yml ps
STARTEOF

echo ""
echo "=== ✅ Deployment Complete ==="
echo ""
echo "📋 Update credentials:"
echo "  sshpass -p 'Gewapc' ssh xipx@${SERVER} 'nano ${APP_DIR}/.env.production'"
echo ""
echo "🌐 Test locally by adding to /etc/hosts:"
echo "  ${SERVER} trustshield.local api.trustshield.local admin.trustshield.local"
echo ""
