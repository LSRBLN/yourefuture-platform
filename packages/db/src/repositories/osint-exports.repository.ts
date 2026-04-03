import { and, desc, eq } from 'drizzle-orm';

import type { TrustshieldDatabase } from '../client.js';
import { osintExportsTable, type OsintExportInsert } from '../schema.js';

export class OsintExportsRepository {
  constructor(private readonly db: TrustshieldDatabase) {}

  async create(input: OsintExportInsert) {
    const [row] = await this.db.insert(osintExportsTable).values(input).returning();
    return row;
  }

  async updateById(id: string, input: Partial<OsintExportInsert>) {
    const [row] = await this.db.update(osintExportsTable).set(input).where(eq(osintExportsTable.id, id)).returning();
    return row;
  }

  async findById(id: string) {
    return this.db.query.osintExportsTable.findFirst({
      where: eq(osintExportsTable.id, id),
    });
  }

  async listBySearch(searchId: string) {
    return this.db.query.osintExportsTable.findMany({
      where: eq(osintExportsTable.searchId, searchId),
      orderBy: desc(osintExportsTable.createdAt),
    });
  }

  async listBySearchForOwner(searchId: string, ownerUserId: string) {
    return this.db.query.osintExportsTable.findMany({
      where: and(eq(osintExportsTable.searchId, searchId), eq(osintExportsTable.ownerUserId, ownerUserId)),
      orderBy: desc(osintExportsTable.createdAt),
    });
  }

  async deleteByOwnerUserId(ownerUserId: string) {
    return this.db.delete(osintExportsTable).where(eq(osintExportsTable.ownerUserId, ownerUserId)).returning();
  }
}
