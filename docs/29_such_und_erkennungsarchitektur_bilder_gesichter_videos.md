# Such- und Erkennungsarchitektur für Bilder, Gesichter und Videos

> **WICHTIG:** Eine Erkennung für Bildersuche, Gesichtserkennung, Videosuche und Deepfake-Erkennung wird **nie perfekt** sein.  
> Das Produkt sollte deshalb auf **mehrstufige Erkennung, Evidenzbewertung, Quality Gates und menschliche Review** ausgelegt werden.

## 1. Ziel

Dieses Dokument beschreibt, wie die Kernfunktionen für:

- Bildersuche
- Gesichtserkennung
- Videosuche
- Deepfake-/Manipulationserkennung

technisch aufgebaut werden sollten, damit das System **möglichst robust, präzise und praxisfähig** arbeitet.

---

## 2. Grundprinzip

> **WICHTIG:** Keine einzelne Methode reicht aus.

Das System sollte immer als **multimodale Erkennungsarchitektur** aufgebaut werden, bestehend aus:

1. exakten Dateitreffern
2. Near-Duplicate-Erkennung
3. semantischer Suche
4. Gesichts- und Personenmerkmalen
5. Video- und Audio-Signalen
6. Provenance-/Herkunftssignalen
7. Kontext- und Plattformsignalen
8. menschlicher Review bei sensiblen Funden

---

## 3. Bildersuche

## 3.1 Ziel
Bilder finden, die:
- identisch sind
- leicht verändert wurden
- in anderer Qualität oder anderem Format erneut hochgeladen wurden
- semantisch ähnlich sind
- in Leak-/Missbrauchskontexten wieder auftauchen

## 3.2 Empfohlene Suchschichten

### A. Exakte Duplikate
- SHA-256 oder vergleichbarer exakter Dateihash
- Dateigröße
- MIME-Typ
- Metadatenvergleich

**Nutzen**
- identische Dateien sicher erkennen

**Grenze**
- versagt bei Re-Encode, Resize, Crop oder Wasserzeichen

---

### B. Near-Duplicate-Erkennung
- perceptual hash
- robustere Bildfingerprints
- Ähnlichkeitsvergleich gegen bekannte Referenzen

**Nutzen**
- erkennt gleiche Bilder trotz:
  - Resize
  - Re-Encode
  - leichter Farbänderung
  - kleinerer Overlays

**Grenze**
- starke Crops, Memes, schwere Bearbeitung können Trefferqualität senken

---

### C. Semantische Bildsuche
- multimodale Embeddings
- Bild-zu-Bild Similarity
- Text-zu-Bild Similarity
- Vektorindex / Vector Search

**Nutzen**
- erkennt semantisch ähnliche Inhalte auch ohne exakte Pixelnähe
- wichtig bei Memes, Kontextänderungen, neu gerenderten Reposts

**Grenze**
- kann False Positives erzeugen
- braucht Ranking und Threshold-Tuning

---

### D. Hilfssignale
- OCR auf Bildern
- Logo-Erkennung
- Szenen-/Objekterkennung
- NSFW-/intime Inhalte
- EXIF/Metadaten
- Plattform-/Domain-Kontext

**Nutzen**
- bessere Priorisierung
- stärkere Beweisführung
- bessere UI-Summaries

---

## 3.3 Empfohlene Architektur für Bildersuche

> **WICHTIG:** Bildersuche sollte nie nur auf Embeddings oder nur auf Hashes beruhen.

Empfohlene Reihenfolge:
1. exakter Hash-Check
2. perceptual hash
3. semantische Similarity Search
4. OCR-/Objekt-/Logo-Signale
5. Risk Scoring
6. Review bei starken oder sensiblen Treffern

---

## 4. Gesichtserkennung

## 4.1 Ziel
Gesichter in Bildern und Videos erkennen und mit Referenzgesichtern vergleichen.

> **WICHTIG:** Gesichtserkennung darf nicht als harte Binärentscheidung gebaut werden.

Das System sollte Treffer als:
- kein Treffer
- schwacher Kandidat
- starker Kandidat
- manuelle Prüfung nötig

klassifizieren.

---

## 4.2 Pipeline

### A. Face Detection
- Gesichter im Bild/Frame erkennen

### B. Face Alignment
- Gesichter normalisieren
- Augen-/Gesichtslandmarken ausrichten

### C. Quality Gate
Vor dem Matching prüfen:
- Schärfe
- Gesichtsgröße
- Pose
- Occlusion
- Beleuchtung
- Kompression

> **WICHTIG:** Schlechte Gesichtsqualität sollte nicht einfach in Matching eingehen, sondern die Confidence senken oder Review erzwingen.

