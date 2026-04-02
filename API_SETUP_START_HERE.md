# 🚀 API Setup - START HERE

**Email:** raut.deepakdesign@gmail.com  
**Project:** yourefuture-platform  
**Date:** April 2, 2026

---

## ⚡ 2-Minute Quick Start

Run this **one command** to register all APIs:

```bash
python3 scripts/register-apis.py
```

This interactive script will:
1. Guide you through Hugging Face setup (CRITICAL - 2 min)
2. Guide you through Google Cloud (OPTIONAL - 10 min)
3. Guide you through AWS, Clarifai, TinEye (ALL OPTIONAL)
4. Automatically create `.env.local` with all keys
5. Verify everything works

**That's it!** Your APIs are configured.

---

## 📋 What Gets Set Up

| Service | Cost | Status After Script |
|---------|------|---------------------|
| LeakCheck.io | Free | ✅ Already set (76d81752e9656ea124a08953dd3f45f3b804539a) |
| HIBP Passwords | Free | ✅ Automatic (no key needed) |
| **Hugging Face** | Free | 🟡 **YOU NEED TO PROVIDE TOKEN** |
| Google Cloud Vision | Free (1K/mo) | 🟡 Optional |
| AWS Rekognition | Free (5K/mo) | 🟡 Optional |
| Clarifai | Free (10K/mo) | 🟡 Optional |
| TinEye | Trial | 🔵 Request on website |

---

## 🎯 Minimum Viable Setup (12 minutes)

To get your app working **today**, you only need:

### Step 1: Hugging Face Token (2 minutes)
```bash
# Visit: https://huggingface.co/settings/tokens
# Login with: raut.deepakdesign@gmail.com
# Create token → Copy it
# When prompted by the script, paste it
```

### Step 2: Run Setup Script (1 minute)
```bash
cd /Users/rebelldesign/yourefuture-platform
python3 scripts/register-apis.py
# When prompted for Hugging Face, paste your token
# For other APIs, just press Enter to skip
```

### Step 3: Verify (1 minute)
```bash
bash scripts/test-apis.sh
# Should show green checkmarks for LeakCheck and Hugging Face
```

**✅ Done!** Your MVP is ready.

---

## 📚 Documentation Map

### Quick References
- **[API_REGISTRATION_QUICK_START.md](docs/API_REGISTRATION_QUICK_START.md)** ⭐ Read this first!
  - 12-minute quick setup
  - Step-by-step instructions
  - Troubleshooting tips

- **[ALL_APIS_STATUS.md](docs/ALL_APIS_STATUS.md)** 📊 Full overview
  - All 9 APIs explained
  - Cost analysis (€0 MVP to €500+/mo at scale)
  - Implementation status
  - Rate limits and quotas

### Detailed Setup Guides
- **[API_REGISTRATION_AUTOMATION.md](docs/API_REGISTRATION_AUTOMATION.md)** 🔧 Full technical guide
  - Step-by-step for each API
  - Curl verification commands
  - Troubleshooting by API
  - Complete .env.local template

- **[API_SETUP_GUIDE.md](docs/API_SETUP_GUIDE.md)** 📖 Implementation guide
  - How to configure each API
  - Environment variables
  - Testing commands
  - FAQ section

### Status & Planning
- **[API_KEYS_SUMMARY.md](docs/API_KEYS_SUMMARY.md)** 🔑 API status dashboard
  - Current configuration status
  - Which keys are needed
  - Security checklist
  - FAQ

- **[IMPLEMENTATION_CHECKLIST.md](docs/IMPLEMENTATION_CHECKLIST.md)** ✅ 6-phase plan
  - Phase 1: Setup (30 min)
  - Phase 2: Backend (1 hour)
  - Phase 3: Frontend (1 hour)
  - Phase 4: Security (2 hours)
  - Phase 5: Deploy (2 hours)
  - Phase 6: Monitor

### Code & Implementation
- **[apps/api/src/lib/external-apis.ts](apps/api/src/lib/external-apis.ts)** 💻 Backend service
  - LeakCheckService
  - PwnedPasswordsService
  - ImageAnalysisService
  - Ready to use!

- **[apps/api/src/routes/checks.controller.ts](apps/api/src/routes/checks.controller.ts)** 🔌 API endpoints
  - 4 REST endpoints
  - Full validation
  - Error handling

- **[apps/web/src/lib/api-client.ts](apps/web/src/lib/api-client.ts)** ⚛️ React wrapper
  - Simple API client
  - Type-safe
  - No dependencies

- **[apps/web/src/components/LeakCheckWidget.tsx](apps/web/src/components/LeakCheckWidget.tsx)** 🎨 React component
  - Email leak check UI
  - Password strength meter
  - Ready to drop in your app

---

## 🛠️ Automation Scripts

### Registration Script (Interactive)
```bash
python3 scripts/register-apis.py
```
- Guides you through API setup
- Validates tokens in real-time
- Automatically creates `.env.local`
- Groups variables by category

### Verification Script
```bash
bash scripts/test-apis.sh
```
- Checks which APIs are configured
- Tests each API connection
- Shows configuration status
- Gives next steps

---

## 💾 What You'll Get

After running the script, you'll have:

