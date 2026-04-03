# Frontend Screen Spec und User Flows

## 1. Ziel

Dieses Dokument definiert die Hauptscreens, Nutzerflüsse und UI-Zustände für das Produkt.

Es soll sicherstellen, dass das Frontend nicht nur funktional, sondern auch konsistent, erklärbar und belastbare Workflow-Übergänge bietet.

---

## 2. UX-Prinzipien

1. ruhige, vertrauenswürdige Oberfläche
2. klare Sprache statt Fachjargon
3. Hauptaktion pro Screen eindeutig sichtbar
4. sensible Hinweise bei belastenden Inhalten
5. Fortschritt und Status immer transparent
6. Hilfe und menschliche Unterstützung an den wichtigen Stellen sichtbar
7. mobil und desktopfähig

---

## 3. Informationsarchitektur

## Hauptnavigation für Endnutzer
- Dashboard / Start
- Checks
- Uploads / Assets
- Fundstellen / Quellen
- Workflows
- Support
- Removal Center
- Profil

## Hauptnavigation für Backoffice
- Dashboard
- Support Queue
- Removal Cases
- Checks
- Providers
- Help Texts
- Workflows
- Audit Logs

---

## 4. Screen Inventory – Endnutzer

## 4.1 Start / Intake Screen
### Ziel
Nutzer schnell in den richtigen Flow bringen.

### Inhalte
- Hero / Einleitung
- Auswahlkarten:
  - Datenleck prüfen
  - Bild prüfen
  - Video prüfen
  - Fundstelle melden
  - Persönliche Hilfe anfragen
- kurze Hilfetexte
- Datenschutz-/Verarbeitungshinweis
- Login / Gastmodus

### Primäre CTA
- „Check starten“
- „Quelle melden“
- „Hilfe anfragen“

### Zustände
- Standard
- nicht eingeloggt
- bereits bestehende Fälle vorhanden

---

## 4.2 Leak Check Form
### Inhalte
- Auswahl des Check-Typs
- Eingabefelder für E-Mail / Username / Domain / Telefon / Passwort-Präfix
- kontextuelle Hilfe
- Hinweis zur Datenverarbeitung
- Submit Button

### Fehlzustände
- ungültige Formate
- fehlende Pflichtfelder
- Rate Limit / temporäre Sperre

### Erfolg
- Weiterleitung auf Check-Status oder Ergebnis

---

## 4.3 Upload Screen – Bild
### Inhalte
- Datei-Upload Zone
- erlaubte Formate / Limits
- Hilfetext
- optionale Verknüpfung mit bestehendem Fall
- CTA „Bild prüfen“

### Zustände
- leer
- dragging
- uploading
- validation error
- upload success

---

## 4.4 Upload Screen – Video
### Inhalte
- Datei-Upload Zone
- Hinweis auf ggf. längere Analyse
- erlaubte Formate / Limits
- optionale Fundquelle verknüpfen
- CTA „Video prüfen“

### Zustände
- leer
- uploading
- queued
- analysing
- failed
- success

---

## 4.5 Quelle melden
### Inhalte
- URL-Feld
- Plattform
- optional Titel
- Notizen
- optional Asset-/Check-Verknüpfung
- Hilfetext: welche URL sinnvoll ist
- CTA „Quelle speichern“

### Zustände
- leer
- validation error
- success
- bereits mit Fall verknüpft

---

## 4.6 Check Status Screen
### Ziel
Zwischenzustände bei laufenden Jobs sichtbar machen.

### Inhalte
- Check-Typ
- Status-Indikator
- Progress/Stepper
- Hinweis, was gerade passiert
- Link zurück zu Dashboard
- ggf. Support-Hinweis bei Verzögerung

### Zustände
- pending
- queued
- running
- partial failure
- completed
- failed

---

## 4.7 Check Ergebnis – Leak
### Inhalte
- Ergebnis-Header mit Severity
- Summary
- Trefferanzahl
- betroffene Datentypen
- Provider-/Breach-Details in aufklappbaren Bereichen
- empfohlene Sofortmaßnahmen
- Hilfetext
- Workflow-Karte
- CTA:
  - „Workflow starten“
  - „Persönliche Hilfe anfragen“

### Zustände
- kein Treffer
- niedrige Schwere
- hohe Schwere
- Teilfehler bei Providern

---

## 4.8 Check Ergebnis – Bild / Deepfake
### Inhalte
- Ergebnis-Header
- Manipulationswahrscheinlichkeit
- erkannte Auffälligkeiten
- bekannte Matches
- verknüpfte Fundquellen
- Handlungsempfehlungen
- Workflow-Karte
- CTA:
  - „Removal-Fall erstellen“
  - „Persönliche Hilfe anfragen“

### Sensible Zustände
- belastender Fund
- wahrscheinlicher Fake
- bekannte Leak-Fundstelle erkannt

---

## 4.9 Check Ergebnis – Video
### Inhalte
- Ergebnis-Header
- Analysezusammenfassung
- Deepfake-/Manipulationshinweise
- Fundstellen / Matches
- gemeldete Quellen
- empfohlene Schritte
- Eskalationshinweis
- CTA:
  - „Removal-Fall erstellen“
  - „Support anfragen“

### Zustände
- längere Analyse abgeschlossen
- nur Teilanalyse möglich
- belastender Fund

---

