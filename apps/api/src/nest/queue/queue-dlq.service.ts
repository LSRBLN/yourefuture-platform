import { Injectable, Logger } from '@nestjs/common';
import type { Queue } from 'bullmq';

/**
 * Dead-Letter Queue Service
 * 
 * Manages failed jobs that have exhausted retries.
 * Provides alerting, monitoring, and manual retry capabilities.
 */
@Injectable()
export class QueueDlqService {
  private readonly logger = new Logger(QueueDlqService.name);

  /**
   * Monitor a queue for dead-letter entries and log critical failures
   */
  async setupDlqMonitoring(queue: Queue, queueName: string) {
    queue.on('failed', (job, error) => {
      this.logger.error(
        JSON.stringify({
          status: 'job_failed',
          queue: queueName,
          jobId: job.id,
          jobName: job.name,
          attempts: job.attemptsMade,
          maxAttempts: job.opts.attempts,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        }),
      );

      // If this job has exhausted retries, it's now in "DLQ" (our failed job store)
      if (job.opts.attempts && job.attemptsMade >= job.opts.attempts) {
        this.logger.warn(
          JSON.stringify({
            status: 'dlq_entry',
            queue: queueName,
            jobId: job.id,
            jobName: job.name,
            finalError: error instanceof Error ? error.message : String(error),
          }),
        );
      }
    });
  }

  /**
   * Retry a specific failed job
   */
  async retryFailedJob(queue: Queue, jobId: string) {
    try {
      const job = await queue.getJob(jobId);

      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      if (job.isCompleted()) {
        throw new Error(`Job ${jobId} already completed`);
      }

      // Reset attempt counter and re-enqueue
      await job.retry();
      this.logger.log(`Retried job ${jobId} in queue ${queue.name}`);

      return { acknowledged: true, jobId, status: 'retried' };
    } catch (error) {
      this.logger.error(`Failed to retry job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Get list of failed jobs for a queue
   */
  async listFailedJobs(queue: Queue, limit = 50) {
    try {
      const failedJobs = await queue.getFailed(0, limit);
      return failedJobs.map((job) => ({
        id: job.id,
        name: job.name,
        failedReason: job.failedReason,
        attemptsMade: job.attemptsMade,
        maxAttempts: job.opts.attempts,
        failedAt: job.failedAt,
      }));
    } catch (error) {
      this.logger.error('Failed to list failed jobs:', error);
      throw error;
    }
  }

  /**
   * Clear all dead-letter entries from a queue
   */
  async clearDlq(queue: Queue) {
    try {
      const failed = await queue.getFailed();
      const count = failed.length;

      for (const job of failed) {
        await job.remove();
      }

      this.logger.log(`Cleared ${count} failed jobs from queue ${queue.name}`);
      return { acknowledged: true, clearedCount: count };
    } catch (error) {
      this.logger.error('Failed to clear DLQ:', error);
      throw error;
    }
  }
}
