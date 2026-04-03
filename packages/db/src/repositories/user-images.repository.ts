import { desc, eq } from 'drizzle-orm';

import type { TrustshieldDatabase } from '../client.js';
import { userImagesTable, type UserImageInsert } from '../schema.js';

export class UserImagesRepository {
  constructor(private readonly db: TrustshieldDatabase) {}

  async create(input: UserImageInsert) {
    const [row] = await this.db.insert(userImagesTable).values(input).returning();
    return row;
  }

  async findById(id: string) {
    return this.db.query.userImagesTable.findFirst({
      where: eq(userImagesTable.id, id),
    });
  }

  async listByUserId(userId: string) {
    return this.db.query.userImagesTable.findMany({
      where: eq(userImagesTable.userId, userId),
      orderBy: desc(userImagesTable.createdAt),
    });
  }

  async findPrimaryByUserId(userId: string) {
    return this.db.query.userImagesTable.findFirst({
      where: eq(userImagesTable.userId, userId),
      orderBy: [desc(userImagesTable.isPrimary), desc(userImagesTable.createdAt)],
    });
  }

  async updateById(id: string, input: Partial<UserImageInsert>) {
    const [row] = await this.db.update(userImagesTable).set(input).where(eq(userImagesTable.id, id)).returning();
    return row;
  }

  async deleteById(id: string) {
    const [row] = await this.db.delete(userImagesTable).where(eq(userImagesTable.id, id)).returning();
    return row;
  }

  async deleteByUserId(userId: string) {
    return this.db.delete(userImagesTable).where(eq(userImagesTable.userId, userId)).returning();
  }
}

