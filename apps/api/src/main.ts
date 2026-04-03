import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { ApiV1Module } from './nest/api-v1.module.js';
import { ApiExceptionFilter } from './nest/platform/api-exception.filter.js';

const port = Number.parseInt(process.env.PORT ?? '4000', 10);

async function bootstrapNest() {
  const app = await NestFactory.create(ApiV1Module, {
    bufferLogs: true,
  });
  app.useGlobalFilters(new ApiExceptionFilter());

  await app.listen(port);
  console.log(JSON.stringify({ status: 'listening', port, framework: 'nestjs', transitionTarget: 'nestjs' }));
}

void bootstrapNest();
