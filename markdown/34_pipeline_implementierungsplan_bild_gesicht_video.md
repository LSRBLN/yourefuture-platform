# Pipeline-Implementierungsplan für Bild-, Gesichts- und Videoanalyse

## 1. Ziel

Dieses Dokument übersetzt die Such- und Erkennungsarchitektur in eine konkrete Umsetzungsreihenfolge.

Es dient als Brücke zwischen Planung und eigentlicher Programmplanung.

---

## 2. Umsetzungsprinzip

> **WICHTIG:** Nicht alles gleichzeitig bauen.

Empfohlene Reihenfolge:
1. Bildingest + exakte / Near-Duplicate-Suche
2. semantische Bildsuche
3. Face Detection + Face Search
4. Video Keyframes + Video Similarity
5. Audio / OCR / Transcript
6. Deepfake-/Manipulations-Ensemble
7. Review Queue
8. Removal- und Support-Integration vertiefen

---

## 3. Phase 1 – Bildfundament

### Ziel
Bilder zuverlässig speichern, indexieren und als exakte / ähnliche Treffer finden.

### Scope
- Asset Upload Bild
- SHA-256
- perceptual hash
- OCR
- Bild-Embedding
- Bildindex
- Bild-Match-API

### Erfolgskriterium
- exakte Duplikate und einfache Near-Duplicates zuverlässig auffindbar
- Suchartefakte persistiert
- Match-Liste im UI verfügbar

---

## 4. Phase 2 – Semantische Bildsuche

### Ziel
Auch semantisch ähnliche Bilder auffinden.

### Scope
- Vector DB / Similarity Search
- Hybrid Ranking
- Threshold-Konfiguration
- Search Candidate Speicherung

### Erfolgskriterium
- Bild-Top-K Kandidaten mit Ranking
- Kandidaten in Review oder Match überführbar

---

## 5. Phase 3 – Face Search

### Ziel
Gesichter robust erkennen und gegen Referenzen matchen.

### Scope
- Face Detection
- Alignment
- Quality Gate
- Face Embeddings
- Face Index
- Candidate Ranking
- Grauzonen-Review Trigger

### Erfolgskriterium
- Gesichts-Matches nur mit Quality-Metriken
- Review-Queue für schwankende Kandidaten
- keine harten Auto-Entscheidungen ohne Evidenz

---

## 6. Phase 4 – Video Retrieval Basis

### Ziel
Videos in durchsuchbare Shots und Keyframes zerlegen.

### Scope
- Shot Detection
- Keyframe Extraction
- Keyframe Embeddings
- OCR je Keyframe/Shot
- Video-Search Candidates

### Erfolgskriterium
- ähnliche Clips / Reuploads über Keyframes erkennbar
- Video kann nicht nur als Ganzes, sondern abschnittsbezogen durchsucht werden

---

## 7. Phase 5 – Audio und Textsignale

### Ziel
Zusätzliche Such- und Evidenzsignale integrieren.

### Scope
- Speech-to-Text
- Audio Fingerprinting
- OCR-Textindex
- Transcript-Index
- Hybrid Ranking Update

### Erfolgskriterium
- Audio-/Textsignale verbessern Ranking und Fundstärke messbar

---

## 8. Phase 6 – Deepfake-/Manipulationsanalyse

### Ziel
Bild- und Videoverdacht in Evidenzstufen ausgeben.

### Scope
- Bild-Deepfake Modelle
- Video-Manipulationsmodelle
- Frame-/Clip-Level Aggregation
- Provenance Checks
- Evidence Score
- Review Trigger

### Erfolgskriterium
- Ergebnisstufen statt harter Fake-Behauptungen
- Modellversionierung
- Auditierbare Evidenz

---

## 9. Phase 7 – Review und Operations

### Ziel
Menschliche Prüfung integrieren.

### Scope
- Review Items
- Review Queue UI
- Entscheidungen / Snapshots
- Eskalationslogik
- Support-/Removal-Verknüpfung

### Erfolgskriterium
- kritische Funde landen kontrolliert in Review
- Entscheidungen fließen zurück in operative Prozesse

---

## 10. Phase 8 – Produktintegration

### Ziel
Suche, Analyse, Review, Support und Removal werden zu einem durchgehenden Produktfluss.

### Scope
- Ergebnis-Screens final
- Support CTA aus Findings
- Removal Start aus Match/Review
- Notification Trigger
- KPI-Tracking

### Erfolgskriterium
- End-to-End Flow von Upload/Fund bis Handlung

---

## 11. Technische Abhängigkeiten

Vor oder parallel klären:
1. Storage-Konzept
2. Vector Search Engine
3. GPU-Strategie
4. Modell-Serving
5. Re-Indexierungsstrategie
6. Review-Rollen und Staffing
7. Datensatz für Evaluation

---

## 12. Delivery-Empfehlung für Vibe Coding

In kleine, getrennte Tasks schneiden:

### Gute Taskgröße
- „Implementiere pHash Pipeline für Bilder“
- „Implementiere Search Candidate Entity + Migration“
- „Implementiere Face Quality Gate“
- „Implementiere Review Item API“

### Schlechte Taskgröße
- „Baue die gesamte Bilderkennung perfekt“

---

## 13. Minimal sinnvolle erste Umsetzungswelle

Wenn ihr sofort in Programmplanung gehen wollt, ist die beste erste Welle:

1. Bild-Uploads
2. Hashing + pHash
3. Bild-Embeddings
4. OCR
5. Search Candidates
6. Match API
7. Review Queue Grundgerüst

---

## 14. Fazit

Mit dieser Reihenfolge entsteht erst ein stabiles Suchfundament und danach schrittweise höhere Komplexität. Genau so sollte das Produkt in die eigentliche Umsetzungs- und Programmplanung überführt werden.
