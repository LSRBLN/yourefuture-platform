# Datenmodell-Erweiterung für Search, Review und Evidence

## 1. Ziel

Dieses Dokument erweitert das bestehende Datenmodell um die noch fehlenden Objekte für:

- Embeddings
- Fingerprints
- OCR / Transcript
- Face Detection / Face Tracks
- Search Candidates
- Review Queue
- Evidence Snapshots

Es dient als Grundlage für:
- SQL-Erweiterungen
- Indexing-Pipelines
- Review- und Suchsystem
- Auditierbare Evidenz

---

## 2. Neue Kernobjekte

## 2.1 asset_representations
Speichert technische Repräsentationen eines Assets.

| Feld | Typ | Beschreibung |
|---|---|---|
| id | uuid | Primärschlüssel |
| asset_id | uuid | Referenz auf Asset |
| representation_type | text | exact_hash, phash, embedding, audio_fingerprint, transcript, ocr |
| model_name | text | Modell oder Verfahren |
| model_version | text | Version |
| vector_reference | text | Referenz in Vector DB, falls extern |
| payload_json | jsonb | Metadaten / Wertstruktur |
| quality_score | numeric | Qualitätsbewertung |
| created_at | timestamptz | Zeitstempel |

---

## 2.2 face_detections
Gesichtserkennungen in Bildern oder Keyframes.

| Feld | Typ |
|---|---|
| id | uuid |
| asset_id | uuid |
| keyframe_asset_id | uuid nullable |
| bbox_json | jsonb |
| face_quality_score | numeric |
| pose_json | jsonb |
| occlusion_score | numeric |
| embedding_representation_id | uuid |
| created_at | timestamptz |

---

## 2.3 face_tracks
Aggregierte Gesichts-Tracks für Videos.

| Feld | Typ |
|---|---|
| id | uuid |
| asset_id | uuid |
| start_second | numeric |
| end_second | numeric |
| aggregated_quality_score | numeric |
| representative_embedding_id | uuid |
| created_at | timestamptz |

---

## 2.4 text_artifacts
OCR- oder ASR-Texte.

| Feld | Typ |
|---|---|
| id | uuid |
| asset_id | uuid |
| artifact_type | text |
| language_code | text |
| text_content | text |
| confidence | numeric |
| segment_reference | jsonb |
| created_at | timestamptz |

---

## 2.5 search_queries
Optionale Such-/Lookup-Anfragen des Systems oder Nutzers.

| Feld | Typ |
|---|---|
| id | uuid |
| user_id | uuid |
| query_type | text |
| related_asset_id | uuid |
| related_check_id | uuid |
| query_payload | jsonb |
| status | text |
| created_at | timestamptz |

---

## 2.6 search_candidates
Kandidaten aus Such- und Matching-Läufen vor finaler Bestätigung.

| Feld | Typ |
|---|---|
| id | uuid |
| search_query_id | uuid |
| asset_id | uuid nullable |
| candidate_url | text |
| candidate_source | text |
| candidate_type | text |
| retrieval_method | text |
| raw_score | numeric |
| reranked_score | numeric |
| rank_position | integer |
| promoted_to_match | boolean |
| created_at | timestamptz |

---

## 2.7 review_items
Review-Queue-Objekte.

| Feld | Typ |
|---|---|
| id | uuid |
| review_type | text |
| priority | text |
| linked_check_id | uuid |
| linked_asset_id | uuid |
| linked_match_id | uuid |
| linked_support_request_id | uuid |
| linked_removal_case_id | uuid |
| status | text |
| assigned_to | uuid |
| summary | text |
| recommended_action | text |
| final_decision | text |
| created_at | timestamptz |
| updated_at | timestamptz |

---

## 2.8 review_decisions
Einzelentscheidungen in Reviews.

| Feld | Typ |
|---|---|
| id | uuid |
| review_item_id | uuid |
| reviewer_user_id | uuid |
| decision_type | text |
| rationale | text |
| evidence_snapshot_id | uuid |
| created_at | timestamptz |

---

## 2.9 evidence_snapshots
Gespeicherte Evidenzzusammenstellungen.

| Feld | Typ |
|---|---|
| id | uuid |
| snapshot_type | text |
| linked_asset_id | uuid |
| linked_check_id | uuid |
| linked_match_id | uuid |
| linked_review_item_id | uuid |
| summary | text |
| evidence_json | jsonb |
| created_at | timestamptz |

---

## 3. Objektbeziehungen

- `assets` → viele `asset_representations`
- `assets` → viele `face_detections`
- `assets` → viele `face_tracks`
- `assets` → viele `text_artifacts`
- `search_queries` → viele `search_candidates`
- `search_candidates` → können zu `content_matches` führen
- `review_items` → können `checks`, `matches`, `support_requests`, `removal_cases` referenzieren
- `review_items` → viele `review_decisions`
- `evidence_snapshots` → referenzieren operative und analytische Objekte

---

## 4. Wichtige Modellregeln

1. Embeddings immer mit Modellversion speichern
2. Search Candidates von bestätigten Matches trennen
3. Review-Entscheidungen nicht direkt überschreiben, sondern historisieren
4. Evidence Snapshots unveränderlich oder versioniert behandeln
5. sensible Evidenz nur kontrolliert zugreifbar machen

---

## 5. Indizierungs- und Query-Hinweise

Zusätzliche Indizes sinnvoll für:
- `asset_representations.asset_id`
- `asset_representations.representation_type`
- `face_detections.asset_id`
- `face_tracks.asset_id`
- `text_artifacts.asset_id`
- `search_candidates.search_query_id`
- `review_items.status`
- `review_items.priority`
- `review_items.assigned_to`

---

## 6. Daraus abzuleitende nächste Umsetzungsartefakte

1. SQL-Migrationserweiterung
2. Search/Review API
3. Review-Backoffice-Screens
4. Re-Indexierungsjobs
5. Evidenzexport-Spezifikation

---

## 7. Fazit

Für hochwertige Suche, Review und Beweisführung braucht das Produkt zusätzliche technische Objekte jenseits der bisherigen Kern-Tabellen. Besonders Search Candidates, Review Items und Evidence Snapshots schließen wichtige Lücken zwischen Modelloutput und operativer Entscheidung.
