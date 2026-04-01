# Gap Analysis – Was für die Umsetzung noch fehlt

## 1. Ziel

Dieses Dokument bewertet den aktuellen Planungsstand und beschreibt präzise, welche Artefakte noch fehlen, damit das Produkt in einem AI-/Vibe-Coding-Tool möglichst zuverlässig, konsistent und umsetzbar gebaut werden kann.

---

## 2. Bereits vorhanden

Die vorhandene Planung deckt bereits wichtige Grundlagen ab:

- Produktvision und PRD
- technische Zielarchitektur
- SQL-Schema
- REST-/OpenAPI-Struktur auf hohem Niveau
- Backend-Ordnerstruktur
- Epic- und Ticket-Backlog
- Phasen- und Sprintlogik
- erste Datenmodelle für Checks, Assets, Workflows, Support und Removal

Damit ist die strategische und strukturelle Ebene gut vorbereitet.

---

## 3. Was noch fehlt

## 3.1 Kritische Lücken für eine saubere Umsetzung

### A. Threat Model / Abuse Cases
Es fehlt ein formelles Sicherheits- und Missbrauchsmodell.

Warum das kritisch ist:
- Das Produkt verarbeitet sensible personenbezogene Daten, Fund-URLs und hochgeladene Medien.
- Es enthält Datei-Uploads, APIs, Rollen, Fallmanagement und externe Integrationen.
- Ohne Threat Model fehlen klare Schutzmaßnahmen auf Anforderungsebene.

Was konkret fehlt:
- Angreiferprofile
- Missbrauchsszenarien
- Trust Boundaries
- Top-Risiken je Modul
- Sicherheitsmaßnahmen je Risiko
- Security Verification Mapping

---

### B. Datenschutz-, DPIA- und Datenlebenszyklus-Dokument
Es fehlt ein vollständiges Privacy- und Retention-Artefakt.

Warum das kritisch ist:
- Das Produkt verarbeitet PII, potenziell hochsensible Inhalte und möglicherweise besonders belastende Medien.
- Für risikoreiche Verarbeitungsvorgänge kann eine DPIA erforderlich sein.
- Ohne Datenlebenszyklus ist später unklar, was wie lange gespeichert werden darf oder soll.

Was konkret fehlt:
- Datenklassifikation
- Rechtsgrundlagen pro Verarbeitung
- Löschfristen
- Speicherorte
- Zugriffsmatrix
- Export-/Löschprozess
- DPIA-Vorbereitung

---

### C. Rollen- und Berechtigungsmatrix
Rollen wurden erwähnt, aber nicht vollständig operationalisiert.

Warum das kritisch ist:
- APIs mit IDs und Fallobjekten sind stark von sauberer Autorisierung abhängig.
- Support, Analysten und Admins benötigen unterschiedliche Rechte.
- Ohne Matrix entstehen schnell Broken Object Level Authorization Risiken.

Was konkret fehlt:
- CRUD-Rechte pro Rolle
- Objektzugriffsregeln
- Sonderrechte im Backoffice
- Eskalations- und Delegationsregeln

---

### D. Akzeptanzkriterien- und Teststrategie
Es fehlt ein testbares Qualitätsgerüst.

Warum das kritisch ist:
- Ein Vibe-Coding-Tool baut besser, wenn Akzeptanzkriterien und Testfälle präzise vorliegen.
- Ohne QA-Plan fehlen verlässliche Done-Kriterien.
- Gerade bei Workflows, Rollen, Uploads und asynchronen Jobs sind E2E-Tests essenziell.

Was konkret fehlt:
- Feature-spezifische Akzeptanzkriterien
- API-Testfälle
- E2E-Flows
- Security-Testfälle
- Performance-/Lastziele
- Regression-Scope

---

### E. DTO-/Schema-Katalog
Die API ist grob beschrieben, aber nicht feldgenau.

Warum das kritisch ist:
- AI-Coding-Tools arbeiten deutlich besser mit präzisen Input-/Output-Schemata.
- DTOs reduzieren Interpretationsspielraum.
- Validierungsregeln können daraus direkt generiert werden.

