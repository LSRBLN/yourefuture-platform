# Evaluationsplan und KPI-Framework

## 1. Ziel

Dieses Dokument definiert, wie Such- und Erkennungsqualität gemessen und verbessert werden sollen.

Es dient als Grundlage für:
- Modell- und Suchbewertung
- Threshold-Tuning
- Produktentscheidungen
- Review-Aufwandsteuerung
- Qualitätsreporting

---

## 2. Warum Evaluation kritisch ist

> **WICHTIG:** Ohne belastbare Evaluation ist ein Such-/Erkennungssystem nicht steuerbar.

Besonders relevant für:
- Bildersuche
- Face Matching
- Videosuche
- Deepfake Detection
- Review-Qualität
- Produktische Folgeaktionen

---

## 3. Evaluationsbereiche

1. Retrieval-Qualität
2. Klassifikationsqualität
3. False Positive / False Negative Verhalten
4. Review-Aufwand
5. Zeit bis zur verwertbaren Entscheidung
6. Business-/Operations-Wirkung

---

## 4. Retrieval-Metriken

## 4.1 Für Bild- und Videosuche
- Precision@K
- Recall@K
- Mean Reciprocal Rank
- Trefferquote exakter Duplikate
- Trefferquote Near-Duplicates
- Trefferquote bekannter Reuploads

## 4.2 Für Face Search
- Top-1 Accuracy
- Top-K Recall
- False Match Rate
- False Non-Match Rate
- Quality-stratified performance

---

## 5. Klassifikationsmetriken

## Für Deepfake-/Manipulationserkennung
- Precision
- Recall
- F1 Score
- ROC-AUC optional
- False Positive Rate
- False Negative Rate

> **WICHTIG:** Falsch-negative Fälle können in eurem Produkt operativ schwerwiegender sein als reine Fehlalarme.  
> Darum sollten Schwellen nicht nur auf Gesamtaccuracy optimiert werden.

---

## 6. Review-Metriken

- Review-Queue-Größe
- Anteil reviewpflichtiger Fälle
- bestätigte vs verworfene Alerts
- durchschnittliche Review-Zeit
- Rework-/Rerun-Anteil
- Anteil eskalierter Fälle

---

## 7. Business-/Produkt-KPIs

- Anteil verwertbarer Treffer
- Anteil Fälle mit Folgeaktion
- Anteil Fälle mit Support-Anfrage
- Anteil Fälle mit Removal-Start
- Zeit von Fund bis erster Handlung
- Zeit von Fund bis Review-Entscheidung
- Zeit von Fund bis Removal-Start

---

## 8. Datensätze für Evaluation

Benötigt werden:
- exakte Bildduplikate
- Near-Duplicate Bilder
- bekannte Reuploads
- Videoschnipsel / gekürzte Varianten
- gute und schlechte Gesichtsqualität
- echte Negativbeispiele
- bekannte Fakes / bekannte echte Inhalte
- synthetische Testdaten für sichere Dev-/QA-Umgebung

---

## 9. Evaluationsschnitte

Die Leistung sollte nicht nur global, sondern getrennt gemessen werden nach:
- Medientyp
- Qualitätsklasse
- Plattform-/Quellenart
- Asset-Länge / Videodauer
- Signaltyp (hash, embedding, face, audio)
- Modellversion
- Fallschwere

---

## 10. Threshold-Tuning

Getrennt kalibrieren für:
- Bild-Near-Duplicate
- Face Search
- Video Similarity
- Deepfake Suspicion
- Review Trigger
- Removal-Empfehlung

> **WICHTIG:** Keine globale Einheits-Schwelle für alles.

---

## 11. Evaluationszyklen

## Vor MVP
- Baseline-Messung
- grobes Threshold-Tuning
- initiale Review-Queue Kalibrierung

## Nach MVP
- regelmäßige Modell- und Retrieval-Evaluation
- Drift-Überwachung
- Performance pro Modellversion
- Review-Feedback in Tuning einfließen lassen

---

## 12. Reporting-Struktur

Empfohlene Reportblöcke:
1. Retrieval Quality
2. Deepfake Quality
3. Face Match Quality
4. Review Load
5. High-Risk Case Outcomes
6. Modellversionen und Vergleich

---

## 13. Minimaler KPI-Dashboard-Umfang

Für Produkt und Ops:
- offene Reviews
- offene Support-Anfragen
- offene Removal-Fälle
- abgeschlossene Checks
- Trefferquote
- Review-Bestätigungsquote
- Zeit bis erste Entscheidung
- Zeit bis Removal-Start
- Provider-Ausfälle / Analysefehler

---

## 14. Daraus abzuleitende nächste Umsetzungsartefakte

1. Evaluationsdatensatz-Spezifikation
2. Offline-Eval-Pipeline
3. KPI-Dashboard-Spec
4. Threshold-Konfigurationsdatei
5. Modellversions-Tracking

---

## 15. Fazit

Die Qualität des Produkts wird weniger durch eine einzelne Modellwahl entschieden als durch gutes Messen, Kalibrieren und Nachsteuern. Evaluation muss fester Teil des Produkts sein.
