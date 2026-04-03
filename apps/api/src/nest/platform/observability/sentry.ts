import type { LoggerService } from '@nestjs/common';

import type { AppConfig } from '../../config/app-config.js';

type DynamicImport = (moduleName: string) => Promise<any>;

const dynamicImport: DynamicImport = new Function('moduleName', 'return import(moduleName);') as DynamicImport;

export async function initializeSentry(config: AppConfig, logger: LoggerService) {
  if (!config.sentry.dsn) {
    return {
      captureException: undefined,
    };
  }

  const Sentry = await dynamicImport('@sentry/node');
  Sentry.init({
    dsn: config.sentry.dsn,
  });

  logger.log('Sentry initialized', 'Observability');

  return {
    captureException: (exception: unknown, context?: { requestId: string }) => {
      Sentry.captureException(exception, {
        tags: context?.requestId ? { requestId: context.requestId } : undefined,
      });
    },
  };
}

