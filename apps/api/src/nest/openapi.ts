import 'reflect-metadata';

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ApiV1Module } from './api-v1.module.js';

function ensurePath(document: Record<string, any>, path: string, operation: string, value: Record<string, any>) {
  document.paths ??= {};
  document.paths[path] ??= {};
  document.paths[path][operation] ??= value;
}

function augmentMissingPaths(document: Record<string, any>) {
  ensurePath(document, '/api/v1/assets', 'post', {
    summary: 'Create a secure upload intent for an asset',
    tags: ['Assets'],
    security: [{ bearer: [] }],
    requestBody: { required: true },
    responses: { 201: { description: 'Asset upload intent created' } },
  });
  ensurePath(document, '/api/v1/assets/{id}', 'get', {
    summary: 'Get asset metadata by id',
    tags: ['Assets'],
    security: [{ bearer: [] }],
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
    responses: { 200: { description: 'Asset metadata' }, 404: { description: 'Asset not found' } },
  });
  ensurePath(document, '/api/v1/assets/{id}/deepfake-results', 'get', {
    summary: 'Get deepfake analysis status and results for an asset',
    tags: ['Assets'],
    security: [{ bearer: [] }],
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
    responses: { 200: { description: 'Deepfake analysis status' }, 404: { description: 'Asset not found' } },
  });
  ensurePath(document, '/api/v1/intake/orchestrator', 'post', {
    summary: 'Create transactional intake across check, source and support request',
    tags: ['Intake'],
    responses: { 202: { description: 'Intake accepted' } },
  });
  ensurePath(document, '/api/v1/removal-cases', 'post', {
    summary: 'Create removal case',
    tags: ['Removal'],
    security: [{ bearer: [] }],
    responses: { 201: { description: 'Removal case created' } },
  });
  ensurePath(document, '/api/v1/removal-cases/{id}', 'get', {
    summary: 'Get removal case by id',
    tags: ['Removal'],
    security: [{ bearer: [] }],
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
    responses: { 200: { description: 'Removal case detail' }, 404: { description: 'Removal case not found' } },
  });
  ensurePath(document, '/api/v1/removal-cases/{id}/actions', 'post', {
    summary: 'Append removal action',
    tags: ['Removal'],
    security: [{ bearer: [] }],
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
    responses: { 201: { description: 'Removal action created' }, 404: { description: 'Removal case not found' } },
  });
  ensurePath(document, '/api/v1/support-requests/{id}/assign', 'post', {
    summary: 'Assign support request',
    tags: ['Support Requests'],
    security: [{ bearer: [] }],
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
    responses: { 200: { description: 'Assignment updated' }, 404: { description: 'Support request not found' } },
  });
  ensurePath(document, '/api/v1/support-requests/{id}/status', 'post', {
    summary: 'Transition support request status',
    tags: ['Support Requests'],
    security: [{ bearer: [] }],
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
    responses: { 200: { description: 'Status updated' }, 404: { description: 'Support request not found' } },
  });
}

async function generateOpenApi() {
  process.env.TRUSTSHIELD_DISABLE_QUEUE_RUNTIME = 'true';
  const app = await NestFactory.create(ApiV1Module, {
    logger: false,
  });

  const config = new DocumentBuilder()
    .setTitle('TrustShield API')
    .setDescription('Generated OpenAPI baseline for the TrustShield Phase-1 API.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  augmentMissingPaths(document);
  await writeFile(join(process.cwd(), 'openapi.generated.json'), JSON.stringify(document, null, 2), 'utf8');
  await app.close();
}

void generateOpenApi().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
