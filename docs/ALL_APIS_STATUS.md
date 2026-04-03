# Complete API Status Dashboard

**Email:** raut.deepakdesign@gmail.com  
**Last Updated:** April 2, 2026  
**Registration Status:** Ready for Setup

---

## 📊 API Summary Table

| # | API | Purpose | Cost | Free Tier | Status | Setup Time | Priority |
|---|-----|---------|------|-----------|--------|-----------|----------|
| 1 | **LeakCheck.io** | Email/Username/Domain leak detection | Free + Paid | 200 req/day | ✅ Configured | <1 min | **CRITICAL** |
| 2 | **HIBP Pwned Passwords** | K-anonymity password breach checking | Free | Unlimited | ✅ Ready | <1 min | **CRITICAL** |
| 3 | **Hugging Face** | Deepfake, NSFW, moderation detection | Free | Unlimited (fair use) | 🟡 Needed | 2 min | **CRITICAL** |
| 4 | **Google Cloud Vision** | Image analysis, safe search, OCR | Free + Paid | 1,000/month | 🟡 Optional | 10 min | **RECOMMENDED** |
| 5 | **AWS Rekognition** | Image/Video analysis, moderation | Free + Paid | 5K/month (12mo) | 🟡 Optional | 15 min | **OPTIONAL** |
| 6 | **Clarifai** | AI moderation, image/video analysis | Free + Paid | 10K ops/month | 🟡 Optional | 5 min | **OPTIONAL** |
| 7 | **SightEngine** | Image moderation | Trial + Paid | 30-day trial | 🔵 Trial | 5 min | LATER |
| 8 | **TinEye MatchEngine** | Reverse image search | Trial + Paid | 30-day trial | 🔵 Trial | 5 min | LATER |
| 9 | **Cybernews** | Domain leak detection | Free + Paid | Limited | 🔵 Trial | 5 min | LATER |

---

## 🎯 MVP Setup (€0 - No Cost)

These 3 APIs give you full MVP functionality **completely free**:

### 1. ✅ LeakCheck.io
- **Status:** Already configured
- **API Key:** `76d81752e9656ea124a08953dd3f45f3b804539a`
- **Features:**
  - Email leak checking (200 req/day free)
  - Username leak searching
  - Domain leak detection
  - Multiple breach sources
- **Cost:** FREE
- **Setup:** ✅ DONE

### 2. ✅ HIBP Pwned Passwords (Pwned Passwords API)
- **Status:** Ready to use (no key needed!)
- **Features:**
  - Check if password appears in breach databases
  - K-anonymity protocol (NEVER sends full password)
  - Hash prefix approach (ultra-secure)
  - Unlimited requests
- **Cost:** FREE
- **Setup:** ✅ AUTOMATIC (No registration needed!)
- **Implementation:** Already in `apps/api/src/lib/external-apis.ts`

### 3. 🟡 Hugging Face (CRITICAL - 2 min setup)
- **Status:** Not yet configured
- **Features:**
  - Deepfake detection (AI-generated face detection)
  - NSFW image detection
  - Image classification
  - Unlimited free tier
  - Very fast inference
- **Cost:** FREE (unlimited, fair use policy)
- **Setup:** 2 minutes
  - Visit: https://huggingface.co/settings/tokens
  - Create token named `yourefuture-mvp`
  - Add to `.env.local`: `HUGGINGFACE_API_KEY=hf_...`

---

## 🚀 Enhanced Setup (+10 min, Still €0)

Add Google Cloud Vision for professional-grade image analysis:

### 4. 🟡 Google Cloud Vision (RECOMMENDED - 10 min setup)
- **Status:** Optional but highly recommended
- **Features:**
  - Safe search detection (explicit content)
  - Object detection
  - Text detection (OCR)
  - Face detection & analysis
  - Logo detection
