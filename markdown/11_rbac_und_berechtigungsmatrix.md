# RBAC- und Berechtigungsmatrix

## 1. Ziel

Dieses Dokument definiert die Rollen, Berechtigungen und Objektzugriffsregeln für das Produkt.

Es dient als Grundlage für:
- API-Autorisierung
- Backoffice-Sicherheit
- Policy-Implementierung im Backend
- Security-Tests
- least-privilege Umsetzung

---

## 2. Rollen

## 2.1 User
Endnutzer der Plattform.

Darf:
- eigene Checks starten
- eigene Assets hochladen
- eigene Quellen melden
- eigene Ergebnisse sehen
- eigene Workflows ausführen
- eigene Support-Anfragen stellen
- eigene Removal-Fälle sehen und anlegen

Darf nicht:
- fremde Objekte sehen
- Admin-/Support-Funktionen ausführen
- Provider oder Hilfetexte verwalten

---

## 2.2 Support
Mitarbeitende für Fallbegleitung und Kundenhilfe.

Darf:
- zugewiesene oder freigegebene Support-Anfragen sehen
- zugewiesene Fälle bearbeiten
- Status von Support-Anfragen ändern
- Removal-Fälle mit Support-Bezug bearbeiten
- interne Notizen pflegen

Darf nicht:
- globale technische Konfiguration ändern
- Provider-Stammdaten pflegen
- alle Nutzerdaten ohne Fallbezug einsehen

---

## 2.3 Analyst
Fachrolle für tiefere Analyse und Evidenzprüfung.

Darf:
- analyserelevante Assets und Ergebnisse in autorisierten Fällen sehen
- Deepfake-/Match-bezogene Fälle prüfen
- Analyseergebnisse kommentieren oder verifizieren
- sensible Medien nur mit Berechtigung einsehen

Darf nicht:
- globale Admin-Konfiguration ändern
- allgemeine Nutzerverwaltung durchführen
- Provider oder Rollen ändern

---

## 2.4 Admin
Betriebs- und Systemadministration.

Darf:
- Provider verwalten
- Hilfetexte verwalten
- Workflow-Templates verwalten
- globale Listen und Betriebsmetriken sehen
- Rollen-/Rechte-nahe Konfiguration pflegen
- Audit Logs einsehen

Darf nicht automatisch:
- beliebige Falldetails ohne betrieblichen Grund unbeschränkt lesen, sofern dafür zusätzliche Prozessregeln gelten

---

## 3. Zugriffsebenen

Das System arbeitet mit vier Zugriffsebenen:

1. **Public** – frei erreichbar oder Gastfluss
2. **Authenticated** – eingeloggter Nutzer
3. **Role-based** – bestimmte Rolle nötig
4. **Object-based** – Eigentum, Zuweisung oder Fallbezug nötig

Jeder nicht-öffentliche Endpoint braucht mindestens:
- Authentifizierung
- Rollenprüfung oder Objektprüfung
- konsistente Fehlerantwort

---

## 4. Objektregeln

## 4.1 Checks
- User: nur eigene Checks
- Support: nur Checks im Kontext zugewiesener Support-/Removal-Fälle
- Analyst: nur Checks mit Analysefreigabe
- Admin: nur soweit betrieblich erforderlich und auditierbar

## 4.2 Assets
- User: nur eigene Assets
- Support: nur falls Fallbezug und Need-to-know
- Analyst: nur falls Analysefreigabe
- Admin: kein Standardzugriff auf Medieninhalte ohne Zweck

## 4.3 User Submitted Sources
- User: nur eigene Quellen
- Support/Analyst: nur fallbezogen
- Admin: kein Standardzugriff ohne Zweck

## 4.4 Support Requests
- User: nur eigene Support-Anfragen
- Support: nur zugewiesene oder queue-freigegebene Anfragen
- Admin: Übersicht und Zuweisung
- Analyst: nur wenn explizit einbezogen

## 4.5 Removal Cases
- User: nur eigene Fälle
- Support: zugewiesene oder freigegebene Fälle
- Analyst: nur falls Analyse-/Evidenzrolle erforderlich
- Admin: globale Listenansicht, Detailzugriff nach Betriebsregel

## 4.6 Provider / Help Texts / Workflow Templates
- Nur Admin
- Support/Analyst nur read-only, wenn überhaupt erforderlich
- User kein Zugriff

## 4.7 Audit Logs
- Nur Admin
- Support/Analyst kein Standardzugriff
- User kein Zugriff

---

## 5. Berechtigungsmatrix nach Ressource

Legende:
- C = Create
- R = Read
- U = Update
- D = Delete
- A = Assign / Admin Action
- O = nur eigene Objekte
- F = nur fallbezogen / freigegeben
- G = global
- - = kein Zugriff

