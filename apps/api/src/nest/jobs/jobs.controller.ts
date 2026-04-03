import { Controller, Get, Inject, Param, Req, UseGuards } from '@nestjs/common';

import type { ApiRequestContext } from '@trustshield/validation';

import { Permissions } from '../platform/permissions.decorator.js';
import { RbacGuard } from '../platform/rbac.guard.js';
import { RequestContextGuard, type NestHttpRequestWithContext } from '../platform/request-context.guard.js';
import { NestJobsService } from './jobs.service.js';

function requireContext(request: NestHttpRequestWithContext) {
  return request.trustshieldContext as ApiRequestContext;
}

@Controller('api/v1/jobs')
@UseGuards(RequestContextGuard, RbacGuard)
@Permissions('jobs:read')
export class NestJobsController {
  constructor(@Inject(NestJobsService) private readonly jobsService: NestJobsService) {}

  @Get()
  list(@Req() request: NestHttpRequestWithContext) {
    return this.jobsService.list(requireContext(request));
  }

  @Get(':id')
  getById(@Param('id') id: string, @Req() request: NestHttpRequestWithContext) {
    return this.jobsService.getById(id, requireContext(request));
  }
}
