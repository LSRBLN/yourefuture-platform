# Datenschutz, DPIA-Vorbereitung und Datenlebenszyklus

## 1. Ziel

Dieses Dokument konkretisiert die Datenschutz- und Datenlebenszyklus-Planung für das Produkt.

Es dient als Grundlage für:
- Datenschutzkonzept
- DPIA-Vorbereitung
- Retention-Regeln
- Zugriffsregeln
- Lösch- und Exportprozesse
- Produkt- und Architekturentscheidungen

---

## 2. Warum dieses Dokument notwendig ist

Das Produkt verarbeitet:
- E-Mail-Adressen
- Telefonnummern
- Usernames
- Domains
- hochgeladene Bilder und Videos
- Fund-URLs
- Support-Nachrichten
- Removal-Fälle
- Analyse- und Risikobewertungen

Dadurch entstehen erhöhte Datenschutzanforderungen, insbesondere wegen:
- sensibler persönlicher Bezugspunkte
- potenziell belastender oder intimer Inhalte
- Fallhistorien
- Uploads
- Backoffice-Zugriffen
- externer Provider-Integrationen

---

## 3. Datenklassen

## Klasse A – hochsensibel
- hochgeladene Bilder
- hochgeladene Videos
- Fund-URLs zu Missbrauchs- oder Leak-Inhalten
- Removal-Fall-Dokumentation
- Support-Nachrichten mit Kontext
- Evidenzdateien

## Klasse B – sensibel
- E-Mail-Adresse
- Telefonnummer
- Username
- Leak-Ergebnisse
- Deepfake-Ergebnisse
- Workflow-Zustände
- Match-Zuordnungen

## Klasse C – intern/betrieblich
- Provider-Stammdaten
- Hilfetexte
- Workflow-Templates
- Metriken ohne Personenbezug
- technische Fehlerdaten ohne Payload

---

## 4. Datenlebenszyklus je Objekt

## 4.1 User Account
**Erhebung**
- Registrierung oder Gast-Upgrade

**Speicherung**
- `users`, `user_profiles`

**Zugriff**
- Nutzer selbst
- Support/Admin nur rollenbasiert, soweit erforderlich

**Löschung**
- bei Accountlöschung oder definierter Inaktivität gemäß Produkt-/Rechtsvorgabe

---

## 4.2 Leak-Check Inputs
**Erhebung**
- E-Mail, Username, Telefon, Domain, Passwort-Hash-Präfix

**Speicherung**
- minimiert im `checks`-Kontext
- keine Klartext-Passwörter

**Zugriff**
- Nutzer selbst
- Support nur fallbezogen

**Löschung**
- nach definierter Retention
- bevorzugt kürzere Fristen als Fallhistorien

---

## 4.3 Assets (Bilder/Videos)
**Erhebung**
- Upload durch Nutzer

**Speicherung**
- Object Storage + `assets`

**Zugriff**
- Nutzer selbst
- Support nur mit Need-to-know
- Analysten nur bei entsprechendem Prozess

**Löschung**
- schnellstmöglich nach Zweckfortfall
- streng definierte Retention
- gesonderte Behandlung für Beweis-/Removal-Fälle

---

## 4.4 User Submitted Sources
**Erhebung**
- manuelle URL-/Quellenmeldung durch Nutzer

**Speicherung**
- `user_submitted_sources`

**Besonderheit**
- URLs können hochsensibel sein, wenn sie auf Missbrauchsinhalte zeigen

**Löschung**
- gemäß Fallstatus und Retention-Regel

---

## 4.5 Deepfake- und Match-Ergebnisse
**Erhebung**
- durch Analyse

**Speicherung**
- `deepfake_results`, `content_matches`, `check_results`

**Zugriff**
- Nutzer selbst
- Support/Analysten nur rollenbasiert

**Löschung**
- gekoppelt an Check-/Asset-/Fall-Retention

---

## 4.6 Support Requests und Removal Cases
**Erhebung**
- durch Nutzer und Mitarbeitende

**Speicherung**
- `support_requests`, `removal_cases`, `removal_actions`

**Zugriff**
- betroffener Nutzer
- zuständige Mitarbeitende
- Admin nur soweit erforderlich

**Löschung**
- definierte Retention nach Fallabschluss
- Beweis-/Rechtskontext beachten

---

## 5. Datenschutz-Prinzipien für das Produkt

1. Datenminimierung
2. Zweckbindung
3. rollenbasierter Zugriff
4. kurze Aufbewahrungsfristen
5. keine unnötige Rohdatenhaltung
6. transparente Nutzerhinweise
7. sichere Löschbarkeit
8. exportierbare Fallhistorie
9. getrennte technische und inhaltliche Datenhaltung, wo sinnvoll

---

## 6. Empfohlene Speicherrichtlinien

