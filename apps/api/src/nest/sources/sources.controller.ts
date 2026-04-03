import { Body, Controller, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';

import type { ApiRequestContext } from '@trustshield/validation';

import { Permissions } from '../platform/permissions.decorator.js';
import { RateLimit } from '../platform/rate-limit.decorator.js';
import { RateLimitGuard } from '../platform/rate-limit.guard.js';
import { RbacGuard } from '../platform/rbac.guard.js';
import { RequestContextGuard, type NestHttpRequestWithContext } from '../platform/request-context.guard.js';
import { NestSourcesService } from './sources.service.js';

function requireContext(request: NestHttpRequestWithContext) {
  return request.trustshieldContext as ApiRequestContext;
}

@Controller('api/v1/sources')
@UseGuards(RequestContextGuard)
export class NestSourcesController {
  constructor(@Inject(NestSourcesService) private readonly sourcesService: NestSourcesService) {}

  @Post()
  @UseGuards(RateLimitGuard)
  @RateLimit(20, 60_000)
  create(@Body() body: unknown, @Req() request: NestHttpRequestWithContext) {
    return this.sourcesService.create(body, requireContext(request));
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @Permissions('sources:read')
  getById(@Param('id') id: string, @Req() request: NestHttpRequestWithContext) {
    return this.sourcesService.getById(id, requireContext(request));
  }
}
