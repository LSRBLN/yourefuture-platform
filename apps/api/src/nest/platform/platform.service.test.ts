import assert from 'node:assert/strict';
import test from 'node:test';

import { PlatformService } from './platform.service.js';

test('PlatformService liefert versionierten Health-Status fuer Nest', () => {
  const service = new PlatformService();
  const result = service.getHealth('v1');

  assert.equal(result.status, 'ok');
  assert.equal(result.apiVersion, 'v1');
  assert.equal(result.apiBasePath, '/api/v1');
  assert.equal(result.transitionTarget, 'none');
  assert.equal(result.runtime.dependencies.database, 'configured');
  assert.equal(result.runtime.dependencies.queue, 'configured');
});

test('PlatformService liefert Worker-Topologie fuer Nest', () => {
  const service = new PlatformService();
  const result = service.getJobsTopology('v1');

  assert.equal(result.status, 'ok');
  assert.equal(result.apiVersion, 'v1');
  assert.equal(Array.isArray(result.data), true);
  assert.equal(result.data.some((job) => job.name === 'check.execute'), true);
});

test('PlatformService markiert deaktivierte Runtime-Abhaengigkeiten in Readiness', () => {
  const previousDisableDb = process.env.TRUSTSHIELD_DISABLE_DB_RUNTIME;
  const previousDisableQueue = process.env.TRUSTSHIELD_DISABLE_QUEUE_RUNTIME;

  process.env.TRUSTSHIELD_DISABLE_DB_RUNTIME = 'true';
  process.env.TRUSTSHIELD_DISABLE_QUEUE_RUNTIME = 'true';

  try {
    const service = new PlatformService();
    const result = service.getReadiness('v1');

    assert.equal(result.status, 'degraded');
    assert.equal(result.dependencies.database, 'disabled');
    assert.equal(result.dependencies.queue, 'disabled');
  } finally {
    if (previousDisableDb === undefined) {
      delete process.env.TRUSTSHIELD_DISABLE_DB_RUNTIME;
    } else {
      process.env.TRUSTSHIELD_DISABLE_DB_RUNTIME = previousDisableDb;
    }

    if (previousDisableQueue === undefined) {
      delete process.env.TRUSTSHIELD_DISABLE_QUEUE_RUNTIME;
    } else {
      process.env.TRUSTSHIELD_DISABLE_QUEUE_RUNTIME = previousDisableQueue;
    }
  }
});
