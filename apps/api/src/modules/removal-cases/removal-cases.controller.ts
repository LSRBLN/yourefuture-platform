import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiRequestContext } from '@trustshield/validation';

import { getRouteParam, handleController } from '../shared/http.js';
import type { AppendRemovalActionDto, CreateRemovalCaseDto, RemovalCasesService } from './removal-cases.service.js';

export class RemovalCasesController {
  constructor(private readonly service: RemovalCasesService) {}

  async create(_request: IncomingMessage, response: ServerResponse, body: unknown, context: ApiRequestContext) {
    return handleController(response, async () => ({ statusCode: 201, body: await this.service.create(body as CreateRemovalCaseDto, context) }));
  }

  async getById(request: IncomingMessage, response: ServerResponse, context: ApiRequestContext) {
    return handleController(response, async () => ({ body: await this.service.getById(getRouteParam(request, 1), context) }));
  }

  async appendAction(request: IncomingMessage, response: ServerResponse, body: unknown, context: ApiRequestContext) {
    return handleController(response, async () => ({
      body: await this.service.appendAction(getRouteParam(request, 1), body as AppendRemovalActionDto, context),
    }));
  }
}
