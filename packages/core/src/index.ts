export type AppId = 'web' | 'admin' | 'api' | 'worker';

export * from './status.js';
export * from './contracts.js';
export * from './trustshield-records.js';
export * from './trustshield-selectors.js';
export * from './trustshield-mocks.js';
export * from './jobs.js';

export type AppManifest = {
  id: AppId;
  name: string;
  phase: 'phase-1';
  status: 'bootstrap';
};

export const apiEnvironment = {
  transport: 'http',
  runtime: 'node',
  framework: 'typescript-skeleton',
} as const;

export const workerEnvironment = {
  transport: 'queue',
  runtime: 'node',
  framework: 'typescript-skeleton',
} as const;

export function createAppManifest(id: AppId): AppManifest {
  return {
    id,
    name: `@trustshield/${id}`,
    phase: 'phase-1',
    status: 'bootstrap',
  };
}
