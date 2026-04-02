# 🔑 TrustShield API Keys & Setup Summary (2026)

## ✅ Status: READY TO GO

```
┌─────────────────────────────────────────────────────────────┐
│ MVP mit 100% Kostenlosen APIs – Keine Kreditkarte nötig!    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 **Bereits Konfiguriert**

### 1️⃣ **LeakCheck.io** ✅
```
Status: READY
API-Key: 76d81752e9656ea124a08953dd3f45f3b804539a
Limits: 200 reqs/day (free), 10K/day (trial)
What: Email, Username, Domain Leaks
```

### 2️⃣ **Pwned Passwords (HIBP)** ✅
```
Status: READY
Cost: 100% KOSTENLOS
Limits: Unlimited
What: Password checks (k-anonymity safe)
```

---

## 📋 **Noch Setup Nötig** (5-10 Minuten)

### 3️⃣ **Hugging Face** (Image/Deepfake Analysis)
```
Cost: 100% KOSTENLOS
Time: 2 Minutes
Steps:
  1. Sign up: https://huggingface.co/join
  2. Get token: https://huggingface.co/settings/tokens
  3. Copy to .env.local: HUGGINGFACE_API_KEY=hf_...
```

### 4️⃣ **Google Cloud Vision** (Image Analysis – Optional)
```
Cost: FREE TIER (1K images/month)
Time: 5 Minutes
Steps:
  1. Create project: https://console.cloud.google.com/
  2. Enable Vision API
  3. Create Service Account (JSON key)
  4. Copy to .env.local:
     - GOOGLE_CLOUD_API_KEY=...
     - GOOGLE_CLOUD_PROJECT_ID=...
```

### 5️⃣ **AWS Rekognition** (Video Analysis – für später)
```
Cost: FREE TIER (5K images/month, 12 months)
Time: 3 Minutes
Steps:
  1. AWS configure (CLI or Console)
  2. Copy to .env.local:
     - AWS_ACCESS_KEY_ID=...
     - AWS_SECRET_ACCESS_KEY=...
     - AWS_REGION=eu-central-1
```

---

## 📊 **API Vergleich & Empfehlungen**

| Feature | LeakCheck | HIBP | Hugging Face | Google Vision | AWS | SightEngine |
|---------|-----------|------|--------------|---------------|-----|-------------|
| **Email Leaks** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Password Check** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **NSFW Detection** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Deepfake Detection** | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Face Detection** | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| **Video Support** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Kostenlos?** | Partly | ✅ | ✅ | 1K/mo | 5K/mo | Trial |
| **Für MVP?** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 🎯 **MVP Empfohlene Kombination**

```
KATEGORIE          API                 KOSTEN    STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email-Leaks        LeakCheck.io        €0        ✅ Setup Done
Passwort-Leaks     HIBP (Pwned)        €0        ✅ Ready
Bild-Analyse       Hugging Face        €0        🟡 5 min Setup
Face Detection     Google Vision       €0        🟡 5 min Setup
NSFW Detection     HF + Google         €0        🟡 Part of above
Deepfake Detect    Hugging Face        €0        ✅ Kostenlos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL MVP KOSTEN   ALLE 100% KOSTENLOS €0/Monat  🚀 READY
```

---

## 🚀 **Quick Setup Checkliste**

### **Tag 1: Setup (15 Minuten)**
- [ ] Copy `.env.example` → `.env.local`
- [ ] Hugging Face Token generieren
- [ ] Google Cloud Service Account erstellen (optional)
- [ ] `npm install` & `npm run dev`

### **Tag 2: Testing**
- [ ] Test LeakCheck.io API
- [ ] Test Pwned Passwords API
- [ ] Test Hugging Face Models
- [ ] Test Google Cloud Vision (optional)

### **Tag 3: Integration**
- [ ] Implementiere `/api/v1/checks/leak` Endpoint
- [ ] Implementiere `/api/v1/checks/image` Endpoint
- [ ] Implementiere `/api/v1/checks/password-strength` Endpoint
- [ ] Frontend Forms verbinden

---

## 🧪 **Quick Test Commands**

### Test LeakCheck (bereits ready)
```bash
curl -X POST http://localhost:3000/api/v1/checks/leak \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com"}'
```

### Test Password Check
```bash
curl -X POST http://localhost:3000/api/v1/checks/leak \
  -H "Content-Type: application/json" \
  -d '{"password":"password123"}'
