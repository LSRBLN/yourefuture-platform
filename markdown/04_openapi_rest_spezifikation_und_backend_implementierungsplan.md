# OpenAPI / REST-Spezifikation + Backend-Ordnerstruktur + Implementierungsplan

## 1. Ziel

Dieses Dokument definiert:

1. eine pragmatische REST-/OpenAPI-Struktur für das Produkt
2. eine empfohlene Backend-Ordnerstruktur
3. einen konkreten Implementierungsplan für das MVP und den Ausbau

Die Spezifikation ist so angelegt, dass sie direkt als Grundlage für eine OpenAPI-Datei, Backend-Tickets und Service-Module verwendet werden kann.

---

## 2. API-Grundprinzipien

### Architekturansatz
- REST als primäre externe Schnittstelle
- JSON als Standardformat
- asynchrone Jobs für rechenintensive Analysen
- konsistente Fehlerobjekte
- versionierte API

### Basis-Pfad
`/api/v1`

### Authentifizierung
- Bearer Token für eingeloggte Nutzer
- optional Gastmodus für bestimmte Erstchecks
- Admin-/Support-Endpunkte nur für entsprechende Rollen

### Response-Prinzipien
- alle Ressourcen besitzen stabile IDs
- Listenendpunkte unterstützen Pagination
- schwere Analysen liefern zunächst einen `job`- oder `check`-Status
- Ergebnisobjekte liefern immer auch eine nutzerfreundliche `summary`

---

## 3. Domänen der API

1. Auth
2. Users
3. Providers
4. Checks
5. Assets
6. Deepfake Results
7. User Submitted Sources
8. Content Matches
9. Workflows
10. Support Requests
11. Removal Cases
12. Help Texts
13. Jobs
14. Admin / Operations

---

## 4. Ressourcenmodell

## 4.1 Auth

### POST `/api/v1/auth/register`
Registriert einen Nutzer.

**Request**
```json
{
  "email": "user@example.com",
  "password": "<secret>",
  "fullName": "Max Mustermann"
}
```

