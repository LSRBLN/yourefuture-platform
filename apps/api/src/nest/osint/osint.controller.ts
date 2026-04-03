import { Body, Controller, Get, Inject, Param, Post, Req, Sse, UseGuards } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import type { Observable } from 'rxjs';

import type { ApiRequestContext } from '@trustshield/validation';

import { RateLimit } from '../platform/rate-limit.decorator.js';
import { RateLimitGuard } from '../platform/rate-limit.guard.js';
import { RequestContextGuard, type NestHttpRequestWithContext } from '../platform/request-context.guard.js';
import { NestOsintService } from './osint.service.js';

function requireContext(request: NestHttpRequestWithContext) {
  return request.trustshieldContext as ApiRequestContext;
}

@Controller('api/v1/osint')
@UseGuards(RequestContextGuard)
export class NestOsintController {
  constructor(@Inject(NestOsintService) private readonly osintService: NestOsintService) {}

  @Post('search')
  @UseGuards(RateLimitGuard)
  @RateLimit(20, 60_000)
  createSearch(@Body() body: unknown, @Req() request: NestHttpRequestWithContext) {
    return this.osintService.createSearch(body, requireContext(request));
  }

  @Get('searches/:id')
  getSearchById(@Param('id') id: string, @Req() request: NestHttpRequestWithContext) {
    return this.osintService.getSearchById(id, requireContext(request));
  }

  @Sse('searches/:id/stream')
  streamSearch(@Param('id') id: string, @Req() request: NestHttpRequestWithContext): Observable<MessageEvent> {
    return this.osintService.streamSearch(id, requireContext(request));
  }
}
