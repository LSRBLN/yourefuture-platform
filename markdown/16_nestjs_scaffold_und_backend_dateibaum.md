# NestJS-Scaffold und Backend-Dateibaum

## 1. Ziel

Dieses Dokument definiert die konkrete Scaffold-Struktur für das Backend in NestJS.

Es dient als direkte Vorlage für ein Vibe-Coding-Tool, damit:
- die Datei- und Modulstruktur konsistent erzeugt wird
- Verantwortlichkeiten klar getrennt sind
- Controller, Services, Repositories und Policies systematisch angelegt werden

---

## 2. Zielarchitektur im Code

- `apps/api` enthält die HTTP-API
- `apps/worker` enthält Queue- und Analyse-Worker
- `packages/shared` enthält DTOs, Enums, Fehler, Interfaces
- `packages/database` enthält Migrationen, Seeds und DB-Zugriff
- `packages/provider-sdk` enthält Provider-Connectoren

---

## 3. Datei- und Ordnerbaum

```text
backend/
  apps/
    api/
      src/
        main.ts
        app.module.ts
        app.controller.ts
        app.service.ts
        config/
          app.config.ts
          auth.config.ts
          storage.config.ts
          queue.config.ts
        common/
          decorators/
            current-user.decorator.ts
            roles.decorator.ts
          filters/
            http-exception.filter.ts
          guards/
            jwt-auth.guard.ts
            roles.guard.ts
            ownership.guard.ts
          interceptors/
            request-id.interceptor.ts
            logging.interceptor.ts
          middleware/
            request-id.middleware.ts
          pipes/
            validation.pipe.ts
          policies/
            base.policy.ts
          types/
            auth-user.type.ts
        modules/
          auth/
            auth.module.ts
            auth.controller.ts
            auth.service.ts
            auth.repository.ts
            dto/
              register.dto.ts
              login.dto.ts
              refresh-token.dto.ts
            interfaces/
              auth-tokens.interface.ts
            policies/
              auth.policy.ts
          users/
            users.module.ts
            users.controller.ts
            users.service.ts
            users.repository.ts
            dto/
              update-profile.dto.ts
            entities/
              user.entity.ts
              user-profile.entity.ts
            policies/
              users.policy.ts
          providers/
            providers.module.ts
            providers.controller.ts
            providers.service.ts
            providers.repository.ts
            dto/
              create-provider.dto.ts
              update-provider.dto.ts
              list-providers.dto.ts
            entities/
              provider.entity.ts
              provider-capability.entity.ts
              provider-endpoint.entity.ts
              provider-field.entity.ts
            policies/
              providers.policy.ts
          checks/
            checks.module.ts
            checks.controller.ts
            checks.service.ts
            checks.repository.ts
            checks.orchestrator.ts
            dto/
              create-check.dto.ts
              list-checks.dto.ts
              rerun-check.dto.ts
            entities/
              check.entity.ts
              check-result.entity.ts
            mappers/
              check-response.mapper.ts
            policies/
              checks.policy.ts
          assets/
            assets.module.ts
            assets.controller.ts
            assets.service.ts
            assets.repository.ts
            dto/
              upload-asset.dto.ts
              list-assets.dto.ts
            entities/
              asset.entity.ts
            policies/
              assets.policy.ts
          deepfake-results/
            deepfake-results.module.ts
            deepfake-results.controller.ts
            deepfake-results.service.ts
            deepfake-results.repository.ts
            entities/
              deepfake-result.entity.ts
            mappers/
              deepfake-result.mapper.ts
          sources/
            sources.module.ts
            sources.controller.ts
            sources.service.ts
            sources.repository.ts
            dto/
              create-source.dto.ts
              update-source.dto.ts
            entities/
              user-submitted-source.entity.ts
            policies/
              sources.policy.ts
          matches/
            matches.module.ts
            matches.controller.ts
            matches.service.ts
            matches.repository.ts
            entities/
              content-match.entity.ts
            policies/
              matches.policy.ts
          workflows/
            workflows.module.ts
            workflows.controller.ts
            workflows.service.ts
            workflows.repository.ts
            workflow-engine.service.ts
            dto/
              update-workflow-step.dto.ts
            entities/
              workflow.entity.ts
              workflow-step.entity.ts
              workflow-instance.entity.ts
              workflow-instance-step.entity.ts
            policies/
              workflows.policy.ts
          support-requests/
            support-requests.module.ts
            support-requests.controller.ts
            support-requests.service.ts
            support-requests.repository.ts
            dto/
              create-support-request.dto.ts
              assign-support-request.dto.ts
              update-support-status.dto.ts
            entities/
              support-request.entity.ts
            policies/
              support-requests.policy.ts
          removal-cases/
            removal-cases.module.ts
            removal-cases.controller.ts
            removal-cases.service.ts
            removal-cases.repository.ts
            dto/
              create-removal-case.dto.ts
              add-removal-action.dto.ts
              update-removal-case.dto.ts
            entities/
              removal-case.entity.ts
              removal-action.entity.ts
            policies/
              removal-cases.policy.ts
          help-texts/
            help-texts.module.ts
            help-texts.controller.ts
            help-texts.service.ts
            help-texts.repository.ts
            dto/
              create-help-text.dto.ts
              update-help-text.dto.ts
            entities/
              help-text.entity.ts
          jobs/
            jobs.module.ts
            jobs.controller.ts
            jobs.service.ts
            jobs.repository.ts
            entities/
              job.entity.ts
          notifications/
            notifications.module.ts
            notifications.service.ts
            notifications.repository.ts
            entities/
              notification.entity.ts
          audit-logs/
            audit-logs.module.ts
            audit-logs.controller.ts
            audit-logs.service.ts
            audit-logs.repository.ts
            entities/
              audit-log.entity.ts
          admin/
            admin.module.ts
            admin.controller.ts
            admin.service.ts
            dto/
              admin-dashboard-query.dto.ts
    worker/
      src/
        main.ts
        app.module.ts
        config/
        common/
        jobs/
          leak-check/
            leak-check.processor.ts
            leak-check.handler.ts
          image-analysis/
            image-analysis.processor.ts
            image-analysis.handler.ts
          video-analysis/
            video-analysis.processor.ts
            video-analysis.handler.ts
          content-match/
            content-match.processor.ts
            content-match.handler.ts
          workflow-generation/
            workflow-generation.processor.ts
            workflow-generation.handler.ts
          removal-followup/
            removal-followup.processor.ts
            removal-followup.handler.ts
        services/
          queue.service.ts
          storage.service.ts
          hashing.service.ts
          media-analysis.service.ts
          risk-scoring.service.ts
        providers/
          provider-runtime.service.ts
        utils/
          job-logger.ts
  packages/
    shared/
      src/
        dto/
        enums/
        interfaces/
        constants/
        errors/
        validation/
        utils/
    database/
      migrations/
      seeds/
      schema/
      src/
        db.module.ts
        db.service.ts
    provider-sdk/
      src/
        interfaces/
          provider-connector.interface.ts
        connectors/
          hibp/
            hibp.connector.ts
            hibp.mapper.ts
          hibp-passwords/
            hibp-passwords.connector.ts
          leakcheck/
            leakcheck.connector.ts
            leakcheck.mapper.ts
          dehashed/
            dehashed.connector.ts
            dehashed.mapper.ts
          breachdirectory/
            breachdirectory.connector.ts
            breachdirectory.mapper.ts
        normalizers/
          check-result.normalizer.ts
    openapi/
      openapi.yaml
      paths/
      schemas/
  tests/
    e2e/
    integration/
    security/
  scripts/
    seed-providers.ts
    seed-help-texts.ts
    create-admin.ts
```

