import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

import { safeParseAuthClaims, type ApiPermission, type ApiRequestContext, type ApiScopeToken } from '@trustshield/validation';

import { readBearerToken, verifyAccessToken } from '../auth/auth-token.js';
import { HttpError } from '../shared/http.js';

const rolePermissions: Record<ApiRequestContext['actor']['role'], ApiPermission[]> = {
  anonymous: [],
  user: [
    'assets:create',
    'assets:read',
    'assets:update',
    'checks:create',
    'checks:read',
    'sources:create',
    'sources:read',
    'support_requests:create',
    'support_requests:read',
    'removal_cases:create',
    'removal_cases:read',
    'removal_cases:update',
  ],
  support_agent: [
    'assets:read',
    'checks:read',
    'sources:read',
    'support_requests:read',
    'support_requests:assign',
    'support_requests:transition',
    'removal_cases:create',
    'removal_cases:read',
  ],
  reviewer: [
    'assets:read',
    'checks:read',
    'sources:read',
    'support_requests:read',
    'removal_cases:read',
    'reviews:read',
    'reviews:update',
  ],
  admin: [
    'assets:create',
    'assets:read',
    'assets:update',
    'checks:create',
    'checks:read',
    'jobs:read',
    'sources:create',
    'sources:read',
    'support_requests:create',
    'support_requests:read',
    'support_requests:assign',
    'support_requests:transition',
    'removal_cases:create',
    'removal_cases:read',
    'removal_cases:update',
    'reviews:read',
    'reviews:update',
  ],
  service: [
    'assets:create',
    'assets:read',
    'assets:update',
    'checks:create',
    'checks:read',
    'jobs:read',
    'sources:create',
    'sources:read',
    'support_requests:create',
    'support_requests:read',
    'support_requests:assign',
    'support_requests:transition',
    'removal_cases:create',
    'removal_cases:read',
    'removal_cases:update',
    'reviews:read',
    'reviews:update',
  ],
};

function getHeader(request: IncomingMessage, name: string) {
  const value = request.headers?.[name.toLowerCase()];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseScopes(rawScopes: string | undefined) {
  if (!rawScopes) {
    return [];
  }

  return rawScopes
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean) as ApiScopeToken[];
}

function allowHeaderAuthFallback() {
  if (process.env.TRUSTSHIELD_ALLOW_HEADER_AUTH === 'true') {
    return true;
  }

  if (process.env.TRUSTSHIELD_ALLOW_HEADER_AUTH === 'false') {
    return false;
  }

  return process.env.NODE_ENV !== 'production';
}

function createAnonymousRequestContext(request: IncomingMessage): ApiRequestContext {
  return {
    requestId: getHeader(request, 'x-request-id') ?? randomUUID(),
    apiVersion: 'v1',
    actor: {
      subject: undefined,
      role: 'anonymous',
      scopes: [],
      tenantId: undefined,
    },
  };
}

export function buildRequestContext(request: IncomingMessage): ApiRequestContext {
  const bearerToken = readBearerToken(request);

  if (bearerToken) {
    const verifiedToken = verifyAccessToken(bearerToken);

    return {
      requestId: getHeader(request, 'x-request-id') ?? randomUUID(),
      apiVersion: 'v1',
      actor: {
        subject: verifiedToken.subject,
        role: verifiedToken.role,
        scopes: verifiedToken.scopes,
        tenantId: verifiedToken.tenantId,
      },
    };
  }

  if (!allowHeaderAuthFallback()) {
    return createAnonymousRequestContext(request);
  }

  const claims = safeParseAuthClaims({
    subject: getHeader(request, 'x-trustshield-subject'),
    role: getHeader(request, 'x-trustshield-role') ?? 'anonymous',
    scopes: parseScopes(getHeader(request, 'x-trustshield-scopes')),
    tenantId: getHeader(request, 'x-trustshield-tenant-id'),
  });

  if (!claims.success) {
    throw new HttpError(400, 'Invalid auth claims headers', claims.issues);
  }

  return {
    requestId: getHeader(request, 'x-request-id') ?? randomUUID(),
    apiVersion: 'v1',
    actor: claims.data,
  };
}

export function requirePermissions(context: ApiRequestContext, permissions: readonly ApiPermission[]) {
  if (permissions.length === 0) {
    return;
  }

  if (context.actor.role === 'anonymous' || !context.actor.subject) {
    throw new HttpError(401, 'Authentication required');
  }

  if (context.actor.scopes.includes('*')) {
    return;
  }

  const grantedPermissions = new Set<ApiPermission>([
    ...rolePermissions[context.actor.role],
    ...context.actor.scopes.filter((scope): scope is ApiPermission => scope !== '*'),
  ]);

  const hasAllPermissions = permissions.every((permission) => grantedPermissions.has(permission));

  if (!hasAllPermissions) {
    throw new HttpError(403, 'Insufficient permissions', {
      requiredPermissions: permissions,
      grantedPermissions: [...grantedPermissions.values()],
      role: context.actor.role,
    });
  }
}
