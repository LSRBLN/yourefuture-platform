# TrustShield Master PRD

## Version

- Dokumenttyp: Master Product Requirements Document
- Produkt: TrustShield
- Scope: Phase 1
- Status: Working PRD / Delivery Baseline
- Stand: 2026-04-01

## 1. Executive Summary

TrustShield ist eine datenschutzkritische Protection-Plattform für Privatpersonen und betreuende Teams, die Datenlecks, Identitätsmissbrauch, Deepfake- und Medienmissbrauch, manuell gefundene Fundstellen sowie daraus entstehende Removal- und Support-Fälle in einem einzigen System zusammenführt.

Das Produkt ersetzt keinen einzelnen Leak-Checker oder einzelnen Abuse-Report-Workflow, sondern bündelt:

- Intake und Fallaufnahme
- Leak- und Quellenerkennung
- Bild- und Video-bezogene Missbrauchs- bzw. Deepfake-Prüfung
- Review Queue mit Human-in-the-Loop
- Removal Case Management
- Support- und Eskalationspfade
- Audit, Retention und Datenschutz by Design

Phase 1 soll kein vollständiges Forensik- oder Legal-Tech-System liefern, sondern eine belastbare, produktionsnahe Plattformbasis mit echten Kernflows, echter Persistenz, RBAC, Queue/Worker, sicherer Upload-Kette und einer Alexandria-konformen, ruhigen Premium-Oberfläche.

## 2. Produktvision

TrustShield soll für Betroffene und Service-Teams die führende Schutzoberfläche für Identitäts- und Medienmissbrauch werden: verständlich für Endnutzer, belastbar für Operations und datensparsam im Kern.

Die North-Star-Erfahrung ist:

- eine ruhige, vertrauenswürdige Aufnahme des Problems
- schnelle Einordnung statt roher technischer Trefferlisten
- nachvollziehbare Priorisierung
- ein klarer Maßnahmenpfad
- die Option auf menschliche Unterstützung und Removal

## 3. Problem Statement

Heute ist der Schutz gegen Leak-, Fake- und Missbrauchsszenarien fragmentiert:

- Leak-Checker zeigen nur Treffer, aber kaum Handlungskontext
- manuell gefundene URLs oder Inhalte verschwinden aus dem Prozess
- Medienmissbrauch, Deepfake, Reupload und Plattform-Removal laufen in getrennten Welten
- Support-Teams arbeiten oft in Ticketsystemen ohne belastbares Fachmodell
- sensible Daten werden zu häufig unnötig breit gespeichert
- Nutzer in Stresssituationen bekommen zu wenig Orientierung

TrustShield löst dieses Problem, indem es technische Funde, Nutzer-Meldungen, Review, Support und Removal in eine durchgängige Fall- und Maßnahmenlogik verbindet.

## 4. Zielbild

In Phase 1 soll TrustShield folgende Kernfähigkeit besitzen:

1. Ein Nutzer kann einen Check, eine Quelle, einen Upload oder ein Removal-Anliegen starten.
2. Das System speichert den Vorgang persistent und sicher.
3. Daraus werden echte Jobs, Review-Items und Folgeaktionen erzeugt.
4. Backoffice und Support sehen dieselben fachlichen Objekte wie die Nutzeroberfläche.
5. Removal-Fälle lassen sich nachvollziehbar anlegen, weiterführen und auditieren.
6. Retention, Ownership, RBAC und Upload-Sicherheit sind nicht nachträglich, sondern strukturell eingebaut.

## 5. Produktziele

### Primäre Ziele

- Ein einheitliches Intake für Check, Source, Support und Removal bereitstellen.
- Echte, persistente Kernobjekte für Checks, Sources, Assets, Reviews, Evidence, Support und Removal Cases etablieren.
- Den Nutzer von der Erkennung bis zur Handlung führen.
- Human-in-the-Loop-Prozesse produktionsnah abbilden.
- Datenschutz-, Retention- und Ownership-Anforderungen von Beginn an erzwingen.

### Sekundäre Ziele

- Mehrere Provider und Analysepfade später modular anbinden können.
- B2C und betreute Service-Modelle unterstützen.
- Eine robuste Basis für White-Label- oder Partner-Distribution schaffen.

## 6. Nicht-Ziele für Phase 1

- Keine vollautomatische juristische Vertretung
- Keine garantierte externe Löschung
- Keine vollständige forensische Beweissicherung für Gerichtsgutachten
- Kein offenes Massen-Crawling durch beliebige Endnutzer
- Kein globales Monitoring sämtlicher Plattformen in Echtzeit
- Kein vollwertiges CRM oder universelles Ticket-System jenseits des TrustShield-Fallmodells

## 7. Zielgruppen

### Primäre Nutzergruppen

