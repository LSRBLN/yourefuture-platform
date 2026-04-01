# Error-State-Matrix

## 1. Ziel

Dieses Dokument beschreibt die Fehlerzustände, Sonderzustände und empfohlene UX-/Systemreaktionen für das Produkt.

Es dient als Grundlage für:
- Frontend-Fehlerdarstellung
- API-Fehlerbehandlung
- State-Management
- QA und E2E-Tests
- konsistente AI-generierte UI

---

## 2. Grundprinzipien

1. technische Fehler nicht roh an Nutzer ausgeben
2. Ownership- und Berechtigungsfehler konsistent behandeln
3. Teilfehler bei Providern explizit kennzeichnen
4. sensible Fehlerzustände mit handlungsorientierter Hilfe kombinieren
5. Wiederholbare und nicht wiederholbare Fehler unterscheiden

---

## 3. Fehlerkategorien

## A. Validation Errors
Beispiele:
- ungültige E-Mail
- fehlerhafte URL
- fehlender Pflichtwert
- ungültiger Enum-Wert

## B. Auth Errors
Beispiele:
- kein Token
- Token abgelaufen
- ungültige Session

## C. Authorization / Ownership Errors
Beispiele:
- fremder Check
- fremdes Asset
- unzulässiger Admin-Zugriff

## D. Not Found
Beispiele:
- nicht existierende UUID
- bereits gelöschtes Objekt

## E. Upload Errors
Beispiele:
- Dateityp nicht erlaubt
- Datei zu groß
- Scan fehlgeschlagen
- Storage-Fehler

## F. Analysis / Job Errors
Beispiele:
- Analyse fehlgeschlagen
- Job hängt
- Queue-Problem
- Provider Timeout

## G. Partial Failures
Beispiele:
- ein Provider ausgefallen
- Matches unvollständig
- Videoanalyse nur teilweise erfolgreich

## H. Sensitive States
Beispiele:
- belastender Fund
- potenzieller Deepfake
- bekannte Leak-Fundstelle

---

## 4. Matrix nach Fehlertyp

| Fehlerzustand | Backend-Code | UI-Reaktion | CTA | Logging/Audit |
|---|---|---|---|---|
| Validation Error | 400 | Feldfehler anzeigen | Eingabe korrigieren | normal log |
| Unauthorized | 401 | Login-Hinweis / Redirect | erneut anmelden | auth log |
| Forbidden | 403 | neutrale Fehlseite | zurück zur Übersicht | security log |
| Not Found | 404 | neutrales nicht gefunden | zurück zur Liste | normal log |
| Duplicate Conflict | 409 | verständlicher Hinweis | vorhandenes Objekt prüfen | normal log |
| Unsupported Media Type | 415 | Upload-Fehler | andere Datei wählen | upload log |
| Payload Too Large | 413 | Größenhinweis | kleinere Datei wählen | upload log |
| Rate Limit | 429 | Wartehinweis | später erneut versuchen | abuse/rate log |
| Provider Partial Failure | 200/206/derived | Teilhinweis im Ergebnis | trotzdem Ergebnis lesen | provider log |
| Job Failure | 500/derived state | Analyse fehlgeschlagen | erneut versuchen / Support | worker log |
| Storage Failure | 500 | Upload fehlgeschlagen | erneut versuchen | infra log |
| Sensitive Match | success + warning | Warning Banner | Support / Removal | audit if viewed |

---

## 5. Screen-spezifische Fehler

## 5.1 Leak Check Form
- Feldvalidierung
- Rate Limit
- temporäre Provider-Unverfügbarkeit
- generischer Submit-Fehler

## 5.2 Upload Screen
- Dateitypfehler
- Größenlimit
- Netzwerkunterbrechung
- Storage-Fehler
- Quarantäne-/Scan-Fehler

## 5.3 Check Status Screen
- Job hängt
- Job fehlgeschlagen
- Teilanalyse
- Polling-Fehler

## 5.4 Ergebnis-Screens
- Teilfehler bei Providern
- Ergebnis fehlt trotz abgeschlossenem Check
- sensible Warnung
- Ownership-Fehler nach Sessionwechsel

## 5.5 Backoffice
- fehlende Berechtigung
- Zuweisungskonflikt
- veralteter Status / parallele Änderung
- Audit-Log Ladefehler

---

## 6. UX-Regeln pro Fehlerklasse

## Validation
- inline anzeigen
- technisch präzise, aber verständlich
- kein globaler Blocker wenn nur ein Feld fehlerhaft

## Auth
- möglichst sauberer Redirect
- Session-Verlust verständlich erklären

## Forbidden
- keine sensitiven Hinweise verraten
- kein Leaken der Existenz, wenn Policy neutral 404 bevorzugt

## Not Found
- neutraler Empty-/Error-State
- Link zurück zur Übersicht

## Partial Failure
- Ergebnis nicht verstecken
- klar markieren, dass Abdeckung unvollständig sein kann

## Sensitive State
- zuerst Einordnung
- dann Handlungsmöglichkeiten
- Support-CTA sichtbar

---

## 7. Retry-Regeln

## Nutzerseitig wiederholbar
- Leak Check Submit bei temporärem Fehler
- Upload bei Netzwerk-/Storage-Fehler
- Job Refresh / Polling
- Support Submit bei transientem Fehler

## nicht automatisch sofort wiederholen
- wiederholte Removal Actions
- Support-Mehrfachabsendung
- gleiche Uploads ohne Nutzerbestätigung
- stark limitierte Providerfehler

---

## 8. API-Fehlerformat

Alle API-Fehler sollten auf das Standardformat gemappt werden:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Die Eingabe ist ungültig.",
    "details": [
      {
        "field": "email",
        "message": "Ungültiges Format"
      }
    ],
    "requestId": "uuid"
  }
}
```

---

## 9. Testanforderungen aus der Matrix

Mindestens testen:
1. 400 bei ungültiger E-Mail
2. 401 ohne Token
3. 403/404 auf fremde Objekte
4. 415 bei falschem Dateityp
5. 413 bei zu großer Datei
6. 429 bei Rate Limit
7. Provider Partial Failure sichtbar im Ergebnis
8. Job Failure wird sinnvoll dargestellt
9. Sensitive Warning wird angezeigt

---

## 10. Nächste Artefakte

1. Frontend Error Components
2. API Error Code Katalog
3. Partial Failure UI Pattern
4. Retry-/Backoff-Regeln pro Mutation

---

## 11. Fazit

Gerade bei einem status- und workflowgetriebenen Produkt ist eine explizite Error-State-Matrix entscheidend. Sie verhindert, dass AI-generierter Code Fehlerzustände inkonsistent oder nutzerschädlich behandelt.
