# PRD – Leak-Checker, Deepfake-Check & Removal Platform

## 1. Produktübersicht

### Produktname (Arbeitstitel)
TrustShield / Identity & Media Protection Platform

### Produktvision
Eine integrierte Schutzplattform, mit der Privatpersonen potenzielle Datenlecks, kompromittierte Accounts, geleakte personenbezogene Informationen, manipulierte Fotos, Deepfake-Videos sowie veröffentlichte Missbrauchsinhalte erkennen, bewerten und strukturiert beseitigen lassen können.

### Produktziel
Das Produkt soll aus verstreuten Einzellösungen ein durchgängiges Gesamtsystem machen:
- Datenleck-Prüfung
- Prüfung persönlicher Accounts und identitätsbezogener Funde
- Deepfake- und Medienmissbrauchserkennung
- Fundstellen-Erfassung durch den Kunden
- geführte Hilfe- und Reaktionsworkflows
- Lösch- und Eskalationsservice
- persönliche Unterstützung durch Mitarbeiter

### Kernnutzen
Für Endkunden:
- schnelle Erstprüfung, ob persönliche Daten oder Inhalte betroffen sind
- verständliche Einordnung der Ergebnisse
- konkrete nächste Schritte statt nur technischer Trefferlisten
- Hilfe bei emotional belastenden Fällen
- Möglichkeit, echte Unterstützung anzufordern

Für das Unternehmen:
- ein zentrales Plattformprodukt statt einzelner Services
- wiederverwendbare Connector-Architektur
- skalierbares Fallmanagement
- Differenzierung über Deepfake- und Removal-Fokus
- Grundlage für B2C-, B2B2C- und White-Label-Modelle

## 2. Problemdefinition

### Ausgangslage
Betroffene Menschen finden heute zwar einzelne Tools für Datenlecks oder einzelne Seiten für Missbrauchsmeldungen, aber der Prozess ist zersplittert:
- Leak-Checker zeigen oft nur, dass etwas gefunden wurde
- Ergebnisse sind schwer verständlich
- es fehlt eine Priorisierung nach Risiko
- selbst gefundene URLs oder Videos können selten sauber eingebunden werden
- Deepfake-Prüfung ist für Endnutzer kaum zugänglich
- nach dem Fund fehlt ein klarer Handlungsplan
- Unterstützung bei Löschung und Nachverfolgung ist meist manuell oder teuer

### Problem des Nutzers
Ein Nutzer fragt sich typischerweise:
- Sind meine Daten geleakt?
- Wurde mein Foto oder Video manipuliert?
- Ist ein Video von mir irgendwo veröffentlicht worden?
- Ist das echt oder ein Fake?
- Was soll ich jetzt konkret tun?
- Wer hilft mir persönlich?
- Wie bekomme ich Inhalte wieder gelöscht?

### Produktchance
Ein Produkt, das Erkennung, Erklärung, Workflow, Support und Removal bündelt, kann aus technischer Prüfung einen echten Schutzservice machen.

## 3. Ziele und Nicht-Ziele

### Produktziele
1. Nutzer sollen mit wenigen Eingaben prüfen können, ob personenbezogene Daten in Leaks auftauchen.
2. Nutzer sollen Bilder und Videos auf Manipulation, Deepfake-Indizien und Reuploads prüfen können.
3. Nutzer sollen eigene Fundstellen per URL, Plattformangabe oder Notiz einreichen können.
4. Nach jedem Fund soll automatisch ein passender Hilfe- und Reaktionsworkflow erzeugt werden.
5. Nutzer sollen persönliche Hilfe durch Mitarbeiter anfragen können.
6. Für Removal-Fälle soll ein strukturiertes Case-Management vorhanden sein.
7. Das System soll mehrere Quellen und APIs modular integrieren können.
8. Das Produkt soll verständlich, vertrauenswürdig und datensparsam sein.

### Nicht-Ziele in Version 1
- keine vollautomatische rechtliche Vertretung
- keine Garantie auf Löschung externer Inhalte
- keine forensische Gerichtsgutachten-Erstellung als Standardfunktion
- keine offene Plattform für beliebige Web-Crawling-Massenabfragen durch Endnutzer
- keine Identitätsprüfung über behördliche Register

## 4. Zielgruppen
### Primäre Zielgruppen
**1. Privatpersonen**
- vermuten Datenleck oder Account-Kompromittierung
- haben Angst vor Identitätsmissbrauch
- wollen prüfen, ob Bilder/Videos von ihnen missbraucht wurden
- benötigen verständliche Hilfe

