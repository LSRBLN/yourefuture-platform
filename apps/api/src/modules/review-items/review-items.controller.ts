import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiRequestContext } from '@trustshield/validation';

import { getRouteParam, handleController } from '../shared/http.js';
import type { ReviewItemsService } from './review-items.service.js';

export class ReviewItemsController {
  constructor(private readonly service: ReviewItemsService) {}

  async list(_request: IncomingMessage, response: ServerResponse, context: ApiRequestContext) {
    return handleController(response, async () => ({
      body: await this.service.list(context),
    }));
  }

  async getById(request: IncomingMessage, response: ServerResponse, context: ApiRequestContext) {
    return handleController(response, async () => ({
      body: await this.service.getById(getRouteParam(request, 1), context),
    }));
  }
}
