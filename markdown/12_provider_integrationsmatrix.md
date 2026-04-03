# Provider-Integrationsmatrix

## 1. Ziel

Dieses Dokument priorisiert und strukturiert die geplanten Provider-Integrationen für Leak-Checks und angrenzende Recherche-/Hilfsdienste.

Es dient als Grundlage für:
- Reihenfolge der technischen Integration
- Connector-Implementierung
- Kosten-/Nutzen-Entscheidungen
- Retry-/Timeout-/Fallback-Strategien
- Seed-Daten und Provider-Registry

---

## 2. Bewertungsdimensionen

Jeder Provider wird anhand folgender Kriterien eingeordnet:
- API verfügbar
- Sucharten
- Nutzerwert
- Integrationsaufwand
- Ergebnisqualität
- Kosten-/Lizenzrisiko
- Priorität für MVP

---

## 3. Integrationspriorität

## Priorität A – MVP direkt integrieren
1. Have I Been Pwned (HIBP)
2. HIBP Pwned Passwords
3. LeakCheck
4. DeHashed

## Priorität B – früh nach MVP / optional MVP+
5. BreachDirectory / Logoutify
6. HPI Identity Leak Checker (nur Web-Link / kein API-Connector im MVP)
7. Mozilla Monitor (Informations-/Web-Link, keine Primärdatenquelle im MVP)

## Priorität C – nur Referenz / Workflow-Hilfe
8. Cybernews Leak Checker
9. Bitdefender Digital Identity Protection
10. SCHUFA / Identitätsbetrug
11. Robinsonliste / I.D.I.
12. ICANN / RIPE

---

## 4. Provider-Matrix

| Provider | Typ | API | Primäre Sucharten | Auth | Erwartete Rolle im Produkt | MVP |
|---|---|---|---|---|---|---|
| HIBP | leak_api | ja | email, breach lookup | api_key | Kernquelle für Breach Checks | ja |
| HIBP Pwned Passwords | password_api | ja | password hash prefix | keine / spezielles Modell | Passwort-Prüfung | ja |
| LeakCheck | leak_api | ja | email, username, ggf. mehr je Plan | api_key | Zusatzabdeckung | ja |
| DeHashed | leak_api | ja | email, username, domain, weitere je Plan | account/api | breite Zusatzquelle | ja |
| BreachDirectory / Logoutify | leak_api | ja | email, username, ip, expanded | api_key | ergänzende Quelle | optional |
| HPI Identity Leak Checker | web_checker | keine öffentliche API | email | web only | vertrauenswürdiger Link | link only |
| Mozilla Monitor | monitoring/web | keine separate Primär-API | email | web | ergänzende UX-Referenz | link only |
| Cybernews | web_checker | keine gesicherte öffentliche API | email, phone | web | Zusatzlink | nein |
| Bitdefender DIP | monitoring | keine offene Integrations-API | identity monitoring | account | Zusatz-/Partneroption | nein |
| SCHUFA | utility | nein | Folgeprozess | web | Hilfelink bei Identitätsmissbrauch | nein |
| ICANN / RIPE | utility | teils ja / web | domain, ip | none | Abuse-/Hoster-Recherche | optional später |

---

## 5. Integrationsdetails pro Provider

## 5.1 HIBP
### Nutzen
- etablierte Primärquelle für E-Mail-basierte Breach Checks
- gute Standardisierung für Integration

### Geplante Inputs
- email
- optional breach name / domain später

### Output-Normalisierung
- breach_name
- breach_date
- exposed_data
- source_confidence hoch
- normalized_summary

### Technische Regeln
- dedizierter Connector
- Timeout konservativ
- Retry begrenzt
- API-Key nur serverseitig
- User-Agent/Headers zentral konfigurieren

### Priorität
Sehr hoch

---

## 5.2 HIBP Pwned Passwords
### Nutzen
- datenschutzfreundliche Passwort-Prüfung per Hash-Präfix
- kein Klartext-Passwort-Handling

### Geplante Inputs
- password hash prefix

### Output-Normalisierung
- hit_found
- count / severity mapping
- summary für Nutzer

### Technische Regeln
- Passwort lokal hashen
- niemals Klartext speichern
- eigener Connector, getrennt von normalen Leak-Checks

