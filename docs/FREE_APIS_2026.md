# Kostenlose & Trial APIs für TrustShield MVP (2026)

## 🔓 **LEAK-CHECK APIS**

### ✅ **1. Pwned Passwords (HIBP) – 100% KOSTENLOS**
- **Link:** https://api.pwnedpasswords.com/range/
- **Was:** Überprüfe ob ein Passwort in bekannten Breaches ist
- **Kosten:** KOSTENLOS (unbegrenzt, k-anonymity safe)
- **Implementierung:** 
  ```bash
  curl "https://api.pwnedpasswords.com/range/21BD1"
  # Sendet nur Hash-Prefix, nicht das ganze Passwort
  ```
- **Status:** 🟢 READY TO USE

---

### ✅ **2. LeakCheck.io – FREE TIER + TRIAL**
- **Link:** https://leakcheck.io/api
- **Was:** Email, Username, Domain in Leaks suchen
- **Kosten:** Free (200 requests/Tag) oder Trial
- **Ihr Key:** `76d81752e9656ea124a08953dd3f45f3b804539a` ✅
- **Status:** 🟢 READY TO USE (bereits konfiguriert)

---

### ✅ **3. Cybernews Data Leak Check – FREE TIER**
- **Link:** https://cybernews.com/api/
- **Was:** Email-Suche + Dark Web Monitoring
- **Kosten:** Free Tier + 30-Tage Trial
- **API Endpoint:** `https://api.cybernews.com/api/data-leaks/lookup`
- **Status:** 🟡 Optional (alternative zu LeakCheck)

---

### ✅ **4. Have I Been Pwned Public Search – KOSTENLOS (mit Limits)**
- **Link:** https://haveibeenpwned.com/api/v3
- **Was:** Public Breach-Search (mit Rate-Limits)
- **Kosten:** Public API kostenlos, höhere Limits mit Subscription (€3.50/Monat)
- **Status:** 🟢 Funktioniert kostenlos mit Limits

---

## 📸 **IMAGE ANALYSIS APIS**

### ✅ **1. Hugging Face Inference API – KOSTENLOS**
- **Link:** https://huggingface.co/inference-api
- **Was:** Deepfake Detection, Image Classification, Face Detection
- **Kosten:** KOSTENLOS (Fair Use Policy)
- **Modelle:** 
  - `microsoft/resnet-50` (Klassifizierung)
  - `Falconsai/nsfw_image_detection` (NSFW Check)
  - `dima806/deepfake_detection` (Deepfakes)
- **Status:** 🟢 READY – Open Source
- **Setup:**
  ```bash
  export HUGGINGFACE_API_KEY="your-free-key-from-huggingface.co"
  ```

---

### ✅ **2. SightEngine – FREE TIER + TRIAL**
- **Link:** https://sightengine.com/
- **Was:** NSFW, Deepfake, Content Moderation
- **Kosten:** Free (50 requests/Monat) + 30-Tage Trial (unbegrenzt)
- **API:** REST, sehr einfach
- **Status:** 🟢 Trial perfekt für MVP
- **Setup:**
  ```bash
  curl -X POST "https://api.sightengine.com/1.0/check.json" \
    -F "url=https://example.com/image.jpg" \
    -F "models=deepfake,face" \
    -F "api_user=YOUR_USER" \
    -F "api_secret=YOUR_SECRET"
  ```

---

### ✅ **3. AWS Rekognition – FREE TIER (1 Jahr)**
- **Link:** https://aws.amazon.com/de/rekognition/
- **Was:** Face Detection, Label Detection, Text in Images
- **Kosten:** FREE TIER (12 Monate, dann €0.0006 pro Image)
- **Limits:** 5.000 Images/Monat kostenlos im ersten Jahr
- **Status:** 🟢 Ideal für MVP
- **Setup:**
  ```bash
  export AWS_ACCESS_KEY_ID="your-key"
  export AWS_SECRET_ACCESS_KEY="your-secret"
  export AWS_REGION="eu-central-1"
  ```

---

### ✅ **4. Google Cloud Vision API – FREE TIER**
- **Link:** https://cloud.google.com/vision/docs/quickstart
- **Was:** Face Detection, Label Detection, Logo, OCR
- **Kosten:** FREE TIER (1.000 requests/Monat kostenlos)
- **Status:** 🟢 READY
- **Setup:**
  ```bash
  export GOOGLE_CLOUD_API_KEY="your-key"
  export GOOGLE_PROJECT_ID="your-project"
  ```

---