**Response**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user"
  },
  "token": "jwt",
  "refreshToken": "token"
}
```

### POST `/api/v1/auth/login`
Login.

### POST `/api/v1/auth/refresh`
Token erneuern.

### POST `/api/v1/auth/logout`
Session beenden.

### GET `/api/v1/auth/me`
Aktuellen Nutzer laden.

---

## 4.2 Users

### GET `/api/v1/users/me`
Profil laden.

### PATCH `/api/v1/users/me`
Profil aktualisieren.

**Request**
```json
{
  "fullName": "Max Mustermann",
  "locale": "de",
  "timezone": "Europe/Berlin",
  "preferredContact": "email"
}
```

### DELETE `/api/v1/users/me`
Konto bzw. Löschprozess anstoßen.

---

## 4.3 Providers

### GET `/api/v1/providers`
Liste aktiver Provider.

**Query-Parameter**
- `category`
- `activeOnly`
- `supports=email|username|phone|domain|image|video`

### GET `/api/v1/providers/{providerId}`
Provider-Details.

### POST `/api/v1/admin/providers`
Provider anlegen.

### PATCH `/api/v1/admin/providers/{providerId}`
Provider ändern.

### GET `/api/v1/admin/providers/{providerId}/endpoints`
Provider-Endpunkte anzeigen.

### POST `/api/v1/admin/providers/{providerId}/endpoints`
Provider-Endpunkt anlegen.

---

## 4.4 Checks

Checks sind der zentrale Einstieg für Leak-, Bild- und Video-Prüfungen.

### POST `/api/v1/checks`
Erstellt einen Check.

**Beispiel Leak-Check Request**
```json
{
  "type": "leak_email",
  "input": {
    "email": "user@example.com"
  }
}
```

**Beispiel Image-Check Request**
```json
{
  "type": "image",
  "input": {
    "assetId": "uuid"
  }
}
```

**Beispiel Video-Check mit Quelle**
```json
{
  "type": "video",
  "input": {
    "assetId": "uuid",
    "submittedSourceIds": ["uuid"]
  }
}
```

**Response**
```json
{
  "id": "uuid",
  "type": "leak_email",
  "status": "queued",
  "createdAt": "2026-03-29T12:00:00Z"
}
```

### GET `/api/v1/checks`
Liste der Checks des Nutzers.

**Query-Parameter**
- `type`
- `status`
- `page`
- `limit`

### GET `/api/v1/checks/{checkId}`
Check-Details inklusive Status, Summary und Kernresultate.

### GET `/api/v1/checks/{checkId}/results`
Normalisierte Ergebnisse zu einem Check.

### GET `/api/v1/checks/{checkId}/workflow`
Dem Check zugeordnete Workflow-Instanz.

### POST `/api/v1/checks/{checkId}/rerun`
Check erneut ausführen.

### POST `/api/v1/checks/{checkId}/support-request`
Direkt aus dem Ergebnis persönliche Hilfe anfragen.

**Request**
```json
{
  "requestType": "result_interpretation",
  "priority": "high",
  "preferredContact": "email",
  "message": "Ich brauche Hilfe bei der Einordnung dieses Fundes."
}
```

---

## 4.5 Assets

### POST `/api/v1/assets`
Datei hochladen.

Empfohlen als multipart upload.

**Response**
```json
{
  "id": "uuid",
  "assetType": "image",
  "mimeType": "image/jpeg",
  "status": "stored",
  "sha256": "..."
}
```

### GET `/api/v1/assets/{assetId}`
Asset-Metadaten laden.

### DELETE `/api/v1/assets/{assetId}`
Asset löschen bzw. zur Löschung vormerken.

### GET `/api/v1/assets/{assetId}/deepfake-results`
Deepfake-Analyseergebnisse zum Asset.

### GET `/api/v1/assets/{assetId}/matches`
Bekannte Matches / Reuploads / Funde.

---

## 4.6 Deepfake Results

### GET `/api/v1/deepfake-results/{resultId}`
Einzelnes Analyseergebnis laden.

**Response**
```json
{
  "id": "uuid",
  "assetId": "uuid",
  "modelName": "media-detector-v1",
  "modelVersion": "1.2.0",
  "probabilityFake": 0.87,
  "probabilityManipulated": 0.91,
  "confidence": 0.82,
  "verdict": "likely_manipulated",
  "summary": "Das Bild weist mehrere Merkmale einer Manipulation auf."
}
```

---

## 4.7 User Submitted Sources

### POST `/api/v1/sources`
Manuell gefundene Quelle einreichen.

**Request**
```json
{
  "sourceType": "video_url",
  "sourceUrl": "https://example.com/video/123",
  "platformName": "ExamplePlatform",
  "pageTitle": "Verdächtiges Video",
  "notes": "Vom Kunden selbst gefunden.",
  "assetId": "uuid"
}
```

### GET `/api/v1/sources`
Eigene gemeldete Quellen abrufen.

### GET `/api/v1/sources/{sourceId}`
Details einer gemeldeten Quelle.

### PATCH `/api/v1/sources/{sourceId}`
Quelle aktualisieren.

### DELETE `/api/v1/sources/{sourceId}`
Quelle entfernen.

---

## 4.8 Content Matches

### GET `/api/v1/matches`
Liste erkannter Matches.

### GET `/api/v1/matches/{matchId}`
Details zu Fundstelle / Match.

### POST `/api/v1/matches/{matchId}/create-removal-case`
Direkt aus einem Match einen Löschfall eröffnen.

---

## 4.9 Workflows

### GET `/api/v1/workflows/{workflowInstanceId}`
Workflow-Instanz laden.

### GET `/api/v1/workflows/{workflowInstanceId}/steps`
Alle Schritte laden.

### PATCH `/api/v1/workflows/{workflowInstanceId}/steps/{stepId}`
Status eines Schritts aktualisieren.

**Request**
```json
{
  "status": "completed",
  "notes": "Passwort geändert und 2FA aktiviert."
}
```

---

## 4.10 Support Requests

### POST `/api/v1/support-requests`
Persönliche Hilfe anfragen.

**Request**
```json
{
  "requestType": "deepfake_help",
  "priority": "urgent",
  "checkId": "uuid",
  "assetId": "uuid",
  "preferredContact": "email",
  "message": "Ich habe ein verdächtiges Video gefunden und brauche Hilfe."
}
```

### GET `/api/v1/support-requests`
Eigene Support-Anfragen laden.

### GET `/api/v1/support-requests/{supportRequestId}`
Details der Support-Anfrage.

### PATCH `/api/v1/admin/support-requests/{supportRequestId}`
Support-Status aktualisieren.

### POST `/api/v1/admin/support-requests/{supportRequestId}/assign`
An Mitarbeiter zuweisen.

---

## 4.11 Removal Cases

### POST `/api/v1/removal-cases`
Removal-Fall anlegen.

**Request**
```json
{
  "assetId": "uuid",
  "matchId": "uuid",
  "caseType": "non_consensual_content",
  "platformName": "ExamplePlatform",
  "targetUrl": "https://example.com/video/123",
  "legalBasis": "personality_rights"
}
```

### GET `/api/v1/removal-cases`
Eigene Löschfälle abrufen.

### GET `/api/v1/removal-cases/{caseId}`
Löschfall im Detail.

### POST `/api/v1/removal-cases/{caseId}/actions`
Aktion dokumentieren.

### PATCH `/api/v1/removal-cases/{caseId}`
Status und Metadaten aktualisieren.

### POST `/api/v1/removal-cases/{caseId}/request-support`
Support direkt für den Löschfall anfragen.

---

## 4.12 Help Texts

### GET `/api/v1/help-texts`
Hilfetexte nach Kontext laden.

**Query-Parameter**
- `contextKey`
- `languageCode`
- `triggerType`

### POST `/api/v1/admin/help-texts`
Hilfetext anlegen.

### PATCH `/api/v1/admin/help-texts/{helpTextId}`
Hilfetext ändern.

---

## 4.13 Jobs

### GET `/api/v1/jobs/{jobId}`
Jobstatus laden.

### GET `/api/v1/checks/{checkId}/jobs`
Jobs zu einem Check laden.

---

## 4.14 Admin / Operations

### GET `/api/v1/admin/dashboard`
Ops-Metriken und Statusübersicht.

### GET `/api/v1/admin/removal-cases`
Alle Removal-Fälle mit Filterung.

### GET `/api/v1/admin/checks`
Alle Checks mit Filterung.

### GET `/api/v1/admin/audit-logs`
Audit-Logs.

### GET `/api/v1/admin/workflows`
Workflow-Templates verwalten.

### POST `/api/v1/admin/workflows`
Workflow-Template anlegen.

### PATCH `/api/v1/admin/workflows/{workflowId}`
Workflow-Template ändern.

---

## 5. Standardisierte Response-Objekte

## 5.1 Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Die Eingabe ist ungültig.",
    "details": [
      {
        "field": "email",
        "message": "Ungültiges Format"
      }
    ],
    "requestId": "uuid"
  }
}
```

