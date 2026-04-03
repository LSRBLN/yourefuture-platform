# API Registration - Quick Start

**Email:** raut.deepakdesign@gmail.com  
**Time Estimate:** 45 minutes (all APIs) or 12 minutes (minimum MVP)  
**Status:** Interactive Registration Script Ready

---

## ⚡ Ultra-Quick Path (12 minutes - Minimum MVP)

### Only TWO steps needed to get started:

#### Step 1: Hugging Face (2 minutes)
```bash
# 1. Visit: https://huggingface.co/settings/tokens
# 2. Login with raut.deepakdesign@gmail.com
# 3. Click "New token" → name: yourefuture-mvp → type: read → Create
# 4. Copy token
# 5. Run this:

python3 scripts/register-apis.py
# When prompted, paste your Hugging Face token
```

#### Step 2: Google Cloud Vision (10 minutes) - *Optional but Recommended*
```bash
# 1. Visit: https://console.cloud.google.com
# 2. Create project: yourefuture-mvp
# 3. Enable "Cloud Vision API"
# 4. Create Service Account → download JSON key
# 5. Run the registration script again:

python3 scripts/register-apis.py
# When prompted, provide path to google-cloud-key.json
```

**Done!** Your MVP is ready. ✅

---

## 📋 Full Setup (45 minutes - All APIs)

Run the interactive registration script:

```bash
cd /Users/rebelldesign/yourefuture-platform
python3 scripts/register-apis.py
```

The script will guide you through:
1. **Hugging Face** (2 min) - CRITICAL
2. **Google Cloud Vision** (10 min) - RECOMMENDED
3. **AWS Rekognition** (15 min) - OPTIONAL
4. **Clarifai** (5 min) - OPTIONAL
5. **TinEye** (5 min) - TRIAL

---

## ✅ Verify Setup

After registration, verify all APIs are working:

```bash
bash scripts/test-apis.sh
```

You'll see output like:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  API Verification Script
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. LeakCheck.io
  Testing email leak check...
  ✅ LeakCheck working

2. Hugging Face
  Testing model access...
  ✅ Hugging Face authenticated as: raut

3. Google Cloud Vision
  Project ID: yourefuture-mvp
  ✅ Google Cloud credentials found
```

---

## 🎯 What Gets Configured

After running the script, you'll have this in `.env.local`:

```bash
# ========== API Keys ==========
LEAKCHECK_API_KEY=76d81752e9656ea124a08953dd3f45f3b804539a    # ✅ Already set
HUGGINGFACE_API_KEY=hf_YOUR_TOKEN_HERE                        # ← You'll add this
GOOGLE_CLOUD_PROJECT_ID=yourefuture-mvp                       # ← Optional
GOOGLE_CLOUD_API_KEY_PATH=/path/to/google-cloud-key.json      # ← Optional
AWS_ACCESS_KEY_ID=                                             # ← Optional
AWS_SECRET_ACCESS_KEY=                                         # ← Optional
CLARIFAI_API_KEY=                                              # ← Optional
TINEYE_API_KEY=                                                # ← Optional

# ========== Feature Flags ==========
FEATURE_LEAK_CHECK_ENABLED=true
FEATURE_IMAGE_ANALYSIS_ENABLED=true
FEATURE_VIDEO_ANALYSIS_ENABLED=false
FEATURE_REVERSE_IMAGE_SEARCH_ENABLED=false

# ========== Rate Limiting ==========
LEAKCHECK_REQUESTS_PER_MINUTE=20
HUGGINGFACE_REQUESTS_PER_MINUTE=10
GOOGLE_VISION_REQUESTS_PER_MINUTE=10
```

---

## 📖 Detailed Guides

- **Full Documentation:** [docs/API_REGISTRATION_AUTOMATION.md](API_REGISTRATION_AUTOMATION.md)
- **Setup Troubleshooting:** [docs/API_SETUP_GUIDE.md](API_SETUP_GUIDE.md)
- **Cost Breakdown:** [docs/API_KEYS_SUMMARY.md](API_KEYS_SUMMARY.md)

---

## 🚀 After Registration

Once you have `.env.local` configured:

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Run tests
pnpm run test
```

---

## ⚡ Troubleshooting

### Script won't run
```bash
# Make sure it's executable
chmod +x scripts/register-apis.py
chmod +x scripts/test-apis.sh

# Run with Python 3
python3 scripts/register-apis.py
```

### Token verification fails
- Copy the token exactly (no spaces)
- Make sure you used the correct email: `raut.deepakdesign@gmail.com`
- Check that token hasn't expired

### Missing dependencies
```bash
# Install requests (needed for verification)
pip3 install requests
```

### .env.local not found
```bash
# The script creates it automatically
# But if it's missing, create it manually
touch .env.local
```

---

## 🔗 Quick Links

| API | Link | Time | Status |
|-----|------|------|--------|
| **Hugging Face** | https://huggingface.co/settings/tokens | 2 min | 🟡 CRITICAL |
| **Google Cloud** | https://console.cloud.google.com | 10 min | 🟡 RECOMMENDED |
| **AWS** | https://aws.amazon.com/free | 15 min | 🔵 OPTIONAL |
| **Clarifai** | https://clarifai.com/sign-up | 5 min | 🔵 OPTIONAL |
| **TinEye** | https://tineye.com/solutions | 5 min | 🔵 TRIAL |

---

## 💡 Tips

1. **Save your passwords!** Use a password manager (1Password, KeePass, etc.)
2. **API keys are sensitive.** Never commit `.env.local` to git
3. **Free tier limits:** All APIs have rate limits (documented in .env.example)
4. **Verify tokens:** Always run `bash scripts/test-apis.sh` after setup

---

**Ready?** Start with:
```bash
python3 scripts/register-apis.py
```

**Need help?** See [API_REGISTRATION_AUTOMATION.md](API_REGISTRATION_AUTOMATION.md)