### ✅ **5. Clarifai – FREE TIER**
- **Link:** https://clarifai.com/
- **Was:** Image Classification, Face Detection, Content Moderation
- **Kosten:** FREE (10K operations/Monat)
- **Status:** 🟢 Einfach zu nutzen
- **Setup:**
  ```bash
  export CLARIFAI_API_KEY="your-key"
  export CLARIFAI_USER_ID="your-user"
  ```

---

## 🎥 **VIDEO ANALYSIS APIS**

### ✅ **1. AWS Rekognition Video – FREE TIER**
- **Link:** https://aws.amazon.com/rekognition/
- **Was:** Video-Gesichts-Erkennung, Label Detection
- **Kosten:** FREE TIER (5.000 Videos/Monat im Jahr 1)
- **Status:** 🟢 Gut für MVP
- **Setup:** Gleich wie Image API (AWS_*)

---

### ✅ **2. Hugging Face Video Models – KOSTENLOS**
- **Link:** https://huggingface.co/models?pipeline_tag=video-classification
- **Was:** Frame-basierte Deepfake Detection
- **Kosten:** KOSTENLOS
- **Status:** 🟢 Open Source, selbst gehostet

---

### ✅ **3. OpenAI Vision API – TRIAL (18 USD Credits)**
- **Link:** https://platform.openai.com/docs/guides/vision
- **Was:** Video Frames analysieren, Content Understanding
- **Kosten:** Neue Accounts erhalten $5-$18 Free Credits
- **Status:** 🟡 Trial, danach kostenpflichtig ($0.01 pro Image)

---

## 🔗 **REVERSE IMAGE SEARCH (Optional)**

### ✅ **1. TinEye MatchEngine – TRIAL**
- **Link:** https://services.tineye.com/MatchEngine
- **Was:** Reverse Image Search (find where image is posted)
- **Kosten:** TRIAL verfügbar
- **Status:** 🟡 Für später

---

### ✅ **2. Lenso.ai – FREE TIER**
- **Link:** https://lenso.ai/api
- **Was:** Face Search, Reverse Image Search
- **Kosten:** Free Tier verfügbar
- **Status:** 🟡 Für später

---

## ✅ **EMPFOHLENE KOMBINATIONEN FÜR MVP**

### **Combination A: Minimal (nur leaks)**
```
1. Pwned Passwords (kostenlos) → Passwort-Checks
2. LeakCheck.io (dein Key) → Email/Username-Leaks
```
**Kosten:** €0

---

### **Combination B: Standard (leaks + images)**
```
1. Pwned Passwords (kostenlos)
2. LeakCheck.io (dein Key)
3. Hugging Face (kostenlos) → Deepfake Detection
4. Google Cloud Vision (1K free/Monat)
```
**Kosten:** €0 (bis Limits überschritten)

---

### **Combination C: Full (alle Features, 30-Tage Trial)**
```
1. Pwned Passwords (kostenlos)
2. LeakCheck.io (dein Key)
3. SightEngine (30-Tage Trial)
4. AWS Rekognition (12 Monate Free Tier)
5. Hugging Face (kostenlos)
```
**Kosten:** €0 (für 30-Tage, dann Entscheidung treffen)

---

## 🚀 **MEINE EMPFEHLUNG FÜR TRUSTSHIELD MVP**

**START MIT COMBINATION B (kostenlos + einfach):**

1. **Leak-Checks:**
   - ✅ LeakCheck.io (dein API-Key)
   - ✅ Pwned Passwords (kostenlos)

2. **Image Analysis:**
   - ✅ Hugging Face (kostenlos, open source)
   - ✅ Google Cloud Vision (1K/Monat kostenlos)

3. **Video Analysis:**
   - Später (oder basic frame extraction + Hugging Face)

**Gesamtkosten im MVP:** €0 (100% kostenlos)
**Nach 30 Tagen:** Entscheidung treffen, ob SightEngine für €5-50/Monat nötig ist

---

## 📝 **REGISTRIERUNG CHECKLIST**

- [ ] LeakCheck.io – API-Key generieren (bereits done ✅)
- [ ] Hugging Face – API-Key @ https://huggingface.co/settings/tokens
- [ ] Google Cloud Vision – Service Account @ https://console.cloud.google.com/
- [ ] AWS Rekognition – Account @ https://aws.amazon.com/
- [ ] SightEngine – Trial starten @ https://sightengine.com/ (optional)

---

## 🔐 **DATENSCHUTZ CHECKLIST**

- ❌ Sendet KEINE Original-Bilder an externe APIs (außer wenn nötig)
- ✅ Nutzt Hash-basierte Vergleiche wo möglich (Pwned Passwords)
- ✅ Sensibilisiert User vor Upload
- ✅ Löscht Bilder nach Analyse (Retention Policy)

