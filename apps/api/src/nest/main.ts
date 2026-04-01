import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { ApiV1Module } from './api-v1.module.js';
import { ApiExceptionFilter } from './platform/api-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(ApiV1Module, {
    bufferLogs: true,
  });
  app.useGlobalFilters(new ApiExceptionFilter());

  await app.listen(Number.parseInt(process.env.NEST_PORT ?? process.env.PORT ?? '4100', 10));
}

void bootstrap();
