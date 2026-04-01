export type WorkerQueueName = 'assets' | 'checks' | 'reviews' | 'support' | 'removals' | 'retention';
export type WorkerJobName = 'asset.scan' | 'asset.promote' | 'check.execute' | 'review.materialize' | 'support.triage' | 'removal.submit' | 'removal.sync_status' | 'retention.cleanup';
export type WorkerJobRegistration = {
    queue: WorkerQueueName;
    name: WorkerJobName;
    concurrency: number;
    description: string;
    defaultJobOptions: {
        attempts: number;
        removeOnComplete: number;
        removeOnFail: number;
        backoff: {
            type: 'fixed' | 'exponential';
            delayMs: number;
        };
    };
};
export declare const workerJobCatalog: Record<WorkerJobName, WorkerJobRegistration>;
export declare function createBullmqRuntimeConfig(environment?: NodeJS.ProcessEnv): {
    connectionUrl: string;
    prefix: string;
    stalledIntervalMs: number;
    lockDurationMs: number;
};
export declare function getWorkerQueueTopology(): {
    queue: WorkerQueueName;
    name: WorkerJobName;
    concurrency: number;
    attempts: number;
    backoff: {
        type: "fixed" | "exponential";
        delayMs: number;
    };
}[];