## 4.10 Workflow Screen
### Inhalte
- Workflow-Header
- Schrittliste mit Status
- Detailpanel je Schritt
- Hilfetexte
- Abschlussmarkierung
- CTA:
  - „Schritt erledigt“
  - „Persönliche Hilfe anfragen“

### Zustände
- aktiver Workflow
- blockierter Schritt
- abgeschlossener Workflow

---

## 4.11 Support Request Form
### Inhalte
- Anliegen-Typ
- Priorität
- Kontaktpräferenz
- Nachricht
- Bezug zu Check / Asset / Removal-Fall
- CTA „Anfrage senden“

### Zustände
- neue Anfrage
- aus Ergebnis-Kontext vorausgefüllt
- Fehler
- Erfolg

---

## 4.12 Support Request Detail
### Inhalte
- Status
- Kontextobjekte
- eigene Nachricht
- Bearbeitungsstand
- ggf. weitere Hinweise

---

## 4.13 Removal Center – Liste
### Inhalte
- Liste eigener Removal-Fälle
- Status-Badges
- Plattform
- letzte Aktualisierung
- CTA „Fall öffnen“

### Filter
- offen
- in Bearbeitung
- entfernt
- abgelehnt

---

## 4.14 Removal Case Detail
### Inhalte
- Fall-Header
- Plattform / Ziel-URL
- Status
- zugehörige Fundstelle / Match
- Rechtsgrundlage
- Aktionshistorie
- Support-Bezug
- CTA:
  - „Aktion dokumentieren“
  - „Persönliche Hilfe anfragen“

---

## 4.15 Dashboard
### Inhalte
- letzte Checks
- offene Workflows
- offene Removal-Fälle
- offene Support-Anfragen
- zentrale Schnellaktionen

---

## 4.16 Profil / Einstellungen
### Inhalte
- Stammdaten
- Kontaktpräferenz
- Datenschutz-/Export-/Löschoptionen
- Sitzungen / Sicherheit später optional

---

## 5. Backoffice Screens

## 5.1 Admin Dashboard
- Metriken
- offene Support-Fälle
- offene Removal-Fälle
- Provider-Status
- Queue-/Job-Hinweise

## 5.2 Support Queue
- Liste offener Anfragen
- Priorität
- Zuweisung
- Filter nach Status

## 5.3 Support/Case Detail
- Nutzerkontext
- betroffene Objekte
- interne Notizen
- Statuswechsel
- Übergang zu Removal

## 5.4 Removal Operations Screen
- globale Removal-Liste
- Status und Plattformfilter
- Detailansicht mit Aktionshistorie

## 5.5 Providers Admin
- Provider-Liste
- Aktiv/Inactive
- Capabilities
- Endpunkte
- Teststatus später optional

## 5.6 Help Text Admin
- Kontextschlüssel
- Sprache
- Aktivstatus
- Editieransicht

## 5.7 Workflow Admin
- Template-Liste
- Schritte
- Aktivierungslogik

## 5.8 Audit Log Screen
- Zeitachse
- Actor
- Entity Type
- Action
- Filter

---

## 6. Leere, Fehler- und Sonderzustände

Für jeden Hauptscreen planen:

### Empty States
- noch keine Checks
- noch keine Uploads
- noch keine Fundstellen
- noch keine Removal-Fälle
- noch keine Support-Anfragen

### Error States
- API nicht erreichbar
- Upload fehlgeschlagen
- Analyse fehlgeschlagen
- Berechtigung fehlt
- Provider teilweise nicht verfügbar

### Sensitive States
- belastender Inhalt gefunden
- wahrscheinlicher Deepfake
- bekannte Leak-Fundstelle erkannt
- manuelle Eskalation empfohlen

---

## 7. Wiederverwendbare UI-Komponenten

Das Frontend sollte früh mit wiederverwendbaren Komponenten geplant werden:

- Status Badge
- Severity Badge
- Stepper / Workflow Progress
- Result Summary Card
- Help Text Box
- Sensitive Warning Banner
- Upload Dropzone
- Object Detail Card
- Timeline / Activity Feed
- Support CTA Card
- Empty State Card
- Error State Card

---

## 8. Wichtige User Flows

## Flow 1 – Leak Check
Start → Leak Check Form → Check Status → Ergebnis → Workflow → optional Support

## Flow 2 – Bildprüfung
Start → Bild Upload → Check Status → Deepfake Ergebnis → Match → Removal / Support

## Flow 3 – Video + eigene Quelle
Start → Quelle melden → Video Upload → Check Status → Ergebnis → Eskalation / Removal

## Flow 4 – direkter Hilfewunsch
Start → Support Request → Support Detail → optional verknüpfte Fälle

## Flow 5 – Match zu Removal
Ergebnis → Match Detail → Removal Case erstellen → Removal Detail → Aktionen / Support

---

## 9. Daraus abzuleitende nächste Artefakte

1. Wireframe-Satz
2. Komponenteninventar für Frontend
3. Route-Map
4. Frontend-State-Modell
5. Text-/Content-Matrix für Hilfetexte und Warnhinweise

---

## 10. Fazit

Die Plattform braucht kein generisches Dashboard-UI, sondern eine sehr klar geführte, statusorientierte und hilfeorientierte Oberfläche. Die Screens müssen insbesondere Übergänge zwischen Fund, Erklärung, Workflow, Support und Removal reibungslos abbilden.
