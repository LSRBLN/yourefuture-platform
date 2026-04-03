import { and, desc, eq, inArray, lte } from 'drizzle-orm';

import type { TrustshieldDatabase } from '../client.js';
import { supportRequestsTable, type SupportRequestInsert } from '../schema.js';

export class SupportRequestsRepository {
  constructor(private readonly db: TrustshieldDatabase) {}

  async create(input: SupportRequestInsert) {
    const [row] = await this.db.insert(supportRequestsTable).values(input).returning();
    return row;
  }

  async findById(id: string) {
    return this.db.query.supportRequestsTable.findFirst({
      where: eq(supportRequestsTable.id, id),
    });
  }

  async listByOwner(ownerUserId: string) {
    return this.db.query.supportRequestsTable.findMany({
      where: eq(supportRequestsTable.ownerUserId, ownerUserId),
      orderBy: desc(supportRequestsTable.createdAt),
    });
  }

  async listAssignedTo(assignedTo: string) {
    return this.db.query.supportRequestsTable.findMany({
      where: eq(supportRequestsTable.assignedTo, assignedTo),
      orderBy: desc(supportRequestsTable.updatedAt),
    });
  }

  async listAll() {
    return this.db.query.supportRequestsTable.findMany({
      orderBy: desc(supportRequestsTable.updatedAt),
    });
  }

  async updateAssignment(id: string, input: Pick<SupportRequestInsert, 'assignedTo' | 'assignmentHistory' | 'audit' | 'retention' | 'updatedAt'>) {
    const [row] = await this.db
      .update(supportRequestsTable)
      .set(input)
      .where(eq(supportRequestsTable.id, id))
      .returning();

    return row;
  }

  async updateStatus(id: string, input: Pick<SupportRequestInsert, 'status' | 'statusHistory' | 'audit' | 'retention' | 'updatedAt'>) {
    const [row] = await this.db
      .update(supportRequestsTable)
      .set(input)
      .where(eq(supportRequestsTable.id, id))
      .returning();

    return row;
  }

  async updateById(id: string, input: Partial<SupportRequestInsert>) {
    const [row] = await this.db
      .update(supportRequestsTable)
      .set(input)
      .where(eq(supportRequestsTable.id, id))
      .returning();

    return row;
  }

  async findVisibleForUser(id: string, ownerUserId: string, assignedTo?: string) {
    return this.db.query.supportRequestsTable.findFirst({
      where: and(
        eq(supportRequestsTable.id, id),
        assignedTo ? eq(supportRequestsTable.assignedTo, assignedTo) : eq(supportRequestsTable.ownerUserId, ownerUserId),
      ),
    });
  }

  async listVisibleForUser(ownerUserId: string) {
    return this.db.query.supportRequestsTable.findMany({
      where: eq(supportRequestsTable.ownerUserId, ownerUserId),
      orderBy: desc(supportRequestsTable.updatedAt),
    });
  }

  async listRetentionCandidates(asOf: Date) {
    return this.db.query.supportRequestsTable.findMany({
      where: and(
        lte(supportRequestsTable.retentionUntil, asOf),
        inArray(supportRequestsTable.status, ['resolved', 'closed']),
      ),
      orderBy: desc(supportRequestsTable.retentionUntil),
    });
  }

  async deleteExpired(asOf: Date) {
    return this.db
      .delete(supportRequestsTable)
      .where(
        and(
          lte(supportRequestsTable.retentionUntil, asOf),
          inArray(supportRequestsTable.status, ['resolved', 'closed']),
        ),
      )
      .returning();
  }

  async deleteByOwnerUserId(ownerUserId: string) {
    return this.db.delete(supportRequestsTable).where(eq(supportRequestsTable.ownerUserId, ownerUserId)).returning();
  }
}