```
📁 Project Root
├── .env.local  ← ✨ All your API keys here
├── docs/
│   ├── API_REGISTRATION_QUICK_START.md
│   ├── API_REGISTRATION_AUTOMATION.md
│   ├── ALL_APIS_STATUS.md
│   ├── API_SETUP_GUIDE.md
│   ├── API_KEYS_SUMMARY.md
│   ├── IMPLEMENTATION_CHECKLIST.md
│   └── FREE_APIS_2026.md
├── scripts/
│   ├── register-apis.py      ← Run this
│   └── test-apis.sh          ← Then this
├── apps/api/src/
│   ├── lib/external-apis.ts  ← Backend services
│   └── routes/checks.controller.ts  ← API endpoints
└── apps/web/src/
    ├── lib/api-client.ts     ← React client
    └── components/LeakCheckWidget.tsx  ← React component
```

---

## 🚀 Full Setup Flow (Beginner)

### Day 1: Setup (15 minutes)
```bash
# 1. Navigate to project
cd /Users/rebelldesign/yourefuture-platform

# 2. Run registration script
python3 scripts/register-apis.py
# → Provides link to Hugging Face
# → You copy token from browser
# → Paste into script
# → Done!

# 3. Verify setup
bash scripts/test-apis.sh
# → Shows all configured APIs
```

### Day 1: Development (1 hour)
```bash
# 4. Install dependencies
pnpm install

# 5. Start dev server
pnpm run dev
# → Backend runs at http://localhost:3000
# → Frontend runs at http://localhost:3001

# 6. Test endpoints
curl http://localhost:3000/api/v1/checks/leak \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Day 2: Integration (2 hours)
```bash
# 7. Add component to your page
# (See LeakCheckWidget.tsx in apps/web/src/components/)

# 8. Run tests
pnpm run test

# 9. Deploy
pnpm run build && pnpm run start
```

---

## 🎯 What Each API Does

### Critical (MVP won't work without this)
- **Hugging Face** → Detect deepfakes, NSFW content, AI-generated images

### Recommended (Professional features)
- **Google Cloud Vision** → Professional image analysis, safe search, OCR
- **HIBP Pwned Passwords** → Check if passwords are breached (automated)

### Optional (Advanced features)
- **AWS Rekognition** → Video analysis, advanced moderation
- **Clarifai** → Enterprise-grade moderation
- **TinEye** → Find if image appears elsewhere on the web
- **LeakCheck.io** → Email/username/domain breach checking (already configured)

---

## 📞 Need Help?

### Issue: Script won't run
```bash
# Make sure it's executable
chmod +x scripts/register-apis.py
chmod +x scripts/test-apis.sh

# Run with Python 3
python3 scripts/register-apis.py
```

### Issue: Token validation fails
1. Make sure you copied the full token (starts with `hf_`)
2. No spaces or extra characters
3. Token might have expired → Generate a new one

### Issue: Google Cloud setup is confusing
→ See detailed guide: [API_REGISTRATION_AUTOMATION.md](docs/API_REGISTRATION_AUTOMATION.md#2-google-cloud-vision-10-minutes)

### Issue: Can't find API key on website
→ All links are in [ALL_APIS_STATUS.md](docs/ALL_APIS_STATUS.md)

---

## ✨ Next Steps After Setup

1. **✅ APIs are configured**
   - All keys in `.env.local`
   - Ready to use in your app

2. **⏭️ Integrate backend code**
   ```bash
   # Copy these files into your NestJS app:
   # - apps/api/src/lib/external-apis.ts
   # - apps/api/src/routes/checks.controller.ts
   ```

3. **⏭️ Integrate frontend code**
   ```bash
   # Copy these files into your React app:
   # - apps/web/src/lib/api-client.ts
   # - apps/web/src/components/LeakCheckWidget.tsx
   ```

4. **⏭️ Test everything**
   ```bash
   bash scripts/test-apis.sh
   pnpm run test
   ```

5. **⏭️ Deploy**
   ```bash
   pnpm run build
   ```

---

## 📊 Cost Breakdown

```
MVP (Month 1-12):              €0
MVP (After AWS free ends):     €100-300/month
Full scale (High volume):      €500+/month
```

See [ALL_APIS_STATUS.md](docs/ALL_APIS_STATUS.md#-cost-analysis) for detailed breakdown.

---

## 🔗 Quick Links

| What | Link | Time |
|------|------|------|
| **START HERE** | [API_REGISTRATION_QUICK_START.md](docs/API_REGISTRATION_QUICK_START.md) | 5 min read |
| **Setup Script** | `python3 scripts/register-apis.py` | 15 min run |
| **All APIs Overview** | [ALL_APIS_STATUS.md](docs/ALL_APIS_STATUS.md) | 10 min read |
| **Detailed Guide** | [API_REGISTRATION_AUTOMATION.md](docs/API_REGISTRATION_AUTOMATION.md) | Reference |
| **Backend Code** | [apps/api/src/lib/external-apis.ts](apps/api/src/lib/external-apis.ts) | Copy & use |
| **Frontend Code** | [apps/web/src/components/LeakCheckWidget.tsx](apps/web/src/components/LeakCheckWidget.tsx) | Copy & use |

---

## 🎉 Summary

**You have everything you need:**

✅ **Code** - Production-ready backend & frontend  
✅ **Docs** - Comprehensive guides for every API  
✅ **Scripts** - Automated setup and verification  
✅ **Cost** - €0 for MVP  
✅ **Time** - 12-45 minutes to full setup  

**Ready to go?**

```bash
python3 scripts/register-apis.py
```

---

**Email:** raut.deepakdesign@gmail.com  
**Created:** April 2, 2026  
**Status:** ✅ Complete and ready for deployment