### D. Face Embedding
- Embedding je Gesicht erzeugen
- Vergleich mit Referenzdatenbank

### E. Thresholding
- mehrere Schwellen
- keine einzige globale Schwelle für alle Fälle
- Qualitätsklasse in Threshold-Logik einbeziehen

### F. Multi-Candidate Output
- Top-Kandidaten statt nur 1 Treffer
- Confidence + Evidenz speichern

---

## 4.3 Gesichtserkennung in Videos

Für Videos nicht nur Einzelbilder vergleichen.

Stattdessen:
1. Face Detection pro Frame/Keyframe
2. Face Tracking über Sequenzen
3. Embeddings pro Track aggregieren
4. Qualität pro Track bewerten
5. Track-level Match statt Frame-level Match priorisieren

**Nutzen**
- stabilere Ergebnisse
- weniger Fehlalarme
- bessere Aussage bei schlechter Einzelbildqualität

---

## 4.4 Wichtige Grenzen

> **WICHTIG:** Gesichtserkennung ist anfällig für:
- schlechte Beleuchtung
- Profilansichten
- starke Kompression
- Make-up / Filter
- Alterung
- Maskierung
- teilweise verdeckte Gesichter
- Fake-/Render-Artefakte

Deshalb gilt:
- nie nur ein Einzelmodell
- nie vollautomatische harte Entscheidungen bei kritischen Fällen
- immer Review-Möglichkeit

---

## 5. Videosuche

## 5.1 Ziel
Videos finden, die:
- identisch sind
- gekürzt wurden
- neu encodiert wurden
- gespiegelt oder mit Overlays versehen wurden
- als Ausschnitt oder Reupload auftauchen

## 5.2 Empfohlene Pipeline

### A. Shot Boundary Detection
- Video in Shots/Szenen zerlegen

### B. Keyframe Extraction
- repräsentative Frames je Shot extrahieren

### C. Frame-/Shot-Embeddings
- Embeddings je Keyframe oder Shot erzeugen

### D. OCR
- eingeblendeten Text erkennen

### E. Speech-to-Text
- Audio transkribieren

### F. Audio Fingerprinting
- Audio-Ähnlichkeit über Reuploads hinweg erkennen

### G. Objekt-/Personen-/Gesichtsanalyse
- Szenenkontext verbessern
- Personen-/Gesichtsbezug herstellen

### H. Clip-level Matching
- nicht nur ganze Videos, sondern auch Teilsequenzen matchen

> **WICHTIG:** Videosuche muss auch mit:
- Re-Encode
- Kürzung
- neuem Audio
- Wasserzeichen
- Crop
- Textoverlays
- Spiegelung

umgehen können.

---

## 5.3 Empfohlene Suchindizes für Video

Die Plattform sollte getrennte oder kombinierte Indizes für:
- Video-Embeddings
- Keyframe-Embeddings
- OCR-Texte
- Transkripte
- Audio-Fingerprints
- Gesichts-Embeddings
- URL-/Plattform-Metadaten

aufbauen.

---

## 6. Deepfake- und Manipulationserkennung

## 6.1 Ziel
Nicht nur „Fake oder Echt“, sondern belastbare Manipulationshinweise liefern.

> **WICHTIG:** Ein einzelner Deepfake-Klassifikator reicht nicht.

---

## 6.2 Evidence Stack

### A. Provenance / Herkunft
- C2PA / Content Credentials prüfen
- Signaturen, Herkunftskette, Bearbeitungshinweise

### B. Forensische Signale
- Kompressionsartefakte
- Blend-/Kantenfehler
- Licht-/Schatten-Inkonsistenzen
- Texturfehler
- Frame-Instabilität
- Audio-/Lip-Sync Inkonsistenzen

### C. Modell-Ensemble
- mehrere Modelle
- Bild- und Video-spezifische Modelle
- per Frame / per Clip / aggregiert

### D. Kontextsignale
- bekannte Reuploads
- bekannte Fake-Datenbank
- Fundquelle
- Zeitachse / first seen
- Nutzerreferenzmaterial

### E. Human Review
- bei hoher Schwere
- bei sensiblen Fällen
- bei Removal-/Support-Fällen
- bei unsicherer Modelllage

---

## 6.3 Ergebnisstufen

Empfohlen:
- unauffällig
- verdächtig
- wahrscheinlich manipuliert
- bekanntes Fake-Match
- Review erforderlich

> **WICHTIG:** Nicht „100% fake“ oder „100% echt“ behaupten.

---

## 7. Bewertungssystem

