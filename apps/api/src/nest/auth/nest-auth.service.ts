import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type {
  AssetsRepository,
  ChecksRepository,
  EvidenceSnapshotsRepository,
  JobsRepository,
  RemovalCasesRepository,
  ReviewItemsRepository,
  SourcesRepository,
  SupportRequestsRepository,
  UserImagesRepository,
  UserSessionsRepository,
  UsersRepository,
} from '@trustshield/db';
import type { ApiActorRole, ApiRequestContext, AuthResponse, AuthUser } from '@trustshield/validation';
import {
  safeParseChangePasswordRequest,
  safeParseAuthClaims,
  safeParseLoginRequest,
  safeParseRefreshRequest,
  safeParseRegisterRequest,
  safeParseUserAvatarUploadIntentRequest,
  safeParseUpdateUserProfileRequest,
} from '@trustshield/validation';

import { HttpError } from '../../modules/shared/http.js';
import {
  ASSETS_REPOSITORY,
  CHECKS_REPOSITORY,
  EVIDENCE_SNAPSHOTS_REPOSITORY,
  JOBS_REPOSITORY,
  REMOVAL_CASES_REPOSITORY,
  REVIEW_ITEMS_REPOSITORY,
  SOURCES_REPOSITORY,
  SUPPORT_REQUESTS_REPOSITORY,
  USER_IMAGES_REPOSITORY,
  USER_SESSIONS_REPOSITORY,
  USERS_REPOSITORY,
} from '../database/database.module.js';
import type { AppConfig } from '../config/app-config.js';
import { NestMinioService } from '../storage/minio/minio.service.js';
import { readBearerTokenFromHeaders, signJwt, verifyJwt, type JwtPayload } from './jwt-rs256.js';

type VerifiedAccessPrincipal = {
  userId: string;
  jti: string;
};

type AuthTokenPairAndSession = {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  jti: string;
};

function hashToken(rawToken: string) {
  return createHash('sha256').update(rawToken).digest('hex');
}

function normalizeHeaderValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function parseScopes(rawScopes: string | undefined) {
  if (!rawScopes) {
    return [];
  }

  return rawScopes
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean);
}

function composeFullName(firstName: string | null, lastName: string | null) {
  const fullName = [firstName, lastName]
    .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
    .join(' ')
    .trim();

  return fullName.length > 0 ? fullName : undefined;
}

function splitFullName(fullName: string | undefined) {
  if (!fullName || fullName.trim().length === 0) {
    return {
      firstName: undefined,
      lastName: undefined,
    };
  }

  const parts = fullName.trim().split(/\s+/u);

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: undefined,
    };
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts.at(-1),
  };
}

@Injectable()
export class NestAuthService {
  private readonly accessTtlSeconds: number;
  private readonly refreshTtlSeconds: number;
  private readonly issuer?: string;
  private readonly audience?: string;

  constructor(
    @Inject(USERS_REPOSITORY) private readonly usersRepository: UsersRepository,
    @Inject(USER_IMAGES_REPOSITORY) private readonly userImagesRepository: UserImagesRepository,
    @Inject(USER_SESSIONS_REPOSITORY) private readonly userSessionsRepository: UserSessionsRepository,
    @Inject(ASSETS_REPOSITORY) private readonly assetsRepository: AssetsRepository,
    @Inject(CHECKS_REPOSITORY) private readonly checksRepository: ChecksRepository,
    @Inject(SOURCES_REPOSITORY) private readonly sourcesRepository: SourcesRepository,
    @Inject(REMOVAL_CASES_REPOSITORY) private readonly removalCasesRepository: RemovalCasesRepository,
    @Inject(SUPPORT_REQUESTS_REPOSITORY) private readonly supportRequestsRepository: SupportRequestsRepository,
    @Inject(JOBS_REPOSITORY) private readonly jobsRepository: JobsRepository,
    @Inject(REVIEW_ITEMS_REPOSITORY) private readonly reviewItemsRepository: ReviewItemsRepository,
    @Inject(EVIDENCE_SNAPSHOTS_REPOSITORY) private readonly evidenceSnapshotsRepository: EvidenceSnapshotsRepository,
    @Inject(NestMinioService) private readonly minioService: NestMinioService,
    @Inject(ConfigService) configService: ConfigService,
  ) {
    const appConfig = configService.get<AppConfig>('app');

    if (!appConfig) {
      throw new Error('Fehlende Konfiguration: app');
    }

    this.accessTtlSeconds = appConfig.jwt.accessTtlSeconds;
    this.refreshTtlSeconds = appConfig.jwt.refreshTtlSeconds;
    this.issuer = appConfig.jwt.issuer;
    this.audience = appConfig.jwt.audience;
  }

