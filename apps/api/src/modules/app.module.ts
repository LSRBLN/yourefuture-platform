import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiPermission, ApiRequestContext } from '@trustshield/validation';
import { apiEnvironment, createAppManifest, getWorkerQueueTopology } from '@trustshield/core';
import { createTrustshieldStore } from '@trustshield/db';
import { safeParseIntakeOrchestrator } from '@trustshield/validation';

import { AuthController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { AssetsController } from './assets/assets.controller.js';
import { AssetsService } from './assets/assets.service.js';
import { ChecksController } from './checks/checks.controller.js';
import { ChecksService } from './checks/checks.service.js';
import { EvidenceSnapshotsController } from './evidence-snapshots/evidence-snapshots.controller.js';
import { EvidenceSnapshotsService } from './evidence-snapshots/evidence-snapshots.service.js';
import { buildRequestContext, requirePermissions } from './platform/auth-context.js';
import { JobsController } from './jobs/jobs.controller.js';
import { JobsService } from './jobs/jobs.service.js';
import { RemovalCasesController } from './removal-cases/removal-cases.controller.js';
import { RemovalCasesService } from './removal-cases/removal-cases.service.js';
import { ReviewItemsController } from './review-items/review-items.controller.js';
import { ReviewItemsService } from './review-items/review-items.service.js';
import { SourcesController } from './sources/sources.controller.js';
import { SourcesService } from './sources/sources.service.js';
import { SupportRequestsController } from './support-requests/support-requests.controller.js';
import { SupportRequestsService } from './support-requests/support-requests.service.js';
import { HttpError, writeErrorJson, writeJson } from './shared/http.js';

type RouteHandler = (
  request: IncomingMessage,
  response: ServerResponse,
  body: unknown,
  context: ApiRequestContext,
) => Promise<void>;

type RouteDefinition = {
  method: string;
  path: RegExp;
  allowAnonymous: boolean;
  requireAuthenticatedActor?: boolean;
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
  permissions: readonly ApiPermission[];
  handler: RouteHandler;
};

function prefixRoute(path: RegExp) {
  const normalizedPath = path.source.replace(/^\^/, '').replace(/\$$/, '');
  return new RegExp(`^(?:/api/v1)?${normalizedPath}$`);
}

async function readJsonBody(request: IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
  } catch {
    throw new HttpError(400, 'Invalid JSON payload');
  }
}

