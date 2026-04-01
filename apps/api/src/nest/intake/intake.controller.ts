import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';

import type { ApiRequestContext } from '@trustshield/validation';

import { RequestContextGuard, type NestHttpRequestWithContext } from '../platform/request-context.guard.js';
import { NestIntakeService } from './intake.service.js';

@Controller('api/v1/intake')
export class NestIntakeController {
  constructor(@Inject(NestIntakeService) private readonly intakeService: NestIntakeService) {}

  @Post('orchestrator')
  @UseGuards(RequestContextGuard)
  create(@Body() body: unknown, @Req() request: NestHttpRequestWithContext) {
    return this.intakeService.create(body, request.trustshieldContext as ApiRequestContext);
  }
}
