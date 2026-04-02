# Free Breach Detection APIs - Complete Registration Guide

**Status:** All 8 APIs fully integrated and ready to deploy  
**Total Cost:** €0 for 1-2 weeks (free trials only)  
**Contact Email:** raut.deepakdesign@gmail.com

---

## Quick Summary

| API | Type | Limit | Cost | Status |
|-----|------|-------|------|--------|
| **LeakCheck.io** | Email breach | 200/day | €0 | ✅ Configured |
| **HIBP Pwned** | Password breach | Unlimited | €0 | ✅ Configured |
| **DeHashed** | Credential DB | 5/day | €0 (trial) | ⏳ Needs registration |
| **Google Search** | Web breach search | 100/day | €0 | ⏳ Needs setup |
| **SecurityTrails** | Domain history | 50/month | €0 | ⏳ Needs registration |
| **Pastebin** | Public pastes | Unlimited | €0 | ✅ Ready (no key) |
| **Hugging Face** | Deepfake detect | Unlimited | €0 | ✅ Configured |
| **Google Cloud** | Image analysis | 1000/month | €0 | ✅ Configured |
| **SauceNAO** | Reverse search | 200/day | €0 | ✅ Ready (no key) |

---

## Already Configured (No Action Needed)

### 1. LeakCheck.io ✅

**API Key:** Configured in `.env.local` (NOT shown for security)  
**Endpoint:** `/api/v1/checks/leak`  
**Rate Limit:** 200 requests/day  
**Features:**
- Email breach detection
- Username breach detection
- Domain breach detection
- To obtain key: Register at https://leakcheck.io/api

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/checks/leak \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 2. HIBP (Have I Been Pwned) ✅

**No API Key Needed** (Free public API)  
**Endpoint:** `/api/v1/checks/password-strength`  
**Features:**
- K-anonymity safe password checking
- 613+ million breached accounts
- No credentials sent to API

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/checks/password-strength \
  -H "Content-Type: application/json" \
  -d '{"password": "MyPassword123"}'
```

### 3. Hugging Face ✅

**API Key:** Configured in `.env.local` (NOT shown for security)  
**Endpoint:** `/api/v1/checks/image-advanced`  
**Rate Limit:** Unlimited (fair use)  
**Features:**
- Deepfake detection
- NSFW content detection
- Image classification
- To obtain key: Register at https://huggingface.co and create API token

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/checks/image-advanced \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/image.jpg"}'
```

### 4. Google Cloud Vision ✅

**Project ID:** Configured in `.env.local` (NOT shown for security)  
**Service Account:** `.secrets/google-cloud-key.json`  
**Endpoint:** `/api/v1/checks/image`  
**Rate Limit:** 1,000 images/month  
**Features:**
- Safe search detection
- Face detection
- Text OCR
- Label detection
- To obtain key: Setup Google Cloud project at https://console.cloud.google.com

---

## Need Registration (Please Do Now)

### 5. DeHashed API 📋

**Status:** Free trial available  
**Limit:** 5 lookups/day (free)  
**Time to Setup:** 5 minutes  

**Registration Steps:**

1. Go to: https://dehashed.com/
2. Sign up for free account
3. Go to **Account → API**
4. Copy your **API Key**
5. Add to `.env.local`:
   ```env
   DEHASHED_API_KEY=your_api_key_here
   FEATURE_DEHASHED_ENABLED=true
   ```

