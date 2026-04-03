# Backend-Bootstrap + Epic- und Ticket-Backlog

## 1. Ziel

Dieses Dokument konkretisiert die nächste Planungsebene für die Umsetzung des Produkts:

1. technisches Backend-Bootstrap-Konzept
2. konkrete Modul-Initialisierung
3. Epic-Struktur für das Delivery-Management
4. erste Ticketpakete für MVP und Ausbau
5. empfohlene Reihenfolge für Sprint 0 bis Sprint 4

Das Ziel ist, aus Architektur und PRD direkt in umsetzbare Entwicklungsarbeit überzugehen.

---

## 2. Backend-Bootstrap Zielbild

Das Backend soll als modularer Monolith mit klaren Domänengrenzen starten. So bleibt die Entwicklungsgeschwindigkeit hoch, ohne spätere Entkopplung zu verbauen.

### Startarchitektur
- ein API-Service
- ein Worker-Service
- eine PostgreSQL-Datenbank
- Redis für Queue, Cache und Locks
- Object Storage für Uploads und Evidenz
- OpenAPI als zentrale API-Beschreibung

### Warum modularer Monolith zuerst
- schnellere MVP-Umsetzung
- weniger Infrastrukturkomplexität
- einfacheres Debugging
- saubere Extraktion einzelner Worker oder Provider-Services später möglich

---

## 3. Technisches Bootstrap-Paket

## 3.1 Repository-Struktur

```text
repo/
  backend/
  frontend/
  docs/
  infra/
  .github/
```

## 3.2 Backend-Startstruktur

```text
backend/
  apps/
    api/
    worker/
  packages/
    shared/
    database/
    openapi/
    provider-sdk/
  tests/
    integration/
    e2e/
  scripts/
```

## 3.3 Pflichtpakete im API-Service
- Config Management
- Validation
- Logging
- Error Handling
- Auth Guard
- Role Guard
- Request ID Middleware
- OpenAPI/Swagger Export
- Health Endpoints

## 3.4 Pflichtpakete im Worker-Service
- Queue Consumer
- Job Registry
- Retry Handling
- Dead-letter Handling
- structured logging
- Metrics Hooks

---

## 4. Initiale Domänenmodule

Die folgenden Module sollten im ersten Bootstrap erzeugt werden:

### Core
- auth
- users
- health
- config
- common

### Business Foundation
- providers
- checks
- jobs
- assets
- help-texts

### Business Flow Layer
- workflows
- support-requests
- removal-cases
- sources
- matches
- deepfake-results

### Admin / Operations
- admin-dashboard
- audit-logs
- notifications

---

## 5. Bootstrap-Reihenfolge im Code

## Phase 0 – Runtime Foundations
1. App Startpunkt
2. Config Loader
3. DB Connection
4. Migration Runner
5. Redis Connection
6. Logging + Error Layer
7. Health Check Endpoint
8. Swagger/OpenAPI Setup

## Phase 1 – Identity & Access
1. Users Entity
2. Auth Endpoints
3. JWT Flow
4. Rollenmodell
5. Guard / Policy Layer

## Phase 2 – Core Product Objects
1. Providers
2. Checks
3. Assets
4. Jobs
5. Help Texts

## Phase 3 – Guided Product Layer
1. Workflows
2. Support Requests
3. Removal Cases
4. User Submitted Sources
5. Content Matches

## Phase 4 – Analysis Integrations
1. Provider Connector Interface
2. Leak Provider Connectors
3. Image Analysis Pipeline
4. Match Pipeline
5. Risk Scoring

## Phase 5 – Advanced Analysis
1. Video Pipeline
2. GPU Worker
3. Escalation Automation
4. Ops Dashboard

---

## 6. Definition of Done für Bootstrap

Das Bootstrap ist abgeschlossen, wenn:
- API und Worker lokal startbar sind
- Migrationen automatisiert laufen
- Auth funktioniert
- mindestens ein Check erstellt werden kann
- Jobs in Queue geschrieben und verarbeitet werden
- Uploads gespeichert werden können
- Swagger-Doku generiert wird
- Basis-Logging und Fehlerobjekte stabil sind

---

## 7. Epic-Struktur

## Epic 1 – Platform Foundation
Ziel: technische Basis für alle weiteren Module.

### Beispiel-Tickets
- Repository initialisieren
- Monorepo oder Multi-App Struktur anlegen
- API-Service bootstrappen
- Worker-Service bootstrappen
- PostgreSQL anbinden
- Redis anbinden
- Config-Management einbauen
- Logging und Error Handling einbauen
- OpenAPI/Swagger Grundsetup
- CI-Pipeline einrichten

