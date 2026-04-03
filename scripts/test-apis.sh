#!/bin/bash

# API Testing & Verification Script
# Tests all configured APIs to ensure they're working

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load environment
if [ ! -f .env.local ]; then
  echo -e "${RED}❌ .env.local not found${NC}"
  exit 1
fi

set -a
source .env.local
set +a

# Helper functions
print_header() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

test_api() {
  local api_name=$1
  local api_key=$2
  local endpoint=$3
  local method=${4:-GET}
  local data=${5:-''}
  
  echo -n "  Testing ${api_name}... "
  
  if [ -z "$api_key" ]; then
    echo -e "${YELLOW}⏭️  Not configured${NC}"
    return 1
  fi
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "$endpoint" \
      -H "Authorization: Bearer $api_key" \
      -H "Content-Type: application/json" 2>/dev/null || echo "000")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$endpoint" \
      -H "Authorization: Bearer $api_key" \
      -H "Content-Type: application/json" \
      -d "$data" 2>/dev/null || echo "000")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  
  if [ "$http_code" -lt 400 ]; then
    echo -e "${GREEN}✅ Working (HTTP $http_code)${NC}"
    return 0
  elif [ "$http_code" -lt 500 ]; then
    echo -e "${YELLOW}⚠️  Client error (HTTP $http_code)${NC}"
    return 1
  else
    echo -e "${RED}❌ Server error (HTTP $http_code)${NC}"
    return 1
  fi
}

# Start testing
print_header "API Verification Script"

echo -e "Email: ${YELLOW}$(grep -oP '(?<=^# Email: ).*' .env.local)${NC}"
echo -e "Time: ${YELLOW}$(date)${NC}\n"

# Test 1: LeakCheck
print_header "1. LeakCheck.io"

if [ -n "$LEAKCHECK_API_KEY" ]; then
  echo "  Testing email leak check..."
  response=$(curl -s -X POST https://api.leakcheck.io/v1/query \
    -H "Authorization: Bearer $LEAKCHECK_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "query": "test@example.com",
      "type": "email",
      "source": true,
      "limit": 3
    }' 2>/dev/null)
  
  if echo "$response" | grep -q '"success"'; then
    echo -e "  ${GREEN}✅ LeakCheck working${NC}"
  else
    echo -e "  ${RED}❌ LeakCheck failed${NC}"
    echo "  Response: $response"
  fi
else
  echo -e "  ${YELLOW}⏭️  LeakCheck API key not configured${NC}"
fi

# Test 2: Hugging Face
print_header "2. Hugging Face"

if [ -n "$HUGGINGFACE_API_KEY" ]; then
  echo "  Testing model access..."
  response=$(curl -s -X GET \
    -H "Authorization: Bearer $HUGGINGFACE_API_KEY" \
    https://huggingface.co/api/whoami 2>/dev/null)
  
  if echo "$response" | grep -q '"id"'; then
    user=$(echo "$response" | grep -oP '(?<="id":")[^"]*')
    echo -e "  ${GREEN}✅ Hugging Face authenticated as: $user${NC}"
  else
    echo -e "  ${RED}❌ Hugging Face authentication failed${NC}"
  fi
else
  echo -e "  ${YELLOW}⏭️  Hugging Face API key not configured${NC}"
fi

# Test 3: Google Cloud Vision
print_header "3. Google Cloud Vision"

if [ -n "$GOOGLE_CLOUD_API_KEY_PATH" ] && [ -f "$GOOGLE_CLOUD_API_KEY_PATH" ]; then
  PROJECT_ID=$(cat "$GOOGLE_CLOUD_API_KEY_PATH" | grep -oP '(?<="project_id": ")[^"]*')
  echo "  Project ID: ${YELLOW}$PROJECT_ID${NC}"
  echo -e "  ${GREEN}✅ Google Cloud credentials found${NC}"
else
  echo -e "  ${YELLOW}⏭️  Google Cloud credentials not configured${NC}"
fi

# Test 4: AWS Rekognition
print_header "4. AWS Rekognition"

if [ -n "$AWS_ACCESS_KEY_ID" ]; then
  echo "  AWS Access Key: ${YELLOW}${AWS_ACCESS_KEY_ID:0:10}...${NC}"
  echo -e "  ${GREEN}✅ AWS credentials found${NC}"
  echo "  Note: Full testing requires AWS CLI configuration"
else
  echo -e "  ${YELLOW}⏭️  AWS credentials not configured${NC}"
fi

# Test 5: Clarifai
print_header "5. Clarifai"

if [ -n "$CLARIFAI_API_KEY" ]; then
  echo "  API Key: ${YELLOW}${CLARIFAI_API_KEY:0:10}...${NC}"
  echo -e "  ${GREEN}✅ Clarifai credentials found${NC}"
else
  echo -e "  ${YELLOW}⏭️  Clarifai credentials not configured${NC}"
fi

# Test 6: TinEye
print_header "6. TinEye"

if [ -n "$TINEYE_API_KEY" ]; then
  echo "  API Key: ${YELLOW}${TINEYE_API_KEY:0:10}...${NC}"
  echo -e "  ${GREEN}✅ TinEye credentials found${NC}"
else
  echo -e "  ${YELLOW}⏭️  TinEye credentials not configured (trial pending)${NC}"
fi

# Summary
print_header "Configuration Summary"

configured=0
[ -n "$LEAKCHECK_API_KEY" ] && ((configured++))
[ -n "$HUGGINGFACE_API_KEY" ] && ((configured++))
[ -n "$GOOGLE_CLOUD_PROJECT_ID" ] && ((configured++))
[ -n "$AWS_ACCESS_KEY_ID" ] && ((configured++))
[ -n "$CLARIFAI_API_KEY" ] && ((configured++))
[ -n "$TINEYE_API_KEY" ] && ((configured++))

echo -e "  ${GREEN}$configured/6${NC} APIs configured"
echo ""

if [ $configured -ge 2 ]; then
  echo -e "  ${GREEN}✅ Ready to start development!${NC}"
  echo ""
  echo "  Next steps:"
  echo "    1. npm install (or pnpm install)"
  echo "    2. npm run dev"
  echo ""
else
  echo -e "  ${YELLOW}⚠️  Configure at least Hugging Face (CRITICAL)${NC}"
  echo ""
  echo "  Run: python3 scripts/register-apis.py"
  echo ""
fi

print_header "Test complete"
