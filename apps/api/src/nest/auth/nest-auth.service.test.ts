import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import test from 'node:test';

import type { ApiRequestContext } from '@trustshield/validation';
import type { UserSessionInsert, UserSessionRow, UserSessionsRepository, UserInsert, UserRow, UsersRepository } from '@trustshield/db';

import { NestAuthService } from './nest-auth.service.js';

type TestConfig = {
  jwt: {
    accessTtlSeconds: number;
    refreshTtlSeconds: number;
    issuer?: string;
    audience?: string;
  };
};

class InMemoryUsersRepository {
  private readonly rows = new Map<string, UserRow>();

  async create(input: UserInsert) {
    const row = input as UserRow;
    this.rows.set(row.id, row);
    return row;
  }

  async findById(id: string) {
    return this.rows.get(id);
  }

  async findByEmail(email: string) {
    return [...this.rows.values()].find((row) => row.email === email);
  }

  async updateById(id: string, input: Partial<UserInsert>) {
    const existing = this.rows.get(id);

    if (!existing) {
      return undefined;
    }

    const next = {
      ...existing,
      ...input,
    } as UserRow;
    this.rows.set(id, next);
    return next;
  }

  async deleteById(id: string) {
    const existing = this.rows.get(id);

    if (!existing) {
      return undefined;
    }

    this.rows.delete(id);
    return existing;
  }
}

class InMemoryUserSessionsRepository {
  private readonly rows = new Map<string, UserSessionRow>();

  async create(input: UserSessionInsert) {
    const row = input as UserSessionRow;
    this.rows.set(row.id, row);
    return row;
  }

  async findByJti(jti: string) {
    return [...this.rows.values()].find((row) => row.jti === jti);
  }

  async findActiveByJti(jti: string) {
    return [...this.rows.values()].find((row) => row.jti === jti && row.revokedAt === null);
  }

  async revokeById(id: string) {
    const existing = this.rows.get(id);

    if (!existing) {
      return undefined;
    }

    const next = {
      ...existing,
      revokedAt: new Date(),
    } as UserSessionRow;
    this.rows.set(id, next);
    return next;
  }

  async revokeAndReplace(sessionId: string, replacementSessionId: string) {
    const existing = this.rows.get(sessionId);

    if (!existing) {
      return undefined;
    }

    const next = {
      ...existing,
      revokedAt: new Date(),
      replacedBySessionId: replacementSessionId,
    } as UserSessionRow;
    this.rows.set(sessionId, next);
    return next;
  }

  async revokeAllActiveByUserId(userId: string) {
    const updated: UserSessionRow[] = [];

    for (const [id, row] of this.rows.entries()) {
      if (row.userId === userId && row.revokedAt === null) {
        const next = {
          ...row,
          revokedAt: new Date(),
        } as UserSessionRow;
        this.rows.set(id, next);
        updated.push(next);
      }
    }

    return updated;
  }
}

function createUserContext(userId: string): ApiRequestContext {
  return {
    requestId: '11111111-1111-1111-1111-111111111111',
    apiVersion: 'v1',
    actor: {
      subject: userId,
      role: 'user',
      scopes: [],
      tenantId: undefined,
    },
  };
}

