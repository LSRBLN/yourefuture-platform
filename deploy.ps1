# TrustShield Production Deployment Script (PowerShell)
# Usage: ./deploy.ps1

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$SERVER = "91.99.184.153"
$USER = "xipx"
$APP_DIR = "/home/xipx/trustshield"
$REPO = "https://github.com/RebellDesign/yourefuture-platform.git"

Write-Host "=== TrustShield Production Deployment ===" -ForegroundColor Green
Write-Host "Server: $SERVER"
Write-Host "User: $USER"
Write-Host "App Dir: $APP_DIR"
Write-Host ""

# Helper function for SSH
function Invoke-SSHCommand {
    param(
        [string]$Command,
        [switch]$Quiet
    )
    $result = ssh -o StrictHostKeyChecking=accept-new "${USER}@${SERVER}" $Command 2>&1
    if (-not $Quiet) {
        Write-Host $result
    }
    return $result
}

# Step 1: Create directory and clone repo
Write-Host "[1/5] Setting up application directory..." -ForegroundColor Blue
try {
    Invoke-SSHCommand "mkdir -p $APP_DIR && cd $APP_DIR && git clone --depth 1 $REPO . > /dev/null 2>&1 && echo OK" -Quiet | Out-Null
    Write-Host "✓ Repository cloned" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to clone repository" -ForegroundColor Red
    exit 1
}

# Step 2: Upload Docker Compose
Write-Host "[2/5] Uploading Docker Compose configuration..." -ForegroundColor Blue
try {
    scp -q -o StrictHostKeyChecking=accept-new "docker-compose.prod.yml" "${USER}@${SERVER}:${APP_DIR}/" 2>&1 | Out-Null
    Write-Host "✓ docker-compose.prod.yml uploaded" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to upload docker-compose.prod.yml" -ForegroundColor Red
    exit 1
}

# Step 3: Upload Nginx config
Write-Host "[3/5] Uploading Nginx configuration..." -ForegroundColor Blue
try {
    scp -q -o StrictHostKeyChecking=accept-new "nginx.conf" "${USER}@${SERVER}:${APP_DIR}/" 2>&1 | Out-Null
    Write-Host "✓ nginx.conf uploaded" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to upload nginx.conf" -ForegroundColor Red
    exit 1
}

# Step 4: Create .env and SSL
Write-Host "[4/5] Configuring environment and SSL..." -ForegroundColor Blue
$envScript = @"
cd $APP_DIR

# Create .env.production with secure defaults
cat > .env.production << 'ENVEOF'
# Auto-generated secure defaults - update OIDC and AWS values!

# Database (auto-generated)
DB_PASSWORD=$(openssl rand -base64 32)

# Redis (auto-generated)
REDIS_PASSWORD=$(openssl rand -base64 32)

# JWT (auto-generated)
JWT_SECRET=$(openssl rand -base64 32)

# OIDC Configuration - CHANGE THESE!
OIDC_CLIENT_ID=your-oidc-client-id
OIDC_CLIENT_SECRET=your-oidc-client-secret
OIDC_ISSUER_URL=https://your-oidc-provider.com

# AWS S3 - CHANGE THESE!
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
SEED_DEMO_DATA=false
ENVEOF

chmod 600 .env.production

# Create SSL directory
mkdir -p ssl

# Generate self-signed certificate for testing
openssl req -x509 -newkey rsa:2048 -nodes \
  -out ssl/cert.pem -keyout ssl/key.pem -days 365 \
  -subj '/CN=trustshield.local' 2>/dev/null

# Create logs directory
mkdir -p logs/api logs/nginx

echo "Configuration created"
"@

try {
    $envScript | ssh -o StrictHostKeyChecking=accept-new "${USER}@${SERVER}" 2>&1 | Out-Null
    Write-Host "✓ Configuration and SSL created" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to configure environment" -ForegroundColor Red
    exit 1
}

# Step 5: Start containers
Write-Host "[5/5] Starting Docker containers..." -ForegroundColor Blue
$startScript = @"
cd $APP_DIR
docker compose --env-file .env.production -f docker-compose.prod.yml config > /dev/null
docker compose -f docker-compose.prod.yml pull 2>&1 | grep -E '(Pulling|Downloaded|Digest)'
docker compose -f docker-compose.prod.yml up -d
sleep 3
docker compose -f docker-compose.prod.yml ps
"@

try {
    $startScript | ssh -o StrictHostKeyChecking=accept-new "${USER}@${SERVER}" 2>&1
    Write-Host "✓ Containers started" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to start containers" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== ✅ Deployment Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Update OIDC and AWS credentials:"
Write-Host "     ssh ${USER}@${SERVER} nano ${APP_DIR}/.env.production"
Write-Host ""
Write-Host "  2. Restart containers:"
Write-Host "     ssh ${USER}@${SERVER} 'cd ${APP_DIR} && docker compose -f docker-compose.prod.yml restart api web admin'"
Write-Host ""
Write-Host "  3. Check container health:"
Write-Host "     ssh ${USER}@${SERVER} 'cd ${APP_DIR} && docker compose -f docker-compose.prod.yml ps'"
Write-Host ""
Write-Host "  4. View logs:"
Write-Host "     ssh ${USER}@${SERVER} 'cd ${APP_DIR} && docker compose -f docker-compose.prod.yml logs -f'"
Write-Host ""
Write-Host "  5. Add to your local /etc/hosts or C:\Windows\System32\drivers\etc\hosts:"
Write-Host "     ${SERVER}  trustshield.local api.trustshield.local admin.trustshield.local"
Write-Host ""
Write-Host "🌐 Access (after hosts update):" -ForegroundColor Cyan
Write-Host "  - API: https://api.trustshield.local"
Write-Host "  - Web: https://trustshield.local"
Write-Host "  - Admin: https://admin.trustshield.local"
Write-Host ""
