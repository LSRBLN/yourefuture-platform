# Leak-Checker + Deepfake-Check: Projektstruktur

## Ziel
Eine Software, die drei Hauptfunktionen bündelt:

1. **Leak Check**: Prüfung, ob E-Mail, Username, Telefonnummer, Domain oder Passwort in bekannten Datenlecks auftauchen.
2. **Deepfake Check**: Analyse von Bildern und Videos auf Hinweise für Manipulation, Deepfake-Erzeugung oder bekannte Reuploads.
3. **Removal / Löschdienst**: Wenn geleakte Inhalte, Fake-Bilder oder Fake-Videos gefunden werden, soll ein Lösch- und Meldeservice unterstützt werden.

---

## Kernmodule

### 1. Source Registry
Speichert alle Datenquellen, Provider, APIs, Web-Checker und deren Fähigkeiten.

**Beispiele:**
- Have I Been Pwned
- LeakCheck
- DeHashed
- BreachDirectory
- HPI Identity Leak Checker
- Mozilla Monitor
- Cybernews
- Bitdefender
- SCHUFA / Identitätsmissbrauch-Hinweise

### 2. Leak Aggregator
Abstraktionsschicht für alle Leak-Quellen.

**Aufgaben:**
- API-Key-Handling
- Request-Routing
- Normalisierung der Antworten
- Deduplizierung
- Risk-Scoring
- Rate-Limit-Handling
- Retry / Logging

### 3. Identity Check Engine
Führt Prüfungen aus für:
- E-Mail
- Username
- Telefonnummer
- Domain
- Passwort-Hash
- Name + Zusatzmerkmale (nur falls datenschutzrechtlich sauber umgesetzt)

### 4. Deepfake Engine
Haupttool der Software.

**Funktionen:**
- Foto-Check
- Video-Check
- Frame-basierte Analyse
- Reverse-Match / bekannte Fakes erkennen
- Prüfung, ob das Material bereits in Abuse-/Leak-/Mirror-Kontexten auftaucht
- Technische Heuristiken: Metadaten, Artefakte, Kompression, Inkonsistenzen, Gesichtssynchronität, Audio-Lip-Sync, Frame-Anomalien

### 5. Content Discovery
Sucht nach bekannten Kopien, Mirrors oder Reuploads.

**Ziel:**
- bekannte Fake-Bilder finden
- geleakte oder missbrauchte Videos finden
- Treffer aus Abuse- oder Leak-Kontexten markieren
- Quelle, Fundstelle, Zeitstempel und Beweissicherung dokumentieren

### 6. Removal Service
Workflow für Löschung, Meldung und Eskalation.

**Mögliche Ziele:**
- Plattform-Meldung
- DMCA-/Persönlichkeitsrechts-Meldung
- Hoster / Abuse Contact
- Suchmaschinen-Deindexierung
- Plattform-Take-down-Tracking
- Fallmanagement mit Statushistorie

---

## Datenmodell

### Tabelle: `providers`
Speichert Anbieter und Quellen.

| Feld | Typ | Beschreibung |
|---|---|---|
| id | uuid | Primärschlüssel |
| name | text | Anbietername |
| category | text | leak_api, web_checker, monitoring, removal, deepfake |
| website_url | text | Hauptseite |
| api_available | boolean | API vorhanden |
| api_docs_url | text | Doku-Link |
| auth_type | text | none, api_key, basic, oauth |
| pricing_model | text | free, freemium, paid, enterprise |
| notes | text | interne Hinweise |
| status | text | active, inactive, deprecated |
| created_at | timestamptz | Zeitstempel |
| updated_at | timestamptz | Zeitstempel |

### Tabelle: `provider_capabilities`
Was ein Anbieter prüfen kann.

| Feld | Typ |
|---|---|
| id | uuid |
| provider_id | uuid |
| check_email | boolean |
| check_username | boolean |
| check_phone | boolean |
| check_domain | boolean |
| check_password_hash | boolean |
| check_image | boolean |
| check_video | boolean |
| reverse_search | boolean |
| removal_support | boolean |
| monitoring_support | boolean |
| raw_response_storage_allowed | boolean |

### Tabelle: `provider_endpoints`
API-Endpunkte und technische Details.

| Feld | Typ |
|---|---|
| id | uuid |
| provider_id | uuid |
| endpoint_name | text |
| method | text |
| path | text |
| request_format | jsonb |
| response_format | jsonb |
| rate_limit | text |
| requires_user_agent | boolean |
| requires_https | boolean |
| active | boolean |

### Tabelle: `provider_fields`
Mapping der unterstützten Eingabefelder.

| Feld | Typ |
|---|---|
| id | uuid |
| provider_id | uuid |
| field_name | text |
| field_type | text |
| required | boolean |
| hashed_only | boolean |
| notes | text |

### Tabelle: `checks`
Ein einzelner Prüfauftrag.

