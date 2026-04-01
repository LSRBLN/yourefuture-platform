#!/bin/bash
set -e

echo "🚀 TrustShield Production Deployment Script"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

SERVER_IP="91.99.184.153"
SERVER_USER="xipx"
APP_DIR="/home/xipx/trustshield"
REPO_URL="https://github.com/RebellDesign/yourefuture-platform.git"

echo -e "${BLUE}[1/5] Connecting to server...${NC}"
ssh -o StrictHostKeyChecking=accept-new "${SERVER_USER}@${SERVER_IP}" "echo 'Connected!'"

echo -e "${BLUE}[2/5] Cloning repository...${NC}"
ssh "${SERVER_USER}@${SERVER_IP}" "mkdir -p ${APP_DIR} && cd ${APP_DIR} && git clone --depth 1 ${REPO_URL} . 2>&1 | grep -E '(Cloning|done|error)' || true"

echo -e "${BLUE}[3/5] Creating .env.production...${NC}"
ssh "${SERVER_USER}@${SERVER_IP}" "cat > ${APP_DIR}/.env.production << 'EOF'
# Database
DB_PASSWORD=$(openssl rand -base64 32)

# Redis
REDIS_PASSWORD=$(openssl rand -base64 32)

# JWT
JWT_SECRET=$(openssl rand -base64 32)

# OIDC Configuration (update these!)
OIDC_CLIENT_ID=your-oidc-client-id
OIDC_CLIENT_SECRET=your-oidc-client-secret
OIDC_ISSUER_URL=https://your-oidc-provider.com

# AWS S3 Configuration (update these!)
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET=trustshield-assets-production
USE_S3_SIGV4=true

# Frontend URLs
NEXT_PUBLIC_API_URL=https://api.trustshield.local
NEXT_PUBLIC_OIDC_CLIENT_ID=your-oidc-client-id
NEXT_PUBLIC_OIDC_ISSUER_URL=https://your-oidc-provider.com

# Logging
LOG_LEVEL=info

# Feature Flags
SEED_DEMO_DATA=false
EOF
echo '✓ .env.production created'"

echo -e "${BLUE}[4/5] Creating self-signed SSL certificates (for testing)...${NC}"
ssh "${SERVER_USER}@${SERVER_IP}" "mkdir -p ${APP_DIR}/ssl && \
  openssl req -x509 -newkey rsa:2048 -nodes -out ${APP_DIR}/ssl/cert.pem -keyout ${APP_DIR}/ssl/key.pem -days 365 \
  -subj '/CN=trustshield.local' 2>/dev/null && \
  echo '✓ SSL certificates created'"

echo -e "${BLUE}[5/5] Starting Docker containers...${NC}"
ssh "${SERVER_USER}@${SERVER_IP}" "cd ${APP_DIR} && \
  docker compose -f docker-compose.prod.yml pull && \
  docker compose -f docker-compose.prod.yml up -d && \
  echo '✓ Containers started' && \
  sleep 3 && \
  docker compose -f docker-compose.prod.yml ps"

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "  1. Update .env.production with real OIDC and AWS credentials:"
echo "     ssh ${SERVER_USER}@${SERVER_IP} 'nano ${APP_DIR}/.env.production'"
echo ""
echo "  2. Wait for containers to be healthy:"
echo "     ssh ${SERVER_USER}@${SERVER_IP} 'docker compose -f ${APP_DIR}/docker-compose.prod.yml ps'"
echo ""
echo "  3. Check logs:"
echo "     ssh ${SERVER_USER}@${SERVER_IP} 'docker compose -f ${APP_DIR}/docker-compose.prod.yml logs -f api'"
echo ""
echo "  4. Set up real SSL certificates (Let's Encrypt):"
echo "     - Update DNS records to point to ${SERVER_IP}"
echo "     - Run certbot for Let's Encrypt"
echo ""
echo "  5. Database migrations (if needed):"
echo "     ssh ${SERVER_USER}@${SERVER_IP} 'docker compose -f ${APP_DIR}/docker-compose.prod.yml exec api npm run migrate'"
echo ""
echo "🌐 Access:"
echo "  - API: https://api.trustshield.local:443 (add to /etc/hosts)"
echo "  - Web: https://trustshield.local:443"
echo "  - Admin: https://admin.trustshield.local:443"
echo ""
