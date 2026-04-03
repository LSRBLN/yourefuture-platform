export * from './status.js';
export * from './contracts.js';
export * from './trustshield-records.js';
export * from './trustshield-selectors.js';
export * from './trustshield-mocks.js';
export * from './jobs.js';
export const apiEnvironment = {
    transport: 'http',
    runtime: 'node',
    framework: 'typescript-skeleton',
};
export const workerEnvironment = {
    transport: 'queue',
    runtime: 'node',
    framework: 'typescript-skeleton',
};
export function createAppManifest(id) {
    return {
        id,
        name: `@trustshield/${id}`,
        phase: 'phase-1',
        status: 'bootstrap',
    };
}
