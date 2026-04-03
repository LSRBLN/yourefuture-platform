import assert from 'node:assert/strict';
import test from 'node:test';

import type { AppConfig } from '../../config/app-config.js';
import { correlationIdMiddleware } from './request-context.middleware.js';
import { getRequestIdFromContext } from './request-context.store.js';
import { initializeMetrics } from './metrics.js';
import { initializeOpenTelemetry } from './otel.js';
import { initializeSentry } from './sentry.js';
import { StructuredLogger } from './structured-logger.js';
import type { RequestWithRequestId } from './request-context.middleware.js';

function createConfig(overrides?: Partial<AppConfig>): AppConfig {
  const defaultRateLimit: AppConfig['rateLimit'] = {
    defaultMaxRequests: 60,
    defaultWindowMs: 60_000,
    prefix: 'trustshield:ratelimit:test',
  };

  return {
    nodeEnv: 'test',
    app: { port: 0 },
    database: {
      url: 'postgresql://example.invalid/test',
      pool: { min: 0, max: 1, idleTimeoutMs: 1000, connectionTimeoutMs: 1000 },
      ssl: { mode: 'disable', rejectUnauthorized: false },
    },
    redis: { url: 'redis://localhost:6379' },
    jwt: {
      accessTtlSeconds: 3600,
      refreshTtlSeconds: 7200,
    },
    minio: {
      endpoint: 'http://localhost:9000',
      bucket: 'test',
      accessKey: 'test',
      secretKey: 'test',
      useSsl: false,
      presignedPutExpirySeconds: 900,
      presignedGetExpirySeconds: 900,
      tempObjectTtlSeconds: 86_400,
      allowedContentTypes: [],
    },
    cors: { allowlist: ['http://localhost:3000'] },
    rateLimit: overrides?.rateLimit ?? defaultRateLimit,
    sentry: { dsn: undefined },
    logging: { level: 'debug' },
    otel: { enabled: false, otlpEndpoint: undefined },
    metrics: { enabled: true, path: '/metrics' },
    ...overrides,
  };
}

test('Correlation-ID wird übernommen und in Logs propagiert', async () => {
  const output: string[] = [];
  const originalWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = ((chunk: string | Uint8Array) => {
    output.push(String(chunk));
    return true;
  }) as typeof process.stdout.write;

  try {
    const request: RequestWithRequestId = {
      headers: {
        'x-request-id': 'req-test-123',
      },
    };

    const headers: Record<string, string> = {};
    const response = {
      setHeader: (name: string, value: string) => {
        headers[name] = value;
      },
    };

    const logger = new StructuredLogger('debug');
    let contextRequestId: string | undefined;

    correlationIdMiddleware(request, response, () => {
      contextRequestId = getRequestIdFromContext();
      logger.log('hello-observability', 'TestContext');
    });

    assert.equal(request.requestId, 'req-test-123');
    assert.equal(headers['x-request-id'], 'req-test-123');
    assert.equal(contextRequestId, 'req-test-123');

    const joined = output.join('');
    assert.match(joined, /"requestId":"req-test-123"/u);
    assert.match(joined, /"message":"hello-observability"/u);
  } finally {
    process.stdout.write = originalWrite;
  }
});

test('Metrics-Endpoint wird registriert', async () => {
  let registeredPath = '';
  let registeredHandler:
    | ((request: unknown, response: { setHeader: (name: string, value: string) => void; send: (body: string) => void }) => void | Promise<void>)
    | undefined;

  const fakeApp = {
    getHttpAdapter: () => ({
      getInstance: () => ({
        get: (
          path: string,
          handler: (request: unknown, response: { setHeader: (name: string, value: string) => void; send: (body: string) => void }) =>
            | void
            | Promise<void>,
        ) => {
          registeredPath = path;
          registeredHandler = handler;
        },
      }),
    }),
  };

  const promClientMock = {
    Registry: class {
      contentType = 'text/plain; version=0.0.4';

      async metrics() {
        return '# fake metrics';
      }
    },
    collectDefaultMetrics: () => undefined,
  };

  await initializeMetrics(fakeApp as never, createConfig(), promClientMock);

  assert.equal(registeredPath, '/metrics');
  assert.ok(registeredHandler);

  const responseHeaders: Record<string, string> = {};
  let responseBody = '';
  await registeredHandler?.({}, {
    setHeader: (name: string, value: string) => {
      responseHeaders[name] = value;
    },
    send: (body: string) => {
      responseBody = body;
    },
  });

  assert.equal(responseHeaders['content-type'], 'text/plain; version=0.0.4');
  assert.match(responseBody, /fake metrics/u);
});

test('OTel und Sentry verhalten sich als no-op bei deaktivierter Config', async () => {
  const config = createConfig({ otel: { enabled: false, otlpEndpoint: undefined }, sentry: { dsn: undefined } });
  const stopOtel = await initializeOpenTelemetry(config);
  assert.equal(stopOtel, undefined);

  let loggerCalled = false;
  const sentry = await initializeSentry(config, {
    log: () => {
      loggerCalled = true;
    },
    error: () => undefined,
    warn: () => undefined,
  });

  assert.equal(sentry.captureException, undefined);
  assert.equal(loggerCalled, false);
});
