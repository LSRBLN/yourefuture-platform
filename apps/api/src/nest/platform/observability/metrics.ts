import type { INestApplication } from '@nestjs/common';

import type { AppConfig } from '../../config/app-config.js';

type DynamicImport = (moduleName: string) => Promise<any>;

const dynamicImport: DynamicImport = new Function('moduleName', 'return import(moduleName);') as DynamicImport;

type PromClientLike = {
  Registry: new () => {
    contentType: string;
    metrics: () => Promise<string>;
  };
  collectDefaultMetrics: (options: { register: unknown }) => void;
};

async function loadPromClient(promClient?: PromClientLike): Promise<PromClientLike> {
  if (promClient) {
    return promClient;
  }

  return (await dynamicImport('prom-client')) as PromClientLike;
}

export async function initializeMetrics(app: INestApplication, config: AppConfig, promClient?: PromClientLike) {
  if (!config.metrics.enabled) {
    return;
  }

  const instance = app.getHttpAdapter().getInstance() as {
    get: (path: string, handler: (request: unknown, response: { setHeader: (name: string, value: string) => void; send: (body: string) => void }) => void | Promise<void>) => void;
  };

  const loadedPromClient = await loadPromClient(promClient);
  const register = new loadedPromClient.Registry();
  loadedPromClient.collectDefaultMetrics({ register });

  instance.get(config.metrics.path, async (_request, response) => {
    response.setHeader('content-type', register.contentType);
    response.send(await register.metrics());
  });
}
