import { and, desc, eq } from 'drizzle-orm';

import type { TrustshieldDatabase } from '../client.js';
import { osintSavedItemsTable, type OsintSavedItemInsert } from '../schema.js';

export class OsintSavedItemsRepository {
  constructor(private readonly db: TrustshieldDatabase) {}

  async create(input: OsintSavedItemInsert) {
    const [row] = await this.db.insert(osintSavedItemsTable).values(input).returning();
    return row;
  }

  async updateById(id: string, input: Partial<OsintSavedItemInsert>) {
    const [row] = await this.db.update(osintSavedItemsTable).set(input).where(eq(osintSavedItemsTable.id, id)).returning();
    return row;
  }

  async findById(id: string) {
    return this.db.query.osintSavedItemsTable.findFirst({
      where: eq(osintSavedItemsTable.id, id),
    });
  }

  async listByOwner(ownerUserId: string) {
    return this.db.query.osintSavedItemsTable.findMany({
      where: eq(osintSavedItemsTable.ownerUserId, ownerUserId),
      orderBy: desc(osintSavedItemsTable.createdAt),
    });
  }

  async listByOwnerForSearch(ownerUserId: string, searchId: string) {
    return this.db.query.osintSavedItemsTable.findMany({
      where: and(eq(osintSavedItemsTable.ownerUserId, ownerUserId), eq(osintSavedItemsTable.searchId, searchId)),
      orderBy: desc(osintSavedItemsTable.createdAt),
    });
  }

  async deleteByOwnerUserId(ownerUserId: string) {
    return this.db.delete(osintSavedItemsTable).where(eq(osintSavedItemsTable.ownerUserId, ownerUserId)).returning();
  }
}