## Epic 2 – Identity & Access
Ziel: sichere Nutzer- und Rollenverwaltung.

### Beispiel-Tickets
- User Entity und Migration
- User Profile Entity und Migration
- Register Endpoint
- Login Endpoint
- Token Refresh Endpoint
- Bearer Auth Guard
- Rollen-Guard
- Current User Endpoint
- Account Update Endpoint

## Epic 3 – Provider Registry
Ziel: externe Quellen technisch verwaltbar machen.

### Beispiel-Tickets
- Provider Entity und Migration
- Provider Capabilities Entity
- Provider Endpoints Entity
- Provider Fields Entity
- Provider CRUD Admin Endpoints
- Provider Filter Endpoint
- Provider Seed Script
- Provider Status/Feature Flag Logik

## Epic 4 – Check Orchestration
Ziel: zentrale Prüfaufträge erstellen und verfolgen.

### Beispiel-Tickets
- Check Entity und Migration
- Jobs Entity und Migration
- Create Check Endpoint
- List Checks Endpoint
- Check Detail Endpoint
- Check Rerun Endpoint
- Check-to-Job Orchestrator
- Check Summary Mapper

## Epic 5 – Leak Check Engine
Ziel: erste produktive Datenleck-Prüfung.

### Beispiel-Tickets
- Provider Connector Interface definieren
- HIBP Connector implementieren
- LeakCheck Connector implementieren
- DeHashed Connector implementieren
- BreachDirectory Connector implementieren
- Normalized Check Results Entity / Mapping
- Risk Score v1
- Leak Summary Generator
- Provider Retry/Timeout Handling

## Epic 6 – Assets & Uploads
Ziel: Bilder und Videos sicher annehmen und speichern.

### Beispiel-Tickets
- Asset Entity und Migration
- Multipart Upload Endpoint
- MIME Validation
- Malware Scan Hook
- Hashing / SHA256
- Perceptual Hash Pipeline
- Object Storage Integration
- Asset Detail Endpoint
- Asset Delete Flow

## Epic 7 – Image Analysis MVP
Ziel: erster Foto-Check.

### Beispiel-Tickets
- Deepfake Result Entity
- Image Analysis Worker Job
- Metadata Extraction
- Heuristik Layer v1
- Model Inference Adapter
- Image Result Summary Builder
- Asset Deepfake Results Endpoint
- Image Risk Score Mapping

## Epic 8 – User Submitted Sources
Ziel: vom Nutzer gefundene URLs integrieren.

### Beispiel-Tickets
- User Submitted Source Entity
- Source Create Endpoint
- Source List Endpoint
- Source Detail Endpoint
- Source Update/Delete Endpoint
- URL Validation
- Source-to-Check Linking
- Validation Status Flow

## Epic 9 – Content Matching
Ziel: bekannte Reuploads, Fakes und Funde verknüpfen.

### Beispiel-Tickets
- Content Match Entity
- Match Service Grundlogik
- Asset-to-Match Linking
- Source-to-Match Linking
- Matches List Endpoint
- Match Detail Endpoint
- Known Fake / Known Leak Flags

## Epic 10 – Workflow Engine
Ziel: automatische Folgeprozesse nach einem Fund.

### Beispiel-Tickets
- Workflow Entity
- Workflow Steps Entity
- Workflow Instance Entity
- Workflow Instance Steps Entity
- Workflow Selection Rules v1
- Workflow Creation Trigger
- Workflow Read Endpoint
- Workflow Step Update Endpoint

## Epic 11 – Help Text System
Ziel: kontextsensitive Erklärungen im Produkt.

### Beispiel-Tickets
- Help Text Entity
- Help Text CRUD Admin API
- Help Text Query API
- Context Key Resolver
- Language Fallback Logik

## Epic 12 – Support Requests
Ziel: persönliche Hilfe durch Mitarbeitende ermöglichen.

### Beispiel-Tickets
- Support Request Entity
- Support Create Endpoint
- Support List Endpoint User
- Support Detail Endpoint
- Support Assign Endpoint Admin
- Support Status Update Endpoint
- Priority Rules v1

## Epic 13 – Removal Cases
Ziel: Lösch- und Meldeservice produktiv aufbauen.