- **Cost:** FREE (1,000 images/month free tier)
- **Setup:** 10 minutes
  - Create GCP project
  - Enable Vision API
  - Create service account
  - Download JSON credentials
  - Add project ID & key path to `.env.local`

**Result:** MVP ready for production-grade image detection

---

## 💪 Full Setup (€0 + Optional Trials)

Add AWS and Clarifai for video analysis and advanced features:

### 5. 🟡 AWS Rekognition (OPTIONAL - 15 min setup)
- **Status:** Optional for advanced features
- **Features:**
  - Video analysis (frame-by-frame moderation)
  - Image/Video moderation
  - Celebrity recognition
  - Face matching
  - Custom labels
- **Cost:** FREE (5K images/month, 12 months AWS free tier)
- **Setup:** 15 minutes
  - Create AWS account (with payment method, but fully free)
  - Create IAM user
  - Generate access keys
  - Add to `.env.local`

### 6. 🟡 Clarifai (OPTIONAL - 5 min setup)
- **Status:** Optional for enterprise features
- **Features:**
  - AI moderation
  - NSFW detection
  - Custom model training
  - Web-based dashboard
- **Cost:** FREE (10K operations/month)
- **Setup:** 5 minutes
  - Sign up at: https://clarifai.com/sign-up
  - Create API key
  - Add to `.env.local`

---

## 📅 Trial APIs (Request Later)

These have good trial periods but not needed for MVP:

### 7. 🔵 SightEngine
- **Purpose:** Specialized image moderation
- **Trial:** 30 days, €49+/month after
- **Setup:** 5 min
- **Status:** Request when needed
- **Link:** https://sightengine.com

### 8. 🔵 TinEye MatchEngine
- **Purpose:** Reverse image search (find if image elsewhere on web)
- **Trial:** 30 days, custom pricing
- **Setup:** 5 min (request form)
- **Status:** Request when needed
- **Link:** https://tineye.com/solutions

### 9. 🔵 Cybernews
- **Purpose:** Domain leak detection
- **Trial:** Free limited access
- **Setup:** 5 min
- **Status:** Request when needed
- **Link:** https://cybernews.com

---

## 🛠️ Implementation Status

### Backend Code (✅ Complete)
- ✅ [apps/api/src/lib/external-apis.ts](../apps/api/src/lib/external-apis.ts)
  - LeakCheckService
  - PwnedPasswordsService
  - ImageAnalysisService
  - ExternalAPIService (composite)

- ✅ [apps/api/src/routes/checks.controller.ts](../apps/api/src/routes/checks.controller.ts)
  - `POST /api/v1/checks/leak` (email/password/username/domain)
  - `POST /api/v1/checks/image` (image URL or base64)
  - `POST /api/v1/checks/password-strength` (scoring + breach check)
  - `POST /api/v1/checks/comprehensive` (combined check)

### Frontend Code (✅ Complete)
- ✅ [apps/web/src/lib/api-client.ts](../apps/web/src/lib/api-client.ts)
  - `checkEmailLeak(email)`
  - `checkPasswordStrength(password)`
  - `analyzeImage(imageUrl | File)`
  - `comprehensiveCheck(email, imageUrl)`

- ✅ [apps/web/src/components/LeakCheckWidget.tsx](../apps/web/src/components/LeakCheckWidget.tsx)
  - Email leak check UI
  - Password strength meter
  - Result display with risk levels
  - Loading states & error handling

### Configuration (✅ Template Ready, 🟡 Needs Population)
- ✅ [apps/api/.env.example](../apps/api/.env.example) - Template with all variables
- 🟡 `.env.local` - Needs API keys (after registration)

### Documentation (✅ Complete)
- ✅ [docs/API_REGISTRATION_QUICK_START.md](API_REGISTRATION_QUICK_START.md) - 12-min quick setup
- ✅ [docs/API_REGISTRATION_AUTOMATION.md](API_REGISTRATION_AUTOMATION.md) - Detailed guide
- ✅ [docs/API_SETUP_GUIDE.md](API_SETUP_GUIDE.md) - Setup instructions
- ✅ [docs/API_KEYS_SUMMARY.md](API_KEYS_SUMMARY.md) - API status overview
- ✅ [docs/IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md) - 6-phase plan