## 5.2 Pagination Response
```json
{
  "items": [],
  "page": 1,
  "limit": 20,
  "total": 200
}
```

## 5.3 Check Summary Response
```json
{
  "id": "uuid",
  "type": "image",
  "status": "completed",
  "riskScore": 84,
  "severity": "high",
  "summary": "Es wurden Hinweise auf eine mögliche Manipulation und bekannte Fundstellen erkannt.",
  "recommendedActions": [
    "Quelle dokumentieren",
    "Removal-Fall erstellen",
    "Persönliche Hilfe anfragen"
  ]
}
```

---

## 6. OpenAPI-Struktur für die technische Umsetzung

Empfohlene Aufteilung der OpenAPI-Datei:

```text
openapi/
  openapi.yaml
  paths/
    auth.yaml
    users.yaml
    providers.yaml
    checks.yaml
    assets.yaml
    deepfake-results.yaml
    sources.yaml
    matches.yaml
    workflows.yaml
    support-requests.yaml
    removal-cases.yaml
    help-texts.yaml
    jobs.yaml
    admin.yaml
  schemas/
    common.yaml
    auth.yaml
    users.yaml
    checks.yaml
    assets.yaml
    matches.yaml
    support.yaml
    removal.yaml
```

---

## 7. Backend-Ordnerstruktur

