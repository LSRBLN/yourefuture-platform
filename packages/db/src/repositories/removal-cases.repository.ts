import { desc, eq } from 'drizzle-orm';

import type { TrustshieldDatabase } from '../client.js';
import { removalCasesTable, type RemovalCaseInsert } from '../schema.js';

export class RemovalCasesRepository {
  constructor(private readonly db: TrustshieldDatabase) {}

  async create(input: RemovalCaseInsert) {
    const [row] = await this.db.insert(removalCasesTable).values(input).returning();
    return row;
  }

  async findById(id: string) {
    return this.db.query.removalCasesTable.findFirst({
      where: eq(removalCasesTable.id, id),
    });
  }

  async listAll() {
    return this.db.query.removalCasesTable.findMany({
      orderBy: desc(removalCasesTable.updatedAt),
    });
  }

  async listByOwner(ownerUserId: string) {
    return this.db.query.removalCasesTable.findMany({
      where: eq(removalCasesTable.ownerUserId, ownerUserId),
      orderBy: desc(removalCasesTable.updatedAt),
    });
  }

  async update(
    id: string,
    input: Partial<Omit<RemovalCaseInsert, 'id' | 'createdAt'>>,
  ) {
    const [row] = await this.db
      .update(removalCasesTable)
      .set(input)
      .where(eq(removalCasesTable.id, id))
      .returning();

    return row;
  }
}