| Feld | Typ |
|---|---|
| id | uuid |
| user_id | uuid |
| check_type | text |
| input_email | text |
| input_username | text |
| input_phone | text |
| input_domain | text |
| input_password_hash_prefix | text |
| input_asset_id | uuid |
| status | text |
| started_at | timestamptz |
| finished_at | timestamptz |
| risk_score | integer |
| summary | text |

### Tabelle: `check_results`
Normalisierte Ergebnisse je Quelle.

| Feld | Typ |
|---|---|
| id | uuid |
| check_id | uuid |
| provider_id | uuid |
| hit_found | boolean |
| hit_type | text |
| breach_name | text |
| breach_date | date |
| exposed_data | jsonb |
| source_confidence | numeric |
| normalized_summary | text |
| raw_reference | text |
| created_at | timestamptz |

### Tabelle: `assets`
Hochgeladene Bilder/Videos.

| Feld | Typ |
|---|---|
| id | uuid |
| user_id | uuid |
| asset_type | text |
| storage_path | text |
| sha256 | text |
| perceptual_hash | text |
| mime_type | text |
| duration_seconds | numeric |
| width | integer |
| height | integer |
| metadata_json | jsonb |
| created_at | timestamptz |

### Tabelle: `deepfake_results`
Analyseergebnisse für Medien.

| Feld | Typ |
|---|---|
| id | uuid |
| asset_id | uuid |
| model_name | text |
| model_version | text |
| probability_fake | numeric |
| probability_manipulated | numeric |
| confidence | numeric |
| artifact_flags | jsonb |
| face_count | integer |
| audio_video_sync_score | numeric |
| frame_anomalies | jsonb |
| verdict | text |
| created_at | timestamptz |

### Tabelle: `content_matches`
Bekannte Funde, Kopien, Mirrors, Reuploads.

| Feld | Typ |
|---|---|
| id | uuid |
| asset_id | uuid |
| match_type | text |
| matched_url | text |
| platform_name | text |
| first_seen_at | timestamptz |
| last_seen_at | timestamptz |
| confidence | numeric |
| evidence_json | jsonb |
| known_fake | boolean |
| known_leak | boolean |
| active | boolean |
| submitted_by_user | boolean |
| user_source_url | text |
| user_source_label | text |
| user_notes | text |

### Tabelle: `removal_cases`
Löschfälle und deren Status.

| Feld | Typ |
|---|---|
| id | uuid |
| user_id | uuid |
| asset_id | uuid |
| match_id | uuid |
| case_type | text |
| platform_name | text |
| target_url | text |
| legal_basis | text |
| status | text |
| submitted_at | timestamptz |
| last_update_at | timestamptz |
| notes | text |
| workflow_id | uuid |
| support_requested | boolean |
| support_request_status | text |

### Tabelle: `removal_actions`
Einzelne Aktionen in einem Löschfall.

| Feld | Typ |
|---|---|
| id | uuid |
| removal_case_id | uuid |
| action_type | text |
| recipient | text |
| payload_summary | text |
| result_status | text |
| external_ticket_id | text |
| performed_at | timestamptz |

### Tabelle: `help_texts`
Hilfetexte für Eingaben, Ergebnisse und nächste Schritte.

| Feld | Typ |
|---|---|
| id | uuid |
| context_key | text |
| title | text |
| body | text |
| audience | text |
| trigger_type | text |
| language_code | text |
| active | boolean |
| created_at | timestamptz |

### Tabelle: `workflows`
Vordefinierte oder dynamisch erzeugte Abläufe nach einem Fund.

| Feld | Typ |
|---|---|
| id | uuid |
| workflow_type | text |
| title | text |
| description | text |
| trigger_condition | text |
| active | boolean |
| created_at | timestamptz |

### Tabelle: `workflow_steps`
Einzelschritte eines Workflows.

| Feld | Typ |
|---|---|
| id | uuid |
| workflow_id | uuid |
| step_order | integer |
| step_type | text |
| title | text |
| description | text |
| requires_confirmation | boolean |
| support_handover_possible | boolean |

### Tabelle: `support_requests`
Anfragen für persönliche Hilfe durch einen Mitarbeiter.

| Feld | Typ |
|---|---|
| id | uuid |
| user_id | uuid |
| check_id | uuid |
| asset_id | uuid |
| removal_case_id | uuid |
| request_type | text |
| priority | text |
| status | text |
| preferred_contact | text |
| message | text |
| assigned_to | text |
| created_at | timestamptz |
| updated_at | timestamptz |

### Tabelle: `user_submitted_sources`
Vom Kunden selbst eingereichte Fundstellen.

| Feld | Typ |
|---|---|
| id | uuid |
| user_id | uuid |
| asset_id | uuid |
| source_type | text |
| source_url | text |
| source_domain | text |
| platform_name | text |
| page_title | text |
| notes | text |
| reported_at | timestamptz |
| validation_status | text |
| linked_match_id | uuid |

---

