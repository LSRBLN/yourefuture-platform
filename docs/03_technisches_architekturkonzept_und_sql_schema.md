# Technisches Architekturkonzept + SQL-Schema

## 1. Zielbild
Die Plattform besteht aus einer modularen Service-Architektur mit vier Kernbereichen:

1. **User Platform** – Web-App, Uploads, Check-Start, Ergebnisansicht, Workflows, Support-Anfragen
2. **Analysis Platform** – Leak-Aggregation, Deepfake-Analyse, Match-Erkennung, Risiko-Bewertung
3. **Operations Platform** – Removal-Cases, Support-Queue, Admin, Provider-Verwaltung
4. **Data Platform** – relationale Datenbank, Objektspeicher, Queue, Audit- und Event-Daten

Die Architektur ist ausgelegt auf:
- modulare Erweiterbarkeit für neue Provider
- asynchrone Verarbeitung für aufwendige Analysen
- klare Trennung zwischen synchroner UI und Hintergrundjobs
- hohe Nachvollziehbarkeit durch Audit, Fallhistorie und Events
- datensparsame Verarbeitung sensibler Inhalte

## 2. Architekturprinzipien
### 2.1 Modularität
Jede externe Quelle und jede Analysefunktion wird als klar getrenntes Modul implementiert.

### 2.2 API-first
Alle Kernfunktionen werden über interne APIs und Service-Verträge abgebildet.

### 2.3 Queue-first für schwere Aufgaben
Medienanalysen, Reupload-Erkennung, Provider-Aggregation und Removal-Orchestrierung laufen asynchron über Jobs.

### 2.4 Security by Design
Sensible Daten werden minimiert, verschlüsselt und mit enger Rechtevergabe verarbeitet.

### 2.5 Explainability
Alle Scores und Funde müssen in nachvollziehbare Ergebnisobjekte und menschlich lesbare Zusammenfassungen überführt werden.

## 3. Systemübersicht
### 3.1 Hauptkomponenten
**A. Frontend / Client Layer**
- Web-App für Endkunden
- Admin-/Backoffice-Oberfläche
- optional später mobile App

**B. API Layer**
- API Gateway / BFF
- Auth-Service
- Upload-Service
- Check-Service
- Workflow-Service
- Support-Service
- Removal-Service
- Admin-Service

**C. Analysis Layer**
- Leak Aggregator Service
- Provider Connector Runtime
- Risk Scoring Service
- Deepfake Image Analysis Service
- Deepfake Video Analysis Service
- Content Match Service
- Evidence Service

**D. Operations Layer**
- Case Management Service
- Support Queue Service
- Notification Service
- Reporting Service

**E. Data & Infra Layer**
- PostgreSQL
- Redis
- Message Queue
- Object Storage
- Secret Manager
- Search Index optional
- Metrics / Logs / Tracing

## 4. Referenzarchitektur
```text
[Web Client / Admin UI]
          |
          v
   [API Gateway / BFF]
          |
  -----------------------------
  |      |       |      |      |
  v      v       v      v      v
[Auth] [Checks] [Assets] [Cases] [Support]
          |       |       |       |
          |       |       |       v
          |       |       |   [Notifications]
          |       |       |
          v       v       v
   [Workflow] [Removal] [Admin]
          |
          v
   [Job Orchestrator / Queue]
          |
 -------------------------------------------------------
 |            |              |            |             |
 v            v              v            v             v
[Leak       [Image         [Video       [Content      [Risk
Aggregator] Analysis]      Analysis]    Match]        Scoring]
 |            |              |            |             |
 -------------------------------------------------------
                     |
                     v
              [PostgreSQL]
              [Object Storage]
              [Redis]
              [Audit / Events]
```

## 5. Komponenten im Detail
### Frontend
- Anliegenauswahl
- Leak-Check starten
- Bild/Video hochladen
- Quelle/URL melden
- Ergebnisse anzeigen
- Workflow-Schritte anzeigen
- Support anfragen
- Removal-Fall starten

### API Gateway / Backend-for-Frontend
- Routing der Frontend-Anfragen
- Auth-Prüfung
- Rate Limiting
- Input-Validierung
- Aggregation mehrerer Backend-Antworten für UI
- zentrale Fehlerbehandlung

### Check Service
- Eingang aller Prüfaufträge
- Validierung der Inputs
- Erzeugung von `checks`
- Start von Analysejobs
- Statusverfolgung
- Zusammenführen finaler Ergebnisse

### Upload / Asset Service
- sichere Dateiannahme
- MIME-Typ-Prüfung
- Virus-/Malware-Scan
- Hashing
- Speicherung im Object Storage
- Asset-Metadaten in DB

