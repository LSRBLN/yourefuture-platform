import { and, desc, eq } from 'drizzle-orm';

import type { TrustshieldDatabase } from '../client.js';
import { osintResultsTable, type OsintResultInsert } from '../schema.js';

export class OsintResultsRepository {
  constructor(private readonly db: TrustshieldDatabase) {}

  async create(input: OsintResultInsert) {
    const [row] = await this.db.insert(osintResultsTable).values(input).returning();
    return row;
  }

  async updateById(id: string, input: Partial<OsintResultInsert>) {
    const [row] = await this.db.update(osintResultsTable).set(input).where(eq(osintResultsTable.id, id)).returning();
    return row;
  }

  async findById(id: string) {
    return this.db.query.osintResultsTable.findFirst({
      where: eq(osintResultsTable.id, id),
    });
  }

  async listBySearch(searchId: string) {
    return this.db.query.osintResultsTable.findMany({
      where: eq(osintResultsTable.searchId, searchId),
      orderBy: desc(osintResultsTable.createdAt),
    });
  }

  async listBySearchForOwner(searchId: string, ownerUserId: string) {
    return this.db.query.osintResultsTable.findMany({
      where: and(eq(osintResultsTable.searchId, searchId), eq(osintResultsTable.ownerUserId, ownerUserId)),
      orderBy: desc(osintResultsTable.createdAt),
    });
  }

  async deleteByOwnerUserId(ownerUserId: string) {
    return this.db.delete(osintResultsTable).where(eq(osintResultsTable.ownerUserId, ownerUserId)).returning();
  }
}
