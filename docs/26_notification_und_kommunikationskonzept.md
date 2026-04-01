# Notification- und Kommunikationskonzept

## 1. Ziel

Dieses Dokument beschreibt, wann und wie das Produkt Nutzer und interne Rollen benachrichtigt.

Es dient als Grundlage für:
- Notification Templates
- Produktkommunikation
- Status-Updates
- Support-/Removal-Kommunikation
- spätere E-Mail-/In-App-Umsetzung

---

## 2. Kommunikationsprinzipien

1. nur relevante Benachrichtigungen senden
2. sensible Inhalte in Benachrichtigungen minimieren
3. wichtige Statuswechsel klar und knapp kommunizieren
4. E-Mail und In-App sauber trennen
5. Support- und Removal-Fälle transparent, aber nicht alarmistisch kommunizieren

---

## 3. Kanäle

## 3.1 In-App
Geeignet für:
- Check abgeschlossen
- Workflow zugewiesen
- Support-Status geändert
- Removal-Status geändert

## 3.2 E-Mail
Geeignet für:
- Account-bezogene Aktionen
- Check abgeschlossen
- Support-Anfrage bestätigt
- Support-Zuweisung / Statuswechsel
- Removal-Fall erstellt / Statuswechsel

## 3.3 Optional später
- SMS für besonders sensible oder dringende Fälle
- Push Notifications in mobiler App

---

## 4. Notification-Trigger

## Nutzerbezogen
1. Registrierung erfolgreich
2. Check abgeschlossen
3. Check fehlgeschlagen
4. Workflow erstellt
5. Support-Anfrage erstellt
6. Support-Anfrage Status geändert
7. Removal-Fall erstellt
8. Removal-Fall Status geändert
9. sensible Eskalation empfohlen

## Intern
10. neue Support-Anfrage eingegangen
11. neue High-Priority Anfrage
12. neuer kritischer Removal-Fall
13. Provider-Ausfall
14. Queue-Stau / Job-Fehler
15. Security-/Abuse-Signal

---

## 5. Kommunikationsmatrix

| Ereignis | Empfänger | Kanal | Priorität |
|---|---|---|---|
| Registrierung erfolgreich | Nutzer | E-Mail/In-App | niedrig |
| Check abgeschlossen | Nutzer | In-App + optional E-Mail | mittel |
| Check fehlgeschlagen | Nutzer | In-App | mittel |
| Workflow erstellt | Nutzer | In-App | mittel |
| Support-Anfrage erstellt | Nutzer | E-Mail + In-App | mittel |
| Support-Anfrage zugewiesen | Nutzer optional / intern sicher | In-App / intern | mittel |
| Support-Status geändert | Nutzer | E-Mail + In-App | hoch |
| Removal-Fall erstellt | Nutzer | E-Mail + In-App | hoch |
| Removal-Status geändert | Nutzer | E-Mail + In-App | hoch |
| kritischer sensibler Fund | Nutzer | In-App mit Warning | hoch |
| neue Support-Anfrage | Support-Team | intern | hoch |
| Provider-Ausfall | Engineering/Admin | intern | hoch |

---

## 6. Inhaltliche Regeln

## 6.1 Benachrichtigungen an Nutzer
- keine unnötigen Rohdetails
- keine sensitiven URLs in E-Mails
- klare Handlungsaufforderung
- Link direkt zur relevanten Detailseite

## 6.2 Interne Benachrichtigungen
- ausreichend Kontext
- Priorität
- Referenz auf Ticket/Fall/Anfrage
- keine unnötige Datenvervielfältigung

---

## 7. Template-Typen

## 7.1 Nutzer-Templates
- `registration_success`
- `check_completed`
- `check_failed`
- `workflow_created`
- `support_request_created`
- `support_request_status_changed`
- `removal_case_created`
- `removal_case_status_changed`
- `sensitive_case_attention`

## 7.2 Interne Templates
- `internal_support_request_created`
- `internal_high_priority_case`
- `internal_provider_incident`
- `internal_queue_backlog_warning`
- `internal_security_signal`

---

## 8. Template-Bausteine

Jedes Template sollte enthalten:
- subject/title
- short summary
- main body
- CTA label
- CTA target
- severity optional
- locale/language

---

## 9. Frequenz- und Spam-Regeln

1. keine redundanten Notifications für denselben Status
2. Statuswechsel nur bei echter Änderung senden
3. gebündelte In-App-Hinweise bevorzugen, wenn mehrere Events schnell nacheinander passieren
4. High-Priority Support/Removal nicht unterdrücken
5. Nutzerpräferenzen später optional berücksichtigen

---

## 10. Sensible Kommunikation

Für sensible oder belastende Fälle:
- sachlich, nicht sensationalistisch
- keine explizite Beschreibung des Inhalts in E-Mail-Betreffzeilen
- In-App zuerst Warning + Kontext
- Support-Option immer sichtbar

---

## 11. Technische Umsetzungsideen

- `notifications` Tabelle für persistente Events
- Template Engine
- Kanaladapter für E-Mail/In-App
- Retry für E-Mail-Versand
- idempotente Sende-Logik
- Audit für kritische interne Benachrichtigungen

---

## 12. Nächste Artefakte

1. Notification Template Seeds
2. Notification Service API
3. Nutzerpräferenzmodell später optional
4. interne Alerting-Matrix

---

## 13. Fazit

Ein sauberes Kommunikationskonzept erhöht Vertrauen und reduziert Verwirrung. Gerade bei sensiblen Findings und Support-/Removal-Prozessen ist gute Kommunikation Teil des Produkts, nicht nur Infrastruktur.