### Leak Aggregator Service
- Aufruf externer Leak-Provider
- Normalisierung der Ergebnisse
- Deduplizierung
- Fehler- und Timeout-Behandlung
- Rate-Limit-Beachtung
- Speicherung der Treffer

### Deepfake Image Analysis Service
- Extraktion technischer Bildmerkmale
- Modellinferenz für Manipulationswahrscheinlichkeit
- Metadatenanalyse
- Artefakt-Erkennung
- Vergleich mit perceptual hashes
- Ergebnisobjekt erzeugen

### Deepfake Video Analysis Service
- Frame-Extraktion
- Keyframe-Selektion
- Audio-/Video-Synchronitätsprüfung
- modellgestützte Deepfake-Analyse
- temporale Anomalieerkennung
- GPU-geeignete Worker
- Fortschrittsstatus für Nutzer

### Content Match Service
- Matching gegen bekannte Funde
- Reverse Match auf Basis Hash / perceptual hash / Fingerprints
- Verknüpfung mit vom Nutzer gemeldeten Quellen
- Erstellung von `content_matches`

### Risk Scoring Service
- Bewertung der Ergebnisse
- Vereinheitlichung von Score-Modellen
- Priorisierung für UI, Workflows und Support

### Workflow Service
- Auswahl eines passenden Workflows
- Erzeugung individueller Workflow-Instanzen
- Fortschritt pro Nutzer/Fall speichern
- Eskalation an Support ermöglichen

### Removal Service
- Erzeugung und Verwaltung von Removal-Cases
- Dokumentation einzelner Meldeschritte
- Verknüpfung zu Matches, Assets und Support
- Statusübergänge kontrollieren

### Support Service
- Support-Anfragen erfassen
- Queueing und Priorisierung
- Mitarbeiterzuweisung
- Status- und Kommunikationshistorie

### Admin Service
- Provider Registry verwalten
- Endpunkte verwalten
- Hilfetexte pflegen
- Workflows konfigurieren
- Feature Flags / Aktivierung von Quellen

## 6. Infrastrukturkonzept
### Laufzeitumgebung
- Containerisierte Services
- Kubernetes oder einfacher Start mit ECS / Docker Swarm / Nomad
- getrennte Worker Pools:
  - Standard Worker
  - GPU Worker für Videoanalyse
  - Provider Worker für API-Checks

### Persistenz
- PostgreSQL als Hauptdatenbank
- Object Storage für Bilder/Videos/Evidenz
- Redis für Cache, Job-Status, Locks
- optional OpenSearch/Elasticsearch für Suche im Backoffice

### Queue / Job Processing
- RabbitMQ, SQS oder Redis-basierte Queue
- Jobtypen:
  - leak_check_job
  - image_analysis_job
  - video_analysis_job
  - content_match_job
  - workflow_generation_job
  - removal_followup_job

### Monitoring / Observability
- strukturierte Logs
- Metriken
- Distributed Tracing
- Alarmierung bei Provider-Ausfällen oder Queue-Stau

## 7. Sicherheitskonzept
### Datenklassifizierung
**Hochsensibel**
- hochgeladene Medien
- Fund-URLs in Missbrauchsfällen
- Support-Nachrichten mit Kontext

**Sensibel**
- E-Mail, Telefonnummer, Username
- Leak-Ergebnisse
- Workflow-/Case-Daten

**Betriebsdaten**
- Provider-Metadaten
- Hilfetexte
- technische Logs ohne sensible Payloads

### Schutzmaßnahmen
- Transportverschlüsselung überall
- Verschlüsselung ruhender sensibler Daten
- getrennte Secrets-Verwaltung
- kurze Aufbewahrungsfristen für Rohanalysen
- signierte Download-URLs
- Audit-Logs für Admin- und Support-Zugriffe
- strikte Rollenrechte

### Passwort-Check
- niemals Klartext-Passwörter speichern
- Hash-/Prefix-Mechanismus
- nur notwendige Prüfdaten verarbeiten

## 8. Technologiestack Vorschlag
### Frontend
- Next.js
- TypeScript
- Tailwind oder vergleichbare UI-Basis

### Backend
- NestJS oder Fastify
- TypeScript

### Datenbank
- PostgreSQL

### Jobs / Queue
- Redis + BullMQ für schnellen Start
- später RabbitMQ / SQS möglich

### Storage
- S3-kompatibles Object Storage

### Auth
- Keycloak, Auth0 oder interne OIDC-Lösung

### AI / Analyse
- Python-basierte Worker für Deepfake-/Media-Modelle
- GPU-Worker für Videoanalyse

