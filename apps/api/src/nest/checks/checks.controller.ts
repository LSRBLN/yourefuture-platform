import { Body, Controller, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';

import type { ApiRequestContext } from '@trustshield/validation';

import { Permissions } from '../platform/permissions.decorator.js';
import { RateLimit } from '../platform/rate-limit.decorator.js';
import { RateLimitGuard } from '../platform/rate-limit.guard.js';
import { RbacGuard } from '../platform/rbac.guard.js';
import { RequestContextGuard, type NestHttpRequestWithContext } from '../platform/request-context.guard.js';
import { NestChecksService } from './checks.service.js';

function requireContext(request: NestHttpRequestWithContext) {
  return request.trustshieldContext as ApiRequestContext;
}

@Controller('api/v1/checks')
@UseGuards(RequestContextGuard)
export class NestChecksController {
  constructor(@Inject(NestChecksService) private readonly checksService: NestChecksService) {}

  @Post()
  @UseGuards(RateLimitGuard)
  @RateLimit(20, 60_000)
  create(@Body() body: unknown, @Req() request: NestHttpRequestWithContext) {
    return this.checksService.create(body, requireContext(request));
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @Permissions('checks:read')
  getById(@Param('id') id: string, @Req() request: NestHttpRequestWithContext) {
    return this.checksService.getById(id, requireContext(request));
  }
}
