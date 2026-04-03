import { and, desc, eq, inArray, lte } from 'drizzle-orm';

import type { TrustshieldDatabase } from '../client.js';
import { jobsTable, type JobInsert } from '../schema.js';

export class JobsRepository {
  constructor(private readonly db: TrustshieldDatabase) {}

  async create(input: JobInsert) {
    const [row] = await this.db.insert(jobsTable).values(input).returning();
    return row;
  }

  async updateById(id: string, input: Partial<JobInsert>) {
    const [row] = await this.db.update(jobsTable).set(input).where(eq(jobsTable.id, id)).returning();
    return row;
  }

  async findById(id: string) {
    return this.db.query.jobsTable.findFirst({
      where: eq(jobsTable.id, id),
    });
  }

  async listByResource(resourceType: string, resourceId: string) {
    return this.db.query.jobsTable.findMany({
      where: and(eq(jobsTable.resourceType, resourceType), eq(jobsTable.resourceId, resourceId)),
      orderBy: desc(jobsTable.enqueuedAt),
    });
  }

  async listForOwner(ownerUserId: string) {
    return this.db.query.jobsTable.findMany({
      where: eq(jobsTable.ownerUserId, ownerUserId),
      orderBy: desc(jobsTable.enqueuedAt),
    });
  }

  async listAll() {
    return this.db.query.jobsTable.findMany({
      orderBy: desc(jobsTable.enqueuedAt),
    });
  }

  async listRetentionCandidates(asOf: Date) {
    return this.db.query.jobsTable.findMany({
      where: and(
        eq(jobsTable.status, 'completed'),
        lte(jobsTable.availableAt, asOf),
        inArray(jobsTable.queue, ['assets', 'checks', 'support', 'removals', 'retention', 'osint']),
      ),
      orderBy: desc(jobsTable.availableAt),
    });
  }

  async deleteExpiredCompleted(asOf: Date) {
    return this.db
      .delete(jobsTable)
      .where(
        and(
          eq(jobsTable.status, 'completed'),
          lte(jobsTable.availableAt, asOf),
          inArray(jobsTable.queue, ['assets', 'checks', 'support', 'removals', 'retention', 'osint']),
        ),
      )
      .returning();
  }

  async deleteByOwnerUserId(ownerUserId: string) {
    return this.db.delete(jobsTable).where(eq(jobsTable.ownerUserId, ownerUserId)).returning();
  }
}
