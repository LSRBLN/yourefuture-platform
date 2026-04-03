# Review-Queue und Human-in-the-Loop-Spezifikation

## 1. Ziel

Dieses Dokument beschreibt die manuelle Review-Schicht für kritische, unklare oder hochsensible Treffer.

Es dient als Grundlage für:
- Analysten- und Support-Workflows
- Qualitätskontrolle
- sichere Eskalation
- weniger Fehlalarme
- bessere Entscheidungsqualität

---

## 2. Grundprinzip

> **WICHTIG:** Kritische Entscheidungen dürfen nicht nur auf einem Modellscore beruhen.

Manuelle Review ist insbesondere nötig bei:
- hohen Deepfake-/Manipulationsverdachtswerten
- Gesichtstreffern mit unklarer Qualität
- bekannten Leak-/Missbrauchsfundstellen
- Konflikt zwischen Modellen / Signalen
- sensiblen Inhalten
- Fällen mit Removal-/Support-Folge

---

## 3. Queue-Typen

## 3.1 Analyst Review Queue
Für:
- Deepfake-Verdacht
- Face-Match-Prüfung
- Video-Match-Prüfung
- Known Fake / Known Leak Verifikation

## 3.2 Support Escalation Queue
Für:
- Nutzer braucht Einordnung
- belastender Fund
- Removal-Fall mit hoher Priorität
- unklare Falllage

## 3.3 Removal Review Queue
Für:
- Fall vor externer Meldung prüfen
- Evidenzvollständigkeit prüfen
- Aktionsstrategie entscheiden

---

## 4. Trigger für Review

Ein Review-Item soll erzeugt werden, wenn mindestens eine Bedingung erfüllt ist:

1. `probabilityFake >= defined_threshold_high`
2. Face-Match in grauer Zone
3. Match mit `knownLeak = true`
4. Match mit `knownFake = true`
5. sensibles Asset / NSFW Flag
6. Nutzer meldet dringenden Missbrauch
7. Removal-Fall wird erstellt
8. Modelle liefern widersprüchliche Ergebnisse
9. Qualitätsmetriken sind schwach, aber Actionability hoch

---

## 5. Review-Objekt

Ein Review-Item sollte mindestens enthalten:
- review_id
- review_type
- priority
- linked_check_id
- linked_asset_id
- linked_match_id
- linked_support_request_id optional
- linked_removal_case_id optional
- status
- assigned_to
- created_at
- updated_at
- summary
- evidence_snapshot
- recommended_action
- final_decision
- reviewer_notes

---

## 6. Review-Status

Empfohlene Status:
- open
- triaged
- assigned
- in_review
- waiting_more_context
- decided
- escalated
- closed

---

## 7. Priorisierung

## Hoch
- bekanntes Leak-/Missbrauchsmatch
- intimer / belastender Inhalt
- Removal erforderlich
- Nutzer fordert sofortige Hilfe

## Mittel
- wahrscheinliche Manipulation
- starker Face-Match, aber Review nötig
- Video mit Teiltreffer

## Niedrig
- unscharfe Kandidaten
- geringe Confidence ohne direkte Folgeaktion

---

## 8. Review-Ansicht im Backoffice

Die Review-Ansicht sollte zeigen:
- kompakte Summary
- alle Evidenzen
- Scores und Qualitätswerte
- betroffene Objekte
- Nutzerkontext nur soweit nötig
- nächste mögliche Aktion

Aktionen:
- bestätigen
- verwerfen
- an Support übergeben
- Removal empfehlen
- mehr Informationen anfordern
- erneut analysieren / rerun

---

## 9. Entscheidungsregeln

Reviewer sollten nicht nur „ja/nein“ wählen, sondern definierte Outcomes:

## Für Deepfake
- no_evidence_of_manipulation
- suspicious_needs_monitoring
- likely_manipulated
- confirmed_known_fake
- insufficient_evidence

## Für Face Match
- no_match
- weak_candidate
- strong_candidate_reviewed
- insufficient_quality

## Für Leak/Match
- not_actionable
- monitor
- action_recommended
- removal_recommended

---

## 10. Audit- und Sicherheitsregeln

1. jede Review-Entscheidung auditieren
2. Medienansicht sensibler Inhalte protokollieren
3. nur berechtigte Rollen sehen Review-Items
4. Reviewer-Entscheidungen mit Timestamp und Grund speichern
5. Eskalationen nachvollziehbar verknüpfen

---

## 11. KPIs für Review

- offene Review-Items
- durchschnittliche Triage-Zeit
- durchschnittliche Review-Zeit
- Anteil bestätigter Modellempfehlungen
- Anteil verworfener Falschalarme
- Übergänge zu Support
- Übergänge zu Removal

---

## 12. Daraus abzuleitende nächste Umsetzungsartefakte

1. Review-Tabellen im Datenmodell
2. Review-Backoffice-Screens
3. Review-API
4. SLA-/Prioritätsregeln
5. Audit-Events für Review

---

## 13. Fazit

Human-in-the-loop ist keine Zusatzfunktion, sondern eine Kernschicht für Qualität und Vertrauen. Besonders bei Deepfake-, Gesichts- und sensiblen Leak-Funden reduziert Review echte Produktrisiken erheblich.
