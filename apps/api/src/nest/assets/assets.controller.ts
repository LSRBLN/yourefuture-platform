import { Body, Controller, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { ApiRequestContext } from '@trustshield/validation';

import { Permissions } from '../platform/permissions.decorator.js';
import { RateLimit } from '../platform/rate-limit.decorator.js';
import { RateLimitGuard } from '../platform/rate-limit.guard.js';
import { RbacGuard } from '../platform/rbac.guard.js';
import { RequestContextGuard, type NestHttpRequestWithContext } from '../platform/request-context.guard.js';
import { NestAssetsService } from './assets.service.js';

function requireContext(request: NestHttpRequestWithContext) {
  return request.trustshieldContext as ApiRequestContext;
}

@ApiTags('Assets')
@ApiBearerAuth()
@Controller('api/v1/assets')
@UseGuards(RequestContextGuard, RbacGuard)
export class NestAssetsController {
  constructor(@Inject(NestAssetsService) private readonly assetsService: NestAssetsService) {}

  @Post()
  @UseGuards(RateLimitGuard)
  @RateLimit(10, 60_000)
  @Permissions('assets:create')
  @ApiOperation({ summary: 'Create a secure upload intent for an asset' })
  createUploadIntent(@Body() body: unknown, @Req() request: NestHttpRequestWithContext) {
    return this.assetsService.createUploadIntent(body, requireContext(request));
  }

  @Get(':id')
  @Permissions('assets:read')
  @ApiOperation({ summary: 'Get asset metadata by id' })
  getById(@Param('id') id: string, @Req() request: NestHttpRequestWithContext) {
    return this.assetsService.getById(id, requireContext(request));
  }

  @Get(':id/deepfake-results')
  @Permissions('assets:read')
  @ApiOperation({ summary: 'Get deepfake analysis status and results for an asset' })
  getDeepfakeResults(@Param('id') id: string, @Req() request: NestHttpRequestWithContext) {
    return this.assetsService.getDeepfakeResults(id, requireContext(request));
  }

  @Post(':id/complete-upload')
  @UseGuards(RateLimitGuard)
  @RateLimit(20, 60_000)
  @Permissions('assets:update')
  @ApiOperation({ summary: 'Mark quarantine upload as completed for an owned asset' })
  completeUpload(@Param('id') id: string, @Body() body: unknown, @Req() request: NestHttpRequestWithContext) {
    return this.assetsService.completeUpload(id, body, requireContext(request));
  }

  @Post(':id/start-scan')
  @Permissions('assets:update')
  @ApiOperation({ summary: 'Transition uploaded asset into secure scanning' })
  startScan(@Param('id') id: string, @Req() request: NestHttpRequestWithContext) {
    return this.assetsService.startScan(id, requireContext(request));
  }

  @Post(':id/finalize-security')
  @Permissions('assets:update')
  @ApiOperation({ summary: 'Finalize secure scan and optionally promote asset to private storage' })
  finalizeSecurity(@Param('id') id: string, @Body() body: unknown, @Req() request: NestHttpRequestWithContext) {
    return this.assetsService.finalizeSecurity(id, body, requireContext(request));
  }
}
