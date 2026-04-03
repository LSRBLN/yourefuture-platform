import { desc, eq } from 'drizzle-orm';

import type { TrustshieldDatabase } from '../client.js';
import { checksTable, type CheckInsert } from '../schema.js';

export class ChecksRepository {
  constructor(private readonly db: TrustshieldDatabase) {}

  async create(input: CheckInsert) {
    const [row] = await this.db.insert(checksTable).values(input).returning();
    return row;
  }

  async updateById(id: string, input: Partial<CheckInsert>) {
    const [row] = await this.db.update(checksTable).set(input).where(eq(checksTable.id, id)).returning();
    return row;
  }

  async findById(id: string) {
    return this.db.query.checksTable.findFirst({
      where: eq(checksTable.id, id),
    });
  }

  async listByOwner(ownerUserId: string) {
    return this.db.query.checksTable.findMany({
      where: eq(checksTable.ownerUserId, ownerUserId),
      orderBy: desc(checksTable.createdAt),
    });
  }

  async listAll() {
    return this.db.query.checksTable.findMany({
      orderBy: desc(checksTable.createdAt),
    });
  }

  async deleteByOwnerUserId(ownerUserId: string) {
    return this.db.delete(checksTable).where(eq(checksTable.ownerUserId, ownerUserId)).returning();
  }
}
