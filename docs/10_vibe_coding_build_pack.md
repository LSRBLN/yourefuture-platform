# Vibe-Coding Build Pack

## 1. Ziel

Dieses Dokument übersetzt die Produktplanung in ein Format, das für ein AI-/Vibe-Coding-Tool besonders gut verwertbar ist.

Es legt fest:
- wie Aufgaben an das Tool übergeben werden
- welche Kontexte immer mitgegeben werden müssen
- welche Regeln nicht verhandelbar sind
- in welcher Reihenfolge Features gebaut werden sollen
- wie Outputs geprüft werden

---

## 2. Warum dieses Dokument wichtig ist

AI-Coding-Tools liefern bessere Ergebnisse, wenn:
- das Ziel klar beschrieben ist
- Anforderungen spezifisch formuliert sind
- Beispiele vorliegen
- Aufgaben in kleinere Einheiten zerlegt sind
- Akzeptanzkriterien und Output-Formate mitgegeben werden

Darum sollte die Umsetzung nicht mit freien Prompts beginnen, sondern mit einem festen Build Pack.

---

## 3. Non-Negotiable Rules für das Coding-Tool

1. Keine Klartext-Passwörter speichern
2. Alle nicht-öffentlichen Endpunkte müssen Auth prüfen
3. Alle objektbezogenen Endpunkte müssen Ownership/RBAC prüfen
4. Datei-Uploads nur über Allowlist, Größenlimit und Quarantäne-Logik
5. Keine Secrets im Client-Code
6. Keine Secrets in Logs
7. OpenAPI und DTOs müssen mit dem Code konsistent sein
8. Jede neue API-Funktion braucht Validierung
9. Jede neue Domänenfunktion braucht Tests
10. Jeder Output muss mit bestehender Modulstruktur kompatibel bleiben

---

## 4. Standard-Kontext für jeden Coding-Task

Jeder Task an das Tool sollte mindestens enthalten:

### A. Ziel
Was genau soll gebaut oder geändert werden?

### B. Relevante Artefakte
Welche Dateien und Planungsdokumente sind verbindlich?
- PRD
- Architektur
- SQL-Schema
- OpenAPI-Dokument
- Teststrategie
- Threat Model

### C. Constraints
- Sprache/Framework
- Modulstruktur
- kein Breaking Change ohne Begründung
- Rollen- und Security-Regeln
- Fehlerformat
- Logging-Regeln

### D. Erwarteter Output
- welche Dateien neu entstehen
- welche Dateien geändert werden
- welche Tests mitgeliefert werden
- ob OpenAPI/DTOs aktualisiert werden müssen

### E. Akzeptanzkriterien
Wann gilt der Task als fertig?

---

## 5. Standard-Task-Template

```text
Kontext:
- Wir bauen das Produkt gemäß PRD, SQL-Schema, Architektur und Teststrategie.
- Stack: Next.js, NestJS, PostgreSQL, Redis, S3-kompatibler Storage.
- Nutze die vorhandene Modulstruktur.
- Halte Security-, RBAC- und Upload-Regeln ein.

Aufgabe:
- Implementiere [FEATURE].

Anforderungen:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

Zu ändernde/neu zu erstellende Dateien:
- [Datei A]
- [Datei B]
- [Datei C]

Akzeptanzkriterien:
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]

Tests:
- [Unit Test]
- [Integration oder E2E Test]

Zusätzliche Regeln:
- Keine unnötigen Refactorings außerhalb des Scopes.
- DTOs und OpenAPI konsistent halten.
- Gib am Ende eine Liste der geänderten Dateien und eine kurze Begründung aus.
```

---

## 6. Empfohlene Build-Reihenfolge für das Coding-Tool

## Phase 1 – Foundation
1. Repository-Struktur
2. API Bootstrap
3. Worker Bootstrap
4. DB + Migrationen
5. Redis + Queue
6. Config + Logging + Error Layer
7. Auth + Users
8. OpenAPI Grundsetup