---

## 4. Modulkonvention

Jedes Domänenmodul folgt möglichst dieser Struktur:

```text
module-name/
  module-name.module.ts
  module-name.controller.ts
  module-name.service.ts
  module-name.repository.ts
  dto/
  entities/
  mappers/
  policies/
```

### Verantwortlichkeiten
- **controller**: HTTP-Schicht, keine Business-Logik
- **service**: Business-Logik
- **repository**: Datenzugriff
- **dto**: Validierung und Input/Output-Verträge
- **entities**: DB-/Domainmodelle
- **mappers**: API-Response-Aufbereitung
- **policies**: Berechtigungslogik

---

## 5. Generierungsreihenfolge für das Coding-Tool

1. `common` und `config`
2. `auth`
3. `users`
4. `providers`
5. `checks`
6. `jobs`
7. `assets`
8. `help-texts`
9. `sources`
10. `matches`
11. `workflows`
12. `support-requests`
13. `removal-cases`
14. `deepfake-results`
15. `notifications`
16. `audit-logs`
17. `admin`
18. Worker-Jobs
19. Provider-SDK

---

## 6. Nicht verhandelbare Scaffold-Regeln

1. keine Business-Logik in Controllern
2. Policies getrennt halten
3. DTOs immer vor Nutzung definieren
4. Repository-Schicht nicht überspringen
5. jeder Endpoint bekommt Validierung
6. sensible Module brauchen Autorisierungstests
7. Worker und API bleiben getrennt
8. Provider-spezifischer Code nicht im Checks-Kernmodul mischen

---

## 7. Daraus abzuleitende Coding-Tasks

1. NestJS Workspace anlegen
2. Common Layer anlegen
3. Auth- und Users-Modul generieren
4. Provider-/Checks-/Jobs-Grundmodule generieren
5. Asset- und Source-Module generieren
6. Workflow-/Support-/Removal-Module generieren
7. Worker-Job-Struktur anlegen
8. Provider-SDK Struktur anlegen

---

## 8. Fazit

Mit diesem Scaffold kann ein Vibe-Coding-Tool das Backend deutlich konsistenter aufbauen, weil Dateibaum, Modulgrenzen und Verantwortlichkeiten vorab festgelegt sind.
