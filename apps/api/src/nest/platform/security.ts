import { ValidationPipe, type INestApplication } from '@nestjs/common';
import helmet from 'helmet';

import type { AppConfig } from '../config/app-config.js';

function normalizeOrigin(origin: string) {
  return origin.trim().toLowerCase();
}

export function applyGlobalSecurity(app: INestApplication, appConfig: AppConfig) {
  const allowlist = new Set(appConfig.cors.allowlist.map(normalizeOrigin));

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          frameAncestors: ["'none'"],
          objectSrc: ["'none'"],
          imgSrc: ["'self'", 'data:'],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'"],
          formAction: ["'self'"],
        },
      },
      strictTransportSecurity:
        appConfig.nodeEnv !== 'development'
          ? {
              maxAge: 15_552_000,
              includeSubDomains: true,
              preload: true,
            }
          : false,
    }),
  );

  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
      if (typeof origin !== 'string' || origin.length === 0) {
        callback(null, true);
        return;
      }

      if (allowlist.has(normalizeOrigin(origin))) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Trustshield-Subject', 'X-Trustshield-Role', 'X-Trustshield-Scopes', 'X-Trustshield-Tenant-Id'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
      validationError: {
        target: false,
        value: false,
      },
      disableErrorMessages: appConfig.nodeEnv === 'production',
    }),
  );
}