- Privatpersonen mit Verdacht auf Datenleck oder Identitätsmissbrauch
- Betroffene von Bild-, Video- oder Deepfake-Missbrauch
- Nutzer mit konkreten selbst gefundenen URLs oder Missbrauchsfunden

### Operative Nutzergruppen

- Support Agents
- Reviewer / Analysts
- Admins / Operations Leads

### Sekundäre Zielgruppen

- Versicherungen, Assistance-Partner, Membership-Programme
- Creator, Personen mit öffentlicher Sichtbarkeit, kleine Teams

## 8. Personas

### 8.1 Besorgte Privatnutzerin

- niedrige technische Vorkenntnisse
- hohes Bedürfnis nach Orientierung
- erwartet ruhige, klare Sprache
- will wissen: "Bin ich betroffen?" und "Was jetzt?"

### 8.2 Belasteter Medienmissbrauchs-Betroffener

- emotional unter Druck
- sucht schnelle, verlässliche Handlung
- braucht sichere Uploads und klare Eskalation
- will nicht mit technischen Details überfordert werden

### 8.3 Power User / dokumentierender Betroffener

- kommt mit konkreten URLs, Notizen und Kontext
- möchte Fälle strukturiert erfassen
- erwartet Nachvollziehbarkeit und Präzision

### 8.4 Support Agent

- benötigt Fallhistorie, Status, Priorität, Ownership und nächste Aktion
- darf nur notwendige Daten sehen
- arbeitet SLA- und audit-orientiert

### 8.5 Reviewer / Analyst

- bewertet Funde, Quellensignale, Evidenz und Eskalationen
- braucht Queue, Filter, Priorisierung, Evidence-Zugriff und Entscheidungen

## 9. Produktprinzipien

- Privacy by Design vor Komfortgewinn
- Keine unnötige Klartextspeicherung sensibler Inhalte
- Eine fachliche Quelle der Wahrheit für Status und Objekte
- UI zeigt nicht nur Daten, sondern den nächsten sinnvollen Schritt
- Jede sensible Aktion braucht Ownership, Audit oder beides
- Kein Mock-first-Verhalten in produktiven Pfaden

## 10. UX- und Brand-Prinzipien

TrustShield folgt der Alexandria-Richtung:

- ruhige, premiumhafte, editoriale Darstellung
- Noto Serif für Autorität, Inter für Klarheit
- keine aggressive UI, keine laute Fehlerästhetik
- klare visuelle Hierarchie über Flächen und Abstände statt harter Linien
- ein primärer Fokus je Screen
- belastende Situationen werden nicht sensationalisiert

## 11. Scope Phase 1

### Enthalten

- Web-App für Nutzer
- Admin-/Backoffice-Oberfläche
- API mit versionierter `/api/v1`-Fläche
- Persistente Kernobjekte in Postgres/Drizzle
- Queue/Worker-Basis mit BullMQ/Redis
- Sichere Asset-Upload-Kette
- Review Queue
- Removal Center
- Support Requests
- Health, Readiness, OpenAPI, grundlegende Tests

### Nicht enthalten

- Vollständige Provider-Abdeckung aller geplanten Integrationen
- komplexe Zahlungs- oder Billing-Logik
- Mobile Apps
- fortgeschrittene Team-/Mandantenfunktionen über Basis-Tenant-Claims hinaus

## 12. Kernjobs to be done

- "Hilf mir schnell festzustellen, ob ich betroffen bin."
- "Hilf mir zu verstehen, wie schlimm der Fund ist."
- "Hilf mir, eine konkrete Fundstelle sicher einzureichen."
- "Hilf mir, ein Bild oder Video sicher prüfen zu lassen."
- "Hilf mir, aus einem Fund einen echten Maßnahmenpfad zu machen."
- "Hilf mir, menschliche Unterstützung einzuschalten."
- "Hilf meinem Team, Fälle priorisiert und nachvollziehbar zu bearbeiten."

## 13. End-to-End Kernflows

### 13.1 Check Flow

1. Nutzer startet Check
2. API validiert Request
3. Check wird persistiert
4. optional verknüpfte Sources werden angelegt
5. Check-Job wird enqueued
6. Folgeobjekte wie Review-Items werden erzeugt
7. Ergebnisse werden in UI und Backoffice sichtbar

### 13.2 Upload Flow

1. Nutzer fordert Upload-Intent an
2. System erstellt Asset im Status `pending_upload`
3. Quarantäne-Upload-Vertrag wird erzeugt
4. Upload wird abgeschlossen
5. Scan-/Promote-Jobs werden enqueued
6. Worker aktualisiert Asset-Status
7. Asset wird erst nach erfolgreicher Sicherheitsprüfung analysierbar

### 13.3 Manual Source Flow

1. Nutzer meldet URL/Quelle
2. Source wird validiert und gespeichert
3. Quelle wird einem Check oder Fall zugeordnet
4. Review-/Removal-Kontext kann daraus entstehen

