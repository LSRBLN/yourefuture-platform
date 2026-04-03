# Operations Runbooks und Betriebskonzept

## 1. Ziel

Dieses Dokument beschreibt die wichtigsten operativen Runbooks und Betriebsprozesse fuer das Produkt.

Es dient als Grundlage für:
- DevOps/Betriebsstart
- Incident Handling
- Backoffice-Operations
- Support- und Provider-Störungen
- sichere Reaktion auf Produktionsprobleme

---

## 2. Betriebsprinzipien

1. sensible Systeme brauchen klare Zuständigkeiten
2. Teilfehler müssen sichtbar sein
3. Provider-Ausfälle dürfen den Gesamtdienst nicht unkontrolliert destabilisieren
4. Upload- und Analyse-Pipelines brauchen Monitoring
5. Backoffice-Zugriffe und kritische Aktionen müssen nachvollziehbar sein

---

## 3. Kernbereiche im Betrieb

1. API-Verfügbarkeit
2. DB-Verfügbarkeit
3. Queue-/Worker-Verfügbarkeit
4. Object-Storage-Verfügbarkeit
5. Provider-Integrationen
6. Video-/Bildanalysejobs
7. Backoffice-Operationen
8. Security-/Abuse-Monitoring

---

## 4. Runbook – API Störung

## Symptome
- erhöhte 5xx-Rate
- Login/Checks schlagen fehl
- Health Endpoint nicht erreichbar

## Sofortmaßnahmen
1. Status prüfen
2. letzte Deployments prüfen
3. Logs und APM prüfen
4. DB-/Redis-/Storage-Abhängigkeiten prüfen
5. falls nötig Rollback

## Kommunikationsregel
- internen Incident eröffnen
- Status intern aktualisieren
- falls relevant Nutzerkommunikation vorbereiten

---

## 5. Runbook – Datenbankprobleme

## Symptome
- Timeouts
- Connection Errors
- Migrationsprobleme
- langsame Queries

## Sofortmaßnahmen
1. DB-Health prüfen
2. Connection Saturation prüfen
3. langsame Queries identifizieren
4. aktuelle Migrationen prüfen
5. notfalls schreibintensive Features temporär begrenzen

## Prävention
- Query-Monitoring
- Index-Review
- Backup/Restore Tests
- Migrations-Review

---

## 6. Runbook – Queue/Worker Probleme

## Symptome
- Checks bleiben in `queued`
- Jobs landen in dead-letter
- Video-/Bildanalysen stauen sich

## Sofortmaßnahmen
1. Queue-Länge prüfen
2. Worker-Health prüfen
3. Fehlertyp kategorisieren
4. ggf. betroffene Jobtypen pausieren
5. Retry-Policy kontrollieren
6. bei GPU-Themen separate Worker prüfen

---

## 7. Runbook – Provider-Ausfall

## Symptome
- ein Provider liefert Timeouts/Errors
- Check-Teilresultate fehlen
- Kosten/Quota überschritten

## Sofortmaßnahmen
1. Provider-Health prüfen
2. Fehlerquote messen
3. Provider temporär deaktivieren, wenn nötig
4. Fallback-Reihenfolge anwenden
5. Nutzerseitig Teilfehler transparent machen

## Nachbereitung
- Incident dokumentieren
- Timeout-/Retry-Config anpassen
- Provider-Kommunikation oder Vertragsprüfung

---

## 8. Runbook – Upload-/Storage-Probleme

## Symptome
- Uploads schlagen fehl
- Assets fehlen
- signierte URLs funktionieren nicht

## Sofortmaßnahmen
1. Storage-Health prüfen
2. Upload-Logs prüfen
3. MIME-/Größenlimit-Probleme abgrenzen
4. Signatur-/Berechtigungslogik prüfen
5. Quarantäne-/Scan-Pipeline prüfen

---

## 9. Runbook – Sensitiver Sicherheitsvorfall

## Beispiele
- unautorisierter Zugriff auf fremde Fälle
- Download sensibler Medien durch falsche Rolle
- Secret Leakage
- verdächtige Massenabfragen

## Sofortmaßnahmen
1. Incident Priorität hoch setzen
2. betroffene Systeme/Funktionen eingrenzen
3. kompromittierte Tokens oder Keys rotieren
4. Zugriffe auditieren
5. Beweise sichern
6. betroffene Nutzer und interne Stakeholder nach Prozess informieren

## Nachbereitung
- Root Cause Analysis
- Testlücke schließen
- Security Regression hinzufügen

---

## 10. Runbook – Support Queue Überlastung

## Symptome
- zu viele offene Support-Anfragen
- SLA-Ziele werden nicht erreicht
- dringende Fälle bleiben liegen

## Maßnahmen
1. Prioritätsregeln anwenden
2. dringende Fälle triagieren
3. Eskalationskriterien schärfen
4. ggf. bestimmte Low-Priority Fälle bündeln
5. interne Teamumverteilung prüfen

---

## 11. Runbook – Removal Case Stau

## Symptome
- viele offene Fälle
- Follow-up Status veraltet
- Aktionen werden nicht nachverfolgt

## Maßnahmen
1. Fälle nach Status und Alter priorisieren
2. offene Follow-ups identifizieren
3. Support-/Removal-Verantwortung trennen
4. Reminder-/Notification-Regeln prüfen

---

## 12. Monitoring-Mindestset

Für MVP mindestens monitoren:

### API
- Error Rate
- P95/P99 Latenz
- Request Volume

### DB
- CPU
- Connections
- slow queries
- replication/backup status

### Queue
- job backlog
- dead-letter count
- worker failures

### Storage
- upload errors
- access errors
- signed url failures

### Provider
- provider error rate
- timeout rate
- quota exhaustion

### Business
- checks created
- checks completed
- support requests open
- removal cases open

---

## 13. Rollen im Betrieb

## Engineering / DevOps
- Plattformbetrieb
- Deployments
- Incidents
- technische Stabilisierung

## Support Operations
- Support Queue
- erste Triage
- Nutzerkommunikation

## Removal Operations
- Löschfälle
- Aktionshistorie
- Follow-ups

## Admin
- Provider/Hilfetexte/Workflows
- Backoffice-Steuerung

---

## 14. Betriebsartefakte, die noch folgen sollten

1. Incident Severity Matrix
2. On-call Modell
3. Escalation Tree
4. Provider Health Dashboard Spec
5. Backup/Restore Runbook
6. Secret Rotation Runbook

---

## 15. Fazit

Ein gutes Betriebskonzept ist für dieses Produkt zentral, weil sensible Inhalte, externe Provider, asynchrone Jobs und Backoffice-Prozesse zusammenspielen. Ohne klare Runbooks steigt das Risiko von Daten-, Vertrauens- und Operationsproblemen stark.
