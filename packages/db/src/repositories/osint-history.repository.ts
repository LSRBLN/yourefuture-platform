import { and, desc, eq } from 'drizzle-orm';

import type { TrustshieldDatabase } from '../client.js';
import { osintHistoryTable, type OsintHistoryInsert } from '../schema.js';

export class OsintHistoryRepository {
  constructor(private readonly db: TrustshieldDatabase) {}

  async create(input: OsintHistoryInsert) {
    const [row] = await this.db.insert(osintHistoryTable).values(input).returning();
    return row;
  }

  async findById(id: string) {
    return this.db.query.osintHistoryTable.findFirst({
      where: eq(osintHistoryTable.id, id),
    });
  }

  async listBySearch(searchId: string) {
    return this.db.query.osintHistoryTable.findMany({
      where: eq(osintHistoryTable.searchId, searchId),
      orderBy: desc(osintHistoryTable.createdAt),
    });
  }

  async listBySearchForOwner(searchId: string, ownerUserId: string) {
    return this.db.query.osintHistoryTable.findMany({
      where: and(eq(osintHistoryTable.searchId, searchId), eq(osintHistoryTable.ownerUserId, ownerUserId)),
      orderBy: desc(osintHistoryTable.createdAt),
    });
  }

  async deleteByOwnerUserId(ownerUserId: string) {
    return this.db.delete(osintHistoryTable).where(eq(osintHistoryTable.ownerUserId, ownerUserId)).returning();
  }
}
