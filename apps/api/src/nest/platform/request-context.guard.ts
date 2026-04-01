import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import type { ApiRequestContext } from '@trustshield/validation';

import { buildRequestContext } from '../../modules/platform/auth-context.js';

export type NestHttpRequestWithContext = {
  trustshieldContext?: ApiRequestContext;
  headers?: Record<string, string | string[] | undefined>;
};

@Injectable()
export class RequestContextGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<NestHttpRequestWithContext>();
    request.trustshieldContext = buildRequestContext(request as never);
    return true;
  }
}
