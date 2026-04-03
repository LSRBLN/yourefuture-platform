import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import type { ApiRequestContext } from '@trustshield/validation';

import { Permissions } from './permissions.decorator.js';
import { PlatformService } from './platform.service.js';
import { RateLimit } from './rate-limit.decorator.js';
import { RateLimitGuard } from './rate-limit.guard.js';
import { RbacGuard } from './rbac.guard.js';
import { RequestContextGuard, type NestHttpRequestWithContext } from './request-context.guard.js';

function getApiContext(request: NestHttpRequestWithContext) {
  return request.trustshieldContext ?? ({ apiVersion: 'v1' } as ApiRequestContext);
}

@ApiTags('platform')
@Controller('api/v1')
@UseGuards(RequestContextGuard)
export class PlatformController {
  constructor(@Inject(PlatformService) private readonly platformService: PlatformService) {}

  @Get('health')
  @ApiOperation({ summary: 'Platform health status' })
  getHealth(@Req() request: NestHttpRequestWithContext) {
    return this.platformService.getHealth(getApiContext(request).apiVersion);
  }

  @Get('health/live')
  @ApiOperation({ summary: 'Liveness probe' })
  getLiveness(@Req() request: NestHttpRequestWithContext) {
    return this.platformService.getLiveness(getApiContext(request).apiVersion);
  }

  @Get('health/ready')
  @ApiOperation({ summary: 'Readiness probe' })
  getReadiness(@Req() request: NestHttpRequestWithContext) {
    return this.platformService.getReadiness(getApiContext(request).apiVersion);
  }

  @Get('jobs/topology')
  @UseGuards(RbacGuard)
  @UseGuards(RateLimitGuard)
  @RateLimit(30, 60_000)
  @Permissions('jobs:read')
  @ApiOperation({ summary: 'Configured queue topology' })
  getJobsTopology(@Req() request: NestHttpRequestWithContext) {
    return this.platformService.getJobsTopology(getApiContext(request).apiVersion);
  }
}