Was konkret fehlt:
- feldgenaue Request-/Response-Schemas
- required/optional Kennzeichnung
- Formatregeln
- Enumerationen pro Feld
- Standardfehler pro Endpoint

---

### F. Frontend-Flows / Screen Specs
Die Nutzerreisen sind beschrieben, aber nicht als konkrete Screen-Spezifikation.

Warum das kritisch ist:
- Das Produkt ist stark workflow- und erklärungsgetrieben.
- Ohne Screen-Definitionen entstehen UX-Brüche.
- Vibe-Coding funktioniert besser mit Screen-Zielen und Komponentenlisten.

Was konkret fehlt:
- Screen Inventory
- Seitenhierarchie
- leere / fehlerhafte / belastende Zustände
- CTA-Logik
- Responsive Regeln
- UI-Komponentenliste

---

### G. Provider Integration Matrix
Provider wurden benannt, aber nicht operativ verglichen.

Warum das kritisch ist:
- Unterschiedliche Suchfelder, Auth-Modelle, Limits und Ergebnisstrukturen müssen planbar werden.
- Ohne Matrix ist die Reihenfolge der Integrationen unklar.

Was konkret fehlt:
- Provider-Priorisierung
- Eingabefelder pro Provider
- Rate Limits
- Auth-Modell
- Kosten-/Planannahmen
- Fallback-Strategie
- Retry-/Timeout-Regeln

---

### H. Seed-Daten und Betriebs-Defaults
Mehrere Module brauchen initiale Inhalte.

Was konkret fehlt:
- Seed-Dateien für Provider
- Seed-Dateien für Hilfetexte
- initiale Workflow-Templates
- erste Risikoklassen
- Standard-Notifications
- Demo-/Testdaten

---

### I. Vibe-Coding Build Pack
Es fehlt ein speziell für AI-Coding optimiertes Ausführungsdokument.

Warum das kritisch ist:
- Offizielle GitHub-Copilot-Dokumentation empfiehlt, mit klarem Ziel, spezifischen Anforderungen und Beispielen zu arbeiten.
- Prompt-Dateien und strukturierte Projektplanung helfen, agentische Arbeit in kleinere, reproduzierbare Einheiten zu zerlegen.

Was konkret fehlt:
- Build-Order für das Coding-Tool
- Prompt-Konventionen
- Repo-Regeln
- Non-negotiable Constraints
- Output-Formate für Codegen
- Review-Checklisten

---

## 4. Priorisierung der fehlenden Artefakte

## Priorität 1 – vor echter Umsetzung
1. Threat Model + Abuse Cases
2. Datenschutz/DPIA + Datenlebenszyklus
3. Rollen- und Berechtigungsmatrix
4. Akzeptanzkriterien + Teststrategie
5. DTO-/Schema-Katalog

## Priorität 2 – stark empfohlen
6. Frontend Screen Specs
7. Provider Integration Matrix
8. Seed-/Bootstrap-Datenkatalog
9. Vibe-Coding Build Pack

## Priorität 3 – nach MVP-Vorbereitung
10. Operations Runbooks
11. Incident Response Plan
12. Analytics Event Dictionary
13. SLA-/Support-Modell
14. White-Label/Partner-Modell

---

## 5. Empfohlene nächste Planungsdokumente

Aus dieser Lücke sollten als Nächstes entstehen:

1. Threat Model + Abuse Cases
2. Datenschutz-/DPIA- und Datenlebenszyklus-Dokument
3. Teststrategie + Akzeptanzkriterien
4. Vibe-Coding Build Pack
5. Rollen- und Berechtigungsmatrix
6. Provider Integration Matrix
7. Frontend Screen Spec

---

## 6. Direktes Fazit

Die bisherige Planung ist stark genug für Architektur- und Scope-Entscheidungen. Für eine hochwertige Umsetzung in einem Vibe-Coding-Tool fehlen jetzt vor allem die **präzisen, deterministischen, prüfbaren Artefakte**:

- Security
- Privacy
- Permissions
- DTOs
- Tests
- Screen Specs
- AI-Build-Regeln

Diese Dokumente reduzieren Interpretationsspielraum und erhöhen die Chance, dass das Coding-Tool konsistente, produktionsnahe Ergebnisse erzeugt.