function createAuthService() {
  const usersRepository = new InMemoryUsersRepository();
  const userImages: Array<{
    id: string;
    userId: string;
    filename: string;
    mimeType: string;
    storageKey: string;
    isPrimary: boolean;
  }> = [];
  const userImagesRepository = {
    create: async (row: {
      id: string;
      userId: string;
      filename: string;
      mimeType: string;
      storageKey: string;
      isPrimary: boolean;
    }) => {
      userImages.push(row);
      return row;
    },
    findPrimaryByUserId: async (userId: string) => {
      return userImages.find((row) => row.userId === userId && row.isPrimary) as
        | {
            id: string;
            userId: string;
            filename: string;
            mimeType: string;
            storageKey: string;
            isPrimary: boolean;
          }
        | undefined;
    },
    deleteByUserId: async (userId: string) => {
      const deleted = userImages.filter((row) => row.userId === userId);
      for (const row of deleted) {
        const index = userImages.findIndex((candidate) => candidate.id === row.id);
        if (index >= 0) {
          userImages.splice(index, 1);
        }
      }
      return deleted;
    },
    listByUserId: async (userId: string) => {
      return userImages.filter((row) => row.userId === userId);
    },
  };
  const sessionsRepository = new InMemoryUserSessionsRepository();
  const ownerScopedDeleteRepository = {
    listByOwner: async () => [],
    deleteByOwnerUserId: async () => [],
  };
  const jobsRepository = {
    deleteByOwnerUserId: async () => [],
    listForOwner: async () => [],
  };
  const visibilityScopedRepository = {
    deleteByOwnerUserId: async () => [],
    listVisibleForUser: async () => [],
  };
  const minioService = {
    buildQuarantineStorageKey: () => 'quarantine/test/key',
    createSignedPutUrl: async () => ({ method: 'PUT', bucket: 'test', objectKey: 'quarantine/test/key', url: 'https://example.com/put', expiresAt: new Date().toISOString(), headers: {} }),
    createSignedGetUrl: async () => ({ method: 'GET', bucket: 'test', objectKey: 'quarantine/test/key', url: 'https://example.com/get', expiresAt: new Date().toISOString(), headers: {} }),
  };
  const config: TestConfig = {
    jwt: {
      accessTtlSeconds: 60 * 60,
      refreshTtlSeconds: 60 * 60 * 24,
      issuer: 'test-issuer',
      audience: 'test-audience',
    },
  };

  const configService = {
    get: () => config,
  };

  return {
    service: new NestAuthService(
      usersRepository as unknown as UsersRepository,
      userImagesRepository as never,
      sessionsRepository as unknown as UserSessionsRepository,
      ownerScopedDeleteRepository as never,
      ownerScopedDeleteRepository as never,
      ownerScopedDeleteRepository as never,
      ownerScopedDeleteRepository as never,
      ownerScopedDeleteRepository as never,
      jobsRepository as never,
      visibilityScopedRepository as never,
      visibilityScopedRepository as never,
      minioService as never,
      configService as never,
    ),
    usersRepository,
    sessionsRepository,
  };
}

test('NestAuthService unterstützt register/login/refresh-rotation/logout-revoke', async () => {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  process.env.JWT_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  process.env.JWT_PUBLIC_KEY = publicKey.export({ type: 'spki', format: 'pem' }).toString();
  process.env.JWT_PRIVATE_KEY_PATH = '';
  process.env.JWT_PUBLIC_KEY_PATH = '';
  process.env.JWT_ISSUER = 'test-issuer';
  process.env.JWT_AUDIENCE = 'test-audience';

  const { service } = createAuthService();

  const registered = await service.register({
    email: 'auth-smoke@example.com',
    password: 'supersecret1',
    fullName: 'Auth Smoke',
  });

  assert.equal(typeof registered.token, 'string');
  assert.equal(typeof registered.refreshToken, 'string');

  const loggedIn = await service.login({
    email: 'auth-smoke@example.com',
    password: 'supersecret1',
  });

  assert.equal(typeof loggedIn.token, 'string');
  assert.equal(typeof loggedIn.refreshToken, 'string');

  const refreshed = await service.refresh({
    refreshToken: loggedIn.refreshToken,
  });

  assert.notEqual(refreshed.refreshToken, loggedIn.refreshToken);

  await assert.rejects(
    () =>
      service.refresh({
        refreshToken: loggedIn.refreshToken,
      }),
    /Invalid bearer token|Invalid refresh token/u,
  );

  await service.logout({
    headers: {
      authorization: `Bearer ${refreshed.token}`,
    },
  } as never);

  await assert.rejects(
    () => service.resolveAccessPrincipal(refreshed.token),
    /Invalid bearer token/u,
  );
});

