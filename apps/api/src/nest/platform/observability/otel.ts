import type { AppConfig } from '../../config/app-config.js';

type DynamicImport = (moduleName: string) => Promise<any>;

const dynamicImport: DynamicImport = new Function('moduleName', 'return import(moduleName);') as DynamicImport;

export async function initializeOpenTelemetry(config: AppConfig): Promise<(() => Promise<void>) | undefined> {
  if (!config.otel.enabled) {
    return undefined;
  }

  const [{ HttpInstrumentation }, { ExpressInstrumentation }, { PgInstrumentation }, { NodeSDK }, { OTLPTraceExporter }] =
    await Promise.all([
      dynamicImport('@opentelemetry/instrumentation-http'),
      dynamicImport('@opentelemetry/instrumentation-express'),
      dynamicImport('@opentelemetry/instrumentation-pg'),
      dynamicImport('@opentelemetry/sdk-node'),
      dynamicImport('@opentelemetry/exporter-trace-otlp-http'),
    ]);

  const traceExporter = config.otel.otlpEndpoint
    ? new OTLPTraceExporter({
        url: config.otel.otlpEndpoint,
      })
    : undefined;

  const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation(), new PgInstrumentation()],
  });

  await sdk.start();
  return async () => {
    await sdk.shutdown();
  };
}