### Priorität
Sehr hoch

---

## 5.3 LeakCheck
### Nutzen
- zusätzliche Abdeckung für E-Mail/Username
- sinnvoll als zweite produktive Quelle

### Geplante Inputs
- email
- username
- ggf. domain/phone je Plan später

### Technische Regeln
- planabhängige Fähigkeiten in `provider_capabilities`
- Rate-Limit-Handling
- Ergebnisnormalisierung auf Standardmodell

### Priorität
Hoch

---

## 5.4 DeHashed
### Nutzen
- breite Suchoptionen
- gute Ergänzung für fortgeschrittene Abdeckung

### Geplante Inputs
- email
- username
- domain

### Technische Regeln
- Nutzung zunächst auf klar definierte Sucharten begrenzen
- kosten- und quota-bewusst integrieren
- Provider-spezifische Felder auf Standardmodell mappen

### Priorität
Hoch

---

## 5.5 BreachDirectory / Logoutify
### Nutzen
- ergänzende Datenquelle
- potenziell breitere Suche

### Risiken
- Ergebnisqualität und Produktfit klar evaluieren
- sensibler als reine Kernquellen

### Priorität
Mittel

---

## 5.6 Web-only Quellen
Diese Quellen sollten zunächst nicht als technische Such-Connectoren, sondern als:
- Hilfelinks
- Zusatzressourcen
- Follow-up Empfehlungen
- manuelle Referenzen

behandelt werden.

Dazu gehören:
- HPI
- Mozilla Monitor
- Cybernews
- Bitdefender
- SCHUFA
- Robinsonliste

---

## 6. Fallback-Strategie

## 6.1 Reihenfolge im MVP
1. HIBP
2. LeakCheck
3. DeHashed
4. optional BreachDirectory

## 6.2 Fehlerverhalten
- Wenn ein Provider fehlschlägt, soll der Gesamtcheck nicht sofort komplett fehlschlagen
- Teilresultate müssen markiert werden
- Summary muss „teilweise abgeschlossen“ unterstützen
- Providerfehler sollen technisch geloggt, aber nutzerfreundlich abstrahiert werden

## 6.3 Timeout-Regeln
- kurze Timeouts für Echtzeitchecks
- keine unendlichen Retries
- klarer Retry-Backoff
- Provider-spezifische Konfiguration

---

## 7. Normalisierungsmodell

Unabhängig vom Provider soll auf diese Felder gemappt werden:

- provider_id
- hit_found
- hit_type
- breach_name
- breach_date
- exposed_data
- source_confidence
- normalized_summary
- raw_reference
- severity_hint

Zusätzliche provider-spezifische Rohdaten sollten nur bei Bedarf und kontrolliert gespeichert werden.

---

## 8. Seed-Datenfelder für Provider Registry

Für jeden Provider sollten Seed-Dateien mindestens enthalten:
- name
- category
- website_url
- api_available
- api_docs_url
- auth_type
- pricing_model
- notes
- status

Zusätzlich in Capabilities:
- check_email
- check_username
- check_phone
- check_domain
- check_password_hash
- monitoring_support
- raw_response_storage_allowed

---

## 9. Technische Entscheidungen vor Implementierung

Vor Coding final entscheiden:
1. Welche Provider sind für MVP-Verträge/Lizenzen verfügbar?
2. Welche Sucharten werden tatsächlich freigeschaltet?
3. Welche Quotas pro Nutzer gelten?
4. Welche Provider werden parallel vs. seriell abgefragt?
5. Wie werden Teilausfälle dem Nutzer kommuniziert?
6. Welche Daten aus Providerantworten dürfen gespeichert werden?

---

## 10. Daraus abzuleitende nächste Artefakte

1. Seed-Datei für Provider
2. Provider Connector Interface
3. Provider-spezifische Mapping-Spezifikationen
4. Timeout-/Retry-Konfiguration
5. Kosten-/Quota-Policy
6. Nutzerkommunikation bei Teilfehlern

---

## 11. Fazit

Für den MVP sollte der technische Fokus klar bleiben: wenige, starke API-Quellen sauber integrieren und web-only Quellen zunächst als Referenz-/Hilfsbausteine behandeln. So bleibt die Plattform stabil und die Integrationskomplexität beherrschbar.