## 6.1 Sofortige Minimierung
- keine Klartext-Passwörter
- keine unnötige Langzeit-Speicherung von Rohanalysen
- keine vollständigen sensiblen Provider-Responses als Standard

## 6.2 Objekt-Storage-Regeln
- private Buckets
- verschlüsselte Speicherung
- signierte Kurzzeit-URLs
- keine direkte öffentliche Auslieferung

## 6.3 Logging-Regeln
- keine sensiblen Payloads in Logs
- keine Secrets in Logs
- keine Fund-URLs im Klartext in Standard-Application-Logs
- getrennte Audit Logs für Backoffice-Zugriffe

---

## 7. DPIA-Vorbereitung

## 7.1 Warum eine DPIA geprüft werden sollte
Das Produkt verarbeitet potenziell risikoreiche Daten und Fälle, u. a.:
- personenbezogene Daten
- Medienuploads
- Fallhistorien
- potenziell belastende Inhalte
- strukturierte Risikobewertungen
- Support-/Backoffice-Bearbeitung

Deshalb sollte eine DPIA-Fähigkeit früh eingeplant werden.

## 7.2 Dafür benötigte Bausteine
- Beschreibung der Verarbeitungstätigkeiten
- Kategorien betroffener Personen
- Kategorien personenbezogener Daten
- Zwecke der Verarbeitung
- Speicherorte
- Empfänger / Drittanbieter
- Risiken für Betroffene
- technische und organisatorische Maßnahmen
- Lösch- und Rechteprozesse

## 7.3 DPIA-Fragen, die das Produkt beantworten können muss
1. Welche Daten werden genau erhoben?
2. Wozu werden sie verwendet?
3. Wer kann darauf zugreifen?
4. Wie lange werden sie gespeichert?
5. Werden sie an Drittanbieter übermittelt?
6. Welche Risiken bestehen für Betroffene?
7. Wie werden diese Risiken reduziert?

---

## 8. Rechte der Nutzer, die technisch unterstützt werden sollten

Das System sollte mindestens vorbereiten:

- Auskunft über gespeicherte Daten
- Korrektur bestimmter Stammdaten
- Löschanfrage / Accountlöschung
- Export fallbezogener Daten
- Übersicht über Support- und Removal-Historie
- Einsicht in hochgeladene Assets und ihre Ergebnisse

---

## 9. Zugriffsmodell auf Datenebene

## Endnutzer
- nur eigene Checks
- nur eigene Assets
- nur eigene Quellen
- nur eigene Support-Anfragen
- nur eigene Removal-Fälle

## Support
- nur zugewiesene oder autorisierte Fälle
- keine globale Einsicht ohne Rolle und Prozess

## Analyst
- nur evidenz- und analysebezogene Einsicht
- keine unnötige Kontoverwaltung

## Admin
- nur für Betriebs- und Konfigurationsfunktionen
- produktive Falldaten nur wenn betrieblich erforderlich und auditierbar

---

## 10. Retention-Matrix (Planungsvorschlag)

Die genauen Fristen müssen rechtlich und operativ final entschieden werden. Für die Planung sollten getrennte Klassen vorgesehen werden:

- sehr kurze Frist für temporäre Upload-Quarantäne
- kurze Frist für rohe Analyseartefakte
- mittlere Frist für Checks und Ergebnisse
- längere, begründete Frist für Removal-Fälle und zugehörige Historie
- gesonderte Regeln für Audit Logs
- gesonderte Regeln für Backups

Das System sollte Fristen pro Objektklasse konfigurierbar unterstützen.

---

## 11. Technische Anforderungen aus Datenschutzsicht

1. Verschlüsselung ruhender Daten
2. Verschlüsselung im Transport
3. Rollen- und Objektberechtigungen
4. signierte Objektzugriffe
5. Löschjobs / Retention Jobs
6. Auditierbarkeit von Backoffice-Zugriffen
7. getrennte Secrets-Verwaltung
8. Export-/Deletion-Endpunkte oder Backoffice-Prozesse
9. Datenklassifikation im Code und in Doku

---

## 12. Daraus abzuleitende nächste Artefakte

1. Retention-Matrix mit konkreten Fristen
2. Lösch- und Exportprozess-Dokument
3. Backoffice-Zugriffsrichtlinie
4. DPIA-Vorlage
5. Datenschutzhinweise für Nutzer
6. Audit- und Logging-Policy

---

## 13. Fazit

Für dieses Produkt ist Datenschutz kein Anhängsel, sondern Teil der Kernarchitektur. Gerade weil das System sensible personenbezogene Informationen, Uploads und Missbrauchsfälle verarbeiten kann, muss der Datenlebenszyklus von Anfang an bewusst geplant und technisch unterstützbar sein.