```

### Test Image Analysis
```bash
curl -X POST http://localhost:3000/api/v1/checks/image \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://example.com/image.jpg"}'
```

### Test Password Strength
```bash
curl -X POST http://localhost:3000/api/v1/checks/password-strength \
  -H "Content-Type: application/json" \
  -d '{"password":"MySecureP@ssw0rd!"}'
```

---

## 🔐 **Security Best Practices**

✅ **DO:**
- Speichere API-Keys nur in `.env.local` (nie in Git)
- Nutze `.env.local` im `.gitignore`
- Validiere Inputs auf Backend
- Rate-Limits implementieren
- Logs sanitieren (keine Passwörter!)

❌ **DON'T:**
- Sende Passwörter unverschlüsselt
- Speichere Bilder dauerhaft nach Analyse
- Zeige zu viele Details in Error-Messages
- Nutze kostenlose APIs für High-Traffic-Produktion
- Vergesse DSGVO Compliance

---

## 📞 **Support & Dokumentation**

### API Dokumentation
- **LeakCheck.io:** https://leakcheck.io/api
- **HIBP Pwned Passwords:** https://haveibeenpwned.com/API/v3
- **Hugging Face:** https://huggingface.co/docs/inference-api
- **Google Cloud Vision:** https://cloud.google.com/vision/docs
- **AWS Rekognition:** https://docs.aws.amazon.com/rekognition/

### Hilfreich Tools
- **cURL Testing:** Use curl commands above
- **Postman:** Import `/docs/postman-collection.json`
- **API Monitor:** Check `/admin/api-status`

---

## 💡 **Nächste Schritte Nach MVP**

**Phase 2 (Monat 2-3):**
- [ ] SightEngine Integration (€49-299/mo) für erweiterte Deepfake-Checks
- [ ] TinEye Reverse Image Search Trial
- [ ] AWS Rekognition für Videos

**Phase 3 (Monat 4+):**
- [ ] Custom ML Models trainieren
- [ ] Eigene Deepfake-Detection
- [ ] Integration in Admin Dashboard
- [ ] Batch Processing für Videos

---

## 🎉 **Status Zusammenfassung**

```
┌───────────────────────────────────────────────────┐
│           TrustShield MVP – API Status            │
├───────────────────────────────────────────────────┤
│ ✅ LeakCheck.io              READY                │
│ ✅ Pwned Passwords           READY                │
│ 🟡 Hugging Face             SETUP NEEDED (5min)  │
│ 🟡 Google Cloud Vision      SETUP NEEDED (5min)  │
│ 🔴 AWS Rekognition          FOR LATER             │
│ 🔴 Video Analysis           FOR LATER             │
├───────────────────────────────────────────────────┤
│ MVP Kosten: €0/Monat (100% kostenlos)            │
│ Ready für Produktion: JA (in 30 Minuten)         │
│ Skalierbar: JA (easy upgrade to paid)            │
└───────────────────────────────────────────────────┘
```

---

## 📝 **Notizen für das Team**

1. **LeakCheck.io API-Key ist bereits konfiguriert** – Keine zusätzliche Arbeit nötig
2. **Hugging Face ist 100% kostenlos** – Keine Kreditkarte nötig, Fair Use Policy
3. **Google Cloud Vision** – 1K kostenlose Requests/Monat (reicht für MVP)
4. **Pwned Passwords ist k-anonymity safe** – Perfekt für Privacy-aware Apps
5. **Alle APIs sind rate-limitbar** – Keine Überraschungs-Kosten

**Recommendation:** Starte mit Combination B (LeakCheck + Hugging Face + Google Vision). Das ist 100% kostenlos und deckt alle MVP-Features.

