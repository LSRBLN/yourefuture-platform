import { asc, eq } from 'drizzle-orm';

import type { TrustshieldDatabase } from '../client.js';
import { removalActionsTable, type RemovalActionInsert } from '../schema.js';

export class RemovalActionsRepository {
  constructor(private readonly db: TrustshieldDatabase) {}

  async create(input: RemovalActionInsert) {
    const [row] = await this.db.insert(removalActionsTable).values(input).returning();
    return row;
  }

  async listByRemovalCaseId(removalCaseId: string) {
    return this.db.query.removalActionsTable.findMany({
      where: eq(removalActionsTable.removalCaseId, removalCaseId),
      orderBy: asc(removalActionsTable.createdAt),
    });
  }
}
