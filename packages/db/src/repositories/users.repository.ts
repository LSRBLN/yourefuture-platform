import { eq } from 'drizzle-orm';

import type { TrustshieldDatabase } from '../client.js';
import { usersTable, type UserInsert } from '../schema.js';

export class UsersRepository {
  constructor(private readonly db: TrustshieldDatabase) {}

  async create(input: UserInsert) {
    const [row] = await this.db.insert(usersTable).values(input).returning();
    return row;
  }

  async findById(id: string) {
    return this.db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
    });
  }

  async findByEmail(email: string) {
    return this.db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });
  }

  async updateById(id: string, input: Partial<UserInsert>) {
    const [row] = await this.db.update(usersTable).set(input).where(eq(usersTable.id, id)).returning();
    return row;
  }

  async deleteById(id: string) {
    const [row] = await this.db.delete(usersTable).where(eq(usersTable.id, id)).returning();
    return row;
  }
}

