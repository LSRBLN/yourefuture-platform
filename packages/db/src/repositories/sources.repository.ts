import { desc, eq } from 'drizzle-orm';

import type { TrustshieldDatabase } from '../client.js';
import { sourcesTable, type SourceInsert } from '../schema.js';

export class SourcesRepository {
  constructor(private readonly db: TrustshieldDatabase) {}

  async create(input: SourceInsert) {
    const [row] = await this.db.insert(sourcesTable).values(input).returning();
    return row;
  }

  async findById(id: string) {
    return this.db.query.sourcesTable.findFirst({
      where: eq(sourcesTable.id, id),
    });
  }

  async listByOwner(ownerUserId: string) {
    return this.db.query.sourcesTable.findMany({
      where: eq(sourcesTable.ownerUserId, ownerUserId),
      orderBy: desc(sourcesTable.createdAt),
    });
  }

  async listAll() {
    return this.db.query.sourcesTable.findMany({
      orderBy: desc(sourcesTable.createdAt),
    });
  }

  async deleteByOwnerUserId(ownerUserId: string) {
    return this.db.delete(sourcesTable).where(eq(sourcesTable.ownerUserId, ownerUserId)).returning();
  }
}
