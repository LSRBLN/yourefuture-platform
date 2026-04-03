# 🚀 TrustShield API Setup Guide (2026)

## Quick Start – 5 Minuten zum laufenden System

### 1️⃣ **Copy Environment Template**
```bash
cd apps/api
cp .env.example .env.local
```

### 2️⃣ **LeakCheck.io Setup (Optional – aber empfohlen)**
```bash
# API-Key: 76d81752e9656ea124a08953dd3f45f3b804539a
# Bereits in .env.example konfiguriert ✅
```

### 3️⃣ **Hugging Face Setup (Kostenlos – 100%)**
```bash
# 1. Sign up: https://huggingface.co/
# 2. Generate token: https://huggingface.co/settings/tokens
# 3. Copy in .env.local:
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxx
```

### 4️⃣ **Google Cloud Vision (Optional – Free Tier)**
```bash
# 1. Create project: https://console.cloud.google.com/
# 2. Enable Vision API
# 3. Create service account (JSON key)
# 4. Copy credentials to .env.local
GOOGLE_CLOUD_API_KEY=xxx
GOOGLE_CLOUD_PROJECT_ID=xxx
```

### 5️⃣ **Run Tests**
```bash
npm run test:api
# Should see: ✅ Pwned Passwords API working
#            ✅ LeakCheck API working
#            ✅ Hugging Face API working
```

---

## 🔧 Detaillierte Setup Anleitung

### **A) LeakCheck.io** (Leak-Checks)

#### Status: ✅ **READY TO USE**
Ihr API-Key ist bereits konfiguriert!

**Daten:**
- API-Key: `76d81752e9656ea124a08953dd3f45f3b804539a`
- Limits: 200 requests/Tag (kostenlos), 10.000/Tag (Trial)
- Typ: Email, Username, Domain Checks

**In der App nutzen:**
```typescript
import { ExternalAPIService } from '@lib/external-apis';

const api = new ExternalAPIService();
const result = await api.leakCheck.checkEmail('user@example.com');

if (result.found) {
  console.log(`Found in ${result.breaches} breaches`);
  console.log(`Sources: ${result.sources.join(', ')}`);
}
```

---

### **B) Pwned Passwords (HIBP)** (Passwort-Checks)

#### Status: ✅ **KOSTENLOS & READY**
Keine Anmeldung nötig!

**Features:**
- Überprüft ob Passwort geleakt wurde
- k-anonymity safe (nur Hash-Prefix wird gesendet)
- Unbegrenzte Anfragen
- GDPR compliant

**In der App nutzen:**
```typescript
const api = new ExternalAPIService();
const result = await api.pwnedPasswords.checkPassword('mypassword123');

if (result.isPwned) {
  console.log(`Warnung: Passwort wurde ${result.occurrences}x geleakt!`);
} else {
  console.log('✅ Passwort ist sicher');
}
```

**Ideal für:** Registration Forms, Password Change Dialogs

---

### **C) Hugging Face** (Image Analysis)

#### Status: ✅ **KOSTENLOS - Setup erforderlich**

**Setup (2 min):**

1. Go to: https://huggingface.co/join
2. Sign up (kostenlos)
3. Go to: https://huggingface.co/settings/tokens
4. Create new token: `read` permissions
5. Copy token → `.env.local`

```bash
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxx
```

**Features:**
- NSFW Detection
- Deepfake Detection
- Face Detection
- Object Classification

**In der App nutzen:**
```typescript
const api = new ExternalAPIService();

const result = await api.imageAnalysis.analyzeImage(
  'https://example.com/image.jpg'
);

if (result.hasNSFW) {
  console.log(`⚠️  NSFW Confidence: ${result.nsfw_score * 100}%`);
}

if (result.contains_deepfake) {
  console.log(`🚨 Deepfake detected: ${result.deepfake_confidence * 100}%`);
}

console.log(`Found ${result.faces} faces`);
```

**Kostenlos weil:**
- Open Source Modelle
- Fair Use Policy (kein hartes Limit)
- Perfekt für MVP

---

### **D) Google Cloud Vision** (Image Analysis – Alternative)

#### Status: 🟢 **Optional aber gut**
Free Tier: 1.000 Requests/Monat

**Setup (5 min):**

1. Go to: https://console.cloud.google.com/
2. Create new project
3. Enable "Cloud Vision API"
4. Create Service Account:
   - IAM & Admin → Service Accounts
   - Create Service Account
   - Download JSON key
5. Copy credentials → `.env.local`

```bash
GOOGLE_CLOUD_API_KEY=your-api-key
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

**Features:**
- Label Detection (was ist auf dem Bild?)
- Face Detection (wieviele Gesichter?)
- Safe Search (Adult content, violence, etc.)
- OCR (Text in Bildern)

**In der App nutzen:**
```typescript
const api = new ImageAnalysisService('google-cloud');
const result = await api.analyzeImage('https://example.com/image.jpg');