Empfehlung für ein modulares Monorepo oder sauberes Backend-Repository.

```text
backend/
  apps/
    api/
      src/
        main.ts
        app.module.ts
        config/
        common/
        modules/
          auth/
          users/
          providers/
          checks/
          assets/
          deepfake-results/
          sources/
          matches/
          workflows/
          support-requests/
          removal-cases/
          help-texts/
          jobs/
          admin/
    worker/
      src/
        main.ts
        jobs/
          leak-check/
          image-analysis/
          video-analysis/
          content-match/
          workflow-generation/
          removal-followup/
        services/
        providers/
        utils/
  packages/
    database/
      prisma-or-sql/
      migrations/
      seeds/
    shared/
      dto/
      enums/
      interfaces/
      validation/
      errors/
      logging/
    openapi/
      openapi.yaml
      paths/
      schemas/
    provider-sdk/
      src/
        connectors/
          hibp/
          leakcheck/
          dehashed/
          breachdirectory/
        interfaces/
        normalizers/
  infra/
    docker/
    kubernetes/
    terraform/
  scripts/
    seed-providers/
    seed-help-texts/
    migrate/
  docs/
    architecture/
    api/
    runbooks/
```

---

## 8. Modulstruktur im Backend

Beispiel für ein Modul `checks`:

```text
modules/checks/
  checks.controller.ts
  checks.service.ts
  checks.repository.ts
  checks.module.ts
  dto/
    create-check.dto.ts
    list-checks.dto.ts
    rerun-check.dto.ts
  entities/
    check.entity.ts
  mappers/
    check-response.mapper.ts
  policies/
    check-access.policy.ts
```

Beispiel für ein Modul `removal-cases`:

```text
modules/removal-cases/
  removal-cases.controller.ts
  removal-cases.service.ts
  removal-cases.repository.ts
  removal-cases.module.ts
  dto/
  entities/
  mappers/
  policies/
```

---

## 9. Interne Service-Schnittstellen

Die internen Services sollten auf klaren Verträgen aufbauen.

### CheckOrchestrator
- `createCheck(input)`
- `enqueueCheck(checkId)`
- `rerunCheck(checkId)`
- `finalizeCheck(checkId)`

### ProviderConnector
- `supports(checkType)`
- `execute(input)`
- `normalize(response)`
- `healthCheck()`

### AssetAnalyzer
- `analyzeImage(assetId)`
- `analyzeVideo(assetId)`
- `buildSummary(result)`

### WorkflowEngine
- `selectWorkflow(context)`
- `instantiateWorkflow(workflowId, context)`
- `completeStep(instanceId, stepId)`

### RemovalCaseService
- `createCase(input)`
- `addAction(caseId, action)`
- `updateStatus(caseId, status)`

---

## 10. Implementierungsplan

## Phase A – Foundation

### Ziel
Lauffähige API-Grundstruktur, Auth, Datenmodell, erste Kernmodule.

### Aufgaben
- Projekt-Setup Backend
- DB-Setup mit Migrationen
- Auth-Modul
- Users-Modul
- Providers-Modul
- Checks-Modul Grundstruktur
- Assets-Modul Grundstruktur
- Jobs-Modul Grundstruktur
- OpenAPI-Basisdatei
- Error Handling / Validation / Logging

