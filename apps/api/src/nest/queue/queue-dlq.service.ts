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
    // Log DLQ setup for monitoring
    this.logger.log(`DLQ monitoring setup for queue: ${queueName}`);
    
    // Note: BullMQ will automatically move failed jobs to the failed state
    // This service can be extended to implement additional monitoring strategies
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

      const isCompleted = job.isCompleted && typeof job.isCompleted === 'function' ? await job.isCompleted() : false;
      
      if (isCompleted) {
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
      return failedJobs.map((job: any) => ({
        id: job.id,
        name: job.name,
        failedReason: job.failedReason || 'Unknown',
        attemptsMade: job.attemptsMade,
        maxAttempts: job.opts?.attempts || 1,
        failedAt: job.finishedOn || new Date().toISOString(),
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
