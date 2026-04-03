# API-Testfallkatalog pro Endpoint

## 1. Ziel

Dieses Dokument definiert konkrete API-Testfälle für die wichtigsten MVP-Endpunkte.

Es dient als Grundlage für:
- automatisierte API-Tests
- Integrations- und E2E-Tests
- Review von AI-generiertem Code
- Release Gates

---

## 2. Testfall-Konvention

Jeder Testfall enthält:
- Endpoint
- Testname
- Voraussetzung
- Request
- Erwartetes Ergebnis
- Negative Cases
- Security-/Ownership-Aspekt

---

## 3. Auth

## POST `/api/v1/auth/register`

### Testfall: erfolgreiche Registrierung
**Voraussetzung**
- E-Mail existiert noch nicht

**Request**
- valide E-Mail
- valides Passwort
- optional voller Name

**Erwartet**
- Status 200 oder 201
- User-Objekt vorhanden
- Token vorhanden
- Passwort wird nicht zurückgegeben

### Testfall: ungültige E-Mail
**Erwartet**
- 400 Validation Error

### Testfall: zu kurzes Passwort
**Erwartet**
- 400 Validation Error

### Testfall: doppelte Registrierung
**Erwartet**
- 409 oder definierter Fehlercode

---

## POST `/api/v1/auth/login`

### Testfall: erfolgreiches Login
**Erwartet**
- Token und Refresh Token
- User-Rolle enthalten

### Testfall: falsches Passwort
**Erwartet**
- 401

### Testfall: unbekannte E-Mail
**Erwartet**
- 401 oder definierter Auth-Fehler

---

## GET `/api/v1/auth/me`

### Testfall: eigener Nutzer mit gültigem Token
**Erwartet**
- 200
- korrekte User-ID
- korrekte Rolle

### Testfall: kein Token
**Erwartet**
- 401

---

## 4. Checks

## POST `/api/v1/checks`

### Testfall: Leak Check Email erfolgreich
**Request**
```json
{
  "type": "leak_email",
  "input": {
    "email": "user@example.com"
  }
}
```

**Erwartet**
- 201
- Check wird angelegt
- Status ist `pending` oder `queued`
- Job wird erzeugt

### Testfall: Bildcheck mit Asset-ID
**Erwartet**
- 201
- Check referenziert Asset
- Typ `image`

### Testfall: fehlender Input für Check-Typ
**Erwartet**
- 400 Validation Error

### Testfall: ungültige Asset-ID
**Erwartet**
- 400 oder 404, je nach Validierungslogik

### Testfall: User nutzt fremde Asset-ID
**Erwartet**
- 403 oder 404
- kein Check angelegt

---

## GET `/api/v1/checks`

### Testfall: eigener Check erscheint in Liste
**Erwartet**
- 200
- eigener Check enthalten

### Testfall: fremder Check erscheint nicht
**Erwartet**
- nur eigene Checks sichtbar

### Testfall: Filter nach Status
**Erwartet**
- nur passende Checks enthalten

---

## GET `/api/v1/checks/{checkId}`

### Testfall: eigener Check abrufbar
**Erwartet**
- 200
- korrekte Details

### Testfall: fremder Check nicht abrufbar
**Erwartet**
- 403 oder 404

### Testfall: ungültige UUID
**Erwartet**
- 400

---

## GET `/api/v1/checks/{checkId}/results`

### Testfall: Ergebnisse eines abgeschlossenen Checks
**Erwartet**
- 200
- Liste von `CheckResultResponse`

### Testfall: Ergebnisse bei laufendem Check
**Erwartet**
- leere Liste oder definierter Zwischenstatus

### Testfall: fremde Check-Ergebnisse
**Erwartet**
- 403 oder 404

---

## POST `/api/v1/checks/{checkId}/rerun`

### Testfall: eigenen Check erneut starten
**Erwartet**
- neuer Job wird erzeugt
- Status 200 oder 202

### Testfall: fremden Check rerun
**Erwartet**
- 403 oder 404

---

## 5. Assets

## POST `/api/v1/assets`

### Testfall: erlaubtes Bild hochladen
**Erwartet**
- 201
- Asset-Datensatz
- Hash gesetzt

### Testfall: unerlaubter Dateityp
**Erwartet**
- 400 oder 415

### Testfall: Datei zu groß
**Erwartet**
- 413 oder definierter Fehler

### Testfall: Upload ohne Auth
**Erwartet**
- 401

---

## GET `/api/v1/assets/{assetId}`

### Testfall: eigenes Asset
**Erwartet**
- 200

### Testfall: fremdes Asset
**Erwartet**
- 403 oder 404

---

## GET `/api/v1/assets/{assetId}/deepfake-results`

### Testfall: Ergebnisliste vorhanden
**Erwartet**
- 200
- gültige Analyseobjekte

### Testfall: Asset ohne Analyse
**Erwartet**
- leere Liste

### Testfall: fremdes Asset
**Erwartet**
- 403 oder 404

---

## 6. Sources