### Ergebnis
- Backend startet stabil
- Nutzer können sich anmelden
- Provider und Checks sind als Ressourcen verfügbar

---

## Phase B – Leak-Check MVP

### Ziel
Erster echter Business Flow.

### Aufgaben
- Provider Connector Interface implementieren
- HIBP Connector
- LeakCheck Connector
- DeHashed Connector
- BreachDirectory Connector
- Normalisierung von Check-Results
- Risk Score Grundversion
- `POST /checks` für Leak-Fälle
- `GET /checks/{id}` und `GET /checks/{id}/results`
- Workflow-Zuordnung nach Leak-Fund
- erste Hilfetexte laden

### Ergebnis
- Leak-Checks für E-Mail/Username/Domain funktionieren Ende-zu-Ende

---

## Phase C – Asset- und Bildanalyse MVP

### Ziel
Foto-Check als Hauptfeature produktiv aufbauen.

### Aufgaben
- Multipart Upload
- Asset-Speicherung
- Image Analysis Worker
- Speicherung `deepfake_results`
- Content Match Grundlogik
- `GET /assets/{id}/deepfake-results`
- `GET /assets/{id}/matches`
- Erstellung eines Workflows bei Fund
- Support-Request aus Check heraus

### Ergebnis
- Nutzer kann Bild hochladen, prüfen und Folgeaktionen starten

---

## Phase D – Manuelle Quellen + Removal MVP

### Ziel
Vom Nutzer gefundene Fundstellen und Löschfälle integrieren.

### Aufgaben
- `POST /sources`
- Verknüpfung von Quellen mit Assets und Checks
- `POST /removal-cases`
- `POST /removal-cases/{id}/actions`
- Support-Routing für sensible Fälle
- Admin-Fallübersicht

### Ergebnis
- gefundene URLs können gemeldet, analysiert und in Löschfälle überführt werden

---

## Phase E – Videoanalyse

### Ziel
Video-Check und GPU-Worker ergänzen.

### Aufgaben
- Video Upload
- Frame-Extraktion
- Video Analysis Worker
- Audio-/Video-Konsistenzanalyse
- Match-Engine für Videos
- Eskalationslogik bei sensiblen Funden

### Ergebnis
- erster produktiver Deepfake-Video-Check

---

## Phase F – Operations & Reifegrad

### Aufgaben
- Admin Dashboard
- Audit Logs
- Reporting KPIs
- Notification Service
- feinere Rollenrechte
- Provider Health Monitoring
- SLA-/Queue-Optimierung

---

## 11. Ticketstruktur für die Umsetzung

Empfohlene Epic-Struktur:

1. Backend Foundation
2. Auth & User Management
3. Provider Registry
4. Leak Check Engine
5. Assets & Uploads
6. Image Deepfake Analysis
7. User Submitted Sources
8. Content Matching
9. Workflow Engine
10. Support Requests
11. Removal Cases
12. Video Analysis
13. Admin Operations
14. Observability & Security
15. OpenAPI & Developer Experience

---

## 12. Reihenfolge für sofortige Umsetzung

Wenn du das jetzt direkt bauen willst, ist diese Reihenfolge am sinnvollsten:

1. Backend-Grundgerüst
2. SQL-Migrationen
3. Auth + Users
4. Providers + Provider Connector Interface
5. Checks + Jobs
6. Leak-Check-Endpunkte
7. Assets + Bildanalyse-Endpunkte
8. Sources + Matches
9. Workflows
10. Support Requests
11. Removal Cases
12. Admin-Endpunkte
13. Videoanalyse

---

## 13. Nächster sinnvoller Schritt

Aus diesem Dokument sollten als Nächstes entstehen:

1. echte `openapi.yaml`
2. konkrete DTOs / Schemas je Endpoint
3. Ticket-Backlog pro Epic
4. Backend-Bootstrap-Struktur für NestJS oder Fastify
