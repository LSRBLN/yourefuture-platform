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
export declare const apiEnvironment: {
    readonly transport: "http";
    readonly runtime: "node";
    readonly framework: "typescript-skeleton";
};
export declare const workerEnvironment: {
    readonly transport: "queue";
    readonly runtime: "node";
    readonly framework: "typescript-skeleton";
};
export declare function createAppManifest(id: AppId): AppManifest;