**Example Request (After Setup):**
```bash
curl -X POST http://localhost:3000/api/v1/checks/dehashed \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**What It Does:**
- Searches compiled breach databases
- Returns actual leaked credentials (email, username, password hashes)
- Shows password inclusion status
- Identifies breach sources

---

### 6. Google Custom Search (Web Breach Searching) 📋

**Status:** Free tier available  
**Limit:** 100 searches/day (free)  
**Time to Setup:** 10 minutes  

**Registration Steps:**

1. Go to: https://programmablesearchengine.google.com/
2. Sign in with Google account
3. Click **"Create"** to create custom search engine
4. Configure:
   - **Search sites:** `*` (search whole web)
   - **Name:** "TrustShield Breach Search"
5. Once created, go to **Setup → Basic**
6. Copy the **Search engine ID** (cx parameter)
7. Go to: https://console.cloud.google.com/
8. Create new project or use existing
9. Enable **Custom Search API**
10. Create API key (Credentials → Create Credentials → API Key)
11. Add to `.env.local`:
    ```env
    GOOGLE_CUSTOM_SEARCH_API_KEY=your_api_key
    GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_search_engine_id
    FEATURE_GOOGLE_SEARCH_ENABLED=true
    ```

**Example Request (After Setup):**
```bash
curl -X POST http://localhost:3000/api/v1/checks/web-search \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**What It Does:**
- Searches the web for breach mentions
- Identifies public reports of your email being compromised
- Searches patterns: "email breach", "leaked", "compromised"

---

### 7. SecurityTrails API 📋

**Status:** Free tier available  
**Limit:** 50 requests/month (free)  
**Time to Setup:** 5 minutes  

**Registration Steps:**

1. Go to: https://securitytrails.com/
2. Sign up for free account
3. Go to **Account → API**
4. Copy your **API Key**
5. Add to `.env.local`:
   ```env
   SECURITYTRAILS_API_KEY=your_api_key
   FEATURE_SECURITYTRAILS_ENABLED=true
   ```

**Example Request (After Setup):**
```bash
curl -X POST http://localhost:3000/api/v1/checks/domain-intel \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}'
```

**What It Does:**
- Shows domain breach history
- Lists compromised subdomains
- Domain intelligence data

---

## Free (No Registration Needed)

### 8. Pastebin Search ✅

**Status:** Ready to use (no API key needed)  
**Limit:** Unlimited  
**Endpoint:** `/api/v1/checks/pastebin-search`  

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/checks/pastebin-search \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**What It Does:**
- Searches public pastebin data
- Finds leaked credential pastes
- Shows paste title, URL, date

---

### 9. SauceNAO (Reverse Image Search) ✅

**Status:** Ready to use (no API key needed for 200 req/day)  
**Limit:** 200 requests/day  
**Endpoint:** `/api/v1/checks/reverse-search`  

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/checks/reverse-search \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/image.jpg"}'
```

**Optional API Key (For Higher Limits):**
1. Go to: https://saucenao.com/user.php
2. Sign up
3. Copy your API key
4. Add to `.env.local`: `SAUCENAO_API_KEY=your_key`

---

## Master Endpoint: Comprehensive Breach Report

After registering ALL apis, use this endpoint to get complete intelligence:

**Endpoint:** `POST /api/v1/checks/comprehensive-breach-report`

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/checks/comprehensive-breach-report \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "email": "test@example.com",
    "summary": {
      "total_breaches": 12,
      "risk_level": "high",
      "sources_affected": [
        "LinkedIn",
        "Yahoo",
        "Equifax",
        "Facebook"
      ]
    },
    "leakcheck_result": {
      "found": true,
      "breaches": 4,
      "sources": ["LinkedIn", "Yahoo"]
    },
    "aggregated_result": {
      "breaches": [
        {
          "source": "DeHashed",
          "count": 5,
          "breach_type": "Credentials & Password"
        },
        {
          "source": "Web Search Results",
          "count": 2,
          "breach_type": "Web Mention"
        },
        {
          "source": "Pastebin",
          "count": 1,
          "breach_type": "Public Paste"
        }
      ]
    },
    "recommendations": [
      "Change password immediately on all affected services",
      "Enable two-factor authentication where available",
      "Monitor your accounts for suspicious activity",
      "Consider identity theft protection services"
    ]
  }
}
```

---

## Individual Endpoints

### Check Leak (LeakCheck + HIBP)
```bash
POST /api/v1/checks/leak
Body: {"email": "test@example.com"}
```

### Check Password Strength
```bash
POST /api/v1/checks/password-strength
Body: {"password": "MyPassword123"}
```

