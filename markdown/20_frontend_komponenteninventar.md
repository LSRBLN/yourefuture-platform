# Frontend-Komponenteninventar

## 1. Ziel

Dieses Dokument definiert die wiederverwendbaren UI-Komponenten des Produkts.

Es dient als Grundlage für:
- Design-System-nahe Frontend-Entwicklung
- klare Wiederverwendung im Vibe-Coding-Tool
- konsistente UX zwischen Ergebnis-, Workflow-, Support- und Removal-Flows

---

## 2. Komponentenprinzipien

1. Komponenten sollen zustandsorientiert sein
2. sensible Inhalte brauchen eigene Warnkomponenten
3. Status und Schweregrad müssen visuell konsistent sein
4. API-Fehler und leere Zustände werden standardisiert dargestellt
5. Komponenten sollen mobil und desktopfähig sein

---

## 3. Foundation Components

## 3.1 Button
Varianten:
- primary
- secondary
- danger
- ghost
- link

Zustände:
- default
- loading
- disabled

## 3.2 Input
Für:
- Email
- Text
- Passwort
- Domain
- Telefon
- URL

Zustände:
- default
- focus
- error
- disabled

## 3.3 Textarea
Für:
- Notizen
- Support-Nachrichten
- Removal-Kommentare

## 3.4 Select
Für:
- Check-Typ
- Priorität
- Plattform
- Sprache
- Statusfilter

## 3.5 Checkbox / Consent Box
Für:
- Datenschutz-Einwilligung
- Bestätigung einzelner Schritte

---

## 4. Status- und Feedback-Komponenten

## 4.1 StatusBadge
Verwendung:
- Check Status
- Job Status
- Support Status
- Removal Status
- Workflow Step Status

## 4.2 SeverityBadge
Verwendung:
- low
- medium
- high
- critical

## 4.3 InfoBanner
Für:
- neutrale Hinweise
- technische Zwischeninformationen

## 4.4 WarningBanner
Für:
- sensible Inhalte
- Teilfehler
- Deepfake-/Leak-Warnungen

## 4.5 ErrorStateCard
Für:
- API-Fehler
- Berechtigungsfehler
- fehlgeschlagene Analysen

## 4.6 EmptyStateCard
Für:
- keine Checks
- keine Assets
- keine Support-Anfragen
- keine Removal-Fälle

---

## 5. Workflow- und Ergebnis-Komponenten

## 5.1 ResultSummaryCard
Zeigt:
- Überschrift
- Summary
- Risk Score
- Severity
- wichtigste nächste Schritte

## 5.2 ResultDetailAccordion
Zeigt:
- Provider-Details
- Breach-Details
- Analysehinweise
- technische Zusatzinformationen

## 5.3 RecommendedActionsCard
Zeigt:
- priorisierte nächste Schritte
- CTA-Buttons

## 5.4 WorkflowStepper
Zeigt:
- alle Workflow-Schritte
- Reihenfolge
- Status
- aktiven Schritt

## 5.5 WorkflowStepCard
Zeigt:
- Titel
- Beschreibung
- Hilfetext
- Schrittaktion
- optional Support-Handover-Hinweis

## 5.6 HelpTextBox
Zeigt:
- kontextsensitive Hilfe
- Einordnung
- Formulierung ohne Fachjargon

---

## 6. Asset- und Upload-Komponenten

## 6.1 UploadDropzone
Für:
- Bilder
- Videos

Zustände:
- leer
- drag active
- uploading
- success
- error

## 6.2 UploadConstraintsCard
Zeigt:
- erlaubte Dateitypen
- Größenlimits
- Hinweise zur Analysezeit

## 6.3 AssetPreviewCard
Für:
- Bildvorschau
- Video-Metadaten
- Dateiname
- Größe
- Erstellungsdatum

## 6.4 SensitiveContentGate
Für:
- sensible oder belastende Medien
- vorgeschaltete Bestätigung vor Ansicht

---

## 7. Case- und Support-Komponenten

## 7.1 SupportRequestCard
Zeigt:
- Anfrage-Typ
- Status
- Priorität
- Bezug auf Check / Asset / Case

## 7.2 RemovalCaseCard
Zeigt:
- Plattform
- Status
- letzte Änderung
- Ziel-URL gekürzt
- nächste sinnvolle Aktion

## 7.3 Timeline / ActivityFeed
Zeigt:
- Removal Actions
- Statuswechsel
- Support-Updates
- Workflow-Verlauf

## 7.4 InternalNoteBlock
Nur Backoffice:
- interne Notizen
- nicht für Endnutzer sichtbar

---

## 8. Listen- und Filter-Komponenten

## 8.1 FilterBar
Für:
- Status
- Typ
- Priorität
- Zeitraum

## 8.2 SearchBar
Für:
- Backoffice-Listen
- Provider
- Checks
- Fälle

## 8.3 ObjectTable
Vor allem Backoffice:
- Support Queue
- Removal Cases
- Provider-Liste
- Audit Logs

## 8.4 PaginationControls
Standardisierte Seitennavigation

---

## 9. Screen-spezifische Composite Components

## 9.1 IntakeActionGrid
Kachelraster für:
- Leak Check
- Bild Check
- Video Check
- Quelle melden
- Hilfe anfragen

## 9.2 CheckStatusPanel
Zeigt:
- Status
- Progress
- letzte Aktualisierung
- technische Teilinfos

## 9.3 MatchCard
Zeigt:
- Match-Typ
- Plattform
- URL
- knownFake / knownLeak
- CTA: Removal erstellen

## 9.4 SupportCTABox
Prominente Hilfe-Komponente:
- kurze Einordnung
- CTA „Persönliche Hilfe anfragen“

## 9.5 RemovalActionComposer
Für:
- neue Removal Action dokumentieren
- Empfänger
- Ergebnis
- Ticket-ID

---

## 10. Backoffice-Komponenten

## 10.1 QueueAssignmentPanel
Für:
- Support-Zuweisung
- Prioritätssteuerung

## 10.2 AuditLogTable
Für:
- Filterbare Audit-Daten
- Actor
- Aktion
- Entity
- Zeit

## 10.3 ProviderCapabilityMatrix
Für:
- Admin-Ansicht von Provider-Fähigkeiten

## 10.4 WorkflowTemplateEditor
Für:
- Schrittverwaltung
- Triggerlogik
- Aktivstatus

---

## 11. Komponentenbibliothek – Priorisierte Build-Reihenfolge

## Phase 1
- Button
- Input
- Textarea
- StatusBadge
- SeverityBadge
- ErrorStateCard
- EmptyStateCard

## Phase 2
- ResultSummaryCard
- HelpTextBox
- UploadDropzone
- UploadConstraintsCard
- CheckStatusPanel

## Phase 3
- WorkflowStepper
- WorkflowStepCard
- SupportCTABox
- MatchCard
- SupportRequestCard
- RemovalCaseCard

## Phase 4
- Timeline
- FilterBar
- ObjectTable
- QueueAssignmentPanel
- AuditLogTable
- WorkflowTemplateEditor

---

## 12. Fazit

Mit einem klaren Komponenteninventar kann das Vibe-Coding-Tool das Frontend wesentlich konsistenter generieren. Besonders wichtig sind standardisierte Status-, Ergebnis-, Upload-, Workflow- und Support-Komponenten.