**2. Opfer von Bild-/Video-Missbrauch**
- vermuten Deepfake-Inhalte
- haben geleakte intime oder private Inhalte entdeckt
- haben selbst verdächtige Fundstellen gefunden
- benötigen schnelle Eskalation und Unterstützung

### Sekundäre Zielgruppen
**3. Familien / Sorgeberechtigte**
- möchten für Angehörige oder Minderjährige Hinweise prüfen

**4. Versicherungen / Assistance-Partner / Member Benefits**
- möchten den Service eingebettet für Kunden anbieten

**5. Unternehmen / Creator / öffentliche Personen**
- benötigen Schutz vor Fake-Inhalten, Impersonation und Leak-Funden

## 5. User Personas
### Persona A – „Besorgte Privatnutzerin"
- wenig technisches Wissen
- will wissen, ob ihre E-Mail betroffen ist
- möchte einfache Sprache und klare Maßnahmen
- braucht Sicherheit und Orientierung

### Persona B – „Missbrauchsbetroffener Nutzer"
- hat ein Video oder Bild von sich gefunden
- ist unter Stress
- möchte sofort wissen: echt, fake, wo veröffentlicht, was tun
- will persönlichen Kontakt zu einem Mitarbeiter

### Persona C – „Power User / Analyst"
- kennt konkrete Quellen oder URLs
- will manuelle Fundstellen einreichen
- möchte strukturierte Resultate und Dokumentation

### Persona D – „Support-Mitarbeiter"
- bearbeitet eskalierte Fälle
- braucht Fallhistorie, Evidenz, Status, Priorität und Empfehlungen

## 6. Use Cases
### Leak-Check
- Nutzer gibt E-Mail-Adresse ein und erhält Treffer über mehrere Leak-Quellen.
- Nutzer prüft Username, Telefonnummer oder Domain.
- Nutzer prüft Passwort sicher über Hash-/Prefix-Mechanismus.
- Nutzer erhält Handlungsempfehlungen nach Schweregrad.

### Deepfake-Check
- Nutzer lädt ein Bild hoch und erhält Einschätzung zu Manipulationswahrscheinlichkeit.
- Nutzer lädt ein Video hoch und erhält Hinweise zu Deepfake-/Manipulationsmerkmalen.
- Nutzer lässt prüfen, ob zu einem Bild/Video bekannte Reuploads oder bekannte Fakes existieren.

### Eigene Quellen melden
- Nutzer hat selbst eine URL gefunden und meldet sie.
- Nutzer übergibt Seitenadresse, Plattform, Kontext und Notizen.
- Nutzer möchte, dass genau diese Fundstelle priorisiert geprüft wird.

### Workflow nach Fund
- Nach Treffer wird automatisch ein Maßnahmenplan erstellt.
- Nutzer sieht priorisierte Schritte wie Passwort ändern, 2FA aktivieren, Plattform melden, Löschanfrage starten.

### Persönliche Hilfe
- Nutzer fordert menschliche Unterstützung an.
- Support übernimmt den Fall oder begleitet einzelne Schritte.

### Removal
- Nutzer startet direkt aus einem Fund einen Removal-Fall.
- Plattform erstellt, verfolgt und dokumentiert Meldungen an Plattformen, Hoster oder andere Stellen.

## 7. Produktumfang
### 7.1 Hauptmodule
1. Onboarding & Fallaufnahme
2. Leak-Check
3. Deepfake-Foto-Check
4. Deepfake-Video-Check
5. Manuelle Quellenmeldung
6. Ergebnis- und Risikoauswertung
7. Hilfe- und Lerntexte
8. Workflow-Engine
9. Support-Anfrage / Mitarbeiterhilfe
10. Removal Center
11. Admin- und Backoffice
12. Provider- und Connector-Verwaltung

## 8. Funktionsanforderungen

### 8.1 Onboarding & Intake
**Ziel**
Nutzer sollen schnell, verständlich und vertrauenswürdig in den Prozess gelangen.

**Anforderungen**
- Startseite mit Auswahl des Anliegens:
  - Datenleck prüfen
  - Bild prüfen
  - Video prüfen
  - Fundstelle melden
  - Hilfe anfragen
- Kurze Hilfetexte je Einstiegspunkt
- optionaler Account oder Gastmodus für Erstprüfung
- Einwilligungs- und Datenschutzhinweise vor sensiblen Uploads
- Möglichkeit, mehrere Anliegen später in einem Fall zu bündeln

