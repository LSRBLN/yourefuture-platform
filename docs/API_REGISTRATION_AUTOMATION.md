# API Registration Automation Guide

**Email:** raut.deepakdesign@gmail.com  
**Status:** Automated Setup Instructions  
**Last Updated:** April 2, 2026

---

## Quick Summary

This guide provides automated and semi-automated registration steps for all free/trial APIs. Total time: ~45 minutes for full setup.

### APIs to Register (Priority Order)

| # | API | Cost | Status | Time | Link |
|---|-----|------|--------|------|------|
| 1 | Hugging Face | FREE | 🟡 Needed | 2 min | https://huggingface.co/settings/tokens |
| 2 | Google Cloud Vision | FREE (1K/mo) | 🟡 Needed | 10 min | https://console.cloud.google.com |
| 3 | AWS Rekognition | FREE (5K/mo, 12mo) | 🟡 Optional | 15 min | https://aws.amazon.com/free |
| 4 | Clarifai | FREE | 🟡 Optional | 5 min | https://clarifai.com/sign-up |
| 5 | TinEye | Trial | 🟡 Optional | 5 min | https://tineye.com/solutions |

---

## 1. Hugging Face (CRITICAL - 2 minutes)

### Step-by-Step

1. **Visit:** https://huggingface.co/settings/tokens
2. **Login/Sign Up:**
   - Email: `raut.deepakdesign@gmail.com`
   - Password: Create a strong one (store in 1Password/similar)
   - Verify email
3. **Create API Token:**
   - Click "New token"
   - Name: `yourefuture-mvp`
   - Type: `read` (minimum permissions)
   - Click "Create token"
4. **Copy Token** (looks like: `hf_AbCdEfGhIjKlMnOpQrStUvWxYz`)
5. **Save to `.env.local`:**
   ```bash
   HUGGINGFACE_API_KEY=hf_YOUR_TOKEN_HERE
   ```

### Verification

```bash
curl -X POST \
  https://api-inference.huggingface.co/models/Falconsai/nsfw_image_detection \
  -H "Authorization: Bearer hf_YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "https://example.com/image.jpg"}'
```

---

## 2. Google Cloud Vision (10 minutes)

### Step-by-Step

1. **Visit:** https://console.cloud.google.com
2. **Create Project:**
   - Click "Select a Project" (top-left)
   - Click "NEW PROJECT"
   - Name: `yourefuture-mvp`
   - Organization: (leave blank)
   - Click "CREATE"
   - Wait 1-2 minutes for creation
3. **Enable Vision API:**
   - Search "Vision API" in top search bar
   - Click "Cloud Vision API"
   - Click "ENABLE"
   - Wait for activation
4. **Create Service Account:**
   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
   - Click "CREATE SERVICE ACCOUNT"
   - Service account name: `yourefuture-vision`
   - Service account ID: (auto-filled)
   - Click "CREATE AND CONTINUE"
   - Grant roles: `Editor` (for MVP, restrict later)
   - Click "CONTINUE" → "DONE"
5. **Create JSON Key:**
   - Find the service account in the list
   - Click on service account email
   - Go to "KEYS" tab
   - Click "ADD KEY" → "Create new key"
   - Type: `JSON`
   - Click "CREATE"
   - **Save the downloaded JSON file** as `google-cloud-key.json`
6. **Extract Credentials:**
   ```bash
   cat google-cloud-key.json | jq -r '.project_id'  # Get PROJECT_ID
   cat google-cloud-key.json | jq -r '.private_key_id'  # Get KEY_ID
   ```
7. **Save to `.env.local`:**
   ```bash
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_CLOUD_API_KEY_PATH=/path/to/google-cloud-key.json
   ```

### Verification

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [{
      "image": {"source": {"imageUri": "https://example.com/image.jpg"}},
      "features": [{"type": "SAFE_SEARCH_DETECTION"}]
    }]
  }' \
  https://vision.googleapis.com/v1/images:annotate?key=YOUR_API_KEY
