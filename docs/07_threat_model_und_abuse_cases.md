# Threat Model + Abuse Cases

## 1. Ziel

Dieses Dokument beschreibt die wichtigsten Sicherheits- und Missbrauchsrisiken des Produkts sowie empfohlene Gegenmaßnahmen.

Es dient als Planungsartefakt für:
- sichere Architekturentscheidungen
- Security Requirements
- Security Testing
- API- und Upload-Härtung
- Backoffice- und Rollenabsicherung

---

## 2. Schutzobjekte

Die wichtigsten Schutzobjekte des Systems sind:

1. Nutzeridentitäten
2. E-Mail-Adressen, Telefonnummern, Usernames und Domains
3. hochgeladene Bilder und Videos
4. vom Nutzer gemeldete Fund-URLs
5. Leak- und Deepfake-Ergebnisse
6. Removal-Fälle und Kommunikationshistorie
7. Support-Nachrichten
8. API-Keys externer Provider
9. Backoffice-Funktionen
10. Audit- und Fallhistorie

---

## 3. Relevante Angreiferprofile

### A. Externer Angreifer
Ziel:
- unbefugter Zugriff auf sensible Daten
- Ausnutzung von APIs
- Diebstahl von Uploads, Ergebnissen oder Support-Fällen

### B. Missbrauchender Endnutzer
Ziel:
- Prüfung fremder Personen ohne Berechtigung
- Upload schädlicher Dateien
- Überlastung des Systems
- missbräuchliche Removal-Anfragen

### C. Böswilliger Insider / Fehlkonfiguration
Ziel:
- unzulässiger Zugriff auf Fälle
- Änderung von Workflow-, Hilfetext- oder Provider-Konfigurationen
- Datenabfluss aus dem Backoffice

### D. Angreifer über Datei-Uploads
Ziel:
- Schadcode einschleusen
- Parser/Thumbnailer ausnutzen
- Speichersystem oder Worker kompromittieren

### E. API-Angreifer
Ziel:
- Broken Object Level Authorization
- Massenabfrage sensibler Daten
- Missbrauch schwach geschützter Endpunkte
- Token-/Session-Missbrauch

---

## 4. Trust Boundaries

Die wichtigsten Systemgrenzen sind:

1. Browser / Client ↔ API Gateway
2. API ↔ Datenbank
3. API ↔ Object Storage
4. API ↔ Queue / Worker
5. Worker ↔ ML-/Analysekomponenten
6. Plattform ↔ externe Leak-Provider
7. Nutzerbereich ↔ Support-/Admin-Bereich

An jeder Boundary müssen Authentifizierung, Autorisierung, Validierung, Logging und Fehlerschutz bewusst geplant werden.

---

## 5. Kritische Abuse Cases

## Abuse Case 1 – Nutzer prüft fremde Identität
**Szenario**
Ein Nutzer gibt fremde E-Mail-Adressen, Telefonnummern oder Domains ein, um personenbezogene Informationen über andere zu sammeln.

**Risiko**
- Datenschutzverletzung
- Missbrauch der Plattform als OSINT-/Stalking-Werkzeug

**Gegenmaßnahmen**
- Zweck- und Nutzungshinweise
- Rate Limits
- Abuse Detection
- Logging auffälliger Muster
- ggf. Einschränkungen für bestimmte Abfragetypen
- Support-/Manual Review bei Missbrauchshinweisen

---

## Abuse Case 2 – Broken Object Level Authorization
**Szenario**
Ein Nutzer ruft fremde Checks, Assets, Removal-Fälle oder Support-Anfragen über IDs ab.

**Risiko**
- massiver Datenabfluss
- Offenlegung sensibler Medien und personenbezogener Daten

**Gegenmaßnahmen**
- owner checks auf allen objektbezogenen Endpunkten
- rollenbasierte Policies
- keine implizite Vertrauensannahme für IDs
- E2E-Autorisierungstests

---

## Abuse Case 3 – Missbrauch durch Datei-Uploads
**Szenario**
Ein Angreifer lädt manipulierte Dateien hoch, um Parser, Thumbnailer oder Analyse-Worker anzugreifen.

**Risiko**
- Code Execution
- Malware-Verbreitung
- DoS
- Speichermissbrauch

**Gegenmaßnahmen**
- allowlist für Dateitypen
- MIME-, Extension- und Signatur-Prüfung
- Quarantäne vor Verarbeitung
- Malware-Scan
- Größen- und Laufzeitlimits
- isolierte Worker

---

## Abuse Case 4 – Exfiltration sensibler Medien
**Szenario**
Signierte oder direkte Objekt-URLs werden unzureichend geschützt.

**Risiko**
- Veröffentlichung belastender Medien
- Vertrauensverlust
- rechtliche Folgen

