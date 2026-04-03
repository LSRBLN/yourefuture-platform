import 'reflect-metadata';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { ApiV1Module } from './api-v1.module.js';
import type { AppConfig } from './config/app-config.js';
import { initializeMetrics } from './platform/observability/metrics.js';
import { initializeOpenTelemetry } from './platform/observability/otel.js';
import { correlationIdMiddleware } from './platform/observability/request-context.middleware.js';
import { getRequestIdFromContext } from './platform/observability/request-context.store.js';
import { initializeSentry } from './platform/observability/sentry.js';
import { StructuredLogger } from './platform/observability/structured-logger.js';
import { ApiExceptionFilter } from './platform/api-exception.filter.js';
import { applyGlobalSecurity } from './platform/security.js';

async function bootstrap() {
  const app = await NestFactory.create(ApiV1Module, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');
  if (!appConfig) {
    throw new Error('Fehlende Konfiguration: app');
  }

  const port = appConfig.app.port;

  if (port === undefined) {
    throw new Error('Fehlende Konfiguration: app.port');
  }

  const logger = new StructuredLogger(appConfig.logging.level);
  app.useLogger(logger);
  app.flushLogs();

  const stopOtel = await initializeOpenTelemetry(appConfig);
  const sentry = await initializeSentry(appConfig, logger);
  app.useGlobalFilters(new ApiExceptionFilter(sentry.captureException));
  applyGlobalSecurity(app, appConfig);

  app.use(correlationIdMiddleware);
  app.use((request: { method?: string; originalUrl?: string }, response: { on: (event: 'finish', cb: () => void) => void; statusCode?: number }, next: () => void) => {
    const startedAt = Date.now();
    response.on('finish', () => {
      logger.log(
        {
          method: request.method,
          path: request.originalUrl,
          statusCode: response.statusCode,
          durationMs: Date.now() - startedAt,
          requestId: getRequestIdFromContext(),
        },
        'HttpRequest',
      );
    });

    next();
  });

  await initializeMetrics(app, appConfig);

  await app.listen(port);

  const shutdown = async () => {
    await stopOtel?.();
    await app.close();
    process.exit(0);
  };

  process.once('SIGTERM', () => {
    void shutdown();
  });
  process.once('SIGINT', () => {
    void shutdown();
  });
}

void bootstrap();
