import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiRequestContext } from '@trustshield/validation';

import { getRouteParam, handleController } from '../shared/http.js';
import type { CreateSupportRequestDto, SupportRequestsService, TransitionSupportRequestStatusDto, UpdateSupportRequestAssignmentDto } from './support-requests.service.js';

export class SupportRequestsController {
  constructor(private readonly supportRequestsService: SupportRequestsService) {}

  async create(_request: IncomingMessage, response: ServerResponse, body: unknown, context: ApiRequestContext) {
    return handleController(response, async () => ({
      statusCode: 202,
      body: await this.supportRequestsService.create((body ?? {}) as CreateSupportRequestDto, context),
    }));
  }

  async getById(request: IncomingMessage, response: ServerResponse, context: ApiRequestContext) {
    return handleController(response, async () => ({
      body: await this.supportRequestsService.getById(getRouteParam(request, 1), context),
    }));
  }

  async list(_request: IncomingMessage, response: ServerResponse, context: ApiRequestContext) {
    return handleController(response, async () => ({
      body: await this.supportRequestsService.list(context),
    }));
  }

  async assign(request: IncomingMessage, response: ServerResponse, body: unknown) {
    return handleController(response, async () => ({
      statusCode: 202,
      body: await this.supportRequestsService.assign(getRouteParam(request, 1), (body ?? {}) as UpdateSupportRequestAssignmentDto),
    }));
  }

  async transitionStatus(request: IncomingMessage, response: ServerResponse, body: unknown) {
    return handleController(response, async () => ({
      statusCode: 202,
      body: await this.supportRequestsService.transitionStatus(getRouteParam(request, 1), (body ?? {}) as TransitionSupportRequestStatusDto),
    }));
  }
}
