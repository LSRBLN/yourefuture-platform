import { Controller, Get, Inject, Param, Req, UseGuards } from '@nestjs/common';

import type { ApiRequestContext } from '@trustshield/validation';

import { Permissions } from '../platform/permissions.decorator.js';
import { RbacGuard } from '../platform/rbac.guard.js';
import { RequestContextGuard, type NestHttpRequestWithContext } from '../platform/request-context.guard.js';
import { NestEvidenceSnapshotsService } from './evidence-snapshots.service.js';

function requireContext(request: NestHttpRequestWithContext) {
  return request.trustshieldContext as ApiRequestContext;
}

@Controller('api/v1/evidence-snapshots')
@UseGuards(RequestContextGuard, RbacGuard)
@Permissions('reviews:read')
export class NestEvidenceSnapshotsController {
  constructor(@Inject(NestEvidenceSnapshotsService) private readonly evidenceSnapshotsService: NestEvidenceSnapshotsService) {}

  @Get(':id')
  getById(@Param('id') id: string, @Req() request: NestHttpRequestWithContext) {
    return this.evidenceSnapshotsService.getById(id, requireContext(request));
  }
}