**Akzeptanzkriterien**
- Nutzer kann in weniger als 60 Sekunden einen Erstcheck starten.
- Nutzer versteht vor dem Upload, welche Daten verarbeitet werden.

### 8.2 Leak-Check Modul
**Unterstützte Eingaben**
- E-Mail-Adresse
- Username
- Telefonnummer
- Domain
- Passwortprüfung via Hash-Präfix

**Anforderungen**
- Aggregation mehrerer Leak-Provider
- Connectoren für HIBP, LeakCheck, DeHashed, BreachDirectory und weitere spätere Quellen
- Normalisierung heterogener API-Antworten
- Deduplizierung von Treffern
- Klassifizierung der exponierten Datentypen
- Berechnung eines Risikoscores
- Ergebnisanzeige in verständlicher Sprache
- Hilfetexte je Fundtyp
- automatische Folgeschritte je Trefferart

### 8.3 Deepfake-Foto-Check
- Bild-Upload
- Hashing und perceptual hashing
- Metadatenanalyse
- Manipulationsheuristiken
- Modellbasierte Klassifikation mit Wahrscheinlichkeiten
- Abgleich mit bekannten Matches/Reuploads
- Einbindung gemeldeter Nutzerquellen
- Bewertung: unauffällig / verdächtig / wahrscheinlich manipuliert / bekanntes Match gefunden

### 8.4 Deepfake-Video-Check
- Video-Upload oder URL-bezogene Prüfung
- Frame-Extraktion
- Audio-/Video-Konsistenzanalyse
- Gesichts- und Bewegungsheuristiken
- modellgestützte Erkennung
- Match-Engine für bekannte Videos / Reuploads / Hash-basierte Ähnlichkeiten
- Priorisierung vom Nutzer gemeldeter URLs
- Warnhinweise bei belastenden Inhalten
- Übergang in Removal-Workflow

### 8.5 Manuelle Quellenmeldung
- Eingabe von URL
- Eingabe von Plattform / Domain
- Eingabe von Fundkontext
- optionale Notizen
- optionaler Fundzeitpunkt
- Kennzeichnung, ob Quelle durch Nutzer eingereicht wurde
- Validierungsstatus der Quelle
- Priorisierung in Analyse und Removal
- Verknüpfung mit Asset, Match und Case

### 8.6 Hilfe- und Hilfetext-System
- kontextsensitive Hilfetexte an Formularen
- erklärende Infoboxen an Ergebnissen
- unterschiedliche Texte je Zielgruppe und Risikostufe
- mehrsprachige Struktur
- Trennung von statischen Hilfetexten und dynamisch generierten Empfehlungen
- Versionierbarkeit durch Admin/Content-Team

### 8.7 Workflow-Engine
- vordefinierte Workflow-Typen
- regelbasierte Auswahl anhand von Fundtyp, Schweregrad und Nutzerkontext
- Workflow-Schritte mit Status
- Schritte können automatisiert, manuell oder support-geführt sein
- Möglichkeit zur Eskalation an Mitarbeiter
- Dokumentation abgeschlossener Schritte

### 8.8 Persönliche Hilfe / Mitarbeiter-Support
- Button „persönliche Hilfe anfragen“ an zentralen Stellen
- Auswahl des Anliegens
- Freitext für Situation
- Priorisierung und Routing
- Backoffice-Zuweisung an Mitarbeiter
- Statusanzeige für den Nutzer
- optionale Kontaktpräferenz
- Verknüpfung mit Check, Asset und Removal-Fall

### 8.9 Removal Center
- Start eines Removal-Falls aus Fund/Meldung/Match
- Zuordnung von Plattform, URL, Asset und Rechtsgrundlage
- dokumentierte Aktionen
- Statusmodell für Fallfortschritt
- evidenzfähige Historie
- Unterstützung für Plattform-Meldung, Hoster-/Abuse-Kontakt, Deindexierungsanfrage
- Übergabe an Support

### 8.10 Admin- und Backoffice
- Provider-Verwaltung
- Aktivierung/Deaktivierung von Connectoren
- Hilfetext-Management
- Workflow-Management
- Support-Queue
- Fallübersicht und Filter
- manuelle Statusänderung
- Audit-Log
- Rollen und Rechte

