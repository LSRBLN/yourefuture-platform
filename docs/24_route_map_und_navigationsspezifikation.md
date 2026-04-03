# Route Map und Navigationsspezifikation

## 1. Ziel

Dieses Dokument definiert die Routenstruktur, Navigationslogik und Zugriffsregeln für das Frontend.

Es dient als Grundlage für:
- Routing im Frontend
- Screen-Implementierung
- Guard-/Access-Logik
- Vibe-Coding mit klarer Seitenstruktur

---

## 2. Routing-Prinzipien

1. öffentliche und geschützte Bereiche klar trennen
2. Nutzer- und Backoffice-Routen strikt separieren
3. IDs immer domänenklar im Pfad abbilden
4. Status- und Detailseiten getrennt halten
5. sensible Detailseiten nur nach expliziter Berechtigungsprüfung laden

---

## 3. Öffentliche Routen

| Route | Zweck | Zugriff |
|---|---|---|
| `/` | Start / Intake | public |
| `/login` | Login | public |
| `/register` | Registrierung | public |
| `/forgot-password` | Passwort-Reset später optional | public |
| `/legal/privacy` | Datenschutz | public |
| `/legal/terms` | Nutzungsbedingungen | public |

---

## 4. Geschützte Endnutzer-Routen

| Route | Zweck |
|---|---|
| `/app` | Dashboard |
| `/app/checks` | Check-Liste |
| `/app/checks/new` | neuen Check starten |
| `/app/checks/:checkId` | Check-Detail |
| `/app/checks/:checkId/results` | Check-Ergebnisse |
| `/app/assets` | Asset-Liste |
| `/app/assets/:assetId` | Asset-Detail |
| `/app/assets/:assetId/results` | Deepfake-Ergebnisse |
| `/app/assets/:assetId/matches` | Asset-Matches |
| `/app/sources` | Quellenliste |
| `/app/sources/new` | Quelle melden |
| `/app/sources/:sourceId` | Quellen-Detail |
| `/app/workflows` | Workflow-Liste |
| `/app/workflows/:workflowInstanceId` | Workflow-Detail |
| `/app/support` | Support-Anfragen |
| `/app/support/new` | Support-Anfrage erstellen |
| `/app/support/:supportRequestId` | Support-Detail |
| `/app/removal-cases` | Removal-Liste |
| `/app/removal-cases/new` | Removal-Fall erstellen |
| `/app/removal-cases/:caseId` | Removal-Detail |
| `/app/profile` | Profil |
| `/app/settings` | Einstellungen |

---

## 5. Backoffice-Routen

| Route | Zweck | Rolle |
|---|---|---|
| `/backoffice` | Backoffice Dashboard | support/admin/analyst |
| `/backoffice/support-queue` | Support Queue | support/admin |
| `/backoffice/support-requests/:supportRequestId` | Support-Fall | support/admin |
| `/backoffice/removal-cases` | Removal-Liste global | support/admin |
| `/backoffice/removal-cases/:caseId` | Removal-Detail global | support/admin |
| `/backoffice/checks` | globale Check-Liste | admin, optional support read-only |
| `/backoffice/checks/:checkId` | globales Check-Detail | admin/autorisiert |
| `/backoffice/assets/:assetId` | Asset-Detail im Fallkontext | support/analyst/admin |
| `/backoffice/providers` | Provider-Verwaltung | admin |
| `/backoffice/help-texts` | Hilfetexte verwalten | admin |
| `/backoffice/workflows` | Workflow-Templates | admin |
| `/backoffice/audit-logs` | Audit Logs | admin |
| `/backoffice/system/health` | Betriebsstatus später optional | admin |

---

## 6. Navigationsstruktur Endnutzer

## Primäre Navigation
- Dashboard
- Checks
- Quellen
- Workflows
- Support
- Removal Center

## Sekundäre Navigation
- Profil
- Einstellungen
- Rechtliches
- Logout

## Kontextuelle CTAs
- „Check starten“
- „Bild prüfen“
- „Video prüfen“
- „Quelle melden“
- „Persönliche Hilfe anfragen“
- „Removal-Fall erstellen“

---

## 7. Navigationsstruktur Backoffice

## Primäre Navigation
- Dashboard
- Support Queue
- Removal Cases
- Checks
- Providers
- Help Texts
- Workflows
- Audit Logs

## Kontextnavigation
- Fallkontext
- Nutzerkontext
- Assetkontext
- interne Notizen
- Zuweisung / Priorisierung

---

## 8. Route Guards

## Public Guard
- keine Anmeldung nötig

## Auth Guard
- eingeloggter Nutzer erforderlich

## Role Guard
- Rolle erforderlich für Backoffice/Admin

## Ownership Guard
- nur Eigentümer oder autorisierter Fallkontext

## Sensitive Content Gate
- zusätzlich vorgeschaltete UI-Bestätigung vor belastender Vorschau

---

## 9. Redirect-Regeln

1. nicht eingeloggte Nutzer auf geschützter Route → `/login`
2. eingeloggter Nutzer auf `/login` oder `/register` → `/app`
3. User ohne Backoffice-Rolle auf `/backoffice/*` → `/app`
4. fehlende Berechtigung → dedizierte 403-Seite oder neutrale 404 je Policy
5. nach erfolgreichem Check-Start → Check-Status oder Detailseite
6. nach Upload → Asset-/Check-Flow
7. nach Support-Submit → Support-Detail
8. nach Removal-Case-Erstellung → Removal-Detail

---

## 10. Seitenzustände pro Route

Jede Route sollte diese Zustände unterstützen:
- loading
- success
- empty
- validation error
- forbidden
- not found
- partial data / partial failure
- sensitive content warning, falls relevant

---

## 11. URL-Konventionen

1. kebab-case für statische Segmente
2. UUIDs als IDs
3. Query-Parameter für Filter, Sortierung, Pagination
4. kein sensibler Inhalt in Query-Strings
5. keine Geschäftslogik in URL-Struktur verstecken

---

## 12. Query-Parameter-Standards

Beispiele:
- `?page=1`
- `?limit=20`
- `?status=open`
- `?type=leak_email`
- `?priority=high`
- `?q=support`
- `?sort=updatedAt_desc`

---

## 13. Nächste Artefakte

1. Screen-to-Route Mapping im Frontend
2. Route Guards im Code
3. Breadcrumb-Konzept
4. 403/404/500 Spezialseiten
5. Navigation Component Spec

---

## 14. Fazit

Mit einer klaren Route Map sinkt das Risiko von inkonsistenter Navigation und unklaren Nutzerflüssen deutlich. Für ein Vibe-Coding-Tool ist dieses Dokument besonders wertvoll, weil Seiten, Guards und Übergänge eindeutig werden.