## Startbestand der Quellen

### Leak/APIs
- Have I Been Pwned
- LeakCheck
- DeHashed
- BreachDirectory

### Web-Checker ohne frei dokumentierte API
- HPI Identity Leak Checker
- Mozilla Monitor
- Cybernews Personal Data Leak Checker
- Bitdefender Digital Identity Protection

### Zusatzdienste
- SCHUFA / Identitätsbetrug
- Robinsonliste / I.D.I.
- ICANN Lookup / RIPE für Abuse-/Hoster-Recherche

### Deepfake / Media Abuse
- eigener Foto-Check
- eigener Video-Check
- Match-Engine für bekannte Fakes / Reuploads
- Removal-Service-Workflows

---

## Empfohlene Architektur

### Backend
- API Gateway
- Provider Connectors
- Queue für Checks
- Worker für Leak-Checks
- Worker für Deepfake-Analyse
- Worker für Content Discovery
- Worker für Removal-Fälle

### Storage
- relationale Datenbank für Metadaten
- Object Storage für Bilder/Videos und Beweise
- verschlüsselte Secret-Verwaltung für API-Keys

### Sicherheit
- keine Klartext-Passwörter speichern
- Passwortprüfungen nur per Hash-/Prefix-Verfahren
- Verschlüsselung für sensible Inputs
- kurze Aufbewahrungsfristen
- Audit-Logs
- Rollenrechte für Admin / Analyst / Nutzer

---

## MVP-Reihenfolge

### Phase 1
- Provider-Datenbank
- Leak-Check für E-Mail / Username / Domain
- HIBP + LeakCheck + DeHashed + BreachDirectory
- normales Ergebnismodell + Risk-Score
- Hilfetexte und Erklärungen an allen relevanten Eingabestellen
- erste Handlungsempfehlungen je nach Trefferart
- geführter Basis-Workflow nach einem Fund

### Phase 2
- Foto-Check als Hauptfeature
- Upload, Hashing, einfache Manipulationsanalyse
- bekannte Match-Funde speichern
- manuelle Eingabe einer Quelle durch den Kunden
- Eingabefelder für URL, Plattform, Fundkontext und Notizen
- Upload oder Verlinkung von selbst gefundenen Fotos/Quellen
- kontextsensitive Hilfetexte im Upload- und Prüffluss
- Workflow-Erstellung bei Bild-Fund mit klaren nächsten Schritten
- Möglichkeit, persönliche Hilfe durch einen Mitarbeiter anzufragen

### Phase 3
- Video-Check
- Frame-Extraktion
- Audio-/Video-Konsistenz
- Reupload- / Leak-Finder
- manuelle Meldung eines selbst gefundenen Videos durch den Kunden
- Eingabe von Video-URL, Seitenadresse, Plattform und Fundzeitpunkt
- Priorisierung von Nutzer-Hinweisen in der Analysepipeline
- Hilfetexte zur richtigen Eingabe und Einordnung von Funden
- geführter Workflow bei bestätigtem oder wahrscheinlichem Video-Fund
- Anfrage an persönlichen Support / Mitarbeiterhilfe direkt aus dem Ergebnis

### Phase 4
- Löschdienst
- Case Management
- Plattform-Meldungen
- Host-/Abuse-Kontakte
- Statusverfolgung
- Workflow-Generator für Eskalation, Meldung und Nachverfolgung
- Hilfetexte für rechtliche, technische und organisatorische Schritte
- Übergabe an persönlichen Support oder Mitarbeiter-Bearbeitung

---

## Produktlogik

### Leak-Check Ergebnis
- Trefferanzahl
- betroffene Datentypen
- Schweregrad
- empfohlene Sofortmaßnahmen
- passende Hilfetexte
- automatischer Folge-Workflow nach Trefferart
- Button für persönliche Hilfe anfragen

### Deepfake Ergebnis
- Fake-Wahrscheinlichkeit
- Manipulationsart
- bekannte Kopien gefunden ja/nein
- bekannte Leak-/Abuse-Funde ja/nein
- vom Kunden eingereichte Quelle geprüft ja/nein
- Übereinstimmung mit gemeldeter URL oder Fundstelle
- Handlungsempfehlung
- passender Hilfetext zur Einordnung
- geführter Workflow bei Fund
- Anfrage auf persönliche Hilfe möglich

### Removal Ergebnis
- wo gemeldet
- Status offen / eingereicht / in Prüfung / entfernt / abgelehnt
- Referenz auf vom Kunden gemeldete URL
- nächster sinnvoller Schritt
- Hilfetext für aktuelle Phase
- Eskalation an Mitarbeiter möglich

---

## Nächste Umsetzungsartefakte

1. SQL-Schema
2. OpenAPI-Struktur für das Backend
3. Connector-Spezifikation pro Provider
4. UI-Struktur für Leak Check / Deepfake Check / Removal Center
5. Datenschutz- und Aufbewahrungskonzept
