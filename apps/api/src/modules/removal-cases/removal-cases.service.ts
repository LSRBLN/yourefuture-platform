import type { RemovalActionType, RemovalCaseType, RemovalStatus, Severity } from '@trustshield/core';
import type { TrustshieldStore } from '@trustshield/db';
import type { ApiRequestContext } from '@trustshield/validation';

import { HttpError } from '../shared/http.js';

export type CreateRemovalCaseDto = {
  caseType: RemovalCaseType;
  platform: string;
  targetUrl: string;
  status?: RemovalStatus;
  severity: Severity;
  summary: string;
  legalBasis?: string;
  checkId?: string;
  assetId?: string;
};

export type AppendRemovalActionDto = {
  actionType: RemovalActionType;
  recipient?: string;
  payloadSummary: string;
  resultStatus: string;
  externalTicketId?: string;
};

export class RemovalCasesService {
  constructor(private readonly store: TrustshieldStore) {}

  async create(dto: CreateRemovalCaseDto, context: ApiRequestContext) {
    if (!dto.targetUrl.startsWith('http://') && !dto.targetUrl.startsWith('https://')) {
      throw new HttpError(400, 'Removal target URL must be http:// or https://');
    }

    const removalCase = this.store.createRemovalCase(dto, context.actor.subject);
    return { status: 'accepted', data: removalCase };
  }

  async getById(id: string, context: ApiRequestContext) {
    const removalCase = this.store.getRemovalCaseById(id, {
      actorSubject: context.actor.subject,
      canReadAll: context.actor.role !== 'user',
    });

    if (!removalCase) {
      throw new HttpError(404, `Removal case ${id} not found`);
    }

    return { status: 'ok', data: removalCase };
  }

  async appendAction(id: string, dto: AppendRemovalActionDto, context: ApiRequestContext) {
    const existing = this.store.getRemovalCaseById(id, {
      actorSubject: context.actor.subject,
      canReadAll: context.actor.role !== 'user',
    });

    if (!existing) {
      throw new HttpError(404, `Removal case ${id} not found`);
    }

    const removalCase = this.store.appendRemovalAction(id, dto);

    if (!removalCase) {
      throw new HttpError(404, `Removal case ${id} not found`);
    }

    return { status: 'accepted', data: removalCase };
  }
}
