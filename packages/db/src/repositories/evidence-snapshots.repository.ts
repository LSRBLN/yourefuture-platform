import { and, desc, eq } from 'drizzle-orm';

import type { TrustshieldDatabase } from '../client.js';
import { evidenceSnapshotsTable, type EvidenceSnapshotInsert } from '../schema.js';

export class EvidenceSnapshotsRepository {
  constructor(private readonly db: TrustshieldDatabase) {}

  async create(input: EvidenceSnapshotInsert) {
    const [row] = await this.db.insert(evidenceSnapshotsTable).values(input).returning();
    return row;
  }

  async findById(id: string) {
    return this.db.query.evidenceSnapshotsTable.findFirst({
      where: eq(evidenceSnapshotsTable.id, id),
    });
  }

  async listAll() {
    return this.db.query.evidenceSnapshotsTable.findMany({
      orderBy: desc(evidenceSnapshotsTable.updatedAt),
    });
  }

  async listVisibleForUser(ownerUserId: string) {
    return this.db.query.evidenceSnapshotsTable.findMany({
      where: eq(evidenceSnapshotsTable.ownerUserId, ownerUserId),
      orderBy: desc(evidenceSnapshotsTable.updatedAt),
    });
  }

  async findVisibleForUser(id: string, ownerUserId: string) {
    return this.db.query.evidenceSnapshotsTable.findFirst({
      where: and(eq(evidenceSnapshotsTable.id, id), eq(evidenceSnapshotsTable.ownerUserId, ownerUserId)),
    });
  }

  async listByRemovalCaseId(removalCaseId: string) {
    return this.db.query.evidenceSnapshotsTable.findMany({
      where: eq(evidenceSnapshotsTable.removalCaseId, removalCaseId),
      orderBy: desc(evidenceSnapshotsTable.capturedAt),
    });
  }
}
