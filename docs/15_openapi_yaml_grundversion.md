# OpenAPI YAML – Grundversion

> Hinweis: Dieses Dokument enthält eine startfähige OpenAPI-Grundversion als Markdown-Codeblock.  
> Es ist bewusst kompakt gehalten und soll als belastbares Ausgangsartefakt für das Vibe-Coding-Tool dienen.

```yaml
openapi: 3.1.0
info:
  title: TrustShield API
  version: 0.1.0
  description: >
    API fuer Leak-Checks, Medienanalyse, Workflows, Support-Anfragen
    und Removal-Cases.

servers:
  - url: /api/v1

tags:
  - name: Auth
  - name: Users
  - name: Providers
  - name: Checks
  - name: Assets
  - name: Sources
  - name: Matches
  - name: Workflows
  - name: SupportRequests
  - name: RemovalCases
  - name: HelpTexts
  - name: Jobs
  - name: Admin

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    ErrorResponse:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            details:
              type: array
              items:
                type: object
                properties:
                  field:
                    type: string
                  message:
                    type: string
            requestId:
              type: string
              format: uuid
          required: [code, message]
      required: [error]

    PaginationMeta:
      type: object
      properties:
        page:
          type: integer
          minimum: 1
        limit:
          type: integer
          minimum: 1
        total:
          type: integer
          minimum: 0
      required: [page, limit, total]

    UserRole:
      type: string
      enum: [user, support, analyst, admin]

    CheckType:
      type: string
      enum:
        - leak_email
        - leak_username
        - leak_phone
        - leak_domain
        - password_hash
        - image
        - video
        - source_only

    CheckStatus:
      type: string
      enum: [pending, queued, running, completed, failed, cancelled]

    Severity:
      type: string
      enum: [low, medium, high, critical]

    SupportPriority:
      type: string
      enum: [low, medium, high, urgent]

    SupportStatus:
      type: string
      enum: [open, triaged, assigned, in_progress, waiting_user, resolved, closed]

    RemovalStatus:
      type: string
      enum:
        - open
        - preparing
        - submitted
        - under_review
        - followup_required
        - removed
        - partially_removed
        - rejected
        - closed

    WorkflowInstanceStatus:
      type: string
      enum: [active, completed, cancelled]

    WorkflowStepStatus:
      type: string
      enum: [pending, in_progress, completed, skipped, blocked]

    RegisterRequest:
      type: object
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 12
        fullName:
          type: string
          maxLength: 150
      required: [email, password]

    LoginRequest:
      type: object
      properties:
        email:
          type: string
          format: email
        password:
          type: string
      required: [email, password]

    AuthResponse:
      type: object
      properties:
        user:
          type: object
          properties:
            id:
              type: string
              format: uuid
            email:
              type: string
              format: email
            role:
              $ref: '#/components/schemas/UserRole'
          required: [id, email, role]
        token:
          type: string
        refreshToken:
          type: string
      required: [user, token, refreshToken]

    CheckInput:
      type: object
      properties:
        email:
          type: string
          format: email
        username:
          type: string
        phone:
          type: string
        domain:
          type: string
        passwordHashPrefix:
          type: string
        assetId:
          type: string
          format: uuid
        submittedSourceIds:
          type: array
          items:
            type: string
            format: uuid

    CreateCheckRequest:
      type: object
      properties:
        type:
          $ref: '#/components/schemas/CheckType'
        input:
          $ref: '#/components/schemas/CheckInput'
      required: [type, input]

    CheckResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        type:
          $ref: '#/components/schemas/CheckType'
        status:
          $ref: '#/components/schemas/CheckStatus'
        riskScore:
          type: integer
          nullable: true
        severity:
          allOf:
            - $ref: '#/components/schemas/Severity'
          nullable: true
        summary:
          type: string
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required: [id, type, status, createdAt, updatedAt]

    CheckResultResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        providerId:
          type: string
          format: uuid
          nullable: true
        hitFound:
          type: boolean
        hitType:
          type: string
          nullable: true
        breachName:
          type: string
          nullable: true
        breachDate:
          type: string
          format: date
          nullable: true
        exposedData:
          oneOf:
            - type: array
              items:
                type: string
            - type: object
        sourceConfidence:
          type: number
          nullable: true
        normalizedSummary:
          type: string
          nullable: true
      required: [id, hitFound]

    AssetResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        assetType:
          type: string
          enum: [image, video, document, other]
        mimeType:
          type: string
          nullable: true
        originalFilename:
          type: string
          nullable: true
        fileSizeBytes:
          type: integer
          nullable: true
        width:
          type: integer
          nullable: true
        height:
          type: integer
          nullable: true
        durationSeconds:
          type: number
          nullable: true
        createdAt:
          type: string
          format: date-time
      required: [id, assetType, createdAt]

    DeepfakeResultResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        assetId:
          type: string
          format: uuid
        checkId:
          type: string
          format: uuid
          nullable: true
        modelName:
          type: string
        modelVersion:
          type: string
          nullable: true
        probabilityFake:
          type: number
          nullable: true
        probabilityManipulated:
          type: number
          nullable: true
        confidence:
          type: number
          nullable: true
        verdict:
          type: string
        summary:
          type: string
      required: [id, assetId, modelName, verdict, summary]

    CreateSourceRequest:
      type: object
      properties:
        sourceType:
          type: string
        sourceUrl:
          type: string
          format: uri
        platformName:
          type: string
        pageTitle:
          type: string
        notes:
          type: string
        assetId:
          type: string
          format: uuid
        checkId:
          type: string
          format: uuid
      required: [sourceType, sourceUrl]

    SourceResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        sourceType:
          type: string
        sourceUrl:
          type: string
          format: uri
        sourceDomain:
          type: string
          nullable: true
        platformName:
          type: string
          nullable: true
        pageTitle:
          type: string
          nullable: true
        notes:
          type: string
          nullable: true
        validationStatus:
          type: string
          enum: [pending, validated, invalid, rejected]
        createdAt:
          type: string
          format: date-time
      required: [id, sourceType, sourceUrl, validationStatus, createdAt]

    ContentMatchResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        assetId:
          type: string
          format: uuid
          nullable: true
        checkId:
          type: string
          format: uuid
          nullable: true
        matchType:
          type: string
        matchedUrl:
          type: string
          format: uri
          nullable: true
        platformName:
          type: string
          nullable: true
        confidence:
          type: number
          nullable: true
        knownFake:
          type: boolean
        knownLeak:
          type: boolean
        active:
          type: boolean
        summary:
          type: string
          nullable: true
      required: [id, matchType, knownFake, knownLeak, active]

    WorkflowInstanceResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        workflowId:
          type: string
          format: uuid
        status:
          $ref: '#/components/schemas/WorkflowInstanceStatus'
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required: [id, workflowId, status, createdAt, updatedAt]

    WorkflowStepResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        workflowStepId:
          type: string
          format: uuid
        status:
          $ref: '#/components/schemas/WorkflowStepStatus'
        title:
          type: string
        description:
          type: string
          nullable: true
        requiresConfirmation:
          type: boolean
        supportHandoverPossible:
          type: boolean
      required: [id, workflowStepId, status, title, requiresConfirmation, supportHandoverPossible]

    UpdateWorkflowStepRequest:
      type: object
      properties:
        status:
          $ref: '#/components/schemas/WorkflowStepStatus'
        notes:
          type: string
      required: [status]

    CreateSupportRequest:
      type: object
      properties:
        requestType:
          type: string
        priority:
          $ref: '#/components/schemas/SupportPriority'
        checkId:
          type: string
          format: uuid
        assetId:
          type: string
          format: uuid
        removalCaseId:
          type: string
          format: uuid
        preferredContact:
          type: string
        message:
          type: string
      required: [requestType, message]

    SupportRequestResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        requestType:
          type: string
        priority:
          $ref: '#/components/schemas/SupportPriority'
        status:
          $ref: '#/components/schemas/SupportStatus'
        preferredContact:
          type: string
          nullable: true
        message:
          type: string
        assignedTo:
          type: string
          format: uuid
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required: [id, requestType, priority, status, message, createdAt, updatedAt]

    CreateRemovalCaseRequest:
      type: object
      properties:
        assetId:
          type: string
          format: uuid
        matchId:
          type: string
          format: uuid
        caseType:
          type: string
        platformName:
          type: string
        targetUrl:
          type: string
          format: uri
        legalBasis:
          type: string
        notes:
          type: string
      required: [caseType]

    RemovalCaseResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        caseType:
          type: string
        platformName:
          type: string
          nullable: true
        targetUrl:
          type: string
          format: uri
          nullable: true
        legalBasis:
          type: string
          nullable: true
        status:
          $ref: '#/components/schemas/RemovalStatus'
        supportRequested:
          type: boolean
        summary:
          type: string
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required: [id, caseType, status, supportRequested, createdAt, updatedAt]

    HelpTextResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        contextKey:
          type: string
        title:
          type: string
        body:
          type: string
        audience:
          type: string
          nullable: true
        triggerType:
          type: string
          nullable: true
        languageCode:
          type: string
        active:
          type: boolean
      required: [id, contextKey, title, body, languageCode, active]

    JobResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        jobType:
          type: string
        relatedCheckId:
          type: string
          format: uuid
          nullable: true
        relatedAssetId:
          type: string
          format: uuid
          nullable: true
        status:
          type: string
          enum: [queued, running, succeeded, failed, dead_letter]
        errorMessage:
          type: string
          nullable: true
        scheduledAt:
          type: string
          format: date-time
          nullable: true
        startedAt:
          type: string
          format: date-time
          nullable: true
        finishedAt:
          type: string
          format: date-time
          nullable: true
        createdAt:
          type: string
          format: date-time
      required: [id, jobType, status, createdAt]

paths:
  /auth/register:
    post:
      tags: [Auth]
      summary: Nutzer registrieren
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterRequest'
      responses:
        '200':
          description: Erfolgreiche Registrierung
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '400':
          description: Validierungsfehler
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /auth/login:
    post:
      tags: [Auth]
      summary: Nutzer anmelden
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: Erfolgreiches Login
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'

  /auth/me:
    get:
      tags: [Auth]
      summary: Aktuellen Nutzer laden
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Nutzerprofil
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                    format: uuid
                  email:
                    type: string
                    format: email
                  role:
                    $ref: '#/components/schemas/UserRole'
                required: [id, email, role]

  /checks:
    post:
      tags: [Checks]
      summary: Check erstellen
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateCheckRequest'
      responses:
        '201':
          description: Check erstellt
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CheckResponse'
    get:
      tags: [Checks]
      summary: Eigene Checks listen
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Check-Liste
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: '#/components/schemas/CheckResponse'
                  page:
                    type: integer
                  limit:
                    type: integer
                  total:
                    type: integer
                required: [items, page, limit, total]

  /checks/{checkId}:
    get:
      tags: [Checks]
      summary: Check laden
      security:
        - bearerAuth: []
      parameters:
        - name: checkId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Check-Details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CheckResponse'

  /checks/{checkId}/results:
    get:
      tags: [Checks]
      summary: Ergebnisse eines Checks laden
      security:
        - bearerAuth: []
      parameters:
        - name: checkId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Ergebnisliste
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: '#/components/schemas/CheckResultResponse'
                required: [items]

  /assets:
    post:
      tags: [Assets]
      summary: Asset hochladen
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
              required: [file]
      responses:
        '201':
          description: Asset gespeichert
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AssetResponse'

  /assets/{assetId}:
    get:
      tags: [Assets]
      summary: Asset laden
      security:
        - bearerAuth: []
      parameters:
        - name: assetId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Asset
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AssetResponse'

  /assets/{assetId}/deepfake-results:
    get:
      tags: [Assets]
      summary: Deepfake-Ergebnisse laden
      security:
        - bearerAuth: []
      parameters:
        - name: assetId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Analyseergebnisse
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: '#/components/schemas/DeepfakeResultResponse'
                required: [items]

  /sources:
    post:
      tags: [Sources]
      summary: Quelle einreichen
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateSourceRequest'
      responses:
        '201':
          description: Quelle gespeichert
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SourceResponse'
    get:
      tags: [Sources]
      summary: Eigene Quellen listen
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Quellenliste
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: '#/components/schemas/SourceResponse'
                required: [items]

  /matches/{matchId}:
    get:
      tags: [Matches]
      summary: Match-Details laden
      security:
        - bearerAuth: []
      parameters:
        - name: matchId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Match
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ContentMatchResponse'

  /workflows/{workflowInstanceId}:
    get:
      tags: [Workflows]
      summary: Workflow-Instanz laden
      security:
        - bearerAuth: []
      parameters:
        - name: workflowInstanceId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Workflow-Instanz
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WorkflowInstanceResponse'

  /workflows/{workflowInstanceId}/steps:
    get:
      tags: [Workflows]
      summary: Workflow-Schritte laden
      security:
        - bearerAuth: []
      parameters:
        - name: workflowInstanceId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Workflow-Schritte
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: '#/components/schemas/WorkflowStepResponse'
                required: [items]

  /workflows/{workflowInstanceId}/steps/{stepId}:
    patch:
      tags: [Workflows]
      summary: Workflow-Schritt aktualisieren
      security:
        - bearerAuth: []
      parameters:
        - name: workflowInstanceId
          in: path
          required: true
          schema:
            type: string
            format: uuid
        - name: stepId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateWorkflowStepRequest'
      responses:
        '200':
          description: Aktualisierter Schritt
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WorkflowStepResponse'

  /support-requests:
    post:
      tags: [SupportRequests]
      summary: Support-Anfrage erstellen
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateSupportRequest'
      responses:
        '201':
          description: Support-Anfrage erstellt
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SupportRequestResponse'
    get:
      tags: [SupportRequests]
      summary: Eigene Support-Anfragen laden
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Support-Anfragen
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: '#/components/schemas/SupportRequestResponse'
                required: [items]

  /removal-cases:
    post:
      tags: [RemovalCases]
      summary: Removal-Fall erstellen
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateRemovalCaseRequest'
      responses:
        '201':
          description: Removal-Fall erstellt
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RemovalCaseResponse'
    get:
      tags: [RemovalCases]
      summary: Eigene Removal-Fälle laden
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Removal-Fälle
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: '#/components/schemas/RemovalCaseResponse'
                required: [items]

  /help-texts:
    get:
      tags: [HelpTexts]
      summary: Hilfetexte laden
      security:
        - bearerAuth: []
      parameters:
        - name: contextKey
          in: query
          required: false
          schema:
            type: string
        - name: languageCode
          in: query
          required: false
          schema:
            type: string
      responses:
        '200':
          description: Hilfetexte
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: '#/components/schemas/HelpTextResponse'
                required: [items]

  /jobs/{jobId}:
    get:
      tags: [Jobs]
      summary: Job laden
      security:
        - bearerAuth: []
      parameters:
        - name: jobId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Job
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/JobResponse'

  /admin/providers:
    get:
      tags: [Admin]
      summary: Provider im Admin listen
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Providerliste
    post:
      tags: [Admin]
      summary: Provider anlegen
      security:
        - bearerAuth: []
      responses:
        '201':
          description: Provider angelegt

  /admin/dashboard:
    get:
      tags: [Admin]
      summary: Ops Dashboard laden
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Dashboarddaten
```

## Nächste Ergänzungen
1. vollständige Path-Dateien je Modul
2. Response-Codes je Fehlerfall
3. Admin-spezifische DTOs
4. Provider-spezifische Health-/Test-Endpunkte
5. Upload-Limits und Response-Beispiele