```

---

## 3. AWS Rekognition (15 minutes - Optional)

### Step-by-Step

1. **Visit:** https://aws.amazon.com/free
2. **Sign Up / Login:**
   - Email: `raut.deepakdesign@gmail.com`
   - Create account if needed
   - Add payment method (required for AWS, but free tier is fully free)
3. **Create Access Keys:**
   - Go to: https://console.aws.amazon.com/iam/home
   - Left sidebar → "Users"
   - Click "Create user"
   - Username: `yourefuture-mvp`
   - Click "Next"
   - Attach policies: Search "Rekognition" → Select `AmazonRekognitionReadOnlyAccess`
   - Click "Create user"
4. **Generate Access Key:**
   - Click on the created user
   - Go to "Security credentials" tab
   - Scroll to "Access keys"
   - Click "Create access key"
   - Choose "Application running outside AWS"
   - Click "Create access key"
   - **Copy:** Access Key ID and Secret Access Key
5. **Save to `.env.local`:**
   ```bash
   AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
   AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
   AWS_REGION=us-east-1
   ```

### Verification

```bash
aws rekognition detect-explicit-content \
  --image S3Object=\{Bucket=yourefuture-bucket,Name=test.jpg\} \
  --region us-east-1
```

---

## 4. Clarifai (5 minutes - Optional)

### Step-by-Step

1. **Visit:** https://clarifai.com/sign-up
2. **Sign Up:**
   - Email: `raut.deepakdesign@gmail.com`
   - Password: Create strong password
   - Organization: `yourefuture`
   - Click "Sign Up"
3. **Verify Email** (check inbox)
4. **Create API Key:**
   - Go to: https://clarifai.com/settings/keys
   - Click "Generate New Key"
   - Name: `yourefuture-mvp`
   - Click "Generate"
   - **Copy the API Key** (looks like: `f1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6`)
5. **Save to `.env.local`:**
   ```bash
   CLARIFAI_API_KEY=YOUR_KEY
   CLARIFAI_PAT=YOUR_PERSONAL_ACCESS_TOKEN  # From same page
   CLARIFAI_APP_ID=main  # Default app
   CLARIFAI_USER_ID=clarifai  # Default workspace
   ```

### Verification

```bash
curl -X POST \
  -H "Authorization: Key YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": [{
      "data": {"image": {"url": "https://example.com/image.jpg"}}
    }]
  }' \
  https://api.clarifai.com/v2/models/MODERATION_ID/outputs
```

---

## 5. TinEye (5 minutes - Trial)

### Step-by-Step

1. **Visit:** https://tineye.com/solutions
2. **Request Trial:**
   - Click "Get API Access"
   - Fill form:
     - Name: Your name
     - Email: `raut.deepakdesign@gmail.com`
     - Company: `yourefuture`
     - Use case: "Deepfake detection and leak detection"
   - Click "REQUEST TRIAL"
3. **Check Email** for API credentials (usually within 24 hours)
4. **Save to `.env.local` once received:**
   ```bash
   TINEYE_API_KEY=YOUR_KEY
   TINEYE_API_SECRET=YOUR_SECRET
   ```

---

## Complete .env.local Template

```bash
# ==================== API KEYS ====================
# LeakCheck (Email/Username/Domain leaks) - CONFIGURED
LEAKCHECK_API_KEY=76d81752e9656ea124a08953dd3f45f3b804539a

# Hugging Face (Deepfake/NSFW detection) - NEEDED
HUGGINGFACE_API_KEY=

# Google Cloud Vision (Image analysis) - OPTIONAL
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_API_KEY_PATH=

# AWS Rekognition (Image/Video analysis) - OPTIONAL
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1

# Clarifai (Moderation) - OPTIONAL
CLARIFAI_API_KEY=
CLARIFAI_PAT=
CLARIFAI_APP_ID=main
CLARIFAI_USER_ID=clarifai

