# Teststrategie, Akzeptanzkriterien und QA-Plan

## 1. Ziel

Dieses Dokument definiert die Qualitäts- und Teststrategie für das Produkt.

Es soll dafür sorgen, dass:
- Features mit klaren Done-Kriterien gebaut werden
- Vibe-Coding-Ergebnisse überprüfbar sind
- regressionsanfällige Bereiche früh abgesichert werden
- API-, Workflow-, Upload- und Berechtigungsfehler systematisch erkannt werden

---

## 2. Testpyramide

## 2.1 Unit Tests
Ziel:
- Business-Logik isoliert prüfen

Geeignet für:
- Risk Scoring
- Workflow-Auswahl
- DTO-Validierung
- Mapper
- Policy-Logik
- Provider-Normalisierung

## 2.2 Integrationstests
Ziel:
- Modul plus Datenbank / Queue / Storage prüfen

Geeignet für:
- Check-Erstellung
- Upload-Verarbeitung
- Source-Linking
- Removal-Statuswechsel
- Support-Zuweisung

## 2.3 End-to-End Tests
Ziel:
- reale Nutzer- und Backoffice-Flows absichern

Geeignet für:
- Leak-Check Flow
- Image-Check Flow
- Source Submit Flow
- Support Request Flow
- Removal Case Flow
- Rollen-/Zugriffstests

---

## 3. Kritische Qualitätsbereiche

1. Autorisierung
2. Datei-Uploads
3. Asynchrone Jobs
4. Provider-Integrationen
5. Risiko- und Workflow-Logik
6. Fall- und Support-Verknüpfung
7. Admin-/Backoffice-Berechtigungen
8. Fehlerbehandlung und Wiederholbarkeit

---

## 4. Globale Definition of Done

Ein Feature ist erst fertig, wenn:

1. API/Business-Logik implementiert ist
2. Validierung vorhanden ist
3. Fehlerobjekte konsistent sind
4. Unit Tests für Kernlogik vorhanden sind
5. mindestens ein Integrations- oder E2E-Test vorhanden ist
6. OpenAPI/DTOs aktualisiert wurden
7. Berechtigungen geprüft wurden
8. Logging/Auditing berücksichtigt wurde
9. relevante Hilfetexte/Workflows angebunden sind, falls nötig

---

## 5. Feature-Akzeptanzkriterien

## 5.1 Leak-Check
Ein Leak-Check gilt als erfolgreich umsetzbar, wenn:
- ein Check für E-Mail, Username oder Domain erstellt werden kann
- nur zulässige Eingaben akzeptiert werden
- ein Job erzeugt wird
- Provider-Ergebnisse normalisiert gespeichert werden
- eine verständliche Summary erzeugt wird
- ein Risk Score gesetzt wird
- ein passender Workflow erzeugt werden kann
- fremde Checks nicht einsehbar sind

## 5.2 Image Upload + Bildanalyse
Das Feature gilt als fertig, wenn:
- erlaubte Bilddateien angenommen werden
- unerlaubte Dateitypen abgewiesen werden
- Asset-Metadaten gespeichert werden
- Analysejob erzeugt wird
- Analyseergebnis gespeichert wird
- Nutzer Ergebnis und Summary abrufen kann
- bekannte Matches geladen werden können
- Support-Anfrage daraus gestartet werden kann

## 5.3 User Submitted Source
Das Feature gilt als fertig, wenn:
- Nutzer eine Quelle mit URL einreichen kann
- URL validiert wird
- Quelle einem Asset oder Check zugeordnet werden kann
- Quelle nur für berechtigte Nutzer sichtbar ist
- Quelle im Match-/Removal-Kontext weiterverwendbar ist

## 5.4 Removal Case
Das Feature gilt als fertig, wenn:
- ein Löschfall aus einem Match oder direkt erstellt werden kann
- Statuswechsel möglich sind
- Aktionen protokolliert werden
- Support daran angehängt werden kann
- Nutzer nur eigene Fälle sieht
- Admin/Support autorisiert globale Sicht erhalten

