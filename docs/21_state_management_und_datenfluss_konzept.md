# State-Management- und Datenfluss-Konzept

## 1. Ziel

Dieses Dokument beschreibt, wie Daten im Frontend und zwischen Frontend und Backend fließen sollen.

Es dient als Grundlage für:
- Frontend-Architektur
- API-Anbindung
- Statusmodelle für asynchrone Checks
- stabile UI-Zustände im Vibe-Coding-Tool

---

## 2. Grundprinzipien

1. Server State und UI State klar trennen
2. Lang laufende Analysen dürfen UI nicht blockieren
3. Listen- und Detaildaten getrennt behandeln
4. Statusänderungen müssen vorhersagbar sein
5. Ownership-/RBAC-Fehler müssen explizit dargestellt werden

---

## 3. Empfohlene Frontend-State-Kategorien

## 3.1 Server State
Daten, die vom Backend kommen:
- aktueller Nutzer
- Checks
- Assets
- Results
- Sources
- Matches
- Workflows
- Support Requests
- Removal Cases
- Help Texts

Empfehlung:
- Query-Client / server-state library verwenden

## 3.2 UI State
Kurzlebige Zustände:
- geöffnete Modals
- aktive Tabs
- Formularzwischenstände
- Upload-Fortschritt
- lokale Filter
- ausgewählte Tabellenzeilen

## 3.3 Session State
- Auth Token / Session
- Nutzerrolle
- ggf. Feature Flags

---

## 4. Empfohlene Datenflussmuster

## 4.1 Leak Check Flow
1. Nutzer füllt Formular aus
2. `POST /checks`
3. Check-ID zurück
4. UI navigiert auf Statusscreen
5. Polling oder Revalidation auf `GET /checks/{id}`
6. bei `completed` Ergebnisse laden
7. Workflow und Help Texts laden
8. UI zeigt Summary + Aktionen

## 4.2 Asset Upload Flow
1. Nutzer wählt Datei
2. Upload startet
3. `POST /assets`
4. Asset-ID zurück
5. optional direkt `POST /checks` mit `assetId`
6. Statusscreen zeigt Queue-/Analysezustand
7. `GET /assets/{id}/deepfake-results`
8. `GET /assets/{id}/matches`

## 4.3 Source Submit Flow
1. Nutzer sendet Quelle
2. `POST /sources`
3. Quelle wird in Quellenliste sichtbar
4. optional neues Matching oder Check-Flow triggern

## 4.4 Removal Flow
1. Nutzer startet Removal Case
2. `POST /removal-cases`
3. Detailseite wird geöffnet
4. Aktionshistorie per `GET /removal-cases/{id}`
5. neue Aktionen via `POST /removal-cases/{id}/actions`

---

## 5. Query-Schlüssel / Datenbereiche

Beispielhafte Query Keys:

- `auth.me`
- `checks.list`
- `checks.detail.{id}`
- `checks.results.{id}`
- `assets.detail.{id}`
- `assets.deepfakeResults.{id}`
- `assets.matches.{id}`
- `sources.list`
- `sources.detail.{id}`
- `workflows.detail.{id}`
- `workflows.steps.{id}`
- `supportRequests.list`
- `supportRequests.detail.{id}`
- `removalCases.list`
- `removalCases.detail.{id}`
- `helpTexts.{context}.{lang}`

---

## 6. Caching-Strategie

## Kurzlebig / häufig revalidieren
- Check Status
- Job Status
- Workflow Steps bei aktiver Bearbeitung
- Support Request Status
- Removal Case Status

## Mittel
- Check Results
- Deepfake Results
- Matches
- Sources

## Länger
- Help Texts
- Provider-Metadaten
- Workflow Templates im Admin

---

## 7. Polling-Strategie für lange Jobs

Für:
- Check Status
- Job Status
- Videoanalyse
- Bildanalyse

Empfehlung:
- Polling alle 3-10 Sekunden je Status
- Stop bei `completed`, `failed`, `cancelled`
- Backoff bei längeren Videojobs
- sichtbarer „letzte Aktualisierung“-Zeitpunkt

Später optional:
- WebSockets / SSE für Push-Status

---

## 8. Formularstrategie

## Leak Check
- lokales Formularstate
- Validierung vor Submit
- Submit deaktiviert bei invalid state

## Upload
- lokaler Upload-Fortschritt
- serverseitige Bestätigung in Query-State

## Support / Removal / Sources
- Form-Submit mit Optimismus nur dort, wo risikoarm
- bei sensiblen Aktionen eher server-bestätigt statt zu optimistisch

---

## 9. Fehler- und Sonderzustände

Das Frontend braucht explizite Modellierung für:

- Validation Error
- Auth Error
- Forbidden / Ownership Error
- Not Found
- Partial Provider Failure
- Upload Failure
- Analysis Failure
- Queue Delay
- Sensitive Content Warning

---

## 10. Datenfluss-Regeln für Vibe Coding

1. niemals Serverdaten nur lokal spiegeln, wenn Query-State reicht
2. Listen- und Detail-Queries trennen
3. Mutationen müssen relevante Queries invalidieren
4. Statusscreens müssen robuster als Detailseiten sein
5. bei lang laufenden Jobs zuerst Status, dann Detaildaten laden
6. sensible Aktionen nicht rein optimistisch darstellen

---

## 11. Admin-/Backoffice-Datenfluss

Backoffice braucht:
- globale Listenqueries
- Filter-/Search-State lokal
- Detail-Ladezustände je Case
- Zuweisungs- und Statusmutationen
- Revalidation nach Assign/Statuswechsel
- Audit-Listen read-only, aber filterbar

---

## 12. Empfohlene direkte technische Entscheidungen

Vor Umsetzung festlegen:
1. welche Query-Library verwendet wird
2. ob Polling oder SSE im MVP
3. wie Upload-Fortschritt dargestellt wird
4. wie Feature Flags und Rollen im Frontend gelesen werden
5. wie sensible Medienzugriffe gated werden

---

## 13. Nächste Artefakte daraus

1. Frontend Route Map
2. Query-/Mutation-Katalog
3. Form-Validation-Regeln
4. Error-State-Matrix
5. Push-/Polling-Entscheidungsdokument

---

## 14. Fazit

Das Produkt braucht ein sehr statusorientiertes State-Modell, weil es viele asynchrone und sensible Prozesse enthält. Gute Trennung von Server State, UI State und Job-Status reduziert Fehler und macht AI-generierten Frontend-Code wesentlich stabiler.