## 9. Nicht-funktionale Anforderungen
### Sicherheit
- keine Speicherung von Klartext-Passwörtern
- verschlüsselte Speicherung sensibler Daten
- Secret Management für API-Keys
- rollenbasierte Zugriffe
- Audit Logging
- sichere Upload-Verarbeitung
- Malware-/Dateityp-Prüfung bei Uploads

### Datenschutz
- Datenminimierung
- transparente Einwilligung
- definierte Löschfristen
- Export-/Auskunftsfähigkeit
- Zweckbindung je Datentyp
- Möglichkeit zur Löschung eines Falles gemäß Richtlinie

### Performance
- Erst-UI-Antworten unter 2 Sekunden, soweit möglich
- asynchrone Verarbeitung für schwere Medienanalysen
- sichtbare Statusanzeige für laufende Prüfungen

### Skalierbarkeit
- modulare Connector-Architektur
- Queue-basierte Worker
- horizontal skalierbare Analysejobs

### Zuverlässigkeit
- Retry-Logik bei Providerfehlern
- Rate-Limit-Handling
- Provider-Timeouts mit Fallback-Logik
- Überwachung externer Abhängigkeiten

### Erklärbarkeit
- Nutzer sieht verständliche Zusammenfassung statt nur Scores
- sensible Ergebnisse werden mit Vorsichtssprache dargestellt
- Wahrscheinlichkeiten werden nicht als absolute Gewissheiten verkauft

## 10. Datenmodell auf Produktebene
### Kernobjekte
- User
- Check
- CheckResult
- Asset
- DeepfakeResult
- ContentMatch
- UserSubmittedSource
- Workflow
- WorkflowStep
- RemovalCase
- RemovalAction
- SupportRequest
- HelpText
- Provider
- ProviderEndpoint
- ProviderCapability

## 11. Rollen und Berechtigungen
### Endnutzer
- Checks starten
- Assets hochladen
- Quellen melden
- Ergebnisse sehen
- Workflows abarbeiten
- Support anfragen
- Removal-Fälle sehen

### Support-Mitarbeiter
- Fälle einsehen
- Support-Anfragen bearbeiten
- Fälle priorisieren
- Removal-Fälle betreuen
- interne Notizen erfassen

### Admin
- Provider verwalten
- Hilfetexte pflegen
- Workflows konfigurieren
- Rollen verwalten
- Reporting einsehen

### Analyst (optional)
- tiefere Auswertung von Evidenz und Matches
- Review von komplexen Deepfake-Fällen

## 12. UX- und UI-Anforderungen
- ruhige, vertrauenswürdige Oberfläche
- klare Sprache statt Fachjargon
- sichtbare Fortschrittsanzeige
- sensible Warnhinweise bei belastenden Inhalten
- eindeutige Primäraktionen
- mobile und Desktop-fähig

## 13. API- und Integrationsanforderungen
### Externe Provider
- HIBP API v3
- HIBP Pwned Passwords API
- LeakCheck
- DeHashed
- BreachDirectory / Logoutify
- weitere zukünftige Leak-/Monitoring-Quellen

### Interne Schnittstellen
- Check API
- Asset Upload API
- Analysis Job API
- Workflow API
- Support Request API
- Removal Case API
- Provider Registry API

## 14. Risiko- und Entscheidungslogik
### Risikoscore Leak-Check
- Anzahl Treffer
- Sensibilität exponierter Daten
- Aktualität
- Anzahl betroffener Dienste
- Vorhandensein von Passwort-/Telefon-/Adressdaten

### Risikoscore Media-/Deepfake-Check
- Modellscore
- Heuristik-Treffer
- bekannte Reuploads
- bekannte Missbrauchs-/Leak-Funde
- Nutzerbestätigung einer Fundquelle

### Eskalationslogik
Eine Support-Empfehlung oder automatische Priorisierung erfolgt bei:
- hoher Datenexposition
- privaten/intimen Inhalten
- potenziellen Deepfakes
- mehreren bestätigten Online-Fundstellen
- emotional oder rechtlich sensiblen Fällen

## 15. Reporting und KPIs
### Produkt-KPIs
- Anzahl gestarteter Checks
- Anzahl abgeschlossener Checks
- Trefferquote Leak-Checks
- Anteil Deepfake-/Manipulationsfunde
- Anzahl eingereichter Nutzerquellen
- Anzahl gestarteter Removal-Fälle
- Anzahl Support-Anfragen
- Time-to-First-Action
- Time-to-Support-Assignment
- Time-to-Removal-Submission
- Erfolgsquote entfernter Inhalte