export function createApiApp(options?: { seedDemoData?: boolean }) {
  const manifest = createAppManifest('api');
  const store = createTrustshieldStore({ seedDemoData: options?.seedDemoData ?? false });
  const rateLimitEntries = new Map<string, { count: number; windowStartedAt: number }>();

  const checksService = new ChecksService(store);
  const assetsService = new AssetsService(store);
  const sourcesService = new SourcesService(store);
  const removalCasesService = new RemovalCasesService(store);
  const supportRequestsService = new SupportRequestsService(store);
  const reviewItemsService = new ReviewItemsService(store);
  const evidenceSnapshotsService = new EvidenceSnapshotsService(store);
  const jobsService = new JobsService(store);
  const authService = new AuthService();

  const authController = new AuthController(authService);
  const assetsController = new AssetsController(assetsService);
  const checksController = new ChecksController(checksService);
  const sourcesController = new SourcesController(sourcesService);
  const removalCasesController = new RemovalCasesController(removalCasesService);
  const supportRequestsController = new SupportRequestsController(supportRequestsService);
  const reviewItemsController = new ReviewItemsController(reviewItemsService);
  const evidenceSnapshotsController = new EvidenceSnapshotsController(evidenceSnapshotsService);
  const jobsController = new JobsController(jobsService);

  async function handleIntakeOrchestrator(body: unknown) {
    const validation = safeParseIntakeOrchestrator(body);

    if (!validation.success) {
      throw new HttpError(400, 'Intake orchestrator validation failed', validation.issues);
    }

    const check = store.createCheck(validation.data.payload.check);
    const source = store.createSource({
      ...validation.data.payload.source,
      checkId: validation.data.payload.source.checkId ?? check.id,
    });
    const support = store.createSupportRequest({
      ...validation.data.payload.support,
      checkId: validation.data.payload.support.checkId ?? check.id,
    });

    return {
      status: 'accepted' as const,
      apiVersion: 'v1' as const,
      requestId: `intake-${check.id}-${support.id}`,
      concern: validation.data.concern,
      created: {
        checkId: check.id,
        sourceId: source.id,
        supportRequestId: support.id,
      },
      queue: {
        reviewPriority: support.priority,
        nextStep: 'Review-Triage mit optionalem Removal-Handover',
        enqueuedJobs: [
          { queue: 'checks', name: 'check.execute' },
          { queue: 'support', name: 'support.triage' },
        ],
      },
      validation: {
        checkIssueCount: 0,
        sourceIssueCount: 0,
        supportIssueCount: 0,
      },
    };
  }

  function getRateLimitKey(request: IncomingMessage, pathname: string, context: ApiRequestContext) {
    const forwardedFor = request.headers?.['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    const actorKey = context.actor.subject ?? ipAddress ?? 'anonymous';
    return `${pathname}:${actorKey}`;
  }

  function applyRateLimit(route: RouteDefinition, request: IncomingMessage, pathname: string, context: ApiRequestContext) {
    if (!route.rateLimit) {
      return;
    }

    const now = Date.now();
    const key = getRateLimitKey(request, pathname, context);
    const currentEntry = rateLimitEntries.get(key);

    if (!currentEntry || now - currentEntry.windowStartedAt >= route.rateLimit.windowMs) {
      rateLimitEntries.set(key, { count: 1, windowStartedAt: now });
      return;
    }

    if (currentEntry.count >= route.rateLimit.maxRequests) {
      const retryAfterSeconds = Math.ceil((route.rateLimit.windowMs - (now - currentEntry.windowStartedAt)) / 1000);
      throw new HttpError(429, 'Rate limit exceeded', { retryAfterSeconds });
    }

    currentEntry.count += 1;
  }

  const routes: RouteDefinition[] = [
    {
      method: 'GET',
      path: prefixRoute(/^\/health$/),
      allowAnonymous: true,
      requireAuthenticatedActor: false,
      permissions: [],
      handler: async (_req, res, _body, context) =>
        writeJson(res, 200, {
          status: 'ok',
          apiVersion: context.apiVersion,
          apiBasePath: '/api/v1',
          legacyPathCompatibility: false,
          authStrategy: 'oidc-or-bridge-bearer',
          transitionTarget: 'none',
          app: manifest,
          env: apiEnvironment,
        }),
    },
    {
      method: 'POST',
      path: prefixRoute(/^\/auth\/register$/),
      allowAnonymous: true,
      requireAuthenticatedActor: false,
      rateLimit: { windowMs: 60_000, maxRequests: 3 },
      permissions: [],
      handler: (req, res, body, _context) => authController.register(req, res, body),
    },
    {
      method: 'POST',
      path: prefixRoute(/^\/auth\/login$/),
      allowAnonymous: true,
      requireAuthenticatedActor: false,
      rateLimit: { windowMs: 60_000, maxRequests: 5 },
      permissions: [],
      handler: (req, res, body, _context) => authController.login(req, res, body),
    },
    {
      method: 'POST',
      path: prefixRoute(/^\/auth\/refresh$/),
      allowAnonymous: true,
      requireAuthenticatedActor: false,
      rateLimit: { windowMs: 60_000, maxRequests: 10 },
      permissions: [],
      handler: (req, res, body, _context) => authController.refresh(req, res, body),
    },
    {
      method: 'POST',
      path: prefixRoute(/^\/auth\/logout$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      permissions: [],
      handler: (req, res, _body, _context) => authController.logout(req, res),
    },
    {
      method: 'GET',
      path: prefixRoute(/^\/auth\/me$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      permissions: [],
      handler: (req, res, _body, context) => authController.me(req, res, context),
    },
    {
      method: 'GET',
      path: prefixRoute(/^\/users\/me$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      permissions: [],
      handler: (req, res, _body, context) => authController.me(req, res, context),
    },
    {
      method: 'PATCH',
      path: prefixRoute(/^\/users\/me$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      rateLimit: { windowMs: 60_000, maxRequests: 20 },
      permissions: [],
      handler: (req, res, body, context) => authController.updateMe(req, res, body, context),
    },
    {
      method: 'DELETE',
      path: prefixRoute(/^\/users\/me$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      rateLimit: { windowMs: 60_000, maxRequests: 5 },
      permissions: [],
      handler: (req, res, _body, context) => authController.deleteMe(req, res, context),
    },
    {
      method: 'GET',
      path: prefixRoute(/^\/health\/live$/),
      allowAnonymous: true,
      requireAuthenticatedActor: false,
      permissions: [],
      handler: async (_req, res, _body, context) =>
        writeJson(res, 200, {
          status: 'ok',
          check: 'live',
          apiVersion: context.apiVersion,
        }),
    },
    {
      method: 'GET',
      path: prefixRoute(/^\/health\/ready$/),
      allowAnonymous: true,
      requireAuthenticatedActor: false,
      permissions: [],
      handler: async (_req, res, _body, context) =>
        writeJson(res, 200, {
          status: 'ok',
          check: 'ready',
          apiVersion: context.apiVersion,
          dependencies: {
            database: 'configured',
            queue: 'configured',
          },
        }),
    },
    {
      method: 'POST',
      path: prefixRoute(/^\/assets$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      rateLimit: { windowMs: 60_000, maxRequests: 10 },
      permissions: ['assets:create'],
      handler: (req, res, body, context) => assetsController.create(req, res, body, context),
    },
    {
      method: 'GET',
      path: prefixRoute(/^\/assets\/([^/]+)$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      permissions: ['assets:read'],
      handler: (req, res, _body, context) => assetsController.getById(req, res, context),
    },
    {
      method: 'GET',
      path: prefixRoute(/^\/assets\/([^/]+)\/deepfake-results$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      permissions: ['assets:read'],
      handler: (req, res, _body, context) => assetsController.getDeepfakeResults(req, res, context),
    },
    {
      method: 'POST',
      path: prefixRoute(/^\/assets\/([^/]+)\/complete-upload$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      rateLimit: { windowMs: 60_000, maxRequests: 20 },
      permissions: ['assets:update'],
      handler: (req, res, body, context) => assetsController.completeUpload(req, res, body, context),
    },
    {
      method: 'POST',
      path: prefixRoute(/^\/assets\/([^/]+)\/start-scan$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      permissions: ['assets:update'],
      handler: (req, res, _body, context) => assetsController.startScan(req, res, undefined, context),
    },
    {
      method: 'POST',
      path: prefixRoute(/^\/assets\/([^/]+)\/finalize-security$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      permissions: ['assets:update'],
      handler: (req, res, body, context) => assetsController.finalizeSecurity(req, res, body, context),
    },
    {
      method: 'GET',
      path: prefixRoute(/^\/jobs\/topology$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      rateLimit: { windowMs: 60_000, maxRequests: 30 },
      permissions: ['jobs:read'],
      handler: async (_req, res, _body, context) =>
        writeJson(res, 200, {
          status: 'ok',
          apiVersion: context.apiVersion,
          data: getWorkerQueueTopology(),
        }),
    },
    {
      method: 'GET',
      path: prefixRoute(/^\/jobs$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      rateLimit: { windowMs: 60_000, maxRequests: 60 },
      permissions: ['jobs:read'],
      handler: (req, res, _body, context) => jobsController.list(req, res, context),
    },
    {
      method: 'GET',
      path: prefixRoute(/^\/jobs\/([^/]+)$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      rateLimit: { windowMs: 60_000, maxRequests: 60 },
      permissions: ['jobs:read'],
      handler: (req, res, _body, context) => jobsController.getById(req, res, context),
    },
    {
      method: 'POST',
      path: prefixRoute(/^\/intake\/orchestrator$/),
      allowAnonymous: true,
      requireAuthenticatedActor: false,
      rateLimit: { windowMs: 60_000, maxRequests: 10 },
      permissions: [],
      handler: async (_req, res, body) => writeJson(res, 202, await handleIntakeOrchestrator(body)),
    },
    {
      method: 'POST',
      path: prefixRoute(/^\/checks$/),
      allowAnonymous: true,
      requireAuthenticatedActor: false,
      rateLimit: { windowMs: 60_000, maxRequests: 20 },
      permissions: [],
      handler: (req, res, body, context) => checksController.create(req, res, body, context),
    },
    {
      method: 'GET',
      path: prefixRoute(/^\/checks\/([^/]+)$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      permissions: ['checks:read'],
      handler: (req, res, _body, context) => checksController.getById(req, res, context),
    },
    {
      method: 'POST',
      path: prefixRoute(/^\/sources$/),
      allowAnonymous: true,
      requireAuthenticatedActor: false,
      rateLimit: { windowMs: 60_000, maxRequests: 20 },
      permissions: [],
      handler: (req, res, body, context) => sourcesController.create(req, res, body, context),
    },
    {
      method: 'GET',
      path: prefixRoute(/^\/sources\/([^/]+)$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      permissions: ['sources:read'],
      handler: (req, res, _body, context) => sourcesController.getById(req, res, context),
    },
    {
      method: 'GET',
      path: prefixRoute(/^\/reviews$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      permissions: ['reviews:read'],
      handler: (req, res, _body, context) => reviewItemsController.list(req, res, context),
    },
    {
      method: 'GET',
      path: prefixRoute(/^\/reviews\/([^/]+)$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      permissions: ['reviews:read'],
      handler: (req, res, _body, context) => reviewItemsController.getById(req, res, context),
    },
    {
      method: 'GET',
      path: prefixRoute(/^\/evidence-snapshots\/([^/]+)$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      permissions: ['reviews:read'],
      handler: (req, res, _body, context) => evidenceSnapshotsController.getById(req, res, context),
    },
    {
      method: 'GET',
      path: prefixRoute(/^\/support-requests$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      rateLimit: { windowMs: 60_000, maxRequests: 60 },
      permissions: ['support_requests:read'],
      handler: (req, res, _body, context) => supportRequestsController.list(req, res, context),
    },
    {
      method: 'POST',
      path: prefixRoute(/^\/support-requests$/),
      allowAnonymous: true,
      requireAuthenticatedActor: false,
      rateLimit: { windowMs: 60_000, maxRequests: 20 },
      permissions: [],
      handler: (req, res, body, context) => supportRequestsController.create(req, res, body, context),
    },
    {
      method: 'GET',
      path: prefixRoute(/^\/support-requests\/([^/]+)$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      permissions: ['support_requests:read'],
      handler: (req, res, _body, context) => supportRequestsController.getById(req, res, context),
    },
    {
      method: 'POST',
      path: prefixRoute(/^\/support-requests\/([^/]+)\/assign$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      permissions: ['support_requests:assign'],
      handler: (req, res, body, _context) => supportRequestsController.assign(req, res, body),
    },
    {
      method: 'POST',
      path: prefixRoute(/^\/support-requests\/([^/]+)\/status$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      permissions: ['support_requests:transition'],
      handler: (req, res, body, _context) => supportRequestsController.transitionStatus(req, res, body),
    },
    {
      method: 'POST',
      path: prefixRoute(/^\/removal-cases$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      permissions: ['removal_cases:create'],
      handler: (req, res, body, context) => removalCasesController.create(req, res, body, context),
    },
    {
      method: 'GET',
      path: prefixRoute(/^\/removal-cases\/([^/]+)$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      permissions: ['removal_cases:read'],
      handler: (req, res, _body, context) => removalCasesController.getById(req, res, context),
    },
    {
      method: 'POST',
      path: prefixRoute(/^\/removal-cases\/([^/]+)\/actions$/),
      allowAnonymous: false,
      requireAuthenticatedActor: true,
      permissions: ['removal_cases:update'],
      handler: (req, res, body, context) => removalCasesController.appendAction(req, res, body, context),
    },
  ];

  return {
    async handle(request: IncomingMessage, response: ServerResponse) {
      try {
        const requestUrl = request.url ?? '/';
        const pathname = requestUrl.split('?')[0] ?? '/';
        const method = request.method ?? 'GET';
        const route = routes.find((candidate) => candidate.method === method && candidate.path.test(pathname));

        if (!route) {
          writeErrorJson(response, new HttpError(404, `Route ${method} ${pathname} not found`));
          return;
        }

        const context = buildRequestContext(request);

        if (!route.allowAnonymous) {
          if (route.requireAuthenticatedActor && (context.actor.role === 'anonymous' || !context.actor.subject)) {
            throw new HttpError(401, 'Authentication required');
          }

          requirePermissions(context, route.permissions);
        }

        applyRateLimit(route, request, pathname, context);

        const body = method === 'POST' || method === 'PATCH' ? await readJsonBody(request) : undefined;
        await route.handler(request, response, body, context);
      } catch (error) {
        if (error instanceof HttpError) {
          writeErrorJson(response, error);
          return;
        }

        const message = error instanceof Error ? error.message : 'Unexpected API error';
        writeErrorJson(response, new HttpError(500, message));
      }
    },
  };
}