| Ressource | User | Support | Analyst | Admin |
|---|---|---|---|---|
| Users / eigenes Profil | CRU (O) | - | - | R/U (G, eingeschränkt) |
| Providers | - | - | - | CRUD (G) |
| Provider Endpoints | - | - | - | CRUD (G) |
| Checks | CRU/Rerun (O) | R (F) | R (F) | R (G) |
| Check Results | R (O) | R (F) | R (F) | R (G) |
| Assets | CRUD (O) | R (F) | R (F) | R (G, eingeschränkt) |
| Deepfake Results | R (O) | R (F) | R/U Verify (F) | R (G) |
| User Submitted Sources | CRUD (O) | R/U Validate (F) | R/U Validate (F) | R (G) |
| Content Matches | R (O/Fall) | R/U (F) | R/U (F) | R (G) |
| Workflows Instanzen | R/U eigene Schritte (O) | R/U (F) | R/U (F) | R (G) |
| Workflow Templates | - | R optional | R optional | CRUD (G) |
| Help Texts | R | R | R | CRUD (G) |
| Support Requests | CRUD/R (O) | CRUA (F/G Queue) | R optional (F) | RUA (G) |
| Removal Cases | CRUD/R (O) | CRUA (F) | R/U Analyse-Felder (F) | RUA (G) |
| Removal Actions | CR (O/Fall) | CRUD (F) | R/U (F) | CRUD (G) |
| Jobs | R Status (eigene Checks) | R (F) | R (F) | R (G) |
| Notifications | R (O) | - | - | R (G) |
| Audit Logs | - | - | - | R (G) |

---

## 6. Endpoint-Regeln

## 6.1 User-Endpunkte
- `/api/v1/users/me` → nur eigener Nutzer
- `/api/v1/checks/*` → nur eigene Checks außer Admin-/Support-/Analyst-Kontext
- `/api/v1/assets/*` → nur eigene Assets
- `/api/v1/sources/*` → nur eigene Quellen
- `/api/v1/support-requests/*` → nur eigene Anfragen
- `/api/v1/removal-cases/*` → nur eigene Fälle

## 6.2 Support-Endpunkte
- `/api/v1/admin/support-requests/*` → Support/Admin
- Support darf nur Fälle aus eigener Queue, Zuweisung oder Freigabe lesen/bearbeiten

## 6.3 Admin-Endpunkte
- `/api/v1/admin/providers/*`
- `/api/v1/admin/help-texts/*`
- `/api/v1/admin/workflows/*`
- `/api/v1/admin/dashboard`
- `/api/v1/admin/audit-logs`

Nur Admin.

---

## 7. Policy-Regeln für die Implementierung

Empfohlene Policy-Prüfungen:

### canReadCheck(actor, check)
- true, wenn actor Admin
- true, wenn actor User und check.user_id == actor.id
- true, wenn actor Support/Analyst und check in autorisiertem Fallkontext
- sonst false

### canReadAsset(actor, asset)
- analog zu Checks
- bei sensiblen Medien zusätzliche Need-to-know Regel möglich

### canAssignSupportRequest(actor)
- nur Support Lead oder Admin, je Teammodell
- MVP: Admin und Support mit Assign-Recht

### canManageProvider(actor)
- nur Admin

### canReadAuditLog(actor)
- nur Admin

---

## 8. Zusätzliche Schutzregeln

1. Backoffice-Zugriffe auf hochsensible Assets auditieren
2. Download oder Vorschau sensibler Medien separat protokollieren
3. Admin ist nicht automatisch „alles sehen ohne Logging“
4. Queue-Ansichten für Support sollten minimale Daten zeigen
5. Eskalationsfälle können temporär zusätzliche Freigaben erzeugen
6. Berechtigungen niemals nur im Frontend abbilden

---

## 9. Testfälle aus der Matrix

Mindestens prüfen:
1. User kann keinen fremden Check lesen
2. User kann keinen fremden Asset lesen
3. User kann keinen fremden Removal-Fall lesen
4. Support sieht nur freigegebene oder zugewiesene Fälle
5. Analyst sieht nur autorisierte Analysefälle
6. Nur Admin kann Provider ändern
7. Nur Admin kann Audit Logs lesen
8. Support kann Support-Anfrage zuweisen nur wenn Rolle erlaubt
9. User kann Workflow-Schritt nur in eigener Instanz aktualisieren
10. Medienzugriffe werden auditierbar ausgelöst

---

## 10. Daraus abzuleitende technische Artefakte

1. Policy-Layer im Backend
2. Rollen-/Claim-Modell im Auth-Token
3. Security-Testmatrix
4. Audit-Event-Katalog
5. Backoffice-UI-Sichtbarkeitsregeln

---

## 11. Fazit

Die RBAC-Matrix muss in diesem Produkt streng mit Objektzugriff kombiniert werden. Rollen allein reichen nicht, weil fast alle Kernobjekte personenbezogen und fallbezogen sind.
