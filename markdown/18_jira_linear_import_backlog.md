# Jira-/Linear-Import-Backlog

## 1. Ziel

Dieses Dokument übersetzt die Planung in ein importierbares Backlog-Format für Projektmanagement-Tools wie Jira oder Linear.

Die Struktur ist so formuliert, dass sie leicht in CSV, JSON oder direkte Tickets überführt werden kann.

---

## 2. Empfohlenes Feldschema

Für jedes Ticket:
- `Epic`
- `Title`
- `Type`
- `Priority`
- `Description`
- `Acceptance Criteria`
- `Dependencies`
- `Estimate`
- `Labels`

---

## 3. Epics

- Platform Foundation
- Auth & Access
- Provider Registry
- Check Orchestration
- Leak Check Engine
- Assets & Uploads
- Image Analysis MVP
- User Submitted Sources
- Content Matching
- Workflow Engine
- Help Text System
- Support Requests
- Removal Cases
- Admin & Operations
- Video Analysis
- OpenAPI & Developer Experience

---

## 4. Beispiel-Tickets im Importstil

## Epic: Platform Foundation

### Ticket
**Title:** Bootstrap NestJS API application  
**Type:** Story  
**Priority:** Highest  
**Estimate:** 5  
**Labels:** backend, foundation, nestjs

**Description:**  
Lege die Grundstruktur der API-Anwendung in NestJS an, inklusive AppModule, Main Bootstrap, Config Layer, Validation Pipe, Error Filter und Request-ID-Verarbeitung.

**Acceptance Criteria:**  
- App startet lokal
- Health Endpoint existiert
- globale Validation Pipe aktiv
- Error Response Format konsistent
- Request ID wird erzeugt

**Dependencies:**  
- keine

---

### Ticket
**Title:** Bootstrap worker application  
**Type:** Story  
**Priority:** Highest  
**Estimate:** 5  
**Labels:** worker, queue, foundation

**Description:**  
Lege die Worker-Anwendung mit Queue-Anbindung, Job-Registry und Logging-Grundstruktur an.

**Acceptance Criteria:**  
- Worker startet lokal
- Redis-Verbindung funktioniert
- Beispieljob kann konsumiert werden
- Fehler werden sauber geloggt

**Dependencies:**  
- Redis local setup

---

## Epic: Auth & Access

### Ticket
**Title:** Implement register endpoint  
**Type:** Story  
**Priority:** Highest  
**Estimate:** 3  
**Labels:** auth, api

**Description:**  
Implementiere Registrierung mit E-Mail, Passwort und Name. Nutze DTO-Validierung und sichere Passwort-Hashing-Strategie.

**Acceptance Criteria:**  
- POST `/auth/register` funktioniert
- Passwort wird nie im Klartext gespeichert
- fehlerhafte Eingaben liefern Validation Error
- Response entspricht Auth-Schema

**Dependencies:**  
- users table
- auth module scaffold

---

### Ticket
**Title:** Implement JWT auth guard and roles guard  
**Type:** Story  
**Priority:** Highest  
**Estimate:** 3  
**Labels:** security, auth, rbac

**Description:**  
Implementiere Auth Guard und Rollenprüfung für geschützte Endpunkte.

**Acceptance Criteria:**  
- Bearer Token wird validiert
- Rollen können an Endpunkten geprüft werden
- 401 und 403 werden korrekt getrennt
- Basis für RBAC-Policies steht

**Dependencies:**  
- register/login flow

---

## Epic: Provider Registry

### Ticket
**Title:** Create provider entities and migrations  
**Type:** Story  
**Priority:** High  
**Estimate:** 5  
**Labels:** database, providers

**Description:**  
Lege Tabellen und Entities für providers, provider_capabilities, provider_endpoints und provider_fields an.

**Acceptance Criteria:**  
- Migrationen laufen erfolgreich
- Beziehungen sind korrekt
- Seed-Datei kann Provider importieren

**Dependencies:**  
- DB setup

---

## Epic: Check Orchestration

### Ticket
**Title:** Implement create check endpoint  
**Type:** Story  
**Priority:** Highest  
**Estimate:** 5  
**Labels:** checks, api

**Description:**  
Implementiere Check-Erstellung für leak_email, leak_username, leak_domain, image und video.

**Acceptance Criteria:**  
- POST `/checks` validiert Input
- Check wird gespeichert
- Job wird erzeugt
- Response entspricht Schema
- Ownership ist vorbereitet

**Dependencies:**  
- checks table
- jobs table

---

## Epic: Leak Check Engine

### Ticket
**Title:** Implement provider connector interface  
**Type:** Story  
**Priority:** Highest  
**Estimate:** 3  
**Labels:** provider-sdk, architecture

**Description:**  
Definiere das gemeinsame Interface für Leak-Provider inklusive execute, normalize und healthCheck.

**Acceptance Criteria:**  
- Interface existiert im provider-sdk
- HIBP kann das Interface implementieren
- Checks-Orchestrator kann Connectoren aufrufen