## POST `/api/v1/sources`

### Testfall: gültige Quelle anlegen
**Request**
```json
{
  "sourceType": "video_url",
  "sourceUrl": "https://example.com/video/123"
}
```

**Erwartet**
- 201
- Quelle gespeichert
- Validation Status = pending

### Testfall: ungültige URL
**Erwartet**
- 400

### Testfall: Quelle mit eigenem Asset verknüpfen
**Erwartet**
- 201
- Asset-Link vorhanden

### Testfall: Quelle mit fremdem Asset verknüpfen
**Erwartet**
- 403 oder 404

---

## GET `/api/v1/sources`

### Testfall: nur eigene Quellen sichtbar
**Erwartet**
- 200
- keine fremden Quellen

---

## 7. Matches

## GET `/api/v1/matches/{matchId}`

### Testfall: Match im eigenen Fallkontext
**Erwartet**
- 200

### Testfall: fremder Match ohne Berechtigung
**Erwartet**
- 403 oder 404

---

## 8. Workflows

## GET `/api/v1/workflows/{workflowInstanceId}`

### Testfall: eigene Workflow-Instanz lesen
**Erwartet**
- 200

### Testfall: fremde Workflow-Instanz lesen
**Erwartet**
- 403 oder 404

---

## PATCH `/api/v1/workflows/{workflowInstanceId}/steps/{stepId}`

### Testfall: eigenen Schritt abschließen
**Request**
```json
{
  "status": "completed",
  "notes": "Passwort geändert"
}
```

**Erwartet**
- 200
- Status aktualisiert

### Testfall: Schritt fremder Instanz aktualisieren
**Erwartet**
- 403 oder 404

### Testfall: ungültiger Status
**Erwartet**
- 400

---

## 9. Support Requests

## POST `/api/v1/support-requests`

### Testfall: Support-Anfrage erfolgreich
**Erwartet**
- 201
- Status = open

### Testfall: Bezug auf eigenen Check
**Erwartet**
- Verknüpfung gespeichert

### Testfall: Bezug auf fremden Check
**Erwartet**
- 403 oder 404

---

## GET `/api/v1/support-requests`

### Testfall: nur eigene Support-Anfragen
**Erwartet**
- 200
- nur eigene Einträge

---

## PATCH `/api/v1/admin/support-requests/{supportRequestId}`

### Testfall: Admin oder Support aktualisiert Status
**Erwartet**
- 200
- Status geändert

### Testfall: normaler User nutzt Admin-Endpoint
**Erwartet**
- 403

---

## 10. Removal Cases

## POST `/api/v1/removal-cases`

### Testfall: Removal-Fall direkt anlegen
**Erwartet**
- 201
- Status = open

### Testfall: Fall aus eigenem Match
**Erwartet**
- Verknüpfung gespeichert

### Testfall: Fall aus fremdem Match
**Erwartet**
- 403 oder 404

---

## GET `/api/v1/removal-cases`

### Testfall: nur eigene Fälle sichtbar
**Erwartet**
- 200
- keine fremden Fälle

---

## GET `/api/v1/removal-cases/{caseId}`

### Testfall: eigener Fall
**Erwartet**
- 200

### Testfall: fremder Fall
**Erwartet**
- 403 oder 404

---

## 11. Help Texts

## GET `/api/v1/help-texts`

### Testfall: Hilfetexte nach Kontext laden
**Erwartet**
- 200
- nur passende Kontexte

### Testfall: Sprachfilter
**Erwartet**
- richtige Sprache oder definierter Fallback

---

## 12. Jobs

## GET `/api/v1/jobs/{jobId}`

### Testfall: eigener Job im eigenen Check-Kontext
**Erwartet**
- 200

### Testfall: fremder Job
**Erwartet**
- 403 oder 404

---

## 13. Admin

## GET `/api/v1/admin/dashboard`

### Testfall: Admin darf Dashboard lesen
**Erwartet**
- 200

### Testfall: User darf Dashboard nicht lesen
**Erwartet**
- 403

---

## POST `/api/v1/admin/providers`

### Testfall: Admin legt Provider an
**Erwartet**
- 201

### Testfall: Support oder User versucht Provider anzulegen
**Erwartet**
- 403

---

## 14. Security-Pflichttests

1. Broken Object Level Authorization auf allen `{id}` Endpunkten
2. Rollenprüfung auf `/admin/*`
3. Upload-Dateitypvalidierung
4. Upload-Größenlimit
5. keine Secrets in Fehlern
6. keine fremden Workflow- oder Removal-Objekte sichtbar
7. Replay/Mehrfachabsenden sensibler Requests sauber behandeln

---

## 15. Release-Gate für MVP

Vor MVP-Release müssen mindestens grün sein:
- Auth Happy Path
- Leak Check Happy Path
- Asset Upload Happy Path
- Source Submit Happy Path
- Support Request Happy Path
- Removal Case Happy Path
- Admin Provider Auth Test
- mindestens 1 Broken-Ownership-Test pro Domäne