## 5.5 Support Request
Das Feature gilt als fertig, wenn:
- Nutzer eine Support-Anfrage erzeugen kann
- Priorität und Kontext gespeichert werden
- Support die Anfrage sehen und zuweisen kann
- Statusänderungen nachvollziehbar sind
- unberechtigte Einsicht verhindert wird

---

## 6. Minimale E2E-Regression für MVP

Vor jedem MVP-Release sollten mindestens diese E2E-Flows grün sein:

1. Registrierung / Login / Profil lesen
2. Leak-Check erstellen und Ergebnis lesen
3. Bild hochladen und Deepfake-Ergebnis lesen
4. Quelle melden
5. Match in Removal-Fall überführen
6. Support-Anfrage aus Ergebnis starten
7. Support-Anfrage im Backoffice zuweisen
8. Nutzer kann keine fremden Objekte lesen
9. Admin kann Provider verwalten
10. Upload mit falschem Dateityp wird abgelehnt

---

## 7. Security-QA

Pflichttests:
- Broken Object Level Authorization
- Rollenprüfung für Admin-/Support-Endpunkte
- Rate Limit Verhalten
- Upload-Restriktionen
- Secret Redaction in Logs
- Zugriff auf private Storage-Objekte
- Manipulation von Workflow- und Removal-IDs
- Mehrfachversand / Replay sensibler Aktionen

---

## 8. Performance- und Zuverlässigkeitstests

Für MVP mindestens planen:

### API
- typische GET/POST-Endpunkte unter Normal- und Spitzenlast
- Latenz für Check-Erstellung
- Verhalten bei Provider-Timeouts

### Jobs
- Queue-Verarbeitung mehrerer Checks
- Retry-Verhalten
- Dead-letter-Verhalten

### Uploads
- große erlaubte Dateien
- parallele Uploads
- Abbruch und Fehlerzustände

---

## 9. Testdatenstrategie

Das System braucht definierte Testdaten für:

- Testnutzer je Rolle
- Beispiel-Checks
- Beispiel-Assets
- Beispiel-Matches
- Beispiel-Removal-Fälle
- Beispiel-Support-Anfragen
- Provider-Mock-Antworten
- Hilfetext-Seed-Daten
- Workflow-Templates

---

## 10. Automatisierung

## CI-Pipeline sollte mindestens ausführen
1. Linting
2. Type Checks
3. Unit Tests
4. Integrations-Tests
5. OpenAPI-Schema-Validierung
6. Migrationsprüfung
7. Security-/Dependency-Checks

## Nightly/zusätzliche Läufe
- E2E-Suite
- Last-/Smoke-Tests
- Storage-/Upload-Tests
- Provider-Mock-Regression

---

## 11. Was ein Vibe-Coding-Tool daraus nutzen kann

Das Coding-Tool sollte für jedes Epic idealerweise bekommen:
- Ziel
- Input-/Output-Schema
- Akzeptanzkriterien
- Testfälle
- Non-goals
- Sicherheitsregeln
- Done-Kriterien

So wird aus „baue das Feature“ eine deutlich präzisere, besser überprüfbare Umsetzungsaufgabe.

---

## 12. Daraus abzuleitende nächste Artefakte

1. Endpoint-spezifische Testfälle
2. DTO-/Schema-Katalog
3. E2E-Testfallkatalog pro Sprint
4. Testdaten-Seeds
5. QA-Checklisten für Release Gates

---

## 13. Fazit

Für dieses Produkt ist Qualität nur dann beherrschbar, wenn Autorisierung, Uploads, Workflows und asynchrone Jobs von Anfang an testbar geplant sind. Gerade bei AI-unterstützter Entwicklung senken präzise Akzeptanzkriterien und Testfälle den Interpretationsspielraum erheblich.