### 13.4 Support Flow

1. Nutzer fragt persönliche Hilfe an
2. Support Request wird gespeichert
3. Triage-Job wird enqueued
4. optional wird Review-Arbeit erzeugt
5. Support Agent kann zuweisen, Status wechseln, Verlauf dokumentieren

### 13.5 Review Flow

1. Fachobjekte erzeugen Review-Items
2. Reviewer sehen Queue mit Filtern und Priorisierung
3. Review-Detail zeigt Kontext und Evidence
4. Entscheidungen beeinflussen nächste Aktion, Support oder Removal

### 13.6 Removal Flow

1. Removal Case wird angelegt
2. Evidence Snapshot wird verknüpft
3. `removal.submit`-Job wird erstellt
4. Worker aktualisiert Removal-Status
5. Aktionen und Provider-Kommunikation werden dokumentiert
6. Nutzer und Backoffice sehen denselben fachlichen Verlauf

## 14. Fachliches Domänenmodell

### Checks

- repräsentieren eine Prüfung oder Untersuchung
- haben Typ, Input, Status, Owner, Risiko, verknüpfte Sources, Reviews und Removals

### Sources

- repräsentieren Fundstellen oder Quellen
- können vom Nutzer manuell kommen oder aus Prozessen entstehen

### Assets

- repräsentieren hochgeladene oder referenzierte Medienobjekte
- durchlaufen Sicherheits- und Analysephasen

### Review Items

- repräsentieren menschlich zu prüfende Arbeit
- sind priorisierbar, zuweisbar und entscheidungsfähig

### Evidence Snapshots

- sind momentbezogene Evidenzstände
- verbinden Review, Removal und Quellendokumentation

### Support Requests

- repräsentieren menschliche Unterstützungsfälle
- besitzen Assignment-, Status- und Audit-Historie

### Removal Cases

- repräsentieren externe Lösch- oder Plattformmaßnahmen
- enthalten Actions, Status, Review-Status, Evidence und nächsten Schritt

### Jobs

- repräsentieren technische Arbeitseinheiten
- koppeln API, Worker und Betriebsbeobachtung

## 15. Funktionsanforderungen

### 15.1 Onboarding und Intake

- mehrere Einstiege nach Anliegen
- verständliche Datenschutzhinweise
- klarer Scope vor sensiblen Uploads
- optional zunächst gastnaher Einstieg, aber mit sauberer Ownership-Logik

### 15.2 Leak-Check

- strukturierte Eingabe für leak-relevante Parameter
- providerfähige Normalisierung
- Risikobewertung
- verständliche Handlungsempfehlungen

### 15.3 Bild-/Video-bezogene Prüfung

- sichere Uploads
- Asset Lifecycle mit Quarantäne
- anschließende Analysepfade
- Übergang in Review oder Removal möglich

### 15.4 Quellenmeldung

- URL, Plattform, Titel, Notizen, Kontext
- Validierungsstatus
- verknüpfbar mit Check, Asset oder Removal

### 15.5 Review Queue

- Listen- und Detailansicht
- Filter auf Status, Priorität, SLA-Risiko, Coverage, Zuweisung
- Review-Entscheidungen
- Ownership/RBAC

### 15.6 Removal Center

- Fallübersicht
- Fall-Detail
- Action-Historie
- Provider-Kommunikationsfortschritt
- nächste empfohlene Aktion

### 15.7 Support

- Anlegen
- Triage
- Assignment
- Statusübergänge
- klare Historie und Retention

### 15.8 Admin/Backoffice

- Queue-Überblick
- Review- und Support-Metriken
- operative Fallansicht
- keine globale Einsicht ohne passende Rolle

## 16. Nicht-funktionale Anforderungen

### 16.1 Security

- keine öffentlichen sensitiven Asset-URLs
- presigned/vertraglich begrenzte Uploads
- Quarantäne vor Promote
- MIME-/Hash-/Malware-Kontrollen
- RBAC und Ownership auf allen sensitiven Ressourcen
- Request IDs und standardisierte Fehler

### 16.2 Datenschutz

- Datenminimierung
- `retention_until` auf relevanten Objekten
- Cleanup-Jobs
- evidenzielle Speicherung nur mit Zweckbindung
- Auditierbarkeit ohne unnötige PII-Exposition

### 16.3 Performance

- UI-first Response für Create-Flows durch Queue-Modell
- keine blockierenden Long-Running-Prozesse im Request
- skalierbare Worker-Trennung nach Queue-Typ

### 16.4 Reliability

- Health und Readiness
- Jobstatus-Writeback
- Failure-Pfade
- Wiederholungen mit Backoff

### 16.5 Observability

- strukturierte Logs
- Request IDs
- Job-Topologie
- Queue- und DB-Abhängigkeitssignale

