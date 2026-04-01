import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { ApiPermission } from '@trustshield/validation';

import { requirePermissions } from '../../modules/platform/auth-context.js';
import { REQUIRED_PERMISSIONS_KEY } from './permissions.decorator.js';
import type { NestHttpRequestWithContext } from './request-context.guard.js';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const permissions =
      this.reflector.getAllAndOverride<readonly ApiPermission[]>(REQUIRED_PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (permissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<NestHttpRequestWithContext>();

    if (!request.trustshieldContext) {
      return false;
    }

    requirePermissions(request.trustshieldContext, permissions);
    return true;
  }
}