## 9. SQL-Schema
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('user', 'support', 'analyst', 'admin');
CREATE TYPE check_type AS ENUM ('leak_email', 'leak_username', 'leak_phone', 'leak_domain', 'password_hash', 'image', 'video', 'source_only');
CREATE TYPE check_status AS ENUM ('pending', 'queued', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE provider_category AS ENUM ('leak_api', 'web_checker', 'monitoring', 'removal', 'deepfake', 'utility');
CREATE TYPE provider_status AS ENUM ('active', 'inactive', 'deprecated');
CREATE TYPE auth_type_enum AS ENUM ('none', 'api_key', 'basic', 'oauth');
CREATE TYPE pricing_model_enum AS ENUM ('free', 'freemium', 'paid', 'enterprise');
CREATE TYPE asset_type AS ENUM ('image', 'video', 'document', 'other');
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE source_validation_status AS ENUM ('pending', 'validated', 'invalid', 'rejected');
CREATE TYPE removal_case_status AS ENUM ('open', 'preparing', 'submitted', 'under_review', 'followup_required', 'removed', 'partially_removed', 'rejected', 'closed');
CREATE TYPE support_request_status AS ENUM ('open', 'triaged', 'assigned', 'in_progress', 'waiting_user', 'resolved', 'closed');
CREATE TYPE support_request_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE workflow_instance_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE workflow_step_status AS ENUM ('pending', 'in_progress', 'completed', 'skipped', 'blocked');
CREATE TYPE job_status AS ENUM ('queued', 'running', 'succeeded', 'failed', 'dead_letter');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    password_hash TEXT,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'user',
    locale TEXT DEFAULT 'de',
    timezone TEXT DEFAULT 'Europe/Berlin',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    phone TEXT,
    preferred_contact TEXT,
    consent_version TEXT,
    consent_given_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category provider_category NOT NULL,
    website_url TEXT,
    api_available BOOLEAN NOT NULL DEFAULT FALSE,
    api_docs_url TEXT,
    auth_type auth_type_enum NOT NULL DEFAULT 'none',
    pricing_model pricing_model_enum NOT NULL DEFAULT 'free',
    notes TEXT,
    status provider_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE provider_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL UNIQUE REFERENCES providers(id) ON DELETE CASCADE,
    check_email BOOLEAN NOT NULL DEFAULT FALSE,
    check_username BOOLEAN NOT NULL DEFAULT FALSE,
    check_phone BOOLEAN NOT NULL DEFAULT FALSE,
    check_domain BOOLEAN NOT NULL DEFAULT FALSE,
    check_password_hash BOOLEAN NOT NULL DEFAULT FALSE,
    check_image BOOLEAN NOT NULL DEFAULT FALSE,
    check_video BOOLEAN NOT NULL DEFAULT FALSE,
    reverse_search BOOLEAN NOT NULL DEFAULT FALSE,
    removal_support BOOLEAN NOT NULL DEFAULT FALSE,
    monitoring_support BOOLEAN NOT NULL DEFAULT FALSE,
    raw_response_storage_allowed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE provider_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    endpoint_name TEXT NOT NULL,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    request_format JSONB,
    response_format JSONB,
    rate_limit TEXT,
    requires_user_agent BOOLEAN NOT NULL DEFAULT FALSE,
    requires_https BOOLEAN NOT NULL DEFAULT TRUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (provider_id, endpoint_name)
);

CREATE TABLE provider_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL,
    required BOOLEAN NOT NULL DEFAULT FALSE,
    hashed_only BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type check_type NOT NULL,
    status check_status NOT NULL DEFAULT 'pending',
    input_email TEXT,
    input_username TEXT,
    input_phone TEXT,
    input_domain TEXT,
    input_password_hash_prefix TEXT,
    input_asset_id UUID,
    risk_score INTEGER,
    severity severity_level,
    summary TEXT,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    asset_type asset_type NOT NULL,
    original_filename TEXT,
    storage_path TEXT NOT NULL,
    sha256 TEXT NOT NULL,
    perceptual_hash TEXT,
    mime_type TEXT,
    file_size_bytes BIGINT,
    duration_seconds NUMERIC,
    width INTEGER,
    height INTEGER,
    metadata_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (sha256)
);

ALTER TABLE checks
    ADD CONSTRAINT fk_checks_input_asset
    FOREIGN KEY (input_asset_id) REFERENCES assets(id) ON DELETE SET NULL;