## 17. Rollen und Berechtigungen

### User

- eigene Checks, Sources, Assets, Support Requests, Removal Cases lesen und anlegen
- keine Einsicht in fremde Fälle oder operative Queues

### Support Agent

- Support lesen, zuweisen und Status führen
- eingeschränkte Removal-/Source-/Check-Sicht je Fallkontext

### Reviewer

- Review Queue lesen und bearbeiten
- relevante kontextuelle Fälle sehen

### Admin

- operative Vollsicht im Scope der Plattform
- Queue- und Job-Topologie
- privilegierte Security-/Asset-Aktionen

### Service

- technische Systemrolle für Worker- und interne Pfade

## 18. Datenmodell-Anforderungen

Jedes relevante Kernobjekt braucht mindestens:

- `id`
- `owner_user_id` sofern nutzerbezogen
- `created_at`
- `updated_at`
- `retention_until` sofern datenschutzrelevant

Kritische Beziehungen:

- Check -> Sources
- Check -> Review Items
- Check -> Removal Cases
- Source -> Asset optional
- Support Request -> Check/Asset/Removal optional
- Review Item -> Check/Support/Removal/Evidence
- Removal Case -> Evidence Snapshot + Actions
- Job -> Resource Reference

## 19. API-Anforderungen

- alle produktiven Routen unter `/api/v1`
- Request-/Response-Verträge validiert
- OpenAPI erzeugbar
- standardisierte Fehlerstruktur mit `requestId`
- 401/403/404/409/413/415/429 explizit

Phase-1-Pflichtendpunkte:

- `auth/*`
- `users/me`
- `health`, `health/live`, `health/ready`
- `checks`
- `sources`
- `assets`
- `support-requests`
- `reviews`
- `evidence-snapshots`
- `removal-cases`
- `jobs`
- `intake/orchestrator`

## 20. Architekturvorgaben

- Frontend: Next.js App Router, TypeScript, Tailwind, Alexandria-Richtung
- Backend: NestJS
- ORM/DB: Drizzle + Postgres
- Queue: BullMQ + Redis
- Storage: S3-kompatibel
- Validation: Zod-basierte Verträge
- Tests: Unit, Contract, grundlegende E2E

## 21. Erfolgsmetriken

### Produktmetriken

- Zeit bis zum Start eines Erstchecks
- Completion Rate von Intake-Flows
- Anteil von Fällen mit klarer nächster Aktion
- Support-Anfrage-Conversion in relevanten Stresspfaden
- Removal-Case-Anlage aus relevanten Funden

### Operative Metriken

- Queue-Backlog nach Typ
- durchschnittliche Triage-Zeit
- Review-SLA-Einhaltung
- Anteil erfolgreicher Job-Durchläufe
- Fehlerquote auf sensitiven Upload-/Action-Pfaden

### Sicherheits-/Privacy-Metriken

- Anteil korrekt gelöschter Retention-Kandidaten
- Anzahl unerlaubter Zugriffversuche
- Anteil Assets mit vollständigem Security-Lifecycle

## 22. Akzeptanzkriterien Phase 1

Phase 1 gilt als fertig, wenn:

- alle Kernflows auf echter Persistenz laufen
- NestJS der kanonische API-Pfad ist
- keine relevanten produktiven Mockpfade mehr aktiv sind
- Queue/Worker echte Statusrückschreibung leisten
- Review Queue und Removal Center echte Fachobjekte zeigen
- Uploads sicher durch Quarantäne- und Promote-Lifecycle laufen
- RBAC, Ownership und Retention strukturell greifen
- Typecheck, API-Tests und grundlegende Builds grün sind

## 23. Risiken

- zu hohe Hybridlast zwischen Legacy- und Zielpfaden
- zu frühe UI-Optimierung ohne Backend-Tiefe
- unklare Ownership bei Support/Review/Removal
- unzureichende PII-Minimierung
- Storage/Upload-Sicherheit nur teilweise produktiv
- falsche Priorisierung zwischen Provider-Integration und Plattformfundament

## 24. Offene Punkte

- finaler Clerk-/OIDC-Cutover
- echter S3-SigV4-Adapter
- vollständiger Redis/BullMQ-Produktivpfad
- weitere E2E-Abdeckung gegen reale DB/Redis-Laufzeit
- mögliche spätere Partner-/Mandantenmodelle

## 25. Delivery-Empfehlung

Ab jetzt sollte jede größere Produktentscheidung gegen dieses PRD geprüft werden:

- stärkt sie einen Kernflow?
- stärkt sie Privacy, Ownership oder Review-/Removal-Tiefe?
- reduziert sie Hybrid-/Mock-Last?
- macht sie den Nutzerpfad klarer oder nur die Oberfläche hübscher?

Wenn die Antwort überwiegend nein ist, gehört sie nicht in Phase 1.