# TinEye (Reverse image search) - TRIAL
TINEYE_API_KEY=
TINEYE_API_SECRET=

# ==================== FEATURE FLAGS ====================
FEATURE_LEAK_CHECK_ENABLED=true
FEATURE_IMAGE_ANALYSIS_ENABLED=true
FEATURE_VIDEO_ANALYSIS_ENABLED=false
FEATURE_REVERSE_IMAGE_SEARCH_ENABLED=false

# ==================== RATE LIMITING ====================
LEAKCHECK_REQUESTS_PER_MINUTE=20
HUGGINGFACE_REQUESTS_PER_MINUTE=10
GOOGLE_VISION_REQUESTS_PER_MINUTE=10
```

---

## Automated Verification Script

Save this as `scripts/verify-apis.sh`:

```bash
#!/bin/bash

echo "🔍 API Verification Script"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load .env.local
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '#' | xargs)
else
  echo -e "${RED}❌ .env.local not found${NC}"
  exit 1
fi

# Check LeakCheck
echo -n "✓ LeakCheck.io... "
if [ -n "$LEAKCHECK_API_KEY" ]; then
  echo -e "${GREEN}Configured${NC}"
else
  echo -e "${YELLOW}Not configured${NC}"
fi

# Check Hugging Face
echo -n "✓ Hugging Face... "
if [ -n "$HUGGINGFACE_API_KEY" ]; then
  RESPONSE=$(curl -s -X GET \
    -H "Authorization: Bearer $HUGGINGFACE_API_KEY" \
    https://huggingface.co/api/whoami)
  
  if echo "$RESPONSE" | grep -q "error"; then
    echo -e "${RED}Invalid key${NC}"
  else
    echo -e "${GREEN}Valid${NC}"
  fi
else
  echo -e "${YELLOW}Not configured${NC}"
fi

# Check Google Cloud
echo -n "✓ Google Cloud Vision... "
if [ -n "$GOOGLE_CLOUD_PROJECT_ID" ] && [ -f "$GOOGLE_CLOUD_API_KEY_PATH" ]; then
  echo -e "${GREEN}Configured${NC}"
else
  echo -e "${YELLOW}Not configured${NC}"
fi

# Check AWS
echo -n "✓ AWS Rekognition... "
if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
  echo -e "${GREEN}Configured${NC}"
else
  echo -e "${YELLOW}Not configured${NC}"
fi

# Check Clarifai
echo -n "✓ Clarifai... "
if [ -n "$CLARIFAI_API_KEY" ]; then
  echo -e "${GREEN}Configured${NC}"
else
  echo -e "${YELLOW}Not configured${NC}"
fi

echo ""
echo "✅ Verification complete!"
```

Run with:
```bash
chmod +x scripts/verify-apis.sh
./scripts/verify-apis.sh
```

---

## Summary Checklist

- [ ] **Step 1:** Hugging Face (2 min) - CRITICAL
- [ ] **Step 2:** Google Cloud Vision (10 min) - RECOMMENDED
- [ ] **Step 3:** AWS Rekognition (15 min) - OPTIONAL
- [ ] **Step 4:** Clarifai (5 min) - OPTIONAL
- [ ] **Step 5:** TinEye (5 min) - OPTIONAL
- [ ] **Step 6:** Update `.env.local` with all keys
- [ ] **Step 7:** Run verification script
- [ ] **Step 8:** Test each API endpoint

**Total Time:** 45 minutes (if doing all)  
**Minimum Time:** 12 minutes (Hugging Face + Google Cloud)

---

## Support Links

- **Hugging Face Docs:** https://huggingface.co/docs/hub/security-tokens
- **Google Cloud Docs:** https://cloud.google.com/docs/authentication/api-keys
- **AWS Docs:** https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html
- **Clarifai Docs:** https://docs.clarifai.com/api-guide/authentication
- **TinEye Docs:** https://tineye.com/solutions/documentation
