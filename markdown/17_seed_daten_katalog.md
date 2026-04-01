# Seed-Daten-Katalog

## 1. Ziel

Dieses Dokument definiert die initialen Seed-Daten, die für Entwicklung, Demo, QA und produktiven Start benötigt werden.

Es dient als Grundlage für:
- Datenbank-Seeds
- Demo- und Testumgebungen
- Backoffice-Betriebsstart
- stabile Vibe-Coding-Generierung

---

## 2. Seed-Kategorien

1. Rollen und Basisnutzer
2. Provider-Stammdaten
3. Provider-Capabilities
4. Hilfetexte
5. Workflow-Templates
6. Workflow-Schritte
7. Demo- und Testdaten
8. Notification Templates
9. Basis-Konfigurationswerte

---

## 3. Rollen und Basisnutzer

## 3.1 Basisnutzer
Für Dev/Staging sollten mindestens diese Seed-Accounts existieren:

- `admin@example.local`
- `support@example.local`
- `analyst@example.local`
- `user@example.local`

### Felder
- email
- password hash
- role
- locale
- timezone
- is_active

---

## 4. Provider-Stammdaten

Folgende Provider sollten initial als Seeds angelegt werden:

### Technische Leak-Provider
- Have I Been Pwned
- HIBP Pwned Passwords
- LeakCheck
- DeHashed
- BreachDirectory / Logoutify

### Web-/Referenzquellen
- HPI Identity Leak Checker
- Mozilla Monitor
- Cybernews Leak Checker
- Bitdefender Digital Identity Protection

### Follow-up / Hilfsquellen
- SCHUFA Identitätsbetrug
- Robinsonliste / I.D.I.
- ICANN Lookup
- RIPE Database

### Seed-Felder
- name
- category
- website_url
- api_available
- api_docs_url
- auth_type
- pricing_model
- notes
- status

---

## 5. Provider-Capabilities Seeds

Für jeden Provider initial pflegen:
- check_email
- check_username
- check_phone
- check_domain
- check_password_hash
- check_image
- check_video
- reverse_search
- removal_support
- monitoring_support
- raw_response_storage_allowed

---

## 6. Hilfetext-Seeds

Es sollten mindestens für diese Kontexte Starttexte existieren:

### Intake
- `intake.leak_check`
- `intake.image_check`
- `intake.video_check`
- `intake.source_submit`
- `intake.support_request`

### Formulare
- `form.email_input`
- `form.username_input`
- `form.domain_input`
- `form.password_hash_input`
- `form.image_upload`
- `form.video_upload`
- `form.source_url`
- `form.support_message`

### Ergebnisse
- `result.leak.none`
- `result.leak.low`
- `result.leak.high`
- `result.image.clean`
- `result.image.suspicious`
- `result.image.likely_manipulated`
- `result.video.pending`
- `result.video.suspicious`
- `result.match.known_fake`
- `result.match.known_leak`

### Workflows / Hilfe
- `workflow.leak.next_steps`
- `workflow.image.next_steps`
- `workflow.video.next_steps`
- `workflow.removal.next_steps`
- `support.request.explainer`

### Sensible Warnhinweise
- `warning.sensitive_content`
- `warning.manual_review_recommended`
- `warning.partial_provider_failure`

---

## 7. Workflow-Template-Seeds

Mindestens diese Templates sollten initial vorhanden sein:

1. Leak Fund – Low Severity
2. Leak Fund – High Severity
3. Image Suspicious
4. Image Known Fake Match
5. Video Suspicious
6. Video Known Leak Match
7. Removal Case Standard
8. Support Escalation

### Seed-Felder
- workflow_type
- title
- description
- trigger_condition
- active

---

## 8. Workflow-Schritt-Seeds

Beispiel für `Leak Fund – High Severity`:
1. Passwort ändern
2. 2FA aktivieren
3. betroffene Dienste prüfen
4. ggf. Bonitäts-/Identitätsprüfung
5. persönliche Hilfe anfragen

Beispiel für `Image Known Fake Match`:
1. Fund dokumentieren
2. Quelle prüfen
3. Removal-Fall starten
4. Support anfragen
5. Verlauf nachverfolgen

Beispiel für `Removal Case Standard`:
1. Zielplattform prüfen
2. Meldung vorbereiten
3. Aktion absenden
4. Status nachverfolgen
5. ggf. Eskalation starten

---

## 9. Notification Template Seeds

Mindestens vorbereiten:
- `support_request_created`
- `support_request_assigned`
- `support_request_status_changed`
- `check_completed`
- `check_failed`
- `removal_case_created`
- `removal_case_status_changed`
- `workflow_assigned`

### Felder
- template_key
- channel
- subject_template
- body_template
- active

---

## 10. Basis-Konfigurationswerte

Als seedbare oder konfigurierbare Defaults festlegen:

- max image upload size
- max video upload size
- supported mime types
- default check page size
- default retention bucket names
- rate-limit standard
- support escalation threshold
- sensitive case threshold
- default locale
- default timezone

---

## 11. Demo-/QA-Daten

Für lokale und Staging-Umgebungen sinnvoll:
- Beispiel-Checks
- Beispiel-Assets ohne echte sensible Inhalte
- Beispiel-Matches
- Beispiel-Workflows
- Beispiel-Support-Fälle
- Beispiel-Removal-Fälle

Wichtig:
- keine echten geleakten personenbezogenen Daten
- keine echten belastenden Medien
- nur sichere synthetische Testdaten

---

## 12. Seed-Implementierungsreihenfolge

1. Rollen / Nutzer
2. Provider
3. Provider-Capabilities
4. Hilfetexte
5. Workflow-Templates
6. Workflow-Schritte
7. Notification Templates
8. Demo-/QA-Daten

---

## 13. Daraus abzuleitende Dateien

1. `seed-providers.ts`
2. `seed-help-texts.ts`
3. `seed-workflows.ts`
4. `seed-notifications.ts`
5. `seed-demo-data.ts`

---

## 14. Fazit

Gute Seeds beschleunigen nicht nur Dev und QA, sondern helfen dem Vibe-Coding-Tool, realistischere und konsistentere Features gegen vorhandene Produktobjekte zu bauen.