CREATE TABLE check_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    check_id UUID NOT NULL REFERENCES checks(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    hit_found BOOLEAN NOT NULL DEFAULT FALSE,
    hit_type TEXT,
    breach_name TEXT,
    breach_date DATE,
    exposed_data JSONB,
    source_confidence NUMERIC(5,4),
    normalized_summary TEXT,
    raw_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE deepfake_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    check_id UUID REFERENCES checks(id) ON DELETE SET NULL,
    model_name TEXT NOT NULL,
    model_version TEXT,
    probability_fake NUMERIC(5,4),
    probability_manipulated NUMERIC(5,4),
    confidence NUMERIC(5,4),
    artifact_flags JSONB,
    face_count INTEGER,
    audio_video_sync_score NUMERIC(5,4),
    frame_anomalies JSONB,
    verdict TEXT,
    evidence_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_submitted_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    check_id UUID REFERENCES checks(id) ON DELETE SET NULL,
    source_type TEXT NOT NULL,
    source_url TEXT NOT NULL,
    source_domain TEXT,
    platform_name TEXT,
    page_title TEXT,
    notes TEXT,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    validation_status source_validation_status NOT NULL DEFAULT 'pending'
);

CREATE TABLE content_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    check_id UUID REFERENCES checks(id) ON DELETE SET NULL,
    submitted_source_id UUID REFERENCES user_submitted_sources(id) ON DELETE SET NULL,
    match_type TEXT NOT NULL,
    matched_url TEXT,
    platform_name TEXT,
    first_seen_at TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ,
    confidence NUMERIC(5,4),
    evidence_json JSONB,
    known_fake BOOLEAN NOT NULL DEFAULT FALSE,
    known_leak BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    submitted_by_user BOOLEAN NOT NULL DEFAULT FALSE,
    user_source_url TEXT,
    user_source_label TEXT,
    user_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE help_texts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_key TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    audience TEXT,
    trigger_type TEXT,
    language_code TEXT NOT NULL DEFAULT 'de',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    trigger_condition TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    requires_confirmation BOOLEAN NOT NULL DEFAULT FALSE,
    support_handover_possible BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workflow_id, step_order)
);

CREATE TABLE workflow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    check_id UUID REFERENCES checks(id) ON DELETE SET NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    removal_case_id UUID,
    status workflow_instance_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workflow_instance_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
    workflow_step_id UUID NOT NULL REFERENCES workflow_steps(id) ON DELETE RESTRICT,
    status workflow_step_status NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workflow_instance_id, workflow_step_id)
);

CREATE TABLE removal_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    match_id UUID REFERENCES content_matches(id) ON DELETE SET NULL,
    case_type TEXT NOT NULL,
    platform_name TEXT,
    target_url TEXT,
    legal_basis TEXT,
    status removal_case_status NOT NULL DEFAULT 'open',
    submitted_at TIMESTAMPTZ,
    last_update_at TIMESTAMPTZ,
    notes TEXT,
    workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
    support_requested BOOLEAN NOT NULL DEFAULT FALSE,
    support_request_status TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE workflow_instances
    ADD CONSTRAINT fk_workflow_instances_removal_case
    FOREIGN KEY (removal_case_id) REFERENCES removal_cases(id) ON DELETE SET NULL;

CREATE TABLE removal_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    removal_case_id UUID NOT NULL REFERENCES removal_cases(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    recipient TEXT,
    payload_summary TEXT,
    result_status TEXT,
    external_ticket_id TEXT,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    check_id UUID REFERENCES checks(id) ON DELETE SET NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    removal_case_id UUID REFERENCES removal_cases(id) ON DELETE SET NULL,
    request_type TEXT NOT NULL,
    priority support_request_priority NOT NULL DEFAULT 'medium',
    status support_request_status NOT NULL DEFAULT 'open',
    preferred_contact TEXT,
    message TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type TEXT NOT NULL,
    related_check_id UUID REFERENCES checks(id) ON DELETE CASCADE,
    related_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    status job_status NOT NULL DEFAULT 'queued',
    payload JSONB,
    error_message TEXT,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    template_key TEXT,
    subject TEXT,
    body TEXT,
    sent_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_checks_user_id ON checks(user_id);
CREATE INDEX idx_checks_status ON checks(status);
CREATE INDEX idx_checks_type ON checks(type);
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_check_results_check_id ON check_results(check_id);
CREATE INDEX idx_deepfake_results_asset_id ON deepfake_results(asset_id);
CREATE INDEX idx_user_submitted_sources_user_id ON user_submitted_sources(user_id);
CREATE INDEX idx_user_submitted_sources_check_id ON user_submitted_sources(check_id);
CREATE INDEX idx_content_matches_asset_id ON content_matches(asset_id);
CREATE INDEX idx_content_matches_check_id ON content_matches(check_id);
CREATE INDEX idx_removal_cases_user_id ON removal_cases(user_id);
CREATE INDEX idx_removal_cases_status ON removal_cases(status);
CREATE INDEX idx_support_requests_status ON support_requests(status);
CREATE INDEX idx_support_requests_priority ON support_requests(priority);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_related_check_id ON jobs(related_check_id);
CREATE INDEX idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```