## 7.1 Nicht nur ein Score
Das System sollte mindestens getrennt ausgeben:

- **Confidence Score**
- **Evidence Score**
- **Risk Score**
- **Actionability**
- **Review Required**

## 7.2 Beispiel
Ein Ergebnis kann:
- technisch nur mittlere Confidence haben,
- aber wegen bekanntem Leak-Match trotzdem hohe Actionability besitzen.

---

## 8. Empfohlene Kernarchitektur

## 8.1 Storage und Suche
- relationale DB für Kerndaten
- Object Storage für Medien
- Vector Search / Suchindex für Embeddings
- getrennte Indizes für:
  - Bilder
  - Gesichter
  - Videos
  - Audio
  - OCR/Text
  - URLs/Plattformen

## 8.2 Pipelines
- Bildingest Pipeline
- Videoingest Pipeline
- Face Pipeline
- OCR Pipeline
- ASR Pipeline
- Deepfake Pipeline
- Match Pipeline
- Risk Scoring Pipeline

## 8.3 Output
- normalisierte Ergebnisobjekte
- Beweisreferenzen
- Zeitstempel
- verknüpfte Fundstellen
- empfohlene Folgeaktionen

---

## 9. Was fuer hohe Qualität zwingend nötig ist

> **WICHTIG:** Gute Modelle allein reichen nicht. Entscheidend ist die Evaluierung.

## 9.1 Gold Dataset
Benötigt werden:
- exakte Duplikate
- Near-Duplikate
- bekannte Fakes
- bekannte Reuploads
- echte Negativbeispiele
- unterschiedliche Qualitätsstufen
- unterschiedliche Plattformartefakte

## 9.2 Kalibrierung
Getrennte Thresholds für:
- Bildersuche
- Gesichtserkennung
- Videosuche
- Deepfake-Erkennung
- sensible Eskalationsfälle

## 9.3 Offline Evaluation
Regelmäßig messen:
- Precision@K
- Recall@K
- False Positive Rate
- False Negative Rate
- Trefferzeit
- Review-Aufwand
- Provider-/Modellqualität nach Version

---

## 10. Produktlogische Regeln

1. keine automatische harte Behauptung „echt/fake“ ohne Evidenzrahmen
2. sensible Funde immer mit Support-/Removal-Option kombinieren
3. Teiltreffer und Teilanalysen explizit kennzeichnen
4. Trefferhistorie auditierbar speichern
5. Modellversionen und Analysezeitpunkte speichern
6. Review-Warteschlange für High-Risk-Fälle vorsehen

---

## 11. Was „perfekt“ praktisch verhindert

> **WICHTIG:** Perfektion ist technisch nicht erreichbar.

Gruende:
- neue Mirrors und geschlossene Plattformen sind evtl. nicht sichtbar
- starke Bearbeitungen zerstören Signale
- schlechte Qualität reduziert Gesichts- und Match-Sicherheit
- Deepfake-Generierung entwickelt sich weiter
- nicht jede Quelle liefert Provenance-Daten
- offene Websuche deckt nie alles ab

Darum ist das richtige Ziel:
- **maximale Abdeckung**
- **klare Evidenz**
- **minimierte Fehlalarme**
- **menschliche Review bei kritischen Fällen**

---

## 12. Konkrete Empfehlung fuer euer Produkt

Das Haupttool sollte **kein einzelner Deepfake-Scanner** sein.

Es sollte ein **multimodales Forensik- und Suchsystem** sein mit:

- Bildersuche
- Near-Duplicate-Erkennung
- Gesichtserkennung
- Videosuche
- OCR / Textanalyse
- Audio-Fingerprinting
- Provenance-Prüfung
- Deepfake-Ensemble
- Match-/Leak-Finder
- Review-Queue
- Support-/Removal-Integration

> **WICHTIG:** Genau diese Kombination macht das Produkt stark. Nicht ein einzelnes Modell.

---

## 13. Daraus abzuleitende nächste Artefakte

1. Modell- und Sucharchitektur-Diagramm
2. Indexierungs- und Embedding-Konzept
3. Evaluationsplan mit KPIs
4. Review-Queue-Spezifikation
5. Datenmodell-Erweiterung für Such- und Evidenzobjekte
6. Implementierungsplan für Bild-/Gesichts-/Video-Pipeline

---

## 14. Fazit

Das System wird nie perfekt, kann aber **sehr stark und produktionsreif** werden, wenn es:
- multimodal sucht,
- mehrere Evidenzschichten kombiniert,
- gute Quality Gates nutzt,
- sauber kalibriert ist,
- und kritische Fälle in menschliche Review übergibt.
