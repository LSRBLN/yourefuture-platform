import { and, desc, eq } from 'drizzle-orm';

import type { TrustshieldDatabase } from '../client.js';
import { reviewItemsTable, type ReviewItemInsert } from '../schema.js';

export class ReviewItemsRepository {
  constructor(private readonly db: TrustshieldDatabase) {}

  async create(input: ReviewItemInsert) {
    const [row] = await this.db.insert(reviewItemsTable).values(input).returning();
    return row;
  }

  async findById(id: string) {
    return this.db.query.reviewItemsTable.findFirst({
      where: eq(reviewItemsTable.id, id),
    });
  }

  async listAll() {
    return this.db.query.reviewItemsTable.findMany({
      orderBy: desc(reviewItemsTable.updatedAt),
    });
  }

  async listVisibleForUser(ownerUserId: string) {
    return this.db.query.reviewItemsTable.findMany({
      where: eq(reviewItemsTable.ownerUserId, ownerUserId),
      orderBy: desc(reviewItemsTable.updatedAt),
    });
  }

  async findVisibleForUser(id: string, ownerUserId: string) {
    return this.db.query.reviewItemsTable.findFirst({
      where: and(eq(reviewItemsTable.id, id), eq(reviewItemsTable.ownerUserId, ownerUserId)),
    });
  }

  async deleteByOwnerUserId(ownerUserId: string) {
    return this.db.delete(reviewItemsTable).where(eq(reviewItemsTable.ownerUserId, ownerUserId)).returning();
  }
}
