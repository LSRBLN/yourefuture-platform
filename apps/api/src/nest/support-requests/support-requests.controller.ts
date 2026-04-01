import { Body, Controller, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';

import type { ApiRequestContext } from '@trustshield/validation';

import { Permissions } from '../platform/permissions.decorator.js';
import { RateLimit } from '../platform/rate-limit.decorator.js';
import { RateLimitGuard } from '../platform/rate-limit.guard.js';
import { RbacGuard } from '../platform/rbac.guard.js';
import { RequestContextGuard, type NestHttpRequestWithContext } from '../platform/request-context.guard.js';
import { NestSupportRequestsService } from './support-requests.service.js';

function requireContext(request: NestHttpRequestWithContext) {
  return request.trustshieldContext as ApiRequestContext;
}

@Controller('api/v1/support-requests')
@UseGuards(RequestContextGuard)
export class NestSupportRequestsController {
  constructor(@Inject(NestSupportRequestsService) private readonly supportRequestsService: NestSupportRequestsService) {}

  @Post()
  @UseGuards(RateLimitGuard)
  @RateLimit(20, 60_000)
  create(@Body() body: unknown, @Req() request: NestHttpRequestWithContext) {
    return this.supportRequestsService.create(body, requireContext(request));
  }

  @Get()
  @UseGuards(RbacGuard)
  @Permissions('support_requests:read')
  list(@Req() request: NestHttpRequestWithContext) {
    return this.supportRequestsService.list(requireContext(request));
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @Permissions('support_requests:read')
  getById(@Param('id') id: string, @Req() request: NestHttpRequestWithContext) {
    return this.supportRequestsService.getById(id, requireContext(request));
  }

  @Post(':id/assign')
  @UseGuards(RbacGuard)
  @Permissions('support_requests:assign')
  assign(@Param('id') id: string, @Body() body: unknown) {
    return this.supportRequestsService.assign(id, body);
  }

  @Post(':id/status')
  @UseGuards(RbacGuard)
  @Permissions('support_requests:transition')
  transitionStatus(@Param('id') id: string, @Body() body: unknown) {
    return this.supportRequestsService.transitionStatus(id, body);
  }
}
