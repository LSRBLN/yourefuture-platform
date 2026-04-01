# Retention-Matrix mit konkreten Fristen

## 1. Ziel

Dieses Dokument schlägt konkrete Aufbewahrungsfristen für die wichtigsten Datenobjekte des Produkts vor.

Diese Fristen sind ein Planungs- und Technikvorschlag und müssen vor Produktion rechtlich und operativ final geprüft werden.

Es dient als Grundlage für:
- Löschjobs
- Datenlebenszyklus
- DPIA-/Datenschutzumsetzung
- Storage-Kostenkontrolle
- Backoffice- und Audit-Regeln

---

## 2. Prinzipien

1. so kurz wie möglich, so lang wie nötig
2. hochsensible Rohdaten kürzer als abgeleitete Metadaten
3. Fallhistorien getrennt von Rohuploads betrachten
4. Audit Logs separat behandeln
5. Fristen technisch konfigurierbar halten

---

## 3. Fristenvorschlag pro Objektklasse

| Objektklasse | Vorschlag | Begründung |
|---|---|---|
| Upload-Quarantäneobjekte | 24 Stunden | technische Vorverarbeitung, kein Langzeitbedarf |
| fehlgeschlagene Upload-Artefakte | 7 Tage | Fehleranalyse begrenzt möglich |
| rohe Bild-/Videoanalyse-Artefakte | 30 Tage | Debugging/Review, aber hochsensibel |
| Assets ohne offenen Fall | 90 Tage | genug Zeit für Nutzerprüfung und Folgeaktion |
| Assets mit aktivem Removal-/Support-Fall | bis 180 Tage nach Fallabschluss | Nachverfolgung und Evidenzbedarf |
| Checks | 180 Tage | Verlauf für Nutzer und Support nutzbar |
| Check Results | 180 Tage | an Checks gekoppelt |
| Deepfake Results | 180 Tage | an Asset-/Check-Kontext gekoppelt |
| User Submitted Sources | 180 Tage | an Fall-/Check-Kontext gekoppelt |
| Content Matches | 180 Tage | Verlauf und Folgeaktionen |
| Workflow Instances | 180 Tage | Nachvollziehbarkeit der Nutzerhilfe |
| Support Requests | 365 Tage | Supporthistorie und Qualitätssicherung |
| Removal Cases | 365 Tage | operative und dokumentarische Nachverfolgung |
| Removal Actions | 365 Tage | Bestandteil des Case-Verlaufs |
| Notifications | 90 Tage | begrenzter operativer Wert |
| Job Records | 30 Tage | technische Diagnose |
| Audit Logs | 365 Tage | Sicherheits- und Betriebsnachweis |
| Provider technical logs ohne Payload | 30 Tage | Diagnose |
| sicherheitsrelevante Vorfall-Logs | 365 Tage | Incident-Nachvollziehbarkeit |

---

## 4. Besondere Regeln

## 4.1 Account-Löschung
Bei Account-Löschung:
- personenbezogene Primärdaten löschen oder anonymisieren, soweit zulässig
- offene Fälle gesondert behandeln
- Audit-/Pflichtdaten nur soweit notwendig aufbewahren

## 4.2 Aktiver Rechts-/Removal-Kontext
Wenn ein Fall aktiv ist:
- zugehörige Assets, Quellen und Fallobjekte nicht vorzeitig löschen
- Frist ab Fallabschluss neu berechnen

## 4.3 Sensible Medien
- Vorschaudaten und Ableitungen möglichst nicht länger halten als das Ursprungsasset
- keine unnötigen Duplikate

## 4.4 Backups
- Backup-Retention separat definieren
- Löschkonzept muss Backup-Strategie berücksichtigen

---

## 5. Technische Umsetzung

## 5.1 Retention Jobs
Es sollten geplante Jobs existieren für:
- Quarantäne-Cleanup
- Upload-/Asset-Cleanup
- Check-/Result-Cleanup
- Job-/Log-Cleanup
- Notification-Cleanup
- Audit-Review und langfristige Archivierungsentscheidungen

## 5.2 Soft Delete vs Hard Delete
Empfehlung:
- für Nutzerobjekte und operative Objekte zunächst Soft Delete/mark for deletion möglich
- nach Retention-Horizon Hard Delete
- hochsensible temporäre Artefakte möglichst direkt Hard Delete nach Frist

## 5.3 Konfigurierbarkeit
Fristen sollten in Konfiguration/Policies liegen, nicht hart im UI oder zufälligen Business-Code.

---

## 6. QA- und Audit-Anforderungen

Prüfen:
1. Retention Jobs laufen
2. Objekte werden fristgerecht markiert
3. Objekte im aktiven Fallkontext werden nicht zu früh gelöscht
4. harte Löschung sensibler temporärer Dateien funktioniert
5. Audit Logs bleiben gemäß Policy erhalten

---

## 7. Daraus abzuleitende nächste Artefakte

1. Löschjob-Spezifikation
2. Datenexport-/Löschprozess
3. Backup-Retention-Dokument
4. technische Markierung `retention_until`
5. Datenschutz-/Recht-Review

---

## 8. Fazit

Konkrete Retention-Fristen sind für dieses Produkt besonders wichtig, weil hochsensible Uploads, Fallhistorien, Support- und Removal-Prozesse zusammenkommen. Ohne klare Fristen drohen unnötige Risiken und wachsende Komplexität.
