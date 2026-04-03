# DTO- und Schema-Katalog

## 1. Ziel

Dieses Dokument konkretisiert die wichtigsten Request-/Response-Schemas für den MVP und reduziert Interpretationsspielraum für Backend-, Frontend- und Vibe-Coding-Umsetzung.

Es ist eine Zwischenstufe zwischen High-Level-API-Plan und vollständiger `openapi.yaml`.

---

## 2. Schema-Konventionen

## 2.1 Regeln
- IDs sind UUIDs
- Timestamps sind ISO-8601 Strings
- Enumerationen werden explizit benannt
- `summary` ist immer nutzerfreundlich
- `details` sind maschinen- oder UI-geeignet
- Fehlerobjekte folgen einem gemeinsamen Format

## 2.2 Standardfelder
Viele Ressourcen enthalten:
- `id`
- `createdAt`
- `updatedAt`
- `status`
- `summary` optional

---

## 3. Common Schemas

## 3.1 ErrorResponse
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Die Eingabe ist ungültig.",
    "details": [
      {
        "field": "email",
        "message": "Ungültiges Format"
      }
    ],
    "requestId": "uuid"
  }
}
```

## 3.2 PaginationResponse<T>
```json
{
  "items": [],
  "page": 1,
  "limit": 20,
  "total": 0
}
```

---

## 4. Auth DTOs

## 4.1 RegisterRequest
| Feld | Typ | Pflicht | Regeln |
|---|---|---|---|
| email | string | ja | valides E-Mail-Format |
| password | string | ja | Mindestlänge definieren |
| fullName | string | nein | max Länge definieren |

## 4.2 LoginRequest
| Feld | Typ | Pflicht |
|---|---|---|
| email | string | ja |
| password | string | ja |

## 4.3 AuthResponse
| Feld | Typ |
|---|---|
| user.id | uuid |
| user.email | string |
| user.role | enum(user, support, analyst, admin) |
| token | string |
| refreshToken | string |

---

## 5. Check DTOs

## 5.1 CreateCheckRequest
```json
{
  "type": "leak_email",
  "input": {
    "email": "user@example.com"
  }
}
```

### Felder
| Feld | Typ | Pflicht | Regeln |
|---|---|---|---|
| type | enum | ja | leak_email, leak_username, leak_phone, leak_domain, password_hash, image, video, source_only |
| input.email | string | bedingt | bei leak_email |
| input.username | string | bedingt | bei leak_username |
| input.phone | string | bedingt | bei leak_phone |
| input.domain | string | bedingt | bei leak_domain |
| input.passwordHashPrefix | string | bedingt | bei password_hash |
| input.assetId | uuid | bedingt | bei image/video |
| input.submittedSourceIds | uuid[] | nein | optional bei video/source-Kontext |

## 5.2 CheckResponse
| Feld | Typ |
|---|---|
| id | uuid |
| type | enum |
| status | enum(pending, queued, running, completed, failed, cancelled) |
| riskScore | integer nullable |
| severity | enum(low, medium, high, critical) nullable |
| summary | string nullable |
| createdAt | datetime |
| updatedAt | datetime |

## 5.3 CheckResultResponse
| Feld | Typ |
|---|---|
| id | uuid |
| providerId | uuid nullable |
| hitFound | boolean |
| hitType | string nullable |
| breachName | string nullable |
| breachDate | date nullable |
| exposedData | string[] / object |
| sourceConfidence | number nullable |
| normalizedSummary | string nullable |

---

## 6. Asset DTOs

## 6.1 AssetUploadResponse
| Feld | Typ |
|---|---|
| id | uuid |
| assetType | enum(image, video, document, other) |
| mimeType | string |
| status | string |
| sha256 | string |
| createdAt | datetime |

## 6.2 AssetResponse
| Feld | Typ |
|---|---|
| id | uuid |
| assetType | enum |
| originalFilename | string nullable |
| mimeType | string nullable |
| fileSizeBytes | integer nullable |
| width | integer nullable |
| height | integer nullable |
| durationSeconds | number nullable |
| createdAt | datetime |

---

## 7. Deepfake Result DTOs

## 7.1 DeepfakeResultResponse
```json
{
  "id": "uuid",
  "assetId": "uuid",
  "modelName": "media-detector-v1",
  "modelVersion": "1.2.0",
  "probabilityFake": 0.87,
  "probabilityManipulated": 0.91,
  "confidence": 0.82,
  "verdict": "likely_manipulated",
  "summary": "Das Bild weist mehrere Merkmale einer Manipulation auf."
}
```

### Felder
| Feld | Typ |
|---|---|
| id | uuid |
| assetId | uuid |
| checkId | uuid nullable |
| modelName | string |
| modelVersion | string nullable |
| probabilityFake | number nullable |
| probabilityManipulated | number nullable |
| confidence | number nullable |
| artifactFlags | object nullable |
| faceCount | integer nullable |
| audioVideoSyncScore | number nullable |
| frameAnomalies | object nullable |
| verdict | string |
| summary | string |

---

## 8. User Submitted Source DTOs

## 8.1 CreateSourceRequest
```json
{
  "sourceType": "video_url",
  "sourceUrl": "https://example.com/video/123",
  "platformName": "ExamplePlatform",
  "pageTitle": "Verdächtiges Video",
  "notes": "Vom Kunden selbst gefunden.",
  "assetId": "uuid"
}
```

### Felder
| Feld | Typ | Pflicht | Regeln |
|---|---|---|---|
| sourceType | string | ja | definierte Werte in Enum später |
| sourceUrl | string | ja | URL-Validierung |
| platformName | string | nein | max Länge |
| pageTitle | string | nein | max Länge |
| notes | string | nein | max Länge / Sanitizing |
| assetId | uuid | nein | optional |
| checkId | uuid | nein | optional |

## 8.2 SourceResponse
| Feld | Typ |
|---|---|
| id | uuid |
| sourceType | string |
| sourceUrl | string |
| sourceDomain | string nullable |
| platformName | string nullable |
| pageTitle | string nullable |
| notes | string nullable |
| validationStatus | enum(pending, validated, invalid, rejected) |
| createdAt | datetime |

---

## 9. Match DTOs

## 9.1 ContentMatchResponse
| Feld | Typ |
|---|---|
| id | uuid |
| assetId | uuid nullable |
| checkId | uuid nullable |
| matchType | string |
| matchedUrl | string nullable |
| platformName | string nullable |
| firstSeenAt | datetime nullable |
| lastSeenAt | datetime nullable |
| confidence | number nullable |
| knownFake | boolean |
| knownLeak | boolean |
| active | boolean |
| summary | string nullable |

---

## 10. Workflow DTOs

## 10.1 WorkflowInstanceResponse
| Feld | Typ |
|---|---|
| id | uuid |
| workflowId | uuid |
| status | enum(active, completed, cancelled) |
| createdAt | datetime |
| updatedAt | datetime |

## 10.2 WorkflowStepResponse
| Feld | Typ |
|---|---|
| id | uuid |
| workflowStepId | uuid |
| status | enum(pending, in_progress, completed, skipped, blocked) |
| title | string |
| description | string nullable |
| requiresConfirmation | boolean |
| supportHandoverPossible | boolean |

## 10.3 UpdateWorkflowStepRequest
| Feld | Typ | Pflicht |
|---|---|---|
| status | enum | ja |
| notes | string | nein |

---

## 11. Support DTOs

## 11.1 CreateSupportRequest
| Feld | Typ | Pflicht |
|---|---|---|
| requestType | string | ja |
| priority | enum(low, medium, high, urgent) | nein |
| checkId | uuid | nein |
| assetId | uuid | nein |
| removalCaseId | uuid | nein |
| preferredContact | string | nein |
| message | string | ja |

## 11.2 SupportRequestResponse
| Feld | Typ |
|---|---|
| id | uuid |
| requestType | string |
| priority | enum |
| status | enum(open, triaged, assigned, in_progress, waiting_user, resolved, closed) |
| preferredContact | string nullable |
| message | string |
| assignedTo | uuid nullable |
| createdAt | datetime |
| updatedAt | datetime |

---

## 12. Removal DTOs

## 12.1 CreateRemovalCaseRequest
| Feld | Typ | Pflicht |
|---|---|---|
| assetId | uuid | nein |
| matchId | uuid | nein |
| caseType | string | ja |
| platformName | string | nein |
| targetUrl | string | nein |
| legalBasis | string | nein |
| notes | string | nein |

## 12.2 RemovalCaseResponse
| Feld | Typ |
|---|---|
| id | uuid |
| caseType | string |
| platformName | string nullable |
| targetUrl | string nullable |
| legalBasis | string nullable |
| status | enum(open, preparing, submitted, under_review, followup_required, removed, partially_removed, rejected, closed) |
| supportRequested | boolean |
| summary | string nullable |
| createdAt | datetime |
| updatedAt | datetime |

## 12.3 AddRemovalActionRequest
| Feld | Typ | Pflicht |
|---|---|---|
| actionType | string | ja |
| recipient | string | nein |
| payloadSummary | string | nein |
| resultStatus | string | nein |
| externalTicketId | string | nein |

---

## 13. Help Text DTOs

## 13.1 HelpTextResponse
| Feld | Typ |
|---|---|
| id | uuid |
| contextKey | string |
| title | string |
| body | string |
| audience | string nullable |
| triggerType | string nullable |
| languageCode | string |
| active | boolean |

---

## 14. Jobs DTOs

## 14.1 JobResponse
| Feld | Typ |
|---|---|
| id | uuid |
| jobType | string |
| relatedCheckId | uuid nullable |
| relatedAssetId | uuid nullable |
| status | enum(queued, running, succeeded, failed, dead_letter) |
| errorMessage | string nullable |
| scheduledAt | datetime nullable |
| startedAt | datetime nullable |
| finishedAt | datetime nullable |
| createdAt | datetime |

---

## 15. Validierungsregeln, die noch finalisiert werden müssen

Vor echter OpenAPI-Datei noch präzisieren:
1. maximale Feldlängen
2. Dateigrößenlimits
3. URL-Validierungsregeln
4. Domain-/Telefonformatregeln
5. Sanitizing-Regeln für Freitext
6. Enum-Werte für sourceType, caseType, requestType, matchType, verdict

---

## 16. Daraus abzuleitende nächste Artefakte

1. echte `openapi.yaml`
2. NestJS DTO-Dateien
3. Frontend TypeScript Typen
4. Validierungsregeln pro Feld
5. API-Testfälle pro Endpoint

---

## 17. Fazit

Mit diesem DTO-Katalog kann das Coding-Tool deutlich präziser arbeiten, weil Request-/Response-Formen, Pflichtfelder und Zielstrukturen klarer definiert sind als in der bisherigen High-Level-API-Beschreibung.
