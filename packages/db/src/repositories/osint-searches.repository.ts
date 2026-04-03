import { desc, eq } from 'drizzle-orm';

import type { TrustshieldDatabase } from '../client.js';
import { osintSearchesTable, type OsintSearchInsert } from '../schema.js';

export class OsintSearchesRepository {
  constructor(private readonly db: TrustshieldDatabase) {}

  async create(input: OsintSearchInsert) {
    const [row] = await this.db.insert(osintSearchesTable).values(input).returning();
    return row;
  }

  async updateById(id: string, input: Partial<OsintSearchInsert>) {
    const [row] = await this.db.update(osintSearchesTable).set(input).where(eq(osintSearchesTable.id, id)).returning();
    return row;
  }

  async findById(id: string) {
    return this.db.query.osintSearchesTable.findFirst({
      where: eq(osintSearchesTable.id, id),
    });
  }

  async listByOwner(ownerUserId: string) {
    return this.db.query.osintSearchesTable.findMany({
      where: eq(osintSearchesTable.ownerUserId, ownerUserId),
      orderBy: desc(osintSearchesTable.createdAt),
    });
  }

  async listAll() {
    return this.db.query.osintSearchesTable.findMany({
      orderBy: desc(osintSearchesTable.createdAt),
    });
  }

  async deleteByOwnerUserId(ownerUserId: string) {
    return this.db.delete(osintSearchesTable).where(eq(osintSearchesTable.ownerUserId, ownerUserId)).returning();
  }
}