  private async assertSessionActive(jti: string) {
    const session = await this.userSessionsRepository.findActiveByJti(jti);

    if (!session || session.expiresAt.getTime() <= Date.now()) {
      throw new HttpError(401, 'Invalid bearer token');
    }

    if (session.replacedBySessionId) {
      throw new HttpError(401, 'Invalid bearer token');
    }

    return session;
  }

  private requireAuthenticatedBearer(request: IncomingMessage, context: ApiRequestContext) {
    const bearerToken = readBearerTokenFromHeaders(request.headers as Record<string, string | string[] | undefined> | undefined);

    if (!bearerToken) {
      throw new HttpError(401, 'Authentication required');
    }

    if (!context.actor.subject || context.actor.role === 'anonymous') {
      throw new HttpError(401, 'Authentication required');
    }

    return context.actor.subject;
  }

  private toAuthUser(user: { id: string; email: string; firstName: string | null; lastName: string | null }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      role: 'user',
      fullName: composeFullName(user.firstName, user.lastName),
    };
  }

  private async issueTokenPair(user: { id: string; email: string }): Promise<AuthTokenPairAndSession> {
    const sessionId = `session-${randomUUID()}`;
    const jti = randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const refreshExp = now + this.refreshTtlSeconds;
    const refreshPayload: JwtPayload = {
      sub: user.id,
      jti,
      typ: 'refresh',
      iat: now,
      exp: refreshExp,
      aud: this.audience,
      iss: this.issuer,
    };
    const refreshToken = signJwt(refreshPayload);

    const accessPayload: JwtPayload = {
      sub: user.id,
      jti,
      typ: 'access',
      iat: now,
      exp: now + this.accessTtlSeconds,
      aud: this.audience,
      iss: this.issuer,
    };
    const accessToken = signJwt(accessPayload);

    await this.userSessionsRepository.create({
      id: sessionId,
      userId: user.id,
      jti,
      token: hashToken(refreshToken),
      expiresAt: new Date(refreshExp * 1000),
      createdAt: new Date(),
      revokedAt: null,
      replacedBySessionId: null,
    });

    return {
      accessToken,
      refreshToken,
      sessionId,
      jti,
    };
  }

  private async buildAuthResponse(user: { id: string; email: string; firstName: string | null; lastName: string | null }): Promise<AuthResponse> {
    const pair = await this.issueTokenPair(user);

    return {
      user: this.toAuthUser(user),
      token: pair.accessToken,
      refreshToken: pair.refreshToken,
    };
  }

  async register(body: unknown) {
    const validation = safeParseRegisterRequest(body);

    if (!validation.success) {
      throw new HttpError(400, 'Registration validation failed', validation.issues);
    }

    const email = normalizeEmail(validation.data.email);
    const existing = await this.usersRepository.findByEmail(email);

    if (existing) {
      throw new HttpError(409, 'User with this e-mail already exists');
    }

    const argon2 = await import('argon2');
    const passwordHash = await argon2.hash(validation.data.password, {
      type: argon2.argon2id,
      memoryCost: 19_456,
      timeCost: 2,
      parallelism: 1,
    });
    const name = splitFullName(validation.data.fullName);
    const now = new Date();

    const created = await this.usersRepository.create({
      id: randomUUID(),
      email,
      passwordHash,
      firstName: name.firstName,
      lastName: name.lastName,
      language: 'de',
      theme: 'dark',
      isActive: true,
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    });

    return this.buildAuthResponse(created);
  }

  async login(body: unknown) {
    const validation = safeParseLoginRequest(body);

    if (!validation.success) {
      throw new HttpError(400, 'Login validation failed', validation.issues);
    }

    const user = await this.usersRepository.findByEmail(normalizeEmail(validation.data.email));

    if (!user || !user.isActive) {
      throw new HttpError(401, 'Invalid credentials');
    }

    const argon2 = await import('argon2');
    const isValidPassword = await argon2.verify(user.passwordHash, validation.data.password);

    if (!isValidPassword) {
      throw new HttpError(401, 'Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async refresh(body: unknown) {
    const validation = safeParseRefreshRequest(body);

    if (!validation.success) {
      throw new HttpError(400, 'Refresh validation failed', validation.issues);
    }

    const payload = verifyJwt(validation.data.refreshToken, 'refresh');
    const oldSession = await this.assertSessionActive(payload.jti);
    const expectedTokenHash = hashToken(validation.data.refreshToken);

    if (!timingSafeEqual(Buffer.from(oldSession.token, 'utf8'), Buffer.from(expectedTokenHash, 'utf8'))) {
      throw new HttpError(401, 'Invalid refresh token');
    }

    const user = await this.usersRepository.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new HttpError(401, 'Invalid refresh token');
    }

    const pair = await this.issueTokenPair(user);
    await this.userSessionsRepository.revokeAndReplace(oldSession.id, pair.sessionId);

    return {
      user: this.toAuthUser(user),
      token: pair.accessToken,
      refreshToken: pair.refreshToken,
    } satisfies AuthResponse;
  }

  async logout(request: IncomingMessage) {
    const token = readBearerTokenFromHeaders(request.headers as Record<string, string | string[] | undefined> | undefined);

    if (!token) {
      throw new HttpError(401, 'Authentication required');
    }

    const payload = verifyJwt(token, 'access');
    const session = await this.userSessionsRepository.findByJti(payload.jti);

    if (!session) {
      throw new HttpError(401, 'Invalid bearer token');
    }

    await this.userSessionsRepository.revokeById(session.id);

    return { status: 'ok' as const };
  }

  async resolveAccessPrincipal(token: string): Promise<VerifiedAccessPrincipal> {
    const payload = verifyJwt(token, 'access');
    const session = await this.assertSessionActive(payload.jti);

    if (session.userId !== payload.sub) {
      throw new HttpError(401, 'Invalid bearer token');
    }

    return {
      userId: payload.sub,
      jti: payload.jti,
    };
  }

  async createRequestContextFromRequest(request: IncomingMessage): Promise<ApiRequestContext> {
    const requestIdValue = normalizeHeaderValue(request.headers?.['x-request-id']);
    const requestId = requestIdValue && requestIdValue.length > 0 ? requestIdValue : randomUUID();
    const bearerToken = readBearerTokenFromHeaders(request.headers as Record<string, string | string[] | undefined> | undefined);

    if (bearerToken) {
      const principal = await this.resolveAccessPrincipal(bearerToken);

      return {
        requestId,
        apiVersion: 'v1',
        actor: {
          subject: principal.userId,
          role: 'user',
          scopes: [],
          tenantId: undefined,
        },
      };
    }

    const claimsValidation = safeParseAuthClaims({
      subject: normalizeHeaderValue(request.headers?.['x-trustshield-subject']),
      role: normalizeHeaderValue(request.headers?.['x-trustshield-role']) ?? 'anonymous',
      scopes: parseScopes(normalizeHeaderValue(request.headers?.['x-trustshield-scopes'])),
      tenantId: normalizeHeaderValue(request.headers?.['x-trustshield-tenant-id']),
    });

    if (!claimsValidation.success) {
      return {
        requestId,
        apiVersion: 'v1',
        actor: {
          subject: undefined,
          role: 'anonymous',
          scopes: [],
          tenantId: undefined,
        },
      };
    }

    return {
      requestId,
      apiVersion: 'v1',
      actor: claimsValidation.data,
    };
  }

  async getCurrentUser(_request: IncomingMessage, context: ApiRequestContext) {
    const subject = context.actor.subject;

    if (!subject || context.actor.role === 'anonymous') {
      throw new HttpError(401, 'Authentication required');
    }

    const user = await this.usersRepository.findById(subject);

    if (!user) {
      throw new HttpError(404, `User ${subject} not found`);
    }

    return {
      id: user.id,
      email: user.email,
      role: 'user' as ApiActorRole,
      fullName: composeFullName(user.firstName, user.lastName),
      locale: user.language,
      timezone: undefined,
      preferredContact: undefined,
    };
  }

  async updateCurrentUser(request: IncomingMessage, context: ApiRequestContext, body: unknown) {
    this.requireAuthenticatedBearer(request, context);
    const currentUser = await this.getCurrentUser(request, context);
    const validation = safeParseUpdateUserProfileRequest(body);

    if (!validation.success) {
      throw new HttpError(400, 'User profile validation failed', validation.issues);
    }

    const updatePayload: {
      updatedAt: Date;
      firstName?: string;
      lastName?: string;
      language?: string;
    } = {
      updatedAt: new Date(),
    };

    if (validation.data.fullName !== undefined) {
      const splitName = splitFullName(validation.data.fullName);
      updatePayload.firstName = splitName.firstName;
      updatePayload.lastName = splitName.lastName;
    }

    if (validation.data.locale !== undefined) {
      updatePayload.language = validation.data.locale;
    }

    const updatedUser = await this.usersRepository.updateById(currentUser.id, updatePayload);

    if (!updatedUser) {
      throw new HttpError(404, `User ${currentUser.id} not found`);
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      role: 'user' as ApiActorRole,
      fullName: composeFullName(updatedUser.firstName, updatedUser.lastName),
      locale: updatedUser.language,
      timezone: validation.data.timezone,
      preferredContact: validation.data.preferredContact,
    };
  }

  async deleteCurrentUser(request: IncomingMessage, context: ApiRequestContext) {
    this.requireAuthenticatedBearer(request, context);
    const currentUser = await this.getCurrentUser(request, context);

    await this.userSessionsRepository.revokeAllActiveByUserId(currentUser.id);
    const deletedAssets = await this.assetsRepository.deleteByOwnerUserId(currentUser.id);
    const deletedChecks = await this.checksRepository.deleteByOwnerUserId(currentUser.id);
    const deletedSources = await this.sourcesRepository.deleteByOwnerUserId(currentUser.id);
    const deletedSupportRequests = await this.supportRequestsRepository.deleteByOwnerUserId(currentUser.id);
    const deletedReviewItems = await this.reviewItemsRepository.deleteByOwnerUserId(currentUser.id);
    const deletedEvidenceSnapshots = await this.evidenceSnapshotsRepository.deleteByOwnerUserId(currentUser.id);
    const deletedRemovalCases = await this.removalCasesRepository.deleteByOwnerUserId(currentUser.id);
    const deletedJobs = await this.jobsRepository.deleteByOwnerUserId(currentUser.id);
    const deletedUserImages = await this.userImagesRepository.deleteByUserId(currentUser.id);
    await this.usersRepository.deleteById(currentUser.id);

    return {
      status: 'deleted' as const,
      userId: currentUser.id,
      deletedResources: {
        assets: deletedAssets.length,
        checks: deletedChecks.length,
        sources: deletedSources.length,
        supportRequests: deletedSupportRequests.length,
        reviewItems: deletedReviewItems.length,
        evidenceSnapshots: deletedEvidenceSnapshots.length,
        removalCases: deletedRemovalCases.length,
        jobs: deletedJobs.length,
        userImages: deletedUserImages.length,
      },
    };
  }

  async changeCurrentUserPassword(request: IncomingMessage, context: ApiRequestContext, body: unknown) {
    this.requireAuthenticatedBearer(request, context);
    const currentUser = await this.getCurrentUser(request, context);
    const validation = safeParseChangePasswordRequest(body);

    if (!validation.success) {
      throw new HttpError(400, 'Change-password validation failed', validation.issues);
    }

    const user = await this.usersRepository.findById(currentUser.id);

    if (!user) {
      throw new HttpError(404, `User ${currentUser.id} not found`);
    }

    const argon2 = await import('argon2');
    const isCurrentPasswordValid = await argon2.verify(user.passwordHash, validation.data.currentPassword);

    if (!isCurrentPasswordValid) {
      throw new HttpError(401, 'Invalid current password');
    }

    const newPasswordHash = await argon2.hash(validation.data.newPassword, {
      type: argon2.argon2id,
      memoryCost: 19_456,
      timeCost: 2,
      parallelism: 1,
    });

    await this.usersRepository.updateById(currentUser.id, {
      passwordHash: newPasswordHash,
      updatedAt: new Date(),
    });
    await this.userSessionsRepository.revokeAllActiveByUserId(currentUser.id);

    return {
      status: 'ok' as const,
      userId: currentUser.id,
      sessionsRevoked: true,
    };
  }

  async createCurrentUserAvatarUploadIntent(request: IncomingMessage, context: ApiRequestContext, body: unknown) {
    this.requireAuthenticatedBearer(request, context);
    const currentUser = await this.getCurrentUser(request, context);
    const validation = safeParseUserAvatarUploadIntentRequest(body);

    if (!validation.success) {
      throw new HttpError(400, 'Avatar upload-intent validation failed', validation.issues);
    }

    const imageId = randomUUID();
    const filename = validation.data.filename ?? `avatar-${imageId}`;
    const storageKey = this.minioService.buildQuarantineStorageKey({
      ownerSubject: currentUser.id,
      assetId: imageId,
      filename,
    });
    const signed = await this.minioService.createSignedPutUrl({
      objectKey: storageKey,
      contentType: validation.data.contentType,
    });
    const now = new Date();

    await this.userImagesRepository.create({
      id: imageId,
      userId: currentUser.id,
      filename,
      mimeType: validation.data.contentType,
      fileSizeBytes: 0,
      storageKey,
      imageUrl: null,
      isPrimary: true,
      createdAt: now,
      updatedAt: now,
    });

    await this.usersRepository.updateById(currentUser.id, {
      avatarUrl: storageKey,
      updatedAt: now,
    });

    return {
      imageId,
      upload: signed,
    };
  }

  async getCurrentUserAvatar(request: IncomingMessage, context: ApiRequestContext) {
    this.requireAuthenticatedBearer(request, context);
    const currentUser = await this.getCurrentUser(request, context);
    const primary = await this.userImagesRepository.findPrimaryByUserId(currentUser.id);

    if (!primary) {
      throw new HttpError(404, 'Avatar not found');
    }

    const signed = await this.minioService.createSignedGetUrl({
      objectKey: primary.storageKey,
    });

    return {
      imageId: primary.id,
      mimeType: primary.mimeType,
      storageKey: primary.storageKey,
      view: signed,
    };
  }

  async deleteCurrentUserAvatar(request: IncomingMessage, context: ApiRequestContext) {
    this.requireAuthenticatedBearer(request, context);
    const currentUser = await this.getCurrentUser(request, context);
    const deletedImages = await this.userImagesRepository.deleteByUserId(currentUser.id);

    await this.usersRepository.updateById(currentUser.id, {
      avatarUrl: null,
      updatedAt: new Date(),
    });

    return {
      status: 'deleted' as const,
      userId: currentUser.id,
      deletedImages: deletedImages.length,
    };
  }

  async exportCurrentUserData(request: IncomingMessage, context: ApiRequestContext) {
    this.requireAuthenticatedBearer(request, context);
    const currentUser = await this.getCurrentUser(request, context);
    const user = await this.usersRepository.findById(currentUser.id);

    if (!user) {
      throw new HttpError(404, `User ${currentUser.id} not found`);
    }

    const assets = await this.assetsRepository.listByOwner(currentUser.id);
    const checks = await this.checksRepository.listByOwner(currentUser.id);
    const sources = await this.sourcesRepository.listByOwner(currentUser.id);
    const removalCases = await this.removalCasesRepository.listByOwner(currentUser.id);
    const supportRequests = await this.supportRequestsRepository.listByOwner(currentUser.id);
    const jobs = await this.jobsRepository.listForOwner(currentUser.id);
    const reviewItems = await this.reviewItemsRepository.listVisibleForUser(currentUser.id);
    const evidenceSnapshots = await this.evidenceSnapshotsRepository.listVisibleForUser(currentUser.id);
    const userImages = await this.userImagesRepository.listByUserId(currentUser.id);

    return {
      exportedAt: new Date().toISOString(),
      apiVersion: 'v1',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        language: user.language,
        theme: user.theme,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      data: {
        assets,
        checks,
        sources,
        removalCases,
        supportRequests,
        jobs,
        reviewItems,
        evidenceSnapshots,
        userImages,
      },
    };
  }
}
