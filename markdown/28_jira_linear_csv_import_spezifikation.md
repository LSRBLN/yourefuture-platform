# Jira-/Linear-CSV-Import-Spezifikation

## 1. Ziel

Dieses Dokument definiert ein CSV-kompatibles Feldschema, mit dem das Projektbacklog in Jira oder vergleichbaren Tools importiert werden kann.

Es dient als Grundlage für:
- Projektsetup
- Sprintplanung
- AI-/Vibe-Coding Feature-Batches
- strukturierte Delivery

---

## 2. Empfohlenes CSV-Schema

Spalten:

1. `Epic`
2. `Title`
3. `Type`
4. `Priority`
5. `Estimate`
6. `Labels`
7. `Description`
8. `AcceptanceCriteria`
9. `Dependencies`
10. `Sprint`
11. `OwnerRole`

---

## 3. Beispielheader

```csv
Epic,Title,Type,Priority,Estimate,Labels,Description,AcceptanceCriteria,Dependencies,Sprint,OwnerRole
```

---

## 4. Werte-Konventionen

## Type
- Epic
- Story
- Task
- Bug
- Spike

## Priority
- Highest
- High
- Medium
- Low

## Estimate
- integer story points oder ideal days, teamabhängig

## OwnerRole
- backend
- frontend
- platform
- security
- product
- ops
- mixed

---

## 5. Beispielzeilen

```csv
Platform Foundation,Bootstrap NestJS API application,Story,Highest,5,"backend;foundation;nestjs","Lege die Grundstruktur der API-Anwendung an.","App startet lokal; Health Endpoint existiert; Validation Pipe aktiv; Error Format konsistent","",Sprint 0,backend
Platform Foundation,Bootstrap worker application,Story,Highest,5,"worker;queue;foundation","Lege die Worker-Anwendung mit Queue-Anbindung an.","Worker startet lokal; Redis-Verbindung funktioniert; Beispieljob wird konsumiert","Redis local setup",Sprint 0,platform
Auth & Access,Implement register endpoint,Story,Highest,3,"auth;api","Implementiere Registrierung mit E-Mail und Passwort.","POST /auth/register funktioniert; Passwort wird sicher gehasht; Validation Errors korrekt","users table; auth module scaffold",Sprint 1,backend
Check Orchestration,Implement create check endpoint,Story,Highest,5,"checks;api","Implementiere POST /checks für MVP-Typen.","Input validiert; Check gespeichert; Job erzeugt; Response entspricht Schema","checks table; jobs table",Sprint 1,backend
Leak Check Engine,Implement HIBP connector,Story,Highest,5,"hibp;connector;leak-check","Implementiere HIBP als ersten produktiven Provider.","Serverseitiger API-Key; Mapping auf Standardmodell; Timeout Handling; Tests vorhanden","provider connector interface",Sprint 2,backend
Assets & Uploads,Implement image upload endpoint,Story,High,5,"uploads;assets;api","Implementiere multipart Upload für Bilder.","Erlaubte Bilder gespeichert; falsche Typen abgewiesen; Hash gesetzt","assets table; object storage config",Sprint 3,backend
User Submitted Sources,Implement create source endpoint,Story,High,3,"sources;api","Implementiere POST /sources.","URL validiert; Quelle gespeichert; Ownership korrekt","sources table",Sprint 3,backend
Removal Cases,Implement create removal case endpoint,Story,High,5,"removal;api","Implementiere POST /removal-cases.","Fall wird angelegt; Status open; Verknüpfung zu Match/Asset möglich","removal_cases table",Sprint 4,backend
```

---

## 6. Mapping-Hinweise

## Für Jira
- `Epic` kann auf Epic Link oder Parent Mapping angepasst werden
- `Labels` besser mit Trennzeichen abstimmen
- `AcceptanceCriteria` oft als Description-Anhang oder Custom Field

## Für Linear
- ggf. separate CSV-/Import- oder API-Mappinglogik
- `Sprint` kann Cycle entsprechen
- `Epic` kann Project/Initiative/Parent Mapping sein

---

## 7. Batch-Empfehlung für Import

## Batch 1 – Sprint 0/1
- Platform Foundation
- Auth & Access
- Provider Registry
- Check Orchestration

## Batch 2 – Sprint 2/3
- Leak Check Engine
- Assets & Uploads
- User Submitted Sources
- Workflow Engine
- Help Text System

## Batch 3 – Sprint 4/5
- Support Requests
- Removal Cases
- Admin & Operations
- Video Analysis
- OpenAPI & Developer Experience

---

## 8. Qualitätsregeln für Importtickets

Jedes Ticket sollte:
1. nur ein klar umrissenes Ziel enthalten
2. eindeutige Akzeptanzkriterien haben
3. Abhängigkeiten benennen
4. einer Domäne und Rolle zugeordnet sein
5. nicht mehrere Features unklar vermischen

---

## 9. Nächste Artefakte

1. echte CSV-Datei
2. Sprintplanung als Import-Set
3. Ticketpakete nach Domäne
4. Subtask-Vorlagen für AI-Coding Tasks

---

## 10. Fazit

Mit einer festen CSV-Spezifikation lässt sich die Planung ohne viel Nacharbeit in Delivery-Tools überführen. Das ist besonders hilfreich, wenn Vibe-Coding strikt entlang eines priorisierten Backlogs erfolgen soll.
