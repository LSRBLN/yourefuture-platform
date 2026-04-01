import { Controller, Get, Inject, Param, Req, UseGuards } from '@nestjs/common';

import type { ApiRequestContext } from '@trustshield/validation';

import { Permissions } from '../platform/permissions.decorator.js';
import { RbacGuard } from '../platform/rbac.guard.js';
import { RequestContextGuard, type NestHttpRequestWithContext } from '../platform/request-context.guard.js';
import { NestReviewsService } from './reviews.service.js';

function requireContext(request: NestHttpRequestWithContext) {
  return request.trustshieldContext as ApiRequestContext;
}

@Controller('api/v1/reviews')
@UseGuards(RequestContextGuard, RbacGuard)
@Permissions('reviews:read')
export class NestReviewsController {
  constructor(@Inject(NestReviewsService) private readonly reviewsService: NestReviewsService) {}

  @Get()
  list(@Req() request: NestHttpRequestWithContext) {
    return this.reviewsService.list(requireContext(request));
  }

  @Get(':id')
  getById(@Param('id') id: string, @Req() request: NestHttpRequestWithContext) {
    return this.reviewsService.getById(id, requireContext(request));
  }
}
