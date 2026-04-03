# NestJS Transition Plan

## Ausgangslage

`apps/api` laeuft derzeit bewusst als leichter Node-HTTP-Adapter mit bereits getrennten Services und Controllern. Das ist als Vorstufe brauchbar, aber es fehlen noch die produktionsnahen NestJS-Einstiegspunkte:

- request-scoped auth/rbac guards
- versionierter `/api/v1`-Bootstrap
- infrastructure module boundaries fuer db/queue/config
- worker/api contracts ueber gemeinsame validation/job envelopes

## Zielbild

Die Migration sollte inkrementell erfolgen und den laufenden HTTP-Pfad nicht brechen:

1. `PlatformModule`
   - Config, request context, auth guard, rbac guard, health controller
2. `ChecksModule`
   - `ChecksController`, `ChecksService`, spaeter `ChecksRepository`
3. `SourcesModule`
   - `SourcesController`, `SourcesService`
4. `SupportRequestsModule`
   - `SupportRequestsController`, `SupportRequestsService`
5. `RemovalCasesModule`
   - `RemovalCasesController`, `RemovalCasesService`
6. `QueueModule`
   - BullMQ queue registration, producer ports, outbox hooks
7. `DatabaseModule`
   - Drizzle connection, repositories, transaction boundary

## Empfohlene Migrationsreihenfolge

1. HTTP bootstrap in `main.ts` durch NestFactory ersetzen, aber bestehende Service- und Controller-Logik weiterverwenden.
2. Header-basierten Request Context in Guard/Decorator ueberfuehren.
3. `/api/v1` als einzig kanonische Route setzen; Legacy-Pfade nur temporar ueber Alias oder Redirect behalten.
4. Store-Port aus `packages/db` auf Drizzle-Repositories umstellen.
5. Queue-Produktion aus API in `QueueModule` verschieben und im Worker mit echten BullMQ `Worker`-Instanzen hinterlegen.
6. Health/Readiness/Liveness trennen und spaeter um Redis/Postgres checks erweitern.

## Was in dieser Welle bereits vorbereitet ist

- versionierter `/api/v1`-Pfad mit Legacy-Kompatibilitaet
- request-context + RBAC-Einstieg ueber Header-Claims
- Drizzle-Schema fuer Kernobjekte
- gemeinsame BullMQ-nahe Job-Envelopes in `packages/validation`
- Worker-Topologie als Vorstufe fuer echte BullMQ-Registrierung
