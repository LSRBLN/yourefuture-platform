import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiRequestContext } from '@trustshield/validation';

import { getRouteParam, handleController } from '../shared/http.js';
import type { AssetsService, CompleteAssetUploadDto, CreateAssetUploadIntentDto, FinalizeAssetSecurityDto } from './assets.service.js';

export class AssetsController {
  constructor(private readonly service: AssetsService) {}

  async create(_request: IncomingMessage, response: ServerResponse, body: unknown, context: ApiRequestContext) {
    return handleController(response, async () => ({ statusCode: 201, body: await this.service.create(body as CreateAssetUploadIntentDto, context) }));
  }

  async getById(request: IncomingMessage, response: ServerResponse, context: ApiRequestContext) {
    return handleController(response, async () => ({ body: await this.service.getById(getRouteParam(request, 1), context) }));
  }

  async getDeepfakeResults(request: IncomingMessage, response: ServerResponse, context: ApiRequestContext) {
    return handleController(response, async () => ({ body: await this.service.getDeepfakeResults(getRouteParam(request, 1), context) }));
  }

  async completeUpload(request: IncomingMessage, response: ServerResponse, body: unknown, context: ApiRequestContext) {
    return handleController(response, async () => ({ body: await this.service.completeUpload(getRouteParam(request, 1), body as CompleteAssetUploadDto, context) }));
  }

  async startScan(request: IncomingMessage, response: ServerResponse, _body: unknown, context: ApiRequestContext) {
    return handleController(response, async () => ({ body: await this.service.startScan(getRouteParam(request, 1), context) }));
  }

  async finalizeSecurity(request: IncomingMessage, response: ServerResponse, body: unknown, context: ApiRequestContext) {
    return handleController(response, async () => ({ body: await this.service.finalizeSecurity(getRouteParam(request, 1), body as FinalizeAssetSecurityDto, context) }));
  }
}
