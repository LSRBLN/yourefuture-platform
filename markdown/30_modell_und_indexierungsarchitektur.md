# Modell- und Indexierungsarchitektur

## 1. Ziel

Dieses Dokument beschreibt die technische Zielarchitektur für Modelle, Fingerprints, Embeddings und Suchindizes im Bereich:

- Bildersuche
- Gesichtserkennung
- Videosuche
- Audio-Fingerprinting
- Deepfake-/Manipulationserkennung

Es dient als Grundlage für:
- Pipeline-Implementierung
- Indexdesign
- Performance-Planung
- Suchqualität
- Vibe-Coding-Aufgaben für Search und Retrieval

---

## 2. Architekturprinzipien

> **WICHTIG:** Alle Medien sollen mehrfach repräsentiert werden.  
> Nicht nur als Datei, sondern als Kombination aus:
- exaktem Hash
- robustem Fingerprint
- semantischem Embedding
- Text-/OCR-Signalen
- Audio-/Video-Signalen
- Kontext-/Quellenmetadaten

---

## 3. Repräsentationen pro Medientyp

## 3.1 Bild
Für jedes Bild sollen gespeichert werden:
- `sha256`
- `perceptual_hash`
- `robust_fingerprint`
- `image_embedding`
- OCR-Text
- Objekt-/Logo-Tags
- NSFW-/Sensitivitätsflags
- EXIF-/Metadaten
- Gesichts-Detektionen
- Gesichts-Embeddings je Face Crop

## 3.2 Video
Für jedes Video sollen gespeichert werden:
- `sha256`
- Video-Metadaten
- Shot-Grenzen
- Keyframes
- Keyframe-Embeddings
- OCR-Text pro Keyframe/Shot
- Transcript / Speech-to-Text
- Audio-Fingerprint
- Gesichts-Tracks
- Gesichts-Embeddings pro Track
- Deepfake-/Manipulationsscores pro Clip und gesamt

## 3.3 Audio
Für relevantes Audio:
- Audio-Fingerprint
- Transcript
- Sprache / ASR-Metadaten
- Sprecher-/Stimmfeatures nur falls später notwendig und rechtlich gewollt

---

## 4. Indextypen

## 4.1 Exact Hash Index
Zweck:
- identische Dateien finden

Enthält:
- `sha256`
- asset_id
- tenant / scope später optional

## 4.2 Perceptual Hash Index
Zweck:
- Near-Duplicate-Erkennung

Enthält:
- `perceptual_hash`
- hamming-distance-fähige Suche
- asset_id
- quality metadata

## 4.3 Vector Index – Images
Zweck:
- semantische Bildsuche

Enthält:
- image_embedding
- asset_id
- source context
- sensitivity flags
- timestamps
- platform/domain filters

## 4.4 Vector Index – Faces
Zweck:
- Gesichtsähnlichkeitssuche

Enthält:
- face_embedding
- asset_id
- face_track_id optional
- face quality score
- pose
- occlusion
- source context

> **WICHTIG:** Face-Embeddings nie ohne Quality-Metadaten verwenden.

## 4.5 Vector Index – Video Shots / Keyframes
Zweck:
- ähnliche Clips / Shot-Kontexte finden

Enthält:
- keyframe_embedding
- shot_id
- asset_id
- timestamp range
- OCR / transcript references

## 4.6 Text Index
Zweck:
- OCR, Transkript, Seitentitel, Plattformtexte durchsuchbar machen

Enthält:
- OCR-Texte
- ASR-Texte
- Seitentitel
- Match-Kontext
- URLs / Plattformnamen

## 4.7 Audio Fingerprint Index
Zweck:
- ähnliche oder identische Audiospuren finden

Enthält:
- audio_fingerprint
- asset_id
- clip ranges
- quality metadata

---

## 5. Hybrid Search Logik

> **WICHTIG:** Suche soll hybrid sein.

Für gute Trefferqualität kombinieren:
1. exakte Hashes
2. Near-Duplicate Hashes
3. Vector Similarity
4. Textsuche
5. Metadatenfilter
6. Qualitäts-/Sensitivitätsfilter

Beispiel:
- erst exakter Treffer
- dann pHash-Kandidaten
- dann Vector Top-K
- dann OCR-/Transcript-Ranking
- dann Face-/Audio-Evidenz
- dann Gesamtscore

---

## 6. Ingestion Pipeline

## 6.1 Bild-Ingestion
1. Datei speichern
2. Hashing
3. Bildmetadaten extrahieren
4. perceptual hash erzeugen
5. OCR ausführen
6. Bild-Embedding erzeugen
7. Face Detection
8. Face Embeddings erzeugen
9. Ergebnisse in DB + Indizes schreiben

## 6.2 Video-Ingestion
1. Datei speichern
2. Hashing
3. Metadaten extrahieren
4. Shot Detection
5. Keyframes extrahieren
6. OCR auf Keyframes
7. Embeddings pro Keyframe/Shot
8. Audio extrahieren
9. ASR / Transcript
10. Audio Fingerprint
11. Face Tracks + Embeddings
12. Deepfake-/Manipulationsanalyse
13. DB + Indizes aktualisieren

---

## 7. Ranking-Strategie

Treffer sollten nicht nur nach Distanz sortiert werden.

Ranking-Faktoren:
- exakter Treffer vs Near-Duplicate vs semantisch ähnlich
- Face confidence
- Asset quality
- OCR-/Transcript overlap
- Plattform-/Quellenvertrauen
- zeitliche Nähe
- bekannte Leak-/Fake-Signale
- Review-/Verification Status

---

## 8. Datenqualitätsregeln

1. Embeddings immer mit Modellversion speichern
2. Face-Embeddings nur bei Mindestqualität indexieren
3. OCR/ASR-Confidence speichern
4. fehlerhafte oder unvollständige Analyseartefakte markieren
5. Re-Indexierung bei Modellwechsel ermöglichen

---

## 9. Technische Entscheidungen vor Umsetzung

1. Welche Vector DB / Search Engine?
2. Getrennte oder gemeinsame Indizes?
3. Welche Embedding-Modelle für Bild / Video / Face?
4. Welche maximale Indexgröße / Storage-Kosten?
5. Re-Embedding-Strategie bei Modellupdates?
6. Batch vs Streaming Ingestion?

---

## 10. Daraus abzuleitende nächste Umsetzungsartefakte

1. Tabellen für Suchartefakte
2. Indexpfade / Namenskonventionen
3. Search API Design
4. Re-Indexing Jobs
5. Modellversions- und Migrationstrategie

---

## 11. Fazit

Die Qualität des Produkts wird stark davon abhängen, wie sauber Medien in mehrere Suchrepräsentationen zerlegt und indexiert werden. Eine einzelne Indexform reicht nicht.