**Gegenmaßnahmen**
- private Buckets
- kurze signierte URLs
- kein direktes Directory Listing
- Zugriff nur über autorisierte API
- Download-Audit-Logging

---

## Abuse Case 5 – API-Massenabfrage
**Szenario**
Ein Angreifer automatisiert Checks oder enumeriert Nutzer-/Fallobjekte.

**Risiko**
- Kostenexplosion
- Provider-Ban
- Missbrauch als Scan-Service

**Gegenmaßnahmen**
- Rate Limits
- Per-user / per-IP Throttling
- idempotency wo sinnvoll
- Bot-/Abuse Detection
- Job- und Check-Quotas

---

## Abuse Case 6 – Missbrauch von Support und Removal
**Szenario**
Ein Angreifer startet falsche Löschfälle oder überflutet den Support.

**Risiko**
- operative Belastung
- Fehlbearbeitung
- rechtliche Risiken

**Gegenmaßnahmen**
- Pflichtfelder und Nachweislogik
- Priorisierungsregeln
- Moderation / manuelle Freigaben
- Missbrauchskennzeichnung
- interne Notizen / Escalation Flags

---

## Abuse Case 7 – Provider Secret Leakage
**Szenario**
API-Keys externer Dienste gelangen in Logs, Repos oder Fehlermeldungen.

**Risiko**
- Dienstmissbrauch
- Kosten
- Sperrung von Integrationen

**Gegenmaßnahmen**
- Secret Manager
- redaction in logs
- kein Secret in Client-Code
- rollenbeschränkte Einsicht
- Rotation Playbook

---

## Abuse Case 8 – Unsichere Admin-/Support-Funktionen
**Szenario**
Backoffice-Funktionen sind unzureichend geschützt oder zu breit berechtigt.

**Risiko**
- interner Datenabfluss
- Manipulation von Workflows und Hilfetexten
- unberechtigte Einsicht in Fälle

**Gegenmaßnahmen**
- least privilege
- getrennte Rollen
- MFA für Backoffice
- Audit Logs
- sensible Aktionen mit zusätzlicher Bestätigung

---

## 6. Security Requirements nach Bereich

## 6.1 API Security
- Auth auf allen nicht-öffentlichen Endpunkten
- objektbezogene Autorisierung
- Eingabevalidierung
- Rate Limiting
- sichere Fehlerantworten
- request IDs und Audit-Logging
- keine sensitiven Daten in URLs, wenn vermeidbar

## 6.2 Upload Security
- Dateityp-Allowlist
- Größenlimits
- Signaturprüfung
- Malware-Scan
- Quarantäne
- isolierte Verarbeitung
- timeouts bei Analysejobs

## 6.3 Data Security
- Verschlüsselung ruhender sensitiver Daten
- private Object Storage Buckets
- Retention-Regeln
- minimale Rohdatenhaltung
- Logging ohne sensitive Payloads

## 6.4 Access Control
- RBAC + object ownership
- Backoffice mit strengeren Regeln
- Admin-/Support-Aktionen auditieren
- keine Sammelansichten ohne Rollencheck

## 6.5 Worker / ML Security
- isolierte Laufzeit
- keine direkten Secrets in Jobs
- kontrollierte Artefaktpfade
- strikte Ressourcenlimits
- sichere Third-Party-Modelle und Dependencies

---

## 7. Testfälle für Security

Mindestens folgende Sicherheitstests sind vor MVP sinnvoll:

1. Zugriff auf fremde Checks verhindern
2. Zugriff auf fremde Assets verhindern
3. Zugriff auf fremde Removal-Fälle verhindern
4. Rate Limits verifizieren
5. Upload von unerlaubten Dateitypen blockieren
6. Oversized Uploads blockieren
7. Secrets nicht in Logs ausgeben
8. Admin-Endpunkte nur für Admins
9. Support-Endpunkte nur für Support/Admin
10. signierte Downloads laufen korrekt ab und verfallen

---

## 8. Security-Planung, die noch daraus folgen sollte

Aus diesem Dokument sollten abgeleitet werden:

1. RBAC-Matrix
2. API-Security-Testplan
3. Upload-Sicherheitskonzept
4. Incident-Response-Playbook
5. Secret-Management-Konzept
6. Audit-Logging-Konzept

---

## 9. Fazit

Das Produkt hat ein erhöhtes Schutzbedürfnis, weil es:
- APIs mit objektbezogenen Zugriffen hat
- Datei-Uploads verarbeitet
- sensible personenbezogene Daten speichert
- potenziell belastende Medien enthält
- Support- und Removal-Prozesse im Backoffice bündelt

Security muss deshalb nicht nur technisch, sondern auch produktlogisch geplant werden.