### Beispiel-Tickets
- Removal Case Entity
- Removal Action Entity
- Create Removal Case Endpoint
- List Removal Cases Endpoint
- Case Detail Endpoint
- Add Removal Action Endpoint
- Removal Status Update Endpoint
- Create Case from Match Endpoint

## Epic 14 – Admin & Operations
Ziel: Backoffice arbeitsfähig machen.

### Beispiel-Tickets
- Admin Dashboard Endpoint
- Global Check Listing Admin
- Global Removal Listing Admin
- Audit Log Entity
- Audit Log Endpoint
- Notification Entity
- Notification Service v1

## Epic 15 – Video Analysis
Ziel: Hauptfeature in voller Ausbaustufe.

### Beispiel-Tickets
- Video Upload Constraints
- Video Analysis Worker
- Frame Extraction Pipeline
- Audio/Video Sync Heuristik
- Video Result Summary Builder
- GPU Worker Runtime
- Sensitive Case Escalation Rules

---

## 8. Sprint-Plan Vorschlag

## Sprint 0 – Projektstart
Ziel: technische Arbeitsfähigkeit.

### Scope
- Repo Setup
- CI/CD Grundsetup
- API Bootstrap
- Worker Bootstrap
- DB + Redis lokal
- Migration Tooling
- OpenAPI Grundsetup
- Logging / Errors / Health

### Ergebnis
Team kann lokal und in Dev deployen.

## Sprint 1 – Auth + Provider + Checks
### Scope
- Auth Flows
- Users
- Providers CRUD
- Checks Grundmodell
- Jobs Grundmodell
- Create/List/Get Checks

### Ergebnis
Nutzer kann sich anmelden und erste Checks anlegen.

## Sprint 2 – Leak Check MVP
### Scope
- Connector Interface
- HIBP + erster weiterer Provider
- Result Mapping
- Risk Score v1
- Check Results API
- Help Text Query
- Workflow Trigger bei Leak-Fund

### Ergebnis
Erster echter Business Value.

## Sprint 3 – Assets + Image MVP
### Scope
- Upload Flow
- Asset Speicherung
- Image Analysis Worker
- Deepfake Results API
- Sources Create/List
- Matches Basis
- Support Request Create

### Ergebnis
Foto-Check erste Version live.

## Sprint 4 – Removal + Operations
### Scope
- Removal Cases
- Removal Actions
- Admin Queue für Support
- Admin Listenansichten
- Audit Logs
- Notifications v1

### Ergebnis
Fund -> Hilfe -> Löschfall als zusammenhängender Prozess.

## Sprint 5 – Video Foundations
### Scope
- Video Upload
- Video Worker Start
- Frame Extraction
- erste Ergebnisdarstellung
- Eskalationsregeln

### Ergebnis
Videoanalyse als Beta-Funktion.

---

## 9. Technische Schulden, die bewusst später kommen dürfen

Diese Themen dürfen bewusst nach dem MVP kommen:
- vollständige Event-getriebene Entkopplung
- dedizierter Search Index
- Multi-Tenant / White-Label Support
- komplexe SLA-Engine
- fein granulare regelbasierte Workflow-DSL
- automatische Vorlagen für Plattform-Meldungen
- fortgeschrittene Analytics-Pipelines

---

## 10. Risiken in der Umsetzung

### Technische Risiken
- Provider APIs verhalten sich inkonsistent
- Videoanalyse wird teuer und langsam
- Upload- und Scan-Pipeline kann komplex werden

### Delivery-Risiken
- zu viele Provider gleichzeitig integrieren
- zu frühe Optimierung der Infrastruktur
- fehlende Abgrenzung zwischen MVP und Vollausbau

### Gegenmaßnahmen
- zuerst 2 bis 3 Provider produktiv stabilisieren
- Videoanalyse als separaten Ausbau behandeln
- modulare, aber pragmatische Umsetzung
- Backoffice früh genug mitdenken

---

## 11. Empfohlene direkte nächste Artefakte

1. echte `openapi.yaml`
2. DTO-/Schema-Katalog pro Endpoint
3. NestJS Modul- und Datei-Scaffold
4. DB-Migrationspaket
5. Seed-Dateien für Provider und Hilfetexte
6. Jira-/Linear-Importformat für Epics und Tickets

---

## 12. Priorisierte nächste Entscheidung

Die sinnvollste nächste Planungsstufe ist jetzt:

1. **echte OpenAPI-Datei erstellen**
2. danach **NestJS-Scaffold mit Modulstruktur**
3. danach **Ticket-Backlog im Importformat**