## Phase 2 – Core Product
9. Providers
10. Checks
11. Jobs
12. Help Texts
13. Assets Upload Basis

## Phase 3 – First Business Value
14. Provider Connector Interface
15. HIBP Connector
16. erster vollständiger Leak-Check Flow
17. Check Results + Risk Score
18. Workflow Trigger

## Phase 4 – Image Flow
19. Asset Analysis Worker Bild
20. Deepfake Results
21. User Submitted Sources
22. Content Matches
23. Support Requests

## Phase 5 – Removal & Ops
24. Removal Cases
25. Removal Actions
26. Admin Listen
27. Audit Logs
28. Notifications

## Phase 6 – Video
29. Video Upload
30. Frame Extraction
31. Video Analysis Worker
32. Escalation Rules

---

## 7. Was dem Coding-Tool pro Feature zusätzlich mitgegeben werden sollte

## Für API-Features
- Endpoint
- DTOs
- Response-Beispiele
- Fehlerfälle
- Rollenregeln
- Testfälle

## Für Datenbank-Features
- betroffene Tabellen
- Migration
- Indizes
- Beziehungen
- Seed-Auswirkungen

## Für Workflow-Features
- Trigger
- Zustände
- Schrittlogik
- Eskalationsregeln
- UI-Auswirkung

## Für Upload-/Analyse-Features
- erlaubte Formate
- Größenlimits
- Quarantäne
- Storage-Pfade
- Resultatobjekte
- Cleanup-Regeln

---

## 8. Anti-Patterns beim Vibe Coding

Diese Dinge sollten explizit verboten werden:

1. Features ohne DTO-/Schema-Anpassung bauen
2. direkt „alles auf einmal“ generieren lassen
3. Auth ohne Objektberechtigungen belassen
4. Upload-Features ohne Sicherheitsregeln implementieren
5. große Refactorings ohne Auftrag
6. Tests überspringen
7. neue Tabellen ohne Migrationen
8. neue Endpunkte ohne OpenAPI-Update
9. Business-Logik in Controller stopfen
10. Provider-spezifische Logik unstrukturiert in Kernmodule mischen

---

## 9. Review-Checkliste für AI-generierten Code

Vor Annahme eines Ergebnisses prüfen:

- passt es zur Modulstruktur?
- sind DTOs/Validation vorhanden?
- stimmt die Autorisierung?
- sind Fehlerobjekte konsistent?
- wurden Tests ergänzt?
- wurden Migrationsdateien ergänzt?
- wurde OpenAPI aktualisiert?
- wurden Logs/Secrets sauber behandelt?
- ist die Änderung auf den Scope begrenzt?

---

## 10. Output-Standards für das Tool

Das Coding-Tool sollte am Ende jedes Tasks liefern:

1. Liste der geänderten Dateien
2. kurze Beschreibung je Datei
3. Hinweise auf offene Punkte / Annahmen
4. Testhinweise
5. Migrationshinweise, falls vorhanden

---

## 11. Empfohlene Artefakte, die dem Tool immer verfügbar sein sollten

- PRD
- Architekturkonzept
- SQL-Schema
- OpenAPI-Dokument
- Teststrategie
- Threat Model
- Datenschutz-/Retention-Dokument
- RBAC-Matrix
- Seed-Katalog
- Coding-Konventionen

---

## 12. Nächste Dokumente, die dieses Build Pack ergänzen sollten

1. RBAC-Matrix
2. Provider Integration Matrix
3. DTO-/Schema-Katalog
4. Frontend Screen Spec
5. Seed-Daten-Katalog
6. echte openapi.yaml
7. NestJS-Scaffold-Anweisung

---

## 13. Fazit

Je besser die Aufgabe für das AI-Coding-Tool strukturiert ist, desto geringer ist der Interpretationsspielraum. Für dieses Produkt sollte das Tool nicht „frei coden“, sondern streng anhand von Architektur, Datenmodell, Tests, Security- und Prompt-Regeln geführt werden.
