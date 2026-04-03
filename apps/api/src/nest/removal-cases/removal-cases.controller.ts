import { Body, Controller, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';

import type { ApiRequestContext } from '@trustshield/validation';

import { Permissions } from '../platform/permissions.decorator.js';
import { RbacGuard } from '../platform/rbac.guard.js';
import { RequestContextGuard, type NestHttpRequestWithContext } from '../platform/request-context.guard.js';
import { NestRemovalCasesService } from './removal-cases.service.js';

function requireContext(request: NestHttpRequestWithContext) {
  return request.trustshieldContext as ApiRequestContext;
}

@Controller('api/v1/removal-cases')
@UseGuards(RequestContextGuard)
export class NestRemovalCasesController {
  constructor(@Inject(NestRemovalCasesService) private readonly removalCasesService: NestRemovalCasesService) {}

  @Get()
  @UseGuards(RbacGuard)
  @Permissions('removal_cases:read')
  list(@Req() request: NestHttpRequestWithContext) {
    return this.removalCasesService.list(requireContext(request));
  }

  @Post()
  @UseGuards(RbacGuard)
  @Permissions('removal_cases:create')
  create(@Body() body: unknown, @Req() request: NestHttpRequestWithContext) {
    return this.removalCasesService.create(body, requireContext(request));
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @Permissions('removal_cases:read')
  getById(@Param('id') id: string, @Req() request: NestHttpRequestWithContext) {
    return this.removalCasesService.getById(id, requireContext(request));
  }

  @Post(':id/actions')
  @UseGuards(RbacGuard)
  @Permissions('removal_cases:update')
  appendAction(@Param('id') id: string, @Body() body: unknown, @Req() request: NestHttpRequestWithContext) {
    return this.removalCasesService.appendAction(id, body, requireContext(request));
  }
}