test('NestAuthService unterstützt /users/me Profile-, Passwort-, Avatar- und Export-Flow', async () => {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  process.env.JWT_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  process.env.JWT_PUBLIC_KEY = publicKey.export({ type: 'spki', format: 'pem' }).toString();
  process.env.JWT_PRIVATE_KEY_PATH = '';
  process.env.JWT_PUBLIC_KEY_PATH = '';
  process.env.JWT_ISSUER = 'test-issuer';
  process.env.JWT_AUDIENCE = 'test-audience';

  const { service } = createAuthService();

  const registered = await service.register({
    email: 'profile-flow@example.com',
    password: 'oldpassword1',
    fullName: 'Profile Flow',
  });
  const context = createUserContext(registered.user.id);
  const request = {
    headers: {
      authorization: `Bearer ${registered.token}`,
    },
  } as never;

  const me = await service.getCurrentUser(request, context);
  assert.equal(me.email, 'profile-flow@example.com');

  const updated = await service.updateCurrentUser(request, context, {
    fullName: 'Profile Updated',
    locale: 'de',
  });
  assert.equal(updated.fullName, 'Profile Updated');
  assert.equal(updated.locale, 'de');

  const changed = await service.changeCurrentUserPassword(request, context, {
    currentPassword: 'oldpassword1',
    newPassword: 'newpassword1',
  });
  assert.equal(changed.sessionsRevoked, true);

  await assert.rejects(
    () =>
      service.login({
        email: 'profile-flow@example.com',
        password: 'oldpassword1',
      }),
    /Invalid credentials/u,
  );

  const relogin = await service.login({
    email: 'profile-flow@example.com',
    password: 'newpassword1',
  });
  assert.equal(typeof relogin.token, 'string');

  const reloginContext = createUserContext(relogin.user.id);
  const reloginRequest = {
    headers: {
      authorization: `Bearer ${relogin.token}`,
    },
  } as never;

  const uploadIntent = await service.createCurrentUserAvatarUploadIntent(reloginRequest, reloginContext, {
    contentType: 'image/png',
    filename: 'avatar.png',
  });
  assert.equal(uploadIntent.upload.method, 'PUT');
  assert.equal(typeof uploadIntent.upload.url, 'string');

  const avatar = await service.getCurrentUserAvatar(reloginRequest, reloginContext);
  assert.equal(avatar.view.method, 'GET');
  assert.equal(typeof avatar.view.url, 'string');

  const exported = await service.exportCurrentUserData(reloginRequest, reloginContext);
  assert.equal(exported.apiVersion, 'v1');
  assert.equal(exported.user.email, 'profile-flow@example.com');
  assert.equal(Array.isArray(exported.data.assets), true);
  assert.equal(Array.isArray(exported.data.checks), true);

  const deletedAvatar = await service.deleteCurrentUserAvatar(reloginRequest, reloginContext);
  assert.equal(deletedAvatar.status, 'deleted');
  assert.equal(deletedAvatar.deletedImages, 1);
});

test('NestAuthService invalidiert Sessions nach users/me delete (GDPR)', async () => {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  process.env.JWT_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  process.env.JWT_PUBLIC_KEY = publicKey.export({ type: 'spki', format: 'pem' }).toString();
  process.env.JWT_PRIVATE_KEY_PATH = '';
  process.env.JWT_PUBLIC_KEY_PATH = '';
  process.env.JWT_ISSUER = 'test-issuer';
  process.env.JWT_AUDIENCE = 'test-audience';

  const { service, usersRepository } = createAuthService();

  const registered = await service.register({
    email: 'gdpr-delete@example.com',
    password: 'supersecret1',
    fullName: 'GDPR Delete',
  });

  const context = createUserContext(registered.user.id);
  const request = {
    headers: {
      authorization: `Bearer ${registered.token}`,
    },
  } as never;

  const deleted = await service.deleteCurrentUser(request, context);
  assert.equal(deleted.status, 'deleted');

  const userAfterDelete = await usersRepository.findById(registered.user.id);
  assert.equal(userAfterDelete, undefined);

  await assert.rejects(
    () => service.resolveAccessPrincipal(registered.token),
    /Invalid bearer token/u,
  );
});
