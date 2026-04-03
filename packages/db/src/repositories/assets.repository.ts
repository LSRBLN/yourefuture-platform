import { desc, eq } from 'drizzle-orm';

import type { TrustshieldDatabase } from '../client.js';
import { assetsTable, type AssetInsert } from '../schema.js';

export class AssetsRepository {
  constructor(private readonly db: TrustshieldDatabase) {}

  async create(input: AssetInsert) {
    const [row] = await this.db.insert(assetsTable).values(input).returning();
    return row;
  }

  async updateById(id: string, input: Partial<AssetInsert>) {
    const [row] = await this.db.update(assetsTable).set(input).where(eq(assetsTable.id, id)).returning();
    return row;
  }

  async findById(id: string) {
    return this.db.query.assetsTable.findFirst({
      where: eq(assetsTable.id, id),
    });
  }

  async listByOwner(ownerUserId: string) {
    return this.db.query.assetsTable.findMany({
      where: eq(assetsTable.ownerUserId, ownerUserId),
      orderBy: desc(assetsTable.createdAt),
    });
  }

  async listAll() {
    return this.db.query.assetsTable.findMany({
      orderBy: desc(assetsTable.createdAt),
    });
  }

  async deleteByOwnerUserId(ownerUserId: string) {
    return this.db.delete(assetsTable).where(eq(assetsTable.ownerUserId, ownerUserId)).returning();
  }
}
