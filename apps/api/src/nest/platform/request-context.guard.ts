import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';

import type { UserSessionsRepository } from '@trustshield/db';
import { safeParseAuthClaims, type ApiRequestContext } from '@trustshield/validation';

import { HttpError } from '../../modules/shared/http.js';
import { USER_SESSIONS_REPOSITORY } from '../database/database.module.js';
import { readBearerTokenFromHeaders, verifyJwt } from '../auth/jwt-rs256.js';
import { resolveRequestId } from './observability/request-id.js';

export type NestHttpRequestWithContext = {
  trustshieldContext?: ApiRequestContext;
  headers?: Record<string, string | string[] | undefined>;
  requestId?: string;
};

function normalizeHeader(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseScopes(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean);
}

@Injectable()
export class RequestContextGuard implements CanActivate {
  constructor(@Inject(USER_SESSIONS_REPOSITORY) private readonly userSessionsRepository: UserSessionsRepository) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<NestHttpRequestWithContext>();
    const normalizedRequestId = request.requestId ?? resolveRequestId(request.headers);
    request.requestId = normalizedRequestId;
    const bearerToken = readBearerTokenFromHeaders(request.headers);

    if (bearerToken) {
      const payload = verifyJwt(bearerToken, 'access');
      const session = await this.userSessionsRepository.findActiveByJti(payload.jti);

      if (!session || session.expiresAt.getTime() <= Date.now() || session.replacedBySessionId || session.userId !== payload.sub) {
        throw new HttpError(401, 'Invalid bearer token');
      }

      request.trustshieldContext = {
        requestId: normalizedRequestId,
        apiVersion: 'v1',
        actor: {
          subject: payload.sub,
          role: 'user',
          scopes: [],
          tenantId: undefined,
        },
      };

      return true;
    }

    const claimsValidation = safeParseAuthClaims({
      subject: normalizeHeader(request.headers?.['x-trustshield-subject']),
      role: normalizeHeader(request.headers?.['x-trustshield-role']) ?? 'anonymous',
      scopes: parseScopes(normalizeHeader(request.headers?.['x-trustshield-scopes'])),
      tenantId: normalizeHeader(request.headers?.['x-trustshield-tenant-id']),
    });

    if (!claimsValidation.success) {
      throw new HttpError(400, 'Invalid auth claims headers', claimsValidation.issues);
    }

    request.trustshieldContext = {
      requestId: normalizedRequestId,
      apiVersion: 'v1',
      actor: claimsValidation.data,
    };

    return true;
  }
}