**Dependencies:**  
- provider-sdk scaffold

---

### Ticket
**Title:** Implement HIBP connector  
**Type:** Story  
**Priority:** Highest  
**Estimate:** 5  
**Labels:** hibp, connector, leak-check

**Description:**  
Implementiere HIBP als ersten produktiven Provider.

**Acceptance Criteria:**  
- Connector nutzt serverseitigen API-Key
- Antwort wird auf CheckResult normalisiert
- Fehler und Timeouts werden abgefangen
- Unit Tests für Mapping vorhanden

**Dependencies:**  
- provider connector interface

---

## Epic: Assets & Uploads

### Ticket
**Title:** Implement image upload endpoint  
**Type:** Story  
**Priority:** High  
**Estimate:** 5  
**Labels:** uploads, assets, api

**Description:**  
Implementiere multipart Upload für Bilder mit MIME-Prüfung, Größenlimit, Hashing und Storage-Anbindung.

**Acceptance Criteria:**  
- erlaubte Bilder werden gespeichert
- falsche Dateitypen werden abgewiesen
- Asset-Datensatz wird angelegt
- SHA256 wird berechnet

**Dependencies:**  
- assets table
- object storage config

---

## Epic: User Submitted Sources

### Ticket
**Title:** Implement create source endpoint  
**Type:** Story  
**Priority:** High  
**Estimate:** 3  
**Labels:** sources, api

**Description:**  
Implementiere POST `/sources` inkl. URL-Validierung und optionaler Verknüpfung mit Asset oder Check.

**Acceptance Criteria:**  
- URL wird validiert
- Quelle wird gespeichert
- Ownership ist korrekt
- Response entspricht Schema

**Dependencies:**  
- sources table

---

## Epic: Workflow Engine

### Ticket
**Title:** Implement workflow instantiation on completed high-risk checks  
**Type:** Story  
**Priority:** High  
**Estimate:** 5  
**Labels:** workflow, automation

**Description:**  
Wenn ein Check mit hohem Risiko abgeschlossen wird, soll automatisch eine passende Workflow-Instanz erzeugt werden.

**Acceptance Criteria:**  
- Risk-Trigger wird geprüft
- Workflow-Instanz wird erstellt
- Workflow-Schritte werden instanziiert
- Check kann Workflow referenzieren

**Dependencies:**  
- workflows tables
- risk scoring

---

## Epic: Support Requests

### Ticket
**Title:** Implement create support request endpoint  
**Type:** Story  
**Priority:** High  
**Estimate:** 3  
**Labels:** support, api

**Description:**  
Implementiere POST `/support-requests` mit optionalem Bezug zu Check, Asset oder Removal-Fall.

**Acceptance Criteria:**  
- Support-Anfrage wird gespeichert
- Ownership ist korrekt
- Status standardmäßig open
- Admin/Support können sie später sehen

**Dependencies:**  
- support_requests table

---

## Epic: Removal Cases

### Ticket
**Title:** Implement create removal case endpoint  
**Type:** Story  
**Priority:** High  
**Estimate:** 5  
**Labels:** removal, api

**Description:**  
Implementiere POST `/removal-cases` für direkte oder Match-basierte Löschfälle.

**Acceptance Criteria:**  
- Fall wird angelegt
- Status ist open
- Verknüpfung zu Match/Asset möglich
- Ownership ist korrekt

**Dependencies:**  
- removal_cases table

---

## Epic: OpenAPI & Developer Experience

### Ticket
**Title:** Export initial openapi.yaml from codebase  
**Type:** Story  
**Priority:** High  
**Estimate:** 3  
**Labels:** openapi, docs, developer-experience

**Description:**  
Stelle sicher, dass die API-Dokumentation aus dem Code generiert oder zumindest synchron gepflegt wird.

**Acceptance Criteria:**  
- initiale OpenAPI-Datei ist abrufbar
- Kernendpunkte enthalten
- DTOs sind dokumentiert
- Fehlerobjekt ist dokumentiert

**Dependencies:**  
- initial API endpoints

---

## 5. Reihenfolge für Import

Empfohlene Import-Reihenfolge:
1. Platform Foundation
2. Auth & Access
3. Provider Registry
4. Check Orchestration
5. Leak Check Engine
6. Assets & Uploads
7. User Submitted Sources
8. Content Matching
9. Workflow Engine
10. Support Requests
11. Removal Cases
12. Admin & Operations
13. Video Analysis
14. OpenAPI & Developer Experience

---

## 6. Nächster Schritt

Aus diesem Dokument kann als Nächstes erzeugt werden:
- CSV-Importdatei
- JSON-Importdatei
- Sprintzuordnung mit Priorisierung
- Ticket-Batches je Sprint

---

## 7. Fazit

Mit diesem Backlog-Format lässt sich die Planung direkt in Delivery-Management übersetzen. Das hilft besonders dann, wenn das Vibe-Coding-Tool Feature für Feature geführt werden soll.
