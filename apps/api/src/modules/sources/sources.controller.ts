import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiRequestContext } from '@trustshield/validation';

import { getRouteParam, handleController } from '../shared/http.js';
import type { CreateSourceDto, SourcesService } from './sources.service.js';

export class SourcesController {
  constructor(private readonly service: SourcesService) {}

  async create(_request: IncomingMessage, response: ServerResponse, body: unknown, context: ApiRequestContext) {
    return handleController(response, async () => ({ statusCode: 201, body: await this.service.create(body as CreateSourceDto, context) }));
  }

  async getById(request: IncomingMessage, response: ServerResponse, context: ApiRequestContext) {
    return handleController(response, async () => ({ body: await this.service.getById(getRouteParam(request, 1), context) }));
  }
}