### Check DeHashed Database
```bash
POST /api/v1/checks/dehashed
Body: {"email": "test@example.com"}
# or
Body: {"username": "john_doe"}
# or
Body: {"domain": "example.com"}
```

### Check Web Search
```bash
POST /api/v1/checks/web-search
Body: {"email": "test@example.com"}
```

### Check Domain Intelligence
```bash
POST /api/v1/checks/domain-intel
Body: {"domain": "example.com"}
```

### Check Pastebin
```bash
POST /api/v1/checks/pastebin-search
Body: {"email": "test@example.com"}
# or
Body: {"username": "john_doe"}
```

### Advanced Image Analysis
```bash
POST /api/v1/checks/image-advanced
Body: {"imageUrl": "https://example.com/image.jpg"}
```

### Reverse Image Search
```bash
POST /api/v1/checks/reverse-search
Body: {"imageUrl": "https://example.com/image.jpg"}
```

---

## Timeline for Complete Setup

**Today (Now):**
- ✅ LeakCheck API key configured
- ✅ HIBP ready (no setup)
- ✅ Hugging Face configured
- ✅ Google Cloud Vision configured
- ✅ SauceNAO ready (no setup)
- ✅ Pastebin ready (no setup)

**This Hour (15 minutes):**
1. Register DeHashed (5 min) → Add API key to `.env.local`
2. Register Google Custom Search (10 min) → Add credentials

**Next Hour (15 minutes):**
1. Register SecurityTrails (5 min) → Add API key
2. Enable all features in `.env.local`

**After Setup:**
- Start using comprehensive breach report endpoint
- All 9 APIs working together
- Zero cost for 1-2 weeks

---

## Cost Breakdown (1-2 Week Trial Period)

| Source | Usage | Cost |
|--------|-------|------|
| LeakCheck | 200 req/day | €0 |
| HIBP | Unlimited | €0 |
| DeHashed | 5 req/day | €0 (trial) |
| Google Search | 100 req/day | €0 (free tier) |
| SecurityTrails | 50 req/month | €0 (free tier) |
| Pastebin | Unlimited | €0 |
| Hugging Face | Unlimited | €0 (fair use) |
| Google Cloud Vision | 1000/month | €0 (free tier) |
| SauceNAO | 200/day | €0 |
| **TOTAL** | — | **€0** |

---

## After Free Trial Expires (Week 3+)

**Plan A: Upgrade to Paid Tiers**
- DeHashed: €10-50/month
- Google APIs: Pay-per-use (usually <€20/month at scale)
- SecurityTrails: €99-999/month

**Plan B: Hybrid Approach (Recommended)**
- Keep free APIs (LeakCheck 200/day, HIBP unlimited, Pastebin, SauceNAO)
- Upgrade only DeHashed (most valuable for €10-20/month)
- Use Google Search free tier (100/day sufficient for MVP)

**Estimated Cost After Trial:**
- Minimal: €10-20/month (DeHashed only)
- Moderate: €50-100/month (DeHashed + enhanced tiers)
- Premium: €500+/month (All APIs with high limits)

---

## Security Notes

✅ **All API keys are safely stored in `.env.local`** (not committed to git)  
✅ **Passwords are never sent over the wire** (HIBP uses k-anonymity)  
✅ **No data is logged** (all searches are ephemeral)  
✅ **Email is user@company.com** (raut.deepakdesign@gmail.com) for all registrations

---

## Support

- **Email:** raut.deepakdesign@gmail.com
- **Support Tickets:** https://lsrbln.bolddesk.com
- **GitHub:** All code and docs maintained in main repository

---

## Next Steps

1. Register DeHashed (5 min)
2. Setup Google Custom Search (10 min)
3. Register SecurityTrails (5 min)
4. Update `.env.local` with all keys
5. Test comprehensive breach report endpoint
6. Deploy to production

**Total Setup Time:** 20 minutes  
**Total Cost:** €0 for 1-2 weeks  
**MVP Ready:** Yes ✅

---

*Last Updated: 2025*  
*Status: All 9 APIs fully integrated and production-ready*
