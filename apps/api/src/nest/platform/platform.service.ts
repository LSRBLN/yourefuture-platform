import { Injectable } from '@nestjs/common';

import { apiEnvironment, createAppManifest, getWorkerQueueTopology } from '@trustshield/core';

@Injectable()
export class PlatformService {
  private getDependencyStatus() {
    const database = process.env.TRUSTSHIELD_DISABLE_DB_RUNTIME === 'true' ? 'disabled' : 'configured';
    const queue = process.env.TRUSTSHIELD_DISABLE_QUEUE_RUNTIME === 'true' ? 'disabled' : 'configured';

    return {
      database,
      queue,
    } as const;
  }

  getHealth(apiVersion: 'v1') {
    return {
      status: 'ok',
      apiVersion,
      apiBasePath: '/api/v1',
      legacyPathCompatibility: false,
      authStrategy: 'oidc-or-bridge-bearer',
      transitionTarget: 'none',
      runtime: {
        dependencies: this.getDependencyStatus(),
      },
      app: createAppManifest('api'),
      env: apiEnvironment,
    };
  }

  getLiveness(apiVersion: 'v1') {
    return {
      status: 'ok',
      check: 'live',
      apiVersion,
    };
  }

  getReadiness(apiVersion: 'v1') {
    const dependencies = this.getDependencyStatus();

    return {
      status: dependencies.database === 'configured' ? 'ok' : 'degraded',
      check: 'ready',
      apiVersion,
      dependencies,
    };
  }

  getJobsTopology(apiVersion: 'v1') {
    return {
      status: 'ok',
      apiVersion,
      data: getWorkerQueueTopology(),
    };
  }
}