### Scripts (✅ Complete)
- ✅ [scripts/register-apis.py](../scripts/register-apis.py) - Interactive registration
- ✅ [scripts/test-apis.sh](../scripts/test-apis.sh) - API verification

---

## 📈 Cost Analysis

### Month 1 (MVP Launch)
```
LeakCheck.io:              €0 (free tier)
HIBP Pwned Passwords:      €0 (free)
Hugging Face:              €0 (free tier)
Google Cloud Vision:       €0 (1,000 free/month)
AWS Rekognition:           €0 (free tier 12mo)
────────────────────────────────────
TOTAL:                     €0/month
```

### Month 13+ (After AWS free tier expires, full scale)
```
LeakCheck.io (scaled):     €100-200/month
HIBP integration:          €3.50/month
Hugging Face (scaled):     €50-100/month
Google Cloud Vision:       €50-100/month
AWS Rekognition:           €100-200/month
────────────────────────────────────
TOTAL:                     €303.50 - €603.50/month
```

**Key insight:** MVP can launch for €0. Scale incrementally as needed.

---

## ✨ Quick Reference

### Environment Variables Needed

```bash
# CRITICAL (MVP won't work without this)
HUGGINGFACE_API_KEY=hf_...

# RECOMMENDED (professional image analysis)
GOOGLE_CLOUD_PROJECT_ID=...
GOOGLE_CLOUD_API_KEY_PATH=...

# OPTIONAL (advanced features)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
CLARIFAI_API_KEY=...
CLARIFAI_PAT=...

# TRIAL (request when needed)
TINEYE_API_KEY=...
SIGHTENGINE_API_KEY=...
```

### API Rate Limits (Free Tier)

| API | Requests/Day | Requests/Month |
|-----|--------------|-----------------|
| LeakCheck.io | 200 | ~6,000 |
| HIBP Passwords | Unlimited | Unlimited |
| Hugging Face | Unlimited (fair use) | Unlimited |
| Google Cloud | 1,000 | 1,000 |
| AWS Rekognition | 166/day | 5,000/month |
| Clarifai | 333/day | 10,000/month |

---

## 🚀 Next Steps

### Immediate (Today)
1. Run: `python3 scripts/register-apis.py`
2. Set up Hugging Face (2 min)
3. Optionally set up Google Cloud (10 min)
4. Verify: `bash scripts/test-apis.sh`

### This Week
1. Integrate code into app (1-2 hours)
2. Test each endpoint (1 hour)
3. Deploy to staging (1 hour)

### This Month
1. Monitor API usage & costs
2. Optimize rate limiting
3. Add caching layer (Redis)
4. Plan for scale (if needed)

---

## 📞 Support & Links

**Documentation:**
- Setup Guide: [API_SETUP_GUIDE.md](API_SETUP_GUIDE.md)
- Quick Start: [API_REGISTRATION_QUICK_START.md](API_REGISTRATION_QUICK_START.md)
- Detailed Automation: [API_REGISTRATION_AUTOMATION.md](API_REGISTRATION_AUTOMATION.md)
- Implementation Plan: [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)

**API Provider Links:**
- LeakCheck: https://leakcheck.io
- HIBP: https://haveibeenpwned.com
- Hugging Face: https://huggingface.co
- Google Cloud: https://cloud.google.com
- AWS: https://aws.amazon.com
- Clarifai: https://clarifai.com

**Tools:**
- Registration Script: `python3 scripts/register-apis.py`
- Verification Script: `bash scripts/test-apis.sh`

---

**Status:** ✅ Complete and ready for implementation  
**Email:** raut.deepakdesign@gmail.com  
**Last Updated:** April 2, 2026