// result.labels = ['person', 'face', 'smile', ...]
// result.faces = 1
// result.hasNSFW = true/false
```

---

### **E) AWS Rekognition** (Video + Image – für später)

#### Status: 🟡 **Optional – später**
Free Tier: 5.000 Images/Monat für 12 Monate

**Setup (Optional):**

```bash
# Installiere AWS CLI
brew install awscli

# Configure credentials
aws configure
# Dann:
# AWS Access Key ID: [your-key]
# AWS Secret Access Key: [your-secret]
# Default region: eu-central-1
```

---

## 📋 API Limits & Quotas (2026)

| API | Free | Trial | Paid |
|-----|------|-------|------|
| **LeakCheck** | 200 req/Tag | 10K req/Tag | $5-50/mo |
| **Pwned Passwords** | ∞ Unlimited | N/A | N/A |
| **Hugging Face** | Fair Use | N/A | $9-99/mo |
| **Google Vision** | 1K images/mo | N/A | $1.50-6/1K images |
| **AWS Rekognition** | 5K img/mo (1yr) | N/A | $0.0006/image |

---

## 🧪 Test die APIs

### Run Unit Tests
```bash
cd apps/api
npm run test
```

### Interactive Testing mit curl

**Test LeakCheck:**
```bash
curl -X GET "https://leakcheck.io/api/v2/search" \
  -H "X-API-KEY: 76d81752e9656ea124a08953dd3f45f3b804539a" \
  -G --data-urlencode "query=example@gmail.com" \
  --data-urlencode "type=email"
```

**Test Pwned Passwords:**
```bash
# Check if "password" is pwned
curl "https://api.pwnedpasswords.com/range/5BAA6"
# Output: E3CDE47562....0:2
#         E4D909C290...05:2
#         ...
# Format: HASH_SUFFIX:COUNT
```

**Test Hugging Face:**
```bash
curl -X POST "https://api-inference.huggingface.co/models/Falconsai/nsfw_image_detection" \
  -H "Authorization: Bearer $HUGGINGFACE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "https://example.com/image.jpg"}'
```

---

## 🚨 Troubleshooting

### Problem: "LeakCheck API key not found"
**Lösung:**
```bash
# Überprüfe .env.local
grep LEAKCHECK_API_KEY .env.local

# Sollte zeigen:
# LEAKCHECK_API_KEY=76d81752e9656ea124a08953dd3f45f3b804539a
```

### Problem: "Hugging Face API key invalid"
**Lösung:**
1. Generiere neuen Token: https://huggingface.co/settings/tokens
2. Copy & paste in `.env.local`
3. Restart dev server

### Problem: "Google Cloud Vision API not enabled"
**Lösung:**
1. Go to: https://console.cloud.google.com/apis/library
2. Search "Vision API"
3. Click "Enable"

### Problem: "Rate limit exceeded"
**Lösung:**
- LeakCheck: Warte bis zur nächsten Minute
- Pwned Passwords: Kein Limit, aber andere Services nutzen
- Hugging Face: Warte ~1 Minute, dann retry

---

## 📊 Monitoring & Logging

### API Call Logging aktivieren:
```bash
# In .env.local:
LOG_API_CALLS=true
LOG_API_LATENCY=true
LOG_API_ERRORS=true
```

### Sentry Integration (für Production):
```bash
# Sign up: https://sentry.io/
SENTRY_DSN=https://your-sentry-dsn
```

---

## 🔐 Security Checklist

✅ **Befolge diese Rules:**

- [ ] API-Keys niemals in Git committen (nutze `.env.local` + `.gitignore`)
- [ ] Nie Passwörter in Logs speichern
- [ ] Bilder nach Analyse löschen (Datenschutz)
- [ ] Rate-Limits beachten
- [ ] HTTPS für alle API-Calls (nicht HTTP)
- [ ] Error-Messages dem User nicht zu ausführlich zeigen

**Beispiel – DO's & DON'Ts:**

```typescript
// ❌ WRONG
const result = await api.checkEmail('user@example.com');
console.log(result.sources); // logs: ["LinkedIn", "Adobe", "Yahoo"]
// → Sensitive leak info exposed!

// ✅ CORRECT
const result = await api.checkEmail('user@example.com');
if (result.found) {
  console.log('User exists in public breach databases');
  // → Generisches Message, keine Details
  notifyUser('Your email may be at risk. Change your password!');
}
```

---

## 🎯 Nächste Schritte

1. **Jetzt:** LeakCheck API testen (bereits fertig)
2. **Heute:** Hugging Face einrichten (5 min)
3. **Diese Woche:** Google Cloud Vision einrichten (optional)
4. **Später:** AWS Rekognition für Videos (für Expansion Phase)

---

## 📞 Support Links

- LeakCheck Docs: https://leakcheck.io/api
- Hugging Face Docs: https://huggingface.co/docs/inference-api
- Google Vision Docs: https://cloud.google.com/vision/docs
- AWS Rekognition: https://docs.aws.amazon.com/rekognition/
- Pwned Passwords: https://haveibeenpwned.com/API/v3

