import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiRequestContext } from '@trustshield/validation';

import { getRouteParam, handleController } from '../shared/http.js';
import type { EvidenceSnapshotsService } from './evidence-snapshots.service.js';

export class EvidenceSnapshotsController {
  constructor(private readonly service: EvidenceSnapshotsService) {}

  async getById(request: IncomingMessage, response: ServerResponse, context: ApiRequestContext) {
    return handleController(response, async () => ({
      body: await this.service.getById(getRouteParam(request, 1), context),
    }));
  }
}
