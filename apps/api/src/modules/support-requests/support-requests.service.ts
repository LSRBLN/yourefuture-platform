import type { CreateSupportRequestContract, SupportStatus } from '@trustshield/core';
import type { TrustshieldStore } from '@trustshield/db';
import type { ApiRequestContext } from '@trustshield/validation';
import { safeParseCreateSupportRequest, safeParseTransitionSupportRequestStatus, safeParseUpdateSupportRequestAssignment } from '@trustshield/validation';

import { HttpError } from '../shared/http.js';

export type CreateSupportRequestDto = CreateSupportRequestContract;
export type UpdateSupportRequestAssignmentDto = {
  assignedTo?: string;
  assignedBy?: string;
  reason?: string;
};

export type TransitionSupportRequestStatusDto = {
  status: SupportStatus;
  changedBy?: string;
  reason?: string;
};

export class SupportRequestsService {
  constructor(private readonly store: TrustshieldStore) {}

  async create(dto: CreateSupportRequestDto, context: ApiRequestContext) {
    const validation = safeParseCreateSupportRequest(dto);

    if (!validation.success) {
      throw new HttpError(400, 'Support request contract validation failed', validation.issues);
    }

    const supportRequest = this.store.createSupportRequest(validation.data, context.actor.subject);
    return { status: 'accepted', data: supportRequest };
  }

  async getById(id: string, context: ApiRequestContext) {
    const supportRequest = this.store.getSupportRequestById(id, {
      actorSubject: context.actor.subject,
      canReadAll: context.actor.role !== 'user',
    });

    if (!supportRequest) {
      throw new HttpError(404, `Support request ${id} not found`);
    }

    return { status: 'ok', data: supportRequest };
  }

  async list(context: ApiRequestContext) {
    return {
      status: 'ok',
      data: this.store.listSupportRequests({
        actorSubject: context.actor.subject,
        canReadAll: context.actor.role !== 'user',
      }),
    };
  }

  async assign(id: string, dto: UpdateSupportRequestAssignmentDto) {
    const validation = safeParseUpdateSupportRequestAssignment(dto);

    if (!validation.success) {
      throw new HttpError(400, 'Support request assignment validation failed', validation.issues);
    }

    const supportRequest = this.store.assignSupportRequest(id, validation.data);

    if (!supportRequest) {
      throw new HttpError(404, `Support request ${id} not found`);
    }

    return { status: 'accepted', data: supportRequest };
  }

  async transitionStatus(id: string, dto: TransitionSupportRequestStatusDto) {
    const validation = safeParseTransitionSupportRequestStatus(dto);

    if (!validation.success) {
      throw new HttpError(400, 'Support request status transition validation failed', validation.issues);
    }

    const supportRequest = this.store.transitionSupportRequestStatus(id, validation.data);

    if (!supportRequest) {
      throw new HttpError(404, `Support request ${id} not found`);
    }

    return { status: 'accepted', data: supportRequest };
  }
}
