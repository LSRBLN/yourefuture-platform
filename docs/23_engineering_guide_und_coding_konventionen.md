# Engineering Guide und Coding-Konventionen

## 1. Ziel

Dieses Dokument definiert die Engineering-Regeln für die Umsetzung des Produkts.

Es dient als Grundlage für:
- einheitlichen AI-generierten Code
- Code Reviews
- Konsistenz im Backend und Frontend
- geringeren Interpretationsspielraum im Vibe-Coding-Tool

---

## 2. Grundprinzipien

1. Klarheit vor Cleverness
2. kleine, fokussierte Module
3. Business-Logik nicht in Controller/UI stopfen
4. Security- und Ownership-Prüfung als Standard
5. DTOs und Typen zuerst
6. Tests gehören zum Feature
7. OpenAPI und Code dürfen nicht auseinanderlaufen

---

## 3. Backend-Konventionen

## 3.1 Modulstruktur
Jede Domäne folgt:
- controller
- service
- repository
- dto
- entities
- mappers
- policies

## 3.2 Controller
Controller dürfen:
- Requests annehmen
- DTOs validieren lassen
- Service aufrufen
- Responses zurückgeben

Controller dürfen nicht:
- komplexe Business-Logik enthalten
- direkte SQL-/DB-Logik enthalten
- RBAC nur implizit behandeln

## 3.3 Services
Services:
- enthalten Business-Logik
- orchestrieren Repositories und externe Services
- erzeugen Domain-Ereignisse oder Folgeaktionen

## 3.4 Repositories
Repositories:
- kapseln Datenzugriff
- enthalten keine Policy-Entscheidungen
- liefern klar definierte Datenobjekte zurück

## 3.5 DTOs
Jeder mutierende Endpoint braucht DTOs.
Jeder DTO braucht:
- Validierungsregeln
- klare Pflichtfelder
- string length / format Regeln, wo möglich

## 3.6 Policies
Objektzugriff und Rollenlogik gehören in Policies oder Guards, nicht verteilt in zufälligen Codepfaden.

---

## 4. Frontend-Konventionen

## 4.1 Komponenten
- Presentational und Screen-/Container-Logik trennen
- wiederverwendbare Status- und Ergebnisbausteine nutzen
- keine API-Details tief in UI-Atoms verteilen

## 4.2 Datenzugriff
- Query-/Mutation-Hooks standardisieren
- keine wilden Fetch-Calls in Einzelkomponenten
- Server State und UI State trennen

## 4.3 Formulare
- zentrale Validierung
- konsistente Fehleranzeigen
- sensible Aktionen mit klarer Nutzerbestätigung

---

## 5. Benennungskonventionen

## Backend
- Dateien: kebab-case
- Klassen: PascalCase
- DTOs: `*.dto.ts`
- Policies: `*.policy.ts`
- Repositories: `*.repository.ts`

## Frontend
- Komponenten: PascalCase
- Hooks: `useXyz`
- Query Keys: stabil und domänenbezogen
- Screens: nach Route oder Domäne benennen

---

## 6. Fehlerbehandlung

1. Fehlerobjekte standardisieren
2. keine sensiblen Daten in Fehlermeldungen
3. technische Details nur in Logs
4. Validation-, Auth-, Forbidden- und NotFound-Fehler sauber trennen

---

## 7. Logging-Regeln

1. strukturierte Logs
2. Request IDs
3. keine Secrets
4. keine sensiblen Inhalte im Klartext
5. wichtige Statuswechsel loggen
6. Admin-/Support-Aktionen auditieren

---

## 8. Testkonventionen

1. jede neue Business-Logik braucht Unit Tests
2. jeder neue Endpoint braucht mindestens einen Integrations- oder E2E-Test
3. Ownership-/RBAC-Fälle explizit testen
4. Upload-Features brauchen Negativtests
5. Provider-Mapper separat testen

---

## 9. Datenbank- und Migrationsregeln

1. keine Tabellen ohne Migration
2. jede Beziehung bewusst definieren
3. Indizes für kritische Query-Pfade setzen
4. destructive changes vermeiden oder sauber migrieren
5. Seeds versionierbar halten

---

## 10. API-/OpenAPI-Regeln

1. neue Endpunkte nur mit DTO + OpenAPI-Update
2. Response-Formate konsistent halten
3. Listenendpunkte paginationfähig
4. Status- und Fehlercodes bewusst definieren
5. keine stillen Breaking Changes

---

## 11. Security-Defaults

1. Auth standardmäßig an
2. Ownership explizit prüfen
3. Dateitypen und Uploadgrößen validieren
4. Secrets nur serverseitig
5. Backoffice besonders streng absichern
6. sensible Medienzugriffe auditieren

---

## 12. Review-Checkliste

Vor Merge prüfen:
- passt die Änderung in die Modulstruktur?
- gibt es DTOs?
- gibt es Tests?
- ist OpenAPI konsistent?
- ist Ownership/RBAC korrekt?
- werden sensible Daten sicher behandelt?
- ist Logging sauber?
- wurde Scope unnötig erweitert?

---

## 13. Regeln speziell für AI-/Vibe-Coding

1. kleine Tasks statt Großaufträge
2. bestehende Konventionen immer wieder mitgeben
3. Code-Output auf Scope begrenzen
4. Generierung ohne Tests nicht akzeptieren
5. Struktur wichtiger als schnelle Menge
6. erst Domainvertrag, dann Implementierung

---

## 14. Fazit

Mit klaren Engineering-Regeln steigt die Chance deutlich, dass AI-generierter Code wartbar, sicher und konsistent bleibt. Für dieses Produkt sind besonders Moduldisziplin, Ownership-Prüfungen, DTO-Klarheit und Testpflicht entscheidend.