## 16. Analytics-Events
- intake_started
- leak_check_started
- image_check_started
- video_check_started
- source_submitted
- result_viewed
- workflow_started
- workflow_step_completed
- support_requested
- removal_case_created
- removal_action_submitted

## 17. MVP-Umfang
### MVP muss enthalten
- Intake mit Anliegenauswahl
- Leak-Check für E-Mail, Username, Domain
- Provider Registry
- Ergebnis- und Risikodarstellung
- manuelle Quellenmeldung
- Foto-Check Grundversion
- Workflow-Generierung bei Fund
- Hilfetexte
- Support-Anfrage
- Removal-Fall-Erstellung
- Admin-Basisfunktionen

### Post-MVP
- Video-Check in voller Tiefe
- weitergehende Reupload-Suche
- mehrsprachige Content-Library
- SLA-/Prioritätsmodelle
- White-Label-Fähigkeit
- automatische Vorlagen für Meldungen
- erweiterte Analystenansicht

## 18. Phasenplan
### Phase 1 – Fundament
- Provider-Datenbank
- Leak-Check E-Mail / Username / Domain
- HIBP + LeakCheck + DeHashed + BreachDirectory
- normales Ergebnismodell + Risk-Score
- Hilfetexte und Erklärungen an relevanten Eingabestellen
- erste Handlungsempfehlungen je Trefferart
- geführter Basis-Workflow nach einem Fund

### Phase 2 – Foto-Check und Nutzerquellen
- Foto-Check als Hauptfeature
- Upload, Hashing, einfache Manipulationsanalyse
- bekannte Match-Funde speichern
- manuelle Eingabe einer Quelle durch den Kunden
- Eingabefelder für URL, Plattform, Fundkontext und Notizen
- Upload oder Verlinkung von selbst gefundenen Fotos/Quellen
- kontextsensitive Hilfetexte im Upload- und Prüffluss
- Workflow-Erstellung bei Bild-Fund mit klaren nächsten Schritten
- Möglichkeit, persönliche Hilfe durch einen Mitarbeiter anzufragen

### Phase 3 – Video-Check und Eskalation
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

### Phase 4 – Removal und Operations
- Löschdienst
- Case Management
- Plattform-Meldungen
- Host-/Abuse-Kontakte
- Statusverfolgung
- Workflow-Generator für Eskalation, Meldung und Nachverfolgung
- Hilfetexte für rechtliche, technische und organisatorische Schritte
- Übergabe an persönlichen Support oder Mitarbeiter-Bearbeitung

### Phase 5 – Reifegrad und Skalierung
- Optimierung der Deepfake-Modelle
- Automatisierte Priorisierung sensibler Fälle
- White-Label / Partnerfähigkeit
- Reporting und Ops-Dashboard
- A/B-Tests für Intake, Ergebnisdarstellung und Workflows

## 19. Offene Produktentscheidungen
1. Gastmodus vs. Pflicht-Account für bestimmte Funktionen
2. Welche Provider in welchem Tarifmodell verfügbar sind
3. Welche Deepfake-Modelle initial eingesetzt werden
4. Wie weit automatisierte Removal-Schritte rechtlich/operativ gehen sollen
5. Welche Antwortzeiten für Mitarbeiterhilfe angestrebt werden
6. Ob es einen Premium-/Assistance-Tier gibt
7. Welche Upload-Limits und Dateigrößen in MVP gelten

## 20. Risiken
### Produkt- und Vertrauensrisiken
- falsch-positive Deepfake-Ergebnisse
- falsch-negative Leak-/Match-Ergebnisse
- Überforderung von Nutzern durch belastende Inhalte
- Missverständnisse über die Aussagekraft von Wahrscheinlichkeiten

### Technische Risiken
- Abhängigkeit von externen APIs
- Qualität und Verfügbarkeit von Match-Datenquellen
- hohe Kosten von Videoanalyse

### Rechtliche/operative Risiken
- Umgang mit sensitiven personenbezogenen Daten
- Speicherung belastender Medien
- grenzüberschreitende Removal-Prozesse

## 21. Erfolgsdefinition
Das Produkt ist erfolgreich, wenn Nutzer nicht nur einen Fund sehen, sondern zuverlässig verstehen:
- ob sie betroffen sind
- wie schwer der Fund ist
- was sie als Nächstes tun sollten
- wie sie Hilfe bekommen
- wie ein Lösch- oder Schutzprozess konkret weitergeht
