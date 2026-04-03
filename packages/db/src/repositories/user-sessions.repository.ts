import { and, eq, isNull } from 'drizzle-orm';

import type { TrustshieldDatabase } from '../client.js';
import { userSessionsTable, type UserSessionInsert } from '../schema.js';

export class UserSessionsRepository {
  constructor(private readonly db: TrustshieldDatabase) {}

  async create(input: UserSessionInsert) {
    const [row] = await this.db.insert(userSessionsTable).values(input).returning();
    return row;
  }

  async findByJti(jti: string) {
    return this.db.query.userSessionsTable.findFirst({
      where: eq(userSessionsTable.jti, jti),
    });
  }

  async findActiveByJti(jti: string) {
    return this.db.query.userSessionsTable.findFirst({
      where: and(eq(userSessionsTable.jti, jti), isNull(userSessionsTable.revokedAt)),
    });
  }

  async revokeById(id: string) {
    const [row] = await this.db
      .update(userSessionsTable)
      .set({
        revokedAt: new Date(),
      })
      .where(eq(userSessionsTable.id, id))
      .returning();

    return row;
  }

  async revokeAndReplace(sessionId: string, replacementSessionId: string) {
    const [row] = await this.db
      .update(userSessionsTable)
      .set({
        revokedAt: new Date(),
        replacedBySessionId: replacementSessionId,
      })
      .where(eq(userSessionsTable.id, sessionId))
      .returning();

    return row;
  }

  async revokeAllActiveByUserId(userId: string) {
    return this.db
      .update(userSessionsTable)
      .set({
        revokedAt: new Date(),
      })
      .where(and(eq(userSessionsTable.userId, userId), isNull(userSessionsTable.revokedAt)))
      .returning();
  }
}

